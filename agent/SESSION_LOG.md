# Session Log

## 2026-05-15 — v0.5-9 Battle DOM Unit Visual Polish

### Summary
- Continued from the Mongol / Karakorum world expansion work and moved the project to the new working baseline.
- Finalized the 13-city world map layout and route visual direction.
- Verified that battle unit blur was mainly a Phaser/canvas rendering problem rather than a source-image problem.
- Implemented a narrow DOM overlay pilot for battle unit images.
- Added the first DOM unit visual polish pass with larger images and restored idle motion.

### World Map Expansion And Polish
- Added Mongol faction `몽골`.
- Added `karakorum`.
- Added 징기스칸 / 수부타이 / 제베.
- Expanded world map from 12 cities to 13 cities.
- Applied final corrected 13-city coordinates.
- Set Karakorum final position through the coordinate tool workflow.
- User manually replaced the world map art with final `world_map_mvp.png`.
- Changed city labels from black panels to faction-color banner labels.
- Removed `아군 / 적군` meta text.
- City labels now show only city names.
- Banner label polish was attempted and is acceptable for now.
- Future flag-style city UI can be revisited later.

### World Route Visual Direction
- Land roads are visually represented in the map artwork.
- Land route graph remains logically active.
- World map route rendering now prioritizes sea routes only.
- Sea routes that remain visible:
  - `jianye <-> sabi`
  - `sabi <-> kyushu`
  - `gyeongju <-> kyoto`
  - `gyeongju <-> osaka`
  - `osaka <-> kyushu`

### Battle Image Sharpness Investigation
- DOM hero panel images are sharp.
- DOM skill-cutin overlay images are sharp because they render as DOM `<img>`.
- Phaser canvas battle unit images were blurry.
- Conclusion:
  - source image quality was not the primary issue
  - Phaser/canvas unit image rendering/scaling was the likely problem

### Battle DOM Unit Image Overlay Pilot
- Added `USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY = true`.
- Moved only battle unit token images and portrait badge images to the existing DOM overlay.
- Kept Phaser responsible for:
  - battle background
  - grid
  - highlights
  - selection ring
  - HP bars
  - hit zones
  - status icons
  - facing text
  - battle logic
- Phaser still creates the old unit visuals but hides them with `alpha 0`.
- Fallback remains available by turning the flag off.
- DOM overlay uses `pointer-events: none`.
- DOM unit images render sharply.
- This solved the unit image blur issue.

### Battle DOM Unit First Polish
- Token images enlarged to `124px x 124px`.
- Portrait badges enlarged to `40px x 40px`.
- Added CSS idle animation:
  - `battleDomUnitIdle`
  - `1.05s ease-in-out infinite alternate`
- Animation was applied only to the inner `.battle-dom-unit-image` so outer alignment remains safe.
- Battle logic and Phaser config were not changed.

### Verification Completed
- `node --check data/cities.js` passed.
- `node --check data/factions.js` passed.
- `node --check data/heroes.js` passed.
- `node --check data/skills.js` passed.
- `node --check js/ui/ui_render.js` passed.
- `node --check js/ui/battle_ui.js` passed.
- `node --check js/phaser/battle_scene.js` passed.
- `node --check js/main.js` passed.
- Browser smoke tests showed 0 console errors.
- World map rendered 13 cities.
- Sea-route-only visual rendering worked.
- DOM overlay rendered above Phaser canvas.
- DOM unit images were sharp and did not block clicks.
- Idle animation was active.

### Current Observed Issues
1. Hero portrait badges are still too small and too far from the unit.
2. Hero portrait badge should be `70px`.
3. Hero portrait should be placed as close as possible to the unit, near upper-side / upper-left / side.
4. Portrait should feel attached to the unit, not floating away.
5. Status indicators and facing indicators are too far from the unit.
6. Status/facing indicators should be brought much closer while not covering the portrait.
7. Enemy/player facing direction may need correction:
   - enemy units on the left should face right
   - player units on the right should face left
8. Battlefield background is still slightly blurry, but do not address it yet.
9. Unit movement still snaps like a board piece; tween animation is future work.

### Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background HiDPI / DOM pass is still pending.
- Movement tween animation is still pending.
- City label / flag UI is acceptable for now and should not be further polished immediately.

### Next Immediate Work
`v0.5-9 Battle DOM Unit Visual Polish`

Requirements:
- Hero portrait badge size: `70px`.
- Hero portrait position: very close to the unit, near the unit upper-side / side.
- Status/facing indicators: move much closer to the unit, but do not cover the portrait.
- Keep DOM unit image sharpness.
- Keep DOM overlay non-interactive.
- Keep Phaser hit zones and all battle logic untouched.
- Do not change Phaser config.
- Do not change assets.
- Do not change world map.
- Do not address battlefield background blur yet.
- Do not implement movement tween animation yet.

### Next Candidate Work
1. `v0.5-9a Battle Background Sharpness Pass`
2. `v0.5-9b Battle Movement Animation Pass`
3. `v0.5-10 Diplomacy & Spy Scaffold`
