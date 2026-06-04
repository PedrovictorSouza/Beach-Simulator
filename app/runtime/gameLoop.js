import { createGameLoopFrameClock } from "./gameLoopFrameClock.js";
import { createGameLoopFrameRuntime } from "./gameLoopFrameRuntime.js";
import { createCameraDebugRuntime } from "./cameraDebugRuntime.js";
import { createChopperAttentionCueRuntime } from "./chopperAttentionCueRuntime.js";
import { createCompanionFollowDirectionRuntime } from "./companionFollowDirectionRuntime.js";
import { createCompanionLostHintRuntime } from "./companionLostHintRuntime.js";
import { createFoundationBuildZoneCameraFocusRuntime } from "./foundationBuildZoneCameraFocusRuntime.js";
import {
  resolveCameraInputPermissions,
  resolveGameplayActionPermission,
  resolveGameLoopBlockers,
  resolveGroundGuidanceVisibility,
  resolveNearbyGameplayQueryPermission,
  resolvePlayerMovementPermission,
  resolveWorldSpaceUiVisibility
} from "./gameLoopFramePolicies.js";
import { getBulbasaurInteractionRadiusGizmoBillboards } from "./bulbasaurInteractionRadiusGizmoBillboards.js";
import { createFieldMoveInvalidTargetPromptRuntime } from "./fieldMoveInvalidTargetPromptRuntime.js";
import { getFlowerArrangementBillboards } from "./flowerArrangementBillboards.js";
import { createGearPickupParticleRuntime } from "./gearPickupParticleRuntime.js";
import { getGrassPlayerBend } from "./grassPlayerBend.js";
import { createGroundActionFeedbackRuntime } from "./groundActionFeedbackRuntime.js";
import {
  createInteractionInfoBillboard,
  getWorkbenchInteractionParticleBillboards,
  POKEMON_CENTER_PC_INFO_ICON_OFFSET,
  WORKBENCH_INFO_ICON_OFFSET
} from "./interactionInfoBillboards.js";
import { createLandscapeCutEffectRuntime } from "./landscapeCutEffectRuntime.js";
import {
  getLeafDropBillboards,
  getLeafResourceBillboards
} from "./leafBillboards.js";
import {
  getLeppaTreeMusicNoteBillboards,
  updateLeppaTreeMusicNotes
} from "./leppaTreeMusicNotes.js";
import { getLeppaTreeMissionParticleBillboards } from "./leppaTreeMissionParticleBillboards.js";
import { createMissionTargetIndicatorBillboard } from "./missionTargetIndicatorBillboard.js";
import { createMovementQuestRuntime } from "./movementQuestRuntime.js";
import { createPlayerCounterPromptRuntime } from "./playerCounterPromptRuntime.js";
import { createRepairBoxMotionRuntime } from "./repairBoxMotionRuntime.js";
import { createRepairBoxRevealFlashRuntime } from "./repairBoxRevealFlashRuntime.js";
import { getRepairBoxRevealRayBillboards } from "./repairBoxRevealRayBillboards.js";
import { createRunBreadcrumbPromptRuntime } from "./runBreadcrumbPromptRuntime.js";
import { getRustlingGrassParticleBillboards } from "./rustlingGrassParticleBillboards.js";
import { getSavePointStarBillboards } from "./savePointStarBillboards.js";
import { createSnowstormFogRuntime } from "./snowstormFogRuntime.js";
import {
  getTallGrassInstanceScale,
  getTallGrassSway,
  getTallGrassYaw,
  TALL_GRASS_MIN_FOOTPRINT
} from "./tallGrassMotion.js";
import { applyTrainHouseDance } from "./trainHouseDance.js";
import { createTreeRevivalLeafBurstRuntime } from "./treeRevivalLeafBurstRuntime.js";
import { createWaterGunSfxBurstRuntime } from "./waterGunSfxBurstRuntime.js";
import { createWorkbenchRotationRuntime } from "./workbenchRotationRuntime.js";
import { createWoodCollectPopRuntime } from "./woodCollectPopRuntime.js";
import { createWorldCellPlannerClickRuntime } from "./worldCellPlannerClickRuntime.js";

import {
  BULBASAUR_LEAFAGE_ARRIVE_DISTANCE,
  BULBASAUR_LEAFAGE_ARC_HEIGHT,
  BULBASAUR_LEAFAGE_BURST_DURATION,
  BULBASAUR_LEAFAGE_BURST_PARTICLE_COUNT,
  BULBASAUR_LEAFAGE_BURST_RADIUS,
  BULBASAUR_LEAFAGE_CAST_DURATION,
  BULBASAUR_LEAFAGE_IMPACT_TIME,
  BULBASAUR_LEAFAGE_PARTICLE_COUNT,
  BULBASAUR_LEAFAGE_PARTICLE_SIZE_MAX,
  BULBASAUR_LEAFAGE_PARTICLE_SIZE_MIN,
  BULBASAUR_LEAFAGE_SPEED,
  BULBASAUR_LEAFAGE_STAND_DISTANCE,
  BULBASAUR_LEAFAGE_STREAM_WIDTH,
  CHARMANDER_CARBON_BAR_FILL_DEPTH_OFFSET,
  CHARMANDER_CARBON_BAR_HEIGHT,
  CHARMANDER_CARBON_BAR_WIDTH,
  CHARMANDER_CARBON_BAR_Y_OFFSET,
  CHARMANDER_CARBON_VISUAL_DECREASE_DURATION,
  CHARMANDER_CARBON_VISUAL_INCREASE_DURATION,
  CHARMANDER_FIRE_ARC_HEIGHT,
  CHARMANDER_FIRE_ARRIVE_DISTANCE,
  CHARMANDER_FIRE_BURST_DURATION,
  CHARMANDER_FIRE_BURST_PARTICLE_COUNT,
  CHARMANDER_FIRE_BURST_RADIUS,
  CHARMANDER_FIRE_CONE_RADIUS,
  CHARMANDER_FIRE_IMPACT_TIME,
  CHARMANDER_FIRE_NOISE_POSITION_AMOUNT,
  CHARMANDER_FIRE_NOISE_ROTATION_AMOUNT,
  CHARMANDER_FIRE_NOISE_STRENGTH,
  CHARMANDER_FIRE_PARTICLE_COUNT,
  CHARMANDER_FIRE_PARTICLE_LIFETIME_MAX,
  CHARMANDER_FIRE_PARTICLE_LIFETIME_MIN,
  CHARMANDER_FIRE_PARTICLE_SIZE_MAX,
  CHARMANDER_FIRE_PARTICLE_SIZE_MIN,
  CHARMANDER_FIRE_SPEED,
  CHARMANDER_FIRE_SPRAY_DURATION,
  CHARMANDER_FIRE_STAND_DISTANCE,
  SQUIRTLE_CHARGING_PARTICLE_COUNT,
  SQUIRTLE_CHARGING_PARTICLE_DURATION,
  SQUIRTLE_CHARGING_PARTICLE_RADIUS,
  SQUIRTLE_WATER_GUN_ARC_HEIGHT,
  SQUIRTLE_WATER_GUN_ARRIVE_DISTANCE,
  SQUIRTLE_WATER_GUN_BASE_LEVEL,
  SQUIRTLE_WATER_GUN_EVOLUTION_MAX_USES,
  SQUIRTLE_WATER_GUN_IMPACT_TIME,
  SQUIRTLE_WATER_GUN_MAX_SPEED_MULTIPLIER,
  SQUIRTLE_WATER_GUN_MIN_IMPACT_TIME,
  SQUIRTLE_WATER_GUN_MIN_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_SPEED,
  SQUIRTLE_WATER_GUN_SPLASH_DURATION,
  SQUIRTLE_WATER_GUN_SPLASH_PARTICLE_COUNT,
  SQUIRTLE_WATER_GUN_SPLASH_RADIUS,
  SQUIRTLE_WATER_GUN_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_STAND_DISTANCE,
  SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT,
  SQUIRTLE_WATER_GUN_STREAM_WIDTH,
  SQUIRTLE_WATER_GUN_USE_COUNT_FLAG,
  SQUIRTLE_WATER_GUN_USES_PER_LEVEL,
  SQUIRTLE_WATER_STAMINA_BAR_HEIGHT,
  SQUIRTLE_WATER_STAMINA_BAR_WIDTH,
  SQUIRTLE_WATER_STAMINA_COST,
  SQUIRTLE_WATER_STAMINA_MAX,
  SQUIRTLE_WATER_STAMINA_RECHARGE_DURATION,
  SQUIRTLE_WATER_STAMINA_VISUAL_DECREASE_DURATION,
  SQUIRTLE_WATER_STAMINA_VISUAL_INCREASE_DURATION,
  TIMBURR_BUILD_BLOCK_ARRIVE_DISTANCE,
  TIMBURR_BUILD_BLOCK_CAST_DURATION,
  TIMBURR_BUILD_BLOCK_IMPACT_TIME,
  TIMBURR_BUILD_BLOCK_SPEED,
  TIMBURR_BUILD_BLOCK_STAND_DISTANCE
} from "./fieldMoveRuntime/fieldMoveTuning.js";

import {
  applyWorkbenchGreenArrowCue,
  shouldShowWorkbenchGreenArrowCue
} from "./workbenchCueRuntime.js";

export {
  getWorkbenchInteractionParticleBillboards
} from "./interactionInfoBillboards.js";

export {
  applyTrainHouseDance
} from "./trainHouseDance.js";

export {
  applyWorkbenchGreenArrowCue,
  shouldShowWorkbenchGreenArrowCue
} from "./workbenchCueRuntime.js";

import {
  CAMPFIRE_WOOD_PILE_SIZE,
  FIELD_MOVE_INVALID_GROUND_CELL_RADIUS_FACTOR,
  LANDSCAPE_CUT_EFFECT_DURATION,
  LANDSCAPE_CUT_EFFECT_LERP_PORTION,
  LANDSCAPE_CUT_EFFECT_LIFT,
  LANDSCAPE_CUT_EFFECT_POP_SCALE,
  LEAF_RESOURCE_BILLBOARD_SIZE,
  LEAF_RESOURCE_BILLBOARD_Y_OFFSET,
  PLAYER_COUNTER_PROMPT_DURATION_MS,
  PLAYER_INTERACTION_WORLD_PROMPT_TARGET_IDS,
  TRAIN_HOUSE_MUSIC_FADE_DISTANCE,
  TRAIN_HOUSE_MUSIC_FULL_DISTANCE,
  TRAIN_HOUSE_MUSIC_MAX_VOLUME,
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

import {
  addUniqueMissionTargetPositions,
  normalizeMissionTargetPositions
} from "./missionTargetPositionUtils.js";

export {
  addUniqueMissionTargetPosition,
  addUniqueMissionTargetPositions,
  isMissionTargetPosition,
  normalizeMissionTargetPositions
} from "./missionTargetPositionUtils.js";

import {
  resolveMissionTargetAliasId,
  resolveMissionTargetIdsFromMissionCopy
} from "./missionTargetResolver.js";

export {
  resolveMissionTargetAliasId,
  resolveMissionTargetIdsFromMissionCopy
};

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

import {
  createFrameSnapshotController,
  setFrameWorldPrompt
} from "./frameSnapshotController.js";
import { createCameraZoomPresetController } from "./cameraZoomPresetController.js";
import { createPlacementCameraAssist } from "./placementCameraAssist.js";
import { updatePlayerDustParticles } from "../session/playerDustParticles.js";
import {
  getSnowstormBillboards,
  getSnowstormFogIntensity,
  updateSnowstormParticleField
} from "../session/snowstormParticleField.js";
import { ACT_TWO_PLAYER_SPEED } from "../session/configurePlayerSpawner.js";
import {
  getNatureRevivalBillboards,
  getNatureRevivalScale,
  updateNatureRevivalEffects
} from "../session/natureRevivalEffects.js";
import { getColliderGizmoBillboards } from "../session/colliderGizmos.js";
import { updateIntroRoomFrame } from "../scenes/introRoom/introRoomSequence.js";
import { updateChopperNpcActor } from "../session/chopperNpcActor.js";
import { createGameplayCameraDirector } from "./gameplayCameraDirector.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import {
  appendGameplayOpeningShipBillboards,
  getGameplayOpeningShipSceneObjects
} from "../session/gameplayOpeningShip.js";
import {
  BOULDER_SHADED_TALL_GRASS_BOULDER_POSITION,
  BOULDER_SHADED_TALL_GRASS_RADIUS,
  CARBON_ITEM_ID,
  GEAR_ITEM_ID,
  LEAVES_ITEM_ID,
  LEPPA_BERRY_ITEM_ID,
  LOG_CHAIR_ITEM_ID,
  POKEMON_TALK_INTERACT_DISTANCE,
  RUINED_POKEMON_CENTER_GUIDE_POSITION,
  RUINED_POKEMON_CENTER_POSITION,
  WORLD_LIMIT,
  WORKBENCH_INTERACT_DISTANCE,
  WORKBENCH_POSITION
} from "../../gameplayContent.js";
import {
  BULBASAUR_TALK_INTERACT_DISTANCE,
  buildLogChairPlacement,
  findNearbyDestroyableInstantiatedObject,
  getLeppaTreeSurroundingGroundCells,
  treeFootprint,
  validateBuildingKitPlacement
} from "../../world/islandWorld.js";
import {
  canUseCharmanderFireWithCarbon,
  CHARMANDER_FIRE_CARBON_USES_FLAG,
  CHARMANDER_FIRE_USES_PER_CARBON
} from "../../world/gameplayInteractions.js";
import {
  BULBASAUR_IDLE_PATROL_RADIUS,
  SQUIRTLE_IDLE_PATROL_RADIUS
} from "./robotPatrolConfig.js";
import { resolveBotAttentionFacing } from "./botAttentionFacing.js";
import { resolveTransientNoticeRoute } from "./contextualPromptNotice.js";
import {
  applyInteractionObjectHighlight,
  clearInteractionObjectHighlights
} from "./interactionObjectHighlight.js";
import { syncFirstTaughtActionFreedomWindow } from "../story/earlyFreedomWindow.js";
import {
  createPlayerConstructionPlacementBlockers,
  createPlayerConstructionTerrainColliders,
  isPositionInsideTerrainColliderFootprint,
  isPositionBlockedByTerrainColliders
} from "../gameplay/placementBlockers.js";
import { resolveWorkbenchPlacementPreviewVisual } from "../gameplay/placementPreviewVisual.js";
import { createGridSystem } from "../gameplay/gridBuildingSystem.js";
import {
  createFreeBlockBuildController,
  createFreeBlockBuildState,
  createRectangularFreeBlockBuildZone,
  FREE_BLOCK_TYPES,
  getFreeBlockBuildZoneProgress,
  resolveFreeBlockTargetCell
} from "../gameplay/freeBlockBuildSystem.js";
import {
  evaluateHabitatSiteChoice,
  formatHabitatSiteChoicePrompt
} from "../gameplay/habitatSiteChoiceContract.js";
import {
  COLONY_FEEDBACK_IDS,
  getColonyFeedbackNotice,
  getColonyFeedbackPlacementLabel,
  getColonyFeedbackPrompt,
  getColonyFeedbackWorldSpeech
} from "../gameplay/colonyFeedbackContracts.js";
import {
  resolveInputPrompt,
  resolvePlacementPreviewPrompt,
  resolvePlacementReadyPrompt,
  resolveWorkbenchRotationPrompt,
  UI_PROMPT_ACTION
} from "../ui/inputPromptResolver.js";
import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES,
  SANDBOTS_WORLD_TERMS
} from "../story/sandbotsLexicon.js";
import { formatResourcePickupPrompt } from "../story/resourcePurposeCatalog.js";
import { resolvePsxDistanceFogSettings } from "../rendering/psxDistanceFogConfig.js";
import { PLACEMENT_CONTRACTS } from "../gameplay/contracts/placementContracts.js";
import { cancelPlacementPreview, hasActivePlacementPreview } from "../gameplay/contracts/placementRuntime.js";
import { createGameplayAudioRuntime } from "./gameplayAudioRuntime.js";
import { createGameplayOpeningRuntime } from "./opening/createGameplayOpeningRuntime.js";
import { createGameplayInputRuntime } from "./input/createGameplayInputRuntime.js";


const LOG_CHAIR_PLACEMENT_PREVIEW_ALPHA = 0.42;
const BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT = 10;
const BOULDER_SHADED_TALL_GRASS_TASK_ID = "boulder-shaded-tall-grass";
const GROW_FIRST_HABITAT_TASK_ID = "grow-first-habitat";
const GROW_FIRST_HABITAT_OBJECTIVE_ID = "grow-four-plants";
const GROW_FIRST_HABITAT_MARKED_CELL_COUNT = 4;
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
const BUILDER_TUTORIAL_FOUNDATION_CENTER_CELL = Object.freeze({ x: 110, y: 100 });
const BUILDER_TUTORIAL_FOUNDATION_WIDTH = 6;
const BUILDER_TUTORIAL_FOUNDATION_HEIGHT = 4;
const BUILDER_TUTORIAL_FOUNDATION_SEARCH_RADIUS = 16;
const BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_DURATION_MS = 3000;
const BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_ZOOM = 6.4;
const BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_DISTANCE = 15.5;
const BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_HEIGHT = 1.45;
const BUILDER_TUTORIAL_FOUNDATION_ORIGIN_FLAG = "builderTutorialFoundationOriginCell";
const BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_FLAG = "builderTutorialFoundationCameraFocusZoneSignature";
const BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL = Object.freeze({
  x: Math.round(BUILDER_TUTORIAL_FOUNDATION_CENTER_CELL.x - BUILDER_TUTORIAL_FOUNDATION_WIDTH / 2),
  y: Math.round(BUILDER_TUTORIAL_FOUNDATION_CENTER_CELL.y - BUILDER_TUTORIAL_FOUNDATION_HEIGHT / 2)
});
const FOUNDATION_COMPLETE_GROUND_EFFECT_DURATION_MS = 3000;

function createBuilderTutorialFoundationBuildZone(originCell = BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL) {
  const zone = createRectangularFreeBlockBuildZone({
    id: "builder-tutorial-foundation",
    originCell,
    width: BUILDER_TUTORIAL_FOUNDATION_WIDTH,
    height: BUILDER_TUTORIAL_FOUNDATION_HEIGHT
  });

  return Object.freeze({
    ...zone,
    borderCells: zone.cells
  });
}   


function getBuilderTutorialFoundationZoneSignature(buildZone = null) {
  if (!buildZone?.originCell) {
    return "missing";
  }

  return [
    buildZone.originCell.x,
    buildZone.originCell.y,
    buildZone.width,
    buildZone.height
  ].join(":");
}

function buildBuilderTutorialFoundationCandidateOrigins() {
  const origins = [];
  for (let radius = 0; radius <= BUILDER_TUTORIAL_FOUNDATION_SEARCH_RADIUS; radius += 1) {
    for (let y = -radius; y <= radius; y += 1) {
      for (let x = -radius; x <= radius; x += 1) {
        if (Math.max(Math.abs(x), Math.abs(y)) !== radius) {
          continue;
        }

        origins.push({
          x: BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL.x + x,
          y: BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL.y + y
        });
      }
    }
  }

  return origins;
}

const LEAF_DEN_BUILT_ROTATION_FOOTPRINT = [
  LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT[0] * 2,
  LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT[1] * 2
];
const PLACEMENT_ROTATION_STEP = Math.PI * 0.5;
const WORKBENCH_OBJECT_ROTATE_DISTANCE = 3.2;
const WORKBENCH_OBJECT_ROTATE_TRIGGER_TILE_MARGIN = 1.425;
const LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER = 3;
const LEAF_DEN_CONSTRUCTION_CLOUD_COUNT = 18;
const LEAF_DEN_CONSTRUCTION_STAR_COUNT = 12;
const CONSTRUCTION_CLOUD_BURST_MAX_EFFECTS = 3;
const CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT = 14;
const CONSTRUCTION_CLOUD_BURST_STAR_COUNT = 10;
const LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_X = 1.48;
const LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_Z = 1.08;
const LEAF_DEN_CONSTRUCTION_CLOUD_BASE_Y = 0.42;
const LEAF_DEN_CONSTRUCTION_CLOUD_BOB = 0.3;
const DRY_GRASS_WORLD_PROMPT_TILE_REACH_FACTOR = 0.82;
const DRY_GRASS_WORLD_PROMPT_PATCH_REACH_FACTOR = 0.28;
const DRY_GRASS_HINT_INTERACT_DISTANCE = 2.2;
const LEAF_DEN_CONSTRUCTION_BAR_WIDTH = 2.5;
const LEAF_DEN_CONSTRUCTION_BAR_HEIGHT = 0.2;
const LEAF_DEN_CONSTRUCTION_BAR_Y = 2.55;
const LEAF_DEN_BUSY_NOTICE = "im busy, boss...";
const TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE = 0.68;
const DEAD_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE = 1.15;
const TREE_PLACEMENT_BLOCKER_MIN_SIZE = 0.9;
const DEAD_TREE_PLACEMENT_BLOCKER_MIN_SIZE = 1.35;
const LEPPA_TREE_PLACEMENT_BLOCKER_SIZE = [2.35, 2.35];
const LEPPA_TREE_PLACEMENT_BLOCKER_DEFAULT_CELL_SIZE = 1.425;
const SOLAR_STATION_FIELD_MARKED_TILE_LIMIT = 81;
const SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT = 1200;
const BULBASAUR_WORKBENCH_GUIDE_START = [8.55, 0.02, -5.7];
const BULBASAUR_WORKBENCH_GUIDE_SPEED = 2.4;
const BULBASAUR_WORKBENCH_GUIDE_WAYPOINT_DISTANCE = 0.08;
const BULBASAUR_WORKBENCH_GUIDE_RAMP_COLLIDER_ID = "workbench-ramp-collider";
const BULBASAUR_WORKBENCH_GUIDE_RAMP_APPROACH_MARGIN = 0.92;
const BULBASAUR_WORKBENCH_GUIDE_SIDE_APPROACH_MARGIN = 1.22;
const CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET = [-1.12, 0, -0.86];
const CHOPPER_BULBASAUR_REPAIR_BOX_SPEECH = "What is this?";
const BEE_FIELD_FLOWER_GROUP_ID = "water-gun-flower-field-0";
const BEE_FIELD_REPAIR_BOX_LOCKED_ALPHA = 0.5;
const BEE_FIELD_BEE_COUNT = 10;
const BEE_FIELD_BEE_SCALE = 0.15;
const BEE_FIELD_BEE_PATROL_RADIUS_X = 5.8;
const BEE_FIELD_BEE_PATROL_RADIUS_Z = 4.3;
const BEE_FIELD_BEE_BASE_HEIGHT = 1.04;
const BEE_FIELD_BEE_BOB_HEIGHT = 0.22;
const BEE_MODEL_FACE_YAW_OFFSET = Math.PI;
const CHARMANDER_FOLLOW_SPEED = ACT_TWO_PLAYER_SPEED;
const CHARMANDER_FOLLOW_DISTANCE = 1.28;
const CHARMANDER_CAMPFIRE_LIGHT_DISTANCE = 1.9;
const TIMBURR_FOLLOW_SPEED = ACT_TWO_PLAYER_SPEED;
const TIMBURR_FOLLOW_DISTANCE = 1.62;
const SQUIRTLE_FOLLOW_SPEED = ACT_TWO_PLAYER_SPEED;
const SQUIRTLE_FOLLOW_DISTANCE = 1.18;
const BULBASAUR_FOLLOW_SPEED = ACT_TWO_PLAYER_SPEED;
const BULBASAUR_FOLLOW_DISTANCE = 1.46;
const ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE = 1.12;
const INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE = 2.28;
const COMPANION_FOLLOW_FORMATION_ORDER = Object.freeze(["squirtle", "bulbasaur", "charmander", "timburr"]);
const COMPANION_FOLLOW_ACTIVE_MOVE_COMPANIONS = Object.freeze({
  waterGun: "squirtle",
  leafage: "bulbasaur",
  fire: "charmander",
  buildBlock: "timburr"
});
const COMPANION_FOLLOW_LINE_FIRST_DISTANCE = 1.18;
const COMPANION_FOLLOW_LINE_SLOT_SPACING = 1.18;
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
const CHARMANDER_FIRE_VISUAL_SCALE = 3;
const WATER_GUN_FIRST_USE_PROMPT_FLAG = "waterGunFirstUsePromptDismissed";
const WATER_GUN_FIRST_USE_PROMPT_TEXT = `Press LT to use ${SANDBOTS_BOT_NAMES.hydro}`;
const LEAFAGE_SWITCH_PROMPT_TEXT = `Press LT on dry ground, then <- / -> to select ${SANDBOTS_BOT_NAMES.grow}`;
const RUN_BREADCRUMB_PROMPT_DURATION_MS = 4200;
const SNOWSTORM_FOG_MAX_OPACITY = 0.54;
const SNOWSTORM_FOG_OPACITY_EASE = 6.2;
const LEAFAGE_USE_PROMPT_TEXT = "Use LT on green ground";
const LEAFAGE_INVALID_TARGET_PROMPT_TEXT = `Choose ${SANDBOTS_BOT_NAMES.hydro} to hydrate first`;
const LEAFAGE_INVALID_TARGET_PROMPT_DURATION_MS = 1600;
const REBIRTH_OF_NATURE_CELL_ID = "ground-110-82";
const REBIRTH_OF_NATURE_GHOST_TREE_ALPHA_MAX = 0.5;
const REBIRTH_OF_NATURE_GHOST_TREE_PULSE_SPEED = 0.004;
const REBIRTH_OF_NATURE_GHOST_TREE_SIZE = Object.freeze([1.32, 1.32]);
const REBIRTH_OF_NATURE_GHOST_TREE_TINT = Object.freeze([1, 0.18, 0.72]);
const REBIRTH_OF_NATURE_COMPLETE_FLAG = "rebirthOfNatureComplete";
const FIRE_INVALID_TARGET_PROMPT_TEXT = "Use fire on white ground";
const FIRE_INVALID_TARGET_PROMPT_DURATION_MS = 1600;
const GROUND_ACTION_FEEDBACK_DURATION_MS = 1000;
const FIELD_TOOL_TARGET_PULSE_DURATION_MS = 500;
const FIELD_TOOL_TARGET_PULSE_MIN_SCALE = 0.7;
const FIELD_TOOL_TARGET_PULSE_FLASH_BRIGHTNESS = 0.4;
const FREE_ROAM_RESTORATION_GRID_RADIUS_FACTOR = 3.2;
const FREE_ROAM_RESTORATION_GRID_MAX_CELLS = 24;
const TREE_REVIVAL_LEAF_BURST_COUNT = 18;
const TREE_REVIVAL_LEAF_BURST_DURATION = 1.65;
const FREE_BLOCK_DROP_SIZE = Object.freeze([0.78, 0.78]);
const FREE_BLOCK_DROP_PICKUP_RADIUS = 0.64;
const FREE_BLOCK_DROP_SPREAD = 0.22;
const CAMPFIRE_WOOD_PILE_OFFSETS = Object.freeze([
  [-0.36, 0.02, -0.16, -0.48],
  [0.34, 0.025, -0.12, 0.48],
  [-0.18, 0.03, 0.22, 0.08],
  [0.18, 0.035, 0.2, -0.16],
  [0, 0.045, -0.01, 0.82]
]);
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
const BULBASAUR_REVEAL_BOX_RAY_COUNT = 10;
const BULBASAUR_REVEAL_BOX_RAY_BASE_SIZE = 0.18;
const BULBASAUR_REVEAL_BOX_RAY_CHARGE_PROGRESS_MAX = 0.72;
const BULBASAUR_REVEAL_BOX_RAY_BILLBOARD_CONFIG = Object.freeze({
  count: BULBASAUR_REVEAL_BOX_RAY_COUNT,
  baseSize: BULBASAUR_REVEAL_BOX_RAY_BASE_SIZE,
  chargeProgressMax: BULBASAUR_REVEAL_BOX_RAY_CHARGE_PROGRESS_MAX
});
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
const PLAYER_MODEL_SCALE = 0.75;
const PLAYER_MODEL_FACE_YAW_OFFSET = 0;
const PLAYER_MODEL_TURN_SPEED = 14;
const PLAYER_WALK_LEG_CYCLE_SPEED = 25;
const PLAYER_WALK_LEG_ACCELERATION = 88;
const PLAYER_WALK_LEG_DECELERATION = 38;
const PLAYER_WALK_FOOT_KICK_STRIDE = 0.28;
const PLAYER_WALK_FOOT_KICK_LIFT = 0.2;
const PLAYER_WALK_FOOT_PENDULUM_ROLL = 0.42;
const PLAYER_WALK_ARM_BACK_OFFSET = 0.17;
const PLAYER_WALK_ARM_LIFT = 0.045;
const PLAYER_WALK_ARM_BACK_PITCH = -0.16;
const PLAYER_WALK_BODY_BOB = 0.075;
const PLAYER_JUMP_FLIP_DURATION = 0.58;
const PLAYER_JUMP_FLIP_ROTATION = Math.PI * 2;
const GRASS_OBJECT_COLLISION_ALPHA = 0.5;
const GRASS_OBJECT_COLLISION_BASE_RADIUS = 0.58;
const NATURE_PATCH_GRASS_MODEL_LOD_DISTANCE = 28;
const NATURE_PATCH_MODEL_PREPARE_DISTANCE = 48;
const NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE = 78;
const PLAYER_CONSTRUCTION_MODEL_PREPARE_DISTANCE = 58;
const LEPPA_TREE_DANCE_SWAY = 0.28;
const LEPPA_TREE_DANCE_SPEED = 0.0056;
const LEPPA_TREE_MISSION_PARTICLE_COUNT = 9;
const LEPPA_TREE_MISSION_PARTICLE_RADIUS = 0.72;
const LEPPA_TREE_MISSION_PARTICLE_BASE_HEIGHT = 0.62;
const LEPPA_TREE_MISSION_PARTICLE_HEIGHT = 1.64;
const LEPPA_TREE_MISSION_PARTICLE_BILLBOARD_CONFIG = Object.freeze({
  count: LEPPA_TREE_MISSION_PARTICLE_COUNT,
  radius: LEPPA_TREE_MISSION_PARTICLE_RADIUS,
  baseHeight: LEPPA_TREE_MISSION_PARTICLE_BASE_HEIGHT,
  height: LEPPA_TREE_MISSION_PARTICLE_HEIGHT
});
const SAVE_POINT_STAR_PARTICLE_COUNT = 10;
const SAVE_POINT_STAR_PARTICLE_RADIUS = 0.64;
const SAVE_POINT_STAR_PARTICLE_HEIGHT = 1.18;
const SAVE_POINT_STAR_PARTICLE_DURATION = 1.9;
const SAVE_POINT_STAR_BILLBOARD_CONFIG = Object.freeze({
  count: SAVE_POINT_STAR_PARTICLE_COUNT,
  radius: SAVE_POINT_STAR_PARTICLE_RADIUS,
  height: SAVE_POINT_STAR_PARTICLE_HEIGHT,
  duration: SAVE_POINT_STAR_PARTICLE_DURATION
});
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

function isVector3Like(value) {
  return value && value.length >= 3;
}

function getWrappedPlanarDelta(value, reference) {
  const numericValue = Number(value) || 0;
  const numericReference = Number(reference) || 0;
  let delta = numericValue - numericReference;

  if (!(WORLD_LIMIT > 0)) {
    return delta;
  }

  const period = WORLD_LIMIT * 2;
  if (delta > WORLD_LIMIT) {
    delta -= period;
  } else if (delta < -WORLD_LIMIT) {
    delta += period;
  }

  return delta;
}

function isWorldPositionWithinRenderDistance(position, referencePosition, distance) {
  if (!(distance > 0) || !isVector3Like(position) || !isVector3Like(referencePosition)) {
    return true;
  }

  const dx = getWrappedPlanarDelta(position[0], referencePosition[0]);
  const dz = getWrappedPlanarDelta(position[2], referencePosition[2]);
  return dx * dx + dz * dz <= distance * distance;
}

function easeOutCubic(value) {
  const progress = clamp01(value);
  return 1 - Math.pow(1 - progress, 3);
}

export function resolveCompanionFollowDistance({
  companionId,
  activeMoveId,
  defaultDistance,
  formationIndex = null
} = {}) {
  if (Number.isFinite(formationIndex)) {
    return COMPANION_FOLLOW_LINE_FIRST_DISTANCE +
      Math.max(0, Math.floor(formationIndex)) * COMPANION_FOLLOW_LINE_SLOT_SPACING;
  }

  if (activeMoveId === "waterGun") {
    if (companionId === "squirtle") {
      return ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }

    if (companionId === "bulbasaur") {
      return INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }
  }

  if (activeMoveId === "leafage") {
    if (companionId === "bulbasaur") {
      return ACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }

    if (companionId === "squirtle") {
      return INACTIVE_MOVE_COMPANION_FOLLOW_DISTANCE;
    }
  }

  return defaultDistance;
}

export function resolveCompanionFollowSpeed() {
  return ACT_TWO_PLAYER_SPEED;
}

function normalizeBuildBlockApproachDirection(targetPosition, sourcePosition) {
  if (!Array.isArray(sourcePosition)) {
    return null;
  }

  let deltaX = Number(sourcePosition?.[0] || 0) - Number(targetPosition?.[0] || 0);
  let deltaZ = Number(sourcePosition?.[2] || 0) - Number(targetPosition?.[2] || 0);
  let distance = Math.hypot(deltaX, deltaZ);

  if (distance < 0.001) {
    return null;
  }

  return [deltaX / distance, deltaZ / distance];
}

function addUniqueBuildBlockApproachDirection(directions, direction) {
  if (!Array.isArray(direction)) {
    return;
  }

  const key = `${direction[0].toFixed(3)}:${direction[1].toFixed(3)}`;
  if (directions.some((entry) => entry.key === key)) {
    return;
  }

  directions.push({ key, direction });
}

export function resolveTimburrBuildBlockApproachPosition({
  targetPosition,
  timburrPosition = null,
  playerPosition = null,
  standDistance = TIMBURR_BUILD_BLOCK_STAND_DISTANCE,
  isBlocked = null
} = {}) {
  if (!Array.isArray(targetPosition)) {
    return null;
  }

  const fallbackPosition = Array.isArray(playerPosition) ? playerPosition : [0, 0.04, 0];
  const preferredDirection =
    normalizeBuildBlockApproachDirection(targetPosition, timburrPosition) ||
    normalizeBuildBlockApproachDirection(targetPosition, fallbackPosition) ||
    [0, 1];
  const directions = [];
  addUniqueBuildBlockApproachDirection(directions, preferredDirection);
  addUniqueBuildBlockApproachDirection(directions, [-preferredDirection[1], preferredDirection[0]]);
  addUniqueBuildBlockApproachDirection(directions, [preferredDirection[1], -preferredDirection[0]]);
  addUniqueBuildBlockApproachDirection(directions, [-preferredDirection[0], -preferredDirection[1]]);
  addUniqueBuildBlockApproachDirection(directions, [1, 0]);
  addUniqueBuildBlockApproachDirection(directions, [-1, 0]);
  addUniqueBuildBlockApproachDirection(directions, [0, 1]);
  addUniqueBuildBlockApproachDirection(directions, [0, -1]);

  const resolvedStandDistance = Math.max(0, Number(standDistance) || 0);
  const candidates = directions.map(({ direction }) => ([
    Number(targetPosition[0] || 0) + direction[0] * resolvedStandDistance,
    0.04,
    Number(targetPosition[2] || 0) + direction[1] * resolvedStandDistance
  ]));

  if (typeof isBlocked !== "function") {
    return candidates[0] || null;
  }

  return candidates.find((candidate) => !isBlocked(candidate)) || candidates[0] || null;
}

export function resolveConstructionDisplacementPosition({
  targetPosition,
  playerPosition,
  cellSize = 1,
  isBlocked = null
} = {}) {
  if (!Array.isArray(targetPosition) || !Array.isArray(playerPosition)) {
    return null;
  }

  const preferredDirection =
    normalizeBuildBlockApproachDirection(targetPosition, playerPosition) ||
    [0, 1];
  const directions = [];
  addUniqueBuildBlockApproachDirection(directions, preferredDirection);
  addUniqueBuildBlockApproachDirection(directions, [-preferredDirection[1], preferredDirection[0]]);
  addUniqueBuildBlockApproachDirection(directions, [preferredDirection[1], -preferredDirection[0]]);
  addUniqueBuildBlockApproachDirection(directions, [-preferredDirection[0], -preferredDirection[1]]);
  addUniqueBuildBlockApproachDirection(directions, [1, 0]);
  addUniqueBuildBlockApproachDirection(directions, [-1, 0]);
  addUniqueBuildBlockApproachDirection(directions, [0, 1]);
  addUniqueBuildBlockApproachDirection(directions, [0, -1]);

  const resolvedCellSize = Math.max(0.1, Number(cellSize) || 1);
  const distances = [
    resolvedCellSize,
    resolvedCellSize * Math.SQRT2,
    resolvedCellSize * 2
  ];

  const candidates = [];
  for (const distance of distances) {
    for (const { direction } of directions) {
      candidates.push([
        Number(targetPosition[0] || 0) + direction[0] * distance,
        Number(playerPosition[1] || 0.04),
        Number(targetPosition[2] || 0) + direction[1] * distance
      ]);
    }
  }

  if (typeof isBlocked !== "function") {
    return candidates[0] || null;
  }

  return candidates.find((candidate) => !isBlocked(candidate)) || candidates[0] || null;
}

export function resolveTrainHouseMusicVolume({
  playerPosition,
  trainHousePosition,
  fullDistance = TRAIN_HOUSE_MUSIC_FULL_DISTANCE,
  fadeDistance = TRAIN_HOUSE_MUSIC_FADE_DISTANCE,
  maxVolume = TRAIN_HOUSE_MUSIC_MAX_VOLUME
} = {}) {
  if (!Array.isArray(playerPosition) || !Array.isArray(trainHousePosition)) {
    return 0;
  }

  const distance = Math.hypot(
    playerPosition[0] - trainHousePosition[0],
    playerPosition[2] - trainHousePosition[2]
  );
  if (!Number.isFinite(distance) || distance >= fadeDistance) {
    return 0;
  }

  if (distance <= fullDistance) {
    return maxVolume;
  }

  const proximity = 1 - ((distance - fullDistance) / Math.max(0.001, fadeDistance - fullDistance));
  const easedProximity = clamp01(proximity) * clamp01(proximity) * (3 - 2 * clamp01(proximity));
  return maxVolume * easedProximity;
}

export function shouldCompleteThermalCabinHomeBeat({
  thermalBotFollowing = false,
  thermalBotRegistered = false,
  thermalBotPosition,
  playerPosition,
  trainHousePosition,
  alreadyComplete = false,
  activationDistance = CHARMANDER_CAMPFIRE_LIGHT_DISTANCE
} = {}) {
  if (
    alreadyComplete ||
    (!thermalBotFollowing && !thermalBotRegistered) ||
    !Array.isArray(trainHousePosition)
  ) {
    return false;
  }

  const isNearTrainHouse = (position) => {
    if (!Array.isArray(position)) {
      return false;
    }

    const distance = Math.hypot(
      Number(position[0]) - Number(trainHousePosition[0]),
      Number(position[2]) - Number(trainHousePosition[2])
    );
    return Number.isFinite(distance) && distance <= activationDistance;
  };

  if (thermalBotFollowing && isNearTrainHouse(thermalBotPosition)) {
    return true;
  }

  return isNearTrainHouse(playerPosition);
}

function syncModelResourceInstances(resourceNodes = [], storyState = {}, deltaTime = 0) {
  for (const resourceNode of resourceNodes) {
    if (!resourceNode?.usesModelInstance) {
      continue;
    }

    resourceNode.offset = Array.isArray(resourceNode.position) ?
      [...resourceNode.position] :
      resourceNode.offset;
    resourceNode.active =
      Number(resourceNode.cooldown || 0) <= 0 &&
      (typeof resourceNode.activeWhen !== "function" || resourceNode.activeWhen(storyState));

    const spinYawSpeed = Number(resourceNode.spinYawSpeed || 0);
    if (resourceNode.active && Number.isFinite(spinYawSpeed) && spinYawSpeed !== 0) {
      resourceNode.yaw = Number(resourceNode.yaw || 0) + spinYawSpeed * Math.max(0, deltaTime);
    }
  }
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPlacementRect(position, size = [1, 1]) {
  const width = Math.max(0.01, Number(size?.[0]) || 1);
  const depth = Math.max(0.01, Number(size?.[1]) || 1);

  return {
    minX: position[0] - width * 0.5,
    maxX: position[0] + width * 0.5,
    minZ: position[2] - depth * 0.5,
    maxZ: position[2] + depth * 0.5
  };
}

function doPlacementRectsOverlap(a, b, gutter = 0.12) {
  return !(
    a.maxX - gutter <= b.minX + gutter ||
    a.minX + gutter >= b.maxX - gutter ||
    a.maxZ - gutter <= b.minZ + gutter ||
    a.minZ + gutter >= b.maxZ - gutter
  );
}

function getPlacementCollisionSize(placement, fallbackSize = [1, 1]) {
  if (
    Array.isArray(placement?.size) &&
    Number(placement.size[0]) > 0 &&
    Number(placement.size[1]) > 0
  ) {
    return placement.size;
  }

  return fallbackSize;
}

function normalizePlacementYaw(yaw = 0) {
  const tau = Math.PI * 2;
  return ((Number(yaw || 0) % tau) + tau) % tau;
}

function getRotatedPlacementSize(size = [1, 1], yaw = 0) {
  const width = Math.max(0.01, Number(size?.[0]) || 1);
  const depth = Math.max(0.01, Number(size?.[1]) || 1);
  const quarterTurn = Math.round(normalizePlacementYaw(yaw) / PLACEMENT_ROTATION_STEP) % 4;
  return quarterTurn % 2 === 1 ? [depth, width] : [width, depth];
}

function hasFinitePlacementBounds(bounds) {
  return Boolean(
    bounds &&
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.maxX) &&
    Number.isFinite(bounds.minZ) &&
    Number.isFinite(bounds.maxZ)
  );
}

function getActivePendingPlacementIntent(session, storyState = {}, inventory = {}) {
  const intent = session?.pendingPlacementIntent || null;
  if (!intent?.itemId || Number(inventory?.[intent.itemId] || 0) <= 0) {
    return null;
  }

  if (intent.itemId === "strawBed" && storyState?.flags?.strawBedPlacedInBulbasaurHabitat) {
    return null;
  }

  if (
    intent.itemId === "leafDenKit" &&
    intent.blockedReason === "needs-solar-station" &&
    storyState?.flags?.strawBedPlacedInBulbasaurHabitat &&
    session?.strawBed?.position
  ) {
    return {
      ...intent,
      blockedReason: null
    };
  }

  return intent;
}

export function hasPendingWorkbenchPlacementIntent(session) {
  const intent = session?.pendingPlacementIntent || null;
  return Boolean(intent?.source === "workbench" && intent.itemId);
}

export function cancelPendingWorkbenchPlacementIntent(session) {
  if (!hasPendingWorkbenchPlacementIntent(session)) {
    return null;
  }

  const intent = session.pendingPlacementIntent;
  session.pendingPlacementIntent = null;
  return intent;
}

function getPendingPlacementPrompt(intent, harvestTarget = null, inputModalityState = null) {
  if (!intent) {
    return "";
  }

  if (intent.itemId === "leafDenKit") {
    return intent.blockedReason === "needs-solar-station" ?
      getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.HOUSE_KIT_READY_NEEDS_SOLAR_STATION) :
      resolvePlacementReadyPrompt(
        getColonyFeedbackPlacementLabel(COLONY_FEEDBACK_IDS.HOUSE_KIT_READY_TO_PLACE),
        inputModalityState
      );
  }

  if (intent.itemId === "strawBed") {
    return harvestTarget?.strawBedPlacement?.canPlace ?
      resolvePlacementReadyPrompt(
        getColonyFeedbackPlacementLabel(COLONY_FEEDBACK_IDS.SOLAR_STATION_READY_TO_PLACE),
        inputModalityState
      ) :
      getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.SOLAR_STATION_READY_MOVE_TO_OPEN_TERRAIN);
  }

  return resolvePlacementReadyPrompt(`${intent.label || "Object"} ready`, inputModalityState);
}

function getPendingPlacementWorldPromptText(intent, harvestTarget = null, inputModalityState = null) {
  if (!intent) {
    return "";
  }

  if (intent.itemId === "leafDenKit" && intent.blockedReason === "needs-solar-station") {
    return getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_NEEDS_SOLAR_STATION);
  }

  if (intent.itemId === "strawBed" && !harvestTarget?.strawBedPlacement?.canPlace) {
    return getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_MOVE_TO_OPEN_TERRAIN);
  }

  return resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState);
}

function getPlayerInteractionWorldPromptText(inputModalityState = null) {
  const prompt = resolveInputPrompt(UI_PROMPT_ACTION.INTERACT, inputModalityState);
  const inputLabel = prompt.replace(/\s+Interact$/u, "").trim();

  return inputLabel ? `press ${inputLabel}` : "press input";
}

function getRunBreadcrumbWorldPromptText(inputModalityState = null) {
  const prompt = resolveInputPrompt(UI_PROMPT_ACTION.RUN, inputModalityState);
  const inputLabel = prompt.replace(/\s+Run$/u, "").trim();

  return inputLabel ? `press ${inputLabel} to run!` : "press input to run!";
}

function getFieldToolWorldPromptText(inputModalityState = null) {
  const inputLabel = resolveInputPrompt(UI_PROMPT_ACTION.FIELD_TOOL, inputModalityState).trim();

  return inputLabel && inputLabel !== "Unassigned" ? `Press ${inputLabel}` : "Press input";
}

function isDryGrassHydroMissionActive(activeQuest, storyState = {}, playerSkills = {}) {
  const flags = storyState?.flags || {};
  const restoredGrassCount = Number(flags.restoredGrassCount || 0);
  const activeDryGrassQuest = activeQuest?.id === "water-dry-grass";
  const activeBulbasaurDryGrassRequest =
    flags.bulbasaurDryGrassMissionAccepted &&
    !flags.bulbasaurDryGrassMissionComplete &&
    restoredGrassCount < BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT;

  return Boolean(
    playerSkills?.waterGun &&
    (
      activeDryGrassQuest ||
      activeBulbasaurDryGrassRequest
    )
  );
}

function findNearbyDryGrassWorldPromptTarget({
  playerPosition,
  groundGrassPatches = [],
  groundDeadInstances = [],
  groundPurifiedInstances = []
} = {}) {
  if (!Array.isArray(playerPosition)) {
    return null;
  }

  const groundCellById = new Map(
    [
      ...(groundDeadInstances || []),
      ...(groundPurifiedInstances || [])
    ]
      .filter((groundCell) => typeof groundCell?.id === "string")
      .map((groundCell) => [groundCell.id, groundCell])
  );
  let nearest = null;
  let nearestDistance = Infinity;

  for (const patch of groundGrassPatches || []) {
    if (patch?.state !== "dead") {
      continue;
    }

    const groundCell = groundCellById.get(patch.cellId);
    const targetPosition = Array.isArray(patch.position) ? patch.position : groundCell?.offset;

    if (
      !groundCell ||
      groundCell.active === false ||
      groundCell.purifiable === false ||
      !Array.isArray(targetPosition)
    ) {
      continue;
    }

    const distance = Math.hypot(
      playerPosition[0] - targetPosition[0],
      playerPosition[2] - targetPosition[2]
    );
    const tileReach =
      (groundCell.tileSpan || 0) * DRY_GRASS_WORLD_PROMPT_TILE_REACH_FACTOR;
    const patchReach =
      Math.max(Number(patch.size?.[0]) || 0, Number(patch.size?.[1]) || 0) *
        DRY_GRASS_WORLD_PROMPT_PATCH_REACH_FACTOR;
    const interactDistance = tileReach + patchReach;

    if (distance <= interactDistance && distance < nearestDistance) {
      nearest = {
        groundCell,
        patch,
        distance
      };
      nearestDistance = distance;
    }
  }

  return nearest;
}

function findNearbyDryGrassHintTarget({
  playerPosition,
  groundGrassPatches = [],
  leppaTree = null,
  groundDeadInstances = [],
  storyState = null
} = {}) {
  if (!Array.isArray(playerPosition)) {
    return null;
  }

  let nearest = null;
  let nearestDistance = Infinity;

  for (const patch of groundGrassPatches || []) {
    if (patch?.state !== "dead" || !Array.isArray(patch.position)) {
      continue;
    }

    const distance = Math.hypot(
      playerPosition[0] - patch.position[0],
      playerPosition[2] - patch.position[2]
    );
    const sizeReach = Math.max(
      Number(patch.size?.[0]) || 0,
      Number(patch.size?.[1]) || 0
    ) * 0.5;
    const interactDistance = DRY_GRASS_HINT_INTERACT_DISTANCE + sizeReach;

    if (distance <= interactDistance && distance < nearestDistance) {
      nearest = {
        patch,
        targetId: patch.id || patch.cellId || `dry-grass-${patch.position[0]}:${patch.position[2]}`,
        distance
      };
      nearestDistance = distance;
    }
  }

  if (isOpeningLeppaTreeRequestActive(storyState)) {
    const leppaTreeGroundCells = getLeppaTreeSurroundingGroundCells(
      leppaTree,
      groundDeadInstances
    );

    for (const groundCell of leppaTreeGroundCells) {
      const targetPosition = groundCell?.offset || groundCell?.position;
      if (!Array.isArray(targetPosition)) {
        continue;
      }

      const distance = Math.hypot(
        playerPosition[0] - targetPosition[0],
        playerPosition[2] - targetPosition[2]
      );
      const tileReach = (Number(groundCell.tileSpan) || 1.425) * 0.5;
      const interactDistance = DRY_GRASS_HINT_INTERACT_DISTANCE + tileReach;

      if (distance <= interactDistance && distance < nearestDistance) {
        nearest = {
          groundCell,
          targetId: `leppa-tree-tile:${groundCell.id || `${targetPosition[0]}:${targetPosition[2]}`}`,
          worldPosition: [
            targetPosition[0],
            (targetPosition[1] || 0) + 0.04,
            targetPosition[2]
          ],
          distance
        };
        nearestDistance = distance;
      }
    }
  }

  return nearest;
}

function buildSolarStationFieldMarkedGroundCells(placementTarget) {
  const bounds = placementTarget?.bounds;

  if (placementTarget?.showField === false || !hasFinitePlacementBounds(bounds)) {
    return [];
  }

  const gridStep = Math.max(0.25, Number(placementTarget?.gridStep) || 1.425);
  const cells = [];
  let rowIndex = 0;

  for (
    let z = bounds.minZ;
    z <= bounds.maxZ + gridStep * 0.25 && cells.length < SOLAR_STATION_FIELD_MARKED_TILE_LIMIT;
    z += gridStep
  ) {
    let columnIndex = 0;

    for (
      let x = bounds.minX;
      x <= bounds.maxX + gridStep * 0.25 && cells.length < SOLAR_STATION_FIELD_MARKED_TILE_LIMIT;
      x += gridStep
    ) {
      cells.push({
        id: `solar-station-field-${columnIndex}-${rowIndex}`,
        offset: [
          Number(x.toFixed(3)),
          0.02,
          Number(z.toFixed(3))
        ],
        surfaceY: 0.02,
        tileSpan: gridStep
      });
      columnIndex += 1;
    }

    rowIndex += 1;
  }

  return cells;
}

function normalizeGridFootprint(footprint = { width: 1, height: 1 }) {
  return {
    width: Math.max(1, Math.round(Number(footprint?.width) || 1)),
    height: Math.max(1, Math.round(Number(footprint?.height) || 1))
  };
}

function getRotatedGridFootprint(footprint = { width: 1, height: 1 }, yaw = 0) {
  const normalizedFootprint = normalizeGridFootprint(footprint);
  const quarterTurn = Math.abs(Math.round(Number(yaw || 0) / (Math.PI * 0.5))) % 4;

  if (quarterTurn % 2 === 1) {
    return {
      width: normalizedFootprint.height,
      height: normalizedFootprint.width
    };
  }

  return normalizedFootprint;
}

function buildPlacementPreviewFootprintCells(preview, {
  idPrefix,
  footprint,
  targetState
} = {}) {
  if (!preview?.snappedPosition) {
    return [];
  }

  const gridStep = Math.max(
    0.25,
    Number(preview.gridStep) ||
      Number(preview.gridConfig?.cellSize) ||
      1.425
  );
  const rotatedFootprint = getRotatedGridFootprint(footprint, preview.yaw);
  const originX = preview.snappedPosition[0] - ((rotatedFootprint.width - 1) * gridStep * 0.5);
  const originZ = preview.snappedPosition[2] - ((rotatedFootprint.height - 1) * gridStep * 0.5);
  const surfaceY = preview.snappedPosition[1] || 0.02;
  const cells = [];

  for (let row = 0; row < rotatedFootprint.height; row += 1) {
    for (let column = 0; column < rotatedFootprint.width; column += 1) {
      cells.push({
        id: `${idPrefix}-${column}-${row}`,
        offset: [
          Number((originX + column * gridStep).toFixed(3)),
          surfaceY,
          Number((originZ + row * gridStep).toFixed(3))
        ],
        surfaceY,
        tileSpan: gridStep,
        highlightTargetState: targetState
      });
    }
  }

  return cells;
}

function getPlacementPreviewFootprintWorldSize(preview, footprint) {
  const gridStep = Math.max(
    0.25,
    Number(preview?.gridStep) ||
      Number(preview?.gridConfig?.cellSize) ||
      1.425
  );
  const rotatedFootprint = getRotatedGridFootprint(footprint, preview?.yaw);

  return [
    rotatedFootprint.width * gridStep,
    rotatedFootprint.height * gridStep
  ];
}

function buildSolarStationPowerRadiusGroundCells({
  center,
  radius,
  gridConfig = null,
  gridStep = 1.425,
  idPrefix = "solar-station-power-radius"
} = {}) {
  if (!Array.isArray(center) || !(radius > 0)) {
    return [];
  }

  const centerX = Number(center[0]);
  const centerZ = Number(center[2]);
  if (!Number.isFinite(centerX) || !Number.isFinite(centerZ)) {
    return [];
  }

  const cellSize = Math.max(
    0.25,
    Number(gridConfig?.cellSize) ||
      Number(gridStep) ||
      1.425
  );
  const cells = [];

  const pushCell = (x, z, columnIndex, rowIndex) => {
    if (cells.length >= SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT) {
      return;
    }

    const dx = x - centerX;
    const dz = z - centerZ;
    if (dx * dx + dz * dz > radius * radius) {
      return;
    }

    cells.push({
      id: `${idPrefix}-${columnIndex}-${rowIndex}`,
      offset: [
        Number(x.toFixed(3)),
        Array.isArray(center) ? Number(center[1] || 0.02) : 0.02,
        Number(z.toFixed(3))
      ],
      surfaceY: Array.isArray(center) ? Number(center[1] || 0.02) : 0.02,
      tileSpan: cellSize,
      highlightTargetState: "powerRadius",
      highlightPulse: false
    });
  };

  if (
    Number.isFinite(Number(gridConfig?.origin?.x)) &&
    Number.isFinite(Number(gridConfig?.origin?.z)) &&
    Number.isInteger(gridConfig?.width) &&
    Number.isInteger(gridConfig?.height)
  ) {
    const originX = Number(gridConfig.origin.x);
    const originZ = Number(gridConfig.origin.z);
    const minCellX = clampNumber(
      Math.floor((centerX - radius - originX) / cellSize),
      0,
      gridConfig.width - 1
    );
    const maxCellX = clampNumber(
      Math.floor((centerX + radius - originX) / cellSize),
      0,
      gridConfig.width - 1
    );
    const minCellZ = clampNumber(
      Math.floor((centerZ - radius - originZ) / cellSize),
      0,
      gridConfig.height - 1
    );
    const maxCellZ = clampNumber(
      Math.floor((centerZ + radius - originZ) / cellSize),
      0,
      gridConfig.height - 1
    );

    for (let row = minCellZ; row <= maxCellZ; row += 1) {
      for (let column = minCellX; column <= maxCellX; column += 1) {
        pushCell(
          originX + column * cellSize + cellSize * 0.5,
          originZ + row * cellSize + cellSize * 0.5,
          column,
          row
        );
      }
    }

    return cells;
  }

  let rowIndex = 0;
  for (
    let z = centerZ - radius;
    z <= centerZ + radius && cells.length < SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT;
    z += cellSize
  ) {
    let columnIndex = 0;
    for (
      let x = centerX - radius;
      x <= centerX + radius && cells.length < SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT;
      x += cellSize
    ) {
      pushCell(x, z, columnIndex, rowIndex);
      columnIndex += 1;
    }
    rowIndex += 1;
  }

  return cells;
}

function getSolarStationPreviewPowerRadius(session, preview) {
  const modelScale = Number(
    session?.strawBedModelInstance?.solarStationFinalScale ||
    session?.strawBedModelInstance?.scale
  );

  if (Number.isFinite(modelScale) && modelScale > 0) {
    return modelScale * LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER;
  }

  const fallbackSize = getPlacementPreviewFootprintWorldSize(
    preview,
    SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT
  );
  return Math.max(fallbackSize[0], fallbackSize[1]) * LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER;
}

function buildSolarStationPreviewPowerRadiusGroundCells(session, preview) {
  if (!preview?.snappedPosition) {
    return [];
  }

  return buildSolarStationPowerRadiusGroundCells({
    center: preview.snappedPosition,
    radius: getSolarStationPreviewPowerRadius(session, preview),
    gridConfig: preview.gridConfig,
    gridStep: preview.gridStep,
    idPrefix: "solar-station-preview-power-radius"
  });
}

function buildPlacedSolarStationPowerRadiusGroundCells(session, storyState) {
  const powerPosition = getSolarStationPowerPosition(session, storyState);
  if (!powerPosition) {
    return [];
  }

  return buildSolarStationPowerRadiusGroundCells({
    center: powerPosition,
    radius: getSolarStationPowerRadius(session),
    gridConfig: session?.buildGridConfig,
    gridStep: session?.buildGridConfig?.cellSize,
    idPrefix: "solar-station-placed-power-radius"
  });
}

function getTreePlacementBlockerSize(treeModel, instance) {
  const rawFootprint = treeModel && instance ?
    treeFootprint(treeModel, instance) :
    0;
  const isDeadTree = instance?.alive === false;
  const footprintScale = isDeadTree ?
    DEAD_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE :
    TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE;
  const minSize = isDeadTree ?
    DEAD_TREE_PLACEMENT_BLOCKER_MIN_SIZE :
    TREE_PLACEMENT_BLOCKER_MIN_SIZE;
  const footprint = Number.isFinite(rawFootprint) && rawFootprint > 0 ?
    rawFootprint :
    minSize;
  const size = Math.max(
    minSize,
    footprint * footprintScale
  );

  return [size, size];
}

function getLeppaTreePlacementBlockerSize(session) {
  const footprint = session?.leppaTree?.footprint;
  const width = Math.max(1, Math.round(Number(footprint?.width) || 1));
  const height = Math.max(1, Math.round(Number(footprint?.height) || 1));
  if (width <= 1 && height <= 1) {
    return LEPPA_TREE_PLACEMENT_BLOCKER_SIZE;
  }

  const gridStep = Math.max(
    0.25,
    Number(session?.buildGridConfig?.cellSize) ||
      LEPPA_TREE_PLACEMENT_BLOCKER_DEFAULT_CELL_SIZE
  );

  return [
    Number((width * gridStep).toFixed(3)),
    Number((height * gridStep).toFixed(3))
  ];
}

function getWorldObjectPlacementBlockers(session) {
  const blockers = [];

  if (session?.palmModel && Array.isArray(session.palmInstances)) {
    for (const instance of session.palmInstances) {
      if (instance?.active === false || !Array.isArray(instance?.offset)) {
        continue;
      }

      blockers.push({
        id: instance.id ? `tree:${instance.id}` : "tree",
        kind: "tree",
        position: instance.offset,
        size: getTreePlacementBlockerSize(session.palmModel, instance)
      });
    }
  }

  if (Array.isArray(session?.leppaTree?.position)) {
    blockers.push({
      id: session.leppaTree.id ? `tree:${session.leppaTree.id}` : "tree:leppa-tree",
      kind: "tree",
      position: session.leppaTree.position,
      size: getLeppaTreePlacementBlockerSize(session)
    });
  }

  return blockers;
}

function getSolarStationPlacementBlockers(session, storyState) {
  const blockers = [];
  const flags = storyState?.flags || {};

  blockers.push(...createPlayerConstructionPlacementBlockers({
    session,
    storyState,
    footprints: {
      greenhouse: GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      solarStation: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
      trainHouse: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      houseKit: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
      houseBuilt: LEAF_DEN_BUILT_ROTATION_FOOTPRINT
    }
  }));
  blockers.push(...getWorldObjectPlacementBlockers(session));

  if (session.logChair?.position && flags.logChairPlaced) {
    blockers.push({
      position: session.logChair.position,
      size: getPlacementCollisionSize(session.logChair)
    });
  }

  if (session.dittoFlag?.position && flags.dittoFlagPlacedOnHouse) {
    blockers.push({
      position: session.dittoFlag.position,
      size: getPlacementCollisionSize(session.dittoFlag)
    });
  }

  if (session.challengeBoulder?.position && flags.boulderChallengeAvailable) {
    blockers.push({
      position: session.challengeBoulder.position,
      size: getPlacementCollisionSize(session.challengeBoulder, [1.82, 1.42])
    });
  }

  if (flags.leafDenInteriorEntered) {
    for (const furniture of session.leafDenFurniture || []) {
      if (!Array.isArray(furniture?.position)) {
        continue;
      }

      blockers.push({
        position: furniture.position,
        size: getPlacementCollisionSize(furniture)
      });
    }
  }

  return blockers;
}

function getTerrainColliderPlacementRect(collider) {
  if (!collider?.blocksPlayer || !Array.isArray(collider.position)) {
    return null;
  }

  const padding = Number(collider.padding || 0);
  const width = Math.max(0.01, Number(collider.size?.[0]) || 1) + padding * 2;
  const depth = Math.max(0.01, Number(collider.size?.[2]) || 1) + padding * 2;
  return getPlacementRect(collider.position, [width, depth]);
}

function doesPlacementOverlapTerrainCollider(placementRect, collider) {
  const colliderRect = getTerrainColliderPlacementRect(collider);
  return colliderRect ? doPlacementRectsOverlap(placementRect, colliderRect, 0) : false;
}

function isSolarStationPlacementBlocked(session, storyState, placementRect) {
  const hasObjectCollision = getSolarStationPlacementBlockers(session, storyState)
    .some((blocker) => {
      return doPlacementRectsOverlap(
        placementRect,
        getPlacementRect(blocker.position, blocker.size)
      );
    });

  if (hasObjectCollision) {
    return true;
  }

  return (session.elevatedTerrainColliders || [])
    .some((collider) => doesPlacementOverlapTerrainCollider(placementRect, collider));
}

function getSolarStationPowerPosition(session, storyState) {
  if (
    !storyState?.flags?.strawBedPlacedInBulbasaurHabitat ||
    !Array.isArray(session?.strawBed?.position)
  ) {
    return null;
  }

  return session.strawBed.position;
}

function getSolarStationPowerRadius(session) {
  const modelScale = Number(
    session?.strawBedModelInstance?.solarStationFinalScale ||
    session?.strawBedModelInstance?.scale
  );

  if (Number.isFinite(modelScale) && modelScale > 0) {
    return modelScale * LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER;
  }

  const fallbackSize = getPlacementCollisionSize(
    session?.strawBed,
    SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT
  );
  return Math.max(fallbackSize[0], fallbackSize[1]) * LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER;
}

function isInsideSolarStationPowerRadius(session, storyState, position) {
  const solarStationPosition = getSolarStationPowerPosition(session, storyState);
  if (!solarStationPosition || !Array.isArray(position)) {
    return false;
  }

  const distance = Math.hypot(
    position[0] - solarStationPosition[0],
    position[2] - solarStationPosition[2]
  );
  return distance <= getSolarStationPowerRadius(session);
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

function isRebirthOfNatureMissionActive(storyState) {
  return Boolean(
    storyState?.flags?.bulbasaurDryGrassRequestTurnedIn &&
    !storyState.flags[REBIRTH_OF_NATURE_COMPLETE_FLAG]
  );
}

function getRebirthOfNatureGroundCell(session) {
  return (
    session?.groundDeadInstances?.find?.((groundCell) => {
      return groundCell?.id === REBIRTH_OF_NATURE_CELL_ID;
    }) ||
    session?.groundPurifiedInstances?.find?.((groundCell) => {
      return groundCell?.id === REBIRTH_OF_NATURE_CELL_ID;
    }) ||
    null
  );
}

function getRebirthOfNatureGhostTreeAlpha(now) {
  const pulse = (Math.sin(now * REBIRTH_OF_NATURE_GHOST_TREE_PULSE_SPEED) + 1) * 0.5;
  return pulse * REBIRTH_OF_NATURE_GHOST_TREE_ALPHA_MAX;
}

function appendRebirthOfNatureGhostTree(session, storyState, now) {
  if (
    !isRebirthOfNatureMissionActive(storyState) ||
    !session?.leafageNativeTreeModel ||
    !Array.isArray(session.leafageNativeTreeInstances)
  ) {
    return;
  }

  const groundCell = getRebirthOfNatureGroundCell(session);
  if (!groundCell?.offset) {
    return;
  }

  session.leafageNativeTreeInstances.push({
    id: "rebirth-of-nature-tree-preview",
    offset: [
      groundCell.offset[0],
      (groundCell.surfaceY || 0) + 0.02,
      groundCell.offset[2]
    ],
    scale: getTallGrassInstanceScale(
      session.leafageNativeTreeModel,
      { size: REBIRTH_OF_NATURE_GHOST_TREE_SIZE },
      1
    ) * (session.leafageNativeTreeModelScale || 1),
    alpha: getRebirthOfNatureGhostTreeAlpha(now),
    tint: REBIRTH_OF_NATURE_GHOST_TREE_TINT,
    tintStrength: 0.86,
    yaw: session.leafageNativeTreeModelFaceYawOffset || 0,
    swayStrength: 0
  });
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
  const cameraDebugRuntime = createCameraDebugRuntime({
    enabled: CAMERA_DEBUG_ENABLED,
    mount
  });
  cameraDebugRuntime.attachGlobalListeners();
  const playerCounterPromptRuntime = createPlayerCounterPromptRuntime({
    durationMs: PLAYER_COUNTER_PROMPT_DURATION_MS
  });
  const fieldMoveInvalidTargetPromptRuntime = createFieldMoveInvalidTargetPromptRuntime({
    leafageDurationMs: LEAFAGE_INVALID_TARGET_PROMPT_DURATION_MS,
    fireDurationMs: FIRE_INVALID_TARGET_PROMPT_DURATION_MS
  });
  const worldCellPlannerClickRuntime = createWorldCellPlannerClickRuntime();
  const movementQuestRuntime = createMovementQuestRuntime({
    minimumMovementDistance: 0.0005,
    reportDistance: 0.04
  });
  const woodCollectPopRuntime = createWoodCollectPopRuntime({
    clamp01,
    duration: WOOD_COLLECT_POP_DURATION,
    lift: WOOD_COLLECT_POP_LIFT,
    scale: WOOD_COLLECT_POP_SCALE
  });
  const gearPickupParticleRuntime = createGearPickupParticleRuntime({
    clamp01,
    count: GEAR_PICKUP_PARTICLE_COUNT,
    duration: GEAR_PICKUP_PARTICLE_DURATION,
    baseHeight: GEAR_PICKUP_PARTICLE_BASE_HEIGHT,
    lift: GEAR_PICKUP_PARTICLE_LIFT,
    radius: GEAR_PICKUP_PARTICLE_RADIUS,
    size: GEAR_PICKUP_PARTICLE_SIZE
  });
  const treeRevivalLeafBurstRuntime = createTreeRevivalLeafBurstRuntime({
    clamp01,
    easeOutCubic,
    lerp,
    config: {
      count: TREE_REVIVAL_LEAF_BURST_COUNT,
      duration: TREE_REVIVAL_LEAF_BURST_DURATION,
      drift: TREE_REVIVAL_LEAF_BURST_DRIFT,
      gravity: TREE_REVIVAL_LEAF_BURST_GRAVITY,
      baseHeight: TREE_REVIVAL_LEAF_BURST_BASE_HEIGHT,
      heightRange: TREE_REVIVAL_LEAF_BURST_HEIGHT_RANGE,
      sizeMin: TREE_REVIVAL_LEAF_BURST_SIZE_MIN,
      sizeMax: TREE_REVIVAL_LEAF_BURST_SIZE_MAX
    }
  });
  const landscapeCutEffectRuntime = createLandscapeCutEffectRuntime({
    clamp01,
    easeOutCubic,
    lerp,
    config: {
      duration: LANDSCAPE_CUT_EFFECT_DURATION,
      lerpPortion: LANDSCAPE_CUT_EFFECT_LERP_PORTION,
      lift: LANDSCAPE_CUT_EFFECT_LIFT,
      popScale: LANDSCAPE_CUT_EFFECT_POP_SCALE
    }
  });
  const foundationBuildZoneCameraFocusRuntime = createFoundationBuildZoneCameraFocusRuntime({
    durationMs: BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_DURATION_MS,
    focusFlag: BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_FLAG
  });
  const companionLostHintRuntime = createCompanionLostHintRuntime({
    initialDelayMs: COMPANION_LOST_HINT_INITIAL_DELAY_MS,
    repeatMs: COMPANION_LOST_HINT_REPEAT_MS,
    durationMs: COMPANION_LOST_HINT_DURATION_MS
  });
  const chopperAttentionCueRuntime = createChopperAttentionCueRuntime({
    initialDelayMs: CHOPPER_ATTENTION_CUE_INITIAL_DELAY_MS,
    repeatMs: CHOPPER_ATTENTION_CUE_REPEAT_MS,
    durationMs: CHOPPER_ATTENTION_CUE_DURATION_MS
  });
  const companionFollowDirectionRuntime = createCompanionFollowDirectionRuntime();
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
  const workbenchRotationRuntime = createWorkbenchRotationRuntime({
    normalizePlacementYaw,
    getRotatedPlacementSize,
    getTargetSize: getWorkbenchRotationTargetSize,
    placementRotationStep: PLACEMENT_ROTATION_STEP
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

  const cameraZoomPresetController = createCameraZoomPresetController({
    camera,
    presets: cameraZoomPresets
  });
  const placementCameraAssist = createPlacementCameraAssist({
    camera,
    getGameplayPreset: () => cameraZoomPresetController.getCurrentPreset?.()
  });
  //

  // Controladores de sistemas relacionados ao gameplay.
  function getCurrentInputModalityState() {
    return gameplayInputRuntime.getFrame()?.inputModalityState || null;
  }
  const gameplayCameraDirector = createGameplayCameraDirector({
    camera,
    cameraOrbit
  });
  const fpsPanelController = createFpsPanelController(fpsPanel);
  const inputModalityPanelController = createInputModalityPanelController(inputModalityPanel);
  const repairBoxMotionRuntime = createRepairBoxMotionRuntime({
    floatHeight: ROBOT_REPAIR_BOX_FLOAT_HEIGHT,
    bobHeight: ROBOT_REPAIR_BOX_BOB_HEIGHT,
    bobSpeed: ROBOT_REPAIR_BOX_BOB_SPEED,
    spinSpeed: ROBOT_REPAIR_BOX_SPIN_SPEED
  });
  const waterGunSfxBurstRuntime = createWaterGunSfxBurstRuntime();
  const frameRuntime = createGameLoopFrameRuntime({
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readFlowState: readGameLoopFlowState,
    advanceElapsed: (deltaTime) => {
      repairBoxMotionRuntime.update(deltaTime);
    }
  });
  const getSfxVolumeScale = () => gameplay?.audioMixRuntime?.getSfxVolumeScale?.() ?? 1;
  const getMusicVolumeScale = () => gameplay?.audioMixRuntime?.getMusicVolumeScale?.() ?? 1;
  const playSoundEvent = (eventId, options) => {
    gameplay?.playSoundEvent?.(eventId, options);
  };

  const audio = createGameplayAudioRuntime({
    getSfxVolumeScale,
    getMusicVolumeScale,
    playSoundEvent
  });

  const gameplayInputRuntime = createGameplayInputRuntime({
    controls
  });

  const gameplayOpeningRuntime = createGameplayOpeningRuntime({
    gameplayCameraDirector,
    session,
    controls,
    gameplayUiVisibility,
    audio
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

  function getCompanionPositionConstructionBlockers(position) {
    return getPlayerConstructionTerrainColliders()
      .filter((collider) => isPositionInsideTerrainColliderFootprint(position, collider));
  }

  function isCompanionPositionBlockedByConstruction(position) {
    return getCompanionPositionConstructionBlockers(position).length > 0;
  }

  function tryMoveCompanionToPosition(companion, nextPosition) {
    if (isCompanionPositionBlockedByConstruction(nextPosition)) {
      return false;
    }

    companion.position = nextPosition;
    return true;
  }

  function cancelBlockedCompanionAction(actionName) {
    playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
    hud?.pushNotice?.(`${actionName} path is blocked.`);
  }

  function createDebugAreaCollider({
    id,
    position,
    radius,
    surfaceY = 0.08,
    blocksPlayer = false
  } = {}) {
    if (!id || !Array.isArray(position) || !(radius > 0)) {
      return null;
    }

    return {
      id,
      position: [position[0], surfaceY, position[2]],
      size: [radius * 2, 0.12, radius * 2],
      surfaceY: surfaceY + 0.08,
      blocksPlayer
    };
  }

  function getActorDebugPosition(actor) {
    const position =
      actor?.character?.getPosition?.() ||
      actor?.position ||
      actor?.offset ||
      null;
    return Array.isArray(position) ? position : null;
  }

  function getInteractionDebugColliders() {
    const colliders = [];
    const pushCollider = (config) => {
      const collider = createDebugAreaCollider(config);
      if (collider) {
        colliders.push(collider);
      }
    };

    for (const npcActor of session.npcActors || []) {
      if (rendering?.isNpcActive?.(npcActor, controls.storyState) === false) {
        continue;
      }

      pushCollider({
        id: `${npcActor.id || "npc"}:talk-trigger`,
        position: getActorDebugPosition(npcActor),
        radius: Number(npcActor.interactDistance) || POKEMON_TALK_INTERACT_DISTANCE,
        surfaceY: 0.1
      });
    }

    for (const interactable of session.interactables || []) {
      if (rendering?.isInteractableActive?.(interactable, controls.storyState) === false) {
        continue;
      }

      pushCollider({
        id: `${interactable.id || "object"}:interact-trigger`,
        position: interactable.position,
        radius: Number(interactable.interactDistance) || WORKBENCH_INTERACT_DISTANCE,
        surfaceY: 0.09
      });
    }

    for (const resourceNode of session.resourceNodes || []) {
      if (rendering?.isResourceNodeActive?.(resourceNode, controls.storyState) === false) {
        continue;
      }

      pushCollider({
        id: `${resourceNode.id || "resource"}:pickup-trigger`,
        position: resourceNode.position,
        radius: Number(resourceNode.pickupRadius || resourceNode.interactDistance) || 1.6,
        surfaceY: 0.07
      });
    }

    const growBotPosition =
      session.bulbasaurEncounter?.visible && Array.isArray(session.bulbasaurEncounter.position) ?
        session.bulbasaurEncounter.position :
        null;
    pushCollider({
      id: "grow-bot:talk-trigger",
      position: growBotPosition,
      radius: BULBASAUR_TALK_INTERACT_DISTANCE,
      surfaceY: 0.12
    });

    for (const drop of [
      ...(session.woodDrops || []),
      ...(session.fieldDrops || []),
      ...(session.leppaBerryDrops || [])
    ]) {
      pushCollider({
        id: `${drop.id || drop.itemId || "drop"}:pickup-trigger`,
        position: drop.position,
        radius: Number(drop.pickupRadius) || 1.1,
        surfaceY: 0.06
      });
    }

    return colliders;
  }

  function getNpcMissionTargetPosition(npcId) {
    const npcActor = session.npcActors?.find((actor) => actor.id === npcId);
    return getActorDebugPosition(npcActor);
  }

  function getCompanionMissionTargetPosition(companionId) {
    if (companionId === "squirtle" || companionId === "waterGun") {
      return session.actTwoSquirtle?.position ||
        session.actTwoSquirtle?.repairModuleInstance?.baseOffset ||
        session.actTwoSquirtle?.repairModuleInstance?.offset ||
        null;
    }

    if (companionId === "bulbasaur" || companionId === "leaf-helper" || companionId === "leafage") {
      return session.bulbasaurEncounter?.position ||
        session.bulbasaurEncounter?.repairPosition ||
        session.bulbasaurEncounter?.repairModuleInstance?.baseOffset ||
        null;
    }

    if (companionId === "charmander" || companionId === "fire") {
      return session.charmanderEncounter?.position ||
        session.charmanderEncounter?.repairPosition ||
        session.charmanderEncounter?.repairModuleInstance?.baseOffset ||
        null;
    }

    if (companionId === "timburr") {
      return session.timburrEncounter?.position ||
        session.timburrEncounter?.repairPosition ||
        session.timburrEncounter?.repairModuleInstance?.baseOffset ||
        null;
    }

    return null;
  }

  function getDryGrassMissionTargetPositions() {
    const patches = session.groundGrassPatches || [];
    const playerPosition = session.playerCharacter?.getPosition?.() || null;
    const targetPatches = [];

    for (const patch of patches) {
      if (!Array.isArray(patch?.position) || patch.state === "alive") {
        continue;
      }

      const distance = Array.isArray(playerPosition) ?
        Math.hypot(patch.position[0] - playerPosition[0], patch.position[2] - playerPosition[2]) :
        0;

      targetPatches.push({ patch, distance });
    }

    targetPatches.sort((left, right) => left.distance - right.distance);
    return targetPatches.map(({ patch }) => patch.position);
  }

  function getMissionTargetPositionsById(targetId) {
    const missionTargetId = resolveMissionTargetAliasId(targetId);
    if (!missionTargetId) {
      return [];
    }

    if (missionTargetId === "tangrowth") {
      return normalizeMissionTargetPositions(getNpcMissionTargetPosition("tangrowth"));
    }

    if (missionTargetId === "squirtle") {
      return normalizeMissionTargetPositions(getCompanionMissionTargetPosition("squirtle"));
    }

    if (missionTargetId === "leaf-helper") {
      return normalizeMissionTargetPositions(getCompanionMissionTargetPosition("bulbasaur"));
    }

    if (missionTargetId === "charmander") {
      return normalizeMissionTargetPositions(getCompanionMissionTargetPosition("charmander"));
    }

    if (missionTargetId === "timburr") {
      return normalizeMissionTargetPositions(getCompanionMissionTargetPosition("timburr"));
    }

    if (missionTargetId === "workbench" || missionTargetId === "workbench-campfire") {
      return normalizeMissionTargetPositions(WORKBENCH_POSITION);
    }

    if (missionTargetId === "revived-grass" || missionTargetId === "water-dry-tall-grass") {
      return getDryGrassMissionTargetPositions();
    }

    if (missionTargetId === "leppaTree" || missionTargetId === "revive-leppa-tree") {
      return normalizeMissionTargetPositions(session.leppaTree?.position);
    }

    if (missionTargetId === "ruined-pokemon-center" || missionTargetId === "new-challenges-in-pc") {
      return normalizeMissionTargetPositions(session.pokemonCenterPc?.position || RUINED_POKEMON_CENTER_POSITION);
    }

    if (missionTargetId === "foundation-wall") {
      return normalizeMissionTargetPositions(getFreeBlockBuildZoneCenterPosition());
    }

    return [];
  }

  function getTrackedMissionTargetPositions(storyState = {}) {
    const flags = storyState.flags || {};
    const taskIds = Array.isArray(flags.trackedTaskIds) ? flags.trackedTaskIds : [];
    const targetPositions = [];

    for (const taskId of taskIds) {
      if (taskId === "workbench-campfire" && !flags.campfireCrafted) {
        if (!flags.workbenchDiyRecipesReceived) {
          addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("leaf-helper"));
        }
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("workbench"));
      }

      if (taskId === "water-dry-tall-grass" && !flags.bulbasaurDryGrassMissionComplete) {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("water-dry-tall-grass"));
      }

      if (taskId === "revive-leppa-tree" && !flags.leppaTreeRevived) {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("revive-leppa-tree"));
      }

      if (
        (
          taskId === "bulbasaur-dry-grass-request" ||
          taskId === "bulbasaur-leafage-reward" ||
          taskId === "give-leppa-berry" ||
          taskId === "bulbasaur-straw-bed" ||
          taskId === "straw-bed-recipe"
        ) &&
        !flags.bulbasaurStrawBedRequestComplete
      ) {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("leaf-helper"));
      }

      if (taskId === "tangrowth-log-chair" && !flags.logChairReceived) {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("chopper"));
      }

      if (
        taskId === "leaf-den-furniture" &&
        Number(flags.leafDenFurniturePlacedCount || 0) >= 3 &&
        !flags.leafDenFurnitureRequestComplete
      ) {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("builder-bot"));
      }

      if (taskId === "charmander-celebration" && !flags.dittoFlagReceived) {
        addUniqueMissionTargetPositions(
          targetPositions,
          getMissionTargetPositionsById(flags.charmanderCelebrationSuggested ? "chopper" : "thermal-bot")
        );
      }

      if (taskId === "ruined-pokemon-center" || taskId === "new-challenges-in-pc") {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById(taskId));
      }
    }

    return targetPositions;
  }

  function resolveMissionCopyValue(value, storyState = {}) {
    if (typeof value === "function") {
      try {
        return value(storyState);
      } catch {
        return "";
      }
    }

    return typeof value === "string" ? value : "";
  }

  function getMissionTargetPositionsFromCopy(source, storyState = {}) {
    const targetPositions = [];
    const copyTargetIds = resolveMissionTargetIdsFromMissionCopy(
      resolveMissionCopyValue(source?.title, storyState),
      resolveMissionCopyValue(source?.description, storyState),
      resolveMissionCopyValue(source?.guidance, storyState),
      resolveMissionCopyValue(source?.label, storyState)
    );

    for (const targetId of copyTargetIds) {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById(targetId));
    }

    return targetPositions;
  }

  function getActiveQuestObjectiveCandidates(activeQuest) {
    const objectives = activeQuest?.objectives || [];
    const incompleteVisibleObjectives = objectives.filter((objective) => {
      return !objective.hiddenFromHud && (objective.current || 0) < (objective.required || 1);
    });
    if (incompleteVisibleObjectives.length) {
      return incompleteVisibleObjectives;
    }

    const visibleObjectives = objectives.filter((objective) => !objective.hiddenFromHud);
    if (visibleObjectives.length) {
      return visibleObjectives;
    }

    return objectives.filter((objective) => (objective.current || 0) < (objective.required || 1));
  }

  function getActiveQuestMissionTargetPositions(activeQuest, storyState = {}) {
    if (!activeQuest) {
      return [];
    }

    const targetPositions = [];
    if (activeQuest.id === "gather-first-supplies") {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("squirtle"));
    }

    for (const objective of getActiveQuestObjectiveCandidates(activeQuest)) {
      const beforeTargetCount = targetPositions.length;
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById(objective?.targetId));

      if (objective?.type === "TALK" && targetPositions.length === beforeTargetCount) {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsFromCopy(objective, storyState));
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsFromCopy(activeQuest, storyState));
      }
    }

    if (!targetPositions.length) {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsFromCopy(activeQuest, storyState));
    }

    return targetPositions;
  }

  function getMissionTargetPositions(activeQuest, storyState = {}) {
    const targetPositions = [];
    addUniqueMissionTargetPositions(targetPositions, getTrackedMissionTargetPositions(storyState));
    addUniqueMissionTargetPositions(targetPositions, getActiveQuestMissionTargetPositions(activeQuest, storyState));
    return targetPositions;
  }

  function getSnappedSolarStationPreviewPosition(preview) {
    const bounds = preview?.bounds;
    const position = Array.isArray(preview?.position) ?
      preview.position :
      [0, 0.02, 0];
    const gridConfig = preview?.gridConfig;

    if (
      Number.isFinite(Number(gridConfig?.cellSize)) &&
      gridConfig.cellSize > 0 &&
      Number.isFinite(Number(gridConfig?.origin?.x)) &&
      Number.isFinite(Number(gridConfig?.origin?.z)) &&
      Number.isInteger(gridConfig.width) &&
      Number.isInteger(gridConfig.height)
    ) {
      const cellSize = Number(gridConfig.cellSize);
      const originX = Number(gridConfig.origin.x);
      const originZ = Number(gridConfig.origin.z);
      const centerOffset = cellSize * 0.5;
      const minCellX = hasFinitePlacementBounds(bounds) ?
        Math.ceil((bounds.minX - originX - centerOffset) / cellSize) :
        0;
      const maxCellX = hasFinitePlacementBounds(bounds) ?
        Math.floor((bounds.maxX - originX - centerOffset) / cellSize) :
        gridConfig.width - 1;
      const minCellZ = hasFinitePlacementBounds(bounds) ?
        Math.ceil((bounds.minZ - originZ - centerOffset) / cellSize) :
        0;
      const maxCellZ = hasFinitePlacementBounds(bounds) ?
        Math.floor((bounds.maxZ - originZ - centerOffset) / cellSize) :
        gridConfig.height - 1;

      if (minCellX <= maxCellX && minCellZ <= maxCellZ) {
        const rawCellX = Math.floor((position[0] - originX) / cellSize);
        const rawCellZ = Math.floor((position[2] - originZ) / cellSize);
        const cellX = clampNumber(rawCellX, Math.max(0, minCellX), Math.min(gridConfig.width - 1, maxCellX));
        const cellZ = clampNumber(rawCellZ, Math.max(0, minCellZ), Math.min(gridConfig.height - 1, maxCellZ));

        return [
          Number((originX + cellX * cellSize + centerOffset).toFixed(4)),
          0.02,
          Number((originZ + cellZ * cellSize + centerOffset).toFixed(4))
        ];
      }
    }

    const gridStep = Math.max(0.25, Number(preview?.gridStep) || 1.425);

    if (!hasFinitePlacementBounds(bounds)) {
      return [position[0], 0.02, position[2]];
    }

    const snapAxis = (value, min, max) => {
      const snapped = min + Math.round((value - min) / gridStep) * gridStep;
      return clampNumber(snapped, min, max);
    };

    return [
      snapAxis(position[0], bounds.minX, bounds.maxX),
      0.02,
      snapAxis(position[2], bounds.minZ, bounds.maxZ)
    ];
  }

  function syncPlacementPreviewPositionToPlayer(preview, defaultForwardDistance = 0) {
    const playerPosition = session.playerCharacter?.getPosition?.();
    if (!preview?.active || !Array.isArray(playerPosition)) {
      return;
    }
    const playerX = Number(playerPosition[0]);
    const playerZ = Number(playerPosition[2]);
    if (!Number.isFinite(playerX) || !Number.isFinite(playerZ)) {
      return;
    }

    if (!Array.isArray(preview.followPlayerOffset)) {
      const position = Array.isArray(preview.position) ?
        preview.position :
        playerPosition;
      const positionX = Number(position[0]);
      const positionZ = Number(position[2]);
      const offset = [
        (Number.isFinite(positionX) ? positionX : playerX) - playerX,
        0,
        (Number.isFinite(positionZ) ? positionZ : playerZ) - playerZ
      ];
      const offsetLength = Math.hypot(offset[0], offset[2]);

      if (offsetLength < 0.35 && defaultForwardDistance > 0) {
        const movementAxes = camera.getMovementAxes();
        const forwardX = Number(movementAxes?.up?.[0]) || 0;
        const forwardZ = Number(movementAxes?.up?.[2]) || 0;
        const forwardLength = Math.hypot(forwardX, forwardZ) || 1;
        offset[0] = (forwardX / forwardLength) * defaultForwardDistance;
        offset[2] = (forwardZ / forwardLength) * defaultForwardDistance;
      }

      preview.followPlayerOffset = offset;
    }

    const nextPosition = [
      playerX + Number(preview.followPlayerOffset[0] || 0),
      Array.isArray(preview.position) ? Number(preview.position[1] || 0.02) : 0.02,
      playerZ + Number(preview.followPlayerOffset[2] || 0)
    ];

    if (hasFinitePlacementBounds(preview.bounds)) {
      nextPosition[0] = clampNumber(nextPosition[0], preview.bounds.minX, preview.bounds.maxX);
      nextPosition[2] = clampNumber(nextPosition[2], preview.bounds.minZ, preview.bounds.maxZ);
    }

    preview.position = nextPosition;
  }

  function updateSolarStationPlacementPreview(timeSeconds = 0) {
    const preview = session.strawBedPlacementPreview;
    if (!preview?.active) {
      if (
        session.strawBedModelInstance &&
        !controls.storyState.flags.strawBedPlacedInBulbasaurHabitat
      ) {
        session.strawBedModelInstance.active = false;
      }
      return null;
    }

    syncPlacementPreviewPositionToPlayer(preview, SOLAR_STATION_PLACEMENT_FOLLOW_DISTANCE);

    const snappedPosition = getSnappedSolarStationPreviewPosition(preview);
    const previewRect = getPlacementRect(
      snappedPosition,
      getPlacementPreviewFootprintWorldSize(preview, SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT)
    );
    const hasCollision = isSolarStationPlacementBlocked(
      session,
      controls.storyState,
      previewRect
    );

    preview.snappedPosition = snappedPosition;
    preview.valid = !hasCollision;
    preview.readyForConfirm = true;

    if (session.strawBedModelInstance) {
      const previewVisual = resolveWorkbenchPlacementPreviewVisual({
        valid: preview.valid,
        timeSeconds
      });
      const baseYaw =
        session.strawBedModelInstance.solarStationBaseYaw ??
        Number(session.strawBedModelInstance.yaw || 0);
      session.strawBedModelInstance.solarStationBaseYaw = baseYaw;
      session.strawBedModelInstance.offset = [
        snappedPosition[0],
        session.strawBedModelInstance.offset?.[1] ?? 0.02,
        snappedPosition[2]
      ];
      session.strawBedModelInstance.yaw = baseYaw + Number(preview.yaw || 0);
      session.strawBedModelInstance.active = true;
      session.strawBedModelInstance.alpha = previewVisual.alpha;
      session.strawBedModelInstance.tint = previewVisual.tint;
      session.strawBedModelInstance.tintStrength = previewVisual.tintStrength;
    }

    return preview;
  }

  function cancelPendingWorkbenchPlacementIntentWithNotice() {
    const canceledIntent = cancelPendingWorkbenchPlacementIntent(session);
    if (!canceledIntent) {
      return false;
    }

    playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
    hud?.pushNotice?.(`${canceledIntent.label || "Workbench object"} placement canceled.`);
    return true;
  }

  function rotateActivePlacementPreview(direction) {
    const steps = Math.trunc(Number(direction || 0));
    if (steps === 0) {
      return false;
    }

    let rotated = false;
    const rotatePreview = (preview) => {
      if (!preview?.active) {
        return;
      }

      preview.yaw = normalizePlacementYaw(Number(preview.yaw || 0) + steps * PLACEMENT_ROTATION_STEP);
      preview.readyForConfirm = false;
      rotated = true;
    };

    rotatePreview(session.strawBedPlacementPreview);
    rotatePreview(session.greenhousePlacementPreview);
    rotatePreview(session.campfirePlacementPreview);
    rotatePreview(session.leafDenKitPlacementPreview);

    if (rotated) {
      playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE);
      hud?.pushNotice?.("Preview rotated.");
    }

    return rotated;
  }

  function getRotatableWorkbenchPlacementCandidates() {
    const flags = controls.storyState?.flags || {};
    const candidates = [];

    if (session.strawBed?.position && flags.strawBedPlacedInBulbasaurHabitat) {
      candidates.push({
        kind: "solarStation",
        label: "Solar Station",
        placement: session.strawBed,
        fallbackSize: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
        rotateSize: false
      });
    }

    if (session.campfire?.position && flags.campfireSpatOut) {
      candidates.push({
        kind: "trainHouse",
        label: SANDBOTS_ITEM_NAMES.thermalCabin,
        placement: session.campfire,
        fallbackSize: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
        rotateSize: true
      });
    }

    if (session.leafDen?.position && (flags.leafDenKitPlaced || flags.leafDenBuilt)) {
      const houseSize = flags.leafDenBuilt ?
        LEAF_DEN_BUILT_ROTATION_FOOTPRINT :
        LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT;
      candidates.push({
        kind: "house",
        label: "House",
        placement: session.leafDen,
        fallbackSize: houseSize,
        sizeOverride: houseSize,
        rotateSize: true
      });
    }

    for (const playerHouse of session.playerHouses || []) {
      if (!Array.isArray(playerHouse?.position)) {
        continue;
      }

      candidates.push({
        kind: `playerHouse:${playerHouse.id}`,
        label: "House",
        placement: playerHouse,
        fallbackSize: LEAF_DEN_BUILT_ROTATION_FOOTPRINT,
        sizeOverride: LEAF_DEN_BUILT_ROTATION_FOOTPRINT,
        rotateSize: true
      });
    }

    return candidates;
  }

  function getWorkbenchRotationTargetSize(target) {
    if (Array.isArray(target?.sizeOverride)) {
      return [...target.sizeOverride];
    }

    return getPlacementCollisionSize(target?.placement, target?.fallbackSize || [1, 1]);
  }

  function getWorkbenchRotationTargetDistance(playerPosition, target) {
    const position = target?.placement?.position;
    if (!Array.isArray(playerPosition) || !Array.isArray(position)) {
      return Number.POSITIVE_INFINITY;
    }

    const size = getWorkbenchRotationTargetSize(target);
    const halfX = Math.max(0.01, Number(size[0]) || 1) * 0.5;
    const halfZ = Math.max(0.01, Number(size[1]) || 1) * 0.5;
    const dx = Math.max(0, Math.abs(playerPosition[0] - position[0]) - halfX);
    const dz = Math.max(0, Math.abs(playerPosition[2] - position[2]) - halfZ);
    return Math.hypot(dx, dz);
  }

  function getWorkbenchRotationTriggerDistance() {
    const cellSize = Number(session.buildGridConfig?.cellSize);
    const tileMargin = Number.isFinite(cellSize) && cellSize > 0 ?
      cellSize :
      WORKBENCH_OBJECT_ROTATE_TRIGGER_TILE_MARGIN;
    return WORKBENCH_OBJECT_ROTATE_DISTANCE + tileMargin;
  }

  function getNearestRotatableWorkbenchPlacement() {
    const playerPosition = session.playerCharacter?.getPosition?.();
    if (!Array.isArray(playerPosition)) {
      return null;
    }

    const candidates = getRotatableWorkbenchPlacementCandidates();
    return candidates.reduce((nearest, candidate) => {
      const position = candidate.placement?.position;
      if (!Array.isArray(position)) {
        return nearest;
      }

      const distance = getWorkbenchRotationTargetDistance(playerPosition, candidate);
      if (!Number.isFinite(distance) || distance > getWorkbenchRotationTriggerDistance()) {
        return nearest;
      }
      if (!nearest || distance < nearest.distance) {
        return { ...candidate, distance };
      }
      return nearest;
    }, null);
  }

  function getSelectedRotatableWorkbenchPlacement() {
    return workbenchRotationRuntime.getSelectedTarget(
      getRotatableWorkbenchPlacementCandidates(),
      {
        isTargetValid: (target) => {
          const playerPosition = session.playerCharacter?.getPosition?.();
          const position = target.placement?.position;
          if (!Array.isArray(playerPosition) || !Array.isArray(position)) {
            return true;
          }

          const distance = getWorkbenchRotationTargetDistance(playerPosition, target);
          return !(
            Number.isFinite(distance) &&
            distance > getWorkbenchRotationTriggerDistance() * 1.6
          );
        }
      }
    );
  }

  function getWorkbenchRotationPreviewYaw(target) {
    return workbenchRotationRuntime.getPreviewYaw(target);
  }

  function getWorkbenchRotationPreviewSize(target) {
    return workbenchRotationRuntime.getPreviewSize(target);
  }

  function applyWorkbenchRotationSelectionTint(kind, instance, nowSeconds = getRuntimeNowSeconds()) {
    return workbenchRotationRuntime.applySelectionTint(kind, instance, nowSeconds);
  }

  function selectWorkbenchConstructionForRotation(target) {
    if (!workbenchRotationRuntime.select(target)) {
      return false;
    }

    hud?.pushNotice?.(
      `${target.label} selected. ${resolveWorkbenchRotationPrompt(getCurrentInputModalityState())}.`
    );
    playSoundEvent(SOUND_EVENT_IDS.UI_CONFIRM);
    return true;
  }

  function clearWorkbenchConstructionRotationSelection() {
    if (!workbenchRotationRuntime.clear()) {
      return false;
    }

    playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
    hud?.pushNotice?.("Rotation canceled.");
    return true;
  }

  function confirmWorkbenchConstructionRotationSelection() {
    const target = getSelectedRotatableWorkbenchPlacement();
    if (!target?.placement) {
      workbenchRotationRuntime.clear();
      return false;
    }

    if (!workbenchRotationRuntime.confirm(target, {
      syncPlacementYaw: target.kind === "solarStation" ?
        syncSolarStationPlacementYaw :
        undefined
    })) {
      return false;
    }

    playSoundEvent(SOUND_EVENT_IDS.UI_CONFIRM);
    hud?.pushNotice?.(`${target.label} rotation set.`);
    return true;
  }

  function syncSolarStationPlacementYaw(placement) {
    const instance = session.strawBedModelInstance;
    if (!instance || !Array.isArray(placement?.position)) {
      return;
    }

    const baseYaw =
      instance.solarStationBaseYaw ??
      Number(instance.yaw || 0);
    instance.solarStationBaseYaw = baseYaw;
    instance.yaw = baseYaw + Number(placement.yaw || 0);
  }

  function syncSolarStationWorkbenchRotationVisual(nowSeconds = getRuntimeNowSeconds()) {
    const instance = session.strawBedModelInstance;
    if (
      !instance ||
      session.strawBedPlacementPreview?.active ||
      !session.strawBed?.position ||
      !controls.storyState.flags.strawBedPlacedInBulbasaurHabitat
    ) {
      return;
    }

    const target = {
      kind: "solarStation",
      placement: session.strawBed
    };
    const baseYaw =
      instance.solarStationBaseYaw ??
      Number(instance.yaw || 0);
    instance.solarStationBaseYaw = baseYaw;
    instance.yaw = baseYaw + getWorkbenchRotationPreviewYaw(target);

    if (!applyWorkbenchRotationSelectionTint("solarStation", instance, nowSeconds) && !instance.solarStationSpawnEffect) {
      instance.alpha = 1;
      instance.tintStrength = 0;
    }
  }

  function rotateNearbyWorkbenchConstruction(direction) {
    const steps = Math.trunc(Number(direction || 0));
    if (steps === 0) {
      return false;
    }

    const target = getSelectedRotatableWorkbenchPlacement();
    if (!target?.placement) {
      return false;
    }

    if (!workbenchRotationRuntime.rotate(target, steps)) {
      return false;
    }

    playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE);
    hud?.pushNotice?.(`${target.label} preview rotated. X confirm.`);
    return true;
  }

  function getWorkbenchRotationGroundCell(target) {
    return workbenchRotationRuntime.getGroundCell(target);
  }

  function updateLeafDenKitPlacementPreview(timeSeconds = 0) {
    const preview = session.leafDenKitPlacementPreview;
    if (!preview?.active) {
      return null;
    }

    syncPlacementPreviewPositionToPlayer(preview);

    const snappedPosition = getSnappedSolarStationPreviewPosition(preview);
    const previewSize = getRotatedPlacementSize(
      Array.isArray(preview.size) ?
        preview.size :
        LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
      preview.yaw
    );
    const previewCollisionSize = getPlacementPreviewFootprintWorldSize(
      preview,
      LEAF_DEN_KIT_PLACEMENT_GRID_FOOTPRINT
    );
    const blockers = getSolarStationPlacementBlockers(session, controls.storyState);
    const validation = validateBuildingKitPlacement({
      position: snappedPosition,
      size: previewCollisionSize,
      blockers
    });
    const insideSolarStationPowerRadius = validation.valid ?
      isInsideSolarStationPowerRadius(session, controls.storyState, snappedPosition) :
      false;
    const siteChoice = evaluateHabitatSiteChoice({
      position: snappedPosition,
      footprint: previewCollisionSize,
      blockers,
      groundState: validation.valid || validation.reason !== "invalid-terrain" ? "stable" : "dry",
      requiresPower: true,
      solarStationPosition: getSolarStationPowerPosition(session, controls.storyState),
      workbenchPosition: WORKBENCH_POSITION,
      thresholds: {
        solarStationRadius: getSolarStationPowerRadius(session)
      }
    });

    preview.snappedPosition = snappedPosition;
    preview.effectiveSize = previewSize;
    preview.valid = validation.valid && insideSolarStationPowerRadius;
    preview.invalidReason = preview.valid ?
      null :
      validation.valid ? "outside-solar-station-radius" : validation.reason;
    preview.siteChoice = siteChoice;
    preview.readyForConfirm = true;

    if (session.leafDenPlacementPreviewModelInstance) {
      const instance = session.leafDenPlacementPreviewModelInstance;
      const previewVisual = resolveWorkbenchPlacementPreviewVisual({
        valid: preview.valid,
        timeSeconds
      });
      const groundY = instance.leafDenGroundY ?? Number(instance.offset?.[1] ?? snappedPosition[1] ?? 0.02);
      const baseScale = instance.leafDenBaseScale ?? Number(instance.scale || 1);
      const baseYaw = instance.leafDenBaseYaw ?? Number(instance.yaw || 0);
      instance.leafDenGroundY = groundY;
      instance.leafDenBaseScale = baseScale;
      instance.leafDenBaseYaw = baseYaw;
      instance.offset = [
        snappedPosition[0],
        groundY,
        snappedPosition[2]
      ];
      instance.scale = baseScale;
      instance.yaw = baseYaw + Number(preview.yaw || 0);
      instance.alpha = previewVisual.alpha;
      instance.tint = previewVisual.tint;
      instance.tintStrength = previewVisual.tintStrength;
      instance.active = true;
    }

    return preview;
  }

  function updateCampfirePlacementPreview(timeSeconds = 0) {
    const preview = session.campfirePlacementPreview;
    const instance = session.campfireTrainHouseModelInstance;
    if (!preview?.active) {
      if (instance && !controls.storyState.flags.campfireSpatOut) {
        instance.active = false;
      }
      return null;
    }

    syncPlacementPreviewPositionToPlayer(preview);

    const snappedPosition = getSnappedSolarStationPreviewPosition(preview);
    const previewCollisionSize = getPlacementPreviewFootprintWorldSize(
      preview,
      TRAIN_HOUSE_PLACEMENT_GRID_FOOTPRINT
    );
    const blockers = getSolarStationPlacementBlockers(session, controls.storyState);
    const validation = validateBuildingKitPlacement({
      position: snappedPosition,
      size: previewCollisionSize,
      blockers
    });

    preview.snappedPosition = snappedPosition;
    preview.effectiveSize = getRotatedPlacementSize(
      Array.isArray(preview.size) ?
        preview.size :
        TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      preview.yaw
    );
    preview.valid = validation.valid;
    preview.invalidReason = validation.valid ? null : validation.reason;
    preview.readyForConfirm = true;

    if (instance) {
      const previewVisual = resolveWorkbenchPlacementPreviewVisual({
        valid: preview.valid,
        timeSeconds
      });
      const groundY = instance.trainHouseGroundY ?? Number(instance.offset?.[1] ?? snappedPosition[1] ?? 0.02);
      const baseScale = instance.trainHouseBaseScale ?? Number(instance.scale || 1);
      const baseYaw = instance.trainHouseBaseYaw ?? Number(instance.yaw || 0);
      instance.trainHouseGroundY = groundY;
      instance.trainHouseBaseScale = baseScale;
      instance.trainHouseBaseYaw = baseYaw;
      instance.offset = [
        snappedPosition[0],
        groundY,
        snappedPosition[2]
      ];
      instance.scale = baseScale;
      instance.yaw = baseYaw + Number(preview.yaw || 0);
      instance.swayStrength = 0;
      instance.alpha = previewVisual.alpha;
      instance.tint = previewVisual.tint;
      instance.tintStrength = previewVisual.tintStrength;
      instance.active = true;
    }

    return preview;
  }

  function updateGreenhousePlacementPreview(timeSeconds = 0) {
    const preview = session.greenhousePlacementPreview;
    const instance = session.greenhouseModelInstance;
    if (!preview?.active) {
      if (instance) {
        instance.active = false;
      }
      return null;
    }

    syncPlacementPreviewPositionToPlayer(preview);

    const snappedPosition = getSnappedSolarStationPreviewPosition(preview);
    const previewCollisionSize = getPlacementPreviewFootprintWorldSize(
      preview,
      GREENHOUSE_PLACEMENT_GRID_FOOTPRINT
    );
    const blockers = getSolarStationPlacementBlockers(session, controls.storyState);
    const validation = validateBuildingKitPlacement({
      position: snappedPosition,
      size: previewCollisionSize,
      blockers
    });

    preview.snappedPosition = snappedPosition;
    preview.effectiveSize = getRotatedPlacementSize(
      Array.isArray(preview.size) ?
        preview.size :
        GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      preview.yaw
    );
    preview.valid = validation.valid;
    preview.invalidReason = validation.valid ? null : validation.reason;
    preview.readyForConfirm = true;

    if (instance) {
      const previewVisual = resolveWorkbenchPlacementPreviewVisual({
        valid: preview.valid,
        timeSeconds
      });
      const groundY = instance.greenhouseGroundY ?? Number(instance.offset?.[1] ?? snappedPosition[1] ?? 0.02);
      const baseScale = instance.greenhouseBaseScale ?? Number(instance.scale || 1);
      const baseYaw = instance.greenhouseBaseYaw ?? Number(instance.yaw || 0);
      instance.greenhouseGroundY = groundY;
      instance.greenhouseBaseScale = baseScale;
      instance.greenhouseBaseYaw = baseYaw;
      instance.offset = [
        snappedPosition[0],
        groundY,
        snappedPosition[2]
      ];
      instance.scale = baseScale;
      instance.yaw = baseYaw + Number(preview.yaw || 0);
      instance.alpha = previewVisual.alpha;
      instance.tint = previewVisual.tint;
      instance.tintStrength = previewVisual.tintStrength;
      instance.active = true;
    }

    return preview;
  }

  function updateSolarStationSpawnEffect(deltaTime) {
    const instance = session.strawBedModelInstance;
    const effect = instance?.solarStationSpawnEffect;

    if (!effect || instance.active === false) {
      return;
    }

    effect.elapsed = Math.min(effect.duration, Number(effect.elapsed || 0) + deltaTime);
    const progress = easeOutCubic(effect.elapsed / Math.max(0.001, effect.duration));
    const groundY = Number.isFinite(effect.groundY) ? effect.groundY : Number(instance.offset?.[1] || 0.02);

    instance.scale = lerp(effect.fromScale, effect.toScale, progress);
    instance.alpha = lerp(effect.fromAlpha, effect.toAlpha, progress);
    instance.offset = [
      instance.offset?.[0] || 0,
      groundY + lerp(effect.fromYOffset, effect.toYOffset, progress),
      instance.offset?.[2] || 0
    ];
    instance.tint = [1, 1.14, 0.72];
    instance.tintStrength = lerp(0.34, 0, progress);

    if (progress >= 1) {
      instance.scale = effect.toScale;
      instance.alpha = effect.toAlpha;
      instance.offset[1] = groundY;
      instance.tintStrength = 0;
      instance.solarStationSpawnEffect = null;
    }
  }

  function advancePlayerPlacementSpawnEffect(placement, deltaTime) {
    const effect = placement?.spawnEffect;
    if (!effect) {
      return null;
    }

    effect.elapsed = Math.min(
      Number(effect.duration || 0.82),
      Number(effect.elapsed || 0) + Math.max(0, Number(deltaTime) || 0)
    );

    const duration = Math.max(0.001, Number(effect.duration || 0.82));
    const progress = easeOutCubic(effect.elapsed / duration);
    const pose = {
      progress,
      scale: lerp(Number(effect.fromScale ?? 0.18), Number(effect.toScale ?? 1), progress),
      yOffset: lerp(Number(effect.fromYOffset ?? 0.54), Number(effect.toYOffset ?? 0), progress),
      alpha: lerp(Number(effect.fromAlpha ?? 0.08), Number(effect.toAlpha ?? 1), progress)
    };

    if (progress >= 1) {
      placement.spawnEffect = null;
    }

    return pose;
  }

  function applyPlayerPlacementSpawnToBillboard(placement, billboard, deltaTime) {
    const pose = advancePlayerPlacementSpawnEffect(placement, deltaTime);
    if (!pose || !billboard) {
      return billboard;
    }

    return {
      ...billboard,
      position: [
        billboard.position[0],
        billboard.position[1] + pose.yOffset,
        billboard.position[2]
      ],
      size: Array.isArray(billboard.size) ?
        [
          billboard.size[0] * pose.scale,
          billboard.size[1] * pose.scale
        ] :
        billboard.size,
      alpha: (billboard.alpha ?? billboard.opacity ?? 1) * pose.alpha
    };
  }

  function applyPlayerPlacementSpawnToModelInstance(placement, instance, {
    baseScale,
    groundY,
    deltaTime
  } = {}) {
    const pose = advancePlayerPlacementSpawnEffect(placement, deltaTime);
    if (!pose || !instance) {
      return false;
    }

    const resolvedGroundY = Number.isFinite(groundY) ? groundY : Number(instance.offset?.[1] || 0.02);
    const resolvedBaseScale = Number.isFinite(baseScale) ? baseScale : Number(instance.scale || 1);
    instance.scale = resolvedBaseScale * pose.scale;
    instance.offset = [
      instance.offset?.[0] || 0,
      resolvedGroundY + pose.yOffset,
      instance.offset?.[2] || 0
    ];
    instance.alpha = pose.alpha;
    instance.tint = [1, 1.14, 0.72];
    instance.tintStrength = lerp(0.34, 0, pose.progress);
    return true;
  }

  function hasCharmanderFireCarbon() {
    if (!canUseCharmanderFireWithCarbon({
      storyState: controls.storyState,
      inventory: controls.inventory
    })) {
      hud.pushNotice(`${SANDBOTS_BOT_NAMES.thermal || "Thermal Bot"} needs Carbon to use Thermal Torch.`);
      return false;
    }

    return true;
  }

  function triggerWaterGunSfxBurst(duration = SQUIRTLE_WATER_GUN_SPRAY_DURATION) {
    waterGunSfxBurstRuntime.trigger(getRuntimeNowSeconds(), duration);
  }

  function getSupplyCounterSnapshot(inventory = {}) {
    return Object.fromEntries(
      Object.keys(inventory || {}).map((itemId) => [
        itemId,
        Number(inventory?.[itemId] || 0)
      ])
    );
  }

  function getSupplyCounterPromptLabel(itemId) {
    const label = gameplay.getItemLabel?.(itemId) || itemId;
    return typeof label === "string" && label.trim() ? label : itemId;
  }

  function triggerSupplyCounterPrompt(itemId, inventory = {}, now) {
    const label = getSupplyCounterPromptLabel(itemId);
    const count = Number(inventory?.[itemId] || 0);
    if (!label || count <= 0) {
      return false;
    }

    playerCounterPromptRuntime.trigger(formatResourcePickupPrompt({
      itemId,
      label,
      count
    }), now);
    return true;
  }

  function triggerChangedSupplyCounterPrompt(previousCounts, inventory = {}, now) {
    for (const itemId of Object.keys(inventory || {})) {
      const nextCount = Number(inventory?.[itemId] || 0);
      if (nextCount > Number(previousCounts?.[itemId] || 0)) {
        return triggerSupplyCounterPrompt(itemId, inventory, now);
      }
    }

    return false;
  }

  function restoreActiveZoomPresetOnMovement(playerPosition) {
    if (!Array.isArray(playerPosition) || !camera.isTargetTransitionActive()) {
      return;
    }

    const currentPose = camera.getPose?.() || {};
    const activePreset = cameraZoomPresetController.getCurrentPreset?.() || {};

    camera.setPose({
      target: currentPose.target || playerPosition,
      direction: cameraOrbit.getDirection?.() || currentPose.direction,
      zoom: activePreset.zoom,
      distance: activePreset.distance
    });
    cameraZoomPresetController.applyCurrent?.();
    camera.follow(playerPosition);
  }

  function isFoundationBuildMissionActive() {
    return shouldShowFoundationBuildZone(
      gameplay.getActiveQuest?.(controls.storyState) || null,
      gameplay.getActiveSystemQuest?.() || null
    );
  }

  function getFoundationBuildZoneCameraFocusPose(buildZone = null) {
    const position = getFreeBlockBuildZoneCenterPosition(buildZone);
    if (!position) {
      return null;
    }

    return {
      target: [
        position[0],
        BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_HEIGHT,
        position[2]
      ],
      direction: cameraOrbit.getDirection?.() || camera.getPose?.()?.direction,
      zoom: BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_ZOOM,
      distance: BUILDER_TUTORIAL_FOUNDATION_CAMERA_FOCUS_DISTANCE
    };
  }

  function updateFoundationBuildZoneCameraFocus(now) {
    const missionActive = isFoundationBuildMissionActive();
    if (!missionActive) {
      return foundationBuildZoneCameraFocusRuntime.update({
        now,
        missionActive: false
      });
    }

    const buildZone = getActiveFreeBlockBuildZone();
    const zoneAvailable = Boolean(buildZone && !isFoundationBuildZoneUnavailable());
    if (!zoneAvailable) {
      return foundationBuildZoneCameraFocusRuntime.update({
        now,
        missionActive: true,
        zoneAvailable: false
      });
    }

    return foundationBuildZoneCameraFocusRuntime.update({
      now,
      missionActive: true,
      zoneAvailable: true,
      zoneSignature: getBuilderTutorialFoundationZoneSignature(buildZone),
      flags: controls.storyState?.flags || {},
      startFocus: () => {
        const pose = getFoundationBuildZoneCameraFocusPose(buildZone);
        if (!pose) {
          return false;
        }

        camera.startPoseTransition?.(pose, { duration: 0.45 });
        if (pose.direction) {
          cameraOrbit.sync?.(pose.direction);
        }
        return true;
      },
      onFocusStarted: () => {
        controls.clearPendingActions?.();
        controls.clearMovementInput?.();
      }
    });
  }

  function getYawToward(fromPosition, toPosition) {
    const deltaX = toPosition[0] - fromPosition[0];
    const deltaZ = toPosition[2] - fromPosition[2];
    return Math.atan2(deltaX, deltaZ);
  }

  function getSquirtleModelYawToward(fromPosition, toPosition) {
    return getYawToward(fromPosition, toPosition) + SQUIRTLE_MODEL_FACE_YAW_OFFSET;
  }

  function getRobotModelYawToward(fromPosition, toPosition, modelFaceYawOffset) {
    return getYawToward(fromPosition, toPosition) + modelFaceYawOffset;
  }

  function getSquirtleLogicalFacingYaw() {
    return (session.actTwoSquirtle?.modelInstance?.yaw || 0) - SQUIRTLE_MODEL_FACE_YAW_OFFSET;
  }

  function getCharmanderLogicalFacingYaw() {
    return (session.charmanderEncounter?.modelInstance?.yaw || 0) - CHARMANDER_MODEL_FACE_YAW_OFFSET;
  }

  function getBulbasaurLogicalFacingYaw() {
    return (session.bulbasaurEncounter?.modelInstance?.yaw || 0) - BULBASAUR_MODEL_FACE_YAW_OFFSET;
  }

  function getGroundCellCenterPosition(groundCell) {
    const offset = groundCell?.offset || [0, 0, 0];
    return [
      offset[0] || 0,
      (offset[1] || 0) + 0.04,
      offset[2] || 0
    ];
  }

  function findNearbyFeedbackGroundCell(playerPosition, groundCells = []) {
    if (!Array.isArray(playerPosition) || !Array.isArray(groundCells)) {
      return null;
    }

    let nearestGroundCell = null;
    let nearestDistance = Infinity;

    for (const groundCell of groundCells) {
      if (
        !groundCell ||
        groundCell.active === false ||
        !Array.isArray(groundCell.offset)
      ) {
        continue;
      }

      const deltaX = playerPosition[0] - groundCell.offset[0];
      const deltaZ = playerPosition[2] - groundCell.offset[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const interactDistance =
        (groundCell.tileSpan || groundCell.size?.[0] || 1) *
        FIELD_MOVE_INVALID_GROUND_CELL_RADIUS_FACTOR;

      if (distance <= interactDistance && distance < nearestDistance) {
        nearestGroundCell = groundCell;
        nearestDistance = distance;
      }
    }

    return nearestGroundCell;
  }

  function isFreeRoamRestorationGroundCellCandidate(groundCell) {
    return Boolean(
      groundCell &&
      groundCell.active !== false &&
      Array.isArray(groundCell.offset) &&
      !groundCell.terrainLayer &&
      !groundCell.terrainStackHeight
    );
  }

  function buildFreeRoamRestorationGroundCells(playerPosition, groundCells = [], abilityId = null) {
    if (!Array.isArray(playerPosition) || !Array.isArray(groundCells) || !abilityId) {
      return [];
    }

    return groundCells
      .filter(isFreeRoamRestorationGroundCellCandidate)
      .map((groundCell) => {
        const tileSpan = groundCell.tileSpan || groundCell.size?.[0] || 1;
        const maxDistance = tileSpan * FREE_ROAM_RESTORATION_GRID_RADIUS_FACTOR;
        const deltaX = playerPosition[0] - groundCell.offset[0];
        const deltaZ = playerPosition[2] - groundCell.offset[2];
        const distance = Math.hypot(deltaX, deltaZ);
        return {
          distance,
          groundCell,
          maxDistance
        };
      })
      .filter(({ distance, maxDistance }) => distance <= maxDistance)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, FREE_ROAM_RESTORATION_GRID_MAX_CELLS)
      .map(({ groundCell }) => ({
        ...groundCell,
        highlightTargetState: "valid",
        highlightAbilityId: abilityId
      }));
  }

  function getFreeRoamRestorationGroundCells({
    playerPosition,
    waterGunEquipped = false,
    leafageEquipped = false,
    fireEquipped = false
  } = {}) {
    if (fireEquipped) {
      return buildFreeRoamRestorationGroundCells(playerPosition, session.iceGroundInstances, "fire");
    }

    if (leafageEquipped) {
      return buildFreeRoamRestorationGroundCells(
        playerPosition,
        (session.groundPurifiedInstances || []).filter((groundCell) => {
          return hasGroundPatchForCellId(groundCell?.id);
        }),
        "leafage"
      );
    }

    if (waterGunEquipped) {
      return buildFreeRoamRestorationGroundCells(playerPosition, session.groundDeadInstances, "waterGun");
    }

    return [];
  }

  function hasGrowFirstHabitatObjective(task = null) {
    return (task?.objectives || []).some((objective) => {
      return objective?.id === GROW_FIRST_HABITAT_OBJECTIVE_ID;
    });
  }

  function isGrowFirstHabitatTaskActive(...tasks) {
    return tasks.some((task) => {
      return task?.id === GROW_FIRST_HABITAT_TASK_ID ||
        hasGrowFirstHabitatObjective(task);
    });
  }

  function getGrowFirstHabitatMarkedCellCount(storyState = {}) {
    const grownCount = Math.max(0, Math.trunc(Number(storyState?.flags?.leafageTallGrassCount || 0)));
    return Math.max(0, GROW_FIRST_HABITAT_MARKED_CELL_COUNT - grownCount);
  }

  function getGrowFirstHabitatReferencePosition() {
    return session.bulbasaurEncounter?.position ||
      session.bulbasaurEncounter?.repairPosition ||
      session.playerCharacter?.getPosition?.() ||
      null;
  }

  function getGrowFirstHabitatTaskGroundCells({
    activeQuest = null,
    activeSystemQuest = null,
    activeTask = null,
    storyState = controls.storyState
  } = {}) {
    if (!isGrowFirstHabitatTaskActive(activeQuest, activeSystemQuest, activeTask)) {
      return [];
    }

    const remainingCellCount = getGrowFirstHabitatMarkedCellCount(storyState);
    const referencePosition = getGrowFirstHabitatReferencePosition();
    if (remainingCellCount <= 0 || !Array.isArray(referencePosition)) {
      return [];
    }

    return (session.groundPurifiedInstances || [])
      .filter(isFreeRoamRestorationGroundCellCandidate)
      .filter((groundCell) => !hasGroundPatchForCellId(groundCell?.id))
      .map((groundCell) => {
        const deltaX = groundCell.offset[0] - referencePosition[0];
        const deltaZ = groundCell.offset[2] - referencePosition[2];
        return {
          distance: Math.hypot(deltaX, deltaZ),
          groundCell
        };
      })
      .sort((left, right) => left.distance - right.distance)
      .slice(0, remainingCellCount)
      .map(({ groundCell }) => ({
        ...groundCell,
        highlightTargetState: "leafage",
        highlightAbilityId: "leafage"
      }));
  }

  function isBoulderShadedTallGrassTaskActive(storyState = {}) {
    const flags = storyState.flags || {};
    const trackedTaskIds = Array.isArray(flags.trackedTaskIds) ? flags.trackedTaskIds : [];
    const taskTracked =
      !Array.isArray(flags.trackedTaskIds) ||
      trackedTaskIds.includes(BOULDER_SHADED_TALL_GRASS_TASK_ID);

    return Boolean(
      taskTracked &&
      flags.boulderChallengeAvailable &&
      !flags.boulderShadedTallGrassHabitatCreated &&
      !flags.boulderChallengeRewardClaimed
    );
  }

  function getBoulderShadedGroundCellDistanceEntries(groundCells = [], boulderPosition) {
    return (groundCells || [])
      .filter(isFreeRoamRestorationGroundCellCandidate)
      .filter((groundCell) => !hasGroundPatchForCellId(groundCell?.id))
      .map((groundCell) => {
        const deltaX = groundCell.offset[0] - boulderPosition[0];
        const deltaZ = groundCell.offset[2] - boulderPosition[2];
        return {
          distance: Math.hypot(deltaX, deltaZ),
          groundCell
        };
      })
      .filter(({ distance }) => distance <= BOULDER_SHADED_TALL_GRASS_RADIUS)
      .sort((left, right) => left.distance - right.distance);
  }

  function getBoulderShadedTaskGroundCells(storyState = {}) {
    if (!isBoulderShadedTallGrassTaskActive(storyState)) {
      return [];
    }

    const boulderPosition =
      session.challengeBoulder?.position ||
      BOULDER_SHADED_TALL_GRASS_BOULDER_POSITION;

    const waterGunGroundCells = getBoulderShadedGroundCellDistanceEntries(
      session.groundDeadInstances,
      boulderPosition
    ).map(({ groundCell }) => ({
      ...groundCell,
      highlightTargetState: "valid",
      highlightAbilityId: "waterGun"
    }));
    const leafageGroundCells = getBoulderShadedGroundCellDistanceEntries(
      session.groundPurifiedInstances,
      boulderPosition
    ).map(({ groundCell }) => ({
      ...groundCell,
      highlightTargetState: "valid",
      highlightAbilityId: "leafage"
    }));

    return [
      ...waterGunGroundCells,
      ...leafageGroundCells
    ];
  }

  function hasGroundPatchForCellId(cellId) {
    if (typeof cellId !== "string") {
      return false;
    }

    return [
      ...(session.groundGrassPatches || []),
      ...(session.groundFlowerPatches || [])
    ].some((patch) => patch?.cellId === cellId);
  }

  function findAlreadyResolvedFieldMoveGroundCell(playerPosition, {
    waterGunEquipped = false,
    leafageEquipped = false,
    fireEquipped = false
  } = {}) {
    if (waterGunEquipped) {
      return findNearbyFeedbackGroundCell(
        playerPosition,
        session.groundPurifiedInstances
      );
    }

    if (leafageEquipped) {
      return findNearbyFeedbackGroundCell(
        playerPosition,
        (session.groundPurifiedInstances || []).filter((groundCell) => {
          return hasGroundPatchForCellId(groundCell?.id);
        })
      );
    }

    if (fireEquipped) {
      return findNearbyFeedbackGroundCell(
        playerPosition,
        session.groundDeadInstances
      );
    }

    return null;
  }

  function getGroundCellIdKey(groundCells = []) {
    return Array.isArray(groundCells) ?
      groundCells
        .map((groundCell) => groundCell?.id)
        .filter((id) => typeof id === "string")
        .sort()
        .join("|") :
      "";
  }

  function getPatchCellIdKey(patches = []) {
    return Array.isArray(patches) ?
      patches
        .map((patch) => patch?.cellId)
        .filter((cellId) => typeof cellId === "string")
        .sort()
        .join("|") :
      "";
  }

  function getAlivePatchCellIdKey(patches = []) {
    return Array.isArray(patches) ?
      patches
        .filter((patch) => patch?.state === "alive")
        .map((patch) => patch?.cellId)
        .filter((cellId) => typeof cellId === "string")
        .sort()
        .join("|") :
      "";
  }

  function getGardenProgressSnapshot() {
    return [
      getGroundCellIdKey(session.groundDeadInstances),
      getGroundCellIdKey(session.iceGroundInstances),
      getGroundCellIdKey(session.groundPurifiedInstances),
      getPatchCellIdKey(session.groundGrassPatches),
      getAlivePatchCellIdKey(session.groundGrassPatches),
      getAlivePatchCellIdKey(session.groundFlowerPatches),
      Number(controls.storyState?.flags?.wateredTreeCount || 0)
    ].join(";");
  }

  function getTreeRevivalSnapshot() {
    return {
      palmAliveById: new Map(
        (session.palmInstances || []).map((palmInstance) => [
          palmInstance?.id,
          Boolean(palmInstance?.alive)
        ])
      ),
      leppaTreeRevived: Boolean(
        session.leppaTree?.revived ||
        controls.storyState?.flags?.leppaTreeRevived
      )
    };
  }

  function queueTreeRevivalLeafBurstsForNewlyRevivedTrees(snapshot) {
    if (!snapshot) {
      return;
    }

    for (const palmInstance of session.palmInstances || []) {
      const wasAlive = snapshot.palmAliveById?.get(palmInstance?.id);
      if (!wasAlive && palmInstance?.alive && Array.isArray(palmInstance.offset)) {
        treeRevivalLeafBurstRuntime.queue(palmInstance.offset, palmInstance.id);
      }
    }

    const leppaTreeRevived = Boolean(
      session.leppaTree?.revived ||
      controls.storyState?.flags?.leppaTreeRevived
    );
    if (
      !snapshot.leppaTreeRevived &&
      leppaTreeRevived &&
      Array.isArray(session.leppaTree?.position)
    ) {
      treeRevivalLeafBurstRuntime.queue(
        session.leppaTree.position,
        session.leppaTree.id || "leppa-tree"
      );
    }
  }

  function appendTreeRevivalLeafBurstBillboards(nextFrame) {
    const texture =
      session.leavesTexture ||
      session.greenGrassTexture ||
      session.natureRevivalSparkTexture;

    treeRevivalLeafBurstRuntime.appendBillboards({
      billboards: nextFrame.render.genericBillboards,
      texture,
      uvRect: rendering.fullUvRect
    });
  }

  function performGameplayHarvestAction(options, autosaveContext = {}) {
    const treeRevivalSnapshot = getTreeRevivalSnapshot();
    const beforeGardenProgress = getGardenProgressSnapshot();
    const result = gameplay.performHarvestAction(options);
    const afterGardenProgress = getGardenProgressSnapshot();

    if (result) {
      queueTreeRevivalLeafBurstsForNewlyRevivedTrees(treeRevivalSnapshot);
    }

    if (result && afterGardenProgress !== beforeGardenProgress) {
      const groundCell =
        autosaveContext.groundCell ||
        options?.forcedHarvestTarget?.groundCell ||
        options?.forcedHarvestTarget?.leafageGroundCell ||
        options?.forcedHarvestTarget?.fireGroundCell ||
        null;

      controls.onGardenProgressChanged?.({
        actionType: autosaveContext.actionType || null,
        groundCellId: typeof groundCell?.id === "string" ? groundCell.id : null
      });
    }

    return result;
  }

  function cloneGroundGrassPatchForCutEffect(patch) {
    if (!patch || !Array.isArray(patch.position)) {
      return null;
    }

    return {
      ...patch,
      position: [...patch.position],
      size: Array.isArray(patch.size) ? [...patch.size] : [1.18, 0.96]
    };
  }

  function findDestroyableLandscapePatchByTarget(target) {
    if (target?.action !== "destroyInstantiatedObject") {
      return null;
    }

    const patches = [
      ...(session.groundGrassPatches || []),
      ...(session.groundFlowerPatches || [])
    ];
    const exactPatch = patches.find((patch) => patch?.id === target.id);

    if (exactPatch) {
      return exactPatch;
    }

    return patches.find((patch) => target.cellId && patch?.cellId === target.cellId) || null;
  }

  function getDestroyableLandscapePatchForInteractOptions(options = {}) {
    const nearbyTarget = findNearbyDestroyableInstantiatedObject(
      options.playerPosition,
      options.groundGrassPatches || [],
      options.storyState,
      options.groundFlowerPatches || []
    );

    return cloneGroundGrassPatchForCutEffect(
      findDestroyableLandscapePatchByTarget(nearbyTarget?.target)
    );
  }

  function queueLandscapeCutEffect(patch) {
    landscapeCutEffectRuntime.queue(patch);
  }

  function performGameplayInteractAction(options) {
    const cutEffectPatch = getDestroyableLandscapePatchForInteractOptions(options);
    const beforeGardenProgress = getGardenProgressSnapshot();
    const result = gameplay.performInteractAction(options);
    const afterGardenProgress = getGardenProgressSnapshot();

    if (result && cutEffectPatch && afterGardenProgress !== beforeGardenProgress) {
      queueLandscapeCutEffect(cutEffectPatch);
      controls.onGardenProgressChanged?.({
        actionType: "destroyLandscape",
        groundCellId: typeof cutEffectPatch.cellId === "string" ? cutEffectPatch.cellId : null
      });
    }

    return result;
  }

  function performGameplayDestroyAction(options) {
     debugInteractionFlow("gameLoop.destroyAction.start", {
      playerPosition: options?.playerPosition
    });
    const nowMs =
      typeof performance !== "undefined" && typeof performance.now === "function" ?
        performance.now() :
        Date.now();
    if (tryRemoveNearbyFreeBlock(options?.playerPosition, nowMs)) {
      return true;
    }

    const cutEffectPatch = getDestroyableLandscapePatchForInteractOptions(options);
    if (!cutEffectPatch) {
      playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
      hud?.pushNotice?.("No removable patch here. Move closer to planted grass or flowers.");
      return false;
    }

    const result = performGameplayInteractAction({
      ...options,
      allowDestroyInstantiatedObject: true
    });
    playSoundEvent(result ? SOUND_EVENT_IDS.GAMEPLAY_IMPACT : SOUND_EVENT_IDS.UI_CANCEL);
    return result;
  }

  function appendLandscapeCutEffectRenderables(nextFrame) {
    landscapeCutEffectRuntime.forEachEffect((effect, pose) => {
      const groundGrassPatch = effect.patch;
      if (!groundGrassPatch || !Array.isArray(groundGrassPatch.position)) {
        return;
      }

      if (pose.alpha <= 0.01) {
        return;
      }

      const offset = [
        groundGrassPatch.position[0],
        groundGrassPatch.position[1] + pose.yOffset,
        groundGrassPatch.position[2]
      ];
      const yaw = getTallGrassYaw(groundGrassPatch);
      const isLeafageGarden =
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId === "garden1";
      const isLeafageNativeTree =
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId === "nativeTree";
      const isTallGrass =
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId !== "garden1" &&
        groundGrassPatch.leafageObjectId !== "nativeTree";

      if (
        isLeafageGarden &&
        session.leafageGardenModel &&
        Array.isArray(session.leafageGardenInstances)
      ) {
        session.leafageGardenInstances.push({
          id: `${effect.id}-garden`,
          offset,
          scale: getTallGrassInstanceScale(
            session.leafageGardenModel,
            groundGrassPatch,
            pose.scale
          ) * (session.leafageGardenModelScale || 1),
          alpha: pose.alpha,
          yaw: yaw + (session.leafageGardenModelFaceYawOffset || 0),
          swayStrength: 0
        });
      } else if (
        isLeafageNativeTree &&
        session.leafageNativeTreeModel &&
        Array.isArray(session.leafageNativeTreeInstances)
      ) {
        session.leafageNativeTreeInstances.push({
          id: `${effect.id}-native-tree`,
          offset,
          scale: getTallGrassInstanceScale(
            session.leafageNativeTreeModel,
            groundGrassPatch,
            pose.scale
          ) * (session.leafageNativeTreeModelScale || 1),
          alpha: pose.alpha,
          yaw: yaw + (session.leafageNativeTreeModelFaceYawOffset || 0),
          swayStrength: 0
        });
      } else if (
        isTallGrass &&
        session.tallGrassModel &&
        Array.isArray(session.tallGrassInstances)
      ) {
        session.tallGrassInstances.push({
          id: `${effect.id}-tall-grass`,
          offset,
          scale: getTallGrassInstanceScale(
            session.tallGrassModel,
            groundGrassPatch,
            pose.scale
          ),
          alpha: pose.alpha,
          yaw,
          swayStrength: 0
        });
      } else if (
        session.deadGrassModel &&
        Array.isArray(session.deadGrassInstances)
      ) {
        session.deadGrassInstances.push({
          id: `${effect.id}-dead-grass`,
          offset,
          scale: getTallGrassInstanceScale(
            session.deadGrassModel,
            groundGrassPatch,
            pose.scale
          ),
          alpha: pose.alpha,
          yaw,
          swayStrength: 0
        });
      } else {
        const grassBillboardScaleX = Number(groundGrassPatch.size?.[0]) || 1;
        const grassBillboardScaleY = Number(groundGrassPatch.size?.[1]) || grassBillboardScaleX;
        nextFrame.render.grassBillboards.push({
          texture: groundGrassPatch.state === "alive" ?
            session.greenGrassTexture :
            session.deadGrassTexture,
          position: offset,
          size: [
            grassBillboardScaleX * pose.scale,
            grassBillboardScaleY * pose.scale
          ],
          alpha: pose.alpha
        });
      }
    });
  }

  function findGrassPatchForGroundCell(groundCell) {
    if (!groundCell?.id || !Array.isArray(session.groundGrassPatches)) {
      return null;
    }

    return session.groundGrassPatches.find((patch) => patch?.cellId === groundCell.id) || null;
  }

  function isAliveGrassPatchForGroundCell(groundCell) {
    return findGrassPatchForGroundCell(groundCell)?.state === "alive";
  }

  function syncSquirtleModelInstance() {
    if (!session.actTwoSquirtle?.modelInstance || !Array.isArray(session.actTwoSquirtle.position)) {
      return;
    }

    session.actTwoSquirtle.modelInstance.offset = [...session.actTwoSquirtle.position];
    session.actTwoSquirtle.modelInstance.scale = ROBOT_MODEL_SCALE;
    if (session.actTwoSquirtle.repairModuleInstance) {
      syncRepairBoxInstance(
        session.actTwoSquirtle.repairModuleInstance,
        session.actTwoSquirtle.position,
        Boolean(
          !session.actTwoSquirtle.recovered &&
          session.actTwoSquirtle.assemblyState !== "assembled" &&
          !session.actTwoSquirtle.reassembly?.active
        )
      );
    }
    syncInteractablePosition("squirtle", session.actTwoSquirtle.position);
  }

  function getEncounterRepairBoxPosition(encounter) {
    return encounter?.repairBoxPosition || encounter?.repairPosition || null;
  }

  function getEncounterRepairBoxOpeningProgress(encounter) {
    const revealBoxOpening = encounter?.revealBoxOpening;

    if (!revealBoxOpening?.active) {
      return 0;
    }

    const rawProgress = clamp01(
      Number(revealBoxOpening.elapsed || 0) / Number(revealBoxOpening.duration || 1)
    );
    const openStart = clamp01(
      Number(revealBoxOpening.openStartProgress ?? BULBASAUR_REVEAL_BOX_OPEN_START_PROGRESS)
    );

    if (rawProgress <= openStart) {
      return 0;
    }

    return clamp01((rawProgress - openStart) / Math.max(0.001, 1 - openStart));
  }

  function syncRepairBoxInstance(instance, basePosition, active, { openingProgress = 0 } = {}) {
    if (!instance || !Array.isArray(basePosition)) {
      return;
    }

    const opened = easeOutCubic(openingProgress);

    instance.baseOffset = [...basePosition];
    instance.offset = repairBoxMotionRuntime.getFloatOffset(basePosition);
    instance.repairBoxBaseYaw ??= Number(instance.yaw || 0);
    instance.repairBoxBaseScale ??= Number(instance.scale || 1);
    instance.scale = instance.repairBoxBaseScale;
    instance.yaw = repairBoxMotionRuntime.getYaw(instance.repairBoxBaseYaw);
    instance.pitch = ROBOT_REPAIR_BOX_MODEL_PITCH_OFFSET;
    instance.roll = 0;

    if (opened > 0) {
      instance.repairBoxOpenYaw ??= instance.yaw;
      instance.yaw = instance.repairBoxOpenYaw;
      instance.pitch = ROBOT_REPAIR_BOX_MODEL_PITCH_OFFSET - ROBOT_REPAIR_BOX_OPEN_PITCH * opened;
      instance.roll = ROBOT_REPAIR_BOX_OPEN_ROLL * opened;
      instance.offset = [
        instance.offset[0],
        instance.offset[1] + ROBOT_REPAIR_BOX_OPEN_LIFT * opened,
        instance.offset[2] + ROBOT_REPAIR_BOX_OPEN_BACKSTEP * opened
      ];
      instance.scale = instance.repairBoxBaseScale * (1 - 0.08 * opened);
    } else {
      instance.repairBoxOpenYaw = null;
    }

    instance.active = Boolean(active);
  }

  function applyBulbasaurRevealBoxCinematic(encounter) {
    const instance = encounter?.repairModuleInstance;
    const opening = encounter?.revealBoxOpening;

    if (!instance || !opening?.active) {
      return;
    }

    const duration = Math.max(0.001, Number(opening.duration || BULBASAUR_REVEAL_BOX_DURATION));
    const elapsed = Math.max(0, Number(opening.elapsed || 0));
    const progress = clamp01(elapsed / duration);
    const shakeEnd = clamp01(
      Number(opening.shakeEndProgress ?? BULBASAUR_REVEAL_BOX_SHAKE_END_PROGRESS)
    );
    const openStart = clamp01(
      Number(opening.openStartProgress ?? BULBASAUR_REVEAL_BOX_OPEN_START_PROGRESS)
    );
    const chargeProgress = clamp01(progress / Math.max(0.001, shakeEnd));
    const charge = chargeProgress * chargeProgress;
    const isDramaticPause = progress >= shakeEnd && progress < openStart;
    const shakeEnvelope = isDramaticPause ? 0 : Math.sin(chargeProgress * Math.PI * 0.5);
    const shake = shakeEnvelope * (0.018 + charge * 0.12);
    const light = clamp01(progress / Math.max(0.001, openStart));

    if (progress < openStart) {
      instance.yaw += elapsed * BULBASAUR_REVEAL_BOX_SPIN_ACCELERATION * charge;
      instance.pitch += Math.sin(elapsed * (24 + charge * 38)) * shake;
      instance.roll += Math.cos(elapsed * (28 + charge * 42)) * shake;
      instance.offset = [
        instance.offset[0] + Math.sin(elapsed * (31 + charge * 28)) * shake,
        instance.offset[1] + Math.abs(Math.sin(elapsed * (18 + charge * 30))) * shake * 1.8,
        instance.offset[2] + Math.cos(elapsed * (29 + charge * 26)) * shake
      ];
    }

    instance.tint = [1.45, 1.72, 0.84];
    instance.tintStrength = Math.max(Number(instance.tintStrength || 0), 0.32 + light * 0.58);
    instance.alpha = 1;
    instance.scale *= 1 + Math.sin(progress * Math.PI) * 0.045;
  }

  function applyBulbasaurRepairBoxRustle(encounter) {
    const instance = encounter?.repairModuleInstance;
    const rustle = encounter?.repairBoxRustle;

    if (!instance || !rustle?.active) {
      return;
    }

    const duration = Math.max(0.001, Number(rustle.duration || 1));
    const elapsed = Math.max(0, Number(rustle.elapsed || 0));
    const progress = clamp01(elapsed / duration);
    const envelope = Math.sin(progress * Math.PI);
    const bounce = Math.abs(Math.sin(elapsed * 32));
    const twist = Math.sin(elapsed * 46);
    const counterTwist = Math.sin(elapsed * 39 + Math.PI * 0.35);

    instance.offset = [
      instance.offset[0] + twist * envelope * 0.055,
      instance.offset[1] + bounce * envelope * BULBASAUR_REPAIR_BOX_RUSTLE_LIFT,
      instance.offset[2] + counterTwist * envelope * 0.045
    ];
    instance.roll += twist * envelope * BULBASAUR_REPAIR_BOX_RUSTLE_ROLL;
    instance.pitch += counterTwist * envelope * BULBASAUR_REPAIR_BOX_RUSTLE_PITCH;
    instance.yaw += Math.sin(elapsed * 52) * envelope * BULBASAUR_REPAIR_BOX_RUSTLE_YAW;
  }

  function syncDismantledEncounterModule(encounter) {
    if (!encounter?.repairModuleInstance) {
      return;
    }

    const openingProgress = getEncounterRepairBoxOpeningProgress(encounter);
    const revealBoxOpening = encounter.revealBoxOpening;
    const hideBoxAfterReveal = Boolean(
      revealBoxOpening?.hideBoxWhenVisible &&
      isRevealBoxBotVisible(revealBoxOpening)
    );

    syncRepairBoxInstance(
      encounter.repairModuleInstance,
      getEncounterRepairBoxPosition(encounter),
      !hideBoxAfterReveal && (openingProgress > 0 || !encounter.visible),
      { openingProgress }
    );
    applyBulbasaurRevealBoxCinematic(encounter);
    applyBulbasaurRepairBoxRustle(encounter);
  }

  function syncBulbasaurModelInstance() {
    const encounter = session.bulbasaurEncounter;

    if (!encounter?.modelInstance) {
      syncDismantledEncounterModule(encounter);
      return;
    }

    syncDismantledEncounterModule(encounter);
    encounter.modelInstance.active = Boolean(encounter.visible && Array.isArray(encounter.position));
    encounter.modelInstance.scale = BULBASAUR_ROBOT_MODEL_SCALE;

    if (Array.isArray(encounter.position)) {
      encounter.modelInstance.offset = [...encounter.position];
    }
  }

  function syncCharmanderModelInstance() {
    const encounter = session.charmanderEncounter;

    if (!encounter?.modelInstance) {
      syncDismantledEncounterModule(encounter);
      return;
    }

    syncDismantledEncounterModule(encounter);
    encounter.modelInstance.active = Boolean(encounter.visible && Array.isArray(encounter.position));
    encounter.modelInstance.scale = CHARMANDER_MODEL_SCALE;

    if (Array.isArray(encounter.position)) {
      encounter.modelInstance.offset = [...encounter.position];
    }
  }

  function syncTimburrModelInstance() {
    const encounter = session.timburrEncounter;

    if (!encounter?.modelInstance) {
      return;
    }

    encounter.modelInstance.active = Boolean(encounter.visible && Array.isArray(encounter.position));
    encounter.modelInstance.scale = Number(encounter.modelBaseScale || TIMBURR_MODEL_SCALE);

    if (Array.isArray(encounter.position)) {
      encounter.modelInstance.offset = [...encounter.position];
    }
  }

  function syncCompanionRepairModules() {
    syncCharmanderModelInstance();
    syncTimburrModelInstance();
    syncDismantledEncounterModule(session.timburrEncounter);
  }

  function isBeeFieldRestored() {
    return (controls.storyState?.flags?.restoredFlowerBedHabitatIds || [])
      .includes(BEE_FIELD_FLOWER_GROUP_ID);
  }

  function syncBeeFieldRepairBox() {
    const beeFieldRepairBox = session.beeFieldRepairBox;

    if (!beeFieldRepairBox) {
      return;
    }

    const basePosition = beeFieldRepairBox.baseOffset || beeFieldRepairBox.offset;
    const unlocked = isBeeFieldRestored();
    const opened = Boolean(controls.storyState?.flags?.beeFieldRepairBoxOpened);

    syncRepairBoxInstance(
      beeFieldRepairBox,
      basePosition,
      true,
      { openingProgress: opened ? 1 : 0 }
    );
    syncInteractablePosition("beeFieldRepairBox", basePosition);
    beeFieldRepairBox.alpha = unlocked ? 1 : BEE_FIELD_REPAIR_BOX_LOCKED_ALPHA;
    beeFieldRepairBox.tint = unlocked && !opened ? REPAIR_BOX_ACTIVE_TINT : null;
    beeFieldRepairBox.tintStrength = unlocked && !opened ? REPAIR_BOX_ACTIVE_TINT_STRENGTH : 0;
  }

  function getBeeFieldCenterPosition() {
    const repairBox = session.beeFieldRepairBox;

    if (Array.isArray(repairBox?.baseOffset)) {
      return repairBox.baseOffset;
    }

    if (Array.isArray(repairBox?.offset)) {
      return repairBox.offset;
    }

    const patches = (session.groundFlowerPatches || [])
      .filter((patch) => {
        return patch.habitatGroupId === BEE_FIELD_FLOWER_GROUP_ID &&
          Array.isArray(patch.position);
      });

    if (patches.length === 0) {
      return null;
    }

    const total = patches.reduce((sum, patch) => {
      sum[0] += patch.position[0];
      sum[1] += patch.position[1] || 0;
      sum[2] += patch.position[2];
      return sum;
    }, [0, 0, 0]);

    return [
      total[0] / patches.length,
      total[1] / patches.length,
      total[2] / patches.length
    ];
  }

  function createBeeFieldBeeInstance(index) {
    return {
      id: `bee-field-bee-${index}`,
      offset: [0, 0, 0],
      scale: BEE_FIELD_BEE_SCALE,
      yaw: BEE_MODEL_FACE_YAW_OFFSET,
      pitch: 0,
      roll: 0,
      active: true,
      patrolAngle: (index / BEE_FIELD_BEE_COUNT) * Math.PI * 2,
      patrolRadiusScale: 0.62 + (index % 5) * 0.09,
      angularSpeed: 0.42 + (index % 4) * 0.055,
      bobPhase: index * 1.71,
      bobSpeed: 1.7 + (index % 3) * 0.18
    };
  }

  function syncBeeFieldBees(deltaTime) {
    if (!Array.isArray(session.beeInstances)) {
      return;
    }

    const opened = Boolean(controls.storyState?.flags?.beeFieldRepairBoxOpened);
    const center = getBeeFieldCenterPosition();

    if (!opened || !session.beeModel || !center) {
      session.beeInstances.length = 0;
      return;
    }

    session.beePatrolState ||= { elapsed: 0 };
    session.beePatrolState.elapsed += Math.max(0, Number(deltaTime) || 0);

    while (session.beeInstances.length < BEE_FIELD_BEE_COUNT) {
      session.beeInstances.push(createBeeFieldBeeInstance(session.beeInstances.length));
    }

    if (session.beeInstances.length > BEE_FIELD_BEE_COUNT) {
      session.beeInstances.length = BEE_FIELD_BEE_COUNT;
    }

    const elapsed = session.beePatrolState.elapsed;

    session.beeInstances.forEach((bee, index) => {
      const angle = bee.patrolAngle + elapsed * bee.angularSpeed;
      const radiusScale = bee.patrolRadiusScale || 1;
      const wobble = Math.sin(elapsed * 1.3 + bee.bobPhase) * 0.28;
      const x = center[0] + Math.cos(angle) * BEE_FIELD_BEE_PATROL_RADIUS_X * radiusScale +
        Math.sin(angle * 2 + bee.bobPhase) * 0.26;
      const z = center[2] + Math.sin(angle) * BEE_FIELD_BEE_PATROL_RADIUS_Z * radiusScale +
        Math.cos(angle * 2 + bee.bobPhase) * 0.18;
      const y = (center[1] || 0) + BEE_FIELD_BEE_BASE_HEIGHT +
        Math.sin(elapsed * bee.bobSpeed + bee.bobPhase) * BEE_FIELD_BEE_BOB_HEIGHT;

      bee.active = true;
      bee.offset[0] = x;
      bee.offset[1] = y;
      bee.offset[2] = z;
      bee.scale = BEE_FIELD_BEE_SCALE * (0.9 + (index % 3) * 0.06);
      bee.yaw = angle + Math.PI * 0.5 + BEE_MODEL_FACE_YAW_OFFSET;
      bee.pitch = Math.sin(elapsed * 1.8 + bee.bobPhase) * 0.04;
      bee.roll = wobble * 0.08;
    });
  }

  function appendGrassCollisionObject(objects, position, radius = GRASS_OBJECT_COLLISION_BASE_RADIUS) {
    if (!Array.isArray(position) || position.length < 3) {
      return;
    }

    const x = Number(position[0]);
    const z = Number(position[2]);

    if (!Number.isFinite(x) || !Number.isFinite(z)) {
      return;
    }

    objects.push({
      position,
      radius
    });
  }

  function getGrassCollisionObjects() {
    const objects = [];

    if (session.playerCharacter) {
      appendGrassCollisionObject(objects, session.playerCharacter.getPosition?.(), 0.52);
    }

    appendGrassCollisionObject(objects, session.chopperNpcActor?.bodyInstance?.offset, 0.54);

    if (session.actTwoSquirtle?.modelInstance?.active) {
      appendGrassCollisionObject(
        objects,
        session.actTwoSquirtle.position || session.actTwoSquirtle.modelInstance.offset,
        0.48
      );
    }

    if (session.bulbasaurEncounter?.visible) {
      appendGrassCollisionObject(
        objects,
        session.bulbasaurEncounter.position || session.bulbasaurEncounter.modelInstance?.offset,
        0.66
      );
    }

    if (session.charmanderEncounter?.visible) {
      appendGrassCollisionObject(objects, session.charmanderEncounter.position, 0.54);
    }

    if (session.timburrEncounter?.visible) {
      appendGrassCollisionObject(objects, session.timburrEncounter.position, 0.56);
    }

    for (const repairModuleInstance of session.robotRepairModuleInstances || []) {
      if (repairModuleInstance?.active !== false) {
        appendGrassCollisionObject(
          objects,
          repairModuleInstance.baseOffset || repairModuleInstance.offset,
          0.62
        );
      }
    }

    return objects;
  }

  function getGrassObjectCollisionAlpha(groundGrassPatch, objects) {
    if (!Array.isArray(groundGrassPatch?.position) || !objects.length) {
      return 1;
    }

    const patchRadius = Math.max(
      groundGrassPatch.size?.[0] || TALL_GRASS_MIN_FOOTPRINT,
      groundGrassPatch.size?.[1] || TALL_GRASS_MIN_FOOTPRINT
    ) * 0.42;

    for (const object of objects) {
      const radius = patchRadius + object.radius;
      const deltaX = groundGrassPatch.position[0] - object.position[0];
      const deltaZ = groundGrassPatch.position[2] - object.position[2];

      if (deltaX * deltaX + deltaZ * deltaZ <= radius * radius) {
        return GRASS_OBJECT_COLLISION_ALPHA;
      }
    }

    return 1;
  }

  function syncActiveRepairBoxHighlight() {
    const repairModuleInstances = [
      session.actTwoSquirtle?.repairModuleInstance,
      session.bulbasaurEncounter?.repairModuleInstance,
      session.charmanderEncounter?.repairModuleInstance,
      session.timburrEncounter?.repairModuleInstance
    ];
    let highlighted = false;

    for (const repairModuleInstance of repairModuleInstances) {
      if (!repairModuleInstance) {
        continue;
      }

      if (
        (
          repairModuleInstance === session.bulbasaurEncounter?.repairModuleInstance &&
          session.bulbasaurEncounter?.revealBoxOpening?.active
        ) ||
        (
          repairModuleInstance === session.charmanderEncounter?.repairModuleInstance &&
          session.charmanderEncounter?.revealBoxOpening?.active
        )
      ) {
        highlighted = true;
        continue;
      }

      if (!highlighted && repairModuleInstance.active) {
        repairModuleInstance.tint = REPAIR_BOX_ACTIVE_TINT;
        repairModuleInstance.tintStrength = REPAIR_BOX_ACTIVE_TINT_STRENGTH;
        repairModuleInstance.alpha = 1;
        highlighted = true;
        continue;
      }

      repairModuleInstance.tint = null;
      repairModuleInstance.tintStrength = 0;
      repairModuleInstance.alpha = repairModuleInstance.active ? REPAIR_BOX_INACTIVE_ALPHA : 1;
    }
  }

  function getSelectedRepairBoxParticleTarget() {
    const repairModuleInstances = [
      session.actTwoSquirtle?.repairModuleInstance,
      session.bulbasaurEncounter?.repairModuleInstance,
      session.charmanderEncounter?.repairModuleInstance,
      session.timburrEncounter?.repairModuleInstance
    ];
    const selectedRepairModule = repairModuleInstances.find((instance) => {
      return instance?.active && Array.isArray(instance.offset);
    });

    return selectedRepairModule ?
      {
        id: `${selectedRepairModule.id}-rustling-particles`,
        position: [...selectedRepairModule.offset]
      } :
      null;
  }

  function getRepairBoxRevealParticleTarget() {
    const encounter = [
      session.bulbasaurEncounter,
      session.charmanderEncounter
    ].find((candidate) => candidate?.revealBoxOpening?.active);
    const opening = encounter?.revealBoxOpening;

    if (!opening?.active) {
      return null;
    }

    const position =
      encounter?.repairModuleInstance?.offset ||
      encounter?.repairModuleInstance?.baseOffset ||
      getEncounterRepairBoxPosition(encounter);

    return Array.isArray(position) ?
      {
        id: `${encounter.repairModuleInstance?.id || "bot"}-reveal-rays`,
        position: [...position],
        progress: clamp01(Number(opening.elapsed || 0) / Number(opening.duration || 1))
      } :
      null;
  }

  function isBulbasaurRepairBoxRustlingActive() {
    const flags = controls.storyState?.flags || {};
    const rustlingGrassCellId = flags.rustlingGrassCellId;

    if (
      !rustlingGrassCellId ||
      !flags.chopperBulbasaurRepairBoxIntroComplete ||
      flags.bulbasaurRevealed ||
      !session.bulbasaurEncounter?.repairModuleInstance?.active
    ) {
      return false;
    }

    return (session.groundGrassPatches || []).some((groundGrassPatch) => {
      return groundGrassPatch?.cellId === rustlingGrassCellId &&
        groundGrassPatch.state === "alive";
    });
  }

  function getBulbasaurRepairBoxInvestigationTarget() {
    if (!isBulbasaurRepairBoxRustlingActive()) {
      return null;
    }

    const repairBoxPosition = getEncounterRepairBoxPosition(session.bulbasaurEncounter);

    if (!Array.isArray(repairBoxPosition)) {
      return null;
    }

    return {
      position: [
        repairBoxPosition[0] + CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET[0],
        repairBoxPosition[1] + CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET[1],
        repairBoxPosition[2] + CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET[2]
      ],
      lookAtPosition: [...repairBoxPosition]
    };
  }

  function isPlayerNearWorldPosition(worldPosition, distance) {
    const playerPosition = session.playerCharacter?.getPosition?.();

    if (!Array.isArray(playerPosition) || !Array.isArray(worldPosition)) {
      return false;
    }

    return Math.hypot(
      playerPosition[0] - worldPosition[0],
      playerPosition[2] - worldPosition[2]
    ) <= distance;
  }

  function getRepairBoxPromptPosition(encounter) {
    const basePosition =
      getEncounterRepairBoxPosition(encounter) ||
      encounter?.repairModuleInstance?.baseOffset ||
      encounter?.repairModuleInstance?.offset;

    return Array.isArray(basePosition) ? [...basePosition] : null;
  }

  function getNearbyRepairBoxPrompt(playerPosition) {
    if (!Array.isArray(playerPosition)) {
      return null;
    }

    const repairBoxTargets = [
      {
        name: SANDBOTS_BOT_NAMES.hydro,
        encounter: session.actTwoSquirtle
      },
      {
        name: SANDBOTS_BOT_NAMES.grow,
        encounter: session.bulbasaurEncounter
      },
      {
        name: SANDBOTS_BOT_NAMES.thermal,
        encounter: session.charmanderEncounter
      },
      {
        name: SANDBOTS_BOT_NAMES.builder,
        encounter: session.timburrEncounter
      }
    ];
    let nearestPrompt = null;
    let nearestDistance = Infinity;

    for (const repairBoxTarget of repairBoxTargets) {
      if (!repairBoxTarget?.encounter?.repairModuleInstance?.active) {
        continue;
      }

      const worldPosition = getRepairBoxPromptPosition(repairBoxTarget.encounter);

      if (!worldPosition) {
        continue;
      }

      const distance = Math.hypot(
        playerPosition[0] - worldPosition[0],
        playerPosition[2] - worldPosition[2]
      );

      if (distance <= REPAIR_BOX_PROMPT_DISTANCE && distance < nearestDistance) {
        nearestPrompt = {
          text: repairBoxTarget.name,
          worldPosition
        };
        nearestDistance = distance;
      }
    }

    return nearestPrompt;
  }

  function syncInteractablePosition(interactableId, position) {
    if (!Array.isArray(position) || !Array.isArray(session.interactables)) {
      return;
    }

    const interactable = session.interactables.find((entry) => entry.id === interactableId);
    if (interactable) {
      interactable.position = [...position];
    }
  }

  function syncWorkbenchInteractable() {
    syncInteractablePosition("workbench", WORKBENCH_POSITION);
    const workbench = session.interactables?.find((entry) => entry.id === "workbench");
    if (workbench) {
      workbench.interactDistance = WORKBENCH_INTERACT_DISTANCE;
    }
  }

  function syncPokemonCenterWorkshopVisualState() {
    const assembled = Boolean(controls.storyState?.flags?.challengesUnlocked);

    if (session.pokemonCenterWorkshopAssembledInstance) {
      session.pokemonCenterWorkshopAssembledInstance.active = assembled;
    }

    for (const instance of session.pokemonCenterWorkshopDismantledInstances || []) {
      instance.active = !assembled;
    }
  }

  function getPlayerModelYawFromMovement(deltaX, deltaZ) {
    return Math.atan2(deltaZ, deltaX) + PLAYER_MODEL_FACE_YAW_OFFSET;
  }

  function getPlayerWalkLegArcOffset(yaw, phase, blend) {
    const swing = Math.sin(phase);
    const forwardKick = Math.max(0, swing);
    const stride = swing * PLAYER_WALK_FOOT_KICK_STRIDE * blend;
    const lift = Math.pow(forwardKick, 0.55) * PLAYER_WALK_FOOT_KICK_LIFT * blend;

    return [
      Math.cos(yaw) * stride,
      lift,
      Math.sin(yaw) * stride
    ];
  }

  function updatePlayerWalkCycle(deltaTime, isWalking) {
    const targetSpeed = isWalking ? PLAYER_WALK_LEG_CYCLE_SPEED : 0;
    const acceleration = isWalking ?
      PLAYER_WALK_LEG_ACCELERATION :
      PLAYER_WALK_LEG_DECELERATION;
    const nextSpeed = moveValueToward(
      Number(session.playerWalkLegSpeed) || 0,
      targetSpeed,
      acceleration * deltaTime
    );

    session.playerWalkLegSpeed = nextSpeed;

    if (isWalking || nextSpeed > 0.001) {
      session.playerWalkLegPhase =
        (Number(session.playerWalkLegPhase) || 0) + nextSpeed * deltaTime;
    }

    return Math.min(1, nextSpeed / PLAYER_WALK_LEG_CYCLE_SPEED);
  }

  function getPlayerWalkBodyLift(phase, blend) {
    const bounce = Math.abs(Math.cos(phase));
    return Math.pow(bounce, 0.7) * PLAYER_WALK_BODY_BOB * blend;
  }

  function startPlayerJumpFlip() {
    session.playerJumpFlipElapsed = 0;
    playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_JUMP);
  }

  function updatePlayerJumpFlipRoll(deltaTime) {
    const elapsed = Number(session.playerJumpFlipElapsed);
    if (!Number.isFinite(elapsed) || elapsed >= PLAYER_JUMP_FLIP_DURATION) {
      session.playerJumpFlipElapsed = PLAYER_JUMP_FLIP_DURATION;
      return 0;
    }

    const nextElapsed = Math.min(PLAYER_JUMP_FLIP_DURATION, elapsed + deltaTime);
    session.playerJumpFlipElapsed = nextElapsed;
    const progress = nextElapsed / PLAYER_JUMP_FLIP_DURATION;
    return -PLAYER_JUMP_FLIP_ROTATION * progress;
  }

  function getPlayerWalkFootRoll(phase, blend) {
    return -Math.sin(phase) * PLAYER_WALK_FOOT_PENDULUM_ROLL * blend;
  }

  function getPlayerWalkArmBackOffset(yaw, blend) {
    const back = PLAYER_WALK_ARM_BACK_OFFSET * blend;

    return [
      -Math.cos(yaw) * back,
      PLAYER_WALK_ARM_LIFT * blend,
      -Math.sin(yaw) * back
    ];
  }

  function syncPlayerLegInstance(instance, basePosition, baseInstance, offset, roll = 0) {
    if (!instance) {
      return;
    }

    instance.offset = [
      basePosition[0] + offset[0],
      basePosition[1] + offset[1],
      basePosition[2] + offset[2]
    ];
    instance.scale = baseInstance.scale;
    instance.yaw = baseInstance.yaw || 0;
    instance.pitch = baseInstance.pitch || 0;
    instance.roll = (baseInstance.roll || 0) + roll;
    instance.active = baseInstance.active;
  }

  function syncPlayerLegModelInstances(basePosition, walkBlend) {
    const legInstances = session.playerLegModelInstances;

    if (!legInstances?.left || !legInstances?.right) {
      return;
    }

    const visualYaw = (session.playerModelInstance.yaw || 0) - PLAYER_MODEL_FACE_YAW_OFFSET;
    const phase = Number(session.playerWalkLegPhase) || 0;

    syncPlayerLegInstance(
      legInstances.left,
      basePosition,
      session.playerModelInstance,
      getPlayerWalkLegArcOffset(visualYaw, phase, walkBlend),
      getPlayerWalkFootRoll(phase, walkBlend)
    );
    syncPlayerLegInstance(
      legInstances.right,
      basePosition,
      session.playerModelInstance,
      getPlayerWalkLegArcOffset(visualYaw, phase + Math.PI, walkBlend),
      getPlayerWalkFootRoll(phase + Math.PI, walkBlend)
    );
  }

  function syncPlayerArmInstance(instance, baseInstance, offset, pitch = 0) {
    if (!instance) {
      return;
    }

    const basePosition = baseInstance.offset || [0, 0, 0];
    instance.offset = [
      basePosition[0] + offset[0],
      basePosition[1] + offset[1],
      basePosition[2] + offset[2]
    ];
    instance.scale = baseInstance.scale;
    instance.yaw = baseInstance.yaw || 0;
    instance.pitch = (baseInstance.pitch || 0) + pitch;
    instance.roll = baseInstance.roll || 0;
    instance.active = baseInstance.active;
  }

  function syncPlayerArmModelInstances(walkBlend) {
    const armInstances = session.playerArmModelInstances;

    if (!armInstances?.left || !armInstances?.right) {
      return;
    }

    const visualYaw = (session.playerModelInstance.yaw || 0) - PLAYER_MODEL_FACE_YAW_OFFSET;
    const offset = getPlayerWalkArmBackOffset(visualYaw, walkBlend);
    const pitch = PLAYER_WALK_ARM_BACK_PITCH * walkBlend;

    syncPlayerArmInstance(armInstances.left, session.playerModelInstance, offset, pitch);
    syncPlayerArmInstance(armInstances.right, session.playerModelInstance, offset, pitch);
  }

  function syncPlayerModelInstance(deltaTime, movementDelta = null) {
    if (!session.playerModelInstance || !session.playerCharacter) {
      return;
    }

    const playerPosition = session.playerCharacter.getPosition();
    const movementDistance = movementDelta ?
      Math.hypot(movementDelta[0], movementDelta[1]) :
      0;
    const isWalking = movementDistance > 0.0005;
    const walkBlend = updatePlayerWalkCycle(deltaTime, isWalking);
    const bodyLift = getPlayerWalkBodyLift(
      Number(session.playerWalkLegPhase) || 0,
      walkBlend
    );

    session.playerModelInstance.offset = [
      playerPosition[0],
      playerPosition[1] + bodyLift,
      playerPosition[2]
    ];
    session.playerModelInstance.scale = PLAYER_MODEL_SCALE;
    session.playerModelInstance.pitch = 0;
    session.playerModelInstance.roll = updatePlayerJumpFlipRoll(deltaTime);

    if (isWalking) {
      const [deltaX, deltaZ] = movementDelta;
      const targetYaw = getPlayerModelYawFromMovement(deltaX, deltaZ);
      session.playerModelInstance.yaw = rotateAngleToward(
        session.playerModelInstance.yaw || 0,
        targetYaw,
        PLAYER_MODEL_TURN_SPEED * deltaTime
      );
    }

    session.playerModelInstance.active = true;
    syncPlayerLegModelInstances(playerPosition, walkBlend);
    syncPlayerArmModelInstances(walkBlend);
  }

  function createPrimitiveModel(model, primitive) {
    return {
      ...model,
      primitives: [primitive]
    };
  }

  function getSquirtleAssemblyPartPose(index, progress) {
    const scatterProgress = easeOutCubic(progress);
    const angle = index * 1.78;
    const radius = 0.42 + (index % 4) * 0.14;
    const lifted = 0.04 + (index % 3) * 0.035;
    const startX = Math.cos(angle) * radius;
    const startZ = Math.sin(angle) * radius;

    return {
      offset: [
        lerp(startX, 0, scatterProgress),
        lerp(lifted, 0, scatterProgress),
        lerp(startZ, 0, scatterProgress)
      ],
      yaw: lerp(((index % 5) - 2) * 0.62, 0, scatterProgress),
      pitch: lerp(((index % 3) - 1) * 0.42, 0, scatterProgress),
      roll: lerp(((index % 4) - 1.5) * 0.54, 0, scatterProgress)
    };
  }

  function updateSquirtleReassembly(deltaTime) {
    const squirtle = session.actTwoSquirtle;
    const reassembly = squirtle?.reassembly;

    if (!reassembly?.active) {
      return;
    }

    const duration = Math.max(0.01, reassembly.duration || 1.25);
    reassembly.elapsed = Math.min(duration, (reassembly.elapsed || 0) + deltaTime);
    reassembly.progress = clamp01(reassembly.elapsed / duration);

    if (reassembly.progress < 1) {
      return;
    }

    const onComplete = reassembly.onComplete;
    reassembly.active = false;
    reassembly.onComplete = null;
    squirtle.visible = true;
    squirtle.assemblyState = "assembled";
    syncSquirtleModelInstance();

    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  function createRobotPatrolState(origin, radius) {
    return {
      origin: [...origin],
      waypointIndex: 0,
      pauseTimer: ROBOT_IDLE_PATROL_PAUSE_DURATION,
      points: [
        [origin[0] - radius * 0.72, origin[1], origin[2] - radius * 0.34],
        [origin[0] + radius * 0.66, origin[1], origin[2] - radius * 0.48],
        [origin[0] + radius * 0.58, origin[1], origin[2] + radius * 0.42],
        [origin[0] - radius * 0.64, origin[1], origin[2] + radius * 0.52]
      ]
    };
  }

  function updateRobotIdlePatrol(robot, {
    deltaTime,
    radius,
    modelFaceYawOffset
  }) {
    if (!robot?.modelInstance || !Array.isArray(robot.position)) {
      return;
    }

    if (
      !robot.patrol ||
      Math.hypot(
        robot.position[0] - robot.patrol.origin[0],
        robot.position[2] - robot.patrol.origin[2]
      ) > radius * 1.8
    ) {
      robot.patrol = createRobotPatrolState(robot.position, radius);
    }

    if (robot.patrol.pauseTimer > 0) {
      robot.patrol.pauseTimer = Math.max(0, robot.patrol.pauseTimer - deltaTime);
      return;
    }

    const targetPosition = robot.patrol.points[robot.patrol.waypointIndex];
    const deltaX = targetPosition[0] - robot.position[0];
    const deltaZ = targetPosition[2] - robot.position[2];
    const distance = Math.hypot(deltaX, deltaZ);

    if (distance <= ROBOT_IDLE_PATROL_ARRIVE_DISTANCE) {
      robot.patrol.waypointIndex = (robot.patrol.waypointIndex + 1) % robot.patrol.points.length;
      robot.patrol.pauseTimer = ROBOT_IDLE_PATROL_PAUSE_DURATION;
      return;
    }

    const step = Math.min(distance, ROBOT_IDLE_PATROL_SPEED * deltaTime);
    robot.position = [
      robot.position[0] + (deltaX / distance) * step,
      targetPosition[1],
      robot.position[2] + (deltaZ / distance) * step
    ];
    robot.modelInstance.yaw = getRobotModelYawToward(
      robot.position,
      targetPosition,
      modelFaceYawOffset
    );
  }

  function faceIdleBotTowardPlayer(robot, { modelFaceYawOffset = 0 } = {}) {
    const attentionFacing = resolveBotAttentionFacing({
      botPosition: robot?.position,
      playerPosition: session.playerCharacter?.getPosition?.(),
      attentionDistance: BOT_PLAYER_ATTENTION_DISTANCE,
      modelFaceYawOffset
    });

    if (!attentionFacing || !robot?.modelInstance) {
      return false;
    }

    robot.modelInstance.yaw = attentionFacing.yaw;
    return true;
  }

  function getFreeBlockBuildGridConfig() {
    const config = session.buildGridConfig || session.gridPlacement?.gridConfig || FREE_BLOCK_BUILD_GRID_CONFIG;
    return {
      cellSize: Number(config.cellSize || FREE_BLOCK_BUILD_GRID_CONFIG.cellSize),
      origin: {
        x: Number(config.origin?.x ?? FREE_BLOCK_BUILD_GRID_CONFIG.origin.x),
        y: Number(config.origin?.y ?? FREE_BLOCK_BUILD_GRID_CONFIG.origin.y),
        z: Number(config.origin?.z ?? FREE_BLOCK_BUILD_GRID_CONFIG.origin.z)
      },
      width: Math.max(1, Math.trunc(Number(config.width || FREE_BLOCK_BUILD_GRID_CONFIG.width))),
      height: Math.max(1, Math.trunc(Number(config.height || FREE_BLOCK_BUILD_GRID_CONFIG.height))),
      visualOffsetY: Number(config.visualOffsetY ?? FREE_BLOCK_BUILD_GRID_CONFIG.visualOffsetY)
    };
  }

  function isBuildBlockFieldMoveEquipped() {
    return Boolean(
      controls.playerSkills?.buildBlock &&
      controls.getActiveMoveId?.() === "buildBlock"
    );
  }

  function normalizeBuilderTutorialFoundationOriginCell(originCell = null) {
    const x = Math.trunc(Number(originCell?.x));
    const y = Math.trunc(Number(originCell?.y ?? originCell?.z));
    return {
      x: Number.isFinite(x) ? x : BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL.x,
      y: Number.isFinite(y) ? y : BUILDER_TUTORIAL_FOUNDATION_DEFAULT_ORIGIN_CELL.y
    };
  }

  function isBuilderTutorialFoundationOriginInsideGrid(originCell) {
    const gridConfig = getFreeBlockBuildGridConfig();
    return originCell.x >= 0 &&
      originCell.y >= 0 &&
      originCell.x + BUILDER_TUTORIAL_FOUNDATION_WIDTH <= gridConfig.width &&
      originCell.y + BUILDER_TUTORIAL_FOUNDATION_HEIGHT <= gridConfig.height;
  }

  function getSavedBuilderTutorialFoundationOriginCell() {
    return normalizeBuilderTutorialFoundationOriginCell(
      controls.storyState?.flags?.[BUILDER_TUTORIAL_FOUNDATION_ORIGIN_FLAG]
    );
  }

  function saveBuilderTutorialFoundationOriginCell(originCell) {
    const flags = controls.storyState?.flags;
    if (!flags) {
      return;
    }

    const normalizedOrigin = normalizeBuilderTutorialFoundationOriginCell(originCell);
    flags[BUILDER_TUTORIAL_FOUNDATION_ORIGIN_FLAG] = {
      x: normalizedOrigin.x,
      y: normalizedOrigin.y
    };
  }

  function getFoundationBuildZoneCellKeys(buildZone = null) {
    return new Set((buildZone?.cells || []).map((cell) => `${cell.x}:${cell.y}`));
  }

  function getFoundationBuildZoneWorldRect(buildZone = null) {
    if (!buildZone?.originCell) {
      return null;
    }

    const gridConfig = getFreeBlockBuildGridConfig();
    const cellSize = Number(gridConfig.cellSize || 1);
    const minX = gridConfig.origin.x + buildZone.originCell.x * cellSize;
    const minZ = gridConfig.origin.z + buildZone.originCell.y * cellSize;

    return {
      minX,
      maxX: minX + buildZone.width * cellSize,
      minZ,
      maxZ: minZ + buildZone.height * cellSize
    };
  }

  function createFoundationBuildZoneBlocker({
    id = "blocker",
    kind = "object",
    position = null,
    size = null,
    radius = null
  } = {}) {
    if (!Array.isArray(position)) {
      return null;
    }

    const x = Number(position[0]);
    const z = Number(position[2]);
    if (!Number.isFinite(x) || !Number.isFinite(z)) {
      return null;
    }

    const width = Number(radius) > 0 ?
      Number(radius) * 2 :
      Math.max(0.1, Number(size?.[0]) || 1);
    const depth = Number(radius) > 0 ?
      Number(radius) * 2 :
      Math.max(0.1, Number(size?.[1] ?? size?.[2]) || width);

    return {
      id,
      kind,
      minX: x - width * 0.5,
      maxX: x + width * 0.5,
      minZ: z - depth * 0.5,
      maxZ: z + depth * 0.5
    };
  }

  function doFoundationRectsOverlap(left, right, padding = 0.08) {
    if (!left || !right) {
      return false;
    }

    return left.minX < right.maxX + padding &&
      left.maxX > right.minX - padding &&
      left.minZ < right.maxZ + padding &&
      left.maxZ > right.minZ - padding;
  }

  function isFoundationFreeBlockAllowedInZone(instance, buildZone) {
    if (!instance?.freeBlockCell || !buildZone) {
      return false;
    }

    const zoneCellKeys = getFoundationBuildZoneCellKeys(buildZone);
    const cell = instance.freeBlockCell;
    if (!zoneCellKeys.has(`${cell.x}:${cell.y}`)) {
      return false;
    }

    return Boolean(session.freeBlockBuildState?.getBlockAtCell?.(cell));
  }

  function getFoundationBuildZoneProgressCount(buildZone = null) {
    const progress = getFreeBlockBuildZoneProgress({
      buildState: session.freeBlockBuildState,
      buildZone,
      blockType: FREE_BLOCK_TYPES.WALL
    });
    if (progress.completedCount > 0) {
      return progress.completedCount;
    }

    const zoneCellKeys = getFoundationBuildZoneCellKeys(buildZone);
    return (session.freeBlockBuildSnapshot?.floorBlocks || [])
      .filter((block) => {
        const cell = block?.cell || block;
        return zoneCellKeys.has(`${cell?.x}:${cell?.y}`);
      })
      .length;
  }

  function getFoundationBuildZoneBlockers(buildZone = null) {
    const blockers = [];
    const pushBlocker = (blocker) => {
      if (blocker) {
        blockers.push(blocker);
      }
    };

    for (const collider of getPlayerConstructionTerrainColliders()) {
      if (collider.kind === "freeBlock") {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: collider.id,
        kind: collider.kind,
        position: collider.position,
        size: [collider.size?.[0], collider.size?.[2]]
      }));
    }

    for (const instance of session.freeBlockInstances || []) {
      if (
        instance?.active === false ||
        !Array.isArray(instance?.offset) ||
        isFoundationFreeBlockAllowedInZone(instance, buildZone)
      ) {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: instance.id ? `free-block:${instance.id}` : "free-block",
        kind: "freeBlock",
        position: instance.offset,
        size: [1, 1]
      }));
    }

    for (const blocker of getWorldObjectPlacementBlockers(session)) {
      pushBlocker(createFoundationBuildZoneBlocker(blocker));
    }

    if (session.playerCharacter?.getPosition) {
      pushBlocker(createFoundationBuildZoneBlocker({
        id: "player",
        kind: "player",
        position: session.playerCharacter.getPosition(),
        radius: 0.55
      }));
    }

    for (const npcActor of session.npcActors || []) {
      if (rendering?.isNpcActive?.(npcActor, controls.storyState) === false) {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: npcActor.id ? `npc:${npcActor.id}` : "npc",
        kind: "npc",
        position: getActorDebugPosition(npcActor),
        radius: 0.72
      }));
    }

    for (const interactable of session.interactables || []) {
      if (rendering?.isInteractableActive?.(interactable, controls.storyState) === false) {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: interactable.id ? `interactable:${interactable.id}` : "interactable",
        kind: "interactable",
        position: interactable.position,
        radius: Number(interactable.interactDistance) || 1.1
      }));
    }

    for (const companion of [
      session.actTwoSquirtle,
      session.bulbasaurEncounter,
      session.timburrEncounter,
      session.charmanderEncounter
    ]) {
      if (companion?.visible === false) {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: companion?.id ? `companion:${companion.id}` : "companion",
        kind: "companion",
        position: companion?.position || companion?.repairPosition || null,
        radius: 0.72
      }));
    }

    for (const resourceNode of session.resourceNodes || []) {
      if (rendering?.isResourceNodeActive?.(resourceNode, controls.storyState) === false) {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: resourceNode.id ? `resource:${resourceNode.id}` : "resource",
        kind: "resource",
        position: resourceNode.position,
        radius: 0.72
      }));
    }

    for (const drop of [
      ...(session.woodDrops || []),
      ...(session.fieldDrops || []),
      ...(session.leppaBerryDrops || [])
    ]) {
      if (drop?.collected) {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: drop?.id ? `drop:${drop.id}` : "drop",
        kind: "drop",
        position: drop?.position,
        radius: 0.42
      }));
    }

    for (const patch of [
      ...(session.groundGrassPatches || []),
      ...(session.groundFlowerPatches || [])
    ]) {
      if (!Array.isArray(patch?.position)) {
        continue;
      }

      pushBlocker(createFoundationBuildZoneBlocker({
        id: patch?.id || patch?.cellId || "ground-patch",
        kind: "groundPatch",
        position: patch.position,
        radius: 0.48
      }));
    }

    return blockers;
  }

  function isBuilderTutorialFoundationBuildZoneBlocked(buildZone = null) {
    const zoneRect = getFoundationBuildZoneWorldRect(buildZone);
    if (!zoneRect) {
      return true;
    }

    return getFoundationBuildZoneBlockers(buildZone)
      .some((blocker) => doFoundationRectsOverlap(zoneRect, blocker));
  }

  function findAvailableBuilderTutorialFoundationBuildZone() {
    for (const originCell of buildBuilderTutorialFoundationCandidateOrigins()) {
      if (!isBuilderTutorialFoundationOriginInsideGrid(originCell)) {
        continue;
      }

      const candidateZone = createBuilderTutorialFoundationBuildZone(originCell);
      if (!isBuilderTutorialFoundationBuildZoneBlocked(candidateZone)) {
        return candidateZone;
      }
    }

    return null;
  }

  function syncActiveFreeBlockBuildZone() {
    const savedOrigin = getSavedBuilderTutorialFoundationOriginCell();
    let buildZone = createBuilderTutorialFoundationBuildZone(savedOrigin);
    const hasFoundationProgress = getFoundationBuildZoneProgressCount(buildZone) > 0;

    if (!isBuilderTutorialFoundationBuildZoneBlocked(buildZone)) {
      saveBuilderTutorialFoundationOriginCell(buildZone.originCell);
      session.freeBlockBuildZoneUnavailable = false;
      session.activeFreeBlockBuildZone = buildZone;
      return buildZone;
    }

    if (!hasFoundationProgress) {
      const availableZone = findAvailableBuilderTutorialFoundationBuildZone();
      if (availableZone) {
        buildZone = availableZone;
        saveBuilderTutorialFoundationOriginCell(buildZone.originCell);
        session.freeBlockBuildZoneUnavailable = false;
        session.activeFreeBlockBuildZone = buildZone;
        return buildZone;
      }
    }

    session.freeBlockBuildZoneUnavailable = true;
    session.activeFreeBlockBuildZone = buildZone;
    return buildZone;
  }

  function getActiveFreeBlockBuildZone() {
    return syncActiveFreeBlockBuildZone();
  }

  function isFoundationBuildZoneUnavailable() {
    return Boolean(session.freeBlockBuildZoneUnavailable);
  }

  function getFreeBlockBuildZoneCenterPosition(buildZone = getActiveFreeBlockBuildZone()) {
    if (!buildZone?.originCell) {
      return null;
    }

    const gridConfig = getFreeBlockBuildGridConfig();
    const cellSize = Number(gridConfig.cellSize || 1);
    return [
      Number((gridConfig.origin.x + (buildZone.originCell.x + buildZone.width * 0.5) * cellSize).toFixed(3)),
      Number((gridConfig.origin.y + gridConfig.visualOffsetY).toFixed(3)),
      Number((gridConfig.origin.z + (buildZone.originCell.y + buildZone.height * 0.5) * cellSize).toFixed(3))
    ];
  }

  function getFreeBlockInvalidPlacementNotice(reason) {
    if (reason === "outside-build-zone") {
      return "Build inside the blue foundation.";
    }

    if (reason === "duplicate-block") {
      return "That foundation edge is already built.";
    }

    if (reason === "player-cell") {
      return "Step off the foundation edge first.";
    }

    if (reason === "blocked-cell") {
      return "That foundation edge is blocked.";
    }

    if (reason === "outside-build-area") {
      return "Move back to the foundation build area.";
    }

    return "Block can't be placed there.";
  }

  function getFreeBlockPlacementNotice(result) {
    if (result?.reason === "missing-material") {
      return "Need Wood";
    }

    if (result?.placed && result.blockType === FREE_BLOCK_TYPES.WALL) {
      return "Wall placed.";
    }

    return result?.placed ? "Block placed." : getFreeBlockInvalidPlacementNotice(result?.reason);
  }

  function formatFreeBlockCostNumber(value) {
    const number = Math.max(0, Number(value) || 0);
    return Number.isInteger(number) ? String(number) : number.toFixed(1);
  }

  function getFreeBlockBuildCostMarker(previewTarget = null) {
    if (!Array.isArray(previewTarget?.targetPosition)) {
      return null;
    }

    const materialCost = getFreeBlockBuildController()?.getSelectedBlockMaterialCost?.();
    if (!materialCost?.itemId) {
      return null;
    }

    const required = Math.max(0, Number(materialCost.quantity) || 0);
    const available = Math.max(0, Number(controls.inventory?.[materialCost.itemId] || 0));

    return {
      text: `${formatFreeBlockCostNumber(required)}/${formatFreeBlockCostNumber(available)}`,
      affordable: available >= required,
      worldPosition: previewTarget.targetPosition
    };
  }

  function getFreeBlockBuildController() {
    const gridConfig = getFreeBlockBuildGridConfig();
    const gridSignature = JSON.stringify(gridConfig);
    if (
      session.freeBlockPlacementController &&
      session.freeBlockPlacementGridSignature === gridSignature
    ) {
      return session.freeBlockPlacementController;
    }

    const gridSystem = createGridSystem(gridConfig);
    session.freeBlockInstances ||= [];
    session.freeBlockBuildState = createFreeBlockBuildState({
      buildId: "freeBuild",
      bounds: {
        originCell: { x: 0, y: 0 },
        width: gridSystem.width,
        height: gridSystem.height
      }
    });
    session.freeBlockPlacementController = createFreeBlockBuildController({
      gridSystem,
      buildState: session.freeBlockBuildState,
      blockInstanceStore: session.freeBlockInstances,
      initialBlockType: FREE_BLOCK_TYPES.WALL
    });
    if (session.freeBlockBuildSnapshot) {
      session.freeBlockBuildState.restoreFreeBlocks(session.freeBlockBuildSnapshot);
      session.freeBlockPlacementController.syncInstancesFromState();
    }
    session.freeBlockPlacementGridSignature = gridSignature;
    return session.freeBlockPlacementController;
  }

  function hasFoundationWallObjective(quest = null) {
    return (quest?.objectives || []).some((objective) => {
      return objective?.targetId === "foundation-wall";
    });
  }

  function shouldShowFoundationBuildZone(activeQuest = null, activeSystemQuest = null) {
    return activeQuest?.id === "build-first-base" ||
      activeSystemQuest?.id === "build-first-base" ||
      hasFoundationWallObjective(activeQuest) ||
      hasFoundationWallObjective(activeSystemQuest);
  }

  function buildFoundationBuildZoneGroundCells(activeQuest = null, activeSystemQuest = null) {
    if (!shouldShowFoundationBuildZone(activeQuest, activeSystemQuest)) {
      return [];
    }

    const buildZone = getActiveFreeBlockBuildZone();
    if (!Array.isArray(buildZone?.borderCells)) {
      return [];
    }

    getFreeBlockBuildController();
    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    const buildState = session.freeBlockBuildState;
    const zoneUnavailable = isFoundationBuildZoneUnavailable();

    return buildZone.borderCells.map((cell) => {
      const worldPosition = gridSystem.cellToWorld(cell, {
        center: true,
        includeVisualOffset: true
      });
      const block = buildState?.getBlockAtCell?.(cell);
      const completed = block?.blockType === FREE_BLOCK_TYPES.WALL;

      return {
        id: `foundation-build-zone:${cell.x}:${cell.y}`,
        offset: [worldPosition.x, worldPosition.y, worldPosition.z],
        surfaceY: worldPosition.y,
        size: [gridSystem.cellSize, gridSystem.cellSize],
        tileSpan: gridSystem.cellSize,
        highlightTargetState: zoneUnavailable ? "invalid" : completed ? "leafage" : "valid",
        highlightAbilityId: zoneUnavailable ? "invalid" : completed ? "leafage" : "build"
      };
    });
  }

  function buildFoundationCompletionInteriorGroundCells() {
    const buildZone = getActiveFreeBlockBuildZone();
    if (!Array.isArray(buildZone?.interiorCells) || !buildZone.interiorCells.length) {
      return [];
    }

    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    return buildZone.interiorCells.map((cell) => {
      const worldPosition = gridSystem.cellToWorld(cell, {
        center: true,
        includeVisualOffset: true
      });

      return {
        id: `foundation-complete-ground:${cell.x}:${cell.y}`,
        offset: [worldPosition.x, worldPosition.y, worldPosition.z],
        surfaceY: worldPosition.y,
        size: [gridSystem.cellSize, gridSystem.cellSize],
        tileSpan: gridSystem.cellSize,
        highlightTargetState: "foundationComplete",
        highlightAbilityId: "foundationComplete"
      };
    });
  }

  function triggerFoundationBuildZoneCompleteEffects(now = performance.now()) {
    const flags = controls.storyState?.flags;
    if (!flags) {
      return;
    }

    const position = getFreeBlockBuildZoneCenterPosition();
    if (!position) {
      return;
    }

    const cloudEffectPlayed = Boolean(flags.builderTutorialFoundationCompleteEffectPlayed);
    const interiorEffectPlayed = Boolean(flags.builderTutorialFoundationInteriorEffectPlayed);
    if (cloudEffectPlayed && interiorEffectPlayed) {
      return;
    }

    const nowMs = Date.now();
    if (!interiorEffectPlayed) {
      flags.builderTutorialFoundationInteriorEffectPlayed = true;
      groundActionFeedbackRuntime.triggerFeedback(
        buildFoundationCompletionInteriorGroundCells(),
        "foundationComplete",
        now,
        { durationMs: FOUNDATION_COMPLETE_GROUND_EFFECT_DURATION_MS }
      );
    }

    if (cloudEffectPlayed) {
      return;
    }

    flags.builderTutorialFoundationCompleteEffectPlayed = true;
    session.constructionCloudBursts = Array.isArray(session.constructionCloudBursts) ?
      session.constructionCloudBursts.filter((effect) => {
        const startedAt = Number(effect?.startedAt || 0);
        const durationMs = Number(effect?.durationMs || 0);
        return startedAt > 0 && durationMs > 0 && nowMs - startedAt < durationMs;
      }) :
      [];
    session.constructionCloudBursts.push({
      id: "builder-tutorial-foundation-complete",
      position,
      startedAt: nowMs,
      durationMs: 1800
    });
  }

  function syncFoundationBuildZoneCompletionEffects(now = performance.now()) {
    const progress = getFreeBlockBuildZoneProgress({
      buildState: session.freeBlockBuildState,
      buildZone: getActiveFreeBlockBuildZone(),
      blockType: FREE_BLOCK_TYPES.WALL
    });

    if (progress.complete) {
      triggerFoundationBuildZoneCompleteEffects(now);
    }

    return progress;
  }

  function canStackFreeBlockPlacement() {
    const progress = getFreeBlockBuildZoneProgress({
      buildState: session.freeBlockBuildState,
      buildZone: getActiveFreeBlockBuildZone(),
      blockType: FREE_BLOCK_TYPES.WALL
    });
    return Boolean(progress.complete);
  }

  function getFreeBlockCellWorldPosition(cell, gridSystem = createGridSystem(getFreeBlockBuildGridConfig())) {
    const worldPosition = gridSystem.cellToWorld(cell, {
      center: true,
      includeVisualOffset: true
    });
    const layer = Math.max(0, Math.trunc(Number(cell?.layer || 0)));
    const cellSize = Number(gridSystem.cellSize || 1);
    return [
      worldPosition.x,
      worldPosition.y + layer * cellSize,
      worldPosition.z
    ];
  }

  function buildFreeBlockFeedbackGroundCell(result) {
    const gridConfig = getFreeBlockBuildGridConfig();
    const gridSystem = createGridSystem(gridConfig);
    const targetCell = result?.targetCell;
    if (!targetCell) {
      return null;
    }

    const worldPosition = gridSystem.cellToWorld(targetCell, {
      center: true,
      includeVisualOffset: true
    });
    return {
      id: `free-block-feedback:${targetCell.x}:${targetCell.y}`,
      offset: [worldPosition.x, worldPosition.y, worldPosition.z],
      size: [gridSystem.cellSize, gridSystem.cellSize],
      tileSpan: gridSystem.cellSize,
      highlightTargetState: result.placed ? "valid" : "invalid",
      highlightAbilityId: result.placed ? "build" : "invalid"
    };
  }

  function syncFreeBlockBuildSnapshot() {
    const controller = getFreeBlockBuildController();
    session.freeBlockBuildSnapshot = controller.serializeFreeBlocks();
    return session.freeBlockBuildSnapshot;
  }

  function isPlayerOnFreeBlockTargetCell(targetCell, playerPosition, gridSystem) {
    if (!targetCell || !Array.isArray(playerPosition)) {
      return false;
    }

    const playerCell = gridSystem.worldToCell({
      x: Number(playerPosition[0] || 0),
      y: Number(playerPosition[1] || 0),
      z: Number(playerPosition[2] || 0)
    });

    return playerCell.x === targetCell.x && playerCell.y === targetCell.y;
  }

  function movePlayerAwayFromPlacedFreeBlock(targetCell, playerPosition = null) {
    if (!session.playerCharacter || !Array.isArray(playerPosition) || !targetCell) {
      return null;
    }

    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    if (!isPlayerOnFreeBlockTargetCell(targetCell, playerPosition, gridSystem)) {
      return null;
    }

    const targetPosition = getFreeBlockCellWorldPosition(targetCell, gridSystem);
    const nextPlayerPosition = resolveConstructionDisplacementPosition({
      targetPosition,
      playerPosition,
      cellSize: gridSystem.cellSize,
      isBlocked: isCompanionPositionBlockedByConstruction
    });

    if (!nextPlayerPosition) {
      return null;
    }

    session.playerCharacter.setPosition(nextPlayerPosition);
    syncPlayerModelInstance(0);
    return nextPlayerPosition;
  }

  function handleFreeBlockPlacementResult(result, now) {
    const feedbackGroundCell = buildFreeBlockFeedbackGroundCell(result);
    if (feedbackGroundCell) {
      groundActionFeedbackRuntime.triggerFeedback(
        feedbackGroundCell,
        result.placed ? "build" : "invalid",
        now
      );
    }

    if (result.placed) {
      controls.storyState.flags.firstFreeBlockPlaced = true;
      if (result.blockType === FREE_BLOCK_TYPES.WALL) {
        controls.onFoundationWallBuilt?.({
          targetCell: result.targetCell,
          block: result.block
        });
        syncFoundationBuildZoneCompletionEffects(now);
      }
      syncFreeBlockBuildSnapshot();
      playInstanceObjectSfx();
      hud?.pushNotice?.(getFreeBlockPlacementNotice(result));
    } else {
      playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
      hud?.pushNotice?.(getFreeBlockPlacementNotice(result));
    }
  }

  function tryPlaceFreeBlockFromBuildInput(now) {
    const controller = getFreeBlockBuildController();
    if (!controller) {
      return { handled: false };
    }

    const playerPosition = session.playerCharacter?.getPosition?.();
    const result = isFoundationBuildZoneUnavailable() ?
      {
        placed: false,
        reason: "blocked-cell",
        blockType: FREE_BLOCK_TYPES.WALL,
        block: null,
        targetCell: null
      } :
      controller.placeSelectedBlockAtTarget({
        playerPosition,
        buildZone: getActiveFreeBlockBuildZone(),
        allowStacking: canStackFreeBlockPlacement(),
        playerYaw: session.playerModelInstance?.yaw,
        inventory: controls.inventory
      });
    if (result.placed) {
      movePlayerAwayFromPlacedFreeBlock(result.targetCell, playerPosition);
    }
    handleFreeBlockPlacementResult(result, now);

    return {
      handled: true,
      result
    };
  }

  function resolveFreeBlockBuildTarget(playerPosition = null) {
    const controller = getFreeBlockBuildController();
    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    const playerYaw = session.playerModelInstance?.yaw;
    const rawTargetCell = resolveFreeBlockTargetCell({
      gridSystem,
      playerPosition,
      playerYaw
    });
    const target = controller?.resolveSelectedBlockTarget?.({
      playerPosition,
      playerYaw,
      buildZone: getActiveFreeBlockBuildZone(),
      allowStacking: canStackFreeBlockPlacement()
    });

    if (!target?.targetCell) {
      return null;
    }

    const validation = isFoundationBuildZoneUnavailable() ?
      {
        valid: false,
        reason: "blocked-cell",
        targetCell: target.targetCell
      } :
      controller?.validateSelectedBlockTarget?.({
        targetCell: target.targetCell,
        buildZone: getActiveFreeBlockBuildZone(),
        allowStacking: canStackFreeBlockPlacement(),
        inventory: controls.inventory
      }) || {
        valid: true,
        reason: null
      };
    const resolvedTargetCell = validation.targetCell || target.targetCell;
    const targetPosition = getFreeBlockCellWorldPosition(resolvedTargetCell, gridSystem);
    const constructionColliders = getPlayerConstructionTerrainColliders();
    const blockingColliderIds = constructionColliders
      .filter((collider) => isPositionInsideTerrainColliderFootprint(targetPosition, collider))
      .map((collider) => collider.id || collider.kind || "unknown");
    const playerCell = Array.isArray(playerPosition) ?
      gridSystem.worldToCell({
        x: Number(playerPosition[0] || 0),
        y: Number(playerPosition[1] || 0),
        z: Number(playerPosition[2] || 0)
      }) :
      null;
    const rawTargetBlock = rawTargetCell ? session.freeBlockBuildState?.getBlockAtCell?.(rawTargetCell) : null;
    const targetBlock = session.freeBlockBuildState?.getBlockAtCell?.(resolvedTargetCell) || null;
    const previewValidity = resolveBuildBlockPreviewValidity({
      validation,
      blockingColliderIds
    });
    const { valid, reason, blockedByConstruction } = previewValidity;

    return {
      targetCell: resolvedTargetCell,
      targetPosition,
      valid,
      reason,
      debug: {
        rawTargetCell,
        targetCell: resolvedTargetCell,
        playerCell,
        targetPosition,
        valid,
        reason,
        validationReason: validation.reason || null,
        blockedByConstruction,
        blockingColliderIds,
        rawTargetBlockType: rawTargetBlock?.blockType || null,
        targetBlockType: targetBlock?.blockType || null,
        wood: controls.inventory?.wood ?? 0
      }
    };
  }

  function getFreeBlockPreviewTarget(playerPosition = null) {
    const action = session.timburrBuildBlockAction;
    if (
      action &&
      !action.impactApplied &&
      action.targetCell &&
      Array.isArray(action.targetPosition)
    ) {
      return {
        targetCell: action.targetCell,
        targetPosition: action.targetPosition,
        valid: true,
        reason: null
      };
    }

    return resolveFreeBlockBuildTarget(playerPosition);
  }

  function syncFreeBlockBuildPreview({ active, playerPosition, nowSeconds = 0 } = {}) {
    const instance = session.freeBlockPreviewInstance;
    if (!instance) {
      return null;
    }

    if (!active || !Array.isArray(playerPosition)) {
      instance.active = false;
      return null;
    }

    const target = getFreeBlockPreviewTarget(playerPosition);
    if (!target?.targetCell || !Array.isArray(target.targetPosition)) {
      instance.active = false;
      return null;
    }

    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    const pulse = (Math.sin(nowSeconds * 8) + 1) * 0.5;
    const valid = target.valid !== false;

    instance.active = true;
    instance.offset = [
      target.targetPosition[0],
      target.targetPosition[1],
      target.targetPosition[2]
    ];
    instance.scale = gridSystem.cellSize;
    instance.yaw = 0;
    instance.pitch = 0;
    instance.roll = 0;
    instance.alpha = valid ? 0.58 + pulse * 0.12 : 0.42 + pulse * 0.08;
    instance.tint = valid ? [0.36, 1.35, 0.46] : [1.8, 0.32, 0.28];
    instance.tintStrength = valid ? 0.34 + pulse * 0.12 : 0.5 + pulse * 0.16;
    instance.freeBlockCell = target.targetCell;
    instance.freeBlockPreviewValid = valid;
    instance.freeBlockPreviewReason = target.reason || null;
    return target;
  }

  function startTimburrBuildBlockAction({ playerPosition }) {
    const timburr = session.timburrEncounter;

    if (session.timburrBuildBlockAction) {
      return "busy";
    }

    if (!controls.playerSkills?.buildBlock || !controls.storyState?.flags?.timburrRevealed) {
      return "locked";
    }

    if (
      !timburr ||
      !timburr.visible ||
      !Array.isArray(timburr.position)
    ) {
      return "unavailable";
    }

    const target = resolveFreeBlockBuildTarget(playerPosition);
    if (!target) {
      return "unavailable";
    }
    if (!target.valid) {
      session.lastTimburrBuildBlockInvalidReason = target.reason || "invalid";
      return target.reason === "missing-material" ? "missing-material" : "invalid";
    }

    session.lastTimburrBuildBlockInvalidReason = null;
    const approachPosition = getTimburrBuildBlockApproachPosition(
      target.targetPosition,
      playerPosition
    );
    const approachBlockers = getCompanionPositionConstructionBlockers(approachPosition);
    const castFromBlockedApproach = shouldTimburrBuildBlockCastFromBlockedApproach(approachBlockers);

    session.timburrBuildBlockAction = {
      phase: castFromBlockedApproach ? "cast" : "approach",
      targetCell: target.targetCell,
      targetPosition: target.targetPosition,
      approachPosition,
      castElapsed: 0,
      impactApplied: false,
      castFromBlockedApproach
    };

    return "started";
  }

  function applyTimburrBuildBlockImpact(action, now) {
    const controller = getFreeBlockBuildController();
    if (!controller) {
      return null;
    }

    const playerPosition = session.playerCharacter?.getPosition?.();
    const result = isFoundationBuildZoneUnavailable() ?
      {
        placed: false,
        reason: "blocked-cell",
        blockType: FREE_BLOCK_TYPES.WALL,
        block: null,
        targetCell: action.targetCell
      } :
      controller.placeSelectedBlockAtTarget({
        targetCell: action.targetCell,
        buildZone: getActiveFreeBlockBuildZone(),
        allowStacking: canStackFreeBlockPlacement(),
        inventory: controls.inventory
      });
    if (result.placed) {
      movePlayerAwayFromPlacedFreeBlock(result.targetCell, playerPosition);
    }
    handleFreeBlockPlacementResult(result, now);
    return result;
  }

  function updateTimburrBuildBlockAction(deltaTime, now) {
    const action = session.timburrBuildBlockAction;
    const timburr = session.timburrEncounter;

    if (!action || !timburr) {
      return;
    }

    if (!Array.isArray(timburr.position)) {
      timburr.position = [...action.approachPosition];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - timburr.position[0];
      const deltaZ = action.approachPosition[2] - timburr.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const travel = Math.min(TIMBURR_BUILD_BLOCK_SPEED * deltaTime, distance);

      if (distance > TIMBURR_BUILD_BLOCK_ARRIVE_DISTANCE && travel > 0) {
        const previousPosition = [...timburr.position];
        const nextPosition = [
          timburr.position[0] + (deltaX / distance) * travel,
          0.04,
          timburr.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(timburr, nextPosition)) {
          const nextPositionBlockers = getCompanionPositionConstructionBlockers(nextPosition);
          if (shouldTimburrBuildBlockCastFromBlockedApproach(nextPositionBlockers)) {
            action.phase = "cast";
            action.castElapsed = 0;
            action.castFromBlockedApproach = true;
            return;
          }
          session.timburrBuildBlockAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.builder);
          return;
        }
        if (timburr.modelInstance) {
          timburr.modelInstance.yaw = getRobotModelYawToward(
            previousPosition,
            timburr.position,
            Number(timburr.modelFaceYawOffset ?? TIMBURR_MODEL_FACE_YAW_OFFSET)
          );
        }
      } else {
        const approachBlockers = getCompanionPositionConstructionBlockers(action.approachPosition);
        if (approachBlockers.length > 0) {
          if (shouldTimburrBuildBlockCastFromBlockedApproach(approachBlockers)) {
            action.phase = "cast";
            action.castElapsed = 0;
            action.castFromBlockedApproach = true;
            return;
          }
          session.timburrBuildBlockAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.builder);
          return;
        }

        timburr.position = [...action.approachPosition];
        action.phase = "cast";
        action.castElapsed = 0;
      }

      return;
    }

    if (action.phase !== "cast") {
      session.timburrBuildBlockAction = null;
      return;
    }

    action.castElapsed += deltaTime;

    if (!action.impactApplied && action.castElapsed >= TIMBURR_BUILD_BLOCK_IMPACT_TIME) {
      action.impactApplied = true;
      applyTimburrBuildBlockImpact(action, now);
    }

    if (action.castElapsed >= TIMBURR_BUILD_BLOCK_CAST_DURATION) {
      session.timburrBuildBlockAction = null;
    }
  }

  function findNearbyFreeBlockTarget(playerPosition) {
    if (!Array.isArray(playerPosition) || !Array.isArray(session.freeBlockInstances)) {
      return null;
    }

    let nearest = null;
    let nearestDistance = Infinity;
    for (const instance of session.freeBlockInstances) {
      if (instance?.active === false || !Array.isArray(instance?.offset) || !instance.freeBlockCell) {
        continue;
      }

      const distance = Math.hypot(
        Number(playerPosition[0] || 0) - Number(instance.offset[0] || 0),
        Number(playerPosition[2] || 0) - Number(instance.offset[2] || 0)
      );
      const layer = Math.max(0, Math.trunc(Number(instance.freeBlockCell?.layer || 0)));
      const nearestLayer = Math.max(0, Math.trunc(Number(nearest?.freeBlockCell?.layer || 0)));
      if (
        distance < 1.35 &&
        (
          distance < nearestDistance ||
          (Math.abs(distance - nearestDistance) < 0.001 && layer > nearestLayer)
        )
      ) {
        nearest = instance;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  function getNextFreeBlockWoodDropId(woodDrops = []) {
    let nextId = 1;
    for (const drop of woodDrops || []) {
      const match = String(drop?.id || "").match(/^wood-(\d+)$/u);
      if (match) {
        nextId = Math.max(nextId, Number(match[1]) + 1);
      }
    }
    return nextId;
  }

  function spawnFreeBlockRemovalDrops(result, target) {
    const materialCost = result?.materialCost;
    const quantity = Math.max(0, Math.trunc(Number(materialCost?.quantity || 0)));
    if (
      !quantity ||
      materialCost?.itemId !== "wood" ||
      !Array.isArray(target?.offset)
    ) {
      return 0;
    }

    session.woodDrops ||= [];
    let nextId = getNextFreeBlockWoodDropId(session.woodDrops);
    for (let index = 0; index < quantity; index += 1) {
      const angle = quantity > 1 ? (index / quantity) * Math.PI * 2 : 0;
      const spread = quantity > 1 ? FREE_BLOCK_DROP_SPREAD : 0;
      session.woodDrops.push({
        id: `wood-${nextId++}`,
        itemId: materialCost.itemId,
        position: [
          Number(target.offset[0] || 0) + Math.cos(angle) * spread,
          0.02,
          Number(target.offset[2] || 0) + Math.sin(angle) * spread
        ],
        size: [...FREE_BLOCK_DROP_SIZE],
        uvRect: [0, 0, 1, 1],
        pickupRadius: FREE_BLOCK_DROP_PICKUP_RADIUS,
        collected: false
      });
    }

    return quantity;
  }

  function tryRemoveNearbyFreeBlock(playerPosition, now) {
    const target = findNearbyFreeBlockTarget(playerPosition);
    if (!target) {
      return false;
    }

    const controller = getFreeBlockBuildController();
    const result = controller.removeBlockAtTarget({
      targetCell: target.freeBlockCell,
      inventory: controls.inventory,
      refundMaterial: false
    });

    if (!result.removed) {
      return false;
    }

    const dropCount = spawnFreeBlockRemovalDrops(result, target);
    syncFreeBlockBuildSnapshot();
    const feedbackGroundCell = buildFreeBlockFeedbackGroundCell({
      targetCell: target.freeBlockCell,
      placed: true
    });
    if (feedbackGroundCell) {
      groundActionFeedbackRuntime.triggerFeedback(feedbackGroundCell, "build", now);
    }
    playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_IMPACT);
    hud?.pushNotice?.(dropCount > 0 ? "Block broken. Wood dropped." : "Block removed.");
    return true;
  }

  function getCompanionFollowTargetPosition(followDistance) {
    const playerPosition = session.playerCharacter?.getPosition?.();
    if (!Array.isArray(playerPosition)) {
      return null;
    }

    const [directionX, directionZ] = companionFollowDirectionRuntime.get(
      session.playerModelInstance?.yaw
    );
    return [
      playerPosition[0] - directionX * followDistance,
      0.04,
      playerPosition[2] - directionZ * followDistance
    ];
  }

  function isCompanionInFollowFormation(companionId) {
    const flags = controls.storyState?.flags || {};

    if (companionId === "squirtle") {
      const squirtle = session.actTwoSquirtle;
      return Boolean(
        flags.squirtleFollowing &&
        squirtle?.recovered &&
        squirtle.assemblyState === "assembled" &&
        !session.squirtleWaterGunAction &&
        getSquirtleWaterGunQueue().length === 0
      );
    }

    if (companionId === "bulbasaur") {
      const encounter = session.bulbasaurEncounter;
      return Boolean(
        flags.bulbasaurFollowing &&
        encounter?.visible &&
        Array.isArray(encounter.position) &&
        !session.bulbasaurLeafageAction &&
        !encounter.revealBoxOpening?.active &&
        !isBulbasaurWorkbenchGuideActive()
      );
    }

    if (companionId === "charmander") {
      return Boolean(
        flags.charmanderFollowing &&
        flags.charmanderRevealed &&
        session.charmanderEncounter?.visible &&
        !session.charmanderFireAction &&
        !flags.leafDenConstructionStarted
      );
    }

    if (companionId === "timburr") {
      return Boolean(
        flags.timburrFollowing &&
        flags.timburrRevealed &&
        session.timburrEncounter?.visible &&
        !session.timburrBuildBlockAction &&
        !flags.leafDenConstructionStarted
      );
    }

    return false;
  }

  function getCompanionFollowFormationIds(activeMoveId = null) {
    const activeCompanionId = COMPANION_FOLLOW_ACTIVE_MOVE_COMPANIONS[activeMoveId] || null;
    const orderedIds = activeCompanionId ?
      [
        activeCompanionId,
        ...COMPANION_FOLLOW_FORMATION_ORDER.filter((companionId) => companionId !== activeCompanionId)
      ] :
      COMPANION_FOLLOW_FORMATION_ORDER;

    return orderedIds.filter(isCompanionInFollowFormation);
  }

  function getCompanionFollowFormationIndex(companionId, activeMoveId = null) {
    const formationIds = getCompanionFollowFormationIds(activeMoveId);
    const index = formationIds.indexOf(companionId);
    return index >= 0 ? index : 0;
  }

  function moveGroundCompanionTowardPlayer(companion, {
    deltaTime,
    speed,
    followDistance,
    modelFaceYawOffset = null
  }) {
    if (
      !companion ||
      !session.playerCharacter ||
      !Array.isArray(companion.position)
    ) {
      return false;
    }

    const targetPosition = getCompanionFollowTargetPosition(followDistance);
    if (!targetPosition) {
      return false;
    }

    const deltaX = targetPosition[0] - companion.position[0];
    const deltaZ = targetPosition[2] - companion.position[2];
    const distance = Math.hypot(deltaX, deltaZ);

    companion.patrol = null;

    if (distance <= COMPANION_FOLLOW_SLOT_ARRIVE_DISTANCE || distance <= 0.001) {
      return true;
    }

    const travel = Math.min(speed * deltaTime, distance);
    const previousPosition = [...companion.position];
    const nextPosition = [
      companion.position[0] + (deltaX / distance) * travel,
      0.04,
      companion.position[2] + (deltaZ / distance) * travel
    ];

    if (!tryMoveCompanionToPosition(companion, nextPosition)) {
      return false;
    }

    if (companion.modelInstance && modelFaceYawOffset !== null) {
      companion.modelInstance.yaw = getRobotModelYawToward(
        previousPosition,
        companion.position,
        modelFaceYawOffset
      );
    }

    return true;
  }

  function updateSquirtleIdlePatrol(deltaTime, { active, activeMoveId = null }) {
    const squirtle = session.actTwoSquirtle;
    const canMove = Boolean(
      active &&
      squirtle?.recovered &&
      squirtle.assemblyState === "assembled" &&
      !session.squirtleWaterGunAction &&
      getSquirtleWaterGunQueue().length === 0
    );

    if (!canMove) {
      if (squirtle) {
        squirtle.patrol = null;
      }
      syncSquirtleModelInstance();
      return;
    }

    if (controls.storyState?.flags?.squirtleFollowing) {
      const formationIndex = getCompanionFollowFormationIndex("squirtle", activeMoveId);
      moveGroundCompanionTowardPlayer(squirtle, {
        deltaTime,
        speed: SQUIRTLE_FOLLOW_SPEED,
        followDistance: resolveCompanionFollowDistance({
          companionId: "squirtle",
          activeMoveId,
          defaultDistance: SQUIRTLE_FOLLOW_DISTANCE,
          formationIndex
        }),
        modelFaceYawOffset: SQUIRTLE_MODEL_FACE_YAW_OFFSET
      });
      syncSquirtleModelInstance();
      return;
    }

    if (!faceIdleBotTowardPlayer(squirtle, {
      modelFaceYawOffset: SQUIRTLE_MODEL_FACE_YAW_OFFSET
    })) {
      updateRobotIdlePatrol(squirtle, {
        deltaTime,
        radius: SQUIRTLE_IDLE_PATROL_RADIUS,
        modelFaceYawOffset: SQUIRTLE_MODEL_FACE_YAW_OFFSET
      });
    }
    syncSquirtleModelInstance();
  }

  function updateBulbasaurIdlePatrol(deltaTime, { active, activeMoveId = null }) {
    const encounter = session.bulbasaurEncounter;
    const jumpActive = Boolean(
      encounter?.jumpTimer > 0 &&
      encounter.originPosition &&
      encounter.landingPosition
    );
    const canPatrol = Boolean(
      active &&
      encounter?.visible &&
      Array.isArray(encounter.position) &&
      !session.bulbasaurLeafageAction &&
      !encounter.revealBoxOpening?.active &&
      !isBulbasaurWorkbenchGuideActive() &&
      !jumpActive
    );

    if (!canPatrol) {
      if (encounter) {
        encounter.patrol = null;
      }
      syncBulbasaurModelInstance();
      return;
    }

    if (controls.storyState?.flags?.bulbasaurFollowing) {
      const formationIndex = getCompanionFollowFormationIndex("bulbasaur", activeMoveId);
      moveGroundCompanionTowardPlayer(encounter, {
        deltaTime,
        speed: BULBASAUR_FOLLOW_SPEED,
        followDistance: resolveCompanionFollowDistance({
          companionId: "bulbasaur",
          activeMoveId,
          defaultDistance: BULBASAUR_FOLLOW_DISTANCE,
          formationIndex
        }),
        modelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET
      });
      syncBulbasaurModelInstance();
      return;
    }

    if (!faceIdleBotTowardPlayer(encounter, {
      modelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET
    })) {
      updateRobotIdlePatrol(encounter, {
        deltaTime,
        radius: BULBASAUR_IDLE_PATROL_RADIUS,
        modelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET
      });
    }
    syncBulbasaurModelInstance();
  }

  function getSquirtleAssemblySceneObjects(sceneObjects, squirtle) {
    if (
      !squirtle?.visible ||
      squirtle.assemblyState === "hidden" ||
      squirtle.assemblyState === "assembled" ||
      !squirtle.model?.primitives?.length
    ) {
      return sceneObjects;
    }

    const progress = squirtle.reassembly?.active ?
      clamp01(squirtle.reassembly.progress || 0) :
      0;
    const origin = squirtle.position || squirtle.modelInstance?.offset || [0, 0, 0];
    const partObjects = squirtle.model.primitives.map((primitive, index) => {
      const pose = getSquirtleAssemblyPartPose(index, progress);
      return {
        model: createPrimitiveModel(squirtle.model, primitive),
        brightness: 1,
        instances: [{
          offset: [
            origin[0] + pose.offset[0],
            (origin[1] || 0) + pose.offset[1],
            origin[2] + pose.offset[2]
          ],
          scale: SQUIRTLE_REASSEMBLY_PART_SCALE,
          yaw: pose.yaw,
          pitch: pose.pitch,
          roll: pose.roll,
          active: true
        }]
      };
    });

    return [...sceneObjects, ...partObjects];
  }

  function getSquirtleWaterGunApproachPosition(targetPosition, playerPosition = null) {
    const squirtlePosition =
      session.actTwoSquirtle?.position ||
      session.actTwoSquirtle?.modelInstance?.offset ||
      playerPosition ||
      [0, 0.04, 0];
    let deltaX = squirtlePosition[0] - targetPosition[0];
    let deltaZ = squirtlePosition[2] - targetPosition[2];
    let distance = Math.hypot(deltaX, deltaZ);

    if (distance < 0.001 && playerPosition) {
      deltaX = playerPosition[0] - targetPosition[0];
      deltaZ = playerPosition[2] - targetPosition[2];
      distance = Math.hypot(deltaX, deltaZ);
    }

    if (distance < 0.001) {
      deltaX = 0;
      deltaZ = 1;
      distance = 1;
    }

    return [
      targetPosition[0] + (deltaX / distance) * SQUIRTLE_WATER_GUN_STAND_DISTANCE,
      0.04,
      targetPosition[2] + (deltaZ / distance) * SQUIRTLE_WATER_GUN_STAND_DISTANCE
    ];
  }

  function getBulbasaurLeafageApproachPosition(targetPosition, playerPosition = null) {
    const bulbasaurPosition =
      session.bulbasaurEncounter?.position ||
      session.bulbasaurEncounter?.modelInstance?.offset ||
      playerPosition ||
      [0, 0.04, 0];
    let deltaX = bulbasaurPosition[0] - targetPosition[0];
    let deltaZ = bulbasaurPosition[2] - targetPosition[2];
    let distance = Math.hypot(deltaX, deltaZ);

    if (distance < 0.001 && playerPosition) {
      deltaX = playerPosition[0] - targetPosition[0];
      deltaZ = playerPosition[2] - targetPosition[2];
      distance = Math.hypot(deltaX, deltaZ);
    }

    if (distance < 0.001) {
      deltaX = 0;
      deltaZ = 1;
      distance = 1;
    }

    return [
      targetPosition[0] + (deltaX / distance) * BULBASAUR_LEAFAGE_STAND_DISTANCE,
      0.04,
      targetPosition[2] + (deltaZ / distance) * BULBASAUR_LEAFAGE_STAND_DISTANCE
    ];
  }

  function getTimburrBuildBlockApproachPosition(targetPosition, playerPosition = null) {
    return resolveTimburrBuildBlockApproachPosition({
      targetPosition,
      timburrPosition: session.timburrEncounter?.position,
      playerPosition,
      isBlocked: isCompanionPositionBlockedByConstruction
    });
  }

  function getCharmanderFireApproachPosition(targetPosition, playerPosition = null) {
    const charmanderPosition =
      session.charmanderEncounter?.position ||
      session.charmanderEncounter?.modelInstance?.offset ||
      playerPosition ||
      [0, 0.04, 0];
    let deltaX = charmanderPosition[0] - targetPosition[0];
    let deltaZ = charmanderPosition[2] - targetPosition[2];
    let distance = Math.hypot(deltaX, deltaZ);

    if (distance < 0.001 && playerPosition) {
      deltaX = playerPosition[0] - targetPosition[0];
      deltaZ = playerPosition[2] - targetPosition[2];
      distance = Math.hypot(deltaX, deltaZ);
    }

    if (distance < 0.001) {
      deltaX = 0;
      deltaZ = 1;
      distance = 1;
    }

    return [
      targetPosition[0] + (deltaX / distance) * CHARMANDER_FIRE_STAND_DISTANCE,
      0.04,
      targetPosition[2] + (deltaZ / distance) * CHARMANDER_FIRE_STAND_DISTANCE
    ];
  }

  function startCharmanderFireAction({ groundCell, playerPosition }) {
    const charmander = session.charmanderEncounter;
    if (!groundCell) {
      return "unavailable";
    }

    if (isLeafDenConstructionActive()) {
      hud?.pushNotice?.(LEAF_DEN_BUSY_NOTICE);
      return "busy";
    }

    if (session.charmanderFireAction) {
      return "busy";
    }

    if (
      !charmander?.modelInstance ||
      !charmander.visible ||
      !Array.isArray(charmander.position)
    ) {
      return "unavailable";
    }

    if (!hasCharmanderFireCarbon()) {
      return "no-carbon";
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    const approachPosition = getCharmanderFireApproachPosition(
      targetPosition,
      playerPosition
    );

    session.charmanderFireAction = {
      phase: "approach",
      groundCell,
      targetPosition,
      approachPosition,
      sprayElapsed: 0,
      impactApplied: false
    };
    charmander.modelInstance.active = true;
    charmander.modelInstance.yaw = getRobotModelYawToward(
      charmander.position,
      targetPosition,
      CHARMANDER_MODEL_FACE_YAW_OFFSET
    );
    syncCharmanderModelInstance();

    return "started";
  }

  function applyCharmanderFireImpact(action) {
    const result = performGameplayHarvestAction({
      playerPosition: action.approachPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: false,
      groundDeadInstances: session.groundDeadInstances,
      iceGroundInstances: session.iceGroundInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: false,
      canUseFire: true,
      useFire: true,
      forcedHarvestTarget: {
        fireGroundCell: action.groundCell,
        distance: 0
      }
    }, {
      actionType: "fire",
      groundCell: action.groundCell
    });

    if (result) {
      hud.syncInventoryUi(controls.inventory);
      triggerSupplyCounterPrompt(CARBON_ITEM_ID, controls.inventory, performance.now());
      groundActionFeedbackRuntime.triggerFeedback(action.groundCell, "fire", performance.now());
    }

    return result;
  }

  function updateCharmanderFireAction(deltaTime) {
    const action = session.charmanderFireAction;
    const charmander = session.charmanderEncounter;

    if (!action || !charmander?.modelInstance) {
      return;
    }

    if (!Array.isArray(charmander.position)) {
      charmander.position = [...(charmander.modelInstance.offset || action.approachPosition)];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - charmander.position[0];
      const deltaZ = action.approachPosition[2] - charmander.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const travel = Math.min(CHARMANDER_FIRE_SPEED * deltaTime, distance);

      if (distance > CHARMANDER_FIRE_ARRIVE_DISTANCE && travel > 0) {
        const nextPosition = [
          charmander.position[0] + (deltaX / distance) * travel,
          0.04,
          charmander.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(charmander, nextPosition)) {
          session.charmanderFireAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.thermal);
          syncCharmanderModelInstance();
          return;
        }
      } else {
        if (isCompanionPositionBlockedByConstruction(action.approachPosition)) {
          session.charmanderFireAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.thermal);
          syncCharmanderModelInstance();
          return;
        }

        charmander.position = [...action.approachPosition];
        action.phase = "spray";
        action.sprayElapsed = 0;
      }

      charmander.modelInstance.yaw = getRobotModelYawToward(
        charmander.position,
        action.targetPosition,
        CHARMANDER_MODEL_FACE_YAW_OFFSET
      );
      syncCharmanderModelInstance();
      return;
    }

    if (action.phase !== "spray") {
      session.charmanderFireAction = null;
      return;
    }

    action.sprayElapsed += deltaTime;
    charmander.modelInstance.yaw = getRobotModelYawToward(
      charmander.position,
      action.targetPosition,
      CHARMANDER_MODEL_FACE_YAW_OFFSET
    );
    syncCharmanderModelInstance();

    if (!action.impactApplied && action.sprayElapsed >= CHARMANDER_FIRE_IMPACT_TIME) {
      action.impactApplied = true;
      applyCharmanderFireImpact(action);
    }

    if (action.sprayElapsed >= CHARMANDER_FIRE_SPRAY_DURATION) {
      session.charmanderFireAction = null;
    }
  }

  function startBulbasaurLeafageAction({ groundCell, playerPosition }) {
    const bulbasaur = session.bulbasaurEncounter;
    if (!groundCell) {
      return "unavailable";
    }

    if (isBulbasaurWorkbenchGuideActive()) {
      return "busy";
    }

    if (session.bulbasaurLeafageAction) {
      return "busy";
    }

    if (
      !bulbasaur?.modelInstance ||
      !bulbasaur.visible ||
      !Array.isArray(bulbasaur.position)
    ) {
      return "unavailable";
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    const approachPosition = getBulbasaurLeafageApproachPosition(
      targetPosition,
      playerPosition
    );

    session.bulbasaurLeafageAction = {
      phase: "approach",
      groundCell,
      targetPosition,
      approachPosition,
      castElapsed: 0,
      impactApplied: false
    };
    bulbasaur.modelInstance.active = true;
    bulbasaur.modelInstance.yaw = getRobotModelYawToward(
      bulbasaur.position,
      targetPosition,
      BULBASAUR_MODEL_FACE_YAW_OFFSET
    );
    syncBulbasaurModelInstance();

    return "started";
  }

  function applyBulbasaurLeafageImpact(action) {
    const hadLeafagePatch = hasGroundPatchForCellId(action.groundCell?.id);
    const result = performGameplayHarvestAction({
      playerPosition: action.approachPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: false,
      groundDeadInstances: session.groundDeadInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: true,
      forcedHarvestTarget: {
        leafageGroundCell: action.groundCell,
        distance: 0
      }
    }, {
      actionType: "leafage",
      groundCell: action.groundCell
    });

    if (result && !hadLeafagePatch && hasGroundPatchForCellId(action.groundCell?.id)) {
      playInstanceObjectSfx();
    }

    return result;
  }

  function updateBulbasaurLeafageAction(deltaTime) {
    const action = session.bulbasaurLeafageAction;
    const bulbasaur = session.bulbasaurEncounter;

    if (!action || !bulbasaur?.modelInstance) {
      return;
    }

    if (!Array.isArray(bulbasaur.position)) {
      bulbasaur.position = [...(bulbasaur.modelInstance.offset || action.approachPosition)];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - bulbasaur.position[0];
      const deltaZ = action.approachPosition[2] - bulbasaur.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const travel = Math.min(BULBASAUR_LEAFAGE_SPEED * deltaTime, distance);

      if (distance > BULBASAUR_LEAFAGE_ARRIVE_DISTANCE && travel > 0) {
        const nextPosition = [
          bulbasaur.position[0] + (deltaX / distance) * travel,
          0.04,
          bulbasaur.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(bulbasaur, nextPosition)) {
          session.bulbasaurLeafageAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.grow);
          syncBulbasaurModelInstance();
          return;
        }
      } else {
        if (isCompanionPositionBlockedByConstruction(action.approachPosition)) {
          session.bulbasaurLeafageAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.grow);
          syncBulbasaurModelInstance();
          return;
        }

        bulbasaur.position = [...action.approachPosition];
        action.phase = "cast";
        action.castElapsed = 0;
      }

      bulbasaur.modelInstance.yaw = getRobotModelYawToward(
        bulbasaur.position,
        action.targetPosition,
        BULBASAUR_MODEL_FACE_YAW_OFFSET
      );
      syncBulbasaurModelInstance();
      return;
    }

    if (action.phase !== "cast") {
      session.bulbasaurLeafageAction = null;
      return;
    }

    action.castElapsed += deltaTime;
    bulbasaur.modelInstance.yaw = getRobotModelYawToward(
      bulbasaur.position,
      action.targetPosition,
      BULBASAUR_MODEL_FACE_YAW_OFFSET
    );
    syncBulbasaurModelInstance();

    if (!action.impactApplied && action.castElapsed >= BULBASAUR_LEAFAGE_IMPACT_TIME) {
      action.impactApplied = true;
      applyBulbasaurLeafageImpact(action);
    }

    if (action.castElapsed >= BULBASAUR_LEAFAGE_CAST_DURATION) {
      session.bulbasaurLeafageAction = null;
    }
  }

  function getSquirtleWaterGunQueue() {
    if (!Array.isArray(session.squirtleWaterGunQueue)) {
      session.squirtleWaterGunQueue = [];
    }

    return session.squirtleWaterGunQueue;
  }

  function getSquirtleWaterGunUseCount() {
    return Math.max(
      0,
      Math.floor(Number(controls.storyState?.flags?.[SQUIRTLE_WATER_GUN_USE_COUNT_FLAG] || 0))
    );
  }

  function getSquirtleWaterGunLevel() {
    return SQUIRTLE_WATER_GUN_BASE_LEVEL +
      Math.floor(getSquirtleWaterGunUseCount() / SQUIRTLE_WATER_GUN_USES_PER_LEVEL);
  }

  function getSquirtleWaterStaminaMax() {
    return SQUIRTLE_WATER_STAMINA_MAX +
      Math.max(0, getSquirtleWaterGunLevel() - SQUIRTLE_WATER_GUN_BASE_LEVEL);
  }

  function getSquirtleWaterGunSpeedMultiplier() {
    const progress = clamp01(getSquirtleWaterGunUseCount() / SQUIRTLE_WATER_GUN_EVOLUTION_MAX_USES);
    return 1 + (SQUIRTLE_WATER_GUN_MAX_SPEED_MULTIPLIER - 1) * progress;
  }

  function getSquirtleWaterGunSprayDuration(speedMultiplier = getSquirtleWaterGunSpeedMultiplier()) {
    return Math.max(
      SQUIRTLE_WATER_GUN_MIN_SPRAY_DURATION,
      SQUIRTLE_WATER_GUN_SPRAY_DURATION / Math.max(1, speedMultiplier)
    );
  }

  function getSquirtleWaterGunImpactTime(speedMultiplier = getSquirtleWaterGunSpeedMultiplier()) {
    return Math.max(
      SQUIRTLE_WATER_GUN_MIN_IMPACT_TIME,
      SQUIRTLE_WATER_GUN_IMPACT_TIME / Math.max(1, speedMultiplier)
    );
  }

  function recordSquirtleWaterGunUse() {
    if (!controls.storyState) {
      return;
    }

    controls.storyState.flags ||= {};
    controls.storyState.flags[SQUIRTLE_WATER_GUN_USE_COUNT_FLAG] =
      getSquirtleWaterGunUseCount() + 1;
  }

  function getSquirtleWaterStaminaState() {
    const staminaMax = getSquirtleWaterStaminaMax();

    if (!session.squirtleWaterStamina) {
      session.squirtleWaterStamina = {
        current: staminaMax,
        visualCurrent: staminaMax,
        max: staminaMax,
        charging: false,
        chargeElapsed: 0
      };
    }

    const previousMax = Math.max(
      1,
      Number(session.squirtleWaterStamina.max || staminaMax)
    );
    const maxIncrease = Math.max(0, staminaMax - previousMax);
    session.squirtleWaterStamina.max = staminaMax;
    session.squirtleWaterStamina.current = Math.min(
      staminaMax,
      Math.max(0, Number(session.squirtleWaterStamina.current || 0)) + maxIncrease
    );
    session.squirtleWaterStamina.visualCurrent = Math.min(
      staminaMax,
      Math.max(
        0,
        Number.isFinite(session.squirtleWaterStamina.visualCurrent) ?
          session.squirtleWaterStamina.visualCurrent :
          session.squirtleWaterStamina.current
      ) + maxIncrease
    );
    return session.squirtleWaterStamina;
  }

  function isSquirtleWaterCharging() {
    return Boolean(getSquirtleWaterStaminaState().charging);
  }

  function beginSquirtleWaterRecharge() {
    const stamina = getSquirtleWaterStaminaState();
    if (stamina.charging) {
      return;
    }

    stamina.current = 0;
    stamina.charging = true;
    stamina.chargeElapsed = 0;
  }

  function consumeSquirtleWaterStamina() {
    const stamina = getSquirtleWaterStaminaState();
    if (stamina.charging || stamina.current <= 0) {
      beginSquirtleWaterRecharge();
      return false;
    }

    stamina.current = Math.max(0, stamina.current - SQUIRTLE_WATER_STAMINA_COST);
    return true;
  }

  function consumeSquirtleWaterStaminaForInstantAction() {
    if (!consumeSquirtleWaterStamina()) {
      return false;
    }

    if (getSquirtleWaterStaminaState().current <= 0) {
      beginSquirtleWaterRecharge();
    }

    return true;
  }

  function updateSquirtleWaterStamina(deltaTime) {
    const stamina = getSquirtleWaterStaminaState();

    if (stamina.charging) {
      stamina.chargeElapsed += deltaTime;
      const progress = clamp01(stamina.chargeElapsed / SQUIRTLE_WATER_STAMINA_RECHARGE_DURATION);
      stamina.current = stamina.max * progress;

      if (progress >= 1) {
        stamina.current = stamina.max;
        stamina.charging = false;
        stamina.chargeElapsed = 0;
        startNextQueuedSquirtleWaterGunAction();
      }
    }

    const visualDuration =
      stamina.current < stamina.visualCurrent ?
        SQUIRTLE_WATER_STAMINA_VISUAL_DECREASE_DURATION :
        SQUIRTLE_WATER_STAMINA_VISUAL_INCREASE_DURATION;
    const maxVisualStep = (stamina.max * deltaTime) / Math.max(0.001, visualDuration);
    stamina.visualCurrent = moveValueToward(
      stamina.visualCurrent,
      stamina.current,
      maxVisualStep
    );
  }

  function getCharmanderCarbonUseCount() {
    const uses = Math.floor(Number(
      controls.storyState?.flags?.[CHARMANDER_FIRE_CARBON_USES_FLAG] || 0
    ));
    return Math.min(
      CHARMANDER_FIRE_USES_PER_CARBON - 1,
      Math.max(0, uses)
    );
  }

  function getCharmanderCarbonEnergyRatio() {
    const carbonCount = Math.max(0, Math.floor(Number(controls.inventory?.[CARBON_ITEM_ID] || 0)));

    if (carbonCount <= 0) {
      return 0;
    }

    const availableUses = Math.max(
      0,
      carbonCount * CHARMANDER_FIRE_USES_PER_CARBON - getCharmanderCarbonUseCount()
    );
    return clamp01(availableUses / CHARMANDER_FIRE_USES_PER_CARBON);
  }

  function getCharmanderCarbonEnergyState() {
    const current = getCharmanderCarbonEnergyRatio();

    if (!session.charmanderCarbonEnergy) {
      session.charmanderCarbonEnergy = {
        current,
        visualCurrent: current
      };
    }

    session.charmanderCarbonEnergy.current = current;
    session.charmanderCarbonEnergy.visualCurrent = clamp01(
      Number.isFinite(session.charmanderCarbonEnergy.visualCurrent) ?
        session.charmanderCarbonEnergy.visualCurrent :
        current
    );
    return session.charmanderCarbonEnergy;
  }

  function updateCharmanderCarbonEnergy(deltaTime) {
    const energy = getCharmanderCarbonEnergyState();
    const visualDuration =
      energy.current < energy.visualCurrent ?
        CHARMANDER_CARBON_VISUAL_DECREASE_DURATION :
        CHARMANDER_CARBON_VISUAL_INCREASE_DURATION;
    const maxVisualStep = deltaTime / Math.max(0.001, visualDuration);
    energy.visualCurrent = moveValueToward(
      energy.visualCurrent,
      energy.current,
      maxVisualStep
    );
  }

  function isSquirtleWaterGunCellPending(groundCell) {
    if (!groundCell?.id) {
      return false;
    }

    if (session.squirtleWaterGunAction?.groundCell?.id === groundCell.id) {
      return true;
    }

    return getSquirtleWaterGunQueue().some((queuedAction) => {
      return queuedAction?.groundCell?.id === groundCell.id;
    });
  }

  function enqueueSquirtleWaterGunAction({ groundCell, playerPosition }) {
    if (!groundCell) {
      return "unavailable";
    }

    if (isSquirtleWaterCharging()) {
      return "charging";
    }

    if (isSquirtleWaterGunCellPending(groundCell)) {
      return "duplicate";
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    getSquirtleWaterGunQueue().push({
      groundCell,
      targetPosition,
      playerPosition: playerPosition ? [...playerPosition] : null
    });

    return "queued";
  }

  function startSquirtleWaterGunAction({ groundCell, playerPosition }) {
    if (!groundCell) {
      return "unavailable";
    }

    const stamina = getSquirtleWaterStaminaState();
    if (stamina.charging || stamina.current <= 0) {
      beginSquirtleWaterRecharge();
      return "charging";
    }

    if (session.squirtleWaterGunAction) {
      return enqueueSquirtleWaterGunAction({
        groundCell,
        playerPosition
      });
    }

    const squirtle = session.actTwoSquirtle;
    if (!squirtle?.modelInstance || !squirtle.recovered) {
      return "unavailable";
    }

    if (!Array.isArray(squirtle.position)) {
      squirtle.position = [...(squirtle.modelInstance.offset || playerPosition || [0, 0.04, 0])];
    }

    const targetPosition = getGroundCellCenterPosition(groundCell);
    const approachPosition = getSquirtleWaterGunApproachPosition(
      targetPosition,
      playerPosition
    );
    const speedMultiplier = getSquirtleWaterGunSpeedMultiplier();

    session.squirtleWaterGunAction = {
      phase: "approach",
      groundCell,
      targetPosition,
      approachPosition,
      speedMultiplier,
      sprayDuration: getSquirtleWaterGunSprayDuration(speedMultiplier),
      impactTime: getSquirtleWaterGunImpactTime(speedMultiplier),
      sprayElapsed: 0,
      impactApplied: false
    };
    squirtle.modelInstance.active = true;
    squirtle.modelInstance.yaw = getSquirtleModelYawToward(squirtle.position, targetPosition);
    syncSquirtleModelInstance();

    return "started";
  }

  function startNextQueuedSquirtleWaterGunAction() {
    if (session.squirtleWaterGunAction) {
      return;
    }

    const stamina = getSquirtleWaterStaminaState();
    if (stamina.charging) {
      return;
    }

    if (stamina.current <= 0) {
      beginSquirtleWaterRecharge();
      return;
    }

    const queue = getSquirtleWaterGunQueue();
    while (queue.length) {
      const nextAction = queue.shift();
      if (!nextAction?.groundCell) {
        continue;
      }

      if (!session.groundDeadInstances?.includes(nextAction.groundCell)) {
        continue;
      }

      startSquirtleWaterGunAction({
        groundCell: nextAction.groundCell,
        playerPosition: nextAction.playerPosition || session.playerCharacter?.getPosition?.() || null
      });
      return;
    }
  }

  function getPendingSquirtleWaterGunGroundCells() {
    const pendingGroundCells = [];

    if (
      session.squirtleWaterGunAction?.phase === "approach" &&
      session.squirtleWaterGunAction.groundCell
    ) {
      pendingGroundCells.push(session.squirtleWaterGunAction.groundCell);
    }

    for (const queuedAction of getSquirtleWaterGunQueue()) {
      if (
        queuedAction?.groundCell &&
        session.groundDeadInstances?.includes(queuedAction.groundCell)
      ) {
        pendingGroundCells.push(queuedAction.groundCell);
      }
    }

    return pendingGroundCells;
  }

  function applySquirtleWaterGunImpact(action) {
    const grassPatchWasDry =
      Boolean(findGrassPatchForGroundCell(action.groundCell)) &&
      !isAliveGrassPatchForGroundCell(action.groundCell);
    const result = performGameplayHarvestAction({
      playerPosition: action.approachPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: true,
      groundDeadInstances: session.groundDeadInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: false,
      useWaterGun: true,
      forcedHarvestTarget: {
        groundCell: action.groundCell,
        distance: 0
      }
    }, {
      actionType: "waterGun",
      groundCell: action.groundCell
    });

    if (result && grassPatchWasDry && isAliveGrassPatchForGroundCell(action.groundCell)) {
      playInstanceObjectSfx();
    }

    if (result) {
      recordSquirtleWaterGunUse();
    }

    return result;
  }

  function updateSquirtleWaterGunAction(deltaTime) {
    const action = session.squirtleWaterGunAction;
    const squirtle = session.actTwoSquirtle;

    if (!action || !squirtle?.modelInstance) {
      return;
    }

    if (!Array.isArray(squirtle.position)) {
      squirtle.position = [...(squirtle.modelInstance.offset || action.approachPosition)];
    }

    if (action.phase === "approach") {
      const deltaX = action.approachPosition[0] - squirtle.position[0];
      const deltaZ = action.approachPosition[2] - squirtle.position[2];
      const distance = Math.hypot(deltaX, deltaZ);
      const speedMultiplier = Number(action.speedMultiplier) > 0 ?
        action.speedMultiplier :
        getSquirtleWaterGunSpeedMultiplier();
      const travel = Math.min(SQUIRTLE_WATER_GUN_SPEED * speedMultiplier * deltaTime, distance);

      if (distance > SQUIRTLE_WATER_GUN_ARRIVE_DISTANCE && travel > 0) {
        const nextPosition = [
          squirtle.position[0] + (deltaX / distance) * travel,
          0.04,
          squirtle.position[2] + (deltaZ / distance) * travel
        ];
        if (!tryMoveCompanionToPosition(squirtle, nextPosition)) {
          session.squirtleWaterGunAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.hydro);
          syncSquirtleModelInstance();
          return;
        }
      } else {
        if (isCompanionPositionBlockedByConstruction(action.approachPosition)) {
          session.squirtleWaterGunAction = null;
          cancelBlockedCompanionAction(SANDBOTS_BOT_NAMES.hydro);
          syncSquirtleModelInstance();
          return;
        }

        if (!consumeSquirtleWaterStamina()) {
          session.squirtleWaterGunAction = null;
          return;
        }

        squirtle.position = [...action.approachPosition];
        action.phase = "spray";
        action.sprayElapsed = 0;
      }

      squirtle.modelInstance.yaw = getSquirtleModelYawToward(
        squirtle.position,
        action.targetPosition
      );
      syncSquirtleModelInstance();
      return;
    }

    if (action.phase !== "spray") {
      session.squirtleWaterGunAction = null;
      return;
    }

    action.sprayElapsed += deltaTime;
    const speedMultiplier = Number(action.speedMultiplier) > 0 ?
      action.speedMultiplier :
      getSquirtleWaterGunSpeedMultiplier();
    const impactTime = Number(action.impactTime) > 0 ?
      action.impactTime :
      getSquirtleWaterGunImpactTime(speedMultiplier);
    const sprayDuration = Number(action.sprayDuration) > 0 ?
      action.sprayDuration :
      getSquirtleWaterGunSprayDuration(speedMultiplier);
    squirtle.modelInstance.yaw = getSquirtleModelYawToward(
      squirtle.position,
      action.targetPosition
    );
    syncSquirtleModelInstance();

    if (!action.impactApplied && action.sprayElapsed >= impactTime) {
      action.impactApplied = true;
      applySquirtleWaterGunImpact(action);
    }

    if (action.sprayElapsed >= sprayDuration) {
      session.squirtleWaterGunAction = null;
      if (getSquirtleWaterStaminaState().current <= 0) {
        beginSquirtleWaterRecharge();
      } else {
        startNextQueuedSquirtleWaterGunAction();
      }
    }
  }

  function getSquirtleMouthPosition() {
    const squirtle = session.actTwoSquirtle;
    const position = squirtle?.position || squirtle?.modelInstance?.offset || [0, 0, 0];
    const yaw = getSquirtleLogicalFacingYaw();

    return [
      position[0] + Math.sin(yaw) * 0.34,
      (position[1] || 0) + 0.66,
      position[2] + Math.cos(yaw) * 0.34
    ];
  }

  function getSquirtleWaterGunBillboards(action, texture, uvRect) {
    if (!action || action.phase !== "spray" || !texture) {
      return [];
    }

    const sprayDuration = Number(action.sprayDuration) > 0 ?
      action.sprayDuration :
      SQUIRTLE_WATER_GUN_SPRAY_DURATION;
    const impactTime = Number(action.impactTime) > 0 ?
      action.impactTime :
      SQUIRTLE_WATER_GUN_IMPACT_TIME;
    const progress = Math.min(
      1,
      Math.max(0, action.sprayElapsed / sprayDuration)
    );
    const mouthPosition = getSquirtleMouthPosition();
    const targetPosition = action.targetPosition;
    const streamDirectionX = targetPosition[0] - mouthPosition[0];
    const streamDirectionZ = targetPosition[2] - mouthPosition[2];
    const streamLength = Math.hypot(streamDirectionX, streamDirectionZ) || 1;
    const sideX = -streamDirectionZ / streamLength;
    const sideZ = streamDirectionX / streamLength;
    const forwardX = streamDirectionX / streamLength;
    const forwardZ = streamDirectionZ / streamLength;
    const billboards = [];

    for (let index = 0; index < SQUIRTLE_WATER_GUN_PARTICLE_COUNT; index += 1) {
      const pathProgress = (progress * 1.72 + index * 0.047) % 1;
      const lane = (index % SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT) -
        (SQUIRTLE_WATER_GUN_STREAM_LANE_COUNT - 1) * 0.5;
      const impactStretch = clamp01((pathProgress - 0.74) / 0.26);
      const wobble = Math.sin(progress * 22 + index * 1.7) * 0.045;
      const laneOffset = lane * SQUIRTLE_WATER_GUN_STREAM_WIDTH;
      const splashSide = (index % 2 === 0 ? -1 : 1) *
        impactStretch *
        (0.11 + (index % 4) * 0.035);
      const splashForward = ((index % 5) - 2) * impactStretch * 0.035;
      const baseSize = 0.14 + (index % 4) * 0.018;
      const arcY = mouthPosition[1] +
        (targetPosition[1] - mouthPosition[1]) * pathProgress +
        Math.sin(pathProgress * Math.PI) * SQUIRTLE_WATER_GUN_ARC_HEIGHT;
      const groundY = targetPosition[1] + 0.045 + (index % 2) * 0.012;
      const y = lerp(arcY, groundY, impactStretch * impactStretch);

      billboards.push({
        texture,
        position: [
          mouthPosition[0] +
            (targetPosition[0] - mouthPosition[0]) * pathProgress +
            sideX * (wobble + laneOffset + splashSide) +
            forwardX * splashForward,
          y,
          mouthPosition[2] +
            (targetPosition[2] - mouthPosition[2]) * pathProgress +
            sideZ * (wobble + laneOffset + splashSide) +
            forwardZ * splashForward
        ],
        size: [
          baseSize * (1.08 + impactStretch * 2.35),
          baseSize * (0.96 - impactStretch * 0.48)
        ],
        uvRect
      });
    }

    const splashElapsed = action.sprayElapsed - impactTime;

    if (splashElapsed >= 0) {
      const splashProgress = clamp01(splashElapsed / SQUIRTLE_WATER_GUN_SPLASH_DURATION);
      const splashRadius = easeOutCubic(splashProgress) * SQUIRTLE_WATER_GUN_SPLASH_RADIUS;
      const splashLift = Math.sin(splashProgress * Math.PI) * 0.075 * (1 - splashProgress * 0.35);

      for (let index = 0; index < SQUIRTLE_WATER_GUN_SPLASH_PARTICLE_COUNT; index += 1) {
        const angle = index * 2.39996 + progress * 1.6;
        const radius = splashRadius * (0.36 + (index % 4) * 0.18);
        const size = 0.16 + (index % 3) * 0.035;

        billboards.push({
          texture,
          position: [
            targetPosition[0] + Math.cos(angle) * radius,
            targetPosition[1] + 0.05 + splashLift + (index % 2) * 0.012,
            targetPosition[2] + Math.sin(angle) * radius
          ],
          size: [
            size * (1.45 + splashProgress * 1.85),
            size * (0.48 - splashProgress * 0.18)
          ],
          uvRect
        });
      }
    }

    return billboards;
  }

  function getCharmanderMouthPosition() {
    const charmander = session.charmanderEncounter;
    const position = charmander?.position || charmander?.modelInstance?.offset || [0, 0, 0];
    const yaw = getCharmanderLogicalFacingYaw();

    return [
      position[0] + Math.sin(yaw) * 0.28,
      (position[1] || 0) + 0.58,
      position[2] + Math.cos(yaw) * 0.28
    ];
  }

  function getCharmanderFireBillboards(action, texture, uvRect) {
    if (!action || action.phase !== "spray" || !texture) {
      return [];
    }

    const progress = clamp01(action.sprayElapsed / CHARMANDER_FIRE_SPRAY_DURATION);
    const elapsedSeconds = Math.max(0, action.sprayElapsed);
    const mouthPosition = getCharmanderMouthPosition();
    const targetPosition = action.targetPosition;
    const streamDirectionX = targetPosition[0] - mouthPosition[0];
    const streamDirectionZ = targetPosition[2] - mouthPosition[2];
    const streamLength = Math.hypot(streamDirectionX, streamDirectionZ) || 1;
    const sideX = -streamDirectionZ / streamLength;
    const sideZ = streamDirectionX / streamLength;
    const forwardX = streamDirectionX / streamLength;
    const forwardZ = streamDirectionZ / streamLength;
    const billboards = [];

    for (let index = 0; index < CHARMANDER_FIRE_PARTICLE_COUNT; index += 1) {
      const seed = index + 1;
      const lifetime = lerp(
        CHARMANDER_FIRE_PARTICLE_LIFETIME_MIN,
        CHARMANDER_FIRE_PARTICLE_LIFETIME_MAX,
        hashUnit(seed + 0.11)
      );
      const life = ((elapsedSeconds + hashUnit(seed + 0.23) * lifetime) % lifetime) /
        lifetime;
      const pathProgress = clamp01(life * (1.08 + hashUnit(seed + 0.37) * 0.22));
      const opacityCurve = clamp01(life / 0.12) * (1 - life);
      const sizeCurve = Math.sin(life * Math.PI);
      const impactStretch = clamp01((pathProgress - 0.68) / 0.32);
      const coneRadius = CHARMANDER_FIRE_CONE_RADIUS * (0.44 + impactStretch * 0.72);
      const noiseTime = elapsedSeconds * 11.2 + seed * 1.91;
      const noiseSide = (
        Math.sin(noiseTime) * CHARMANDER_FIRE_NOISE_STRENGTH +
        Math.sin(noiseTime * 0.57 + seed) * CHARMANDER_FIRE_NOISE_POSITION_AMOUNT
      ) * (0.22 + pathProgress * 0.78);
      const sideOffset = (hashUnit(seed + 0.49) - 0.5) * coneRadius + noiseSide;
      const forwardOffset = (hashUnit(seed + 0.61) - 0.5) *
        CHARMANDER_FIRE_NOISE_POSITION_AMOUNT *
        impactStretch;
      const baseSize = lerp(
        CHARMANDER_FIRE_PARTICLE_SIZE_MIN,
        CHARMANDER_FIRE_PARTICLE_SIZE_MAX,
        hashUnit(seed + 0.73)
      ) * Math.max(0.08, sizeCurve);
      const arcY = mouthPosition[1] +
        (targetPosition[1] - mouthPosition[1]) * pathProgress +
        Math.sin(pathProgress * Math.PI) * CHARMANDER_FIRE_ARC_HEIGHT * 0.32;
      const gravityDrop = pathProgress * pathProgress * 0.08 * CHARMANDER_FIRE_VISUAL_SCALE;
      const y = Math.max(
        targetPosition[1] + 0.06,
        arcY - gravityDrop + (hashUnit(seed + 0.83) - 0.5) * coneRadius * 0.36
      );

      billboards.push({
        texture,
        position: [
          mouthPosition[0] +
            (targetPosition[0] - mouthPosition[0]) * pathProgress +
            sideX * sideOffset +
            forwardX * forwardOffset,
          y,
          mouthPosition[2] +
            (targetPosition[2] - mouthPosition[2]) * pathProgress +
            sideZ * sideOffset +
            forwardZ * forwardOffset
        ],
        size: [
          baseSize * (0.72 + impactStretch * 0.46),
          baseSize * (1.12 + sizeCurve * 0.32)
        ],
        alpha: opacityCurve * (0.84 + hashUnit(seed + 0.97) * 0.16),
        rotation: (hashUnit(seed + 1.09) - 0.5) * Math.PI * 2 +
          Math.sin(noiseTime * 0.42) * CHARMANDER_FIRE_NOISE_ROTATION_AMOUNT +
          lerp(-0.7, 0.7, hashUnit(seed + 1.17)) * life,
        uvRect
      });
    }

    const burstElapsed = action.sprayElapsed - CHARMANDER_FIRE_IMPACT_TIME;

    if (burstElapsed >= 0) {
      const burstProgress = clamp01(burstElapsed / CHARMANDER_FIRE_BURST_DURATION);
      const burstRadius = easeOutCubic(burstProgress) * CHARMANDER_FIRE_BURST_RADIUS;
      const fade = 1 - burstProgress;

      for (let index = 0; index < CHARMANDER_FIRE_BURST_PARTICLE_COUNT; index += 1) {
        const angle = index * 2.39996 + progress * 2.2;
        const radius = burstRadius * (0.28 + (index % 5) * 0.16);
        const size = (0.22 + (index % 3) * 0.045) *
          CHARMANDER_FIRE_VISUAL_SCALE;

        billboards.push({
          texture,
          position: [
            targetPosition[0] + Math.cos(angle) * radius,
            targetPosition[1] + 0.08 + Math.sin(burstProgress * Math.PI) * 0.18,
            targetPosition[2] + Math.sin(angle) * radius
          ],
          size: [
            size * (1.1 + burstProgress * 1.5),
            size * (1.35 + burstProgress * 1.1)
          ],
          alpha: fade * 0.9,
          rotation: angle + burstProgress * 1.2,
          uvRect
        });
      }
    }

    return billboards;
  }

  function getBulbasaurGrowEmitterPosition() {
    const bulbasaur = session.bulbasaurEncounter;
    const position = bulbasaur?.position || bulbasaur?.modelInstance?.offset || [0, 0, 0];
    const yaw = getBulbasaurLogicalFacingYaw();

    return [
      position[0] + Math.sin(yaw) * 0.3,
      (position[1] || 0) + 0.72,
      position[2] + Math.cos(yaw) * 0.3
    ];
  }

  function getBulbasaurLeafageBillboards(action, texture, uvRect) {
    if (!action || action.phase !== "cast" || !texture || !Array.isArray(action.targetPosition)) {
      return [];
    }

    const castElapsed = Math.max(0, Number(action.castElapsed || 0));
    const progress = clamp01(castElapsed / BULBASAUR_LEAFAGE_CAST_DURATION);
    const emitterPosition = getBulbasaurGrowEmitterPosition();
    const targetPosition = action.targetPosition;
    const streamDirectionX = targetPosition[0] - emitterPosition[0];
    const streamDirectionZ = targetPosition[2] - emitterPosition[2];
    const streamLength = Math.hypot(streamDirectionX, streamDirectionZ) || 1;
    const sideX = -streamDirectionZ / streamLength;
    const sideZ = streamDirectionX / streamLength;
    const billboards = [];

    for (let index = 0; index < BULBASAUR_LEAFAGE_PARTICLE_COUNT; index += 1) {
      const seed = index + 1;
      const pathProgress = (progress * 1.48 + index * 0.041) % 1;
      const lane = ((index % 5) - 2) * BULBASAUR_LEAFAGE_STREAM_WIDTH;
      const sideWobble = Math.sin(castElapsed * 18 + seed * 1.73) * 0.08;
      const pathLift = Math.sin(pathProgress * Math.PI) * BULBASAUR_LEAFAGE_ARC_HEIGHT;
      const baseSize = lerp(
        BULBASAUR_LEAFAGE_PARTICLE_SIZE_MIN,
        BULBASAUR_LEAFAGE_PARTICLE_SIZE_MAX,
        hashUnit(seed + 0.37)
      );
      const fadeIn = clamp01(castElapsed / 0.08);
      const fadeOut = clamp01((BULBASAUR_LEAFAGE_CAST_DURATION - castElapsed) / 0.18);

      billboards.push({
        texture,
        position: [
          emitterPosition[0] +
            (targetPosition[0] - emitterPosition[0]) * pathProgress +
            sideX * (lane + sideWobble),
          emitterPosition[1] +
            (targetPosition[1] - emitterPosition[1]) * pathProgress +
            pathLift +
            (hashUnit(seed + 0.57) - 0.5) * 0.08,
          emitterPosition[2] +
            (targetPosition[2] - emitterPosition[2]) * pathProgress +
            sideZ * (lane + sideWobble)
        ],
        size: [
          baseSize * (0.82 + Math.sin(pathProgress * Math.PI) * 0.62),
          baseSize * (0.82 + hashUnit(seed + 0.77) * 0.5)
        ],
        alpha: fadeIn * fadeOut * (0.72 + hashUnit(seed + 0.91) * 0.28),
        rotation: castElapsed * (2.8 + hashUnit(seed + 1.11) * 3.2) + seed,
        uvRect
      });
    }

    const burstElapsed = castElapsed - BULBASAUR_LEAFAGE_IMPACT_TIME;
    if (burstElapsed >= 0) {
      const burstProgress = clamp01(burstElapsed / BULBASAUR_LEAFAGE_BURST_DURATION);
      const burstRadius = easeOutCubic(burstProgress) * BULBASAUR_LEAFAGE_BURST_RADIUS;
      const burstLift = Math.sin(burstProgress * Math.PI) * 0.24;
      const fade = 1 - burstProgress;

      for (let index = 0; index < BULBASAUR_LEAFAGE_BURST_PARTICLE_COUNT; index += 1) {
        const angle = index * 2.39996 + progress * 2.6;
        const radius = burstRadius * (0.32 + (index % 4) * 0.18);
        const size = 0.18 + (index % 3) * 0.04;

        billboards.push({
          texture,
          position: [
            targetPosition[0] + Math.cos(angle) * radius,
            targetPosition[1] + 0.1 + burstLift + (index % 2) * 0.018,
            targetPosition[2] + Math.sin(angle) * radius
          ],
          size: [
            size * (1.1 + burstProgress * 1.35),
            size * (1.1 + Math.sin(burstProgress * Math.PI) * 0.75)
          ],
          alpha: fade * 0.92,
          rotation: angle + burstProgress * 1.8,
          uvRect
        });
      }
    }

    return billboards;
  }

  function getSquirtleWorldPosition() {
    const squirtle = session.actTwoSquirtle;
    return squirtle?.position || squirtle?.modelInstance?.offset || null;
  }

  function getCharmanderWorldPosition() {
    const charmander = session.charmanderEncounter;
    return charmander?.position || charmander?.modelInstance?.offset || null;
  }

  function getPeriodicChopperAttentionCue({
    activeTask,
    activeSystemQuest,
    chopperPosition,
    now
  }) {
    const shouldCueChopper =
      (activeTask?.id || activeSystemQuest?.id) === "wake-guide" &&
      Array.isArray(chopperPosition) &&
      !isPlayerNearWorldPosition(chopperPosition, POKEMON_TALK_INTERACT_DISTANCE + 0.45);

    return chopperAttentionCueRuntime.get(
      shouldCueChopper ?
        {
          text: CHOPPER_ATTENTION_CUE_TEXT,
          worldPosition: chopperPosition
        } :
        null,
      now
    );
  }

  function resolveWaterGunCompanionLostHint(activeQuest, activeMoveId) {
    const flags = controls.storyState?.flags || {};
    const restoredGrassCount = Number(flags.restoredGrassCount || 0);
    const activeDryGrassQuest = activeQuest?.id === "water-dry-grass";
    const activeBulbasaurDryGrassRequest =
      flags.bulbasaurDryGrassMissionAccepted &&
      !flags.bulbasaurDryGrassMissionComplete &&
      restoredGrassCount < BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT;
    const needsWaterGun =
      controls.playerSkills?.waterGun &&
      (
        activeDryGrassQuest ||
        activeBulbasaurDryGrassRequest
      );

    if (!needsWaterGun) {
      return null;
    }

    if (activeMoveId === "leafage" && Array.isArray(session.bulbasaurEncounter?.position)) {
      return {
        key: "bulbasaur-switch-to-squirtle",
        text: BULBASAUR_SWITCH_TO_SQUIRTLE_HINT_TEXT,
        worldPosition: session.bulbasaurEncounter.position
      };
    }

    const squirtlePosition = getSquirtleWorldPosition();

    if (!Array.isArray(squirtlePosition)) {
      return null;
    }

    return {
      key: "squirtle-use-water-gun",
      text: SQUIRTLE_WATER_GUN_HINT_TEXT,
      worldPosition: squirtlePosition
    };
  }

  function getPeriodicCompanionLostHint({
    activeQuest,
    activeMoveId,
    now
  }) {
    const hint = resolveWaterGunCompanionLostHint(activeQuest, activeMoveId);

    return companionLostHintRuntime.get(hint, now);
  }

  function getSquirtleStaminaBillboards(fillTexture, uvRect) {
    const position = getSquirtleWorldPosition();
    if (!Array.isArray(position) || !fillTexture) {
      return [];
    }

    const stamina = getSquirtleWaterStaminaState();
    const ratio = clamp01(stamina.visualCurrent / stamina.max);
    const barPosition = [
      position[0],
      (position[1] || 0) + 1.25,
      position[2]
    ];
    const billboards = [];

    if (ratio > 0.02) {
      const fillWidth = SQUIRTLE_WATER_STAMINA_BAR_WIDTH * ratio;
      const quadRight = camera.getBillboardAxes?.()?.right || [1, 0, 0];
      const fillCenterOffset = -(SQUIRTLE_WATER_STAMINA_BAR_WIDTH * 0.5) + (fillWidth * 0.5);
      const fillUvRect = [
        uvRect[0],
        uvRect[1],
        uvRect[0] + ((uvRect[2] - uvRect[0]) * ratio),
        uvRect[3]
      ];

      billboards.push({
        texture: fillTexture,
        position: [
          barPosition[0] + (quadRight[0] * fillCenterOffset),
          barPosition[1] + ((quadRight[1] || 0) * fillCenterOffset),
          barPosition[2] + (quadRight[2] * fillCenterOffset)
        ],
        size: [fillWidth, SQUIRTLE_WATER_STAMINA_BAR_HEIGHT],
        uvRect: fillUvRect,
        alpha: 0.95
      });
    }

    return billboards;
  }

  function offsetTowardCamera(position, amount) {
    const direction = camera.getPose?.()?.direction;
    if (!Array.isArray(direction)) {
      return position;
    }

    return [
      position[0] + direction[0] * amount,
      position[1] + direction[1] * amount,
      position[2] + direction[2] * amount
    ];
  }

  function getCharmanderCarbonBillboards({ fillTexture, backTexture, uvRect }) {
    const position = getCharmanderWorldPosition();

    if (!Array.isArray(position) || !fillTexture) {
      return [];
    }

    const energy = getCharmanderCarbonEnergyState();
    const ratio = clamp01(energy.visualCurrent);
    const barPosition = [
      position[0],
      (position[1] || 0) + CHARMANDER_CARBON_BAR_Y_OFFSET,
      position[2]
    ];
    const billboards = [];

    if (backTexture) {
      billboards.push({
        texture: backTexture,
        position: barPosition,
        size: [CHARMANDER_CARBON_BAR_WIDTH, CHARMANDER_CARBON_BAR_HEIGHT],
        uvRect,
        alpha: 0.88
      });
    }

    if (ratio > 0.02) {
      const fillWidth = CHARMANDER_CARBON_BAR_WIDTH * ratio;
      const quadRight = camera.getBillboardAxes?.()?.right || [1, 0, 0];
      const fillCenterOffset = -(CHARMANDER_CARBON_BAR_WIDTH * 0.5) + (fillWidth * 0.5);
      const fillUvRect = [
        uvRect[0],
        uvRect[1],
        uvRect[0] + ((uvRect[2] - uvRect[0]) * ratio),
        uvRect[3]
      ];

      billboards.push({
        texture: fillTexture,
        position: offsetTowardCamera([
          barPosition[0] + (quadRight[0] * fillCenterOffset),
          barPosition[1] + ((quadRight[1] || 0) * fillCenterOffset),
          barPosition[2] + (quadRight[2] * fillCenterOffset)
        ], CHARMANDER_CARBON_BAR_FILL_DEPTH_OFFSET),
        size: [fillWidth, CHARMANDER_CARBON_BAR_HEIGHT],
        uvRect: fillUvRect,
        alpha: 0.96
      });
    }

    return billboards;
  }

  function getSquirtleChargingBillboards(texture, uvRect, now) {
    const position = getSquirtleWorldPosition();
    if (!isSquirtleWaterCharging() || !Array.isArray(position) || !texture) {
      return [];
    }

    const time = now * 0.001;
    const billboards = [];
    for (let index = 0; index < SQUIRTLE_CHARGING_PARTICLE_COUNT; index += 1) {
      const cycle = (time / SQUIRTLE_CHARGING_PARTICLE_DURATION + index / SQUIRTLE_CHARGING_PARTICLE_COUNT) % 1;
      const inward = easeOutCubic(cycle);
      const radius = SQUIRTLE_CHARGING_PARTICLE_RADIUS * (1 - inward);
      const angle = index * 2.39996 + time * 0.72;
      const size = 0.09 + (index % 3) * 0.022;
      const alpha = Math.sin(cycle * Math.PI) * 0.88;

      billboards.push({
        texture,
        position: [
          position[0] + Math.cos(angle) * radius,
          (position[1] || 0) + lerp(1.68 + (index % 4) * 0.08, 0.66, inward),
          position[2] + Math.sin(angle) * radius
        ],
        size: [size, size],
        uvRect,
        alpha
      });
    }

    return billboards;
  }

  function snapshotAvailableWoodDrops(woodDrops = []) {
    const snapshots = new Map();

    for (const woodDrop of woodDrops) {
      if (!woodDrop || woodDrop.collected) {
        continue;
      }

      snapshots.set(woodDrop, {
        position: [...woodDrop.position],
        size: [...woodDrop.size],
        uvRect: woodDrop.uvRect || [0, 0, 1, 1]
      });
    }

    return snapshots;
  }

  function snapshotCollectibleSources(collectibles = [], predicate = () => true) {
    const snapshots = new Map();

    for (const collectible of collectibles || []) {
      if (!collectible || !predicate(collectible)) {
        continue;
      }

      snapshots.set(collectible, {
        active: collectible.active !== false,
        collected: Boolean(collectible.collected),
        cooldown: Number(collectible.cooldown || 0),
        position: Array.isArray(collectible.position) ? [...collectible.position] : null,
        yield: Math.max(1, Number(collectible.yield || 1))
      });
    }

    return snapshots;
  }

  function getNewlyCollectedDropPositions(dropSnapshots) {
    const positions = [];

    for (const [drop, snapshot] of dropSnapshots) {
      if (!snapshot.collected && drop.collected && Array.isArray(snapshot.position)) {
        positions.push(snapshot.position);
      }
    }

    return positions;
  }

  function getNewlyCollectedResourcePositions(resourceSnapshots) {
    const positions = [];

    for (const [resourceNode, snapshot] of resourceSnapshots) {
      if (
        snapshot.active &&
        resourceNode.active === false &&
        Number(resourceNode.cooldown || 0) > snapshot.cooldown &&
        Array.isArray(snapshot.position)
      ) {
        for (let copyIndex = 0; copyIndex < snapshot.yield; copyIndex += 1) {
          positions.push(snapshot.position);
        }
      }
    }

    return positions;
  }

  function projectWorldPositionToViewport(position) {
    if (
      !Array.isArray(position) ||
      typeof camera.project !== "function" ||
      !worldCanvas
    ) {
      return null;
    }

    const canvasWidth = worldCanvas.width || 0;
    const canvasHeight = worldCanvas.height || 0;

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      return null;
    }

    camera.getViewProjection?.(canvasWidth, canvasHeight);
    const projected = camera.project(
      [position[0], (position[1] || 0) + 0.5, position[2]],
      canvasWidth,
      canvasHeight
    );

    if (!projected || projected.depth > 1) {
      return null;
    }

    const rect = worldCanvas.getBoundingClientRect?.();

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return { x: projected.x, y: projected.y };
    }

    return {
      x: rect.left + projected.x * (rect.width / canvasWidth),
      y: rect.top + projected.y * (rect.height / canvasHeight)
    };
  }

  function getCanvasCenterViewportOrigin() {
    const rect = worldCanvas?.getBoundingClientRect?.();

    if (rect && rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5
      };
    }

    const windowRef = worldCanvas?.ownerDocument?.defaultView || globalThis.window;

    return {
      x: Number(windowRef?.innerWidth || 0) * 0.5,
      y: Number(windowRef?.innerHeight || 0) * 0.5
    };
  }

  function isViewportOriginUsable(origin) {
    if (
      !origin ||
      !Number.isFinite(origin.x) ||
      !Number.isFinite(origin.y)
    ) {
      return false;
    }

    const windowRef = worldCanvas?.ownerDocument?.defaultView || globalThis.window;
    const viewportWidth = Number(windowRef?.innerWidth || 0);
    const viewportHeight = Number(windowRef?.innerHeight || 0);

    if (viewportWidth <= 0 || viewportHeight <= 0) {
      return true;
    }

    const margin = 64;

    return (
      origin.x >= -margin &&
      origin.y >= -margin &&
      origin.x <= viewportWidth + margin &&
      origin.y <= viewportHeight + margin
    );
  }

  function resolveSupplyPickupViewportOrigin(sourcePosition) {
    const sourceOrigin = projectWorldPositionToViewport(sourcePosition);

    if (isViewportOriginUsable(sourceOrigin)) {
      return sourceOrigin;
    }

    const playerOrigin = projectWorldPositionToViewport(session.playerCharacter?.getPosition?.());

    if (isViewportOriginUsable(playerOrigin)) {
      return playerOrigin;
    }

    return getCanvasCenterViewportOrigin();
  }

  function isWorldCellPlannerActive() {
    return Boolean(rendering?.debugWorldCellPlanner);
  }

  function getWorldCellPlannerGroundCells() {
    const cells = [];
    const seenCellIds = new Set();
    const collections = [
      session.groundDeadInstances,
      session.groundPurifiedInstances,
      session.iceGroundInstances
    ];

    for (const collection of collections) {
      if (!Array.isArray(collection)) {
        continue;
      }

      for (const groundCell of collection) {
        if (
          !groundCell?.id ||
          seenCellIds.has(groundCell.id) ||
          !Array.isArray(groundCell.offset)
        ) {
          continue;
        }

        seenCellIds.add(groundCell.id);
        cells.push(groundCell);
      }
    }

    return cells;
  }

  function projectWorldCellPlannerGroundCell(groundCell) {
    if (!groundCell?.offset || typeof camera.project !== "function" || !worldCanvas) {
      return null;
    }

    const canvasWidth = worldCanvas.width || 0;
    const canvasHeight = worldCanvas.height || 0;

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      return null;
    }

    const surfaceY = Number(groundCell.surfaceY ?? 0);
    const projected = camera.project(
      [groundCell.offset[0], surfaceY + 0.08, groundCell.offset[2]],
      canvasWidth,
      canvasHeight
    );

    if (!projected || projected.depth > 1) {
      return null;
    }

    const rect = worldCanvas.getBoundingClientRect?.();

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return {
        x: projected.x,
        y: projected.y
      };
    }

    return {
      x: rect.left + projected.x * (rect.width / canvasWidth),
      y: rect.top + projected.y * (rect.height / canvasHeight)
    };
  }

  function getWorldCellPlannerGridCell(groundCell) {
    const idMatch = /^ground-(\d+)-(\d+)$/.exec(String(groundCell?.id || ""));
    if (idMatch) {
      return {
        x: Number(idMatch[1]),
        y: Number(idMatch[2])
      };
    }

    if (!Array.isArray(groundCell?.offset)) {
      return null;
    }

    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    return gridSystem.worldToCell({
      x: groundCell.offset[0],
      y: groundCell.surfaceY || 0,
      z: groundCell.offset[2]
    });
  }

  function createWorldCellPlannerSelection(groundCell) {
    const surfaceY = Number(groundCell?.surfaceY ?? 0);
    const offset = groundCell?.offset || [0, 0, 0];
    const groundKind = groundCell?.groundKind ||
      (session.iceGroundInstances?.includes(groundCell) ? "cold" : "dead");

    return {
      cellId: groundCell?.id || "unknown",
      gridCell: getWorldCellPlannerGridCell(groundCell),
      worldPosition: [
        Number(Number(offset[0] || 0).toFixed(3)),
        Number(surfaceY.toFixed(3)),
        Number(Number(offset[2] || 0).toFixed(3))
      ],
      tileSpan: Number(groundCell?.tileSpan || 0),
      groundKind
    };
  }

  function resolveWorldCellPlannerPick({ clientX, clientY } = {}) {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return null;
    }

    let closestGroundCell = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const groundCell of getWorldCellPlannerGroundCells()) {
      const projected = projectWorldCellPlannerGroundCell(groundCell);
      if (!projected) {
        continue;
      }

      const distance = Math.hypot(projected.x - clientX, projected.y - clientY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestGroundCell = groundCell;
      }
    }

    if (!closestGroundCell || closestDistance > WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX) {
      return null;
    }

    return {
      groundCell: closestGroundCell,
      selection: createWorldCellPlannerSelection(closestGroundCell)
    };
  }

  function handleWorldCellPlannerPointerDown(event) {
    if (!isWorldCellPlannerActive() || (event.button ?? 0) !== 0) {
      return;
    }

    if (event.target?.closest?.("button, input, textarea, select, [contenteditable='true']")) {
      return;
    }

    event.preventDefault?.();
    event.stopPropagation?.();
    worldCellPlannerClickRuntime.queue({
      clientX: event.clientX,
      clientY: event.clientY
    });
  }

  function processWorldCellPlannerClick() {
    const request = worldCellPlannerClickRuntime.consume();
    if (!request) {
      return;
    }

    if (!isWorldCellPlannerActive()) {
      return;
    }

    const pick = resolveWorldCellPlannerPick(request);
    if (!pick) {
      hud?.pushNotice?.("No world cell found there.");
      return;
    }

    session.worldCellPlannerSelectedGroundCell = pick.groundCell;
    rendering?.onWorldCellPlannerPick?.(pick.selection);
    hud?.pushNotice?.(`Cell ${pick.selection.cellId} selected.`);
  }

  function getWorldCellPlannerSelectedGroundCell() {
    if (!isWorldCellPlannerActive() || !session.worldCellPlannerSelectedGroundCell?.offset) {
      return null;
    }

    return {
      ...session.worldCellPlannerSelectedGroundCell,
      highlightTargetState: "powerRadius",
      highlightAbilityId: "debug"
    };
  }

  mount?.addEventListener?.("pointerdown", handleWorldCellPlannerPointerDown, { capture: true });

  function queueSupplyPickupFlyItems(itemId, sourcePositions = []) {
    if (typeof hud.queueSupplyPickupFlyToSlot !== "function") {
      return;
    }

    const projectedOrigins = sourcePositions
      .map((sourcePosition) => resolveSupplyPickupViewportOrigin(sourcePosition))
      .filter(Boolean)
      .slice(0, 3);

    for (const origin of projectedOrigins) {
      hud.queueSupplyPickupFlyToSlot({ itemId, origin });
    }
  }

  function queueChangedSupplyPickupFlyItems(previousCounts, inventory = {}) {
    let queuedAny = false;

    for (const itemId of SUPPLY_PICKUP_FLY_ITEM_IDS) {
      const previousCount = Number(previousCounts?.[itemId] || 0);
      const nextCount = Number(inventory?.[itemId] || 0);
      const gainedCount = Math.max(0, Math.floor(nextCount - previousCount));

      if (gainedCount <= 0) {
        continue;
      }

      queueSupplyPickupFlyItems(itemId, Array.from({ length: gainedCount }));
      queuedAny = true;
    }

    return queuedAny;
  }

  function pushSupplyResourceCollectFeedback({
    itemId,
    count,
    sourcePositions = [],
    label = getSupplyCounterPromptLabel(itemId),
    now = performance.now()
  } = {}) {
    if (count <= 0 || !itemId) {
      return;
    }

    for (let index = 0; index < count; index += 1) {
      audio.playWoodGrab();
    }
    hud.syncInventoryUi(controls.inventory);
    queueSupplyPickupFlyItems(itemId, sourcePositions);
    hud.pushNotice(`+${count} ${label}`);
    triggerSupplyCounterPrompt(itemId, controls.inventory, now);
  }

  function getCampfireWoodPileBillboards(campfire, texture, uvRect) {
    if (!campfire?.position || !texture) {
      return [];
    }

    return CAMPFIRE_WOOD_PILE_OFFSETS.map(([offsetX, offsetY, offsetZ, rotation]) => ({
      texture,
      position: [
        campfire.position[0] + offsetX,
        campfire.position[1] + offsetY,
        campfire.position[2] + offsetZ
      ],
      size: CAMPFIRE_WOOD_PILE_SIZE,
      uvRect,
      rotation
    }));
  }

  function syncCampfireTrainHouseModelInstance(nowSeconds = getRuntimeNowSeconds(), deltaTime = 0) {
    const instance = session.campfireTrainHouseModelInstance;
    if (!instance) {
      return;
    }

    if (session.campfirePlacementPreview?.active) {
      return;
    }

    if (!session.campfire?.position || !controls.storyState.flags.campfireSpatOut) {
      instance.active = false;
      return;
    }

    applyTrainHouseDance(
      instance,
      session.campfire.position,
      nowSeconds,
      getWorkbenchRotationPreviewYaw({
        kind: "trainHouse",
        placement: session.campfire
      })
    );
    const spawnApplied = applyPlayerPlacementSpawnToModelInstance(session.campfire, instance, {
      baseScale: instance.trainHouseBaseScale,
      groundY: instance.trainHouseGroundY,
      deltaTime
    });
    if (!spawnApplied) {
      instance.alpha = 1;
      instance.tintStrength = 0;
    }
    applyWorkbenchRotationSelectionTint("trainHouse", instance, nowSeconds);
  }

  function syncGreenhouseModelInstance(deltaTime = 0) {
    const placements = Array.isArray(session.greenhouses) && session.greenhouses.length > 0 ?
      session.greenhouses :
      (session.greenhouse ? [session.greenhouse] : []);
    const instances = Array.isArray(session.greenhouseModelInstances) ?
      session.greenhouseModelInstances :
      [];

    if (!instances.length) {
      return;
    }

    if (!placements.length) {
      for (const instance of instances) {
        instance.active = false;
      }
      return;
    }

    placements.forEach((placement, index) => {
      const instance = instances[index];
      if (!instance || !Array.isArray(placement?.position)) {
        return;
      }

      instance.active = true;
      const spawnApplied = applyPlayerPlacementSpawnToModelInstance(placement, instance, {
        baseScale: instance.greenhouseBaseScale,
        groundY: instance.greenhouseGroundY,
        deltaTime
      });

      if (!spawnApplied) {
        const baseYaw = instance.greenhouseBaseYaw ?? 0;
        instance.offset = [
          placement.position[0],
          instance.greenhouseGroundY || 0.02,
          placement.position[2]
        ];
        instance.scale = instance.greenhouseBaseScale || instance.scale || 1.725;
        instance.yaw = baseYaw + Number(placement.yaw || 0);
        instance.alpha = 1;
        instance.tintStrength = 0;
      }
    });
  }

  function getLeafDenConstructionNowMs() {
    return Date.now();
  }

  function isLeafDenConstructionActive() {
    return Boolean(
      controls.storyState?.flags?.leafDenConstructionStarted &&
      !controls.storyState?.flags?.leafDenBuilt &&
      session.leafDen?.position
    );
  }

  function isLeafDenBusyCompanionTarget(target) {
    return Boolean(
      isLeafDenConstructionActive() &&
      target?.kind === "pokemonCompanion" &&
      (target.id === "charmander" || target.id === "timburr")
    );
  }

  function getLeafDenConstructionProgress(nowMs = getLeafDenConstructionNowMs()) {
    const flags = controls.storyState?.flags || {};
    const startedAt = Number(flags.leafDenConstructionStartedAt || 0);
    const completesAt = Number(flags.leafDenConstructionCompletesAt || 0);

    if (!startedAt || !completesAt || completesAt <= startedAt) {
      return 0;
    }

    return clamp01((nowMs - startedAt) / (completesAt - startedAt));
  }

  function ensureLeafDenConstructionCloudInstances() {
    if (!Array.isArray(session.leafDenConstructionCloudInstances)) {
      session.leafDenConstructionCloudInstances = Array.from(
        { length: LEAF_DEN_CONSTRUCTION_CLOUD_COUNT },
        (_, index) => ({
          id: `leaf-den-construction-cloud-${index}`,
          offset: [0, 0, 0],
          scale: 1,
          yaw: 0,
          pitch: 0,
          roll: 0,
          active: false
        })
      );

      if (Array.isArray(session.cloudAtmosphere?.cloudInstances)) {
        session.cloudAtmosphere.cloudInstances.push(...session.leafDenConstructionCloudInstances);
      }
    }

    return session.leafDenConstructionCloudInstances;
  }

  function getActiveConstructionCloudBursts(nowMs = getLeafDenConstructionNowMs()) {
    if (!Array.isArray(session.constructionCloudBursts)) {
      return [];
    }

    const activeBursts = session.constructionCloudBursts
      .map((effect) => {
        const startedAt = Number(effect?.startedAt || 0);
        const durationMs = Number(effect?.durationMs || 0);
        const progress = durationMs > 0 ? clamp01((nowMs - startedAt) / durationMs) : 1;

        return {
          ...effect,
          progress
        };
      })
      .filter((effect) => {
        return (
          Array.isArray(effect?.position) &&
          Number(effect.startedAt || 0) > 0 &&
          Number(effect.durationMs || 0) > 0 &&
          effect.progress < 1
        );
      })
      .slice(-CONSTRUCTION_CLOUD_BURST_MAX_EFFECTS);

    session.constructionCloudBursts = activeBursts.map(({ progress, ...effect }) => effect);
    return activeBursts;
  }

  function ensureConstructionCloudBurstInstances() {
    const requiredCount = CONSTRUCTION_CLOUD_BURST_MAX_EFFECTS * CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT;

    if (!Array.isArray(session.constructionCloudBurstInstances)) {
      session.constructionCloudBurstInstances = [];
    }

    while (session.constructionCloudBurstInstances.length < requiredCount) {
      const index = session.constructionCloudBurstInstances.length;
      session.constructionCloudBurstInstances.push({
        id: `construction-cloud-burst-${index}`,
        offset: [0, 0, 0],
        scale: 1,
        yaw: 0,
        pitch: 0,
        roll: 0,
        active: false
      });
    }

    if (
      Array.isArray(session.cloudAtmosphere?.cloudInstances) &&
      !session.constructionCloudBurstInstancesRegistered
    ) {
      session.cloudAtmosphere.cloudInstances.push(...session.constructionCloudBurstInstances);
      session.constructionCloudBurstInstancesRegistered = true;
    }

    return session.constructionCloudBurstInstances;
  }

  function syncConstructionCloudBurstEffects(nowSeconds = getRuntimeNowSeconds()) {
    const bursts = getActiveConstructionCloudBursts();
    const instances = ensureConstructionCloudBurstInstances();

    for (const instance of instances) {
      instance.active = false;
    }

    bursts.forEach((burst, burstIndex) => {
      const position = burst.position;
      const effectAlpha = Math.sin(Math.PI * clamp01(burst.progress));

      for (let index = 0; index < CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT; index += 1) {
        const instance = instances[(burstIndex * CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT) + index];
        if (!instance) {
          continue;
        }

        const angle = index * 2.399 + nowSeconds * (3.2 + (index % 4) * 0.36);
        const wobble = Math.sin(nowSeconds * 6.1 + index * 1.7);
        const radiusPulse = 0.65 + effectAlpha * 0.55 + Math.sin(nowSeconds * 4.2 + index) * 0.14;
        instance.active = true;
        instance.offset = [
          position[0] + Math.cos(angle) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_X * radiusPulse,
          LEAF_DEN_CONSTRUCTION_CLOUD_BASE_Y + Math.abs(wobble) * LEAF_DEN_CONSTRUCTION_CLOUD_BOB,
          position[2] + Math.sin(angle * 1.08) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_Z * radiusPulse
        ];
        instance.scale = (0.24 + (index % 5) * 0.045 + Math.abs(wobble) * 0.08) * Math.max(0.12, effectAlpha);
        instance.yaw = angle;
        instance.pitch = Math.sin(nowSeconds * 3.7 + index) * 0.24;
        instance.roll = Math.cos(nowSeconds * 4.6 + index * 0.5) * 0.3;
      }
    });
  }

  function syncLeafDenConstructionClouds(nowSeconds = getRuntimeNowSeconds()) {
    const instances = ensureLeafDenConstructionCloudInstances();
    const active = isLeafDenConstructionActive();
    const position = session.leafDen?.position;

    for (let index = 0; index < instances.length; index += 1) {
      const instance = instances[index];
      instance.active = active;

      if (!active || !Array.isArray(position)) {
        continue;
      }

      const angle = index * 2.399 + nowSeconds * (2.4 + (index % 4) * 0.28);
      const wobble = Math.sin(nowSeconds * 4.4 + index * 1.7);
      const radiusPulse = 1 + Math.sin(nowSeconds * 3.1 + index) * 0.18;
      instance.offset = [
        position[0] + Math.cos(angle) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_X * radiusPulse,
        LEAF_DEN_CONSTRUCTION_CLOUD_BASE_Y + Math.abs(wobble) * LEAF_DEN_CONSTRUCTION_CLOUD_BOB,
        position[2] + Math.sin(angle * 1.08) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_Z * radiusPulse
      ];
      instance.scale = 0.34 + (index % 5) * 0.055 + Math.abs(wobble) * 0.08;
      instance.yaw = angle;
      instance.pitch = Math.sin(nowSeconds * 2.7 + index) * 0.22;
      instance.roll = Math.cos(nowSeconds * 3.6 + index * 0.5) * 0.26;
    }
  }

  function getLeafDenConstructionBillboards(uvRect, nowSeconds = getRuntimeNowSeconds()) {
    if (!isLeafDenConstructionActive() || !Array.isArray(session.leafDen?.position)) {
      return [];
    }

    const position = session.leafDen.position;
    const progress = getLeafDenConstructionProgress();
    const billboards = [];
    const barY = position[1] + LEAF_DEN_CONSTRUCTION_BAR_Y;
    const barBackTexture = session.squirtleWaterStaminaBackTexture;
    const barFillTexture = session.charmanderCarbonFillTexture || session.squirtleWaterStaminaBackTexture;

    if (barBackTexture) {
      billboards.push({
        texture: barBackTexture,
        position: [position[0], barY, position[2]],
        size: [LEAF_DEN_CONSTRUCTION_BAR_WIDTH, LEAF_DEN_CONSTRUCTION_BAR_HEIGHT],
        uvRect
      });
    }

    if (barFillTexture && progress > 0) {
      const fillWidth = Math.max(0.08, LEAF_DEN_CONSTRUCTION_BAR_WIDTH * 0.9 * progress);
      billboards.push({
        texture: barFillTexture,
        position: [
          position[0] - LEAF_DEN_CONSTRUCTION_BAR_WIDTH * 0.45 + fillWidth * 0.5,
          barY + 0.01,
          position[2] - 0.015
        ],
        size: [fillWidth, LEAF_DEN_CONSTRUCTION_BAR_HEIGHT * 0.68],
        uvRect
      });
    }

    const starTexture = session.logChairStarTexture || session.natureRevivalSparkTexture;
    if (!starTexture) {
      return billboards;
    }

    for (let index = 0; index < LEAF_DEN_CONSTRUCTION_STAR_COUNT; index += 1) {
      const angle = index * 2.141 + nowSeconds * (1.8 + (index % 3) * 0.24);
      const pop = 0.5 + 0.5 * Math.sin(nowSeconds * 7.2 + index);
      const radius = 0.8 + (index % 4) * 0.2;
      billboards.push({
        texture: starTexture,
        position: [
          position[0] + Math.cos(angle) * radius,
          position[1] + 0.72 + pop * 0.95,
          position[2] + Math.sin(angle * 1.16) * (radius * 0.72)
        ],
        size: [0.2 + pop * 0.18, 0.2 + pop * 0.18],
        uvRect,
        rotation: angle
      });
    }

    return billboards;
  }

  function getConstructionCloudBurstBillboards(uvRect, nowSeconds = getRuntimeNowSeconds()) {
    const bursts = getActiveConstructionCloudBursts();
    const starTexture = session.logChairStarTexture || session.natureRevivalSparkTexture;
    if (!starTexture || bursts.length <= 0) {
      return [];
    }

    const billboards = [];
    for (const burst of bursts) {
      const position = burst.position;
      const effectAlpha = Math.sin(Math.PI * clamp01(burst.progress));

      for (let index = 0; index < CONSTRUCTION_CLOUD_BURST_STAR_COUNT; index += 1) {
        const angle = index * 2.141 + nowSeconds * (2.6 + (index % 3) * 0.28);
        const pop = 0.5 + 0.5 * Math.sin(nowSeconds * 8.6 + index);
        const radius = (0.54 + (index % 4) * 0.17) * (0.7 + effectAlpha * 0.5);
        billboards.push({
          texture: starTexture,
          position: [
            position[0] + Math.cos(angle) * radius,
            position[1] + 0.54 + pop * 0.88,
            position[2] + Math.sin(angle * 1.16) * (radius * 0.72)
          ],
          size: [
            (0.14 + pop * 0.2) * Math.max(0.12, effectAlpha),
            (0.14 + pop * 0.2) * Math.max(0.12, effectAlpha)
          ],
          uvRect,
          rotation: angle
        });
      }
    }

    return billboards;
  }

  function syncLeafDenModelInstance(deltaTime = 0) {
    const instance = session.leafDenModelInstance;
    if (!instance) {
      return;
    }

    if (session.leafDenPlacementPreviewModelInstance && !session.leafDenKitPlacementPreview?.active) {
      session.leafDenPlacementPreviewModelInstance.active = false;
      session.leafDenPlacementPreviewModelInstance.alpha = 1;
      session.leafDenPlacementPreviewModelInstance.tintStrength = 0;
    }

    if (session.leafDenKitPlacementPreview?.active) {
      return;
    }

    if (
      !session.leafDen?.position ||
      !controls.storyState.flags.leafDenKitPlaced
    ) {
      instance.active = false;
      return;
    }

    const groundY = instance.leafDenGroundY ?? Number(instance.offset?.[1] ?? 0.02);
    const baseScale = instance.leafDenBaseScale ?? Number(instance.scale || 1);
    const baseYaw = instance.leafDenBaseYaw ?? Number(instance.yaw || 0);
    instance.leafDenGroundY = groundY;
    instance.leafDenBaseScale = baseScale;
    instance.leafDenBaseYaw = baseYaw;
    instance.offset = [
      session.leafDen.position[0],
      groundY,
      session.leafDen.position[2]
    ];
    instance.scale = baseScale;
    instance.yaw = baseYaw + getWorkbenchRotationPreviewYaw({
      kind: "house",
      placement: session.leafDen
    });
    instance.alpha = 1;
    instance.tintStrength = 0;
    instance.active = true;
    applyPlayerPlacementSpawnToModelInstance(session.leafDen, instance, {
      baseScale,
      groundY,
      deltaTime
    });
    applyWorkbenchRotationSelectionTint("house", instance);
  }

  function ensurePlayerHouseModelInstances() {
    session.playerHouses ||= [];
    session.playerHouseModelInstances ||= [];
    session.leafDenModelInstances ||= [
      session.leafDenModelInstance,
      session.leafDenPlacementPreviewModelInstance
    ].filter(Boolean);

    while (session.playerHouseModelInstances.length < session.playerHouses.length) {
      const houseIndex = session.playerHouseModelInstances.length;
      const house = session.playerHouses[houseIndex] || {};
      const baseScale =
        session.leafDenModelInstance?.leafDenBaseScale ??
        session.leafDenModelInstance?.scale ??
        1;
      const baseYaw =
        session.leafDenModelInstance?.leafDenBaseYaw ??
        session.leafDenModelInstance?.yaw ??
        0;
      const groundY =
        session.leafDenModelInstance?.leafDenGroundY ??
        session.leafDenModelInstance?.offset?.[1] ??
        0.02;
      const instance = {
        id: `${house.id || `player-house-${houseIndex}`}-model`,
        offset: Array.isArray(house.position) ?
          [house.position[0], groundY, house.position[2]] :
          [0, groundY, 0],
        scale: baseScale,
        yaw: baseYaw + Number(house.yaw || 0),
        active: false,
        leafDenGroundY: groundY,
        leafDenBaseScale: baseScale,
        leafDenBaseYaw: baseYaw
      };
      session.playerHouseModelInstances.push(instance);
      session.leafDenModelInstances.push(instance);
    }

    if (session.playerHouseModelInstances.length > session.playerHouses.length) {
      for (let index = session.playerHouses.length; index < session.playerHouseModelInstances.length; index += 1) {
        session.playerHouseModelInstances[index].active = false;
      }
    }

    return session.playerHouseModelInstances;
  }

  function syncPlayerHouseModelInstances(deltaTime = 0, renderCenter = null) {
    const instances = ensurePlayerHouseModelInstances();

    for (let index = 0; index < instances.length; index += 1) {
      const instance = instances[index];
      const house = session.playerHouses?.[index] || null;
      if (!instance || !Array.isArray(house?.position)) {
        if (instance) {
          instance.active = false;
        }
        continue;
      }

      const isSelectedForRotation =
        workbenchRotationRuntime.getSelection()?.kind === `playerHouse:${house.id}`;
      const hasSpawnEffect = Boolean(house.spawnEffect);
      if (
        !isSelectedForRotation &&
        !hasSpawnEffect &&
        !isWorldPositionWithinRenderDistance(
          house.position,
          renderCenter,
          PLAYER_CONSTRUCTION_MODEL_PREPARE_DISTANCE
        )
      ) {
        instance.active = false;
        continue;
      }

      const groundY = instance.leafDenGroundY ?? Number(instance.offset?.[1] ?? 0.02);
      const baseScale = instance.leafDenBaseScale ?? Number(instance.scale || 1);
      const baseYaw = instance.leafDenBaseYaw ?? Number(instance.yaw || 0);
      instance.leafDenGroundY = groundY;
      instance.leafDenBaseScale = baseScale;
      instance.leafDenBaseYaw = baseYaw;
      instance.offset = [
        house.position[0],
        groundY,
        house.position[2]
      ];
      instance.scale = baseScale;
      instance.yaw = baseYaw + getWorkbenchRotationPreviewYaw({
        kind: `playerHouse:${house.id}`,
        placement: house
      });
      instance.alpha = 1;
      instance.tintStrength = 0;
      instance.active = true;
      applyPlayerPlacementSpawnToModelInstance(house, instance, {
        baseScale,
        groundY,
        deltaTime
      });
      applyWorkbenchRotationSelectionTint(`playerHouse:${house.id}`, instance);
    }
  }

  function updateTrainHouseMusic(nowSeconds = 0) {
    const playerPosition = session.playerCharacter?.getPosition?.() || null;
    const trainHousePosition =
      session.campfire?.position && controls.storyState.flags.campfireSpatOut ?
        session.campfire.position :
        null;
    const nextVolume = resolveTrainHouseMusicVolume({
      playerPosition,
      trainHousePosition
    });

    audio.updateTrainHouseMusic({
      active: nextVolume > 0.002,
      volume: nextVolume
    });
    gameplay.musicRuntime?.reportObjectMusicActivity?.({
      active: nextVolume > 0.002,
      nowSeconds
    });
  }

  function faceInteractionTargetTowardPlayer({
    targetId,
    playerPosition,
    npcActors = [],
    interactables = []
  } = {}) {
    const npcActor = npcActors.find((actor) => actor.id === targetId);
    if (npcActor?.character?.faceToward) {
      const npcPosition = npcActor.character.getPosition();
      npcActor.character.faceToward(playerPosition);
      npcActor.faceYaw = getYawToward(npcPosition, playerPosition);
      return;
    }

    const interactable = interactables.find((entry) => entry.id === targetId);
    if (
      interactable?.id === "squirtle" &&
      session.actTwoSquirtle?.modelInstance &&
      playerPosition
    ) {
      session.actTwoSquirtle.modelInstance.yaw = getSquirtleModelYawToward(
        session.actTwoSquirtle.position,
        playerPosition
      );
    }
  }

  function focusNpcConversationWhenDialogueOpens({
    targetId,
    playerPosition,
    npcActors,
    interactables,
    targetPosition
  }) {
    const focusIfDialogueOpened = () => {
      if (
        !gameplayDialogue.isActive?.() ||
        controls.isScriptedInteractionActive?.()
      ) {
        return;
      }

      dialogueCamera?.focusNpcConversation({
        targetId,
        playerPosition,
        npcActors,
        interactables,
        targetPosition
      });
    };

    if (typeof queueMicrotask === "function") {
      queueMicrotask(focusIfDialogueOpened);
    } else {
      Promise.resolve().then(focusIfDialogueOpened);
    }
  }

  function getBotRevealLandingPosition(encounter) {
    if (!encounter || !Array.isArray(encounter.repairPosition)) {
      return null;
    }

    return [...encounter.repairPosition];
  }

  function getBotRevealOriginPosition(encounter) {
    const boxPosition = getEncounterRepairBoxPosition(encounter);
    const landingPosition = getBotRevealLandingPosition(encounter);
    const originBase = Array.isArray(boxPosition) ? boxPosition : landingPosition;

    if (!originBase) {
      return null;
    }

    return [
      originBase[0],
      originBase[1] + BULBASAUR_REVEAL_BOT_FALL_HEIGHT,
      originBase[2]
    ];
  }

  function revealBotAtRepairPosition(encounter, { falling = false } = {}) {
    const landingPosition = getBotRevealLandingPosition(encounter);

    if (!landingPosition) {
      return false;
    }

    const originPosition = falling ? getBotRevealOriginPosition(encounter) : null;

    encounter.visible = true;
    encounter.jumpTimer = 0;
    encounter.originPosition = originPosition;
    encounter.landingPosition = falling && originPosition ? landingPosition : null;
    encounter.position = originPosition ? [...originPosition] : landingPosition;
    return true;
  }

  function isRevealBoxBotVisible(opening) {
    return Boolean(opening?.botVisible || opening?.bulbasaurVisible);
  }

  function setRevealBoxBotVisible(opening) {
    if (!opening) {
      return;
    }

    opening.botVisible = true;
    opening.bulbasaurVisible = true;
  }

  function updateBotRevealFall(opening, encounter, progress) {
    if (!isRevealBoxBotVisible(opening) || !encounter?.originPosition || !encounter?.landingPosition) {
      return;
    }

    const fallStart = clamp01(
      Number(opening.visibleProgress ?? BULBASAUR_REVEAL_VISIBLE_PROGRESS)
    );
    const fallEnd = clamp01(
      Number(opening.fallEndProgress ?? BULBASAUR_REVEAL_BOT_FALL_END_PROGRESS)
    );
    const fallProgress = clamp01((progress - fallStart) / Math.max(0.001, fallEnd - fallStart));
    const easedProgress = fallProgress * fallProgress;
    const landingBounce = Math.sin(fallProgress * Math.PI) * 0.16;

    encounter.position = [
      encounter.originPosition[0] +
        (encounter.landingPosition[0] - encounter.originPosition[0]) * easedProgress,
      encounter.originPosition[1] +
        (encounter.landingPosition[1] - encounter.originPosition[1]) * easedProgress +
        landingBounce,
      encounter.originPosition[2] +
        (encounter.landingPosition[2] - encounter.originPosition[2]) * easedProgress
    ];

    if (fallProgress >= 1) {
      encounter.position = [...encounter.landingPosition];
      encounter.originPosition = null;
      encounter.landingPosition = null;
    }
  }

  function updateBotRevealBoxOpening(deltaTime, encounter, { syncModelInstance } = {}) {
    const opening = encounter?.revealBoxOpening;

    if (!opening?.active) {
      return false;
    }

    if (!Array.isArray(encounter.repairPosition)) {
      opening.active = false;
      repairBoxRevealFlashRuntime.setOpacity(0);
      return false;
    }

    opening.duration = Number(opening.duration || BULBASAUR_REVEAL_BOX_DURATION);
    opening.elapsed = Math.min(opening.duration, Number(opening.elapsed || 0) + deltaTime);
    const progress = clamp01(opening.elapsed / opening.duration);
    repairBoxRevealFlashRuntime.update({ opening, encounter });
    if (!opening.sfxStarted) {
      playGrowBotRevealSfx();
      opening.sfxStarted = true;
    }

    const visibleProgress = clamp01(
      Number(opening.visibleProgress ?? BULBASAUR_REVEAL_VISIBLE_PROGRESS)
    );

    if (progress >= visibleProgress && !isRevealBoxBotVisible(opening)) {
      revealBotAtRepairPosition(encounter, { falling: true });
      setRevealBoxBotVisible(opening);
      if (opening.hideBoxWhenVisible && encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = false;
      }
    }
    updateBotRevealFall(opening, encounter, progress);

    if (progress >= 1) {
      revealBotAtRepairPosition(encounter);
      if (encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = false;
      }
      opening.active = false;
      const onComplete = opening.onComplete;
      opening.onComplete = null;
      encounter.revealBoxOpening = null;
      repairBoxRevealFlashRuntime.setOpacity(0);
      syncModelInstance?.();
      if (typeof onComplete === "function") {
        onComplete();
      }
      return true;
    }

    syncModelInstance?.();
    return true;
  }

  function updateBulbasaurRevealBoxOpening(deltaTime, encounter) {
    return updateBotRevealBoxOpening(deltaTime, encounter, {
      syncModelInstance: syncBulbasaurModelInstance
    });
  }

  function updateCharmanderRevealBoxOpening(deltaTime, encounter) {
    return updateBotRevealBoxOpening(deltaTime, encounter, {
      syncModelInstance: syncCharmanderModelInstance
    });
  }

  function getWorkbenchRampCollider() {
    return (session.elevatedTerrainColliders || [])
      .find((collider) => collider?.id === BULBASAUR_WORKBENCH_GUIDE_RAMP_COLLIDER_ID) || null;
  }

  function getBulbasaurWorkbenchGuidePath() {
    const rampCollider = getWorkbenchRampCollider();

    if (!rampCollider?.position || !rampCollider?.size) {
      return [[...WORKBENCH_POSITION]];
    }

    const padding = rampCollider.padding ?? 0;
    const halfX = (rampCollider.size[0] || 0) * 0.5 + padding;
    const halfZ = (rampCollider.size[2] || 0) * 0.5 + padding;
    const groundY = WORKBENCH_POSITION[1];
    const approachX =
      rampCollider.position[0] - halfX - BULBASAUR_WORKBENCH_GUIDE_SIDE_APPROACH_MARGIN;
    const approachZ =
      rampCollider.position[2] - halfZ - BULBASAUR_WORKBENCH_GUIDE_RAMP_APPROACH_MARGIN;

    return [
      [approachX, groundY, approachZ],
      [rampCollider.position[0], groundY, approachZ]
    ];
  }

  function isBulbasaurWorkbenchGuideActive() {
    const flags = controls.storyState?.flags || {};
    return Boolean(
      flags.bulbasaurWorkbenchGuideAvailable &&
      !flags.workbenchDiyRecipesReceived &&
      session.bulbasaurEncounter
    );
  }

  function advanceBulbasaurAlongWorkbenchGuide(deltaTime, encounter) {
    const path = getBulbasaurWorkbenchGuidePath();
    const waypointIndex = Math.min(
      Math.max(0, encounter.workbenchGuideWaypointIndex || 0),
      path.length - 1
    );
    const currentPosition =
      encounter.position ||
      encounter.landingPosition ||
      BULBASAUR_WORKBENCH_GUIDE_START;
    const targetPosition = path[waypointIndex];
    const deltaX = targetPosition[0] - currentPosition[0];
    const deltaZ = targetPosition[2] - currentPosition[2];
    const distance = Math.hypot(deltaX, deltaZ);
    const step = BULBASAUR_WORKBENCH_GUIDE_SPEED * deltaTime;

    encounter.visible = true;
    encounter.jumpTimer = 0;
    encounter.originPosition = null;
    encounter.landingPosition = null;

    if (distance <= step || distance <= BULBASAUR_WORKBENCH_GUIDE_WAYPOINT_DISTANCE) {
      encounter.position = [...targetPosition];
      if (waypointIndex < path.length - 1) {
        encounter.workbenchGuideWaypointIndex = waypointIndex + 1;
      }
    } else {
      const progress = step / distance;
      encounter.position = [
        currentPosition[0] + deltaX * progress,
        currentPosition[1] + (targetPosition[1] - currentPosition[1]) * progress,
        currentPosition[2] + deltaZ * progress
      ];
      encounter.workbenchGuideWaypointIndex = waypointIndex;
    }

    if (encounter.modelInstance && distance > 0.001) {
      encounter.modelInstance.yaw = getRobotModelYawToward(
        currentPosition,
        targetPosition,
        BULBASAUR_MODEL_FACE_YAW_OFFSET
      );
    }
  }

  function updateBulbasaurRepairBoxRustle(deltaTime) {
    const rustle = session.bulbasaurEncounter?.repairBoxRustle;

    if (!rustle?.active) {
      return;
    }

    const duration = Math.max(0.001, Number(rustle.duration || 1));
    rustle.elapsed = Math.min(duration, Number(rustle.elapsed || 0) + deltaTime);

    if (rustle.elapsed >= duration) {
      rustle.active = false;
    }
  }

  function updateBulbasaurEncounter(deltaTime) {
    const encounter = session.bulbasaurEncounter;

    if (updateBulbasaurRevealBoxOpening(deltaTime, encounter)) {
      return;
    }

    if (
      controls.storyState?.flags?.bulbasaurRevealed &&
      encounter &&
      !encounter.visible &&
      Array.isArray(encounter.repairPosition)
    ) {
      revealBotAtRepairPosition(encounter);
      if (encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = false;
      }
    }

    if (
      controls.storyState?.flags?.bulbasaurWorkbenchGuideAvailable &&
      !controls.storyState?.flags?.workbenchDiyRecipesReceived &&
      encounter
    ) {
      advanceBulbasaurAlongWorkbenchGuide(deltaTime, encounter);
      syncBulbasaurModelInstance();
      return;
    }

    if (encounter) {
      encounter.workbenchGuideWaypointIndex = 0;
    }

    if (!encounter?.visible || !encounter.position) {
      syncBulbasaurModelInstance();
      return;
    }

    if (encounter.jumpTimer <= 0 || !encounter.originPosition || !encounter.landingPosition) {
      encounter.jumpTimer = 0;
      if (encounter.originPosition && encounter.landingPosition) {
        encounter.position = [...encounter.landingPosition];
        encounter.originPosition = null;
        encounter.landingPosition = null;
      }
      syncBulbasaurModelInstance();
      return;
    }

    encounter.jumpTimer = Math.max(0, encounter.jumpTimer - deltaTime);
    const progress = 1 - encounter.jumpTimer / encounter.jumpDuration;
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const arcHeight = Math.sin(progress * Math.PI) * 0.92;

    encounter.position = [
      encounter.originPosition[0] +
        (encounter.landingPosition[0] - encounter.originPosition[0]) * easedProgress,
      encounter.originPosition[1] +
        (encounter.landingPosition[1] - encounter.originPosition[1]) * progress +
        arcHeight,
      encounter.originPosition[2] +
        (encounter.landingPosition[2] - encounter.originPosition[2]) * easedProgress
    ];
    if (encounter.modelInstance) {
      encounter.modelInstance.yaw = getRobotModelYawToward(
        encounter.position,
        encounter.landingPosition,
        BULBASAUR_MODEL_FACE_YAW_OFFSET
      );
    }
    syncBulbasaurModelInstance();
  }

  function moveConstructionHelperToLeafDen(encounter, {
    offset = [0, 0, 0],
    modelFaceYawOffset = 0,
    nowSeconds = getRuntimeNowSeconds()
  } = {}) {
    if (!encounter || !Array.isArray(session.leafDen?.position)) {
      return false;
    }

    const anchor = session.leafDen.position;
    const squash = Math.sin(nowSeconds * 9 + offset[0] * 3 + offset[2]) * 0.045;
    encounter.visible = true;
    encounter.position = [
      anchor[0] + offset[0] + Math.sin(nowSeconds * 5.5 + offset[2]) * 0.08,
      0.04,
      anchor[2] + offset[2] + Math.cos(nowSeconds * 4.8 + offset[0]) * 0.06
    ];

    if (encounter.modelInstance) {
      encounter.modelInstance.yaw = getRobotModelYawToward(
        encounter.position,
        anchor,
        modelFaceYawOffset
      );
      encounter.modelInstance.scale = Math.max(0.1, Number(encounter.modelInstance.scale || 1) + squash);
    }

    return true;
  }

  function updateCharmanderEncounter(deltaTime, { activeMoveId = null } = {}) {
    const encounter = session.charmanderEncounter;

    if (updateCharmanderRevealBoxOpening(deltaTime, encounter)) {
      return;
    }

    if (!encounter || !controls.storyState?.flags?.charmanderRevealed) {
      return;
    }

    encounter.visible = true;

    if (!encounter.position) {
      encounter.position = session.playerCharacter?.getPosition?.() || [0, 0.02, 0];
    }

    if (isLeafDenConstructionActive()) {
      moveConstructionHelperToLeafDen(encounter, {
        offset: [-1.08, 0, 0.82],
        modelFaceYawOffset: CHARMANDER_MODEL_FACE_YAW_OFFSET
      });
      syncCharmanderModelInstance();
      return;
    }

    if (
      controls.storyState.flags.charmanderFollowing &&
      session.playerCharacter &&
      !session.charmanderFireAction &&
      !isLeafDenConstructionActive()
    ) {
      const formationIndex = getCompanionFollowFormationIndex("charmander", activeMoveId);
      moveGroundCompanionTowardPlayer(encounter, {
        deltaTime,
        speed: CHARMANDER_FOLLOW_SPEED,
        followDistance: resolveCompanionFollowDistance({
          companionId: "charmander",
          activeMoveId,
          defaultDistance: CHARMANDER_FOLLOW_DISTANCE,
          formationIndex
        }),
        modelFaceYawOffset: CHARMANDER_MODEL_FACE_YAW_OFFSET
      });
    } else if (!session.charmanderFireAction) {
      faceIdleBotTowardPlayer(encounter, {
        modelFaceYawOffset: CHARMANDER_MODEL_FACE_YAW_OFFSET
      });
    }

    if (
      session.campfire?.position &&
      (controls.storyState.flags.charmanderFollowing || controls.storyState.flags.charmanderRevealed) &&
      !controls.storyState.flags.charmanderCampfireLit
    ) {
      if (shouldCompleteThermalCabinHomeBeat({
        thermalBotFollowing: controls.storyState.flags.charmanderFollowing,
        thermalBotRegistered: controls.storyState.flags.charmanderRevealed,
        thermalBotPosition: encounter.position,
        playerPosition: session.playerCharacter?.getPosition?.(),
        trainHousePosition: session.campfire.position,
        alreadyComplete: controls.storyState.flags.charmanderCampfireLit
      })) {
        encounter.litCampfire = true;
        controls.storyState.flags.charmanderCampfireLit = true;
        controls.storyState.flags.charmanderFollowing = false;
        controls.onCharmanderCampfireLit?.();
      }
    }

    syncCharmanderModelInstance();
  }

  function updateTimburrEncounter(deltaTime, { activeMoveId = null } = {}) {
    const encounter = session.timburrEncounter;

    if (!encounter || !controls.storyState?.flags?.timburrRevealed) {
      return;
    }

    encounter.visible = true;

    if (!encounter.position) {
      encounter.position = session.playerCharacter?.getPosition?.() || [0, 0.02, 0];
    }

    if (isLeafDenConstructionActive()) {
      moveConstructionHelperToLeafDen(encounter, {
        offset: [1.04, 0, -0.76],
        modelFaceYawOffset: Number(encounter.modelFaceYawOffset ?? TIMBURR_MODEL_FACE_YAW_OFFSET)
      });
      return;
    }

    if (session.timburrBuildBlockAction) {
      return;
    }

    if (
      controls.storyState.flags.timburrFollowing &&
      session.playerCharacter &&
      !isLeafDenConstructionActive()
    ) {
      const formationIndex = getCompanionFollowFormationIndex("timburr", activeMoveId);
      moveGroundCompanionTowardPlayer(encounter, {
        deltaTime,
        speed: TIMBURR_FOLLOW_SPEED,
        followDistance: resolveCompanionFollowDistance({
          companionId: "timburr",
          activeMoveId,
          defaultDistance: TIMBURR_FOLLOW_DISTANCE,
          formationIndex
        }),
        modelFaceYawOffset: Number(encounter.modelFaceYawOffset ?? TIMBURR_MODEL_FACE_YAW_OFFSET)
      });
    }
  }

  function updateRustlingGrassEvent(deltaTime, canAdvance) {
    const flags = controls.storyState?.flags;

    if (
      !canAdvance ||
      !flags?.pendingRustlingGrassCellId ||
      flags.rustlingGrassCellId ||
      flags.bulbasaurRevealed
    ) {
      return;
    }

    const nextDelay = Math.max(0, Number(flags.rustlingGrassDelay || 0) - deltaTime);
    flags.rustlingGrassDelay = nextDelay;

    if (nextDelay > 0) {
      return;
    }

    flags.rustlingGrassCellId = flags.pendingRustlingGrassCellId;
    delete flags.pendingRustlingGrassCellId;
    delete flags.rustlingGrassDelay;
  }

  function updateLeppaTreeDance(now) {
    const leppaTree = session.leppaTree;
    const deadInstance = leppaTree?.deadInstance;

    if (!deadInstance) {
      return;
    }

    if (!leppaTree.revived) {
      deadInstance.swayStrength = 0;
      return;
    }

    deadInstance.swayStrength = Math.sin(now * LEPPA_TREE_DANCE_SPEED) * LEPPA_TREE_DANCE_SWAY;
  }

  function resolveFramePlacementPrompts({
    solarStationPlacementPreview,
    greenhousePlacementPreview,
    campfirePlacementPreview,
    leafDenKitPlacementPreview,
    inputModalityState
  }) {
    const solarStationPlacementPreviewLabel = getColonyFeedbackPlacementLabel(
      COLONY_FEEDBACK_IDS.SOLAR_STATION_PLACEMENT_VALID
    );
    const houseKitPlacementPreviewLabel = getColonyFeedbackPlacementLabel(
      COLONY_FEEDBACK_IDS.HOUSE_KIT_PLACEMENT_VALID
    );
    const houseKitNeedsPowerPreviewLabel = getColonyFeedbackPlacementLabel(
      COLONY_FEEDBACK_IDS.HOUSE_KIT_PLACEMENT_NEEDS_POWER_RADIUS
    );
    const placementBlockedPreviewLabel = getColonyFeedbackPlacementLabel(
      COLONY_FEEDBACK_IDS.PLACEMENT_BLOCKED_BY_OBJECTS
    );
    const solarStationPlacementPrompt = solarStationPlacementPreview ?
      (
        solarStationPlacementPreview.valid ?
          resolvePlacementPreviewPrompt(solarStationPlacementPreviewLabel, inputModalityState) :
          resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
            includePlace: false
          })
      ) :
      "";
    const campfirePlacementPrompt = campfirePlacementPreview ?
      (
        campfirePlacementPreview.valid ?
          resolvePlacementPreviewPrompt(`Move the ${SANDBOTS_ITEM_NAMES.thermalCabin} preview`, inputModalityState) :
          resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
            includePlace: false
          })
      ) :
      "";
    const greenhousePlacementPrompt = greenhousePlacementPreview ?
      (
        greenhousePlacementPreview.valid ?
          resolvePlacementPreviewPrompt("Move the Greenhouse preview", inputModalityState) :
          resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
            includePlace: false
          })
      ) :
      "";
    const leafDenKitPlacementPrompt = leafDenKitPlacementPreview ?
      (
        leafDenKitPlacementPreview.valid ?
          resolvePlacementPreviewPrompt(houseKitPlacementPreviewLabel, inputModalityState) :
          leafDenKitPlacementPreview.invalidReason === "outside-solar-station-radius" ?
            resolvePlacementPreviewPrompt(houseKitNeedsPowerPreviewLabel, inputModalityState, {
              includePlace: false
            }) :
            resolvePlacementPreviewPrompt(placementBlockedPreviewLabel, inputModalityState, {
              includePlace: false
            })
      ) :
      "";

    return {
      solarStationPlacementPrompt,
      greenhousePlacementPrompt,
      campfirePlacementPrompt,
      leafDenKitPlacementPrompt
    };
  }

  function readGameLoopFlowState() {
    const tutorialActive = isGameFlow(gameFlowValues.TUTORIAL);

    return {
      gameplayActive: isGameFlow(gameFlowValues.GAMEPLAY),
      cinematicActive: isGameFlow(gameFlowValues.CINEMATIC),
      introActive: isGameFlow(gameFlowValues.INTRO),
      tutorialActive,
      tutorialMovementLocked: tutorialActive ? actTwoTutorial.isMovementLocked() : false,
      pokedexModalOpen: pokedexUiState.open,
      dialogueActive: gameplayDialogue.isActive(),
      skillLearnActive: Boolean(controls.isSkillLearnActive?.()),
      scriptedInteractionActive: Boolean(controls.isScriptedInteractionActive?.()),
      tutorialCameraFocus: tutorialActive ? actTwoTutorial.getCameraFocusTarget() : null
    };
  }

  function beginGameplayFrameContext({ now, deltaTime, flowState }) {
    const gameplayOpeningFrameStart = gameplayOpeningRuntime.beginFrame({
      now,
      deltaTime,
      gameplayActive: flowState.gameplayActive
    });
    const gameplayOpeningCameraLocked = gameplayOpeningRuntime.isCameraLocked();
    const gameplayOpeningMovementLocked = gameplayOpeningRuntime.isMovementLocked();
    const placementPreviewActive = hasActivePlacementPreview(
      session,
      PLACEMENT_CONTRACTS
    );
    placementCameraAssist.update({ placementActive: placementPreviewActive });
    const foundationBuildZoneCameraFocusActive = updateFoundationBuildZoneCameraFocus(now);

    return {
      gameplayOpeningCameraFrame: gameplayOpeningFrameStart.cameraFrame,
      gameplayOpeningCameraLocked,
      gameplayOpeningMovementLocked,
      placementPreviewActive,
      foundationBuildZoneCameraFocusActive,
      ...resolveGameLoopBlockers({
        gameplayOpeningMovementLocked,
        foundationBuildZoneCameraFocusActive,
        placementPreviewActive,
        flowState
      })
    };
  }

  function updateCameraDebugFrameOverlay({
    now,
    flowState,
    movementBlocked,
    gameplayOpeningMovementLocked,
    cameraTransitionActive
  }) {
    if (!CAMERA_DEBUG_ENABLED) {
      return;
    }

    cameraDebugRuntime.update({
      frame: Math.round(now),
      flow: {
        gameplay: flowState.gameplayActive,
        cinematic: flowState.cinematicActive,
        intro: flowState.introActive,
        tutorial: flowState.tutorialActive
      },
      blockers: {
        movementBlocked,
        tutorialMovementLocked: flowState.tutorialMovementLocked,
        pokedexModalOpen: flowState.pokedexModalOpen,
        dialogueActive: flowState.dialogueActive,
        skillLearnActive: flowState.skillLearnActive,
        scriptedInteractionActive: flowState.scriptedInteractionActive,
        paused: Boolean(controls.isPaused?.())
      },
      camera: {
        ...gameplayCameraDirector.getState(now),
        openingCameraActiveForInput: gameplayOpeningMovementLocked,
        transitionActive: cameraTransitionActive,
        pose: camera.getPose?.() || null
      },
      quest: {
        system: gameplay.getActiveSystemQuest?.()?.id || null,
        ui: gameplay.getActiveQuest?.(controls.storyState)?.id || null
      },
      player: session.playerCharacter?.getPosition?.() || null,
      ship: session.gameplayOpeningShip?.visible ?
        session.gameplayOpeningShip.position :
        null
    });
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

    camera.resizeCanvases();
    camera.update(deltaTime);
    clearInteractionObjectHighlights(session);
    syncWorkbenchInteractable();
    syncPokemonCenterWorkshopVisualState();

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
    } = beginGameplayFrameContext({
      now,
      deltaTime,
      flowState: frameFlowState
    });

    gameplayInputRuntime.update({
      now,
      deltaTime,
      gameplayActive: frameFlowState.gameplayActive,
      cinematicActive,
      movementBlocked,
      placementActive: placementPreviewActive,
      dialogueActive,
      tutorialActive,
      skillLearnActive,
      scriptedInteractionActive
    });
    inputModalityPanelController.update(getCurrentInputModalityState());
    const cameraTransitionActive = camera.isTargetTransitionActive();

    updateCameraDebugFrameOverlay({
      now,
      flowState: frameFlowState,
      movementBlocked,
      gameplayOpeningMovementLocked,
      cameraTransitionActive
    });

    processWorldCellPlannerClick();

    if (
      introActive &&
      updateIntroRoomFrame({
        introRoomScene: session.introRoomScene,
        camera,
        worldCanvas,
        frame: nextFrame,
        deltaTime
      })
    ) {
      frameRuntime.commitFrame();
      requestAnimationFrame(frame);
      return;
    }

    if (shouldClearPendingActions) {
      controls.clearPendingActions();
    }

    if (shouldClearMovementInput) {
      controls.clearMovementInput();
    }

    updateRustlingGrassEvent(deltaTime, canAdvanceRustlingGrass);

    const {
      canRotateCamera,
      canCycleCameraZoom
    } = resolveCameraInputPermissions({
      hasPlayerCharacter: Boolean(session.playerCharacter),
      gameplayOpeningCameraLocked,
      foundationBuildZoneCameraFocusActive,
      builderPanelOpen: controls.isBuilderPanelOpen(),
      placementPreviewActive,
      tutorialAllowsCameraLook: actTwoTutorial.allowsCameraLook(),
      flowState: frameFlowState
    });

    while (controls.consumeCameraZoomCycleRequest?.()) {
      if (canCycleCameraZoom) {
        cameraZoomPresetController.cycle();
        playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE);
      }
    }

    const cameraTurnDirection =
      (controls.cameraTurnKeys.has("ArrowRight") ? 1 : 0) -
      (controls.cameraTurnKeys.has("ArrowLeft") ? 1 : 0);
    const cameraLookDelta = controls.consumeCameraLookDelta?.() || { yaw: 0, pitch: 0 };
    const keyboardCameraYaw = cameraTurnDirection * deltaTime * cameraOrbit.turnSpeed;
    const hasCameraLookInput =
      keyboardCameraYaw !== 0 ||
      Math.abs(cameraLookDelta.yaw) > 0.0001 ||
      Math.abs(cameraLookDelta.pitch) > 0.0001;

    if (canRotateCamera && hasCameraLookInput) {
      cameraOrbit.rotate(keyboardCameraYaw + cameraLookDelta.yaw, cameraLookDelta.pitch);
      if (tutorialActive) {
        actTwoTutorial.registerCameraLook();
      }
    } else if (!canRotateCamera) {
      controls.clearCameraLookInput?.();
    }

    // Placement and player movement.
    const placementRotationRequest = controls.consumePlacementRotationRequest?.() || 0;
    if (placementRotationRequest) {
      const rotatedPreview = rotateActivePlacementPreview(placementRotationRequest);
      if (!rotatedPreview) {
        rotateNearbyWorkbenchConstruction(placementRotationRequest);
      }
    }

    const shouldConsumePlacementCancel = Boolean(
      workbenchRotationRuntime.getSelection() ||
      hasActivePlacementPreview(session, PLACEMENT_CONTRACTS) ||
      hasPendingWorkbenchPlacementIntent(session)
    );
    let placementCancelRequested = false;
    if (shouldConsumePlacementCancel) {
      placementCancelRequested = typeof controls.consumePlacementCancelRequest === "function" ?
        controls.consumePlacementCancelRequest() :
        controls.consumeJumpRequest?.() || false;
    }
    if (
  placementCancelRequested &&
  workbenchRotationRuntime.getSelection()
) {
  clearWorkbenchConstructionRotationSelection();
} else if (
  placementCancelRequested &&
  hasActivePlacementPreview(session, PLACEMENT_CONTRACTS)
) {
  cancelActivePlacementPreviews();
} else if (placementCancelRequested) {
  cancelPendingWorkbenchPlacementIntentWithNotice();
}

if (!shouldConsumePlacementCancel && (movementBlocked || !session.playerCharacter)) {
  controls.consumeFreeBlockBuildRequest?.();
  controls.consumeJumpRequest?.();
}

    if (
      !shouldConsumePlacementCancel &&
      !movementBlocked &&
      session.playerCharacter &&
      controls.consumeFreeBlockBuildRequest?.()
    ) {
      if (isBuildBlockFieldMoveEquipped()) {
        const buildRequestResult = startTimburrBuildBlockAction({
          playerPosition: session.playerCharacter.getPosition()
        });
        if (buildRequestResult === "invalid") {
          playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
          hud?.pushNotice?.(getFreeBlockInvalidPlacementNotice(session.lastTimburrBuildBlockInvalidReason));
        } else if (buildRequestResult === "missing-material") {
          playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
          hud?.pushNotice?.("Need Wood");
        }
      } else {
        playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
      }
    }

    let solarStationPlacementPreview = updateSolarStationPlacementPreview(now * 0.001);
    let greenhousePlacementPreview = updateGreenhousePlacementPreview(now * 0.001);
    let campfirePlacementPreview = updateCampfirePlacementPreview(now * 0.001);
    let leafDenKitPlacementPreview = updateLeafDenKitPlacementPreview(now * 0.001);
    updateSolarStationSpawnEffect(deltaTime);
    syncSolarStationWorkbenchRotationVisual(now * 0.001);
    let playerMovedThisFrame = false;
    const canUpdatePlayerMovement = resolvePlayerMovementPermission({
      hasPlayerCharacter: Boolean(session.playerCharacter),
      foundationBuildZoneCameraFocusActive,
      flowState: frameFlowState
    });

    if (canUpdatePlayerMovement) {
      const previousPlayerPosition = session.playerCharacter.getPosition();
      session.playerCharacter.update(deltaTime);
      if (session.playerCharacter.consumeJumpStarted?.()) {
        startPlayerJumpFlip();
      }
      const nextPlayerPosition = session.playerCharacter.getPosition();
      const movedDistance = Math.hypot(
        nextPlayerPosition[0] - previousPlayerPosition[0],
        nextPlayerPosition[2] - previousPlayerPosition[2]
      );
      playerMovedThisFrame = movedDistance > 0.0005;
      if (
        playerMovedThisFrame &&
        !gameplayOpeningMovementLocked &&
        !tutorialActive &&
        gameplay.getActiveSystemQuest?.()?.id === "learn-to-move" &&
        !controls.isRunActive?.()
      ) {
        runBreadcrumbPromptRuntime.trigger(now);
      }
      companionFollowDirectionRuntime.update(
        nextPlayerPosition[0] - previousPlayerPosition[0],
        nextPlayerPosition[2] - previousPlayerPosition[2]
      );
      syncPlayerModelInstance(deltaTime, [
        nextPlayerPosition[0] - previousPlayerPosition[0],
        nextPlayerPosition[2] - previousPlayerPosition[2]
      ]);

      if (
        movedDistance > 0.0005 &&
        !tutorialActive &&
        !gameplayOpeningCameraLocked &&
        !foundationBuildZoneCameraFocusActive
      ) {
        restoreActiveZoomPresetOnMovement(nextPlayerPosition);
      }

      movementQuestRuntime.update({
        active: () => gameplay.getActiveSystemQuest?.()?.id === "learn-to-move",
        movedDistance,
        reportMovement: () => gameplay.recordQuestEvent?.({
          type: "MOVE",
          targetId: "player"
        })
      });
    } else {
      syncPlayerModelInstance(deltaTime);
    }

    updatePlayerDustParticles(session.playerDust, {
      deltaTime,
      playerPosition: session.playerCharacter?.getPosition?.() || null,
      active: canUpdatePlayerMovement
    });
    updateNatureRevivalEffects(session.natureRevivalEffects, deltaTime);
    treeRevivalLeafBurstRuntime.update(deltaTime);
    woodCollectPopRuntime.update(deltaTime);
    gearPickupParticleRuntime.update(deltaTime);

    // Gameplay actions and simulation.
    const activeMoveId = controls.getActiveMoveId?.() || null;
    const firstTaughtActionFreedomWindow = syncFirstTaughtActionFreedomWindow(
      controls.storyState,
      { now }
    );
    const waterGunEquipped = Boolean(
      controls.playerSkills?.waterGun &&
      activeMoveId === "waterGun"
    );
    const bulbasaurWorkbenchGuideActive = isBulbasaurWorkbenchGuideActive();
    const leafageEquipped = Boolean(
      controls.playerSkills?.leafage &&
      activeMoveId === "leafage" &&
      !bulbasaurWorkbenchGuideActive
    );
    const fireEquipped = Boolean(
      controls.playerSkills?.fire &&
      activeMoveId === "fire"
    );
    const buildBlockEquipped = Boolean(
      isBuildBlockFieldMoveEquipped()
    );
    const freeBlockPreviewTarget = syncFreeBlockBuildPreview({
      active: Boolean(
        buildBlockEquipped &&
        session.playerCharacter &&
        !cinematicActive &&
        !gameplayOpeningMovementLocked &&
        !foundationBuildZoneCameraFocusActive &&
        !tutorialActive &&
        !pokedexModalOpen &&
        !skillLearnActive &&
        !scriptedInteractionActive &&
        !dialogueActive
      ),
      playerPosition: session.playerCharacter?.getPosition?.(),
      nowSeconds: now * 0.001
    });
    buildBlockDebugOverlay.update(freeBlockPreviewTarget?.debug || null);
    const isWaterGunTreeTarget = (target) => Boolean(
      waterGunEquipped &&
      target?.palm
    );

    function performHarvestAction(playerPosition, options = {}) {
      const previousWateredTreeCount = Number(controls.storyState.flags.wateredTreeCount || 0);
      const previousRestoredGrassCount = Number(controls.storyState.flags.restoredGrassCount || 0);
      const previousSupplyCounts = getSupplyCounterSnapshot(controls.inventory);
      const result = performGameplayHarvestAction({
        playerPosition,
        palmModel: session.palmModel,
        palmInstances: session.palmInstances,
        resourceNodes: session.resourceNodes,
        leppaTree: session.leppaTree,
        inventory: controls.inventory,
        canPurifyGround: waterGunEquipped,
        groundDeadInstances: session.groundDeadInstances,
        iceGroundInstances: session.iceGroundInstances,
        groundFlowerPatches: session.groundFlowerPatches,
        groundGrassPatches: session.groundGrassPatches,
        groundPurifiedInstances: session.groundPurifiedInstances,
        storyState: controls.storyState,
        leafDen: session.leafDen,
        woodDrops: session.woodDrops,
        leppaBerryDrops: session.leppaBerryDrops,
        canUseLeafage: leafageEquipped && options.allowLeafage !== false,
        canUseFire: fireEquipped && options.allowFire !== false,
        useWaterGun: Boolean(options.useWaterGun),
        useFire: Boolean(options.useFire),
        forcedHarvestTarget: options.forcedHarvestTarget || null,
        allowPlacement: options.allowPlacement !== false
      }, {
        actionType: options.useWaterGun ? "waterGun" : options.useFire ? "fire" : options.useLeafage ? "leafage" : "harvest"
      });

      const nextWateredTreeCount = Number(controls.storyState.flags.wateredTreeCount || 0);
      const nextRestoredGrassCount = Number(controls.storyState.flags.restoredGrassCount || 0);
      if (
        result &&
        options.useWaterGun &&
        nextRestoredGrassCount > previousRestoredGrassCount
      ) {
        playerCounterPromptRuntime.triggerQuestCounter({
          count: nextRestoredGrassCount,
          total: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
          label: "dry grass",
          now
        });
      } else if (
        result &&
        options.useWaterGun &&
        nextWateredTreeCount > previousWateredTreeCount
      ) {
        playTreeBirthSfx();
        playerCounterPromptRuntime.triggerQuestCounter({
          count: nextWateredTreeCount,
          total: 5,
          label: "trees",
          now
        });
      } else if (result) {
        queueChangedSupplyPickupFlyItems(previousSupplyCounts, controls.inventory);
        triggerChangedSupplyCounterPrompt(previousSupplyCounts, controls.inventory, now);
      }

      if (result && options.useWaterGun) {
        recordSquirtleWaterGunUse();
      }

      if (result && options.useFire && options.forcedHarvestTarget?.fireGroundCell) {
        groundActionFeedbackRuntime.triggerFeedback(options.forcedHarvestTarget.fireGroundCell, "fire", now);
      }

      return result;
    }

    const harvestRequest = controls.consumeHarvestRequest();
    const harvestRequested = Boolean(harvestRequest);
    const harvestRequestSource = typeof harvestRequest === "object" && harvestRequest !== null ?
      harvestRequest.source :
      null;
    const gamepadPrimaryMoveRequested = harvestRequestSource === "gamepadPrimary";
    const leafagePrimaryMoveRequested =
      harvestRequestSource === "gamepadPrimary" ||
      harvestRequestSource === "gamepadBag";

    if (
      harvestRequested &&
      session.playerCharacter &&
      !cinematicActive &&
      !tutorialActive &&
      !skillLearnActive &&
      !scriptedInteractionActive
    ) {
      playSoundEvent(SOUND_EVENT_IDS.UI_CONFIRM);
      const playerPosition = session.playerCharacter.getPosition();
      const primaryActionTarget = gameplay.findNearbyActionTarget({
        playerPosition,
        palmModel: session.palmModel,
        palmInstances: session.palmInstances,
        resourceNodes: session.resourceNodes,
        leppaTree: session.leppaTree,
        leafDen: session.leafDen,
        storyState: controls.storyState,
        inventory: controls.inventory,
        groundDeadInstances: session.groundDeadInstances,
        iceGroundInstances: session.iceGroundInstances,
        groundPurifiedInstances: session.groundPurifiedInstances,
        groundGrassPatches: session.groundGrassPatches,
        groundFlowerPatches: session.groundFlowerPatches,
        canPurifyGround: waterGunEquipped,
        canUseLeafage: leafageEquipped && leafagePrimaryMoveRequested,
        canUseFire: fireEquipped,
        allowPlacement: !gamepadPrimaryMoveRequested && !buildBlockEquipped
      });
      const primaryActionPlacementTarget = Boolean(
        primaryActionTarget?.logChairPlacement ||
        primaryActionTarget?.greenhousePlacement ||
        primaryActionTarget?.campfirePlacement ||
        primaryActionTarget?.strawBedPlacement ||
        primaryActionTarget?.leafDenKitPlacement ||
        primaryActionTarget?.leafDenFurniturePlacement ||
        primaryActionTarget?.dittoFlagPlacement
      );
      const primaryActionCanUseFieldMove = Boolean(
        waterGunEquipped ||
        leafageEquipped ||
        fireEquipped ||
        buildBlockEquipped
      );
      const primaryActionWantsFieldMove =
        primaryActionCanUseFieldMove &&
        (
          harvestRequestSource === "gamepadPrimary" ||
          harvestRequestSource === "keyboardPrimary" ||
          (
            harvestRequestSource === "gamepadBag" &&
            leafageEquipped &&
            primaryActionTarget?.leafageGroundCell
          )
        );
      if (
        primaryActionWantsFieldMove &&
        groundActionFeedbackRuntime.isPulseSource(harvestRequestSource)
      ) {
        groundActionFeedbackRuntime.triggerPulse(activeMoveId, now);
      }
      const primaryActionIsPlacement =
        primaryActionPlacementTarget && !gamepadPrimaryMoveRequested && !buildBlockEquipped;
      const primaryActionPlacementBlocked =
        primaryActionPlacementTarget && (gamepadPrimaryMoveRequested || buildBlockEquipped);
      const primaryActionIsMove = Boolean(
        (buildBlockEquipped && primaryActionWantsFieldMove) ||
        (waterGunEquipped && primaryActionTarget?.groundCell) ||
        isWaterGunTreeTarget(primaryActionTarget) ||
        (leafageEquipped && leafagePrimaryMoveRequested && primaryActionTarget?.leafageGroundCell) ||
        (fireEquipped && primaryActionTarget?.fireGroundCell)
      );
      const leafageAutoWaterGunTarget =
        leafageEquipped &&
        leafagePrimaryMoveRequested &&
        primaryActionWantsFieldMove &&
        controls.playerSkills?.waterGun &&
        !primaryActionPlacementTarget &&
        !primaryActionTarget?.leafageGroundCell ?
          gameplay.findNearbyActionTarget({
            playerPosition,
            palmModel: session.palmModel,
            palmInstances: session.palmInstances,
            resourceNodes: session.resourceNodes,
            leppaTree: session.leppaTree,
            leafDen: session.leafDen,
            storyState: controls.storyState,
            inventory: controls.inventory,
            groundDeadInstances: session.groundDeadInstances,
            iceGroundInstances: session.iceGroundInstances,
            groundPurifiedInstances: session.groundPurifiedInstances,
            groundGrassPatches: session.groundGrassPatches,
            groundFlowerPatches: session.groundFlowerPatches,
            canPurifyGround: true,
            canUseLeafage: false,
            canUseFire: false,
            allowPlacement: false
          }) :
          null;
      const leafageAutoGrowTarget =
        waterGunEquipped &&
        controls.playerSkills?.leafage &&
        primaryActionWantsFieldMove &&
        !primaryActionPlacementTarget &&
        !primaryActionTarget?.palm &&
        !primaryActionTarget?.resourceNode &&
        !primaryActionTarget?.leppaTree &&
        !primaryActionTarget?.groundCell &&
        !primaryActionTarget?.leafageGroundCell ?
          gameplay.findNearbyActionTarget({
            playerPosition,
            palmModel: session.palmModel,
            palmInstances: session.palmInstances,
            resourceNodes: session.resourceNodes,
            leppaTree: session.leppaTree,
            leafDen: session.leafDen,
            storyState: controls.storyState,
            inventory: controls.inventory,
            groundDeadInstances: session.groundDeadInstances,
            iceGroundInstances: session.iceGroundInstances,
            groundPurifiedInstances: session.groundPurifiedInstances,
            groundGrassPatches: session.groundGrassPatches,
            groundFlowerPatches: session.groundFlowerPatches,
            canPurifyGround: false,
            canUseLeafage: true,
            canUseFire: false,
            allowPlacement: false
          }) :
          null;
      const primaryActionInvalidLeafageUse = Boolean(
        leafageEquipped &&
        leafagePrimaryMoveRequested &&
        primaryActionWantsFieldMove &&
        !primaryActionPlacementTarget &&
        !primaryActionTarget?.leafageGroundCell &&
        !leafageAutoWaterGunTarget?.groundCell
      );
      const primaryActionInvalidFireUse = Boolean(
        fireEquipped &&
        primaryActionWantsFieldMove &&
        !primaryActionPlacementTarget &&
        !primaryActionTarget?.fireGroundCell
      );
      const primaryActionAlreadyResolvedGroundCell =
        primaryActionWantsFieldMove &&
        !primaryActionPlacementTarget &&
        !primaryActionIsMove &&
        !leafageAutoWaterGunTarget?.groundCell &&
        !leafageAutoGrowTarget?.leafageGroundCell ?
          findAlreadyResolvedFieldMoveGroundCell(playerPosition, {
            waterGunEquipped,
            leafageEquipped: leafageEquipped && leafagePrimaryMoveRequested,
            fireEquipped
          }) :
          null;
      const primaryActionRepeatedFieldMove = Boolean(primaryActionAlreadyResolvedGroundCell);
      const primaryInteractTarget =
        !dialogueActive &&
        !primaryActionWantsFieldMove &&
        !primaryActionIsPlacement &&
        !primaryActionIsMove &&
        !leafageAutoWaterGunTarget?.groundCell &&
        !leafageAutoGrowTarget?.leafageGroundCell &&
        !primaryActionRepeatedFieldMove &&
        !primaryActionInvalidLeafageUse &&
        !primaryActionInvalidFireUse ?
          gameplay.findNearbyInteractable(
            playerPosition,
            session.npcActors,
            session.interactables,
            controls.storyState,
            session.groundGrassPatches || [],
            session.logChair,
            session.leafDen,
            session.timburrEncounter,
            session.charmanderEncounter,
            session.leppaTree,
            session.bulbasaurEncounter,
            session.groundFlowerPatches || []
          ) :
          null;
      const primaryInteractTargetIsWorkbench = primaryInteractTarget?.target?.id === "workbench";
      const primaryActionConfirmsRotation =
        !primaryInteractTargetIsWorkbench &&
        Boolean(getSelectedRotatableWorkbenchPlacement());
      const primaryActionPlacementCanYieldToRotation = Boolean(
        !primaryActionPlacementTarget ||
        primaryActionTarget?.leafDenKitPlacement ||
        primaryActionTarget?.leafDenFurniturePlacement ||
        primaryActionTarget?.dittoFlagPlacement
      );
      const primaryActionRotationTarget =
        !primaryInteractTargetIsWorkbench &&
        !primaryActionConfirmsRotation &&
        !dialogueActive &&
        primaryActionPlacementCanYieldToRotation &&
        !primaryActionIsMove &&
        !leafageAutoWaterGunTarget?.groundCell &&
        !leafageAutoGrowTarget?.leafageGroundCell ?
          getNearestRotatableWorkbenchPlacement() :
          null;
      const primaryActionBagDestroyTarget =
        harvestRequestSource === "gamepadBag" &&
        !dialogueActive ?
          findNearbyDestroyableInstantiatedObject(
            playerPosition,
            session.groundGrassPatches || [],
            controls.storyState,
            session.groundFlowerPatches || [],
            { includeRestoredGrass: true }
          ) :
          null;
      const primaryActionIsBagHarvest = Boolean(
        harvestRequestSource === "gamepadBag" &&
        (
          primaryActionTarget?.palm ||
          primaryActionTarget?.resourceNode
        )
      );
      if (
        waterGunEquipped &&
        (
          harvestRequestSource === "gamepadPrimary" ||
          harvestRequestSource === "keyboardPrimary"
        )
      ) {
        controls.storyState.flags[WATER_GUN_FIRST_USE_PROMPT_FLAG] = true;
      }

      if (primaryActionConfirmsRotation) {
        confirmWorkbenchConstructionRotationSelection();
      } else if (primaryActionRotationTarget) {
        selectWorkbenchConstructionForRotation(primaryActionRotationTarget);
      } else if (primaryActionBagDestroyTarget?.target) {
        performGameplayDestroyAction({
          playerPosition,
          npcActors: session.npcActors,
          interactables: session.interactables,
          storyState: controls.storyState,
          inventory: controls.inventory,
          woodDrops: session.woodDrops,
          groundGrassPatches: session.groundGrassPatches,
          groundFlowerPatches: session.groundFlowerPatches,
          groundPurifiedInstances: session.groundPurifiedInstances,
          logChair: session.logChair,
          leafDen: session.leafDen,
          leppaTree: session.leppaTree,
          leppaBerryDrops: session.leppaBerryDrops,
          timburrEncounter: session.timburrEncounter,
          charmanderEncounter: session.charmanderEncounter,
          bulbasaurEncounter: session.bulbasaurEncounter
        });
      } else if (leafageAutoWaterGunTarget?.groundCell) {
        fieldMoveInvalidTargetPromptRuntime.resetLeafage();
        controls.setActiveMoveId?.("waterGun");
        controls.storyState.flags[WATER_GUN_FIRST_USE_PROMPT_FLAG] = true;
        const squirtleWaterGunResult = startSquirtleWaterGunAction({
          groundCell: leafageAutoWaterGunTarget.groundCell,
          playerPosition
        });

        if (squirtleWaterGunResult === "unavailable") {
          triggerWaterGunSfxBurst();
          performHarvestAction(playerPosition, {
            useWaterGun: true,
            forcedHarvestTarget: leafageAutoWaterGunTarget
          });
        }
      } else if (leafageAutoGrowTarget?.leafageGroundCell) {
        fieldMoveInvalidTargetPromptRuntime.resetLeafage();
        controls.setActiveMoveId?.("leafage");
        const bulbasaurLeafageResult = startBulbasaurLeafageAction({
          groundCell: leafageAutoGrowTarget.leafageGroundCell,
          playerPosition
        });

        if (bulbasaurLeafageResult === "unavailable") {
          performHarvestAction(playerPosition, {
            useLeafage: true,
            forcedHarvestTarget: leafageAutoGrowTarget
          });
        }
      } else if (primaryActionRepeatedFieldMove) {
        playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
        groundActionFeedbackRuntime.triggerInvalid(primaryActionAlreadyResolvedGroundCell, now);
      } else if (primaryActionInvalidLeafageUse) {
        playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
        fieldMoveInvalidTargetPromptRuntime.triggerLeafage(now);
      } else if (primaryActionInvalidFireUse) {
        playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
        fieldMoveInvalidTargetPromptRuntime.triggerFire(now);
      } else if (primaryActionPlacementBlocked) {
        playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
        // The trigger is reserved for the selected move. Placements use their own place controls.
      } else if (primaryActionIsPlacement) {
        performHarvestAction(playerPosition, {
          allowLeafage: false
        });
      } else if (primaryActionIsBagHarvest) {
        performHarvestAction(playerPosition, {
          allowLeafage: false,
          allowFire: false,
          allowPlacement: false,
          forcedHarvestTarget: primaryActionTarget
        });
      } else if (primaryActionIsMove && !dialogueActive) {
        if (buildBlockEquipped && primaryActionWantsFieldMove) {
          const timburrBuildBlockResult = startTimburrBuildBlockAction({
            playerPosition
          });

          if (timburrBuildBlockResult === "locked") {
            playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
            hud?.pushNotice?.(`${SANDBOTS_BOT_NAMES.builder} has not learned Build yet.`);
          } else if (timburrBuildBlockResult === "unavailable") {
            playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
            hud?.pushNotice?.(`${SANDBOTS_BOT_NAMES.builder} needs to be nearby.`);
          } else if (timburrBuildBlockResult === "invalid") {
            playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
            hud?.pushNotice?.(getFreeBlockInvalidPlacementNotice(session.lastTimburrBuildBlockInvalidReason));
          } else if (timburrBuildBlockResult === "missing-material") {
            playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
            hud?.pushNotice?.("Need Wood");
          } else if (timburrBuildBlockResult === "busy") {
            playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL);
          }
        } else if (waterGunEquipped && primaryActionTarget?.groundCell) {
          const squirtleWaterGunResult = startSquirtleWaterGunAction({
            groundCell: primaryActionTarget.groundCell,
            playerPosition
          });

          if (squirtleWaterGunResult === "unavailable") {
            triggerWaterGunSfxBurst();
            performHarvestAction(playerPosition, {
              useWaterGun: true,
              forcedHarvestTarget: primaryActionTarget
            });
          }
        } else if (isWaterGunTreeTarget(primaryActionTarget)) {
          if (consumeSquirtleWaterStaminaForInstantAction()) {
            triggerWaterGunSfxBurst();
            performHarvestAction(playerPosition, {
              useWaterGun: true,
              forcedHarvestTarget: primaryActionTarget
            });
          }
        } else if (leafageEquipped && leafagePrimaryMoveRequested && primaryActionTarget?.leafageGroundCell) {
          fieldMoveInvalidTargetPromptRuntime.resetLeafage();
          const bulbasaurLeafageResult = startBulbasaurLeafageAction({
            groundCell: primaryActionTarget.leafageGroundCell,
            playerPosition
          });

          if (bulbasaurLeafageResult === "unavailable") {
            performHarvestAction(playerPosition, {
              useLeafage: true,
              forcedHarvestTarget: primaryActionTarget
            });
          }
        } else if (fireEquipped && primaryActionTarget?.fireGroundCell) {
          fieldMoveInvalidTargetPromptRuntime.resetFire();
          const charmanderFireResult = startCharmanderFireAction({
            groundCell: primaryActionTarget.fireGroundCell,
            playerPosition
          });

          if (charmanderFireResult === "unavailable") {
            performHarvestAction(playerPosition, {
              useFire: true,
              forcedHarvestTarget: primaryActionTarget
            });
          }
        }
      } else if (isLeafDenBusyCompanionTarget(primaryInteractTarget?.target)) {
        hud?.pushNotice?.(LEAF_DEN_BUSY_NOTICE);
      } else if (primaryInteractTarget?.target) {
        performGameplayInteractAction({
          playerPosition,
          npcActors: session.npcActors,
          interactables: session.interactables,
          storyState: controls.storyState,
          inventory: controls.inventory,
          woodDrops: session.woodDrops,
          groundGrassPatches: session.groundGrassPatches,
          groundFlowerPatches: session.groundFlowerPatches,
          groundPurifiedInstances: session.groundPurifiedInstances,
          logChair: session.logChair,
          leafDen: session.leafDen,
          leppaTree: session.leppaTree,
          leppaBerryDrops: session.leppaBerryDrops,
          timburrEncounter: session.timburrEncounter,
          charmanderEncounter: session.charmanderEncounter,
          bulbasaurEncounter: session.bulbasaurEncounter,
          onNpcInteractionStart({
            targetId,
            playerPosition,
            npcActors,
            interactables,
            targetPosition
          }) {
            faceInteractionTargetTowardPlayer({
              targetId,
              playerPosition,
              npcActors,
              interactables
            });
            if (controls.isScriptedInteractionActive?.()) {
              return;
            }
            focusNpcConversationWhenDialogueOpens({
              targetId,
              playerPosition,
              npcActors,
              interactables,
              targetPosition
            });
          }
        });
      } else if (!dialogueActive && !primaryActionWantsFieldMove) {
        performHarvestAction(playerPosition, {
          allowLeafage: false,
          allowFire: false,
          allowPlacement: !gamepadPrimaryMoveRequested
        });
      }
    } else if (
      controls.isPrimaryActionActive?.() &&
      waterGunEquipped &&
      session.playerCharacter &&
      !cinematicActive &&
      !tutorialActive &&
      !pokedexModalOpen &&
      !skillLearnActive &&
      !scriptedInteractionActive &&
      !dialogueActive
    ) {
      const playerPosition = session.playerCharacter.getPosition();
      const waterGunTarget = gameplay.findNearbyActionTarget({
        playerPosition,
        palmModel: session.palmModel,
        palmInstances: session.palmInstances,
        resourceNodes: session.resourceNodes,
        leppaTree: session.leppaTree,
        storyState: controls.storyState,
        inventory: controls.inventory,
        leafDen: session.leafDen,
        groundDeadInstances: session.groundDeadInstances,
        groundPurifiedInstances: session.groundPurifiedInstances,
        groundGrassPatches: session.groundGrassPatches,
        groundFlowerPatches: session.groundFlowerPatches,
        canPurifyGround: true,
        canUseLeafage: false,
        allowPlacement: false
      });

      if (waterGunTarget?.groundCell) {
        const squirtleWaterGunResult = startSquirtleWaterGunAction({
          groundCell: waterGunTarget.groundCell,
          playerPosition
        });

        if (squirtleWaterGunResult === "unavailable") {
          triggerWaterGunSfxBurst();
          performHarvestAction(playerPosition, {
            useWaterGun: true,
            forcedHarvestTarget: waterGunTarget
          });
        }
      } else if (
        waterGunTarget?.leppaTree?.action === "water" ||
        waterGunTarget?.leppaTree?.action === "headbutt" ||
        (
          waterGunTarget?.palm
        )
      ) {
        if (consumeSquirtleWaterStaminaForInstantAction()) {
          triggerWaterGunSfxBurst();
          performHarvestAction(playerPosition, {
            forcedHarvestTarget: waterGunTarget,
            useWaterGun: true
          });
        }
      }
    }

    const canProcessGameplayAction = resolveGameplayActionPermission({
      hasPlayerCharacter: Boolean(session.playerCharacter),
      flowState: frameFlowState
    });
    const canProcessDestroyAction = canProcessGameplayAction;

   const destroyActionRequested = controls.consumeDestroyActionRequest?.();

debugInteractionFlow("gameLoop.destroyAction.input", {
  canProcessDestroyAction,
  destroyActionRequested,
  playerPosition: session.playerCharacter?.getPosition?.()
});

if (canProcessDestroyAction && destroyActionRequested) {
  performGameplayDestroyAction({
    playerPosition: session.playerCharacter.getPosition(),
    npcActors: session.npcActors,
    interactables: session.interactables,
    storyState: controls.storyState,
    inventory: controls.inventory,
    woodDrops: session.woodDrops,
    groundGrassPatches: session.groundGrassPatches,
    groundFlowerPatches: session.groundFlowerPatches,
    groundPurifiedInstances: session.groundPurifiedInstances,
    logChair: session.logChair,
    leafDen: session.leafDen,
    leppaTree: session.leppaTree,
    leppaBerryDrops: session.leppaBerryDrops,
    timburrEncounter: session.timburrEncounter,
    charmanderEncounter: session.charmanderEncounter,
    bulbasaurEncounter: session.bulbasaurEncounter
  });
}

    if (
      controls.consumeInteractRequest() &&
      canProcessGameplayAction
    ) {
      playSoundEvent(SOUND_EVENT_IDS.UI_CONFIRM);
      performGameplayInteractAction({
        playerPosition: session.playerCharacter.getPosition(),
        npcActors: session.npcActors,
        interactables: session.interactables,
        storyState: controls.storyState,
        inventory: controls.inventory,
        woodDrops: session.woodDrops,
        groundGrassPatches: session.groundGrassPatches,
        groundFlowerPatches: session.groundFlowerPatches,
        groundPurifiedInstances: session.groundPurifiedInstances,
        logChair: session.logChair,
        leafDen: session.leafDen,
        leppaTree: session.leppaTree,
        leppaBerryDrops: session.leppaBerryDrops,
        timburrEncounter: session.timburrEncounter,
        charmanderEncounter: session.charmanderEncounter,
        bulbasaurEncounter: session.bulbasaurEncounter,
        onNpcInteractionStart({
          targetId,
          playerPosition,
          npcActors,
          interactables,
          targetPosition
        }) {
          faceInteractionTargetTowardPlayer({
            targetId,
            playerPosition,
            npcActors,
            interactables
          });
          if (controls.isScriptedInteractionActive?.()) {
            return;
          }
          focusNpcConversationWhenDialogueOpens({
            targetId,
            playerPosition,
            npcActors,
            interactables,
            targetPosition
          });
        }
      });
    }

    if (controls.consumeFollowerCallRequest?.()) {
      playSoundEvent(SOUND_EVENT_IDS.BOT_SIGNAL);
      const leafDenHelpCall =
        controls.storyState.flags.leafDenKitPlaced &&
        !controls.storyState.flags.leafDenConstructionStarted;

      if (leafDenHelpCall) {
        const called = [];
        if (controls.storyState.flags.timburrRevealed) {
          controls.storyState.flags.timburrFollowing = true;
          called.push(SANDBOTS_BOT_NAMES.builder);
        }
        if (controls.storyState.flags.charmanderRevealed) {
          controls.storyState.flags.charmanderFollowing = true;
          called.push(SANDBOTS_BOT_NAMES.thermal);
        }
        hud.pushNotice(called.length ?
          `${called.join(" and ")} are following you.` :
          "No bots are ready to help with construction yet.");
      } else if (
        controls.storyState.flags.charmanderRevealed &&
        !controls.storyState.flags.charmanderCampfireLit &&
        session.campfire
      ) {
        controls.storyState.flags.charmanderFollowing = true;
        hud.pushNotice(`${SANDBOTS_BOT_NAMES.thermal} is following you.`);
      } else if (
        controls.storyState.flags.charmanderCelebrationSuggested &&
        !controls.storyState.flags.charmanderCelebrationComplete &&
        controls.storyState.flags.charmanderRevealed
      ) {
        controls.storyState.flags.charmanderFollowing = true;
        hud.pushNotice(`${SANDBOTS_BOT_NAMES.thermal} is following you.`);
      }
    }

    // Simulation updates.
    hud.updateTransientNotice(deltaTime);
    gameplay.updatePalmShake(deltaTime, session.palmInstances);
    gameplay.updateResourceNodes(deltaTime, session.resourceNodes);
    gameplay.updateResourceNodes(deltaTime, session.woodDrops);
    landscapeCutEffectRuntime.update(deltaTime);
    syncModelResourceInstances(session.resourceNodes, controls.storyState, deltaTime);
    session.updateCloudAtmosphere?.(deltaTime);
    updateSnowstormParticleField(session.snowstorm, {
      deltaTime,
      playerPosition: session.playerCharacter?.getPosition?.() || null
    });
    snowstormFogRuntime.update({ session, deltaTime });
    gameplay.syncLeppaTreeState?.(session.leppaTree, controls.storyState);
    updateLeppaTreeDance(now);
    updateLeppaTreeMusicNotes({
      leppaTree: session.leppaTree,
      textures: session.leppaTreeMusicalNoteTextures,
      deltaTime
    });
    const chopperBulbasaurRepairBoxInvestigationTarget =
      getBulbasaurRepairBoxInvestigationTarget();
    updateChopperNpcActor(session.chopperNpcActor, {
      deltaTime,
      storyState: controls.storyState,
      isNpcActive: rendering.isNpcActive,
      isDialogueActive: () => gameplayDialogue.isActive(),
      guidePosition: RUINED_POKEMON_CENTER_GUIDE_POSITION,
      investigationTarget: chopperBulbasaurRepairBoxInvestigationTarget
    });
    updateBulbasaurRepairBoxRustle(deltaTime);
    updateBulbasaurEncounter(deltaTime);
    updateCharmanderEncounter(deltaTime, { activeMoveId });
    updateCharmanderFireAction(deltaTime);
    audio.updateFireFlame({
      active: session.charmanderFireAction?.phase === "spray",
      nowSeconds: now * 0.001
    });
    updateTimburrEncounter(deltaTime, { activeMoveId });
    updateTimburrBuildBlockAction(deltaTime, now);
    syncCompanionRepairModules();
    syncBeeFieldRepairBox();
    syncBeeFieldBees(deltaTime);
    updateSquirtleReassembly(deltaTime);
    updateSquirtleWaterStamina(deltaTime);
    updateCharmanderCarbonEnergy(deltaTime);
    updateSquirtleWaterGunAction(deltaTime);
    audio.updateWaterGun({
      active: session.squirtleWaterGunAction?.phase === "spray" ||
        waterGunSfxBurstRuntime.isActive(now * 0.001),
      nowSeconds: now * 0.001
    });
    updateBulbasaurLeafageAction(deltaTime);
    const robotIdlePatrolActive = Boolean(
      isGameFlow(gameFlowValues.GAMEPLAY) &&
      !gameplayOpeningMovementLocked &&
      !cinematicActive &&
      !tutorialActive &&
      !pokedexModalOpen &&
      !dialogueActive &&
      !skillLearnActive &&
      !scriptedInteractionActive
    );
    updateSquirtleIdlePatrol(deltaTime, {
      active: robotIdlePatrolActive,
      activeMoveId
    });
    updateBulbasaurIdlePatrol(deltaTime, {
      active: robotIdlePatrolActive,
      activeMoveId
    });

    if (cinematicActive) {
      actTwoSequence.update(deltaTime);
      cinematicActive = isGameFlow(gameFlowValues.CINEMATIC);
      tutorialActive = isGameFlow(gameFlowValues.TUTORIAL);
    }

    if (session.playerCharacter && !cinematicActive) {
      if (!tutorialActive && !pokedexModalOpen && !skillLearnActive && !scriptedInteractionActive) {
        const woodDropSnapshots = snapshotAvailableWoodDrops(session.woodDrops);
        const collectedWoodCount = gameplay.collectWoodDrops(
          session.playerCharacter.getPosition(),
          session.woodDrops,
          controls.inventory
        );

        if (collectedWoodCount > 0) {
          woodCollectPopRuntime.trigger(woodDropSnapshots);
          const collectedWoodPositions = getNewlyCollectedDropPositions(woodDropSnapshots);
          for (let woodIndex = 0; woodIndex < collectedWoodCount; woodIndex += 1) {
            audio.playWoodGrab({
              active: true,
              nowSeconds: (now * 0.001) + woodIndex * 0.025
            });
          }
          hud.syncInventoryUi(controls.inventory);
          queueSupplyPickupFlyItems("wood", collectedWoodPositions);
          hud.pushNotice(`+${collectedWoodCount} Wood`);
          triggerSupplyCounterPrompt("wood", controls.inventory, now);

          if (controls.storyState.flags.bulbasaurStrawBedChallengeCompletionNoticePending) {
            controls.storyState.flags.bulbasaurStrawBedChallengeCompletionNoticePending = false;
            hud.pushNotice(getColonyFeedbackNotice(COLONY_FEEDBACK_IDS.HABITAT_CHECK_COMPLETE, {
              growBotName: SANDBOTS_BOT_NAMES.grow
            }));
          }
        }

        const leafPlayerPosition = session.playerCharacter.getPosition();
        const leafDropSnapshots = snapshotCollectibleSources(
          session.woodDrops,
          (drop) => drop.itemId === LEAVES_ITEM_ID && !drop.collected
        );
        const leafResourceSnapshots = snapshotCollectibleSources(
          session.resourceNodes,
          (resourceNode) => resourceNode.itemId === LEAVES_ITEM_ID
        );
        const collectedLeafDropCount = gameplay.collectLeafDrops?.(
          leafPlayerPosition,
          session.woodDrops,
          controls.inventory
        ) || 0;
        const collectedLeafResourceCount = gameplay.collectLeafResourceNodes?.(
          leafPlayerPosition,
          session.resourceNodes,
          controls.inventory
        ) || 0;
        const collectedLeafCount = collectedLeafDropCount + collectedLeafResourceCount;

        if (collectedLeafCount > 0) {
          const collectedLeafPositions = [
            ...getNewlyCollectedDropPositions(leafDropSnapshots),
            ...getNewlyCollectedResourcePositions(leafResourceSnapshots)
          ];
          pushSupplyResourceCollectFeedback({
            itemId: LEAVES_ITEM_ID,
            count: collectedLeafCount,
            sourcePositions: collectedLeafPositions,
            label: "Leaves",
            now
          });
        }

        const gearResourceSnapshots = snapshotCollectibleSources(
          session.resourceNodes,
          (resourceNode) => resourceNode.itemId === GEAR_ITEM_ID
        );
        const collectedGearCount = gameplay.collectGearResourceNodes?.(
          leafPlayerPosition,
          session.resourceNodes,
          controls.inventory
        ) || 0;

        if (collectedGearCount > 0) {
          const collectedGearPositions = getNewlyCollectedResourcePositions(gearResourceSnapshots);
          gearPickupParticleRuntime.trigger(collectedGearPositions);
          pushSupplyResourceCollectFeedback({
            itemId: GEAR_ITEM_ID,
            count: collectedGearCount,
            sourcePositions: collectedGearPositions,
            label: "Gear",
            now
          });
        }

        const carbonResourceSnapshots = snapshotCollectibleSources(
          session.resourceNodes,
          (resourceNode) => resourceNode.itemId === CARBON_ITEM_ID
        );
        const collectedCarbonCount = gameplay.collectCarbonResourceNodes?.(
          leafPlayerPosition,
          session.resourceNodes,
          controls.inventory
        ) || 0;

        if (collectedCarbonCount > 0) {
          const collectedCarbonPositions = getNewlyCollectedResourcePositions(carbonResourceSnapshots);
          pushSupplyResourceCollectFeedback({
            itemId: CARBON_ITEM_ID,
            count: collectedCarbonCount,
            sourcePositions: collectedCarbonPositions,
            label: "Carbon",
            now
          });
        }

        const leppaBerrySnapshots = snapshotCollectibleSources(
          session.leppaBerryDrops,
          (drop) => !drop.collected
        );
        const collectedLeppaBerryCount = gameplay.collectLeppaBerryDrops?.(
          session.playerCharacter.getPosition(),
          session.leppaBerryDrops,
          controls.inventory
        ) || 0;

        if (collectedLeppaBerryCount > 0) {
          const collectedLeppaBerryPositions = getNewlyCollectedDropPositions(leppaBerrySnapshots);
          hud.syncInventoryUi(controls.inventory);
          queueSupplyPickupFlyItems(LEPPA_BERRY_ITEM_ID, collectedLeppaBerryPositions);
          hud.pushNotice(`+${collectedLeppaBerryCount} ${SANDBOTS_ITEM_NAMES.pulseBerry}`);
          triggerSupplyCounterPrompt(LEPPA_BERRY_ITEM_ID, controls.inventory, now);
        }
      }
    }

    if (!cinematicActive) {
      if (tutorialCameraFocus && session.playerCharacter) {
        camera.setPose({
          target: [tutorialCameraFocus[0], 1.25, tutorialCameraFocus[2]],
          direction: cameraOrbit.getDirection(),
          zoom: 3.95,
          distance: 7.35
        });
      } else if (foundationBuildZoneCameraFocusActive) {
        // The focus transition was started at mission activation; hold the pose until it expires.
      } else if (isGameFlow(gameFlowValues.GAMEPLAY) && !gameplayOpeningCameraFrame?.skipped) {
        
        gameplayOpeningCameraFrame = gameplayOpeningRuntime.updateCamera({
          now,
          gameplayActive: true,
          canFollow: !dialogueActive && !cameraTransitionActive && !scriptedInteractionActive
        });

      } else if (session.playerCharacter && !dialogueActive && !camera.isTargetTransitionActive()) {
        camera.follow(session.playerCharacter.getPosition());
      }
    }

    gameplayOpeningRuntime.updateShipAudio(now);

    audio.updatePlayerDriving({
      active: playerMovedThisFrame || gameplayOpeningCameraFrame?.phase === "player-exit"
    });
    const nowSeconds = now * 0.001;
    updateTrainHouseMusic(nowSeconds);
    gameplay.musicRuntime?.update?.(deltaTime, { nowSeconds });

    gameplayOpeningRuntime.updateHudReveal({
      now,
      gameplayActive: isGameFlow(gameFlowValues.GAMEPLAY)
    });

    gameplayOpeningCameraFrame = gameplayOpeningRuntime.getCameraFrame();
    const gameplayOpeningHudHidden = gameplayOpeningRuntime.isHudHidden();
    const currentFlowState = {
      ...frameFlowState,
      cinematicActive,
      tutorialActive,
      dialogueActive: gameplayDialogue.isActive()
    };
    const canQueryNearbyGameplayTargets = resolveNearbyGameplayQueryPermission({
      hasPlayerCharacter: Boolean(session.playerCharacter),
      gameplayOpeningMovementLocked,
      flowState: currentFlowState
    });

    // Prompt and snapshot preparation.
    const nearbyHarvestTarget =
      canQueryNearbyGameplayTargets ?
        gameplay.findNearbyActionTarget({
          playerPosition: session.playerCharacter.getPosition(),
          palmModel: session.palmModel,
          palmInstances: session.palmInstances,
          resourceNodes: session.resourceNodes,
          leppaTree: session.leppaTree,
          leafDen: session.leafDen,
          storyState: controls.storyState,
          inventory: controls.inventory,
          groundDeadInstances: session.groundDeadInstances,
          iceGroundInstances: session.iceGroundInstances,
          groundPurifiedInstances: session.groundPurifiedInstances,
          groundGrassPatches: session.groundGrassPatches,
          groundFlowerPatches: session.groundFlowerPatches,
          canPurifyGround: waterGunEquipped,
          canUseLeafage: leafageEquipped,
          canUseFire: fireEquipped
        }) :
        null;
    const nearbyInvalidMoveTarget =
      canQueryNearbyGameplayTargets &&
      (
        (leafageEquipped && !nearbyHarvestTarget?.leafageGroundCell) ||
        (waterGunEquipped && !nearbyHarvestTarget?.groundCell) ||
        (fireEquipped && !nearbyHarvestTarget?.fireGroundCell)
      ) ?
        gameplay.findNearbyActionTarget({
          playerPosition: session.playerCharacter.getPosition(),
          palmModel: session.palmModel,
          palmInstances: session.palmInstances,
          resourceNodes: session.resourceNodes,
          leppaTree: session.leppaTree,
          leafDen: session.leafDen,
          storyState: controls.storyState,
          inventory: controls.inventory,
          groundDeadInstances: session.groundDeadInstances,
          iceGroundInstances: session.iceGroundInstances,
          groundPurifiedInstances: session.groundPurifiedInstances,
          groundGrassPatches: session.groundGrassPatches,
          groundFlowerPatches: session.groundFlowerPatches,
          canPurifyGround: leafageEquipped,
          canUseLeafage: waterGunEquipped,
          canUseFire: false
        }) :
        null;
    const invalidMoveGroundCell = leafageEquipped ?
      nearbyInvalidMoveTarget?.groundCell :
      waterGunEquipped ?
        nearbyInvalidMoveTarget?.leafageGroundCell :
        fireEquipped ?
          null :
        null;
    const highlightedGroundCell =
      nearbyHarvestTarget?.groundCell ||
      nearbyHarvestTarget?.leafageGroundCell ||
      nearbyHarvestTarget?.fireGroundCell ||
      invalidMoveGroundCell ||
      null;
    const highlightedGroundCellTargetState =
      highlightedGroundCell && highlightedGroundCell === invalidMoveGroundCell ?
        "invalid" :
        "valid";
    const highlightedGroundCellAbilityId =
      leafageEquipped ?
        "leafage" :
        waterGunEquipped ?
          "waterGun" :
          fireEquipped ?
            "fire" :
          null;
    const nearbyInteractable =
      canQueryNearbyGameplayTargets ?
        gameplay.findNearbyInteractable(
          session.playerCharacter.getPosition(),
          session.npcActors,
          session.interactables,
          controls.storyState,
          session.groundGrassPatches || [],
          session.logChair,
          session.leafDen,
          session.timburrEncounter,
          session.charmanderEncounter,
          session.leppaTree,
          session.bulbasaurEncounter,
          session.groundFlowerPatches || []
        ) :
        null;
    const activeQuest = gameplay.getActiveQuest(controls.storyState);
    const activeTask = gameplay.getActiveTask?.() || null;
    const activeSystemQuest = gameplay.getActiveSystemQuest?.() || null;
    const canShowGroundGuidance = resolveGroundGuidanceVisibility({
      gameplayOpeningMovementLocked,
      gameplayOpeningHudHidden,
      flowState: currentFlowState
    });
    const canShowPassiveGroundGuidance = resolveGroundGuidanceVisibility({
      gameplayOpeningMovementLocked,
      gameplayOpeningHudHidden,
      requireDialogueClosed: true,
      flowState: currentFlowState
    });
    const pendingWaterGunGroundCells =
      canShowGroundGuidance ?
        getPendingSquirtleWaterGunGroundCells() :
        [];
    const activeLeafageGroundCells =
      canShowGroundGuidance &&
      session.bulbasaurLeafageAction?.groundCell ?
        [session.bulbasaurLeafageAction.groundCell] :
        [];
    const activeFireGroundCell =
      canShowGroundGuidance &&
      session.charmanderFireAction?.groundCell &&
      !session.charmanderFireAction.impactApplied ?
        {
          ...session.charmanderFireAction.groundCell,
          highlightTargetState: "valid",
          highlightAbilityId: "fire"
        } :
        null;
    const freeRoamRestorationGroundCells =
      !activeQuest &&
      canShowPassiveGroundGuidance &&
      !solarStationPlacementPreview &&
      !campfirePlacementPreview &&
      !leafDenKitPlacementPreview &&
      session.playerCharacter ?
        getFreeRoamRestorationGroundCells({
          playerPosition: session.playerCharacter.getPosition(),
          waterGunEquipped,
          leafageEquipped,
          fireEquipped
        }) :
        [];
    const leppaTreeMissionGroundCells =
      canShowPassiveGroundGuidance &&
      isOpeningLeppaTreeRequestActive(controls.storyState) ?
        getLeppaTreeSurroundingGroundCells(
          session.leppaTree,
          session.groundDeadInstances
        ) :
        [];
    const leppaTreeTileHintFlashing = Boolean(gameplay.isLeppaTreeTileHintFlashing?.());
    const markedGroundCellPulsePhase = leppaTreeTileHintFlashing ?
      (Math.sin(now * 0.035) + 1) * 0.5 :
      (Math.sin(now * 0.012) + 1) * 0.5;
    const solarStationFieldMarkedGroundCells =
      nearbyHarvestTarget?.strawBedPlacement &&
      !controls.storyState.flags.strawBedPlacedInBulbasaurHabitat ?
        buildSolarStationFieldMarkedGroundCells(nearbyHarvestTarget.strawBedPlacement) :
        [];
    const boulderShadedTaskGroundCells =
      canShowPassiveGroundGuidance ?
        getBoulderShadedTaskGroundCells(controls.storyState) :
        [];
    const growFirstHabitatTaskGroundCells =
      canShowPassiveGroundGuidance ?
        getGrowFirstHabitatTaskGroundCells({
          activeQuest,
          activeSystemQuest,
          activeTask,
          storyState: controls.storyState
        }) :
        [];
    const foundationBuildZoneGroundCells =
      canShowPassiveGroundGuidance ?
        buildFoundationBuildZoneGroundCells(activeQuest, activeSystemQuest) :
        [];
    const worldCellPlannerSelectedGroundCell = getWorldCellPlannerSelectedGroundCell();
    const markedActionGroundCells = [
      ...new Set([
        ...leppaTreeMissionGroundCells,
        ...pendingWaterGunGroundCells,
        ...activeLeafageGroundCells,
        ...freeRoamRestorationGroundCells,
        ...boulderShadedTaskGroundCells,
        ...growFirstHabitatTaskGroundCells,
        ...foundationBuildZoneGroundCells,
        ...solarStationFieldMarkedGroundCells,
        ...(worldCellPlannerSelectedGroundCell ? [worldCellPlannerSelectedGroundCell] : [])
      ])
    ];
    if (!session.strawBedPlacementPreview?.active) {
      solarStationPlacementPreview = null;
    }
    if (!session.greenhousePlacementPreview?.active) {
      greenhousePlacementPreview = null;
    }
    if (!session.campfirePlacementPreview?.active) {
      campfirePlacementPreview = null;
    }
    if (!session.leafDenKitPlacementPreview?.active) {
      leafDenKitPlacementPreview = null;
    }
    const inputModalityState = getCurrentInputModalityState();
    const transientNoticeRoute = resolveTransientNoticeRoute(hud.getNoticeMessage());
    const playerCounterPromptText = playerCounterPromptRuntime.get(now);
    const {
      solarStationPlacementPrompt,
      greenhousePlacementPrompt,
      campfirePlacementPrompt,
      leafDenKitPlacementPrompt
    } = resolveFramePlacementPrompts({
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      inputModalityState
    });
    const pendingPlacementIntent =
      !solarStationPlacementPreview && !greenhousePlacementPreview && !campfirePlacementPreview && !leafDenKitPlacementPreview ?
        getActivePendingPlacementIntent(session, controls.storyState, controls.inventory) :
        null;
    const pendingPlacementPrompt = getPendingPlacementPrompt(
      pendingPlacementIntent,
      nearbyHarvestTarget,
      inputModalityState
    );
    const selectedWorkbenchRotationTarget =
      !solarStationPlacementPreview &&
      !greenhousePlacementPreview &&
      !campfirePlacementPreview &&
      !leafDenKitPlacementPreview ?
        getSelectedRotatableWorkbenchPlacement() :
        null;
    const nearbyWorkbenchRotationTarget =
      !selectedWorkbenchRotationTarget &&
      !solarStationPlacementPreview &&
      !greenhousePlacementPreview &&
      !campfirePlacementPreview &&
      !leafDenKitPlacementPreview &&
      session.playerCharacter &&
      !gameplayOpeningMovementLocked &&
      !cinematicActive &&
      !tutorialActive &&
      !skillLearnActive &&
      !scriptedInteractionActive ?
        getNearestRotatableWorkbenchPlacement() :
        null;
    const workbenchRotationPrompt = selectedWorkbenchRotationTarget ?
      resolveWorkbenchRotationPrompt(inputModalityState) :
      nearbyWorkbenchRotationTarget ?
        resolveInputPrompt(UI_PROMPT_ACTION.OPEN_BAG, inputModalityState) :
        "";
    
    const destroyableObjectPrompt =
      !solarStationPlacementPreview &&
      !greenhousePlacementPreview &&
      !campfirePlacementPreview &&
      !leafDenKitPlacementPreview &&
      session.playerCharacter ?
        gameplay.findNearbyDestroyableObjectPrompt?.({
          playerPosition: session.playerCharacter.getPosition(),
          storyState: controls.storyState,
          groundGrassPatches: session.groundGrassPatches,
          groundFlowerPatches: session.groundFlowerPatches
        }) :
        null;


  debugInteractionFlow("gameLoop.destroyableObjectPrompt", {
    hasMethod: typeof gameplay.findNearbyDestroyableObjectPrompt,
    prompt: destroyableObjectPrompt,
    playerPosition: session.playerCharacter?.getPosition?.(),
    grassCount: session.groundGrassPatches?.length || 0,
    flowerCount: session.groundFlowerPatches?.length || 0,
    blockedByPlacementPreview: Boolean(
      solarStationPlacementPreview ||
      greenhousePlacementPreview ||
      campfirePlacementPreview ||
      leafDenKitPlacementPreview
    )
  });
    const promptCopy =
      gameplayOpeningMovementLocked ||
      cinematicActive ||
      tutorialActive ||
      skillLearnActive ||
      scriptedInteractionActive ?
      "" :
      solarStationPlacementPrompt ||
      greenhousePlacementPrompt ||
      campfirePlacementPrompt ||
      leafDenKitPlacementPrompt ||
      pendingPlacementPrompt ||
      workbenchRotationPrompt ||
      destroyableObjectPrompt?.promptCopy ||
      gameplay.buildNearbyPrompt({
        harvestTarget: nearbyHarvestTarget,
        interactTarget: nearbyInteractable,
        quest: activeQuest,
        transientMessage: transientNoticeRoute.hudMessage,
        getItemLabel: gameplay.getItemLabel,
        storyState: controls.storyState,
        activeMoveId,
        pendingWaterGunCount: pendingWaterGunGroundCells.length
      });

    debugInteractionFlow("gameLoop.promptCopy.resolved", {
  promptCopy,
  destroyableObjectPrompt: destroyableObjectPrompt?.promptCopy || "",
  sources: {
    solarStationPlacementPrompt,
    greenhousePlacementPrompt,
    campfirePlacementPrompt,
    leafDenKitPlacementPrompt,
    pendingPlacementPrompt,
    workbenchRotationPrompt
  },
  blockedByMode: {
    gameplayOpeningMovementLocked,
    cinematicActive,
    tutorialActive,
    skillLearnActive,
    scriptedInteractionActive
  }
});

    const shouldShowGroundCellHighlight =
      resolveGroundGuidanceVisibility({
        gameplayOpeningMovementLocked,
        requireDialogueClosed: true,
        flowState: currentFlowState
      }) &&
      Boolean(highlightedGroundCell);
    const fieldToolTargetPulseFrame = shouldShowGroundCellHighlight ?
      groundActionFeedbackRuntime.getPulseFrame(highlightedGroundCell, now) :
      null;
    const solarStationPlacementGroundCells = buildPlacementPreviewFootprintCells(
      solarStationPlacementPreview,
      {
        idPrefix: "solar-station-placement-preview",
        footprint: SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT,
        targetState: solarStationPlacementPreview?.valid ? "valid" : "invalid"
      }
    );
    const solarStationPlacementGroundCell = solarStationPlacementGroundCells[0] || null;
    const solarStationPowerRadiusGroundCells = solarStationPlacementPreview ?
      buildSolarStationPreviewPowerRadiusGroundCells(session, solarStationPlacementPreview) :
      leafDenKitPlacementPreview ?
        buildPlacedSolarStationPowerRadiusGroundCells(session, controls.storyState) :
        [];
    const greenhousePlacementGroundCells = buildPlacementPreviewFootprintCells(
      greenhousePlacementPreview,
      {
        idPrefix: "greenhouse-placement-preview",
        footprint: GREENHOUSE_PLACEMENT_GRID_FOOTPRINT,
        targetState: greenhousePlacementPreview?.valid ? "valid" : "invalid"
      }
    );
    const greenhousePlacementGroundCell = greenhousePlacementGroundCells[0] || null;
    const campfirePlacementGroundCells = buildPlacementPreviewFootprintCells(
      campfirePlacementPreview,
      {
        idPrefix: "train-house-placement-preview",
        footprint: TRAIN_HOUSE_PLACEMENT_GRID_FOOTPRINT,
        targetState: campfirePlacementPreview?.valid ? "valid" : "invalid"
      }
    );
    const campfirePlacementGroundCell = campfirePlacementGroundCells[0] || null;
    const leafDenKitPlacementGroundCells = buildPlacementPreviewFootprintCells(
      leafDenKitPlacementPreview,
      {
        idPrefix: "leaf-den-kit-placement-preview",
        footprint: LEAF_DEN_KIT_PLACEMENT_GRID_FOOTPRINT,
        targetState: leafDenKitPlacementPreview?.valid ? "valid" : "invalid"
      }
    );
    const leafDenKitPlacementGroundCell = leafDenKitPlacementGroundCells[0] || null;
    const workbenchRotationGroundCell = selectedWorkbenchRotationTarget ?
      getWorkbenchRotationGroundCell(selectedWorkbenchRotationTarget) :
      null;
    const groundActionFeedbackFrame = groundActionFeedbackRuntime.getFeedbackFrame({ session, now });

    if (
      !gameplayOpeningCameraLocked &&
      !gameplayOpeningHudHidden &&
      !cinematicActive &&
      !tutorialActive &&
      !pokedexModalOpen &&
      !skillLearnActive
    ) {
      nextFrame.hud.active = true;
      nextFrame.hud.storyState = controls.storyState;
      nextFrame.hud.inventory = controls.inventory;
      nextFrame.hud.playerPosition = session.playerCharacter?.getPosition() || [0, 0, 0];
      nextFrame.hud.promptCopy = promptCopy;
      nextFrame.hud.inputModalityState = inputModalityState;
      nextFrame.hud.statusMessage = promptCopy;
    }

    const followedViewProjection = camera.getViewProjection(
      worldCanvas.width,
      worldCanvas.height
    );
    syncActiveRepairBoxHighlight();
    syncGreenhouseModelInstance(deltaTime);
    syncCampfireTrainHouseModelInstance(now * 0.001, deltaTime);
    if (isLeafDenConstructionActive()) {
      controls.completeLeafDenConstructionIfReady?.({ playDialogue: false });
    }
    syncLeafDenConstructionClouds(now * 0.001);
    syncConstructionCloudBurstEffects(now * 0.001);
    syncLeafDenModelInstance(deltaTime);
    syncPlayerHouseModelInstances(
      deltaTime,
      camera.getPose?.()?.target || session.playerCharacter?.getPosition?.() || null
    );
    applyInteractionObjectHighlight(session, {
      interactTarget: nearbyInteractable,
      workbenchRotationTarget: nearbyWorkbenchRotationTarget
    });
    nextFrame.render.viewProjection = followedViewProjection;
    nextFrame.render.sceneObjects = getSquirtleAssemblySceneObjects(
      getGameplayOpeningShipSceneObjects(
        session.sceneObjects,
        session.gameplayOpeningShip
      ),
      session.actTwoSquirtle
    );
    nextFrame.render.skyTexture = session.skyTexture;
    const psxDistanceFogSettings = resolvePsxDistanceFogSettings({
      sceneId: cinematicActive ? gameFlowValues.CINEMATIC : gameFlowValues.GAMEPLAY
    });
    nextFrame.render.psxDistanceFog = psxDistanceFogSettings.enabled ?
      psxDistanceFogSettings :
      null;

    const tangrowthActor = session.npcActors.find((npcActor) => npcActor.id === "tangrowth");
    const tangrowthPosition =
      tangrowthActor?.character?.getPosition?.() ||
      null;
    // World-space UI and render preparation.
    const canShowWorldSpaceUi = resolveWorldSpaceUiVisibility({
      gameplayOpeningCameraLocked,
      flowState: currentFlowState
    });
    applyWorkbenchGreenArrowCue(session.workbenchGreenArrowModelInstance, {
      active: canShowWorldSpaceUi && shouldShowWorkbenchGreenArrowCue({
        activeQuest,
        activeTask,
        activeSystemQuest,
        storyState: controls.storyState
      }),
      now
    });
    const shouldShowTangrowthSpeech =
      canShowWorldSpaceUi &&
      activeQuest?.id === "meetTangrowth" &&
      tangrowthPosition;
    const shouldShowTangrowthLogChairSpeech =
      !shouldShowTangrowthSpeech &&
      canShowWorldSpaceUi &&
      controls.storyState.flags.tangrowthLogChairRequestAvailable &&
      !controls.storyState.flags.logChairReceived &&
      tangrowthPosition;
    const shouldShowTangrowthCampfireSpeech =
      false;
    const shouldShowTangrowthPokemonCenterSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      canShowWorldSpaceUi &&
      controls.storyState.flags.pokemonCenterGuideStarted &&
      !controls.storyState.flags.ruinedPokemonCenterInspected &&
      tangrowthPosition;
    const shouldShowTangrowthHouseSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      canShowWorldSpaceUi &&
      controls.storyState.flags.tangrowthHouseTalkAvailable &&
      !controls.storyState.flags.tangrowthHouseTalkComplete &&
      tangrowthPosition;
    const shouldShowTangrowthCelebrationSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      canShowWorldSpaceUi &&
      controls.storyState.flags.charmanderCelebrationSuggested &&
      !controls.storyState.flags.charmanderCelebrationComplete &&
      tangrowthPosition;
    const shouldShowChopperBulbasaurRepairBoxSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      chopperBulbasaurRepairBoxInvestigationTarget &&
      tangrowthPosition &&
      !isPlayerNearWorldPosition(
        chopperBulbasaurRepairBoxInvestigationTarget.lookAtPosition,
        REPAIR_BOX_PROMPT_DISTANCE
      );
    const shouldShowBulbasaurMissionSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      !shouldShowChopperBulbasaurRepairBoxSpeech &&
      canShowWorldSpaceUi &&
      Boolean(session.bulbasaurEncounter?.visible) &&
      Boolean(session.bulbasaurEncounter?.position) &&
      controls.storyState.flags.bulbasaurRevealed &&
      !isOpeningLeppaTreeRequestActive(controls.storyState) &&
      !controls.storyState.flags.bulbasaurDryGrassMissionAccepted;
    const shouldShowBulbasaurWorkbenchGuideSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      !shouldShowChopperBulbasaurRepairBoxSpeech &&
      !shouldShowBulbasaurMissionSpeech &&
      canShowWorldSpaceUi &&
      Boolean(session.bulbasaurEncounter?.visible) &&
      Boolean(session.bulbasaurEncounter?.position) &&
      controls.storyState.flags.bulbasaurWorkbenchGuideAvailable &&
      !controls.storyState.flags.workbenchDiyRecipesReceived;
    const shouldShowBulbasaurRequestReadySpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      !shouldShowChopperBulbasaurRepairBoxSpeech &&
      !shouldShowBulbasaurMissionSpeech &&
      !shouldShowBulbasaurWorkbenchGuideSpeech &&
      canShowWorldSpaceUi &&
      Boolean(session.bulbasaurEncounter?.visible) &&
      Boolean(session.bulbasaurEncounter?.position) &&
      controls.storyState.flags.bulbasaurRevealed &&
      controls.storyState.flags.bulbasaurDryGrassMissionAccepted &&
      !controls.storyState.flags.bulbasaurDryGrassRequestTurnedIn &&
      !firstTaughtActionFreedomWindow.active &&
      (
        controls.storyState.flags.bulbasaurDryGrassMissionComplete ||
        (controls.storyState.flags.restoredGrassCount || 0) >= BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT
      );
    const shouldShowCharmanderFollowSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      !shouldShowChopperBulbasaurRepairBoxSpeech &&
      !shouldShowBulbasaurMissionSpeech &&
      !shouldShowBulbasaurWorkbenchGuideSpeech &&
      !shouldShowBulbasaurRequestReadySpeech &&
      !(
        Boolean(session.bulbasaurEncounter?.visible) &&
        Boolean(session.bulbasaurEncounter?.position) &&
        (
          (
            controls.storyState.flags.bulbasaurStrawBedChallengeComplete &&
            !controls.storyState.flags.strawBedRecipeUnlocked
          ) ||
          (
            controls.storyState.flags.strawBedPlacedInBulbasaurHabitat &&
            !controls.storyState.flags.bulbasaurStrawBedRequestComplete
          )
        )
      ) &&
      canShowWorldSpaceUi &&
      Boolean(session.charmanderEncounter?.visible) &&
      Boolean(session.charmanderEncounter?.position) &&
      controls.storyState.flags.charmanderRevealed &&
      !controls.storyState.flags.charmanderCampfireLit;
    const shouldShowBulbasaurStrawBedSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      !shouldShowChopperBulbasaurRepairBoxSpeech &&
      !shouldShowBulbasaurMissionSpeech &&
      !shouldShowBulbasaurWorkbenchGuideSpeech &&
      !shouldShowBulbasaurRequestReadySpeech &&
      canShowWorldSpaceUi &&
      Boolean(session.bulbasaurEncounter?.visible) &&
      Boolean(session.bulbasaurEncounter?.position) &&
      controls.storyState.flags.bulbasaurStrawBedChallengeComplete &&
      !controls.storyState.flags.strawBedRecipeUnlocked;
    const shouldShowBulbasaurStrawBedCompleteSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      !shouldShowChopperBulbasaurRepairBoxSpeech &&
      !shouldShowBulbasaurMissionSpeech &&
      !shouldShowBulbasaurWorkbenchGuideSpeech &&
      !shouldShowBulbasaurRequestReadySpeech &&
      !shouldShowBulbasaurStrawBedSpeech &&
      canShowWorldSpaceUi &&
      Boolean(session.bulbasaurEncounter?.visible) &&
      Boolean(session.bulbasaurEncounter?.position) &&
      controls.storyState.flags.strawBedPlacedInBulbasaurHabitat &&
      !controls.storyState.flags.bulbasaurStrawBedRequestComplete;
    const shouldShowCharmanderCelebrationSpeech =
      !shouldShowTangrowthSpeech &&
      !shouldShowTangrowthLogChairSpeech &&
      !shouldShowTangrowthCampfireSpeech &&
      !shouldShowTangrowthPokemonCenterSpeech &&
      !shouldShowTangrowthHouseSpeech &&
      !shouldShowTangrowthCelebrationSpeech &&
      !shouldShowChopperBulbasaurRepairBoxSpeech &&
      !shouldShowBulbasaurMissionSpeech &&
      !shouldShowBulbasaurWorkbenchGuideSpeech &&
      !shouldShowBulbasaurRequestReadySpeech &&
      !shouldShowCharmanderFollowSpeech &&
      !shouldShowBulbasaurStrawBedSpeech &&
      !shouldShowBulbasaurStrawBedCompleteSpeech &&
      canShowWorldSpaceUi &&
      Boolean(session.charmanderEncounter?.visible) &&
      Boolean(session.charmanderEncounter?.position) &&
      controls.storyState.flags.charmanderCelebrationRequestAvailable &&
      !controls.storyState.flags.charmanderCelebrationSuggested &&
      !controls.storyState.flags.charmanderCelebrationComplete;
    const nearbyRepairBoxPrompt = getNearbyRepairBoxPrompt(
      session.playerCharacter?.getPosition?.()
    );
    const shouldShowRepairBoxPrompt =
      canShowWorldSpaceUi &&
      Boolean(nearbyRepairBoxPrompt);
    const shouldShowWaterGunFirstUsePrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      controls.playerSkills?.waterGun &&
      activeMoveId === "waterGun" &&
      !controls.storyState.flags[WATER_GUN_FIRST_USE_PROMPT_FLAG] &&
      !controls.isPrimaryActionActive?.();
    const shouldShowLeafageFirstUsePrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      controls.playerSkills?.leafage &&
      !controls.storyState.flags.leafageTallGrassCount &&
      !controls.storyState.flags.leafageTallGrassHabitatCreated &&
      !controls.isPrimaryActionActive?.();
    const squirtleChargingPosition = getSquirtleWorldPosition();
    const shouldShowSquirtleChargingPrompt =
      canShowWorldSpaceUi &&
      isSquirtleWaterCharging() &&
      Array.isArray(squirtleChargingPosition);
    const shouldShowInvalidLeafageUsePrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      fieldMoveInvalidTargetPromptRuntime.isLeafageVisible(now);
    const shouldShowInvalidFireUsePrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      fieldMoveInvalidTargetPromptRuntime.isFireVisible(now);
    const fieldMoveSwitchPrompt = controls.getFieldMoveSwitchPrompt?.(now) || null;
    const shouldShowFieldMoveSwitchPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      Boolean(fieldMoveSwitchPrompt?.html);
    const shouldShowSolarStationPlacementPrompt =
      canShowWorldSpaceUi &&
      Boolean(solarStationPlacementPreview?.snappedPosition);
    const shouldShowGreenhousePlacementPrompt =
      canShowWorldSpaceUi &&
      Boolean(greenhousePlacementPreview?.snappedPosition);
    const shouldShowCampfirePlacementPrompt =
      canShowWorldSpaceUi &&
      Boolean(campfirePlacementPreview?.snappedPosition);
    const shouldShowLeafDenKitPlacementPrompt =
      canShowWorldSpaceUi &&
      Boolean(leafDenKitPlacementPreview?.snappedPosition);
    const shouldShowPendingPlacementPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      Boolean(pendingPlacementPrompt);
    const shouldShowWorkbenchRotationPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      Boolean(workbenchRotationPrompt);
    
    const shouldShowDestroyableObjectPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      !shouldShowWorkbenchRotationPrompt &&
  Boolean(destroyableObjectPrompt?.promptCopy);
    const freeBlockBuildCostMarker =
      canShowWorldSpaceUi && buildBlockEquipped ?
        getFreeBlockBuildCostMarker(freeBlockPreviewTarget) :
        null;
    const shouldShowFreeBlockBuildCostPrompt =
      canShowWorldSpaceUi &&
      Boolean(freeBlockBuildCostMarker);
    const shouldShowTransientWorldPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      transientNoticeRoute.worldPromptMessage;
    const shouldShowPlayerCounterPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      Boolean(playerCounterPromptText);
    const shouldShowPlayerInteractionPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      PLAYER_INTERACTION_WORLD_PROMPT_TARGET_IDS.has(nearbyInteractable?.target?.id);
    const nearbyDryGrassWorldPromptTarget =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      waterGunEquipped &&
      isDryGrassHydroMissionActive(activeQuest, controls.storyState, controls.playerSkills) ?
        findNearbyDryGrassWorldPromptTarget({
          playerPosition: session.playerCharacter.getPosition(),
          groundGrassPatches: session.groundGrassPatches,
          groundDeadInstances: session.groundDeadInstances,
          groundPurifiedInstances: session.groundPurifiedInstances
        }) :
        null;
    const nearbyDryGrassHintTarget =
      canShowWorldSpaceUi &&
      session.playerCharacter ?
        findNearbyDryGrassHintTarget({
          playerPosition: session.playerCharacter.getPosition(),
          groundGrassPatches: session.groundGrassPatches,
          leppaTree: session.leppaTree,
          groundDeadInstances: session.groundDeadInstances,
          storyState: controls.storyState
        }) :
        null;
    const shouldShowDryGrassHydroPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      Boolean(nearbyDryGrassWorldPromptTarget);
    const shouldShowRunBreadcrumbPrompt =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      runBreadcrumbPromptRuntime.isVisible(now);
    const playerInteractionPromptText = shouldShowPlayerInteractionPrompt ?
      getPlayerInteractionWorldPromptText(inputModalityState) :
      "";
    const dryGrassHydroPromptText = shouldShowDryGrassHydroPrompt ?
      getFieldToolWorldPromptText(inputModalityState) :
      "";
    const runBreadcrumbPromptText = shouldShowRunBreadcrumbPrompt ?
      getRunBreadcrumbWorldPromptText(inputModalityState) :
      "";
    const chopperAttentionCue = canShowWorldSpaceUi ?
      getPeriodicChopperAttentionCue({
        activeTask,
        activeSystemQuest,
        chopperPosition: tangrowthPosition,
        now
      }) :
      null;

    if (shouldShowTangrowthSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = gameplay.tangrowthOpeningLine;
      nextFrame.worldSpeech.worldPosition = tangrowthPosition;
    }

    if (shouldShowTangrowthLogChairSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = "I saved a field plan for you.";
      nextFrame.worldSpeech.worldPosition = tangrowthPosition;
    }

    if (shouldShowTangrowthPokemonCenterSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = `This way. The old ${SANDBOTS_WORLD_TERMS.terminal} is ahead.`;
      nextFrame.worldSpeech.worldPosition = tangrowthPosition;
    }

    if (shouldShowTangrowthHouseSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = "Human shelter plans are ready.";
      nextFrame.worldSpeech.worldPosition = tangrowthPosition;
    }

    if (shouldShowTangrowthCelebrationSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = `Bring ${SANDBOTS_BOT_NAMES.thermal} here.`;
      nextFrame.worldSpeech.worldPosition = tangrowthPosition;
    }

    if (shouldShowChopperBulbasaurRepairBoxSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = CHOPPER_BULBASAUR_REPAIR_BOX_SPEECH;
      nextFrame.worldSpeech.worldPosition = tangrowthPosition;
    }

    if (shouldShowBulbasaurMissionSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = "Talk to me, Broky.";
      nextFrame.worldSpeech.worldPosition = session.bulbasaurEncounter.position;
    }

    if (shouldShowBulbasaurWorkbenchGuideSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = "Workbench ping found. Follow me.";
      nextFrame.worldSpeech.worldPosition = session.bulbasaurEncounter.position;
    }

    if (shouldShowBulbasaurRequestReadySpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = "Dry patch restored. Soil response logged.";
      nextFrame.worldSpeech.worldPosition = session.bulbasaurEncounter.position;
    }

    if (shouldShowBulbasaurStrawBedSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = "I can share Solar Station plans.";
      nextFrame.worldSpeech.worldPosition = session.bulbasaurEncounter.position;
    }

    if (shouldShowBulbasaurStrawBedCompleteSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = getColonyFeedbackWorldSpeech(COLONY_FEEDBACK_IDS.SOLAR_STATION_PLACED);
      nextFrame.worldSpeech.worldPosition = session.bulbasaurEncounter.position;
    }

    if (shouldShowCharmanderFollowSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = controls.storyState.flags.charmanderFollowing ?
        "Route locked. Lead me to the heat station." :
        "Signal me when the heat station is ready.";
      nextFrame.worldSpeech.worldPosition = session.charmanderEncounter.position;
    }

    if (shouldShowCharmanderCelebrationSpeech) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = "Heat station stable. That counts as a celebration.";
      nextFrame.worldSpeech.worldPosition = session.charmanderEncounter.position;
    }

    const companionLostHint =
      !nextFrame.worldSpeech.visible ?
        getPeriodicCompanionLostHint({
          activeQuest,
          activeMoveId,
          now
        }) :
        null;

    if (companionLostHint) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = companionLostHint.text;
      nextFrame.worldSpeech.worldPosition = companionLostHint.worldPosition;
    }

    if (!nextFrame.worldSpeech.visible && chopperAttentionCue) {
      nextFrame.worldSpeech.visible = true;
      nextFrame.worldSpeech.text = chopperAttentionCue.text;
      nextFrame.worldSpeech.worldPosition = chopperAttentionCue.worldPosition;

      if (chopperAttentionCueRuntime.consumeSoundCycle(chopperAttentionCue.cycleId)) {
        playSoundEvent(SOUND_EVENT_IDS.CHOPPER_VOICE);
      }
    }

    if (shouldShowSolarStationPlacementPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "placement",
        target: "solarStation",
        valid: solarStationPlacementPreview.valid,
        text: solarStationPlacementPreview.valid ?
          resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState) :
          getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
        worldPosition: solarStationPlacementPreview.snappedPosition
      });
    } else if (shouldShowDestroyableObjectPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "destroyableObject",
        text: destroyableObjectPrompt.promptCopy,
        worldPosition:
          destroyableObjectPrompt.worldPosition ||
          destroyableObjectPrompt.target?.worldPosition ||
          destroyableObjectPrompt.target?.position ||
          session.playerCharacter.getPosition()
      });
    } else if (shouldShowGreenhousePlacementPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "placement",
        target: "greenhouse",
        valid: greenhousePlacementPreview.valid,
        text: greenhousePlacementPreview.valid ?
          resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState) :
          getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
        worldPosition: greenhousePlacementPreview.snappedPosition
      });
    } else if (shouldShowCampfirePlacementPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "placement",
        target: "trainHouse",
        valid: campfirePlacementPreview.valid,
        text: campfirePlacementPreview.valid ?
          resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState) :
          getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
        worldPosition: campfirePlacementPreview.snappedPosition
      });
    } else if (shouldShowLeafDenKitPlacementPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "placement",
        target: "houseKit",
        valid: leafDenKitPlacementPreview.valid,
        text: formatHabitatSiteChoicePrompt({
          siteChoice: leafDenKitPlacementPreview.siteChoice,
          placePrompt: resolveInputPrompt(UI_PROMPT_ACTION.PLACE, inputModalityState),
          clearPrompt: getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_BLOCKED),
          powerPrompt: getColonyFeedbackPrompt(COLONY_FEEDBACK_IDS.WORLD_PROMPT_NEEDS_POWER)
        }),
        worldPosition: leafDenKitPlacementPreview.snappedPosition
      });
    } else if (shouldShowPendingPlacementPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "placementIntent",
        target: pendingPlacementIntent?.placeableId || pendingPlacementIntent?.itemId || "placement",
        valid: pendingPlacementIntent?.blockedReason !== "needs-solar-station",
        text: getPendingPlacementWorldPromptText(
          pendingPlacementIntent,
          nearbyHarvestTarget,
          inputModalityState
        ),
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowWorkbenchRotationPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "workbenchRotation",
        text: workbenchRotationPrompt,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowFreeBlockBuildCostPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: freeBlockBuildCostMarker.affordable ? "buildCost" : "buildCostMissing",
        text: freeBlockBuildCostMarker.text,
        worldPosition: freeBlockBuildCostMarker.worldPosition
      });
    } else if (shouldShowPlayerCounterPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "counter",
        text: playerCounterPromptText,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowFieldMoveSwitchPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "fieldMoveSwitch",
        html: fieldMoveSwitchPrompt.html,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowSquirtleChargingPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "charging",
        companionId: "squirtle",
        abilityId: "waterGun",
        worldPosition: squirtleChargingPosition
      });
    } else if (shouldShowInvalidLeafageUsePrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "invalidMoveTarget",
        abilityId: "leafage",
        message: LEAFAGE_INVALID_TARGET_PROMPT_TEXT,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowInvalidFireUsePrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "invalidMoveTarget",
        abilityId: "fire",
        message: FIRE_INVALID_TARGET_PROMPT_TEXT,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowTransientWorldPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "transientNotice",
        text: transientNoticeRoute.worldPromptMessage,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowDryGrassHydroPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "text",
        text: dryGrassHydroPromptText,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowRunBreadcrumbPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "text",
        text: runBreadcrumbPromptText,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowPlayerInteractionPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "text",
        text: playerInteractionPromptText,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowRepairBoxPrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "repairBox",
        text: nearbyRepairBoxPrompt.text,
        worldPosition: nearbyRepairBoxPrompt.worldPosition
      });
    } else if (shouldShowLeafageFirstUsePrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "firstUse",
        abilityId: "leafage",
        text: leafageEquipped ? LEAFAGE_USE_PROMPT_TEXT : LEAFAGE_SWITCH_PROMPT_TEXT,
        worldPosition: session.playerCharacter.getPosition()
      });
    } else if (shouldShowWaterGunFirstUsePrompt) {
      setFrameWorldPrompt(nextFrame, {
        kind: "firstUse",
        abilityId: "waterGun",
        text: WATER_GUN_FIRST_USE_PROMPT_TEXT,
        worldPosition: session.playerCharacter.getPosition()
      });
    }

    if (nearbyDryGrassHintTarget && session.playerCharacter) {
      nextFrame.dryGrassHint.visible = true;
      nextFrame.dryGrassHint.targetId = nearbyDryGrassHintTarget.targetId;
      nextFrame.dryGrassHint.worldPosition =
        nearbyDryGrassHintTarget.worldPosition || session.playerCharacter.getPosition();
    }

    if (solarStationPlacementGroundCell) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.markedGroundCells.push(
        ...solarStationPowerRadiusGroundCells,
        ...solarStationPlacementGroundCells
      );
    } else if (greenhousePlacementGroundCell) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.markedGroundCells.push(
        ...greenhousePlacementGroundCells
      );
    } else if (campfirePlacementGroundCell) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.markedGroundCells.push(
        ...campfirePlacementGroundCells
      );
    } else if (leafDenKitPlacementGroundCell) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.markedGroundCells.push(
        ...solarStationPowerRadiusGroundCells,
        ...leafDenKitPlacementGroundCells
      );
    } else if (workbenchRotationGroundCell) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.groundCell = workbenchRotationGroundCell;
    } else if (activeFireGroundCell) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.groundCell = activeFireGroundCell;
    } else if (shouldShowGroundCellHighlight) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.groundCell = {
        ...highlightedGroundCell,
        highlightTargetState: highlightedGroundCellTargetState,
        highlightAbilityId: highlightedGroundCellAbilityId
      };
    }

    if (markedActionGroundCells.length) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.markedGroundCells.push(...markedActionGroundCells);
      nextFrame.groundCellHighlight.pulsePhase = markedGroundCellPulsePhase;
    }

    if (groundActionFeedbackFrame) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.markedGroundCells.push(
        ...groundActionFeedbackFrame.markedGroundCells
      );
      nextFrame.groundCellHighlight.pulsePhase = groundActionFeedbackFrame.pulsePhase;
      nextFrame.groundCellHighlight.actionPulseGroundCell = {
        ...groundActionFeedbackFrame.groundCell,
        highlightAbilityId: groundActionFeedbackFrame.abilityId
      };
      nextFrame.groundCellHighlight.actionPulsePhase = groundActionFeedbackFrame.pulsePhase;
      nextFrame.groundCellHighlight.actionPulseAbilityId = groundActionFeedbackFrame.abilityId;
    }

    if (fieldToolTargetPulseFrame) {
      nextFrame.groundCellHighlight.visible = true;
      nextFrame.groundCellHighlight.actionPulseGroundCell = {
        ...fieldToolTargetPulseFrame.groundCell,
        highlightAbilityId: fieldToolTargetPulseFrame.abilityId,
        highlightPulseScale: fieldToolTargetPulseFrame.scale,
        highlightPulseBrightness: fieldToolTargetPulseFrame.brightness
      };
      nextFrame.groundCellHighlight.actionPulsePhase = fieldToolTargetPulseFrame.progress;
      nextFrame.groundCellHighlight.actionPulseAbilityId = fieldToolTargetPulseFrame.abilityId;
    }

    const questCompletionPop = gameplay.getQuestCompletionPop?.();
    if (
      questCompletionPop?.text &&
      session.playerCharacter &&
      !gameplayOpeningCameraLocked &&
      !cinematicActive &&
      !tutorialActive &&
      !pokedexModalOpen
    ) {
      nextFrame.taskPop.visible = true;
      nextFrame.taskPop.text = questCompletionPop.text;
      nextFrame.taskPop.worldPosition = session.playerCharacter.getPosition();
    }

    // Render snapshot preparation.
    if (Array.isArray(session.tallGrassInstances)) {
      session.tallGrassInstances.length = 0;
    }
    if (Array.isArray(session.leafageGardenInstances)) {
      session.leafageGardenInstances.length = 0;
    }
    if (Array.isArray(session.leafageNativeTreeInstances)) {
      session.leafageNativeTreeInstances.length = 0;
    }
    if (Array.isArray(session.deadGrassInstances)) {
      session.deadGrassInstances.length = 0;
    }

    const grassBendPlayerPosition =
      session.playerCharacter && !cinematicActive ?
        session.playerCharacter.getPosition() :
        null;
    const natureRenderCenter = camera.getPose?.()?.target || grassBendPlayerPosition;
    const grassCollisionObjects = getGrassCollisionObjects();
    const selectedRepairBoxParticleTarget = getSelectedRepairBoxParticleTarget();
    const repairBoxRevealParticleTarget = getRepairBoxRevealParticleTarget();
    let shouldShowRepairBoxRustlingParticles = false;

    for (const groundGrassPatch of session.groundGrassPatches) {
      const hasRustlingEncounter =
        groundGrassPatch.state === "alive" &&
        (
          (
            groundGrassPatch.cellId === controls.storyState.flags.rustlingGrassCellId &&
            !controls.storyState.flags.bulbasaurRevealed
          ) ||
          (
            groundGrassPatch.cellId === controls.storyState.flags.charmanderRustlingGrassCellId &&
            !controls.storyState.flags.charmanderRevealed
          ) ||
          (
            groundGrassPatch.cellId === controls.storyState.flags.timburrRustlingGrassCellId &&
            !controls.storyState.flags.timburrRevealed
          )
        );
      const shouldRustleGrass = false;
      const rustleOffset = shouldRustleGrass ? Math.sin(now * 0.024) * 0.11 : 0;
      const standardAliveGrassModelAvailable = Boolean(
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId !== "garden1" &&
        groundGrassPatch.leafageObjectId !== "nativeTree" &&
        session.tallGrassModel &&
        Array.isArray(session.tallGrassInstances)
      );
      const gardenGrassModelAvailable = Boolean(
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId === "garden1" &&
        session.leafageGardenModel &&
        Array.isArray(session.leafageGardenInstances)
      );
      const nativeTreeModelAvailable = Boolean(
        groundGrassPatch.state === "alive" &&
        groundGrassPatch.leafageObjectId === "nativeTree" &&
        session.leafageNativeTreeModel &&
        Array.isArray(session.leafageNativeTreeInstances)
      );
      const deadGrassModelAvailable = Boolean(
        groundGrassPatch.state !== "alive" &&
        session.deadGrassModel &&
        Array.isArray(session.deadGrassInstances)
      );
      const grassBillboardScaleX = Number(groundGrassPatch.size?.[0]) || 1;
      const grassBillboardScaleY = Number(groundGrassPatch.size?.[1]) || grassBillboardScaleX;
      const canUseGrassBillboardFallback =
        standardAliveGrassModelAvailable ||
        deadGrassModelAvailable ||
        (!gardenGrassModelAvailable && !nativeTreeModelAvailable);
      const patchPrepareDistance = canUseGrassBillboardFallback ?
        NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE :
        NATURE_PATCH_MODEL_PREPARE_DISTANCE;
      if (
        !hasRustlingEncounter &&
        !isWorldPositionWithinRenderDistance(
          groundGrassPatch.position,
          natureRenderCenter,
          patchPrepareDistance
        )
      ) {
        continue;
      }

      const playerBend = getGrassPlayerBend(groundGrassPatch, grassBendPlayerPosition);
      const grassRevivalScale = getNatureRevivalScale(
        session.natureRevivalEffects,
        groundGrassPatch.id
      );
      const grassAlpha = getGrassObjectCollisionAlpha(
        groundGrassPatch,
        grassCollisionObjects
      );
      const shouldUseGrassModelLod =
        hasRustlingEncounter ||
        isWorldPositionWithinRenderDistance(
          groundGrassPatch.position,
          natureRenderCenter,
          NATURE_PATCH_GRASS_MODEL_LOD_DISTANCE
        );
      const aliveGrassModelAvailable = Boolean(
        standardAliveGrassModelAvailable && shouldUseGrassModelLod
      );
      const leafageGardenModelAvailable = gardenGrassModelAvailable;
      const leafageNativeTreeModelAvailable = nativeTreeModelAvailable;
      const nearDeadGrassModelAvailable = Boolean(
        deadGrassModelAvailable && shouldUseGrassModelLod
      );

      if (leafageGardenModelAvailable) {
        session.leafageGardenInstances.push({
          id: `leafage-garden-${groundGrassPatch.id}`,
          offset: [
            groundGrassPatch.position[0] + rustleOffset,
            groundGrassPatch.position[1],
            groundGrassPatch.position[2]
          ],
          scale: getTallGrassInstanceScale(
            session.leafageGardenModel,
            groundGrassPatch,
            grassRevivalScale
          ) * (session.leafageGardenModelScale || 1),
          alpha: grassAlpha,
          yaw: getTallGrassYaw(groundGrassPatch) + (session.leafageGardenModelFaceYawOffset || 0),
          swayStrength: 0
        });
      } else if (leafageNativeTreeModelAvailable) {
        session.leafageNativeTreeInstances.push({
          id: `leafage-native-tree-${groundGrassPatch.id}`,
          offset: [
            groundGrassPatch.position[0] + rustleOffset,
            groundGrassPatch.position[1],
            groundGrassPatch.position[2]
          ],
          scale: getTallGrassInstanceScale(
            session.leafageNativeTreeModel,
            groundGrassPatch,
            grassRevivalScale
          ) * (session.leafageNativeTreeModelScale || 1),
          alpha: grassAlpha,
          yaw: getTallGrassYaw(groundGrassPatch) + (session.leafageNativeTreeModelFaceYawOffset || 0),
          swayStrength: 0
        });
      } else if (aliveGrassModelAvailable) {
        session.tallGrassInstances.push({
          id: `tall-grass-${groundGrassPatch.id}`,
          offset: [
            groundGrassPatch.position[0] + rustleOffset + playerBend.offsetX,
            groundGrassPatch.position[1],
            groundGrassPatch.position[2] + playerBend.offsetZ
          ],
          scale: getTallGrassInstanceScale(
            session.tallGrassModel,
            groundGrassPatch,
            grassRevivalScale
          ),
          alpha: grassAlpha,
          yaw: getTallGrassYaw(groundGrassPatch),
          swayStrength: getTallGrassSway(groundGrassPatch, shouldRustleGrass, now) + playerBend.swayStrength
        });
      } else if (nearDeadGrassModelAvailable) {
        session.deadGrassInstances.push({
          id: `dead-grass-${groundGrassPatch.id}`,
          offset: [
            groundGrassPatch.position[0] + rustleOffset + playerBend.offsetX,
            groundGrassPatch.position[1],
            groundGrassPatch.position[2] + playerBend.offsetZ
          ],
          scale: getTallGrassInstanceScale(
            session.deadGrassModel,
            groundGrassPatch,
            grassRevivalScale
          ),
          alpha: grassAlpha,
          yaw: getTallGrassYaw(groundGrassPatch),
          swayStrength: playerBend.swayStrength
        });
      } else {
        nextFrame.render.grassBillboards.push({
          texture: groundGrassPatch.state === "alive" ?
            session.greenGrassTexture :
            session.deadGrassTexture,
          position: [
            groundGrassPatch.position[0] + rustleOffset + playerBend.offsetX,
            groundGrassPatch.position[1],
            groundGrassPatch.position[2] + playerBend.offsetZ
          ],
          size: [
            grassBillboardScaleX * grassRevivalScale,
            grassBillboardScaleY * grassRevivalScale
          ],
          alpha: grassAlpha
        });
      }

      if (hasRustlingEncounter) {
        shouldShowRepairBoxRustlingParticles = true;
      }
    }

    appendRebirthOfNatureGhostTree(session, controls.storyState, now);

    appendLandscapeCutEffectRenderables(nextFrame);

    if (repairBoxRevealParticleTarget) {
      nextFrame.render.genericBillboards.push(
        ...getRepairBoxRevealRayBillboards({
          target: repairBoxRevealParticleTarget,
          texture: session.natureRevivalSparkTexture,
          now,
          uvRect: rendering.fullUvRect,
          clamp01,
          config: BULBASAUR_REVEAL_BOX_RAY_BILLBOARD_CONFIG
        }),
        ...getRustlingGrassParticleBillboards(
          repairBoxRevealParticleTarget,
          session.natureRevivalSparkTexture,
          now,
          rendering.fullUvRect
        )
      );
    } else if (shouldShowRepairBoxRustlingParticles && selectedRepairBoxParticleTarget) {
      nextFrame.render.genericBillboards.push(
        ...getRustlingGrassParticleBillboards(
          selectedRepairBoxParticleTarget,
          session.natureRevivalSparkTexture,
          now,
          rendering.fullUvRect
        )
      );
    }

    for (const groundFlowerPatch of session.groundFlowerPatches) {
      if (
        !isWorldPositionWithinRenderDistance(
          groundFlowerPatch.position,
          natureRenderCenter,
          NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
        )
      ) {
        continue;
      }

      const flowerRevivalScale = getNatureRevivalScale(
        session.natureRevivalEffects,
        groundFlowerPatch.id
      );

      if (groundFlowerPatch.state === "alive") {
        getFlowerArrangementBillboards({
          groundFlowerPatch,
          texture: session.greenFlowerTexture,
          playerPosition: grassBendPlayerPosition,
          revivalScale: flowerRevivalScale,
          now,
          target: nextFrame.render.flowerBillboards
        });
        continue;
      }

      nextFrame.render.flowerBillboards.push({
        texture: session.deadFlowerTexture,
        position: groundFlowerPatch.position,
        size: groundFlowerPatch.size.map((value) => value * flowerRevivalScale)
      });
    }

    nextFrame.render.woodTexture = session.woodTexture;
    nextFrame.render.woodDrops = session.woodDrops.filter((drop) => {
      return (
        drop?.itemId !== LEAVES_ITEM_ID &&
        !drop.collected &&
        isWorldPositionWithinRenderDistance(
          drop.position,
          natureRenderCenter,
          NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
        )
      );
    });
    nextFrame.render.genericBillboards.push(
      ...woodCollectPopRuntime.getBillboards(session.woodTexture, rendering.fullUvRect)
    );
    nextFrame.render.genericBillboards.push(
      ...gearPickupParticleRuntime.getBillboards(session.natureRevivalSparkTexture, rendering.fullUvRect)
    );
    nextFrame.render.genericBillboards.push(
      ...getLeafDropBillboards({
        fieldDrops: session.woodDrops,
        texture: session.leavesTexture,
        uvRect: rendering.fullUvRect,
        renderCenter: natureRenderCenter,
        itemId: LEAVES_ITEM_ID,
        isWorldPositionWithinRenderDistance,
        prepareDistance: NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
      })
    );
    nextFrame.render.genericBillboards.push(
      ...getLeafResourceBillboards({
        resourceNodes: session.resourceNodes,
        texture: session.leavesTexture,
        uvRect: rendering.fullUvRect,
        storyState: controls.storyState,
        renderCenter: natureRenderCenter,
        itemId: LEAVES_ITEM_ID,
        isResourceNodeActive: rendering.isResourceNodeActive,
        isWorldPositionWithinRenderDistance,
        prepareDistance: NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE,
        yOffset: LEAF_RESOURCE_BILLBOARD_Y_OFFSET,
        size: LEAF_RESOURCE_BILLBOARD_SIZE
      })
    );
    nextFrame.render.genericBillboards.push(
      ...(session.leppaBerryDrops || [])
        .filter((leppaBerryDrop) => (
          !leppaBerryDrop.collected &&
          isWorldPositionWithinRenderDistance(
            leppaBerryDrop.position,
            natureRenderCenter,
            NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE
          )
        ))
        .map((leppaBerryDrop) => ({
          texture: session.leppaBerryTexture,
          position: leppaBerryDrop.position,
          size: leppaBerryDrop.size,
          uvRect: rendering.fullUvRect
        }))
    );
    nextFrame.render.genericBillboards.push(
      ...getLeppaTreeMusicNoteBillboards({
        leppaTree: session.leppaTree,
        textures: session.leppaTreeMusicalNoteTextures,
        uvRect: rendering.fullUvRect,
        now,
        clamp01
      })
    );
    nextFrame.render.genericBillboards.push(
      ...getLeppaTreeMissionParticleBillboards({
        active: isOpeningLeppaTreeRequestActive(controls.storyState),
        leppaTree: session.leppaTree,
        texture: session.natureRevivalSparkTexture,
        uvRect: rendering.fullUvRect,
        now,
        clamp01,
        config: LEPPA_TREE_MISSION_PARTICLE_BILLBOARD_CONFIG
      })
    );
    nextFrame.render.genericBillboards.push(
      ...getSnowstormBillboards(
        session.snowstorm,
        session.snowflakeTexture,
        rendering.fullUvRect
      )
    );
    appendGameplayOpeningShipBillboards({
      billboards: nextFrame.render.genericBillboards,
      ship: session.gameplayOpeningShip,
      fallbackTexture: session.gameplayOpeningShipTexture,
      dustTexture: session.playerDustTexture,
      smokeTexture: session.gameplayOpeningShipSmokeTexture,
      flashTexture: session.gameplayOpeningShipFlashTexture,
      fullUvRect: rendering.fullUvRect
    });
    const workbenchInfoBillboard = createInteractionInfoBillboard(
      session.markerTextures?.workbench,
      WORKBENCH_POSITION,
      WORKBENCH_INFO_ICON_OFFSET,
      rendering.fullUvRect
    );
    if (workbenchInfoBillboard) {
      nextFrame.render.genericBillboards.push(workbenchInfoBillboard);
    }
    if (canShowWorldSpaceUi) {
      nextFrame.render.genericBillboards.push(
        ...getWorkbenchInteractionParticleBillboards({
          texture: session.logChairStarTexture || session.natureRevivalSparkTexture,
          uvRect: rendering.fullUvRect,
          playerPosition: session.playerCharacter?.getPosition?.(),
          now
        })
      );
    }
    if (
      session.playerCharacter &&
      session.logChairTexture &&
      controls.storyState.flags.logChairReceived &&
      !controls.storyState.flags.logChairPlaced &&
      (controls.inventory?.[LOG_CHAIR_ITEM_ID] || 0) > 0
    ) {
      const logChairPreview = buildLogChairPlacement(session.playerCharacter.getPosition());
      nextFrame.render.genericBillboards.push({
        texture: session.logChairTexture,
        position: logChairPreview.position,
        size: logChairPreview.size,
        uvRect: rendering.fullUvRect,
        alpha: LOG_CHAIR_PLACEMENT_PREVIEW_ALPHA
      });
    }
    if (session.logChair && controls.storyState.flags.logChairPlaced) {
      nextFrame.render.genericBillboards.push(
        applyPlayerPlacementSpawnToBillboard(session.logChair, {
          texture: session.logChairTexture,
          position: session.logChair.position,
          size: session.logChair.size,
          uvRect: rendering.fullUvRect
        }, deltaTime)
      );
      nextFrame.render.genericBillboards.push(
        ...getSavePointStarBillboards({
          logChair: session.logChair,
          texture: session.logChairStarTexture,
          uvRect: rendering.fullUvRect,
          now,
          clamp01,
          config: SAVE_POINT_STAR_BILLBOARD_CONFIG
        })
      );
    }
    if (session.strawBed && controls.storyState.flags.strawBedPlacedInBulbasaurHabitat) {
      nextFrame.render.genericBillboards.push({
        texture: session.strawBedTexture,
        position: session.strawBed.position,
        size: session.strawBed.size,
        uvRect: rendering.fullUvRect
      });
    }
    if (
      campfirePlacementPreview?.snappedPosition &&
      session.campfireTexture &&
      !session.campfireTrainHouseModelInstance
    ) {
      nextFrame.render.genericBillboards.push({
        texture: session.campfireTexture,
        position: campfirePlacementPreview.snappedPosition,
        size: campfirePlacementPreview.effectiveSize || campfirePlacementPreview.size,
        uvRect: campfirePlacementPreview.uvRect || rendering.fullUvRect,
        alpha: campfirePlacementPreview.valid ? 0.58 : 0.36
      });
    }
    if (
      session.campfire &&
      controls.storyState.flags.campfireSpatOut &&
      !session.campfireTrainHouseModelInstance
    ) {
      if (controls.storyState.flags.charmanderCampfireLit) {
        nextFrame.render.genericBillboards.push({
          texture: session.campfireTexture,
          position: session.campfire.position,
          size: session.campfire.size,
          uvRect: rendering.fullUvRect
        });
      } else {
        nextFrame.render.genericBillboards.push(
          ...getCampfireWoodPileBillboards(
            session.campfire,
            session.woodTexture,
            rendering.fullUvRect
          )
        );
      }
    }
    if (session.leafDen && controls.storyState.flags.leafDenKitPlaced) {
      const leafDenBuilt = Boolean(controls.storyState.flags.leafDenBuilt);
      const shouldRenderLeafDenBillboard = !session.leafDenModelInstance;

      if (shouldRenderLeafDenBillboard) {
        nextFrame.render.genericBillboards.push(
          applyPlayerPlacementSpawnToBillboard(session.leafDen, {
            texture: session.leafDenTexture,
            position: session.leafDen.position,
            size: [2.55, 1.85],
            uvRect: rendering.fullUvRect,
            rotation: Number(session.leafDen.yaw || 0)
          }, deltaTime)
        );
      }
      if (
        !leafDenBuilt &&
        session.leafDen?.interactionBox?.offset
      ) {
        const interactionBoxBillboard = createInteractionInfoBillboard(
          session.markerTextures?.[session.leafDen.interactionBox.markerKey] ||
            session.markerTextures?.workbench,
          session.leafDen.position,
          session.leafDen.interactionBox.offset,
          rendering.fullUvRect
        );
        if (interactionBoxBillboard) {
          nextFrame.render.genericBillboards.push(interactionBoxBillboard);
        }
      }
      nextFrame.render.genericBillboards.push(
        ...getLeafDenConstructionBillboards(rendering.fullUvRect, now * 0.001)
      );
    }
    nextFrame.render.genericBillboards.push(
      ...getConstructionCloudBurstBillboards(rendering.fullUvRect, now * 0.001)
    );
    if (session.dittoFlag && controls.storyState.flags.dittoFlagPlacedOnHouse) {
      nextFrame.render.genericBillboards.push(
        applyPlayerPlacementSpawnToBillboard(session.dittoFlag, {
          texture: session.dittoFlagTexture,
          position: session.dittoFlag.position,
          size: session.dittoFlag.size,
          uvRect: rendering.fullUvRect
        }, deltaTime)
      );
    }
    if (controls.storyState.flags.leafDenInteriorEntered) {
      nextFrame.render.genericBillboards.push(
        ...(session.leafDenFurniture || []).map((furniture) => (
          applyPlayerPlacementSpawnToBillboard(furniture, {
            texture: furniture.kind === "strawBed" ?
              session.strawBedTexture :
              furniture.kind === "campfire" ?
                session.campfireTexture :
                session.logChairTexture,
            position: furniture.position,
            size: furniture.size,
            uvRect: rendering.fullUvRect
          }, deltaTime)
        ))
      );
    }
    if (
      session.pokemonCenterPc &&
      controls.storyState.flags.ruinedPokemonCenterInspected
    ) {
      nextFrame.render.genericBillboards.push({
        texture: session.pokemonCenterPc.texture,
        position: session.pokemonCenterPc.position,
        size: session.pokemonCenterPc.size,
        uvRect: rendering.fullUvRect
      });
      const pokemonCenterPcInfoBillboard = createInteractionInfoBillboard(
        session.markerTextures?.pokemonCenterPc,
        session.pokemonCenterPc.position,
        POKEMON_CENTER_PC_INFO_ICON_OFFSET,
        rendering.fullUvRect
      );
      if (pokemonCenterPcInfoBillboard) {
        nextFrame.render.genericBillboards.push(pokemonCenterPcInfoBillboard);
      }
    }
    if (session.challengeBoulder && controls.storyState.flags.boulderChallengeAvailable) {
      nextFrame.render.genericBillboards.push({
        texture: session.challengeBoulder.texture,
        position: session.challengeBoulder.position,
        size: session.challengeBoulder.size,
        uvRect: rendering.fullUvRect
      });
    }
    if (session.billCameo?.visible && session.billCameo.texture) {
      nextFrame.render.genericBillboards.push({
        texture: session.billCameo.texture,
        position: session.billCameo.position,
        size: session.billCameo.size,
        uvRect: rendering.fullUvRect
      });
    }
    if (session.actTwoRepairPlant) {
      const repairPlantTexture = session.actTwoRepairPlant.fixed ?
        session.repairPlantFixedTexture :
        session.repairPlantBrokenTexture;

      nextFrame.render.genericBillboards.push({
        texture: repairPlantTexture,
        position: session.actTwoRepairPlant.position,
        size: session.actTwoRepairPlant.size,
        uvRect: rendering.fullUvRect
      });
    }

    if (canShowWorldSpaceUi) {
      const missionTargetPositions = getMissionTargetPositions(activeQuest, controls.storyState);
      for (const missionTargetPosition of missionTargetPositions) {
        const missionTargetIndicatorBillboard = createMissionTargetIndicatorBillboard({
          texture: session.missionTargetIndicatorTexture,
          targetPosition: missionTargetPosition,
          now,
          uvRect: rendering.fullUvRect
        });

        if (missionTargetIndicatorBillboard) {
          nextFrame.render.genericBillboards.push(missionTargetIndicatorBillboard);
        }
      }
    }

    if (session.actTwoSquirtle?.modelInstance) {
      const squirtle = session.actTwoSquirtle;
      const visibleActTwoSquirtle =
        squirtle.visible ||
        squirtle.recovered ||
        actTwoTutorial.hasStarted() ||
        controls.storyState.questIndex >= 1;
      const assembledActTwoSquirtle =
        squirtle.recovered || squirtle.assemblyState === "assembled";
      syncSquirtleModelInstance();
      squirtle.modelInstance.active = Boolean(
        (visibleActTwoSquirtle && assembledActTwoSquirtle) ||
        session.squirtleWaterGunAction ||
        isSquirtleWaterCharging()
      );
    }
    const squirtleWaterStamina = getSquirtleWaterStaminaState();
    const shouldShowSquirtleStamina =
      controls.playerSkills?.waterGun &&
      (
        activeMoveId === "waterGun" ||
        session.squirtleWaterGunAction ||
        isSquirtleWaterCharging() ||
        squirtleWaterStamina.current < squirtleWaterStamina.max
      );
    if (shouldShowSquirtleStamina) {
      nextFrame.render.genericBillboards.push(
        ...getSquirtleStaminaBillboards(
          session.squirtleWaterStaminaFillTexture,
          rendering.fullUvRect
        )
      );
    }
    const charmanderCarbonEnergy = getCharmanderCarbonEnergyState();
    const shouldShowCharmanderCarbon =
      controls.playerSkills?.fire &&
      (
        activeMoveId === "fire" ||
        session.charmanderFireAction ||
        charmanderCarbonEnergy.current < 1 ||
        charmanderCarbonEnergy.visualCurrent < 1
      );
    if (shouldShowCharmanderCarbon) {
      nextFrame.render.genericBillboards.push(
        ...getCharmanderCarbonBillboards({
          fillTexture: session.charmanderCarbonFillTexture,
          backTexture: session.squirtleWaterStaminaBackTexture,
          uvRect: rendering.fullUvRect
        })
      );
    }
    nextFrame.render.genericBillboards.push(
      ...getSquirtleWaterGunBillboards(
        session.squirtleWaterGunAction,
        session.squirtleWaterSprayTexture,
        rendering.fullUvRect
      )
    );
    nextFrame.render.genericBillboards.push(
      ...getCharmanderFireBillboards(
        session.charmanderFireAction,
        session.charmanderFireTexture || session.campfireTexture,
        rendering.fullUvRect
      )
    );
    nextFrame.render.genericBillboards.push(
      ...getBulbasaurLeafageBillboards(
        session.bulbasaurLeafageAction,
        session.natureRevivalSparkTexture,
        rendering.fullUvRect
      )
    );
    nextFrame.render.genericBillboards.push(
      ...getSquirtleChargingBillboards(
        session.squirtleChargingParticleTexture,
        rendering.fullUvRect,
        now
      )
    );
    if (!session.bulbasaurEncounter?.modelInstance) {
      nextFrame.render.genericBillboards.push({
        texture: session.bulbasaurEncounter?.visible ? session.bulbasaurEncounter.texture : null,
        position: session.bulbasaurEncounter?.visible ? session.bulbasaurEncounter.position : null,
        size: session.bulbasaurEncounter?.visible ? session.bulbasaurEncounter.size : null,
        uvRect: rendering.fullUvRect
      });
    }
    nextFrame.render.genericBillboards.push(
      ...getBulbasaurInteractionRadiusGizmoBillboards({
        encounter: session.bulbasaurEncounter,
        texture: session.natureRevivalSparkTexture,
        uvRect: rendering.fullUvRect,
        now,
        config: BULBASAUR_INTERACTION_RADIUS_GIZMO_CONFIG
      })
    );
    if (!session.charmanderEncounter?.modelInstance) {
      nextFrame.render.genericBillboards.push({
        texture: session.charmanderEncounter?.visible ? session.charmanderEncounter.texture : null,
        position: session.charmanderEncounter?.visible ? session.charmanderEncounter.position : null,
        size: session.charmanderEncounter?.visible ? session.charmanderEncounter.size : null,
        uvRect: rendering.fullUvRect
      });
    }
    if (!session.timburrEncounter?.modelInstance) {
      nextFrame.render.genericBillboards.push({
        texture: session.timburrEncounter?.visible ? session.timburrEncounter.texture : null,
        position: session.timburrEncounter?.visible ? session.timburrEncounter.position : null,
        size: session.timburrEncounter?.visible ? session.timburrEncounter.size : null,
        uvRect: rendering.fullUvRect
      });
    }
    nextFrame.render.genericBillboards.push(
      ...getNatureRevivalBillboards(
        session.natureRevivalEffects,
        session.natureRevivalSparkTexture,
        rendering.fullUvRect
      )
    );
    appendTreeRevivalLeafBurstBillboards(nextFrame);
    if (rendering.debugColliders) {
      const debugColliders = [
        ...(session.elevatedTerrainColliders || []),
        ...getInteractionDebugColliders()
      ];
      nextFrame.colliderGizmos.visible = true;
      nextFrame.colliderGizmos.colliders = debugColliders;
      nextFrame.render.genericBillboards.push(
        ...getColliderGizmoBillboards({
          colliders: debugColliders,
          textures: session.colliderGizmoTextures
        })
      );
    }
    nextFrame.render.characters = {
      storyState: controls.storyState,
      playerCharacter: session.playerCharacter,
      npcActors: session.npcActors,
      characterTextures: session.characterTextures,
      isNpcActive: rendering.isNpcActive
    };

    nextFrame.tutorial.active = true;
    nextFrame.tutorial.playerPosition = session.playerCharacter?.getPosition() || null;
    nextFrame.tutorial.deltaTime = deltaTime;
    // Commit the frame after all snapshot channels are populated.
    frameRuntime.commitFrame();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
