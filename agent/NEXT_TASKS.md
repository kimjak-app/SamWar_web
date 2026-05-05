# Next Tasks

Current recorded build state before the next task: `v0.2-9d-hotfix5 Auto Battle Sequencer Deadlock Guard`.

## Primary Next Session Target
`v0.2-10 World Turn + Enemy Invasion MVP`

## Priority Order
1. `v0.2-10 World Turn + Enemy Invasion MVP`
   - Add the minimum world-turn progression structure needed for enemy-side action.
   - Keep scope focused on the invasion MVP rather than broader campaign systems.
2. Defense battle manual/auto choice using the new battle mode choice structure
   - Reuse the same pre-battle choice flow for enemy invasion defense battles.
   - Avoid duplicating separate manual/auto entry code paths.
3. Tune battle difficulty / balance after `14x8` testing
   - Reassess pacing only after the larger board is playtested.
   - Avoid premature stat changes before map-size validation.
4. Hero portrait UI
   - Add visual identity without mixing it into battle-rules work.
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
