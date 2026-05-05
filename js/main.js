import {
  cancelBattleChoice,
  confirmEnemyTurnResult,
  createInitialAppState,
  endWorldTurn,
  openBattleChoice,
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
  executePlannedEnemyAction,
  finishEnemyTurn,
  enterAttackMode,
  endPlayerTurn,
  hasPendingEnemyActions,
  planNextEnemyAction,
  performAutoBattleStep,
  resolvePendingCounter,
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
  stopBgm,
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
let activeBattleResultCutin = null;
let activeBattleResultAudio = null;
let battleResultSequenceId = 0;
const battleTempoTimerIds = new Set();

const BATTLE_TEMPO = {
  counterDelayMs: 1100,
  enemyActionLeadMs: 1000,
  enemyActionDelayMs: 1250,
  autoBattleDelayMs: 1050,
};
const BATTLE_RESULT_FALLBACK_MS = 2000;
const BATTLE_RESULT_VICTORY_IMAGE = "./assets/skill_cutins/battle_result_victory.png";
const BATTLE_RESULT_DEFEAT_IMAGE = "./assets/skill_cutins/battle_result_defeat.png";
const BATTLE_RESULT_AUDIO = {
  won: "./assets/audio/result/battle_victory.mp3",
  lost: "./assets/audio/result/battle_defeat.mp3",
};

initializeBgmManager();

function syncBgmWithMode() {
  if (activeBattleResultCutin) {
    return;
  }

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
  activeBattleResultCutin = null;
  stopActiveBattleResultAudio();

  if (unlock) {
    battleTempoLocked = false;
  }
}

function stopActiveBattleResultAudio() {
  if (!activeBattleResultAudio) {
    return;
  }

  activeBattleResultAudio.pause();
  activeBattleResultAudio.currentTime = 0;
  activeBattleResultAudio = null;
}

function isResolvedBattleStatus(status) {
  return status === "won" || status === "lost";
}

function isBattleResultCutinActive() {
  return Boolean(activeBattleResultCutin);
}

function getAudioDurationMs(src) {
  return new Promise((resolve) => {
    const audio = new Audio(src);

    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve(Math.ceil(audio.duration * 1000));
        return;
      }

      resolve(BATTLE_RESULT_FALLBACK_MS);
    }, { once: true });

    audio.addEventListener("error", () => {
      resolve(BATTLE_RESULT_FALLBACK_MS);
    }, { once: true });

    audio.load();
  });
}

function playResultAudio(src) {
  const audio = new Audio(src);
  audio.volume = 0.9;

  const playPromise = audio.play();

  if (playPromise?.catch) {
    playPromise.catch(() => {
      // Ignore autoplay/playback errors and keep the result flow moving.
    });
  }

  return { audio, playPromise };
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
      activeBattleResultCutin,
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
  if (
    nextBattleState
    && isResolvedBattleStatus(nextBattleState.status)
    && (!activeBattleResultCutin || activeBattleResultCutin.battleId !== nextBattleState.id)
  ) {
    startBattleResultCutinSequence(nextBattleState);
    return;
  }

  appState = updateBattleState(appState, nextBattleState);
  rerender();
}

function finishBattleAfterResultCutin(battleId) {
  if (!appState.battle || appState.battle.id !== battleId || !isResolvedBattleStatus(appState.battle.status)) {
    activeBattleResultCutin = null;
    battleTempoLocked = false;
    stopActiveBattleResultAudio();
    rerender();
    return;
  }

  activeBattleResultCutin = null;
  battleTempoLocked = false;
  stopActiveBattleResultAudio();
  clearAutoBattleTimer();
  clearBattleTempoTimers();
  appState = returnFromBattle(appState);
  rerender();
}

async function startBattleResultCutinSequence(nextBattleState) {
  if (!nextBattleState || nextBattleState.status === "active") {
    appState = updateBattleState(appState, nextBattleState);
    rerender();
    return;
  }

  clearAutoBattleTimer();
  clearBattleTempoTimers({ unlock: false });
  battleTempoLocked = true;
  const isVictory = nextBattleState.status === "won";
  const resultAudioSrc = BATTLE_RESULT_AUDIO[nextBattleState.status] ?? null;
  const sequenceId = ++battleResultSequenceId;

  activeBattleResultCutin = {
    battleId: nextBattleState.id,
    result: nextBattleState.status,
    image: isVictory ? BATTLE_RESULT_VICTORY_IMAGE : BATTLE_RESULT_DEFEAT_IMAGE,
    audio: resultAudioSrc,
  };
  appState = updateBattleState(appState, nextBattleState);
  rerender();
  const scheduledResultCutin = activeBattleResultCutin;
  let durationMs = BATTLE_RESULT_FALLBACK_MS;

  if (resultAudioSrc) {
    stopBgm();
    durationMs = await getAudioDurationMs(resultAudioSrc);

    if (
      battleResultSequenceId !== sequenceId
      || !activeBattleResultCutin
      || activeBattleResultCutin.battleId !== scheduledResultCutin.battleId
      || !appState.battle
      || appState.battle.id !== scheduledResultCutin.battleId
    ) {
      return;
    }

    const { audio, playPromise } = playResultAudio(resultAudioSrc);
    activeBattleResultAudio = audio;

    if (playPromise) {
      try {
        await playPromise;
      } catch {
        durationMs = BATTLE_RESULT_FALLBACK_MS;
      }

      if (
        battleResultSequenceId !== sequenceId
        || !activeBattleResultCutin
        || activeBattleResultCutin.battleId !== scheduledResultCutin.battleId
        || !appState.battle
        || appState.battle.id !== scheduledResultCutin.battleId
      ) {
        stopActiveBattleResultAudio();
        return;
      }
    }
  }

  scheduleBattleTempoTimer(
    () => finishBattleAfterResultCutin(scheduledResultCutin.battleId),
    durationMs,
    scheduledResultCutin.battleId,
  );
}

function scheduleNextEnemyActionTimer(battleId = appState.battle?.id ?? null, delayMs = BATTLE_TEMPO.enemyActionDelayMs) {
  if (!appState.battle || !battleId || battleTempoTimerIds.size > 0) {
    return false;
  }

  scheduleBattleTempoTimer(
    () => stepEnemyTurnSequence(battleId),
    delayMs,
    battleId,
  );
  return true;
}

function ensurePlayerAutoBattleProgress() {
  if (
    !appState.battle
    || appState.battle.status !== "active"
    || appState.battle.turnOwner !== "player"
    || !appState.battle.autoBattleEnabled
    || battleTempoLocked
    || activeSkillCutin
    || activeBattleResultCutin
  ) {
    return false;
  }

  if (shouldAutoAdvanceTurn(appState.battle)) {
    startEnemyTurnSequence(endPlayerTurn(appState.battle));
    return true;
  }

  if (autoBattleTimerId || battleTempoTimerIds.size > 0) {
    return false;
  }

  scheduleAutoBattleStep();
  return true;
}

function ensureBattleProgress() {
  if (!appState.battle || appState.battle.status !== "active" || activeSkillCutin || activeBattleResultCutin) {
    return false;
  }

  if (battleTempoLocked && battleTempoTimerIds.size === 0 && !autoBattleTimerId) {
    battleTempoLocked = false;
  }

  if (appState.battle.turnOwner === "enemy") {
    if (hasPendingEnemyActions(appState.battle)) {
      battleTempoLocked = true;
      return scheduleNextEnemyActionTimer(appState.battle.id);
    }

    applyBattleState(finishEnemyTurn(appState.battle));
    return ensurePlayerAutoBattleProgress() || true;
  }

  return ensurePlayerAutoBattleProgress();
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
  ensureBattleProgress();
}

function finalizeBattleTempo(nextBattleState) {
  activeSkillCutin = null;
  battleTempoLocked = false;
  finishPlayerFlow(nextBattleState);
}

function continueEnemyTurnSequence(nextBattleState, battleId) {
  applyBattleState(nextBattleState);

  if (nextBattleState.status !== "active") {
    battleTempoLocked = false;
    rerender();
    return;
  }

  if (!hasPendingEnemyActions(nextBattleState)) {
    battleTempoLocked = false;
    applyBattleState(finishEnemyTurn(nextBattleState));
    ensureBattleProgress();
    return;
  }

  battleTempoLocked = true;
  if (!scheduleNextEnemyActionTimer(battleId)) {
    ensureBattleProgress();
  }
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

  if (cutinState.source === "enemy") {
    const nextBattleState = executePlannedEnemyAction(battleState, cutinState.plannedAction);
    continueEnemyTurnSequence(nextBattleState, cutinState.battleId);
    return;
  }

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

function startEnemySkillCutinSequence(plannedAction, selectedSkill) {
  if (!appState.battle || !plannedAction?.actorUnitId || !selectedSkill?.cutinImage) {
    return false;
  }

  clearAutoBattleTimer();
  clearBattleTempoTimers({ unlock: false });
  battleTempoLocked = true;
  activeSkillCutin = {
    source: "enemy",
    battleId: appState.battle.id,
    casterUnitId: plannedAction.actorUnitId,
    targetUnitId: plannedAction.targetUnitId ?? null,
    skillId: plannedAction.skillId,
    plannedAction,
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

  return true;
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

  const plannedAction = planNextEnemyAction(appState.battle);

  if (!plannedAction) {
    battleTempoLocked = false;
    applyBattleState(finishEnemyTurn(appState.battle));
    ensureBattleProgress();
    return;
  }

  if (plannedAction.type === "skill" && plannedAction.skillId) {
    const selectedSkill = getSkillById(appState.battle.skills, plannedAction.skillId);

    if (selectedSkill?.cutinImage && startEnemySkillCutinSequence(plannedAction, selectedSkill)) {
      return;
    }
  }

  const nextBattleState = executePlannedEnemyAction(appState.battle, plannedAction);
  continueEnemyTurnSequence(nextBattleState, battleId);
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
    ensureBattleProgress();
    return;
  }

  if (!scheduleNextEnemyActionTimer(startedEnemyTurnState.id, BATTLE_TEMPO.enemyActionLeadMs)) {
    ensureBattleProgress();
  }
}

function canUseManualBattleControls() {
  return Boolean(
    appState.battle
    && appState.battle.status === "active"
    && !battleTempoLocked
    && !activeBattleResultCutin
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
    || activeBattleResultCutin
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
      || activeBattleResultCutin
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
      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      if (appState.pendingBattleChoice?.type === "defense") {
        return;
      }

      clearBattleTempoTimers();
      appState = selectCity(appState, cityId);
      rerender();
    },
    onAttackCity: (cityId) => {
      if (appState.mode !== "world" || appState.world.turnOwner !== "player" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      appState = openBattleChoice(appState, cityId);
      rerender();
    },
    onBattleChoiceConfirm: ({ cityId, autoBattleEnabled }) => {
      clearBattleTempoTimers();
      clearAutoBattleTimer();
      appState = startBattle(appState, cityId, { autoBattleEnabled });
      rerender();
      if (autoBattleEnabled) {
        ensureBattleProgress();
      }
    },
    onBattleChoiceCancel: () => {
      clearBattleTempoTimers();
      clearAutoBattleTimer();
      appState = cancelBattleChoice(appState);
      rerender();
    },
    onEndWorldTurn: () => {
      if (appState.mode !== "world") {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      appState = endWorldTurn(appState);
      rerender();
    },
    onConfirmEnemyTurnResult: () => {
      if (appState.mode !== "world") {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      appState = confirmEnemyTurnResult(appState);
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
      ensureBattleProgress();
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
      if (isBattleResultCutinActive()) {
        return;
      }

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
    && !activeBattleResultCutin
  ) {
    ensurePlayerAutoBattleProgress();
  }
}

rerender();
