import { renderAllWorldUI } from "./ui_render.js";

export function renderWorldMap(rootElement, appState, handlers = {}) {
  const {
    onCitySelect,
    onAttackCity,
    onBattleChoiceConfirm,
    onBattleChoiceCancel,
    onHeroDeploymentToggle,
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

  if (onHeroDeploymentStart) {
    rootElement.querySelector("[data-deployment-start-city-id]")?.addEventListener("click", (event) => {
      const cityId = event.currentTarget.getAttribute("data-deployment-start-city-id");

      if (!cityId || !pendingHeroDeployment?.selectedHeroIds?.length) {
        return;
      }

      onHeroDeploymentStart({
        cityId,
        selectedHeroIds: pendingHeroDeployment.selectedHeroIds,
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
