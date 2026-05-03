# Next Tasks

## Primary Next Session Target
Add cut-in images for Jeong Do-jeon, Nobunaga, and Kenshin.

## Priority Order
1. Add cut-in images for Jeong Do-jeon, Nobunaga, and Kenshin
   - Reuse the metadata-driven cut-in path from `data/skills.js`.
   - Keep the presentation layer generic and avoid hero-hardcoded branching.
2. SFX / battle sound effects
   - Keep as a follow-up candidate after the first cut-in visual pass.
   - Start small and avoid bundling too many systems at once.
3. Tune cut-in duration / animation after multi-hero cut-in test
   - Validate the full multi-hero presentation after more cut-in assets are integrated.
   - Keep Yi Sun-sin's approved image size and subtle slash treatment unless a real issue appears.
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
