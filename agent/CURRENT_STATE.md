# Current State

## Status
SamWar_web GitHub repository has been created and cloned locally.

## Development Mode
Local Codex is the main implementation route.
GitHub is used for backup and version control.
Each completed Codex task now ends with a ChatCoach handoff report.

## Current Phase
Phaser-based v0.2-4a hero battle now uses a generic Godot-inspired strategy action with intelligence-tier random outcomes on top of the existing balance, skill, and facing baseline while staying connected to the fullscreen world map loop.
The battle engine now supports a fixed 2v2 hero roster, owner-locked unique skills, cooldowns, visible battlefield feedback, facing direction, angle-based damage, basic counterattack, defend/wait commands, and intelligence/probability-based strategy actions with random status outcomes, but it is still intentionally far smaller than the full Godot battle engine.

## Implemented Structure
- `index.html` bootstraps the browser MVP, keeps the favicon link, and still loads Phaser 3.86.0 from CDN before the app module.
- `css/main.css` styles both the fullscreen world map/HUD flow and the hero-skill battle shell, Phaser mount panel, turn/status HUD, selected-skill box, and responsive battle layout.
- `js/main.js` now routes world-map attacks into battle mode, relays unit select/move/attack/skill/end-turn handlers, runs the simple enemy turn, and returns battle results back to the world map.
- `js/core/app_state.js` owns initial app state assembly plus `world`/`battle` mode transitions, battle entry, retreat, and return-to-world resolution.
- `js/core/world_rules.js` owns faction lookups, world/city rule helpers, occupancy logic, and attacker-city lookup for battle entry.
- `js/core/battle_state.js` creates the immutable tactical battle-state shape with a 10x6 grid, selection/phase/highlight fields, fixed 2v2 hero roster data, Godot-origin hero balance fields, and last-action markers for battlefield floating feedback.
- `js/core/battle_direction.js` owns facing-direction helpers, attack-angle classification, attack-bonus lookup, and direction-label utilities shared by rules/UI/Phaser.
- `js/core/battle_grid.js` owns grid size, Manhattan distance, walkable tile, occupancy, and attack-range helpers.
- `js/core/battle_skills.js` owns skill lookup, Godot-style attack/defense helpers, owner-locked unique skill validation, AoE/buff skill fidelity, and immutable skill effect application.
- `js/core/battle_strategy.js` owns generic strategy availability/range checks, intelligence-tier outcome pools, success-rate logic, random outcome rolling, status application, and status-duration ticking for confusion/shake.
- `js/core/battle_ai.js` owns the current simple enemy turn decision helper for chase/attack behavior, owner-checked enemy unique-skill use, generic future strategy use, and basic facing updates without manually choosing specific status outcomes.
- `js/core/battle_rules.js` owns the pure tactical rule helpers for selection, movement, choose-facing flow, basic attack resolution, angle bonuses, basic counterattack, defend/wait commands, skill mode/skill use, generic strategy mode/strategy use, enemy turns, outcome checks, cooldown/buff/status turn handling, Godot-inspired damage scaling, and Korean battle logs.
- `js/ui/layout_ui.js` routes rendering between the fullscreen world map UI and the battle UI, and cleans up Phaser on return to the map.
- `js/ui/world_map_ui.js` keeps the fullscreen map stage stable while changing the attack CTA to enter battle mode instead of direct occupation.
- `js/ui/battle_ui.js` renders the SamWar hero battle shell, HP/troop/status/log panels, selected-unit and unique-skill panels, a single strategy action, buff/cooldown state, direction controls, defend/wait controls, and Phaser mount container.
- `js/phaser/phaser_battle_mount.js` mounts or destroys the contained Phaser instance safely and falls back gracefully if Phaser is unavailable.
- `js/phaser/battle_scene.js` visualizes the 10x6 battle board, move/attack/skill/facing/strategy highlights, facing arrows, status markers, defend markers, clickable unit/tile input, and floating skill/damage/angle/counter/status feedback without owning the battle rules.
- `data/heroes.js`, `data/skills.js`, `data/strategies.js`, and `data/battle_rosters.js` now define the fixed MVP hero roster, Godot-inspired hero baseline stats, owner-locked unique skills, a generic strategy action plus random outcome pool, and spawn points instead of placeholder data.
- `agent/HANDOFF_TO_CHATCOACH.md` records the short end-of-task handoff.

## v0.2-2a Notes
- v0.2-2a restored Godot-inspired MVP hero balance fields such as `power`, `intelligence`, `skillRange`, `aiType`, `skillEffectType`, and crit-related values.
- Unique skills are owner-locked and no longer treated as a generic transferable pool.
- 이순신의 `학익진 포격` is now an AoE skill that hits all alive enemies within range.
- 정도전의 `개혁령` now uses a Godot-style `+15%` allied attack buff for 2 turns with visible battlefield feedback.
- Full 책략 system is still intentionally deferred and should later be intelligence/probability-based rather than a cooldown/count-based model.

## v0.2-3 Notes
- v0.2-3 added Godot-inspired facing direction for each unit plus a move → choose-facing → attack flow.
- v0.2-3 added front/side/back attack bonus using the Godot-style `1.0 / 1.15 / 1.30` direction baseline.
- v0.2-3 added basic counterattack for surviving in-range defenders without allowing infinite counter loops.
- v0.2-3 added defend/wait commands plus temporary defend-state damage reduction and visible battlefield/UI feedback.
- Full 책략/status system is still intentionally deferred.

## v0.2-4 Notes
- v0.2-4 added intelligence/probability-based strategy.
- v0.2-4 added confusion and shake status effects.
- Strategy is not cooldown/count-based.
- Full UI polish and advanced AI are still deferred.

## v0.2-4a Notes
- v0.2-4a changed strategy from manual status selection to intelligence-tier random outcome.
- Intelligence 80+ can use strategy.
- Intelligence 90+ unlocks confusion.
- Intelligence 95+ increases status duration.
- Strategy remains probability-based, not cooldown/count-based.
