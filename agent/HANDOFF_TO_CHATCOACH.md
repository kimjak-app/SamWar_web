# Handoff to ChatCoach

## Completed Task
`v0.2-8 Unique Skill Cut-in Overlay System` was completed.

## Changed Files
- `data/skills.js`
- `js/main.js`
- `js/ui/battle_ui.js`
- `css/main.css`
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.2-8 Unique Skill Cut-in Overlay System complete`.
- World map remains fullscreen with 4 MVP cities: `낙양`, `평양`, `한성`, `교토`.
- World map attack loop works: select enemy city -> enter battle -> win or retreat -> return to world map -> victory occupies city.
- Battle remains Phaser-rendered while core rules stay in `js/core`.
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
- `node --check data/skills.js` should pass.
- `node --check js/main.js` should pass.
- `node --check js/ui/battle_ui.js` should pass.
- Existing battle rules were preserved while cut-in sequencing was added at the controller/UI layer.
- Agent docs were updated to reflect the latest `v0.2-8` state and next priorities.
- This handoff file includes the next chat start prompt.

## Known Issues
- Yi Sun-sin cut-in timing, size, and animation may still need visual tuning after browser verification.
- Basic attack and some unique skill ranges may overlap or use similar values; revisit later during balance and hero-skill design.
- BGM can be replaced by overwriting the same filenames, but browser cache may require `Ctrl+F5`.
- Additional cut-in images are not added yet for Jeong Do-jeon, Nobunaga, and Kenshin.
- `14x8` battlefield size test is still pending.
- SFX is not integrated yet and remains a follow-up candidate after cut-in work.
- Troop-count visual degradation is still deferred.
- Future UNIT panel should support hero portraits.
- Future settings may include battle speed, BGM volume, SFX volume, mute, and animation skip options.

## Kimjak Check Items
- Confirm the next session starts from `v0.2-7` and not from an older battle milestone.
- Confirm Direct Codex Paste Mode remains the working method.
- Confirm `agent/CODEX_INBOX.md` is not treated as the main task source.
- Confirm battle rules remain separated from Phaser rendering.
- Confirm hero, skill, roster, and strategy content remain data-driven.
- Confirm unique skills remain owner-locked and click-to-trigger.
- Confirm `학익진 포격` remains an area attack and `개혁령` remains an ally area buff.
- Confirm `학익진 포격` now shows an image-only cut-in before damage resolves.
- Confirm the cut-in contains no text and locks controls while visible.
- Confirm no tempo-lock issue appears during enemy sequencing or auto battle.
- Confirm the next task should stay focused and avoid adding too many systems at once.

## Suggested Next Task
Suggested next task: visually tune Yi Sun-sin's cut-in timing, size, and animation after browser playtest.

Main candidates:

1. Tune Yi Sun-sin cut-in timing / size / animation after visual test
2. Add cut-in images for Jeong Do-jeon, Nobunaga, and Kenshin
3. SFX / battle sound effects
4. `14x8` battlefield size test
5. BGM fade / volume / mute options

## New Chat Start Prompt
채코치, SamWar_web 다음 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.2-8 Unique Skill Cut-in Overlay System까지 완료.
- 월드맵 4도시 MVP 작동.
- 월드맵 → 전투 → 승리/후퇴 → 월드맵 복귀 루프 작동.
- 전투 엔진은 Phaser + JS core rules 구조.
- 전투 UI는 좌측 STATUS/BATTLE LOG, 중앙 전장, 우측 UNIT roster, 하단 command bar 구조로 정리됨.
- 이동/방향/공격/특기/책략/롤백/취소/범위표시/BGM까지 1차 구현 완료.
- 이순신의 학익진 포격은 메타데이터 기반 텍스트 없는 컷인 오버레이를 먼저 표시한 뒤 효과가 적용됨.
- 컷인 중에는 전투 조작이 잠기고, SFX는 아직 추가되지 않음.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

먼저 agent 문서 기준으로 현재 상태를 요약하고, 다음 작업 우선순위를 판단해줘.
