import {
  resolveCameraInputPermissions,
  resolveCameraLookInput
} from "../gameLoopFramePolicies.js";
import { consumeCameraZoomCycleRequests } from "./cameraZoomPresetController.js";

export function createGameplayCameraFrameRuntime({
  camera,
  cameraOrbit,
  cameraZoomPresetController,
  controls,
  tutorial,
  session,
  openingRuntime,
  callbacks = {}
} = {}) {
  const {
    isGameplayFlow = () => false,
    onCycleCameraZoom = () => {}
  } = callbacks;

  function updateInput({
    deltaTime = 0,
    flowState = {},
    gameplayOpeningCameraLocked = false,
    foundationBuildZoneCameraFocusActive = false,
    placementPreviewActive = false,
    tutorialActive = false
  } = {}) {
    const {
      canRotateCamera,
      canCycleCameraZoom
    } = resolveCameraInputPermissions({
      hasPlayerCharacter: Boolean(session?.playerCharacter),
      gameplayOpeningCameraLocked,
      foundationBuildZoneCameraFocusActive,
      builderPanelOpen: Boolean(controls?.isBuilderPanelOpen?.()),
      placementPreviewActive,
      tutorialAllowsCameraLook: Boolean(tutorial?.allowsCameraLook?.()),
      flowState
    });

    consumeCameraZoomCycleRequests({
      consumeRequest: () => controls?.consumeCameraZoomCycleRequest?.(),
      canCycleCameraZoom,
      cameraZoomPresetController,
      onCycle: onCycleCameraZoom
    });

    const cameraLookInput = resolveCameraLookInput({
      cameraTurnKeys: controls?.cameraTurnKeys,
      cameraLookDelta: controls?.consumeCameraLookDelta?.() || { yaw: 0, pitch: 0 },
      deltaTime,
      turnSpeed: cameraOrbit?.turnSpeed || 0
    });

    if (canRotateCamera && cameraLookInput.hasInput) {
      cameraOrbit?.rotate?.(cameraLookInput.yaw, cameraLookInput.pitch);
      if (tutorialActive) {
        tutorial?.registerCameraLook?.();
      }
    } else if (!canRotateCamera) {
      controls?.clearCameraLookInput?.();
    }

    return {
      canRotateCamera,
      canCycleCameraZoom,
      cameraLookInput
    };
  }

  function updateFollow({
    now = 0,
    cinematicActive = false,
    tutorialCameraFocus = null,
    foundationBuildZoneCameraFocusActive = false,
    gameplayOpeningCameraFrame = null,
    dialogueActive = false,
    cameraTransitionActive = false,
    scriptedInteractionActive = false
  } = {}) {
    let nextGameplayOpeningCameraFrame = gameplayOpeningCameraFrame;

    if (!cinematicActive) {
      if (tutorialCameraFocus && session?.playerCharacter) {
        camera?.setPose?.({
          target: [tutorialCameraFocus[0], 1.25, tutorialCameraFocus[2]],
          direction: cameraOrbit?.getDirection?.(),
          zoom: 3.95,
          distance: 7.35
        });
      } else if (foundationBuildZoneCameraFocusActive) {
        // The focus transition was started at mission activation; hold the pose until it expires.
      } else if (isGameplayFlow() && !gameplayOpeningCameraFrame?.skipped) {
        nextGameplayOpeningCameraFrame = openingRuntime?.updateCamera?.({
          now,
          gameplayActive: true,
          canFollow: !dialogueActive && !cameraTransitionActive && !scriptedInteractionActive
        });
      } else if (
        session?.playerCharacter &&
        !dialogueActive &&
        !camera?.isTargetTransitionActive?.()
      ) {
        camera?.follow?.(session.playerCharacter.getPosition());
      }
    }

    return { gameplayOpeningCameraFrame: nextGameplayOpeningCameraFrame };
  }

  return {
    updateInput,
    updateFollow
  };
}
