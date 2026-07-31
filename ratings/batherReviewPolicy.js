import { BUILDING_SERVICE_MOTIVES } from "../buildings/buildingServicesModel.js";

export const BATHER_REVIEW_BANDS = Object.freeze({
  DELIGHTED: "delighted",
  HAPPY: "happy",
  NEUTRAL: "neutral",
  UNHAPPY: "unhappy",
  EXHAUSTED: "exhausted"
});

const POSITIVE_REVIEW_MOTIVES = new Set([
  BUILDING_SERVICE_MOTIVES.CLEANLINESS,
  BUILDING_SERVICE_MOTIVES.SAFETY
]);
const SATISFIED_MOTIVE_THRESHOLD = 25;

export const FIRST_DAY_RATING_REQUIREMENTS = Object.freeze({
  minimumVisitors: 5,
  minimumEngagedBathers: 3
});

export function meetsFirstDayRatingRequirements({
  visitorCount = 0,
  engagedBatherCount = 0
} = {}) {
  return Number(visitorCount) >= FIRST_DAY_RATING_REQUIREMENTS.minimumVisitors &&
    Number(engagedBatherCount) >= FIRST_DAY_RATING_REQUIREMENTS.minimumEngagedBathers;
}

function getBandForRating(rating) {
  if (rating >= 5) {
    return BATHER_REVIEW_BANDS.DELIGHTED;
  }
  if (rating === 4) {
    return BATHER_REVIEW_BANDS.HAPPY;
  }
  if (rating === 3) {
    return BATHER_REVIEW_BANDS.NEUTRAL;
  }
  if (rating === 2) {
    return BATHER_REVIEW_BANDS.UNHAPPY;
  }
  return BATHER_REVIEW_BANDS.EXHAUSTED;
}

export function evaluateBatherReview({
  toleranceUsed,
  toleranceLimit,
  toleranceIssues = [],
  availableServiceMotives = [],
  motiveNeeds = {}
}) {
  const normalizedLimit = Math.max(1, Number(toleranceLimit) || 1);
  const normalizedUsed = Math.min(
    normalizedLimit,
    Math.max(0, Number(toleranceUsed) || 0)
  );
  const toleranceRatio = normalizedUsed / normalizedLimit;
  let baseRating = 1;

  if (toleranceRatio === 0) {
    baseRating = 5;
  } else if (toleranceRatio <= 1 / 3) {
    baseRating = 4;
  } else if (toleranceRatio < 2 / 3) {
    baseRating = 3;
  } else if (toleranceRatio < 1) {
    baseRating = 2;
  }

  const availableMotives = Array.isArray(availableServiceMotives) ?
    availableServiceMotives : [];
  const satisfiedServiceMotives = availableMotives.filter((motive) => (
    !POSITIVE_REVIEW_MOTIVES.has(motive) &&
    Number.isFinite(Number(motiveNeeds?.[motive])) &&
    Number(motiveNeeds[motive]) <= SATISFIED_MOTIVE_THRESHOLD
  ));
  const positiveServiceMotives = Object.freeze([
    ...new Set([
      ...availableMotives.filter((motive) => POSITIVE_REVIEW_MOTIVES.has(motive)),
      ...satisfiedServiceMotives
    ])
  ]);
  const serviceBonus = positiveServiceMotives.length;
  const rating = Math.min(5, baseRating + serviceBonus);
  const normalizedToleranceIssues = Object.freeze(
    (Array.isArray(toleranceIssues) ? toleranceIssues : [])
      .map((issue) => Object.freeze({
        source: String(issue?.source || "").trim(),
        amount: Math.max(1, Math.floor(Number(issue?.amount) || 1))
      }))
      .filter((issue) => issue.source)
  );

  return Object.freeze({
    rating,
    band: getBandForRating(rating),
    baseRating,
    serviceBonus,
    positiveServiceMotives,
    toleranceUsed: normalizedUsed,
    toleranceLimit: normalizedLimit,
    toleranceRatio,
    toleranceIssues: normalizedToleranceIssues
  });
}
