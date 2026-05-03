# Current State

## Status
SamWar_web is updated through `v0.2-9 Sequential Unique Skill Cut-ins for All MVP Heroes`, and the agent docs reflect the latest handoff state.

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
- `v0.2-7o` Battle Tempo Slowdown for Cut-in Prep
- `v0.2-8` Unique Skill Cut-in Overlay System
- `v0.2-8a` Cut-in Bounds Fix
- `v0.2-8b` Yi Sun-sin Cut-in Size Tuning
- `v0.2-8c` Cut-in Background Slash Bounds Tuning
- `v0.2-8d` Cut-in Slash Subtle Tuning
- `v0.2-9` Sequential Unique Skill Cut-ins for All MVP Heroes

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
- Battle tempo is now slightly slower:
  - longer counterattack delay
  - clearer pause before enemy turn actions begin
  - more spacing between enemy actions
  - slower but still functional auto-battle pacing
- This slowdown is intended to prepare timing space for the upcoming unique-skill cut-in overlay system.
- A text-free unique-skill cut-in overlay system is now added at the controller/UI layer.
  - metadata-driven through `data/skills.js`
  - image-only overlay with no text
  - battle controls lock while the cut-in is visible
  - the cut-in appears before the actual skill effect resolves
  - first implementation is Yi Sun-sin's `학익진 포격`
- The unique-skill cut-in overlay is now bounded inside the central battlefield board area.
  - it no longer covers the left panel, right panel, bottom command bar, or full browser viewport
  - it remains image-only and data-driven
  - Yi Sun-sin's `학익진 포격` still resolves before skill damage
- Yi Sun-sin's cut-in image size is now reduced relative to the battlefield board.
  - it feels less like a full-board poster and more like a dramatic battlefield insert
  - more battlefield context remains visible behind the image
  - the cut-in remains bounded inside the central battlefield board
  - the cut-in remains image-only
- The decorative diagonal background slash effect is now reduced and constrained.
  - Yi Sun-sin's approved cut-in image size is preserved
  - the slash effect stays within the central battlefield board area
  - the slash remains a secondary supporting effect behind the image
  - the cut-in remains image-only
- The decorative diagonal background slash effect is now smaller and subtler.
  - Yi Sun-sin's approved cut-in image size is preserved
  - the slash remains bounded inside the central battlefield board
  - the slash no longer visually dominates the cut-in image
  - the cut-in remains image-only
- All four MVP unique skills now have cut-in metadata.
  - Yi Sun-sin and Jeong Do-jeon use the existing player-side cut-in flow
  - Nobunaga and Kenshin now show cut-ins during enemy AI skill actions
  - enemy skill cut-ins pause the enemy sequence before the skill effect resolves
  - enemy actions remain sequential: cut-in -> skill effect -> next enemy action
  - cut-ins remain image-only and data-driven
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
1. Enemy cut-in timing may still need browser tuning after real playtest.
2. Basic attack and some unique skill ranges may overlap or share similar values.
   - Revisit later during balance and hero-skill design.
3. BGM can be replaced by overwriting the same filenames.
   - Browser cache may require `Ctrl+F5`.
4. Cut-in duration and animation may still need tuning after all hero cut-ins are browser-tested.
5. SFX is not integrated yet.
   - No SFX was added in `v0.2-8`.
6. Troop-count visual degradation is still deferred.
7. Future UNIT roster panel should support hero portraits.
8. Future settings may include:
   - battle speed
   - BGM volume
   - SFX volume
   - mute
   - animation skip

## Suggested Next Direction
Suggested next task: browser-test and tune enemy cut-in timing if needed.

Main candidates:

1. Browser-test and tune enemy cut-in timing if needed
2. SFX / battle sound effects
3. Tune cut-in duration / animation after all hero cut-ins are tested
4. `14x8` battlefield size test
5. BGM fade / volume / mute options
