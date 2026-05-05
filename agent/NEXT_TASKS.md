# Next Task Priority

Current recorded build state before the next task: `v0.3-2e Unit Sprite Facing Flip`.

1. `v0.3-3 Status Effect Icons`
   - Start with confusion icon only.
   - Show small icon near battlefield unit HUD.
   - Keep existing status text in right `UNIT` panel.
   - Do not redesign HUD yet.

2. World-map city / garrison hero portrait UI
   - Show who is stationed or associated with a city.
   - Keep MVP simple.

3. Defense battle UX polish
   - Improve invasion/defense choice messaging.
   - Clarify city loss/defense victory results.

4. SFX / battle sound effects
   - Add later after core UI flow stabilizes.

5. Battlefield portrait polish backlog
   - Improve hero badge clarity later.
   - Do not block MVP progress.

## Constraints To Preserve
- Direct Codex Paste Mode remains the working method.
- `agent/CODEX_INBOX.md` is not the main task source.
- Do not merge Phaser rendering logic into `js/core` battle rules.
- Keep heroes, skills, rosters, and strategies data-driven.
- Preserve the fixed MVP roster for now.
- Keep the current compact battlefield HUD.
- Preserve battlefield portrait source priority:
  - `battlefieldPortraitImage` first
  - `portraitImage` fallback
- Preserve dedicated 256px battlefield unit token assets.
- Preserve unit token flip rule:
  - assets face left by default
  - flip only when `unit.facing === "right"`
- Do not casually touch Phaser render/filter/sharpness settings.
- Do not tune combat balance yet.
- Balance will be handled after more core systems are in place.
