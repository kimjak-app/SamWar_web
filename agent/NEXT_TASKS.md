# Next Tasks

Current baseline: `v0.4-3 Stable - Region-Based Hero Control + Directional Battle Spawn + Hero Transfer MVP`.

## Recommended Next Order
1. v0.5-0 Domestic Affairs Scaffold.
   - Add replaceable city domestic/resource data structure.
   - Add simple selected city panel display for domestic/resource values.
   - Add world calendar/month scaffold if needed.
   - Add temporary turn-end resource update helper.
   - Keep formulas temporary and clearly marked as replaceable.
   - Do not lock final domestic formulas too early.

2. v0.5-1 Domestic Role Scaffold.
   - Prepare for chancellor and governor/city-lord roles.
   - Keep role effects minimal until domestic resource cycles are accepted.
   - Do not implement full compatibility, loyalty, or deep personnel management yet.

3. v0.5-2 Resource Cycle Pass.
   - Separate resource timing instead of using one final generic food model.
   - Candidate resources:
     - rice
     - barley
     - seafood
     - tax/gold
   - Candidate timing:
     - rice: annual harvest
     - barley: specific month harvest, e.g. February
     - seafood: monthly income
     - taxes: separated from food resources

4. Troop Allocation MVP later.
   - This remains postponed.
   - Real troop allocation should come after city-level domestic affairs, troop pools, garrison management, troop loss persistence, recruitment, recovery, and food supply systems.

5. Terrain Rule Design Only later.
   - Design movement/defense rules without applying gameplay changes.
   - Keep `terrainMap` inactive until a dedicated terrain rules patch.

6. SFX/audio pass later.
   - Add SFX per unique skill after presentation behavior is accepted.
   - Consider `cutinVoice` / `sfx` fields later.

7. Camera shake/projectile effects later.
   - Keep camera and projectile work in dedicated presentation patches.

8. Real animation queue later.
   - Build sequencing only after presentation helper flow remains stable.

9. Later content expansion.
   - Expand to 10 cities / 20 heroes only after the 4-city / 8-hero rules, assets, and presentation conventions are accepted.

## v0.5-0 Domestic Affairs Scaffold Direction
- v0.5-0 should create a flexible scaffold, not the final domestic system.
- Avoid hardcoding final formulas.
- Keep calculation helpers separated.
- Make future replacement with chancellor/governor/resource-cycle logic easy.
- Do not use a single generic `food` system as the final model.
- If a temporary generic value is needed, mark it as scaffold-only.

Potential v0.5-0 work:
- Add city domestic/resource data.
- Add simple numeric/bar UI in selected city panel.
- Add world calendar/month state if needed.
- Add temporary turn-end resource update.
- Keep formulas temporary and clearly replaceable.

## Completed v0.4 Line
- v0.4-0 Hero Deployment Flow MVP.
- v0.4-0a Hero Deployment Center Modal Layout.
- v0.4-0b Enemy Move-Then-Act AI Fix.
- v0.4-1 Victory Hero Recruitment MVP.
- v0.4-2 Region-Based Hero Control MVP.
- v0.4-2a Buff Source Label + Selected Attack Origin Fix.
- v0.4-2b Generic Ally Buff Battle Log Fix.
- v0.4-2c Battle Spawn Direction Fix.
- v0.4-3 Hero Transfer MVP.
- v0.4-3a Selected City Stationed Heroes UI.

## Completed Earlier Systems
- v0.3-7a Battle Coordinate Adapter Prep.
- v0.3-7b Battle Layer Prep.
- v0.3-7c Terrain Data Scaffold.
- v0.3-7d Action Presentation Queue Review.
- v0.3-7e Presentation Effects Mini Pass.
- v0.3-7f Hit Knockback Reaction.
- Latest cut-in layout manual QA passed.

## Constraints To Preserve
- Do not implement troop allocation yet.
- Do not implement troop loss persistence yet.
- Do not implement governor/chancellor full logic until domestic scaffold is ready.
- Do not implement terrain effects yet.
- Do not activate `terrainMap` yet.
- Do not implement unit type selection yet.
- Do not modify render settings/assets casually.
- Do not change battle AI, damage formulas, skill values, cut-ins, terrain, hit knockback, or render settings during domestic scaffold work.
- Use `node --check` only unless explicitly instructed otherwise.
- User performs manual browser QA.
