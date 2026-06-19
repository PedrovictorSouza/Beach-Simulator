import { WATER_GUN_POWER_ITEM_ID } from "../../gameplayContent.js";
import { syncPurifiedGroundVariantInstances } from "../../groundGrid.js";
import { createDefaultPlacementDatabase, createGridSystem, migrateLegacyPlaceablesToGridRecords } from "../gameplay/gridBuildingSystem.js";
import { applySavedPlayerProfile } from "../player/playerProfile.js";

const GRID_PLACEMENT_SAVE_SCHEMA_VERSION = 1;
export const DEFAULT_GRID_PLACEMENT_SAVE_CONFIG = Object.freeze({
  cellSize: 1,
  origin: Object.freeze({ x: -128, y: 0, z: -128 }),
  width: 256,
  height: 256,
  visualOffsetY: 0.03
});
const DEFAULT_GRID_PLACEMENT_DATABASE = createDefaultPlacementDatabase();
const ACTIVE_FIELD_MOVE_ORDER = ["waterGun", "leafage", "fire", "buildBlock"];

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cloneFiniteNumberArray(value, length) {
  if (!Array.isArray(value) || value.length < length) {
    return null;
  }

  const next = value.slice(0, length).map(Number);
  return next.every(Number.isFinite) ? next : null;
}

function cloneGridCell(cell) {
  if (!isPlainObject(cell)) {
    return null;
  }

  const x = Number(cell.x);
  const y = Number(cell.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x: Math.floor(x),
    y: Math.floor(y)
  };
}

function cloneGridFootprintSize(size) {
  if (!isPlainObject(size)) {
    return null;
  }

  const width = Number(size.width);
  const height = Number(size.height);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return null;
  }

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height))
  };
}

export function cloneGridPlacementConfig(config = DEFAULT_GRID_PLACEMENT_SAVE_CONFIG) {
  const source = isPlainObject(config) ? config : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG;
  const origin = isPlainObject(source.origin) ? source.origin : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin;
  const cellSize = Number(source.cellSize);
  const width = Number(source.width);
  const height = Number(source.height);
  const visualOffsetY = Number(source.visualOffsetY);
  const originX = Number(origin.x);
  const originY = Number(origin.y);
  const originZ = Number(origin.z);

  return {
    cellSize: Number.isFinite(cellSize) && cellSize > 0 ?
      cellSize :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.cellSize,
    origin: {
      x: Number.isFinite(originX) ? originX : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin.x,
      y: Number.isFinite(originY) ? originY : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin.y,
      z: Number.isFinite(originZ) ? originZ : DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.origin.z
    },
    width: Number.isFinite(width) && width > 0 ?
      Math.floor(width) :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.width,
    height: Number.isFinite(height) && height > 0 ?
      Math.floor(height) :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.height,
    visualOffsetY: Number.isFinite(visualOffsetY) ?
      visualOffsetY :
      DEFAULT_GRID_PLACEMENT_SAVE_CONFIG.visualOffsetY
  };
}

function buildOccupiedGridCells(originCell, size) {
  const origin = cloneGridCell(originCell);
  const footprint = cloneGridFootprintSize(size);
  if (!origin || !footprint) {
    return [];
  }

  const cells = [];
  for (let y = 0; y < footprint.height; y += 1) {
    for (let x = 0; x < footprint.width; x += 1) {
      cells.push({
        x: origin.x + x,
        y: origin.y + y
      });
    }
  }
  return cells;
}

function cloneSavedGridPlacementRecord(record) {
  if (!isPlainObject(record)) {
    return null;
  }

  const placedObjectId = typeof record.placedObjectId === "string" ?
    record.placedObjectId :
    null;
  const sourceDatabaseId = typeof record.sourceDatabaseId === "string" ?
    record.sourceDatabaseId :
    null;
  const originCell = cloneGridCell(record.originCell);
  const size = cloneGridFootprintSize(record.size);
  if (!placedObjectId || !sourceDatabaseId || !originCell || !size) {
    return null;
  }

  const occupiedCells = Array.isArray(record.occupiedCells) ?
    record.occupiedCells.map(cloneGridCell).filter(Boolean) :
    buildOccupiedGridCells(originCell, size);

  return {
    placedObjectId,
    sourceDatabaseId,
    originCell,
    size,
    occupiedCells,
    ...(typeof record.legacyKey === "string" ? { legacyKey: record.legacyKey } : {})
  };
}

export function cloneSavedGridPlacement(gridPlacement) {
  if (!isPlainObject(gridPlacement) || !Array.isArray(gridPlacement.placedObjects)) {
    return null;
  }

  return {
    schemaVersion: GRID_PLACEMENT_SAVE_SCHEMA_VERSION,
    gridConfig: cloneGridPlacementConfig(gridPlacement.gridConfig),
    placedObjects: gridPlacement.placedObjects
      .map(cloneSavedGridPlacementRecord)
      .filter(Boolean)
  };
}

export function cloneSavedFreeBlockBuild(freeBlockBuild) {
  if (!isPlainObject(freeBlockBuild) || !Array.isArray(freeBlockBuild.floorBlocks)) {
    return null;
  }

  const minX = Math.trunc(Number(freeBlockBuild.bounds?.minX));
  const maxX = Math.trunc(Number(freeBlockBuild.bounds?.maxX));
  const minY = Math.trunc(Number(freeBlockBuild.bounds?.minY));
  const maxY = Math.trunc(Number(freeBlockBuild.bounds?.maxY));
  const bounds = [minX, maxX, minY, maxY].every(Number.isFinite) ?
    { minX, maxX, minY, maxY } :
    null;
  const floorBlocks = freeBlockBuild.floorBlocks
    .map((block) => {
      const cell = cloneGridCell(block?.cell || block);
      return cell ? { cell } : null;
    })
    .filter(Boolean);

  if (!bounds || !floorBlocks.length) {
    return null;
  }

  return {
    schemaVersion: 1,
    buildId: typeof freeBlockBuild.buildId === "string" ? freeBlockBuild.buildId : "freeBuild",
    bounds,
    floorBlocks
  };
}

export function createLegacyGridPlacementSaveData(placeables, {
  gridConfig: sourceGridConfig = DEFAULT_GRID_PLACEMENT_SAVE_CONFIG
} = {}) {
  const gridConfig = cloneGridPlacementConfig(sourceGridConfig);
  const gridSystem = createGridSystem(gridConfig);
  const placedObjects = migrateLegacyPlaceablesToGridRecords({
    placeables,
    gridSystem,
    placementDatabase: DEFAULT_GRID_PLACEMENT_DATABASE
  })
    .map((record) => cloneSavedGridPlacementRecord({
      ...record,
      occupiedCells: buildOccupiedGridCells(record.originCell, record.size)
    }))
    .filter(Boolean);

  return {
    schemaVersion: GRID_PLACEMENT_SAVE_SCHEMA_VERSION,
    gridConfig,
    placedObjects
  };
}

export function cloneSavedPlacement(placement) {
  if (!isPlainObject(placement)) {
    return null;
  }

  const position = cloneFiniteNumberArray(placement.position, 3);
  const size = cloneFiniteNumberArray(placement.size, 2);
  const uvRect = cloneFiniteNumberArray(placement.uvRect, 4) || [0, 0, 1, 1];
  if (!position || !size) {
    return null;
  }

  const interactionBox = isPlainObject(placement.interactionBox) ?
    {
      id: typeof placement.interactionBox.id === "string" ? placement.interactionBox.id : null,
      markerKey: typeof placement.interactionBox.markerKey === "string" ?
        placement.interactionBox.markerKey :
        null,
      offset: cloneFiniteNumberArray(placement.interactionBox.offset, 3)
    } :
    null;

  return {
    id: typeof placement.id === "string" ? placement.id : null,
    ...(typeof placement.kind === "string" ? { kind: placement.kind } : {}),
    ...(typeof placement.constructionSiteId === "string" ? { constructionSiteId: placement.constructionSiteId } : {}),
    ...(typeof placement.buildingKitId === "string" ? { buildingKitId: placement.buildingKitId } : {}),
    ...(typeof placement.constructionName === "string" ? { constructionName: placement.constructionName } : {}),
    ...(typeof placement.constructionStatus === "string" ? { constructionStatus: placement.constructionStatus } : {}),
    ...(Number.isFinite(Number(placement.yaw)) ? { yaw: Number(placement.yaw) } : {}),
    ...(interactionBox?.offset ? { interactionBox } : {}),
    position,
    size,
    uvRect
  };
}

function cloneSavedPatch(patch) {
  if (!isPlainObject(patch) || typeof patch.cellId !== "string") {
    return null;
  }

  const position = cloneFiniteNumberArray(patch.position, 3);
  const size = cloneFiniteNumberArray(patch.size, 2);
  if (!position || !size) {
    return null;
  }

  return {
    id: typeof patch.id === "string" ? patch.id : `saved-patch-${patch.cellId}`,
    cellId: patch.cellId,
    position,
    size,
    state: patch.state === "alive" ? "alive" : "dead",
    ...(typeof patch.habitatGroupId === "string" ? { habitatGroupId: patch.habitatGroupId } : {})
  };
}

function cloneSavedPlacementList(placements) {
  return Array.isArray(placements) ?
    placements.map(cloneSavedPlacement).filter(Boolean) :
    [];
}

export function cloneSessionPlaceables(session) {
  const greenhouses = cloneSavedPlacementList(session?.greenhouses);
  const legacyGreenhouse = cloneSavedPlacement(session?.greenhouse);
  const savedGreenhouses = greenhouses.length > 0 ?
    greenhouses :
    (legacyGreenhouse ? [legacyGreenhouse] : []);

  return {
    logChair: cloneSavedPlacement(session?.logChair),
    greenhouse: savedGreenhouses[0] || null,
    greenhouses: savedGreenhouses,
    strawBed: cloneSavedPlacement(session?.strawBed),
    campfire: cloneSavedPlacement(session?.campfire),
    leafDen: cloneSavedPlacement(session?.leafDen),
    dittoFlag: cloneSavedPlacement(session?.dittoFlag),
    playerHouses: Array.isArray(session?.playerHouses) ?
      session.playerHouses.map(cloneSavedPlacement).filter(Boolean) :
      [],
    leafDenFurniture: Array.isArray(session?.leafDenFurniture) ?
      session.leafDenFurniture.map(cloneSavedPlacement).filter(Boolean) :
      []
  };
}

export function cloneSessionGridPlacement(session) {
  const savedGridPlacement = cloneSavedGridPlacement(session?.gridPlacement);
  if (savedGridPlacement) {
    return savedGridPlacement;
  }

  const legacyGridPlacement = createLegacyGridPlacementSaveData(cloneSessionPlaceables(session), {
    gridConfig: session?.buildGridConfig || DEFAULT_GRID_PLACEMENT_SAVE_CONFIG
  });
  return legacyGridPlacement.placedObjects.length ? legacyGridPlacement : null;
}

export function cloneSessionFreeBlockBuild(session) {
  const snapshot =
    session?.freeBlockBuildState?.serializeFreeBlocks?.() ||
    session?.freeBlockBuildSnapshot ||
    null;
  return cloneSavedFreeBlockBuild(snapshot);
}

function cloneAlivePatches(patches) {
  return Array.isArray(patches) ?
    patches
      .filter((patch) => patch?.state === "alive")
      .map(cloneSavedPatch)
      .filter(Boolean) :
    [];
}

export function cloneSessionWorldState(session) {
  const burnedColdGroundCellIds = [
    ...(Array.isArray(session?.groundDeadInstances) ? session.groundDeadInstances : []),
    ...(Array.isArray(session?.groundPurifiedInstances) ? session.groundPurifiedInstances : [])
  ]
    .filter((groundCell) => groundCell?.wasColdGroundBurned)
    .map((groundCell) => groundCell?.id)
    .filter((id) => typeof id === "string");

  return {
    burnedColdGroundCellIds: [...new Set(burnedColdGroundCellIds)],
    purifiedGroundCellIds: Array.isArray(session?.groundPurifiedInstances) ?
      session.groundPurifiedInstances
        .map((groundCell) => groundCell?.id)
        .filter((id) => typeof id === "string") :
      [],
    aliveGroundGrassPatches: cloneAlivePatches(session?.groundGrassPatches),
    aliveGroundFlowerPatches: cloneAlivePatches(session?.groundFlowerPatches)
  };
}

export function cloneSessionCompanionState(session) {
  const squirtle = session?.actTwoSquirtle;

  return {
    squirtle: {
      recovered: Boolean(squirtle?.recovered),
      visible: Boolean(squirtle?.visible),
      assemblyState: typeof squirtle?.assemblyState === "string" ?
        squirtle.assemblyState :
        "hidden",
      position: cloneFiniteNumberArray(squirtle?.position, 3)
    }
  };
}

function getSavedPlaceables(savePoint) {
  if (isPlainObject(savePoint?.placeables)) {
    return savePoint.placeables;
  }

  if (savePoint?.logChair) {
    return { logChair: savePoint.logChair };
  }

  return null;
}

function restoreSavedGroundCells(session, worldState) {
  const burnedColdIds = new Set(
    Array.isArray(worldState?.burnedColdGroundCellIds) ?
      worldState.burnedColdGroundCellIds.filter((id) => typeof id === "string") :
      []
  );
  const purifiedIds = new Set(
    Array.isArray(worldState?.purifiedGroundCellIds) ?
      worldState.purifiedGroundCellIds.filter((id) => typeof id === "string") :
      []
  );
  if (
    (!burnedColdIds.size && !purifiedIds.size) ||
    !Array.isArray(session?.groundDeadInstances)
  ) {
    return;
  }
  if (!Array.isArray(session.groundPurifiedInstances)) {
    session.groundPurifiedInstances = [];
  }
  if (burnedColdIds.size && Array.isArray(session.iceGroundInstances)) {
    const nextIceGroundInstances = [];

    for (const groundCell of session.iceGroundInstances) {
      if (burnedColdIds.has(groundCell?.id)) {
        groundCell.groundKind = "dead";
        groundCell.purifiable = true;
        groundCell.wasColdGroundBurned = true;
        session.groundDeadInstances.push(groundCell);
        continue;
      }

      nextIceGroundInstances.push(groundCell);
    }

    session.iceGroundInstances.length = 0;
    session.iceGroundInstances.push(...nextIceGroundInstances);
  }

  const nextDeadInstances = [];
  const nextPurifiedInstances = session.groundPurifiedInstances
    .filter((groundCell) => purifiedIds.has(groundCell?.id));
  const restoredPurifiedIds = new Set(nextPurifiedInstances.map((groundCell) => groundCell?.id));

  for (const groundCell of session.groundDeadInstances) {
    if (purifiedIds.has(groundCell?.id)) {
      if (!restoredPurifiedIds.has(groundCell.id)) {
        nextPurifiedInstances.push(groundCell);
        restoredPurifiedIds.add(groundCell.id);
      }
      continue;
    }

    nextDeadInstances.push(groundCell);
  }

  session.groundDeadInstances.length = 0;
  session.groundDeadInstances.push(...nextDeadInstances);
  session.groundPurifiedInstances.length = 0;
  session.groundPurifiedInstances.push(...nextPurifiedInstances);
  syncPurifiedGroundVariantInstances(session.groundPurifiedInstances);
}

function restoreSavedPatchStates(patches, savedPatches) {
  if (!Array.isArray(patches) || !Array.isArray(savedPatches)) {
    return;
  }

  const existingByCellId = new Map(
    patches
      .filter((patch) => typeof patch?.cellId === "string")
      .map((patch) => [patch.cellId, patch])
  );

  for (const savedPatch of savedPatches) {
    const restoredPatch = cloneSavedPatch(savedPatch);
    if (!restoredPatch || restoredPatch.state !== "alive") {
      continue;
    }

    const existingPatch = existingByCellId.get(restoredPatch.cellId);
    if (existingPatch) {
      existingPatch.state = "alive";
      if (restoredPatch.habitatGroupId) {
        existingPatch.habitatGroupId = restoredPatch.habitatGroupId;
      }
      continue;
    }

    patches.push(restoredPatch);
    existingByCellId.set(restoredPatch.cellId, restoredPatch);
  }
}

export function restoreSavedWorldState(session, savePoint) {
  if (!session || !isPlainObject(savePoint?.worldState)) {
    return;
  }

  restoreSavedGroundCells(session, savePoint.worldState);
  restoreSavedPatchStates(session.groundGrassPatches, savePoint.worldState.aliveGroundGrassPatches);
  restoreSavedPatchStates(session.groundFlowerPatches, savePoint.worldState.aliveGroundFlowerPatches);
}

function isSavedQuestCompleted(savePoint, questId) {
  const questState = savePoint?.questState;
  return Boolean(
    questState?.completedQuestIds?.includes?.(questId) ||
    questState?.quests?.[questId]?.status === "completed"
  );
}

function applySavedStoryState(storyState, savedStoryState) {
  if (!isPlainObject(savedStoryState)) {
    return;
  }

  const questIndex = Number(savedStoryState.questIndex);
  if (Number.isFinite(questIndex)) {
    storyState.questIndex = Math.max(0, Math.floor(questIndex));
  }

  if (isPlainObject(savedStoryState.flags)) {
    Object.assign(storyState.flags, savedStoryState.flags);
  }
}

function applySavedInventory(inventory, savedInventory) {
  if (!isPlainObject(savedInventory)) {
    return;
  }

  for (const [itemId, amount] of Object.entries(savedInventory)) {
    if (!Object.prototype.hasOwnProperty.call(inventory, itemId)) {
      continue;
    }

    const numericAmount = Number(amount);
    if (Number.isFinite(numericAmount)) {
      inventory[itemId] = Math.max(0, Math.floor(numericAmount));
    }
  }
}

function applySavedPlayerSkills(playerSkills, savePoint, inventory) {
  const savedSkills = isPlainObject(savePoint?.playerSkills) ? savePoint.playerSkills : {};

  for (const skillId of Object.keys(playerSkills)) {
    playerSkills[skillId] = Boolean(savedSkills[skillId]);
  }

  if (
    Number(inventory?.[WATER_GUN_POWER_ITEM_ID] || 0) > 0 ||
    isSavedQuestCompleted(savePoint, "open-the-water-route")
  ) {
    playerSkills.waterGun = true;
  }

  if (
    savePoint?.questState?.unlocked?.includes?.("leafage") ||
    isSavedQuestCompleted(savePoint, "inspect-rustling-grass") ||
    savePoint?.storyState?.flags?.bulbasaurDryGrassRequestTurnedIn
  ) {
    playerSkills.leafage = true;
  }

  if (
    savedSkills.fire ||
    savePoint?.questState?.unlocked?.includes?.("fire") ||
    savePoint?.storyState?.flags?.charmanderRevealed
  ) {
    playerSkills.fire = true;
  }

  if (
    savedSkills.buildBlock ||
    savePoint?.questState?.unlocked?.includes?.("buildBlock") ||
    savePoint?.storyState?.flags?.timburrRevealed
  ) {
    playerSkills.buildBlock = true;
  }
}

function getSavedActiveFieldMoveId(savePoint, playerSkills) {
  const savedMoveId = savePoint?.activeFieldMoveId;
  if (ACTIVE_FIELD_MOVE_ORDER.includes(savedMoveId) && playerSkills[savedMoveId]) {
    return savedMoveId;
  }

  return ACTIVE_FIELD_MOVE_ORDER.find((skillId) => playerSkills[skillId]) || null;
}

export function applyManualSaveState(savePoint, {
  storyState,
  inventory,
  playerSkills,
  playerMemory
}) {
  if (!savePoint) {
    return null;
  }

  applySavedStoryState(storyState, savePoint.storyState);
  applySavedInventory(inventory, savePoint.inventory);
  applySavedPlayerSkills(playerSkills, savePoint, inventory);
  applySavedPlayerProfile(playerMemory, savePoint.playerProfile);
  return getSavedActiveFieldMoveId(savePoint, playerSkills);
}

function isSquirtleRecoveredInSavePoint(savePoint) {
  const savedSquirtle = savePoint?.companions?.squirtle;

  return Boolean(
    savedSquirtle?.recovered ||
    savedSquirtle?.assemblyState === "assembled" ||
    savePoint?.playerSkills?.waterGun ||
    Number(savePoint?.inventory?.[WATER_GUN_POWER_ITEM_ID] || 0) > 0 ||
    isSavedQuestCompleted(savePoint, "open-the-water-route")
  );
}

function restoreSavedSquirtleState(session, savePoint) {
  const squirtle = session?.actTwoSquirtle;

  if (!squirtle || !isSquirtleRecoveredInSavePoint(savePoint)) {
    return;
  }

  const savedPosition = cloneFiniteNumberArray(savePoint?.companions?.squirtle?.position, 3);
  if (savedPosition) {
    squirtle.position = savedPosition;
  }

  squirtle.recovered = true;
  squirtle.visible = true;
  squirtle.assemblyState = "assembled";

  if (squirtle.reassembly) {
    squirtle.reassembly.active = false;
    squirtle.reassembly.elapsed = 0;
    squirtle.reassembly.progress = 0;
    squirtle.reassembly.onComplete = null;
  }

  if (squirtle.modelInstance) {
    squirtle.modelInstance.active = true;
    if (Array.isArray(squirtle.position)) {
      squirtle.modelInstance.offset = [...squirtle.position];
    }
  }

  if (squirtle.repairModuleInstance) {
    squirtle.repairModuleInstance.active = false;
  }
}

export function restoreSavedSessionState(session, savePoint) {
  if (!session || !savePoint) {
    return false;
  }

  const placeables = getSavedPlaceables(savePoint);
  if (placeables) {
    const restoredGreenhouses = cloneSavedPlacementList(placeables.greenhouses);
    const legacyGreenhouse = cloneSavedPlacement(placeables.greenhouse);
    const savedGreenhouses = restoredGreenhouses.length > 0 ?
      restoredGreenhouses :
      (legacyGreenhouse ? [legacyGreenhouse] : []);
    session.logChair = cloneSavedPlacement(placeables.logChair);
    session.greenhouses = savedGreenhouses;
    session.greenhouse = savedGreenhouses[0] || null;
    session.strawBed = cloneSavedPlacement(placeables.strawBed);
    session.campfire = cloneSavedPlacement(placeables.campfire);
    session.leafDen = cloneSavedPlacement(placeables.leafDen);
    session.dittoFlag = cloneSavedPlacement(placeables.dittoFlag);
    session.playerHouses = Array.isArray(placeables.playerHouses) ?
      placeables.playerHouses.map(cloneSavedPlacement).filter(Boolean) :
      [];
    session.leafDenFurniture = Array.isArray(placeables.leafDenFurniture) ?
      placeables.leafDenFurniture.map(cloneSavedPlacement).filter(Boolean) :
      [];
  }

  session.gridPlacement =
    cloneSavedGridPlacement(savePoint.gridPlacement) ||
    createLegacyGridPlacementSaveData(placeables || {});
  session.freeBlockBuildSnapshot = cloneSavedFreeBlockBuild(savePoint.freeBlockBuild);
  session.freeBlockInstances ||= [];
  session.freeBlockInstances.length = 0;
  session.freeBlockBuildState = null;
  session.freeBlockPlacementController = null;
  session.freeBlockPlacementGridSignature = null;

  restoreSavedSquirtleState(session, savePoint);

  const playerPosition = cloneFiniteNumberArray(savePoint.playerPosition, 3);
  if (!playerPosition) {
    return false;
  }

  if (!session.playerCharacter) {
    session.spawnActTwoPlayer?.({
      position: playerPosition,
      preserveCamera: false,
      configureCamera: true
    });
  } else {
    session.playerCharacter.setPosition?.(playerPosition);
    if (session.playerModelInstance) {
      session.playerModelInstance.offset = [...playerPosition];
      session.playerModelInstance.active = true;
    }
  }

  return true;
}
