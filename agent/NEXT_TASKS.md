# Next Tasks

Current baseline: `v0.3-7f Hit Knockback Reaction`.

## Recommended Next Order
1. v0.3-8a Visual Sharpness Pass Prep.
   - Review battlefield portrait sharpness, unit token sharpness, floating text readability, status icon clarity, bottom legend readability, battlefield background scaling, and cut-in text/image balance.
   - Start with review/prep only; do not change Phaser render config or assets without a dedicated follow-up patch.

2. v0.3-8b Visual Readability Safe Polish.
   - Use `agent/VISUAL_SHARPNESS_REVIEW.md` as scope control.
   - Apply only low-risk readability tweaks.
   - No assets/render config/game logic changes.

3. Terrain Rule Design Only.
   - Design terrain movement/defense rules without applying gameplay changes yet.

4. SFX/audio pass later.
   - Add SFX per unique skill after presentation behavior is accepted.

5. Camera shake/projectile effects later.
   - Keep camera and projectile work in dedicated presentation patches.

6. Real animation queue later.
   - Build sequencing only after presentation helper flow remains stable.

7. Later content expansion.
   - Expand to 10 cities / 20 heroes only after the 4-city / 8-hero rules, assets, and presentation conventions are accepted.

## Completed
- v0.3-7a Battle Coordinate Adapter Prep.
- v0.3-7b Battle Layer Prep.
- v0.3-7c Terrain Data Scaffold.
- v0.3-7d Action Presentation Queue Review.
- v0.3-7e Presentation Effects Mini Pass.
- v0.3-7f Hit Knockback Reaction.
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
