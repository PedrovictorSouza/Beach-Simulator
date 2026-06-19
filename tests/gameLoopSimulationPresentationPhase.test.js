import { describe, expect, it, vi } from "vitest";

import {
  runGameLoopSimulationPresentationPhase
} from "../app/runtime/gameLoopSimulationPresentationPhase.js";

describe("runGameLoopSimulationPresentationPhase", () => {
  it("updates simulation, camera, presentation and snapshot for the frame", () => {
    const worldSceneSyncRuntime = {
      updateAmbientWorldFrame: vi.fn()
    };
    const companionFrameRuntime = {
      update: vi.fn(() => ({
        chopperBulbasaurRepairBoxInvestigationTarget: { id: "repair-target" }
      }))
    };
    const actTwoSequence = {
      update: vi.fn()
    };
    const isGameFlow = vi.fn((flow) => flow === "tutorial");
    const playerResourceCollectionFrameRuntime = {
      update: vi.fn()
    };
    const gameplayCameraFrameRuntime = {
      updateFollow: vi.fn(() => ({
        gameplayOpeningCameraFrame: { id: "camera-opening-frame" }
      }))
    };
    const gameplayOpeningPresentationFrameRuntime = {
      update: vi.fn(() => ({
        gameplayOpeningCameraFrame: { id: "presentation-opening-frame" },
        gameplayOpeningHudHidden: true,
        currentFlowState: { gameplayActive: true }
      }))
    };
    const gameplayPresentationSnapshotFrameRuntime = {
      update: vi.fn()
    };
    const placementPreviews = {
      solarStationPlacementPreview: { id: "solar" }
    };
    const playerActionState = {
      activeMoveId: "waterGun"
    };

    const result = runGameLoopSimulationPresentationPhase({
      activeMoveId: "waterGun",
      actTwoSequence,
      cameraTransitionActive: true,
      cinematicActive: true,
      companionFrameRuntime,
      deltaTime: 0.016,
      dialogueActive: false,
      firstTaughtActionFreedomWindow: { active: true },
      foundationBuildZoneCameraFocusActive: false,
      frameFlowState: { gameplayActive: true },
      freeBlockPreviewTarget: { id: "free-block" },
      gameFlowValues: {
        CINEMATIC: "cinematic",
        TUTORIAL: "tutorial"
      },
      gameplayCameraFrameRuntime,
      gameplayOpeningCameraFrame: { id: "opening-frame" },
      gameplayOpeningCameraLocked: false,
      gameplayOpeningMovementLocked: true,
      gameplayOpeningPresentationFrameRuntime,
      gameplayPresentationSnapshotFrameRuntime,
      isGameFlow,
      nextFrame: { id: "next-frame" },
      now: 1200,
      placementPreviews,
      playerActionState,
      playerMovedThisFrame: true,
      playerResourceCollectionFrameRuntime,
      pokedexModalOpen: false,
      scriptedInteractionActive: false,
      skillLearnActive: false,
      tutorialActive: false,
      tutorialCameraFocus: { id: "focus" },
      worldSceneSyncRuntime
    });

    expect(result).toMatchObject({
      chopperBulbasaurRepairBoxInvestigationTarget: { id: "repair-target" },
      cinematicActive: false,
      tutorialActive: true
    });
    expect(worldSceneSyncRuntime.updateAmbientWorldFrame)
      .toHaveBeenCalledWith({ deltaTime: 0.016, now: 1200 });
    expect(companionFrameRuntime.update).toHaveBeenCalledWith(
      expect.objectContaining({
        activeMoveId: "waterGun",
        gameplayOpeningMovementLocked: true
      })
    );
    expect(actTwoSequence.update).toHaveBeenCalledWith(0.016);
    expect(isGameFlow).toHaveBeenCalledWith("cinematic");
    expect(isGameFlow).toHaveBeenCalledWith("tutorial");
    expect(playerResourceCollectionFrameRuntime.update).toHaveBeenCalledWith(
      expect.objectContaining({
        cinematicActive: false,
        tutorialActive: true
      })
    );
    expect(gameplayCameraFrameRuntime.updateFollow).toHaveBeenCalledWith(
      expect.objectContaining({
        gameplayOpeningCameraFrame: { id: "opening-frame" },
        tutorialCameraFocus: { id: "focus" }
      })
    );
    expect(gameplayOpeningPresentationFrameRuntime.update).toHaveBeenCalledWith(
      expect.objectContaining({
        gameplayOpeningCameraFrame: { id: "camera-opening-frame" },
        playerMovedThisFrame: true
      })
    );
    expect(gameplayPresentationSnapshotFrameRuntime.update).toHaveBeenCalledWith(
      expect.objectContaining({
        firstTaughtActionFreedomWindowActive: true,
        freeBlockPreviewTarget: { id: "free-block" },
        placementPreviews,
        playerActionState
      })
    );
  });
});
