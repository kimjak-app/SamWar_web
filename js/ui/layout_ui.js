import { destroyBattleScene } from "../phaser/phaser_battle_mount.js";
import { renderBattleUI } from "./battle_ui.js";
import { renderWorldMap } from "./world_map_ui.js";

export function renderLayout(rootElement, appState, handlers = {}) {
  if (appState.mode === "battle") {
    renderBattleUI(rootElement, appState, handlers);
    return;
  }

  destroyBattleScene();
  renderWorldMap(rootElement, appState, handlers);
}
