export function updateGroundCellHighlightFrame(nextFrame, {
  solarStationPlacementGroundCell,
  solarStationPowerRadiusGroundCells = [],
  solarStationPlacementGroundCells = [],
  greenhousePlacementGroundCell,
  greenhousePlacementGroundCells = [],
  campfirePlacementGroundCell,
  campfirePlacementGroundCells = [],
  leafDenKitPlacementGroundCell,
  leafDenKitPlacementGroundCells = [],
  workbenchRotationGroundCell,
  activeFireGroundCell,
  shouldShowGroundCellHighlight,
  highlightedGroundCell,
  highlightedGroundCellTargetState,
  highlightedGroundCellAbilityId,
  markedActionGroundCells = [],
  markedGroundCellPulsePhase = 0,
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
