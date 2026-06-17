import { describe, expect, it, vi } from "vitest";
import { createGameplayAudioRuntimeBundle } from "../app/runtime/audio/gameplayAudioRuntimeBundle.js";

describe("createGameplayAudioRuntimeBundle", () => {
  it("wires gameplay audio volume, sound events and frame music updates", () => {
    const updatePlayerDriving = vi.fn();
    const audio = {
      updatePlayerDriving
    };
    const trainHouseMusicRuntime = {
      update: vi.fn()
    };
    const musicRuntime = {
      update: vi.fn()
    };
    const gameplay = {
      audioMixRuntime: {
        getMusicVolumeScale: () => 0.4,
        getSfxVolumeScale: () => 0.25
      },
      musicRuntime,
      playSoundEvent: vi.fn()
    };
    const session = {
      campfire: {
        position: [2, 0, 3]
      },
      playerCharacter: {
        getPosition: () => [1, 0, 1]
      }
    };
    const controls = {
      storyState: {
        flags: {
          campfireSpatOut: true
        }
      }
    };
    const createAudioRuntime = vi.fn((options) => {
      expect(options.getMusicVolumeScale()).toBe(0.4);
      expect(options.getSfxVolumeScale()).toBe(0.25);
      options.playSoundEvent("ui.confirm", { volume: 0.5 });
      return audio;
    });
    const createTrainHouseMusic = vi.fn((options) => {
      expect(options.audio).toBe(audio);
      expect(options.getMusicRuntime()).toBe(musicRuntime);
      expect(options.getPlayerPosition()).toEqual([1, 0, 1]);
      expect(options.getStoryState()).toBe(controls.storyState);
      expect(options.getTrainHousePosition()).toEqual([2, 0, 3]);
      return trainHouseMusicRuntime;
    });

    const bundle = createGameplayAudioRuntimeBundle({
      controls,
      createAudioRuntime,
      createTrainHouseMusic,
      gameplay,
      session
    });

    expect(bundle.audio).toBe(audio);
    expect(bundle.trainHouseMusicRuntime).toBe(trainHouseMusicRuntime);
    expect(gameplay.playSoundEvent).toHaveBeenCalledWith("ui.confirm", { volume: 0.5 });

    bundle.playSoundEvent("ui.cancel");
    expect(gameplay.playSoundEvent).toHaveBeenCalledWith("ui.cancel", undefined);

    bundle.updateFrameAudio({
      deltaTime: 0.016,
      gameplayOpeningCameraFrame: { phase: "player-exit" },
      now: 2500,
      playerMovedThisFrame: false
    });

    expect(updatePlayerDriving).toHaveBeenCalledWith({ active: true });
    expect(trainHouseMusicRuntime.update).toHaveBeenCalledWith(2.5);
    expect(musicRuntime.update).toHaveBeenCalledWith(0.016, { nowSeconds: 2.5 });
  });

  it("falls back to neutral volume scales when audio mix runtime is missing", () => {
    const createAudioRuntime = vi.fn((options) => {
      expect(options.getMusicVolumeScale()).toBe(1);
      expect(options.getSfxVolumeScale()).toBe(1);
      return {
        updatePlayerDriving: vi.fn()
      };
    });

    createGameplayAudioRuntimeBundle({
      createAudioRuntime,
      createTrainHouseMusic: () => ({ update: vi.fn() }),
      gameplay: {},
      session: {}
    });

    expect(createAudioRuntime).toHaveBeenCalledTimes(1);
  });
});
