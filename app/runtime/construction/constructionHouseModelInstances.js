export function syncCampfireTrainHouseModelInstance({
  session = {},
  storyState = {},
  nowSeconds = 0,
  deltaTime = 0,
  getWorkbenchRotationPreviewYaw = () => 0,
  applyTrainHouseDance = () => {},
  applyPlacementSpawn = () => false,
  applyRotationTint = () => {}
} = {}) {
  const instance = session.campfireTrainHouseModelInstance;
  if (!instance) {
    return;
  }

  if (session.campfirePlacementPreview?.active) {
    return;
  }

  if (!session.campfire?.position || !storyState.flags?.campfireSpatOut) {
    instance.active = false;
    return;
  }

  applyTrainHouseDance(
    instance,
    session.campfire.position,
    nowSeconds,
    getWorkbenchRotationPreviewYaw({
      kind: "trainHouse",
      placement: session.campfire
    })
  );
  const spawnApplied = applyPlacementSpawn(session.campfire, instance, {
    baseScale: instance.trainHouseBaseScale,
    groundY: instance.trainHouseGroundY,
    deltaTime
  });
  if (!spawnApplied) {
    instance.alpha = 1;
    instance.tintStrength = 0;
  }
  applyRotationTint("trainHouse", instance, nowSeconds);
}

export function syncGreenhouseModelInstances({
  session = {},
  deltaTime = 0,
  applyPlacementSpawn = () => false
} = {}) {
  const placements = Array.isArray(session.greenhouses) && session.greenhouses.length > 0 ?
    session.greenhouses :
    (session.greenhouse ? [session.greenhouse] : []);
  const instances = Array.isArray(session.greenhouseModelInstances) ?
    session.greenhouseModelInstances :
    [];

  if (!instances.length) {
    return;
  }

  if (!placements.length) {
    for (const instance of instances) {
      instance.active = false;
    }
    return;
  }

  placements.forEach((placement, index) => {
    const instance = instances[index];
    if (!instance || !Array.isArray(placement?.position)) {
      return;
    }

    instance.active = true;
    const spawnApplied = applyPlacementSpawn(placement, instance, {
      baseScale: instance.greenhouseBaseScale,
      groundY: instance.greenhouseGroundY,
      deltaTime
    });

    if (!spawnApplied) {
      const baseYaw = instance.greenhouseBaseYaw ?? 0;
      instance.offset = [
        placement.position[0],
        instance.greenhouseGroundY || 0.02,
        placement.position[2]
      ];
      instance.scale = instance.greenhouseBaseScale || instance.scale || 1.725;
      instance.yaw = baseYaw + Number(placement.yaw || 0);
      instance.alpha = 1;
      instance.tintStrength = 0;
    }
  });
}

export function syncLeafDenModelInstance({
  session = {},
  storyState = {},
  deltaTime = 0,
  getWorkbenchRotationPreviewYaw = () => 0,
  applyPlacementSpawn = () => {},
  applyRotationTint = () => {}
} = {}) {
  const instance = session.leafDenModelInstance;
  if (!instance) {
    return;
  }

  if (session.leafDenPlacementPreviewModelInstance && !session.leafDenKitPlacementPreview?.active) {
    session.leafDenPlacementPreviewModelInstance.active = false;
    session.leafDenPlacementPreviewModelInstance.alpha = 1;
    session.leafDenPlacementPreviewModelInstance.tintStrength = 0;
  }

  if (session.leafDenKitPlacementPreview?.active) {
    return;
  }

  if (
    !session.leafDen?.position ||
    !storyState.flags?.leafDenKitPlaced
  ) {
    instance.active = false;
    return;
  }

  const groundY = instance.leafDenGroundY ?? Number(instance.offset?.[1] ?? 0.02);
  const baseScale = instance.leafDenBaseScale ?? Number(instance.scale || 1);
  const baseYaw = instance.leafDenBaseYaw ?? Number(instance.yaw || 0);
  instance.leafDenGroundY = groundY;
  instance.leafDenBaseScale = baseScale;
  instance.leafDenBaseYaw = baseYaw;
  instance.offset = [
    session.leafDen.position[0],
    groundY,
    session.leafDen.position[2]
  ];
  instance.scale = baseScale;
  instance.yaw = baseYaw + getWorkbenchRotationPreviewYaw({
    kind: "house",
    placement: session.leafDen
  });
  instance.alpha = 1;
  instance.tintStrength = 0;
  instance.active = true;
  applyPlacementSpawn(session.leafDen, instance, {
    baseScale,
    groundY,
    deltaTime
  });
  applyRotationTint("house", instance);
}

export function ensurePlayerHouseModelInstances(session = {}) {
  session.playerHouses ||= [];
  session.playerHouseModelInstances ||= [];
  session.leafDenModelInstances ||= [
    session.leafDenModelInstance,
    session.leafDenPlacementPreviewModelInstance
  ].filter(Boolean);

  while (session.playerHouseModelInstances.length < session.playerHouses.length) {
    const houseIndex = session.playerHouseModelInstances.length;
    const house = session.playerHouses[houseIndex] || {};
    const baseScale =
      session.leafDenModelInstance?.leafDenBaseScale ??
      session.leafDenModelInstance?.scale ??
      1;
    const baseYaw =
      session.leafDenModelInstance?.leafDenBaseYaw ??
      session.leafDenModelInstance?.yaw ??
      0;
    const groundY =
      session.leafDenModelInstance?.leafDenGroundY ??
      session.leafDenModelInstance?.offset?.[1] ??
      0.02;
    const instance = {
      id: `${house.id || `player-house-${houseIndex}`}-model`,
      offset: Array.isArray(house.position) ?
        [house.position[0], groundY, house.position[2]] :
        [0, groundY, 0],
      scale: baseScale,
      yaw: baseYaw + Number(house.yaw || 0),
      active: false,
      leafDenGroundY: groundY,
      leafDenBaseScale: baseScale,
      leafDenBaseYaw: baseYaw
    };
    session.playerHouseModelInstances.push(instance);
    session.leafDenModelInstances.push(instance);
  }

  if (session.playerHouseModelInstances.length > session.playerHouses.length) {
    for (let index = session.playerHouses.length; index < session.playerHouseModelInstances.length; index += 1) {
      session.playerHouseModelInstances[index].active = false;
    }
  }

  return session.playerHouseModelInstances;
}

export function syncPlayerHouseModelInstances({
  session = {},
  deltaTime = 0,
  renderCenter = null,
  selectedRotationKind = null,
  prepareDistance = Infinity,
  getWorkbenchRotationPreviewYaw = () => 0,
  isWorldPositionWithinRenderDistance = () => true,
  applyPlacementSpawn = () => {},
  applyRotationTint = () => {}
} = {}) {
  const instances = ensurePlayerHouseModelInstances(session);

  for (let index = 0; index < instances.length; index += 1) {
    const instance = instances[index];
    const house = session.playerHouses?.[index] || null;
    if (!instance || !Array.isArray(house?.position)) {
      if (instance) {
        instance.active = false;
      }
      continue;
    }

    const isSelectedForRotation = selectedRotationKind === `playerHouse:${house.id}`;
    const hasSpawnEffect = Boolean(house.spawnEffect);
    if (
      !isSelectedForRotation &&
      !hasSpawnEffect &&
      !isWorldPositionWithinRenderDistance(
        house.position,
        renderCenter,
        prepareDistance
      )
    ) {
      instance.active = false;
      continue;
    }

    const groundY = instance.leafDenGroundY ?? Number(instance.offset?.[1] ?? 0.02);
    const baseScale = instance.leafDenBaseScale ?? Number(instance.scale || 1);
    const baseYaw = instance.leafDenBaseYaw ?? Number(instance.yaw || 0);
    instance.leafDenGroundY = groundY;
    instance.leafDenBaseScale = baseScale;
    instance.leafDenBaseYaw = baseYaw;
    instance.offset = [
      house.position[0],
      groundY,
      house.position[2]
    ];
    instance.scale = baseScale;
    instance.yaw = baseYaw + getWorkbenchRotationPreviewYaw({
      kind: `playerHouse:${house.id}`,
      placement: house
    });
    instance.alpha = 1;
    instance.tintStrength = 0;
    instance.active = true;
    applyPlacementSpawn(house, instance, {
      baseScale,
      groundY,
      deltaTime
    });
    applyRotationTint(`playerHouse:${house.id}`, instance);
  }

  return instances;
}

export function createConstructionHouseModelInstanceRuntime({
  session = {},
  getStoryState = () => ({}),
  getNowSeconds = () => 0,
  getSelectedRotationKind = () => null,
  prepareDistance = Infinity,
  getWorkbenchRotationPreviewYaw = () => 0,
  isWorldPositionWithinRenderDistance = () => true,
  applyTrainHouseDance = () => {},
  applyPlacementSpawn = () => false,
  applyRotationTint = () => {}
} = {}) {
  function syncCampfireTrainHouse(deltaTime = 0, nowSeconds = getNowSeconds()) {
    return syncCampfireTrainHouseModelInstance({
      session,
      storyState: getStoryState(),
      nowSeconds,
      deltaTime,
      getWorkbenchRotationPreviewYaw,
      applyTrainHouseDance,
      applyPlacementSpawn,
      applyRotationTint
    });
  }

  function syncGreenhouse(deltaTime = 0) {
    return syncGreenhouseModelInstances({
      session,
      deltaTime,
      applyPlacementSpawn
    });
  }

  function syncLeafDen(deltaTime = 0) {
    return syncLeafDenModelInstance({
      session,
      storyState: getStoryState(),
      deltaTime,
      getWorkbenchRotationPreviewYaw,
      applyPlacementSpawn,
      applyRotationTint
    });
  }

  function ensurePlayerHouses() {
    return ensurePlayerHouseModelInstances(session);
  }

  function syncPlayerHouses(deltaTime = 0, renderCenter = null) {
    return syncPlayerHouseModelInstances({
      session,
      deltaTime,
      renderCenter,
      selectedRotationKind: getSelectedRotationKind(),
      prepareDistance,
      getWorkbenchRotationPreviewYaw,
      isWorldPositionWithinRenderDistance,
      applyPlacementSpawn,
      applyRotationTint
    });
  }

  return {
    ensurePlayerHouses,
    syncCampfireTrainHouse,
    syncGreenhouse,
    syncLeafDen,
    syncPlayerHouses
  };
}
