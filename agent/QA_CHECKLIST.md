# QA Checklist

## v0.5-3b Save / Load UI MVP
- [ ] World Turn HUD shows `저장`, `불러오기`, `초기화`.
- [ ] Save controls are compact and visually distinct from the turn-end button.
- [ ] Fresh load has no console errors.
- [ ] Saving after tax/chancellor/governor/policy/turn/resource changes shows `저장 완료`.
- [ ] Loading restores turn, tax, chancellor, governor, governor policy, resources, loyalty, and hero locations.
- [ ] Loading with no save shows `저장 데이터 없음` and does not break the app.
- [ ] Reset clears saved data and returns to fresh game state.
- [ ] Fresh reset state has Hanseong player-owned and Luoyang/Pyongyang/Kyoto enemy-owned.
- [ ] Fresh reset state has Yi Sun-sin and Jeong Do-jeon stationed in Hanseong.
- [ ] Save after refresh can be loaded.
- [ ] Hero transfer persists through save/load.
- [ ] City conquest ownership and recruited hero side/location persist through save/load.
- [ ] Battle state is not saved.
- [ ] Pending battle/deployment/transfer/enemy-result state is cleared after load.
- [ ] Save/load controls are unavailable or disabled outside world mode.
- [ ] Attack -> deployment -> battle entry still works.
- [ ] Battle return to world map still works.
- [ ] Enemy invasion center modal still works.
- [ ] Player/enemy turn buttons still work.
- [ ] Domestic effect engine still works after save/load.
- [ ] No console errors.

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
