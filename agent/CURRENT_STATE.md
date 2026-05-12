# Current State

## Status
- Current working version: `v0.5-2d Enemy Invasion Defense Choice Center Modal`.
- Baseline before this minor patch: `v0.5-2c Stable - Governor UI Polish + Turn Action UX Unification + Governor Policy Scaffold`.
- Stable baseline before v0.5-2d: `v0.5-2c Stable`.
- v0.5-2d is a minor UI placement patch. It does not modify invasion logic, battle logic, Phaser Scene, or domestic systems.

## v0.5-2d Defense Choice Placement
- Enemy invasion defense choices now render as a centered modal.
- `pendingBattleChoice.type === "defense"` is no longer rendered under the right Selected City HUD.
- Defense choice buttons keep existing data attributes:
  - `data-battle-choice="manual"`
  - `data-battle-choice="auto"`
  - `data-battle-choice-city-id`
- Direct defense and auto defense handlers are unchanged.
- Attack choice UI can remain in the existing right-side flow.
- No enemy invasion chance, AI, battle result, Phaser Scene, or battle logic changes were made.

## Turn Action UX
- World Turn HUD now uses one large button style for turn actions.
- Player turn button text: `아군 턴 종료`.
- Enemy no-invasion result confirmation button text: `적군 턴 종료`.
- The enemy turn result message is no longer shown.
- The right-side Selected City stack still does not render a separate enemy result card.
- Defense battle-choice flow remains in the existing right-side card.

## Governor UI
- Player-owned selected cities show governor appointment controls.
- Candidate rule remains city-local:
  - player-side hero
  - stationed in selected city
- Assigned governor now displays a chancellor-style card:
  - portrait
  - name
  - primary type + aptitude
  - secondary type + aptitude
- The card reuses `hero.chancellorProfile` only as an administrative aptitude display profile.
- Governor profile display has no gameplay effect.
- If no governor is assigned:
  - `태수: 미임명`
  - `관리: 재상 통제 관리`
- If a governor is assigned, the old `관리: 태수 관리` line is not shown.
- Enemy cities do not show governor appointment or governor policy selects.

## Governor Policy Scaffold
- City objects now default `governorPolicy` to `follow_chancellor`.
- Player-owned selected cities show a governor policy select.
- Options:
  - `재상 정책 수행`
  - `농업 중심`
  - `상업 중심`
  - `군사 중심`
- `setCityGovernorPolicy(appState, cityId, governorPolicy)` validates player ownership and normalizes invalid values to `follow_chancellor`.
- Governor policy is stored only. It does not affect income, security, city loyalty, resources, troops, or upkeep.

## Selected City
- The old domestic 5-stat panel is still not called from Selected City.
- City type and city loyalty gauge remain visible.
- Stationed heroes, hero transfer, military scaffold, and resource grouping remain visible.
- The bottom non-action combat guidance text was removed.
- Attackable enemy cities still show the `공격` button.

## Explicit Non-Goals Preserved
- No chancellor person-stat calculation.
- No governor person-stat calculation.
- No governor policy effects.
- No income, security, city loyalty, resource, or troop changes from governors.
- No recruitment, troop types, or real soldier upkeep deduction.
- No direct-rule button.
- No enemy domestic automation.
- No intelligence, real trade, diplomacy, or talent recruitment.
- No Phaser Scene changes.
- No battle logic changes.
- No window compatibility reintroduction.
