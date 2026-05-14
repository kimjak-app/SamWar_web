# Changelog

## Current Recent Flow

### v0.5-8h Japan Triangle Micro Layout Patch
- Current baseline for the next session.
- Tuned the expanded 10-city route layout after browser screenshot review.
- Added 업성 <-> 건업 for a clearer China tension line.
- Rebuilt the Korean Peninsula into a 평양 / 한성 / 경주 triangle.
- Preserved 경주 as the only Korea-to-Japan gateway.
- Rebuilt Japan into a 교토 / 오사카 / 에도 triangle.
- Advanced save version to `v0.5-8h`.
- No battle, domestic, trade, diplomacy, espionage, enemy AI, or asset changes.

### v0.5-8f World Route Layout Cleanup
- Cleaned up the 10-city route graph after the world expansion.
- Removed direct 한성 / 평양 routes to Japan.
- Made 경주 the Korea-Japan gateway with sea routes to 교토 and 오사카.
- Repositioned 한성, Japanese cities, and China routes for a cleaner regional layout.
- Added route type metadata for land/sea route rendering.
- Save/load now preserves canonical neighbors, route types, and coordinates from current city data.
- No battle, domestic, trade, diplomacy, espionage, enemy AI, or asset changes.

### v0.5-8e World Expansion Data Patch
- Expanded from 4 cities to 10 cities.
- Expanded from 8 heroes to 27 heroes.
- Expanded to 10 active factions.
- Added Korean, Chinese, and Japanese regional city/faction/hero data.
- Rebuilt battle rosters for all 10 cities.
- Added placeholder unique skills for new heroes using existing supported effect types.
- Missing new portraits and skill cut-ins intentionally remain `null`.
- No new image assets, diplomacy/spy logic, enemy domestic AI, naval route logic, or world map redraw.

### v0.5-8d-1 City Detail Position + Toggle UX Patch
- Swapped the right-side world map detail layout so `City Detail` renders before `Selected City`.
- `Selected City` remains the main operation card.
- `City Detail` became the auxiliary tabbed detail card.
- Added City Detail collapse/open UI.
- Preserved tabs: 자원 / 자국무역 / 타국무역.
- Moved long resource/trade details out of the Selected City summary.
- UX/layout-only patch.
- No domestic, trade, troop rebalance, battle, Phaser, or save/load formula changes.

### v0.5-8d City Detail Panel Tabs UX
- Reduced Selected City overload by separating detail-heavy information.
- Added City Detail tab structure for resources, internal trade, and external trade.
- Kept operational controls in Selected City.
- Preserved existing trade, domestic, troop, and battle logic.
- Prepared the right-side panel for later expanded world data.
- No save/load formula change.

### v0.5-8c Trade Goods & Control MVP
- Added external trade goods/control scaffolding.
- Active MVP goods: gold, rice, barley, seafood, salt, silk.
- Deferred wood, iron, and horses.
- Added normalized per-city trade settings for auto/direct mode, intensity, export weights, and import priorities.
- Added player-owned city `무역 조정` modal.
- Direct trade settings are saved on city data and affect external route value.
- Relation blocking from v0.5-8b remains authoritative.
- No diplomacy AI, espionage, merchant units, naval trade combat, battle logic, or enemy domestic AI.

## Older Baseline Summary
- `v0.5-8b`: Trade relation / agreement scaffold with pause, resume, friendly trade, cooldown, and war blocking.
- `v0.5-8`: Inter-faction trade MVP for adjacent cross-faction routes.
- `v0.5-7c`: Internal troop rebalance MVP.
- `v0.5-7`: Internal trade / supply route MVP.
- `v0.5-6`: Faction identity scaffold.
- `v0.5-5b`: Attack/defense empty battlefield render hotfix.
- `v0.5-5a` and earlier: troop allocation, recruitment, domestic effect, save/load, and battle UI foundation.
