import { canUseSkill, getEffectiveAttack, getEffectiveDefense, getSkillById } from "../core/battle_skills.js";
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

  return "아군 유닛 선택 → 이동 → 기본 공격 또는 고유 특기 사용 순서로 전투를 진행합니다.";
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

function formatBuffStatus(unit) {
  if (!unit || unit.buffTurns <= 0 || unit.buffAttackBonus <= 0) {
    return "버프 없음";
  }

  return `개혁령 효과: 공격력 +${Math.round(unit.buffAttackBonus * 100)}% / ${unit.buffTurns}턴`;
}

function renderBattleLog(logEntries) {
  return logEntries
    .slice()
    .reverse()
    .map((entry) => `<li class="battle-log-item">${entry}</li>`)
    .join("");
}

function renderUnitCard(unit, sideLabel) {
  return `
    <div class="battle-unit-card battle-unit-card-${unit.side}">
      <span class="battle-unit-side">${sideLabel}</span>
      <strong class="battle-unit-name">${unit.name}</strong>
      <span class="battle-unit-hp">병력 ${unit.troops} / ${unit.maxTroops} · HP ${unit.hp} / ${unit.maxHp}</span>
      <span class="battle-unit-hp">공 ${Math.round(getEffectiveAttack(unit))} · 방 ${Math.round(getEffectiveDefense(unit))}</span>
      <span class="battle-unit-cooldown">고유 특기 재사용 ${unit.currentSkillCooldown}턴</span>
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
  const canUseSelectedSkill = Boolean(selectedUnit && selectedSkill && canUseSkill(selectedUnit, selectedSkill));
  const skillButtonLabel = selectedSkill?.name ?? "고유 특기";
  const selectedUnitSummary = selectedUnit
    ? `병력 ${selectedUnit.troops} / ${selectedUnit.maxTroops} · HP ${selectedUnit.hp} / ${selectedUnit.maxHp}`
    : "유닛을 선택하면 병력/사거리 정보가 표시됩니다.";
  const selectedUnitStats = selectedUnit
    ? `공 ${Math.round(getEffectiveAttack(selectedUnit))} · 방 ${Math.round(getEffectiveDefense(selectedUnit))} · 이동 ${selectedUnit.moveRange} · 기본 사거리 ${selectedUnit.attackRange} · 특기 사거리 ${selectedUnit.skillRange}`
    : "유닛을 선택하면 전술 정보가 표시됩니다.";

  rootElement.innerHTML = `
    <main class="battle-screen">
      <section class="battle-shell" aria-labelledby="battle-title">
        <div class="battle-stage-panel battle-panel">
          <div class="battle-stage-header">
            <div>
              <p class="eyebrow">Godot Balance Fidelity Patch</p>
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
                ${battleState.turnOwner === "player" ? "유닛 선택 · 이동 · 기본 공격 · 고유 특기" : "적군 행동 중"}
              </span>
            </div>
            <div class="battle-selected-card">
              <span class="battle-unit-side">선택 유닛</span>
              <strong class="battle-unit-name">${selectedUnit?.name ?? "없음"}</strong>
              <span class="battle-unit-hp">${selectedUnitSummary}</span>
              <span class="battle-unit-hp">${selectedUnitStats}</span>
              ${selectedUnit ? `<span class="battle-unit-buff">${formatBuffStatus(selectedUnit)}</span>` : ""}
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
            <div class="battle-unit-stats">
              ${playerUnits.map((unit) => renderUnitCard(unit, "아군")).join("")}
              ${enemyUnits.map((unit) => renderUnitCard(unit, "적군")).join("")}
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
