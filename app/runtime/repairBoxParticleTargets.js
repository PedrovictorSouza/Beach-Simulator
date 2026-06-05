const clamp01Default = (value) => Math.min(1, Math.max(0, value));

export function getSelectedRepairBoxParticleTarget({
  repairModuleInstances = []
} = {}) {
  const selectedRepairModule = repairModuleInstances.find((instance) => {
    return instance?.active && Array.isArray(instance.offset);
  });

  return selectedRepairModule ?
    {
      id: `${selectedRepairModule.id}-rustling-particles`,
      position: [...selectedRepairModule.offset]
    } :
    null;
}

export function getRepairBoxRevealParticleTarget({
  encounters = [],
  getEncounterRepairBoxPosition = () => null,
  clamp01 = clamp01Default
} = {}) {
  const encounter = encounters.find((candidate) => candidate?.revealBoxOpening?.active);
  const opening = encounter?.revealBoxOpening;

  if (!opening?.active) {
    return null;
  }

  const position =
    encounter?.repairModuleInstance?.offset ||
    encounter?.repairModuleInstance?.baseOffset ||
    getEncounterRepairBoxPosition(encounter);

  return Array.isArray(position) ?
    {
      id: `${encounter.repairModuleInstance?.id || "bot"}-reveal-rays`,
      position: [...position],
      progress: clamp01(Number(opening.elapsed || 0) / Number(opening.duration || 1))
    } :
    null;
}
