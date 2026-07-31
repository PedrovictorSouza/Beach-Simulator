import test from "node:test";
import assert from "node:assert/strict";

import {
  createPlaygamaPlatformGateway,
  PLAYGAMA_LEADERBOARD_TYPES
} from "../platform/playgamaPlatformGateway.js";
import {
  createPlatformBackedStorage
} from "../platform/platformBackedStorage.js";

function createEventModule(properties = {}) {
  const listeners = new Map();

  return {
    ...properties,
    emit(eventName, value) {
      for (const listener of listeners.get(eventName) || []) {
        listener(value);
      }
    },
    off(eventName, listener) {
      listeners.get(eventName)?.delete(listener);
    },
    on(eventName, listener) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName).add(listener);
    }
  };
}

function createBridge({
  leaderboardType = PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE,
  leaderboardEntries = []
} = {}) {
  const messages = [];
  const leaderboardCalls = [];
  const storedValues = new Map();
  const platform = createEventModule({
    id: "playgama",
    isAudioEnabled: true,
    isPaused: false,
    language: "pt",
    async sendMessage(message) {
      messages.push(message);
    }
  });
  const advertisement = createEventModule({
    isInterstitialSupported: true,
    showInterstitial() {
      advertisement.emit("interstitial_state_changed", "loading");
      advertisement.emit("interstitial_state_changed", "opened");
      queueMicrotask(() => (
        advertisement.emit("interstitial_state_changed", "closed")
      ));
    }
  });

  const leaderboards = {
    type: leaderboardType,
    async getEntries(id) {
      leaderboardCalls.push(["getEntries", id]);
      return leaderboardEntries;
    },
    async setScore(id, score) {
      leaderboardCalls.push(["setScore", id, score]);
    },
    async showNativePopup(id) {
      leaderboardCalls.push(["showNativePopup", id]);
    }
  };

  return {
    EVENT_NAME: {
      AUDIO_STATE_CHANGED: "audio_state_changed",
      INTERSTITIAL_STATE_CHANGED: "interstitial_state_changed",
      PAUSE_STATE_CHANGED: "pause_state_changed"
    },
    advertisement,
    initializeCalls: [],
    async initialize(options) {
      this.initializeCalls.push(options);
    },
    messages,
    leaderboardCalls,
    leaderboards,
    platform,
    player: {
      id: "player-7",
      name: "PIPA",
      isAuthorized: true
    },
    storage: {
      async get(key) {
        return storedValues.get(key) ?? null;
      },
      async set(key, value) {
        storedValues.set(key, value);
      }
    },
    storedValues
  };
}

test("Playgama inicializa, informa lifecycle e pausa durante interstitial", async () => {
  const bridge = createBridge();
  const gateway = createPlaygamaPlatformGateway({
    bridge,
    windowRef: globalThis,
    advertisementTimeoutMs: 100
  });
  const pauseStates = [];

  gateway.subscribePause((paused) => pauseStates.push(paused));
  const snapshot = await gateway.initialize();

  assert.equal(snapshot.platformId, "playgama");
  assert.equal(snapshot.language, "pt");
  assert.deepEqual(bridge.initializeCalls, [{
    configFilePath: "./playgama-bridge-config.json"
  }]);

  await gateway.gameReady();
  await gateway.gameplayStarted();
  assert.equal(await gateway.showInterstitial("day_complete"), true);
  await gateway.gameplayStopped();

  assert.deepEqual(bridge.messages, [
    "game_ready",
    "gameplay_started",
    "gameplay_stopped"
  ]);
  assert.deepEqual(pauseStates.slice(-2), [true, false]);
});

test("ranking Playgama envia rating inteiro e normaliza o top remoto", async () => {
  const bridge = createBridge({
    leaderboardType: PLAYGAMA_LEADERBOARD_TYPES.IN_GAME,
    leaderboardEntries: [
      { id: "player-2", name: "SUN", score: 5000, rank: 1 },
      { id: "player-7", name: "PIPA", score: 4750, rank: 2 },
      { id: "broken", name: "BROKEN", score: 4.5, rank: 3 }
    ]
  });
  const gateway = createPlaygamaPlatformGateway({
    bridge,
    windowRef: globalThis
  });

  await gateway.initialize();

  assert.equal(
    gateway.getLeaderboardType(),
    PLAYGAMA_LEADERBOARD_TYPES.IN_GAME
  );
  assert.deepEqual(gateway.getPlayerSnapshot(), {
    id: "player-7",
    name: "PIPA",
    isAuthorized: true
  });
  assert.equal(await gateway.setLeaderboardScore("beach_rating", 4750), true);
  assert.deepEqual(await gateway.getLeaderboardEntries("beach_rating"), [
    {
      id: "player-2",
      name: "SUN",
      photo: "",
      score: 5000,
      rank: 1
    },
    {
      id: "player-7",
      name: "PIPA",
      photo: "",
      score: 4750,
      rank: 2
    }
  ]);
  assert.deepEqual(bridge.leaderboardCalls, [
    ["setScore", "beach_rating", 4750],
    ["getEntries", "beach_rating"]
  ]);
});

test("ranking nativo abre popup somente quando o tipo permite", async () => {
  const bridge = createBridge({
    leaderboardType: PLAYGAMA_LEADERBOARD_TYPES.NATIVE_POPUP
  });
  const gateway = createPlaygamaPlatformGateway({
    bridge,
    windowRef: globalThis
  });

  await gateway.initialize();

  assert.equal(await gateway.setLeaderboardScore("beach_rating", 5000), true);
  assert.equal(await gateway.getLeaderboardEntries("beach_rating"), null);
  assert.equal(await gateway.showNativeLeaderboard("beach_rating"), true);
  assert.deepEqual(bridge.leaderboardCalls, [
    ["setScore", "beach_rating", 5000],
    ["showNativePopup", "beach_rating"]
  ]);
});

test("ranking com SDK travado retorna ao jogo depois do timeout", async () => {
  const bridge = createBridge({
    leaderboardType: PLAYGAMA_LEADERBOARD_TYPES.IN_GAME
  });
  bridge.leaderboards.setScore = () => new Promise(() => {});
  const gateway = createPlaygamaPlatformGateway({
    bridge,
    windowRef: globalThis,
    leaderboardTimeoutMs: 5
  });

  await gateway.initialize();

  assert.equal(await gateway.setLeaderboardScore("beach_rating", 4200), false);
});

test("storage da plataforma hidrata o cache e replica escritas locais", async () => {
  const bridge = createBridge();
  bridge.storedValues.set("remote", { score: 5 });
  const gateway = createPlaygamaPlatformGateway({
    bridge,
    windowRef: globalThis
  });
  const values = new Map([["local", "pt-BR"]]);
  const localStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
  const storage = createPlatformBackedStorage({
    localStorage,
    platformGateway: gateway
  });

  await gateway.initialize();
  await storage.hydrate(["remote", "local"]);

  assert.equal(storage.getItem("remote"), '{"score":5}');
  assert.equal(bridge.storedValues.get("local"), "pt-BR");

  storage.setItem("result", "winner");
  await storage.flush();
  assert.equal(bridge.storedValues.get("result"), "winner");
});
