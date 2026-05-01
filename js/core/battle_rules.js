import { getEnemyTurnAction } from "./battle_ai.js";
import { getAttackableUnits, getDistance, getWalkablePositions, isSamePosition } from "./battle_grid.js";
import { applySkill, canUseSkill, getSkillById } from "./battle_skills.js";

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
  };
}

function buildSkillHighlightPositions(battleState, unit) {
  const skill = getSkillById(battleState.skills, unit?.skillId);

  if (!skill || !canUseSkill(unit) || skill.type !== "damage") {
    return [];
  }

  return battleState.units
    .filter((target) => target.isAlive && target.side !== unit.side && getDistance(unit, target) <= skill.range)
    .map((target) => ({ x: target.x, y: target.y }));
}

function buildSelectionHighlights(battleState, unit) {
  return {
    move: unit.hasMoved ? [] : getWalkablePositions(unit, battleState.units, battleState.grid),
    attack: getAttackableUnits(unit, battleState.units).map((target) => ({ x: target.x, y: target.y })),
    skill: buildSkillHighlightPositions(battleState, unit),
  };
}

function dealBasicDamage(attacker, target) {
  const rawDamage = attacker.attack + (attacker.buffAttackBonus ?? 0) - Math.floor(target.defense * 0.4);
  return Math.max(8, rawDamage);
}

function applyTurnStartEffects(battleState, side) {
  return {
    ...battleState,
    units: battleState.units.map((unit) => {
      if (unit.side !== side || !unit.isAlive) {
        return unit;
      }

      const nextBuffTurns = Math.max(0, unit.buffTurns - 1);

      return {
        ...unit,
        currentSkillCooldown: Math.max(0, unit.currentSkillCooldown - 1),
        buffTurns: nextBuffTurns,
        buffAttackBonus: nextBuffTurns > 0 ? unit.buffAttackBonus : 0,
        hasMoved: false,
        hasActed: false,
      };
    }),
  };
}

function setOutcomeStatus(battleState) {
  const outcome = getBattleOutcome(battleState);

  if (outcome === "won") {
    return appendLog({
      ...battleState,
      status: "won",
      phase: "ended",
      selectedUnitId: null,
      highlights: buildEmptyHighlights(),
    }, "승리! 적 도시를 점령할 수 있습니다.");
  }

  if (outcome === "lost") {
    return appendLog({
      ...battleState,
      status: "lost",
      phase: "ended",
      selectedUnitId: null,
      highlights: buildEmptyHighlights(),
    }, "패배했습니다.");
  }

  return battleState;
}

function applyResolvedBasicAttack(battleState, attackerUnitId, targetUnitId) {
  const attacker = getUnitById(battleState, attackerUnitId);
  const target = getUnitById(battleState, targetUnitId);

  if (!attacker || !target || !attacker.isAlive || !target.isAlive || attacker.side === target.side) {
    return battleState;
  }

  if (getDistance(attacker, target) > attacker.attackRange) {
    return battleState;
  }

  const damage = dealBasicDamage(attacker, target);
  let nextState = updateUnit(battleState, target.id, (unit) => {
    const nextHp = Math.max(0, unit.hp - damage);

    return {
      ...unit,
      hp: nextHp,
      isAlive: nextHp > 0,
    };
  });

  nextState = updateUnit(nextState, attacker.id, (unit) => ({
    ...unit,
    hasActed: true,
  }));
  nextState = {
    ...nextState,
    lastAction: {
      type: "attack",
      actorUnitId: attacker.id,
      targetUnitId: target.id,
      skillId: null,
    },
  };
  nextState = appendLog(nextState, `${attacker.name}가 ${target.name}를 공격해 ${damage} 피해를 입혔습니다.`);

  return setOutcomeStatus(nextState);
}

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

export function clearBattleSelection(battleState) {
  return {
    ...battleState,
    selectedUnitId: null,
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
    phase: "attack",
    highlights: movedUnit ? buildSelectionHighlights(nextState, movedUnit) : buildEmptyHighlights(),
    lastAction: {
      type: "move",
      actorUnitId: selectedUnit.id,
      targetUnitId: null,
      skillId: null,
    },
  };

  return appendLog(nextState, `${selectedUnit.name}가 (${targetPosition.x + 1}, ${targetPosition.y + 1}) 위치로 이동했습니다.`);
}

export function enterSkillMode(battleState) {
  const selectedUnit = getSelectedUnit(battleState);
  const skill = getSkillById(battleState.skills, selectedUnit?.skillId);

  if (!selectedUnit || !skill || !canUseSkill(selectedUnit) || skill.type !== "damage") {
    return battleState;
  }

  return {
    ...battleState,
    phase: "skill",
    highlights: {
      ...battleState.highlights,
      skill: buildSkillHighlightPositions(battleState, selectedUnit),
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

  if (!selectedUnit) {
    return battleState;
  }

  const skill = getSkillById(battleState.skills, selectedUnit.skillId);

  if (!skill || !canUseSkill(selectedUnit)) {
    return battleState;
  }

  if (skill.type === "damage") {
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
      nextState = applySkill(nextState, actingEnemy.id, action.targetUnitId);
      nextState = setOutcomeStatus(nextState);

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
      nextState = updateUnit(nextState, actingEnemy.id, (unit) => ({
        ...unit,
        x: action.movePosition.x,
        y: action.movePosition.y,
        hasMoved: true,
      }));
      nextState = {
        ...nextState,
        lastAction: {
          type: "move",
          actorUnitId: actingEnemy.id,
          targetUnitId: null,
          skillId: null,
        },
      };
      nextState = appendLog(nextState, `${actingEnemy.name}가 (${action.movePosition.x + 1}, ${action.movePosition.y + 1}) 위치로 이동했습니다.`);
    }

    const movedEnemy = getUnitById(nextState, actingEnemy.id);
    const attackTargets = movedEnemy ? getAttackableUnits(movedEnemy, nextState.units) : [];

    if (movedEnemy && attackTargets.length > 0) {
      nextState = applyResolvedBasicAttack(nextState, movedEnemy.id, attackTargets[0].id);

      if (nextState.status !== "active") {
        break;
      }

      continue;
    }

    nextState = updateUnit(nextState, actingEnemy.id, (unit) => ({
      ...unit,
      hasActed: true,
    }));
    nextState = appendLog(nextState, `${actingEnemy.name}가 공격 기회를 찾지 못했습니다.`);
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
