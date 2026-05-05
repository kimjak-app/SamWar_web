# Handoff to ChatCoach

## Completed Task
`v0.3-2 Battlefield Unit HUD Cleanup` was completed.

## Changed Files
- `js/phaser/battle_scene.js`
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.3-2 Battlefield Unit HUD Cleanup complete`.
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
- Hero portrait assets are now connected to hero data and copied into battle units.
- Right `UNIT / 부대 목록` roster cards now show hero portraits for both player and enemy units.
- Selected-unit summary now shows the selected hero portrait.
- Missing portrait data now falls back safely without breaking the battle UI.
- Battlefield units now also show compact 32px hero portrait badges near the unit sprite.
- Battlefield portrait badges reuse the same `unit.portraitImage` data from `v0.3.0`.
- Battlefield unit name labels are now removed from the Phaser battlefield.
- Battlefield troop text is now simplified to `current / max` with the facing arrow inline.
- Battlefield HP bars are now thinner and positioned closer to the unit sprite.
- Battlefield portrait badge borders now use a thin dark/black style instead of the earlier gold-accented frame.
- Battlefield cooldown text is hidden for now, and status icon redesign remains intentionally deferred.
- Click/hit-zone behavior remains intact.
- Enemy invasion candidates are based on connected enemy-owned and player-owned cities only.
- Invasion choice reuses the existing manual/auto battle choice structure:
  - `직접 방어` starts defense battle with `autoBattleEnabled: false`
  - `자동 방어` starts defense battle with `autoBattleEnabled: true`
- Defense battle victory keeps the city.
- Defense battle defeat transfers the defending city to the enemy.
- Defense retreat is treated as city loss for this MVP.
- Existing attack battle ownership rules remain intact.
- Auto battle still retains the hotfix5/hotfix6/hotfix7 progression and actor-consumption safeguards after automatic actions.
- Existing manual battle behavior, cut-ins, enemy sequential cut-in flow, battlefield size, stats, world turn/invasion logic, and BGM/world-map occupation flow were preserved.
- No SFX work was added.

## Verification Result
- `node --check js/phaser/battle_scene.js` passed.
- Agent docs were updated to reflect the latest `v0.3-2` state and next priorities.

## Known Issues
- Browser verification for compact battlefield HUD readability is still pending.
- Browser verification for hero portrait readability and spacing is still pending.
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
- Confirm battlefield unit names are gone, cooldown text is hidden, and troop/facing text remains readable and correctly placed.
- Confirm all four MVP battlefield units show 32px portrait badges without covering HP bars or breaking selection/move/attack/skill interactions.
- Confirm battlefield portrait badges use the new thin dark/black border and the thinner HP bars still read clearly on the `14x8` board.
- Confirm all four MVP portraits render correctly in the right roster and selected-unit summary without clipping or making text unreadable.
- Confirm player roster cards remain clickable and selected-card highlighting still works with portrait thumbnails.
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
Suggested next task: `Browser-test compact battlefield HUD readability`.

Main candidates:

1. Browser-test compact battlefield HUD readability
2. Tune portrait badge size / position if needed
3. Add status effect icons
4. Add hero portraits to world-map city / garrison UI
5. Defense battle UX polish

## New Chat Start Prompt
채코치, SamWar_web 다음 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.3-2 Battlefield Unit HUD Cleanup까지 완료.
- 전장 유닛 이름 라벨이 제거됐고 troop 표시는 `110 / 110 ←` 같은 compact 형식으로 정리됐다.
- portrait badge는 32px로 커졌고 border는 얇은 dark/black 스타일로 바뀌었다.
- HP bar는 더 얇아졌고 sprite 아래로 더 가깝게 붙었다.
- battlefield cooldown text는 숨겼고 status icon 정리는 여전히 다음 작업으로 미뤘다.
- 전투 규칙, 자동전투, 컷인, 월드 턴, 침공, 도시 점유 흐름은 유지된다.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

먼저 agent 문서 기준으로 현재 상태를 요약하고, 다음 작업 우선순위를 판단해줘.
