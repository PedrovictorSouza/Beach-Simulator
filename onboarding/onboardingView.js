import { SOUND_IDS } from "../audio/soundManager.js";

const HAND_IMAGE_URL = new URL("../2d-objects/hand.png", import.meta.url).href;
const BATHER_THUMB_IMAGE_URL = new URL(
  "../2d-objects/HUD/bather-thumb.png",
  import.meta.url
).href;
const HUD_REVEAL_DELAY_MS = 200;
const BLINK_DURATION_MS = 1200;
const TARGET_GAP_PX = 8;
const READING_WORDS_PER_MINUTE = 200;
const MINIMUM_READING_TIME_MS = 4000;
const AUTO_DISMISS_GRACE_MS = 10000;
const NOTICE_TYPEWRITER_CHARACTER_DELAY_MS = 28;
const WORLD_HINT_MARGIN_PX = 24;
const WORLD_HINT_OFFSET_PX = 40;
const HAND_ALERT_REPEAT_COUNT = 3;
const HAND_ALERT_REPEAT_INTERVAL_MS = 320;

export function createOnboardingView({
  root,
  translator,
  windowRef = window,
  playSound = () => {}
}) {
  if (!root) {
    throw new Error("OnboardingView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("OnboardingView precisa de um translator.");
  }

  if (typeof playSound !== "function") {
    throw new Error("OnboardingView precisa de uma funcao playSound.");
  }

  const handElement = root.ownerDocument.createElement("img");
  const worldArrowElement = root.ownerDocument.createElement("div");
  const worldArrowShapeElement = root.ownerDocument.createElement("div");
  const worldArrowTailElement = root.ownerDocument.createElement("span");
  const worldArrowHeadElement = root.ownerDocument.createElement("span");
  const noticeElement = root.ownerDocument.createElement("aside");
  const noticeImageElement = root.ownerDocument.createElement("img");
  const noticeTextElement = root.ownerDocument.createElement("p");
  const noticeButtonElement = root.ownerDocument.createElement("button");
  let hideTimeoutId = null;
  let noticeTimeoutId = null;
  let noticeTypewriterId = null;
  let resolveNotice = null;
  let handAlertTimeoutIds = [];

  const clearHandAlertSequence = () => {
    handAlertTimeoutIds.forEach((timeoutId) => windowRef.clearTimeout(timeoutId));
    handAlertTimeoutIds = [];
  };

  const playHandAlertSequence = () => {
    clearHandAlertSequence();
    playSound(SOUND_IDS.ONBOARDING_ALERT);

    for (let index = 1; index < HAND_ALERT_REPEAT_COUNT; index += 1) {
      handAlertTimeoutIds.push(windowRef.setTimeout(
        () => playSound(SOUND_IDS.ONBOARDING_ALERT),
        index * HAND_ALERT_REPEAT_INTERVAL_MS
      ));
    }
  };

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
  noticeElement.setAttribute("aria-label", translator.t("onboarding.gameTip"));
  noticeElement.hidden = true;
  noticeImageElement.className = "onboarding-notice__image";
  noticeImageElement.src = BATHER_THUMB_IMAGE_URL;
  noticeImageElement.alt = "";
  noticeImageElement.setAttribute("aria-hidden", "true");
  noticeTextElement.className = "onboarding-notice__text";
  noticeButtonElement.className = "onboarding-notice__button";
  noticeButtonElement.type = "button";
  noticeButtonElement.textContent = translator.t("onboarding.ok");
  noticeElement.append(
    noticeImageElement,
    noticeTextElement,
    noticeButtonElement
  );
  root.append(handElement, worldArrowElement, noticeElement);

  translator.subscribe(() => {
    noticeElement.setAttribute("aria-label", translator.t("onboarding.gameTip"));
    noticeButtonElement.textContent = translator.t("onboarding.ok");
  });

  const hideNotice = () => {
    windowRef.clearTimeout(noticeTimeoutId);
    windowRef.clearInterval(noticeTypewriterId);
    noticeTypewriterId = null;
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
      clearHandAlertSequence();
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
      playHandAlertSequence();

      await new Promise((resolve) => {
        const hide = () => {
          clearHandAlertSequence();
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
    showNotice(messageOrOptions) {
      const normalizedMessage = typeof messageOrOptions === "string" ?
        String(messageOrOptions).trim() :
        translator.t(
          messageOrOptions?.messageId,
          messageOrOptions?.messageParams
        ).trim();

      if (!normalizedMessage) {
        throw new Error("OnboardingView precisa de um aviso com texto.");
      }

      hideNotice();
      noticeTextElement.textContent = "";
      noticeElement.hidden = false;
      void noticeElement.offsetWidth;
      noticeElement.classList.add("onboarding-notice--visible");

      const wordCount = normalizedMessage.split(/\s+/).length;
      const readingTimeMs = Math.max(
        MINIMUM_READING_TIME_MS,
        Math.ceil(wordCount / READING_WORDS_PER_MINUTE * 60000)
      );
      const reduceMotion = windowRef.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const typewriterDurationMs = reduceMotion ? 0 : (
        normalizedMessage.length * NOTICE_TYPEWRITER_CHARACTER_DELAY_MS
      );

      if (reduceMotion) {
        noticeTextElement.textContent = normalizedMessage;
      } else {
        let characterIndex = 0;

        noticeTypewriterId = windowRef.setInterval(() => {
          characterIndex += 1;
          noticeTextElement.textContent = normalizedMessage.slice(0, characterIndex);
          if (/\S/.test(normalizedMessage[characterIndex - 1] || "")) {
            playSound(SOUND_IDS.LETTER_INCREMENT);
          }

          if (characterIndex >= normalizedMessage.length) {
            windowRef.clearInterval(noticeTypewriterId);
            noticeTypewriterId = null;
          }
        }, NOTICE_TYPEWRITER_CHARACTER_DELAY_MS);
      }

      return new Promise((resolve) => {
        resolveNotice = resolve;
        noticeTimeoutId = windowRef.setTimeout(
          hideNotice,
          typewriterDurationMs + readingTimeMs + AUTO_DISMISS_GRACE_MS
        );
      });
    }
  });
}
