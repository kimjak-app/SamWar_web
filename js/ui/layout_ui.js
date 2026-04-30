import { renderWorldMap } from "./world_map_ui.js";

export function renderLayout(rootElement, appState, handlers = {}) {
  renderWorldMap(rootElement, appState, handlers);
}
