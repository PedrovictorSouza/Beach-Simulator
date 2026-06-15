const NOOP = () => {};

function defaultNowMs() {
  return typeof performance !== "undefined" && typeof performance.now === "function" ?
    performance.now() :
    Date.now();
}

function hasGroundPatchForCellId(session, cellId) {
  if (typeof cellId !== "string") {
    return false;
  }

  return [
    ...(session.groundGrassPatches || []),
    ...(session.groundFlowerPatches || [])
  ].some((patch) => patch?.cellId === cellId);
}

function findGrassPatchForGroundCell(session, groundCell) {
  if (!groundCell?.id || !Array.isArray(session.groundGrassPatches)) {
    return null;
  }

  return session.groundGrassPatches.find((patch) => patch?.cellId === groundCell.id) || null;
}

function isAliveGrassPatchForGroundCell(session, groundCell) {
  return findGrassPatchForGroundCell(session, groundCell)?.state === "alive";
}

export function createFieldMoveImpactRuntime({
  session = {},
  controls = {},
  carbonItemId = "carbon",
  companionAbilityResourcesRuntime = {},
  getNowMs = defaultNowMs,
  groundActionFeedbackRuntime = {},
  hud = {},
  performGameplayHarvestAction = () => false,
  playInstanceObjectSfx = NOOP,
  supplyCounterPromptController = {}
} = {}) {
  function applyCharmanderFireImpact(action) {
    const result = performGameplayHarvestAction({
      playerPosition: action.approachPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: false,
      groundDeadInstances: session.groundDeadInstances,
      iceGroundInstances: session.iceGroundInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: false,
      canUseFire: true,
      useFire: true,
      forcedHarvestTarget: {
        fireGroundCell: action.groundCell,
        distance: 0
      }
    }, {
      actionType: "fire",
      groundCell: action.groundCell
    });

    if (result) {
      hud.syncInventoryUi?.(controls.inventory);
      supplyCounterPromptController.trigger?.(carbonItemId, controls.inventory, getNowMs());
      groundActionFeedbackRuntime.triggerFeedback?.(action.groundCell, "fire", getNowMs());
    }

    return result;
  }

  function applyBulbasaurLeafageImpact(action) {
    const hadLeafagePatch = hasGroundPatchForCellId(session, action.groundCell?.id);
    const result = performGameplayHarvestAction({
      playerPosition: action.approachPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: false,
      groundDeadInstances: session.groundDeadInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: true,
      forcedHarvestTarget: {
        leafageGroundCell: action.groundCell,
        distance: 0
      }
    }, {
      actionType: "leafage",
      groundCell: action.groundCell
    });

    if (result && !hadLeafagePatch && hasGroundPatchForCellId(session, action.groundCell?.id)) {
      playInstanceObjectSfx();
    }

    return result;
  }

  function applySquirtleWaterGunImpact(action) {
    const grassPatchWasDry =
      Boolean(findGrassPatchForGroundCell(session, action.groundCell)) &&
      !isAliveGrassPatchForGroundCell(session, action.groundCell);
    const result = performGameplayHarvestAction({
      playerPosition: action.approachPosition,
      palmModel: session.palmModel,
      palmInstances: session.palmInstances,
      resourceNodes: session.resourceNodes,
      leppaTree: session.leppaTree,
      inventory: controls.inventory,
      canPurifyGround: true,
      groundDeadInstances: session.groundDeadInstances,
      groundFlowerPatches: session.groundFlowerPatches,
      groundGrassPatches: session.groundGrassPatches,
      groundPurifiedInstances: session.groundPurifiedInstances,
      storyState: controls.storyState,
      leafDen: session.leafDen,
      woodDrops: session.woodDrops,
      leppaBerryDrops: session.leppaBerryDrops,
      canUseLeafage: false,
      useWaterGun: true,
      forcedHarvestTarget: {
        groundCell: action.groundCell,
        distance: 0
      }
    }, {
      actionType: "waterGun",
      groundCell: action.groundCell
    });

    if (result && grassPatchWasDry && isAliveGrassPatchForGroundCell(session, action.groundCell)) {
      playInstanceObjectSfx();
    }

    if (result) {
      companionAbilityResourcesRuntime.recordSquirtleWaterGunUse?.();
    }

    return result;
  }

  return {
    applyBulbasaurLeafageImpact,
    applyCharmanderFireImpact,
    applySquirtleWaterGunImpact
  };
}
