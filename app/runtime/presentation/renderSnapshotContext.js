export function prepareRenderSnapshotContext({
  session,
  camera,
  cinematicActive = false,
  getGrassCollisionObjects,
  getSelectedRepairBoxParticleTarget,
  getRepairBoxRevealParticleTarget,
  getEncounterRepairBoxPosition,
  clamp01
} = {}) {
  if (Array.isArray(session.tallGrassInstances)) {
    session.tallGrassInstances.length = 0;
  }
  if (Array.isArray(session.leafageGardenInstances)) {
    session.leafageGardenInstances.length = 0;
  }
  if (Array.isArray(session.leafageNativeTreeInstances)) {
    session.leafageNativeTreeInstances.length = 0;
  }
  if (Array.isArray(session.deadGrassInstances)) {
    session.deadGrassInstances.length = 0;
  }

  const grassBendPlayerPosition =
    session.playerCharacter && !cinematicActive ?
      session.playerCharacter.getPosition() :
      null;
  const natureRenderCenter = camera.getPose?.()?.target || grassBendPlayerPosition;
  const grassCollisionObjects = getGrassCollisionObjects();
  const selectedRepairBoxParticleTarget = getSelectedRepairBoxParticleTarget({
    repairModuleInstances: [
      session.actTwoSquirtle?.repairModuleInstance,
      session.bulbasaurEncounter?.repairModuleInstance,
      session.charmanderEncounter?.repairModuleInstance,
      session.timburrEncounter?.repairModuleInstance
    ]
  });
  const repairBoxRevealParticleTarget = getRepairBoxRevealParticleTarget({
    encounters: [
      session.bulbasaurEncounter,
      session.charmanderEncounter
    ],
    getEncounterRepairBoxPosition,
    clamp01
  });

  return {
    grassBendPlayerPosition,
    natureRenderCenter,
    grassCollisionObjects,
    selectedRepairBoxParticleTarget,
    repairBoxRevealParticleTarget,
    shouldShowRepairBoxRustlingParticles: false
  };
}
