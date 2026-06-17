import { createConstructionHelperMotionRuntime } from "./constructionHelperMotion.js";
import { createConstructionHouseModelInstanceRuntime } from "./constructionHouseModelInstances.js";
import { createLeafDenConstructionPresentationRuntime } from "./leafDenConstructionPresentationRuntime.js";

const DEFAULT_PLAYER_CONSTRUCTION_MODEL_PREPARE_DISTANCE = 58;

export function createConstructionPresentationRuntimeBundle({
  controls = {},
  session = {},
  workbenchRotationRuntime = null,
  callbacks = {},
  config = {},
  getNowMs = () => Date.now(),
  getNowSeconds = () => 0
} = {}) {
  const constructionHouseModelInstanceRuntime = createConstructionHouseModelInstanceRuntime({
    session,
    getStoryState: () => controls.storyState,
    getNowSeconds,
    getSelectedRotationKind: () => workbenchRotationRuntime?.getSelection?.()?.kind,
    prepareDistance:
      config.playerConstructionModelPrepareDistance ??
      DEFAULT_PLAYER_CONSTRUCTION_MODEL_PREPARE_DISTANCE,
    getWorkbenchRotationPreviewYaw: workbenchRotationRuntime?.getPreviewYaw,
    isWorldPositionWithinRenderDistance: callbacks.isWorldPositionWithinRenderDistance,
    applyTrainHouseDance: callbacks.applyTrainHouseDance,
    applyPlacementSpawn: callbacks.applyPlacementSpawn,
    applyRotationTint: workbenchRotationRuntime?.applySelectionTint
  });
  const leafDenConstructionPresentationRuntime = createLeafDenConstructionPresentationRuntime({
    session,
    getStoryState: () => controls.storyState,
    getNowMs,
    getNowSeconds
  });
  const constructionHelperMotionRuntime = createConstructionHelperMotionRuntime({
    getLeafDenPosition: () => session.leafDen?.position,
    getNowSeconds,
    getYawToward: callbacks.getRobotModelYawToward
  });

  return {
    constructionHelperMotionRuntime,
    constructionHouseModelInstanceRuntime,
    leafDenConstructionPresentationRuntime
  };
}
