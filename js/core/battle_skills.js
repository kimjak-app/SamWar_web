import { getDistance } from "./battle_grid.js";
import { applyStatusToUnit, hasStatus } from "./battle_strategy.js";
import { BATTLE_BALANCE } from "./battle_balance.js";

export const DAMAGE_SCALE = BATTLE_BALANCE.damageScale;

export function getSkillById(skills, skillId) {
  return skills.find((skill) => skill.id === skillId) ?? null;
}

export function getGodotAttackValue(unit) {
  return unit.power * 0.8 + unit.intelligence * 0.2;
}

export function getGodotDefenseValue(unit) {
  return unit.power * 0.6 + unit.intelligence * 0.4;
}

export function getEffectiveAttack(unit) {
  let value = getGodotAttackValue(unit) * (1 + (unit.buffAttackBonus ?? 0));

  if (hasStatus(unit, "shake")) {
    value *= BATTLE_BALANCE.shakeMultiplier;
  }

  return value;
}

export function getEffectiveDefense(unit) {
  let value = getGodotDefenseValue(unit) * (1 + (unit.buffDefenseBonus ?? 0));

  if (hasStatus(unit, "shake")) {
    value *= BATTLE_BALANCE.shakeMultiplier;
  }

  return value;
}

function buildClearedSelectionState(battleState) {
  return {
    ...battleState,
    selectedUnitId: null,
    selectedStrategyId: null,
    phase: "select",
    highlights: {
      move: [],
      attack: [],
      attackTargets: [],
      skill: [],
      skillTargets: [],
      facing: [],
      strategy: [],
      strategyTargets: [],
    },
  };
}

export function getResolvedSkillRange(unit, skill) {
  if (skill.rangeSource === "unit.skillRange" || skill.rangeSource === "skill.range") {
    return unit.skillRange;
  }

  return 0;
}

export function getSkillTargetSide(skill) {
  return skill?.targetSide ?? "enemy";
}

export function isValidSkillTriggerTarget(casterUnit, targetUnit, skill) {
  if (!casterUnit || !targetUnit || !skill || !targetUnit.isAlive) {
    return false;
  }

  const targetSide = getSkillTargetSide(skill);

  if (targetSide === "enemy") {
    return casterUnit.side !== targetUnit.side;
  }

  if (targetSide === "ally") {
    if (casterUnit.id === targetUnit.id) {
      return skill.includeSelf !== false;
    }

    return casterUnit.side === targetUnit.side;
  }

  if (targetSide === "self") {
    return casterUnit.id === targetUnit.id;
  }

  if (targetSide === "any") {
    return true;
  }

  return false;
}

export function canUseSkill(unit, skill) {
  return Boolean(
    unit
    && skill
    && unit.isAlive
    && !unit.hasActed
    && unit.currentSkillCooldown <= 0
    && unit.skillId === skill.id
    && unit.uniqueSkillId === skill.id
    && skill.ownerHeroId === unit.heroId,
  );
}

export function getSkillTargets(battleState, unit, skill) {
  if (!battleState || !unit || !skill || !canUseSkill(unit, skill)) {
    return [];
  }

  const range = getResolvedSkillRange(unit, skill);

  return battleState.units.filter((candidate) => (
    candidate.isAlive
    && getDistance(unit, candidate) <= range
    && isValidSkillTriggerTarget(unit, candidate, skill)
  ));
}

function buildSkillDamage(caster, target, skillBonus = 0) {
  const rawDamage = (getEffectiveAttack(caster) - getEffectiveDefense(target) * 0.35) * DAMAGE_SCALE + skillBonus;
  return Math.max(BATTLE_BALANCE.minimumSkillDamage, Math.round(rawDamage));
}

function buildSkillDamageWithMultiplier(caster, target, skill) {
  const baseDamage = buildSkillDamage(caster, target, skill?.bonusDamage ?? 0);
  return Math.max(
    BATTLE_BALANCE.minimumSkillDamage,
    Math.round(baseDamage * (skill?.damageMultiplier ?? 1)),
  );
}

function areUnitsAdjacent(leftUnit, rightUnit) {
  return getDistance(leftUnit, rightUnit) === 1;
}

export function applyHakikjinBarrage(battleState, casterUnit, skill) {
  const targets = getSkillTargets(battleState, casterUnit, skill);

  if (targets.length === 0) {
    return {
      ...battleState,
      log: [...battleState.log, "학익진 포격 범위 안에 적이 없습니다."],
    };
  }

  const targetById = new Map(targets.map((target) => [target.id, target]));
  const effects = [
    { unitId: casterUnit.id, kind: "skill_name", text: "학익진 포격!" },
  ];
  const logs = ["이순신이 학익진 포격을 전개했습니다."];

  const nextUnits = battleState.units.map((unit) => {
    if (unit.id === casterUnit.id) {
      return {
        ...unit,
        currentSkillCooldown: skill.cooldown,
        hasActed: true,
      };
    }

    const target = targetById.get(unit.id);

    if (!target) {
      return unit;
    }

    const damage = buildSkillDamage(casterUnit, target, 10);
    const nextHp = Math.max(0, unit.hp - damage);
    effects.push({ unitId: unit.id, kind: "damage", text: `-${damage}` });
    logs.push(`${unit.name}에게 ${damage} 피해!`);

    return {
      ...unit,
      hp: nextHp,
      troops: nextHp,
      isAlive: nextHp > 0,
    };
  });

  return {
    ...buildClearedSelectionState(battleState),
    units: nextUnits,
    log: [...battleState.log, ...logs],
    lastAction: {
      type: "skill",
      skillId: skill.id,
      actorUnitId: casterUnit.id,
      targetUnitIds: targets.map((target) => target.id),
      effects,
    },
  };
}

export function applyReformOrder(battleState, casterUnit, skill) {
  const targets = getSkillTargets(battleState, casterUnit, skill);
  const effects = [
    { unitId: casterUnit.id, kind: "skill_name", text: "개혁령!" },
  ];
  const logs = ["정도전이 개혁령을 선포했습니다."];

  const nextUnits = battleState.units.map((unit) => {
    if (unit.id === casterUnit.id) {
      effects.push({ unitId: unit.id, kind: "buff", text: "공격 상승" });
      logs.push(`${unit.name} 공격력 상승!`);

      return {
        ...unit,
        currentSkillCooldown: skill.cooldown,
        hasActed: true,
        buffAttackBonus: skill.buffAttackBonus ?? 0,
        buffTurns: skill.duration ?? 0,
      };
    }

    if (targets.some((target) => target.id === unit.id)) {
      effects.push({ unitId: unit.id, kind: "buff", text: "공격 상승" });
      logs.push(`${unit.name} 공격력 상승!`);

      return {
        ...unit,
        buffAttackBonus: skill.buffAttackBonus ?? 0,
        buffTurns: skill.duration ?? 0,
      };
    }

    return unit;
  });

  return {
    ...buildClearedSelectionState(battleState),
    units: nextUnits,
    log: [...battleState.log, ...logs],
    lastAction: {
      type: "buff",
      skillId: skill.id,
      actorUnitId: casterUnit.id,
      targetUnitIds: targets.map((target) => target.id),
      effects,
    },
  };
}

function applySingleTargetSkill(battleState, casterUnit, skill, targetUnit) {
  const damage = buildSkillDamageWithMultiplier(casterUnit, targetUnit, skill);
  const nextUnits = battleState.units.map((unit) => {
    if (unit.id === casterUnit.id) {
      return {
        ...unit,
        currentSkillCooldown: skill.cooldown,
        hasActed: true,
      };
    }

    if (unit.id === targetUnit.id) {
      const nextHp = Math.max(0, unit.hp - damage);

      return {
        ...unit,
        hp: nextHp,
        troops: nextHp,
        isAlive: nextHp > 0,
      };
    }

    return unit;
  });

  return {
    ...buildClearedSelectionState(battleState),
    units: nextUnits,
    log: [
      ...battleState.log,
      `${casterUnit.name}이 ${skill.name}을 사용했습니다.`,
      `${targetUnit.name}에게 ${damage} 피해!`,
    ],
    lastAction: {
      type: "skill",
      skillId: skill.id,
      actorUnitId: casterUnit.id,
      targetUnitIds: [targetUnit.id],
      effects: [
        { unitId: casterUnit.id, kind: "skill_name", text: `${skill.name}!` },
        { unitId: targetUnit.id, kind: "damage", text: `-${damage}` },
      ],
    },
  };
}

function applySelfDefenseSingleSkill(battleState, casterUnit, skill, targetUnit) {
  const damage = buildSkillDamageWithMultiplier(casterUnit, targetUnit, skill);
  const nextUnits = battleState.units.map((unit) => {
    if (unit.id === casterUnit.id) {
      return {
        ...unit,
        currentSkillCooldown: skill.cooldown,
        hasActed: true,
        buffDefenseBonus: skill.selfDefenseBonus ?? 0,
        defenseBuffTurns: skill.selfDefenseTurns ?? 0,
      };
    }

    if (unit.id === targetUnit.id) {
      const nextHp = Math.max(0, unit.hp - damage);

      return {
        ...unit,
        hp: nextHp,
        troops: nextHp,
        isAlive: nextHp > 0,
      };
    }

    return unit;
  });

  return {
    ...buildClearedSelectionState(battleState),
    units: nextUnits,
    log: [
      ...battleState.log,
      `${casterUnit.name}가 ${skill.name}으로 적 부대를 베어냈습니다.`,
      `${targetUnit.name}에게 ${damage} 피해!`,
      `${casterUnit.name}가 ${skill.name} 후 방어 태세를 굳혔습니다.`,
    ],
    lastAction: {
      type: "skill",
      skillId: skill.id,
      actorUnitId: casterUnit.id,
      targetUnitIds: [targetUnit.id, casterUnit.id],
      effects: [
        { unitId: casterUnit.id, kind: "skill_name", text: `${skill.name}!` },
        { unitId: targetUnit.id, kind: "damage", text: `-${damage}` },
        { unitId: casterUnit.id, kind: "buff", text: `방어 +${Math.round((skill.selfDefenseBonus ?? 0) * 100)}%` },
      ],
    },
  };
}

function applySingleDamageAdjacentShakeSkill(battleState, casterUnit, skill, targetUnit) {
  const damage = buildSkillDamageWithMultiplier(casterUnit, targetUnit, skill);
  const shakenTargetIds = [];
  const nextUnits = battleState.units.map((unit) => {
    if (unit.id === casterUnit.id) {
      return {
        ...unit,
        currentSkillCooldown: skill.cooldown,
        hasActed: true,
      };
    }

    if (unit.id === targetUnit.id) {
      const nextHp = Math.max(0, unit.hp - damage);

      return {
        ...unit,
        hp: nextHp,
        troops: nextHp,
        isAlive: nextHp > 0,
      };
    }

    if (
      unit.isAlive
      && unit.side === targetUnit.side
      && unit.id !== targetUnit.id
      && areUnitsAdjacent(unit, targetUnit)
      && Math.random() <= (skill.shakeChance ?? 0)
    ) {
      shakenTargetIds.push(unit.id);
      return applyStatusToUnit(unit, "shake", skill.shakeTurns ?? 0);
    }

    return unit;
  });

  const logs = [
    ...battleState.log,
    `${casterUnit.name}가 ${skill.name}로 적 진형을 뒤흔들었습니다.`,
    `${targetUnit.name}에게 ${damage} 피해!`,
  ];
  const effects = [
    { unitId: casterUnit.id, kind: "skill_name", text: `${skill.name}!` },
    { unitId: targetUnit.id, kind: "damage", text: `-${damage}` },
  ];

  shakenTargetIds.forEach((unitId) => {
    const shakenUnit = battleState.units.find((unit) => unit.id === unitId);
    if (shakenUnit) {
      logs.push(`${casterUnit.name}의 ${skill.name}에 ${shakenUnit.name}가 동요했습니다.`);
      effects.push({ unitId, kind: "status", text: `동요 ${skill.shakeTurns ?? 0}턴` });
    }
  });

  return {
    ...buildClearedSelectionState(battleState),
    units: nextUnits,
    log: logs,
    lastAction: {
      type: "skill",
      skillId: skill.id,
      actorUnitId: casterUnit.id,
      targetUnitIds: [targetUnit.id, ...shakenTargetIds],
      effects,
    },
  };
}

export function applySkill(battleState, casterUnitId, targetUnitId = null) {
  const casterUnit = battleState.units.find((unit) => unit.id === casterUnitId) ?? null;

  if (!casterUnit) {
    return battleState;
  }

  const skill = getSkillById(battleState.skills, casterUnit.skillId);

  if (!skill) {
    return battleState;
  }

  if (!canUseSkill(casterUnit, skill)) {
    return {
      ...battleState,
      log: [...battleState.log, `${casterUnit.name}의 고유 특기 조건이 맞지 않아 사용할 수 없습니다.`],
    };
  }

  const availableTargets = getSkillTargets(battleState, casterUnit, skill);
  const targetUnit = availableTargets.find((unit) => unit.id === targetUnitId) ?? null;

  if (!targetUnit) {
    return battleState;
  }

  if (skill.effectType === "cannon_aoe") {
    return applyHakikjinBarrage(battleState, casterUnit, skill);
  }

  if (skill.effectType === "ally_attack_buff") {
    return applyReformOrder(battleState, casterUnit, skill);
  }

  if (skill.effectType === "self_defense_single") {
    return applySelfDefenseSingleSkill(battleState, casterUnit, skill, targetUnit);
  }

  if (skill.effectType === "single_damage_adjacent_shake") {
    return applySingleDamageAdjacentShakeSkill(battleState, casterUnit, skill, targetUnit);
  }

  return applySingleTargetSkill(battleState, casterUnit, skill, targetUnit);
}
