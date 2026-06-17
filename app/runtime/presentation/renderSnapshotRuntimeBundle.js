import {
  createBaseRenderSnapshotFrameRuntime,
  createRenderSnapshotCompletionFrameRuntime
} from "./baseRenderSnapshotFrame.js";

export function createRenderSnapshotRuntimeBundle({
  camera = null,
  controls = null,
  createBaseRuntime = createBaseRenderSnapshotFrameRuntime,
  createCompletionRuntime = createRenderSnapshotCompletionFrameRuntime,
  gameFlowValues = {},
  rendering = {},
  session = {},
  worldCanvas = null,
  callbacks = {},
  construction = {},
  runtimes = {}
} = {}) {
  const {
    applyInteractionObjectHighlight = () => {},
    getGameplayOpeningShipSceneObjects = (sceneObjects) => sceneObjects,
    getInteractionDebugColliders = () => [],
    resolvePsxDistanceFogSettings = () => ({ enabled: false })
  } = callbacks;
  const {
    companionRepairBoxModelRuntime = {},
    constructionHouseModelInstanceRuntime = {},
    leafDenConstructionPresentationRuntime = {}
  } = construction;
  const {
    squirtleReassemblyRuntime = {},
    treeRevivalLeafBurstFrameRuntime = { appendBillboards: () => {} }
  } = runtimes;

  const baseRenderSnapshotFrameRuntime = createBaseRuntime({
    camera,
    worldCanvas,
    session,
    controls,
    gameFlowValues,
    construction: {
      syncActiveRepairBoxHighlight: () =>
        companionRepairBoxModelRuntime.syncSessionActiveHighlight?.(session),
      syncGreenhouseModelInstance: constructionHouseModelInstanceRuntime.syncGreenhouse,
      syncCampfireTrainHouseModelInstance:
        constructionHouseModelInstanceRuntime.syncCampfireTrainHouse,
      isLeafDenConstructionActive:
        leafDenConstructionPresentationRuntime.isActive || (() => false),
      syncLeafDenConstructionClouds:
        leafDenConstructionPresentationRuntime.syncConstructionClouds,
      syncConstructionCloudBurstEffects:
        leafDenConstructionPresentationRuntime.syncCloudBurstEffects,
      syncLeafDenModelInstance: constructionHouseModelInstanceRuntime.syncLeafDen,
      syncPlayerHouseModelInstances: constructionHouseModelInstanceRuntime.syncPlayerHouses
    },
    applyInteractionObjectHighlight,
    getGameplayOpeningShipSceneObjects,
    getSquirtleAssemblySceneObjects: (sceneObjects, squirtle) =>
      squirtleReassemblyRuntime.getSceneObjects?.(sceneObjects, squirtle) ?? sceneObjects,
    resolvePsxDistanceFogSettings
  });

  const renderSnapshotCompletionFrameRuntime = createCompletionRuntime({
    session,
    controls,
    rendering,
    treeRevivalLeafBurstFrameRuntime,
    getInteractionDebugColliders
  });

  return {
    baseRenderSnapshotFrameRuntime,
    renderSnapshotCompletionFrameRuntime
  };
}
