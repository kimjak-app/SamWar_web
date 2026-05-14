# Session Log

## 2026-05-14

### v0.5-8c Trade Goods & Control MVP
- Added trade goods/control scaffolding for external trade.
- Added city `tradeSettings` defaults and normalization for auto/direct mode, intensity, export weights, import priorities, and route-limit scaffold.
- Kept MVP goods to gold, rice, barley, seafood, salt, and silk.
- Deferred wood, iron, and horses from active trade handling.
- Added governance efficiency fallback:
  - chancellor auto trade: 100%
  - governor-only limited trade: 60%
  - temporary officials: 30%
- Added small chancellor/gubernatorial policy effects to route value and route selection.
- Added player-owned city `무역 조정` modal.
- Wired modal open/apply/auto/close through `resource_ui.js`, `world_map_ui.js`, `main.js`, and `app_state.js`.
- Direct trade settings immediately refresh `world.lastInterFactionTradeResult`.
- Advanced save/load to `v0.5-8c`.
- Confirmed smoke tests for default settings, governance efficiency, direct high value increase, suspended trade value 0, and save persistence.

### v0.5-8b Trade Relation / Agreement Scaffold
- Added `trade_paused` as a manual/player-driven relation state.
- Added relation labels/descriptions and faction relation summary helpers.
- Added player-related relation actions:
  - promote neutral to trade
  - pause neutral/trade to trade_paused
  - resume trade_paused to neutral
- Kept trade_suspended cooldown and war states locked from manual resume.
- Wired relation action buttons from Selected City UI through `world_map_ui.js`, `main.js`, and `app_state.js`.
- Relation action changes refresh `world.lastInterFactionTradeResult` immediately.
- Added compact World HUD relation summary.
- Advanced save/load to `v0.5-8b`.
- Confirmed smoke tests for pause/resume/promote, route blocking/reactivation, trade modifier, cooldown lock/recovery, and save persistence.

### v0.5-8 Inter-Faction Trade MVP
- Added `js/core/inter_faction_trade.js` for external trade between adjacent cities owned by different factions.
- Added `state.factionRelations` relation scaffold with neutral/trade/trade_suspended/war states.
- Added bilateral battle trade suspension: battle start sets both factions to `trade_suspended` with `tradeCooldownTurns: 10`.
- Added cooldown decrement and neutral restore on player turn end.
- Added external trade route value calculation from commerce, specialties, security, loyalty, and relation modifier.
- Applied player-involved external trade income to actual player resources.
- Kept non-player trade income ledger-only in `world.lastInterFactionTradeResult.factionTotals`.
- Added `world.lastInterFactionTradeResult` and `lastIncomeResult.interFactionTrade` breakdown.
- Added Selected City and World HUD external trade summaries.
- Advanced save/load to `v0.5-8` and normalized legacy saves without faction relations.
- Confirmed smoke tests for neutral route creation, suspended route blocking, cooldown decrement/recovery, battle start suspension, player resource gain, non-player ledger-only behavior, and save snapshot fields.

### v0.5-7c Internal Troop Rebalance MVP
- Added actual same-faction internal troop rebalance on top of v0.5-7 supply-network judgment.
- Rear surplus cities can send troops to border/frontline shortage cities.
- Transfers preserve target garrison rules:
  - sender cannot fall below target garrison
  - receiver cannot exceed target garrison
  - receiver cannot exceed population max troop cap
- Added one-turn movement cap and 100-troop floor rounding.
- Added small chancellor policy movement modifiers and summary reasons.
- Stored results in `world.lastTroopRebalanceResult`.
- Connected turn-end order: income, upkeep, tax/city loyalty, wounded recovery, internal trade/supply, internal troop rebalance, enemy invasion roll.
- Added Selected City and World HUD summaries for internal troop movement.
- Added minimal recruitment blocking when target garrison is already satisfied.
- Advanced save/load to `v0.5-7c` while preserving legacy load keys.
- Confirmed smoke tests for transfer, total garrison preservation, sender/receiver target protection, target-satisfied no-transfer, and pending skip.
- Deferred external/inter-faction trade to `v0.5-8 Inter-Faction Trade MVP`.

### v0.5-7 Internal Trade & Supply Route MVP
- Implemented `js/core/trade_supply.js` as the internal same-faction trade/supply engine.
- Added faction-city collection, route generation, role classification, target garrison calculation, garrison shortage/surplus judgment, priority scoring, allocation summaries, city summaries, and faction summaries.
- Same-faction routes are internal logistics only. No diplomacy trade, enemy trade, treaty, negotiation, espionage, merchant unit, naval route combat, or external trade was added.
- Added role labels: 후방, 국경, 최전선.
- Added strategic 금전/식량/소금 priority allocation based on front-line role, garrison shortage/burden, resource pressure, city loyalty, commerce, and small chancellor/governor policy effects.
- Connected player turn end to calculate/store `world.lastSupplyNetworkResult` after wounded recovery and before enemy invasion roll.
- Applied only the internal route 금전 bonus to national resources. 식량/소금 are displayed as allocation/efficiency only; no city stockpile system was added.
- Replaced Selected City trade placeholder with internal trade/supply and military support judgment.
- Added World HUD internal supply network summary.
- Advanced save/load to `v0.5-7` and preserved legacy load keys through `v0.5-1h`, including `v0.5-6` and `v0.5-5b`.
- Confirmed module checks and smoke tests for route counts, city role classification, garrison shortage/surplus, and supply priority.
- Deferred actual troop movement to `v0.5-7b Internal Troop Rebalance MVP`.

## 2026-05-13

### v0.5-6 Final Session Close
- User confirmed the downloaded v0.5-6 faction identity build works.
- Deferred faction-specific button/flag colors until the later World Map visual update; current blue/red battle-side UI is acceptable for now.
- Prepared agent documents for next chat and set next major target to `v0.5-7 Trade Route MVP`.
- Trade route MVP should start with internal same-faction city trade and should not include diplomacy, espionage, external treaties, full enemy domestic AI, or world-map route animations yet.


### v0.5-5a Troop Allocation Stabilization Patch
- Changed recruitment batch size from 50 to 500.
- Kept cost scaling so 500 recruits cost 금전 300 / 보리 200 / 쌀 150.
- Removed `hero.troops` from default deployment allocation.
- Default deployment allocation now distributes source city garrison by selected heroes and command limits.
- Direct defense now opens a defense deployment/allocation modal.
- Auto defense uses defender city garrison based automatic allocation.
- Enemy units now receive source city garrison based allocations.
- Battle troop display now uses allocated troop ratio instead of `unit.troops/maxTroops`.
- Military UI no longer shows stationed hero troop total.
- Military UI no longer shows the obsolete city-garrison-not-in-battle note.
- Wounded UI now shows total wounded only.
- Save version advanced to `v0.5-5a`.

### v0.5-5 Troop Allocation + Casualty + Wounded Recovery MVP
- Added command ranks and command limits.
- Added hero `commandRank` values.
- Added deployment troop allocation sliders.
- Battle start now deducts allocated troops from the source city garrison.
- Battle state stores `troopAllocation`.
- Battle units carry `allocatedTroops` separately from existing HP balance.
- Added troop outcome calculation:
  - survivor calculation from `hp / maxHp`
  - victory wounded = 30% of losses
  - defeat wounded = 50% of allocated troops
- Added wounded queue storage on city military data.
- Added 3-turn wounded recovery on player turn end.
- Updated save/load version to `v0.5-5`.
- Confirmed module smoke tests for allocation deduction, survivor calculation, victory wounds/deaths, defeat wounds/deaths, and wounded recovery.

### v0.5-4c Population-Based Recruitment Ratio Refactor
- Added city population values for recruitment ratio/cap display and calculation.
- Kept `populationRating` unchanged for tax/economy formulas.
- Added population-ratio fields to city military defaults and presets:
  - `securityRequiredTroops`
  - `optimalTroopRatio`
  - `maxTroopRatio`
- Changed recruitment cap from raw `recruitableTroops` to population cap:
  - `remainingRecruitCapacity = floor(population * maxTroopRatio) - garrisonTroops`
- Kept `recruitableTroops` as legacy/save compatibility data.
- Added recruitment ratio bar UI and tier classes.
- Removed raw recruitable troops from the core military UI.
- Confirmed mobilizable population is not shown.
- Changed security thresholds to use each city's `securityRequiredTroops`.
- Added next-turn city-loyalty drift pressure for high recruitment ratios:
  - `군사 부담`
  - `군사 과밀`
- Kept recruitment from directly changing city loyalty.
- Advanced save version to `v0.5-4c`.
- Deferred sortie troop allocation, casualty handling, and wounded recovery to v0.5-5.
- Documented next v0.5-5 scope:
  - role-based command limits: 태수 10,000 / 장군 8,000 / 부장 6,000 / 군관 5,000
  - per-hero troop assignment with bars/sliders
  - battle units generated from allocated troops
  - surviving troop return after battle
  - victory loss wounded 30%
  - defeat sortie wounded 50%
  - wounded return after roughly 3 turns/months

### v0.5-4b Recruitment MVP
- Added recruitment as city-garrison growth.
- Recruitment modifies only city military scaffold data:
  - `garrisonTroops` increases
  - `recruitableTroops` decreases
- Recruitment spends resources:
  - 금전
  - 보리
  - 쌀
- Added fixed `병사 50 모집` MVP button in v0.5-4b; this was superseded by v0.5-5a `병사 500 모집`.
- Added `recruitCityTroops(appState, cityId, amount)` validation:
  - world mode only
  - player turn only
  - player-owned city only
  - no pending battle/deployment/transfer/enemy result
  - enough resources required
- Added recruitment result persistence through `world.lastRecruitmentAction`.
- Advanced save version to `v0.5-4b`.
- Kept recruitment out of hero troops, battle units, battle logic, Phaser Scene, and defense formulas.
- Kept recruitment from directly changing city loyalty.

### v0.5-4 Military Model Scaffold
- Added city military scaffold fields:
  - `garrisonTroops`
  - `defenseRating`
- Added four-city MVP military presets:
  - Hanseong: 300 garrison / 120 recruitable / defense 3
  - Luoyang: 420 garrison / 180 recruitable / defense 4
  - Pyongyang: 280 garrison / 140 recruitable / defense 3
  - Kyoto: 240 garrison / 130 recruitable / defense 3
- Updated `initializeCityDomesticData()` so existing saves/city data get missing military fields normalized.
- Changed security calculation to use city garrison as the main source:
  - `securityTroops = garrisonTroops + stationedHeroTroops * 0.3`
- Kept stationed hero troops as a supporting security input only.
- Kept city loyalty drift connected to the shared security result.
- Updated military UI to separate city garrison, stationed hero troops, recruitable troops, food, security, and defense preview.
- Extended soldier upkeep preview with hero troop and city garrison breakdown.
- Kept soldier upkeep preview-only; no soldier upkeep deduction was added.
- Advanced save version to `v0.5-4` while keeping `v0.5-3c`, `v0.5-3b`, and `v0.5-1h` loadable.
- Confirmed no recruitment button, real recruitment, troop type, actual soldier increase/decrease, garrison battle participation, battle troop persistence, battle logic edit, Phaser Scene edit, rebellion, diplomacy, intelligence, real trade, direct rule, or window compatibility reintroduction was added.

## 2026-05-12

### v0.5-3c City Loyalty + Security/Economy Drift
- Added city loyalty drift to `js/core/domestic_effects.js` and connected it through `applyTaxLoyaltyEffect()`.
- City loyalty drift combines tax pressure, security, economy, and governor/chancellor control effects.
- Security scaffold derives from stationed hero `troops` totals and does not change actual soldiers.
- Economy scaffold derives from city commerce/population ratings, current gold income, and city domestic effect multipliers.
- Final city loyalty delta is clamped to `-2..+2`; city loyalty remains clamped to `0..100`.
- Added `world.lastCityLoyaltyResult` for turn-result UI and save/load compatibility.
- Selected City now displays a compact city status summary under the loyalty gauge.
- Military security status now reflects the same security scaffold.
- Save version advanced to `v0.5-3c`; `v0.5-3b` remains legacy-loadable.
- Confirmed module-level smoke test:
  - high-tax Hanseong produced `세금 부담`, `치안 안정`, `경제 활황`
  - final city loyalty delta stayed within range
  - actual hero troop counts were unchanged
- Confirmed no recruitment, troop types, actual soldier increase/decrease, city garrison system, rebellion, diplomacy, intelligence, real trade, direct rule, Phaser Scene edit, battle logic edit, or window compatibility reintroduction was added.
- `node --check` passed for:
  - `js/core/domestic_effects.js`
  - `js/core/domestic_income.js`
  - `js/core/app_state.js`
  - `js/core/world_rules.js`
  - `js/ui/selected_city_ui.js`
  - `js/ui/military_ui.js`
  - `js/ui/world_hud_ui.js`
  - `js/main.js`
  - `js/core/save_load.js`

### v0.5-3b Save / Load UI MVP
- Added World Turn HUD Save / Load / Reset controls.
- Added localStorage one-slot save version `v0.5-3b`.
- Reworked save snapshots to store world-only state.
- Excluded battle, pending battle choice, pending hero deployment, pending hero transfer, and pending enemy result from saves.
- Load normalizes city, hero, ruler, resources, domestic policy, governor, and military scaffold data.
- Load returns to safe world mode.
- Reset clears local saves and creates a fresh initial game.
- Added compact save feedback messages in HUD.
- Fixed reset path so canonical hero runtime state returns to initial data before roster initialization.
- Confirmed module-level save/load smoke test restores turn, tax, chancellor, governor, governor policy, resources, and safe world state.
- Confirmed no server save, account save, multi-slot save, auto-save, battle save/load, battle logic edit, Phaser Scene edit, domestic formula edit, or window compatibility reintroduction was added.
- `node --check` passed for:
  - `js/core/save_load.js`
  - `js/core/app_state.js`
  - `js/main.js`
  - `js/ui/world_hud_ui.js`
  - `js/ui/world_map_ui.js`
  - `js/core/world_rules.js`
  - `js/ui/ui_render.js`
  - `js/constants.js`

### v0.5-3a Domestic Effect Engine MVP
- Closed as `v0.5-3a Stable` after browser manual QA passed.
- Added `js/core/domestic_effects.js` as the central domestic effect engine.
- Connected chancellor aptitude effects to national domestic results.
- Connected governor aptitude effects to city domestic results.
- Connected governor policy effects to city income and military preview.
- Existing chancellor policy effects remain active and now combine with chancellor aptitude effects.
- Applied effects to:
  - turn income
  - hero upkeep
  - soldier upkeep preview
  - salt preservation
  - tax loyalty-loss mitigation
  - military scaffold preview
- Added chancellor and governor effect summaries to UI.
- Added save/load city normalization for governor/military policy defaults.
- Confirmed via module-level checks that effects change income, loyalty deltas, upkeep, and military preview without changing battle state or actual soldier counts.
- Confirmed no recruitment, troop type additions, actual soldier increase/decrease, rebellion, diplomacy, intelligence, real trade, direct rule, Phaser Scene edit, battle logic edit, or window compatibility reintroduction was added.
- `node --check` passed for:
  - `js/core/domestic_effects.js`
  - `js/core/domestic_income.js`
  - `js/core/app_state.js`
  - `js/core/world_rules.js`
  - `js/constants.js`
  - `js/ui/world_hud_ui.js`
  - `js/ui/selected_city_ui.js`
  - `js/ui/governor_ui.js`
  - `js/ui/military_ui.js`
  - `js/main.js`
  - `js/core/save_load.js`
  - `js/ui/world_map_ui.js`
  - `js/ui/ui_render.js`
- Browser manual QA confirmed:
  - 재상/태수 효과 요약 정상
  - 재상/태수 정책 변경 후 다음 턴 수입 변화 정상
  - 세금 충성도 하락 완화 정상
  - 영웅 유지비/소금 보존 변화 정상
  - 군대 상태 preview 변화 정상
  - 실제 병사 수 불변 정상
  - save/load 호환성 정상
  - 세금/재상/태수/무장 이동/전투/침공 모달 회귀 이상 없음
  - 콘솔 에러 없음

### v0.5-2d Enemy Invasion Defense Choice Center Modal
- Moved enemy invasion defense choice UI to a centered modal.
- Defense choice no longer renders under the right Selected City HUD.
- Preserved existing direct defense / auto defense button data attributes and handlers.
- Attack choice flow remains in the existing right-side location.
- Confirmed no enemy invasion chance, AI, defense result handling, Phaser Scene, battle logic, or window compatibility change was added.
- `node --check` passed for:
  - `js/ui/ui_render.js`
  - `js/ui/world_map_ui.js`

### v0.5-2c Governor UI Polish + Turn Action UX Unification + Governor Policy Scaffold
- Closed as `v0.5-2c Stable` after browser manual QA passed.
- Unified World Turn action UX:
  - `아군 턴 종료`
  - `적군 턴 종료`
- Removed enemy turn result description text.
- Reworked governor UI so assigned governors display a chancellor-style card with portrait, name, primary type, and secondary type.
- Removed assigned-state `관리: 태수 관리`.
- Changed unassigned governor management text to `재상 통제 관리`.
- Removed Selected City bottom combat guidance text for attack-impossible states.
- Added governor policy scaffold:
  - `GOVERNOR_POLICY_KEYS`
  - `GOVERNOR_POLICY_LABELS`
  - `city.governorPolicy`
  - `setCityGovernorPolicy(appState, cityId, governorPolicy)`
- Connected governor policy select through `world_map_ui.js` and `main.js`.
- Confirmed governor policy is stored only and is not connected to income/security/city-loyalty/resource/troop/upkeep effects.
- Confirmed no chancellor/gov person-stat calculations, governor policy effects, recruitment, troop types, real soldier upkeep, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, talent recruitment, Phaser Scene edit, battle logic edit, or window compatibility reintroduction was added.
- `node --check` passed for:
  - `js/ui/governor_ui.js`
  - `js/ui/world_hud_ui.js`
  - `js/ui/selected_city_ui.js`
  - `js/ui/world_map_ui.js`
  - `js/ui/ui_render.js`
  - `js/core/app_state.js`
  - `js/main.js`
  - `js/core/world_rules.js`
  - `js/constants.js`
  - `js/ui/loyalty_ui.js`
- Browser manual QA confirmed:
  - 아군/적군 턴 종료 버튼 통일 정상
  - 적군 턴 결과 설명문 제거 정상
  - 태수 카드 초상화/주/보조 유형 표시 정상
  - 태수 미임명 관리 문구 정상
  - 태수 정책 저장-only 정상
  - Selected City 하단 안내문 제거 정상
  - 세금/재상/창고/도시 선택/무장 이동/공격-출전-전투 진입 회귀 이상 없음
  - 콘솔 에러 없음

### v0.5-2b Governor Appointment MVP + Loyalty Gauge UI + Enemy Turn Result HUD Unification
- Added governor appointment MVP on top of v0.5-2.
- Player-owned selected cities show a governor select.
- Governor candidates are limited to stationed player-side heroes in that city.
- Added state validation through `setCityGovernorHeroId(appState, cityId, governorHeroId)`.
- Governor assignment updates only `city.governorHeroId`.
- Added `renderLoyaltyGauge()` and applied it to national loyalty and city loyalty.
- Moved enemy no-invasion turn result into the World Turn HUD.
- Removed the right-side Selected City stack enemy result card.
- Confirmed the enemy turn result confirm button keeps `data-enemy-turn-result="confirm"`.
- Confirmed no governor effects, governor policy, stat formulas, income/security/loyalty automation, recruitment, troop types, soldier upkeep deduction, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, talent recruitment, Phaser Scene edit, battle edit, or window compatibility reintroduction was added.
- `node --check` passed for:
  - `js/ui/governor_ui.js`
  - `js/ui/selected_city_ui.js`
  - `js/ui/world_hud_ui.js`
  - `js/ui/ui_render.js`
  - `js/ui/world_map_ui.js`
  - `js/core/app_state.js`
  - `js/ui/loyalty_ui.js`
  - `js/main.js`
  - `js/core/world_rules.js`

### v0.5-2 Selected City Panel Reorganization + Governor/Military Scaffold
- Started from stable baseline `v0.5-1h Chancellor Appointment MVP`.
- Removed the Selected City call to `renderDomesticPanel()` so the old 5-stat domestic block no longer appears there.
- Preserved `js/ui/domestic_ui.js` for later reuse.
- Added `js/ui/governor_ui.js` as display-only governor/management scaffold.
- Added `js/ui/military_ui.js` as display-only city military scaffold.
- Added `appState.ruler.currentCityId`, initialized to `hanseong`.
- Added city initialization defaults:
  - `governorHeroId: null`
  - `military.recruitableTroops: 0`
  - `military.foodStatus: "준비 중"`
  - `military.securityStatus: "병력 기반 계산 예정"`
- Reorganized resource display into food, strategic, specialty, commerce, and trade-placeholder sections.
- Kept city type, city loyalty, stationed heroes, hero transfer, attack/deployment, turn, tax, and chancellor flows structurally unchanged.
- Confirmed no governor appointment, governor policy, recruitment, troop type, soldier upkeep deduction, security-loyalty automation, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, talent recruitment, Phaser Scene edit, or window compatibility reintroduction was added.
- `node --check` passed for:
  - `js/ui/selected_city_ui.js`
  - `js/ui/resource_ui.js`
  - `js/core/world_rules.js`
  - `js/ui/military_ui.js`
  - `js/ui/governor_ui.js`

## 2026-05-07

### v0.3-5a Pyongyang Hero Data & Skills
- Added Pyongyang defenders `광개토대왕` and `도림`.
- Added and connected Pyongyang roster.
- Added and implemented `영락대업` and `흑백이간`.
- Confirmed Pyongyang battle starts.
- Existing Hanseong, Luoyang, and Kyoto battles still initialize.

### v0.3-5b Pyongyang Visual Assets Wiring
- Connected hero portraits and battlefield portraits for `gwanggaeto` and `dorim`.
- Connected skill cut-ins:
  - `assets/skill_cutins/gwanggaeto_yeongnak_grand_legacy.png`
  - `assets/skill_cutins/dorim_black_white_scheming.png`
- Confirmed asset paths and data wiring.

### v0.3-5c / v0.3-5d Auto Battle AI Skill Priority Fixes
- Fixed support/strategy units stalling at range.
- Fixed overcorrection where units only used basic attacks.
- Current auto-battle priority:
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
- Existing Luoyang/Kyoto unique skill usage still works.

### v0.3-5e Auto Battle Regression Fix
- Fixed ally-side unique skill cut-ins not appearing.
- Fixed Yi Sun-sin waiting/no-op issue caused by `cannon_aoe` returning `targetUnitId: null`.
- Yi Sun-sin now provides a valid target for `학익진 포격`.
- Added normal attack re-check guards before wait.
- Confirmed player and enemy cut-ins use the same activation path.

### v0.3-6a / v0.3-6b Status Effect Icon Overlay
- Added battlefield unit status icons in `js/phaser/battle_scene.js`.
- Active icons:
  - 혼란 `🌀`
  - 동요 `⚠`
  - 공격력 상승 `▲`
- Polished visual style:
  - lighter background
  - smaller font
  - rounded/subtle overlay
  - emoji-capable font
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

### v0.3-6c Defense Status Icon
- Added `◆` icon when `unit.isDefending === true`.
- Preserved existing defense behavior:
  - `isDefending` reduces incoming basic attack damage.
  - `isDefending` clears on next side turn start.
- No defense logic or balance changed.

### v0.3-6d Status Legend Bar
- Added one-line centered status legend at the bottom of the battle screen.
- Legend text:
  - `상태: 🌀 혼란 · ⚠ 동요 · ◆ 방어 · ▲ 공↑ · ▼ 공↓ · ✖ 기절 · 🔥 화상 · ☠ 중독 · ! 도발 · ⛓ 속박`
- Legend is explanatory only.
- No new statuses were implemented.

### v0.3-6e / v0.3-6f / v0.3-6g / v0.3-6h / v0.3-6i Battle Presentation Polish
- Added victory/defeat result text overlays.
- Increased victory/defeat result text size.
- Added unique skill cut-in text overlay:
  - `skill.name`
  - `skill.cutinQuote`
  - `skill.cutinEffectText`
- Added `cutinQuote` and `cutinEffectText` to all 8 unique skills.
- Skill title uses Gothic/sans-serif.
- Quote uses `궁서` / brush-style.
- Effect text uses smaller Gothic/sans-serif.
- Quote layout changed:
  - quote appears at image center, very slightly below center
  - skill name/effect text remain lower center
- Increased unique skill cut-in duration to `2200ms`.
- Images are not modified; text is overlay only.

### v0.3-7a Battle Coordinate Adapter Prep
- Added `getGridWidth`/`getGridHeight`/`configureBattleView`/`gridToScreen`/`getTileCenter`/`getTileRect`/`getGridLineX`/`getGridLineY`/`getBoardCenter`/`getDepthForGridPosition`.
- Kept `getUnitPoint` as a wrapper around `gridToScreen`.
- Replaced repeated direct coordinate math in battle scene rendering.
- Added unit depth ordering preparation with `getDepthForGridPosition`.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed with no visible regressions.

### v0.3-7c Terrain Data Scaffold
- Added `data/battle_terrain.js`.
- Added `terrainTypes` for plain, forest, mountain, river, bridge, wall, and coast.
- Added helper functions for terrain lookup, plain terrain map creation, terrain map normalization, passability, move cost, and defense bonus access.
- Attached default plain `terrainMap` in `createInitialBattleState()`.
- Confirmed terrain has no gameplay or visual effect yet.
- Confirmed `node --check` passed for `data/battle_terrain.js` and `js/core/battle_state.js`.
- User manual browser QA passed with no visible regressions.

### v0.3-7d Action Presentation Queue Review
- Reviewed current action presentation flow.
- Confirmed `battleState.lastAction` feeds `renderFloatingEffects()`.
- Confirmed `buildActionSignature()` plus `lastRenderedActionSignature` prevents duplicate floating text on redraw.
- Confirmed `lastAction.effects` drives floating text content/style.
- Confirmed `lastAction.targetUnitIds` drives brief target flash/shake lookup.
- Confirmed unique skill cut-ins are triggered outside `battle_scene.js`, mainly through `js/main.js` and `js/ui/battle_ui.js`.
- Added action presentation helper methods.
- Refactored `renderFloatingEffects()` minimally to use helpers while preserving current immediate rendering behavior.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed with no visible regressions.

### v0.3-7e Presentation Effects Mini Pass
- Polished floating battle effect readability.
- Preserved current action presentation helper flow.
- Preserved immediate floating effect rendering and duplicate-prevention behavior.
- Confirmed no gameplay, AI, damage, skill, cut-in, asset, SFX, camera, projectile, or balance changes.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed.

### v0.3-7f Hit Knockback Reaction
- Added subtle hit knockback reaction for damage effects.
- Added/used render-only unit group lookup for target presentation feedback.
- Knockback direction follows attacker-to-target grid direction.
- Damaged unit briefly moves backward and returns to original rendered position.
- `unit.x` / `unit.y` remain unchanged.
- Buff-only effects do not trigger knockback.
- Duplicate replay prevention remains intact.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed and confirmed the effect feels good.

### v0.4-0 Hero Deployment Flow MVP
- Added hero deployment flow before invasion battles.
- World-map attack now opens deployment before battle.
- Current player candidates are `이순신` and `정도전` from Hanseong roster.
- `selectedHeroIds` are passed into battle initialization.
- Selecting one or both heroes correctly changes the player-side attacker roster.
- Defender roster behavior remains target-city based.
- User manual browser QA passed.

### v0.4-0a Hero Deployment Center Modal Layout
- Moved deployment UI from right HUD stack to centered modal overlay.
- Right HUD no longer gets pushed down.
- Start/cancel/select behavior remains intact.
- User manual browser QA passed.

### v0.4-0b Enemy Move-Then-Act AI Fix
- Fixed enemy movement incorrectly consuming the unit action.
- Root cause: `executePlannedEnemyAction()` wrapped enemy move actions with `ensureAutoActorHasActed()`.
- Enemy movement now leaves `hasActed=false` so the same unit can perform a valid follow-up action.
- `getAiTurnAction()` now supports post-move high-value skill, attack, fallback skill, strategy, then wait.
- Enemy units cannot move twice in the same turn.
- User manual browser QA passed.

## 2026-05-08

### v0.4-1 Victory Hero Recruitment MVP
- Added conquest recruitment for heroes stationed in captured cities.
- When a city is conquered, stationed heroes switch to the conquering faction.
- Added `recruitCityHeroesToFaction(cityId, factionId)`.
- `recruitCityHeroesToFaction()` now delegates to `convertCityHeroesToFaction(cityId, factionId)`.
- Enemy city heroes automatically become player-side after player conquest.
- No loyalty, persuasion, chance, escape, execution, or recruitment UI was added.

### v0.4-2 Region-Based Hero Control MVP
- Established the current design identity:
  - SamWar_web is a region-based strategy MVP.
  - The player controls regions, not a permanent ruler character.
  - Heroes are stationed in regions.
  - A city owner controls heroes stationed in that city.
- Added runtime `hero.locationCityId` support.
- Initial hero locations are initialized from `battleRosters.cityDefenderRosters`.
- Removed hardcoded Hanseong-based player deployment.
- Player attack deployment candidates now come from `hero.side === "player" && hero.locationCityId === originCityId`.
- Captured city heroes switch to the conquering faction and remain in that city.
- Confirmed intended cases:
  - Hanseong captured by enemy -> `이순신` / `정도전` become enemy-side and stay in Hanseong.
  - Pyongyang conquered by player -> `광개토대왕` / `도림` become player-side and stay in Pyongyang.

### v0.4-2a Buff Source Label + Selected Attack Origin Fix
- Ally attack buff labels now use source skill names.
- Added:
  - `buffAttackSourceSkillId`
  - `buffAttackSourceSkillName`
- `개혁령` displays as `개혁령 효과 +15% · 2턴`.
- `영락대업` displays as `영락대업 효과 +20% · 2턴`.
- Future `ally_attack_buff` skills should display their own skill name.
- Added `selection.originCityId`.
- Selecting a player-owned city stores it as preferred attack origin.
- Clicking an enemy city preserves previous selected origin.
- If selected origin is valid and adjacent, attack starts from that city.
- Fallback still finds a valid adjacent player-owned city if selected origin is invalid.

### v0.4-2b Generic Ally Buff Battle Log Fix
- Generalized `getAllyAttackBuffOpeningLog(casterUnit, skill)`.
- Removed hardcoded Jeong Do-jeon, `개혁령`, `영락대업`, and `yeongnak_grand_legacy` log text.
- Final format:
  - `${casterUnit.name}: ${skill.name} 발동. 아군 공격력 +${buffPercent}% · ${duration}턴`

### v0.4-2c Battle Spawn Direction Fix
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
  - no overlap
  - units face each other

### v0.4-3 Hero Transfer MVP
- Added player hero transfer between player-owned cities.
- Transfer is instant.
- No turn cost, troop transfer, food cost, travel time, fatigue, loyalty, persuasion, or domestic affairs integration.
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
- Added `renderHeroTransferPanel()`.
- Added selected city panel button: `무장 이동`.
- Manual QA confirmed:
  - After conquering Luoyang, `관우` / `장비` are stationed in Luoyang.
  - `관우` can be transferred from Luoyang to Hanseong.
  - Hanseong deployment then shows `이순신` / `정도전` / `관우`.
  - Luoyang deployment no longer shows `관우`.
  - 3-hero deployment and battle entry work.
  - Region-based battle spawn still works after transfer.

### v0.4-3a Selected City Stationed Heroes UI
- Selected city panel now shows stationed heroes under `주둔 무장`.
- Uses current mutable hero state through `hero.locationCityId`.
- Shows portrait thumbnails when available.
- Empty state: `주둔 무장 없음`.
- Reinforces conquest, recruitment, and hero transfer results.

### v0.4-3 Stable Baseline Closed
- Current stable baseline:
  - `v0.4-3 Stable`
  - `Region-Based Hero Control + Directional Battle Spawn + Hero Transfer MVP`
- Current core loop:
  1. Select player-owned region.
  2. Attack adjacent enemy region.
  3. Win battle.
  4. Capture city.
  5. Stationed enemy heroes switch to player side.
  6. Heroes remain stationed in conquered city.
  7. Player can transfer heroes between player-owned cities.
  8. Deployment candidates come from selected origin city's stationed heroes.
  9. Battle spawn direction follows world-map city direction.
- Next direction documented as `v0.5-0 Domestic Affairs Scaffold`.
- v0.5-0 should remain replaceable and should not lock final domestic formulas too early.

### v0.5-0a Domestic Stats & Resource Display MVP
- Added a replaceable domestic affairs scaffold.
- This is not the final domestic affairs system.
- Added `initializeCityDomesticData(cities)`.
- `initializeCityDomesticData()`:
  - returns copied city objects
  - does not mutate imported static city data in-place
  - preserves future per-city overrides
  - fills missing scaffold defaults
- `createInitialAppState()` now initializes `world.cities` through `initializeCityDomesticData(cities)`.
- Runtime city scaffold fields:
  - `domestic`
  - `resources`
  - `yields`
- Domestic fields:
  - `publicOrder`
  - `morale`
  - `agriculture`
  - `commerce`
  - `stability`
- Resource fields:
  - `rice`
  - `barley`
  - `seafood`
  - `gold`
  - `specialty`
- Yield fields:
  - `riceHarvest`
  - `barleyHarvest`
  - `seafoodPerTurn`
  - `commerceIncome`
  - `specialtyIncome`
- Added selected city display helper:
  - `renderCityDomesticPanel(selectedCity)`
- Selected city panel now displays:
  - `내정`
  - `자원`
  - `예상 수입`
- UI uses text, numbers, and simple bars only.
- No final formulas, calendar/month/year, seasonal update, chancellor, governor, compatibility, troop allocation, recruitment, troop loss persistence, terrain effects, battle AI, damage, skill, spawn, hero transfer, recruitment, or asset changes.
- `node --check` passed for changed JS files.

### v0.5-0a World Map HUD Polish
- Reorganized world map HUD layout to reduce right-panel crowding.
- Left HUD now contains:
  1. SamWar Web title panel
  2. MVP Goal panel
  3. World Turn panel
- Right HUD now starts with Selected City.
- World Turn is no longer above Selected City on the right side.
- Selected City panel order:
  1. city name
  2. region/faction
  3. description
  4. stationed heroes
  5. compact hero transfer button
  6. domestic stats
  7. resources
  8. expected income
  9. attack note/button
- Hero transfer button was moved directly under stationed heroes and made smaller.
- Right-side linked cities panel was removed to keep Selected City as the primary management panel.
- City selection remains available through map city nodes.
- `node --check js/ui/world_map_ui.js` passed.

### v0.5-0a Stable Baseline Closed
- Current stable baseline:
  - `v0.5-0a Stable`
  - `Domestic Stats & Resource Display Scaffold + World Map HUD Polish`
- Manual QA confirmed by user.
- Current identity:
  - Player = king/state will
  - Regions/cities = control units
  - Heroes = talents stationed in regions
  - Battles = performed through hero combinations
  - Domestic affairs = planned to run later through chancellor/city-lord automation
- Next direction:
  - `v0.5-0b Domestic Calendar / Turn-End Resource Update Scaffold` investigation or implementation.
  - Keep resource cycles replaceable.
  - Do not lock final domestic formulas.

### Current Unique Skill Cut-in Text
- `hakikjin_barrage` / `학익진 포격`: `사정거리 안 모든 적을 포격하라!`, `(사정범위 내 모든 적 공격)`
- `reform_order` / `개혁령`: `나의 계책! 아군의 공격력을 단숨에 끌어올렸다!`, `(아군 공격력 상승)`
- `matchlock_volley` / `삼단격`: `화승총 사격의 매운 맛을 보여주마!`, `(사정범위 내 적 공격)`
- `cavalry_charge` / `차륜전`: `돌격! 적진을 때려부숴라!`, `(적진 돌파 공격)`
- `crescent_blade_slash` / `언월참`: `내 앞을 가로막는 자! 목을 내놓아라!`, `(강력한 단일 공격)`
- `changban_shatter` / `장판파열`: `음하하~ 내 고함 한 방에 쩔쩔들 매는군!`, `(주변 적 동요)`
- `yeongnak_grand_legacy` / `영락대업`: `전군이여! 나를 믿고 따르라!`, `(아군 공격력 상승)`
- `black_white_scheming` / `흑백이간`: `내 비책! 서로를 죽일 것이다!`, `(적 충돌 · 혼란/동요)`

### Manual Asset Cleanup Note
- Several cut-in images were manually cleaned so brushstroke edges no longer look rectangular/cropped.
- White/dirty background residue was removed from assets.
- Existing asset paths should remain unchanged.
- User may overwrite PNGs manually later.

### Next TODO
1. v0.5-0b Domestic Calendar / Turn-End Resource Update Scaffold.
2. v0.5-1 Domestic Role Scaffold later.
3. v0.5-2 Resource Cycle Pass later.
4. Troop Allocation MVP remains postponed until domestic/resource/troop-pool foundations exist.
5. Terrain Rule Design Only later.
6. SFX/audio, camera shake, projectile effects, and real animation queue later as dedicated patches.
7. 10-city / 20-hero expansion only after the 4-city / 8-hero MVP baseline stays stable.

## v0.5-5b Hotfix Session
- Investigated empty battlefield after v0.5-5a in both attack and defense flows.
- Verified battle.units are generated for attack and defense smoke tests.
- Patched `js/phaser/battle_scene.js` to define displayTroops per rendered unit.
- Ran node --check on core battle/app/UI files and smoke-tested attack/defense unit generation.


## v0.5-6 Faction Identity Scaffold Session
- User identified that enemy cities were still a single generic `enemy` side and that enemy chancellors/governors were undefined.
- Implemented faction-specific identities for 낙양/평양/교토.
- Preserved tactical battle engine expectations by keeping battle unit side as `player` or `enemy`, while storing the real faction id separately.
- Smoke-tested attack and defense unit creation after faction split.
- Confirmed conquest can convert city ownership and local heroes to the actual conquering faction.
