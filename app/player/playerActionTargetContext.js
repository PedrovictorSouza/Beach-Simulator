export function createPlayerActionTargetContext({
  session = {},
  controls = {}
} = {}) {
  function getNearbyActionTargetOptions({
    playerPosition,
    allowPlacement = true,
    canPurifyGround = false,
    canUseFire,
    canUseLeafage = false,
    includeIceGroundInstances = true
  } = {}) {
    return {
      playerPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      leafDen: session.leafDen,
      storyState: controls.storyState,
      inventory: controls.inventory,
      groundDeadInstances: session.groundDeadInstances,
      ...(includeIceGroundInstances ? { iceGroundInstances: session.iceGroundInstances } : {}),
      groundPurifiedInstances: session.groundPurifiedInstances,
      groundGrassPatches: session.groundGrassPatches,
      groundFlowerPatches: session.groundFlowerPatches,
      canPurifyGround,
      canUseLeafage,
      ...(typeof canUseFire === "undefined" ? {} : { canUseFire }),
      allowPlacement
    };
  }

  return {
    getNearbyActionTargetOptions
  };
}

export function isPrimaryActionPlacementTarget(target = null) {
  return Boolean(
    target?.logChairPlacement ||
    target?.greenhousePlacement ||
    target?.campfirePlacement ||
    target?.strawBedPlacement ||
    target?.leafDenKitPlacement ||
    target?.leafDenFurniturePlacement ||
    target?.dittoFlagPlacement
  );
}

export function resolvePrimaryActionTargetIntent({
  target = null,
  harvestRequestSource = null,
  waterGunEquipped = false,
  leafageEquipped = false,
  fireEquipped = false,
  buildBlockEquipped = false,
  leafagePrimaryMoveRequested = false,
  gamepadPrimaryMoveRequested = false
} = {}) {
  const placementTarget = isPrimaryActionPlacementTarget(target);
  const canUseFieldMove = Boolean(
    waterGunEquipped ||
    leafageEquipped ||
    fireEquipped ||
    buildBlockEquipped
  );
  const wantsFieldMove = Boolean(
    canUseFieldMove &&
    (
      harvestRequestSource === "gamepadPrimary" ||
      harvestRequestSource === "keyboardPrimary" ||
      (
        harvestRequestSource === "gamepadBag" &&
        leafageEquipped &&
        target?.leafageGroundCell
      )
    )
  );
  const isWaterGunTreeTarget = Boolean(waterGunEquipped && target?.palm);

  return {
    canUseFieldMove,
    isBagHarvest: Boolean(
      harvestRequestSource === "gamepadBag" &&
      (
        target?.palm ||
        target?.resourceNode
      )
    ),
    isMove: Boolean(
      (buildBlockEquipped && wantsFieldMove) ||
      (waterGunEquipped && target?.groundCell) ||
      isWaterGunTreeTarget ||
      (leafageEquipped && leafagePrimaryMoveRequested && target?.leafageGroundCell) ||
      (fireEquipped && target?.fireGroundCell)
    ),
    isPlacement: placementTarget && !gamepadPrimaryMoveRequested && !buildBlockEquipped,
    isWaterGunTreeTarget,
    placementBlocked: placementTarget && (gamepadPrimaryMoveRequested || buildBlockEquipped),
    placementCanYieldToRotation: Boolean(
      !placementTarget ||
      target?.leafDenKitPlacement ||
      target?.leafDenFurniturePlacement ||
      target?.dittoFlagPlacement
    ),
    placementTarget,
    wantsFieldMove
  };
}

export function resolvePrimaryActionAutoTargetQueries({
  target = null,
  targetIntent = {},
  waterGunEquipped = false,
  waterGunSkillLearned = false,
  leafageEquipped = false,
  leafageSkillLearned = false,
  leafagePrimaryMoveRequested = false
} = {}) {
  return {
    shouldFindLeafageAutoWaterGunTarget: Boolean(
      leafageEquipped &&
      leafagePrimaryMoveRequested &&
      targetIntent.wantsFieldMove &&
      waterGunSkillLearned &&
      !targetIntent.placementTarget &&
      !target?.leafageGroundCell
    ),
    shouldFindLeafageAutoGrowTarget: Boolean(
      waterGunEquipped &&
      leafageSkillLearned &&
      targetIntent.wantsFieldMove &&
      !targetIntent.placementTarget &&
      !target?.palm &&
      !target?.resourceNode &&
      !target?.leppaTree &&
      !target?.groundCell &&
      !target?.leafageGroundCell
    )
  };
}
