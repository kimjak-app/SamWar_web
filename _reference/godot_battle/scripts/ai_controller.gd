class_name AIController
extends Node


func get_action_for_unit(unit: BattleUnit, _allies: Array[BattleUnit], enemies: Array[BattleUnit], grid: GridManager, all_units: Array[BattleUnit], rng: RandomNumberGenerator) -> Dictionary:
	var reachable_tiles := grid.get_walkable_positions(unit, all_units)
	var target := _select_target(unit, enemies, grid, reachable_tiles)
	var action := {
		"move_position": unit.grid_position,
		"action_type": "wait",
		"target": null,
	}

	if target == null:
		return action

	var skill_decision := unit.can_use_skill() and rng.randf() <= _get_skill_use_threshold(unit)
	if unit.ai_type == "support" and unit.can_use_skill():
		action["action_type"] = "skill"
		action["target"] = target
		return action
	if skill_decision and _can_use_skill_on_target(unit, target, reachable_tiles, grid):
		action["action_type"] = "skill"
		action["target"] = target
		action["move_position"] = _get_skill_move_position(unit, target, reachable_tiles, grid)
		return action

	var immediate_targets := grid.get_attackable_units(unit, enemies)
	if immediate_targets.has(target):
		action["action_type"] = "attack"
		action["target"] = target
		return action

	var attack_tile := _find_attack_position(unit, target, reachable_tiles, grid, enemies)
	if attack_tile != Vector2i(-1, -1):
		action["move_position"] = attack_tile
		action["action_type"] = "attack"
		action["target"] = target
		return action

	action["move_position"] = _get_best_chase_position(unit, target, reachable_tiles, enemies, grid)
	return action


func _select_target(unit: BattleUnit, enemies: Array[BattleUnit], grid: GridManager, reachable_tiles: Array[Vector2i]) -> BattleUnit:
	var living_enemies: Array[BattleUnit] = []
	for enemy in enemies:
		if enemy.is_alive:
			living_enemies.append(enemy)

	if living_enemies.is_empty():
		return null

	var best_target := living_enemies[0]
	for enemy in living_enemies:
		var candidate_score := _get_target_score(unit, enemy, reachable_tiles, grid, living_enemies)
		var best_score := _get_target_score(unit, best_target, reachable_tiles, grid, living_enemies)
		if candidate_score > best_score:
			best_target = enemy
	return best_target


func _find_attack_position(unit: BattleUnit, target: BattleUnit, reachable_tiles: Array[Vector2i], grid: GridManager, enemies: Array[BattleUnit]) -> Vector2i:
	var candidates := reachable_tiles.duplicate()
	candidates.append(unit.grid_position)
	return _get_best_attack_tile(unit, target, candidates, grid, enemies, unit.attack_range)


func _get_best_chase_position(unit: BattleUnit, target: BattleUnit, reachable_tiles: Array[Vector2i], enemies: Array[BattleUnit], grid: GridManager) -> Vector2i:
	var candidates := reachable_tiles.duplicate()
	candidates.append(unit.grid_position)
	var best_tile := unit.grid_position
	var best_score := -999999

	for tile in candidates:
		var score := -grid.get_distance(tile, target.grid_position) * 20
		if unit.ai_type == "aggressive":
			score -= grid.get_distance(tile, target.grid_position) * 5
			score += tile.x * 3
		elif unit.ai_type == "ranged":
			var nearest_enemy_distance := 99
			for enemy in enemies:
				if enemy.is_alive:
					nearest_enemy_distance = min(nearest_enemy_distance, grid.get_distance(tile, enemy.grid_position))
			score += nearest_enemy_distance * 15
		elif unit.ai_type == "defensive":
			score += _get_nearest_enemy_distance(tile, enemies, grid) * 12
		elif unit.ai_type == "support":
			score += _get_nearest_enemy_distance(tile, enemies, grid) * 10
		if score > best_score:
			best_score = score
			best_tile = tile
	return best_tile


func _can_use_skill_on_target(unit: BattleUnit, target: BattleUnit, reachable_tiles: Array[Vector2i], grid: GridManager) -> bool:
	if unit.ai_type == "support":
		return true
	if _uses_dash_skill(unit):
		return _get_skill_move_position(unit, target, reachable_tiles, grid) != Vector2i(-1, -1)
	return grid.get_distance(unit.grid_position, target.grid_position) <= unit.get_skill_range()


func _get_skill_move_position(unit: BattleUnit, target: BattleUnit, reachable_tiles: Array[Vector2i], grid: GridManager) -> Vector2i:
	if not _uses_dash_skill(unit):
		return unit.grid_position

	var candidates := reachable_tiles.duplicate()
	candidates.append(unit.grid_position)
	var filtered_candidates: Array[Vector2i] = []
	for tile in candidates:
		var dash_distance := grid.get_distance(unit.grid_position, tile)
		if dash_distance <= 2 and grid.get_distance(tile, target.grid_position) == 1:
			filtered_candidates.append(tile)
	return _get_best_attack_tile(unit, target, filtered_candidates, grid, [], 1)


func _get_target_score(unit: BattleUnit, target: BattleUnit, reachable_tiles: Array[Vector2i], grid: GridManager, enemies: Array[BattleUnit]) -> int:
	var candidates := reachable_tiles.duplicate()
	candidates.append(unit.grid_position)
	var effective_range: int = max(unit.attack_range, unit.get_skill_range())
	if _uses_dash_skill(unit):
		effective_range = max(effective_range, 1)
	var attack_tile := _get_best_attack_tile(unit, target, candidates, grid, enemies, effective_range)
	var base_distance := grid.get_distance(unit.grid_position, target.grid_position)
	var score: int = max(0, 40 - base_distance * _get_target_distance_weight(unit))

	if unit.ai_type == "assassin":
		score += max(0, 30 - int(float(target.troops) / 4.0))
	elif unit.ai_type == "support":
		score -= 25
	elif unit.ai_type == "defensive":
		score -= 10

	if attack_tile != Vector2i(-1, -1):
		var direction_bonus := _get_direction_bonus_for_position(attack_tile, target)
		score += _get_direction_priority(direction_bonus) * _get_direction_weight(unit)
		score += max(0, 20 - grid.get_distance(unit.grid_position, attack_tile) * 2)
	else:
		score -= 15

	return score


func _get_best_attack_tile(unit: BattleUnit, target: BattleUnit, candidates: Array[Vector2i], grid: GridManager, enemies: Array[BattleUnit], attack_range: int) -> Vector2i:
	var best_tile := Vector2i(-1, -1)
	var best_score := -999999

	for tile in candidates:
		if grid.get_distance(tile, target.grid_position) > attack_range:
			continue
		var score := _score_attack_tile(unit, target, tile, grid, enemies)
		if score > best_score:
			best_score = score
			best_tile = tile
	return best_tile


func _score_attack_tile(unit: BattleUnit, target: BattleUnit, tile: Vector2i, grid: GridManager, enemies: Array[BattleUnit]) -> int:
	var direction_bonus := _get_direction_bonus_for_position(tile, target)
	var score := _get_direction_priority(direction_bonus) * _get_direction_weight(unit)
	score -= grid.get_distance(unit.grid_position, tile) * _get_move_cost_weight(unit)
	score += max(0, 20 - grid.get_distance(unit.grid_position, target.grid_position) * _get_target_distance_weight(unit))

	if unit.ai_type == "aggressive":
		score += _get_direction_priority(direction_bonus) * 20
		score -= grid.get_distance(unit.grid_position, tile) * 2
	elif unit.ai_type == "ranged":
		score += grid.get_distance(tile, target.grid_position) * 18
		score += _get_nearest_enemy_distance(tile, enemies, grid) * 8
	elif unit.ai_type == "support":
		score -= 30
		score += _get_nearest_enemy_distance(tile, enemies, grid) * 10
	elif unit.ai_type == "defensive":
		score += _get_nearest_enemy_distance(tile, enemies, grid) * 12
		score += grid.get_distance(tile, target.grid_position) * 10
	elif unit.ai_type == "assassin":
		score += _get_direction_priority(direction_bonus) * 35
		score += max(0, 25 - int(float(target.troops) / 4.0))
	else:
		score += grid.get_distance(tile, target.grid_position) * 6

	return score


func _get_direction_priority(direction_bonus: float) -> int:
	if direction_bonus >= 1.3:
		return 3
	if direction_bonus >= 1.15:
		return 2
	return 1


func _get_direction_bonus_for_position(attack_position: Vector2i, defender: BattleUnit) -> float:
	var battle_scene := get_parent()
	if battle_scene != null and battle_scene.has_method("get_attack_direction_bonus"):
		var probe := BattleUnit.new()
		probe.grid_position = attack_position
		var bonus: float = battle_scene.get_attack_direction_bonus(probe, defender)
		probe.free()
		return bonus
	return 1.0


func _get_nearest_enemy_distance(tile: Vector2i, enemies: Array[BattleUnit], grid: GridManager) -> int:
	var nearest_enemy_distance := 99
	for enemy in enemies:
		if enemy.is_alive:
			nearest_enemy_distance = min(nearest_enemy_distance, grid.get_distance(tile, enemy.grid_position))
	return nearest_enemy_distance


func _get_move_cost_weight(unit: BattleUnit) -> int:
	if unit.ai_type == "aggressive":
		return 3
	if unit.ai_type == "ranged":
		return 8
	if unit.ai_type == "support":
		return 7
	if unit.ai_type == "defensive":
		return 9
	if unit.ai_type == "assassin":
		return 4
	return 5


func _get_target_distance_weight(unit: BattleUnit) -> int:
	if unit.ai_type == "aggressive":
		return 4
	if unit.ai_type == "ranged":
		return 2
	if unit.ai_type == "support":
		return 1
	if unit.ai_type == "defensive":
		return 1
	if unit.ai_type == "assassin":
		return 3
	return 3


func _get_skill_use_threshold(unit: BattleUnit) -> float:
	match unit.ai_type:
		"support":
			return 1.0
		"aggressive":
			return 0.55
		"ranged":
			return 0.5
		"defensive":
			return 0.25
		"assassin":
			return 0.6
		_:
			return 0.4


func _get_direction_weight(unit: BattleUnit) -> int:
	match unit.ai_type:
		"aggressive":
			return 120
		"assassin":
			return 140
		"ranged":
			return 90
		"support":
			return 60
		"defensive":
			return 80
		_:
			return 100


func _uses_dash_skill(unit: BattleUnit) -> bool:
	return unit.ai_type == "aggressive" and unit.attack_range <= 1 and unit.get_skill_range() <= 2
