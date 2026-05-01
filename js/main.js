import {
  createInitialAppState,
  retreatFromBattle,
  returnFromBattle,
  selectCity,
  startBattle,
  updateBattleState,
} from "./core/app_state.js";
import {
  attackUnit,
  defendSelectedUnit,
  endPlayerTurn,
  enterSkillMode,
  enterStrategyMode,
  getPlayerUnits,
  moveSelectedUnit,
  runEnemyTurn,
  selectBattleUnit,
  setSelectedUnitFacing,
  useSelectedUnitSkill,
  useSelectedUnitStrategy,
  waitSelectedUnit,
} from "./core/battle_rules.js";
import { renderLayout } from "./ui/layout_ui.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

let appState = createInitialAppState();

function maybeRunAutoEnemyTurn(battleState) {
  if (!battleState || battleState.status !== "active") {
    return battleState;
  }

  const playerUnits = getPlayerUnits(battleState);
  const allPlayerUnitsActed = playerUnits.length > 0 && playerUnits.every((unit) => unit.hasActed);

  if (!allPlayerUnitsActed) {
    return battleState;
  }

  return runEnemyTurn(endPlayerTurn(battleState));
}

function resolveAfterPlayerAction(battleState) {
  if (!battleState || battleState.status !== "active") {
    return battleState;
  }

  return maybeRunAutoEnemyTurn(battleState);
}

function rerender() {
  renderLayout(appRoot, appState, {
    onCitySelect: (cityId) => {
      appState = selectCity(appState, cityId);
      rerender();
    },
    onAttackCity: (cityId) => {
      appState = startBattle(appState, cityId);
      rerender();
    },
    onBattleSelectUnit: (unitId) => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      appState = updateBattleState(appState, selectBattleUnit(appState.battle, unitId));
      rerender();
    },
    onBattleMoveUnit: (position) => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      appState = updateBattleState(appState, moveSelectedUnit(appState.battle, position));
      rerender();
    },
    onBattleAttackUnit: (targetUnitId) => {
      if (!appState.battle || appState.battle.status !== "active" || !appState.battle.selectedUnitId) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(
        attackUnit(appState.battle, appState.battle.selectedUnitId, targetUnitId),
      );
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleSetFacing: (direction) => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      appState = updateBattleState(appState, setSelectedUnitFacing(appState.battle, direction));
      rerender();
    },
    onBattleUseSkill: (targetUnitId) => {
      if (!appState.battle || appState.battle.status !== "active" || !appState.battle.selectedUnitId) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(
        useSelectedUnitSkill(appState.battle, targetUnitId),
      );
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleEnterStrategyMode: () => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      appState = updateBattleState(appState, enterStrategyMode(appState.battle));
      rerender();
    },
    onBattleUseStrategy: (targetUnitId) => {
      if (!appState.battle || appState.battle.status !== "active" || !appState.battle.selectedUnitId) {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(
        useSelectedUnitStrategy(appState.battle, targetUnitId),
      );
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleDefend: () => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(defendSelectedUnit(appState.battle));
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleWait: () => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      const nextBattleState = resolveAfterPlayerAction(waitSelectedUnit(appState.battle));
      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleEnterSkillMode: () => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      const selectedUnit = appState.battle.units.find((unit) => unit.id === appState.battle.selectedUnitId) ?? null;
      const selectedSkill = selectedUnit
        ? appState.battle.skills.find((skill) => skill.id === selectedUnit.skillId) ?? null
        : null;

      if (!selectedSkill || !selectedUnit) {
        return;
      }

      let nextBattleState = appState.battle;

      if (
        selectedSkill.effectType === "ally_attack_buff" ||
        selectedSkill.effectType === "cannon_aoe" ||
        selectedSkill.target === "enemy_all_in_range"
      ) {
        nextBattleState = resolveAfterPlayerAction(useSelectedUnitSkill(appState.battle));
      } else {
        nextBattleState = enterSkillMode(appState.battle);
      }

      appState = updateBattleState(appState, nextBattleState);
      rerender();
    },
    onBattleEndTurn: () => {
      if (!appState.battle || appState.battle.status !== "active") {
        return;
      }

      appState = updateBattleState(appState, runEnemyTurn(endPlayerTurn(appState.battle)));
      rerender();
    },
    onBattleRetreat: () => {
      appState = retreatFromBattle(appState);
      rerender();
    },
    onBattleReturnToWorld: () => {
      appState = returnFromBattle(appState);
      rerender();
    },
  });
}

rerender();
