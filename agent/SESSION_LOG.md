# Session Log

## 2026-05-14 — v0.5-8i-1 West Sea Route Patch

### Summary
- Added a West Sea route between 건업 and 사비.
- Kept 건업 <-> 한성 direct route deferred.
- Preserved 한성/평양 no-direct-Japan rule.
- Advanced save version to `v0.5-8i-1`.
- Did not implement naval combat, diplomacy, espionage, enemy AI, assets, Phaser changes, battle logic, or domestic/trade formula changes.

### Previous v0.5-8i Summary
- Expanded the v0.5-8h 10-city world into a 12-city active world.
- Added 백제 / 사비 and 큐슈 세력 / 큐슈 before starting diplomacy or espionage.
- Changed 조조/위 active roster from 조조 / 순욱 / 여포 to 조조 / 순욱 / 곽가.
- Kept 여포 data as reserve/inactive for later reuse.
- Added six new unique skill IDs as placeholder-style skills.
- Advanced save version to `v0.5-8i`.

### Data Changes
- Active world: 12 cities / 32 active heroes / 12 factions.
- Total hero data can be 33 because 여포 remains in reserve.
- New 백제 heroes: 의자왕, 계백, 흑치상지.
- New 큐슈 heroes: 시마즈 요시히로, 고니시 유키나가.
- New 위 hero: 곽가.
- New cities: 사비, 큐슈.
- New factions: `baekje_faction`, `kyushu_faction`.

### Route Changes
- Added 건업 <-> 사비 as a sea route.
- Added 한성 <-> 사비.
- Added 사비 <-> 경주.
- Added 사비 <-> 큐슈 as western sea route.
- Added 큐슈 <-> 오사카.
- Preserved 경주 <-> 교토 / 오사카 as eastern sea routes.
- 한성 and 평양 still do not directly connect to Japan.
- 건업 and 한성 are still not directly connected.

### Verification
- `node --check` passed for modified data/core files and requested regression targets.
- Smoke test passed for 12 cities, 32 active heroes, 12 factions, new ownerships, new rosters, routes, 여포 reserve state, and `v0.5-8i-1` save version.

### Not Implemented
- No diplomacy.
- No espionage.
- No enemy domestic AI.
- No naval combat implementation.
- No new portrait or cut-in assets.
- No Phaser Scene changes.
- No battle engine overhaul.
- No domestic/trade formula changes.

### Next Work
1. `v0.5-8i-2 Browser QA / West Sea Route Regression`
2. `v0.5-8j World Map Background Draft Prep`
3. `v0.5-9 Diplomacy & Spy Scaffold`
