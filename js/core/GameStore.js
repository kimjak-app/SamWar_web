import { deriveCalendarFromTurn } from "./world_calendar.js";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function syncCalendar(state) {
  if (!isObject(state) || !isObject(state.meta)) {
    return state;
  }

  return {
    ...state,
    meta: {
      ...state.meta,
      calendar: deriveCalendarFromTurn(state.meta.turn),
    },
  };
}

function createGameStore(initialState = null) {
  let state = syncCalendar(initialState);
  const listeners = new Set();

  function notify(nextState, previousState) {
    for (const listener of [...listeners]) {
      try {
        listener(nextState, previousState);
      } catch (error) {
        console.error("[GameStore] listener failed", error);
      }
    }
  }

  function getState() {
    return state;
  }

  function setState(patch) {
    const previousState = state;
    const nextState = isObject(previousState) && isObject(patch)
      ? { ...previousState, ...patch }
      : patch;

    state = syncCalendar(nextState);
    notify(state, previousState);
    return state;
  }

  function update(updaterFn) {
    if (typeof updaterFn !== "function") {
      return state;
    }

    const previousState = state;
    const nextState = updaterFn(state);

    if (typeof nextState === "undefined" || nextState === previousState) {
      return state;
    }

    state = syncCalendar(nextState);
    notify(state, previousState);
    return state;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      return () => {};
    }

    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSelectedCityId() {
    return state?.selection?.cityId ?? null;
  }

  function getSelectedHeroId() {
    return state?.pendingHeroTransfer?.selectedHeroId
      ?? state?.pendingHeroDeployment?.selectedHeroIds?.[0]
      ?? state?.battle?.selectedUnitId
      ?? null;
  }

  function getWorldTurn() {
    return state?.meta?.turn ?? null;
  }

  function getCurrentPhase() {
    return state?.mode ?? null;
  }

  return {
    getState,
    setState,
    update,
    subscribe,
    getSelectedCityId,
    getSelectedHeroId,
    getWorldTurn,
    getCurrentPhase,
  };
}

export const gameStore = createGameStore(null);

export { createGameStore, gameStore as GameStore };
