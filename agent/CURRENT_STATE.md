# Current State

## Current Baseline
`v0.5-8j World Map Coordinate Tool + Final 12-City Layout`

This is the current stable handoff baseline. Do not treat `v0.5-8i-2a`, `v0.5-8i-2`, `v0.5-8i-1`, `v0.5-8i`, `v0.5-8h`, or `v0.5-8d-1` as the current baseline unless explicitly requested.

## Current Completed State
- The `v0.5-8h` 10-city / 27-hero / 10-faction structure has been expanded.
- `v0.5-8i` added 백제 / 사비 and 큐슈 세력 / 큐슈.
- Active world is 12 cities / about 32 active heroes / 12 factions.
- 조조/위 active roster uses 곽가 instead of 여포.
- 여포 data remains reserved/inactive for future reuse.
- `v0.5-8i-1` added 건업 <-> 사비 as a West Sea route.
- `v0.5-8i-2` added Battle DOM Text Overlay.
- `v0.5-8i-2a` polished Battle DOM troop labels.
- `v0.5-8j` added the world map city coordinate debug tool and applied the final 12-city layout coordinates.

## World Map Coordinate Tool
- Added a world map `좌표 모드` toggle.
- OFF by default.
- OFF state keeps normal city click/select behavior unchanged.
- ON state:
  - city markers become draggable.
  - labels appear above all city markers.
  - label format: `city.id x,y`.
  - labels update live while dragging.
  - drag end logs `[CITY POS] city.id { x, y }`.
  - drag end also logs a copy-ready object string such as `{ id: "city_id", x: XX, y: YY }`.
- Dragging does not save coordinates automatically.
- Dragging does not mutate `data/cities.js`.
- Refresh/re-render resets visual drag positions unless coordinates are manually applied.

## Final 12-City Coordinates

### Korean Peninsula
- `sabi`: x 49, y 72.
- `gyeongju`: x 56, y 61.
- `hanseong`: x 45, y 53.
- `pyeongyang`: x 41, y 39.

### China
- `chengdu`: x 14, y 84.
- `luoyang`: x 16, y 67.
- `yecheng`: x 20, y 51.
- `jianye`: x 27, y 91.

### Japan
- `kyushu`: x 67, y 85.
- `osaka`: x 78, y 81.
- `kyoto`: x 81, y 67.
- `edo`: x 89, y 59.

## Route State
- West Sea route: 건업 <-> 사비.
- Western sea route: 사비 <-> 큐슈.
- Eastern sea routes: 경주 <-> 교토 and 경주 <-> 오사카.
- Japan western link: 오사카 <-> 큐슈.
- 건업 <-> 한성 direct route remains deferred.
- 한성 and 평양 still do not directly connect to Japan.
- Route graph was not changed during the final coordinate application.

## Battle DOM Text State
- Battle DOM Text Overlay remains active from `v0.5-8i-2`.
- Unit troop labels remain in the translucent mini-label style from `v0.5-8i-2a`.
- Battle DOM text scale-up polish is still pending.
- Battle asset HiDPI pass is still pending.
- Battle logic, Phaser config, troop calculation, and save/load structure were not changed by `v0.5-8j`.

## Important Warnings
- Diplomacy is still not implemented.
- Espionage is still not implemented.
- Enemy domestic AI is still not implemented.
- Naval combat is still not implemented.
- New portrait/cutin assets for Baekje/Kyushu heroes are still missing.
- Battle asset HiDPI pass is still pending.
- Battle DOM text scale-up polish is still pending.
- Northern/Mongol faction idea is only a future candidate, not implemented.

## Previous Work Summary
- `v0.5-8c`: 대외 무역 품목/직할 무역 조정 MVP.
- `v0.5-8d`: Selected City 축소 + City Detail 탭 분리.
- `v0.5-8d-1`: City Detail 위치 교체 + 접기/열기.
- `v0.5-8e`: 10도시 / 27영웅 / 10세력 확장.
- `v0.5-8f`: 월드 루트 정리.
- `v0.5-8h`: 일본 / 한반도 / 중국 삼각 배치 미세 조정.
- `v0.5-8i`: 백제 / 사비, 큐슈 / 큐슈 세력 확장.
- `v0.5-8i-1`: 건업 <-> 사비 서해 해상 루트 추가.
- `v0.5-8i-2`: 전투 텍스트/숫자 DOM Overlay 이전.
- `v0.5-8i-2a`: 유닛 병력 숫자 라벨 반투명 미니 라벨 폴리싱.
- `v0.5-8j`: 월드맵 좌표 디버그 도구와 최종 12도시 좌표 적용.

## Recommended Next Targets
1. `v0.5-8k Northern Faction Planning / Genghis Khan Candidate`
2. `v0.5-9 Diplomacy & Spy Scaffold`
3. `Battle DOM Text Scale Up Polish`
4. `Battle Asset HiDPI Pilot`
