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
