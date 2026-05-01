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
  };
}

export function startBattle(appState, cityId) {
  const defenderCity = appState.world.cities.find((city) => city.id === cityId);
  const attackerCity = getAttackSourceCity(appState.world.cities, cityId);

  if (!defenderCity || !attackerCity || !canAttackCity(appState.world.cities, defenderCity)) {
    return appState;
  }

  return {
    ...appState,
    mode: "battle",
    selection: {
      ...appState.selection,
      cityId: defenderCity.id,
    },
    battle: createInitialBattleState({ attackerCity, defenderCity }),
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
  };
}
