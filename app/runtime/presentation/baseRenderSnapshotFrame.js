export function createBaseRenderSnapshotFrameRuntime({
  camera,
  worldCanvas,
  session,
  controls = null,
  gameFlowValues = {},
  construction = {},
  applyInteractionObjectHighlight = () => {},
  getGameplayOpeningShipSceneObjects = (sceneObjects) => sceneObjects,
  getSquirtleAssemblySceneObjects = (sceneObjects) => sceneObjects,
  resolvePsxDistanceFogSettings = () => ({ enabled: false })
} = {}) {
  const {
    syncActiveRepairBoxHighlight = () => {},
    syncGreenhouseModelInstance = () => {},
    syncCampfireTrainHouseModelInstance = () => {},
    isLeafDenConstructionActive = () => false,
    syncLeafDenConstructionClouds = () => {},
    syncConstructionCloudBurstEffects = () => {},
    syncLeafDenModelInstance = () => {},
    syncPlayerHouseModelInstances = () => {}
  } = construction;

  function update(nextFrame, {
    now = 0,
    deltaTime = 0,
    cinematicActive = false,
    nearbyInteractable = null,
    nearbyWorkbenchRotationTarget = null
  } = {}) {
    const followedViewProjection = camera?.getViewProjection?.(
      worldCanvas?.width,
      worldCanvas?.height
    );
    const nowSeconds = now * 0.001;

    syncActiveRepairBoxHighlight();
    syncGreenhouseModelInstance(deltaTime);
    syncCampfireTrainHouseModelInstance(nowSeconds, deltaTime);
    if (isLeafDenConstructionActive()) {
      controls?.completeLeafDenConstructionIfReady?.({ playDialogue: false });
    }
    syncLeafDenConstructionClouds(nowSeconds);
    syncConstructionCloudBurstEffects(nowSeconds);
    syncLeafDenModelInstance(deltaTime);
    syncPlayerHouseModelInstances(
      deltaTime,
      camera?.getPose?.()?.target || session?.playerCharacter?.getPosition?.() || null
    );
    applyInteractionObjectHighlight(session, {
      interactTarget: nearbyInteractable,
      workbenchRotationTarget: nearbyWorkbenchRotationTarget
    });

    nextFrame.render.viewProjection = followedViewProjection;
    nextFrame.render.sceneObjects = getSquirtleAssemblySceneObjects(
      getGameplayOpeningShipSceneObjects(
        session?.sceneObjects,
        session?.gameplayOpeningShip
      ),
      session?.actTwoSquirtle
    );
    nextFrame.render.skyTexture = session?.skyTexture;
    const psxDistanceFogSettings = resolvePsxDistanceFogSettings({
      sceneId: cinematicActive ? gameFlowValues.CINEMATIC : gameFlowValues.GAMEPLAY
    });
    nextFrame.render.psxDistanceFog = psxDistanceFogSettings.enabled ?
      psxDistanceFogSettings :
      null;
  }

  return {
    update
  };
}
