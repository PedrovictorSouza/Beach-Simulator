const WATER_DROP_SFX_URL = new URL("../soundFx/water-drop..mp3", import.meta.url).href;
const PLAYER_DRIVING_SFX_URL = new URL("../soundFx/driving.mp3", import.meta.url).href;
const SHIP_IMPACT_SFX_URL = new URL("../soundFx/impact.mp3", import.meta.url).href;
const SHIP_FALL_SFX_URL = new URL("../soundFx/cartoon-fall.mp3", import.meta.url).href;
const WOOD_GRAB_SFX_URL = new URL("../soundFx/grab.mp3", import.meta.url).href;
const INSTANCE_OBJECT_SFX_URL = new URL("../soundFx/instance-object.mp3", import.meta.url).href;
const TRAIN_HOUSE_MUSIC_URL = new URL("../soundFx/train-house-music.mp3", import.meta.url).href;
const FIRE_FLAME_SFX_URL = new URL("../soundFx/fireflame.mp3", import.meta.url).href;
const TREE_BIRTH_SFX_URL = new URL("../soundFx/tree-birth.mp3", import.meta.url).href;

const SQUIRTLE_WATER_GUN_SFX_INTERVAL = 0.3;
const SQUIRTLE_WATER_GUN_SFX_VOLUME = 0.638;
const PLAYER_DRIVING_SFX_VOLUME = 0.528;
const SHIP_IMPACT_SFX_VOLUME = 0.814;
const SHIP_FALL_SFX_VOLUME = 0.55;
const WOOD_GRAB_SFX_VOLUME = 0.748;
const INSTANCE_OBJECT_SFX_VOLUME = 0.726;
const FIELD_MOVE_INVALID_SFX_VOLUME = 0.34;
const FIRE_FLAME_SFX_VOLUME = 0.78;
const TREE_BIRTH_SFX_VOLUME = 0.74;
const GROW_BOT_REVEAL_PLACEHOLDER_SFX_VOLUME = 0.82;
const TRAIN_HOUSE_MUSIC_MAX_VOLUME = 0.74;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function getRuntimeNowSeconds() {
  const nowMs =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();

  return nowMs * 0.001;
}

function createRepeatingSfxController({
  src,
  interval = 0,
  volume = 1,
  volumeScale = () => 1
} = {}) {
  const audioPool = [];
  let nextPlayAt = 0;

  function getEffectiveVolume() {
    const scale = typeof volumeScale === "function" ? volumeScale() : volumeScale;
    return clamp01(volume * (Number.isFinite(Number(scale)) ? Number(scale) : 1));
  }

  function createAudio() {
    if (!src || typeof Audio !== "function") {
      return null;
    }

    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = getEffectiveVolume();
    return audio;
  }

  function getAudio() {
    const availableAudio = audioPool.find((audio) => audio.paused || audio.ended);

    if (availableAudio) {
      return availableAudio;
    }

    const audio = createAudio();
    if (!audio) {
      return null;
    }

    audioPool.push(audio);
    return audio;
  }

  function playOnce() {
    const audio = getAudio();
    if (!audio) {
      return;
    }

    audio.loop = false;
    audio.volume = getEffectiveVolume();

    try {
      audio.currentTime = 0;
    } catch {
      // Browser can reject seeking before metadata is ready.
    }

    const playResult = audio.play?.();
    if (playResult?.catch) {
      playResult.catch(() => {});
    }
  }

  return {
    update({ active, nowSeconds = getRuntimeNowSeconds() } = {}) {
      if (!active) {
        nextPlayAt = 0;
        return;
      }

      if (nowSeconds < nextPlayAt) {
        return;
      }

      playOnce();
      nextPlayAt = nowSeconds + interval;
    },

    play(nowSeconds = getRuntimeNowSeconds()) {
      this.update({ active: true, nowSeconds });
    }
  };
}

function createLoopingSfxController({
  src,
  volume = 1,
  volumeScale = () => 1
} = {}) {
  let audio = null;
  let activeLastFrame = false;

  function getEffectiveVolume(nextVolume = volume) {
    const scale = typeof volumeScale === "function" ? volumeScale() : volumeScale;
    return clamp01(nextVolume * (Number.isFinite(Number(scale)) ? Number(scale) : 1));
  }

  function getAudio() {
    if (audio || !src || typeof Audio !== "function") {
      return audio;
    }

    audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = getEffectiveVolume();
    return audio;
  }

  function play(nextVolume = volume) {
    const loopAudio = getAudio();
    if (!loopAudio) {
      return;
    }

    loopAudio.loop = true;
    loopAudio.volume = getEffectiveVolume(nextVolume);

    if (activeLastFrame) {
      return;
    }

    const playResult = loopAudio.play?.();
    if (playResult?.catch) {
      playResult.catch(() => {});
    }
  }

  function stop() {
    if (!audio || !activeLastFrame) {
      return;
    }

    audio.pause?.();

    try {
      audio.currentTime = 0;
    } catch {
      // Browser can reject seeking before metadata is ready.
    }
  }

  return {
    update({ active, volume: nextVolume = volume } = {}) {
      if (active) {
        play(nextVolume);
      } else {
        stop();
      }

      activeLastFrame = Boolean(active);
    }
  };
}

export function createGameplayAudioRuntime({
  getSfxVolumeScale = () => 1,
  getMusicVolumeScale = () => 1,
  playSoundEvent = () => {}
} = {}) {
  const waterGun = createRepeatingSfxController({
    src: WATER_DROP_SFX_URL,
    interval: SQUIRTLE_WATER_GUN_SFX_INTERVAL,
    volume: SQUIRTLE_WATER_GUN_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const playerDriving = createLoopingSfxController({
    src: PLAYER_DRIVING_SFX_URL,
    volume: PLAYER_DRIVING_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const shipFall = createLoopingSfxController({
    src: SHIP_FALL_SFX_URL,
    volume: SHIP_FALL_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const trainHouseMusic = createLoopingSfxController({
    src: TRAIN_HOUSE_MUSIC_URL,
    volume: TRAIN_HOUSE_MUSIC_MAX_VOLUME,
    volumeScale: getMusicVolumeScale
  });

  const shipImpact = createRepeatingSfxController({
    src: SHIP_IMPACT_SFX_URL,
    interval: Number.POSITIVE_INFINITY,
    volume: SHIP_IMPACT_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const woodGrab = createRepeatingSfxController({
    src: WOOD_GRAB_SFX_URL,
    interval: 0,
    volume: WOOD_GRAB_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const instanceObject = createRepeatingSfxController({
    src: INSTANCE_OBJECT_SFX_URL,
    interval: 0,
    volume: INSTANCE_OBJECT_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const fieldMoveInvalid = createRepeatingSfxController({
    src: SHIP_IMPACT_SFX_URL,
    interval: 0.14,
    volume: FIELD_MOVE_INVALID_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const fireFlame = createRepeatingSfxController({
    src: FIRE_FLAME_SFX_URL,
    interval: Number.POSITIVE_INFINITY,
    volume: FIRE_FLAME_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const treeBirth = createRepeatingSfxController({
    src: TREE_BIRTH_SFX_URL,
    interval: 0,
    volume: TREE_BIRTH_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  const growBotReveal = createRepeatingSfxController({
    src: TREE_BIRTH_SFX_URL,
    interval: Number.POSITIVE_INFINITY,
    volume: GROW_BOT_REVEAL_PLACEHOLDER_SFX_VOLUME,
    volumeScale: getSfxVolumeScale
  });

  return {
    playSoundEvent,

    playInstanceObject() {
      instanceObject.play();
    },

    playFieldMoveInvalid() {
      fieldMoveInvalid.play();
    },

    playTreeBirth() {
      treeBirth.play();
    },

    playGrowBotReveal() {
      growBotReveal.play();
    },

    playWoodGrab() {
      woodGrab.play();
    },

    playShipImpact(nowSeconds = getRuntimeNowSeconds()) {
      shipImpact.play(nowSeconds);
    },

    updateWaterGun({ active, nowSeconds } = {}) {
      waterGun.update({ active, nowSeconds });
    },

    updatePlayerDriving({ active } = {}) {
      playerDriving.update({ active });
    },

    updateShipFall({ active } = {}) {
      shipFall.update({ active });
    },

    updateFireFlame({ active, nowSeconds } = {}) {
      fireFlame.update({ active, nowSeconds });
    },

    updateTrainHouseMusic({ active, volume = TRAIN_HOUSE_MUSIC_MAX_VOLUME } = {}) {
      trainHouseMusic.update({ active, volume });
    }
  };
}