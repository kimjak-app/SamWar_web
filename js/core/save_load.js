import { gameStore } from "./GameStore.js";
import { heroes as canonicalHeroes } from "../../data/heroes.js";
import { normalizeDomesticPolicy, normalizeResourceStock } from "./domestic_income.js";
import { deriveCalendarFromTurn } from "./world_calendar.js";

const SAVE_KEY = "samwar.save.v0.5-1d";
const SAVE_VERSION = "0.5-1d";

function getStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function hydrateCanonicalHeroes(savedHeroes) {
  if (!Array.isArray(savedHeroes)) {
    return canonicalHeroes;
  }

  for (const savedHero of savedHeroes) {
    const canonicalHero = canonicalHeroes.find((hero) => hero.id === savedHero?.id);

    if (canonicalHero) {
      Object.assign(canonicalHero, savedHero);
    }
  }

  return canonicalHeroes;
}

function hydrateLoadedState(state) {
  if (!state?.world) {
    return state;
  }

  return {
    ...state,
    domesticPolicy: normalizeDomesticPolicy(state.domesticPolicy),
    resources: normalizeResourceStock(state.resources),
    meta: {
      ...(state.meta ?? {}),
      calendar: deriveCalendarFromTurn(state.meta?.turn),
    },
    world: {
      ...state.world,
      heroes: hydrateCanonicalHeroes(state.world.heroes),
    },
  };
}

export function createSaveSnapshot(state = gameStore.getState()) {
  const selectedHeroId = state?.pendingHeroTransfer?.selectedHeroId
    ?? state?.pendingHeroDeployment?.selectedHeroIds?.[0]
    ?? state?.battle?.selectedUnitId
    ?? null;

  return {
    saveVersion: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    worldTurn: state?.meta?.turn ?? null,
    calendar: deriveCalendarFromTurn(state?.meta?.turn),
    currentPhase: state?.mode ?? null,
    nationalLoyalty: state?.meta?.nationalLoyalty ?? null,
    domesticPolicy: normalizeDomesticPolicy(state?.domesticPolicy),
    taxLevel: normalizeDomesticPolicy(state?.domesticPolicy).taxLevel,
    resources: normalizeResourceStock(state?.resources),
    selectedCityId: state?.selection?.cityId ?? null,
    selectedHeroId,
    cities: state?.world?.cities ?? [],
    heroes: state?.world?.heroes ?? [],
    state,
  };
}

export function saveGame() {
  const storage = getStorage();

  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  const snapshot = createSaveSnapshot();
  storage.setItem(SAVE_KEY, JSON.stringify(snapshot));

  return {
    ok: true,
    saveVersion: snapshot.saveVersion,
    savedAt: snapshot.savedAt,
  };
}

export function loadGame() {
  const storage = getStorage();

  if (!storage) {
    return { ok: false, reason: "storage_unavailable" };
  }

  const rawSave = storage.getItem(SAVE_KEY);

  if (!rawSave) {
    return { ok: false, reason: "missing_save" };
  }

  try {
    const snapshot = JSON.parse(rawSave);

    if (!snapshot || snapshot.saveVersion !== SAVE_VERSION || !snapshot.state) {
      return { ok: false, reason: "invalid_save", snapshot };
    }

    const loadedState = hydrateLoadedState(snapshot.state);
    gameStore.update(() => loadedState);

    return {
      ok: true,
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

  storage.removeItem(SAVE_KEY);
  return { ok: true };
}

export { SAVE_KEY, SAVE_VERSION };
