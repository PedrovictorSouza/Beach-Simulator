import { getLeppaTreeSurroundingGroundCells } from "../../world/islandWorld.js";
import { getEncounterRepairBoxPosition } from "./encounterRepairBoxPosition.js";
import {
  createGameLoopConstructionPlacementRuntimeBundle
} from "./gameLoopConstructionPlacement.js";
import { createGameLoopFieldMoveRuntimeBundle } from "./gameLoopFieldMoves.js";
import { createGameLoopRenderSnapshotFrameRuntime } from "./gameLoopRenderSnapshot.js";
import {
  createGameLoopWorldSpacePresentationFrameRuntime
} from "./gameLoopWorldSpacePresentation.js";

export function createGameLoopFieldPresentationRuntimeBundle({
  camera,
  clamp01,
  controls,
  gameFlowValues,
  gameplay,
  hud,
  rendering,
  session,
  worldCanvas,
  callbacks = {},
  config = {},
  construction = {},
  runtimes = {},
  createConstructionPlacementRuntime =
    createGameLoopConstructionPlacementRuntimeBundle,
  createFieldMoveRuntime = createGameLoopFieldMoveRuntimeBundle,
  createRenderSnapshotRuntime = createGameLoopRenderSnapshotFrameRuntime,
  createWorldSpacePresentationRuntime =
    createGameLoopWorldSpacePresentationFrameRuntime
} = {}) {
  const {
    getFieldMoveImpactRuntime,
    getFreeBlockBuildRuntime,
    playSoundEvent
  } = callbacks;
  const {
    foundationBuildZoneRuntime,
    freeBlockBuildRuntime
  } = construction;
  const {
    buildBlockDebugOverlay,
    bulbasaurWorkbenchGuideRuntime,
    companionAbilityResourcesRuntime,
    companionConstructionBlockerRuntime,
    companionFacingRuntime,
    companionModelSyncRuntime,
    companionRenderFrameRuntime,
    companionRepairBoxModelRuntime,
    companionWorldSpeechCueRuntime,
    constructionHouseModelInstanceRuntime,
    fieldMoveActorPositionRuntime,
    fieldMoveApproachPositionRuntime,
    fieldMoveInvalidTargetPromptRuntime,
    leafDenConstructionPresentationRuntime,
    naturePresentationFrameRuntime,
    runBreadcrumbPromptRuntime,
    solarStationPlacementBlockerRuntime,
    squirtleReassemblyRuntime,
    treeRevivalLeafBurstFrameRuntime,
    workbenchRotationRuntime,
    worldSceneSyncRuntime
  } = runtimes;

  const fieldMoveRuntimeBundle = createFieldMoveRuntime({
    session,
    hud,
    controls,
    runtimes: {
      bulbasaurWorkbenchGuideRuntime,
      companionAbilityResourcesRuntime,
      companionConstructionBlockerRuntime,
      companionFacingRuntime,
      companionModelSyncRuntime,
      fieldMoveApproachPositionRuntime,
      leafDenConstructionPresentationRuntime
    },
    callbacks: {
      getFieldMoveImpactRuntime,
      getFreeBlockBuildRuntime
    }
  });
  const {
    buildBlockRuntime
  } = fieldMoveRuntimeBundle;

  const constructionPlacementRuntimeBundle =
    createConstructionPlacementRuntime({
      camera,
      controls,
      hud,
      session,
      runtimes: {
        buildBlockDebugOverlay,
        buildBlockRuntime,
        freeBlockBuildRuntime,
        solarStationPlacementBlockerRuntime,
        workbenchRotationRuntime
      },
      callbacks: {
        playSoundEvent
      }
    });
  const {
    constructionPlacementControlRuntime
  } = constructionPlacementRuntimeBundle;

  const worldSpacePresentationFrameRuntime =
    createWorldSpacePresentationRuntime({
      controls,
      session,
      gameplay,
      runtimes: {
        companionAbilityResourcesRuntime,
        companionWorldSpeechCueRuntime,
        constructionPlacementControlRuntime,
        fieldMoveActorPositionRuntime,
        fieldMoveInvalidTargetPromptRuntime,
        runBreadcrumbPromptRuntime,
        worldSceneSyncRuntime
      },
      callbacks: {
        getEncounterRepairBoxPosition,
        getLeppaTreeSurroundingGroundCells,
        playSoundEvent
      },
      config
    });

  const gameplayRenderSnapshotFrameRuntime = createRenderSnapshotRuntime({
    camera,
    clamp: clamp01,
    controls,
    gameFlowValues,
    rendering,
    session,
    worldCanvas,
    construction: {
      companionRepairBoxModelRuntime,
      constructionHouseModelInstanceRuntime,
      foundationBuildZoneRuntime,
      leafDenConstructionPresentationRuntime
    },
    runtimes: {
      companionRenderFrameRuntime,
      naturePresentationFrameRuntime,
      squirtleReassemblyRuntime,
      worldSpacePresentationFrameRuntime,
      treeRevivalLeafBurstFrameRuntime
    }
  });

  return {
    ...fieldMoveRuntimeBundle,
    ...constructionPlacementRuntimeBundle,
    gameplayRenderSnapshotFrameRuntime,
    worldSpacePresentationFrameRuntime
  };
}
