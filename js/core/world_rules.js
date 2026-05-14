import { battleRosters } from "../../data/battle_rosters.js";
import { heroes } from "../../data/heroes.js";
import {
  CITY_TYPES,
  DOMESTIC_STAT_KEYS,
  FACTION_HOME_CITY_IDS,
  FACTION_IDS,
  GOVERNOR_POLICY_KEYS,
  RESOURCE_KEYS,
  YIELD_KEYS,
} from "../constants.js";
import { normalizeCityTradeSettings } from "./inter_faction_trade.js";

export function getFactionById(factions, factionId) {
  return factions.find((faction) => faction.id === factionId) ?? null;
}

export function isPlayerFactionId(factionId, playerFactionId = FACTION_IDS.PLAYER) {
  return factionId === playerFactionId;
}

export function isEnemyFactionId(factionId, playerFactionId = FACTION_IDS.PLAYER) {
  return Boolean(factionId) && factionId !== playerFactionId;
}

export function getDefaultFactionIdForCity(cityId, fallbackFactionId = FACTION_IDS.PLAYER) {
  if (!cityId) {
    return fallbackFactionId;
  }

  return Object.entries(FACTION_HOME_CITY_IDS)
    .find(([, homeCityId]) => homeCityId === cityId)?.[0]
    ?? fallbackFactionId;
}

const LEGACY_CITY_OWNER_FACTION_ID_MAP = Object.freeze({
  [FACTION_IDS.LUOYANG]: FACTION_IDS.CHU,
  [FACTION_IDS.PYEONGYANG]: FACTION_IDS.GOGURYEO,
  [FACTION_IDS.KYOTO]: FACTION_IDS.ODA,
});

export function normalizeCityOwnerFactionId(city) {
  if (city?.ownerFactionId === FACTION_IDS.ENEMY) {
    return getDefaultFactionIdForCity(city.id, FACTION_IDS.ENEMY);
  }

  if (LEGACY_CITY_OWNER_FACTION_ID_MAP[city?.ownerFactionId]) {
    return LEGACY_CITY_OWNER_FACTION_ID_MAP[city.ownerFactionId];
  }

  return city?.ownerFactionId ?? getDefaultFactionIdForCity(city?.id, FACTION_IDS.PLAYER);
}

export const ENEMY_INVASION_CHANCE = 0.45;

const defaultCityDomestic = {
  [DOMESTIC_STAT_KEYS.PUBLIC_ORDER]: 70,
  [DOMESTIC_STAT_KEYS.PUBLIC_SUPPORT]: 65,
  [DOMESTIC_STAT_KEYS.AGRICULTURE]: 55,
  [DOMESTIC_STAT_KEYS.COMMERCE]: 45,
  [DOMESTIC_STAT_KEYS.STABILITY]: 60,
};

const defaultCityResources = {
  [RESOURCE_KEYS.RICE]: 2,
  [RESOURCE_KEYS.BARLEY]: 2,
  [RESOURCE_KEYS.SEAFOOD]: 1,
  [RESOURCE_KEYS.WOOD]: 1,
  [RESOURCE_KEYS.IRON]: 1,
  [RESOURCE_KEYS.HORSES]: 0,
  [RESOURCE_KEYS.SILK]: 1,
  [RESOURCE_KEYS.SALT]: 1,
  [RESOURCE_KEYS.GOLD]: 500,
  [RESOURCE_KEYS.SPECIALTY]: 0,
};

const defaultCityYields = {
  [YIELD_KEYS.RICE_HARVEST]: 300,
  [YIELD_KEYS.BARLEY_HARVEST]: 120,
  [YIELD_KEYS.SEAFOOD_PER_TURN]: 20,
  [YIELD_KEYS.COMMERCE_INCOME]: 100,
  [YIELD_KEYS.SPECIALTY_INCOME]: 400,
};

export const defaultCityMilitary = {
  garrisonTroops: 0,
  recruitableTroops: 0,
  foodStatus: "준비 중",
  securityStatus: "병력 기반 계산 예정",
  defenseRating: 0,
  securityRequiredTroops: 500,
  optimalTroopRatio: 0.30,
  maxTroopRatio: 0.50,
  woundedQueue: [],
};

const cityPopulationPresets = {
  hanseong: 50000,
  luoyang: 80000,
  pyeongyang: 42000,
  kyoto: 45000,
};


const cityGovernorPresets = {
  luoyang: "guan_yu",
  pyeongyang: "gwanggaeto",
  kyoto: "nobunaga",
};

const cityMilitaryPresets = {
  hanseong: {
    garrisonTroops: 300,
    recruitableTroops: 120,
    foodStatus: "안정",
    securityStatus: "안정",
    defenseRating: 3,
    securityRequiredTroops: 500,
    optimalTroopRatio: 0.30,
    maxTroopRatio: 0.50,
  },
  luoyang: {
    garrisonTroops: 420,
    recruitableTroops: 180,
    foodStatus: "안정",
    securityStatus: "안정",
    defenseRating: 4,
    securityRequiredTroops: 1000,
    optimalTroopRatio: 0.30,
    maxTroopRatio: 0.50,
  },
  pyeongyang: {
    garrisonTroops: 280,
    recruitableTroops: 140,
    foodStatus: "안정",
    securityStatus: "안정",
    defenseRating: 3,
    securityRequiredTroops: 500,
    optimalTroopRatio: 0.30,
    maxTroopRatio: 0.50,
  },
  kyoto: {
    garrisonTroops: 240,
    recruitableTroops: 130,
    foodStatus: "안정",
    securityStatus: "안정",
    defenseRating: 3,
    securityRequiredTroops: 500,
    optimalTroopRatio: 0.30,
    maxTroopRatio: 0.50,
  },
};

function normalizeGovernorPolicy(policy) {
  return Object.values(GOVERNOR_POLICY_KEYS).includes(policy)
    ? policy
    : GOVERNOR_POLICY_KEYS.FOLLOW_CHANCELLOR;
}

export function isPlayerCity(city) {
  return city?.ownerFactionId === FACTION_IDS.PLAYER;
}

export function isEnemyCity(city) {
  return isEnemyFactionId(city?.ownerFactionId);
}

export function canAttackCity(cities, targetCity) {
  if (!targetCity || !isEnemyCity(targetCity)) {
    return false;
  }

  return targetCity.neighbors.some((neighborId) => {
    const neighbor = cities.find((city) => city.id === neighborId);
    return isPlayerCity(neighbor);
  });
}

export function getAttackSourceCity(cities, targetCityId) {
  const targetCity = cities.find((city) => city.id === targetCityId);

  if (!targetCity) {
    return null;
  }

  return targetCity.neighbors
    .map((neighborId) => cities.find((city) => city.id === neighborId))
    .find((neighbor) => isPlayerCity(neighbor)) ?? null;
}

export function getEnemyInvasionCandidates(cities) {
  const candidates = [];

  for (const attackerCity of cities) {
    if (!isEnemyCity(attackerCity)) {
      continue;
    }

    for (const neighborId of attackerCity.neighbors) {
      const defenderCity = cities.find((city) => city.id === neighborId);

      if (!isPlayerCity(defenderCity)) {
        continue;
      }

      candidates.push({
        attackerCityId: attackerCity.id,
        defenderCityId: defenderCity.id,
      });
    }
  }

  return candidates;
}

export function rollEnemyInvasion(cities, chance = ENEMY_INVASION_CHANCE, randomValue = Math.random()) {
  const candidates = getEnemyInvasionCandidates(cities);

  if (candidates.length === 0 || randomValue >= chance) {
    return null;
  }

  const selectedIndex = Math.floor(Math.random() * candidates.length);
  return candidates[selectedIndex] ?? null;
}

export function occupyCity(cities, cityId, ownerFactionId = FACTION_IDS.PLAYER) {
  return cities.map((city) =>
    city.id === cityId ? { ...city, ownerFactionId } : city,
  );
}

export function initializeCityDomesticData(cities) {
  return cities.map((city) => ({
    ...city,
    ownerFactionId: normalizeCityOwnerFactionId(city),
    type: city.type ?? CITY_TYPES.PRODUCTION_CITY,
    population: Number.isFinite(city.population) ? city.population : (cityPopulationPresets[city.id] ?? 30000),
    commerceRating: city.commerceRating ?? 3,
    cityLoyalty: city.cityLoyalty ?? 75,
    governorHeroId: city.governorHeroId ?? (normalizeCityOwnerFactionId(city) === FACTION_IDS.PLAYER ? null : (cityGovernorPresets[city.id] ?? null)),
    governorPolicy: normalizeGovernorPolicy(city.governorPolicy),
    tradeSettings: normalizeCityTradeSettings(city.tradeSettings),
    domestic: {
      ...defaultCityDomestic,
      ...(city.domestic ?? {}),
      [DOMESTIC_STAT_KEYS.PUBLIC_SUPPORT]: city.domestic?.[DOMESTIC_STAT_KEYS.PUBLIC_SUPPORT]
        ?? city.domestic?.[DOMESTIC_STAT_KEYS.MORALE]
        ?? defaultCityDomestic[DOMESTIC_STAT_KEYS.PUBLIC_SUPPORT],
    },
    resources: {
      ...defaultCityResources,
      ...(city.resources ?? {}),
    },
    yields: {
      ...defaultCityYields,
      ...(city.yields ?? {}),
    },
    military: {
      ...defaultCityMilitary,
      ...(cityMilitaryPresets[city.id] ?? {}),
      ...(city.military ?? {}),
      woundedQueue: Array.isArray(city.military?.woundedQueue) ? city.military.woundedQueue : [],
    },
  }));
}

export function initializeHeroLocationsFromRosters() {
  const initializedHeroes = [];

  for (const [cityId, heroIds] of Object.entries(battleRosters.cityDefenderRosters ?? {})) {
    for (const heroId of heroIds) {
      const hero = heroes.find((entry) => entry.id === heroId);

      if (!hero || hero.active === false || hero.isActiveRoster === false || hero.isReserve === true || hero.locationCityId) {
        continue;
      }

      hero.locationCityId = cityId;
      initializedHeroes.push({
        id: hero.id,
        name: hero.name,
        locationCityId: cityId,
      });
    }
  }

  return initializedHeroes;
}

export function getHeroIdsBySideAndLocation(cityId, factionId) {
  return heroes
    .filter((hero) => {
      const matchesFaction = factionId === FACTION_IDS.ENEMY
        ? isEnemyFactionId(hero.side)
        : hero.side === factionId;
      return matchesFaction
        && hero.active !== false
        && hero.isActiveRoster !== false
        && hero.isReserve !== true
        && hero.locationCityId === cityId;
    })
    .map((hero) => hero.id);
}

export function getTransferableHeroesFromCity(cityId, factionId = FACTION_IDS.PLAYER) {
  return heroes.filter((hero) => {
    const matchesFaction = factionId === FACTION_IDS.ENEMY
      ? isEnemyFactionId(hero.side)
      : hero.side === factionId;
    return matchesFaction
      && hero.active !== false
      && hero.isActiveRoster !== false
      && hero.isReserve !== true
      && hero.locationCityId === cityId;
  });
}

export function getFactionOwnedDestinationCities(cities, factionId = FACTION_IDS.PLAYER, excludeCityId = null) {
  return cities.filter((city) => city.ownerFactionId === factionId && city.id !== excludeCityId);
}

export function transferHeroToCity(heroId, targetCityId, cities, factionId = FACTION_IDS.PLAYER) {
  const hero = heroes.find((entry) => entry.id === heroId) ?? null;

  if (!hero) {
    return { ok: false, reason: "missing_hero" };
  }

  if (hero.side !== factionId) {
    return { ok: false, reason: "invalid_hero_faction" };
  }

  const targetCity = cities.find((city) => city.id === targetCityId) ?? null;

  if (!targetCity) {
    return { ok: false, reason: "missing_target_city" };
  }

  if (targetCity.ownerFactionId !== factionId) {
    return { ok: false, reason: "invalid_target_faction" };
  }

  const fromCityId = hero.locationCityId ?? null;
  const sourceCity = cities.find((city) => city.id === fromCityId) ?? null;

  if (!sourceCity || sourceCity.ownerFactionId !== factionId) {
    return { ok: false, reason: "invalid_source_faction" };
  }

  if (fromCityId === targetCityId) {
    return { ok: false, reason: "same_city" };
  }

  hero.locationCityId = targetCityId;

  return {
    ok: true,
    heroId: hero.id,
    heroName: hero.name,
    fromCityId,
    targetCityId,
  };
}

export function convertCityHeroesToFaction(cityId, factionId) {
  const convertedHeroes = [];

  initializeHeroLocationsFromRosters();

  for (const hero of heroes) {
    if (hero.locationCityId !== cityId) {
      continue;
    }

    const sideChanged = hero.side !== factionId;
    hero.side = factionId;
    hero.locationCityId = cityId;

    if (!sideChanged) {
      continue;
    }

    convertedHeroes.push({
      id: hero.id,
      name: hero.name,
    });
  }

  return convertedHeroes;
}

export function recruitCityHeroesToFaction(cityId, factionId) {
  return convertCityHeroesToFaction(cityId, factionId);
}

export function isWorldUnified(cities) {
  return cities.every((city) => isPlayerCity(city));
}
