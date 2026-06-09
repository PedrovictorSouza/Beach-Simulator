import { describe, expect, it, vi } from "vitest";

import {
  getSolarStationPlacementBlockers,
  isSolarStationPlacementBlocked
} from "../app/runtime/construction/solarStationPlacementBlockers.js";

describe("solar station placement blockers", () => {
  it("combines player construction blockers and world object blockers", () => {
    const createPlayerConstructionPlacementBlockers = vi.fn(() => [
      {
        position: [1, 0, 1],
        size: [1, 1]
      }
    ]);
    const getWorldObjectPlacementBlockers = vi.fn(() => [
      {
        position: [2, 0, 2],
        size: [1, 1]
      }
    ]);

    expect(getSolarStationPlacementBlockers({
      session: {},
      storyState: {},
      footprints: {
        solarStation: [2.2, 2.2]
      },
      createPlayerConstructionPlacementBlockers,
      getWorldObjectPlacementBlockers,
      getPlacementCollisionSize: () => [1, 1]
    })).toEqual([
      {
        position: [1, 0, 1],
        size: [1, 1]
      },
      {
        position: [2, 0, 2],
        size: [1, 1]
      }
    ]);
    expect(createPlayerConstructionPlacementBlockers).toHaveBeenCalledWith({
      session: {},
      storyState: {},
      footprints: {
        solarStation: [2.2, 2.2]
      }
    });
    expect(getWorldObjectPlacementBlockers).toHaveBeenCalledWith({});
  });

  it("adds optional placed object blockers from story flags", () => {
    const blockers = getSolarStationPlacementBlockers({
      session: {
        logChair: {
          position: [1, 0, 1],
          size: [1, 1]
        },
        dittoFlag: {
          position: [2, 0, 2],
          size: [0.5, 0.5]
        },
        challengeBoulder: {
          position: [3, 0, 3]
        },
        leafDenFurniture: [
          {
            position: [4, 0, 4],
            size: [0.75, 0.75]
          },
          {
            position: null
          }
        ]
      },
      storyState: {
        flags: {
          logChairPlaced: true,
          dittoFlagPlacedOnHouse: true,
          boulderChallengeAvailable: true,
          leafDenInteriorEntered: true
        }
      },
      createPlayerConstructionPlacementBlockers: () => [],
      getWorldObjectPlacementBlockers: () => [],
      getPlacementCollisionSize: (placement, fallbackSize = [1, 1]) => {
        return placement?.size || fallbackSize;
      }
    });

    expect(blockers).toEqual([
      {
        position: [1, 0, 1],
        size: [1, 1]
      },
      {
        position: [2, 0, 2],
        size: [0.5, 0.5]
      },
      {
        position: [3, 0, 3],
        size: [1.82, 1.42]
      },
      {
        position: [4, 0, 4],
        size: [0.75, 0.75]
      }
    ]);
  });

  it("detects blocker overlap against the proposed Solar Station rect", () => {
    const placementRect = {
      minX: -1,
      maxX: 1,
      minZ: -1,
      maxZ: 1
    };

    expect(isSolarStationPlacementBlocked({
      session: {},
      storyState: {},
      placementRect,
      getSolarStationPlacementBlockers: () => [
        {
          position: [0.5, 0, 0.5],
          size: [1, 1]
        }
      ],
      getPlacementRect: (position, size) => ({
        minX: position[0] - size[0] * 0.5,
        maxX: position[0] + size[0] * 0.5,
        minZ: position[2] - size[1] * 0.5,
        maxZ: position[2] + size[1] * 0.5
      }),
      doPlacementRectsOverlap: () => true
    })).toBe(true);
  });

  it("detects elevated terrain collider overlap", () => {
    expect(isSolarStationPlacementBlocked({
      session: {
        elevatedTerrainColliders: [
          {
            blocksPlayer: true,
            position: [0, 0, 0],
            size: [1, 1, 1],
            padding: 0.25
          }
        ]
      },
      storyState: {},
      placementRect: {
        minX: -1,
        maxX: 1,
        minZ: -1,
        maxZ: 1
      },
      getSolarStationPlacementBlockers: () => [],
      getPlacementRect: (position, size) => ({
        minX: position[0] - size[0] * 0.5,
        maxX: position[0] + size[0] * 0.5,
        minZ: position[2] - size[1] * 0.5,
        maxZ: position[2] + size[1] * 0.5
      }),
      doPlacementRectsOverlap: () => true
    })).toBe(true);
  });
});
