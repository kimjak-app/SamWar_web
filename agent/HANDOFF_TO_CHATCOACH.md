# SamWar_web Handoff

## Current Baseline
`v0.5-8h Japan Triangle Micro Layout Patch`

Next session must start from this baseline, not `v0.5-8d-1`.

Before starting new work, read these six agent documents:
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/CURRENT_STATE.md`
- `agent/NEXT_TASKS.md`
- `agent/QA_CHECKLIST.md`
- `agent/CHANGELOG.md`
- `agent/SESSION_LOG.md`

## Current Structure
- 10 cities.
- 27 heroes.
- 10 factions.
- Internal trade / supply MVP is complete.
- External trade MVP, relation controls, and trade goods/control MVP are complete.
- City Detail tab UX is complete.
- World routes and city coordinates follow `v0.5-8h`.

## v0.5-8h Map Rules
- China has 업성 / 낙양 / 성도 / 건업 with 업성 <-> 건업 added.
- Korean Peninsula has 평양 / 한성 / 경주 as a triangle.
- Japan has 교토 / 오사카 / 에도 as a triangle.
- 경주 is the only Korea-to-Japan gateway.
- 한성 and 평양 do not directly attack or move to Japan.

## Important Warnings
- Diplomacy and espionage are not implemented yet.
- Enemy domestic AI is not implemented yet.
- New hero portrait images do not exist yet.
- New hero skill cut-in images do not exist yet.
- New unique skills for expanded heroes are placeholder-style.
- The world-map background image has not been redrawn for the v0.5-8h coordinates.
- Do not assume the old v0.5-8d-1 four-city UI handoff is still the active baseline.

## Next Candidate Targets
1. `v0.5-8h-2 Browser QA / Route Regression Check`
2. `v0.5-8i World Map Background Draft Prep`
3. `v0.5-9 Diplomacy & Spy Scaffold`
4. `v0.5-9 Enemy Domestic AI MVP`

## Previous Work Summary
- `v0.5-8c`: 대외 무역 품목/직할 무역 조정 MVP.
- `v0.5-8d`: Selected City 축소 + City Detail 탭 분리.
- `v0.5-8d-1`: City Detail 위치 교체 + 접기/열기.
- `v0.5-8e`: 10도시 / 27영웅 / 10세력 확장.
- `v0.5-8f`: 월드 루트 정리.
- `v0.5-8h`: 일본 / 한반도 / 중국 삼각 배치 미세 조정.

## Scope Guard For Next Session
Unless explicitly requested, do not add:
- Full diplomacy AI.
- Treaty negotiation.
- Espionage logic.
- Enemy domestic automation.
- New assets.
- Battle logic changes.
- Domestic formula changes.
- Trade formula changes.
- Save/load behavior changes.
- World route or coordinate changes before completing browser QA.
