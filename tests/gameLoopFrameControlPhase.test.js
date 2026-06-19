import { describe, expect, it, vi } from "vitest";

import {
  runGameLoopFrameControlPhase
} from "../app/runtime/gameLoopFrameControlPhase.js";

function createContext({
  paused = false,
  committedEarlyFrame = false
} = {}) {
  const nextFrame = { id: "next-frame" };
  const frameFlowState = {
    cinematicActive: false,
    dialogueActive: true,
    introActive: false,
    pokedexModalOpen: false,
    scriptedInteractionActive: false,
    skillLearnActive: false,
    tutorialActive: true,
    tutorialCameraFocus: { id: "focus" }
  };
  const frameContext = {
    canAdvanceRustlingGrass: true,
    foundationBuildZoneCameraFocusActive: false,
    gameplayOpeningCameraFrame: { id: "opening-camera-frame" },
    gameplayOpeningCameraLocked: false,
    gameplayOpeningMovementLocked: true,
    movementBlocked: true,
    placementPreviewActive: true,
    shouldClearMovementInput: true,
    shouldClearPendingActions: false
  };
  const frameRuntime = {
    beginFrame: vi.fn(() => ({
      nextFrame,
      deltaTime: 0.016,
      flowState: frameFlowState
    })),
    beginGameplayFrameContext: vi.fn(() => frameContext),
    updateEarlyGameplayControlFrame: vi.fn(() => ({ committedEarlyFrame })),
    updateInputAndCheckPaused: vi.fn(() => paused)
  };
  const gameplayInputFrameRuntime = {
    update: vi.fn(() => ({ cameraTransitionActive: true }))
  };
  const gameplayCameraFrameRuntime = {
    updateInput: vi.fn()
  };
  const worldSceneSyncRuntime = {
    updateEarlySceneFrame: vi.fn()
  };
  const actTwoTutorial = {
    isRepairPlantFixed: vi.fn(() => true)
  };
  const session = {
    actTwoRepairPlant: { fixed: false }
  };

  return {
    actTwoTutorial,
    frameContext,
    frameFlowState,
    frameRuntime,
    gameplayCameraFrameRuntime,
    gameplayInputFrameRuntime,
    nextFrame,
    session,
    worldSceneSyncRuntime
  };
}

describe("runGameLoopFrameControlPhase", () => {
  it("runs timing, input blockers, early control, and camera input for a normal frame", () => {
    const context = createContext();

    const result = runGameLoopFrameControlPhase({
      ...context,
      now: 1200
    });

    expect(result).toMatchObject({
      cameraTransitionActive: true,
      deltaTime: 0.016,
      frameFlowState: context.frameFlowState,
      gameplayOpeningCameraFrame: context.frameContext.gameplayOpeningCameraFrame,
      gameplayOpeningMovementLocked: true,
      movementBlocked: true,
      nextFrame: context.nextFrame,
      shouldRequestNextFrame: false,
      tutorialCameraFocus: { id: "focus" }
    });
    expect(context.session.actTwoRepairPlant.fixed).toBe(true);
    expect(context.frameRuntime.beginFrame).toHaveBeenCalledWith(1200);
    expect(context.worldSceneSyncRuntime.updateEarlySceneFrame)
      .toHaveBeenCalledWith(0.016);
    expect(context.gameplayInputFrameRuntime.update).toHaveBeenCalledWith(
      expect.objectContaining({
        gameplayOpeningMovementLocked: true,
        movementBlocked: true,
        placementPreviewActive: true
      })
    );
    expect(context.frameRuntime.updateEarlyGameplayControlFrame)
      .toHaveBeenCalledWith(expect.objectContaining({
        canAdvanceRustlingGrass: true,
        nextFrame: context.nextFrame,
        shouldClearMovementInput: true
      }));
    expect(context.gameplayCameraFrameRuntime.updateInput)
      .toHaveBeenCalledWith(expect.objectContaining({
        flowState: context.frameFlowState,
        gameplayOpeningCameraLocked: false,
        placementPreviewActive: true
      }));
  });

  it("returns early when input update detects pause", () => {
    const context = createContext({ paused: true });

    const result = runGameLoopFrameControlPhase({
      ...context,
      now: 1200
    });

    expect(result).toMatchObject({
      shouldRequestNextFrame: true,
      nextFrame: context.nextFrame,
      deltaTime: 0.016,
      frameFlowState: context.frameFlowState
    });
    expect(context.worldSceneSyncRuntime.updateEarlySceneFrame)
      .not.toHaveBeenCalled();
    expect(context.gameplayInputFrameRuntime.update).not.toHaveBeenCalled();
    expect(context.gameplayCameraFrameRuntime.updateInput).not.toHaveBeenCalled();
  });

  it("returns early when intro frame commits before gameplay updates", () => {
    const context = createContext({ committedEarlyFrame: true });

    const result = runGameLoopFrameControlPhase({
      ...context,
      now: 1200
    });

    expect(result).toMatchObject({
      committedEarlyFrame: true,
      shouldRequestNextFrame: true,
      nextFrame: context.nextFrame
    });
    expect(context.gameplayInputFrameRuntime.update).toHaveBeenCalledOnce();
    expect(context.gameplayCameraFrameRuntime.updateInput).not.toHaveBeenCalled();
  });
});
