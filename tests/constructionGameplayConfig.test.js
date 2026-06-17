import { describe, expect, it } from "vitest";

import {
  GAMEPLAY_CONSTRUCTION_CONFIG,
  buildGameplaySolarStationFieldMarkedGroundCells,
  getGameplayRotatedPlacementSize,
  createGameplayConstructionTerrainColliderProvider
} from "../app/runtime/construction/constructionGameplayConfig.js";

describe("GAMEPLAY_CONSTRUCTION_CONFIG", () => {
  it("keeps the gameplay placement footprint defaults", () => {
    expect(GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints).toMatchObject({
      greenhouse: [2.85, 1.7],
      solarStation: [2.2, 2.2],
      trainHouse: [1.7, 1.45],
      houseKit: [1.95, 1.45]
    });
    expect(GAMEPLAY_CONSTRUCTION_CONFIG.gridFootprints).toMatchObject({
      greenhouse: { width: 5, height: 3 },
      solarStation: { width: 4, height: 4 },
      trainHouse: { width: 3, height: 3 },
      leafDenKit: { width: 3, height: 3 }
    });
  });

  it("keeps the gameplay construction tuning defaults", () => {
    expect(GAMEPLAY_CONSTRUCTION_CONFIG.leafDenBuiltRotationFootprint).toEqual([
      3.9,
      2.9
    ]);
    expect(GAMEPLAY_CONSTRUCTION_CONFIG.placementRotationStep).toBeCloseTo(
      Math.PI * 0.5
    );
    expect(
      GAMEPLAY_CONSTRUCTION_CONFIG.leafDenKitSolarStationRadiusMultiplier
    ).toBe(3);
    expect(GAMEPLAY_CONSTRUCTION_CONFIG.solarStationFollowDistance).toBe(2.85);
    expect(GAMEPLAY_CONSTRUCTION_CONFIG.solarStationFieldMarkedTileLimit).toBe(81);
    expect(GAMEPLAY_CONSTRUCTION_CONFIG.solarStationPowerRadiusMarkedTileLimit).toBe(1200);
  });

  it("creates a terrain collider provider from gameplay construction footprints", () => {
    const session = { objects: [] };
    const storyState = { flags: { greenhouseBuilt: true } };
    const createTerrainCollidersCalls = [];
    const terrainColliders = [{ id: "greenhouse-collider" }];
    const getTerrainColliders = createGameplayConstructionTerrainColliderProvider({
      session,
      getStoryState: () => storyState,
      createTerrainColliders: (options) => {
        createTerrainCollidersCalls.push(options);
        return terrainColliders;
      }
    });

    expect(getTerrainColliders()).toBe(terrainColliders);
    expect(createTerrainCollidersCalls).toEqual([
      {
        session,
        storyState,
        footprints: {
          greenhouse: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.greenhouse,
          solarStation: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.solarStation,
          trainHouse: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.trainHouse,
          houseKit: GAMEPLAY_CONSTRUCTION_CONFIG.previewFootprints.houseKit,
          houseBuilt: GAMEPLAY_CONSTRUCTION_CONFIG.leafDenBuiltRotationFootprint
        }
      }
    ]);
  });

  it("applies gameplay construction geometry defaults", () => {
    expect(getGameplayRotatedPlacementSize([2, 3], Math.PI * 0.5))
      .toEqual([3, 2]);

    const markedCells = buildGameplaySolarStationFieldMarkedGroundCells({
      bounds: {
        minX: 0,
        maxX: 20,
        minZ: 0,
        maxZ: 20
      },
      gridStep: 1
    });

    expect(markedCells).toHaveLength(
      GAMEPLAY_CONSTRUCTION_CONFIG.solarStationFieldMarkedTileLimit
    );
  });
});
