import {
  TRAIN_HOUSE_MUSIC_FADE_DISTANCE,
  TRAIN_HOUSE_MUSIC_FULL_DISTANCE,
  TRAIN_HOUSE_MUSIC_MAX_VOLUME
} from "../gameplayPresentationTuning.js";

const DEFAULT_ACTIVATION_THRESHOLD = 0.002;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function resolveActiveTrainHousePosition({ storyState, getTrainHousePosition }) {
  if (!storyState?.flags?.campfireSpatOut) {
    return null;
  }

  return getTrainHousePosition?.() || null;
}

export function resolveTrainHouseMusicVolume({
  playerPosition,
  trainHousePosition,
  fullDistance = TRAIN_HOUSE_MUSIC_FULL_DISTANCE,
  fadeDistance = TRAIN_HOUSE_MUSIC_FADE_DISTANCE,
  maxVolume = TRAIN_HOUSE_MUSIC_MAX_VOLUME
} = {}) {
  if (!Array.isArray(playerPosition) || !Array.isArray(trainHousePosition)) {
    return 0;
  }

  const distance = Math.hypot(
    playerPosition[0] - trainHousePosition[0],
    playerPosition[2] - trainHousePosition[2]
  );
  if (!Number.isFinite(distance) || distance >= fadeDistance) {
    return 0;
  }

  if (distance <= fullDistance) {
    return maxVolume;
  }

  const proximity = 1 - ((distance - fullDistance) / Math.max(0.001, fadeDistance - fullDistance));
  const easedProximity = clamp01(proximity) * clamp01(proximity) * (3 - 2 * clamp01(proximity));
  return maxVolume * easedProximity;
}

export function createTrainHouseMusicRuntime({
  audio,
  getPlayerPosition,
  getStoryState,
  getTrainHousePosition,
  getMusicRuntime,
  musicRuntime = null,
  activationThreshold = DEFAULT_ACTIVATION_THRESHOLD
} = {}) {
  function update(nowSeconds = 0) {
    const playerPosition = getPlayerPosition?.() || null;
    const trainHousePosition = resolveActiveTrainHousePosition({
      storyState: getStoryState?.(),
      getTrainHousePosition
    });
    const volume = resolveTrainHouseMusicVolume({
      playerPosition,
      trainHousePosition
    });
    const active = volume > activationThreshold;

    audio.updateTrainHouseMusic({
      active,
      volume
    });
    const activeMusicRuntime = getMusicRuntime?.() || musicRuntime;
    activeMusicRuntime?.reportObjectMusicActivity?.({
      active,
      nowSeconds
    });

    return {
      active,
      volume
    };
  }

  return {
    update
  };
}
