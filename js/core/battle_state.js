import { battleRosters, battleSpawnPositions } from "../../data/battle_rosters.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";
import { BATTLE_GRID_HEIGHT, BATTLE_GRID_WIDTH } from "./battle_grid.js";

let battleSequence = 0;

function buildBattleUnit(heroId) {
  const hero = heroes.find((entry) => entry.id === heroId);
  const spawnPosition = battleSpawnPositions[heroId];
  const skill = skills.find((entry) => entry.id === hero?.skillId);

  if (!hero || !spawnPosition || !skill) {
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
    attack: hero.attack,
    defense: hero.defense,
    moveRange: hero.moveRange,
    attackRange: hero.attackRange,
    skillId: hero.skillId,
    skillCooldown: skill.cooldown,
    currentSkillCooldown: 0,
    buffAttackBonus: 0,
    buffTurns: 0,
    x: spawnPosition.x,
    y: spawnPosition.y,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
  };
}

export function createInitialBattleState({ attackerCity, defenderCity }) {
  battleSequence += 1;

  const rosterUnitIds = [
    ...battleRosters.defaultPlayerAttack,
    ...battleRosters.defaultEnemyDefense,
  ];
  const units = rosterUnitIds.map(buildBattleUnit).filter(Boolean);

  return {
    id: `battle-${Date.now()}-${battleSequence}`,
    attackerCityId: attackerCity.id,
    attackerCityName: attackerCity.name,
    defenderCityId: defenderCity.id,
    defenderCityName: defenderCity.name,
    status: "active",
    turnOwner: "player",
    selectedUnitId: null,
    phase: "select",
    log: [`${attackerCity.name}에서 ${defenderCity.name} 공격을 개시했습니다.`],
    lastAction: null,
    grid: {
      width: BATTLE_GRID_WIDTH,
      height: BATTLE_GRID_HEIGHT,
    },
    skills,
    highlights: {
      move: [],
      attack: [],
      skill: [],
    },
    units,
  };
}
