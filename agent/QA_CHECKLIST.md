# QA Checklist

## v0.5-8j World Map Coordinate Tool QA
- [ ] 새로고침 후 콘솔 에러 없음
- [ ] 월드맵 진입 정상
- [ ] `좌표 모드` 버튼 표시
- [ ] `좌표 모드` 기본 OFF
- [ ] OFF 상태에서 도시 클릭/선택 정상
- [ ] OFF 상태에서 도시 드래그 동작 없음
- [ ] ON 상태에서 모든 도시 좌표 라벨 표시
- [ ] 좌표 라벨 형식이 `city.id x,y` 형태
- [ ] ON 상태에서 도시 마커 드래그 가능
- [ ] 드래그 중 도시 마커가 시각적으로 이동
- [ ] 드래그 중 좌표 라벨이 live update
- [ ] 드래그 종료 시 `[CITY POS] city.id { x, y }` 로그 출력
- [ ] 드래그 종료 시 `{ id: "city_id", x: XX, y: YY }` copy-ready 로그 출력
- [ ] ON 상태에서 일반 도시 선택이 발생하지 않음
- [ ] 새로고침 또는 재렌더 후 수동 적용 전 드래그 위치가 원래 좌표로 복귀

## v0.5-8j Final 12-City Coordinate QA
- [ ] 12개 도시 표시
- [ ] `sabi` x 49, y 72
- [ ] `gyeongju` x 56, y 61
- [ ] `hanseong` x 45, y 53
- [ ] `pyeongyang` x 41, y 39
- [ ] `chengdu` x 14, y 84
- [ ] `luoyang` x 16, y 67
- [ ] `yecheng` x 20, y 51
- [ ] `jianye` x 27, y 91
- [ ] `kyushu` x 67, y 85
- [ ] `osaka` x 78, y 81
- [ ] `kyoto` x 81, y 67
- [ ] `edo` x 89, y 59

## Regional Layout QA
- [ ] 평양이 한반도 북부에 위치
- [ ] 한성이 한반도 중서부에 위치
- [ ] 경주가 한반도 동남부에 위치
- [ ] 사비가 한반도 서남부에 위치
- [ ] 업성이 중국 북동/동북 축에 위치
- [ ] 낙양이 중국 중앙부에 위치
- [ ] 성도가 중국 서남부에 위치
- [ ] 건업이 중국 동남부/해안 축에 위치
- [ ] 큐슈가 일본 서남부에 위치
- [ ] 오사카가 일본 하단 중앙부에 위치
- [ ] 교토가 오사카의 위/오른쪽에 위치
- [ ] 에도가 일본 동북부에 위치

## Route Preservation QA
- [ ] 건업 <-> 사비 해상 루트 유지
- [ ] 사비 <-> 큐슈 해상 루트 유지
- [ ] 경주 <-> 교토 해상 루트 유지
- [ ] 경주 <-> 오사카 해상 루트 유지
- [ ] 오사카 <-> 큐슈 해상 루트 유지
- [ ] 건업 <-> 한성 direct route 없음
- [ ] 한성에서 일본 직접 이동 불가
- [ ] 평양에서 일본 직접 이동 불가

## Existing Expansion QA
- [ ] 백제 세력 표시
- [ ] 큐슈 세력 표시
- [ ] 사비에 의자왕 / 계백 / 흑치상지 표시
- [ ] 큐슈에 시마즈 요시히로 / 고니시 유키나가 표시
- [ ] 조조/위 세력에 곽가 표시
- [ ] 여포 active roster 제외 확인
- [ ] 신규 portrait `null` fallback 정상
- [ ] 신규 cutin `null` fallback 정상

## Regression QA
- [ ] 내정 UI 정상
- [ ] City Detail 탭 정상
- [ ] 내부 무역 정상
- [ ] 대외 무역 정상
- [ ] 저장/불러오기 정상
- [ ] 기존 전투 진입 정상
- [ ] 신규 도시 전투 진입 정상
- [ ] Battle DOM Text Overlay 중복 표시 없음
- [ ] DOM overlay가 전투 클릭을 방해하지 않음
