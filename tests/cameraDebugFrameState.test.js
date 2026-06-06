import { describe, expect, it } from "vitest";

import { createCameraDebugFrameState } from "../app/runtime/cameraDebugFrameState.js";

describe("createCameraDebugFrameState", () => {
  it("builds the camera debug overlay payload without reading runtime globals", () => {
    expect(createCameraDebugFrameState({
      now: 12.6,
      flowState: {
        gameplayActive: true,
        cinematicActive: false,
        introActive: false,
        tutorialActive: true,
        tutorialMovementLocked: true,
        pokedexModalOpen: false,
        dialogueActive: true,
        skillLearnActive: false,
        scriptedInteractionActive: true
      },
      movementBlocked: true,
      gameplayOpeningMovementLocked: false,
      cameraTransitionActive: true,
      paused: false,
      gameplayCameraState: { mode: "follow", priority: "gameplay" },
      cameraPose: { target: [1, 2, 3] },
      systemQuestId: "system-quest",
      uiQuestId: "ui-quest",
      playerPosition: [4, 5, 6],
      shipVisible: true,
      shipPosition: [7, 8, 9]
    })).toEqual({
      frame: 13,
      flow: {
        gameplay: true,
        cinematic: false,
        intro: false,
        tutorial: true
      },
      blockers: {
        movementBlocked: true,
        tutorialMovementLocked: true,
        pokedexModalOpen: false,
        dialogueActive: true,
        skillLearnActive: false,
        scriptedInteractionActive: true,
        paused: false
      },
      camera: {
        mode: "follow",
        priority: "gameplay",
        openingCameraActiveForInput: false,
        transitionActive: true,
        pose: { target: [1, 2, 3] }
      },
      quest: {
        system: "system-quest",
        ui: "ui-quest"
      },
      player: [4, 5, 6],
      ship: [7, 8, 9]
    });
  });

  it("keeps nullable fallback behavior for optional debug sections", () => {
    const state = createCameraDebugFrameState({
      now: 2,
      flowState: {},
      movementBlocked: false,
      gameplayOpeningMovementLocked: true,
      cameraTransitionActive: false,
      paused: true,
      cameraPose: undefined,
      systemQuestId: "",
      uiQuestId: undefined,
      playerPosition: undefined,
      shipVisible: false,
      shipPosition: [1, 0, 2]
    });

    expect(state.camera).toEqual({
      openingCameraActiveForInput: true,
      transitionActive: false,
      pose: null
    });
    expect(state.quest).toEqual({ system: null, ui: null });
    expect(state.player).toBeNull();
    expect(state.ship).toBeNull();
  });
});
