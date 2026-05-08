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

## v0.3-7c Terrain Data Scaffold QA
- [x] Hanseong/Luoyang/Pyongyang/Kyoto battles enter normally.
- [x] Unit positions look unchanged.
- [x] Move/attack/skill/strategy highlights still align with tiles.
- [x] Movement range and pathing behave exactly as before.
- [x] Damage and defense behavior are unchanged.
- [x] Auto battle behaves as before.
- [x] Status icons and bottom legend still appear.
- [x] Unique skill cut-ins still work.
- [x] Victory/defeat result flow still returns to world map.
- [x] No visible terrain UI appears yet.
- [x] Manual browser QA passed.
- Future regression reminder: `terrainMap` is currently inactive and must not affect movement, pathing, damage, defense, AI, or targeting until a dedicated terrain rules patch.

## v0.3-7d Action Presentation QA
- [x] Hanseong/Luoyang/Pyongyang/Kyoto battles enter normally.
- [x] Normal attack floating damage/effect text still appears.
- [x] Skill floating damage/effect text still appears.
- [x] Strategy/failure/status floating text still appears if applicable.
- [x] Duplicate floating text does not replay unexpectedly on redraw.
- [x] Target flash/shake behavior still works.
- [x] Unique skill cut-ins still work.
- [x] Auto battle still progresses.
- [x] Victory/defeat result flow still returns to world map.
- [x] No visible presentation timing change was introduced.
- [x] Manual browser QA passed.
- Future regression reminder: future presentation work should use action presentation helpers and must not directly scatter `lastAction` parsing across render code.

## v0.3-7e Presentation Effects QA
- [x] Hanseong/Luoyang/Pyongyang/Kyoto battles enter normally.
- [x] Normal attack floating damage text appears and is clearer.
- [x] Skill floating damage/effect text appears.
- [x] Buff/status/failure text appears if applicable.
- [x] Duplicate floating text does not replay unexpectedly on redraw.
- [x] Target flash/shake still works.
- [x] Unique skill cut-ins still work.
- [x] Auto battle still progresses.
- [x] Victory/defeat result flow still returns to world map.
- [x] No SFX/camera/projectile/timing system was added.
- [x] Manual browser QA passed.

## v0.3-7f Hit Knockback QA
- [x] Hanseong/Luoyang/Pyongyang/Kyoto battles enter normally.
- [x] Normal attack damage text still appears.
- [x] Damaged target briefly moves backward and returns to original rendered position.
- [x] Knockback direction roughly follows attacker-to-target direction.
- [x] Skill damage also triggers subtle knockback when damage effect exists.
- [x] Buff-only effects do not knock back units.
- [x] Duplicate knockback does not replay unexpectedly on redraw.
- [x] Unit positions and click hit zones remain normal after knockback.
- [x] Auto battle still progresses.
- [x] Unique skill cut-ins still work.
- [x] Victory/defeat result flow still returns to world map.
- [x] No actual unit grid position changes occur.
- [x] Manual browser QA passed.
- Future regression reminder: hit knockback is presentation-only and must never modify `unit.x`/`unit.y` or battle movement state.

## v0.4-0 Hero Deployment Flow QA
- [x] From world map, choosing an enemy city/invasion opens deployment screen instead of entering battle immediately.
- [x] Deployment screen shows target city name.
- [x] Deployment screen shows `이순신` and `정도전`.
- [x] Hero portrait/name/stats/skill/troop info appear if available.
- [x] Selecting both heroes starts battle with both.
- [x] Selecting only `이순신` starts battle with only `이순신`.
- [x] Selecting only `정도전` starts battle with only `정도전`.
- [x] Start battle is blocked when no hero is selected.
- [x] Cancel returns to world map.
- [x] Enemy defenders still match target city roster.
- [x] Battle starts normally after deployment.
- [x] City ownership transfer still works as before.
- [x] No defeated enemy heroes are recruited yet.
- [x] Manual browser QA passed.

## v0.4-0a Deployment Modal Layout QA
- [x] Deployment UI appears as a centered modal overlay.
- [x] Right HUD no longer gets pushed down.
- [x] Modal shows player hero candidates.
- [x] Hero cards are selectable/deselectable.
- [x] Start Battle and Cancel buttons work.
- [x] Battle starts with selected heroes.
- [x] Manual browser QA passed.

## v0.4-0b Enemy Move-Then-Act AI QA
- [x] Enemy unit can move toward a player unit and then attack in the same enemy turn if target is in range.
- [x] Enemy unit can move and then use a valid unique skill in the same enemy turn if conditions are met.
- [x] Enemy unit can move and then use a valid strategy in the same enemy turn if conditions are met.
- [x] Enemy unit does not move twice in the same turn.
- [x] Enemy unit waits only when no valid follow-up action exists.
- [x] Enemy turn does not get stuck.
- [x] Auto battle still progresses.
- [x] Enemy skill cut-ins still appear when enemy uses unique skills.
- [x] Floating damage/effect text still appears.
- [x] Hit knockback still works.
- [x] Victory/defeat result flow still returns to world map.
- [x] Hero deployment flow still works.
- [x] Manual browser QA passed.
- Future regression reminder: enemy movement must not set `hasActed=true` by itself.
- Future regression reminder: movement uses `hasMoved=true`; attack/skill/strategy/wait consumes `hasActed=true`.

## v0.4-1 Victory Hero Recruitment QA
- [x] After conquering Luoyang, Luoyang `ownerFactionId` becomes `player`.
- [x] After conquering Luoyang, `관우` and `장비` become `side: "player"`.
- [x] After conquering Pyongyang, `광개토대왕` and `도림` become `side: "player"`.
- [x] After conquering Kyoto, `노부나가` and `겐신` become `side: "player"`.
- [x] No recruitment happens on player defeat.
- [x] Re-processing an already player-owned city does not duplicate heroes or throw errors.
- [x] Manual battle still works.
- [x] Auto battle still works.
- [x] Victory/defeat world map return still works.
- Future regression reminder: `recruitCityHeroesToFaction(cityId, factionId)` must remain city/faction generic and must not hardcode Luoyang or specific heroes.

## v0.4-2 Region-Based Hero Control QA
- [x] Fresh Hanseong player heroes are `이순신` / `정도전`.
- [x] Player attacks Luoyang from Hanseong: deployment shows `이순신` / `정도전`.
- [x] Player conquers Luoyang: `관우` / `장비` become `side: "player"` and `locationCityId: "luoyang"`.
- [x] If player attacks from Luoyang, deployment shows `관우` / `장비`.
- [x] If Kyoto captures Hanseong, `이순신` / `정도전` become `side: "enemy"` and `locationCityId: "hanseong"`.
- [x] After Hanseong is lost and player owns only Luoyang, attacking Hanseong from Luoyang shows `관우` / `장비`, not `이순신` / `정도전`.
- [x] No hardcoded Hanseong deployment remains.
- [x] Manual battle still works.
- [x] Auto battle still works.
- [x] Victory/defeat world map return still works.
- Future regression reminder: deployment candidates must come from `hero.side` plus `hero.locationCityId`, not the original city roster alone.

## v0.4-2a Buff Source Label + Selected Attack Origin QA
- [x] `개혁령` displays as `개혁령 효과 +15% · 2턴` only on allied units affected by Jeong Do-jeon.
- [x] `영락대업` displays as `영락대업 효과 +20% · 2턴` only on allied units affected by Gwanggaeto.
- [x] Enemy units no longer show `개혁령 효과` when they were actually buffed by `영락대업`.
- [x] Hanseong -> Pyongyang conquest still works.
- [x] After conquering Pyongyang, clicking Pyongyang first and then Luoyang uses Pyongyang as origin.
- [x] Deployment modal shows origin city: Pyongyang.
- [x] Deployment candidates are `광개토대왕` / `도림`, not `이순신` / `정도전`.
- [x] If selected origin is invalid, fallback still allows attack from a valid adjacent player-owned city.
- [x] Manual battle still works.
- [x] Auto battle still works.
- [x] Victory/defeat world map return still works.
- Future regression reminder: future `ally_attack_buff` skills must use actual `skill.id` and `skill.name` for source status labels.

## v0.4-2b Generic Ally Buff Battle Log QA
- [x] Jeong Do-jeon's `개혁령` battle log uses actor and skill data dynamically.
- [x] Gwanggaeto's `영락대업` battle log uses actor and skill data dynamically.
- [x] Future ally attack buff skills do not fall back to `정도전이 개혁령을 선포했습니다.`
- [x] Unit card buff labels remain source-based.
- [x] Manual battle still works.
- [x] Auto battle still works.
- Future regression reminder: `getAllyAttackBuffOpeningLog(casterUnit, skill)` must not hardcode hero names, skill names, or skill IDs.

## v0.4-2c Battle Spawn Direction QA
- [x] Hanseong -> Pyongyang battle: attacker Hanseong side spawns left.
- [x] Hanseong -> Pyongyang battle: defender Pyongyang side spawns right.
- [x] Pyongyang -> Luoyang battle: attacker Pyongyang side spawns right.
- [x] Pyongyang -> Luoyang battle: defender Luoyang side spawns left.
- [x] Units do not overlap.
- [x] Units face each other.
- [x] Enemy invasion defense battle spawns attacker/defender on opposite sides.
- [x] Player is not assumed to always be left.
- [x] Enemy is not assumed to always be right.
- [x] Manual battle still works.
- [x] Auto battle still works.
- [x] Skill targeting still works.
- [x] Buff labels/logs still work.
- [x] Victory/defeat world map return still works.
- Future regression reminder: hero ID must not decide battlefield left/right spawn side.

## v0.4-3 Hero Transfer QA
- [x] Player owns only Hanseong at fresh start: transfer button is hidden or disabled.
- [x] Player conquers Luoyang: `관우` / `장비` are stationed in Luoyang.
- [x] Select Luoyang: `무장 이동` button appears.
- [x] Open transfer modal: `관우` / `장비` are listed as transferable heroes.
- [x] Hanseong appears as a destination city.
- [x] Transfer `관우` from Luoyang to Hanseong.
- [x] Select Hanseong -> attack an enemy city: deployment candidates include `이순신` / `정도전` / `관우`.
- [x] Select Luoyang -> attack an enemy city: deployment candidates include `장비`, not `관우`.
- [x] Enemy-owned cities are not valid destinations.
- [x] Enemy-side heroes cannot be transferred.
- [x] Cancel button closes modal without changing hero location.
- [x] 3-hero deployment and battle entry work.
- [x] Manual battle still works.
- [x] Auto battle still works.
- [x] Victory/defeat world map return still works.
- [x] Directional battle spawn still works after transfer.
- Future regression reminder: transfer validation must live in helper/state logic, not only UI controls.

## v0.4-3a Selected City Stationed Heroes UI QA
- [x] Hanseong at fresh start shows `이순신` / `정도전`.
- [x] After conquering Luoyang, Luoyang shows `관우` / `장비`.
- [x] After transferring `관우` to Hanseong, Hanseong shows `이순신` / `정도전` / `관우`.
- [x] Luoyang then shows `장비` only.
- [x] UI remains readable and does not break the selected city panel.
- Future regression reminder: selected city stationed heroes display should read current mutable `hero.locationCityId`, not static initial rosters.

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
