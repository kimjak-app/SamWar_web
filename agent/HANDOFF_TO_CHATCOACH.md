# SamWar_web Handoff - After v0.3-7f

Current stable baseline: `v0.3-7f Hit Knockback Reaction`.

The 4-city / 8-hero PC web MVP loop is stable at the data and presentation level:
world map -> battle -> victory/defeat result -> world map return.

## Current 4-City MVP
- Hanseong: player, `이순신`, `정도전`
- Luoyang: enemy, `관우`, `장비`
- Pyongyang: enemy, `광개토대왕`, `도림`
- Kyoto: enemy, `노부나가`, `겐신`

## Completed Since v0.3-5a
- Pyongyang heroes, roster, skills, and visual assets are wired.
- `영락대업` and `흑백이간` are implemented.
- Auto battle no longer stalls with support/strategy units.
- Unique-skill AI priority now favors high-value skills without returning to range-kiting stalls.
- Ally and enemy cut-ins use the same activation path.
- Yi Sun-sin `학익진 포격` no longer becomes a no-op wait in auto battle.
- Battlefield status icons and a bottom legend are implemented.
- Defense state now shows `◆`.
- Victory/defeat result text overlays are DOM-rendered over the result images.
- Unique skill cut-ins show title, quote, and effect text as removable UI overlay.
- Unique skill cut-in duration is now `2200ms`.
- Battle coordinate adapter prep completed and manual QA passed.
- grid-to-screen conversion centralized.
- Direct coordinate math reduced in battle rendering.
- Battle render layer prep completed and manual QA passed.
- Terrain data scaffold completed and manual QA passed.
- `data/battle_terrain.js` added.
- Default plain `terrainMap` attached to battle state.
- Terrain remains inactive with no gameplay or visual effect.
- Action presentation helper review completed and manual QA passed.
- `renderFloatingEffects()` now uses presentation-facing helper methods.
- Current immediate floating effect behavior and duplicate-prevention were preserved.
- v0.3-7e Presentation Effects Mini Pass completed and manual QA passed.
- v0.3-7f Hit Knockback Reaction completed and manual QA passed.
- Floating battle feedback is clearer.
- Damage effects now trigger subtle render-only knockback.
- Hit knockback does not change `unit.x` / `unit.y`.
- Knockback returns units to original rendered position.

## Presentation Rules To Preserve
- Do not bake text into cut-in/result image assets.
- Unique skill cut-ins are DOM overlay driven.
- Skill title uses Gothic/sans-serif.
- Skill quote uses `궁서` / brush-style.
- Skill effect text uses smaller Gothic/sans-serif.
- Quote appears around the image center, slightly below center.
- Skill title and effect text remain lower-center.
- Result overlay text remains separate from image assets.

## Important Current Data Fields
- `skill.name`: cut-in title
- `skill.cutinQuote`: dramatic quote
- `skill.cutinEffectText`: short functional line
- `skill.cutinDurationMs`: currently `2200` for all 8 unique skills

## Next Recommended Start
1. v0.3-8a Visual Sharpness Pass Prep.
2. Keep future visual polish low-risk and review-first.
3. Keep future SFX/camera/projectile/real queue work in dedicated patches.
4. Keep future large battlefield / 2.5D work routed through coordinate adapter and render layers.
5. Keep terrain rules inactive until a dedicated terrain rules patch.
6. Do not begin 10-city / 20-hero expansion yet.
