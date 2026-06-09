import { describe, expect, it, vi } from "vitest";

import { createSupplyCounterPromptController } from "../app/runtime/presentation/supplyCounterPrompt.js";

describe("supply counter prompt", () => {
  it("snapshots inventory counts as numbers", () => {
    const controller = createSupplyCounterPromptController();

    expect(controller.snapshot({
      wood: "2",
      leaves: 3,
      missing: undefined
    })).toEqual({
      wood: 2,
      leaves: 3,
      missing: 0
    });
  });

  it("resolves item labels with fallback for missing or blank labels", () => {
    const controller = createSupplyCounterPromptController({
      getItemLabel: (itemId) => itemId === "wood" ? "Wood" : " "
    });

    expect(controller.getLabel("wood")).toBe("Wood");
    expect(controller.getLabel("leaves")).toBe("leaves");
  });

  it("triggers formatted prompts only for positive counts", () => {
    const triggerPrompt = vi.fn();
    const controller = createSupplyCounterPromptController({
      getItemLabel: () => "Wood",
      triggerPrompt
    });

    expect(controller.trigger("wood", { wood: 2 }, 1234)).toBe(true);
    expect(triggerPrompt).toHaveBeenCalledWith("Wood x2 - shelter/furniture", 1234);

    triggerPrompt.mockClear();
    expect(controller.trigger("wood", { wood: 0 }, 1234)).toBe(false);
    expect(triggerPrompt).not.toHaveBeenCalled();
  });

  it("triggers the first increased inventory item", () => {
    const triggerPrompt = vi.fn();
    const controller = createSupplyCounterPromptController({
      getItemLabel: (itemId) => itemId,
      triggerPrompt
    });

    expect(controller.triggerChanged({
      wood: 1,
      leaves: 0
    }, {
      wood: 1,
      leaves: 2
    }, 500)).toBe(true);
    expect(triggerPrompt).toHaveBeenCalledWith(
      "leaves x2 - habitat build",
      500
    );
  });
});
