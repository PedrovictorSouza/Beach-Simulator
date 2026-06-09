import { describe, expect, it } from "vitest";

import {
  getFieldToolWorldPromptText,
  getPendingPlacementPrompt,
  getPendingPlacementWorldPromptText,
  getPlayerInteractionWorldPromptText,
  getRunBreadcrumbWorldPromptText
} from "../app/runtime/presentation/worldPromptCopy.js";
import { GAMEPAD_LAYOUT, INPUT_DEVICE } from "../input/inputModality.js";

describe("world prompt copy", () => {
  it("keeps pending placement HUD copy for house kits, straw beds and generic objects", () => {
    expect(getPendingPlacementPrompt(null)).toBe("");
    expect(getPendingPlacementPrompt({
      itemId: "leafDenKit",
      blockedReason: "needs-solar-station"
    })).toBe("House Kit ready  Place Solar Station first");
    expect(getPendingPlacementPrompt({
      itemId: "leafDenKit"
    }, null, {})).toBe("Set first shelter site  X / Enter Place");
    expect(getPendingPlacementPrompt({
      itemId: "strawBed"
    }, {
      strawBedPlacement: {
        canPlace: false
      }
    })).toBe("Solar Station ready  Find clear ground");
    expect(getPendingPlacementPrompt({
      itemId: "strawBed"
    }, {
      strawBedPlacement: {
        canPlace: true
      }
    }, {})).toBe("Set Solar Station site  X / Enter Place");
    expect(getPendingPlacementPrompt({
      itemId: "lamp",
      label: "Lamp"
    }, null, {})).toBe("Lamp ready  X / Enter Place");
  });

  it("keeps pending placement world copy and input modality labels", () => {
    expect(getPendingPlacementWorldPromptText({
      itemId: "leafDenKit",
      blockedReason: "needs-solar-station"
    })).toBe("Needs Solar Station");
    expect(getPendingPlacementWorldPromptText({
      itemId: "strawBed"
    }, {
      strawBedPlacement: {
        canPlace: false
      }
    })).toBe("Find clear ground");
    expect(getPendingPlacementWorldPromptText({
      itemId: "lamp"
    }, null, {})).toBe("X / Enter Place");
    expect(getPendingPlacementWorldPromptText({
      itemId: "lamp"
    }, null, {
      device: INPUT_DEVICE.GAMEPAD,
      gamepadLayout: GAMEPAD_LAYOUT.NINTENDO
    })).toBe("Y Place");
  });

  it("keeps player-facing world prompt text derived from input prompts", () => {
    expect(getPlayerInteractionWorldPromptText({})).toBe("press E");
    expect(getRunBreadcrumbWorldPromptText({})).toBe("press Shift to run!");
    expect(getFieldToolWorldPromptText({})).toBe("Press Enter");

    const customKeyboard = {
      keyboardControls: {
        interact: "KeyF",
        run: "KeyV",
        primaryAction: "KeyQ"
      }
    };

    expect(getPlayerInteractionWorldPromptText(customKeyboard)).toBe("press F");
    expect(getRunBreadcrumbWorldPromptText(customKeyboard)).toBe("press V to run!");
    expect(getFieldToolWorldPromptText(customKeyboard)).toBe("Press Q");
  });
});
