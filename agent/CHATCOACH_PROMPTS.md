# ChatCoach Prompts

SamWar_web에서 새 ChatGPT 세션을 시작하거나, 작업 계획을 줄이거나, Codex 결과를 검토하거나, 커밋 메시지를 정리할 때 바로 복붙해서 쓰는 ChatCoach 전용 프롬프트 모음입니다.

## New Chat Start Prompt

```text
채코치, SamWar_web 세션 시작.
GitHub 저장소 kimjak-app/SamWar_web의 agent 문서들을 먼저 확인하고,
CURRENT_STATE.md 기준으로 현재 상태 요약한 뒤,
HANDOFF_TO_CHATCOACH.md와 NEXT_TASKS.md 기준으로 다음 작업 하나만 잡아줘.
```

## Dream Team Lite Prompt

```text
채코치, Dream Team Lite 모드로 가자.

프로젝트: SamWar_web
오늘 목표: [여기에 목표 입력]

Team Lead / Planning / Architecture / Design / Implementation / QA Coach 관점으로 검토하고,

1. 오늘 할 작업 하나
2. 파일 구조 / 영향 범위
3. Codex 복붙용 지시문
4. 검수 체크리스트

까지 정리해줘.

한 번에 너무 크게 가지 말고, 오늘 실제로 할 작업 하나만 확정해줘.
```

## Codex Result Review Prompt

```text
채코치, Codex가 작업을 끝냈어.
아래 결과를 기준으로 구조 문제, 누락 파일, 하드코딩 여부, 검수 포인트, 커밋 여부를 판단해줘.

[Codex 결과 붙여넣기]
```

## Commit Message Prompt

```text
채코치, 이번 작업 변경 내용을 기준으로 GitHub Desktop에 넣을 커밋 메시지 추천해줘.
가능하면 한 줄 Summary와 짧은 Description으로 정리해줘.
```

## Scope Reduction Prompt

```text
채코치, 지금 작업 범위가 너무 큰 것 같아.
Dream Team Lite 기준으로 오늘 할 수 있는 가장 작은 단위 하나로 줄여줘.
```
