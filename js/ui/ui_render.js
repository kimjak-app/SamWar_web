import { canAttackCity, getFactionById, isPlayerCity, isWorldUnified } from "../core/world_rules.js";
import { renderHeroDeploymentPanel, renderHeroTransferPanel } from "./hero_transfer_ui.js";
import { renderTradeControlModal } from "./resource_ui.js";
import { renderSelectedCityPanel } from "./selected_city_ui.js";
import { renderWorldHud } from "./world_hud_ui.js";

function buildCityMap(cities) {
  return new Map(cities.map((city) => [city.id, city]));
}

function getSelectedCity(appState) {
  const cityMap = buildCityMap(appState.world.cities);
  return cityMap.get(appState.selection.cityId) ?? appState.world.cities[0];
}

function getStationedHeroes(heroes, selectedCity) {
  return heroes.filter((hero) => hero.locationCityId === selectedCity.id);
}

function getCityEdges(cities) {
  const seen = new Set();
  const edges = [];

  for (const city of cities) {
    for (const neighborId of city.neighbors) {
      const edgeKey = [city.id, neighborId].sort().join("--");

      if (seen.has(edgeKey)) {
        continue;
      }

      seen.add(edgeKey);
      edges.push([city.id, neighborId]);
    }
  }

  return edges;
}

function getCityLabelClass(cityId) {
  switch (cityId) {
    case "luoyang":
      return "label-east";
    case "pyeongyang":
      return "label-east label-north";
    case "hanseong":
      return "label-east label-south";
    case "kyoto":
      return "label-west label-north";
    default:
      return "label-east";
  }
}

function renderRouteLayer(cities) {
  const cityEdges = getCityEdges(cities);

  return `
    <svg class="route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${cityEdges
        .map(([fromId, toId]) => {
          const fromCity = cities.find((city) => city.id === fromId);
          const toCity = cities.find((city) => city.id === toId);

          if (!fromCity || !toCity) {
            return "";
          }

          return `
            <line
              class="route-line"
              x1="${fromCity.x}"
              y1="${fromCity.y}"
              x2="${toCity.x}"
              y2="${toCity.y}"
            ></line>
          `;
        })
        .join("")}
    </svg>
  `;
}

function renderCityLayer(world, selectedCity) {
  return `
    <div class="city-layer" aria-label="World map city anchors">
      ${world.cities
        .map((city) => {
          const faction = getFactionById(world.factions, city.ownerFactionId);
          const isSelected = city.id === selectedCity.id;
          const statusLabel = isPlayerCity(city) ? "아군" : "적군";
          const labelClass = getCityLabelClass(city.id);

          return `
            <button
              class="city-node ${labelClass} ${isSelected ? "is-selected" : ""} ${isPlayerCity(city) ? "is-friendly" : "is-hostile"}"
              type="button"
              data-city-id="${city.id}"
              style="left: ${city.x}%; top: ${city.y}%; --city-color: ${faction?.color ?? "#d3b273"};"
              aria-pressed="${isSelected}"
            >
              <span class="city-pip"></span>
              <span class="city-label">
                <span class="city-name">${city.name}</span>
                <span class="city-meta">${statusLabel}</span>
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderBattleChoicePanel(pendingBattleChoice) {
  if (!pendingBattleChoice) {
    return "";
  }

  return `
    <section class="detail-card hud-panel battle-choice-card" aria-live="polite">
      <p class="eyebrow">${pendingBattleChoice.eyebrow ?? "Battle Mode"}</p>
      <h3 class="detail-heading">${pendingBattleChoice.title ?? "전투 방식을 선택하세요"}</h3>
      <div class="battle-choice-summary">
        <p class="battle-choice-line">${pendingBattleChoice.type === "defense" ? "침공 도시" : "출발 도시"}: ${pendingBattleChoice.originCityName}</p>
        <p class="battle-choice-line">${pendingBattleChoice.type === "defense" ? "방어 도시" : "목표 도시"}: ${pendingBattleChoice.targetCityName}</p>
        ${pendingBattleChoice.description ? `<p class="battle-choice-line battle-choice-copy">${pendingBattleChoice.description}</p>` : ""}
        ${pendingBattleChoice.isRemoteBattle ? '<p class="battle-choice-note">원격 침공</p>' : ""}
      </div>
      <div class="battle-choice-actions">
        <button class="attack-button battle-choice-button" type="button" data-battle-choice="manual" data-battle-choice-city-id="${pendingBattleChoice.targetCityId}">
          ${pendingBattleChoice.confirmManualLabel ?? "직접 지휘"}
        </button>
        <button class="attack-button battle-choice-button battle-choice-button-auto" type="button" data-battle-choice="auto" data-battle-choice-city-id="${pendingBattleChoice.targetCityId}">
          ${pendingBattleChoice.confirmAutoLabel ?? "자동 위임"}
        </button>
        ${pendingBattleChoice.showCancel ? `
          <button class="battle-choice-cancel" type="button" data-battle-choice="cancel">
            취소
          </button>
        ` : ""}
      </div>
    </section>
  `;
}

function renderDefenseChoiceModal(pendingBattleChoice) {
  if (pendingBattleChoice?.type !== "defense") {
    return "";
  }

  return `
    <div class="defense-choice-overlay" aria-live="polite">
      <section class="detail-card hud-panel battle-choice-card defense-choice-modal">
        <p class="eyebrow">${pendingBattleChoice.eyebrow ?? "Enemy Invasion"}</p>
        <h3 class="detail-heading">${pendingBattleChoice.title ?? "적군이 침공했습니다!"}</h3>
        <div class="battle-choice-summary">
          <p class="battle-choice-line">침공 도시: ${pendingBattleChoice.originCityName}</p>
          <p class="battle-choice-line">방어 도시: ${pendingBattleChoice.targetCityName}</p>
          ${pendingBattleChoice.description ? `<p class="battle-choice-line battle-choice-copy">${pendingBattleChoice.description}</p>` : ""}
        </div>
        <div class="battle-choice-actions">
          <button class="attack-button battle-choice-button" type="button" data-battle-choice="manual" data-battle-choice-city-id="${pendingBattleChoice.targetCityId}">
            ${pendingBattleChoice.confirmManualLabel ?? "직접 방어"}
          </button>
          <button class="attack-button battle-choice-button battle-choice-button-auto" type="button" data-battle-choice="auto" data-battle-choice-city-id="${pendingBattleChoice.targetCityId}">
            ${pendingBattleChoice.confirmAutoLabel ?? "자동 방어"}
          </button>
        </div>
      </section>
    </div>
  `;
}

export function renderAllWorldUI(appState) {
  const { world } = appState;
  const selectedCity = getSelectedCity(appState);
  const stationedHeroes = getStationedHeroes(world.heroes, selectedCity);
  const selectedFaction = getFactionById(world.factions, selectedCity.ownerFactionId);
  const attackable = canAttackCity(world.cities, selectedCity);
  const unified = isWorldUnified(world.cities);
  const { pendingBattleChoice, pendingHeroDeployment, pendingHeroTransfer } = appState;
  const playerOwnedCityCount = world.cities.filter((city) => isPlayerCity(city)).length;
  const canEndTurn = world.turnOwner === "player"
    && !pendingBattleChoice
    && !pendingHeroDeployment
    && !pendingHeroTransfer
    && !world.pendingEnemyTurnResult;
  const canOpenAttackChoice = canEndTurn && attackable;
  const canOpenHeroTransfer = canEndTurn && isPlayerCity(selectedCity);
  const hasHeroTransferDestination = playerOwnedCityCount > 1;
  const rightSideBattleChoice = pendingBattleChoice?.type === "defense" ? null : pendingBattleChoice;

  return `
    <main class="map-screen">
      <section class="world-stage" aria-label="SamWar world map">
        <div class="map-image" aria-hidden="true"></div>
        <div class="map-overlay" aria-hidden="true"></div>

        ${renderRouteLayer(world.cities)}
        ${renderCityLayer(world, selectedCity)}
        ${renderWorldHud(appState, { canEndTurn, unified })}

        <aside class="hud-stack" aria-label="Selected city details">
          ${renderSelectedCityPanel({
            appState,
            selectedCity,
            selectedFaction,
            stationedHeroes,
            canOpenHeroTransfer,
            hasHeroTransferDestination,
            canOpenAttackChoice,
          })}

          ${renderBattleChoicePanel(rightSideBattleChoice)}
        </aside>
        ${renderDefenseChoiceModal(pendingBattleChoice)}
        ${renderHeroDeploymentPanel(pendingHeroDeployment)}
        ${renderHeroTransferPanel(pendingHeroTransfer)}
        ${renderTradeControlModal(appState)}
      </section>
    </main>
  `;
}
