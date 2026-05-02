# Next Tasks

## Primary Next Session Target
Review `v0.2-7` final state and choose one focused next step.

## Priority Order
1. SFX / battle sound effects
   - Highest-value next sensory layer after simple BGM.
   - Keep scope small at first.
   - Avoid bundling too many new systems at once.
2. `14x8` battlefield size test
   - Current `10x6` board still feels compact.
   - Test larger battlefield size without jumping too far at once.
   - Preserve battle tempo and AI readability.
3. Battle impact/effects polish
   - Improve combat readability and feel after tempo/BGM baseline.
   - Keep this separate from major rules changes.
4. BGM fade/volume/mute options
   - Good follow-up after simple BGM integration.
   - No settings UI was added yet.
5. Hero portrait-ready UNIT roster card structure
   - Prepare the right roster panel for future portrait support.

## Constraints To Preserve
- Direct Codex Paste Mode remains the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- Do not merge Phaser rendering logic into `js/core` battle rules.
- Keep heroes, skills, rosters, and strategies data-driven.
- Preserve the fixed MVP roster for now.
- Avoid adding too many systems in one task.
