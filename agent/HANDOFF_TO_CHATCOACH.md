# SamWar_web Handoff

## Current Baseline
`v0.5-9a Battle Entry Curtain Fade Fix`

Next session should start from this baseline. Before starting new work, read these six agent documents:
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/CURRENT_STATE.md`
- `agent/NEXT_TASKS.md`
- `agent/QA_CHECKLIST.md`
- `agent/CHANGELOG.md`
- `agent/SESSION_LOG.md`

## Current World Structure
- 13 cities.
- About 35 active heroes.
- 13 factions.
- `karakorum` and the Mongol faction are implemented.
- Final 13-city coordinates are applied in `data/cities.js`.
- The user manually replaced the world map art with the final `world_map_mvp.png`.
- City labels now use faction-color banner styling and show only city names.
- World map label polish is paused here and is acceptable for now.

## Current World Map State
- Land roads remain logically active in `data/cities.js`.
- Land routes are represented visually by the map artwork, not by rendered SVG lines.
- Only sea routes should remain visually rendered:
  - `jianye <-> sabi`
  - `sabi <-> kyushu`
  - `gyeongju <-> kyoto`
  - `gyeongju <-> osaka`
  - `osaka <-> kyushu`

## Battle Visual Baseline
- `USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY = true` is enabled.
- DOM overlay renders:
  - unit token images
  - portrait badge images
  - troop labels
- Phaser still handles:
  - battle background
  - grid
  - highlights
  - selection ring
  - HP bars
  - hit zones
  - status icons
  - facing text
  - movement / attack / skill logic
  - effects
- DOM overlay uses `pointer-events: none`.
- DOM token images are sharp and remain the correct rendering path.

## v0.5-9 Completed State
- Portrait badge size is now `70px x 70px`.
- Portrait badge position is attached closely to the unit.
- Status indicator position is acceptable and should be kept.
- Facing text was moved near the unit center-top.
- Fixed persistent Phaser `방어` text by removing the fixed defending label render.
- DOM unit images remain sharp.

## v0.5-9a Completed State
- Added a DOM battle entry curtain above the battle board stack.
- Curtain covers Phaser canvas and DOM overlay together during battle entry.
- Curtain fades out only after `renderBattleDomOverlay()` completes its first render.
- Curtain fade-out is one-shot guarded with a dataset flag.
- Curtain is removed after fade-out and does not affect later cut-ins.
- Removed Phaser `camera.fadeIn()` because it only affected canvas and conflicted with the mixed canvas + DOM presentation.

## Current Battle Entry Flow
- `renderBattleShell()` creates:
  - Phaser mount
  - DOM overlay
  - board overlay
  - entry curtain
- `renderBattleDomOverlay()` writes the first DOM overlay frame.
- Immediately after that first DOM overlay render, `fadeOutBattleEntryCurtain()` starts the curtain fade-out.
- Result: battlefield image, facing text, hero portrait badges, and troop labels do not pop in separately before the transition completes.

## Verification Already Completed
- `node --check js/ui/battle_ui.js` passed.
- `node --check js/phaser/battle_scene.js` passed.
- `node --check js/main.js` passed.
- App loaded with no console errors during battle smoke tests.
- World map still renders normally.
- Battle entry still works.
- DOM overlay remains non-interactive.
- Portrait badge remains `70px`.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background sharpness pass is still pending.
- Movement tween animation is still pending.
- Do not change Phaser global config as the first response to battle presentation issues.

## Next Candidate Targets
1. `v0.5-9b Battle Background Sharpness Pass`
   - Investigate battlefield background blur separately.
   - Candidate options: 2x battlefield image, DOM background layer, canvas scaling audit.
2. `v0.5-9c Battle Movement Animation Pass`
   - Replace snap movement with tweened movement.
   - Add timing polish later if needed.
3. `v0.5-10 Diplomacy & Spy Scaffold`
   - Add enemy information visibility tiers.
   - Add no/partial/detailed spy information states.
   - Limit enemy resources, troops, chancellor, and governor information by spy level.

## Scope Guard
- Do not change battle rules.
- Do not change movement rules yet.
- Do not change attack / skill / strategy logic.
- Do not change troop / HP formulas.
- Do not change Phaser config.
- Do not change image assets.
- Do not change world map or city labels in the next task.
- Do not alter domestic/trade/save-load.
