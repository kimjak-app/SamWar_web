import { getSkillById } from "../core/battle_skills.js";
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

  if (battleState.phase === "skill") {
    return "스킬 대상이 되는 적 유닛을 선택하세요.";
  }

  return "아군 유닛 선택 → 이동 → 기본 공격 또는 스킬 사용 순서로 전투를 진행합니다.";
}

function renderBattleLog(logEntries) {
  return logEntries
    .slice()
    .reverse()
    .map((entry) => `<li class="battle-log-item">${entry}</li>`)
    .join("");
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
  const canUseSelectedSkill = Boolean(selectedUnit && selectedSkill && selectedUnit.currentSkillCooldown <= 0 && !selectedUnit.hasActed);
  const skillButtonLabel = selectedSkill
    ? selectedUnit.currentSkillCooldown > 0
      ? `스킬 (${selectedUnit.currentSkillCooldown})`
      : "스킬"
    : "스킬";

  rootElement.innerHTML = `
    <main class="battle-screen">
      <section class="battle-shell" aria-labelledby="battle-title">
        <div class="battle-stage-panel battle-panel">
          <div class="battle-stage-header">
            <div>
              <p class="eyebrow">Hero Skill Battle MVP</p>
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
                ${battleState.turnOwner === "player" ? "유닛 선택 · 이동 · 공격 · 스킬" : "적군 행동 중"}
              </span>
            </div>
            <div class="battle-selected-card">
              <span class="battle-unit-side">선택 유닛</span>
              <strong class="battle-unit-name">${selectedUnit?.name ?? "없음"}</strong>
              <span class="battle-unit-hp">
                ${
                  selectedUnit
                    ? `HP ${selectedUnit.hp} / ${selectedUnit.maxHp} · 이동 ${selectedUnit.moveRange} · 사거리 ${selectedUnit.attackRange}`
                    : "유닛을 선택하면 이동/공격 정보가 표시됩니다."
                }
              </span>
            </div>
            <div class="battle-skill-card">
              <span class="battle-unit-side">선택 스킬</span>
              <strong class="battle-unit-name">${selectedSkill?.name ?? "없음"}</strong>
              <span class="battle-unit-hp">
                ${
                  selectedSkill
                    ? `재사용 ${selectedUnit?.currentSkillCooldown ?? 0} / 설명: ${selectedSkill.description}`
                    : "영웅을 선택하면 고유 스킬 정보가 표시됩니다."
                }
              </span>
            </div>
            <div class="battle-unit-stats">
              ${playerUnits
                .map((unit) => `
                  <div class="battle-unit-card battle-unit-card-player">
                    <span class="battle-unit-side">아군</span>
                    <strong class="battle-unit-name">${unit.name}</strong>
                    <span class="battle-unit-hp">HP ${unit.hp} / ${unit.maxHp}</span>
                    <span class="battle-unit-cooldown">스킬 재사용 ${unit.currentSkillCooldown}</span>
                  </div>
                `)
                .join("")}
              ${enemyUnits
                .map((unit) => `
                  <div class="battle-unit-card battle-unit-card-enemy">
                    <span class="battle-unit-side">적군</span>
                    <strong class="battle-unit-name">${unit.name}</strong>
                    <span class="battle-unit-hp">HP ${unit.hp} / ${unit.maxHp}</span>
                    <span class="battle-unit-cooldown">스킬 재사용 ${unit.currentSkillCooldown}</span>
                  </div>
                `)
                .join("")}
            </div>
            <div class="battle-action-row battle-action-row-skill">
              <button
                class="battle-action-button battle-action-button-skill ${battleState.phase === "skill" ? "is-active" : ""}"
                type="button"
                data-battle-action="skill"
                ${isActive && canUseSelectedSkill ? "" : "disabled"}
              >
                ${skillButtonLabel}
              </button>
              <button class="battle-action-button" type="button" data-battle-action="end-turn" ${isActive ? "" : "disabled"}>
                턴 종료
              </button>
              <button class="battle-action-button battle-action-button-muted" type="button" data-battle-action="retreat" ${isActive ? "" : "disabled"}>
                후퇴
              </button>
            </div>
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
      onAttackUnit: handlers.onBattleAttackUnit,
      onUseSkill: handlers.onBattleUseSkill,
      onEndTurn: handlers.onBattleEndTurn,
      onRetreat: handlers.onBattleRetreat,
    });
  }

  rootElement.querySelector('[data-battle-action="skill"]')?.addEventListener("click", () => {
    handlers.onBattleEnterSkillMode?.();
  });

  rootElement.querySelector('[data-battle-action="end-turn"]')?.addEventListener("click", () => {
    handlers.onBattleEndTurn?.();
  });

  rootElement.querySelector('[data-battle-action="retreat"]')?.addEventListener("click", () => {
    handlers.onBattleRetreat?.();
  });

  rootElement.querySelector('[data-battle-action="return"]')?.addEventListener("click", () => {
    handlers.onBattleReturnToWorld?.();
  });
}
