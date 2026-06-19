import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopConstructionBlockerRuntimeBundle
} from "../app/runtime/gameLoopConstructionBlockers.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopConstructionBlockerRuntimeBundle", () => {
  it("wires terrain collider provider and construction blockers for the game loop", () => {
    const getPlayerConstructionTerrainColliders = vi.fn(() => []);
    const createTerrainColliderProvider =
      vi.fn(() => getPlayerConstructionTerrainColliders);
    const blockerBundle = {
      companionConstructionBlockerRuntime: { id: "companion-blocker" },
      solarStationPlacementBlockerRuntime: { id: "solar-blocker" },
      worldObjectPlacementBlockerRuntime: { id: "world-blocker" }
    };
    const createRuntimeBundle = vi.fn(() => blockerBundle);
    const controls = { storyState: { flags: { ready: true } } };
    const playSoundEvent = vi.fn();

    const result = createGameLoopConstructionBlockerRuntimeBundle({
      controls,
      hud: { id: "hud" },
      session: { id: "session" },
      callbacks: {
        playSoundEvent
      },
      createTerrainColliderProvider,
      createRuntimeBundle
    });

    expect(result).toEqual({
      getPlayerConstructionTerrainColliders,
      ...blockerBundle
    });
    expect(createTerrainColliderProvider).toHaveBeenCalledWith({
      session: { id: "session" },
      getStoryState: expect.any(Function)
    });
    expect(createTerrainColliderProvider.mock.calls[0][0].getStoryState())
      .toBe(controls.storyState);
    expect(createRuntimeBundle).toHaveBeenCalledWith({
      controls,
      hud: { id: "hud" },
      session: { id: "session" },
      treeFootprint: expect.any(Function),
      callbacks: {
        getTerrainColliders: getPlayerConstructionTerrainColliders,
        playBlockedSound: expect.any(Function)
      }
    });
    createRuntimeBundle.mock.calls[0][0].callbacks.playBlockedSound();
    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.UI_CANCEL);
  });
});
