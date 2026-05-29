import { WORKBENCH_POSITION } from "../../gameplayContent.js";
import {
  WORKBENCH_GREEN_ARROW_BASE_SCALE,
  WORKBENCH_GREEN_ARROW_BOB_HEIGHT,
  WORKBENCH_GREEN_ARROW_BOB_SPEED,
  WORKBENCH_GREEN_ARROW_OFFSET,
  WORKBENCH_GREEN_ARROW_ROLL_SPEED,
  WORKBENCH_GREEN_ARROW_ROLL_SWAY,
  WORKBENCH_GREEN_ARROW_YAW_SPEED,
  WORKBENCH_GREEN_ARROW_YAW_SWAY
} from "./gameplayPresentationTuning.js";

const WORKBENCH_GREEN_ARROW_GREENHOUSE_OBJECTIVE_ID = "build-greenhouse";
const WORKBENCH_GREEN_ARROW_GREENHOUSE_TASK_ID = "build-greenhouse";
const WORKBENCH_GREEN_ARROW_THERMAL_TASK_IDS = new Set([
  "clear-white-ground",
  "workbench-campfire"
]);
const WORKBENCH_GREEN_ARROW_THERMAL_OBJECTIVE_IDS = new Set([
  "place-thermal-cabin",
  "build-thermal-cabin-at-workbench"
]);

function taskHasObjective(task, objectiveIds) {
  const ids = objectiveIds instanceof Set ? objectiveIds : new Set([objectiveIds]);
  return (task?.objectives || []).some((objective) => ids.has(objective?.id));
}

function hasEntryId(entries, ids) {
  const idSet = ids instanceof Set ? ids : new Set([ids]);
  return entries.some((entry) => idSet.has(entry?.id));
}

export function shouldShowWorkbenchGreenArrowCue({
  activeTask = null,
  activeQuest = null,
  activeSystemQuest = null,
  storyState = {}
} = {}) {
  const flags = storyState?.flags || {};
  const trackedTaskIds = Array.isArray(flags.trackedTaskIds) ? flags.trackedTaskIds : [];

  const greenhouseNeedsWorkbench =
    !flags.greenhouseCrafted &&
    !flags.greenhousePlaced &&
    (
      trackedTaskIds.includes(WORKBENCH_GREEN_ARROW_GREENHOUSE_TASK_ID) ||
      taskHasObjective(activeTask, WORKBENCH_GREEN_ARROW_GREENHOUSE_OBJECTIVE_ID) ||
      hasEntryId([activeQuest, activeSystemQuest], WORKBENCH_GREEN_ARROW_GREENHOUSE_TASK_ID)
    );

  const thermalNeedsWorkbench =
    !flags.campfireCrafted &&
    !flags.campfireSpatOut &&
    (
      trackedTaskIds.includes("workbench-campfire") ||
      taskHasObjective(activeTask, WORKBENCH_GREEN_ARROW_THERMAL_OBJECTIVE_IDS) ||
      hasEntryId([activeTask, activeQuest, activeSystemQuest], WORKBENCH_GREEN_ARROW_THERMAL_TASK_IDS)
    );

  return Boolean(greenhouseNeedsWorkbench || thermalNeedsWorkbench);
}

export function applyWorkbenchGreenArrowCue(instance, {
  active = false,
  basePosition = WORKBENCH_POSITION,
  now = 0
} = {}) {
  if (!instance) {
    return false;
  }

  if (!active || !Array.isArray(basePosition)) {
    instance.active = false;
    return false;
  }

  const time = now * 0.001;
  const baseYaw = Number(instance.baseYaw || 0);
  const configuredBaseScale = Number.isFinite(Number(instance.baseScale)) ?
    Number(instance.baseScale) :
    WORKBENCH_GREEN_ARROW_BASE_SCALE;
  const baseScale = Math.max(configuredBaseScale, WORKBENCH_GREEN_ARROW_BASE_SCALE);
  const bob = Math.sin(time * WORKBENCH_GREEN_ARROW_BOB_SPEED) * WORKBENCH_GREEN_ARROW_BOB_HEIGHT;

  instance.offset = [
    basePosition[0] + WORKBENCH_GREEN_ARROW_OFFSET[0],
    basePosition[1] + WORKBENCH_GREEN_ARROW_OFFSET[1] + bob,
    basePosition[2] + WORKBENCH_GREEN_ARROW_OFFSET[2]
  ];
  instance.scale = baseScale;
  instance.yaw =
    baseYaw +
    Math.sin(time * WORKBENCH_GREEN_ARROW_YAW_SPEED) * WORKBENCH_GREEN_ARROW_YAW_SWAY;
  instance.roll =
    Math.sin(time * WORKBENCH_GREEN_ARROW_ROLL_SPEED + 0.5) * WORKBENCH_GREEN_ARROW_ROLL_SWAY;
  instance.active = true;
  return true;
}