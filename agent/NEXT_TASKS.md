# Next Tasks

Current recorded build state before the next task: `v0.3-2b Safe Battlefield Asset Source Switch`.

## Primary Next Session Target
`Browser-test new 256 battlefield unit token quality`

## Priority Order
1. Browser-test new 256 battlefield unit token quality
   - Verify player/enemy battlefield unit sprites now use the new dedicated 256x256 battlefield token assets.
   - Confirm battlefield rendering remains smooth and not pixelated after the source switch.
2. Tune battlefield portrait/arrow/HP offsets if needed
   - Adjust Phaser-only HUD offsets only if the new token art changes the visual balance.
   - Keep battle logic and rendering settings untouched.
3. Create higher-quality battlefield portrait assets later if desired
   - Preserve the current 512px `portraitImage` fallback until better battlefield portrait assets exist.
4. Add status effect icons
   - Add explicit battlefield status markers in a later focused pass.
5. Add hero portraits to world-map city / garrison UI
   - Reuse the same portrait assets for stronger world-side identity later.
6. Defense battle UX polish
   - Improve invasion/defense clarity without changing the core flow.
7. SFX / battle sound effects
   - Add battle feedback audio in a separate pass.

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
- Preserve the `battlefieldPortraitImage` data fields even though battlefield badge rendering is temporarily using `portraitImage`.
- Preserve the v0.3-2b safe HUD micro tuning approach:
  - no Phaser filter/global sharpness changes
  - no `pixelArt` or `NEAREST` changes
  - only safe HUD coordinate/style tuning unless browser verification proves otherwise
- Preserve the v0.3-2b safe battlefield asset source switch approach:
  - no asset deletion from `assets/units/`
  - battlefield unit sprite source switching only
  - no Phaser filter/global sharpness changes
