extends Node2D

const UnitScene := preload("res://scenes/Unit.tscn")
const FloatingTextScene := preload("res://scenes/FloatingText.tscn")
const FRONT_ATTACK_BONUS := 1.0
const SIDE_ATTACK_BONUS := 1.15
const BACK_ATTACK_BONUS := 1.30
const WORLD_MAP_SCENE_PATH := "res://scenes/world_map.tscn"
const DEBUG_BATTLE_TOOLS_ENABLED := false

@onready var grid: GridManager = $Grid
@onready var units_node: Node2D = $Units
@onready var ui: BattleUI = $UI
@onready var debug_win_button: Button = $UI/DebugWinButton
@onready var retreat_button: Button = $UI/BottomPanel/RetreatButton
@onready var auto_battle_button: Button = $UI/BottomPanel/AutoBattleButton
@onready var turn_manager: TurnManager = $TurnManager
@onready var ai_controller: AIController = $AIController

var rng := RandomNumberGenerator.new()
var units: Array[BattleUnit] = []
var selected_unit: BattleUnit = null
var current_action_mode := "none"
var battle_over := false
var is_resolving_skill_preview := false
var floating_text_stack_index := 0
var strategy_preview_target: BattleUnit = null
var world_map_victory_handled: bool = false
var world_map_defeat_handled: bool = false
var auto_battle_enabled: bool = false
var _last_mouse_input_source := ""


func _ready() -> void:
	print("### BattleScene script loaded: v0.276 mouse hotfix active ###")
	print("[Battle] 월드맵 목표 도시: ", GameState.current_target_city_id)
	rng.randomize()
	_spawn_units()
	debug_win_button.visible = DEBUG_BATTLE_TOOLS_ENABLED
	debug_win_button.pressed.connect(_on_debug_win_button_pressed)
	retreat_button.pressed.connect(_on_retreat_button_pressed)
	auto_battle_button.pressed.connect(_on_auto_battle_button_pressed)
	ui.attack_pressed.connect(_on_attack_pressed)
	ui.skill_pressed.connect(_on_skill_pressed)
	ui.strategy_pressed.connect(_on_strategy_pressed)
	ui.wait_pressed.connect(_on_wait_button_pressed)
	ui.defend_pressed.connect(_on_defend_button_pressed)
	ui.end_turn_pressed.connect(_on_end_turn_pressed)
	turn_manager.turn_started.connect(_on_turn_started)
	_update_battle_flow_buttons()
	turn_manager.begin_turn(TurnManager.TurnState.PLAYER_TURN, units)


func _on_debug_win_button_pressed() -> void:
	if GameState.current_target_city_id == "":
		print("[Battle] 점령할 목표 도시가 없습니다.")
		return

	var captured_city_id: String = GameState.current_target_city_id
	print("[Battle] 전투 승리 테스트. 점령 도시: ", captured_city_id)

	GameState.occupy_city(captured_city_id)
	GameState.clear_battle_context()

	var err: Error = get_tree().change_scene_to_file(WORLD_MAP_SCENE_PATH)
	if err != OK:
		print("[Battle] 월드맵 복귀 실패: ", err)


func _on_retreat_button_pressed() -> void:
	if battle_over or world_map_defeat_handled or world_map_victory_handled:
		return

	battle_over = true
	_update_battle_flow_buttons()
	if GameState.current_battle_type == "player_defense":
		handle_world_map_defense_defeat()
	else:
		handle_world_map_defeat()


func _on_auto_battle_button_pressed() -> void:
	if battle_over or auto_battle_enabled:
		return

	auto_battle_enabled = true
	_clear_selection_state()
	grid.clear_highlights()
	ui.add_log("자동전투를 시작합니다.")
	_refresh_ui_for_selection()
	_update_battle_flow_buttons()
	_run_auto_battle_turn_if_needed()


func _update_battle_flow_buttons() -> void:
	var can_retreat: bool = not battle_over and not world_map_victory_handled and not world_map_defeat_handled
	retreat_button.disabled = not can_retreat
	auto_battle_button.disabled = battle_over or auto_battle_enabled or world_map_victory_handled or world_map_defeat_handled


func handle_world_map_victory() -> bool:
	if world_map_victory_handled:
		return true

	if GameState.current_target_city_id == "":
		print("[Battle] 월드맵 목표 도시 없음. 기존 승리 처리 유지.")
		return false

	world_map_victory_handled = true
	_update_battle_flow_buttons()

	var captured_city_id: String = GameState.current_target_city_id
	print("[Battle] 월드맵 전투 승리. 점령 도시: ", captured_city_id)

	GameState.occupy_city(captured_city_id)
	GameState.update_global_victory_defeat_state()
	if GameState.is_world_unified:
		GameState.clear_battle_context()
		var unified_err: Error = get_tree().change_scene_to_file(WORLD_MAP_SCENE_PATH)
		if unified_err != OK:
			print("[Battle] 월드맵 복귀 실패: ", unified_err)
		return true

	GameState.clear_battle_context()
	GameState.mark_enemy_turn_pending()

	var err: Error = get_tree().change_scene_to_file(WORLD_MAP_SCENE_PATH)
	if err != OK:
		print("[Battle] 월드맵 복귀 실패: ", err)

	return true


func handle_world_map_defense_victory() -> bool:
	if world_map_victory_handled:
		return true

	if GameState.current_target_city_id == "":
		print("[Battle] 월드맵 방어 목표 도시 없음. 기존 승리 처리 유지.")
		return false

	world_map_victory_handled = true
	_update_battle_flow_buttons()

	var target_city_id: String = GameState.current_target_city_id
	print("[Battle] 월드맵 방어전 승리. 방어 도시: ", target_city_id)

	GameState.clear_battle_context()
	GameState.start_player_turn()

	var err: Error = get_tree().change_scene_to_file(WORLD_MAP_SCENE_PATH)
	if err != OK:
		print("[Battle] 월드맵 복귀 실패: ", err)

	return true


func handle_world_map_defeat() -> bool:
	if world_map_defeat_handled:
		return true

	if GameState.current_target_city_id == "":
		print("[Battle] 월드맵 목표 도시 없음. 기존 패배 처리 유지.")
		return false

	world_map_defeat_handled = true
	_update_battle_flow_buttons()

	var failed_city_id: String = GameState.current_target_city_id
	print("[Battle] 월드맵 전투 패배. 점령 실패 도시: ", failed_city_id)

	GameState.clear_battle_context()
	GameState.mark_enemy_turn_pending()

	var err: Error = get_tree().change_scene_to_file(WORLD_MAP_SCENE_PATH)
	if err != OK:
		print("[Battle] 월드맵 복귀 실패: ", err)

	return true


func handle_world_map_defense_defeat() -> bool:
	if world_map_defeat_handled:
		return true

	if GameState.current_target_city_id == "":
		print("[Battle] 월드맵 방어 목표 도시 없음. 기존 패배 처리 유지.")
		return false

	world_map_defeat_handled = true
	_update_battle_flow_buttons()

	var lost_city_id: String = GameState.current_target_city_id
	print("[Battle] 월드맵 방어전 패배. 함락 도시: ", lost_city_id)

	GameState.clear_battle_context()
	GameState.handle_player_capital_lost(lost_city_id)
	GameState.update_global_victory_defeat_state()

	var err: Error = get_tree().change_scene_to_file(WORLD_MAP_SCENE_PATH)
	if err != OK:
		print("[Battle] 월드맵 복귀 실패: ", err)

	return true


func _spawn_units() -> void:
	var unit_data := [
		{
			"unit_name": "이순신",
			"team": "player",
			"troops": 110,
			"max_troops": 110,
			"power": 90,
			"intelligence": 85,
			"attack": 32,
			"defense": 16,
			"move_range": 2,
			"attack_range": 3,
			"skill_range": 3,
			"ai_type": "ranged",
			"attack_effect_type": "normal",
			"skill_effect_type": "cannon",
			"crit_bonus": 0.15,
			"crit_multiplier": 1.6,
			"grid_position": Vector2i(1, 1),
			"skill_name": "학익진 포격",
			"skill_cooldown": 3,
		},
		{
			"unit_name": "정도전",
			"team": "player",
			"troops": 90,
			"max_troops": 90,
			"power": 40,
			"intelligence": 95,
			"attack": 12,
			"defense": 12,
			"move_range": 3,
			"attack_range": 1,
			"skill_range": 0,
			"ai_type": "support",
			"attack_effect_type": "normal",
			"skill_effect_type": "buff",
			"crit_bonus": 0.0,
			"crit_multiplier": 1.4,
			"grid_position": Vector2i(1, 4),
			"skill_name": "개혁령",
			"skill_cooldown": 3,
		},
		{
			"unit_name": "노부나가",
			"team": "enemy",
			"troops": 120,
			"max_troops": 120,
			"power": 85,
			"intelligence": 75,
			"attack": 30,
			"defense": 16,
			"move_range": 3,
			"attack_range": 2,
			"skill_range": 2,
			"ai_type": "ranged",
			"attack_effect_type": "gun",
			"skill_effect_type": "gun",
			"crit_bonus": 0.05,
			"crit_multiplier": 1.5,
			"grid_position": Vector2i(8, 1),
			"skill_name": "화승총 사격",
			"skill_cooldown": 3,
		},
		{
			"unit_name": "겐신",
			"team": "enemy",
			"troops": 115,
			"max_troops": 115,
			"power": 95,
			"intelligence": 70,
			"attack": 34,
			"defense": 14,
			"move_range": 4,
			"attack_range": 1,
			"skill_range": 2,
			"ai_type": "aggressive",
			"attack_effect_type": "normal",
			"skill_effect_type": "charge",
			"crit_bonus": 0.10,
			"crit_multiplier": 1.5,
			"grid_position": Vector2i(8, 4),
			"skill_name": "돌격",
			"skill_cooldown": 3,
		},
	]

	for data in unit_data:
		var unit: BattleUnit = UnitScene.instantiate()
		units_node.add_child(unit)
		unit.setup(data, grid.grid_to_world(data["grid_position"]))
		units.append(unit)


func _unhandled_input(event: InputEvent) -> void:
	if battle_over or auto_battle_enabled or turn_manager.current_state != TurnManager.TurnState.PLAYER_TURN or is_resolving_skill_preview:
		return
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		_handle_left_click(event.position)
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
		_handle_right_click(event.position)
	elif event is InputEventMouseMotion:
		_handle_mouse_motion(event.position)


func _handle_left_click(mouse_position: Vector2) -> void:
	_last_mouse_input_source = "left"
	print("### LEFT CLICK input detected / mode=", current_action_mode, " selected=", selected_unit)
	if current_action_mode == "choose_facing":
		_handle_choose_facing_click(mouse_position)
		return
	if selected_unit != null and selected_unit.team == "player" and current_action_mode == "moved_unconfirmed":
		current_action_mode = "choose_facing"
		_refresh_grid_highlights()
		_refresh_ui_for_selection()
		return

	var clicked_unit := _get_unit_from_world(mouse_position)
	if clicked_unit != null:
		if current_action_mode in ["skill", "strategy"] and clicked_unit.team == "player":
			ui.add_log("스킬 대상이 아닙니다.")
			return
		if clicked_unit.team == "player":
			_select_unit(clicked_unit)
			return
		if selected_unit != null and clicked_unit.team == "enemy":
			match current_action_mode:
				"attack":
					_try_attack(selected_unit, clicked_unit)
				"skill":
					if _get_skill_targets(selected_unit).has(clicked_unit):
						_try_skill(selected_unit, clicked_unit)
					else:
						ui.add_log("스킬 대상이 아닙니다.")
				"strategy":
					if _get_strategy_targets(selected_unit).has(clicked_unit):
						_use_strategy(selected_unit, clicked_unit)
					else:
						ui.add_log("책략 대상이 아닙니다.")
				"unit_selected", "action_select", "none":
					if _get_attackable_enemies(selected_unit).has(clicked_unit):
						_try_attack(selected_unit, clicked_unit)
				_:
					pass
			return

	if selected_unit == null or selected_unit.team != "player":
		return
	if selected_unit.has_acted:
		return

	var clicked_grid := grid.world_to_grid(mouse_position)
	if not grid.is_in_bounds(clicked_grid):
		return
	if current_action_mode in ["skill", "strategy"]:
		ui.add_log("스킬 대상이 아닙니다.")
		return
	_try_move_selected_unit(clicked_grid)


func _select_unit(unit: BattleUnit) -> void:
	if auto_battle_enabled:
		return
	if not unit.is_alive or unit.team != "player" or unit.has_acted:
		return
	if _last_mouse_input_source == "left":
		print("### select_unit called by LEFT CLICK ###")
	else:
		print("### select_unit called by RIGHT CLICK (unexpected) ###")
	if selected_unit != null:
		selected_unit.set_selected(false)
	selected_unit = unit
	selected_unit.set_selected(true)
	current_action_mode = "unit_selected"
	strategy_preview_target = null
	_refresh_grid_highlights()
	_refresh_ui_for_selection()


func _show_move_options(unit: BattleUnit) -> Array[Vector2i]:
	var move_tiles: Array[Vector2i] = []
	if not unit.has_moved:
		move_tiles = grid.get_walkable_positions(unit, units)
		move_tiles.append(unit.grid_position)
	grid.highlight_tiles(move_tiles, "move")
	return move_tiles


func _refresh_grid_highlights() -> void:
	if selected_unit == null:
		grid.clear_highlights()
		return
	grid.clear_highlights()
	_show_move_options(selected_unit)
	match current_action_mode:
		"choose_facing":
			_show_facing_choice_tiles(selected_unit)
		"unit_selected", "action_select", "none":
			_show_front_tile(selected_unit)
		"moved_unconfirmed":
			_show_front_tile(selected_unit)
		"attack":
			grid.highlight_tiles(_units_to_positions(_get_attackable_enemies(selected_unit)), "attack")
		"skill":
			if _is_buff_skill_unit(selected_unit):
				grid.highlight_tiles(_units_to_positions(_get_team_units(selected_unit.team)), "buff")
			else:
				var skill_range_tiles := grid.get_tiles_in_range(selected_unit.grid_position, selected_unit.get_skill_range())
				grid.highlight_tiles(skill_range_tiles, "skill_range")
				grid.highlight_tiles(_units_to_positions(_get_skill_targets(selected_unit)), "skill")
		"strategy":
			var strategy_range_tiles := grid.get_tiles_in_range(selected_unit.grid_position, selected_unit.get_strategy_range())
			grid.highlight_tiles(strategy_range_tiles, "skill_range")
			grid.highlight_tiles(_units_to_positions(_get_strategy_targets(selected_unit)), "skill")
		_:
			pass


func _refresh_ui_for_selection() -> void:
	ui.update_selected_unit_info(selected_unit)
	if auto_battle_enabled:
		ui.set_actions_enabled(false, false, false, false, false, false)
		ui.set_action_buttons_visible(false)
		ui.set_end_turn_button_text("턴 종료")
		_refresh_strategy_preview()
		_update_battle_flow_buttons()
		return
	var can_attack := false
	var can_skill := false
	var can_strategy := false
	var can_wait := false
	var can_defend := false
	var show_action_buttons := selected_unit != null and not selected_unit.has_acted and current_action_mode in ["unit_selected", "action_select", "attack", "skill", "strategy"]
	if selected_unit != null and not selected_unit.has_acted:
		if current_action_mode in ["unit_selected", "action_select", "attack", "skill", "strategy"]:
			can_attack = not _get_attackable_enemies(selected_unit).is_empty()
			can_skill = _can_player_use_skill(selected_unit)
			can_strategy = _can_player_use_strategy(selected_unit)
			can_wait = true
			can_defend = true
	ui.set_action_buttons_visible(show_action_buttons)
	ui.set_actions_enabled(can_attack, can_skill, can_strategy, can_wait, can_defend, true)
	ui.set_end_turn_button_text("턴 종료")
	_refresh_strategy_preview()
	_update_battle_flow_buttons()


func _enter_choose_facing_mode(unit: BattleUnit) -> void:
	if unit == null:
		return
	selected_unit = unit
	current_action_mode = "choose_facing"
	grid.clear_highlights()
	_show_facing_choice_tiles(unit)
	print("### enter_choose_facing_mode:", unit.unit_name)
	_refresh_ui_for_selection()


func _handle_hold_position(unit: BattleUnit) -> void:
	if unit == null or unit.has_acted or unit.has_moved:
		return
	unit.mark_move_origin()
	unit.commit_hold_position()
	ui.add_log("%s 제자리 고수" % unit.unit_name)
	_enter_choose_facing_mode(unit)


func _try_move_selected_unit(target_grid: Vector2i) -> void:
	if selected_unit == null or selected_unit.has_acted or selected_unit.has_moved:
		return
	var movable_tiles := _show_move_options(selected_unit)
	if not movable_tiles.has(target_grid):
		return
	if target_grid == selected_unit.grid_position:
		_handle_hold_position(selected_unit)
	else:
		selected_unit.mark_move_origin()
		selected_unit.move_to_grid(target_grid, grid.grid_to_world(target_grid))
		selected_unit.can_cancel_move = true
		ui.add_log("%s 이동 (%d, %d)" % [selected_unit.unit_name, target_grid.x, target_grid.y])
		_enter_choose_facing_mode(selected_unit)


func _on_attack_pressed() -> void:
	if auto_battle_enabled or selected_unit == null or selected_unit.has_acted:
		return
	current_action_mode = "attack"
	strategy_preview_target = null
	_refresh_grid_highlights()
	_refresh_ui_for_selection()


func _on_skill_pressed() -> void:
	if auto_battle_enabled or selected_unit == null or selected_unit.has_acted or not selected_unit.can_use_skill():
		return
	current_action_mode = "skill"
	strategy_preview_target = null
	_refresh_grid_highlights()
	_refresh_ui_for_selection()
	if _is_buff_skill_unit(selected_unit):
		is_resolving_skill_preview = true
		await get_tree().create_timer(0.5).timeout
		is_resolving_skill_preview = false
		if selected_unit != null and _is_buff_skill_unit(selected_unit) and selected_unit.can_use_skill() and current_action_mode == "skill":
			_use_jeong_buff(selected_unit)


func _on_end_turn_pressed() -> void:
	if battle_over or auto_battle_enabled or turn_manager.current_state != TurnManager.TurnState.PLAYER_TURN:
		return
	_end_player_turn()


func _on_strategy_pressed() -> void:
	if auto_battle_enabled or selected_unit == null or selected_unit.has_acted or not _can_player_use_strategy(selected_unit):
		return
	current_action_mode = "strategy"
	strategy_preview_target = null
	_refresh_grid_highlights()
	_refresh_strategy_preview()


func _on_wait_button_pressed() -> void:
	if auto_battle_enabled or selected_unit == null or selected_unit.has_acted:
		return
	ui.add_log("%s 대기" % selected_unit.unit_name)
	_clear_selection_state()
	grid.clear_highlights()
	_refresh_ui_for_selection()


func _on_defend_button_pressed() -> void:
	if auto_battle_enabled or selected_unit == null or selected_unit.has_acted:
		return
	var unit: BattleUnit = selected_unit
	unit.is_defending = true
	unit.end_action()
	ui.add_log("%s 방어 태세" % unit.unit_name)
	_after_action_cleanup(unit, null)


func _try_attack(attacker: BattleUnit, defender: BattleUnit) -> void:
	if not attacker.is_alive or not defender.is_alive:
		return
	if not _get_attackable_enemies(attacker).has(defender):
		return
	var defender_was_alive := defender.is_alive
	var attack_result := _resolve_basic_attack_damage(attacker, defender, 0, "공격")
	defender.receive_damage(attack_result["damage"])
	spawn_hit_effect(attacker.attack_effect_type, defender.global_position)
	_show_attack_popups(attacker, defender, attack_result)
	_apply_counter_damage_if_needed(attacker, defender, attack_result["damage"], defender_was_alive, "normal")
	attacker.face_towards(defender.grid_position)
	attacker.end_action()
	ui.add_log("%s이 %s를 %s%s -%d" % [attacker.unit_name, defender.unit_name, attack_result["log_text"], _get_critical_log_suffix(attack_result), attack_result["damage"]])
	_after_action_cleanup(attacker, defender)


func _try_skill(attacker: BattleUnit, defender: BattleUnit) -> void:
	if not attacker.can_use_skill() or not _get_skill_targets(attacker).has(defender):
		if current_action_mode == "skill":
			ui.add_log("스킬 대상이 아닙니다.")
		return
	match attacker.skill_effect_type:
		"cannon":
			_execute_hakikjin_barrage(attacker)
		"gun":
			_execute_targeted_damage_skill(attacker, defender, 10, "화승총 사격", 2)
		"charge":
			_execute_kenshin_charge(attacker, defender)
		_:
			return
	_after_action_cleanup(attacker, defender)


func _execute_targeted_damage_skill(attacker: BattleUnit, defender: BattleUnit, bonus_damage: int, log_name: String, _range_override: int = -1) -> void:
	var valid_targets := _get_skill_targets(attacker)
	if not valid_targets.has(defender):
		return
	var defender_was_alive := defender.is_alive
	var attack_result := _resolve_attack_damage(attacker, defender, bonus_damage, log_name)
	defender.receive_damage(attack_result["damage"])
	spawn_hit_effect(attacker.skill_effect_type, defender.global_position)
	_show_attack_popups(attacker, defender, attack_result, _get_skill_popup_text(log_name))
	_apply_counter_damage_if_needed(attacker, defender, attack_result["damage"], defender_was_alive, "ranged_skill")
	attacker.face_towards(defender.grid_position)
	attacker.put_skill_on_cooldown()
	attacker.end_action()
	ui.add_log("%s이 %s를 %s%s -%d" % [attacker.unit_name, defender.unit_name, attack_result["log_text"], _get_critical_log_suffix(attack_result), attack_result["damage"]])


func _execute_kenshin_charge(attacker: BattleUnit, defender: BattleUnit) -> void:
	var destination := _get_kenshin_charge_destination(attacker, defender)
	if destination == Vector2i(-1, -1):
		return
	if destination != attacker.grid_position:
		attacker.move_to_grid(destination, grid.grid_to_world(destination))
	var defender_was_alive := defender.is_alive
	var attack_result := _resolve_attack_damage(attacker, defender, 18, "돌격")
	defender.receive_damage(attack_result["damage"])
	spawn_hit_effect(attacker.skill_effect_type, defender.global_position)
	_show_attack_popups(attacker, defender, attack_result, "돌격!")
	_apply_counter_damage_if_needed(attacker, defender, attack_result["damage"], defender_was_alive, "melee_skill")
	attacker.face_towards(defender.grid_position)
	attacker.put_skill_on_cooldown()
	attacker.end_action()
	ui.add_log("%s이 %s를 %s%s -%d" % [attacker.unit_name, defender.unit_name, attack_result["log_text"], _get_critical_log_suffix(attack_result), attack_result["damage"]])


func _use_jeong_buff(unit: BattleUnit) -> void:
	for ally in _get_team_units("player"):
		if ally.is_alive:
			ally.buff_attack_bonus = 0.15
			ally.buff_turns = 2
			ally.refresh_visuals()
			spawn_hit_effect(unit.skill_effect_type, ally.global_position)
	spawn_floating_text("개혁령!", unit.position + Vector2(0, -28), Color(0.2, 1.0, 0.4))
	unit.put_skill_on_cooldown()
	unit.end_action()
	ui.add_log("%s이 개혁령 사용!" % unit.unit_name)
	_after_action_cleanup(unit, null)


func _clear_selection_state() -> void:
	if selected_unit != null:
		selected_unit.set_selected(false)
	selected_unit = null
	strategy_preview_target = null
	current_action_mode = "none"
	is_resolving_skill_preview = false


func _after_action_cleanup(actor: BattleUnit, target: BattleUnit) -> void:
	if target != null:
		target.refresh_visuals()
	actor.refresh_visuals()
	_clear_selection_state()
	grid.clear_highlights()
	ui.update_selected_unit_info(null)
	ui.set_action_buttons_visible(false)
	ui.set_actions_enabled(false, false, false, false, false, turn_manager.current_state == TurnManager.TurnState.PLAYER_TURN)
	ui.set_end_turn_button_text("턴 종료")
	_update_battle_flow_buttons()
	_check_auto_turn_transition()


func _end_player_turn() -> void:
	if battle_over:
		return
	_clear_selection_state()
	turn_manager.process_end_of_turn(units)
	grid.clear_highlights()
	ui.update_selected_unit_info(null)
	ui.set_action_buttons_visible(false)
	ui.set_actions_enabled(false, false, false, false, false, false)
	ui.set_end_turn_button_text("턴 종료")
	_update_battle_flow_buttons()
	turn_manager.begin_turn(turn_manager.get_next_state(), units)


func _on_turn_started(turn_state: int) -> void:
	var is_player_turn := turn_state == TurnManager.TurnState.PLAYER_TURN
	ui.set_turn_text("현재 턴: %s" % ("아군" if is_player_turn else "적군"))
	ui.add_log("%s 턴 시작" % ("아군" if is_player_turn else "적군"))
	_update_battle_flow_buttons()
	var current_team := "player" if is_player_turn else "enemy"
	for unit in units:
		if unit.is_alive and unit.team == current_team and unit.has_status("confusion"):
			ui.add_log("%s은 혼란 상태로 행동 불가" % unit.unit_name)
	if not _has_available_units(current_team):
		_check_auto_turn_transition()
		return
	if is_player_turn:
		if auto_battle_enabled:
			_run_auto_battle_turn_if_needed()
			return
		_refresh_ui_for_selection()
	else:
		_run_enemy_turn()


func _run_enemy_turn() -> void:
	await _run_ai_turn("enemy")


func _run_auto_battle_turn_if_needed() -> void:
	if battle_over or not auto_battle_enabled:
		return
	if turn_manager.current_state != TurnManager.TurnState.PLAYER_TURN:
		return
	await _run_ai_turn("player")


func _has_available_units(team: String) -> bool:
	for unit in units:
		if unit.team != team:
			continue
		if not unit.is_alive:
			continue
		if unit.has_acted:
			continue
		return true
	return false


func _check_auto_turn_transition() -> void:
	if battle_over or world_map_victory_handled or world_map_defeat_handled:
		return

	_check_battle_result()
	if battle_over or world_map_victory_handled or world_map_defeat_handled:
		return

	var current_team := turn_manager.get_current_team()
	if _has_available_units(current_team):
		return

	if current_team == "player":
		_end_player_turn()
	else:
		turn_manager.process_end_of_turn(units)
		turn_manager.begin_turn(turn_manager.get_next_state(), units)


func _run_ai_turn(team: String) -> void:
	await get_tree().create_timer(0.5).timeout
	var acting_units: Array[BattleUnit] = _get_team_units(team)
	var ally_team: String = team
	var enemy_team: String = "player" if team == "enemy" else "enemy"
	for unit in acting_units:
		if battle_over:
			return
		if not unit.is_alive or unit.has_acted:
			continue
		await get_tree().create_timer(0.35).timeout
		var action := ai_controller.get_action_for_unit(unit, _get_team_units(ally_team), _get_team_units(enemy_team), grid, units, rng)
		var move_position: Vector2i = action["move_position"]
		if move_position != unit.grid_position:
			unit.move_to_grid(move_position, grid.grid_to_world(move_position))
			ui.add_log("%s 이동 (%d, %d)" % [unit.unit_name, move_position.x, move_position.y])
			await get_tree().create_timer(0.25).timeout

		var target: BattleUnit = action["target"]
		if team == "enemy":
			_execute_enemy_ai_action(unit, target, String(action["action_type"]))
		else:
			_execute_player_ai_action(unit, target, String(action["action_type"]))

		_check_battle_result()
		if battle_over:
			return
		if team == "player" and turn_manager.current_state != TurnManager.TurnState.PLAYER_TURN:
			return

	await get_tree().create_timer(0.5).timeout
	turn_manager.process_end_of_turn(units)
	turn_manager.begin_turn(turn_manager.get_next_state(), units)


func _execute_enemy_ai_action(unit: BattleUnit, target: BattleUnit, action_type: String) -> void:
	match action_type:
		"attack":
			if target != null and target.is_alive and grid.get_distance(unit.grid_position, target.grid_position) <= unit.attack_range:
				var target_was_alive := target.is_alive
				var attack_result := _resolve_basic_attack_damage(unit, target, 0, "공격")
				target.receive_damage(attack_result["damage"])
				spawn_hit_effect(unit.attack_effect_type, target.global_position)
				_show_attack_popups(unit, target, attack_result)
				_apply_counter_damage_if_needed(unit, target, attack_result["damage"], target_was_alive, "normal")
				unit.face_towards(target.grid_position)
				unit.end_action()
				ui.add_log("%s이 %s를 %s%s -%d" % [unit.unit_name, target.unit_name, attack_result["log_text"], _get_critical_log_suffix(attack_result), attack_result["damage"]])
			else:
				unit.end_action()
		"skill":
			_execute_enemy_skill(unit, target)
		_:
			unit.end_action()


func _execute_player_ai_action(unit: BattleUnit, target: BattleUnit, action_type: String) -> void:
	match action_type:
		"attack":
			if target != null and target.is_alive:
				_try_attack(unit, target)
				if not unit.has_acted and not battle_over:
					unit.end_action()
					_after_action_cleanup(unit, null)
			else:
				unit.end_action()
				_after_action_cleanup(unit, null)
		"skill":
			if unit.skill_effect_type == "buff":
				_use_jeong_buff(unit)
			elif target != null and target.is_alive:
				_try_skill(unit, target)
				if not unit.has_acted and not battle_over:
					unit.end_action()
					_after_action_cleanup(unit, null)
			else:
				unit.end_action()
				_after_action_cleanup(unit, null)
		_:
			unit.end_action()
			_after_action_cleanup(unit, null)


func _execute_enemy_skill(unit: BattleUnit, target: BattleUnit) -> void:
	match unit.skill_effect_type:
		"gun":
			if target != null and target.is_alive and grid.get_distance(unit.grid_position, target.grid_position) <= 2:
				var target_was_alive := target.is_alive
				var attack_result := _resolve_attack_damage(unit, target, 10, "화승총 사격")
				target.receive_damage(attack_result["damage"])
				spawn_hit_effect(unit.skill_effect_type, target.global_position)
				_show_attack_popups(unit, target, attack_result, "사격!")
				_apply_counter_damage_if_needed(unit, target, attack_result["damage"], target_was_alive, "ranged_skill")
				unit.face_towards(target.grid_position)
				unit.put_skill_on_cooldown()
				unit.end_action()
				ui.add_log("%s이 %s를 %s%s -%d" % [unit.unit_name, target.unit_name, attack_result["log_text"], _get_critical_log_suffix(attack_result), attack_result["damage"]])
			else:
				unit.end_action()
		"charge":
			if target != null and target.is_alive:
				var destination := _get_kenshin_charge_destination(unit, target)
				if destination != Vector2i(-1, -1):
					if destination != unit.grid_position:
						unit.move_to_grid(destination, grid.grid_to_world(destination))
					var target_was_alive := target.is_alive
					var attack_result := _resolve_attack_damage(unit, target, 18, "돌격")
					target.receive_damage(attack_result["damage"])
					spawn_hit_effect(unit.skill_effect_type, target.global_position)
					_show_attack_popups(unit, target, attack_result, "돌격!")
					_apply_counter_damage_if_needed(unit, target, attack_result["damage"], target_was_alive, "melee_skill")
					unit.face_towards(target.grid_position)
					unit.put_skill_on_cooldown()
					unit.end_action()
					ui.add_log("%s이 %s를 %s%s -%d" % [unit.unit_name, target.unit_name, attack_result["log_text"], _get_critical_log_suffix(attack_result), attack_result["damage"]])
				else:
					unit.end_action()
			else:
				unit.end_action()
		"buff":
			unit.end_action()
		"cannon":
			_execute_hakikjin_barrage(unit)
		_:
			unit.end_action()


func _calculate_damage(attacker: BattleUnit, defender: BattleUnit, bonus_damage: int) -> int:
	var variance := rng.randi_range(-3, 3)
	var attack_value: float = attacker.get_effective_attack()
	var defense_value: float = defender.get_effective_defense()
	return max(5, int(round(attack_value - defense_value + variance + bonus_damage)))


func _use_strategy(caster: BattleUnit, target: BattleUnit) -> void:
	spawn_floating_text("책략!", caster.position + Vector2(0, -28), Color(0.75, 0.45, 1.0))
	ui.add_log("%s이 책략을 사용했다!" % caster.unit_name)
	var applied_any := false
	var strategy_preview: Dictionary = _calculate_strategy_probabilities(caster, target)
	var shake_chance: float = float(strategy_preview["shake_chance"])
	var confusion_chance: float = float(strategy_preview["confusion_chance"])

	if caster.intelligence >= 95:
		if rng.randf() < confusion_chance:
			target.apply_status("confusion", get_strategy_status_duration(caster, "confusion"))
			ui.add_log("%s이 혼란에 빠졌다!" % target.unit_name)
			spawn_floating_text("혼란!", target.position + Vector2(0, -38), Color(1.0, 0.9, 0.2))
			spawn_floating_text("성공!", target.position + Vector2(0, -52), Color(1.0, 0.8, 0.25))
			applied_any = true
		if rng.randf() < shake_chance:
			target.apply_status("shake", get_strategy_status_duration(caster, "shake"))
			ui.add_log("%s가 동요 상태가 되었다!" % target.unit_name)
			spawn_floating_text("동요!", target.position + Vector2(0, -24), Color(0.5, 0.7, 1.0))
			if not applied_any:
				spawn_floating_text("성공!", target.position + Vector2(0, -52), Color(1.0, 0.8, 0.25))
			applied_any = true
	elif caster.intelligence >= 90:
		if rng.randf() < confusion_chance:
			target.apply_status("confusion", get_strategy_status_duration(caster, "confusion"))
			ui.add_log("%s이 혼란에 빠졌다!" % target.unit_name)
			spawn_floating_text("혼란!", target.position + Vector2(0, -38), Color(1.0, 0.9, 0.2))
			spawn_floating_text("성공!", target.position + Vector2(0, -52), Color(1.0, 0.8, 0.25))
			applied_any = true
		elif rng.randf() < shake_chance:
			target.apply_status("shake", get_strategy_status_duration(caster, "shake"))
			ui.add_log("%s가 동요 상태가 되었다!" % target.unit_name)
			spawn_floating_text("동요!", target.position + Vector2(0, -24), Color(0.5, 0.7, 1.0))
			spawn_floating_text("성공!", target.position + Vector2(0, -52), Color(1.0, 0.8, 0.25))
			applied_any = true
	else:
		if rng.randf() < shake_chance:
			target.apply_status("shake", get_strategy_status_duration(caster, "shake"))
			ui.add_log("%s가 동요 상태가 되었다!" % target.unit_name)
			spawn_floating_text("동요!", target.position + Vector2(0, -24), Color(0.5, 0.7, 1.0))
			spawn_floating_text("성공!", target.position + Vector2(0, -52), Color(1.0, 0.8, 0.25))
			applied_any = true

	if not applied_any:
		caster.strategy_state = "focus"
		ui.add_log("책략이 실패했다.")
		spawn_floating_text("실패!", target.position + Vector2(0, -52), Color(0.95, 0.45, 0.45))
	else:
		caster.strategy_state = "unstable"

	caster.refresh_visuals()
	caster.end_action()
	strategy_preview_target = null
	current_action_mode = "none"
	_after_action_cleanup(caster, target)


func get_strategy_status_duration(caster: BattleUnit, status_type: String) -> int:
	if caster.intelligence >= 95:
		if status_type == "confusion":
			return 2
		elif status_type == "shake":
			return 3
	elif caster.intelligence >= 90:
		if status_type == "confusion":
			return 1
		elif status_type == "shake":
			return 2
	elif caster.intelligence >= 80:
		return 1
	return 0


func _apply_strategy_state_modifier(caster: BattleUnit, base_probability: float) -> float:
	var final_probability := base_probability
	if caster.strategy_state == "focus":
		final_probability += 0.10
	elif caster.strategy_state == "unstable":
		final_probability -= 0.10
	return clampf(final_probability, 0.05, 0.8)


func _calculate_strategy_probabilities(caster: BattleUnit, target: BattleUnit) -> Dictionary:
	var int_diff := caster.intelligence - target.intelligence
	var shake_chance: float = 0.30 + int_diff * 0.005
	var confusion_chance: float = 0.20 + int_diff * 0.004
	if caster.intelligence >= 95:
		shake_chance += 0.10
		confusion_chance += 0.10
	shake_chance = _apply_strategy_state_modifier(caster, shake_chance)
	confusion_chance = _apply_strategy_state_modifier(caster, confusion_chance)
	return {
		"shake_chance": shake_chance,
		"confusion_chance": confusion_chance,
	}


func get_attack_direction_bonus(attacker: BattleUnit, defender: BattleUnit) -> float:
	var attack_direction := _get_direction_between(defender.grid_position, attacker.grid_position)
	if attack_direction == defender.facing:
		return FRONT_ATTACK_BONUS
	if attack_direction == -defender.facing:
		return BACK_ATTACK_BONUS
	return SIDE_ATTACK_BONUS


func calculate_crit_chance(attacker: BattleUnit, direction_type: String) -> float:
	var power_crit_bonus: float = attacker.power * 0.001
	var crit_chance: float = attacker.base_crit_chance + attacker.crit_bonus + power_crit_bonus
	if direction_type == "side":
		crit_chance += attacker.side_crit_bonus
	elif direction_type == "back":
		crit_chance += attacker.back_crit_bonus
	return clampf(crit_chance, 0.0, 0.8)


func _resolve_attack_damage(attacker: BattleUnit, defender: BattleUnit, bonus_damage: int, action_name: String) -> Dictionary:
	return _resolve_attack_damage_with_options(attacker, defender, bonus_damage, action_name)


func _resolve_basic_attack_damage(attacker: BattleUnit, defender: BattleUnit, bonus_damage: int, action_name: String) -> Dictionary:
	return _resolve_attack_damage_with_options(attacker, defender, bonus_damage, action_name, 1.0, true, true)


func _resolve_attack_damage_with_options(attacker: BattleUnit, defender: BattleUnit, bonus_damage: int, action_name: String, damage_scale: float = 1.0, use_direction_bonus: bool = true, apply_defense_reduction: bool = false) -> Dictionary:
	var base_damage := _calculate_damage(attacker, defender, bonus_damage)
	var direction_bonus := get_attack_direction_bonus(attacker, defender) if use_direction_bonus else 1.0
	var direction_type := _get_direction_type(direction_bonus) if use_direction_bonus else "front"
	var damage: float = float(base_damage) * direction_bonus * damage_scale
	var crit_chance: float = calculate_crit_chance(attacker, direction_type)
	var is_critical := rng.randf() < crit_chance
	if is_critical:
		damage *= attacker.crit_multiplier
	if apply_defense_reduction and defender.is_defending:
		damage = _apply_defense_damage_reduction(damage, direction_type)
	return {
		"damage": max(1, int(round(damage))),
		"direction_type": direction_type,
		"direction_label": _get_direction_label(direction_bonus) if use_direction_bonus else "",
		"is_critical": is_critical,
		"log_text": "%s %s" % [_get_direction_label(direction_bonus), action_name] if use_direction_bonus else action_name,
	}


func _apply_defense_damage_reduction(damage: float, direction_type: String) -> float:
	match direction_type:
		"front":
			return max(1.0, damage * 0.8)
		"side":
			return max(1.0, damage * 0.9)
		_:
			return max(1.0, damage)


func _is_melee_attack(attacker: BattleUnit, target: BattleUnit) -> bool:
	return grid.get_distance(attacker.grid_position, target.grid_position) <= 1


func _apply_counter_damage_if_needed(attacker: BattleUnit, target: BattleUnit, dealt_damage: int, target_was_alive: bool, attack_category: String) -> void:
	if not attacker.is_alive or not target_was_alive:
		return
	if attack_category in ["ranged_skill", "strategy", "area_skill"]:
		return
	if not _is_melee_attack(attacker, target):
		return

	# TODO v0.28+:
	# 병과가 추가되면 보병/기병/궁병/특수부대별로 근접 교전 피해율을 다르게 적용한다.
	# 예:
	# 보병 vs 보병: 기본 반격 피해
	# 기병 돌격: 공격자는 피해 적음, 대상 피해 큼
	# 창병 vs 기병: 기병 반격 피해 증가
	# 궁병 원거리: 반격 피해 없음
	# 지역/영웅 고유병은 별도 피해 보정 적용
	var counter_damage: int = max(1, int(round(float(dealt_damage) * 0.25)))
	attacker.receive_damage(counter_damage)
	spawn_floating_text("-%d" % counter_damage, attacker.position + Vector2(0, -12), Color(1.0, 0.55, 0.2))
	ui.add_log("%s도 교전 피해 -%d" % [attacker.unit_name, counter_damage])


func _get_direction_between(from_grid: Vector2i, to_grid: Vector2i) -> Vector2i:
	var delta := to_grid - from_grid
	if delta == Vector2i.ZERO:
		return Vector2i.ZERO
	if absi(delta.x) >= absi(delta.y):
		return Vector2i.RIGHT if delta.x > 0 else Vector2i.LEFT
	return Vector2i.DOWN if delta.y > 0 else Vector2i.UP


func _get_direction_label(direction_bonus: float) -> String:
	if is_equal_approx(direction_bonus, BACK_ATTACK_BONUS):
		return "후방"
	if is_equal_approx(direction_bonus, SIDE_ATTACK_BONUS):
		return "측면"
	return "전방"


func _get_direction_type(direction_bonus: float) -> String:
	if is_equal_approx(direction_bonus, BACK_ATTACK_BONUS):
		return "back"
	if is_equal_approx(direction_bonus, SIDE_ATTACK_BONUS):
		return "side"
	return "front"


func _show_front_tile(unit: BattleUnit) -> void:
	var front_tile := unit.grid_position + unit.facing
	if grid.is_in_bounds(front_tile):
		grid.highlight_tiles([front_tile], "front")


func _handle_right_click(mouse_position: Vector2) -> void:
	_last_mouse_input_source = "right"
	print("### RIGHT CLICK input detected / mode=", current_action_mode, " selected=", selected_unit)
	if current_action_mode == "choose_facing":
		if selected_unit == null:
			return
		if selected_unit.can_cancel_move:
			current_action_mode = "moved_unconfirmed"
		else:
			selected_unit.restore_move_origin(grid.grid_to_world(selected_unit.original_grid_position_before_move))
			current_action_mode = "unit_selected"
		_refresh_grid_highlights()
		_refresh_ui_for_selection()
		return
	if selected_unit != null and selected_unit.team == "player" and current_action_mode == "moved_unconfirmed":
		_cancel_selected_unit_move(false)
		return

	if selected_unit == null or selected_unit.team != "player":
		return
	if selected_unit.has_acted:
		return

	if current_action_mode in ["skill", "strategy", "attack"]:
		current_action_mode = "action_select"
		strategy_preview_target = null
		_refresh_grid_highlights()
		_refresh_ui_for_selection()
		return

	var clicked_unit := _get_unit_from_world(mouse_position)
	if clicked_unit != null and clicked_unit == selected_unit and current_action_mode in ["unit_selected", "action_select"] and not selected_unit.has_moved:
		_handle_hold_position(clicked_unit)
		return

	var clicked_grid := grid.world_to_grid(mouse_position)
	if not grid.is_in_bounds(clicked_grid):
		_deselect_selected_unit()
		return
	if current_action_mode in ["unit_selected", "action_select"] and clicked_grid == selected_unit.grid_position and not selected_unit.has_moved:
		_handle_hold_position(selected_unit)
		return
	_deselect_selected_unit()


func _cancel_selected_unit_move(clear_selection: bool = false) -> void:
	if selected_unit == null:
		return
	var unit_name := selected_unit.unit_name
	selected_unit.restore_move_origin(grid.grid_to_world(selected_unit.original_grid_position_before_move))
	if clear_selection:
		_clear_selection_state()
	else:
		current_action_mode = "unit_selected"
	grid.clear_highlights()
	ui.add_log("%s의 이동을 취소했습니다." % unit_name)
	if clear_selection:
		_refresh_ui_for_selection()
	else:
		_refresh_grid_highlights()
		_refresh_ui_for_selection()


func _deselect_selected_unit() -> void:
	_clear_selection_state()
	grid.clear_highlights()
	_refresh_ui_for_selection()


func _show_facing_choice_tiles(unit: BattleUnit) -> void:
	var choice_tiles: Array[Vector2i] = []
	for direction in [Vector2i.UP, Vector2i.DOWN, Vector2i.LEFT, Vector2i.RIGHT]:
		var tile: Vector2i = unit.grid_position + direction
		if grid.is_in_bounds(tile):
			choice_tiles.append(tile)
	grid.highlight_tiles(choice_tiles, "facing_choice")


func _handle_choose_facing_click(mouse_position: Vector2) -> void:
	if selected_unit == null:
		return
	var clicked_grid: Vector2i = grid.world_to_grid(mouse_position)
	if not grid.is_in_bounds(clicked_grid):
		return
	var chosen_direction: Vector2i = clicked_grid - selected_unit.grid_position
	if chosen_direction in [Vector2i.UP, Vector2i.DOWN, Vector2i.LEFT, Vector2i.RIGHT]:
		var unit: BattleUnit = selected_unit
		unit.set_facing(chosen_direction)
		unit.can_cancel_move = false
		current_action_mode = "action_select"
		grid.clear_highlights()
		_refresh_grid_highlights()
		_refresh_ui_for_selection()


func _handle_mouse_motion(mouse_position: Vector2) -> void:
	if current_action_mode != "strategy" or selected_unit == null:
		return
	var hovered_unit: BattleUnit = _get_unit_from_world(mouse_position)
	if hovered_unit != null and hovered_unit.team != selected_unit.team and _get_strategy_targets(selected_unit).has(hovered_unit):
		if strategy_preview_target != hovered_unit:
			strategy_preview_target = hovered_unit
			_refresh_strategy_preview()
	elif strategy_preview_target != null:
		strategy_preview_target = null
		_refresh_strategy_preview()


func spawn_floating_text(text: String, world_position: Vector2, color: Color) -> void:
	var floating_text := FloatingTextScene.instantiate()
	var stack_offset := float(floating_text_stack_index % 3) * 14.0
	floating_text_stack_index += 1
	add_child(floating_text)
	floating_text.position = world_position + Vector2(0, -stack_offset)
	floating_text.setup(text, color)


func spawn_hit_effect(effect_type: String, world_position: Vector2) -> void:
	var effect_text: String = "타격!"
	var effect_color: Color = Color(1.0, 1.0, 1.0)
	match effect_type:
		"cannon":
			effect_text = "포격!"
			effect_color = Color(0.7, 0.3, 1.0)
		"gun":
			effect_text = "사격!"
			effect_color = Color(1.0, 0.85, 0.35)
		"charge":
			effect_text = "돌격!"
			effect_color = Color(1.0, 0.45, 0.2)
		"buff":
			effect_text = "강화!"
			effect_color = Color(0.2, 1.0, 0.4)
		_:
			effect_text = "타격!"
			effect_color = Color(1.0, 1.0, 1.0)
	spawn_floating_text(effect_text, world_position + Vector2(0, -8), effect_color)


func _show_attack_popups(attacker: BattleUnit, defender: BattleUnit, attack_result: Dictionary, skill_text: String = "") -> void:
	spawn_floating_text("-%d" % int(attack_result["damage"]), defender.position, Color(1.0, 0.2, 0.2))
	var direction_label := String(attack_result["direction_label"])
	if direction_label == "후방":
		spawn_floating_text("후방!", defender.position + Vector2(0, -20), Color(1.0, 0.9, 0.2))
	elif direction_label == "측면":
		spawn_floating_text("측면!", defender.position + Vector2(0, -20), Color(1.0, 0.55, 0.15))
	if bool(attack_result["is_critical"]):
		spawn_floating_text("CRITICAL!", defender.position + Vector2(0, -36), Color(1.0, 0.3, 0.3))
	if not skill_text.is_empty():
		spawn_floating_text(skill_text, attacker.position + Vector2(0, -28), Color(0.7, 0.3, 1.0))


func _execute_hakikjin_barrage(attacker: BattleUnit) -> void:
	var targets := _get_skill_targets(attacker)
	if targets.is_empty():
		return
	var target_count := targets.size()
	var damage_scale := 1.0
	if target_count == 2:
		damage_scale = 0.85
	elif target_count >= 3:
		damage_scale = 0.70

	ui.add_log("%s이 학익진을 펼쳤다!" % attacker.unit_name)
	for target in targets:
		var attack_result := _resolve_attack_damage_with_options(attacker, target, 15, "학익진 포격", damage_scale, false)
		target.receive_damage(attack_result["damage"])
		spawn_hit_effect(attacker.skill_effect_type, target.global_position)
		_show_attack_popups(attacker, target, attack_result, "포격!")
		ui.add_log("%s이 %s를 %s%s -%d" % [attacker.unit_name, target.unit_name, attack_result["log_text"], _get_critical_log_suffix(attack_result), attack_result["damage"]])
	ui.add_log("%d명의 적에게 피해를 입혔다!" % target_count)
	attacker.put_skill_on_cooldown()
	attacker.end_action()


func _get_skill_popup_text(log_name: String) -> String:
	match log_name:
		"학익진 포격":
			return "포격!"
		"화승총 사격":
			return "사격!"
		"돌격":
			return "돌격!"
		_:
			return "%s!" % log_name


func _get_critical_log_suffix(attack_result: Dictionary) -> String:
	return "! CRITICAL!" if bool(attack_result["is_critical"]) else "!"


func _get_unit_from_world(world_position: Vector2) -> BattleUnit:
	for unit in units:
		if not unit.is_alive:
			continue
		if unit.position.distance_to(world_position) <= 40.0:
			return unit
	return null


func _get_team_units(team: String) -> Array[BattleUnit]:
	var result: Array[BattleUnit] = []
	for unit in units:
		if unit.team == team and unit.is_alive:
			result.append(unit)
	return result


func _get_attackable_enemies(unit: BattleUnit) -> Array[BattleUnit]:
	return grid.get_attackable_units(unit, units)


func _get_strategy_targets(unit: BattleUnit) -> Array[BattleUnit]:
	if not unit.can_use_strategy():
		return []
	return grid.get_attackable_units(unit, units, unit.get_strategy_range())


func _get_skill_targets(unit: BattleUnit) -> Array[BattleUnit]:
	match unit.skill_effect_type:
		"buff":
			return []
		"gun":
			return grid.get_attackable_units(unit, units, unit.get_skill_range())
		"charge":
			var targets: Array[BattleUnit] = []
			for enemy in _get_team_units("player" if unit.team == "enemy" else "enemy"):
				if _get_kenshin_charge_destination(unit, enemy) != Vector2i(-1, -1):
					targets.append(enemy)
			return targets
		_:
			return grid.get_attackable_units(unit, units, unit.get_skill_range())


func _can_player_use_skill(unit: BattleUnit) -> bool:
	if not unit.can_use_skill():
		return false
	if _is_buff_skill_unit(unit):
		return true
	return not _get_skill_targets(unit).is_empty()


func _can_player_use_strategy(unit: BattleUnit) -> bool:
	return unit.can_use_strategy() and unit.can_use_skill() and not _get_strategy_targets(unit).is_empty()


func _is_buff_skill_unit(unit: BattleUnit) -> bool:
	return unit.skill_effect_type == "buff"


func _refresh_strategy_preview() -> void:
	if selected_unit == null:
		return
	if current_action_mode != "strategy" or not selected_unit.can_use_strategy():
		ui.clear_strategy_preview(selected_unit)
		return
	var target: BattleUnit = strategy_preview_target
	if target == null:
		var targets: Array[BattleUnit] = _get_strategy_targets(selected_unit)
		if not targets.is_empty():
			target = targets[0]
	if target == null:
		ui.show_strategy_preview(selected_unit, null, {"shake_chance": 0.0, "confusion_chance": 0.0})
		return
	ui.show_strategy_preview(selected_unit, target, _calculate_strategy_probabilities(selected_unit, target))


func _get_kenshin_charge_destination(unit: BattleUnit, defender: BattleUnit) -> Vector2i:
	var candidates := grid.get_walkable_positions(unit, units)
	candidates.append(unit.grid_position)
	var best_tile := Vector2i(-1, -1)
	var best_dash_distance := 999
	for tile in candidates:
		var dash_distance := grid.get_distance(unit.grid_position, tile)
		var target_distance := grid.get_distance(tile, defender.grid_position)
		if dash_distance > 2:
			continue
		if target_distance != 1:
			continue
		if dash_distance < best_dash_distance:
			best_dash_distance = dash_distance
			best_tile = tile
	return best_tile


func _units_to_positions(target_units: Array[BattleUnit]) -> Array[Vector2i]:
	var positions: Array[Vector2i] = []
	for unit in target_units:
		positions.append(unit.grid_position)
	return positions


func _check_battle_result() -> void:
	var player_alive := false
	var enemy_alive := false
	for unit in units:
		if not unit.is_alive:
			continue
		if unit.team == "player":
			player_alive = true
		else:
			enemy_alive = true
	if not enemy_alive:
		battle_over = true
		if GameState.current_battle_type == "player_defense":
			if handle_world_map_defense_victory():
				return
		elif handle_world_map_victory():
			return
		ui.set_message("VICTORY")
		ui.set_action_buttons_visible(false)
		ui.set_actions_enabled(false, false, false, false, false, false)
	elif not player_alive:
		battle_over = true
		if GameState.current_battle_type == "player_defense":
			if handle_world_map_defense_defeat():
				return
		elif handle_world_map_defeat():
			return
		ui.set_message("DEFEAT")
		ui.set_action_buttons_visible(false)
		ui.set_actions_enabled(false, false, false, false, false, false)
