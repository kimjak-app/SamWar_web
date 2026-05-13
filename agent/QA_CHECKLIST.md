# QA Checklist

## v0.5-7 Trade Route MVP Prep
- [ ] Confirm v0.5-6 faction ids display correctly in city info.
- [ ] Confirm same-faction ownership is available for route filtering.
- [ ] Confirm player-owned multiple-city state after conquest can be detected.
- [ ] Confirm trade placeholder area exists in Selected City resource/trade panel.
- [ ] Confirm commerceRating / specialty resources / securityStatus / cityLoyalty are available to trade formula.
- [ ] Confirm no diplomacy, treaty, espionage, or enemy domestic AI is introduced in first trade MVP.
- [ ] Confirm save/load preserves faction ownership before adding trade state.

## v0.5-6 Faction Identity Final QA
- [x] v0.5-6 download confirmed working by user.
- [ ] City info shows distinct faction names for 낙양/평양/교토.
- [ ] Attack battle still renders after faction split.
- [ ] Defense battle still renders after faction split.
- [ ] Conquest changes ownerFactionId to the conquering faction.
- [ ] Save/load preserves faction ownership.
- [ ] Generic blue/red battle-side UI can remain until later faction-color world map pass.

## v0.5-5a Troop Allocation Stabilization Patch
- [ ] Military UI no longer shows stationed hero troop total.
- [ ] Military UI no longer says city garrison is not used in battle.
- [ ] Wounded UI shows wounded total only.
- [ ] Recruitment button says `병사 500 모집`.
- [ ] Recruiting 500 increases Hanseong garrison from 300 to 800.
- [ ] Recruiting 500 costs 금전 300 / 보리 200 / 쌀 150.
- [ ] Default deployment allocation does not use 110/90 hero troop values.
- [ ] Hanseong 300 garrison with Yi Sun-sin/Jeong Do-jeon defaults to garrison-based allocation.
- [ ] Hanseong 13,000 garrison caps Yi Sun-sin at 8,000 and Jeong Do-jeon at 5,000.
- [ ] Direct defense opens defense deployment modal.
- [ ] Auto defense uses defender garrison based allocation.
- [ ] Enemy battle units are not displayed as 115/120 legacy troop values.
- [ ] Battle unit troop labels use allocated troop current/max values.
- [ ] Battle HP/maxHP remains on old tactical scale.
- [ ] Source city garrison is deducted by allocated amount.
- [ ] Save/load remains compatible.
- [ ] No console errors.

## v0.5-5 Troop Allocation + Casualty + Wounded Recovery MVP
- [ ] Fresh load has no console errors.
- [ ] Hanseong selection works.
- [ ] Military UI and recruitment ratio UI still render.
- [ ] Attackable enemy city opens deployment modal.
- [ ] Deployment modal shows source garrison, allocated troops, and remaining garrison.
- [ ] Deployment modal shows hero command labels.
- [ ] 태수 command limit is 10,000.
- [ ] 장군 command limit is 8,000.
- [ ] 부장 command limit is 6,000.
- [ ] 군관 command limit is 5,000.
- [ ] Per-hero allocation sliders render.
- [ ] Total allocation cannot exceed source garrison.
- [ ] Allocation cannot exceed hero command limit.
- [ ] Zero total allocation disables battle start.
- [ ] Battle start deducts allocated troops from source city garrison.
- [ ] Battle units have allocated troop data.
- [ ] Battle unit HP/maxHP remains on old tactical scale.
- [ ] Battle entry works.
- [ ] Battle return to world works.
- [ ] Victory returns survivors to captured/defended city.
- [ ] Victory converts 30% of losses to wounded.
- [ ] Defeat converts 50% of allocated troops to wounded.
- [ ] Dead/missing troops do not return.
- [ ] No troop duplication occurs.
- [ ] Military UI shows wounded total.
- [ ] Wounded queue decreases on player turn end.
- [ ] Wounded soldiers return to garrison after 3 turns.
- [ ] Save/load preserves garrison troops.
- [ ] Save/load preserves wounded queue.
- [ ] Save/load preserves hero command ranks.
- [ ] Battle/pending state is not saved.
- [ ] Soldier recruitment still works.
- [ ] Tax slider works.
- [ ] Chancellor appointment and policy work.
- [ ] Governor appointment and policy work.
- [ ] Hero transfer works.
- [ ] Enemy invasion center modal works.
- [ ] Direct/auto battle flows still work.
- [ ] No console errors.

## v0.5-4c Population-Based Recruitment Ratio Refactor
- [ ] Fresh load has no console errors.
- [ ] Hanseong selection works.
- [ ] Military UI renders normally.
- [ ] City population displays.
- [ ] Recruitment ratio displays.
- [ ] Recruitment ratio bar displays.
- [ ] Current garrison-based ratio displays.
- [ ] Ratio tier classes exist for green/blue/yellow/red/critical.
- [ ] Mobilizable population is not displayed.
- [ ] Security line displays `치안 기준: 500 / 현재 주둔군`.
- [ ] Hanseong security required troops is 500.
- [ ] Luoyang security required troops is 1000.
- [ ] Recruitment increases `garrisonTroops`.
- [ ] Recruitment respects the 50% population cap.
- [ ] Recruitment spends resources normally.
- [ ] Raw `recruitableTroops` is no longer core military UI.
- [ ] Enemy cities do not show recruitment buttons.
- [ ] Enemy turn or pending state prevents recruitment.
- [ ] Security status changes naturally from garrison changes.
- [ ] Recruitment does not directly change city loyalty.
- [ ] High recruitment ratio can add `군사 부담` or `군사 과밀` to next-turn drift reasons.
- [ ] Final per-city loyalty delta stays within `-2..+2`.
- [ ] Save/load preserves population.
- [ ] Save/load preserves garrison troops.
- [ ] Save/load preserves security required troops.
- [ ] Save/load restores ratio bar normally.
- [ ] Reset restores city population and v0.5-4c presets.
- [ ] Tax slider works.
- [ ] Chancellor appointment and policy work.
- [ ] Governor appointment and policy work.
- [ ] City status summary works.
- [ ] Save/load/reset work.
- [ ] Hero transfer works.
- [ ] Enemy invasion center modal works.
- [ ] Player/enemy turn buttons work.
- [ ] Attack -> deployment -> battle entry works.
- [ ] Battle return to world map works.
- [ ] v0.5-5 troop allocation/casualty/wounded recovery features are not present in v0.5-4c.
- [ ] No console errors.

## v0.5-4b Recruitment MVP
- [ ] Fresh load has no console errors.
- [ ] Hanseong selection works.
- [ ] Military UI shows a soldier recruitment button under player-owned cities.
- [ ] Clicking Hanseong recruitment increases city garrison from 300 to 350.
- [ ] Clicking Hanseong recruitment decreases recruitable troops from 120 to 70.
- [ ] Recruitment spends 금전 30, 보리 20, 쌀 15 for 50 soldiers.
- [ ] Recruitment does not spend 수산물, 철, 말, or 목재.
- [ ] Recruitment does not change `hero.troops`.
- [ ] Recruitment does not change `hero.maxTroops`.
- [ ] Stationed hero troop display does not change from recruitment.
- [ ] Soldier upkeep preview increases after garrison recruitment.
- [ ] Soldier upkeep remains preview-only and is not deducted.
- [ ] Recruitment success message appears.
- [ ] If recruitable troops are below 50, the remaining amount can be recruited.
- [ ] If recruitable troops are 0, recruitment is unavailable.
- [ ] If resources are insufficient, recruitment fails or is disabled.
- [ ] Enemy cities do not show recruitment buttons.
- [ ] Enemy turn or pending interaction state prevents recruitment.
- [ ] Recruitment does not directly change city loyalty.
- [ ] Increased garrison can improve security calculation.
- [ ] Next-turn city-loyalty drift can indirectly benefit from improved security.
- [ ] Save after recruitment preserves increased `garrisonTroops`.
- [ ] Save after recruitment preserves decreased `recruitableTroops`.
- [ ] Save after recruitment preserves spent resources.
- [ ] Reset restores v0.5-4 city military presets.
- [ ] Tax slider works.
- [ ] Chancellor appointment and policy work.
- [ ] Governor appointment and policy work.
- [ ] City status summary works.
- [ ] Save/load/reset work.
- [ ] Hero transfer works.
- [ ] Enemy invasion center modal works.
- [ ] Player/enemy turn buttons work.
- [ ] Attack -> deployment -> battle entry works.
- [ ] Battle return to world map works.
- [ ] No console errors.

## v0.5-4 Military Model Scaffold
- [ ] Fresh load has no console errors.
- [ ] Hanseong selection works.
- [ ] Military UI shows 도시 주둔군.
- [ ] v0.5-4 historical check only: stationed hero troops supported security internally.
- [ ] Military UI shows 징병 가능.
- [ ] Military UI shows 군량 상태.
- [ ] Military UI shows 치안 상태.
- [ ] Military UI shows 방어력.
- [ ] Hanseong initial garrison preset is visible.
- [ ] Security is calculated primarily from city garrison.
- [ ] Stationed hero troops contribute only as support to security.
- [ ] Hero transfer changes stationed hero troop display.
- [ ] Hero transfer does not change city garrison.
- [ ] City loyalty drift uses the new security result.
- [ ] Final per-city loyalty delta stays within `-2..+2`.
- [ ] City loyalty remains clamped between `0..100`.
- [ ] Soldier upkeep preview shows hero troop plus garrison basis or stores the breakdown.
- [ ] Soldier upkeep remains preview-only and is not deducted.
- [ ] Save/load preserves `city.military.garrisonTroops`.
- [ ] Save/load preserves `city.military.defenseRating`.
- [ ] Older save data without new military fields loads safely.
- [ ] Reset/fresh state restores city military presets.
- [ ] Tax slider works.
- [ ] Chancellor appointment and policy work.
- [ ] Governor appointment and policy work.
- [ ] City status summary works.
- [ ] Save/load/reset work.
- [ ] Hero transfer works.
- [ ] Enemy invasion center modal works.
- [ ] Player/enemy turn buttons work.
- [ ] Attack -> deployment -> battle entry works.
- [ ] Battle return to world map works.
- [ ] No console errors.

## v0.5-3c City Loyalty + Security/Economy Drift
- [ ] Fresh load has no console errors.
- [ ] Hanseong selection works.
- [ ] City loyalty gauge renders normally.
- [ ] Selected City shows city status/security/economy summary.
- [ ] Hanseong stationed Yi Sun-sin/Jeong Do-jeon produce stable or caution-level security.
- [ ] Hero movement can change a city's security status.
- [ ] Actual soldier counts do not change from security/economy drift.
- [ ] Hanseong/Luoyang/Pyongyang/Kyoto economy status displays without breaking city selection.
- [ ] Higher commerce/population cities are economically favored.
- [ ] Governor commerce policy can improve economy/next-turn result.
- [ ] Tax level 30 does not create excessive city-loyalty changes.
- [ ] Higher tax creates city-loyalty pressure.
- [ ] Stable security/economy can offset or improve city-loyalty drift.
- [ ] Political/administrative governor or chancellor control improves negative city-loyalty drift.
- [ ] Final per-city loyalty delta stays within `-2..+2`.
- [ ] City loyalty remains clamped between `0..100`.
- [ ] Turn-end `world.lastCityLoyaltyResult` is reflected in Selected City UI.
- [ ] City-loyalty result reasons remain short.
- [ ] National loyalty tax flow still works.
- [ ] Save/load restores city loyalty and city status summary safely.
- [ ] Tax slider works.
- [ ] Chancellor appointment and policy work.
- [ ] Governor appointment and policy work.
- [ ] Save/load/reset work.
- [ ] Hero transfer works.
- [ ] Enemy invasion center modal works.
- [ ] Player/enemy turn buttons work.
- [ ] Attack -> deployment -> battle entry works.
- [ ] Battle return to world map works.
- [ ] No console errors.

## v0.5-3b Save / Load UI MVP
- [x] World Turn HUD shows `저장`, `불러오기`, `초기화`.
- [x] Save controls are compact and visually distinct from the turn-end button.
- [x] Fresh load has no console errors.
- [x] Saving after tax/chancellor/governor/policy/turn/resource changes shows `저장 완료`.
- [x] Loading restores turn, tax, chancellor, governor, governor policy, resources, loyalty, and hero locations.
- [x] Loading with no save shows `저장 데이터 없음` and does not break the app.
- [x] Reset clears saved data and returns to fresh game state.
- [x] Fresh reset state has Hanseong player-owned and Luoyang/Pyongyang/Kyoto enemy-owned.
- [x] Fresh reset state has Yi Sun-sin and Jeong Do-jeon stationed in Hanseong.
- [x] Save after refresh can be loaded.
- [x] Hero transfer persists through save/load.
- [x] City conquest ownership and recruited hero side/location persist through save/load.
- [x] Battle state is not saved.
- [x] Pending battle/deployment/transfer/enemy-result state is cleared after load.
- [x] Save/load controls are unavailable or disabled outside world mode.
- [x] Attack -> deployment -> battle entry still works.
- [x] Battle return to world map still works.
- [x] Enemy invasion center modal still works.
- [x] Player/enemy turn buttons still work.
- [x] Domestic effect engine still works after save/load.
- [x] No console errors.

## v0.5-3a Domestic Effect Engine MVP
- [x] Fresh load has no console errors.
- [x] Hanseong selection works.
- [x] World HUD renders normally.
- [x] Selected City HUD renders normally.
- [x] Chancellor unassigned state shows no chancellor effect.
- [x] Assigning Jeong Do-jeon shows a chancellor effect summary.
- [x] Chancellor policy changes affect next-turn income/upkeep preview.
- [x] Chancellor aptitude affects income/upkeep/salt/loyalty-loss mitigation as applicable.
- [x] Governor unassigned state shows no governor effect or chancellor-controlled management.
- [x] Assigning Yi Sun-sin as Hanseong governor shows a governor effect summary.
- [x] Assigning Jeong Do-jeon as Hanseong governor changes the governor effect summary.
- [x] Governor policy changes affect next-turn city income or military preview.
- [x] Governor effects apply only when the governor is player-side and stationed in the city.
- [x] Turn-end income still displays rice/barley/seafood/gold results.
- [x] Income changes are noticeable but not excessive.
- [x] High taxes reduce loyalty.
- [x] Political chancellor/governor effects mitigate loyalty loss.
- [x] Loyalty remains clamped between 0 and 100.
- [x] Loyalty gauges render normally.
- [x] Hero upkeep display remains normal.
- [x] Administrative chancellor effects reduce hero upkeep.
- [x] Military chancellor effects reduce soldier upkeep preview.
- [x] Soldier upkeep remains preview-only.
- [x] Salt preservation status remains normal.
- [x] Administrative effects reduce salt preservation need.
- [x] Governor military/admin effects improve recruitable preview/status.
- [x] Actual soldier counts do not change from governor or policy effects.
- [x] Save/load compatibility works.
- [x] Tax slider works.
- [x] Chancellor appointment works.
- [x] Chancellor policy works.
- [x] Governor appointment works.
- [x] Governor policy works.
- [x] City selection works.
- [x] Hero transfer works.
- [x] Enemy invasion center modal still works.
- [x] Player/enemy turn action buttons work.
- [x] Attack -> deployment -> battle entry works.
- [x] Battle return to world map works.
- [x] No console errors.

## v0.5-2d Defense Choice Center Modal
- [x] Enemy invasion defense choice appears in the center of the screen.
- [x] Defense choice does not appear under the right Selected City HUD.
- [x] Invasion city and defense city labels remain visible.
- [x] Direct defense button enters battle through the existing flow.
- [x] Auto defense button enters auto battle through the existing flow.
- [x] No-invasion enemy turn end button flow remains unchanged.
- [x] Normal attack/deployment flow remains unchanged.
- [x] City selection, governor, chancellor, and tax UI remain unchanged.
- [x] No console errors.

## v0.5-2c Turn Action UX
- [x] Player turn button says `아군 턴 종료`.
- [x] Player turn button keeps the large World Turn button style.
- [x] No-invasion enemy result does not show `적군은 이번 턴 움직이지 않았습니다.`
- [x] No separate enemy result description/card appears under Selected City.
- [x] Enemy confirmation button says `적군 턴 종료`.
- [x] Enemy confirmation button uses the same style/size/position feel as player turn end.
- [x] Clicking `적군 턴 종료` advances to the next player turn.
- [x] Defense battle-choice flow remains unchanged.

## v0.5-2c Governor Card
- [x] Hanseong governor select is visible.
- [x] Candidates are only Hanseong stationed player heroes.
- [x] Assigning `이순신` shows portrait, name, primary type, and secondary type.
- [x] Assigning `정도전` updates the card to Jeong Do-jeon.
- [x] Selecting `미임명` returns to unassigned display.
- [x] Unassigned display shows `관리: 재상 통제 관리`.
- [x] Assigned display does not show `관리: 태수 관리`.
- [x] Governor assignment does not move heroes.
- [x] Governor assignment does not change income, security, city loyalty, resources, troops, or upkeep.

## v0.5-2c Governor Policy
- [x] Player-owned city shows governor policy select.
- [x] Options are `재상 정책 수행`, `농업 중심`, `상업 중심`, `군사 중심`.
- [x] Changing governor policy keeps the selected value.
- [x] Invalid policy values normalize to `재상 정책 수행`.
- [x] Governor policy does not change income, security, city loyalty, resources, troops, or upkeep.
- [x] Enemy cities do not show governor policy select.

## Selected City Regression
- [x] Attack-impossible Selected City state does not show `전투 화면은 공격 가능한 적 도시를 선택했을 때만 진입합니다.`
- [x] Attackable enemy city still shows the attack button.
- [x] Attack -> deployment -> battle entry still works.
- [x] City loyalty gauge remains visible.
- [x] Stationed heroes remain visible.
- [x] Hero transfer remains functional.

## Wider Regression
- [x] National loyalty gauge displays normally.
- [x] Tax slider works.
- [x] Chancellor appointment works.
- [x] Chancellor policy works.
- [x] National warehouse display works.
- [x] City selection works.
- [x] No console errors.
- [x] No Phaser Scene, battle logic, or asset behavior changed.

## v0.5-5b Hotfix QA
- Attack battle: battlefield shows player and enemy units.
- Defense battle: direct defense deployment leads to battlefield with player and enemy units.
- Unit troop labels display allocatedTroops-derived values, not legacy hero.troops values.
- No console ReferenceError from `displayTroops` in Phaser render.
- Existing battle flow, casualty return, wounded recovery, save/load still work.


## v0.5-6 Faction Identity Scaffold QA
- 한성 shows player/한성 faction ownership.
- 낙양 shows 낙양 세력 ownership.
- 평양 shows 평양 세력 ownership.
- 교토 shows 교토 세력 ownership.
- Initial enemy heroes keep native faction ids: 관우/장비=낙양, 광개토/도림=평양, 노부나가/겐신=교토.
- Player can still attack adjacent non-player cities.
- Enemy invasion candidates come from non-player factions, not only generic `enemy`.
- Attack/defense battle units render with battle side `player`/`enemy` while preserving factionId metadata.
- Player conquest changes target city owner to `player` and recruits local heroes to player.
- Enemy conquest changes target city owner to the actual attacking faction id.
- Legacy saves with owner/hero side `enemy` normalize safely.
- Save/load preserves faction-specific ownerFactionId and hero.side.
- No trade, diplomacy, enemy AI domestic automation, or intelligence system was introduced.
