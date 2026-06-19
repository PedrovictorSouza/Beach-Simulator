import { describe, expect, it, vi } from "vitest";

import { createGameLoopAudioCallbacks } from "../app/runtime/gameLoopAudioCallbacks.js";

describe("createGameLoopAudioCallbacks", () => {
  it("forwards named game-loop sound callbacks to the audio runtime", () => {
    const audio = {
      playInstanceObject: vi.fn(),
      playTreeBirth: vi.fn(),
      playGrowBotReveal: vi.fn()
    };
    const callbacks = createGameLoopAudioCallbacks(audio);

    callbacks.playInstanceObjectSfx();
    callbacks.playTreeBirthSfx();
    callbacks.playGrowBotRevealSfx();

    expect(audio.playInstanceObject).toHaveBeenCalledOnce();
    expect(audio.playTreeBirth).toHaveBeenCalledOnce();
    expect(audio.playGrowBotReveal).toHaveBeenCalledOnce();
  });
});
