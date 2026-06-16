import { describe, expect, it, vi } from "vitest";

import {
  createPlayerActionRuntime,
  createPlayerDirectActionRuntime,
  createPlayerHeldWaterGunActionRuntime,
  createPlayerHarvestActionRuntime,
  createPlayerPrimaryActionRuntime,
  createPlayerPrimaryActionFallbackRuntime,
  createPlayerPrimaryActionFrameRuntime,
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

describe("createPlayerPrimaryActionFallbackRuntime", () => {
  function createPrimaryActionFallbackRuntime() {
    const groundActionFeedbackRuntime = {
      triggerInvalid: vi.fn()
    };
    const fieldMoveInvalidTargetPromptRuntime = {
      triggerFire: vi.fn(),
      triggerLeafage: vi.fn()
    };
    const callbacks = {
      playSoundEvent: vi.fn()
    };
    const performHarvestAction = vi.fn();
    const runtime = createPlayerPrimaryActionFallbackRuntime({
      groundActionFeedbackRuntime,
      fieldMoveInvalidTargetPromptRuntime,
      callbacks,
      soundEventIds: SOUND_EVENT_IDS
    });

    return {
      callbacks,
      fieldMoveInvalidTargetPromptRuntime,
      groundActionFeedbackRuntime,
      performHarvestAction,
      runtime
    };
  }

  it("routes repeated field move feedback and consumes the branch", () => {
    const {
      callbacks,
      groundActionFeedbackRuntime,
      runtime
    } = createPrimaryActionFallbackRuntime();
    const groundCell = { id: "already-restored" };

    expect(runtime.tryBlockedFeedback({
      alreadyResolvedGroundCell: groundCell,
      now: 1200,
      repeatedFieldMove: true
    })).toBe(true);

    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("cancel");
    expect(groundActionFeedbackRuntime.triggerInvalid).toHaveBeenCalledWith(groundCell, 1200);
  });

  it("routes invalid Leafage and Fire prompts through injected runtimes", () => {
    const {
      callbacks,
      fieldMoveInvalidTargetPromptRuntime,
      runtime
    } = createPrimaryActionFallbackRuntime();

    expect(runtime.tryBlockedFeedback({
      invalidLeafageUse: true,
      now: 1400
    })).toBe(true);

    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("cancel");
    expect(fieldMoveInvalidTargetPromptRuntime.triggerLeafage).toHaveBeenCalledWith(1400);

    callbacks.playSoundEvent.mockClear();

    expect(runtime.tryBlockedFeedback({
      invalidFireUse: true,
      now: 1500
    })).toBe(true);

    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("cancel");
    expect(fieldMoveInvalidTargetPromptRuntime.triggerFire).toHaveBeenCalledWith(1500);
  });

  it("plays cancel for blocked placement without triggering field prompts", () => {
    const {
      callbacks,
      fieldMoveInvalidTargetPromptRuntime,
      groundActionFeedbackRuntime,
      runtime
    } = createPrimaryActionFallbackRuntime();

    expect(runtime.tryBlockedFeedback({
      placementBlocked: true,
      now: 1600
    })).toBe(true);

    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("cancel");
    expect(fieldMoveInvalidTargetPromptRuntime.triggerLeafage).not.toHaveBeenCalled();
    expect(fieldMoveInvalidTargetPromptRuntime.triggerFire).not.toHaveBeenCalled();
    expect(groundActionFeedbackRuntime.triggerInvalid).not.toHaveBeenCalled();
  });

  it("routes placement and bag harvest fallbacks", () => {
    const {
      performHarvestAction,
      runtime
    } = createPrimaryActionFallbackRuntime();
    const primaryActionTarget = { shrub: { id: "bag-target" } };

    expect(runtime.tryPlacementOrBagHarvest({
      isPlacement: true,
      performHarvestAction,
      playerPosition: [1, 0, 2]
    })).toBe(true);

    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      allowLeafage: false
    });

    performHarvestAction.mockClear();

    expect(runtime.tryPlacementOrBagHarvest({
      isBagHarvest: true,
      performHarvestAction,
      playerPosition: [3, 0, 4],
      primaryActionTarget
    })).toBe(true);

    expect(performHarvestAction).toHaveBeenCalledWith([3, 0, 4], {
      allowLeafage: false,
      allowFire: false,
      allowPlacement: false,
      forcedHarvestTarget: primaryActionTarget
    });
  });

  it("routes default harvest fallback only when dialogue and field moves allow it", () => {
    const {
      performHarvestAction,
      runtime
    } = createPrimaryActionFallbackRuntime();

    expect(runtime.tryDefaultHarvestFallback({
      dialogueActive: false,
      gamepadPrimaryMoveRequested: true,
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionWantsFieldMove: false
    })).toBe(true);

    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      allowLeafage: false,
      allowFire: false,
      allowPlacement: false
    });

    performHarvestAction.mockClear();

    expect(runtime.tryDefaultHarvestFallback({
      dialogueActive: true,
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionWantsFieldMove: false
    })).toBe(false);
    expect(runtime.tryDefaultHarvestFallback({
      dialogueActive: false,
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionWantsFieldMove: true
    })).toBe(false);
    expect(performHarvestAction).not.toHaveBeenCalled();
  });
});

describe("createPlayerPrimaryActionFrameRuntime", () => {
  function createPrimaryActionFrameRuntime({
    harvestRequest = { source: "gamepadPrimary" },
    primaryActionTarget = { groundCell: { id: "water-cell" } },
    primaryInteractTarget = null,
    selectedRotationTarget = null
  } = {}) {
    const controls = {
      consumeHarvestRequest: vi.fn(() => harvestRequest),
      playerSkills: {
        leafage: true,
        waterGun: true
      }
    };
    const session = {
      playerCharacter: {
        getPosition: vi.fn(() => [1, 0, 2])
      },
      groundDeadInstances: [],
      groundFlowerPatches: [],
      groundGrassPatches: [],
      groundPurifiedInstances: []
    };
    const gameplay = {
      findNearbyActionTarget: vi.fn(() => primaryActionTarget),
      findNearbyInteractable: vi.fn(() => primaryInteractTarget)
    };
    const playerActionTargetContext = {
      getBagDestroyTargetArgs: vi.fn((playerPosition) => [playerPosition, [], {}, [], {}]),
      getNearbyActionTargetOptions: vi.fn((options) => options),
      getNearbyInteractableArgs: vi.fn((playerPosition) => [playerPosition])
    };
    const workbenchRotationRuntime = {
      getNearestTarget: vi.fn(() => ({ id: "rotation-target" })),
      getSelectedTargetFromSources: vi.fn(() => selectedRotationTarget)
    };
    const playerPrimaryActionRuntime = {
      update: vi.fn()
    };
    const groundActionFeedbackRuntime = {
      isPulseSource: vi.fn(() => true),
      triggerPulse: vi.fn()
    };
    const callbacks = {
      findAlreadyResolvedFieldMoveGroundCell: vi.fn(() => null),
      findNearbyDestroyableInstantiatedObject: vi.fn(() => null),
      markWaterGunFirstUsePrompt: vi.fn(),
      playSoundEvent: vi.fn()
    };
    const performHarvestAction = vi.fn();
    const runtime = createPlayerPrimaryActionFrameRuntime({
      controls,
      session,
      gameplay,
      playerActionTargetContext,
      workbenchRotationRuntime,
      playerPrimaryActionRuntime,
      groundActionFeedbackRuntime,
      callbacks,
      soundEventIds: SOUND_EVENT_IDS
    });

    return {
      callbacks,
      controls,
      gameplay,
      groundActionFeedbackRuntime,
      performHarvestAction,
      playerActionTargetContext,
      playerPrimaryActionRuntime,
      runtime,
      session,
      workbenchRotationRuntime
    };
  }

  it("builds primary action context and delegates frame side effects", () => {
    const {
      callbacks,
      gameplay,
      groundActionFeedbackRuntime,
      performHarvestAction,
      playerPrimaryActionRuntime,
      runtime
    } = createPrimaryActionFrameRuntime();

    expect(runtime.update({
      activeMoveId: "waterGun",
      buildBlockEquipped: false,
      dialogueActive: false,
      fireEquipped: false,
      leafageEquipped: false,
      now: 1200,
      performHarvestAction,
      waterGunEquipped: true
    })).toEqual(expect.objectContaining({
      gamepadPrimaryMoveRequested: true,
      handled: true,
      harvestRequestSource: "gamepadPrimary",
      harvestRequested: true,
      leafagePrimaryMoveRequested: true
    }));

    expect(callbacks.playSoundEvent).toHaveBeenCalledWith("confirm");
    expect(gameplay.findNearbyActionTarget).toHaveBeenCalledWith(expect.objectContaining({
      allowPlacement: false,
      canPurifyGround: true,
      canUseFire: false,
      canUseLeafage: false,
      playerPosition: [1, 0, 2]
    }));
    expect(groundActionFeedbackRuntime.triggerPulse).toHaveBeenCalledWith("waterGun", 1200);
    expect(callbacks.markWaterGunFirstUsePrompt).toHaveBeenCalledTimes(1);
    expect(playerPrimaryActionRuntime.update).toHaveBeenCalledWith(expect.objectContaining({
      gamepadPrimaryMoveRequested: true,
      leafagePrimaryMoveRequested: true,
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionIsMove: true,
      primaryActionWantsFieldMove: true,
      waterGunEquipped: true
    }));
  });

  it("consumes harvest request but skips action side effects while blocked", () => {
    const {
      callbacks,
      gameplay,
      playerPrimaryActionRuntime,
      runtime
    } = createPrimaryActionFrameRuntime();

    expect(runtime.update({
      cinematicActive: true,
      now: 1200,
      performHarvestAction: vi.fn(),
      waterGunEquipped: true
    })).toEqual(expect.objectContaining({
      blocked: true,
      handled: false,
      harvestRequested: true
    }));

    expect(callbacks.playSoundEvent).not.toHaveBeenCalled();
    expect(gameplay.findNearbyActionTarget).not.toHaveBeenCalled();
    expect(playerPrimaryActionRuntime.update).not.toHaveBeenCalled();
  });

  it("finds interact and rotation candidates before delegating", () => {
    const {
      gameplay,
      playerPrimaryActionRuntime,
      runtime,
      workbenchRotationRuntime
    } = createPrimaryActionFrameRuntime({
      harvestRequest: { source: "keyboardPrimary" },
      primaryActionTarget: null,
      primaryInteractTarget: { target: { id: "npc" } }
    });

    runtime.update({
      activeMoveId: null,
      dialogueActive: false,
      now: 1200,
      performHarvestAction: vi.fn()
    });

    expect(gameplay.findNearbyInteractable).toHaveBeenCalledWith([1, 0, 2]);
    expect(workbenchRotationRuntime.getSelectedTargetFromSources).toHaveBeenCalledTimes(1);
    expect(workbenchRotationRuntime.getNearestTarget).toHaveBeenCalledTimes(1);
    expect(playerPrimaryActionRuntime.update).toHaveBeenCalledWith(expect.objectContaining({
      primaryActionConfirmsRotation: false,
      primaryActionRotationTarget: { id: "rotation-target" },
      primaryInteractTarget: { target: { id: "npc" } }
    }));
  });
});

describe("createPlayerPrimaryActionRuntime", () => {
  function createPrimaryActionRuntime({
    autoTargetHandled = false,
    blockedFeedbackHandled = false,
    placementOrBagHandled = false,
    defaultHarvestHandled = false
  } = {}) {
    const workbenchRotationRuntime = {
      confirmSelectedTargetWithFeedback: vi.fn(),
      selectTargetWithFeedback: vi.fn()
    };
    const playerActionRuntime = {
      performDestroy: vi.fn(),
      performInteract: vi.fn()
    };
    const playerActionContext = {
      getDestroyOptions: vi.fn((playerPosition) => ({ destroyAt: playerPosition })),
      getInteractOptions: vi.fn((playerPosition, options) => ({
        interactAt: playerPosition,
        ...options
      }))
    };
    const playerPrimaryActionFallbackRuntime = {
      tryBlockedFeedback: vi.fn(() => blockedFeedbackHandled),
      tryDefaultHarvestFallback: vi.fn(() => defaultHarvestHandled),
      tryPlacementOrBagHarvest: vi.fn(() => placementOrBagHandled)
    };
    const playerPrimaryFieldMoveActionRuntime = {
      tryAutoTargetAction: vi.fn(() => autoTargetHandled),
      update: vi.fn()
    };
    const callbacks = {
      isBusyCompanionTarget: vi.fn(() => false),
      onNpcInteractionStart: vi.fn(),
      pushNotice: vi.fn()
    };
    const runtime = createPlayerPrimaryActionRuntime({
      workbenchRotationRuntime,
      playerActionRuntime,
      playerActionContext,
      playerPrimaryActionFallbackRuntime,
      playerPrimaryFieldMoveActionRuntime,
      callbacks,
      notices: {
        leafDenBusy: "Leaf den busy"
      }
    });

    return {
      callbacks,
      playerActionContext,
      playerActionRuntime,
      playerPrimaryActionFallbackRuntime,
      playerPrimaryFieldMoveActionRuntime,
      runtime,
      workbenchRotationRuntime
    };
  }

  it("keeps rotation confirmation before destroy and other fallbacks", () => {
    const {
      playerActionRuntime,
      playerPrimaryActionFallbackRuntime,
      runtime,
      workbenchRotationRuntime
    } = createPrimaryActionRuntime();

    runtime.update({
      playerPosition: [1, 0, 2],
      primaryActionBagDestroyTarget: { target: { id: "rock" } },
      primaryActionConfirmsRotation: true
    });

    expect(workbenchRotationRuntime.confirmSelectedTargetWithFeedback).toHaveBeenCalledTimes(1);
    expect(playerActionRuntime.performDestroy).not.toHaveBeenCalled();
    expect(playerPrimaryActionFallbackRuntime.tryBlockedFeedback).not.toHaveBeenCalled();
  });

  it("delegates auto field-move targets before blocked feedback", () => {
    const {
      playerPrimaryActionFallbackRuntime,
      playerPrimaryFieldMoveActionRuntime,
      runtime
    } = createPrimaryActionRuntime({ autoTargetHandled: true });
    const performHarvestAction = vi.fn();

    runtime.update({
      leafageAutoWaterGunTarget: { groundCell: { id: "auto-water" } },
      performHarvestAction,
      playerPosition: [1, 0, 2],
      primaryActionRepeatedFieldMove: true
    });

    expect(playerPrimaryFieldMoveActionRuntime.tryAutoTargetAction).toHaveBeenCalledWith({
      leafageAutoWaterGunTarget: { groundCell: { id: "auto-water" } },
      leafageAutoGrowTarget: null,
      performHarvestAction,
      playerPosition: [1, 0, 2]
    });
    expect(playerPrimaryActionFallbackRuntime.tryBlockedFeedback).not.toHaveBeenCalled();
  });

  it("delegates primary field moves before busy companion or interact handling", () => {
    const {
      callbacks,
      playerActionRuntime,
      playerPrimaryFieldMoveActionRuntime,
      runtime
    } = createPrimaryActionRuntime();

    runtime.update({
      dialogueActive: false,
      fireEquipped: true,
      performHarvestAction: vi.fn(),
      playerPosition: [1, 0, 2],
      primaryActionIntent: { isFireGroundTarget: true },
      primaryActionIsMove: true,
      primaryActionTarget: { fireGroundCell: { id: "fire-cell" } },
      primaryActionWantsFieldMove: true,
      primaryInteractTarget: { target: { id: "leaf-den" } }
    });

    expect(playerPrimaryFieldMoveActionRuntime.update).toHaveBeenCalledWith(expect.objectContaining({
      fireEquipped: true,
      playerPosition: [1, 0, 2],
      primaryActionWantsFieldMove: true
    }));
    expect(callbacks.pushNotice).not.toHaveBeenCalled();
    expect(playerActionRuntime.performInteract).not.toHaveBeenCalled();
  });

  it("routes busy companion notices before interact and default harvest", () => {
    const {
      callbacks,
      playerActionRuntime,
      playerPrimaryActionFallbackRuntime,
      runtime
    } = createPrimaryActionRuntime();
    callbacks.isBusyCompanionTarget.mockReturnValue(true);

    runtime.update({
      performHarvestAction: vi.fn(),
      playerPosition: [1, 0, 2],
      primaryInteractTarget: { target: { id: "busy-leaf-den" } }
    });

    expect(callbacks.pushNotice).toHaveBeenCalledWith("Leaf den busy");
    expect(playerActionRuntime.performInteract).not.toHaveBeenCalled();
    expect(playerPrimaryActionFallbackRuntime.tryDefaultHarvestFallback).not.toHaveBeenCalled();
  });

  it("routes interact before default harvest fallback", () => {
    const {
      callbacks,
      playerActionContext,
      playerActionRuntime,
      playerPrimaryActionFallbackRuntime,
      runtime
    } = createPrimaryActionRuntime({ defaultHarvestHandled: true });

    runtime.update({
      performHarvestAction: vi.fn(),
      playerPosition: [1, 0, 2],
      primaryInteractTarget: { target: { id: "npc" } }
    });

    expect(playerActionContext.getInteractOptions).toHaveBeenCalledWith([1, 0, 2], {
      onNpcInteractionStart: callbacks.onNpcInteractionStart
    });
    expect(playerActionRuntime.performInteract).toHaveBeenCalledWith({
      interactAt: [1, 0, 2],
      onNpcInteractionStart: callbacks.onNpcInteractionStart
    });
    expect(playerPrimaryActionFallbackRuntime.tryDefaultHarvestFallback).not.toHaveBeenCalled();
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
      markWaterGunFirstUsePrompt: vi.fn(),
      playSoundEvent: vi.fn(),
      pushNotice: vi.fn(),
      setActiveMoveId: vi.fn(),
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

  it("handles Leafage auto Water Gun target before the invalid-target branch", () => {
    const {
      callbacks,
      fieldMoveInvalidTargetPromptRuntime,
      performHarvestAction,
      runtime,
      waterGunRuntime
    } = createPrimaryFieldMoveRuntime({ waterGunResult: "unavailable" });
    const leafageAutoWaterGunTarget = { groundCell: { id: "auto-water-cell" } };

    expect(runtime.tryAutoTargetAction({
      leafageAutoWaterGunTarget,
      performHarvestAction,
      playerPosition: [1, 0, 2]
    })).toBe(true);

    expect(fieldMoveInvalidTargetPromptRuntime.resetLeafage).toHaveBeenCalledTimes(1);
    expect(callbacks.setActiveMoveId).toHaveBeenCalledWith("waterGun");
    expect(callbacks.markWaterGunFirstUsePrompt).toHaveBeenCalledTimes(1);
    expect(waterGunRuntime.startAction).toHaveBeenCalledWith({
      groundCell: { id: "auto-water-cell" },
      playerPosition: [1, 0, 2]
    });
    expect(callbacks.triggerWaterGunSfxBurst).toHaveBeenCalledTimes(1);
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: leafageAutoWaterGunTarget,
      useWaterGun: true
    });
  });

  it("handles Leafage auto grow target after auto Water Gun is absent", () => {
    const {
      callbacks,
      fieldMoveInvalidTargetPromptRuntime,
      leafageRuntime,
      performHarvestAction,
      runtime,
      waterGunRuntime
    } = createPrimaryFieldMoveRuntime({ leafageResult: "unavailable" });
    const leafageAutoGrowTarget = { leafageGroundCell: { id: "auto-grow-cell" } };

    expect(runtime.tryAutoTargetAction({
      leafageAutoGrowTarget,
      performHarvestAction,
      playerPosition: [1, 0, 2]
    })).toBe(true);

    expect(waterGunRuntime.startAction).not.toHaveBeenCalled();
    expect(fieldMoveInvalidTargetPromptRuntime.resetLeafage).toHaveBeenCalledTimes(1);
    expect(callbacks.setActiveMoveId).toHaveBeenCalledWith("leafage");
    expect(callbacks.markWaterGunFirstUsePrompt).not.toHaveBeenCalled();
    expect(leafageRuntime.startAction).toHaveBeenCalledWith({
      groundCell: { id: "auto-grow-cell" },
      playerPosition: [1, 0, 2]
    });
    expect(performHarvestAction).toHaveBeenCalledWith([1, 0, 2], {
      forcedHarvestTarget: leafageAutoGrowTarget,
      useLeafage: true
    });
  });

  it("returns false when no auto field-move target is available", () => {
    const {
      fieldMoveInvalidTargetPromptRuntime,
      performHarvestAction,
      runtime
    } = createPrimaryFieldMoveRuntime();

    expect(runtime.tryAutoTargetAction({
      performHarvestAction,
      playerPosition: [1, 0, 2]
    })).toBe(false);

    expect(fieldMoveInvalidTargetPromptRuntime.resetLeafage).not.toHaveBeenCalled();
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
