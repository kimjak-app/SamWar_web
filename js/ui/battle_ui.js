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
import { USE_DOM_BATTLE_TEXT_OVERLAY, USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY } from "../phaser/battle_scene.js";

const PHASER_BATTLE_WIDTH = 1200;
const PHASER_BATTLE_HEIGHT = 720;
const BATTLE_BOARD = Object.freeze({
  x: 92,
  y: 118,
  width: PHASER_BATTLE_WIDTH - 184,
  height: PHASER_BATTLE_HEIGHT - 210,
});
const BATTLE_STATUS_ICON_LEGEND_TEXT = "상태: 🌀 혼란 · ⚠ 동요 · ◆ 방어 · ▲ 공↑ · ▼ 공↓ · ✖ 기절 · 🔥 화상 · ☠ 중독 · ! 도발 · ⛓ 속박";
const PLAYER_BATTLE_TOKEN_IMAGE = "assets/unit_tokens_battlefield/unit_blue_battlefield.png";
const ENEMY_BATTLE_TOKEN_IMAGE = "assets/unit_tokens_battlefield/unit_red_battlefield.png";
let battleDomOverlayResizeHandler = null;
let activeDomMoveTweenSignature = null;
let activeDomMoveTweenUntil = 0;

const BATTLE_RESULT_OVERLAY_TEXT = {
  won: {
    text: "승리",
    tone: "victory",
  },
  lost: {
    text: "패배",
    tone: "defeat",
  },
};

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

  if ((unit?.buffDefenseBonus ?? 0) > 0 && (unit?.defenseBuffTurns ?? 0) > 0) {
    statuses.push(`방어 보정 +${Math.round(unit.buffDefenseBonus * 100)}% ${unit.defenseBuffTurns}턴`);
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

function renderUnitPortrait(unit, { large = false } = {}) {
  const portraitClass = large ? "battle-selected-portrait" : "battle-unit-portrait";
  const fallbackClass = large
    ? "battle-unit-portrait-fallback battle-selected-portrait battle-selected-portrait-fallback"
    : "battle-unit-portrait-fallback battle-unit-portrait";

  if (unit?.portraitImage) {
    return `<img class="${portraitClass}" src="${unit.portraitImage}" alt="${unit.name} 초상화" loading="lazy" />`;
  }

  return `<div class="${fallbackClass}" aria-hidden="true">?</div>`;
}

function getDisplayTroops(unit) {
  const initialAllocatedTroops = Math.max(0, Number(unit?.initialAllocatedTroops ?? unit?.allocatedTroops) || 0);

  if (initialAllocatedTroops <= 0) {
    return {
      current: Math.max(0, Number(unit?.troops) || 0),
      max: Math.max(0, Number(unit?.maxTroops) || 0),
    };
  }

  const maxHp = Math.max(1, Number(unit?.maxHp) || 1);
  const hpRatio = Math.max(0, Math.min(1, (Number(unit?.hp) || 0) / maxHp));

  return {
    current: Math.floor(initialAllocatedTroops * hpRatio),
    max: initialAllocatedTroops,
  };
}

function getUnitOverlayPoint(unit) {
  const cellWidth = BATTLE_BOARD.width / Math.max(1, Number(unit?.gridWidth) || 14);
  const cellHeight = BATTLE_BOARD.height / Math.max(1, Number(unit?.gridHeight) || 8);

  return {
    x: BATTLE_BOARD.x + cellWidth * unit.x + cellWidth / 2,
    y: BATTLE_BOARD.y + cellHeight * unit.y + cellHeight / 2,
  };
}

function getLogicalOverlayPoint(canvasElement, overlayElement, x, y) {
  if (!overlayElement) {
    return {
      x: (x / PHASER_BATTLE_WIDTH) * 100,
      y: (y / PHASER_BATTLE_HEIGHT) * 100,
    };
  }

  if (!canvasElement) {
    return {
      x: (x / PHASER_BATTLE_WIDTH) * overlayElement.clientWidth,
      y: (y / PHASER_BATTLE_HEIGHT) * overlayElement.clientHeight,
    };
  }

  const canvasRect = canvasElement.getBoundingClientRect();
  const overlayRect = overlayElement.getBoundingClientRect();
  const scaleX = canvasRect.width / PHASER_BATTLE_WIDTH;
  const scaleY = canvasRect.height / PHASER_BATTLE_HEIGHT;

  return {
    x: canvasRect.left - overlayRect.left + x * scaleX,
    y: canvasRect.top - overlayRect.top + y * scaleY,
  };
}

function getLogicalOverlayStyle(canvasElement, overlayElement, x, y) {
  const point = getLogicalOverlayPoint(canvasElement, overlayElement, x, y);
  return `left:${point.x}px;top:${point.y}px;`;
}

function getDomOverlayHelpCopy(battleState, selectedUnit, selectedSkill) {
  if (!selectedUnit) {
    return "이동 · 공격 · 특기 · 책략 · 방어 · 대기";
  }

  if (battleState.phase === "facing") {
    return "이동 후 방향 선택";
  }

  if (battleState.phase === "skill") {
    return `${selectedSkill?.name ?? "고유 특기"}: ${selectedSkill?.description ?? "범위 안의 대상을 선택하세요."}`;
  }

  if (battleState.phase === "strategy") {
    return "책략 대상 적 유닛 선택";
  }

  if (selectedSkill && selectedUnit.currentSkillCooldown > 0) {
    return `${selectedSkill.name}: 재사용 대기 ${selectedUnit.currentSkillCooldown}턴`;
  }

  if (selectedSkill) {
    return `${selectedSkill.name}: ${selectedSkill.description}`;
  }

  return formatStatusList(selectedUnit);
}

function getBattleUnitTokenImage(unit) {
  return unit?.side === "player" ? PLAYER_BATTLE_TOKEN_IMAGE : ENEMY_BATTLE_TOKEN_IMAGE;
}

function getBattleUnitPortraitImage(unit) {
  return unit?.battlefieldPortraitImage ?? unit?.portraitImage ?? null;
}

function getDomMovePresentation(battleState, unit) {
  const pendingMove = battleState?.pendingMove;

  if (
    battleState?.lastAction?.type === "move"
    && pendingMove
    && pendingMove.unitId === unit.id
    && Number.isFinite(pendingMove.fromX)
    && Number.isFinite(pendingMove.fromY)
  ) {
    return {
      unitId: unit.id,
      fromX: pendingMove.fromX,
      fromY: pendingMove.fromY,
      toX: unit.x,
      toY: unit.y,
      source: "pendingMove",
    };
  }

  const presentationMove = battleState?.lastAction?.presentationMove;

  if (
    battleState?.lastAction?.type === "move"
    && presentationMove
    && presentationMove.unitId === unit.id
    && Number.isFinite(presentationMove.fromX)
    && Number.isFinite(presentationMove.fromY)
    && Number.isFinite(presentationMove.toX)
    && Number.isFinite(presentationMove.toY)
  ) {
    return {
      ...presentationMove,
      source: "presentationMove",
    };
  }

  return null;
}

function getDomMoveTweenSignature(battleState, unit) {
  const presentation = getDomMovePresentation(battleState, unit);

  if (!presentation) {
    return null;
  }

  return `${battleState.id}:${unit.id}:${presentation.fromX},${presentation.fromY}->${presentation.toX},${presentation.toY}`;
}

function getDomMoveTweenInfo(unit, battleState, canvasElement, overlayElement, pointOffsetY = 0) {
  const presentation = getDomMovePresentation(battleState, unit);
  const signature = getDomMoveTweenSignature(battleState, unit);

  if (
    !presentation
    || !signature
  ) {
    return null;
  }

  const targetLogicalPoint = getUnitOverlayPoint({
    ...unit,
    gridWidth: battleState.grid?.width,
    gridHeight: battleState.grid?.height,
  });
  const fromLogicalPoint = getUnitOverlayPoint({
    ...unit,
    x: presentation.fromX,
    y: presentation.fromY,
    gridWidth: battleState.grid?.width,
    gridHeight: battleState.grid?.height,
  });
  const targetDomPoint = getLogicalOverlayPoint(
    canvasElement,
    overlayElement,
    targetLogicalPoint.x,
    targetLogicalPoint.y + pointOffsetY,
  );
  const fromDomPoint = getLogicalOverlayPoint(
    canvasElement,
    overlayElement,
    fromLogicalPoint.x,
    fromLogicalPoint.y + pointOffsetY,
  );

  return {
    signature,
    dx: fromDomPoint.x - targetDomPoint.x,
    dy: fromDomPoint.y - targetDomPoint.y,
  };
}

function getBattleUnitVisualFacingClass(unit) {
  if (unit?.facing === "right") {
    return "battle-dom-unit-visual--facing-right";
  }

  if (unit?.facing === "left") {
    return "battle-dom-unit-visual--facing-left";
  }

  return unit?.side === "enemy"
    ? "battle-dom-unit-visual--facing-right"
    : "battle-dom-unit-visual--facing-left";
}

function renderBattleDomUnitVisualOverlay(logicalStyle, battleState, canvasElement, overlayElement) {
  if (!USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY || !battleState) {
    return "";
  }

  return (battleState.units ?? [])
    .filter((unit) => unit.isAlive !== false)
    .map((unit) => {
      const point = getUnitOverlayPoint({
        ...unit,
        gridWidth: battleState.grid?.width,
        gridHeight: battleState.grid?.height,
      });
      const tokenStyle = logicalStyle(point.x, point.y + 28);
      const portraitPath = getBattleUnitPortraitImage(unit);
      const facingClass = getBattleUnitVisualFacingClass(unit);
      const selectedClass = unit.id === battleState.selectedUnitId
        ? " battle-dom-unit-visual--selected"
        : "";
      const moveTweenInfo = getDomMoveTweenInfo(unit, battleState, canvasElement, overlayElement, 28);
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      let moveTweenClass = "";
      let moveTweenStyle = "";

      if (moveTweenInfo) {
        const isNewMoveTween = moveTweenInfo.signature !== activeDomMoveTweenSignature;

        if (isNewMoveTween) {
          activeDomMoveTweenSignature = moveTweenInfo.signature;
          activeDomMoveTweenUntil = now + 280;
        }

        if (moveTweenInfo.signature === activeDomMoveTweenSignature && now < activeDomMoveTweenUntil) {
          moveTweenClass = " battle-dom-unit-visual--move-tween";
          moveTweenStyle = `--battle-dom-move-dx:${moveTweenInfo.dx}px;--battle-dom-move-dy:${moveTweenInfo.dy}px;`;
        }
      }

      return `
        <div
          class="battle-dom-unit-visual battle-dom-unit-visual--${unit.side} ${facingClass}${selectedClass}${moveTweenClass}"
          style="${tokenStyle}${moveTweenStyle}"
          data-battle-dom-unit-visual-id="${unit.id}"
        >
          <img
            class="battle-dom-unit-image"
            src="${getBattleUnitTokenImage(unit)}"
            alt=""
            loading="lazy"
            decoding="async"
          />
          ${
            portraitPath
              ? `
                <div class="battle-dom-unit-portrait-badge">
                  <img
                    class="battle-dom-unit-portrait-image"
                    src="${portraitPath}"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              `
              : `
                <div class="battle-dom-unit-portrait-badge battle-dom-unit-portrait-badge--fallback" aria-hidden="true">?</div>
              `
          }
        </div>
      `;
    })
    .join("");
}

function renderBattleDomOverlay(overlayElement, mountElement, battleState, selectedUnit, selectedSkill) {
  if ((!USE_DOM_BATTLE_TEXT_OVERLAY && !USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY) || !overlayElement || !battleState) {
    if (overlayElement) {
      overlayElement.innerHTML = "";
    }
    return;
  }

  const canvasElement = mountElement?.querySelector("canvas") ?? null;
  const logicalStyle = (x, y) => getLogicalOverlayStyle(canvasElement, overlayElement, x, y);
  const liveUnits = (battleState.units ?? []).filter((unit) => unit.isAlive !== false);
  const unitVisuals = renderBattleDomUnitVisualOverlay(logicalStyle, battleState, canvasElement, overlayElement);
  const unitLabels = USE_DOM_BATTLE_TEXT_OVERLAY
    ? liveUnits.map((unit) => {
      const point = getUnitOverlayPoint({
        ...unit,
        gridWidth: battleState.grid?.width,
        gridHeight: battleState.grid?.height,
      });
      const displayTroops = getDisplayTroops(unit);
      const moveTweenInfo = getDomMoveTweenInfo(unit, battleState, canvasElement, overlayElement, 54);
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      let moveTweenClass = "";
      let moveTweenStyle = "";

      if (moveTweenInfo) {
        const isNewMoveTween = moveTweenInfo.signature !== activeDomMoveTweenSignature;

        if (isNewMoveTween) {
          activeDomMoveTweenSignature = moveTweenInfo.signature;
          activeDomMoveTweenUntil = now + 280;
        }

        if (moveTweenInfo.signature === activeDomMoveTweenSignature && now < activeDomMoveTweenUntil) {
          moveTweenClass = " battle-dom-unit-label--move-tween";
          moveTweenStyle = `--battle-dom-move-dx:${moveTweenInfo.dx}px;--battle-dom-move-dy:${moveTweenInfo.dy}px;`;
        }
      }

      return `
        <div
          class="battle-dom-unit-label battle-dom-unit-label--${unit.side}${moveTweenClass}"
          style="${logicalStyle(point.x, point.y + 54)}${moveTweenStyle}"
          data-battle-dom-unit-id="${unit.id}"
        >
          ${displayTroops.current} / ${displayTroops.max}
        </div>
      `;
    }).join("")
    : "";
  const selectedDisplayTroops = selectedUnit ? getDisplayTroops(selectedUnit) : null;
  const summaryLine = selectedUnit
    ? `${selectedUnit.name} | 병력 ${selectedDisplayTroops.current}/${selectedDisplayTroops.max} | 공격 ${Math.round(getEffectiveAttack(selectedUnit))} | 방어 ${Math.round(getEffectiveDefense(selectedUnit))} | 지력 ${selectedUnit.intelligence} | 방향 ${getDirectionLabel(selectedUnit.facing)}`
    : "유닛을 선택하세요";

  overlayElement.innerHTML = `
    ${unitVisuals}
    ${
      USE_DOM_BATTLE_TEXT_OVERLAY
        ? `
          <div class="battle-dom-title" style="${logicalStyle(96, 40)}">전투 테스트</div>
          <div class="battle-dom-battlefield" style="${logicalStyle(96, 82)}">${battleState.defenderCityName} 전장</div>
          <div class="battle-dom-instruction" style="${logicalStyle(PHASER_BATTLE_WIDTH - 112, 62)}">
            <strong>${summaryLine}</strong>
            <span>${getDomOverlayHelpCopy(battleState, selectedUnit, selectedSkill)}</span>
          </div>
          <div class="battle-dom-status-legend" style="${logicalStyle(PHASER_BATTLE_WIDTH / 2, PHASER_BATTLE_HEIGHT - 54)}">
            ${BATTLE_STATUS_ICON_LEGEND_TEXT}
          </div>
        `
        : ""
    }
    ${unitLabels}
  `;
}

function renderUnitCard(unit, sideLabel, { isSelected = false, selectable = false } = {}) {
  const statusParts = [];

  if (unit.buffTurns > 0 && unit.buffAttackBonus > 0) {
    const buffSourceName = unit.buffAttackSourceSkillName ?? "공격력 상승";
    statusParts.push(`${buffSourceName} 효과 +${Math.round(unit.buffAttackBonus * 100)}% · ${unit.buffTurns}턴`);
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
  const displayTroops = getDisplayTroops(unit);

  return `
    <div class="battle-unit-card battle-unit-card-${unit.side} ${isSelected ? "is-selected" : ""}"${selectionAttributes}>
      <div class="battle-unit-card-layout">
        ${renderUnitPortrait(unit)}
        <div class="battle-unit-card-copy">
          <div class="battle-unit-side-row">
            <span class="battle-unit-side">${sideLabel}</span>
            ${isSelected ? '<span class="battle-unit-selected-chip">선택 중</span>' : ""}
          </div>
          <strong class="battle-unit-name">${unit.name}</strong>
          <span class="battle-unit-hp">병력 ${displayTroops.current} / ${displayTroops.max} · 전열 ${unit.hp} / ${unit.maxHp}</span>
          <span class="battle-unit-hp">공 ${Math.round(getEffectiveAttack(unit))} · 방 ${Math.round(getEffectiveDefense(unit))} · 지력 ${unit.intelligence}</span>
          <span class="battle-unit-cooldown">방향 ${getDirectionLabel(unit.facing)}</span>
          <span class="battle-unit-buff">${statusParts.join(" · ")}</span>
        </div>
      </div>
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
                <div class="battle-dom-overlay" data-battle-dom-overlay aria-hidden="true"></div>
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
      ${activeSkillCutin.skillQuote ? `<div class="skill-cutin-quote">${activeSkillCutin.skillQuote}</div>` : ""}
      ${activeSkillCutin.skillName ? `
        <div class="skill-cutin-copy">
          <div class="skill-cutin-name">${activeSkillCutin.skillName}</div>
          ${activeSkillCutin.skillEffectText ? `<div class="skill-cutin-effect">${activeSkillCutin.skillEffectText}</div>` : ""}
        </div>
      ` : ""}
    </div>
  `;
}

function renderBattleResultCutinOverlay(activeBattleResultCutin) {
  if (!activeBattleResultCutin) {
    return "";
  }

  const resultText = BATTLE_RESULT_OVERLAY_TEXT[activeBattleResultCutin.result] ?? null;

  return `
    <div class="skill-cutin-overlay skill-cutin-overlay--result" aria-hidden="true">
      <img class="skill-cutin-image" src="${activeBattleResultCutin.image}" alt="" />
      ${resultText ? `<div class="battle-result-title battle-result-title--${resultText.tone}">${resultText.text}</div>` : ""}
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

function renderSelectedUnitSummary(selectedUnit, selectedSkill) {
  if (!selectedUnit) {
    return `
      <div class="battle-selected-card">
        <span class="battle-unit-cooldown">현재 선택된 유닛이 없습니다.</span>
      </div>
    `;
  }
  const displayTroops = getDisplayTroops(selectedUnit);

  return `
    <div class="battle-selected-card">
      <div class="battle-selected-layout">
        ${renderUnitPortrait(selectedUnit, { large: true })}
        <div class="battle-selected-copy">
          <strong class="battle-unit-name">${selectedUnit.name}</strong>
          <span class="battle-unit-hp">병력 ${displayTroops.current} / ${displayTroops.max} · 전열 ${selectedUnit.hp} / ${selectedUnit.maxHp}</span>
          <span class="battle-unit-cooldown">방향 ${getDirectionLabel(selectedUnit.facing)} · 지력 ${selectedUnit.intelligence}</span>
          <span class="battle-unit-buff">${formatStatusList(selectedUnit)}</span>
        </div>
      </div>
    </div>
    ${
      selectedSkill
        ? `
          <div class="battle-skill-card">
            <strong class="battle-unit-name">${selectedSkill.name}</strong>
            <span class="battle-unit-cooldown">재사용 ${selectedUnit.currentSkillCooldown} / ${selectedUnit.skillCooldown}턴</span>
          </div>
        `
        : ""
    }
  `;
}

function renderBattleStatusPanel(battleState, selectedUnit, selectedSkill) {
  return `
    <section class="battle-panel battle-status-panel">
      <p class="eyebrow">Status</p>
      <h2 class="detail-heading">전황 보고</h2>
      <p class="battle-status-copy">${getBattleStatusCopy(battleState)}</p>
      <div class="battle-status-note">
        ${battleState.turnOwner === "player" ? "유닛 선택 · 이동 · 방향 · 공격 · 특기 · 책략 · 방어 · 대기" : "적군 행동 중입니다."}
      </div>
      ${renderSelectedUnitSummary(selectedUnit, selectedSkill)}
    </section>
  `;
}

function renderBattleLeftPanel(battleState, selectedUnit, selectedSkill) {
  return `
    ${renderBattleStatusPanel(battleState, selectedUnit, selectedSkill)}
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
    resultCutinActive,
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
        !isActive && !resultCutinActive
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
  const resultCutinActive = Boolean(battleState.activeBattleResultCutin);
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
  const domOverlayElement = rootElement.querySelector("[data-battle-dom-overlay]");
  const mountElement = rootElement.querySelector("[data-battle-mount]");

  if (battleScreen) {
    battleScreen.setAttribute("data-battle-id", battleState.id);
  }

  if (topbarElement) {
    topbarElement.innerHTML = renderBattleTopbar(battleState);
  }

  if (leftPanelElement) {
    leftPanelElement.innerHTML = renderBattleLeftPanel(battleState, selectedUnit, selectedSkill);
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
        resultCutinActive,
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
    overlayLayerElement.innerHTML = (
      renderSkillCutinOverlay(battleState.activeSkillCutin)
      + renderBattleResultCutinOverlay(battleState.activeBattleResultCutin)
    );
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

  renderBattleDomOverlay(domOverlayElement, mountElement, battleState, selectedUnit, selectedSkill);

  if ((USE_DOM_BATTLE_TEXT_OVERLAY || USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY) && typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(() => {
      renderBattleDomOverlay(domOverlayElement, mountElement, battleState, selectedUnit, selectedSkill);
    });
  }

  if ((USE_DOM_BATTLE_TEXT_OVERLAY || USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY) && typeof window !== "undefined") {
    if (battleDomOverlayResizeHandler) {
      window.removeEventListener("resize", battleDomOverlayResizeHandler);
    }

    battleDomOverlayResizeHandler = () => {
      renderBattleDomOverlay(domOverlayElement, mountElement, battleState, selectedUnit, selectedSkill);
    };
    window.addEventListener("resize", battleDomOverlayResizeHandler);
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
