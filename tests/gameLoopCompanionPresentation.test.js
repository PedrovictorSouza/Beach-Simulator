import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopCompanionPresentationRuntimeBundle
} from "../app/runtime/gameLoopCompanionPresentation.js";

describe("createGameLoopCompanionPresentationRuntimeBundle", () => {
  it("wires companion presentation dependencies for the game loop", () => {
    const companionBundle = {
      beeFieldRuntime: { id: "bee" },
      companionAbilityResourcesRuntime: { id: "resources" },
      companionModelSyncRuntime: { id: "model-sync" },
      companionRenderFrameRuntime: { id: "render-frame" },
      companionRepairBoxModelRuntime: { id: "repair-box" },
      repairBoxMotionRuntime: { id: "motion" },
      squirtleReassemblyRuntime: { id: "reassembly" }
    };
    const createRuntime = vi.fn(() => companionBundle);
    const actTwoTutorial = {
      hasStarted: vi.fn(() => true)
    };
    const onSquirtleRechargeComplete = vi.fn();
    const math = {
      clamp01: vi.fn((value) => value),
      easeOutCubic: vi.fn((value) => value),
      lerp: vi.fn(),
      moveValueToward: vi.fn()
    };
    const runtimes = {
      fieldMoveActorPositionRuntime: { id: "actor-position" },
      worldSceneSyncRuntime: { id: "world-scene" }
    };

    const result = createGameLoopCompanionPresentationRuntimeBundle({
      actTwoTutorial,
      camera: { id: "camera" },
      controls: { id: "controls" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      runtimes,
      callbacks: {
        onSquirtleRechargeComplete
      },
      math,
      createRuntime
    });

    expect(result).toBe(companionBundle);
    expect(createRuntime).toHaveBeenCalledWith({
      camera: { id: "camera" },
      controls: { id: "controls" },
      rendering: { id: "rendering" },
      session: { id: "session" },
      runtimes,
      callbacks: {
        getEncounterRepairBoxPosition: expect.any(Function),
        isActTwoTutorialStarted: expect.any(Function),
        isRevealBoxBotVisible: expect.any(Function),
        onSquirtleRechargeComplete
      },
      math
    });
    expect(createRuntime.mock.calls[0][0].callbacks.isActTwoTutorialStarted())
      .toBe(true);
    expect(actTwoTutorial.hasStarted).toHaveBeenCalledOnce();
  });
});
