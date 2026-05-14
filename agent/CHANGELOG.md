# Changelog

## v0.5-8d City Detail Panel Tabs UX
- Shortened the default Selected City panel by removing long resource/trade/supply/detail sections.
- Added a separate City Detail Panel next to the Selected City summary panel.
- Added three City Detail tabs:
  - 자원
  - 자국무역
  - 타국무역
- Moved resource rows and commerce rating to the 자원 tab.
- Moved internal trade/supply, military supply judgment, and internal troop rebalance summary to the 자국무역 tab.
- Moved external trade, faction relation display, relation action buttons, and trade-control button to the 타국무역 tab.
- Added UI state `appState.ui.selectedCityDetailTab` for the active tab. It is not persisted to save data.
- Updated responsive layout so wide screens show summary/detail side by side and narrow screens stack them.
- Kept existing event data attributes for relation actions and trade control after DOM relocation.
- No domestic formula, trade formula, faction relation rule, troop rebalance logic, battle logic, Phaser Scene code, save/load structure, diplomacy, espionage, or enemy domestic AI changes.

## v0.5-8c Trade Goods & Control MVP
- Added external trade goods/control scaffolding.
- MVP trade goods are `gold`, `rice`, `barley`, `seafood`, `salt`, and `silk`.
- Deferred `wood`, `iron`, and `horses` from full trade handling.
- Added normalized per-city `tradeSettings`:
  - `mode`: `auto` / `direct`
  - `intensity`: `low` / `normal` / `high`
  - `exportWeights`: rice/barley/seafood/salt/silk
  - `importPriority`: gold/food/salt/silk
  - `routeLimitOverride`: scaffold only
- External route value now considers trade settings, operation intensity, governance efficiency, chancellor policy/type, and governor policy.
- Added city-level governance summaries:
  - 재상 자동 운영: 100%
  - 태수 제한 무역: 60%
  - 임시 관료 최소 무역: 30%
  - 직할 무역: player-controlled settings
- Added per-city external route limit selection. Default is 1 route per city; trade-focused chancellor policy can add 1.
- Added player-owned city `무역 조정` modal with auto/direct mode, intensity, export weights, and import priorities.
- Direct trade settings refresh `world.lastInterFactionTradeResult` immediately and are saved on the city.
- Selected City and World HUD now show external trade operation/efficiency details.
- Save version advanced to `v0.5-8c`; legacy load includes `v0.5-8b`, `v0.5-8`, `v0.5-7c`, `v0.5-7`, `v0.5-6`, `v0.5-5b`, `v0.5-5a`, `v0.5-5`, `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h`.
- No diplomacy AI, treaty negotiation, espionage, merchant units, naval trade combat, trade disruption events, troop types, battle logic changes, Phaser Scene changes, direct rule, enemy domestic AI, or window compatibility reintroduction.
- Next target documented as `v0.5-9 Diplomacy & Spy Scaffold` or `v0.5-9 Enemy Domestic AI MVP`.

## v0.5-8b Trade Relation / Agreement Scaffold
- Added `trade_paused` relation state for player/policy-driven trade pause without cooldown.
- Relation normalization now preserves `updatedTurn` and `reason`, and safely normalizes unknown/legacy statuses.
- Added relation helpers:
  - `setFactionRelationBidirectional()`
  - `pauseFactionTrade()`
  - `resumeFactionTrade()`
  - `promoteFactionTrade()`
  - `getFactionRelationLabel()`
  - `getFactionRelationDescription()`
  - `buildFactionRelationSummary()`
- Added player-side relation scaffold actions:
  - 교역 강화: `neutral -> trade`
  - 교역 중단: `neutral/trade -> trade_paused`
  - 교역 재개: `trade_paused -> neutral`
- Manual relation actions are limited to player-related relations and world mode with no battle/pending state.
- `trade_suspended` and `war` cannot be manually resumed.
- Battle-triggered `trade_suspended + tradeCooldownTurns: 10` remains intact.
- Cooldown end still restores `neutral + tradeAllowed: true`.
- Relation changes now refresh `world.lastInterFactionTradeResult` immediately.
- Selected City external trade section now shows relation label, trade availability description, and relation action buttons.
- World HUD now shows a compact player faction relation summary.
- Save version advanced to `v0.5-8b`; legacy load includes `v0.5-8`, `v0.5-7c`, `v0.5-7`, `v0.5-6`, `v0.5-5b`, `v0.5-5a`, `v0.5-5`, `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h`.
- Next target documented as `v0.5-8c Trade Goods & Control MVP`.
- No trade goods modal, export/import sliders, diplomacy AI, treaty negotiation, espionage, merchant units, naval trade combat, trade disruption events, troop types, battle logic overhaul, Phaser Scene changes, direct rule, enemy domestic AI, rebellion/riot, or window compatibility reintroduction.

## v0.5-8 Inter-Faction Trade MVP
- Added `js/core/inter_faction_trade.js`.
- Added top-level `state.factionRelations` scaffold for cross-faction relations:
  - `neutral`: trade allowed
  - `trade`: trade allowed with friendly modifier
  - `trade_suspended`: trade blocked after battle
  - `war`: trade blocked
- Missing legacy relation data normalizes to neutral, trade allowed, cooldown 0.
- External trade routes are adjacent different-faction city pairs only. Same-faction city trade remains internal supply/trade.
- External route calculation blocks trade if status is `war` or `trade_suspended`, `tradeAllowed` is false, or `tradeCooldownTurns > 0`.
- Battle start now sets both participating factions to `trade_suspended` for 10 turns in both directions.
- Trade cooldowns decrement once during player turn end and restore neutral/tradeAllowed when they reach 0.
- External route value uses commerce rating, specialty resources, security status, city loyalty, and relation modifier.
- Player-involved external trade income is applied to actual player resources.
- Non-player external trade income is recorded in `world.lastInterFactionTradeResult.factionTotals` only; no enemy stockpile/domestic AI was added.
- `world.lastInterFactionTradeResult` stores route count, player totals, faction ledger totals, active routes, and suspended relation summaries.
- `world.lastIncomeResult.interFactionTrade` records the external trade breakdown when turn income is applied.
- Selected City and World HUD now show a distinct external trade section, separate from internal supply and internal troop rebalance.
- Save version advanced to `v0.5-8`; legacy load includes `v0.5-7c`, `v0.5-7`, `v0.5-6`, `v0.5-5b`, `v0.5-5a`, `v0.5-5`, `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h`.
- Next target documented as `v0.5-8b Trade Relation / Agreement Scaffold` or `v0.5-9 Diplomacy & Spy Scaffold`.
- No diplomacy negotiation UI, treaty UI, espionage, merchant units, naval trade combat, trade disruption events, troop types, battle logic overhaul, Phaser Scene changes, direct rule, enemy domestic AI, rebellion/riot, or window compatibility reintroduction.

## v0.5-7c Internal Troop Rebalance MVP
- Connected v0.5-7 internal supply-network military judgment to actual same-faction garrison movement.
- Added internal troop rebalance planning/application in `js/core/trade_supply.js`.
- Player turn end now runs internal troop rebalance after internal trade/supply and before enemy invasion roll.
- Sending city requirements:
  - same faction
  - current garrison above target garrison
  - transfer cannot reduce sender below target garrison
  - rear cities are prioritized
- Receiving city requirements:
  - same faction
  - current garrison below target garrison
  - border/frontline cities are prioritized
  - receiver cannot exceed target garrison or population `maxTroopRatio` cap
- One-turn transfer amount is capped by sender surplus, receiver shortage, and a 3000-troop policy-adjusted cap, floored to 100-troop units.
- Chancellor policy lightly adjusts movement cap:
  - military +20%
  - agriculture -20%
  - commerce -10%
  - trade +10%
  - no chancellor -20%
- Added `world.lastTroopRebalanceResult` with transfers, reasons, before/after garrisons, and total moved.
- Whole-faction garrison total is preserved. Troops are moved, not produced or removed.
- Selected City and World HUD show recent internal troop rebalance results.
- Recruitment now minimally blocks when the city already satisfies its target garrison.
- Save version advanced to `v0.5-7c`; legacy load includes `v0.5-7`, `v0.5-6`, `v0.5-5b`, `v0.5-5a`, `v0.5-5`, `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h`.
- Next target documented as `v0.5-8 Inter-Faction Trade MVP`.
- No diplomacy trade, enemy trade, treaties, negotiation, espionage, merchant units, troop types, battle logic changes, Phaser Scene changes, direct rule, rebellion/riot, or window compatibility reintroduction.

## v0.5-7 Internal Trade & Supply Route MVP
- Added `js/core/trade_supply.js`.
- Internal trade/supply routes are same-faction only and activate when a faction owns 2+ cities.
- Player UI now displays internal supply network information; this is not diplomacy trade or enemy/cross-faction trade.
- Route generation uses adjacent same-faction cities first, with same-faction pair fallback if needed.
- Added city role judgment:
  - 후방: no adjacent other-faction city
  - 국경: 1 adjacent other-faction city
  - 최전선: 2+ adjacent other-faction cities
- Added role-based target garrison:
  - 후방: `max(securityRequiredTroops, population * 0.10)`
  - 국경: `max(securityRequiredTroops, population * 0.22)`
  - 최전선: `max(securityRequiredTroops, population * 0.30)`
- Added surplus/shortage judgment for city garrisons.
- Added priority-based 금전/식량/소금 supply allocation by role, garrison need, garrison burden, food/salt pressure, city loyalty risk, commerce, chancellor policy/profile, and governor policy/profile.
- Added support-candidate display:
  - rear surplus cities list possible support targets
  - border/frontline shortage cities list possible rear support sources
- No actual troop movement is implemented. No `garrisonTroops` transfer occurs.
- Turn-end stores `world.lastSupplyNetworkResult`.
- Turn-end applies only a small national 금전 bonus from active internal routes. 식량/소금 remain displayed allocation/efficiency values without city stockpiles.
- Selected City replaced the old trade placeholder with internal trade/supply and military support judgment.
- World HUD now shows internal supply route count, 금전/식량/소금 allocation totals, and support-needed cities.
- Save version advanced to `v0.5-7`; legacy load includes `v0.5-6`, `v0.5-5b`, `v0.5-5a`, `v0.5-5`, `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h`.
- Next target documented as `v0.5-7b Internal Troop Rebalance MVP`.
- No diplomacy trade, enemy trade, treaties, negotiation, espionage, merchant units, naval route combat, automatic troop movement, troop type additions, battle logic changes, Phaser Scene changes, direct rule, window compatibility reintroduction, or large CSS/UI redesign.

## v0.5-6-final - Handoff Document Cleanup
- Marked `v0.5-6 Faction Identity Scaffold` as the current handoff baseline.
- Clarified that faction-color/button-color differentiation is deferred to a later world map visual update.
- Added `v0.5-7 Trade Route MVP` as the next major target.
- Trade MVP scope is internal same-faction city trade first; diplomacy/external treaties/espionage remain out of scope.
- Refreshed handoff, current state, next tasks, QA checklist, changelog, and session log for the next chat.


## v0.5-5a Troop Allocation Stabilization Patch
- Stabilized troop allocation around `allocatedTroops` as battle troop truth.
- Removed `hero.troops` from default deployment allocation.
- Default allocation now uses source city garrison and command limits.
- Direct defense now opens the defense deployment/allocation modal instead of entering battle immediately.
- Auto defense still skips manual UI but uses defender city garrison for automatic allocation.
- Enemy units now receive source-city garrison based allocations.
- Enemy source garrison is deducted at battle start for allocated enemy troops.
- Battle UI and Phaser display current/max troop labels from allocated troops:
  - `current = floor(initialAllocatedTroops * hp / maxHp)`
  - `max = initialAllocatedTroops`
- Tactical `hp/maxHp` remains on the existing battle scale.
- Recruitment batch increased from 50 to 500.
- 500 recruits cost 금전 300 / 보리 200 / 쌀 150.
- Military UI removed stationed hero troop total.
- Military UI removed the obsolete "city garrison is not used in battle yet" note.
- Wounded UI now shows wounded total only.
- Save version advanced to `v0.5-5a`.
- No troop types, troop-type UI, Phaser Scene overhaul, battle map/skill/AI overhaul, diplomacy/intelligence/trade, direct rule, rebellion/riot, `hero.troops` removal, or hard save break.

## v0.5-5 Troop Allocation + Casualty + Wounded Recovery MVP
- Added command rank constants:
  - 태수 10,000
  - 장군 8,000
  - 부장 6,000
  - 군관 5,000
- Added `hero.commandRank` to hero data.
- Governors are treated as 태수 dynamically for the selected/source city.
- Added troop allocation sliders to the deployment modal.
- Deployment now tracks source garrison, allocated troops, and remaining garrison.
- Battle start deducts allocated troops from source city `garrisonTroops`.
- Battle state now records `troopAllocation`.
- Battle units now carry `allocatedTroops` and `initialAllocatedTroops`.
- Existing battle `hp/maxHp` scale remains unchanged.
- Added survivor calculation from battle HP ratio.
- Victory handling:
  - survivors return immediately
  - 30% of losses become wounded
  - remaining losses are dead/missing
- Defeat handling:
  - no immediate survivor return
  - 50% of allocated sortie troops become wounded
  - remaining troops are dead/missing
- Added `city.military.woundedQueue`.
- Added 3-turn wounded recovery into player turn-end flow.
- Military UI now shows wounded total and recovery horizon.
- Save version advanced to `v0.5-5` and preserves `v0.5-4c`, `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` as legacy load keys.
- No troop types, troop-type UI, Phaser Scene overhaul, battle map/skill/AI overhaul, diplomacy/intelligence/trade, direct rule, rebellion/riot, or window compatibility reintroduction.

## v0.5-4c Population-Based Recruitment Ratio Refactor
- Added explicit city population values:
  - Hanseong: 50,000
  - Luoyang: 80,000
  - Pyongyang: 42,000
  - Kyoto: 45,000
- Kept `populationRating` as the existing tax/economy abstraction.
- Added city military fields:
  - `securityRequiredTroops`
  - `optimalTroopRatio`
  - `maxTroopRatio`
- Added recruitment ratio calculation:
  - `garrisonTroops / population`
- Added recruitment ratio UI bar.
- Added recruitment ratio tiers:
  - `0..30%`: 균형
  - `30..35%`: 확장
  - `35..40%`: 부담
  - `40..45%`: 위험
  - `45..50%`: 한계
  - `50%+`: 모집 불가
- Mobilizable population is intentionally not displayed in UI.
- Recruitment availability now centers on population cap:
  - `floor(population * maxTroopRatio) - garrisonTroops`
- `recruitableTroops` remains for legacy/save compatibility but is no longer the core UI/cap source.
- Security now uses each city's `securityRequiredTroops` threshold.
- Military burden/overcrowding now affects next-turn city-loyalty drift reasons and delta only.
- Recruitment still does not directly change city loyalty.
- Save version advanced to `v0.5-4c` and preserves `v0.5-4b`, `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` as legacy load keys.
- Explicitly deferred v0.5-5 Troop Allocation + Casualty + Wounded Recovery MVP:
  - add role-based command limits: 태수 10,000 / 장군 8,000 / 부장 6,000 / 군관 5,000
  - allocate city garrison troops to sortie heroes
  - use horizontal bars/sliders for per-hero troop assignment
  - create battle units from allocated troops
  - return surviving troops after battle
  - convert 30% of losses to wounded soldiers on victory
  - convert 50% of sortie troops to wounded soldiers on defeat
  - return wounded soldiers to city garrison after roughly 3 turns/months
- No sortie troop allocation, battle unit structure change, hero troop removal, post-battle troop return, troop types, defense formula changes, Phaser Scene changes, battle logic changes, diplomacy/intelligence/real trade, direct rule, or window compatibility reintroduction.

## v0.5-4b Recruitment MVP
- Added city soldier recruitment MVP.
- Recruitment increases `city.military.garrisonTroops`.
- Recruitment decreases `city.military.recruitableTroops`.
- Recruitment spends player resources.
- Added fixed MVP recruitment button:
  - historical initial button was `병사 50 모집`
  - superseded by v0.5-5a `병사 500 모집`
- Recruitment cost scales by amount from the 50-soldier base:
  - 금전 30
  - 보리 20
  - 쌀 15
- Added immutable state transition `recruitCityTroops(appState, cityId, amount)`.
- Added UI event wiring through `world_map_ui.js` and `main.js`.
- Added compact success/failure messages through the existing HUD message field.
- Added `world.lastRecruitmentAction` and mirrored the action to `world.lastRecruitmentResult`.
- Save version advanced to `v0.5-4b` and preserves `v0.5-4`, `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` as legacy load keys.
- Recruitment has no direct city-loyalty change.
- Recruitment can indirectly improve later security/city-loyalty drift by increasing garrison troops.
- No `hero.troops` increase, `hero.maxTroops` increase, battle-unit troop reflection, garrison battle participation, troop types, troop-type UI, battle logic changes, Phaser Scene changes, defense formula changes, rebellion, diplomacy, intelligence, real trade, direct rule, or window compatibility reintroduction.

## v0.5-4 Military Model Scaffold
- Added `city.military.garrisonTroops`.
- Added `city.military.defenseRating`.
- Added four-city MVP military presets in `data/cities.js`.
- Extended city military normalization so old saves and old city data receive missing military fields safely.
- Separated responsibilities:
  - `hero.troops` / `hero.maxTroops`: battle-participating hero troops, unchanged.
  - `city.military.garrisonTroops`: city garrison for security/defense preview, not battle.
  - `city.military.recruitableTroops`: recruitment preview pool, no recruitment UI or spending.
- Changed security calculation from stationed hero troop total to city-garrison-centered scoring:
  - `garrisonTroops + stationedHeroTroops * 0.3`
  - stable/caution/unstable thresholds are `250 / 120 / below`.
- Stationed hero troops now support security but no longer define it alone.
- City loyalty drift continues to consume the shared security result.
- Military UI now displays city garrison, stationed hero troops, recruitable troops, food status, security status, and defense rating separately.
- Soldier upkeep preview now includes `heroTroopCount`, `garrisonTroopCount`, and combined `troopCount`.
- World HUD soldier upkeep preview now labels the hero troop plus city garrison basis and remains 미차감.
- Save version advanced to `v0.5-4` and preserves `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` as legacy load keys.
- No soldier recruitment, recruitment button, troop types, actual soldier increase/decrease, garrison battle participation, battle troop persistence, Phaser Scene changes, battle logic changes, rebellion, diplomacy, intelligence, real trade, direct rule, or window compatibility reintroduction.

## v0.5-3c City Loyalty + Security/Economy Drift
- Added city loyalty drift to the turn-end domestic flow.
- City loyalty now changes from:
  - tax pressure
  - security scaffold
  - economy scaffold
  - governor/chancellor control effects
- Security scaffold uses stationed hero `troops` totals:
  - `200+`: 안정
  - `100+`: 주의
  - below `100`: 불안
- Economy scaffold uses city `commerceRating`, `populationRating`, current gold income, and city domestic effect multipliers.
- Final per-turn city loyalty delta is clamped to `-2..+2`.
- City loyalty remains clamped to `0..100`.
- Stored turn result in `world.lastCityLoyaltyResult`.
- Selected City now shows a compact city status summary for security, economy, and last/expected city-loyalty drift.
- Military security status now shares the same security scaffold.
- Save version advanced to `v0.5-3c` and preserves `v0.5-3b` as a legacy load key.
- No recruitment, troop type additions, actual soldier increase/decrease, city garrison system, rebellion, diplomacy, intelligence, real trade, direct rule, Phaser Scene changes, battle logic changes, or window compatibility reintroduction.
- `node --check` passed for requested and modified JS files.

## v0.5-3b Stable Save / Load UI MVP
- Added World Turn HUD save controls:
  - `저장`
  - `불러오기`
  - `초기화`
- Implemented localStorage one-slot save MVP with save version `v0.5-3b`.
- Save/load/reset is restricted to world mode.
- Save snapshot stores world-only state and excludes battle/pending modal state.
- Load normalizes older/missing fields:
  - ruler
  - governorHeroId
  - governorPolicy
  - military scaffold
  - domestic policy
  - resources/enemy resources
  - city domestic/resource/yield scaffold
- Load returns safely to world mode and clears battle/pending interaction state.
- Reset clears the local save slot and starts a fresh initial game state.
- Added compact HUD message feedback for save/load/reset results.
- Fixed new-game reset so canonical hero runtime state returns to initial side/location/troop values.
- No server save, account save, multi-slot save, auto-save, battle save/load, battle logic change, Phaser Scene change, domestic formula change, or window compatibility reintroduction.
- `node --check` passed for requested and modified JS files.

## v0.5-3a Stable Domestic Effect Engine MVP
- Closed the current baseline as `v0.5-3a Stable`.
- Added central domestic effect engine: `js/core/domestic_effects.js`.
- Chancellor and governor aptitude now affect real domestic results.
- Chancellor and governor policies now participate in final domestic effects.
- Applied effects:
  - rice/barley/seafood/gold income multipliers
  - hero upkeep reduction
  - soldier upkeep preview reduction
  - salt preservation need reduction
  - national and city loyalty-loss mitigation from tax pressure
  - city military preview values/status
- Chancellor effects are national.
- Governor effects are city-specific and apply only when the governor hero is valid, player-side, and stationed in the city.
- Governor policy is city-specific and affects city income/military preview.
- Added short effect summaries in World Turn HUD and Selected City governor panel.
- Save/load hydration now re-runs city domestic initialization so older saves receive governor/military policy defaults.
- Military preview changes remain preview/scaffold only.
- No soldier recruitment, troop type additions, actual soldier count changes, rebellion, diplomacy, intelligence, real trade, direct rule, Phaser Scene changes, battle logic changes, or window compatibility reintroduction.
- `node --check` passed for requested and modified JS files.
- Browser manual QA passed:
  - chancellor/governor effect summaries confirmed
  - chancellor/governor policy income changes confirmed
  - tax loyalty-loss mitigation confirmed
  - hero upkeep and salt preservation changes confirmed
  - military preview changes confirmed
  - actual soldier count unchanged
  - save/load compatibility confirmed
  - tax/chancellor/governor/hero transfer/battle/invasion modal regressions passed
  - no console errors

## v0.5-2d Enemy Invasion Defense Choice Center Modal
- Minor UI placement patch on top of `v0.5-2c Stable`.
- Moved `pendingBattleChoice.type === "defense"` from the right Selected City HUD stack to a centered modal.
- Preserved defense choice content:
  - `Enemy Invasion`
  - `적군이 침공했습니다!`
  - 침공 도시
  - 방어 도시
  - 방어 방식 안내
  - 직접 방어 / 자동 방어 buttons
- Preserved existing battle choice data attributes and handlers.
- Attack pending battle choice can still use the existing right-side flow.
- No enemy invasion chance, AI, defense result handling, Phaser Scene, battle logic, or window compatibility changes.
- `node --check` passed for `js/ui/ui_render.js` and `js/ui/world_map_ui.js`.

## v0.5-2c Stable Governor UI Polish + Turn Action UX Unification + Governor Policy Scaffold
- Closed the current baseline as `v0.5-2c Stable`.
- Minor UI/UX patch on top of `v0.5-2b`.
- Unified World Turn action buttons:
  - player turn: `아군 턴 종료`
  - enemy no-invasion confirmation: `적군 턴 종료`
- Removed enemy turn result explanation text from the HUD.
- Improved assigned governor UI to reuse chancellor-style card presentation:
  - portrait
  - name
  - primary type + aptitude
  - secondary type + aptitude
- Reused `hero.chancellorProfile` only as a temporary administrative aptitude display profile for governors.
- Removed assigned-state `관리: 태수 관리`.
- Unassigned governor state now shows `관리: 재상 통제 관리`.
- Removed unnecessary Selected City bottom combat guidance text.
- Added governor policy scaffold:
  - `GOVERNOR_POLICY_KEYS`
  - `GOVERNOR_POLICY_LABELS`
  - `city.governorPolicy`
  - `setCityGovernorPolicy(appState, cityId, governorPolicy)`
- Governor policy options:
  - `재상 정책 수행`
  - `농업 중심`
  - `상업 중심`
  - `군사 중심`
- Governor policy is stored only and has no effect.
- No chancellor/gov person-stat calculations, no governor policy effects, no domestic formulas, no Phaser Scene changes, no battle logic changes, and no window compatibility reintroduction.
- `node --check` passed for requested and modified JS files.
- Browser manual QA passed:
  - turn action buttons unified
  - enemy turn result explanation removed
  - governor card portrait/primary/secondary display confirmed
  - governor unassigned management text confirmed
  - governor policy save-only behavior confirmed
  - Selected City bottom guidance removal confirmed
  - tax/chancellor/warehouse/city selection/hero transfer/attack-deployment-battle regressions passed
  - no console errors

## v0.5-2b Governor Appointment MVP + Loyalty Gauge UI + Enemy Turn Result HUD Unification
- Minor patch on top of `v0.5-2 Selected City Panel Reorganization + Governor/Military Scaffold`.
- Added governor appointment MVP for player-owned selected cities.
- Governor candidates are restricted to player-side heroes stationed in the selected city.
- Added `setCityGovernorHeroId(appState, cityId, governorHeroId)`.
  - validates city existence
  - validates player ownership
  - allows empty value as `null`
  - validates selected governor is a player-side hero stationed in that city
  - updates `world.cities` immutably
- Governor assignment only writes `city.governorHeroId`.
- No governor effects, governor policy, stat formula, income change, security change, or city-loyalty automation.
- Added `js/ui/loyalty_ui.js`.
- National loyalty and city loyalty now render as horizontal gauges with four tiers:
  - green / `매우 안정`
  - blue / `안정`
  - yellow / `주의`
  - red / `위험`
- Moved `pendingEnemyTurnResult` display into the left World Turn HUD.
- Removed the right-side Selected City stack enemy-turn result card.
- Preserved `data-enemy-turn-result="confirm"` for the confirm button.
- No Phaser Scene changes, no battle changes, no window compatibility reintroduction, and no large CSS redesign.
- `node --check` passed for requested and newly added JS files.

## v0.5-2 Selected City Panel Reorganization + Governor/Military Scaffold
- Reorganized the Selected City panel for the new domestic-management direction.
- Removed the old domestic 5-stat panel from Selected City by cutting the `renderDomesticPanel()` call.
- Preserved `js/ui/domestic_ui.js` for future direct-rule or city-detail reuse.
- Kept city type and city loyalty display in the city profile.
- Added governor/management display scaffold:
  - `city.governorHeroId` defaults to `null`.
  - no governor appointment, dismissal, select UI, or governor policy implementation.
  - ruler city without a governor displays `왕 직할 통치`.
  - other no-governor cities display `재상 대리 관리`.
- Added ruler location scaffold:
  - `appState.ruler.currentCityId`
  - initial value: `hanseong`
- Added military status display scaffold:
  - total troops sums stationed hero troops for now.
  - `city.military.recruitableTroops`
  - `city.military.foodStatus`
  - `city.military.securityStatus`
  - no recruitment, troop type, upkeep deduction, or security-loyalty automation.
- Reorganized city resource display:
  - food resources: 쌀 / 보리 / 수산물
  - strategic resources: 목재 / 철 / 말
  - specialty resources: 비단 / 소금
  - commerce rating remains visible
  - trade information is placeholder-only.
- Added small CSS support for governor/military panels and a minor national-loyalty text adjustment.
- No Phaser Scene changes, no window compatibility reintroduction, and no large UI redesign.
- `node --check` passed for requested and newly added JS files.

## v0.5-0a Stable Domestic Stats & Resource Display Scaffold + World Map HUD Polish
- Closed the current baseline as `v0.5-0a Stable`.
- Added a replaceable domestic affairs scaffold for city-level values.
- This is not the final domestic affairs system.
- Added runtime city scaffold fields:
  - `domestic`
  - `resources`
  - `yields`
- Added `initializeCityDomesticData(cities)`.
  - Returns copied city objects.
  - Does not mutate imported static city data in-place.
  - Preserves future per-city overrides.
  - Fills missing scaffold defaults.
- `createInitialAppState()` now initializes `world.cities` through `initializeCityDomesticData(cities)`.
- Domestic scaffold shape:
  - `domestic.publicOrder`
  - `domestic.morale`
  - `domestic.agriculture`
  - `domestic.commerce`
  - `domestic.stability`
  - `resources.rice`
  - `resources.barley`
  - `resources.seafood`
  - `resources.gold`
  - `resources.specialty`
  - `yields.riceHarvest`
  - `yields.barleyHarvest`
  - `yields.seafoodPerTurn`
  - `yields.commerceIncome`
  - `yields.specialtyIncome`
- Added selected city domestic display:
  - `renderCityDomesticPanel(selectedCity)`
  - text/number/bar rows for domestic stats
  - separated resource rows
  - expected income rows
- Added compact domestic CSS classes:
  - `.city-domestic-panel`
  - `.city-domestic-section`
  - `.city-domestic-heading`
  - `.domestic-stat-row`
  - `.domestic-row-header`
  - `.domestic-bar`
  - `.domestic-bar-fill`
  - `.domestic-resource-row`
  - `.domestic-yield-row`
- No final formulas, seasonal calendar, chancellor, governor, compatibility, troop allocation, recruitment, troop loss persistence, terrain effects, battle AI, damage, skills, spawn, hero transfer, recruitment, or asset changes.
- World map HUD polish:
  - Left HUD now contains title panel, MVP Goal panel, and World Turn panel.
  - Right HUD starts with the Selected City panel.
  - World Turn is no longer stacked above Selected City on the right.
  - Hero transfer button appears directly below stationed heroes and uses compact styling.
  - Domestic stats/resources/yields appear below the hero transfer action.
  - Right-side linked cities panel was removed to reduce crowding; city selection remains available through map city nodes.
- `node --check` passed for changed JS files.
- User manual browser QA confirmed current stable baseline.

## v0.4-3 Stable Region-Based Hero Control + Directional Battle Spawn + Hero Transfer MVP
- Closed the v0.4 region-based hero-control line as the current stable baseline.
- SamWar_web is now documented as a region-based hero strategy MVP:
  - The player controls regions, not a permanent ruler character.
  - Heroes are stationed in regions through `hero.locationCityId`.
  - A city owner controls heroes stationed in that city.
- Current core loop:
  1. Select player-owned region.
  2. Attack adjacent enemy region.
  3. Win battle.
  4. Capture city.
  5. Stationed enemy heroes switch to player side.
  6. Heroes remain stationed in conquered city.
  7. Player can transfer heroes between player-owned cities.
  8. Deployment candidates come from the selected origin city's stationed heroes.
  9. Battle spawn direction follows world-map city direction.
- Manual QA confirmed v0.4-3 as stable.

## v0.4-3a Selected City Stationed Heroes UI
- Selected city panel now shows stationed heroes under `주둔 무장`.
- Uses mutable runtime hero state:
  - `hero.side`
  - `hero.locationCityId`
- Shows all heroes stationed in the selected city.
- Uses portrait thumbnails when available.
- Empty state: `주둔 무장 없음`.
- Reinforces conquest, recruitment, and hero transfer results in the world map UI.
- No battle, transfer, recruitment, deployment, AI, balance, render, terrain, or asset changes.

## v0.4-3 Hero Transfer MVP
- Added instant hero transfer between player-owned cities.
- Transfer rules:
  - Only player-side heroes can be transferred.
  - Heroes can move only from a player-owned city.
  - Heroes can move only to another player-owned city.
  - Transfer is instant.
  - No turn cost, troop transfer, food cost, travel time, fatigue, loyalty, persuasion, governor/chancellor, or domestic-affairs integration.
- Added helpers:
  - `getTransferableHeroesFromCity(cityId, factionId)`
  - `getFactionOwnedDestinationCities(cities, factionId, excludeCityId)`
  - `transferHeroToCity(heroId, targetCityId, cities, factionId)`
- Added app state actions:
  - `openHeroTransfer(appState, sourceCityId)`
  - `cancelHeroTransfer(appState)`
  - `selectHeroTransferHero(appState, heroId)`
  - `selectHeroTransferTargetCity(appState, targetCityId)`
  - `confirmHeroTransfer(appState, heroId, targetCityId)`
- Added UI:
  - `renderHeroTransferPanel()`
  - selected city panel button: `무장 이동`
  - centered modal for hero transfer
  - selectable source-city heroes
  - selectable player-owned destination cities
- Manual QA confirmed:
  - After conquering Luoyang, `관우` / `장비` are stationed in Luoyang.
  - `관우` can be transferred from Luoyang to Hanseong.
  - Hanseong deployment then shows `이순신` / `정도전` / `관우`.
  - Luoyang deployment no longer shows `관우`.
  - 3-hero deployment and battle entry work.
  - Region-based battle spawn still works after transfer.

## v0.4-2c Battle Spawn Direction Fix
- Battle spawn positions are no longer determined by hero ID.
- `buildBattleUnit(heroId, spawnPosition, facing)` now uses provided role-based spawn data.
- Added helpers:
  - `getBattleSpawnSides(attackerCity, defenderCity)`
  - `getFacingForBattleSide(side)`
  - `getSpawnSlot(side, index)`
- Spawn direction follows world-map city x positions:
  - attacker city right of defender city -> attacker right / defender left
  - attacker city left of defender city -> attacker left / defender right
  - fallback -> attacker left / defender right
- Player is no longer assumed to always spawn left.
- Enemy is no longer assumed to always spawn right.
- Manual QA confirmed:
  - Hanseong -> Pyongyang: attacker left / defender right
  - Pyongyang -> Luoyang: attacker right / defender left
  - units do not overlap
  - units face each other

## v0.4-2b Generic Ally Buff Battle Log Fix
- Generalized `getAllyAttackBuffOpeningLog(casterUnit, skill)`.
- Removed hardcoded Jeong Do-jeon, `개혁령`, `영락대업`, and `yeongnak_grand_legacy` battle-log text.
- Final log format:
  - `${casterUnit.name}: ${skill.name} 발동. 아군 공격력 +${buffPercent}% · ${duration}턴`
- Uses actual actor and skill data.
- Percent is calculated from `skill.buffAttackBonus`.
- Duration is read from `skill.duration`.

## v0.4-2a Buff Source Label + Selected Attack Origin Fix
- Ally attack buff status labels now use source skill names.
- Added status fields:
  - `buffAttackSourceSkillId`
  - `buffAttackSourceSkillName`
- `정도전` / `개혁령` displays as `개혁령 효과 +15% · 2턴`.
- `광개토대왕` / `영락대업` displays as `영락대업 효과 +20% · 2턴`.
- Future `effectType: "ally_attack_buff"` skills should display their own skill name.
- Added `selection.originCityId`.
- Selecting a player-owned city stores it as preferred attack origin.
- Clicking an enemy city preserves the previous selected origin.
- If selected origin is valid and adjacent, attack starts from that city.
- Fallback still finds a valid adjacent player-owned city if selected origin is invalid.

## v0.4-2 Region-Based Hero Control MVP
- Added runtime `hero.locationCityId` support.
- Initial hero locations are initialized from `battleRosters.cityDefenderRosters`.
- Deployment candidates are no longer hardcoded to Hanseong.
- Player attack deployment candidates now come from:
  - `hero.side === "player" && hero.locationCityId === originCityId`
- If a city is captured, stationed heroes switch to the conquering faction and remain in that city.
- If Hanseong is captured by enemy, `이순신` / `정도전` become enemy-side and stay in Hanseong.
- If Pyongyang is conquered by player, `광개토대왕` / `도림` become player-side and stay in Pyongyang.

## v0.4-1 Victory Hero Recruitment MVP
- When a city is conquered, heroes stationed in that city switch to the conquering faction.
- Added `recruitCityHeroesToFaction(cityId, factionId)`.
- `recruitCityHeroesToFaction()` now delegates to `convertCityHeroesToFaction(cityId, factionId)`.
- Enemy city heroes automatically become player-side after player conquest.
- No loyalty, persuasion, chance, escape, execution, or recruitment UI yet.

## v0.4-0b Enemy Move-Then-Act AI Fix
- Fixed enemy move actions incorrectly consuming the unit action.
- Enemy movement now sets `hasMoved=true` while preserving `hasActed=false`.
- Enemy AI can now move and then attack/use skill/use strategy in the same enemy turn.
- Added post-move AI action branch: high-value skill, attack, fallback skill, strategy, wait.
- Prevented repeated movement after `hasMoved=true`.
- Added safety fallback for failed move actions.
- No movement range, pathfinding, damage, skills, balance, terrain, deployment, presentation, hit knockback, cut-ins, assets, or render config changes.
- `node --check` passed for `js/core/battle_ai.js` and `js/core/battle_rules.js`.
- Manual browser QA passed.

## v0.4-0a Hero Deployment Center Modal Layout
- Moved hero deployment UI out of the right HUD stack into a centered modal overlay.
- Added modal/backdrop layout for hero deployment.
- Right HUD no longer gets pushed down by deployment content.
- Preserved `selectedHeroIds`/`startBattle` flow.
- No battle logic, AI, balance, skills, terrain rules, hit knockback, cut-ins, result overlays, assets, troop allocation, recruitment, relocation, or render config changes.
- `node --check js/ui/world_map_ui.js` passed.
- Manual browser QA passed.

## v0.4-0 Hero Deployment Flow MVP
- Added hero deployment screen before invasion battles.
- World-map attack now opens deployment instead of entering battle immediately.
- Player attacker candidates are derived from Hanseong roster.
- Player can select `이순신`, `정도전`, or both.
- `selectedHeroIds` are passed into battle initialization.
- Attack battle player units now use selected attacker heroes.
- Defender roster behavior remains unchanged.
- Existing battle presentation, hit knockback, cut-ins, result flow, and city ownership transfer remain intact.
- No troop allocation, recruitment, relocation, terrain rules, AI, damage, assets, render config, or balance changes.
- `node --check` passed for modified JS files.
- Manual browser QA passed.

## v0.3-7f Hit Knockback Reaction
- Added subtle render-only hit knockback for damage effects.
- Added/used unit render group lookup for presentation-only target reactions.
- Knockback direction is based on attacker-to-target grid direction.
- Damaged targets briefly move backward and return to original rendered position.
- `unit.x` / `unit.y` and all battle logic remain unchanged.
- Knockback does not apply to buff-only effects.
- Duplicate replay prevention remains intact.
- No AI, damage, movement, skill data, cut-ins, result overlays, assets, SFX, camera shake, projectile effects, Phaser render config, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-7e Presentation Effects Mini Pass
- Polished floating effect readability.
- Improved small battle presentation feedback using existing `effectLayer` and action presentation helper flow.
- Preserved immediate rendering behavior and duplicate-prevention.
- No real animation queue, SFX, camera shake, projectile effects, delayed HP update, battle logic, AI, skill data, cut-in data, result overlay, asset, Phaser render config, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-7d Action Presentation Queue Review
- Added presentation-facing action helper methods in `js/phaser/battle_scene.js`.
- Added `getLastActionPresentation()`, `getActionPresentationSignature()`, `hasNewActionPresentation()`, `markActionPresentationRendered()`, `getActionPresentationEffects()`, `getActionPresentationTargets()`, and `getActionPresentationKind()`.
- Refactored `renderFloatingEffects()` to use action presentation helpers.
- Preserved immediate floating effect rendering behavior.
- Preserved duplicate floating text prevention.
- Confirmed unique skill cut-ins are triggered outside `battle_scene.js` through main/UI flow.
- No real animation queue, SFX, projectile effects, async sequencing, timing changes, battle logic, AI, skill data, cut-in data, result overlay, asset, Phaser render config, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-7c Terrain Data Scaffold
- Added `data/battle_terrain.js`.
- Added `terrainTypes` and terrain helper functions.
- Attached default `terrainMap` to initial battle state in `js/core/battle_state.js`.
- All current MVP battle tiles default to plain.
- Terrain data is currently inactive and has no gameplay or visual effect.
- No movement, pathing, defense, attack, AI, skill, cut-in, asset, Phaser render config, or balance changes.
- `node --check` passed for `data/battle_terrain.js` and `js/core/battle_state.js`.
- Manual browser QA passed.

## v0.3-7a Battle Coordinate Adapter Prep
- Added/updated battle coordinate adapter methods in `js/phaser/battle_scene.js`.
- Centralized grid-to-screen conversion.
- Replaced direct coordinate math in battle backdrop, highlights, facing highlights, grid lines, and unit depth ordering.
- Prepared battle rendering for future larger battlefields and 2.5D/isometric projection.
- No battle logic, AI, skill data, cut-in data, assets, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-5a Pyongyang Hero Data & Skills
- Added Pyongyang defenders `광개토대왕` and `도림`.
- Added and connected Pyongyang battle roster.
- Added and implemented `영락대업` and `흑백이간`.
- Confirmed Pyongyang battle starts.
- Confirmed Hanseong, Luoyang, and Kyoto battles still initialize.

## v0.3-5b Pyongyang Visual Assets Wiring
- Connected `gwanggaeto` and `dorim` roster portraits.
- Connected `gwanggaeto` and `dorim` battlefield portraits.
- Connected Pyongyang skill cut-ins:
  - `assets/skill_cutins/gwanggaeto_yeongnak_grand_legacy.png`
  - `assets/skill_cutins/dorim_black_white_scheming.png`
- Confirmed asset paths and data wiring.

## v0.3-5c Auto Battle Support AI Engagement Fix
- Fixed support/strategy units stalling at range.
- Added movement/engagement fallback when no useful skill is available.
- Prevented units from waiting while attack or movement is possible.

## v0.3-5d Auto Battle Unique Skill Priority Rebalance
- Fixed overcorrection where units preferred basic attacks too strongly.
- Current priority:
  1. High-value unique skill
  2. Normal attack
  3. Move toward enemy
  4. Low-value fallback skill
  5. Strategy
  6. Wait
- `ally_attack_buff` is high-value if at least one living ally lacks active attack buff.
- `enemy_collision_confuse` is high-value if primary target has nearby secondary enemy.
- Confirmed Dorim uses `흑백이간` when collision target exists.
- Confirmed Gwanggaeto uses `영락대업` meaningfully.

## v0.3-5e Auto Battle Regression Fix
- Fixed ally-side unique skill cut-ins not appearing.
- Ally and enemy cut-ins now use the same activation pipeline.
- Fixed Yi Sun-sin auto battle no-op wait issue by ensuring `cannon_aoe` has a valid target.
- Added normal attack re-check guards before wait.

## v0.3-6a Status Effect Icon Overlay MVP
- Added battlefield status icons in `js/phaser/battle_scene.js`.
- Active icons:
  - 혼란 `🌀`
  - 동요 `⚠`
  - 공격력 상승 `▲`
- Overlay reads existing unit state only.

## v0.3-6b Status Icon Visual Polish + Future Icon Convention
- Polished status icon overlay with smaller font, lighter rounded background, and emoji-capable font.
- Documented future icon convention:
  - 공격력 상승 `▲`
  - 공격력 감소 `▼`
  - 방어 / 방어력 상승 `◆`
  - 방어력 감소 `◇`
  - 혼란 `🌀`
  - 동요 `⚠`
  - 기절 `✖`
  - 화상 `🔥`
  - 중독 `☠`
  - 도발 `!`
  - 속박 `⛓`
- Added rule not to revert confusion icon to `혼` automatically.

## v0.3-6c Defense Status Icon
- Added `◆` icon when `unit.isDefending === true`.
- Defense logic and balance were not changed.

## v0.3-6d Status Icon Legend Bar
- Added one-line bottom-center status legend:
  - `상태: 🌀 혼란 · ⚠ 동요 · ◆ 방어 · ▲ 공↑ · ▼ 공↓ · ✖ 기절 · 🔥 화상 · ☠ 중독 · ! 도발 · ⛓ 속박`
- Legend is explanatory only.
- No new status logic was implemented.

## v0.3-6e Victory / Defeat Result Text Overlay
- Added removable DOM text overlay over existing victory/defeat result images.
- Victory text: `승리`.
- Defeat text: `패배`.
- Result images were not modified.

## v0.3-6f Result Text Size Up + Unique Skill Name Overlay
- Increased victory/defeat result text size.
- Added unique skill name overlay during cut-ins.
- Skill name is sourced from `skill.name`.
- Player-side, enemy-side, and player auto-battle cut-ins all receive skill names.

## v0.3-6g Result Text Size Polish + Skill Cut-in Typography/Subtitles
- Increased result title size again.
- Changed skill title typography to Gothic/sans-serif.
- Added initial short `cutinSubtitle` values to all 8 unique skills.

## v0.3-6h Skill Cut-in Quote / Effect Text Data Wiring
- Added explicit `cutinQuote` and `cutinEffectText` fields to all 8 unique skills.
- Renderer now displays:
  - `skill.name`
  - `skill.cutinQuote`
  - `skill.cutinEffectText`
- `description` remains unchanged and is not used as automatic cut-in fallback.

## v0.3-6i Skill Cut-in Quote Layout + Duration Polish
- Moved quote line to visual center, slightly below center.
- Kept skill title/effect text grouped at lower center.
- Quote uses `궁서` / brush-style font.
- Skill title and effect text use Gothic/sans-serif.
- Increased all unique skill cut-in durations from `1400ms` to `2200ms`.
- Added central unique skill fallback duration of `2200ms`.

## v0.5-5b - Attack/Defense Empty Battlefield Common Battle Unit Render Fix
- Fixed a common Phaser render regression where attack/defense battles entered an empty battlefield after v0.5-5a.
- Root cause: `renderUnits()` used `displayTroops` without defining it after the allocatedTroops display refactor.
- Restored unit rendering by deriving `displayTroops = getDisplayTroops(unit)` inside each unit render loop.
- Confirmed attack/defense battle units are generated with allocatedTroops while hp/maxHp remain legacy battle-balance values.


## v0.5-6 - Faction Identity Scaffold
- Added explicit faction ids for 낙양/평양/교토 instead of treating every opponent city as one generic `enemy`.
- Updated initial city ownership and enemy hero side values to native faction ids.
- Kept battle side compatibility by mapping all non-player factions to battle-side `enemy` during battle unit creation.
- Updated enemy attack allocation to use the source city owner faction.
- Updated occupation paths so enemy conquests preserve the actual conquering faction id.
- Added scaffold chancellor/governor metadata for enemy factions/cities without implementing full enemy domestic AI.
- Updated save/load version and legacy normalization for old generic `enemy` saves.
