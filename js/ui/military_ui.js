import {
  RECRUIT_TROOP_BATCH_SIZE,
  calculateRecruitmentCost,
} from "../core/app_state.js";
import { RESOURCE_KEYS, RESOURCE_LABELS } from "../constants.js";
import {
  calculateRecruitmentRatioState,
  calculateCityDomesticEffects,
  calculateMilitaryPreview,
  getActiveChancellorHero,
  getActiveGovernorHero,
} from "../core/domestic_effects.js";

function getNumericValue(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function getStationedHeroTroops(stationedHeroes = []) {
  // Scaffold only: this currently sums hero troops, not a separate city garrison pool.
  return stationedHeroes.reduce((total, hero) => total + getNumericValue(hero?.troops), 0);
}

function renderMilitaryRow(label, value) {
  return `
    <div class="domestic-resource-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function formatRecruitmentCost(cost = {}) {
  return [
    RESOURCE_KEYS.GOLD,
    RESOURCE_KEYS.BARLEY,
    RESOURCE_KEYS.RICE,
  ].map((resourceKey) => `${RESOURCE_LABELS[resourceKey]} ${cost[resourceKey] ?? 0}`).join(" / ");
}

function formatNumber(value) {
  return Math.round(getNumericValue(value)).toLocaleString("ko-KR");
}

function formatPercent(value) {
  return `${(getNumericValue(value) * 100).toFixed(1)}%`;
}

function renderRecruitmentRatioPanel(ratioState, securityRequiredTroops) {
  const fillPercent = Math.min(100, Math.max(0, (ratioState.recruitmentRatio / ratioState.maxTroopRatio) * 100));

  return `
    <div class="recruitment-ratio-panel recruitment-tier-${ratioState.tier}">
      <div class="recruitment-ratio-header">
        <span>모집비율: <strong>${formatPercent(ratioState.recruitmentRatio)}</strong> · ${ratioState.status}</span>
      </div>
      <div class="recruitment-ratio-bar" aria-hidden="true">
        <span class="recruitment-ratio-fill" style="width: ${fillPercent}%;"></span>
      </div>
      <span class="city-status-note">치안 기준: ${formatNumber(securityRequiredTroops)} / 현재 주둔군: ${formatNumber(ratioState.garrisonTroops)}</span>
    </div>
  `;
}

function getWoundedQueue(military = {}) {
  return Array.isArray(military.woundedQueue) ? military.woundedQueue : [];
}

function getWoundedTotal(military = {}) {
  return getWoundedQueue(military).reduce((total, entry) => total + getNumericValue(entry?.troops), 0);
}

function hasEnoughResources(resources = {}, cost = {}) {
  return Object.entries(cost).every(([resourceKey, amount]) => (
    (resources?.[resourceKey] ?? 0) >= amount
  ));
}

function canUseRecruitmentUi(selectedCity, appState) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";

  return Boolean(
    appState
    && selectedCity?.ownerFactionId === playerFactionId
    && appState.mode === "world"
    && !appState.battle
    && appState?.world?.turnOwner === "player"
    && !appState.pendingBattleChoice
    && !appState.pendingHeroDeployment
    && !appState.pendingHeroTransfer
    && !appState?.world?.pendingEnemyTurnResult
  );
}

function renderRecruitmentAction(selectedCity, military, appState) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";

  if (!appState || selectedCity?.ownerFactionId !== playerFactionId) {
    return "";
  }

  const ratioState = calculateRecruitmentRatioState(selectedCity);
  const recruitableTroops = ratioState.remainingRecruitCapacity;
  const recruitAmount = Math.min(RECRUIT_TROOP_BATCH_SIZE, recruitableTroops);
  const cost = calculateRecruitmentCost(recruitAmount);
  const enoughResources = hasEnoughResources(appState.resources, cost);
  const canRecruit = canUseRecruitmentUi(selectedCity, appState) && recruitAmount > 0 && enoughResources;
  const disabledReason = recruitableTroops <= 0
    ? "모집 한계"
    : (!enoughResources ? "자원 부족" : "지금은 모집할 수 없습니다.");

  return `
    <button
      class="attack-button city-recruit-button"
      type="button"
      data-recruit-city-id="${selectedCity.id}"
      data-recruit-amount="${RECRUIT_TROOP_BATCH_SIZE}"
      ${canRecruit ? "" : "disabled"}
    >
      병사 ${recruitAmount > 0 ? recruitAmount : RECRUIT_TROOP_BATCH_SIZE} 모집
    </button>
    <span class="attack-note">비용: ${formatRecruitmentCost(cost)}</span>
    ${canRecruit ? "" : `<span class="attack-note">${disabledReason}</span>`}
  `;
}

function renderBattleTroopResult(selectedCity, appState) {
  const result = appState?.world?.lastBattleTroopResult;

  if (!result || ![result.sourceCityId, result.returnCityId].includes(selectedCity?.id)) {
    return "";
  }

  return `
    <span class="city-status-note">
      전투 병력 결과: 생존 ${formatNumber(result.survivors)} · 부상 ${formatNumber(result.wounded)} · 전사 ${formatNumber(result.dead)}
    </span>
  `;
}

function getCityMilitaryPreview(selectedCity, appState) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";

  if (selectedCity?.ownerFactionId !== playerFactionId) {
    return selectedCity?.military ?? {};
  }

  const chancellorHero = getActiveChancellorHero(
    appState?.world?.heroes,
    appState?.domesticPolicy,
    playerFactionId,
  );
  const governorHero = getActiveGovernorHero(selectedCity, appState?.world?.heroes, playerFactionId);
  const cityEffects = calculateCityDomesticEffects({
    city: selectedCity,
    governorHero,
    chancellorHero,
    domesticPolicy: appState?.domesticPolicy,
  });

  return calculateMilitaryPreview(selectedCity, cityEffects, {
    heroes: appState?.world?.heroes,
  });
}

export function renderCityMilitaryPanel(selectedCity, stationedHeroes = [], appState = null) {
  const military = appState ? getCityMilitaryPreview(selectedCity, appState) : (selectedCity?.military ?? {});
  const garrisonTroops = getNumericValue(military.garrisonTroops ?? selectedCity?.military?.garrisonTroops);
  const defenseRating = getNumericValue(military.defenseRating);
  const population = getNumericValue(military.population ?? selectedCity?.population);
  const securityRequiredTroops = getNumericValue(military.securityRequiredTroops ?? selectedCity?.military?.securityRequiredTroops);
  const ratioState = calculateRecruitmentRatioState({
    ...selectedCity,
    population,
    military: {
      ...(selectedCity?.military ?? {}),
      garrisonTroops,
      maxTroopRatio: military.maxTroopRatio ?? selectedCity?.military?.maxTroopRatio,
      optimalTroopRatio: military.optimalTroopRatio ?? selectedCity?.military?.optimalTroopRatio,
    },
  });

  return `
    <div class="city-military-panel city-domestic-section">
      <p class="city-domestic-heading">군대 상태</p>
      ${renderMilitaryRow("도시 인구", formatNumber(population))}
      ${renderRecruitmentRatioPanel(ratioState, securityRequiredTroops)}
      ${renderMilitaryRow("도시 주둔군", garrisonTroops)}
      ${renderMilitaryRow("부상병", getWoundedTotal(selectedCity?.military ?? military))}
      ${renderMilitaryRow("군량 상태", military.foodStatus ?? "준비 중")}
      ${renderMilitaryRow("치안 상태", military.securityStatus ?? "병력 기반 계산 예정")}
      ${renderMilitaryRow("방어력", defenseRating)}
      ${renderBattleTroopResult(selectedCity, appState)}
      ${renderRecruitmentAction(selectedCity, military, appState)}
    </div>
  `;
}
