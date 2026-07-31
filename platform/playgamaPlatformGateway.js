const DEFAULT_CONFIG_PATH = "./playgama-bridge-config.json";
const DEFAULT_INITIALIZATION_TIMEOUT_MS = 8000;
const DEFAULT_AD_TIMEOUT_MS = 120000;
const DEFAULT_LEADERBOARD_TIMEOUT_MS = 8000;

export const PLAYGAMA_PLATFORM_MESSAGES = Object.freeze({
  GAME_READY: "game_ready",
  GAMEPLAY_STARTED: "gameplay_started",
  GAMEPLAY_STOPPED: "gameplay_stopped"
});

export const PLAYGAMA_LEADERBOARD_TYPES = Object.freeze({
  NOT_AVAILABLE: "not_available",
  IN_GAME: "in_game",
  NATIVE: "native",
  NATIVE_POPUP: "native_popup"
});

const PLAYGAMA_LEADERBOARD_TYPE_VALUES = new Set(
  Object.values(PLAYGAMA_LEADERBOARD_TYPES)
);

const FALLBACK_EVENT_NAMES = Object.freeze({
  AUDIO_STATE_CHANGED: "audio_state_changed",
  INTERSTITIAL_STATE_CHANGED: "interstitial_state_changed",
  PAUSE_STATE_CHANGED: "pause_state_changed"
});

function readEventName(bridge, key) {
  return bridge?.EVENT_NAME?.[key] || FALLBACK_EVENT_NAMES[key];
}

function createTimeout(windowRef, durationMs, callback) {
  const setTimeoutRef = windowRef?.setTimeout?.bind(windowRef) || setTimeout;

  return setTimeoutRef(callback, durationMs);
}

function clearTimeoutSafe(windowRef, timeoutId) {
  const clearTimeoutRef = windowRef?.clearTimeout?.bind(windowRef) || clearTimeout;

  clearTimeoutRef(timeoutId);
}

function settleWithTimeout(windowRef, promise, durationMs, fallbackValue) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeoutSafe(windowRef, timeoutId);
      resolve(value);
    };
    const timeoutId = createTimeout(
      windowRef,
      durationMs,
      () => finish(fallbackValue)
    );

    Promise.resolve(promise)
      .then(finish)
      .catch(() => finish(fallbackValue));
  });
}

function normalizeLeaderboardType(type) {
  const normalizedType = String(type || "").trim().toLowerCase();

  return PLAYGAMA_LEADERBOARD_TYPE_VALUES.has(normalizedType) ?
    normalizedType :
    PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE;
}

function normalizeLeaderboardId(id) {
  return String(id || "").trim();
}

function normalizeLeaderboardEntry(entry, index) {
  const score = Number(entry?.score);
  const rank = Number(entry?.rank);

  if (!Number.isSafeInteger(score) || score < 0) {
    return null;
  }

  return Object.freeze({
    id: String(entry?.id || "").trim(),
    name: String(entry?.name || "").trim(),
    photo: String(entry?.photo || "").trim(),
    score,
    rank: Number.isSafeInteger(rank) && rank > 0 ? rank : index + 1
  });
}

export function createPlaygamaPlatformGateway({
  windowRef = globalThis,
  bridge: injectedBridge = null,
  configFilePath = DEFAULT_CONFIG_PATH,
  initializationTimeoutMs = DEFAULT_INITIALIZATION_TIMEOUT_MS,
  advertisementTimeoutMs = DEFAULT_AD_TIMEOUT_MS,
  leaderboardTimeoutMs = DEFAULT_LEADERBOARD_TIMEOUT_MS
} = {}) {
  let bridge = injectedBridge;
  let initialized = false;
  let initializationPromise = null;
  let platformPaused = false;
  let advertisementPaused = false;
  let audioEnabled = true;
  let destroyed = false;
  const queuedMessages = [];
  const queuedStorageWrites = [];
  const pauseObservers = new Set();
  const audioObservers = new Set();
  const eventUnsubscribers = [];

  const getBridge = () => (
    bridge || windowRef?.bridge || windowRef?.playgamaBridge || null
  );
  const getLeaderboardType = () => (
    initialized ?
      normalizeLeaderboardType(bridge?.leaderboards?.type) :
      PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE
  );
  const getPlayerSnapshot = () => Object.freeze({
    id: initialized ? String(bridge?.player?.id || "").trim() : "",
    name: initialized ? String(bridge?.player?.name || "").trim() : "",
    isAuthorized: initialized && bridge?.player?.isAuthorized === true
  });
  const getSnapshot = () => Object.freeze({
    available: Boolean(getBridge()),
    initialized,
    platformId: initialized ? String(bridge?.platform?.id || "mock") : "web",
    language: initialized ? String(bridge?.platform?.language || "") : "",
    leaderboardType: getLeaderboardType(),
    player: getPlayerSnapshot(),
    paused: platformPaused || advertisementPaused,
    audioEnabled
  });
  const notifyPause = () => {
    const paused = platformPaused || advertisementPaused;

    for (const observer of pauseObservers) {
      observer(paused);
    }
  };
  const notifyAudio = () => {
    for (const observer of audioObservers) {
      observer(audioEnabled);
    }
  };
  const subscribeBridgeEvent = (module, eventName, listener) => {
    if (!module || typeof module.on !== "function") {
      return;
    }

    module.on(eventName, listener);
    eventUnsubscribers.push(() => module.off?.(eventName, listener));
  };
  const sendMessageNow = async (message) => {
    if (!initialized || typeof bridge?.platform?.sendMessage !== "function") {
      return false;
    }

    try {
      await bridge.platform.sendMessage(message);
      return true;
    } catch {
      return false;
    }
  };
  const setStorageNow = async (key, value) => {
    if (!initialized || typeof bridge?.storage?.set !== "function") {
      return false;
    }

    try {
      await bridge.storage.set(key, value);
      return true;
    } catch {
      return false;
    }
  };
  const flushQueues = async () => {
    for (const message of queuedMessages.splice(0)) {
      await sendMessageNow(message);
    }

    for (const [key, value] of queuedStorageWrites.splice(0)) {
      await setStorageNow(key, value);
    }
  };
  const activateBridge = () => {
    if (initialized || destroyed) {
      return;
    }

    initialized = true;
    platformPaused = Boolean(bridge?.platform?.isPaused);
    audioEnabled = bridge?.platform?.isAudioEnabled !== false;

    subscribeBridgeEvent(
      bridge?.platform,
      readEventName(bridge, "PAUSE_STATE_CHANGED"),
      (isPaused) => {
        platformPaused = Boolean(isPaused);
        notifyPause();
      }
    );
    subscribeBridgeEvent(
      bridge?.platform,
      readEventName(bridge, "AUDIO_STATE_CHANGED"),
      (isEnabled) => {
        audioEnabled = isEnabled !== false;
        notifyAudio();
      }
    );
    subscribeBridgeEvent(
      bridge?.advertisement,
      readEventName(bridge, "INTERSTITIAL_STATE_CHANGED"),
      (state) => {
        const nextAdvertisementPaused = state === "loading" || state === "opened";

        if (nextAdvertisementPaused === advertisementPaused) {
          return;
        }

        advertisementPaused = nextAdvertisementPaused;
        notifyPause();
      }
    );

    notifyPause();
    notifyAudio();
    void flushQueues();
  };
  const initialize = () => {
    if (initializationPromise) {
      return initializationPromise;
    }

    bridge = getBridge();
    if (!bridge || typeof bridge.initialize !== "function") {
      initializationPromise = Promise.resolve(getSnapshot());
      return initializationPromise;
    }

    const sdkPromise = Promise.resolve()
      .then(() => bridge.initialize({ configFilePath }))
      .then(() => {
        activateBridge();
        return getSnapshot();
      })
      .catch(() => getSnapshot());

    initializationPromise = new Promise((resolve) => {
      let settled = false;
      const timeoutId = createTimeout(
        windowRef,
        initializationTimeoutMs,
        () => {
          if (!settled) {
            settled = true;
            resolve(getSnapshot());
          }
        }
      );

      sdkPromise.then((snapshot) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeoutSafe(windowRef, timeoutId);
        resolve(snapshot);
      });
    });

    return initializationPromise;
  };
  const queueOrSendMessage = (message) => {
    if (!initialized) {
      queuedMessages.push(message);
      return Promise.resolve(false);
    }

    return sendMessageNow(message);
  };

  return Object.freeze({
    destroy() {
      destroyed = true;
      for (const unsubscribe of eventUnsubscribers.splice(0)) {
        unsubscribe();
      }
      pauseObservers.clear();
      audioObservers.clear();
    },
    gameReady() {
      return queueOrSendMessage(PLAYGAMA_PLATFORM_MESSAGES.GAME_READY);
    },
    gameplayStarted() {
      return queueOrSendMessage(PLAYGAMA_PLATFORM_MESSAGES.GAMEPLAY_STARTED);
    },
    gameplayStopped() {
      return queueOrSendMessage(PLAYGAMA_PLATFORM_MESSAGES.GAMEPLAY_STOPPED);
    },
    getLeaderboardType,
    getPlayerSnapshot,
    async getLeaderboardEntries(id) {
      const leaderboardId = normalizeLeaderboardId(id);

      if (
        !initialized ||
        !leaderboardId ||
        getLeaderboardType() !== PLAYGAMA_LEADERBOARD_TYPES.IN_GAME ||
        typeof bridge?.leaderboards?.getEntries !== "function"
      ) {
        return null;
      }

      try {
        const entries = await settleWithTimeout(
          windowRef,
          bridge.leaderboards.getEntries(leaderboardId),
          leaderboardTimeoutMs,
          null
        );

        if (entries === null) {
          return null;
        }

        return Object.freeze(
          (Array.isArray(entries) ? entries : [])
            .map(normalizeLeaderboardEntry)
            .filter(Boolean)
        );
      } catch {
        return null;
      }
    },
    getSnapshot,
    async getStorage(key) {
      if (!initialized || typeof bridge?.storage?.get !== "function") {
        return null;
      }

      try {
        return await bridge.storage.get(key);
      } catch {
        return null;
      }
    },
    initialize,
    async setLeaderboardScore(id, score) {
      const leaderboardId = normalizeLeaderboardId(id);
      const normalizedScore = Number(score);

      if (
        !initialized ||
        !leaderboardId ||
        getLeaderboardType() === PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE ||
        !Number.isSafeInteger(normalizedScore) ||
        normalizedScore < 0 ||
        typeof bridge?.leaderboards?.setScore !== "function"
      ) {
        return false;
      }

      try {
        return await settleWithTimeout(
          windowRef,
          Promise.resolve(
            bridge.leaderboards.setScore(leaderboardId, normalizedScore)
          ).then(() => true),
          leaderboardTimeoutMs,
          false
        );
      } catch {
        return false;
      }
    },
    setStorage(key, value) {
      if (!initialized) {
        queuedStorageWrites.push([key, value]);
        return Promise.resolve(false);
      }

      return setStorageNow(key, value);
    },
    showInterstitial(placement = "day_complete") {
      const advertisement = bridge?.advertisement;

      if (
        !initialized ||
        advertisement?.isInterstitialSupported !== true ||
        typeof advertisement.showInterstitial !== "function"
      ) {
        return Promise.resolve(false);
      }

      const eventName = readEventName(bridge, "INTERSTITIAL_STATE_CHANGED");

      return new Promise((resolve) => {
        let settled = false;
        const finish = (shown) => {
          if (settled) {
            return;
          }

          settled = true;
          advertisement.off?.(eventName, handleState);
          clearTimeoutSafe(windowRef, timeoutId);
          resolve(shown);
        };
        const handleState = (state) => {
          if (state === "closed") {
            finish(true);
          } else if (state === "failed") {
            finish(false);
          }
        };
        const timeoutId = createTimeout(
          windowRef,
          advertisementTimeoutMs,
          () => finish(false)
        );

        advertisement.on?.(eventName, handleState);
        try {
          advertisement.showInterstitial(placement);
        } catch {
          finish(false);
        }
      });
    },
    async showNativeLeaderboard(id) {
      const leaderboardId = normalizeLeaderboardId(id);

      if (
        !initialized ||
        !leaderboardId ||
        getLeaderboardType() !== PLAYGAMA_LEADERBOARD_TYPES.NATIVE_POPUP ||
        typeof bridge?.leaderboards?.showNativePopup !== "function"
      ) {
        return false;
      }

      try {
        return await settleWithTimeout(
          windowRef,
          Promise.resolve(
            bridge.leaderboards.showNativePopup(leaderboardId)
          ).then(() => true),
          leaderboardTimeoutMs,
          false
        );
      } catch {
        return false;
      }
    },
    subscribeAudioEnabled(observer) {
      if (typeof observer !== "function") {
        throw new Error("Playgama audio observer precisa ser uma funcao.");
      }

      audioObservers.add(observer);
      observer(audioEnabled);
      return () => audioObservers.delete(observer);
    },
    subscribePause(observer) {
      if (typeof observer !== "function") {
        throw new Error("Playgama pause observer precisa ser uma funcao.");
      }

      pauseObservers.add(observer);
      observer(platformPaused || advertisementPaused);
      return () => pauseObservers.delete(observer);
    }
  });
}
