# Next Tasks

## Current Baseline
`v0.5-8j World Map Coordinate Tool + Final 12-City Layout`

## Immediate Candidate
`v0.5-8k Northern Faction Planning / Genghis Khan Candidate`

Goal:
- Plan, but do not implement by default, a northern steppe / Mongol faction candidate.
- Candidate placement is between `pyeongyang` and `yecheng`.
- Candidate city: `karakorum`.
- Candidate heroes: 징기스칸, 수부타이, 제베.
- Candidate routes:
  - `karakorum <-> pyeongyang`
  - `karakorum <-> yecheng`

Guard:
- Do not implement the Mongol faction unless explicitly requested.
- Do not alter the current 12-city route graph during planning.
- Do not add assets during planning.

## Next System Target
`v0.5-9 Diplomacy & Spy Scaffold`

Goal:
- Add enemy information visibility tiers.
- Add no/partial/detailed spy information states.
- Limit enemy resources, troops, chancellor, and governor information depending on spy level.
- Expand faction relation UI only as needed for the scaffold.

Guard:
- Do not implement full diplomacy AI.
- Do not implement enemy domestic AI.
- Do not implement naval combat.

## Visual Polish Target
`Battle DOM Text Scale Up Polish`

Goal:
- Increase unit troop label readability.
- Increase upper-right selected unit/hero info panel text.
- Increase bottom status legend text.
- Keep battle logic, Phaser config, DOM overlay coordinate math, and troop calculation unchanged.

## Asset Pilot Target
`Battle Asset HiDPI Pilot`

Goal:
- Test 2x hero face assets and one 2x unit sprite.
- Keep displayed size unchanged.
- Confirm whether higher source resolution improves visible sharpness before replacing more assets.

## World Map Follow-Up
- The final 12-city coordinate layout is applied.
- Coordinate debug tool can still be used for later layout work.
- Do not change route graph unless explicitly requested.
- Do not add 건업 <-> 한성 direct route unless explicitly requested.
- Preserve 한성/평양 no-direct-Japan rule.

## Guardrails
- Current baseline is `v0.5-8j`.
- Do not treat `v0.5-8i-2a`, `v0.5-8h`, or `v0.5-8d-1` as current.
- Do not alter battle logic.
- Do not alter domestic/trade formulas.
- Do not alter save/load structure.
- Do not implement diplomacy, espionage, enemy domestic AI, naval combat, or Mongol faction unless explicitly requested.
