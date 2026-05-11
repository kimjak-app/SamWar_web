import { DOMESTIC_STAT_KEYS } from "../constants.js";

function getDomesticValue(domestic, key) {
  const value = domestic?.[key] ?? 0;
  return Number.isFinite(value) ? value : 0;
}

function renderDomesticStatRow(label, value) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return `
    <div class="domestic-stat-row">
      <div class="domestic-row-header">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
      <div class="domestic-bar" aria-hidden="true">
        <span class="domestic-bar-fill" style="width: ${clampedValue}%;"></span>
      </div>
    </div>
  `;
}

export function renderDomesticPanel(city) {
  const domestic = city.domestic ?? {};
  const publicSupport = Number.isFinite(domestic[DOMESTIC_STAT_KEYS.PUBLIC_SUPPORT])
    ? domestic[DOMESTIC_STAT_KEYS.PUBLIC_SUPPORT]
    : getDomesticValue(domestic, DOMESTIC_STAT_KEYS.MORALE);

  return `
    <div class="city-domestic-section">
      <p class="city-domestic-heading">내정</p>
      ${renderDomesticStatRow("민심", publicSupport)}
      ${renderDomesticStatRow("치안", getDomesticValue(domestic, DOMESTIC_STAT_KEYS.PUBLIC_ORDER))}
      ${renderDomesticStatRow("농업", getDomesticValue(domestic, DOMESTIC_STAT_KEYS.AGRICULTURE))}
      ${renderDomesticStatRow("상업", getDomesticValue(domestic, DOMESTIC_STAT_KEYS.COMMERCE))}
      ${renderDomesticStatRow("안정", getDomesticValue(domestic, DOMESTIC_STAT_KEYS.STABILITY))}
    </div>
  `;
}
