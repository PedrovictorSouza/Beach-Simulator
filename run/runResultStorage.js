export const RUN_RESULT_STORAGE_KEY = "beach-simulator.run-results.v1";
export const RUN_RESULT_STORAGE_LIMIT = 20;
const PLAYER_NAME_MAX_LENGTH = 12;

function freezeResult(result) {
  return Object.freeze({
    version: 1,
    runId: result.runId,
    playerName: result.playerName,
    finalRating: result.finalRating,
    totalReviews: result.totalReviews,
    dayRatings: Object.freeze(result.dayRatings.map((dayRating) => (
      Object.freeze({ ...dayRating })
    ))),
    completedAt: result.completedAt
  });
}

function normalizeResult(input) {
  if (!input || Number(input.version) !== 1) {
    return null;
  }

  const runId = String(input.runId || "").trim();
  const playerName = String(input.playerName || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, PLAYER_NAME_MAX_LENGTH)
    .toUpperCase();
  const finalRating = Number(input.finalRating);
  const totalReviews = Number(input.totalReviews);
  const completedAt = String(input.completedAt || "").trim();
  const completedAtTime = Date.parse(completedAt);
  const dayRatings = (Array.isArray(input.dayRatings) ? input.dayRatings : [])
    .map((entry) => ({
      day: Number(entry?.day),
      averageRating: Number(entry?.averageRating),
      reviewCount: Number(entry?.reviewCount)
    }));
  const validDayRatings = dayRatings.length > 0 && dayRatings.every((entry) => (
    Number.isSafeInteger(entry.day) &&
    entry.day > 0 &&
    Number.isFinite(entry.averageRating) &&
    entry.averageRating >= 0 &&
    entry.averageRating <= 5 &&
    Number.isSafeInteger(entry.reviewCount) &&
    entry.reviewCount >= 0
  ));

  if (
    !runId ||
    !Number.isFinite(finalRating) ||
    finalRating < 0 ||
    finalRating > 5 ||
    !Number.isSafeInteger(totalReviews) ||
    totalReviews < 0 ||
    !Number.isFinite(completedAtTime) ||
    !validDayRatings
  ) {
    return null;
  }

  const sortedDayRatings = [...dayRatings].sort((left, right) => (
    left.day - right.day
  ));
  const hasSequentialDays = sortedDayRatings.every((entry, index) => (
    entry.day === index + 1
  ));
  const countedReviews = sortedDayRatings.reduce(
    (total, entry) => total + entry.reviewCount,
    0
  );

  if (!hasSequentialDays || countedReviews !== totalReviews) {
    return null;
  }

  return freezeResult({
    runId,
    playerName,
    finalRating,
    totalReviews,
    dayRatings: sortedDayRatings,
    completedAt: new Date(completedAtTime).toISOString()
  });
}

function compareLeaderboardResults(left, right) {
  return (
    right.finalRating - left.finalRating ||
    right.totalReviews - left.totalReviews ||
    Date.parse(right.completedAt) - Date.parse(left.completedAt)
  );
}

export function createRunResultStorage({
  storage = null,
  key = RUN_RESULT_STORAGE_KEY,
  maxResults = RUN_RESULT_STORAGE_LIMIT
} = {}) {
  const normalizedKey = String(key || RUN_RESULT_STORAGE_KEY);
  const normalizedLimit = Math.max(
    1,
    Math.trunc(Number(maxResults) || RUN_RESULT_STORAGE_LIMIT)
  );

  const readResults = () => {
    if (!storage || typeof storage.getItem !== "function") {
      return [];
    }

    try {
      const parsed = JSON.parse(storage.getItem(normalizedKey) || "[]");

      return (Array.isArray(parsed) ? parsed : [])
        .map(normalizeResult)
        .filter(Boolean)
        .sort(compareLeaderboardResults)
        .slice(0, normalizedLimit);
    } catch {
      return [];
    }
  };

  const freezeResults = (results) => Object.freeze([...results]);

  return Object.freeze({
    getResults() {
      return freezeResults(readResults());
    },
    save(input) {
      const result = normalizeResult(input);

      if (!result) {
        throw new Error("Resultado de run invalido.");
      }

      const currentResults = readResults();

      if (currentResults.some(({ runId }) => runId === result.runId)) {
        return Object.freeze({
          saved: false,
          results: freezeResults(currentResults)
        });
      }

      const nextResults = [result, ...currentResults]
        .sort(compareLeaderboardResults)
        .slice(0, normalizedLimit);
      let saved = false;

      if (storage && typeof storage.setItem === "function") {
        try {
          storage.setItem(normalizedKey, JSON.stringify(nextResults));
          saved = true;
        } catch {
          saved = false;
        }
      }

      return Object.freeze({
        saved,
        results: freezeResults(saved ? nextResults : currentResults)
      });
    }
  });
}
