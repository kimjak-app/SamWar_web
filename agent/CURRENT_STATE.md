# Current State

## Current Baseline
`v0.5-8i-1 West Sea Route Patch`

This is the active handoff baseline. Do not treat `v0.5-8i`, `v0.5-8h`, or `v0.5-8d-1` as the current baseline.

## v0.5-8i-1 State
- Added 건업 <-> 사비 as a sea route.
- 건업 <-> 한성 direct route is intentionally deferred.
- 사비 now acts as the West Sea gateway from 강남/오 toward the southwestern Korean Peninsula.
- 한성 and 평양 still do not directly connect to Japan.
- Naval combat, diplomacy, espionage, and enemy domestic AI are still not implemented.

## v0.5-8i State
- Active world: 12 cities / 32 active heroes / 12 factions.
- Total hero data can be 33 because 여포 remains in reserve data.
- 여포 is not deleted, but is excluded from the active roster and initial battle roster.
- 곽가 is added to the 위 / 조조 세력 roster at 업성.
- 백제 세력 and 사비 are added.
- 큐슈 세력 and 큐슈 are added.
- New hero portraits and skill cut-ins are still not available; new fields use `null` fallback.
- No diplomacy, espionage, enemy domestic AI, naval combat implementation, domestic formula change, trade formula change, or battle engine overhaul was added.

## Current World Structure

### China
- Cities: 업성 / 낙양 / 성도 / 건업.
- 건업 has a western sea route to 사비.
- 위 active roster now uses 조조 / 순욱 / 곽가.
- 여포 remains reserved for future independent faction, event hero, or field boss use.

### Korean Peninsula
- Cities: 평양 / 한성 / 경주 / 사비.
- 사비 is the 백제 왕도 and southwestern peninsula node.
- Routes:
  - 평양 <-> 한성
  - 한성 <-> 경주
  - 평양 <-> 경주
  - 한성 <-> 사비
  - 사비 <-> 경주

### Japan
- Cities: 교토 / 오사카 / 에도 / 큐슈.
- Routes:
  - 교토 <-> 오사카
  - 오사카 <-> 에도
  - 교토 <-> 에도
  - 큐슈 <-> 오사카

### Sea Route Rules
- Eastern sea route: 경주 <-> 교토 / 오사카.
- Western sea route: 사비 <-> 큐슈.
- West Sea route: 건업 <-> 사비.
- 한성 and 평양 still do not directly connect to Japan.
- 큐슈 is the western sea pressure point between 사비 and 오사카.

## New Factions / Cities / Heroes
- `baekje_faction` / 백제 / 사비:
  - 의자왕
  - 계백
  - 흑치상지
- `kyushu_faction` / 큐슈 세력 / 큐슈:
  - 시마즈 요시히로
  - 고니시 유키나가
- 위 / 업성:
  - 곽가 added.
  - 여포 reserved and removed from active roster.

## New Skill IDs
- `heavenly_stratagem` / 천리기책 / 곽가.
- `great_baekje_advance` / 대백제 진격 / 의자왕.
- `hwangsanbeol_last_stand` / 황산벌 결사 / 계백.
- `heukchi_restoration` / 부흥의 흑치 / 흑치상지.
- `demon_shimazu` / 귀신 시마즈 / 시마즈 요시히로.
- `sea_supply_route` / 해로보급 / 고니시 유키나가.

All six are MVP placeholder-style skills using existing supported effect types.

## Save / Load
- Save version is `v0.5-8i-1`.
- Legacy load keeps `v0.5-8i`.
- Legacy load keeps `v0.5-8h`, `v0.5-8f`, `v0.5-8e`, `v0.5-8d-1`, `v0.5-8d`, `v0.5-8c`, `v0.5-8b`, `v0.5-8`, and older keys.
- Old saves merge canonical 사비/큐슈 and the latest 건업 <-> 사비 route.
- Old saves that still contain 여포 at 업성 normalize him back to reserve/inactive.

## Previous Work Summary
- `v0.5-8c`: 대외 무역 품목/직할 무역 조정 MVP.
- `v0.5-8d`: Selected City 축소 + City Detail 탭 분리.
- `v0.5-8d-1`: City Detail 위치 교체 + 접기/열기.
- `v0.5-8e`: 10도시 / 27영웅 / 10세력 확장.
- `v0.5-8f`: 월드 루트 정리.
- `v0.5-8h`: 일본 / 한반도 / 중국 삼각 배치 미세 조정.
- `v0.5-8i`: 백제 / 사비, 큐슈 / 큐슈 세력 확장.
- `v0.5-8i-1`: 건업 <-> 사비 서해 해상 루트 추가.

## Recommended Next Target
`v0.5-8i-2 Browser QA / West Sea Route Regression`
