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
