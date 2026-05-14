import { renderAllWorldUI } from "./ui_render.js";

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
    onCityDetailToggle,
    onConfirmEnemyTurnResult,
    onSaveGame,
    onLoadGame,
    onResetGame,
  } = handlers;
  const { pendingHeroDeployment, pendingHeroTransfer } = appState;

  rootElement.innerHTML = renderAllWorldUI(appState);

  if (onCitySelect) {
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
