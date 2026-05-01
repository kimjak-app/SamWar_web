class_name TurnManager
extends Node

signal turn_started(turn_state: int)

enum TurnState {
	PLAYER_TURN,
	ENEMY_TURN,
}

var current_state: int = TurnState.PLAYER_TURN


func begin_turn(new_state: int, units: Array[BattleUnit]) -> void:
	current_state = new_state
	var target_team := "player" if current_state == TurnState.PLAYER_TURN else "enemy"
	for unit in units:
		if unit.is_alive and unit.team == target_team:
			unit.begin_turn()
	emit_signal("turn_started", current_state)


func process_end_of_turn(units: Array[BattleUnit]) -> void:
	var ending_team := get_current_team()
	for unit in units:
		if unit.is_alive and unit.team == ending_team:
			unit.decrement_status_effects()


func get_current_team() -> String:
	return "player" if current_state == TurnState.PLAYER_TURN else "enemy"


func should_end_turn(units: Array[BattleUnit]) -> bool:
	for unit in units:
		if unit.is_alive and unit.team == get_current_team() and not unit.has_acted:
			return false
	return true


func get_next_state() -> int:
	return TurnState.ENEMY_TURN if current_state == TurnState.PLAYER_TURN else TurnState.PLAYER_TURN
