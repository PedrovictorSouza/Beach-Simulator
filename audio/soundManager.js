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

export function createSoundManager({ windowRef = globalThis } = {}) {
  const loopAudioById = new Map();

  const play = (soundId) => {
    const soundUrl = SOUND_URLS[soundId];
    const AudioConstructor = windowRef?.Audio;

    if (!soundUrl || typeof AudioConstructor !== "function") {
      return false;
    }

    const audio = new AudioConstructor(soundUrl);
    audio.preload = "auto";

    try {
      const playback = audio.play();
      playback?.catch?.(() => {});
    } catch {
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

    let audio = loopAudioById.get(soundId);

    if (!audio) {
      audio = new AudioConstructor(soundUrl);
      audio.preload = "auto";
      audio.loop = true;
      loopAudioById.set(soundId, audio);
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
    const audio = loopAudioById.get(soundId);

    if (!audio) {
      return false;
    }

    audio.pause();
    audio.currentTime = 0;
    return true;
  };

  return Object.freeze({ play, playLoop, stopLoop });
}
