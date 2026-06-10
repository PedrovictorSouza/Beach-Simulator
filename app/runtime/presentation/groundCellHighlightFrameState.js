import { buildPlacementPreviewFootprintCells } from "../construction/placementGeometry.js";
import { resolveGroundGuidanceVisibility } from "../gameLoopFramePolicies.js";

const EMPTY_PLACEMENT_FOOTPRINTS = Object.freeze({
  solarStation: null,
  greenhouse: null,
  campfire: null,
  leafDenKit: null
});

function buildPreviewFootprintCells(preview, {
  idPrefix,
  footprint,
  targetState
}) {
  return buildPlacementPreviewFootprintCells(preview, {
    idPrefix,
    footprint,
    targetState
  });
}

export function resolveMarkedGroundCellGuidanceFrameState({
  canShowGroundGuidance = false,
  canShowPassiveGroundGuidance = false,
  activeQuest = null,
  activeSystemQuest = null,
  activeTask = null,
  storyState = {},
  session = {},
  now = 0,
  solarStationPlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  nearbyHarvestTarget = null,
  waterGunEquipped = false,
  leafageEquipped = false,
  fireEquipped = false,
  openingLeppaTreeRequestActive = false,
  getPendingSquirtleWaterGunGroundCells = () => [],
  getFreeRoamRestorationGroundCells = () => [],
  getLeppaTreeSurroundingGroundCells = () => [],
  isLeppaTreeTileHintFlashing = () => false,
  buildSolarStationFieldMarkedGroundCells = () => [],
  getBoulderShadedTaskGroundCells = () => [],
  getGrowFirstHabitatTaskGroundCells = () => [],
  buildFoundationBuildZoneGroundCells = () => [],
  getWorldCellPlannerSelectedGroundCell = () => null
} = {}) {
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
    openingLeppaTreeRequestActive ?
      getLeppaTreeSurroundingGroundCells(
        session.leppaTree,
        session.groundDeadInstances
      ) :
      [];
  const leppaTreeTileHintFlashing = Boolean(isLeppaTreeTileHintFlashing());
  const markedGroundCellPulsePhase = leppaTreeTileHintFlashing ?
    (Math.sin(now * 0.035) + 1) * 0.5 :
    (Math.sin(now * 0.012) + 1) * 0.5;
  const solarStationFieldMarkedGroundCells =
    nearbyHarvestTarget?.strawBedPlacement &&
    !storyState.flags?.strawBedPlacedInBulbasaurHabitat ?
      buildSolarStationFieldMarkedGroundCells(nearbyHarvestTarget.strawBedPlacement) :
      [];
  const boulderShadedTaskGroundCells =
    canShowPassiveGroundGuidance ?
      getBoulderShadedTaskGroundCells(storyState) :
      [];
  const growFirstHabitatTaskGroundCells =
    canShowPassiveGroundGuidance ?
      getGrowFirstHabitatTaskGroundCells({
        activeQuest,
        activeSystemQuest,
        activeTask,
        storyState
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

  return {
    pendingWaterGunGroundCells,
    activeFireGroundCell,
    markedGroundCellPulsePhase,
    markedActionGroundCells
  };
}

export function resolveGameplayGroundGuidanceFrameState({
  gameplayOpeningMovementLocked = false,
  gameplayOpeningHudHidden = false,
  flowState = {},
  activeQuest = null,
  activeSystemQuest = null,
  activeTask = null,
  storyState = {},
  session = {},
  now = 0,
  solarStationPlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  nearbyHarvestTarget = null,
  waterGunEquipped = false,
  leafageEquipped = false,
  fireEquipped = false,
  openingLeppaTreeRequestActive = false,
  getPendingSquirtleWaterGunGroundCells = () => [],
  getFreeRoamRestorationGroundCells = () => [],
  getLeppaTreeSurroundingGroundCells = () => [],
  isLeppaTreeTileHintFlashing = () => false,
  buildSolarStationFieldMarkedGroundCells = () => [],
  getBoulderShadedTaskGroundCells = () => [],
  getGrowFirstHabitatTaskGroundCells = () => [],
  buildFoundationBuildZoneGroundCells = () => [],
  getWorldCellPlannerSelectedGroundCell = () => null
} = {}) {
  const canShowGroundGuidance = resolveGroundGuidanceVisibility({
    gameplayOpeningMovementLocked,
    gameplayOpeningHudHidden,
    flowState
  });
  const canShowPassiveGroundGuidance = resolveGroundGuidanceVisibility({
    gameplayOpeningMovementLocked,
    gameplayOpeningHudHidden,
    requireDialogueClosed: true,
    flowState
  });
  const markedGroundCellGuidanceState = resolveMarkedGroundCellGuidanceFrameState({
    canShowGroundGuidance,
    canShowPassiveGroundGuidance,
    activeQuest,
    activeSystemQuest,
    activeTask,
    storyState,
    session,
    now,
    solarStationPlacementPreview,
    campfirePlacementPreview,
    leafDenKitPlacementPreview,
    nearbyHarvestTarget,
    waterGunEquipped,
    leafageEquipped,
    fireEquipped,
    openingLeppaTreeRequestActive,
    getPendingSquirtleWaterGunGroundCells,
    getFreeRoamRestorationGroundCells,
    getLeppaTreeSurroundingGroundCells,
    isLeppaTreeTileHintFlashing,
    buildSolarStationFieldMarkedGroundCells,
    getBoulderShadedTaskGroundCells,
    getGrowFirstHabitatTaskGroundCells,
    buildFoundationBuildZoneGroundCells,
    getWorldCellPlannerSelectedGroundCell
  });

  return {
    canShowGroundGuidance,
    canShowPassiveGroundGuidance,
    ...markedGroundCellGuidanceState
  };
}

export function resolveGroundCellHighlightFrameState({
  canShowGroundCellHighlight = false,
  highlightedGroundCell = null,
  placementFootprints = EMPTY_PLACEMENT_FOOTPRINTS,
  solarStationPlacementPreview = null,
  greenhousePlacementPreview = null,
  campfirePlacementPreview = null,
  leafDenKitPlacementPreview = null,
  selectedWorkbenchRotationTarget = null,
  activeFireGroundCell = null,
  session = null,
  storyState = null,
  getWorkbenchRotationGroundCell = () => null,
  buildSolarStationPreviewPowerRadiusGroundCells = () => [],
  buildPlacedSolarStationPowerRadiusGroundCells = () => [],
  getGroundActionFeedbackFrame = () => null,
  getFieldToolTargetPulseFrame = () => null
} = {}) {
  const shouldShowGroundCellHighlight =
    canShowGroundCellHighlight &&
    Boolean(highlightedGroundCell);
  const fieldToolTargetPulseFrame = shouldShowGroundCellHighlight ?
    getFieldToolTargetPulseFrame(highlightedGroundCell) :
    null;
  const solarStationPlacementGroundCells = buildPreviewFootprintCells(
    solarStationPlacementPreview,
    {
      idPrefix: "solar-station-placement-preview",
      footprint: placementFootprints.solarStation,
      targetState: solarStationPlacementPreview?.valid ? "valid" : "invalid"
    }
  );
  const solarStationPlacementGroundCell = solarStationPlacementGroundCells[0] || null;
  const solarStationPowerRadiusGroundCells = solarStationPlacementPreview ?
    buildSolarStationPreviewPowerRadiusGroundCells(session, solarStationPlacementPreview) :
    leafDenKitPlacementPreview ?
      buildPlacedSolarStationPowerRadiusGroundCells(session, storyState) :
      [];
  const greenhousePlacementGroundCells = buildPreviewFootprintCells(
    greenhousePlacementPreview,
    {
      idPrefix: "greenhouse-placement-preview",
      footprint: placementFootprints.greenhouse,
      targetState: greenhousePlacementPreview?.valid ? "valid" : "invalid"
    }
  );
  const greenhousePlacementGroundCell = greenhousePlacementGroundCells[0] || null;
  const campfirePlacementGroundCells = buildPreviewFootprintCells(
    campfirePlacementPreview,
    {
      idPrefix: "train-house-placement-preview",
      footprint: placementFootprints.campfire,
      targetState: campfirePlacementPreview?.valid ? "valid" : "invalid"
    }
  );
  const campfirePlacementGroundCell = campfirePlacementGroundCells[0] || null;
  const leafDenKitPlacementGroundCells = buildPreviewFootprintCells(
    leafDenKitPlacementPreview,
    {
      idPrefix: "leaf-den-kit-placement-preview",
      footprint: placementFootprints.leafDenKit,
      targetState: leafDenKitPlacementPreview?.valid ? "valid" : "invalid"
    }
  );
  const leafDenKitPlacementGroundCell = leafDenKitPlacementGroundCells[0] || null;
  const workbenchRotationGroundCell = selectedWorkbenchRotationTarget ?
    getWorkbenchRotationGroundCell(selectedWorkbenchRotationTarget) :
    null;
  const groundActionFeedbackFrame = getGroundActionFeedbackFrame();

  return {
    shouldShowGroundCellHighlight,
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
    activeFireGroundCell,
    groundActionFeedbackFrame
  };
}
