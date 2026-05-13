# SamWar_web Handoff

Current working version: `v0.5-6 Faction Identity Scaffold`.
Baseline: `v0.5-5b Attack/Defense Empty Battlefield Common Battle Unit Render Fix`.

v0.5-3a and v0.5-3b browser manual QA passed with no console errors. v0.5-6 browser QA was reported working by user.

## Final Close: v0.5-6 Faction Identity Scaffold
- v0.5-6 is the current handoff baseline for the next chat.
- Visible enemy identity is no longer a single generic enemy. Initial factions are:
  - `player` / 한성 세력
  - `luoyang_faction` / 낙양 세력
  - `pyeongyang_faction` / 평양 세력
  - `kyoto_faction` / 교토 세력
- Combat still uses `player` / `enemy` battle-side compatibility internally. Do not break this while expanding faction identity.
- Enemy chancellor/governor data is scaffold metadata only. Player manual chancellor/governor controls remain player-only.
- v0.5-6 browser QA reported working by user.

## Next Chat Target
`v0.5-7 Trade Route MVP`

Trade should start as internal trade between cities owned by the same faction. Do not implement diplomacy, treaties, external trade, espionage, or full enemy domestic AI yet.


## What Changed In v0.5-5a
- Battle troop truth is `allocatedTroops`.
- `hero.troops` remains legacy/fallback only.
- Default deployment allocation no longer uses `hero.troops`.
- Direct defense now opens a defense deployment/allocation modal.
- Auto defense uses defender garrison for automatic allocation.
- Enemy units use source city garrison based allocations.
- Battle UI and Phaser troop labels now display allocated troop current/max values.
- Recruitment batch is now 500.
- Wounded UI shows total only.
- Save version is now `v0.5-5a`.

## v0.5-5a Not Implemented
- No troop types.
- No troop-type selection UI.
- No Phaser Scene overhaul.
- No battle map/skill/AI overhaul.
- No `hero.troops` removal.
- No hard save break.

## What Changed In v0.5-5
- City garrison is now the source pool for sortie troops.
- Deployment modal has per-hero troop allocation sliders.
- Command limits:
  - 태수 10,000
  - 장군 8,000
  - 부장 6,000
  - 군관 5,000
- Governors are treated as 태수 for their city.
- Battle start deducts allocated troops from source garrison.
- Battle state records `troopAllocation`.
- Battle units carry `allocatedTroops` and `initialAllocatedTroops`.
- Battle `hp/maxHp` remains on the existing small tactical scale.
- After battle:
  - victory returns survivors and converts 30% of losses to wounded
  - defeat returns no immediate survivors and converts 50% of allocated troops to wounded
- Wounded soldiers are stored in `city.military.woundedQueue`.
- Wounded soldiers recover after 3 player turns.
- Save version is now `v0.5-5`.

## v0.5-5 Not Implemented
- No troop types.
- No troop-type selection UI.
- No Phaser Scene overhaul.
- No battle map/skill/AI overhaul.
- No diplomacy/intelligence/real trade systems.
- No direct rule.
- No rebellion/riot events.

## What Changed In v0.5-4c
- Added explicit city population values for recruitment ratio/cap.
- Population is separate from `populationRating`.
- Added recruitment ratio UI:
  - city population
  - recruitment ratio
  - ratio bar
  - security required troops/current garrison
- Mobilizable population is not displayed.
- Recruitment cap is now population-based:
  - `floor(population * maxTroopRatio) - garrisonTroops`
- Default `maxTroopRatio` is `0.50`.
- Ratio tiers:
  - 30% 균형
  - 35% 확장
  - 40% 부담
  - 45% 위험
  - 50% 한계
- Security uses city `securityRequiredTroops`.
- High recruitment ratio can affect next-turn city-loyalty drift as `군사 부담` or `군사 과밀`.
- Recruitment still does not directly change city loyalty.
- Save version is now `v0.5-4c`.

## v0.5-4c Not Implemented
- No sortie hero troop allocation.
- No battle unit troop structure change.
- No `hero.troops` removal or broad rewrite.
- No post-battle surviving troop return.
- No troop types.
- No defense formula changes.
- No battle logic or Phaser Scene changes.
- v0.5-5 Troop Allocation + Casualty + Wounded Recovery MVP is next:
  - add role-based command limits: 태수 10,000 / 장군 8,000 / 부장 6,000 / 군관 5,000
  - allocate city garrison troops to selected heroes at deployment
  - use horizontal bars/sliders for per-hero troop assignment
  - generate battle units from allocated troops
  - return survivors after battle
  - convert 30% of losses to wounded soldiers on victory
  - convert 50% of sortie troops to wounded soldiers on defeat
  - return wounded soldiers to city garrison after roughly 3 turns/months

## What Changed In v0.5-4b
- Added soldier recruitment MVP.
- Recruitment means city garrison growth:
  - `city.military.garrisonTroops` increases
  - `city.military.recruitableTroops` decreases
- Recruitment spends player resources:
  - 금전
  - 보리
  - 쌀
- Historical v0.5-4b recruitment started at `병사 50 모집`; current v0.5-5a recruitment uses `병사 500 모집`.
- Recruitment is player-city only and player-turn/world-mode only.
- Recruitment is blocked while battle/deployment/transfer/enemy-result state is pending.
- Recruitment result is stored in `world.lastRecruitmentAction`.
- Save version is now `v0.5-4b`; `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` remain legacy-loadable.
- Recruitment does not directly change city loyalty.
- Larger garrison can indirectly improve security and later city-loyalty drift.

## v0.5-4b Not Implemented
- No `hero.troops` increase.
- No `hero.maxTroops` increase.
- No battle-unit troop reflection.
- No city garrison battle participation.
- No troop types or troop-type UI.
- No battle logic or Phaser Scene changes.
- No defense formula changes.
- No rebellion/riot events.
- No diplomacy/intelligence/real trade systems.
- No direct rule.

## What Changed In v0.5-4
- Added `city.military.garrisonTroops`.
- Added `city.military.defenseRating`.
- Added four-city MVP military presets.
- Separated hero battle troops from city garrison troops:
  - `hero.troops` remains battle-participating hero troop data.
  - `city.military.garrisonTroops` is city security/defense preview data.
  - `city.military.recruitableTroops` remains recruitment preview data.
- Security now centers on city garrison:
  - `garrisonTroops + stationedHeroTroops * 0.3`
- Stationed hero troops are supporting input only.
- City loyalty drift remains connected to the shared security result.
- Military UI separates city garrison, stationed hero troops, recruitable troops, food, security, and defense rating.
- Soldier upkeep preview now has hero troop plus city garrison breakdown.
- Save version is now `v0.5-4`; `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` remain legacy-loadable.

## v0.5-4 Not Implemented
- No recruitment button.
- No real soldier recruitment.
- No troop types.
- No actual soldier increase/decrease.
- No city garrison battle participation.
- No battle troop persistence.
- No battle logic or Phaser Scene changes.
- No rebellion/riot events.
- No diplomacy/intelligence/real trade systems.
- No direct rule.

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

## v0.5-5b Handoff Note
- Fixed common empty battlefield regression by restoring `displayTroops` calculation inside `BattleScene.renderUnits()`.
- Attack/defense smoke tests confirm battle.units are non-empty and allocatedTroops are present.
- Next recommended step: browser QA before any new system work.


## v0.5-6 Handoff Note
- Current baseline is now `v0.5-6 Faction Identity Scaffold`.
- Enemy identity is no longer one generic `enemy` in city/hero ownership.
- Faction ids: `player`, `luoyang_faction`, `pyeongyang_faction`, `kyoto_faction`; legacy aggregate `enemy` remains only for old-save/enemy-wide summary compatibility.
- Battle units still use `side: player/enemy` for battle rules, and keep `factionId` for true faction identity.
- Next recommended work after QA: `v0.5-7 Trade Route MVP`.
