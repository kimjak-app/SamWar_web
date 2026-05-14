# Session Log

## 2026-05-14 — v0.5-8i-2a Battle DOM Text Visual Polish

### Summary
- Today started from the `v0.5-8h` world baseline and expanded toward the pre-diplomacy/pre-spy structure.
- Applied 백제 / 사비 and 큐슈 세력 / 큐슈 expansion.
- Added the West Sea route from 건업 to 사비.
- Investigated blurry battle text in the Phaser canvas.
- Confirmed that Phaser zoom/resolution changes are not the right primary solution for this issue.
- Added DOM Text Overlay for crisp battle text and troop numbers.
- Polished troop number labels into translucent mini-labels.

### v0.5-8i Baekje + Kyushu Expansion
- Added 백제 세력 and 사비.
- Added 의자왕 / 계백 / 흑치상지.
- Added 큐슈 세력 and 큐슈.
- Added 시마즈 요시히로 / 고니시 유키나가.
- Added 곽가 to 조조/위.
- Removed 여포 from the active roster while keeping his data reserved/inactive.
- Added six new unique skill IDs as placeholder-style skills.
- New portrait/cutin assets were not added.

### v0.5-8i-1 West Sea Route
- Added 건업 <-> 사비 as a sea route.
- Kept 건업 <-> 한성 direct route deferred.
- Reinforced 사비 as the West Sea maritime gateway.
- Preserved 한성/평양 no-direct-Japan rule.
- Preserved 사비 <-> 큐슈 western sea route.
- Preserved 경주 <-> 교토/오사카 eastern sea routes.

### v0.5-8i-2 Battle DOM Text Overlay
- Added a DOM overlay above the Phaser battle canvas.
- Moved fixed battle text and unit troop count labels out of Phaser Text for sharper rendering.
- DOM Overlay covers:
  - top title / battlefield name
  - instruction text
  - bottom status legend
  - unit troop number labels
- Phaser still handles battle background, grid, units, sprites, highlights, and effects.
- Battle logic, skills, movement, HP, troop calculations, and balance were preserved.
- Phaser config zoom/resolution/pixelArt/roundPixels was not changed.

### v0.5-8i-2a Battle DOM Text Visual Polish
- Polished the DOM unit troop count label visual style.
- Reduced the heavy black box into a lighter translucent mini-label.
- Kept a subtle background for readability.
- Kept player/enemy color distinction.
- Did not modify battle logic, HP/troop calculations, DOM overlay coordinate math, Phaser config, or assets.

### Data / World State
- Active world: 12 cities / about 32 active heroes / 12 factions.
- Total hero data can be higher because 여포 remains in reserve.
- New cities: 사비, 큐슈.
- New factions: `baekje_faction`, `kyushu_faction`.
- New 백제 heroes: 의자왕, 계백, 흑치상지.
- New 큐슈 heroes: 시마즈 요시히로, 고니시 유키나가.
- New 위 hero: 곽가.

### Not Implemented
- No diplomacy.
- No espionage.
- No enemy domestic AI.
- No naval combat implementation.
- No new portrait or cut-in assets.
- No battle asset HiDPI replacement.
- No battle engine overhaul.
- No domestic/trade formula changes.
- No save/load structure rewrite.

### Remaining Work
1. `v0.5-8i-2c Battle DOM Text Scale Up Polish`
   - Increase troop number label size.
   - Increase upper-right selected unit/hero info text.
   - Increase bottom status legend text.
   - Adjust top title / battlefield name size if needed.
2. `v0.5-8i-3 Battle Asset HiDPI Pilot`
   - Test 2x hero face and unit sprite samples.
   - Keep displayed size unchanged.
3. `v0.5-9 Diplomacy & Spy Scaffold`
   - Add enemy information visibility tiers.
   - Add spy-level dependent public/hidden information states.
