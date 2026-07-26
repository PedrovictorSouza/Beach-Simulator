import { SPAWNABLE_OBJECT_TRAITS } from "../spawn/spawnableObjectDto.js";

export function createCleanBeachController({
  economyModel,
  playerExperienceModel,
  taskListModel,
  taskId,
  pickupRewardInCents
}) {
  return Object.freeze({
    collect({ worldObject, definition, progressTaskId = taskId }) {
      const traits = definition?.traits || [];
      const valuable = traits.includes(SPAWNABLE_OBJECT_TRAITS.PICKUP);
      const progressesTask = traits.some((trait) => (
        trait === SPAWNABLE_OBJECT_TRAITS.DIRTY ||
        trait === SPAWNABLE_OBJECT_TRAITS.PICKUP
      ));

      if (valuable) {
        economyModel.recordIncome({
          sourceId: worldObject.id,
          amountInCents: pickupRewardInCents
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

      return { progressesTask, valuable };
    }
  });
}
