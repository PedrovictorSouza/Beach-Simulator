import { GAME_FLOW } from "../../gameFlow.js";
import { DEV_SCENE } from "../runtime/runtimeFlags.js";

function hasFiniteNumberArray(value, length) {
  if (!Array.isArray(value) || value.length < length) {
    return false;
  }

  return value.slice(0, length).map(Number).every(Number.isFinite);
}

export function resolveInitialSceneIdForApplicationBoot({
  devSceneOverride = null,
  launchInitialGameFlow = GAME_FLOW.START,
  manualSavePoint = null,
  runtimeFlags = {},
  sceneWorkbench = null
} = {}) {
  const devSceneInitialGameFlow =
    devSceneOverride === DEV_SCENE.GAMEPLAY ? GAME_FLOW.GAMEPLAY :
    devSceneOverride === DEV_SCENE.INTRO ? GAME_FLOW.INTRO :
    devSceneOverride === DEV_SCENE.TUTORIAL ? GAME_FLOW.TUTORIAL :
    null;
  const shouldResumeSavedGameOnBoot =
    launchInitialGameFlow !== GAME_FLOW.START ||
    devSceneOverride === DEV_SCENE.GAMEPLAY;
  const savedGameInitialGameFlow =
    shouldResumeSavedGameOnBoot &&
    hasFiniteNumberArray(manualSavePoint?.playerPosition, 3) ?
      GAME_FLOW.GAMEPLAY :
      null;

  return devSceneInitialGameFlow ||
    savedGameInitialGameFlow ||
    (
      (runtimeFlags.skipStartScreen || runtimeFlags.introRoom) && launchInitialGameFlow === GAME_FLOW.START ?
        GAME_FLOW.INTRO :
        sceneWorkbench?.initialSceneId ||
        launchInitialGameFlow
    );
}
