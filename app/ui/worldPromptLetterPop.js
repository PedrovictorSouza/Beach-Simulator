const WORLD_PROMPT_LETTER_POP_STYLE_ID = "world-prompt-letter-pop-style";

function installWorldPromptLetterPopStyles(documentRef) {
  if (!documentRef?.head || documentRef.getElementById(WORLD_PROMPT_LETTER_POP_STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = WORLD_PROMPT_LETTER_POP_STYLE_ID;
  style.textContent = `
    .act-two-tutorial__speech[data-world-prompt-kind="counter"] .act-two-tutorial__speech-bubble {
      max-width: min(760px, calc(100vw - 64px));
      font-size: 68px;
      line-height: 1;
      text-align: center;
      white-space: normal;
    }

    .world-prompt-letter-pop {
      display: block;
      max-width: 100%;
      text-align: center;
      margin: 0 auto;
    }

    .world-prompt-letter-pop__word {
      display: inline-block;
      white-space: nowrap;
    }

    .world-prompt-letter-pop__char {
      display: inline-block;
      transform-origin: 50% 80%;
      animation: world-prompt-letter-pop-in 360ms cubic-bezier(0.2, 1.55, 0.24, 1) both;
      animation-delay: calc(var(--letter-index, 0) * 24ms);
      will-change: transform, opacity;
    }

    @keyframes world-prompt-letter-pop-in {
      0% {
        opacity: 0;
        transform: translateY(0.28em) scale(0.22);
      }
      62% {
        opacity: 1;
        transform: translateY(-0.08em) scale(1.28);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  documentRef.head.append(style);
}

export function renderWorldPromptLetterPop({
  documentRef,
  container,
  text
} = {}) {
  if (!documentRef || !container) {
    return false;
  }

  installWorldPromptLetterPopStyles(documentRef);
  container.replaceChildren();

  const root = documentRef.createElement("span");
  root.className = "world-prompt-letter-pop";
  root.setAttribute("aria-label", String(text || ""));

  let letterIndex = 0;
  String(text || "").split(/(\s+)/).filter(Boolean).forEach((token) => {
    if (/^\s+$/.test(token)) {
      root.append(documentRef.createTextNode(token));
      return;
    }

    const wordElement = documentRef.createElement("span");
    wordElement.className = "world-prompt-letter-pop__word";

    Array.from(token).forEach((character) => {
      const characterElement = documentRef.createElement("span");
      characterElement.className = "world-prompt-letter-pop__char";
      characterElement.style.setProperty("--letter-index", String(letterIndex));
      characterElement.textContent = character;
      characterElement.setAttribute("aria-hidden", "true");
      wordElement.append(characterElement);
      letterIndex += 1;
    });

    root.append(wordElement);
  });

  container.append(root);
  return true;
}
