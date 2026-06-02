export function createGameLoopState() {
  return {
    movementQuestReported: false,
    movementQuestDistance: 0,

    foundationBuildZoneCameraFocus: null,

    woodCollectPopEffects: [],
    gearPickupParticleEffects: []
  };
}
