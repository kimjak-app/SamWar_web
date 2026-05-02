# Handoff to ChatCoach

## Completed Task
SamWar_web session-close documentation update for new chat handoff was completed after the `v0.2-6b Battle Command Bar + Side Info Layout Patch` milestone.

## Changed Files
- `agent/CURRENT_STATE.md`
- `agent/SESSION_LOG.md`
- `agent/HANDOFF_TO_CHATCOACH.md`
- `agent/NEXT_TASKS.md`

## Current State
- Current recorded milestone is `v0.2-6b Battle Command Bar + Side Info Layout Patch complete`.
- World map remains fullscreen with 4 MVP cities: `낙양`, `평양`, `한성`, `교토`.
- World map attack loop works: select enemy city -> enter battle -> win or retreat -> return to world map -> victory occupies city.
- Battle remains Phaser-rendered while core rules stay in `js/core`.
- Battle layout now consists of:
  - left battle log panel
  - center tactical battlefield board
  - right unit/status information panel
  - bottom fixed command bar
- Battle command buttons are visible at `100%` zoom.
- Battle log and right info panel are both scroll-contained.
- Battle uses:
  - `assets/units/unit_player_mvp.png`
  - `assets/units/unit_enemy_mvp.png`
  - `assets/battle/battlefield_mvp.png`
- Persistent Phaser mount behavior is preserved:
  - same `battle.id` reuses the same canvas
  - auto battle no longer flickers
- Current battle systems include movement, facing, front/side/back attack bonus, attack, counterattack, defend, wait, unique hero skills, skill cooldowns, intelligence-tier random strategy, confusion/shake, role-based AI, and player auto battle.

## Verification Result
- This was a documentation-only task.
- No game code, CSS, assets, battle logic, or world map logic were changed.
- The handoff docs now reflect the latest `v0.2-6b` project state, preserved design decisions, known issues, and next-session agenda.

## Known Issues
- Battle UI still needs further polish in spacing, density, readability, command hierarchy, and board scale balance.
- The current `10x6` battlefield may still feel too small; `14x8` or `16x8` are the preferred next test sizes.
- BGM integration has not started yet.
- Troop-count-based visual degradation is still deferred.
- Difficulty presets are not urgent yet even though current battle difficulty is high.

## Kimjak Check Items
- Confirm the next session starts from `v0.2-6b` and not from an older battle UI milestone.
- Confirm Direct Codex Paste Mode remains the working method.
- Confirm `agent/CODEX_INBOX.md` is not treated as the main task source.
- Confirm battle rules remain separated from Phaser rendering.
- Confirm hero, skill, roster, and strategy content remain data-driven.
- Confirm the fixed MVP roster is still:
  - Player: `이순신`, `정도전`
  - Enemy: `노부나가`, `겐신`
- Confirm unique skills remain owner-locked.
- Confirm strategy remains intelligence/probability-based rather than cooldown/count-based.
- Confirm `v0.2-7` should prioritize UI improvement first, then BGM and battlefield-size testing.

## Suggested Next Task
Suggested next task: `SamWar_web v0.2-7`

Main candidates:

1. Battle UI improvement
   - Highest priority.
   - Clean up the new left/center/right/bottom battle layout.
   - Improve command bar readability.
   - Improve log and unit info density.
   - Reduce clutter while preserving all controls.
2. BGM integration test
   - Add world map BGM.
   - Add battle BGM.
   - Switch or start/stop BGM between world and battle.
   - Keep simple looping first.
3. Battlefield size test
   - Test a larger battlefield because current scale feels small.
   - Preferred candidates: `14x8`, `16x8`.
   - Reposition units and adjust background fit as needed.
4. Troop-count visual stages
   - Lower priority.
   - Defer until after UI, BGM, and board-size testing.

## New Chat Start Prompt
채코치, SamWar_web v0.2-7 세션 시작.

GitHub 저장소는 kimjak-app/SamWar_web이고, 공통 룰은 kimjak-app/_rules를 참고해줘.
프로젝트 상태는 agent/CURRENT_STATE.md, agent/SESSION_LOG.md, agent/HANDOFF_TO_CHATCOACH.md, agent/NEXT_TASKS.md 기준으로 이어가자.

현재 상태:
- v0.2-6b까지 완료.
- 월드맵 4도시 MVP 작동.
- 월드맵 → 전투 → 승리/후퇴 → 월드맵 복귀 루프 작동.
- 전투 엔진은 Phaser + JS core rules 구조.
- 전투 기능은 이동, 방향, 측후방, 반격, 방어, 대기, 고유특기, 책략, 상태이상, AI, 자동전투까지 1차 구현 완료.
- 자동전투 깜빡임은 v0.2-5a에서 해결됨.
- 전투 비주얼은 부대 토큰 이미지와 전장 배경 적용 완료.
- 전투 UI는 좌측 로그 / 중앙 전투판 / 우측 정보 / 하단 커맨드 바 구조로 정리됨.
- Direct Codex Paste Mode로 작업 중이고 CODEX_INBOX.md는 메인 작업 소스로 쓰지 않음.

오늘 논의할 것:
1. 전투 UI 개선을 v0.2-7 1순위로 진행할지
2. 월드맵 BGM / 전투 BGM 적용을 같이 할지
3. 전장 크기를 14x8 또는 16x8로 테스트할지
4. 병력 감소에 따른 부대 이미지 변화는 오늘 할지, 다음 차수로 미룰지

먼저 agent 문서 기준으로 현재 상태를 요약하고, 오늘 작업 우선순위를 판단해줘.
