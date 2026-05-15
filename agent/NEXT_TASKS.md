# Next Tasks

## Current Baseline
`v0.5-9b-1 Battle Movement Tween Follow-up Fix`

## Immediate Candidate
`v0.5-9c Battle Background Sharpness Pass`

Goal:
- Investigate battlefield background blur as a separate problem from unit image sharpness and entry transition polish.

Candidate options:
- 2x battlefield background image.
- DOM background layer.
- Canvas scaling / DPR audit.

Guard:
- Do not mix this pass with movement animation work.
- Do not start by changing Phaser global config blindly.
- Do not touch portrait badge size/position, facing text position, or status indicator position unless the blur investigation truly requires it.

## Follow-Up Candidate
`v0.5-9d Battle Movement Cancel Tween / Dust FX`

Goal:
- Add move-cancel tween back to origin.
- Add lightweight dust / contact FX if presentation quality needs it.

Guard:
- Do not change movement rules, only presentation.
- Keep battle logic untouched.

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

## Battle State To Preserve
- DOM unit image overlay remains the correct sharp rendering path.
- Portrait badge size remains `70px`.
- Portrait badge position remains attached closely to the unit.
- Status indicator position remains as-is.
- Facing text position remains as-is.
- Phaser and DOM battle movement both use `250ms` tween presentation.
- AI move tween uses `lastAction.presentationMove` as presentation metadata only.

## World Map State To Preserve
- Final 13-city coordinates are already applied.
- `karakorum` is already implemented.
- Land links remain logically active.
- World map route visuals should prioritize sea routes only.
- Current city-label banner styling is acceptable for now.

## Guardrails
- Do not change battle rules.
- Do not change attack / skill / strategy logic.
- Do not change troop / HP formulas.
- Do not change Phaser config.
- Do not change image assets.
- Do not change world map or city labels in the next task.
- Do not alter domestic/trade/save-load.
