import {
  BUILDING_SERVICE_MOTIVES,
  BUILDING_TYPES
} from "../buildings/buildingServicesModel.js";
import { findMainReviewProblem } from "../ratings/dayReviewSummary.js";

const SERVICE_LABEL_IDS = Object.freeze({
  [BUILDING_TYPES.LIFEGUARD_BUILDING]: "lifeguard",
  [BUILDING_TYPES.TOILET_BUILDING]: "toilet"
});
const POSITIVE_SERVICE_LABEL_IDS = Object.freeze({
  [BUILDING_SERVICE_MOTIVES.CLEANLINESS]: "trashCans",
  [BUILDING_SERVICE_MOTIVES.SAFETY]: "lifeguard"
});
const PROBLEM_IDS = Object.freeze({
  "heat-without-beverage": "heat-without-beverage",
  "missing-entertainment": "missing-entertainment",
  "missing-wifi": "missing-wifi",
  "missing-toilet": "missing-toilet"
});

function assertTranslator(translator) {
  if (!translator || typeof translator.t !== "function") {
    throw new Error("DayClosingPresenter precisa de um translator.");
  }
}

export function presentDayClosing({
  charges = [],
  publicSupportInCents = 0,
  totalPaidInCents = 0
} = {}, translator) {
  assertTranslator(translator);
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
    lines.push(translator.t("reports.dayClosing.publicFund", {
      amount: translator.formatCurrency(
        Math.floor(normalizedPublicSupportInCents / 100)
      )
    }));
  }

  if (normalizedPaidInCents > 0) {
    lines.push(translator.t("reports.dayClosing.dailyCosts", {
      amount: translator.formatCurrency(
        Math.floor(normalizedPaidInCents / 100)
      )
    }));
  }

  for (const charge of Array.isArray(charges) ? charges : []) {
    const serviceId = SERVICE_LABEL_IDS[charge?.type];

    if (serviceId && charge.paid === false) {
      lines.push(translator.t("reports.dayClosing.closed", {
        service: translator.t(`reports.dayClosing.services.${serviceId}`)
      }));
    }
  }

  return lines.join("\n");
}

export function presentDayResult({
  reviews = [],
  closing = {},
  tasks = []
} = {}, translator) {
  assertTranslator(translator);
  const normalizedReviews = Array.isArray(reviews) ? reviews : [];
  const ratings = normalizedReviews
    .map((review) => Number(review?.rating))
    .filter((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5);
  const lines = ratings.length > 0 ? [
    translator.t("reports.dayClosing.yesterdayRating", {
      rating: translator.formatNumber(
        ratings.reduce((total, rating) => total + rating, 0) / ratings.length,
        { minimumFractionDigits: 1, maximumFractionDigits: 1 }
      )
    }),
    translator.t("reports.dayClosing.reviewsCount", {
      count: translator.formatNumber(ratings.length),
      label: translator.t(
        ratings.length === 1 ?
          "reports.dayClosing.review" :
          "reports.dayClosing.reviews"
      )
    })
  ] : [
    translator.t("reports.dayClosing.yesterdayNoReviews")
  ];
  const mainProblem = findMainReviewProblem(normalizedReviews);

  if (mainProblem) {
    lines.push(translator.t(
      `reports.dayClosing.problems.${PROBLEM_IDS[mainProblem] || mainProblem}`
    ));
  }

  const helpfulServices = Object.entries(POSITIVE_SERVICE_LABEL_IDS)
    .filter(([motive]) => normalizedReviews.some((review) =>
      review?.positiveServiceMotives?.includes(motive)))
    .map(([, labelId]) => translator.t(`reports.dayClosing.services.${labelId}`));

  if (helpfulServices.length > 0) {
    lines.push(translator.t("reports.dayClosing.servicesHelped", {
      services: helpfulServices.join(" + ")
    }));
  }

  const heatWaveTask = (Array.isArray(tasks) ? tasks : []).find((task) => (
    task?.id === "cool-down-heat-wave"
  ));

  if (heatWaveTask) {
    const progress = Math.max(0, Math.trunc(Number(heatWaveTask.progress) || 0));
    const target = Math.max(1, Math.trunc(Number(heatWaveTask.target) || 3));

    lines.push(progress >= target ?
      translator.t("reports.dayClosing.helpedTarget", {
        count: translator.formatNumber(target)
      }) : progress === 1 ?
      translator.t("reports.dayClosing.helpedOne", {
        count: translator.formatNumber(progress)
      }) :
      translator.t("reports.dayClosing.helpedMany", {
        count: translator.formatNumber(progress)
      }));
  }

  const closingNotice = presentDayClosing(closing, translator);

  if (closingNotice) {
    lines.push(closingNotice);
  }

  return lines.join("\n");
}
