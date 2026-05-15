import { getDirectionLabel } from "../core/battle_direction.js";
import { getEffectiveAttack, getEffectiveDefense, getSkillById } from "../core/battle_skills.js";
import { hasStatus } from "../core/battle_strategy.js";

function getEffectStyle(kind) {
  if (kind === "damage") {
    return { color: "#ff9f9f", stroke: "#3f0d0d", size: "28px" };
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

function formatStatusList(unit) {
  const statuses = [];

  if (hasStatus(unit, "confusion")) {
    statuses.push(`혼란 ${unit.statusEffects.confusion}`);
  }

  if (hasStatus(unit, "shake")) {
    statuses.push(`동요 ${unit.statusEffects.shake}`);
  }

  if (unit?.isDefending) {
    statuses.push("방어 태세");
  }

  if ((unit?.buffDefenseBonus ?? 0) > 0 && (unit?.defenseBuffTurns ?? 0) > 0) {
    statuses.push(`방어 보정 +${Math.round(unit.buffDefenseBonus * 100)}% ${unit.defenseBuffTurns}턴`);
  }

  return statuses.length > 0 ? statuses.join(" · ") : "상태 이상 없음";
}

function getDisplayTroops(unit) {
  const initialAllocatedTroops = Math.max(0, Number(unit?.initialAllocatedTroops ?? unit?.allocatedTroops) || 0);

  if (initialAllocatedTroops <= 0) {
    return {
      current: Math.max(0, Number(unit?.troops) || 0),
      max: Math.max(0, Number(unit?.maxTroops) || 0),
    };
  }

  const maxHp = Math.max(1, Number(unit?.maxHp) || 1);
  const hpRatio = Math.max(0, Math.min(1, (Number(unit?.hp) || 0) / maxHp));

  return {
    current: Math.floor(initialAllocatedTroops * hpRatio),
    max: initialAllocatedTroops,
  };
}

const STATUS_ICON_CONVENTION = {
  attackBuff: "▲",
  attackDebuff: "▼",
  defense: "◆",
  defenseBuff: "◆",
  defenseDebuff: "◇",
  // Confusion icon rule:
  // Keep confusion as "🌀" even if an environment renders it imperfectly.
  // Do not revert to "혼" automatically.
  // If 🌀 rendering fails, report it and decide a separate fallback later.
  confusion: "🌀",
  shake: "⚠",
  stun: "✖",
  burn: "🔥",
  poison: "☠",
  taunt: "!",
  bind: "⛓",
};
const STATUS_ICON_LEGEND_TEXT = `상태: ${STATUS_ICON_CONVENTION.confusion} 혼란 · ${STATUS_ICON_CONVENTION.shake} 동요 · ${STATUS_ICON_CONVENTION.defense} 방어 · ${STATUS_ICON_CONVENTION.attackBuff} 공↑ · ${STATUS_ICON_CONVENTION.attackDebuff} 공↓ · ${STATUS_ICON_CONVENTION.stun} 기절 · ${STATUS_ICON_CONVENTION.burn} 화상 · ${STATUS_ICON_CONVENTION.poison} 중독 · ${STATUS_ICON_CONVENTION.taunt} 도발 · ${STATUS_ICON_CONVENTION.bind} 속박`;
export const USE_DOM_BATTLE_TEXT_OVERLAY = true;
export const USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY = true;

function getUnitStatusIcons(unit) {
  const icons = [];

  if (hasStatus(unit, "confusion")) {
    icons.push({
      icon: STATUS_ICON_CONVENTION.confusion,
      title: "혼란",
    });
  }

  if (hasStatus(unit, "shake")) {
    icons.push({
      icon: STATUS_ICON_CONVENTION.shake,
      title: "동요",
    });
  }

  if ((unit?.buffAttackBonus ?? 0) > 0 && (unit?.buffTurns ?? 0) > 0) {
    icons.push({
      icon: STATUS_ICON_CONVENTION.attackBuff,
      title: "공격력 상승",
    });
  }

  if (unit?.isDefending === true) {
    icons.push({
      icon: STATUS_ICON_CONVENTION.defense,
      title: "방어 태세",
    });
  }

  return icons;
}

function getSkillHelpCopy(skill) {
  if (!skill) {
    return "이동 · 공격 · 특기 · 책략 · 방어 · 대기";
  }

  if (skill.id === "hakikjin_barrage") {
    return "사정거리 안의 모든 적을 포격합니다.";
  }

  if (skill.id === "reform_order") {
    return "아군의 공격력을 2턴 동안 상승시킵니다.";
  }

  return skill.description;
}

export function createBattleSceneDefinition({ battleState, callbacks = {}, onSceneReady } = {}) {
  const PhaserLib = window.Phaser;
  const sceneKey = `samwar-battle-${battleState.id}`;
  const BATTLEFIELD_KEY = "battlefield-14x8-mvp";
  const BATTLEFIELD_FALLBACK_KEY = "battlefield-mvp";
  const PLAYER_TOKEN_KEY = "unit-player-battlefield";
  const ENEMY_TOKEN_KEY = "unit-enemy-battlefield";
  const PORTRAIT_TEXTURE_PREFIX = "battle-portrait";

  return class BattleScene extends PhaserLib.Scene {
    constructor() {
      super(sceneKey);
      this.battleState = battleState;
      this.callbacks = callbacks;
      this.board = null;
      this.cellWidth = 0;
      this.cellHeight = 0;
      this.dynamicLayer = null;
      this.backgroundLayer = null;
      this.gridLayer = null;
      this.highlightLayer = null;
      this.unitLayer = null;
      this.effectLayer = null;
      this.uiLayer = null;
      this.headerTitleText = null;
      this.headerStatusText = null;
      this.lastRenderedActionSignature = null;
      this.unitRenderMap = new Map();
      this.missingTokenWarnings = new Set();
      this.missingBackgroundWarningShown = false;
    }

    getGridWidth() {
      const gridWidth = this.battleState?.grid?.width;
      return Number.isFinite(gridWidth) && gridWidth > 0 ? gridWidth : 1;
    }

    getGridHeight() {
      const gridHeight = this.battleState?.grid?.height;
      return Number.isFinite(gridHeight) && gridHeight > 0 ? gridHeight : 1;
    }

    configureBattleView() {
      // Current mode keeps the 2D orthogonal MVP layout.
      // Future large battlefield / 2.5D iso projection should change this adapter, not battle logic.
      this.cellWidth = this.board.width / this.getGridWidth();
      this.cellHeight = this.board.height / this.getGridHeight();
    }

    gridToScreen(x, y) {
      return {
        x: this.board.x + this.cellWidth * x + this.cellWidth / 2,
        y: this.board.y + this.cellHeight * y + this.cellHeight / 2,
      };
    }

    getTileCenter(position) {
      return this.gridToScreen(position.x, position.y);
    }

    getUnitPoint(unit) {
      return this.gridToScreen(unit.x, unit.y);
    }

    getTileRect(position, inset = 0) {
      const center = this.getTileCenter(position);

      return {
        x: center.x,
        y: center.y,
        width: this.cellWidth - inset,
        height: this.cellHeight - inset,
      };
    }

    getGridLineX(x) {
      return this.board.x + this.cellWidth * x;
    }

    getGridLineY(y) {
      return this.board.y + this.cellHeight * y;
    }

    getBoardCenter() {
      return {
        x: this.board.x + this.board.width / 2,
        y: this.board.y + this.board.height / 2,
      };
    }

    getDepthForGridPosition(x, y) {
      // Safe for current 2D and prepares for future 2.5D depth ordering.
      return y * 100 + x;
    }

    getPortraitTextureKey(unit) {
      return `${PORTRAIT_TEXTURE_PREFIX}-${unit.heroId ?? unit.id}`;
    }

    getBattlefieldPortraitPath(unit) {
      return unit.battlefieldPortraitImage ?? unit.portraitImage ?? null;
    }

    preload() {
      if (!this.textures.exists(BATTLEFIELD_KEY)) {
        this.load.image(BATTLEFIELD_KEY, "assets/battle/battlefield_14x8_mvp.png");
      }

      if (!this.textures.exists(BATTLEFIELD_FALLBACK_KEY)) {
        this.load.image(BATTLEFIELD_FALLBACK_KEY, "assets/battle/battlefield_mvp.png");
      }

      if (!this.textures.exists(PLAYER_TOKEN_KEY)) {
        this.load.image(PLAYER_TOKEN_KEY, "assets/unit_tokens_battlefield/unit_blue_battlefield.png");
      }

      if (!this.textures.exists(ENEMY_TOKEN_KEY)) {
        this.load.image(ENEMY_TOKEN_KEY, "assets/unit_tokens_battlefield/unit_red_battlefield.png");
      }

      this.battleState.units.forEach((unit) => {
        const displayTroops = getDisplayTroops(unit);
        const portraitPath = this.getBattlefieldPortraitPath(unit);

        if (!portraitPath) {
          return;
        }

        const portraitTextureKey = this.getPortraitTextureKey(unit);

        if (!this.textures.exists(portraitTextureKey)) {
          this.load.image(portraitTextureKey, portraitPath);
        }
      });
    }

    syncBattleState(nextBattleState, nextCallbacks = {}) {
      this.battleState = nextBattleState;
      this.callbacks = nextCallbacks;
      this.redrawBattle();
    }

    createRenderLayers() {
      this.dynamicLayer = this.add.container(0, 0);
      this.backgroundLayer = this.add.container(0, 0);
      this.gridLayer = this.add.container(0, 0);
      this.highlightLayer = this.add.container(0, 0);
      this.unitLayer = this.add.container(0, 0);
      this.effectLayer = this.add.container(0, 0);
      this.uiLayer = this.add.container(0, 0);

      // Layer order prepares future larger battlefield rendering, effects, camera work, and 2.5D/isometric depth ordering.
      this.dynamicLayer.add([
        this.backgroundLayer,
        this.gridLayer,
        this.highlightLayer,
        this.unitLayer,
        this.effectLayer,
        this.uiLayer,
      ]);
    }

    clearRenderLayers() {
      if (!this.dynamicLayer) {
        return;
      }

      [
        this.backgroundLayer,
        this.gridLayer,
        this.highlightLayer,
        this.unitLayer,
        this.effectLayer,
        this.uiLayer,
      ].forEach((layer) => {
        layer?.removeAll(true);
      });
    }

    getLastActionPresentation() {
      // Presentation-facing action snapshot.
      // Future animation/SFX/camera queue work should start here.
      return this.battleState.lastAction ?? null;
    }

    getActionPresentationSignature(action) {
      return buildActionSignature(action);
    }

    hasNewActionPresentation(action) {
      if (!action) {
        return false;
      }

      return this.getActionPresentationSignature(action) !== this.lastRenderedActionSignature;
    }

    markActionPresentationRendered(action) {
      if (!action) {
        return;
      }

      this.lastRenderedActionSignature = this.getActionPresentationSignature(action);
    }

    getActionPresentationEffects(action) {
      return Array.isArray(action?.effects) ? action.effects : [];
    }

    getActionPresentationTargets(action) {
      return Array.isArray(action?.targetUnitIds) ? action.targetUnitIds : [];
    }

    getActionPresentationKind(action) {
      return action?.type ?? "unknown";
    }

    getFloatingEffectYOffset(_effect, index) {
      return -30 - index * 6;
    }

    getFloatingEffectDuration(_effect) {
      return 820;
    }

    getFloatingEffectRiseDistance(_effect) {
      return 34;
    }

    getFloatingEffectStrokeThickness(effect) {
      if (["damage", "counter", "strategy", "failure", "fail", "status"].includes(effect?.kind)) {
        return 5;
      }

      return 4;
    }

    getUnitRenderGroup(unitId) {
      return this.unitRenderMap?.get(unitId) ?? null;
    }

    getActionActorUnit(action) {
      return this.battleState.units.find((unit) => unit.id === action?.actorUnitId) ?? null;
    }

    getActionTargetUnit(unitId) {
      return this.battleState.units.find((unit) => unit.id === unitId) ?? null;
    }

    getHitKnockbackVector(action, targetUnit) {
      const actorUnit = this.getActionActorUnit(action);

      if (!actorUnit || !targetUnit) {
        return { x: 0, y: -8 };
      }

      const dx = targetUnit.x - actorUnit.x;
      const dy = targetUnit.y - actorUnit.y;
      const length = Math.max(1, Math.hypot(dx, dy));

      return {
        x: (dx / length) * 10,
        y: (dy / length) * 10,
      };
    }

    shouldApplyHitKnockback(effect) {
      return effect?.kind === "damage";
    }

    playHitKnockback(action, effect) {
      if (!this.shouldApplyHitKnockback(effect)) {
        return;
      }

      const targetUnit = this.getActionTargetUnit(effect.unitId);
      const targetGroup = this.getUnitRenderGroup(effect.unitId);

      if (!targetUnit || !targetGroup) {
        return;
      }

      const vector = this.getHitKnockbackVector(action, targetUnit);
      const originalX = targetGroup.x;
      const originalY = targetGroup.y;

      this.tweens.add({
        targets: targetGroup,
        x: originalX + vector.x,
        y: originalY + vector.y,
        duration: 80,
        yoyo: true,
        ease: "Quad.easeOut",
        onComplete: () => {
          targetGroup.setPosition(originalX, originalY);
        },
      });
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
      this.configureBattleView();

      this.cameras.main.setBackgroundColor("#081018");

      this.add.rectangle(width / 2, height / 2, width, height, 0x081018, 1);
      this.add.rectangle(width / 2, height / 2, width - 44, height - 44, 0x0d1622, 1)
        .setStrokeStyle(2, 0xd1b075, 0.24);

      if (!USE_DOM_BATTLE_TEXT_OVERLAY) {
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
      }
      this.input.mouse?.disableContextMenu();
      this.input.on("pointerdown", (pointer) => {
        if (pointer.button !== 2) {
          return;
        }

        if (this.battleState.phase === "facing") {
          this.callbacks.onCancelPendingMove?.();
          return;
        }

        if (["attack", "skill", "strategy"].includes(this.battleState.phase)) {
          this.callbacks.onCancelActionMode?.();
        }
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

      this.createRenderLayers();
      this.redrawBattle();
      onSceneReady?.(this);
    }

    redrawBattle() {
      if (!this.dynamicLayer) {
        return;
      }

      this.clearRenderLayers();
      this.unitRenderMap = new Map();
      this.headerStatusText?.setText(`${this.battleState.defenderCityName} 전장`);
      this.renderBattlefieldBackdrop();
      this.renderGrid();
      this.renderHighlights();
      this.renderUnits();
      this.renderFacingHighlights();
      this.renderInstructionText();
      this.renderStatusIconLegend();
      this.renderFloatingEffects();
    }

    renderBattlefieldBackdrop() {
      const boardCenter = this.getBoardCenter();

      if (this.textures.exists(BATTLEFIELD_KEY)) {
        const battlefieldImage = this.add.image(
          boardCenter.x,
          boardCenter.y,
          BATTLEFIELD_KEY,
        ).setOrigin(0.5, 0.5);
        battlefieldImage.displayWidth = this.board.width;
        battlefieldImage.displayHeight = this.board.height;
        battlefieldImage.setAlpha(0.96);
        this.backgroundLayer.add(battlefieldImage);
      } else if (this.textures.exists(BATTLEFIELD_FALLBACK_KEY)) {
        const battlefieldImage = this.add.image(
          boardCenter.x,
          boardCenter.y,
          BATTLEFIELD_FALLBACK_KEY,
        ).setOrigin(0.5, 0.5);
        battlefieldImage.displayWidth = this.board.width;
        battlefieldImage.displayHeight = this.board.height;
        battlefieldImage.setAlpha(0.96);
        this.backgroundLayer.add(battlefieldImage);
      } else if (!this.missingBackgroundWarningShown) {
        this.missingBackgroundWarningShown = true;
        console.warn("Battlefield background image missing, using dark fallback background.");
      }

      const readabilityOverlay = this.add.rectangle(
        boardCenter.x,
        boardCenter.y,
        this.board.width,
        this.board.height,
        0x081018,
        0.06,
      );
      this.backgroundLayer.add(readabilityOverlay);
    }

    renderHighlights() {
      const highlights = this.battleState.highlights ?? {};

      (highlights.move ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 8);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0x2c9fff,
          0.3,
        ).setStrokeStyle(2, 0x5bb8ff, 0.82);
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => this.callbacks.onMoveUnit?.(position));
        this.highlightLayer.add(rect);
      });

      (highlights.attack ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 10);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0xff7b7b,
          0.14,
        ).setStrokeStyle(1.5, 0xff9f7b, 0.42);
        this.highlightLayer.add(rect);
      });

      (highlights.attackTargets ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 10);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0xff7b7b,
          0.22,
        ).setStrokeStyle(2.5, 0xff7b7b, 0.88);
        this.highlightLayer.add(rect);
      });

      (highlights.skill ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 14);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0x8b5cf6,
          0.16,
        ).setStrokeStyle(1.5, 0xd8b4fe, 0.46);
        this.highlightLayer.add(rect);
      });

      (highlights.skillTargets ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 12);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0x8b5cf6,
          0.28,
        ).setStrokeStyle(2.5, 0xf8d798, 0.9);
        this.highlightLayer.add(rect);
      });

      (highlights.strategy ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 12);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0x7dd3fc,
          0.14,
        ).setStrokeStyle(1.5, 0x6ee7b7, 0.44);
        this.highlightLayer.add(rect);
      });

      (highlights.strategyTargets ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 12);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0x7dd3fc,
          0.24,
        ).setStrokeStyle(2.5, 0xa5f3fc, 0.9);
        this.highlightLayer.add(rect);
      });

    }

    renderFacingHighlights() {
      const highlights = this.battleState.highlights ?? {};

      (highlights.facing ?? []).forEach((position) => {
        const tileRect = this.getTileRect(position, 12);
        const rect = this.add.rectangle(
          tileRect.x,
          tileRect.y,
          tileRect.width,
          tileRect.height,
          0xf8d798,
          0.22,
        ).setStrokeStyle(2, 0xf8d798, 0.88);
        const label = this.add.text(rect.x, rect.y, getDirectionLabel(position.direction), {
          color: "#f8d798",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "24px",
          fontStyle: "bold",
        }).setOrigin(0.5, 0.5);
        rect.setDepth(400);
        label.setDepth(401);
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", (pointer, _localX, _localY, event) => {
          if (pointer.button !== 0) {
            return;
          }

          event?.stopPropagation?.();
          this.callbacks.onSetFacing?.(position.direction);
        });
        label.setInteractive({ useHandCursor: true });
        label.on("pointerdown", (pointer, _localX, _localY, event) => {
          if (pointer.button !== 0) {
            return;
          }

          event?.stopPropagation?.();
          this.callbacks.onSetFacing?.(position.direction);
        });
        this.highlightLayer.add([rect, label]);
      });
    }

    renderGrid() {
      for (let x = 0; x <= this.getGridWidth(); x += 1) {
        const lineX = this.getGridLineX(x);
        const line = this.add.line(0, 0, lineX, this.board.y, lineX, this.board.y + this.board.height, 0xf8d798, 0.22)
          .setOrigin(0, 0)
          .setLineWidth(1.5);
        this.gridLayer.add(line);
      }

      for (let y = 0; y <= this.getGridHeight(); y += 1) {
        const lineY = this.getGridLineY(y);
        const line = this.add.line(0, 0, this.board.x, lineY, this.board.x + this.board.width, lineY, 0xf8d798, 0.22)
          .setOrigin(0, 0)
          .setLineWidth(1.5);
        this.gridLayer.add(line);
      }
    }

    renderUnits() {
      const selectedUnitId = this.battleState.selectedUnitId;
      const skillTargetLookup = new Set((this.battleState.highlights?.skillTargets ?? []).map((tile) => `${tile.x},${tile.y}`));
      const strategyTargetLookup = new Set((this.battleState.highlights?.strategyTargets ?? []).map((tile) => `${tile.x},${tile.y}`));

      this.battleState.units.forEach((unit) => {
        if (!unit.isAlive) {
          return;
        }

        const unitPoint = this.getUnitPoint(unit);
        const displayTroops = getDisplayTroops(unit);
        const fillColor = unit.side === "player" ? 0x5bb8ff : 0xff7b7b;
        const isPlayerUnit = unit.side === "player";
        const facingTextX = isPlayerUnit ? 34 : -34;
        const facingTextY = -34;
        const statusIconsX = isPlayerUnit ? 40 : -40;
        const statusIconsY = -18;
        const defendTextX = isPlayerUnit ? 36 : -36;
        const defendTextY = -54;
        const defenseBuffTextX = isPlayerUnit ? 42 : -42;
        const defenseBuffTextY = -78;
        const unitGroup = this.add.container(unitPoint.x, unitPoint.y);
        unitGroup.setDepth(200 + this.getDepthForGridPosition(unit.x, unit.y));
        this.unitRenderMap.set(unit.id, unitGroup);
        const selectionRing = this.add.ellipse(0, 26, 86, 26, 0xf8d798, unit.id === selectedUnitId ? 0.24 : 0)
          .setStrokeStyle(unit.id === selectedUnitId ? 3 : 2, 0xf8d798, unit.id === selectedUnitId ? 0.85 : 0.28);
        const facingText = this.add.text(facingTextX, facingTextY, getDirectionLabel(unit.facing), {
          color: "#f3ead9",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "18px",
          fontStyle: "bold",
          align: "center",
          stroke: "#081018",
          strokeThickness: 3,
        }).setOrigin(0.5, 0.5);
        const hpText = USE_DOM_BATTLE_TEXT_OVERLAY
          ? null
          : this.add.text(0, 54, `${displayTroops.current} / ${displayTroops.max}`, {
            color: "#eef5ff",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "15px",
            fontStyle: "bold",
            align: "center",
            stroke: "#05090f",
            strokeThickness: 3,
          }).setOrigin(0.5, 0.5);
        const hpBarTrack = this.add.rectangle(0, 40, 90, 5, 0x04070b, 0.88).setStrokeStyle(1, 0xffffff, 0.22);
        const hpRatio = displayTroops.max > 0 ? Math.max(0, displayTroops.current) / displayTroops.max : 0;
        const hpBarFill = this.add.rectangle(
          -45 + (90 * hpRatio) / 2,
          40,
          90 * hpRatio,
          5,
          fillColor,
          0.95,
        );
        const tokenKey = unit.side === "player" ? PLAYER_TOKEN_KEY : ENEMY_TOKEN_KEY;
        const tokenSprite = this.createUnitTokenSprite(unit, tokenKey, fillColor);
        const portraitBadge = this.createUnitPortraitBadge(unit);
        const statusIcons = this.createUnitStatusIcons(unit, {
          x: statusIconsX,
          y: statusIconsY,
        });
        const hitZone = this.add.zone(0, 8, 90, 110).setOrigin(0.5, 0.5);

        if (USE_DOM_BATTLE_UNIT_IMAGE_OVERLAY) {
          tokenSprite.setAlpha(0);
          portraitBadge.setAlpha(0);
        }

        unitGroup.add([selectionRing, tokenSprite, portraitBadge, statusIcons, facingText, hpBarTrack, hpBarFill, hitZone]);

        if (hpText) {
          unitGroup.add(hpText);
        }

        if (unit.isDefending) {
          unitGroup.add(this.add.text(defendTextX, defendTextY, "방어", {
            color: "#c7d2fe",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            align: "center",
          }).setOrigin(0.5, 0.5));
        }

        if (unit.defenseBuffTurns > 0 && unit.buffDefenseBonus > 0) {
          unitGroup.add(this.add.text(defenseBuffTextX, defenseBuffTextY, `방어 +${Math.round(unit.buffDefenseBonus * 100)}%`, {
            color: "#9ef3b0",
            fontFamily: "Segoe UI, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            align: "center",
          }).setOrigin(0.5, 0.5));
        }

        if (tokenSprite.type !== "Arc") {
          this.tweens.add({
            targets: tokenSprite,
            scaleX: tokenSprite.scaleX * 1.02,
            scaleY: tokenSprite.scaleY * 1.02,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        } else {
          this.tweens.add({
            targets: tokenSprite,
            scale: 1.06,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }

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
          if (this.battleState.phase !== "facing") {
            hitZone.setInteractive({ useHandCursor: this.battleState.turnOwner === "player" });
          }

          hitZone.on("pointerdown", () => {
            if (this.battleState.phase === "facing") {
              return;
            }

            if (this.battleState.phase === "move" && this.battleState.selectedUnitId === unit.id) {
              this.callbacks.onMoveUnit?.({ x: unit.x, y: unit.y });
              return;
            }

            if (this.battleState.phase === "skill") {
              if (skillTargetLookup.has(`${unit.x},${unit.y}`)) {
                this.callbacks.onUseSkill?.(unit.id);
              }
              return;
            }

            this.callbacks.onSelectUnit?.(unit.id);
          });
        }

        if (unit.side === "enemy") {
          if (this.battleState.phase !== "facing") {
            hitZone.setInteractive({ useHandCursor: true });
          }

          hitZone.on("pointerdown", () => {
            if (this.battleState.phase === "facing") {
              return;
            }

            if (this.battleState.phase === "skill") {
              if (skillTargetLookup.has(`${unit.x},${unit.y}`)) {
                this.callbacks.onUseSkill?.(unit.id);
              }
              return;
            }

            if (this.battleState.phase === "strategy") {
              if (strategyTargetLookup.has(`${unit.x},${unit.y}`)) {
                this.callbacks.onUseStrategy?.(unit.id);
              }
              return;
            }

            this.callbacks.onAttackUnit?.(unit.id);
          });
        }

        this.unitLayer.add(unitGroup);
      });
    }

    createUnitTokenSprite(unit, tokenKey, fillColor) {
      if (this.textures.exists(tokenKey)) {
        const sprite = this.add.image(0, 28, tokenKey)
          .setOrigin(0.5, 0.85);
        sprite.displayWidth = 96;
        sprite.scaleY = sprite.scaleX;
        sprite.setAlpha(0.92);
        sprite.setFlipX(unit.facing === "right");
        return sprite;
      }

      if (!this.missingTokenWarnings.has(tokenKey)) {
        this.missingTokenWarnings.add(tokenKey);
        console.warn(`Unit token image missing, using fallback circle marker: ${tokenKey}`);
      }

      return this.add.circle(0, 10, 26, fillColor, 0.96).setStrokeStyle(4, 0xf3ead9, 0.92);
    }

    createUnitPortraitBadge(unit) {
      const badge = this.add.container(-28, -18);
      const badgeFrame = this.add.rectangle(0, 0, 36, 36, 0x05090f, 0.18)
        .setStrokeStyle(1, 0xf8d798, 0.22);
      badge.add(badgeFrame);

      const portraitTextureKey = this.getPortraitTextureKey(unit);

      if (this.getBattlefieldPortraitPath(unit) && this.textures.exists(portraitTextureKey)) {
        const portraitImage = this.add.image(0, 0, portraitTextureKey)
          .setDisplaySize(32, 32);
        badge.add(portraitImage);
      } else {
        const fallbackText = this.add.text(0, 0, "?", {
          color: "#f8d798",
          fontFamily: "Georgia, serif",
          fontSize: "20px",
          fontStyle: "bold",
          align: "center",
        }).setOrigin(0.5, 0.5);
        badge.add(fallbackText);
      }

      return badge;
    }

    createUnitStatusIcons(unit, offset = {}) {
      const icons = getUnitStatusIcons(unit);
      const iconGroup = this.add.container(offset.x ?? 20, offset.y ?? -42);

      iconGroup.setName("battle-status-icons");

      if (icons.length === 0) {
        return iconGroup;
      }

      const iconSize = 22;
      const gap = 4;
      const totalWidth = icons.length * iconSize + (icons.length - 1) * gap;
      const backgroundWidth = totalWidth + 8;
      const backgroundHeight = 24;
      const background = this.add.graphics();
      background.fillStyle(0x05090f, 0.38);
      background.fillRoundedRect(-backgroundWidth / 2, -backgroundHeight / 2, backgroundWidth, backgroundHeight, 4);
      background.lineStyle(1, 0xf8d798, 0.26);
      background.strokeRoundedRect(-backgroundWidth / 2, -backgroundHeight / 2, backgroundWidth, backgroundHeight, 4);
      iconGroup.add(background);

      icons.forEach((statusIcon, index) => {
        const x = -totalWidth / 2 + iconSize / 2 + index * (iconSize + gap);
        const iconText = this.add.text(x, 0, statusIcon.icon, {
          color: statusIcon.title === "공격력 상승" ? "#9ef3b0" : statusIcon.title === "동요" ? "#f9e27d" : "#f8d798",
          fontFamily: "\"Segoe UI Emoji\", \"Apple Color Emoji\", \"Noto Color Emoji\", sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          stroke: "#05090f",
          strokeThickness: 4,
          align: "center",
        }).setOrigin(0.5, 0.5);
        iconText.setName(`battle-status-icon:${statusIcon.title}`);
        iconGroup.add(iconText);
      });

      return iconGroup;
    }

    renderInstructionText() {
      if (USE_DOM_BATTLE_TEXT_OVERLAY) {
        return;
      }

      const selectedUnit = this.battleState.units.find((unit) => unit.id === this.battleState.selectedUnitId) ?? null;
      const selectedSkill = selectedUnit ? getSkillById(this.battleState.skills, selectedUnit.skillId) : null;
      const summaryLine = selectedUnit
        ? `${selectedUnit.name} | 병력 ${getDisplayTroops(selectedUnit).current}/${getDisplayTroops(selectedUnit).max} | 공격 ${Math.round(getEffectiveAttack(selectedUnit))} | 방어 ${Math.round(getEffectiveDefense(selectedUnit))} | 지력 ${selectedUnit.intelligence} | 방향 ${getDirectionLabel(selectedUnit.facing)}`
        : "유닛을 선택하세요";
      const summaryHelp = !selectedUnit
        ? "이동 · 공격 · 특기 · 책략 · 방어 · 대기"
        : this.battleState.phase === "facing"
          ? "이동 후 방향 선택"
          : this.battleState.phase === "skill"
            ? `${selectedSkill?.name ?? "고유 특기"}: ${getSkillHelpCopy(selectedSkill)}`
            : this.battleState.phase === "strategy"
              ? "책략 대상 적 유닛 선택"
              : selectedSkill && selectedUnit.currentSkillCooldown > 0
                ? `${selectedSkill.name}: 재사용 대기 ${selectedUnit.currentSkillCooldown}턴`
                : selectedSkill
                  ? `${selectedSkill.name}: ${getSkillHelpCopy(selectedSkill)}`
                  : formatStatusList(selectedUnit);
      const panelWidth = 470;
      const panelHeight = 60;
      const panelX = this.scale.width - 96 - panelWidth / 2;
      const panelY = 62;
      const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0f1824, 0.92)
        .setStrokeStyle(1.5, 0xd1b075, 0.34);
      const summaryText = this.add.text(
        this.scale.width - 112,
        47,
        summaryLine,
        {
          color: "#f3ead9",
          fontFamily: "Georgia, serif",
          fontSize: "15px",
          fixedWidth: panelWidth - 24,
          align: "right",
        },
      ).setOrigin(1, 0.5);
      const helpText = this.add.text(
        this.scale.width - 112,
        76,
        summaryHelp,
        {
          color: "#aeb7c3",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "12px",
          fixedWidth: panelWidth - 24,
          align: "right",
        },
      ).setOrigin(1, 0.5);

      this.uiLayer.add([panel, summaryText, helpText]);
    }

    renderStatusIconLegend() {
      if (USE_DOM_BATTLE_TEXT_OVERLAY) {
        return;
      }

      const legendText = this.add.text(
        this.scale.width / 2,
        this.scale.height - 54,
        STATUS_ICON_LEGEND_TEXT,
        {
          color: "#d9c9a7",
          fontFamily: "\"Segoe UI Emoji\", \"Apple Color Emoji\", \"Noto Color Emoji\", sans-serif",
          fontSize: "12px",
          fixedWidth: this.scale.width - 160,
          align: "center",
          stroke: "#05090f",
          strokeThickness: 2,
        },
      ).setOrigin(0.5, 0.5);

      const backgroundWidth = Math.min(this.scale.width - 140, legendText.width + 28);
      const background = this.add.graphics();
      background.fillStyle(0x05090f, 0.28);
      background.fillRoundedRect(
        this.scale.width / 2 - backgroundWidth / 2,
        this.scale.height - 68,
        backgroundWidth,
        28,
        5,
      );
      background.lineStyle(1, 0xf8d798, 0.16);
      background.strokeRoundedRect(
        this.scale.width / 2 - backgroundWidth / 2,
        this.scale.height - 68,
        backgroundWidth,
        28,
        5,
      );

      this.uiLayer.add([background, legendText]);
    }

    renderFloatingEffects() {
      const lastAction = this.getLastActionPresentation();

      if (!this.hasNewActionPresentation(lastAction)) {
        return;
      }

      const actionEffects = this.getActionPresentationEffects(lastAction);

      if (!actionEffects.length) {
        return;
      }

      const targetUnitIds = this.getActionPresentationTargets(lastAction);
      const targetUnits = this.battleState.units.filter((unit) => targetUnitIds.includes(unit.id));

      // Current patch intentionally preserves immediate rendering behavior.
      targetUnits.forEach((unit) => {
        const point = this.getUnitPoint(unit);
        const flashColor = this.getActionPresentationKind(lastAction) === "buff" ? 0x86efac : 0xffd166;
        const flash = this.add.circle(point.x, point.y, 42, flashColor, 0.2);
        this.effectLayer.add(flash);
        this.cameras.main.shake(90, 0.0018, true);

        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 1.45,
          duration: 280,
          onComplete: () => flash.destroy(),
        });
      });

      actionEffects.forEach((effect, index) => {
        const unit = this.battleState.units.find((entry) => entry.id === effect.unitId);
        const point = unit ? this.getUnitPoint(unit) : { x: this.scale.width / 2, y: 110 };
        const style = getEffectStyle(effect.kind);
        const floatingText = this.add.text(point.x, point.y + this.getFloatingEffectYOffset(effect, index), effect.text, {
          color: style.color,
          fontFamily: "Segoe UI, sans-serif",
          fontSize: style.size,
          fontStyle: "bold",
          stroke: style.stroke,
          strokeThickness: this.getFloatingEffectStrokeThickness(effect),
          align: "center",
        }).setOrigin(0.5, 0.5);

        this.effectLayer.add(floatingText);
        this.tweens.add({
          targets: floatingText,
          y: floatingText.y - this.getFloatingEffectRiseDistance(effect),
          alpha: 0,
          duration: this.getFloatingEffectDuration(effect),
          ease: "Sine.easeOut",
          onComplete: () => floatingText.destroy(),
        });
        this.playHitKnockback(lastAction, effect);
      });

      this.markActionPresentationRendered(lastAction);
    }
  };
}
