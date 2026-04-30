export function renderLayout(rootElement, appState) {
  const { meta, world } = appState;

  rootElement.innerHTML = `
    <main class="screen">
      <section class="hero-panel" aria-labelledby="samwar-title">
        <p class="eyebrow">${meta.phase}</p>
        <h1 id="samwar-title" class="title">${meta.title}</h1>
        <p class="subtitle">
          A modular browser MVP for a turn-based East Asian hero strategy game.
          This placeholder screen confirms the HTML, UI, state, and data layers are wired correctly.
        </p>

        <div class="summary-grid" aria-label="Project scaffold summary">
          <article class="summary-card">
            <span class="summary-label">Cities</span>
            <span class="summary-value">${world.cities.length}</span>
          </article>
          <article class="summary-card">
            <span class="summary-label">Heroes</span>
            <span class="summary-value">${world.heroes.length}</span>
          </article>
          <article class="summary-card">
            <span class="summary-label">Factions</span>
            <span class="summary-value">${world.factions.length}</span>
          </article>
          <article class="summary-card">
            <span class="summary-label">Skills</span>
            <span class="summary-value">${world.skills.length}</span>
          </article>
        </div>

        <div class="status" role="status">
          <h2 class="status-title">${meta.status}</h2>
          <p class="status-copy">
            Next implementation can extend these modules with map rendering, turn flow,
            hero acquisition, and city control systems without moving data into the UI layer.
          </p>
        </div>
      </section>
    </main>
  `;
}
