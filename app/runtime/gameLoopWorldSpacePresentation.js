import { isDryGrassHydroMissionActive } from "./fieldMoveRuntime/fieldMoveGroundTargets.js";
import { resolveWorldSpaceUiVisibility } from "./gameLoopFramePolicies.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import {
  createWorldSpacePresentationFrameRuntime
} from "./presentation/worldSpacePresentationSnapshotFrame.js";
import {
  applyWorkbenchGreenArrowCue,
  shouldShowWorkbenchGreenArrowCue
} from "./workbenchCueRuntime.js";

const REPAIR_BOX_PROMPT_DISTANCE = 2.8;

export function createGameLoopWorldSpacePresentationFrameRuntime({
  controls,
  session,
  gameplay,
  runtimes = {},
  callbacks = {},
  config = {},
  createRuntime = createWorldSpacePresentationFrameRuntime
} = {}) {
  const {
    companionAbilityResourcesRuntime,
    companionWorldSpeechCueRuntime,
    constructionPlacementControlRuntime,
    fieldMoveActorPositionRuntime,
    fieldMoveInvalidTargetPromptRuntime,
    runBreadcrumbPromptRuntime,
    worldSceneSyncRuntime
  } = runtimes;
  const {
    getEncounterRepairBoxPosition,
    getLeppaTreeSurroundingGroundCells,
    playSoundEvent
  } = callbacks;

  return createRuntime({
    controls,
    session,
    gameplay,
    repairBoxPromptDistance: REPAIR_BOX_PROMPT_DISTANCE,
    restoredGrassMissionTargetCount: config.restoredGrassMissionTargetCount,
    waterGunFirstUsePromptFlag: config.waterGunFirstUsePromptFlag,
    resolveWorldSpaceUiVisibility,
    shouldShowWorkbenchGreenArrowCue,
    applyWorkbenchGreenArrowCue,
    isPlayerNearWorldPosition: worldSceneSyncRuntime.isPlayerNearWorldPosition,
    isDryGrassHydroMissionActive,
    getEncounterRepairBoxPosition,
    getLeppaTreeSurroundingGroundCells,
    getSquirtleWorldPosition: fieldMoveActorPositionRuntime.getSquirtleWorldPosition,
    isSquirtleWaterCharging: () => companionAbilityResourcesRuntime.isSquirtleWaterCharging(),
    getFreeBlockBuildCostMarker: (...args) =>
      constructionPlacementControlRuntime.getFreeBlockBuildCostMarker(...args),
    getPeriodicChopperAttentionCue: (...args) =>
      companionWorldSpeechCueRuntime.getChopperAttentionCue(...args),
    isLeafageInvalidTargetVisible: (frameNow) =>
      fieldMoveInvalidTargetPromptRuntime.isLeafageVisible(frameNow),
    isFireInvalidTargetVisible: (frameNow) =>
      fieldMoveInvalidTargetPromptRuntime.isFireVisible(frameNow),
    isRunBreadcrumbVisible: (frameNow) =>
      runBreadcrumbPromptRuntime.isVisible(frameNow),
    getCompanionLostHint: (...args) =>
      companionWorldSpeechCueRuntime.getCompanionLostHint(...args),
    consumeChopperAttentionCueSoundCycle: (...args) =>
      companionWorldSpeechCueRuntime.consumeChopperAttentionCueSoundCycle(...args),
    playChopperVoice: () => playSoundEvent(SOUND_EVENT_IDS.CHOPPER_VOICE)
  });
}
