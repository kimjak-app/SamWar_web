# Next Tasks

## Primary Next Session Target
Tune Yi Sun-sin's first cut-in pass after a browser visual test.

## Priority Order
1. Tune Yi Sun-sin cut-in timing / size / animation after visual test
   - Validate the first `v0.2-8` pass in real browser flow.
   - Adjust duration, image scale, and entry motion only as needed.
2. Add cut-in images for Jeong Do-jeon, Nobunaga, and Kenshin
   - Reuse the metadata-driven cut-in path from `data/skills.js`.
   - Keep the presentation layer generic and avoid hero-hardcoded branching.
3. SFX / battle sound effects
   - Keep as a follow-up candidate after the first cut-in visual pass.
   - Start small and avoid bundling too many systems at once.
4. `14x8` battlefield size test
   - Current `10x6` board still feels compact.
   - Test larger battlefield size without jumping too far at once.
   - Preserve battle tempo and AI readability.
5. BGM fade/volume/mute options
   - Good follow-up after simple BGM integration.
   - No settings UI was added yet.

## Constraints To Preserve
- Direct Codex Paste Mode remains the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- Do not merge Phaser rendering logic into `js/core` battle rules.
- Keep heroes, skills, rosters, and strategies data-driven.
- Preserve the fixed MVP roster for now.
- Avoid adding too many systems in one task.
