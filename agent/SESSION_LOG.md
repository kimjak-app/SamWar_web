# Session Log

## 2026-05-07

### v0.3-5a Pyongyang Hero Data & Skills
- Added Pyongyang defenders `광개토대왕` and `도림`.
- Added and connected Pyongyang roster.
- Added and implemented `영락대업` and `흑백이간`.
- Confirmed Pyongyang battle starts.
- Existing Hanseong, Luoyang, and Kyoto battles still initialize.

### v0.3-5b Pyongyang Visual Assets Wiring
- Connected hero portraits and battlefield portraits for `gwanggaeto` and `dorim`.
- Connected skill cut-ins:
  - `assets/skill_cutins/gwanggaeto_yeongnak_grand_legacy.png`
  - `assets/skill_cutins/dorim_black_white_scheming.png`
- Confirmed asset paths and data wiring.

### v0.3-5c / v0.3-5d Auto Battle AI Skill Priority Fixes
- Fixed support/strategy units stalling at range.
- Fixed overcorrection where units only used basic attacks.
- Current auto-battle priority:
  1. High-value unique skill
  2. Normal attack
  3. Move toward enemy
  4. Low-value fallback skill
  5. Strategy
  6. Wait
- `ally_attack_buff` is high-value if at least one living ally lacks active attack buff.
- `enemy_collision_confuse` is high-value if primary target has nearby secondary enemy.
- Confirmed Dorim uses `흑백이간` when collision target exists.
- Confirmed Gwanggaeto uses `영락대업` meaningfully.
- Existing Luoyang/Kyoto unique skill usage still works.

### v0.3-5e Auto Battle Regression Fix
- Fixed ally-side unique skill cut-ins not appearing.
- Fixed Yi Sun-sin waiting/no-op issue caused by `cannon_aoe` returning `targetUnitId: null`.
- Yi Sun-sin now provides a valid target for `학익진 포격`.
- Added normal attack re-check guards before wait.
- Confirmed player and enemy cut-ins use the same activation path.

### v0.3-6a / v0.3-6b Status Effect Icon Overlay
- Added battlefield unit status icons in `js/phaser/battle_scene.js`.
- Active icons:
  - 혼란 `🌀`
  - 동요 `⚠`
  - 공격력 상승 `▲`
- Polished visual style:
  - lighter background
  - smaller font
  - rounded/subtle overlay
  - emoji-capable font
- Documented future icon convention:
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

### v0.3-6c Defense Status Icon
- Added `◆` icon when `unit.isDefending === true`.
- Preserved existing defense behavior:
  - `isDefending` reduces incoming basic attack damage.
  - `isDefending` clears on next side turn start.
- No defense logic or balance changed.

### v0.3-6d Status Legend Bar
- Added one-line centered status legend at the bottom of the battle screen.
- Legend text:
  - `상태: 🌀 혼란 · ⚠ 동요 · ◆ 방어 · ▲ 공↑ · ▼ 공↓ · ✖ 기절 · 🔥 화상 · ☠ 중독 · ! 도발 · ⛓ 속박`
- Legend is explanatory only.
- No new statuses were implemented.

### v0.3-6e / v0.3-6f / v0.3-6g / v0.3-6h / v0.3-6i Battle Presentation Polish
- Added victory/defeat result text overlays.
- Increased victory/defeat result text size.
- Added unique skill cut-in text overlay:
  - `skill.name`
  - `skill.cutinQuote`
  - `skill.cutinEffectText`
- Added `cutinQuote` and `cutinEffectText` to all 8 unique skills.
- Skill title uses Gothic/sans-serif.
- Quote uses `궁서` / brush-style.
- Effect text uses smaller Gothic/sans-serif.
- Quote layout changed:
  - quote appears at image center, very slightly below center
  - skill name/effect text remain lower center
- Increased unique skill cut-in duration to `2200ms`.
- Images are not modified; text is overlay only.

### Current Unique Skill Cut-in Text
- `hakikjin_barrage` / `학익진 포격`: `사정거리 안 모든 적을 포격하라!`, `(사정범위 내 모든 적 공격)`
- `reform_order` / `개혁령`: `나의 계책! 아군의 공격력을 단숨에 끌어올렸다!`, `(아군 공격력 상승)`
- `matchlock_volley` / `삼단격`: `화승총 사격의 매운 맛을 보여주마!`, `(사정범위 내 적 공격)`
- `cavalry_charge` / `차륜전`: `돌격! 적진을 때려부숴라!`, `(적진 돌파 공격)`
- `crescent_blade_slash` / `언월참`: `내 앞을 가로막는 자! 목을 내놓아라!`, `(강력한 단일 공격)`
- `changban_shatter` / `장판파열`: `음하하~ 내 고함 한 방에 쩔쩔들 매는군!`, `(주변 적 동요)`
- `yeongnak_grand_legacy` / `영락대업`: `전군이여! 나를 믿고 따르라!`, `(아군 공격력 상승)`
- `black_white_scheming` / `흑백이간`: `내 비책! 서로를 죽일 것이다!`, `(적 충돌 · 혼란/동요)`

### Manual Asset Cleanup Note
- Several cut-in images were manually cleaned so brushstroke edges no longer look rectangular/cropped.
- White/dirty background residue was removed from assets.
- Existing asset paths should remain unchanged.
- User may overwrite PNGs manually later.

### Next TODO
1. Final browser QA for latest v0.3-6i cut-in quote layout and `2200ms` duration.
2. Tune duration to `2000-2400ms` if needed.
3. Later audio pass for unique SFX and possible voice generation from `cutinQuote`.
4. Later visual sharpness pass before 10-city / 20-hero expansion.
5. Expand to 10 cities / 20 heroes only after 4-city / 8-hero MVP function set stabilizes.
