import {
  cancelBattleChoice,
  confirmEnemyTurnResult,
  createInitialAppState,
  endWorldTurn,
  retreatFromBattle,
  returnFromBattle,
  selectCity,
  setCityGovernorHeroId,
  setCityGovernorPolicy,
  setChancellorHeroId,
  setChancellorPolicy,
  setTaxLevel,
  startBattle,
  cancelHeroDeployment,
  cancelHeroTransfer,
  confirmHeroTransfer,
  openHeroDeployment,
  openDefenseHeroDeployment,
  openHeroTransfer,
  recruitCityTroops,
  selectHeroTransferHero,
  selectHeroTransferTargetCity,
  setDeploymentHeroTroops,
  toggleDeploymentHero,
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
import { eventBus } from "./core/EventBus.js";
import { gameStore } from "./core/GameStore.js";
import { getSkillById } from "./core/battle_skills.js";
import {
  clearSave,
  loadGame,
  saveGame,
} from "./core/save_load.js";
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
const emittedBattleEndIds = new Set();
const battleTempoTimerIds = new Set();
let eventDrivenRerenderQueued = false;

const BATTLE_TEMPO = {
  counterDelayMs: 1100,
  enemyActionLeadMs: 1000,
  enemyActionDelayMs: 1250,
  autoBattleDelayMs: 1050,
};
const BATTLE_RESULT_FALLBACK_MS = 2000;
const UNIQUE_SKILL_CUTIN_FALLBACK_MS = 2200;
const BATTLE_RESULT_VICTORY_IMAGE = "./assets/skill_cutins/battle_result_victory.png";
const BATTLE_RESULT_DEFEAT_IMAGE = "./assets/skill_cutins/battle_result_defeat.png";
const BATTLE_RESULT_AUDIO = {
  won: "./assets/audio/result/battle_victory.mp3",
  lost: "./assets/audio/result/battle_defeat.mp3",
};

initializeBgmManager();

function syncCompatibilityState(nextState = gameStore.getState()) {
  if (nextState) {
    appState = nextState;
  }

  return appState;
}

function getAppState() {
  return syncCompatibilityState();
}

function commitAppState(nextAppState) {
  gameStore.update(() => nextAppState);
  return syncCompatibilityState();
}

function updateAppState(updaterFn) {
  if (typeof updaterFn !== "function") {
    return getAppState();
  }

  gameStore.update((state) => updaterFn(state ?? appState));
  return syncCompatibilityState();
}

function withSaveMessage(state, saveMessage) {
  return {
    ...state,
    ui: {
      ...(state.ui ?? {}),
      saveMessage,
    },
  };
}

function getSelectedCityId() {
  return gameStore.getSelectedCityId();
}

function getSelectedHeroId() {
  return gameStore.getSelectedHeroId();
}

function scheduleEventDrivenRerender() {
  if (eventDrivenRerenderQueued) {
    return;
  }

  eventDrivenRerenderQueued = true;
  window.queueMicrotask(() => {
    eventDrivenRerenderQueued = false;
    rerender();
  });
}

function emitBattleEnded(battleState, overrides = {}) {
  if (!battleState) {
    return;
  }

  const result = overrides.result ?? battleState.status ?? "ended";
  const battleKey = `${battleState.id ?? "unknown"}:${result}`;

  if (emittedBattleEndIds.has(battleKey)) {
    return;
  }

  emittedBattleEndIds.add(battleKey);
  eventBus.emit("battle:ended", {
    battleId: battleState.id ?? null,
    result,
    attackerCityId: battleState.attackerCityId ?? null,
    defenderCityId: battleState.defenderCityId ?? null,
    battleContext: battleState.battleContext ?? null,
  });
}

function emitCityConqueredEvents(previousState, nextState, context = {}) {
  const previousCities = new Map((previousState?.world?.cities ?? []).map((city) => [city.id, city]));

  for (const city of nextState?.world?.cities ?? []) {
    const previousCity = previousCities.get(city.id);

    if (!previousCity || previousCity.ownerFactionId === city.ownerFactionId) {
      continue;
    }

    eventBus.emit("city:conquered", {
      cityId: city.id,
      previousOwnerFactionId: previousCity.ownerFactionId,
      ownerFactionId: city.ownerFactionId,
      source: context.source ?? "unknown",
      battleId: context.battleId ?? null,
    });
  }
}

function emitHeroMoved(payload) {
  eventBus.emit("hero:moved", payload);
}

gameStore.subscribe((nextState) => {
  syncCompatibilityState(nextState);
});

eventBus.on("city:selected", scheduleEventDrivenRerender);
eventBus.on("hero:moved", scheduleEventDrivenRerender);
eventBus.on("city:conquered", scheduleEventDrivenRerender);
eventBus.on("battle:ended", scheduleEventDrivenRerender);

commitAppState(appState);

function syncBgmWithMode() {
  getAppState();

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
    getAppState();
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
  getAppState();

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

  updateAppState((state) => updateBattleState(state, nextBattleState));
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
  const previousState = appState;
  const completedBattle = appState.battle;
  commitAppState(returnFromBattle(appState));
  emitBattleEnded(completedBattle);
  emitCityConqueredEvents(previousState, appState, {
    source: "battle",
    battleId: completedBattle?.id ?? null,
  });
  rerender();
}

async function startBattleResultCutinSequence(nextBattleState) {
  if (!nextBattleState || nextBattleState.status === "active") {
    updateAppState((state) => updateBattleState(state, nextBattleState));
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
  updateAppState((state) => updateBattleState(state, nextBattleState));
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

  if (cutinState.source === "player_auto_resolved") {
    finalizeBattleTempo(cutinState.nextBattleState);
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
    skillName: selectedSkill.name,
    skillQuote: selectedSkill.cutinQuote ?? null,
    skillEffectText: selectedSkill.cutinEffectText ?? null,
    skillSubtitle: selectedSkill.cutinSubtitle ?? null,
    image: selectedSkill.cutinImage,
    durationMs: selectedSkill.cutinDurationMs ?? UNIQUE_SKILL_CUTIN_FALLBACK_MS,
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
    skillName: selectedSkill.name,
    skillQuote: selectedSkill.cutinQuote ?? null,
    skillEffectText: selectedSkill.cutinEffectText ?? null,
    skillSubtitle: selectedSkill.cutinSubtitle ?? null,
    plannedAction,
    image: selectedSkill.cutinImage,
    durationMs: selectedSkill.cutinDurationMs ?? UNIQUE_SKILL_CUTIN_FALLBACK_MS,
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

function startResolvedAutoSkillCutinSequence(nextBattleState, selectedSkill) {
  const lastAction = nextBattleState?.lastAction;

  if (!appState.battle || !lastAction?.actorUnitId || !selectedSkill?.cutinImage) {
    return false;
  }

  clearAutoBattleTimer();
  clearBattleTempoTimers({ unlock: false });
  battleTempoLocked = true;
  activeSkillCutin = {
    source: "player_auto_resolved",
    battleId: appState.battle.id,
    casterUnitId: lastAction.actorUnitId,
    targetUnitId: lastAction.targetUnitIds?.[0] ?? null,
    skillId: selectedSkill.id,
    skillName: selectedSkill.name,
    skillQuote: selectedSkill.cutinQuote ?? null,
    skillEffectText: selectedSkill.cutinEffectText ?? null,
    skillSubtitle: selectedSkill.cutinSubtitle ?? null,
    nextBattleState,
    image: selectedSkill.cutinImage,
    durationMs: selectedSkill.cutinDurationMs ?? UNIQUE_SKILL_CUTIN_FALLBACK_MS,
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
    const resolvedSkill = nextBattleState?.lastAction?.skillId
      ? getSkillById(nextBattleState.skills, nextBattleState.lastAction.skillId)
      : null;

    if (
      nextBattleState?.lastAction?.actorUnitId
      && ["skill", "buff"].includes(nextBattleState.lastAction.type)
      && resolvedSkill?.cutinImage
      && startResolvedAutoSkillCutinSequence(nextBattleState, resolvedSkill)
    ) {
      return;
    }

    finishPlayerFlow(nextBattleState);
  }, BATTLE_TEMPO.autoBattleDelayMs);
}

function rerender() {
  getAppState();
  clearAutoBattleTimer();
  syncBgmWithMode();

  renderLayout(appRoot, getRenderableAppState(), {
    onCitySelect: (cityId) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      if (appState.pendingBattleChoice?.type === "defense") {
        return;
      }

      clearBattleTempoTimers();
      updateAppState((state) => selectCity(state, cityId));
      eventBus.emit("city:selected", {
        cityId: getSelectedCityId(),
      });
      rerender();
    },
    onAttackCity: (cityId) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.turnOwner !== "player" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      updateAppState((state) => openHeroDeployment(state, cityId));
      rerender();
    },
    onBattleChoiceConfirm: ({ cityId, autoBattleEnabled }) => {
      clearBattleTempoTimers();
      clearAutoBattleTimer();
      getAppState();
      if (!autoBattleEnabled && appState.pendingBattleChoice?.type === "defense") {
        updateAppState((state) => openDefenseHeroDeployment(state));
        rerender();
        return;
      }
      updateAppState((state) => startBattle(state, cityId, { autoBattleEnabled }));
      rerender();
      if (autoBattleEnabled) {
        ensureBattleProgress();
      }
    },
    onHeroDeploymentToggle: (heroId) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      updateAppState((state) => toggleDeploymentHero(state, heroId));
      rerender();
    },
    onHeroDeploymentTroopsChange: ({ heroId, amount }) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      updateAppState((state) => setDeploymentHeroTroops(state, heroId, amount));
      rerender();
    },
    onHeroDeploymentStart: ({ cityId, selectedHeroIds }) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult || selectedHeroIds.length === 0) {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      updateAppState((state) => startBattle(state, cityId, { attackerHeroIds: selectedHeroIds }));
      rerender();
    },
    onHeroDeploymentCancel: () => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      updateAppState((state) => cancelHeroDeployment(state));
      rerender();
    },
    onHeroTransferOpen: (cityId) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      updateAppState((state) => openHeroTransfer(state, cityId));
      rerender();
    },
    onHeroTransferSelectHero: (heroId) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      updateAppState((state) => selectHeroTransferHero(state, heroId));
      rerender();
    },
    onHeroTransferSelectTargetCity: (targetCityId) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      updateAppState((state) => selectHeroTransferTargetCity(state, targetCityId));
      rerender();
    },
    onHeroTransferConfirm: ({ heroId, targetCityId }) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      const movedHero = appState.world.heroes.find((hero) => hero.id === heroId) ?? null;
      const fromCityId = movedHero?.locationCityId ?? appState.pendingHeroTransfer?.sourceCityId ?? null;
      const previousState = appState;
      updateAppState((state) => confirmHeroTransfer(state, heroId, targetCityId));

      if (appState !== previousState && fromCityId && fromCityId !== targetCityId) {
        emitHeroMoved({
          heroId: getSelectedHeroId() ?? heroId,
          fromCityId,
          targetCityId,
        });
      }

      rerender();
    },
    onHeroTransferCancel: () => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      updateAppState((state) => cancelHeroTransfer(state));
      rerender();
    },
    onBattleChoiceCancel: () => {
      clearBattleTempoTimers();
      clearAutoBattleTimer();
      updateAppState((state) => cancelBattleChoice(state));
      rerender();
    },
    onEndWorldTurn: () => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      updateAppState((state) => endWorldTurn(state));
      rerender();
    },
    onTaxLevelChange: (taxLevel) => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      updateAppState((state) => setTaxLevel(state, taxLevel));
      rerender();
    },
    onChancellorPolicyChange: (chancellorPolicy) => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      updateAppState((state) => setChancellorPolicy(state, chancellorPolicy));
      rerender();
    },
    onChancellorHeroChange: (chancellorHeroId) => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      updateAppState((state) => setChancellorHeroId(state, chancellorHeroId));
      rerender();
    },
    onGovernorHeroChange: ({ cityId, governorHeroId }) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      updateAppState((state) => setCityGovernorHeroId(state, cityId, governorHeroId));
      rerender();
    },
    onGovernorPolicyChange: ({ cityId, governorPolicy }) => {
      getAppState();

      if (appState.mode !== "world" || appState.world.pendingEnemyTurnResult) {
        return;
      }

      updateAppState((state) => setCityGovernorPolicy(state, cityId, governorPolicy));
      rerender();
    },
    onRecruitTroops: ({ cityId, amount }) => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      updateAppState((state) => recruitCityTroops(state, cityId, amount));
      rerender();
    },
    onConfirmEnemyTurnResult: () => {
      getAppState();

      if (appState.mode !== "world") {
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      updateAppState((state) => confirmEnemyTurnResult(state));
      rerender();
    },
    onSaveGame: () => {
      getAppState();

      if (appState.mode !== "world" || appState.battle) {
        updateAppState((state) => withSaveMessage(state, "전투 중에는 저장할 수 없습니다."));
        rerender();
        return;
      }

      const result = saveGame(appState);
      updateAppState((state) => withSaveMessage(
        state,
        result.ok ? "저장 완료" : "저장 실패",
      ));
      rerender();
    },
    onLoadGame: () => {
      getAppState();

      if (appState.mode !== "world" || appState.battle) {
        updateAppState((state) => withSaveMessage(state, "전투 중에는 불러올 수 없습니다."));
        rerender();
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      const result = loadGame(appState);

      if (result.ok) {
        syncCompatibilityState(result.snapshot.state);
        updateAppState((state) => withSaveMessage(state, "불러오기 완료"));
      } else {
        updateAppState((state) => withSaveMessage(
          state,
          result.reason === "missing_save" ? "저장 데이터 없음" : "불러오기 실패",
        ));
      }

      rerender();
    },
    onResetGame: () => {
      getAppState();

      if (appState.mode !== "world" || appState.battle) {
        updateAppState((state) => withSaveMessage(state, "전투 중에는 초기화할 수 없습니다."));
        rerender();
        return;
      }

      clearBattleTempoTimers();
      clearAutoBattleTimer();
      clearSave();
      commitAppState(withSaveMessage(createInitialAppState(), "초기화 완료"));
      rerender();
    },
    onBattleSelectUnit: (unitId) => {
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      updateAppState((state) => updateBattleState(state, selectBattleUnit(state.battle, unitId)));
      rerender();
    },
    onBattleMoveUnit: (position) => {
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      updateAppState((state) => updateBattleState(state, moveSelectedUnit(state.battle, position)));
      rerender();
    },
    onBattleAttackUnit: (targetUnitId) => {
      getAppState();

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
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      updateAppState((state) => updateBattleState(state, setSelectedUnitFacing(state.battle, direction)));
      rerender();
    },
    onBattleCancelPendingMove: () => {
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      updateAppState((state) => updateBattleState(state, cancelPendingMove(state.battle)));
      rerender();
    },
    onBattleCancelActionMode: () => {
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      updateAppState((state) => updateBattleState(state, cancelBattleActionMode(state.battle)));
      rerender();
    },
    onBattleEnterAttackMode: () => {
      getAppState();

      if (!canUseManualBattleControls() || !appState.battle?.selectedUnitId) {
        return;
      }

      updateAppState((state) => updateBattleState(state, enterAttackMode(state.battle)));
      rerender();
    },
    onBattleUseSkill: (targetUnitId) => {
      getAppState();

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
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      updateAppState((state) => updateBattleState(state, enterStrategyMode(state.battle)));
      rerender();
    },
    onBattleUseStrategy: (targetUnitId) => {
      getAppState();

      if (!canUseManualBattleControls() || !appState.battle.selectedUnitId) {
        return;
      }

      finishPlayerFlow(useSelectedUnitStrategy(appState.battle, targetUnitId));
    },
    onBattleDefend: () => {
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      finishPlayerFlow(defendSelectedUnit(appState.battle));
    },
    onBattleWait: () => {
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      finishPlayerFlow(waitSelectedUnit(appState.battle));
    },
    onBattleEnterSkillMode: () => {
      getAppState();

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

      updateAppState((state) => updateBattleState(state, enterSkillMode(state.battle)));
      rerender();
    },
    onBattleEndTurn: () => {
      getAppState();

      if (!canUseManualBattleControls()) {
        return;
      }

      startEnemyTurnSequence(endPlayerTurn(appState.battle));
    },
    onBattleToggleAutoBattle: () => {
      getAppState();

      if (!appState.battle || appState.battle.status !== "active" || battleTempoLocked) {
        return;
      }

      updateAppState((state) =>
        updateBattleState(
          state,
          setAutoBattleEnabled(state.battle, !state.battle.autoBattleEnabled),
        ),
      );
      rerender();
      ensureBattleProgress();
    },
    onBattleRetreat: () => {
      getAppState();

      if (battleTempoLocked && appState.battle?.status === "active") {
        return;
      }

      clearAutoBattleTimer();
      clearBattleTempoTimers();
      const previousState = appState;
      const completedBattle = appState.battle;
      commitAppState(retreatFromBattle(appState));
      emitBattleEnded(completedBattle, { result: "retreated" });
      emitCityConqueredEvents(previousState, appState, {
        source: "retreat",
        battleId: completedBattle?.id ?? null,
      });
      rerender();
    },
    onBattleReturnToWorld: () => {
      getAppState();

      if (isBattleResultCutinActive()) {
        return;
      }

      clearAutoBattleTimer();
      clearBattleTempoTimers();
      const previousState = appState;
      const completedBattle = appState.battle;
      commitAppState(returnFromBattle(appState));
      emitBattleEnded(completedBattle);
      emitCityConqueredEvents(previousState, appState, {
        source: "battle",
        battleId: completedBattle?.id ?? null,
      });
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
