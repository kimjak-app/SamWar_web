class_name GridManager
extends Node2D

const GRID_WIDTH := 10
const GRID_HEIGHT := 6
const TILE_SIZE := 100
const GRID_ORIGIN := Vector2i(460, 240)

const MOVE_HIGHLIGHT_COLOR := Color(0.2, 0.6, 1.0, 0.4)
const ATTACK_HIGHLIGHT_COLOR := Color(1.0, 0.2, 0.2, 0.4)
const FRONT_HIGHLIGHT_COLOR := Color(1.0, 1.0, 0.2, 0.5)
const FACING_CHOICE_HIGHLIGHT_COLOR := Color(1.0, 1.0, 0.2, 0.5)
const SKILL_RANGE_HIGHLIGHT_COLOR := Color(0.7, 0.3, 1.0, 0.18)
const SKILL_HIGHLIGHT_COLOR := Color(0.7, 0.3, 1.0, 0.4)
const BUFF_HIGHLIGHT_COLOR := Color(0.2, 1.0, 0.4, 0.4)

var highlighted_tiles := {
	"front": [] as Array[Vector2i],
	"facing_choice": [] as Array[Vector2i],
	"move": [] as Array[Vector2i],
	"attack": [] as Array[Vector2i],
	"skill_range": [] as Array[Vector2i],
	"skill": [] as Array[Vector2i],
	"buff": [] as Array[Vector2i],
}


func _ready() -> void:
	queue_redraw()


func grid_to_world(grid_pos: Vector2i) -> Vector2:
	var x := GRID_ORIGIN.x + grid_pos.x * TILE_SIZE + TILE_SIZE / 2.0
	var y := GRID_ORIGIN.y + grid_pos.y * TILE_SIZE + TILE_SIZE / 2.0
	return Vector2(x, y)


func world_to_grid(world_pos: Vector2) -> Vector2i:
	var local := world_pos - Vector2(GRID_ORIGIN)
	return Vector2i(floori(local.x / TILE_SIZE), floori(local.y / TILE_SIZE))


func is_in_bounds(grid_pos: Vector2i) -> bool:
	return grid_pos.x >= 0 and grid_pos.x < GRID_WIDTH and grid_pos.y >= 0 and grid_pos.y < GRID_HEIGHT


func get_distance(a: Vector2i, b: Vector2i) -> int:
	return absi(a.x - b.x) + absi(a.y - b.y)


func get_unit_at(grid_pos: Vector2i, units: Array) -> BattleUnit:
	for unit in units:
		if unit.is_alive and unit.grid_position == grid_pos:
			return unit
	return null


func get_walkable_positions(unit: BattleUnit, units: Array) -> Array[Vector2i]:
	var reachable: Array[Vector2i] = []
	for x in range(GRID_WIDTH):
		for y in range(GRID_HEIGHT):
			var candidate := Vector2i(x, y)
			if candidate == unit.grid_position:
				continue
			if get_distance(unit.grid_position, candidate) > unit.move_range:
				continue
			if get_unit_at(candidate, units) != null:
				continue
			reachable.append(candidate)
	return reachable


func get_attackable_units(unit: BattleUnit, units: Array, range_override: int = -1) -> Array[BattleUnit]:
	var targets: Array[BattleUnit] = []
	var attack_range := unit.attack_range if range_override < 0 else range_override
	for other in units:
		if not other.is_alive or other.team == unit.team:
			continue
		if get_distance(unit.grid_position, other.grid_position) <= attack_range:
			targets.append(other)
	return targets


func get_tiles_in_range(origin: Vector2i, tile_range: int, include_origin: bool = false) -> Array[Vector2i]:
	var tiles: Array[Vector2i] = []
	for x in range(GRID_WIDTH):
		for y in range(GRID_HEIGHT):
			var candidate := Vector2i(x, y)
			if not include_origin and candidate == origin:
				continue
			if get_distance(origin, candidate) <= tile_range:
				tiles.append(candidate)
	return tiles


func highlight_tiles(tiles: Array[Vector2i], mode: String) -> void:
	if not highlighted_tiles.has(mode):
		return
	highlighted_tiles[mode] = tiles.duplicate()
	queue_redraw()


func clear_highlights() -> void:
	for mode in highlighted_tiles.keys():
		highlighted_tiles[mode].clear()
	queue_redraw()


func _draw() -> void:
	var board_rect := Rect2(Vector2(GRID_ORIGIN), Vector2(GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE))
	draw_rect(board_rect, Color(0.11, 0.11, 0.13), true)

	for mode in ["front", "facing_choice", "move", "attack", "skill_range", "skill", "buff"]:
		var color := _get_highlight_color(mode)
		for tile in highlighted_tiles[mode]:
			var rect := Rect2(Vector2(GRID_ORIGIN + tile * TILE_SIZE), Vector2(TILE_SIZE, TILE_SIZE))
			draw_rect(rect, color, true)

	for x in range(GRID_WIDTH + 1):
		var from := Vector2(GRID_ORIGIN.x + x * TILE_SIZE, GRID_ORIGIN.y)
		var to := from + Vector2(0, GRID_HEIGHT * TILE_SIZE)
		draw_line(from, to, Color(0.5, 0.5, 0.55), 2.0)

	for y in range(GRID_HEIGHT + 1):
		var from := Vector2(GRID_ORIGIN.x, GRID_ORIGIN.y + y * TILE_SIZE)
		var to := from + Vector2(GRID_WIDTH * TILE_SIZE, 0)
		draw_line(from, to, Color(0.5, 0.5, 0.55), 2.0)


func _get_highlight_color(mode: String) -> Color:
	match mode:
		"front":
			return FRONT_HIGHLIGHT_COLOR
		"facing_choice":
			return FACING_CHOICE_HIGHLIGHT_COLOR
		"move":
			return MOVE_HIGHLIGHT_COLOR
		"attack":
			return ATTACK_HIGHLIGHT_COLOR
		"skill_range":
			return SKILL_RANGE_HIGHLIGHT_COLOR
		"skill":
			return SKILL_HIGHLIGHT_COLOR
		"buff":
			return BUFF_HIGHLIGHT_COLOR
		_:
			return MOVE_HIGHLIGHT_COLOR
