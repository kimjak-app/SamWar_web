# QA Checklist

## Battle Initialization
- Hanseong battle starts.
- Luoyang battle starts with `관우` and `장비`.
- Pyongyang battle starts with `광개토대왕` and `도림`.
- Kyoto battle starts with `노부나가` and `겐신`.
- No missing hero, roster, skill, portrait, or cut-in errors appear.

## Manual Battle
- Player can select units.
- Player can move, choose facing, attack, use skill, use strategy, defend, and wait.
- Player-side unique skill cut-ins appear.
- Yi Sun-sin `학익진 포격` works.
- Jeong Do-jeon `개혁령` works.
- Victory result image and `승리` overlay appear.
- Defeat result image and `패배` overlay appear.
- Battle returns to world map after result sequence.

## Auto Battle
- Auto battle progresses without stalling.
- Support/strategy heroes move toward combat when no useful skill is available.
- Gwanggaeto uses `영락대업` when at least one living ally lacks active attack buff.
- Dorim uses `흑백이간` when a collision target exists.
- Yi Sun-sin attacks or uses `학익진 포격` instead of false waiting when enemies are in range.
- Hanseong, Luoyang, Pyongyang, and Kyoto auto battles resolve.

## Unique Skill Cut-ins
- Player-side cut-ins show image, skill name, quote, and effect text.
- Enemy-side cut-ins show image, skill name, quote, and effect text.
- Auto-battle player cut-ins show image, skill name, quote, and effect text.
- Quote appears around visual center, slightly below center.
- Skill name and effect text remain lower center.
- Skill title uses Gothic/sans-serif.
- Quote uses `궁서` / brush-style.
- Effect text uses smaller Gothic/sans-serif.
- Cut-in duration feels readable at `2200ms`.
- Cut-in text disappears with the cut-in.
- Existing cut-in images are unchanged.

## v0.3-7a Coordinate Adapter QA
- [x] Hanseong/Luoyang/Pyongyang/Kyoto battles enter normally.
- [x] Unit positions look unchanged.
- [x] Move highlights align with tiles.
- [x] Attack/skill/strategy highlights align with tiles.
- [x] Facing selection highlights align with tiles.
- [x] Unit click, enemy click, and skill target click still work.
- [x] Status icons still appear in the correct position.
- [x] Bottom status legend still appears.
- [x] Unique skill cut-ins still work.
- [x] Victory/defeat result flow still returns to world map.
- [x] Manual browser QA passed.
- Future regression reminder: any future battle rendering work must use the coordinate adapter instead of hard-coded grid-to-screen math.

## Skill Text Checks
- `학익진 포격`: `사정거리 안 모든 적을 포격하라!`, `(사정범위 내 모든 적 공격)`
- `개혁령`: `나의 계책! 아군의 공격력을 단숨에 끌어올렸다!`, `(아군 공격력 상승)`
- `삼단격`: `화승총 사격의 매운 맛을 보여주마!`, `(사정범위 내 적 공격)`
- `차륜전`: `돌격! 적진을 때려부숴라!`, `(적진 돌파 공격)`
- `언월참`: `내 앞을 가로막는 자! 목을 내놓아라!`, `(강력한 단일 공격)`
- `장판파열`: `음하하~ 내 고함 한 방에 쩔쩔들 매는군!`, `(주변 적 동요)`
- `영락대업`: `전군이여! 나를 믿고 따르라!`, `(아군 공격력 상승)`
- `흑백이간`: `내 비책! 서로를 죽일 것이다!`, `(적 충돌 · 혼란/동요)`

## Status Icons And Legend
- `🌀` appears for confusion.
- `⚠` appears for shake.
- `▲` appears for active attack buff.
- `◆` appears when `unit.isDefending === true`.
- `◆` disappears when defense resets on the next relevant turn start.
- Multiple icons can display together.
- Unit click/targeting still works.
- Bottom legend appears in one line:
  - `상태: 🌀 혼란 · ⚠ 동요 · ◆ 방어 · ▲ 공↑ · ▼ 공↓ · ✖ 기절 · 🔥 화상 · ☠ 중독 · ! 도발 · ⛓ 속박`
- Legend is explanatory only; future statuses do not appear on units unless active state exists.

## Result Overlay
- Victory image appears unchanged.
- Defeat image appears unchanged.
- `승리` result text appears above victory image.
- `패배` result text appears above defeat image.
- Result timing still follows existing result flow and music duration.

## Regression Checks
- World map remains usable after battle return.
- City ownership transfer still works.
- Luoyang-Pyongyang route remains connected.
- Existing portraits and battlefield badges load.
- No console errors.
- No image assets are modified during UI text tasks.
