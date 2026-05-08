# Changelog

## v0.4-3 Stable Region-Based Hero Control + Directional Battle Spawn + Hero Transfer MVP
- Closed the v0.4 region-based hero-control line as the current stable baseline.
- SamWar_web is now documented as a region-based hero strategy MVP:
  - The player controls regions, not a permanent ruler character.
  - Heroes are stationed in regions through `hero.locationCityId`.
  - A city owner controls heroes stationed in that city.
- Current core loop:
  1. Select player-owned region.
  2. Attack adjacent enemy region.
  3. Win battle.
  4. Capture city.
  5. Stationed enemy heroes switch to player side.
  6. Heroes remain stationed in conquered city.
  7. Player can transfer heroes between player-owned cities.
  8. Deployment candidates come from the selected origin city's stationed heroes.
  9. Battle spawn direction follows world-map city direction.
- Manual QA confirmed v0.4-3 as stable.

## v0.4-3a Selected City Stationed Heroes UI
- Selected city panel now shows stationed heroes under `주둔 무장`.
- Uses mutable runtime hero state:
  - `hero.side`
  - `hero.locationCityId`
- Shows all heroes stationed in the selected city.
- Uses portrait thumbnails when available.
- Empty state: `주둔 무장 없음`.
- Reinforces conquest, recruitment, and hero transfer results in the world map UI.
- No battle, transfer, recruitment, deployment, AI, balance, render, terrain, or asset changes.

## v0.4-3 Hero Transfer MVP
- Added instant hero transfer between player-owned cities.
- Transfer rules:
  - Only player-side heroes can be transferred.
  - Heroes can move only from a player-owned city.
  - Heroes can move only to another player-owned city.
  - Transfer is instant.
  - No turn cost, troop transfer, food cost, travel time, fatigue, loyalty, persuasion, governor/chancellor, or domestic-affairs integration.
- Added helpers:
  - `getTransferableHeroesFromCity(cityId, factionId)`
  - `getFactionOwnedDestinationCities(cities, factionId, excludeCityId)`
  - `transferHeroToCity(heroId, targetCityId, cities, factionId)`
- Added app state actions:
  - `openHeroTransfer(appState, sourceCityId)`
  - `cancelHeroTransfer(appState)`
  - `selectHeroTransferHero(appState, heroId)`
  - `selectHeroTransferTargetCity(appState, targetCityId)`
  - `confirmHeroTransfer(appState, heroId, targetCityId)`
- Added UI:
  - `renderHeroTransferPanel()`
  - selected city panel button: `무장 이동`
  - centered modal for hero transfer
  - selectable source-city heroes
  - selectable player-owned destination cities
- Manual QA confirmed:
  - After conquering Luoyang, `관우` / `장비` are stationed in Luoyang.
  - `관우` can be transferred from Luoyang to Hanseong.
  - Hanseong deployment then shows `이순신` / `정도전` / `관우`.
  - Luoyang deployment no longer shows `관우`.
  - 3-hero deployment and battle entry work.
  - Region-based battle spawn still works after transfer.

## v0.4-2c Battle Spawn Direction Fix
- Battle spawn positions are no longer determined by hero ID.
- `buildBattleUnit(heroId, spawnPosition, facing)` now uses provided role-based spawn data.
- Added helpers:
  - `getBattleSpawnSides(attackerCity, defenderCity)`
  - `getFacingForBattleSide(side)`
  - `getSpawnSlot(side, index)`
- Spawn direction follows world-map city x positions:
  - attacker city right of defender city -> attacker right / defender left
  - attacker city left of defender city -> attacker left / defender right
  - fallback -> attacker left / defender right
- Player is no longer assumed to always spawn left.
- Enemy is no longer assumed to always spawn right.
- Manual QA confirmed:
  - Hanseong -> Pyongyang: attacker left / defender right
  - Pyongyang -> Luoyang: attacker right / defender left
  - units do not overlap
  - units face each other

## v0.4-2b Generic Ally Buff Battle Log Fix
- Generalized `getAllyAttackBuffOpeningLog(casterUnit, skill)`.
- Removed hardcoded Jeong Do-jeon, `개혁령`, `영락대업`, and `yeongnak_grand_legacy` battle-log text.
- Final log format:
  - `${casterUnit.name}: ${skill.name} 발동. 아군 공격력 +${buffPercent}% · ${duration}턴`
- Uses actual actor and skill data.
- Percent is calculated from `skill.buffAttackBonus`.
- Duration is read from `skill.duration`.

## v0.4-2a Buff Source Label + Selected Attack Origin Fix
- Ally attack buff status labels now use source skill names.
- Added status fields:
  - `buffAttackSourceSkillId`
  - `buffAttackSourceSkillName`
- `정도전` / `개혁령` displays as `개혁령 효과 +15% · 2턴`.
- `광개토대왕` / `영락대업` displays as `영락대업 효과 +20% · 2턴`.
- Future `effectType: "ally_attack_buff"` skills should display their own skill name.
- Added `selection.originCityId`.
- Selecting a player-owned city stores it as preferred attack origin.
- Clicking an enemy city preserves the previous selected origin.
- If selected origin is valid and adjacent, attack starts from that city.
- Fallback still finds a valid adjacent player-owned city if selected origin is invalid.

## v0.4-2 Region-Based Hero Control MVP
- Added runtime `hero.locationCityId` support.
- Initial hero locations are initialized from `battleRosters.cityDefenderRosters`.
- Deployment candidates are no longer hardcoded to Hanseong.
- Player attack deployment candidates now come from:
  - `hero.side === "player" && hero.locationCityId === originCityId`
- If a city is captured, stationed heroes switch to the conquering faction and remain in that city.
- If Hanseong is captured by enemy, `이순신` / `정도전` become enemy-side and stay in Hanseong.
- If Pyongyang is conquered by player, `광개토대왕` / `도림` become player-side and stay in Pyongyang.

## v0.4-1 Victory Hero Recruitment MVP
- When a city is conquered, heroes stationed in that city switch to the conquering faction.
- Added `recruitCityHeroesToFaction(cityId, factionId)`.
- `recruitCityHeroesToFaction()` now delegates to `convertCityHeroesToFaction(cityId, factionId)`.
- Enemy city heroes automatically become player-side after player conquest.
- No loyalty, persuasion, chance, escape, execution, or recruitment UI yet.

## v0.4-0b Enemy Move-Then-Act AI Fix
- Fixed enemy move actions incorrectly consuming the unit action.
- Enemy movement now sets `hasMoved=true` while preserving `hasActed=false`.
- Enemy AI can now move and then attack/use skill/use strategy in the same enemy turn.
- Added post-move AI action branch: high-value skill, attack, fallback skill, strategy, wait.
- Prevented repeated movement after `hasMoved=true`.
- Added safety fallback for failed move actions.
- No movement range, pathfinding, damage, skills, balance, terrain, deployment, presentation, hit knockback, cut-ins, assets, or render config changes.
- `node --check` passed for `js/core/battle_ai.js` and `js/core/battle_rules.js`.
- Manual browser QA passed.

## v0.4-0a Hero Deployment Center Modal Layout
- Moved hero deployment UI out of the right HUD stack into a centered modal overlay.
- Added modal/backdrop layout for hero deployment.
- Right HUD no longer gets pushed down by deployment content.
- Preserved `selectedHeroIds`/`startBattle` flow.
- No battle logic, AI, balance, skills, terrain rules, hit knockback, cut-ins, result overlays, assets, troop allocation, recruitment, relocation, or render config changes.
- `node --check js/ui/world_map_ui.js` passed.
- Manual browser QA passed.

## v0.4-0 Hero Deployment Flow MVP
- Added hero deployment screen before invasion battles.
- World-map attack now opens deployment instead of entering battle immediately.
- Player attacker candidates are derived from Hanseong roster.
- Player can select `이순신`, `정도전`, or both.
- `selectedHeroIds` are passed into battle initialization.
- Attack battle player units now use selected attacker heroes.
- Defender roster behavior remains unchanged.
- Existing battle presentation, hit knockback, cut-ins, result flow, and city ownership transfer remain intact.
- No troop allocation, recruitment, relocation, terrain rules, AI, damage, assets, render config, or balance changes.
- `node --check` passed for modified JS files.
- Manual browser QA passed.

## v0.3-7f Hit Knockback Reaction
- Added subtle render-only hit knockback for damage effects.
- Added/used unit render group lookup for presentation-only target reactions.
- Knockback direction is based on attacker-to-target grid direction.
- Damaged targets briefly move backward and return to original rendered position.
- `unit.x` / `unit.y` and all battle logic remain unchanged.
- Knockback does not apply to buff-only effects.
- Duplicate replay prevention remains intact.
- No AI, damage, movement, skill data, cut-ins, result overlays, assets, SFX, camera shake, projectile effects, Phaser render config, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-7e Presentation Effects Mini Pass
- Polished floating effect readability.
- Improved small battle presentation feedback using existing `effectLayer` and action presentation helper flow.
- Preserved immediate rendering behavior and duplicate-prevention.
- No real animation queue, SFX, camera shake, projectile effects, delayed HP update, battle logic, AI, skill data, cut-in data, result overlay, asset, Phaser render config, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-7d Action Presentation Queue Review
- Added presentation-facing action helper methods in `js/phaser/battle_scene.js`.
- Added `getLastActionPresentation()`, `getActionPresentationSignature()`, `hasNewActionPresentation()`, `markActionPresentationRendered()`, `getActionPresentationEffects()`, `getActionPresentationTargets()`, and `getActionPresentationKind()`.
- Refactored `renderFloatingEffects()` to use action presentation helpers.
- Preserved immediate floating effect rendering behavior.
- Preserved duplicate floating text prevention.
- Confirmed unique skill cut-ins are triggered outside `battle_scene.js` through main/UI flow.
- No real animation queue, SFX, projectile effects, async sequencing, timing changes, battle logic, AI, skill data, cut-in data, result overlay, asset, Phaser render config, or balance changes.
- `node --check js/phaser/battle_scene.js` passed.
- Manual browser QA passed.

## v0.3-7c Terrain Data Scaffold
- Added `data/battle_terrain.js`.
- Added `terrainTypes` and terrain helper functions.
- Attached default `terrainMap` to initial battle state in `js/core/battle_state.js`.
- All current MVP battle tiles default to plain.
- Terrain data is currently inactive and has no gameplay or visual effect.
- No movement, pathing, defense, attack, AI, skill, cut-in, asset, Phaser render config, or balance changes.
- `node --check` passed for `data/battle_terrain.js` and `js/core/battle_state.js`.
- Manual browser QA passed.

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
