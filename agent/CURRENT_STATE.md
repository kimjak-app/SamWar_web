# Current State

## Status
SamWar_web GitHub repository has been created and cloned locally.

## Development Mode
Local Codex is the main implementation route.
GitHub is used for backup and version control.
Each completed Codex task now ends with a ChatCoach handoff report.

## Current Phase
Phaser-based v0.2-2 hero-skill battle MVP is now connected to the fullscreen world map loop.
The battle engine now supports a fixed 2v2 hero roster, unique skills, cooldowns, buffs, and simple enemy skill usage, but it is still intentionally far smaller than the Godot battle engine.

## Implemented Structure
- `index.html` bootstraps the browser MVP, keeps the favicon link, and still loads Phaser 3.86.0 from CDN before the app module.
- `css/main.css` styles both the fullscreen world map/HUD flow and the hero-skill battle shell, Phaser mount panel, turn/status HUD, selected-skill box, and responsive battle layout.
- `js/main.js` now routes world-map attacks into battle mode, relays unit select/move/attack/skill/end-turn handlers, runs the simple enemy turn, and returns battle results back to the world map.
- `js/core/app_state.js` owns initial app state assembly plus `world`/`battle` mode transitions, battle entry, retreat, and return-to-world resolution.
- `js/core/world_rules.js` owns faction lookups, world/city rule helpers, occupancy logic, and attacker-city lookup for battle entry.
- `js/core/battle_state.js` creates the immutable tactical battle-state shape with a 10x6 grid, selection/phase/highlight fields, fixed 2v2 hero roster data, and last-action markers for simple visual feedback.
- `js/core/battle_grid.js` owns grid size, Manhattan distance, walkable tile, occupancy, and attack-range helpers.
- `js/core/battle_skills.js` owns skill lookup, availability checks, target resolution, and immutable skill effect application.
- `js/core/battle_ai.js` owns the current simple enemy turn decision helper for chase/attack behavior plus basic enemy damage-skill use.
- `js/core/battle_rules.js` owns the pure tactical rule helpers for selection, movement, basic attack resolution, skill mode/skill use, enemy turns, outcome checks, cooldown/buff turn handling, and Korean battle logs.
- `js/ui/layout_ui.js` routes rendering between the fullscreen world map UI and the battle UI, and cleans up Phaser on return to the map.
- `js/ui/world_map_ui.js` keeps the fullscreen map stage stable while changing the attack CTA to enter battle mode instead of direct occupation.
- `js/ui/battle_ui.js` renders the SamWar hero-skill battle shell, HP/status/log panels, selected-unit and selected-skill panels, skill/end-turn/retreat controls, and Phaser mount container.
- `js/phaser/phaser_battle_mount.js` mounts or destroys the contained Phaser instance safely and falls back gracefully if Phaser is unavailable.
- `js/phaser/battle_scene.js` visualizes the 10x6 battle board, move/attack/skill highlights, hero names, skill cooldown markers, clickable unit/tile input, and lightweight skill hit/buff feedback without owning the battle rules.
- `data/heroes.js`, `data/skills.js`, and `data/battle_rosters.js` now define the fixed MVP hero roster, unique skills, and spawn points instead of placeholder data.
- `agent/HANDOFF_TO_CHATCOACH.md` records the short end-of-task handoff.
