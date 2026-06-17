import { createGameplayAudioRuntime } from "../gameplayAudioRuntime.js";
import { createTrainHouseMusicRuntime } from "./trainHouseMusicRuntime.js";

export function createGameplayAudioRuntimeBundle({
  controls = {},
  createAudioRuntime = createGameplayAudioRuntime,
  createTrainHouseMusic = createTrainHouseMusicRuntime,
  gameplay = {},
  session = {}
} = {}) {
  const getSfxVolumeScale = () => gameplay?.audioMixRuntime?.getSfxVolumeScale?.() ?? 1;
  const getMusicVolumeScale = () => gameplay?.audioMixRuntime?.getMusicVolumeScale?.() ?? 1;
  const playSoundEvent = (eventId, options) => {
    gameplay?.playSoundEvent?.(eventId, options);
  };

  const audio = createAudioRuntime({
    getSfxVolumeScale,
    getMusicVolumeScale,
    playSoundEvent
  });

  const trainHouseMusicRuntime = createTrainHouseMusic({
    audio,
    getPlayerPosition: () => session.playerCharacter?.getPosition?.() || null,
    getStoryState: () => controls.storyState,
    getTrainHousePosition: () => session.campfire?.position || null,
    getMusicRuntime: () => gameplay.musicRuntime
  });

  function updateFrameAudio({
    deltaTime,
    gameplayOpeningCameraFrame,
    now,
    playerMovedThisFrame
  }) {
    audio.updatePlayerDriving({
      active: playerMovedThisFrame || gameplayOpeningCameraFrame?.phase === "player-exit"
    });
    const nowSeconds = now * 0.001;
    trainHouseMusicRuntime.update(nowSeconds);
    gameplay.musicRuntime?.update?.(deltaTime, { nowSeconds });
  }

  return {
    audio,
    playSoundEvent,
    trainHouseMusicRuntime,
    updateFrameAudio
  };
}
