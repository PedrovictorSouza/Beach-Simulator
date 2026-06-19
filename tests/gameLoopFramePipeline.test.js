import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopFramePipeline
} from "../app/runtime/gameLoopFramePipeline.js";

function createPipelineContext() {
  return {
    actTwoSequence: { id: "sequence" },
    actTwoTutorial: { id: "tutorial" },
    companionFrameRuntime: { id: "companion-frame" },
    constructionPlacementFrameRuntime: { id: "placement-frame" },
    controls: { id: "controls" },
    frameRuntime: {
      commitFrame: vi.fn()
    },
    gameFlowValues: { GAMEPLAY: "gameplay" },
    gameplayCameraFrameRuntime: { id: "camera-frame" },
    gameplayInputFrameRuntime: { id: "input-frame" },
    gameplayOpeningPresentationFrameRuntime: { id: "opening-frame" },
    gameplayPresentationSnapshotFrameRuntime: { id: "snapshot-frame" },
    hud: { id: "hud" },
    isGameFlow: vi.fn(),
    naturePresentationFrameRuntime: { id: "nature-frame" },
    playSoundEvent: vi.fn(),
    playerActionFrameRuntime: { id: "player-action-frame" },
    playerMovementFrameRuntime: { id: "player-movement-frame" },
    playerResourceCollectionFrameRuntime: { id: "resource-frame" },
    session: { id: "session" },
    worldSceneSyncRuntime: { id: "world-scene" }
  };
}

describe("createGameLoopFramePipeline", () => {
  it("schedules the next frame without running later phases when control stops early", () => {
    const context = createPipelineContext();
    const requestFrame = vi.fn();
    const runFrameControlPhase = vi.fn(() => ({
      shouldRequestNextFrame: true
    }));
    const runGameplayPreparationPhase = vi.fn();
    const runSimulationPresentationPhase = vi.fn();

    const frame = createGameLoopFramePipeline({
      ...context,
      requestFrame,
      runFrameControlPhase,
      runGameplayPreparationPhase,
      runSimulationPresentationPhase
    });

    frame(1200);

    expect(runFrameControlPhase).toHaveBeenCalledWith({
      actTwoTutorial: context.actTwoTutorial,
      frameRuntime: context.frameRuntime,
      gameplayCameraFrameRuntime: context.gameplayCameraFrameRuntime,
      gameplayInputFrameRuntime: context.gameplayInputFrameRuntime,
      now: 1200,
      session: context.session,
      worldSceneSyncRuntime: context.worldSceneSyncRuntime
    });
    expect(runGameplayPreparationPhase).not.toHaveBeenCalled();
    expect(runSimulationPresentationPhase).not.toHaveBeenCalled();
    expect(context.frameRuntime.commitFrame).not.toHaveBeenCalled();
    expect(requestFrame).toHaveBeenCalledWith(frame);
  });

  it("runs preparation, simulation, commit, and schedules the next frame", () => {
    const context = createPipelineContext();
    const requestFrame = vi.fn();
    const frameControlPhase = {
      cameraTransitionActive: true,
      cinematicActive: false,
      deltaTime: 0.016,
      dialogueActive: false,
      foundationBuildZoneCameraFocusActive: true,
      frameFlowState: { id: "flow" },
      gameplayOpeningCameraFrame: { id: "opening-camera" },
      gameplayOpeningCameraLocked: false,
      gameplayOpeningMovementLocked: true,
      movementBlocked: false,
      nextFrame: { id: "next-frame" },
      pokedexModalOpen: false,
      scriptedInteractionActive: false,
      shouldRequestNextFrame: false,
      skillLearnActive: false,
      tutorialActive: true,
      tutorialCameraFocus: { id: "tutorial-focus" }
    };
    const gameplayPreparationPhase = {
      activeMoveId: "waterGun",
      firstTaughtActionFreedomWindow: { active: true },
      freeBlockPreviewTarget: { id: "free-block" },
      placementPreviews: { workbench: { id: "preview" } },
      playerActionState: { activeMoveId: "waterGun" },
      playerMovedThisFrame: true
    };
    const runFrameControlPhase = vi.fn(() => frameControlPhase);
    const runGameplayPreparationPhase = vi.fn(() => gameplayPreparationPhase);
    const runSimulationPresentationPhase = vi.fn();

    const frame = createGameLoopFramePipeline({
      ...context,
      requestFrame,
      runFrameControlPhase,
      runGameplayPreparationPhase,
      runSimulationPresentationPhase
    });

    frame(2400);

    expect(runGameplayPreparationPhase).toHaveBeenCalledWith(
      expect.objectContaining({
        cinematicActive: false,
        constructionPlacementFrameRuntime:
          context.constructionPlacementFrameRuntime,
        deltaTime: 0.016,
        foundationBuildZoneCameraFocusActive: true,
        frameFlowState: frameControlPhase.frameFlowState,
        gameplayOpeningMovementLocked: true,
        now: 2400,
        playSoundEvent: context.playSoundEvent,
        playerActionFrameRuntime: context.playerActionFrameRuntime,
        playerMovementFrameRuntime: context.playerMovementFrameRuntime,
        tutorialActive: true
      })
    );
    expect(runSimulationPresentationPhase).toHaveBeenCalledWith(
      expect.objectContaining({
        activeMoveId: "waterGun",
        actTwoSequence: context.actTwoSequence,
        cameraTransitionActive: true,
        companionFrameRuntime: context.companionFrameRuntime,
        firstTaughtActionFreedomWindow:
          gameplayPreparationPhase.firstTaughtActionFreedomWindow,
        freeBlockPreviewTarget: gameplayPreparationPhase.freeBlockPreviewTarget,
        gameplayCameraFrameRuntime: context.gameplayCameraFrameRuntime,
        gameplayOpeningCameraFrame:
          frameControlPhase.gameplayOpeningCameraFrame,
        gameplayPresentationSnapshotFrameRuntime:
          context.gameplayPresentationSnapshotFrameRuntime,
        nextFrame: frameControlPhase.nextFrame,
        placementPreviews: gameplayPreparationPhase.placementPreviews,
        playerResourceCollectionFrameRuntime:
          context.playerResourceCollectionFrameRuntime,
        tutorialCameraFocus: frameControlPhase.tutorialCameraFocus,
        worldSceneSyncRuntime: context.worldSceneSyncRuntime
      })
    );
    expect(context.frameRuntime.commitFrame).toHaveBeenCalledOnce();
    expect(requestFrame).toHaveBeenCalledWith(frame);
    expect(
      runSimulationPresentationPhase.mock.invocationCallOrder[0]
    ).toBeLessThan(context.frameRuntime.commitFrame.mock.invocationCallOrder[0]);
    expect(
      context.frameRuntime.commitFrame.mock.invocationCallOrder[0]
    ).toBeLessThan(requestFrame.mock.invocationCallOrder[0]);
  });
});
