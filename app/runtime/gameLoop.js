export {
  resolveConstructionDisplacementPosition,
  resolveTimburrBuildBlockApproachPosition
} from "./fieldMoveRuntime/buildBlockRuntime.js";
export {
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "./companions/companionFollowMotion.js";
import { createGameLoopRuntimeGraph } from "./gameLoopRuntimeGraph.js";
import {
  createGameLoopFramePipeline
} from "./gameLoopFramePipeline.js";

export {
  getWorkbenchInteractionParticleBillboards
} from "./interactionInfoBillboards.js";

export {
  applyTrainHouseDance,
  shouldCompleteThermalCabinHomeBeat
} from "./trainHouseDance.js";

export {
  resolveTrainHouseMusicVolume
} from "./audio/trainHouseMusicRuntime.js";

export {
  applyWorkbenchGreenArrowCue,
  shouldShowWorkbenchGreenArrowCue
} from "./workbenchCueRuntime.js";

export {
  cancelPendingWorkbenchPlacementIntent,
  hasPendingWorkbenchPlacementIntent
} from "./construction/pendingPlacementIntent.js";

export {
  addUniqueMissionTargetPosition,
  addUniqueMissionTargetPositions,
  isMissionTargetPosition,
  normalizeMissionTargetPositions
} from "./missionTargetPositionUtils.js";

export {
  resolveMissionTargetAliasId,
  resolveMissionTargetIdsFromMissionCopy
} from "./missionTargetResolver.js";

export {
  formatBuildBlockDebugLines,
  resolveBuildBlockPreviewValidity,
  shouldTimburrBuildBlockCastFromBlockedApproach
} from "./buildBlockDebugOverlay.js";

export function startGameLoop({
  camera,
  mount,
  fpsPanel = null,
  inputModalityPanel = null,
  worldCanvas,
  worldRenderer,
  worldSpeech,
  colliderGizmos,
  groundCellHighlight,
  gameplayDialogue,
  dialogueCamera,
  gameFlowValues,
  isGameFlow,
  actTwoSequence,
  actTwoTutorial,
  session,
  pokedexUiState,
  controls,
  cameraOrbit,
  cameraZoomPresets = [],
  gameplay,
  hud,
  gameplayUiVisibility = null,
  rendering
}) {
  const {
    companionFrameRuntime,
    constructionPlacementFrameRuntime,
    frameRuntime,
    gameplayCameraFrameRuntime,
    gameplayInputFrameRuntime,
    gameplayOpeningPresentationFrameRuntime,
    gameplayPresentationSnapshotFrameRuntime,
    naturePresentationFrameRuntime,
    playSoundEvent,
    playerActionFrameRuntime,
    playerMovementFrameRuntime,
    playerResourceCollectionFrameRuntime,
    worldCellPlannerInteractionRuntime,
    worldSceneSyncRuntime
  } = createGameLoopRuntimeGraph({
    actTwoTutorial,
    camera,
    cameraOrbit,
    cameraZoomPresets,
    colliderGizmos,
    controls,
    dialogueCamera,
    fpsPanel,
    gameFlowValues,
    gameplay,
    gameplayDialogue,
    gameplayUiVisibility,
    groundCellHighlight,
    hud,
    inputModalityPanel,
    isGameFlow,
    mount,
    pokedexUiState,
    rendering,
    session,
    worldCanvas,
    worldRenderer,
    worldSpeech
  });

  mount?.addEventListener?.(
    "pointerdown",
    worldCellPlannerInteractionRuntime.handlePointerDown,
    { capture: true }
  );

  const frame = createGameLoopFramePipeline({
    actTwoSequence,
    actTwoTutorial,
    companionFrameRuntime,
    constructionPlacementFrameRuntime,
    controls,
    frameRuntime,
    gameFlowValues,
    gameplayCameraFrameRuntime,
    gameplayInputFrameRuntime,
    gameplayOpeningPresentationFrameRuntime,
    gameplayPresentationSnapshotFrameRuntime,
    hud,
    isGameFlow,
    naturePresentationFrameRuntime,
    playSoundEvent,
    playerActionFrameRuntime,
    playerMovementFrameRuntime,
    playerResourceCollectionFrameRuntime,
    session,
    worldSceneSyncRuntime
  });

  requestAnimationFrame(frame);
}
