import { createGameLoopFrameClock } from "./gameLoopFrameClock.js";
import { createGameLoopFrameRuntime } from "./gameLoopFrameRuntime.js";
import { isRevealBoxBotVisible } from "./botRevealMotion.js";
import { createCameraDebugRuntime } from "./camera/cameraDebugRuntime.js";
import { createCameraDebugFrameState } from "./camera/cameraDebugFrameState.js";
import { createBeeFieldRuntime } from "./companions/beeFieldRuntime.js";
import { createBulbasaurWorkbenchGuideRuntime } from "./companions/bulbasaurWorkbenchGuideRuntime.js";
import { createChopperAttentionCueRuntime, resolveChopperAttentionCue } from "./companions/chopperAttentionCueRuntime.js";
import { createCompanionFrameRuntime } from "./companions/companionFrameRuntime.js";
import { createCompanionGroundPatrolFrameRuntime } from "./companions/companionGroundPatrolFrameRuntime.js";
import { createCompanionIdleMotionRuntime } from "./companions/companionIdleMotionRuntime.js";
import { createCompanionModelSyncRuntime } from "./companions/companionModelSyncRuntime.js";
import { createCompanionRepairBoxModelRuntime } from "./companions/companionRepairBoxModelRuntime.js";
import { processFollowerCallFrame } from "./companions/followerCallFrame.js";
import { createRepairBoxRevealOpeningRuntime } from "./companions/repairBoxRevealOpeningRuntime.js";
import { createSquirtleReassemblyRuntime } from "./companions/squirtleReassemblyRuntime.js";
import {
  buildFoundationBuildZoneBlockers as buildFoundationBuildZoneBlockersWithSources,
  applyFoundationBuildZoneCompleteEffects,
  createUnavailableFoundationBuildZoneValidation,
  findAvailableBuilderTutorialFoundationBuildZone as findAvailableBuilderTutorialFoundationBuildZoneWithConfig,
  getBuilderTutorialFoundationZoneSignature,
  isBuilderTutorialFoundationBuildZoneBlocked as isBuilderTutorialFoundationBuildZoneBlockedWithBlockers,
  isFoundationFreeBlockAllowedInZone as isFoundationFreeBlockAllowedInZoneWithState,
  shouldShowFoundationBuildZone as shouldShowFoundationBuildZoneWithState
} from "./construction/foundationBuildZone.js";
import {
  tryRemoveNearbyFreeBlock as tryRemoveNearbyFreeBlockWithRuntime
} from "./construction/freeBlockRemoval.js";
import {
  getFreeBlockPreviewTarget as getFreeBlockPreviewTargetWithRuntime,
  resolveFreeBlockBuildTarget as resolveFreeBlockBuildTargetWithRuntime,
  syncFreeBlockBuildPreview as syncFreeBlockBuildPreviewWithRuntime
} from "./construction/freeBlockPreview.js";
import {
  applyFreeBlockPlacementResult,
  applyTimburrBuildBlockImpact as applyTimburrBuildBlockImpactWithRuntime,
  movePlayerAwayFromPlacedFreeBlock as movePlayerAwayFromPlacedFreeBlockWithRuntime,
  tryPlaceFreeBlockFromBuildInput as tryPlaceFreeBlockFromBuildInputWithRuntime
} from "./construction/freeBlockPlacementResult.js";
import { createFreeBlockBuildSessionRuntime } from "./construction/freeBlockBuildSessionRuntime.js";
import { createLeafDenConstructionPresentationRuntime } from "./construction/leafDenConstructionPresentationRuntime.js";
import {
  ensurePlayerHouseModelInstances as ensurePlayerHouseModelInstancesWithSession,
  syncCampfireTrainHouseModelInstance as syncCampfireTrainHouseModelInstanceWithSession,
  syncGreenhouseModelInstances as syncGreenhouseModelInstancesWithSession,
  syncLeafDenModelInstance as syncLeafDenModelInstanceWithSession,
  syncPlayerHouseModelInstances as syncPlayerHouseModelInstancesWithSession
} from "./construction/constructionHouseModelInstances.js";
import {
  moveConstructionHelperToLeafDen as moveConstructionHelperToLeafDenWithConfig
} from "./construction/constructionHelperMotion.js";
import {
  createConstructionPlacementFrameRuntime,
  resolveActiveConstructionPlacementPreviews,
  rotateActiveConstructionPlacementPreviews,
  updateLeafDenKitConstructionPlacementPreview,
  updateRectangularConstructionPlacementPreview,
  updateSolarStationConstructionPlacementPreview
} from "./construction/constructionPlacementFrameRuntime.js";
import {
  getNearestRotatableWorkbenchPlacement as getNearestRotatableWorkbenchPlacementFromTargets,
  getRotatableWorkbenchPlacementCandidates as getRotatableWorkbenchPlacementCandidatesFromTargets,
  getWorkbenchRotationTargetDistance as getWorkbenchRotationTargetDistanceFromTargets,
  getWorkbenchRotationTargetSize as getWorkbenchRotationTargetSizeFromTargets,
  getWorkbenchRotationTriggerDistance as getWorkbenchRotationTriggerDistanceFromTargets
} from "./construction/workbenchRotationTargets.js";
import {
  cancelPendingWorkbenchPlacementIntent,
  hasPendingWorkbenchPlacementIntent
} from "./construction/pendingPlacementIntent.js";
import {
  buildFreeBlockBuildCostMarker,
  getFreeBlockInvalidPlacementNotice
} from "./construction/placementPreviewPrompts.js";
import {
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
  buildSolarStationFieldMarkedGroundCells as buildSolarStationFieldMarkedGroundCellsWithConfig,
  doPlacementRectsOverlap,
  getFoundationBuildZoneWorldRect as getFoundationBuildZoneWorldRectWithGrid,
  getFreeBlockCellWorldPosition as getFreeBlockCellWorldPositionWithGrid,
  getPlacementPreviewFootprintWorldSize,
  getPlacementCollisionSize,
  getPlacementRect,
  getRotatedPlacementSize as getRotatedPlacementSizeWithConfig,
  normalizePlacementYaw
} from "./construction/placementGeometry.js";
import { createCompanionFollowDirectionRuntime } from "./companions/companionFollowDirectionRuntime.js";
import { createCompanionFollowMovementRuntime } from "./companions/companionFollowMovementRuntime.js";
import {
  resolveCompanionFollowFormationIndexFromState,
  resolveCompanionFollowDistance,
  resolveCompanionFollowSpeed
} from "./companions/companionFollowMotion.js";
import {
  createCompanionLostHintRuntime,
  resolveWaterGunCompanionLostHint
} from "./companions/companionLostHintRuntime.js";
import { updateCompanionPresentationFrame } from "./companions/companionPresentationFrame.js";
import {
  createFoundationBuildZoneCameraFocusPose,
  createFoundationBuildZoneCameraFocusRuntime
} from "./camera/foundationBuildZoneCameraFocusRuntime.js";
import { createGameplayCameraFrameRuntime } from "./camera/gameplayCameraFrameRuntime.js";
import {
  resolveGameplayActionPermission,
  resolveGameLoopBlockers,
  resolvePlayerMovementPermission,
  resolveWorldSpaceUiVisibility
} from "./gameLoopFramePolicies.js";
import { createFieldMoveInvalidTargetPromptRuntime } from "./fieldMoveInvalidTargetPromptRuntime.js";
import {
  createBuildBlockRuntime,
  resolveConstructionDisplacementPosition,
  resolveTimburrBuildBlockApproachPosition
} from "./fieldMoveRuntime/buildBlockRuntime.js";
export {
  resolveConstructionDisplacementPosition,
  resolveTimburrBuildBlockApproachPosition
} from "./fieldMoveRuntime/buildBlockRuntime.js";
import { createCompanionAbilityResourcesRuntime } from "./fieldMoveRuntime/companionAbilityResourcesRuntime.js";
import {
  BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
  findAlreadyResolvedFieldMoveGroundCell,
  getBoulderShadedTaskGroundCells,
  getFreeRoamRestorationGroundCells,
  getGrowFirstHabitatTaskGroundCells,
  isDryGrassHydroMissionActive
} from "./fieldMoveRuntime/fieldMoveGroundTargets.js";
import { createFieldMoveImpactRuntime } from "./fieldMoveRuntime/fieldMoveImpactRuntime.js";
import { createFireRuntime } from "./fieldMoveRuntime/fireRuntime.js";
import { createLeafageRuntime } from "./fieldMoveRuntime/leafageRuntime.js";
import { createWaterGunRuntime } from "./fieldMoveRuntime/waterGunRuntime.js";
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
  getGardenProgressSnapshot,
  getTreeRevivalSnapshot
} from "./fieldMoveRuntime/natureProgressSnapshots.js";
import { getDestroyableLandscapePatchForInteractOptions as getDestroyableLandscapePatchForInteractOptionsWithSources } from "./fieldMoveRuntime/destroyableLandscapePatchTarget.js";
import { createGearPickupParticleRuntime } from "./gearPickupParticleRuntime.js";
import { createGroundActionFeedbackRuntime } from "./groundActionFeedbackRuntime.js";
import {
  getActorDebugPosition,
  getInteractionDebugColliders as getInteractionDebugCollidersWithConfig
} from "./interactionDebugColliders.js";
import { createLandscapeCutEffectRuntime } from "./landscapeCutEffectRuntime.js";
import { updateLeppaTreeMusicNotes } from "./leppaTreeMusicNotes.js";
import { getMissionTargetPositionsById as getMissionTargetPositionsByIdWithConfig } from "./missionTargetPositionLookup.js";
import {
  getLogicalFacingYaw as getModelLogicalFacingYaw,
  getModelYawToward,
  getYawToward
} from "./modelFacing.js";
import { createMovementQuestRuntime } from "./movementQuestRuntime.js";
import { createNpcConversationFocusRuntime } from "./npcs/npcConversationFocusRuntime.js";
import { createPlayerMovementFrameRuntime } from "../player/playerMovementFrame.js";
import { createPlayerModelRuntime } from "../player/playerModelMotion.js";
import { createPlayerResourceCollectionFrameRuntime } from "../player/playerResourceCollectionFrame.js";
import { createPlayerCounterPromptRuntime } from "./playerCounterPromptRuntime.js";
import { resolveGameplayPromptFrameState } from "./presentation/gameplayPromptTargetFrameState.js";
import { resolveWorldSpacePresentationFrameState } from "./presentation/worldSpacePresentationFrameState.js";
import { updateWorldSpacePresentationSnapshotFrame } from "./presentation/worldSpacePresentationSnapshotFrame.js";
import { updateLeppaTreeDance } from "./presentation/leppaTreeDance.js";
import { createBaseRenderSnapshotFrameRuntime } from "./presentation/baseRenderSnapshotFrame.js";
import { prepareRenderSnapshotContext as prepareRenderSnapshotContextWithSources } from "./presentation/renderSnapshotContext.js";
import { createSupplyCounterPromptController } from "./presentation/supplyCounterPrompt.js";
import { createSupplyPickupFeedbackRuntime } from "./presentation/supplyPickupFeedbackRuntime.js";
import { createTreeRevivalLeafBurstFrameRuntime } from "./presentation/treeRevivalLeafBurstFrameRuntime.js";
import { updateHudSnapshotFrame } from "./presentation/hudSnapshotFrame.js";
import { resolveGameplayTargetFrameState } from "./presentation/gameplayTargetFrameState.js";
import {
  resolveGameplayGroundCellHighlightFrameState,
  resolveGameplayGroundGuidanceFrameState
} from "./presentation/groundCellHighlightFrameState.js";
import { getGrassCollisionObjects } from "./presentation/grassCollisionObjects.js";
import {
  updateNatureGrassRenderFrame,
  updateNatureRenderFrame
} from "./presentation/natureRenderFrame.js";
import { isWorldPositionWithinRenderDistance } from "./presentation/renderDistance.js";
import { updateWorldObjectBillboardFrame } from "./presentation/worldObjectBillboardFrame.js";
import { createRepairBoxMotionRuntime } from "./repairBoxMotionRuntime.js";
import {
  getRepairBoxRevealParticleTarget,
  getSelectedRepairBoxParticleTarget
} from "./repairBoxParticleTargets.js";
import { createRepairBoxRevealFlashRuntime } from "./repairBoxRevealFlashRuntime.js";
import { appendRebirthOfNatureGhostTree } from "./rebirthOfNatureGhostTree.js";
import { createRunBreadcrumbPromptRuntime } from "./runBreadcrumbPromptRuntime.js";
import { createSnowstormFogRuntime } from "./snowstormFogRuntime.js";
import {
  getTallGrassInstanceScale,
  getTallGrassYaw
} from "./tallGrassMotion.js";
import { applyTrainHouseDance } from "./trainHouseDance.js";
import { createTreeRevivalLeafBurstRuntime } from "./treeRevivalLeafBurstRuntime.js";
import { createWaterGunSfxBurstRuntime } from "./waterGunSfxBurstRuntime.js";
import { createWoodCollectPopRuntime } from "./woodCollectPopRuntime.js";
import { createWorkbenchRotationRuntime } from "./construction/workbenchRotationRuntime.js";
import { createRustlingGrassEventRuntime } from "./world/rustlingGrassEventRuntime.js";
import { createWorldCellPlannerInteractionRuntime } from "./world/worldCellPlannerInteractionRuntime.js";

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
  applyTrainHouseDance
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
  createCameraZoomPresetController,
  restoreActiveZoomPresetOnMovement
} from "./camera/cameraZoomPresetController.js";
import { createPlacementCameraAssist } from "./camera/placementCameraAssist.js";
import {
  getSnowstormBillboards,
  getSnowstormFogIntensity,
  updateSnowstormParticleField
} from "../session/snowstormParticleField.js";
import { PLAYER_SPEED } from "../session/configurePlayerSpawner.js";
import {
  getNatureRevivalBillboards,
  updateNatureRevivalEffects
} from "../session/natureRevivalEffects.js";
import { getColliderGizmoBillboards } from "../session/colliderGizmos.js";
import { updateIntroRoomFrame } from "../scenes/introRoom/introRoomSequence.js";
import { createGameplayCameraDirector } from "./gameplayCameraDirector.js";
import { SOUND_EVENT_IDS } from "./soundEventRuntime.js";
import {
  appendGameplayOpeningShipBillboards,
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
import { canUseCharmanderFireWithCarbon } from "../../world/gameplayInteractions.js";
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
  createCompanionConstructionBlockerRuntime,
  createPlayerConstructionPlacementBlockers,
  createPlayerConstructionTerrainColliders,
  isPositionInsideTerrainColliderFootprint
} from "../gameplay/placementBlockers.js";
import { createGridSystem } from "../gameplay/gridBuildingSystem.js";
import {
  FREE_BLOCK_TYPES,
  resolveFreeBlockTargetCell
} from "../gameplay/freeBlockBuildSystem.js";
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
import { createGameplayAudioRuntime } from "./gameplayAudioRuntime.js";
import { createTrainHouseMusicRuntime } from "./audio/trainHouseMusicRuntime.js";
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
const RUN_BREADCRUMB_PROMPT_DURATION_MS = 4200;
const SNOWSTORM_FOG_MAX_OPACITY = 0.54;
const SNOWSTORM_FOG_OPACITY_EASE = 6.2;
const LEAFAGE_INVALID_TARGET_PROMPT_DURATION_MS = 1600;
const FIRE_INVALID_TARGET_PROMPT_DURATION_MS = 1600;
const GROUND_ACTION_FEEDBACK_DURATION_MS = 1000;
const FIELD_TOOL_TARGET_PULSE_DURATION_MS = 500;
const FIELD_TOOL_TARGET_PULSE_MIN_SCALE = 0.7;
const FIELD_TOOL_TARGET_PULSE_FLASH_BRIGHTNESS = 0.4;
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
const PLAYER_CONSTRUCTION_MODEL_PREPARE_DISTANCE = 58;
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
  const trainHouseMusicRuntime = createTrainHouseMusicRuntime({
    audio,
    getPlayerPosition: () => session.playerCharacter?.getPosition?.() || null,
    getStoryState: () => controls.storyState,
    getTrainHousePosition: () => session.campfire?.position || null,
    getMusicRuntime: () => gameplay.musicRuntime
  });
  const supplyPickupFeedbackRuntime = createSupplyPickupFeedbackRuntime({
    audio,
    camera,
    controls,
    getNowMs: getRuntimeNowMs,
    hud,
    itemIds: SUPPLY_PICKUP_FLY_ITEM_IDS,
    session,
    supplyCounterPromptController,
    worldCanvas
  });
  const queueSupplyPickupFlyItems = supplyPickupFeedbackRuntime.queueFlyItems;
  const queueChangedSupplyPickupFlyItems = supplyPickupFeedbackRuntime.queueChangedFlyItems;
  const pushSupplyResourceCollectFeedback =
    supplyPickupFeedbackRuntime.pushResourceCollectFeedback;
  const fieldMoveInvalidTargetPromptRuntime = createFieldMoveInvalidTargetPromptRuntime({
    leafageDurationMs: LEAFAGE_INVALID_TARGET_PROMPT_DURATION_MS,
    fireDurationMs: FIRE_INVALID_TARGET_PROMPT_DURATION_MS
  });
  const freeBlockBuildSessionRuntime = createFreeBlockBuildSessionRuntime({
    session,
    defaultGridConfig: FREE_BLOCK_BUILD_GRID_CONFIG,
    initialBlockType: FREE_BLOCK_TYPES.WALL
  });
  const worldCellPlannerInteractionRuntime = createWorldCellPlannerInteractionRuntime({
    camera,
    getGridConfig: () => getFreeBlockBuildGridConfig(),
    hud,
    maxDistancePx: WORLD_CELL_PLANNER_PICK_MAX_DISTANCE_PX,
    rendering,
    session,
    worldCanvas
  });
  const rustlingGrassEventRuntime = createRustlingGrassEventRuntime({
    getStoryState: () => controls.storyState
  });
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
  const treeRevivalLeafBurstFrameRuntime = createTreeRevivalLeafBurstFrameRuntime({
    leafBurstRuntime: treeRevivalLeafBurstRuntime,
    session,
    getStoryState: () => controls.storyState,
    rendering
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
  const companionConstructionBlockerRuntime = createCompanionConstructionBlockerRuntime({
    getColliders: getPlayerConstructionTerrainColliders,
    playBlockedSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
    pushNotice: (message) => hud?.pushNotice?.(message)
  });
  const companionFollowMovementRuntime = createCompanionFollowMovementRuntime({
    getPlayerPosition: () => session.playerCharacter?.getPosition?.(),
    getPlayerYaw: () => session.playerModelInstance?.yaw,
    getFollowDirection: (yaw) => companionFollowDirectionRuntime.get(yaw),
    tryMoveCompanionToPosition: companionConstructionBlockerRuntime.tryMove,
    getModelYawToward: getRobotModelYawToward,
    resolveFollowFormationIndex: getCompanionFollowFormationIndex,
    resolveFollowDistance: resolveCompanionFollowDistance,
    arriveDistance: COMPANION_FOLLOW_SLOT_ARRIVE_DISTANCE
  });
  const companionIdleMotionRuntime = createCompanionIdleMotionRuntime({
    getPlayerPosition: () => session.playerCharacter?.getPosition?.(),
    getModelYawToward: getRobotModelYawToward,
    attentionDistance: BOT_PLAYER_ATTENTION_DISTANCE,
    patrolSpeed: ROBOT_IDLE_PATROL_SPEED,
    patrolPauseDuration: ROBOT_IDLE_PATROL_PAUSE_DURATION,
    patrolArriveDistance: ROBOT_IDLE_PATROL_ARRIVE_DISTANCE
  });
  const bulbasaurWorkbenchGuideRuntime = createBulbasaurWorkbenchGuideRuntime({
    session,
    controls,
    workbenchPosition: WORKBENCH_POSITION,
    getYawToward: getRobotModelYawToward,
    config: {
      start: BULBASAUR_WORKBENCH_GUIDE_START,
      speed: BULBASAUR_WORKBENCH_GUIDE_SPEED,
      waypointDistance: BULBASAUR_WORKBENCH_GUIDE_WAYPOINT_DISTANCE,
      rampColliderId: BULBASAUR_WORKBENCH_GUIDE_RAMP_COLLIDER_ID,
      rampApproachMargin: BULBASAUR_WORKBENCH_GUIDE_RAMP_APPROACH_MARGIN,
      sideApproachMargin: BULBASAUR_WORKBENCH_GUIDE_SIDE_APPROACH_MARGIN,
      modelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET
    }
  });
  const companionGroundPatrolFrameRuntime = createCompanionGroundPatrolFrameRuntime({
    session,
    controls,
    followMovement: companionFollowMovementRuntime,
    idleMotion: companionIdleMotionRuntime,
    getSquirtleWaterGunQueue: () => waterGunRuntime.getQueue(),
    isBulbasaurWorkbenchGuideActive: () => bulbasaurWorkbenchGuideRuntime.isActive(),
    resolveFollowFormationIndex: getCompanionFollowFormationIndex,
    resolveFollowDistance: resolveCompanionFollowDistance,
    syncSquirtleModelInstance: () => companionModelSyncRuntime.syncSquirtle(),
    syncBulbasaurModelInstance: () => companionModelSyncRuntime.syncBulbasaur(),
    config: {
      squirtleFollowSpeed: SQUIRTLE_FOLLOW_SPEED,
      squirtleFollowDistance: SQUIRTLE_FOLLOW_DISTANCE,
      squirtleModelFaceYawOffset: SQUIRTLE_MODEL_FACE_YAW_OFFSET,
      squirtleIdlePatrolRadius: SQUIRTLE_IDLE_PATROL_RADIUS,
      bulbasaurFollowSpeed: BULBASAUR_FOLLOW_SPEED,
      bulbasaurFollowDistance: BULBASAUR_FOLLOW_DISTANCE,
      bulbasaurModelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET,
      bulbasaurIdlePatrolRadius: BULBASAUR_IDLE_PATROL_RADIUS
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
  const companionRepairBoxModelRuntime = createCompanionRepairBoxModelRuntime({
    motion: repairBoxMotionRuntime,
    getRepairBoxPosition: getEncounterRepairBoxPosition,
    clamp01,
    easeOutCubic,
    isRevealBoxBotVisible,
    config: {
      modelPitchOffset: ROBOT_REPAIR_BOX_MODEL_PITCH_OFFSET,
      openPitch: ROBOT_REPAIR_BOX_OPEN_PITCH,
      openRoll: ROBOT_REPAIR_BOX_OPEN_ROLL,
      openLift: ROBOT_REPAIR_BOX_OPEN_LIFT,
      openBackstep: ROBOT_REPAIR_BOX_OPEN_BACKSTEP,
      revealBoxDuration: BULBASAUR_REVEAL_BOX_DURATION,
      revealBoxOpenStartProgress: BULBASAUR_REVEAL_BOX_OPEN_START_PROGRESS,
      revealBoxShakeEndProgress: BULBASAUR_REVEAL_BOX_SHAKE_END_PROGRESS,
      revealBoxSpinAcceleration: BULBASAUR_REVEAL_BOX_SPIN_ACCELERATION,
      repairBoxRustleLift: BULBASAUR_REPAIR_BOX_RUSTLE_LIFT,
      repairBoxRustleRoll: BULBASAUR_REPAIR_BOX_RUSTLE_ROLL,
      repairBoxRustlePitch: BULBASAUR_REPAIR_BOX_RUSTLE_PITCH,
      repairBoxRustleYaw: BULBASAUR_REPAIR_BOX_RUSTLE_YAW,
      investigationOffset: CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET,
      activeTint: REPAIR_BOX_ACTIVE_TINT,
      activeTintStrength: REPAIR_BOX_ACTIVE_TINT_STRENGTH,
      inactiveAlpha: REPAIR_BOX_INACTIVE_ALPHA
    }
  });
  const companionModelSyncRuntime = createCompanionModelSyncRuntime({
    session,
    repairBoxModelRuntime: companionRepairBoxModelRuntime,
    syncInteractablePosition,
    config: {
      robotModelScale: ROBOT_MODEL_SCALE,
      bulbasaurModelScale: BULBASAUR_ROBOT_MODEL_SCALE,
      charmanderModelScale: CHARMANDER_MODEL_SCALE,
      timburrModelScale: TIMBURR_MODEL_SCALE
    }
  });
  const squirtleReassemblyRuntime = createSquirtleReassemblyRuntime({
    session,
    clamp01,
    easeOutCubic,
    lerp,
    partScale: SQUIRTLE_REASSEMBLY_PART_SCALE,
    syncSquirtleModelInstance: () => companionModelSyncRuntime.syncSquirtle()
  });
  const beeFieldRuntime = createBeeFieldRuntime({
    session,
    controls,
    repairBoxRuntime: companionRepairBoxModelRuntime,
    syncInteractablePosition,
    config: {
      activeTint: REPAIR_BOX_ACTIVE_TINT,
      activeTintStrength: REPAIR_BOX_ACTIVE_TINT_STRENGTH
    }
  });
  const waterGunSfxBurstRuntime = createWaterGunSfxBurstRuntime();
  const companionAbilityResourcesRuntime = createCompanionAbilityResourcesRuntime({
    session,
    controls,
    clamp01,
    moveValueToward,
    onSquirtleRechargeComplete: startNextQueuedSquirtleWaterGunAction
  });
  const leafDenConstructionPresentationRuntime = createLeafDenConstructionPresentationRuntime({
    session,
    getStoryState: () => controls.storyState
  });
  const npcConversationFocusRuntime = createNpcConversationFocusRuntime({
    controls,
    dialogueCamera,
    gameplayDialogue,
    getSquirtle: () => session.actTwoSquirtle,
    getSquirtleModelYawToward,
    getYawToward
  });
  const waterGunRuntime = createWaterGunRuntime({
    session,
    resources: companionAbilityResourcesRuntime,
    getSquirtle: () => session.actTwoSquirtle,
    getPlayerPosition: () => session.playerCharacter?.getPosition?.() || null,
    getGroundCellCenterPosition,
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      getSquirtleWaterGunApproachPosition(targetPosition, playerPosition),
    getModelYawToward: getSquirtleModelYawToward,
    tryMoveCompanionToPosition: companionConstructionBlockerRuntime.tryMove,
    isPositionBlocked: companionConstructionBlockerRuntime.isBlocked,
    syncSquirtle: () => companionModelSyncRuntime.syncSquirtle(),
    applyImpact: (action) => fieldMoveImpactRuntime.applySquirtleWaterGunImpact(action),
    onBlocked: () => companionConstructionBlockerRuntime.cancelBlockedAction(SANDBOTS_BOT_NAMES.hydro)
  });
  const fireRuntime = createFireRuntime({
    session,
    getCharmander: () => session.charmanderEncounter,
    isBusy: isLeafDenConstructionActive,
    onBusy: () => hud?.pushNotice?.(LEAF_DEN_BUSY_NOTICE),
    hasFireCarbon: hasCharmanderFireCarbon,
    getGroundCellCenterPosition,
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      getCharmanderFireApproachPosition(targetPosition, playerPosition),
    getModelYawToward: (fromPosition, toPosition) =>
      getRobotModelYawToward(
        fromPosition,
        toPosition,
        CHARMANDER_MODEL_FACE_YAW_OFFSET
      ),
    tryMoveCompanionToPosition: companionConstructionBlockerRuntime.tryMove,
    isPositionBlocked: companionConstructionBlockerRuntime.isBlocked,
    syncCharmander: () => companionModelSyncRuntime.syncCharmander(),
    applyImpact: (action) => fieldMoveImpactRuntime.applyCharmanderFireImpact(action),
    onBlocked: () => companionConstructionBlockerRuntime.cancelBlockedAction(SANDBOTS_BOT_NAMES.thermal)
  });
  const leafageRuntime = createLeafageRuntime({
    session,
    getBulbasaur: () => session.bulbasaurEncounter,
    isBusy: () => bulbasaurWorkbenchGuideRuntime.isActive(),
    getGroundCellCenterPosition,
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      getBulbasaurLeafageApproachPosition(targetPosition, playerPosition),
    getModelYawToward: (fromPosition, toPosition) =>
      getRobotModelYawToward(
        fromPosition,
        toPosition,
        BULBASAUR_MODEL_FACE_YAW_OFFSET
      ),
    tryMoveCompanionToPosition: companionConstructionBlockerRuntime.tryMove,
    isPositionBlocked: companionConstructionBlockerRuntime.isBlocked,
    syncBulbasaur: () => companionModelSyncRuntime.syncBulbasaur(),
    applyImpact: (action) => fieldMoveImpactRuntime.applyBulbasaurLeafageImpact(action),
    onBlocked: () => companionConstructionBlockerRuntime.cancelBlockedAction(SANDBOTS_BOT_NAMES.grow)
  });
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
  const buildBlockRuntime = createBuildBlockRuntime({
    session,
    controls,
    getTimburr: () => session.timburrEncounter,
    resolveTarget: resolveFreeBlockBuildTarget,
    getApproachPosition: ({ targetPosition, playerPosition }) =>
      getTimburrBuildBlockApproachPosition(targetPosition, playerPosition),
    getApproachBlockers: companionConstructionBlockerRuntime.getBlockers,
    shouldCastFromBlockedApproach: shouldTimburrBuildBlockCastFromBlockedApproach,
    tryMoveCompanionToPosition: companionConstructionBlockerRuntime.tryMove,
    getModelYawToward: getRobotModelYawToward,
    applyImpact: applyTimburrBuildBlockImpact,
    onBlocked: () => companionConstructionBlockerRuntime.cancelBlockedAction(SANDBOTS_BOT_NAMES.builder),
    config: {
      modelFaceYawOffset: TIMBURR_MODEL_FACE_YAW_OFFSET
    }
  });
  const constructionPlacementFrameRuntime = createConstructionPlacementFrameRuntime({
    controls,
    getMovementAxes: () => camera.getMovementAxes(),
    getPlayerPosition: () => session.playerCharacter?.getPosition?.() || null,
    session,
    placementContracts: PLACEMENT_CONTRACTS,
    workbenchRotationRuntime,
    callbacks: {
      rotateActivePlacementPreview,
      rotateNearbyWorkbenchConstruction,
      hasActivePlacementPreview,
      hasPendingWorkbenchPlacementIntent,
      clearWorkbenchConstructionRotationSelection,
      cancelActivePlacementPreviews,
      cancelPendingWorkbenchPlacementIntentWithNotice,
      isBuildBlockFieldMoveEquipped,
      startTimburrBuildBlockAction: (options) => buildBlockRuntime.startAction(options),
      playCancelSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
      pushNotice: (message) => hud?.pushNotice?.(message),
      getFreeBlockInvalidPlacementNotice,
      updateSolarStationPlacementPreview,
      updateGreenhousePlacementPreview,
      updateCampfirePlacementPreview,
      updateLeafDenKitPlacementPreview,
      updateSolarStationSpawnEffect,
      syncSolarStationWorkbenchRotationVisual,
      syncFreeBlockBuildPreview,
      updateBuildBlockDebugOverlay: (debug) => buildBlockDebugOverlay.update(debug)
    }
  });
  const baseRenderSnapshotFrameRuntime = createBaseRenderSnapshotFrameRuntime({
    camera,
    worldCanvas,
    session,
    controls,
    gameFlowValues,
    construction: {
      syncActiveRepairBoxHighlight,
      syncGreenhouseModelInstance,
      syncCampfireTrainHouseModelInstance,
      isLeafDenConstructionActive,
      syncLeafDenConstructionClouds,
      syncConstructionCloudBurstEffects,
      syncLeafDenModelInstance,
      syncPlayerHouseModelInstances
    },
    applyInteractionObjectHighlight,
    getGameplayOpeningShipSceneObjects,
    getSquirtleAssemblySceneObjects: (sceneObjects, squirtle) =>
      squirtleReassemblyRuntime.getSceneObjects(sceneObjects, squirtle),
    resolvePsxDistanceFogSettings
  });
  const playerModelRuntime = createPlayerModelRuntime({
    moveValueToward,
    rotateAngleToward,
    playJumpSound: () => playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_JUMP)
  });
  const playerMovementFrameRuntime = createPlayerMovementFrameRuntime({
    session,
    movementPolicy: { resolvePlayerMovementPermission },
    model: playerModelRuntime,
    followDirection: companionFollowDirectionRuntime,
    movementQuest: movementQuestRuntime,
    runBreadcrumbPrompt: runBreadcrumbPromptRuntime,
    callbacks: {
      isMovementQuestActive: () => gameplay.getActiveSystemQuest?.()?.id === "learn-to-move",
      isRunActive: () => controls.isRunActive?.(),
      reportMovement: () => gameplay.recordQuestEvent?.({
        type: "MOVE",
        targetId: "player"
      }),
      onPlayerMoved: ({
        movedDistance,
        nextPlayerPosition,
        gameplayOpeningCameraLocked,
        foundationBuildZoneCameraFocusActive,
        tutorialActive
      }) => {
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
      }
    }
  });

  const companionFrameRuntime = createCompanionFrameRuntime({
    session,
    controls,
    rendering,
    audio,
    guidePosition: RUINED_POKEMON_CENTER_GUIDE_POSITION,
    callbacks: {
      isDialogueActive: () => gameplayDialogue.isActive(),
      isGameplayActive: () => isGameFlow(gameFlowValues.GAMEPLAY),
      getRepairBoxInvestigationTarget: () => companionRepairBoxModelRuntime.getInvestigationTarget({
        encounter: session.bulbasaurEncounter,
        flags: controls.storyState?.flags,
        groundGrassPatches: session.groundGrassPatches
      }),
      isWaterGunSfxBurstActive: (nowSeconds) => waterGunSfxBurstRuntime.isActive(nowSeconds),
      updateBulbasaurRepairBoxRustle: (deltaTime) =>
        companionRepairBoxModelRuntime.updateRepairBoxRustle(session.bulbasaurEncounter, deltaTime),
      updateBulbasaurEncounter,
      updateCharmanderEncounter,
      updateCharmanderFireAction: (deltaTime) => fireRuntime.updateAction(deltaTime),
      updateTimburrEncounter,
      updateTimburrBuildBlockAction: (deltaTime, now) =>
        buildBlockRuntime.updateAction(deltaTime, now),
      syncCompanionRepairModules: () => companionModelSyncRuntime.syncRepairModules(),
      syncBeeFieldRepairBox: () => beeFieldRuntime.syncRepairBox(),
      syncBeeFieldBees: (deltaTime) => beeFieldRuntime.syncBees(deltaTime),
      updateSquirtleReassembly: (deltaTime) => squirtleReassemblyRuntime.update(deltaTime),
      updateSquirtleWaterStamina: (deltaTime) =>
        companionAbilityResourcesRuntime.updateSquirtleWaterStamina(deltaTime),
      updateCharmanderCarbonEnergy: (deltaTime) =>
        companionAbilityResourcesRuntime.updateCharmanderCarbonEnergy(deltaTime),
      updateSquirtleWaterGunAction: (deltaTime) => waterGunRuntime.updateAction(deltaTime),
      updateBulbasaurLeafageAction: (deltaTime) => leafageRuntime.updateAction(deltaTime),
      updateSquirtleIdlePatrol: (deltaTime, frameState) =>
        companionGroundPatrolFrameRuntime.updateSquirtle(deltaTime, frameState),
      updateBulbasaurIdlePatrol: (deltaTime, frameState) =>
        companionGroundPatrolFrameRuntime.updateBulbasaur(deltaTime, frameState)
    }
  });
  const playerResourceCollectionFrameRuntime = createPlayerResourceCollectionFrameRuntime({
    session,
    controls,
    gameplay,
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
    feedback: {
      triggerWoodCollectPop: (woodDropSnapshots) => woodCollectPopRuntime.trigger(woodDropSnapshots),
      playWoodGrab: (options) => audio.playWoodGrab(options),
      syncInventoryUi: (inventory) => hud.syncInventoryUi(inventory),
      queueSupplyPickupFlyItems,
      pushNotice: (notice) => hud.pushNotice(notice),
      triggerSupplyCounterPrompt: (itemId, inventory, promptNow) =>
        supplyCounterPromptController.trigger(itemId, inventory, promptNow),
      pushSupplyResourceCollectFeedback,
      triggerGearPickupParticles: (positions) => gearPickupParticleRuntime.trigger(positions),
      getHabitatCheckCompleteNotice: () =>
        getColonyFeedbackNotice(COLONY_FEEDBACK_IDS.HABITAT_CHECK_COMPLETE, {
          growBotName: SANDBOTS_BOT_NAMES.grow
        })
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
    updateCameraDebugFrameOverlay
  });

  const gameplayOpeningRuntime = createGameplayOpeningRuntime({
    gameplayCameraDirector,
    session,
    controls,
    gameplayUiVisibility,
    audio
  });
  const gameplayCameraFrameRuntime = createGameplayCameraFrameRuntime({
    camera,
    cameraOrbit,
    cameraZoomPresetController,
    controls,
    tutorial: actTwoTutorial,
    session,
    openingRuntime: gameplayOpeningRuntime,
    callbacks: {
      isGameplayFlow: () => isGameFlow(gameFlowValues.GAMEPLAY),
      onCycleCameraZoom: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE)
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
  const fieldMoveImpactRuntime = createFieldMoveImpactRuntime({
    session,
    controls,
    carbonItemId: CARBON_ITEM_ID,
    companionAbilityResourcesRuntime,
    getNowMs: getRuntimeNowMs,
    groundActionFeedbackRuntime,
    hud,
    performGameplayHarvestAction,
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
      getFreeBlockBuildZoneCenterPosition
    });
  }

  function updateSolarStationPlacementPreview(timeSeconds = 0) {
    return updateSolarStationConstructionPlacementPreview({
      preview: session.strawBedPlacementPreview,
      instance: session.strawBedModelInstance,
      timeSeconds,
      gridFootprint: SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT,
      syncPlacementPreview: (preview) =>
        constructionPlacementFrameRuntime.syncPlacementPreviewPositionToPlayer(
          preview,
          SOLAR_STATION_PLACEMENT_FOLLOW_DISTANCE
        ),
      isPlacementBlocked: (previewRect) =>
        isSolarStationPlacementBlocked(session, controls.storyState, previewRect),
      shouldHideInactiveInstance: () =>
        !controls.storyState.flags.strawBedPlacedInBulbasaurHabitat
    });
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
    return rotateActiveConstructionPlacementPreviews({
      direction,
      previews: [
        session.strawBedPlacementPreview,
        session.greenhousePlacementPreview,
        session.campfirePlacementPreview,
        session.leafDenKitPlacementPreview
      ],
      rotationStep: PLACEMENT_ROTATION_STEP,
      normalizePlacementYaw,
      playRotateSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE),
      pushNotice: (notice) => hud?.pushNotice?.(notice)
    });
  }

  function getRotatableWorkbenchPlacementCandidates() {
    return getRotatableWorkbenchPlacementCandidatesFromTargets({
      flags: controls.storyState?.flags || {},
      footprints: {
        houseBuilt: LEAF_DEN_BUILT_ROTATION_FOOTPRINT,
        houseKit: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
        solarStation: SOLAR_STATION_PLACEMENT_PREVIEW_FOOTPRINT,
        trainHouse: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT
      },
      session,
      thermalCabinLabel: SANDBOTS_ITEM_NAMES.thermalCabin
    });
  }

  function getWorkbenchRotationTargetSize(target) {
    return getWorkbenchRotationTargetSizeFromTargets(target, {
      getPlacementCollisionSize
    });
  }

  function getWorkbenchRotationTargetDistance(playerPosition, target) {
    return getWorkbenchRotationTargetDistanceFromTargets(playerPosition, target, {
      getTargetSize: getWorkbenchRotationTargetSize
    });
  }

  function getWorkbenchRotationTriggerDistance() {
    return getWorkbenchRotationTriggerDistanceFromTargets({
      buildGridConfig: session.buildGridConfig,
      rotateDistance: WORKBENCH_OBJECT_ROTATE_DISTANCE,
      triggerTileMargin: WORKBENCH_OBJECT_ROTATE_TRIGGER_TILE_MARGIN
    });
  }

  function getNearestRotatableWorkbenchPlacement() {
    const playerPosition = session.playerCharacter?.getPosition?.();
    return getNearestRotatableWorkbenchPlacementFromTargets({
      candidates: getRotatableWorkbenchPlacementCandidates(),
      getTargetDistance: getWorkbenchRotationTargetDistance,
      playerPosition,
      triggerDistance: getWorkbenchRotationTriggerDistance()
    });
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
    return workbenchRotationRuntime.selectWithFeedback(target, {
      promptText: resolveWorkbenchRotationPrompt(getCurrentInputModalityState()),
      playConfirmSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CONFIRM),
      pushNotice: (notice) => hud?.pushNotice?.(notice)
    });
  }

  function clearWorkbenchConstructionRotationSelection() {
    return workbenchRotationRuntime.clearWithFeedback({
      playCancelSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
      pushNotice: (notice) => hud?.pushNotice?.(notice)
    });
  }

  function confirmWorkbenchConstructionRotationSelection() {
    let selectedRotationTarget = null;
    return workbenchRotationRuntime.confirmWithFeedback({
      getSelectedTarget: () => {
        selectedRotationTarget = getSelectedRotatableWorkbenchPlacement();
        return selectedRotationTarget;
      },
      syncPlacementYaw: (placement) => {
        if (selectedRotationTarget?.kind === "solarStation") {
          syncSolarStationPlacementYaw(placement);
        }
      },
      playConfirmSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CONFIRM),
      pushNotice: (notice) => hud?.pushNotice?.(notice)
    });
  }

  function syncSolarStationPlacementYaw(placement) {
    workbenchRotationRuntime.syncSolarStationPlacementYaw({
      instance: session.strawBedModelInstance,
      placement
    });
  }

  function syncSolarStationWorkbenchRotationVisual(nowSeconds = getRuntimeNowSeconds()) {
    workbenchRotationRuntime.syncSolarStationWorkbenchRotationVisual({
      instance: session.strawBedModelInstance,
      placement: session.strawBed,
      placementPreviewActive: session.strawBedPlacementPreview?.active,
      placed: controls.storyState.flags.strawBedPlacedInBulbasaurHabitat,
      nowSeconds
    });
  }

  function rotateNearbyWorkbenchConstruction(direction) {
    return workbenchRotationRuntime.rotateNearbyWithFeedback({
      direction,
      getSelectedTarget: getSelectedRotatableWorkbenchPlacement,
      playNavigateSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_NAVIGATE),
      pushNotice: (notice) => hud?.pushNotice?.(notice)
    });
  }

  function getWorkbenchRotationGroundCell(target) {
    return workbenchRotationRuntime.getGroundCell(target);
  }

  function updateLeafDenKitPlacementPreview(timeSeconds = 0) {
    return updateLeafDenKitConstructionPlacementPreview({
      preview: session.leafDenKitPlacementPreview,
      instance: session.leafDenPlacementPreviewModelInstance,
      timeSeconds,
      fallbackFootprint: LEAF_DEN_KIT_PLACEMENT_PREVIEW_FOOTPRINT,
      gridFootprint: LEAF_DEN_KIT_PLACEMENT_GRID_FOOTPRINT,
      getBlockers: () => getSolarStationPlacementBlockers(session, controls.storyState),
      validatePlacement: validateBuildingKitPlacement,
      syncPlacementPreview: (preview) =>
        constructionPlacementFrameRuntime.syncPlacementPreviewPositionToPlayer(preview),
      isInsidePowerRadius: (position) =>
        isInsideSolarStationPowerRadius(session, controls.storyState, position),
      evaluateSiteChoice: evaluateHabitatSiteChoice,
      getSolarStationPowerPosition: () =>
        getSolarStationPowerPosition(session, controls.storyState),
      workbenchPosition: WORKBENCH_POSITION,
      getSolarStationPowerRadius: () => getSolarStationPowerRadius(session)
    });
  }

  function updateCampfirePlacementPreview(timeSeconds = 0) {
    return updateRectangularConstructionPlacementPreview({
      preview: session.campfirePlacementPreview,
      instance: session.campfireTrainHouseModelInstance,
      timeSeconds,
      fallbackFootprint: TRAIN_HOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      gridFootprint: TRAIN_HOUSE_PLACEMENT_GRID_FOOTPRINT,
      getBlockers: () => getSolarStationPlacementBlockers(session, controls.storyState),
      validatePlacement: validateBuildingKitPlacement,
      syncPlacementPreview: (preview) =>
        constructionPlacementFrameRuntime.syncPlacementPreviewPositionToPlayer(preview),
      modelStateKeys: {
        groundY: "trainHouseGroundY",
        baseScale: "trainHouseBaseScale",
        baseYaw: "trainHouseBaseYaw"
      },
      shouldHideInactiveInstance: () => !controls.storyState.flags.campfireSpatOut,
      resetSwayStrength: true
    });
  }

  function updateGreenhousePlacementPreview(timeSeconds = 0) {
    return updateRectangularConstructionPlacementPreview({
      preview: session.greenhousePlacementPreview,
      instance: session.greenhouseModelInstance,
      timeSeconds,
      fallbackFootprint: GREENHOUSE_PLACEMENT_PREVIEW_FOOTPRINT,
      gridFootprint: GREENHOUSE_PLACEMENT_GRID_FOOTPRINT,
      getBlockers: () => getSolarStationPlacementBlockers(session, controls.storyState),
      validatePlacement: validateBuildingKitPlacement,
      syncPlacementPreview: (preview) =>
        constructionPlacementFrameRuntime.syncPlacementPreviewPositionToPlayer(preview),
      modelStateKeys: {
        groundY: "greenhouseGroundY",
        baseScale: "greenhouseBaseScale",
        baseYaw: "greenhouseBaseYaw"
      }
    });
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

  function performGameplayHarvestAction(options, autosaveContext = {}) {
    const treeRevivalSnapshot = getTreeRevivalSnapshot({
      session,
      storyState: controls.storyState
    });
    const beforeGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });
    const result = gameplay.performHarvestAction(options);
    const afterGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });

    if (result) {
      treeRevivalLeafBurstFrameRuntime.queueForNewlyRevivedTrees(treeRevivalSnapshot);
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

  function getDestroyableLandscapePatchForInteractOptions(options = {}) {
    return getDestroyableLandscapePatchForInteractOptionsWithSources({
      findNearbyDestroyableInstantiatedObject,
      playerPosition: options.playerPosition,
      session: {
        groundGrassPatches: options.groundGrassPatches || [],
        groundFlowerPatches: options.groundFlowerPatches || []
      },
      storyState: options.storyState
    });
  }

  function performGameplayInteractAction(options) {
    const cutEffectPatch = getDestroyableLandscapePatchForInteractOptions(options);
    const beforeGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });
    const result = gameplay.performInteractAction(options);
    const afterGardenProgress = getGardenProgressSnapshot({
      session,
      storyState: controls.storyState
    });

    if (result && cutEffectPatch && afterGardenProgress !== beforeGardenProgress) {
      landscapeCutEffectRuntime.queue(cutEffectPatch);
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

  function getEncounterRepairBoxPosition(encounter) {
    return encounter?.repairBoxPosition || encounter?.repairPosition || null;
  }

  function syncActiveRepairBoxHighlight() {
    companionRepairBoxModelRuntime.syncActiveHighlight({
      repairModuleInstances: [
        session.actTwoSquirtle?.repairModuleInstance,
        session.bulbasaurEncounter?.repairModuleInstance,
        session.charmanderEncounter?.repairModuleInstance,
        session.timburrEncounter?.repairModuleInstance
      ],
      revealEncounters: [
        session.bulbasaurEncounter,
        session.charmanderEncounter
      ]
    });
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

  function getFreeBlockBuildGridConfig() {
    return freeBlockBuildSessionRuntime.getGridConfig();
  }

  function isBuildBlockFieldMoveEquipped() {
    return Boolean(
      controls.playerSkills?.buildBlock &&
      controls.getActiveMoveId?.() === "buildBlock"
    );
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
    return freeBlockBuildSessionRuntime.getFoundationBuildZoneProgressCount({
      buildZone,
      blockType: FREE_BLOCK_TYPES.WALL
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
    return freeBlockBuildSessionRuntime.syncActiveBuildZone({
      flags: controls.storyState?.flags,
      getFoundationProgressCount: getFoundationBuildZoneProgressCount,
      isBuildZoneBlocked: isBuilderTutorialFoundationBuildZoneBlocked,
      findAvailableBuildZone: findAvailableBuilderTutorialFoundationBuildZone
    });
  }

  function getActiveFreeBlockBuildZone() {
    return syncActiveFreeBlockBuildZone();
  }

  function isFoundationBuildZoneUnavailable() {
    return freeBlockBuildSessionRuntime.isBuildZoneUnavailable();
  }

  function getFreeBlockBuildZoneCenterPosition(buildZone = getActiveFreeBlockBuildZone()) {
    return freeBlockBuildSessionRuntime.getBuildZoneCenterPosition({ buildZone });
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
    return freeBlockBuildSessionRuntime.getController();
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

    return freeBlockBuildSessionRuntime.buildFoundationBuildZoneGroundCells({
      buildZone,
      zoneUnavailable: isFoundationBuildZoneUnavailable(),
      wallBlockType: FREE_BLOCK_TYPES.WALL
    });
  }

  function buildFoundationCompletionInteriorGroundCells() {
    const buildZone = getActiveFreeBlockBuildZone();
    if (!Array.isArray(buildZone?.interiorCells) || !buildZone.interiorCells.length) {
      return [];
    }

    return freeBlockBuildSessionRuntime.buildFoundationCompletionInteriorGroundCells({ buildZone });
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
    const progress = freeBlockBuildSessionRuntime.getBuildZoneProgress({
      buildZone: getActiveFreeBlockBuildZone(),
      blockType: FREE_BLOCK_TYPES.WALL
    });

    if (progress.complete) {
      triggerFoundationBuildZoneCompleteEffects(now);
    }

    return progress;
  }

  function canStackFreeBlockPlacement() {
    return freeBlockBuildSessionRuntime.canStackFreeBlockPlacement({
      buildZone: getActiveFreeBlockBuildZone(),
      blockType: FREE_BLOCK_TYPES.WALL
    });
  }

  function getFreeBlockCellWorldPosition(cell, gridSystem = createGridSystem(getFreeBlockBuildGridConfig())) {
    return getFreeBlockCellWorldPositionWithGrid({
      cell,
      gridSystem
    });
  }

  function buildFreeBlockFeedbackGroundCell(result) {
    return freeBlockBuildSessionRuntime.buildFeedbackGroundCell({ result });
  }

  function syncFreeBlockBuildSnapshot() {
    return freeBlockBuildSessionRuntime.syncSnapshot();
  }

  function movePlayerAwayFromPlacedFreeBlock(targetCell, playerPosition = null) {
    return movePlayerAwayFromPlacedFreeBlockWithRuntime({
      playerCharacter: session.playerCharacter,
      targetCell,
      playerPosition,
      gridSystem: createGridSystem(getFreeBlockBuildGridConfig()),
      resolveDisplacementPosition: resolveConstructionDisplacementPosition,
      isBlocked: companionConstructionBlockerRuntime.isBlocked,
      syncPlayerModel: () => playerModelRuntime.sync(session, 0)
    });
  }

  function handleFreeBlockPlacementResult(result, now) {
    return applyFreeBlockPlacementResult({
      result,
      feedbackGroundCell: buildFreeBlockFeedbackGroundCell(result),
      now,
      wallBlockType: FREE_BLOCK_TYPES.WALL,
      actions: {
        triggerFeedback: (...args) => groundActionFeedbackRuntime.triggerFeedback(...args),
        markFirstFreeBlockPlaced: () => {
          controls.storyState.flags.firstFreeBlockPlaced = true;
        },
        onFoundationWallBuilt: (event) => controls.onFoundationWallBuilt?.(event),
        syncFoundationCompletionEffects: syncFoundationBuildZoneCompletionEffects,
        syncFreeBlockBuildSnapshot,
        playPlacedSound: playInstanceObjectSfx,
        playInvalidSound: () => playSoundEvent(SOUND_EVENT_IDS.UI_CANCEL),
        pushNotice: (notice) => hud?.pushNotice?.(notice)
      }
    });
  }

  function tryPlaceFreeBlockFromBuildInput(now) {
    const playerPosition = session.playerCharacter?.getPosition?.();
    return tryPlaceFreeBlockFromBuildInputWithRuntime({
      controller: getFreeBlockBuildController(),
      placement: {
        buildZoneUnavailable: isFoundationBuildZoneUnavailable(),
        blockType: FREE_BLOCK_TYPES.WALL,
        playerPosition,
        playerYaw: session.playerModelInstance?.yaw,
        inventory: controls.inventory,
        getBuildZone: getActiveFreeBlockBuildZone,
        canStack: canStackFreeBlockPlacement
      },
      effects: {
        movePlayerAway: movePlayerAwayFromPlacedFreeBlock,
        handlePlacementResult: handleFreeBlockPlacementResult
      },
      now
    });
  }

  function resolveFreeBlockBuildTarget(playerPosition = null) {
    const gridSystem = createGridSystem(getFreeBlockBuildGridConfig());
    const playerYaw = session.playerModelInstance?.yaw;
    return resolveFreeBlockBuildTargetWithRuntime({
      controller: getFreeBlockBuildController(),
      gridSystem,
      playerPosition,
      playerYaw,
      buildZone: getActiveFreeBlockBuildZone(),
      allowStacking: canStackFreeBlockPlacement(),
      inventory: controls.inventory,
      buildZoneUnavailable: isFoundationBuildZoneUnavailable(),
      resolveRawTargetCell: () => resolveFreeBlockTargetCell({
        gridSystem,
        playerPosition,
        playerYaw
      }),
      resolveUnavailableValidation: ({ targetCell }) =>
        createUnavailableFoundationBuildZoneValidation({ targetCell }),
      resolveTargetPosition: getFreeBlockCellWorldPosition,
      getConstructionColliders: getPlayerConstructionTerrainColliders,
      isPositionInsideCollider: isPositionInsideTerrainColliderFootprint,
      buildState: session.freeBlockBuildState,
      resolvePreviewValidity: resolveBuildBlockPreviewValidity
    });
  }

  function getFreeBlockPreviewTarget(playerPosition = null) {
    return getFreeBlockPreviewTargetWithRuntime({
      action: session.timburrBuildBlockAction,
      playerPosition,
      resolveTarget: resolveFreeBlockBuildTarget
    });
  }

  function syncFreeBlockBuildPreview({ active, playerPosition, nowSeconds = 0 } = {}) {
    return syncFreeBlockBuildPreviewWithRuntime({
      instance: session.freeBlockPreviewInstance,
      active,
      playerPosition,
      nowSeconds,
      getTarget: getFreeBlockPreviewTarget,
      createGridSystem: () => createGridSystem(getFreeBlockBuildGridConfig())
    });
  }

  function applyTimburrBuildBlockImpact(action, now) {
    const playerPosition = session.playerCharacter?.getPosition?.();
    return applyTimburrBuildBlockImpactWithRuntime({
      action,
      controller: getFreeBlockBuildController(),
      placement: {
        buildZoneUnavailable: isFoundationBuildZoneUnavailable(),
        blockType: FREE_BLOCK_TYPES.WALL,
        playerPosition,
        inventory: controls.inventory,
        getBuildZone: getActiveFreeBlockBuildZone,
        canStack: canStackFreeBlockPlacement
      },
      effects: {
        movePlayerAway: movePlayerAwayFromPlacedFreeBlock,
        handlePlacementResult: handleFreeBlockPlacementResult
      },
      now
    });
  }

  function tryRemoveNearbyFreeBlock(playerPosition, now) {
    return tryRemoveNearbyFreeBlockWithRuntime({
      playerPosition,
      freeBlockInstances: session.freeBlockInstances,
      inventory: controls.inventory,
      getController: getFreeBlockBuildController,
      getWoodDrops: () => {
        session.woodDrops ||= [];
        return session.woodDrops;
      },
      buildFeedbackGroundCell,
      now,
      dropSize: FREE_BLOCK_DROP_SIZE,
      pickupRadius: FREE_BLOCK_DROP_PICKUP_RADIUS,
      spread: FREE_BLOCK_DROP_SPREAD,
      actions: {
        syncSnapshot: syncFreeBlockBuildSnapshot,
        triggerFeedback: (...args) => groundActionFeedbackRuntime.triggerFeedback(...args),
        playImpactSound: () => playSoundEvent(SOUND_EVENT_IDS.GAMEPLAY_IMPACT),
        pushNotice: (notice) => hud?.pushNotice?.(notice)
      }
    });
  }

  function getCompanionFollowFormationIndex(companionId, activeMoveId = null) {
    return resolveCompanionFollowFormationIndexFromState({
      companionId,
      activeMoveId,
      flags: controls.storyState?.flags || {},
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
        squirtleWaterGunQueueActive: waterGunRuntime.getQueue().length > 0,
        bulbasaurWorkbenchGuideActive: bulbasaurWorkbenchGuideRuntime.isActive()
      }
    }) ?? 0;
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
      isBlocked: companionConstructionBlockerRuntime.isBlocked
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

  function startNextQueuedSquirtleWaterGunAction() {
    waterGunRuntime.startNextQueued();
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

  const processWorldCellPlannerClick = worldCellPlannerInteractionRuntime.processClick;
  const getWorldCellPlannerSelectedGroundCell =
    worldCellPlannerInteractionRuntime.getSelectedGroundCell;

  mount?.addEventListener?.(
    "pointerdown",
    worldCellPlannerInteractionRuntime.handlePointerDown,
    { capture: true }
  );

  function syncCampfireTrainHouseModelInstance(nowSeconds = getRuntimeNowSeconds(), deltaTime = 0) {
    return syncCampfireTrainHouseModelInstanceWithSession({
      session,
      storyState: controls.storyState,
      nowSeconds,
      deltaTime,
      getWorkbenchRotationPreviewYaw,
      applyTrainHouseDance,
      applyPlacementSpawn: applyPlayerPlacementSpawnToModelInstance,
      applyRotationTint: applyWorkbenchRotationSelectionTint
    });
  }

  function syncGreenhouseModelInstance(deltaTime = 0) {
    return syncGreenhouseModelInstancesWithSession({
      session,
      deltaTime,
      applyPlacementSpawn: applyPlayerPlacementSpawnToModelInstance
    });
  }

  function isLeafDenConstructionActive() {
    return leafDenConstructionPresentationRuntime.isActive();
  }

  function isLeafDenBusyCompanionTarget(target) {
    return leafDenConstructionPresentationRuntime.isBusyCompanionTarget(target);
  }

  function syncConstructionCloudBurstEffects(nowSeconds = getRuntimeNowSeconds()) {
    return leafDenConstructionPresentationRuntime.syncCloudBurstEffects(nowSeconds);
  }

  function syncLeafDenConstructionClouds(nowSeconds = getRuntimeNowSeconds()) {
    return leafDenConstructionPresentationRuntime.syncConstructionClouds(nowSeconds);
  }

  function getLeafDenConstructionBillboards(uvRect, nowSeconds = getRuntimeNowSeconds()) {
    return leafDenConstructionPresentationRuntime.getConstructionBillboards(uvRect, nowSeconds);
  }

  function getConstructionCloudBurstBillboards(uvRect, nowSeconds = getRuntimeNowSeconds()) {
    return leafDenConstructionPresentationRuntime.getCloudBurstBillboards(uvRect, nowSeconds);
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

  function updateBulbasaurEncounter(deltaTime) {
    const encounter = session.bulbasaurEncounter;

    if (
      repairBoxRevealOpeningRuntime.update(deltaTime, encounter, {
        syncModelInstance: () => companionModelSyncRuntime.syncBulbasaur()
      })
    ) {
      return;
    }

    if (
      controls.storyState?.flags?.bulbasaurRevealed &&
      encounter &&
      !encounter.visible &&
      Array.isArray(encounter.repairPosition)
    ) {
      repairBoxRevealOpeningRuntime.revealAtRepairPosition(encounter);
      if (encounter.repairModuleInstance) {
        encounter.repairModuleInstance.active = false;
      }
    }

    if (bulbasaurWorkbenchGuideRuntime.isActive()) {
      bulbasaurWorkbenchGuideRuntime.advance(deltaTime, encounter);
      companionModelSyncRuntime.syncBulbasaur();
      return;
    }

    if (encounter) {
      encounter.workbenchGuideWaypointIndex = 0;
    }

    if (!encounter?.visible || !encounter.position) {
      companionModelSyncRuntime.syncBulbasaur();
      return;
    }

    companionIdleMotionRuntime.updateJumpArc(encounter, {
      deltaTime,
      modelFaceYawOffset: BULBASAUR_MODEL_FACE_YAW_OFFSET
    });
    companionModelSyncRuntime.syncBulbasaur();
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

    if (
      repairBoxRevealOpeningRuntime.update(deltaTime, encounter, {
        syncModelInstance: () => companionModelSyncRuntime.syncCharmander()
      })
    ) {
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
      companionModelSyncRuntime.syncCharmander();
      return;
    }

    if (
      controls.storyState.flags.charmanderFollowing &&
      session.playerCharacter &&
      !session.charmanderFireAction &&
      !isLeafDenConstructionActive()
    ) {
      companionFollowMovementRuntime.moveFormationMemberTowardPlayer(encounter, {
        companionId: "charmander",
        activeMoveId,
        deltaTime,
        speed: CHARMANDER_FOLLOW_SPEED,
        defaultDistance: CHARMANDER_FOLLOW_DISTANCE,
        modelFaceYawOffset: CHARMANDER_MODEL_FACE_YAW_OFFSET
      });
    } else if (!session.charmanderFireAction) {
      companionIdleMotionRuntime.faceTowardPlayer(encounter, {
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

    companionModelSyncRuntime.syncCharmander();
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
      companionFollowMovementRuntime.moveFormationMemberTowardPlayer(encounter, {
        companionId: "timburr",
        activeMoveId,
        deltaTime,
        speed: TIMBURR_FOLLOW_SPEED,
        defaultDistance: TIMBURR_FOLLOW_DISTANCE,
        modelFaceYawOffset: Number(encounter.modelFaceYawOffset ?? TIMBURR_MODEL_FACE_YAW_OFFSET)
      });
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

    rustlingGrassEventRuntime.update({
      deltaTime,
      canAdvance: canAdvanceRustlingGrass
    });

    return { committedEarlyFrame: false };
  }

  function updatePassiveEffectFrames(deltaTime) {
    updateNatureRevivalEffects(session.natureRevivalEffects, deltaTime);
    treeRevivalLeafBurstFrameRuntime.update(deltaTime);
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
    updateLeppaTreeDance({ leppaTree: session.leppaTree, now });
    updateLeppaTreeMusicNotes({
      leppaTree: session.leppaTree,
      textures: session.leppaTreeMusicalNoteTextures,
      deltaTime
    });
  }

  function prepareRenderSnapshotContext({ cinematicActive }) {
    return prepareRenderSnapshotContextWithSources({
      session,
      camera,
      cinematicActive,
      getGrassCollisionObjects: () => getGrassCollisionObjects({ session }),
      getSelectedRepairBoxParticleTarget,
      getRepairBoxRevealParticleTarget,
      getEncounterRepairBoxPosition,
      clamp01
    });
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
    trainHouseMusicRuntime.update(nowSeconds);
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
    const bulbasaurWorkbenchGuideActive = bulbasaurWorkbenchGuideRuntime.isActive();
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
        companionAbilityResourcesRuntime.recordSquirtleWaterGunUse();
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
            fireEquipped,
            groundDeadInstances: session.groundDeadInstances,
            groundFlowerPatches: session.groundFlowerPatches,
            groundGrassPatches: session.groundGrassPatches,
            groundPurifiedInstances: session.groundPurifiedInstances
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
        const squirtleWaterGunResult = waterGunRuntime.startAction({
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
        const bulbasaurLeafageResult = leafageRuntime.startAction({
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
          const timburrBuildBlockResult = buildBlockRuntime.startAction({
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
          const squirtleWaterGunResult = waterGunRuntime.startAction({
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
          if (companionAbilityResourcesRuntime.consumeSquirtleWaterStaminaForInstantAction()) {
            triggerWaterGunSfxBurst();
            performHarvestAction(playerPosition, {
              useWaterGun: true,
              forcedHarvestTarget: primaryActionTarget
            });
          }
        } else if (leafageEquipped && leafagePrimaryMoveRequested && primaryActionTarget?.leafageGroundCell) {
          fieldMoveInvalidTargetPromptRuntime.resetLeafage();
          const bulbasaurLeafageResult = leafageRuntime.startAction({
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
          const charmanderFireResult = fireRuntime.startAction({
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
          onNpcInteractionStart: npcConversationFocusRuntime.handleInteractionStart
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
        const squirtleWaterGunResult = waterGunRuntime.startAction({
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
        if (companionAbilityResourcesRuntime.consumeSquirtleWaterStaminaForInstantAction()) {
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
        onNpcInteractionStart: npcConversationFocusRuntime.handleInteractionStart
      });
    }

    processFollowerCallFrame({
      controls,
      session,
      pushNotice: (notice) => hud.pushNotice(notice),
      playSoundEvent
    });

    // Simulation updates.
    updateAmbientWorldSimulationFrame({ deltaTime, now });
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
    const {
      canQueryNearbyGameplayTargets,
      nearbyHarvestTarget,
      highlightedGroundCell,
      highlightedGroundCellTargetState,
      highlightedGroundCellAbilityId,
      nearbyInteractable
    } = resolveGameplayTargetFrameState({
      session,
      controls,
      gameplay,
      flowState: currentFlowState,
      gameplayOpeningMovementLocked,
      waterGunEquipped,
      leafageEquipped,
      fireEquipped
    });
    const activeQuest = gameplay.getActiveQuest(controls.storyState);
    const activeTask = gameplay.getActiveTask?.() || null;
    const activeSystemQuest = gameplay.getActiveSystemQuest?.() || null;
    const {
      pendingWaterGunGroundCells,
      activeFireGroundCell,
      markedGroundCellPulsePhase,
      markedActionGroundCells
    } = resolveGameplayGroundGuidanceFrameState({
      gameplayOpeningMovementLocked,
      gameplayOpeningHudHidden,
      flowState: currentFlowState,
      activeQuest,
      activeSystemQuest,
      activeTask,
      storyState: controls.storyState,
      session,
      now,
      solarStationPlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      nearbyHarvestTarget,
      waterGunEquipped,
      leafageEquipped,
      fireEquipped,
      openingLeppaTreeRequestActive: isOpeningLeppaTreeRequestActive(controls.storyState),
      getPendingSquirtleWaterGunGroundCells: () => waterGunRuntime.getPendingGroundCells(),
      getFreeRoamRestorationGroundCells: (options) => getFreeRoamRestorationGroundCells({
        ...options,
        groundDeadInstances: session.groundDeadInstances,
        groundFlowerPatches: session.groundFlowerPatches,
        groundGrassPatches: session.groundGrassPatches,
        groundPurifiedInstances: session.groundPurifiedInstances,
        iceGroundInstances: session.iceGroundInstances
      }),
      getLeppaTreeSurroundingGroundCells,
      isLeppaTreeTileHintFlashing: () => gameplay.isLeppaTreeTileHintFlashing?.(),
      buildSolarStationFieldMarkedGroundCells,
      getBoulderShadedTaskGroundCells: (storyState) => getBoulderShadedTaskGroundCells({
        storyState,
        challengeBoulder: session.challengeBoulder,
        groundDeadInstances: session.groundDeadInstances,
        groundFlowerPatches: session.groundFlowerPatches,
        groundGrassPatches: session.groundGrassPatches,
        groundPurifiedInstances: session.groundPurifiedInstances
      }),
      getGrowFirstHabitatTaskGroundCells: (options) => getGrowFirstHabitatTaskGroundCells({
        ...options,
        referencePosition:
          session.bulbasaurEncounter?.position ||
          session.bulbasaurEncounter?.repairPosition ||
          session.playerCharacter?.getPosition?.() ||
          null,
        groundFlowerPatches: session.groundFlowerPatches,
        groundGrassPatches: session.groundGrassPatches,
        groundPurifiedInstances: session.groundPurifiedInstances
      }),
      buildFoundationBuildZoneGroundCells,
      getWorldCellPlannerSelectedGroundCell
    });
    ({
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    } = resolveActiveConstructionPlacementPreviews({
      session,
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview
    }));
    const {
      inputModalityState,
      transientNoticeRoute,
      playerCounterPromptText,
      framePlacementPrompts,
      pendingPlacementIntent,
      pendingPlacementPrompt,
      selectedWorkbenchRotationTarget,
      nearbyWorkbenchRotationTarget,
      workbenchRotationPrompt,
      destroyableObjectPrompt,
      promptCopy
    } = resolveGameplayPromptFrameState({
      now,
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      nearbyHarvestTarget,
      nearbyInteractable,
      gameplayOpeningMovementLocked,
      cinematicActive,
      tutorialActive,
      skillLearnActive,
      scriptedInteractionActive,
      flowState: currentFlowState,
      session,
      storyState: controls.storyState,
      inventory: controls.inventory,
      gameplay,
      activeQuest,
      activeMoveId,
      pendingWaterGunGroundCells,
      getCurrentInputModalityState,
      getPlayerCounterPromptText: (frameNow) => playerCounterPromptRuntime.get(frameNow),
      getSelectedRotatableWorkbenchPlacement,
      getNearestRotatableWorkbenchPlacement,
      debug: debugInteractionFlow
    });

    const {
      fieldToolTargetPulseFrame,
      solarStationPlacementGroundCells,
      solarStationPlacementGroundCell,
      solarStationPowerRadiusGroundCells,
      greenhousePlacementGroundCells,
      greenhousePlacementGroundCell,
      campfirePlacementGroundCells,
      campfirePlacementGroundCell,
      leafDenKitPlacementGroundCells,
      leafDenKitPlacementGroundCell,
      workbenchRotationGroundCell,
      groundActionFeedbackFrame
    } = resolveGameplayGroundCellHighlightFrameState({
      gameplayOpeningMovementLocked,
      flowState: currentFlowState,
      highlightedGroundCell,
      placementFootprints: {
        solarStation: SOLAR_STATION_PLACEMENT_GRID_FOOTPRINT,
        greenhouse: GREENHOUSE_PLACEMENT_GRID_FOOTPRINT,
        campfire: TRAIN_HOUSE_PLACEMENT_GRID_FOOTPRINT,
        leafDenKit: LEAF_DEN_KIT_PLACEMENT_GRID_FOOTPRINT
      },
      solarStationPlacementPreview,
      greenhousePlacementPreview,
      campfirePlacementPreview,
      leafDenKitPlacementPreview,
      selectedWorkbenchRotationTarget,
      activeFireGroundCell,
      session,
      storyState: controls.storyState,
      getWorkbenchRotationGroundCell,
      buildSolarStationPreviewPowerRadiusGroundCells,
      buildPlacedSolarStationPowerRadiusGroundCells,
      getGroundActionFeedbackFrame: () =>
        groundActionFeedbackRuntime.getFeedbackFrame({ session, now }),
      getFieldToolTargetPulseFrame: (groundCell) =>
        groundActionFeedbackRuntime.getPulseFrame(groundCell, now)
    });

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

    baseRenderSnapshotFrameRuntime.update(nextFrame, {
      now,
      deltaTime,
      cinematicActive,
      nearbyInteractable,
      nearbyWorkbenchRotationTarget
    });

    // World-space UI and render preparation.
    const worldSpacePresentationFrameState = resolveWorldSpacePresentationFrameState({
      now,
      gameplayOpeningCameraLocked,
      flowState: currentFlowState,
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
      repairBoxPromptDistance: REPAIR_BOX_PROMPT_DISTANCE,
      firstTaughtActionFreedomWindowActive: firstTaughtActionFreedomWindow.active,
      restoredGrassMissionTargetCount: BULBASAUR_DRY_GRASS_MISSION_RESTORE_COUNT,
      waterGunFirstUsePromptDismissed: controls.storyState.flags[WATER_GUN_FIRST_USE_PROMPT_FLAG],
      openingLeppaTreeRequestActive: isOpeningLeppaTreeRequestActive(controls.storyState),
      resolveWorldSpaceUiVisibility,
      shouldShowWorkbenchGreenArrowCue,
      applyWorkbenchGreenArrowCue,
      isPlayerNearWorldPosition,
      isDryGrassHydroMissionActive,
      getEncounterRepairBoxPosition,
      getLeppaTreeSurroundingGroundCells,
      getSquirtleWorldPosition,
      isSquirtleWaterCharging: () => companionAbilityResourcesRuntime.isSquirtleWaterCharging(),
      getFreeBlockBuildCostMarker,
      getPeriodicChopperAttentionCue,
      isLeafageInvalidTargetVisible: (frameNow) =>
        fieldMoveInvalidTargetPromptRuntime.isLeafageVisible(frameNow),
      isFireInvalidTargetVisible: (frameNow) =>
        fieldMoveInvalidTargetPromptRuntime.isFireVisible(frameNow),
      isRunBreadcrumbVisible: (frameNow) =>
        runBreadcrumbPromptRuntime.isVisible(frameNow)
    });
    const { canShowWorldSpaceUi } = worldSpacePresentationFrameState;

    updateWorldSpacePresentationSnapshotFrame(nextFrame, {
      now,
      activeQuest,
      activeMoveId,
      session,
      controls,
      gameplay,
      inputModalityState,
      presentationState: worldSpacePresentationFrameState,
      promptSources: {
        solarStationPlacementPreview,
        greenhousePlacementPreview,
        campfirePlacementPreview,
        leafDenKitPlacementPreview,
        pendingPlacementIntent,
        nearbyHarvestTarget,
        workbenchRotationPrompt,
        destroyableObjectPrompt,
        transientNoticeRoute,
        playerCounterPromptText,
        leafageEquipped
      },
      groundCellHighlightState: {
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
      },
      frameBlockers: {
        gameplayOpeningCameraLocked,
        cinematicActive,
        tutorialActive,
        pokedexModalOpen
      },
      getCompanionLostHint: getPeriodicCompanionLostHint,
      consumeChopperAttentionCueSoundCycle: (cycleId) =>
        chopperAttentionCueRuntime.consumeSoundCycle(cycleId),
      playChopperVoice: () => playSoundEvent(SOUND_EVENT_IDS.CHOPPER_VOICE)
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

    const natureGrassFrame = updateNatureGrassRenderFrame({
      session,
      nextFrame,
      storyState: controls.storyState,
      now,
      grassBendPlayerPosition,
      natureRenderCenter,
      grassCollisionObjects,
      shouldShowRepairBoxRustlingParticles
    });
    shouldShowRepairBoxRustlingParticles =
      natureGrassFrame.shouldShowRepairBoxRustlingParticles;

    appendRebirthOfNatureGhostTree(session, controls.storyState, now);

    landscapeCutEffectRuntime.appendRenderables({
      nextFrame,
      session,
      getTallGrassYaw,
      getTallGrassInstanceScale
    });

    updateNatureRenderFrame({
      session,
      nextFrame,
      storyState: controls.storyState,
      rendering,
      now,
      grassBendPlayerPosition,
      natureRenderCenter,
      selectedRepairBoxParticleTarget,
      repairBoxRevealParticleTarget,
      shouldShowRepairBoxRustlingParticles,
      woodCollectPopRuntime,
      gearPickupParticleRuntime,
      clamp: clamp01
    });
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
    updateWorldObjectBillboardFrame({
      session,
      nextFrame,
      storyState: controls.storyState,
      inventory: controls.inventory,
      rendering,
      now,
      deltaTime,
      canShowWorldSpaceUi,
      activeQuest,
      campfirePlacementPreview,
      getMissionTargetPositionsById,
      getLeafDenConstructionBillboards,
      getConstructionCloudBurstBillboards,
      clamp: clamp01
    });

    if (session.actTwoSquirtle?.modelInstance) {
      const squirtle = session.actTwoSquirtle;
      const visibleActTwoSquirtle =
        squirtle.visible ||
        squirtle.recovered ||
        actTwoTutorial.hasStarted() ||
        controls.storyState.questIndex >= 1;
      const assembledActTwoSquirtle =
        squirtle.recovered || squirtle.assemblyState === "assembled";
      companionModelSyncRuntime.syncSquirtle();
      squirtle.modelInstance.active = Boolean(
        (visibleActTwoSquirtle && assembledActTwoSquirtle) ||
        session.squirtleWaterGunAction ||
        companionAbilityResourcesRuntime.isSquirtleWaterCharging()
      );
    }
    updateCompanionPresentationFrame({
      session,
      nextFrame,
      playerSkills: controls.playerSkills,
      activeMoveId,
      rendering,
      camera,
      now,
      getSquirtleWorldPosition,
      getCharmanderWorldPosition,
      getSquirtleMouthPosition,
      getCharmanderMouthPosition,
      getBulbasaurGrowEmitterPosition,
      getSquirtleWaterStaminaState: () =>
        companionAbilityResourcesRuntime.getSquirtleWaterStaminaState(),
      getCharmanderCarbonEnergyState: () =>
        companionAbilityResourcesRuntime.getCharmanderCarbonEnergyState(),
      isSquirtleWaterCharging: () => companionAbilityResourcesRuntime.isSquirtleWaterCharging(),
      interactionRadiusGizmoConfig: BULBASAUR_INTERACTION_RADIUS_GIZMO_CONFIG
    });
    nextFrame.render.genericBillboards.push(
      ...getNatureRevivalBillboards(
        session.natureRevivalEffects,
        session.natureRevivalSparkTexture,
        rendering.fullUvRect
      )
    );
    treeRevivalLeafBurstFrameRuntime.appendBillboards(nextFrame);
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
