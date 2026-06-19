import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopPresentationSnapshotFrameRuntime
} from "../app/runtime/gameLoopPresentationSnapshot.js";

describe("createGameLoopPresentationSnapshotFrameRuntime", () => {
  it("wires prompt preparation and presentation snapshot runtimes for the game loop", () => {
    const gameplayPromptPreparationFrameRuntime = { update: vi.fn() };
    const gameplayPresentationSnapshotFrameRuntime = { update: vi.fn() };
    const createPromptPreparationRuntime = vi.fn(() => gameplayPromptPreparationFrameRuntime);
    const createPresentationRuntime = vi.fn(() => gameplayPresentationSnapshotFrameRuntime);
    const controls = { id: "controls" };
    const gameplay = { id: "gameplay" };
    const session = { id: "session" };
    const gameplayRenderSnapshotFrameRuntime = { update: vi.fn() };
    const getCurrentInputModalityState = vi.fn();
    const getWorldCellPlannerSelectedGroundCell = vi.fn();
    const debug = vi.fn();
    const runtimes = {
      foundationBuildZoneRuntime: { id: "foundation" },
      groundActionFeedbackRuntime: { id: "ground-action" },
      playerCounterPromptRuntime: { id: "counter" },
      solarStationPowerRadiusRuntime: { id: "solar-power" },
      waterGunRuntime: { id: "water-gun" },
      workbenchRotationRuntime: { id: "workbench" }
    };

    const runtime = createGameLoopPresentationSnapshotFrameRuntime({
      controls,
      debug,
      gameplay,
      gameplayRenderSnapshotFrameRuntime,
      input: {
        getCurrentInputModalityState
      },
      runtimes,
      session,
      targetResolvers: {
        getWorldCellPlannerSelectedGroundCell
      },
      createPromptPreparationRuntime,
      createPresentationRuntime
    });

    expect(runtime).toBe(gameplayPresentationSnapshotFrameRuntime);
    expect(createPromptPreparationRuntime).toHaveBeenCalledWith({
      controls,
      session,
      gameplay,
      input: {
        getCurrentInputModalityState
      },
      runtimes,
      targetResolvers: {
        buildSolarStationFieldMarkedGroundCells: expect.any(Function),
        getLeppaTreeSurroundingGroundCells: expect.any(Function),
        getWorldCellPlannerSelectedGroundCell,
        isOpeningLeppaTreeRequestActive: expect.any(Function)
      },
      debug
    });
    expect(createPresentationRuntime).toHaveBeenCalledWith({
      gameplayPromptPreparationFrameRuntime,
      gameplayRenderSnapshotFrameRuntime,
      placementFootprints: {
        solarStation: { width: 4, height: 4 },
        greenhouse: { width: 5, height: 3 },
        campfire: { width: 3, height: 3 },
        leafDenKit: { width: 3, height: 3 }
      }
    });
  });
});
