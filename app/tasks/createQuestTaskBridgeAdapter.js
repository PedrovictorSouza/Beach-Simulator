import { createTaskSystemBridge } from "./taskSystemBridge.js";
import { createTaskSystem } from "./createTaskSystem.js";

export function createQuestTaskBridgeAdapter({
  questSystem,
  taskSystemBridge = null,
  initialTaskState = null,
  onTaskChange = () => {}
} = {}) {
  if (!questSystem || typeof questSystem.emit !== "function") {
    throw new Error("QuestTaskBridgeAdapter requires a questSystem with emit().");
  }
  const resolvedTaskSystemBridge = taskSystemBridge || createTaskSystemBridge({
    taskSystem: createTaskSystem({
      initialState: initialTaskState
    })
  });

  function getCompletedObjectiveKeys(taskState = {}) {
    const keys = new Set();

    for (const [taskId, taskProgress] of Object.entries(taskState.taskProgress || {})) {
      for (const [objectiveId, objectiveProgress] of Object.entries(taskProgress?.objectives || {})) {
        if (objectiveProgress?.completed) {
          keys.add(`${taskId}:${objectiveId}`);
        }
      }
    }

    return keys;
  }

  function getNewlyCompletedObjectives(beforeState = {}, afterState = {}) {
    const beforeKeys = getCompletedObjectiveKeys(beforeState);
    const taskSystem = resolvedTaskSystemBridge.getTaskSystem?.();
    const completedObjectives = [];

    for (const [taskId, taskProgress] of Object.entries(afterState.taskProgress || {})) {
      const task = taskSystem?.getTask?.(taskId) || null;

      for (const [objectiveId, objectiveProgress] of Object.entries(taskProgress?.objectives || {})) {
        const key = `${taskId}:${objectiveId}`;
        if (!objectiveProgress?.completed || beforeKeys.has(key)) {
          continue;
        }

        const objective = task?.objectives?.find?.((entry) => entry?.id === objectiveId) || null;
        completedObjectives.push({
          id: objectiveId,
          objectiveId,
          taskId,
          title: objective?.title || objectiveId,
          description: objective?.description || "",
          required: objective?.required !== false,
          taskTitle: task?.title || taskId
        });
      }
    }

    return completedObjectives;
  }

  function enrichTaskResult(taskResult, beforeState) {
    const afterState = resolvedTaskSystemBridge.getState();
    return {
      ...taskResult,
      completedObjectives: getNewlyCompletedObjectives(beforeState, afterState)
    };
  }

  function emit(event = {}) {
    const questResult = questSystem.emit(event);
    const beforeState = resolvedTaskSystemBridge.getState();
    const taskResult = enrichTaskResult(
      resolvedTaskSystemBridge.recordLegacyQuestEvent(event),
      beforeState
    );
    if (taskResult.changed) {
      onTaskChange({
        event,
        questResult,
        taskResult,
        activeTask: resolvedTaskSystemBridge.getTaskSystem?.()?.getActiveTask?.() || null,
        taskState: resolvedTaskSystemBridge.getState()
      });
    }

    return {
      ...questResult,
      taskResult
    };
  }

  function applyEffects(effects = [], options = {}) {
    const beforeState = resolvedTaskSystemBridge.getState();
    const taskResult = enrichTaskResult(
      resolvedTaskSystemBridge.applyEffects(effects, {
        notify: false,
        reason: options.reason || "task-effects"
      }),
      beforeState
    );

    if (taskResult.changed) {
      onTaskChange({
        event: options.event || null,
        effects,
        questResult: {
          changed: false,
          completedQuestIds: []
        },
        taskResult,
        activeTask: resolvedTaskSystemBridge.getTaskSystem?.()?.getActiveTask?.() || null,
        taskState: resolvedTaskSystemBridge.getState()
      });
    }

    return {
      changed: Boolean(taskResult.changed),
      completedQuestIds: [],
      taskResult
    };
  }

  function reset() {
    const taskSystem = resolvedTaskSystemBridge.getTaskSystem?.();
    taskSystem?.reset?.();
    return questSystem.reset?.();
  }

  function restoreTaskState(taskState = null) {
    const taskSystem = resolvedTaskSystemBridge.getTaskSystem?.();
    if (typeof taskSystem?.restoreState === "function") {
      return taskSystem.restoreState(taskState);
    }

    if (!taskState) {
      taskSystem?.reset?.();
    }
    return taskSystem?.getState?.() || null;
  }

  function restoreQuestState(questState = null) {
    return questSystem.restoreState?.(questState) || questSystem.getState?.() || null;
  }

  function restoreState({ questState = null, taskState = null } = {}) {
    return {
      questState: restoreQuestState(questState),
      taskState: restoreTaskState(taskState)
    };
  }

  return {
    ...questSystem,
    applyEffects,
    emit,
    getActiveTask() {
      return resolvedTaskSystemBridge.getTaskSystem?.()?.getActiveTask?.() || null;
    },
    getTaskBridge() {
      return resolvedTaskSystemBridge;
    },
    getTaskFact(factId) {
      return resolvedTaskSystemBridge.getTaskSystem?.()?.getFacts?.()?.[factId];
    },
    getTaskHudView() {
      return resolvedTaskSystemBridge.getHudView();
    },
    getTaskState() {
      return resolvedTaskSystemBridge.getState();
    },
    getTaskTerminalEntries() {
      return resolvedTaskSystemBridge.getTerminalEntries();
    },
    hasTaskFact(factId) {
      return Boolean(resolvedTaskSystemBridge.getTaskSystem?.()?.getFacts?.()?.[factId]);
    },
    reset,
    restoreState,
    restoreTaskState
  };
}
