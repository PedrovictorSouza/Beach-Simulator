const HAND_IMAGE_URL = new URL("../2d-objects/hand.png", import.meta.url).href;
const HUD_REVEAL_DELAY_MS = 200;
const BLINK_DURATION_MS = 1200;
const TARGET_GAP_PX = 8;

export function createOnboardingView({ root, windowRef = window }) {
  if (!root) {
    throw new Error("OnboardingView precisa de um elemento root.");
  }

  const handElement = root.ownerDocument.createElement("img");
  let hideTimeoutId = null;

  handElement.className = "onboarding-hand";
  handElement.src = HAND_IMAGE_URL;
  handElement.alt = "";
  handElement.setAttribute("aria-hidden", "true");
  handElement.hidden = true;
  root.append(handElement);

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
    }
  });
}
