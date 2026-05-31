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

    companionLostHintKey: null,
    companionLostHintNextAt: 0,
    companionLostHintActiveUntil: 0,
    companionLostHintActive: null,

    chopperAttentionCueNextAt: 0,
    chopperAttentionCueActiveUntil: 0,
    chopperAttentionCueCycleId: 0,
    chopperAttentionCueSoundCycleId: 0,

    leafageInvalidTargetPromptUntil: 0,
    fireInvalidTargetPromptUntil: 0,

    runBreadcrumbPromptShown: false,
    runBreadcrumbPromptUntil: 0,

    companionFollowDirection: null
  };
}
