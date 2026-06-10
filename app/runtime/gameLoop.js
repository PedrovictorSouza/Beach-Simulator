import { createGameLoopFrameClock } from "./gameLoopFrameClock.js";
import { createGameLoopFrameRuntime } from "./gameLoopFrameRuntime.js";
import {
  isRevealBoxBotVisible,
  revealBotAtRepairPosition as revealBotAtRepairPositionWithConfig,
  setRevealBoxBotVisible,
  updateBotRevealFall as updateBotRevealFallWithConfig
} from "./botRevealMotion.js";
import { createCameraDebugRuntime } from "./camera/cameraDebugRuntime.js";
import { createCameraDebugFrameState } from "./camera/cameraDebugFrameState.js";
import { getCampfireWoodPileBillboards } from "./campfireWoodPileBillboards.js";
import { createChopperAttentionCueRuntime, resolveChopperAttentionCue } from "./companions/chopperAttentionCueRuntime.js";
import {
  getConstructionCloudBurstBillboards as getConstructionCloudBurstBillboardsWithConfig,
  getLeafDenConstructionBillboards as getLeafDenConstructionBillboardsWithConfig
} from "./construction/constructionBillboards.js";
import {
  getActiveConstructionCloudBursts as getActiveConstructionCloudBurstsWithSession,
  syncConstructionCloudBurstEffects as syncConstructionCloudBurstEffectsWithSession,
  syncLeafDenConstructionClouds as syncLeafDenConstructionCloudsWithSession
} from "./construction/constructionCloudEffects.js";
import {
  buildFoundationBuildZoneBlockers as buildFoundationBuildZoneBlockersWithSources,
  canStackFreeBlockPlacement as canStackFreeBlockPlacementFromProgress,
  applyFoundationBuildZoneCompleteEffects,
  createUnavailableFoundationBuildZonePlacementResult,
  createUnavailableFoundationBuildZoneValidation,
  findAvailableBuilderTutorialFoundationBuildZone as findAvailableBuilderTutorialFoundationBuildZoneWithConfig,
  getBuilderTutorialFoundationZoneSignature,
  getFoundationBuildZoneProgressCount as getFoundationBuildZoneProgressCountFromState,
  getSavedBuilderTutorialFoundationOriginCell as getSavedBuilderTutorialFoundationOriginCellFromFlags,
  isBuilderTutorialFoundationBuildZoneBlocked as isBuilderTutorialFoundationBuildZoneBlockedWithBlockers,
  isFoundationFreeBlockAllowedInZone as isFoundationFreeBlockAllowedInZoneWithState,
  resolveActiveBuilderTutorialFoundationBuildZone,
  saveBuilderTutorialFoundationOriginCell as saveBuilderTutorialFoundationOriginCellToFlags,
  shouldShowFoundationBuildZone as shouldShowFoundationBuildZoneWithState
} from "./construction/foundationBuildZone.js";
import {
  findNearbyFreeBlockTarget,
  spawnFreeBlockRemovalDrops as spawnFreeBlockRemovalDropsWithConfig
} from "./construction/freeBlockRemoval.js";
import {
  buildFreeBlockPreviewDebug,
  syncFreeBlockPreviewInstance
} from "./construction/freeBlockPreview.js";
import {
  getLeafDenConstructionProgress as getLeafDenConstructionProgressFromState,
  isLeafDenBusyCompanionTarget as isLeafDenBusyCompanionTargetFromState,
  isLeafDenConstructionActive as isLeafDenConstructionActiveFromState
} from "./construction/leafDenConstructionState.js";
import {
  ensurePlayerHouseModelInstances as ensurePlayerHouseModelInstancesWithSession,
  syncLeafDenModelInstance as syncLeafDenModelInstanceWithSession,
  syncPlayerHouseModelInstances as syncPlayerHouseModelInstancesWithSession
} from "./construction/constructionHouseModelInstances.js";
import {
  moveConstructionHelperToLeafDen as moveConstructionHelperToLeafDenWithConfig
} from "./construction/constructionHelperMotion.js";
import {
  cancelPendingWorkbenchPlacementIntent,
  hasPendingWorkbenchPlacementIntent,
  resolveFramePendingPlacementIntent
} from "./construction/pendingPlacementIntent.js";
import {
  buildFreeBlockBuildCostMarker,
  getFreeBlockInvalidPlacementNotice,
  getFreeBlockPlacementNotice,
  resolveFramePlacementPromptState
} from "./construction/placementPreviewPrompts.js";
import {
  applyPlayerPlacementSpawnToBillboard,
  applyPlayerPlacementSpawnToModelInstance,
  updateSolarStationSpawnEffect
} from "./construction/playerPlacementSpawnEffect.js";
import {
  buildPlacedSolarStationPowerRadiusGroundCells as buildPlacedSolarStationPowerRadiusGroundCellsWithConfig,
  buildSolarStationPowerRadiusGroundCells as buildSolarStationPowerRadiusGroundCellsWithConfig,
  buildSolarStationPreviewPowerRadiusGroundCells as buildSolarStationPreviewPowerRadiusGroundCellsWithConfig,
  getSolarStationPowerPosition as getSolarStationPowerPositionWithSession,
  getSolarStationPowerRadius as getSolarStationPowerRadiusWithConfig,
  getSolarStationPreviewPowerRadius as getSolarStationPreviewPowerRadiusWithConfig,
  isInsideSolarStationPowerRadius as isInsideSolarStationPowerRadiusWithConfig
} from "./construction/solarStationPowerRadius.js";
import {
  getSolarStationPlacementBlockers as getSolarStationPlacementBlockersWithConfig,
  isSolarStationPlacementBlocked as isSolarStationPlacementBlockedWithConfig
} from "./construction/solarStationPlacementBlockers.js";
import {
  getLeppaTreePlacementBlockerSize as getLeppaTreePlacementBlockerSizeWithConfig,
  getTreePlacementBlockerSize as getTreePlacementBlockerSizeWithConfig,
  getWorldObjectPlacementBlockers as getWorldObjectPlacementBlockersWithConfig
} from "./construction/worldObjectPlacementBlockers.js";
import {
  buildFoundationBuildZoneGroundCells as buildFoundationBuildZoneGroundCellsWithConfig,
  buildFoundationCompletionInteriorGroundCells as buildFoundationCompletionInteriorGroundCellsWithConfig,
  buildFreeBlockFeedbackGroundCell as buildFreeBlockFeedbackGroundCellWithConfig,
  buildPlacementPreviewFootprintCells,
  buildSolarStationFieldMarkedGroundCells as buildSolarStationFieldMarkedGroundCellsWithConfig,
  doPlacementRectsOverlap,
  getFoundationBuildZoneWorldRect as getFoundationBuildZoneWorldRectWithGrid,
  getFreeBlockBuildZoneCenterPosition as getFreeBlockBuildZoneCenterPositionWithConfig,
  getFreeBlockCellWorldPosition as getFreeBlockCellWorldPositionWithGrid,
  getPlacementPreviewFootprintWorldSize,
  getPlacementCollisionSize,
  getPlacementRect,
  getRotatedPlacementSize as getRotatedPlacementSizeWithConfig,
  getSnappedPlacementPreviewPosition,
  hasFinitePlacementBounds,
  isWorldPositionOnFreeBlockCell,
  normalizePlacementYaw
} from "./construction/placementGeometry.js";
import {
  getNewlyCollectedDropPositions,
  getNewlyCollectedResourcePositions,
  snapshotAvailableWoodDrops,
  snapshotCollectibleSources
} from "./collectibleSourceSnapshots.js";
import { createCompanionFollowDirectionRuntime } from "./companions/companionFollowDirectionRuntime.js";
import {
  isCompanionFollowFormationMember,
  resolveCompanionFollowFormationIndex,
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "./companions/companionFollowMotion.js";
import {
  createCompanionLostHintRuntime,
  resolveWaterGunCompanionLostHint
} from "./companions/companionLostHintRuntime.js";
import {
  getCharmanderCarbonBillboards,
  getSquirtleChargingBillboards,
  getSquirtleStaminaBillboards
} from "./companions/companionStatusBillboards.js";
import {
  createFoundationBuildZoneCameraFocusPose,
  createFoundationBuildZoneCameraFocusRuntime
} from "./camera/foundationBuildZoneCameraFocusRuntime.js";
import {
  resolveCameraInputPermissions,
  resolveCameraLookInput,
  resolveGameplayActionPermission,
  resolveGameLoopBlockers,
  resolveGroundGuidanceVisibility,
  resolveNearbyGameplayQueryPermission,
  resolvePlayerMovementPermission,
  resolveWorldSpaceUiVisibility
} from "./gameLoopFramePolicies.js";
import { getBulbasaurInteractionRadiusGizmoBillboards } from "./bulbasaurInteractionRadiusGizmoBillboards.js";
import { createFieldMoveInvalidTargetPromptRuntime } from "./fieldMoveInvalidTargetPromptRuntime.js";
import {
  resolveConstructionDisplacementPosition,
  resolveTimburrBuildBlockApproachPosition
} from "./fieldMoveRuntime/buildBlockRuntime.js";
export {
  resolveConstructionDisplacementPosition,
  resolveTimburrBuildBlockApproachPosition
} from "./fieldMoveRuntime/buildBlockRuntime.js";
import {
  resolveBulbasaurLeafageApproachPosition,
  resolveCharmanderFireApproachPosition,
  resolveSquirtleWaterGunApproachPosition
} from "./fieldMoveRuntime/fieldMoveApproachPositions.js";
import {
  getBulbasaurGrowEmitterPosition as resolveBulbasaurGrowEmitterPosition,
  getCharmanderMouthPosition as resolveCharmanderMouthPosition,
  getCharmanderWorldPosition as resolveCharmanderWorldPosition,
  getSquirtleMouthPosition as resolveSquirtleMouthPosition,
  getSquirtleWorldPosition as resolveSquirtleWorldPosition
} from "./fieldMoveRuntime/fieldMoveActorPositions.js";
import {
  getBulbasaurLeafageBillboards,
  getCharmanderFireBillboards,
  getSquirtleWaterGunBillboards
} from "./fieldMoveRuntime/fieldMoveBillboards.js";
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
import {
  getActorDebugPosition,
  getInteractionDebugColliders as getInteractionDebugCollidersWithConfig
} from "./interactionDebugColliders.js";
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
import { getMissionTargetPositionsById as getMissionTargetPositionsByIdWithConfig } from "./missionTargetPositionLookup.js";
import {
  getLogicalFacingYaw as getModelLogicalFacingYaw,
  getModelYawToward,
  getYawToward
} from "./modelFacing.js";
import { createMovementQuestRuntime } from "./movementQuestRuntime.js";
import { getMissionTargetPositions } from "./missionTargetPositions.js";
import { createPlayerModelRuntime } from "../player/playerModelMotion.js";
import { createPlayerCounterPromptRuntime } from "./playerCounterPromptRuntime.js";
import { resolveHudPromptCopy } from "./presentation/hudPromptCopy.js";
import {
  findNearbyDryGrassHintTarget,
  findNearbyDryGrassWorldPromptTarget
} from "./presentation/dryGrassPromptTargets.js";
import {
  getFieldToolWorldPromptText,
  getPendingPlacementPrompt,
  getPendingPlacementWorldPromptText,
  getPlayerInteractionWorldPromptText,
  getRunBreadcrumbWorldPromptText,
  resolveWorldPromptVisibility
} from "./presentation/worldPromptCopy.js";
import { createSupplyCounterPromptController } from "./presentation/supplyCounterPrompt.js";
import { updateStatusPopupsFrame } from "./presentation/statusPopupsFrame.js";
import { updateHudSnapshotFrame } from "./presentation/hudSnapshotFrame.js";
import { createRepairBoxMotionRuntime } from "./repairBoxMotionRuntime.js";
import {
  getRepairBoxRevealParticleTarget,
  getSelectedRepairBoxParticleTarget
} from "./repairBoxParticleTargets.js";
import { getNearbyRepairBoxPrompt } from "./repairBoxPromptTargets.js";
import { createRepairBoxRevealFlashRuntime } from "./repairBoxRevealFlashRuntime.js";
import { getRepairBoxRevealRayBillboards } from "./repairBoxRevealRayBillboards.js";
import { appendRebirthOfNatureGhostTree } from "./rebirthOfNatureGhostTree.js";
import { createRunBreadcrumbPromptRuntime } from "./runBreadcrumbPromptRuntime.js";
import { getRustlingGrassParticleBillboards } from "./rustlingGrassParticleBillboards.js";
import { getSavePointStarBillboards } from "./savePointStarBillboards.js";
import { createSnowstormFogRuntime } from "./snowstormFogRuntime.js";
import { resolveSupplyPickupViewportOrigin } from "./supplyPickupViewportOrigin.js";
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
  createWorldCellPlannerSelection,
  getWorldCellPlannerGroundCells,
  projectWorldCellPlannerGroundCell,
  resolveWorldCellPlannerPick as resolveWorldCellPlannerPickFromCandidates
} from "./worldCellPlannerPicking.js";

export {
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "./companions/companionFollowMotion.js";

import {
  BULBASAUR_LEAFAGE_ARRIVE_DISTANCE,
  BULBASAUR_LEAFAGE_CAST_DURATION,
  BULBASAUR_LEAFAGE_IMPACT_TIME,
  BULBASAUR_LEAFAGE_SPEED,
  CHARMANDER_CARBON_VISUAL_DECREASE_DURATION,
  CHARMANDER_CARBON_VISUAL_INCREASE_DURATION,
  CHARMANDER_FIRE_ARRIVE_DISTANCE,
  CHARMANDER_FIRE_IMPACT_TIME,
  CHARMANDER_FIRE_SPEED,
  CHARMANDER_FIRE_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_ARRIVE_DISTANCE,
  SQUIRTLE_WATER_GUN_BASE_LEVEL,
  SQUIRTLE_WATER_GUN_EVOLUTION_MAX_USES,
  SQUIRTLE_WATER_GUN_IMPACT_TIME,
  SQUIRTLE_WATER_GUN_MAX_SPEED_MULTIPLIER,
  SQUIRTLE_WATER_GUN_MIN_IMPACT_TIME,
  SQUIRTLE_WATER_GUN_MIN_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_SPEED,
  SQUIRTLE_WATER_GUN_SPRAY_DURATION,
  SQUIRTLE_WATER_GUN_USE_COUNT_FLAG,
  SQUIRTLE_WATER_GUN_USES_PER_LEVEL,
  SQUIRTLE_WATER_STAMINA_COST,
  SQUIRTLE_WATER_STAMINA_MAX,
  SQUIRTLE_WATER_STAMINA_RECHARGE_DURATION,
  SQUIRTLE_WATER_STAMINA_VISUAL_DECREASE_DURATION,
  SQUIRTLE_WATER_STAMINA_VISUAL_INCREASE_DURATION,
  TIMBURR_BUILD_BLOCK_ARRIVE_DISTANCE,
  TIMBURR_BUILD_BLOCK_CAST_DURATION,
  TIMBURR_BUILD_BLOCK_IMPACT_TIME,
  TIMBURR_BUILD_BLOCK_SPEED
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

export {
  cancelPendingWorkbenchPlacementIntent,
  hasPendingWorkbenchPlacementIntent
} from "./construction/pendingPlacementIntent.js";

import {
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

import {
  createFrameSnapshotController,
  setFrameWorldPrompt
} from "./frameSnapshotController.js";
import {
  consumeCameraZoomCycleRequests,
  createCameraZoomPresetController,
  restoreActiveZoomPresetOnMovement
} from "./camera/cameraZoomPresetController.js";
import { createPlacementCameraAssist } from "./camera/placementCameraAssist.js";
import { updatePlayerDustParticles } from "../session/playerDustParticles.js";
import {
  getSnowstormBillboards,
  getSnowstormFogIntensity,
  updateSnowstormParticleField
} from "../session/snowstormParticleField.js";
import { PLAYER_SPEED } from "../session/configurePlayerSpawner.js";
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
  getColonyFeedbackPrompt,
  getColonyFeedbackWorldSpeech
} from "../gameplay/colonyFeedbackContracts.js";
import {
  resolveInputPrompt,
  resolveWorkbenchRotationPrompt,
  UI_PROMPT_ACTION
} from "../ui/inputPromptResolver.js";
import {
  SANDBOTS_BOT_NAMES,
  SANDBOTS_ITEM_NAMES,
  SANDBOTS_WORLD_TERMS
} from "../story/sandbotsLexicon.js";
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
const LEAF_DEN_BUILT_ROTATION_FOOTPRINT = [
  LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT[0] * 2,
  LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT[1] * 2
];
const PLACEMENT_ROTATION_STEP = Math.PI * 0.5;
const WORKBENCH_OBJECT_ROTATE_DISTANCE = 3.2;
const WORKBENCH_OBJECT_ROTATE_TRIGGER_TILE_MARGIN = 1.425;
const LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER = 3;
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
const CHARMANDER_FOLLOW_SPEED = PLAYER_SPEED;
const CHARMANDER_FOLLOW_DISTANCE = 1.28;
const CHARMANDER_CAMPFIRE_LIGHT_DISTANCE = 1.9;
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
const WATER_GUN_FIRST_USE_PROMPT_TEXT = `Press LT to use ${SANDBOTS_BOT_NAMES.hydro}`;
const LEAFAGE_SWITCH_PROMPT_TEXT = `Press LT on dry ground, then <- / -> to select ${SANDBOTS_BOT_NAMES.grow}`;
const RUN_BREADCRUMB_PROMPT_DURATION_MS = 4200;
const SNOWSTORM_FOG_MAX_OPACITY = 0.54;
const SNOWSTORM_FOG_OPACITY_EASE = 6.2;
const LEAFAGE_USE_PROMPT_TEXT = "Use LT on green ground";
const LEAFAGE_INVALID_TARGET_PROMPT_TEXT = `Choose ${SANDBOTS_BOT_NAMES.hydro} to hydrate first`;
const LEAFAGE_INVALID_TARGET_PROMPT_DURATION_MS = 1600;
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

function getRotatedPlacementSize(size = [1, 1], yaw = 0) {
  return getRotatedPlacementSizeWithConfig(size, yaw, {
    placementRotationStep: PLACEMENT_ROTATION_STEP
  });
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

function buildSolarStationFieldMarkedGroundCells(placementTarget) {
  return buildSolarStationFieldMarkedGroundCellsWithConfig(placementTarget, {
    markedTileLimit: SOLAR_STATION_FIELD_MARKED_TILE_LIMIT
  });
}

function buildSolarStationPowerRadiusGroundCells({
  center,
  radius,
  gridConfig = null,
  gridStep = 1.425,
  idPrefix = "solar-station-power-radius"
} = {}) {
  return buildSolarStationPowerRadiusGroundCellsWithConfig({
    center,
    radius,
    gridConfig,
    gridStep,
    idPrefix,
    markedTileLimit: SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT
  });
}

function getSolarStationPreviewPowerRadius(session, preview) {
  return getSolarStationPreviewPowerRadiusWithConfig({
    session,
    preview,
    radiusMultiplier: LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER,
    gridFootprint: SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT,
    getPlacementPreviewFootprintWorldSize
  });
}

function buildSolarStationPreviewPowerRadiusGroundCells(session, preview) {
  return buildSolarStationPreviewPowerRadiusGroundCellsWithConfig({
    session,
    preview,
    radiusMultiplier: LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER,
    gridFootprint: SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT,
    markedTileLimit: SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT,
    getPlacementPreviewFootprintWorldSize
  });
}

function buildPlacedSolarStationPowerRadiusGroundCells(session, storyState) {
  return buildPlacedSolarStationPowerRadiusGroundCellsWithConfig({
    session,
    storyState,
    radiusMultiplier: LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER,
    previewFootprint: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
    markedTileLimit: SOLAR_STATION_POWER_RADIUS_MARKED_TILE_LIMIT,
    getPlacementCollisionSize
  });
}

function getTreePlacementBlockerSize(treeModel, instance) {
  return getTreePlacementBlockerSizeWithConfig({
    treeModel,
    instance,
    treeFootprint,
    treeFootprintScale: TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE,
    deadTreeFootprintScale: DEAD_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE,
    treeMinSize: TREE_PLACEMENT_BLOCKER_MIN_SIZE,
    deadTreeMinSize: DEAD_TREE_PLACEMENT_BLOCKER_MIN_SIZE
  });
}

function getLeppaTreePlacementBlockerSize(session) {
  return getLeppaTreePlacementBlockerSizeWithConfig({
    session,
    blockerSize: LEPPA_TREE_PLACEMENT_BLOCKER_SIZE,
    defaultCellSize: LEPPA_TREE_PLACEMENT_BLOCKER_DEFAULT_CELL_SIZE
  });
}

function getWorldObjectPlacementBlockers(session) {
  return getWorldObjectPlacementBlockersWithConfig({
    session,
    treeFootprint,
    treeFootprintScale: TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE,
    deadTreeFootprintScale: DEAD_TREE_PLACEMENT_BLOCKER_FOOTPRINT_SCALE,
    treeMinSize: TREE_PLACEMENT_BLOCKER_MIN_SIZE,
    deadTreeMinSize: DEAD_TREE_PLACEMENT_BLOCKER_MIN_SIZE,
    leppaTreeBlockerSize: LEPPA_TREE_PLACEMENT_BLOCKER_SIZE,
    leppaTreeDefaultCellSize: LEPPA_TREE_PLACEMENT_BLOCKER_DEFAULT_CELL_SIZE
  });
}

function getSolarStationPlacementBlockers(session, storyState) {
  return getSolarStationPlacementBlockersWithConfig({
    session,
    storyState,
    footprints: {
      greenhouse: GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      solarStation: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
      trainHouse: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      houseKit: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
      houseBuilt: LEAF_DEN_BUILT_ROTATION_FOOTPRINT
    },
    createPlayerConstructionPlacementBlockers,
    getWorldObjectPlacementBlockers,
    getPlacementCollisionSize
  });
}

function isSolarStationPlacementBlocked(session, storyState, placementRect) {
  return isSolarStationPlacementBlockedWithConfig({
    session,
    storyState,
    placementRect,
    getSolarStationPlacementBlockers,
    getPlacementRect,
    doPlacementRectsOverlap
  });
}

function getSolarStationPowerPosition(session, storyState) {
  return getSolarStationPowerPositionWithSession(session, storyState);
}

function getSolarStationPowerRadius(session) {
  return getSolarStationPowerRadiusWithConfig({
    session,
    radiusMultiplier: LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER,
    previewFootprint: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
    getPlacementCollisionSize
  });
}

function isInsideSolarStationPowerRadius(session, storyState, position) {
  return isInsideSolarStationPowerRadiusWithConfig({
    session,
    storyState,
    position,
    radiusMultiplier: LEAF_DEN_KIT_SOLAR_STATION_RADIUS_MULTIPLIER,
    previewFootprint: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
    getPlacementCollisionSize
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
  const cameraDebugRuntime = createCameraDebugRuntime({
    enabled: CAMERA_DEBUG_ENABLED,
    mount
  });
  cameraDebugRuntime.attachGlobalListeners();
  const playerCounterPromptRuntime = createPlayerCounterPromptRuntime({
    durationMs: PLAYER_COUNTER_PROMPT_DURATION_MS
  });
  const supplyCounterPromptController = createSupplyCounterPromptController({
    getItemLabel: (itemId) => gameplay.getItemLabel?.(itemId),
    triggerPrompt: (text, now) => {
      playerCounterPromptRuntime.trigger(text, now);
    }
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
  const foundationBuildZoneCameraFocusRuntime = createFoundationBuildZoneCameraFocusRuntime();
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
  const playerModelRuntime = createPlayerModelRuntime({
    moveValueToward,
    rotateAngleToward,
    playJumpSound: () => playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_JUMP)
  });

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
      getFreeBlockBuildZoneCenterPosition
    });
  }

  function getSnappedSolarStationPreviewPosition(preview) {
    return getSnappedPlacementPreviewPosition(preview);
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

  function isFoundationBuildMissionActive() {
    return shouldShowFoundationBuildZone(
      gameplay.getActiveQuest?.(controls.storyState) || null,
      gameplay.getActiveSystemQuest?.() || null
    );
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
        const pose = createFoundationBuildZoneCameraFocusPose({
          position: getFreeBlockBuildZoneCenterPosition(buildZone),
          direction: cameraOrbit.getDirection?.() || camera.getPose?.()?.direction
        });
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

  function getSquirtleModelYawToward(fromPosition, toPosition) {
    return getModelYawToward(fromPosition, toPosition, SQUIRTLE_MODEL_FACE_YAW_OFFSET);
  }

  function getRobotModelYawToward(fromPosition, toPosition, modelFaceYawOffset) {
    return getModelYawToward(fromPosition, toPosition, modelFaceYawOffset);
  }

  function getSquirtleLogicalFacingYaw() {
    return getModelLogicalFacingYaw(
      session.actTwoSquirtle?.modelInstance?.yaw,
      SQUIRTLE_MODEL_FACE_YAW_OFFSET
    );
  }

  function getCharmanderLogicalFacingYaw() {
    return getModelLogicalFacingYaw(
      session.charmanderEncounter?.modelInstance?.yaw,
      CHARMANDER_MODEL_FACE_YAW_OFFSET
    );
  }

  function getBulbasaurLogicalFacingYaw() {
    return getModelLogicalFacingYaw(
      session.bulbasaurEncounter?.modelInstance?.yaw,
      BULBASAUR_MODEL_FACE_YAW_OFFSET
    );
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

  function getSavedBuilderTutorialFoundationOriginCell() {
    return getSavedBuilderTutorialFoundationOriginCellFromFlags({
      flags: controls.storyState?.flags
    });
  }

  function saveBuilderTutorialFoundationOriginCell(originCell) {
    saveBuilderTutorialFoundationOriginCellToFlags({
      flags: controls.storyState?.flags,
      originCell
    });
  }

  function getFoundationBuildZoneWorldRect(buildZone = null) {
    return getFoundationBuildZoneWorldRectWithGrid(buildZone, getFreeBlockBuildGridConfig());
  }

  function isFoundationFreeBlockAllowedInZone(instance, buildZone) {
    return isFoundationFreeBlockAllowedInZoneWithState({
      instance,
      buildZone,
      buildState: session.freeBlockBuildState
    });
  }

  function getFoundationBuildZoneProgressCount(buildZone = null) {
    const progress = getFreeBlockBuildZoneProgress({
      buildState: session.freeBlockBuildState,
      buildZone,
      blockType: FREE_BLOCK_TYPES.WALL
    });
    return getFoundationBuildZoneProgressCountFromState({
      progress,
      buildZone,
      floorBlocks: session.freeBlockBuildSnapshot?.floorBlocks || []
    });
  }

  function getFoundationBuildZoneBlockers(buildZone = null) {
    return buildFoundationBuildZoneBlockersWithSources({
      terrainColliders: getPlayerConstructionTerrainColliders(),
      freeBlockInstances: session.freeBlockInstances || [],
      isFoundationFreeBlockAllowed: (instance) => isFoundationFreeBlockAllowedInZone(instance, buildZone),
      worldObjectBlockers: getWorldObjectPlacementBlockers(session),
      playerPosition: session.playerCharacter?.getPosition?.() || null,
      npcActors: session.npcActors || [],
      isNpcActive: (npcActor) => rendering?.isNpcActive?.(npcActor, controls.storyState),
      getActorPosition: getActorDebugPosition,
      interactables: session.interactables || [],
      isInteractableActive: (interactable) => rendering?.isInteractableActive?.(interactable, controls.storyState),
      companions: [
        session.actTwoSquirtle,
        session.bulbasaurEncounter,
        session.timburrEncounter,
        session.charmanderEncounter
      ],
      resourceNodes: session.resourceNodes || [],
      isResourceNodeActive: (resourceNode) => rendering?.isResourceNodeActive?.(resourceNode, controls.storyState),
      drops: [
        ...(session.woodDrops || []),
        ...(session.fieldDrops || []),
        ...(session.leppaBerryDrops || [])
      ],
      groundPatches: [
        ...(session.groundGrassPatches || []),
        ...(session.groundFlowerPatches || [])
      ]
    });
  }

  function isBuilderTutorialFoundationBuildZoneBlocked(buildZone = null) {
    const zoneRect = getFoundationBuildZoneWorldRect(buildZone);
    return isBuilderTutorialFoundationBuildZoneBlockedWithBlockers({
      zoneRect,
      blockers: getFoundationBuildZoneBlockers(buildZone)
    });
  }

  function findAvailableBuilderTutorialFoundationBuildZone() {
    return findAvailableBuilderTutorialFoundationBuildZoneWithConfig({
      gridConfig: getFreeBlockBuildGridConfig(),
      isBuildZoneBlocked: isBuilderTutorialFoundationBuildZoneBlocked
    });
  }

  function syncActiveFreeBlockBuildZone() {
    const savedOrigin = getSavedBuilderTutorialFoundationOriginCell();
    const resolution = resolveActiveBuilderTutorialFoundationBuildZone({
      savedOriginCell: savedOrigin,
      getFoundationProgressCount: getFoundationBuildZoneProgressCount,
      isBuildZoneBlocked: isBuilderTutorialFoundationBuildZoneBlocked,
      findAvailableBuildZone: findAvailableBuilderTutorialFoundationBuildZone
    });

    if (resolution.originCellToSave) {
      saveBuilderTutorialFoundationOriginCell(resolution.originCellToSave);
    }

    session.freeBlockBuildZoneUnavailable = resolution.unavailable;
    session.activeFreeBlockBuildZone = resolution.buildZone;
    return resolution.buildZone;
  }

  function getActiveFreeBlockBuildZone() {
    return syncActiveFreeBlockBuildZone();
  }

  function isFoundationBuildZoneUnavailable() {
    return Boolean(session.freeBlockBuildZoneUnavailable);
  }

  function getFreeBlockBuildZoneCenterPosition(buildZone = getActiveFreeBlockBuildZone()) {
    return getFreeBlockBuildZoneCenterPositionWithConfig({
      buildZone,
      gridConfig: getFreeBlockBuildGridConfig()
    });
  }

  function getFreeBlockBuildCostMarker(previewTarget = null) {
    const materialCost = getFreeBlockBuildController()?.getSelectedBlockMaterialCost?.();
    return buildFreeBlockBuildCostMarker({
      previewTarget,
      materialCost,
      inventory: controls.inventory
    });
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

  function shouldShowFoundationBuildZone(activeQuest = null, activeSystemQuest = null) {
    return shouldShowFoundationBuildZoneWithState({
      activeQuest,
      activeSystemQuest
    });
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

    return buildFoundationBuildZoneGroundCellsWithConfig({
      buildZone,
      gridSystem,
      buildState,
      zoneUnavailable,
      wallBlockType: FREE_BLOCK_TYPES.WALL
    });
  }

  function buildFoundationCompletionInteriorGroundCells() {
    const buildZone = getActiveFreeBlockBuildZone();
    if (!Array.isArray(buildZone?.interiorCells) || !buildZone.interiorCells.length) {
      return [];
    }

    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    return buildFoundationCompletionInteriorGroundCellsWithConfig({
      buildZone,
      gridSystem
    });
  }

  function triggerFoundationBuildZoneCompleteEffects(now = performance.now()) {
    const flags = controls.storyState?.flags;
    if (!flags) {
      return;
    }

    const position = getFreeBlockBuildZoneCenterPosition();
    const effects = applyFoundationBuildZoneCompleteEffects({
      flags,
      position,
      constructionCloudBursts: session.constructionCloudBursts,
      nowMs: Date.now()
    });

    if (effects.triggerInteriorFeedback) {
      groundActionFeedbackRuntime.triggerFeedback(
        buildFoundationCompletionInteriorGroundCells(),
        effects.feedbackAbilityId,
        now,
        { durationMs: effects.feedbackDurationMs }
      );
    }

    if (effects.constructionCloudBursts) {
      session.constructionCloudBursts = effects.constructionCloudBursts;
    }
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
    return canStackFreeBlockPlacementFromProgress({ progress });
  }

  function getFreeBlockCellWorldPosition(cell, gridSystem = createGridSystem(getFreeBlockBuildGridConfig())) {
    return getFreeBlockCellWorldPositionWithGrid({
      cell,
      gridSystem
    });
  }

  function buildFreeBlockFeedbackGroundCell(result) {
    return buildFreeBlockFeedbackGroundCellWithConfig({
      result,
      gridSystem: createGridSystem(getFreeBlockBuildGridConfig())
    });
  }

  function syncFreeBlockBuildSnapshot() {
    const controller = getFreeBlockBuildController();
    session.freeBlockBuildSnapshot = controller.serializeFreeBlocks();
    return session.freeBlockBuildSnapshot;
  }

  function movePlayerAwayFromPlacedFreeBlock(targetCell, playerPosition = null) {
    if (!session.playerCharacter || !Array.isArray(playerPosition) || !targetCell) {
      return null;
    }

    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    if (!isWorldPositionOnFreeBlockCell({
      targetCell,
      worldPosition: playerPosition,
      gridSystem
    })) {
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
    playerModelRuntime.sync(session, 0);
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
      createUnavailableFoundationBuildZonePlacementResult({
        blockType: FREE_BLOCK_TYPES.WALL
      }) :
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
      createUnavailableFoundationBuildZoneValidation({
        targetCell: target.targetCell
      }) :
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
    const rawTargetBlock = rawTargetCell ? session.freeBlockBuildState?.getBlockAtCell?.(rawTargetCell) : null;
    const targetBlock = session.freeBlockBuildState?.getBlockAtCell?.(resolvedTargetCell) || null;
    const previewValidity = resolveBuildBlockPreviewValidity({
      validation,
      blockingColliderIds
    });
    const { valid, reason } = previewValidity;

    return {
      targetCell: resolvedTargetCell,
      targetPosition,
      valid,
      reason,
      debug: buildFreeBlockPreviewDebug({
        rawTargetCell,
        targetCell: resolvedTargetCell,
        playerPosition,
        targetPosition,
        validation,
        previewValidity,
        blockingColliderIds,
        rawTargetBlock,
        targetBlock,
        wood: controls.inventory?.wood ?? 0,
        gridSystem
      })
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
      return syncFreeBlockPreviewInstance({
        instance,
        active,
        playerPosition
      });
    }

    const target = getFreeBlockPreviewTarget(playerPosition);
    if (!target?.targetCell || !Array.isArray(target.targetPosition)) {
      return syncFreeBlockPreviewInstance({
        instance,
        active,
        playerPosition,
        target
      });
    }

    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    return syncFreeBlockPreviewInstance({
      instance,
      active,
      playerPosition,
      target,
      cellSize: gridSystem.cellSize,
      nowSeconds
    });
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
      createUnavailableFoundationBuildZonePlacementResult({
        blockType: FREE_BLOCK_TYPES.WALL,
        targetCell: action.targetCell
      }) :
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

  function tryRemoveNearbyFreeBlock(playerPosition, now) {
    const target = findNearbyFreeBlockTarget({
      playerPosition,
      freeBlockInstances: session.freeBlockInstances
    });
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

    session.woodDrops ||= [];
    const dropCount = spawnFreeBlockRemovalDropsWithConfig({
      result,
      target,
      woodDrops: session.woodDrops,
      dropSize: FREE_BLOCK_DROP_SIZE,
      pickupRadius: FREE_BLOCK_DROP_PICKUP_RADIUS,
      spread: FREE_BLOCK_DROP_SPREAD
    });
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
    return isCompanionFollowFormationMember({
      companionId,
      flags,
      companions: {
        squirtle: session.actTwoSquirtle,
        bulbasaur: session.bulbasaurEncounter,
        charmander: session.charmanderEncounter,
        timburr: session.timburrEncounter
      },
      actions: {
        squirtleWaterGun: session.squirtleWaterGunAction,
        bulbasaurLeafage: session.bulbasaurLeafageAction,
        charmanderFire: session.charmanderFireAction,
        timburrBuildBlock: session.timburrBuildBlockAction
      },
      blockers: {
        squirtleWaterGunQueueActive: getSquirtleWaterGunQueue().length > 0,
        bulbasaurWorkbenchGuideActive: isBulbasaurWorkbenchGuideActive()
      }
    });
  }

  function getCompanionFollowFormationIndex(companionId, activeMoveId = null) {
    return resolveCompanionFollowFormationIndex({
      companionId,
      activeMoveId,
      isFollowing: isCompanionInFollowFormation
    }) ?? 0;
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
    return resolveSquirtleWaterGunApproachPosition({
      targetPosition,
      squirtlePosition:
        session.actTwoSquirtle?.position ||
        session.actTwoSquirtle?.modelInstance?.offset,
      playerPosition
    });
  }

  function getBulbasaurLeafageApproachPosition(targetPosition, playerPosition = null) {
    return resolveBulbasaurLeafageApproachPosition({
      targetPosition,
      bulbasaurPosition:
        session.bulbasaurEncounter?.position ||
        session.bulbasaurEncounter?.modelInstance?.offset,
      playerPosition
    });
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
    return resolveCharmanderFireApproachPosition({
      targetPosition,
      charmanderPosition:
        session.charmanderEncounter?.position ||
        session.charmanderEncounter?.modelInstance?.offset,
      playerPosition
    });
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
      supplyCounterPromptController.trigger(CARBON_ITEM_ID, controls.inventory, performance.now());
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
    return resolveSquirtleMouthPosition({
      squirtle: session.actTwoSquirtle,
      yaw: getSquirtleLogicalFacingYaw()
    });
  }

  function getCharmanderMouthPosition() {
    return resolveCharmanderMouthPosition({
      charmander: session.charmanderEncounter,
      yaw: getCharmanderLogicalFacingYaw()
    });
  }

  function getBulbasaurGrowEmitterPosition() {
    return resolveBulbasaurGrowEmitterPosition({
      bulbasaur: session.bulbasaurEncounter,
      yaw: getBulbasaurLogicalFacingYaw()
    });
  }

  function getSquirtleWorldPosition() {
    return resolveSquirtleWorldPosition({
      squirtle: session.actTwoSquirtle
    });
  }

  function getCharmanderWorldPosition() {
    return resolveCharmanderWorldPosition({
      charmander: session.charmanderEncounter
    });
  }

  function getPeriodicChopperAttentionCue({
    activeTask,
    activeSystemQuest,
    chopperPosition,
    now
  }) {
    const cue = resolveChopperAttentionCue({
      activeTaskId: activeTask?.id,
      activeSystemQuestId: activeSystemQuest?.id,
      chopperPosition,
      isPlayerNearWorldPosition,
      interactDistance: POKEMON_TALK_INTERACT_DISTANCE + 0.45,
      text: CHOPPER_ATTENTION_CUE_TEXT
    });

    return chopperAttentionCueRuntime.get(cue, now);
  }

  function getPeriodicCompanionLostHint({
    activeQuest,
    activeMoveId,
    now
  }) {
    const hint = resolveWaterGunCompanionLostHint({
      activeQuestId: activeQuest?.id,
      activeMoveId,
      flags: controls.storyState?.flags || {},
      playerHasWaterGun: controls.playerSkills?.waterGun,
      bulbasaurPosition: session.bulbasaurEncounter?.position,
      squirtlePosition: getSquirtleWorldPosition(),
      restoreTargetCount: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
      squirtleHintText: SQUIRTLE_WATER_GUN_HINT_TEXT,
      bulbasaurHintText: BULBASAUR_SWITCH_TO_SQUIRTLE_HINT_TEXT
    });

    return companionLostHintRuntime.get(hint, now);
  }

  function isWorldCellPlannerActive() {
    return Boolean(rendering?.debugWorldCellPlanner);
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

  function resolveWorldCellPlannerPick({ clientX, clientY } = {}) {
    return resolveWorldCellPlannerPickFromCandidates({
      request: { clientX, clientY },
      groundCells: getWorldCellPlannerGroundCells({
        groundDeadInstances: session.groundDeadInstances,
        groundPurifiedInstances: session.groundPurifiedInstances,
        iceGroundInstances: session.iceGroundInstances
      }),
      projectGroundCell: (groundCell) => projectWorldCellPlannerGroundCell({
        groundCell,
        camera,
        worldCanvas
      }),
      createSelection: (groundCell) => createWorldCellPlannerSelection({
        groundCell,
        getGridCell: getWorldCellPlannerGridCell,
        isColdGroundCell: (cell) => session.iceGroundInstances?.includes(cell)
      }),
      maxDistancePx: WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX
    });
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
      .map((sourcePosition) => resolveSupplyPickupViewportOrigin({
        sourcePosition,
        getPlayerPosition: () => session.playerCharacter?.getPosition?.(),
        camera,
        worldCanvas
      }))
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
    label = supplyCounterPromptController.getLabel(itemId),
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
    supplyCounterPromptController.trigger(itemId, controls.inventory, now);
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
    return isLeafDenConstructionActiveFromState({
      storyState: controls.storyState,
      leafDen: session.leafDen
    });
  }

  function isLeafDenBusyCompanionTarget(target) {
    return isLeafDenBusyCompanionTargetFromState({
      active: isLeafDenConstructionActive(),
      target
    });
  }

  function getLeafDenConstructionProgress(nowMs = getLeafDenConstructionNowMs()) {
    return getLeafDenConstructionProgressFromState({
      storyState: controls.storyState,
      nowMs
    });
  }

  function getActiveConstructionCloudBursts(nowMs = getLeafDenConstructionNowMs()) {
    return getActiveConstructionCloudBurstsWithSession(session, nowMs);
  }

  function syncConstructionCloudBurstEffects(nowSeconds = getRuntimeNowSeconds()) {
    return syncConstructionCloudBurstEffectsWithSession({
      session,
      nowMs: getLeafDenConstructionNowMs(),
      nowSeconds
    });
  }

  function syncLeafDenConstructionClouds(nowSeconds = getRuntimeNowSeconds()) {
    return syncLeafDenConstructionCloudsWithSession({
      session,
      active: isLeafDenConstructionActive(),
      position: session.leafDen?.position,
      nowSeconds
    });
  }

  function getLeafDenConstructionBillboards(uvRect, nowSeconds = getRuntimeNowSeconds()) {
    return getLeafDenConstructionBillboardsWithConfig({
      active: isLeafDenConstructionActive(),
      leafDen: session.leafDen,
      progress: getLeafDenConstructionProgress(),
      barBackTexture: session.squirtleWaterStaminaBackTexture,
      barFillTexture: session.charmanderCarbonFillTexture || session.squirtleWaterStaminaBackTexture,
      starTexture: session.logChairStarTexture || session.natureRevivalSparkTexture,
      uvRect,
      nowSeconds
    });
  }

  function getConstructionCloudBurstBillboards(uvRect, nowSeconds = getRuntimeNowSeconds()) {
    return getConstructionCloudBurstBillboardsWithConfig({
      bursts: getActiveConstructionCloudBursts(),
      starTexture: session.logChairStarTexture || session.natureRevivalSparkTexture,
      uvRect,
      nowSeconds
    });
  }

  function syncLeafDenModelInstance(deltaTime = 0) {
    return syncLeafDenModelInstanceWithSession({
      session,
      storyState: controls.storyState,
      deltaTime,
      getWorkbenchRotationPreviewYaw,
      applyPlacementSpawn: applyPlayerPlacementSpawnToModelInstance,
      applyRotationTint: applyWorkbenchRotationSelectionTint
    });
  }

  function ensurePlayerHouseModelInstances() {
    return ensurePlayerHouseModelInstancesWithSession(session);
  }

  function syncPlayerHouseModelInstances(deltaTime = 0, renderCenter = null) {
    return syncPlayerHouseModelInstancesWithSession({
      session,
      deltaTime,
      renderCenter,
      selectedRotationKind: workbenchRotationRuntime.getSelection()?.kind,
      prepareDistance: PLAYER_CONSTRUCTION_MODEL_PREPARE_DISTANCE,
      getWorkbenchRotationPreviewYaw,
      isWorldPositionWithinRenderDistance,
      applyPlacementSpawn: applyPlayerPlacementSpawnToModelInstance,
      applyRotationTint: applyWorkbenchRotationSelectionTint
    });
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

  function revealBotAtRepairPosition(encounter, { falling = false } = {}) {
    return revealBotAtRepairPositionWithConfig({
      encounter,
      falling,
      getRepairBoxPosition: getEncounterRepairBoxPosition,
      fallHeight: BULBASAUR_REVEAL_BOT_FALL_HEIGHT
    });
  }

  function updateBotRevealFall(opening, encounter, progress) {
    updateBotRevealFallWithConfig({
      opening,
      encounter,
      progress,
      clamp01,
      defaultVisibleProgress: BULBASAUR_REVEAL_VISIBLE_PROGRESS,
      defaultFallEndProgress: BULBASAUR_REVEAL_BOT_FALL_END_PROGRESS
    });
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
    return moveConstructionHelperToLeafDenWithConfig({
      encounter,
      leafDenPosition: session.leafDen?.position,
      offset,
      modelFaceYawOffset,
      nowSeconds,
      getYawToward: getRobotModelYawToward
    });
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

  function resolveFrameHudPromptCopy({
    gameplayOpeningMovementLocked,
    cinematicActive,
    tutorialActive,
    skillLearnActive,
    scriptedInteractionActive,
    placementPrompts,
    pendingPlacementPrompt,
    workbenchRotationPrompt,
    destroyableObjectPrompt,
    nearbyHarvestTarget,
    nearbyInteractable,
    activeQuest,
    transientNoticeRoute,
    activeMoveId,
    pendingWaterGunGroundCells
  }) {
    return resolveHudPromptCopy({
      blockedByMode: {
        gameplayOpeningMovementLocked,
        cinematicActive,
        tutorialActive,
        skillLearnActive,
        scriptedInteractionActive
      },
      placementPrompts,
      pendingPlacementPrompt,
      workbenchRotationPrompt,
      destroyableObjectPrompt,
      nearbyHarvestTarget,
      nearbyInteractable,
      activeQuest,
      transientNoticeRoute,
      activeMoveId,
      pendingWaterGunGroundCells,
      storyState: controls.storyState,
      getItemLabel: gameplay.getItemLabel,
      buildNearbyPrompt: gameplay.buildNearbyPrompt,
      debug: debugInteractionFlow
    });
  }

  function resolveFramePromptTargetState({
    solarStationPlacementPreview,
    greenhousePlacementPreview,
    campfirePlacementPreview,
    leafDenKitPlacementPreview,
    inputModalityState,
    nearbyHarvestTarget,
    gameplayOpeningMovementLocked,
    flowState
  }) {
    const {
      placementPreviewBlocked,
      framePlacementPrompts
    } = resolveFramePlacementPromptState({
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      inputModalityState
    });
    const pendingPlacementIntent = resolveFramePendingPlacementIntent({
      placementPreviewBlocked, session,
      storyState: controls.storyState, inventory: controls.inventory
    });
    const pendingPlacementPrompt = getPendingPlacementPrompt(
      pendingPlacementIntent,
      nearbyHarvestTarget,
      inputModalityState
    );
    const selectedWorkbenchRotationTarget =
      !placementPreviewBlocked ?
        getSelectedRotatableWorkbenchPlacement() :
        null;
    const nearbyWorkbenchRotationTarget =
      !selectedWorkbenchRotationTarget &&
      !placementPreviewBlocked &&
      session.playerCharacter &&
      !gameplayOpeningMovementLocked &&
      !flowState.cinematicActive &&
      !flowState.tutorialActive &&
      !flowState.skillLearnActive &&
      !flowState.scriptedInteractionActive ?
        getNearestRotatableWorkbenchPlacement() :
        null;
    const workbenchRotationPrompt = selectedWorkbenchRotationTarget ?
      resolveWorkbenchRotationPrompt(inputModalityState) :
      nearbyWorkbenchRotationTarget ?
        resolveInputPrompt(UI_PROMPT_ACTION.OPEN_BAG, inputModalityState) :
        "";
    const destroyableObjectPrompt =
      !placementPreviewBlocked &&
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
      blockedByPlacementPreview: placementPreviewBlocked
    });

    return {
      framePlacementPrompts,
      pendingPlacementIntent,
      pendingPlacementPrompt,
      selectedWorkbenchRotationTarget,
      nearbyWorkbenchRotationTarget,
      workbenchRotationPrompt,
      destroyableObjectPrompt
    };
  }

  function processFollowerCallFrame() {
    if (!controls.consumeFollowerCallRequest?.()) {
      return;
    }

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

    cameraDebugRuntime.update(createCameraDebugFrameState({
      now,
      flowState,
      movementBlocked,
      gameplayOpeningMovementLocked,
      cameraTransitionActive,
      paused: Boolean(controls.isPaused?.()),
      gameplayCameraState: gameplayCameraDirector.getState(now),
      cameraPose: camera.getPose?.() || null,
      systemQuestId: gameplay.getActiveSystemQuest?.()?.id || null,
      uiQuestId: gameplay.getActiveQuest?.(controls.storyState)?.id || null,
      playerPosition: session.playerCharacter?.getPosition?.() || null,
      shipVisible: session.gameplayOpeningShip?.visible,
      shipPosition: session.gameplayOpeningShip?.position
    }));
  }

  function updateGameplayInputFrame({
    now,
    deltaTime,
    flowState,
    cinematicActive,
    movementBlocked,
    placementPreviewActive,
    dialogueActive,
    tutorialActive,
    skillLearnActive,
    scriptedInteractionActive,
    gameplayOpeningMovementLocked
  }) {
    gameplayInputRuntime.update({
      now,
      deltaTime,
      gameplayActive: flowState.gameplayActive,
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
      flowState,
      movementBlocked,
      gameplayOpeningMovementLocked,
      cameraTransitionActive
    });

    return { cameraTransitionActive };
  }

  function updateEarlyGameplayControlFrame({
    nextFrame,
    deltaTime,
    introActive,
    shouldClearPendingActions,
    shouldClearMovementInput,
    canAdvanceRustlingGrass
  }) {
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
      return { committedEarlyFrame: true };
    }

    if (shouldClearPendingActions) {
      controls.clearPendingActions();
    }

    if (shouldClearMovementInput) {
      controls.clearMovementInput();
    }

    updateRustlingGrassEvent(deltaTime, canAdvanceRustlingGrass);

    return { committedEarlyFrame: false };
  }

  function updateCameraInputFrame({
    deltaTime,
    flowState,
    gameplayOpeningCameraLocked,
    foundationBuildZoneCameraFocusActive,
    placementPreviewActive,
    tutorialActive
  }) {
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
      flowState
    });

    consumeCameraZoomCycleRequests({
      consumeRequest: () => controls.consumeCameraZoomCycleRequest?.(),
      canCycleCameraZoom,
      cameraZoomPresetController,
      onCycle: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE)
    });

    const cameraLookInput = resolveCameraLookInput({
      cameraTurnKeys: controls.cameraTurnKeys,
      cameraLookDelta: controls.consumeCameraLookDelta?.() || { yaw: 0, pitch: 0 },
      deltaTime,
      turnSpeed: cameraOrbit.turnSpeed
    });

    if (canRotateCamera && cameraLookInput.hasInput) {
      cameraOrbit.rotate(cameraLookInput.yaw, cameraLookInput.pitch);
      if (tutorialActive) {
        actTwoTutorial.registerCameraLook();
      }
    } else if (!canRotateCamera) {
      controls.clearCameraLookInput?.();
    }
  }

  function updatePlayerMovementFrame({
    deltaTime,
    now,
    flowState,
    gameplayOpeningMovementLocked,
    gameplayOpeningCameraLocked,
    foundationBuildZoneCameraFocusActive,
    tutorialActive
  }) {
    const canUpdatePlayerMovement = resolvePlayerMovementPermission({
      hasPlayerCharacter: Boolean(session.playerCharacter),
      foundationBuildZoneCameraFocusActive,
      flowState
    });
    let playerMovedThisFrame = false;

    if (canUpdatePlayerMovement) {
      const previousPlayerPosition = session.playerCharacter.getPosition();
      session.playerCharacter.update(deltaTime);
      if (session.playerCharacter.consumeJumpStarted?.()) {
        playerModelRuntime.startJumpFlip(session);
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
      playerModelRuntime.sync(session, deltaTime, [
        nextPlayerPosition[0] - previousPlayerPosition[0],
        nextPlayerPosition[2] - previousPlayerPosition[2]
      ]);

      if (
        movedDistance > 0.0005 &&
        !tutorialActive &&
        !gameplayOpeningCameraLocked &&
        !foundationBuildZoneCameraFocusActive
      ) {
        restoreActiveZoomPresetOnMovement({
          playerPosition: nextPlayerPosition,
          camera,
          cameraOrbit,
          cameraZoomPresetController
        });
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
      playerModelRuntime.sync(session, deltaTime);
    }

    updatePlayerDustParticles(session.playerDust, {
      deltaTime,
      playerPosition: session.playerCharacter?.getPosition?.() || null,
      active: canUpdatePlayerMovement
    });

    return { playerMovedThisFrame };
  }

  function updatePassiveEffectFrames(deltaTime) {
    updateNatureRevivalEffects(session.natureRevivalEffects, deltaTime);
    treeRevivalLeafBurstRuntime.update(deltaTime);
    woodCollectPopRuntime.update(deltaTime);
    gearPickupParticleRuntime.update(deltaTime);
  }

  function updateAmbientWorldSimulationFrame({ deltaTime, now }) {
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
  }

  function prepareRenderSnapshotContext({ cinematicActive }) {
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
    const selectedRepairBoxParticleTarget = getSelectedRepairBoxParticleTarget({
      repairModuleInstances: [
        session.actTwoSquirtle?.repairModuleInstance,
        session.bulbasaurEncounter?.repairModuleInstance,
        session.charmanderEncounter?.repairModuleInstance,
        session.timburrEncounter?.repairModuleInstance
      ]
    });
    const repairBoxRevealParticleTarget = getRepairBoxRevealParticleTarget({
      encounters: [
        session.bulbasaurEncounter,
        session.charmanderEncounter
      ],
      getEncounterRepairBoxPosition,
      clamp01
    });

    return {
      grassBendPlayerPosition,
      natureRenderCenter,
      grassCollisionObjects,
      selectedRepairBoxParticleTarget,
      repairBoxRevealParticleTarget,
      shouldShowRepairBoxRustlingParticles: false
    };
  }

  function updateGroundCellHighlightFrame(nextFrame, {
    solarStationPlacementGroundCell,
    solarStationPowerRadiusGroundCells,
    solarStationPlacementGroundCells,
    greenhousePlacementGroundCell,
    greenhousePlacementGroundCells,
    campfirePlacementGroundCell,
    campfirePlacementGroundCells,
    leafDenKitPlacementGroundCell,
    leafDenKitPlacementGroundCells,
    workbenchRotationGroundCell,
    activeFireGroundCell,
    shouldShowGroundCellHighlight,
    highlightedGroundCell,
    highlightedGroundCellTargetState,
    highlightedGroundCellAbilityId,
    markedActionGroundCells,
    markedGroundCellPulsePhase,
    groundActionFeedbackFrame,
    fieldToolTargetPulseFrame
  }) {
    const groundCellHighlight = nextFrame.groundCellHighlight;

    if (solarStationPlacementGroundCell) {
      groundCellHighlight.visible = true;
      groundCellHighlight.markedGroundCells.push(
        ...solarStationPowerRadiusGroundCells,
        ...solarStationPlacementGroundCells
      );
    } else if (greenhousePlacementGroundCell) {
      groundCellHighlight.visible = true;
      groundCellHighlight.markedGroundCells.push(
        ...greenhousePlacementGroundCells
      );
    } else if (campfirePlacementGroundCell) {
      groundCellHighlight.visible = true;
      groundCellHighlight.markedGroundCells.push(
        ...campfirePlacementGroundCells
      );
    } else if (leafDenKitPlacementGroundCell) {
      groundCellHighlight.visible = true;
      groundCellHighlight.markedGroundCells.push(
        ...solarStationPowerRadiusGroundCells,
        ...leafDenKitPlacementGroundCells
      );
    } else if (workbenchRotationGroundCell) {
      groundCellHighlight.visible = true;
      groundCellHighlight.groundCell = workbenchRotationGroundCell;
    } else if (activeFireGroundCell) {
      groundCellHighlight.visible = true;
      groundCellHighlight.groundCell = activeFireGroundCell;
    } else if (shouldShowGroundCellHighlight) {
      groundCellHighlight.visible = true;
      groundCellHighlight.groundCell = {
        ...highlightedGroundCell,
        highlightTargetState: highlightedGroundCellTargetState,
        highlightAbilityId: highlightedGroundCellAbilityId
      };
    }

    if (markedActionGroundCells.length) {
      groundCellHighlight.visible = true;
      groundCellHighlight.markedGroundCells.push(...markedActionGroundCells);
      groundCellHighlight.pulsePhase = markedGroundCellPulsePhase;
    }

    if (groundActionFeedbackFrame) {
      groundCellHighlight.visible = true;
      groundCellHighlight.markedGroundCells.push(
        ...groundActionFeedbackFrame.markedGroundCells
      );
      groundCellHighlight.pulsePhase = groundActionFeedbackFrame.pulsePhase;
      groundCellHighlight.actionPulseGroundCell = {
        ...groundActionFeedbackFrame.groundCell,
        highlightAbilityId: groundActionFeedbackFrame.abilityId
      };
      groundCellHighlight.actionPulsePhase = groundActionFeedbackFrame.pulsePhase;
      groundCellHighlight.actionPulseAbilityId = groundActionFeedbackFrame.abilityId;
    }

    if (fieldToolTargetPulseFrame) {
      groundCellHighlight.visible = true;
      groundCellHighlight.actionPulseGroundCell = {
        ...fieldToolTargetPulseFrame.groundCell,
        highlightAbilityId: fieldToolTargetPulseFrame.abilityId,
        highlightPulseScale: fieldToolTargetPulseFrame.scale,
        highlightPulseBrightness: fieldToolTargetPulseFrame.brightness
      };
      groundCellHighlight.actionPulsePhase = fieldToolTargetPulseFrame.progress;
      groundCellHighlight.actionPulseAbilityId = fieldToolTargetPulseFrame.abilityId;
    }
  }

  function updateBaseRenderSnapshotFrame(nextFrame, {
    now,
    deltaTime,
    cinematicActive,
    nearbyInteractable,
    nearbyWorkbenchRotationTarget
  }) {
    const followedViewProjection = camera.getViewProjection(
      worldCanvas.width,
      worldCanvas.height
    );
    const nowSeconds = now * 0.001;

    syncActiveRepairBoxHighlight();
    syncGreenhouseModelInstance(deltaTime);
    syncCampfireTrainHouseModelInstance(nowSeconds, deltaTime);
    if (isLeafDenConstructionActive()) {
      controls.completeLeafDenConstructionIfReady?.({ playDialogue: false });
    }
    syncLeafDenConstructionClouds(nowSeconds);
    syncConstructionCloudBurstEffects(nowSeconds);
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
  }

  function prepareWorldSpaceUiFrameContext({
    now,
    gameplayOpeningCameraLocked,
    flowState,
    activeQuest,
    activeTask,
    activeSystemQuest
  }) {
    const tangrowthActor = session.npcActors.find((npcActor) => npcActor.id === "tangrowth");
    const tangrowthPosition =
      tangrowthActor?.character?.getPosition?.() ||
      null;
    const canShowWorldSpaceUi = resolveWorldSpaceUiVisibility({
      gameplayOpeningCameraLocked,
      flowState
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

    return {
      canShowWorldSpaceUi,
      tangrowthPosition
    };
  }

  function updateWorldSpeechSnapshotFrame(nextFrame, {
    now,
    activeQuest,
    activeMoveId,
    tangrowthPosition,
    chopperAttentionCue,
    shouldShowTangrowthSpeech,
    shouldShowTangrowthLogChairSpeech,
    shouldShowTangrowthPokemonCenterSpeech,
    shouldShowTangrowthHouseSpeech,
    shouldShowTangrowthCelebrationSpeech,
    shouldShowChopperBulbasaurRepairBoxSpeech,
    shouldShowBulbasaurMissionSpeech,
    shouldShowBulbasaurWorkbenchGuideSpeech,
    shouldShowBulbasaurRequestReadySpeech,
    shouldShowBulbasaurStrawBedSpeech,
    shouldShowBulbasaurStrawBedCompleteSpeech,
    shouldShowCharmanderFollowSpeech,
    shouldShowCharmanderCelebrationSpeech
  }) {
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
  }

  function updateWorldPromptSnapshotFrame(nextFrame, {
    inputModalityState,
    shouldShowSolarStationPlacementPrompt,
    solarStationPlacementPreview,
    shouldShowDestroyableObjectPrompt,
    destroyableObjectPrompt,
    shouldShowGreenhousePlacementPrompt,
    greenhousePlacementPreview,
    shouldShowCampfirePlacementPrompt,
    campfirePlacementPreview,
    shouldShowLeafDenKitPlacementPrompt,
    leafDenKitPlacementPreview,
    shouldShowPendingPlacementPrompt,
    pendingPlacementIntent,
    nearbyHarvestTarget,
    shouldShowWorkbenchRotationPrompt,
    workbenchRotationPrompt,
    shouldShowFreeBlockBuildCostPrompt,
    freeBlockBuildCostMarker,
    shouldShowPlayerCounterPrompt,
    playerCounterPromptText,
    shouldShowFieldMoveSwitchPrompt,
    fieldMoveSwitchPrompt,
    shouldShowSquirtleChargingPrompt,
    squirtleChargingPosition,
    shouldShowInvalidLeafageUsePrompt,
    shouldShowInvalidFireUsePrompt,
    shouldShowTransientWorldPrompt,
    transientNoticeRoute,
    shouldShowDryGrassHydroPrompt,
    dryGrassHydroPromptText,
    shouldShowRunBreadcrumbPrompt,
    runBreadcrumbPromptText,
    shouldShowPlayerInteractionPrompt,
    playerInteractionPromptText,
    shouldShowRepairBoxPrompt,
    nearbyRepairBoxPrompt,
    shouldShowLeafageFirstUsePrompt,
    leafageEquipped,
    shouldShowWaterGunFirstUsePrompt
  }) {
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
  }

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

  function updateFrameSceneSync(deltaTime) {
    camera.resizeCanvases();
    camera.update(deltaTime);
    clearInteractionObjectHighlights(session);
    syncWorkbenchInteractable();
    syncPokemonCenterWorkshopVisualState();
  }

  function updateGameplayCameraFrame({
    now,
    cinematicActive,
    tutorialCameraFocus,
    foundationBuildZoneCameraFocusActive,
    gameplayOpeningCameraFrame,
    dialogueActive,
    cameraTransitionActive,
    scriptedInteractionActive
  }) {
    let nextGameplayOpeningCameraFrame = gameplayOpeningCameraFrame;

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
        nextGameplayOpeningCameraFrame = gameplayOpeningRuntime.updateCamera({
          now,
          gameplayActive: true,
          canFollow: !dialogueActive && !cameraTransitionActive && !scriptedInteractionActive
        });
      } else if (session.playerCharacter && !dialogueActive && !camera.isTargetTransitionActive()) {
        camera.follow(session.playerCharacter.getPosition());
      }
    }

    return { gameplayOpeningCameraFrame: nextGameplayOpeningCameraFrame };
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

    updateFrameSceneSync(deltaTime);

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

    const { cameraTransitionActive } = updateGameplayInputFrame({
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

    const { committedEarlyFrame } = updateEarlyGameplayControlFrame({
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

    updateCameraInputFrame({
      deltaTime,
      flowState: frameFlowState,
      gameplayOpeningCameraLocked,
      foundationBuildZoneCameraFocusActive,
      placementPreviewActive,
      tutorialActive
    });

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
    updateSolarStationSpawnEffect(session.strawBedModelInstance, deltaTime);
    syncSolarStationWorkbenchRotationVisual(now * 0.001);
    const { playerMovedThisFrame } = updatePlayerMovementFrame({
      deltaTime,
      now,
      flowState: frameFlowState,
      gameplayOpeningMovementLocked,
      gameplayOpeningCameraLocked,
      foundationBuildZoneCameraFocusActive,
      tutorialActive
    });
    updatePassiveEffectFrames(deltaTime);

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
      const previousSupplyCounts = supplyCounterPromptController.snapshot(controls.inventory);
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
        supplyCounterPromptController.triggerChanged(previousSupplyCounts, controls.inventory, now);
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

    processFollowerCallFrame();

    // Simulation updates.
    updateAmbientWorldSimulationFrame({ deltaTime, now });
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
          supplyCounterPromptController.trigger("wood", controls.inventory, now);

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
          supplyCounterPromptController.trigger(LEPPA_BERRY_ITEM_ID, controls.inventory, now);
        }
      }
    }

    const gameplayCameraFrame = updateGameplayCameraFrame({
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
      framePlacementPrompts,
      pendingPlacementIntent,
      pendingPlacementPrompt,
      selectedWorkbenchRotationTarget,
      nearbyWorkbenchRotationTarget,
      workbenchRotationPrompt,
      destroyableObjectPrompt
    } = resolveFramePromptTargetState({
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      inputModalityState,
      nearbyHarvestTarget,
      gameplayOpeningMovementLocked,
      flowState: currentFlowState
    });
    const promptCopy = resolveFrameHudPromptCopy({
      gameplayOpeningMovementLocked,
      cinematicActive,
      tutorialActive,
      skillLearnActive,
      scriptedInteractionActive,
      placementPrompts: framePlacementPrompts,
      pendingPlacementPrompt,
      workbenchRotationPrompt,
      destroyableObjectPrompt,
      nearbyHarvestTarget,
      nearbyInteractable,
      activeQuest,
      transientNoticeRoute,
      activeMoveId,
      pendingWaterGunGroundCells
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

    updateHudSnapshotFrame(nextFrame, {
      gameplayOpeningCameraLocked,
      gameplayOpeningHudHidden,
      cinematicActive,
      tutorialActive,
      pokedexModalOpen,
      skillLearnActive,
      storyState: controls.storyState,
      inventory: controls.inventory,
      playerPosition: session.playerCharacter?.getPosition() || [0, 0, 0],
      promptCopy,
      inputModalityState
    });

    updateBaseRenderSnapshotFrame(nextFrame, {
      now,
      deltaTime,
      cinematicActive,
      nearbyInteractable,
      nearbyWorkbenchRotationTarget
    });

    // World-space UI and render preparation.
    const {
      canShowWorldSpaceUi,
      tangrowthPosition
    } = prepareWorldSpaceUiFrameContext({
      now,
      gameplayOpeningCameraLocked,
      flowState: currentFlowState,
      activeQuest,
      activeTask,
      activeSystemQuest
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
    const nearbyRepairBoxPrompt = getNearbyRepairBoxPrompt({
      playerPosition: session.playerCharacter?.getPosition?.(),
      repairBoxTargets: [
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
      ],
      promptDistance: REPAIR_BOX_PROMPT_DISTANCE,
      getEncounterRepairBoxPosition
    });
    const waterGunFirstUsePromptVisible =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      controls.playerSkills?.waterGun &&
      activeMoveId === "waterGun" &&
      !controls.storyState.flags[WATER_GUN_FIRST_USE_PROMPT_FLAG] &&
      !controls.isPrimaryActionActive?.();
    const leafageFirstUsePromptVisible =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      controls.playerSkills?.leafage &&
      !controls.storyState.flags.leafageTallGrassCount &&
      !controls.storyState.flags.leafageTallGrassHabitatCreated &&
      !controls.isPrimaryActionActive?.();
    const squirtleChargingPosition = getSquirtleWorldPosition();
    const squirtleWaterCharging =
      canShowWorldSpaceUi &&
      isSquirtleWaterCharging();
    const leafageInvalidTargetVisible =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      fieldMoveInvalidTargetPromptRuntime.isLeafageVisible(now);
    const fireInvalidTargetVisible =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      fieldMoveInvalidTargetPromptRuntime.isFireVisible(now);
    const fieldMoveSwitchPrompt = controls.getFieldMoveSwitchPrompt?.(now) || null;
    const freeBlockBuildCostMarker =
      canShowWorldSpaceUi && buildBlockEquipped ?
        getFreeBlockBuildCostMarker(freeBlockPreviewTarget) :
        null;
    const isPlayerInteractionPromptTarget =
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
          openingLeppaTreeRequestActive: isOpeningLeppaTreeRequestActive(controls.storyState),
          getLeppaTreeSurroundingGroundCells
        }) :
        null;
    const runBreadcrumbVisible =
      canShowWorldSpaceUi &&
      session.playerCharacter &&
      runBreadcrumbPromptRuntime.isVisible(now);
    const {
      shouldShowSolarStationPlacementPrompt,
      shouldShowGreenhousePlacementPrompt,
      shouldShowCampfirePlacementPrompt,
      shouldShowLeafDenKitPlacementPrompt,
      shouldShowPendingPlacementPrompt,
      shouldShowWorkbenchRotationPrompt,
      shouldShowDestroyableObjectPrompt,
      shouldShowFreeBlockBuildCostPrompt,
      shouldShowPlayerCounterPrompt,
      shouldShowFieldMoveSwitchPrompt,
      shouldShowSquirtleChargingPrompt,
      shouldShowInvalidLeafageUsePrompt,
      shouldShowInvalidFireUsePrompt,
      shouldShowTransientWorldPrompt,
      shouldShowDryGrassHydroPrompt,
      shouldShowRunBreadcrumbPrompt,
      shouldShowPlayerInteractionPrompt,
      shouldShowRepairBoxPrompt,
      shouldShowLeafageFirstUsePrompt,
      shouldShowWaterGunFirstUsePrompt
    } = resolveWorldPromptVisibility({
      canShowWorldSpaceUi,
      hasPlayerCharacter: Boolean(session.playerCharacter),
      nearbyRepairBoxPrompt,
      waterGunFirstUsePromptVisible,
      leafageFirstUsePromptVisible,
      squirtleWaterCharging,
      squirtleChargingPosition,
      leafageInvalidTargetVisible,
      fireInvalidTargetVisible,
      fieldMoveSwitchPrompt,
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      pendingPlacementPrompt,
      workbenchRotationPrompt,
      destroyableObjectPrompt,
      freeBlockBuildCostMarker,
      transientNoticeRoute,
      playerCounterPromptText,
      isPlayerInteractionPromptTarget,
      nearbyDryGrassWorldPromptTarget,
      runBreadcrumbVisible
    });
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

    updateWorldSpeechSnapshotFrame(nextFrame, {
      now,
      activeQuest,
      activeMoveId,
      tangrowthPosition,
      chopperAttentionCue,
      shouldShowTangrowthSpeech,
      shouldShowTangrowthLogChairSpeech,
      shouldShowTangrowthPokemonCenterSpeech,
      shouldShowTangrowthHouseSpeech,
      shouldShowTangrowthCelebrationSpeech,
      shouldShowChopperBulbasaurRepairBoxSpeech,
      shouldShowBulbasaurMissionSpeech,
      shouldShowBulbasaurWorkbenchGuideSpeech,
      shouldShowBulbasaurRequestReadySpeech,
      shouldShowBulbasaurStrawBedSpeech,
      shouldShowBulbasaurStrawBedCompleteSpeech,
      shouldShowCharmanderFollowSpeech,
      shouldShowCharmanderCelebrationSpeech
    });

    updateWorldPromptSnapshotFrame(nextFrame, {
      inputModalityState,
      shouldShowSolarStationPlacementPrompt,
      solarStationPlacementPreview,
      shouldShowDestroyableObjectPrompt,
      destroyableObjectPrompt,
      shouldShowGreenhousePlacementPrompt,
      greenhousePlacementPreview,
      shouldShowCampfirePlacementPrompt,
      campfirePlacementPreview,
      shouldShowLeafDenKitPlacementPrompt,
      leafDenKitPlacementPreview,
      shouldShowPendingPlacementPrompt,
      pendingPlacementIntent,
      nearbyHarvestTarget,
      shouldShowWorkbenchRotationPrompt,
      workbenchRotationPrompt,
      shouldShowFreeBlockBuildCostPrompt,
      freeBlockBuildCostMarker,
      shouldShowPlayerCounterPrompt,
      playerCounterPromptText,
      shouldShowFieldMoveSwitchPrompt,
      fieldMoveSwitchPrompt,
      shouldShowSquirtleChargingPrompt,
      squirtleChargingPosition,
      shouldShowInvalidLeafageUsePrompt,
      shouldShowInvalidFireUsePrompt,
      shouldShowTransientWorldPrompt,
      transientNoticeRoute,
      shouldShowDryGrassHydroPrompt,
      dryGrassHydroPromptText,
      shouldShowRunBreadcrumbPrompt,
      runBreadcrumbPromptText,
      shouldShowPlayerInteractionPrompt,
      playerInteractionPromptText,
      shouldShowRepairBoxPrompt,
      nearbyRepairBoxPrompt,
      shouldShowLeafageFirstUsePrompt,
      leafageEquipped,
      shouldShowWaterGunFirstUsePrompt
    });

    updateGroundCellHighlightFrame(nextFrame, {
      solarStationPlacementGroundCell,
      solarStationPowerRadiusGroundCells,
      solarStationPlacementGroundCells,
      greenhousePlacementGroundCell,
      greenhousePlacementGroundCells,
      campfirePlacementGroundCell,
      campfirePlacementGroundCells,
      leafDenKitPlacementGroundCell,
      leafDenKitPlacementGroundCells,
      workbenchRotationGroundCell,
      activeFireGroundCell,
      shouldShowGroundCellHighlight,
      highlightedGroundCell,
      highlightedGroundCellTargetState,
      highlightedGroundCellAbilityId,
      markedActionGroundCells,
      markedGroundCellPulsePhase,
      groundActionFeedbackFrame,
      fieldToolTargetPulseFrame
    });

    updateStatusPopupsFrame(nextFrame, {
      nearbyDryGrassHintTarget,
      questCompletionPop: gameplay.getQuestCompletionPop?.(),
      hasPlayerCharacter: Boolean(session.playerCharacter),
      getPlayerPosition: () => session.playerCharacter.getPosition(),
      gameplayOpeningCameraLocked,
      cinematicActive,
      tutorialActive,
      pokedexModalOpen
    });

    // Render snapshot preparation.
    let {
      grassBendPlayerPosition,
      natureRenderCenter,
      grassCollisionObjects,
      selectedRepairBoxParticleTarget,
      repairBoxRevealParticleTarget,
      shouldShowRepairBoxRustlingParticles
    } = prepareRenderSnapshotContext({ cinematicActive });

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
          ...getCampfireWoodPileBillboards({
            campfire: session.campfire,
            texture: session.woodTexture,
            uvRect: rendering.fullUvRect
          })
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
      const missionTargetPositions = getMissionTargetPositions({
        activeQuest,
        storyState: controls.storyState,
        getMissionTargetPositionsById
      });
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
        ...getSquirtleStaminaBillboards({
          position: getSquirtleWorldPosition(),
          fillTexture: session.squirtleWaterStaminaFillTexture,
          uvRect: rendering.fullUvRect,
          stamina: squirtleWaterStamina,
          billboardRight: camera.getBillboardAxes?.()?.right
        })
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
          position: getCharmanderWorldPosition(),
          fillTexture: session.charmanderCarbonFillTexture,
          backTexture: session.squirtleWaterStaminaBackTexture,
          uvRect: rendering.fullUvRect,
          energy: charmanderCarbonEnergy,
          billboardRight: camera.getBillboardAxes?.()?.right,
          cameraDirection: camera.getPose?.()?.direction
        })
      );
    }
    nextFrame.render.genericBillboards.push(
      ...getSquirtleWaterGunBillboards({
        action: session.squirtleWaterGunAction,
        texture: session.squirtleWaterSprayTexture,
        uvRect: rendering.fullUvRect,
        getMouthPosition: getSquirtleMouthPosition
      })
    );
    nextFrame.render.genericBillboards.push(
      ...getCharmanderFireBillboards({
        action: session.charmanderFireAction,
        texture: session.charmanderFireTexture || session.campfireTexture,
        uvRect: rendering.fullUvRect,
        getMouthPosition: getCharmanderMouthPosition
      })
    );
    nextFrame.render.genericBillboards.push(
      ...getBulbasaurLeafageBillboards({
        action: session.bulbasaurLeafageAction,
        texture: session.natureRevivalSparkTexture,
        uvRect: rendering.fullUvRect,
        getEmitterPosition: getBulbasaurGrowEmitterPosition
      })
    );
    nextFrame.render.genericBillboards.push(
      ...getSquirtleChargingBillboards({
        active: isSquirtleWaterCharging(),
        position: getSquirtleWorldPosition(),
        texture: session.squirtleChargingParticleTexture,
        uvRect: rendering.fullUvRect,
        now
      })
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
