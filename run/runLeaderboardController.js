import {
  PLAYGAMA_LEADERBOARD_TYPES
} from "../platform/playgamaPlatformGateway.js";

export const RUN_RATING_LEADERBOARD_ID = "beach_rating";
export const RUN_RATING_SCORE_SCALE = 1000;
export const RUN_LEADERBOARD_VISIBLE_ENTRY_COUNT = 5;

export const RUN_LEADERBOARD_MODES = Object.freeze({
  IN_GAME: "in_game",
  LOCAL: "local",
  NATIVE: "native",
  NATIVE_POPUP: "native_popup"
});

export const RUN_LEADERBOARD_STATUSES = Object.freeze({
  EMPTY: "empty",
  LOAD_FAILED: "load_failed",
  NOT_AVAILABLE: "not_available",
  READY: "ready",
  SAVED: "saved",
  SUBMIT_FAILED: "submit_failed",
  SUBMITTED: "submitted"
});

function clampRating(value) {
  return Math.min(5, Math.max(0, Number(value) || 0));
}

export function encodeRunRatingScore(finalRating) {
  return Math.round(clampRating(finalRating) * RUN_RATING_SCORE_SCALE);
}

export function decodeRunRatingScore(score) {
  const normalizedScore = Math.max(0, Math.trunc(Number(score) || 0));

  return clampRating(normalizedScore / RUN_RATING_SCORE_SCALE);
}

function freezeEntry(entry) {
  return Object.freeze({
    id: entry.id,
    name: entry.name,
    rank: entry.rank,
    finalRating: entry.finalRating,
    totalReviews: entry.totalReviews,
    isCurrentPlayer: entry.isCurrentPlayer,
    source: entry.source
  });
}

function freezeState(state) {
  return Object.freeze({
    mode: state.mode,
    leaderboardType: state.leaderboardType,
    status: state.status,
    submitted: state.submitted,
    needsPlayerName: state.needsPlayerName,
    canOpenNative: state.canOpenNative,
    playerName: state.playerName,
    entries: Object.freeze(state.entries.map(freezeEntry))
  });
}

function normalizeFinalResult(input) {
  if (!input || !String(input.runId || "").trim()) {
    throw new Error("RunLeaderboardController precisa de um resultado final.");
  }

  const finalRating = Number(input.finalRating);
  const totalReviews = Number(input.totalReviews);

  if (
    !Number.isFinite(finalRating) ||
    finalRating < 0 ||
    finalRating > 5 ||
    !Number.isSafeInteger(totalReviews) ||
    totalReviews < 0
  ) {
    throw new Error("Resultado final invalido para o ranking.");
  }

  return input;
}

function presentPlatformEntries(entries, player) {
  const playerId = String(player?.id || "").trim();

  return (Array.isArray(entries) ? entries : [])
    .map((entry, index) => ({
      id: String(entry?.id || "").trim() || `platform-${index + 1}`,
      name: String(entry?.name || "").trim(),
      rank: Number.isSafeInteger(entry?.rank) && entry.rank > 0 ?
        entry.rank :
        index + 1,
      finalRating: decodeRunRatingScore(entry?.score),
      totalReviews: null,
      isCurrentPlayer: Boolean(playerId) && String(entry?.id || "") === playerId,
      source: "platform"
    }))
    .sort((left, right) => left.rank - right.rank)
    .slice(0, RUN_LEADERBOARD_VISIBLE_ENTRY_COUNT);
}

function presentLocalEntries(results, currentRunId = "") {
  const normalizedCurrentRunId = String(currentRunId || "").trim();

  return (Array.isArray(results) ? results : [])
    .slice(0, RUN_LEADERBOARD_VISIBLE_ENTRY_COUNT)
    .map((result, index) => ({
      id: String(result?.runId || "").trim() || `local-${index + 1}`,
      name: String(result?.playerName || "").trim(),
      rank: index + 1,
      finalRating: clampRating(result?.finalRating),
      totalReviews: Math.max(0, Math.trunc(Number(result?.totalReviews) || 0)),
      isCurrentPlayer: Boolean(normalizedCurrentRunId) &&
        String(result?.runId || "").trim() === normalizedCurrentRunId,
      source: "local"
    }));
}

export function createRunLeaderboardController({
  platformGateway = null,
  runResultStorage = null,
  leaderboardId = RUN_RATING_LEADERBOARD_ID
} = {}) {
  const normalizedLeaderboardId = String(leaderboardId || "").trim();
  let currentFinalResult = null;

  if (!normalizedLeaderboardId) {
    throw new Error("RunLeaderboardController precisa de leaderboardId.");
  }

  const createLocalState = ({
    status = RUN_LEADERBOARD_STATUSES.NOT_AVAILABLE,
    needsPlayerName = true
  } = {}) => freezeState({
    mode: RUN_LEADERBOARD_MODES.LOCAL,
    leaderboardType: PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE,
    status,
    submitted: false,
    needsPlayerName,
    canOpenNative: false,
    playerName: "",
    entries: presentLocalEntries(
      runResultStorage?.getResults?.() || [],
      currentFinalResult?.runId
    )
  });
  const savePlatformResultLocally = (playerName) => {
    const normalizedPlayerName = String(playerName || "").trim();

    if (!normalizedPlayerName || !currentFinalResult) {
      return;
    }

    try {
      runResultStorage?.save?.({
        ...currentFinalResult,
        playerName: normalizedPlayerName
      });
    } catch {
      // O ranking da plataforma continua valido sem o cache local.
    }
  };

  return Object.freeze({
    async prepare(finalResult) {
      currentFinalResult = normalizeFinalResult(finalResult);
      const leaderboardType = platformGateway?.getLeaderboardType?.() ||
        PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE;

      if (leaderboardType === PLAYGAMA_LEADERBOARD_TYPES.NOT_AVAILABLE) {
        return createLocalState();
      }

      const submitted = await platformGateway?.setLeaderboardScore?.(
        normalizedLeaderboardId,
        encodeRunRatingScore(currentFinalResult.finalRating)
      );

      if (!submitted) {
        return createLocalState({
          status: RUN_LEADERBOARD_STATUSES.SUBMIT_FAILED
        });
      }

      const player = platformGateway?.getPlayerSnapshot?.() || {};

      savePlatformResultLocally(player.name);

      if (leaderboardType === PLAYGAMA_LEADERBOARD_TYPES.IN_GAME) {
        const entries = await platformGateway.getLeaderboardEntries(
          normalizedLeaderboardId
        );

        return freezeState({
          mode: RUN_LEADERBOARD_MODES.IN_GAME,
          leaderboardType,
          status: entries === null ?
            RUN_LEADERBOARD_STATUSES.LOAD_FAILED :
            entries.length > 0 ?
              RUN_LEADERBOARD_STATUSES.READY :
              RUN_LEADERBOARD_STATUSES.EMPTY,
          submitted: true,
          needsPlayerName: false,
          canOpenNative: false,
          playerName: String(player.name || "").trim(),
          entries: presentPlatformEntries(entries || [], player)
        });
      }

      return freezeState({
        mode: leaderboardType === PLAYGAMA_LEADERBOARD_TYPES.NATIVE_POPUP ?
          RUN_LEADERBOARD_MODES.NATIVE_POPUP :
          RUN_LEADERBOARD_MODES.NATIVE,
        leaderboardType,
        status: RUN_LEADERBOARD_STATUSES.SUBMITTED,
        submitted: true,
        needsPlayerName: false,
        canOpenNative:
          leaderboardType === PLAYGAMA_LEADERBOARD_TYPES.NATIVE_POPUP,
        playerName: String(player.name || "").trim(),
        entries: []
      });
    },
    saveLocalScore(playerName) {
      if (!currentFinalResult) {
        throw new Error("Nao existe run final para salvar no ranking local.");
      }

      const normalizedPlayerName = String(playerName || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 12);

      if (!normalizedPlayerName) {
        throw new Error("Ranking local precisa do nome do jogador.");
      }

      runResultStorage?.save?.({
        ...currentFinalResult,
        playerName: normalizedPlayerName
      });

      return createLocalState({
        status: RUN_LEADERBOARD_STATUSES.SAVED,
        needsPlayerName: false
      });
    },
    showNativeLeaderboard() {
      return platformGateway?.showNativeLeaderboard?.(normalizedLeaderboardId) ||
        Promise.resolve(false);
    }
  });
}
