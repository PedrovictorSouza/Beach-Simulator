import { describe, expect, it, vi } from "vitest";

import { updateWorldSpeechSnapshotFrame } from "../app/runtime/presentation/worldSpeechSnapshotFrame.js";

function createSnapshot() {
  return {
    worldSpeech: {
      visible: false,
      text: "",
      worldPosition: null
    }
  };
}

describe("world speech snapshot frame", () => {
  it("writes Tangrowth Pokemon Center guide speech with the existing copy", () => {
    const snapshot = createSnapshot();

    updateWorldSpeechSnapshotFrame(snapshot, {
      tangrowthPosition: [1, 0, 2],
      shouldShowTangrowthPokemonCenterSpeech: true
    });

    expect(snapshot.worldSpeech).toEqual({
      visible: true,
      text: "This way. The old Colony Terminal is ahead.",
      worldPosition: [1, 0, 2]
    });
  });

  it("uses companion lost hints before Chopper attention cues", () => {
    const snapshot = createSnapshot();
    const consumeChopperAttentionCueSoundCycle = vi.fn(() => true);
    const playChopperVoice = vi.fn();

    updateWorldSpeechSnapshotFrame(snapshot, {
      activeQuest: { id: "quest" },
      activeMoveId: "waterGun",
      now: 1200,
      chopperAttentionCue: {
        cycleId: 7,
        text: "Over here.",
        worldPosition: [8, 0, 8]
      },
      getCompanionLostHint: vi.fn(() => ({
        text: "Hydro Bot is too far.",
        worldPosition: [3, 0, 4]
      })),
      consumeChopperAttentionCueSoundCycle,
      playChopperVoice
    });

    expect(snapshot.worldSpeech).toEqual({
      visible: true,
      text: "Hydro Bot is too far.",
      worldPosition: [3, 0, 4]
    });
    expect(consumeChopperAttentionCueSoundCycle).not.toHaveBeenCalled();
    expect(playChopperVoice).not.toHaveBeenCalled();
  });

  it("plays the Chopper cue sound when a new attention cue cycle is consumed", () => {
    const snapshot = createSnapshot();
    const consumeChopperAttentionCueSoundCycle = vi.fn(() => true);
    const playChopperVoice = vi.fn();

    updateWorldSpeechSnapshotFrame(snapshot, {
      chopperAttentionCue: {
        cycleId: 42,
        text: "Look here.",
        worldPosition: [5, 0, 6]
      },
      getCompanionLostHint: () => null,
      consumeChopperAttentionCueSoundCycle,
      playChopperVoice
    });

    expect(snapshot.worldSpeech).toEqual({
      visible: true,
      text: "Look here.",
      worldPosition: [5, 0, 6]
    });
    expect(consumeChopperAttentionCueSoundCycle).toHaveBeenCalledWith(42);
    expect(playChopperVoice).toHaveBeenCalledTimes(1);
  });
});
