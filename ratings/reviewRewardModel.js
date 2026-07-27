const DEFAULT_MIN_REVIEWS = 2;
const DEFAULT_MAX_REVIEWS = 4;
const DEFAULT_REWARD_IN_CENTS = 100;
const DEFAULT_MAX_REWARDS_PER_RUN = 2;

function normalizeRandom(random) {
  return Math.max(0, Math.min(0.999999, Number(random()) || 0));
}

export function createReviewRewardModel({
  random = Math.random,
  minReviews = DEFAULT_MIN_REVIEWS,
  maxReviews = DEFAULT_MAX_REVIEWS,
  rewardInCents = DEFAULT_REWARD_IN_CENTS,
  maxRewardsPerRun = DEFAULT_MAX_REWARDS_PER_RUN
} = {}) {
  if (typeof random !== "function") {
    throw new Error("Review reward random precisa ser uma funcao.");
  }

  const settings = [minReviews, maxReviews, rewardInCents, maxRewardsPerRun];
  if (!settings.every(Number.isSafeInteger) ||
      minReviews < 1 ||
      maxReviews < minReviews ||
      rewardInCents < 1 ||
      maxRewardsPerRun < 1) {
    throw new Error("Configuracao invalida para review reward.");
  }

  let eligibleReviewCount = 0;
  let rewardCount = 0;
  const drawNextRewardAt = () => minReviews + Math.floor(
    normalizeRandom(random) * (maxReviews - minReviews + 1)
  );
  let nextRewardAt = drawNextRewardAt();
  const getSnapshot = () => Object.freeze({
    eligibleReviewCount,
    rewardCount,
    nextRewardAt,
    remainingRewards: maxRewardsPerRun - rewardCount,
    capped: rewardCount >= maxRewardsPerRun
  });

  return Object.freeze({
    getSnapshot,
    recordReview({ rating }) {
      const normalizedRating = Number(rating);
      if (!Number.isInteger(normalizedRating) ||
          normalizedRating < 1 ||
          normalizedRating > 5) {
        throw new Error("Review reward precisa de rating entre 1 e 5.");
      }

      let awarded = false;
      if (normalizedRating >= 3 && rewardCount < maxRewardsPerRun) {
        eligibleReviewCount += 1;
        if (eligibleReviewCount >= nextRewardAt) {
          awarded = true;
          rewardCount += 1;
          eligibleReviewCount = 0;
          if (rewardCount < maxRewardsPerRun) {
            nextRewardAt = drawNextRewardAt();
          }
        }
      }

      return Object.freeze({
        awarded,
        amountInCents: awarded ? rewardInCents : 0,
        rewardSequence: rewardCount,
        snapshot: getSnapshot()
      });
    }
  });
}
