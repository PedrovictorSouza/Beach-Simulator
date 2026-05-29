import { describe, expect, it } from "vitest";
import {
  listWorldObjectPlacementFeedbackReasons,
  resolveWorldObjectPlacementFeedback,
  WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON
} from "../app/gameplay/worldObjectPlacementFeedback.js";

describe("world object placement feedback", () => {
  it("returns ready feedback for valid placement states", () => {
    expect(resolveWorldObjectPlacementFeedback({ valid: true })).toEqual({
      id: "placement-feedback:valid",
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.VALID,
      result: "valid",
      severity: "ready",
      visualState: "valid",
      channels: ["worldPrompt", "groundHighlight", "placementPreview"],
      message: "Place object",
      worldPrompt: "Place object",
      placementLabel: "Valid site",
      prompt: "Place object",
      repeatable: false,
      cooldownMs: 0
    });
  });

  it("maps missing target feedback to a pending nudge", () => {
    expect(resolveWorldObjectPlacementFeedback("missing-grid-cell")).toEqual({
      id: "placement-feedback:missing-grid-cell",
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.MISSING_GRID_CELL,
      result: "no-target",
      severity: "nudge",
      visualState: "pending",
      channels: ["worldPrompt", "placementPreview"],
      message: "Aim at buildable ground.",
      worldPrompt: "Find buildable ground",
      placementLabel: "No target",
      prompt: "Find buildable ground",
      repeatable: true,
      cooldownMs: 650
    });
  });

  it("maps occupied and out-of-bounds feedback to invalid placement prompts", () => {
    expect(resolveWorldObjectPlacementFeedback({ reason: "occupied-footprint" })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.OCCUPIED_FOOTPRINT,
      result: "blocked",
      severity: "warning",
      visualState: "invalid",
      channels: ["worldPrompt", "groundHighlight", "placementPreview"],
      message: "Blocked. Choose a clear spot.",
      worldPrompt: "Choose a clear spot"
    });

    expect(resolveWorldObjectPlacementFeedback({ reason: "outside-world-bounds" })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.OUTSIDE_WORLD_BOUNDS,
      message: "Outside build area.",
      worldPrompt: "Move inside the build area"
    });
  });

  it("maps metadata and commit failures to specific UI copy", () => {
    expect(resolveWorldObjectPlacementFeedback({ reason: "missing-source-item" })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.MISSING_SOURCE_ITEM,
      message: "Missing kit.",
      channels: ["notice", "worldPrompt"]
    });

    expect(resolveWorldObjectPlacementFeedback({ reason: "missing-grid-placeable" })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.MISSING_GRID_PLACEABLE,
      message: "Build plan is not ready.",
      channels: ["notice"]
    });

    expect(resolveWorldObjectPlacementFeedback({ reason: "commit-rejected" })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.COMMIT_REJECTED,
      message: "Still blocked. Try another spot.",
      worldPrompt: "Still blocked"
    });
  });

  it("extracts feedback reason from preview and confirmation results", () => {
    expect(resolveWorldObjectPlacementFeedback({
      preview: { reason: "occupied-footprint" }
    })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.OCCUPIED_FOOTPRINT
    });

    expect(resolveWorldObjectPlacementFeedback({
      active: true,
      readyForConfirm: false
    })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.PREVIEW_NOT_READY,
      message: "Move the preview to valid ground."
    });

    expect(resolveWorldObjectPlacementFeedback({
      reason: "unexpected-new-reason"
    })).toMatchObject({
      reason: WORLD_OBJECT_PLACEMENT_FEEDBACK_REASON.UNKNOWN,
      message: "Cannot place here."
    });
  });

  it("lists known reasons for debug menus and tests", () => {
    expect(listWorldObjectPlacementFeedbackReasons()).toEqual([
      "valid",
      "missing-grid-cell",
      "outside-world-bounds",
      "occupied-footprint",
      "missing-world-position",
      "missing-source-item",
      "missing-grid-placeable",
      "inactive-preview",
      "preview-not-ready",
      "commit-rejected",
      "unknown"
    ]);
  });
});
