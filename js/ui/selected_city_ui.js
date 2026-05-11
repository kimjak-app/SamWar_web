import { CITY_TYPE_LABELS, LOYALTY_LABELS, LOYALTY_KEYS } from "../constants.js";
import { canAttackCity, isEnemyCity, isPlayerCity, isWorldUnified } from "../core/world_rules.js";
import { renderDomesticPanel } from "./domestic_ui.js";
import { renderGarrisonPanel } from "./garrison_ui.js";
import { renderResourcePanel } from "./resource_ui.js";

function getStatusText(cities, selectedCity) {
  if (isWorldUnified(cities)) {
    return "천하통일! 동아시아를 통일했습니다.";
  }

  if (canAttackCity(cities, selectedCity)) {
    return "공격을 누르면 출전 무장 선택 후 Phaser 전투 화면으로 진입합니다.";
  }

  if (isPlayerCity(selectedCity)) {
    return "아군 거점입니다. 인접한 적 도시가 있으면 전투 방식 선택 뒤 공격을 시작할 수 있습니다.";
  }

  if (isEnemyCity(selectedCity)) {
    return "적 도시입니다. 아군 인접 거점이 없으면 아직 공격할 수 없습니다.";
  }

  return "전투 시스템은 다음 버전에서 구현 예정입니다.";
}

function renderCityDomesticPanel(selectedCity) {
  return `
    <div class="city-domestic-panel">
      ${renderDomesticPanel(selectedCity)}
      ${renderResourcePanel(selectedCity)}
    </div>
  `;
}

function renderCityProfile(selectedCity) {
  const cityTypeLabel = CITY_TYPE_LABELS[selectedCity.type] ?? selectedCity.type ?? "미정";
  const cityLoyalty = selectedCity[LOYALTY_KEYS.CITY] ?? selectedCity.loyalty ?? 75;

  return `
    <p class="city-detail-meta city-detail-submeta">
      유형: ${cityTypeLabel} · ${LOYALTY_LABELS[LOYALTY_KEYS.CITY]} ${cityLoyalty}
    </p>
  `;
}

export function renderSelectedCityPanel({
  appState,
  selectedCity,
  selectedFaction,
  stationedHeroes,
  canOpenHeroTransfer,
  hasHeroTransferDestination,
  canOpenAttackChoice,
}) {
  const { world } = appState;

  return `
    <section class="detail-card hud-panel">
      <p class="eyebrow">Selected City</p>
      <h2 class="city-detail-name">${selectedCity.name}</h2>
      <p class="city-detail-meta">
        ${selectedCity.region} · ${selectedFaction?.name ?? "중립"}
      </p>
      ${renderCityProfile(selectedCity)}
      <p class="city-detail-copy">${getStatusText(world.cities, selectedCity)}</p>
      ${renderGarrisonPanel(stationedHeroes)}
      ${
        canOpenHeroTransfer
          ? `
            <button
              class="attack-button hero-transfer-inline-button"
              type="button"
              data-hero-transfer-open-city-id="${selectedCity.id}"
              ${hasHeroTransferDestination ? "" : "disabled"}
            >
              무장 이동
            </button>
            ${hasHeroTransferDestination ? "" : '<p class="attack-note">이동 가능한 아군 성이 없습니다.</p>'}
          `
          : ""
      }
      ${renderCityDomesticPanel(selectedCity)}
      ${
        canOpenAttackChoice
          ? `
            <button class="attack-button" type="button" data-attack-city-id="${selectedCity.id}">
              공격
            </button>
            <p class="attack-note">공격을 누르면 출전 무장을 선택한 뒤 전투를 시작합니다.</p>
          `
          : `
            <p class="attack-note">${
              world.turnOwner === "enemy"
                ? "적군 턴에는 턴 결과를 확인하거나 방어 방식을 선택해야 합니다."
                : "전투 화면은 공격 가능한 적 도시를 선택했을 때만 진입합니다."
            }</p>
          `
      }
    </section>
  `;
}
