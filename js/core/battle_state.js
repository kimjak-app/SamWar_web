import { battleRosters, battleSpawnPositions } from "../../data/battle_rosters.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";
import { strategies } from "../../data/strategies.js";
import { BATTLE_GRID_HEIGHT, BATTLE_GRID_WIDTH } from "./battle_grid.js";

let battleSequence = 0;

function buildBattleUnit(heroId) {
  const hero = heroes.find((entry) => entry.id === heroId);
  const spawnPosition = battleSpawnPositions[heroId];

  if (!hero || !spawnPosition) {
    return null;
  }

  return {
    id: `${hero.id}-unit`,
    heroId: hero.id,
    side: hero.side,
    name: hero.name,
    role: hero.role,
    hp: hero.maxHp,
    maxHp: hero.maxHp,
    troops: hero.troops,
    maxTroops: hero.maxTroops,
    power: hero.power,
    intelligence: hero.intelligence,
    attack: hero.attack,
    defense: hero.defense,
    moveRange: hero.moveRange,
    attackRange: hero.attackRange,
    skillRange: hero.skillRange,
    aiType: hero.aiType,
    attackEffectType: hero.attackEffectType,
    skillEffectType: hero.skillEffectType,
    baseCritChance: hero.baseCritChance,
    critBonus: hero.critBonus,
    critMultiplier: hero.critMultiplier,
    sideCritBonus: hero.sideCritBonus,
    backCritBonus: hero.backCritBonus,
    uniqueSkillId: hero.uniqueSkillId,
    skillId: hero.skillId,
    skillCooldown: hero.skillCooldown,
    portraitImage: hero.portraitImage ?? null,
    battlefieldPortraitImage: hero.battlefieldPortraitImage ?? null,
    currentSkillCooldown: 0,
    buffAttackBonus: 0,
    buffTurns: 0,
    statusEffects: {
      confusion: 0,
      shake: 0,
    },
    actionBlockReason: null,
    x: spawnPosition.x,
    y: spawnPosition.y,
    facing: hero.side === "player" ? "right" : "left",
    isDefending: false,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
  };
}

export function createInitialBattleState({
  attackerCity,
  defenderCity,
  autoBattleEnabled = false,
  battleContext = null,
}) {
  battleSequence += 1;

  const rosterUnitIds = [
    ...battleRosters.defaultPlayerAttack,
    ...battleRosters.defaultEnemyDefense,
  ];
  const units = rosterUnitIds.map(buildBattleUnit).filter(Boolean);
  const resolvedBattleContext = battleContext ?? {
    type: "attack",
    controlMode: autoBattleEnabled ? "auto" : "manual",
    attackerCityId: attackerCity.id,
    defenderCityId: defenderCity.id,
  };
  const openingLog = resolvedBattleContext.type === "defense"
    ? `${attackerCity.name}의 침공을 ${defenderCity.name}에서 맞아 방어전을 개시했습니다.`
    : `${attackerCity.name}에서 ${defenderCity.name} 공격을 개시했습니다.`;

  return {
    id: `battle-${Date.now()}-${battleSequence}`,
    attackerCityId: attackerCity.id,
    attackerCityName: attackerCity.name,
    defenderCityId: defenderCity.id,
    defenderCityName: defenderCity.name,
    battleContext: resolvedBattleContext,
    status: "active",
    turnOwner: "player",
    selectedUnitId: null,
    selectedStrategyId: null,
    pendingMove: null,
    autoBattleEnabled,
    phase: "select",
    log: [openingLog],
    lastAction: null,
    grid: {
      width: BATTLE_GRID_WIDTH,
      height: BATTLE_GRID_HEIGHT,
    },
    skills,
    strategies,
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
    units,
  };
}
