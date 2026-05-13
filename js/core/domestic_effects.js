import {
  CHANCELLOR_POLICY_KEYS,
  CHANCELLOR_STAT_KEYS,
  GOVERNOR_POLICY_KEYS,
  RESOURCE_KEYS,
} from "../constants.js";

const DEFAULT_MULTIPLIERS = Object.freeze({
  riceMultiplier: 1,
  barleyMultiplier: 1,
  seafoodMultiplier: 1,
  goldMultiplier: 1,
  heroUpkeepMultiplier: 1,
  soldierUpkeepPreviewMultiplier: 1,
  saltPreservationMultiplier: 1,
  nationalLoyaltyLossMultiplier: 1,
  cityLoyaltyLossMultiplier: 1,
  recruitableTroopsBonus: 0,
});

const CHANCELLOR_PRIMARY_RATE = 0.03;
const CHANCELLOR_SECONDARY_RATE = 0.015;
const GOVERNOR_PRIMARY_RATE = 0.025;
const GOVERNOR_SECONDARY_RATE = 0.0125;
const STATIONED_HERO_SECURITY_WEIGHT = 0.3;
const CITY_LOYALTY_DRIFT_MIN = -2;
const CITY_LOYALTY_DRIFT_MAX = 2;
const DEFAULT_CITY_POPULATION = 30000;
const DEFAULT_SECURITY_REQUIRED_TROOPS = 500;
const DEFAULT_OPTIMAL_TROOP_RATIO = 0.30;
const DEFAULT_MAX_TROOP_RATIO = 0.50;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getAptitudeValue(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
}

function createDefaultEffect() {
  return {
    ...DEFAULT_MULTIPLIERS,
    summaryTags: [],
  };
}

function multiplyEffect(effect, key, multiplier, min = 0.75, max = 1.25) {
  effect[key] = clamp((effect[key] ?? 1) * multiplier, min, max);
}

function addEffectTag(effect, tag) {
  if (tag && !effect.summaryTags.includes(tag)) {
    effect.summaryTags.push(tag);
  }
}

function getStationedTroops(city, heroes = []) {
  return (heroes ?? [])
    .filter((hero) => hero?.locationCityId === city?.id)
    .reduce((total, hero) => total + Math.max(0, Number(hero?.troops) || 0), 0);
}

function getCityGarrisonTroops(city) {
  return Math.max(0, Number(city?.military?.garrisonTroops) || 0);
}

function getCityPopulation(city) {
  return Math.max(1, Number(city?.population) || DEFAULT_CITY_POPULATION);
}

function getSecurityRequiredTroops(city) {
  return Math.max(1, Number(city?.military?.securityRequiredTroops) || DEFAULT_SECURITY_REQUIRED_TROOPS);
}

function getRatioValue(value, fallback) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

function getCityDefenseRating(city) {
  return Math.max(0, Number(city?.military?.defenseRating) || 0);
}

export function calculateRecruitmentRatioState(city) {
  const population = getCityPopulation(city);
  const garrisonTroops = getCityGarrisonTroops(city);
  const optimalTroopRatio = getRatioValue(city?.military?.optimalTroopRatio, DEFAULT_OPTIMAL_TROOP_RATIO);
  const maxTroopRatio = getRatioValue(city?.military?.maxTroopRatio, DEFAULT_MAX_TROOP_RATIO);
  const recruitmentRatio = population > 0 ? garrisonTroops / population : 0;
  const maxTroopsByPopulation = Math.max(0, Math.floor(population * maxTroopRatio));
  const remainingRecruitCapacity = Math.max(0, maxTroopsByPopulation - garrisonTroops);
  let tier = "green";
  let status = "균형";

  if (recruitmentRatio >= maxTroopRatio || recruitmentRatio >= 0.50) {
    tier = "critical";
    status = "한계";
  } else if (recruitmentRatio > 0.45) {
    tier = "critical";
    status = "한계";
  } else if (recruitmentRatio > 0.40) {
    tier = "red";
    status = "위험";
  } else if (recruitmentRatio > 0.35) {
    tier = "yellow";
    status = "부담";
  } else if (recruitmentRatio > 0.30) {
    tier = "blue";
    status = "확장";
  }

  return {
    population,
    garrisonTroops,
    recruitmentRatio,
    optimalTroopRatio,
    maxTroopRatio,
    maxTroopsByPopulation,
    remainingRecruitCapacity,
    tier,
    status,
  };
}

export function calculateMilitaryBurdenState(city) {
  const ratioState = calculateRecruitmentRatioState(city);
  let loyaltyDeltaFromMilitaryBurden = 0;
  let reason = null;

  if (ratioState.recruitmentRatio > 0.45) {
    loyaltyDeltaFromMilitaryBurden = -2;
    reason = "군사 과밀";
  } else if (ratioState.recruitmentRatio > 0.40) {
    loyaltyDeltaFromMilitaryBurden = -1;
    reason = "군사 부담";
  } else if (ratioState.recruitmentRatio > 0.35) {
    loyaltyDeltaFromMilitaryBurden = -1;
    reason = "군사 부담";
  }

  return {
    ...ratioState,
    loyaltyDeltaFromMilitaryBurden,
    reason,
  };
}

function getProfileAptitude(hero, type) {
  const profile = getHeroDomesticProfile(hero);
  let aptitude = 0;

  if (profile.primaryType === type) {
    aptitude += profile.primaryAptitude;
  }

  if (profile.secondaryType === type) {
    aptitude += profile.secondaryAptitude * 0.5;
  }

  return aptitude;
}

function applyTypeEffect(effect, type, aptitude, rate, scope) {
  const strength = getAptitudeValue(aptitude) * rate;

  if (!type || strength <= 0) {
    return;
  }

  switch (type) {
    case CHANCELLOR_STAT_KEYS.POLITICAL:
      if (scope === "national") {
        multiplyEffect(effect, "nationalLoyaltyLossMultiplier", 1 - strength, 0.7, 1);
        multiplyEffect(effect, "cityLoyaltyLossMultiplier", 1 - (strength * 0.4), 0.85, 1);
      } else {
        multiplyEffect(effect, "cityLoyaltyLossMultiplier", 1 - strength, 0.72, 1);
      }
      addEffectTag(effect, "세금 부담 완화");
      break;
    case CHANCELLOR_STAT_KEYS.ECONOMIC:
      multiplyEffect(effect, "goldMultiplier", 1 + strength, 1, 1.22);
      addEffectTag(effect, "금전 수입 증가");
      break;
    case CHANCELLOR_STAT_KEYS.ADMINISTRATIVE:
      if (scope === "national") {
        multiplyEffect(effect, "heroUpkeepMultiplier", 1 - (strength * 0.45), 0.82, 1);
        multiplyEffect(effect, "saltPreservationMultiplier", 1 - (strength * 0.45), 0.82, 1);
      } else {
        multiplyEffect(effect, "riceMultiplier", 1 + (strength * 0.45), 1, 1.14);
        multiplyEffect(effect, "barleyMultiplier", 1 + (strength * 0.45), 1, 1.14);
        multiplyEffect(effect, "seafoodMultiplier", 1 + (strength * 0.3), 1, 1.1);
      }
      addEffectTag(effect, scope === "national" ? "유지비 절감" : "자원 수입 안정");
      break;
    case CHANCELLOR_STAT_KEYS.DIPLOMATIC:
      multiplyEffect(effect, "goldMultiplier", 1 + (strength * 0.55), 1, 1.12);
      addEffectTag(effect, "교역 기반 금전 보정");
      break;
    case CHANCELLOR_STAT_KEYS.MILITARY_ADMIN:
      if (scope === "national") {
        multiplyEffect(effect, "soldierUpkeepPreviewMultiplier", 1 - (strength * 0.55), 0.82, 1);
      } else {
        effect.recruitableTroopsBonus += Math.round(getAptitudeValue(aptitude) * 12);
      }
      addEffectTag(effect, scope === "national" ? "병사 유지비 preview 완화" : "군량·치안 보정");
      break;
    default:
      break;
  }
}

function combineEffects(...effects) {
  const combined = createDefaultEffect();

  for (const effect of effects) {
    if (!effect) {
      continue;
    }

    multiplyEffect(combined, "riceMultiplier", effect.riceMultiplier ?? 1, 0.75, 1.35);
    multiplyEffect(combined, "barleyMultiplier", effect.barleyMultiplier ?? 1, 0.75, 1.35);
    multiplyEffect(combined, "seafoodMultiplier", effect.seafoodMultiplier ?? 1, 0.75, 1.35);
    multiplyEffect(combined, "goldMultiplier", effect.goldMultiplier ?? 1, 0.75, 1.4);
    multiplyEffect(combined, "heroUpkeepMultiplier", effect.heroUpkeepMultiplier ?? 1, 0.75, 1);
    multiplyEffect(combined, "soldierUpkeepPreviewMultiplier", effect.soldierUpkeepPreviewMultiplier ?? 1, 0.75, 1);
    multiplyEffect(combined, "saltPreservationMultiplier", effect.saltPreservationMultiplier ?? 1, 0.75, 1);
    multiplyEffect(combined, "nationalLoyaltyLossMultiplier", effect.nationalLoyaltyLossMultiplier ?? 1, 0.65, 1);
    multiplyEffect(combined, "cityLoyaltyLossMultiplier", effect.cityLoyaltyLossMultiplier ?? 1, 0.65, 1);
    combined.recruitableTroopsBonus += effect.recruitableTroopsBonus ?? 0;

    for (const tag of effect.summaryTags ?? []) {
      addEffectTag(combined, tag);
    }
  }

  return combined;
}

export function getHeroDomesticProfile(hero) {
  return {
    primaryType: hero?.chancellorProfile?.primaryType ?? null,
    primaryAptitude: getAptitudeValue(hero?.chancellorProfile?.primaryAptitude),
    secondaryType: hero?.chancellorProfile?.secondaryType ?? null,
    secondaryAptitude: getAptitudeValue(hero?.chancellorProfile?.secondaryAptitude),
  };
}

export function calculateChancellorAptitudeEffects(chancellorHero) {
  const effect = createDefaultEffect();

  if (!chancellorHero) {
    addEffectTag(effect, "재상 효과 없음");
    return effect;
  }

  const profile = getHeroDomesticProfile(chancellorHero);
  applyTypeEffect(effect, profile.primaryType, profile.primaryAptitude, CHANCELLOR_PRIMARY_RATE, "national");
  applyTypeEffect(effect, profile.secondaryType, profile.secondaryAptitude, CHANCELLOR_SECONDARY_RATE, "national");

  return effect;
}

export function calculateGovernorAptitudeEffects(governorHero) {
  const effect = createDefaultEffect();

  if (!governorHero) {
    addEffectTag(effect, "태수 효과 없음");
    return effect;
  }

  const profile = getHeroDomesticProfile(governorHero);
  applyTypeEffect(effect, profile.primaryType, profile.primaryAptitude, GOVERNOR_PRIMARY_RATE, "city");
  applyTypeEffect(effect, profile.secondaryType, profile.secondaryAptitude, GOVERNOR_SECONDARY_RATE, "city");

  return effect;
}

export function calculateGovernorPolicyEffects(governorPolicy, chancellorPolicy = CHANCELLOR_POLICY_KEYS.BALANCED) {
  const normalizedPolicy = Object.values(GOVERNOR_POLICY_KEYS).includes(governorPolicy)
    ? governorPolicy
    : GOVERNOR_POLICY_KEYS.FOLLOW_CHANCELLOR;
  const effect = createDefaultEffect();

  switch (normalizedPolicy) {
    case GOVERNOR_POLICY_KEYS.AGRICULTURE:
      multiplyEffect(effect, "riceMultiplier", 1.08, 0.75, 1.35);
      multiplyEffect(effect, "barleyMultiplier", 1.08, 0.75, 1.35);
      multiplyEffect(effect, "goldMultiplier", 0.97, 0.75, 1.4);
      addEffectTag(effect, "농업 중심");
      break;
    case GOVERNOR_POLICY_KEYS.COMMERCE:
      multiplyEffect(effect, "goldMultiplier", 1.08, 0.75, 1.4);
      multiplyEffect(effect, "riceMultiplier", 0.97, 0.75, 1.35);
      multiplyEffect(effect, "barleyMultiplier", 0.97, 0.75, 1.35);
      addEffectTag(effect, "상업 중심");
      break;
    case GOVERNOR_POLICY_KEYS.MILITARY:
      multiplyEffect(effect, "goldMultiplier", 0.97, 0.75, 1.4);
      effect.recruitableTroopsBonus += 40;
      addEffectTag(effect, "군사 중심");
      break;
    case GOVERNOR_POLICY_KEYS.FOLLOW_CHANCELLOR:
    default:
      if (chancellorPolicy === CHANCELLOR_POLICY_KEYS.AGRICULTURE) {
        multiplyEffect(effect, "riceMultiplier", 1.03, 0.75, 1.35);
        multiplyEffect(effect, "barleyMultiplier", 1.03, 0.75, 1.35);
      } else if (chancellorPolicy === CHANCELLOR_POLICY_KEYS.COMMERCE || chancellorPolicy === CHANCELLOR_POLICY_KEYS.TRADE) {
        multiplyEffect(effect, "goldMultiplier", 1.03, 0.75, 1.4);
      } else if (chancellorPolicy === CHANCELLOR_POLICY_KEYS.MILITARY) {
        effect.recruitableTroopsBonus += 20;
      }
      addEffectTag(effect, "재상 정책 수행");
      break;
  }

  return effect;
}

export function getActiveChancellorHero(heroes = [], domesticPolicy = {}, playerFactionId = "player") {
  return (heroes ?? []).find((hero) => (
    hero.id === domesticPolicy?.chancellorHeroId
    && hero.side === playerFactionId
  )) ?? null;
}

export function getActiveGovernorHero(city, heroes = [], playerFactionId = "player") {
  return (heroes ?? []).find((hero) => (
    hero.id === city?.governorHeroId
    && hero.side === playerFactionId
    && hero.locationCityId === city?.id
  )) ?? null;
}

export function calculateNationalDomesticEffects({ chancellorHero } = {}) {
  return calculateChancellorAptitudeEffects(chancellorHero);
}

export function calculateCityDomesticEffects({
  city,
  governorHero,
  chancellorHero,
  domesticPolicy,
} = {}) {
  const chancellorFallback = governorHero
    ? null
    : {
      ...calculateChancellorAptitudeEffects(chancellorHero),
      goldMultiplier: 1,
      heroUpkeepMultiplier: 1,
      soldierUpkeepPreviewMultiplier: 1,
      saltPreservationMultiplier: 1,
      nationalLoyaltyLossMultiplier: 1,
      recruitableTroopsBonus: 0,
      summaryTags: ["재상 통제 관리"],
    };
  const governorPolicy = calculateGovernorPolicyEffects(
    city?.governorPolicy,
    domesticPolicy?.chancellorPolicy,
  );

  return combineEffects(
    governorHero ? calculateGovernorAptitudeEffects(governorHero) : null,
    chancellorFallback,
    governorPolicy,
  );
}

export function applyIncomeMultipliers(income, effect = {}) {
  return {
    ...income,
    [RESOURCE_KEYS.RICE]: Math.max(0, Math.round((income?.[RESOURCE_KEYS.RICE] ?? 0) * (effect.riceMultiplier ?? 1))),
    [RESOURCE_KEYS.BARLEY]: Math.max(0, Math.round((income?.[RESOURCE_KEYS.BARLEY] ?? 0) * (effect.barleyMultiplier ?? 1))),
    [RESOURCE_KEYS.SEAFOOD]: Math.max(0, Math.round((income?.[RESOURCE_KEYS.SEAFOOD] ?? 0) * (effect.seafoodMultiplier ?? 1))),
    [RESOURCE_KEYS.GOLD]: Math.max(0, Math.round((income?.[RESOURCE_KEYS.GOLD] ?? 0) * (effect.goldMultiplier ?? 1))),
  };
}

export function adjustLoyaltyDelta(baseDelta, lossMultiplier = 1) {
  if (baseDelta >= 0) {
    return baseDelta;
  }

  return Math.min(-1, Math.ceil(baseDelta * lossMultiplier));
}

export function calculateMilitaryPreview(city, cityEffects = {}, options = {}) {
  const baseRecruitableTroops = Number.isFinite(city?.military?.recruitableTroops)
    ? city.military.recruitableTroops
    : 0;
  const recruitableTroops = Math.max(0, Math.round(baseRecruitableTroops + (cityEffects.recruitableTroopsBonus ?? 0)));
  const hasMilitaryBonus = recruitableTroops > baseRecruitableTroops;
  const defenseRating = Math.max(0, Math.round(
    getCityDefenseRating(city) + Math.min(2, Math.floor((cityEffects.recruitableTroopsBonus ?? 0) / 60)),
  ));
  const security = calculateCitySecurityState({
    city,
    heroes: options.heroes ?? [],
    cityEffects,
  });

  return {
    garrisonTroops: security.garrisonTroops,
    stationedHeroTroops: security.stationedHeroTroops,
    securityTroops: security.securityTroops,
    population: security.population,
    securityRequiredTroops: security.securityRequiredTroops,
    recruitmentRatio: security.recruitmentRatio,
    recruitmentRatioStatus: security.recruitmentRatioStatus,
    recruitmentRatioTier: security.recruitmentRatioTier,
    remainingRecruitCapacity: security.remainingRecruitCapacity,
    maxTroopsByPopulation: security.maxTroopsByPopulation,
    recruitableTroops,
    foodStatus: hasMilitaryBonus ? "안정" : (city?.military?.foodStatus ?? "준비 중"),
    securityStatus: security.securityStatus ?? (city?.military?.securityStatus ?? "병력 기반 계산 예정"),
    defenseRating,
  };
}

export function calculateCitySecurityState({ city, heroes = [], cityEffects = {} } = {}) {
  const garrisonTroops = getCityGarrisonTroops(city);
  const stationedHeroTroops = getStationedTroops(city, heroes);
  const troopTotal = Math.round(garrisonTroops + (stationedHeroTroops * STATIONED_HERO_SECURITY_WEIGHT));
  const securityRequiredTroops = getSecurityRequiredTroops(city);
  const ratioState = calculateRecruitmentRatioState(city);
  const effectBonus = Math.min(15, Math.round((cityEffects.recruitableTroopsBonus ?? 0) / 4));
  let baseScore = 35;

  if (troopTotal >= securityRequiredTroops * 1.2) {
    baseScore = 85;
  } else if (troopTotal >= securityRequiredTroops) {
    baseScore = 60;
  }

  const securityScore = clamp(baseScore + effectBonus, 0, 100);
  const securityStatus = securityScore >= 75
    ? "안정"
    : (securityScore >= 50 ? "주의" : "불안");

  return {
    garrisonTroops,
    stationedHeroTroops,
    securityTroops: troopTotal,
    troopTotal,
    population: ratioState.population,
    securityRequiredTroops,
    recruitmentRatio: ratioState.recruitmentRatio,
    recruitmentRatioStatus: ratioState.status,
    recruitmentRatioTier: ratioState.tier,
    remainingRecruitCapacity: ratioState.remainingRecruitCapacity,
    maxTroopsByPopulation: ratioState.maxTroopsByPopulation,
    securityScore,
    securityStatus,
    loyaltyDeltaFromSecurity: securityStatus === "안정"
      ? 1
      : (securityStatus === "불안" ? -1 : 0),
  };
}

export function calculateCityEconomyState({ city, cityEffects = {}, cityIncome = null } = {}) {
  const commerceRating = Math.max(1, Number(city?.commerceRating) || 3);
  const populationRating = Math.max(1, Number(city?.populationRating) || 3);
  const goldIncome = Number(cityIncome?.[RESOURCE_KEYS.GOLD] ?? cityIncome?.tax?.gold ?? 0) || 0;
  const goldIncomeScore = goldIncome > 0 ? Math.min(20, Math.round(goldIncome / 2)) : 10;
  const effectScore = Math.round(((cityEffects.goldMultiplier ?? 1) - 1) * 80);
  const economyScore = clamp(
    (commerceRating * 10) + (populationRating * 8) + goldIncomeScore + effectScore,
    0,
    100,
  );
  const economyStatus = economyScore >= 75
    ? "활황"
    : (economyScore >= 50 ? "안정" : "침체");

  return {
    economyScore,
    economyStatus,
    loyaltyDeltaFromEconomy: economyStatus === "활황"
      ? 1
      : (economyStatus === "침체" ? -1 : 0),
  };
}

function calculateControlAdjustment({
  preliminaryDelta,
  governorHero,
  chancellorHero,
} = {}) {
  if (preliminaryDelta >= 0) {
    return { controlDelta: 0, reason: null };
  }

  if (
    governorHero
    && (
      getProfileAptitude(governorHero, CHANCELLOR_STAT_KEYS.ADMINISTRATIVE) >= 3
      || getProfileAptitude(governorHero, CHANCELLOR_STAT_KEYS.POLITICAL) >= 3
    )
  ) {
    return { controlDelta: 1, reason: "태수 보정" };
  }

  if (
    !governorHero
    && chancellorHero
    && preliminaryDelta <= -2
    && (
      getProfileAptitude(chancellorHero, CHANCELLOR_STAT_KEYS.ADMINISTRATIVE) >= 3
      || getProfileAptitude(chancellorHero, CHANCELLOR_STAT_KEYS.POLITICAL) >= 4
    )
  ) {
    return { controlDelta: 1, reason: "재상 통제 관리" };
  }

  return { controlDelta: 0, reason: null };
}

function formatSignedDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export function calculateCityLoyaltyDrift({
  city,
  heroes = [],
  taxLoyaltyDelta = 0,
  cityEffects = {},
  cityIncome = null,
  governorHero = null,
  chancellorHero = null,
} = {}) {
  const taxDelta = adjustLoyaltyDelta(taxLoyaltyDelta, cityEffects.cityLoyaltyLossMultiplier);
  const security = calculateCitySecurityState({ city, heroes, cityEffects });
  const economy = calculateCityEconomyState({ city, cityEffects, cityIncome });
  const militaryBurden = calculateMilitaryBurdenState(city);
  const preliminaryDelta = taxDelta
    + security.loyaltyDeltaFromSecurity
    + economy.loyaltyDeltaFromEconomy
    + militaryBurden.loyaltyDeltaFromMilitaryBurden;
  const control = calculateControlAdjustment({
    preliminaryDelta,
    governorHero,
    chancellorHero,
  });
  const delta = clamp(
    preliminaryDelta + control.controlDelta,
    CITY_LOYALTY_DRIFT_MIN,
    CITY_LOYALTY_DRIFT_MAX,
  );
  const reasons = [];

  if (taxDelta < 0) {
    reasons.push("세금 부담");
  } else if (taxDelta > 0) {
    reasons.push("저세율 안정");
  }

  reasons.push(`치안 ${security.securityStatus}`);
  reasons.push(`경제 ${economy.economyStatus}`);

  if (militaryBurden.reason) {
    reasons.push(militaryBurden.reason);
  }

  if (taxLoyaltyDelta < 0 && taxDelta > taxLoyaltyDelta) {
    reasons.push(governorHero ? "태수 세금 완화" : "재상 세금 완화");
  }

  if (control.reason) {
    reasons.push(control.reason);
  }

  return {
    cityId: city?.id ?? null,
    cityName: city?.name ?? "",
    delta,
    taxDelta,
    security,
    economy,
    militaryBurden,
    controlDelta: control.controlDelta,
    reasons,
    summary: `성충성도 ${formatSignedDelta(delta)} · 치안 ${security.securityStatus} · 경제 ${economy.economyStatus}`,
  };
}

export function buildChancellorEffectSummary(chancellorHero, effect = {}) {
  if (!chancellorHero) {
    return "재상 효과 없음";
  }

  const tags = (effect.summaryTags ?? []).filter((tag) => tag !== "재상 효과 없음");
  return `${chancellorHero.name}: ${(tags.length ? tags : ["균형 운영"]).slice(0, 3).join(" · ")}`;
}

export function buildGovernorEffectSummary(governorHero, effect = {}) {
  if (!governorHero) {
    return "태수 효과 없음";
  }

  const tags = (effect.summaryTags ?? []).filter((tag) => tag !== "태수 효과 없음");
  return `${governorHero.name}: ${(tags.length ? tags : ["도시 운영 보정"]).slice(0, 3).join(" · ")}`;
}
