import { getDirectionFromPositions } from "./battle_direction.js";
import { getAttackableUnits, getDistance, getWalkablePositions } from "./battle_grid.js";
import { canUseSkill, getSkillById, getSkillTargets } from "./battle_skills.js";
import { canUseStrategy, getStrategyTargets } from "./battle_strategy.js";

function getClosestPlayerUnit(enemyUnit, playerUnits) {
  return playerUnits
    .filter((unit) => unit.isAlive)
    .sort((leftUnit, rightUnit) => getDistance(enemyUnit, leftUnit) - getDistance(enemyUnit, rightUnit))[0] ?? null;
}

export function getEnemyTurnAction(battleState, enemyUnit, playerUnits) {
  const skill = getSkillById(battleState.skills, enemyUnit?.skillId);
  const skillTargets = skill && canUseSkill(enemyUnit, skill) ? getSkillTargets(battleState, enemyUnit, skill) : [];
  const genericStrategy = (battleState.strategies ?? []).find((strategy) => strategy.id === "strategy") ?? null;
  const strategyTargets = genericStrategy && canUseStrategy(enemyUnit) ? getStrategyTargets(battleState, enemyUnit) : [];

  if (
    enemyUnit?.heroId === "nobunaga"
    && skill?.id === "matchlock_volley"
    && skillTargets.length > 0
  ) {
    return {
      type: "skill",
      targetUnitId: skillTargets[0].id,
      movePosition: null,
      facingDirection: getDirectionFromPositions(enemyUnit, skillTargets[0]),
    };
  }

  if (
    enemyUnit?.heroId === "kenshin"
    && skill?.id === "cavalry_charge"
    && skillTargets.length > 0
  ) {
    return {
      type: "skill",
      targetUnitId: skillTargets[0].id,
      movePosition: null,
      facingDirection: getDirectionFromPositions(enemyUnit, skillTargets[0]),
    };
  }

  const attackTargets = getAttackableUnits(enemyUnit, battleState.units);

  if (attackTargets.length > 0) {
    return {
      type: "attack",
      targetUnitId: attackTargets[0].id,
      movePosition: null,
      facingDirection: getDirectionFromPositions(enemyUnit, attackTargets[0]),
    };
  }

  if (genericStrategy && strategyTargets.length > 0) {
    return {
      type: "strategy",
      strategyId: genericStrategy.id,
      targetUnitId: strategyTargets[0].id,
      movePosition: null,
      facingDirection: getDirectionFromPositions(enemyUnit, strategyTargets[0]),
    };
  }

  const closestPlayer = getClosestPlayerUnit(enemyUnit, playerUnits);

  if (!closestPlayer) {
    return {
      type: "wait",
      targetUnitId: null,
      movePosition: null,
      facingDirection: null,
    };
  }

  const walkablePositions = getWalkablePositions(enemyUnit, battleState.units, battleState.grid);
  let bestMove = null;
  let bestDistance = getDistance(enemyUnit, closestPlayer);

  for (const position of walkablePositions) {
    const distance = getDistance(position, closestPlayer);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestMove = position;
    }
  }

  return {
    type: bestMove ? "move" : "wait",
    targetUnitId: null,
    movePosition: bestMove,
    facingDirection: bestMove ? getDirectionFromPositions(bestMove, closestPlayer) : getDirectionFromPositions(enemyUnit, closestPlayer),
  };
}
