import {
  BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT
} from "./fieldMoveRuntime/fieldMoveGroundTargets.js";
import { createGameLoopActorFrameRuntimeBundle } from "./gameLoopActorFrameRuntimes.js";
import { createGameLoopFieldPresentationRuntimeBundle } from "./gameLoopFieldPresentationRuntimes.js";
import { createGameLoopFrameEntryRuntimeBundle } from "./gameLoopFrameEntryRuntimes.js";
import {
  createGameLoopInteractionPresentationRuntimeBundle
} from "./gameLoopInteractionPresentationRuntimes.js";
import { createGameLoopLateRuntimeBundle } from "./gameLoopLateRuntimes.js";
import { createGameLoopStartupRuntimeBundle } from "./gameLoopStartupRuntimes.js";
import { debugInteractionFlow } from "./interactionFlowDebug.js";
import {
  clamp01,
  easeOutCubic,
  lerp,
  moveValueToward,
  rotateAngleToward
} from "./gameLoopMath.js";
import {
  getRuntimeNowMs,
  getRuntimeNowSeconds
} from "./runtimeNow.js";

const WATER_GUN_FIRST_USE_PROMPT_FLAG = "waterGunFirstUsePromptDismissed";

export function createGameLoopRuntimeGraph({
  actTwoTutorial,
  camera,
  cameraOrbit,
  cameraZoomPresets = [],
  colliderGizmos,
  controls,
  dialogueCamera,
  fpsPanel = null,
  gameFlowValues,
  gameplay,
  gameplayDialogue,
  gameplayUiVisibility = null,
  groundCellHighlight,
  hud,
  inputModalityPanel = null,
  isGameFlow,
  mount,
  pokedexUiState,
  rendering,
  session,
  worldCanvas,
  worldRenderer,
  worldSpeech,
  createActorFrameRuntime = createGameLoopActorFrameRuntimeBundle,
  createFieldPresentationRuntime =
    createGameLoopFieldPresentationRuntimeBundle,
  createFrameEntryRuntime = createGameLoopFrameEntryRuntimeBundle,
  createInteractionPresentationRuntime =
    createGameLoopInteractionPresentationRuntimeBundle,
  createLateRuntime = createGameLoopLateRuntimeBundle,
  createStartupRuntime = createGameLoopStartupRuntimeBundle
} = {}) {
  let fieldMoveImpactRuntime = null;
  let foundationBuildZoneCameraFocusRuntime = null;
  let foundationBuildZoneRuntime = null;
  let freeBlockBuildRuntime = null;
  let gameplayInputRuntime = null;
  let snowstormFogRuntime = null;
  let waterGunRuntime = null;
  let playStartupSoundEvent = () => {};

  const startupRuntimeBundle = createStartupRuntime({
    camera,
    cameraOrbit,
    cameraZoomPresets,
    controls,
    gameplay,
    hud,
    mount,
    rendering,
    session,
    worldCanvas,
    callbacks: {
      getFoundationBuildZoneCameraFocusRuntime: () =>
        foundationBuildZoneCameraFocusRuntime,
      getGameplayInputRuntime: () => gameplayInputRuntime,
      getNowMs: getRuntimeNowMs,
      getSnowstormFogRuntime: () => snowstormFogRuntime,
      getWaterGunRuntime: () => waterGunRuntime,
      playSoundEvent: (...args) => playStartupSoundEvent(...args)
    },
    math: {
      clamp01,
      easeOutCubic,
      lerp
    }
  });
  playStartupSoundEvent = startupRuntimeBundle.playSoundEvent;
  const interactionPresentationRuntimeBundle =
    createInteractionPresentationRuntime({
      actTwoTutorial,
      camera,
      clamp01,
      colliderGizmos,
      companionConstructionBlockerRuntime:
        startupRuntimeBundle.companionConstructionBlockerRuntime,
      companionFacingRuntime: startupRuntimeBundle.companionFacingRuntime,
      controls,
      dialogueCamera,
      fpsPanel,
      gameplayDialogue,
      groundCellHighlight,
      hud,
      inputModalityPanel,
      mount,
      rendering,
      session,
      worldCanvas,
      worldRenderer,
      worldSceneSyncRuntime: startupRuntimeBundle.worldSceneSyncRuntime,
      worldSpeech,
      callbacks: {
        getCurrentInputModalityState:
          startupRuntimeBundle.getCurrentInputModalityState,
        getNowMs: getRuntimeNowMs,
        getNowSeconds: getRuntimeNowSeconds,
        getWaterGunRuntime: () => waterGunRuntime,
        playGrowBotRevealSfx: startupRuntimeBundle.playGrowBotRevealSfx,
        playSoundEvent: startupRuntimeBundle.playSoundEvent,
        startNextQueuedSquirtleWaterGunAction:
          startupRuntimeBundle.startNextQueuedSquirtleWaterGunAction
      },
      math: {
        easeOutCubic,
        lerp,
        moveValueToward
      }
    });
  snowstormFogRuntime = interactionPresentationRuntimeBundle.snowstormFogRuntime;

  const foundationBuildZoneRuntimeProxy = {
    getBuildZoneCenterPosition: (...args) =>
      foundationBuildZoneRuntime?.getBuildZoneCenterPosition?.(...args)
  };
  const freeBlockBuildRuntimeProxy = {
    getController: (...args) => freeBlockBuildRuntime?.getController?.(...args),
    syncPreview: (...args) => freeBlockBuildRuntime?.syncPreview?.(...args)
  };

  const fieldPresentationRuntimeBundle = createFieldPresentationRuntime({
    camera,
    clamp01,
    controls,
    gameFlowValues,
    gameplay,
    hud,
    rendering,
    session,
    worldCanvas,
    callbacks: {
      getFieldMoveImpactRuntime: () => fieldMoveImpactRuntime,
      getFreeBlockBuildRuntime: () => freeBlockBuildRuntime,
      playSoundEvent: startupRuntimeBundle.playSoundEvent
    },
    config: {
      restoredGrassMissionTargetCount:
        BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
      waterGunFirstUsePromptFlag: WATER_GUN_FIRST_USE_PROMPT_FLAG
    },
    construction: {
      foundationBuildZoneRuntime: foundationBuildZoneRuntimeProxy,
      freeBlockBuildRuntime: freeBlockBuildRuntimeProxy
    },
    runtimes: {
      buildBlockDebugOverlay:
        interactionPresentationRuntimeBundle.buildBlockDebugOverlay,
      bulbasaurWorkbenchGuideRuntime:
        interactionPresentationRuntimeBundle.bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime:
        interactionPresentationRuntimeBundle.companionAbilityResourcesRuntime,
      companionConstructionBlockerRuntime:
        startupRuntimeBundle.companionConstructionBlockerRuntime,
      companionFacingRuntime: startupRuntimeBundle.companionFacingRuntime,
      companionModelSyncRuntime:
        interactionPresentationRuntimeBundle.companionModelSyncRuntime,
      companionRenderFrameRuntime:
        interactionPresentationRuntimeBundle.companionRenderFrameRuntime,
      companionRepairBoxModelRuntime:
        interactionPresentationRuntimeBundle.companionRepairBoxModelRuntime,
      companionWorldSpeechCueRuntime:
        interactionPresentationRuntimeBundle.companionWorldSpeechCueRuntime,
      constructionHouseModelInstanceRuntime:
        interactionPresentationRuntimeBundle.constructionHouseModelInstanceRuntime,
      fieldMoveActorPositionRuntime:
        interactionPresentationRuntimeBundle.fieldMoveActorPositionRuntime,
      fieldMoveApproachPositionRuntime:
        interactionPresentationRuntimeBundle.fieldMoveApproachPositionRuntime,
      fieldMoveInvalidTargetPromptRuntime:
        interactionPresentationRuntimeBundle.fieldMoveInvalidTargetPromptRuntime,
      leafDenConstructionPresentationRuntime:
        interactionPresentationRuntimeBundle.leafDenConstructionPresentationRuntime,
      naturePresentationFrameRuntime:
        startupRuntimeBundle.naturePresentationFrameRuntime,
      runBreadcrumbPromptRuntime:
        interactionPresentationRuntimeBundle.runBreadcrumbPromptRuntime,
      solarStationPlacementBlockerRuntime:
        startupRuntimeBundle.solarStationPlacementBlockerRuntime,
      squirtleReassemblyRuntime:
        interactionPresentationRuntimeBundle.squirtleReassemblyRuntime,
      treeRevivalLeafBurstFrameRuntime:
        startupRuntimeBundle.treeRevivalLeafBurstFrameRuntime,
      workbenchRotationRuntime:
        interactionPresentationRuntimeBundle.workbenchRotationRuntime,
      worldSceneSyncRuntime: startupRuntimeBundle.worldSceneSyncRuntime
    }
  });
  waterGunRuntime = fieldPresentationRuntimeBundle.waterGunRuntime;

  const actorFrameRuntimeBundle = createActorFrameRuntime({
    audio: startupRuntimeBundle.audio,
    camera,
    cameraOrbit,
    cameraZoomPresetController:
      startupRuntimeBundle.cameraZoomPresetController,
    controls,
    gameFlowValues,
    gameplay,
    gameplayDialogue,
    hud,
    isGameFlow,
    rendering,
    session,
    runtimes: {
      beeFieldRuntime: interactionPresentationRuntimeBundle.beeFieldRuntime,
      buildBlockRuntime: fieldPresentationRuntimeBundle.buildBlockRuntime,
      bulbasaurWorkbenchGuideRuntime:
        interactionPresentationRuntimeBundle.bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime:
        interactionPresentationRuntimeBundle.companionAbilityResourcesRuntime,
      companionFollowDirectionRuntime:
        interactionPresentationRuntimeBundle.companionFollowDirectionRuntime,
      companionFollowMovementRuntime:
        interactionPresentationRuntimeBundle.companionFollowMovementRuntime,
      companionGroundPatrolFrameRuntime:
        interactionPresentationRuntimeBundle.companionGroundPatrolFrameRuntime,
      companionIdleMotionRuntime:
        interactionPresentationRuntimeBundle.companionIdleMotionRuntime,
      companionModelSyncRuntime:
        interactionPresentationRuntimeBundle.companionModelSyncRuntime,
      companionRepairBoxModelRuntime:
        interactionPresentationRuntimeBundle.companionRepairBoxModelRuntime,
      constructionHelperMotionRuntime:
        interactionPresentationRuntimeBundle.constructionHelperMotionRuntime,
      fireRuntime: fieldPresentationRuntimeBundle.fireRuntime,
      gearPickupParticleRuntime: startupRuntimeBundle.gearPickupParticleRuntime,
      leafageRuntime: fieldPresentationRuntimeBundle.leafageRuntime,
      leafDenConstructionPresentationRuntime:
        interactionPresentationRuntimeBundle.leafDenConstructionPresentationRuntime,
      movementQuestRuntime: startupRuntimeBundle.movementQuestRuntime,
      repairBoxRevealOpeningRuntime:
        interactionPresentationRuntimeBundle.repairBoxRevealOpeningRuntime,
      runBreadcrumbPromptRuntime:
        interactionPresentationRuntimeBundle.runBreadcrumbPromptRuntime,
      squirtleReassemblyRuntime:
        interactionPresentationRuntimeBundle.squirtleReassemblyRuntime,
      supplyCounterPromptController:
        startupRuntimeBundle.supplyCounterPromptController,
      waterGunRuntime,
      waterGunSfxBurstRuntime:
        interactionPresentationRuntimeBundle.waterGunSfxBurstRuntime,
      woodCollectPopRuntime: startupRuntimeBundle.woodCollectPopRuntime
    },
    callbacks: {
      playSoundEvent: startupRuntimeBundle.playSoundEvent,
      pushSupplyResourceCollectFeedback:
        startupRuntimeBundle.pushSupplyResourceCollectFeedback,
      queueSupplyPickupFlyItems: startupRuntimeBundle.queueSupplyPickupFlyItems
    },
    math: {
      moveValueToward,
      rotateAngleToward
    }
  });

  const frameEntryRuntimeBundle = createFrameEntryRuntime({
    actTwoTutorial,
    audio: startupRuntimeBundle.audio,
    camera,
    cameraDebugRuntime: startupRuntimeBundle.cameraDebugRuntime,
    controls,
    frameClock: startupRuntimeBundle.frameClock,
    frameSnapshotController:
      interactionPresentationRuntimeBundle.frameSnapshotController,
    fpsPanelController: interactionPresentationRuntimeBundle.fpsPanelController,
    gameFlowValues,
    gameplayCameraDirector: startupRuntimeBundle.gameplayCameraDirector,
    gameplayDialogue,
    gameplayUiVisibility,
    inputModalityPanelController:
      interactionPresentationRuntimeBundle.inputModalityPanelController,
    isGameFlow,
    placementCameraAssist: startupRuntimeBundle.placementCameraAssist,
    pokedexUiState,
    repairBoxMotionRuntime:
      interactionPresentationRuntimeBundle.repairBoxMotionRuntime,
    rustlingGrassEventRuntime: startupRuntimeBundle.rustlingGrassEventRuntime,
    session,
    updateFoundationBuildZoneCameraFocus:
      startupRuntimeBundle.updateFoundationBuildZoneCameraFocus,
    worldCanvas,
    callbacks: {
      getCurrentInputModalityState:
        startupRuntimeBundle.getCurrentInputModalityState,
      playSoundEvent: startupRuntimeBundle.playSoundEvent,
      processWorldCellPlannerClick:
        startupRuntimeBundle.processWorldCellPlannerClick,
      updateFrameAudio: startupRuntimeBundle.updateFrameAudio
    },
    createCameraFrameRuntime:
      startupRuntimeBundle.createGameplayCameraFrameRuntime
  });
  gameplayInputRuntime = frameEntryRuntimeBundle.gameplayInputRuntime;

  const lateRuntimeBundle = createLateRuntime({
    audio: startupRuntimeBundle.audio,
    clamp01,
    controls,
    gameplay,
    gameplayRenderSnapshotFrameRuntime:
      fieldPresentationRuntimeBundle.gameplayRenderSnapshotFrameRuntime,
    hud,
    rendering,
    session,
    runtimes: {
      companionConstructionBlockerRuntime:
        startupRuntimeBundle.companionConstructionBlockerRuntime,
      freeBlockBuildSessionRuntime:
        startupRuntimeBundle.freeBlockBuildSessionRuntime,
      buildBlockRuntime: fieldPresentationRuntimeBundle.buildBlockRuntime,
      bulbasaurWorkbenchGuideRuntime:
        interactionPresentationRuntimeBundle.bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime:
        interactionPresentationRuntimeBundle.companionAbilityResourcesRuntime,
      constructionPlacementControlRuntime:
        fieldPresentationRuntimeBundle.constructionPlacementControlRuntime,
      fieldMoveInvalidTargetPromptRuntime:
        interactionPresentationRuntimeBundle.fieldMoveInvalidTargetPromptRuntime,
      fireRuntime: fieldPresentationRuntimeBundle.fireRuntime,
      leafageRuntime: fieldPresentationRuntimeBundle.leafageRuntime,
      leafDenConstructionPresentationRuntime:
        interactionPresentationRuntimeBundle.leafDenConstructionPresentationRuntime,
      landscapeCutEffectRuntime: startupRuntimeBundle.landscapeCutEffectRuntime,
      npcConversationFocusRuntime:
        interactionPresentationRuntimeBundle.npcConversationFocusRuntime,
      playerModelRuntime: actorFrameRuntimeBundle.playerModelRuntime,
      playerCounterPromptRuntime: startupRuntimeBundle.playerCounterPromptRuntime,
      solarStationPowerRadiusRuntime:
        fieldPresentationRuntimeBundle.solarStationPowerRadiusRuntime,
      supplyCounterPromptController:
        startupRuntimeBundle.supplyCounterPromptController,
      treeRevivalLeafBurstFrameRuntime:
        startupRuntimeBundle.treeRevivalLeafBurstFrameRuntime,
      waterGunRuntime,
      waterGunSfxBurstRuntime:
        interactionPresentationRuntimeBundle.waterGunSfxBurstRuntime,
      workbenchRotationRuntime:
        interactionPresentationRuntimeBundle.workbenchRotationRuntime,
      worldObjectPlacementBlockerRuntime:
        startupRuntimeBundle.worldObjectPlacementBlockerRuntime
    },
    callbacks: {
      createFoundationBuildZoneCameraFocusRuntime:
        startupRuntimeBundle.createFoundationBuildZoneCameraFocusRuntime,
      debugInteractionFlow,
      getCurrentInputModalityState:
        startupRuntimeBundle.getCurrentInputModalityState,
      getNowMs: getRuntimeNowMs,
      getNowSeconds: getRuntimeNowSeconds,
      getTerrainColliders:
        startupRuntimeBundle.getPlayerConstructionTerrainColliders,
      getWorldCellPlannerSelectedGroundCell:
        startupRuntimeBundle.getWorldCellPlannerSelectedGroundCell,
      playInstanceObjectSfx: startupRuntimeBundle.playInstanceObjectSfx,
      playSoundEvent: startupRuntimeBundle.playSoundEvent,
      playTreeBirthSfx: startupRuntimeBundle.playTreeBirthSfx,
      queueChangedSupplyPickupFlyItems:
        startupRuntimeBundle.queueChangedSupplyPickupFlyItems
    },
    config: {
      restoredGrassMissionTargetCount:
        BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
      waterGunFirstUsePromptFlag: WATER_GUN_FIRST_USE_PROMPT_FLAG
    }
  });
  fieldMoveImpactRuntime = lateRuntimeBundle.fieldMoveImpactRuntime;
  foundationBuildZoneCameraFocusRuntime =
    lateRuntimeBundle.foundationBuildZoneCameraFocusRuntime;
  foundationBuildZoneRuntime = lateRuntimeBundle.foundationBuildZoneRuntime;
  freeBlockBuildRuntime = lateRuntimeBundle.freeBlockBuildRuntime;

  return {
    ...startupRuntimeBundle,
    ...interactionPresentationRuntimeBundle,
    ...fieldPresentationRuntimeBundle,
    ...actorFrameRuntimeBundle,
    ...frameEntryRuntimeBundle,
    ...lateRuntimeBundle
  };
}
