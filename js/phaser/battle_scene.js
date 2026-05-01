import { getDirectionLabel } from "../core/battle_direction.js";
import { getSkillById } from "../core/battle_skills.js";
import { hasStatus } from "../core/battle_strategy.js";

function getEffectStyle(kind) {
  if (kind === "damage") {
    return { color: "#ff9f9f", stroke: "#3f0d0d", size: "26px" };
  }

  if (kind === "buff") {
    return { color: "#9ef3b0", stroke: "#0f3020", size: "22px" };
  }

  if (kind === "angle") {
    return { color: "#ffd166", stroke: "#5a2d0c", size: "22px" };
  }

  if (kind === "counter") {
    return { color: "#ffb86b", stroke: "#5a210f", size: "22px" };
  }

  if (kind === "strategy") {
    return { color: "#f9e27d", stroke: "#5b4810", size: "22px" };
  }

  if (kind === "failure" || kind === "fail") {
    return { color: "#ffb4b4", stroke: "#5a1f1f", size: "22px" };
  }

  if (kind === "status") {
    return { color: "#9ef3b0", stroke: "#17351f", size: "22px" };
  }

  if (kind === "defend" || kind === "wait" || kind === "facing") {
    return { color: "#c7d2fe", stroke: "#202c5a", size: "20px" };
  }

  return { color: "#f8d798", stroke: "#4a2c0f", size: "24px" };
}

function buildActionSignature(lastAction) {
  if (!lastAction) {
    return null;
  }

  const targetIds = lastAction.targetUnitIds?.join(",") ?? "";
  const effectTexts = (lastAction.effects ?? [])
    .map((effect) => `${effect.unitId ?? "none"}:${effect.kind}:${effect.text}`)
    .join("|");

  return `${lastAction.type}:${lastAction.actorUnitId ?? "none"}:${targetIds}:${effectTexts}`;
}

export function createBattleSceneDefinition({ battleState, callbacks = {}, onSceneReady } = {}) {
  const PhaserLib = window.Phaser;
  const sceneKey = `samwar-battle-${battleState.id}`;

  return class BattleScene extends PhaserLib.Scene {
    constructor() {
      super(sceneKey);
      this.battleState = battleState;
      this.callbacks = callbacks;
      this.board = null;
      this.cellWidth = 0;
      this.cellHeight = 0;
      this.dynamicLayer = null;
      this.headerTitleText = null;
      this.headerStatusText = null;
      this.lastRenderedActionSignature = null;
    }

    getUnitPoint(unit) {
      return {
        x: this.board.x + this.cellWidth * unit.x + this.cellWidth / 2,
        y: this.board.y + this.cellHeight * unit.y + this.cellHeight / 2,
      };
    }

    syncBattleState(nextBattleState, nextCallbacks = {}) {
      this.battleState = nextBattleState;
      this.callbacks = nextCallbacks;
      this.redrawBattle();
    }

    create() {
      const width = this.scale.width;
      const height = this.scale.height;
      this.board = {
        x: 92,
        y: 118,
        width: width - 184,
        height: height - 210,
      };
      this.cellWidth = this.board.width / this.battleState.grid.width;
      this.cellHeight = this.board.height / this.battleState.grid.height;

      this.cameras.main.setBackgroundColor("#081018");

      this.add.rectangle(width / 2, height / 2, width, height, 0x081018, 1);
      this.add.rectangle(width / 2, height / 2, width - 44, height - 44, 0x0d1622, 1)
        .setStrokeStyle(2, 0xd1b075, 0.24);

      this.headerTitleText = this.add.text(96, 40, "전투 테스트", {
        color: "#f3ead9",
        fontFamily: "Georgia, serif",
        fontSize: "34px",
        fontStyle: "bold",
      });
      this.headerStatusText = this.add.text(96, 82, "", {
        color: "#d1b075",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "18px",
      });

      const boardBackground = this.add.rectangle(
        this.board.x + this.board.width / 2,
        this.board.y + this.board.height / 2,
        this.board.width,
        this.board.height,
        0x122031,
        0.9,
      );
      boardBackground.setStrokeStyle(2, 0xf8d798, 0.26);

      this.dynamicLayer = this.add.container(0, 0);
      this.redrawBattle();
      onSceneReady?.(this);
    }

    redrawBattle() {
      if (!this.dynamicLayer) {
        return;
      }

      this.dynamicLayer.removeAll(true);
      this.headerStatusText?.setText(`${this.battleState.defenderCityName} 전장`);
      this.renderHighlights();
      this.renderGrid();
      this.renderUnits();
      this.renderInstructionText();
      this.renderFloatingEffects();
    }

    renderHighlights() {
      const highlights = this.battleState.highlights ?? {};

      (highlights.move ?? []).forEach((position) => {
        const rect = this.add.rectangle(
          this.board.x + this.cellWidth * position.x + this.cellWidth / 2,
          this.board.y + this.cellHeight * position.y + this.cellHeight / 2,
          this.cellWidth - 8,
          this.cellHeight - 8,
          0x2c9fff,
          0.26,
        ).setStrokeStyle(2, 0x5bb8ff, 0.7);
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => this.callbacks.onMoveUnit?.(position));
        this.dynamicLayer.add(rect);
      });

      (highlights.attack ?? []).forEach((position) => {
        const rect = this.add.rectangle(
          this.board.x + this.cellWidth * position.x + this.cellWidth / 2,
          this.board.y + this.cellHeight * position.y + this.cellHeight / 2,
          this.cellWidth - 10,
          this.cellHeight - 10,
          0xff7b7b,
          0.18,
        ).setStrokeStyle(2, 0xff7b7b, 0.72);
        this.dynamicLayer.add(rect);
      });

      (highlights.skill ?? []).forEach((position) => {
        const rect = this.add.rectangle(
          this.board.x + this.cellWidth * position.x + this.cellWidth / 2,
          this.board.y + this.cellHeight * position.y + this.cellHeight / 2,
          this.cellWidth - 14,
          this.cellHeight - 14,
          0x8b5cf6,
          0.24,
        ).setStrokeStyle(2, 0xd8b4fe, 0.8);
        this.dynamicLayer.add(rect);
      });

      (highlights.strategy ?? []).forEach((position) => {
        const rect = this.add.rectangle(
          this.board.x + this.cellWidth * position.x + this.cellWidth / 2,
          this.board.y + this.cellHeight * position.y + this.cellHeight / 2,
          this.cellWidth - 12,
          this.cellHeight - 12,
          0x7dd3fc,
          0.2,
        ).setStrokeStyle(2, 0xa5f3fc, 0.8);
        this.dynamicLayer.add(rect);
      });

      (highlights.facing ?? []).forEach((position) => {
        const rect = this.add.rectangle(
          this.board.x + this.cellWidth * position.x + this.cellWidth / 2,
          this.board.y + this.cellHeight * position.y + this.cellHeight / 2,
          this.cellWidth - 12,
          this.cellHeight - 12,
          0xf8d798,
          0.18,
        ).setStrokeStyle(2, 0xf8d798, 0.8);
        const label = this.add.text(rect.x, rect.y, getDirectionLabel(position.direction), {
          color: "#f8d798",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "24px",
          fontStyle: "bold",
        }).setOrigin(0.5, 0.5);
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => this.callbacks.onSetFacing?.(position.direction));
        label.setInteractive({ useHandCursor: true });
        label.on("pointerdown", () => this.callbacks.onSetFacing?.(position.direction));
        this.dynamicLayer.add([rect, label]);
      });
    }

    renderGrid() {
      for (let x = 0; x <= this.battleState.grid.width; x += 1) {
        const lineX = this.board.x + this.cellWidth * x;
        const line = this.add.line(0, 0, lineX, this.board.y, lineX, this.board.y + this.board.height, 0xf8d798, 0.16)
          .setOrigin(0, 0)
          .setLineWidth(1);
        this.dynamicLayer.add(line);
      }

      for (let y = 0; y <= this.battleState.grid.height; y += 1) {
        const lineY = this.board.y + this.cellHeight * y;
        const line = this.add.line(0, 0, this.board.x, lineY, this.board.x + this.board.width, lineY, 0xf8d798, 0.16)
          .setOrigin(0, 0)
          .setLineWidth(1);
        this.dynamicLayer.add(line);
      }
    }

    renderUnits() {
      const selectedUnitId = this.battleState.selectedUnitId;

      this.battleState.units.forEach((unit) => {
        if (!unit.isAlive) {
          return;
        }

        const unitPoint = this.getUnitPoint(unit);
        const fillColor = unit.side === "player" ? 0x5bb8ff : 0xff7b7b;
        const skill = getSkillById(this.battleState.skills, unit.skillId);
        const unitGroup = this.add.container(unitPoint.x, unitPoint.y);
        const selectionRing = this.add.circle(0, 0, 34, 0xf8d798, unit.id === selectedUnitId ? 0.22 : 0);
        const badge = this.add.circle(0, 0, 26, fillColor, 0.96).setStrokeStyle(4, 0xf3ead9, 0.92);
        const label = this.add.text(0, -58, unit.name, {
          color: "#f3ead9",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "18px",
          fontStyle: "bold",
          align: "center",
        }).setOrigin(0.5, 0.5);
        const facingText = this.add.text(0, -38, getDirectionLabel(unit.facing), {
          color: "#f8d798",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "20px",
          fontStyle: "bold",
          align: "center",
        }).setOrigin(0.5, 0.5);
        const hpText = this.add.text(0, 44, `병력 ${unit.troops} / ${unit.maxTroops}`, {
          color: "#dbe6f3",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "16px",
          align: "center",
        }).setOrigin(0.5, 0.5);
        const cooldownText = this.add.text(0, 62, `${skill?.name ?? "특기"} CD ${unit.currentSkillCooldown}`, {
          color: "#d1b075",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "12px",
          align: "center",
        }).setOrigin(0.5, 0.5);
        const hpBarTrack = this.add.rectangle(0, 78, 90, 10, 0x04070b, 0.88).setStrokeStyle(1, 0xffffff, 0.22);
        const hpRatio = unit.maxTroops > 0 ? Math.max(0, unit.troops) / unit.maxTroops : 0;
        const hpBarFill = this.add.rectangle(
          -45 + (90 * hpRatio) / 2,
          78,
          90 * hpRatio,
          10,
          fillColor,
          0.95,
        );

        unitGroup.add([selectionRing, badge, label, facingText, hpText, cooldownText, hpBarTrack, hpBarFill]);

        if (unit.isDefending) {
          unitGroup.add(this.add.text(0, -84, "방어", {
            color: "#c7d2fe",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            align: "center",
          }).setOrigin(0.5, 0.5));
        }

        if (hasStatus(unit, "confusion")) {
          unitGroup.add(this.add.text(0, -120, `혼란 ${unit.statusEffects.confusion}`, {
            color: "#f9e27d",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            align: "center",
          }).setOrigin(0.5, 0.5));
        }

        if (hasStatus(unit, "shake")) {
          unitGroup.add(this.add.text(0, -138, `동요 ${unit.statusEffects.shake}`, {
            color: "#9dd6ff",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            align: "center",
          }).setOrigin(0.5, 0.5));
        }

        if (unit.buffTurns > 0 && unit.buffAttackBonus > 0) {
          unitGroup.add(this.add.text(0, -102, `공격 +${Math.round(unit.buffAttackBonus * 100)}%`, {
            color: "#9ef3b0",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            align: "center",
          }).setOrigin(0.5, 0.5));
        }

        this.tweens.add({
          targets: badge,
          scale: 1.06,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        if (unit.id === selectedUnitId) {
          this.tweens.add({
            targets: selectionRing,
            alpha: { from: 0.18, to: 0.4 },
            duration: 500,
            yoyo: true,
            repeat: -1,
          });
        }

        if (unit.side === "player") {
          badge.setInteractive({ useHandCursor: this.battleState.turnOwner === "player" });
          badge.on("pointerdown", () => this.callbacks.onSelectUnit?.(unit.id));
        }

        if (unit.side === "enemy") {
          badge.setInteractive({ useHandCursor: true });
          badge.on("pointerdown", () => {
            if (this.battleState.phase === "skill") {
              this.callbacks.onUseSkill?.(unit.id);
              return;
            }

            if (this.battleState.phase === "strategy") {
              this.callbacks.onUseStrategy?.(unit.id);
              return;
            }

            this.callbacks.onAttackUnit?.(unit.id);
          });
        }

        this.dynamicLayer.add(unitGroup);
      });
    }

    renderInstructionText() {
      const instructionText = this.add.text(
        this.scale.width - 96,
        54,
        this.battleState.phase === "facing"
          ? "이동 후 방향 선택"
          : this.battleState.phase === "skill"
            ? "특기 대상 적 유닛 선택"
            : this.battleState.phase === "strategy"
              ? "책략 대상 적 유닛 선택"
              : this.battleState.turnOwner === "player"
                ? "유닛 선택 · 이동 · 방향 · 공격 · 특기 · 책략 · 방어 · 대기"
                : "적군 행동 중",
        {
          color: "#aeb7c3",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "16px",
        },
      ).setOrigin(1, 0.5);

      this.dynamicLayer.add(instructionText);
    }

    renderFloatingEffects() {
      const lastAction = this.battleState.lastAction;
      const actionSignature = buildActionSignature(lastAction);

      if (!lastAction || !lastAction.effects?.length || actionSignature === this.lastRenderedActionSignature) {
        return;
      }

      this.lastRenderedActionSignature = actionSignature;
      const targetUnits = this.battleState.units.filter((unit) => lastAction.targetUnitIds?.includes(unit.id));

      targetUnits.forEach((unit) => {
        const point = this.getUnitPoint(unit);
        const flashColor = lastAction.type === "buff" ? 0x86efac : 0xffd166;
        const flash = this.add.circle(point.x, point.y, 42, flashColor, 0.2);
        this.dynamicLayer.add(flash);
        this.cameras.main.shake(90, 0.0018, true);

        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 1.45,
          duration: 280,
          onComplete: () => flash.destroy(),
        });
      });

      lastAction.effects.forEach((effect, index) => {
        const unit = this.battleState.units.find((entry) => entry.id === effect.unitId);
        const point = unit ? this.getUnitPoint(unit) : { x: this.scale.width / 2, y: 110 };
        const style = getEffectStyle(effect.kind);
        const floatingText = this.add.text(point.x, point.y - 30 - index * 6, effect.text, {
          color: style.color,
          fontFamily: "Segoe UI, sans-serif",
          fontSize: style.size,
          fontStyle: "bold",
          stroke: style.stroke,
          strokeThickness: 4,
          align: "center",
        }).setOrigin(0.5, 0.5);

        this.dynamicLayer.add(floatingText);
        this.tweens.add({
          targets: floatingText,
          y: floatingText.y - 34,
          alpha: 0,
          duration: 820,
          ease: "Sine.easeOut",
          onComplete: () => floatingText.destroy(),
        });
      });
    }
  };
}
