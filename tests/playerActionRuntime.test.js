import { describe, expect, it, vi } from "vitest";

import {
  createPlayerActionRuntime,
  createPlayerHarvestActionRuntime
} from "../app/player/playerActionRuntime.js";

const SOUND_EVENT_IDS = Object.freeze({
  GAMEPLAY_IMPACT: "impact",
  UI_CANCEL: "cancel"
});

function createRuntime({
  sessionOverrides = {},
  gameplayOverrides = {},
  freeBlockRemoveResult = false,
  findNearbyTarget = null
} = {}) {
  const session = {
    groundGrassPatches: [
      {
        id: "grass-1",
        cellId: "cell-1",
        state: "alive",
        position: [1, 0, 2]
      }
    ],
    groundFlowerPatches: [],
    ...sessionOverrides
  };
  const controls = {
    storyState: {
      flags: {}
    },
    onGardenProgressChanged: vi.fn()
  };
  const gameplay = {
    performHarvestAction: vi.fn(() => {
      session.groundGrassPatches = [];
      return true;
    }),
    performInteractAction: vi.fn(() => {
      session.groundGrassPatches = [];
      return true;
    }),
    ...gameplayOverrides
  };
  const freeBlockBuildRuntime = {
    tryRemoveNearby: vi.fn(() => freeBlockRemoveResult)
  };
  const callbacks = {
    debugInteractionFlow: vi.fn(),
    findNearbyDestroyableInstantiatedObject: vi.fn(() => findNearbyTarget),
    getNowMs: vi.fn(() => 123),
    playSoundEvent: vi.fn(),
    pushNotice: vi.fn(),
    queueLandscapeCutEffect: vi.fn(),
    queueTreeRevivalLeafBurst: vi.fn()
  };
  const runtime = createPlayerActionRuntime({
    session,
    controls,
    gameplay,
    freeBlockBuildRuntime,
    callbacks,
    soundEventIds: SOUND_EVENT_IDS,
    notices: {
      noRemovablePatch: "No removable patch here. Move closer to planted grass or flowers."
    }
  });

  return {
    callbacks,
    controls,
    freeBlockBuildRuntime,
    gameplay,
    runtime,
    session
  };
}

describe("createPlayerActionRuntime", () => {
  it("queues tree revival and garden progress side effects for harvest actions", () => {
    const { callbacks, controls, gameplay, runtime } = createRuntime();

    expect(runtime.performHarvest({
      forcedHarvestTarget: {
        groundCell: { id: "cell-1" }
      }
    }, {
      actionType: "waterGun"
    })).toBe(true);

    expect(gameplay.performHarvestAction).toHaveBeenCalledTimes(1);
    expect(callbacks.queueTreeRevivalLeafBurst).toHaveBeenCalledTimes(1);
    expect(controls.onGardenProgressChanged).toHaveBeenCalledWith({
      actionType: "waterGun",
      groundCellId: "cell-1"
    });
  });

  it("queues landscape cut effects when interact destroys a landscape patch", () => {
    const { callbacks, controls, runtime, session } = createRuntime({
      findNearbyTarget: {
        target: {
          action: "destroyInstantiatedObject",
          id: "grass-1"
        }
      }
    });

    expect(runtime.performInteract({
      playerPosition: [1, 0, 2],
      groundGrassPatches: session.groundGrassPatches,
      groundFlowerPatches: session.groundFlowerPatches,
      storyState: controls.storyState
    })).toBe(true);

    expect(callbacks.queueLandscapeCutEffect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "grass-1",
        position: [1, 0, 2]
      })
    );
    expect(controls.onGardenProgressChanged).toHaveBeenCalledWith({
      actionType: "destroyLandscape",
      groundCellId: "cell-1"
    });
  });

  it("lets Free Block removal handle destroy actions first", () => {
    const { callbacks, freeBlockBuildRuntime, gameplay, runtime } = createRuntime({
      freeBlockRemoveResult: true
    });

    expect(runtime.performDestroy({ playerPosition: [2, 0, 3] })).toBe(true);

    expect(freeBlockBuildRuntime.tryRemoveNearby).toHaveBeenCalledWith([2, 0, 3], 123);
    expect(gameplay.performInteractAction).not.toHaveBeenCalled();
    expect(callbacks.playSoundEvent).not.toHaveBeenCalled();
  });

  it("plays cancel feedback when destroy has no removable landscape patch", () => {
    const { callbacks, runtime } = createRuntime({
      freeBlockRemoveResult: false,
      findNearbyTarget: null
    });

    expect(runtime.performDestroy({ playerPosition: [4, 0, 5] })).toBe(false);

    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("cancel");
    expect(callbacks.pushNotice).toHaveBeenCalledWith(
      "No removable patch here. Move closer to planted grass or flowers."
    );
  });
});

function createHarvestRuntime({
  performHarvest = () => true
} = {}) {
  const controls = {
    inventory: { wood: 1 },
    storyState: {
      flags: {
        restoredGrassCount: 0,
        wateredTreeCount: 0
      }
    }
  };
  const playerActionContext = {
    getHarvestOptions: vi.fn(({ playerPosition, options }) => ({
      forcedHarvestTarget: options.forcedHarvestTarget || null,
      playerPosition,
      useFire: Boolean(options.useFire),
      useWaterGun: Boolean(options.useWaterGun)
    }))
  };
  const playerActionRuntime = {
    performHarvest: vi.fn((options, autosaveContext) => performHarvest({
      autosaveContext,
      controls,
      options
    }))
  };
  const playerCounterPromptRuntime = {
    triggerQuestCounter: vi.fn()
  };
  const supplyCounterPromptController = {
    snapshot: vi.fn((inventory) => ({ wood: inventory.wood || 0 })),
    triggerChanged: vi.fn()
  };
  const companionAbilityResourcesRuntime = {
    recordSquirtleWaterGunUse: vi.fn()
  };
  const groundActionFeedbackRuntime = {
    triggerFeedback: vi.fn()
  };
  const callbacks = {
    playTreeBirthSfx: vi.fn(),
    queueChangedSupplyPickupFlyItems: vi.fn()
  };
  const runtime = createPlayerHarvestActionRuntime({
    controls,
    playerActionContext,
    playerActionRuntime,
    playerCounterPromptRuntime,
    supplyCounterPromptController,
    companionAbilityResourcesRuntime,
    groundActionFeedbackRuntime,
    callbacks,
    config: {
      restoredGrassMissionTargetCount: 25,
      treeRevivalTargetCount: 5
    }
  });

  return {
    callbacks,
    companionAbilityResourcesRuntime,
    controls,
    groundActionFeedbackRuntime,
    playerActionContext,
    playerActionRuntime,
    playerCounterPromptRuntime,
    runtime,
    supplyCounterPromptController
  };
}

describe("createPlayerHarvestActionRuntime", () => {
  it("triggers restored grass counter and water stamina bookkeeping", () => {
    const {
      companionAbilityResourcesRuntime,
      controls,
      playerActionRuntime,
      playerCounterPromptRuntime,
      runtime
    } = createHarvestRuntime({
      performHarvest: ({ controls: runtimeControls }) => {
        runtimeControls.storyState.flags.restoredGrassCount = 1;
        return true;
      }
    });

    expect(runtime.perform({
      playerPosition: [1, 0, 2],
      options: { useWaterGun: true },
      now: 123,
      waterGunEquipped: true
    })).toBe(true);

    expect(playerActionRuntime.performHarvest).toHaveBeenCalledWith(
      expect.objectContaining({
        playerPosition: [1, 0, 2],
        useWaterGun: true
      }),
      { actionType: "waterGun" }
    );
    expect(playerCounterPromptRuntime.triggerQuestCounter).toHaveBeenCalledWith({
      count: 1,
      total: 25,
      label: "dry grass",
      now: 123
    });
    expect(companionAbilityResourcesRuntime.recordSquirtleWaterGunUse).toHaveBeenCalledTimes(1);
    expect(controls.storyState.flags.restoredGrassCount).toBe(1);
  });

  it("triggers changed supply feedback for normal harvest results", () => {
    const {
      callbacks,
      controls,
      runtime,
      supplyCounterPromptController
    } = createHarvestRuntime({
      performHarvest: ({ controls: runtimeControls }) => {
        runtimeControls.inventory.wood = 2;
        return true;
      }
    });

    expect(runtime.perform({
      playerPosition: [1, 0, 2],
      now: 456
    })).toBe(true);

    expect(callbacks.queueChangedSupplyPickupFlyItems).toHaveBeenCalledWith(
      { wood: 1 },
      controls.inventory
    );
    expect(supplyCounterPromptController.triggerChanged).toHaveBeenCalledWith(
      { wood: 1 },
      controls.inventory,
      456
    );
  });

  it("triggers fire ground feedback for fire harvest results", () => {
    const { groundActionFeedbackRuntime, runtime } = createHarvestRuntime();
    const fireGroundCell = { id: "fire-cell" };

    expect(runtime.perform({
      playerPosition: [1, 0, 2],
      options: {
        forcedHarvestTarget: { fireGroundCell },
        useFire: true
      },
      now: 789,
      fireEquipped: true
    })).toBe(true);

    expect(groundActionFeedbackRuntime.triggerFeedback).toHaveBeenCalledWith(
      fireGroundCell,
      "fire",
      789
    );
  });
});
