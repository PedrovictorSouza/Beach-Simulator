const SAMPLE_DURATION_SECONDS = 5;
const ACTION_MEMORY_SECONDS = 12;
const MAX_PRESSURE_OBJECTS = 8;
const HIGH_PRESSURE_THRESHOLD = 0.625;
const FATIGUE_BUILD_SECONDS = 30;
const GENE_ADAPTATION_RATE = 0.35;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function blend(current, target) {
  return current + (target - current) * GENE_ADAPTATION_RATE;
}

function normalizeCount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function createPlayerExperienceModel({ initialPressureCount = 0 } = {}) {
  let unresolvedPressureCount = normalizeCount(initialPressureCount);
  let successfulCleanupCount = 0;
  let guidanceCount = 0;
  let secondsSinceMeaningfulAction = 0;
  let highPressureSeconds = 0;
  let sampleElapsedSeconds = 0;
  let cleanupSignal = 0;
  let navigationSignal = 0;
  let dna = {
    mastery: 0.15,
    pressure: clamp01(unresolvedPressureCount / MAX_PRESSURE_OBJECTS),
    engagement: 0.5,
    exploration: 0,
    fatigue: 0
  };
  let snapshot;

  const refreshSnapshot = () => {
    snapshot = Object.freeze({
      dna: Object.freeze({ ...dna }),
      metrics: Object.freeze({
        successfulCleanupCount,
        guidanceCount,
        unresolvedPressureCount,
        secondsSinceMeaningfulAction
      })
    });
  };

  const evaluateSample = () => {
    const pressureTarget = clamp01(unresolvedPressureCount / MAX_PRESSURE_OBJECTS);
    const recentAction = clamp01(
      1 - secondsSinceMeaningfulAction / ACTION_MEMORY_SECONDS
    );
    const cleanupActivity = clamp01(cleanupSignal / 2);
    const explorationTarget = clamp01(navigationSignal / 4);
    const masteryTarget = clamp01(
      0.15 + successfulCleanupCount * 0.14 - guidanceCount * 0.12
    );
    const fatigueTarget = clamp01(highPressureSeconds / FATIGUE_BUILD_SECONDS);
    const engagementTarget = clamp01(
      recentAction * 0.5 + cleanupActivity * 0.3 + explorationTarget * 0.2
    );

    dna = {
      mastery: blend(dna.mastery, masteryTarget),
      pressure: blend(dna.pressure, pressureTarget),
      engagement: blend(dna.engagement, engagementTarget),
      exploration: blend(dna.exploration, explorationTarget),
      fatigue: blend(dna.fatigue, fatigueTarget)
    };
    cleanupSignal = 0;
    navigationSignal = 0;
    refreshSnapshot();
  };

  refreshSnapshot();

  return Object.freeze({
    getSnapshot() {
      return snapshot;
    },
    recordCleanup({ valuable = false } = {}) {
      successfulCleanupCount += 1;
      unresolvedPressureCount = Math.max(0, unresolvedPressureCount - 1);
      cleanupSignal += valuable ? 1.25 : 1;
      secondsSinceMeaningfulAction = 0;
      refreshSnapshot();
    },
    recordGuidanceNeeded() {
      guidanceCount += 1;
      refreshSnapshot();
    },
    recordNavigation(amount = 1) {
      const normalizedAmount = Number(amount);

      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        return;
      }

      navigationSignal += Math.min(normalizedAmount, 1);
      secondsSinceMeaningfulAction = 0;
    },
    recordPressureAdded(count = 1) {
      unresolvedPressureCount += normalizeCount(count);
      refreshSnapshot();
    },
    update(deltaSeconds) {
      if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
        throw new Error("PlayerExperienceModel precisa de deltaSeconds valido.");
      }

      secondsSinceMeaningfulAction += deltaSeconds;
      sampleElapsedSeconds += deltaSeconds;

      const pressureRatio = clamp01(
        unresolvedPressureCount / MAX_PRESSURE_OBJECTS
      );
      if (pressureRatio >= HIGH_PRESSURE_THRESHOLD) {
        highPressureSeconds += deltaSeconds;
      } else {
        highPressureSeconds = Math.max(0, highPressureSeconds - deltaSeconds * 2);
      }

      while (sampleElapsedSeconds >= SAMPLE_DURATION_SECONDS) {
        sampleElapsedSeconds -= SAMPLE_DURATION_SECONDS;
        evaluateSample();
      }

      return snapshot;
    }
  });
}
