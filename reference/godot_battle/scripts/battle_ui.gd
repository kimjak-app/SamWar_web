class_name BattleUI
extends CanvasLayer

signal attack_pressed
signal skill_pressed
signal strategy_pressed
signal wait_pressed
signal defend_pressed
signal end_turn_pressed

const MAX_LOG_LINES := 5

var log_lines: Array[String] = []
var skill_descriptions := {
	"이순신": "사거리 내 모든 적에게 포격합니다. 대상 수가 많을수록 피해가 감소합니다.",
	"정도전": "아군 전체 공격력을 15% 증가시킵니다. 2턴 지속.",
	"노부나가": "사거리 2칸 이내 적 1명에게 추가 피해를 줍니다.",
	"겐신": "2칸 이내 적에게 돌진하여 큰 피해를 줍니다.",
}

@onready var turn_label: Label = $TurnLabel
@onready var result_label: Label = $ResultLabel
@onready var selected_info_label: Label = $BottomPanel/SelectedInfoLabel
@onready var skill_description_label: Label = $BottomPanel/SkillDescriptionLabel
@onready var attack_button: Button = $BottomPanel/AttackButton
@onready var skill_button: Button = $BottomPanel/SkillButton
@onready var strategy_button: Button = $BottomPanel/StrategyButton
@onready var wait_button: Button = $BottomPanel/WaitButton
@onready var defend_button: Button = $BottomPanel/DefendButton
@onready var end_turn_button: Button = $BottomPanel/EndTurnButton
@onready var log_label: RichTextLabel = $BottomPanel/LogLabel


func _ready() -> void:
	attack_button.pressed.connect(func() -> void: emit_signal("attack_pressed"))
	skill_button.pressed.connect(func() -> void: emit_signal("skill_pressed"))
	strategy_button.pressed.connect(func() -> void: emit_signal("strategy_pressed"))
	wait_button.pressed.connect(func() -> void: emit_signal("wait_pressed"))
	defend_button.pressed.connect(func() -> void: emit_signal("defend_pressed"))
	end_turn_button.pressed.connect(func() -> void: emit_signal("end_turn_pressed"))
	attack_button.text = "기본 공격"
	strategy_button.text = "책략"
	wait_button.text = "대기"
	defend_button.text = "방어"
	set_message("")
	update_selected_unit_info(null)
	set_actions_enabled(false, false, false, false, false, true)
	set_action_buttons_visible(false)


func set_turn_text(text: String) -> void:
	turn_label.text = text


func set_message(text: String) -> void:
	result_label.text = text
	result_label.visible = not text.is_empty()


func update_selected_unit_info(unit: BattleUnit) -> void:
	if unit == null:
		selected_info_label.text = "선택 유닛: 없음"
		skill_button.text = "스킬"
		strategy_button.disabled = true
		skill_description_label.text = ""
		return
	var buff_text := ""
	if unit.buff_turns > 0:
		buff_text = " | 공격 버프 %d턴" % unit.buff_turns
	var defend_text := " | 방어 중" if unit.is_defending else ""
	var cooldown_text := " | 스킬 CD %d" % unit.skill_current_cooldown
	selected_info_label.text = "%s | 병력 %d/%d | 공격 %d | 방어 %d%s%s%s" % [
		unit.unit_name,
		unit.troops,
		unit.max_troops,
		unit.get_current_attack(),
		unit.get_current_defense(),
		buff_text,
		defend_text,
		cooldown_text,
	]
	skill_button.text = unit.skill_name
	skill_description_label.text = "%s: %s" % [unit.skill_name, skill_descriptions.get(unit.unit_name, "")]


func show_strategy_preview(caster: BattleUnit, target: BattleUnit, preview: Dictionary) -> void:
	if caster == null:
		skill_description_label.text = ""
		return
	var flow_text := "상태: 기본"
	if caster.strategy_state == "focus":
		flow_text = "다음 책략: 집중 (+10%)"
	elif caster.strategy_state == "unstable":
		flow_text = "다음 책략: ⚡ 흔들림 (-10%)"

	var header := "책략"
	if target != null:
		header = "책략 대상: %s" % target.unit_name

	var shake_percent := int(round(float(preview.get("shake_chance", 0.0)) * 100.0))
	var confusion_percent := int(round(float(preview.get("confusion_chance", 0.0)) * 100.0))
	skill_description_label.text = "%s\n동요: %d%%\n혼란: %d%%\n%s" % [
		header,
		shake_percent,
		confusion_percent,
		flow_text,
	]


func clear_strategy_preview(unit: BattleUnit) -> void:
	if unit == null:
		skill_description_label.text = ""
		return
	skill_description_label.text = "%s: %s" % [unit.skill_name, skill_descriptions.get(unit.unit_name, "")]


func set_selected_unit(unit: BattleUnit) -> void:
	update_selected_unit_info(unit)


func set_actions_enabled(can_attack: bool, can_skill: bool, can_strategy: bool, can_wait: bool, can_defend: bool, can_end_turn: bool) -> void:
	attack_button.disabled = not can_attack
	skill_button.disabled = not can_skill
	strategy_button.disabled = not can_strategy
	wait_button.disabled = not can_wait
	defend_button.disabled = not can_defend
	end_turn_button.disabled = not can_end_turn


func set_action_buttons_visible(should_show: bool) -> void:
	attack_button.visible = should_show
	skill_button.visible = should_show
	strategy_button.visible = should_show
	wait_button.visible = should_show
	defend_button.visible = should_show


func set_end_turn_button_text(text: String) -> void:
	end_turn_button.text = text


func add_log(text: String) -> void:
	log_lines.append(text)
	while log_lines.size() > MAX_LOG_LINES:
		log_lines.pop_front()
	log_label.text = "\n".join(log_lines)
