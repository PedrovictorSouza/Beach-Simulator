import { summarizeReviewProblems } from "../ratings/dayReviewSummary.js";
import { createRatingCounterView } from "./ratingCounterView.js";
import { SOUND_IDS } from "../audio/soundManager.js";

const PROBLEM_ACTION_IDS = Object.freeze({
  "heat-without-beverage": "drinks",
  "missing-entertainment": "volleyball",
  "missing-toilet": "toilets",
  "missing-wifi": "wifi"
});

function presentRunVerdict(averageRating, reviewCount, translator) {
  if (reviewCount <= 0) {
    return translator.t("reports.verdict.beachOpened");
  }
  if (averageRating >= 4.5) {
    return translator.t("reports.verdict.amazing");
  }
  if (averageRating >= 3.5) {
    return translator.t("reports.verdict.great");
  }
  if (averageRating >= 2.5) {
    return translator.t("reports.verdict.goodStart");
  }
  return translator.t("reports.verdict.keepImproving");
}

export function presentRunReport({
  moneyInCents = 0,
  averageRating = 0,
  reviewCount = 0,
  totalBathers = 0,
  buildingsBuilt = 0,
  dayRatings = [],
  reviews = [],
  closingNotice = ""
} = {}, translator) {
  if (!translator || typeof translator.t !== "function") {
    throw new Error("presentRunReport precisa de um translator.");
  }

  const mainProblemActions = summarizeReviewProblems(reviews, { limit: 2 })
    .map(({ source }) => translator.t(
      `reports.actions.${PROBLEM_ACTION_IDS[source] || "batherCare"}`
    ));
  const money = Math.floor(Math.max(0, Number(moneyInCents) || 0) / 100);
  const normalizedReviewCount = Math.max(0, Number(reviewCount) || 0);
  const normalizedAverageRating = normalizedReviewCount > 0 ?
    Math.min(5, Math.max(0, Number(averageRating) || 0)) :
    0;
  const ratingLabel = normalizedReviewCount > 0 ?
    translator.t("reports.stars", {
      value: translator.formatNumber(normalizedAverageRating, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })
    }) :
      translator.t("reports.noReviews");
  const dayScoreLabels = (Array.isArray(dayRatings) ? dayRatings : [])
    .map((dayRating) => {
      const day = Math.max(1, Math.trunc(Number(dayRating?.day) || 1));
      const dayReviewCount = Math.max(
        0,
        Math.trunc(Number(dayRating?.reviewCount) || 0)
      );

      if (dayReviewCount <= 0) {
        return translator.t("reports.scoreDayNoReviews", {
          day: translator.formatNumber(day)
        });
      }

      return translator.t("reports.scoreDay", {
        day: translator.formatNumber(day),
        rating: translator.formatNumber(
          Math.min(5, Math.max(0, Number(dayRating?.averageRating) || 0)),
          { minimumFractionDigits: 1, maximumFractionDigits: 1 }
        )
      });
    });

  const lines = [
    translator.t("reports.rating", { value: ratingLabel }),
    ...(dayScoreLabels.length > 0 ? [
      translator.t("reports.scoreHistory", {
        scores: dayScoreLabels.join(" • ")
      })
    ] : []),
    translator.t("reports.money", {
      amount: translator.formatCurrency(money)
    }),
    translator.t("reports.bathers", {
      count: translator.formatNumber(Math.max(0, Math.floor(Number(totalBathers) || 0)))
    }),
    translator.t("reports.buildings", {
      count: translator.formatNumber(Math.max(0, Math.floor(Number(buildingsBuilt) || 0)))
    }),
    mainProblemActions.length > 0 ?
      translator.t("reports.nextTime", {
        actions: mainProblemActions.join(" + ")
      }) :
      translator.t("reports.loved")
  ];
  const normalizedClosingNotice = String(closingNotice || "").trim();

  if (normalizedClosingNotice) {
    lines.push(normalizedClosingNotice);
  }

  return Object.freeze({
    title: presentRunVerdict(
      normalizedAverageRating,
      normalizedReviewCount,
      translator
    ),
    lines: Object.freeze(lines)
  });
}

export function createRunPresentationView({
  root,
  hudRoot,
  translator,
  onPlayAgain,
  playSound = () => {}
}) {
  if (!root || !hudRoot) {
    throw new Error("RunPresentationView precisa de root e hudRoot.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("RunPresentationView precisa de um translator.");
  }

  if (typeof playSound !== "function") {
    throw new Error("RunPresentationView precisa de uma funcao playSound.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const titleElement = documentRef.createElement("strong");
  const noticeElement = documentRef.createElement("p");
  const ratingSpotlightElement = documentRef.createElement("section");
  const ratingTitleElement = documentRef.createElement("strong");
  const ratingMeterElement = documentRef.createElement("div");
  const ratingScoreElement = documentRef.createElement("strong");
  const continueButton = documentRef.createElement("button");
  const playAgainButton = documentRef.createElement("button");
  let resolveDayAdvance = null;

  element.className = "run-intro";
  element.hidden = true;
  titleElement.className = "run-intro__title";
  titleElement.setAttribute("role", "status");
  titleElement.setAttribute("aria-live", "assertive");
  noticeElement.className = "run-intro__notice";
  noticeElement.hidden = true;
  ratingSpotlightElement.className = "rating-spotlight";
  ratingSpotlightElement.hidden = true;
  ratingTitleElement.className = "rating-spotlight__title";
  ratingTitleElement.textContent = translator.t("run.finalRating");
  ratingMeterElement.className = "rating-spotlight__meter";
  const ratingCounterView = createRatingCounterView({
    root: ratingMeterElement,
    translator
  });
  ratingMeterElement.querySelector(".rating-counter")?.classList.add(
    "rating-spotlight__counter"
  );
  ratingMeterElement.addEventListener("animationstart", (event) => {
    if (
      event.animationName !== "rating-star-pop" ||
      !event.target?.classList?.contains("rating-counter__star")
    ) {
      return;
    }

    playSound(SOUND_IDS.POP);
  });
  ratingScoreElement.className = "rating-spotlight__score";
  ratingSpotlightElement.append(
    ratingTitleElement,
    ratingMeterElement,
    ratingScoreElement
  );
  continueButton.className = "run-intro__action";
  continueButton.type = "button";
  continueButton.textContent = translator.t("run.continue");
  continueButton.hidden = true;
  continueButton.addEventListener("click", () => {
    const resolve = resolveDayAdvance;

    if (!resolve) {
      return;
    }

    playSound(SOUND_IDS.DEFAULT_BUTTON);
    resolveDayAdvance = null;
    continueButton.hidden = true;
    resolve();
  });
  playAgainButton.className = "run-intro__action";
  playAgainButton.type = "button";
  playAgainButton.textContent = translator.t("run.playAgain");
  playAgainButton.hidden = true;
  playAgainButton.addEventListener("click", () => onPlayAgain?.());
  element.append(
    titleElement,
    noticeElement,
    ratingSpotlightElement,
    continueButton,
    playAgainButton
  );
  root.append(element);

  translator.subscribe(() => {
    ratingTitleElement.textContent = translator.t("run.finalRating");
    continueButton.textContent = translator.t("run.continue");
    playAgainButton.textContent = translator.t("run.playAgain");
  });

  function setHudActive(active) {
    hudRoot.classList.toggle("game-hud--active", active);
    hudRoot.toggleAttribute("inert", !active);
    hudRoot.setAttribute("aria-hidden", String(!active));
  }

  setHudActive(false);

  function renderRatingSpotlight({
    averageRating = 0,
    reviewCount = 0,
    animate = false
  } = {}) {
    const normalizedReviewCount = Math.max(0, Math.trunc(Number(reviewCount) || 0));
    const normalizedRating = normalizedReviewCount > 0 ?
      Math.min(5, Math.max(0, Number(averageRating) || 0)) :
      0;

    ratingCounterView.render({
      averageRating: normalizedRating,
      reviewCount: normalizedReviewCount
    });
    ratingTitleElement.textContent = translator.t("run.finalRating");
    ratingScoreElement.textContent = normalizedReviewCount > 0 ?
      `${translator.formatNumber(normalizedRating, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })} / 5` :
      translator.t("hud.rating.noReviews");
    ratingSpotlightElement.hidden = false;
    ratingSpotlightElement.classList.remove("rating-spotlight--playing");

    if (animate) {
      void ratingSpotlightElement.offsetWidth;
      ratingSpotlightElement.classList.add("rating-spotlight--playing");
    }
  }

  return Object.freeze({
    setHudActive,
    async playDay(day, {
      notice = "",
      averageRating = 0,
      reviewCount = 0
    } = {}) {
      if (!Number.isSafeInteger(day) || day <= 0) {
        throw new Error("RunPresentationView precisa de um dia inteiro positivo.");
      }

      const normalizedNotice = String(notice || "").trim();

      setHudActive(false);
      renderRatingSpotlight({
        averageRating,
        reviewCount,
        animate: true
      });
      titleElement.style.removeProperty("font-size");
      titleElement.style.removeProperty("line-height");
      titleElement.style.removeProperty("text-align");
      titleElement.style.removeProperty("white-space");
      titleElement.textContent = translator.t("run.day", {
        day: translator.formatNumber(day)
      });
      noticeElement.textContent = normalizedNotice;
      noticeElement.hidden = !normalizedNotice;
      playAgainButton.hidden = true;
      continueButton.hidden = false;
      element.hidden = false;
      element.classList.remove("run-intro--playing");
      element.classList.add("run-intro--waiting");
      element.classList.add("run-intro--summary");
      if (day === 1) {
        playSound(SOUND_IDS.DAY_1_INTRO);
      }
      void element.offsetWidth;
      element.classList.add("run-intro--playing");

      await new Promise((resolve) => {
        resolveDayAdvance = resolve;
      });

      continueButton.hidden = true;
      element.classList.remove("run-intro--playing");
      element.classList.remove("run-intro--waiting");
      element.classList.remove("run-intro--summary");
      noticeElement.hidden = true;
      element.hidden = true;
    },
    showRunReport(input) {
      const report = presentRunReport(input, translator);

      setHudActive(false);
      renderRatingSpotlight({
        averageRating: input?.averageRating,
        reviewCount: input?.reviewCount,
        animate: true
      });
      element.classList.remove("run-intro--playing");
      element.classList.remove("run-intro--waiting");
      element.classList.remove("run-intro--summary");
      continueButton.hidden = true;
      noticeElement.hidden = true;
      titleElement.style.fontSize = "1rem";
      titleElement.style.lineHeight = "1.6";
      titleElement.style.textAlign = "center";
      titleElement.style.whiteSpace = "pre-line";
      titleElement.textContent = [report.title, ...report.lines].join("\n");
      playAgainButton.hidden = false;
      element.hidden = false;
      return report;
    }
  });
}
