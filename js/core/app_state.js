import { cities } from "../../data/cities.js";
import { factions } from "../../data/factions.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";
import {
  COMMAND_RANK_KEYS,
  COMMAND_RANK_LABELS,
  COMMAND_RANK_LIMITS,
  GOVERNOR_POLICY_KEYS,
  LOYALTY_KEYS,
  RESOURCE_KEYS,
} from "../constants.js";
import { createInitialBattleState } from "./battle_state.js";
import { calculateRecruitmentRatioState } from "./domestic_effects.js";
import {
  applyPlayerTurnIncome,
  applyTaxLoyaltyEffect,
  applyTurnUpkeep,
  createInitialDomesticPolicy,
  createInitialEnemyResourceStock,
  createInitialResourceStock,
  normalizeChancellorHeroId,
  normalizeChancellorPolicy,
  normalizeTaxLevel,
} from "./domestic_income.js";
import {
  applyPlayerInterFactionTradeIncome,
  calculateInterFactionTradeResult,
  createInitialFactionRelations,
  decrementTradeCooldowns,
  normalizeCityTradeSettings,
  pauseFactionTrade,
  promoteFactionTrade,
  resumeFactionTrade,
  setFactionTradeSuspended,
} from "./inter_faction_trade.js";
import {
  applyInternalSupplyNetwork,
  applyInternalTroopRebalance,
  calculateGarrisonSurplusShortage,
  classifyCityMilitaryRole,
} from "./trade_supply.js";
import { createInitialCalendar, deriveCalendarFromTurn } from "./world_calendar.js";
import {
  ENEMY_INVASION_CHANCE,
  canAttackCity,
  convertCityHeroesToFaction,
  getFactionOwnedDestinationCities,
  getAttackSourceCity,
  getHeroIdsBySideAndLocation,
  getTransferableHeroesFromCity,
  initializeCityDomesticData,
  initializeHeroLocationsFromRosters,
  occupyCity,
  recruitCityHeroesToFaction,
  rollEnemyInvasion,
  transferHeroToCity,
} from "./world_rules.js";

const DEFAULT_SELECTED_CITY_ID = "hanseong";
const GOVERNOR_POLICY_VALUES = new Set(Object.values(GOVERNOR_POLICY_KEYS));
export const RECRUIT_TROOP_BATCH_SIZE = 500;
const RECRUITMENT_COST_UNIT_SIZE = 50;
const RECRUITMENT_BASE_COST = Object.freeze({
  [RESOURCE_KEYS.GOLD]: 30,
  [RESOURCE_KEYS.BARLEY]: 20,
  [RESOURCE_KEYS.RICE]: 15,
});
const initialHeroSnapshots = heroes.map((hero) => ({
  ...hero,
  chancellorProfile: hero.chancellorProfile ? { ...hero.chancellorProfile } : hero.chancellorProfile,
}));

function resetHeroesToInitialState() {
  for (const initialHero of initialHeroSnapshots) {
    const hero = heroes.find((entry) => entry.id === initialHero.id);

    if (hero) {
      if (!Object.prototype.hasOwnProperty.call(initialHero, "locationCityId")) {
        delete hero.locationCityId;
      }

      Object.assign(hero, {
        ...initialHero,
        chancellorProfile: initialHero.chancellorProfile
          ? { ...initialHero.chancellorProfile }
          : initialHero.chancellorProfile,
      });
    }
  }
}

function withCalendarMeta(meta) {
  const turn = meta?.turn ?? 1;

  return {
    ...meta,
    calendar: deriveCalendarFromTurn(turn),
  };
}

function hasPendingWorldInteraction(appState) {
  return Boolean(
    appState?.pendingBattleChoice
    || appState?.pendingHeroDeployment
    || appState?.pendingHeroTransfer
    || appState?.world?.pendingEnemyTurnResult
  );
}

function hasEnoughResources(resources = {}, cost = {}) {
  return Object.entries(cost).every(([resourceKey, amount]) => (
    (resources?.[resourceKey] ?? 0) >= amount
  ));
}

function subtractResourceCost(resources = {}, cost = {}) {
  const nextResources = { ...(resources ?? {}) };

  for (const [resourceKey, amount] of Object.entries(cost)) {
    nextResources[resourceKey] = Math.max(0, (nextResources[resourceKey] ?? 0) - amount);
  }

  return nextResources;
}

function withRecruitmentMessage(appState, message) {
  return {
    ...appState,
    ui: {
      ...(appState.ui ?? {}),
      saveMessage: message,
    },
  };
}

export function calculateRecruitmentCost(amount) {
  const recruitAmount = Math.max(0, Math.round(Number(amount) || 0));
  const costMultiplier = recruitAmount / RECRUITMENT_COST_UNIT_SIZE;

  return Object.fromEntries(
    Object.entries(RECRUITMENT_BASE_COST).map(([resourceKey, baseAmount]) => [
      resourceKey,
      Math.ceil(baseAmount * costMultiplier),
    ]),
  );
}

function normalizeCommandRank(commandRank) {
  return Object.values(COMMAND_RANK_KEYS).includes(commandRank)
    ? commandRank
    : COMMAND_RANK_KEYS.OFFICER;
}

function getHeroCommandRankForCity(hero, city) {
  return city?.governorHeroId === hero?.id
    ? COMMAND_RANK_KEYS.GOVERNOR
    : normalizeCommandRank(hero?.commandRank);
}

function getHeroCommandSummary(hero, city) {
  const commandRank = getHeroCommandRankForCity(hero, city);

  return {
    commandRank,
    commandLabel: COMMAND_RANK_LABELS[commandRank] ?? COMMAND_RANK_LABELS[COMMAND_RANK_KEYS.OFFICER],
    commandLimit: COMMAND_RANK_LIMITS[commandRank] ?? COMMAND_RANK_LIMITS[COMMAND_RANK_KEYS.OFFICER],
  };
}

function getCityGarrisonTroops(city) {
  return Math.max(0, Number(city?.military?.garrisonTroops) || 0);
}

function getWoundedQueue(city) {
  return Array.isArray(city?.military?.woundedQueue) ? city.military.woundedQueue : [];
}

function getWoundedTroopTotal(city) {
  return getWoundedQueue(city).reduce((total, entry) => total + Math.max(0, Number(entry?.troops) || 0), 0);
}

function buildDefaultTroopAllocations(candidates = [], availableGarrison = 0) {
  const activeCandidates = (candidates ?? []).filter((hero) => (hero?.commandLimit ?? 0) > 0);
  const totalCommandLimit = activeCandidates.reduce((total, hero) => total + (hero.commandLimit ?? 0), 0);
  let remainingGarrison = Math.min(Math.max(0, Number(availableGarrison) || 0), totalCommandLimit);
  const allocations = {};

  for (const hero of candidates ?? []) {
    allocations[hero.id] = 0;
  }

  while (remainingGarrison > 0) {
    const openCandidates = activeCandidates.filter((hero) => allocations[hero.id] < hero.commandLimit);

    if (openCandidates.length === 0) {
      break;
    }

    const share = Math.max(1, Math.ceil(remainingGarrison / openCandidates.length));
    let assignedThisPass = 0;

    for (const hero of openCandidates) {
      const room = Math.max(0, hero.commandLimit - allocations[hero.id]);
      const allocation = Math.min(room, share, remainingGarrison);

      allocations[hero.id] += allocation;
      assignedThisPass += allocation;
      remainingGarrison -= allocation;

      if (remainingGarrison <= 0) {
        break;
      }
    }

    if (assignedThisPass <= 0) {
      break;
    }
  }

  return allocations;
}

function buildSequentialTroopAllocations(candidates = [], availableGarrison = 0) {
  let remainingGarrison = Math.max(0, Number(availableGarrison) || 0);
  const allocations = {};

  for (const hero of candidates ?? []) {
    const allocation = Math.min(hero?.commandLimit ?? 0, remainingGarrison);
    allocations[hero.id] = allocation;
    remainingGarrison -= allocation;
  }

  return allocations;
}

function getSelectedAllocationTotal(pendingHeroDeployment) {
  const selectedHeroIds = new Set(pendingHeroDeployment?.selectedHeroIds ?? []);
  const allocations = pendingHeroDeployment?.troopAllocations ?? {};

  return Object.entries(allocations)
    .filter(([heroId]) => selectedHeroIds.has(heroId))
    .reduce((total, [, amount]) => total + Math.max(0, Number(amount) || 0), 0);
}

function clampDeploymentAllocations(pendingHeroDeployment) {
  if (!pendingHeroDeployment) {
    return pendingHeroDeployment;
  }

  const selectedHeroIds = new Set(pendingHeroDeployment.selectedHeroIds ?? []);
  const allocations = {};
  let remainingGarrison = Math.max(0, Number(pendingHeroDeployment.sourceGarrisonTroops) || 0);

  for (const hero of pendingHeroDeployment.candidates ?? []) {
    if (!selectedHeroIds.has(hero.id)) {
      allocations[hero.id] = 0;
      continue;
    }

    const requestedAmount = Math.max(0, Number(pendingHeroDeployment.troopAllocations?.[hero.id]) || 0);
    const allocation = Math.min(requestedAmount, hero.commandLimit ?? 0, remainingGarrison);
    allocations[hero.id] = allocation;
    remainingGarrison -= allocation;
  }

  return {
    ...pendingHeroDeployment,
    troopAllocations: allocations,
    totalAllocatedTroops: Object.values(allocations).reduce((total, amount) => total + amount, 0),
    remainingGarrisonTroops: remainingGarrison,
  };
}

function addWoundedToCity(city, troops, turnsLeft = 3) {
  const woundedTroops = Math.max(0, Math.floor(Number(troops) || 0));

  if (woundedTroops <= 0) {
    return city;
  }

  return {
    ...city,
    military: {
      ...(city.military ?? {}),
      woundedQueue: [
        ...getWoundedQueue(city),
        {
          turnsLeft,
          troops: woundedTroops,
        },
      ],
    },
  };
}

function updateCityMilitary(cities, cityId, updater) {
  return (cities ?? []).map((city) => (
    city.id === cityId
      ? {
        ...city,
        military: updater(city.military ?? {}, city),
      }
      : city
  ));
}

function findNearestPlayerOwnedNeighbor(cities = [], cityId, playerFactionId = "player") {
  const city = cities.find((entry) => entry.id === cityId) ?? null;

  if (!city) {
    return null;
  }

  return (city.neighbors ?? [])
    .map((neighborId) => cities.find((entry) => entry.id === neighborId))
    .find((neighbor) => neighbor?.ownerFactionId === playerFactionId) ?? null;
}

export function calculateBattleUnitSurvivors(unit) {
  const initialAllocatedTroops = Math.max(0, Number(unit?.initialAllocatedTroops ?? unit?.allocatedTroops) || 0);

  if (initialAllocatedTroops <= 0 || unit?.isAlive === false || (Number(unit?.hp) || 0) <= 0) {
    return 0;
  }

  const maxHp = Math.max(1, Number(unit?.maxHp) || 1);
  const survivalRatio = Math.max(0, Math.min(1, (Number(unit?.hp) || 0) / maxHp));
  return Math.floor(initialAllocatedTroops * survivalRatio);
}

export function calculateBattleTroopOutcome(battle, didPlayerWin) {
  const allocation = battle?.troopAllocation ?? null;
  const allocated = Math.max(0, Number(allocation?.totalAllocatedTroops) || 0);
  const allocatedHeroIds = new Set(Object.keys(allocation?.allocations ?? {}));
  const playerUnits = (battle?.units ?? []).filter((unit) => (
    unit.side === "player"
    && allocatedHeroIds.has(unit.heroId)
  ));
  const rawSurvivors = playerUnits.reduce((total, unit) => total + calculateBattleUnitSurvivors(unit), 0);
  const survivors = didPlayerWin ? Math.min(allocated, rawSurvivors) : 0;
  const losses = didPlayerWin ? Math.max(0, allocated - survivors) : allocated;
  const wounded = didPlayerWin
    ? Math.floor(losses * 0.30)
    : Math.floor(allocated * 0.50);
  const dead = Math.max(0, allocated - survivors - wounded);

  return {
    sourceCityId: allocation?.sourceCityId ?? null,
    battleType: allocation?.battleType ?? battle?.battleContext?.type ?? "attack",
    allocated,
    survivors,
    losses,
    wounded,
    dead,
    allocations: allocation?.allocations ?? {},
  };
}

function calculateEnemyBattleTroopOutcome(battle, didEnemyWin) {
  const allocation = battle?.troopAllocation ?? null;
  const allocated = Math.max(0, Number(allocation?.enemyTotalAllocatedTroops) || 0);
  const allocatedHeroIds = new Set(Object.keys(allocation?.enemyAllocations ?? {}));
  const enemyUnits = (battle?.units ?? []).filter((unit) => (
    unit.side === "enemy"
    && allocatedHeroIds.has(unit.heroId)
  ));
  const rawSurvivors = enemyUnits.reduce((total, unit) => total + calculateBattleUnitSurvivors(unit), 0);
  const survivors = didEnemyWin ? Math.min(allocated, rawSurvivors) : 0;
  const losses = didEnemyWin ? Math.max(0, allocated - survivors) : allocated;
  const wounded = didEnemyWin
    ? Math.floor(losses * 0.30)
    : Math.floor(allocated * 0.50);
  const dead = Math.max(0, allocated - survivors - wounded);

  return {
    sourceCityId: allocation?.enemySourceCityId ?? null,
    battleType: allocation?.battleType ?? battle?.battleContext?.type ?? "attack",
    allocated,
    survivors,
    losses,
    wounded,
    dead,
    allocations: allocation?.enemyAllocations ?? {},
  };
}

export function createInitialAppState() {
  resetHeroesToInitialState();
  initializeHeroLocationsFromRosters();

  return {
    meta: withCalendarMeta({
      title: "SamWar Web",
      phase: "World",
      status: "",
      playerFactionId: "player",
      turn: 1,
      calendar: createInitialCalendar(),
      [LOYALTY_KEYS.NATIONAL]: 75,
    }),
    mode: "world",
    selection: {
      cityId: DEFAULT_SELECTED_CITY_ID,
      originCityId: DEFAULT_SELECTED_CITY_ID,
    },
    battle: null,
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    pendingHeroTransfer: null,
    ui: {
      saveMessage: "",
      tradeControlCityId: null,
      selectedCityDetailTab: "resources",
      isCityDetailOpen: true,
    },
    ruler: {
      currentCityId: DEFAULT_SELECTED_CITY_ID,
    },
    domesticPolicy: createInitialDomesticPolicy(),
    resources: createInitialResourceStock(),
    enemyResources: createInitialEnemyResourceStock(),
    factionRelations: createInitialFactionRelations(factions),
    world: {
      cities: initializeCityDomesticData(cities),
      factions,
      heroes,
      skills,
      turnOwner: "player",
      pendingEnemyTurnResult: null,
      lastRecruitmentAction: null,
      lastRecruitmentResult: null,
      lastCityLoyaltyResult: null,
      lastBattleTroopResult: null,
      lastWoundedRecoveryResult: null,
      lastSupplyNetworkResult: null,
      lastTroopRebalanceResult: null,
      lastInterFactionTradeResult: null,
    },
  };
}

export function setTaxLevel(appState, taxLevel) {
  return {
    ...appState,
    domesticPolicy: {
      ...(appState.domesticPolicy ?? {}),
      taxLevel: normalizeTaxLevel(taxLevel),
    },
  };
}

export function setChancellorPolicy(appState, chancellorPolicy) {
  return {
    ...appState,
    domesticPolicy: {
      ...(appState.domesticPolicy ?? {}),
      chancellorPolicy: normalizeChancellorPolicy(chancellorPolicy),
    },
  };
}

export function setChancellorHeroId(appState, chancellorHeroId) {
  return {
    ...appState,
    domesticPolicy: {
      ...(appState.domesticPolicy ?? {}),
      chancellorHeroId: normalizeChancellorHeroId(
        chancellorHeroId,
        appState?.world?.heroes,
        appState?.meta?.playerFactionId,
      ),
    },
  };
}

export function setCityGovernorHeroId(appState, cityId, governorHeroId) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const normalizedGovernorHeroId = governorHeroId || null;
  const city = appState?.world?.cities.find((entry) => entry.id === cityId) ?? null;

  if (!city || city.ownerFactionId !== playerFactionId) {
    return appState;
  }

  if (normalizedGovernorHeroId) {
    const candidate = appState.world.heroes.find((hero) => hero.id === normalizedGovernorHeroId) ?? null;

    if (
      !candidate
      || candidate.side !== playerFactionId
      || candidate.locationCityId !== city.id
    ) {
      return appState;
    }
  }

  return {
    ...appState,
    world: {
      ...appState.world,
      cities: appState.world.cities.map((entry) => (
        entry.id === city.id
          ? { ...entry, governorHeroId: normalizedGovernorHeroId }
          : entry
      )),
    },
  };
}

export function setCityGovernorPolicy(appState, cityId, governorPolicy) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const city = appState?.world?.cities.find((entry) => entry.id === cityId) ?? null;
  const normalizedGovernorPolicy = GOVERNOR_POLICY_VALUES.has(governorPolicy)
    ? governorPolicy
    : GOVERNOR_POLICY_KEYS.FOLLOW_CHANCELLOR;

  if (!city || city.ownerFactionId !== playerFactionId) {
    return appState;
  }

  return {
    ...appState,
    world: {
      ...appState.world,
      cities: appState.world.cities.map((entry) => (
        entry.id === city.id
          ? { ...entry, governorPolicy: normalizedGovernorPolicy }
          : entry
      )),
    },
  };
}

export function setTradeRelationAction(appState, action, factionA, factionB) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";

  if (
    appState?.mode !== "world"
    || appState?.battle
    || appState?.pendingBattleChoice
    || appState?.pendingHeroDeployment
    || appState?.pendingHeroTransfer
    || appState?.world?.pendingEnemyTurnResult
    || ![factionA, factionB].includes(playerFactionId)
  ) {
    return appState;
  }

  switch (action) {
    case "promote":
      return withUpdatedInterFactionTradeResult(promoteFactionTrade(appState, factionA, factionB));
    case "pause":
      return withUpdatedInterFactionTradeResult(pauseFactionTrade(appState, factionA, factionB));
    case "resume":
      return withUpdatedInterFactionTradeResult(resumeFactionTrade(appState, factionA, factionB));
    default:
      return appState;
  }
}

export function openTradeControl(appState, cityId) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const city = appState?.world?.cities?.find((entry) => entry.id === cityId) ?? null;

  if (
    appState?.mode !== "world"
    || appState?.battle
    || appState?.pendingBattleChoice
    || appState?.pendingHeroDeployment
    || appState?.pendingHeroTransfer
    || appState?.world?.pendingEnemyTurnResult
    || !city
    || city.ownerFactionId !== playerFactionId
  ) {
    return appState;
  }

  return {
    ...appState,
    ui: {
      ...(appState.ui ?? {}),
      tradeControlCityId: city.id,
    },
  };
}

export function closeTradeControl(appState) {
  return {
    ...appState,
    ui: {
      ...(appState.ui ?? {}),
      tradeControlCityId: null,
    },
  };
}


const CITY_DETAIL_TAB_KEYS = Object.freeze(["resources", "internal-trade", "external-trade"]);

export function setSelectedCityDetailTab(appState, tab) {
  const selectedCityDetailTab = CITY_DETAIL_TAB_KEYS.includes(tab) ? tab : "resources";

  return {
    ...appState,
    ui: {
      ...(appState.ui ?? {}),
      selectedCityDetailTab,
    },
  };
}

export function setCityDetailOpen(appState, isOpen) {
  return {
    ...appState,
    ui: {
      ...(appState.ui ?? {}),
      isCityDetailOpen: Boolean(isOpen),
    },
  };
}

export function setCityTradeSettings(appState, cityId, tradeSettings) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const city = appState?.world?.cities?.find((entry) => entry.id === cityId) ?? null;

  if (
    appState?.mode !== "world"
    || appState?.battle
    || appState?.pendingBattleChoice
    || appState?.pendingHeroDeployment
    || appState?.pendingHeroTransfer
    || appState?.world?.pendingEnemyTurnResult
    || !city
    || city.ownerFactionId !== playerFactionId
  ) {
    return appState;
  }

  const nextState = {
    ...appState,
    ui: {
      ...(appState.ui ?? {}),
      tradeControlCityId: null,
    },
    world: {
      ...appState.world,
      cities: appState.world.cities.map((entry) => (
        entry.id === city.id
          ? {
            ...entry,
            tradeSettings: normalizeCityTradeSettings(tradeSettings),
          }
          : entry
      )),
    },
  };

  return withUpdatedInterFactionTradeResult(nextState);
}

function withUpdatedInterFactionTradeResult(appState) {
  return {
    ...appState,
    world: {
      ...appState.world,
      lastInterFactionTradeResult: calculateInterFactionTradeResult(appState),
    },
  };
}

export function recruitCityTroops(appState, cityId, amount = RECRUIT_TROOP_BATCH_SIZE) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const city = appState?.world?.cities.find((entry) => entry.id === cityId) ?? null;

  if (
    appState?.mode !== "world"
    || appState?.battle
    || appState?.world?.turnOwner !== "player"
    || hasPendingWorldInteraction(appState)
  ) {
    return withRecruitmentMessage(appState, "지금은 모집할 수 없습니다.");
  }

  if (!city || city.ownerFactionId !== playerFactionId) {
    return withRecruitmentMessage(appState, "아군 도시에서만 모집할 수 있습니다.");
  }

  const requestedAmount = Math.max(0, Math.round(Number(amount) || 0));
  const beforeRecruitableTroops = Math.max(0, Number(city?.military?.recruitableTroops) || 0);
  const recruitmentCapacity = calculateRecruitmentRatioState(city);
  const cityRole = classifyCityMilitaryRole(city, appState?.world?.cities ?? []);
  const garrisonNeed = calculateGarrisonSurplusShortage(city, cityRole);

  if (garrisonNeed.currentGarrison >= garrisonNeed.targetGarrison) {
    return withRecruitmentMessage(appState, "목표 주둔군 충족");
  }

  const recruitAmount = Math.min(requestedAmount, recruitmentCapacity.remainingRecruitCapacity);

  if (recruitAmount <= 0) {
    return withRecruitmentMessage(appState, "모집 한계");
  }

  const cost = calculateRecruitmentCost(recruitAmount);

  if (!hasEnoughResources(appState.resources, cost)) {
    return withRecruitmentMessage(appState, "자원 부족");
  }

  const beforeGarrisonTroops = Math.max(0, Number(city?.military?.garrisonTroops) || 0);
  const afterGarrisonTroops = beforeGarrisonTroops + recruitAmount;
  const afterRecruitableTroops = Math.max(0, beforeRecruitableTroops - recruitAmount);
  const nextCities = appState.world.cities.map((entry) => (
    entry.id === city.id
      ? {
        ...entry,
        military: {
          ...(entry.military ?? {}),
          garrisonTroops: afterGarrisonTroops,
          recruitableTroops: afterRecruitableTroops,
        },
      }
      : entry
  ));
  const lastRecruitmentAction = {
    turn: appState?.meta?.turn ?? 1,
    cityId: city.id,
    cityName: city.name,
    recruitAmount,
    cost,
    beforeGarrisonTroops,
    afterGarrisonTroops,
    beforeRecruitableTroops,
    afterRecruitableTroops,
    population: recruitmentCapacity.population,
    maxTroopRatio: recruitmentCapacity.maxTroopRatio,
    beforeRecruitmentRatio: recruitmentCapacity.recruitmentRatio,
    afterRecruitmentRatio: afterGarrisonTroops / recruitmentCapacity.population,
    maxTroopsByPopulation: recruitmentCapacity.maxTroopsByPopulation,
  };

  return withRecruitmentMessage({
    ...appState,
    resources: subtractResourceCost(appState.resources, cost),
    world: {
      ...appState.world,
      cities: nextCities,
      lastRecruitmentAction,
      lastRecruitmentResult: lastRecruitmentAction,
    },
  }, `${city.name} 병사 ${recruitAmount}명 모집 완료`);
}

export function selectCity(appState, cityId) {
  const selectedCity = appState.world.cities.find((city) => city.id === cityId) ?? null;
  const originCityId = selectedCity?.ownerFactionId === appState.meta.playerFactionId
    ? cityId
    : appState.selection.originCityId;

  return {
    ...appState,
    selection: {
      ...appState.selection,
      cityId,
      originCityId,
    },
    pendingBattleChoice: appState.pendingBattleChoice?.type === "attack"
      ? null
      : appState.pendingBattleChoice,
    pendingHeroDeployment: null,
    pendingHeroTransfer: null,
  };
}

function advanceWorldTurn(appState, overrides = {}) {
  const nextTurn = appState.meta.turn + 1;

  return {
    ...appState,
    meta: withCalendarMeta({
      ...appState.meta,
      turn: nextTurn,
    }),
    world: {
      ...appState.world,
      turnOwner: "player",
      pendingEnemyTurnResult: null,
    },
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    pendingHeroTransfer: null,
    ...overrides,
  };
}

function getSkillName(skillId) {
  return skills.find((skill) => skill.id === skillId)?.name ?? null;
}

function getPlayerDeploymentCandidateIds(originCityId) {
  return getHeroIdsBySideAndLocation(originCityId, "player");
}

function toTransferHeroSummary(hero) {
  return {
    id: hero.id,
    name: hero.name,
    role: hero.role,
    troops: hero.troops,
    maxTroops: hero.maxTroops,
    attack: hero.attack,
    defense: hero.defense,
    intelligence: hero.intelligence,
    portraitImage: hero.portraitImage ?? null,
    skillName: getSkillName(hero.skillId),
  };
}

function toDeploymentHeroSummary(hero, sourceCity) {
  const command = getHeroCommandSummary(hero, sourceCity);

  return {
    id: hero.id,
    name: hero.name,
    role: hero.role,
    troops: hero.troops,
    maxTroops: hero.maxTroops,
    attack: hero.attack,
    defense: hero.defense,
    intelligence: hero.intelligence,
    commandRank: command.commandRank,
    commandLabel: command.commandLabel,
    commandLimit: command.commandLimit,
    portraitImage: hero.portraitImage ?? null,
    skillName: getSkillName(hero.skillId),
  };
}

function toDestinationCitySummary(city) {
  return {
    id: city.id,
    name: city.name,
    region: city.region,
  };
}

function buildHeroTransfer(appState, sourceCityId) {
  const sourceCity = appState.world.cities.find((city) => city.id === sourceCityId) ?? null;

  if (!sourceCity || sourceCity.ownerFactionId !== appState.meta.playerFactionId) {
    return null;
  }

  return {
    sourceCityId: sourceCity.id,
    sourceCityName: sourceCity.name,
    heroes: getTransferableHeroesFromCity(sourceCity.id, appState.meta.playerFactionId)
      .map(toTransferHeroSummary),
    destinationCities: getFactionOwnedDestinationCities(
      appState.world.cities,
      appState.meta.playerFactionId,
      sourceCity.id,
    ).map(toDestinationCitySummary),
    selectedHeroId: null,
    selectedTargetCityId: null,
  };
}

function buildHeroDeployment(appState, cityId) {
  const pendingBattleChoice = buildAttackBattleChoice(appState, cityId);

  if (!pendingBattleChoice) {
    return null;
  }

  const sourceCity = appState.world.cities.find((city) => city.id === pendingBattleChoice.originCityId) ?? null;
  const sourceGarrisonTroops = getCityGarrisonTroops(sourceCity);
  const candidates = getPlayerDeploymentCandidateIds(pendingBattleChoice.originCityId)
    .map((heroId) => heroes.find((hero) => hero.id === heroId))
    .filter(Boolean)
    .map((hero) => toDeploymentHeroSummary(hero, sourceCity));
  const troopAllocations = buildDefaultTroopAllocations(candidates, sourceGarrisonTroops);
  const totalAllocatedTroops = Object.values(troopAllocations).reduce((total, amount) => total + amount, 0);

  return {
    type: "attack",
    sourceCityId: pendingBattleChoice.originCityId,
    originCityId: pendingBattleChoice.originCityId,
    originCityName: pendingBattleChoice.originCityName,
    targetCityId: pendingBattleChoice.targetCityId,
    targetCityName: pendingBattleChoice.targetCityName,
    battleContext: pendingBattleChoice.battleContext,
    autoBattleEnabled: false,
    sourceGarrisonTroops,
    candidates,
    selectedHeroIds: candidates.map((hero) => hero.id),
    troopAllocations,
    totalAllocatedTroops,
    remainingGarrisonTroops: Math.max(0, sourceGarrisonTroops - totalAllocatedTroops),
  };
}

function buildDefenseHeroDeployment(appState, pendingBattleChoice) {
  const defenderCity = appState.world.cities.find((city) => city.id === pendingBattleChoice?.targetCityId) ?? null;

  if (!defenderCity || defenderCity.ownerFactionId !== appState.meta.playerFactionId) {
    return null;
  }

  const sourceGarrisonTroops = getCityGarrisonTroops(defenderCity);
  const candidates = getHeroIdsBySideAndLocation(defenderCity.id, appState.meta.playerFactionId)
    .map((heroId) => heroes.find((hero) => hero.id === heroId))
    .filter(Boolean)
    .map((hero) => toDeploymentHeroSummary(hero, defenderCity));
  const troopAllocations = buildDefaultTroopAllocations(candidates, sourceGarrisonTroops);
  const totalAllocatedTroops = Object.values(troopAllocations).reduce((total, amount) => total + amount, 0);

  return {
    type: "defense",
    sourceCityId: defenderCity.id,
    originCityId: pendingBattleChoice.originCityId,
    originCityName: pendingBattleChoice.originCityName,
    targetCityId: pendingBattleChoice.targetCityId,
    targetCityName: pendingBattleChoice.targetCityName,
    battleContext: pendingBattleChoice.battleContext,
    autoBattleEnabled: false,
    sourceGarrisonTroops,
    candidates,
    selectedHeroIds: candidates.map((hero) => hero.id),
    troopAllocations,
    totalAllocatedTroops,
    remainingGarrisonTroops: Math.max(0, sourceGarrisonTroops - totalAllocatedTroops),
  };
}

function buildAttackBattleChoice(appState, cityId) {
  const defenderCity = appState.world.cities.find((city) => city.id === cityId);
  const selectedOriginCity = appState.world.cities.find((city) => (
    city.id === appState.selection.originCityId
    && city.ownerFactionId === appState.meta.playerFactionId
    && defenderCity?.neighbors.includes(city.id)
  )) ?? null;
  const attackerCity = selectedOriginCity ?? getAttackSourceCity(appState.world.cities, cityId);

  if (!defenderCity || !attackerCity || !canAttackCity(appState.world.cities, defenderCity)) {
    return null;
  }

  return {
    type: "attack",
    originCityId: attackerCity.id,
    originCityName: attackerCity.name,
    targetCityId: defenderCity.id,
    targetCityName: defenderCity.name,
    title: "전투 방식을 선택하세요",
    eyebrow: "Battle Mode",
    description: "공격 방식을 선택하세요.",
    confirmManualLabel: "직접 지휘",
    confirmAutoLabel: "자동 위임",
    showCancel: true,
    isRemoteBattle: attackerCity.id !== DEFAULT_SELECTED_CITY_ID,
    battleContext: {
      type: "attack",
      attackerCityId: attackerCity.id,
      defenderCityId: defenderCity.id,
    },
  };
}

function buildDefenseBattleChoice(appState, invasionCandidate) {
  const attackerCity = appState.world.cities.find((city) => city.id === invasionCandidate?.attackerCityId);
  const defenderCity = appState.world.cities.find((city) => city.id === invasionCandidate?.defenderCityId);

  if (!attackerCity || !defenderCity) {
    return null;
  }

  return {
    type: "defense",
    originCityId: attackerCity.id,
    originCityName: attackerCity.name,
    targetCityId: defenderCity.id,
    targetCityName: defenderCity.name,
    title: "적군이 침공했습니다!",
    eyebrow: "Enemy Invasion",
    description: "방어 방식을 선택하세요.",
    confirmManualLabel: "직접 방어",
    confirmAutoLabel: "자동 방어",
    showCancel: false,
    isRemoteBattle: false,
    battleContext: {
      type: "defense",
      attackerCityId: attackerCity.id,
      defenderCityId: defenderCity.id,
    },
  };
}

export function openBattleChoice(appState, cityId) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "player"
    || appState.world.pendingEnemyTurnResult
  ) {
    return appState;
  }

  const pendingBattleChoice = buildAttackBattleChoice(appState, cityId);

  if (!pendingBattleChoice) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice,
  };
}

export function openHeroDeployment(appState, cityId) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "player"
    || appState.world.pendingEnemyTurnResult
    || appState.pendingHeroTransfer
  ) {
    return appState;
  }

  const pendingHeroDeployment = buildHeroDeployment(appState, cityId);

  if (!pendingHeroDeployment) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice: null,
    pendingHeroDeployment,
  };
}

export function openDefenseHeroDeployment(appState) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "enemy"
    || appState.pendingBattleChoice?.type !== "defense"
    || appState.pendingHeroTransfer
  ) {
    return appState;
  }

  const pendingHeroDeployment = buildDefenseHeroDeployment(appState, appState.pendingBattleChoice);

  if (!pendingHeroDeployment) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice: null,
    pendingHeroDeployment,
  };
}

export function openHeroTransfer(appState, sourceCityId) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "player"
    || appState.pendingBattleChoice
    || appState.pendingHeroDeployment
    || appState.world.pendingEnemyTurnResult
  ) {
    return appState;
  }

  const pendingHeroTransfer = buildHeroTransfer(appState, sourceCityId);

  if (!pendingHeroTransfer) {
    return appState;
  }

  return {
    ...appState,
    pendingHeroTransfer,
  };
}

export function cancelBattleChoice(appState) {
  if (!appState.pendingBattleChoice || !appState.pendingBattleChoice.showCancel) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice: null,
  };
}

export function cancelHeroDeployment(appState) {
  if (!appState.pendingHeroDeployment) {
    return appState;
  }

  return {
    ...appState,
    pendingHeroDeployment: null,
  };
}

export function cancelHeroTransfer(appState) {
  if (!appState.pendingHeroTransfer) {
    return appState;
  }

  return {
    ...appState,
    pendingHeroTransfer: null,
  };
}

export function selectHeroTransferHero(appState, heroId) {
  const pendingHeroTransfer = appState.pendingHeroTransfer;

  if (!pendingHeroTransfer || !pendingHeroTransfer.heroes.some((hero) => hero.id === heroId)) {
    return appState;
  }

  return {
    ...appState,
    pendingHeroTransfer: {
      ...pendingHeroTransfer,
      selectedHeroId: heroId,
    },
  };
}

export function selectHeroTransferTargetCity(appState, targetCityId) {
  const pendingHeroTransfer = appState.pendingHeroTransfer;

  if (!pendingHeroTransfer || !pendingHeroTransfer.destinationCities.some((city) => city.id === targetCityId)) {
    return appState;
  }

  return {
    ...appState,
    pendingHeroTransfer: {
      ...pendingHeroTransfer,
      selectedTargetCityId: targetCityId,
    },
  };
}

export function confirmHeroTransfer(appState, heroId = null, targetCityId = null) {
  const pendingHeroTransfer = appState.pendingHeroTransfer;
  const selectedHeroId = heroId ?? pendingHeroTransfer?.selectedHeroId;
  const selectedTargetCityId = targetCityId ?? pendingHeroTransfer?.selectedTargetCityId;

  if (!pendingHeroTransfer || !selectedHeroId || !selectedTargetCityId) {
    return appState;
  }

  const result = transferHeroToCity(
    selectedHeroId,
    selectedTargetCityId,
    appState.world.cities,
    appState.meta.playerFactionId,
  );

  if (!result.ok) {
    return appState;
  }

  return {
    ...appState,
    pendingHeroTransfer: null,
  };
}

export function toggleDeploymentHero(appState, heroId) {
  const pendingHeroDeployment = appState.pendingHeroDeployment;

  if (!pendingHeroDeployment || !pendingHeroDeployment.candidates.some((hero) => hero.id === heroId)) {
    return appState;
  }

  const selectedHeroSet = new Set(pendingHeroDeployment.selectedHeroIds);
  let nextTroopAllocations = pendingHeroDeployment.troopAllocations ?? {};

  if (selectedHeroSet.has(heroId)) {
    selectedHeroSet.delete(heroId);
  } else {
    selectedHeroSet.add(heroId);
    const hero = pendingHeroDeployment.candidates.find((candidate) => candidate.id === heroId);
    const currentTotal = getSelectedAllocationTotal(pendingHeroDeployment);
    const remainingGarrison = Math.max(0, (pendingHeroDeployment.sourceGarrisonTroops ?? 0) - currentTotal);
    nextTroopAllocations = {
      ...nextTroopAllocations,
      [heroId]: Math.min(hero?.commandLimit ?? 0, remainingGarrison),
    };
  }

  const nextDeployment = clampDeploymentAllocations({
    ...pendingHeroDeployment,
    selectedHeroIds: [...selectedHeroSet],
    troopAllocations: nextTroopAllocations,
  });

  return {
    ...appState,
    pendingHeroDeployment: nextDeployment,
  };
}

export function setDeploymentHeroTroops(appState, heroId, amount) {
  const pendingHeroDeployment = appState.pendingHeroDeployment;

  if (!pendingHeroDeployment || !pendingHeroDeployment.candidates.some((hero) => hero.id === heroId)) {
    return appState;
  }

  const nextDeployment = clampDeploymentAllocations({
    ...pendingHeroDeployment,
    troopAllocations: {
      ...(pendingHeroDeployment.troopAllocations ?? {}),
      [heroId]: Math.max(0, Math.round(Number(amount) || 0)),
    },
  });

  return {
    ...appState,
    pendingHeroDeployment: nextDeployment,
  };
}

function buildDefaultDefenseDeployment(appState, defenderCity) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const candidates = getHeroIdsBySideAndLocation(defenderCity?.id, playerFactionId)
    .map((heroId) => heroes.find((hero) => hero.id === heroId))
    .filter(Boolean)
    .map((hero) => toDeploymentHeroSummary(hero, defenderCity));
  const sourceGarrisonTroops = getCityGarrisonTroops(defenderCity);
  const troopAllocations = buildDefaultTroopAllocations(candidates, sourceGarrisonTroops);
  const selectedHeroIds = candidates
    .filter((hero) => (troopAllocations[hero.id] ?? 0) > 0)
    .map((hero) => hero.id);
  const totalAllocatedTroops = selectedHeroIds.reduce((total, heroId) => total + (troopAllocations[heroId] ?? 0), 0);

  return {
    type: "defense",
    sourceCityId: defenderCity?.id ?? null,
    sourceGarrisonTroops,
    candidates,
    selectedHeroIds,
    troopAllocations,
    totalAllocatedTroops,
  };
}

function buildAutomaticFactionAllocation(appState, sourceCity, factionId) {
  const candidates = getHeroIdsBySideAndLocation(sourceCity?.id, factionId)
    .map((heroId) => heroes.find((hero) => hero.id === heroId))
    .filter(Boolean)
    .map((hero) => toDeploymentHeroSummary(hero, sourceCity));
  const allocations = buildDefaultTroopAllocations(candidates, getCityGarrisonTroops(sourceCity));
  const totalAllocatedTroops = Object.values(allocations).reduce((total, amount) => total + amount, 0);

  return {
    sourceCityId: sourceCity?.id ?? null,
    allocations,
    totalAllocatedTroops,
  };
}

function buildTroopAllocationForBattle(pendingHeroDeployment, battleContext) {
  const selectedHeroIds = new Set(pendingHeroDeployment?.selectedHeroIds ?? []);
  const allocations = {};

  for (const hero of pendingHeroDeployment?.candidates ?? []) {
    if (!selectedHeroIds.has(hero.id)) {
      continue;
    }

    const allocation = Math.min(
      Math.max(0, Number(pendingHeroDeployment?.troopAllocations?.[hero.id]) || 0),
      hero.commandLimit ?? 0,
    );

    if (allocation > 0) {
      allocations[hero.id] = allocation;
    }
  }

  const totalAllocatedTroops = Object.values(allocations).reduce((total, amount) => total + amount, 0);

  return {
    sourceCityId: pendingHeroDeployment?.sourceCityId ?? pendingHeroDeployment?.originCityId ?? null,
    battleType: battleContext?.type ?? pendingHeroDeployment?.type ?? "attack",
    allocations,
    unitAllocations: { ...allocations },
    totalAllocatedTroops,
  };
}

export function startBattle(appState, cityId, options = {}) {
  const pendingHeroDeployment = appState.pendingHeroDeployment?.targetCityId === cityId
    ? appState.pendingHeroDeployment
    : null;
  const pendingBattleChoice = pendingHeroDeployment
    ?? (appState.pendingBattleChoice?.targetCityId === cityId
      ? appState.pendingBattleChoice
      : buildAttackBattleChoice(appState, cityId));
  const defenderCity = appState.world.cities.find((city) => city.id === pendingBattleChoice?.targetCityId);
  const attackerCity = appState.world.cities.find((city) => city.id === pendingBattleChoice?.originCityId);

  if (!pendingBattleChoice || !defenderCity || !attackerCity) {
    return appState;
  }

  const battleContext = {
    ...pendingBattleChoice.battleContext,
    controlMode: (options.autoBattleEnabled ?? pendingHeroDeployment?.autoBattleEnabled) === true ? "auto" : "manual",
  };
  const selectedAttackerHeroIds = Array.isArray(options.attackerHeroIds)
    ? options.attackerHeroIds
    : pendingHeroDeployment?.selectedHeroIds;
  const deploymentForBattle = pendingHeroDeployment
    ?? (battleContext.type === "defense" ? buildDefaultDefenseDeployment(appState, defenderCity) : null);
  const troopAllocation = buildTroopAllocationForBattle(deploymentForBattle, battleContext);
  const enemySourceCity = battleContext.type === "defense" ? attackerCity : defenderCity;
  const enemyFactionId = enemySourceCity?.ownerFactionId ?? "enemy";
  const enemyTroopAllocation = buildAutomaticFactionAllocation(appState, enemySourceCity, enemyFactionId);

  if (troopAllocation.totalAllocatedTroops <= 0) {
    return withRecruitmentMessage(appState, "배정 병력이 없습니다.");
  }

  const sourceCity = appState.world.cities.find((city) => city.id === troopAllocation.sourceCityId) ?? null;

  if (!sourceCity || getCityGarrisonTroops(sourceCity) < troopAllocation.totalAllocatedTroops) {
    return withRecruitmentMessage(appState, "주둔군이 부족합니다.");
  }

  let nextCities = updateCityMilitary(appState.world.cities, sourceCity.id, (military) => ({
    ...military,
    garrisonTroops: Math.max(0, (Number(military.garrisonTroops) || 0) - troopAllocation.totalAllocatedTroops),
  }));
  if (
    enemyTroopAllocation.sourceCityId
    && enemyTroopAllocation.totalAllocatedTroops > 0
    && enemyTroopAllocation.sourceCityId !== sourceCity.id
  ) {
    nextCities = updateCityMilitary(nextCities, enemyTroopAllocation.sourceCityId, (military) => ({
      ...military,
      garrisonTroops: Math.max(0, (Number(military.garrisonTroops) || 0) - enemyTroopAllocation.totalAllocatedTroops),
    }));
  }
  const battleTroopAllocation = {
    ...troopAllocation,
    enemySourceCityId: enemyTroopAllocation.sourceCityId,
    enemyAllocations: enemyTroopAllocation.allocations,
    enemyTotalAllocatedTroops: enemyTroopAllocation.totalAllocatedTroops,
    unitAllocations: {
      ...(troopAllocation.unitAllocations ?? troopAllocation.allocations ?? {}),
      ...(enemyTroopAllocation.allocations ?? {}),
    },
  };

  const battleState = {
    ...appState,
    mode: "battle",
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    pendingHeroTransfer: null,
    selection: {
      ...appState.selection,
      cityId: defenderCity.id,
    },
    battle: createInitialBattleState({
      attackerCity,
      defenderCity,
      autoBattleEnabled: (options.autoBattleEnabled ?? pendingHeroDeployment?.autoBattleEnabled) === true,
      battleContext,
      attackerHeroIds: selectedAttackerHeroIds,
      troopAllocation: battleTroopAllocation,
    }),
    world: {
      ...appState.world,
      cities: nextCities,
    },
  };

  return setFactionTradeSuspended(
    battleState,
    attackerCity.ownerFactionId,
    defenderCity.ownerFactionId,
    10,
  );
}

export function updateBattleState(appState, battleState) {
  return {
    ...appState,
    battle: battleState,
  };
}

export function retreatFromBattle(appState) {
  const battleContext = appState.battle?.battleContext ?? null;

  if (battleContext?.type === "defense") {
    const attackerCity = appState.world.cities.find((city) => city.id === battleContext.attackerCityId) ?? null;
    const conquerorFactionId = attackerCity?.ownerFactionId ?? "enemy";
    const updatedCities = occupyCity(
      appState.world.cities,
      battleContext.defenderCityId,
      conquerorFactionId,
    );
    convertCityHeroesToFaction(battleContext.defenderCityId, conquerorFactionId);

    return advanceWorldTurn(appState, {
      mode: "world",
      battle: null,
      selection: {
        ...appState.selection,
        cityId: battleContext.defenderCityId,
      },
      world: {
        ...appState.world,
        cities: updatedCities,
        turnOwner: "player",
        pendingEnemyTurnResult: null,
        lastRecruitmentResult: null,
      },
    });
  }

  return {
    ...appState,
    mode: "world",
    battle: null,
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    pendingHeroTransfer: null,
    world: {
      ...appState.world,
      lastRecruitmentResult: null,
    },
  };
}

function applyBattleTroopReturn(cities, targetCityId, outcome, { includeSurvivors = true, includeWounded = true } = {}) {
  return (cities ?? []).map((city) => {
    if (city.id !== targetCityId) {
      return city;
    }

    const nextGarrison = getCityGarrisonTroops(city) + (includeSurvivors ? outcome.survivors : 0);
    let nextCity = {
      ...city,
      military: {
        ...(city.military ?? {}),
        garrisonTroops: nextGarrison,
      },
    };

    if (includeWounded) {
      nextCity = addWoundedToCity(nextCity, outcome.wounded, 3);
    }

    return nextCity;
  });
}

function clearCapturedCityGarrison(cities, cityId) {
  return updateCityMilitary(cities, cityId, (military) => ({
    ...military,
    garrisonTroops: 0,
    woundedQueue: [],
  }));
}

export function applyWoundedRecovery(state) {
  const recoveryResults = [];
  const nextCities = (state?.world?.cities ?? []).map((city) => {
    const remainingQueue = [];
    let recoveredTroops = 0;

    for (const entry of getWoundedQueue(city)) {
      const troops = Math.max(0, Number(entry?.troops) || 0);
      const turnsLeft = Math.max(0, (Number(entry?.turnsLeft) || 0) - 1);

      if (troops <= 0) {
        continue;
      }

      if (turnsLeft <= 0) {
        recoveredTroops += troops;
      } else {
        remainingQueue.push({ turnsLeft, troops });
      }
    }

    if (recoveredTroops <= 0 && remainingQueue.length === getWoundedQueue(city).length) {
      return city;
    }

    if (recoveredTroops > 0) {
      recoveryResults.push({
        cityId: city.id,
        cityName: city.name,
        recoveredTroops,
      });
    }

    return {
      ...city,
      military: {
        ...(city.military ?? {}),
        garrisonTroops: getCityGarrisonTroops(city) + recoveredTroops,
        woundedQueue: remainingQueue,
      },
    };
  });

  return {
    ...state,
    world: {
      ...state.world,
      cities: nextCities,
      lastWoundedRecoveryResult: {
        turn: state?.meta?.turn ?? 1,
        results: recoveryResults,
      },
    },
  };
}

export function returnFromBattle(appState) {
  const { battle } = appState;

  if (!battle) {
    return retreatFromBattle(appState);
  }

  const battleContext = battle.battleContext ?? {
    type: "attack",
    attackerCityId: battle.attackerCityId,
    defenderCityId: battle.defenderCityId,
  };

  if (battleContext.type === "defense") {
    const defenseLost = battle.status !== "won";
    const troopOutcome = calculateBattleTroopOutcome(battle, !defenseLost);
    const enemyTroopOutcome = calculateEnemyBattleTroopOutcome(battle, defenseLost);
    let updatedCities = appState.world.cities;

    if (defenseLost) {
      const retreatCity = findNearestPlayerOwnedNeighbor(
        appState.world.cities,
        battle.defenderCityId,
        appState.meta.playerFactionId,
      );
      const attackerCity = updatedCities.find((city) => city.id === battle.attackerCityId) ?? null;
      const conquerorFactionId = attackerCity?.ownerFactionId ?? "enemy";
      updatedCities = occupyCity(updatedCities, battle.defenderCityId, conquerorFactionId);
      updatedCities = clearCapturedCityGarrison(updatedCities, battle.defenderCityId);
      updatedCities = applyBattleTroopReturn(updatedCities, battle.defenderCityId, enemyTroopOutcome);
      if (retreatCity) {
        updatedCities = applyBattleTroopReturn(updatedCities, retreatCity.id, troopOutcome, {
          includeSurvivors: false,
          includeWounded: true,
        });
      }
      convertCityHeroesToFaction(battle.defenderCityId, conquerorFactionId);
    } else {
      updatedCities = applyBattleTroopReturn(updatedCities, battle.defenderCityId, troopOutcome);
      if (enemyTroopOutcome.sourceCityId) {
        updatedCities = applyBattleTroopReturn(updatedCities, enemyTroopOutcome.sourceCityId, enemyTroopOutcome, {
          includeSurvivors: false,
          includeWounded: true,
        });
      }
    }

    return advanceWorldTurn(appState, {
      mode: "world",
      battle: null,
      selection: {
        ...appState.selection,
        cityId: battle.defenderCityId,
        originCityId: battle.defenderCityId,
      },
      world: {
        ...appState.world,
        cities: updatedCities,
        turnOwner: "player",
        pendingEnemyTurnResult: null,
        lastRecruitmentResult: null,
        lastBattleTroopResult: {
          ...troopOutcome,
          result: defenseLost ? "lost" : "won",
          returnCityId: defenseLost
            ? findNearestPlayerOwnedNeighbor(appState.world.cities, battle.defenderCityId, appState.meta.playerFactionId)?.id ?? null
            : battle.defenderCityId,
        },
      },
    });
  }

  if (battle.status === "won") {
    const troopOutcome = calculateBattleTroopOutcome(battle, true);
    const enemyTroopOutcome = calculateEnemyBattleTroopOutcome(battle, false);
    let updatedCities = occupyCity(
      clearCapturedCityGarrison(appState.world.cities, battle.defenderCityId),
      battle.defenderCityId,
      appState.meta.playerFactionId,
    );
    updatedCities = applyBattleTroopReturn(updatedCities, battle.defenderCityId, troopOutcome);
    // Defeated enemy defenders do not keep control of the captured city; only player troops enter it.
    const recruitedHeroes = recruitCityHeroesToFaction(
      battle.defenderCityId,
      appState.meta.playerFactionId,
    );

    return {
      ...appState,
      mode: "world",
      battle: null,
      pendingBattleChoice: null,
      pendingHeroDeployment: null,
      pendingHeroTransfer: null,
      selection: {
        ...appState.selection,
        cityId: battle.defenderCityId,
      },
      world: {
        ...appState.world,
        cities: updatedCities,
        lastRecruitmentResult: {
          cityId: battle.defenderCityId,
          factionId: appState.meta.playerFactionId,
          heroes: recruitedHeroes,
        },
        lastBattleTroopResult: {
          ...troopOutcome,
          result: "won",
          returnCityId: battle.defenderCityId,
        },
      },
    };
  }

  const troopOutcome = calculateBattleTroopOutcome(battle, false);
  const enemyTroopOutcome = calculateEnemyBattleTroopOutcome(battle, true);
  const returnCityId = troopOutcome.sourceCityId;
  let updatedCities = returnCityId
    ? applyBattleTroopReturn(appState.world.cities, returnCityId, troopOutcome, {
      includeSurvivors: false,
      includeWounded: true,
    })
    : appState.world.cities;
  if (battle.defenderCityId) {
    updatedCities = applyBattleTroopReturn(updatedCities, battle.defenderCityId, enemyTroopOutcome);
  }

  return {
    ...appState,
    mode: "world",
    battle: null,
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    pendingHeroTransfer: null,
    world: {
      ...appState.world,
      cities: updatedCities,
      lastRecruitmentResult: null,
      lastBattleTroopResult: {
        ...troopOutcome,
        result: "lost",
        returnCityId,
      },
    },
  };
}

export function endWorldTurn(appState) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "player"
    || appState.pendingBattleChoice
    || appState.pendingHeroDeployment
    || appState.pendingHeroTransfer
    || appState.world.pendingEnemyTurnResult
  ) {
    return appState;
  }

  const incomeAppliedState = applyPlayerTurnIncome(appState);
  const interFactionTradeAppliedState = applyPlayerInterFactionTradeIncome(incomeAppliedState);
  const upkeepAppliedState = applyTurnUpkeep(interFactionTradeAppliedState);
  const taxAppliedState = applyTaxLoyaltyEffect(upkeepAppliedState);
  const woundedRecoveredState = applyWoundedRecovery(taxAppliedState);
  const supplyNetworkAppliedState = applyInternalSupplyNetwork(
    woundedRecoveredState,
    woundedRecoveredState.meta.playerFactionId,
  );
  const troopRebalancedState = applyInternalTroopRebalance(
    supplyNetworkAppliedState,
    supplyNetworkAppliedState.meta.playerFactionId,
    supplyNetworkAppliedState.world.lastSupplyNetworkResult,
  );
  const tradeCooldownState = decrementTradeCooldowns(troopRebalancedState);
  const invasionCandidate = rollEnemyInvasion(tradeCooldownState.world.cities, ENEMY_INVASION_CHANCE);

  if (invasionCandidate) {
    return {
      ...tradeCooldownState,
      selection: {
        ...tradeCooldownState.selection,
        cityId: invasionCandidate.defenderCityId,
      },
      pendingBattleChoice: buildDefenseBattleChoice(tradeCooldownState, invasionCandidate),
      world: {
        ...tradeCooldownState.world,
        turnOwner: "enemy",
        pendingEnemyTurnResult: null,
      },
    };
  }

  return {
    ...tradeCooldownState,
    world: {
      ...tradeCooldownState.world,
      turnOwner: "enemy",
      pendingEnemyTurnResult: {
        type: "no_invasion",
        message: "적군은 이번 턴 움직이지 않았습니다.",
      },
    },
  };
}

export function confirmEnemyTurnResult(appState) {
  if (!appState.world.pendingEnemyTurnResult) {
    return appState;
  }

  return advanceWorldTurn(appState);
}
