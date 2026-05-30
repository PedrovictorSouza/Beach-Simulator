export function createGameLoopState({
  now = typeof performance !== "undefined" &&
    typeof performance.now === "function" ?
      performance.now() :
      Date.now()
} = {}) {
  return {
    previousTime: now,

    movementQuestReported: false,
    movementQuestDistance: 0,

    pendingWorldCellPlannerClick: null,
    foundationBuildZoneCameraFocus: null,

    woodCollectPopEffects: [],
    gearPickupParticleEffects: [],

    repairBoxElapsed: 0,
    waterGunSfxBurstUntilSeconds: 0,
    repairBoxRevealFlashElement: null,

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

    groundActionFeedbacks: [],

    fieldToolTargetPulseStartedAt: Number.NEGATIVE_INFINITY,
    fieldToolTargetPulseAbilityId: null,

    playerCounterPrompt: null,
    companionFollowDirection: null,
    workbenchRotationSelection: null,

    cameraDebugElement: null,
    cameraDebugErrors: []
  };
}
