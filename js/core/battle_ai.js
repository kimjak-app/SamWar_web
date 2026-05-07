import { BATTLE_BALANCE } from "./battle_balance.js";
import { getDirectionFromPositions } from "./battle_direction.js";
import { getAttackableUnits, getDistance, getWalkablePositions } from "./battle_grid.js";
import {
  canUseSkill,
  getEffectiveAttack,
  getEffectiveDefense,
  getSkillById,
  getSkillTargets,
} from "./battle_skills.js";
import { canUseStrategy, getStrategyTargets } from "./battle_strategy.js";

function getOpposingUnits(battleState, unit) {
  return battleState.units.filter((candidate) => candidate.isAlive && candidate.side !== unit.side);
}

function getAlliedUnits(battleState, unit) {
  return battleState.units.filter((candidate) => candidate.isAlive && candidate.side === unit.side);
}

function estimateBasicDamage(attacker, target) {
  const rawDamage = (
    getEffectiveAttack(attacker)
    - getEffectiveDefense(target) * 0.45
  ) * BATTLE_BALANCE.damageScale;

  return Math.max(BATTLE_BALANCE.minimumBasicDamage, Math.round(rawDamage));
}

function estimateSkillDamage(attacker, target, skill) {
  const rawDamage = (
    getEffectiveAttack(attacker)
    - getEffectiveDefense(target) * 0.35
  ) * BATTLE_BALANCE.damageScale + (skill?.bonusDamage ?? 0);
  const scaledDamage = Math.max(BATTLE_BALANCE.minimumSkillDamage, Math.round(rawDamage)) * (skill?.damageMultiplier ?? 1);

  return Math.max(BATTLE_BALANCE.minimumSkillDamage, Math.round(scaledDamage));
}

function getPreferredRange(unit, skill) {
  if (unit.aiType === "aggressive" || unit.role === "melee") {
    return 1;
  }

  if (unit.aiType === "support") {
    return Math.max(1, unit.attackRange);
  }

  if (skill && skill.target === "enemy" && skill.rangeSource === "unit.skillRange") {
    return unit.skillRange;
  }

  return unit.attackRange;
}

export function scoreTargetForUnit(unit, target, battleState, options = {}) {
  if (!unit || !target || !target.isAlive || unit.side === target.side) {
    return Number.NEGATIVE_INFINITY;
  }

  const skill = options.skill ?? null;
  const estimatedDamage = skill
    ? estimateSkillDamage(unit, target, skill)
    : estimateBasicDamage(unit, target);
  const distance = getDistance(unit, target);
  let score = 0;

  score += target.maxHp - target.hp;
  score += Math.max(0, 12 - distance * 2);

  if (target.hp <= estimatedDamage) {
    score += 40;
  }

  if (target.role === "support") {
    score += 15;
  }

  if (target.role === "ranged") {
    score += 10;
  }

  if (skill?.id === "hakikjin_barrage") {
    const splashTargets = getSkillTargets(battleState, unit, skill);
    score += splashTargets.length * 12;
  }

  if (skill?.effectType === "self_defense_single" && (unit.buffDefenseBonus ?? 0) <= 0) {
    score += 10;
  }

  if (skill?.effectType === "single_damage_adjacent_shake") {
    const adjacentOpponents = getOpposingUnits(battleState, unit)
      .filter((candidate) => candidate.id !== target.id && getDistance(candidate, target) === 1)
      .length;
    score += adjacentOpponents * 8 * (skill.shakeChance ?? 0);
  }

  if (unit.aiType === "aggressive") {
    score += Math.max(0, 8 - distance);
  }

  return score;
}

function pickBestTarget(unit, targets, battleState, options = {}) {
  return targets
    .slice()
    .sort((leftTarget, rightTarget) => (
      scoreTargetForUnit(unit, rightTarget, battleState, options)
      - scoreTargetForUnit(unit, leftTarget, battleState, options)
    ))[0] ?? null;
}

function shouldUseSupportSkill(unit, allies) {
  return unit.aiType === "support"
    && allies.length > 0
    && allies.some((ally) => ally.buffTurns <= 0 || ally.buffAttackBonus <= 0);
}

function pickBestSupportSkillTarget(allies) {
  return allies
    .slice()
    .sort((leftAlly, rightAlly) => {
      const leftNeedsBuff = leftAlly.buffTurns <= 0 || leftAlly.buffAttackBonus <= 0;
      const rightNeedsBuff = rightAlly.buffTurns <= 0 || rightAlly.buffAttackBonus <= 0;

      if (leftNeedsBuff !== rightNeedsBuff) {
        return rightNeedsBuff ? 1 : -1;
      }

      return leftAlly.hp - rightAlly.hp;
    })[0] ?? null;
}

function scoreMovePosition(unit, position, target, battleState, skill = null) {
  const preferredRange = getPreferredRange(unit, skill);
  const distance = getDistance(position, target);
  const attackReach = position && distance <= unit.attackRange;
  const skillReach = skill && skill.rangeSource === "unit.skillRange" && distance <= unit.skillRange;
  let score = 0;

  if (skillReach) {
    score += 42;
  }

  if (attackReach) {
    score += 34;
  }

  if (unit.aiType === "aggressive" || unit.role === "melee") {
    score += 22 - distance * 4;
  } else if (unit.aiType === "ranged" || unit.role === "ranged") {
    score += 20 - Math.abs(distance - preferredRange) * 5;

    if (distance <= 1) {
      score -= 18;
    }
  } else {
    score += 14 - Math.abs(distance - preferredRange) * 3;
  }

  if (position.y === target.y) {
    score += 2;
  }

  const occupiedOpponentsNearby = getOpposingUnits(battleState, unit)
    .filter((candidate) => getDistance(position, candidate) <= 1)
    .length;

  if ((unit.aiType === "ranged" || unit.role === "ranged") && occupiedOpponentsNearby > 0) {
    score -= occupiedOpponentsNearby * 10;
  }

  return score;
}

export function getBestMoveTowardTarget(unit, target, battleState) {
  const skill = getSkillById(battleState.skills ?? [], unit.skillId);
  const walkablePositions = getWalkablePositions(unit, battleState.units, battleState.grid);
  let bestMove = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const position of walkablePositions) {
    const score = scoreMovePosition(unit, position, target, battleState, skill);

    if (score > bestScore) {
      bestScore = score;
      bestMove = position;
    }
  }

  return bestMove;
}

function getBestOpponent(unit, battleState) {
  return pickBestTarget(unit, getOpposingUnits(battleState, unit), battleState);
}

function hasNearbySecondaryTarget(primaryTarget, targets, skill) {
  return targets.some((candidate) => (
    candidate.id !== primaryTarget.id
    && getDistance(candidate, primaryTarget) <= (skill.secondaryTargetRange ?? 0)
  ));
}

function pickBestCollisionSkillTarget(unit, skillTargets, battleState, skill) {
  return pickBestTarget(
    unit,
    skillTargets.filter((target) => hasNearbySecondaryTarget(target, skillTargets, skill)),
    battleState,
    { skill },
  );
}

function buildHighValueSkillAction(battleState, unit) {
  const skill = getSkillById(battleState.skills ?? [], unit.skillId);

  if (!skill || !canUseSkill(unit, skill)) {
    return null;
  }

  const skillTargets = getSkillTargets(battleState, unit, skill);

  if (skillTargets.length === 0) {
    return null;
  }

  if (skill.effectType === "ally_attack_buff") {
    const allies = getAlliedUnits(battleState, unit);

    if (!shouldUseSupportSkill(unit, allies)) {
      return null;
    }

    const target = pickBestSupportSkillTarget(skillTargets);

    if (!target) {
      return null;
    }

    return {
      type: "skill",
      actorUnitId: unit.id,
      skillId: skill.id,
      targetUnitId: target.id,
      movePosition: null,
      facingDirection: getDirectionFromPositions(unit, target) ?? unit.facing,
    };
  }

  if (skill.effectType === "enemy_collision_confuse") {
    const targetWithSecondary = pickBestCollisionSkillTarget(unit, skillTargets, battleState, skill);

    if (targetWithSecondary) {
      return {
        type: "skill",
        actorUnitId: unit.id,
        skillId: skill.id,
        targetUnitId: targetWithSecondary.id,
        movePosition: null,
        facingDirection: getDirectionFromPositions(unit, targetWithSecondary) ?? unit.facing,
      };
    }

    return null;
  }

  if (skill.effectType === "cannon_aoe") {
    return {
      type: "skill",
      actorUnitId: unit.id,
      skillId: skill.id,
      targetUnitId: skillTargets[0].id,
      movePosition: null,
      facingDirection: getDirectionFromPositions(unit, skillTargets[0]) ?? unit.facing,
    };
  }

  if (unit.role === "support" || unit.aiType === "support") {
    return null;
  }

  const target = pickBestTarget(unit, skillTargets, battleState, { skill });

  if (!target) {
    return null;
  }

  return {
    type: "skill",
    actorUnitId: unit.id,
    skillId: skill.id,
    targetUnitId: target.id,
    movePosition: null,
    facingDirection: getDirectionFromPositions(unit, target) ?? unit.facing,
  };
}

function buildFallbackSkillAction(battleState, unit) {
  const skill = getSkillById(battleState.skills ?? [], unit.skillId);

  if (!skill || !canUseSkill(unit, skill)) {
    return null;
  }

  const skillTargets = getSkillTargets(battleState, unit, skill);

  if (skillTargets.length === 0) {
    return null;
  }

  if (skill.effectType !== "enemy_collision_confuse") {
    return null;
  }

  const target = pickBestTarget(unit, skillTargets, battleState, { skill });

  if (!target) {
    return null;
  }

  return {
    type: "skill",
    actorUnitId: unit.id,
    skillId: skill.id,
    targetUnitId: target.id,
    movePosition: null,
    facingDirection: getDirectionFromPositions(unit, target) ?? unit.facing,
  };
}

function buildAttackAction(battleState, unit) {
  const attackTargets = getAttackableUnits(unit, battleState.units);
  const target = pickBestTarget(unit, attackTargets, battleState);

  if (!target) {
    return null;
  }

  return {
    type: "attack",
    actorUnitId: unit.id,
    targetUnitId: target.id,
    movePosition: null,
    facingDirection: getDirectionFromPositions(unit, target) ?? unit.facing,
  };
}

function buildStrategyAction(battleState, unit) {
  if (!canUseStrategy(unit)) {
    return null;
  }

  const strategyTargets = getStrategyTargets(battleState, unit);
  const target = pickBestTarget(unit, strategyTargets, battleState);

  if (!target) {
    return null;
  }

  return {
    type: "strategy",
    actorUnitId: unit.id,
    targetUnitId: target.id,
    movePosition: null,
    facingDirection: getDirectionFromPositions(unit, target) ?? unit.facing,
  };
}

export function getAiTurnAction(battleState, unit) {
  if (!unit || !unit.isAlive || unit.hasActed) {
    return {
      type: "wait",
      actorUnitId: unit?.id ?? null,
      targetUnitId: null,
      movePosition: null,
      facingDirection: unit?.facing ?? null,
    };
  }

  const highValueSkillAction = buildHighValueSkillAction(battleState, unit);

  if (highValueSkillAction) {
    return highValueSkillAction;
  }

  const attackAction = buildAttackAction(battleState, unit);

  if (attackAction) {
    return attackAction;
  }

  const bestTarget = getBestOpponent(unit, battleState);

  if (!bestTarget) {
    return {
      type: "wait",
      actorUnitId: unit.id,
      targetUnitId: null,
      movePosition: null,
      facingDirection: unit.facing,
    };
  }

  if (unit.hasMoved) {
    const postMoveAttackAction = buildAttackAction(battleState, unit);

    if (postMoveAttackAction) {
      return postMoveAttackAction;
    }

    return {
      type: "wait",
      actorUnitId: unit.id,
      targetUnitId: null,
      movePosition: null,
      facingDirection: getDirectionFromPositions(unit, bestTarget) ?? unit.facing,
    };
  }

  const bestMove = getBestMoveTowardTarget(unit, bestTarget, battleState);

  if (bestMove) {
    return {
      type: "move",
      actorUnitId: unit.id,
      targetUnitId: null,
      movePosition: bestMove,
      facingDirection: getDirectionFromPositions(bestMove, bestTarget) ?? unit.facing,
    };
  }

  const fallbackSkillAction = buildFallbackSkillAction(battleState, unit);

  if (fallbackSkillAction) {
    return fallbackSkillAction;
  }

  const strategyAction = buildStrategyAction(battleState, unit);

  if (strategyAction) {
    return strategyAction;
  }

  const finalAttackAction = buildAttackAction(battleState, unit);

  if (finalAttackAction) {
    return finalAttackAction;
  }

  return {
    type: "wait",
    actorUnitId: unit.id,
    targetUnitId: null,
    movePosition: null,
    facingDirection: getDirectionFromPositions(unit, bestTarget) ?? unit.facing,
  };
}
