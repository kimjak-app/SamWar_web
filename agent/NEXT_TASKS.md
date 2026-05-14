# Next Tasks

## Current Baseline
`v0.5-8i-2a Battle DOM Text Visual Polish`

## Immediate Next Target
`v0.5-8i-2c Battle DOM Text Scale Up Polish`

Goal:
- Scale up the overall Battle DOM Text Overlay typography.
- Improve unit troop number readability.
- Improve upper-right selected unit/hero info panel readability.
- Improve bottom status legend readability.
- Adjust top title / battlefield name size if needed.
- Do not change battle logic, Phaser config, troop calculation, or DOM overlay coordinate math.

Check:
- Unit troop labels such as `100/100`, `94/94`, and `221/221` are readable.
- Unit troop labels do not become oversized black boxes.
- Upper-right selected unit/hero info panel text is readable.
- Bottom status legend text is readable.
- Top title and battlefield name look natural.
- DOM overlay does not block clicks.
- Phaser text and DOM text are not duplicated.
- Movement/attack updates still keep troop numbers in the correct place.

## Next Visual Target
`v0.5-8i-3 Battle Asset HiDPI Pilot`

Goal:
- Test whether battle hero faces and unit sprites can be made sharper with higher-resolution source assets.
- Replace only 1-2 sample hero face assets at 2x resolution.
- Replace only one sample soldier sprite at 2x resolution.
- Keep displayed size unchanged.
- Defer full asset replacement until the pilot is confirmed.

Guard:
- Do not rebalance battle.
- Do not change unit movement or attack logic.
- Do not change Phaser config as the first solution.

## Next System Target
`v0.5-9 Diplomacy & Spy Scaffold`

Goal:
- Add diplomacy/spy scaffold.
- Limit enemy information visibility.
- Add faction relation UI expansion.
- Add no/partial/detailed spy information tiers.
- Hide or limit enemy resources, troops, chancellor, and governor information depending on spy level.

## Route / World Follow-Up
- Keep 건업 <-> 사비 as the West Sea route.
- Keep 건업 <-> 한성 direct route deferred.
- Keep 한성/평양 no-direct-Japan rule.
- Prepare a later 12-city world-map background draft after Battle DOM text polishing.

## Guardrails
- Current baseline is `v0.5-8i-2a`.
- Do not treat `v0.5-8d-1` or `v0.5-8h` as current.
- Do not implement diplomacy, espionage, enemy domestic AI, or naval combat unless explicitly requested.
- Do not add new portrait/cutin assets during text polish.
- Do not alter save/load structure during text polish.
