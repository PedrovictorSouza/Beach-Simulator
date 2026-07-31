import { LANGUAGE_OPTIONS } from "../i18n/index.js";
import { SOUND_IDS } from "../audio/soundManager.js";
import podcastGirlSpriteSheetUrl from "../2d-objects/podcast-girl.png";
import starHudUrl from "../2d-objects/HUD/star-HUD.png";
import { createTypewriter } from "./typewriter.js";

const START_TRANSITION_DURATION_MS = 350;
const STORY_PAGES = Object.freeze([
  Object.freeze({ messageId: "start.storyPages.welcome" }),
  Object.freeze({ messageId: "start.storyPages.locations" }),
  Object.freeze({ messageId: "start.storyPages.competition" }),
  Object.freeze({
    beforeMessageId: "start.storyPages.ratingBefore",
    afterMessageId: "start.storyPages.ratingAfter",
    includesRatingStar: true
  }),
  Object.freeze({ messageId: "start.storyPages.goodLuck" })
]);
const FINAL_STORY_PAGE_INDEX = STORY_PAGES.length - 1;

export const PRIMARY_SCREEN_IDS = Object.freeze({
  START: "start",
  STORY: "story",
  GAMEPLAY: "gameplay"
});

const PRIMARY_SCREEN_ID_SET = new Set(Object.values(PRIMARY_SCREEN_IDS));

export function createPrimaryScreenFlow({
  root,
  translator,
  playSound = () => {}
}) {
  if (!root) {
    throw new Error("PrimaryScreenFlow precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("PrimaryScreenFlow precisa de um translator.");
  }

  if (typeof playSound !== "function") {
    throw new Error("PrimaryScreenFlow precisa de uma funcao playSound.");
  }

  const documentRef = root.ownerDocument;
  const startElement = documentRef.createElement("section");
  const title = documentRef.createElement("h1");
  const button = documentRef.createElement("button");
  const languagePanel = documentRef.createElement("div");
  const languageTitle = documentRef.createElement("h2");
  const languageOptionsElement = documentRef.createElement("div");
  const storyElement = documentRef.createElement("section");
  const storyImage = documentRef.createElement("div");
  const storySpriteSheet = documentRef.createElement("img");
  const storyText = documentRef.createElement("p");
  const storyButton = documentRef.createElement("button");
  const primaryScreenElements = new Map([
    [PRIMARY_SCREEN_IDS.START, startElement],
    [PRIMARY_SCREEN_IDS.STORY, storyElement],
    [PRIMARY_SCREEN_IDS.GAMEPLAY, null]
  ]);
  const activeScreenIds = new Set();
  let ready = false;
  let startRequested = false;
  let languageSelected = false;
  let storyCompleted = false;
  let storyPageIndex = 0;
  let resolveStart;
  let resolveLanguage;
  let resolveStory;
  let transitionTimeoutId = null;
  let storyTransitionTimeoutId = null;

  startElement.className = "start-screen";
  startElement.setAttribute("aria-label", translator.t("start.screenAria"));

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

  storyElement.className = "story-screen";
  storyElement.setAttribute("aria-label", translator.t("start.storyAria"));
  storyElement.hidden = true;
  storyImage.className = "story-screen__image";
  storyImage.setAttribute("role", "img");
  storySpriteSheet.className = "story-screen__sprite-sheet";
  storySpriteSheet.src = podcastGirlSpriteSheetUrl;
  storySpriteSheet.width = 902;
  storySpriteSheet.height = 342;
  storySpriteSheet.alt = "";
  storySpriteSheet.setAttribute("draggable", "false");
  storyImage.append(storySpriteSheet);
  storyText.className = "story-screen__text";
  storyButton.className = "story-screen__button";
  storyButton.type = "button";
  storyButton.dataset.soundId = SOUND_IDS.DEFAULT_BUTTON;
  storyElement.append(storyImage, storyText, storyButton);
  const storyTypewriter = createTypewriter({
    target: storyText,
    windowRef: documentRef.defaultView,
    onCharacter: () => playSound(SOUND_IDS.LETTER_INCREMENT)
  });
  const createInlineRatingStar = () => {
    const starElement = documentRef.createElement("img");

    starElement.className = "story-screen__inline-star";
    starElement.src = starHudUrl;
    starElement.width = 12;
    starElement.height = 11;
    starElement.alt = "";
    starElement.setAttribute("aria-hidden", "true");
    starElement.setAttribute("draggable", "false");
    return starElement;
  };
  const getStoryPagePresentation = (pageIndex) => {
    const page = STORY_PAGES[pageIndex];

    if (!page) {
      throw new Error(`Pagina da Story desconhecida: ${pageIndex}.`);
    }

    if (!page.includesRatingStar) {
      const text = translator.t(page.messageId);

      return Object.freeze({
        accessibleText: text,
        content: text
      });
    }

    const before = translator.t(page.beforeMessageId);
    const after = translator.t(page.afterMessageId);
    const ratingLabel = translator.t("start.storyRatingLabel");

    return Object.freeze({
      accessibleText: `${before}${ratingLabel}${after}`,
      content: Object.freeze([
        before,
        createInlineRatingStar(),
        after
      ])
    });
  };
  const renderStoryPage = () => {
    const presentation = getStoryPagePresentation(storyPageIndex);
    const isFinalPage = storyPageIndex === FINAL_STORY_PAGE_INDEX;

    storyElement.dataset.storyPage = String(storyPageIndex + 1);
    storyText.setAttribute("aria-label", presentation.accessibleText);
    storyButton.textContent = translator.t(
      isFinalPage ? "start.storyBegin" : "run.continue"
    );
    void storyTypewriter.play(presentation.content);
  };

  const getSnapshot = () => Object.freeze({
    activeScreen: activeScreenIds.values().next().value || null
  });
  const activate = (screenId) => {
    if (!PRIMARY_SCREEN_ID_SET.has(screenId)) {
      throw new Error(`Tela primaria desconhecida: ${screenId}.`);
    }

    activeScreenIds.clear();
    activeScreenIds.add(screenId);
    root.dataset.primaryScreen = screenId;

    for (const [registeredScreenId, screenElement] of primaryScreenElements) {
      if (!screenElement) {
        continue;
      }

      const active = registeredScreenId === screenId;

      screenElement.hidden = !active;
      screenElement.toggleAttribute("inert", !active);
      screenElement.setAttribute("aria-hidden", String(!active));
    }

    if (activeScreenIds.size !== 1) {
      throw new Error("PrimaryScreenFlow precisa manter uma tela ativa.");
    }

    return getSnapshot();
  };

  const startPromise = new Promise((resolve) => {
    resolveStart = resolve;
  });
  const languagePromise = new Promise((resolve) => {
    resolveLanguage = resolve;
  });
  const storyPromise = new Promise((resolve) => {
    resolveStory = resolve;
  });
  const showLanguageSelection = () => {
    startElement.classList.remove("start-screen--leaving");
    startElement.classList.add("start-screen--language");
    startElement.setAttribute("aria-label", translator.t("start.languageAria"));
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
    startElement.classList.add("start-screen--leaving");
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
  const showStory = () => {
    if (!languageSelected) {
      throw new Error("Story so pode abrir depois da escolha de idioma.");
    }

    storyElement.setAttribute("aria-label", translator.t("start.storyAria"));
    storyImage.setAttribute(
      "aria-label",
      translator.t("start.storyImageAlt")
    );
    storyPageIndex = 0;
    activate(PRIMARY_SCREEN_IDS.STORY);
    renderStoryPage();
    storyButton.focus();
  };
  const handleStoryContinue = () => {
    if (storyCompleted) {
      return;
    }

    playSound(SOUND_IDS.DEFAULT_BUTTON);
    if (storyPageIndex < FINAL_STORY_PAGE_INDEX) {
      storyPageIndex += 1;
      renderStoryPage();
      return;
    }

    storyCompleted = true;
    storyButton.disabled = true;
    storyTypewriter.stop();
    storyElement.classList.add("story-screen--leaving");
    storyTransitionTimeoutId = root.ownerDocument.defaultView.setTimeout(
      resolveStory,
      START_TRANSITION_DURATION_MS
    );
  };

  button.addEventListener("click", handleStart);
  languageOptionsElement.addEventListener("click", handleLanguageChoice);
  storyButton.addEventListener("click", handleStoryContinue);
  startElement.append(title, button, languagePanel);
  root.append(startElement, storyElement);
  activate(PRIMARY_SCREEN_IDS.START);

  return Object.freeze({
    getSnapshot,
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
    showStory,
    waitForStory() {
      return storyPromise;
    },
    showGameplay() {
      if (!storyCompleted) {
        throw new Error("Gameplay so pode abrir depois da Story.");
      }

      return activate(PRIMARY_SCREEN_IDS.GAMEPLAY);
    },
    destroy() {
      root.ownerDocument.defaultView.clearTimeout(transitionTimeoutId);
      root.ownerDocument.defaultView.clearTimeout(storyTransitionTimeoutId);
      storyTypewriter.destroy();
      button.removeEventListener("click", handleStart);
      languageOptionsElement.removeEventListener("click", handleLanguageChoice);
      storyButton.removeEventListener("click", handleStoryContinue);
      activeScreenIds.clear();
      startElement.remove();
      storyElement.remove();
      delete root.dataset.primaryScreen;
    }
  });
}
