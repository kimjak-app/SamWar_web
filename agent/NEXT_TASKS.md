# Next Tasks

## Primary Next Session Target
Implement the unique-skill cut-in overlay system as the next focused battle presentation step.

## Priority Order
1. Unique-skill cut-in overlay system
   - Main next priority after `v0.2-7o`.
   - Use the slower battle tempo as timing foundation for dramatic presentation.
   - Keep the first pass focused on overlay flow rather than broad battle-rule changes.
2. First implementation for Yi Sun-sin's `학익진 포격` cut-in
   - Establish the first real diagonal brush-style cut-in path on one signature skill.
   - Use it to validate timing, layering, and return-to-battle flow.
3. SFX / battle sound effects
   - Keep as a follow-up candidate after the cut-in system.
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
