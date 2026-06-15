import { describe, expect, it, vi } from "vitest";

import { createFieldMoveImpactRuntime } from "../app/runtime/fieldMoveRuntime/fieldMoveImpactRuntime.js";

function createHarness(overrides = {}) {
  const controls = {
    inventory: {
      carbon: 1,
      wood: 2
    },
    storyState: {
      flags: {}
    },
    ...overrides.controls
  };
  const session = {
    palmModel: { id: "palm-model" },
    palmInstances: [],
    resourceNodes: [],
    leppaTree: null,
    groundDeadInstances: [],
    iceGroundInstances: [],
    groundFlowerPatches: [],
    groundGrassPatches: [],
    groundPurifiedInstances: [],
    leafDen: null,
    woodDrops: [],
    leppaBerryDrops: [],
    ...overrides.session
  };
  const callbacks = {
    companionAbilityResourcesRuntime: {
      recordSquirtleWaterGunUse: vi.fn()
    },
    getNowMs: vi.fn(() => 1234),
    groundActionFeedbackRuntime: {
      triggerFeedback: vi.fn()
    },
    hud: {
      syncInventoryUi: vi.fn()
    },
    performGameplayHarvestAction: vi.fn(() => true),
    playInstanceObjectSfx: vi.fn(),
    supplyCounterPromptController: {
      trigger: vi.fn()
    },
    ...overrides.callbacks
  };
  const runtime = createFieldMoveImpactRuntime({
    session,
    controls,
    carbonItemId: "carbon",
    ...callbacks
  });

  return {
    callbacks,
    controls,
    runtime,
    session
  };
}

describe("createFieldMoveImpactRuntime", () => {
  it("applies Water Gun impact with the existing harvest shape and records stamina usage", () => {
    const groundCell = { id: "dry-grass-a", offset: [1, 0, 0] };
    const { callbacks, runtime, session } = createHarness({
      session: {
        groundGrassPatches: [
          { cellId: groundCell.id, state: "dead" }
        ]
      },
      callbacks: {
        performGameplayHarvestAction: vi.fn(() => {
          session.groundGrassPatches[0].state = "alive";
          return true;
        })
      }
    });

    expect(runtime.applySquirtleWaterGunImpact({
      approachPosition: [0, 0.04, 0],
      groundCell
    })).toBe(true);

    expect(callbacks.performGameplayHarvestAction).toHaveBeenCalledWith(
      expect.objectContaining({
        canPurifyGround: true,
        forcedHarvestTarget: {
          groundCell,
          distance: 0
        },
        useWaterGun: true
      }),
      {
        actionType: "waterGun",
        groundCell
      }
    );
    expect(callbacks.playInstanceObjectSfx).toHaveBeenCalledTimes(1);
    expect(callbacks.companionAbilityResourcesRuntime.recordSquirtleWaterGunUse)
      .toHaveBeenCalledTimes(1);
  });

  it("plays object SFX when Leafage creates a new patch on the target cell", () => {
    const groundCell = { id: "leafage-ground-a", offset: [2, 0, 0] };
    const { callbacks, runtime, session } = createHarness({
      callbacks: {
        performGameplayHarvestAction: vi.fn(() => {
          session.groundFlowerPatches.push({ cellId: groundCell.id, state: "alive" });
          return true;
        })
      }
    });

    expect(runtime.applyBulbasaurLeafageImpact({
      approachPosition: [0, 0.04, 0],
      groundCell
    })).toBe(true);

    expect(callbacks.performGameplayHarvestAction).toHaveBeenCalledWith(
      expect.objectContaining({
        canUseLeafage: true,
        forcedHarvestTarget: {
          leafageGroundCell: groundCell,
          distance: 0
        }
      }),
      {
        actionType: "leafage",
        groundCell
      }
    );
    expect(callbacks.playInstanceObjectSfx).toHaveBeenCalledTimes(1);
  });

  it("applies Fire impact and keeps inventory, counter prompt, and ground feedback side effects", () => {
    const groundCell = { id: "fire-ground-a", offset: [3, 0, 0] };
    const { callbacks, controls, runtime } = createHarness();

    expect(runtime.applyCharmanderFireImpact({
      approachPosition: [0, 0.04, 0],
      groundCell
    })).toBe(true);

    expect(callbacks.performGameplayHarvestAction).toHaveBeenCalledWith(
      expect.objectContaining({
        canUseFire: true,
        forcedHarvestTarget: {
          fireGroundCell: groundCell,
          distance: 0
        },
        useFire: true
      }),
      {
        actionType: "fire",
        groundCell
      }
    );
    expect(callbacks.hud.syncInventoryUi).toHaveBeenCalledWith(controls.inventory);
    expect(callbacks.supplyCounterPromptController.trigger)
      .toHaveBeenCalledWith("carbon", controls.inventory, 1234);
    expect(callbacks.groundActionFeedbackRuntime.triggerFeedback)
      .toHaveBeenCalledWith(groundCell, "fire", 1234);
  });
});
