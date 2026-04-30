import {
  canAttackCity,
  getFactionById,
  isEnemyCity,
  isPlayerCity,
  isWorldUnified,
} from "../core/world_rules.js";

const MAP_WIDTH = 840;
const MAP_HEIGHT = 560;

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
    return "전투 시스템은 다음 버전에서 구현 예정입니다.";
  }

  if (isPlayerCity(selectedCity)) {
    return "아군 거점입니다. 인접한 적 도시가 있으면 공격 테스트를 진행할 수 있습니다.";
  }

  if (isEnemyCity(selectedCity)) {
    return "적 도시입니다. 아군 인접 거점이 없으면 아직 공격할 수 없습니다.";
  }

  return "전투 시스템은 다음 버전에서 구현 예정입니다.";
}

export function renderWorldMap(rootElement, appState, handlers = {}) {
  const { meta, world } = appState;
  const { onCitySelect, onAttackCity } = handlers;
  const selectedCity = getSelectedCity(appState);
  const linkedCities = getLinkedCities(world.cities, selectedCity);
  const cityEdges = getCityEdges(world.cities);
  const selectedFaction = getFactionById(world.factions, selectedCity.ownerFactionId);
  const attackable = canAttackCity(world.cities, selectedCity);
  const unified = isWorldUnified(world.cities);

  rootElement.innerHTML = `
    <main class="map-screen">
      <section class="world-layout" aria-labelledby="samwar-title">
        <header class="topbar">
          <div>
            <p class="eyebrow">${meta.phase}</p>
            <h1 id="samwar-title" class="title">${meta.title}</h1>
          </div>
          <div class="turn-card" aria-label="Current turn status">
            <span class="turn-label">Turn</span>
            <strong class="turn-value">${meta.turn}</strong>
            <span class="turn-copy">${unified ? "천하통일 달성" : meta.status}</span>
          </div>
        </header>

        <section class="content-grid">
          <article class="map-panel" aria-label="World map">
            <div class="map-frame">
              <svg class="route-layer" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" aria-hidden="true">
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

              <div class="map-backdrop">
                <div class="landmass landmass-west" aria-hidden="true"></div>
                <div class="landmass landmass-korea" aria-hidden="true"></div>
                <div class="landmass landmass-japan" aria-hidden="true"></div>
              </div>

              ${world.cities
                .map((city) => {
                  const faction = getFactionById(world.factions, city.ownerFactionId);
                  const isSelected = city.id === selectedCity.id;
                  const statusLabel = isPlayerCity(city) ? "아군" : "적군";

                  return `
                    <button
                      class="city-node ${isSelected ? "is-selected" : ""} ${isPlayerCity(city) ? "is-friendly" : "is-hostile"}"
                      type="button"
                      data-city-id="${city.id}"
                      style="left: ${(city.x / MAP_WIDTH) * 100}%; top: ${(city.y / MAP_HEIGHT) * 100}%; --city-color: ${faction?.color ?? "#d3b273"};"
                      aria-pressed="${isSelected}"
                    >
                      <span class="city-pip"></span>
                      <span class="city-name">${city.name}</span>
                      <span class="city-meta">${statusLabel} · ${city.region}</span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </article>

          <aside class="side-panel" aria-label="Selected city details">
            <section class="detail-card">
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
                      공격 테스트
                    </button>
                    <p class="attack-note">전투 시스템은 다음 버전에서 구현 예정입니다.</p>
                  `
                  : `
                    <p class="attack-note">전투 시스템은 다음 버전에서 구현 예정입니다.</p>
                  `
              }
            </section>

            <section class="detail-card">
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

            <section class="detail-card">
              <h3 class="detail-heading">MVP 목표</h3>
              <ul class="goal-list">
                <li>도시 선택 시 우측 패널이 즉시 갱신됩니다.</li>
                <li>접경 적 도시는 공격 테스트로 아군 점령 상태를 확인할 수 있습니다.</li>
                <li>전투 장면은 아직 없고 상태 메시지만 표시합니다.</li>
              </ul>
            </section>
          </aside>
        </section>
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
}
