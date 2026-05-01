import { getAttackAngleType, getDirectionLabel } from "../core/battle_direction.js";
import {
  canUseSkill,
  getEffectiveAttack,
  getEffectiveDefense,
  getGodotAttackValue,
  getGodotDefenseValue,
  getSkillById,
} from "../core/battle_skills.js";
import { canUseStrategy, getStrategyRange, getStrategyTier, hasStatus } from "../core/battle_strategy.js";
import { getEnemyUnits, getPlayerUnits, getSelectedUnit } from "../core/battle_rules.js";
import { mountBattleScene } from "../phaser/phaser_battle_mount.js";

function getBattleStatusCopy(battleState) {
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
    return "이동을 마쳤습니다. 유닛의 방향을 정하세요.";
  }

  if (battleState.phase === "skill") {
    return "스킬 대상이 되는 적 유닛을 선택하세요.";
  }

  if (battleState.phase === "strategy") {
    return "책략 대상 선택";
  }

  return "아군 유닛 선택 → 이동 → 방향 결정 → 공격 / 특기 / 책략 / 방어 / 대기 순서로 전투를 진행합니다.";
}

function getSkillHelpCopy(skill) {
  if (!skill) {
    return "영웅을 선택하면 고유 특기 정보가 표시됩니다.";
  }

  if (skill.id === "hakikjin_barrage") {
    return "사정거리 안의 모든 적을 포격합니다.";
  }

  if (skill.id === "reform_order") {
    return "아군의 공격력을 2턴 동안 상승시킵니다.";
  }

  return skill.description;
}

function getStrategyInfo(unit) {
  const tier = getStrategyTier(unit);

  if (tier === "master") {
    return "책략 가능: 혼란 2턴 / 동요 3턴";
  }

  if (tier === "advanced") {
    return "책략 가능: 혼란 1턴 / 동요 2턴";
  }

  if (tier === "basic") {
    return "책략 가능: 동요 1턴";
  }

  return "지력 80 이상 장수만 책략 사용 가능";
}

function formatBuffStatus(unit) {
  if (!unit || unit.buffTurns <= 0 || unit.buffAttackBonus <= 0) {
    return "버프 없음";
  }

  return `개혁령 효과: 공격력 +${Math.round(unit.buffAttackBonus * 100)}% / ${unit.buffTurns}턴`;
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

function getAttackAngleHint(battleState, selectedUnit) {
  if (!selectedUnit || battleState.highlights.attack.length === 0) {
    return "공격 각도 힌트 없음";
  }

  const target = battleState.units.find((unit) => (
    unit.isAlive
    && unit.side !== selectedUnit.side
    && battleState.highlights.attack.some((position) => position.x === unit.x && position.y === unit.y)
  ));

  if (!target) {
    return "공격 각도 힌트 없음";
  }

  const angleType = getAttackAngleType(selectedUnit, target);
  const angleLabel = angleType === "back" ? "후방" : angleType === "side" ? "측면" : "정면";

  return `공격 각도 예상: ${angleLabel}`;
}

function renderBattleLog(logEntries) {
  return logEntries
    .slice()
    .reverse()
    .map((entry) => `<li class="battle-log-item">${entry}</li>`)
    .join("");
}

function renderDirectionButton(direction) {
  return `
    <button class="battle-direction-button" type="button" data-battle-facing="${direction}">
      ${getDirectionLabel(direction)}
    </button>
  `;
}

function renderUnitCard(unit, sideLabel) {
  return `
    <div class="battle-unit-card battle-unit-card-${unit.side}">
      <span class="battle-unit-side">${sideLabel}</span>
      <strong class="battle-unit-name">${unit.name}</strong>
      <span class="battle-unit-hp">병력 ${unit.troops} / ${unit.maxTroops} · HP ${unit.hp} / ${unit.maxHp}</span>
      <span class="battle-unit-hp">공 ${Math.round(getEffectiveAttack(unit))} · 방 ${Math.round(getEffectiveDefense(unit))} · 지력 ${unit.intelligence}</span>
      <span class="battle-unit-cooldown">고유 특기 재사용 ${unit.currentSkillCooldown}턴 · 방향 ${getDirectionLabel(unit.facing)}</span>
      <span class="battle-unit-buff">${formatStatusList(unit)}</span>
      ${
        unit.buffTurns > 0 && unit.buffAttackBonus > 0
          ? `<span class="battle-unit-buff">공격 상승 +${Math.round(unit.buffAttackBonus * 100)}% · ${unit.buffTurns}턴</span>`
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
  const manualControlsLocked = Boolean(isActive && battleState.autoBattleEnabled);
  const canUseSelectedStrategy = Boolean(
    selectedUnit
    && canUseStrategy(selectedUnit)
    && !isFacingPhase
    && battleState.phase !== "skill"
  );
  const skillButtonLabel = selectedSkill?.name ?? "고유 특기";
  const selectedUnitSummary = selectedUnit
    ? `병력 ${selectedUnit.troops} / ${selectedUnit.maxTroops} · HP ${selectedUnit.hp} / ${selectedUnit.maxHp}`
    : "유닛을 선택하면 병력/사거리 정보가 표시됩니다.";
  const selectedUnitStats = selectedUnit
    ? `공격력 ${Math.round(getGodotAttackValue(selectedUnit))} · 방어력 ${Math.round(getGodotDefenseValue(selectedUnit))} · 실효공격 ${Math.round(getEffectiveAttack(selectedUnit))} · 실효방어 ${Math.round(getEffectiveDefense(selectedUnit))} · 지력 ${selectedUnit.intelligence}`
    : "유닛을 선택하면 전술 정보가 표시됩니다.";
  const selectedUnitRanges = selectedUnit
    ? `이동 ${selectedUnit.moveRange} · 기본 사거리 ${selectedUnit.attackRange} · 특기 사거리 ${selectedUnit.skillRange}`
    : "유닛을 선택하면 사거리 정보가 표시됩니다.";
  const strategyRangeText = selectedUnit && selectedUnit.intelligence >= 80
    ? `책략 사거리 ${getStrategyRange(selectedUnit)}`
    : "지력 80 이상 장수만 책략 사용 가능";

  rootElement.innerHTML = `
    <main class="battle-screen">
      <section class="battle-shell" aria-labelledby="battle-title">
        <div class="battle-stage-panel battle-panel">
          <div class="battle-stage-header">
            <div>
              <p class="eyebrow">Strategy Random Outcome Patch</p>
              <h1 id="battle-title" class="battle-screen-title">전투 테스트</h1>
              <p class="battle-screen-copy">
                ${battleState.attackerCityName} 군이 ${battleState.defenderCityName} 공략을 시도하고 있습니다.
              </p>
            </div>
            <div class="battle-city-chip">${battleState.defenderCityName}</div>
          </div>
          <div class="battle-phaser-shell">
            <div class="battle-phaser-host" data-battle-mount></div>
          </div>
        </div>

        <aside class="battle-hud" aria-label="Battle status">
          <section class="battle-panel battle-status-panel">
            <p class="eyebrow">Status</p>
            <h2 class="detail-heading">전황 보고</h2>
            <p class="battle-status-copy">${getBattleStatusCopy(battleState)}</p>
            <div class="battle-turn-banner">
              ${battleState.turnOwner === "player" ? "아군 턴" : "적군 턴"}
              <span class="battle-turn-subcopy">
                ${battleState.turnOwner === "player" ? "유닛 선택 · 이동 · 방향 · 공격 · 특기 · 책략 · 방어 · 대기" : "적군 행동 중"}
              </span>
            </div>
            <div class="battle-selected-card">
              <span class="battle-unit-side">선택 유닛</span>
              <strong class="battle-unit-name">${selectedUnit?.name ?? "없음"}</strong>
              <span class="battle-unit-hp">${selectedUnitSummary}</span>
              <span class="battle-unit-hp">${selectedUnitStats}</span>
              <span class="battle-unit-cooldown">${selectedUnitRanges}</span>
              ${selectedUnit ? `<span class="battle-unit-buff">방향: ${getDirectionLabel(selectedUnit.facing)}</span>` : ""}
              ${selectedUnit ? `<span class="battle-unit-buff">${formatBuffStatus(selectedUnit)}</span>` : ""}
              ${selectedUnit ? `<span class="battle-unit-buff">${formatStatusList(selectedUnit)}</span>` : ""}
              ${selectedUnit ? `<span class="battle-unit-cooldown">${getAttackAngleHint(battleState, selectedUnit)}</span>` : ""}
              ${selectedUnit ? `<span class="battle-unit-cooldown">${strategyRangeText}</span>` : ""}
              ${selectedUnit ? `<span class="battle-unit-buff">${getStrategyInfo(selectedUnit)}</span>` : ""}
            </div>
            <div class="battle-skill-card">
              <span class="battle-unit-side">고유 특기</span>
              <strong class="battle-unit-name">${selectedSkill?.name ?? "없음"}</strong>
              <span class="battle-unit-hp">
                ${
                  selectedSkill
                    ? `재사용 대기: ${selectedUnit?.currentSkillCooldown ?? 0}턴 · ${getSkillHelpCopy(selectedSkill)}`
                    : "영웅을 선택하면 고유 특기 정보가 표시됩니다."
                }
              </span>
              ${
                selectedSkill
                  ? `<span class="battle-unit-buff">${selectedSkill.description}</span>`
                  : ""
              }
            </div>
            <div class="battle-skill-card">
              <span class="battle-unit-side">책략</span>
              <strong class="battle-unit-name">${battleState.phase === "strategy" ? "대상 선택 중" : "가능 효과"}</strong>
              <span class="battle-unit-hp">
                ${selectedUnit ? getStrategyInfo(selectedUnit) : "유닛을 선택하면 책략 정보를 표시합니다."}
              </span>
            </div>
            ${
              isFacingPhase && selectedUnit
                ? `
                  <div class="battle-facing-panel">
                    <span class="battle-unit-side">방향 선택</span>
                    <div class="battle-direction-grid">
                      ${renderDirectionButton("up")}
                      ${renderDirectionButton("left")}
                      ${renderDirectionButton("down")}
                      ${renderDirectionButton("right")}
                    </div>
                  </div>
                `
                : ""
            }
            <div class="battle-unit-stats">
              ${playerUnits.map((unit) => renderUnitCard(unit, "아군")).join("")}
              ${enemyUnits.map((unit) => renderUnitCard(unit, "적군")).join("")}
            </div>
            <div class="battle-action-row battle-action-row-main">
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
            </div>
            <div class="battle-action-row battle-action-row-skill">
              <button class="battle-action-button" type="button" data-battle-action="wait" ${canUsePostureCommand && !manualControlsLocked ? "" : "disabled"}>
                대기
              </button>
              <button class="battle-action-button" type="button" data-battle-action="end-turn" ${isActive && !manualControlsLocked ? "" : "disabled"}>
                턴 종료
              </button>
              <button class="battle-action-button battle-action-button-auto ${battleState.autoBattleEnabled ? "is-active" : ""}" type="button" data-battle-action="auto" ${isActive ? "" : "disabled"}>
                ${battleState.autoBattleEnabled ? "자동전투 중지" : "자동전투"}
              </button>
            </div>
            <div class="battle-action-row battle-action-row-tertiary">
              <button class="battle-action-button battle-action-button-muted" type="button" data-battle-action="retreat" ${isActive ? "" : "disabled"}>
                후퇴
              </button>
            </div>
            ${
              selectedUnit && selectedSkill && selectedUnit.currentSkillCooldown > 0
                ? `<p class="battle-skill-help">재사용 대기: ${selectedUnit.currentSkillCooldown}턴</p>`
                : selectedSkill
                  ? `<p class="battle-skill-help">${getSkillHelpCopy(selectedSkill)}</p>`
                  : ""
            }
            ${
              !isActive
                ? `
                  <button class="battle-action-button battle-action-button-return" type="button" data-battle-action="return">
                    월드맵으로 복귀
                  </button>
                `
                : ""
            }
          </section>

          <section class="battle-panel battle-log-panel">
            <p class="eyebrow">Battle Log</p>
            <h2 class="detail-heading">전투 기록</h2>
            <ol class="battle-log-list">
              ${renderBattleLog(battleState.log)}
            </ol>
          </section>
        </aside>
      </section>
    </main>
  `;

  const mountElement = rootElement.querySelector("[data-battle-mount]");

  if (mountElement) {
    mountBattleScene(mountElement, battleState, {
      onSelectUnit: handlers.onBattleSelectUnit,
      onMoveUnit: handlers.onBattleMoveUnit,
      onSetFacing: handlers.onBattleSetFacing,
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
}
