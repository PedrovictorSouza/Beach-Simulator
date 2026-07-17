function createSnapshot({ ratingCounts, ratingSum, reviewCount }) {
  return Object.freeze({
    averageRating: reviewCount > 0 ? ratingSum / reviewCount : 0,
    reviewCount,
    ratingCounts: Object.freeze([...ratingCounts])
  });
}

export function createBeachRatingModel() {
  const observers = new Set();
  const ratingsByNpcId = new Map();
  const ratingCounts = [0, 0, 0, 0, 0];
  let ratingSum = 0;

  const getSnapshot = () => createSnapshot({
    ratingCounts,
    ratingSum,
    reviewCount: ratingsByNpcId.size
  });
  const notify = () => {
    const snapshot = getSnapshot();

    for (const observer of observers) {
      observer(snapshot);
    }
  };

  return Object.freeze({
    getSnapshot,
    submitRating({ npcId, rating }) {
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
