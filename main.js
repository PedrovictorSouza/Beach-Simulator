import "./styles/app.css";
import { gameManager, LANGUAGE_STORAGE_KEY } from "./gameManager.js";
import { RUN_RESULT_STORAGE_KEY } from "./run/runResultStorage.js";
import {
  createPlaygamaPlatformGateway
} from "./platform/playgamaPlatformGateway.js";
import {
  createPlatformBackedStorage
} from "./platform/platformBackedStorage.js";
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
const platformGateway = createPlaygamaPlatformGateway({ windowRef: window });
let localStorageRef = null;

try {
  localStorageRef = window.localStorage;
} catch {
  localStorageRef = null;
}

const platformStorage = createPlatformBackedStorage({
  localStorage: localStorageRef,
  platformGateway
});

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

async function bootstrap() {
  const platform = await platformGateway.initialize();

  await platformStorage.hydrate([
    LANGUAGE_STORAGE_KEY,
    RUN_RESULT_STORAGE_KEY
  ]);
  gameManager.start({
    root,
    windowRef: window,
    platformGateway,
    storage: platformStorage,
    initialLocale: platformStorage.getItem(LANGUAGE_STORAGE_KEY) ||
      platform.language
  });
}

void bootstrap();
