import { describe, expect, it } from "vitest";

import {
  createCompanionWorldSpeechCueRuntime,
  createGameplayCompanionWorldSpeechCueRuntime
} from "../app/runtime/companions/companionWorldSpeechCueRuntime.js";

function createRuntime(overrides = {}) {
  return createCompanionWorldSpeechCueRuntime({
    chopperCueSchedule: {
      initialDelayMs: 100,
      repeatMs: 300,
      durationMs: 80
    },
    companionLostHintSchedule: {
      initialDelayMs: 100,
      repeatMs: 300,
      durationMs: 80
    },
    getFlags: () => ({}),
    getPlayerSkills: () => ({ waterGun: true }),
    getBulbasaurPosition: () => [3, 0, 4],
    getSquirtlePosition: () => [1, 0, 2],
    isPlayerNearWorldPosition: () => false,
    config: {
      chopperInteractDistance: 2,
      chopperCueText: "Hey!",
      restoreTargetCount: 10,
      squirtleHintText: "Use Hydro Bot",
      bulbasaurHintText: "Switch to Hydro Bot"
    },
    ...overrides
  });
}

describe("createCompanionWorldSpeechCueRuntime", () => {
  it("resolves and schedules Chopper attention cues from active task state", () => {
    const runtime = createRuntime();
    const chopperPosition = [8, 0, 9];
    const frame = {
      activeTask: { id: "wake-guide" },
      activeSystemQuest: null,
      chopperPosition
    };

    expect(runtime.getChopperAttentionCue({ ...frame, now: 10 })).toBeNull();
    expect(runtime.getChopperAttentionCue({ ...frame, now: 110 })).toEqual({
      text: "Hey!",
      worldPosition: chopperPosition,
      cycleId: 1
    });
    expect(runtime.consumeChopperAttentionCueSoundCycle(1)).toBe(true);
    expect(runtime.consumeChopperAttentionCueSoundCycle(1)).toBe(false);
  });

  it("resolves and schedules companion lost hints from quest and active move state", () => {
    const runtime = createRuntime();
    const frame = {
      activeQuest: { id: "water-dry-grass" },
      activeMoveId: "leafage"
    };

    expect(runtime.getCompanionLostHint({ ...frame, now: 10 })).toBeNull();
    expect(runtime.getCompanionLostHint({ ...frame, now: 110 })).toEqual({
      key: "bulbasaur-switch-to-squirtle",
      text: "Switch to Hydro Bot",
      worldPosition: [3, 0, 4]
    });
  });

  it("does not expose cues when their source policy resolves to nothing", () => {
    const runtime = createRuntime({
      isPlayerNearWorldPosition: () => true,
      getPlayerSkills: () => ({ waterGun: false })
    });

    expect(runtime.getChopperAttentionCue({
      activeTask: { id: "wake-guide" },
      activeSystemQuest: null,
      chopperPosition: [8, 0, 9],
      now: 110
    })).toBeNull();
    expect(runtime.getCompanionLostHint({
      activeQuest: { id: "water-dry-grass" },
      activeMoveId: null,
      now: 110
    })).toBeNull();
  });
});

describe("createGameplayCompanionWorldSpeechCueRuntime", () => {
  it("wires gameplay session state into companion world-speech cues", () => {
    const runtime = createGameplayCompanionWorldSpeechCueRuntime({
      controls: {
        storyState: { flags: {} },
        playerSkills: { waterGun: true }
      },
      session: {
        bulbasaurEncounter: { position: [3, 0, 4] }
      },
      fieldMoveActorPositionRuntime: {
        getSquirtleWorldPosition: () => [1, 0, 2]
      },
      worldSceneSyncRuntime: {
        isPlayerNearWorldPosition: () => false
      },
      config: {
        chopperInteractDistance: 2,
        restoreTargetCount: 10
      }
    });

    const chopperCueFrame = {
      activeTask: { id: "wake-guide" },
      activeSystemQuest: null,
      chopperPosition: [8, 0, 9]
    };
    expect(runtime.getChopperAttentionCue({
      ...chopperCueFrame,
      now: 0
    })).toBeNull();
    expect(runtime.getChopperAttentionCue({
      ...chopperCueFrame,
      now: 4300
    })).toEqual({
      text: "Hey!",
      worldPosition: [8, 0, 9],
      cycleId: 1
    });

    const lostHintFrame = {
      activeQuest: { id: "water-dry-grass" },
      activeMoveId: "leafage"
    };
    expect(runtime.getCompanionLostHint({
      ...lostHintFrame,
      now: 0
    })).toBeNull();
    expect(runtime.getCompanionLostHint({
      ...lostHintFrame,
      now: 5300
    })).toEqual({
      key: "bulbasaur-switch-to-squirtle",
      text: "Press Left to change to Hydro Bot.",
      worldPosition: [3, 0, 4]
    });
  });
});
