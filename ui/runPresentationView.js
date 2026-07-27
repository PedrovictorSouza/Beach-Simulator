import { summarizeReviewProblems } from "../ratings/dayReviewSummary.js";

const DAY_INTRO_DURATION_MS = 1800;
const PROBLEM_ACTION_LABELS = Object.freeze({
  "heat-without-beverage": "DRINKS",
  "missing-entertainment": "VOLLEYBALL",
  "missing-toilet": "TOILETS",
  "missing-wifi": "WI-FI"
});

function presentRunVerdict(averageRating, reviewCount) {
  if (reviewCount <= 0) {
    return "BEACH OPENED!";
  }
  if (averageRating >= 4.5) {
    return "AMAZING BEACH!";
  }
  if (averageRating >= 3.5) {
    return "GREAT BEACH!";
  }
  if (averageRating >= 2.5) {
    return "GOOD START!";
  }
  return "KEEP IMPROVING!";
}

export function presentRunReport({
  moneyInCents = 0,
  averageRating = 0,
  reviewCount = 0,
  totalBathers = 0,
  buildingsBuilt = 0,
  reviews = [],
  closingNotice = ""
} = {}) {
  const mainProblemActions = summarizeReviewProblems(reviews, { limit: 2 })
    .map(({ source }) => PROBLEM_ACTION_LABELS[source] || "BATHER CARE");
  const money = Math.max(0, Number(moneyInCents) || 0) / 100;
  const normalizedReviewCount = Math.max(0, Number(reviewCount) || 0);
  const normalizedAverageRating = normalizedReviewCount > 0 ?
    Math.min(5, Math.max(0, Number(averageRating) || 0)) :
    0;
  const ratingLabel = normalizedReviewCount > 0 ?
    `${normalizedAverageRating.toFixed(1)} STARS` :
    "NO REVIEWS";

  const lines = [
    `RATING ${ratingLabel}`,
    `MONEY $${money.toFixed(2)}`,
    `BATHERS ${Math.max(0, Math.floor(Number(totalBathers) || 0))}`,
    `BUILDINGS ${Math.max(0, Math.floor(Number(buildingsBuilt) || 0))}`,
    mainProblemActions.length > 0 ?
      `NEXT TIME: ${mainProblemActions.join(" + ")} EARLIER!` :
      "BATHERS LOVED IT!"
  ];
  const normalizedClosingNotice = String(closingNotice || "").trim();

  if (normalizedClosingNotice) {
    lines.push(normalizedClosingNotice);
  }

  return Object.freeze({
    title: presentRunVerdict(normalizedAverageRating, normalizedReviewCount),
    lines: Object.freeze(lines)
  });
}

export function createRunPresentationView({ root, hudRoot, onPlayAgain }) {
  if (!root || !hudRoot) {
    throw new Error("RunPresentationView precisa de root e hudRoot.");
  }

  const documentRef = root.ownerDocument;
  const windowRef = documentRef.defaultView;
  const element = documentRef.createElement("div");
  const titleElement = documentRef.createElement("strong");
  const continueButton = documentRef.createElement("button");
  const playAgainButton = documentRef.createElement("button");
  let resolveDayAdvance = null;

  element.className = "run-intro";
  element.hidden = true;
  titleElement.className = "run-intro__title";
  titleElement.setAttribute("role", "status");
  titleElement.setAttribute("aria-live", "assertive");
  continueButton.className = "run-intro__action";
  continueButton.type = "button";
  continueButton.textContent = "CONTINUE";
  continueButton.hidden = true;
  continueButton.addEventListener("click", () => {
    const resolve = resolveDayAdvance;

    if (!resolve) {
      return;
    }

    resolveDayAdvance = null;
    continueButton.hidden = true;
    resolve();
  });
  playAgainButton.className = "run-intro__action";
  playAgainButton.type = "button";
  playAgainButton.textContent = "PLAY AGAIN";
  playAgainButton.hidden = true;
  playAgainButton.addEventListener("click", () => onPlayAgain?.());
  element.append(titleElement, continueButton, playAgainButton);
  root.append(element);

  function setHudActive(active) {
    hudRoot.classList.toggle("game-hud--active", active);
    hudRoot.toggleAttribute("inert", !active);
    hudRoot.setAttribute("aria-hidden", String(!active));
  }

  setHudActive(false);

  return Object.freeze({
    setHudActive,
    async playDay(day, { notice = "" } = {}) {
      if (!Number.isSafeInteger(day) || day <= 0) {
        throw new Error("RunPresentationView precisa de um dia inteiro positivo.");
      }

      const normalizedNotice = String(notice || "").trim();

      setHudActive(false);
      titleElement.style.removeProperty("font-size");
      titleElement.style.removeProperty("line-height");
      titleElement.style.removeProperty("text-align");
      titleElement.style.removeProperty("white-space");
      if (normalizedNotice) {
        titleElement.style.lineHeight = "1.5";
        titleElement.style.textAlign = "center";
        titleElement.style.whiteSpace = "pre-line";
      }
      titleElement.textContent = [`DAY ${day}`, normalizedNotice]
        .filter(Boolean)
        .join("\n");
      playAgainButton.hidden = true;
      continueButton.hidden = !normalizedNotice;
      element.hidden = false;
      element.classList.remove("run-intro--playing");
      element.classList.toggle("run-intro--waiting", Boolean(normalizedNotice));
      void element.offsetWidth;
      element.classList.add("run-intro--playing");

      if (normalizedNotice) {
        await new Promise((resolve) => {
          resolveDayAdvance = resolve;
        });
      } else {
        await new Promise((resolve) => {
          windowRef.setTimeout(resolve, DAY_INTRO_DURATION_MS);
        });
      }

      continueButton.hidden = true;
      element.classList.remove("run-intro--playing");
      element.classList.remove("run-intro--waiting");
      element.hidden = true;
    },
    showRunReport(input) {
      const report = presentRunReport(input);

      setHudActive(false);
      element.classList.remove("run-intro--playing");
      element.classList.remove("run-intro--waiting");
      continueButton.hidden = true;
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
