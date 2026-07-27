function createSnapshot({ ratingCounts, ratingSum, reviewsByNpcId }) {
  const reviewCount = reviewsByNpcId.size;

  return Object.freeze({
    averageRating: reviewCount > 0 ? ratingSum / reviewCount : 0,
    reviewCount,
    ratingCounts: Object.freeze([...ratingCounts]),
    reviews: Object.freeze([...reviewsByNpcId.values()])
  });
}

export function createBeachRatingModel() {
  const observers = new Set();
  const ratingsByNpcId = new Map();
  const reviewsByNpcId = new Map();
  const ratingCounts = [0, 0, 0, 0, 0];
  let ratingSum = 0;

  const getSnapshot = () => createSnapshot({
    ratingCounts,
    ratingSum,
    reviewsByNpcId
  });
  const notify = () => {
    const snapshot = getSnapshot();

    for (const observer of observers) {
      observer(snapshot);
    }
  };

  return Object.freeze({
    getSnapshot,
    submitRating({
      npcId,
      rating,
      toleranceUsed,
      toleranceLimit,
      toleranceIssues = [],
      baseRating,
      serviceBonus = 0,
      positiveServiceMotives = []
    }) {
      const normalizedNpcId = String(npcId || "").trim();
      const normalizedRating = Number(rating);

      if (!normalizedNpcId) {
        throw new Error("Avaliacao precisa de npcId.");
      }

      if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
        throw new Error("Avaliacao precisa estar entre 1 e 5 estrelas.");
      }

      const previousRating = ratingsByNpcId.get(normalizedNpcId);

      if (previousRating === normalizedRating) {
        return getSnapshot();
      }

      if (previousRating !== undefined) {
        ratingCounts[previousRating - 1] -= 1;
        ratingSum -= previousRating;
      }

      ratingsByNpcId.set(normalizedNpcId, normalizedRating);
      const normalizedToleranceUsed = Number(toleranceUsed);
      const normalizedToleranceLimit = Number(toleranceLimit);
      const hasToleranceSample = Number.isFinite(normalizedToleranceUsed) &&
        Number.isFinite(normalizedToleranceLimit) &&
        normalizedToleranceUsed >= 0 &&
        normalizedToleranceLimit > 0;
      const normalizedToleranceIssues = Array.isArray(toleranceIssues) ?
        toleranceIssues
          .map((issue) => ({
            source: String(issue?.source || "").trim(),
            amount: Math.max(1, Math.floor(Number(issue?.amount) || 1))
          }))
          .filter((issue) => issue.source)
          .map(Object.freeze) :
        [];
      const normalizedBaseRating = Math.min(
        5,
        Math.max(1, Math.floor(Number(baseRating) || normalizedRating))
      );
      const normalizedServiceBonus = Math.max(
        0,
        Math.floor(Number(serviceBonus) || 0)
      );
      const normalizedPositiveServiceMotives = Array.isArray(positiveServiceMotives) ?
        [...new Set(positiveServiceMotives.map(String).filter(Boolean))] :
        [];
      reviewsByNpcId.set(normalizedNpcId, Object.freeze({
        npcId: normalizedNpcId,
        rating: normalizedRating,
        baseRating: normalizedBaseRating,
        serviceBonus: normalizedServiceBonus,
        positiveServiceMotives: Object.freeze(normalizedPositiveServiceMotives),
        ...(hasToleranceSample ? {
          toleranceUsed: normalizedToleranceUsed,
          toleranceLimit: normalizedToleranceLimit,
          toleranceRatio: Math.min(
            1,
            normalizedToleranceUsed / normalizedToleranceLimit
          ),
          toleranceIssues: Object.freeze(normalizedToleranceIssues)
        } : {})
      }));
      ratingCounts[normalizedRating - 1] += 1;
      ratingSum += normalizedRating;
      notify();
      return getSnapshot();
    },
    subscribe(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observer das avaliacoes precisa ser uma funcao.");
      }

      observers.add(observer);
      observer(getSnapshot());

      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        observers.delete(observer);
      };
    }
  });
}
