import { describe, expect, it } from "vitest";

import { updateGroundCellHighlightFrame } from "../app/runtime/presentation/groundCellHighlightFrame.js";

function createSnapshot() {
  return {
    groundCellHighlight: {
      visible: false,
      groundCell: null,
      markedGroundCells: [],
      pulsePhase: 0,
      actionPulseGroundCell: null,
      actionPulsePhase: 0,
      actionPulseAbilityId: null
    }
  };
}

describe("ground cell highlight frame", () => {
  it("writes placement footprint marked cells before lower-priority direct highlights", () => {
    const snapshot = createSnapshot();
    const solarPowerCell = { id: "power" };
    const solarPlacementCell = { id: "placement" };
    const activeFireGroundCell = { id: "fire" };

    updateGroundCellHighlightFrame(snapshot, {
      solarStationPlacementGroundCell: solarPlacementCell,
      solarStationPowerRadiusGroundCells: [solarPowerCell],
      solarStationPlacementGroundCells: [solarPlacementCell],
      activeFireGroundCell
    });

    expect(snapshot.groundCellHighlight.visible).toBe(true);
    expect(snapshot.groundCellHighlight.groundCell).toBeNull();
    expect(snapshot.groundCellHighlight.markedGroundCells).toEqual([
      solarPowerCell,
      solarPlacementCell
    ]);
  });

  it("copies action target metadata onto highlighted ground cells", () => {
    const snapshot = createSnapshot();

    updateGroundCellHighlightFrame(snapshot, {
      shouldShowGroundCellHighlight: true,
      highlightedGroundCell: { id: "target" },
      highlightedGroundCellTargetState: "invalid",
      highlightedGroundCellAbilityId: "fire"
    });

    expect(snapshot.groundCellHighlight).toEqual(expect.objectContaining({
      visible: true,
      groundCell: {
        id: "target",
        highlightTargetState: "invalid",
        highlightAbilityId: "fire"
      }
    }));
  });

  it("keeps field-tool target pulse details after feedback frame details", () => {
    const snapshot = createSnapshot();

    updateGroundCellHighlightFrame(snapshot, {
      markedActionGroundCells: [{ id: "marked" }],
      markedGroundCellPulsePhase: 0.25,
      groundActionFeedbackFrame: {
        markedGroundCells: [{ id: "feedback" }],
        pulsePhase: 0.5,
        groundCell: { id: "feedback-cell" },
        abilityId: "waterGun"
      },
      fieldToolTargetPulseFrame: {
        groundCell: { id: "pulse-cell" },
        abilityId: "leafage",
        progress: 0.75,
        scale: 1.2,
        brightness: 0.8
      }
    });

    expect(snapshot.groundCellHighlight.visible).toBe(true);
    expect(snapshot.groundCellHighlight.markedGroundCells).toEqual([
      { id: "marked" },
      { id: "feedback" }
    ]);
    expect(snapshot.groundCellHighlight.pulsePhase).toBe(0.5);
    expect(snapshot.groundCellHighlight.actionPulseGroundCell).toEqual({
      id: "pulse-cell",
      highlightAbilityId: "leafage",
      highlightPulseScale: 1.2,
      highlightPulseBrightness: 0.8
    });
    expect(snapshot.groundCellHighlight.actionPulsePhase).toBe(0.75);
    expect(snapshot.groundCellHighlight.actionPulseAbilityId).toBe("leafage");
  });
});
