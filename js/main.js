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
  canResolveCounterattack,
  cancelBattleActionMode,
  cancelPendingMove,
  defendSelectedUnit,
  finishEnemyTurn,
  enterAttackMode,
  endPlayerTurn,
  hasPendingEnemyActions,
  performAutoBattleStep,
  resolvePendingCounter,
  runNextEnemyAction,
  enterSkillMode,
  enterStrategyMode,
  moveSelectedUnit,
  selectBattleUnit,
  setAutoBattleEnabled,
  setSelectedUnitFacing,
  startEnemyTurn,
  shouldAutoAdvanceTurn,
  useSelectedUnitSkill,
  useSelectedUnitStrategy,
  waitSelectedUnit,
} from "./core/battle_rules.js";
import {
  initializeBgmManager,
  playBattleBgm,
  playWorldMapBgm,
} from "./audio/bgm_manager.js";
import { getSkillById } from "./core/battle_skills.js";
import { renderLayout } from "./ui/layout_ui.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

let appState = createInitialAppState();
let autoBattleTimerId = null;
let battleTempoLocked = false;
let activeSkillCutin = null;
const battleTempoTimerIds = new Set();

const BATTLE_TEMPO = {
  counterDelayMs: 1100,
  enemyActionLeadMs: 1000,
  enemyActionDelayMs: 1250,
  autoBattleDelayMs: 1050,
};

initializeBgmManager();

function syncBgmWithMode() {
  if (appState.mode === "battle" && appState.battle) {
    playBattleBgm();
    return;
  }

  playWorldMapBgm();
}

function clearAutoBattleTimer() {
  if (autoBattleTimerId) {
    window.clearTimeout(autoBattleTimerId);
    autoBattleTimerId = null;
  }
}

function clearBattleTempoTimers({ unlock = true } = {}) {
  for (const timerId of battleTempoTimerIds) {
    window.clearTimeout(timerId);
  }

  battleTempoTimerIds.clear();
  activeSkillCutin = null;

  if (unlock) {
    battleTempoLocked = false;
  }
}

function scheduleBattleTempoTimer(callback, delayMs, battleId = appState.battle?.id ?? null) {
  const timerId = window.setTimeout(() => {
    battleTempoTimerIds.delete(timerId);

    if (!appState.battle || appState.battle.id !== battleId) {
      return;
    }

    callback();
  }, delayMs);

  battleTempoTimerIds.add(timerId);
  return timerId;
}

function getRenderableAppState() {
  if (!appState.battle) {
    return appState;
  }

  return {
    ...appState,
    battle: {
      ...appState.battle,
      tempoLockActive: battleTempoLocked,
      activeSkillCutin,
    },
  };
}

function getSelectedBattleSkill(battleState) {
  const selectedUnit = battleState?.units.find((unit) => unit.id === battleState.selectedUnitId) ?? null;

  if (!selectedUnit) {
    return null;
  }

  return getSkillById(battleState.skills, selectedUnit.skillId);
}

function applyBattleState(nextBattleState) {
  appState = updateBattleState(appState, nextBattleState);
  rerender();
}

function finishPlayerFlow(nextBattleState) {
  if (!nextBattleState || nextBattleState.status !== "active") {
    applyBattleState(nextBattleState);
    return;
  }

  if (shouldAutoAdvanceTurn(nextBattleState) && nextBattleState.turnOwner === "player") {
    startEnemyTurnSequence(endPlayerTurn(nextBattleState));
    return;
  }

  applyBattleState(nextBattleState);
}

function finalizeBattleTempo(nextBattleState) {
  activeSkillCutin = null;
  battleTempoLocked = false;
  finishPlayerFlow(nextBattleState);
}

function resolveActiveSkillCutin(cutinState) {
  if (!cutinState) {
    battleTempoLocked = false;
    rerender();
    return;
  }

  activeSkillCutin = null;

  if (!appState.battle || appState.battle.id !== cutinState.battleId) {
    battleTempoLocked = false;
    rerender();
    return;
  }

  const battleState = appState.battle;
  const casterUnit = battleState.units.find((unit) => unit.id === cutinState.casterUnitId) ?? null;
  const selectedSkill = getSelectedBattleSkill(battleState);
  const targetUnit = cutinState.targetUnitId
    ? battleState.units.find((unit) => unit.id === cutinState.targetUnitId) ?? null
    : null;

  if (
    !casterUnit
    || !casterUnit.isAlive
    || battleState.selectedUnitId !== cutinState.casterUnitId
    || !selectedSkill
    || selectedSkill.id !== cutinState.skillId
    || (cutinState.targetUnitId && (!targetUnit || !targetUnit.isAlive))
  ) {
    battleTempoLocked = false;
    rerender();
    return;
  }

  finalizeBattleTempo(useSelectedUnitSkill(battleState, cutinState.targetUnitId));
}

function startSkillCutinSequence(targetUnitId) {
  if (!appState.battle || !appState.battle.selectedUnitId) {
    return;
  }

  const selectedUnit = appState.battle.units.find((unit) => unit.id === appState.battle.selectedUnitId) ?? null;
  const selectedSkill = getSelectedBattleSkill(appState.battle);

  if (!selectedUnit || !selectedSkill?.cutinImage) {
    finishPlayerFlow(useSelectedUnitSkill(appState.battle, targetUnitId));
    return;
  }

  clearAutoBattleTimer();
  clearBattleTempoTimers({ unlock: false });
  battleTempoLocked = true;
  activeSkillCutin = {
    battleId: appState.battle.id,
    casterUnitId: selectedUnit.id,
    targetUnitId,
    skillId: selectedSkill.id,
    image: selectedSkill.cutinImage,
    durationMs: selectedSkill.cutinDurationMs ?? 1400,
    style: selectedSkill.cutinStyle ?? "default",
  };
  const scheduledCutinState = activeSkillCutin;
  rerender();

  scheduleBattleTempoTimer(
    () => resolveActiveSkillCutin(scheduledCutinState),
    scheduledCutinState.durationMs,
    scheduledCutinState.battleId,
  );
}

function resolveDelayedCounterattack(attackerUnitId, defenderUnitId, battleId) {
  scheduleBattleTempoTimer(() => {
    const resolvedBattleState = resolvePendingCounter(appState.battle, attackerUnitId, defenderUnitId);
    finalizeBattleTempo(resolvedBattleState);
  }, BATTLE_TEMPO.counterDelayMs, battleId);
}

function stepEnemyTurnSequence(battleId) {
  if (!appState.battle || appState.battle.id !== battleId || appState.battle.turnOwner !== "enemy") {
    battleTempoLocked = false;
    rerender();
    return;
  }

  const nextBattleState = runNextEnemyAction(appState.battle);
  applyBattleState(nextBattleState);

  if (nextBattleState.status !== "active") {
    battleTempoLocked = false;
    rerender();
    return;
  }

  if (!hasPendingEnemyActions(nextBattleState)) {
    battleTempoLocked = false;
    applyBattleState(finishEnemyTurn(nextBattleState));
    return;
  }

  scheduleBattleTempoTimer(
    () => stepEnemyTurnSequence(battleId),
    BATTLE_TEMPO.enemyActionDelayMs,
    battleId,
  );
}

function startEnemyTurnSequence(enemyTurnState) {
  clearAutoBattleTimer();
  clearBattleTempoTimers();
  battleTempoLocked = true;

  const startedEnemyTurnState = startEnemyTurn(enemyTurnState);
  applyBattleState(startedEnemyTurnState);

  if (startedEnemyTurnState.status !== "active") {
    battleTempoLocked = false;
    rerender();
    return;
  }

  if (!hasPendingEnemyActions(startedEnemyTurnState)) {
    battleTempoLocked = false;
    applyBattleState(finishEnemyTurn(startedEnemyTurnState));
    return;
  }

  scheduleBattleTempoTimer(
    () => stepEnemyTurnSequence(startedEnemyTurnState.id),
    BATTLE_TEMPO.enemyActionLeadMs,
    startedEnemyTurnState.id,
  );
}

function canUseManualBattleControls() {
  return Boolean(
    appState.battle
    && appState.battle.status === "active"
    && !battleTempoLocked
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
    || battleTempoLocked
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
      || battleTempoLocked
    ) {
      return;
    }

    const nextBattleState = performAutoBattleStep(appState.battle);
    finishPlayerFlow(nextBattleState);
  }, BATTLE_TEMPO.autoBattleDelayMs);
}

function rerender() {
  clearAutoBattleTimer();
  syncBgmWithMode();

  renderLayout(appRoot, getRenderableAppState(), {
    onCitySelect: (cityId) => {
      clearBattleTempoTimers();
      appState = selectCity(appState, cityId);
      rerender();
    },
    onAttackCity: (cityId) => {
      clearBattleTempoTimers();
      clearAutoBattleTimer();
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

      const attackerUnitId = appState.battle.selectedUnitId;
      const nextBattleState = attackUnit(
        appState.battle,
        attackerUnitId,
        targetUnitId,
        { deferCounter: true },
      );

      if (nextBattleState.status !== "active") {
        applyBattleState(nextBattleState);
        return;
      }

      if (canResolveCounterattack(nextBattleState, attackerUnitId, targetUnitId)) {
        battleTempoLocked = true;
        applyBattleState(nextBattleState);
        resolveDelayedCounterattack(attackerUnitId, targetUnitId, nextBattleState.id);
        return;
      }

      finishPlayerFlow(nextBattleState);
    },
    onBattleSetFacing: (direction) => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, setSelectedUnitFacing(appState.battle, direction));
      rerender();
    },
    onBattleCancelPendingMove: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, cancelPendingMove(appState.battle));
      rerender();
    },
    onBattleCancelActionMode: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      appState = updateBattleState(appState, cancelBattleActionMode(appState.battle));
      rerender();
    },
    onBattleEnterAttackMode: () => {
      if (!canUseManualBattleControls() || !appState.battle?.selectedUnitId) {
        return;
      }

      appState = updateBattleState(appState, enterAttackMode(appState.battle));
      rerender();
    },
    onBattleUseSkill: (targetUnitId) => {
      if (!canUseManualBattleControls() || !appState.battle.selectedUnitId) {
        return;
      }

      const selectedSkill = getSelectedBattleSkill(appState.battle);

      if (selectedSkill?.cutinImage) {
        startSkillCutinSequence(targetUnitId);
        return;
      }

      finishPlayerFlow(useSelectedUnitSkill(appState.battle, targetUnitId));
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

      finishPlayerFlow(useSelectedUnitStrategy(appState.battle, targetUnitId));
    },
    onBattleDefend: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      finishPlayerFlow(defendSelectedUnit(appState.battle));
    },
    onBattleWait: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      finishPlayerFlow(waitSelectedUnit(appState.battle));
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

      appState = updateBattleState(appState, enterSkillMode(appState.battle));
      rerender();
    },
    onBattleEndTurn: () => {
      if (!canUseManualBattleControls()) {
        return;
      }

      startEnemyTurnSequence(endPlayerTurn(appState.battle));
    },
    onBattleToggleAutoBattle: () => {
      if (!appState.battle || appState.battle.status !== "active" || battleTempoLocked) {
        return;
      }

      appState = updateBattleState(
        appState,
        setAutoBattleEnabled(appState.battle, !appState.battle.autoBattleEnabled),
      );
      rerender();
    },
    onBattleRetreat: () => {
      if (battleTempoLocked && appState.battle?.status === "active") {
        return;
      }

      clearAutoBattleTimer();
      clearBattleTempoTimers();
      appState = retreatFromBattle(appState);
      rerender();
    },
    onBattleReturnToWorld: () => {
      clearAutoBattleTimer();
      clearBattleTempoTimers();
      appState = returnFromBattle(appState);
      rerender();
    },
  });

  if (
    appState.battle?.autoBattleEnabled
    && appState.battle.status === "active"
    && appState.battle.turnOwner === "player"
    && !battleTempoLocked
  ) {
    scheduleAutoBattleStep();
  }
}

rerender();
