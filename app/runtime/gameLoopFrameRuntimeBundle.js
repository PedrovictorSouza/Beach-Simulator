import { updateIntroRoomFrame as updateIntroRoomSequenceFrame } from "../scenes/introRoom/introRoomSequence.js";
import { PLACEMENT_CONTRACTS } from "../gameplay/contracts/placementContracts.js";
import { hasActivePlacementPreview } from "../gameplay/contracts/placementRuntime.js";
import { createGameLoopFrameRuntime } from "./gameLoopFrameRuntime.js";

export function createGameLoopFrameRuntimeBundle({
  camera,
  controls,
  frameClock,
  frameSnapshotController,
  fpsPanelController,
  gameplayOpeningRuntime,
  placementCameraAssist,
  readGameLoopFlowState,
  repairBoxMotionRuntime = {},
  rustlingGrassEventRuntime = {},
  session = {},
  updateFoundationBuildZoneCameraFocus,
  worldCanvas,
  callbacks = {},
  createFrameRuntime = createGameLoopFrameRuntime,
  isPlacementPreviewActive = hasActivePlacementPreview,
  placementContracts = PLACEMENT_CONTRACTS,
  updateIntroRoomFrame = updateIntroRoomSequenceFrame
} = {}) {
  const {
    processWorldCellPlannerClick = () => {}
  } = callbacks;

  return createFrameRuntime({
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readFlowState: readGameLoopFlowState,
    advanceElapsed: (deltaTime) => {
      repairBoxMotionRuntime.update?.(deltaTime);
    },
    gameplayOpeningRuntime,
    session,
    placement: {
      contracts: placementContracts,
      hasActivePlacementPreview: isPlacementPreviewActive
    },
    placementCameraAssist,
    updateFoundationBuildZoneCameraFocus,
    earlyFrame: {
      processWorldCellPlannerClick: () => processWorldCellPlannerClick(),
      updateIntroRoomFrame: ({ nextFrame, deltaTime }) => updateIntroRoomFrame({
        introRoomScene: session.introRoomScene,
        camera,
        worldCanvas,
        frame: nextFrame,
        deltaTime
      }),
      updateRustlingGrass: ({ deltaTime, canAdvance }) =>
        rustlingGrassEventRuntime.update?.({
          deltaTime,
          canAdvance
        })
    }
  });
}
