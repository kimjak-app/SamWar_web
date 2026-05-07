# Changelog

## v0.3-7a Battle Coordinate Adapter Prep
- Added/updated battle coordinate adapter methods in `js/phaser/battle_scene.js`.
- Centralized grid-to-screen conversion.
- Replaced direct coordinate math in battle backdrop, highlights, facing highlights, grid lines, and unit depth ordering.
- Prepared battle rendering for future larger battlefields and 2.5D/isometric projection.
- No battle logic, AI, skill data, cut-in data, assets, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-5a Pyongyang Hero Data & Skills
- Added Pyongyang defenders `광개토대왕` and `도림`.
- Added and connected Pyongyang battle roster.
- Added and implemented `영락대업` and `흑백이간`.
- Confirmed Pyongyang battle starts.
- Confirmed Hanseong, Luoyang, and Kyoto battles still initialize.

## v0.3-5b Pyongyang Visual Assets Wiring
- Connected `gwanggaeto` and `dorim` roster portraits.
- Connected `gwanggaeto` and `dorim` battlefield portraits.
- Connected Pyongyang skill cut-ins:
  - `assets/skill_cutins/gwanggaeto_yeongnak_grand_legacy.png`
  - `assets/skill_cutins/dorim_black_white_scheming.png`
- Confirmed asset paths and data wiring.

## v0.3-5c Auto Battle Support AI Engagement Fix
- Fixed support/strategy units stalling at range.
- Added movement/engagement fallback when no useful skill is available.
- Prevented units from waiting while attack or movement is possible.

## v0.3-5d Auto Battle Unique Skill Priority Rebalance
- Fixed overcorrection where units preferred basic attacks too strongly.
- Current priority:
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

## v0.3-5e Auto Battle Regression Fix
- Fixed ally-side unique skill cut-ins not appearing.
- Ally and enemy cut-ins now use the same activation pipeline.
- Fixed Yi Sun-sin auto battle no-op wait issue by ensuring `cannon_aoe` has a valid target.
- Added normal attack re-check guards before wait.

## v0.3-6a Status Effect Icon Overlay MVP
- Added battlefield status icons in `js/phaser/battle_scene.js`.
- Active icons:
  - 혼란 `🌀`
  - 동요 `⚠`
  - 공격력 상승 `▲`
- Overlay reads existing unit state only.

## v0.3-6b Status Icon Visual Polish + Future Icon Convention
- Polished status icon overlay with smaller font, lighter rounded background, and emoji-capable font.
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
- Added rule not to revert confusion icon to `혼` automatically.

## v0.3-6c Defense Status Icon
- Added `◆` icon when `unit.isDefending === true`.
- Defense logic and balance were not changed.

## v0.3-6d Status Icon Legend Bar
- Added one-line bottom-center status legend:
  - `상태: 🌀 혼란 · ⚠ 동요 · ◆ 방어 · ▲ 공↑ · ▼ 공↓ · ✖ 기절 · 🔥 화상 · ☠ 중독 · ! 도발 · ⛓ 속박`
- Legend is explanatory only.
- No new status logic was implemented.

## v0.3-6e Victory / Defeat Result Text Overlay
- Added removable DOM text overlay over existing victory/defeat result images.
- Victory text: `승리`.
- Defeat text: `패배`.
- Result images were not modified.

## v0.3-6f Result Text Size Up + Unique Skill Name Overlay
- Increased victory/defeat result text size.
- Added unique skill name overlay during cut-ins.
- Skill name is sourced from `skill.name`.
- Player-side, enemy-side, and player auto-battle cut-ins all receive skill names.

## v0.3-6g Result Text Size Polish + Skill Cut-in Typography/Subtitles
- Increased result title size again.
- Changed skill title typography to Gothic/sans-serif.
- Added initial short `cutinSubtitle` values to all 8 unique skills.

## v0.3-6h Skill Cut-in Quote / Effect Text Data Wiring
- Added explicit `cutinQuote` and `cutinEffectText` fields to all 8 unique skills.
- Renderer now displays:
  - `skill.name`
  - `skill.cutinQuote`
  - `skill.cutinEffectText`
- `description` remains unchanged and is not used as automatic cut-in fallback.

## v0.3-6i Skill Cut-in Quote Layout + Duration Polish
- Moved quote line to visual center, slightly below center.
- Kept skill title/effect text grouped at lower center.
- Quote uses `궁서` / brush-style font.
- Skill title and effect text use Gothic/sans-serif.
- Increased all unique skill cut-in durations from `1400ms` to `2200ms`.
- Added central unique skill fallback duration of `2200ms`.
