import { strategyOutcomes } from "../../data/strategies.js";
import { getDistance } from "./battle_grid.js";

export function hasStatus(unit, statusId) {
  return (unit?.statusEffects?.[statusId] ?? 0) > 0;
}

export function canUseStrategy(unit) {
  return Boolean(
    unit
    && unit.isAlive
    && !unit.hasActed
    && unit.intelligence >= 80,
  );
}

export function getStrategyRange(unit) {
  if (!unit) {
    return 0;
  }

  if (unit.intelligence >= 95) {
    return 5;
  }

  if (unit.intelligence >= 90) {
    return 4;
  }

  if (unit.intelligence >= 80) {
    return 3;
  }

  return 0;
}

export function getStrategyTier(unit) {
  if (!unit || unit.intelligence < 80) {
    return "none";
  }

  if (unit.intelligence >= 95) {
    return "master";
  }

  if (unit.intelligence >= 90) {
    return "advanced";
  }

  return "basic";
}

export function getStrategyOutcomePool(unit) {
  const tier = getStrategyTier(unit);

  if (tier === "master") {
    return [
      { statusId: "confusion", duration: 2 },
      { statusId: "shake", duration: 3 },
    ];
  }

  if (tier === "advanced") {
    return [
      { statusId: "confusion", duration: 1 },
      { statusId: "shake", duration: 2 },
    ];
  }

  if (tier === "basic") {
    return [
      { statusId: "shake", duration: 1 },
    ];
  }

  return [];
}

export function getStrategyById(strategies, strategyId) {
  return strategies.find((strategy) => strategy.id === strategyId) ?? null;
}

export function getStrategyTargets(battleState, casterUnit) {
  if (!battleState || !casterUnit || !canUseStrategy(casterUnit)) {
    return [];
  }

  const range = getStrategyRange(casterUnit);

  return battleState.units.filter((unit) => (
    unit.isAlive
    && unit.side !== casterUnit.side
    && getDistance(casterUnit, unit) <= range
  ));
}

export function getStrategySuccessRate(casterUnit, targetUnit) {
  if (!casterUnit || !targetUnit) {
    return 0;
  }

  const intelligenceGap = casterUnit.intelligence - targetUnit.intelligence;
  const rate = 0.55 + intelligenceGap * 0.01;

  return Math.min(0.9, Math.max(0.25, rate));
}

export function rollStrategyOutcome(casterUnit, options = {}) {
  const pool = getStrategyOutcomePool(casterUnit);

  if (pool.length === 0) {
    return null;
  }

  if (typeof options.outcomeIndex === "number") {
    return pool[Math.max(0, Math.min(pool.length - 1, options.outcomeIndex))] ?? pool[0];
  }

  if (typeof options.outcomeRoll === "number") {
    return pool[Math.min(pool.length - 1, Math.floor(options.outcomeRoll * pool.length))] ?? pool[0];
  }

  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

export function applyStatusToUnit(unit, statusId, duration) {
  return {
    ...unit,
    statusEffects: {
      confusion: unit.statusEffects?.confusion ?? 0,
      shake: unit.statusEffects?.shake ?? 0,
      [statusId]: Math.max(duration, unit.statusEffects?.[statusId] ?? 0),
    },
  };
}

export function decrementStatusEffectsForSide(battleState, side) {
  const logs = [];
  const effects = [];

  const units = battleState.units.map((unit) => {
    if (!unit.isAlive || unit.side !== side) {
      return unit;
    }

    const currentConfusion = unit.statusEffects?.confusion ?? 0;
    const currentShake = unit.statusEffects?.shake ?? 0;
    const nextConfusion = Math.max(0, currentConfusion - 1);
    const nextShake = Math.max(0, currentShake - 1);
    const isConfusedThisTurn = currentConfusion > 0;

    if (isConfusedThisTurn) {
      logs.push(`${unit.name}은 혼란 상태로 행동할 수 없습니다.`);
      effects.push({ unitId: unit.id, kind: "status", text: "행동 불가" });
      effects.push({ unitId: unit.id, kind: "status", text: "혼란" });
    }

    return {
      ...unit,
      hasActed: isConfusedThisTurn ? true : unit.hasActed,
      statusEffects: {
        confusion: nextConfusion,
        shake: nextShake,
      },
    };
  });

  return {
    battleState: {
      ...battleState,
      units,
    },
    logs,
    effects,
  };
}

function clearStrategySelectionState(battleState) {
  return {
    ...battleState,
    selectedUnitId: null,
    selectedStrategyId: null,
    phase: "select",
    highlights: {
      move: [],
      attack: [],
      skill: [],
      facing: [],
      strategy: [],
    },
  };
}

export function applyStrategy(battleState, casterUnitId, targetUnitId, options = {}) {
  const casterUnit = battleState.units.find((unit) => unit.id === casterUnitId) ?? null;
  const strategy = getStrategyById(battleState.strategies ?? [], "strategy");

  if (!casterUnit || !strategy || !canUseStrategy(casterUnit)) {
    return battleState;
  }

  const targetUnit = getStrategyTargets(battleState, casterUnit).find((unit) => unit.id === targetUnitId) ?? null;

  if (!targetUnit) {
    return battleState;
  }

  const successRate = getStrategySuccessRate(casterUnit, targetUnit);
  const roll = typeof options.roll === "number" ? options.roll : Math.random();
  const succeeded = roll <= successRate;
  const outcome = succeeded ? rollStrategyOutcome(casterUnit, options) : null;
  const outcomeMeta = outcome ? strategyOutcomes[outcome.statusId] : null;

  const nextUnits = battleState.units.map((unit) => {
    if (unit.id === casterUnit.id) {
      return {
        ...unit,
        hasActed: true,
      };
    }

    if (succeeded && outcome && unit.id === targetUnit.id) {
      return applyStatusToUnit(unit, outcome.statusId, outcome.duration);
    }

    return unit;
  });

  const nextState = clearStrategySelectionState({
    ...battleState,
    units: nextUnits,
    lastAction: {
      type: "strategy",
      skillId: strategy.id,
      actorUnitId: casterUnit.id,
      targetUnitIds: [targetUnit.id],
      effects: succeeded && outcome && outcomeMeta
        ? [
          { unitId: casterUnit.id, kind: "strategy", text: "책략!" },
          { unitId: targetUnit.id, kind: "status", text: `${outcomeMeta.name} ${outcome.duration}턴` },
          { unitId: targetUnit.id, kind: "strategy", text: "책략 성공" },
        ]
        : [
          { unitId: casterUnit.id, kind: "strategy", text: "책략!" },
          { unitId: targetUnit.id, kind: "fail", text: "실패" },
        ],
    },
  });

  if (succeeded && outcome && outcomeMeta) {
    return {
      ...nextState,
      log: [
        ...battleState.log,
        `${casterUnit.name}이 책략을 펼쳤습니다.`,
        `책략 성공! ${targetUnit.name}에게 ${outcomeMeta.name} ${outcome.duration}턴!`,
      ],
    };
  }

  return {
    ...nextState,
    log: [
      ...battleState.log,
      `${casterUnit.name}이 책략을 펼쳤습니다.`,
      "책략 실패!",
    ],
  };
}
