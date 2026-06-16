import { updateGroundCellHighlightFrame } from "./groundCellHighlightFrame.js";
import { resolveWorldSpacePresentationFrameState } from "./worldSpacePresentationFrameState.js";
import { updateStatusPopupsFrame } from "./statusPopupsFrame.js";
import { updateWorldPromptSnapshotFrame } from "./worldPromptSnapshotFrame.js";
import { updateWorldSpeechSnapshotFrame } from "./worldSpeechSnapshotFrame.js";

function getPlayerPosition(session = {}) {
  return session.playerCharacter?.getPosition?.() || [0, 0, 0];
}

export function updateWorldSpacePresentationSnapshotFrame(nextFrame, {
  now = 0,
  activeQuest = null,
  activeMoveId = null,
  session = {},
  controls = {},
  gameplay = {},
  inputModalityState = null,
  presentationState = {},
  promptSources = {},
  groundCellHighlightState = {},
  frameBlockers = {},
  getCompanionLostHint = () => null,
  consumeChopperAttentionCueSoundCycle = () => false,
  playChopperVoice = () => {}
} = {}) {
  const playerPosition = getPlayerPosition(session);

  updateWorldSpeechSnapshotFrame(nextFrame, {
    ...presentationState,
    now,
    activeQuest,
    activeMoveId,
    bulbasaurPosition: session.bulbasaurEncounter?.position || null,
    charmanderPosition: session.charmanderEncounter?.position || null,
    tangrowthOpeningLine: gameplay.tangrowthOpeningLine,
    charmanderFollowing: controls.storyState?.flags?.charmanderFollowing,
    getCompanionLostHint,
    consumeChopperAttentionCueSoundCycle,
    playChopperVoice
  });

  updateWorldPromptSnapshotFrame(nextFrame, {
    ...promptSources,
    ...presentationState,
    inputModalityState,
    playerPosition
  });

  updateGroundCellHighlightFrame(nextFrame, groundCellHighlightState);

  updateStatusPopupsFrame(nextFrame, {
    ...frameBlockers,
    nearbyDryGrassHintTarget: presentationState.nearbyDryGrassHintTarget,
    questCompletionPop: gameplay.getQuestCompletionPop?.(),
    hasPlayerCharacter: Boolean(session.playerCharacter),
    getPlayerPosition: () => session.playerCharacter.getPosition()
  });
}

export function createWorldSpacePresentationFrameRuntime({
  controls = {},
  session = {},
  gameplay = {},
  repairBoxPromptDistance = Infinity,
  restoredGrassMissionTargetCount = 0,
  waterGunFirstUsePromptFlag = "",
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
  isRunBreadcrumbVisible = () => false,
  getCompanionLostHint = () => null,
  consumeChopperAttentionCueSoundCycle = () => false,
  playChopperVoice = () => {}
} = {}) {
  function update({
    nextFrame,
    now = 0,
    gameplayOpeningCameraLocked = false,
    flowState = {},
    activeMoveId = null,
    activeQuest = null,
    activeTask = null,
    activeSystemQuest = null,
    equipmentState = {},
    inputModalityState = null,
    placementPreviews = {},
    promptState = {},
    freeBlockPreviewTarget = null,
    nearbyInteractable = null,
    chopperBulbasaurRepairBoxInvestigationTarget = null,
    firstTaughtActionFreedomWindowActive = false,
    promptSources = {},
    groundCellHighlightState = {},
    frameBlockers = {}
  } = {}) {
    const {
      solarStationPlacementPreview = null,
      greenhousePlacementPreview = null,
      campfirePlacementPreview = null,
      leafDenKitPlacementPreview = null
    } = placementPreviews;
    const {
      buildBlockEquipped = false,
      waterGunEquipped = false,
      leafageEquipped = false
    } = equipmentState;
    const {
      pendingPlacementPrompt = "",
      workbenchRotationPrompt = "",
      destroyableObjectPrompt = null,
      transientNoticeRoute = null,
      playerCounterPromptText = ""
    } = promptState;

    const presentationState = resolveWorldSpacePresentationFrameState({
      now,
      gameplayOpeningCameraLocked,
      flowState,
      activeMoveId,
      activeQuest,
      activeTask,
      activeSystemQuest,
      buildBlockEquipped,
      controls,
      session,
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
      chopperBulbasaurRepairBoxInvestigationTarget,
      repairBoxPromptDistance,
      firstTaughtActionFreedomWindowActive,
      restoredGrassMissionTargetCount,
      waterGunFirstUsePromptDismissed:
        Boolean(controls.storyState?.flags?.[waterGunFirstUsePromptFlag]),
      openingLeppaTreeRequestActive: promptState.openingLeppaTreeRequestActive || false,
      resolveWorldSpaceUiVisibility,
      shouldShowWorkbenchGreenArrowCue,
      applyWorkbenchGreenArrowCue,
      isPlayerNearWorldPosition,
      isDryGrassHydroMissionActive,
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

    updateWorldSpacePresentationSnapshotFrame(nextFrame, {
      now,
      activeQuest,
      activeMoveId,
      session,
      controls,
      gameplay,
      inputModalityState,
      presentationState,
      promptSources: {
        solarStationPlacementPreview,
        greenhousePlacementPreview,
        campfirePlacementPreview,
        leafDenKitPlacementPreview,
        ...promptSources,
        workbenchRotationPrompt,
        destroyableObjectPrompt,
        transientNoticeRoute,
        playerCounterPromptText,
        leafageEquipped
      },
      groundCellHighlightState,
      frameBlockers,
      getCompanionLostHint,
      consumeChopperAttentionCueSoundCycle,
      playChopperVoice
    });

    return {
      presentationState,
      canShowWorldSpaceUi: presentationState.canShowWorldSpaceUi
    };
  }

  return {
    update
  };
}
