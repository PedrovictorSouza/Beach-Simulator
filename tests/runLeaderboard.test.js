import test from "node:test";
import assert from "node:assert/strict";

import {
  PLAYGAMA_LEADERBOARD_TYPES
} from "../platform/playgamaPlatformGateway.js";
import {
  createRunLeaderboardController,
  decodeRunRatingScore,
  encodeRunRatingScore,
  RUN_LEADERBOARD_MODES,
  RUN_LEADERBOARD_STATUSES,
  RUN_RATING_LEADERBOARD_ID
} from "../run/runLeaderboardController.js";
import { createRunResultStorage } from "../run/runResultStorage.js";

function createMemoryStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

function createFinalResult(overrides = {}) {
  return {
    version: 1,
    runId: "run-final-1",
    finalRating: 4.75,
    totalReviews: 5,
    dayRatings: Array.from({ length: 5 }, (_, index) => ({
      day: index + 1,
      averageRating: index === 4 ? 4.75 : 4,
      reviewCount: 1
    })),
    completedAt: "2026-07-31T12:00:00.000Z",
    ...overrides
  };
}

test("rating do run vira pontos inteiros sem perder a ordem das estrelas", () => {
  assert.equal(encodeRunRatingScore(4.732), 4732);
  assert.equal(encodeRunRatingScore(7), 5000);
  assert.equal(encodeRunRatingScore(-1), 0);
  assert.equal(decodeRunRatingScore(4732), 4.732);
});

test("sem ranking do SDK, a tela usa somente o histórico deste dispositivo", async () => {
  const runResultStorage = createRunResultStorage({
    storage: createMemoryStorage()
  });
  const controller = createRunLeaderboardController({
    platformGateway: {
      getLeaderboardType() {
        return PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE;
      }
    },
    runResultStorage
  });
  const pendingState = await controller.prepare(createFinalResult());

  assert.equal(pendingState.mode, RUN_LEADERBOARD_MODES.LOCAL);
  assert.equal(pendingState.needsPlayerName, true);
  assert.equal(pendingState.entries.length, 0);

  const savedState = controller.saveLocalScore("pipa");

  assert.equal(savedState.status, RUN_LEADERBOARD_STATUSES.SAVED);
  assert.equal(savedState.needsPlayerName, false);
  assert.equal(savedState.entries[0].name, "PIPA");
  assert.equal(savedState.entries[0].finalRating, 4.75);
  assert.equal(savedState.entries[0].isCurrentPlayer, true);
});

test("ranking in-game envia a nota final e mostra o top do SDK", async () => {
  const calls = [];
  const runResultStorage = createRunResultStorage({
    storage: createMemoryStorage()
  });
  const controller = createRunLeaderboardController({
    platformGateway: {
      getLeaderboardType() {
        return PLAYGAMA_LEADERBOARD_TYPES.IN_GAME;
      },
      getPlayerSnapshot() {
        return { id: "player-7", name: "PIPA", isAuthorized: true };
      },
      async setLeaderboardScore(id, score) {
        calls.push(["set", id, score]);
        return true;
      },
      async getLeaderboardEntries(id) {
        calls.push(["get", id]);
        return [
          { id: "player-7", name: "PIPA", score: 4750, rank: 2 },
          { id: "player-1", name: "SUN", score: 5000, rank: 1 }
        ];
      }
    },
    runResultStorage
  });
  const state = await controller.prepare(createFinalResult());

  assert.equal(state.mode, RUN_LEADERBOARD_MODES.IN_GAME);
  assert.equal(state.status, RUN_LEADERBOARD_STATUSES.READY);
  assert.equal(state.submitted, true);
  assert.deepEqual(calls, [
    ["set", RUN_RATING_LEADERBOARD_ID, 4750],
    ["get", RUN_RATING_LEADERBOARD_ID]
  ]);
  assert.deepEqual(state.entries.map((entry) => ({
    rank: entry.rank,
    name: entry.name,
    finalRating: entry.finalRating,
    isCurrentPlayer: entry.isCurrentPlayer
  })), [
    { rank: 1, name: "SUN", finalRating: 5, isCurrentPlayer: false },
    { rank: 2, name: "PIPA", finalRating: 4.75, isCurrentPlayer: true }
  ]);
  assert.equal(runResultStorage.getResults()[0].playerName, "PIPA");
});
