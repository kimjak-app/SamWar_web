# Current State

## Status
- Current working version: `v0.5-3c City Loyalty + Security/Economy Drift`.
- Baseline before this patch: `v0.5-3b Stable - Save / Load UI MVP`.
- v0.5-3a is the first real domestic-effect MVP. It connects chancellor/governor aptitude and policy choices to actual domestic results through a central engine.
- Browser manual QA passed with no console errors.

## v0.5-3c City Loyalty + Security/Economy Drift
- City loyalty now changes every player turn for player-owned cities.
- Drift inputs:
  - tax pressure
  - city security
  - city economy
  - governor/chancellor control effects
- Security is a scaffold derived from stationed hero `troops` totals:
  - `200+`: 안정
  - `100+`: 주의
  - below `100`: 불안
- Economy is a derived scaffold from `commerceRating`, `populationRating`, current gold income, and city policy/effect multipliers.
- Final city loyalty delta is clamped to `-2..+2` per turn.
- City loyalty remains clamped to `0..100`.
- Turn results are stored in `world.lastCityLoyaltyResult`.
- Selected City now shows a compact city status summary:
  - security
  - economy
  - last/expected city-loyalty change
- Military security status now reflects the same security scaffold.
- Save version advanced to `v0.5-3c`; `v0.5-3b` saves remain legacy-loadable.
- No actual soldier increase/decrease, recruitment, troop types, rebellion, diplomacy, intelligence, real trade, direct rule, Phaser Scene changes, or battle logic changes were added.

## v0.5-3b Save / Load UI MVP
- Added localStorage-based one-slot save/load/reset UI in the World Turn HUD.
- Save controls are available only in world mode.
- Battle state is not saved.
- Load always returns to safe world mode.
- Reset clears local save data and starts a fresh game.
- Save message feedback is shown in the World Turn HUD.
- Save version is `v0.5-3b`.
- Legacy key lookup keeps older local save slots from hard-failing.
- Missing loaded fields are normalized with current defaults.

## Save Scope
- Saved:
  - turn/calendar/meta
  - selection city/origin
  - ruler current city
  - domestic policy
  - resources/enemy resources
  - city ownership, loyalty, governor, governor policy, military/domestic/resource/yield scaffolds
  - hero side/location/troops/maxTroops and active/dead/retired-like fields through hero snapshots
  - world last income/upkeep/tax result summaries
- Not saved:
  - battle state
  - pending battle choice
  - pending hero deployment
  - pending hero transfer
  - pending enemy turn result

## v0.5-3a Domestic Effect Engine
- Added `js/core/domestic_effects.js` as the central domestic effect engine.
- Chancellor hero aptitude now affects national domestic results.
- Governor hero aptitude now affects selected city domestic results.
- Chancellor policy and governor policy are both included in final domestic effects.
- Applied result areas:
  - rice/barley/seafood/gold income
  - hero upkeep
  - soldier upkeep preview
  - salt preservation need
  - tax loyalty-loss mitigation
  - city military preview status
- UI now shows short effect summaries for chancellor and governor.
- Governor military/admin effects update preview/scaffold values only.
- No actual soldier count changes are made.

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
- Governor policy now affects city domestic results through `domestic_effects.js`.

## Selected City
- The old domestic 5-stat panel is still not called from Selected City.
- City type and city loyalty gauge remain visible.
- Stationed heroes, hero transfer, military scaffold, and resource grouping remain visible.
- The bottom non-action combat guidance text was removed.
- Attackable enemy cities still show the `공격` button.

## Explicit Non-Goals Preserved
- No soldier recruitment.
- No troop type additions.
- No actual soldier increase/decrease.
- No rebellion or riot events.
- No diplomacy system.
- No intelligence system.
- No real trade system.
- No direct-rule button.
- No combat power changes from domestic effects.
- No Phaser Scene changes.
- No battle logic changes.
- No window compatibility reintroduction.
- No large CSS/UI redesign.
 
## Deferred Beyond v0.5-3a
- Full domestic-engine balance pass.
- Real city garrison and recruitment system.
- Real trade/diplomacy/intelligence systems.
- Direct rule and ruler-location gameplay.
- Rebellion, unrest, or public-order events.
- Battle-facing effects from domestic systems.
