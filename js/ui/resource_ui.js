import { RESOURCE_KEYS, RESOURCE_LABELS } from "../constants.js";

const CITY_RESOURCE_KEYS = Object.freeze([
  RESOURCE_KEYS.RICE,
  RESOURCE_KEYS.BARLEY,
  RESOURCE_KEYS.SEAFOOD,
  RESOURCE_KEYS.WOOD,
  RESOURCE_KEYS.IRON,
  RESOURCE_KEYS.HORSES,
  RESOURCE_KEYS.SILK,
  RESOURCE_KEYS.SALT,
]);

function getResourceValue(resources, key) {
  const value = resources?.[key] ?? 0;
  return Number.isFinite(value) ? value : 0;
}

function formatRating(value) {
  const clampedValue = Math.max(0, Math.min(5, Math.trunc(value)));

  if (clampedValue === 0) {
    return "-";
  }

  return "★".repeat(clampedValue);
}

function renderResourceRow(label, value) {
  return `
    <div class="domestic-resource-row">
      <span>${label}</span>
      <strong>${formatRating(value)}</strong>
    </div>
  `;
}

function renderCommerceRatingRow(value) {
  return `
    <div class="domestic-yield-row">
      <span>상업력</span>
      <strong>${formatRating(value)}</strong>
    </div>
  `;
}

export function renderResourcePanel(city) {
  const resources = city.resources ?? {};

  return `
    <div class="city-domestic-section">
      <p class="city-domestic-heading">자원 생산력</p>
      ${CITY_RESOURCE_KEYS
        .map((resourceKey) => renderResourceRow(
          RESOURCE_LABELS[resourceKey],
          getResourceValue(resources, resourceKey),
        ))
        .join("")}
    </div>
    <div class="city-domestic-section">
      <p class="city-domestic-heading">상업</p>
      ${renderCommerceRatingRow(city.commerceRating ?? 0)}
    </div>
  `;
}
