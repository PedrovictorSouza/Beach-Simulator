export const SOUND_IDS = Object.freeze({
  START_SCREEN_MUSIC: "start-screen-music",
  IN_GAME_MUSIC: "in-game-music",
  START_BUTTON: "start-button",
  LANGUAGE_CHOICE: "language-choice",
  DAY_1_INTRO: "day-1-intro",
  DEFAULT_BUTTON: "default-button",
  POP: "pop",
  ONBOARDING_ALERT: "onboarding-alert",
  BEACH_AMBIENCE: "beach-ambience",
  CASH: "cash",
  TASK_DONE: "task-done",
  NEW_DAY: "new-day",
  INCREMENT: "increment",
  COMPLAINT: "complaint",
  LETTER_INCREMENT: "letter-increment"
});

const SOUND_URLS = Object.freeze({
  [SOUND_IDS.START_SCREEN_MUSIC]: new URL(
    "../sounds/music/start-screen-music.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.IN_GAME_MUSIC]: new URL(
    "../sounds/music/in-game-music.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.START_BUTTON]: new URL(
    "../sounds/sfx/start-btn.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.LANGUAGE_CHOICE]: new URL(
    "../sounds/sfx/choose-lg-btn.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.DAY_1_INTRO]: new URL(
    "../sounds/sfx/day-1.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.DEFAULT_BUTTON]: new URL(
    "../sounds/sfx/default-btn.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.POP]: new URL(
    "../sounds/sfx/pop.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.ONBOARDING_ALERT]: new URL(
    "../sounds/sfx/alert.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.BEACH_AMBIENCE]: new URL(
    "../sounds/sfx/beach-1.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.CASH]: new URL(
    "../sounds/sfx/cash.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.TASK_DONE]: new URL(
    "../sounds/sfx/task-done.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.NEW_DAY]: new URL(
    "../sounds/sfx/new-day.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.INCREMENT]: new URL(
    "../sounds/sfx/increment.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.COMPLAINT]: new URL(
    "../sounds/sfx/complaint.mp3",
    import.meta.url
  ).href,
  [SOUND_IDS.LETTER_INCREMENT]: new URL(
    "../sounds/sfx/letter-increment.mp3",
    import.meta.url
  ).href
});

const SOUND_CHANNELS = Object.freeze({
  MUSIC: "music",
  SFX: "sfx"
});
const MUSIC_SOUND_IDS = new Set([
  SOUND_IDS.START_SCREEN_MUSIC,
  SOUND_IDS.IN_GAME_MUSIC
]);

function getSoundChannel(soundId) {
  return MUSIC_SOUND_IDS.has(soundId) ?
    SOUND_CHANNELS.MUSIC :
    SOUND_CHANNELS.SFX;
}

export function createSoundManager({ windowRef = globalThis } = {}) {
  const loopAudioById = new Map();
  const requestedLoopIds = new Set();
  const activeOneShotAudio = new Map();
  let musicMuted = false;
  let sfxMuted = false;
  let suspended = false;

  const getSnapshot = () => Object.freeze({
    musicMuted,
    sfxMuted,
    suspended
  });
  const isChannelMuted = (channel) => (
    channel === SOUND_CHANNELS.MUSIC ? musicMuted : sfxMuted
  );

  const play = (soundId) => {
    const soundUrl = SOUND_URLS[soundId];
    const AudioConstructor = windowRef?.Audio;
    const channel = getSoundChannel(soundId);

    if (
      !soundUrl ||
      typeof AudioConstructor !== "function" ||
      suspended ||
      isChannelMuted(channel)
    ) {
      return false;
    }

    const audio = new AudioConstructor(soundUrl);
    const forgetAudio = () => activeOneShotAudio.delete(audio);

    audio.preload = "auto";
    activeOneShotAudio.set(audio, channel);
    audio.addEventListener?.("ended", forgetAudio, { once: true });
    audio.addEventListener?.("error", forgetAudio, { once: true });

    try {
      const playback = audio.play();
      playback?.catch?.(forgetAudio);
    } catch {
      forgetAudio();
      return false;
    }

    return true;
  };

  const playLoop = (soundId) => {
    const soundUrl = SOUND_URLS[soundId];
    const AudioConstructor = windowRef?.Audio;

    if (!soundUrl || typeof AudioConstructor !== "function") {
      return false;
    }

    requestedLoopIds.add(soundId);
    let audio = loopAudioById.get(soundId);

    if (!audio) {
      audio = new AudioConstructor(soundUrl);
      audio.preload = "auto";
      audio.loop = true;
      loopAudioById.set(soundId, audio);
    }

    audio.muted = isChannelMuted(getSoundChannel(soundId));
    if (suspended) {
      audio.pause();
      return true;
    }

    if (!audio.paused) {
      return true;
    }

    try {
      const playback = audio.play();
      playback?.catch?.(() => {});
    } catch {
      return false;
    }

    return true;
  };

  const stopLoop = (soundId) => {
    requestedLoopIds.delete(soundId);
    const audio = loopAudioById.get(soundId);

    if (!audio) {
      return false;
    }

    audio.pause();
    audio.currentTime = 0;
    return true;
  };

  const pauseLoop = (soundId) => {
    requestedLoopIds.delete(soundId);
    const audio = loopAudioById.get(soundId);

    if (!audio) {
      return false;
    }

    audio.pause();
    return true;
  };

  const setChannelMuted = (channel, muted) => {
    const nextMuted = Boolean(muted);

    if (channel === SOUND_CHANNELS.MUSIC) {
      musicMuted = nextMuted;
    } else {
      sfxMuted = nextMuted;
    }

    for (const [soundId, audio] of loopAudioById) {
      if (getSoundChannel(soundId) !== channel) {
        continue;
      }

      audio.muted = nextMuted;
      if (
        !suspended &&
        !nextMuted &&
        requestedLoopIds.has(soundId) &&
        audio.paused
      ) {
        try {
          const playback = audio.play();
          playback?.catch?.(() => {});
        } catch {
          // A proxima interacao do usuario tentara novamente.
        }
      }
    }

    if (nextMuted) {
      for (const [audio, audioChannel] of activeOneShotAudio) {
        if (audioChannel !== channel) {
          continue;
        }

        audio.pause();
        audio.currentTime = 0;
        activeOneShotAudio.delete(audio);
      }
    }

    return getSnapshot();
  };
  const setMusicMuted = (muted) => (
    setChannelMuted(SOUND_CHANNELS.MUSIC, muted)
  );
  const setSfxMuted = (muted) => (
    setChannelMuted(SOUND_CHANNELS.SFX, muted)
  );
  const setSuspended = (nextSuspended) => {
    const normalizedSuspended = Boolean(nextSuspended);

    if (normalizedSuspended === suspended) {
      return getSnapshot();
    }

    suspended = normalizedSuspended;
    if (suspended) {
      for (const audio of loopAudioById.values()) {
        audio.pause();
      }
      for (const audio of activeOneShotAudio.keys()) {
        audio.pause();
        audio.currentTime = 0;
      }
      activeOneShotAudio.clear();
      return getSnapshot();
    }

    for (const soundId of requestedLoopIds) {
      const audio = loopAudioById.get(soundId);

      if (!audio || isChannelMuted(getSoundChannel(soundId)) || !audio.paused) {
        continue;
      }

      try {
        const playback = audio.play();
        playback?.catch?.(() => {});
      } catch {
        // A proxima interacao do usuario tentara novamente.
      }
    }

    return getSnapshot();
  };

  return Object.freeze({
    getSnapshot,
    pauseLoop,
    play,
    playLoop,
    setMusicMuted,
    setSfxMuted,
    setSuspended,
    stopLoop,
    toggleMusicMuted() {
      return setMusicMuted(!musicMuted);
    },
    toggleSfxMuted() {
      return setSfxMuted(!sfxMuted);
    }
  });
}
