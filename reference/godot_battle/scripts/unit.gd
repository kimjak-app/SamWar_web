class_name BattleUnit
extends Node2D

const PLAYER_COLOR := Color(0.22, 0.48, 0.95)
const ENEMY_COLOR := Color(0.86, 0.28, 0.28)

var unit_name := ""
var team := ""
var troops := 0
var max_troops := 0
var power: int = 50
var intelligence: int = 50
var attack := 0
var defense := 0
var move_range := 0
var attack_range := 0
var skill_range := 0
var ai_type: String = "balanced"
var attack_effect_type: String = "normal"
var skill_effect_type: String = "normal"
var base_crit_chance: float = 0.12
var crit_bonus: float = 0.0
var crit_multiplier: float = 1.5
var side_crit_bonus: float = 0.05
var back_crit_bonus: float = 0.10
var facing := Vector2i.RIGHT
var original_grid_position_before_move := Vector2i.ZERO
var original_facing_before_move := Vector2i.RIGHT
var has_acted := false
var has_moved := false
var has_moved_this_turn := false
var is_defending := false
var can_cancel_move := false
var grid_position := Vector2i.ZERO
var is_alive := true
var skill_name := ""
var skill_cooldown := 0
var skill_current_cooldown := 0
var buff_attack_bonus := 0.0
var buff_turns := 0
var status_effects: Dictionary = {}
var strategy_state: String = "normal"

@onready var sprite: Sprite2D = $Sprite2D
@onready var name_label: Label = $NameLabel
@onready var troops_label: Label = $TroopsLabel
@onready var direction_label: Label = $DirectionLabel
@onready var status_label: Label = $StatusLabel as Label
@onready var selection_highlight: Polygon2D = $SelectionHighlight


func _ready() -> void:
	refresh_visuals()


func setup(data: Dictionary, world_position: Vector2) -> void:
	unit_name = data["unit_name"]
	team = data["team"]
	troops = data["troops"]
	max_troops = data["max_troops"]
	power = data.get("power", 50)
	intelligence = data.get("intelligence", 50)
	attack = data["attack"]
	defense = data["defense"]
	move_range = data["move_range"]
	attack_range = data["attack_range"]
	skill_range = data.get("skill_range", attack_range)
	ai_type = data.get("ai_type", "balanced")
	attack_effect_type = data.get("attack_effect_type", "normal")
	skill_effect_type = data.get("skill_effect_type", "normal")
	base_crit_chance = data.get("base_crit_chance", 0.12)
	crit_bonus = data.get("crit_bonus", 0.0)
	crit_multiplier = data.get("crit_multiplier", 1.5)
	side_crit_bonus = data.get("side_crit_bonus", 0.05)
	back_crit_bonus = data.get("back_crit_bonus", 0.10)
	grid_position = data["grid_position"]
	facing = data.get("facing", Vector2i.RIGHT)
	skill_name = data["skill_name"]
	skill_cooldown = data["skill_cooldown"]
	skill_current_cooldown = 0
	has_acted = false
	has_moved = false
	has_moved_this_turn = false
	is_defending = false
	can_cancel_move = false
	is_alive = true
	buff_attack_bonus = 0.0
	buff_turns = 0
	status_effects = {}
	strategy_state = data.get("strategy_state", "normal")
	original_grid_position_before_move = grid_position
	original_facing_before_move = facing
	position = world_position
	_create_texture()
	refresh_visuals()


func _create_texture() -> void:
	var image := Image.create(72, 72, false, Image.FORMAT_RGBA8)
	image.fill(PLAYER_COLOR if team == "player" else ENEMY_COLOR)
	var texture := ImageTexture.create_from_image(image)
	sprite.texture = texture
	sprite.centered = true


func begin_turn() -> void:
	has_acted = false
	has_moved = false
	has_moved_this_turn = false
	is_defending = false
	can_cancel_move = false
	original_grid_position_before_move = grid_position
	original_facing_before_move = facing
	if skill_current_cooldown > 0:
		skill_current_cooldown -= 1
	if buff_turns > 0:
		buff_turns -= 1
		if buff_turns <= 0:
			buff_attack_bonus = 0.0
	if has_status("confusion"):
		has_acted = true
	refresh_visuals()


func end_action() -> void:
	has_acted = true
	can_cancel_move = false
	refresh_visuals()


func commit_hold_position() -> void:
	has_moved = true
	has_moved_this_turn = true
	can_cancel_move = false
	refresh_visuals()


func get_current_attack() -> int:
	return int(round(get_attack_value() * (1.0 + buff_attack_bonus)))


func get_current_defense() -> int:
	return int(round(get_effective_defense()))


func get_attack_value() -> float:
	return power * 0.8 + intelligence * 0.2


func get_defense_value() -> float:
	return power * 0.6 + intelligence * 0.4


func get_effective_attack() -> float:
	var value: float = get_current_attack()
	if has_status("shake"):
		value *= 0.7
	return value


func get_effective_defense() -> float:
	var value: float = get_defense_value()
	if has_status("shake"):
		value *= 0.7
	return value


func move_to_grid(new_grid_position: Vector2i, world_position: Vector2) -> void:
	var move_delta := new_grid_position - grid_position
	if move_delta != Vector2i.ZERO:
		facing = _get_primary_direction(move_delta)
	grid_position = new_grid_position
	position = world_position
	has_moved = true
	has_moved_this_turn = true
	refresh_visuals()


func receive_damage(amount: int) -> void:
	troops = max(0, troops - amount)
	if troops <= 0:
		is_alive = false
		visible = false
	refresh_visuals()


func set_selected(is_selected: bool) -> void:
	selection_highlight.visible = is_selected and is_alive


func can_use_skill() -> bool:
	return is_alive and skill_current_cooldown <= 0 and not has_acted


func get_skill_range() -> int:
	return skill_range


func can_use_strategy() -> bool:
	return intelligence >= 80


func get_strategy_range() -> int:
	if intelligence >= 95:
		return 5
	elif intelligence >= 90:
		return 4
	elif intelligence >= 80:
		return 3
	return 0


func face_towards(target_grid_position: Vector2i) -> void:
	var direction := _get_primary_direction(target_grid_position - grid_position)
	if direction != Vector2i.ZERO:
		facing = direction
		refresh_visuals()


func set_facing(direction: Vector2i) -> void:
	if direction == Vector2i.ZERO:
		return
	facing = direction
	refresh_visuals()


func put_skill_on_cooldown() -> void:
	skill_current_cooldown = skill_cooldown


func apply_status(status_type: String, duration: int) -> void:
	if duration <= 0:
		return
	var current_duration := int(status_effects.get(status_type, 0))
	status_effects[status_type] = max(current_duration, duration)
	update_status_label()
	refresh_visuals()


func has_status(status_type: String) -> bool:
	return int(status_effects.get(status_type, 0)) > 0


func decrement_status_effects() -> void:
	var expired: Array[String] = []
	for status_type in status_effects.keys():
		var next_duration := int(status_effects[status_type]) - 1
		if next_duration <= 0:
			expired.append(String(status_type))
		else:
			status_effects[status_type] = next_duration
	for status_type in expired:
		status_effects.erase(status_type)
	update_status_label()
	refresh_visuals()


func mark_move_origin() -> void:
	original_grid_position_before_move = grid_position
	original_facing_before_move = facing


func restore_move_origin(world_position: Vector2) -> void:
	grid_position = original_grid_position_before_move
	facing = original_facing_before_move
	position = world_position
	has_moved = false
	has_moved_this_turn = false
	can_cancel_move = false
	refresh_visuals()


func refresh_visuals() -> void:
	name_label.text = unit_name
	troops_label.text = "병력 %d" % troops
	direction_label.text = _get_direction_symbol()
	update_status_label()
	modulate = Color.WHITE if is_alive else Color(1, 1, 1, 0.2)
	if has_acted and is_alive:
		sprite.modulate = Color(0.7, 0.7, 0.7)
	else:
		sprite.modulate = Color.WHITE


func update_status_label() -> void:
	var labels: Array[String] = []
	if has_status("confusion"):
		labels.append("혼란")
	if has_status("shake"):
		labels.append("동요")
	if is_defending:
		labels.append("방어")
	if strategy_state == "focus":
		labels.append("다음 책략: 집중 (+10%)")
	elif strategy_state == "unstable":
		labels.append("다음 책략: ⚡ 흔들림 (-10%)")
	if status_label:
		status_label.text = " / ".join(labels)


func _get_primary_direction(delta: Vector2i) -> Vector2i:
	if delta == Vector2i.ZERO:
		return Vector2i.ZERO
	if absi(delta.x) >= absi(delta.y):
		return Vector2i.RIGHT if delta.x > 0 else Vector2i.LEFT
	return Vector2i.DOWN if delta.y > 0 else Vector2i.UP


func _get_direction_symbol() -> String:
	match facing:
		Vector2i.UP:
			return "↑"
		Vector2i.DOWN:
			return "↓"
		Vector2i.LEFT:
			return "←"
		_:
			return "→"
