import { normalizeTerrainMap } from "../../data/battle_terrain.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";
import { strategies } from "../../data/strategies.js";
import { BATTLE_GRID_HEIGHT, BATTLE_GRID_WIDTH } from "./battle_grid.js";
import {
  getHeroIdsBySideAndLocation,
  initializeHeroLocationsFromRosters,
} from "./world_rules.js";

let battleSequence = 0;

const battleSideSpawnSlots = {
  left: [
    { x: 2, y: 5 },
    { x: 2, y: 4 },
    { x: 1, y: 5 },
    { x: 1, y: 4 },
  ],
  right: [
    { x: 11, y: 3 },
    { x: 11, y: 4 },
    { x: 12, y: 3 },
    { x: 12, y: 4 },
  ],
};

export function getBattleSpawnSides(attackerCity, defenderCity) {
  if (Number.isFinite(attackerCity?.x) && Number.isFinite(defenderCity?.x)) {
    if (attackerCity.x > defenderCity.x) {
      return { attackerSide: "right", defenderSide: "left" };
    }

    if (attackerCity.x < defenderCity.x) {
      return { attackerSide: "left", defenderSide: "right" };
    }
  }

  return { attackerSide: "left", defenderSide: "right" };
}

function getFacingForBattleSide(side) {
  return side === "left" ? "right" : "left";
}

function getSpawnSlot(side, index) {
  const slots = battleSideSpawnSlots[side] ?? battleSideSpawnSlots.left;
  return slots[index] ?? slots[slots.length - 1];
}

function buildBattleUnit(heroId, spawnPosition, facing) {
  const hero = heroes.find((entry) => entry.id === heroId);

  if (!hero || !spawnPosition || !facing) {
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
    buffAttackSourceSkillId: null,
    buffAttackSourceSkillName: null,
    buffDefenseBonus: 0,
    defenseBuffTurns: 0,
    statusEffects: {
      confusion: 0,
      shake: 0,
    },
    actionBlockReason: null,
    x: spawnPosition.x,
    y: spawnPosition.y,
    facing,
    isDefending: false,
    hasMoved: false,
    hasActed: false,
    isAlive: true,
  };
}

function getPlayerRoster(attackerCity, defenderCity, battleContext, attackerHeroIds = null) {
  if (battleContext?.type !== "defense" && Array.isArray(attackerHeroIds) && attackerHeroIds.length > 0) {
    return attackerHeroIds;
  }

  const rosterCity = battleContext?.type === "defense" ? defenderCity : attackerCity;
  return getHeroIdsBySideAndLocation(rosterCity?.id, "player");
}

function getEnemyRoster(attackerCity, defenderCity, battleContext) {
  const rosterCity = battleContext?.type === "defense" ? attackerCity : defenderCity;
  return getHeroIdsBySideAndLocation(rosterCity?.id, "enemy");
}

export function createInitialBattleState({
  attackerCity,
  defenderCity,
  autoBattleEnabled = false,
  battleContext = null,
  attackerHeroIds = null,
}) {
  battleSequence += 1;
  initializeHeroLocationsFromRosters();

  const resolvedBattleContext = battleContext ?? {
    type: "attack",
    controlMode: autoBattleEnabled ? "auto" : "manual",
    attackerCityId: attackerCity.id,
    defenderCityId: defenderCity.id,
  };

  const selectedAttackerHeroIds = Array.isArray(attackerHeroIds) && attackerHeroIds.length > 0
    ? attackerHeroIds
    : null;
  const attackerRosterUnitIds = getPlayerRoster(
    attackerCity,
    defenderCity,
    resolvedBattleContext,
    selectedAttackerHeroIds,
  );
  const defenderRosterUnitIds = getEnemyRoster(attackerCity, defenderCity, resolvedBattleContext);
  const { attackerSide, defenderSide } = getBattleSpawnSides(attackerCity, defenderCity);
  const units = [
    ...attackerRosterUnitIds.map((heroId, index) => buildBattleUnit(
      heroId,
      getSpawnSlot(attackerSide, index),
      getFacingForBattleSide(attackerSide),
    )),
    ...defenderRosterUnitIds.map((heroId, index) => buildBattleUnit(
      heroId,
      getSpawnSlot(defenderSide, index),
      getFacingForBattleSide(defenderSide),
    )),
  ].filter(Boolean);
  const openingLog = resolvedBattleContext.type === "defense"
    ? `${attackerCity.name}의 침공을 ${defenderCity.name}에서 맞아 방어전을 개시했습니다.`
    : `${attackerCity.name}에서 ${defenderCity.name} 공격을 개시했습니다.`;
  const grid = {
    width: BATTLE_GRID_WIDTH,
    height: BATTLE_GRID_HEIGHT,
  };

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
    grid,
    // Terrain is scaffold data only for now; movement, combat, AI, and rendering do not consume it yet.
    terrainMap: normalizeTerrainMap(null, grid.width, grid.height),
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
