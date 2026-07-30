import "./styles/app.css";
import { gameManager } from "./gameManager.js";
import {
  applyGamePalette,
  GAME_PALETTES,
  isGamePalette
} from "./rendering/gamePalette.js";

const root = document.querySelector("#app");
const requestedPalette = new URLSearchParams(window.location.search).get("palette");
const activePalette = isGamePalette(requestedPalette) ?
  requestedPalette :
  GAME_PALETTES.MEGA_DRIVE;

applyGamePalette({ root, palette: activePalette });
gameManager.start({
  root,
  windowRef: window
});
