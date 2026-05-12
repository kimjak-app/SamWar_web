function normalizeLoyaltyValue(value) {
  const numericValue = Number.isFinite(value) ? value : 75;
  return Math.max(0, Math.min(100, Math.trunc(numericValue)));
}

function getLoyaltyTier(value) {
  if (value >= 90) {
    return { className: "loyalty-tier-green", status: "매우 안정" };
  }

  if (value >= 80) {
    return { className: "loyalty-tier-blue", status: "안정" };
  }

  if (value >= 61) {
    return { className: "loyalty-tier-yellow", status: "주의" };
  }

  return { className: "loyalty-tier-red", status: "위험" };
}

export function renderLoyaltyGauge(label, value, options = {}) {
  const normalizedValue = normalizeLoyaltyValue(value);
  const tier = getLoyaltyTier(normalizedValue);
  const className = options.className ? ` ${options.className}` : "";

  return `
    <div class="loyalty-gauge ${tier.className}${className}">
      <div class="loyalty-gauge-header">
        <span>${label}</span>
        <strong>${normalizedValue}</strong>
      </div>
      <div class="loyalty-gauge-track" aria-hidden="true">
        <span class="loyalty-gauge-fill" style="width: ${normalizedValue}%;"></span>
      </div>
      <span class="loyalty-gauge-status">${tier.status}</span>
    </div>
  `;
}
