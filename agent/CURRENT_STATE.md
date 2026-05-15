# Current State

## Current Baseline
`v0.5-9 Battle DOM Unit Visual Polish`

This is the current stable working baseline. Do not treat `v0.5-8j`, `v0.5-8i-2a`, `v0.5-8i-2`, or earlier versions as the active handoff baseline unless explicitly requested.

## Current Completed State
- Active world is now 13 cities / about 35 active heroes / 13 factions.
- Mongol faction and `karakorum` are implemented.
- `karakorum` uses the final measured coordinate from the coordinate tool.
- Final corrected 13-city coordinates are applied in `data/cities.js`.
- The user manually replaced the world map art with the final `world_map_mvp.png`.
- City labels are faction-color banners with city-name-only display.
- City label meta text `아군 / 적군` was removed.
- World map label polish is paused here.

## Final 13-City Coordinates

### Korean Peninsula
- `pyeongyang`: x 39, y 34.
- `hanseong`: x 45, y 52.
- `gyeongju`: x 56, y 65.
- `sabi`: x 50, y 67.

### Mongol Steppe
- `karakorum`: x 27, y 41.

### China
- `yecheng`: x 19, y 50.
- `luoyang`: x 18, y 67.
- `chengdu`: x 14, y 84.
- `jianye`: x 26, y 88.

### Japan
- `kyushu`: x 67, y 86.
- `osaka`: x 75, y 76.
- `kyoto`: x 81, y 64.
- `edo`: x 87, y 57.

## Route State
- Land links remain logically active in `data/cities.js`.
- World route visuals now render sea routes only.
- Sea routes that must remain visible:
  - `jianye <-> sabi`
  - `sabi <-> kyushu`
  - `gyeongju <-> kyoto`
  - `gyeongju <-> osaka`
  - `osaka <-> kyushu`
- Key strategic land paths now include:
  - `yecheng -> karakorum -> pyeongyang`
  - `pyeongyang -> hanseong -> sabi`
  - `pyeongyang -> hanseong -> gyeongju`
  - `osaka -> kyoto -> edo`

## Battle Sharpness Investigation State
- DOM hero panel images are sharp.
- DOM skill-cutin overlay images are sharp.
- Phaser canvas battle unit images were blurry.
- Conclusion: source image quality was not the primary issue.
- Most likely problem area was Phaser/canvas unit image rendering, scaling, or DPR mismatch.

## Battle DOM Overlay State
- Battle DOM Text Overlay from earlier work remains active.
- `USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY = true` is now also active.
- DOM overlay now renders only the battle unit image layer as a pilot:
  - token images
  - portrait badge images
- Phaser still handles background, grid, selection ring, HP bars, hit zones, status icons, facing text, and all battle logic.
- Old Phaser unit image visuals still exist behind the flag and are hidden with `alpha 0`.
- DOM overlay uses `pointer-events: none`.

## Battle DOM Unit First Polish State
- Token images enlarged to `124px x 124px`.
- Portrait badges enlarged to `40px x 40px`.
- Idle animation added:
  - `battleDomUnitIdle`
  - `1.05s ease-in-out infinite alternate`
- Animation is applied only to the inner `.battle-dom-unit-image`, not the outer positioned container.
- DOM unit images remain sharp.
- Battle logic, Phaser config, troop formulas, and save/load were not changed.

## Immediate Problems To Solve Next
1. Portrait badge size is still too small; target is `70px`.
2. Portrait badge sits too far from the unit.
3. Portrait should feel attached to the unit near upper-side / upper-left / side.
4. Status indicators are too far from the unit.
5. Facing indicators are too far from the unit.
6. Indicators should move closer without covering the portrait.
7. Facing direction may need correction:
   - enemy on left should face right
   - player on right should face left
8. Battlefield background blur is still pending, but not for the immediate patch.
9. Snap movement is still present; tween animation is a later task.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background sharpness pass is still pending.
- Movement tween animation is still pending.
- City label / flag UI is acceptable for now and should not be re-polished immediately.

## Recent Work Summary
- `v0.5-8k`: Mongol / Karakorum expansion patch.
- Final 13-city coordinate correction applied.
- Route graph pruned for cleaner strategic paths.
- Route visuals changed to sea-route-only rendering.
- City labels changed from black panels to faction-color banners.
- City label meta text removed; city-name-only labels retained.
- Battle DOM Unit Image Overlay pilot implemented.
- Battle DOM unit first polish implemented.

## Recommended Next Target
`v0.5-9 Battle DOM Unit Visual Polish`
