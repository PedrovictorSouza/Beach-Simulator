import { getColliderGizmoBillboards } from "../../session/colliderGizmos.js";
import { getNatureRevivalBillboards } from "../../session/natureRevivalEffects.js";

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

export function createRenderSnapshotCompletionFrameRuntime({
  session = {},
  controls = {},
  rendering = {},
  treeRevivalLeafBurstFrameRuntime = { appendBillboards: () => {} },
  getInteractionDebugColliders = () => [],
  sources = {}
} = {}) {
  const {
    getNatureRevivalBillboardsForSession = getNatureRevivalBillboards,
    getColliderGizmoBillboardsForSession = getColliderGizmoBillboards
  } = sources;

  function update(nextFrame, { deltaTime = 0 } = {}) {
    nextFrame.render.genericBillboards.push(
      ...getNatureRevivalBillboardsForSession(
        session.natureRevivalEffects,
        session.natureRevivalSparkTexture,
        rendering.fullUvRect
      )
    );
    treeRevivalLeafBurstFrameRuntime.appendBillboards(nextFrame);

    if (rendering.debugColliders) {
      const debugColliders = [
        ...(session.elevatedTerrainColliders || []),
        ...getInteractionDebugColliders()
      ];
      nextFrame.colliderGizmos.visible = true;
      nextFrame.colliderGizmos.colliders = debugColliders;
      nextFrame.render.genericBillboards.push(
        ...getColliderGizmoBillboardsForSession({
          colliders: debugColliders,
          textures: session.colliderGizmoTextures
        })
      );
    }

    nextFrame.render.characters = {
      storyState: controls.storyState,
      playerCharacter: session.playerCharacter,
      npcActors: session.npcActors,
      characterTextures: session.characterTextures,
      isNpcActive: rendering.isNpcActive
    };

    nextFrame.tutorial.active = true;
    nextFrame.tutorial.playerPosition = session.playerCharacter?.getPosition() || null;
    nextFrame.tutorial.deltaTime = deltaTime;
  }

  return {
    update
  };
}
