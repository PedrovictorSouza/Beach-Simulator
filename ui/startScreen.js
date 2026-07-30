const START_TRANSITION_DURATION_MS = 350;
import { LANGUAGE_OPTIONS } from "../i18n/index.js";
import { SOUND_IDS } from "../audio/soundManager.js";

export function createStartScreenView({
  root,
  translator,
  playSound = () => {}
}) {
  if (!root) {
    throw new Error("StartScreenView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("StartScreenView precisa de um translator.");
  }

  if (typeof playSound !== "function") {
    throw new Error("StartScreenView precisa de uma funcao playSound.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("section");
  const title = documentRef.createElement("h1");
  const button = documentRef.createElement("button");
  const languagePanel = documentRef.createElement("div");
  const languageTitle = documentRef.createElement("h2");
  const languageOptionsElement = documentRef.createElement("div");
  let ready = false;
  let startRequested = false;
  let languageSelected = false;
  let resolveStart;
  let resolveLanguage;
  let transitionTimeoutId = null;

  element.className = "start-screen";
  element.setAttribute("aria-label", translator.t("start.screenAria"));

  title.className = "start-screen__title";
  title.textContent = translator.t("start.title");

  button.className = "start-screen__button";
  button.type = "button";
  button.dataset.soundId = SOUND_IDS.START_BUTTON;
  button.disabled = true;
  button.textContent = translator.t("start.loading");

  languagePanel.className = "start-screen__language-panel";
  languagePanel.hidden = true;
  languageTitle.className = "start-screen__language-title";
  languageTitle.id = "start-screen-language-title";
  languageTitle.textContent = translator.t("start.chooseLanguage");
  languageOptionsElement.className = "start-screen__language-options";
  languageOptionsElement.setAttribute("role", "group");
  languageOptionsElement.setAttribute(
    "aria-labelledby",
    languageTitle.id
  );
  const languageButtons = LANGUAGE_OPTIONS.map(({ locale, label }) => {
    const languageButton = documentRef.createElement("button");

    languageButton.className = "start-screen__language-option";
    languageButton.type = "button";
    languageButton.dataset.soundId = SOUND_IDS.LANGUAGE_CHOICE;
    languageButton.dataset.locale = locale;
    languageButton.textContent = label;
    return languageButton;
  });
  languageOptionsElement.append(...languageButtons);
  languagePanel.append(languageTitle, languageOptionsElement);

  const startPromise = new Promise((resolve) => {
    resolveStart = resolve;
  });
  const languagePromise = new Promise((resolve) => {
    resolveLanguage = resolve;
  });
  const showLanguageSelection = () => {
    element.classList.remove("start-screen--leaving");
    element.classList.add("start-screen--language");
    element.setAttribute("aria-label", translator.t("start.languageAria"));
    button.hidden = true;
    languagePanel.hidden = false;
    languageButtons[0]?.focus();
    resolveStart();
  };
  const handleStart = () => {
    if (!ready || startRequested) {
      return;
    }

    startRequested = true;
    button.disabled = true;
    playSound(SOUND_IDS.START_BUTTON);
    element.classList.add("start-screen--leaving");
    transitionTimeoutId = root.ownerDocument.defaultView.setTimeout(
      showLanguageSelection,
      START_TRANSITION_DURATION_MS
    );
  };
  const handleLanguageChoice = (event) => {
    const languageButton = event.target.closest?.("[data-locale]");

    if (
      !languageButton ||
      !languageOptionsElement.contains(languageButton) ||
      languageSelected
    ) {
      return;
    }

    playSound(SOUND_IDS.LANGUAGE_CHOICE);
    languageSelected = true;
    languageButtons.forEach((buttonElement) => {
      buttonElement.disabled = true;
    });
    resolveLanguage(languageButton.dataset.locale);
  };

  button.addEventListener("click", handleStart);
  languageOptionsElement.addEventListener("click", handleLanguageChoice);
  element.append(title, button, languagePanel);
  root.append(element);

  return Object.freeze({
    setReady() {
      if (startRequested) {
        return;
      }

      ready = true;
      button.disabled = false;
      button.textContent = translator.t("start.pressStart");
      button.focus();
    },
    waitForStart() {
      return startPromise;
    },
    waitForLanguage() {
      return languagePromise;
    },
    destroy() {
      root.ownerDocument.defaultView.clearTimeout(transitionTimeoutId);
      button.removeEventListener("click", handleStart);
      languageOptionsElement.removeEventListener("click", handleLanguageChoice);
      element.remove();
    }
  });
}
