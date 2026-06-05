export function getRepairBoxPromptPosition({
  encounter,
  getEncounterRepairBoxPosition = () => null
} = {}) {
  const basePosition =
    getEncounterRepairBoxPosition(encounter) ||
    encounter?.repairModuleInstance?.baseOffset ||
    encounter?.repairModuleInstance?.offset;

  return Array.isArray(basePosition) ? [...basePosition] : null;
}

export function getNearbyRepairBoxPrompt({
  playerPosition,
  repairBoxTargets = [],
  promptDistance = Infinity,
  getEncounterRepairBoxPosition = () => null
} = {}) {
  if (!Array.isArray(playerPosition)) {
    return null;
  }

  let nearestPrompt = null;
  let nearestDistance = Infinity;

  for (const repairBoxTarget of repairBoxTargets) {
    if (!repairBoxTarget?.encounter?.repairModuleInstance?.active) {
      continue;
    }

    const worldPosition = getRepairBoxPromptPosition({
      encounter: repairBoxTarget.encounter,
      getEncounterRepairBoxPosition
    });

    if (!worldPosition) {
      continue;
    }

    const distance = Math.hypot(
      playerPosition[0] - worldPosition[0],
      playerPosition[2] - worldPosition[2]
    );

    if (distance <= promptDistance && distance < nearestDistance) {
      nearestPrompt = {
        text: repairBoxTarget.name,
        worldPosition
      };
      nearestDistance = distance;
    }
  }

  return nearestPrompt;
}
