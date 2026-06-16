import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopFlowStateReader,
  createGameLoopFrameRuntime
} from "../app/runtime/gameLoopFrameRuntime.js";

function createRuntime({
  paused = false,
  frameRuntimeOverrides = {}
} = {}) {
  const nextFrame = { id: "frame-1" };
  const flowState = { gameplayActive: true };
  const frameClock = {
    update: vi.fn(() => ({
      rawDeltaTime: 0.12,
      deltaTime: 0.033
    }))
  };
  const frameSnapshotController = {
    beginFrame: vi.fn(() => nextFrame),
    commitFrame: vi.fn()
  };
  const fpsPanelController = {
    update: vi.fn()
  };
  const controls = {
    updateGamepads: vi.fn(),
    isPaused: vi.fn(() => paused),
    clearPendingActions: vi.fn(),
    clearMovementInput: vi.fn()
  };
  const readFlowState = vi.fn(() => flowState);
  const advanceElapsed = vi.fn();
  const runtime = createGameLoopFrameRuntime({
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readFlowState,
    advanceElapsed,
    ...frameRuntimeOverrides
  });

  return {
    runtime,
    nextFrame,
    flowState,
    frameClock,
    frameSnapshotController,
    fpsPanelController,
    controls,
    readFlowState,
    advanceElapsed
  };
}

describe("createGameLoopFrameRuntime", () => {
  it("reads game flow state through explicit runtime dependencies", () => {
    const gameFlowValues = {
      GAMEPLAY: "gameplay",
      CINEMATIC: "cinematic",
      INTRO: "intro",
      TUTORIAL: "tutorial"
    };
    const activeFlows = new Set(["gameplay", "tutorial"]);
    const isGameFlow = vi.fn((flow) => activeFlows.has(flow));
    const actTwoTutorial = {
      isMovementLocked: vi.fn(() => true),
      getCameraFocusTarget: vi.fn(() => ({ id: "focus-target" }))
    };
    const readFlowState = createGameLoopFlowStateReader({
      isGameFlow,
      gameFlowValues,
      actTwoTutorial,
      pokedexUiState: { open: true },
      gameplayDialogue: { isActive: vi.fn(() => false) },
      controls: {
        isSkillLearnActive: vi.fn(() => true),
        isScriptedInteractionActive: vi.fn(() => false)
      }
    });

    expect(readFlowState()).toEqual({
      gameplayActive: true,
      cinematicActive: false,
      introActive: false,
      tutorialActive: true,
      tutorialMovementLocked: true,
      pokedexModalOpen: true,
      dialogueActive: false,
      skillLearnActive: true,
      scriptedInteractionActive: false,
      tutorialCameraFocus: { id: "focus-target" }
    });
    expect(isGameFlow).toHaveBeenCalledWith("tutorial");
    expect(isGameFlow).toHaveBeenCalledWith("gameplay");
    expect(isGameFlow).toHaveBeenCalledWith("cinematic");
    expect(isGameFlow).toHaveBeenCalledWith("intro");
    expect(actTwoTutorial.isMovementLocked).toHaveBeenCalledOnce();
    expect(actTwoTutorial.getCameraFocusTarget).toHaveBeenCalledOnce();
  });

  it("does not query tutorial locks when tutorial flow is inactive", () => {
    const actTwoTutorial = {
      isMovementLocked: vi.fn(),
      getCameraFocusTarget: vi.fn()
    };
    const readFlowState = createGameLoopFlowStateReader({
      isGameFlow: () => false,
      gameFlowValues: {
        GAMEPLAY: "gameplay",
        CINEMATIC: "cinematic",
        INTRO: "intro",
        TUTORIAL: "tutorial"
      },
      actTwoTutorial,
      pokedexUiState: {},
      gameplayDialogue: {},
      controls: {}
    });

    expect(readFlowState()).toMatchObject({
      tutorialActive: false,
      tutorialMovementLocked: false,
      tutorialCameraFocus: null
    });
    expect(actTwoTutorial.isMovementLocked).not.toHaveBeenCalled();
    expect(actTwoTutorial.getCameraFocusTarget).not.toHaveBeenCalled();
  });

  it("begins a snapshot and returns timing with the current flow state", () => {
    const context = createRuntime();

    expect(context.runtime.beginFrame(1200)).toEqual({
      nextFrame: context.nextFrame,
      rawDeltaTime: 0.12,
      deltaTime: 0.033,
      flowState: context.flowState
    });
    expect(context.frameSnapshotController.beginFrame).toHaveBeenCalledOnce();
    expect(context.frameClock.update).toHaveBeenCalledWith(1200);
    expect(context.fpsPanelController.update).toHaveBeenCalledWith(0.12);
    expect(context.advanceElapsed).toHaveBeenCalledWith(0.033);
    expect(context.readFlowState).toHaveBeenCalledOnce();
  });

  it("updates gamepads without clearing input while gameplay is not paused", () => {
    const context = createRuntime();

    expect(context.runtime.updateInputAndCheckPaused(0.016)).toBe(false);
    expect(context.controls.updateGamepads).toHaveBeenCalledWith(0.016);
    expect(context.controls.clearPendingActions).not.toHaveBeenCalled();
    expect(context.controls.clearMovementInput).not.toHaveBeenCalled();
  });

  it("clears pending actions and movement input when paused", () => {
    const context = createRuntime({ paused: true });

    expect(context.runtime.updateInputAndCheckPaused(0.016)).toBe(true);
    expect(context.controls.updateGamepads).toHaveBeenCalledWith(0.016);
    expect(context.controls.clearPendingActions).toHaveBeenCalledOnce();
    expect(context.controls.clearMovementInput).toHaveBeenCalledOnce();
  });

  it("commits the current snapshot through the snapshot controller", () => {
    const context = createRuntime();

    context.runtime.commitFrame();

    expect(context.frameSnapshotController.commitFrame).toHaveBeenCalledOnce();
  });

  it("does not schedule animation frames directly", () => {
    const context = createRuntime();

    expect(context.runtime).not.toHaveProperty("requestAnimationFrame");
  });

  it("begins the gameplay frame context with opening, placement and blocker state", () => {
    const openingRuntime = {
      beginFrame: vi.fn(() => ({
        cameraFrame: { phase: "establishing" }
      })),
      isCameraLocked: vi.fn(() => true),
      isMovementLocked: vi.fn(() => true)
    };
    const hasActivePlacementPreview = vi.fn(() => true);
    const placementCameraAssist = {
      update: vi.fn()
    };
    const updateFoundationBuildZoneCameraFocus = vi.fn(() => false);
    const resolveBlockers = vi.fn(() => ({
      movementBlocked: true,
      shouldClearPendingActions: true,
      shouldClearMovementInput: true,
      canAdvanceRustlingGrass: false
    }));
    const session = { id: "session" };
    const placementContracts = [{ id: "contract" }];
    const context = createRuntime({
      frameRuntimeOverrides: {
        gameplayOpeningRuntime: openingRuntime,
        session,
        placement: {
          contracts: placementContracts,
          hasActivePlacementPreview
        },
        placementCameraAssist,
        updateFoundationBuildZoneCameraFocus,
        resolveBlockers
      }
    });
    const flowState = {
      gameplayActive: true,
      tutorialActive: false
    };

    expect(context.runtime.beginGameplayFrameContext({
      now: 1200,
      deltaTime: 0.016,
      flowState
    })).toEqual({
      gameplayOpeningCameraFrame: { phase: "establishing" },
      gameplayOpeningCameraLocked: true,
      gameplayOpeningMovementLocked: true,
      placementPreviewActive: true,
      foundationBuildZoneCameraFocusActive: false,
      movementBlocked: true,
      shouldClearPendingActions: true,
      shouldClearMovementInput: true,
      canAdvanceRustlingGrass: false
    });
    expect(openingRuntime.beginFrame).toHaveBeenCalledWith({
      now: 1200,
      deltaTime: 0.016,
      gameplayActive: true
    });
    expect(hasActivePlacementPreview).toHaveBeenCalledWith(session, placementContracts);
    expect(placementCameraAssist.update).toHaveBeenCalledWith({
      placementActive: true
    });
    expect(updateFoundationBuildZoneCameraFocus).toHaveBeenCalledWith(1200);
    expect(resolveBlockers).toHaveBeenCalledWith({
      gameplayOpeningMovementLocked: true,
      foundationBuildZoneCameraFocusActive: false,
      placementPreviewActive: true,
      flowState
    });
  });

  it("commits early when the intro room consumes the frame", () => {
    const processWorldCellPlannerClick = vi.fn();
    const updateIntroRoomFrame = vi.fn(() => true);
    const updateRustlingGrass = vi.fn();
    const context = createRuntime({
      frameRuntimeOverrides: {
        earlyFrame: {
          processWorldCellPlannerClick,
          updateIntroRoomFrame,
          updateRustlingGrass
        }
      }
    });

    expect(context.runtime.updateEarlyGameplayControlFrame({
      nextFrame: context.nextFrame,
      deltaTime: 0.016,
      introActive: true,
      shouldClearPendingActions: true,
      shouldClearMovementInput: true,
      canAdvanceRustlingGrass: false
    })).toEqual({ committedEarlyFrame: true });
    expect(processWorldCellPlannerClick).toHaveBeenCalledOnce();
    expect(updateIntroRoomFrame).toHaveBeenCalledWith({
      nextFrame: context.nextFrame,
      deltaTime: 0.016
    });
    expect(context.frameSnapshotController.commitFrame).toHaveBeenCalledOnce();
    expect(context.controls.clearPendingActions).not.toHaveBeenCalled();
    expect(context.controls.clearMovementInput).not.toHaveBeenCalled();
    expect(updateRustlingGrass).not.toHaveBeenCalled();
  });

  it("processes normal early gameplay control cleanup before simulation continues", () => {
    const processWorldCellPlannerClick = vi.fn();
    const updateIntroRoomFrame = vi.fn(() => false);
    const updateRustlingGrass = vi.fn();
    const context = createRuntime({
      frameRuntimeOverrides: {
        earlyFrame: {
          processWorldCellPlannerClick,
          updateIntroRoomFrame,
          updateRustlingGrass
        }
      }
    });

    expect(context.runtime.updateEarlyGameplayControlFrame({
      nextFrame: context.nextFrame,
      deltaTime: 0.02,
      introActive: false,
      shouldClearPendingActions: true,
      shouldClearMovementInput: true,
      canAdvanceRustlingGrass: true
    })).toEqual({ committedEarlyFrame: false });
    expect(processWorldCellPlannerClick).toHaveBeenCalledOnce();
    expect(updateIntroRoomFrame).not.toHaveBeenCalled();
    expect(context.controls.clearPendingActions).toHaveBeenCalledOnce();
    expect(context.controls.clearMovementInput).toHaveBeenCalledOnce();
    expect(updateRustlingGrass).toHaveBeenCalledWith({
      deltaTime: 0.02,
      canAdvance: true
    });
    expect(context.frameSnapshotController.commitFrame).not.toHaveBeenCalled();
  });
});
