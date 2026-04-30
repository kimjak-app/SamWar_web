import { cities } from "../../data/cities.js";
import { factions } from "../../data/factions.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";
import { occupyCity } from "./world_rules.js";

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
    selection: {
      cityId: DEFAULT_SELECTED_CITY_ID,
    },
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

export function attackCity(appState, cityId) {
  const updatedCities = occupyCity(appState.world.cities, cityId, appState.meta.playerFactionId);
  const selectedCity = updatedCities.find((city) => city.id === cityId);

  return {
    ...appState,
    selection: {
      ...appState.selection,
      cityId: selectedCity?.id ?? appState.selection.cityId,
    },
    world: {
      ...appState.world,
      cities: updatedCities,
    },
  };
}
