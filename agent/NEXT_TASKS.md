# Next Tasks

## Primary Next Session Target
`SamWar_web v0.2-7`

## Priority Order
1. Battle UI improvement
   - Highest priority.
   - Refine the left log / center board / right info / bottom command bar layout.
   - Improve command bar readability and visual hierarchy.
   - Improve battle log density and unit info readability.
   - Reduce clutter without removing controls.
2. BGM integration test
   - Add world map BGM.
   - Add battle BGM.
   - Switch or start/stop between world and battle modes.
   - Keep looping simple for the first pass.
3. Battlefield size test
   - Test larger sizes because current `10x6` board feels small.
   - Preferred candidates: `14x8` and `16x8`.
   - Preserve battle tempo and AI behavior.
4. Troop-count visual stages
   - Lower priority.
   - Requires extra unit-image variants.
   - Defer until after UI/BGM/board-size testing.

## Constraints To Preserve
- Direct Codex Paste Mode remains the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- Do not merge Phaser rendering logic into `js/core` battle rules.
- Keep heroes, skills, rosters, and strategies data-driven.
- Preserve the fixed MVP roster for now.
