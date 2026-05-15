import { canAttackCity, getFactionById, isPlayerCity, isWorldUnified } from "../core/world_rules.js";
import { renderDiplomacySpyPanel } from "./diplomacy_spy_ui.js";
import { renderHeroDeploymentPanel, renderHeroTransferPanel } from "./hero_transfer_ui.js";
import { renderCityDetailPanel, renderTradeControlModal } from "./resource_ui.js";
import { renderSelectedCityPanel } from "./selected_city_ui.js";
import { renderWorldHud } from "./world_hud_ui.js";

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(color) {
  const normalized = color?.trim().replace("#", "");

  if (!normalized || ![3, 6].includes(normalized.length)) {
    return null;
  }

  const expanded = normalized.length === 3
    ? normalized.split("").map((channel) => channel + channel).join("")
    : normalized;

  const value = Number.parseInt(expanded, 16);

  if (Number.isNaN(value)) {
    return null;
  }

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgbToRgba({ r, g, b }, alpha = 1) {
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${normalizedAlpha})`;
}

function mixColors(colorA, colorB, ratio = 0.5) {
  const weight = Math.max(0, Math.min(1, ratio));

  return {
    r: colorA.r + ((colorB.r - colorA.r) * weight),
    g: colorA.g + ((colorB.g - colorA.g) * weight),
    b: colorA.b + ((colorB.b - colorA.b) * weight),
  };
}

function getRelativeLuminance({ r, g, b }) {
  const toLinear = (channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (0.2126 * toLinear(r)) + (0.7152 * toLinear(g)) + (0.0722 * toLinear(b));
}

function getCityLabelTheme(color) {
  const fallback = {
    labelBg: "rgba(31, 48, 68, 0.62)",
    labelBgStrong: "rgba(31, 48, 68, 0.68)",
    labelText: "#f6efdf",
    labelBorder: "rgba(12, 18, 28, 0.28)",
    labelBorderStrong: "rgba(248, 215, 152, 0.58)",
    labelShadow: "rgba(0, 0, 0, 0.1)",
  };
  const rgb = hexToRgb(color);

  if (!rgb) {
    return fallback;
  }

  const luminance = getRelativeLuminance(rgb);
  const brightLabel = luminance > 0.42;
  const baseColor = brightLabel
    ? rgbToHex(mixColors(rgb, { r: 255, g: 255, b: 255 }, 0.08))
    : rgbToHex(mixColors(rgb, { r: 0, g: 0, b: 0 }, 0.08));
  const baseRgb = hexToRgb(baseColor) ?? rgb;

  return {
    labelBg: rgbToRgba(baseRgb, brightLabel ? 0.58 : 0.64),
    labelBgStrong: rgbToRgba(baseRgb, brightLabel ? 0.64 : 0.7),
    labelText: brightLabel ? "#0f1722" : "#f6efdf",
    labelBorder: brightLabel
      ? "rgba(12, 18, 28, 0.24)"
      : "rgba(12, 18, 28, 0.34)",
    labelBorderStrong: brightLabel
      ? "rgba(12, 18, 28, 0.44)"
      : "rgba(248, 215, 152, 0.62)",
    labelShadow: brightLabel ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.12)",
  };
}

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

      const neighborCity = cities.find((entry) => entry.id === neighborId);
      const routeType = city.routeTypes?.[neighborId]
        ?? neighborCity?.routeTypes?.[city.id]
        ?? "land";

      seen.add(edgeKey);
      edges.push({ fromId: city.id, toId: neighborId, routeType });
    }
  }

  return edges;
}

function getCityLabelClass(cityId) {
  switch (cityId) {
    case "luoyang":
    case "yecheng":
    case "chengdu":
      return "label-west";
    case "jianye":
      return "label-east label-south";
    case "pyeongyang":
      return "label-east label-north";
    case "hanseong":
      return "label-east";
    case "gyeongju":
      return "label-east label-south";
    case "kyoto":
      return "label-west label-north";
    case "osaka":
      return "label-west label-south";
    case "edo":
      return "label-west";
    default:
      return "label-east";
  }
}

function renderRouteLayer(cities) {
  const cityEdges = getCityEdges(cities);

  return `
    <svg class="route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${cityEdges
        .filter(({ routeType }) => routeType === "sea")
        .map(({ fromId, toId, routeType }) => {
          const fromCity = cities.find((city) => city.id === fromId);
          const toCity = cities.find((city) => city.id === toId);

          if (!fromCity || !toCity) {
            return "";
          }

          return `
            <line
              class="route-line ${routeType === "sea" ? "route-line-sea" : "route-line-land"}"
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

function renderCityLayer(world, selectedCity, { debugCityDragMode = false } = {}) {
  return `
    <div class="city-layer ${debugCityDragMode ? "is-coordinate-mode" : ""}" aria-label="World map city anchors">
      ${world.cities
        .map((city) => {
          const faction = getFactionById(world.factions, city.ownerFactionId);
          const isSelected = city.id === selectedCity.id;
          const labelClass = getCityLabelClass(city.id);
          const labelTheme = getCityLabelTheme(faction?.color);
          const cityStyle = [
            `left: ${city.x}%`,
            `top: ${city.y}%`,
            `--city-color: ${faction?.color ?? "#d3b273"}`,
            `--city-label-bg: ${labelTheme.labelBg}`,
            `--city-label-bg-strong: ${labelTheme.labelBgStrong}`,
            `--city-label-text: ${labelTheme.labelText}`,
            `--city-label-border: ${labelTheme.labelBorder}`,
            `--city-label-border-strong: ${labelTheme.labelBorderStrong}`,
            `--city-label-shadow: ${labelTheme.labelShadow}`,
          ].join("; ");

          return `
            <button
              class="city-node ${labelClass} ${isSelected ? "is-selected" : ""} ${isPlayerCity(city) ? "is-friendly" : "is-hostile"}"
              type="button"
              data-city-id="${city.id}"
              style="${cityStyle}"
              aria-pressed="${isSelected}"
            >
              ${debugCityDragMode ? `
                <span class="city-coordinate-label" data-city-coordinate-label="${city.id}">
                  ${city.id} ${Math.round(city.x)},${Math.round(city.y)}
                </span>
              ` : ""}
              <span class="city-pip"></span>
              <span class="city-label">
                <span class="city-name">${city.name}</span>
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderWorldDebugToolbar({ debugCityDragMode = false } = {}) {
  return `
    <div class="world-debug-toolbar" aria-label="World map debug tools">
      <button
        class="world-debug-toggle ${debugCityDragMode ? "is-active" : ""}"
        type="button"
        data-debug-city-drag-toggle="true"
        aria-pressed="${debugCityDragMode}"
      >
        좌표 모드
      </button>
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

export function renderAllWorldUI(appState, options = {}) {
  const { world } = appState;
  const { debugCityDragMode = false } = options;
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
        ${renderCityLayer(world, selectedCity, { debugCityDragMode })}
        ${renderWorldDebugToolbar({ debugCityDragMode })}
        ${renderWorldHud(appState, { canEndTurn, unified })}

        <aside class="hud-stack city-hud-stack" aria-label="Selected city details" data-city-hud-panel="true">
          <div class="selected-city-layout selected-city-layout-with-intel">
            <div class="city-hud-dragbar" data-city-hud-drag-handle="true">
              <span>도시 HUD 위치 이동</span>
              <button class="city-hud-reset-button" type="button" data-city-hud-reset="true">
                초기화
              </button>
            </div>
            ${renderDiplomacySpyPanel({ appState, selectedCity })}
            ${renderCityDetailPanel({ appState, selectedCity })}
            <div class="selected-city-summary-panel">
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
            </div>
          </div>
        </aside>
        ${renderDefenseChoiceModal(pendingBattleChoice)}
        ${renderHeroDeploymentPanel(pendingHeroDeployment)}
        ${renderHeroTransferPanel(pendingHeroTransfer)}
        ${renderTradeControlModal(appState)}
      </section>
    </main>
  `;
}
