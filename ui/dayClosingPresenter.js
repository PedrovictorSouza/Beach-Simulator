import {
  BUILDING_SERVICE_MOTIVES,
  BUILDING_TYPES
} from "../buildings/buildingServicesModel.js";
import { findMainReviewProblem } from "../ratings/dayReviewSummary.js";
import { presentBeachProblemFeedback } from "./batherNeedPresenter.js";

const SERVICE_LABELS = Object.freeze({
  [BUILDING_TYPES.LIFEGUARD_BUILDING]: "LIFEGUARD",
  [BUILDING_TYPES.TOILET_BUILDING]: "TOILET"
});
const POSITIVE_SERVICE_LABELS = Object.freeze({
  [BUILDING_SERVICE_MOTIVES.CLEANLINESS]: "TRASH CANS",
  [BUILDING_SERVICE_MOTIVES.SAFETY]: "LIFEGUARD"
});

export function presentDayClosing({
  charges = [],
  publicSupportInCents = 0,
  totalPaidInCents = 0
} = {}) {
  const lines = [];
  const normalizedPublicSupportInCents = Math.max(
    0,
    Math.trunc(Number(publicSupportInCents) || 0)
  );
  const normalizedPaidInCents = Math.max(
    0,
    Math.trunc(Number(totalPaidInCents) || 0)
  );

  if (normalizedPublicSupportInCents > 0) {
    const amount = normalizedPublicSupportInCents / 100;
    lines.push(`PUBLIC BEACH FUND +$${amount}`);
  }

  if (normalizedPaidInCents > 0) {
    const amount = normalizedPaidInCents % 100 === 0 ?
      String(normalizedPaidInCents / 100) :
      (normalizedPaidInCents / 100).toFixed(2);

    lines.push(`DAILY COSTS -$${amount}`);
  }

  for (const charge of Array.isArray(charges) ? charges : []) {
    const serviceLabel = SERVICE_LABELS[charge?.type];

    if (serviceLabel && charge.paid === false) {
      lines.push(`${serviceLabel} CLOSED!`);
    }
  }

  return lines.join("\n");
}

export function presentDayResult({
  reviews = [],
  closing = {}
} = {}) {
  const normalizedReviews = Array.isArray(reviews) ? reviews : [];
  const ratings = normalizedReviews
    .map((review) => Number(review?.rating))
    .filter((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5);
  const lines = ratings.length > 0 ? [
    `YESTERDAY ${(ratings.reduce((total, rating) => total + rating, 0) /
      ratings.length).toFixed(1)} STARS`,
    `${ratings.length} ${ratings.length === 1 ? "REVIEW" : "REVIEWS"}`
  ] : [
    "YESTERDAY NO REVIEWS"
  ];
  const mainProblem = findMainReviewProblem(normalizedReviews);

  if (mainProblem) {
    lines.push(presentBeachProblemFeedback(mainProblem));
  }

  const helpfulServices = Object.entries(POSITIVE_SERVICE_LABELS)
    .filter(([motive]) => normalizedReviews.some((review) =>
      review?.positiveServiceMotives?.includes(motive)))
    .map(([, label]) => label);

  if (helpfulServices.length > 0) {
    lines.push(`${helpfulServices.join(" + ")} HELPED!`);
  }

  const closingNotice = presentDayClosing(closing);

  if (closingNotice) {
    lines.push(closingNotice);
  }

  return lines.join("\n");
}
