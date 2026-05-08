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

function getStationedHeroes(heroes, selectedCity) {
  return heroes.filter((hero) => hero.locationCityId === selectedCity.id);
}

function renderStationedHeroes(heroes) {
  return `
    <div class="stationed-heroes">
      <p class="stationed-heroes-label">주둔 무장</p>
      ${
        heroes.length === 0
          ? '<p class="stationed-heroes-empty">주둔 무장 없음</p>'
          : `
            <div class="stationed-hero-list">
              ${heroes.map((hero) => `
                <div class="stationed-hero" title="${hero.name}">
                  ${
                    hero.portraitImage
                      ? `<img class="stationed-hero-portrait" src="${hero.portraitImage}" alt="${hero.name}" loading="lazy" />`
                      : `<span class="stationed-hero-fallback">${hero.name.slice(0, 1)}</span>`
                  }
                  <span class="stationed-hero-name">${hero.name}</span>
                </div>
              `).join("")}
            </div>
          `
      }
    </div>
  `;
}

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

function getWorldTurnOwnerLabel(turnOwner) {
  return turnOwner === "enemy" ? "적군 턴" : "아군 턴";
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

function renderHeroDeploymentPanel(pendingHeroDeployment) {
  if (!pendingHeroDeployment) {
    return "";
  }

  const selectedHeroIds = new Set(pendingHeroDeployment.selectedHeroIds);
  const hasSelection = selectedHeroIds.size > 0;

  return `
    <div class="hero-deployment-overlay" aria-live="polite">
      <div class="hero-deployment-backdrop" aria-hidden="true"></div>
      <section
        class="hero-deployment-modal battle-choice-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-deployment-title"
      >
        <div class="hero-deployment-header">
          <p class="eyebrow">Deployment</p>
          <h3 class="detail-heading" id="hero-deployment-title">출전 무장 선택</h3>
          <div class="hero-deployment-route">
            <span>출발 도시: ${pendingHeroDeployment.originCityName}</span>
            <span>공격 목표: ${pendingHeroDeployment.targetCityName}</span>
          </div>
          ${pendingHeroDeployment.candidates.length === 0 ? `
            <p class="battle-choice-line battle-choice-copy">출전 가능한 아군 무장이 없습니다.</p>
          ` : ""}
        </div>
        <div class="hero-deployment-grid">
          ${pendingHeroDeployment.candidates
            .map((hero) => {
              const isSelected = selectedHeroIds.has(hero.id);

              return `
                <button
                  class="hero-deployment-card battle-unit-card battle-unit-card-player ${isSelected ? "is-selected" : ""}"
                  type="button"
                  data-deployment-hero-id="${hero.id}"
                  aria-pressed="${isSelected}"
                >
                  <div class="battle-unit-side-row">
                    <span class="battle-unit-side">${hero.role ?? "unit"}</span>
                    <span class="battle-unit-selected-chip">${isSelected ? "출전" : "대기"}</span>
                  </div>
                  <div class="battle-unit-side-row">
                    ${hero.portraitImage ? `<img class="battle-unit-portrait" src="${hero.portraitImage}" alt="${hero.name} 초상화" loading="lazy" />` : ""}
                    <span class="battle-unit-name">${hero.name}</span>
                  </div>
                  <span class="battle-unit-hp">병력 ${hero.troops}/${hero.maxTroops}</span>
                  <span class="battle-unit-cooldown">공격 ${hero.attack} · 방어 ${hero.defense} · 지력 ${hero.intelligence}</span>
                  ${hero.skillName ? `<span class="battle-unit-buff">특기 ${hero.skillName}</span>` : ""}
                </button>
              `;
            })
            .join("")}
        </div>
        <div class="hero-deployment-actions">
          <button
            class="attack-button battle-choice-button"
            type="button"
            data-deployment-start-city-id="${pendingHeroDeployment.targetCityId}"
            ${hasSelection ? "" : "disabled"}
          >
            전투 시작
          </button>
          <button class="battle-choice-cancel" type="button" data-deployment-cancel="true">
            월드맵으로
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderHeroTransferPanel(pendingHeroTransfer) {
  if (!pendingHeroTransfer) {
    return "";
  }

  const selectedHeroId = pendingHeroTransfer.selectedHeroId;
  const selectedTargetCityId = pendingHeroTransfer.selectedTargetCityId;
  const canConfirm = Boolean(selectedHeroId && selectedTargetCityId);

  return `
    <div class="hero-deployment-overlay" aria-live="polite">
      <div class="hero-deployment-backdrop" aria-hidden="true"></div>
      <section
        class="hero-deployment-modal battle-choice-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-transfer-title"
      >
        <div class="hero-deployment-header">
          <p class="eyebrow">Transfer</p>
          <h3 class="detail-heading" id="hero-transfer-title">무장 이동</h3>
          <div class="hero-deployment-route">
            <span>출발 성: ${pendingHeroTransfer.sourceCityName}</span>
          </div>
        </div>
        <div class="hero-deployment-grid">
          <div class="battle-choice-summary">
            <p class="battle-choice-line">이동할 무장</p>
            ${pendingHeroTransfer.heroes.length === 0 ? `
              <p class="battle-choice-line battle-choice-copy">이 성에는 이동 가능한 무장이 없습니다.</p>
            ` : pendingHeroTransfer.heroes.map((hero) => {
              const isSelected = hero.id === selectedHeroId;

              return `
                <button
                  class="hero-deployment-card battle-unit-card battle-unit-card-player ${isSelected ? "is-selected" : ""}"
                  type="button"
                  data-transfer-hero-id="${hero.id}"
                  aria-pressed="${isSelected}"
                >
                  <div class="battle-unit-side-row">
                    <span class="battle-unit-side">${hero.role ?? "unit"}</span>
                    <span class="battle-unit-selected-chip">${isSelected ? "선택" : "대기"}</span>
                  </div>
                  <div class="battle-unit-side-row">
                    ${hero.portraitImage ? `<img class="battle-unit-portrait" src="${hero.portraitImage}" alt="${hero.name} 초상화" loading="lazy" />` : ""}
                    <span class="battle-unit-name">${hero.name}</span>
                  </div>
                  <span class="battle-unit-hp">병력 ${hero.troops}/${hero.maxTroops}</span>
                  <span class="battle-unit-cooldown">공격 ${hero.attack} · 방어 ${hero.defense} · 지력 ${hero.intelligence}</span>
                  ${hero.skillName ? `<span class="battle-unit-buff">특기 ${hero.skillName}</span>` : ""}
                </button>
              `;
            }).join("")}
          </div>
          <div class="battle-choice-summary">
            <p class="battle-choice-line">목적지</p>
            ${pendingHeroTransfer.destinationCities.length === 0 ? `
              <p class="battle-choice-line battle-choice-copy">이동 가능한 아군 성이 없습니다.</p>
            ` : pendingHeroTransfer.destinationCities.map((city) => {
              const isSelected = city.id === selectedTargetCityId;

              return `
                <button
                  class="linked-city-item ${isSelected ? "is-selected" : ""}"
                  type="button"
                  data-transfer-target-city-id="${city.id}"
                  aria-pressed="${isSelected}"
                >
                  <span>${city.name}</span>
                  <span>${city.region}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
        <div class="hero-deployment-actions">
          <button
            class="attack-button battle-choice-button"
            type="button"
            data-transfer-confirm="true"
            ${canConfirm ? "" : "disabled"}
          >
            이동 실행
          </button>
          <button class="battle-choice-cancel" type="button" data-transfer-cancel="true">
            취소
          </button>
        </div>
      </section>
    </div>
  `;
}

function renderEnemyTurnResultPanel(pendingEnemyTurnResult) {
  if (!pendingEnemyTurnResult) {
    return "";
  }

  return `
    <section class="detail-card hud-panel battle-choice-card" aria-live="polite">
      <p class="eyebrow">Enemy Turn</p>
      <h3 class="detail-heading">적군 턴 결과</h3>
      <div class="battle-choice-summary">
        <p class="battle-choice-line battle-choice-copy">${pendingEnemyTurnResult.message}</p>
      </div>
      <div class="battle-choice-actions">
        <button class="attack-button battle-choice-button battle-choice-button-auto" type="button" data-enemy-turn-result="confirm">
          확인
        </button>
      </div>
    </section>
  `;
}

export function renderWorldMap(rootElement, appState, handlers = {}) {
  const { meta, world } = appState;
  const {
    onCitySelect,
    onAttackCity,
    onBattleChoiceConfirm,
    onBattleChoiceCancel,
    onHeroDeploymentToggle,
    onHeroDeploymentStart,
    onHeroDeploymentCancel,
    onHeroTransferOpen,
    onHeroTransferSelectHero,
    onHeroTransferSelectTargetCity,
    onHeroTransferConfirm,
    onHeroTransferCancel,
    onEndWorldTurn,
    onConfirmEnemyTurnResult,
  } = handlers;
  const selectedCity = getSelectedCity(appState);
  const linkedCities = getLinkedCities(world.cities, selectedCity);
  const stationedHeroes = getStationedHeroes(world.heroes, selectedCity);
  const cityEdges = getCityEdges(world.cities);
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
            <span class="turn-label">World Turn</span>
            <strong class="turn-value">제 ${meta.turn}턴</strong>
            <strong class="turn-owner">${getWorldTurnOwnerLabel(world.turnOwner)}</strong>
            <span class="turn-copy">${unified ? "천하통일 달성" : meta.status}</span>
            ${canEndTurn ? `
              <button class="attack-button world-turn-button" type="button" data-end-world-turn="true">
                턴 종료
              </button>
            ` : ""}
          </section>

          <section class="detail-card hud-panel">
            <p class="eyebrow">Selected City</p>
            <h2 class="city-detail-name">${selectedCity.name}</h2>
            <p class="city-detail-meta">
              ${selectedCity.region} · ${selectedFaction?.name ?? "중립"}
            </p>
            <p class="city-detail-copy">${getStatusText(world.cities, selectedCity)}</p>
            ${renderStationedHeroes(stationedHeroes)}
            ${
              canOpenHeroTransfer
                ? `
                  <button
                    class="attack-button"
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

          ${renderBattleChoicePanel(pendingBattleChoice)}
          ${renderEnemyTurnResultPanel(world.pendingEnemyTurnResult)}

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
        ${renderHeroDeploymentPanel(pendingHeroDeployment)}
        ${renderHeroTransferPanel(pendingHeroTransfer)}
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

  if (onHeroDeploymentToggle) {
    rootElement.querySelectorAll("[data-deployment-hero-id]").forEach((element) => {
      element.addEventListener("click", () => {
        onHeroDeploymentToggle(element.getAttribute("data-deployment-hero-id"));
      });
    });
  }

  if (onHeroDeploymentStart) {
    rootElement.querySelector("[data-deployment-start-city-id]")?.addEventListener("click", (event) => {
      const cityId = event.currentTarget.getAttribute("data-deployment-start-city-id");

      if (!cityId || !pendingHeroDeployment?.selectedHeroIds?.length) {
        return;
      }

      onHeroDeploymentStart({
        cityId,
        selectedHeroIds: pendingHeroDeployment.selectedHeroIds,
      });
    });
  }

  if (onHeroDeploymentCancel) {
    rootElement.querySelector("[data-deployment-cancel='true']")?.addEventListener("click", () => {
      onHeroDeploymentCancel();
    });
  }

  if (onHeroTransferOpen) {
    rootElement.querySelector("[data-hero-transfer-open-city-id]")?.addEventListener("click", (event) => {
      const cityId = event.currentTarget.getAttribute("data-hero-transfer-open-city-id");

      if (cityId) {
        onHeroTransferOpen(cityId);
      }
    });
  }

  if (onHeroTransferSelectHero) {
    rootElement.querySelectorAll("[data-transfer-hero-id]").forEach((element) => {
      element.addEventListener("click", () => {
        onHeroTransferSelectHero(element.getAttribute("data-transfer-hero-id"));
      });
    });
  }

  if (onHeroTransferSelectTargetCity) {
    rootElement.querySelectorAll("[data-transfer-target-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        onHeroTransferSelectTargetCity(element.getAttribute("data-transfer-target-city-id"));
      });
    });
  }

  if (onHeroTransferConfirm) {
    rootElement.querySelector("[data-transfer-confirm='true']")?.addEventListener("click", () => {
      if (!pendingHeroTransfer?.selectedHeroId || !pendingHeroTransfer?.selectedTargetCityId) {
        return;
      }

      onHeroTransferConfirm({
        heroId: pendingHeroTransfer.selectedHeroId,
        targetCityId: pendingHeroTransfer.selectedTargetCityId,
      });
    });
  }

  if (onHeroTransferCancel) {
    rootElement.querySelector("[data-transfer-cancel='true']")?.addEventListener("click", () => {
      onHeroTransferCancel();
    });
  }

  if (onEndWorldTurn) {
    rootElement.querySelector("[data-end-world-turn='true']")?.addEventListener("click", () => {
      onEndWorldTurn();
    });
  }

  if (onConfirmEnemyTurnResult) {
    rootElement.querySelector("[data-enemy-turn-result='confirm']")?.addEventListener("click", () => {
      onConfirmEnemyTurnResult();
    });
  }
}
