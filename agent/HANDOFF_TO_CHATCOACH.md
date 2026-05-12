# SamWar_web Handoff

Current working version: `v0.5-2d Enemy Invasion Defense Choice Center Modal`.
Baseline: `v0.5-2c Stable - Governor UI Polish + Turn Action UX Unification + Governor Policy Scaffold`.

v0.5-2c browser manual QA passed with no console errors. v0.5-2d still needs browser QA.

## What Changed In v0.5-2d
- Enemy invasion defense choice now appears as a centered modal.
- Defense choice is no longer shown under the right Selected City HUD.
- Direct defense / auto defense button attributes and handlers are unchanged.
- No invasion logic, battle logic, Phaser Scene, or window compatibility changes.

## What Changed In v0.5-2c
- Unified World Turn action buttons:
  - `아군 턴 종료`
  - `적군 턴 종료`
- Removed enemy turn result explanation text.
- Improved assigned governor display to match chancellor-style cards:
  - portrait
  - name
  - primary aptitude line
  - secondary aptitude line
- Removed assigned-state `관리: 태수 관리`.
- Unassigned governor state now shows `관리: 재상 통제 관리`.
- Removed unnecessary Selected City bottom combat guidance text.
- Added governor policy scaffold with city-level `governorPolicy`.
- Governor policy is saved only and has no effect.

## What Was Not Implemented
- No chancellor person-stat calculation.
- No governor person-stat calculation.
- No governor policy effects.
- No income/security/city-loyalty/resource/troop changes from governors.
- No recruitment, troop types, or real soldier upkeep.
- No direct-rule button.
- No enemy domestic automation.
- No intelligence, real trade, diplomacy, or talent recruitment.
- No Phaser Scene changes.
- No battle logic changes.
- No window compatibility reintroduction.

## QA Focus
- v0.5-2c QA is complete.
- Next work should start from the stable baseline and avoid adding effects to governor policy without a dedicated domestic-engine design pass.
