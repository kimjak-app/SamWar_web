# Next Tasks

## Primary Next Session Target
Browser-test roster-card selection usability.

## Priority Order
1. Browser-test roster-card selection usability
   - Confirm friendly roster cards select player units correctly during manual player control.
   - Confirm enemy roster cards remain display-only.
   - Confirm roster-card selection is blocked during enemy turn, cut-in/tempo lock, and auto battle.
2. Tune battle difficulty / balance after `14x8` testing
   - Reassess pacing only after the larger board is playtested.
   - Avoid premature stat changes before map-size validation.
3. SFX / battle sound effects
   - Keep as a follow-up candidate after the `14x8` visual/gameplay pass.
   - Start small and avoid bundling too many systems at once.
4. Terrain effects / movement cost prototype
   - Consider only after the larger open battlefield baseline is understood.
   - Keep it separate from the first `14x8` validation pass.
5. Optional enemy info selection UX
   - If needed later, consider non-command enemy roster inspection behavior separate from command selection.

## Constraints To Preserve
- Direct Codex Paste Mode remains the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- Do not merge Phaser rendering logic into `js/core` battle rules.
- Keep heroes, skills, rosters, and strategies data-driven.
- Preserve the fixed MVP roster for now.
- Avoid adding too many systems in one task.
