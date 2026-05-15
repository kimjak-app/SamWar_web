# Current State

## Current Baseline
`v0.5-9a Battle Entry Curtain Fade Fix`

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

## v0.5-9 Battle DOM Unit Visual Polish State
- Token images remain `124px x 124px`.
- Portrait badges are now `70px x 70px`.
- Portrait badge position is attached closely to the unit and should stay that way.
- Idle animation remains on the inner `.battle-dom-unit-image`.
- Status indicator position is acceptable and should remain unchanged.
- Facing text is positioned near the unit center-top.
- Fixed persistent defending text by removing the fixed Phaser `방어` label render.

## v0.5-9a Battle Entry Curtain Fade Fix State
- Added `.battle-entry-curtain` above the Phaser host and DOM overlay stack.
- Curtain is `pointer-events: none`.
- Curtain starts fully opaque and fades out with `.is-fading-out`.
- Fade-out is triggered from `renderBattleDomOverlay()` immediately after the first DOM overlay render completes.
- Fade-out is guarded to run once only.
- Curtain is removed after fade-out.
- Phaser `camera.fadeIn()` was removed because it only affected canvas and created a mismatched mixed-media transition.

## Immediate Problems To Solve Next
1. Battlefield background is still slightly blurry and needs a dedicated pass.
2. Unit movement still snaps like a board piece; tween animation is a later task.
3. Diplomacy / espionage scaffold is still unimplemented.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background sharpness pass is still pending.
- Movement tween animation is still pending.
- City label / flag UI is acceptable for now and should not be re-polished immediately.

## Recommended Next Targets
1. `v0.5-9b Battle Background Sharpness Pass`
2. `v0.5-9c Battle Movement Animation Pass`
3. `v0.5-10 Diplomacy & Spy Scaffold`
