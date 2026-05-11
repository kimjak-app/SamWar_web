export const FACTION_IDS = Object.freeze({
  PLAYER: "player",
  ENEMY: "enemy",
});

export const DOMESTIC_STAT_KEYS = Object.freeze({
  PUBLIC_SUPPORT: "publicSupport",
  MORALE: "morale",
  PUBLIC_ORDER: "publicOrder",
  AGRICULTURE: "agriculture",
  COMMERCE: "commerce",
  STABILITY: "stability",
});

export const RESOURCE_KEYS = Object.freeze({
  RICE: "rice",
  BARLEY: "barley",
  SEAFOOD: "seafood",
  WOOD: "wood",
  IRON: "iron",
  HORSES: "horses",
  SILK: "silk",
  SALT: "salt",
  GOLD: "gold",
  SPECIALTY: "specialty",
});

export const RESOURCE_LABELS = Object.freeze({
  [RESOURCE_KEYS.RICE]: "쌀",
  [RESOURCE_KEYS.BARLEY]: "보리",
  [RESOURCE_KEYS.SEAFOOD]: "수산물",
  [RESOURCE_KEYS.WOOD]: "목재",
  [RESOURCE_KEYS.IRON]: "철",
  [RESOURCE_KEYS.HORSES]: "말",
  [RESOURCE_KEYS.SILK]: "비단",
  [RESOURCE_KEYS.SALT]: "소금",
  [RESOURCE_KEYS.GOLD]: "금전",
  [RESOURCE_KEYS.SPECIALTY]: "특산",
});

export const CITY_TYPES = Object.freeze({
  COMMERCIAL_CAPITAL: "commercial_capital",
  PRODUCTION_CITY: "production_city",
  COASTAL_TRADE_CITY: "coastal_trade_city",
});

export const CITY_TYPE_LABELS = Object.freeze({
  [CITY_TYPES.COMMERCIAL_CAPITAL]: "상업대도시",
  [CITY_TYPES.PRODUCTION_CITY]: "생산형",
  [CITY_TYPES.COASTAL_TRADE_CITY]: "해안무역도시",
});

export const LOYALTY_KEYS = Object.freeze({
  NATIONAL: "nationalLoyalty",
  CITY: "cityLoyalty",
});

export const LOYALTY_LABELS = Object.freeze({
  [LOYALTY_KEYS.NATIONAL]: "국가충성도",
  [LOYALTY_KEYS.CITY]: "성충성도",
});

export const YIELD_KEYS = Object.freeze({
  RICE_HARVEST: "riceHarvest",
  BARLEY_HARVEST: "barleyHarvest",
  SEAFOOD_PER_TURN: "seafoodPerTurn",
  COMMERCE_INCOME: "commerceIncome",
  SPECIALTY_INCOME: "specialtyIncome",
});

export const SEASON_KEYS = Object.freeze({
  SPRING: "spring",
  SUMMER: "summer",
  AUTUMN: "autumn",
  WINTER: "winter",
  SEASON: "season",
  TURN: "turn",
});

export const SEASON_LABELS = Object.freeze({
  [SEASON_KEYS.SPRING]: "봄",
  [SEASON_KEYS.SUMMER]: "여름",
  [SEASON_KEYS.AUTUMN]: "가을",
  [SEASON_KEYS.WINTER]: "겨울",
});

export const SEASON_ORDER = Object.freeze([
  SEASON_KEYS.SPRING,
  SEASON_KEYS.SUMMER,
  SEASON_KEYS.AUTUMN,
  SEASON_KEYS.WINTER,
]);

export const SEASON_TURNS = 10;
export const YEAR_TURNS = 40;
export const START_YEAR = 154;

export const DOMESTIC_INCOME_RULES = Object.freeze({
  SEAFOOD_PER_RATING_PER_TURN: 2,
  BARLEY_PER_RATING_IN_SPRING: 5,
  RICE_PER_RATING_IN_AUTUMN: 5,
  COMMERCE_PER_RATING_PER_TURN: 3,
});

export const DOMESTIC_TAX_RULES = Object.freeze({
  DEFAULT_TAX_LEVEL: 30,
  MIN_TAX_LEVEL: 0,
  MAX_TAX_LEVEL: 100,
  MIN_GOLD_MULTIPLIER: 0.5,
  BASE_GOLD_MULTIPLIER: 1.0,
  MAX_GOLD_MULTIPLIER: 2.0,
});
