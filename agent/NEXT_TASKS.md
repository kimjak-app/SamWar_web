# Next Tasks

## Current Baseline
`v0.5-9c-1 Battle Entry Fade SceneReady Hook Fix`

## Immediate Candidate
`v0.5-10 Diplomacy & Spy Scaffold`

Goal:
- Add a diplomacy / espionage scaffold to the city detail flow.
- Add a left-side diplomacy / espionage panel.
- Add `[외교]` and `[첩보]` tabs.
- Add relation value, relation state, and basic diplomacy action buttons.
- Add spy level, reconnaissance, rumor, and internal-collusion scaffold actions.

Guard:
- Do not implement full diplomacy AI.
- Do not implement enemy domestic AI.
- Do not implement naval combat.
- Keep this as scaffold/UI/data-flow work first.

## Follow-Up Candidate
`v0.5-10+ Diplomacy Action Effects`

Goal:
- Resolve actual diplomacy action effects and state changes.

Guard:
- Keep the initial scaffold simple before adding AI/system depth.

## System Candidate
`v0.5-10+ Spy Action Success / Failure System`

Goal:
- Add spy success/failure resolution.
- Add no/partial/detailed enemy information tiers.
- Limit enemy resources, troops, chancellor, and governor information by spy level.

Guard:
- Do not expand into full diplomacy AI yet.

## Presentation Follow-Up
`Battle Dust FX` / `Movement Cancel Tween`

Goal:
- Add lightweight battle movement polish after diplomacy scaffold work.
- Add cancel tween back to origin and optional dust/contact FX.

Guard:
- Do not change movement rules, only presentation.
- Keep battle logic untouched.

## Battle State To Preserve
- DOM unit image overlay remains the correct sharp rendering path.
- Portrait badge size remains `70px`.
- Portrait badge position remains attached closely to the unit.
- Status indicator position remains as-is.
- Facing text position remains as-is.
- Phaser and DOM battle movement both use `250ms` tween presentation.
- AI move tween uses `lastAction.presentationMove` as presentation metadata only.
- Battle entry now uses wrap-level fade tied to Phaser scene ready.
- `is-battle-ready` must be added after scene ready, not via early double `requestAnimationFrame`.

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
