import {
  getAttackAngleBonus,
  getAttackAngleType,
  getDirectionFromPositions,
  getDirectionLabel,
  getFacingOptions as getFacingOptionsFromDirection,
} from "./battle_direction.js";
import { BATTLE_BALANCE } from "./battle_balance.js";
import { getAiTurnAction } from "./battle_ai.js";
import { getAttackableUnits, getDistance, getRangePositions, getWalkablePositions, isSamePosition } from "./battle_grid.js";
import {
  applySkill,
  canUseSkill,
  getEffectiveAttack,
  getEffectiveDefense,
  getGodotAttackValue,
  getGodotDefenseValue,
  getSkillById,
  getResolvedSkillRange,
  getSkillTargets,
} from "./battle_skills.js";
import {
  applyStrategy,
  canUseStrategy,
  decrementStatusEffectsForSide,
  getStrategyRange,
  getStrategyTargets,
} from "./battle_strategy.js";

function appendLog(battleState, message) {
  return {
    ...battleState,
    log: [...battleState.log, message],
  };
}

function updateUnit(battleState, unitId, updater) {
  return {
    ...battleState,
    units: battleState.units.map((unit) => (unit.id === unitId ? updater(unit) : unit)),
  };
}

function getUnitById(battleState, unitId) {
  return battleState.units.find((unit) => unit.id === unitId) ?? null;
}

function getAliveUnitsBySide(battleState, side) {
  return battleState.units.filter((unit) => unit.side === side && unit.isAlive);
}

function getOpposingSide(side) {
  return side === "player" ? "enemy" : "player";
}

function buildEmptyHighlights() {
  return {
    move: [],
    attack: [],
    attackTargets: [],
    skill: [],
    skillTargets: [],
    facing: [],
    strategy: [],
    strategyTargets: [],
  };
}

function buildSkillTargetHighlightPositions(battleState, unit) {
  const skill = getSkillById(battleState.skills, unit?.skillId);

  if (!skill || !canUseSkill(unit, skill)) {
    return [];
  }

  return getSkillTargets(battleState, unit, skill).map((target) => ({ x: target.x, y: target.y }));
}

function buildSelectionHighlights(battleState, unit) {
  const phase = battleState.phase;
  const attackRangeTiles = getRangePositions(unit, unit.attackRange, battleState.grid);
  const attackTargetTiles = getAttackableUnits(unit, battleState.units).map((target) => ({ x: target.x, y: target.y }));
  const skill = getSkillById(battleState.skills, unit?.skillId);
  const skillRange = skill ? getResolvedSkillRange(unit, skill) : 0;
  const skillRangeTiles = phase === "skill" ? getRangePositions(unit, skillRange, battleState.grid) : [];
  const skillTargetTiles = phase === "skill" ? buildSkillTargetHighlightPositions(battleState, unit) : [];
  const strategyRangeTiles = phase === "strategy"
    ? getRangePositions(unit, getStrategyRange(unit), battleState.grid)
    : [];
  const strategyTargetTiles = phase === "strategy"
    ? getStrategyTargets(battleState, unit).map((target) => ({ x: target.x, y: target.y }))
    : [];

  return {
    move: phase === "move" && !unit.hasMoved
      ? getWalkablePositions(unit, battleState.units, battleState.grid)
      : [],
    attack: phase === "attack" ? attackRangeTiles : [],
    attackTargets: phase === "attack" ? attackTargetTiles : [],
    skill: skillRangeTiles,
    skillTargets: skillTargetTiles,
    facing: phase === "facing" ? getFacingOptionsFromDirection(unit) : [],
    strategy: strategyRangeTiles,
    strategyTargets: strategyTargetTiles,
  };
}

function buildBasicAttackResult(attacker, defender, options = {}) {
  const {
    actionName = "공격",
    isCounter = false,
  } = options;
  const angleType = getAttackAngleType(attacker, defender);
  const angleBonus = getAttackAngleBonus(angleType);
  const rawDamage = (
    getEffectiveAttack(attacker)
    - getEffectiveDefense(defender) * 0.45
  ) * BATTLE_BALANCE.damageScale * angleBonus;

  let damage = Math.max(BATTLE_BALANCE.minimumBasicDamage, Math.round(rawDamage));

  if (isCounter) {
    damage = Math.max(
      BATTLE_BALANCE.minimumBasicDamage,
      Math.round(damage * BATTLE_BALANCE.counterDamageMultiplier),
    );
  }

  if (defender.isDefending) {
    damage = Math.max(4, Math.round(damage * BATTLE_BALANCE.defendDamageMultiplier));
  }

  const angleLabel = angleType === "back" ? "후방" : angleType === "side" ? "측면" : "정면";

  return {
    damage,
    angleType,
    angleBonus,
    angleLabel,
    actionName,
    isCounter,
  };
}

function applyTurnStartEffects(battleState, side) {
  let nextState = {
    ...battleState,
    units: battleState.units.map((unit) => {
      if (!unit.isAlive) {
        return unit;
      }

      if (unit.side === side) {
        const nextBuffTurns = Math.max(0, unit.buffTurns - 1);

        return {
          ...unit,
          currentSkillCooldown: unit.currentSkillCooldown > 0 ? unit.currentSkillCooldown - 1 : 0,
          buffTurns: nextBuffTurns,
          buffAttackBonus: nextBuffTurns > 0 ? unit.buffAttackBonus : 0,
          hasMoved: false,
          hasActed: false,
          isDefending: false,
        };
      }

      return unit;
    }),
  };

  const statusStep = decrementStatusEffectsForSide(nextState, side);
  nextState = statusStep.battleState;

  if (statusStep.effects.length > 0) {
    nextState = {
      ...nextState,
      lastAction: {
        type: "status",
        skillId: null,
        actorUnitId: null,
        targetUnitIds: statusStep.effects.map((effect) => effect.unitId),
        effects: statusStep.effects,
      },
      log: [...nextState.log, ...statusStep.logs],
    };
  }

  return nextState;
}

function setOutcomeStatus(battleState) {
  const outcome = getBattleOutcome(battleState);

  if (outcome === "won") {
    return appendLog({
      ...battleState,
      status: "won",
      phase: "ended",
      selectedUnitId: null,
      selectedStrategyId: null,
      highlights: buildEmptyHighlights(),
    }, "승리! 적 도시를 점령할 수 있습니다.");
  }

  if (outcome === "lost") {
    return appendLog({
      ...battleState,
      status: "lost",
      phase: "ended",
      selectedUnitId: null,
      selectedStrategyId: null,
      highlights: buildEmptyHighlights(),
    }, "패배했습니다.");
  }

  return battleState;
}

export function canResolveCounterattack(battleState, attackerId, defenderId) {
  const attacker = getUnitById(battleState, attackerId);
  const defender = getUnitById(battleState, defenderId);

  return Boolean(
    attacker
    && defender
    && attacker.isAlive
    && defender.isAlive
    && !defender.hasActed
    && getDistance(attacker, defender) <= defender.attackRange
    && battleState.status === "active"
  );
}

function applyCounterIfNeeded(battleState, attackerId, defenderId) {
  if (!canResolveCounterattack(battleState, attackerId, defenderId)) {
    return battleState;
  }

  const attacker = getUnitById(battleState, attackerId);
  const defender = getUnitById(battleState, defenderId);

  const counterResult = buildBasicAttackResult(defender, attacker, {
    actionName: "반격",
    isCounter: true,
  });

  let nextState = updateUnit(battleState, attacker.id, (unit) => {
    const nextHp = Math.max(0, unit.hp - counterResult.damage);

    return {
      ...unit,
      hp: nextHp,
      troops: nextHp,
      isAlive: nextHp > 0,
    };
  });

  nextState = updateUnit(nextState, defender.id, (unit) => ({
    ...unit,
    hasActed: true,
    facing: getDirectionFromPositions(unit, attacker) ?? unit.facing,
  }));
  nextState = {
    ...nextState,
    lastAction: {
      type: "counter",
      skillId: null,
      actorUnitId: defender.id,
      targetUnitIds: [attacker.id],
      effects: [
        { unitId: defender.id, kind: "counter", text: "반격!" },
        { unitId: attacker.id, kind: "damage", text: `-${counterResult.damage}` },
      ],
    },
  };
  nextState = appendLog(nextState, `${defender.name}가 반격했습니다.`);
  nextState = appendLog(nextState, `${attacker.name}이 ${counterResult.damage} 반격 피해를 입었습니다.`);

  return setOutcomeStatus(nextState);
}

export function resolvePendingCounter(battleState, attackerId, defenderId) {
  return applyCounterIfNeeded(battleState, attackerId, defenderId);
}

function applyResolvedBasicAttack(battleState, attackerUnitId, targetUnitId, options = {}) {
  const attacker = getUnitById(battleState, attackerUnitId);
  const target = getUnitById(battleState, targetUnitId);

  if (!attacker || !target || !attacker.isAlive || !target.isAlive || attacker.side === target.side) {
    return battleState;
  }

  if (getDistance(attacker, target) > attacker.attackRange) {
    return battleState;
  }

  const { skipCounter = false } = options;
  const attackResult = buildBasicAttackResult(attacker, target, options);
  let nextState = updateUnit(battleState, target.id, (unit) => {
    const nextHp = Math.max(0, unit.hp - attackResult.damage);

    return {
      ...unit,
      hp: nextHp,
      troops: nextHp,
      isAlive: nextHp > 0,
    };
  });

  nextState = updateUnit(nextState, attacker.id, (unit) => ({
    ...unit,
    hasActed: true,
    facing: getDirectionFromPositions(unit, target) ?? unit.facing,
  }));
  nextState = {
    ...nextState,
    lastAction: {
      type: attackResult.isCounter ? "counter" : "attack",
      skillId: null,
      actorUnitId: attacker.id,
      targetUnitIds: [target.id],
      effects: [
        { unitId: target.id, kind: "angle", text: `${attackResult.angleLabel} 공격!` },
        { unitId: target.id, kind: "damage", text: `-${attackResult.damage}` },
      ],
    },
  };
  nextState = appendLog(nextState, `${attacker.name}이 ${target.name}를 ${attackResult.angleLabel} 공격했습니다.`);
  nextState = appendLog(nextState, `${target.name}에게 ${attackResult.damage} 피해!`);
  nextState = setOutcomeStatus(nextState);

  if (nextState.status !== "active" || attackResult.isCounter) {
    return nextState;
  }

  if (skipCounter) {
    return nextState;
  }

  return applyCounterIfNeeded(nextState, attacker.id, target.id);
}

export {
  getGodotAttackValue,
  getGodotDefenseValue,
  getEffectiveAttack,
  getEffectiveDefense,
};

export function getPlayerUnits(battleState) {
  return getAliveUnitsBySide(battleState, "player");
}

export function getEnemyUnits(battleState) {
  return getAliveUnitsBySide(battleState, "enemy");
}

export function getSelectedUnit(battleState) {
  return getUnitById(battleState, battleState.selectedUnitId);
}

export function getBattleOutcome(battleState) {
  if (getEnemyUnits(battleState).length === 0) {
    return "won";
  }

  if (getPlayerUnits(battleState).length === 0) {
    return "lost";
  }

  return "active";
}

export function areAllUnitsActed(battleState, side) {
  const aliveUnits = getAliveUnitsBySide(battleState, side);
  return aliveUnits.length > 0 && aliveUnits.every((unit) => unit.hasActed);
}

export function shouldAutoAdvanceTurn(battleState) {
  return battleState?.status === "active" && areAllUnitsActed(battleState, battleState.turnOwner);
}

export function beginSideTurn(battleState, side) {
  const nextState = applyTurnStartEffects({
    ...clearBattleSelection(battleState),
    turnOwner: side,
    phase: side === "player" ? "select" : "enemy",
  }, side);

  if (nextState.status !== "active") {
    return nextState;
  }

  return {
    ...nextState,
    turnOwner: side,
    phase: side === "player" ? "select" : "enemy",
  };
}

export function getFacingOptions(unit) {
  return getFacingOptionsFromDirection(unit);
}

export function clearBattleSelection(battleState) {
  return {
    ...battleState,
    selectedUnitId: null,
    selectedStrategyId: null,
    pendingMove: null,
    phase: battleState.status === "active" && battleState.turnOwner === "player" ? "select" : battleState.phase,
    highlights: buildEmptyHighlights(),
  };
}

export function setAutoBattleEnabled(battleState, enabled) {
  const nextState = {
    ...clearBattleSelection(battleState),
    autoBattleEnabled: enabled,
    lastAction: enabled
      ? {
        type: "system",
        skillId: null,
        actorUnitId: null,
        targetUnitIds: [],
        effects: [
          { unitId: null, kind: "strategy", text: "자동전투 시작" },
        ],
      }
      : {
        type: "system",
        skillId: null,
        actorUnitId: null,
        targetUnitIds: [],
        effects: [
          { unitId: null, kind: "wait", text: "자동전투 중지" },
        ],
      },
  };

  return appendLog(nextState, enabled ? "자동전투를 시작합니다." : "자동전투를 중지했습니다.");
}

export function selectBattleUnit(battleState, unitId) {
  if (battleState.status !== "active" || battleState.turnOwner !== "player") {
    return battleState;
  }

  const unit = getUnitById(battleState, unitId);

  if (!unit || unit.side !== "player" || !unit.isAlive || unit.hasActed) {
    return battleState;
  }

  const nextPhase = unit.hasMoved ? "attack" : "move";

  return {
    ...battleState,
    selectedUnitId: unit.id,
    phase: nextPhase,
    highlights: buildSelectionHighlights({
      ...battleState,
      phase: nextPhase,
    }, unit),
  };
}

export function enterAttackMode(battleState) {
  const selectedUnit = getSelectedUnit(battleState);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || !selectedUnit
    || battleState.phase === "facing"
  ) {
    return battleState;
  }

  const nextPhase = "attack";

  return {
    ...battleState,
    phase: nextPhase,
    selectedStrategyId: null,
    highlights: buildSelectionHighlights({
      ...battleState,
      phase: nextPhase,
      selectedStrategyId: null,
    }, selectedUnit),
  };
}

export function moveSelectedUnit(battleState, targetPosition) {
  const selectedUnit = getSelectedUnit(battleState);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || !selectedUnit
    || selectedUnit.hasMoved
    || battleState.phase === "facing"
  ) {
    return battleState;
  }

  const canMove = battleState.highlights.move.some((position) => isSamePosition(position, targetPosition));
  const isHoldPosition = isSamePosition(selectedUnit, targetPosition);

  if (!canMove && !isHoldPosition) {
    return battleState;
  }

  let nextState = updateUnit(battleState, selectedUnit.id, (unit) => ({
    ...unit,
    x: isHoldPosition ? unit.x : targetPosition.x,
    y: isHoldPosition ? unit.y : targetPosition.y,
    hasMoved: true,
  }));

  const movedUnit = getUnitById(nextState, selectedUnit.id);

  nextState = {
    ...nextState,
    phase: "facing",
    pendingMove: {
      unitId: selectedUnit.id,
      fromX: selectedUnit.x,
      fromY: selectedUnit.y,
      fromFacing: selectedUnit.facing,
    },
    highlights: {
      ...buildSelectionHighlights(nextState, movedUnit),
      move: [],
      attack: [],
      skill: [],
      facing: movedUnit ? getFacingOptionsFromDirection(movedUnit) : [],
    },
    lastAction: {
      type: "move",
      skillId: null,
      actorUnitId: selectedUnit.id,
      targetUnitIds: [],
      effects: [],
    },
  };

  return appendLog(
    nextState,
    isHoldPosition
      ? `${selectedUnit.name}이 현재 위치를 사수합니다.`
      : `${selectedUnit.name}가 (${targetPosition.x + 1}, ${targetPosition.y + 1}) 위치로 이동했습니다.`,
  );
}

export function setSelectedUnitFacing(battleState, direction) {
  const selectedUnit = getSelectedUnit(battleState);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || battleState.phase !== "facing"
    || !selectedUnit
    || !direction
  ) {
    return battleState;
  }

  let nextState = updateUnit(battleState, selectedUnit.id, (unit) => ({
    ...unit,
    facing: direction,
  }));
  const updatedUnit = getUnitById(nextState, selectedUnit.id);

  return {
    ...nextState,
    phase: "attack",
    pendingMove: null,
    highlights: updatedUnit ? buildSelectionHighlights({
      ...nextState,
      phase: "attack",
      pendingMove: null,
    }, updatedUnit) : buildEmptyHighlights(),
    lastAction: {
      type: "facing",
      skillId: null,
      actorUnitId: selectedUnit.id,
      targetUnitIds: [],
      effects: [
        { unitId: selectedUnit.id, kind: "facing", text: `방향 ${getDirectionLabel(direction)}` },
      ],
    },
  };
}

export function cancelPendingMove(battleState) {
  const pendingMove = battleState.pendingMove;
  const selectedUnit = getSelectedUnit(battleState);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || battleState.phase !== "facing"
    || !pendingMove
    || !selectedUnit
    || selectedUnit.id !== pendingMove.unitId
  ) {
    return battleState;
  }

  let nextState = updateUnit(battleState, pendingMove.unitId, (unit) => ({
    ...unit,
    x: pendingMove.fromX,
    y: pendingMove.fromY,
    facing: pendingMove.fromFacing,
    hasMoved: false,
    hasActed: false,
  }));
  const restoredUnit = getUnitById(nextState, pendingMove.unitId);

  nextState = {
    ...nextState,
    phase: "move",
    pendingMove: null,
    highlights: restoredUnit ? buildSelectionHighlights({
      ...nextState,
      phase: "move",
    }, restoredUnit) : buildEmptyHighlights(),
    lastAction: {
      type: "move_cancel",
      skillId: null,
      actorUnitId: pendingMove.unitId,
      targetUnitIds: [],
      effects: [
        { unitId: pendingMove.unitId, kind: "wait", text: "이동 취소" },
      ],
    },
  };

  return appendLog(nextState, "이동을 취소했습니다. 원래 위치로 돌아갑니다.");
}

export function cancelBattleActionMode(battleState) {
  const selectedUnit = getSelectedUnit(battleState);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || !selectedUnit
    || !["attack", "skill", "strategy"].includes(battleState.phase)
  ) {
    return battleState;
  }

  const nextPhase = selectedUnit.hasMoved ? "attack" : "move";
  const resetState = {
    ...battleState,
    phase: nextPhase,
    selectedStrategyId: null,
  };

  return appendLog({
    ...resetState,
    highlights: buildSelectionHighlights(resetState, selectedUnit),
    lastAction: {
      type: "cancel",
      skillId: null,
      actorUnitId: selectedUnit.id,
      targetUnitIds: [],
      effects: [
        { unitId: selectedUnit.id, kind: "wait", text: "명령 취소" },
      ],
    },
  }, "명령 선택을 취소했습니다.");
}

export function enterSkillMode(battleState) {
  const selectedUnit = getSelectedUnit(battleState);
  const skill = getSkillById(battleState.skills, selectedUnit?.skillId);

  if (
    !selectedUnit
    || !skill
    || !canUseSkill(selectedUnit, skill)
    || battleState.phase === "facing"
  ) {
    return battleState;
  }

  const nextState = {
    ...battleState,
    phase: "skill",
  };

  return {
    ...nextState,
    highlights: buildSelectionHighlights(nextState, selectedUnit),
  };
}

export function enterStrategyMode(battleState) {
  const selectedUnit = getSelectedUnit(battleState);

  if (
    !selectedUnit
    || !canUseStrategy(selectedUnit)
    || battleState.phase === "facing"
  ) {
    return battleState;
  }

  const nextState = {
    ...battleState,
    phase: "strategy",
    selectedStrategyId: "strategy",
  };

  return {
    ...nextState,
    highlights: buildSelectionHighlights(nextState, selectedUnit),
  };
}

export function attackUnit(battleState, attackerUnitId, targetUnitId, options = {}) {
  const attacker = getUnitById(battleState, attackerUnitId);
  const target = getUnitById(battleState, targetUnitId);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || !attacker
    || !target
    || attacker.side !== "player"
    || target.side !== "enemy"
    || !attacker.isAlive
    || !target.isAlive
    || attacker.hasActed
    || battleState.phase === "facing"
  ) {
    return battleState;
  }

  const inRange = battleState.highlights.attackTargets.some((position) => isSamePosition(position, target));

  if (!inRange) {
    return battleState;
  }

  let nextState = applyResolvedBasicAttack(battleState, attacker.id, target.id, {
    skipCounter: options.deferCounter === true,
  });

  if (nextState.status !== "active") {
    return nextState;
  }

  return clearBattleSelection(nextState);
}

export function useSelectedUnitSkill(battleState, targetUnitId = null) {
  const selectedUnit = getSelectedUnit(battleState);

  if (!selectedUnit || battleState.phase === "facing") {
    return battleState;
  }

  const skill = getSkillById(battleState.skills, selectedUnit.skillId);

  if (!skill) {
    return battleState;
  }

  if (!canUseSkill(selectedUnit, skill)) {
    return appendLog(battleState, `${selectedUnit.name}의 고유 특기 조건이 맞지 않아 사용할 수 없습니다.`);
  }

  const targetUnit = getUnitById(battleState, targetUnitId);
  const validTarget = targetUnit && battleState.highlights.skillTargets.some((position) => isSamePosition(position, targetUnit));

  if (!validTarget) {
    return battleState;
  }

  let nextState = applySkill(battleState, selectedUnit.id, targetUnitId);
  nextState = setOutcomeStatus(nextState);

  if (nextState.status !== "active") {
    return nextState;
  }

  return clearBattleSelection(nextState);
}

export function useSelectedUnitStrategy(battleState, targetUnitId, options = {}) {
  const selectedUnit = getSelectedUnit(battleState);

  if (!selectedUnit || battleState.phase !== "strategy" || !battleState.selectedStrategyId) {
    return battleState;
  }

  if (!canUseStrategy(selectedUnit)) {
    return battleState;
  }

  const targetUnit = getUnitById(battleState, targetUnitId);
  const validTarget = targetUnit && battleState.highlights.strategyTargets.some((position) => isSamePosition(position, targetUnit));

  if (!validTarget) {
    return battleState;
  }

  return applyStrategy(battleState, selectedUnit.id, targetUnitId, options);
}

export function defendSelectedUnit(battleState) {
  const selectedUnit = getSelectedUnit(battleState);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || !selectedUnit
    || selectedUnit.hasActed
  ) {
    return battleState;
  }

  let nextState = updateUnit(battleState, selectedUnit.id, (unit) => ({
    ...unit,
    isDefending: true,
    hasActed: true,
  }));
  nextState = {
    ...clearBattleSelection(nextState),
    lastAction: {
      type: "defend",
      skillId: null,
      actorUnitId: selectedUnit.id,
      targetUnitIds: [selectedUnit.id],
      effects: [
        { unitId: selectedUnit.id, kind: "defend", text: "방어" },
      ],
    },
  };

  return appendLog(nextState, `${selectedUnit.name}이 방어 태세를 취했습니다.`);
}

export function waitSelectedUnit(battleState) {
  const selectedUnit = getSelectedUnit(battleState);

  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || !selectedUnit
    || selectedUnit.hasActed
  ) {
    return battleState;
  }

  let nextState = updateUnit(battleState, selectedUnit.id, (unit) => ({
    ...unit,
    hasActed: true,
  }));
  nextState = {
    ...clearBattleSelection(nextState),
    lastAction: {
      type: "wait",
      skillId: null,
      actorUnitId: selectedUnit.id,
      targetUnitIds: [],
      effects: [
        { unitId: selectedUnit.id, kind: "wait", text: "대기" },
      ],
    },
  };

  return appendLog(nextState, `${selectedUnit.name}이 대기했습니다.`);
}

function applyAiWait(battleState, unitId, facingDirection = null) {
  const actingUnit = getUnitById(battleState, unitId);

  if (!actingUnit || !actingUnit.isAlive) {
    return battleState;
  }

  let nextState = updateUnit(battleState, unitId, (unit) => ({
    ...unit,
    hasActed: true,
    facing: facingDirection ?? unit.facing,
  }));
  nextState = {
    ...clearBattleSelection(nextState),
    lastAction: {
      type: "wait",
      skillId: null,
      actorUnitId: unitId,
      targetUnitIds: [],
      effects: [
        { unitId, kind: "wait", text: "대기" },
      ],
    },
  };

  return appendLog(nextState, `${actingUnit.name}이 대기했습니다.`);
}

function applyAiMove(battleState, unitId, movePosition, facingDirection = null) {
  const actingUnit = getUnitById(battleState, unitId);

  if (!actingUnit || !actingUnit.isAlive || !movePosition) {
    return battleState;
  }

  let nextState = updateUnit(battleState, unitId, (unit) => ({
    ...unit,
    x: movePosition.x,
    y: movePosition.y,
    hasMoved: true,
  }));

  if (facingDirection) {
    nextState = updateUnit(nextState, unitId, (unit) => ({
      ...unit,
      facing: facingDirection,
    }));
  }

  nextState = {
    ...clearBattleSelection(nextState),
    lastAction: {
      type: "move",
      skillId: null,
      actorUnitId: unitId,
      targetUnitIds: [],
      effects: [],
    },
  };

  return appendLog(nextState, `${actingUnit.name}가 (${movePosition.x + 1}, ${movePosition.y + 1}) 위치로 이동했습니다.`);
}

function applyAiAction(battleState, unitId) {
  const actingUnit = getUnitById(battleState, unitId);

  if (!actingUnit || !actingUnit.isAlive || actingUnit.hasActed) {
    return battleState;
  }

  const action = getAiTurnAction(battleState, actingUnit);

  if (action.type === "skill") {
    let nextState = applySkill(battleState, actingUnit.id, action.targetUnitId ?? null);

    if (action.facingDirection) {
      nextState = updateUnit(nextState, actingUnit.id, (unit) => ({
        ...unit,
        facing: action.facingDirection,
      }));
    }

    return setOutcomeStatus(nextState);
  }

  if (action.type === "strategy" && action.targetUnitId) {
    return setOutcomeStatus(applyStrategy(battleState, actingUnit.id, action.targetUnitId));
  }

  if (action.type === "attack" && action.targetUnitId) {
    return applyResolvedBasicAttack(battleState, actingUnit.id, action.targetUnitId);
  }

  if (action.type === "move" && action.movePosition) {
    let nextState = applyAiMove(battleState, actingUnit.id, action.movePosition, action.facingDirection);

    if (nextState.status !== "active") {
      return nextState;
    }

    const movedUnit = getUnitById(nextState, actingUnit.id);
    const followUpAction = movedUnit ? getAiTurnAction(nextState, movedUnit) : null;

    if (followUpAction?.type === "skill") {
      return applyAiAction(nextState, actingUnit.id);
    }

    if (followUpAction?.type === "attack") {
      return applyResolvedBasicAttack(nextState, actingUnit.id, followUpAction.targetUnitId);
    }

    if (followUpAction?.type === "strategy" && followUpAction.targetUnitId) {
      return setOutcomeStatus(applyStrategy(nextState, actingUnit.id, followUpAction.targetUnitId));
    }

    return applyAiWait(nextState, actingUnit.id, followUpAction?.facingDirection ?? action.facingDirection);
  }

  return applyAiWait(battleState, actingUnit.id, action.facingDirection);
}

export function planNextEnemyAction(battleState) {
  if (battleState.status !== "active" || battleState.turnOwner !== "enemy") {
    return null;
  }

  const actingEnemy = battleState.units.find((unit) => unit.side === "enemy" && unit.isAlive && !unit.hasActed) ?? null;

  if (!actingEnemy) {
    return null;
  }

  const playerUnits = getPlayerUnits(battleState);

  if (playerUnits.length === 0) {
    return null;
  }

  const action = getAiTurnAction(battleState, actingEnemy);

  if (!action) {
    return {
      type: "wait",
      actorUnitId: actingEnemy.id,
      targetUnitId: null,
      movePosition: null,
      facingDirection: actingEnemy.facing,
    };
  }

  return {
    ...action,
    actorUnitId: action.actorUnitId ?? actingEnemy.id,
  };
}

export function executePlannedEnemyAction(battleState, plannedAction) {
  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "enemy"
    || !plannedAction?.actorUnitId
  ) {
    return battleState;
  }

  const actingUnit = getUnitById(battleState, plannedAction.actorUnitId);

  if (!actingUnit || !actingUnit.isAlive || actingUnit.hasActed) {
    return battleState;
  }

  if (plannedAction.type === "skill") {
    let nextState = applySkill(battleState, actingUnit.id, plannedAction.targetUnitId ?? null);

    if (plannedAction.facingDirection) {
      nextState = updateUnit(nextState, actingUnit.id, (unit) => ({
        ...unit,
        facing: plannedAction.facingDirection,
      }));
    }

    return setOutcomeStatus(nextState);
  }

  if (plannedAction.type === "strategy" && plannedAction.targetUnitId) {
    return setOutcomeStatus(applyStrategy(battleState, actingUnit.id, plannedAction.targetUnitId));
  }

  if (plannedAction.type === "attack" && plannedAction.targetUnitId) {
    return applyResolvedBasicAttack(battleState, actingUnit.id, plannedAction.targetUnitId);
  }

  if (plannedAction.type === "move" && plannedAction.movePosition) {
    return applyAiMove(
      battleState,
      actingUnit.id,
      plannedAction.movePosition,
      plannedAction.facingDirection,
    );
  }

  return applyAiWait(battleState, actingUnit.id, plannedAction.facingDirection);
}

export function endPlayerTurn(battleState) {
  if (battleState.status !== "active") {
    return battleState;
  }

  return {
    ...clearBattleSelection(battleState),
    turnOwner: "enemy",
    phase: "enemy",
  };
}

export function startEnemyTurn(battleState) {
  if (battleState.status !== "active" || battleState.turnOwner !== "enemy") {
    return battleState;
  }

  return beginSideTurn(battleState, "enemy");
}

export function hasPendingEnemyActions(battleState) {
  return Boolean(
    battleState.status === "active"
    && battleState.turnOwner === "enemy"
    && battleState.units.some((unit) => unit.side === "enemy" && unit.isAlive && !unit.hasActed)
  );
}

export function runNextEnemyAction(battleState) {
  const plannedAction = planNextEnemyAction(battleState);

  if (!plannedAction) {
    return setOutcomeStatus(battleState);
  }

  return executePlannedEnemyAction(battleState, plannedAction);
}

export function finishEnemyTurn(battleState) {
  if (battleState.status !== "active") {
    return battleState;
  }

  return beginSideTurn(battleState, getOpposingSide("enemy"));
}

export function runEnemyTurn(battleState) {
  if (battleState.status !== "active" || battleState.turnOwner !== "enemy") {
    return battleState;
  }

  let nextState = startEnemyTurn(battleState);
  let stepCount = 0;

  while (nextState.status === "active" && stepCount < 20) {
    stepCount += 1;
    const previousState = nextState;
    nextState = runNextEnemyAction(nextState);

    if (nextState === previousState || !hasPendingEnemyActions(nextState)) {
      break;
    }
  }

  if (nextState.status !== "active") {
    return nextState;
  }

  if (stepCount >= 20 && hasPendingEnemyActions(nextState)) {
    nextState = appendLog(nextState, "적군 턴 반복이 안전 한도에 도달해 종료되었습니다.");
  }

  return finishEnemyTurn(nextState);
}

export function performAutoBattleStep(battleState) {
  if (
    battleState.status !== "active"
    || battleState.turnOwner !== "player"
    || !battleState.autoBattleEnabled
  ) {
    return battleState;
  }

  const actingPlayer = battleState.units.find((unit) => unit.side === "player" && unit.isAlive && !unit.hasActed) ?? null;

  if (!actingPlayer) {
    return battleState;
  }

  return applyAiAction(battleState, actingPlayer.id);
}
