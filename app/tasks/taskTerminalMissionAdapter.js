function hasAction(action = {}) {
  return Boolean(action?.actionId);
}

function findTaskEntryAction(entry = {}, actionByLegacyFieldTaskId = {}) {
  const objectives = Array.isArray(entry.objectives) ? entry.objectives : [];

  for (const objective of objectives) {
    const legacyFieldTaskId = objective?.legacyFieldTaskId;
    if (!legacyFieldTaskId) {
      continue;
    }

    const action = actionByLegacyFieldTaskId[legacyFieldTaskId];
    if (hasAction(action)) {
      return action;
    }
  }

  return {};
}

export function createTaskTerminalMissionEntries({
  taskEntries = [],
  actionByLegacyFieldTaskId = {}
} = {}) {
  if (!Array.isArray(taskEntries) || taskEntries.length === 0) {
    return [];
  }

  return taskEntries.map((entry) => {
    const action = findTaskEntryAction(entry, actionByLegacyFieldTaskId);

    return {
      id: entry.id,
      taskId: entry.taskId,
      source: entry.source || "task",
      status: entry.status,
      title: entry.title,
      description: entry.description,
      progress: entry.progress || "",
      objectives: Array.isArray(entry.objectives) ? entry.objectives : [],
      ...(hasAction(action) ? action : {})
    };
  });
}
