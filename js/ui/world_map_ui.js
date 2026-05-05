import { canAttackCity, getFactionById, isEnemyCity, isPlayerCity, isWorldUnified } from "../core/world_rules.js";

function buildCityMap(cities) {
  return new Map(cities.map((city) => [city.id, city]));
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

function getSelectedCity(appState) {
  const cityMap = buildCityMap(appState.world.cities);
  return cityMap.get(appState.selection.cityId) ?? appState.world.cities[0];
}

function getLinkedCities(cities, selectedCity) {
  const cityMap = buildCityMap(cities);
  return selectedCity.neighbors
    .map((neighborId) => cityMap.get(neighborId))
    .filter(Boolean);
}

function getStatusText(cities, selectedCity) {
  if (isWorldUnified(cities)) {
    return "천하통일! 동아시아를 통일했습니다.";
  }

  if (canAttackCity(cities, selectedCity)) {
    return "공격을 누르면 전투 방식 선택 후 Phaser 전투 화면으로 진입합니다.";
  }

  if (isPlayerCity(selectedCity)) {
    return "아군 거점입니다. 인접한 적 도시가 있으면 전투 방식 선택 뒤 공격을 시작할 수 있습니다.";
  }

  if (isEnemyCity(selectedCity)) {
    return "적 도시입니다. 아군 인접 거점이 없으면 아직 공격할 수 없습니다.";
  }

  return "전투 시스템은 다음 버전에서 구현 예정입니다.";
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

function renderBattleChoicePanel(pendingBattleChoice) {
  if (!pendingBattleChoice) {
    return "";
  }

  return `
    <section class="detail-card hud-panel battle-choice-card" aria-live="polite">
      <p class="eyebrow">Battle Mode</p>
      <h3 class="detail-heading">전투 방식을 선택하세요</h3>
      <div class="battle-choice-summary">
        <p class="battle-choice-line">출발 도시: ${pendingBattleChoice.originCityName}</p>
        <p class="battle-choice-line">목표 도시: ${pendingBattleChoice.targetCityName}</p>
        ${pendingBattleChoice.isRemoteBattle ? '<p class="battle-choice-note">원격 침공</p>' : ""}
      </div>
      <div class="battle-choice-actions">
        <button class="attack-button battle-choice-button" type="button" data-battle-choice="manual" data-battle-choice-city-id="${pendingBattleChoice.targetCityId}">
          직접 지휘
        </button>
        <button class="attack-button battle-choice-button battle-choice-button-auto" type="button" data-battle-choice="auto" data-battle-choice-city-id="${pendingBattleChoice.targetCityId}">
          자동 위임
        </button>
        <button class="battle-choice-cancel" type="button" data-battle-choice="cancel">
          취소
        </button>
      </div>
    </section>
  `;
}

export function renderWorldMap(rootElement, appState, handlers = {}) {
  const { meta, world } = appState;
  const { onCitySelect, onAttackCity, onBattleChoiceConfirm, onBattleChoiceCancel } = handlers;
  const selectedCity = getSelectedCity(appState);
  const linkedCities = getLinkedCities(world.cities, selectedCity);
  const cityEdges = getCityEdges(world.cities);
  const selectedFaction = getFactionById(world.factions, selectedCity.ownerFactionId);
  const attackable = canAttackCity(world.cities, selectedCity);
  const unified = isWorldUnified(world.cities);
  const { pendingBattleChoice } = appState;

  rootElement.innerHTML = `
    <main class="map-screen">
      <section class="world-stage" aria-labelledby="samwar-title">
        <div class="map-image" aria-hidden="true"></div>
        <div class="map-overlay" aria-hidden="true"></div>

        <svg class="route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${cityEdges
            .map(([fromId, toId]) => {
              const fromCity = world.cities.find((city) => city.id === fromId);
              const toCity = world.cities.find((city) => city.id === toId);

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

        <header class="title-panel">
          <p class="eyebrow">${meta.phase}</p>
          <h1 id="samwar-title" class="title">${meta.title}</h1>
          <p class="title-copy">임시 풀스크린 세계지도 위에서 성곽 랜드마크 기준 4도시 전선을 검증하는 MVP 화면</p>
        </header>

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

        <aside class="hud-stack" aria-label="Selected city details">
          <section class="turn-card hud-panel">
            <span class="turn-label">Turn</span>
            <strong class="turn-value">${meta.turn}</strong>
            <span class="turn-copy">${unified ? "천하통일 달성" : meta.status}</span>
          </section>

          <section class="detail-card hud-panel">
            <p class="eyebrow">Selected City</p>
            <h2 class="city-detail-name">${selectedCity.name}</h2>
            <p class="city-detail-meta">
              ${selectedCity.region} · ${selectedFaction?.name ?? "중립"}
            </p>
            <p class="city-detail-copy">${getStatusText(world.cities, selectedCity)}</p>
            ${
              attackable
                ? `
                  <button class="attack-button" type="button" data-attack-city-id="${selectedCity.id}">
                    공격
                  </button>
                  <p class="attack-note">공격을 누르면 전투 방식 선택 후 전투 화면으로 진입합니다.</p>
                `
                : `
                  <p class="attack-note">전투 화면은 공격 가능한 적 도시를 선택했을 때만 진입합니다.</p>
                `
            }
          </section>

          ${renderBattleChoicePanel(pendingBattleChoice)}

          <section class="detail-card hud-panel">
            <h3 class="detail-heading">연결 도시</h3>
            <div class="linked-city-list">
              ${linkedCities
                .map((city) => {
                  const faction = getFactionById(world.factions, city.ownerFactionId);
                  return `
                    <button class="linked-city-item" type="button" data-city-id="${city.id}">
                      <span>${city.name}</span>
                      <span style="color: ${faction?.color ?? "#d3b273"};">
                        ${faction?.name ?? "미상"}
                      </span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </section>

          <section class="detail-card hud-panel mvp-goal-panel">
            <h3 class="detail-heading">MVP 목표</h3>
            <ul class="goal-list">
              <li>배경 맵의 성곽 랜드마크에 4개 도시 앵커를 맞춰 전선을 검증합니다.</li>
              <li>도시 선택과 공격 진입, 점령, 통일 메시지까지 현재 월드맵 루프를 확인합니다.</li>
              <li>전투는 Phaser 기반 MVP이며 수동 지휘와 자동 위임 흐름을 함께 검증합니다.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  `;

  if (onCitySelect) {
    rootElement.querySelectorAll("[data-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        const cityId = element.getAttribute("data-city-id");

        if (cityId) {
          onCitySelect(cityId);
        }
      });
    });
  }

  if (onAttackCity) {
    rootElement.querySelectorAll("[data-attack-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        const cityId = element.getAttribute("data-attack-city-id");

        if (cityId) {
          onAttackCity(cityId);
        }
      });
    });
  }

  if (onBattleChoiceConfirm) {
    rootElement.querySelectorAll("[data-battle-choice]").forEach((element) => {
      element.addEventListener("click", () => {
        const choice = element.getAttribute("data-battle-choice");

        if (choice === "manual" || choice === "auto") {
          const cityId = element.getAttribute("data-battle-choice-city-id");

          if (cityId) {
            onBattleChoiceConfirm({
              cityId,
              autoBattleEnabled: choice === "auto",
            });
          }
        }
      });
    });
  }

  if (onBattleChoiceCancel) {
    rootElement.querySelector('[data-battle-choice="cancel"]')?.addEventListener("click", () => {
      onBattleChoiceCancel();
    });
  }
}
