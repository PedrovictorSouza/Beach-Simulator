import { RUN_PHASES } from "./runSessionModel.js";

export function createDayLifecycleController({
  runSessionModel,
  timeManager,
  spawnManager,
  buildingServicesModel,
  economyModel
}) {
  const startSpawning = ({ averageRating = 0, immediateBather = false } = {}) => {
    spawnManager.start({ averageRating });
    if (immediateBather) {
      spawnManager.requestImmediateBather();
    }
  };

  return Object.freeze({
    startDay({ averageRating = 0, startWithSpawning = true } = {}) {
      runSessionModel.activateDay();
      timeManager.start();
      if (startWithSpawning) {
        startSpawning({
          averageRating,
          immediateBather: true
        });
      }
    },
    startSpawning,
    completeDay() {
      const { day, phase } = runSessionModel.getSnapshot();

      if (phase !== RUN_PHASES.ACTIVE) {
        return null;
      }

      spawnManager.stop();
      runSessionModel.completeDay();
      const closing = buildingServicesModel.closeDay({
        availableMoneyInCents: economyModel.getSnapshot().moneyInCents
      });

      if (closing.publicSupportInCents > 0) {
        economyModel.recordIncome({
          sourceId: `day-${day}-public-beach-fund`,
          amountInCents: closing.publicSupportInCents
        });
      }

      if (closing.totalPaidInCents > 0) {
        economyModel.recordExpense({
          sourceId: `day-${day}-services`,
          amountInCents: closing.totalPaidInCents
        });
      }

      return closing;
    }
  });
}
