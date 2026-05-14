import { RESOURCE_KEYS, RESOURCE_LABELS } from "../constants.js";
import {
  calculateInterFactionTradeResult,
  canTradeBetweenFactions,
  getCityTradeSettings,
  getFactionRelationDescription,
  getFactionRelationLabel,
  getFactionRelation,
  TRADE_CONTROL_MODES,
  TRADE_INTENSITY_KEYS,
} from "../core/inter_faction_trade.js";
import {
  buildCitySupplySummary,
  buildCityTroopRebalanceSummary,
  calculateInternalSupplyNetwork,
} from "../core/trade_supply.js";

const FOOD_RESOURCE_KEYS = Object.freeze([
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.SEAFOOD,
]);

const STRATEGIC_RESOURCE_KEYS = Object.freeze([
  RESOURCE_KEYS.WOOD,
  RESOURCE_KEYS.IRON,
  RESOURCE_KEYS.HORSES,
]);

const SPECIALTY_RESOURCE_KEYS = Object.freeze([
  RESOURCE_KEYS.SILK,
  RESOURCE_KEYS.SALT,
]);

const TRADE_INTENSITY_LABELS = Object.freeze({
  [TRADE_INTENSITY_KEYS.LOW]: "낮음",
  [TRADE_INTENSITY_KEYS.NORMAL]: "보통",
  [TRADE_INTENSITY_KEYS.HIGH]: "높음",
});

const TRADE_MODE_LABELS = Object.freeze({
  [TRADE_CONTROL_MODES.AUTO]: "자동 운영",
  [TRADE_CONTROL_MODES.DIRECT]: "직할 운영",
});
const CITY_DETAIL_TAB_KEYS = Object.freeze({
  RESOURCES: "resources",
  INTERNAL_TRADE: "internal-trade",
  EXTERNAL_TRADE: "external-trade",
});
const CITY_DETAIL_TABS = Object.freeze([
  { key: CITY_DETAIL_TAB_KEYS.RESOURCES, label: "자원" },
  { key: CITY_DETAIL_TAB_KEYS.INTERNAL_TRADE, label: "자국무역" },
  { key: CITY_DETAIL_TAB_KEYS.EXTERNAL_TRADE, label: "타국무역" },
]);

function getResourceValue(resources, key) {
  const value = resources?.[key] ?? 0;
  return Number.isFinite(value) ? value : 0;
}

function formatRating(value) {
  const clampedValue = Math.max(0, Math.min(5, Math.trunc(value)));

  if (clampedValue === 0) {
    return "-";
  }

  return "★".repeat(clampedValue);
}

function renderResourceRow(label, value) {
  return `
    <div class="domestic-resource-row">
      <span>${label}</span>
      <strong>${formatRating(value)}</strong>
    </div>
  `;
}

function renderCommerceRatingRow(value) {
  return `
    <div class="domestic-yield-row">
      <span>상업력</span>
      <strong>${formatRating(value)}</strong>
    </div>
  `;
}

function formatTroops(value) {
  return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("ko-KR");
}

function getSupplyResult(appState) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const lastResult = appState?.world?.lastSupplyNetworkResult;

  if (lastResult?.factionId === playerFactionId) {
    return lastResult;
  }

  return calculateInternalSupplyNetwork(appState, playerFactionId);
}

function getExternalTradeResult(appState) {
  return appState?.world?.lastInterFactionTradeResult ?? calculateInterFactionTradeResult(appState);
}

function getFactionName(appState, factionId) {
  return appState?.world?.factions?.find((faction) => faction.id === factionId)?.name
    ?? factionId
    ?? "미상 세력";
}

function getResourceLabel(resourceKey) {
  if (resourceKey === "food") {
    return "식량";
  }

  return RESOURCE_LABELS[resourceKey] ?? resourceKey;
}

function formatTradeGoods(resourceKeys = []) {
  return resourceKeys.length
    ? resourceKeys.map((resourceKey) => getResourceLabel(resourceKey)).join(" · ")
    : "일반 물자";
}

function getRouteTradeSettingsForCity(route, city) {
  if (!route?.governance) {
    return getCityTradeSettings(city);
  }

  return route.fromCityId === city?.id
    ? route.governance.cityA?.settings ?? route.governance.settingsA
    : route.governance.cityB?.settings ?? route.governance.settingsB;
}

function getRouteGovernanceForCity(route, city) {
  if (!route?.governance) {
    return null;
  }

  return route.fromCityId === city?.id
    ? route.governance.cityA
    : route.governance.cityB;
}

function renderTradeControlButton(city, appState, hasRoute) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const disabled = !hasRoute
    || city?.ownerFactionId !== playerFactionId
    || appState?.mode !== "world"
    || appState?.battle
    || appState?.pendingBattleChoice
    || appState?.pendingHeroDeployment
    || appState?.pendingHeroTransfer
    || appState?.world?.pendingEnemyTurnResult;

  if (city?.ownerFactionId !== playerFactionId) {
    return "";
  }

  return `
    <button class="relation-action-button trade-control-open-button" type="button" data-trade-control-open-city-id="${city.id}" ${disabled ? "disabled" : ""}>
      ${hasRoute ? "무역 조정" : "교역로 없음"}
    </button>
  `;
}

function renderRouteSummary(result, cityId) {
  const routes = (result?.routes ?? [])
    .filter((route) => route.fromCityId === cityId || route.toCityId === cityId)
    .slice(0, 2);

  if ((result?.routeCount ?? 0) <= 0) {
    return "비활성";
  }

  if (routes.length === 0) {
    return `활성 ${result.routeCount}개`;
  }

  return routes
    .map((route) => `${route.fromCityName} ↔ ${route.toCityName}`)
    .join(" / ");
}

function renderSupplyTradeSection(city, appState) {
  const result = getSupplyResult(appState);
  const summary = buildCitySupplySummary(result, city.id);

  if (!summary) {
    return `
      <div class="city-domestic-section">
        <p class="city-domestic-heading">자국무역 / 내부 보급망</p>
        <div class="domestic-yield-row">
          <span>내부 교역로</span>
          <strong>비활성</strong>
        </div>
      </div>
    `;
  }

  const supportLine = summary.shortageTroops > 0
    ? `지원 가능 도시: ${summary.supportCandidates.length ? summary.supportCandidates.slice(0, 2).join(", ") : "없음"}`
    : (summary.surplusTroops > 0
      ? `지원 후보: ${summary.supportTargets.length ? summary.supportTargets.slice(0, 2).join(", ") : "대기"}`
      : "지원 판단: 균형");

  return `
    <div class="city-domestic-section city-supply-section">
      <p class="city-domestic-heading">무역/보급 정보</p>
      <div class="domestic-yield-row">
        <span>내부 교역로</span>
        <strong>${renderRouteSummary(result, city.id)}</strong>
      </div>
      <div class="domestic-yield-row">
        <span>보급 우선도</span>
        <strong>${summary.supplyPriorityLabel}</strong>
      </div>
      <div class="domestic-yield-row">
        <span>이번 턴 배분</span>
        <strong>금전 +${summary.allocation.gold} / 식량 +${summary.allocation.food} / 소금 +${summary.allocation.salt}</strong>
      </div>
      <span class="city-status-note">사유: ${summary.reasons.slice(0, 4).join(" · ")}</span>
    </div>
    <div class="city-domestic-section city-supply-section">
      <p class="city-domestic-heading">군사 보급 판단</p>
      <div class="domestic-yield-row">
        <span>도시 역할</span>
        <strong>${summary.roleLabel}</strong>
      </div>
      <div class="domestic-yield-row">
        <span>목표 주둔군</span>
        <strong>${formatTroops(summary.targetGarrison)}</strong>
      </div>
      <div class="domestic-yield-row">
        <span>현재 주둔군</span>
        <strong>${formatTroops(summary.currentGarrison)}</strong>
      </div>
      <div class="domestic-yield-row">
        <span>${summary.shortageTroops > 0 ? "부족 병력" : "잉여 병력"}</span>
        <strong>${formatTroops(summary.shortageTroops > 0 ? summary.shortageTroops : summary.surplusTroops)}</strong>
      </div>
      <span class="city-status-note">${supportLine} · 실제 병력 이동 없음</span>
    </div>
  `;
}

function renderTroopRebalanceSection(city, appState) {
  const result = appState?.world?.lastTroopRebalanceResult;
  const summary = buildCityTroopRebalanceSummary(result, city.id);
  const sent = summary.sent?.[0] ?? null;
  const received = summary.received?.[0] ?? null;
  let message = "목표 주둔군 충족";

  if (received) {
    message = `${received.fromCityName}에서 ${formatTroops(received.amount)}명 도착`;
  } else if (sent) {
    message = `${sent.fromCityName} → ${sent.toCityName} ${formatTroops(sent.amount)}명 지원`;
  } else {
    const supplyResult = getSupplyResult(appState);
    const supplySummary = buildCitySupplySummary(supplyResult, city.id);

    if (supplySummary?.shortageTroops > 0) {
      message = "지원 대기";
    } else if (supplySummary?.surplusTroops > 0) {
      message = "잉여 병력 대기";
    }
  }

  return `
    <div class="city-domestic-section city-supply-section">
      <p class="city-domestic-heading">내부 병력 재배치</p>
      <div class="domestic-yield-row">
        <span>최근 이동</span>
        <strong>${message}</strong>
      </div>
    </div>
  `;
}

function renderExternalTradeSection(city, appState) {
  const result = getExternalTradeResult(appState);
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const cityRelationFactionId = city.ownerFactionId === playerFactionId
    ? [
      ...new Set((city?.neighbors ?? [])
        .map((neighborId) => appState?.world?.cities?.find((entry) => entry.id === neighborId))
        .filter((neighbor) => neighbor && neighbor.ownerFactionId !== city.ownerFactionId)
        .map((neighbor) => neighbor.ownerFactionId)),
    ][0]
    : city.ownerFactionId;
  const relation = cityRelationFactionId
    ? getFactionRelation(appState, playerFactionId, cityRelationFactionId)
    : null;
  const relationLabel = relation ? getFactionRelationLabel(relation) : "관계 없음";
  const relationDescription = relation ? getFactionRelationDescription(relation) : "인접 대외 교역 없음";
  const canTrade = relation ? canTradeBetweenFactions(appState, playerFactionId, cityRelationFactionId) : false;
  const canUseRelationActions = Boolean(
    cityRelationFactionId
    && appState?.mode === "world"
    && !appState?.battle
    && !appState?.pendingBattleChoice
    && !appState?.pendingHeroDeployment
    && !appState?.pendingHeroTransfer
    && !appState?.world?.pendingEnemyTurnResult
  );
  const isCooldownOrWar = relation?.status === "trade_suspended" || relation?.status === "war" || (relation?.tradeCooldownTurns ?? 0) > 0;
  const activeRoutes = (result?.routes ?? []).filter((route) => route.fromCityId === city.id || route.toCityId === city.id);
  const activeRoute = activeRoutes[0] ?? null;
  const neighborFactionIds = [
    ...new Set((city?.neighbors ?? [])
      .map((neighborId) => appState?.world?.cities?.find((entry) => entry.id === neighborId))
      .filter((neighbor) => neighbor && neighbor.ownerFactionId !== city.ownerFactionId)
      .map((neighbor) => neighbor.ownerFactionId)),
  ];
  const suspendedRelation = neighborFactionIds
    .map((factionId) => ({
      factionId,
      relation: getFactionRelation(appState, city.ownerFactionId, factionId),
    }))
    .find((entry) => entry.relation.status === "trade_suspended" || entry.relation.status === "war");

  if (activeRoute) {
    const partnerFactionId = activeRoute.fromFactionId === city.ownerFactionId
      ? activeRoute.toFactionId
      : activeRoute.fromFactionId;
    const specialties = activeRoute.specialties?.length ? activeRoute.specialties.join(" · ") : "일반 물자";
    const tradeSettings = getRouteTradeSettingsForCity(activeRoute, city);
    const governance = getRouteGovernanceForCity(activeRoute, city) ?? activeRoute.governance ?? {};
    const operationLabel = tradeSettings.mode === TRADE_CONTROL_MODES.DIRECT
      ? "직할 무역"
      : (governance.operationLabel ?? "임시 관료 최소 무역");

    return `
      <div class="city-domestic-section city-supply-section">
        <p class="city-domestic-heading">타국무역 / 세력 관계</p>
        <div class="domestic-yield-row">
          <span>교역 상대</span>
          <strong>${getFactionName(appState, partnerFactionId)}</strong>
        </div>
        <div class="domestic-yield-row">
          <span>관계</span>
          <strong>${relationLabel}</strong>
        </div>
        <span class="city-status-note">상태: ${canTrade ? "교역 가능" : relationDescription}</span>
        <div class="domestic-yield-row">
          <span>운영</span>
          <strong>${operationLabel}</strong>
        </div>
        <div class="domestic-yield-row">
          <span>교역 강도</span>
          <strong>${TRADE_INTENSITY_LABELS[tradeSettings.intensity] ?? "보통"} · 효율 ${Math.round((governance.efficiency ?? 1) * 100)}%</strong>
        </div>
        <span class="city-status-note">주요 수출: ${formatTradeGoods(tradeSettings.mainExports)} · 수입 우선: ${formatTradeGoods(tradeSettings.mainImports)}</span>
        <div class="domestic-yield-row">
          <span>무역 수익</span>
          <strong>금전 +${activeRoute.gold} / 식량 +${activeRoute.rice + activeRoute.barley + activeRoute.seafood} / 소금 +${activeRoute.salt}</strong>
        </div>
        <span class="city-status-note">주요 품목: ${specialties} · 전략 자원 교역 준비 중</span>
        <div class="relation-action-row">
          ${renderTradeControlButton(city, appState, true)}
        </div>
        ${renderRelationActions(playerFactionId, partnerFactionId, relation, canUseRelationActions, isCooldownOrWar)}
      </div>
    `;
  }

  if (suspendedRelation) {
    const label = suspendedRelation.relation.status === "war"
      ? "전쟁 중: 교역 중단"
      : `전쟁 후 교역 중단 · 재개까지 ${suspendedRelation.relation.tradeCooldownTurns}턴`;

    return `
      <div class="city-domestic-section city-supply-section">
        <p class="city-domestic-heading">타국무역 / 세력 관계</p>
        <div class="domestic-yield-row">
          <span>${getFactionName(appState, suspendedRelation.factionId)}</span>
          <strong>${label}</strong>
        </div>
        <div class="relation-action-row">
          ${renderTradeControlButton(city, appState, false)}
        </div>
        ${renderRelationActions(playerFactionId, suspendedRelation.factionId, suspendedRelation.relation, canUseRelationActions, true)}
      </div>
    `;
  }

  return `
    <div class="city-domestic-section city-supply-section">
      <p class="city-domestic-heading">타국무역 / 세력 관계</p>
      <div class="domestic-yield-row">
        <span>관계</span>
        <strong>${relationLabel}</strong>
      </div>
      <span class="city-status-note">상태: ${relationDescription}</span>
      <div class="domestic-yield-row">
        <span>활성 교역로</span>
        <strong>없음</strong>
      </div>
      <div class="relation-action-row">
        ${renderTradeControlButton(city, appState, false)}
      </div>
      ${cityRelationFactionId ? renderRelationActions(playerFactionId, cityRelationFactionId, relation, canUseRelationActions, isCooldownOrWar) : ""}
    </div>
  `;
}

function renderNumberControl(label, name, value) {
  return `
    <label class="trade-control-field">
      <span>${label}</span>
      <input class="trade-control-input" type="number" min="0" max="100" step="5" name="${name}" value="${value}">
    </label>
  `;
}

export function renderTradeControlModal(appState) {
  const cityId = appState?.ui?.tradeControlCityId ?? null;
  const city = appState?.world?.cities?.find((entry) => entry.id === cityId) ?? null;

  if (!city) {
    return "";
  }

  const settings = getCityTradeSettings(city);

  return `
    <div class="defense-choice-overlay trade-control-overlay" aria-live="polite">
      <section class="detail-card hud-panel battle-choice-card trade-control-modal" role="dialog" aria-modal="true" aria-label="무역 조정">
        <p class="eyebrow">Trade Control</p>
        <h3 class="detail-heading">무역 조정 - ${city.name}</h3>
        <div class="trade-control-grid">
          <label class="trade-control-field">
            <span>운영 방식</span>
            <select class="policy-select" name="mode" data-trade-control-mode="true">
              <option value="auto" ${settings.mode === "auto" ? "selected" : ""}>자동 운영</option>
              <option value="direct" ${settings.mode === "direct" ? "selected" : ""}>직할 운영</option>
            </select>
          </label>
          <label class="trade-control-field">
            <span>교역 강도</span>
            <select class="policy-select" name="intensity" data-trade-control-intensity="true">
              <option value="low" ${settings.intensity === "low" ? "selected" : ""}>낮음</option>
              <option value="normal" ${settings.intensity === "normal" ? "selected" : ""}>보통</option>
              <option value="high" ${settings.intensity === "high" ? "selected" : ""}>높음</option>
            </select>
          </label>
        </div>
        <div class="trade-control-grid">
          <div class="trade-control-group">
            <strong>수출 비중</strong>
            ${renderNumberControl("쌀", "export-rice", settings.exportWeights.rice)}
            ${renderNumberControl("보리", "export-barley", settings.exportWeights.barley)}
            ${renderNumberControl("수산물", "export-seafood", settings.exportWeights.seafood)}
            ${renderNumberControl("소금", "export-salt", settings.exportWeights.salt)}
            ${renderNumberControl("비단", "export-silk", settings.exportWeights.silk)}
          </div>
          <div class="trade-control-group">
            <strong>수입 우선</strong>
            ${renderNumberControl("금전", "import-gold", settings.importPriority.gold)}
            ${renderNumberControl("식량", "import-food", settings.importPriority.food)}
            ${renderNumberControl("소금", "import-salt", settings.importPriority.salt)}
            ${renderNumberControl("비단", "import-silk", settings.importPriority.silk)}
            <span class="city-status-note">목재 · 철 · 말 교역은 준비 중</span>
          </div>
        </div>
        <div class="battle-choice-actions">
          <button class="battle-choice-cancel" type="button" data-trade-control-auto-city-id="${city.id}">자동 운영으로 전환</button>
          <button class="attack-button battle-choice-button" type="button" data-trade-control-apply-city-id="${city.id}">적용</button>
          <button class="battle-choice-cancel" type="button" data-trade-control-close="true">닫기</button>
        </div>
      </section>
    </div>
  `;
}

function renderRelationActions(factionA, factionB, relation, canUseRelationActions, isCooldownOrWar) {
  const status = relation?.status ?? "neutral";
  const canPromote = canUseRelationActions && status === "neutral" && !isCooldownOrWar;
  const canPause = canUseRelationActions && ["neutral", "trade"].includes(status) && !isCooldownOrWar;
  const canResume = canUseRelationActions && status === "trade_paused" && !isCooldownOrWar;

  return `
    <div class="relation-action-row">
      <button class="relation-action-button" type="button" data-trade-relation-action="promote" data-relation-faction-a="${factionA}" data-relation-faction-b="${factionB}" ${canPromote ? "" : "disabled"}>교역 강화</button>
      <button class="relation-action-button" type="button" data-trade-relation-action="pause" data-relation-faction-a="${factionA}" data-relation-faction-b="${factionB}" ${canPause ? "" : "disabled"}>교역 중단</button>
      <button class="relation-action-button" type="button" data-trade-relation-action="resume" data-relation-faction-a="${factionA}" data-relation-faction-b="${factionB}" ${canResume ? "" : "disabled"}>교역 재개</button>
    </div>
  `;
}

function renderResourceSection(title, resourceKeys, resources) {
  return `
    <div class="city-domestic-section">
      <p class="city-domestic-heading">${title}</p>
      ${resourceKeys
        .map((resourceKey) => renderResourceRow(
          RESOURCE_LABELS[resourceKey],
          getResourceValue(resources, resourceKey),
        ))
        .join("")}
    </div>
  `;
}

export function renderCityResourceDetail(city) {
  const resources = city.resources ?? {};

  return `
    ${renderResourceSection("식량 자원", FOOD_RESOURCE_KEYS, resources)}
    ${renderResourceSection("전략 자원", STRATEGIC_RESOURCE_KEYS, resources)}
    ${renderResourceSection("특산 자원", SPECIALTY_RESOURCE_KEYS, resources)}
    <div class="city-domestic-section">
      <p class="city-domestic-heading">상업</p>
      ${renderCommerceRatingRow(city.commerceRating ?? 0)}
    </div>
  `;
}

export function renderCityInternalTradeDetail(city, appState = null) {
  return `
    ${renderSupplyTradeSection(city, appState)}
    ${renderTroopRebalanceSection(city, appState)}
  `;
}

export function renderCityExternalTradeDetail(city, appState = null) {
  return `
    ${renderExternalTradeSection(city, appState)}
  `;
}

export function renderResourcePanel(city, appState = null) {
  return `
    ${renderCityResourceDetail(city)}
    ${renderCityInternalTradeDetail(city, appState)}
    ${renderCityExternalTradeDetail(city, appState)}
  `;
}

function normalizeCityDetailTab(tab) {
  return CITY_DETAIL_TABS.some((entry) => entry.key === tab)
    ? tab
    : CITY_DETAIL_TAB_KEYS.RESOURCES;
}

function renderCityDetailTabs(activeTab) {
  return `
    <div class="city-detail-tabs" role="tablist" aria-label="도시 상세 탭">
      ${CITY_DETAIL_TABS.map((tab) => `
        <button
          class="city-detail-tab-button ${tab.key === activeTab ? "active" : ""}"
          type="button"
          role="tab"
          aria-selected="${tab.key === activeTab}"
          data-city-detail-tab="${tab.key}"
        >
          ${tab.label}
        </button>
      `).join("")}
    </div>
  `;
}

function renderCityDetailTabContent(city, appState, activeTab) {
  switch (activeTab) {
    case CITY_DETAIL_TAB_KEYS.INTERNAL_TRADE:
      return renderCityInternalTradeDetail(city, appState);
    case CITY_DETAIL_TAB_KEYS.EXTERNAL_TRADE:
      return renderCityExternalTradeDetail(city, appState);
    case CITY_DETAIL_TAB_KEYS.RESOURCES:
    default:
      return renderCityResourceDetail(city);
  }
}

export function renderCityDetailPanel(city, appState = null) {
  const activeTab = normalizeCityDetailTab(appState?.ui?.selectedCityDetailTab);

  if (!city) {
    return `
      <section class="detail-card hud-panel city-detail-panel">
        <p class="eyebrow">City Detail</p>
        <h3 class="detail-heading">도시 상세</h3>
        <p class="city-detail-copy">도시를 선택하세요.</p>
      </section>
    `;
  }

  return `
    <section class="detail-card hud-panel city-detail-panel">
      <p class="eyebrow">City Detail</p>
      <h3 class="detail-heading">도시 상세</h3>
      ${renderCityDetailTabs(activeTab)}
      <div class="city-detail-tab-content">
        ${renderCityDetailTabContent(city, appState, activeTab)}
      </div>
    </section>
  `;
}
