import { SOUND_IDS } from "../audio/soundManager.js";
import {
  RUN_LEADERBOARD_MODES,
  RUN_LEADERBOARD_STATUSES,
  RUN_LEADERBOARD_VISIBLE_ENTRY_COUNT
} from "../run/runLeaderboardController.js";
import { createRatingCounterView } from "./ratingCounterView.js";
import { presentRunReport } from "./runPresentationView.js";

const STAR_IMAGE_URL = new URL(
  "../2d-objects/HUD/star-HUD.png",
  import.meta.url
).href;

function clampRating(value) {
  return Math.min(5, Math.max(0, Number(value) || 0));
}

function formatRating(rating, translator) {
  return translator.formatNumber(clampRating(rating), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

export function createRunLeaderboardView({
  root,
  translator,
  onPlayAgain,
  playSound = () => {}
} = {}) {
  if (!root) {
    throw new Error("RunLeaderboardView precisa de root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("RunLeaderboardView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("section");
  const frameElement = documentRef.createElement("div");
  const headerElement = documentRef.createElement("header");
  const eyebrowElement = documentRef.createElement("span");
  const titleElement = documentRef.createElement("h1");
  const contentElement = documentRef.createElement("div");
  const scorePanelElement = documentRef.createElement("section");
  const verdictElement = documentRef.createElement("strong");
  const scoreLabelElement = documentRef.createElement("span");
  const ratingMeterElement = documentRef.createElement("div");
  const ratingValueElement = documentRef.createElement("strong");
  const reviewCountElement = documentRef.createElement("span");
  const statsElement = documentRef.createElement("div");
  const boardElement = documentRef.createElement("section");
  const boardHeaderElement = documentRef.createElement("div");
  const boardTitleElement = documentRef.createElement("strong");
  const boardScaleElement = documentRef.createElement("span");
  const entriesElement = documentRef.createElement("ol");
  const statusElement = documentRef.createElement("p");
  const localScoreForm = documentRef.createElement("form");
  const playerNameInput = documentRef.createElement("input");
  const saveScoreButton = documentRef.createElement("button");
  const actionsElement = documentRef.createElement("div");
  const nativeLeaderboardButton = documentRef.createElement("button");
  const playAgainButton = documentRef.createElement("button");
  const ratingCounterView = createRatingCounterView({
    root: ratingMeterElement,
    translator
  });
  let currentReportInput = null;
  let currentLeaderboardState = null;
  let saveLocalScore = null;
  let openNativeLeaderboard = null;
  let savingLocalScore = false;

  element.className = "run-final";
  element.hidden = true;
  element.setAttribute("role", "dialog");
  element.setAttribute("aria-modal", "true");
  element.setAttribute("aria-labelledby", "run-final-title");
  frameElement.className = "run-final__frame";
  headerElement.className = "run-final__header";
  eyebrowElement.className = "run-final__eyebrow";
  titleElement.className = "run-final__title";
  titleElement.id = "run-final-title";
  contentElement.className = "run-final__content";
  scorePanelElement.className = "run-final__score-panel";
  scorePanelElement.setAttribute("aria-labelledby", "run-final-score-label");
  verdictElement.className = "run-final__verdict";
  scoreLabelElement.className = "run-final__score-label";
  scoreLabelElement.id = "run-final-score-label";
  ratingMeterElement.className = "run-final__rating-meter";
  ratingMeterElement.addEventListener("animationstart", (event) => {
    if (
      event.animationName === "rating-star-pop" &&
      event.target?.classList?.contains("rating-counter__star")
    ) {
      playSound(SOUND_IDS.POP);
    }
  });
  ratingValueElement.className = "run-final__rating-value";
  reviewCountElement.className = "run-final__review-count";
  statsElement.className = "run-final__stats";
  boardElement.className = "run-final__board";
  boardElement.setAttribute("aria-labelledby", "run-final-board-title");
  boardHeaderElement.className = "run-final__board-header";
  boardTitleElement.className = "run-final__board-title";
  boardTitleElement.id = "run-final-board-title";
  boardScaleElement.className = "run-final__board-scale";
  entriesElement.className = "run-final__entries";
  statusElement.className = "run-final__status";
  statusElement.setAttribute("role", "status");
  statusElement.setAttribute("aria-live", "polite");
  localScoreForm.className = "run-final__name-form";
  localScoreForm.hidden = true;
  playerNameInput.className = "run-final__name-input";
  playerNameInput.type = "text";
  playerNameInput.maxLength = 12;
  playerNameInput.autocomplete = "nickname";
  playerNameInput.spellcheck = false;
  playerNameInput.addEventListener("input", () => {
    playerNameInput.removeAttribute("aria-invalid");
    playerNameInput.value = playerNameInput.value.toUpperCase();
  });
  saveScoreButton.className = "run-final__button run-final__button--save";
  saveScoreButton.type = "submit";
  actionsElement.className = "run-final__actions";
  nativeLeaderboardButton.className = "run-final__button";
  nativeLeaderboardButton.type = "button";
  nativeLeaderboardButton.hidden = true;
  playAgainButton.className = "run-final__button run-final__button--primary";
  playAgainButton.type = "button";
  playAgainButton.addEventListener("click", () => onPlayAgain?.());

  localScoreForm.append(playerNameInput, saveScoreButton);
  scorePanelElement.append(
    verdictElement,
    scoreLabelElement,
    ratingMeterElement,
    ratingValueElement,
    reviewCountElement,
    statsElement
  );
  boardHeaderElement.append(boardTitleElement, boardScaleElement);
  boardElement.append(
    boardHeaderElement,
    entriesElement,
    statusElement,
    localScoreForm
  );
  contentElement.append(scorePanelElement, boardElement);
  actionsElement.append(nativeLeaderboardButton, playAgainButton);
  headerElement.append(eyebrowElement, titleElement);
  frameElement.append(headerElement, contentElement, actionsElement);
  element.append(frameElement);
  root.append(element);

  const getBoardTitleId = (state) => {
    if (!state) {
      return "run.leaderboard.connecting";
    }

    if (state.mode === RUN_LEADERBOARD_MODES.IN_GAME) {
      return "run.leaderboard.worldTitle";
    }

    if (state.mode === RUN_LEADERBOARD_MODES.LOCAL) {
      return "run.leaderboard.personalTitle";
    }

    return "run.leaderboard.platformTitle";
  };
  const getStatusId = (state) => {
    if (!state) {
      return "run.leaderboard.loading";
    }

    if (state.mode === RUN_LEADERBOARD_MODES.LOCAL) {
      if (state.needsPlayerName) {
        return state.status === RUN_LEADERBOARD_STATUSES.SUBMIT_FAILED ?
          "run.leaderboard.submitFailed" :
          "run.leaderboard.saveHelp";
      }

      return state.status === RUN_LEADERBOARD_STATUSES.SAVED ?
        "run.leaderboard.scoreSaved" :
        "run.leaderboard.empty";
    }

    if (state.status === RUN_LEADERBOARD_STATUSES.LOAD_FAILED) {
      return "run.leaderboard.loadFailed";
    }

    if (state.status === RUN_LEADERBOARD_STATUSES.EMPTY) {
      return "run.leaderboard.empty";
    }

    if (state.mode === RUN_LEADERBOARD_MODES.NATIVE_POPUP) {
      return "run.leaderboard.nativePopupHelp";
    }

    if (state.mode === RUN_LEADERBOARD_MODES.NATIVE) {
      return "run.leaderboard.nativeManaged";
    }

    return state.playerName ?
      "run.leaderboard.scoreSubmittedAs" :
      "run.leaderboard.scoreSubmitted";
  };
  const renderEntries = (state) => {
    entriesElement.replaceChildren();
    const entries = Array.isArray(state?.entries) ? state.entries : [];

    if (entries.length === 0) {
      return;
    }

    for (const entry of entries) {
      const itemElement = documentRef.createElement("li");
      const rankElement = documentRef.createElement("strong");
      const nameElement = documentRef.createElement("span");
      const ratingElement = documentRef.createElement("span");
      const starElement = documentRef.createElement("img");

      itemElement.className = "run-final__entry";
      itemElement.classList.toggle(
        "run-final__entry--player",
        entry.isCurrentPlayer === true
      );
      if (entry.isCurrentPlayer) {
        itemElement.setAttribute("aria-current", "true");
      }
      rankElement.className = "run-final__entry-rank";
      rankElement.textContent = `#${entry.rank}`;
      nameElement.className = "run-final__entry-name";
      nameElement.textContent = String(entry.name || "").trim() ||
        translator.t("run.leaderboard.playerFallback");
      ratingElement.className = "run-final__entry-rating";
      starElement.src = STAR_IMAGE_URL;
      starElement.alt = "";
      ratingElement.append(
        starElement,
        documentRef.createTextNode(formatRating(entry.finalRating, translator))
      );
      itemElement.append(rankElement, nameElement, ratingElement);
      entriesElement.append(itemElement);
    }
  };
  const renderStats = () => {
    if (!currentReportInput) {
      return;
    }

    const money = Math.floor(
      Math.max(0, Number(currentReportInput.moneyInCents) || 0) / 100
    );
    const stats = [
      translator.t("reports.money", {
        amount: translator.formatCurrency(money)
      }),
      translator.t("reports.bathers", {
        count: translator.formatNumber(
          Math.max(0, Math.floor(Number(currentReportInput.totalBathers) || 0))
        )
      }),
      translator.t("reports.buildings", {
        count: translator.formatNumber(
          Math.max(0, Math.floor(Number(currentReportInput.buildingsBuilt) || 0))
        )
      })
    ];

    statsElement.replaceChildren(...stats.map((label) => {
      const statElement = documentRef.createElement("span");

      statElement.textContent = label;
      return statElement;
    }));
  };
  const renderStaticCopy = () => {
    eyebrowElement.textContent = translator.t("run.leaderboard.eyebrow");
    titleElement.textContent = translator.t("run.leaderboard.title");
    scoreLabelElement.textContent = translator.t("run.leaderboard.yourScore");
    boardTitleElement.textContent = translator.t(
      getBoardTitleId(currentLeaderboardState)
    );
    boardScaleElement.textContent = translator.t("run.leaderboard.scale");
    playerNameInput.placeholder = translator.t(
      "run.leaderboard.namePlaceholder"
    );
    playerNameInput.setAttribute(
      "aria-label",
      translator.t("run.leaderboard.nameAria")
    );
    saveScoreButton.textContent = translator.t("run.leaderboard.saveScore");
    nativeLeaderboardButton.textContent = translator.t(
      "run.leaderboard.openRanking"
    );
    playAgainButton.textContent = translator.t("run.playAgain");

    if (currentReportInput) {
      const report = presentRunReport(currentReportInput, translator);
      const reviewCount = Math.max(
        0,
        Math.trunc(Number(currentReportInput.reviewCount) || 0)
      );

      verdictElement.textContent = report.title;
      ratingValueElement.textContent = `${formatRating(
        currentReportInput.averageRating,
        translator
      )} / 5`;
      reviewCountElement.textContent = translator.t(
        reviewCount === 1 ?
          "run.leaderboard.reviewCountOne" :
          "run.leaderboard.reviewCount",
        { count: translator.formatNumber(reviewCount) }
      );
      renderStats();
    }

    if (currentLeaderboardState) {
      statusElement.textContent = translator.t(
        getStatusId(currentLeaderboardState),
        { name: currentLeaderboardState.playerName }
      );
      renderEntries(currentLeaderboardState);
    }
  };
  const renderLeaderboard = (state, callbacks = {}) => {
    currentLeaderboardState = state;
    saveLocalScore = typeof callbacks.onSaveLocalScore === "function" ?
      callbacks.onSaveLocalScore :
      saveLocalScore;
    openNativeLeaderboard =
      typeof callbacks.onOpenNativeLeaderboard === "function" ?
        callbacks.onOpenNativeLeaderboard :
        openNativeLeaderboard;
    boardElement.classList.toggle(
      "run-final__board--platform-managed",
      state?.mode === RUN_LEADERBOARD_MODES.NATIVE ||
      state?.mode === RUN_LEADERBOARD_MODES.NATIVE_POPUP
    );
    boardTitleElement.textContent = translator.t(getBoardTitleId(state));
    statusElement.textContent = translator.t(getStatusId(state), {
      name: state?.playerName || ""
    });
    renderEntries(state);
    localScoreForm.hidden = !state?.needsPlayerName;
    nativeLeaderboardButton.hidden = !state?.canOpenNative;
    playAgainButton.hidden = false;
    playAgainButton.disabled = false;
  };

  localScoreForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const playerName = playerNameInput.value
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 12);

    if (!playerName || !saveLocalScore || savingLocalScore) {
      playerNameInput.setAttribute("aria-invalid", "true");
      playerNameInput.focus();
      return;
    }

    savingLocalScore = true;
    playerNameInput.disabled = true;
    saveScoreButton.disabled = true;

    try {
      const state = await saveLocalScore(playerName);

      renderLeaderboard(state);
    } catch {
      playerNameInput.setAttribute("aria-invalid", "true");
      statusElement.textContent = translator.t("run.leaderboard.saveFailed");
      playerNameInput.focus();
    } finally {
      savingLocalScore = false;
      playerNameInput.disabled = false;
      saveScoreButton.disabled = false;
    }
  });
  nativeLeaderboardButton.addEventListener("click", async () => {
    if (!openNativeLeaderboard || nativeLeaderboardButton.disabled) {
      return;
    }

    nativeLeaderboardButton.disabled = true;
    const opened = await openNativeLeaderboard();

    nativeLeaderboardButton.disabled = false;
    if (!opened) {
      statusElement.textContent = translator.t("run.leaderboard.openFailed");
    }
  });

  translator.subscribe(renderStaticCopy);

  return Object.freeze({
    renderLeaderboard,
    show(input = {}) {
      currentReportInput = input;
      currentLeaderboardState = null;
      saveLocalScore = null;
      openNativeLeaderboard = null;
      playerNameInput.value = "";
      localScoreForm.hidden = true;
      nativeLeaderboardButton.hidden = true;
      playAgainButton.hidden = false;
      playAgainButton.disabled = true;
      boardElement.classList.remove("run-final__board--platform-managed");
      entriesElement.replaceChildren();

      for (let index = 0; index < RUN_LEADERBOARD_VISIBLE_ENTRY_COUNT; index += 1) {
        const placeholderElement = documentRef.createElement("li");

        placeholderElement.className =
          "run-final__entry run-final__entry--placeholder";
        placeholderElement.setAttribute("aria-hidden", "true");
        placeholderElement.textContent = "· · ·";
        entriesElement.append(placeholderElement);
      }

      ratingCounterView.render({
        averageRating: input.averageRating,
        reviewCount: input.reviewCount
      });
      renderStaticCopy();
      statusElement.textContent = translator.t("run.leaderboard.loading");
      element.hidden = false;
      element.classList.remove("run-final--playing");
      void element.offsetWidth;
      element.classList.add("run-final--playing");
    }
  });
}
