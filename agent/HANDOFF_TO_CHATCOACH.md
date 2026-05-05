# Handoff to ChatCoach

## Completed Task
`v0.2-10 World Turn + Enemy Invasion MVP` was completed.

## Changed Files
- `js/core/app_state.js`
- `js/core/world_rules.js`
- `js/core/battle_state.js`
- `js/ui/world_map_ui.js`
- `js/main.js`
- `css/main.css`
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.2-10 World Turn + Enemy Invasion MVP complete`.
- World map remains fullscreen with 4 MVP cities: `낙양`, `평양`, `한성`, `교토`.
- World map attack loop still uses the pre-battle choice flow:
  - select enemy city
  - click `공격`
  - choose `직접 지휘`, `자동 위임`, or `취소`
  - enter battle or stay on the world map
- World map now also has a lightweight world turn loop:
  - show `제 N턴`
  - show `아군 턴` or `적군 턴`
  - player clicks `턴 종료`
  - enemy gets one invasion attempt if a connected enemy city can attack a connected player city
  - no-invasion turns show `적군은 이번 턴 움직이지 않았습니다.` with confirmation
  - enemy invasion turns open a defense battle choice UI
  - after enemy resolution, control returns to player turn and the world turn increments
- Battle remains Phaser-rendered while core rules stay in `js/core`.
- Tactical battlefield grid remains `14x8`.
- Enemy invasion candidates are based on connected enemy-owned and player-owned cities only.
- Invasion choice reuses the existing manual/auto battle choice structure:
  - `직접 방어` starts defense battle with `autoBattleEnabled: false`
  - `자동 방어` starts defense battle with `autoBattleEnabled: true`
- Defense battle victory keeps the city.
- Defense battle defeat transfers the defending city to the enemy.
- Defense retreat is treated as city loss for this MVP.
- Existing attack battle ownership rules remain intact.
- Auto battle still retains the hotfix5/hotfix6/hotfix7 progression and actor-consumption safeguards after automatic actions.
- Existing manual battle behavior, cut-ins, enemy sequential cut-in flow, battlefield size, stats, and BGM/world-map occupation flow were preserved.
- No SFX or portrait work was added.

## Verification Result
- `node --check js/core/app_state.js` passed.
- `node --check js/core/world_rules.js` passed.
- `node --check js/core/battle_state.js` passed.
- `node --check js/ui/world_map_ui.js` passed.
- `node --check js/core/battle_rules.js` passed.
- `node --check js/main.js` passed.
- Agent docs were updated to reflect the latest `v0.2-10` state and next priorities.

## Known Issues
- Browser verification for the new world turn + enemy invasion loop is still pending.
- Browser verification for continued multi-turn auto-battle progression is still pending.
- Browser verification for the exact `유닛을 선택하세요 / 아군 턴 / 자동전투 중지` freeze state is still pending.
- Browser verification for the known `차륜전`, `대기`, move-only, strategy success/failure, failed follow-up, `status_skip`, and enemy unique-skill post-cutin cases is still pending.
- `14x8` battlefield readability and pacing still need browser verification.
- Initial larger-map unit positions may still need feel tuning after playtest.
- Cut-in duration and animation may still need tuning after all hero cut-ins are browser-tested.
- SFX is not integrated yet.
- Future UNIT panel should support hero portraits.

## Kimjak Check Items
- Confirm the next session starts from `v0.2-9d-hotfix5` and not from an older battle milestone.
- Confirm Direct Codex Paste Mode remains the working method.
- Confirm `agent/CODEX_INBOX.md` is not treated as the main task source.
- Confirm battle rules remain separated from Phaser rendering.
- Confirm hero, skill, roster, and strategy content remain data-driven.
- Confirm auto battle can run for multiple full turns without freezing after wait, move, strategy success/failure, skill, or status skip.
- Confirm player auto battle no longer depends on object-reference change and instead advances only after the acting unit actually consumes its action.
- Confirm enemy planned actions also consume their acting unit via attack/skill/strategy/move or safe wait fallback.
- Confirm the world map `턴 종료` button only appears during the player world turn and the world turn number increments after enemy resolution.
- Confirm no-invasion turns show the `적군은 이번 턴 움직이지 않았습니다.` confirmation panel and return correctly to the next player turn.
- Confirm invasion turns show attacker/defender city names and can enter `직접 방어` or `자동 방어`.
- Confirm defense victory keeps the defending city and defense defeat/retreat transfers it to the enemy.
- Confirm auto battle resumes immediately after enemy turn end when the battle returns to `turnOwner === "player"` with `autoBattleEnabled === true`.
- Confirm enemy unique-skill damage resolution no longer leaves the sequencer stuck.
- Confirm world-map `자동 위임` and in-battle auto button both use the same progression guard.
- Confirm status-skip handling from hotfix4 still works.
- Confirm unique-skill cut-ins still appear only for real `skill` actions and not for `status_skip`.
- Confirm the tactical board still renders as `14x8`.
- Confirm roster-card unit selection still works during manual player control.
- Confirm victory still occupies the target city and retreat still returns to the world map.
- Confirm no stat rebalance, cut-in timing change, or world-turn/invasion system was bundled into this patch.

## Suggested Next Task
Suggested next task: `Browser-test world turn + invasion loop`.

Main candidates:

1. Browser-test world turn + invasion loop
2. Tune enemy invasion probability / candidate selection
3. Hero portrait UI
4. Defense battle UX polish
5. SFX / battle sound effects

## New Chat Start Prompt
채코치, SamWar_web 다음 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.2-10 World Turn + Enemy Invasion MVP까지 완료.
- 월드맵에 `제 N턴 / 아군 턴` 표시와 `턴 종료` 버튼이 추가됐다.
- 적 턴마다 연결된 enemy city -> player city 후보 기준으로 1회 침공 판정을 한다.
- 침공이 발생하면 `직접 방어` / `자동 방어` 선택 패널이 뜨고, 기존 manual/auto battle choice 구조를 재사용한다.
- 방어전 승리 시 도시는 유지되고, 방어전 패배 또는 후퇴 시 도시는 적에게 넘어간다.
- 침공이 없으면 `적군은 이번 턴 움직이지 않았습니다.` 확인 패널 뒤 다음 플레이어 턴으로 넘어가며 world turn이 증가한다.
- 기존 공격전 manual/auto choice, 전투 규칙, 컷인, 자동전투 안정화, 보드 크기, BGM, 월드맵 복귀 흐름은 유지된다.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

먼저 agent 문서 기준으로 현재 상태를 요약하고, 다음 작업 우선순위를 판단해줘.
