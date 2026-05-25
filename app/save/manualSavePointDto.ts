import type { FieldAbilityId } from "../gameplay/content/activeFieldMoveState";

export const MANUAL_SAVE_POINT_SCHEMA_VERSION = 1;

export type SaveVector2Dto = [number, number];
export type SaveVector3Dto = [number, number, number];
export type SaveUvRectDto = [number, number, number, number];

export type ManualSaveStoryStateDto = {
  questIndex: number;
  flags: Record<string, unknown>;
};

export type ManualSavePlacementDto = {
  id: string | null;
  kind?: string;
  constructionSiteId?: string;
  buildingKitId?: string;
  constructionName?: string;
  constructionStatus?: string;
  yaw?: number;
  interactionBox?: {
    id: string | null;
    markerKey: string | null;
    offset: SaveVector3Dto;
  };
  position: SaveVector3Dto;
  size: SaveVector2Dto;
  uvRect: SaveUvRectDto;
};

export type ManualSaveGridCellDto = {
  x: number;
  y: number;
};

export type ManualSaveGridPlacementDto = {
  schemaVersion: number;
  gridConfig?: {
    cellSize: number;
    origin: SaveVector3Dto | { x: number; y: number; z: number };
    width: number;
    height: number;
    visualOffsetY?: number;
  };
  placedObjects: Array<{
    placedObjectId: string;
    sourceDatabaseId: string;
    originCell: ManualSaveGridCellDto;
    size: {
      width: number;
      height: number;
    };
    occupiedCells: ManualSaveGridCellDto[];
    legacyKey?: string;
  }>;
};

export type ManualSaveFreeBlockBuildDto = {
  schemaVersion: number;
  buildId: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  floorBlocks: Array<{
    cell: ManualSaveGridCellDto;
  }>;
};

export type ManualSavePointDto = {
  version: typeof MANUAL_SAVE_POINT_SCHEMA_VERSION;
  slotId: string;
  saveKind: string;
  savePointId: string | null;
  autosaveEvent: string | null;
  savedAt: string;
  storyState: ManualSaveStoryStateDto;
  inventory: Record<string, unknown>;
  playerProfile: Record<string, unknown>;
  playerSkills: Record<string, unknown>;
  activeFieldMoveId: FieldAbilityId | null;
  settings: Record<string, Record<string, unknown>>;
  questState: unknown;
  taskState?: unknown;
  playerPosition: SaveVector3Dto | null;
  worldState: Record<string, unknown>;
  companions: Record<string, unknown>;
  placeables: {
    logChair: ManualSavePlacementDto | null;
    greenhouse: ManualSavePlacementDto | null;
    greenhouses: ManualSavePlacementDto[];
    strawBed: ManualSavePlacementDto | null;
    campfire: ManualSavePlacementDto | null;
    leafDen: ManualSavePlacementDto | null;
    dittoFlag: ManualSavePlacementDto | null;
    playerHouses: ManualSavePlacementDto[];
    leafDenFurniture: ManualSavePlacementDto[];
  };
  gridPlacement: ManualSaveGridPlacementDto | null;
  freeBlockBuild: ManualSaveFreeBlockBuildDto | null;
  logChair: ManualSavePlacementDto | null;
};

export type ManualSavePointDtoInput = Omit<ManualSavePointDto, "version">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function createManualSavePointDto(input: ManualSavePointDtoInput): ManualSavePointDto {
  return {
    version: MANUAL_SAVE_POINT_SCHEMA_VERSION,
    ...input
  };
}

export function isManualSavePointDto(value: unknown): value is ManualSavePointDto {
  return (
    isRecord(value) &&
    value.version === MANUAL_SAVE_POINT_SCHEMA_VERSION
  );
}
