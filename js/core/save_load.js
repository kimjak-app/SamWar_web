import { gameStore } from "./GameStore.js";
import { cities as canonicalCities } from "../../data/cities.js";
import { heroes as canonicalHeroes } from "../../data/heroes.js";
import {
  createInitialDomesticPolicy,
  createInitialEnemyResourceStock,
  createInitialResourceStock,
  normalizeDomesticPolicy,
  normalizeEnemyResourceStock,
  normalizeResourceStock,
} from "./domestic_income.js";
import { normalizeFactionRelations } from "./inter_faction_trade.js";
import { getDefaultFactionIdForCity, initializeCityDomesticData } from "./world_rules.js";
import { deriveCalendarFromTurn } from "./world_calendar.js";

const SAVE_KEY = "samwar.save.v0.5-8h";
const LEGACY_SAVE_KEYS = Object.freeze([
  "samwar.save.v0.5-8g",
  "samwar.save.v0.5-8f",
  "samwar.save.v0.5-8e",
  "samwar.save.v0.5-8c",
  "samwar.save.v0.5-8b",
  "samwar.save.v0.5-8",
  "samwar.save.v0.5-7c",
  "samwar.save.v0.5-7",
  "samwar.save.v0.5-6",
  "samwar.save.v0.5-5b",
  "samwar.save.v0.5-5a",
  "samwar.save.v0.5-5",
  "samwar.save.v0.5-4c",
  "samwar.save.v0.5-4b",
  "samwar.save.v0.5-4",
  "samwar.save.v0.5-3c",
  "samwar.save.v0.5-3b",
  "samwar.save.v0.5-1h",
]);
const SAVE_VERSION = "v0.5-8h";

function getStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function getSaveKeys() {
  return [SAVE_KEY, ...LEGACY_SAVE_KEYS];
}

function normalizeLegacyHeroSide(savedHero) {
  if (savedHero?.side !== "enemy") {
    return savedHero?.side;
  }

  return getDefaultFactionIdForCity(savedHero?.locationCityId, "enemy");
}

function hydrateCanonicalHeroes(savedHeroes) {
  if (!Array.isArray(savedHeroes)) {
    return canonicalHeroes;
  }

  for (const savedHero of savedHeroes) {
    const canonicalHero = canonicalHeroes.find((hero) => hero.id === savedHero?.id);

    if (canonicalHero) {
      Object.assign(canonicalHero, {
        ...savedHero,
        side: normalizeLegacyHeroSide(savedHero),
      });
    }
  }

  return canonicalHeroes;
}

function mergeCanonicalCities(savedCities) {
  if (!Array.isArray(savedCities)) {
    return canonicalCities;
  }

  const savedCityById = new Map(savedCities.map((city) => [city?.id, city]).filter(([cityId]) => Boolean(cityId)));

  return [
    ...canonicalCities.map((canonicalCity) => ({
      ...canonicalCity,
      ...(savedCityById.get(canonicalCity.id) ?? {}),
      neighbors: canonicalCity.neighbors,
      routeTypes: canonicalCity.routeTypes,
      x: canonicalCity.x,
      y: canonicalCity.y,
    })),
    ...savedCities.filter((city) => city?.id && !canonicalCities.some((canonicalCity) => canonicalCity.id === city.id)),
  ];
}

function getFallbackSelectedCityId(cities = [], selection = {}) {
  if (cities.some((city) => city.id === selection?.cityId)) {
    return selection.cityId;
  }

  return cities.find((city) => city.ownerFactionId === "player")?.id
    ?? cities[0]?.id
    ?? "hanseong";
}

function normalizeWorldOnlyState(savedState = {}, fallbackState = {}) {
  const fallbackWorld = fallbackState.world ?? {};
  const savedWorld = savedState.world ?? {};
  const cities = initializeCityDomesticData(mergeCanonicalCities(savedWorld.cities ?? fallbackWorld.cities));
  const heroes = hydrateCanonicalHeroes(savedWorld.heroes ?? fallbackWorld.heroes ?? []);
  const playerFactionId = savedState.meta?.playerFactionId
    ?? fallbackState.meta?.playerFactionId
    ?? "player";
  const selectedCityId = getFallbackSelectedCityId(cities, savedState.selection ?? fallbackState.selection);
  const originCityId = cities.some((city) => city.id === savedState.selection?.originCityId)
    ? savedState.selection.originCityId
    : selectedCityId;
  const turn = savedState.meta?.turn ?? fallbackState.meta?.turn ?? 1;
  const turnOwner = savedWorld.turnOwner === "player" ? "player" : "player";
  const relationState = {
    ...fallbackState,
    ...savedState,
    meta: {
      ...(fallbackState.meta ?? {}),
      ...(savedState.meta ?? {}),
      playerFactionId,
    },
    world: {
      ...fallbackWorld,
      ...savedWorld,
      cities,
      heroes,
      factions: savedWorld.factions ?? fallbackWorld.factions ?? [],
    },
  };

  return {
    ...fallbackState,
    ...savedState,
    mode: "world",
    battle: null,
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    pendingHeroTransfer: null,
    ui: {
      ...(fallbackState.ui ?? {}),
      saveMessage: "",
      tradeControlCityId: null,
      selectedCityDetailTab: "resources",
      isCityDetailOpen: true,
    },
    meta: {
      ...(fallbackState.meta ?? {}),
      ...(savedState.meta ?? {}),
      playerFactionId,
      turn,
      calendar: deriveCalendarFromTurn(turn),
    },
    selection: {
      ...(fallbackState.selection ?? {}),
      ...(savedState.selection ?? {}),
      cityId: selectedCityId,
      originCityId,
    },
    ruler: {
      currentCityId: savedState.ruler?.currentCityId
        ?? fallbackState.ruler?.currentCityId
        ?? "hanseong",
    },
    domesticPolicy: normalizeDomesticPolicy(
      savedState.domesticPolicy ?? createInitialDomesticPolicy(),
      heroes,
      playerFactionId,
    ),
    resources: normalizeResourceStock(savedState.resources ?? createInitialResourceStock()),
    enemyResources: normalizeEnemyResourceStock(savedState.enemyResources ?? createInitialEnemyResourceStock()),
    factionRelations: normalizeFactionRelations(relationState, savedState.factionRelations ?? fallbackState.factionRelations),
    world: {
      ...fallbackWorld,
      ...savedWorld,
      cities,
      heroes,
      factions: savedWorld.factions ?? fallbackWorld.factions ?? [],
      skills: savedWorld.skills ?? fallbackWorld.skills ?? [],
      turnOwner,
      pendingEnemyTurnResult: null,
      lastIncomeResult: savedWorld.lastIncomeResult ?? null,
      lastUpkeepResult: savedWorld.lastUpkeepResult ?? null,
      lastTaxResult: savedWorld.lastTaxResult ?? null,
      lastCityLoyaltyResult: savedWorld.lastCityLoyaltyResult ?? null,
      lastRecruitmentAction: savedWorld.lastRecruitmentAction ?? null,
      lastRecruitmentResult: savedWorld.lastRecruitmentResult ?? null,
      lastBattleTroopResult: savedWorld.lastBattleTroopResult ?? null,
      lastWoundedRecoveryResult: savedWorld.lastWoundedRecoveryResult ?? null,
      lastSupplyNetworkResult: savedWorld.lastSupplyNetworkResult ?? null,
      lastTroopRebalanceResult: savedWorld.lastTroopRebalanceResult ?? null,
      lastInterFactionTradeResult: savedWorld.lastInterFactionTradeResult ?? null,
    },
  };
}

export function createSaveSnapshot(state = gameStore.getState()) {
  const world = state?.world ?? {};

  return {
    saveVersion: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    worldTurn: state?.meta?.turn ?? null,
    calendar: deriveCalendarFromTurn(state?.meta?.turn),
    state: {
      meta: {
        ...(state?.meta ?? {}),
        calendar: deriveCalendarFromTurn(state?.meta?.turn),
      },
      mode: "world",
      selection: {
        cityId: state?.selection?.cityId ?? "hanseong",
        originCityId: state?.selection?.originCityId ?? state?.selection?.cityId ?? "hanseong",
      },
      ruler: {
        currentCityId: state?.ruler?.currentCityId ?? "hanseong",
      },
      domesticPolicy: state?.domesticPolicy ?? createInitialDomesticPolicy(),
      resources: normalizeResourceStock(state?.resources),
      enemyResources: normalizeEnemyResourceStock(state?.enemyResources),
      factionRelations: normalizeFactionRelations(state, state?.factionRelations),
      world: {
        cities: world.cities ?? [],
        factions: world.factions ?? [],
        heroes: world.heroes ?? [],
        skills: world.skills ?? [],
        turnOwner: world.turnOwner === "player" ? "player" : "player",
        pendingEnemyTurnResult: null,
        lastIncomeResult: world.lastIncomeResult ?? null,
        lastUpkeepResult: world.lastUpkeepResult ?? null,
        lastTaxResult: world.lastTaxResult ?? null,
        lastCityLoyaltyResult: world.lastCityLoyaltyResult ?? null,
        lastRecruitmentAction: world.lastRecruitmentAction ?? null,
        lastRecruitmentResult: world.lastRecruitmentResult ?? null,
        lastBattleTroopResult: world.lastBattleTroopResult ?? null,
        lastWoundedRecoveryResult: world.lastWoundedRecoveryResult ?? null,
        lastSupplyNetworkResult: world.lastSupplyNetworkResult ?? null,
        lastTroopRebalanceResult: world.lastTroopRebalanceResult ?? null,
        lastInterFactionTradeResult: world.lastInterFactionTradeResult ?? null,
      },
    },
  };
}

export function saveGame(state = gameStore.getState()) {
  const storage = getStorage();

  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  if (state?.mode !== "world" || state?.battle) {
    return { ok: false, reason: "not_world_mode" };
  }

  const snapshot = createSaveSnapshot(state);
  storage.setItem(SAVE_KEY, JSON.stringify(snapshot));

  return {
    ok: true,
    saveVersion: snapshot.saveVersion,
    savedAt: snapshot.savedAt,
  };
}

export function loadGame(fallbackState = gameStore.getState()) {
  const storage = getStorage();

  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  const saveKey = getSaveKeys().find((key) => storage.getItem(key));

  if (!saveKey) {
    return { ok: false, reason: "missing_save" };
  }

  try {
    const snapshot = JSON.parse(storage.getItem(saveKey));
    const savedState = snapshot?.state ?? snapshot;

    if (!savedState?.world) {
      return { ok: false, reason: "invalid_save", snapshot };
    }

    const loadedState = normalizeWorldOnlyState(savedState, fallbackState);
    gameStore.update(() => loadedState);

    return {
      ok: true,
      saveKey,
      snapshot: {
        ...snapshot,
        state: loadedState,
      },
    };
  } catch (error) {
    return {
      ok: false,
      reason: "parse_failed",
      error,
    };
  }
}

export function clearSave() {
  const storage = getStorage();

  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  for (const key of getSaveKeys()) {
    storage.removeItem(key);
  }

  return { ok: true };
}

export { SAVE_KEY, SAVE_VERSION };
