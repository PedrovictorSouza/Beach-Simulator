export function createPlayerActionContext({
  session = {},
  controls = {}
} = {}) {
  function getDestroyOptions(playerPosition) {
    return {
      playerPosition,
      npcActors: session.npcActors,
      interactables: session.interactables,
      storyState: controls.storyState,
      inventory: controls.inventory,
      woodDrops: session.woodDrops,
      groundGrassPatches: session.groundGrassPatches,
      groundFlowerPatches: session.groundFlowerPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      logChair: session.logChair,
      leafDen: session.leafDen,
      leppaTree: session.leppaTree,
      leppaBerryDrops: session.leppaBerryDrops,
      timburrEncounter: session.timburrEncounter,
      charmanderEncounter: session.charmanderEncounter,
      bulbasaurEncounter: session.bulbasaurEncounter
    };
  }

  function getInteractOptions(playerPosition, { onNpcInteractionStart = null } = {}) {
    return {
      ...getDestroyOptions(playerPosition),
      onNpcInteractionStart
    };
  }

  function getHarvestOptions({
    playerPosition,
    waterGunEquipped = false,
    leafageEquipped = false,
    fireEquipped = false,
    options = {}
  } = {}) {
    return {
      playerPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: waterGunEquipped,
      groundDeadInstances: session.groundDeadInstances,
      iceGroundInstances: session.iceGroundInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: leafageEquipped && options.allowLeafage !== false,
      canUseFire: fireEquipped && options.allowFire !== false,
      useWaterGun: Boolean(options.useWaterGun),
      useFire: Boolean(options.useFire),
      forcedHarvestTarget: options.forcedHarvestTarget || null,
      allowPlacement: options.allowPlacement !== false
    };
  }

  return {
    getDestroyOptions,
    getHarvestOptions,
    getInteractOptions
  };
}
