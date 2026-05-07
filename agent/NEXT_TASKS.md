# Next Tasks

Current baseline: `v0.3-7a Battle Coordinate Adapter Prep`.

## Recommended Next Order
1. v0.3-7b Battle Layer Prep.
   - Prepare battle rendering layers for future larger maps, effects, camera work, and 2.5D/isometric depth ordering.
   - Suggested layers: background/board, highlight, unit, effect, UI.

2. Terrain data scaffold.
   - Add lightweight terrain data shape after layer prep.
   - Keep current 14x8 field as the small test battlefield.

3. Action presentation queue review.
   - Review sequencing for cut-ins, effects, floating text, and result flow.
   - Preserve current battle logic and balance.

4. Visual sharpness pass.
   - Phaser canvas text sharpness.
   - Battlefield portrait sharpness.
   - Canvas/CSS scaling rules.
   - Integer text coordinates.
   - Possible DOM split for text-heavy UI.

5. Audio pass.
   - Add SFX per unique skill.
   - Use `cutinQuote` lines for voice AI prompts.
   - Consider fields such as `cutinVoice` or `sfx`.

6. Later content expansion.
   - Expand to 10 cities / 20 heroes only after the 4-city / 8-hero rules, assets, and presentation conventions are accepted.

## Completed QA
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
