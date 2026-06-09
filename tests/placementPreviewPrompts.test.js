import { describe, expect, it } from "vitest";

import { resolveFramePlacementPrompts } from "../app/runtime/construction/placementPreviewPrompts.js";

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
});
