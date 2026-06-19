import { SMALL_ISLAND_FIELD_TASKS } from "../story/storyBeatData.js";
import { createTaskTerminalMissionEntries } from "../tasks/taskTerminalMissionAdapter.js";

function getFieldTaskDescription(task, storyState) {
  if (typeof task?.description === "function") {
    return task.description(storyState);
  }

  return task?.description || "";
}

function isFieldTaskComplete(storyState, task) {
  return Boolean(
    (typeof task?.isComplete === "function" && task.isComplete(storyState)) ||
    (task?.completeFlag && storyState.flags?.[task.completeFlag])
  );
}

function isFieldTaskKnown(storyState, task) {
  const flags = storyState.flags || {};
  const trackedTaskIds = Array.isArray(flags.trackedTaskIds) ? flags.trackedTaskIds : [];

  return Boolean(
    task?.background ||
    trackedTaskIds.includes(task.id) ||
    isFieldTaskComplete(storyState, task)
  );
}

function formatQuestMissionProgress(quest) {
  return (quest.objectives || [])
    .map((objective) => {
      const current = Math.min(objective.current || 0, objective.required || 1);
      return `${current}/${objective.required}`;
    })
    .join("  ");
}

export function buildPokemonCenterPcMissionEntries({
  questSystem = null,
  storyState = {},
  fieldTasks = SMALL_ISLAND_FIELD_TASKS,
  getActionForTask = () => ({})
} = {}) {
  const taskEntries = questSystem?.getTaskTerminalEntries?.() || [];
  const fieldTaskList = Object.values(fieldTasks);
  if (taskEntries.length) {
    const actionByLegacyFieldTaskId = Object.fromEntries(
      fieldTaskList.map((task) => [
        task.id,
        getActionForTask(task.id)
      ])
    );

    return createTaskTerminalMissionEntries({
      taskEntries,
      actionByLegacyFieldTaskId
    });
  }

  const questEntries = (questSystem?.getQuestLog?.() || []).map((quest) => {
    const locked = quest.status === "locked";
    return {
      id: `quest:${quest.id}`,
      source: "story",
      status: quest.status,
      title: locked ? "????" : quest.title,
      description: locked ? "Check data has not been recovered yet." : quest.description,
      progress: locked ? "" : formatQuestMissionProgress(quest)
    };
  });

  const fieldTaskEntries = fieldTaskList.map((task) => {
    const done = isFieldTaskComplete(storyState, task);
    const known = isFieldTaskKnown(storyState, task);
    const action = getActionForTask(task.id);
    const status = done ? "completed" : (known || action.actionId ? "available" : "locked");

    return {
      id: `field:${task.id}`,
      source: task.background ? "field note" : "request",
      status,
      title: status === "locked" ? "????" : task.title,
      description: status === "locked" ?
        "Check data has not been recovered yet." :
        getFieldTaskDescription(task, storyState),
      ...action
    };
  });

  return [...fieldTaskEntries, ...questEntries];
}
