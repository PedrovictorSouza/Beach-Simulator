const TASK_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
});
const INITIAL_ONBOARDING_TASK_ID = "build-first-construction";

function normalizeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function normalizeMessageParams(params) {
  return params && typeof params === "object" ? { ...params } : {};
}

export function createTaskListModel(initialTasks = []) {
  const tasks = new Map();
  const observers = new Set();
  let nextOrder = 0;

  const upsert = (task) => {
    const taskId = task?.id === undefined ? "" : String(task.id);
    const existing = tasks.get(taskId);

    const hasMessageId = Boolean(String(task?.messageId || "").trim());
    const hasLabel = Boolean(String(task?.label || "").trim());

    if (!taskId || (!existing && !hasMessageId && !hasLabel)) {
      throw new Error("Task precisa de id e label.");
    }

    const messageId = task.messageId === undefined ?
      existing?.messageId ?? null :
      String(task.messageId || "").trim() || null;
    const messageParams = task.messageParams === undefined ?
      existing?.messageParams ?? {} :
      normalizeMessageParams(task.messageParams);

    const target = task.target === undefined ?
      existing?.target ?? null :
      Math.max(1, Math.floor(normalizeNumber(task.target)));
    const progress = target === null ?
      null :
      Math.min(
        target,
        Math.max(0, Math.floor(normalizeNumber(
          task.progress === undefined ? existing?.progress : task.progress
        )))
      );

    tasks.set(taskId, {
      ...existing,
      ...task,
      id: taskId,
      label: String(task.label ?? existing?.label ?? ""),
      messageId,
      messageParams,
      priority: task.priority === undefined ?
        existing?.priority ?? 0 :
        normalizeNumber(task.priority),
      urgency: task.urgency === undefined ?
        existing?.urgency ?? 0 :
        normalizeNumber(task.urgency),
      status: task.status || existing?.status || TASK_STATUS.ACTIVE,
      dependencies: task.dependencies === undefined ?
        existing?.dependencies ?? [] :
        Array.isArray(task.dependencies) ? task.dependencies.map(String) : [],
      progress,
      target,
      order: existing?.order ?? nextOrder++
    });
  };

  initialTasks.forEach(upsert);

  const getSnapshot = () => {
    const completedIds = new Set(
      [...tasks.values()]
        .filter((task) => task.status === TASK_STATUS.COMPLETED)
        .map((task) => task.id)
    );

    return [...tasks.values()]
      .filter((task) => task.status === TASK_STATUS.ACTIVE)
      .filter((task) => task.dependencies.every((id) => completedIds.has(id)))
      .map((task) => ({
        id: task.id,
        label: task.label,
        messageId: task.messageId,
        messageParams: task.messageParams,
        priority: task.priority,
        urgency: task.urgency,
        progress: task.progress,
        target: task.target,
        score: task.priority + task.urgency,
        order: task.order
      }))
      .sort((left, right) => right.score - left.score || left.order - right.order)
      .map(({ order, ...task }) => task);
  };
  const notify = () => {
    const snapshot = getSnapshot();

    for (const observer of observers) {
      observer(snapshot);
    }
  };

  return Object.freeze({
    upsert(task) {
      upsert(task);
      notify();
      return getSnapshot();
    },
    advance(taskId, amount = 1) {
      const task = tasks.get(String(taskId));
      const normalizedAmount = Math.floor(normalizeNumber(amount));

      if (!task || task.target === null) {
        throw new Error("Task com progresso nao encontrada.");
      }

      if (normalizedAmount <= 0) {
        throw new Error("Avanco da task precisa ser positivo.");
      }

      task.progress = Math.min(task.target, task.progress + normalizedAmount);
      notify();
      return getSnapshot();
    },
    remove(taskId) {
      tasks.delete(String(taskId));
      notify();
    },
    getSnapshot,
    subscribe(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observer de tasks precisa ser uma funcao.");
      }

      observers.add(observer);
      observer(getSnapshot());

      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        observers.delete(observer);
      };
    }
  });
}

export function createTaskListView({
  root,
  translator,
  onTaskComplete = () => {},
  onTaskProgress = () => {}
}) {
  if (!root) {
    throw new Error("TaskListView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("TaskListView precisa de um translator.");
  }

  if (typeof onTaskComplete !== "function") {
    throw new Error("TaskListView precisa de um callback de conclusao valido.");
  }

  if (typeof onTaskProgress !== "function") {
    throw new Error("TaskListView precisa de um callback de progresso valido.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("section");
  const titleElement = documentRef.createElement("h2");
  const helperElement = documentRef.createElement("p");
  const listElement = documentRef.createElement("ol");
  const progressByTaskId = new Map();
  let currentTasks = [];

  element.className = "task-list";
  element.setAttribute("aria-label", translator.t("tasks.ariaLabel"));
  element.hidden = true;
  titleElement.className = "task-list__title";
  titleElement.textContent = translator.t("tasks.title");
  helperElement.className = "task-list__helper";
  helperElement.textContent = translator.t("tasks.helper");
  listElement.className = "task-list__items";
  listElement.setAttribute("aria-live", "polite");
  element.append(titleElement, helperElement, listElement);
  root.append(element);

  const renderTasks = (tasks) => {
      const nextTasks = Array.isArray(tasks) ? tasks : [];

      currentTasks = nextTasks;
      element.setAttribute("aria-label", translator.t("tasks.ariaLabel"));
      titleElement.textContent = translator.t("tasks.title");
      helperElement.textContent = translator.t("tasks.helper");
      const completedTasks = [];
      const taskElements = nextTasks.map((task) => {
        const itemElement = documentRef.createElement("li");
        const labelElement = documentRef.createElement("span");
        const hasProgress = Number.isFinite(task.target) && task.target > 0;
        const completed = hasProgress && task.progress >= task.target;
        const taskLabel = task.messageId ?
          translator.t(task.messageId, task.messageParams) :
          task.label;

        itemElement.className = "task-list__item";
        itemElement.dataset.taskId = task.id;
        if (task.id === INITIAL_ONBOARDING_TASK_ID && !completed) {
          const focusElement = documentRef.createElement("span");

          itemElement.classList.add("task-list__item--focus");
          focusElement.className = "task-list__focus";
          focusElement.textContent = translator.t("tasks.startHere");
          itemElement.append(focusElement);
        }
        labelElement.className = "task-list__label";
        labelElement.textContent = completed ?
          translator.t("tasks.complete") :
          taskLabel;
        labelElement.classList.toggle("task-list__label--complete", completed);
        itemElement.append(labelElement);

        if (hasProgress) {
          const previousProgress = progressByTaskId.get(task.id);
          const previousPercent = previousProgress === undefined ?
            task.progress / task.target * 100 :
            previousProgress / task.target * 100;
          const currentPercent = task.progress / task.target * 100;
          const progressed = previousProgress !== undefined &&
            task.progress > previousProgress;
          const justCompleted = previousProgress !== undefined &&
            previousProgress < task.target && completed;
          const progressRow = documentRef.createElement("div");
          const progressTrack = documentRef.createElement("div");
          const progressFill = documentRef.createElement("div");
          const progressCount = documentRef.createElement("span");

          progressRow.className = "task-list__progress-row";
          progressTrack.className = "task-list__progress";
          progressTrack.setAttribute("role", "progressbar");
          progressTrack.setAttribute(
            "aria-label",
            translator.t("tasks.progress", { label: taskLabel })
          );
          progressTrack.setAttribute("aria-valuemin", "0");
          progressTrack.setAttribute("aria-valuemax", String(task.target));
          progressTrack.setAttribute("aria-valuenow", String(task.progress));
          progressFill.className = "task-list__progress-fill";
          progressFill.style.setProperty("--progress-from", `${previousPercent}%`);
          progressFill.style.setProperty("--progress-to", `${currentPercent}%`);
          progressCount.className = "task-list__progress-count";
          progressCount.textContent = `${task.progress}/${task.target}`;

          if (progressed) {
            progressFill.classList.add("task-list__progress-fill--updated");
            progressCount.classList.add("task-list__progress-count--updated");
          }

          if (justCompleted) {
            labelElement.classList.add("task-list__label--completed-now");
            completedTasks.push(task);
          }

          if (progressed && !justCompleted) {
            onTaskProgress(task);
          }

          progressTrack.append(progressFill);
          progressRow.append(progressTrack, progressCount);
          itemElement.append(progressRow);
          progressByTaskId.set(task.id, task.progress);
        }

        return itemElement;
      });

      const nextTaskIds = new Set(nextTasks.map((task) => task.id));
      for (const taskId of progressByTaskId.keys()) {
        if (!nextTaskIds.has(taskId)) {
          progressByTaskId.delete(taskId);
        }
      }

      listElement.replaceChildren(...taskElements);
      element.hidden = nextTasks.length === 0;

      completedTasks.forEach(onTaskComplete);
  };
  const unsubscribeLocale = translator.subscribe(() => {
    renderTasks(currentTasks);
  });

  return Object.freeze({
    render(tasks) {
      renderTasks(tasks);
    },
    destroy() {
      unsubscribeLocale();
    }
  });
}
