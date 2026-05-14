import {
  CHANCELLOR_POLICY_DESCRIPTIONS,
  CHANCELLOR_POLICY_LABELS,
  CHANCELLOR_POLICY_KEYS,
  CHANCELLOR_TYPE_LABELS,
  LOYALTY_LABELS,
  LOYALTY_KEYS,
  RESOURCE_KEYS,
  RESOURCE_LABELS,
} from "../constants.js";
import {
  buildChancellorEffectSummary,
  calculateNationalDomesticEffects,
  getActiveChancellorHero,
} from "../core/domestic_effects.js";
import {
  applyChancellorPolicyToHeroUpkeep,
  applyChancellorPolicyToSoldierUpkeepPreview,
  calculateHeroUpkeep,
  calculateSaltPreservationNeed,
  calculateSoldierUpkeepPreview,
  getEligibleChancellorHeroes,
  getWarehouseStatus,
  getTaxGoldMultiplier,
  getTaxLoyaltyDelta,
  normalizeDomesticPolicy,
} from "../core/domestic_income.js";
import {
  buildFactionRelationSummary,
  calculateInterFactionTradeResult,
} from "../core/inter_faction_trade.js";
import {
  buildFactionSupplySummary,
  calculateInternalSupplyNetwork,
} from "../core/trade_supply.js";
import { deriveCalendarFromTurn, formatCalendarLabel } from "../core/world_calendar.js";
import { renderLoyaltyGauge } from "./loyalty_ui.js";

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

function formatSoldierPreviewBasis(preview = {}) {
  return `영웅 병력 ${preview.heroTroopCount ?? 0}명 + 주둔군 ${preview.garrisonTroopCount ?? 0}명 기준, 미차감`;
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

function renderChancellorPortrait(hero) {
  if (hero?.portraitImage) {
    return `<img class="chancellor-portrait" src="${hero.portraitImage}" alt="${hero.name} 초상화" loading="lazy" />`;
  }

  return `<div class="chancellor-portrait chancellor-portrait-fallback" aria-hidden="true">${hero?.name?.slice(0, 1) ?? "?"}</div>`;
}

function formatChancellorTypeLine(label, type, aptitude) {
  if (!type) {
    return `${label}: 없음`;
  }

  const typeLabel = CHANCELLOR_TYPE_LABELS[type] ?? type;
  return `${label}: ${typeLabel} ${aptitude}`;
}

function renderChancellorCard(appState) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const domesticPolicy = normalizeDomesticPolicy(
    appState?.domesticPolicy,
    appState?.world?.heroes,
    playerFactionId,
  );
  const candidates = getEligibleChancellorHeroes(appState?.world?.heroes, playerFactionId);
  const currentChancellor = candidates.find((hero) => hero.id === domesticPolicy.chancellorHeroId) ?? null;
  const options = [
    '<option value="">미임명</option>',
    ...candidates.map((hero) => `<option value="${hero.id}" ${hero.id === domesticPolicy.chancellorHeroId ? "selected" : ""}>${hero.name}</option>`),
  ].join("");

  return `
    <section class="chancellor-panel" aria-label="Chancellor">
      <span class="chancellor-label">재상</span>
      ${currentChancellor ? `
        <div class="chancellor-card">
          ${renderChancellorPortrait(currentChancellor)}
          <div class="chancellor-copy">
            <strong class="chancellor-name">${currentChancellor.name}</strong>
            <span class="chancellor-meta">${formatChancellorTypeLine(
              "주",
              currentChancellor.chancellorProfile?.primaryType,
              currentChancellor.chancellorProfile?.primaryAptitude,
            )}</span>
            <span class="chancellor-meta">${formatChancellorTypeLine(
              "보조",
              currentChancellor.chancellorProfile?.secondaryType,
              currentChancellor.chancellorProfile?.secondaryAptitude,
            )}</span>
          </div>
        </div>
      ` : `
        <div class="chancellor-card chancellor-card-empty">
          <div class="chancellor-copy">
            <strong class="chancellor-name">미임명</strong>
            <span class="chancellor-meta">재상 없음</span>
          </div>
        </div>
      `}
      <label class="policy-control">
        <span class="policy-control-header">
          <span>재상 임명</span>
          <strong>${currentChancellor ? currentChancellor.name : "미임명"}</strong>
        </span>
        <select class="policy-select" data-chancellor-hero-id="true" aria-label="재상 임명">
          ${options}
        </select>
      </label>
      <span class="domestic-effect-summary">${buildChancellorEffectSummary(
        currentChancellor,
        calculateNationalDomesticEffects({ chancellorHero: currentChancellor, domesticPolicy }),
      )}</span>
    </section>
  `;
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
  const domesticPolicy = normalizeDomesticPolicy(
    appState?.domesticPolicy,
    appState?.world?.heroes,
    playerFactionId,
  );
  const chancellorHero = getActiveChancellorHero(appState?.world?.heroes, domesticPolicy, playerFactionId);
  const nationalEffects = calculateNationalDomesticEffects({ chancellorHero, domesticPolicy });
  const lastUpkeep = appState?.world?.lastUpkeepResult?.player;
  const heroUpkeep = lastUpkeep?.upkeep
    ?? applyChancellorPolicyToHeroUpkeep(
      calculateHeroUpkeep(appState?.world?.heroes, playerFactionId),
      domesticPolicy.chancellorPolicy,
      nationalEffects,
    );
  const soldierPreview = appState?.world?.lastUpkeepResult?.soldierPreview?.player
    ?? applyChancellorPolicyToSoldierUpkeepPreview(
      calculateSoldierUpkeepPreview(appState, playerFactionId),
      domesticPolicy.chancellorPolicy,
      nationalEffects,
    );
  const saltPreservation = calculateSaltPreservationNeed(
    appState?.resources,
    domesticPolicy.chancellorPolicy,
    nationalEffects,
  );

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
      ])} (${formatSoldierPreviewBasis(soldierPreview)})</span>
      <span class="warehouse-note">보존 소금: 필요 ${saltPreservation.needed} / 보유 ${saltPreservation.currentSalt} / ${saltPreservation.status}</span>
      <span class="warehouse-note">${formatShortage(lastUpkeep?.shortageEntries ?? [])}</span>
    </div>
  `;
}

function renderSupplyNetworkHud(appState) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const result = appState?.world?.lastSupplyNetworkResult?.factionId === playerFactionId
    ? appState.world.lastSupplyNetworkResult
    : calculateInternalSupplyNetwork(appState, playerFactionId);
  const summary = buildFactionSupplySummary(result);
  const supportNeeded = summary.supportNeededCities.length
    ? summary.supportNeededCities.slice(0, 2).join(", ")
    : "없음";

  return `
    <div class="warehouse-panel supply-network-panel">
      <strong class="warehouse-title">내부 보급망</strong>
      <span class="warehouse-note">활성 교역로 ${summary.routeCount}개</span>
      <span class="warehouse-note">금전 +${summary.totals.gold} / 식량 +${summary.totals.food} / 소금 +${summary.totals.salt}</span>
      <span class="warehouse-note">군사 지원 필요 도시: ${supportNeeded}</span>
    </div>
  `;
}

function renderTroopRebalanceHud(appState) {
  const result = appState?.world?.lastTroopRebalanceResult;
  const transfers = result?.transfers ?? [];
  const summary = transfers.length
    ? transfers
      .slice(0, 2)
      .map((transfer) => `${transfer.fromCityName} → ${transfer.toCityName} ${transfer.amount.toLocaleString("ko-KR")}명`)
      .join(" / ")
    : "목표 주둔군 충족";

  return `
    <div class="warehouse-panel supply-network-panel">
      <strong class="warehouse-title">내부 병력 재배치</strong>
      <span class="warehouse-note">${summary}</span>
      <span class="warehouse-note">총 이동 ${Math.max(0, Number(result?.totalMoved) || 0).toLocaleString("ko-KR")}명</span>
    </div>
  `;
}

function renderInterFactionTradeHud(appState) {
  const result = appState?.world?.lastInterFactionTradeResult ?? calculateInterFactionTradeResult(appState);
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const relationSummary = buildFactionRelationSummary(appState, playerFactionId)
    .slice(0, 3)
    .map((entry) => `${entry.factionName.replace(" 세력", "")}: ${entry.label}${entry.relation.tradeCooldownTurns > 0 ? ` ${entry.relation.tradeCooldownTurns}턴` : ""}`)
    .join(" / ");
  const playerTotals = result?.playerTotals ?? {};
  const suspended = result?.suspendedRoutes?.[0] ?? null;
  const playerRoute = (result?.routes ?? []).find((route) => (
    route.fromFactionId === playerFactionId || route.toFactionId === playerFactionId
  )) ?? null;
  const incomeLine = `이번 턴 수익: 금전 +${playerTotals.gold ?? 0} / 식량 +${(playerTotals.rice ?? 0) + (playerTotals.barley ?? 0) + (playerTotals.seafood ?? 0)} / 소금 +${playerTotals.salt ?? 0}`;
  const operationLine = playerRoute?.governance
    ? `운영: ${playerRoute.governance.operationLabel} · 효율 ${Math.round((playerRoute.governance.efficiency ?? 1) * 100)}%`
    : "";
  const suspendedLine = suspended
    ? `${suspended.fromFactionName} ↔ ${suspended.toFactionName} 교역 중단 ${suspended.tradeCooldownTurns}턴`
    : "";

  return `
    <div class="warehouse-panel supply-network-panel">
      <strong class="warehouse-title">대외 무역</strong>
      <span class="warehouse-note">활성 교역로 ${result?.routeCount ?? 0}개</span>
      ${operationLine ? `<span class="warehouse-note">${operationLine}</span>` : ""}
      <span class="warehouse-note">${incomeLine}</span>
      ${relationSummary ? `<span class="warehouse-note">세력 관계: ${relationSummary}</span>` : ""}
      ${suspendedLine ? `<span class="warehouse-note">${suspendedLine}</span>` : ""}
    </div>
  `;
}

function renderTurnAction({ canEndTurn, pendingEnemyTurnResult }) {
  if (!pendingEnemyTurnResult) {
    return canEndTurn ? `
      <button class="attack-button world-turn-button" type="button" data-end-world-turn="true">
        아군 턴 종료
      </button>
    ` : "";
  }

  return `
    <button class="attack-button world-turn-button" type="button" data-enemy-turn-result="confirm">
      적군 턴 종료
    </button>
  `;
}

function renderSaveControlPanel(appState) {
  const disabled = appState?.mode !== "world" || Boolean(appState?.battle);
  const disabledAttribute = disabled ? "disabled" : "";
  const saveMessage = appState?.ui?.saveMessage ?? "";

  return `
    <div class="save-control-panel">
      <strong class="save-control-title">저장 관리</strong>
      <div class="save-control-actions">
        <button class="save-control-button" type="button" data-save-game="true" ${disabledAttribute}>저장</button>
        <button class="save-control-button" type="button" data-load-game="true" ${disabledAttribute}>불러오기</button>
        <button class="save-control-button save-control-button-danger" type="button" data-reset-game="true" ${disabledAttribute}>초기화</button>
      </div>
      ${saveMessage ? `<span class="save-control-note">${saveMessage}</span>` : ""}
    </div>
  `;
}

export function renderWorldHud(appState, { canEndTurn, unified } = {}) {
  const { meta, world } = appState;
  const nationalLoyalty = meta?.[LOYALTY_KEYS.NATIONAL] ?? appState.nation?.loyalty ?? 75;
  const calendarLabel = formatCalendarLabel(deriveCalendarFromTurn(meta.turn));
  const domesticPolicy = normalizeDomesticPolicy(appState.domesticPolicy, world?.heroes, meta?.playerFactionId);
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
      <section class="turn-card hud-panel">
        <span class="turn-label">World Turn</span>
        <strong class="turn-value">제 ${meta.turn}턴</strong>
        <span class="turn-calendar">${calendarLabel}</span>
        <strong class="turn-owner">${getWorldTurnOwnerLabel(world.turnOwner)}</strong>
        ${renderLoyaltyGauge(LOYALTY_LABELS[LOYALTY_KEYS.NATIONAL], nationalLoyalty, {
          className: "turn-loyalty",
        })}
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
        ${renderChancellorCard(appState)}
        ${renderChancellorPolicyControl(chancellorPolicy)}
        <span class="turn-stock">보유 자원: ${formatResourceStock(appState.resources)}</span>
        ${renderWarehousePanel(appState)}
        ${renderSupplyNetworkHud(appState)}
        ${renderTroopRebalanceHud(appState)}
        ${renderInterFactionTradeHud(appState)}
        ${incomeSummary ? `<span class="turn-income">${incomeSummary}</span>` : ""}
        <span class="turn-policy-effect">${chancellorPolicySummary}</span>
        ${taxEffect ? `<span class="turn-tax-effect">${taxEffect}</span>` : ""}
        ${unified ? '<span class="turn-tax-effect">천하통일 달성</span>' : ""}
        ${renderTurnAction({ canEndTurn, pendingEnemyTurnResult: world.pendingEnemyTurnResult })}
        ${renderSaveControlPanel(appState)}
      </section>
    </aside>
  `;
}
