# Current State

## Status
- Current working version: `v0.5-6 Faction Identity Scaffold`.
- Baseline before this patch: `v0.5-5b Attack/Defense Empty Battlefield Common Battle Unit Render Fix`.
- v0.5-3a is the first real domestic-effect MVP. It connects chancellor/governor aptitude and policy choices to actual domestic results through a central engine.
- Browser manual QA passed with no console errors.


## Current Stable Baseline: v0.5-6 Faction Identity Scaffold
- Current stable handoff baseline is `v0.5-6 Faction Identity Scaffold`.
- Factions are now explicit instead of a single visible enemy group:
  - `player` / 한성 세력
  - `luoyang_faction` / 낙양 세력
  - `pyeongyang_faction` / 평양 세력
  - `kyoto_faction` / 교토 세력
- Initial city ownership:
  - 한성 → `player`
  - 낙양 → `luoyang_faction`
  - 평양 → `pyeongyang_faction`
  - 교토 → `kyoto_faction`
- Initial hero ownership:
  - 이순신 / 정도전 → `player`
  - 관우 / 장비 → `luoyang_faction`
  - 광개토대왕 / 도림 → `pyeongyang_faction`
  - 노부나가 / 겐신 → `kyoto_faction`
- Battle side compatibility remains `player` vs `enemy`; faction ids are ownership/world identity, not a replacement for battle-side filtering yet.
- Enemy chancellor/governor scaffolds exist as metadata only; enemy domestic AI is not implemented.
- User reported v0.5-6 working after download.

## Next Major Target
`v0.5-7 Trade Route MVP`
- Start with same-faction internal trade routes between owned cities.
- Use city commerce, specialty resources, security, city loyalty, governor/chancellor effects, and faction ownership.
- Do not implement diplomacy treaties, external trade, espionage, or full enemy domestic AI in the first trade MVP.

## v0.5-5a Troop Allocation Stabilization Patch
- Battle troop truth is now `allocatedTroops`.
- `hero.troops` remains only as legacy/fallback data and is no longer used for default sortie allocation.
- Default deployment allocation now uses source city `garrisonTroops` and command limits:
  - small garrison is split evenly across selected heroes
  - large garrison fills command limits without exceeding source garrison
- Direct defense no longer starts battle immediately.
- Direct defense opens the defense deployment/allocation modal first.
- Auto defense uses defender city garrison for automatic allocation.
- Enemy attacker/defender units also receive allocations from their source city `garrisonTroops`.
- Enemy battle unit display no longer relies on `hero.troops`.
- Battle UI and Phaser unit labels display:
  - current displayed troops = `floor(initialAllocatedTroops * hp / maxHp)`
  - max displayed troops = `initialAllocatedTroops`
- Tactical `hp/maxHp` remains on the existing battle-balance scale.
- Recruitment batch size changed from 50 to 500.
- 500 recruits cost 금전 300 / 보리 200 / 쌀 150.
- Military UI removed:
  - stationed hero troop total
  - old note saying city garrison is not used in battle
  - wounded recovery horizon text
- Wounded UI now shows wounded total only.
- Save version advanced to `v0.5-5a`; `v0.5-5`, `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` remain legacy-loadable.

## v0.5-5 Troop Allocation + Casualty + Wounded Recovery MVP
- City garrison is now the source pool for player sortie troops.
- Heroes are treated as commanders, not independent troop pools.
- Deployment now assigns city garrison troops per selected hero.
- Command ranks and limits:
  - 태수: 10,000
  - 장군: 8,000
  - 부장: 6,000
  - 군관: 5,000
- A hero stationed as the selected/source city's governor is treated as 태수 dynamically.
- Non-governor heroes use `hero.commandRank`.
- `hero.commandRank` was added to hero data and is only a command-limit field.
- `hero.troops` and `hero.maxTroops` remain as legacy/fallback battle-balance data.
- Deployment UI shows:
  - source garrison
  - allocated troops
  - remaining garrison
  - hero command label/limit
  - per-hero allocation slider
- Battle start deducts the allocated total from source city `garrisonTroops`.
- Battle state records `battle.troopAllocation`.
- Battle units receive:
  - `allocatedTroops`
  - `initialAllocatedTroops`
- Battle unit `hp/maxHp` stays on the existing balance scale; it is not inflated to thousands.
- Battle survivor calculation:
  - `survivalRatio = hp / maxHp`
  - `survivingTroops = floor(initialAllocatedTroops * survivalRatio)`
- Victory:
  - survivors return immediately
  - 30% of losses become wounded
  - remaining losses are dead/missing
- Defeat:
  - no immediate survivors return
  - 50% of allocated sortie troops become wounded
  - remaining troops are dead/missing
- Wounded soldiers are stored in `city.military.woundedQueue`.
- New wounded entries use `turnsLeft: 3`.
- Player turn-end wounded recovery decreases `turnsLeft`; entries at `0` return to garrison.
- Military UI shows wounded total and recovery horizon.
- Save version advanced to `v0.5-5`; `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` remain legacy-loadable.
- No troop types, troop-type UI, Phaser Scene overhaul, battle map/skill/AI overhaul, diplomacy/intelligence/trade, direct rule, rebellion/riot, or window compatibility reintroduction.

## v0.5-4c Population-Based Recruitment Ratio Refactor
- Added explicit city `population` values separate from `populationRating`.
- `populationRating` remains the abstract tax/economy rating.
- `population` is MVP display/calculation population for recruitment ratio and population cap.
- City military model now includes:
  - `securityRequiredTroops`
  - `optimalTroopRatio`
  - `maxTroopRatio`
- Mobilizable population is not shown in the UI.
- Military UI now focuses on:
  - city population
  - recruitment ratio
  - recruitment ratio bar
  - security required troops
  - current garrison
  - food/security/defense preview
- Recruitment ratio tiers:
  - `0..30%`: 균형 / green
  - `30..35%`: 확장 / blue
  - `35..40%`: 부담 / yellow
  - `40..45%`: 위험 / red
  - `45..50%`: 한계 / critical
  - `50%+`: 모집 불가
- Recruitment availability now centers on population cap:
  - `remainingRecruitCapacity = floor(population * maxTroopRatio) - garrisonTroops`
  - default `maxTroopRatio` is `0.50`
- `recruitableTroops` remains for legacy/save compatibility but is no longer the core UI or recruitment-cap source.
- Security now compares `securityTroops = garrisonTroops + stationedHeroTroops * 0.3` against city `securityRequiredTroops`.
- Security thresholds:
  - `securityRequiredTroops * 1.2`: 안정
  - `securityRequiredTroops`: 주의
  - below required: 불안
- High recruitment ratio now affects next-turn city-loyalty drift only:
  - above `35%`: 군사 부담 candidate
  - above `40%`: 군사 부담
  - above `45%`: 군사 과밀
- Recruitment still does not directly change city loyalty.
- v0.5-5 Troop Allocation + Casualty + Wounded Recovery MVP is explicitly deferred:
  - add role-based command limits:
    - 태수 10,000
    - 장군 8,000
    - 부장 6,000
    - 군관 5,000
  - distribute city garrison troops to selected heroes at deployment
  - use horizontal bars/sliders for per-hero troop assignment
  - generate battle units from allocated troops
  - return surviving troops after battle
  - convert 30% of losses to wounded soldiers on victory
  - convert 50% of sortie troops to wounded soldiers on defeat
  - return wounded soldiers to city garrison after roughly 3 turns/months
  - none of this is implemented in v0.5-4c.
- Save version advanced to `v0.5-4c`; `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` remain legacy-loadable.

## v0.5-4b Recruitment MVP
- Added player-city soldier recruitment MVP.
- Recruitment increases `city.military.garrisonTroops`.
- Recruitment decreases `city.military.recruitableTroops`.
- Recruitment spends player resources.
- Fixed MVP action is one button:
  - historical initial button was `병사 50 모집`
  - superseded by v0.5-5a `병사 500 모집`
- Cost scales by recruited amount from the 50-soldier base:
  - 금전 30
  - 보리 20
  - 쌀 15
- Recruitment is allowed only in world mode, during player turn, for player-owned cities, with no pending battle/deployment/transfer/enemy-result state.
- Recruitment success stores `world.lastRecruitmentAction` and also mirrors it to `world.lastRecruitmentResult`.
- Recruitment uses the existing compact HUD message channel for success/failure.
- Recruitment does not change `hero.troops` or `hero.maxTroops`.
- Recruitment does not affect battle units, battle logic, Phaser Scene, or defense battle formulas.
- Recruitment does not directly change city loyalty.
- Increased garrison can indirectly improve security and later city-loyalty drift.
- Save version advanced to `v0.5-4b`; `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` remain legacy-loadable.

## v0.5-4 Military Model Scaffold
- City military data now separates hero battle troops from city garrison troops.
- `city.military.garrisonTroops` was added as the city garrison pool for security/defense preview.
- `city.military.defenseRating` was added as a display-only defense preview.
- City military scaffold shape:
  - `garrisonTroops`
  - `recruitableTroops`
  - `foodStatus`
  - `securityStatus`
  - `defenseRating`
- Four-city MVP military presets are defined in `data/cities.js` and normalized in `initializeCityDomesticData()`.
- Security now uses city garrison as the primary source:
  - `securityTroops = city.military.garrisonTroops + stationedHeroTroops * 0.3`
  - `250+`: 안정
  - `120+`: 주의
  - below `120`: 불안
- Stationed hero troops are only a supporting security input.
- Soldier upkeep preview now stores a breakdown:
  - `heroTroopCount`
  - `garrisonTroopCount`
  - `troopCount`
  - `unitCount`
  - `cost`
- World HUD shows soldier upkeep preview using hero troops plus city garrisons, still marked 미차감.
- Selected City military UI now separates:
  - 도시 주둔군
  - 징병 가능
  - 군량 상태
  - 치안 상태
  - 방어력
- Save version advanced to `v0.5-4`; `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` remain legacy-loadable.
- No soldier recruitment, troop types, actual soldier increase/decrease, battle troop persistence, city garrison battle participation, Phaser Scene changes, battle logic changes, rebellion, diplomacy, intelligence, real trade, direct rule, or window compatibility reintroduction were added.

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

### v0.5-5b Hotfix State
- Attack/defense empty battlefield issue fixed in Phaser battle rendering.
- `allocatedTroops` remains the troop display truth; `hp/maxHp` still preserve existing tactical battle balance.
- Attack and defense battle smoke tests generate player/enemy units successfully.


### v0.5-6 Faction Identity Scaffold State
- Replaced the single visible enemy identity with explicit faction ids: `luoyang_faction`, `pyeongyang_faction`, `kyoto_faction`.
- Initial city ownership is now faction-specific: 한성=player, 낙양=낙양 세력, 평양=평양 세력, 교토=교토 세력.
- Enemy heroes now keep their native faction id instead of generic `enemy`; battle units still map non-player factions to battle side `enemy`.
- Enemy home cities receive scaffold governor/chancellor metadata, but player-only manual appointment remains unchanged.
- Occupation now writes the actual conquering faction id rather than generic `enemy`.
- Trade remains unimplemented; faction identity is the prerequisite for later internal/external trade routing.
