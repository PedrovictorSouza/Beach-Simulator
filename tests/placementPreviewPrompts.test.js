import { describe, expect, it } from "vitest";

import {
  buildFreeBlockBuildCostMarker,
  formatFreeBlockCostNumber,
  getFreeBlockInvalidPlacementNotice,
  getFreeBlockPlacementNotice,
  resolveFramePlacementPrompts
} from "../app/runtime/construction/placementPreviewPrompts.js";

describe("placement preview prompts", () => {
  it("resolves valid placement preview prompts", () => {
    expect(resolveFramePlacementPrompts({
      solarStationPlacementPreview: { valid: true },
      greenhousePlacementPreview: { valid: true },
      campfirePlacementPreview: { valid: true },
      leafDenKitPlacementPreview: { valid: true }
    })).toEqual({
      solarStationPlacementPrompt: "Set Solar Station site  X / Enter Place  Space Cancel",
      greenhousePlacementPrompt: "Move the Greenhouse preview  X / Enter Place  Space Cancel",
      campfirePlacementPrompt: "Move the Thermal Cabin preview  X / Enter Place  Space Cancel",
      leafDenKitPlacementPrompt: "Set first shelter site  X / Enter Place  Space Cancel"
    });
  });

  it("resolves blocked placement preview prompts without place input", () => {
    expect(resolveFramePlacementPrompts({
      solarStationPlacementPreview: { valid: false },
      greenhousePlacementPreview: { valid: false },
      campfirePlacementPreview: { valid: false },
      leafDenKitPlacementPreview: { valid: false }
    })).toEqual({
      solarStationPlacementPrompt: "Choose a clear spot  Space Cancel",
      greenhousePlacementPrompt: "Choose a clear spot  Space Cancel",
      campfirePlacementPrompt: "Choose a clear spot  Space Cancel",
      leafDenKitPlacementPrompt: "Choose a clear spot  Space Cancel"
    });
  });

  it("resolves House Kit power radius prompt separately from generic blockers", () => {
    expect(resolveFramePlacementPrompts({
      leafDenKitPlacementPreview: {
        valid: false,
        invalidReason: "outside-solar-station-radius"
      }
    })).toEqual({
      solarStationPlacementPrompt: "",
      greenhousePlacementPrompt: "",
      campfirePlacementPrompt: "",
      leafDenKitPlacementPrompt: "Place inside blue zone  Space Cancel"
    });
  });

  it("uses gamepad modality prompts without changing placement copy", () => {
    expect(resolveFramePlacementPrompts({
      solarStationPlacementPreview: { valid: true },
      inputModalityState: {
        device: "gamepad",
        gamepadLayout: "xbox"
      }
    }).solarStationPlacementPrompt).toBe(
      "Set Solar Station site  X Place  B Cancel  LB/RB Rotate"
    );
  });

  it("resolves free block placement notices without changing copy", () => {
    expect(getFreeBlockInvalidPlacementNotice("outside-build-zone")).toBe(
      "Build inside the blue foundation."
    );
    expect(getFreeBlockInvalidPlacementNotice("duplicate-block")).toBe(
      "That foundation edge is already built."
    );
    expect(getFreeBlockInvalidPlacementNotice("player-cell")).toBe(
      "Step off the foundation edge first."
    );
    expect(getFreeBlockInvalidPlacementNotice("blocked-cell")).toBe(
      "That foundation edge is blocked."
    );
    expect(getFreeBlockInvalidPlacementNotice("outside-build-area")).toBe(
      "Move back to the foundation build area."
    );
    expect(getFreeBlockInvalidPlacementNotice("unknown")).toBe(
      "Block can't be placed there."
    );
    expect(getFreeBlockPlacementNotice({ reason: "missing-material" })).toBe("Need Wood");
    expect(getFreeBlockPlacementNotice({ placed: true, blockType: "wall" })).toBe("Wall placed.");
    expect(getFreeBlockPlacementNotice({ placed: true, blockType: "block" })).toBe("Block placed.");
    expect(getFreeBlockPlacementNotice({ placed: false, reason: "blocked-cell" })).toBe(
      "That foundation edge is blocked."
    );
  });

  it("formats and builds free block cost markers", () => {
    expect(formatFreeBlockCostNumber(3)).toBe("3");
    expect(formatFreeBlockCostNumber(1.25)).toBe("1.3");
    expect(buildFreeBlockBuildCostMarker({
      previewTarget: {
        targetPosition: [1, 0.03, 2]
      },
      materialCost: {
        itemId: "wood",
        quantity: 2
      },
      inventory: {
        wood: 1
      }
    })).toEqual({
      text: "2/1",
      affordable: false,
      worldPosition: [1, 0.03, 2]
    });
    expect(buildFreeBlockBuildCostMarker({
      previewTarget: {
        targetPosition: [1, 0.03, 2]
      },
      materialCost: {
        itemId: "wood",
        quantity: 0.5
      },
      inventory: {
        wood: 1
      }
    })).toEqual({
      text: "0.5/1",
      affordable: true,
      worldPosition: [1, 0.03, 2]
    });
    expect(buildFreeBlockBuildCostMarker({
      previewTarget: null,
      materialCost: {
        itemId: "wood",
        quantity: 1
      },
      inventory: {
        wood: 1
      }
    })).toBeNull();
  });
});
