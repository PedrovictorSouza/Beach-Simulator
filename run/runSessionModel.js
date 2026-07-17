export const RUN_PHASES = Object.freeze({
  DAY_INTRO: "day-intro",
  ACTIVE: "active"
});

function createSnapshot({ day, totalDays, phase }) {
  return Object.freeze({ day, totalDays, phase });
}

export function createRunSessionModel({ initialDay = 1, totalDays = 5 } = {}) {
  if (!Number.isSafeInteger(totalDays) || totalDays <= 0) {
    throw new Error("totalDays precisa ser um inteiro positivo.");
  }

  if (!Number.isSafeInteger(initialDay) || initialDay < 1 || initialDay > totalDays) {
    throw new Error("initialDay precisa estar dentro do intervalo da run.");
  }

  let phase = RUN_PHASES.DAY_INTRO;

  const getSnapshot = () => createSnapshot({
    day: initialDay,
    totalDays,
    phase
  });

  return Object.freeze({
    getSnapshot,
    activateDay() {
      phase = RUN_PHASES.ACTIVE;

      return getSnapshot();
    }
  });
}
