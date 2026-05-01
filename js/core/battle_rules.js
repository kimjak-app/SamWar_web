import {
  getAttackAngleBonus,
  getAttackAngleType,
  getDirectionFromPositions,
  getDirectionLabel,
  getFacingOptions as getFacingOptionsFromDirection,
} from "./battle_direction.js";
import { getEnemyTurnAction } from "./battle_ai.js";
import { getAttackableUnits, getDistance, getWalkablePositions, isSamePosition } from "./battle_grid.js";
import {
  applySkill,
  canUseSkill,
  DAMAGE_SCALE,
  getEffectiveAttack,
  getEffectiveDefense,
  getGodotAttackValue,
  getGodotDefenseValue,
  getSkillById,
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

function buildEmptyHighlights() {
  return {
    move: [],
    attack: [],
    skill: [],
    facing: [],
    strategy: [],
  };
}

function buildSkillHighlightPositions(battleState, unit) {
  const skill = getSkillById(battleState.skills, unit?.skillId);

  if (!skill || !canUseSkill(unit, skill) || skill.target !== "enemy") {
    return [];
  }

  const range = skill.rangeSource === "unit.skillRange" ? unit.skillRange : 0;

  return battleState.units
    .filter((target) => target.isAlive && target.side !== unit.side && getDistance(unit, target) <= range)
    .map((target) => ({ x: target.x, y: target.y }));
}

function buildSelectionHighlights(battleState, unit) {
  return {
    move: unit.hasMoved ? [] : getWalkablePositions(unit, battleState.units, battleState.grid),
    attack: getAttackableUnits(unit, battleState.units).map((target) => ({ x: target.x, y: target.y })),
    skill: buildSkillHighlightPositions(battleState, unit),
    facing: battleState.phase === "facing" ? getFacingOptionsFromDirection(unit) : [],
    strategy: battleState.phase === "strategy"
      ? getStrategyTargets(battleState, unit).map((target) => ({ x: target.x, y: target.y }))
      : [],
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
  ) * DAMAGE_SCALE * angleBonus;

  let damage = Math.max(8, Math.round(rawDamage));

  if (defender.isDefending) {
    damage = Math.max(4, Math.round(damage * 0.65));
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

      if (unit.side !== side) {
        return {
          ...unit,
          hasMoved: false,
          hasActed: false,
        };
      }

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

function applyCounterIfNeeded(battleState, attackerId, defenderId) {
  const attacker = getUnitById(battleState, attackerId);
  const defender = getUnitById(battleState, defenderId);

  if (
    !attacker
    || !defender
    || !attacker.isAlive
    || !defender.isAlive
    || defender.hasActed
    || getDistance(attacker, defender) > defender.attackRange
    || battleState.status !== "active"
  ) {
    return battleState;
  }

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

function applyResolvedBasicAttack(battleState, attackerUnitId, targetUnitId, options = {}) {
  const attacker = getUnitById(battleState, attackerUnitId);
  const target = getUnitById(battleState, targetUnitId);

  if (!attacker || !target || !attacker.isAlive || !target.isAlive || attacker.side === target.side) {
    return battleState;
  }

  if (getDistance(attacker, target) > attacker.attackRange) {
    return battleState;
  }

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

export function getFacingOptions(unit) {
  return getFacingOptionsFromDirection(unit);
}

export function clearBattleSelection(battleState) {
  return {
    ...battleState,
    selectedUnitId: null,
    selectedStrategyId: null,
    phase: battleState.status === "active" && battleState.turnOwner === "player" ? "select" : battleState.phase,
    highlights: buildEmptyHighlights(),
  };
}

export function selectBattleUnit(battleState, unitId) {
  if (battleState.status !== "active" || battleState.turnOwner !== "player") {
    return battleState;
  }

  const unit = getUnitById(battleState, unitId);

  if (!unit || unit.side !== "player" || !unit.isAlive || unit.hasActed) {
    return battleState;
  }

  return {
    ...battleState,
    selectedUnitId: unit.id,
    phase: unit.hasMoved ? "attack" : "move",
    highlights: buildSelectionHighlights(battleState, unit),
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

  if (!canMove) {
    return battleState;
  }

  let nextState = updateUnit(battleState, selectedUnit.id, (unit) => ({
    ...unit,
    x: targetPosition.x,
    y: targetPosition.y,
    hasMoved: true,
  }));

  const movedUnit = getUnitById(nextState, selectedUnit.id);

  nextState = {
    ...nextState,
    phase: "facing",
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

  return appendLog(nextState, `${selectedUnit.name}가 (${targetPosition.x + 1}, ${targetPosition.y + 1}) 위치로 이동했습니다.`);
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
    highlights: updatedUnit ? buildSelectionHighlights(nextState, updatedUnit) : buildEmptyHighlights(),
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

export function enterSkillMode(battleState) {
  const selectedUnit = getSelectedUnit(battleState);
  const skill = getSkillById(battleState.skills, selectedUnit?.skillId);

  if (
    !selectedUnit
    || !skill
    || !canUseSkill(selectedUnit, skill)
    || skill.target !== "enemy"
    || battleState.phase === "facing"
  ) {
    return battleState;
  }

  return {
    ...battleState,
    phase: "skill",
    highlights: {
      ...battleState.highlights,
      attack: [],
      skill: buildSkillHighlightPositions(battleState, selectedUnit),
      facing: [],
      strategy: [],
    },
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

  return {
    ...battleState,
    phase: "strategy",
    selectedStrategyId: "strategy",
    highlights: {
      ...battleState.highlights,
      attack: [],
      skill: [],
      facing: [],
      strategy: getStrategyTargets(battleState, selectedUnit).map((target) => ({ x: target.x, y: target.y })),
    },
  };
}

export function attackUnit(battleState, attackerUnitId, targetUnitId) {
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

  const inRange = battleState.highlights.attack.some((position) => isSamePosition(position, target));

  if (!inRange) {
    return battleState;
  }

  let nextState = applyResolvedBasicAttack(battleState, attacker.id, target.id);

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

  if (skill.target === "enemy") {
    const targetUnit = getUnitById(battleState, targetUnitId);
    const validTarget = targetUnit && battleState.highlights.skill.some((position) => isSamePosition(position, targetUnit));

    if (!validTarget) {
      return battleState;
    }
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
  const validTarget = targetUnit && battleState.highlights.strategy.some((position) => isSamePosition(position, targetUnit));

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

export function runEnemyTurn(battleState) {
  if (battleState.status !== "active" || battleState.turnOwner !== "enemy") {
    return battleState;
  }

  let nextState = applyTurnStartEffects(battleState, "enemy");

  while (nextState.status === "active") {
    const actingEnemy = nextState.units.find((unit) => unit.side === "enemy" && unit.isAlive && !unit.hasActed) ?? null;

    if (!actingEnemy) {
      break;
    }

    const playerUnits = getPlayerUnits(nextState);

    if (playerUnits.length === 0) {
      nextState = setOutcomeStatus(nextState);
      break;
    }

    const action = getEnemyTurnAction(nextState, actingEnemy, playerUnits);

    if (action.type === "skill" && action.targetUnitId) {
      const targetUnit = getUnitById(nextState, action.targetUnitId);
      nextState = applySkill(nextState, actingEnemy.id, action.targetUnitId);

      if (targetUnit) {
        nextState = updateUnit(nextState, actingEnemy.id, (unit) => ({
          ...unit,
          facing: getDirectionFromPositions(unit, targetUnit) ?? unit.facing,
        }));
      }

      nextState = setOutcomeStatus(nextState);

      if (nextState.status !== "active") {
        break;
      }

      continue;
    }

    if (action.type === "strategy" && action.targetUnitId) {
      nextState = applyStrategy(nextState, actingEnemy.id, action.targetUnitId);

      if (nextState.status !== "active") {
        break;
      }

      continue;
    }

    if (action.type === "attack" && action.targetUnitId) {
      nextState = applyResolvedBasicAttack(nextState, actingEnemy.id, action.targetUnitId);

      if (nextState.status !== "active") {
        break;
      }

      continue;
    }

    if (action.movePosition) {
      const moveDirection = getDirectionFromPositions(actingEnemy, action.movePosition);
      nextState = updateUnit(nextState, actingEnemy.id, (unit) => ({
        ...unit,
        x: action.movePosition.x,
        y: action.movePosition.y,
        hasMoved: true,
        facing: moveDirection ?? unit.facing,
      }));
      nextState = {
        ...nextState,
        lastAction: {
          type: "move",
          skillId: null,
          actorUnitId: actingEnemy.id,
          targetUnitIds: [],
          effects: [],
        },
      };
      nextState = appendLog(nextState, `${actingEnemy.name}가 (${action.movePosition.x + 1}, ${action.movePosition.y + 1}) 위치로 이동했습니다.`);
    }

    const movedEnemy = getUnitById(nextState, actingEnemy.id);
    const movedSkill = movedEnemy ? getSkillById(nextState.skills, movedEnemy.skillId) : null;

    if (
      movedEnemy
      && movedSkill
      && canUseSkill(movedEnemy, movedSkill)
      && movedEnemy.heroId !== "jeong_do_jeon"
      && movedSkill.target === "enemy"
    ) {
      const skillTargets = buildSkillHighlightPositions(nextState, movedEnemy);

      if (skillTargets.length > 0) {
        const targetUnit = nextState.units.find((unit) => unit.isAlive && unit.side === "player" && skillTargets.some((position) => isSamePosition(position, unit)));

        if (targetUnit) {
          nextState = applySkill(nextState, movedEnemy.id, targetUnit.id);
          nextState = updateUnit(nextState, movedEnemy.id, (unit) => ({
            ...unit,
            facing: getDirectionFromPositions(unit, targetUnit) ?? unit.facing,
          }));
          nextState = setOutcomeStatus(nextState);

          if (nextState.status !== "active") {
            break;
          }

          continue;
        }
      }
    }

    const attackTargets = movedEnemy ? getAttackableUnits(movedEnemy, nextState.units) : [];

    if (movedEnemy && attackTargets.length > 0) {
      nextState = applyResolvedBasicAttack(nextState, movedEnemy.id, attackTargets[0].id);

      if (nextState.status !== "active") {
        break;
      }

      continue;
    }

    const closestPlayer = playerUnits.sort((a, b) => getDistance(movedEnemy ?? actingEnemy, a) - getDistance(movedEnemy ?? actingEnemy, b))[0] ?? null;
    nextState = updateUnit(nextState, actingEnemy.id, (unit) => ({
      ...unit,
      hasActed: true,
      facing: closestPlayer ? getDirectionFromPositions(unit, closestPlayer) ?? unit.facing : unit.facing,
    }));
    nextState = {
      ...nextState,
      lastAction: {
        type: "wait",
        skillId: null,
        actorUnitId: actingEnemy.id,
        targetUnitIds: [],
        effects: [
          { unitId: actingEnemy.id, kind: "wait", text: "대기" },
        ],
      },
    };
    nextState = appendLog(nextState, `${actingEnemy.name}가 대기했습니다.`);
  }

  if (nextState.status !== "active") {
    return nextState;
  }

  nextState = applyTurnStartEffects(nextState, "player");

  return {
    ...nextState,
    turnOwner: "player",
    phase: "select",
    selectedUnitId: null,
    highlights: buildEmptyHighlights(),
  };
}
