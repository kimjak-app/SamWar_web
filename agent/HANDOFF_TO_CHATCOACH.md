# Handoff to ChatCoach

## Completed Task
SamWar_web session-close documentation update for new chat handoff was completed after the `v0.2-6b Battle Command Bar + Side Info Layout Patch` milestone.

## Changed Files
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.2-6b Battle Command Bar + Side Info Layout Patch complete`.
- World map remains fullscreen with 4 MVP cities: `낙양`, `평양`, `한성`, `교토`.
- World map attack loop works: select enemy city -> enter battle -> win or retreat -> return to world map -> victory occupies city.
- Battle remains Phaser-rendered while core rules stay in `js/core`.
- Battle layout now consists of:
  - left battle log panel
  - center tactical battlefield board
  - right unit/status information panel
  - bottom fixed command bar
- Battle command buttons are visible at `100%` zoom.
- Battle log and right info panel are both scroll-contained.
- Battle uses:
  - `assets/units/unit_player_mvp.png`
  - `assets/units/unit_enemy_mvp.png`
  - `assets/battle/battlefield_mvp.png`
- Persistent Phaser mount behavior is preserved:
  - same `battle.id` reuses the same canvas
  - auto battle no longer flickers
- Current battle systems include movement, facing, front/side/back attack bonus, attack, counterattack, defend, wait, unique hero skills, skill cooldowns, intelligence-tier random strategy, confusion/shake, role-based AI, and player auto battle.

## Verification Result
- This was a documentation-only task.
- No game code, CSS, assets, battle logic, or world map logic were changed.
- The handoff docs now reflect the latest `v0.2-6b` project state, preserved design decisions, known issues, and next-session agenda.

## Known Issues
- Battle UI still needs further polish in spacing, density, readability, command hierarchy, and board scale balance.
- The current `10x6` battlefield may still feel too small; `14x8` or `16x8` are the preferred next test sizes.
- BGM integration has not started yet.
- Troop-count-based visual degradation is still deferred.
- Difficulty presets are not urgent yet even though current battle difficulty is high.

## Kimjak Check Items
- Confirm the next session starts from `v0.2-6b` and not from an older battle UI milestone.
- Confirm Direct Codex Paste Mode remains the working method.
- Confirm `agent/CODEX_INBOX.md` is not treated as the main task source.
- Confirm battle rules remain separated from Phaser rendering.
- Confirm hero, skill, roster, and strategy content remain data-driven.
- Confirm the fixed MVP roster is still:
  - Player: `이순신`, `정도전`
  - Enemy: `노부나가`, `겐신`
- Confirm unique skills remain owner-locked.
- Confirm strategy remains intelligence/probability-based rather than cooldown/count-based.
- Confirm `v0.2-7` should prioritize UI improvement first, then BGM and battlefield-size testing.

## Suggested Next Task
Suggested next task: `SamWar_web v0.2-7`

Main candidates:

1. Battle UI improvement
   - Highest priority.
   - Clean up the new left/center/right/bottom battle layout.
   - Improve command bar readability.
   - Improve log and unit info density.
   - Reduce clutter while preserving all controls.
2. BGM integration test
   - Add world map BGM.
   - Add battle BGM.
   - Switch or start/stop BGM between world and battle.
   - Keep simple looping first.
3. Battlefield size test
   - Test a larger battlefield because current scale feels small.
   - Preferred candidates: `14x8`, `16x8`.
   - Reposition units and adjust background fit as needed.
4. Troop-count visual stages
   - Lower priority.
   - Defer until after UI, BGM, and board-size testing.

## New Chat Start Prompt
Continue SamWar_web from the latest recorded state after `v0.2-6b Battle Command Bar + Side Info Layout Patch`. This is a Direct Codex Paste Mode workflow, so do not use `agent/CODEX_INBOX.md` as the main task source. Preserve the current fullscreen 4-city world map flow, preserve the Phaser battle renderer with JS core rule separation, and use the handoff docs as the source of truth. Suggested next task is `v0.2-7`, with highest priority on battle UI improvement, then BGM integration testing, then battlefield size testing.
