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

### v0.3-7a Battle Coordinate Adapter Prep
- Added `getGridWidth`/`getGridHeight`/`configureBattleView`/`gridToScreen`/`getTileCenter`/`getTileRect`/`getGridLineX`/`getGridLineY`/`getBoardCenter`/`getDepthForGridPosition`.
- Kept `getUnitPoint` as a wrapper around `gridToScreen`.
- Replaced repeated direct coordinate math in battle scene rendering.
- Added unit depth ordering preparation with `getDepthForGridPosition`.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed with no visible regressions.

### v0.3-7c Terrain Data Scaffold
- Added `data/battle_terrain.js`.
- Added `terrainTypes` for plain, forest, mountain, river, bridge, wall, and coast.
- Added helper functions for terrain lookup, plain terrain map creation, terrain map normalization, passability, move cost, and defense bonus access.
- Attached default plain `terrainMap` in `createInitialBattleState()`.
- Confirmed terrain has no gameplay or visual effect yet.
- Confirmed `node --check` passed for `data/battle_terrain.js` and `js/core/battle_state.js`.
- User manual browser QA passed with no visible regressions.

### v0.3-7d Action Presentation Queue Review
- Reviewed current action presentation flow.
- Confirmed `battleState.lastAction` feeds `renderFloatingEffects()`.
- Confirmed `buildActionSignature()` plus `lastRenderedActionSignature` prevents duplicate floating text on redraw.
- Confirmed `lastAction.effects` drives floating text content/style.
- Confirmed `lastAction.targetUnitIds` drives brief target flash/shake lookup.
- Confirmed unique skill cut-ins are triggered outside `battle_scene.js`, mainly through `js/main.js` and `js/ui/battle_ui.js`.
- Added action presentation helper methods.
- Refactored `renderFloatingEffects()` minimally to use helpers while preserving current immediate rendering behavior.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed with no visible regressions.

### v0.3-7e Presentation Effects Mini Pass
- Polished floating battle effect readability.
- Preserved current action presentation helper flow.
- Preserved immediate floating effect rendering and duplicate-prevention behavior.
- Confirmed no gameplay, AI, damage, skill, cut-in, asset, SFX, camera, projectile, or balance changes.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed.

### v0.3-7f Hit Knockback Reaction
- Added subtle hit knockback reaction for damage effects.
- Added/used render-only unit group lookup for target presentation feedback.
- Knockback direction follows attacker-to-target grid direction.
- Damaged unit briefly moves backward and returns to original rendered position.
- `unit.x` / `unit.y` remain unchanged.
- Buff-only effects do not trigger knockback.
- Duplicate replay prevention remains intact.
- Confirmed `node --check js/phaser/battle_scene.js` passed.
- User manual browser QA passed and confirmed the effect feels good.

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
1. v0.3-8a Visual Sharpness Pass Prep.
2. Visual Sharpness Safe Polish only after review.
3. Terrain Rule Design Only later.
4. SFX/audio, camera shake, projectile effects, and real animation queue later as dedicated patches.
5. 10-city / 20-hero expansion only after the 4-city / 8-hero MVP baseline stays stable.
