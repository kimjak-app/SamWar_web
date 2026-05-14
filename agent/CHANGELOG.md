# Changelog

## Current Recent Flow

### v0.5-8j World Map Coordinate Tool + Final 12-City Layout
- Current stable handoff baseline.
- Added a debug-only `좌표 모드` toggle to the world map.
- OFF state preserves normal city click/select behavior.
- ON state makes city markers draggable and shows `city.id x,y` labels.
- Drag labels update live and drag end prints `[CITY POS]` plus a copy-ready object string.
- Dragging does not save coordinates and does not mutate `data/cities.js`.
- Applied final 12-city coordinates to `data/cities.js`.
- Verified 12 cities, final coordinate match, key sea route preservation, and app static server response.

### v0.5-8i-2a Battle DOM Text Visual Polish
- Polished the DOM unit troop count label style.
- Reduced the heavy dark box feel into a lighter translucent mini-label.
- Kept a subtle background, light border, and stronger text shadow for readability.
- Preserved player/enemy color distinction.
- CSS/display polish only.
- No battle logic, HP/troop calculation, DOM coordinate, Phaser config, asset, domestic, trade, world-map route, or save/load changes.

### v0.5-8i-2 Battle DOM Text Overlay MVP
- Added a DOM overlay layer above the Phaser battle canvas.
- DOM overlay renders the battle title, battlefield name, instruction copy, bottom status legend, and unit troop count labels.
- Phaser remains responsible for background, grid, unit sprites, highlights, and effects.
- Kept Phaser Text fallback paths available behind the overlay flag.
- Preserved existing displayed troop formula.
- No Phaser config zoom/resolution/pixelArt/roundPixels changes.
- No battle logic, skill logic, troop/HP calculation, image asset, domestic, trade, world-map route, or save/load structure changes.

### v0.5-8i-1 West Sea Route Patch
- Added 건업 <-> 사비 as a sea route.
- Kept 건업 <-> 한성 direct route deferred.
- Reinforced 사비 as the West Sea maritime gateway.
- Preserved 한성/평양 no-direct-Japan rule.
- Preserved 사비 <-> 큐슈 and 경주 <-> 교토/오사카 route roles.
- No naval combat, diplomacy, espionage, enemy AI, asset, Phaser, battle, domestic, or trade formula changes.

### v0.5-8i Baekje + Kyushu Expansion Patch
- Expanded active world from 10 cities to 12 cities.
- Expanded active roster from 27 heroes to about 32 active heroes.
- Expanded active factions from 10 to 12 factions.
- Removed 여포 from the active 조조/위 roster without deleting his data; he is reserve/inactive.
- Added 곽가 to 업성/위 with `heavenly_stratagem`.
- Added 백제 / 사비 with 의자왕, 계백, 흑치상지.
- Added 큐슈 세력 / 큐슈 with 시마즈 요시히로, 고니시 유키나가.
- Added six placeholder-style unique skill IDs; new portraits/cut-ins remain unavailable.

### v0.5-8h Japan Triangle Micro Layout Patch
- Stabilized the 10-city route layout before the Baekje/Kyushu expansion.
- Added 업성 <-> 건업 for a clearer China tension line.
- Rebuilt the Korean Peninsula into a 평양 / 한성 / 경주 triangle.
- Preserved 경주 as the only Korea-to-Japan gateway at that time.
- Rebuilt Japan into a 교토 / 오사카 / 에도 triangle.
- No battle, domestic, trade, diplomacy, espionage, enemy AI, or asset changes.

### v0.5-8f World Route Layout Cleanup
- Cleaned up the 10-city route graph after the world expansion.
- Removed direct 한성 / 평양 routes to Japan.
- Made 경주 the Korea-Japan gateway with sea routes to 교토 and 오사카.
- Repositioned 한성, Japanese cities, and China routes for a cleaner regional layout.
- Added route type metadata for land/sea route rendering.
- Save/load preserves canonical neighbors, route types, and coordinates from current city data.

### v0.5-8e World Expansion Data Patch
- Expanded from 4 cities to 10 cities.
- Expanded from 8 heroes to 27 heroes.
- Expanded to 10 active factions.
- Added Korean, Chinese, and Japanese regional city/faction/hero data.
- Rebuilt battle rosters for all 10 cities.
- Added placeholder unique skills for new heroes.
- Missing new portraits and skill cut-ins intentionally remain `null`.

### v0.5-8d-1 City Detail Position + Toggle UX Patch
- Swapped the right-side world map detail layout so `City Detail` renders before `Selected City`.
- `Selected City` remains the main operation card.
- `City Detail` became the auxiliary tabbed detail card.
- Added City Detail collapse/open UI.
- Preserved tabs: 자원 / 자국무역 / 타국무역.
- UX/layout-only patch.

### v0.5-8c Trade Goods & Control MVP
- Added external trade goods/control scaffolding.
- Active MVP goods: gold, rice, barley, seafood, salt, silk.
- Deferred wood, iron, and horses.
- Added per-city trade settings for auto/direct mode, intensity, export weights, and import priorities.
- Added player-owned city `무역 조정` modal.
- Direct trade settings affect external route value.

## Older Baseline Summary
- `v0.5-8b`: Trade relation / agreement scaffold.
- `v0.5-8`: Inter-faction trade MVP.
- `v0.5-7c`: Internal troop rebalance MVP.
- `v0.5-7`: Internal trade / supply route MVP.
- `v0.5-6`: Faction identity scaffold.
- `v0.5-5b`: Attack/defense empty battlefield render hotfix.
- `v0.5-5a` and earlier: troop allocation, recruitment, domestic effect, save/load, and battle UI foundation.
