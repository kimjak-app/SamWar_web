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

export function calculateCityTurnIncome(city, calendar, taxLevel = DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL) {
  const resources = city?.resources ?? {};
  const income = createEmptyIncomeTotals();
  const details = [];
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

  return {
    ...income,
    tax: goldTaxIncome,
    details,
  };
}

export function calculatePlayerTurnIncome(state) {
  const calendar = deriveCalendarFromTurn(state?.meta?.turn);
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;
  const baseTotals = createEmptyIncomeTotals();
  const cityIncomes = [];
  const details = [];
  const domesticPolicy = normalizeDomesticPolicy(state?.domesticPolicy);
  const ownedCities = (state?.world?.cities ?? []).filter((city) => city.ownerFactionId === playerFactionId);

  for (const city of ownedCities) {
    const cityIncome = calculateCityTurnIncome(city, calendar, domesticPolicy.taxLevel);
    cityIncomes.push({
      cityId: city.id,
      cityName: city.name,
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
      (total, city) => total + calculateCityGoldTaxIncome(city, DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL).gold,
      0,
    ),
  };
  const taxedTotals = applyTaxToIncomeTotals(baseTotals, domesticPolicy.taxLevel, ownedCities);
  const totals = applyChancellorPolicyToIncomeTotals(taxedTotals, domesticPolicy.chancellorPolicy);
  const tax = createTaxEffect(baseTotalsAtNormalTax, taxedTotals, domesticPolicy.taxLevel);
  const chancellorPolicy = createChancellorPolicyEffect(
    domesticPolicy.chancellorPolicy,
    taxedTotals,
    totals,
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
  };
}

export function applyTaxLoyaltyEffect(state) {
  const domesticPolicy = normalizeDomesticPolicy(state?.domesticPolicy);
  const loyaltyDelta = getTaxLoyaltyDelta(domesticPolicy.taxLevel);
  const playerFactionId = state?.meta?.playerFactionId ?? FACTION_IDS.PLAYER;

  if (loyaltyDelta === 0) {
    return {
      ...state,
      world: {
        ...state.world,
        lastTaxResult: {
          taxLevel: domesticPolicy.taxLevel,
          loyaltyDelta,
        },
      },
    };
  }

  return {
    ...state,
    meta: {
      ...state.meta,
      [LOYALTY_KEYS.NATIONAL]: clamp(
        (state?.meta?.[LOYALTY_KEYS.NATIONAL] ?? 75) + loyaltyDelta,
        0,
        100,
      ),
    },
    world: {
      ...state.world,
      cities: (state?.world?.cities ?? []).map((city) => {
        if (city.ownerFactionId !== playerFactionId) {
          return city;
        }

        return {
          ...city,
          [LOYALTY_KEYS.CITY]: clamp((city[LOYALTY_KEYS.CITY] ?? city.loyalty ?? 75) + loyaltyDelta, 0, 100),
        };
      }),
      lastTaxResult: {
        taxLevel: domesticPolicy.taxLevel,
        loyaltyDelta,
      },
    },
  };
}

export function calculateHeroUpkeep(heroes = [], side = FACTION_IDS.PLAYER) {
  const activeHeroes = (heroes ?? []).filter((hero) => hero.side === side && isActiveHero(hero));
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

export function applyChancellorPolicyToHeroUpkeep(upkeep, policy) {
  const effect = getChancellorPolicyEffect(policy);
  const cost = Object.fromEntries(
    Object.entries(upkeep?.cost ?? {}).map(([resourceKey, amount]) => [
      resourceKey,
      roundResourceAmount(amount * effect.heroUpkeepMultiplier),
    ]),
  );

  return {
    ...upkeep,
    baseCost: upkeep?.cost ?? {},
    cost,
    chancellorPolicy: normalizeChancellorPolicy(policy),
  };
}

export function applyHeroUpkeep(resources, heroes = [], side = FACTION_IDS.PLAYER, chancellorPolicy = null) {
  const baseUpkeep = calculateHeroUpkeep(heroes, side);
  const upkeep = chancellorPolicy
    ? applyChancellorPolicyToHeroUpkeep(baseUpkeep, chancellorPolicy)
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
  const troopCount = (state?.world?.heroes ?? [])
    .filter((hero) => hero.side === side && isActiveHero(hero))
    .reduce((total, hero) => total + Math.max(0, Number(hero.troops) || 0), 0);
  const unitCount = troopCount > 0
    ? Math.ceil(troopCount / SOLDIER_UPKEEP_RULES.TROOPS_PER_UNIT)
    : 0;

  return {
    side,
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

export function applyChancellorPolicyToSoldierUpkeepPreview(preview, policy) {
  const effect = getChancellorPolicyEffect(policy);
  const cost = Object.fromEntries(
    Object.entries(preview?.cost ?? {}).map(([resourceKey, amount]) => [
      resourceKey,
      roundResourceAmount(amount * effect.soldierUpkeepPreviewMultiplier),
    ]),
  );

  return {
    ...preview,
    baseCost: preview?.cost ?? {},
    cost,
    chancellorPolicy: normalizeChancellorPolicy(policy),
  };
}

export function calculateSaltPreservationNeed(resources = {}, policy = CHANCELLOR_POLICY_KEYS.BALANCED) {
  const stock = normalizeResourceStock(resources);
  const baseNeeded = Math.ceil(
    ((stock[RESOURCE_KEYS.RICE] ?? 0) + (stock[RESOURCE_KEYS.BARLEY] ?? 0))
      * SALT_PRESERVATION_RULES.FOOD_SALT_RATIO
    + (stock[RESOURCE_KEYS.SEAFOOD] ?? 0) * SALT_PRESERVATION_RULES.SEAFOOD_SALT_RATIO,
  );
  const needed = applyChancellorPolicyToSaltPreservationNeed(
    { needed: baseNeeded, currentSalt: stock[RESOURCE_KEYS.SALT] ?? 0 },
    policy,
  ).needed;
  const currentSalt = stock[RESOURCE_KEYS.SALT] ?? 0;

  return {
    baseNeeded,
    needed,
    currentSalt,
    status: currentSalt >= needed ? "안정" : "부족",
    applied: false,
    chancellorPolicy: normalizeChancellorPolicy(policy),
  };
}

export function applyChancellorPolicyToSaltPreservationNeed(saltNeed, policy) {
  const effect = getChancellorPolicyEffect(policy);
  const needed = Math.max(0, Math.ceil((saltNeed?.needed ?? 0) * effect.saltPreservationMultiplier));
  const currentSalt = saltNeed?.currentSalt ?? 0;

  return {
    ...saltNeed,
    baseNeeded: saltNeed?.baseNeeded ?? saltNeed?.needed ?? 0,
    needed,
    currentSalt,
    status: currentSalt >= needed ? "안정" : "부족",
    applied: false,
    chancellorPolicy: normalizeChancellorPolicy(policy),
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
  const domesticPolicy = normalizeDomesticPolicy(state?.domesticPolicy);
  const playerResult = applyHeroUpkeep(
    state?.resources,
    state?.world?.heroes,
    playerFactionId,
    domesticPolicy.chancellorPolicy,
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
          ),
          enemy: calculateSoldierUpkeepPreview(nextState, FACTION_IDS.ENEMY),
        },
        saltPreservation: calculateSaltPreservationNeed(playerResult.resources, domesticPolicy.chancellorPolicy),
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
