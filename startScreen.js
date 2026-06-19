import {
  clearOverlayTransition,
  playOverlayTransition
} from "./app/ui/overlayTransition.js";
import {
  DEFAULT_START_LOCALE,
  START_LANGUAGE_OPTIONS,
  createStartScreenText
} from "./app/i18n/startScreenText.js";
import { START_SLOT_ACTION } from "./app/start/startSlotContract.js";
import { createStartScreenUniverseBackground } from "./app/ui/startScreenUniverseBackground.js";
import startTitleImageSrc from "./app/ui/images/Logo.png";

const START_TITLE = "Small Island";
const START_TITLE_IMAGE_SRC = startTitleImageSrc;
const START_SCREEN_VIEW = Object.freeze({
  TITLE: "title",
  SLOTS: "slots",
  LANGUAGE: "language"
});
const DEFAULT_START_SELECTION = Object.freeze({
  action: START_SLOT_ACTION.NEW_GAME,
  slotId: "slot-1",
  locale: DEFAULT_START_LOCALE
});
const EMPTY_START_SLOTS = Object.freeze([
  {
    id: "new-game-slot-1",
    action: START_SLOT_ACTION.NEW_GAME,
    slotId: "slot-1",
    label: "New Game",
    detail: "Slot 1"
  },
  {
    id: "new-game-slot-2",
    action: START_SLOT_ACTION.NEW_GAME,
    slotId: "slot-2",
    label: "New Game",
    detail: "Slot 2"
  },
  {
    id: "new-game-slot-3",
    action: START_SLOT_ACTION.NEW_GAME,
    slotId: "slot-3",
    label: "New Game",
    detail: "Slot 3"
  }
]);

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
    return [...EMPTY_START_SLOTS];
  }

  const normalizedSlots = saveSlots
    .filter((slot) => slot && typeof slot === "object")
    .map((slot, index) => ({
      id: String(slot.id || `slot-${index + 1}`),
      action: slot.action || START_SLOT_ACTION.NEW_GAME,
      slotId: slot.slotId || slot.id || `slot-${index + 1}`,
      label: slot.label || "",
      detail: slot.detail || ""
    }));

  return normalizedSlots.length ? normalizedSlots : [...EMPTY_START_SLOTS];
}

function getSlotNumber(slot, index) {
  const match = /^slot-(\d+)$/.exec(String(slot?.slotId || ""));
  if (match) {
    return Number(match[1]);
  }

  return index + 1;
}

function resolveSlotLabel(slot, t) {
  if (slot.action === START_SLOT_ACTION.CONTINUE) {
    return t("slot.continue");
  }

  if (slot.action === START_SLOT_ACTION.NEW_GAME) {
    return t("slot.newGame");
  }

  return slot.label || t("slot.newGame");
}

function resolveSlotDetail(slot, index, t) {
  const detail = String(slot.detail || "");
  const slotNumber = getSlotNumber(slot, index);

  if (slot.action === START_SLOT_ACTION.CONTINUE || detail === "Saved Game") {
    return t("slot.savedGame");
  }

  if (/^empty slot/i.test(detail)) {
    return t("slot.emptySlot", { slotNumber });
  }

  if (/^slot/i.test(detail)) {
    return t("slot.slot", { slotNumber });
  }

  return detail;
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
    selectedLanguageIndex: 0,
    pendingSelection: null,
    transitioning: false
  };
  let transitionToken = 0;
  let universeBackground = null;

  function syncUiMode() {
    if (uiLayer instanceof HTMLElement) {
      uiLayer.dataset.mode = state.active ? "start" : "game";
    }
  }
  function destroyUniverseBackground() {
    universeBackground?.destroy?.();
    universeBackground = null;
  }
  function mountUniverseBackground() {
    const shell = root.querySelector(".start-shell");
    if (!(shell instanceof HTMLElement)) {
      return;
    }

    universeBackground = createStartScreenUniverseBackground({
      root: shell
    });
  }
  function buildRenderContext(root, state, START_TITLE) {
    const text = createStartScreenText({
      locale: state.view === START_SCREEN_VIEW.LANGUAGE ?
        getSelectedLanguage().locale :
        DEFAULT_START_LOCALE
    });

    return {
      root,
      state,
      slots,
      languages: START_LANGUAGE_OPTIONS,
      t: text.t,
      START_TITLE
    };
  }
  function hasSaveSlots() {
    return slots.length > 0;
  }
  function renderSlotButton(slot, index, selectedSlotIndex, t) {
    const selectedPrefix = index === selectedSlotIndex ? "> " : "";
    const label = resolveSlotLabel(slot, t);
    const detail = resolveSlotDetail(slot, index, t);
    const detailText = detail ? ` ${escapeHtml(detail)}` : "";
    return `
      <div class="start-card__slot-row">
        <button
          class="start-card__button"
          type="button"
          data-start-action="select-slot"
          data-slot-index="${index}"
          aria-selected="${index === selectedSlotIndex ? "true" : "false"}"
        >
          ${selectedPrefix}${escapeHtml(label)}${detailText}
        </button>
      </div>
    `;
  }
  function renderLanguageButton(language, index, selectedLanguageIndex) {
    const selectedPrefix = index === selectedLanguageIndex ? "> " : "";
    return `
      <div class="start-card__slot-row">
        <button
          class="start-card__button"
          type="button"
          data-start-action="select-language"
          data-language-index="${index}"
          aria-selected="${index === selectedLanguageIndex ? "true" : "false"}"
        >
          ${selectedPrefix}${escapeHtml(language.label)}
        </button>
      </div>
    `;
  }
  function renderStartActions(renderContext) {
    if (renderContext.state.view === START_SCREEN_VIEW.SLOTS && renderContext.slots.length) {
      return `
        <div class="start-card__slots" role="menu" aria-label="${escapeHtml(renderContext.t("slot.menu"))}">
          ${renderContext.slots.map((slot, index) => (
            renderSlotButton(slot, index, renderContext.state.selectedSlotIndex, renderContext.t)
          )).join("")}
        </div>
        <button class="start-card__button" type="button" data-start-action="back">
          ${escapeHtml(renderContext.t("action.back"))}
        </button>
      `;
    }

    if (renderContext.state.view === START_SCREEN_VIEW.LANGUAGE) {
      return `
        <strong class="start-card__title">${escapeHtml(renderContext.t("language.title"))}</strong>
        <div class="start-card__slots" role="menu" aria-label="${escapeHtml(renderContext.t("language.title"))}">
          ${renderContext.languages.map((language, index) => (
            renderLanguageButton(language, index, renderContext.state.selectedLanguageIndex)
          )).join("")}
        </div>
        <button class="start-card__button" type="button" data-start-action="back">
          ${escapeHtml(renderContext.t("action.back"))}
        </button>
      `;
    }

    return `
      <button
        class="start-card__button start-card__start-prompt"
        type="button"
        data-start-action="begin"
      >
        ${escapeHtml(renderContext.t("start.prompt"))}
      </button>
    `;
  }
  function render() {
    const renderContext = buildRenderContext(root, state, START_TITLE);
    destroyUniverseBackground();
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

    if (renderContext.state.active) {
      mountUniverseBackground();
    }

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
    state.selectedLanguageIndex = 0;
    state.pendingSelection = null;
    render();
  }
  function showSaveSlots() {
    state.view = START_SCREEN_VIEW.SLOTS;
    state.selectedSlotIndex = 0;
    state.selectedLanguageIndex = 0;
    state.pendingSelection = null;
    render();
  }
  function showLanguageSelection(selection) {
    state.view = START_SCREEN_VIEW.LANGUAGE;
    state.pendingSelection = selection;
    state.selectedLanguageIndex = 0;
    render();
  }
  function moveSelectedSlot(direction) {
    if (!slots.length) {
      return;
    }
    state.selectedSlotIndex = (state.selectedSlotIndex + direction + slots.length) % slots.length;
    render();
  }
  function moveSelectedLanguage(direction) {
    state.selectedLanguageIndex = (
      state.selectedLanguageIndex + direction + START_LANGUAGE_OPTIONS.length
    ) % START_LANGUAGE_OPTIONS.length;
    render();
  }
  function getSelectedSlot() {
    return slots[state.selectedSlotIndex] || null;
  }
  function getSelectedLanguage() {
    return START_LANGUAGE_OPTIONS[state.selectedLanguageIndex] || START_LANGUAGE_OPTIONS[0];
  }
  function buildStartSelection(slot = null, language = START_LANGUAGE_OPTIONS[0]) {
    if (!slot) {
      return { ...DEFAULT_START_SELECTION };
    }

    const selection = {
      action: slot.action,
      slotId: slot.slotId,
      label: slot.label
    };

    if (selection.action === START_SLOT_ACTION.NEW_GAME) {
      selection.locale = language.locale;
    }

    return selection;
  }
  function confirmSlotSelection(slot = getSelectedSlot()) {
    const selection = buildStartSelection(slot);
    if (selection.action === START_SLOT_ACTION.NEW_GAME) {
      showLanguageSelection(selection);
      return;
    }

    void commitStart(selection);
  }
  function confirmLanguageSelection() {
    const selection = {
      ...(state.pendingSelection || DEFAULT_START_SELECTION),
      locale: getSelectedLanguage().locale
    };
    void commitStart(selection);
  }
  function begin() {
    if (!state.active || state.transitioning) {
      return;
    }

    if (hasSaveSlots() && state.view === START_SCREEN_VIEW.TITLE) {
      showSaveSlots();
      return;
    }

    confirmSlotSelection(getSelectedSlot());
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
    state.pendingSelection = null;
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
      if (state.view === START_SCREEN_VIEW.LANGUAGE) {
        showSaveSlots();
      } else {
        showTitle();
      }
      return;
    }
    if (action === "select-slot") {
      const slotIndex = Number(actionTarget.dataset.slotIndex);
      if (Number.isInteger(slotIndex)) {
        state.selectedSlotIndex = Math.max(0, Math.min(slots.length - 1, slotIndex));
      }
      confirmSlotSelection(getSelectedSlot());
      return;
    }
    if (action === "select-language") {
      const languageIndex = Number(actionTarget.dataset.languageIndex);
      if (Number.isInteger(languageIndex)) {
        state.selectedLanguageIndex = Math.max(0, Math.min(
          START_LANGUAGE_OPTIONS.length - 1,
          languageIndex
        ));
      }
      confirmLanguageSelection();
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
      state.selectedLanguageIndex = 0;
      state.pendingSelection = null;
      state.transitioning = false;
      render();
    },
    dismiss() {
      transitionToken += 1;
      state.active = false;
      state.view = START_SCREEN_VIEW.TITLE;
      state.selectedSlotIndex = 0;
      state.selectedLanguageIndex = 0;
      state.pendingSelection = null;
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
          confirmSlotSelection(getSelectedSlot());
          event.preventDefault();
          return true;
        }
      }
      if (state.view === START_SCREEN_VIEW.LANGUAGE) {
        if (event.code === "ArrowDown" || event.code === "KeyS") {
          moveSelectedLanguage(1);
          event.preventDefault();
          return true;
        }
        if (event.code === "ArrowUp" || event.code === "KeyW") {
          moveSelectedLanguage(-1);
          event.preventDefault();
          return true;
        }
        if (event.code === "Escape" || event.code === "KeyX") {
          showSaveSlots();
          event.preventDefault();
          return true;
        }
        if (event.code === "Space" || event.code === "Enter") {
          confirmLanguageSelection();
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
