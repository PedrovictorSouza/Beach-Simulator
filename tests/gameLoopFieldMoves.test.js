import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopFieldMoveRuntimeBundle
} from "../app/runtime/gameLoopFieldMoves.js";

describe("createGameLoopFieldMoveRuntimeBundle", () => {
  it("wires field move runtime dependencies for the game loop", () => {
    const fieldMoveBundle = {
      buildBlockRuntime: { id: "build-block" },
      fireRuntime: { id: "fire" },
      leafageRuntime: { id: "leafage" },
      waterGunRuntime: { id: "water-gun" }
    };
    const createRuntime = vi.fn(() => fieldMoveBundle);
    const hud = {
      pushNotice: vi.fn()
    };
    const fieldMoveImpactRuntime = { id: "impact" };
    const freeBlockBuildRuntime = { id: "free-block" };
    const runtimes = {
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionAbilityResourcesRuntime: { id: "resources" },
      companionConstructionBlockerRuntime: { id: "blocker" },
      companionFacingRuntime: { id: "facing" },
      companionModelSyncRuntime: { id: "model-sync" },
      fieldMoveApproachPositionRuntime: { id: "approach" },
      leafDenConstructionPresentationRuntime: { id: "leaf-den" }
    };

    const result = createGameLoopFieldMoveRuntimeBundle({
      controls: { id: "controls" },
      hud,
      session: { id: "session" },
      runtimes,
      callbacks: {
        getFieldMoveImpactRuntime: () => fieldMoveImpactRuntime,
        getFreeBlockBuildRuntime: () => freeBlockBuildRuntime
      },
      createRuntime
    });

    expect(result).toBe(fieldMoveBundle);
    expect(createRuntime).toHaveBeenCalledWith({
      session: { id: "session" },
      controls: { id: "controls" },
      runtimes: {
        ...runtimes,
        fieldMoveImpactRuntime,
        freeBlockBuildRuntime
      },
      callbacks: {
        pushNotice: expect.any(Function),
        shouldTimburrBuildBlockCastFromBlockedApproach: expect.any(Function)
      },
      botNames: expect.any(Object)
    });
    createRuntime.mock.calls[0][0].callbacks.pushNotice("Blocked");
    expect(hud.pushNotice).toHaveBeenCalledWith("Blocked");
  });
});
