# Next Tasks

Current recorded build state before the next task: `v0.2-10 World Turn + Enemy Invasion MVP`.

## Primary Next Session Target
`Browser-test world turn + invasion loop`

## Priority Order
1. Browser-test world turn + invasion loop
   - Verify `턴 종료`, no-invasion confirmation, and invasion defense choice paths in the browser.
   - Confirm defense win/loss/retreat ownership results and turn-number progression.
2. Tune enemy invasion probability / candidate selection
   - Reassess whether `0.45` produces the right MVP pacing after playtest.
   - Keep candidate selection simple until browser behavior is confirmed.
3. Hero portrait UI
   - Add visual identity without mixing it into battle-rules work.
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
