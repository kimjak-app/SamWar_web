# Visual Sharpness Review

Current baseline:
- v0.3-7f Hit Knockback Reaction

## Scope
- Review battlefield visual sharpness and readability.
- No gameplay, asset, render config, or balance changes.

## Current Visual Components
- Battlefield background image.
- Grid lines.
- Move/attack/skill/strategy highlights.
- Unit token images.
- Battlefield portrait badges.
- HP bar and troop text.
- Facing labels.
- Status icons.
- Bottom status legend.
- Floating damage/effect text.
- Subtle render-only hit knockback for damage effects.
- Unique skill cut-in image/text overlay.
- Victory/defeat result image/text overlay.

## Current State
- Phaser battle scene handles board imagery, grid, highlights, units, status icons, bottom legend, floating text, and hit feedback.
- DOM/CSS overlay handles unique skill cut-ins and victory/defeat result text.
- Battlefield image, unit token, battlefield portrait, cut-in, and result image asset paths are already data-driven or centralized.
- Current render config, canvas scaling, `pixelArt`, `roundPixels`, and mipmap behavior should remain untouched.

## Low-Risk Polish Candidates
- Slightly improve floating text stroke/readability if needed.
- Slightly adjust status icon background alpha or stroke.
- Slightly adjust bottom status legend font size/contrast.
- Slightly improve HP/troop text contrast.
- Slightly adjust battlefield portrait badge frame/visibility.
- Slightly tune grid/highlight alpha only if readability requires it.
- Keep changes small, reversible, and limited to readability.

## Medium-Risk Items
- Changing unit token display size.
- Changing portrait badge size.
- Changing battlefield image alpha/overlay amount.
- Changing cut-in text positions/sizes.
- Changing result overlay positioning.
- Changing unit depth/tween/knockback behavior.

## High-Risk / Do Not Touch Yet
- Phaser render config.
- `pixelArt` / `roundPixels` / mipmap settings.
- Canvas scale mode.
- Replacing or resizing source image assets.
- Tiled or external map renderer integration.
- Full DOM split for battle UI.
- Major cut-in/result overlay redesign.

## Recommended Next Patch
v0.3-8b Visual Readability Safe Polish

Suggested scope:
- Only small CSS/Phaser text readability adjustments.
- No asset changes.
- No Phaser render config changes.
- No battle logic changes.
- No layout overhaul.

## Manual QA Focus For Next Patch
- Unit positions unchanged.
- Click hit zones unchanged.
- Damage text readable.
- Status icons readable.
- Bottom legend readable.
- Cut-in text still readable.
- Result overlay still readable.
- No regression in auto battle or world map return.
