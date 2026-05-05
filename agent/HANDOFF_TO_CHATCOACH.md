# Handoff to ChatCoach

## Completed Task
`v0.3-2c Battlefield Hero Portrait HQ Asset Activation` was completed.

## Changed Files
- `js/phaser/battle_scene.js`
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.3-2c Battlefield Hero Portrait HQ Asset Activation complete`.
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
- Battlefield unit sprites now use dedicated 256x256 battlefield token assets:
  - `assets/unit_tokens_battlefield/unit_blue_battlefield.png`
  - `assets/unit_tokens_battlefield/unit_red_battlefield.png`
- Old unit assets in `assets/units/` were intentionally kept and not deleted.
- Battlefield units now also show compact 32px hero portrait badges near the unit sprite.
- Battlefield portrait badges now use the dedicated battlefield portrait source again:
  - `battlefieldPortraitImage` is preferred
  - `portraitImage` remains the fallback
  - the newly replaced high-quality Lanczos-processed 128px battlefield portrait assets are now active for battlefield badges
- Battlefield unit name labels are now removed from the Phaser battlefield.
- Battlefield troop text remains simplified to `current / max`.
- Battlefield portrait badge border is now reduced further to an almost invisible dark outline.
- Facing arrow remains above the unit and is now moved closer to the unit HUD cluster.
- Battlefield HP bar and troop number are now moved closer to the unit sprite for a tighter compact layout.
- Battlefield cooldown text is hidden for now, and status icon redesign remains intentionally deferred.
- Phaser rendering filters, `pixelArt`, `NEAREST`, texture filtering, and global sharpness settings were intentionally not touched in this patch.
- Phaser scale logic, badge display sizing, and HUD offsets were also intentionally not touched in this patch.
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
- `node --check data/heroes.js` passed.
- Agent docs were updated to reflect the latest `v0.3-2c` state and next priorities.

## Known Issues
- Browser verification for battlefield portrait readability and spacing is still pending.
- Browser verification for the new 256 battlefield unit token quality is still pending.
- Browser verification that battlefield badges are now using the HQ `battlefieldPortraitImage` source is still pending.
- Browser verification for the safer portrait-border softness and tighter arrow / HP / troop placement is still pending.
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
- Confirm blue/player battlefield units use `unit_blue_battlefield.png`.
- Confirm red/enemy battlefield units use `unit_red_battlefield.png`.
- Confirm old unit assets remain untouched in `assets/units/`.
- Confirm battlefield portrait badges use `battlefieldPortraitImage` first and `portraitImage` only as fallback.
- Confirm the HQ battlefield portrait assets look sharper/cleaner than the temporary `portraitImage` fallback state.
- Confirm the battlefield portrait frame feels almost absent and no yellow/gold frame remains.
- Confirm the facing arrow above the unit now sits closer without overlapping the portrait badge or unit sprite.
- Confirm the HP bar plus troop number sit closer to the unit and still feel readable without overlap.
- Confirm battlefield portraits, unit sprites, and troop text remain smooth and not pixelated/blocky.
- Confirm all four MVP battlefield units still show 32px portrait badges without breaking selection/move/attack/skill interactions.
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
Suggested next task: `Browser-test HQ battlefield hero portrait clarity`.

Main candidates:

1. Browser-test HQ battlefield hero portrait clarity
2. Tune battlefield portrait/arrow/HP offsets if needed
3. Add status effect icons
4. Add hero portraits to world-map city / garrison UI
5. Defense battle UX polish
6. SFX / battle sound effects

## New Chat Start Prompt
채코치, SamWar_web 다음 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.3-2c Battlefield Hero Portrait HQ Asset Activation까지 완료.
- 전장 유닛 스프라이트는 이제 dedicated 256x256 battlefield token asset을 사용한다.
- 기존 `assets/units/` 구 유닛 에셋은 백업/롤백용으로 유지되고 삭제하지 않았다.
- `battlefieldPortraitImage`가 hero data와 battle unit 양쪽에 추가됐다.
- 새로 교체된 HQ Lanczos 128px battlefield portrait asset을 전장 badge source로 다시 활성화했다.
- 전장 badge portrait 선택은 이제 `battlefieldPortraitImage` 우선, `portraitImage` fallback이다.
- portrait frame은 거의 안 보이지 않을 정도의 dark outline로 더 줄였다.
- facing arrow는 유닛 위를 유지하면서 더 가까이 붙였고 HP bar와 troop number도 sprite 쪽으로 더 당겼다.
- Phaser rendering filter / pixelArt / NEAREST / global sharpness 설정은 이번 패치에서 의도적으로 건드리지 않았다.
- status/cooldown icon 정리는 여전히 다음 작업으로 미뤘다.
- 전투 규칙, 자동전투, 컷인, 월드 턴, 침공, 도시 점유 흐름은 유지된다.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

먼저 agent 문서 기준으로 현재 상태를 요약하고, 다음 작업 우선순위를 판단해줘.
