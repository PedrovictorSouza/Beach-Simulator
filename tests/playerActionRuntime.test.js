import { describe, expect, it, vi } from "vitest";

import {
  createPlayerActionRuntime,
  createPlayerDirectActionRuntime,
  createPlayerHeldWaterGunActionRuntime,
  createPlayerHarvestActionRuntime,
  createPlayerPrimaryFieldMoveActionRuntime
} from "../app/player/playerActionRuntime.js";

const SOUND_EVENT_IDS = Object.freeze({
  GAMEPLAY_IMPACT: "impact",
  UI_CANCEL: "cancel",
  UI_CONFIRM: "confirm"
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

describe("createPlayerDirectActionRuntime", () => {
  function createDirectRuntime({
    canDestroy = true,
    destroyRequested = true,
    interactRequested = true
  } = {}) {
    const controls = {
      consumeDestroyActionRequest: vi.fn(() => destroyRequested),
      consumeInteractRequest: vi.fn(() => interactRequested)
    };
    const session = {
      playerCharacter: {
        getPosition: vi.fn(() => [1, 0, 2])
      }
    };
    const playerActionContext = {
      getDestroyOptions: vi.fn((playerPosition) => ({ playerPosition, type: "destroy" })),
      getInteractOptions: vi.fn((playerPosition, options) => ({
        ...options,
        playerPosition,
        type: "interact"
      }))
    };
    const playerActionRuntime = {
      performDestroy: vi.fn(),
      performInteract: vi.fn()
    };
    const callbacks = {
      debugInteractionFlow: vi.fn(),
      onNpcInteractionStart: vi.fn(),
      playSoundEvent: vi.fn()
    };
    const runtime = createPlayerDirectActionRuntime({
      controls,
      session,
      playerActionContext,
      playerActionRuntime,
      callbacks,
      soundEventIds: SOUND_EVENT_IDS
    });

    runtime.update({ canProcessGameplayAction: canDestroy });

    return {
      callbacks,
      controls,
      playerActionContext,
      playerActionRuntime,
      session
    };
  }

  it("consumes and performs destroy before interact when gameplay actions are allowed", () => {
    const { callbacks, playerActionContext, playerActionRuntime } = createDirectRuntime();

    expect(callbacks.debugInteractionFlow).toHaveBeenCalledWith(
      "gameLoop.destroyAction.input",
      {
        canProcessDestroyAction: true,
        destroyActionRequested: true,
        playerPosition: [1, 0, 2]
      }
    );
    expect(playerActionContext.getDestroyOptions).toHaveBeenCalledWith([1, 0, 2]);
    expect(playerActionRuntime.performDestroy).toHaveBeenCalledWith({
      playerPosition: [1, 0, 2],
      type: "destroy"
    });
    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("confirm");
    expect(playerActionRuntime.performInteract).toHaveBeenCalledWith({
      onNpcInteractionStart: callbacks.onNpcInteractionStart,
      playerPosition: [1, 0, 2],
      type: "interact"
    });
  });

  it("still consumes requests but skips side effects when gameplay actions are blocked", () => {
    const {
      callbacks,
      controls,
      playerActionRuntime
    } = createDirectRuntime({ canDestroy: false });

    expect(controls.consumeDestroyActionRequest).toHaveBeenCalledTimes(1);
    expect(controls.consumeInteractRequest).toHaveBeenCalledTimes(1);
    expect(callbacks.debugInteractionFlow).toHaveBeenCalledWith(
      "gameLoop.destroyAction.input",
      expect.objectContaining({
        canProcessDestroyAction: false,
        destroyActionRequested: true
      })
    );
    expect(callbacks.playSoundEvent).not.toHaveBeenCalled();
    expect(playerActionRuntime.performDestroy).not.toHaveBeenCalled();
    expect(playerActionRuntime.performInteract).not.toHaveBeenCalled();
  });
});

describe("createPlayerHeldWaterGunActionRuntime", () => {
  function createHeldWaterGunRuntime({
    flowState = {},
    isPrimaryActionActive = true,
    target = { groundCell: { id: "ground-cell" } },
    startActionResult = "unavailable",
    staminaResult = true,
    waterGunEquipped = true
  } = {}) {
    const controls = {
      isPrimaryActionActive: vi.fn(() => isPrimaryActionActive)
    };
    const session = {
      playerCharacter: {
        getPosition: vi.fn(() => [1, 0, 2])
      }
    };
    const gameplay = {
      findNearbyActionTarget: vi.fn(() => target)
    };
    const playerActionTargetContext = {
      getNearbyActionTargetOptions: vi.fn((options) => ({
        ...options,
        normalized: true
      }))
    };
    const waterGunRuntime = {
      startAction: vi.fn(() => startActionResult)
    };
    const companionAbilityResourcesRuntime = {
      consumeSquirtleWaterStaminaForInstantAction: vi.fn(() => staminaResult)
    };
    const callbacks = {
      triggerWaterGunSfxBurst: vi.fn()
    };
    const performHarvestAction = vi.fn();
    const runtime = createPlayerHeldWaterGunActionRuntime({
      controls,
      session,
      gameplay,
      playerActionTargetContext,
      waterGunRuntime,
      companionAbilityResourcesRuntime,
      callbacks
    });

    runtime.update({
      flowState,
      performHarvestAction,
      waterGunEquipped
    });

    return {
      callbacks,
      companionAbilityResourcesRuntime,
      controls,
      gameplay,
      performHarvestAction,
      playerActionTargetContext,
      waterGunRuntime
    };
  }

  it("continues a held Water Gun action against a ground cell target", () => {
    const {
      callbacks,
      gameplay,
      performHarvestAction,
      playerActionTargetContext,
      waterGunRuntime
    } = createHeldWaterGunRuntime();

    expect(playerActionTargetContext.getNearbyActionTargetOptions).toHaveBeenCalledWith({
      playerPosition: [1, 0, 2],
      canPurifyGround: true,
      canUseLeafage: false,
      allowPlacement: false,
      includeIceGroundInstances: false
    });
    expect(gameplay.findNearbyActionTarget).toHaveBeenCalledWith(
      expect.objectContaining({ normalized: true })
    );
    expect(waterGunRuntime.startAction).toHaveBeenCalledWith({
      groundCell: { id: "ground-cell" },
      playerPosition: [1, 0, 2]
    });
    expect(callbacks.triggerWaterGunSfxBurst).toHaveBeenCalledTimes(1);
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: { groundCell: { id: "ground-cell" } },
      useWaterGun: true
    });
  });

  it("uses instant Water Gun stamina for held tree or palm targets", () => {
    const {
      callbacks,
      companionAbilityResourcesRuntime,
      performHarvestAction,
      waterGunRuntime
    } = createHeldWaterGunRuntime({
      target: { leppaTree: { action: "headbutt" } }
    });

    expect(waterGunRuntime.startAction).not.toHaveBeenCalled();
    expect(companionAbilityResourcesRuntime.consumeSquirtleWaterStaminaForInstantAction)
      .toHaveBeenCalledTimes(1);
    expect(callbacks.triggerWaterGunSfxBurst).toHaveBeenCalledTimes(1);
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: { leppaTree: { action: "headbutt" } },
      useWaterGun: true
    });
  });

  it("skips held Water Gun work when flow blockers are active", () => {
    const {
      controls,
      gameplay,
      performHarvestAction,
      waterGunRuntime
    } = createHeldWaterGunRuntime({
      flowState: { dialogueActive: true }
    });

    expect(controls.isPrimaryActionActive).toHaveBeenCalledTimes(1);
    expect(gameplay.findNearbyActionTarget).not.toHaveBeenCalled();
    expect(waterGunRuntime.startAction).not.toHaveBeenCalled();
    expect(performHarvestAction).not.toHaveBeenCalled();
  });
});

describe("createPlayerPrimaryFieldMoveActionRuntime", () => {
  function createPrimaryFieldMoveRuntime({
    buildBlockResult = null,
    companionStaminaResult = true,
    fireResult = "unavailable",
    leafageResult = "unavailable",
    waterGunResult = "unavailable"
  } = {}) {
    const buildBlockRuntime = {
      startAction: vi.fn(() => buildBlockResult)
    };
    const waterGunRuntime = {
      startAction: vi.fn(() => waterGunResult)
    };
    const leafageRuntime = {
      startAction: vi.fn(() => leafageResult)
    };
    const fireRuntime = {
      startAction: vi.fn(() => fireResult)
    };
    const fieldMoveInvalidTargetPromptRuntime = {
      resetFire: vi.fn(),
      resetLeafage: vi.fn()
    };
    const companionAbilityResourcesRuntime = {
      consumeSquirtleWaterStaminaForInstantAction: vi.fn(() => companionStaminaResult)
    };
    const callbacks = {
      getFreeBlockInvalidPlacementNotice: vi.fn((reason) => `Invalid: ${reason}`),
      playSoundEvent: vi.fn(),
      pushNotice: vi.fn(),
      triggerWaterGunSfxBurst: vi.fn()
    };
    const performHarvestAction = vi.fn();
    const runtime = createPlayerPrimaryFieldMoveActionRuntime({
      buildBlockRuntime,
      waterGunRuntime,
      leafageRuntime,
      fireRuntime,
      fieldMoveInvalidTargetPromptRuntime,
      companionAbilityResourcesRuntime,
      callbacks,
      soundEventIds: SOUND_EVENT_IDS,
      notices: {
        buildLocked: "Builder has not learned Build yet.",
        buildUnavailable: "Builder needs to be nearby.",
        missingMaterial: "Need Wood"
      }
    });

    return {
      buildBlockRuntime,
      callbacks,
      companionAbilityResourcesRuntime,
      fieldMoveInvalidTargetPromptRuntime,
      fireRuntime,
      leafageRuntime,
      performHarvestAction,
      runtime,
      waterGunRuntime
    };
  }

  it("routes Build Block invalid feedback through the injected notice builder", () => {
    const {
      buildBlockRuntime,
      callbacks,
      performHarvestAction,
      runtime
    } = createPrimaryFieldMoveRuntime({ buildBlockResult: "invalid" });

    runtime.update({
      buildBlockEquipped: true,
      lastBuildBlockInvalidReason: "blocked",
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionWantsFieldMove: true
    });

    expect(buildBlockRuntime.startAction).toHaveBeenCalledWith({
      playerPosition: [1, 0, 2]
    });
    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("cancel");
    expect(callbacks.getFreeBlockInvalidPlacementNotice).toHaveBeenCalledWith("blocked");
    expect(callbacks.pushNotice).toHaveBeenCalledWith("Invalid: blocked");
    expect(performHarvestAction).not.toHaveBeenCalled();
  });

  it("falls back to harvest when Water Gun is unavailable for a ground target", () => {
    const {
      callbacks,
      performHarvestAction,
      runtime,
      waterGunRuntime
    } = createPrimaryFieldMoveRuntime({ waterGunResult: "unavailable" });
    const primaryActionTarget = { groundCell: { id: "ground-cell" } };

    runtime.update({
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionTarget,
      waterGunEquipped: true
    });

    expect(waterGunRuntime.startAction).toHaveBeenCalledWith({
      groundCell: { id: "ground-cell" },
      playerPosition: [1, 0, 2]
    });
    expect(callbacks.triggerWaterGunSfxBurst).toHaveBeenCalledTimes(1);
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: primaryActionTarget,
      useWaterGun: true
    });
  });

  it("uses instant Water Gun stamina for primary tree targets", () => {
    const {
      callbacks,
      companionAbilityResourcesRuntime,
      performHarvestAction,
      runtime
    } = createPrimaryFieldMoveRuntime({ companionStaminaResult: true });
    const primaryActionTarget = { leppaTree: { action: "water" } };

    runtime.update({
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionIntent: { isWaterGunTreeTarget: true },
      primaryActionTarget
    });

    expect(companionAbilityResourcesRuntime.consumeSquirtleWaterStaminaForInstantAction)
      .toHaveBeenCalledTimes(1);
    expect(callbacks.triggerWaterGunSfxBurst).toHaveBeenCalledTimes(1);
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: primaryActionTarget,
      useWaterGun: true
    });
  });

  it("routes Leafage primary field move fallback", () => {
    const {
      fieldMoveInvalidTargetPromptRuntime,
      leafageRuntime,
      performHarvestAction,
      runtime
    } = createPrimaryFieldMoveRuntime({ leafageResult: "unavailable" });
    const primaryActionTarget = { leafageGroundCell: { id: "leafage-cell" } };

    runtime.update({
      leafageEquipped: true,
      leafagePrimaryMoveRequested: true,
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionTarget
    });

    expect(fieldMoveInvalidTargetPromptRuntime.resetLeafage).toHaveBeenCalledTimes(1);
    expect(leafageRuntime.startAction).toHaveBeenCalledWith({
      groundCell: { id: "leafage-cell" },
      playerPosition: [1, 0, 2]
    });
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: primaryActionTarget,
      useLeafage: true
    });
  });

  it("routes Fire primary field move fallback", () => {
    const {
      fieldMoveInvalidTargetPromptRuntime,
      fireRuntime,
      performHarvestAction,
      runtime
    } = createPrimaryFieldMoveRuntime({ fireResult: "unavailable" });
    const primaryActionTarget = { fireGroundCell: { id: "fire-cell" } };

    runtime.update({
      fireEquipped: true,
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionTarget
    });

    expect(fieldMoveInvalidTargetPromptRuntime.resetFire).toHaveBeenCalledTimes(1);
    expect(fireRuntime.startAction).toHaveBeenCalledWith({
      groundCell: { id: "fire-cell" },
      playerPosition: [1, 0, 2]
    });
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: primaryActionTarget,
      useFire: true
    });
  });
});
