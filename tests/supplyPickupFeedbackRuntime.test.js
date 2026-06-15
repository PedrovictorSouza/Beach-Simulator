import { describe, expect, it, vi } from "vitest";

import { createSupplyPickupFeedbackRuntime } from "../app/runtime/presentation/supplyPickupFeedbackRuntime.js";

function createCanvas() {
  return {
    width: 100,
    height: 100,
    ownerDocument: {
      defaultView: {
        innerWidth: 800,
        innerHeight: 600
      }
    },
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100
    })
  };
}

function createHarness(overrides = {}) {
  const session = {
    playerCharacter: {
      getPosition: vi.fn(() => [4, 0, 4])
    },
    ...overrides.session
  };
  const controls = {
    inventory: {
      carbon: 2,
      gear: 1,
      leaves: 3,
      wood: 5
    },
    ...overrides.controls
  };
  const hud = {
    pushNotice: vi.fn(),
    queueSupplyPickupFlyToSlot: vi.fn(),
    syncInventoryUi: vi.fn(),
    ...overrides.hud
  };
  const audio = {
    playWoodGrab: vi.fn(),
    ...overrides.audio
  };
  const camera = {
    getViewProjection: vi.fn(),
    project: vi.fn((position) => ({
      x: position[0] * 10,
      y: position[2] * 10,
      depth: 0.5
    })),
    ...overrides.camera
  };
  const supplyCounterPromptController = {
    getLabel: vi.fn((itemId) => `Label ${itemId}`),
    trigger: vi.fn(),
    ...overrides.supplyCounterPromptController
  };
  const runtime = createSupplyPickupFeedbackRuntime({
    audio,
    camera,
    controls,
    hud,
    itemIds: ["wood", "gear", "carbon"],
    session,
    supplyCounterPromptController,
    worldCanvas: createCanvas(),
    getNowMs: () => 1234,
    ...overrides.runtimeOptions
  });

  return {
    audio,
    camera,
    controls,
    hud,
    runtime,
    session,
    supplyCounterPromptController
  };
}

describe("createSupplyPickupFeedbackRuntime", () => {
  it("queues up to three projected supply pickup fly origins", () => {
    const { hud, runtime } = createHarness();

    runtime.queueFlyItems("wood", [
      [1, 0, 1],
      [2, 0, 2],
      [3, 0, 3],
      [4, 0, 4]
    ]);

    expect(hud.queueSupplyPickupFlyToSlot).toHaveBeenCalledTimes(3);
    expect(hud.queueSupplyPickupFlyToSlot).toHaveBeenNthCalledWith(1, {
      itemId: "wood",
      origin: { x: 10, y: 10 }
    });
    expect(hud.queueSupplyPickupFlyToSlot).toHaveBeenNthCalledWith(3, {
      itemId: "wood",
      origin: { x: 30, y: 30 }
    });
  });

  it("queues changed supply gains from inventory deltas", () => {
    const { hud, runtime } = createHarness();

    expect(runtime.queueChangedFlyItems({
      wood: 3,
      gear: 1,
      carbon: 0
    }, {
      wood: 5,
      gear: 1,
      carbon: 1
    })).toBe(true);

    expect(hud.queueSupplyPickupFlyToSlot).toHaveBeenCalledTimes(3);
    expect(hud.queueSupplyPickupFlyToSlot.mock.calls.map(([entry]) => entry.itemId))
      .toEqual(["wood", "wood", "carbon"]);
  });

  it("pushes resource collect feedback through audio, HUD, fly queue and counter prompt", () => {
    const {
      audio,
      controls,
      hud,
      runtime,
      supplyCounterPromptController
    } = createHarness();

    runtime.pushResourceCollectFeedback({
      itemId: "gear",
      count: 2,
      sourcePositions: [
        [2, 0, 2],
        [3, 0, 3]
      ]
    });

    expect(audio.playWoodGrab).toHaveBeenCalledTimes(2);
    expect(hud.syncInventoryUi).toHaveBeenCalledWith(controls.inventory);
    expect(hud.queueSupplyPickupFlyToSlot).toHaveBeenCalledTimes(2);
    expect(hud.pushNotice).toHaveBeenCalledWith("+2 Label gear");
    expect(supplyCounterPromptController.trigger)
      .toHaveBeenCalledWith("gear", controls.inventory, 1234);
  });

  it("ignores empty feedback requests", () => {
    const { audio, hud, runtime, supplyCounterPromptController } = createHarness();

    runtime.pushResourceCollectFeedback({
      itemId: "wood",
      count: 0
    });

    expect(audio.playWoodGrab).not.toHaveBeenCalled();
    expect(hud.pushNotice).not.toHaveBeenCalled();
    expect(supplyCounterPromptController.trigger).not.toHaveBeenCalled();
  });
});
