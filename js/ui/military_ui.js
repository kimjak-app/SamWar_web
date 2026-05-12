import {
  calculateCityDomesticEffects,
  calculateMilitaryPreview,
  getActiveChancellorHero,
  getActiveGovernorHero,
} from "../core/domestic_effects.js";

function getNumericValue(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
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

  return calculateMilitaryPreview(selectedCity, cityEffects);
}

export function renderCityMilitaryPanel(selectedCity, stationedHeroes = [], appState = null) {
  const military = appState ? getCityMilitaryPreview(selectedCity, appState) : (selectedCity?.military ?? {});
  const totalTroops = getStationedHeroTroops(stationedHeroes);
  const recruitableTroops = getNumericValue(military.recruitableTroops);

  return `
    <div class="city-military-panel city-domestic-section">
      <p class="city-domestic-heading">군대 상태</p>
      ${renderMilitaryRow("총 병력", totalTroops)}
      ${renderMilitaryRow("징병 가능", recruitableTroops)}
      ${renderMilitaryRow("군량 상태", military.foodStatus ?? "준비 중")}
      ${renderMilitaryRow("치안 상태", military.securityStatus ?? "병력 기반 계산 예정")}
    </div>
  `;
}
