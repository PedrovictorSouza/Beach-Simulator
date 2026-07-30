const BATHER_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/bather-thumb.png",
  import.meta.url
).href;
const BATHER_COUNT_FEEDBACK_CLASSES = Object.freeze([
  "bather-counter__label--increased",
  "bather-counter__label--decreased"
]);

export function createBatherCounterView({ root, translator }) {
  if (!root) {
    throw new Error("BatherCounterView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("BatherCounterView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("img");
  const countElement = documentRef.createElement("strong");
  const moodElement = documentRef.createElement("div");
  const moodTitleElement = documentRef.createElement("strong");
  const moodNeedElement = documentRef.createElement("span");
  const moodActionElement = documentRef.createElement("span");

  element.className = "bather-counter";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  labelElement.className = "bather-counter__label";
  labelElement.src = BATHER_THUMB_IMAGE_URL;
  labelElement.alt = "";
  labelElement.setAttribute("aria-hidden", "true");
  countElement.className = "bather-counter__count";
  moodElement.className = "bather-counter__mood";
  moodTitleElement.className = "bather-counter__mood-title";
  moodNeedElement.className = "bather-counter__mood-need";
  moodActionElement.className = "bather-counter__mood-action";
  moodElement.append(moodTitleElement, moodNeedElement, moodActionElement);
  element.append(labelElement, countElement, moodElement);
  root.append(element);

  let renderedCount = null;
  let currentBathers = [];

  const renderState = (count, bathers) => {
    const nextCount = Math.max(0, Math.trunc(Number(count) || 0));
    const nextBathers = Array.isArray(bathers) ? bathers : [];
    const previousCount = renderedCount;

    currentBathers = nextBathers;
    renderedCount = nextCount;
    countElement.textContent = String(nextCount);
    if (previousCount !== null && nextCount !== previousCount) {
      labelElement.classList.remove(...BATHER_COUNT_FEEDBACK_CLASSES);
      void labelElement.offsetWidth;
      labelElement.classList.add(
        nextCount > previousCount ?
          BATHER_COUNT_FEEDBACK_CLASSES[0] :
          BATHER_COUNT_FEEDBACK_CLASSES[1]
      );
    }
    const countLabel = translator.t(
      nextCount === 1 ? "hud.bathers.singular" : "hud.bathers.plural"
    );
    element.setAttribute(
      "aria-label",
      translator.t("hud.bathers.onBeach", {
        count: translator.formatNumber(nextCount),
        label: countLabel
      })
    );

    const moodBather = nextBathers
      .filter((bather) => bather?.mood)
      .sort((left, right) => (
        left.mood.score - right.mood.score ||
        right.mood.strongestNeed.value - left.mood.strongestNeed.value
      ))[0];

    if (!moodBather) {
      moodElement.hidden = true;
      return;
    }

    const { mood } = moodBather;
    const bandId = String(mood.band || "").toLowerCase();
    const motive = mood.strongestNeed.motive;
    const band = translator.t(`hud.bathers.bands.${bandId}`);
    const need = translator.t(`hud.bathers.needsByMotive.${motive}`);
    const action = translator.t(`hud.bathers.actions.${motive}`);

    moodElement.hidden = false;
    moodElement.dataset.moodBand = bandId;
    moodElement.style.setProperty("--bather-mood-score", `${mood.score}%`);
    moodTitleElement.textContent = translator.t("hud.bathers.moodTitle", {
      band,
      score: translator.formatNumber(mood.score)
    });
    moodNeedElement.textContent = translator.t("hud.bathers.needs", {
      need,
      value: translator.formatNumber(mood.strongestNeed.value)
    });
    moodActionElement.textContent = action.includes("hud.") ?
      translator.t("hud.bathers.actions.watchBeach") :
      action;
    element.setAttribute(
      "aria-label",
      translator.t("hud.bathers.focusAria", {
        count: translator.formatNumber(nextCount),
        label: countLabel,
        band,
        score: translator.formatNumber(mood.score),
        need
      })
    );
  };
  translator.subscribe(() => {
    if (renderedCount !== null) {
      renderState(renderedCount, currentBathers);
    }
  });

  return Object.freeze({
    render(count, bathers = []) {
      renderState(count, bathers);
    }
  });
}
