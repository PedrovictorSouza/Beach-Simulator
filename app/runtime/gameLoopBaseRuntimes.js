import { createGameplayAudioRuntimeBundle } from "./audio/gameplayAudioRuntimeBundle.js";
import { createGameplayCameraRuntimeBundle } from "./camera/gameplayCameraRuntimeBundle.js";
import { createGameplayCompanionFacingRuntime } from "./companions/companionFacingRuntime.js";
import { createGameplayFreeBlockBuildSessionRuntime } from "./construction/freeBlockBuildSessionRuntime.js";
import { createGameLoopAudioCallbacks } from "./gameLoopAudioCallbacks.js";
import { createGameLoopFrameClock } from "./gameLoopFrameClock.js";
import { createMovementQuestRuntime } from "./movementQuestRuntime.js";

function getInitialFrameClockNow() {
  return typeof performance !== "undefined" &&
    typeof performance.now === "function" ?
      performance.now() :
      Date.now();
}

export function createGameLoopBaseRuntimeBundle({
  camera,
  cameraOrbit,
  cameraZoomPresets = [],
  controls,
  gameplay,
  mount,
  session,
  initialNow = getInitialFrameClockNow(),
  createAudioCallbacks = createGameLoopAudioCallbacks,
  createAudioRuntimeBundle = createGameplayAudioRuntimeBundle,
  createCameraRuntimeBundle = createGameplayCameraRuntimeBundle,
  createCompanionFacingRuntime = createGameplayCompanionFacingRuntime,
  createFrameClock = createGameLoopFrameClock,
  createFreeBlockBuildSessionRuntime =
    createGameplayFreeBlockBuildSessionRuntime,
  createMovementQuest = createMovementQuestRuntime
} = {}) {
  const frameClock = createFrameClock({
    now: initialNow,
    maxDeltaTime: 0.033
  });
  const cameraRuntimeBundle = createCameraRuntimeBundle({
    camera,
    cameraOrbit,
    cameraZoomPresets,
    controls,
    gameplay,
    mount,
    session
  });
  const audioRuntimeBundle = createAudioRuntimeBundle({
    controls,
    gameplay,
    session
  });
  const audioCallbacks = createAudioCallbacks(audioRuntimeBundle.audio);
  const freeBlockBuildSessionRuntime = createFreeBlockBuildSessionRuntime({
    session
  });
  const movementQuestRuntime = createMovementQuest({
    minimumMovementDistance: 0.0005,
    reportDistance: 0.04
  });
  const companionFacingRuntime = createCompanionFacingRuntime({ session });

  return {
    frameClock,
    ...cameraRuntimeBundle,
    ...audioRuntimeBundle,
    ...audioCallbacks,
    companionFacingRuntime,
    freeBlockBuildSessionRuntime,
    movementQuestRuntime
  };
}
