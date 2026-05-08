# Current State

## Status
- Current Version: `v0.4-3 Stable`
- Stable baseline name: `Region-Based Hero Control + Directional Battle Spawn + Hero Transfer MVP`
- Status: `Stable 4-city / 8-hero PC web MVP baseline with region-based hero stationing, conquest recruitment, directional battle spawn, and hero transfer completed. Manual browser QA passed.`
- Main loop: world map -> hero deployment -> battle -> victory/defeat result -> world map return

## Design Identity
- SamWar_web is currently a region-based hero strategy game.
- The player controls regions, not a permanent ruler character.
- The player acts as the king/state will.
- Heroes are assets stationed in regions and can be moved between owned regions.
- A city owner controls heroes stationed in that city.
- This is not currently a ruler/character-selection game like classic Romance of the Three Kingdoms.

## Current Core Gameplay Loop
1. Select player-owned region.
2. Attack adjacent enemy region.
3. Win battle.
4. Capture city.
5. Stationed enemy heroes switch to player side.
6. Heroes remain stationed in conquered city.
7. Player can transfer heroes between player-owned cities.
8. Deployment candidates come from the selected origin city's stationed heroes.
9. Battle spawn direction follows world-map city direction.

## Current 4-City MVP
- Hanseong: player-owned at fresh start, initial defenders `이순신`, `정도전`
- Luoyang: enemy-owned at fresh start, initial defenders `관우`, `장비`
- Pyongyang: enemy-owned at fresh start, initial defenders `광개토대왕`, `도림`
- Kyoto: enemy-owned at fresh start, initial defenders `노부나가`, `겐신`

## Region-Based Hero Control
- Runtime hero ownership uses `hero.side`.
- Runtime hero stationing uses `hero.locationCityId`.
- Initial `locationCityId` values are initialized from `battleRosters.cityDefenderRosters`.
- Deployment candidates are no longer hardcoded to Hanseong.
- Player attack deployment candidates come from:
  - `hero.side === "player" && hero.locationCityId === originCityId`
- Selecting a player-owned city stores it as `selection.originCityId`.
- Clicking an enemy city preserves the previous selected origin.
- Attack choice prefers a valid selected origin when it is player-owned and adjacent to the target.
- Fallback still finds a valid adjacent player-owned city if the selected origin is invalid.

## Conquest Recruitment
- When a city is conquered, heroes stationed in that city switch to the conquering faction.
- `recruitCityHeroesToFaction(cityId, factionId)` delegates to `convertCityHeroesToFaction(cityId, factionId)`.
- Captured heroes remain stationed in the conquered city.
- Example player conquest:
  - Luoyang captured -> `관우` / `장비` become `side: "player"` and remain `locationCityId: "luoyang"`.
  - Pyongyang captured -> `광개토대왕` / `도림` become `side: "player"` and remain `locationCityId: "pyeongyang"`.
- Example enemy conquest:
  - Hanseong captured by enemy -> `이순신` / `정도전` become `side: "enemy"` and remain `locationCityId: "hanseong"`.
- No loyalty, persuasion, chance, escape, execution, or recruitment UI exists yet.

## Hero Transfer
- Player can transfer heroes between player-owned cities.
- Transfer is instant.
- No turn cost, troop transfer, food cost, travel time, fatigue, loyalty, persuasion, governor/chancellor, or domestic-affairs integration.
- Transfer helpers:
  - `getTransferableHeroesFromCity(cityId, factionId)`
  - `getFactionOwnedDestinationCities(cities, factionId, excludeCityId)`
  - `transferHeroToCity(heroId, targetCityId, cities, factionId)`
- App state actions:
  - `openHeroTransfer(appState, sourceCityId)`
  - `cancelHeroTransfer(appState)`
  - `selectHeroTransferHero(appState, heroId)`
  - `selectHeroTransferTargetCity(appState, targetCityId)`
  - `confirmHeroTransfer(appState, heroId, targetCityId)`
- UI:
  - selected city panel button: `무장 이동`
  - centered hero transfer modal via `renderHeroTransferPanel()`
  - selectable source-city heroes
  - selectable player-owned destination cities

## Selected City Stationed Heroes UI
- Selected city panel shows `주둔 무장`.
- Displays all heroes whose `hero.locationCityId === selectedCity.id`.
- Uses portrait thumbnails when available.
- Empty state: `주둔 무장 없음`.
- Reinforces conquest, recruitment, and transfer results on the world map.

## Battle Spawn Direction
- Battle spawn positions are no longer decided by hero ID.
- `buildBattleUnit(heroId, spawnPosition, facing)` uses role-based spawn data.
- Helpers:
  - `getBattleSpawnSides(attackerCity, defenderCity)`
  - `getFacingForBattleSide(side)`
  - `getSpawnSlot(side, index)`
- Spawn direction follows world-map city x positions:
  - attacker city right of defender city -> attacker right / defender left
  - attacker city left of defender city -> attacker left / defender right
  - fallback -> attacker left / defender right
- Player is not assumed to always spawn left.
- Enemy is not assumed to always spawn right.

## Ally Attack Buff Labels And Logs
- Ally attack buff unit-card/status labels are source-skill based.
- Status fields:
  - `buffAttackSourceSkillId`
  - `buffAttackSourceSkillName`
- `개혁령` displays as `개혁령 효과 +15% · 2턴`.
- `영락대업` displays as `영락대업 효과 +20% · 2턴`.
- Future `effectType: "ally_attack_buff"` skills should display their own skill names.
- `getAllyAttackBuffOpeningLog(casterUnit, skill)` is generic.
- Current battle-log format:
  - `${casterUnit.name}: ${skill.name} 발동. 아군 공격력 +${buffPercent}% · ${duration}턴`

## Implemented Systems
- 14x8 Phaser battlefield.
- Manual battle and auto battle.
- World-map attack and defense battle choices.
- City ownership transfer after battle results.
- Explicit city defender rosters.
- Region-based hero ownership/stationing.
- Conquest hero recruitment by city stationing.
- Hero transfer between player-owned cities.
- Selected city stationed heroes display.
- Hero roster portraits and battlefield portrait badges.
- Unique skill cut-ins for all 8 MVP heroes.
- Victory/defeat result cut-in images and result music.
- Victory/defeat result text overlays.
- Pyongyang hero data, skills, roster, and visual asset wiring.
- Status icon overlay on battlefield units.
- One-line status legend at bottom of battle screen.
- Battle coordinate adapter prep for future larger battlefields and 2.5D/isometric projection.
- Centralized grid-to-screen rendering conversion in battle scene.
- Battle render layer prep with named Phaser render layers.
- Terrain data scaffold with default plain `terrainMap` attached to battle state.
- Action presentation helper scaffold for future animation/SFX/camera/effect sequencing.
- Floating effect rendering now reads through presentation-facing helper methods.
- Duplicate floating text prevention remains preserved.
- Presentation effects mini pass for clearer floating battle feedback.
- Subtle hit knockback reaction for damage effects.
- Hit knockback is render-only and does not change unit grid position.
- Centered hero deployment modal.
- `selectedHeroIds`-based attacker roster for attack battles.
- Enemy AI move-then-act flow.

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

## Terrain Data
- `terrainTypes` are defined in `data/battle_terrain.js`.
- `terrainMap` is attached in `createInitialBattleState()`.
- All current MVP battle tiles default to `"plain"`.
- Terrain currently has no gameplay or visual effect.
- Do not activate terrain rules until a dedicated terrain patch.

## Visual Decisions To Preserve
- Cut-in/result image assets are not edited for text.
- Text overlays remain removable DOM UI.
- Skill title font: Gothic/sans-serif.
- Skill quote font: `궁서`, `Gungsuh`, `Batang`, serif.
- Skill effect font: smaller Gothic/sans-serif.
- Quote position: visual center, slightly below center.
- Skill title/effect position: lower center.
- Do not casually change Phaser render config, texture filtering, `pixelArt`, `roundPixels`, or mipmap settings.

## Next Direction
- Next recommended milestone: `v0.5-0 Domestic Affairs Scaffold`.
- v0.5-0 should be a replaceable scaffold, not the final domestic system.
- Later domestic affairs may add:
  - chancellor
  - governor/city lord
  - chancellor-governor compatibility
  - city management efficiency
  - resource income cycles
- Do not implement troop allocation, troop loss persistence, terrain effects, or unit type selection before the relevant dedicated tasks.
