import {
  CHANCELLOR_POLICY_DESCRIPTIONS,
  CHANCELLOR_POLICY_LABELS,
  CHANCELLOR_POLICY_KEYS,
  LOYALTY_LABELS,
  LOYALTY_KEYS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
} from "../constants.js";
import {
  applyChancellorPolicyToHeroUpkeep,
  applyChancellorPolicyToSoldierUpkeepPreview,
  calculateHeroUpkeep,
  calculateSaltPreservationNeed,
  calculateSoldierUpkeepPreview,
  getWarehouseStatus,
  getTaxGoldMultiplier,
  getTaxLoyaltyDelta,
  normalizeDomesticPolicy,
} from "../core/domestic_income.js";
import { deriveCalendarFromTurn, formatCalendarLabel } from "../core/world_calendar.js";

const HUD_STOCK_RESOURCE_KEYS = Object.freeze([
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.SEAFOOD,
  RESOURCE_KEYS.WOOD,
  RESOURCE_KEYS.IRON,
  RESOURCE_KEYS.HORSES,
  RESOURCE_KEYS.SILK,
  RESOURCE_KEYS.SALT,
  RESOURCE_KEYS.GOLD,
]);

const INCOME_SUMMARY_RESOURCE_KEYS = Object.freeze([
  RESOURCE_KEYS.SEAFOOD,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.GOLD,
]);

function getWorldTurnOwnerLabel(turnOwner) {
  return turnOwner === "enemy" ? "적군 턴" : "아군 턴";
}

function getResourceAmount(resources, resourceKey) {
  const value = resources?.[resourceKey] ?? 0;
  return Number.isFinite(value) ? value : 0;
}

function formatResourceStock(resources) {
  return HUD_STOCK_RESOURCE_KEYS
    .map((resourceKey) => `${RESOURCE_LABELS[resourceKey]} ${getResourceAmount(resources, resourceKey)}`)
    .join(" / ");
}

function formatResourceCost(cost = {}, resourceKeys = Object.keys(cost)) {
  const summary = resourceKeys
    .map((resourceKey) => ({
      resourceKey,
      amount: getResourceAmount(cost, resourceKey),
    }))
    .filter((entry) => entry.amount > 0)
    .map((entry) => `${RESOURCE_LABELS[entry.resourceKey]} -${entry.amount}`)
    .join(" / ");

  return summary || "없음";
}

function formatShortage(shortageEntries = []) {
  const summary = shortageEntries
    .filter((entry) => entry.amount > 0)
    .map((entry) => `${RESOURCE_LABELS[entry.resource]} ${entry.amount}`)
    .join(", ");

  return summary ? `유지비 부족: ${summary}` : "유지비 정상";
}

function renderWarehouseRows(resources) {
  const warehouseStatus = getWarehouseStatus(resources);

  return HUD_STOCK_RESOURCE_KEYS
    .map((resourceKey) => {
      const entry = warehouseStatus[resourceKey];
      const capacityLabel = entry.capacity > 0 ? ` / ${entry.capacity}` : "";

      return `
        <span class="warehouse-row">
          <span>${RESOURCE_LABELS[resourceKey]}</span>
          <strong>${entry.amount}${capacityLabel}</strong>
          <em>${entry.status}</em>
        </span>
      `;
    })
    .join("");
}

function formatIncomeSummary(incomeResult) {
  if (!incomeResult?.totals) {
    return "";
  }

  const summary = INCOME_SUMMARY_RESOURCE_KEYS
    .map((resourceKey) => ({
      resourceKey,
      amount: getResourceAmount(incomeResult.totals, resourceKey),
    }))
    .filter((entry) => entry.amount > 0)
    .map((entry) => `${RESOURCE_LABELS[entry.resourceKey]} +${entry.amount}`)
    .join(", ");

  return summary ? `이번 턴 수입: ${summary}` : "이번 턴 수입 없음";
}

function formatSignedValue(value) {
  if (value > 0) {
    return `+${value}`;
  }

  return `${value}`;
}

function getTaxDescription(taxLevel) {
  if (taxLevel < 30) {
    return "가벼운 세금, 충성도 회복";
  }

  if (taxLevel > 30) {
    return "무거운 세금, 금전 증가 / 충성도 하락";
  }

  return "평소 수준";
}

function formatTaxEffect(tax) {
  if (!tax) {
    return "";
  }

  return `세금 효과: 인구·상업세 적용, 충성도 ${formatSignedValue(tax.loyaltyDelta)}`;
}

function renderChancellorPolicyControl(chancellorPolicy) {
  const options = Object.values(CHANCELLOR_POLICY_KEYS)
    .map((policyKey) => `
      <option value="${policyKey}" ${policyKey === chancellorPolicy ? "selected" : ""}>
        ${CHANCELLOR_POLICY_LABELS[policyKey]}
      </option>
    `)
    .join("");

  return `
    <label class="policy-control">
      <span class="policy-control-header">
        <span>재상 정책</span>
        <strong>${CHANCELLOR_POLICY_LABELS[chancellorPolicy]}</strong>
      </span>
      <select class="policy-select" data-chancellor-policy="true" aria-label="재상 정책">
        ${options}
      </select>
      <span class="policy-control-copy">${CHANCELLOR_POLICY_DESCRIPTIONS[chancellorPolicy]}</span>
    </label>
  `;
}

function formatChancellorPolicySummary(incomeResult, chancellorPolicy) {
  const policy = incomeResult?.chancellorPolicy?.policy ?? chancellorPolicy;

  return `재상 정책: ${CHANCELLOR_POLICY_LABELS[policy]}`;
}

function renderWarehousePanel(appState) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const domesticPolicy = normalizeDomesticPolicy(appState?.domesticPolicy);
  const lastUpkeep = appState?.world?.lastUpkeepResult?.player;
  const heroUpkeep = lastUpkeep?.upkeep
    ?? applyChancellorPolicyToHeroUpkeep(
      calculateHeroUpkeep(appState?.world?.heroes, playerFactionId),
      domesticPolicy.chancellorPolicy,
    );
  const soldierPreview = appState?.world?.lastUpkeepResult?.soldierPreview?.player
    ?? applyChancellorPolicyToSoldierUpkeepPreview(
      calculateSoldierUpkeepPreview(appState, playerFactionId),
      domesticPolicy.chancellorPolicy,
    );
  const saltPreservation = calculateSaltPreservationNeed(appState?.resources, domesticPolicy.chancellorPolicy);

  return `
    <div class="warehouse-panel">
      <strong class="warehouse-title">국가 창고</strong>
      <div class="warehouse-grid">
        ${renderWarehouseRows(appState?.resources)}
      </div>
      <span class="warehouse-note">영웅 유지비: ${formatResourceCost(heroUpkeep.cost, [
        RESOURCE_KEYS.RICE,
        RESOURCE_KEYS.SEAFOOD,
        RESOURCE_KEYS.SILK,
      ])}</span>
      <span class="warehouse-note">병사 유지비 preview: ${formatResourceCost(soldierPreview.cost, [
        RESOURCE_KEYS.RICE,
        RESOURCE_KEYS.BARLEY,
        RESOURCE_KEYS.SEAFOOD,
      ])} (${soldierPreview.troopCount}명 기준, 미차감)</span>
      <span class="warehouse-note">보존 소금: 필요 ${saltPreservation.needed} / 보유 ${saltPreservation.currentSalt} / ${saltPreservation.status}</span>
      <span class="warehouse-note">${formatShortage(lastUpkeep?.shortageEntries ?? [])}</span>
    </div>
  `;
}

export function renderWorldHud(appState, { canEndTurn, unified } = {}) {
  const { meta, world } = appState;
  const nationalLoyalty = meta?.[LOYALTY_KEYS.NATIONAL] ?? appState.nation?.loyalty ?? 75;
  const calendarLabel = formatCalendarLabel(deriveCalendarFromTurn(meta.turn));
  const domesticPolicy = normalizeDomesticPolicy(appState.domesticPolicy);
  const taxLevel = domesticPolicy.taxLevel;
  const chancellorPolicy = domesticPolicy.chancellorPolicy;
  const currentTax = {
    goldMultiplier: getTaxGoldMultiplier(taxLevel),
    loyaltyDelta: getTaxLoyaltyDelta(taxLevel),
  };
  const incomeSummary = formatIncomeSummary(world.lastIncomeResult);
  const taxEffect = formatTaxEffect(world.lastIncomeResult?.tax ?? currentTax);
  const chancellorPolicySummary = formatChancellorPolicySummary(world.lastIncomeResult, chancellorPolicy);

  return `
    <aside class="left-hud-stack" aria-label="World overview">
      <header class="title-panel">
        <p class="eyebrow">${meta.phase}</p>
        <h1 id="samwar-title" class="title">${meta.title}</h1>
        <p class="title-copy">임시 풀스크린 세계지도 위에서 성곽 랜드마크 기준 4도시 전선을 검증하는 MVP 화면</p>
      </header>

      <section class="detail-card hud-panel mvp-goal-panel">
        <h3 class="detail-heading">MVP 목표</h3>
        <ul class="goal-list">
          <li>배경 맵의 성곽 랜드마크에 4개 도시 앵커를 맞춰 전선을 검증합니다.</li>
          <li>도시 선택과 공격 진입, 점령, 통일 메시지까지 현재 월드맵 루프를 확인합니다.</li>
          <li>전투는 Phaser 기반 MVP이며 수동 지휘와 자동 위임 흐름을 함께 검증합니다.</li>
        </ul>
      </section>

      <section class="turn-card hud-panel">
        <span class="turn-label">World Turn</span>
        <strong class="turn-value">제 ${meta.turn}턴</strong>
        <span class="turn-calendar">${calendarLabel}</span>
        <strong class="turn-owner">${getWorldTurnOwnerLabel(world.turnOwner)}</strong>
        <span class="turn-loyalty">${LOYALTY_LABELS[LOYALTY_KEYS.NATIONAL]} ${nationalLoyalty}</span>
        <label class="tax-control">
          <span class="tax-control-header">
            <span>세금 수준</span>
            <strong>${taxLevel}</strong>
          </span>
          <input
            class="tax-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value="${taxLevel}"
            data-tax-level="true"
            aria-label="세금 수준"
          >
          <span class="tax-control-copy">${getTaxDescription(taxLevel)}</span>
        </label>
        ${renderChancellorPolicyControl(chancellorPolicy)}
        <span class="turn-stock">보유 자원: ${formatResourceStock(appState.resources)}</span>
        ${renderWarehousePanel(appState)}
        ${incomeSummary ? `<span class="turn-income">${incomeSummary}</span>` : ""}
        <span class="turn-policy-effect">${chancellorPolicySummary}</span>
        ${taxEffect ? `<span class="turn-tax-effect">${taxEffect}</span>` : ""}
        <span class="turn-copy">${unified ? "천하통일 달성" : meta.status}</span>
        ${canEndTurn ? `
          <button class="attack-button world-turn-button" type="button" data-end-world-turn="true">
            턴 종료
          </button>
        ` : ""}
      </section>
    </aside>
  `;
}
