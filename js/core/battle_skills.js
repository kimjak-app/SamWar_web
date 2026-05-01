import { getDistance } from "./battle_grid.js";

export function getSkillById(skills, skillId) {
  return skills.find((skill) => skill.id === skillId) ?? null;
}

export function canUseSkill(unit) {
  return Boolean(
    unit
    && unit.isAlive
    && !unit.hasActed
    && unit.skillId
    && unit.currentSkillCooldown <= 0,
  );
}

export function getSkillTargets(battleState, unit, skill) {
  if (!battleState || !unit || !skill || !unit.isAlive) {
    return [];
  }

  if (skill.target === "ally_all") {
    return battleState.units.filter((candidate) => candidate.isAlive && candidate.side === unit.side);
  }

  if (skill.target === "enemy") {
    return battleState.units.filter((candidate) => (
      candidate.isAlive
      && candidate.side !== unit.side
      && getDistance(unit, candidate) <= skill.range
    ));
  }

  return [];
}

export function applySkill(battleState, casterUnitId, targetUnitId = null) {
  const casterUnit = battleState.units.find((unit) => unit.id === casterUnitId) ?? null;

  if (!casterUnit) {
    return battleState;
  }

  const skill = getSkillById(battleState.skills, casterUnit.skillId);

  if (!skill || !canUseSkill(casterUnit)) {
    return battleState;
  }

  const availableTargets = getSkillTargets(battleState, casterUnit, skill);

  if (skill.type === "buff") {
    return {
      ...battleState,
      selectedUnitId: null,
      phase: "select",
      highlights: {
        move: [],
        attack: [],
        skill: [],
      },
      units: battleState.units.map((unit) => {
        if (unit.id === casterUnit.id) {
          return {
            ...unit,
            currentSkillCooldown: skill.cooldown,
            hasActed: true,
          };
        }

        if (availableTargets.some((target) => target.id === unit.id)) {
          return {
            ...unit,
            buffAttackBonus: skill.attackBuff ?? 0,
            buffTurns: skill.duration ?? 0,
          };
        }

        return unit;
      }),
      log: [
        ...battleState.log,
        `${casterUnit.name}이 ${skill.name}을 선포했습니다. 아군의 공격력이 상승했습니다.`,
      ],
      lastAction: {
        type: "skill",
        skillId: skill.id,
        actorUnitId: casterUnit.id,
        targetUnitId: null,
      },
    };
  }

  const targetUnit = availableTargets.find((unit) => unit.id === targetUnitId) ?? null;

  if (!targetUnit) {
    return battleState;
  }

  const rawDamage = casterUnit.attack
    + (skill.bonusDamage ?? 0)
    + (casterUnit.buffAttackBonus ?? 0)
    - Math.floor(targetUnit.defense * 0.3);
  const damage = Math.max(10, rawDamage);

  return {
    ...battleState,
    selectedUnitId: null,
    phase: "select",
    highlights: {
      move: [],
      attack: [],
      skill: [],
    },
    units: battleState.units.map((unit) => {
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
          isAlive: nextHp > 0,
        };
      }

      return unit;
    }),
    log: [
      ...battleState.log,
      `${casterUnit.name}이 ${skill.name}을 사용했습니다.`,
      `${targetUnit.name}에게 ${damage} 피해를 입혔습니다.`,
    ],
    lastAction: {
      type: "skill",
      skillId: skill.id,
      actorUnitId: casterUnit.id,
      targetUnitId: targetUnit.id,
    },
  };
}
