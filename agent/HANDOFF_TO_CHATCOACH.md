# SamWar_web Handoff

## Current Baseline
`v0.5-9c-1 Battle Entry Fade SceneReady Hook Fix`

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

## v0.5-9b Completed State
- Added `250ms` battle movement tween for player manual movement.
- Phaser `unitGroup` movement, HP bar, facing text, status icons, and hit zone now move together.
- DOM unit token image, portrait badge, and troop label move together with the Phaser tween.
- `main.js` applies a short `280ms` `battleTempoLocked` manual-control lock during move tween playback.
- `battle_rules.js` movement rules were not changed.
- `pendingMove.fromX/fromY` drives presentation only, so units visually move from old tile to current tile without changing movement rules.

## v0.5-9b-1 Completed State
- Fixed the post-move rerender bug where selection ring / HP bar / facing text could appear to snap back to the old tile.
- `battle_scene.js` now uses target `unitPoint` for `unitGroup` creation whenever `shouldTweenMove` is false.
- Added `lastAction.presentationMove` metadata for AI move presentation only.
- Move presentation priority is now:
  - `pendingMove` first
  - `lastAction.presentationMove` fallback second
- Enemy AI movement now uses the same `250ms` Phaser + DOM tween path as player movement.
- Phaser battle rules remain unchanged; `presentationMove` is presentation-only metadata.

## v0.5-9c Completed State
- Added `battle-phaser-host-wrap` opacity `0 -> 1` fade as a full-stack entry transition test.
- The initial double `requestAnimationFrame` ready timing was too early.
- That version could allow DOM unit / portrait visuals to appear before the Phaser battlefield background.

## v0.5-9c-1 Completed State
- `battle-phaser-host-wrap` full opacity fade remains the active entry transition.
- `is-battle-ready` is now applied only after Phaser scene ready.
- Phaser scene ready then triggers one more DOM overlay alignment pass, and the next frame starts the wrap fade.
- Battlefield background, DOM unit, portrait badge, troop label, and facing indicators now enter as one visual block.
- `unitLayer` alpha, hit zones, battle logic, and Phaser global config were not changed.

## Verification Already Completed
- `node --check js/core/battle_rules.js` passed.
- `node --check js/phaser/phaser_battle_mount.js` passed.
- `node --check js/ui/battle_ui.js` passed.
- `node --check js/phaser/battle_scene.js` passed.
- `node --check js/main.js` passed.
- App loaded with no console errors during battle smoke tests.
- World map still renders normally.
- Battle entry still works.
- Battle entry fade works.
- DOM overlay remains non-interactive.
- Portrait badge remains `70px`.
- Manual unit selection works.
- Player movement tween works.
- Facing selection works.
- Enemy AI movement tween works.
- Manual attack / skill / strategy still work.
- Auto battle still works.
- Browser `AudioContext` autoplay warning is policy noise and unrelated to the patch.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- Battlefield background sharpness pass is still pending.
- Do not change Phaser global config as the first response to battle presentation issues.

## Next Candidate Targets
1. `v0.5-10 Diplomacy & Spy Scaffold`
   - Add a diplomacy / espionage panel on the left side of city detail.
   - Add `[외교]` and `[첩보]` tabs.
   - Scaffold relation value, relation state, and basic diplomacy action buttons.
   - Scaffold spy level, reconnaissance, rumor, and internal-collusion actions.
2. `v0.5-10+ Diplomacy Action Effects`
   - Resolve actual diplomacy action results and state changes.
3. `v0.5-10+ Spy Action Success / Failure System`
   - Add success rates, failure outcomes, and spy information tiers.
4. `Battle Dust FX`
   - Add lightweight movement dust / contact polish without touching battle rules.
5. `Movement Cancel Tween`
   - Add presentation-only cancel tween back to origin.

## Scope Guard
- Do not change battle rules.
- Do not change attack / skill / strategy logic.
- Do not change troop / HP formulas.
- Do not change Phaser config.
- Do not change image assets.
- Do not change world map or city labels in the next task.
- Do not alter domestic/trade/save-load.
