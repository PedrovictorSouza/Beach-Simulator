import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopScenePresentationRuntimeBundle
} from "../app/runtime/gameLoopScenePresentation.js";

describe("createGameLoopScenePresentationRuntimeBundle", () => {
  it("wires construction presentation and NPC focus runtimes for the game loop", () => {
    const constructionPresentationBundle = {
      constructionHelperMotionRuntime: { id: "helper" },
      constructionHouseModelInstanceRuntime: { id: "houses" },
      leafDenConstructionPresentationRuntime: { id: "leaf-den" }
    };
    const npcConversationFocusRuntime = { id: "npc-focus" };
    const createConstructionPresentationRuntime =
      vi.fn(() => constructionPresentationBundle);
    const createNpcFocusRuntime = vi.fn(() => npcConversationFocusRuntime);
    const companionFacingRuntime = {
      getRobotModelYawToward: vi.fn(),
      getSquirtleModelYawToward: vi.fn()
    };
    const session = {
      actTwoSquirtle: { id: "squirtle" }
    };
    const getNowMs = vi.fn(() => 1000);
    const getNowSeconds = vi.fn(() => 1);

    const result = createGameLoopScenePresentationRuntimeBundle({
      companionFacingRuntime,
      controls: { id: "controls" },
      dialogueCamera: { id: "dialogue-camera" },
      gameplayDialogue: { id: "dialogue" },
      session,
      workbenchRotationRuntime: { id: "rotation" },
      callbacks: {
        getNowMs,
        getNowSeconds
      },
      createConstructionPresentationRuntime,
      createNpcFocusRuntime
    });

    expect(result).toEqual({
      ...constructionPresentationBundle,
      npcConversationFocusRuntime
    });
    expect(createConstructionPresentationRuntime).toHaveBeenCalledWith({
      controls: { id: "controls" },
      session,
      workbenchRotationRuntime: { id: "rotation" },
      callbacks: {
        applyTrainHouseDance: expect.any(Function),
        applyPlacementSpawn: expect.any(Function),
        getRobotModelYawToward: companionFacingRuntime.getRobotModelYawToward,
        isWorldPositionWithinRenderDistance: expect.any(Function)
      },
      getNowMs,
      getNowSeconds
    });
    expect(createNpcFocusRuntime).toHaveBeenCalledWith({
      controls: { id: "controls" },
      dialogueCamera: { id: "dialogue-camera" },
      gameplayDialogue: { id: "dialogue" },
      getSquirtle: expect.any(Function),
      getSquirtleModelYawToward: companionFacingRuntime.getSquirtleModelYawToward,
      getYawToward: expect.any(Function)
    });
    expect(createNpcFocusRuntime.mock.calls[0][0].getSquirtle())
      .toBe(session.actTwoSquirtle);
  });
});
