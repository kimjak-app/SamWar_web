# Handoff to ChatCoach

## Completed Task
SamWar_web session-close documentation update was completed after the `v0.2-7 UI/UX Polish + Simple BGM Integration` milestone.

## Changed Files
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.2-7 UI/UX Polish + Simple BGM Integration complete`.
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

## Verification Result
- This was a documentation-only task.
- Only the four agent documents were changed.
- No game code, CSS, assets, audio files, battle logic, or world map logic were changed.
- The docs now reflect the latest `v0.2-7` UI/UX + BGM state.
- This handoff file includes the next chat start prompt.

## Known Issues
- Battle tempo may still be slightly fast and can be tuned later after BGM/SFX/effects work.
- Basic attack and some unique skill ranges may overlap or use similar values; revisit later during balance and hero-skill design.
- BGM can be replaced by overwriting the same filenames, but browser cache may require `Ctrl+F5`.
- `14x8` battlefield size test is still pending.
- SFX is not integrated yet.
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
- Confirm battle UI/BGM are in MVP-usable state, but more polish is still expected.
- Confirm the next task should stay focused and avoid adding too many systems at once.

## Suggested Next Task
Suggested next task: review `v0.2-7` final state and choose one focused priority.

Main candidates:

1. SFX / battle sound effects
2. `14x8` battlefield size test
3. Battle impact/effects polish
4. BGM fade/volume/mute options
5. Hero portrait-ready UNIT roster card structure

## New Chat Start Prompt
채코치, SamWar_web 다음 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.2-7 UI/UX polish and Simple BGM Integration까지 완료.
- 월드맵 4도시 MVP 작동.
- 월드맵 → 전투 → 승리/후퇴 → 월드맵 복귀 루프 작동.
- 전투 엔진은 Phaser + JS core rules 구조.
- 전투 UI는 좌측 STATUS/BATTLE LOG, 중앙 전장, 우측 UNIT roster, 하단 command bar 구조로 정리됨.
- 이동/방향/공격/특기/책략/롤백/취소/범위표시/전투템포/BGM까지 1차 구현 완료.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

먼저 agent 문서 기준으로 현재 상태를 요약하고, 다음 작업 우선순위를 판단해줘.
