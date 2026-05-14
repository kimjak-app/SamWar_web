# Next Tasks

Current working version: `v0.5-8c Trade Goods & Control MVP`.
Baseline: `v0.5-5b Attack/Defense Empty Battlefield Common Battle Unit Render Fix`.

## Immediate Next Target: v0.5-9 Diplomacy & Spy Scaffold
Goal: add explicit diplomacy/intelligence scaffolding only when requested.

Do not implement by default:
- full treaty negotiation UI
- espionage/intelligence
- merchant units
- naval trade combat
- battle logic changes
- Phaser Scene changes
- troop types
- direct rule
- rebellion/riot

## v0.5-8b Closure Notes
- External trade relation states are now shown clearly in Selected City and World HUD.
- `trade_paused` was added for player/policy-driven manual trade pause.
- Player-related relation scaffold controls:
  - 교역 강화: neutral -> trade
  - 교역 중단: neutral/trade -> trade_paused
  - 교역 재개: trade_paused -> neutral
- `trade_suspended` cooldown and `war` cannot be manually resumed.
- Battle still sets trade suspension to 10 turns and cooldown 0 restores neutral/tradeAllowed.
- Relation changes immediately affect external route calculation.
- No trade goods modal, export/import sliders, direct trade control modal, diplomacy AI, treaty negotiation, espionage, merchant units, naval trade combat, trade disruption event, enemy domestic AI, troop types, battle logic overhaul, Phaser Scene change, direct rule, rebellion, or window compatibility was added.

## v0.5-8c Closure Notes
- Trade goods/control MVP is implemented for external trade.
- MVP goods: gold, rice, barley, seafood, salt, silk.
- Deferred goods: wood, iron, horses.
- Added normalized per-city `tradeSettings` with auto/direct mode, intensity, export weights, import priority, and route-limit scaffold.
- Automatic operation uses chancellor -> governor -> temporary-official fallback:
  - chancellor: 100%
  - governor only: 60%
  - temporary officials: 30%
- Chancellor/governor policies lightly affect efficiency, gold, food, salt, and route limit.
- Player-owned cities can open `무역 조정` and save direct trade settings.
- Direct high intensity affects route value; it does not create events or consume city stockpiles.
- v0.5-8b relation/cooldown rules still block trade before trade settings apply.
- No diplomacy AI, treaty negotiation, espionage, merchant units, naval trade combat, trade disruption event, battle logic change, Phaser Scene change, direct rule, enemy domestic AI, or window compatibility was added.

## Alternative Next Target: v0.5-9 Enemy Domestic AI MVP
- Use v0.5-8 external trade ledger data as the later basis for faction stockpiles and AI spending.

## Previous Target: v0.5-8b Trade Relation / Agreement Scaffold
Goal: add a small, non-negotiation relationship/agreement scaffold on top of v0.5-8 external trade.

## v0.5-8 Closure Notes
- External trade now exists between adjacent cities owned by different factions.
- `state.factionRelations` tracks `neutral`, `trade`, `trade_suspended`, and `war`.
- Combat starts a 10-turn bilateral trade suspension.
- Cooldowns decrement once per player turn end and restore neutral trade at 0.
- Player route income is applied to actual player resources.
- Non-player route income is ledger-only in `world.lastInterFactionTradeResult.factionTotals`.
- No diplomacy negotiation, treaty UI, espionage, merchant units, naval trade combat, trade disruption event, enemy domestic AI, troop types, battle logic overhaul, Phaser Scene change, direct rule, rebellion, or window compatibility was added.

## Alternative Next Target: v0.5-9 Diplomacy & Spy Scaffold
- Only start this if the next scope explicitly asks for diplomacy/intelligence scaffolding.

## Previous Target: v0.5-8 Inter-Faction Trade MVP
Goal: add controlled external/inter-faction trade on top of the now-stable internal logistics baseline.

## v0.5-7c Closure Notes
- Internal supply-network shortage/surplus judgment now produces actual same-faction garrison transfers.
- Rear surplus cities feed border/frontline shortage cities first.
- Receiver cities at or above target garrison do not receive additional troops.
- Sender cities never move below target garrison.
- Movement is capped per turn and floored to 100-troop units.
- Whole-faction garrison total is preserved.
- `world.lastTroopRebalanceResult` records transfers and before/after garrisons.
- Recruitment is minimally disabled when the selected city already satisfies target garrison.
- No diplomacy trade, enemy trade, troop production, auto recruitment, troop types, battle logic, Phaser Scene, direct rule, rebellion, or window compatibility was added.

## Previous Target: v0.5-7b Internal Troop Rebalance MVP
Goal: turn the v0.5-7 support judgment into limited actual internal troop movement.

Recommended first scope:
1. Move rear surplus garrison toward border/frontline shortage cities.
2. Use chancellor judgment first.
3. Use governor/local policy as a secondary city priority.
4. Never reduce a source city below its target/minimum garrison.
5. Add a per-turn movement cap.
6. Write actual `garrisonTroops` changes only in this v0.5-7b step.

Do not implement yet:
- troop types
- battle logic changes
- Phaser Scene changes
- diplomacy/external trade
- espionage/intelligence
- merchant or route units
- naval trade/route combat

## v0.5-7 Closure Notes
- Internal trade/supply is same-faction only and currently player-visible.
- It is not diplomacy trade and does not create enemy/cross-faction routes.
- 금전/식량/소금 allocation is priority-based by front line status, garrison need, resource pressure, city loyalty, and policy effects.
- 식량/소금 are displayed as supply allocation/efficiency only; no city stockpile system was added.
- The only actual resource change is a small national 금전 bonus from active internal routes.
- In v0.5-7 this was display-only; v0.5-7c now implements limited internal `garrisonTroops` transfer.
- Save/load preserves `world.lastSupplyNetworkResult` when present and safely handles missing legacy data.

## Previous Target: v0.5-7 Trade Route MVP
Goal: make trade work after faction identity separation, without implementing diplomacy/external treaties yet.

Recommended first scope:
1. Internal trade routes between cities owned by the same faction.
2. Player-owned city route summary in Selected City and World HUD.
3. Trade income as 금전-first income, with specialty bonuses from 비단/소금/수산물.
4. Route efficiency affected by 상업력, 치안, 성충성도, 태수 정책, 재상 정책, and 외교/경제형 aptitude.
5. Enemy trade can be scaffolded but hidden unless later intelligence system exposes it.

Do not implement yet:
- diplomacy treaties
- cross-faction trade
- espionage/intelligence visibility
- full enemy domestic AI
- trade route animation on the world map
- naval trade/sea route combat

## v0.5-6 Closure Notes
- v0.5-6 browser QA was reported working by user.
- Faction-color/map-flag distinction is intentionally deferred to a later World Map visual update.
- Current city/team buttons may still show generic blue/red battle-side styling; this is acceptable until the map/faction color pass.

## QA Status
- v0.5-3a browser manual QA passed.
- v0.5-3b browser manual QA passed.
- v0.5-5a needs browser manual QA.
- No console errors were reported.
- Confirmed: effect summaries, income changes, loyalty-loss mitigation, upkeep/salt changes, military preview changes, actual soldier count unchanged, save/load compatibility, tax/chancellor/governor/transfer/battle/invasion modal regressions.

## Immediate QA
- Verify deployment default allocation no longer uses `hero.troops`.
- Verify deployment sliders appear and total allocation cannot exceed source garrison.
- Verify 태수/장군/부장/군관 command limits are enforced.
- Verify battle unit `hp/maxHp` remains on the old battle scale.
- Verify `allocatedTroops` is recorded separately from battle HP.
- Verify battle unit troop display uses allocated troop ratio, not 110/90/115/120 legacy values.
- Verify direct defense opens deployment instead of entering battle immediately.
- Verify enemy units receive garrison-based allocations.
- Verify battle start deducts allocated troops from source city garrison.
- Verify victory returns survivors and converts 30% of losses to wounded.
- Verify defeat converts 50% of allocated troops to wounded and returns no immediate survivors.
- Verify wounded queue recovers after 3 player turns.
- Verify save/load preserves garrison/wounded queue/command rank.

## Recommended Next Order
1. Browser QA and regression-only fixes for v0.5-5a.
2. Balance review for allocation defaults, wounded rates, and recovery timing.
3. Improve deployment UX only after confirming the data flow is stable.
4. Consider city defense formula use of garrison/allocated troops later.
5. Troop types, diplomacy/intelligence/trade, rebellion, and direct-rule systems remain later milestones.

## Constraints To Preserve
- Do not scatter new formulas outside `domestic_effects.js`.
- Do not implement recruitment, troop types, troop upkeep deduction, direct-rule, enemy domestic automation, intelligence, real trade, diplomacy, or talent recruitment.
- Do not touch Phaser Scene or battle logic for city-management UI work.
- Do not reintroduce window compatibility glue.

## After v0.5-5b
- Browser QA: attack battle render, defense battle render, allocated troop display, casualty return, wounded recovery, save/load.
- Then proceed with v0.5-5c polish only if needed before moving to v0.5-6 Trade Route MVP.


## After v0.5-6
1. Browser QA: verify faction names on city selection, attack/defense battle units, city occupation owner changes, and save/load.
2. Keep player-only manual chancellor/governor controls for now. Enemy chancellor/governor data is scaffold metadata, not full enemy domestic AI.
3. Next large system candidate: `v0.5-8 Inter-Faction Trade MVP`, using faction-specific ownership and internal logistics as the baseline.

## After v0.5-8d-1
1. Browser QA: verify City Detail is left of Selected City on wide screens.
2. Verify City Detail collapse/open works and tabs still switch correctly.
3. Verify relation buttons, trade control modal, recruitment, governor/chancellor controls, save/load, and attack/defense entry still work after the DOM move.
4. Next system candidate remains `v0.5-9 Diplomacy & Spy Scaffold` or `v0.5-9 Enemy Domestic AI MVP` after UX stabilization.
