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

## v0.5-9a Battle Entry Curtain Fade Fix QA
- [ ] `battle-entry-curtain` 생성
- [ ] curtain이 Phaser canvas와 DOM overlay를 함께 덮음
- [ ] curtain `pointer-events: none`
- [ ] 전투 진입 직후 전장 이미지 / 방향 화살표 / 영웅 얼굴 / 병력 라벨이 먼저 튀어나오지 않음
- [ ] 검은 curtain이 자연스럽게 걷히면서 전체 전투 화면이 동시에 나타남
- [ ] curtain fade-out은 1회만 실행됨
- [ ] curtain 제거 후 스킬 컷인 / 결과 컷인과 충돌 없음
- [ ] Phaser `camera.fadeIn()` 제거 확인

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
