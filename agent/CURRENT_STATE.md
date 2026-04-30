# Current State

## Status
SamWar_web GitHub repository has been created and cloned locally.

## Development Mode
Local Codex is the main implementation route.
GitHub is used for backup and version control.
Each completed Codex task now ends with a ChatCoach handoff report.

## Current Phase
World map 4-city MVP verification patch completed.
Battle scene is still intentionally unimplemented.

## Implemented Structure
- `index.html` bootstraps the browser MVP.
- `css/main.css` styles the responsive 4-city world map screen and attack test state.
- `js/main.js` initializes the app entry point and wires city selection plus attack test rerendering.
- `js/core/app_state.js` owns initial app state assembly and immutable city occupation updates.
- `js/core/world_rules.js` owns faction lookups and world/city rule helpers.
- `js/ui/layout_ui.js` delegates screen rendering to the world map UI module.
- `js/ui/world_map_ui.js` renders the world map, city nodes, attack button, and victory state.
- `data/` contains the 4-city MVP map and placeholder heroes/skills.
- `agent/HANDOFF_TO_CHATCOACH.md` records the short end-of-task handoff.
