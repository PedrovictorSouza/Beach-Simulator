import { describe, expect, it, vi } from "vitest";

import { createPlayerMovementFrameRuntime } from "../app/player/playerMovementFrame.js";

function createPlayerCharacter({
  positions = [[0, 0, 0], [1, 0, 0]],
  jumpStarted = false
} = {}) {
  let index = 0;

  return {
    getPosition: vi.fn(() => positions[Math.min(index, positions.length - 1)]),
    update: vi.fn(() => {
      index = Math.min(index + 1, positions.length - 1);
    }),
    consumeJumpStarted: vi.fn(() => jumpStarted)
  };
}

function createRuntime({
  session = {},
  resolvePlayerMovementPermission = () => true,
  isMovementQuestActive = () => true,
  isRunActive = () => false,
  onPlayerMoved = vi.fn()
} = {}) {
  const playerModelRuntime = {
    startJumpFlip: vi.fn(),
    sync: vi.fn()
  };
  const companionFollowDirectionRuntime = {
    update: vi.fn()
  };
  const movementQuestRuntime = {
    update: vi.fn()
  };
  const runBreadcrumbPromptRuntime = {
    trigger: vi.fn()
  };
  const updatePlayerDustParticles = vi.fn();
  const reportMovement = vi.fn();
  const runtime = createPlayerMovementFrameRuntime({
    session,
    movementPolicy: { resolvePlayerMovementPermission },
    model: playerModelRuntime,
    followDirection: companionFollowDirectionRuntime,
    movementQuest: movementQuestRuntime,
    runBreadcrumbPrompt: runBreadcrumbPromptRuntime,
    dust: { updatePlayerDustParticles },
    callbacks: {
      isMovementQuestActive,
      isRunActive,
      reportMovement,
      onPlayerMoved
    }
  });

  return {
    runtime,
    playerModelRuntime,
    companionFollowDirectionRuntime,
    movementQuestRuntime,
    runBreadcrumbPromptRuntime,
    updatePlayerDustParticles,
    reportMovement,
    onPlayerMoved
  };
}

describe("player movement frame runtime", () => {
  it("updates player movement, model sync, follow direction, quest and dust when movement is allowed", () => {
    const playerCharacter = createPlayerCharacter({ jumpStarted: true });
    const session = {
      playerCharacter,
      playerDust: { particles: [] }
    };
    const {
      runtime,
      playerModelRuntime,
      companionFollowDirectionRuntime,
      movementQuestRuntime,
      runBreadcrumbPromptRuntime,
      updatePlayerDustParticles,
      reportMovement,
      onPlayerMoved
    } = createRuntime({ session });

    const result = runtime.update({
      deltaTime: 0.25,
      now: 1200,
      flowState: {},
      gameplayOpeningMovementLocked: false,
      gameplayOpeningCameraLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      tutorialActive: false
    });

    expect(result).toMatchObject({
      playerMovedThisFrame: true,
      canUpdatePlayerMovement: true
    });
    expect(playerCharacter.update).toHaveBeenCalledWith(0.25);
    expect(playerModelRuntime.startJumpFlip).toHaveBeenCalledWith(session);
    expect(companionFollowDirectionRuntime.update).toHaveBeenCalledWith(1, 0);
    expect(playerModelRuntime.sync).toHaveBeenCalledWith(session, 0.25, [1, 0]);
    expect(runBreadcrumbPromptRuntime.trigger).toHaveBeenCalledWith(1200);
    expect(movementQuestRuntime.update).toHaveBeenCalledWith({
      active: expect.any(Function),
      movedDistance: 1,
      reportMovement
    });
    expect(movementQuestRuntime.update.mock.calls[0][0].active()).toBe(true);
    expect(onPlayerMoved).toHaveBeenCalledWith(expect.objectContaining({
      movedDistance: 1,
      playerMovedThisFrame: true,
      previousPlayerPosition: [0, 0, 0],
      nextPlayerPosition: [1, 0, 0],
      movementDelta: [1, 0],
      gameplayOpeningCameraLocked: false,
      foundationBuildZoneCameraFocusActive: false,
      tutorialActive: false
    }));
    expect(updatePlayerDustParticles).toHaveBeenCalledWith(session.playerDust, {
      deltaTime: 0.25,
      playerPosition: [1, 0, 0],
      active: true
    });
  });

  it("syncs the idle model and inactive dust when movement is blocked", () => {
    const playerCharacter = createPlayerCharacter();
    const session = {
      playerCharacter,
      playerDust: { particles: [] }
    };
    const {
      runtime,
      playerModelRuntime,
      companionFollowDirectionRuntime,
      movementQuestRuntime,
      runBreadcrumbPromptRuntime,
      updatePlayerDustParticles,
      onPlayerMoved
    } = createRuntime({
      session,
      resolvePlayerMovementPermission: () => false
    });

    const result = runtime.update({
      deltaTime: 0.1,
      now: 500,
      flowState: { dialogueActive: true }
    });

    expect(result).toMatchObject({
      playerMovedThisFrame: false,
      canUpdatePlayerMovement: false
    });
    expect(playerCharacter.update).not.toHaveBeenCalled();
    expect(companionFollowDirectionRuntime.update).not.toHaveBeenCalled();
    expect(movementQuestRuntime.update).not.toHaveBeenCalled();
    expect(runBreadcrumbPromptRuntime.trigger).not.toHaveBeenCalled();
    expect(onPlayerMoved).not.toHaveBeenCalled();
    expect(playerModelRuntime.sync).toHaveBeenCalledWith(session, 0.1);
    expect(updatePlayerDustParticles).toHaveBeenCalledWith(session.playerDust, {
      deltaTime: 0.1,
      playerPosition: [0, 0, 0],
      active: false
    });
  });

  it("keeps run breadcrumb gated by opening, tutorial and run state", () => {
    const session = {
      playerCharacter: createPlayerCharacter(),
      playerDust: {}
    };
    const { runtime, runBreadcrumbPromptRuntime } = createRuntime({
      session,
      isRunActive: () => true
    });

    runtime.update({
      deltaTime: 0.2,
      now: 900,
      flowState: {},
      gameplayOpeningMovementLocked: false,
      tutorialActive: false
    });

    expect(runBreadcrumbPromptRuntime.trigger).not.toHaveBeenCalled();
  });
});
