const TASK_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
});

function normalizeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function createTaskListModel(initialTasks = []) {
  const tasks = new Map();
  const observers = new Set();
  let nextOrder = 0;

  const upsert = (task) => {
    const taskId = task?.id === undefined ? "" : String(task.id);
    const existing = tasks.get(taskId);

    if (!taskId || (!existing && !task?.label)) {
      throw new Error("Task precisa de id e label.");
    }

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
      label: String(task.label ?? existing.label),
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

export function createTaskListView({ root }) {
  if (!root) {
    throw new Error("TaskListView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const element = documentRef.createElement("section");
  const titleElement = documentRef.createElement("h2");
  const listElement = documentRef.createElement("ol");
  const emptyElement = documentRef.createElement("p");
  const progressByTaskId = new Map();

  element.className = "task-list";
  element.setAttribute("aria-label", "Tasks");
  titleElement.className = "task-list__title";
  titleElement.textContent = "Tasks";
  listElement.className = "task-list__items";
  listElement.setAttribute("aria-live", "polite");
  emptyElement.className = "task-list__empty";
  emptyElement.textContent = "No tasks";
  element.append(titleElement, listElement, emptyElement);
  root.append(element);

  return Object.freeze({
    render(tasks) {
      const nextTasks = Array.isArray(tasks) ? tasks : [];
      const taskElements = nextTasks.map((task) => {
        const itemElement = documentRef.createElement("li");
        const labelElement = documentRef.createElement("span");

        itemElement.className = "task-list__item";
        itemElement.dataset.taskId = task.id;
        labelElement.className = "task-list__label";
        labelElement.textContent = task.label;
        itemElement.append(labelElement);

        if (Number.isFinite(task.target) && task.target > 0) {
          const previousProgress = progressByTaskId.get(task.id);
          const previousPercent = previousProgress === undefined ?
            task.progress / task.target * 100 :
            previousProgress / task.target * 100;
          const currentPercent = task.progress / task.target * 100;
          const progressed = previousProgress !== undefined &&
            task.progress > previousProgress;
          const progressRow = documentRef.createElement("div");
          const progressTrack = documentRef.createElement("div");
          const progressFill = documentRef.createElement("div");
          const progressCount = documentRef.createElement("span");

          progressRow.className = "task-list__progress-row";
          progressTrack.className = "task-list__progress";
          progressTrack.setAttribute("role", "progressbar");
          progressTrack.setAttribute("aria-label", `${task.label} progress`);
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
      listElement.hidden = nextTasks.length === 0;
      emptyElement.hidden = nextTasks.length > 0;
    }
  });
}
