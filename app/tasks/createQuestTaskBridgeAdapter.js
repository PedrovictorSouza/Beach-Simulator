import { createTaskSystemBridge } from "./taskSystemBridge.js";
import { createTaskSystem } from "./createTaskSystem.js";

export function createQuestTaskBridgeAdapter({
  questSystem,
  taskSystemBridge = null,
  initialTaskState = null
} = {}) {
  if (!questSystem || typeof questSystem.emit !== "function") {
    throw new Error("QuestTaskBridgeAdapter requires a questSystem with emit().");
  }
  const resolvedTaskSystemBridge = taskSystemBridge || createTaskSystemBridge({
    taskSystem: createTaskSystem({
      initialState: initialTaskState
    })
  });

  function emit(event = {}) {
    const questResult = questSystem.emit(event);
    const taskResult = resolvedTaskSystemBridge.recordLegacyQuestEvent(event);

    return {
      ...questResult,
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
