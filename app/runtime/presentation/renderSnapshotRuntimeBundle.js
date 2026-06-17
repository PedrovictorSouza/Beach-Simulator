import {
  createBaseRenderSnapshotFrameRuntime,
  createRenderSnapshotCompletionFrameRuntime
} from "./baseRenderSnapshotFrame.js";
import { updateHudSnapshotFrame } from "./hudSnapshotFrame.js";
import { updateWorldObjectBillboardFrame } from "./worldObjectBillboardFrame.js";

export function createGameplayRenderSnapshotFrameRuntime({
  controls = {},
  session = {},
  rendering = {},
  clamp = (value) => value,
  callbacks = {},
  construction = {},
  runtimes = {},
  updates = {}
} = {}) {
  const {
    getMissionTargetPositionsById = () => [],
    isOpeningLeppaTreeRequestActive = () => false
  } = callbacks;
  const {
    leafDenConstructionPresentationRuntime = {}
  } = construction;
  const {
    baseRenderSnapshotFrameRuntime = { update: () => {} },
    worldSpacePresentationFrameRuntime = { update: () => ({ canShowWorldSpaceUi: false }) },
    naturePresentationFrameRuntime = { update: () => ({}) },
    companionRenderFrameRuntime = { update: () => {} },
    renderSnapshotCompletionFrameRuntime = { update: () => {} }
  } = runtimes;
  const {
    updateHudSnapshotFrame: updateHudSnapshot = updateHudSnapshotFrame,
    updateWorldObjectBillboardFrame: updateWorldObjectBillboards =
      updateWorldObjectBillboardFrame
  } = updates;

  function update({
    nextFrame,
    now = 0,
    deltaTime = 0,
    gameplayOpeningCameraLocked = false,
    gameplayOpeningHudHidden = false,
    currentFlowState = {},
    activeMoveId = null,
    equipmentState = {},
    inputModalityState = null,
    placementPreviews = {},
    promptState = {},
    promptSources = {},
    freeBlockPreviewTarget = null,
    nearbyInteractable = null,
    nearbyWorkbenchRotationTarget = null,
    activeQuest = null,
    activeTask = null,
    activeSystemQuest = null,
    promptCopy = "",
    groundCellHighlightFrameState = {},
    chopperBulbasaurRepairBoxInvestigationTarget = null,
    firstTaughtActionFreedomWindowActive = false
  } = {}) {
    const {
      cinematicActive = false,
      tutorialActive = false,
      pokedexModalOpen = false,
      skillLearnActive = false
    } = currentFlowState;
    const {
      buildBlockEquipped = false,
      waterGunEquipped = false,
      leafageEquipped = false
    } = equipmentState;
    const {
      solarStationPlacementPreview = null,
      greenhousePlacementPreview = null,
      campfirePlacementPreview = null,
      leafDenKitPlacementPreview = null
    } = placementPreviews;

    updateHudSnapshot(nextFrame, {
      gameplayOpeningCameraLocked,
      gameplayOpeningHudHidden,
      cinematicActive,
      tutorialActive,
      pokedexModalOpen,
      skillLearnActive,
      storyState: controls.storyState,
      inventory: controls.inventory,
      playerPosition: session.playerCharacter?.getPosition?.() || [0, 0, 0],
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

    const { canShowWorldSpaceUi } = worldSpacePresentationFrameRuntime.update({
      nextFrame,
      now,
      gameplayOpeningCameraLocked,
      flowState: currentFlowState,
      activeMoveId,
      activeQuest,
      activeTask,
      activeSystemQuest,
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
        ...promptState,
        openingLeppaTreeRequestActive: isOpeningLeppaTreeRequestActive(controls.storyState)
      },
      freeBlockPreviewTarget,
      nearbyInteractable,
      chopperBulbasaurRepairBoxInvestigationTarget,
      firstTaughtActionFreedomWindowActive,
      promptSources,
      groundCellHighlightState: groundCellHighlightFrameState,
      frameBlockers: {
        gameplayOpeningCameraLocked,
        cinematicActive,
        tutorialActive,
        pokedexModalOpen
      }
    });

    const {
      grassBendPlayerPosition,
      natureRenderCenter
    } = naturePresentationFrameRuntime.update({
      nextFrame,
      now,
      cinematicActive
    });

    updateWorldObjectBillboards({
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
      getLeafDenConstructionBillboards:
        leafDenConstructionPresentationRuntime.getConstructionBillboards,
      getConstructionCloudBurstBillboards:
        leafDenConstructionPresentationRuntime.getCloudBurstBillboards,
      clamp
    });

    companionRenderFrameRuntime.update({
      nextFrame,
      activeMoveId,
      now
    });
    renderSnapshotCompletionFrameRuntime.update(nextFrame, { deltaTime });

    return {
      canShowWorldSpaceUi,
      grassBendPlayerPosition,
      natureRenderCenter
    };
  }

  return {
    update
  };
}

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
