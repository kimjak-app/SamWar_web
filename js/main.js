import { attackCity, createInitialAppState, selectCity } from "./core/app_state.js";
import { renderLayout } from "./ui/layout_ui.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

let appState = createInitialAppState();

function rerender() {
  renderLayout(appRoot, appState, {
    onCitySelect: (cityId) => {
      appState = selectCity(appState, cityId);
      rerender();
    },
    onAttackCity: (cityId) => {
      appState = attackCity(appState, cityId);
      rerender();
    },
  });
}

rerender();
