# Current State

## Status
SamWar_web documentation is updated for clean new-chat handoff after the `v0.2-7 UI/UX Polish + Simple BGM Integration` milestone.

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
- `v0.2-7` Battle UI/UX Polish + Simple BGM Integration

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
- Battle layout is now:
  - left `STATUS / 전황 보고` + `BATTLE LOG / 전투 기록`
  - center tactical battlefield board
  - right `UNIT / 부대 목록` roster panel
  - bottom fixed command bar
- Bottom command buttons are centered, larger, and command-only.
- Selected unit summary is shown in the battle board header area.
- Bottom facing panel was removed.
- Facing selection happens inside the battlefield only.
- Facing tile input priority works even when overlapping unit hit zones.
- Right panel is simplified to roster cards only.
- Selected unit card is highlighted in the roster.
- Visible `HP` label was renamed to `전열` while keeping internal `hp/maxHp` data and logic.
- Battle log remains scroll-contained and does not push the command bar down.
- Right unit roster panel remains internally scrollable.
- Battle uses:
  - `assets/units/unit_player_mvp.png`
  - `assets/units/unit_enemy_mvp.png`
  - `assets/battle/battlefield_mvp.png`
- Simple BGM system is integrated:
  - `assets/audio/world_map_bgm.mp3`
  - `assets/audio/battle_bgm.mp3`
  - world map BGM on world map
  - battle BGM during battle
  - first-user-interaction autoplay unlock handling
  - only one BGM track plays at a time
- Persistent Phaser mount is preserved:
  - same `battle.id` reuses the same Phaser canvas
  - auto battle no longer flickers
- Current battle systems include:
  - movement
  - hold-position facing
  - facing direction
  - front/side/back attack bonus
  - basic attack
  - delayed counterattack tempo
  - defend
  - wait
  - unique hero skills
  - skill cooldowns
  - intelligence-tier random strategy
  - confusion/shake status effects
  - role-based AI
  - player auto battle
  - right-click move rollback before facing confirm
  - right-click action-mode cancel
  - full attack/skill/strategy range display
  - valid target emphasis separate from full range

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
6. Unique skills are owner-locked and click-to-trigger.
   - `이순신`: `학익진 포격`
   - `정도전`: `개혁령`
   - `노부나가`: `화승총 사격`
   - `겐신`: `돌격`
7. Skill targeting is metadata-driven.
   - Use skill metadata such as `targetSide`, `areaType`, and related fields.
   - Avoid hero-name hardcoding for future skill expansion.
8. Strategy is not a cooldown/count skill.
   - Strategy is intelligence/probability-based.
   - Intelligence `80+` unlocks strategy.
   - Intelligence `90+` unlocks `혼란`.
   - Intelligence `95+` extends status duration.
9. `학익진 포격` remains an area attack against valid enemies in range.
10. `개혁령` remains an ally area buff.
   - full range displayed
   - valid allied targets highlighted
   - clicked ally is trigger only
   - buff applies to all valid allies in range
11. UI/BGM are now in usable MVP state, but polish is still ongoing.

## Known Issues / Improvement Candidates
1. Battle tempo may still be slightly fast.
   - Tune later after BGM/SFX/effects work.
2. Basic attack and some unique skill ranges may overlap or share similar values.
   - Revisit later during balance and hero-skill design.
3. BGM can be replaced by overwriting the same filenames.
   - Browser cache may require `Ctrl+F5`.
4. Battlefield size test is still pending.
   - Candidate: `14x8`
5. SFX is not integrated yet.
6. Troop-count visual degradation is still deferred.
7. Future UNIT roster panel should support hero portraits.
8. Future settings may include:
   - battle speed
   - BGM volume
   - SFX volume
   - mute
   - animation skip

## Suggested Next Direction
Suggested next task: review `v0.2-7` final state and choose one focused next step.

Main candidates:

1. SFX / battle sound effects
2. `14x8` battlefield size test
3. Battle impact/effects polish
4. BGM fade/volume/mute options
5. Hero portrait-ready UNIT roster card structure
