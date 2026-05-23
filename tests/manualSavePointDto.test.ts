import { describe, expect, it } from "vitest";
import {
  MANUAL_SAVE_POINT_SCHEMA_VERSION,
  createManualSavePointDto,
  isManualSavePointDto
} from "../app/save/manualSavePointDto.ts";

describe("manualSavePointDto", () => {
  it("creates the versioned manual save payload contract", () => {
    const payload = createManualSavePointDto({
      slotId: "slot-2",
      saveKind: "manual",
      savePointId: "log-chair",
      autosaveEvent: null,
      savedAt: "2026-05-22T09:00:00.000Z",
      storyState: {
        questIndex: 4,
        flags: {
          greenhouseBuilt: true
        }
      },
      inventory: {
        wood: 3
      },
      playerProfile: {
        playerName: "Broky"
      },
      playerSkills: {
        waterGun: true
      },
      activeFieldMoveId: "waterGun",
      settings: {
        audio: {
          music: 0.8
        }
      },
      questState: {
        activeQuestId: "build-greenhouse"
      },
      playerPosition: [1, 0, 2],
      worldState: {
        purifiedGroundCellIds: ["ground-1"]
      },
      companions: {
        squirtle: {
          recovered: true
        }
      },
      placeables: {
        logChair: null,
        greenhouse: null,
        greenhouses: [],
        strawBed: null,
        campfire: null,
        leafDen: null,
        dittoFlag: null,
        playerHouses: [],
        leafDenFurniture: []
      },
      gridPlacement: null,
      freeBlockBuild: {
        schemaVersion: 1,
        buildId: "freeBuild",
        bounds: {
          minX: 0,
          maxX: 255,
          minY: 0,
          maxY: 255
        },
        floorBlocks: [
          { cell: { x: 3, y: 4 } }
        ]
      },
      logChair: null
    });

    expect(payload).toMatchObject({
      version: MANUAL_SAVE_POINT_SCHEMA_VERSION,
      slotId: "slot-2",
      activeFieldMoveId: "waterGun",
      playerPosition: [1, 0, 2],
      freeBlockBuild: {
        floorBlocks: [
          { cell: { x: 3, y: 4 } }
        ]
      }
    });
  });

  it("accepts only the current manual save schema version", () => {
    expect(isManualSavePointDto({ version: MANUAL_SAVE_POINT_SCHEMA_VERSION })).toBe(true);
    expect(isManualSavePointDto({ version: 0 })).toBe(false);
    expect(isManualSavePointDto(null)).toBe(false);
    expect(isManualSavePointDto([])).toBe(false);
  });
});
