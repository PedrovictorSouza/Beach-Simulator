import { GAME_SHELL_DOM_IDS } from "./gameShellDomIds.js";
import { mountGameShellBackground } from "./gameShellBackground.js";
import { GAME_SHELL_HTML } from "./gameShellMarkup.js";
import { resolveGameShellElements } from "./resolveGameShellElements.js";

function getOrCreateMain(documentRef) {
  const existingMain = documentRef.querySelector("main");

  if (existingMain) {
    return existingMain;
  }

  const main = documentRef.createElement("main");
  documentRef.body.appendChild(main);
  return main;
}

function mountGameShell(documentRef) {
  const main = getOrCreateMain(documentRef);

  if (!documentRef.getElementById(GAME_SHELL_DOM_IDS.gameStage)) {
    main.innerHTML = GAME_SHELL_HTML;
  }
}

export function createGameShell({ documentRef = document } = {}) {
  mountGameShell(documentRef);
  mountGameShellBackground(documentRef);
  return resolveGameShellElements(documentRef);
}
