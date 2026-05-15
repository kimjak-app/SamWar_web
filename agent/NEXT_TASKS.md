# Next Tasks

## Current Baseline
`v0.5-9 Battle DOM Unit Visual Polish`

## Immediate Target
`v0.5-9 Battle DOM Unit Visual Polish`

Goal:
- Keep the DOM battle unit image overlay approach because it fixed sharpness.
- Enlarge and reposition hero portrait badges so they feel attached to the unit.
- Bring status and facing indicators much closer to the unit.

Requirements:
- Hero portrait badge size: `70px`.
- Hero portrait position: very close to the unit, near the unit upper-side / upper-left / side.
- Portrait should feel attached to the unit, not floating away.
- Status/facing indicators should move much closer to the unit.
- Do not let status/facing indicators cover the portrait.
- Keep DOM unit image sharpness.
- Keep DOM overlay non-interactive.
- Keep Phaser hit zones, grid, highlights, HP bars, selection ring, and battle logic untouched.
- Do not change Phaser config.
- Do not change assets.
- Do not change world map.
- Do not address battlefield background blur yet.
- Do not implement movement tween animation yet.

## Next Candidate
`v0.5-9a Battle Background Sharpness Pass`

Goal:
- Investigate battlefield background blur as a separate problem from unit image sharpness.

Candidate options:
- 2x battlefield background image.
- DOM background layer.
- Canvas scaling / DPR audit.

Guard:
- Do not mix this pass with portrait alignment work.
- Do not start by changing Phaser global config blindly.

## Follow-Up Candidate
`v0.5-9b Battle Movement Animation Pass`

Goal:
- Replace snap movement with tweened movement.
- Add small timing polish later if needed.

Guard:
- Must be separate from the portrait alignment patch.
- Do not change movement rules, only presentation.

## System Candidate
`v0.5-10 Diplomacy & Spy Scaffold`

Goal:
- Add enemy information visibility tiers.
- Add no/partial/detailed spy information states.
- Limit enemy resources, troops, chancellor, and governor information depending on spy level.

Guard:
- Do not implement full diplomacy AI.
- Do not implement enemy domestic AI.
- Do not implement naval combat.

## World Map State To Preserve
- Final 13-city coordinates are already applied.
- `karakorum` is already implemented.
- Land links remain logically active.
- World map route visuals should prioritize sea routes only.
- Current city-label banner styling is acceptable for now.
- Do not reopen world-map label polish in the immediate next task.

## Guardrails
- Do not change battle rules.
- Do not change movement rules yet.
- Do not change attack / skill / strategy logic.
- Do not change troop / HP formulas.
- Do not change Phaser config.
- Do not change image assets.
- Do not change world map or city labels in the next task.
- Do not alter domestic/trade/save-load.
