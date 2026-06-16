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

  function getNearbyInteractableArgs(playerPosition) {
    return [
      playerPosition,
      session.npcActors,
      session.interactables,
      controls.storyState,
      session.groundGrassPatches || [],
      session.logChair,
      session.leafDen,
      session.timburrEncounter,
      session.charmanderEncounter,
      session.leppaTree,
      session.bulbasaurEncounter,
      session.groundFlowerPatches || []
    ];
  }

  function getBagDestroyTargetArgs(playerPosition) {
    return [
      playerPosition,
      session.groundGrassPatches || [],
      controls.storyState,
      session.groundFlowerPatches || [],
      { includeRestoredGrass: true }
    ];
  }

  return {
    getBagDestroyTargetArgs,
    getNearbyInteractableArgs,
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

export function resolvePrimaryActionTargetFollowupIntent({
  target = null,
  targetIntent = {},
  leafageAutoWaterGunTarget = null,
  leafageAutoGrowTarget = null,
  leafageEquipped = false,
  leafagePrimaryMoveRequested = false,
  fireEquipped = false
} = {}) {
  const hasLeafageAutoWaterGunGroundCell = Boolean(leafageAutoWaterGunTarget?.groundCell);
  const hasLeafageAutoGrowGroundCell = Boolean(leafageAutoGrowTarget?.leafageGroundCell);
  const invalidLeafageUse = Boolean(
    leafageEquipped &&
    leafagePrimaryMoveRequested &&
    targetIntent.wantsFieldMove &&
    !targetIntent.placementTarget &&
    !target?.leafageGroundCell &&
    !hasLeafageAutoWaterGunGroundCell
  );
  const invalidFireUse = Boolean(
    fireEquipped &&
    targetIntent.wantsFieldMove &&
    !targetIntent.placementTarget &&
    !target?.fireGroundCell
  );

  return {
    hasLeafageAutoGrowGroundCell,
    hasLeafageAutoWaterGunGroundCell,
    invalidFireUse,
    invalidLeafageUse,
    shouldFindAlreadyResolvedGroundCell: Boolean(
      targetIntent.wantsFieldMove &&
      !targetIntent.placementTarget &&
      !targetIntent.isMove &&
      !hasLeafageAutoWaterGunGroundCell &&
      !hasLeafageAutoGrowGroundCell
    )
  };
}

export function resolvePrimaryActionSecondaryTargetQueries({
  harvestRequestSource = null,
  dialogueActive = false,
  targetIntent = {},
  followupIntent = {},
  repeatedFieldMove = false,
  primaryInteractTargetIsWorkbench = false,
  primaryActionConfirmsRotation = false
} = {}) {
  const hasAutoTarget = Boolean(
    followupIntent.hasLeafageAutoWaterGunGroundCell ||
    followupIntent.hasLeafageAutoGrowGroundCell
  );

  return {
    shouldFindBagDestroyTarget: Boolean(
      harvestRequestSource === "gamepadBag" &&
      !dialogueActive
    ),
    shouldFindInteractTarget: Boolean(
      !dialogueActive &&
      !targetIntent.wantsFieldMove &&
      !targetIntent.isPlacement &&
      !targetIntent.isMove &&
      !hasAutoTarget &&
      !repeatedFieldMove &&
      !followupIntent.invalidLeafageUse &&
      !followupIntent.invalidFireUse
    ),
    shouldFindRotationTarget: Boolean(
      !primaryInteractTargetIsWorkbench &&
      !primaryActionConfirmsRotation &&
      !dialogueActive &&
      targetIntent.placementCanYieldToRotation &&
      !targetIntent.isMove &&
      !hasAutoTarget
    )
  };
}
