# Next Tasks

Current recorded build state before the next task: `v0.3-1 Battlefield Unit Portrait Badge`.

## Primary Next Session Target
`Browser-test battlefield portrait badge size and placement`

## Priority Order
1. Browser-test battlefield portrait badge size and placement
   - Verify the new 28px badge placement on the `14x8` board and confirm it does not block interactions.
   - Confirm all four MVP heroes render clearly in battle.
2. Tune badge size / position if needed
   - Adjust Phaser-only placement or size after browser review.
   - Avoid touching battle logic or portrait assets.
3. Compact battlefield unit HUD text
   - Revisit battlefield text density now that badge identity is in place.
4. Add status effect icons
   - Add explicit battlefield status markers in a later focused pass.
5. Add hero portraits to world-map city / garrison UI
   - Reuse the same portrait assets for stronger world-side identity later.

## Constraints To Preserve
- Direct Codex Paste Mode remains the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- Do not merge Phaser rendering logic into `js/core` battle rules.
- Keep heroes, skills, rosters, and strategies data-driven.
- Preserve the fixed MVP roster for now.
- Avoid adding too many systems in one task.
- Preserve the hotfix6 player auto-battle resume guard across enemy-turn -> player-turn transitions.
- Preserve the hotfix7 actor `hasActed` fallback guard for both player auto battle and enemy planned actions.
- Preserve the v0.2-10 attack/defense battle-context split and defense-city ownership rules.
- Preserve the v0.3.0 portrait-data linkage and safe fallback rendering behavior.
- Preserve the v0.3-1 battlefield portrait badge rendering without changing core hit-zone behavior.
