const BATHER_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/bather-thumb.png",
  import.meta.url
).href;

export function createBatherCounterView({ root }) {
  if (!root) {
    throw new Error("BatherCounterView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("img");
  const countElement = documentRef.createElement("strong");
  const moodElement = documentRef.createElement("div");
  const moodTitleElement = documentRef.createElement("strong");
  const moodNeedElement = documentRef.createElement("span");

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
  moodElement.append(moodTitleElement, moodNeedElement);
  element.append(labelElement, countElement, moodElement);
  root.append(element);

  let renderedCount = null;

  return Object.freeze({
    render(count, bathers = []) {
      const nextCount = Math.max(0, Math.trunc(Number(count) || 0));

      if (nextCount !== renderedCount) {
        renderedCount = nextCount;
        countElement.textContent = String(nextCount);
        const noun = nextCount === 1 ? "bather" : "bathers";
        element.setAttribute("aria-label", `${nextCount} ${noun} on the beach`);
      }

      const moodBather = bathers
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
      moodElement.hidden = false;
      moodElement.dataset.moodBand = mood.band.toLowerCase();
      moodElement.style.setProperty("--bather-mood-score", `${mood.score}%`);
      moodTitleElement.textContent = `MOOD ${mood.band} ${mood.score}%`;
      moodNeedElement.textContent = `NEEDS ${mood.strongestNeed.label} ${mood.strongestNeed.value}%`;
      element.setAttribute(
        "aria-label",
        `${nextCount} ${nextCount === 1 ? "bather" : "bathers"} on the beach; ` +
          `focus mood ${mood.band} ${mood.score} percent; needs ${mood.strongestNeed.label}`
      );
    }
  });
}
