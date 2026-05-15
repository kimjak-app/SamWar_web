# QA Checklist

## World / Map Regression QA
- [ ] 새로고침 후 콘솔 에러 없음
- [ ] 월드맵 진입 정상
- [ ] 13개 도시 표시
- [ ] 몽골 세력 표시
- [ ] 카라코룸 표시
- [ ] 해상 루트만 시각적으로 렌더됨

## Final 13-City Coordinate QA
- [ ] `pyeongyang` x 39, y 34
- [ ] `hanseong` x 45, y 52
- [ ] `gyeongju` x 56, y 65
- [ ] `sabi` x 50, y 67
- [ ] `karakorum` x 27, y 41
- [ ] `yecheng` x 19, y 50
- [ ] `luoyang` x 18, y 67
- [ ] `chengdu` x 14, y 84
- [ ] `jianye` x 26, y 88
- [ ] `kyushu` x 67, y 86
- [ ] `osaka` x 75, y 76
- [ ] `kyoto` x 81, y 64
- [ ] `edo` x 87, y 57

## Battle DOM Unit Overlay QA
- [ ] 전투 진입 정상
- [ ] 콘솔 에러 없음
- [ ] AudioContext autoplay warning only if present, no real console error
- [ ] DOM overlay가 Phaser canvas 위에 정상 표시
- [ ] DOM unit image overlay 활성화
- [ ] DOM unit token 이미지 선명함
- [ ] DOM portrait badge 이미지 선명함
- [ ] DOM overlay `pointer-events: none`
- [ ] Phaser hit zone 클릭 정상
- [ ] Phaser text와 DOM text 중복 없음

## v0.5-9 Battle DOM Unit Visual Polish QA
- [ ] token 이미지 크기 `124px x 124px`
- [ ] portrait badge 크기 `70px x 70px`
- [ ] portrait badge가 유닛에 매우 가깝게 부착됨
- [ ] status indicator 위치 유지
- [ ] facing indicator 위치 유지
- [ ] `battleDomUnitIdle` 애니메이션 활성화
- [ ] enemy left -> face right
- [ ] player right -> face left
- [ ] 고정 `방어` 텍스트가 유닛 옆에 남지 않음
- [ ] 방어 상태 아이콘 `◆` 유지

## v0.5-9b Battle Movement Tween MVP QA
- [x] `node --check js/phaser/battle_scene.js`
- [x] `node --check js/ui/battle_ui.js`
- [x] `node --check js/main.js`
- [x] 아군 수동 이동이 `250ms` 정도로 부드럽게 이동
- [x] Phaser HP bar / 방향표시 / 상태아이콘이 같이 움직임
- [x] DOM 부대 이미지 / 영웅 얼굴 / 병력 라벨이 같이 움직임
- [x] 이동 중 수동 입력이 잠깐 잠김
- [x] 이동 후 방향 선택 가능

## v0.5-9b-1 Battle Movement Tween Follow-up Fix QA
- [x] `node --check js/phaser/battle_scene.js`
- [x] `node --check js/ui/battle_ui.js`
- [x] `node --check js/core/battle_rules.js`
- [x] `node --check js/main.js`
- [x] 아군 이동 후 selection ring / HP bar / 방향표시가 원위치로 돌아가지 않음
- [x] 방향 선택 전에도 target 위치에 고정 유지
- [x] 방향 선택 후 갑자기 달라붙는 현상 제거
- [x] 적군 AI 이동도 `250ms`로 스무스하게 이동
- [x] 적군 이동 시 DOM 부대 이미지 / 영웅 얼굴 / 병력 라벨이 같이 움직임
- [x] 자동전투 정상
- [x] 수동 공격 / 특기 / 책략 정상
- [x] 콘솔 error 없음

## v0.5-9c Battle Entry Wrap Fade Test QA
- [x] `node --check js/ui/battle_ui.js`
- [x] `node --check js/main.js`
- [x] `battle-phaser-host-wrap` opacity `0 -> 1` transition applied
- [x] wrap fade works without breaking manual control
- [x] initial double `requestAnimationFrame` timing left a remaining issue where DOM military visuals could appear before the battlefield background

## v0.5-9c-1 Battle Entry Fade SceneReady Hook Fix QA
- [x] `node --check js/phaser/phaser_battle_mount.js`
- [x] `node --check js/ui/battle_ui.js`
- [x] `node --check js/main.js`
- [x] 전투 진입 fade 정상
- [x] 전투 진입 시 wrap fade starts after Phaser scene ready
- [x] 전장 / 부대 / 영웅 얼굴 / 병력 라벨 / 방향표시가 한 덩어리로 fade-in
- [x] 수동 선택 정상
- [x] 이동 tween 정상
- [x] 방향 선택 정상
- [x] 자동전투 정상
- [x] 적군 이동 tween 정상
- [x] 콘솔 error 0
- [x] AudioContext autoplay warning is browser-policy noise only

## Regression QA
- [ ] 내정 UI 정상
- [ ] City Detail 탭 정상
- [ ] 내부 무역 정상
- [ ] 대외 무역 정상
- [ ] 저장/불러오기 정상
- [ ] 전투 선택/이동/공격 정상
- [ ] 스킬/계략 정상
- [ ] 적 턴 정상
- [ ] 자동 전투 정상
