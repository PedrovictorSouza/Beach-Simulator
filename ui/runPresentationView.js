const DAY_INTRO_DURATION_MS = 1800;

export function createRunPresentationView({ root, hudRoot }) {
  if (!root || !hudRoot) {
    throw new Error("RunPresentationView precisa de root e hudRoot.");
  }

  const documentRef = root.ownerDocument;
  const windowRef = documentRef.defaultView;
  const element = documentRef.createElement("div");
  const titleElement = documentRef.createElement("strong");

  element.className = "run-intro";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "assertive");
  element.hidden = true;
  titleElement.className = "run-intro__title";
  element.append(titleElement);
  root.append(element);

  function setHudActive(active) {
    hudRoot.classList.toggle("game-hud--active", active);
    hudRoot.toggleAttribute("inert", !active);
    hudRoot.setAttribute("aria-hidden", String(!active));
  }

  setHudActive(false);

  return Object.freeze({
    setHudActive,
    async playDay(day) {
      if (!Number.isSafeInteger(day) || day <= 0) {
        throw new Error("RunPresentationView precisa de um dia inteiro positivo.");
      }

      setHudActive(false);
      titleElement.textContent = `DAY ${day}`;
      element.hidden = false;
      element.classList.remove("run-intro--playing");
      void element.offsetWidth;
      element.classList.add("run-intro--playing");

      await new Promise((resolve) => {
        windowRef.setTimeout(resolve, DAY_INTRO_DURATION_MS);
      });

      element.classList.remove("run-intro--playing");
      element.hidden = true;
    }
  });
}
