# Next Tasks

## Current Baseline
`v0.5-8h Japan Triangle Micro Layout Patch`

## Immediate Next Target
`v0.5-8h-2 Browser QA / Route Regression Check`

Check:
- 10개 도시가 모두 표시되는지.
- 27명 영웅 데이터가 깨지지 않는지.
- 10세력 소유권이 정상인지.
- 한반도 삼각 구도가 정상인지.
- 일본 삼각 구도가 정상인지.
- 중국 루트가 정상인지.
- 경주만 일본 관문인지.
- 공격/방어 전투 진입이 정상인지.
- 내정/무역/저장 회귀가 없는지.

## Next Visual Target
`v0.5-8i World Map Background Draft Prep`

Scope:
- 현재 10도시 좌표 기준으로 월드맵 배경 이미지 초안을 준비한다.
- Phaser 좌표와 이미지 도시 위치를 맞추기 위한 기준을 정리한다.
- 도시 아이콘, 깃발, 세력색은 이후 작업으로 둔다.

## Next System Target
`v0.5-9 Diplomacy & Spy Scaffold`

Scope:
- 적국 정보 공개 범위.
- 첩보 없음 / 부분 / 상세 정보 공개.
- 세력 관계 UI 확장.
- 적국 재상 / 태수 / 자원 / 병력 노출 제한.

## Alternative Target
`v0.5-9 Enemy Domestic AI MVP`

Scope:
- 적국 재상 / 태수 자동 임명.
- 적국 병사 모집 / 보급 판단.
- 적국 내부 / 대외 무역 ledger 활용.
- 적국 침공 판단 고도화.

## Guardrails
- Current baseline is `v0.5-8h`, not `v0.5-8d-1`.
- Do not change code, data, CSS, HTML, save/load, routes, or coordinates during docs cleanup.
- Run browser QA before using the v0.5-8h layout as the world-map image basis.
