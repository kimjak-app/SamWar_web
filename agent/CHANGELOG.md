# Changelog

## Current Recent Flow

### v0.5-9 Battle DOM Unit Visual Polish
- Current working baseline.
- Preserved the DOM battle unit image overlay pilot because it solved sharpness better than Phaser canvas unit rendering.
- First polish already applied:
  - token images enlarged to `124px x 124px`
  - portrait badges enlarged to `40px x 40px`
  - subtle idle animation restored with `battleDomUnitIdle`
  - animation applied only to the inner `.battle-dom-unit-image`
- Phaser still handles background, grid, highlights, selection ring, HP bars, hit zones, status icons, facing text, and battle logic.
- Old Phaser unit image visuals remain behind `USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY` and are hidden with `alpha 0` while the pilot is active.
- Immediate follow-up still needed for portrait size/position and closer status/facing indicators.

### v0.5-8k Mongol / Karakorum Expansion Patch
- Expanded active world from 12 cities to 13 cities.
- Expanded active factions from 12 to 13.
- Added Mongol faction `몽골`.
- Added `karakorum` between `pyeongyang` and `yecheng`.
- Added 징기스칸, 수부타이, 제베.
- Added placeholder skills using supported effect types only.
- Added Karakorum battle roster placement.
- No world-map image asset was added by code in this patch.

### Final 13-City Coordinate Correction
- Applied final corrected coordinates for all 13 cities in `data/cities.js`.
- Set Karakorum to the final measured coordinate from the debug tool.
- Preserved city ids, names, factions, neighbors, and non-coordinate city data.

### World Route Cleanup + Sea-Route-Only Visual Direction
- Pruned unnecessary direct land links for cleaner strategic paths.
- Kept land route graph logically active in data.
- Switched route rendering so only sea routes are visually drawn on the world map.
- Preserved sea-route visibility for:
  - `jianye <-> sabi`
  - `sabi <-> kyushu`
  - `gyeongju <-> kyoto`
  - `gyeongju <-> osaka`
  - `osaka <-> kyushu`
- Kept land roads visually delegated to the map artwork.

### World Map Label Banner Pass
- Replaced old black city labels with faction-color banners.
- Added contrast-aware text colors based on faction color brightness.
- Removed `아군 / 적군` meta text.
- Simplified labels to city-name-only banners.
- Polished them into compact flag-like markers with softer semi-transparent faction fills.
- Current label state is acceptable for now and intentionally paused.

### Battle DOM Unit Image Overlay Pilot
- Investigated battle image sharpness and confirmed source image quality was not the primary issue.
- DOM hero panel images and DOM skill-cutin images were already sharp.
- Phaser canvas battle unit images were the blur hotspot.
- Added a DOM overlay renderer for battle unit token and portrait badge images.
- Kept DOM overlay non-interactive with `pointer-events: none`.
- Left Phaser fallback available behind a feature flag.
- Did not change Phaser global config, image assets, battle logic, trade, domestic, or save/load.

### v0.5-8j World Map Coordinate Tool + Final 12-City Layout
- Added the debug-only `좌표 모드` toggle to the world map.
- OFF state preserves normal city click/select behavior.
- ON state makes city markers draggable and shows `city.id x,y` labels.
- Dragging does not save coordinates automatically.
- This tool was later used to finalize the 13-city layout as well.

## Older Baseline Summary
- `v0.5-8i-2a`: Battle DOM troop label polish.
- `v0.5-8i-2`: Battle DOM Text Overlay MVP.
- `v0.5-8i-1`: West Sea route patch.
- `v0.5-8i`: Baekje + Kyushu expansion patch.
- `v0.5-8h`: Japan triangle micro layout patch.
- `v0.5-8f`: World route layout cleanup.
- `v0.5-8e`: World expansion data patch.
- `v0.5-8d-1` and earlier: city detail UX, trade scaffolding, battle foundation, and save/load groundwork.
