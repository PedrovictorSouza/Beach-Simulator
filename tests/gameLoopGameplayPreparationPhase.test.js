import { describe, expect, it, vi } from "vitest";

import {
  runGameLoopGameplayPreparationPhase
} from "../app/runtime/gameLoopGameplayPreparationPhase.js";

describe("runGameLoopGameplayPreparationPhase", () => {
  it("updates placement, movement, action state and follower call preparation", () => {
    const placementPreviews = {
      solarStationPlacementPreview: { id: "solar" },
      greenhousePlacementPreview: { id: "greenhouse" },
      campfirePlacementPreview: { id: "campfire" },
      leafDenKitPlacementPreview: { id: "leaf-den" }
    };
    const constructionPlacementFrameRuntime = {
      updatePlacementControlsAndPreviews: vi.fn(() => placementPreviews),
      updateFreeBlockPreview: vi.fn(() => ({
        freeBlockPreviewTarget: { id: "free-block-target" }
      }))
    };
    const playerMovementFrameRuntime = {
      update: vi.fn(() => ({ playerMovedThisFrame: true }))
    };
    const naturePresentationFrameRuntime = {
      updatePassiveEffects: vi.fn()
    };
    const playerActionState = {
      activeMoveId: "waterGun",
      buildBlockEquipped: true
    };
    const playerActionFrameRuntime = {
      getActionState: vi.fn(() => playerActionState),
      update: vi.fn()
    };
    const syncFirstTaughtActionFreedom = vi.fn(() => ({ active: true }));
    const processFollowerCall = vi.fn(({ pushNotice }) => {
      pushNotice("notice");
    });
    const hud = {
      pushNotice: vi.fn()
    };
    const controls = {
      storyState: { flags: {} }
    };
    const frameFlowState = { gameplayActive: true };

    const result = runGameLoopGameplayPreparationPhase({
      cinematicActive: false,
      constructionPlacementFrameRuntime,
      controls,
      deltaTime: 0.016,
      dialogueActive: true,
      foundationBuildZoneCameraFocusActive: false,
      frameFlowState,
      gameplayOpeningCameraLocked: false,
      gameplayOpeningMovementLocked: true,
      hud,
      movementBlocked: true,
      naturePresentationFrameRuntime,
      now: 1200,
      playSoundEvent: vi.fn(),
      playerActionFrameRuntime,
      playerMovementFrameRuntime,
      pokedexModalOpen: false,
      scriptedInteractionActive: false,
      session: { id: "session" },
      skillLearnActive: false,
      tutorialActive: true,
      processFollowerCall,
      syncFirstTaughtActionFreedom
    });

    expect(result).toEqual({
      activeMoveId: "waterGun",
      firstTaughtActionFreedomWindow: { active: true },
      freeBlockPreviewTarget: { id: "free-block-target" },
      placementPreviews,
      playerActionState,
      playerMovedThisFrame: true
    });
    expect(constructionPlacementFrameRuntime.updatePlacementControlsAndPreviews)
      .toHaveBeenCalledWith({
        now: 1200,
        deltaTime: 0.016,
        movementBlocked: true
      });
    expect(playerMovementFrameRuntime.update).toHaveBeenCalledWith({
      deltaTime: 0.016,
      now: 1200,
      flowState: frameFlowState,
      gameplayOpeningMovementLocked: true,
      gameplayOpeningCameraLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      tutorialActive: true
    });
    expect(naturePresentationFrameRuntime.updatePassiveEffects)
      .toHaveBeenCalledWith(0.016);
    expect(syncFirstTaughtActionFreedom)
      .toHaveBeenCalledWith(controls.storyState, { now: 1200 });
    expect(constructionPlacementFrameRuntime.updateFreeBlockPreview)
      .toHaveBeenCalledWith(expect.objectContaining({
        buildBlockEquipped: true,
        dialogueActive: true,
        gameplayOpeningMovementLocked: true
      }));
    expect(playerActionFrameRuntime.update).toHaveBeenCalledWith({
      now: 1200,
      flowState: frameFlowState,
      equipmentState: playerActionState
    });
    expect(processFollowerCall).toHaveBeenCalledWith(
      expect.objectContaining({
        controls,
        session: { id: "session" },
        playSoundEvent: expect.any(Function)
      })
    );
    expect(hud.pushNotice).toHaveBeenCalledWith("notice");
  });
});
