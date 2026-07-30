export const RUN_SCORE_TRENDS = Object.freeze({
  UP: "up",
  DOWN: "down",
  SAME: "same"
});

function extractRatings(reviews) {
  return (Array.isArray(reviews) ? reviews : [])
    .map((review) => Number(review?.rating))
    .filter((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5);
}

function calculateTrend(previousAverage, nextAverage, previousReviewCount) {
  if (previousReviewCount <= 0 || nextAverage === previousAverage) {
    return RUN_SCORE_TRENDS.SAME;
  }

  return nextAverage > previousAverage ?
    RUN_SCORE_TRENDS.UP :
    RUN_SCORE_TRENDS.DOWN;
}

function freezeDayResult(result) {
  return Object.freeze({
    day: result.day,
    averageRating: result.averageRating,
    reviewCount: result.reviewCount,
    cumulativeAverageRating: result.cumulativeAverageRating,
    cumulativeReviewCount: result.cumulativeReviewCount,
    previousCumulativeAverageRating: result.previousCumulativeAverageRating,
    trend: result.trend
  });
}

function createSnapshot({
  totalDays,
  dayResults,
  ratingSum,
  reviewCount,
  finalResult
}) {
  return Object.freeze({
    totalDays,
    dayResults: Object.freeze([...dayResults]),
    ratingSum,
    reviewCount,
    cumulativeAverageRating: reviewCount > 0 ? ratingSum / reviewCount : 0,
    finalResult
  });
}

export function createRunScoreModel({
  runId = "local-run",
  totalDays = 5
} = {}) {
  if (!Number.isSafeInteger(totalDays) || totalDays <= 0) {
    throw new Error("RunScoreModel precisa de totalDays positivo.");
  }

  const normalizedRunId = String(runId || "").trim();

  if (!normalizedRunId) {
    throw new Error("RunScoreModel precisa de runId.");
  }

  const dayResults = [];
  let ratingSum = 0;
  let reviewCount = 0;
  let finalResult = null;

  const getSnapshot = () => createSnapshot({
    totalDays,
    dayResults,
    ratingSum,
    reviewCount,
    finalResult
  });

  return Object.freeze({
    getSnapshot,
    recordDay({ day, reviews = [] } = {}) {
      if (finalResult) {
        throw new Error("Run finalizada nao aceita novos resultados diarios.");
      }

      const expectedDay = dayResults.length + 1;

      if (!Number.isSafeInteger(day) || day !== expectedDay || day > totalDays) {
        throw new Error(`Resultado diario esperado para o dia ${expectedDay}.`);
      }

      const ratings = extractRatings(reviews);
      const dayRatingSum = ratings.reduce((total, rating) => total + rating, 0);
      const previousReviewCount = reviewCount;
      const previousAverage = previousReviewCount > 0 ?
        ratingSum / previousReviewCount :
        0;

      ratingSum += dayRatingSum;
      reviewCount += ratings.length;
      const cumulativeAverage = reviewCount > 0 ? ratingSum / reviewCount : 0;
      const result = freezeDayResult({
        day,
        averageRating: ratings.length > 0 ?
          dayRatingSum / ratings.length :
          0,
        reviewCount: ratings.length,
        cumulativeAverageRating: cumulativeAverage,
        cumulativeReviewCount: reviewCount,
        previousCumulativeAverageRating: previousAverage,
        trend: calculateTrend(
          previousAverage,
          cumulativeAverage,
          previousReviewCount
        )
      });

      dayResults.push(result);
      return getSnapshot();
    },
    finalize({ completedAt = new Date().toISOString() } = {}) {
      if (dayResults.length !== totalDays) {
        throw new Error("RunScoreModel so finaliza depois do ultimo dia.");
      }

      if (!finalResult) {
        const normalizedCompletedAt = String(completedAt || "").trim();

        if (!normalizedCompletedAt) {
          throw new Error("Resultado final precisa de completedAt.");
        }

        finalResult = Object.freeze({
          version: 1,
          runId: normalizedRunId,
          finalRating: reviewCount > 0 ? ratingSum / reviewCount : 0,
          totalReviews: reviewCount,
          dayRatings: Object.freeze(dayResults.map((result) => Object.freeze({
            day: result.day,
            averageRating: result.averageRating,
            reviewCount: result.reviewCount
          }))),
          completedAt: normalizedCompletedAt
        });
      }

      return getSnapshot();
    }
  });
}
