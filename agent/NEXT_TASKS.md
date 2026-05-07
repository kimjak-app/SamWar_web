# Next Tasks

Current baseline: `v0.3-7d Action Presentation Queue Review`.

## Recommended Next Order
1. v0.3-7e Presentation Effects Mini Pass.
   - Add small, safe visual feedback improvements using the existing `effectLayer` and action presentation helpers.
   - Examples: slightly stronger hit flash, small impact pulse, or clearer damage text polish.
   - Do not add SFX/camera shake/projectiles yet unless explicitly selected.

2. v0.3-8a Visual Sharpness Pass Prep.
   - Review battlefield portrait sharpness, text readability, canvas/CSS scaling, and UI clarity.

3. v0.3-8b Terrain Rule Design Only.
   - Design terrain movement/defense rules without applying gameplay changes yet.

4. Real animation queue later.
   - Build sequencing only after presentation helper flow remains stable.

5. SFX/audio pass later.
   - Add SFX per unique skill after presentation behavior is accepted.

6. Terrain rule integration later.
   - Keep terrain inactive until rules are designed and approved.

7. Later content expansion.
   - Expand to 10 cities / 20 heroes only after the 4-city / 8-hero rules, assets, and presentation conventions are accepted.

## Completed
- v0.3-7a Battle Coordinate Adapter Prep.
- v0.3-7b Battle Layer Prep.
- v0.3-7c Terrain Data Scaffold.
- v0.3-7d Action Presentation Queue Review.
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
