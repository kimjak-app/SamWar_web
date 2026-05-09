function getWorldTurnOwnerLabel(turnOwner) {
  return turnOwner === "enemy" ? "적군 턴" : "아군 턴";
}

export function renderWorldHud(appState, { canEndTurn, unified } = {}) {
  const { meta, world } = appState;

  return `
    <aside class="left-hud-stack" aria-label="World overview">
      <header class="title-panel">
        <p class="eyebrow">${meta.phase}</p>
        <h1 id="samwar-title" class="title">${meta.title}</h1>
        <p class="title-copy">임시 풀스크린 세계지도 위에서 성곽 랜드마크 기준 4도시 전선을 검증하는 MVP 화면</p>
      </header>

      <section class="detail-card hud-panel mvp-goal-panel">
        <h3 class="detail-heading">MVP 목표</h3>
        <ul class="goal-list">
          <li>배경 맵의 성곽 랜드마크에 4개 도시 앵커를 맞춰 전선을 검증합니다.</li>
          <li>도시 선택과 공격 진입, 점령, 통일 메시지까지 현재 월드맵 루프를 확인합니다.</li>
          <li>전투는 Phaser 기반 MVP이며 수동 지휘와 자동 위임 흐름을 함께 검증합니다.</li>
        </ul>
      </section>

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
    </aside>
  `;
}
