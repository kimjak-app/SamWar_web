# Handoff to ChatCoach

## Completed Task
`v0.2-8d Cut-in Slash Subtle Tuning` was completed.

## Changed Files
- `css/main.css`
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.2-8d Cut-in Slash Subtle Tuning complete`.
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
- No JS syntax check was required because only CSS and agent docs changed.
- Existing cut-in timing flow was preserved while only the decorative slash pseudo-elements were made smaller and subtler.
- Yi Sun-sin's approved `v0.2-8b` cut-in image size was preserved.
- Agent docs were updated to reflect the latest `v0.2-8d` state and next priorities.
- This handoff file includes the next chat start prompt.

## Known Issues
- Additional cut-in images are not added yet for Jeong Do-jeon, Nobunaga, and Kenshin.
- Yi Sun-sin cut-in duration and animation may still need visual tuning after multi-hero browser verification.
- Basic attack and some unique skill ranges may overlap or use similar values; revisit later during balance and hero-skill design.
- BGM can be replaced by overwriting the same filenames, but browser cache may require `Ctrl+F5`.
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
- Confirm `학익진 포격` now shows an image-only cut-in before damage resolves.
- Confirm the cut-in is confined to the central battlefield board area only.
- Confirm Yi Sun-sin's cut-in image now appears significantly smaller than before.
- Confirm Yi Sun-sin's cut-in image size remains unchanged from the approved `v0.2-8b` result.
- Confirm the decorative diagonal slash effect is smaller and subtler than before.
- Confirm the slash effect remains inside the battlefield board and no longer visually dominates the cut-in.
- Confirm the left panel, right panel, and command bar are not covered.
- Confirm the battlefield remains partially visible behind the cut-in.
- Confirm the cut-in contains no text and locks controls while visible.
- Confirm no tempo-lock issue appears during enemy sequencing or auto battle.
- Confirm the next task should stay focused and avoid adding too many systems at once.

## Suggested Next Task
Suggested next task: add cut-in images for Jeong Do-jeon, Nobunaga, and Kenshin.

Main candidates:

1. Add cut-in images for Jeong Do-jeon, Nobunaga, and Kenshin
2. SFX / battle sound effects
3. Tune cut-in duration / animation after multi-hero cut-in test
4. `14x8` battlefield size test
5. BGM fade / volume / mute options

## New Chat Start Prompt
채코치, SamWar_web 다음 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.2-8d Cut-in Slash Subtle Tuning까지 완료.
- 월드맵 4도시 MVP 작동.
- 월드맵 → 전투 → 승리/후퇴 → 월드맵 복귀 루프 작동.
- 전투 엔진은 Phaser + JS core rules 구조.
- 전투 UI는 좌측 STATUS/BATTLE LOG, 중앙 전장, 우측 UNIT roster, 하단 command bar 구조로 정리됨.
- 이동/방향/공격/특기/책략/롤백/취소/범위표시/BGM까지 1차 구현 완료.
- 이순신의 학익진 포격은 메타데이터 기반 텍스트 없는 컷인 오버레이를 먼저 표시한 뒤 효과가 적용됨.
- 컷인 오버레이는 이제 중앙 전장 보드 영역 안으로만 제한됨.
- 이순신 컷인 이미지는 이전보다 더 작아져 전장 삽입 연출에 가깝게 조정됨.
- 장식용 대각선 배경 슬래시 효과도 더 작아지고 전장 보드 안에 머물도록 조정됨.
- 장식용 슬래시 효과는 추가로 더 작고 더 은은하게 조정되어 컷인 이미지를 덜 압도하게 됨.
- 컷인 중에는 전투 조작이 잠기고, SFX는 아직 추가되지 않음.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

먼저 agent 문서 기준으로 현재 상태를 요약하고, 다음 작업 우선순위를 판단해줘.
