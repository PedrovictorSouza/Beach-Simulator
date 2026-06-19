import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopCompanionSupportRuntimeBundle
} from "../app/runtime/gameLoopCompanionSupport.js";

describe("createGameLoopCompanionSupportRuntimeBundle", () => {
  it("wires field-move support, speech cues and companion motion for the game loop", () => {
    const fieldMoveSupportRuntimeBundle = {
      fieldMoveActorPositionRuntime: { id: "actor-position" },
      fieldMoveApproachPositionRuntime: { id: "approach" },
      fieldMoveInvalidTargetPromptRuntime: { id: "invalid-prompt" }
    };
    const companionMotionRuntimeBundle = {
      bulbasaurWorkbenchGuideRuntime: { id: "guide" },
      companionFollowDirectionRuntime: { id: "direction" },
      companionFollowMovementRuntime: { id: "movement" },
      companionGroundPatrolFrameRuntime: { id: "patrol" },
      companionIdleMotionRuntime: { id: "idle" }
    };
    const companionWorldSpeechCueRuntime = { id: "speech" };
    const runBreadcrumbPromptRuntime = { id: "run-breadcrumb" };
    const createFieldMoveSupportRuntime =
      vi.fn(() => fieldMoveSupportRuntimeBundle);
    const createCompanionMotionRuntime =
      vi.fn(() => companionMotionRuntimeBundle);
    const createRunBreadcrumbRuntime =
      vi.fn(() => runBreadcrumbPromptRuntime);
    const createWorldSpeechCueRuntime =
      vi.fn(() => companionWorldSpeechCueRuntime);
    const getWaterGunRuntime = vi.fn();
    const runtimes = {
      companionConstructionBlockerRuntime: { id: "blocker" },
      companionFacingRuntime: { id: "facing" },
      companionModelSyncRuntime: { id: "model-sync" }
    };

    const result = createGameLoopCompanionSupportRuntimeBundle({
      controls: { id: "controls" },
      session: { id: "session" },
      worldSceneSyncRuntime: { id: "world-scene" },
      runtimes,
      callbacks: {
        getWaterGunRuntime
      },
      createCompanionMotionRuntime,
      createFieldMoveSupportRuntime,
      createRunBreadcrumbRuntime,
      createWorldSpeechCueRuntime
    });

    expect(result).toEqual({
      ...fieldMoveSupportRuntimeBundle,
      companionWorldSpeechCueRuntime,
      ...companionMotionRuntimeBundle,
      runBreadcrumbPromptRuntime
    });
    expect(createFieldMoveSupportRuntime).toHaveBeenCalledWith({
      session: { id: "session" },
      companionFacingRuntime: runtimes.companionFacingRuntime,
      companionConstructionBlockerRuntime: runtimes.companionConstructionBlockerRuntime
    });
    expect(createWorldSpeechCueRuntime).toHaveBeenCalledWith({
      controls: { id: "controls" },
      session: { id: "session" },
      fieldMoveActorPositionRuntime:
        fieldMoveSupportRuntimeBundle.fieldMoveActorPositionRuntime,
      worldSceneSyncRuntime: { id: "world-scene" },
      config: {
        chopperInteractDistance: expect.any(Number),
        restoreTargetCount: expect.any(Number)
      }
    });
    expect(createCompanionMotionRuntime).toHaveBeenCalledWith({
      controls: { id: "controls" },
      session: { id: "session" },
      runtimes,
      callbacks: {
        getWaterGunRuntime
      }
    });
    expect(createRunBreadcrumbRuntime).toHaveBeenCalledWith({
      durationMs: 4200
    });
  });
});
