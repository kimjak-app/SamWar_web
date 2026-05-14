import {
  CHANCELLOR_POLICY_KEYS,
  CHANCELLOR_STAT_KEYS,
  FACTION_IDS,
  GOVERNOR_POLICY_KEYS,
  LOYALTY_KEYS,
  RESOURCE_KEYS,
} from "../constants.js";
import {
  calculateNationalDomesticEffects,
  getActiveChancellorHero,
  getActiveGovernorHero,
  getHeroDomesticProfile,
} from "./domestic_effects.js";
import { normalizeDomesticPolicy } from "./domestic_income.js";

export const CITY_MILITARY_ROLE_KEYS = Object.freeze({
  REAR: "rear",
  BORDER: "border",
  FRONTLINE: "frontline",
});

export const CITY_MILITARY_ROLE_LABELS = Object.freeze({
  [CITY_MILITARY_ROLE_KEYS.REAR]: "후방",
  [CITY_MILITARY_ROLE_KEYS.BORDER]: "국경",
  [CITY_MILITARY_ROLE_KEYS.FRONTLINE]: "최전선",
});

const ROLE_TARGET_GARRISON_RATIO = Object.freeze({
  [CITY_MILITARY_ROLE_KEYS.REAR]: 0.10,
  [CITY_MILITARY_ROLE_KEYS.BORDER]: 0.22,
  [CITY_MILITARY_ROLE_KEYS.FRONTLINE]: 0.30,
});

const ROLE_PRIORITY_WEIGHT = Object.freeze({
  [CITY_MILITARY_ROLE_KEYS.REAR]: 1,
  [CITY_MILITARY_ROLE_KEYS.BORDER]: 2,
  [CITY_MILITARY_ROLE_KEYS.FRONTLINE]: 3,
});

const TROOP_REBALANCE_MIN_TRANSFER = 100;
const TROOP_REBALANCE_BASE_CAP = 3000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function getCityPopulation(city) {
  return Math.max(1, getNumber(city?.population, 30000));
}

function getCityGarrison(city) {
  return Math.max(0, getNumber(city?.military?.garrisonTroops, 0));
}

function getSecurityRequiredTroops(city) {
  return Math.max(1, getNumber(city?.military?.securityRequiredTroops, 500));
}

function getCityLoyalty(city) {
  return clamp(getNumber(city?.[LOYALTY_KEYS.CITY] ?? city?.cityLoyalty ?? city?.loyalty, 75), 0, 100);
}

function getCityById(cities, cityId) {
  return (cities ?? []).find((city) => city?.id === cityId) ?? null;
}

function getRoleLabel(role) {
  return CITY_MILITARY_ROLE_LABELS[role] ?? CITY_MILITARY_ROLE_LABELS[CITY_MILITARY_ROLE_KEYS.REAR];
}

function floorToHundreds(value) {
  return Math.floor(Math.max(0, value) / 100) * 100;
}

function getMaxGarrisonByPopulation(city) {
  const population = getCityPopulation(city);
  const maxTroopRatio = getNumber(city?.military?.maxTroopRatio, 0.50);

  return Math.floor(population * maxTroopRatio);
}

function getPolicyBonus(state, city, role) {
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;
  const domesticPolicy = normalizeDomesticPolicy(
    state?.domesticPolicy,
    state?.world?.heroes,
    playerFactionId,
  );
  const chancellorHero = getActiveChancellorHero(state?.world?.heroes, domesticPolicy, playerFactionId);
  const governorHero = getActiveGovernorHero(city, state?.world?.heroes, playerFactionId);
  const chancellorProfile = getHeroDomesticProfile(chancellorHero);
  const governorProfile = getHeroDomesticProfile(governorHero);
  const nationalEffects = calculateNationalDomesticEffects({ chancellorHero, domesticPolicy });
  let goldMultiplier = 1;
  let supplyMultiplier = 1;
  const reasons = [];

  if (domesticPolicy.chancellorPolicy === CHANCELLOR_POLICY_KEYS.TRADE) {
    goldMultiplier += 0.06;
    supplyMultiplier += 0.04;
    reasons.push("재상 무역 정책");
  } else if (domesticPolicy.chancellorPolicy === CHANCELLOR_POLICY_KEYS.COMMERCE) {
    goldMultiplier += 0.04;
    reasons.push("재상 상업 정책");
  } else if (domesticPolicy.chancellorPolicy === CHANCELLOR_POLICY_KEYS.MILITARY && role !== CITY_MILITARY_ROLE_KEYS.REAR) {
    supplyMultiplier += 0.03;
    reasons.push("재상 군사 정책");
  }

  if (chancellorProfile.primaryType === CHANCELLOR_STAT_KEYS.ECONOMIC) {
    goldMultiplier += Math.min(0.04, chancellorProfile.primaryAptitude * 0.006);
    reasons.push("경제형 재상");
  } else if (chancellorProfile.primaryType === CHANCELLOR_STAT_KEYS.DIPLOMATIC) {
    goldMultiplier += Math.min(0.03, chancellorProfile.primaryAptitude * 0.005);
    reasons.push("외교형 재상");
  } else if (chancellorProfile.primaryType === CHANCELLOR_STAT_KEYS.ADMINISTRATIVE) {
    supplyMultiplier += Math.min(0.04, chancellorProfile.primaryAptitude * 0.006);
    reasons.push("행정형 재상");
  }

  if (city?.governorPolicy === GOVERNOR_POLICY_KEYS.COMMERCE) {
    goldMultiplier += 0.05;
    reasons.push("태수 상업 중심");
  } else if (city?.governorPolicy === GOVERNOR_POLICY_KEYS.MILITARY) {
    supplyMultiplier += 0.05;
    reasons.push("태수 군사 중심");
  } else if (city?.governorPolicy === GOVERNOR_POLICY_KEYS.AGRICULTURE) {
    supplyMultiplier += 0.04;
    reasons.push("태수 농업 중심");
  }

  if (governorProfile.primaryType === CHANCELLOR_STAT_KEYS.ADMINISTRATIVE) {
    supplyMultiplier += Math.min(0.03, governorProfile.primaryAptitude * 0.005);
  } else if (governorProfile.primaryType === CHANCELLOR_STAT_KEYS.ECONOMIC) {
    goldMultiplier += Math.min(0.03, governorProfile.primaryAptitude * 0.005);
  }

  goldMultiplier *= nationalEffects.goldMultiplier ?? 1;

  return {
    goldMultiplier: clamp(goldMultiplier, 0.9, 1.2),
    supplyMultiplier: clamp(supplyMultiplier, 0.9, 1.18),
    reasons,
  };
}

function getTroopRebalancePolicy(state, factionId = FACTION_IDS.PLAYER) {
  const domesticPolicy = normalizeDomesticPolicy(
    state?.domesticPolicy,
    state?.world?.heroes,
    factionId,
  );
  const chancellorHero = getActiveChancellorHero(state?.world?.heroes, domesticPolicy, factionId);
  let transferMultiplier = 1;
  const reasons = [];

  switch (domesticPolicy.chancellorPolicy) {
    case CHANCELLOR_POLICY_KEYS.MILITARY:
      transferMultiplier *= 1.20;
      reasons.push("재상 군사 중심");
      break;
    case CHANCELLOR_POLICY_KEYS.AGRICULTURE:
      transferMultiplier *= 0.80;
      reasons.push("재상 농업 중심 보수 이동");
      break;
    case CHANCELLOR_POLICY_KEYS.COMMERCE:
      transferMultiplier *= 0.90;
      reasons.push("재상 상업 중심 과밀 해소");
      break;
    case CHANCELLOR_POLICY_KEYS.TRADE:
      transferMultiplier *= 1.10;
      reasons.push("재상 무역 중심 보급로 우선");
      break;
    case CHANCELLOR_POLICY_KEYS.BALANCED:
    default:
      reasons.push("재상 균형 판단");
      break;
  }

  if (!chancellorHero) {
    transferMultiplier *= 0.80;
    reasons.push("재상 미임명");
  }

  return {
    transferMultiplier: clamp(transferMultiplier, 0.60, 1.25),
    transferCap: Math.floor(TROOP_REBALANCE_BASE_CAP * clamp(transferMultiplier, 0.60, 1.25)),
    chancellorHeroId: chancellorHero?.id ?? null,
    chancellorHeroName: chancellorHero?.name ?? null,
    chancellorPolicy: domesticPolicy.chancellorPolicy,
    reasons,
  };
}

function getPriorityTier(priority) {
  if (priority >= 8) {
    return "높음";
  }

  if (priority >= 5) {
    return "보통";
  }

  return "낮음";
}

function buildResourceReasons({ city, role, shortageTroops, currentGarrison, targetGarrison }) {
  const reasons = [];
  const foodStatus = city?.military?.foodStatus ?? "";

  reasons.push(`${getRoleLabel(role)} 도시`);

  if (shortageTroops > 0) {
    reasons.push("목표 주둔군 부족");
  } else if (currentGarrison >= targetGarrison && currentGarrison > 0) {
    reasons.push("주둔군 유지");
  }

  if (foodStatus === "부족" || foodStatus === "주의") {
    reasons.push(`군량 ${foodStatus}`);
  }

  if ((city?.resources?.[RESOURCE_KEYS.SALT] ?? 0) <= 1) {
    reasons.push("소금 보존 부담");
  }

  if (getCityLoyalty(city) < 70) {
    reasons.push("성충성도 위험");
  }

  if ((city?.commerceRating ?? 0) >= 4) {
    reasons.push("상업력 높음");
  }

  return reasons;
}

function calculateAllocation(cityResult, routeCount, policyBonus) {
  if (routeCount <= 0) {
    return {
      [RESOURCE_KEYS.GOLD]: 0,
      food: 0,
      [RESOURCE_KEYS.SALT]: 0,
    };
  }

  const commerce = Math.max(1, getNumber(cityResult.commerceRating, 3));
  const garrisonUnits = Math.ceil(cityResult.currentGarrison / 1000);
  const roleWeight = ROLE_PRIORITY_WEIGHT[cityResult.role] ?? 1;
  const base = cityResult.supplyPriority;
  const routeFactor = Math.max(1, Math.min(3, routeCount));
  const gold = Math.round((base * 3 + commerce * 2 + roleWeight * 2 + routeFactor) * policyBonus.goldMultiplier);
  const food = Math.round((base * 4 + garrisonUnits * 2 + roleWeight * 3) * policyBonus.supplyMultiplier);
  const salt = Math.round((base + garrisonUnits + roleWeight + (cityResult.lowSalt ? 2 : 0)) * policyBonus.supplyMultiplier);

  return {
    [RESOURCE_KEYS.GOLD]: Math.max(0, gold),
    food: Math.max(0, food),
    [RESOURCE_KEYS.SALT]: Math.max(0, salt),
  };
}

function mapSupportCandidates(cityResults, cityResult) {
  if (cityResult.shortageTroops <= 0 || cityResult.role === CITY_MILITARY_ROLE_KEYS.REAR) {
    return [];
  }

  return cityResults
    .filter((candidate) => (
      candidate.cityId !== cityResult.cityId
      && candidate.role === CITY_MILITARY_ROLE_KEYS.REAR
      && candidate.surplusTroops > 0
    ))
    .sort((a, b) => b.surplusTroops - a.surplusTroops)
    .map((candidate) => candidate.cityName);
}

function mapNeededSupportTargets(cityResults, cityResult) {
  if (cityResult.surplusTroops <= 0 || cityResult.role !== CITY_MILITARY_ROLE_KEYS.REAR) {
    return [];
  }

  return cityResults
    .filter((candidate) => (
      candidate.cityId !== cityResult.cityId
      && candidate.role !== CITY_MILITARY_ROLE_KEYS.REAR
      && candidate.shortageTroops > 0
    ))
    .sort((a, b) => b.shortageTroops - a.shortageTroops)
    .map((candidate) => candidate.cityName);
}

export function getFactionCities(state, factionId) {
  return (state?.world?.cities ?? []).filter((city) => city?.ownerFactionId === factionId);
}

export function calculateInternalTradeRoutes(state, factionId) {
  const factionCities = getFactionCities(state, factionId);
  const factionCityIds = new Set(factionCities.map((city) => city.id));
  const routes = [];
  const routeKeys = new Set();

  if (factionCities.length < 2) {
    return routes;
  }

  for (const city of factionCities) {
    for (const neighborId of city.neighbors ?? []) {
      if (!factionCityIds.has(neighborId)) {
        continue;
      }

      const routeCityIds = [city.id, neighborId].sort();
      const routeKey = routeCityIds.join(":");

      if (routeKeys.has(routeKey)) {
        continue;
      }

      const targetCity = getCityById(factionCities, neighborId);
      routeKeys.add(routeKey);
      routes.push({
        id: routeKey,
        fromCityId: routeCityIds[0],
        toCityId: routeCityIds[1],
        fromCityName: getCityById(factionCities, routeCityIds[0])?.name ?? routeCityIds[0],
        toCityName: getCityById(factionCities, routeCityIds[1])?.name ?? targetCity?.name ?? routeCityIds[1],
      });
    }
  }

  if (routes.length > 0) {
    return routes;
  }

  for (let i = 0; i < factionCities.length; i += 1) {
    for (let j = i + 1; j < factionCities.length; j += 1) {
      routes.push({
        id: `${factionCities[i].id}:${factionCities[j].id}`,
        fromCityId: factionCities[i].id,
        toCityId: factionCities[j].id,
        fromCityName: factionCities[i].name,
        toCityName: factionCities[j].name,
      });
    }
  }

  return routes;
}

export function classifyCityMilitaryRole(city, allCities = []) {
  const enemyNeighborCount = (city?.neighbors ?? [])
    .map((neighborId) => getCityById(allCities, neighborId))
    .filter((neighbor) => neighbor && neighbor.ownerFactionId !== city?.ownerFactionId)
    .length;

  if (enemyNeighborCount >= 2) {
    return CITY_MILITARY_ROLE_KEYS.FRONTLINE;
  }

  if (enemyNeighborCount >= 1) {
    return CITY_MILITARY_ROLE_KEYS.BORDER;
  }

  return CITY_MILITARY_ROLE_KEYS.REAR;
}

export function calculateTargetGarrison(city, role) {
  const population = getCityPopulation(city);
  const ratio = ROLE_TARGET_GARRISON_RATIO[role] ?? ROLE_TARGET_GARRISON_RATIO[CITY_MILITARY_ROLE_KEYS.REAR];
  const targetByRole = Math.round(population * ratio);

  return Math.max(getSecurityRequiredTroops(city), targetByRole);
}

export function calculateGarrisonSurplusShortage(city, role) {
  const targetGarrison = calculateTargetGarrison(city, role);
  const currentGarrison = getCityGarrison(city);

  return {
    targetGarrison,
    currentGarrison,
    surplusTroops: Math.max(0, currentGarrison - targetGarrison),
    shortageTroops: Math.max(0, targetGarrison - currentGarrison),
  };
}

export function calculateSupplyPriority(city, role) {
  const garrison = calculateGarrisonSurplusShortage(city, role);
  const targetGarrison = Math.max(1, garrison.targetGarrison);
  const currentGarrison = garrison.currentGarrison;
  const foodStatus = city?.military?.foodStatus ?? "";
  const loyalty = getCityLoyalty(city);
  let priority = ROLE_PRIORITY_WEIGHT[role] ?? 1;

  if (garrison.shortageTroops > 0) {
    priority += 2;
  }

  if (currentGarrison >= targetGarrison || currentGarrison >= getCityPopulation(city) * 0.18) {
    priority += 1;
  }

  if (foodStatus === "부족") {
    priority += 2;
  } else if (foodStatus === "주의") {
    priority += 1;
  }

  if ((city?.resources?.[RESOURCE_KEYS.SALT] ?? 0) <= 1) {
    priority += 1;
  }

  if (loyalty < 60) {
    priority += 2;
  } else if (loyalty < 70) {
    priority += 1;
  }

  if ((city?.commerceRating ?? 0) >= 4) {
    priority += 1;
  }

  return priority;
}

export function calculateInternalSupplyNetwork(state, factionId = FACTION_IDS.PLAYER) {
  const factionCities = getFactionCities(state, factionId);
  const routes = calculateInternalTradeRoutes(state, factionId);
  const routeCount = routes.length;
  const baseCityResults = factionCities.map((city) => {
    const role = classifyCityMilitaryRole(city, state?.world?.cities ?? []);
    const garrison = calculateGarrisonSurplusShortage(city, role);
    const supplyPriority = calculateSupplyPriority(city, role);
    const policyBonus = getPolicyBonus(state, city, role);
    const reasons = [
      ...buildResourceReasons({
        city,
        role,
        shortageTroops: garrison.shortageTroops,
        currentGarrison: garrison.currentGarrison,
        targetGarrison: garrison.targetGarrison,
      }),
      ...policyBonus.reasons,
    ];

    return {
      cityId: city.id,
      cityName: city.name,
      role,
      roleLabel: getRoleLabel(role),
      population: getCityPopulation(city),
      commerceRating: city.commerceRating ?? 0,
      targetGarrison: garrison.targetGarrison,
      currentGarrison: garrison.currentGarrison,
      surplusTroops: garrison.surplusTroops,
      shortageTroops: garrison.shortageTroops,
      supplyPriority,
      supplyPriorityLabel: getPriorityTier(supplyPriority),
      lowSalt: (city?.resources?.[RESOURCE_KEYS.SALT] ?? 0) <= 1,
      allocation: calculateAllocation({
        role,
        commerceRating: city.commerceRating ?? 0,
        currentGarrison: garrison.currentGarrison,
        supplyPriority,
        lowSalt: (city?.resources?.[RESOURCE_KEYS.SALT] ?? 0) <= 1,
      }, routeCount, policyBonus),
      reasons: [...new Set(reasons)].slice(0, 6),
    };
  });
  const cityResults = baseCityResults.map((cityResult) => ({
    ...cityResult,
    supportCandidates: mapSupportCandidates(baseCityResults, cityResult),
    supportTargets: mapNeededSupportTargets(baseCityResults, cityResult),
  }));
  const totals = cityResults.reduce(
    (sum, cityResult) => ({
      [RESOURCE_KEYS.GOLD]: sum[RESOURCE_KEYS.GOLD] + (cityResult.allocation?.[RESOURCE_KEYS.GOLD] ?? 0),
      food: sum.food + (cityResult.allocation?.food ?? 0),
      [RESOURCE_KEYS.SALT]: sum[RESOURCE_KEYS.SALT] + (cityResult.allocation?.[RESOURCE_KEYS.SALT] ?? 0),
    }),
    {
      [RESOURCE_KEYS.GOLD]: 0,
      food: 0,
      [RESOURCE_KEYS.SALT]: 0,
    },
  );

  return {
    turn: state?.meta?.turn ?? 1,
    factionId,
    routeCount,
    routes,
    totals,
    cityResults,
  };
}

export function buildCitySupplySummary(result, cityId) {
  return result?.cityResults?.find((entry) => entry.cityId === cityId) ?? null;
}

export function buildFactionSupplySummary(result) {
  const supportNeededCities = (result?.cityResults ?? [])
    .filter((entry) => entry.shortageTroops > 0 && entry.role !== CITY_MILITARY_ROLE_KEYS.REAR)
    .map((entry) => entry.cityName);

  return {
    routeCount: result?.routeCount ?? 0,
    totals: result?.totals ?? {
      [RESOURCE_KEYS.GOLD]: 0,
      food: 0,
      [RESOURCE_KEYS.SALT]: 0,
    },
    supportNeededCities,
  };
}

export function applyInternalSupplyNetwork(state, factionId = FACTION_IDS.PLAYER) {
  const result = calculateInternalSupplyNetwork(state, factionId);
  const goldBonus = result.totals[RESOURCE_KEYS.GOLD] ?? 0;

  return {
    ...state,
    resources: {
      ...(state?.resources ?? {}),
      [RESOURCE_KEYS.GOLD]: (state?.resources?.[RESOURCE_KEYS.GOLD] ?? 0) + goldBonus,
    },
    world: {
      ...state.world,
      lastSupplyNetworkResult: result,
    },
  };
}

function getRebalanceReceiverScore(cityResult, city) {
  const roleScore = ROLE_PRIORITY_WEIGHT[cityResult.role] ?? 1;
  const governorScore = city?.governorPolicy === GOVERNOR_POLICY_KEYS.MILITARY ? 1 : 0;

  return (roleScore * 10) + (cityResult.supplyPriority ?? 0) + governorScore;
}

function getRebalanceSenderScore(cityResult, city) {
  const rearBonus = cityResult.role === CITY_MILITARY_ROLE_KEYS.REAR ? 20 : 0;
  const governorBonus = [GOVERNOR_POLICY_KEYS.AGRICULTURE, GOVERNOR_POLICY_KEYS.COMMERCE]
    .includes(city?.governorPolicy)
    ? 1
    : 0;

  return rearBonus + governorBonus + Math.floor((cityResult.surplusTroops ?? 0) / 1000);
}

function buildTroopRebalanceReason(sender, receiver, policy) {
  const parts = [
    `${receiver.roleLabel} 목표 주둔군 부족`,
    `${sender.roleLabel} 잉여 주둔군`,
    ...policy.reasons,
  ];

  return [...new Set(parts)].slice(0, 4).join(" · ");
}

export function calculateInternalTroopRebalancePlan(
  state,
  factionId = FACTION_IDS.PLAYER,
  supplyResult = null,
) {
  const result = supplyResult ?? calculateInternalSupplyNetwork(state, factionId);
  const cityById = new Map((state?.world?.cities ?? []).map((city) => [city.id, city]));
  const policy = getTroopRebalancePolicy(state, factionId);
  const cityStatus = new Map((result?.cityResults ?? []).map((cityResult) => [
    cityResult.cityId,
    {
      ...cityResult,
      currentGarrison: Math.max(0, Number(cityResult.currentGarrison) || 0),
      targetGarrison: Math.max(0, Number(cityResult.targetGarrison) || 0),
    },
  ]));
  const senders = [...cityStatus.values()]
    .filter((entry) => entry.surplusTroops > 0)
    .sort((a, b) => {
      const cityA = cityById.get(a.cityId);
      const cityB = cityById.get(b.cityId);
      return getRebalanceSenderScore(b, cityB) - getRebalanceSenderScore(a, cityA);
    });
  const receivers = [...cityStatus.values()]
    .filter((entry) => entry.shortageTroops > 0)
    .sort((a, b) => {
      const cityA = cityById.get(a.cityId);
      const cityB = cityById.get(b.cityId);
      return getRebalanceReceiverScore(b, cityB) - getRebalanceReceiverScore(a, cityA);
    });
  const transfers = [];

  for (const receiverSeed of receivers) {
    const receiver = cityStatus.get(receiverSeed.cityId);
    const receiverCity = cityById.get(receiver.cityId);

    if (!receiverCity || receiverCity.ownerFactionId !== factionId) {
      continue;
    }

    for (const senderSeed of senders) {
      const sender = cityStatus.get(senderSeed.cityId);
      const senderCity = cityById.get(sender.cityId);

      if (!senderCity || senderCity.ownerFactionId !== factionId || sender.cityId === receiver.cityId) {
        continue;
      }

      const senderSurplus = Math.max(0, sender.currentGarrison - sender.targetGarrison);
      const receiverTargetRoom = Math.max(0, receiver.targetGarrison - receiver.currentGarrison);
      const receiverPopulationRoom = Math.max(0, getMaxGarrisonByPopulation(receiverCity) - receiver.currentGarrison);
      const receiverShortage = Math.min(receiverTargetRoom, receiverPopulationRoom);
      const rawTransferAmount = Math.min(
        senderSurplus * 0.5,
        receiverShortage * 0.5,
        policy.transferCap,
      );
      const amount = floorToHundreds(rawTransferAmount);

      if (amount < TROOP_REBALANCE_MIN_TRANSFER) {
        continue;
      }

      const beforeFromGarrison = sender.currentGarrison;
      const beforeToGarrison = receiver.currentGarrison;
      sender.currentGarrison -= amount;
      receiver.currentGarrison += amount;
      sender.surplusTroops = Math.max(0, sender.currentGarrison - sender.targetGarrison);
      sender.shortageTroops = Math.max(0, sender.targetGarrison - sender.currentGarrison);
      receiver.surplusTroops = Math.max(0, receiver.currentGarrison - receiver.targetGarrison);
      receiver.shortageTroops = Math.max(0, receiver.targetGarrison - receiver.currentGarrison);

      transfers.push({
        fromCityId: sender.cityId,
        fromCityName: sender.cityName,
        toCityId: receiver.cityId,
        toCityName: receiver.cityName,
        amount,
        reason: buildTroopRebalanceReason(sender, receiver, policy),
        beforeFromGarrison,
        afterFromGarrison: sender.currentGarrison,
        beforeToGarrison,
        afterToGarrison: receiver.currentGarrison,
      });

      if (receiver.currentGarrison >= receiver.targetGarrison) {
        break;
      }
    }
  }

  return {
    turn: state?.meta?.turn ?? 1,
    factionId,
    transfers,
    totalMoved: transfers.reduce((total, transfer) => total + transfer.amount, 0),
    policy,
  };
}

export function applyInternalTroopRebalance(
  state,
  factionId = FACTION_IDS.PLAYER,
  supplyResult = null,
) {
  if (
    state?.mode !== "world"
    || state?.battle
    || state?.pendingBattleChoice
    || state?.pendingHeroDeployment
    || state?.pendingHeroTransfer
    || state?.world?.pendingEnemyTurnResult
  ) {
    return {
      ...state,
      world: {
        ...state.world,
        lastTroopRebalanceResult: {
          turn: state?.meta?.turn ?? 1,
          factionId,
          transfers: [],
          totalMoved: 0,
          skipped: true,
          reason: "pending_world_interaction",
        },
      },
    };
  }

  const result = calculateInternalTroopRebalancePlan(state, factionId, supplyResult);

  if (result.transfers.length === 0) {
    return {
      ...state,
      world: {
        ...state.world,
        lastTroopRebalanceResult: result,
      },
    };
  }

  const deltaByCityId = new Map();
  for (const transfer of result.transfers) {
    deltaByCityId.set(transfer.fromCityId, (deltaByCityId.get(transfer.fromCityId) ?? 0) - transfer.amount);
    deltaByCityId.set(transfer.toCityId, (deltaByCityId.get(transfer.toCityId) ?? 0) + transfer.amount);
  }

  const nextCities = (state?.world?.cities ?? []).map((city) => {
    const delta = deltaByCityId.get(city.id) ?? 0;

    if (delta === 0) {
      return city;
    }

    return {
      ...city,
      military: {
        ...(city.military ?? {}),
        garrisonTroops: Math.max(0, getCityGarrison(city) + delta),
      },
    };
  });
  const nextState = {
    ...state,
    world: {
      ...state.world,
      cities: nextCities,
      lastTroopRebalanceResult: result,
    },
  };

  return {
    ...nextState,
    world: {
      ...nextState.world,
      lastSupplyNetworkResult: calculateInternalSupplyNetwork(nextState, factionId),
    },
  };
}

export function buildCityTroopRebalanceSummary(result, cityId) {
  const transfers = result?.transfers ?? [];

  return {
    sent: transfers.filter((transfer) => transfer.fromCityId === cityId),
    received: transfers.filter((transfer) => transfer.toCityId === cityId),
  };
}
