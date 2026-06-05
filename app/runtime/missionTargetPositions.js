import { addUniqueMissionTargetPositions } from "./missionTargetPositionUtils.js";
import { resolveMissionTargetIdsFromMissionCopy } from "./missionTargetResolver.js";

export function resolveMissionCopyValue(value, storyState = {}) {
  if (typeof value === "function") {
    try {
      return value(storyState);
    } catch {
      return "";
    }
  }

  return typeof value === "string" ? value : "";
}

export function getMissionTargetPositionsFromCopy({
  source,
  storyState = {},
  getMissionTargetPositionsById = () => []
} = {}) {
  const targetPositions = [];
  const copyTargetIds = resolveMissionTargetIdsFromMissionCopy(
    resolveMissionCopyValue(source?.title, storyState),
    resolveMissionCopyValue(source?.description, storyState),
    resolveMissionCopyValue(source?.guidance, storyState),
    resolveMissionCopyValue(source?.label, storyState)
  );

  for (const targetId of copyTargetIds) {
    addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById(targetId));
  }

  return targetPositions;
}

export function getActiveQuestObjectiveCandidates(activeQuest) {
  const objectives = activeQuest?.objectives || [];
  const incompleteVisibleObjectives = objectives.filter((objective) => {
    return !objective.hiddenFromHud && (objective.current || 0) < (objective.required || 1);
  });
  if (incompleteVisibleObjectives.length) {
    return incompleteVisibleObjectives;
  }

  const visibleObjectives = objectives.filter((objective) => !objective.hiddenFromHud);
  if (visibleObjectives.length) {
    return visibleObjectives;
  }

  return objectives.filter((objective) => (objective.current || 0) < (objective.required || 1));
}

export function getTrackedMissionTargetPositions({
  storyState = {},
  getMissionTargetPositionsById = () => []
} = {}) {
  const flags = storyState.flags || {};
  const taskIds = Array.isArray(flags.trackedTaskIds) ? flags.trackedTaskIds : [];
  const targetPositions = [];

  for (const taskId of taskIds) {
    if (taskId === "workbench-campfire" && !flags.campfireCrafted) {
      if (!flags.workbenchDiyRecipesReceived) {
        addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("leaf-helper"));
      }
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("workbench"));
    }

    if (taskId === "water-dry-tall-grass" && !flags.bulbasaurDryGrassMissionComplete) {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("water-dry-tall-grass"));
    }

    if (taskId === "revive-leppa-tree" && !flags.leppaTreeRevived) {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("revive-leppa-tree"));
    }

    if (
      (
        taskId === "bulbasaur-dry-grass-request" ||
        taskId === "bulbasaur-leafage-reward" ||
        taskId === "give-leppa-berry" ||
        taskId === "bulbasaur-straw-bed" ||
        taskId === "straw-bed-recipe"
      ) &&
      !flags.bulbasaurStrawBedRequestComplete
    ) {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("leaf-helper"));
    }

    if (taskId === "tangrowth-log-chair" && !flags.logChairReceived) {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("chopper"));
    }

    if (
      taskId === "leaf-den-furniture" &&
      Number(flags.leafDenFurniturePlacedCount || 0) >= 3 &&
      !flags.leafDenFurnitureRequestComplete
    ) {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("builder-bot"));
    }

    if (taskId === "charmander-celebration" && !flags.dittoFlagReceived) {
      addUniqueMissionTargetPositions(
        targetPositions,
        getMissionTargetPositionsById(flags.charmanderCelebrationSuggested ? "chopper" : "thermal-bot")
      );
    }

    if (taskId === "ruined-pokemon-center" || taskId === "new-challenges-in-pc") {
      addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById(taskId));
    }
  }

  return targetPositions;
}

export function getActiveQuestMissionTargetPositions({
  activeQuest,
  storyState = {},
  getMissionTargetPositionsById = () => []
} = {}) {
  if (!activeQuest) {
    return [];
  }

  const targetPositions = [];
  if (activeQuest.id === "gather-first-supplies") {
    addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById("squirtle"));
  }

  for (const objective of getActiveQuestObjectiveCandidates(activeQuest)) {
    const beforeTargetCount = targetPositions.length;
    addUniqueMissionTargetPositions(targetPositions, getMissionTargetPositionsById(objective?.targetId));

    if (objective?.type === "TALK" && targetPositions.length === beforeTargetCount) {
      addUniqueMissionTargetPositions(
        targetPositions,
        getMissionTargetPositionsFromCopy({
          source: objective,
          storyState,
          getMissionTargetPositionsById
        })
      );
      addUniqueMissionTargetPositions(
        targetPositions,
        getMissionTargetPositionsFromCopy({
          source: activeQuest,
          storyState,
          getMissionTargetPositionsById
        })
      );
    }
  }

  if (!targetPositions.length) {
    addUniqueMissionTargetPositions(
      targetPositions,
      getMissionTargetPositionsFromCopy({
        source: activeQuest,
        storyState,
        getMissionTargetPositionsById
      })
    );
  }

  return targetPositions;
}

export function getMissionTargetPositions({
  activeQuest,
  storyState = {},
  getMissionTargetPositionsById = () => []
} = {}) {
  const targetPositions = [];
  addUniqueMissionTargetPositions(
    targetPositions,
    getTrackedMissionTargetPositions({
      storyState,
      getMissionTargetPositionsById
    })
  );
  addUniqueMissionTargetPositions(
    targetPositions,
    getActiveQuestMissionTargetPositions({
      activeQuest,
      storyState,
      getMissionTargetPositionsById
    })
  );
  return targetPositions;
}
