export function renderGarrisonPanel(heroes) {
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
