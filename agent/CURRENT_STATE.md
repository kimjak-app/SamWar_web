# Current State

## Current Baseline
`v0.5-8h Japan Triangle Micro Layout Patch`

This is the active handoff baseline. Do not treat `v0.5-8d-1` as the current baseline.

## v0.5-8h State
- City expansion is complete: 4 cities -> 10 cities.
- Hero expansion is complete: 8 heroes -> 27 heroes.
- Faction setup is complete: 10 factions.
- China, Korean Peninsula, and Japan are arranged as three readable triangle regions.
- v0.5-8h is a coordinate, route, and world-map structure stabilization patch.
- No battle, domestic, trade, diplomacy, espionage, or AI logic changed in v0.5-8h.

## Current World Structure

### China
- Cities: 업성 / 낙양 / 성도 / 건업.
- Added route: 업성 <-> 건업.
- China now has a clearer northern / central / southern tension line.

### Korean Peninsula
- Cities: 평양 / 한성 / 경주.
- Routes:
  - 평양 <-> 한성
  - 한성 <-> 경주
  - 평양 <-> 경주
- The peninsula is now a triangle rather than a straight chain.

### Japan
- Cities: 교토 / 오사카 / 에도.
- Routes:
  - 교토 <-> 오사카
  - 오사카 <-> 에도
  - 교토 <-> 에도
- Japan is now a triangle.

### Korea-Japan Gateway Rule
- 경주 is the Korea-to-Japan gateway.
- 한성 does not directly move to Japan.
- 평양 does not directly move to Japan.

## Completed System Baseline
- Internal trade / supply MVP is implemented.
- Internal troop rebalance MVP is implemented.
- Inter-faction trade MVP is implemented.
- Trade relation / agreement scaffold is implemented.
- Trade goods / control MVP is implemented.
- Selected City reduction and City Detail tab UX are implemented.
- City Detail position swap and collapse/open UX are implemented.

## Previous Work Summary
- `v0.5-8c`: 대외 무역 품목/직할 무역 조정 MVP.
- `v0.5-8d`: Selected City 축소 + City Detail 탭 분리.
- `v0.5-8d-1`: City Detail 위치 교체 + 접기/열기.
- `v0.5-8e`: 10도시 / 27영웅 / 10세력 확장.
- `v0.5-8f`: 월드 루트 정리.
- `v0.5-8h`: 일본 / 한반도 / 중국 삼각 배치 미세 조정.

## Not Implemented Yet
- Full diplomacy system.
- Espionage / intelligence system.
- Enemy domestic AI.
- New hero portrait assets for expanded heroes.
- New skill cut-in assets for expanded heroes.
- Final unique skill mechanics for new heroes; current new skills are placeholder-style.
- A refreshed world-map background image aligned to the v0.5-8h coordinates.

## Recommended Next Target
`v0.5-8h-2 Browser QA / Route Regression Check`

Primary focus:
- Confirm all 10 cities display.
- Confirm all 27 heroes and 10 faction ownerships remain valid.
- Confirm Korea, Japan, and China route triangles.
- Confirm only 경주 connects from Korea to Japan.
- Confirm attack/defense battle entry still works.
- Confirm domestic, trade, save, and load behavior did not regress.
