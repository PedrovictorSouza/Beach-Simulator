const DEFAULT_DAY_DURATION_SECONDS = 2 * 60;

function createSnapshot({ durationSeconds, remainingSeconds, running }) {
  return Object.freeze({
    durationSeconds,
    remainingSeconds,
    elapsedSeconds: durationSeconds - remainingSeconds,
    running,
    complete: remainingSeconds === 0
  });
}

export function createTimeManager({
  dayDurationSeconds = DEFAULT_DAY_DURATION_SECONDS
} = {}) {
  if (!Number.isFinite(dayDurationSeconds) || dayDurationSeconds <= 0) {
    throw new Error("dayDurationSeconds precisa ser maior que zero.");
  }

  const observers = new Set();
  let remainingSeconds = dayDurationSeconds;
  let running = false;
  let displayedSecond = Math.ceil(remainingSeconds);

  const getSnapshot = () => createSnapshot({
    durationSeconds: dayDurationSeconds,
    remainingSeconds,
    running
  });

  const notify = () => {
    const snapshot = getSnapshot();

    for (const observer of observers) {
      observer(snapshot);
    }

    return snapshot;
  };

  return Object.freeze({
    getSnapshot,
    subscribe(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observer do TimeManager precisa ser uma funcao.");
      }

      observers.add(observer);
      observer(getSnapshot());

      return () => observers.delete(observer);
    },
    start() {
      if (running || remainingSeconds === 0) {
        return getSnapshot();
      }

      running = true;

      return notify();
    },
    reset() {
      remainingSeconds = dayDurationSeconds;
      running = false;
      displayedSecond = Math.ceil(remainingSeconds);

      return notify();
    },
    update(deltaSeconds) {
      if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
        throw new Error("deltaSeconds precisa ser um numero finito e nao negativo.");
      }

      if (!running || deltaSeconds === 0) {
        return getSnapshot();
      }

      remainingSeconds = Math.max(0, remainingSeconds - deltaSeconds);
      const nextDisplayedSecond = Math.ceil(remainingSeconds);

      if (remainingSeconds === 0) {
        running = false;
      }

      if (nextDisplayedSecond !== displayedSecond || !running) {
        displayedSecond = nextDisplayedSecond;

        return notify();
      }

      return getSnapshot();
    }
  });
}
