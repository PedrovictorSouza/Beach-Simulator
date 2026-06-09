const DRY_GRASS_WORLD_PROMPT_TILE_REACH_FACTOR = 0.82;
const DRY_GRASS_WORLD_PROMPT_PATCH_REACH_FACTOR = 0.28;
const DRY_GRASS_HINT_INTERACT_DISTANCE = 2.2;

export function findNearbyDryGrassWorldPromptTarget({
  playerPosition,
  groundGrassPatches = [],
  groundDeadInstances = [],
  groundPurifiedInstances = []
} = {}) {
  if (!Array.isArray(playerPosition)) {
    return null;
  }

  const groundCellById = new Map(
    [
      ...(groundDeadInstances || []),
      ...(groundPurifiedInstances || [])
    ]
      .filter((groundCell) => typeof groundCell?.id === "string")
      .map((groundCell) => [groundCell.id, groundCell])
  );
  let nearest = null;
  let nearestDistance = Infinity;

  for (const patch of groundGrassPatches || []) {
    if (patch?.state !== "dead") {
      continue;
    }

    const groundCell = groundCellById.get(patch.cellId);
    const targetPosition = Array.isArray(patch.position) ? patch.position : groundCell?.offset;

    if (
      !groundCell ||
      groundCell.active === false ||
      groundCell.purifiable === false ||
      !Array.isArray(targetPosition)
    ) {
      continue;
    }

    const distance = Math.hypot(
      playerPosition[0] - targetPosition[0],
      playerPosition[2] - targetPosition[2]
    );
    const tileReach =
      (groundCell.tileSpan || 0) * DRY_GRASS_WORLD_PROMPT_TILE_REACH_FACTOR;
    const patchReach =
      Math.max(Number(patch.size?.[0]) || 0, Number(patch.size?.[1]) || 0) *
        DRY_GRASS_WORLD_PROMPT_PATCH_REACH_FACTOR;
    const interactDistance = tileReach + patchReach;

    if (distance <= interactDistance && distance < nearestDistance) {
      nearest = {
        groundCell,
        patch,
        distance
      };
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function findNearbyDryGrassHintTarget({
  playerPosition,
  groundGrassPatches = [],
  leppaTree = null,
  groundDeadInstances = [],
  openingLeppaTreeRequestActive = false,
  getLeppaTreeSurroundingGroundCells = () => []
} = {}) {
  if (!Array.isArray(playerPosition)) {
    return null;
  }

  let nearest = null;
  let nearestDistance = Infinity;

  for (const patch of groundGrassPatches || []) {
    if (patch?.state !== "dead" || !Array.isArray(patch.position)) {
      continue;
    }

    const distance = Math.hypot(
      playerPosition[0] - patch.position[0],
      playerPosition[2] - patch.position[2]
    );
    const sizeReach = Math.max(
      Number(patch.size?.[0]) || 0,
      Number(patch.size?.[1]) || 0
    ) * 0.5;
    const interactDistance = DRY_GRASS_HINT_INTERACT_DISTANCE + sizeReach;

    if (distance <= interactDistance && distance < nearestDistance) {
      nearest = {
        patch,
        targetId: patch.id || patch.cellId || `dry-grass-${patch.position[0]}:${patch.position[2]}`,
        distance
      };
      nearestDistance = distance;
    }
  }

  if (openingLeppaTreeRequestActive) {
    const leppaTreeGroundCells = getLeppaTreeSurroundingGroundCells(
      leppaTree,
      groundDeadInstances
    );

    for (const groundCell of leppaTreeGroundCells) {
      const targetPosition = groundCell?.offset || groundCell?.position;
      if (!Array.isArray(targetPosition)) {
        continue;
      }

      const distance = Math.hypot(
        playerPosition[0] - targetPosition[0],
        playerPosition[2] - targetPosition[2]
      );
      const tileReach = (Number(groundCell.tileSpan) || 1.425) * 0.5;
      const interactDistance = DRY_GRASS_HINT_INTERACT_DISTANCE + tileReach;

      if (distance <= interactDistance && distance < nearestDistance) {
        nearest = {
          groundCell,
          targetId: `leppa-tree-tile:${groundCell.id || `${targetPosition[0]}:${targetPosition[2]}`}`,
          worldPosition: [
            targetPosition[0],
            (targetPosition[1] || 0) + 0.04,
            targetPosition[2]
          ],
          distance
        };
        nearestDistance = distance;
      }
    }
  }

  return nearest;
}
