import {
  CHANCELLOR_POLICY_KEYS,
  CHANCELLOR_STAT_KEYS,
  FACTION_IDS,
  GOVERNOR_POLICY_KEYS,
  RESOURCE_KEYS,
} from "../constants.js";

export const FACTION_RELATION_STATUS = Object.freeze({
  NEUTRAL: "neutral",
  TRADE: "trade",
  TRADE_SUSPENDED: "trade_suspended",
  TRADE_PAUSED: "trade_paused",
  WAR: "war",
});

const TRADE_SUSPENSION_TURNS = 10;
export const TRADE_CONTROL_MODES = Object.freeze({
  AUTO: "auto",
  DIRECT: "direct",
});
export const TRADE_INTENSITY_KEYS = Object.freeze({
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
});
export const TRADE_GOOD_KEYS = Object.freeze([
  RESOURCE_KEYS.GOLD,
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.SEAFOOD,
  RESOURCE_KEYS.SALT,
  RESOURCE_KEYS.SILK,
]);
const EXPORT_GOOD_KEYS = Object.freeze([
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.SEAFOOD,
  RESOURCE_KEYS.SALT,
  RESOURCE_KEYS.SILK,
]);
const DEFAULT_EXPORT_WEIGHTS = Object.freeze({
  [RESOURCE_KEYS.RICE]: 50,
  [RESOURCE_KEYS.BARLEY]: 50,
  [RESOURCE_KEYS.SEAFOOD]: 50,
  [RESOURCE_KEYS.SALT]: 50,
  [RESOURCE_KEYS.SILK]: 50,
});
const DEFAULT_IMPORT_PRIORITY = Object.freeze({
  [RESOURCE_KEYS.GOLD]: 70,
  food: 50,
  [RESOURCE_KEYS.SALT]: 50,
  [RESOURCE_KEYS.SILK]: 30,
});
const DEFAULT_TRADE_SETTINGS = Object.freeze({
  mode: TRADE_CONTROL_MODES.AUTO,
  intensity: TRADE_INTENSITY_KEYS.NORMAL,
  exportWeights: DEFAULT_EXPORT_WEIGHTS,
  importPriority: DEFAULT_IMPORT_PRIORITY,
  routeLimitOverride: null,
});
const DEFAULT_RELATION = Object.freeze({
  status: FACTION_RELATION_STATUS.NEUTRAL,
  tradeAllowed: true,
  tradeCooldownTurns: 0,
  updatedTurn: 0,
  reason: "",
});

function getNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampPercent(value, fallback = 50) {
  const numericValue = Number(value);
  return Math.round(clamp(Number.isFinite(numericValue) ? numericValue : fallback, 0, 100));
}

function getFactionIds(state) {
  const fromFactions = (state?.world?.factions ?? [])
    .map((faction) => faction?.id)
    .filter(Boolean);
  const fromCities = (state?.world?.cities ?? [])
    .map((city) => city?.ownerFactionId)
    .filter(Boolean);

  return [...new Set([...fromFactions, ...fromCities])];
}

function getFactionName(state, factionId) {
  return state?.world?.factions?.find((faction) => faction.id === factionId)?.name
    ?? factionId
    ?? "미상 세력";
}

function getCityLoyalty(city) {
  return clamp(getNumber(city?.cityLoyalty ?? city?.loyalty, 75), 0, 100);
}

function getCitySecurityStatus(city) {
  return city?.military?.securityStatus ?? "안정";
}

export function createDefaultTradeSettings() {
  return {
    ...DEFAULT_TRADE_SETTINGS,
    exportWeights: { ...DEFAULT_EXPORT_WEIGHTS },
    importPriority: { ...DEFAULT_IMPORT_PRIORITY },
  };
}

export function normalizeCityTradeSettings(tradeSettings = {}) {
  const mode = Object.values(TRADE_CONTROL_MODES).includes(tradeSettings?.mode)
    ? tradeSettings.mode
    : TRADE_CONTROL_MODES.AUTO;
  const intensity = Object.values(TRADE_INTENSITY_KEYS).includes(tradeSettings?.intensity)
    ? tradeSettings.intensity
    : TRADE_INTENSITY_KEYS.NORMAL;
  const routeLimitOverride = Number.isFinite(tradeSettings?.routeLimitOverride)
    ? Math.max(0, Math.round(tradeSettings.routeLimitOverride))
    : null;

  return {
    mode,
    intensity,
    exportWeights: Object.fromEntries(EXPORT_GOOD_KEYS.map((resourceKey) => [
      resourceKey,
      clampPercent(tradeSettings?.exportWeights?.[resourceKey], DEFAULT_EXPORT_WEIGHTS[resourceKey]),
    ])),
    importPriority: {
      [RESOURCE_KEYS.GOLD]: clampPercent(
        tradeSettings?.importPriority?.[RESOURCE_KEYS.GOLD],
        DEFAULT_IMPORT_PRIORITY[RESOURCE_KEYS.GOLD],
      ),
      food: clampPercent(tradeSettings?.importPriority?.food, DEFAULT_IMPORT_PRIORITY.food),
      [RESOURCE_KEYS.SALT]: clampPercent(
        tradeSettings?.importPriority?.[RESOURCE_KEYS.SALT],
        DEFAULT_IMPORT_PRIORITY[RESOURCE_KEYS.SALT],
      ),
      [RESOURCE_KEYS.SILK]: clampPercent(
        tradeSettings?.importPriority?.[RESOURCE_KEYS.SILK],
        DEFAULT_IMPORT_PRIORITY[RESOURCE_KEYS.SILK],
      ),
    },
    routeLimitOverride,
  };
}

export function getCityTradeSettings(city) {
  return normalizeCityTradeSettings(city?.tradeSettings);
}

function createDefaultRelation() {
  return { ...DEFAULT_RELATION };
}

function normalizeRelation(relation = {}) {
  const status = Object.values(FACTION_RELATION_STATUS).includes(relation?.status)
    ? relation.status
    : FACTION_RELATION_STATUS.NEUTRAL;
  const tradeCooldownTurns = Math.max(0, Math.round(Number(relation?.tradeCooldownTurns) || 0));
  const tradeAllowed = status === FACTION_RELATION_STATUS.NEUTRAL || status === FACTION_RELATION_STATUS.TRADE
    ? relation?.tradeAllowed !== false && tradeCooldownTurns <= 0
    : false;

  return {
    status: tradeCooldownTurns > 0 && status === FACTION_RELATION_STATUS.NEUTRAL
      ? FACTION_RELATION_STATUS.TRADE_SUSPENDED
      : status,
    tradeAllowed,
    tradeCooldownTurns,
    updatedTurn: Math.max(0, Math.round(Number(relation?.updatedTurn) || 0)),
    reason: relation?.reason ?? "",
  };
}

export function normalizeFactionRelations(state, sourceRelations = state?.factionRelations) {
  const factionIds = getFactionIds(state);
  const relations = {};

  for (const factionA of factionIds) {
    relations[factionA] = {};

    for (const factionB of factionIds) {
      if (factionA === factionB) {
        continue;
      }

      const savedRelation = sourceRelations?.[factionA]?.[factionB]
        ?? sourceRelations?.[factionB]?.[factionA]
        ?? createDefaultRelation();
      relations[factionA][factionB] = normalizeRelation(savedRelation);
    }
  }

  return relations;
}

export function createInitialFactionRelations(factions = []) {
  const factionIds = (factions ?? []).map((faction) => faction?.id).filter(Boolean);
  const shellState = {
    world: {
      factions: factionIds.map((id) => ({ id })),
      cities: [],
    },
  };

  return normalizeFactionRelations(shellState, {});
}

export function getFactionRelation(state, factionA, factionB) {
  if (!factionA || !factionB || factionA === factionB) {
    return {
      status: "same_faction",
      tradeAllowed: false,
      tradeCooldownTurns: 0,
    };
  }

  return normalizeRelation(
    state?.factionRelations?.[factionA]?.[factionB]
      ?? state?.factionRelations?.[factionB]?.[factionA]
      ?? createDefaultRelation(),
  );
}

export function canTradeBetweenFactions(state, factionA, factionB) {
  const relation = getFactionRelation(state, factionA, factionB);

  return factionA !== factionB
    && relation.tradeAllowed === true
    && relation.status !== FACTION_RELATION_STATUS.WAR
    && relation.status !== FACTION_RELATION_STATUS.TRADE_SUSPENDED
    && relation.tradeCooldownTurns <= 0;
}

function setRelationPair(relations, factionA, factionB, relation) {
  if (!relations[factionA]) {
    relations[factionA] = {};
  }

  relations[factionA][factionB] = normalizeRelation(relation);
}

export function setFactionRelationBidirectional(state, factionA, factionB, patch = {}) {
  if (!factionA || !factionB || factionA === factionB) {
    return state;
  }

  const relations = normalizeFactionRelations(state);
  const currentRelation = getFactionRelation(state, factionA, factionB);
  const nextRelation = normalizeRelation({
    ...currentRelation,
    ...patch,
    updatedTurn: state?.meta?.turn ?? patch.updatedTurn ?? currentRelation.updatedTurn ?? 0,
  });

  setRelationPair(relations, factionA, factionB, nextRelation);
  setRelationPair(relations, factionB, factionA, nextRelation);

  return {
    ...state,
    factionRelations: relations,
  };
}

export function setFactionTradeSuspended(state, factionA, factionB, turns = TRADE_SUSPENSION_TURNS) {
  if (!factionA || !factionB || factionA === factionB) {
    return state;
  }

  const suspendedRelation = {
    status: FACTION_RELATION_STATUS.TRADE_SUSPENDED,
    tradeAllowed: false,
    tradeCooldownTurns: Math.max(1, Math.round(Number(turns) || TRADE_SUSPENSION_TURNS)),
    updatedTurn: state?.meta?.turn ?? 0,
    reason: "전투 후 교역 중단",
  };

  return setFactionRelationBidirectional(state, factionA, factionB, suspendedRelation);
}

export function decrementTradeCooldowns(state) {
  const relations = normalizeFactionRelations(state);
  const nextRelations = {};

  for (const [factionA, entries] of Object.entries(relations)) {
    nextRelations[factionA] = {};

    for (const [factionB, relation] of Object.entries(entries)) {
      if (relation.tradeCooldownTurns <= 0) {
        nextRelations[factionA][factionB] = normalizeRelation(relation);
        continue;
      }

      const nextCooldown = Math.max(0, relation.tradeCooldownTurns - 1);
      nextRelations[factionA][factionB] = nextCooldown <= 0
        ? {
          status: FACTION_RELATION_STATUS.NEUTRAL,
          tradeAllowed: true,
          tradeCooldownTurns: 0,
          updatedTurn: state?.meta?.turn ?? 0,
          reason: "교역 재개",
        }
        : {
          status: FACTION_RELATION_STATUS.TRADE_SUSPENDED,
          tradeAllowed: false,
          tradeCooldownTurns: nextCooldown,
          updatedTurn: relation.updatedTurn ?? 0,
          reason: relation.reason ?? "전투 후 교역 중단",
        };
    }
  }

  return {
    ...state,
    factionRelations: nextRelations,
  };
}

export function pauseFactionTrade(state, factionA, factionB) {
  const relation = getFactionRelation(state, factionA, factionB);

  if (
    relation.status === FACTION_RELATION_STATUS.TRADE_SUSPENDED
    || relation.status === FACTION_RELATION_STATUS.WAR
    || relation.tradeCooldownTurns > 0
  ) {
    return state;
  }

  return setFactionRelationBidirectional(state, factionA, factionB, {
    status: FACTION_RELATION_STATUS.TRADE_PAUSED,
    tradeAllowed: false,
    tradeCooldownTurns: 0,
    reason: "플레이어가 교역을 중단함",
  });
}

export function resumeFactionTrade(state, factionA, factionB) {
  const relation = getFactionRelation(state, factionA, factionB);

  if (
    relation.status !== FACTION_RELATION_STATUS.TRADE_PAUSED
    || relation.tradeCooldownTurns > 0
  ) {
    return state;
  }

  return setFactionRelationBidirectional(state, factionA, factionB, {
    status: FACTION_RELATION_STATUS.NEUTRAL,
    tradeAllowed: true,
    tradeCooldownTurns: 0,
    reason: "교역 재개",
  });
}

export function promoteFactionTrade(state, factionA, factionB) {
  const relation = getFactionRelation(state, factionA, factionB);

  if (
    relation.status !== FACTION_RELATION_STATUS.NEUTRAL
    || relation.tradeCooldownTurns > 0
  ) {
    return state;
  }

  return setFactionRelationBidirectional(state, factionA, factionB, {
    status: FACTION_RELATION_STATUS.TRADE,
    tradeAllowed: true,
    tradeCooldownTurns: 0,
    reason: "교역 우호 강화",
  });
}

export function getFactionRelationLabel(relation = {}) {
  const normalizedRelation = normalizeRelation(relation);

  switch (normalizedRelation.status) {
    case FACTION_RELATION_STATUS.TRADE:
      return "교역 우호";
    case FACTION_RELATION_STATUS.TRADE_PAUSED:
      return "교역 중단";
    case FACTION_RELATION_STATUS.TRADE_SUSPENDED:
      return "전쟁 후 교역 중단";
    case FACTION_RELATION_STATUS.WAR:
      return "전쟁";
    case FACTION_RELATION_STATUS.NEUTRAL:
    default:
      return "중립 교역";
  }
}

export function getFactionRelationDescription(relation = {}) {
  const normalizedRelation = normalizeRelation(relation);

  if (normalizedRelation.status === FACTION_RELATION_STATUS.TRADE_SUSPENDED) {
    return `전쟁 후 교역 중단 · 재개까지 ${normalizedRelation.tradeCooldownTurns}턴`;
  }

  if (normalizedRelation.status === FACTION_RELATION_STATUS.WAR) {
    return "전쟁 중 · 교역 불가";
  }

  if (normalizedRelation.status === FACTION_RELATION_STATUS.TRADE_PAUSED) {
    return normalizedRelation.reason || "플레이어가 교역을 중단함";
  }

  return normalizedRelation.tradeAllowed ? "교역 가능" : "교역 불가";
}

export function buildFactionRelationSummary(state, factionId) {
  const relations = normalizeFactionRelations(state);

  return Object.entries(relations[factionId] ?? {}).map(([otherFactionId, relation]) => ({
    factionId: otherFactionId,
    factionName: getFactionName(state, otherFactionId),
    relation,
    label: getFactionRelationLabel(relation),
    description: getFactionRelationDescription(relation),
    canTrade: canTradeBetweenFactions(state, factionId, otherFactionId),
  }));
}

function getSpecialtyTradeValue(city) {
  const resources = city?.resources ?? {};
  const specialties = [];
  let gold = 0;
  let rice = 0;
  let barley = 0;
  let seafood = 0;
  let salt = 0;

  if ((resources[RESOURCE_KEYS.SILK] ?? 0) > 0) {
    gold += 10;
    specialties.push("비단");
  }

  if ((resources[RESOURCE_KEYS.SALT] ?? 0) > 0) {
    gold += 4;
    salt += 5;
    specialties.push("소금");
  }

  if ((resources[RESOURCE_KEYS.SEAFOOD] ?? 0) > 0) {
    seafood += 8;
    specialties.push("수산물");
  }

  if ((resources[RESOURCE_KEYS.RICE] ?? 0) > 0) {
    rice += 4;
    specialties.push("쌀");
  }

  if ((resources[RESOURCE_KEYS.BARLEY] ?? 0) > 0) {
    barley += 4;
    specialties.push("보리");
  }

  if ((resources[RESOURCE_KEYS.WOOD] ?? 0) > 0 || (resources[RESOURCE_KEYS.IRON] ?? 0) > 0 || (resources[RESOURCE_KEYS.HORSES] ?? 0) > 0) {
    gold += 2;
  }

  return {
    gold,
    rice,
    barley,
    seafood,
    salt,
    specialties,
  };
}

function getSecurityMultiplier(cityA, cityB) {
  const statuses = [getCitySecurityStatus(cityA), getCitySecurityStatus(cityB)];

  if (statuses.some((status) => status === "불안")) {
    return 0.8;
  }

  if (statuses.every((status) => status === "안정")) {
    return 1.1;
  }

  return 1;
}

function getLoyaltyMultiplier(cityA, cityB) {
  const loyalties = [getCityLoyalty(cityA), getCityLoyalty(cityB)];

  if (loyalties.some((loyalty) => loyalty < 60)) {
    return 0.8;
  }

  if (loyalties.every((loyalty) => loyalty >= 80)) {
    return 1.1;
  }

  return 1;
}

function getRelationMultiplier(relation) {
  if (relation.status === FACTION_RELATION_STATUS.TRADE) {
    return 1.2;
  }

  if (relation.status === FACTION_RELATION_STATUS.NEUTRAL) {
    return 1;
  }

  return 0;
}

function getFactionPolicy(state, factionId) {
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;

  if (factionId === playerFactionId) {
    return {
      chancellorHeroId: state?.domesticPolicy?.chancellorHeroId ?? null,
      chancellorPolicy: state?.domesticPolicy?.chancellorPolicy ?? CHANCELLOR_POLICY_KEYS.BALANCED,
    };
  }

  const faction = state?.world?.factions?.find((entry) => entry.id === factionId) ?? null;
  return {
    chancellorHeroId: faction?.domesticPolicy?.chancellorHeroId ?? faction?.chancellorHeroId ?? null,
    chancellorPolicy: faction?.domesticPolicy?.chancellorPolicy ?? faction?.chancellorPolicy ?? CHANCELLOR_POLICY_KEYS.BALANCED,
  };
}

function getHeroById(state, heroId) {
  return state?.world?.heroes?.find((hero) => hero.id === heroId) ?? null;
}

function getTradeGovernanceForCity(state, city) {
  const settings = getCityTradeSettings(city);
  const factionPolicy = getFactionPolicy(state, city?.ownerFactionId);
  const chancellorHero = getHeroById(state, factionPolicy.chancellorHeroId);
  const governorHero = getHeroById(state, city?.governorHeroId);
  const reasons = [];
  let operationMode = "temporaryOfficials";
  let operationLabel = "임시 관료 최소 무역";
  let efficiency = 0.3;

  if (settings.mode === TRADE_CONTROL_MODES.DIRECT && city?.ownerFactionId === (state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER)) {
    operationMode = "direct";
    operationLabel = "직할 무역";
    efficiency = 1;
    reasons.push("직할 설정");
  } else if (chancellorHero) {
    operationMode = "chancellor";
    operationLabel = "재상 자동 운영";
    efficiency = 1;
    reasons.push("재상 자동 무역");
  } else if (governorHero) {
    operationMode = "governorOnly";
    operationLabel = "태수 제한 무역";
    efficiency = 0.6;
    reasons.push("태수 제한 무역");
  } else {
    reasons.push("임시 관료");
  }

  let goldMultiplier = 1;
  let foodMultiplier = 1;
  let saltMultiplier = 1;
  let routeLimitBonus = 0;
  const chancellorType = chancellorHero?.chancellorProfile?.primaryType ?? null;

  switch (factionPolicy.chancellorPolicy) {
    case CHANCELLOR_POLICY_KEYS.TRADE:
      efficiency += 0.1;
      routeLimitBonus += 1;
      reasons.push("무역 중심");
      break;
    case CHANCELLOR_POLICY_KEYS.COMMERCE:
      goldMultiplier += 0.15;
      reasons.push("상업 중심");
      break;
    case CHANCELLOR_POLICY_KEYS.AGRICULTURE:
      foodMultiplier += 0.1;
      reasons.push("농업 중심");
      break;
    case CHANCELLOR_POLICY_KEYS.MILITARY:
      foodMultiplier += 0.05;
      saltMultiplier += 0.05;
      reasons.push("군수 보급");
      break;
    default:
      break;
  }

  if (chancellorType === CHANCELLOR_STAT_KEYS.ECONOMIC) {
    goldMultiplier += 0.05;
    reasons.push("경제형 재상");
  } else if (chancellorType === CHANCELLOR_STAT_KEYS.DIPLOMATIC) {
    efficiency += 0.05;
    reasons.push("외교형 재상");
  } else if (chancellorType === CHANCELLOR_STAT_KEYS.ADMINISTRATIVE) {
    efficiency += 0.03;
    reasons.push("행정형 재상");
  } else if (chancellorType === CHANCELLOR_STAT_KEYS.MILITARY_ADMIN) {
    foodMultiplier += 0.04;
    saltMultiplier += 0.04;
    reasons.push("군정형 재상");
  }

  if (!chancellorHero) {
    if (city?.governorPolicy === GOVERNOR_POLICY_KEYS.COMMERCE) {
      goldMultiplier += 0.08;
      reasons.push("태수 상업");
    } else if (city?.governorPolicy === GOVERNOR_POLICY_KEYS.AGRICULTURE) {
      foodMultiplier += 0.08;
      reasons.push("태수 농업");
    } else if (city?.governorPolicy === GOVERNOR_POLICY_KEYS.MILITARY) {
      foodMultiplier += 0.05;
      saltMultiplier += 0.05;
      reasons.push("태수 군사");
    }
  }

  return {
    operationMode,
    operationLabel,
    efficiency: clamp(efficiency, 0.3, 1.25),
    goldMultiplier,
    foodMultiplier,
    saltMultiplier,
    routeLimitBonus,
    settings,
    chancellorPolicy: factionPolicy.chancellorPolicy,
    chancellorHeroId: chancellorHero?.id ?? null,
    governorHeroId: governorHero?.id ?? null,
    reasons,
  };
}

function getIntensityMultiplier(settings) {
  switch (settings?.intensity) {
    case TRADE_INTENSITY_KEYS.LOW:
      return 0.7;
    case TRADE_INTENSITY_KEYS.HIGH:
      return 1.3;
    case TRADE_INTENSITY_KEYS.NORMAL:
    default:
      return 1;
  }
}

function getSettingsMultiplier(settings, resourceKey) {
  if (settings?.mode !== TRADE_CONTROL_MODES.DIRECT) {
    return 1;
  }

  const exportWeights = settings.exportWeights ?? DEFAULT_EXPORT_WEIGHTS;
  const importPriority = settings.importPriority ?? DEFAULT_IMPORT_PRIORITY;

  if (resourceKey === RESOURCE_KEYS.GOLD) {
    return 0.9 + ((importPriority[RESOURCE_KEYS.GOLD] ?? 70) / 100) * 0.25
      + ((exportWeights[RESOURCE_KEYS.SILK] ?? 50) / 100) * 0.12;
  }

  if ([RESOURCE_KEYS.RICE, RESOURCE_KEYS.BARLEY, RESOURCE_KEYS.SEAFOOD].includes(resourceKey)) {
    return 0.9 + ((importPriority.food ?? 50) / 100) * 0.2
      + ((exportWeights[resourceKey] ?? 50) / 100) * 0.08;
  }

  if (resourceKey === RESOURCE_KEYS.SALT) {
    return 0.9 + ((importPriority[RESOURCE_KEYS.SALT] ?? 50) / 100) * 0.2
      + ((exportWeights[RESOURCE_KEYS.SALT] ?? 50) / 100) * 0.08;
  }

  return 1;
}

function combineGovernance(governanceA, governanceB) {
  return {
    operationLabel: governanceA.efficiency >= governanceB.efficiency
      ? governanceA.operationLabel
      : governanceB.operationLabel,
    efficiency: (governanceA.efficiency + governanceB.efficiency) / 2,
    goldMultiplier: (governanceA.goldMultiplier + governanceB.goldMultiplier) / 2,
    foodMultiplier: (governanceA.foodMultiplier + governanceB.foodMultiplier) / 2,
    saltMultiplier: (governanceA.saltMultiplier + governanceB.saltMultiplier) / 2,
    settingsA: governanceA.settings,
    settingsB: governanceB.settings,
    reasons: [...new Set([...governanceA.reasons, ...governanceB.reasons])].slice(0, 5),
  };
}

function buildGovernanceSummary(governance) {
  return {
    operationMode: governance.operationMode,
    operationLabel: governance.operationLabel,
    efficiency: Number(governance.efficiency.toFixed(2)),
    settings: getTradeSettingsSummary(governance.settings),
  };
}

function getRouteLimit(state, city) {
  const governance = getTradeGovernanceForCity(state, city);
  const override = governance.settings.routeLimitOverride;

  if (override !== null) {
    return override;
  }

  return Math.max(1, 1 + governance.routeLimitBonus);
}

function getTradeSettingsSummary(settings) {
  const exportWeights = settings?.exportWeights ?? DEFAULT_EXPORT_WEIGHTS;
  const importPriority = settings?.importPriority ?? DEFAULT_IMPORT_PRIORITY;
  const mainExports = Object.entries(exportWeights)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, 2)
    .map(([resourceKey]) => resourceKey);
  const mainImports = Object.entries(importPriority)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, 2)
    .map(([resourceKey]) => resourceKey);

  return {
    mode: settings.mode,
    intensity: settings.intensity,
    mainExports,
    mainImports,
  };
}

export function calculateInterFactionTradeRouteValue(state, cityA, cityB) {
  const relation = getFactionRelation(state, cityA?.ownerFactionId, cityB?.ownerFactionId);
  if (!canTradeBetweenFactions(state, cityA?.ownerFactionId, cityB?.ownerFactionId)) {
    return {
      gold: 0,
      rice: 0,
      barley: 0,
      seafood: 0,
      salt: 0,
      specialties: [],
      reasons: ["교역 차단"],
      governance: null,
    };
  }

  const cityASpecialty = getSpecialtyTradeValue(cityA);
  const cityBSpecialty = getSpecialtyTradeValue(cityB);
  const cityAGovernance = getTradeGovernanceForCity(state, cityA);
  const cityBGovernance = getTradeGovernanceForCity(state, cityB);
  const governance = combineGovernance(cityAGovernance, cityBGovernance);
  const baseGold = ((cityA?.commerceRating ?? 0) + (cityB?.commerceRating ?? 0)) * 3
    + cityASpecialty.gold
    + cityBSpecialty.gold;
  const multiplier = getSecurityMultiplier(cityA, cityB)
    * getLoyaltyMultiplier(cityA, cityB)
    * getRelationMultiplier(relation)
    * governance.efficiency;
  const settingsMultiplierA = (resourceKey) => getIntensityMultiplier(governance.settingsA)
    * getSettingsMultiplier(governance.settingsA, resourceKey);
  const settingsMultiplierB = (resourceKey) => getIntensityMultiplier(governance.settingsB)
    * getSettingsMultiplier(governance.settingsB, resourceKey);
  const routeResourceMultiplier = (resourceKey) => (
    settingsMultiplierA(resourceKey) + settingsMultiplierB(resourceKey)
  ) / 2;
  const gold = Math.floor(clamp(
    baseGold * multiplier * governance.goldMultiplier * routeResourceMultiplier(RESOURCE_KEYS.GOLD),
    0,
    90,
  ));
  const rice = Math.floor(clamp(
    (cityASpecialty.rice + cityBSpecialty.rice) * multiplier * governance.foodMultiplier * routeResourceMultiplier(RESOURCE_KEYS.RICE),
    0,
    20,
  ));
  const barley = Math.floor(clamp(
    (cityASpecialty.barley + cityBSpecialty.barley) * multiplier * governance.foodMultiplier * routeResourceMultiplier(RESOURCE_KEYS.BARLEY),
    0,
    20,
  ));
  const seafood = Math.floor(clamp(
    (cityASpecialty.seafood + cityBSpecialty.seafood) * multiplier * governance.foodMultiplier * routeResourceMultiplier(RESOURCE_KEYS.SEAFOOD),
    0,
    22,
  ));
  const salt = Math.floor(clamp(
    (cityASpecialty.salt + cityBSpecialty.salt) * multiplier * governance.saltMultiplier * routeResourceMultiplier(RESOURCE_KEYS.SALT),
    0,
    16,
  ));
  const reasons = [];

  if (multiplier > 1) {
    reasons.push("안정 교역");
  }

  if (multiplier < 1) {
    reasons.push("위험 보정");
  }

  return {
    gold,
    rice,
    barley,
    seafood,
    salt,
    specialties: [...new Set([...cityASpecialty.specialties, ...cityBSpecialty.specialties])].slice(0, 5),
    governance: {
      operationLabel: governance.operationLabel,
      efficiency: Number(governance.efficiency.toFixed(2)),
      settingsA: getTradeSettingsSummary(governance.settingsA),
      settingsB: getTradeSettingsSummary(governance.settingsB),
      cityA: buildGovernanceSummary(cityAGovernance),
      cityB: buildGovernanceSummary(cityBGovernance),
    },
    reasons: [...new Set([...reasons, ...governance.reasons])].slice(0, 6),
  };
}

export function calculateInterFactionTradeRoutes(state) {
  const cities = state?.world?.cities ?? [];
  const routeCandidates = [];
  const suspendedRoutes = [];
  const routeKeys = new Set();
  const suspendedKeys = new Set();

  for (const cityA of cities) {
    for (const neighborId of cityA.neighbors ?? []) {
      const cityB = cities.find((city) => city.id === neighborId) ?? null;

      if (!cityB || cityA.ownerFactionId === cityB.ownerFactionId) {
        continue;
      }

      const factionA = cityA.ownerFactionId;
      const factionB = cityB.ownerFactionId;
      const routeKey = [cityA.id, cityB.id].sort().join(":");
      const relation = getFactionRelation(state, factionA, factionB);

      if (routeKeys.has(routeKey)) {
        continue;
      }

      routeKeys.add(routeKey);

      if (!canTradeBetweenFactions(state, factionA, factionB)) {
        const suspendedKey = [factionA, factionB].sort().join(":");
        if (!suspendedKeys.has(suspendedKey) && relation.status !== FACTION_RELATION_STATUS.NEUTRAL) {
          suspendedKeys.add(suspendedKey);
          suspendedRoutes.push({
            fromFactionId: factionA,
            toFactionId: factionB,
            fromFactionName: getFactionName(state, factionA),
            toFactionName: getFactionName(state, factionB),
            status: relation.status,
            tradeCooldownTurns: relation.tradeCooldownTurns,
          });
        }
        continue;
      }

      const value = calculateInterFactionTradeRouteValue(state, cityA, cityB);
      routeCandidates.push({
        fromCityId: cityA.id,
        toCityId: cityB.id,
        fromCityName: cityA.name,
        toCityName: cityB.name,
        fromFactionId: factionA,
        toFactionId: factionB,
        fromFactionName: getFactionName(state, factionA),
        toFactionName: getFactionName(state, factionB),
        status: relation.status,
        tradeCooldownTurns: relation.tradeCooldownTurns,
        routePriority: (relation.status === FACTION_RELATION_STATUS.TRADE ? 100 : 0)
          + ((cityA.commerceRating ?? 0) + (cityB.commerceRating ?? 0)) * 8
          + (value.specialties?.length ?? 0) * 6
          + value.gold,
        ...value,
      });
    }
  }

  const routeUseCount = {};
  const routes = routeCandidates
    .sort((routeA, routeB) => routeB.routePriority - routeA.routePriority)
    .filter((route) => {
      const cityA = cities.find((city) => city.id === route.fromCityId) ?? null;
      const cityB = cities.find((city) => city.id === route.toCityId) ?? null;
      const fromLimit = getRouteLimit(state, cityA);
      const toLimit = getRouteLimit(state, cityB);
      const fromCount = routeUseCount[route.fromCityId] ?? 0;
      const toCount = routeUseCount[route.toCityId] ?? 0;

      if (fromCount >= fromLimit || toCount >= toLimit) {
        return false;
      }

      routeUseCount[route.fromCityId] = fromCount + 1;
      routeUseCount[route.toCityId] = toCount + 1;
      return true;
    });

  return { routes, suspendedRoutes };
}

function addTotals(totals, amount) {
  totals[RESOURCE_KEYS.GOLD] += amount.gold ?? 0;
  totals[RESOURCE_KEYS.RICE] += amount.rice ?? 0;
  totals[RESOURCE_KEYS.BARLEY] += amount.barley ?? 0;
  totals[RESOURCE_KEYS.SEAFOOD] += amount.seafood ?? 0;
  totals[RESOURCE_KEYS.SALT] += amount.salt ?? 0;
}

function createTradeTotals() {
  return {
    [RESOURCE_KEYS.GOLD]: 0,
    [RESOURCE_KEYS.RICE]: 0,
    [RESOURCE_KEYS.BARLEY]: 0,
    [RESOURCE_KEYS.SEAFOOD]: 0,
    [RESOURCE_KEYS.SALT]: 0,
  };
}

export function calculateInterFactionTradeResult(state) {
  const { routes, suspendedRoutes } = calculateInterFactionTradeRoutes(state);
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;
  const playerTotals = createTradeTotals();
  const factionTotals = {};

  for (const route of routes) {
    const participatingFactions = [route.fromFactionId, route.toFactionId];

    for (const factionId of participatingFactions) {
      if (!factionTotals[factionId]) {
        factionTotals[factionId] = createTradeTotals();
      }

      addTotals(factionTotals[factionId], route);
    }

    if (participatingFactions.includes(playerFactionId)) {
      addTotals(playerTotals, route);
    }
  }

  return {
    turn: state?.meta?.turn ?? 1,
    routeCount: routes.length,
    playerTotals,
    factionTotals,
    routes,
    suspendedRoutes,
  };
}

export function applyPlayerInterFactionTradeIncome(state, result = calculateInterFactionTradeResult(state)) {
  const nextResources = {
    ...(state?.resources ?? {}),
  };

  for (const [resourceKey, amount] of Object.entries(result.playerTotals ?? {})) {
    nextResources[resourceKey] = (nextResources[resourceKey] ?? 0) + amount;
  }

  const nextIncomeResult = state?.world?.lastIncomeResult
    ? {
      ...state.world.lastIncomeResult,
      totals: {
        ...(state.world.lastIncomeResult.totals ?? {}),
        [RESOURCE_KEYS.GOLD]: (state.world.lastIncomeResult.totals?.[RESOURCE_KEYS.GOLD] ?? 0) + (result.playerTotals?.[RESOURCE_KEYS.GOLD] ?? 0),
        [RESOURCE_KEYS.RICE]: (state.world.lastIncomeResult.totals?.[RESOURCE_KEYS.RICE] ?? 0) + (result.playerTotals?.[RESOURCE_KEYS.RICE] ?? 0),
        [RESOURCE_KEYS.BARLEY]: (state.world.lastIncomeResult.totals?.[RESOURCE_KEYS.BARLEY] ?? 0) + (result.playerTotals?.[RESOURCE_KEYS.BARLEY] ?? 0),
        [RESOURCE_KEYS.SEAFOOD]: (state.world.lastIncomeResult.totals?.[RESOURCE_KEYS.SEAFOOD] ?? 0) + (result.playerTotals?.[RESOURCE_KEYS.SEAFOOD] ?? 0),
        [RESOURCE_KEYS.SALT]: (state.world.lastIncomeResult.totals?.[RESOURCE_KEYS.SALT] ?? 0) + (result.playerTotals?.[RESOURCE_KEYS.SALT] ?? 0),
      },
      interFactionTrade: result,
    }
    : null;

  return {
    ...state,
    resources: nextResources,
    world: {
      ...state.world,
      lastIncomeResult: nextIncomeResult ?? state?.world?.lastIncomeResult ?? null,
      lastInterFactionTradeResult: result,
    },
  };
}

export function buildCityExternalTradeSummary(result, cityId) {
  return {
    activeRoutes: (result?.routes ?? []).filter((route) => route.fromCityId === cityId || route.toCityId === cityId),
    suspendedRoutes: (result?.suspendedRoutes ?? []).filter((route) => route.fromCityId === cityId || route.toCityId === cityId),
  };
}

export function buildFactionExternalTradeSummary(result, factionId) {
  const activeRoutes = (result?.routes ?? []).filter((route) => (
    route.fromFactionId === factionId || route.toFactionId === factionId
  ));
  const suspendedRoutes = (result?.suspendedRoutes ?? []).filter((route) => (
    route.fromFactionId === factionId || route.toFactionId === factionId
  ));

  return {
    routeCount: activeRoutes.length,
    totals: result?.factionTotals?.[factionId] ?? createTradeTotals(),
    activeRoutes,
    suspendedRoutes,
  };
}
