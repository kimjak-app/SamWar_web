# Next Tasks

Current recorded build state before the next task: `v0.3-2a Battlefield HUD Micro Tuning + Battlefield Portrait Source Switch`.

## Primary Next Session Target
`Browser-test battlefield portrait readability and spacing`

## Priority Order
1. Browser-test battlefield portrait readability and spacing
   - Verify dedicated battlefield portraits, the softer frame, and compact HP/troop placement in the browser.
   - Confirm battlefield interactions remain intact after the micro tuning.
2. Tune arrow size / position if needed
   - Adjust Phaser-only facing-arrow placement after browser review.
   - Avoid touching battle logic or portrait assets.
3. Add status effect icons
   - Add explicit battlefield status markers in a later focused pass.
4. Add hero portraits to world-map city / garrison UI
   - Reuse the same portrait assets for stronger world-side identity later.
5. Defense battle UX polish
   - Improve invasion/defense clarity without changing the core flow.

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
- Preserve the v0.3-2 compact battlefield HUD layout and hidden battlefield cooldown text.
- Preserve the v0.3-2a dedicated battlefield portrait source split and subtle-frame treatment.
