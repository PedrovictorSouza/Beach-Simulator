const STAR_COUNT = 5;
const STAR_IMAGE_URL = new URL(
  "../2d-objects/HUD/star-HUD.png",
  import.meta.url
).href;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createRatingCounterView({ root, translator }) {
  if (!root) {
    throw new Error("RatingCounterView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("RatingCounterView precisa de um translator.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("div");
  const labelElement = documentRef.createElement("span");
  const starsElement = documentRef.createElement("div");
  const starFillElements = [];

  element.className = "rating-counter";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  labelElement.className = "rating-counter__label";
  labelElement.textContent = translator.t("hud.rating.label");
  starsElement.className = "rating-counter__stars";
  starsElement.setAttribute("aria-hidden", "true");

  for (let index = 0; index < STAR_COUNT; index += 1) {
    const slotElement = documentRef.createElement("span");
    const emptyElement = documentRef.createElement("img");
    const fillElement = documentRef.createElement("span");
    const fillImageElement = documentRef.createElement("img");

    slotElement.className = "rating-counter__star";
    emptyElement.className = "rating-counter__star-empty";
    emptyElement.src = STAR_IMAGE_URL;
    emptyElement.alt = "";
    fillElement.className = "rating-counter__star-fill";
    fillImageElement.src = STAR_IMAGE_URL;
    fillImageElement.alt = "";
    fillElement.append(fillImageElement);
    slotElement.append(emptyElement, fillElement);
    starsElement.append(slotElement);
    starFillElements.push(fillElement);
  }

  element.append(labelElement, starsElement);
  root.append(element);

  let renderedRating = null;
  let renderedReviewCount = null;

  const renderAccessibleLabel = () => {
    if (renderedRating === null || renderedReviewCount === null) {
      return;
    }

    labelElement.textContent = translator.t("hud.rating.label");
    element.setAttribute(
      "aria-label",
      renderedReviewCount === 0 ?
        translator.t("hud.rating.noReviews") :
        translator.t("hud.rating.aria", {
          rating: translator.formatNumber(renderedRating, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }),
          count: translator.formatNumber(renderedReviewCount),
          reviewLabel: translator.t(
            renderedReviewCount === 1 ? "hud.rating.review" : "hud.rating.reviews"
          )
        })
    );
  };
  translator.subscribe(renderAccessibleLabel);

  return Object.freeze({
    render({ averageRating, reviewCount }) {
      const nextRating = clamp(Number(averageRating) || 0, 0, STAR_COUNT);
      const nextReviewCount = Math.max(0, Math.trunc(Number(reviewCount) || 0));

      if (nextRating === renderedRating && nextReviewCount === renderedReviewCount) {
        return;
      }

      renderedRating = nextRating;
      renderedReviewCount = nextReviewCount;

      starFillElements.forEach((fillElement, index) => {
        const fill = clamp(nextRating - index, 0, 1) * 100;

        fillElement.style.width = `${fill}%`;
      });

      renderAccessibleLabel();
    }
  });
}
