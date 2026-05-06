# Current State

## Status
- Current Version: `v0.3-4d Add Luoyang-Pyongyang Land Route`
- Status: `Stable browser-confirmed MVP visual state`

## Working Method
- Direct Codex Paste Mode is the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- GitHub is used for backup and version control.
- ChatCoach handoff docs are maintained at the end of meaningful Codex task sessions.

## Current Milestone
Current recorded build state:

- `v0.1` Fullscreen World Map 4-City MVP
- `v0.2` Battle Scene MVP with Phaser
- `v0.2-1` Godot Grid/Unit Battle Core Port
- `v0.2-2` Hero Skill Core MVP
- `v0.2-2a` Godot Balance & Unique Skill Fidelity Patch
- `v0.2-3` Facing / Counter / Defend / Wait
- `v0.2-4` Strategy / Status Effect Core
- `v0.2-4a` Strategy Random Outcome Fidelity
- `v0.2-5` AI / Auto Battle / Balance Stabilization
- `v0.2-5a` Auto Battle Flicker Fix / Persistent Phaser Mount
- `v0.2-6` Battle Unit Token Visual Patch
- `v0.2-6a` Battle Background Visual Patch
- `v0.2-6b` Battle Command Bar + Side Info Layout Patch
- `v0.2-7` Battle UI/UX Polish + Simple BGM Integration
- `v0.2-7o` Battle Tempo Slowdown for Cut-in Prep
- `v0.2-8` Unique Skill Cut-in Overlay System
- `v0.2-8a` Cut-in Bounds Fix
- `v0.2-8b` Yi Sun-sin Cut-in Size Tuning
- `v0.2-8c` Cut-in Background Slash Bounds Tuning
- `v0.2-8d` Cut-in Slash Subtle Tuning
- `v0.2-9` Sequential Unique Skill Cut-ins for All MVP Heroes
- `v0.2-9a` 14x8 Battlefield Expansion
- `v0.2-9b` Unit Token Tone-down Patch
- `v0.2-9c` Unit Roster Selection + Skill Name Polish
- `v0.2-9d` Battle Mode Choice: Manual vs Auto
- `v0.2-9d-hotfix2` Auto Battle Continuation Fix
- `v0.2-9d-hotfix3` Auto Battle Status Skip Continuation Fix
- `v0.2-9d-hotfix4` Confusion Skip Deadlock Fix
- `v0.2-9d-hotfix5` Auto Battle Sequencer Deadlock Guard
- `v0.2-9d-hotfix6` Resume Player Auto Battle After Enemy Turn
- `v0.2-9d-hotfix7` Auto Battle hasActed Fallback Root Fix
- `v0.2-10` World Turn + Enemy Invasion MVP
- `v0.3.0` Hero Portrait UI
- `v0.3-1` Battlefield Unit Portrait Badge
- `v0.3-2` Battlefield Unit HUD Cleanup
- `v0.3-2a` Battlefield HUD Micro Tuning + Battlefield Portrait Source Switch
- `v0.3-2b` Safe Battlefield Asset Source Switch
- `v0.3-2c` Battlefield Hero Portrait HQ Asset Activation
- `v0.3-2e` Unit Sprite Facing Flip
- `v0.3-3a` Battle Result Cutin
- `v0.3-3b` Battle Result Music
- `v0.3-3c` Mobile Shortcut Icon
- `v0.3-4a` China Hero Data & Skills
- `v0.3-4b` Guan Yu / Zhang Fei Visual Assets
- `v0.3-4c` City Hero Roster Assignment + Enemy City Ownership
- `v0.3-4d` Add Luoyang-Pyongyang Land Route

Stable visual-state chain:

- `v0.3.0` Hero Portrait UI
- `v0.3-1` Battlefield Unit Portrait Badge
- `v0.3-2` Battlefield Unit HUD Cleanup
- `v0.3-2a` Battlefield HUD Micro Tuning + Battlefield Portrait Source Switch
- `v0.3-2b` Safe Battlefield Asset Source Switch
- `v0.3-2c` Battlefield Hero Portrait HQ Asset Activation
- `v0.3-2e` Unit Sprite Facing Flip
- `v0.3-3a` Battle Result Cutin
- `v0.3-3b` Battle Result Music
- `v0.3-3c` Mobile Shortcut Icon
- `v0.3-4a` China Hero Data & Skills
- `v0.3-4b` Guan Yu / Zhang Fei Visual Assets
- `v0.3-4c` City Hero Roster Assignment + Enemy City Ownership
- `v0.3-4d` Add Luoyang-Pyongyang Land Route

## Current Working Features
- `14x8` battlefield works.
- Battlefield background works.
- Manual battle works.
- Auto battle works after `v0.2-9d-hotfix7`.
- Unique skill cut-ins work.
- Right `UNIT` roster selection works.
- Hero portraits appear in the right `UNIT` roster and selected-unit summary.
- Battlefield unit portrait badges appear.
- Battlefield unit names are hidden for the compact HUD.
- Troop text is compact `current / max` format.
- Dedicated 256px battlefield unit token assets are used:
  - `assets/unit_tokens_battlefield/unit_blue_battlefield.png`
  - `assets/unit_tokens_battlefield/unit_red_battlefield.png`
- Blue/red unit sprites now flip horizontally when facing right.
- World map turn loop works.
- Enemy invasion MVP works.
- Manual/auto defense battle choice works.
- City ownership changes after attack/defense results.
- GitHub Pages mobile shortcut icon / PWA manifest is connected.
- Luoyang can now field Guan Yu and Zhang Fei as enemy heroes.
- Guan Yu and Zhang Fei portraits, battlefield badges, and unique skill cutins are wired.
- Hanseong is now the only player-owned starting city.
- Luoyang, Pyongyang, and Kyoto are enemy-owned.
- Luoyang uses Guan Yu/Zhang Fei as its defender roster.
- Kyoto uses Nobunaga/Kenshin as its defender roster.
- Hanseong uses Yi Sun-sin/Jeong Do-jeon as its defender roster.
- Luoyang and Pyongyang are now directly connected by land route.

## Current Stable Visual Notes
- Battlefield hero badges use `battlefieldPortraitImage` first and `portraitImage` as fallback.
- Battlefield hero badge clarity is acceptable for MVP.
- Visual polish/detail edits for Guan Yu and Zhang Fei assets are deferred to a later asset polish pass.
- Unit token assets face left by default.
- Unit token sprites flip only when `unit.facing === "right"`.
- Battlefield unit names remain hidden.
- Right `UNIT` roster carries the detailed identity/status context.
- Do not casually touch Phaser render/filter/sharpness settings.

## Known MVP Limitations
- Battlefield hero portrait badge clarity is acceptable but not final polish.
- Status effect icons are not implemented yet.
- SFX is not implemented yet.
- World-map garrison/hero portrait UI is not implemented yet.
- Balance is not tuned yet.
- Mobile gameplay layout is runnable but not fully optimized for phone screen yet.
- Pyongyang hero roster is still pending and uses fallback defender roster.
- Balance tuning is deferred.
## Design Decisions To Preserve
1. Direct Codex Paste Mode is the working method.
2. Battle rules must stay separated from Phaser renderer.
3. Heroes, skills, rosters, and strategies remain data-driven.
4. MVP roster is still fixed for now.
5. Unique skill cut-ins remain DOM-overlay driven.
6. Do not reintroduce mipmap/pixel/filter/sharpness experiments into the MVP baseline.

## Suggested Next Direction
Suggested next task: `v0.3-4e Pyongyang Hero Roster`.
