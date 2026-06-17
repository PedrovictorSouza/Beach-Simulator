import {
  createCameraDebugRuntime,
  isCameraDebugEnabled
} from "./cameraDebugRuntime.js";
import { createCameraZoomPresetController } from "./cameraZoomPresetController.js";
import { createFoundationBuildZoneCameraFocusRuntime } from "./foundationBuildZoneCameraFocusRuntime.js";
import { createGameplayCameraFrameRuntime } from "./gameplayCameraFrameRuntime.js";
import { createPlacementCameraAssist } from "./placementCameraAssist.js";
import { createGameplayCameraDirector } from "../gameplayCameraDirector.js";

export function createGameplayCameraRuntimeBundle({
  camera = null,
  cameraOrbit = null,
  cameraZoomPresets = [],
  controls = {},
  enabledDebug = isCameraDebugEnabled(),
  factories = {},
  gameplay = {},
  mount = null,
  session = {}
} = {}) {
  const {
    createCameraDebugRuntime: createCameraDebug = createCameraDebugRuntime,
    createCameraZoomPresetController: createCameraZoomPreset = createCameraZoomPresetController,
    createFoundationBuildZoneCameraFocusRuntime: createFoundationBuildZoneCameraFocus =
      createFoundationBuildZoneCameraFocusRuntime,
    createGameplayCameraDirector: createCameraDirector = createGameplayCameraDirector,
    createGameplayCameraFrameRuntime: createCameraFrame = createGameplayCameraFrameRuntime,
    createPlacementCameraAssist: createPlacementAssist = createPlacementCameraAssist
  } = factories;

  const gameplayCameraDirector = createCameraDirector({
    camera,
    cameraOrbit
  });
  const cameraDebugRuntime = createCameraDebug({
    enabled: enabledDebug,
    mount,
    readFrameState: ({ now }) => ({
      paused: Boolean(controls.isPaused?.()),
      gameplayCameraState: gameplayCameraDirector.getState(now),
      cameraPose: camera?.getPose?.() || null,
      systemQuestId: gameplay.getActiveSystemQuest?.()?.id || null,
      uiQuestId: gameplay.getActiveQuest?.(controls.storyState)?.id || null,
      playerPosition: session.playerCharacter?.getPosition?.() || null,
      shipVisible: session.gameplayOpeningShip?.visible,
      shipPosition: session.gameplayOpeningShip?.position
    })
  });
  cameraDebugRuntime.attachGlobalListeners?.();

  const cameraZoomPresetController = createCameraZoomPreset({
    camera,
    presets: cameraZoomPresets
  });
  const placementCameraAssist = createPlacementAssist({
    camera,
    getGameplayPreset: () => cameraZoomPresetController.getCurrentPreset?.()
  });

  function createCameraFrameRuntime({
    isGameplayFlow = () => false,
    openingRuntime = null,
    playNavigateSound = () => {},
    tutorial = null
  } = {}) {
    return createCameraFrame({
      camera,
      cameraOrbit,
      cameraZoomPresetController,
      controls,
      tutorial,
      session,
      openingRuntime,
      callbacks: {
        isGameplayFlow,
        onCycleCameraZoom: playNavigateSound
      }
    });
  }

  function createFoundationCameraFocusRuntime({
    foundationBuildZoneRuntime = null,
    getZoneSignature = () => null
  } = {}) {
    return createFoundationBuildZoneCameraFocus({
      foundationBuildZoneRuntime,
      gameplay,
      controls,
      camera,
      cameraOrbit,
      getZoneSignature
    });
  }

  return {
    cameraDebugRuntime,
    cameraZoomPresetController,
    createFoundationBuildZoneCameraFocusRuntime: createFoundationCameraFocusRuntime,
    createGameplayCameraFrameRuntime: createCameraFrameRuntime,
    gameplayCameraDirector,
    placementCameraAssist
  };
}
