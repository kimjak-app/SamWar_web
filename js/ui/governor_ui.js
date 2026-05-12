import {
  CHANCELLOR_TYPE_LABELS,
  GOVERNOR_POLICY_KEYS,
  GOVERNOR_POLICY_LABELS,
} from "../constants.js";

function isPlayerCity(selectedCity, appState) {
  return selectedCity?.ownerFactionId === (appState?.meta?.playerFactionId ?? "player");
}

function getGovernorHero(selectedCity, heroes = []) {
  if (!selectedCity?.governorHeroId) {
    return null;
  }

  return heroes.find((hero) => hero.id === selectedCity.governorHeroId) ?? null;
}

function getGovernorName(selectedCity, heroes = []) {
  return getGovernorHero(selectedCity, heroes)?.name ?? selectedCity?.governorHeroId ?? null;
}

function getGovernorCandidates(selectedCity, appState, stationedHeroes = []) {
  const playerFactionId = appState?.meta?.playerFactionId ?? "player";

  return stationedHeroes.filter((hero) => (
    hero.side === playerFactionId
    && hero.locationCityId === selectedCity?.id
  ));
}

function renderGovernorPortrait(hero) {
  if (hero?.portraitImage) {
    return `<img class="chancellor-portrait" src="${hero.portraitImage}" alt="${hero.name} 초상화" loading="lazy" />`;
  }

  return `<div class="chancellor-portrait chancellor-portrait-fallback" aria-hidden="true">${hero?.name?.slice(0, 1) ?? "?"}</div>`;
}

function formatGovernorTypeLine(label, type, aptitude) {
  if (!type) {
    return `${label}: 없음`;
  }

  const typeLabel = CHANCELLOR_TYPE_LABELS[type] ?? type;
  return `${label}: ${typeLabel} ${aptitude}`;
}

function renderGovernorCard(governorHero) {
  if (!governorHero) {
    return `
      <div class="domestic-resource-row">
        <span>태수</span>
        <strong>미임명</strong>
      </div>
      <div class="domestic-resource-row">
        <span>관리</span>
        <strong>재상 통제 관리</strong>
      </div>
    `;
  }

  return `
    <div class="chancellor-card governor-card">
      ${renderGovernorPortrait(governorHero)}
      <div class="chancellor-copy">
        <strong class="chancellor-name">${governorHero.name}</strong>
        <span class="chancellor-meta">${formatGovernorTypeLine(
          "주",
          governorHero.chancellorProfile?.primaryType,
          governorHero.chancellorProfile?.primaryAptitude,
        )}</span>
        <span class="chancellor-meta">${formatGovernorTypeLine(
          "보조",
          governorHero.chancellorProfile?.secondaryType,
          governorHero.chancellorProfile?.secondaryAptitude,
        )}</span>
      </div>
    </div>
  `;
}

function renderGovernorSelect(selectedCity, appState, stationedHeroes) {
  if (!isPlayerCity(selectedCity, appState)) {
    return "";
  }

  const candidates = getGovernorCandidates(selectedCity, appState, stationedHeroes);
  const options = [
    '<option value="">미임명</option>',
    ...candidates.map((hero) => `
      <option value="${hero.id}" ${hero.id === selectedCity.governorHeroId ? "selected" : ""}>
        ${hero.name}
      </option>
    `),
  ].join("");

  return `
    <label class="policy-control governor-control">
      <span class="policy-control-header">
        <span>태수 임명</span>
        <strong>${getGovernorName(selectedCity, appState?.world?.heroes) ?? "미임명"}</strong>
      </span>
      <select
        class="policy-select"
        data-governor-hero-id="true"
        data-governor-city-id="${selectedCity.id}"
        aria-label="태수 임명"
      >
        ${options}
      </select>
    </label>
  `;
}

function renderGovernorPolicySelect(selectedCity, appState) {
  if (!isPlayerCity(selectedCity, appState)) {
    return "";
  }

  const governorPolicy = selectedCity.governorPolicy ?? GOVERNOR_POLICY_KEYS.FOLLOW_CHANCELLOR;
  const options = Object.values(GOVERNOR_POLICY_KEYS)
    .map((policyKey) => `
      <option value="${policyKey}" ${policyKey === governorPolicy ? "selected" : ""}>
        ${GOVERNOR_POLICY_LABELS[policyKey]}
      </option>
    `)
    .join("");

  return `
    <label class="policy-control governor-policy-control">
      <span class="policy-control-header">
        <span>태수 정책</span>
        <strong>${GOVERNOR_POLICY_LABELS[governorPolicy] ?? GOVERNOR_POLICY_LABELS[GOVERNOR_POLICY_KEYS.FOLLOW_CHANCELLOR]}</strong>
      </span>
      <select
        class="policy-select"
        data-governor-policy="true"
        data-governor-policy-city-id="${selectedCity.id}"
        aria-label="태수 정책"
      >
        ${options}
      </select>
      <span class="policy-control-copy">효과 없음 · 도시 운영 방향 지정 MVP</span>
    </label>
  `;
}

export function renderCityGovernorPanel(selectedCity, appState, stationedHeroes = []) {
  const governorHero = getGovernorHero(selectedCity, appState?.world?.heroes);

  return `
    <div class="city-governor-panel city-domestic-section">
      <p class="city-domestic-heading">태수</p>
      ${renderGovernorCard(governorHero)}
      ${renderGovernorSelect(selectedCity, appState, stationedHeroes)}
      ${renderGovernorPolicySelect(selectedCity, appState)}
    </div>
  `;
}
