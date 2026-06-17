import { createGameLoopFrameClock } from "./gameLoopFrameClock.js";
import {
  createGameLoopFlowStateReader,
  createGameLoopFrameRuntime
} from "./gameLoopFrameRuntime.js";
import { isRevealBoxBotVisible } from "./botRevealMotion.js";
import { createGameplayCameraRuntimeBundle } from "./camera/gameplayCameraRuntimeBundle.js";
import { createCompanionFacingRuntime } from "./companions/companionFacingRuntime.js";
import { createCompanionFrameRuntimeBundle } from "./companions/companionFrameRuntimeBundle.js";
import { createCompanionMotionRuntimeBundle } from "./companions/companionMotionRuntimeBundle.js";
import { createCompanionPresentationRuntimeBundle } from "./companions/companionPresentationRuntimeBundle.js";
import { createCompanionWorldSpeechCueRuntime } from "./companions/companionWorldSpeechCueRuntime.js";
import { processFollowerCallFrame } from "./companions/followerCallFrame.js";
import { createRepairBoxRevealOpeningRuntime } from "./companions/repairBoxRevealOpeningRuntime.js";
import { createFreeBlockBuildSessionRuntime } from "./construction/freeBlockBuildSessionRuntime.js";
import { createConstructionBlockerRuntimeBundle } from "./construction/constructionBlockerRuntimeBundle.js";
import { createConstructionBuildRuntimeBundle } from "./construction/constructionBuildRuntimeBundle.js";
import { createConstructionPlacementRuntimeBundle } from "./construction/constructionPlacementRuntimeBundle.js";
import { createConstructionPresentationRuntimeBundle } from "./construction/constructionPresentationRuntimeBundle.js";
import {
  cancelPendingWorkbenchPlacementIntent,
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
  buildSolarStationFieldMarkedGroundCells as buildSolarStationFieldMarkedGroundCellsWithConfig,
  doPlacementRectsOverlap,
  getPlacementPreviewFootprintWorldSize,
  getPlacementCollisionSize,
  getPlacementRect,
  getRotatedPlacementSize as getRotatedPlacementSizeWithConfig,
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
import { createFieldMoveRuntimeBundle } from "./fieldMoveRuntime/fieldMoveRuntimeBundle.js";
import { createFieldMoveSupportRuntimeBundle } from "./fieldMoveRuntime/fieldMoveSupportRuntimeBundle.js";
import { createGroundActionFeedbackRuntime } from "./groundActionFeedbackRuntime.js";
import {
  getActorDebugPosition,
  getInteractionDebugColliders as getInteractionDebugCollidersWithConfig
} from "./interactionDebugColliders.js";
import { getMissionTargetPositionsById as getMissionTargetPositionsByIdWithConfig } from "./missionTargetPositionLookup.js";
import { getYawToward } from "./modelFacing.js";
import { createMovementQuestRuntime } from "./movementQuestRuntime.js";
import { createNpcConversationFocusRuntime } from "./npcs/npcConversationFocusRuntime.js";
import { createPlayerGameplayActionRuntimeBundle } from "../player/playerActionRuntimeBundle.js";
import { createPlayerFrameRuntimeBundle } from "../player/playerFrameRuntimeBundle.js";
import { createGameplayPromptPreparationRuntimeBundle } from "./presentation/gameplayPromptPreparationRuntimeBundle.js";
import { createWorldSpacePresentationFrameRuntime } from "./presentation/worldSpacePresentationSnapshotFrame.js";
import {
  createGameplayRenderSnapshotFrameRuntime,
  createRenderSnapshotRuntimeBundle
} from "./presentation/renderSnapshotRuntimeBundle.js";
import { createSupplyFeedbackRuntimeBundle } from "./presentation/supplyFeedbackRuntimeBundle.js";
import { createNaturePresentationRuntimeBundle } from "./presentation/naturePresentationRuntimeBundle.js";
import { isWorldPositionWithinRenderDistance } from "./presentation/renderDistance.js";
import { createRepairBoxRevealFlashRuntime } from "./repairBoxRevealFlashRuntime.js";
import { createRunBreadcrumbPromptRuntime } from "./runBreadcrumbPromptRuntime.js";
import { createSnowstormFogRuntime } from "./snowstormFogRuntime.js";
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
  LANDSCAPE_CUT_EFFECT_DURATION,
  LANDSCAPE_CUT_EFFECT_LERP_PORTION,
  LANDSCAPE_CUT_EFFECT_LIFT,
  LANDSCAPE_CUT_EFFECT_POP_SCALE,
  PLAYER_COUNTER_PROMPT_DURATION_MS,
  TREE_REVIVAL_LEAF_BURST_BASE_HEIGHT,
  TREE_REVIVAL_LEAF_BURST_DRIFT,
  TREE_REVIVAL_LEAF_BURST_GRAVITY,
  TREE_REVIVAL_LEAF_BURST_HEIGHT_RANGE,
  TREE_REVIVAL_LEAF_BURST_SIZE_MAX,
  TREE_REVIVAL_LEAF_BURST_SIZE_MIN,
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
import { getSnowstormFogIntensity } from "../session/snowstormParticleField.js";
import { PLAYER_SPEED } from "../session/configurePlayerSpawner.js";
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
  RUINED_POKEMON_CENTER_GUIDE_POSITION,
  RUINED_POKEMON_CENTER_POSITION,
  WORKBENCH_INTERACT_DISTANCE,
  WORKBENCH_POSITION
} from "../../gameplayContent.js";
import {
  BULBASAUR_TALK_INTERACT_DISTANCE,
  findNearbyDestroyableInstantiatedObject,
  getLeppaTreeSurroundingGroundCells,
  treeFootprint,
  validateBuildingKitPlacement
} from "../../world/islandWorld.js";
import {
  BULBASAUR_IDLE_PATROL_RADIUS,
  SQUIRTLE_IDLE_PATROL_RADIUS
} from "./robotPatrolConfig.js";
import {
  applyInteractionObjectHighlight,
  clearInteractionObjectHighlights
} from "./interactionObjectHighlight.js";
import { syncFirstTaughtActionFreedomWindow } from "../story/earlyFreedomWindow.js";
import {
  createPlayerConstructionTerrainColliders,
  isPositionInsideTerrainColliderFootprint
} from "../gameplay/placementBlockers.js";
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
import { cancelPlacementPreview, hasActivePlacementPreview } from "../gameplay/contracts/placementRuntime.js";
import { createGameplayAudioRuntimeBundle } from "./audio/gameplayAudioRuntimeBundle.js";
import { createGameplayOpeningRuntime } from "./opening/createGameplayOpeningRuntime.js";
import {
  createGameplayInputFrameRuntime,
  createGameplayInputRuntime
} from "./input/createGameplayInputRuntime.js";


const SUPPLY_PICKUP_FLY_ITEM_IDS = Object.freeze(["wood", GEAR_ITEM_ID, LEAVES_ITEM_ID, CARBON_ITEM_ID]);
const GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT = [2.85, 1.7];
const WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX = 72;
const GREENHOUSE_PLACEMENT_GRID_FOOTPRINT = Object.freeze({ width: 5, height: 3 });
const SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT = [2.2, 2.2];
const SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT = Object.freeze({ width: 4, height: 4 });
const SOLAR_STATION_PLACEMENT_FOLLOW_DISTANCE = 2.85;
const TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT = [1.7, 1.45];
const TRAIN_HOUSE_PLACEMENT_GRID_FOOTPRINT = Object.freeze({ width: 3, height: 3 });
const LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT = [1.95, 1.45];
const LEAF_DEN_KIT_PLACEMENT_GRID_FOOTPRINT = Object.freeze({ width: 3, height: 3 });
const FREE_BLOCK_BUILD_GRID_CONFIG = Object.freeze({
  cellSize: 1,
  origin: Object.freeze({ x: -128, y: 0, z: -128 }),
  width: 256,
  height: 256,
  visualOffsetY: 0.03
});
const LEAF_DEN_BUILT_ROTATION_FOOTPRINT = [
  LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT[0] * 2,
  LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT[1] * 2
];
const PLACEMENT_ROTATION_STEP = Math.PI * 0.5;
const LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER = 3;
const LEAF_DEN_BUSY_NOTICE = "im busy, boss...";
const SOLAR_STATION_FIELD_MARKED_TILE_LIMIT = 81;
const SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT = 1200;
const BULBASAUR_WORKBENCH_GUIDE_START = [8.55, 0.02, -5.7];
const BULBASAUR_WORKBENCH_GUIDE_SPEED = 2.4;
const BULBASAUR_WORKBENCH_GUIDE_WAYPOINT_DISTANCE = 0.08;
const BULBASAUR_WORKBENCH_GUIDE_RAMP_COLLIDER_ID = "workbench-ramp-collider";
const BULBASAUR_WORKBENCH_GUIDE_RAMP_APPROACH_MARGIN = 0.92;
const BULBASAUR_WORKBENCH_GUIDE_SIDE_APPROACH_MARGIN = 1.22;
const CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET = [-1.12, 0, -0.86];
const CHARMANDER_FOLLOW_SPEED = PLAYER_SPEED;
const CHARMANDER_FOLLOW_DISTANCE = 1.28;
const TIMBURR_FOLLOW_SPEED = PLAYER_SPEED;
const TIMBURR_FOLLOW_DISTANCE = 1.62;
const SQUIRTLE_FOLLOW_SPEED = PLAYER_SPEED;
const SQUIRTLE_FOLLOW_DISTANCE = 1.18;
const BULBASAUR_FOLLOW_SPEED = PLAYER_SPEED;
const BULBASAUR_FOLLOW_DISTANCE = 1.46;
const COMPANION_FOLLOW_SLOT_ARRIVE_DISTANCE = 0.08;
const WOOD_COLLECT_POP_DURATION = 0.34;
const WOOD_COLLECT_POP_LIFT = 0.24;
const WOOD_COLLECT_POP_SCALE = 1.65;
const GEAR_PICKUP_PARTICLE_COUNT = 12;
const GEAR_PICKUP_PARTICLE_DURATION = 0.62;
const GEAR_PICKUP_PARTICLE_BASE_HEIGHT = 0.42;
const GEAR_PICKUP_PARTICLE_LIFT = 0.78;
const GEAR_PICKUP_PARTICLE_RADIUS = 0.72;
const GEAR_PICKUP_PARTICLE_SIZE = 0.32;
const WATER_GUN_FIRST_USE_PROMPT_FLAG = "waterGunFirstUsePromptDismissed";
const RUN_BREADCRUMB_PROMPT_DURATION_MS = 4200;
const SNOWSTORM_FOG_MAX_OPACITY = 0.54;
const SNOWSTORM_FOG_OPACITY_EASE = 6.2;
const GROUND_ACTION_FEEDBACK_DURATION_MS = 1000;
const FIELD_TOOL_TARGET_PULSE_DURATION_MS = 500;
const FIELD_TOOL_TARGET_PULSE_MIN_SCALE = 0.7;
const FIELD_TOOL_TARGET_PULSE_FLASH_BRIGHTNESS = 0.4;
const TREE_REVIVAL_LEAF_BURST_COUNT = 18;
const TREE_REVIVAL_LEAF_BURST_DURATION = 1.65;
const BULBASAUR_INTERACTION_GIZMO_DOT_COUNT = 36;
const BULBASAUR_INTERACTION_GIZMO_DOT_SIZE = 0.16;
const BULBASAUR_INTERACTION_RADIUS_GIZMO_CONFIG = Object.freeze({
  dotCount: BULBASAUR_INTERACTION_GIZMO_DOT_COUNT,
  dotSize: BULBASAUR_INTERACTION_GIZMO_DOT_SIZE,
  interactDistance: BULBASAUR_TALK_INTERACT_DISTANCE
});
const COMPANION_LOST_HINT_INITIAL_DELAY_MS = 5200;
const COMPANION_LOST_HINT_REPEAT_MS = 13000;
const COMPANION_LOST_HINT_DURATION_MS = 3400;
const CHOPPER_ATTENTION_CUE_INITIAL_DELAY_MS = 4200;
const CHOPPER_ATTENTION_CUE_REPEAT_MS = 11000;
const CHOPPER_ATTENTION_CUE_DURATION_MS = 2400;
const CHOPPER_ATTENTION_CUE_TEXT = "Hey!";
const BOT_PLAYER_ATTENTION_DISTANCE = 4.8;
const SQUIRTLE_WATER_GUN_HINT_TEXT = `Press LT to use ${SANDBOTS_ITEM_NAMES.hydroTool}.`;
const BULBASAUR_SWITCH_TO_SQUIRTLE_HINT_TEXT = `Press Left to change to ${SANDBOTS_BOT_NAMES.hydro}.`;
const SQUIRTLE_REASSEMBLY_PART_SCALE = 0.5;
const SQUIRTLE_MODEL_FACE_YAW_OFFSET = 0;
const BULBASAUR_MODEL_FACE_YAW_OFFSET = 0;
const CHARMANDER_MODEL_FACE_YAW_OFFSET = 0;
const ROBOT_MODEL_SCALE = 0.5;
const BULBASAUR_ROBOT_MODEL_SCALE = ROBOT_MODEL_SCALE * 1.3;
const CHARMANDER_MODEL_SCALE = 0.75;
const TIMBURR_MODEL_FACE_YAW_OFFSET = 0;
const TIMBURR_MODEL_SCALE = 0.58;
const ROBOT_REPAIR_BOX_FLOAT_HEIGHT = 0.74;
const ROBOT_REPAIR_BOX_BOB_HEIGHT = 0.06;
const ROBOT_REPAIR_BOX_BOB_SPEED = 2.2;
const ROBOT_REPAIR_BOX_SPIN_SPEED = Math.PI * 0.826;
const ROBOT_REPAIR_BOX_MODEL_PITCH_OFFSET = 0;
const ROBOT_REPAIR_BOX_OPEN_PITCH = Math.PI * 0.58;
const ROBOT_REPAIR_BOX_OPEN_ROLL = Math.PI * 0.08;
const ROBOT_REPAIR_BOX_OPEN_LIFT = 0.18;
const ROBOT_REPAIR_BOX_OPEN_BACKSTEP = 0.28;
const BULBASAUR_REVEAL_BOX_DURATION = 4.35;
const BULBASAUR_REVEAL_VISIBLE_PROGRESS = 0.72;
const BULBASAUR_REVEAL_BOX_OPEN_START_PROGRESS = 0.62;
const BULBASAUR_REVEAL_BOX_SHAKE_END_PROGRESS = 0.56;
const BULBASAUR_REVEAL_BOX_SPIN_ACCELERATION = Math.PI * 8.2;
const BULBASAUR_REVEAL_FLASH_PEAK_OPACITY = 1;
const BULBASAUR_REVEAL_BOT_FALL_HEIGHT = 1.82;
const BULBASAUR_REVEAL_BOT_FALL_END_PROGRESS = 0.96;
const BULBASAUR_REPAIR_BOX_RUSTLE_ROLL = 0.11;
const BULBASAUR_REPAIR_BOX_RUSTLE_PITCH = 0.08;
const BULBASAUR_REPAIR_BOX_RUSTLE_YAW = 0.12;
const BULBASAUR_REPAIR_BOX_RUSTLE_LIFT = 0.08;
const REPAIR_BOX_PROMPT_DISTANCE = 2.8;
const REPAIR_BOX_ACTIVE_TINT = Object.freeze([0.38, 1.72, 0.42]);
const REPAIR_BOX_ACTIVE_TINT_STRENGTH = 0.68;
const REPAIR_BOX_INACTIVE_ALPHA = 0.5;
const ROBOT_IDLE_PATROL_SPEED = 0.82;
const ROBOT_IDLE_PATROL_PAUSE_DURATION = 0.75;
const ROBOT_IDLE_PATROL_ARRIVE_DISTANCE = 0.08;
const CAMERA_DEBUG_ENABLED = (() => {
  try {
    return new URLSearchParams(globalThis.location?.search || "").get("cameraDebug") === "1";
  } catch {
    return false;
  }
})();



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

function getRotatedPlacementSize(size = [1, 1], yaw = 0) {
  return getRotatedPlacementSizeWithConfig(size, yaw, {
    placementRotationStep: PLACEMENT_ROTATION_STEP
  });
}

function buildSolarStationFieldMarkedGroundCells(placementTarget) {
  return buildSolarStationFieldMarkedGroundCellsWithConfig(placementTarget, {
    markedTileLimit: SOLAR_STATION_FIELD_MARKED_TILE_LIMIT
  });
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
    enabledDebug: CAMERA_DEBUG_ENABLED,
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
  } = createSupplyFeedbackRuntimeBundle({
    audio,
    camera,
    controls,
    gameplay,
    getNowMs: getRuntimeNowMs,
    hud,
    itemIds: SUPPLY_PICKUP_FLY_ITEM_IDS,
    session,
    worldCanvas,
    config: {
      playerCounterPromptDurationMs: PLAYER_COUNTER_PROMPT_DURATION_MS
    }
  });
  const freeBlockBuildSessionRuntime = createFreeBlockBuildSessionRuntime({
    session,
    defaultGridConfig: FREE_BLOCK_BUILD_GRID_CONFIG,
    initialBlockType: FREE_BLOCK_TYPES.WALL
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
  } = createNaturePresentationRuntimeBundle({
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
    },
    config: {
      gearPickupParticleBaseHeight: GEAR_PICKUP_PARTICLE_BASE_HEIGHT,
      gearPickupParticleCount: GEAR_PICKUP_PARTICLE_COUNT,
      gearPickupParticleDuration: GEAR_PICKUP_PARTICLE_DURATION,
      gearPickupParticleLift: GEAR_PICKUP_PARTICLE_LIFT,
      gearPickupParticleRadius: GEAR_PICKUP_PARTICLE_RADIUS,
      gearPickupParticleSize: GEAR_PICKUP_PARTICLE_SIZE,
      landscapeCutEffectDuration: LANDSCAPE_CUT_EFFECT_DURATION,
      landscapeCutEffectLerpPortion: LANDSCAPE_CUT_EFFECT_LERP_PORTION,
      landscapeCutEffectLift: LANDSCAPE_CUT_EFFECT_LIFT,
      landscapeCutEffectPopScale: LANDSCAPE_CUT_EFFECT_POP_SCALE,
      treeRevivalLeafBurstBaseHeight: TREE_REVIVAL_LEAF_BURST_BASE_HEIGHT,
      treeRevivalLeafBurstCount: TREE_REVIVAL_LEAF_BURST_COUNT,
      treeRevivalLeafBurstDrift: TREE_REVIVAL_LEAF_BURST_DRIFT,
      treeRevivalLeafBurstDuration: TREE_REVIVAL_LEAF_BURST_DURATION,
      treeRevivalLeafBurstGravity: TREE_REVIVAL_LEAF_BURST_GRAVITY,
      treeRevivalLeafBurstHeightRange: TREE_REVIVAL_LEAF_BURST_HEIGHT_RANGE,
      treeRevivalLeafBurstSizeMax: TREE_REVIVAL_LEAF_BURST_SIZE_MAX,
      treeRevivalLeafBurstSizeMin: TREE_REVIVAL_LEAF_BURST_SIZE_MIN,
      woodCollectPopDuration: WOOD_COLLECT_POP_DURATION,
      woodCollectPopLift: WOOD_COLLECT_POP_LIFT,
      woodCollectPopScale: WOOD_COLLECT_POP_SCALE
    }
  });
  const companionFacingRuntime = createCompanionFacingRuntime({
    session,
    offsets: {
      squirtle: SQUIRTLE_MODEL_FACE_YAW_OFFSET,
      charmander: CHARMANDER_MODEL_FACE_YAW_OFFSET,
      bulbasaur: BULBASAUR_MODEL_FACE_YAW_OFFSET
    }
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
        greenhouse: GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
        solarStation: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
        trainHouse: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
        houseKit: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
        houseBuilt: LEAF_DEN_BUILT_ROTATION_FOOTPRINT
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
  const companionWorldSpeechCueRuntime = createCompanionWorldSpeechCueRuntime({
    chopperCueSchedule: {
      initialDelayMs: CHOPPER_ATTENTION_CUE_INITIAL_DELAY_MS,
      repeatMs: CHOPPER_ATTENTION_CUE_REPEAT_MS,
      durationMs: CHOPPER_ATTENTION_CUE_DURATION_MS
    },
    companionLostHintSchedule: {
      initialDelayMs: COMPANION_LOST_HINT_INITIAL_DELAY_MS,
      repeatMs: COMPANION_LOST_HINT_REPEAT_MS,
      durationMs: COMPANION_LOST_HINT_DURATION_MS
    },
    getFlags: () => controls.storyState?.flags || {},
    getPlayerSkills: () => controls.playerSkills || {},
    getBulbasaurPosition: () => session.bulbasaurEncounter?.position,
    getSquirtlePosition: fieldMoveActorPositionRuntime.getSquirtleWorldPosition,
    isPlayerNearWorldPosition: worldSceneSyncRuntime.isPlayerNearWorldPosition,
    config: {
      chopperInteractDistance: POKEMON_TALK_INTERACT_DISTANCE + 0.45,
      chopperCueText: CHOPPER_ATTENTION_CUE_TEXT,
      restoreTargetCount: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
      squirtleHintText: SQUIRTLE_WATER_GUN_HINT_TEXT,
      bulbasaurHintText: BULBASAUR_SWITCH_TO_SQUIRTLE_HINT_TEXT
    }
  });
  const {
    bulbasaurWorkbenchGuideRuntime,
    companionFollowDirectionRuntime,
    companionFollowMovementRuntime,
    companionGroundPatrolFrameRuntime,
    companionIdleMotionRuntime
  } = createCompanionMotionRuntimeBundle({
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
    },
    config: {
      arriveDistance: COMPANION_FOLLOW_SLOT_ARRIVE_DISTANCE,
      bulbasaurFollowSpeed: BULBASAUR_FOLLOW_SPEED,
      bulbasaurFollowDistance: BULBASAUR_FOLLOW_DISTANCE,
      bulbasaurIdlePatrolRadius: BULBASAUR_IDLE_PATROL_RADIUS,
      bulbasaurModelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET,
      bulbasaurWorkbenchGuideRampApproachMargin: BULBASAUR_WORKBENCH_GUIDE_RAMP_APPROACH_MARGIN,
      bulbasaurWorkbenchGuideRampColliderId: BULBASAUR_WORKBENCH_GUIDE_RAMP_COLLIDER_ID,
      bulbasaurWorkbenchGuideSideApproachMargin: BULBASAUR_WORKBENCH_GUIDE_SIDE_APPROACH_MARGIN,
      bulbasaurWorkbenchGuideSpeed: BULBASAUR_WORKBENCH_GUIDE_SPEED,
      bulbasaurWorkbenchGuideStart: BULBASAUR_WORKBENCH_GUIDE_START,
      bulbasaurWorkbenchGuideWaypointDistance: BULBASAUR_WORKBENCH_GUIDE_WAYPOINT_DISTANCE,
      botPlayerAttentionDistance: BOT_PLAYER_ATTENTION_DISTANCE,
      robotIdlePatrolArriveDistance: ROBOT_IDLE_PATROL_ARRIVE_DISTANCE,
      robotIdlePatrolPauseDuration: ROBOT_IDLE_PATROL_PAUSE_DURATION,
      robotIdlePatrolSpeed: ROBOT_IDLE_PATROL_SPEED,
      squirtleFollowSpeed: SQUIRTLE_FOLLOW_SPEED,
      squirtleFollowDistance: SQUIRTLE_FOLLOW_DISTANCE,
      squirtleIdlePatrolRadius: SQUIRTLE_IDLE_PATROL_RADIUS,
      squirtleModelFaceYawOffset: SQUIRTLE_MODEL_FACE_YAW_OFFSET,
      workbenchPosition: WORKBENCH_POSITION
    }
  });
  const runBreadcrumbPromptRuntime = createRunBreadcrumbPromptRuntime({
    durationMs: RUN_BREADCRUMB_PROMPT_DURATION_MS
  });
  const repairBoxRevealFlashRuntime = createRepairBoxRevealFlashRuntime({
    mount,
    worldCanvas,
    camera,
    clamp01,
    peakOpacity: BULBASAUR_REVEAL_FLASH_PEAK_OPACITY,
    repairBoxFloatHeight: ROBOT_REPAIR_BOX_FLOAT_HEIGHT,
    getRepairBoxPosition: getEncounterRepairBoxPosition
  });
  const repairBoxRevealOpeningRuntime = createRepairBoxRevealOpeningRuntime({
    getRepairBoxPosition: getEncounterRepairBoxPosition,
    fallHeight: BULBASAUR_REVEAL_BOT_FALL_HEIGHT,
    defaultDuration: BULBASAUR_REVEAL_BOX_DURATION,
    defaultVisibleProgress: BULBASAUR_REVEAL_VISIBLE_PROGRESS,
    defaultFallEndProgress: BULBASAUR_REVEAL_BOT_FALL_END_PROGRESS,
    clamp01,
    flashRuntime: repairBoxRevealFlashRuntime,
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
      placementRotationStep: PLACEMENT_ROTATION_STEP,
      footprints: {
        houseBuilt: LEAF_DEN_BUILT_ROTATION_FOOTPRINT,
        houseKit: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
        solarStation: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
        trainHouse: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT
      },
      thermalCabinLabel: SANDBOTS_ITEM_NAMES.thermalCabin
    },
    solarStation: {
      getNowSeconds: getRuntimeNowSeconds
    }
  });
  const snowstormFogRuntime = createSnowstormFogRuntime({
    mount,
    getSnowstormFogIntensity,
    maxOpacity: SNOWSTORM_FOG_MAX_OPACITY,
    opacityEase: SNOWSTORM_FOG_OPACITY_EASE,
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
  } = createCompanionPresentationRuntimeBundle({
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
    },
    config: {
      bulbasaurModelScale: BULBASAUR_ROBOT_MODEL_SCALE,
      charmanderModelScale: CHARMANDER_MODEL_SCALE,
      interactionRadiusGizmoConfig: BULBASAUR_INTERACTION_RADIUS_GIZMO_CONFIG,
      repairBoxActiveTint: REPAIR_BOX_ACTIVE_TINT,
      repairBoxActiveTintStrength: REPAIR_BOX_ACTIVE_TINT_STRENGTH,
      repairBoxBobHeight: ROBOT_REPAIR_BOX_BOB_HEIGHT,
      repairBoxBobSpeed: ROBOT_REPAIR_BOX_BOB_SPEED,
      repairBoxFloatHeight: ROBOT_REPAIR_BOX_FLOAT_HEIGHT,
      repairBoxInactiveAlpha: REPAIR_BOX_INACTIVE_ALPHA,
      repairBoxInvestigationOffset: CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET,
      repairBoxModelPitchOffset: ROBOT_REPAIR_BOX_MODEL_PITCH_OFFSET,
      repairBoxOpenBackstep: ROBOT_REPAIR_BOX_OPEN_BACKSTEP,
      repairBoxOpenLift: ROBOT_REPAIR_BOX_OPEN_LIFT,
      repairBoxOpenPitch: ROBOT_REPAIR_BOX_OPEN_PITCH,
      repairBoxOpenRoll: ROBOT_REPAIR_BOX_OPEN_ROLL,
      repairBoxRevealBoxDuration: BULBASAUR_REVEAL_BOX_DURATION,
      repairBoxRevealBoxOpenStartProgress: BULBASAUR_REVEAL_BOX_OPEN_START_PROGRESS,
      repairBoxRevealBoxShakeEndProgress: BULBASAUR_REVEAL_BOX_SHAKE_END_PROGRESS,
      repairBoxRevealBoxSpinAcceleration: BULBASAUR_REVEAL_BOX_SPIN_ACCELERATION,
      repairBoxRustleLift: BULBASAUR_REPAIR_BOX_RUSTLE_LIFT,
      repairBoxRustlePitch: BULBASAUR_REPAIR_BOX_RUSTLE_PITCH,
      repairBoxRustleRoll: BULBASAUR_REPAIR_BOX_RUSTLE_ROLL,
      repairBoxRustleYaw: BULBASAUR_REPAIR_BOX_RUSTLE_YAW,
      repairBoxSpinSpeed: ROBOT_REPAIR_BOX_SPIN_SPEED,
      robotModelScale: ROBOT_MODEL_SCALE,
      squirtleReassemblyPartScale: SQUIRTLE_REASSEMBLY_PART_SCALE,
      timburrModelScale: TIMBURR_MODEL_SCALE
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
  } = createFieldMoveRuntimeBundle({
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
    botNames: SANDBOTS_BOT_NAMES,
    modelFaceYawOffsets: {
      bulbasaur: BULBASAUR_MODEL_FACE_YAW_OFFSET,
      charmander: CHARMANDER_MODEL_FACE_YAW_OFFSET,
      timburr: TIMBURR_MODEL_FACE_YAW_OFFSET
    },
    notices: {
      leafDenBusy: LEAF_DEN_BUSY_NOTICE
    }
  });
  const {
    constructionPlacementControlRuntime,
    constructionPlacementFrameRuntime,
    solarStationPowerRadiusRuntime
  } = createConstructionPlacementRuntimeBundle({
    controls,
    session,
    placementContracts: PLACEMENT_CONTRACTS,
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
    },
    config: {
      greenhouseFallbackFootprint: GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      greenhouseGridFootprint: GREENHOUSE_PLACEMENT_GRID_FOOTPRINT,
      leafDenKitFallbackFootprint: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
      leafDenKitGridFootprint: LEAF_DEN_KIT_PLACEMENT_GRID_FOOTPRINT,
      leafDenKitSolarStationRadiusMultiplier: LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER,
      markedTileLimit: SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT,
      placementRotationStep: PLACEMENT_ROTATION_STEP,
      solarStationFollowDistance: SOLAR_STATION_PLACEMENT_FOLLOW_DISTANCE,
      solarStationGridFootprint: SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT,
      solarStationPreviewFootprint: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
      trainHouseFallbackFootprint: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      trainHouseGridFootprint: TRAIN_HOUSE_PLACEMENT_GRID_FOOTPRINT,
      workbenchPosition: WORKBENCH_POSITION
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
  } = createCompanionFrameRuntimeBundle({
    session,
    controls,
    rendering,
    audio,
    callbacks: {
      isGameplayActive: () => isGameFlow(gameFlowValues.GAMEPLAY)
    },
    config: {
      bulbasaurModelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET,
      charmanderModelFaceYawOffset: CHARMANDER_MODEL_FACE_YAW_OFFSET,
      timburrModelFaceYawOffset: TIMBURR_MODEL_FACE_YAW_OFFSET,
      charmanderFollowSpeed: CHARMANDER_FOLLOW_SPEED,
      charmanderFollowDistance: CHARMANDER_FOLLOW_DISTANCE,
      guidePosition: RUINED_POKEMON_CENTER_GUIDE_POSITION,
      timburrFollowSpeed: TIMBURR_FOLLOW_SPEED,
      timburrFollowDistance: TIMBURR_FOLLOW_DISTANCE
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

  function cancelActivePlacementPreviews() {
    let canceled = false;

    for (const contract of PLACEMENT_CONTRACTS) {
      canceled =
        cancelPlacementPreview({
          session,
          storyState: controls.storyState,
          contract,
          playSoundEvent,
          hud,
          cancelPendingWorkbenchPlacementIntent,
          cancelSoundEventId: SOUND_EVENT_IDS.UI_CANCEL
        }) || canceled;
    }

    return canceled;
  }

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

  function playFieldMoveInvalidSfx() {
    audio.playFieldMoveInvalid();
  }

  const groundActionFeedbackRuntime = createGroundActionFeedbackRuntime({
    clamp01,
    playInvalidSfx: playFieldMoveInvalidSfx,
    feedbackDurationMs: GROUND_ACTION_FEEDBACK_DURATION_MS,
    fieldToolTargetPulseDurationMs: FIELD_TOOL_TARGET_PULSE_DURATION_MS,
    fieldToolTargetPulseMinScale: FIELD_TOOL_TARGET_PULSE_MIN_SCALE,
    fieldToolTargetPulseFlashBrightness: FIELD_TOOL_TARGET_PULSE_FLASH_BRIGHTNESS
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

  function getPlayerConstructionTerrainColliders() {
    return createPlayerConstructionTerrainColliders({
      session,
      storyState: controls.storyState,
      footprints: {
        greenhouse: GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
        solarStation: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
        trainHouse: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
        houseKit: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
        houseBuilt: LEAF_DEN_BUILT_ROTATION_FOOTPRINT
      }
    });
  }

  function getInteractionDebugColliders() {
    return getInteractionDebugCollidersWithConfig({
      session,
      storyState: controls.storyState,
      rendering,
      pokemonTalkInteractDistance: POKEMON_TALK_INTERACT_DISTANCE,
      workbenchInteractDistance: WORKBENCH_INTERACT_DISTANCE,
      bulbasaurTalkInteractDistance: BULBASAUR_TALK_INTERACT_DISTANCE
    });
  }

  function getMissionTargetPositionsById(targetId) {
    return getMissionTargetPositionsByIdWithConfig({
      targetId,
      session,
      workbenchPosition: WORKBENCH_POSITION,
      ruinedPokemonCenterPosition: RUINED_POKEMON_CENTER_POSITION,
      getFreeBlockBuildZoneCenterPosition: foundationBuildZoneRuntime.getBuildZoneCenterPosition
    });
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

  function updateGameplayPresentationFrame({
    now,
    deltaTime,
    playerMovedThisFrame,
    gameplayOpeningCameraFrame,
    frameFlowState,
    cinematicActive,
    tutorialActive
  }) {
    gameplayOpeningRuntime.updateShipAudio(now);

    updateFrameAudio({
      deltaTime,
      gameplayOpeningCameraFrame,
      now,
      playerMovedThisFrame
    });

    gameplayOpeningRuntime.updateHudReveal({
      now,
      gameplayActive: isGameFlow(gameFlowValues.GAMEPLAY)
    });

    return {
      gameplayOpeningCameraFrame: gameplayOpeningRuntime.getCameraFrame(),
      gameplayOpeningHudHidden: gameplayOpeningRuntime.isHudHidden(),
      currentFlowState: {
        ...frameFlowState,
        cinematicActive,
        tutorialActive,
        dialogueActive: gameplayDialogue.isActive()
      }
    };
  }

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
      buildBlockEquipped,
      fireEquipped,
      leafageEquipped,
      waterGunEquipped
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

    const gameplayPresentationFrame = updateGameplayPresentationFrame({
      now,
      deltaTime,
      playerMovedThisFrame,
      gameplayOpeningCameraFrame,
      frameFlowState,
      cinematicActive,
      tutorialActive
    });
    gameplayOpeningCameraFrame = gameplayPresentationFrame.gameplayOpeningCameraFrame;
    const {
      gameplayOpeningHudHidden,
      currentFlowState
    } = gameplayPresentationFrame;
    // Prompt and snapshot preparation.
    const gameplayPromptPreparationFrame = gameplayPromptPreparationFrameRuntime.update({
      now,
      gameplayOpeningMovementLocked,
      gameplayOpeningHudHidden,
      flowState: currentFlowState,
      equipmentState: {
        activeMoveId,
        waterGunEquipped,
        leafageEquipped,
        fireEquipped
      },
      placementPreviews: {
        solarStationPlacementPreview,
        greenhousePlacementPreview,
        campfirePlacementPreview,
        leafDenKitPlacementPreview
      },
      placementFootprints: {
        solarStation: SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT,
        greenhouse: GREENHOUSE_PLACEMENT_GRID_FOOTPRINT,
        campfire: TRAIN_HOUSE_PLACEMENT_GRID_FOOTPRINT,
        leafDenKit: LEAF_DEN_KIT_PLACEMENT_GRID_FOOTPRINT
      }
    });
    ({
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    } = gameplayPromptPreparationFrame);
    const {
      inputModalityState,
      transientNoticeRoute,
      playerCounterPromptText,
      pendingPlacementIntent,
      pendingPlacementPrompt,
      nearbyWorkbenchRotationTarget,
      workbenchRotationPrompt,
      destroyableObjectPrompt,
      nearbyHarvestTarget,
      nearbyInteractable,
      activeQuest,
      activeTask,
      activeSystemQuest,
      promptCopy,
      groundCellHighlightFrameState
    } = gameplayPromptPreparationFrame;

    // World-space UI and render preparation.
    gameplayRenderSnapshotFrameRuntime.update({
      nextFrame,
      now,
      deltaTime,
      gameplayOpeningCameraLocked,
      gameplayOpeningHudHidden,
      currentFlowState,
      activeMoveId,
      equipmentState: {
        buildBlockEquipped,
        waterGunEquipped,
        leafageEquipped
      },
      inputModalityState,
      placementPreviews: {
        solarStationPlacementPreview,
        greenhousePlacementPreview,
        campfirePlacementPreview,
        leafDenKitPlacementPreview
      },
      promptState: {
        pendingPlacementPrompt,
        workbenchRotationPrompt,
        destroyableObjectPrompt,
        transientNoticeRoute,
        playerCounterPromptText
      },
      freeBlockPreviewTarget,
      nearbyInteractable,
      nearbyWorkbenchRotationTarget,
      activeQuest,
      activeTask,
      activeSystemQuest,
      promptCopy,
      groundCellHighlightFrameState,
      chopperBulbasaurRepairBoxInvestigationTarget,
      firstTaughtActionFreedomWindowActive: firstTaughtActionFreedomWindow.active,
      promptSources: {
        pendingPlacementIntent,
        nearbyHarvestTarget
      }
    });
    // Commit the frame after all snapshot channels are populated.
    frameRuntime.commitFrame();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
