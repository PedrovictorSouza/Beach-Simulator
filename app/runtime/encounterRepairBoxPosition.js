export function getEncounterRepairBoxPosition(encounter) {
  return encounter?.repairBoxPosition || encounter?.repairPosition || null;
}
