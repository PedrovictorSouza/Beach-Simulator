import { describe, expect, it, vi } from "vitest";

import { createNpcConversationFocusRuntime } from "../app/runtime/npcs/npcConversationFocusRuntime.js";

function createRuntime(overrides = {}) {
  const dialogueCamera = {
    focusNpcConversation: vi.fn(),
    ...overrides.dialogueCamera
  };
  const gameplayDialogue = {
    isActive: vi.fn(() => true),
    ...overrides.gameplayDialogue
  };
  const controls = {
    isScriptedInteractionActive: vi.fn(() => false),
    ...overrides.controls
  };
  const squirtle = {
    position: [2, 0, 3],
    modelInstance: {
      yaw: 0
    },
    ...overrides.squirtle
  };
  const scheduled = [];
  const runtime = createNpcConversationFocusRuntime({
    controls,
    dialogueCamera,
    gameplayDialogue,
    getSquirtle: () => squirtle,
    getSquirtleModelYawToward: vi.fn(() => 1.25),
    getYawToward: vi.fn(() => 0.75),
    scheduleMicrotask: (callback) => scheduled.push(callback),
    ...overrides.runtimeOptions
  });

  return {
    controls,
    dialogueCamera,
    gameplayDialogue,
    runtime,
    scheduled,
    squirtle
  };
}

describe("createNpcConversationFocusRuntime", () => {
  it("faces NPC actors toward the player", () => {
    const { runtime } = createRuntime();
    const actor = {
      id: "tangrowth",
      character: {
        getPosition: vi.fn(() => [1, 0, 2]),
        faceToward: vi.fn()
      },
      faceYaw: 0
    };
    const playerPosition = [3, 0, 4];

    runtime.faceTargetTowardPlayer({
      targetId: "tangrowth",
      playerPosition,
      npcActors: [actor]
    });

    expect(actor.character.faceToward).toHaveBeenCalledWith(playerPosition);
    expect(actor.faceYaw).toBe(0.75);
  });

  it("faces the Squirtle interactable model toward the player", () => {
    const { runtime, squirtle } = createRuntime();

    runtime.faceTargetTowardPlayer({
      targetId: "squirtle",
      playerPosition: [6, 0, 7],
      interactables: [{ id: "squirtle" }]
    });

    expect(squirtle.modelInstance.yaw).toBe(1.25);
  });

  it("faces the target immediately and focuses the camera after dialogue opens", () => {
    const { dialogueCamera, runtime, scheduled } = createRuntime();
    const actor = {
      id: "professor",
      character: {
        getPosition: () => [0, 0, 0],
        faceToward: vi.fn()
      }
    };
    const payload = {
      targetId: "professor",
      playerPosition: [1, 0, 1],
      npcActors: [actor],
      interactables: [],
      targetPosition: [0, 0, 0]
    };

    runtime.handleInteractionStart(payload);

    expect(actor.character.faceToward).toHaveBeenCalledWith(payload.playerPosition);
    expect(dialogueCamera.focusNpcConversation).not.toHaveBeenCalled();

    scheduled[0]();

    expect(dialogueCamera.focusNpcConversation).toHaveBeenCalledWith(payload);
  });

  it("does not focus the camera for scripted interactions", () => {
    const { dialogueCamera, runtime, scheduled } = createRuntime({
      controls: {
        isScriptedInteractionActive: vi.fn(() => true)
      }
    });

    runtime.handleInteractionStart({
      targetId: "professor",
      playerPosition: [1, 0, 1],
      npcActors: [],
      interactables: [],
      targetPosition: [0, 0, 0]
    });

    expect(scheduled).toEqual([]);
    expect(dialogueCamera.focusNpcConversation).not.toHaveBeenCalled();
  });

  it("skips scheduled camera focus when dialogue is no longer active", () => {
    const { dialogueCamera, runtime, scheduled } = createRuntime({
      gameplayDialogue: {
        isActive: vi.fn(() => false)
      }
    });

    runtime.focusWhenDialogueOpens({
      targetId: "professor",
      playerPosition: [1, 0, 1],
      npcActors: [],
      interactables: [],
      targetPosition: [0, 0, 0]
    });

    scheduled[0]();

    expect(dialogueCamera.focusNpcConversation).not.toHaveBeenCalled();
  });
});
