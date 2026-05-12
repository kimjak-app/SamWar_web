# Next Tasks

Current working version: `v0.5-2d Enemy Invasion Defense Choice Center Modal`.
Baseline: `v0.5-2c Stable - Governor UI Polish + Turn Action UX Unification + Governor Policy Scaffold`.

## QA Status
- v0.5-2c browser manual QA passed.
- No console errors were reported.
- Turn action UX, governor card, governor policy scaffold, Selected City cleanup, and major regression flows were confirmed.

## Immediate QA
- Verify enemy invasion defense choice appears as a centered modal.
- Verify the right Selected City HUD does not render the defense choice card.
- Verify direct defense and auto defense still enter battle through the existing handlers.
- Verify no-invasion enemy turn end, normal attack/deployment, city selection, governor, chancellor, and tax UI remain stable.

## Recommended Next Order
1. Browser QA and regression-only fixes for v0.5-2d.
2. Save/load compatibility review for governor assignment/policy if persistence becomes a release requirement.
3. Domestic engine design investigation before connecting any chancellor/governor aptitude formulas.
4. City garrison/troop-pool design only, before recruitment or upkeep.
5. Trade/diplomacy/intelligence design later as separate milestones.

## Constraints To Preserve
- Do not implement chancellor or governor person-stat calculations yet.
- Do not implement governor policy effects.
- Do not implement income/security/city-loyalty/resource/troop changes from governors.
- Do not implement recruitment, troop types, troop upkeep deduction, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, or talent recruitment.
- Do not touch Phaser Scene or battle logic for city-management UI work.
- Do not reintroduce window compatibility glue.
