# Next Tasks

Current working version: `v0.5-3c City Loyalty + Security/Economy Drift`.
Baseline: `v0.5-3b Stable - Save / Load UI MVP`.

## QA Status
- v0.5-3a browser manual QA passed.
- v0.5-3b browser manual QA passed.
- No console errors were reported.
- Confirmed: effect summaries, income changes, loyalty-loss mitigation, upkeep/salt changes, military preview changes, actual soldier count unchanged, save/load compatibility, tax/chancellor/governor/transfer/battle/invasion modal regressions.

## Immediate QA
- Verify city status summary appears under the city loyalty gauge.
- Verify Hanseong security/economy status is shown and changes after hero movement where applicable.
- Verify turn-end city loyalty results are stored and displayed.
- Verify high tax produces city-loyalty pressure but final per-turn delta stays within `-2..+2`.
- Verify governor/chancellor control effects improve city-loyalty drift without changing actual troop counts.
- Verify save/load restores city loyalty and last city-loyalty result safely.

## Recommended Next Order
1. Browser QA and regression-only fixes for v0.5-3c.
2. Balance review of city loyalty drift thresholds after playtesting.
3. City garrison/troop-pool design only, before recruitment or upkeep.
4. Save/load version bump review when the save schema is intentionally advanced.
5. Trade/diplomacy/intelligence design later as separate milestones.
6. Direct-rule/ruler-location gameplay design later.

## Constraints To Preserve
- Do not scatter new formulas outside `domestic_effects.js`.
- Do not implement recruitment, troop types, troop upkeep deduction, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, or talent recruitment.
- Do not touch Phaser Scene or battle logic for city-management UI work.
- Do not reintroduce window compatibility glue.
