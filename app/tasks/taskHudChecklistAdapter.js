import { resolveMovementPrompt } from "../ui/inputPromptResolver.js";
import { renderTaskHudIllustrationHtml } from "./taskHudIllustrations.js";

const MOVEMENT_OBJECTIVE_IDS = new Set(["move-after-crash"]);

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

function renderTaskObjectiveContentHtml(objective = {}, inputModalityState = null) {
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

  return taskHudView.objectives.map((objective) => `
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
