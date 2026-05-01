import {
  createInitialAppState,
  retreatFromBattle,
  returnFromBattle,
  selectCity,
  startBattle,
  updateBattleState,
} from "./core/app_state.js";
import {
  attackUnit,
  defendSelectedUnit,
  endPlayerTurn,
  performAutoBattleStep,
  enterSkillMode,
  enterStrategyMode,
  moveSelectedUnit,
  runEnemyTurn,
  selectBattleUnit,
  setAutoBattleEnabled,
  setSelectedUnitFacing,
  shouldAutoAdvanceTurn,
  useSelectedUnitSkill,
  useSelectedUnitStrategy,
  waitSelectedUnit,
} from "./core/battle_rules.js";
import { renderLayout } from "./ui/layout_ui.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

let appState = createInitialAppState();
let autoBattleTimerId = null;

function clearAutoBattleTimer() {
  if (autoBattleTimerId) {
    window.clearTimeout(autoBattleTimerId);
    autoBattleTimerId = null;
  }
}

function maybeRunAutoEnemyTurn(battleState) {
  if (!battleState || battleState.status !== "active") {
    return battleState;
  }

  if (!shouldAutoAdvanceTurn(battleState) || battleState.turnOwner !== "player") {
    return battleState;
  }

  return runEnemyTurn(endPlayerTurn(battleState));
}

function resolveAfterPlayerAction(battleState) {
  if (!battleState || battleState.status !== "active") {
    return battleState;
  }

  return maybeRunAutoEnemyTurn(battleState);
}

function canUseManualBattleControls() {
  return Boolean(
    appState.battle
    && appState.battle.status === "active"
    && !appState.battle.autoBattleEnabled,
  );
}

function scheduleAutoBattleStep() {
  clearAutoBattleTimer();

  if (
    !appState.battle
    || !appState.battle.autoBattleEnabled
    || appState.battle.status !== "active"
    || appState.battle.turnOwner !== "player"
  ) {
    return;
  }

  autoBattleTimerId = window.setTimeout(() => {
    autoBattleTimerId = null;

    if (
      !appState.battle
      || !appState.battle.autoBattleEnabled
      || appState.battle.status !== "active"
      || appState.battle.turnOwner !== "player"
    ) {
      return;
    }

    appState = updateBattleState(appState, performAutoBattleStep(appState.battle));
    rerender();
  }, 360);
}

function rerender() {
  clearAutoBattleTimer();

  renderLayout(appRoot, appState, {
    onCitySelect: (cityId) => {
      appState = selectCity(appState, cityId);
      rerender();
    },
    onAttackCity: (cityId) => {
      appState = startBattle(appState, cityId);
      rerender();
    },
    onBattleSelectUnit: (unitId) => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, selectBattleUnit(appState.battle, unitId));
      rerender();
    },
    onBattleMoveUnit: (position) => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, moveSelectedUnit(appState.battle, position));
      rerender();
    },
    onBattleAttackUnit: (targetUnitId) => {
      if (!canUseManualBattleControls() || !appState.battle.selectedUnitId) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(
        attackUnit(appState.battle, appState.battle.selectedUnitId, targetUnitId),
      );
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleSetFacing: (direction) => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, setSelectedUnitFacing(appState.battle, direction));
      rerender();
    },
    onBattleEnterAttackMode: () => {
      if (!canUseManualBattleControls() || !appState.battle?.selectedUnitId) {
        return;
      }

      appState = updateBattleState(appState, selectBattleUnit(appState.battle, appState.battle.selectedUnitId));
      rerender();
    },
    onBattleUseSkill: (targetUnitId) => {
      if (!canUseManualBattleControls() || !appState.battle.selectedUnitId) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(
        useSelectedUnitSkill(appState.battle, targetUnitId),
      );
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleEnterStrategyMode: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, enterStrategyMode(appState.battle));
      rerender();
    },
    onBattleUseStrategy: (targetUnitId) => {
      if (!canUseManualBattleControls() || !appState.battle.selectedUnitId) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(
        useSelectedUnitStrategy(appState.battle, targetUnitId),
      );
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleDefend: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(defendSelectedUnit(appState.battle));
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleWait: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(waitSelectedUnit(appState.battle));
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleEnterSkillMode: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      const selectedUnit = appState.battle.units.find((unit) => unit.id === appState.battle.selectedUnitId) ?? null;
      const selectedSkill = selectedUnit
        ? appState.battle.skills.find((skill) => skill.id === selectedUnit.skillId) ?? null
        : null;

      if (!selectedSkill || !selectedUnit) {
        return;
      }

      let nextBattleState = appState.battle;

      if (
        selectedSkill.effectType === "ally_attack_buff" ||
        selectedSkill.effectType === "cannon_aoe" ||
        selectedSkill.target === "enemy_all_in_range"
      ) {
        nextBattleState = resolveAfterPlayerAction(useSelectedUnitSkill(appState.battle));
      } else {
        nextBattleState = enterSkillMode(appState.battle);
      }

      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleEndTurn: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, runEnemyTurn(endPlayerTurn(appState.battle)));
      rerender();
    },
    onBattleToggleAutoBattle: () => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      appState = updateBattleState(
        appState,
        setAutoBattleEnabled(appState.battle, !appState.battle.autoBattleEnabled),
      );
      rerender();
    },
    onBattleRetreat: () => {
      clearAutoBattleTimer();
      appState = retreatFromBattle(appState);
      rerender();
    },
    onBattleReturnToWorld: () => {
      clearAutoBattleTimer();
      appState = returnFromBattle(appState);
      rerender();
    },
  });

  if (appState.battle?.autoBattleEnabled && appState.battle.status === "active" && appState.battle.turnOwner === "player") {
    scheduleAutoBattleStep();
  }
}

rerender();
