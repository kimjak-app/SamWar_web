import {
  getFactionRelation,
  getFactionRelationDescription,
  getFactionRelationLabel,
} from "../core/inter_faction_trade.js";
import { getFactionById } from "../core/world_rules.js";

const DIPLOMACY_SPY_TABS = Object.freeze({
  DIPLOMACY: "diplomacy",
  SPY: "spy",
});

function normalizeDiplomacySpyTab(tab) {
  return Object.values(DIPLOMACY_SPY_TABS).includes(tab)
    ? tab
    : DIPLOMACY_SPY_TABS.DIPLOMACY;
}

function getFactionName(appState, factionId) {
  return getFactionById(appState?.world?.factions ?? [], factionId)?.name
    ?? factionId
    ?? "미상 세력";
}

function getRelationSummary(appState, selectedCity) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";
  const cityFactionId = selectedCity?.ownerFactionId ?? null;

  if (!cityFactionId) {
    return {
      label: "관계 미확인",
      description: "세력 정보를 확인 중입니다.",
    };
  }

  if (cityFactionId === playerFactionId) {
    return {
      label: "자국 도시",
      description: "동일 세력 소유 도시입니다.",
    };
  }

  const relation = getFactionRelation(appState, playerFactionId, cityFactionId);
  return {
    label: getFactionRelationLabel(relation),
    description: getFactionRelationDescription(relation),
  };
}

function renderDiplomacySpyTabButton(tab, activeTab) {
  const label = tab === DIPLOMACY_SPY_TABS.DIPLOMACY ? "외교" : "첩보";

  return `
    <button
      class="diplomacy-spy-tab-button ${tab === activeTab ? "active" : ""}"
      type="button"
      data-diplomacy-spy-tab="${tab}"
      aria-pressed="${tab === activeTab}"
    >
      ${label}
    </button>
  `;
}

function renderDiplomacyContent(appState, selectedCity) {
  const ownerFactionName = getFactionName(appState, selectedCity?.ownerFactionId);
  const relationSummary = getRelationSummary(appState, selectedCity);

  return `
    <div class="diplomacy-spy-content">
      <div class="diplomacy-spy-section">
        <p class="city-domestic-heading">외교 현황</p>
        <div class="domestic-yield-row">
          <span>선택 도시</span>
          <strong>${selectedCity?.name ?? "미선택"}</strong>
        </div>
        <div class="domestic-yield-row">
          <span>소유 세력</span>
          <strong>${ownerFactionName}</strong>
        </div>
        <div class="domestic-yield-row">
          <span>관계 상태</span>
          <strong>${relationSummary.label}</strong>
        </div>
        <span class="city-status-note">${relationSummary.description}</span>
      </div>
      <div class="diplomacy-spy-section">
        <p class="city-domestic-heading">외교 행동</p>
        <div class="domestic-yield-row">
          <span>사절 교환</span>
          <strong>준비 중</strong>
        </div>
        <div class="domestic-yield-row">
          <span>교섭 요청</span>
          <strong>준비 중</strong>
        </div>
        <div class="domestic-yield-row">
          <span>교역 압박</span>
          <strong>준비 중</strong>
        </div>
        <span class="city-status-note">외교 행동은 준비 중입니다.</span>
      </div>
    </div>
  `;
}

function renderSpyContent() {
  return `
    <div class="diplomacy-spy-content">
      <div class="diplomacy-spy-section">
        <p class="city-domestic-heading">첩보 가시성</p>
        <div class="domestic-yield-row">
          <span>정보 등급</span>
          <strong><span class="intel-visibility-chip">기초 정보</span></strong>
        </div>
        <div class="domestic-yield-row">
          <span>자원 정보</span>
          <strong>제한 공개</strong>
        </div>
        <div class="domestic-yield-row">
          <span>병력 정보</span>
          <strong>제한 공개</strong>
        </div>
        <span class="city-status-note">성주 / 재상 정보는 준비 중입니다.</span>
      </div>
      <div class="diplomacy-spy-section">
        <p class="city-domestic-heading">첩보 행동</p>
        <div class="domestic-yield-row">
          <span>정탐</span>
          <strong>Scaffold</strong>
        </div>
        <div class="domestic-yield-row">
          <span>유언비어</span>
          <strong>Scaffold</strong>
        </div>
        <div class="domestic-yield-row">
          <span>내통 시도</span>
          <strong>Scaffold</strong>
        </div>
        <span class="city-status-note">첩보 계산과 성공/실패 판정은 후속 버전에서 연결합니다.</span>
      </div>
    </div>
  `;
}

export function renderDiplomacySpyPanel({ appState, selectedCity }) {
  const activeTab = normalizeDiplomacySpyTab(appState?.ui?.selectedDiplomacySpyTab);
  const isOpen = appState?.ui?.isDiplomacySpyOpen !== false;

  if (!isOpen) {
    return `
      <section class="detail-card hud-panel diplomacy-spy-panel diplomacy-spy-panel-collapsed">
        <button class="diplomacy-spy-collapsed-card" type="button" data-diplomacy-spy-toggle="open">
          외교 · 첩보 열기
        </button>
      </section>
    `;
  }

  if (!selectedCity) {
    return `
      <section class="detail-card hud-panel diplomacy-spy-panel">
        <div class="diplomacy-spy-panel-header">
          <div>
            <p class="eyebrow">Diplomacy / Spy</p>
            <h3 class="detail-heading">외교 · 첩보</h3>
          </div>
          <button class="diplomacy-spy-toggle-button" type="button" data-diplomacy-spy-toggle="close">접기</button>
        </div>
        <div class="diplomacy-spy-tabs" role="tablist" aria-label="외교 첩보 탭">
          ${Object.values(DIPLOMACY_SPY_TABS).map((tab) => renderDiplomacySpyTabButton(tab, activeTab)).join("")}
        </div>
        <p class="city-detail-copy">도시를 선택하세요.</p>
      </section>
    `;
  }

  return `
    <section class="detail-card hud-panel diplomacy-spy-panel">
      <div class="diplomacy-spy-panel-header">
        <div>
          <p class="eyebrow">Diplomacy / Spy</p>
          <h3 class="detail-heading">외교 · 첩보</h3>
        </div>
        <button class="diplomacy-spy-toggle-button" type="button" data-diplomacy-spy-toggle="close">접기</button>
      </div>
      <div class="diplomacy-spy-tabs" role="tablist" aria-label="외교 첩보 탭">
        ${Object.values(DIPLOMACY_SPY_TABS).map((tab) => renderDiplomacySpyTabButton(tab, activeTab)).join("")}
      </div>
      ${
        activeTab === DIPLOMACY_SPY_TABS.SPY
          ? renderSpyContent()
          : renderDiplomacyContent(appState, selectedCity)
      }
    </section>
  `;
}
