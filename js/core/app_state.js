import { cities } from "../../data/cities.js";
import { factions } from "../../data/factions.js";
import { heroes } from "../../data/heroes.js";
import { skills } from "../../data/skills.js";
import { createInitialBattleState } from "./battle_state.js";
import {
  ENEMY_INVASION_CHANCE,
  canAttackCity,
  convertCityHeroesToFaction,
  getAttackSourceCity,
  getHeroIdsBySideAndLocation,
  initializeHeroLocationsFromRosters,
  occupyCity,
  recruitCityHeroesToFaction,
  rollEnemyInvasion,
} from "./world_rules.js";

const DEFAULT_SELECTED_CITY_ID = "hanseong";

export function createInitialAppState() {
  initializeHeroLocationsFromRosters();

  return {
    meta: {
      title: "SamWar Web",
      phase: "World Map 4-City MVP",
      status: "전투 없이 도시 선택과 진군 경로만 확인 가능한 첫 플레이 화면",
      playerFactionId: "player",
      turn: 1,
    },
    mode: "world",
    selection: {
      cityId: DEFAULT_SELECTED_CITY_ID,
      originCityId: DEFAULT_SELECTED_CITY_ID,
    },
    battle: null,
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    world: {
      cities,
      factions,
      heroes,
      skills,
      turnOwner: "player",
      pendingEnemyTurnResult: null,
      lastRecruitmentResult: null,
    },
  };
}

export function selectCity(appState, cityId) {
  const selectedCity = appState.world.cities.find((city) => city.id === cityId) ?? null;
  const originCityId = selectedCity?.ownerFactionId === appState.meta.playerFactionId
    ? cityId
    : appState.selection.originCityId;

  return {
    ...appState,
    selection: {
      ...appState.selection,
      cityId,
      originCityId,
    },
    pendingBattleChoice: appState.pendingBattleChoice?.type === "attack"
      ? null
      : appState.pendingBattleChoice,
    pendingHeroDeployment: null,
  };
}

function advanceWorldTurn(appState, overrides = {}) {
  return {
    ...appState,
    meta: {
      ...appState.meta,
      turn: appState.meta.turn + 1,
    },
    world: {
      ...appState.world,
      turnOwner: "player",
      pendingEnemyTurnResult: null,
    },
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    ...overrides,
  };
}

function getSkillName(skillId) {
  return skills.find((skill) => skill.id === skillId)?.name ?? null;
}

function getPlayerDeploymentCandidateIds(originCityId) {
  return getHeroIdsBySideAndLocation(originCityId, "player");
}

function buildHeroDeployment(appState, cityId) {
  const pendingBattleChoice = buildAttackBattleChoice(appState, cityId);

  if (!pendingBattleChoice) {
    return null;
  }

  const candidates = getPlayerDeploymentCandidateIds(pendingBattleChoice.originCityId)
    .map((heroId) => heroes.find((hero) => hero.id === heroId))
    .filter(Boolean)
    .map((hero) => ({
      id: hero.id,
      name: hero.name,
      role: hero.role,
      troops: hero.troops,
      maxTroops: hero.maxTroops,
      attack: hero.attack,
      defense: hero.defense,
      intelligence: hero.intelligence,
      portraitImage: hero.portraitImage ?? null,
      skillName: getSkillName(hero.skillId),
    }));

  return {
    type: "attack",
    originCityId: pendingBattleChoice.originCityId,
    originCityName: pendingBattleChoice.originCityName,
    targetCityId: pendingBattleChoice.targetCityId,
    targetCityName: pendingBattleChoice.targetCityName,
    battleContext: pendingBattleChoice.battleContext,
    autoBattleEnabled: false,
    candidates,
    selectedHeroIds: candidates.map((hero) => hero.id),
  };
}

function buildAttackBattleChoice(appState, cityId) {
  const defenderCity = appState.world.cities.find((city) => city.id === cityId);
  const selectedOriginCity = appState.world.cities.find((city) => (
    city.id === appState.selection.originCityId
    && city.ownerFactionId === appState.meta.playerFactionId
    && defenderCity?.neighbors.includes(city.id)
  )) ?? null;
  const attackerCity = selectedOriginCity ?? getAttackSourceCity(appState.world.cities, cityId);

  if (!defenderCity || !attackerCity || !canAttackCity(appState.world.cities, defenderCity)) {
    return null;
  }

  return {
    type: "attack",
    originCityId: attackerCity.id,
    originCityName: attackerCity.name,
    targetCityId: defenderCity.id,
    targetCityName: defenderCity.name,
    title: "전투 방식을 선택하세요",
    eyebrow: "Battle Mode",
    description: "공격 방식을 선택하세요.",
    confirmManualLabel: "직접 지휘",
    confirmAutoLabel: "자동 위임",
    showCancel: true,
    isRemoteBattle: attackerCity.id !== DEFAULT_SELECTED_CITY_ID,
    battleContext: {
      type: "attack",
      attackerCityId: attackerCity.id,
      defenderCityId: defenderCity.id,
    },
  };
}

function buildDefenseBattleChoice(appState, invasionCandidate) {
  const attackerCity = appState.world.cities.find((city) => city.id === invasionCandidate?.attackerCityId);
  const defenderCity = appState.world.cities.find((city) => city.id === invasionCandidate?.defenderCityId);

  if (!attackerCity || !defenderCity) {
    return null;
  }

  return {
    type: "defense",
    originCityId: attackerCity.id,
    originCityName: attackerCity.name,
    targetCityId: defenderCity.id,
    targetCityName: defenderCity.name,
    title: "적군이 침공했습니다!",
    eyebrow: "Enemy Invasion",
    description: "방어 방식을 선택하세요.",
    confirmManualLabel: "직접 방어",
    confirmAutoLabel: "자동 방어",
    showCancel: false,
    isRemoteBattle: false,
    battleContext: {
      type: "defense",
      attackerCityId: attackerCity.id,
      defenderCityId: defenderCity.id,
    },
  };
}

export function openBattleChoice(appState, cityId) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "player"
    || appState.world.pendingEnemyTurnResult
  ) {
    return appState;
  }

  const pendingBattleChoice = buildAttackBattleChoice(appState, cityId);

  if (!pendingBattleChoice) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice,
  };
}

export function openHeroDeployment(appState, cityId) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "player"
    || appState.world.pendingEnemyTurnResult
  ) {
    return appState;
  }

  const pendingHeroDeployment = buildHeroDeployment(appState, cityId);

  if (!pendingHeroDeployment) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice: null,
    pendingHeroDeployment,
  };
}

export function cancelBattleChoice(appState) {
  if (!appState.pendingBattleChoice || !appState.pendingBattleChoice.showCancel) {
    return appState;
  }

  return {
    ...appState,
    pendingBattleChoice: null,
  };
}

export function cancelHeroDeployment(appState) {
  if (!appState.pendingHeroDeployment) {
    return appState;
  }

  return {
    ...appState,
    pendingHeroDeployment: null,
  };
}

export function toggleDeploymentHero(appState, heroId) {
  const pendingHeroDeployment = appState.pendingHeroDeployment;

  if (!pendingHeroDeployment || !pendingHeroDeployment.candidates.some((hero) => hero.id === heroId)) {
    return appState;
  }

  const selectedHeroSet = new Set(pendingHeroDeployment.selectedHeroIds);

  if (selectedHeroSet.has(heroId)) {
    selectedHeroSet.delete(heroId);
  } else {
    selectedHeroSet.add(heroId);
  }

  return {
    ...appState,
    pendingHeroDeployment: {
      ...pendingHeroDeployment,
      selectedHeroIds: [...selectedHeroSet],
    },
  };
}

export function startBattle(appState, cityId, options = {}) {
  const pendingHeroDeployment = appState.pendingHeroDeployment?.targetCityId === cityId
    ? appState.pendingHeroDeployment
    : null;
  const pendingBattleChoice = pendingHeroDeployment
    ?? (appState.pendingBattleChoice?.targetCityId === cityId
      ? appState.pendingBattleChoice
      : buildAttackBattleChoice(appState, cityId));
  const defenderCity = appState.world.cities.find((city) => city.id === pendingBattleChoice?.targetCityId);
  const attackerCity = appState.world.cities.find((city) => city.id === pendingBattleChoice?.originCityId);

  if (!pendingBattleChoice || !defenderCity || !attackerCity) {
    return appState;
  }

  const battleContext = {
    ...pendingBattleChoice.battleContext,
    controlMode: (options.autoBattleEnabled ?? pendingHeroDeployment?.autoBattleEnabled) === true ? "auto" : "manual",
  };
  const selectedAttackerHeroIds = Array.isArray(options.attackerHeroIds)
    ? options.attackerHeroIds
    : pendingHeroDeployment?.selectedHeroIds;

  return {
    ...appState,
    mode: "battle",
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    selection: {
      ...appState.selection,
      cityId: defenderCity.id,
    },
    battle: createInitialBattleState({
      attackerCity,
      defenderCity,
      autoBattleEnabled: (options.autoBattleEnabled ?? pendingHeroDeployment?.autoBattleEnabled) === true,
      battleContext,
      attackerHeroIds: selectedAttackerHeroIds,
    }),
  };
}

export function updateBattleState(appState, battleState) {
  return {
    ...appState,
    battle: battleState,
  };
}

export function retreatFromBattle(appState) {
  const battleContext = appState.battle?.battleContext ?? null;

  if (battleContext?.type === "defense") {
    const updatedCities = occupyCity(
      appState.world.cities,
      battleContext.defenderCityId,
      "enemy",
    );
    convertCityHeroesToFaction(battleContext.defenderCityId, "enemy");

    return advanceWorldTurn(appState, {
      mode: "world",
      battle: null,
      selection: {
        ...appState.selection,
        cityId: battleContext.defenderCityId,
      },
      world: {
        ...appState.world,
        cities: updatedCities,
        turnOwner: "player",
        pendingEnemyTurnResult: null,
        lastRecruitmentResult: null,
      },
    });
  }

  return {
    ...appState,
    mode: "world",
    battle: null,
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    world: {
      ...appState.world,
      lastRecruitmentResult: null,
    },
  };
}

export function returnFromBattle(appState) {
  const { battle } = appState;

  if (!battle) {
    return retreatFromBattle(appState);
  }

  const battleContext = battle.battleContext ?? {
    type: "attack",
    attackerCityId: battle.attackerCityId,
    defenderCityId: battle.defenderCityId,
  };

  if (battleContext.type === "defense") {
    const defenseLost = battle.status !== "won";
    const updatedCities = defenseLost
      ? occupyCity(appState.world.cities, battle.defenderCityId, "enemy")
      : appState.world.cities;

    if (defenseLost) {
      convertCityHeroesToFaction(battle.defenderCityId, "enemy");
    }

    return advanceWorldTurn(appState, {
      mode: "world",
      battle: null,
      selection: {
        ...appState.selection,
        cityId: battle.defenderCityId,
        originCityId: battle.defenderCityId,
      },
      world: {
        ...appState.world,
        cities: updatedCities,
        turnOwner: "player",
        pendingEnemyTurnResult: null,
        lastRecruitmentResult: null,
      },
    });
  }

  if (battle.status === "won") {
    const updatedCities = occupyCity(
      appState.world.cities,
      battle.defenderCityId,
      appState.meta.playerFactionId,
    );
    const recruitedHeroes = recruitCityHeroesToFaction(
      battle.defenderCityId,
      appState.meta.playerFactionId,
    );

    return {
      ...appState,
      mode: "world",
      battle: null,
      pendingBattleChoice: null,
      pendingHeroDeployment: null,
      selection: {
        ...appState.selection,
        cityId: battle.defenderCityId,
      },
      world: {
        ...appState.world,
        cities: updatedCities,
        lastRecruitmentResult: {
          cityId: battle.defenderCityId,
          factionId: appState.meta.playerFactionId,
          heroes: recruitedHeroes,
        },
      },
    };
  }

  return {
    ...appState,
    mode: "world",
    battle: null,
    pendingBattleChoice: null,
    pendingHeroDeployment: null,
    world: {
      ...appState.world,
      lastRecruitmentResult: null,
    },
  };
}

export function endWorldTurn(appState) {
  if (
    appState.mode !== "world"
    || appState.world.turnOwner !== "player"
    || appState.pendingBattleChoice
    || appState.pendingHeroDeployment
    || appState.world.pendingEnemyTurnResult
  ) {
    return appState;
  }

  const invasionCandidate = rollEnemyInvasion(appState.world.cities, ENEMY_INVASION_CHANCE);

  if (invasionCandidate) {
    return {
      ...appState,
      selection: {
        ...appState.selection,
        cityId: invasionCandidate.defenderCityId,
      },
      pendingBattleChoice: buildDefenseBattleChoice(appState, invasionCandidate),
      world: {
        ...appState.world,
        turnOwner: "enemy",
        pendingEnemyTurnResult: null,
      },
    };
  }

  return {
    ...appState,
    world: {
      ...appState.world,
      turnOwner: "enemy",
      pendingEnemyTurnResult: {
        type: "no_invasion",
        message: "적군은 이번 턴 움직이지 않았습니다.",
      },
    },
  };
}

export function confirmEnemyTurnResult(appState) {
  if (!appState.world.pendingEnemyTurnResult) {
    return appState;
  }

  return advanceWorldTurn(appState);
}
