# SamWar_web Handoff

Current stable version: `v0.5-3a Stable - Domestic Effect Engine MVP`.

Browser manual QA passed with no console errors.

## What Changed In v0.5-3a
- Added central domestic effect engine: `js/core/domestic_effects.js`.
- Chancellor and governor hero aptitude now affects real domestic results.
- Chancellor and governor policy choices now affect real domestic results.
- Applied effect areas:
  - income
  - hero upkeep
  - soldier upkeep preview
  - salt preservation
  - loyalty-loss mitigation
  - military preview/scaffold
- UI shows short chancellor and governor effect summaries.
- Military effects are preview-only and do not change actual soldier counts.

## v0.5-3a Not Implemented
- No recruitment.
- No troop types.
- No actual soldier increase/decrease.
- No rebellion/riot events.
- No diplomacy/intelligence/real trade systems.
- No direct rule.
- No combat/battle effects.
- No Phaser Scene or battle logic changes.

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
- Historical note: governor policy was save-only in v0.5-2c, then became active through `domestic_effects.js` in v0.5-3a.

## What Was Not Implemented
- No recruitment, troop types, or real soldier upkeep.
- No direct-rule button.
- No enemy domestic automation.
- No intelligence, real trade, diplomacy, or talent recruitment.
- No Phaser Scene changes.
- No battle logic changes.
- No window compatibility reintroduction.

## QA Focus
- v0.5-3a QA is complete.
- Next work should start from `v0.5-3a Stable`.
- Keep new domestic formulas centralized in `js/core/domestic_effects.js`.
