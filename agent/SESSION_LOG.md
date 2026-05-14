# Session Log

## 2026-05-15 — v0.5-8j World Map Coordinate Tool + Final 12-City Layout

### Summary
- Added World Map City Drag Coordinate Debug Tool.
- Added a `좌표 모드` toggle on the world map.
- Used the coordinate tool workflow to finalize the 12-city layout.
- Applied final city coordinates to `data/cities.js`.
- Preserved the current route graph and key sea routes.

### Coordinate Tool Work
- `좌표 모드` is OFF by default.
- OFF state keeps normal city click/select behavior unchanged.
- ON state makes city markers draggable.
- ON state shows small readable labels above all city markers.
- Label format is `city.id x,y`.
- Labels update live while dragging.
- Drag end prints `[CITY POS] city.id { x, y }`.
- Drag end also prints a copy-ready object string.
- Dragging does not save coordinates automatically.
- Dragging does not mutate `data/cities.js`.
- Refresh/re-render resets visual drag positions unless coordinates are manually applied.

### Final Coordinates Applied
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

### Verification Completed
- `node --check js/ui/ui_render.js` passed.
- `node --check js/ui/world_map_ui.js` passed.
- `node --check js/main.js` passed.
- `node --check data/cities.js` passed.
- Static server response confirmed: `http://127.0.0.1:8000/index.html` -> 200.
- 12 cities confirmed.
- Final coordinates matched.
- Existing key sea routes preserved:
  - `jianye <-> sabi`
  - `sabi <-> kyushu`
  - `gyeongju <-> kyoto`
  - `gyeongju <-> osaka`
  - `osaka <-> kyushu`

### Previous Context
- `v0.5-8i` added 백제 / 사비 and 큐슈 세력 / 큐슈.
- `v0.5-8i-1` added 건업 <-> 사비 as the West Sea route.
- `v0.5-8i-2` added Battle DOM Text Overlay for sharp battle text.
- `v0.5-8i-2a` polished unit troop labels into translucent mini-labels.

### Not Implemented
- No diplomacy.
- No espionage.
- No enemy domestic AI.
- No naval combat implementation.
- No Mongol/northern faction implementation.
- No new portrait or cut-in assets.
- No battle asset HiDPI replacement.
- No battle logic changes.
- No domestic/trade formula changes.
- No save/load structure rewrite.

### Changed Files In This Workstream
- `js/ui/ui_render.js`
- `js/ui/world_map_ui.js`
- `css/main.css`
- `data/cities.js`
- map asset file if currently changed in git status

### Next Candidate Work
1. `v0.5-8k Northern Faction Planning / Genghis Khan Candidate`
2. `v0.5-9 Diplomacy & Spy Scaffold`
3. `Battle DOM Text Scale Up Polish`
4. `Battle Asset HiDPI Pilot`
