import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopFrameRuntimeBundle
} from "../app/runtime/gameLoopFrameRuntimeBundle.js";

describe("createGameLoopFrameRuntimeBundle", () => {
  it("wires frame runtime dependencies and early-frame callbacks", () => {
    const frameRuntime = { id: "frame-runtime" };
    const createFrameRuntime = vi.fn(() => frameRuntime);
    const repairBoxMotionRuntime = {
      update: vi.fn()
    };
    const rustlingGrassEventRuntime = {
      update: vi.fn()
    };
    const processWorldCellPlannerClick = vi.fn(() => "processed");
    const updateIntroRoomFrame = vi.fn(() => true);
    const isPlacementPreviewActive = vi.fn();
    const placementContracts = [{ id: "placement-contract" }];

    const result = createGameLoopFrameRuntimeBundle({
      camera: { id: "camera" },
      controls: { id: "controls" },
      frameClock: { id: "clock" },
      frameSnapshotController: { id: "snapshot" },
      fpsPanelController: { id: "fps" },
      gameplayOpeningRuntime: { id: "opening" },
      placementCameraAssist: { id: "placement-camera" },
      readGameLoopFlowState: vi.fn(),
      repairBoxMotionRuntime,
      rustlingGrassEventRuntime,
      session: {
        id: "session",
        introRoomScene: { id: "intro-room" }
      },
      updateFoundationBuildZoneCameraFocus: vi.fn(),
      worldCanvas: { id: "world-canvas" },
      callbacks: {
        processWorldCellPlannerClick
      },
      createFrameRuntime,
      isPlacementPreviewActive,
      placementContracts,
      updateIntroRoomFrame
    });

    expect(result).toBe(frameRuntime);
    expect(createFrameRuntime).toHaveBeenCalledWith({
      frameClock: { id: "clock" },
      frameSnapshotController: { id: "snapshot" },
      fpsPanelController: { id: "fps" },
      controls: { id: "controls" },
      readFlowState: expect.any(Function),
      advanceElapsed: expect.any(Function),
      gameplayOpeningRuntime: { id: "opening" },
      session: {
        id: "session",
        introRoomScene: { id: "intro-room" }
      },
      placement: {
        contracts: placementContracts,
        hasActivePlacementPreview: isPlacementPreviewActive
      },
      placementCameraAssist: { id: "placement-camera" },
      updateFoundationBuildZoneCameraFocus: expect.any(Function),
      earlyFrame: {
        processWorldCellPlannerClick: expect.any(Function),
        updateIntroRoomFrame: expect.any(Function),
        updateRustlingGrass: expect.any(Function)
      }
    });

    const options = createFrameRuntime.mock.calls[0][0];
    options.advanceElapsed(0.05);
    expect(repairBoxMotionRuntime.update).toHaveBeenCalledWith(0.05);
    expect(options.earlyFrame.processWorldCellPlannerClick()).toBe("processed");
    expect(processWorldCellPlannerClick).toHaveBeenCalledOnce();
    expect(options.earlyFrame.updateIntroRoomFrame({
      nextFrame: { id: "next-frame" },
      deltaTime: 0.016
    })).toBe(true);
    expect(updateIntroRoomFrame).toHaveBeenCalledWith({
      introRoomScene: { id: "intro-room" },
      camera: { id: "camera" },
      worldCanvas: { id: "world-canvas" },
      frame: { id: "next-frame" },
      deltaTime: 0.016
    });
    options.earlyFrame.updateRustlingGrass({
      deltaTime: 0.02,
      canAdvance: true
    });

    expect(rustlingGrassEventRuntime.update).toHaveBeenCalledWith({
      deltaTime: 0.02,
      canAdvance: true
    });
  });
});
