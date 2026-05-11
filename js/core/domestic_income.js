import {
  DOMESTIC_INCOME_RULES,
  DOMESTIC_TAX_RULES,
  FACTION_IDS,
  LOYALTY_KEYS,
  RESOURCE_KEYS,
  SEASON_KEYS,
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

function createTaxEffect(baseTotals, taxLevel) {
  const normalizedTaxLevel = normalizeTaxLevel(taxLevel);
  const goldMultiplier = getTaxGoldMultiplier(normalizedTaxLevel);
  const goldBeforeTax = baseTotals[RESOURCE_KEYS.GOLD] ?? 0;
  const goldAfterTax = Math.round(goldBeforeTax * goldMultiplier);

  return {
    taxLevel: normalizedTaxLevel,
    goldMultiplier,
    loyaltyDelta: getTaxLoyaltyDelta(normalizedTaxLevel),
    goldBeforeTax,
    goldAfterTax,
    goldDelta: goldAfterTax - goldBeforeTax,
  };
}

export function createInitialResourceStock() {
  return Object.fromEntries(RESOURCE_STOCK_KEYS.map((resourceKey) => [resourceKey, 0]));
}

export function normalizeResourceStock(resources = {}) {
  return {
    ...createInitialResourceStock(),
    ...(resources ?? {}),
  };
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

export function createInitialDomesticPolicy() {
  return {
    taxLevel: DOMESTIC_TAX_RULES.DEFAULT_TAX_LEVEL,
  };
}

export function normalizeDomesticPolicy(domesticPolicy = {}) {
  return {
    ...createInitialDomesticPolicy(),
    ...(domesticPolicy ?? {}),
    taxLevel: normalizeTaxLevel(domesticPolicy?.taxLevel),
  };
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

export function applyTaxToIncomeTotals(totals, taxLevel) {
  const nextTotals = {
    ...totals,
    [RESOURCE_KEYS.GOLD]: Math.round(
      (totals?.[RESOURCE_KEYS.GOLD] ?? 0) * getTaxGoldMultiplier(taxLevel),
    ),
  };

  return nextTotals;
}

export function calculateCityTurnIncome(city, calendar) {
  const resources = city?.resources ?? {};
  const income = createEmptyIncomeTotals();
  const details = [];
  const seafoodIncome = getRating(resources, RESOURCE_KEYS.SEAFOOD)
    * DOMESTIC_INCOME_RULES.SEAFOOD_PER_RATING_PER_TURN;
  const commerceIncome = getRating(city, "commerceRating")
    * DOMESTIC_INCOME_RULES.COMMERCE_PER_RATING_PER_TURN;

  income[RESOURCE_KEYS.SEAFOOD] += seafoodIncome;
  income[RESOURCE_KEYS.GOLD] += commerceIncome;
  addDetail(details, RESOURCE_KEYS.SEAFOOD, seafoodIncome, "매턴 수산물", city);
  addDetail(details, RESOURCE_KEYS.GOLD, commerceIncome, "상업 수입", city);

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

  for (const city of state?.world?.cities ?? []) {
    if (city.ownerFactionId !== playerFactionId) {
      continue;
    }

    const cityIncome = calculateCityTurnIncome(city, calendar);
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

  const totals = applyTaxToIncomeTotals(baseTotals, domesticPolicy.taxLevel);
  const tax = createTaxEffect(baseTotals, domesticPolicy.taxLevel);

  return {
    turn: state?.meta?.turn ?? 1,
    calendar,
    baseTotals,
    totals,
    tax,
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
