extends Node

var current_battle_type: String = ""
var current_attack_from_city_id: String = ""
var current_target_city_id: String = ""
var last_battle_result: String = ""
var last_world_message: String = ""
var current_turn_owner: String = "player"
var turn_count: int = 1
var pending_enemy_turn: bool = false
var player_controlled_city_id: String = "hanseong"
var pending_direct_defense: Dictionary = {}
var is_game_over: bool = false
var game_over_reason: String = ""
var is_world_unified: bool = false
var world_unified_message: String = ""

var cities := {
	"hanseong": {
		"name": "한성",
		"owner": "player",
		"x": 420,
		"y": 320,
		"neighbors": ["pyeongyang", "luoyang", "geonyeop"]
	},
	"pyeongyang": {
		"name": "평양",
		"owner": "enemy",
		"x": 420,
		"y": 160,
		"neighbors": ["hanseong", "geonyeop"]
	},
	"luoyang": {
		"name": "낙양",
		"owner": "enemy",
		"x": 220,
		"y": 320,
		"neighbors": ["hanseong"]
	},
	"geonyeop": {
		"name": "건업",
		"owner": "player",
		"x": 620,
		"y": 420,
		"neighbors": ["hanseong", "pyeongyang"]
	}
}


func get_city(city_id: String) -> Dictionary:
	if not cities.has(city_id):
		return {}
	return cities[city_id]


func get_city_name(city_id: String) -> String:
	if not cities.has(city_id):
		return city_id
	return str(cities[city_id].get("name", city_id))


func set_target_city(city_id: String) -> void:
	current_battle_type = "player_attack"
	current_attack_from_city_id = ""
	current_target_city_id = city_id


func clear_battle_context() -> void:
	current_battle_type = ""
	current_attack_from_city_id = ""
	current_target_city_id = ""
	last_battle_result = ""


func start_player_defense_battle(from_city_id: String, to_city_id: String) -> void:
	current_battle_type = "player_defense"
	current_attack_from_city_id = from_city_id
	current_target_city_id = to_city_id
	clear_pending_direct_defense()


func set_pending_direct_defense(from_city_id: String, to_city_id: String) -> void:
	pending_direct_defense = {
		"from": from_city_id,
		"to": to_city_id,
	}


func clear_pending_direct_defense() -> void:
	pending_direct_defense = {}


func has_pending_direct_defense() -> bool:
	return not pending_direct_defense.is_empty()


func find_fallback_capital_from_lost_city(lost_city_id: String) -> String:
	if not cities.has(lost_city_id):
		return ""

	var lost_city: Dictionary = cities[lost_city_id]
	var neighbors: Array = lost_city.get("neighbors", [])

	for neighbor_id_variant in neighbors:
		var neighbor_id: String = str(neighbor_id_variant)
		if not cities.has(neighbor_id):
			continue

		var neighbor: Dictionary = cities[neighbor_id]
		var neighbor_owner: String = str(neighbor.get("owner", ""))
		if neighbor_owner == "player":
			return neighbor_id

	return ""


func relocate_player_controlled_city(lost_city_id: String) -> bool:
	var fallback_city_id: String = find_fallback_capital_from_lost_city(lost_city_id)
	if fallback_city_id == "":
		return false

	player_controlled_city_id = fallback_city_id
	return true


func check_player_eliminated() -> bool:
	for city_id_variant in cities.keys():
		var city_id: String = str(city_id_variant)
		var city: Dictionary = cities[city_id]
		if str(city.get("owner", "")) == "player":
			return false
	return true


func trigger_game_over(reason: String = "패망했습니다.") -> void:
	is_game_over = true
	game_over_reason = reason
	is_world_unified = false
	world_unified_message = ""
	last_world_message = reason


func check_world_unification() -> bool:
	for city_id_variant in cities.keys():
		var city_id: String = str(city_id_variant)
		var city: Dictionary = cities[city_id]
		if str(city.get("owner", "")) != "player":
			return false
	return true


func trigger_world_unification() -> void:
	is_world_unified = true
	world_unified_message = "천하 통일"
	last_world_message = "천하 통일"
	is_game_over = false
	game_over_reason = ""
	pending_enemy_turn = false
	current_turn_owner = "player"


func update_global_victory_defeat_state() -> void:
	if check_world_unification():
		trigger_world_unification()
		return

	if check_player_eliminated():
		player_controlled_city_id = ""
		trigger_game_over("패망했습니다.")
		return

	is_game_over = false
	game_over_reason = ""
	is_world_unified = false
	world_unified_message = ""


func handle_player_capital_lost(lost_city_id: String) -> void:
	if lost_city_id == "":
		return

	set_city_owner(lost_city_id, "enemy")

	var relocated: bool = relocate_player_controlled_city(lost_city_id)
	if relocated:
		last_world_message = "%s이 함락되었습니다. 직할 도시가 %s으로 이전되었습니다." % [
			get_city_name(lost_city_id),
			get_city_name(player_controlled_city_id)
		]
		start_player_turn()
	else:
		player_controlled_city_id = ""
		trigger_game_over("패망했습니다.")
		last_world_message = "패망했습니다."


func mark_enemy_turn_pending() -> void:
	pending_enemy_turn = true
	current_turn_owner = "enemy"


func start_player_turn() -> void:
	pending_enemy_turn = false
	current_turn_owner = "player"
	turn_count += 1


func is_player_turn() -> bool:
	return current_turn_owner == "player"


func is_enemy_turn() -> bool:
	return current_turn_owner == "enemy"


func is_player_city(city_id: String) -> bool:
	if not cities.has(city_id):
		return false
	return cities[city_id].get("owner", "") == "player"


func is_enemy_city(city_id: String) -> bool:
	if not cities.has(city_id):
		return false
	return cities[city_id].get("owner", "") == "enemy"


func is_neutral_city(city_id: String) -> bool:
	if not cities.has(city_id):
		return false
	return cities[city_id].get("owner", "") == "neutral"


func can_attack_city(city_id: String) -> bool:
	if not cities.has(city_id):
		return false

	var city_owner: String = str(cities[city_id].get("owner", ""))
	if city_owner == "player":
		return false

	for neighbor_id in cities[city_id].get("neighbors", []):
		if is_player_city(neighbor_id):
			return true

	return false


func set_city_owner(city_id: String, new_owner: String) -> void:
	if not cities.has(city_id):
		return

	cities[city_id]["owner"] = new_owner


func get_enemy_invasion_candidates() -> Array:
	var candidates: Array = []

	for enemy_city_id_variant in cities.keys():
		var enemy_city_id: String = str(enemy_city_id_variant)
		var enemy_city: Dictionary = cities[enemy_city_id]
		var enemy_owner: String = str(enemy_city.get("owner", ""))
		if enemy_owner != "enemy":
			continue

		var neighbors: Array = enemy_city.get("neighbors", [])
		for target_city_id_variant in neighbors:
			var target_city_id: String = str(target_city_id_variant)
			if not cities.has(target_city_id):
				continue

			var target_city: Dictionary = cities[target_city_id]
			var target_owner: String = str(target_city.get("owner", ""))
			if target_owner != "player":
				continue

			candidates.append({
				"from": enemy_city_id,
				"to": target_city_id,
			})

	return candidates


func resolve_auto_invasion(from_city_id: String, to_city_id: String) -> Dictionary:
	var result := {
		"from": from_city_id,
		"to": to_city_id,
		"defender_won": true,
		"message": "",
	}

	if not cities.has(from_city_id) or not cities.has(to_city_id):
		result["message"] = "침공 정보를 찾을 수 없습니다."
		return result

	var from_city: Dictionary = cities[from_city_id]
	var to_city: Dictionary = cities[to_city_id]
	var from_name: String = str(from_city.get("name", from_city_id))
	var to_name: String = str(to_city.get("name", to_city_id))
	var defender_win_chance: int = 55
	var roll: int = randi() % 100

	if roll < defender_win_chance:
		result["defender_won"] = true
		result["message"] = "%s의 적군이 %s를 침공했으나, 아군이 방어에 성공했습니다." % [from_name, to_name]
	else:
		result["defender_won"] = false
		result["message"] = "%s의 적군이 %s를 침공했습니다. 아군이 패배하여 %s를 빼앗겼습니다." % [from_name, to_name, to_name]
		set_city_owner(to_city_id, "enemy")

	return result


func resolve_direct_city_auto_defense() -> Dictionary:
	var result := {
		"from": "",
		"to": "",
		"defender_won": true,
		"message": "",
	}

	if pending_direct_defense.is_empty():
		result["message"] = "처리할 직할 도시 방어전이 없습니다."
		return result

	var from_city_id: String = str(pending_direct_defense.get("from", ""))
	var to_city_id: String = str(pending_direct_defense.get("to", ""))
	result["from"] = from_city_id
	result["to"] = to_city_id

	if not cities.has(from_city_id) or not cities.has(to_city_id):
		result["message"] = "직할 도시 방어전 정보를 찾을 수 없습니다."
		clear_pending_direct_defense()
		return result

	var from_city: Dictionary = cities[from_city_id]
	var to_city: Dictionary = cities[to_city_id]
	var from_name: String = str(from_city.get("name", from_city_id))
	var to_name: String = str(to_city.get("name", to_city_id))
	var defender_win_chance: int = 65
	var roll: int = randi() % 100

	if roll < defender_win_chance:
		result["defender_won"] = true
		result["message"] = "%s의 적군이 %s를 공격했으나, 직할군이 방어에 성공했습니다." % [from_name, to_name]
	else:
		result["defender_won"] = false
		result["message"] = "%s의 적군이 %s를 공격했습니다. 방어에 실패했지만, 직할 도시는 아직 함락되지 않았습니다." % [from_name, to_name]

	clear_pending_direct_defense()
	return result


func occupy_city(city_id: String) -> void:
	if not cities.has(city_id):
		return

	set_city_owner(city_id, "player")
	last_battle_result = "victory"
