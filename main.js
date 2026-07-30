import "./styles/app.css";
import { gameManager } from "./gameManager.js";
import {
  applyGamePalette,
  GAME_PALETTES,
  isGamePalette
} from "./rendering/gamePalette.js";

const LOGICAL_STAGE_WIDTH = 480;
const LOGICAL_STAGE_HEIGHT = 272;
const root = document.querySelector("#app");
const requestedPalette = new URLSearchParams(window.location.search).get("palette");
const activePalette = isGamePalette(requestedPalette) ?
  requestedPalette :
  GAME_PALETTES.MEGA_DRIVE;

function updateStageScale() {
  const scale = Math.min(
    window.innerWidth / LOGICAL_STAGE_WIDTH,
    window.innerHeight / LOGICAL_STAGE_HEIGHT
  );

  root.style.setProperty("--stage-scale", String(scale));
}

updateStageScale();
window.addEventListener("resize", updateStageScale);
applyGamePalette({ root, palette: activePalette });
gameManager.start({
  root,
  windowRef: window
});
