import { describe, expect, it, vi } from "vitest";

import {
  createGameplaySupplyFeedbackRuntimeBundle,
  createSupplyFeedbackRuntimeBundle
} from "../app/runtime/presentation/supplyFeedbackRuntimeBundle.js";

describe("createSupplyFeedbackRuntimeBundle", () => {
  it("wires counter prompts and pickup feedback with the existing public contract", () => {
    const audio = {
      playWoodGrab: vi.fn()
    };
    const controls = {
      inventory: {
        wood: 2
      }
    };
    const gameplay = {
      getItemLabel: vi.fn((itemId) => itemId === "wood" ? "Wood" : itemId)
    };
    const hud = {
      pushNotice: vi.fn(),
      syncInventoryUi: vi.fn()
    };

    const bundle = createSupplyFeedbackRuntimeBundle({
      audio,
      controls,
      gameplay,
      hud,
      itemIds: ["wood"],
      session: {},
      config: {
        playerCounterPromptDurationMs: 1000
      },
      getNowMs: () => 500
    });

    bundle.pushSupplyResourceCollectFeedback({
      itemId: "wood",
      count: 2
    });

    expect(audio.playWoodGrab).toHaveBeenCalledTimes(2);
    expect(hud.syncInventoryUi).toHaveBeenCalledWith(controls.inventory);
    expect(hud.pushNotice).toHaveBeenCalledWith("+2 Wood");
    expect(bundle.playerCounterPromptRuntime.get(600)).toContain("Wood");
    expect(bundle.queueChangedSupplyPickupFlyItems({ wood: 1 }, { wood: 2 }))
      .toBe(true);
    expect(bundle.queueSupplyPickupFlyItems).toBe(
      bundle.supplyPickupFeedbackRuntime.queueFlyItems
    );
  });

  it("wires gameplay pickup item ids and counter prompt timing by default", () => {
    const audio = {
      playWoodGrab: vi.fn()
    };
    const controls = {
      inventory: {
        gear: 2,
        wood: 1
      }
    };
    const hud = {
      pushNotice: vi.fn(),
      syncInventoryUi: vi.fn()
    };
    const bundle = createGameplaySupplyFeedbackRuntimeBundle({
      audio,
      controls,
      gameplay: {
        getItemLabel: (itemId) => itemId
      },
      hud,
      session: {},
      getNowMs: () => 500
    });

    expect(bundle.queueChangedSupplyPickupFlyItems({ gear: 1 }, { gear: 2 }))
      .toBe(true);

    bundle.pushSupplyResourceCollectFeedback({
      itemId: "wood",
      count: 1
    });

    expect(bundle.playerCounterPromptRuntime.get(1999)).toContain("wood");
    expect(bundle.playerCounterPromptRuntime.get(2000)).toBeNull();
  });
});
