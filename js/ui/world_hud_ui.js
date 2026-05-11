import {
  LOYALTY_LABELS,
  LOYALTY_KEYS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
} from "../constants.js";
import {
  getTaxGoldMultiplier,
  getTaxLoyaltyDelta,
  normalizeDomesticPolicy,
} from "../core/domestic_income.js";
import { deriveCalendarFromTurn, formatCalendarLabel } from "../core/world_calendar.js";

const HUD_STOCK_RESOURCE_KEYS = Object.freeze([
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.SEAFOOD,
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

function formatTaxMultiplier(multiplier) {
  return multiplier.toFixed(1);
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

  return `세금 효과: 금전 x${formatTaxMultiplier(tax.goldMultiplier)}, 충성도 ${formatSignedValue(tax.loyaltyDelta)}`;
}

export function renderWorldHud(appState, { canEndTurn, unified } = {}) {
  const { meta, world } = appState;
  const nationalLoyalty = meta?.[LOYALTY_KEYS.NATIONAL] ?? appState.nation?.loyalty ?? 75;
  const calendarLabel = formatCalendarLabel(deriveCalendarFromTurn(meta.turn));
  const domesticPolicy = normalizeDomesticPolicy(appState.domesticPolicy);
  const taxLevel = domesticPolicy.taxLevel;
  const currentTax = {
    goldMultiplier: getTaxGoldMultiplier(taxLevel),
    loyaltyDelta: getTaxLoyaltyDelta(taxLevel),
  };
  const incomeSummary = formatIncomeSummary(world.lastIncomeResult);
  const taxEffect = formatTaxEffect(world.lastIncomeResult?.tax ?? currentTax);

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
        <span class="turn-stock">보유 자원: ${formatResourceStock(appState.resources)}</span>
        ${incomeSummary ? `<span class="turn-income">${incomeSummary}</span>` : ""}
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
