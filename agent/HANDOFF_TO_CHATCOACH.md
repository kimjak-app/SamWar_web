# Handoff to ChatCoach

## Completed Task
`v0.2-9c Unit Roster Selection + Skill Name Polish` was completed.

## Changed Files
- `js/ui/battle_ui.js`
- `css/main.css`
- `data/skills.js`
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.2-9c Unit Roster Selection + Skill Name Polish complete`.
- World map remains fullscreen with 4 MVP cities: `낙양`, `평양`, `한성`, `교토`.
- World map attack loop works: select enemy city -> enter battle -> win or retreat -> return to world map -> victory occupies city.
- Battle remains Phaser-rendered while core rules stay in `js/core`.
- Tactical battlefield grid is now `14x8`.
- Battle UI is now organized as:
  - left `STATUS / 전황 보고` + `BATTLE LOG / 전투 기록`
  - center tactical battlefield board
  - right `UNIT / 부대 목록` roster panel
  - bottom centered command bar
- Command bar is command-only, centered, and enlarged for readability.
- Facing selection uses battlefield tiles only.
- Bottom facing panel was removed.
- Facing tile priority works even when overlapping unit hit zones.
- Selected unit summary is shown in the battle board header area.
- Global top-right HUD is not used for selected-unit summary.
- Right panel is simplified to roster cards only.
- Selected roster card is highlighted.
- Visible `HP` label is renamed to `전열` while internal `hp/maxHp` logic remains unchanged.
- The new battlefield background asset is now:
  - `assets/battle/battlefield_14x8_mvp.png`
- The old battlefield background asset is preserved for rollback/fallback:
  - `assets/battle/battlefield_mvp.png`
- Heavy battlefield-wide darkening was removed and reduced to a near-transparent readability overlay so the new background remains visible.
- Unit token image sprites are now slightly toned down with alpha adjustment so they blend better with the softer `14x8` battlefield background.
- Friendly player units can now be selected from the right `UNIT / 부대 목록` roster panel during manual player control.
- Enemy roster cards remain display-only for now.
- Fixed MVP starting positions were expanded for the larger map:
  - Yi Sun-sin: `{ x: 2, y: 5 }`
  - Jeong Do-jeon: `{ x: 2, y: 4 }`
  - Nobunaga: `{ x: 11, y: 3 }`
  - Kenshin: `{ x: 11, y: 4 }`
- Nobunaga's unique skill display name is now `삼단격`.
- Kenshin's unique skill display name is now `차륜전`.
- Existing battle rules, AI sequencing, cut-ins, BGM, and world-map flow were preserved.
- Skill effects, IDs, AI, cut-ins, board size, and battle rules were preserved.
- HP bars, labels, highlights, and battlefield background rendering were also preserved in this patch.
- No stat balance changes were made yet.
- Right-click UX is implemented:
  - facing phase right-click rolls back pending move
  - attack/skill/strategy right-click cancels command mode only
- Hold-position facing is supported by clicking the selected unit's current tile.
- Range/target UX is improved:
  - basic attack full range
  - unique skill full range
  - strategy full range even without valid enemy targets
  - valid targets emphasized separately from full range
  - unique skills are click-to-trigger
  - skill targeting is data-driven by metadata
- `학익진 포격` remains area attack against valid enemies in range.
- `개혁령` remains ally area buff with full range display, valid allied target highlighting, clicked-ally trigger behavior, and area buff application.
- Battle tempo delay is added:
  - delayed counterattack after player attack
  - staged enemy-turn action timing
  - slower tuned values than the first tempo patch
  - extra breathing room before future cut-in overlays
- Text-free unique-skill cut-in overlay system is added:
  - metadata-driven through `data/skills.js`
  - controller/UI-layer flow, not Phaser-rendered and not merged into `js/core`
  - battle controls lock while the cut-in is visible
  - the cut-in appears before the skill effect resolves
  - first implementation is Yi Sun-sin's `학익진 포격`
- The cut-in overlay is now visually bounded inside the central battlefield board area.
  - it no longer covers the left panel, right panel, bottom command bar, or full browser viewport
  - it remains image-only and data-driven
  - Yi Sun-sin's `학익진 포격` still resolves before skill damage
- Yi Sun-sin's cut-in image size is now reduced inside the board.
  - it feels less like a full-board poster and more like a battlefield insert
  - the battlefield remains partially visible behind it
  - the cut-in remains bounded inside the central battlefield board
  - the cut-in remains image-only
- The decorative diagonal background slash effect is now reduced and constrained.
  - Yi Sun-sin's approved cut-in image size is preserved
  - the slash effect now stays within the central battlefield board area
  - the slash remains behind the image as a supporting motion/impact effect
  - the cut-in remains image-only
- The decorative diagonal background slash effect is now smaller and subtler.
  - Yi Sun-sin's approved cut-in image size is preserved
  - the slash remains bounded inside the central battlefield board
  - the slash no longer visually dominates the cut-in image
  - the cut-in remains image-only
- All four MVP unique skills now have cut-in metadata.
  - Jeong Do-jeon's player-side `개혁령` cut-in now works through the existing player cut-in flow
  - Nobunaga and Kenshin now show unique-skill cut-ins during enemy AI actions
  - enemy skill cut-ins pause the enemy sequence before the skill effect resolves
  - enemy actions remain sequential: cut-in -> skill effect -> next enemy action
  - cut-ins remain image-only and data-driven
- Simple BGM is integrated:
  - `assets/audio/world_map_bgm.mp3`
  - `assets/audio/battle_bgm.mp3`
  - world map BGM on world map
  - battle BGM during battle
  - first-user-interaction autoplay unlock handling
  - only one track at a time
- Persistent Phaser mount behavior is preserved:
  - same `battle.id` reuses the same canvas
  - auto battle no longer flickers
- No SFX was added yet.

## Verification Result
- `node --check js/ui/battle_ui.js` passed.
- `node --check data/skills.js` passed.
- Friendly roster-card selection was wired to the existing unit selection handler rather than adding new battle-selection rules.
- Enemy roster cards remain non-command cards.
- Skill renaming was limited to display text and descriptions in `data/skills.js`.
- Agent docs were updated to reflect the latest `v0.2-9c` state and next priorities.
- This handoff file includes the next chat start prompt.

## Known Issues
- Roster-card selection usability still needs browser tuning after real playtest.
- Cut-in duration and animation may still need tuning after all hero cut-ins are browser-tested.
- Basic attack and some unique skill ranges may overlap or use similar values; revisit later during balance and hero-skill design.
- BGM can be replaced by overwriting the same filenames, but browser cache may require `Ctrl+F5`.
- `14x8` battlefield readability and pacing still need browser verification.
- Initial larger-map unit positions may still need feel tuning after playtest.
- SFX is not integrated yet and remains a follow-up candidate after cut-in work.
- Troop-count visual degradation is still deferred.
- Future UNIT panel should support hero portraits.
- Future settings may include battle speed, BGM volume, SFX volume, mute, and animation skip options.

## Kimjak Check Items
- Confirm the next session starts from `v0.2-9c` and not from an older battle milestone.
- Confirm Direct Codex Paste Mode remains the working method.
- Confirm `agent/CODEX_INBOX.md` is not treated as the main task source.
- Confirm battle rules remain separated from Phaser rendering.
- Confirm hero, skill, roster, and strategy content remain data-driven.
- Confirm the tactical board now renders as `14x8`.
- Confirm the new background `assets/battle/battlefield_14x8_mvp.png` is visible.
- Confirm the battlefield is no longer heavily darkened.
- Confirm the old `assets/battle/battlefield_mvp.png` was not deleted.
- Confirm clicking Yi Sun-sin and Jeong Do-jeon roster cards now selects those friendly units during manual player control.
- Confirm clicking enemy roster cards does not command-select enemy units.
- Confirm roster-card selection is blocked during enemy turn, cut-in/tempo lock, and auto battle.
- Confirm HP bars and labels remain fully readable after roster-selection UI polish.
- Confirm units begin farther apart and do not collide immediately on turn 1.
- Confirm Nobunaga's unique skill name now displays as `삼단격`.
- Confirm Kenshin's unique skill name now displays as `차륜전`.
- Confirm unique skills remain owner-locked and click-to-trigger.
- Confirm `학익진 포격` now shows an image-only cut-in before damage resolves.
- Confirm `개혁령` now also shows an image-only cut-in before the ally buff resolves.
- Confirm the cut-in is confined to the central battlefield board area only.
- Confirm Yi Sun-sin's cut-in image now appears significantly smaller than before.
- Confirm Yi Sun-sin's cut-in image size remains unchanged from the approved `v0.2-8b` result.
- Confirm the decorative diagonal slash effect is smaller and subtler than before.
- Confirm the slash effect remains inside the battlefield board and no longer visually dominates the cut-in.
- Confirm Nobunaga and Kenshin enemy skill cut-ins appear before their skill effects resolve.
- Confirm enemy actions remain sequential and do not re-roll a different AI action after a cut-in.
- Confirm the left panel, right panel, and command bar are not covered.
- Confirm the battlefield remains partially visible behind the cut-in.
- Confirm the cut-in contains no text and locks controls while visible.
- Confirm no tempo-lock issue appears during enemy sequencing or auto battle.
- Confirm the next task should stay focused and avoid adding too many systems at once.
- Confirm no stat rebalance was bundled into this patch.

## Suggested Next Task
Suggested next task: browser-test roster-card selection usability.

Main candidates:

1. Browser-test roster-card selection usability
2. Tune battle difficulty / balance after `14x8` testing
3. SFX / battle sound effects
4. Terrain effects / movement cost prototype
5. Optional enemy info selection UX

## New Chat Start Prompt
채코치, SamWar_web 다음 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.2-9c Unit Roster Selection + Skill Name Polish까지 완료.
- 월드맵 4도시 MVP 작동.
- 월드맵 → 전투 → 승리/후퇴 → 월드맵 복귀 루프 작동.
- 전투 엔진은 Phaser + JS core rules 구조.
- 전투 UI는 좌측 STATUS/BATTLE LOG, 중앙 전장, 우측 UNIT roster, 하단 command bar 구조로 정리됨.
- 이동/방향/공격/특기/책략/롤백/취소/범위표시/BGM까지 1차 구현 완료.
- 전술 전장 크기는 이제 14x8로 확장됨.
- 새 전장 배경 `assets/battle/battlefield_14x8_mvp.png`를 사용하며, 기존 `assets/battle/battlefield_mvp.png`는 롤백/폴백용으로 유지됨.
- 전장 전체를 덮던 강한 어둡기 오버레이는 제거 수준으로 약화되어 새 배경이 더 선명하게 보이도록 조정됨.
- 유닛 토큰 이미지 스프라이트는 이제 약한 alpha 조정으로 살짝 톤다운되어 새 14x8 전장 배경과 더 잘 어우러지도록 조정됨.
- 우측 `UNIT / 부대 목록` 패널에서 아군 유닛 카드를 클릭해 기존 선택 로직으로 유닛 선택이 가능해짐.
- 적군 roster 카드는 이번 패치에서도 표시 전용으로 유지됨.
- MVP 4인 시작 위치가 더 넓은 전장에 맞게 재배치되어 초반 즉시 충돌이 줄어들도록 조정됨.
- 이순신의 학익진 포격은 메타데이터 기반 텍스트 없는 컷인 오버레이를 먼저 표시한 뒤 효과가 적용됨.
- 컷인 오버레이는 이제 중앙 전장 보드 영역 안으로만 제한됨.
- 이순신 컷인 이미지는 이전보다 더 작아져 전장 삽입 연출에 가깝게 조정됨.
- 장식용 대각선 배경 슬래시 효과도 더 작아지고 전장 보드 안에 머물도록 조정됨.
- 장식용 슬래시 효과는 추가로 더 작고 더 은은하게 조정되어 컷인 이미지를 덜 압도하게 됨.
- 네 명의 MVP 영웅 모두 고유 특기 컷인 메타데이터를 가지며, 적 AI 특기 컷인도 순차적으로 `컷인 -> 스킬 효과 -> 다음 행동` 흐름으로 동작하도록 확장됨.
- 노부나가의 고유 특기 표시명은 `삼단격`, 겐신의 고유 특기 표시명은 `차륜전`으로 변경됨.
- 컷인 중에는 전투 조작이 잠기고, SFX는 아직 추가되지 않음.
- 기존 전투 규칙, AI, 컷인 로직, BGM, 월드맵 흐름은 유지되며 이번 패치에서는 스탯 밸런스 변경이 없음.
- HP 바, 라벨, 하이라이트, 컷인, 배경은 이번 패치에서 변경되지 않음.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

먼저 agent 문서 기준으로 현재 상태를 요약하고, 다음 작업 우선순위를 판단해줘.
