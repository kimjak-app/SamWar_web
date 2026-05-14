# SamWar_web Handoff

## Current Baseline
`v0.5-8j World Map Coordinate Tool + Final 12-City Layout`

Next session should start from this baseline. Before starting new work, read these six agent documents:
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/CURRENT_STATE.md`
- `agent/NEXT_TASKS.md`
- `agent/QA_CHECKLIST.md`
- `agent/CHANGELOG.md`
- `agent/SESSION_LOG.md`

## Current World Structure
- 12 cities.
- About 32 active heroes.
- 12 factions.
- Total hero data can be higher because 여포 remains reserved/inactive.
- 백제 / 사비 expansion is complete.
- 큐슈 세력 / 큐슈 expansion is complete.
- 조조/위 active roster uses 곽가 instead of 여포.
- Final 12-city world map coordinates are applied in `data/cities.js`.
- Internal/external trade MVP and City Detail tab UX remain intact.

## Completed Since v0.5-8i-2a
- Added World Map City Drag Coordinate Debug Tool.
- Added `좌표 모드` toggle on the world map.
- Applied final measured coordinates to the 12 city objects in `data/cities.js`.
- Verified 12 cities, final coordinate match, and key sea routes.

## Coordinate Tool Behavior
- `좌표 모드` is OFF by default.
- OFF keeps normal city click/select behavior unchanged.
- ON makes city markers draggable.
- ON shows `city.id x,y` labels above every city marker.
- Labels update live while dragging.
- Drag end prints:
  - `[CITY POS] city.id { x, y }`
  - `{ id: "city_id", x: XX, y: YY }`
- Coordinates are not saved automatically.
- Dragging does not mutate `data/cities.js`.
- Refresh/re-render resets visual drag positions unless coordinates are manually applied.

## Final City Coordinates
- 한반도:
  - `sabi`: x 49, y 72.
  - `gyeongju`: x 56, y 61.
  - `hanseong`: x 45, y 53.
  - `pyeongyang`: x 41, y 39.
- 중국:
  - `chengdu`: x 14, y 84.
  - `luoyang`: x 16, y 67.
  - `yecheng`: x 20, y 51.
  - `jianye`: x 27, y 91.
- 일본:
  - `kyushu`: x 67, y 85.
  - `osaka`: x 78, y 81.
  - `kyoto`: x 81, y 67.
  - `edo`: x 89, y 59.

## Key Routes Preserved
- `jianye <-> sabi`
- `sabi <-> kyushu`
- `gyeongju <-> kyoto`
- `gyeongju <-> osaka`
- `osaka <-> kyushu`
- 건업 <-> 한성 direct route remains deferred.
- 한성/평양 direct Japan routes remain absent.

## Verification Already Completed
- `node --check js/ui/ui_render.js` passed.
- `node --check js/ui/world_map_ui.js` passed.
- `node --check js/main.js` passed.
- `node --check data/cities.js` passed.
- Static server response confirmed: `http://127.0.0.1:8000/index.html` -> 200.
- 12 cities confirmed.
- Final coordinates matched.
- Existing key sea routes preserved.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- New portrait/cutin assets for Baekje/Kyushu heroes are still missing.
- Battle DOM text scale-up polish is still pending.
- Battle asset HiDPI pass is still pending.
- Northern/Mongol faction idea is only a future candidate, not implemented.

## Next Candidate Targets
1. `v0.5-8k Northern Faction Planning / Genghis Khan Candidate`
   - Consider 북방초원 / 몽골 세력 between `pyeongyang` and `yecheng`.
   - Candidate city: `karakorum`.
   - Candidate heroes: 징기스칸, 수부타이, 제베.
   - Candidate routes: `karakorum <-> pyeongyang`, `karakorum <-> yecheng`.
   - Do not implement unless explicitly requested.
2. `v0.5-9 Diplomacy & Spy Scaffold`
   - Add enemy information visibility tiers.
   - Add no/partial/detailed spy information states.
   - Limit enemy resources, troops, chancellor, and governor information.
3. `Battle DOM Text Scale Up Polish`
   - Increase unit troop label readability.
   - Increase upper-right selected unit/hero info panel text.
   - Increase bottom status legend text.
4. `Battle Asset HiDPI Pilot`
   - Test 2x hero face assets and one 2x unit sprite.
   - Keep displayed size unchanged.

## Scope Guard
- Do not alter battle logic.
- Do not alter domestic/trade formulas.
- Do not alter save/load structure.
- Do not change route graph unless explicitly requested.
- Do not implement Mongol faction yet.
- Do not implement diplomacy/espionage unless explicitly requested.
- Do not reintroduce window compatibility.
