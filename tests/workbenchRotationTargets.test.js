import { describe, expect, it } from "vitest";

import {
  getNearestRotatableWorkbenchPlacement,
  getRotatableWorkbenchPlacementCandidates,
  getWorkbenchRotationTargetDistance,
  getWorkbenchRotationTargetSize,
  getWorkbenchRotationTriggerDistance
} from "../app/runtime/construction/workbenchRotationTargets.js";

const footprints = {
  houseBuilt: [3.9, 2.9],
  houseKit: [1.95, 1.45],
  solarStation: [2.2, 2.2],
  trainHouse: [1.7, 1.45]
};

function getPlacementCollisionSize(placement, fallbackSize = [1, 1]) {
  return placement?.size || fallbackSize;
}

describe("workbench rotation targets", () => {
  it("builds candidates from placed Workbench constructions", () => {
    const session = {
      campfire: { position: [3, 0, 0] },
      leafDen: { position: [6, 0, 0] },
      playerHouses: [
        { id: "a", position: [9, 0, 0] },
        { id: "missing-position" }
      ],
      strawBed: { position: [1, 0, 0] }
    };
    const flags = {
      campfireSpatOut: true,
      leafDenBuilt: true,
      strawBedPlacedInBulbasaurHabitat: true
    };

    expect(getRotatableWorkbenchPlacementCandidates({
      session,
      flags,
      footprints,
      thermalCabinLabel: "Thermal Cabin"
    })).toEqual([
      expect.objectContaining({
        kind: "solarStation",
        label: "Solar Station",
        placement: session.strawBed,
        rotateSize: false
      }),
      expect.objectContaining({
        kind: "trainHouse",
        label: "Thermal Cabin",
        placement: session.campfire,
        rotateSize: true
      }),
      expect.objectContaining({
        kind: "house",
        placement: session.leafDen,
        sizeOverride: footprints.houseBuilt
      }),
      expect.objectContaining({
        kind: "playerHouse:a",
        placement: session.playerHouses[0],
        sizeOverride: footprints.houseBuilt
      })
    ]);
  });

  it("resolves target size from override before placement collision size", () => {
    expect(getWorkbenchRotationTargetSize({
      sizeOverride: [4, 2],
      placement: { size: [1, 1] }
    }, {
      getPlacementCollisionSize
    })).toEqual([4, 2]);

    expect(getWorkbenchRotationTargetSize({
      fallbackSize: [2, 3],
      placement: {}
    }, {
      getPlacementCollisionSize
    })).toEqual([2, 3]);
  });

  it("computes edge distance and nearest target inside trigger range", () => {
    const near = {
      kind: "near",
      placement: {
        position: [2, 0, 0],
        size: [2, 2]
      }
    };
    const far = {
      kind: "far",
      placement: {
        position: [9, 0, 0],
        size: [2, 2]
      }
    };
    const getTargetSize = (target) => getWorkbenchRotationTargetSize(target, {
      getPlacementCollisionSize
    });

    expect(getWorkbenchRotationTargetDistance([0, 0, 0], near, {
      getTargetSize
    })).toBe(1);
    expect(getNearestRotatableWorkbenchPlacement({
      candidates: [far, near],
      getTargetDistance: (playerPosition, target) =>
        getWorkbenchRotationTargetDistance(playerPosition, target, { getTargetSize }),
      playerPosition: [0, 0, 0],
      triggerDistance: 3.2
    })).toEqual({
      ...near,
      distance: 1
    });
  });

  it("uses build-grid cell size as the rotation trigger margin when available", () => {
    expect(getWorkbenchRotationTriggerDistance({
      buildGridConfig: { cellSize: 2 },
      rotateDistance: 3.2,
      triggerTileMargin: 1.425
    })).toBe(5.2);

    expect(getWorkbenchRotationTriggerDistance({
      buildGridConfig: { cellSize: 0 },
      rotateDistance: 3.2,
      triggerTileMargin: 1.425
    })).toBe(4.625);
  });
});
