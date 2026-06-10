import { describe, expect, it, vi } from "vitest";

import { prepareWorldSpaceUiFrameContext } from "../app/runtime/presentation/worldSpaceUiFrameContext.js";

describe("world space UI frame context", () => {
  it("resolves Tangrowth position and applies the Workbench arrow cue when UI can be shown", () => {
    const workbenchGreenArrowModelInstance = { id: "arrow" };
    const tangrowthPosition = [1, 0, 2];
    const resolveWorldSpaceUiVisibility = vi.fn(() => true);
    const shouldShowWorkbenchGreenArrowCue = vi.fn(() => true);
    const applyWorkbenchGreenArrowCue = vi.fn();

    const result = prepareWorldSpaceUiFrameContext({
      now: 1234,
      session: {
        npcActors: [
          { id: "chopper", character: { getPosition: () => [0, 0, 0] } },
          { id: "tangrowth", character: { getPosition: () => tangrowthPosition } }
        ],
        workbenchGreenArrowModelInstance
      },
      storyState: { flags: {} },
      activeQuest: { id: "quest" },
      activeTask: { id: "task" },
      activeSystemQuest: { id: "system" },
      gameplayOpeningCameraLocked: false,
      flowState: { gameplayActive: true },
      resolveWorldSpaceUiVisibility,
      shouldShowWorkbenchGreenArrowCue,
      applyWorkbenchGreenArrowCue
    });

    expect(result).toEqual({
      canShowWorldSpaceUi: true,
      tangrowthPosition
    });
    expect(resolveWorldSpaceUiVisibility).toHaveBeenCalledWith({
      gameplayOpeningCameraLocked: false,
      flowState: { gameplayActive: true }
    });
    expect(shouldShowWorkbenchGreenArrowCue).toHaveBeenCalledWith({
      activeQuest: { id: "quest" },
      activeTask: { id: "task" },
      activeSystemQuest: { id: "system" },
      storyState: { flags: {} }
    });
    expect(applyWorkbenchGreenArrowCue).toHaveBeenCalledWith(
      workbenchGreenArrowModelInstance,
      {
        active: true,
        now: 1234
      }
    );
  });

  it("keeps the Workbench arrow inactive when world-space UI is hidden", () => {
    const applyWorkbenchGreenArrowCue = vi.fn();

    const result = prepareWorldSpaceUiFrameContext({
      now: 2000,
      session: {
        npcActors: [],
        workbenchGreenArrowModelInstance: "arrow"
      },
      storyState: { flags: {} },
      gameplayOpeningCameraLocked: true,
      flowState: { gameplayActive: true },
      resolveWorldSpaceUiVisibility: () => false,
      shouldShowWorkbenchGreenArrowCue: () => true,
      applyWorkbenchGreenArrowCue
    });

    expect(result).toEqual({
      canShowWorldSpaceUi: false,
      tangrowthPosition: null
    });
    expect(applyWorkbenchGreenArrowCue).toHaveBeenCalledWith("arrow", {
      active: false,
      now: 2000
    });
  });
});
