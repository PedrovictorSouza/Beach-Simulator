const BOT_TRADE_SFX_URL = new URL("../soundFx/bot-trade.mp3", import.meta.url).href;
const BOT_TRADE_SFX_VOLUME = 0.76;

export function createBotTradeSfxPlayer({
  windowRef,
  src = BOT_TRADE_SFX_URL,
  volume = BOT_TRADE_SFX_VOLUME,
  volumeScale = () => 1
} = {}) {
  let audio = null;

  function getEffectiveVolume() {
    const scale = typeof volumeScale === "function" ? volumeScale() : volumeScale;
    const numericScale = Number(scale);
    return Math.max(0, Math.min(1, volume * (Number.isFinite(numericScale) ? numericScale : 1)));
  }

  function getAudio() {
    if (audio || typeof windowRef?.Audio !== "function") {
      return audio;
    }

    audio = new windowRef.Audio(src);
    audio.preload = "auto";
    audio.volume = getEffectiveVolume();
    return audio;
  }

  function play() {
    const sfx = getAudio();
    if (!sfx) {
      return false;
    }

    sfx.volume = getEffectiveVolume();
    try {
      sfx.currentTime = 0;
    } catch {
      // Some browser audio objects disallow seeking before metadata is ready.
    }

    const playResult = sfx.play?.();
    if (playResult?.catch) {
      playResult.catch(() => {});
    }
    return true;
  }

  return {
    play
  };
}

export function registerAudioLifecycleStop({
  windowRef,
  documentRef,
  stopAudio = () => {}
} = {}) {
  const stop = () => {
    stopAudio();
  };
  const stopWhenHidden = () => {
    if (documentRef?.hidden) {
      stop();
    }
  };

  windowRef?.addEventListener?.("pagehide", stop);
  windowRef?.addEventListener?.("beforeunload", stop);
  documentRef?.addEventListener?.("visibilitychange", stopWhenHidden);

  return () => {
    windowRef?.removeEventListener?.("pagehide", stop);
    windowRef?.removeEventListener?.("beforeunload", stop);
    documentRef?.removeEventListener?.("visibilitychange", stopWhenHidden);
  };
}
