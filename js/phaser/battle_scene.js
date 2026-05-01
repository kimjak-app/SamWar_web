import { getSkillById } from "../core/battle_skills.js";

export function createBattleSceneDefinition({ battleState, callbacks = {} }) {
  const PhaserLib = window.Phaser;
  const sceneKey = `samwar-battle-${battleState.id}`;

  return class BattleScene extends PhaserLib.Scene {
    constructor() {
      super(sceneKey);
    }

    create() {
      const width = this.scale.width;
      const height = this.scale.height;
      const board = {
        x: 92,
        y: 118,
        width: width - 184,
        height: height - 210,
      };
      const cellWidth = board.width / battleState.grid.width;
      const cellHeight = board.height / battleState.grid.height;
      const selectedUnitId = battleState.selectedUnitId;

      this.cameras.main.setBackgroundColor("#081018");

      this.add.rectangle(width / 2, height / 2, width, height, 0x081018, 1);
      this.add.rectangle(width / 2, height / 2, width - 44, height - 44, 0x0d1622, 1)
        .setStrokeStyle(2, 0xd1b075, 0.24);

      this.add.text(96, 40, "전투 테스트", {
        color: "#f3ead9",
        fontFamily: "Georgia, serif",
        fontSize: "34px",
        fontStyle: "bold",
      });
      this.add.text(96, 82, `${battleState.defenderCityName} 전장`, {
        color: "#d1b075",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "18px",
      });

      const boardBackground = this.add.rectangle(
        board.x + board.width / 2,
        board.y + board.height / 2,
        board.width,
        board.height,
        0x122031,
        0.9,
      );
      boardBackground.setStrokeStyle(2, 0xf8d798, 0.26);

      battleState.highlights.move.forEach((position) => {
        const rect = this.add.rectangle(
          board.x + cellWidth * position.x + cellWidth / 2,
          board.y + cellHeight * position.y + cellHeight / 2,
          cellWidth - 8,
          cellHeight - 8,
          0x2c9fff,
          0.26,
        ).setStrokeStyle(2, 0x5bb8ff, 0.7);
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => callbacks.onMoveUnit?.(position));
      });

      battleState.highlights.attack.forEach((position) => {
        this.add.rectangle(
          board.x + cellWidth * position.x + cellWidth / 2,
          board.y + cellHeight * position.y + cellHeight / 2,
          cellWidth - 10,
          cellHeight - 10,
          0xff7b7b,
          0.18,
        ).setStrokeStyle(2, 0xff7b7b, 0.72);
      });

      battleState.highlights.skill.forEach((position) => {
        this.add.rectangle(
          board.x + cellWidth * position.x + cellWidth / 2,
          board.y + cellHeight * position.y + cellHeight / 2,
          cellWidth - 14,
          cellHeight - 14,
          0x8b5cf6,
          0.24,
        ).setStrokeStyle(2, 0xd8b4fe, 0.8);
      });

      for (let x = 0; x <= battleState.grid.width; x += 1) {
        const lineX = board.x + cellWidth * x;
        this.add.line(0, 0, lineX, board.y, lineX, board.y + board.height, 0xf8d798, 0.16)
          .setOrigin(0, 0)
          .setLineWidth(1);
      }

      for (let y = 0; y <= battleState.grid.height; y += 1) {
        const lineY = board.y + cellHeight * y;
        this.add.line(0, 0, board.x, lineY, board.x + board.width, lineY, 0xf8d798, 0.16)
          .setOrigin(0, 0)
          .setLineWidth(1);
      }

      battleState.units.forEach((unit) => {
        if (!unit.isAlive) {
          return;
        }

        const unitX = board.x + cellWidth * unit.x + cellWidth / 2;
        const unitY = board.y + cellHeight * unit.y + cellHeight / 2;
        const fillColor = unit.side === "player" ? 0x5bb8ff : 0xff7b7b;
        const skill = getSkillById(battleState.skills, unit.skillId);
        const unitGroup = this.add.container(unitX, unitY);
        const selectionRing = this.add.circle(0, 0, 34, 0xf8d798, unit.id === selectedUnitId ? 0.22 : 0);
        const badge = this.add.circle(0, 0, 26, fillColor, 0.96).setStrokeStyle(4, 0xf3ead9, 0.92);
        const label = this.add.text(0, -58, unit.name, {
          color: "#f3ead9",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "18px",
          fontStyle: "bold",
          align: "center",
        }).setOrigin(0.5, 0.5);
        const hpText = this.add.text(0, 44, `HP ${unit.hp} / ${unit.maxHp}`, {
          color: "#dbe6f3",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "16px",
          align: "center",
        }).setOrigin(0.5, 0.5);
        const cooldownText = this.add.text(0, 62, `${skill?.name ?? "스킬"} CD ${unit.currentSkillCooldown}`, {
          color: "#d1b075",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "12px",
          align: "center",
        }).setOrigin(0.5, 0.5);
        const hpBarTrack = this.add.rectangle(0, 78, 90, 10, 0x04070b, 0.88).setStrokeStyle(1, 0xffffff, 0.22);
        const hpBarFill = this.add.rectangle(
          -45 + (90 * Math.max(0, unit.hp) / unit.maxHp) / 2,
          78,
          90 * Math.max(0, unit.hp) / unit.maxHp,
          10,
          fillColor,
          0.95,
        );

        unitGroup.add([selectionRing, badge, label, hpText, cooldownText, hpBarTrack, hpBarFill]);

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
          badge.setInteractive({ useHandCursor: battleState.turnOwner === "player" });
          badge.on("pointerdown", () => callbacks.onSelectUnit?.(unit.id));
        }

        if (unit.side === "enemy") {
          badge.setInteractive({ useHandCursor: true });
          badge.on("pointerdown", () => {
            if (battleState.phase === "skill") {
              callbacks.onUseSkill?.(unit.id);
              return;
            }

            callbacks.onAttackUnit?.(unit.id);
          });
        }
      });

      if (battleState.lastAction?.type === "skill") {
        const actor = battleState.units.find((unit) => unit.id === battleState.lastAction.actorUnitId);
        const target = battleState.units.find((unit) => unit.id === battleState.lastAction.targetUnitId);

        if (actor && target) {
          const beam = this.add.line(
            0,
            0,
            board.x + cellWidth * actor.x + cellWidth / 2,
            board.y + cellHeight * actor.y + cellHeight / 2,
            board.x + cellWidth * target.x + cellWidth / 2,
            board.y + cellHeight * target.y + cellHeight / 2,
            0xd8b4fe,
            0.9,
          ).setOrigin(0, 0).setLineWidth(4);

          this.tweens.add({
            targets: beam,
            alpha: 0,
            duration: 360,
            onComplete: () => beam.destroy(),
          });
        }
        if (target) {
          const flash = this.add.circle(
            board.x + cellWidth * target.x + cellWidth / 2,
            board.y + cellHeight * target.y + cellHeight / 2,
            42,
            0xd8b4fe,
            0.28,
          );

          this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.6,
            duration: 320,
            onComplete: () => flash.destroy(),
          });
        }

        if (actor && !target) {
          const flash = this.add.circle(
            board.x + cellWidth * actor.x + cellWidth / 2,
            board.y + cellHeight * actor.y + cellHeight / 2,
            48,
            0x86efac,
            0.24,
          );

          this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.8,
            duration: 360,
            onComplete: () => flash.destroy(),
          });
        }
      }

      this.add.text(
        width - 96,
        54,
        battleState.phase === "skill"
          ? "스킬 대상 적 유닛 선택"
          : battleState.turnOwner === "player"
            ? "유닛 선택 · 이동 · 공격 · 스킬"
            : "적군 행동 중",
        {
          color: "#aeb7c3",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "16px",
        },
      ).setOrigin(1, 0.5);

      this.input.keyboard?.on("keydown-S", () => {
        if (battleState.status === "active") {
          callbacks.onUseSkill?.(null);
        }
      });

      this.input.keyboard?.on("keydown-ENTER", () => {
        if (battleState.status === "active") {
          callbacks.onEndTurn?.();
        }
      });

      this.input.keyboard?.on("keydown-ESC", () => {
        if (battleState.status === "active") {
          callbacks.onRetreat?.();
        }
      });
    }
  };
}
