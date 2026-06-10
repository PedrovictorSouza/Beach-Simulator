const DEFAULT_LANDSCAPE_CUT_EFFECT_SIZE = [1.18, 0.96];

function cloneGroundGrassPatchForCutEffect(patch) {
  if (!patch || !Array.isArray(patch.position)) {
    return null;
  }

  return {
    ...patch,
    position: [...patch.position],
    size: Array.isArray(patch.size) ?
      [...patch.size] :
      [...DEFAULT_LANDSCAPE_CUT_EFFECT_SIZE]
  };
}

function findDestroyableLandscapePatchByTarget(target, {
  groundGrassPatches = [],
  groundFlowerPatches = []
} = {}) {
  if (target?.action !== "destroyInstantiatedObject") {
    return null;
  }

  const patches = [
    ...(groundGrassPatches || []),
    ...(groundFlowerPatches || [])
  ];
  const exactPatch = patches.find((patch) => patch?.id === target.id);

  if (exactPatch) {
    return exactPatch;
  }

  return patches.find((patch) => target.cellId && patch?.cellId === target.cellId) || null;
}

export function getDestroyableLandscapePatchForInteractOptions({
  findNearbyDestroyableInstantiatedObject,
  playerPosition,
  session = {},
  storyState
} = {}) {
  const groundGrassPatches = session.groundGrassPatches || [];
  const groundFlowerPatches = session.groundFlowerPatches || [];
  const nearbyTarget = findNearbyDestroyableInstantiatedObject?.(
    playerPosition,
    groundGrassPatches,
    storyState,
    groundFlowerPatches
  );

  return cloneGroundGrassPatchForCutEffect(
    findDestroyableLandscapePatchByTarget(nearbyTarget?.target, {
      groundGrassPatches,
      groundFlowerPatches
    })
  );
}
