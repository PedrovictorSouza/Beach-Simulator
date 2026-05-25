export const FIRST_MISSION_COMPLETION_QUEST_ID = "learn-to-move";
export const FIRST_MISSION_COMPLETION_POP_TEXT = "You took your first steps!";
export const CHOPPER_MET_COMPLETION_QUEST_ID = "wake-guide";
export const CHOPPER_MET_COMPLETION_POP_TEXT = "You met Chopper!";
const FIRST_MISSION_COMPLETION_POP_STYLE_ID = "first-mission-completion-pop-style";
const MILESTONE_COMPLETION_POP_TEXT_BY_QUEST_ID = Object.freeze({
  [FIRST_MISSION_COMPLETION_QUEST_ID]: FIRST_MISSION_COMPLETION_POP_TEXT,
  [CHOPPER_MET_COMPLETION_QUEST_ID]: CHOPPER_MET_COMPLETION_POP_TEXT
});
const MILESTONE_COMPLETION_POP_TEXTS = new Set(
  Object.values(MILESTONE_COMPLETION_POP_TEXT_BY_QUEST_ID)
);

export function getMilestoneCompletionPopText(questId) {
  return MILESTONE_COMPLETION_POP_TEXT_BY_QUEST_ID[questId] || null;
}

export function getFirstMissionCompletionPopText(questId) {
  return getMilestoneCompletionPopText(questId);
}

export function isMilestoneCompletionPopText(text) {
  return MILESTONE_COMPLETION_POP_TEXTS.has(text);
}

export function isFirstMissionCompletionPopText(text) {
  return isMilestoneCompletionPopText(text);
}

export function installFirstMissionCompletionPopStyles(documentRef) {
  if (!documentRef?.head || documentRef.getElementById(FIRST_MISSION_COMPLETION_POP_STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = FIRST_MISSION_COMPLETION_POP_STYLE_ID;
  style.textContent = `
    .act-two-tutorial__speech[data-world-speech-variant="task-pop"][data-task-pop-kind="milestone"] .act-two-tutorial__speech-bubble,
    .act-two-tutorial__speech[data-world-speech-variant="task-pop"][data-task-pop-kind="first-mission"] .act-two-tutorial__speech-bubble {
      max-width: min(1500px, calc(100vw - 48px));
      font-size: 62px;
      animation: first-mission-completion-shell 2.35s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .milestone-completion-pop,
    .first-mission-completion-pop {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0;
      border: 0;
      background: transparent;
      white-space: nowrap;
    }

    .milestone-completion-pop__letter,
    .first-mission-completion-pop__letter {
      display: inline-grid;
      place-items: center;
      min-width: 0.64em;
      padding: 0.03em 0.05em 0.01em;
      border: 2px solid #000000;
      color: #ffffff;
      background: #ffcf4f;
      text-shadow:
        3px 0 0 #000000,
        0 3px 0 #000000,
        -3px 0 0 #000000,
        0 -3px 0 #000000;
      transform-origin: 50% 82%;
      animation: first-mission-completion-letter 1.52s cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: calc(var(--letter-index) * 34ms);
    }

    .milestone-completion-pop__letter--space,
    .first-mission-completion-pop__letter--space {
      min-width: 0.44em;
      padding-inline: 0;
      border-color: transparent;
      background: transparent;
      text-shadow: none;
    }

    @keyframes first-mission-completion-shell {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.62);
      }

      13% {
        opacity: 1;
        transform: translateY(-6px) scale(1.1);
      }

      24% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      82% {
        opacity: 1;
        transform: translateY(-10px) scale(1);
      }

      100% {
        opacity: 0;
        transform: translateY(-34px) scale(0.76);
      }
    }

    @keyframes first-mission-completion-letter {
      0% {
        opacity: 0;
        transform: translateY(24px) scale(0.16) rotate(-14deg);
      }

      14% {
        opacity: 1;
        transform: translateY(-24px) scale(1.26) rotate(9deg);
      }

      28% {
        opacity: 1;
        transform: translateY(4px) scale(0.94) rotate(-5deg);
      }

      43% {
        opacity: 1;
        transform: translateY(-13px) scale(1.08) rotate(4deg);
      }

      59% {
        opacity: 1;
        transform: translateY(0) scale(1) rotate(0deg);
      }

      76% {
        opacity: 1;
        transform: translateY(-9px) scale(1.04) rotate(-3deg);
      }

      88% {
        opacity: 1;
        transform: translateY(0) scale(1.08) rotate(3deg);
      }

      100% {
        opacity: 0;
        transform: translateY(-28px) scale(0.08) rotate(18deg);
      }
    }
  `;
  documentRef.head.append(style);
}

export function renderMilestoneCompletionPop({ documentRef, container, text } = {}) {
  if (!documentRef || !container || !isMilestoneCompletionPopText(text)) {
    return false;
  }

  installFirstMissionCompletionPopStyles(documentRef);

  const root = documentRef.createElement("span");
  root.className = "milestone-completion-pop first-mission-completion-pop";
  root.setAttribute("aria-label", text);

  Array.from(text).forEach((character, index) => {
    const letter = documentRef.createElement("span");
    letter.className = character === " " ?
      "milestone-completion-pop__letter milestone-completion-pop__letter--space first-mission-completion-pop__letter first-mission-completion-pop__letter--space" :
      "milestone-completion-pop__letter first-mission-completion-pop__letter";
    letter.style.setProperty("--letter-index", String(index));
    letter.setAttribute("aria-hidden", "true");
    letter.textContent = character === " " ? "\u00a0" : character;
    root.append(letter);
  });

  container.replaceChildren(root);
  return true;
}

export function renderFirstMissionCompletionPop({ documentRef, container, text } = {}) {
  return renderMilestoneCompletionPop({ documentRef, container, text });
}
