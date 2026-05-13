import {
  adjustLoyaltyDelta,
  applyIncomeMultipliers,
  buildChancellorEffectSummary,
  buildGovernorEffectSummary,
  calculateCityDomesticEffects,
  calculateCityLoyaltyDrift,
  calculateMilitaryPreview,
  calculateNationalDomesticEffects,
  getActiveChancellorHero,
  getActiveGovernorHero,
} from "./domestic_effects.js";
import {
  CHANCELLOR_POLICY_EFFECTS,
  CHANCELLOR_POLICY_KEYS,
  COMMERCE_TAX_POINT_PER_RATING,
  DOMESTIC_INCOME_RULES,
  DOMESTIC_TAX_RULES,
  FACTION_IDS,
  HERO_UPKEEP_RULES,
  INITIAL_ENEMY_RESOURCE_STOCK,
  INITIAL_RESOURCE_STOCK,
  LOYALTY_KEYS,
  POPULATION_TAX_POINT_PER_RATING,
  RESOURCE_KEYS,
  SALT_PRESERVATION_RULES,
  SEASON_KEYS,
  SOLDIER_UPKEEP_RULES,
  TAX_POINT_TO_GOLD,
  WAREHOUSE_CAPACITY,
  WAREHOUSE_STATUS_THRESHOLDS,
} from "../constants.js";
import { deriveCalendarFromTurn } from "./world_calendar.js";

export const RESOURCE_STOCK_KEYS = Object.freeze([
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.SEAFOOD,
  RESOURCE_KEYS.WOOD,
  RESOURCE_KEYS.IRON,
  RESOURCE_KEYS.HORSES,
  RESOURCE_KEYS.SILK,
  RESOURCE_KEYS.SALT,
  RESOURCE_KEYS.GOLD,
]);

function getRating(source, key) {
  const value = source?.[key] ?? 0;
  return Number.isFinite(value) ? value : 0;
}

function createEmptyIncomeTotals() {
  return {
    [RESOURCE_KEYS.RICE]: 0,
    [RESOURCE_KEYS.BARLEY]: 0,
    [RESOURCE_KEYS.SEAFOOD]: 0,
    [RESOURCE_KEYS.GOLD]: 0,
  };
}

function roundResourceAmount(amount) {
  return Math.max(0, Math.round(amount));
}

function roundDiscountedAmount(amount, multiplier) {
  const adjustedAmount = amount * multiplier;

  if (multiplier < 1 && adjustedAmount < amount) {
    return Math.max(0, Math.floor(adjustedAmount));
  }

  return roundResourceAmount(adjustedAmount);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function addDetail(details, resource, amount, reason, city) {
  if (amount <= 0) {
    return;
  }

  details.push({
    cityId: city.id,
    cityName: city.name,
    resource,
    amount,
    reason,
  });
}

function createTaxEffect(baseTotals, totals, taxLevel) {
  const normalizedTaxLevel = normalizeTaxLevel(taxLevel);
  const goldMultiplier = getTaxGoldMultiplier(normalizedTaxLevel);
  const goldBeforeTax = baseTotals[RESOURCE_KEYS.GOLD] ?? 0;
  const goldAfterTax = totals[RESOURCE_KEYS.GOLD] ?? 0;

  return {
    taxLevel: normalizedTaxLevel,
    goldMultiplier,
    loyaltyDelta: getTaxLoyaltyDelta(normalizedTaxLevel),
    goldBeforeTax,
    goldAfterTax,
    goldDelta: goldAfterTax - goldBeforeTax,
    formula: "population_commerce_tax",
  };
}

function createChancellorPolicyEffect(policy, before, after) {
  const normalizedPolicy = normalizeChancellorPolicy(policy);

  return {
    policy: normalizedPolicy,
    effect: getChancellorPolicyEffect(normalizedPolicy),
    before,
    after,
  };
}

function createResourceStockFromDefaults(defaults) {
  return Object.fromEntries(
    RESOURCE_STOCK_KEYS.map((resourceKey) => [resourceKey, defaults?.[resourceKey] ?? 0]),
  );
}

function normalizeStockWithDefaults(resources = {}, defaults = INITIAL_RESOURCE_STOCK) {
  return {
    ...createResourceStockFromDefaults(defaults),
    ...(resources ?? {}),
  };
}

function isActiveHero(hero) {
  return Boolean(hero)
    && hero.dead !== true
    && hero.isDead !== true
    && hero.retired !== true
    && hero.isRetired !== true
    && hero.active !== false;
}

function matchesFactionForAggregate(factionId, targetFactionId) {
  if (targetFactionId === FACTION_IDS.ENEMY) {
    return Boolean(factionId) && factionId !== FACTION_IDS.PLAYER;
  }

  return factionId === targetFactionId;
}

function isEligibleChancellorHero(hero, playerFactionId = FACTION_IDS.PLAYER) {
  return isActiveHero(hero) && hero?.side === playerFactionId;
}

function getShortageEntries(shortage) {
  return Object.entries(shortage)
    .filter(([, amount]) => amount > 0)
    .map(([resource, amount]) => ({ resource, amount }));
}

function getWarehouseStatusLabel(amount, capacity) {
  if (capacity <= 0) {
    return "안정";
  }

  const ratio = amount / capacity;

  if (ratio > WAREHOUSE_STATUS_THRESHOLDS.FULL_MAX_RATIO) {
    return "과잉";
  }

  if (ratio <= WAREHOUSE_STATUS_THRESHOLDS.LOW_MAX_RATIO) {
    return "부족";
  }

  if (ratio <= WAREHOUSE_STATUS_THRESHOLDS.STABLE_MAX_RATIO) {
    return "안정";
  }

  return "충분";
}

export function createInitialResourceStock() {
  return createResourceStockFromDefaults(INITIAL_RESOURCE_STOCK);
}

export function createInitialEnemyResourceStock() {
  return createResourceStockFromDefaults(INITIAL_ENEMY_RESOURCE_STOCK);
}

export function normalizeResourceStock(resources = {}) {
  return normalizeStockWithDefaults(resources, INITIAL_RESOURCE_STOCK);
}

export function normalizeEnemyResourceStock(resources = {}) {
  return normalizeStockWithDefaults(resources, INITIAL_ENEMY_RESOURCE_STOCK);
}

export function normalizeTaxLevel(taxLevel) {
  const numericTaxLevel = Number(taxLevel);

  if (!Number.isFinite(numericTaxLevel)) {
    return DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL;
  }

  return clamp(
    Math.round(numericTaxLevel),
    DOMESTIC_TAX_RULES.MIN_TAX_LEVEL,
    DOMESTIC_TAX_RULES.MAX_TAX_LEVEL,
  );
}

export function normalizeChancellorPolicy(policy) {
  if (Object.values(CHANCELLOR_POLICY_KEYS).includes(policy)) {
    return policy;
  }

  return CHANCELLOR_POLICY_KEYS.BALANCED;
}

export function getEligibleChancellorHeroes(heroes = [], playerFactionId = FACTION_IDS.PLAYER) {
  return (heroes ?? []).filter((hero) => isEligibleChancellorHero(hero, playerFactionId));
}

export function normalizeChancellorHeroId(
  chancellorHeroId,
  heroes = [],
  playerFactionId = FACTION_IDS.PLAYER,
) {
  if (!chancellorHeroId) {
    return null;
  }

  return getEligibleChancellorHeroes(heroes, playerFactionId)
    .some((hero) => hero.id === chancellorHeroId)
    ? chancellorHeroId
    : null;
}

export function createInitialDomesticPolicy() {
  return {
    taxLevel: DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL,
    chancellorPolicy: CHANCELLOR_POLICY_KEYS.BALANCED,
    chancellorHeroId: null,
  };
}

export function normalizeDomesticPolicy(
  domesticPolicy = {},
  heroes = [],
  playerFactionId = FACTION_IDS.PLAYER,
) {
  return {
    ...createInitialDomesticPolicy(),
    ...(domesticPolicy ?? {}),
    taxLevel: normalizeTaxLevel(domesticPolicy?.taxLevel),
    chancellorPolicy: normalizeChancellorPolicy(domesticPolicy?.chancellorPolicy),
    chancellorHeroId: normalizeChancellorHeroId(domesticPolicy?.chancellorHeroId, heroes, playerFactionId),
  };
}

export function getChancellorPolicyEffect(policy) {
  const normalizedPolicy = normalizeChancellorPolicy(policy);

  return CHANCELLOR_POLICY_EFFECTS[normalizedPolicy]
    ?? CHANCELLOR_POLICY_EFFECTS[CHANCELLOR_POLICY_KEYS.BALANCED];
}

export function getTaxGoldMultiplier(taxLevel) {
  const normalizedTaxLevel = normalizeTaxLevel(taxLevel);

  if (normalizedTaxLevel <= DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL) {
    return DOMESTIC_TAX_RULES.MIN_GOLD_MULTIPLIER
      + (normalizedTaxLevel / DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL)
      * (DOMESTIC_TAX_RULES.BASE_GOLD_MULTIPLIER - DOMESTIC_TAX_RULES.MIN_GOLD_MULTIPLIER);
  }

  return DOMESTIC_TAX_RULES.BASE_GOLD_MULTIPLIER
    + ((normalizedTaxLevel - DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL)
    / (DOMESTIC_TAX_RULES.MAX_TAX_LEVEL - DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL))
    * (DOMESTIC_TAX_RULES.MAX_GOLD_MULTIPLIER - DOMESTIC_TAX_RULES.BASE_GOLD_MULTIPLIER);
}

export function getTaxLoyaltyDelta(taxLevel) {
  const normalizedTaxLevel = normalizeTaxLevel(taxLevel);

  if (normalizedTaxLevel > DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL) {
    return -Math.ceil((normalizedTaxLevel - DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL) / 25);
  }

  if (normalizedTaxLevel < DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL) {
    return Math.ceil((DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL - normalizedTaxLevel) / 30);
  }

  return 0;
}

export function normalizePopulationRating(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 3;
  }

  return clamp(Math.round(numericValue), 1, 5);
}

export function getCityTaxBasePoints(city) {
  const populationTaxPoints = normalizePopulationRating(city?.populationRating)
    * POPULATION_TAX_POINT_PER_RATING;
  const commerceTaxPoints = getRating(city, "commerceRating") * COMMERCE_TAX_POINT_PER_RATING;

  return {
    populationTaxPoints,
    commerceTaxPoints,
    baseTaxPoints: populationTaxPoints + commerceTaxPoints,
  };
}

export function calculateCityTaxableValue(city) {
  const taxBase = getCityTaxBasePoints(city);

  return {
    ...taxBase,
    taxableValue: taxBase.baseTaxPoints * TAX_POINT_TO_GOLD,
  };
}

export function calculateCityGoldTaxIncome(city, taxLevel) {
  const taxableValue = calculateCityTaxableValue(city);
  const goldMultiplier = getTaxGoldMultiplier(taxLevel);

  return {
    ...taxableValue,
    taxLevel: normalizeTaxLevel(taxLevel),
    goldMultiplier,
    gold: Math.round(taxableValue.taxableValue * goldMultiplier),
  };
}

export function applyTaxToIncomeTotals(totals, taxLevel, ownedCities = []) {
  const gold = ownedCities.reduce(
    (total, city) => total + calculateCityGoldTaxIncome(city, taxLevel).gold,
    0,
  );

  return {
    ...totals,
    [RESOURCE_KEYS.GOLD]: gold,
  };
}

export function applyChancellorPolicyToIncomeTotals(totals, policy) {
  const effect = getChancellorPolicyEffect(policy);

  return {
    ...totals,
    [RESOURCE_KEYS.RICE]: roundResourceAmount(
      (totals[RESOURCE_KEYS.RICE] ?? 0) * effect.incomeMultiplier * effect.riceMultiplier,
    ),
    [RESOURCE_KEYS.BARLEY]: roundResourceAmount(
      (totals[RESOURCE_KEYS.BARLEY] ?? 0) * effect.incomeMultiplier * effect.barleyMultiplier,
    ),
    [RESOURCE_KEYS.SEAFOOD]: roundResourceAmount(
      (totals[RESOURCE_KEYS.SEAFOOD] ?? 0) * effect.incomeMultiplier * effect.seafoodMultiplier,
    ),
    [RESOURCE_KEYS.GOLD]: roundResourceAmount(
      (totals[RESOURCE_KEYS.GOLD] ?? 0) * effect.incomeMultiplier * effect.goldMultiplier,
    ),
  };
}

function applyCityEffectsToDetails(details, beforeIncome, afterIncome) {
  return details.map((detail) => {
    const beforeAmount = beforeIncome[detail.resource] ?? 0;
    const afterAmount = afterIncome[detail.resource] ?? 0;
    const ratio = beforeAmount > 0 ? afterAmount / beforeAmount : 1;

    return {
      ...detail,
      amount: roundResourceAmount(detail.amount * ratio),
    };
  });
}

export function calculateCityTurnIncome(
  city,
  calendar,
  taxLevel = DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL,
  options = {},
) {
  const resources = city?.resources ?? {};
  const income = createEmptyIncomeTotals();
  const details = [];
  const cityEffects = options.cityEffects ?? null;
  const seafoodIncome = getRating(resources, RESOURCE_KEYS.SEAFOOD)
    * DOMESTIC_INCOME_RULES.SEAFOOD_PER_RATING_PER_TURN;
  const goldTaxIncome = calculateCityGoldTaxIncome(city, taxLevel);

  income[RESOURCE_KEYS.SEAFOOD] += seafoodIncome;
  income[RESOURCE_KEYS.GOLD] += goldTaxIncome.gold;
  addDetail(details, RESOURCE_KEYS.SEAFOOD, seafoodIncome, "매턴 수산물", city);
  addDetail(details, RESOURCE_KEYS.GOLD, goldTaxIncome.gold, "인구·상업세", city);

  if (calendar?.season === SEASON_KEYS.SPRING) {
    const barleyIncome = getRating(resources, RESOURCE_KEYS.BARLEY)
      * DOMESTIC_INCOME_RULES.BARLEY_PER_RATING_IN_SPRING;
    income[RESOURCE_KEYS.BARLEY] += barleyIncome;
    addDetail(details, RESOURCE_KEYS.BARLEY, barleyIncome, "봄 보리 수입", city);
  }

  if (calendar?.season === SEASON_KEYS.AUTUMN) {
    const riceIncome = getRating(resources, RESOURCE_KEYS.RICE)
      * DOMESTIC_INCOME_RULES.RICE_PER_RATING_IN_AUTUMN;
    income[RESOURCE_KEYS.RICE] += riceIncome;
    addDetail(details, RESOURCE_KEYS.RICE, riceIncome, "가을 쌀 수입", city);
  }

  const adjustedIncome = cityEffects ? applyIncomeMultipliers(income, cityEffects) : income;
  const adjustedDetails = cityEffects
    ? applyCityEffectsToDetails(details, income, adjustedIncome)
    : details;

  return {
    ...adjustedIncome,
    baseIncome: income,
    cityEffects,
    tax: {
      ...goldTaxIncome,
      baseGold: goldTaxIncome.gold,
      gold: adjustedIncome[RESOURCE_KEYS.GOLD],
    },
    details: adjustedDetails,
  };
}

export function calculatePlayerTurnIncome(state) {
  const calendar = deriveCalendarFromTurn(state?.meta?.turn);
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;
  const baseTotals = createEmptyIncomeTotals();
  const cityIncomes = [];
  const details = [];
  const domesticPolicy = normalizeDomesticPolicy(
    state?.domesticPolicy,
    state?.world?.heroes,
    playerFactionId,
  );
  const ownedCities = (state?.world?.cities ?? []).filter((city) => city.ownerFactionId === playerFactionId);
  const chancellorHero = getActiveChancellorHero(state?.world?.heroes, domesticPolicy, playerFactionId);
  const nationalEffects = calculateNationalDomesticEffects({ chancellorHero, domesticPolicy });
  const cityEffectsById = {};

  for (const city of ownedCities) {
    const governorHero = getActiveGovernorHero(city, state?.world?.heroes, playerFactionId);
    const cityEffects = calculateCityDomesticEffects({
      city,
      governorHero,
      chancellorHero,
      domesticPolicy,
    });
    const cityIncome = calculateCityTurnIncome(city, calendar, domesticPolicy.taxLevel, {
      cityEffects,
    });
    cityEffectsById[city.id] = {
      cityId: city.id,
      cityName: city.name,
      governorHeroId: governorHero?.id ?? null,
      governorHeroName: governorHero?.name ?? null,
      effectSummary: buildGovernorEffectSummary(governorHero, cityEffects),
      effects: cityEffects,
    };
    cityIncomes.push({
      cityId: city.id,
      cityName: city.name,
      governorHeroId: governorHero?.id ?? null,
      effectSummary: cityEffectsById[city.id].effectSummary,
      income: cityIncome,
    });

    for (const resourceKey of Object.keys(baseTotals)) {
      baseTotals[resourceKey] += cityIncome[resourceKey] ?? 0;
    }

    details.push(...cityIncome.details);
  }

  const baseTotalsAtNormalTax = {
    ...baseTotals,
    [RESOURCE_KEYS.GOLD]: ownedCities.reduce(
      (total, city) => {
        const normalTaxIncome = calculateCityTurnIncome(city, calendar, DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL, {
          cityEffects: cityEffectsById[city.id]?.effects,
        });
        return total + normalTaxIncome[RESOURCE_KEYS.GOLD];
      },
      0,
    ),
  };
  const taxedTotals = baseTotals;
  const policyTotals = applyChancellorPolicyToIncomeTotals(taxedTotals, domesticPolicy.chancellorPolicy);
  const totals = applyIncomeMultipliers(policyTotals, nationalEffects);
  const tax = createTaxEffect(baseTotalsAtNormalTax, taxedTotals, domesticPolicy.taxLevel);
  const chancellorPolicy = createChancellorPolicyEffect(
    domesticPolicy.chancellorPolicy,
    taxedTotals,
    policyTotals,
  );

  return {
    turn: state?.meta?.turn ?? 1,
    calendar,
    baseTotals: baseTotalsAtNormalTax,
    totals,
    tax,
    chancellorPolicy,
    cityIncomes,
    details,
    nationalEffects: {
      chancellorHeroId: chancellorHero?.id ?? null,
      chancellorHeroName: chancellorHero?.name ?? null,
      effectSummary: buildChancellorEffectSummary(chancellorHero, nationalEffects),
      effects: nationalEffects,
    },
    cityEffectsById,
  };
}

export function applyTaxLoyaltyEffect(state) {
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;
  const domesticPolicy = normalizeDomesticPolicy(
    state?.domesticPolicy,
    state?.world?.heroes,
    playerFactionId,
  );
  const loyaltyDelta = getTaxLoyaltyDelta(domesticPolicy.taxLevel);
  const chancellorHero = getActiveChancellorHero(state?.world?.heroes, domesticPolicy, playerFactionId);
  const nationalEffects = calculateNationalDomesticEffects({ chancellorHero, domesticPolicy });
  const nationalLoyaltyDelta = adjustLoyaltyDelta(
    loyaltyDelta,
    nationalEffects.nationalLoyaltyLossMultiplier,
  );

  const cityLoyaltyDeltas = {};
  const cityResults = [];
  const nextCities = (state?.world?.cities ?? []).map((city) => {
    if (city.ownerFactionId !== playerFactionId) {
      return city;
    }

    const governorHero = getActiveGovernorHero(city, state?.world?.heroes, playerFactionId);
    const cityEffects = calculateCityDomesticEffects({
      city,
      governorHero,
      chancellorHero,
      domesticPolicy,
    });
    const cityIncome = state?.world?.lastIncomeResult?.cityIncomes
      ?.find((entry) => entry.cityId === city.id)
      ?.income ?? null;
    const drift = calculateCityLoyaltyDrift({
      city,
      heroes: state?.world?.heroes,
      taxLoyaltyDelta: loyaltyDelta,
      cityEffects,
      cityIncome,
      governorHero,
      chancellorHero,
    });
    const beforeLoyalty = city[LOYALTY_KEYS.CITY] ?? city.loyalty ?? 75;
    const afterLoyalty = clamp(beforeLoyalty + drift.delta, 0, 100);
    const cityLoyaltyDelta = afterLoyalty - beforeLoyalty;
    cityLoyaltyDeltas[city.id] = cityLoyaltyDelta;
    cityResults.push({
      cityId: city.id,
      cityName: city.name,
      beforeLoyalty,
      afterLoyalty,
      delta: cityLoyaltyDelta,
      taxDelta: drift.taxDelta,
      securityStatus: drift.security.securityStatus,
      securityScore: drift.security.securityScore,
      securityTroops: drift.security.securityTroops,
      garrisonTroops: drift.security.garrisonTroops,
      stationedHeroTroops: drift.security.stationedHeroTroops,
      securityRequiredTroops: drift.security.securityRequiredTroops,
      recruitmentRatio: drift.security.recruitmentRatio,
      militaryBurdenStatus: drift.militaryBurden.status,
      militaryBurdenDelta: drift.militaryBurden.loyaltyDeltaFromMilitaryBurden,
      stationedTroops: drift.security.troopTotal,
      economyStatus: drift.economy.economyStatus,
      economyScore: drift.economy.economyScore,
      controlDelta: drift.controlDelta,
      reasons: drift.reasons,
      summary: drift.summary,
    });

    return {
      ...city,
      [LOYALTY_KEYS.CITY]: afterLoyalty,
      economyStatus: drift.economy.economyStatus,
      military: {
        ...(city.military ?? {}),
        securityStatus: drift.security.securityStatus,
      },
    };
  });

  return {
    ...state,
    meta: {
      ...state.meta,
      [LOYALTY_KEYS.NATIONAL]: clamp(
        (state?.meta?.[LOYALTY_KEYS.NATIONAL] ?? 75) + nationalLoyaltyDelta,
        0,
        100,
      ),
    },
    world: {
      ...state.world,
      cities: nextCities,
      lastTaxResult: {
        taxLevel: domesticPolicy.taxLevel,
        loyaltyDelta,
        nationalLoyaltyDelta,
        cityLoyaltyDeltas,
      },
      lastCityLoyaltyResult: {
        turn: state?.meta?.turn ?? 1,
        taxLevel: domesticPolicy.taxLevel,
        cityResults,
      },
    },
  };
}

export function calculateHeroUpkeep(heroes = [], side = FACTION_IDS.PLAYER) {
  const activeHeroes = (heroes ?? []).filter((hero) => matchesFactionForAggregate(hero.side, side) && isActiveHero(hero));
  const cost = Object.fromEntries(
    Object.entries(HERO_UPKEEP_RULES).map(([resourceKey, amount]) => [
      resourceKey,
      activeHeroes.length * amount,
    ]),
  );

  return {
    side,
    heroCount: activeHeroes.length,
    cost,
    details: Object.entries(cost)
      .filter(([, amount]) => amount > 0)
      .map(([resource, amount]) => ({
        resource,
        amount,
        reason: "영웅 유지비",
      })),
  };
}

export function applyChancellorPolicyToHeroUpkeep(upkeep, policy, nationalEffects = {}) {
  const effect = getChancellorPolicyEffect(policy);
  const cost = Object.fromEntries(
    Object.entries(upkeep?.cost ?? {}).map(([resourceKey, amount]) => {
      const multiplier = effect.heroUpkeepMultiplier * (nationalEffects.heroUpkeepMultiplier ?? 1);

      return [
        resourceKey,
        roundDiscountedAmount(amount, multiplier),
      ];
    }),
  );

  return {
    ...upkeep,
    baseCost: upkeep?.cost ?? {},
    cost,
    chancellorPolicy: normalizeChancellorPolicy(policy),
    nationalEffects,
  };
}

export function applyHeroUpkeep(
  resources,
  heroes = [],
  side = FACTION_IDS.PLAYER,
  chancellorPolicy = null,
  nationalEffects = {},
) {
  const baseUpkeep = calculateHeroUpkeep(heroes, side);
  const upkeep = chancellorPolicy
    ? applyChancellorPolicyToHeroUpkeep(baseUpkeep, chancellorPolicy, nationalEffects)
    : baseUpkeep;
  const currentResources = side === FACTION_IDS.ENEMY
    ? normalizeEnemyResourceStock(resources)
    : normalizeResourceStock(resources);
  const nextResources = { ...currentResources };
  const shortage = {};

  for (const [resourceKey, amount] of Object.entries(upkeep.cost)) {
    const currentAmount = nextResources[resourceKey] ?? 0;
    const nextAmount = currentAmount - amount;

    if (nextAmount < 0) {
      shortage[resourceKey] = Math.abs(nextAmount);
      nextResources[resourceKey] = 0;
    } else {
      shortage[resourceKey] = 0;
      nextResources[resourceKey] = nextAmount;
    }
  }

  return {
    resources: nextResources,
    upkeep,
    shortage,
    shortageEntries: getShortageEntries(shortage),
  };
}

export function calculateSoldierUpkeepPreview(state, side = FACTION_IDS.PLAYER) {
  const heroTroopCount = (state?.world?.heroes ?? [])
    .filter((hero) => matchesFactionForAggregate(hero.side, side) && isActiveHero(hero))
    .reduce((total, hero) => total + Math.max(0, Number(hero.troops) || 0), 0);
  const garrisonTroopCount = (state?.world?.cities ?? [])
    .filter((city) => matchesFactionForAggregate(city?.ownerFactionId, side))
    .reduce((total, city) => total + Math.max(0, Number(city?.military?.garrisonTroops) || 0), 0);
  const troopCount = heroTroopCount + garrisonTroopCount;
  const unitCount = troopCount > 0
    ? Math.ceil(troopCount / SOLDIER_UPKEEP_RULES.TROOPS_PER_UNIT)
    : 0;

  return {
    side,
    heroTroopCount,
    garrisonTroopCount,
    troopCount,
    unitCount,
    applied: false,
    cost: {
      [RESOURCE_KEYS.RICE]: unitCount * SOLDIER_UPKEEP_RULES[RESOURCE_KEYS.RICE],
      [RESOURCE_KEYS.BARLEY]: unitCount * SOLDIER_UPKEEP_RULES[RESOURCE_KEYS.BARLEY],
      [RESOURCE_KEYS.SEAFOOD]: unitCount * SOLDIER_UPKEEP_RULES[RESOURCE_KEYS.SEAFOOD],
    },
  };
}

export function applyChancellorPolicyToSoldierUpkeepPreview(preview, policy, nationalEffects = {}) {
  const effect = getChancellorPolicyEffect(policy);
  const cost = Object.fromEntries(
    Object.entries(preview?.cost ?? {}).map(([resourceKey, amount]) => {
      const multiplier = effect.soldierUpkeepPreviewMultiplier * (nationalEffects.soldierUpkeepPreviewMultiplier ?? 1);

      return [
        resourceKey,
        roundDiscountedAmount(amount, multiplier),
      ];
    }),
  );

  return {
    ...preview,
    baseCost: preview?.cost ?? {},
    cost,
    chancellorPolicy: normalizeChancellorPolicy(policy),
    nationalEffects,
  };
}

export function calculateSaltPreservationNeed(
  resources = {},
  policy = CHANCELLOR_POLICY_KEYS.BALANCED,
  nationalEffects = {},
) {
  const stock = normalizeResourceStock(resources);
  const baseNeeded = Math.ceil(
    ((stock[RESOURCE_KEYS.RICE] ?? 0) + (stock[RESOURCE_KEYS.BARLEY] ?? 0))
      * SALT_PRESERVATION_RULES.FOOD_SALT_RATIO
    + (stock[RESOURCE_KEYS.SEAFOOD] ?? 0) * SALT_PRESERVATION_RULES.SEAFOOD_SALT_RATIO,
  );
  const needed = applyChancellorPolicyToSaltPreservationNeed(
    { needed: baseNeeded, currentSalt: stock[RESOURCE_KEYS.SALT] ?? 0 },
    policy,
    nationalEffects,
  ).needed;
  const currentSalt = stock[RESOURCE_KEYS.SALT] ?? 0;

  return {
    baseNeeded,
    needed,
    currentSalt,
    status: currentSalt >= needed ? "안정" : "부족",
    applied: false,
    chancellorPolicy: normalizeChancellorPolicy(policy),
    nationalEffects,
  };
}

export function applyChancellorPolicyToSaltPreservationNeed(saltNeed, policy, nationalEffects = {}) {
  const effect = getChancellorPolicyEffect(policy);
  const needed = Math.max(0, Math.ceil(
    (saltNeed?.needed ?? 0)
    * effect.saltPreservationMultiplier
    * (nationalEffects.saltPreservationMultiplier ?? 1),
  ));
  const currentSalt = saltNeed?.currentSalt ?? 0;

  return {
    ...saltNeed,
    baseNeeded: saltNeed?.baseNeeded ?? saltNeed?.needed ?? 0,
    needed,
    currentSalt,
    status: currentSalt >= needed ? "안정" : "부족",
    applied: false,
    chancellorPolicy: normalizeChancellorPolicy(policy),
    nationalEffects,
  };
}

export function getWarehouseStatus(resources = {}) {
  const stock = normalizeResourceStock(resources);

  return Object.fromEntries(
    RESOURCE_STOCK_KEYS.map((resourceKey) => {
      const amount = stock[resourceKey] ?? 0;
      const capacity = WAREHOUSE_CAPACITY[resourceKey] ?? 0;

      return [resourceKey, {
        resource: resourceKey,
        amount,
        capacity,
        ratio: capacity > 0 ? amount / capacity : 0,
        status: getWarehouseStatusLabel(amount, capacity),
      }];
    }),
  );
}

export function applyTurnUpkeep(state) {
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;
  const domesticPolicy = normalizeDomesticPolicy(
    state?.domesticPolicy,
    state?.world?.heroes,
    playerFactionId,
  );
  const chancellorHero = getActiveChancellorHero(state?.world?.heroes, domesticPolicy, playerFactionId);
  const nationalEffects = calculateNationalDomesticEffects({ chancellorHero, domesticPolicy });
  const playerResult = applyHeroUpkeep(
    state?.resources,
    state?.world?.heroes,
    playerFactionId,
    domesticPolicy.chancellorPolicy,
    nationalEffects,
  );
  const enemyResult = applyHeroUpkeep(state?.enemyResources, state?.world?.heroes, FACTION_IDS.ENEMY);
  const nextState = {
    ...state,
    resources: playerResult.resources,
    enemyResources: enemyResult.resources,
  };

  return {
    ...nextState,
    world: {
      ...nextState.world,
      lastUpkeepResult: {
        turn: state?.meta?.turn ?? 1,
        chancellorPolicy: domesticPolicy.chancellorPolicy,
        player: playerResult,
        enemy: enemyResult,
        soldierPreview: {
          player: applyChancellorPolicyToSoldierUpkeepPreview(
            calculateSoldierUpkeepPreview(nextState, playerFactionId),
            domesticPolicy.chancellorPolicy,
            nationalEffects,
          ),
          enemy: calculateSoldierUpkeepPreview(nextState, FACTION_IDS.ENEMY),
        },
        saltPreservation: calculateSaltPreservationNeed(
          playerResult.resources,
          domesticPolicy.chancellorPolicy,
          nationalEffects,
        ),
        nationalEffects: {
          chancellorHeroId: chancellorHero?.id ?? null,
          chancellorHeroName: chancellorHero?.name ?? null,
          effectSummary: buildChancellorEffectSummary(chancellorHero, nationalEffects),
          effects: nationalEffects,
        },
      },
    },
  };
}

export function applyPlayerTurnIncome(state) {
  const result = calculatePlayerTurnIncome(state);
  const currentResources = normalizeResourceStock(state?.resources);
  const nextResources = { ...currentResources };

  for (const [resourceKey, amount] of Object.entries(result.totals)) {
    nextResources[resourceKey] = (nextResources[resourceKey] ?? 0) + amount;
  }

  return {
    ...state,
    resources: nextResources,
    world: {
      ...state.world,
      lastIncomeResult: result,
    },
  };
}
