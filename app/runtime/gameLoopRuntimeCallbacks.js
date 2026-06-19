export function createGameLoopRuntimeCallbacks({
  getFoundationBuildZoneCameraFocusRuntime,
  getGameplayInputRuntime,
  getWaterGunRuntime,
  getWorldCellPlannerInteractionRuntime
}) {
  return {
    getCurrentInputModalityState() {
      return getGameplayInputRuntime().getFrame()?.inputModalityState || null;
    },
    updateFoundationBuildZoneCameraFocus(now) {
      return getFoundationBuildZoneCameraFocusRuntime().updateFrame({ now });
    },
    startNextQueuedSquirtleWaterGunAction() {
      getWaterGunRuntime().startNextQueued();
    },
    processWorldCellPlannerClick() {
      return getWorldCellPlannerInteractionRuntime().processClick();
    },
    getWorldCellPlannerSelectedGroundCell() {
      return getWorldCellPlannerInteractionRuntime().getSelectedGroundCell();
    }
  };
}
