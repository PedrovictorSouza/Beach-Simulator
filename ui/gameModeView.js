const GAME_MODES = Object.freeze({
  LIVE: "LIVE",
  BUILD: "BUILD"
});

export function createGameModeView({ root, translator }) {
  if (!root) {
    throw new Error("GameModeView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("GameModeView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("span");
  const hintElement = documentRef.createElement("span");

  element.className = "game-mode";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  element.hidden = true;
  labelElement.className = "game-mode__label";
  hintElement.className = "game-mode__hint";
  hintElement.hidden = true;
  element.append(labelElement, hintElement);
  root.append(element);
  let currentMode = null;
  let currentHintId = "";
  let currentHintPosition = null;

  const renderMode = (mode) => {
    currentMode = mode;
    element.hidden = true;
    element.dataset.mode = mode.toLowerCase();
    labelElement.textContent = translator.t(
      mode === GAME_MODES.BUILD ? "hud.modes.build" : "hud.modes.live"
    );
    if (mode !== GAME_MODES.BUILD) {
      hintElement.hidden = true;
    }
    element.setAttribute(
      "aria-label",
      translator.t("hud.gameModeAria", { mode: labelElement.textContent })
    );
  };

  const renderHint = (messageId, position) => {
    currentHintId = messageId;
    currentHintPosition = position;
    const hasMessage = Boolean(messageId);
    const message = hasMessage ? translator.t(`hud.placement.${messageId}`) : "";

    hintElement.textContent = message;
    hintElement.hidden = !hasMessage;
    element.hidden = !hasMessage;

    const hasPosition = position &&
      Number.isFinite(position.x) &&
      Number.isFinite(position.y);
    element.classList.toggle(
      "game-mode--placement-hint",
      hasMessage && hasPosition
    );

    if (hasPosition) {
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
      element.style.right = "auto";
    } else {
      element.style.removeProperty("left");
      element.style.removeProperty("top");
      element.style.removeProperty("right");
    }
  };
  translator.subscribe(() => {
    if (currentMode) {
      renderMode(currentMode);
    }
    if (currentHintId) {
      renderHint(currentHintId, currentHintPosition);
    }
  });

  return Object.freeze({
    render(mode) {
      if (!Object.values(GAME_MODES).includes(mode)) {
        throw new Error(`Modo de jogo desconhecido: ${mode}.`);
      }

      renderMode(mode);
    },
    renderPlacementHint(messageId = "", position = null) {
      renderHint(messageId, position);
    }
  });
}
