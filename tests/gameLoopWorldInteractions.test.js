import { describe, expect, it, vi } from "vitest";

import {
  createGameLoopWorldInteractionRuntimeBundle
} from "../app/runtime/gameLoopWorldInteractions.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";

describe("createGameLoopWorldInteractionRuntimeBundle", () => {
  it("wires repair-box reveal and workbench rotation runtimes for the game loop", () => {
    const repairBoxRevealOpeningRuntime = { id: "repair-box-reveal" };
    const workbenchRotationRuntime = { id: "workbench-rotation" };
    const createRepairBoxRevealRuntime = vi.fn(() => repairBoxRevealOpeningRuntime);
    const createWorkbenchRotationRuntime = vi.fn(() => workbenchRotationRuntime);
    const getCurrentInputModalityState = vi.fn(() => ({ device: "keyboard" }));
    const getNowSeconds = vi.fn(() => 12.5);
    const playGrowBotRevealSfx = vi.fn();
    const playSoundEvent = vi.fn();

    const result = createGameLoopWorldInteractionRuntimeBundle({
      camera: { id: "camera" },
      clamp01: (value) => value,
      controls: { id: "controls" },
      hud: { id: "hud" },
      mount: { id: "mount" },
      session: { id: "session" },
      worldCanvas: { id: "canvas" },
      callbacks: {
        getCurrentInputModalityState,
        getNowSeconds,
        playGrowBotRevealSfx,
        playSoundEvent
      },
      createRepairBoxRevealRuntime,
      createWorkbenchRotationRuntime
    });

    expect(result).toEqual({
      repairBoxRevealOpeningRuntime,
      workbenchRotationRuntime
    });
    expect(createRepairBoxRevealRuntime).toHaveBeenCalledWith({
      mount: { id: "mount" },
      worldCanvas: { id: "canvas" },
      camera: { id: "camera" },
      clamp01: expect.any(Function),
      getRepairBoxPosition: expect.any(Function),
      playRevealSfx: playGrowBotRevealSfx
    });
    expect(createWorkbenchRotationRuntime).toHaveBeenCalledWith({
      session: { id: "session" },
      controls: { id: "controls" },
      hud: { id: "hud" },
      feedback: {
        getPromptText: expect.any(Function),
        playSoundEvent,
        soundEventIds: {
          confirm: SOUND_EVENT_IDS.UI_CONFIRM,
          cancel: SOUND_EVENT_IDS.UI_CANCEL,
          navigate: SOUND_EVENT_IDS.UI_NAVIGATE
        }
      },
      solarStation: {
        getNowSeconds
      }
    });
    expect(createWorkbenchRotationRuntime.mock.calls[0][0].feedback.getPromptText())
      .toEqual(expect.any(String));
    expect(getCurrentInputModalityState).toHaveBeenCalledOnce();
  });
});
