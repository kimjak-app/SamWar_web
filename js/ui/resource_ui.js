import { RESOURCE_KEYS, SEASON_KEYS, YIELD_KEYS } from "../constants.js";

const SEASON_LABELS = Object.freeze({
  [SEASON_KEYS.SPRING]: "봄",
  [SEASON_KEYS.AUTUMN]: "가을",
  [SEASON_KEYS.WINTER]: "겨울",
  [SEASON_KEYS.SEASON]: "계절",
  [SEASON_KEYS.TURN]: "턴",
});

function getResourceValue(resources, key) {
  const value = resources?.[key] ?? 0;
  return Number.isFinite(value) ? value : 0;
}

function renderResourceRow(label, value) {
  return `
    <div class="domestic-resource-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderYieldRow(label, value, timingLabel) {
  return `
    <div class="domestic-yield-row">
      <span>${label}</span>
      <strong>+${value} / ${timingLabel}</strong>
    </div>
  `;
}

export function renderResourcePanel(city) {
  const resources = city.resources ?? {};
  const yields = city.yields ?? {};

  return `
    <div class="city-domestic-section">
      <p class="city-domestic-heading">자원</p>
      ${renderResourceRow("쌀", getResourceValue(resources, RESOURCE_KEYS.RICE))}
      ${renderResourceRow("보리", getResourceValue(resources, RESOURCE_KEYS.BARLEY))}
      ${renderResourceRow("해산물", getResourceValue(resources, RESOURCE_KEYS.SEAFOOD))}
      ${renderResourceRow("금전", getResourceValue(resources, RESOURCE_KEYS.GOLD))}
      ${renderResourceRow("특산", getResourceValue(resources, RESOURCE_KEYS.SPECIALTY))}
    </div>
    <div class="city-domestic-section">
      <p class="city-domestic-heading">예상 수입</p>
      ${renderYieldRow("쌀", getResourceValue(yields, YIELD_KEYS.RICE_HARVEST), SEASON_LABELS[SEASON_KEYS.AUTUMN])}
      ${renderYieldRow("보리", getResourceValue(yields, YIELD_KEYS.BARLEY_HARVEST), SEASON_LABELS[SEASON_KEYS.SPRING])}
      ${renderYieldRow("해산물", getResourceValue(yields, YIELD_KEYS.SEAFOOD_PER_TURN), SEASON_LABELS[SEASON_KEYS.TURN])}
      ${renderYieldRow("상업", getResourceValue(yields, YIELD_KEYS.COMMERCE_INCOME), SEASON_LABELS[SEASON_KEYS.SEASON])}
      ${renderYieldRow("특산", getResourceValue(yields, YIELD_KEYS.SPECIALTY_INCOME), SEASON_LABELS[SEASON_KEYS.WINTER])}
    </div>
  `;
}
