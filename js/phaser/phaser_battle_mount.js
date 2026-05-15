import { createBattleSceneDefinition } from "./battle_scene.js";

let currentGame = null;
let currentBattleId = null;
let currentScene = null;
let currentContainer = null;
let pendingBattleState = null;
let pendingCallbacks = null;

function clearContainer(container) {
  if (container) {
    container.innerHTML = "";
  }
}

export function destroyBattleScene() {
  if (currentGame) {
    currentGame.destroy(true);
  }

  clearContainer(currentContainer);
  currentGame = null;
  currentBattleId = null;
  currentScene = null;
  currentContainer = null;
  pendingBattleState = null;
  pendingCallbacks = null;
}

export function mountBattleScene(containerElement, battleState, callbacks = {}) {
  if (!containerElement || !battleState) {
    return;
  }

  if (!window.Phaser) {
    containerElement.innerHTML = `
      <div class="battle-phaser-fallback">
        Phaser를 불러오지 못했습니다. 브라우저를 새로고침한 뒤 다시 시도하세요.
      </div>
    `;
    return;
  }

  const PhaserLib = window.Phaser;
  const sameBattle = currentBattleId === battleState.id;
  const sameContainer = currentContainer === containerElement;

  if (currentGame && sameBattle && sameContainer) {
    pendingBattleState = battleState;
    pendingCallbacks = callbacks;
    currentScene?.syncBattleState?.(battleState, callbacks);
    return;
  }

  if (currentGame && (!sameBattle || !sameContainer)) {
    destroyBattleScene();
  }

  currentBattleId = battleState.id;
  currentContainer = containerElement;
  pendingBattleState = battleState;
  pendingCallbacks = callbacks;
  clearContainer(containerElement);

  const BattleScene = createBattleSceneDefinition({
    battleState,
    callbacks,
    onSceneReady: (sceneInstance) => {
      currentScene = sceneInstance;
      currentScene.syncBattleState?.(pendingBattleState ?? battleState, pendingCallbacks ?? callbacks);
      callbacks.onBattleSceneReady?.(sceneInstance);
    },
  });

  currentGame = new PhaserLib.Game({
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
