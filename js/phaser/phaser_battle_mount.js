import { createBattleSceneDefinition } from "./battle_scene.js";

let activeGame = null;
let activeContainer = null;

export function destroyBattleScene() {
  if (activeGame) {
    activeGame.destroy(true);
    activeGame = null;
  }

  if (activeContainer) {
    activeContainer.innerHTML = "";
    activeContainer = null;
  }
}

export function mountBattleScene(containerElement, battleState, callbacks = {}) {
  destroyBattleScene();

  if (!containerElement) {
    return;
  }

  activeContainer = containerElement;

  if (!window.Phaser) {
    containerElement.innerHTML = `
      <div class="battle-phaser-fallback">
        Phaser를 불러오지 못했습니다. 브라우저를 새로고침한 뒤 다시 시도하세요.
      </div>
    `;
    return;
  }

  const PhaserLib = window.Phaser;
  const BattleScene = createBattleSceneDefinition({ battleState, callbacks });

  activeGame = new PhaserLib.Game({
    type: PhaserLib.AUTO,
    parent: containerElement,
    width: 1200,
    height: 720,
    backgroundColor: "#081018",
    scene: [BattleScene],
    scale: {
      mode: PhaserLib.Scale.FIT,
      autoCenter: PhaserLib.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
    },
  });
}
