import { describe, expect, it } from "vitest";

import { updateHudSnapshotFrame } from "../app/runtime/presentation/hudSnapshotFrame.js";

function createFrame() {
  return {
    hud: {
      active: false,
      storyState: null,
      inventory: null,
      playerPosition: [0, 0, 0],
      promptCopy: "",
      inputModalityState: null,
      statusMessage: ""
    }
  };
}

describe("HUD snapshot frame", () => {
  it("writes HUD snapshot data when no blocker is active", () => {
    const nextFrame = createFrame();
    const storyState = { flags: { introComplete: true } };
    const inventory = { wood: 2 };
    const inputModalityState = { device: "keyboard" };

    updateHudSnapshotFrame(nextFrame, {
      storyState,
      inventory,
      playerPosition: [1, 0.04, 2],
      promptCopy: "press E",
      inputModalityState
    });

    expect(nextFrame.hud).toEqual({
      active: true,
      storyState,
      inventory,
      playerPosition: [1, 0.04, 2],
      promptCopy: "press E",
      inputModalityState,
      statusMessage: "press E"
    });
  });

  it("does not mutate HUD data while a blocker is active", () => {
    const nextFrame = createFrame();

    updateHudSnapshotFrame(nextFrame, {
      storyState: { flags: {} },
      inventory: { wood: 2 },
      playerPosition: [1, 0.04, 2],
      promptCopy: "press E",
      inputModalityState: {},
      tutorialActive: true
    });

    expect(nextFrame.hud).toEqual(createFrame().hud);
  });
});
