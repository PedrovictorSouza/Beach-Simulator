export function createGameLoopState() {
  return {
    movementQuestReported: false,
    movementQuestDistance: 0,

    pendingWorldCellPlannerClick: null,
    foundationBuildZoneCameraFocus: null,

    woodCollectPopEffects: [],
    gearPickupParticleEffects: [],

    repairBoxElapsed: 0,
    waterGunSfxBurstUntilSeconds: 0,

    chopperAttentionCueSoundCycleId: 0,

    leafageInvalidTargetPromptUntil: 0,
    fireInvalidTargetPromptUntil: 0,

    companionFollowDirection: null
  };
}
