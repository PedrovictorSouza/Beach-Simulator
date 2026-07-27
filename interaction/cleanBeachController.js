import { SPAWNABLE_OBJECT_TRAITS } from "../spawn/spawnableObjectDto.js";

const VARIABLE_REWARD_MIN_CLEANUPS = 3;
const VARIABLE_REWARD_MAX_CLEANUPS = 5;
const VARIABLE_REWARD_IN_CENTS = 50;

export function createCleanBeachController({
  economyModel,
  playerExperienceModel,
  taskListModel,
  taskId,
  collectionRewardInCents,
  random = Math.random
}) {
  let cleanupsSinceBonus = 0;
  let nextBonusAt = VARIABLE_REWARD_MIN_CLEANUPS + Math.floor(
    Math.max(0, Math.min(0.999999, Number(random()) || 0)) *
      (VARIABLE_REWARD_MAX_CLEANUPS - VARIABLE_REWARD_MIN_CLEANUPS + 1)
  );

  return Object.freeze({
    collect({ worldObject, definition, progressTaskId = taskId }) {
      const traits = definition?.traits || [];
      const valuable = traits.includes(SPAWNABLE_OBJECT_TRAITS.PICKUP);
      const progressesTask = traits.includes(SPAWNABLE_OBJECT_TRAITS.DIRTY);
      const rewardAmountInCents = valuable || progressesTask ?
        collectionRewardInCents :
        0;

      if (rewardAmountInCents > 0) {
        economyModel.recordIncome({
          sourceId: worldObject.id,
          amountInCents: rewardAmountInCents
        });
      }

      let bonusAmountInCents = 0;

      if (progressesTask) {
        cleanupsSinceBonus += 1;
        if (cleanupsSinceBonus >= nextBonusAt) {
          bonusAmountInCents = VARIABLE_REWARD_IN_CENTS;
          economyModel.recordIncome({
            sourceId: `${worldObject.id}-cleanup-bonus`,
            amountInCents: bonusAmountInCents
          });
          cleanupsSinceBonus = 0;
          nextBonusAt = VARIABLE_REWARD_MIN_CLEANUPS + Math.floor(
            Math.max(0, Math.min(0.999999, Number(random()) || 0)) *
              (VARIABLE_REWARD_MAX_CLEANUPS - VARIABLE_REWARD_MIN_CLEANUPS + 1)
          );
        }

        playerExperienceModel.recordCleanup({ valuable });
        const hasProgressTask = taskListModel.getSnapshot().some(
          (task) => task.id === progressTaskId
        );

        if (hasProgressTask) {
          taskListModel.advance(progressTaskId);
        }
      }

      return {
        progressesTask,
        valuable,
        rewardAmountInCents,
        bonusAmountInCents
      };
    }
  });
}
