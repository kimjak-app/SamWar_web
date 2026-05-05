import { cities } from "../../data/cities.js";
import { factions } from "../../data/factions.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";
import { createInitialBattleState } from "./battle_state.js";
import { canAttackCity, getAttackSourceCity, occupyCity } from "./world_rules.js";

const DEFAULT_SELECTED_CITY_ID = "hanseong";

export function createInitialAppState() {
  return {
    meta: {
      title: "SamWar Web",
      phase: "World Map 4-City MVP",
      status: "전투 없이 도시 선택과 진군 경로만 확인 가능한 첫 플레이 화면",
      playerFactionId: "player",
      turn: 1,
    },
    mode: "world",
    selection: {
      cityId: DEFAULT_SELECTED_CITY_ID,
    },
    battle: null,
    pendingBattleChoice: null,
    world: {
      cities,
      factions,
      heroes,
      skills,
    },
  };
}

export function selectCity(appState, cityId) {
  return {
    ...appState,
    selection: {
      ...appState.selection,
      cityId,
    },
    pendingBattleChoice: null,
  };
}

function buildPendingBattleChoice(appState, cityId) {
  const defenderCity = appState.world.cities.find((city) => city.id === cityId);
  const attackerCity = getAttackSourceCity(appState.world.cities, cityId);

  if (!defenderCity || !attackerCity || !canAttackCity(appState.world.cities, defenderCity)) {
    return null;
  }

  return {
    type: "attack",
    originCityId: attackerCity.id,
    originCityName: attackerCity.name,
    targetCityId: defenderCity.id,
    targetCityName: defenderCity.name,
    isRemoteBattle: attackerCity.id !== DEFAULT_SELECTED_CITY_ID,
  };
}

export function openBattleChoice(appState, cityId) {
  const pendingBattleChoice = buildPendingBattleChoice(appState, cityId);

  if (!pendingBattleChoice) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice,
  };
}

export function cancelBattleChoice(appState) {
  if (!appState.pendingBattleChoice) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice: null,
  };
}

export function startBattle(appState, cityId, options = {}) {
  const defenderCity = appState.world.cities.find((city) => city.id === cityId);
  const attackerCity = getAttackSourceCity(appState.world.cities, cityId);

  if (!defenderCity || !attackerCity || !canAttackCity(appState.world.cities, defenderCity)) {
    return appState;
  }

  return {
    ...appState,
    mode: "battle",
    pendingBattleChoice: null,
    selection: {
      ...appState.selection,
      cityId: defenderCity.id,
    },
    battle: createInitialBattleState({
      attackerCity,
      defenderCity,
      autoBattleEnabled: options.autoBattleEnabled === true,
    }),
  };
}

export function updateBattleState(appState, battleState) {
  return {
    ...appState,
    battle: battleState,
  };
}

export function retreatFromBattle(appState) {
  return {
    ...appState,
    mode: "world",
    battle: null,
    pendingBattleChoice: null,
  };
}

export function returnFromBattle(appState) {
  const { battle } = appState;

  if (!battle) {
    return retreatFromBattle(appState);
  }

  if (battle.status === "won") {
    const updatedCities = occupyCity(
      appState.world.cities,
      battle.defenderCityId,
      appState.meta.playerFactionId,
    );

    return {
      ...appState,
      mode: "world",
      battle: null,
      pendingBattleChoice: null,
      selection: {
        ...appState.selection,
        cityId: battle.defenderCityId,
      },
      world: {
        ...appState.world,
        cities: updatedCities,
      },
    };
  }

  return {
    ...appState,
    mode: "world",
    battle: null,
    pendingBattleChoice: null,
  };
}
