export function createGameLoopState() {
  return {
    movementQuestReported: false,
    movementQuestDistance: 0,

    pendingWorldCellPlannerClick: null,
    foundationBuildZoneCameraFocus: null,

    woodCollectPopEffects: [],
    gearPickupParticleEffects: [],

    waterGunSfxBurstUntilSeconds: 0,

    leafageInvalidTargetPromptUntil: 0,
    fireInvalidTargetPromptUntil: 0
  };
}
