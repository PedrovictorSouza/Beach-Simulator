import { describe, expect, it, vi } from "vitest";

import {
  createPlayerActionRuntimeBundle,
  createPlayerGameplayActionRuntimeBundle
} from "../app/player/playerActionRuntimeBundle.js";

function createHarness() {
  const controls = {
    inventory: {},
    playerSkills: {
      waterGun: true
    },
    storyState: {
      flags: {}
    },
    getActiveMoveId: vi.fn(() => "waterGun")
  };
  const session = {
    playerCharacter: {
      getPosition: vi.fn(() => [0, 0.04, 0])
    }
  };
  const gameplay = {
    performHarvestAction: vi.fn(() => true)
  };
  const callbacks = {
    debugInteractionFlow: vi.fn(),
    findAlreadyResolvedFieldMoveGroundCell: vi.fn(),
    findNearbyDestroyableInstantiatedObject: vi.fn(),
    getFreeBlockInvalidPlacementNotice: vi.fn(() => "Invalid placement"),
    getNowMs: vi.fn(() => 1000),
    markWaterGunFirstUsePrompt: vi.fn(),
    onNpcInteractionStart: vi.fn(),
    playSoundEvent: vi.fn(),
    playTreeBirthSfx: vi.fn(),
    pushNotice: vi.fn(),
    queueChangedSupplyPickupFlyItems: vi.fn(),
    queueLandscapeCutEffect: vi.fn(),
    queueTreeRevivalLeafBurst: vi.fn(),
    resolveGameplayActionPermission: vi.fn(() => true),
    setActiveMoveId: vi.fn(),
    triggerWaterGunSfxBurst: vi.fn()
  };
  const runtimes = {
    buildBlockRuntime: {},
    bulbasaurWorkbenchGuideRuntime: {
      isActive: vi.fn(() => false)
    },
    companionAbilityResourcesRuntime: {
      recordSquirtleWaterGunUse: vi.fn()
    },
    constructionPlacementControlRuntime: {
      isBuildBlockFieldMoveEquipped: vi.fn(() => false)
    },
    fieldMoveInvalidTargetPromptRuntime: {},
    fireRuntime: {},
    freeBlockBuildRuntime: {},
    groundActionFeedbackRuntime: {},
    leafageRuntime: {},
    playerCounterPromptRuntime: {},
    supplyCounterPromptController: {
      snapshot: vi.fn(() => ({})),
      triggerChanged: vi.fn()
    },
    waterGunRuntime: {},
    workbenchRotationRuntime: {}
  };

  return {
    bundle: createPlayerActionRuntimeBundle({
      controls,
      session,
      gameplay,
      runtimes,
      callbacks,
      soundEventIds: {
        UI_CANCEL: "ui.cancel",
        UI_CONFIRM: "ui.confirm"
      },
      notices: {
        buildLocked: "Build locked",
        buildUnavailable: "Build unavailable",
        leafDenBusy: "Leaf den busy",
        missingMaterial: "Need Wood",
        noRemovablePatch: "No removable patch here."
      },
      config: {
        restoredGrassMissionTargetCount: 10,
        treeRevivalTargetCount: 5
      }
    }),
    callbacks,
    controls,
    gameplay,
    runtimes,
    session
  };
}

describe("createPlayerActionRuntimeBundle", () => {
  it("creates the player action runtime graph with the existing public runtimes", () => {
    const { bundle, controls, gameplay } = createHarness();

    expect(bundle.playerActionRuntime.performHarvest({})).toBe(true);
    expect(gameplay.performHarvestAction).toHaveBeenCalled();
    expect(bundle.playerActionFrameRuntime.getActionState()).toEqual({
      activeMoveId: "waterGun",
      buildBlockEquipped: false,
      fireEquipped: false,
      leafageEquipped: false,
      waterGunEquipped: true
    });
    expect(controls.getActiveMoveId).toHaveBeenCalled();
  });

  it("creates the game-loop player action boundary with HUD and sound adapters", () => {
    const notices = [];
    const soundEvents = [];
    const controls = {
      inventory: {},
      playerSkills: {},
      storyState: {
        flags: {}
      },
      getActiveMoveId: vi.fn(() => null)
    };
    const session = {
      playerCharacter: {
        getPosition: vi.fn(() => [0, 0.04, 0])
      }
    };
    const gameplay = {
      performHarvestAction: vi.fn(() => true),
      performInteractAction: vi.fn(() => false)
    };
    const runtime = createPlayerGameplayActionRuntimeBundle({
      controls,
      session,
      gameplay,
      hud: {
        pushNotice: (notice) => notices.push(notice)
      },
      runtimes: {
        buildBlockRuntime: {},
        bulbasaurWorkbenchGuideRuntime: {},
        companionAbilityResourcesRuntime: {},
        constructionPlacementControlRuntime: {},
        fieldMoveInvalidTargetPromptRuntime: {},
        fireRuntime: {},
        freeBlockBuildRuntime: {
          tryRemoveNearby: vi.fn(() => false)
        },
        groundActionFeedbackRuntime: {},
        leafageRuntime: {},
        playerCounterPromptRuntime: {},
        supplyCounterPromptController: {},
        waterGunRuntime: {},
        waterGunSfxBurstRuntime: {},
        workbenchRotationRuntime: {}
      },
      callbacks: {
        findNearbyDestroyableInstantiatedObject: vi.fn(),
        getNowMs: vi.fn(() => 1000),
        getNowSeconds: vi.fn(() => 1),
        playSoundEvent: (soundEventId) => soundEvents.push(soundEventId),
        resolveGameplayActionPermission: vi.fn(() => true)
      },
      soundEventIds: {
        UI_CANCEL: "ui.cancel"
      },
      botNames: {
        builder: "Builder Bot"
      },
      config: {
        waterGunFirstUsePromptFlag: "waterGunFirstUsePromptDismissed",
        restoredGrassMissionTargetCount: 10,
        waterGunSprayDuration: 0.4,
        leafDenBusyNotice: "im busy, boss..."
      }
    });

    expect(runtime.playerActionRuntime.performDestroy({
      playerPosition: [0, 0.04, 0],
      storyState: controls.storyState
    })).toBe(false);

    expect(soundEvents).toEqual(["ui.cancel"]);
    expect(notices).toEqual([
      "No removable patch here. Move closer to planted grass or flowers."
    ]);
  });
});
