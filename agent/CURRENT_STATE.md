# Current State

## Status
- Current Version: `v0.3-7a Battle Coordinate Adapter Prep`
- Status: `Stable 4-city / 8-hero PC web MVP baseline with coordinate adapter prep completed and manual browser QA passed.`
- Main loop: world map -> battle -> victory/defeat result -> world map return

## Current 4-City MVP
- Hanseong: player-owned, defenders `이순신`, `정도전`
- Luoyang: enemy-owned, defenders `관우`, `장비`
- Pyongyang: enemy-owned, defenders `광개토대왕`, `도림`
- Kyoto: enemy-owned, defenders `노부나가`, `겐신`

## Implemented Systems
- 14x8 Phaser battlefield.
- Manual battle and auto battle.
- World-map attack and defense battle choices.
- City ownership transfer after battle results.
- Explicit city defender rosters.
- Hero roster portraits and battlefield portrait badges.
- Unique skill cut-ins for all 8 MVP heroes.
- Victory/defeat result cut-in images and result music.
- Victory/defeat result text overlays.
- Pyongyang hero data, skills, roster, and visual asset wiring.
- Status icon overlay on battlefield units.
- One-line status legend at bottom of battle screen.
- Battle coordinate adapter prep for future larger battlefields and 2.5D/isometric projection.
- Centralized grid-to-screen rendering conversion in battle scene.

## Pyongyang System
- `광개토대왕` uses `영락대업`.
- `도림` uses `흑백이간`.
- `영락대업`: allied attack buff.
- `흑백이간`: enemy collision plus confusion/shake logic.
- Pyongyang battle starts with `gwanggaeto` and `dorim`.
- Existing Hanseong, Luoyang, and Kyoto battles still initialize.

## Auto Battle State
Current AI priority:
1. High-value unique skill.
2. Normal attack.
3. Move toward enemy.
4. Low-value fallback skill.
5. Strategy.
6. Wait.

High-value rules:
- `ally_attack_buff`: high-value if at least one living ally lacks active attack buff.
- `enemy_collision_confuse`: high-value if a primary target has a nearby secondary enemy.

Known fixes:
- Support/strategy units no longer stall at range.
- Dorim uses `흑백이간` when collision target exists.
- Gwanggaeto uses `영락대업` meaningfully.
- Yi Sun-sin `학익진 포격` returns a valid target in auto battle.
- Wait fallback is guarded by final attack/move checks.

## Status Icons
Active battlefield icons:
- 혼란: `🌀`
- 동요: `⚠`
- 공격력 상승: `▲`
- 방어 태세: `◆`

Documented future icon convention:
- 공격력 상승 `▲`
- 공격력 감소 `▼`
- 방어 / 방어력 상승 `◆`
- 방어력 감소 `◇`
- 혼란 `🌀`
- 동요 `⚠`
- 기절 `✖`
- 화상 `🔥`
- 중독 `☠`
- 도발 `!`
- 속박 `⛓`

## Cut-in Text Data
Unique skill cut-ins display:
- `skill.name`
- `skill.cutinQuote`
- `skill.cutinEffectText`

Current cut-in duration:
- All 8 unique skills: `cutinDurationMs: 2200`

Current skill text:
- `hakikjin_barrage` / `학익진 포격`: `사정거리 안 모든 적을 포격하라!`, `(사정범위 내 모든 적 공격)`
- `reform_order` / `개혁령`: `나의 계책! 아군의 공격력을 단숨에 끌어올렸다!`, `(아군 공격력 상승)`
- `matchlock_volley` / `삼단격`: `화승총 사격의 매운 맛을 보여주마!`, `(사정범위 내 적 공격)`
- `cavalry_charge` / `차륜전`: `돌격! 적진을 때려부숴라!`, `(적진 돌파 공격)`
- `crescent_blade_slash` / `언월참`: `내 앞을 가로막는 자! 목을 내놓아라!`, `(강력한 단일 공격)`
- `changban_shatter` / `장판파열`: `음하하~ 내 고함 한 방에 쩔쩔들 매는군!`, `(주변 적 동요)`
- `yeongnak_grand_legacy` / `영락대업`: `전군이여! 나를 믿고 따르라!`, `(아군 공격력 상승)`
- `black_white_scheming` / `흑백이간`: `내 비책! 서로를 죽일 것이다!`, `(적 충돌 · 혼란/동요)`

## Visual Decisions To Preserve
- Cut-in/result image assets are not edited for text.
- Text overlays remain removable DOM UI.
- Skill title font: Gothic/sans-serif.
- Skill quote font: `궁서`, `Gungsuh`, `Batang`, serif.
- Skill effect font: smaller Gothic/sans-serif.
- Quote position: visual center, slightly below center.
- Skill title/effect position: lower center.
- Do not casually change Phaser render config, texture filtering, `pixelArt`, `roundPixels`, or mipmap settings.

## Known Future Work
- Next recommended step: `v0.3-7b Battle Layer Prep`.
- Future large battlefield / 2.5D work should continue through the coordinate adapter, not direct screen coordinate math.
- Later audio pass: skill SFX, voice AI from `cutinQuote`, possible `cutinVoice` / `sfx` fields.
- Later visual sharpness pass after MVP stabilizes.
- 10-city / 20-hero expansion only after 4-city / 8-hero systems are accepted.
