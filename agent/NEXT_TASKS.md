# Next Tasks

Current working version: `v0.5-6 Faction Identity Scaffold`.
Baseline: `v0.5-5b Attack/Defense Empty Battlefield Common Battle Unit Render Fix`.


## Immediate Next Target: v0.5-7 Trade Route MVP
Goal: make trade work after faction identity separation, without implementing diplomacy/external treaties yet.

Recommended first scope:
1. Internal trade routes between cities owned by the same faction.
2. Player-owned city route summary in Selected City and World HUD.
3. Trade income as 금전-first income, with specialty bonuses from 비단/소금/수산물.
4. Route efficiency affected by 상업력, 치안, 성충성도, 태수 정책, 재상 정책, and 외교/경제형 aptitude.
5. Enemy trade can be scaffolded but hidden unless later intelligence system exposes it.

Do not implement yet:
- diplomacy treaties
- cross-faction trade
- espionage/intelligence visibility
- full enemy domestic AI
- trade route animation on the world map
- naval trade/sea route combat

## v0.5-6 Closure Notes
- v0.5-6 browser QA was reported working by user.
- Faction-color/map-flag distinction is intentionally deferred to a later World Map visual update.
- Current city/team buttons may still show generic blue/red battle-side styling; this is acceptable until the map/faction color pass.

## QA Status
- v0.5-3a browser manual QA passed.
- v0.5-3b browser manual QA passed.
- v0.5-5a needs browser manual QA.
- No console errors were reported.
- Confirmed: effect summaries, income changes, loyalty-loss mitigation, upkeep/salt changes, military preview changes, actual soldier count unchanged, save/load compatibility, tax/chancellor/governor/transfer/battle/invasion modal regressions.

## Immediate QA
- Verify deployment default allocation no longer uses `hero.troops`.
- Verify deployment sliders appear and total allocation cannot exceed source garrison.
- Verify 태수/장군/부장/군관 command limits are enforced.
- Verify battle unit `hp/maxHp` remains on the old battle scale.
- Verify `allocatedTroops` is recorded separately from battle HP.
- Verify battle unit troop display uses allocated troop ratio, not 110/90/115/120 legacy values.
- Verify direct defense opens deployment instead of entering battle immediately.
- Verify enemy units receive garrison-based allocations.
- Verify battle start deducts allocated troops from source city garrison.
- Verify victory returns survivors and converts 30% of losses to wounded.
- Verify defeat converts 50% of allocated troops to wounded and returns no immediate survivors.
- Verify wounded queue recovers after 3 player turns.
- Verify save/load preserves garrison/wounded queue/command rank.

## Recommended Next Order
1. Browser QA and regression-only fixes for v0.5-5a.
2. Balance review for allocation defaults, wounded rates, and recovery timing.
3. Improve deployment UX only after confirming the data flow is stable.
4. Consider city defense formula use of garrison/allocated troops later.
5. Troop types, diplomacy/intelligence/trade, rebellion, and direct-rule systems remain later milestones.

## Constraints To Preserve
- Do not scatter new formulas outside `domestic_effects.js`.
- Do not implement recruitment, troop types, troop upkeep deduction, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, or talent recruitment.
- Do not touch Phaser Scene or battle logic for city-management UI work.
- Do not reintroduce window compatibility glue.

## After v0.5-5b
- Browser QA: attack battle render, defense battle render, allocated troop display, casualty return, wounded recovery, save/load.
- Then proceed with v0.5-5c polish only if needed before moving to v0.5-6 Trade Route MVP.


## After v0.5-6
1. Browser QA: verify faction names on city selection, attack/defense battle units, city occupation owner changes, and save/load.
2. Keep player-only manual chancellor/governor controls for now. Enemy chancellor/governor data is scaffold metadata, not full enemy domestic AI.
3. Next large system candidate: `v0.5-7 Trade Route MVP`, using faction-specific city ownership as the route/permission baseline.
