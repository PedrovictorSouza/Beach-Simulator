import { describe, expect, it, vi } from "vitest";

import {
  resolveGameplayGroundGuidanceFrameState,
  resolveGameplayGroundCellHighlightFrameState,
  resolveGroundCellHighlightFrameState,
  resolveMarkedGroundCellGuidanceFrameState
} from "../app/runtime/presentation/groundCellHighlightFrameState.js";

const placementFootprints = {
  solarStation: { width: 2, height: 1 },
  greenhouse: { width: 1, height: 2 },
  campfire: { width: 1, height: 1 },
  leafDenKit: { width: 2, height: 2 }
};

describe("ground cell highlight frame state", () => {
  it("resolves gameplay ground guidance visibility before marked cells", () => {
    const waterCell = { id: "water" };
    const getPendingSquirtleWaterGunGroundCells = vi.fn(() => [waterCell]);

    const frameState = resolveGameplayGroundGuidanceFrameState({
      gameplayOpeningMovementLocked: false,
      gameplayOpeningHudHidden: false,
      flowState: {},
      storyState: { flags: {} },
      session: {
        playerCharacter: {
          getPosition: () => [0, 0, 0]
        }
      },
      getPendingSquirtleWaterGunGroundCells
    });

    expect(frameState.canShowGroundGuidance).toBe(true);
    expect(frameState.canShowPassiveGroundGuidance).toBe(true);
    expect(frameState.pendingWaterGunGroundCells).toEqual([waterCell]);
    expect(frameState.markedActionGroundCells).toEqual([waterCell]);

    const blockedState = resolveGameplayGroundGuidanceFrameState({
      gameplayOpeningMovementLocked: true,
      gameplayOpeningHudHidden: true,
      flowState: {},
      storyState: { flags: {} },
      session: {
        playerCharacter: {
          getPosition: () => [0, 0, 0]
        }
      },
      getPendingSquirtleWaterGunGroundCells
    });

    expect(blockedState.canShowGroundGuidance).toBe(false);
    expect(blockedState.canShowPassiveGroundGuidance).toBe(false);
    expect(blockedState.pendingWaterGunGroundCells).toEqual([]);
    expect(getPendingSquirtleWaterGunGroundCells).toHaveBeenCalledTimes(1);
  });

  it("resolves marked guidance cells, pulse phase and active fire cells", () => {
    const sharedCell = { id: "shared" };
    const playerCharacter = {
      getPosition: () => [1, 0, 2]
    };
    const getFreeRoamRestorationGroundCells = vi.fn(() => [sharedCell]);
    const getLeppaTreeSurroundingGroundCells = vi.fn(() => [sharedCell, { id: "leppa" }]);
    const buildSolarStationFieldMarkedGroundCells = vi.fn(() => [{ id: "solar-field" }]);
    const getBoulderShadedTaskGroundCells = vi.fn(() => [{ id: "boulder" }]);
    const getGrowFirstHabitatTaskGroundCells = vi.fn(() => [{ id: "grow" }]);
    const buildFoundationBuildZoneGroundCells = vi.fn(() => [{ id: "foundation" }]);
    const getWorldCellPlannerSelectedGroundCell = vi.fn(() => ({ id: "planner" }));

    const frameState = resolveMarkedGroundCellGuidanceFrameState({
      canShowGroundGuidance: true,
      canShowPassiveGroundGuidance: true,
      activeQuest: null,
      activeSystemQuest: { id: "system" },
      activeTask: { id: "task" },
      storyState: {
        flags: {}
      },
      session: {
        playerCharacter,
        leppaTree: { id: "leppa-tree" },
        groundDeadInstances: [{ id: "dead" }],
        bulbasaurLeafageAction: {
          groundCell: { id: "leafage" }
        },
        charmanderFireAction: {
          groundCell: { id: "fire" },
          impactApplied: false
        }
      },
      now: 0,
      nearbyHarvestTarget: {
        strawBedPlacement: { id: "straw-bed" }
      },
      waterGunEquipped: true,
      leafageEquipped: true,
      fireEquipped: false,
      openingLeppaTreeRequestActive: true,
      getPendingSquirtleWaterGunGroundCells: () => [sharedCell, { id: "water" }],
      getFreeRoamRestorationGroundCells,
      getLeppaTreeSurroundingGroundCells,
      isLeppaTreeTileHintFlashing: () => true,
      buildSolarStationFieldMarkedGroundCells,
      getBoulderShadedTaskGroundCells,
      getGrowFirstHabitatTaskGroundCells,
      buildFoundationBuildZoneGroundCells,
      getWorldCellPlannerSelectedGroundCell
    });

    expect(frameState.pendingWaterGunGroundCells).toEqual([
      sharedCell,
      { id: "water" }
    ]);
    expect(frameState.activeFireGroundCell).toEqual({
      id: "fire",
      highlightTargetState: "valid",
      highlightAbilityId: "fire"
    });
    expect(frameState.markedGroundCellPulsePhase).toBe(0.5);
    expect(frameState.markedActionGroundCells).toEqual([
      sharedCell,
      { id: "leppa" },
      { id: "water" },
      { id: "leafage" },
      { id: "boulder" },
      { id: "grow" },
      { id: "foundation" },
      { id: "solar-field" },
      { id: "planner" }
    ]);
    expect(getFreeRoamRestorationGroundCells).toHaveBeenCalledWith({
      playerPosition: [1, 0, 2],
      waterGunEquipped: true,
      leafageEquipped: true,
      fireEquipped: false
    });
    expect(getLeppaTreeSurroundingGroundCells).toHaveBeenCalledWith(
      { id: "leppa-tree" },
      [{ id: "dead" }]
    );
    expect(buildSolarStationFieldMarkedGroundCells).toHaveBeenCalledWith({ id: "straw-bed" });
    expect(getGrowFirstHabitatTaskGroundCells).toHaveBeenCalledWith({
      activeQuest: null,
      activeSystemQuest: { id: "system" },
      activeTask: { id: "task" },
      storyState: { flags: {} }
    });
  });

  it("builds placement footprint cells and Solar Station radius cells", () => {
    const buildSolarStationPreviewPowerRadiusGroundCells = vi.fn(() => [
      { id: "solar-power" }
    ]);

    const frameState = resolveGroundCellHighlightFrameState({
      placementFootprints,
      solarStationPlacementPreview: {
        snappedPosition: [10, 0.02, 20],
        gridStep: 1,
        valid: true
      },
      greenhousePlacementPreview: {
        snappedPosition: [2, 0.02, 3],
        gridStep: 1,
        valid: false
      },
      session: { id: "session" },
      storyState: { flags: {} },
      buildSolarStationPreviewPowerRadiusGroundCells,
      buildPlacedSolarStationPowerRadiusGroundCells: () => [],
      getWorkbenchRotationGroundCell: () => null,
      getGroundActionFeedbackFrame: () => null,
      getFieldToolTargetPulseFrame: () => null
    });

    expect(buildSolarStationPreviewPowerRadiusGroundCells).toHaveBeenCalledWith(
      { id: "session" },
      expect.objectContaining({ snappedPosition: [10, 0.02, 20] })
    );
    expect(frameState.solarStationPlacementGroundCell).toEqual(
      expect.objectContaining({
        id: "solar-station-placement-preview-0-0",
        highlightTargetState: "valid"
      })
    );
    expect(frameState.solarStationPlacementGroundCells).toHaveLength(2);
    expect(frameState.solarStationPowerRadiusGroundCells).toEqual([
      { id: "solar-power" }
    ]);
    expect(frameState.greenhousePlacementGroundCell).toEqual(
      expect.objectContaining({
        id: "greenhouse-placement-preview-0-0",
        highlightTargetState: "invalid"
      })
    );
    expect(frameState.greenhousePlacementGroundCells).toHaveLength(2);
  });

  it("uses placed Solar Station radius cells while previewing a Leaf Den Kit", () => {
    const buildPlacedSolarStationPowerRadiusGroundCells = vi.fn(() => [
      { id: "placed-solar-power" }
    ]);
    const storyState = { flags: { solarStationPlaced: true } };

    const frameState = resolveGroundCellHighlightFrameState({
      placementFootprints,
      leafDenKitPlacementPreview: {
        snappedPosition: [1, 0.02, 1],
        gridStep: 1,
        valid: false
      },
      session: { id: "session" },
      storyState,
      buildSolarStationPreviewPowerRadiusGroundCells: () => [],
      buildPlacedSolarStationPowerRadiusGroundCells,
      getWorkbenchRotationGroundCell: () => null,
      getGroundActionFeedbackFrame: () => null,
      getFieldToolTargetPulseFrame: () => null
    });

    expect(buildPlacedSolarStationPowerRadiusGroundCells).toHaveBeenCalledWith(
      { id: "session" },
      storyState
    );
    expect(frameState.leafDenKitPlacementGroundCell).toEqual(
      expect.objectContaining({
        id: "leaf-den-kit-placement-preview-0-0",
        highlightTargetState: "invalid"
      })
    );
    expect(frameState.leafDenKitPlacementGroundCells).toHaveLength(4);
    expect(frameState.solarStationPowerRadiusGroundCells).toEqual([
      { id: "placed-solar-power" }
    ]);
  });

  it("resolves direct highlight, workbench rotation, feedback and target pulse frames", () => {
    const highlightedGroundCell = { id: "highlighted" };
    const getWorkbenchRotationGroundCell = vi.fn(() => ({ id: "workbench-cell" }));
    const getGroundActionFeedbackFrame = vi.fn(() => ({ id: "feedback-frame" }));
    const getFieldToolTargetPulseFrame = vi.fn(() => ({ id: "pulse-frame" }));

    const frameState = resolveGroundCellHighlightFrameState({
      placementFootprints,
      canShowGroundCellHighlight: true,
      highlightedGroundCell,
      selectedWorkbenchRotationTarget: { id: "workbench" },
      getWorkbenchRotationGroundCell,
      getGroundActionFeedbackFrame,
      getFieldToolTargetPulseFrame
    });

    expect(frameState.shouldShowGroundCellHighlight).toBe(true);
    expect(frameState.fieldToolTargetPulseFrame).toEqual({ id: "pulse-frame" });
    expect(frameState.workbenchRotationGroundCell).toEqual({ id: "workbench-cell" });
    expect(frameState.groundActionFeedbackFrame).toEqual({ id: "feedback-frame" });
    expect(getWorkbenchRotationGroundCell).toHaveBeenCalledWith({ id: "workbench" });
    expect(getFieldToolTargetPulseFrame).toHaveBeenCalledWith(highlightedGroundCell);
    expect(getGroundActionFeedbackFrame).toHaveBeenCalledTimes(1);
  });

  it("applies gameplay highlight visibility before resolving direct ground-cell highlight state", () => {
    const highlightedGroundCell = { id: "highlighted" };
    const getFieldToolTargetPulseFrame = vi.fn(() => ({ id: "pulse-frame" }));

    const visibleState = resolveGameplayGroundCellHighlightFrameState({
      gameplayOpeningMovementLocked: false,
      flowState: {},
      highlightedGroundCell,
      getFieldToolTargetPulseFrame
    });

    expect(visibleState.shouldShowGroundCellHighlight).toBe(true);
    expect(visibleState.fieldToolTargetPulseFrame).toEqual({ id: "pulse-frame" });

    const blockedState = resolveGameplayGroundCellHighlightFrameState({
      gameplayOpeningMovementLocked: true,
      flowState: {},
      highlightedGroundCell,
      getFieldToolTargetPulseFrame
    });

    expect(blockedState.shouldShowGroundCellHighlight).toBe(false);
    expect(blockedState.fieldToolTargetPulseFrame).toBe(null);
    expect(getFieldToolTargetPulseFrame).toHaveBeenCalledTimes(1);
  });
});
