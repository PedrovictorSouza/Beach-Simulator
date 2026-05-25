import {
  MODAL_COMMANDS,
  getWrappedModalIndex,
  resolveModalCommand
} from "./modalCommandController.js";
import {
  WORKBENCH_REQUIREMENT_PRESENTATION,
  getWorkbenchRecipePresentation
} from "./workbenchRecipePresentationContract.js";

const WORKBENCH_TITLE_IMAGE_URL = new URL("./images/workbench-title.png", import.meta.url).href;
const WORKBENCH_DETAILS_BACKGROUND_URL = new URL("./images/dialogue-box.png", import.meta.url).href;
const WORKBENCH_BUTTON_BACKGROUND_URL = new URL("./images/main-btn.png", import.meta.url).href;

export function createWorkbenchModalController({
  mount,
  inventory,
  getItemLabel,
  formatRequirementSummary,
  clearGameFlowInput
}) {
  let root = null;
  let recipe = null;
  let recipeOptions = [];
  let selectedRecipeIndex = 0;
  let onConfirm = null;
  let open = false;
  let buildConfirmationActive = false;
  let buildConfirmationTimer = null;

  function getDocument() {
    return mount?.ownerDocument || globalThis.document || null;
  }

  function applyElementStyles(element, styles) {
    Object.assign(element.style, styles);
  }

  function createElement(tagName, className, text = "") {
    const element = getDocument().createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text) {
      element.textContent = text;
    }
    return element;
  }

  function handleOpenKeydown(event) {
    if (!open) {
      return false;
    }

    const command = resolveModalCommand(event);

    if (command === MODAL_COMMANDS.CONFIRM) {
      confirm();
      return true;
    }

    if (command === MODAL_COMMANDS.CLOSE) {
      close();
      return true;
    }

    if (buildConfirmationActive) {
      return true;
    }

    if (command === MODAL_COMMANDS.NEXT) {
      moveSelection(1);
      return true;
    }

    if (command === MODAL_COMMANDS.PREVIOUS) {
      moveSelection(-1);
      return true;
    }

    return true;
  }

  function ensureRoot() {
    if (root || !mount || !getDocument()) {
      return root;
    }

    root = createElement("section", "workbench-modal");
    root.hidden = true;
    root.setAttribute("aria-label", "Workbench");
    root.setAttribute("role", "dialog");
    root.tabIndex = -1;
    root.addEventListener("keydown", (event) => {
      if (handleOpenKeydown(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    applyElementStyles(root, {
      position: "absolute",
      inset: "0",
      height: "100vh",
      zIndex: "18",
      display: "none",
      placeItems: "center",
      pointerEvents: "auto",
      background: "rgba(3, 5, 10, 0.82)",
      imageRendering: "pixelated"
    });
    mount.append(root);
    return root;
  }

  function getRecipeRequirementCopy(currentRecipe) {
    const ingredients = currentRecipe?.ingredients || {};
    const ingredientEntries = Object.entries(ingredients);
    if (!ingredientEntries.length) {
      return "No materials needed";
    }

    return ingredientEntries
      .map(([itemId, required]) => {
        const owned = Math.max(0, Number(inventory?.[itemId] || 0));
        return `${getItemLabel(itemId)} ${Math.min(owned, required)}/${required}`;
      })
      .join(" · ");
  }

  function close() {
    if (!root) {
      return;
    }

    if (buildConfirmationTimer) {
      globalThis.clearTimeout?.(buildConfirmationTimer);
      buildConfirmationTimer = null;
    }
    buildConfirmationActive = false;
    root.hidden = true;
    root.style.display = "none";
    root.replaceChildren();
    recipe = null;
    recipeOptions = [];
    selectedRecipeIndex = 0;
    onConfirm = null;
    open = false;
    clearGameFlowInput?.();
  }

  function normalizeRecipeOptions({ recipe: nextRecipe, recipes = [], onConfirm: nextOnConfirm } = {}) {
    const options = Array.isArray(recipes) && recipes.length > 0 ?
      recipes :
      [{ recipe: nextRecipe, onConfirm: nextOnConfirm }];

    return options
      .map((option) => {
        if (!option) {
          return null;
        }

        const optionRecipe = option.recipe || option;
        if (!optionRecipe) {
          return null;
        }

        return {
          recipe: optionRecipe,
          onConfirm: option.onConfirm || nextOnConfirm,
          disabled: Boolean(option.disabled),
          status: option.status || null,
          actionLabel: option.actionLabel || null,
          guidance: option.guidance || null
        };
      })
      .filter(Boolean);
  }

  function selectFirstAvailableRecipe(preferredRecipeId = null) {
    const preferredIndex = preferredRecipeId ?
      recipeOptions.findIndex((option) => option?.recipe?.id === preferredRecipeId) :
      -1;
    const enabledIndex = recipeOptions.findIndex((option) => !option.disabled);
    selectedRecipeIndex = preferredIndex >= 0 ? preferredIndex : enabledIndex >= 0 ? enabledIndex : 0;
    recipe = recipeOptions[selectedRecipeIndex]?.recipe || null;
  }

  function selectRecipeIndex(index) {
    if (!recipeOptions.length) {
      selectedRecipeIndex = 0;
      recipe = null;
      return;
    }

    selectedRecipeIndex = getWrappedModalIndex(index, recipeOptions.length);
    recipe = recipeOptions[selectedRecipeIndex]?.recipe || null;
  }

  function moveSelection(direction) {
    if (buildConfirmationActive || recipeOptions.length <= 1) {
      return;
    }

    selectRecipeIndex(selectedRecipeIndex + direction);
    render();
  }

  function getRecipeArtworkUrl(currentRecipe) {
    return getWorkbenchRecipePresentation(currentRecipe?.id).artworkUrl;
  }

  function getRecipeProtocolUi(currentRecipe) {
    return getWorkbenchRecipePresentation(currentRecipe?.id).protocol;
  }

  function getWorkbenchRecipeGuidance(option = {}) {
    const actionLabel = String(option.actionLabel || "").toLocaleLowerCase();
    const status = String(option.status || "").toLocaleLowerCase();

    if (option.guidance) {
      return option.guidance;
    }

    if (status.includes("locked")) {
      return "Plan unavailable. Progress the current colony task first.";
    }

    if (status.includes("created") || status.includes("placed") || status.includes("built")) {
      return "Already prepared. Check supplies or the placed object in the world.";
    }

    if (actionLabel.includes("place") || status.includes("ready to place")) {
      return "Prepared. Select it to choose a site in the world.";
    }

    if (!option.disabled) {
      return "Prepare this kit here, then place it from your supplies.";
    }

    return "No plan is loaded for this protocol yet.";
  }

  function createRecipeIcon(currentRecipe) {
    const icon = createElement("span", "workbench-modal__recipe-icon");
    applyElementStyles(icon, {
      width: "52px",
      height: "52px",
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      background: "#ff8f2f",
      color: "#241006",
      border: "3px solid #ffd37a",
      fontSize: "30px",
      lineHeight: "1"
    });

    icon.textContent = (currentRecipe.title || "?").slice(0, 1);
    return icon;
  }

  function confirm() {
    const selectedOption = recipeOptions[selectedRecipeIndex] || null;
    const confirmRecipe = selectedOption?.recipe || recipe;
    const confirmHandler = selectedOption?.onConfirm || onConfirm;

    if (
      !open ||
      buildConfirmationActive ||
      selectedOption?.disabled ||
      !confirmRecipe ||
      typeof confirmHandler !== "function"
    ) {
      return false;
    }

    const crafted = Boolean(confirmHandler(confirmRecipe));
    if (crafted) {
      buildConfirmationActive = true;
      render();
      buildConfirmationTimer = globalThis.setTimeout?.(() => {
        close();
      }, 620) || null;
      return true;
    }

    render();
    return false;
  }

  function render() {
    const currentRoot = ensureRoot();
    if (!currentRoot || !recipeOptions.length) {
      return;
    }
    const selectedOption = recipeOptions[selectedRecipeIndex] || recipeOptions[0];
    const selectedRecipe = selectedOption?.recipe || recipeOptions[0]?.recipe;
    const buildActionLabel = buildConfirmationActive ?
      "BUILT" :
      selectedOption?.disabled ?
        "LOCKED" :
        "BUILD";

    currentRoot.replaceChildren();

    const panel = createElement("div", "workbench-modal__panel");
    applyElementStyles(panel, {
      position: "relative",
      width: "96%",
      maxWidth: "1180px",
      minHeight: "min(760px, calc(100vh - 56px))",
      maxHeight: "calc(100vh - 56px)",
      overflow: "auto",
      border: "1px solid rgba(255, 255, 255, 0.34)",
      boxShadow: "none",
      backgroundColor: "rgb(0 0 0)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "#d0d0d0",
      padding: "24px 28px 26px",
      fontFamily: "'Rajdhani', var(--game-ui-font, monospace)",
      letterSpacing: "0.02em",
      textTransform: "none"
    });

    const header = createElement("div", "workbench-modal__header");
    applyElementStyles(header, {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      gap: "18px",
      marginBottom: "18px",
      paddingBottom: "14px",
      position: "relative",
      zIndex: "1"
    });

    const title = createElement("img", "workbench-modal__title");
    title.src = WORKBENCH_TITLE_IMAGE_URL;
    title.alt = "Workbench";
    applyElementStyles(title, {
      display: "block",
      width: "500px",
      height: "100px",
      objectFit: "contain",
      imageRendering: "pixelated"
    });
    const selectHint = createElement(
      "span",
      "workbench-modal__hint-select",
      "// Left/Right Select"
    );
    applyElementStyles(selectHint, {
      display: "block",
      color: "#00ff9d",
      fontFamily: "'Share Tech Mono', var(--game-ui-font, monospace)",
      fontSize: "12px",
      lineHeight: "1",
      whiteSpace: "nowrap",
      letterSpacing: "0.16em",
      textTransform: "uppercase"
    });
    header.append(title, selectHint);

    const recipeGrid = createElement("div", "workbench-modal__recipe-grid");
    applyElementStyles(recipeGrid, {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "10px",
      alignItems: "stretch",
      minHeight: "220px",
      position: "relative",
      zIndex: "1"
    });

    recipeOptions.forEach((option, index) => {
      const currentRecipe = option.recipe;
      const selected = index === selectedRecipeIndex;
      const recipeArtworkUrl = getRecipeArtworkUrl(currentRecipe);
      const recipeCard = createElement("button", "workbench-modal__recipe");
      recipeCard.type = "button";
      recipeCard.dataset.selected = selected ? "true" : "false";
      recipeCard.dataset.disabled = option.disabled ? "true" : "false";
      recipeCard.dataset.uiSelectionFrame = selected ? "true" : "false";
      recipeCard.setAttribute("aria-pressed", selected ? "true" : "false");
      recipeCard.setAttribute("aria-disabled", option.disabled ? "true" : "false");
      applyElementStyles(recipeCard, {
        position: "relative",
        width: "100%",
        minHeight: recipeArtworkUrl ? "clamp(220px, 28vh, 286px)" : "160px",
        display: "grid",
        gridTemplateColumns: recipeArtworkUrl ? "1fr" : "56px minmax(0, 1fr)",
        gridTemplateRows: "1fr auto",
        gap: recipeArtworkUrl ? "0" : "16px",
        alignItems: recipeArtworkUrl ? "stretch" : "center",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "none",
        backgroundColor: "#0d0d0d",
        backgroundImage: "none",
        color: "#d0d0d0",
        opacity: selected ? "1" : "0.52",
        padding: recipeArtworkUrl ? "0" : "16px",
        textAlign: "left",
        font: "inherit",
        cursor: option.disabled ? "default" : "pointer",
        overflow: "hidden"
      });

      const recipeArt = recipeArtworkUrl ? createElement("span", "workbench-modal__recipe-art") : null;
      if (recipeArt) {
        applyElementStyles(recipeArt, {
          display: "block",
          minHeight: "100%",
          backgroundImage: `url("${recipeArtworkUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: "1"
        });
      }

      const protocolMeta = getRecipeProtocolUi(currentRecipe);
      const requirementText = option.status || getRecipeRequirementCopy(currentRecipe);
      const recipeGuidanceText = getWorkbenchRecipeGuidance(option);
      recipeCard.setAttribute(
        "aria-label",
        [
          `${selected ? "Selected" : "Plan"}: ${currentRecipe.title || "Recipe"}`,
          protocolMeta.label,
          requirementText,
          protocolMeta.purpose,
          recipeGuidanceText
        ].filter(Boolean).join(". ")
      );
      if (recipeArt) {
        recipeCard.append(recipeArt);
      } else {
        recipeCard.append(createRecipeIcon(currentRecipe));
      }

      const recipeCopy = createElement("span", "workbench-modal__recipe-copy");
      applyElementStyles(recipeCopy, {
        position: "absolute",
        left: "16px",
        right: "16px",
        bottom: "14px",
        display: "grid",
        gap: "5px",
        zIndex: "5"
      });
      const recipeCardName = createElement("span", "workbench-modal__recipe-card-name", currentRecipe.title || "Recipe");
      applyElementStyles(recipeCardName, {
        display: "block",
        color: "#000000",
        fontFamily: "'Orbitron', var(--game-ui-font, monospace)",
        fontSize: "15px",
        fontWeight: "900",
        lineHeight: "1.08",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        overflowWrap: "anywhere",
        textAlign: "center",
        marginBottom: "26px"
      });
      recipeCopy.append(recipeCardName);
      recipeCard.append(recipeCopy);

      recipeCard.addEventListener("click", () => {
        if (buildConfirmationActive) {
          return;
        }

        selectRecipeIndex(index);
        if (!confirm()) {
          render();
        }
      });

      recipeGrid.append(recipeCard);
    });

    const selectedRequirementText = selectedOption?.status || getRecipeRequirementCopy(selectedRecipe);
    const selectedRecipeGuidanceText = buildConfirmationActive ?
      "Built. Choose a site in the world." :
      getWorkbenchRecipeGuidance(selectedOption);
    const recipeDetails = createElement("div", "workbench-modal__recipe-details");
    applyElementStyles(recipeDetails, {
      display: "block",
      margin: "18px 0 0",
      padding: "18px",
      border: "0",
      borderImage: "none",
      backgroundColor: "transparent",
      backgroundImage: `url("${WORKBENCH_DETAILS_BACKGROUND_URL}")`,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated",
      position: "relative",
      zIndex: "1"
    });
    const recipeName = createElement("span", "workbench-modal__recipe-name", selectedRecipe?.title || "Recipe");
    applyElementStyles(recipeName, {
      display: "block",
      color: "#ffffff",
      fontFamily: "'Orbitron', var(--game-ui-font, monospace)",
      fontSize: "24px",
      fontWeight: "900",
      lineHeight: "1",
      letterSpacing: "0.1em",
      textTransform: "uppercase"
    });
    const requirement = createElement("div", "workbench-modal__recipe-requirement");
    applyElementStyles(requirement, {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#00ff9d",
      fontSize: "28px",
      lineHeight: "1.1",
      marginTop: "7px"
    });
    const requirementIcon = createElement("img", "workbench-modal__recipe-requirement-icon");
    requirementIcon.src = WORKBENCH_REQUIREMENT_PRESENTATION.iconUrl;
    requirementIcon.alt = WORKBENCH_REQUIREMENT_PRESENTATION.iconAlt;
    applyElementStyles(requirementIcon, {
      width: "100px",
      height: "100px",
      flex: "0 0 auto",
      imageRendering: "pixelated"
    });
    const requirementCopy = createElement(
      "span",
      "workbench-modal__recipe-requirement-copy",
      selectedRequirementText
    );
    applyElementStyles(requirementCopy, {
      display: "block",
      color: "#00d4ff",
      fontFamily: "'Super Mario World', var(--game-ui-font, monospace)",
      fontSize: "34px",
      letterSpacing: "0.08em",
      textTransform: "uppercase"
    });
    requirement.append(requirementIcon, requirementCopy);
    const recipeGuidance = createElement("span", "workbench-modal__recipe-guidance", selectedRecipeGuidanceText);
    applyElementStyles(recipeGuidance, {
      display: "block",
      color: "#00ff9d",
      fontFamily: "'Share Tech Mono', var(--game-ui-font, monospace)",
      fontSize: "15px",
      lineHeight: "1.35",
      marginTop: "8px",
      textTransform: "none"
    });
    recipeDetails.append(recipeName, requirement, recipeGuidance);

    const hint = createElement("button", "workbench-modal__hint");
    hint.type = "button";
    hint.disabled = Boolean(selectedOption?.disabled || buildConfirmationActive);
    hint.setAttribute(
      "aria-label",
      buildConfirmationActive ?
        "Build complete" :
        selectedOption?.disabled ?
          "Build unavailable" :
          "Build selected Workbench recipe"
    );
    applyElementStyles(hint, {
      margin: "0",
      border: "0",
      backgroundColor: selectedOption?.disabled ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 255, 157, 0.08)",
      backgroundImage: `url("${WORKBENCH_BUTTON_BACKGROUND_URL}")`,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: selectedOption?.disabled ? "#888888" : "#00ff9d",
      boxShadow: "none",
      fontFamily: "'Super Mario World', var(--game-ui-font, monospace)",
      fontSize: "13px",
      lineHeight: "1",
      padding: "12px 18px",
      cursor: selectedOption?.disabled || buildConfirmationActive ? "default" : "pointer",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      position: "relative",
      zIndex: "1"
    });
    const actionHint = createElement(
      "span",
      "workbench-modal__hint-action",
      buildActionLabel
    );
    applyElementStyles(actionHint, {
      fontFamily: "'Super Mario World', var(--game-ui-font, monospace)",
      color: selectedOption?.disabled && !buildConfirmationActive ? "#888888" : "#00ff9d"
    });
    const closeHint = createElement("button", "workbench-modal__hint-close", "B / Esc Close");
    closeHint.type = "button";
    closeHint.setAttribute("aria-label", "Close Workbench");
    applyElementStyles(closeHint, {
      border: "0",
      backgroundColor: "#E91E63",
      backgroundImage: `url("${WORKBENCH_BUTTON_BACKGROUND_URL}")`,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "#ffffff",
      fontFamily: "'Share Tech Mono', var(--game-ui-font, monospace)",
      fontSize: "12px",
      lineHeight: "1",
      padding: "12px 18px",
      cursor: "pointer",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      zIndex: "1"
    });
    hint.append(actionHint);
    hint.addEventListener("click", () => {
      if (!selectedOption?.disabled && !buildConfirmationActive) {
        confirm();
      }
    });
    closeHint.addEventListener("click", close);

    const actions = createElement("div", "workbench-modal__actions");
    applyElementStyles(actions, {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: "14px 0 0",
      position: "relative",
      zIndex: "1"
    });
    actions.append(hint, closeHint);

    panel.append(header, recipeGrid, recipeDetails, actions);
    currentRoot.append(panel);
  }

  return {
    open(options = {}) {
      if (buildConfirmationTimer) {
        globalThis.clearTimeout?.(buildConfirmationTimer);
        buildConfirmationTimer = null;
      }
      buildConfirmationActive = false;
      recipeOptions = normalizeRecipeOptions(options);
      if (!recipeOptions.length) {
        return false;
      }

      onConfirm = options.onConfirm;
      selectFirstAvailableRecipe(options.initialRecipeId);
      open = true;
      render();
      if (root) {
        root.hidden = false;
        root.style.display = "grid";
        root.focus?.({ preventScroll: true });
      }
      clearGameFlowInput?.();
      return true;
    },
    close,
    handleKeydown(event) {
      return handleOpenKeydown(event);
    },
    isOpen() {
      return open;
    }
  };
}
