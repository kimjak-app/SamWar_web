# Next Tasks

Current baseline: `v0.3-6i Skill Cut-in Quote Layout + Duration Polish`.

## Recommended Next Order
1. Manual QA latest cut-in layout.
   - Confirm quote position at visual center, slightly below center.
   - Confirm skill title/effect remain lower center.
   - Confirm player and enemy cut-ins both show title, quote, and effect text.
   - Confirm `2200ms` duration is readable but not too slow.

2. Minor timing / typography polish if needed.
   - If too short or too long, tune unique cut-in duration within `2000-2400ms`.
   - If quote overlaps important face/weapon areas, adjust quote Y-position slightly.
   - Do not modify image assets for text.

3. Decide the next feature after 4-city / 8-hero MVP QA.
   - Option A: Audio pass with unique skill SFX and later voice.
   - Option B: Visual sharpness pass.
   - Option C: Next gameplay/content feature.

4. Later visual sharpness pass before 10-city / 20-hero expansion.
   - Phaser canvas text sharpness.
   - Battlefield portrait sharpness.
   - Canvas/CSS scaling rules.
   - Integer text coordinates.
   - Possible DOM split for text-heavy UI.

5. Later content expansion.
   - Expand to 10 cities / 20 heroes only after the 4-city / 8-hero rules, assets, and presentation conventions are accepted.

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
