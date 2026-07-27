export const RUN_PHASES = Object.freeze({
  DAY_INTRO: "day-intro",
  ACTIVE: "active",
  DAY_COMPLETE: "day-complete"
});

function createSnapshot({ day, totalDays, phase }) {
  return Object.freeze({
    day,
    totalDays,
    phase,
    hasNextDay: day < totalDays
  });
}

export function createRunSessionModel({ initialDay = 1, totalDays = 5 } = {}) {
  if (!Number.isSafeInteger(totalDays) || totalDays <= 0) {
    throw new Error("totalDays precisa ser um inteiro positivo.");
  }

  if (!Number.isSafeInteger(initialDay) || initialDay < 1 || initialDay > totalDays) {
    throw new Error("initialDay precisa estar dentro do intervalo da run.");
  }

  let day = initialDay;
  let phase = RUN_PHASES.DAY_INTRO;

  const getSnapshot = () => createSnapshot({
    day,
    totalDays,
    phase
  });

  return Object.freeze({
    getSnapshot,
    activateDay() {
      phase = RUN_PHASES.ACTIVE;

      return getSnapshot();
    },
    completeDay() {
      phase = RUN_PHASES.DAY_COMPLETE;

      return getSnapshot();
    },
    prepareNextDay() {
      if (phase !== RUN_PHASES.DAY_COMPLETE || day >= totalDays) {
        return getSnapshot();
      }

      day += 1;
      phase = RUN_PHASES.DAY_INTRO;

      return getSnapshot();
    }
  });
}
