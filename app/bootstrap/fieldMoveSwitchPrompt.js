export const FIELD_MOVE_SWITCH_PROMPT_DURATION_MS = 1500;

const FIELD_MOVE_CAROUSEL_CARD_SIZE = 122;
const FIELD_MOVE_CAROUSEL_CARD_GAP = 10;
const FIELD_MOVE_CAROUSEL_SELECTED_OVERLAY_URL = new URL("../ui/images/selected.png", import.meta.url).href;
const FIELD_MOVE_SWITCH_PROMPT_PRESENTATION = Object.freeze({
  waterGun: {
    companionId: "squirtle",
    thumbnailUrl: new URL("../ui/images/Robot-1-thumb.png", import.meta.url).href
  },
  leafage: {
    companionId: "bulbasaur",
    thumbnailUrl: new URL("../ui/images/Robot-2-thumb.png", import.meta.url).href
  },
  fire: {
    companionId: "charmander",
    thumbnailUrl: new URL("../ui/images/Robot-3-thumb.png", import.meta.url).href
  },
  buildBlock: {
    companionId: "timburr",
    thumbnailUrl: new URL("../buildings/Box/robot-1-thumb.png", import.meta.url).href
  }
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCarouselRelativeIndex(index, selectedIndex, total) {
  if (total <= 1) {
    return 0;
  }

  let relativeIndex = index - selectedIndex;
  const halfTotal = total * 0.5;

  if (relativeIndex > halfTotal) {
    relativeIndex -= total;
  } else if (relativeIndex < -halfTotal) {
    relativeIndex += total;
  }

  return relativeIndex;
}

function getFieldMoveCarouselCardState(relativeIndex) {
  const clampedIndex = Math.max(-2, Math.min(2, relativeIndex));
  const distance = Math.min(2, Math.abs(clampedIndex));
  const translateX = clampedIndex * (FIELD_MOVE_CAROUSEL_CARD_SIZE + FIELD_MOVE_CAROUSEL_CARD_GAP);
  const translateZ = -distance * 56;
  const rotateY = clampedIndex * -34;
  const scale = 1 - distance * 0.12;

  return {
    opacity: distance === 0 ? 1 : 0.5,
    transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`
  };
}

export function buildFieldMoveSwitchPromptHtml({
  skillId,
  previousSkillId = null,
  playerSkillDefs = {},
  unlockedFieldMoveIds = []
}) {
  const skill = playerSkillDefs[skillId];
  const presentation = FIELD_MOVE_SWITCH_PROMPT_PRESENTATION[skillId];

  if (!skill || !presentation || unlockedFieldMoveIds.length === 0) {
    return "";
  }

  const selectedIndex = Math.max(0, unlockedFieldMoveIds.indexOf(skillId));
  const previousIndex = Math.max(
    0,
    unlockedFieldMoveIds.indexOf(previousSkillId || skillId)
  );
  const cardHtml = unlockedFieldMoveIds.map((moveId, index) => {
    const cardSkill = playerSkillDefs[moveId];
    const cardPresentation = FIELD_MOVE_SWITCH_PROMPT_PRESENTATION[moveId];

    if (!cardSkill || !cardPresentation) {
      return "";
    }

    const fromState = getFieldMoveCarouselCardState(
      getCarouselRelativeIndex(index, previousIndex, unlockedFieldMoveIds.length)
    );
    const toRelativeIndex = getCarouselRelativeIndex(
      index,
      selectedIndex,
      unlockedFieldMoveIds.length
    );
    const toState = getFieldMoveCarouselCardState(toRelativeIndex);
    const isSelected = index === selectedIndex;
    const companionId = escapeHtml(cardPresentation.companionId);
    const thumbnailUrl = escapeHtml(cardPresentation.thumbnailUrl);
    const selectedOverlayUrl = escapeHtml(FIELD_MOVE_CAROUSEL_SELECTED_OVERLAY_URL);
    const zIndex = String(20 - Math.min(2, Math.abs(toRelativeIndex)) * 3);

    return `
      <span
        class="field-move-carousel__card"
        data-field-move-carousel-card="true"
        data-companion-id="${companionId}"
        data-selected="${isSelected ? "true" : "false"}"
        style="--field-move-card-from:${fromState.transform};--field-move-card-to:${toState.transform};--field-move-card-from-opacity:${fromState.opacity.toFixed(2)};--field-move-card-to-opacity:${toState.opacity.toFixed(2)};z-index:${zIndex};"
      >
        <img
          src="${thumbnailUrl}"
          alt=""
          loading="eager"
          decoding="async"
          style="display:block;width:100%;height:100%;object-fit:cover;border:0;background:transparent;image-rendering:pixelated;"
        >
        ${isSelected ? `
          <img
            class="field-move-carousel__selected-overlay"
            src="${selectedOverlayUrl}"
            alt=""
            loading="eager"
            decoding="async"
            style="position:absolute;inset:-10px;width:calc(100% + 20px);height:calc(100% + 20px);object-fit:fill;pointer-events:none;image-rendering:pixelated;transform-origin:center center;animation:fieldMoveCarouselSelectedPulse 520ms cubic-bezier(.2,.9,.24,1) both;"
          >
        ` : ""}
      </span>
    `;
  }).join("");

  return `
    <style>
      .field-move-carousel__card {
        position: absolute;
        left: 50%;
        top: 50%;
        display: grid;
        width: ${FIELD_MOVE_CAROUSEL_CARD_SIZE}px;
        height: ${FIELD_MOVE_CAROUSEL_CARD_SIZE}px;
        transform: var(--field-move-card-to);
        transform-origin: center center;
        transform-style: preserve-3d;
        opacity: var(--field-move-card-to-opacity);
        image-rendering: pixelated;
        animation: fieldMoveCarouselCardIn 360ms cubic-bezier(.2,.9,.25,1) both;
      }
      @keyframes fieldMoveCarouselCardIn {
        from {
          opacity: var(--field-move-card-from-opacity);
          transform: var(--field-move-card-from);
        }
        to {
          opacity: var(--field-move-card-to-opacity);
          transform: var(--field-move-card-to);
        }
      }
      @keyframes fieldMoveCarouselSelectedPulse {
        0% {
          transform: scale(1);
        }
        42% {
          transform: scale(1.11);
        }
        100% {
          transform: scale(1);
        }
      }
    </style>
    <span
      data-field-move-switch-card="true"
      data-selected-move-id="${escapeHtml(skillId)}"
      style="display:grid;width:420px;height:248px;place-items:center;color:#fff;font-family:var(--game-ui-font, monospace);text-align:left;text-transform:none;perspective:820px;transform-style:preserve-3d;"
    >
      <span style="position:relative;width:100%;height:214px;transform-style:preserve-3d;">
        ${cardHtml}
      </span>
    </span>
  `;
}
