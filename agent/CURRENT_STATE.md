# Current State

## Current Baseline
`v0.5-9b-1 Battle Movement Tween Follow-up Fix`

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
- `main.js` applies a short manual input lock during the move tween.

## v0.5-9b-1 Battle Movement Tween Follow-up Fix State
- Fixed the rerender regression where player move presentation could appear to snap back before facing selection.
- `shouldTweenMove === false` now renders from current target position, not old origin position.
- Added AI move `lastAction.presentationMove` metadata for presentation only.
- Move presentation lookup now uses:
  - `pendingMove` first
  - `presentationMove` fallback second
- Enemy AI movement now uses the same `250ms` Phaser + DOM tween presentation path.
- `battle_rules.js` combat rules were not changed; only presentation metadata was added.

## Immediate Problems To Solve Next
1. Battlefield background is still slightly blurry and needs a dedicated pass.
2. Move cancel still snaps back instantly and has no dust / impact polish.
3. Diplomacy / espionage scaffold is still unimplemented.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background sharpness pass is still pending.
- City label / flag UI is acceptable for now and should not be re-polished immediately.

## Recommended Next Targets
1. `v0.5-9c Battle Background Sharpness Pass`
2. `v0.5-9d Battle Movement Cancel Tween / Dust FX`
3. `v0.5-10 Diplomacy & Spy Scaffold`
