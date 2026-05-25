import { renderTaskHudIllustrationHtml } from "./taskHudIllustrations.js";

const FREE_ROAM_SUMMARY = "Free roam. Keep restoring the island and checking in with helpers.";
const FREE_ROAM_SUBTITLE = "Keep restoring the island and checking in with helpers.";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeProgressText(progressText = "") {
  const normalized = String(progressText || "").trim();
  return normalized && normalized !== "Complete" ? normalized : "";
}

function buildSubtitle(view = {}) {
  if (view.hudDisplayMode === "title-only") {
    return "";
  }

  const description = String(view.description || "").trim();
  const progressText = normalizeProgressText(view.progressText);

  if (description && progressText) {
    return `${description} ${progressText}`;
  }

  return description || progressText;
}

export function createTaskHudSummary(taskHudView = null) {
  if (!taskHudView?.active) {
    return FREE_ROAM_SUMMARY;
  }

  const title = taskHudView.title || taskHudView.taskTitle || "Current task";
  const subtitle = buildSubtitle(taskHudView);

  return subtitle ? `${title}. ${subtitle}` : title;
}

export function createTaskHudSummaryHtml(taskHudView = null) {
  if (!taskHudView?.active) {
    return `
      <div class="hud-task-subtitle">${FREE_ROAM_SUBTITLE}</div>
    `;
  }

  const title = taskHudView.title || taskHudView.taskTitle || "Current task";
  const subtitle = buildSubtitle(taskHudView);

  if (taskHudView.hudDisplayMode === "title-only") {
    const titleIllustrationHtml = renderTaskHudIllustrationHtml(
      taskHudView.hudIllustration,
      title,
      { className: "hud-task-illustration--title" }
    );

    return `
      <div class="hud-task-title hud-task-title--with-illustration">
        ${titleIllustrationHtml}
        <span class="hud-task-title__copy">${escapeHtml(title)}</span>
      </div>
    `;
  }

  const illustrationHtml = renderTaskHudIllustrationHtml(
    taskHudView.hudIllustration,
    subtitle,
    { className: "hud-task-illustration--summary" }
  );

  return `
    <div class="hud-task-title">${escapeHtml(title)}</div>
    ${illustrationHtml ? `<div class="hud-task-subtitle hud-task-subtitle--illustrated">${illustrationHtml}</div>` : ""}
    ${!illustrationHtml && subtitle ? `<div class="hud-task-subtitle">${escapeHtml(subtitle)}</div>` : ""}
  `;
}
