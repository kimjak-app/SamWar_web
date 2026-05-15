# Current State

## Current Baseline
`v0.5-9c-1 Battle Entry Fade SceneReady Hook Fix`

This is the current stable working baseline. Do not treat `v0.5-9`, `v0.5-8k`, `v0.5-8j`, or earlier versions as the active handoff baseline unless explicitly requested.

## Current Completed State
- Active world is now 13 cities / about 35 active heroes / 13 factions.
- Mongol faction and `karakorum` are implemented.
- Final corrected 13-city coordinates are applied in `data/cities.js`.
- World map route visuals render sea routes only.
- City labels are faction-color banners with city-name-only display.
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
- World route visuals render sea routes only.
- Sea routes that must remain visible:
  - `jianye <-> sabi`
  - `sabi <-> kyushu`
  - `gyeongju <-> kyoto`
  - `gyeongju <-> osaka`
  - `osaka <-> kyushu`

## Battle Rendering State
- DOM hero panel images are sharp.
- DOM skill-cutin overlay images are sharp.
- Phaser canvas battle unit images were the blur hotspot.
- `USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY = true` remains active.
- DOM overlay renders token images, portrait badges, and troop labels.
- Phaser still handles background, grid, selection ring, HP bars, hit zones, status icons, facing text, and all battle logic.
- Battle movement presentation is tweened for both player manual moves and enemy AI moves.

## v0.5-9 Battle DOM Unit Visual Polish State
- Token images remain `124px x 124px`.
- Portrait badges are now `70px x 70px`.
- Portrait badge position is attached closely to the unit and should stay that way.
- Idle animation remains on the inner `.battle-dom-unit-image`.
- Status indicator position is acceptable and should remain unchanged.
- Facing text is positioned near the unit center-top.
- Fixed persistent defending text by removing the fixed Phaser `방어` label render.

## v0.5-9b Battle Movement Tween MVP State
- Player manual move uses `250ms` tween presentation.
- Phaser unit stack and DOM overlay stack move together.
- Movement rules in `battle_rules.js` were not changed.
- `main.js` applies a short `280ms` `battleTempoLocked` manual input lock during the move tween.
- `pendingMove.fromX/fromY` is used for presentation only so units appear to travel from previous tile to current tile.

## v0.5-9b-1 Battle Movement Tween Follow-up Fix State
- Fixed the rerender regression where player move presentation could appear to snap back before facing selection.
- `shouldTweenMove === false` now renders from current target `unitPoint`, not old origin position.
- Added AI move `lastAction.presentationMove` metadata for presentation only.
- Move presentation lookup now uses:
  - `pendingMove` first
  - `presentationMove` fallback second
- Enemy AI movement now uses the same `250ms` Phaser + DOM tween presentation path.
- `battle_rules.js` combat rules were not changed; only presentation metadata was added.

## v0.5-9c Battle Entry Wrap Fade Test State
- Added `battle-phaser-host-wrap` opacity `0 -> 1` transition as a mixed Phaser + DOM entry fade.
- The initial double `requestAnimationFrame` ready timing was too early.
- That version could still show DOM military visuals before the battlefield background.

## v0.5-9c-1 Battle Entry Fade SceneReady Hook Fix State
- Wrap fade remains the active battle entry presentation path.
- `is-battle-ready` is now added only after Phaser scene ready.
- Phaser scene ready then triggers one more DOM overlay alignment pass, and the next frame begins wrap fade-in.
- Battlefield, unit visuals, portrait badges, troop labels, and facing indicators now appear as one faded-in block.
- `unitLayer` alpha, hit zones, battle logic, and Phaser config were not changed.

## Immediate Problems To Solve Next
1. Diplomacy / espionage scaffold is still unimplemented.
2. Diplomacy action effects and spy success / failure systems are still unimplemented.
3. Move cancel still snaps back instantly and has no dust / impact polish.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background sharpness pass is still pending.
- City label / flag UI is acceptable for now and should not be re-polished immediately.

## Recommended Next Targets
1. `v0.5-10 Diplomacy & Spy Scaffold`
2. `v0.5-10+ Diplomacy Action Effects`
3. `v0.5-10+ Spy Action Success / Failure System`
4. `Battle Dust FX`
5. `Movement Cancel Tween`
