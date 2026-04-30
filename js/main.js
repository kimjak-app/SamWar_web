import { createInitialAppState } from "./core/app_state.js";
import { renderLayout } from "./ui/layout_ui.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

const appState = createInitialAppState();

renderLayout(appRoot, appState);
