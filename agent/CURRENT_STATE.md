# Current State

## Status
SamWar_web documentation is updated for clean new-chat handoff after the `v0.2-6b Battle Command Bar + Side Info Layout Patch` milestone.

## Working Method
- Direct Codex Paste Mode is the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- GitHub is used for backup and version control.
- ChatCoach handoff docs are maintained at the end of meaningful Codex task sessions.

## Current Milestone
Current recorded build state:

- `v0.1` Fullscreen World Map 4-City MVP
- `v0.2` Battle Scene MVP with Phaser
- `v0.2-1` Godot Grid/Unit Battle Core Port
- `v0.2-2` Hero Skill Core MVP
- `v0.2-2a` Godot Balance & Unique Skill Fidelity Patch
- `v0.2-3` Facing / Counter / Defend / Wait
- `v0.2-4` Strategy / Status Effect Core
- `v0.2-4a` Strategy Random Outcome Fidelity
- `v0.2-5` AI / Auto Battle / Balance Stabilization
- `v0.2-5a` Auto Battle Flicker Fix / Persistent Phaser Mount
- `v0.2-6` Battle Unit Token Visual Patch
- `v0.2-6a` Battle Background Visual Patch
- `v0.2-6b` Battle Command Bar + Side Info Layout Patch

## Current Working State Summary
- World map is fullscreen and uses 4 MVP cities:
  - `낙양`
  - `평양`
  - `한성`
  - `교토`
- World map attack flow works:
  - select enemy city
  - enter battle
  - win/retreat
  - return to world map
  - victory occupies city
- Battle engine is Phaser-based and connected to JS core rules.
- Battle screen now has:
  - left battle log panel
  - center tactical battlefield board
  - right unit/status information panel
  - bottom fixed command bar
- Battle command buttons are visible at `100%` zoom.
- Battle log is scroll-contained and does not push layout down.
- Right info panel is scroll-contained.
- Battle uses unit token images:
  - `assets/units/unit_player_mvp.png`
  - `assets/units/unit_enemy_mvp.png`
- Battle uses background image:
  - `assets/battle/battlefield_mvp.png`
- Persistent Phaser mount is preserved:
  - same `battle.id` reuses the same Phaser canvas
  - auto battle no longer flickers
- Current battle systems include:
  - movement
  - facing direction
  - front/side/back attack bonus
  - basic attack
  - counterattack
  - defend
  - wait
  - unique hero skills
  - skill cooldowns
  - intelligence-tier random strategy
  - confusion/shake status effects
  - role-based AI
  - player auto battle

## Design Decisions To Preserve
1. Direct Codex Paste Mode is the working method.
   - `CODEX_INBOX.md` is not the main task source.
2. Battle rules must stay separated from Phaser renderer.
   - Core rules live in `js/core`.
   - Phaser only renders and relays input.
3. Heroes and skills are data-driven.
   - Hero data lives in `data/heroes.js`.
   - Skill data lives in `data/skills.js`.
   - Rosters live in `data/battle_rosters.js`.
   - Strategy data lives in `data/strategies.js`.
4. MVP roster is fixed for now.
   - Player: `이순신`, `정도전`
   - Enemy: `노부나가`, `겐신`
5. This is not hardcoded final design.
   - Later expansion should support hero selection, city garrison, sortie selection, and more heroes.
6. Unique skills are owner-locked.
   - `이순신`: `학익진 포격`
   - `정도전`: `개혁령`
   - `노부나가`: `화승총 사격`
   - `겐신`: `돌격`
7. Strategy is not a cooldown/count skill.
   - Strategy is intelligence/probability-based.
   - Intelligence `80+` unlocks strategy.
   - Intelligence `90+` unlocks `혼란`.
   - Intelligence `95+` extends status duration.
8. UI polish is still ongoing.
   - `v0.2-6b` completed the first usable battle UI layout.
   - More detailed UI work is expected in `v0.2-7`.

## Known Issues / Improvement Candidates
1. Battle UI still needs polish.
   - Button spacing
   - panel density
   - unit info readability
   - command bar visual hierarchy
   - battle board scale and empty spacing
2. Battle board may still feel too small.
   - Consider enlarging the battlefield from current `10x6` toward a larger test board.
   - Candidate: `14x8` or `16x8` first, not full `2x` immediately.
   - Must preserve battle tempo and AI behavior.
3. BGM has not been integrated yet.
   - User already has BGM prepared.
   - Need world map BGM and battle BGM test integration.
   - Goal is atmosphere check, not final sound system.
4. Unit visual degradation by troop count is not implemented.
   - Future idea:
     - full strength image
     - damaged/low troop image
     - near-defeated image
   - Defer until after UI/BGM/board-size tests.
5. Difficulty preset is not urgent today.
   - Battle is currently hard.
   - Difficulty presets can be added later.

## Suggested Next Direction
Suggested next task: `SamWar_web v0.2-7`

Main candidates:

1. Battle UI improvement
   - This is the highest priority.
   - Clean up the new left/center/right/bottom battle layout.
   - Improve command bar readability.
   - Improve log and unit info density.
   - Reduce visual clutter while preserving all controls.
2. BGM integration test
   - Add world map BGM.
   - Add battle BGM.
   - Start/stop or switch BGM between world and battle modes.
   - Keep simple loop behavior first.
   - No advanced audio settings yet.
3. Battlefield size test
   - Current battlefield feels too small.
   - Test larger battlefield size.
   - Candidate sizes:
     - `14x8`
     - `16x8`
   - Avoid jumping directly to an overly large board if it hurts tempo.
   - May require repositioning units and adjusting background fit.
4. Troop-count visual stages
   - Good future idea but lower priority.
   - Requires additional unit image assets.
   - Defer until after UI/BGM/battlefield-size work.
