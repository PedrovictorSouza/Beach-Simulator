import {
  clearOverlayTransition,
  playOverlayTransition
} from "./app/ui/overlayTransition.js";
import startTitleImageSrc from "./app/ui/images/Logo.png";

const START_TITLE = "Small Island";
const START_TITLE_IMAGE_SRC = startTitleImageSrc;
const START_SCREEN_VIEW = Object.freeze({
  TITLE: "title",
  SLOTS: "slots"
});
const DEFAULT_START_SELECTION = Object.freeze({
  action: "newGame",
  slotId: "slot-1"
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeSaveSlots(saveSlots) {
  if (!Array.isArray(saveSlots)) {
    return [];
  }

  return saveSlots
    .filter((slot) => slot && typeof slot === "object")
    .map((slot, index) => ({
      id: String(slot.id || `slot-${index + 1}`),
      action: slot.action || "newGame",
      slotId: slot.slotId || slot.id || `slot-${index + 1}`,
      label: slot.label || (slot.action === "continue" ? "Continue" : "New Game"),
      detail: slot.detail || ""
    }));
}

export function createStartScreen({
  root,
  uiLayer,
  onStart = () => {},
  prepareExitTransition = () => {},
  saveSlots = [],
  initiallyActive = true
} = {}) {
  if (!(root instanceof HTMLElement)) {
    throw new Error("Start screen root invalido.");
  }
  const slots = normalizeSaveSlots(saveSlots);
  const state = {
    active: initiallyActive,
    view: START_SCREEN_VIEW.TITLE,
    selectedSlotIndex: 0,
    transitioning: false
  };
  let transitionToken = 0;

  function syncUiMode() {
    if (uiLayer instanceof HTMLElement) {
      uiLayer.dataset.mode = state.active ? "start" : "game";
    }
  }
  function buildRenderContext(root, state, START_TITLE) {
    return {
      root,
      state,
      slots,
      START_TITLE
    };
  }
  function hasSaveSlots() {
    return slots.length > 0;
  }
  function renderSlotButton(slot, index, selectedSlotIndex) {
    const selectedPrefix = index === selectedSlotIndex ? "> " : "";
    const detail = slot.detail ? ` ${escapeHtml(slot.detail)}` : "";
    return `
      <div class="start-card__slot-row">
        <button
          class="start-card__button"
          type="button"
          data-start-action="select-slot"
          data-slot-index="${index}"
          aria-selected="${index === selectedSlotIndex ? "true" : "false"}"
        >
          ${selectedPrefix}${escapeHtml(slot.label)}${detail}
        </button>
      </div>
    `;
  }
  function renderStartActions(renderContext) {
    if (renderContext.state.view === START_SCREEN_VIEW.SLOTS && renderContext.slots.length) {
      return `
        <div class="start-card__slots" role="menu" aria-label="Save Slots">
          ${renderContext.slots.map((slot, index) => (
            renderSlotButton(slot, index, renderContext.state.selectedSlotIndex)
          )).join("")}
        </div>
        <button class="start-card__button" type="button" data-start-action="back">
          Back
        </button>
      `;
    }

    return `
      <button class="start-card__button" type="button" data-start-action="begin">
        Start Game
      </button>
    `;
  }
  function render() {
    const renderContext = buildRenderContext(root, state, START_TITLE);
    clearOverlayTransition(root);
    syncUiMode();
    renderContext.root.hidden = !renderContext.state.active;
    renderContext.root.innerHTML = renderContext.state.active ? `
        <div class="start-shell">
          <section class="start-card">
            <img
              class="start-card__title-image"
              src="${START_TITLE_IMAGE_SRC}"
              alt="${renderContext.START_TITLE}"
            />
            <strong class="start-card__title" hidden>${renderContext.START_TITLE}</strong>
            ${renderStartActions(renderContext)}
          </section>
        </div>
      ` : "";

    const titleImage = renderContext.root.querySelector(".start-card__title-image");
    const titleFallback = renderContext.root.querySelector(".start-card__title");

    titleImage?.addEventListener("error", () => {
      titleImage.hidden = true;
      if (titleFallback instanceof HTMLElement) {
        titleFallback.hidden = false;
      }
    }, { once: true });

    if (renderContext.state.active && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(syncUiMode);
    }
  }
  function setStartActionsDisabled(disabled) {
    root.querySelectorAll("[data-start-action]").forEach((actionElement) => {
      if (actionElement instanceof HTMLButtonElement) {
        actionElement.disabled = disabled;
      }
    });
  }

  function showTitle() {
    state.view = START_SCREEN_VIEW.TITLE;
    state.selectedSlotIndex = 0;
    render();
  }
  function showSaveSlots() {
    state.view = START_SCREEN_VIEW.SLOTS;
    state.selectedSlotIndex = 0;
    render();
  }
  function moveSelectedSlot(direction) {
    if (!slots.length) {
      return;
    }
    state.selectedSlotIndex = (state.selectedSlotIndex + direction + slots.length) % slots.length;
    render();
  }
  function getSelectedSlot() {
    return slots[state.selectedSlotIndex] || null;
  }
  function buildStartSelection(slot = null) {
    if (!slot) {
      return { ...DEFAULT_START_SELECTION };
    }

    return {
      action: slot.action,
      slotId: slot.slotId,
      label: slot.label
    };
  }
  function begin() {
    if (!state.active || state.transitioning) {
      return;
    }

    if (hasSaveSlots() && state.view === START_SCREEN_VIEW.TITLE) {
      showSaveSlots();
      return;
    }

    void commitStart(buildStartSelection(getSelectedSlot()));
  }
  async function commitStart(selection = DEFAULT_START_SELECTION) {
    if (!state.active || state.transitioning) {
      return;
    }

    const token = transitionToken + 1;
    transitionToken = token;
    state.transitioning = true;
    setStartActionsDisabled(true);
    await prepareExitTransition();
    await playOverlayTransition(root, {
      direction: "exit"
    });

    if (token !== transitionToken) {
      return;
    }

    state.active = false;
    state.transitioning = false;
    state.view = START_SCREEN_VIEW.TITLE;
    render();
    onStart(selection);
  }
  root.addEventListener("click", event => {
    if (!state.active) {
      return;
    }
    const actionTarget = event.target.closest("[data-start-action]");
    if (!actionTarget) {
      return;
    }
    const action = actionTarget.dataset.startAction;
    if (action === "back") {
      showTitle();
      return;
    }
    if (action === "select-slot") {
      const slotIndex = Number(actionTarget.dataset.slotIndex);
      if (Number.isInteger(slotIndex)) {
        state.selectedSlotIndex = Math.max(0, Math.min(slots.length - 1, slotIndex));
      }
      void commitStart(buildStartSelection(getSelectedSlot()));
      return;
    }
    begin();
  });
  render();
  return {
    isActive() {
      return state.active;
    },
    start() {
      transitionToken += 1;
      state.active = true;
      state.view = START_SCREEN_VIEW.TITLE;
      state.selectedSlotIndex = 0;
      state.transitioning = false;
      render();
    },
    dismiss() {
      transitionToken += 1;
      state.active = false;
      state.view = START_SCREEN_VIEW.TITLE;
      state.selectedSlotIndex = 0;
      state.transitioning = false;
      render();
    },
    handleKeydown(event) {
      if (!state.active) {
        return false;
      }
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      if (state.transitioning) {
        event.preventDefault();
        return true;
      }
      if (state.view === START_SCREEN_VIEW.SLOTS) {
        if (event.code === "ArrowDown" || event.code === "KeyS") {
          moveSelectedSlot(1);
          event.preventDefault();
          return true;
        }
        if (event.code === "ArrowUp" || event.code === "KeyW") {
          moveSelectedSlot(-1);
          event.preventDefault();
          return true;
        }
        if (event.code === "Escape" || event.code === "KeyX") {
          showTitle();
          event.preventDefault();
          return true;
        }
        if (event.code === "Space" || event.code === "Enter") {
          void commitStart(buildStartSelection(getSelectedSlot()));
          event.preventDefault();
          return true;
        }
      }
      if (event.code === "Space" || event.code === "Enter") {
        begin();
        event.preventDefault();
        return true;
      }
      if (event.code === "Escape" || event.code === "KeyE" || event.code === "KeyM" || ["w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        return true;
      }
      return false;
    },
    handleKeyup(event) {
      if (!state.active) {
        return false;
      }
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
      if (["w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        return true;
      }
      return false;
    }
  };
}
