# Current State

## Status
SamWar_web GitHub repository has been created and cloned locally.

## Development Mode
Local Codex is the main implementation route.
GitHub is used for backup and version control.
Each completed Codex task now ends with a ChatCoach handoff report.

## Current Phase
Phaser CDN bootstrap for the upcoming v0.2 Battle Scene MVP has been added to the browser entry HTML.
Battle scene is still intentionally unimplemented.

## Implemented Structure
- `index.html` bootstraps the browser MVP and now loads Phaser 3.86.0 from CDN before the app module.
- `css/main.css` styles the temporary fullscreen world map stage, overlay HUD, castle-anchor labels, and attack test state.
- `js/main.js` initializes the app entry point and wires city selection plus attack test rerendering.
- `js/core/app_state.js` owns initial app state assembly and immutable city occupation updates.
- `js/core/world_rules.js` owns faction lookups and world/city rule helpers.
- `js/ui/layout_ui.js` delegates screen rendering to the world map UI module.
- `js/ui/world_map_ui.js` renders the fullscreen map stage, HUD overlays, castle-anchored city markers, attack button, and victory state.
- `data/` contains the temporary 4-city MVP map coordinates with a final Kyoto-only downward micro nudge plus placeholder heroes/skills.
- `agent/HANDOFF_TO_CHATCOACH.md` records the short end-of-task handoff.
