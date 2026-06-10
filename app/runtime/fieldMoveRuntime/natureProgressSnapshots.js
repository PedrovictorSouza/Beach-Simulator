function getGroundCellIdKey(groundCells = []) {
  return Array.isArray(groundCells) ?
    groundCells
      .map((groundCell) => groundCell?.id)
      .filter((id) => typeof id === "string")
      .sort()
      .join("|") :
    "";
}

function getPatchCellIdKey(patches = []) {
  return Array.isArray(patches) ?
    patches
      .map((patch) => patch?.cellId)
      .filter((cellId) => typeof cellId === "string")
      .sort()
      .join("|") :
    "";
}

function getAlivePatchCellIdKey(patches = []) {
  return Array.isArray(patches) ?
    patches
      .filter((patch) => patch?.state === "alive")
      .map((patch) => patch?.cellId)
      .filter((cellId) => typeof cellId === "string")
      .sort()
      .join("|") :
    "";
}

export function getGardenProgressSnapshot({ session = {}, storyState = {} } = {}) {
  return [
    getGroundCellIdKey(session.groundDeadInstances),
    getGroundCellIdKey(session.iceGroundInstances),
    getGroundCellIdKey(session.groundPurifiedInstances),
    getPatchCellIdKey(session.groundGrassPatches),
    getAlivePatchCellIdKey(session.groundGrassPatches),
    getAlivePatchCellIdKey(session.groundFlowerPatches),
    Number(storyState?.flags?.wateredTreeCount || 0)
  ].join(";");
}

export function getTreeRevivalSnapshot({ session = {}, storyState = {} } = {}) {
  return {
    palmAliveById: new Map(
      (session.palmInstances || []).map((palmInstance) => [
        palmInstance?.id,
        Boolean(palmInstance?.alive)
      ])
    ),
    leppaTreeRevived: Boolean(
      session.leppaTree?.revived ||
      storyState?.flags?.leppaTreeRevived
    )
  };
}
