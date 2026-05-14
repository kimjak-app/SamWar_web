export const FACTION_IDS = Object.freeze({
  PLAYER: "player",
  ENEMY: "enemy", // legacy aggregate id for old saves / enemy-wide UI summaries

  // v0.5-8e active historical factions
  GOGURYEO: "goguryeo",
  SILLA: "silla",
  GORYEO_JOSEON: "goryeo_joseon",
  CHU: "chu",
  WEI: "wei",
  SHU: "shu",
  WU: "wu",
  ODA: "oda",
  TOYOTOMI: "toyotomi",
  TOKUGAWA: "tokugawa",

  // Legacy faction ids kept for old saves and migration fallback.
  LUOYANG: "luoyang_faction",
  PYEONGYANG: "pyeongyang_faction",
  KYOTO: "kyoto_faction",
});

export const FACTION_HOME_CITY_IDS = Object.freeze({
  [FACTION_IDS.PLAYER]: "hanseong",
  [FACTION_IDS.GORYEO_JOSEON]: "hanseong",
  [FACTION_IDS.GOGURYEO]: "pyeongyang",
  [FACTION_IDS.SILLA]: "gyeongju",
  [FACTION_IDS.CHU]: "luoyang",
  [FACTION_IDS.WEI]: "yecheng",
  [FACTION_IDS.SHU]: "chengdu",
  [FACTION_IDS.WU]: "jianye",
  [FACTION_IDS.ODA]: "kyoto",
  [FACTION_IDS.TOYOTOMI]: "osaka",
  [FACTION_IDS.TOKUGAWA]: "edo",
});

export const LEGACY_ENEMY_FACTION_IDS = Object.freeze([
  FACTION_IDS.LUOYANG,
  FACTION_IDS.PYEONGYANG,
  FACTION_IDS.KYOTO,
]);

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
  RIVER_TRADE_CITY: "river_trade_city",
  MILITARY_FORTRESS: "military_fortress",
});

export const CITY_TYPE_LABELS = Object.freeze({
  [CITY_TYPES.COMMERCIAL_CAPITAL]: "상업대도시",
  [CITY_TYPES.PRODUCTION_CITY]: "생산형",
  [CITY_TYPES.COASTAL_TRADE_CITY]: "해안무역도시",
  [CITY_TYPES.RIVER_TRADE_CITY]: "수운교역도시",
  [CITY_TYPES.MILITARY_FORTRESS]: "군사요새",
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
});

export const DOMESTIC_TAX_RULES = Object.freeze({
  DEFAULT_TAX_LEVEL: 30,
  MIN_TAX_LEVEL: 0,
  MAX_TAX_LEVEL: 100,
  MIN_GOLD_MULTIPLIER: 0.5,
  BASE_GOLD_MULTIPLIER: 1.0,
  MAX_GOLD_MULTIPLIER: 2.0,
});

export const POPULATION_TAX_POINT_PER_RATING = 3;
export const COMMERCE_TAX_POINT_PER_RATING = 3;
export const TAX_POINT_TO_GOLD = 1;

export const INITIAL_RESOURCE_STOCK = Object.freeze({
  [RESOURCE_KEYS.RICE]: 300,
  [RESOURCE_KEYS.BARLEY]: 250,
  [RESOURCE_KEYS.SEAFOOD]: 80,
  [RESOURCE_KEYS.WOOD]: 100,
  [RESOURCE_KEYS.IRON]: 50,
  [RESOURCE_KEYS.HORSES]: 30,
  [RESOURCE_KEYS.SILK]: 30,
  [RESOURCE_KEYS.SALT]: 50,
  [RESOURCE_KEYS.GOLD]: 500,
});

export const INITIAL_ENEMY_RESOURCE_STOCK = Object.freeze({
  ...INITIAL_RESOURCE_STOCK,
});

export const WAREHOUSE_CAPACITY = Object.freeze({
  [RESOURCE_KEYS.RICE]: 1000,
  [RESOURCE_KEYS.BARLEY]: 1000,
  [RESOURCE_KEYS.SEAFOOD]: 500,
  [RESOURCE_KEYS.WOOD]: 800,
  [RESOURCE_KEYS.IRON]: 500,
  [RESOURCE_KEYS.HORSES]: 300,
  [RESOURCE_KEYS.SILK]: 300,
  [RESOURCE_KEYS.SALT]: 400,
  [RESOURCE_KEYS.GOLD]: 9999,
});

export const WAREHOUSE_STATUS_THRESHOLDS = Object.freeze({
  LOW_MAX_RATIO: 0.2,
  STABLE_MAX_RATIO: 0.8,
  FULL_MAX_RATIO: 1,
});

export const HERO_UPKEEP_RULES = Object.freeze({
  [RESOURCE_KEYS.RICE]: 8,
  [RESOURCE_KEYS.SEAFOOD]: 3,
  [RESOURCE_KEYS.SILK]: 1,
});

export const SOLDIER_UPKEEP_RULES = Object.freeze({
  TROOPS_PER_UNIT: 100,
  [RESOURCE_KEYS.RICE]: 6,
  [RESOURCE_KEYS.BARLEY]: 5,
  [RESOURCE_KEYS.SEAFOOD]: 1,
});

export const SALT_PRESERVATION_RULES = Object.freeze({
  FOOD_SALT_RATIO: 0.08,
  SEAFOOD_SALT_RATIO: 0.12,
});

export const CHANCELLOR_POLICY_KEYS = Object.freeze({
  BALANCED: "balanced",
  AGRICULTURE: "agriculture",
  COMMERCE: "commerce",
  TRADE: "trade",
  MILITARY: "military",
});

export const CHANCELLOR_POLICY_LABELS = Object.freeze({
  [CHANCELLOR_POLICY_KEYS.BALANCED]: "균형형",
  [CHANCELLOR_POLICY_KEYS.AGRICULTURE]: "농업 중심",
  [CHANCELLOR_POLICY_KEYS.COMMERCE]: "상업 중심",
  [CHANCELLOR_POLICY_KEYS.TRADE]: "무역 중심",
  [CHANCELLOR_POLICY_KEYS.MILITARY]: "군사 중심",
});

export const GOVERNOR_POLICY_KEYS = Object.freeze({
  FOLLOW_CHANCELLOR: "follow_chancellor",
  AGRICULTURE: "agriculture",
  COMMERCE: "commerce",
  MILITARY: "military",
});

export const GOVERNOR_POLICY_LABELS = Object.freeze({
  [GOVERNOR_POLICY_KEYS.FOLLOW_CHANCELLOR]: "재상 정책 수행",
  [GOVERNOR_POLICY_KEYS.AGRICULTURE]: "농업 중심",
  [GOVERNOR_POLICY_KEYS.COMMERCE]: "상업 중심",
  [GOVERNOR_POLICY_KEYS.MILITARY]: "군사 중심",
});

export const CHANCELLOR_POLICY_DESCRIPTIONS = Object.freeze({
  [CHANCELLOR_POLICY_KEYS.BALANCED]: "보정 없음",
  [CHANCELLOR_POLICY_KEYS.AGRICULTURE]: "쌀/보리 수입 증가, 금전 소폭 감소",
  [CHANCELLOR_POLICY_KEYS.COMMERCE]: "금전 수입 증가, 식량 수입 소폭 감소",
  [CHANCELLOR_POLICY_KEYS.TRADE]: "수산물/금전 소폭 증가, 소금 보존 부담 완화",
  [CHANCELLOR_POLICY_KEYS.MILITARY]: "영웅 유지비 감소, 금전 소폭 감소",
});

export const CHANCELLOR_POLICY_EFFECTS = Object.freeze({
  [CHANCELLOR_POLICY_KEYS.BALANCED]: Object.freeze({
    incomeMultiplier: 1.0,
    riceMultiplier: 1.0,
    barleyMultiplier: 1.0,
    seafoodMultiplier: 1.0,
    goldMultiplier: 1.0,
    heroUpkeepMultiplier: 1.0,
    soldierUpkeepPreviewMultiplier: 1.0,
    saltPreservationMultiplier: 1.0,
  }),
  [CHANCELLOR_POLICY_KEYS.AGRICULTURE]: Object.freeze({
    incomeMultiplier: 1.0,
    riceMultiplier: 1.15,
    barleyMultiplier: 1.15,
    seafoodMultiplier: 1.0,
    goldMultiplier: 0.95,
    heroUpkeepMultiplier: 1.0,
    soldierUpkeepPreviewMultiplier: 1.0,
    saltPreservationMultiplier: 1.0,
  }),
  [CHANCELLOR_POLICY_KEYS.COMMERCE]: Object.freeze({
    incomeMultiplier: 1.0,
    riceMultiplier: 0.95,
    barleyMultiplier: 0.95,
    seafoodMultiplier: 1.0,
    goldMultiplier: 1.15,
    heroUpkeepMultiplier: 1.0,
    soldierUpkeepPreviewMultiplier: 1.0,
    saltPreservationMultiplier: 1.0,
  }),
  [CHANCELLOR_POLICY_KEYS.TRADE]: Object.freeze({
    incomeMultiplier: 1.0,
    riceMultiplier: 1.0,
    barleyMultiplier: 1.0,
    seafoodMultiplier: 1.10,
    goldMultiplier: 1.05,
    heroUpkeepMultiplier: 1.0,
    soldierUpkeepPreviewMultiplier: 1.0,
    saltPreservationMultiplier: 0.90,
  }),
  [CHANCELLOR_POLICY_KEYS.MILITARY]: Object.freeze({
    incomeMultiplier: 1.0,
    riceMultiplier: 1.0,
    barleyMultiplier: 1.0,
    seafoodMultiplier: 1.0,
    goldMultiplier: 0.95,
    heroUpkeepMultiplier: 0.90,
    soldierUpkeepPreviewMultiplier: 0.90,
    saltPreservationMultiplier: 1.0,
  }),
});

export const CHANCELLOR_STAT_KEYS = Object.freeze({
  POLITICAL: "political",
  ECONOMIC: "economic",
  ADMINISTRATIVE: "administrative",
  DIPLOMATIC: "diplomatic",
  MILITARY_ADMIN: "militaryAdmin",
});

export const CHANCELLOR_STAT_LABELS = Object.freeze({
  [CHANCELLOR_STAT_KEYS.POLITICAL]: "정치력",
  [CHANCELLOR_STAT_KEYS.ECONOMIC]: "경제력",
  [CHANCELLOR_STAT_KEYS.ADMINISTRATIVE]: "행정력",
  [CHANCELLOR_STAT_KEYS.DIPLOMATIC]: "외교력",
  [CHANCELLOR_STAT_KEYS.MILITARY_ADMIN]: "군정력",
});

export const CHANCELLOR_TYPE_LABELS = Object.freeze({
  [CHANCELLOR_STAT_KEYS.POLITICAL]: "정치형",
  [CHANCELLOR_STAT_KEYS.ECONOMIC]: "경제형",
  [CHANCELLOR_STAT_KEYS.ADMINISTRATIVE]: "행정형",
  [CHANCELLOR_STAT_KEYS.DIPLOMATIC]: "외교형",
  [CHANCELLOR_STAT_KEYS.MILITARY_ADMIN]: "군정형",
});

export const CHANCELLOR_TYPE_DESCRIPTIONS = Object.freeze({
  [CHANCELLOR_STAT_KEYS.POLITICAL]: "민심·충성도·세금 부담·국가 안정에 강한 재상",
  [CHANCELLOR_STAT_KEYS.ECONOMIC]: "농업·상업·생산·세금·재정 운용에 강하고 나라의 부와 생산 기반을 키우는 재상",
  [CHANCELLOR_STAT_KEYS.ADMINISTRATIVE]: "창고·유지비·분배·실행 효율에 강한 재상",
  [CHANCELLOR_STAT_KEYS.DIPLOMATIC]: "무역·화친·협상·외부 거래에 강한 재상",
  [CHANCELLOR_STAT_KEYS.MILITARY_ADMIN]: "군량·병력 운용·영웅/병사 유지·군사 동원에 강한 재상",
});

export const COMMAND_RANK_KEYS = Object.freeze({
  GOVERNOR: "governor",
  GENERAL: "general",
  LIEUTENANT: "lieutenant",
  OFFICER: "officer",
});

export const COMMAND_RANK_LABELS = Object.freeze({
  [COMMAND_RANK_KEYS.GOVERNOR]: "태수",
  [COMMAND_RANK_KEYS.GENERAL]: "장군",
  [COMMAND_RANK_KEYS.LIEUTENANT]: "부장",
  [COMMAND_RANK_KEYS.OFFICER]: "군관",
});

export const COMMAND_RANK_LIMITS = Object.freeze({
  [COMMAND_RANK_KEYS.GOVERNOR]: 10000,
  [COMMAND_RANK_KEYS.GENERAL]: 8000,
  [COMMAND_RANK_KEYS.LIEUTENANT]: 6000,
  [COMMAND_RANK_KEYS.OFFICER]: 5000,
});
