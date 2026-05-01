extends Control

@onready var info_label: Label = $InfoLabel
@onready var turn_label: Label = $TurnLabel
@onready var end_enemy_turn_button: Button = $EndEnemyTurnButton
@onready var player_end_turn_button: Button = $PlayerEndTurnButton
@onready var defense_choice_panel: Control = $DefenseChoicePanel
@onready var defense_title_label: Label = $DefenseChoicePanel/VBoxContainer/DefenseTitleLabel
@onready var direct_defense_button: Button = $DefenseChoicePanel/VBoxContainer/DirectDefenseButton
@onready var auto_defense_button: Button = $DefenseChoicePanel/VBoxContainer/AutoDefenseButton
@onready var city_container: Control = $CityContainer
const BATTLE_SCENE_PATH := "res://scenes/BattleScene.tscn"
const CITY_BUTTON_SIZE := Vector2(120, 56)
const LINK_COLOR := Color(0.85, 0.85, 0.85, 0.7)
const LINK_WIDTH := 3.0

func _ready() -> void:
	randomize()
	info_label.text = "도시를 선택하세요."

	print("[WorldMap] v0.26-4 실행 성공")
	print("[WorldMap] GameState 도시 목록: ", GameState.cities.keys())
	city_container.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if end_enemy_turn_button and not end_enemy_turn_button.pressed.is_connected(_on_end_enemy_turn_button_pressed):
		end_enemy_turn_button.pressed.connect(_on_end_enemy_turn_button_pressed)
	if player_end_turn_button and not player_end_turn_button.pressed.is_connected(_on_player_end_turn_button_pressed):
		player_end_turn_button.pressed.connect(_on_player_end_turn_button_pressed)
	if direct_defense_button and not direct_defense_button.pressed.is_connected(_on_direct_defense_button_pressed):
		direct_defense_button.pressed.connect(_on_direct_defense_button_pressed)
	if auto_defense_button and not auto_defense_button.pressed.is_connected(_on_auto_defense_button_pressed):
		auto_defense_button.pressed.connect(_on_auto_defense_button_pressed)
	refresh_world_map()


func _draw() -> void:
	draw_city_links()


func render_world_map() -> void:
	for child in city_container.get_children():
		child.queue_free()

	for city_id_variant in GameState.cities.keys():
		var city_id: String = str(city_id_variant)
		var city: Dictionary = GameState.cities[city_id]
		var button := Button.new()

		var city_name: String = str(city.get("name", city_id))
		var city_owner: String = str(city.get("owner", "neutral"))
		var city_x: float = float(city.get("x", 100))
		var city_y: float = float(city.get("y", 100))

		button.name = "CityButton_%s" % city_id
		button.text = "%s\n%s" % [city_name, _owner_label(city_owner)]
		button.position = Vector2(city_x, city_y)
		button.custom_minimum_size = CITY_BUTTON_SIZE

		_apply_city_style(button, city_owner)
		button.pressed.connect(func() -> void: _on_city_pressed(city_id))

		city_container.add_child(button)

	queue_redraw()


func refresh_world_map() -> void:
	render_world_map()
	_apply_world_state_message()
	update_turn_ui()
	update_turn_controls()


func process_enemy_turn() -> void:
	if GameState.is_game_over or GameState.is_world_unified:
		refresh_world_map()
		return

	var candidates: Array = GameState.get_enemy_invasion_candidates()
	if candidates.is_empty():
		info_label.text = "적군이 침공할 수 있는 아군 도시가 없습니다."
		GameState.start_player_turn()
		refresh_world_map()
		return

	var selected_index: int = randi() % candidates.size()
	var invasion: Dictionary = candidates[selected_index]
	var from_city_id: String = str(invasion.get("from", ""))
	var to_city_id: String = str(invasion.get("to", ""))

	if to_city_id == GameState.player_controlled_city_id:
		GameState.set_pending_direct_defense(from_city_id, to_city_id)
		show_direct_defense_choice(from_city_id, to_city_id)
		return

	var result: Dictionary = GameState.resolve_auto_invasion(from_city_id, to_city_id)
	GameState.update_global_victory_defeat_state()
	if GameState.is_game_over or GameState.is_world_unified:
		refresh_world_map()
		return
	info_label.text = str(result.get("message", "적 턴 처리 완료."))
	GameState.start_player_turn()
	refresh_world_map()


func show_direct_defense_choice(from_city_id: String, to_city_id: String) -> void:
	if GameState.is_game_over or GameState.is_world_unified:
		defense_choice_panel.visible = false
		return

	var from_city: Dictionary = GameState.get_city(from_city_id)
	var to_city: Dictionary = GameState.get_city(to_city_id)
	var from_name: String = str(from_city.get("name", from_city_id))
	var to_name: String = str(to_city.get("name", to_city_id))

	info_label.text = "%s의 적군이 %s를 공격했습니다. 방어 방식을 선택하세요." % [from_name, to_name]
	defense_title_label.text = "%s 방어전: 직접 조작 또는 자동전투를 선택하세요." % to_name
	defense_choice_panel.visible = true
	update_turn_ui()
	update_turn_controls()


func draw_city_links() -> void:
	var drawn_links := {}
	var city_center_offset := CITY_BUTTON_SIZE * 0.5

	for city_id_variant in GameState.cities.keys():
		var city_id: String = str(city_id_variant)
		var city: Dictionary = GameState.cities[city_id]
		var neighbors: Array = city.get("neighbors", [])

		for neighbor_id_variant in neighbors:
			var neighbor_id: String = str(neighbor_id_variant)
			if not GameState.cities.has(neighbor_id):
				continue

			var link_key_a := "%s_%s" % [city_id, neighbor_id]
			var link_key_b := "%s_%s" % [neighbor_id, city_id]
			if drawn_links.has(link_key_a) or drawn_links.has(link_key_b):
				continue

			var neighbor: Dictionary = GameState.cities[neighbor_id]
			var city_x: float = float(city.get("x", 0))
			var city_y: float = float(city.get("y", 0))
			var neighbor_x: float = float(neighbor.get("x", 0))
			var neighbor_y: float = float(neighbor.get("y", 0))

			var start_pos := Vector2(city_x, city_y) + city_center_offset
			var end_pos := Vector2(neighbor_x, neighbor_y) + city_center_offset
			draw_line(start_pos, end_pos, LINK_COLOR, LINK_WIDTH)

			drawn_links[link_key_a] = true


func update_turn_ui() -> void:
	if GameState.is_game_over:
		turn_label.text = "GAME OVER"
		return
	if GameState.is_world_unified:
		turn_label.text = "UNIFIED"
		return

	var turn_owner_label := "PLAYER"
	if GameState.is_enemy_turn():
		turn_owner_label = "ENEMY"

	turn_label.text = "Turn %d - %s" % [GameState.turn_count, turn_owner_label]


func update_turn_controls() -> void:
	if GameState.is_game_over or GameState.is_world_unified:
		end_enemy_turn_button.visible = false
		player_end_turn_button.visible = false
		defense_choice_panel.visible = false
		return

	end_enemy_turn_button.visible = GameState.is_enemy_turn() and not GameState.has_pending_direct_defense()
	player_end_turn_button.visible = GameState.is_player_turn() and not GameState.has_pending_direct_defense()


func _apply_world_state_message() -> void:
	if GameState.is_game_over:
		info_label.text = GameState.game_over_reason
		return

	if GameState.is_world_unified:
		info_label.text = GameState.world_unified_message
		return

	if GameState.last_world_message != "":
		info_label.text = GameState.last_world_message
		GameState.last_world_message = ""


func _owner_label(city_owner: String) -> String:
	if city_owner == "player":
		return "아군"
	elif city_owner == "enemy":
		return "적군"
	return "중립"


func _apply_city_style(button: Button, city_owner: String) -> void:
	if city_owner == "player":
		button.modulate = Color(0.35, 0.55, 1.0)
	elif city_owner == "enemy":
		button.modulate = Color(1.0, 0.35, 0.35)
	else:
		button.modulate = Color(0.65, 0.65, 0.65)


func _on_city_pressed(city_id: String) -> void:
	if GameState.is_game_over:
		info_label.text = GameState.game_over_reason
		return

	if GameState.is_world_unified:
		info_label.text = GameState.world_unified_message
		return

	if GameState.has_pending_direct_defense():
		info_label.text = "직할 도시 방어 방식을 먼저 선택하세요."
		return

	if not GameState.is_player_turn():
		info_label.text = "현재는 적 턴입니다. 적 턴을 종료하세요."
		return

	var city: Dictionary = GameState.get_city(city_id)
	if city.is_empty():
		info_label.text = "도시 정보를 찾을 수 없습니다."
		return

	var city_name: String = str(city.get("name", city_id))
	var city_owner: String = str(city.get("owner", "neutral"))

	if city_owner == "player":
		if city_id == GameState.player_controlled_city_id:
			info_label.text = "%s: 현재 직할 도시입니다." % city_name
		else:
			info_label.text = "%s: 아군 도시입니다." % city_name
		return

	if not GameState.can_attack_city(city_id):
		info_label.text = "%s: 인접한 아군 도시가 없어 공격할 수 없습니다." % city_name
		return

	info_label.text = "%s 공격 개시!" % city_name
	GameState.set_target_city(city_id)

	var err: Error = get_tree().change_scene_to_file(BATTLE_SCENE_PATH)
	if err != OK:
		info_label.text = "전투씬 이동 실패: %s" % err
		print("[WorldMap] 전투씬 이동 실패: ", err)


func _on_end_enemy_turn_button_pressed() -> void:
	print("[WorldMap] 적 턴 종료 버튼 클릭")

	if GameState.is_game_over:
		info_label.text = GameState.game_over_reason
		update_turn_controls()
		return

	if GameState.is_world_unified:
		info_label.text = GameState.world_unified_message
		update_turn_controls()
		return

	if GameState.has_pending_direct_defense():
		info_label.text = "직할 도시 방어 방식을 먼저 선택하세요."
		update_turn_controls()
		return

	if not GameState.is_enemy_turn():
		info_label.text = "현재는 플레이어 턴입니다."
		refresh_world_map()
		return

	process_enemy_turn()


func _on_player_end_turn_button_pressed() -> void:
	print("[WorldMap] 아군 턴 종료 버튼 클릭")

	if GameState.is_game_over:
		info_label.text = GameState.game_over_reason
		update_turn_controls()
		return

	if GameState.is_world_unified:
		info_label.text = GameState.world_unified_message
		update_turn_controls()
		return

	if GameState.has_pending_direct_defense():
		info_label.text = "직할 도시 방어 방식을 먼저 선택하세요."
		update_turn_controls()
		return

	if not GameState.is_player_turn():
		return

	GameState.mark_enemy_turn_pending()
	refresh_world_map()


func _on_direct_defense_button_pressed() -> void:
	print("[WorldMap] 직접 방어전 선택")

	if GameState.is_game_over:
		info_label.text = GameState.game_over_reason
		return

	if GameState.is_world_unified:
		info_label.text = GameState.world_unified_message
		return

	if not GameState.has_pending_direct_defense():
		return

	var defense: Dictionary = GameState.pending_direct_defense
	var from_city_id: String = str(defense.get("from", defense.get("from_city_id", "")))
	var to_city_id: String = str(defense.get("to", defense.get("to_city_id", "")))

	if from_city_id == "" or to_city_id == "":
		info_label.text = "직접 방어전 정보를 찾을 수 없습니다."
		return

	GameState.start_player_defense_battle(from_city_id, to_city_id)
	var err: Error = get_tree().change_scene_to_file(BATTLE_SCENE_PATH)
	if err != OK:
		info_label.text = "전투씬 이동 실패: %s" % err
		print("[WorldMap] 직접 방어전 이동 실패: ", err)
		return

	defense_choice_panel.visible = false


func _on_auto_defense_button_pressed() -> void:
	print("[WorldMap] 자동 방어전 선택")

	if GameState.is_game_over:
		info_label.text = GameState.game_over_reason
		return

	if GameState.is_world_unified:
		info_label.text = GameState.world_unified_message
		return

	if not GameState.has_pending_direct_defense():
		return

	var defense: Dictionary = GameState.pending_direct_defense
	var lost_city_id: String = str(defense.get("to", defense.get("to_city_id", "")))
	var result: Dictionary = GameState.resolve_direct_city_auto_defense()
	defense_choice_panel.visible = false

	if bool(result.get("defender_won", true)):
		GameState.last_world_message = "%s 방어에 성공했습니다." % GameState.get_city_name(lost_city_id)
		GameState.start_player_turn()
	else:
		GameState.handle_player_capital_lost(lost_city_id)
		GameState.update_global_victory_defeat_state()

	refresh_world_map()
