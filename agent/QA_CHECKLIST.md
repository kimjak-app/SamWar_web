# QA Checklist

## v0.5-8k / v0.5-9 World Map Expansion + Visual Direction QA
- [ ] 새로고침 후 콘솔 에러 없음
- [ ] 월드맵 진입 정상
- [ ] 13개 도시 표시
- [ ] 몽골 세력 표시
- [ ] 카라코룸 표시
- [ ] 징기스칸 / 수부타이 / 제베 데이터 표시

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

## Coordinate Tool QA
- [ ] `좌표 모드` 버튼 표시
- [ ] `좌표 모드` 기본 OFF
- [ ] OFF 상태에서 도시 클릭/선택 정상
- [ ] ON 상태에서 모든 도시 좌표 라벨 표시
- [ ] 좌표 라벨 형식이 `city.id x,y`
- [ ] ON 상태에서 도시 마커 드래그 가능
- [ ] 드래그 종료 시 copy-ready 좌표 로그 출력
- [ ] `karakorum` 드래그/좌표 표시 정상

## World Route Visual QA
- [ ] 육상 연결선이 시각적으로 렌더되지 않음
- [ ] 해상 연결선만 시각적으로 렌더됨
- [ ] `jianye <-> sabi` 해상 루트 표시
- [ ] `sabi <-> kyushu` 해상 루트 표시
- [ ] `gyeongju <-> kyoto` 해상 루트 표시
- [ ] `gyeongju <-> osaka` 해상 루트 표시
- [ ] `osaka <-> kyushu` 해상 루트 표시
- [ ] 육상 연결은 데이터상 유지
- [ ] `yecheng -> karakorum -> pyeongyang` 전략 경로 유지
- [ ] `pyeongyang -> hanseong -> sabi` 전략 경로 유지
- [ ] `pyeongyang -> hanseong -> gyeongju` 전략 경로 유지
- [ ] `osaka -> kyoto -> edo` 전략 경로 유지

## City Label Banner QA
- [ ] 도시 라벨이 검은 패널이 아님
- [ ] 도시 라벨이 세력색 배너 사용
- [ ] 도시 라벨에 도시명만 표시
- [ ] `아군 / 적군` 메타 텍스트 없음
- [ ] 도시명 줄바꿈 없음
- [ ] `카라코룸` 한 줄 표시
- [ ] 배너 tail/flag 느낌 유지
- [ ] 텍스트 대비가 세력별로 읽기 쉬움

## Battle DOM Unit Image Pilot QA
- [ ] 전투 진입 정상
- [ ] 콘솔 에러 없음
- [ ] DOM overlay가 Phaser canvas 위에 정상 표시
- [ ] DOM unit image overlay 활성화
- [ ] DOM unit token 이미지 선명함
- [ ] DOM portrait badge 이미지 선명함
- [ ] DOM overlay `pointer-events: none`
- [ ] DOM image가 클릭을 막지 않음
- [ ] Phaser hit zone 클릭 정상
- [ ] Phaser text와 DOM text 중복 없음
- [ ] Phaser old token/portrait fallback flag가 남아 있음

## Battle DOM Unit First Polish QA
- [ ] token 이미지 크기 `124px x 124px`
- [ ] portrait badge 크기 `40px x 40px`
- [ ] `battleDomUnitIdle` 애니메이션 활성화
- [ ] 애니메이션이 inner image에만 적용됨
- [ ] selection ring / HP bar / 상태 아이콘 / facing text 유지

## Next Patch QA Focus: v0.5-9
- [ ] portrait badge 크기 `70px`
- [ ] portrait badge가 유닛에 매우 가깝게 부착됨
- [ ] status indicator가 유닛에 더 가깝게 이동
- [ ] facing indicator가 유닛에 더 가깝게 이동
- [ ] portrait를 가리지 않음
- [ ] enemy left -> face right
- [ ] player right -> face left

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
