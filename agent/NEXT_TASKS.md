# Next Tasks

Current baseline: `v0.4-0b Enemy Move-Then-Act AI Fix`.

## Recommended Next Order
1. v0.4-1 Troop Allocation MVP.
   - Add simple troop allocation controls to the hero deployment modal.
   - Use safe preset buttons first, such as 50%, 75%, 100%.
   - Do not implement persistent troop losses yet unless explicitly requested.
   - Do not implement unit type selection yet.

2. v0.4-2 Victory Hero Recruitment MVP.
   - Keep recruitment separate from deployment and battle result flow changes.

3. v0.4-3 Hero Location / Garrison Management MVP.
   - Add location/garrison management only after recruitment rules are accepted.

4. Terrain Rule Design Only.
   - Design terrain movement/defense rules without applying gameplay changes yet.

5. SFX/audio pass later.
   - Add SFX per unique skill after presentation behavior is accepted.

6. Camera shake/projectile effects later.
   - Keep camera and projectile work in dedicated presentation patches.

7. Real animation queue later.
   - Build sequencing only after presentation helper flow remains stable.

8. Later content expansion.
   - Expand to 10 cities / 20 heroes only after the 4-city / 8-hero rules, assets, and presentation conventions are accepted.

## Completed
- v0.3-7a Battle Coordinate Adapter Prep.
- v0.3-7b Battle Layer Prep.
- v0.3-7c Terrain Data Scaffold.
- v0.3-7d Action Presentation Queue Review.
- v0.3-7e Presentation Effects Mini Pass.
- v0.3-7f Hit Knockback Reaction.
- v0.4-0 Hero Deployment Flow MVP.
- v0.4-0a Hero Deployment Center Modal Layout.
- v0.4-0b Enemy Move-Then-Act AI Fix.
- Latest cut-in layout manual QA passed.

## Later Audio Pass Notes
- Add SFX per unique skill.
- Use `cutinQuote` lines for voice AI prompts.
- Consider fields such as `cutinVoice` or `sfx`.

## Constraints To Preserve
- Do not change game logic during documentation or visual-only polish tasks.
- Keep heroes, skills, rosters, and strategies data-driven.
- Keep unique skill cut-ins DOM-overlay driven.
- Do not bake text into PNG assets.
- Do not casually touch Phaser render config, filters, mipmaps, `pixelArt`, or `roundPixels`.
- Do not tune battle balance until the 4-city / 8-hero MVP is QA-stable.
