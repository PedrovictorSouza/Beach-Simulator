import { SANDBOTS_ITEM_NAMES } from "../story/sandbotsLexicon.js";

const LEAFAGE_DETAILS_BACKGROUND_URL = new URL("./images/dialogue-box.png", import.meta.url).href;
const LEAFAGE_BUTTON_BACKGROUND_URL = new URL("./images/main-btn.png", import.meta.url).href;

function applyElementStyles(element, styles) {
  Object.assign(element.style, styles);
}

function createElement(documentRef, tagName, className, text = "") {
  const element = documentRef.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

function ensureModalStyles(documentRef) {
  if (!documentRef || documentRef.getElementById("leafage-object-modal-animation")) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = "leafage-object-modal-animation";
  style.textContent = `
@keyframes leafageObjectModalCloseHintBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.28; }
}`;
  documentRef.head?.append(style);
}

export function createLeafageObjectModalController({
  mount,
  clearGameFlowInput
}) {
  let root = null;
  let options = [];
  let selectedIndex = 0;
  let selectedId = "tallGrass";
  let onSelect = null;
  let open = false;

  function getDocument() {
    return mount?.ownerDocument || globalThis.document || null;
  }

  function ensureRoot() {
    const documentRef = getDocument();
    if (root || !mount || !documentRef) {
      return root;
    }

    root = createElement(documentRef, "section", "leafage-object-modal");
    root.hidden = true;
    root.setAttribute("aria-label", `${SANDBOTS_ITEM_NAMES.growTool} object selector`);
    root.setAttribute("role", "dialog");
    applyElementStyles(root, {
      position: "absolute",
      inset: "0",
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

  function close() {
    if (!root) {
      return;
    }

    root.hidden = true;
    root.style.display = "none";
    root.replaceChildren();
    options = [];
    selectedIndex = 0;
    onSelect = null;
    open = false;
    clearGameFlowInput?.();
  }

  function selectIndex(index) {
    if (!options.length) {
      selectedIndex = 0;
      return;
    }

    selectedIndex = (index + options.length) % options.length;
    selectedId = options[selectedIndex]?.id || selectedId;
  }

  function moveSelection(direction) {
    if (options.length <= 1) {
      return;
    }

    selectIndex(selectedIndex + direction);
    render();
  }

  function confirm() {
    const option = options[selectedIndex] || null;
    if (!open || !option || typeof onSelect !== "function") {
      return false;
    }

    selectedId = option.id;
    onSelect(option);
    close();
    return true;
  }

  function render() {
    const documentRef = getDocument();
    const currentRoot = ensureRoot();
    if (!documentRef || !currentRoot || !options.length) {
      return;
    }

    ensureModalStyles(documentRef);
    currentRoot.replaceChildren();

    const selectedOption = options[selectedIndex] || options[0];
    const panel = createElement(documentRef, "div", "leafage-object-modal__panel");
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
      color: "#d0d0d0",
      padding: "24px 28px 26px",
      fontFamily: "'Rajdhani', var(--game-ui-font, monospace)",
      letterSpacing: "0.02em",
      textTransform: "none"
    });

    const header = createElement(documentRef, "div", "leafage-object-modal__header");
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

    const title = createElement(documentRef, "strong", "leafage-object-modal__title", SANDBOTS_ITEM_NAMES.growTool);
    applyElementStyles(title, {
      display: "block",
      color: "#00ff9d",
      fontFamily: "'Orbitron', var(--game-ui-font, monospace)",
      fontSize: "clamp(42px, 6vw, 76px)",
      fontWeight: "900",
      lineHeight: "1",
      letterSpacing: "0.08em",
      textTransform: "uppercase"
    });
    const selectHint = createElement(documentRef, "span", "leafage-object-modal__hint-select", "// Left/Right Select");
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

    const grid = createElement(documentRef, "div", "leafage-object-modal__grid");
    applyElementStyles(grid, {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "10px",
      alignItems: "stretch",
      minHeight: "220px",
      position: "relative",
      zIndex: "1"
    });

    options.forEach((option, index) => {
      const selected = index === selectedIndex;
      const card = createElement(documentRef, "button", "leafage-object-modal__option");
      card.type = "button";
      card.dataset.selected = selected ? "true" : "false";
      card.dataset.optionId = option.id;
      card.dataset.uiSelectionFrame = selected ? "true" : "false";
      applyElementStyles(card, {
        position: "relative",
        width: "100%",
        minHeight: "clamp(220px, 28vh, 286px)",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr auto",
        gap: "0",
        alignItems: "stretch",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "none",
        backgroundColor: "#0d0d0d",
        backgroundImage: "none",
        color: "#d0d0d0",
        opacity: selected ? "1" : "0.52",
        padding: "0",
        textAlign: "left",
        font: "inherit",
        cursor: "pointer",
        overflow: "hidden"
      });

      const art = createElement(documentRef, "span", "leafage-object-modal__art");
      applyElementStyles(art, {
        display: "block",
        minHeight: "100%",
        backgroundImage: option.artworkUrl ? `url("${option.artworkUrl}")` : "none",
        backgroundSize: option.artworkUrl ? "cover" : "auto",
        backgroundPosition: option.artworkUrl ? "center" : "initial",
        backgroundRepeat: "no-repeat",
        opacity: "1"
      });
      const copy = createElement(documentRef, "span", "leafage-object-modal__copy");
      applyElementStyles(copy, {
        position: "absolute",
        left: "16px",
        right: "16px",
        bottom: "14px",
        display: "grid",
        gap: "5px",
        zIndex: "5"
      });
      const name = createElement(documentRef, "span", "leafage-object-modal__name", option.label);
      applyElementStyles(name, {
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
      copy.append(name);
      card.append(art, copy);

      card.addEventListener("click", () => {
        selectIndex(index);
        confirm();
      });
      grid.append(card);
    });

    const details = createElement(documentRef, "div", "leafage-object-modal__details");
    applyElementStyles(details, {
      display: "block",
      margin: "18px 0 0",
      padding: "18px",
      border: "0",
      backgroundColor: "transparent",
      backgroundImage: `url("${LEAFAGE_DETAILS_BACKGROUND_URL}")`,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated",
      position: "relative",
      zIndex: "1"
    });
    const detailsName = createElement(documentRef, "span", "leafage-object-modal__details-name", selectedOption?.label || "Object");
    applyElementStyles(detailsName, {
      display: "block",
      color: "#ffffff",
      fontFamily: "'Orbitron', var(--game-ui-font, monospace)",
      fontSize: "24px",
      fontWeight: "900",
      lineHeight: "1",
      letterSpacing: "0.1em",
      textTransform: "uppercase"
    });
    const status = createElement(documentRef, "span", "leafage-object-modal__status", "Selected");
    applyElementStyles(status, {
      display: "block",
      color: "#00d4ff",
      fontFamily: "'Super Mario World', var(--game-ui-font, monospace)",
      fontSize: "34px",
      lineHeight: "1.1",
      letterSpacing: "0.08em",
      marginTop: "7px",
      textTransform: "uppercase"
    });
    const guidance = createElement(
      documentRef,
      "span",
      "leafage-object-modal__guidance",
      selectedOption?.notice || `${SANDBOTS_ITEM_NAMES.growTool} will grow the selected object.`
    );
    applyElementStyles(guidance, {
      display: "block",
      color: "#00ff9d",
      fontFamily: "'Share Tech Mono', var(--game-ui-font, monospace)",
      fontSize: "15px",
      lineHeight: "1.35",
      marginTop: "8px",
      textTransform: "none"
    });
    details.append(detailsName, status, guidance);

    const hint = createElement(documentRef, "button", "leafage-object-modal__hint");
    hint.type = "button";
    hint.setAttribute("aria-label", `Choose ${selectedOption?.label || "Bio-Grow object"}`);
    applyElementStyles(hint, {
      margin: "0",
      border: "0",
      backgroundColor: "rgba(0, 255, 157, 0.08)",
      backgroundImage: `url("${LEAFAGE_BUTTON_BACKGROUND_URL}")`,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      color: "#00ff9d",
      boxShadow: "none",
      fontFamily: "'Super Mario World', var(--game-ui-font, monospace)",
      fontSize: "13px",
      lineHeight: "1",
      padding: "12px 18px",
      cursor: "pointer",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      position: "relative",
      zIndex: "1"
    });
    hint.textContent = "Choose";
    hint.addEventListener("click", confirm);

    const closeHint = createElement(documentRef, "button", "leafage-object-modal__hint-close", "B / Esc Close");
    closeHint.type = "button";
    closeHint.setAttribute("aria-label", `Close ${SANDBOTS_ITEM_NAMES.growTool}`);
    applyElementStyles(closeHint, {
      border: "0",
      backgroundColor: "#E91E63",
      backgroundImage: `url("${LEAFAGE_BUTTON_BACKGROUND_URL}")`,
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
    closeHint.addEventListener("click", close);

    const actions = createElement(documentRef, "div", "leafage-object-modal__actions");
    applyElementStyles(actions, {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: "14px 0 0",
      position: "relative",
      zIndex: "1"
    });
    actions.append(hint, closeHint);

    panel.append(header, grid, details, actions);
    currentRoot.append(panel);
  }

  return {
    open({
      options: nextOptions = [],
      selectedId: nextSelectedId = "tallGrass",
      onSelect: nextOnSelect = null
    } = {}) {
      options = nextOptions.filter(Boolean);
      if (!options.length) {
        return false;
      }

      selectedId = nextSelectedId || selectedId;
      selectedIndex = Math.max(0, options.findIndex((option) => option.id === selectedId));
      if (selectedIndex < 0) {
        selectedIndex = 0;
      }
      onSelect = nextOnSelect;
      open = true;
      render();

      if (root) {
        root.hidden = false;
        root.style.display = "grid";
      }
      clearGameFlowInput?.();
      return true;
    },
    close,
    handleKeydown(event) {
      if (!open) {
        return false;
      }

      if (event.code === "KeyE" || event.code === "KeyX" || event.code === "Enter") {
        confirm();
        return true;
      }

      if (event.code === "ArrowRight" || event.code === "ArrowDown") {
        moveSelection(1);
        return true;
      }

      if (event.code === "ArrowLeft" || event.code === "ArrowUp") {
        moveSelection(-1);
        return true;
      }

      if (event.code === "KeyB" || event.code === "Space" || event.code === "Escape") {
        close();
        return true;
      }

      return true;
    },
    isOpen() {
      return open;
    }
  };
}
