export function createGameLoopState() {
  return {
    movementQuestReported: false,
    movementQuestDistance: 0,

    pendingWorldCellPlannerClick: null,
    foundationBuildZoneCameraFocus: null,

    woodCollectPopEffects: [],
    gearPickupParticleEffects: [],

    leafageInvalidTargetPromptUntil: 0,
    fireInvalidTargetPromptUntil: 0
  };
}
