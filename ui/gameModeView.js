const GAME_MODES = Object.freeze({
  LIVE: "LIVE",
  BUILD: "BUILD"
});

export function createGameModeView({ root }) {
  if (!root) {
    throw new Error("GameModeView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");

  element.className = "game-mode";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  element.hidden = true;
  root.append(element);

  return Object.freeze({
    render(mode) {
      if (!Object.values(GAME_MODES).includes(mode)) {
        throw new Error(`Modo de jogo desconhecido: ${mode}.`);
      }

      element.hidden = false;
      element.dataset.mode = mode.toLowerCase();
      element.textContent = mode;
      element.setAttribute("aria-label", `Game mode: ${mode}`);
    }
  });
}
