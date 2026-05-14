# SamWar_web Handoff

## Current Baseline
`v0.5-8i-2a Battle DOM Text Visual Polish`

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
- Internal/external trade MVP and City Detail tab UX remain intact.

## Completed Today
- `v0.5-8i Baekje + Kyushu Expansion Patch`
- `v0.5-8i-1 West Sea Route Patch`
- `v0.5-8i-2 Battle DOM Text Overlay MVP`
- `v0.5-8i-2a Battle DOM Text Visual Polish`

## v0.5-8i Summary
- Added 백제 세력 and 사비.
- Added 의자왕 / 계백 / 흑치상지.
- Added 큐슈 세력 and 큐슈.
- Added 시마즈 요시히로 / 고니시 유키나가.
- Added 곽가 to 조조/위 and removed 여포 from active roster.
- Added six new unique skill IDs as placeholder-style skills.
- New portrait/cutin assets are not available yet.

## v0.5-8i-1 Summary
- Added 건업 <-> 사비 as a West Sea route.
- Kept 건업 <-> 한성 direct route deferred.
- 사비 now serves as the West Sea maritime gateway.
- 한성 and 평양 still do not directly connect to Japan.

## v0.5-8i-2 Summary
- Added DOM Text Overlay above the Phaser battle canvas.
- Moved battle title, battlefield name, instruction text, status legend, and unit troop labels to DOM for sharper text.
- Phaser still handles battle background, grid, unit sprites, highlights, and effects.
- Battle logic, troop/HP calculation, and Phaser config were not changed.

## v0.5-8i-2a Summary
- Polished unit troop number labels.
- Replaced the heavy black-box feel with a lighter translucent mini-label style.
- Kept DOM Text Overlay behavior.
- Did not change battle logic, Phaser config, troop calculation, or overlay coordinate math.

## Important Warnings
- Diplomacy and espionage are not implemented yet.
- Enemy domestic AI is not implemented yet.
- Naval combat is not implemented yet.
- 건업 <-> 한성 direct route is not implemented.
- New hero portrait images do not exist yet.
- New hero skill cut-in images do not exist yet.
- New unique skills are MVP placeholders.
- The world-map background image has not been redrawn for the 12-city layout.
- Battle hero faces, unit sprites, and background images still need a future HiDPI/asset pass.

## Next Candidate Targets
1. `v0.5-8i-2c Battle DOM Text Scale Up Polish`
   - Increase unit troop number size.
   - Increase upper-right selected unit/hero info panel text.
   - Increase bottom status legend text.
   - Adjust top title / battlefield name size.
2. `v0.5-8i-3 Battle Asset HiDPI Pilot`
   - Test 2x-resolution hero face assets for 1-2 samples.
   - Test one 2x-resolution soldier sprite.
   - Keep displayed size unchanged.
3. `v0.5-9 Diplomacy & Spy Scaffold`
   - Add enemy information visibility tiers.
   - Add no/partial/detailed spy information states.
   - Hide or limit enemy resources, troops, chancellor, and governor information.

## Scope Guard
Unless explicitly requested, do not add:
- Full diplomacy AI.
- Espionage logic.
- Enemy domestic automation.
- Naval combat.
- New assets.
- Battle engine overhaul.
- Phaser config zoom/resolution changes.
- Domestic formula changes.
- Trade formula changes.
- Save/load structure rewrite.
- Window compatibility reintroduction.
