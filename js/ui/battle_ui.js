import { getDirectionLabel } from "../core/battle_direction.js";
import {
  canUseSkill,
  getEffectiveAttack,
  getEffectiveDefense,
  getSkillById,
} from "../core/battle_skills.js";
import { canUseStrategy, hasStatus } from "../core/battle_strategy.js";
import { getEnemyUnits, getPlayerUnits, getSelectedUnit } from "../core/battle_rules.js";
import { mountBattleScene } from "../phaser/phaser_battle_mount.js";

function getBattleStatusCopy(battleState) {
  if (battleState.tempoLockActive && battleState.turnOwner === "enemy") {
    return "적군 행동을 전개 중입니다.";
  }

  if (battleState.tempoLockActive) {
    return "전황을 처리 중입니다.";
  }

  if (battleState.status === "won") {
    return "승리! 적 도시를 점령했습니다.";
  }

  if (battleState.status === "lost") {
    return "패배했습니다. 월드맵으로 복귀합니다.";
  }

  if (battleState.turnOwner === "enemy") {
    return "적군 행동 중입니다.";
  }

  if (battleState.autoBattleEnabled) {
    return "자동전투가 아군 행동을 진행 중입니다.";
  }

  if (battleState.phase === "facing") {
    return "이동을 마쳤습니다. 유닛의 방향을 정하세요. 우클릭하면 이동을 취소합니다.";
  }

  if (battleState.phase === "skill") {
    return "고유 특기 범위 안의 부대를 선택하세요. 우클릭하면 취소합니다.";
  }

  if (battleState.phase === "attack") {
    return "공격할 적을 선택하세요. 우클릭하면 취소합니다.";
  }

  if (battleState.phase === "strategy") {
    return "책략 대상이 되는 적을 선택하세요. 우클릭하면 취소합니다.";
  }

  return "아군 유닛 선택 → 이동 → 방향 결정 → 공격 / 특기 / 책략 / 방어 / 대기 순서로 전투를 진행합니다.";
}

function formatStatusList(unit) {
  const statuses = [];

  if (hasStatus(unit, "confusion")) {
    statuses.push(`혼란 ${unit.statusEffects.confusion}`);
  }

  if (hasStatus(unit, "shake")) {
    statuses.push(`동요 ${unit.statusEffects.shake}`);
  }

  if (unit?.isDefending) {
    statuses.push("방어 태세");
  }

  return statuses.length > 0 ? statuses.join(" · ") : "상태 이상 없음";
}
function renderBattleLog(logEntries) {
  return logEntries
    .slice()
    .reverse()
    .map((entry) => `<li class="battle-log-item">${entry}</li>`)
    .join("");
}

function renderUnitCard(unit, sideLabel, { isSelected = false, selectable = false } = {}) {
  const statusParts = [];

  if (unit.buffTurns > 0 && unit.buffAttackBonus > 0) {
    statusParts.push(`개혁령 효과 +${Math.round(unit.buffAttackBonus * 100)}% · ${unit.buffTurns}턴`);
  }

  const statusText = formatStatusList(unit);

  if (statusText !== "상태 이상 없음") {
    statusParts.push(statusText);
  }

  if (statusParts.length === 0) {
    statusParts.push("상태 이상 없음");
  }

  const selectionAttributes = selectable
    ? ` data-battle-roster-unit-id="${unit.id}" role="button" tabindex="0" aria-label="${unit.name} 선택"`
    : "";

  return `
    <div class="battle-unit-card battle-unit-card-${unit.side} ${isSelected ? "is-selected" : ""}"${selectionAttributes}>
      <div class="battle-unit-side-row">
        <span class="battle-unit-side">${sideLabel}</span>
        ${isSelected ? '<span class="battle-unit-selected-chip">선택 중</span>' : ""}
      </div>
      <strong class="battle-unit-name">${unit.name}</strong>
      <span class="battle-unit-hp">병력 ${unit.troops} / ${unit.maxTroops} · 전열 ${unit.hp} / ${unit.maxHp}</span>
      <span class="battle-unit-hp">공 ${Math.round(getEffectiveAttack(unit))} · 방 ${Math.round(getEffectiveDefense(unit))} · 지력 ${unit.intelligence}</span>
      <span class="battle-unit-cooldown">방향 ${getDirectionLabel(unit.facing)}</span>
      <span class="battle-unit-buff">${statusParts.join(" · ")}</span>
    </div>
  `;
}

function renderBattleShell(battleState) {
  return `
    <main class="battle-screen" data-battle-id="${battleState.id}">
      <header class="battle-topbar battle-panel" data-battle-topbar></header>
      <section class="battle-main-layout" aria-labelledby="battle-title">
        <aside class="battle-left-panel" data-battle-left-panel></aside>
        <section class="battle-center-panel">
          <div class="battle-stage-panel battle-panel">
            <div class="battle-phaser-shell">
              <div class="battle-phaser-host-wrap">
                <div class="battle-phaser-host" data-battle-mount></div>
                <div class="battle-board-overlay-layer" data-battle-overlay-layer></div>
              </div>
            </div>
          </div>
        </section>
        <aside class="battle-right-panel" data-battle-right-panel></aside>
      </section>
      <footer class="battle-command-bar battle-panel" data-battle-command-bar></footer>
    </main>
  `;
}

function renderSkillCutinOverlay(activeSkillCutin) {
  if (!activeSkillCutin) {
    return "";
  }

  return `
    <div class="skill-cutin-overlay skill-cutin-overlay--${activeSkillCutin.style}" aria-hidden="true">
      <img class="skill-cutin-image" src="${activeSkillCutin.image}" alt="" />
    </div>
  `;
}

function renderBattleTopbar(battleState) {
  return `
    <div class="battle-topbar-copy">
      <p class="eyebrow">Persistent Phaser Mount</p>
      <h1 id="battle-title" class="battle-screen-title">전투 테스트</h1>
      <p class="battle-screen-copy">
        ${battleState.attackerCityName} 군이 ${battleState.defenderCityName} 공략을 시도하고 있습니다.
      </p>
    </div>
    <div class="battle-topbar-meta">
      <div class="battle-city-chip">${battleState.defenderCityName}</div>
      <div class="battle-turn-banner">
        ${battleState.turnOwner === "player" ? "아군 턴" : "적군 턴"}
        <span class="battle-turn-subcopy">
          ${battleState.turnOwner === "player" ? "전술 명령 가능" : "적군 행동 중"}
        </span>
      </div>
    </div>
  `;
}

function renderBattleStatusPanel(battleState) {
  return `
    <section class="battle-panel battle-status-panel">
      <p class="eyebrow">Status</p>
      <h2 class="detail-heading">전황 보고</h2>
      <p class="battle-status-copy">${getBattleStatusCopy(battleState)}</p>
      <div class="battle-status-note">
        ${battleState.turnOwner === "player" ? "유닛 선택 · 이동 · 방향 · 공격 · 특기 · 책략 · 방어 · 대기" : "적군 행동 중입니다."}
      </div>
    </section>
  `;
}

function renderBattleLeftPanel(battleState) {
  return `
    ${renderBattleStatusPanel(battleState)}
    <section class="battle-panel battle-log-panel">
      <p class="eyebrow">Battle Log</p>
      <h2 class="detail-heading">전투 기록</h2>
      <ol class="battle-log-list">
        ${renderBattleLog(battleState.log)}
      </ol>
    </section>
  `;
}

function renderBattleRightPanel(battleState, playerUnits, enemyUnits, options = {}) {
  const { selectablePlayerRoster = false } = options;

  return `
    <section class="battle-panel battle-unit-info-panel">
      <p class="eyebrow">Unit</p>
      <h2 class="detail-heading">부대 목록</h2>
      <div class="battle-unit-stats">
        ${playerUnits.map((unit) => renderUnitCard(unit, "아군", {
          isSelected: unit.id === battleState.selectedUnitId,
          selectable: selectablePlayerRoster,
        })).join("")}
        ${enemyUnits.map((unit) => renderUnitCard(unit, "적군", {
          isSelected: unit.id === battleState.selectedUnitId,
        })).join("")}
      </div>
    </section>
  `;
}

function renderBattleCommandBar(battleState, selectedUnit, options) {
  const {
    isActive,
    canUseSelectedSkill,
    canUsePostureCommand,
    manualControlsLocked,
    canUseSelectedStrategy,
    skillButtonLabel,
  } = options;

  return `
    <div class="battle-command-actions">
      <button class="battle-action-button" type="button" data-battle-action="basic-attack" ${isActive && selectedUnit && !manualControlsLocked ? "" : "disabled"}>
        기본 공격
      </button>
      <button
        class="battle-action-button battle-action-button-skill ${battleState.phase === "skill" ? "is-active" : ""}"
        type="button"
        data-battle-action="skill"
        ${isActive && canUseSelectedSkill && !manualControlsLocked ? "" : "disabled"}
      >
        ${skillButtonLabel}
      </button>
      <button
        class="battle-action-button ${battleState.phase === "strategy" ? "battle-action-button-skill is-active" : ""}"
        type="button"
        data-battle-action="strategy"
        ${isActive && canUseSelectedStrategy && !manualControlsLocked ? "" : "disabled"}
      >
        책략
      </button>
      <button class="battle-action-button" type="button" data-battle-action="defend" ${canUsePostureCommand && !manualControlsLocked ? "" : "disabled"}>
        방어
      </button>
      <button class="battle-action-button" type="button" data-battle-action="wait" ${canUsePostureCommand && !manualControlsLocked ? "" : "disabled"}>
        대기
      </button>
      <button class="battle-action-button" type="button" data-battle-action="end-turn" ${isActive && !manualControlsLocked ? "" : "disabled"}>
        턴 종료
      </button>
      <button class="battle-action-button battle-action-button-auto ${battleState.autoBattleEnabled ? "is-active" : ""}" type="button" data-battle-action="auto" ${isActive && !manualControlsLocked ? "" : "disabled"}>
        ${battleState.autoBattleEnabled ? "자동전투 중지" : "자동전투"}
      </button>
      <button class="battle-action-button battle-action-button-muted" type="button" data-battle-action="retreat" ${isActive && !manualControlsLocked ? "" : "disabled"}>
        후퇴
      </button>
      ${
        !isActive
          ? `
            <button class="battle-action-button battle-action-button-return" type="button" data-battle-action="return">
              월드맵으로 복귀
            </button>
          `
          : ""
      }
    </div>
  `;
}

export function renderBattleUI(rootElement, appState, handlers = {}) {
  const battleState = appState.battle;

  if (!battleState) {
    rootElement.innerHTML = `
      <main class="battle-screen">
        <section class="battle-shell">
          <div class="battle-panel battle-empty-state">
            <h1 class="battle-screen-title">전투 정보를 찾을 수 없습니다.</h1>
          </div>
        </section>
      </main>
    `;
    return;
  }

  const playerUnits = getPlayerUnits(battleState);
  const enemyUnits = getEnemyUnits(battleState);
  const selectedUnit = getSelectedUnit(battleState);
  const selectedSkill = selectedUnit ? getSkillById(battleState.skills, selectedUnit.skillId) : null;
  const isActive = battleState.status === "active";
  const isFacingPhase = battleState.phase === "facing";
  const canUseSelectedSkill = Boolean(
    selectedUnit
    && selectedSkill
    && canUseSkill(selectedUnit, selectedSkill)
    && !isFacingPhase
    && battleState.phase !== "strategy"
  );
  const canUsePostureCommand = Boolean(
    isActive
    && battleState.turnOwner === "player"
    && selectedUnit
    && !selectedUnit.hasActed
    && !isFacingPhase
  );
  const manualControlsLocked = Boolean(isActive && (battleState.autoBattleEnabled || battleState.tempoLockActive));
  const canUseSelectedStrategy = Boolean(
    selectedUnit
    && canUseStrategy(selectedUnit)
    && !isFacingPhase
    && battleState.phase !== "skill"
  );
  const selectablePlayerRoster = Boolean(
    isActive
    && battleState.turnOwner === "player"
    && !manualControlsLocked
  );
  const skillButtonLabel = selectedSkill?.name ?? "고유 특기";
  const existingScreen = rootElement.querySelector(".battle-screen");
  const currentBattleId = existingScreen?.getAttribute("data-battle-id");

  if (currentBattleId !== battleState.id) {
    rootElement.innerHTML = renderBattleShell(battleState);
  }

  const battleScreen = rootElement.querySelector('.battle-screen[data-battle-id]');
  const topbarElement = rootElement.querySelector("[data-battle-topbar]");
  const leftPanelElement = rootElement.querySelector("[data-battle-left-panel]");
  const rightPanelElement = rootElement.querySelector("[data-battle-right-panel]");
  const commandBarElement = rootElement.querySelector("[data-battle-command-bar]");
  const overlayLayerElement = rootElement.querySelector("[data-battle-overlay-layer]");
  const mountElement = rootElement.querySelector("[data-battle-mount]");

  if (battleScreen) {
    battleScreen.setAttribute("data-battle-id", battleState.id);
  }

  if (topbarElement) {
    topbarElement.innerHTML = renderBattleTopbar(battleState);
  }

  if (leftPanelElement) {
    leftPanelElement.innerHTML = renderBattleLeftPanel(battleState);
  }

  if (rightPanelElement) {
    rightPanelElement.innerHTML = renderBattleRightPanel(battleState, playerUnits, enemyUnits, {
      selectablePlayerRoster,
    });
  }

  if (commandBarElement) {
    commandBarElement.innerHTML = renderBattleCommandBar(
      battleState,
      selectedUnit,
      {
        isActive,
        isFacingPhase,
        canUseSelectedSkill,
        canUsePostureCommand,
        manualControlsLocked,
        canUseSelectedStrategy,
        skillButtonLabel,
      },
    );
  }

  if (overlayLayerElement) {
    overlayLayerElement.innerHTML = renderSkillCutinOverlay(battleState.activeSkillCutin);
  }

  if (mountElement) {
    mountBattleScene(mountElement, battleState, {
      onSelectUnit: handlers.onBattleSelectUnit,
      onMoveUnit: handlers.onBattleMoveUnit,
      onSetFacing: handlers.onBattleSetFacing,
      onCancelPendingMove: handlers.onBattleCancelPendingMove,
      onCancelActionMode: handlers.onBattleCancelActionMode,
      onAttackUnit: handlers.onBattleAttackUnit,
      onUseSkill: handlers.onBattleUseSkill,
      onEnterStrategyMode: handlers.onBattleEnterStrategyMode,
      onUseStrategy: handlers.onBattleUseStrategy,
      onEndTurn: handlers.onBattleEndTurn,
      onDefend: handlers.onBattleDefend,
      onWait: handlers.onBattleWait,
      onRetreat: handlers.onBattleRetreat,
    });
  }

  rootElement.querySelector('[data-battle-action="basic-attack"]')?.addEventListener("click", () => {
    handlers.onBattleEnterAttackMode?.();
  });

  rootElement.querySelector('[data-battle-action="skill"]')?.addEventListener("click", () => {
    handlers.onBattleEnterSkillMode?.();
  });

  rootElement.querySelector('[data-battle-action="strategy"]')?.addEventListener("click", () => {
    handlers.onBattleEnterStrategyMode?.();
  });

  rootElement.querySelector('[data-battle-action="defend"]')?.addEventListener("click", () => {
    handlers.onBattleDefend?.();
  });

  rootElement.querySelector('[data-battle-action="wait"]')?.addEventListener("click", () => {
    handlers.onBattleWait?.();
  });

  rootElement.querySelector('[data-battle-action="end-turn"]')?.addEventListener("click", () => {
    handlers.onBattleEndTurn?.();
  });

  rootElement.querySelector('[data-battle-action="auto"]')?.addEventListener("click", () => {
    handlers.onBattleToggleAutoBattle?.();
  });

  rootElement.querySelector('[data-battle-action="retreat"]')?.addEventListener("click", () => {
    handlers.onBattleRetreat?.();
  });

  rootElement.querySelector('[data-battle-action="return"]')?.addEventListener("click", () => {
    handlers.onBattleReturnToWorld?.();
  });

  rootElement.querySelectorAll("[data-battle-facing]").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onBattleSetFacing?.(button.getAttribute("data-battle-facing"));
    });
  });

  rootElement.querySelectorAll("[data-battle-roster-unit-id]").forEach((card) => {
    const selectRosterUnit = () => {
      handlers.onBattleSelectUnit?.(card.getAttribute("data-battle-roster-unit-id"));
    };

    card.addEventListener("click", selectRosterUnit);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      selectRosterUnit();
    });
  });
}
