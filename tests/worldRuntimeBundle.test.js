import { describe, expect, it, vi } from "vitest";

import {
  createWorldRuntimeBundle
} from "../app/runtime/world/worldRuntimeBundle.js";

function createHarness() {
  const controls = {
    storyState: {
      flags: {
        pendingRustlingGrassCellId: "ground-1-2",
        rustlingGrassDelay: 0
      }
    }
  };
  const session = {
    interactables: [
      { id: "workbench" }
    ],
    playerCharacter: {
      getPosition: vi.fn(() => [0, 0.04, 0])
    }
  };
  const callbacks = {
    clearInteractionObjectHighlights: vi.fn(),
    updateLandscapeCutEffect: vi.fn(),
    updateSnowstormFog: vi.fn()
  };

  return {
    bundle: createWorldRuntimeBundle({
      camera: {},
      controls,
      gameplay: {},
      hud: {},
      rendering: {},
      session,
      worldCanvas: null,
      callbacks,
      config: {
        worldCellPlannerPickMaxDistancePx: 24,
        workbenchInteractDistance: 2,
        workbenchPosition: [4, 0.02, 4]
      },
      getGridConfig: () => ({})
    }),
    callbacks,
    controls,
    session
  };
}

describe("createWorldRuntimeBundle", () => {
  it("wires world planner, rustling grass and scene sync runtimes", () => {
    const { bundle, callbacks, controls, session } = createHarness();

    expect(bundle.worldCellPlannerInteractionRuntime.isActive()).toBe(false);

    const rustlingResult = bundle.rustlingGrassEventRuntime.update({
      canAdvance: true,
      deltaTime: 0.1
    });

    expect(rustlingResult).toEqual({
      activeCellId: "ground-1-2",
      advanced: true
    });
    expect(controls.storyState.flags.pendingRustlingGrassCellId).toBeUndefined();

    bundle.worldSceneSyncRuntime.updateAmbientWorldFrame({
      deltaTime: 0.25,
      now: 1000
    });
    bundle.worldSceneSyncRuntime.syncWorkbenchInteractable();

    expect(callbacks.updateLandscapeCutEffect).toHaveBeenCalledWith(0.25);
    expect(callbacks.updateSnowstormFog).toHaveBeenCalledWith({
      deltaTime: 0.25,
      session
    });
    expect(session.interactables[0]).toMatchObject({
      interactDistance: 2,
      position: [4, 0.02, 4]
    });
  });
});
