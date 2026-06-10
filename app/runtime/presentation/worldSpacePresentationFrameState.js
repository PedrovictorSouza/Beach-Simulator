import { prepareWorldSpaceUiFrameContext } from "./worldSpaceUiFrameContext.js";
import { resolveWorldPromptFrameState } from "./worldPromptFrameState.js";
import { resolveWorldSpeechFrameState } from "./worldSpeechFrameState.js";

export function resolveWorldSpacePresentationFrameState({
  now = 0,
  gameplayOpeningCameraLocked = false,
  flowState = {},
  activeMoveId = null,
  activeQuest = null,
  activeTask = null,
  activeSystemQuest = null,
  buildBlockEquipped = false,
  controls = {},
  session = {},
  inputModalityState = null,
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  pendingPlacementPrompt = "",
  workbenchRotationPrompt = "",
  destroyableObjectPrompt = null,
  freeBlockPreviewTarget = null,
  transientNoticeRoute = null,
  playerCounterPromptText = "",
  waterGunEquipped = false,
  leafageEquipped = false,
  nearbyInteractable = null,
  chopperBulbasaurRepairBoxInvestigationTarget = null,
  repairBoxPromptDistance = Infinity,
  firstTaughtActionFreedomWindowActive = false,
  restoredGrassMissionTargetCount = 0,
  waterGunFirstUsePromptDismissed = false,
  openingLeppaTreeRequestActive = false,
  resolveWorldSpaceUiVisibility = () => false,
  shouldShowWorkbenchGreenArrowCue = () => false,
  applyWorkbenchGreenArrowCue = () => {},
  isPlayerNearWorldPosition = () => false,
  isDryGrassHydroMissionActive = () => false,
  getEncounterRepairBoxPosition = () => null,
  getLeppaTreeSurroundingGroundCells = () => [],
  getSquirtleWorldPosition = () => null,
  isSquirtleWaterCharging = () => false,
  getFreeBlockBuildCostMarker = () => null,
  getPeriodicChopperAttentionCue = () => null,
  isLeafageInvalidTargetVisible = () => false,
  isFireInvalidTargetVisible = () => false,
  isRunBreadcrumbVisible = () => false
} = {}) {
  const storyState = controls.storyState || {};
  const worldSpaceUiFrameContext = prepareWorldSpaceUiFrameContext({
    now,
    session,
    storyState,
    gameplayOpeningCameraLocked,
    flowState,
    activeQuest,
    activeTask,
    activeSystemQuest,
    resolveWorldSpaceUiVisibility,
    shouldShowWorkbenchGreenArrowCue,
    applyWorkbenchGreenArrowCue
  });
  const { canShowWorldSpaceUi, tangrowthPosition } = worldSpaceUiFrameContext;
  const worldSpeechFrameState = resolveWorldSpeechFrameState({
    canShowWorldSpaceUi,
    activeQuest,
    tangrowthPosition,
    storyState,
    session,
    chopperBulbasaurRepairBoxInvestigationTarget,
    repairBoxPromptDistance,
    isPlayerNearWorldPosition,
    openingLeppaTreeRequestActive,
    firstTaughtActionFreedomWindowActive,
    restoredGrassMissionTargetCount
  });
  const worldPromptFrameState = resolveWorldPromptFrameState({
    activeMoveId,
    activeQuest,
    activeTask,
    activeSystemQuest,
    buildBlockEquipped,
    canShowWorldSpaceUi,
    controls,
    session,
    now,
    inputModalityState,
    solarStationPlacementPreview,
    greenhousePlacementPreview,
    campfirePlacementPreview,
    leafDenKitPlacementPreview,
    pendingPlacementPrompt,
    workbenchRotationPrompt,
    destroyableObjectPrompt,
    freeBlockPreviewTarget,
    transientNoticeRoute,
    playerCounterPromptText,
    waterGunEquipped,
    leafageEquipped,
    nearbyInteractable,
    tangrowthPosition,
    repairBoxPromptDistance,
    waterGunFirstUsePromptDismissed,
    dryGrassHydroMissionActive: isDryGrassHydroMissionActive(
      activeQuest,
      storyState,
      controls.playerSkills
    ),
    openingLeppaTreeRequestActive,
    getEncounterRepairBoxPosition,
    getLeppaTreeSurroundingGroundCells,
    getSquirtleWorldPosition,
    isSquirtleWaterCharging,
    getFreeBlockBuildCostMarker,
    getPeriodicChopperAttentionCue,
    isLeafageInvalidTargetVisible,
    isFireInvalidTargetVisible,
    isRunBreadcrumbVisible
  });

  return {
    ...worldSpaceUiFrameContext,
    ...worldSpeechFrameState,
    ...worldPromptFrameState
  };
}
