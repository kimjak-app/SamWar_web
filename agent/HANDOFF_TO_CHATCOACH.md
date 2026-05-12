# SamWar_web Handoff

Current working version: `v0.5-3c City Loyalty + Security/Economy Drift`.
Baseline: `v0.5-3b Stable - Save / Load UI MVP`.

v0.5-3a and v0.5-3b browser manual QA passed with no console errors. v0.5-3c still needs browser QA.

## What Changed In v0.5-3c
- City loyalty now drifts every player turn for player-owned cities.
- Drift inputs are tax pressure, security, economy, and governor/chancellor control effects.
- Security is scaffold-only and derived from stationed hero `troops` totals.
- Economy is scaffold-only and derived from `commerceRating`, `populationRating`, current gold income, and city domestic multipliers.
- Final city loyalty delta is clamped to `-2..+2`.
- Results are stored in `world.lastCityLoyaltyResult`.
- Selected City displays security/economy/loyalty-drift summary.
- Military security status uses the same scaffold.
- Save version is now `v0.5-3c`; `v0.5-3b` remains legacy-loadable.

## v0.5-3c Not Implemented
- No recruitment.
- No troop types.
- No actual soldier increase/decrease.
- No city garrison system.
- No rebellion/riot events.
- No diplomacy/intelligence/real trade systems.
- No direct rule.
- No battle logic or Phaser Scene changes.

## What Changed In v0.5-3b
- Added World Turn HUD save/load/reset controls.
- Added localStorage one-slot save version `v0.5-3b`.
- Save is world-only and excludes battle/pending interaction state.
- Load normalizes missing fields and returns safely to world mode.
- Reset clears local saves and starts fresh.
- Added compact save result messages.

## v0.5-3b Not Implemented
- No server save.
- No account save.
- No multi-slot save.
- No auto-save.
- No battle save/load.
- No battle logic or Phaser Scene changes.
- No domestic formula changes.

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
- v0.5-3a and v0.5-3b QA are complete.
- v0.5-3c needs browser manual QA and regression-only fixes.
- Keep new domestic formulas centralized in `js/core/domestic_effects.js`.
