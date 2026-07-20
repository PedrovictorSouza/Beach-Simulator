const HAND_IMAGE_URL = new URL("../2d-objects/hand.png", import.meta.url).href;
const HUD_REVEAL_DELAY_MS = 200;
const BLINK_DURATION_MS = 1200;
const TARGET_GAP_PX = 8;
const READING_WORDS_PER_MINUTE = 200;
const MINIMUM_READING_TIME_MS = 4000;
const AUTO_DISMISS_GRACE_MS = 10000;
const WORLD_HINT_MARGIN_PX = 24;
const WORLD_HINT_OFFSET_PX = 40;

export function createOnboardingView({ root, windowRef = window }) {
  if (!root) {
    throw new Error("OnboardingView precisa de um elemento root.");
  }

  const handElement = root.ownerDocument.createElement("img");
  const worldArrowElement = root.ownerDocument.createElement("div");
  const worldArrowShapeElement = root.ownerDocument.createElement("div");
  const worldArrowTailElement = root.ownerDocument.createElement("span");
  const worldArrowHeadElement = root.ownerDocument.createElement("span");
  const noticeElement = root.ownerDocument.createElement("aside");
  const noticeImageElement = root.ownerDocument.createElement("div");
  const noticeTextElement = root.ownerDocument.createElement("p");
  const noticeButtonElement = root.ownerDocument.createElement("button");
  let hideTimeoutId = null;
  let noticeTimeoutId = null;
  let resolveNotice = null;

  handElement.className = "onboarding-hand";
  handElement.src = HAND_IMAGE_URL;
  handElement.alt = "";
  handElement.setAttribute("aria-hidden", "true");
  handElement.hidden = true;
  worldArrowElement.className = "onboarding-world-arrow";
  worldArrowElement.setAttribute("aria-hidden", "true");
  worldArrowElement.hidden = true;
  worldArrowShapeElement.className = "onboarding-world-arrow__shape";
  worldArrowTailElement.className = "onboarding-world-arrow__tail";
  worldArrowHeadElement.className = "onboarding-world-arrow__head";
  worldArrowShapeElement.append(worldArrowTailElement, worldArrowHeadElement);
  worldArrowElement.append(worldArrowShapeElement);
  noticeElement.className = "onboarding-notice";
  noticeElement.setAttribute("role", "dialog");
  noticeElement.setAttribute("aria-label", "Game tip");
  noticeElement.hidden = true;
  noticeImageElement.className = "onboarding-notice__image";
  noticeImageElement.setAttribute("aria-hidden", "true");
  noticeImageElement.textContent = "?";
  noticeTextElement.className = "onboarding-notice__text";
  noticeButtonElement.className = "onboarding-notice__button";
  noticeButtonElement.type = "button";
  noticeButtonElement.textContent = "OK";
  noticeElement.append(
    noticeImageElement,
    noticeTextElement,
    noticeButtonElement
  );
  root.append(handElement, worldArrowElement, noticeElement);

  const hideNotice = () => {
    windowRef.clearTimeout(noticeTimeoutId);
    noticeElement.classList.remove("onboarding-notice--visible");
    noticeElement.hidden = true;
    resolveNotice?.();
    resolveNotice = null;
  };

  noticeButtonElement.addEventListener("click", hideNotice);

  return Object.freeze({
    async pointTo(targetSelector) {
      const target = root.querySelector(targetSelector);

      if (!target) {
        throw new Error("OnboardingView nao encontrou o alvo.");
      }

      windowRef.clearTimeout(hideTimeoutId);
      handElement.classList.remove("onboarding-hand--playing");
      handElement.hidden = false;

      await new Promise((resolve) => {
        windowRef.setTimeout(resolve, HUD_REVEAL_DELAY_MS);
      });

      const rootRect = root.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const preferredLeft = targetRect.right - rootRect.left + TARGET_GAP_PX;
      const maxLeft = Math.max(0, root.clientWidth - handElement.offsetWidth);

      handElement.style.left = `${Math.min(preferredLeft, maxLeft)}px`;
      handElement.style.top = `${targetRect.top - rootRect.top + targetRect.height * 0.5}px`;
      handElement.classList.add("onboarding-hand--playing");

      await new Promise((resolve) => {
        const hide = () => {
          handElement.classList.remove("onboarding-hand--playing");
          handElement.hidden = true;
          resolve();
        };

        if (windowRef.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
          hideTimeoutId = windowRef.setTimeout(hide, BLINK_DURATION_MS);
          return;
        }

        handElement.addEventListener("animationend", hide, { once: true });
      });
    },
    showWorldHint({ x, y }) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        worldArrowElement.hidden = true;
        return;
      }

      const maxX = Math.max(WORLD_HINT_MARGIN_PX, root.clientWidth - WORLD_HINT_MARGIN_PX);
      const maxY = Math.max(WORLD_HINT_MARGIN_PX, root.clientHeight - WORLD_HINT_MARGIN_PX);
      const targetIsOnStage = (
        x >= WORLD_HINT_MARGIN_PX && x <= maxX &&
        y >= WORLD_HINT_MARGIN_PX && y <= maxY
      );
      const arrowX = Math.min(maxX, Math.max(WORLD_HINT_MARGIN_PX, x));
      const arrowY = targetIsOnStage ?
        Math.max(WORLD_HINT_MARGIN_PX, y - WORLD_HINT_OFFSET_PX) :
        Math.min(maxY, Math.max(WORLD_HINT_MARGIN_PX, y));
      const angle = Math.atan2(y - arrowY, x - arrowX) * 180 / Math.PI;

      worldArrowElement.style.left = `${arrowX}px`;
      worldArrowElement.style.top = `${arrowY}px`;
      worldArrowElement.style.setProperty("--world-arrow-angle", `${angle}deg`);
      worldArrowElement.hidden = false;
    },
    hideWorldHint() {
      worldArrowElement.hidden = true;
    },
    showNotice(message) {
      const normalizedMessage = String(message || "").trim();

      if (!normalizedMessage) {
        throw new Error("OnboardingView precisa de um aviso com texto.");
      }

      hideNotice();
      noticeTextElement.textContent = normalizedMessage;
      noticeElement.hidden = false;
      void noticeElement.offsetWidth;
      noticeElement.classList.add("onboarding-notice--visible");

      const wordCount = normalizedMessage.split(/\s+/).length;
      const readingTimeMs = Math.max(
        MINIMUM_READING_TIME_MS,
        Math.ceil(wordCount / READING_WORDS_PER_MINUTE * 60000)
      );

      return new Promise((resolve) => {
        resolveNotice = resolve;
        noticeTimeoutId = windowRef.setTimeout(
          hideNotice,
          readingTimeMs + AUTO_DISMISS_GRACE_MS
        );
      });
    }
  });
}
