export function renderHeroDeploymentPanel(pendingHeroDeployment) {
  if (!pendingHeroDeployment) {
    return "";
  }

  const selectedHeroIds = new Set(pendingHeroDeployment.selectedHeroIds);
  const hasSelection = selectedHeroIds.size > 0;
  const totalAllocatedTroops = pendingHeroDeployment.totalAllocatedTroops ?? 0;
  const canStart = hasSelection && totalAllocatedTroops > 0;

  function formatNumber(value) {
    return Math.round(Number(value) || 0).toLocaleString("ko-KR");
  }

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
          <div class="hero-deployment-route">
            <span>출전 가능 주둔군: ${formatNumber(pendingHeroDeployment.sourceGarrisonTroops)}명</span>
            <span>배정 병력: ${formatNumber(totalAllocatedTroops)}명</span>
            <span>잔여 주둔군: ${formatNumber(pendingHeroDeployment.remainingGarrisonTroops)}명</span>
          </div>
          ${pendingHeroDeployment.candidates.length === 0 ? `
            <p class="battle-choice-line battle-choice-copy">출전 가능한 아군 무장이 없습니다.</p>
          ` : ""}
        </div>
        <div class="hero-deployment-grid">
          ${pendingHeroDeployment.candidates
            .map((hero) => {
              const isSelected = selectedHeroIds.has(hero.id);
              const allocatedTroops = pendingHeroDeployment.troopAllocations?.[hero.id] ?? 0;
              const sliderMax = Math.min(
                hero.commandLimit ?? 0,
                (pendingHeroDeployment.remainingGarrisonTroops ?? 0) + allocatedTroops,
              );

              return `
                <div
                  class="hero-deployment-card battle-unit-card battle-unit-card-player ${isSelected ? "is-selected" : ""}"
                >
                  <button
                    class="hero-deployment-card-toggle"
                    type="button"
                    data-deployment-hero-id="${hero.id}"
                    aria-pressed="${isSelected}"
                  >
                  <div class="battle-unit-side-row">
                    <span class="battle-unit-side">${hero.commandLabel ?? hero.role ?? "unit"}</span>
                    <span class="battle-unit-selected-chip">${isSelected ? "출전" : "대기"}</span>
                  </div>
                  <div class="battle-unit-side-row">
                    ${hero.portraitImage ? `<img class="battle-unit-portrait" src="${hero.portraitImage}" alt="${hero.name} 초상화" loading="lazy" />` : ""}
                    <span class="battle-unit-name">${hero.name}</span>
                  </div>
                  </button>
                  <span class="battle-unit-hp">지휘 한도 ${formatNumber(hero.commandLimit)}명</span>
                  <label class="deployment-allocation-control">
                    <span>배정 병력 ${formatNumber(allocatedTroops)} / 최대 ${formatNumber(hero.commandLimit)}</span>
                    <input
                      type="range"
                      min="0"
                      max="${sliderMax}"
                      step="100"
                      value="${allocatedTroops}"
                      data-deployment-troops-hero-id="${hero.id}"
                      ${isSelected ? "" : "disabled"}
                    >
                  </label>
                  <span class="battle-unit-cooldown">공격 ${hero.attack} · 방어 ${hero.defense} · 지력 ${hero.intelligence}</span>
                  ${hero.skillName ? `<span class="battle-unit-buff">특기 ${hero.skillName}</span>` : ""}
                </div>
              `;
            })
            .join("")}
        </div>
        <div class="hero-deployment-actions">
          <button
            class="attack-button battle-choice-button"
            type="button"
            data-deployment-start-city-id="${pendingHeroDeployment.targetCityId}"
            ${canStart ? "" : "disabled"}
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

export function renderHeroTransferPanel(pendingHeroTransfer) {
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
