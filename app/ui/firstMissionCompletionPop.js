export const FIRST_MISSION_COMPLETION_QUEST_ID = "learn-to-move";
export const FIRST_MISSION_COMPLETION_POP_TEXT = "You took your first steps!";
export const CHOPPER_MET_COMPLETION_QUEST_ID = "wake-guide";
export const CHOPPER_MET_COMPLETION_POP_TEXT = "You met Chopper!";
export const HYDRO_BOT_ONLINE_COMPLETION_POP_TEXT = "Hydro Bot is online!";
export const BIO_GROW_ONLINE_COMPLETION_POP_TEXT = "Bio-Grow online!";
const MILESTONE_COMPLETION_POP_STYLE_ID = "milestone-completion-pop-style";

export const MILESTONE_COMPLETION_POP_IDS = Object.freeze({
  FIRST_STEPS: "first-steps",
  CHOPPER_MET: "chopper-met",
  HYDRO_BOT_ONLINE: "hydro-bot-online",
  FIRST_PATCH_RESTORED: "first-patch-restored",
  TALL_GRASS_RESTORED: "tall-grass-restored",
  BIO_GROW_ONLINE: "bio-grow-online",
  HOME_PATCH_GROWN: "home-patch-grown",
  SNOW_CLEARED: "snow-cleared",
  COLONY_COMPUTER_ONLINE: "colony-computer-online",
  BASE_FOUNDATION_BUILT: "base-foundation-built",
  FIRST_HABITAT_REPORTED: "first-habitat-reported"
});

export const MILESTONE_COMPLETION_POP_CATALOG = Object.freeze([
  {
    id: MILESTONE_COMPLETION_POP_IDS.FIRST_STEPS,
    questId: FIRST_MISSION_COMPLETION_QUEST_ID,
    text: FIRST_MISSION_COMPLETION_POP_TEXT
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.CHOPPER_MET,
    questId: CHOPPER_MET_COMPLETION_QUEST_ID,
    text: CHOPPER_MET_COMPLETION_POP_TEXT
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.HYDRO_BOT_ONLINE,
    questId: "gather-first-supplies",
    text: HYDRO_BOT_ONLINE_COMPLETION_POP_TEXT
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.FIRST_PATCH_RESTORED,
    questId: "water-first-dry-patch",
    text: "First patch restored!"
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.TALL_GRASS_RESTORED,
    questId: "water-dry-grass",
    text: "You restored the tall grass!"
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.BIO_GROW_ONLINE,
    questId: "inspect-rustling-grass",
    text: BIO_GROW_ONLINE_COMPLETION_POP_TEXT
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.HOME_PATCH_GROWN,
    questId: "grow-a-home-patch",
    text: "You grew a home patch!"
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.SNOW_CLEARED,
    questId: "melt-first-snow",
    text: "Snow cleared!"
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.COLONY_COMPUTER_ONLINE,
    questId: "open-colony-computer",
    text: "Colony computer online!"
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.BASE_FOUNDATION_BUILT,
    questId: "build-first-base",
    text: "Base foundation built!"
  },
  {
    id: MILESTONE_COMPLETION_POP_IDS.FIRST_HABITAT_REPORTED,
    questId: "chopper-first-habitat-report",
    text: "You reported back!"
  }
].map(Object.freeze));

const MILESTONE_COMPLETION_POP_BY_QUEST_ID = Object.freeze(Object.fromEntries(
  MILESTONE_COMPLETION_POP_CATALOG.map((milestone) => [milestone.questId, milestone])
));
const MILESTONE_COMPLETION_POP_TEXT_BY_QUEST_ID = Object.freeze(Object.fromEntries(
  MILESTONE_COMPLETION_POP_CATALOG.map((milestone) => [milestone.questId, milestone.text])
));
const MILESTONE_COMPLETION_POP_TEXTS = new Set(
  Object.values(MILESTONE_COMPLETION_POP_TEXT_BY_QUEST_ID)
);

export function listMilestoneCompletionPops() {
  return MILESTONE_COMPLETION_POP_CATALOG;
}

export function getMilestoneCompletionPop(questId) {
  return MILESTONE_COMPLETION_POP_BY_QUEST_ID[questId] || null;
}

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
  if (!documentRef?.head || documentRef.getElementById(MILESTONE_COMPLETION_POP_STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  style.id = MILESTONE_COMPLETION_POP_STYLE_ID;
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
