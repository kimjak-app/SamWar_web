# Next Tasks

Current recorded build state before the next task: `v0.3.0 Hero Portrait UI`.

## Primary Next Session Target
`Browser-test hero portrait UI readability`

## Priority Order
1. Browser-test hero portrait UI readability
   - Verify roster portrait size, selected summary portrait size, and fallback safety in the browser.
   - Confirm text readability and click targets remain intact.
2. Tune portrait sizes / card spacing if needed
   - Adjust CSS-only sizing or spacing after browser review.
   - Avoid touching image assets or battle logic.
3. Add hero portraits to world-map city / garrison UI
   - Reuse the same portrait assets where world-side identity needs to be clearer.
4. Defense battle UX polish
   - Improve invasion messaging or panel clarity without changing the core state flow.
5. SFX / battle sound effects
   - Keep as a follow-up candidate after the current world/battle flow milestone.
   - Start small and avoid bundling too many systems at once.

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
