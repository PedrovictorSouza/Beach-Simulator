import { TASK_KIND, TASK_STATUS } from "./taskData.js";

const LOCKED_TERMINAL_TITLE = "????";
const LOCKED_TERMINAL_DESCRIPTION = "Check data has not been recovered yet.";

export const TASK_PRESENTATION_SOURCE = Object.freeze({
  MAIN: "main task",
  COLONY: "colony task",
  OPTIONAL: "optional task"
});

function getTaskSourceLabel(kind) {
  switch (kind) {
    case TASK_KIND.COLONY:
      return TASK_PRESENTATION_SOURCE.COLONY;
    case TASK_KIND.OPTIONAL:
      return TASK_PRESENTATION_SOURCE.OPTIONAL;
    case TASK_KIND.MAIN:
    default:
      return TASK_PRESENTATION_SOURCE.MAIN;
  }
}

function normalizeObjective(objective = {}) {
  return {
    id: objective.id,
    taskId: objective.taskId,
    title: objective.title || "",
    description: objective.description || "",
    required: Boolean(objective.required),
    completed: Boolean(objective.completed),
    progressText: objective.progressText || "",
    hudDisplayMode: objective.hudDisplayMode || null,
    hudIllustration: objective.hudIllustration || null,
    tracked: Boolean(objective.tracked),
    legacyFieldTaskId: objective.legacyFieldTaskId || null
  };
}

function buildObjectiveProgressSummary(objectives = []) {
  const visibleObjectives = objectives.filter(Boolean);
  if (!visibleObjectives.length) {
    return "";
  }

  const requiredObjectives = visibleObjectives.filter((objective) => objective.required);
  const summaryObjectives = requiredObjectives.length ? requiredObjectives : visibleObjectives;
  const completedCount = summaryObjectives.filter((objective) => objective.completed).length;

  return `${completedCount}/${summaryObjectives.length} objectives`;
}

function getFocusSourceLabel(source) {
  if (source === "tracked") {
    return "tracked";
  }

  if (source === "optional") {
    return "optional";
  }

  if (source === "colony") {
    return "colony";
  }

  return "main";
}

export function createTaskHudView(taskSystem) {
  const focus = taskSystem?.getActiveFocus?.() || null;
  if (!focus) {
    return {
      active: false,
      taskId: null,
      objectiveId: null,
      taskTitle: "",
      title: "",
      description: "",
      progressText: "",
      source: "none",
      objectives: []
    };
  }

  const task = taskSystem.getTask?.(focus.taskId) || taskSystem.getActiveTask?.() || null;
  const visibleObjectives = (taskSystem.getVisibleObjectives?.(focus.taskId) || []).map(normalizeObjective);
  const focusedObjective = visibleObjectives.find((objective) => objective.id === focus.objectiveId) || null;
  const objectives = visibleObjectives.filter((objective) => (
    objective.hudDisplayMode !== "title-only" &&
    (objective.required || objective.id === focus.objectiveId || objective.tracked)
  ));

  return {
    active: true,
    taskId: focus.taskId,
    objectiveId: focus.objectiveId,
    taskTitle: task?.title || "",
    title: focus.title || "",
    description: focus.description || "",
    progressText: focus.progressText || "",
    hudDisplayMode: focus.hudDisplayMode || focusedObjective?.hudDisplayMode || null,
    hudIllustration: focus.hudIllustration || focusedObjective?.hudIllustration || null,
    source: getFocusSourceLabel(focus.source),
    objectives
  };
}

export function createTaskTerminalEntries(taskSystem) {
  const entries = taskSystem?.getTerminalTaskTree?.() || [];

  return entries.map((entry) => {
    const locked = entry.status === TASK_STATUS.LOCKED;
    const objectives = locked ? [] : (entry.objectives || []).map(normalizeObjective);

    return {
      id: `task:${entry.id}`,
      taskId: entry.id,
      source: getTaskSourceLabel(entry.kind),
      status: entry.status,
      active: Boolean(entry.active),
      completed: Boolean(entry.completed),
      title: locked ? LOCKED_TERMINAL_TITLE : entry.title,
      description: locked ? LOCKED_TERMINAL_DESCRIPTION : entry.description,
      progress: locked ? "" : buildObjectiveProgressSummary(objectives),
      objectives
    };
  });
}

export function getTaskTerminalEntryByTaskId(taskSystem, taskId) {
  return createTaskTerminalEntries(taskSystem).find((entry) => entry.taskId === taskId) || null;
}
