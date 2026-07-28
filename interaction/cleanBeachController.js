import { SPAWNABLE_OBJECT_TRAITS } from "../spawn/spawnableObjectDto.js";

export function createCleanBeachController({
  economyModel,
  playerExperienceModel,
  taskListModel,
  taskId,
  collectionRewardInCents,
}) {
  return Object.freeze({
    collect({ worldObject, definition, progressTaskId = taskId }) {
      const traits = definition?.traits || [];
      const valuable = traits.includes(SPAWNABLE_OBJECT_TRAITS.PICKUP);
      const progressesTask = valuable || traits.includes(SPAWNABLE_OBJECT_TRAITS.DIRTY);
      const itemRewardInCents = Number(worldObject?.request?.collectionRewardInCents);
      const rewardAmountInCents = valuable ?
        (Number.isSafeInteger(itemRewardInCents) && itemRewardInCents > 0 ?
          itemRewardInCents :
          collectionRewardInCents) :
        0;

      if (rewardAmountInCents > 0) {
        economyModel.recordIncome({
          sourceId: worldObject.id,
          amountInCents: rewardAmountInCents
        });
      }

      if (progressesTask) {
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
        bonusAmountInCents: 0
      };
    }
  });
}
