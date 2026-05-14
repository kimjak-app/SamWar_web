# SamWar_web Handoff

## Current Baseline
`v0.5-8i-1 West Sea Route Patch`

Next session must start from this baseline.

Before starting new work, read these six agent documents:
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/CURRENT_STATE.md`
- `agent/NEXT_TASKS.md`
- `agent/QA_CHECKLIST.md`
- `agent/CHANGELOG.md`
- `agent/SESSION_LOG.md`

## Current Structure
- Active world: 12 cities.
- Active roster: 32 active heroes.
- Factions: 12.
- Total hero data may be 33 because 여포 is retained as reserve.
- Internal trade / supply MVP is complete.
- External trade MVP, relation controls, and trade goods/control MVP are complete.
- City Detail tab UX is complete.
- World routes and city coordinates follow `v0.5-8i-1`.
- Latest route patch adds 건업 <-> 사비 as a sea route.

## v0.5-8i Additions
- 여포 removed from 조조/위 active roster and marked reserve/inactive.
- 곽가 added to 조조/위 at 업성.
- 백제 세력 added.
- 사비 city added.
- 의자왕 / 계백 / 흑치상지 added.
- 큐슈 세력 added.
- 큐슈 city added.
- 시마즈 요시히로 / 고니시 유키나가 added.
- Six new unique skill IDs added as placeholder-style skills.

## v0.5-8i-1 Addition
- Added 건업 <-> 사비 as a West Sea route.
- 건업 <-> 한성 direct route is intentionally deferred.
- 사비 is now the West Sea maritime gateway.

## Current Route Rules
- Eastern sea route: 경주 <-> 교토 / 오사카.
- Western sea route: 사비 <-> 큐슈.
- West Sea route: 건업 <-> 사비.
- 큐슈 <-> 오사카 links the western Japanese sea route into Japan.
- 한성 and 평양 still do not directly move to Japan.
- 사비 connects to 한성, 경주, and 큐슈.

## Important Warnings
- Diplomacy and espionage are not implemented yet.
- Enemy domestic AI is not implemented yet.
- Naval combat is not implemented.
- 건업 <-> 한성 direct route is not implemented.
- New hero portrait images do not exist yet.
- New hero skill cut-in images do not exist yet.
- New unique skills are MVP placeholders using existing supported effect types.
- The world-map background image has not been redrawn for the v0.5-8i 12-city layout.

## Next Candidate Targets
1. `v0.5-8i-2 Browser QA / West Sea Route Regression`
2. `v0.5-8j World Map Background Draft Prep`
3. `v0.5-9 Diplomacy & Spy Scaffold`

## Scope Guard For Next Session
Unless explicitly requested, do not add:
- Full diplomacy AI.
- Espionage logic.
- Enemy domestic automation.
- Naval combat.
- New assets.
- Battle engine overhaul.
- Domestic formula changes.
- Trade formula changes.
- Save/load structure rewrite.
- Window compatibility reintroduction.
