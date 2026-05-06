# SamWar_web Handoff — After v0.3-4a

The project is currently stable after the `v0.3-4a` China hero data and skills patch.

## Major Completed Systems
1. `14x8` battle map
2. manual battle
3. auto battle stabilized via hasActed fallback root fix
4. world map attack choice: manual / auto
5. world turn loop
6. enemy probabilistic invasion
7. defense battle choice: manual / auto
8. city ownership transfer after battle results
9. hero portrait UI in roster and selected summary
10. battlefield portrait badges
11. compact battlefield unit HUD
12. dedicated 256px battlefield unit tokens
13. unit sprite left/right flip based on facing
14. GitHub Pages mobile shortcut / PWA manifest wiring
15. mobile home-screen shortcut icon asset set connected
16. Luoyang enemy roster can field Guan Yu and Zhang Fei
17. Guan Yu `언월참` and Zhang Fei `장판파열` are wired into battle logic

## Current Stable Visual Decisions
- Battlefield unit names are hidden.
- Right `UNIT` roster holds detailed info.
- Battlefield HUD only shows compact info.
- Unit sprites use `assets/unit_tokens_battlefield/unit_blue_battlefield.png` and `assets/unit_tokens_battlefield/unit_red_battlefield.png`.
- Unit token assets face left by default.
- Unit token sprites flip only when `unit.facing === "right"`.
- Battlefield hero badge quality is acceptable for MVP but deferred for later polish.
- Do not touch Phaser render config/filter/sharpness settings casually.

## Important Caution
- Previous mipmap/sharpness attempts caused visual regression.
- Avoid `pixelArt`, `roundPixels`, `FilterMode.NEAREST`, `mipmapFilter`, global texture filtering, canvas smoothing changes, or Phaser config experiments unless explicitly isolated as a test.

## Current Stable State Notes
- Battlefield hero badges still use `battlefieldPortraitImage` first and `portraitImage` as fallback.
- Unique skill cut-ins work and remain DOM overlay driven.
- Guan Yu and Zhang Fei hero data were added for Luoyang enemy battles.
- Guan Yu and Zhang Fei visual assets are intentionally deferred in this patch.
- The world map attack/defense flow is connected to city ownership transfer.
- Manual battle and auto battle are both part of the stable MVP path.
- `assets/units/` legacy unit art remains preserved and should not be deleted.
- SamWar_web is GitHub Pages runnable on mobile.
- Mobile home-screen shortcut icon files and `manifest.webmanifest` are connected.

## Recommended Next Start
- Start from the current stable version: `v0.3-4a China Hero Data & Skills`.
- Read `agent/CURRENT_STATE.md`, `agent/SESSION_LOG.md`, and `agent/NEXT_TASKS.md` first.
- Treat this as a continuation handoff, not a rollback point.
