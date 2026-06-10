import { describe, expect, it, vi } from "vitest";

import { processFollowerCallFrame } from "../app/runtime/companions/followerCallFrame.js";
import { SOUND_EVENT_IDS } from "../app/runtime/soundEventRuntime.js";
import { SANDBOTS_BOT_NAMES } from "../app/story/sandbotsLexicon.js";

function createControls({
  consumeFollowerCallRequest = () => true,
  flags = {}
} = {}) {
  return {
    consumeFollowerCallRequest,
    storyState: {
      flags: {
        leafDenKitPlaced: false,
        leafDenConstructionStarted: false,
        timburrRevealed: false,
        charmanderRevealed: false,
        charmanderCampfireLit: false,
        charmanderCelebrationSuggested: false,
        charmanderCelebrationComplete: false,
        ...flags
      }
    }
  };
}

describe("follower call frame", () => {
  it("does nothing when no follower call was requested", () => {
    const controls = createControls({
      consumeFollowerCallRequest: vi.fn(() => false)
    });
    const playSoundEvent = vi.fn();
    const pushNotice = vi.fn();

    processFollowerCallFrame({
      controls,
      session: {},
      pushNotice,
      playSoundEvent
    });

    expect(playSoundEvent).not.toHaveBeenCalled();
    expect(pushNotice).not.toHaveBeenCalled();
  });

  it("calls revealed construction helpers for the leaf den kit", () => {
    const controls = createControls({
      flags: {
        leafDenKitPlaced: true,
        timburrRevealed: true,
        charmanderRevealed: true
      }
    });
    const playSoundEvent = vi.fn();
    const pushNotice = vi.fn();

    processFollowerCallFrame({
      controls,
      session: {},
      pushNotice,
      playSoundEvent
    });

    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.BOT_SIGNAL);
    expect(controls.storyState.flags.timburrFollowing).toBe(true);
    expect(controls.storyState.flags.charmanderFollowing).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith(
      `${SANDBOTS_BOT_NAMES.builder} and ${SANDBOTS_BOT_NAMES.thermal} are following you.`
    );
  });

  it("calls Thermal Bot to the campfire when available", () => {
    const controls = createControls({
      flags: {
        charmanderRevealed: true,
        charmanderCampfireLit: false
      }
    });
    const playSoundEvent = vi.fn();
    const pushNotice = vi.fn();

    processFollowerCallFrame({
      controls,
      session: { campfire: {} },
      pushNotice,
      playSoundEvent
    });

    expect(playSoundEvent).toHaveBeenCalledWith(SOUND_EVENT_IDS.BOT_SIGNAL);
    expect(controls.storyState.flags.charmanderFollowing).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith(
      `${SANDBOTS_BOT_NAMES.thermal} is following you.`
    );
  });
});
