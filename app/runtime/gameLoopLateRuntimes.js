import {
  createGameLoopConstructionBuildRuntimeBundle
} from "./gameLoopConstructionBuild.js";
import { createGameLoopFieldMoveImpactRuntime } from "./gameLoopFieldMoveImpact.js";
import { createGameLoopPlayerActionRuntimeBundle } from "./gameLoopPlayerAction.js";
import {
  createGameLoopPresentationSnapshotFrameRuntime
} from "./gameLoopPresentationSnapshot.js";

export function createGameLoopLateRuntimeBundle({
  audio,
  clamp01,
  controls,
  gameplay,
  gameplayRenderSnapshotFrameRuntime,
  hud,
  rendering,
  session,
  callbacks = {},
  config = {},
  runtimes = {},
  createConstructionBuildRuntime =
    createGameLoopConstructionBuildRuntimeBundle,
  createFieldMoveImpactRuntime = createGameLoopFieldMoveImpactRuntime,
  createPlayerActionRuntime = createGameLoopPlayerActionRuntimeBundle,
  createPresentationSnapshotRuntime =
    createGameLoopPresentationSnapshotFrameRuntime
} = {}) {
  const {
    createFoundationBuildZoneCameraFocusRuntime,
    debugInteractionFlow,
    getCurrentInputModalityState,
    getNowMs,
    getNowSeconds,
    getTerrainColliders,
    getWorldCellPlannerSelectedGroundCell,
    playInstanceObjectSfx,
    playSoundEvent,
    playTreeBirthSfx,
    queueChangedSupplyPickupFlyItems
  } = callbacks;
  const {
    restoredGrassMissionTargetCount,
    waterGunFirstUsePromptFlag
  } = config;
  const {
    buildBlockRuntime,
    bulbasaurWorkbenchGuideRuntime,
    companionAbilityResourcesRuntime,
    companionConstructionBlockerRuntime,
    constructionPlacementControlRuntime,
    fieldMoveInvalidTargetPromptRuntime,
    fireRuntime,
    freeBlockBuildSessionRuntime,
    leafageRuntime,
    leafDenConstructionPresentationRuntime,
    landscapeCutEffectRuntime,
    npcConversationFocusRuntime,
    playerCounterPromptRuntime,
    playerModelRuntime,
    solarStationPowerRadiusRuntime,
    supplyCounterPromptController,
    treeRevivalLeafBurstFrameRuntime,
    waterGunRuntime,
    waterGunSfxBurstRuntime,
    workbenchRotationRuntime,
    worldObjectPlacementBlockerRuntime
  } = runtimes;

  const constructionBuildRuntimeBundle = createConstructionBuildRuntime({
    audio,
    clamp01,
    controls,
    hud,
    rendering,
    session,
    runtimes: {
      companionConstructionBlockerRuntime,
      freeBlockBuildSessionRuntime,
      playerModelRuntime,
      worldObjectPlacementBlockerRuntime
    },
    callbacks: {
      createFoundationBuildZoneCameraFocusRuntime,
      getTerrainColliders,
      playPlacedSound: playInstanceObjectSfx,
      playSoundEvent
    }
  });
  const {
    groundActionFeedbackRuntime,
    foundationBuildZoneCameraFocusRuntime,
    foundationBuildZoneRuntime,
    freeBlockBuildRuntime
  } = constructionBuildRuntimeBundle;

  const playerActionRuntimeBundle = createPlayerActionRuntime({
    controls,
    session,
    gameplay,
    hud,
    runtimes: {
      buildBlockRuntime,
      bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime,
      constructionPlacementControlRuntime,
      fieldMoveInvalidTargetPromptRuntime,
      fireRuntime,
      freeBlockBuildRuntime,
      groundActionFeedbackRuntime,
      leafageRuntime,
      playerCounterPromptRuntime,
      supplyCounterPromptController,
      waterGunRuntime,
      waterGunSfxBurstRuntime,
      workbenchRotationRuntime
    },
    callbacks: {
      debugInteractionFlow,
      getNowMs,
      getNowSeconds,
      isBusyCompanionTarget:
        leafDenConstructionPresentationRuntime.isBusyCompanionTarget,
      onNpcInteractionStart: npcConversationFocusRuntime.handleInteractionStart,
      playSoundEvent,
      playTreeBirthSfx,
      queueChangedSupplyPickupFlyItems,
      queueLandscapeCutEffect: (patch) => landscapeCutEffectRuntime.queue(patch),
      queueTreeRevivalLeafBurst: (snapshot) =>
        treeRevivalLeafBurstFrameRuntime.queueForNewlyRevivedTrees(snapshot)
    },
    config: {
      restoredGrassMissionTargetCount,
      waterGunFirstUsePromptFlag
    }
  });

  const gameplayPresentationSnapshotFrameRuntime =
    createPresentationSnapshotRuntime({
      controls,
      session,
      gameplay,
      gameplayRenderSnapshotFrameRuntime,
      input: {
        getCurrentInputModalityState
      },
      runtimes: {
        foundationBuildZoneRuntime,
        groundActionFeedbackRuntime,
        playerCounterPromptRuntime,
        solarStationPowerRadiusRuntime,
        waterGunRuntime,
        workbenchRotationRuntime
      },
      targetResolvers: {
        getWorldCellPlannerSelectedGroundCell
      },
      debug: debugInteractionFlow
    });

  const fieldMoveImpactRuntime = createFieldMoveImpactRuntime({
    session,
    controls,
    hud,
    runtimes: {
      companionAbilityResourcesRuntime,
      groundActionFeedbackRuntime,
      playerActionRuntime: playerActionRuntimeBundle.playerActionRuntime,
      supplyCounterPromptController
    },
    callbacks: {
      getNowMs,
      playInstanceObjectSfx
    }
  });

  return {
    ...constructionBuildRuntimeBundle,
    ...playerActionRuntimeBundle,
    fieldMoveImpactRuntime,
    gameplayPresentationSnapshotFrameRuntime
  };
}
