# SamWar_web Handoff

## Current Baseline
`v0.5-9 Battle DOM Unit Visual Polish`

Next session should start from this baseline. Before starting new work, read these six agent documents:
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/CURRENT_STATE.md`
- `agent/NEXT_TASKS.md`
- `agent/QA_CHECKLIST.md`
- `agent/CHANGELOG.md`
- `agent/SESSION_LOG.md`

## Current World Structure
- 13 cities.
- About 35 active heroes.
- 13 factions.
- `karakorum` and the Mongol faction are implemented.
- Final 13-city coordinates are applied in `data/cities.js`.
- The user manually replaced the world map art with the final `world_map_mvp.png`.
- City labels now use faction-color banner styling and show only city names.
- World map label polish is paused here and is acceptable for now.

## Completed Since v0.5-8j
- Added Mongol faction `mongol_faction` / `몽골`.
- Added `karakorum` with 징기스칸 / 수부타이 / 제베.
- Expanded the world map from 12 cities to 13 cities.
- Applied final corrected 13-city coordinates, including Karakorum via the coordinate tool.
- Pruned the route graph for cleaner strategic paths.
- Switched world route rendering to sea-route-only visuals while keeping land links logically active.
- Reworked city labels from black panels to faction-color banners, then simplified them to city-name-only banners.
- Investigated battle image sharpness and confirmed Phaser canvas unit rendering was the likely blur source.
- Added the Battle DOM Unit Image Overlay pilot and first visual polish pass.

## Current World Map State
- Land roads remain logically active in `data/cities.js`.
- Land routes are represented visually by the map artwork, not by rendered SVG lines.
- Only sea routes should remain visually rendered:
  - `jianye <-> sabi`
  - `sabi <-> kyushu`
  - `gyeongju <-> kyoto`
  - `gyeongju <-> osaka`
  - `osaka <-> kyushu`
- City labels keep the current faction-color banner shape, one-line city names, and contrast-aware text.
- Further city-label flag polish is intentionally paused for now.

## Battle DOM Unit Image Pilot State
- `USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY = true` is enabled.
- DOM overlay now renders:
  - unit token images
  - portrait badge images
- Phaser still handles:
  - battle background
  - grid
  - highlights
  - selection ring
  - HP bars
  - hit zones
  - status icons
  - facing text
  - movement / attack / skill logic
  - effects
- Phaser still creates the old unit image visuals but hides them with `alpha 0`, so the fallback remains available by turning the flag off.
- DOM overlay uses `pointer-events: none`.
- DOM token images are sharp and solve the previous blur issue.
- First polish already applied:
  - token image size: `124px x 124px`
  - portrait badge size: `40px x 40px`
  - idle animation: `battleDomUnitIdle`
  - timing: `1.05s ease-in-out infinite alternate`
  - animation is applied only to the inner `.battle-dom-unit-image`

## Current Observed Issues
1. Hero portrait badges are still too small and too far from the unit.
2. Hero portrait badge target size should be `70px`.
3. Hero portrait should sit very close to the unit, near the upper-side / upper-left / side.
4. Portrait should feel attached to the unit, not floating away.
5. Status indicators and facing indicators are too far from the unit.
6. Status/facing indicators should move much closer while not covering the portrait.
7. Facing direction may need correction:
   - enemy units on the left should face right
   - player units on the right should face left
8. Battlefield background is still slightly blurry, but do not address it yet.
9. Unit movement still snaps like a board piece; tween animation is future work, not the immediate patch.

## Verification Already Completed
- `node --check data/cities.js` passed.
- `node --check data/factions.js` passed.
- `node --check data/heroes.js` passed.
- `node --check data/skills.js` passed.
- `node --check js/ui/ui_render.js` passed.
- `node --check js/ui/battle_ui.js` passed.
- `node --check js/phaser/battle_scene.js` passed.
- `node --check js/main.js` passed.
- App loaded with no console errors during world-map and battle smoke tests.
- 13 cities confirmed.
- Final 13-city coordinates confirmed.
- Sea-route-only visual rendering confirmed.
- DOM battle unit images confirmed sharp and non-interactive.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background HiDPI / DOM pass is still pending.
- Movement tween animation is still pending.
- City label / flag UI is acceptable for now and should not be polished further immediately.
- Do not change Phaser global config as the first response to battle sharpness issues.

## Next Immediate Target
`v0.5-9 Battle DOM Unit Visual Polish`

Requirements:
- Hero portrait badge size: `70px`.
- Move portrait badge very close to the unit, near the upper-side / side.
- Bring status and facing indicators much closer to the unit without covering the portrait.
- Keep DOM unit image sharpness.
- Keep DOM overlay non-interactive.
- Keep Phaser hit zones and all battle logic untouched.
- Do not change Phaser config.
- Do not change assets.
- Do not change world map.
- Do not address battlefield background blur yet.
- Do not implement movement tween animation yet.

## Next Candidate Targets After v0.5-9
1. `v0.5-9a Battle Background Sharpness Pass`
   - Investigate battlefield background blur separately.
   - Candidate options: 2x background image, DOM background layer, canvas scaling audit.
2. `v0.5-9b Battle Movement Animation Pass`
   - Replace snap movement with tweened movement.
   - Add movement timing / dust / flag motion later if needed.
3. `v0.5-10 Diplomacy & Spy Scaffold`
   - Add enemy information visibility tiers.
   - Add no/partial/detailed spy information states.
   - Limit enemy resources, troops, chancellor, and governor information by spy level.

## Scope Guard
- Do not change battle rules.
- Do not change movement rules yet.
- Do not change attack / skill / strategy logic.
- Do not change troop / HP formulas.
- Do not change Phaser config.
- Do not change image assets.
- Do not change world map or city labels in the next task.
- Do not alter domestic/trade/save-load.
