# QA Checklist

## v0.5-2d Defense Choice Center Modal
- [ ] Enemy invasion defense choice appears in the center of the screen.
- [ ] Defense choice does not appear under the right Selected City HUD.
- [ ] Invasion city and defense city labels remain visible.
- [ ] Direct defense button enters battle through the existing flow.
- [ ] Auto defense button enters auto battle through the existing flow.
- [ ] No-invasion enemy turn end button flow remains unchanged.
- [ ] Normal attack/deployment flow remains unchanged.
- [ ] City selection, governor, chancellor, and tax UI remain unchanged.
- [ ] No console errors.

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
