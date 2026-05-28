import { resolveMovementPrompt } from "../ui/inputPromptResolver.js";
import { renderTaskHudIllustrationHtml } from "./taskHudIllustrations.js";

const MOVEMENT_OBJECTIVE_IDS = new Set(["move-after-crash"]);
const HIDDEN_CHECKLIST_OBJECTIVE_IDS = new Set(["clear-one-white-ground"]);
const CHECKLIST_OBJECTIVE_ICON_CONFIGS = Object.freeze({
  "grow-four-plants": {
    src: new URL("../ui/images/grass.png", import.meta.url).href,
    fallbackTitle: "Grow four living plants",
    width: 28,
    height: 28,
    showProgress: true
  },
  "place-thermal-cabin": {
    src: new URL("../ui/images/thermal-cabin.png", import.meta.url).href,
    fallbackTitle: "Place Thermal Bot's cabin",
    width: 52,
    height: 40,
    imageClassName: "hud-checklist__objective-icon--cabin"
  }
});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMovementHintHtml(objective = {}, inputModalityState = null) {
  if (!MOVEMENT_OBJECTIVE_IDS.has(objective.id)) {
    return "";
  }

  const movementPrompt = resolveMovementPrompt(inputModalityState || {});

  return `
    <div class="hud-control-hint" aria-label="Movement controls">
      <span class="hud-control-stick">${escapeHtml(movementPrompt)}</span>
    </div>
  `;
}

function formatTaskObjectiveChecklistText(objective = {}) {
  const title = String(objective.title || "Task objective").trim();
  const progressText = String(objective.progressText || "").trim();

  if (objective.hudDisplayMode === "title-only") {
    return title;
  }

  return progressText ? `${title} ${progressText}` : title;
}

function renderChecklistObjectiveIconHtml(objective = {}) {
  const iconConfig = CHECKLIST_OBJECTIVE_ICON_CONFIGS[objective.id];

  if (!iconConfig) {
    return "";
  }

  const title = String(objective.title || iconConfig.fallbackTitle).trim();
  const progressText = String(objective.progressText || "").trim();
  const accessibleText = progressText ? `${title} ${progressText}` : title;
  const imageClassName = [
    "hud-checklist__objective-icon",
    iconConfig.imageClassName
  ].filter(Boolean).join(" ");
  const progressHtml = iconConfig.showProgress && progressText
    ? `<span class="hud-checklist__objective-count">${escapeHtml(progressText)}</span>`
    : "";

  return `
    <span class="hud-checklist__icon-progress" aria-label="${escapeHtml(accessibleText)}">
      <img
        class="${escapeHtml(imageClassName)}"
        src="${escapeHtml(iconConfig.src)}"
        alt="${escapeHtml(title)}"
        width="${escapeHtml(iconConfig.width)}"
        height="${escapeHtml(iconConfig.height)}"
        loading="eager"
        decoding="async"
      >
      ${progressHtml}
    </span>
  `;
}

function renderTaskObjectiveContentHtml(objective = {}, inputModalityState = null) {
  const iconChecklistHtml = renderChecklistObjectiveIconHtml(objective);

  if (iconChecklistHtml) {
    return `
      ${iconChecklistHtml}
      ${renderMovementHintHtml(objective, inputModalityState)}
    `;
  }

  const fallbackText = formatTaskObjectiveChecklistText(objective);
  const hudIllustration = objective.hudIllustration?.showInChecklist === false
    ? null
    : objective.hudIllustration;
  const illustrationHtml = renderTaskHudIllustrationHtml(
    hudIllustration,
    fallbackText,
    { className: "hud-task-illustration--checklist" }
  );

  return `
    ${illustrationHtml || escapeHtml(fallbackText)}
    ${renderMovementHintHtml(objective, inputModalityState)}
  `;
}

export function createTaskHudChecklistHtml(taskHudView = null, {
  inputModalityState = null
} = {}) {
  if (!taskHudView?.active || !Array.isArray(taskHudView.objectives)) {
    return "";
  }

  return taskHudView.objectives
    .filter((objective) => !HIDDEN_CHECKLIST_OBJECTIVE_IDS.has(objective?.id))
    .map((objective) => `
    <div
      class="hud-checklist__item"
      data-done="${objective?.completed ? "true" : "false"}"
      data-objective-type="TASK"
      data-task-objective-id="${escapeHtml(objective?.id || "")}"
    >
      <span class="hud-checklist__box" aria-hidden="true"></span>
      <span class="hud-checklist__content">
        ${renderTaskObjectiveContentHtml(objective, inputModalityState)}
      </span>
    </div>
  `).join("");
}
