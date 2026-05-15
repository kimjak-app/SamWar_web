# Changelog

## Current Recent Flow

### v0.5-9c-1 Battle Entry Fade SceneReady Hook Fix
- Current working baseline.
- Kept the wrap-level battle entry opacity fade from `v0.5-9c`.
- Removed the early ready timing that ran immediately after `renderBattleDomOverlay()`.
- `phaser_battle_mount.js` now forwards `onBattleSceneReady` after storing `currentScene` and syncing battle state.
- `battle_ui.js` now waits for Phaser scene ready, reruns DOM overlay alignment once, and then starts wrap fade on the next frame.
- Battlefield background, DOM unit, portrait badge, troop label, and facing indicators now fade in as one block.
- Preserved `unitLayer` alpha, hit zones, battle logic, and Phaser config.

### v0.5-9c Battle Entry Wrap Fade Test
- Added `battle-phaser-host-wrap` opacity `0 -> 1` transition.
- First timing attempt used double `requestAnimationFrame` immediately after `renderBattleDomOverlay()`.
- That version improved full-stack fade behavior but still allowed DOM military visuals to appear before the battlefield background.

### v0.5-9b-1 Battle Movement Tween Follow-up Fix
- Fixed the rerender bug where player move presentation could appear to return to the old tile before facing selection.
- `battle_scene.js` now renders from target `unitPoint` whenever a move tween should not replay.
- Added `lastAction.presentationMove` for enemy AI movement presentation metadata only.
- Move presentation lookup now uses `pendingMove` first and `presentationMove` as fallback.
- Enemy AI movement now uses the same `250ms` Phaser + DOM tween path as player movement.
- Preserved battle rules, movement rules, attack / skill / strategy logic, and troop formulas.

### v0.5-9b Battle Movement Tween MVP
- Added `250ms` tween presentation for player manual movement.
- Phaser unit stack now moves smoothly instead of snapping.
- DOM unit image, portrait badge, and troop label move with the same direction and duration.
- Added a short `280ms` `battleTempoLocked` manual-input lock during move tween playback in `main.js`.
- Preserved `battle_rules.js` movement logic and used existing `pendingMove` data for presentation only.

### v0.5-9a Battle Entry Curtain Fade Fix
- Added a DOM `battle-entry-curtain` above the battle board stack.
- Curtain covers Phaser canvas and DOM overlay together during battle entry.
- Curtain starts opaque and fades out after the first `renderBattleDomOverlay()` render completes.
- Fade-out is one-shot guarded and the curtain is removed after completion.
- Replaced Phaser `camera.fadeIn()` with DOM curtain fade-out because the battle presentation is a mixed Phaser canvas + DOM overlay stack.
- Preserved battle logic, Phaser config, and DOM overlay hit behavior.

### v0.5-9 Battle DOM Unit Visual Polish
- Preserved the DOM battle unit image overlay pilot because it solved sharpness better than Phaser canvas unit rendering.
- Token images enlarged to `124px x 124px`.
- Portrait badges enlarged and finalized at `70px x 70px`.
- Portrait badges were repositioned to feel attached closely to the unit.
- Status indicator position was tuned and is now considered acceptable.
- Facing text was moved near the unit center-top.
- Removed persistent fixed Phaser `방어` text around defending units while keeping defending state icons/effects.
- Idle animation remains on the inner `.battle-dom-unit-image`.

### v0.5-8k Mongol / Karakorum Expansion Patch
- Expanded active world from 12 cities to 13 cities.
- Expanded active factions from 12 to 13.
- Added Mongol faction `몽골`.
- Added `karakorum` between `pyeongyang` and `yecheng`.
- Added 징기스칸, 수부타이, 제베.
- Added placeholder skills using supported effect types only.
- Added Karakorum battle roster placement.

### Final 13-City Coordinate Correction
- Applied final corrected coordinates for all 13 cities in `data/cities.js`.
- Set Karakorum to the final measured coordinate from the debug tool.

### World Route Cleanup + Sea-Route-Only Visual Direction
- Pruned unnecessary direct land links for cleaner strategic paths.
- Kept land route graph logically active in data.
- Switched route rendering so only sea routes are visually drawn on the world map.

### World Map Label Banner Pass
- Replaced old black city labels with faction-color banners.
- Removed `아군 / 적군` meta text.
- Simplified labels to city-name-only banners.
- Current label state is acceptable for now and intentionally paused.

### Battle DOM Unit Image Overlay Pilot
- Confirmed source image quality was not the main issue for battle blur.
- Added a DOM overlay renderer for battle unit token and portrait badge images.
- Kept DOM overlay non-interactive with `pointer-events: none`.
- Left Phaser fallback available behind a feature flag.

## Older Baseline Summary
- `v0.5-8j`: World map coordinate tool + final 12-city layout.
- `v0.5-8i-2a`: Battle DOM troop label polish.
- `v0.5-8i-2`: Battle DOM Text Overlay MVP.
- `v0.5-8i-1`: West Sea route patch.
- `v0.5-8i`: Baekje + Kyushu expansion patch.
- `v0.5-8h` and earlier: world layout cleanup, city detail UX, trade scaffolding, battle foundation, and save/load groundwork.
