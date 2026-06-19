import { getGameplayOpeningShipSceneObjects } from "../session/gameplayOpeningShip.js";
import { resolvePsxDistanceFogSettings } from "../rendering/psxDistanceFogConfig.js";
import { applyInteractionObjectHighlight } from "./interactionObjectHighlight.js";
import { isOpeningLeppaTreeRequestActive } from "./openingLeppaTreeRequest.js";
import {
  createGameplayMissionTargetPositionProvider
} from "./missions/missionTargetPositionLookup.js";
import {
  createGameplayInteractionDebugColliderProvider
} from "./presentation/interactionDebugColliders.js";
import {
  createGameplayRenderSnapshotFrameRuntime,
  createRenderSnapshotRuntimeBundle
} from "./presentation/renderSnapshotRuntimeBundle.js";

export function createGameLoopRenderSnapshotFrameRuntime({
  camera,
  clamp,
  controls,
  gameFlowValues,
  rendering,
  session,
  worldCanvas,
  construction = {},
  runtimes = {},
  createInteractionDebugColliderProvider = createGameplayInteractionDebugColliderProvider,
  createMissionTargetPositionProvider = createGameplayMissionTargetPositionProvider,
  createRenderFrameRuntime = createGameplayRenderSnapshotFrameRuntime,
  createRuntimeBundle = createRenderSnapshotRuntimeBundle
} = {}) {
  const {
    companionRepairBoxModelRuntime,
    constructionHouseModelInstanceRuntime,
    foundationBuildZoneRuntime,
    leafDenConstructionPresentationRuntime
  } = construction;
  const {
    companionRenderFrameRuntime,
    naturePresentationFrameRuntime,
    squirtleReassemblyRuntime,
    treeRevivalLeafBurstFrameRuntime,
    worldSpacePresentationFrameRuntime
  } = runtimes;

  const getInteractionDebugColliders =
    createInteractionDebugColliderProvider({
      session,
      getStoryState: () => controls.storyState,
      rendering
    });

  const {
    baseRenderSnapshotFrameRuntime,
    renderSnapshotCompletionFrameRuntime
  } = createRuntimeBundle({
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

  const getMissionTargetPositionsById =
    createMissionTargetPositionProvider({
      session,
      getFreeBlockBuildZoneCenterPosition: () =>
        foundationBuildZoneRuntime.getBuildZoneCenterPosition()
    });

  return createRenderFrameRuntime({
    controls,
    session,
    rendering,
    clamp,
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
}
