import { describe, expect, it, vi } from "vitest";

import { createPlayerActionRuntime } from "../app/player/playerActionRuntime.js";

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
