import { createGameLoopFrameClock } from "./gameLoopFrameClock.js";
import {
  createGameLoopFlowStateReader,
  createGameLoopFrameRuntime
} from "./gameLoopFrameRuntime.js";
import { isRevealBoxBotVisible } from "./botRevealMotion.js";
import { createGameplayCameraRuntimeBundle } from "./camera/gameplayCameraRuntimeBundle.js";
import { createGameplayCompanionFacingRuntime } from "./companions/companionFacingRuntime.js";
import { createGameplayCompanionFrameRuntimeBundle } from "./companions/companionFrameRuntimeBundle.js";
import { createGameplayCompanionMotionRuntimeBundle } from "./companions/companionMotionRuntimeBundle.js";
import { createGameplayCompanionPresentationRuntimeBundle } from "./companions/companionPresentationRuntimeBundle.js";
import { createGameplayCompanionWorldSpeechCueRuntime } from "./companions/companionWorldSpeechCueRuntime.js";
import { processFollowerCallFrame } from "./companions/followerCallFrame.js";
import { createGameplayRepairBoxRevealRuntimeBundle } from "./companions/repairBoxRevealOpeningRuntime.js";
import { createGameplayFreeBlockBuildSessionRuntime } from "./construction/freeBlockBuildSessionRuntime.js";
import { createConstructionBlockerRuntimeBundle } from "./construction/constructionBlockerRuntimeBundle.js";
import { createConstructionBuildRuntimeBundle } from "./construction/constructionBuildRuntimeBundle.js";
import {
  buildGameplaySolarStationFieldMarkedGroundCells as buildSolarStationFieldMarkedGroundCells,
  GAMEPLAY_CONSTRUCTION_CONFIG as CONSTRUCTION_CONFIG,
  createGameplayConstructionTerrainColliderProvider,
  getGameplayRotatedPlacementSize as getRotatedPlacementSize
} from "./construction/constructionGameplayConfig.js";
import {
  createGameplayPlacementPreviewCancellation
} from "./construction/constructionPlacementControlRuntime.js";
import {
  createGameplayConstructionPlacementRuntimeBundle
} from "./construction/constructionPlacementRuntimeBundle.js";
import { createConstructionPresentationRuntimeBundle } from "./construction/constructionPresentationRuntimeBundle.js";
import {
  hasPendingWorkbenchPlacementIntent
} from "./construction/pendingPlacementIntent.js";
import {
  getFreeBlockInvalidPlacementNotice
} from "./construction/placementPreviewPrompts.js";
import {
  applyPlayerPlacementSpawnToModelInstance,
  updateSolarStationSpawnEffect
} from "./construction/playerPlacementSpawnEffect.js";
import {
  doPlacementRectsOverlap,
  getPlacementPreviewFootprintWorldSize,
  getPlacementCollisionSize,
  getPlacementRect,
  normalizePlacementYaw
} from "./construction/placementGeometry.js";
import {
  resolveGameplayActionPermission,
  resolvePlayerMovementPermission,
  resolveWorldSpaceUiVisibility
} from "./gameLoopFramePolicies.js";
import { resolveConstructionDisplacementPosition } from "./fieldMoveRuntime/buildBlockRuntime.js";
export {
  resolveConstructionDisplacementPosition,
  resolveTimburrBuildBlockApproachPosition
} from "./fieldMoveRuntime/buildBlockRuntime.js";
import {
  BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
  findAlreadyResolvedFieldMoveGroundCell,
  isDryGrassHydroMissionActive
} from "./fieldMoveRuntime/fieldMoveGroundTargets.js";
import { createFieldMoveImpactRuntime } from "./fieldMoveRuntime/fieldMoveImpactRuntime.js";
import { createGameplayFieldMoveRuntimeBundle } from "./fieldMoveRuntime/fieldMoveRuntimeBundle.js";
import { createFieldMoveSupportRuntimeBundle } from "./fieldMoveRuntime/fieldMoveSupportRuntimeBundle.js";
import { createGameplayGroundActionFeedbackRuntime } from "./groundActionFeedbackRuntime.js";
import {
  createGameplayInteractionDebugColliderProvider,
  getActorDebugPosition,
} from "./presentation/interactionDebugColliders.js";
import { createGameplayMissionTargetPositionProvider } from "./missions/missionTargetPositionLookup.js";
import { getYawToward } from "./modelFacing.js";
import { createMovementQuestRuntime } from "./movementQuestRuntime.js";
import { createNpcConversationFocusRuntime } from "./npcs/npcConversationFocusRuntime.js";
import { createPlayerGameplayActionRuntimeBundle } from "../player/playerActionRuntimeBundle.js";
import { createPlayerFrameRuntimeBundle } from "../player/playerFrameRuntimeBundle.js";
import { createGameplayPromptPreparationRuntimeBundle } from "./presentation/gameplayPromptPreparationRuntimeBundle.js";
import { createWorldSpacePresentationFrameRuntime } from "./presentation/worldSpacePresentationSnapshotFrame.js";
import {
  createGameplayPresentationSnapshotFrameRuntime,
  createGameplayRenderSnapshotFrameRuntime,
  createRenderSnapshotRuntimeBundle
} from "./presentation/renderSnapshotRuntimeBundle.js";
import { createGameplaySupplyFeedbackRuntimeBundle } from "./presentation/supplyFeedbackRuntimeBundle.js";
import { createGameplayNaturePresentationRuntimeBundle } from "./presentation/naturePresentationRuntimeBundle.js";
import { isWorldPositionWithinRenderDistance } from "./presentation/renderDistance.js";
import { createRunBreadcrumbPromptRuntime } from "./runBreadcrumbPromptRuntime.js";
import { createGameplaySnowstormFogRuntime } from "./world/snowstormFogRuntime.js";
import { applyTrainHouseDance } from "./trainHouseDance.js";
import { createWaterGunSfxBurstRuntime } from "./waterGunSfxBurstRuntime.js";
import { createConstructionWorkbenchRotationRuntime } from "./construction/workbenchRotationRuntime.js";
import { createWorldRuntimeBundle } from "./world/worldRuntimeBundle.js";

export {
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "./companions/companionFollowMotion.js";

import {
  SQUIRTLE_WATER_GUN_SPRAY_DURATION
} from "./fieldMoveRuntime/fieldMoveTuning.js";

import {
  applyWorkbenchGreenArrowCue,
  shouldShowWorkbenchGreenArrowCue
} from "./workbenchCueRuntime.js";

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

import {
  WORKBENCH_GREEN_ARROW_BASE_SCALE,
  WORKBENCH_GREEN_ARROW_BOB_HEIGHT,
  WORKBENCH_GREEN_ARROW_BOB_SPEED,
  WORKBENCH_GREEN_ARROW_OFFSET,
  WORKBENCH_GREEN_ARROW_ROLL_SPEED,
  WORKBENCH_GREEN_ARROW_ROLL_SWAY,
  WORKBENCH_GREEN_ARROW_YAW_SPEED,
  WORKBENCH_GREEN_ARROW_YAW_SWAY
} from "./gameplayPresentationTuning.js";

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

import {
  createFpsPanelController,
  createInputModalityPanelController
} from "./gameplayDebugPanels.js";

import {
  createBuildBlockDebugOverlay,
  resolveBuildBlockPreviewValidity,
  shouldTimburrBuildBlockCastFromBlockedApproach
} from "./buildBlockDebugOverlay.js";

export {
  formatBuildBlockDebugLines,
  resolveBuildBlockPreviewValidity,
  shouldTimburrBuildBlockCastFromBlockedApproach
} from "./buildBlockDebugOverlay.js";

import { createFrameSnapshotController } from "./frameSnapshotController.js";
import {
  restoreActiveZoomPresetOnMovement
} from "./camera/cameraZoomPresetController.js";
import { updateIntroRoomFrame } from "../scenes/introRoom/introRoomSequence.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import {
  getGameplayOpeningShipSceneObjects
} from "../session/gameplayOpeningShip.js";
import {
  CARBON_ITEM_ID,
  GEAR_ITEM_ID,
  LEAVES_ITEM_ID,
  LEPPA_BERRY_ITEM_ID,
  POKEMON_TALK_INTERACT_DISTANCE,
  WORKBENCH_INTERACT_DISTANCE,
  WORKBENCH_POSITION
} from "../../gameplayContent.js";
import {
  findNearbyDestroyableInstantiatedObject,
  getLeppaTreeSurroundingGroundCells,
  treeFootprint,
  validateBuildingKitPlacement
} from "../../world/islandWorld.js";
import {
  applyInteractionObjectHighlight,
  clearInteractionObjectHighlights
} from "./interactionObjectHighlight.js";
import { syncFirstTaughtActionFreedomWindow } from "../story/earlyFreedomWindow.js";
import { isPositionInsideTerrainColliderFootprint } from "../gameplay/placementBlockers.js";
import { FREE_BLOCK_TYPES } from "../gameplay/freeBlockBuildSystem.js";
import { evaluateHabitatSiteChoice } from "../gameplay/habitatSiteChoiceContract.js";
import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackNotice
} from "../gameplay/colonyFeedbackContracts.js";
import {
  resolveWorkbenchRotationPrompt
} from "../ui/inputPromptResolver.js";
import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES
} from "../story/sandbotsLexicon.js";
import { resolvePsxDistanceFogSettings } from "../rendering/psxDistanceFogConfig.js";
import { PLACEMENT_CONTRACTS } from "../gameplay/contracts/placementContracts.js";
import { hasActivePlacementPreview } from "../gameplay/contracts/placementRuntime.js";
import { createGameplayAudioRuntimeBundle } from "./audio/gameplayAudioRuntimeBundle.js";
import {
  createGameplayOpeningPresentationFrameRuntime,
  createGameplayOpeningRuntime
} from "./opening/createGameplayOpeningRuntime.js";
import {
  createGameplayInputFrameRuntime,
  createGameplayInputRuntime
} from "./input/createGameplayInputRuntime.js";


const WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX = 72;
const LEAF_DEN_BUSY_NOTICE = "im busy, boss...";
const WATER_GUN_FIRST_USE_PROMPT_FLAG = "waterGunFirstUsePromptDismissed";
const RUN_BREADCRUMB_PROMPT_DURATION_MS = 4200;
const REPAIR_BOX_PROMPT_DISTANCE = 2.8;
function debugInteractionFlow(node, payload = {}) {
  if (!globalThis.__DEBUG_INTERACTION_FLOW__) {
    return;
  }

  console.log(`[interaction-flow:${node}]`, payload);
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value) {
  const progress = clamp01(value);
  return 1 - Math.pow(1 - progress, 3);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function hashUnit(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function moveValueToward(current, target, maxStep) {
  if (Math.abs(target - current) <= maxStep) {
    return target;
  }

  return current + Math.sign(target - current) * maxStep;
}

function isOpeningLeppaTreeRequestActive(storyState) {
  return Boolean(
    storyState?.flags?.squirtleLeppaRequestAvailable &&
    !storyState.flags.leppaTreeRevived
  );
}

function getShortestAngleDelta(fromAngle, toAngle) {
  return Math.atan2(Math.sin(toAngle - fromAngle), Math.cos(toAngle - fromAngle));
}

function rotateAngleToward(fromAngle, toAngle, maxStep) {
  const delta = getShortestAngleDelta(fromAngle, toAngle);

  if (Math.abs(delta) <= maxStep) {
    return toAngle;
  }

  return fromAngle + Math.sign(delta) * maxStep;
}


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
  const frameClock = createGameLoopFrameClock({
    now: typeof performance !== "undefined" &&
      typeof performance.now === "function" ?
        performance.now() :
        Date.now(),
    maxDeltaTime: 0.033
  });
  const {
    cameraDebugRuntime,
    cameraZoomPresetController,
    createFoundationBuildZoneCameraFocusRuntime,
    createGameplayCameraFrameRuntime,
    gameplayCameraDirector,
    placementCameraAssist
  } = createGameplayCameraRuntimeBundle({
    camera,
    cameraOrbit,
    cameraZoomPresets,
    controls,
    gameplay,
    mount,
    session
  });
  const {
    audio,
    playSoundEvent,
    updateFrameAudio
  } = createGameplayAudioRuntimeBundle({
    controls,
    gameplay,
    session
  });
  const {
    playerCounterPromptRuntime,
    pushSupplyResourceCollectFeedback,
    queueChangedSupplyPickupFlyItems,
    queueSupplyPickupFlyItems,
    supplyCounterPromptController
  } = createGameplaySupplyFeedbackRuntimeBundle({
    audio,
    camera,
    controls,
    gameplay,
    getNowMs: getRuntimeNowMs,
    hud,
    session,
    worldCanvas
  });
  const freeBlockBuildSessionRuntime = createGameplayFreeBlockBuildSessionRuntime({
    session
  });
  const {
    rustlingGrassEventRuntime,
    worldCellPlannerInteractionRuntime,
    worldSceneSyncRuntime
  } = createWorldRuntimeBundle({
    camera,
    controls,
    gameplay,
    hud,
    rendering,
    session,
    worldCanvas,
    callbacks: {
      clearInteractionObjectHighlights,
      updateLandscapeCutEffect: (deltaTime) => landscapeCutEffectRuntime.update(deltaTime),
      updateSnowstormFog: ({ deltaTime }) => snowstormFogRuntime.update({ session, deltaTime })
    },
    config: {
      worldCellPlannerPickMaxDistancePx: WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX,
      workbenchPosition: WORKBENCH_POSITION,
      workbenchInteractDistance: WORKBENCH_INTERACT_DISTANCE
    },
    getGridConfig: () => freeBlockBuildSessionRuntime.getGridConfig()
  });
  const movementQuestRuntime = createMovementQuestRuntime({
    minimumMovementDistance: 0.0005,
    reportDistance: 0.04
  });
  const {
    gearPickupParticleRuntime,
    landscapeCutEffectRuntime,
    naturePresentationFrameRuntime,
    treeRevivalLeafBurstFrameRuntime,
    woodCollectPopRuntime
  } = createGameplayNaturePresentationRuntimeBundle({
    camera,
    controls,
    rendering,
    session,
    callbacks: {
      getEncounterRepairBoxPosition
    },
    math: {
      clamp01,
      easeOutCubic,
      lerp
    }
  });
  const companionFacingRuntime = createGameplayCompanionFacingRuntime({ session });
  const getPlayerConstructionTerrainColliders =
    createGameplayConstructionTerrainColliderProvider({
      session,
      getStoryState: () => controls.storyState
    });
  const {
    companionConstructionBlockerRuntime,
    solarStationPlacementBlockerRuntime,
    worldObjectPlacementBlockerRuntime
  } = createConstructionBlockerRuntimeBundle({
    controls,
    hud,
    session,
    treeFootprint,
    callbacks: {
      getTerrainColliders: getPlayerConstructionTerrainColliders,
      playBlockedSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL)
    },
    config: {
      footprints: {
        greenhouse: CONSTRUCTION_CONFIG.previewFootprints.greenhouse,
        solarStation: CONSTRUCTION_CONFIG.previewFootprints.solarStation,
        trainHouse: CONSTRUCTION_CONFIG.previewFootprints.trainHouse,
        houseKit: CONSTRUCTION_CONFIG.previewFootprints.houseKit,
        houseBuilt: CONSTRUCTION_CONFIG.leafDenBuiltRotationFootprint
      }
    },
    geometry: {
      getPlacementCollisionSize,
      getPlacementRect,
      doPlacementRectsOverlap
    }
  });
  const {
    fieldMoveActorPositionRuntime,
    fieldMoveApproachPositionRuntime,
    fieldMoveInvalidTargetPromptRuntime
  } = createFieldMoveSupportRuntimeBundle({
    session,
    companionFacingRuntime,
    companionConstructionBlockerRuntime
  });
  const companionWorldSpeechCueRuntime = createGameplayCompanionWorldSpeechCueRuntime({
    controls,
    session,
    fieldMoveActorPositionRuntime,
    worldSceneSyncRuntime,
    config: {
      chopperInteractDistance: POKEMON_TALK_INTERACT_DISTANCE + 0.45,
      restoreTargetCount: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT
    }
  });
  const {
    bulbasaurWorkbenchGuideRuntime,
    companionFollowDirectionRuntime,
    companionFollowMovementRuntime,
    companionGroundPatrolFrameRuntime,
    companionIdleMotionRuntime
  } = createGameplayCompanionMotionRuntimeBundle({
    controls,
    session,
    runtimes: {
      companionConstructionBlockerRuntime,
      companionFacingRuntime
    },
    callbacks: {
      getSquirtleWaterGunQueue: () => waterGunRuntime.getQueue(),
      syncSquirtleModelInstance: () => companionModelSyncRuntime.syncSquirtle(),
      syncBulbasaurModelInstance: () => companionModelSyncRuntime.syncBulbasaur()
    }
  });
  const runBreadcrumbPromptRuntime = createRunBreadcrumbPromptRuntime({
    durationMs: RUN_BREADCRUMB_PROMPT_DURATION_MS
  });
  const {
    repairBoxRevealOpeningRuntime
  } = createGameplayRepairBoxRevealRuntimeBundle({
    mount,
    worldCanvas,
    camera,
    clamp01,
    getRepairBoxPosition: getEncounterRepairBoxPosition,
    playRevealSfx: playGrowBotRevealSfx
  });
  const workbenchRotationRuntime = createConstructionWorkbenchRotationRuntime({
    session,
    controls,
    hud,
    geometry: {
      normalizePlacementYaw,
      getRotatedPlacementSize,
      getPlacementCollisionSize
    },
    feedback: {
      getPromptText: () => resolveWorkbenchRotationPrompt(getCurrentInputModalityState()),
      playSoundEvent,
      soundEventIds: {
        confirm: SOUND_EVENT_IDS.UI_CONFIRM,
        cancel: SOUND_EVENT_IDS.UI_CANCEL,
        navigate: SOUND_EVENT_IDS.UI_NAVIGATE
      }
    },
    config: {
      placementRotationStep: CONSTRUCTION_CONFIG.placementRotationStep,
      footprints: {
        houseBuilt: CONSTRUCTION_CONFIG.leafDenBuiltRotationFootprint,
        houseKit: CONSTRUCTION_CONFIG.previewFootprints.houseKit,
        solarStation: CONSTRUCTION_CONFIG.previewFootprints.solarStation,
        trainHouse: CONSTRUCTION_CONFIG.previewFootprints.trainHouse
      },
      thermalCabinLabel: SANDBOTS_ITEM_NAMES.thermalCabin
    },
    solarStation: {
      getNowSeconds: getRuntimeNowSeconds
    }
  });
  const snowstormFogRuntime = createGameplaySnowstormFogRuntime({
    mount,
    clamp01
  });

  const buildBlockDebugOverlay = createBuildBlockDebugOverlay({
    mount,
    worldCanvas
  });

  // Controladores de sistemas relacionados à câmera.
  const frameSnapshotController = createFrameSnapshotController({
    camera,
    mount,
    worldRenderer,
    worldSpeech,
    colliderGizmos,
    groundCellHighlight,
    actTwoTutorial,
    hud
  });

  // Controladores de sistemas relacionados ao gameplay.
  function getCurrentInputModalityState() {
    return gameplayInputRuntime.getFrame()?.inputModalityState || null;
  }
  const fpsPanelController = createFpsPanelController(fpsPanel);
  const inputModalityPanelController = createInputModalityPanelController(inputModalityPanel);
  const waterGunSfxBurstRuntime = createWaterGunSfxBurstRuntime();
  const {
    beeFieldRuntime,
    companionAbilityResourcesRuntime,
    companionModelSyncRuntime,
    companionRenderFrameRuntime,
    companionRepairBoxModelRuntime,
    repairBoxMotionRuntime,
    squirtleReassemblyRuntime
  } = createGameplayCompanionPresentationRuntimeBundle({
    camera,
    controls,
    rendering,
    session,
    runtimes: {
      fieldMoveActorPositionRuntime,
      worldSceneSyncRuntime
    },
    callbacks: {
      getEncounterRepairBoxPosition,
      isActTwoTutorialStarted: () => actTwoTutorial.hasStarted(),
      isRevealBoxBotVisible,
      onSquirtleRechargeComplete: startNextQueuedSquirtleWaterGunAction
    },
    math: {
      clamp01,
      easeOutCubic,
      lerp,
      moveValueToward
    }
  });
  const {
    constructionHelperMotionRuntime,
    constructionHouseModelInstanceRuntime,
    leafDenConstructionPresentationRuntime
  } = createConstructionPresentationRuntimeBundle({
    controls,
    session,
    workbenchRotationRuntime,
    callbacks: {
      applyTrainHouseDance,
      applyPlacementSpawn: applyPlayerPlacementSpawnToModelInstance,
      getRobotModelYawToward: companionFacingRuntime.getRobotModelYawToward,
      isWorldPositionWithinRenderDistance
    },
    getNowMs: getRuntimeNowMs,
    getNowSeconds: getRuntimeNowSeconds
  });
  const npcConversationFocusRuntime = createNpcConversationFocusRuntime({
    controls,
    dialogueCamera,
    gameplayDialogue,
    getSquirtle: () => session.actTwoSquirtle,
    getSquirtleModelYawToward: companionFacingRuntime.getSquirtleModelYawToward,
    getYawToward
  });
  const {
    buildBlockRuntime,
    fireRuntime,
    leafageRuntime,
    waterGunRuntime
  } = createGameplayFieldMoveRuntimeBundle({
    session,
    controls,
    runtimes: {
      bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime,
      companionConstructionBlockerRuntime,
      companionFacingRuntime,
      companionModelSyncRuntime,
      fieldMoveApproachPositionRuntime,
      get fieldMoveImpactRuntime() {
        return fieldMoveImpactRuntime;
      },
      get freeBlockBuildRuntime() {
        return freeBlockBuildRuntime;
      },
      leafDenConstructionPresentationRuntime
    },
    callbacks: {
      pushNotice: (notice) => hud?.pushNotice?.(notice),
      shouldTimburrBuildBlockCastFromBlockedApproach
    },
    botNames: SANDBOTS_BOT_NAMES
  });
  const cancelActivePlacementPreviews = createGameplayPlacementPreviewCancellation({
    session,
    controls,
    hud,
    playSoundEvent,
    cancelSoundEventId: SOUND_EVENT_IDS.UI_CANCEL,
    placementContracts: PLACEMENT_CONTRACTS
  });
  const {
    constructionPlacementControlRuntime,
    constructionPlacementFrameRuntime,
    solarStationPowerRadiusRuntime
  } = createGameplayConstructionPlacementRuntimeBundle({
    controls,
    session,
    runtimes: {
      buildBlockRuntime,
      solarStationPlacementBlockerRuntime,
      workbenchRotationRuntime
    },
    callbacks: {
      applySolarStationSpawnEffect: updateSolarStationSpawnEffect,
      cancelActivePlacementPreviews,
      evaluateHabitatSiteChoice,
      getFreeBlockInvalidPlacementNotice,
      getMovementAxes: () => camera.getMovementAxes(),
      getPlacementCollisionSize,
      getPlacementPreviewFootprintWorldSize,
      getSelectedBlockMaterialCost: () =>
        freeBlockBuildRuntime.getController()?.getSelectedBlockMaterialCost?.(),
      hasActivePlacementPreview,
      hasPendingWorkbenchPlacementIntent,
      normalizePlacementYaw,
      playCancelSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
      playRotateSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE),
      pushNotice: (notice) => hud?.pushNotice?.(notice),
      syncFreeBlockBuildPreview: (...args) => freeBlockBuildRuntime.syncPreview(...args),
      updateBuildBlockDebugOverlay: (debug) => buildBlockDebugOverlay.update(debug),
      validatePlacement: validateBuildingKitPlacement
    }
  });
  const worldSpacePresentationFrameRuntime = createWorldSpacePresentationFrameRuntime({
    controls,
    session,
    gameplay,
    repairBoxPromptDistance: REPAIR_BOX_PROMPT_DISTANCE,
    restoredGrassMissionTargetCount: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
    waterGunFirstUsePromptFlag: WATER_GUN_FIRST_USE_PROMPT_FLAG,
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
  const {
    baseRenderSnapshotFrameRuntime,
    renderSnapshotCompletionFrameRuntime
  } = createRenderSnapshotRuntimeBundle({
    camera,
    controls,
    gameFlowValues,
    rendering,
    session,
    worldCanvas,
    construction: {
      companionRepairBoxModelRuntime,
      constructionHouseModelInstanceRuntime,
      leafDenConstructionPresentationRuntime
    },
    callbacks: {
      applyInteractionObjectHighlight,
      getGameplayOpeningShipSceneObjects,
      getInteractionDebugColliders,
      resolvePsxDistanceFogSettings
    },
    runtimes: {
      squirtleReassemblyRuntime,
      treeRevivalLeafBurstFrameRuntime
    }
  });
  const getInteractionDebugColliders =
    createGameplayInteractionDebugColliderProvider({
      session,
      getStoryState: () => controls.storyState,
      rendering
    });
  const getMissionTargetPositionsById =
    createGameplayMissionTargetPositionProvider({
      session,
      getFreeBlockBuildZoneCenterPosition: () =>
        foundationBuildZoneRuntime.getBuildZoneCenterPosition()
    });
  const gameplayRenderSnapshotFrameRuntime = createGameplayRenderSnapshotFrameRuntime({
    controls,
    session,
    rendering,
    clamp: clamp01,
    construction: {
      leafDenConstructionPresentationRuntime
    },
    callbacks: {
      getMissionTargetPositionsById,
      isOpeningLeppaTreeRequestActive
    },
    runtimes: {
      baseRenderSnapshotFrameRuntime,
      worldSpacePresentationFrameRuntime,
      naturePresentationFrameRuntime,
      companionRenderFrameRuntime,
      renderSnapshotCompletionFrameRuntime
    }
  });
  const {
    playerModelRuntime,
    playerMovementFrameRuntime,
    playerResourceCollectionFrameRuntime
  } = createPlayerFrameRuntimeBundle({
    audio,
    camera,
    cameraOrbit,
    cameraZoomPresetController,
    controls,
    gameplay,
    hud,
    policies: {
      resolvePlayerMovementPermission
    },
    runtimes: {
      companionFollowDirectionRuntime,
      gearPickupParticleRuntime,
      movementQuestRuntime,
      runBreadcrumbPromptRuntime,
      woodCollectPopRuntime
    },
    callbacks: {
      getColonyFeedbackNotice,
      playSoundEvent,
      pushSupplyResourceCollectFeedback,
      queueSupplyPickupFlyItems,
      restoreActiveZoomPresetOnMovement,
      triggerSupplyCounterPrompt: (itemId, inventory, promptNow) =>
        supplyCounterPromptController.trigger(itemId, inventory, promptNow)
    },
    config: {
      botNames: SANDBOTS_BOT_NAMES,
      colonyFeedbackIds: {
        habitatCheckComplete: COLONY_FEEDBACK_IDS.HABITAT_CHECK_COMPLETE
      },
      itemIds: {
        wood: "wood",
        leaves: LEAVES_ITEM_ID,
        gear: GEAR_ITEM_ID,
        carbon: CARBON_ITEM_ID,
        leppaBerry: LEPPA_BERRY_ITEM_ID
      },
      labels: {
        leaves: "Leaves",
        gear: "Gear",
        carbon: "Carbon",
        leppaBerry: SANDBOTS_ITEM_NAMES.pulseBerry
      },
      movementQuestId: "learn-to-move",
      soundEventIds: {
        gameplayJump: SOUND_EVENT_IDS.GAMEPLAY_JUMP
      }
    },
    math: {
      moveValueToward,
      rotateAngleToward
    },
    session
  });
  const {
    companionFrameRuntime
  } = createGameplayCompanionFrameRuntimeBundle({
    session,
    controls,
    rendering,
    audio,
    callbacks: {
      isGameplayActive: () => isGameFlow(gameFlowValues.GAMEPLAY)
    },
    runtimes: {
      beeFieldRuntime,
      buildBlockRuntime,
      bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime,
      companionFollowMovementRuntime,
      companionGroundPatrolFrameRuntime,
      companionIdleMotionRuntime,
      companionModelSyncRuntime,
      companionRepairBoxModelRuntime,
      constructionHelperMotionRuntime,
      fireRuntime,
      gameplayDialogue,
      leafageRuntime,
      leafDenConstructionPresentationRuntime,
      repairBoxRevealOpeningRuntime,
      squirtleReassemblyRuntime,
      waterGunRuntime,
      waterGunSfxBurstRuntime
    }
  });

  const gameplayInputRuntime = createGameplayInputRuntime({
    controls
  });
  const gameplayInputFrameRuntime = createGameplayInputFrameRuntime({
    gameplayInputRuntime,
    inputModalityPanelController,
    getInputModalityState: getCurrentInputModalityState,
    getCameraTransitionActive: () => camera.isTargetTransitionActive(),
    updateCameraDebugFrameOverlay: (frameState) => {
      cameraDebugRuntime.updateFrameOverlay(frameState);
    }
  });

  const gameplayOpeningRuntime = createGameplayOpeningRuntime({
    gameplayCameraDirector,
    session,
    controls,
    gameplayUiVisibility,
    audio
  });
  const gameplayOpeningPresentationFrameRuntime =
    createGameplayOpeningPresentationFrameRuntime({
      openingRuntime: gameplayOpeningRuntime,
      updateFrameAudio,
      isGameplayActive: () => isGameFlow(gameFlowValues.GAMEPLAY),
      isDialogueActive: () => gameplayDialogue.isActive()
    });
  const gameplayCameraFrameRuntime = createGameplayCameraFrameRuntime({
    tutorial: actTwoTutorial,
    openingRuntime: gameplayOpeningRuntime,
    isGameplayFlow: () => isGameFlow(gameFlowValues.GAMEPLAY),
    playNavigateSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE)
  });
  const readGameLoopFlowState = createGameLoopFlowStateReader({
    isGameFlow,
    gameFlowValues,
    actTwoTutorial,
    pokedexUiState,
    gameplayDialogue,
    controls
  });
  const frameRuntime = createGameLoopFrameRuntime({
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readFlowState: readGameLoopFlowState,
    advanceElapsed: (deltaTime) => {
      repairBoxMotionRuntime.update(deltaTime);
    },
    gameplayOpeningRuntime,
    session,
    placement: {
      contracts: PLACEMENT_CONTRACTS,
      hasActivePlacementPreview
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
      updateRustlingGrass: ({ deltaTime, canAdvance }) => rustlingGrassEventRuntime.update({
        deltaTime,
        canAdvance
      })
    }
  });

  function getRuntimeNowSeconds() {
    const nowMs =
      typeof performance !== "undefined" && typeof performance.now === "function" ?
        performance.now() :
        Date.now();
    return nowMs * 0.001;
  }

  function getRuntimeNowMs() {
    return typeof performance !== "undefined" && typeof performance.now === "function" ?
      performance.now() :
      Date.now();
  }

  function playInstanceObjectSfx() {
    audio.playInstanceObject();
  }

  const groundActionFeedbackRuntime = createGameplayGroundActionFeedbackRuntime({
    clamp01,
    playInvalidSfx: () => audio.playFieldMoveInvalid()
  });
  const {
    foundationBuildZoneCameraFocusRuntime,
    foundationBuildZoneRuntime,
    freeBlockBuildRuntime
  } = createConstructionBuildRuntimeBundle({
    controls,
    rendering,
    session,
    runtimes: {
      companionConstructionBlockerRuntime,
      freeBlockBuildSessionRuntime,
      groundActionFeedbackRuntime,
      playerModelRuntime,
      worldObjectPlacementBlockerRuntime
    },
    callbacks: {
      createFoundationBuildZoneCameraFocusRuntime,
      getTerrainColliders: getPlayerConstructionTerrainColliders,
      getActorPosition: getActorDebugPosition,
      isPositionInsideCollider: isPositionInsideTerrainColliderFootprint,
      resolvePreviewValidity: resolveBuildBlockPreviewValidity,
      resolveDisplacementPosition: resolveConstructionDisplacementPosition,
      playPlacedSound: playInstanceObjectSfx,
      playInvalidSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
      playImpactSound: () => playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_IMPACT),
      pushNotice: (notice) => hud?.pushNotice?.(notice)
    },
    config: {
      wallBlockType: FREE_BLOCK_TYPES.WALL
    }
  });

  const {
    playerActionFrameRuntime,
    playerActionRuntime
  } = createPlayerGameplayActionRuntimeBundle({
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
      findAlreadyResolvedFieldMoveGroundCell,
      findNearbyDestroyableInstantiatedObject,
      getFreeBlockInvalidPlacementNotice,
      getNowMs: getRuntimeNowMs,
      getNowSeconds: getRuntimeNowSeconds,
      isBusyCompanionTarget: leafDenConstructionPresentationRuntime.isBusyCompanionTarget,
      onNpcInteractionStart: npcConversationFocusRuntime.handleInteractionStart,
      playSoundEvent,
      playTreeBirthSfx,
      queueChangedSupplyPickupFlyItems,
      queueLandscapeCutEffect: (patch) => landscapeCutEffectRuntime.queue(patch),
      queueTreeRevivalLeafBurst: (snapshot) =>
        treeRevivalLeafBurstFrameRuntime.queueForNewlyRevivedTrees(snapshot),
      resolveGameplayActionPermission
    },
    soundEventIds: SOUND_EVENT_IDS,
    botNames: SANDBOTS_BOT_NAMES,
    config: {
      leafDenBusyNotice: LEAF_DEN_BUSY_NOTICE,
      restoredGrassMissionTargetCount: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
      waterGunFirstUsePromptFlag: WATER_GUN_FIRST_USE_PROMPT_FLAG,
      waterGunSprayDuration: SQUIRTLE_WATER_GUN_SPRAY_DURATION
    }
  });
  const gameplayPromptPreparationFrameRuntime = createGameplayPromptPreparationRuntimeBundle({
    controls,
    session,
    gameplay,
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
      buildSolarStationFieldMarkedGroundCells,
      getLeppaTreeSurroundingGroundCells,
      getWorldCellPlannerSelectedGroundCell,
      isOpeningLeppaTreeRequestActive
    },
    debug: debugInteractionFlow,
  });
  const gameplayPresentationSnapshotFrameRuntime =
    createGameplayPresentationSnapshotFrameRuntime({
      gameplayPromptPreparationFrameRuntime,
      gameplayRenderSnapshotFrameRuntime,
      placementFootprints: {
        solarStation: CONSTRUCTION_CONFIG.gridFootprints.solarStation,
        greenhouse: CONSTRUCTION_CONFIG.gridFootprints.greenhouse,
        campfire: CONSTRUCTION_CONFIG.gridFootprints.trainHouse,
        leafDenKit: CONSTRUCTION_CONFIG.gridFootprints.leafDenKit
      }
    });
  const fieldMoveImpactRuntime = createFieldMoveImpactRuntime({
    session,
    controls,
    carbonItemId: CARBON_ITEM_ID,
    companionAbilityResourcesRuntime,
    getNowMs: getRuntimeNowMs,
    groundActionFeedbackRuntime,
    hud,
    performGameplayHarvestAction: (...args) => playerActionRuntime.performHarvest(...args),
    playInstanceObjectSfx,
    supplyCounterPromptController
  });

  function playTreeBirthSfx() {
    audio.playTreeBirth();
  }

  function playGrowBotRevealSfx() {
    audio.playGrowBotReveal();
  }

  function updateFoundationBuildZoneCameraFocus(now) {
    return foundationBuildZoneCameraFocusRuntime.updateFrame({ now });
  }

  function getEncounterRepairBoxPosition(encounter) {
    return encounter?.repairBoxPosition || encounter?.repairPosition || null;
  }

  function startNextQueuedSquirtleWaterGunAction() {
    waterGunRuntime.startNextQueued();
  }

  const processWorldCellPlannerClick = worldCellPlannerInteractionRuntime.processClick;
  const getWorldCellPlannerSelectedGroundCell =
    worldCellPlannerInteractionRuntime.getSelectedGroundCell;

  mount?.addEventListener?.(
    "pointerdown",
    worldCellPlannerInteractionRuntime.handlePointerDown,
    { capture: true }
  );

  function frame(now) {
    // Timing and flow state.
    const {
      nextFrame,
      deltaTime,
      flowState: frameFlowState
    } = frameRuntime.beginFrame(now);
    let { cinematicActive, tutorialActive } = frameFlowState;
    const {
      introActive,
      tutorialMovementLocked,
      pokedexModalOpen,
      dialogueActive,
      skillLearnActive,
      scriptedInteractionActive,
      tutorialCameraFocus
    } = frameFlowState;

    if (session.actTwoRepairPlant && actTwoTutorial.isRepairPlantFixed()) {
      session.actTwoRepairPlant.fixed = true;
    }

    if (frameRuntime.updateInputAndCheckPaused(deltaTime)) {
      requestAnimationFrame(frame);
      return;
    }

    worldSceneSyncRuntime.updateEarlySceneFrame(deltaTime);

    // Opening, input blockers and camera controls.
    let {
      gameplayOpeningCameraFrame,
      gameplayOpeningCameraLocked,
      gameplayOpeningMovementLocked,
      placementPreviewActive,
      foundationBuildZoneCameraFocusActive,
      movementBlocked,
      shouldClearPendingActions,
      shouldClearMovementInput,
      canAdvanceRustlingGrass
    } = frameRuntime.beginGameplayFrameContext({
      now,
      deltaTime,
      flowState: frameFlowState
    });

    const { cameraTransitionActive } = gameplayInputFrameRuntime.update({
      now,
      deltaTime,
      flowState: frameFlowState,
      cinematicActive,
      movementBlocked,
      placementPreviewActive,
      dialogueActive,
      tutorialActive,
      skillLearnActive,
      scriptedInteractionActive,
      gameplayOpeningMovementLocked
    });

    const { committedEarlyFrame } = frameRuntime.updateEarlyGameplayControlFrame({
      nextFrame,
      deltaTime,
      introActive,
      shouldClearPendingActions,
      shouldClearMovementInput,
      canAdvanceRustlingGrass
    });
    if (committedEarlyFrame) {
      requestAnimationFrame(frame);
      return;
    }

    gameplayCameraFrameRuntime.updateInput({
      deltaTime,
      flowState: frameFlowState,
      gameplayOpeningCameraLocked,
      foundationBuildZoneCameraFocusActive,
      placementPreviewActive,
      tutorialActive
    });

    // Placement and player movement.
    let {
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    } = constructionPlacementFrameRuntime.updatePlacementControlsAndPreviews({
      now,
      deltaTime,
      movementBlocked
    });
    const { playerMovedThisFrame } = playerMovementFrameRuntime.update({
      deltaTime,
      now,
      flowState: frameFlowState,
      gameplayOpeningMovementLocked,
      gameplayOpeningCameraLocked,
      foundationBuildZoneCameraFocusActive,
      tutorialActive
    });
    naturePresentationFrameRuntime.updatePassiveEffects(deltaTime);

    // Gameplay actions and simulation.
    const firstTaughtActionFreedomWindow = syncFirstTaughtActionFreedomWindow(
      controls.storyState,
      { now }
    );
    const playerActionState = playerActionFrameRuntime.getActionState();
    const {
      activeMoveId,
      buildBlockEquipped
    } = playerActionState;
    const { freeBlockPreviewTarget } = constructionPlacementFrameRuntime.updateFreeBlockPreview({
      now,
      buildBlockEquipped,
      cinematicActive,
      gameplayOpeningMovementLocked,
      foundationBuildZoneCameraFocusActive,
      tutorialActive,
      pokedexModalOpen,
      skillLearnActive,
      scriptedInteractionActive,
      dialogueActive
    });
    playerActionFrameRuntime.update({
      now,
      flowState: frameFlowState,
      equipmentState: playerActionState
    });

    processFollowerCallFrame({
      controls,
      session,
      pushNotice: (notice) => hud.pushNotice(notice),
      playSoundEvent
    });

    // Simulation updates.
    worldSceneSyncRuntime.updateAmbientWorldFrame({ deltaTime, now });
    const {
      chopperBulbasaurRepairBoxInvestigationTarget
    } = companionFrameRuntime.update({
      deltaTime,
      now,
      activeMoveId,
      gameplayOpeningMovementLocked,
      cinematicActive,
      tutorialActive,
      pokedexModalOpen,
      dialogueActive,
      skillLearnActive,
      scriptedInteractionActive
    });

    if (cinematicActive) {
      actTwoSequence.update(deltaTime);
      cinematicActive = isGameFlow(gameFlowValues.CINEMATIC);
      tutorialActive = isGameFlow(gameFlowValues.TUTORIAL);
    }

    playerResourceCollectionFrameRuntime.update({
      now,
      cinematicActive,
      tutorialActive,
      pokedexModalOpen,
      skillLearnActive,
      scriptedInteractionActive
    });

    const gameplayCameraFrame = gameplayCameraFrameRuntime.updateFollow({
      now,
      cinematicActive,
      tutorialCameraFocus,
      foundationBuildZoneCameraFocusActive,
      gameplayOpeningCameraFrame,
      dialogueActive,
      cameraTransitionActive,
      scriptedInteractionActive
    });
    gameplayOpeningCameraFrame = gameplayCameraFrame.gameplayOpeningCameraFrame;

    const gameplayPresentationFrame = gameplayOpeningPresentationFrameRuntime.update({
      now,
      deltaTime,
      playerMovedThisFrame,
      gameplayOpeningCameraFrame,
      flowState: frameFlowState,
      cinematicActive,
      tutorialActive
    });
    gameplayOpeningCameraFrame = gameplayPresentationFrame.gameplayOpeningCameraFrame;
    const {
      gameplayOpeningHudHidden,
      currentFlowState
    } = gameplayPresentationFrame;
    // Prompt and render snapshot preparation.
    gameplayPresentationSnapshotFrameRuntime.update({
      nextFrame,
      now,
      deltaTime,
      gameplayOpeningCameraLocked,
      gameplayOpeningMovementLocked,
      gameplayOpeningHudHidden,
      currentFlowState,
      playerActionState,
      placementPreviews: {
        solarStationPlacementPreview,
        greenhousePlacementPreview,
        campfirePlacementPreview,
        leafDenKitPlacementPreview
      },
      freeBlockPreviewTarget,
      chopperBulbasaurRepairBoxInvestigationTarget,
      firstTaughtActionFreedomWindowActive: firstTaughtActionFreedomWindow.active
    });
    // Commit the frame after all snapshot channels are populated.
    frameRuntime.commitFrame();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
