import { createStartScreenUniverseBackground } from "../startScreenUniverseBackground.js";
import { GAME_SHELL_DOM_IDS } from "./gameShellDomIds.js";

const GAMEPLAY_UNIVERSE_BACKGROUND_CLASS = "gameplay-universe-background";

export function mountGameShellBackground(documentRef) {
  const gameStage = documentRef.getElementById(GAME_SHELL_DOM_IDS.gameStage);
  if (!(gameStage instanceof HTMLElement)) {
    return;
  }

  if (gameStage.querySelector(`.${GAMEPLAY_UNIVERSE_BACKGROUND_CLASS}`)) {
    return;
  }

  createStartScreenUniverseBackground({
    root: gameStage,
    className: GAMEPLAY_UNIVERSE_BACKGROUND_CLASS,
    palette: "purpleBlue",
    starCount: 420
  });
}
