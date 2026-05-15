import { renderAllWorldUI } from "./ui_render.js";

let debugCityDragMode = false;
const CITY_HUD_OFFSET_STORAGE_KEY = "samwar.cityHudOffset.v0.5-10b";
const CITY_HUD_DEFAULT_OFFSET = Object.freeze({ x: -180, y: 0 });

function getCityNodePosition(cityNode) {
  return {
    x: Number.parseFloat(cityNode.style.left) || 0,
    y: Number.parseFloat(cityNode.style.top) || 0,
  };
}

function updateCityCoordinateLabel(cityNode) {
  const cityId = cityNode.getAttribute("data-city-id");
  const label = cityNode.querySelector("[data-city-coordinate-label]");

  if (!cityId || !label) {
    return;
  }

  const { x, y } = getCityNodePosition(cityNode);
  label.textContent = `${cityId} ${Math.round(x)},${Math.round(y)}`;
}

function installCityCoordinateDrag(rootElement) {
  const stage = rootElement.querySelector(".world-stage");

  if (!stage) {
    return;
  }

  rootElement.querySelectorAll("[data-city-id]").forEach((cityNode) => {
    cityNode.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    cityNode.addEventListener("pointerdown", (event) => {
      if (!debugCityDragMode || event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      cityNode.setPointerCapture?.(event.pointerId);
      cityNode.classList.add("is-debug-dragging");

      const handlePointerMove = (moveEvent) => {
        const rect = stage.getBoundingClientRect();
        const nextX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        const nextY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
        const clampedX = Math.max(0, Math.min(100, nextX));
        const clampedY = Math.max(0, Math.min(100, nextY));

        cityNode.style.left = `${clampedX}%`;
        cityNode.style.top = `${clampedY}%`;
        updateCityCoordinateLabel(cityNode);
      };

      const handlePointerUp = (upEvent) => {
        upEvent.preventDefault();
        upEvent.stopPropagation();
        cityNode.releasePointerCapture?.(upEvent.pointerId);
        cityNode.classList.remove("is-debug-dragging");
        cityNode.removeEventListener("pointermove", handlePointerMove);
        cityNode.removeEventListener("pointerup", handlePointerUp);
        cityNode.removeEventListener("pointercancel", handlePointerUp);

        const cityId = cityNode.getAttribute("data-city-id");
        const { x, y } = getCityNodePosition(cityNode);
        const roundedX = Math.round(x);
        const roundedY = Math.round(y);

        console.log("[CITY POS]", cityId, {
          x: roundedX,
          y: roundedY,
        });
        console.log(`{ id: "${cityId}", x: ${roundedX}, y: ${roundedY} }`);
      };

      cityNode.addEventListener("pointermove", handlePointerMove);
      cityNode.addEventListener("pointerup", handlePointerUp);
      cityNode.addEventListener("pointercancel", handlePointerUp);
    });
  });
}

function readCityHudOffset() {
  try {
    const rawValue = window.localStorage.getItem(CITY_HUD_OFFSET_STORAGE_KEY);

    if (!rawValue) {
      return { ...CITY_HUD_DEFAULT_OFFSET };
    }

    const parsed = JSON.parse(rawValue);
    const x = Number(parsed?.x);
    const y = Number(parsed?.y);

    return {
      x: Number.isFinite(x) ? x : CITY_HUD_DEFAULT_OFFSET.x,
      y: Number.isFinite(y) ? y : CITY_HUD_DEFAULT_OFFSET.y,
    };
  } catch {
    return { ...CITY_HUD_DEFAULT_OFFSET };
  }
}

function saveCityHudOffset(offset) {
  try {
    window.localStorage.setItem(
      CITY_HUD_OFFSET_STORAGE_KEY,
      JSON.stringify({
        x: Math.round(offset.x),
        y: Math.round(offset.y),
      }),
    );
  } catch {
    // localStorage failure should not affect gameplay.
  }
}

function clampCityHudOffset(offset) {
  return {
    x: Math.max(-520, Math.min(40, Math.round(offset.x))),
    y: Math.max(-120, Math.min(180, Math.round(offset.y))),
  };
}

function applyCityHudOffset(panel, offset) {
  const nextOffset = clampCityHudOffset(offset);

  panel.style.setProperty("--city-hud-offset-x", `${nextOffset.x}px`);
  panel.style.setProperty("--city-hud-offset-y", `${nextOffset.y}px`);

  return nextOffset;
}

function installCityHudDrag(rootElement) {
  const panel = rootElement.querySelector("[data-city-hud-panel='true']");
  const handle = rootElement.querySelector("[data-city-hud-drag-handle='true']");
  const resetButton = rootElement.querySelector("[data-city-hud-reset='true']");

  if (!panel || !handle) {
    return;
  }

  let currentOffset = applyCityHudOffset(panel, readCityHudOffset());

  resetButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    currentOffset = applyCityHudOffset(panel, CITY_HUD_DEFAULT_OFFSET);
    saveCityHudOffset(currentOffset);
  });

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    handle.setPointerCapture?.(event.pointerId);
    panel.classList.add("is-dragging");

    const startX = event.clientX;
    const startY = event.clientY;
    const startOffset = { ...currentOffset };

    const handlePointerMove = (moveEvent) => {
      moveEvent.preventDefault();

      currentOffset = applyCityHudOffset(panel, {
        x: startOffset.x + (moveEvent.clientX - startX),
        y: startOffset.y + (moveEvent.clientY - startY),
      });
    };

    const handlePointerUp = (upEvent) => {
      upEvent.preventDefault();

      handle.releasePointerCapture?.(upEvent.pointerId);
      panel.classList.remove("is-dragging");
      saveCityHudOffset(currentOffset);

      handle.removeEventListener("pointermove", handlePointerMove);
      handle.removeEventListener("pointerup", handlePointerUp);
      handle.removeEventListener("pointercancel", handlePointerUp);
    };

    handle.addEventListener("pointermove", handlePointerMove);
    handle.addEventListener("pointerup", handlePointerUp);
    handle.addEventListener("pointercancel", handlePointerUp);
  });
}

export function renderWorldMap(rootElement, appState, handlers = {}) {
  const {
    onCitySelect,
    onAttackCity,
    onBattleChoiceConfirm,
    onBattleChoiceCancel,
    onHeroDeploymentToggle,
    onHeroDeploymentTroopsChange,
    onHeroDeploymentStart,
    onHeroDeploymentCancel,
    onHeroTransferOpen,
    onHeroTransferSelectHero,
    onHeroTransferSelectTargetCity,
    onHeroTransferConfirm,
    onHeroTransferCancel,
    onEndWorldTurn,
    onTaxLevelChange,
    onChancellorHeroChange,
    onChancellorPolicyChange,
    onGovernorHeroChange,
    onGovernorPolicyChange,
    onRecruitTroops,
    onTradeRelationAction,
    onTradeControlOpen,
    onTradeControlApply,
    onTradeControlAuto,
    onTradeControlClose,
    onCityDetailTabChange,
    onDiplomacySpyTabChange,
    onDiplomacySpyToggle,
    onCityDetailToggle,
    onConfirmEnemyTurnResult,
    onSaveGame,
    onLoadGame,
    onResetGame,
  } = handlers;
  const { pendingHeroDeployment, pendingHeroTransfer } = appState;

  rootElement.innerHTML = renderAllWorldUI(appState, { debugCityDragMode });
  installCityHudDrag(rootElement);

  rootElement.querySelector("[data-debug-city-drag-toggle]")?.addEventListener("click", () => {
    debugCityDragMode = !debugCityDragMode;
    renderWorldMap(rootElement, appState, handlers);
  });

  if (debugCityDragMode) {
    installCityCoordinateDrag(rootElement);
  }

  if (onCitySelect && !debugCityDragMode) {
    rootElement.querySelectorAll("[data-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        const cityId = element.getAttribute("data-city-id");

        if (cityId) {
          onCitySelect(cityId);
        }
      });
    });
  }

  if (onAttackCity) {
    rootElement.querySelectorAll("[data-attack-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        const cityId = element.getAttribute("data-attack-city-id");

        if (cityId) {
          onAttackCity(cityId);
        }
      });
    });
  }

  if (onBattleChoiceConfirm) {
    rootElement.querySelectorAll("[data-battle-choice]").forEach((element) => {
      element.addEventListener("click", () => {
        const choice = element.getAttribute("data-battle-choice");

        if (choice === "manual" || choice === "auto") {
          const cityId = element.getAttribute("data-battle-choice-city-id");

          if (cityId) {
            onBattleChoiceConfirm({
              cityId,
              autoBattleEnabled: choice === "auto",
            });
          }
        }
      });
    });
  }

  if (onBattleChoiceCancel) {
    rootElement.querySelector('[data-battle-choice="cancel"]')?.addEventListener("click", () => {
      onBattleChoiceCancel();
    });
  }

  if (onHeroDeploymentToggle) {
    rootElement.querySelectorAll("[data-deployment-hero-id]").forEach((element) => {
      element.addEventListener("click", () => {
        onHeroDeploymentToggle(element.getAttribute("data-deployment-hero-id"));
      });
    });
  }

  if (onHeroDeploymentTroopsChange) {
    rootElement.querySelectorAll("[data-deployment-troops-hero-id]").forEach((element) => {
      element.addEventListener("input", (event) => {
        onHeroDeploymentTroopsChange({
          heroId: event.currentTarget.getAttribute("data-deployment-troops-hero-id"),
          amount: event.currentTarget.value,
        });
      });
    });
  }

  if (onHeroDeploymentStart) {
    rootElement.querySelector("[data-deployment-start-city-id]")?.addEventListener("click", (event) => {
      const cityId = event.currentTarget.getAttribute("data-deployment-start-city-id");

      if (!cityId || !pendingHeroDeployment?.selectedHeroIds?.length) {
        return;
      }

      onHeroDeploymentStart({
        cityId,
        selectedHeroIds: pendingHeroDeployment.selectedHeroIds,
        troopAllocations: pendingHeroDeployment.troopAllocations,
      });
    });
  }

  if (onHeroDeploymentCancel) {
    rootElement.querySelector("[data-deployment-cancel='true']")?.addEventListener("click", () => {
      onHeroDeploymentCancel();
    });
  }

  if (onHeroTransferOpen) {
    rootElement.querySelector("[data-hero-transfer-open-city-id]")?.addEventListener("click", (event) => {
      const cityId = event.currentTarget.getAttribute("data-hero-transfer-open-city-id");

      if (cityId) {
        onHeroTransferOpen(cityId);
      }
    });
  }

  if (onHeroTransferSelectHero) {
    rootElement.querySelectorAll("[data-transfer-hero-id]").forEach((element) => {
      element.addEventListener("click", () => {
        onHeroTransferSelectHero(element.getAttribute("data-transfer-hero-id"));
      });
    });
  }

  if (onHeroTransferSelectTargetCity) {
    rootElement.querySelectorAll("[data-transfer-target-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        onHeroTransferSelectTargetCity(element.getAttribute("data-transfer-target-city-id"));
      });
    });
  }

  if (onHeroTransferConfirm) {
    rootElement.querySelector("[data-transfer-confirm='true']")?.addEventListener("click", () => {
      if (!pendingHeroTransfer?.selectedHeroId || !pendingHeroTransfer?.selectedTargetCityId) {
        return;
      }

      onHeroTransferConfirm({
        heroId: pendingHeroTransfer.selectedHeroId,
        targetCityId: pendingHeroTransfer.selectedTargetCityId,
      });
    });
  }

  if (onHeroTransferCancel) {
    rootElement.querySelector("[data-transfer-cancel='true']")?.addEventListener("click", () => {
      onHeroTransferCancel();
    });
  }

  if (onEndWorldTurn) {
    rootElement.querySelector("[data-end-world-turn='true']")?.addEventListener("click", () => {
      onEndWorldTurn();
    });
  }

  if (onTaxLevelChange) {
    rootElement.querySelector("[data-tax-level]")?.addEventListener("input", (event) => {
      onTaxLevelChange(event.currentTarget.value);
    });
  }

  if (onChancellorPolicyChange) {
    rootElement.querySelector("[data-chancellor-policy]")?.addEventListener("change", (event) => {
      onChancellorPolicyChange(event.currentTarget.value);
    });
  }

  if (onChancellorHeroChange) {
    rootElement.querySelector("[data-chancellor-hero-id]")?.addEventListener("change", (event) => {
      onChancellorHeroChange(event.currentTarget.value);
    });
  }

  if (onGovernorHeroChange) {
    rootElement.querySelector("[data-governor-hero-id]")?.addEventListener("change", (event) => {
      const cityId = event.currentTarget.getAttribute("data-governor-city-id");

      if (cityId) {
        onGovernorHeroChange({
          cityId,
          governorHeroId: event.currentTarget.value,
        });
      }
    });
  }

  if (onGovernorPolicyChange) {
    rootElement.querySelector("[data-governor-policy]")?.addEventListener("change", (event) => {
      const cityId = event.currentTarget.getAttribute("data-governor-policy-city-id");

      if (cityId) {
        onGovernorPolicyChange({
          cityId,
          governorPolicy: event.currentTarget.value,
        });
      }
    });
  }

  if (onRecruitTroops) {
    rootElement.querySelectorAll("[data-recruit-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        const cityId = element.getAttribute("data-recruit-city-id");
        const amount = Number(element.getAttribute("data-recruit-amount"));

        if (cityId) {
          onRecruitTroops({ cityId, amount });
        }
      });
    });
  }

  if (onTradeRelationAction) {
    rootElement.querySelectorAll("[data-trade-relation-action]").forEach((element) => {
      element.addEventListener("click", () => {
        const action = element.getAttribute("data-trade-relation-action");
        const factionA = element.getAttribute("data-relation-faction-a");
        const factionB = element.getAttribute("data-relation-faction-b");

        if (action && factionA && factionB) {
          onTradeRelationAction({ action, factionA, factionB });
        }
      });
    });
  }

  if (onTradeControlOpen) {
    rootElement.querySelectorAll("[data-trade-control-open-city-id]").forEach((element) => {
      element.addEventListener("click", () => {
        const cityId = element.getAttribute("data-trade-control-open-city-id");

        if (cityId) {
          onTradeControlOpen(cityId);
        }
      });
    });
  }

  if (onTradeControlApply) {
    rootElement.querySelector("[data-trade-control-apply-city-id]")?.addEventListener("click", (event) => {
      const cityId = event.currentTarget.getAttribute("data-trade-control-apply-city-id");
      const modal = event.currentTarget.closest(".trade-control-modal");

      if (!cityId || !modal) {
        return;
      }

      onTradeControlApply({
        cityId,
        tradeSettings: collectTradeControlSettings(modal),
      });
    });
  }

  if (onTradeControlAuto) {
    rootElement.querySelector("[data-trade-control-auto-city-id]")?.addEventListener("click", (event) => {
      const cityId = event.currentTarget.getAttribute("data-trade-control-auto-city-id");
      const modal = event.currentTarget.closest(".trade-control-modal");

      if (!cityId || !modal) {
        return;
      }

      onTradeControlAuto({
        cityId,
        tradeSettings: {
          ...collectTradeControlSettings(modal),
          mode: "auto",
        },
      });
    });
  }

  if (onTradeControlClose) {
    rootElement.querySelector("[data-trade-control-close='true']")?.addEventListener("click", () => {
      onTradeControlClose();
    });
  }

  if (onCityDetailTabChange) {
    rootElement.querySelectorAll("[data-city-detail-tab]").forEach((element) => {
      element.addEventListener("click", () => {
        const tab = element.getAttribute("data-city-detail-tab");

        if (tab) {
          onCityDetailTabChange(tab);
        }
      });
    });
  }

  if (onDiplomacySpyTabChange) {
    rootElement.querySelectorAll("[data-diplomacy-spy-tab]").forEach((element) => {
      element.addEventListener("click", () => {
        const tab = element.getAttribute("data-diplomacy-spy-tab");

        if (tab) {
          onDiplomacySpyTabChange(tab);
        }
      });
    });
  }

  if (onDiplomacySpyToggle) {
    rootElement.querySelectorAll("[data-diplomacy-spy-toggle]").forEach((element) => {
      element.addEventListener("click", () => {
        onDiplomacySpyToggle(element.getAttribute("data-diplomacy-spy-toggle") === "open");
      });
    });
  }

  if (onCityDetailToggle) {
    rootElement.querySelectorAll("[data-city-detail-toggle]").forEach((element) => {
      element.addEventListener("click", () => {
        onCityDetailToggle(element.getAttribute("data-city-detail-toggle") === "open");
      });
    });
  }

  if (onConfirmEnemyTurnResult) {
    rootElement.querySelector("[data-enemy-turn-result='confirm']")?.addEventListener("click", () => {
      onConfirmEnemyTurnResult();
    });
  }

  if (onSaveGame) {
    rootElement.querySelector("[data-save-game='true']")?.addEventListener("click", () => {
      onSaveGame();
    });
  }

  if (onLoadGame) {
    rootElement.querySelector("[data-load-game='true']")?.addEventListener("click", () => {
      onLoadGame();
    });
  }

  if (onResetGame) {
    rootElement.querySelector("[data-reset-game='true']")?.addEventListener("click", () => {
      onResetGame();
    });
  }
}

function getControlValue(modal, name, fallback) {
  return modal.querySelector(`[name="${name}"]`)?.value ?? fallback;
}

function getControlNumber(modal, name, fallback = 50) {
  const numericValue = Number(getControlValue(modal, name, fallback));
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(numericValue) ? numericValue : fallback)));
}

function collectTradeControlSettings(modal) {
  return {
    mode: getControlValue(modal, "mode", "auto"),
    intensity: getControlValue(modal, "intensity", "normal"),
    exportWeights: {
      rice: getControlNumber(modal, "export-rice"),
      barley: getControlNumber(modal, "export-barley"),
      seafood: getControlNumber(modal, "export-seafood"),
      salt: getControlNumber(modal, "export-salt"),
      silk: getControlNumber(modal, "export-silk"),
    },
    importPriority: {
      gold: getControlNumber(modal, "import-gold", 70),
      food: getControlNumber(modal, "import-food"),
      salt: getControlNumber(modal, "import-salt"),
      silk: getControlNumber(modal, "import-silk", 30),
    },
    routeLimitOverride: null,
  };
}
