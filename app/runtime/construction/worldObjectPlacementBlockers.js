export function getTreePlacementBlockerSize({
  treeModel = null,
  instance = null,
  treeFootprint = () => 0,
  treeFootprintScale,
  deadTreeFootprintScale,
  treeMinSize,
  deadTreeMinSize
} = {}) {
  const rawFootprint = treeModel && instance ?
    treeFootprint(treeModel, instance) :
    0;
  const isDeadTree = instance?.alive === false;
  const footprintScale = isDeadTree ?
    deadTreeFootprintScale :
    treeFootprintScale;
  const minSize = isDeadTree ?
    deadTreeMinSize :
    treeMinSize;
  const footprint = Number.isFinite(rawFootprint) && rawFootprint > 0 ?
    rawFootprint :
    minSize;
  const size = Math.max(
    minSize,
    footprint * footprintScale
  );

  return [size, size];
}

export function getLeppaTreePlacementBlockerSize({
  session = null,
  blockerSize,
  defaultCellSize
} = {}) {
  const footprint = session?.leppaTree?.footprint;
  const width = Math.max(1, Math.round(Number(footprint?.width) || 1));
  const height = Math.max(1, Math.round(Number(footprint?.height) || 1));
  if (width <= 1 && height <= 1) {
    return blockerSize;
  }

  const gridStep = Math.max(
    0.25,
    Number(session?.buildGridConfig?.cellSize) ||
      defaultCellSize
  );

  return [
    Number((width * gridStep).toFixed(3)),
    Number((height * gridStep).toFixed(3))
  ];
}

export function getWorldObjectPlacementBlockers({
  session = null,
  treeFootprint = () => 0,
  treeFootprintScale,
  deadTreeFootprintScale,
  treeMinSize,
  deadTreeMinSize,
  leppaTreeBlockerSize,
  leppaTreeDefaultCellSize
} = {}) {
  const blockers = [];

  if (session?.palmModel && Array.isArray(session.palmInstances)) {
    for (const instance of session.palmInstances) {
      if (instance?.active === false || !Array.isArray(instance?.offset)) {
        continue;
      }

      blockers.push({
        id: instance.id ? `tree:${instance.id}` : "tree",
        kind: "tree",
        position: instance.offset,
        size: getTreePlacementBlockerSize({
          treeModel: session.palmModel,
          instance,
          treeFootprint,
          treeFootprintScale,
          deadTreeFootprintScale,
          treeMinSize,
          deadTreeMinSize
        })
      });
    }
  }

  if (Array.isArray(session?.leppaTree?.position)) {
    blockers.push({
      id: session.leppaTree.id ? `tree:${session.leppaTree.id}` : "tree:leppa-tree",
      kind: "tree",
      position: session.leppaTree.position,
      size: getLeppaTreePlacementBlockerSize({
        session,
        blockerSize: leppaTreeBlockerSize,
        defaultCellSize: leppaTreeDefaultCellSize
      })
    });
  }

  return blockers;
}

export function createWorldObjectPlacementBlockerRuntime({
  session = null,
  treeFootprint = () => 0,
  treeFootprintScale,
  deadTreeFootprintScale,
  treeMinSize,
  deadTreeMinSize,
  leppaTreeBlockerSize,
  leppaTreeDefaultCellSize
} = {}) {
  function getTreeBlockerSize(treeModel, instance) {
    return getTreePlacementBlockerSize({
      treeModel,
      instance,
      treeFootprint,
      treeFootprintScale,
      deadTreeFootprintScale,
      treeMinSize,
      deadTreeMinSize
    });
  }

  function getLeppaTreeBlockerSize(nextSession = session) {
    return getLeppaTreePlacementBlockerSize({
      session: nextSession,
      blockerSize: leppaTreeBlockerSize,
      defaultCellSize: leppaTreeDefaultCellSize
    });
  }

  function getBlockers(nextSession = session) {
    return getWorldObjectPlacementBlockers({
      session: nextSession,
      treeFootprint,
      treeFootprintScale,
      deadTreeFootprintScale,
      treeMinSize,
      deadTreeMinSize,
      leppaTreeBlockerSize,
      leppaTreeDefaultCellSize
    });
  }

  return {
    getBlockers,
    getLeppaTreeBlockerSize,
    getTreeBlockerSize
  };
}
