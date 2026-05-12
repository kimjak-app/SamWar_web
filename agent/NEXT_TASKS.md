# Next Tasks

Current stable version: `v0.5-3a Stable - Domestic Effect Engine MVP`.

## QA Status
- v0.5-3a browser manual QA passed.
- No console errors were reported.
- Confirmed: effect summaries, income changes, loyalty-loss mitigation, upkeep/salt changes, military preview changes, actual soldier count unchanged, save/load compatibility, tax/chancellor/governor/transfer/battle/invasion modal regressions.

## Recommended Next Order
1. Balance review of domestic effect multipliers after more playtesting.
2. City garrison/troop-pool design only, before recruitment or upkeep.
3. Save/load version bump review when the save schema is intentionally advanced.
4. Trade/diplomacy/intelligence design later as separate milestones.
5. Direct-rule/ruler-location gameplay design later.

## Constraints To Preserve
- Do not scatter new formulas outside `domestic_effects.js`.
- Do not implement recruitment, troop types, troop upkeep deduction, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, or talent recruitment.
- Do not touch Phaser Scene or battle logic for city-management UI work.
- Do not reintroduce window compatibility glue.
