# Current State

## Current Baseline
`v0.5-8i-2a Battle DOM Text Visual Polish`

This is the current stable handoff candidate. Do not treat `v0.5-8i-2c`, `v0.5-8i-2`, `v0.5-8i-1`, `v0.5-8i`, `v0.5-8h`, or `v0.5-8d-1` as the current baseline unless explicitly requested.

## Current Completed State
- The `v0.5-8h` 10-city / 27-hero / 10-faction structure has been expanded.
- `v0.5-8i` added 백제 / 사비 and 큐슈 세력 / 큐슈.
- 조조/위 active roster no longer uses 여포; 곽가 was added instead.
- 여포 data remains reserved/inactive for future reuse.
- Active world is now 12 cities / about 32 active heroes / 12 factions.
- New portraits and cut-ins for the added heroes are not available yet and use `null` fallback.

## Baekje / Kyushu Expansion
- 백제 세력:
  - 사비
  - 의자왕
  - 계백
  - 흑치상지
- 큐슈 세력:
  - 큐슈
  - 시마즈 요시히로
  - 고니시 유키나가
- 위 / 조조 세력:
  - 곽가 added at 업성.
  - 여포 excluded from active roster and battle roster.

## New Skill IDs
- `heavenly_stratagem`
- `great_baekje_advance`
- `hwangsanbeol_last_stand`
- `heukchi_restoration`
- `demon_shimazu`
- `sea_supply_route`

All six skill IDs are English snake_case. They are MVP placeholder-style skills using currently supported effect types where possible.

## West Sea Route State
- `v0.5-8i-1` added 건업 <-> 사비 as a sea route.
- 건업 <-> 한성 direct route remains deferred.
- 사비 now acts as the West Sea maritime gateway.
- 한성 and 평양 still do not directly connect to Japan.
- 사비 <-> 큐슈 remains the western sea route.
- 경주 <-> 교토 / 오사카 remains the eastern sea route.

## Battle DOM Text State
- `v0.5-8i-2` moved blurry Phaser canvas battle text/numbers into a DOM Overlay.
- DOM Overlay targets:
  - top title / battlefield name
  - instruction text
  - bottom status legend
  - unit troop count labels
- Phaser still handles battle background, grid, units, sprites, highlights, and effects.
- `v0.5-8i-2a` polished unit troop count labels into lighter translucent mini-labels.
- Battle text sharpness improved.
- Battle logic, Phaser config, DOM overlay coordinate math, HP/troop calculation, domestic, trade, and save/load behavior were not changed.

## Known Remaining Visual Work
- Unit troop number labels are clearer but still need a larger size pass.
- The upper-right selected unit/hero info panel text needs a larger readability pass.
- The bottom status legend text needs a larger readability pass.
- Battle hero faces, unit sprites, and background image sharpness are still unresolved.

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

## Recommended Next Target
`v0.5-8i-2c Battle DOM Text Scale Up Polish`

Focus:
- Increase unit troop number label size.
- Increase upper-right selected unit/hero info panel text.
- Increase bottom status legend text.
- Adjust top title / battlefield name size if needed.
- Do not change battle logic, Phaser config, troop calculation, or overlay coordinate math.
