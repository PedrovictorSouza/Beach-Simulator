import { describe, expect, it } from "vitest";

import {
  buildSolarStationPowerRadiusGroundCells,
  createSolarStationPowerRadiusRuntime,
  getSolarStationPowerPosition,
  getSolarStationPowerRadius,
  isInsideSolarStationPowerRadius
} from "../app/runtime/construction/solarStationPowerRadius.js";

describe("solar station power radius", () => {
  it("returns the Solar Station power position only after habitat placement", () => {
    const session = {
      strawBed: {
        position: [4, 0.02, 6]
      }
    };

    expect(getSolarStationPowerPosition(session, {
      flags: {
        strawBedPlacedInBulbasaurHabitat: false
      }
    })).toBeNull();

    expect(getSolarStationPowerPosition(session, {
      flags: {
        strawBedPlacedInBulbasaurHabitat: true
      }
    })).toBe(session.strawBed.position);
  });

  it("uses Solar Station model scale before fallback size for power radius", () => {
    expect(getSolarStationPowerRadius({
      session: {
        strawBedModelInstance: {
          solarStationFinalScale: 2
        },
        strawBed: {
          size: [9, 9]
        }
      },
      radiusMultiplier: 3,
      previewFootprint: [2.2, 2.2],
      getPlacementCollisionSize: () => [9, 9]
    })).toBe(6);
  });

  it("falls back to the placed footprint size for power radius", () => {
    expect(getSolarStationPowerRadius({
      session: {
        strawBed: {
          size: [2.2, 1.4]
        }
      },
      radiusMultiplier: 3,
      previewFootprint: [2.2, 2.2],
      getPlacementCollisionSize: (placement, fallbackSize) => {
        return placement?.size || fallbackSize;
      }
    })).toBe(6.6000000000000005);
  });

  it("builds marked ground cells inside the configured grid radius", () => {
    expect(buildSolarStationPowerRadiusGroundCells({
      center: [0, 0.02, 0],
      radius: 1.1,
      gridConfig: {
        cellSize: 1,
        origin: {
          x: -2,
          z: -2
        },
        width: 5,
        height: 5
      },
      markedTileLimit: 1200
    })).toEqual([
      expect.objectContaining({
        id: "solar-station-power-radius-1-1",
        offset: [-0.5, 0.02, -0.5],
        highlightTargetState: "powerRadius"
      }),
      expect.objectContaining({
        id: "solar-station-power-radius-2-1",
        offset: [0.5, 0.02, -0.5],
        highlightTargetState: "powerRadius"
      }),
      expect.objectContaining({
        id: "solar-station-power-radius-1-2",
        offset: [-0.5, 0.02, 0.5],
        highlightTargetState: "powerRadius"
      }),
      expect.objectContaining({
        id: "solar-station-power-radius-2-2",
        offset: [0.5, 0.02, 0.5],
        highlightTargetState: "powerRadius"
      })
    ]);
  });

  it("checks positions against the placed Solar Station radius", () => {
    const session = {
      strawBed: {
        position: [0, 0.02, 0],
        size: [2, 2]
      }
    };
    const storyState = {
      flags: {
        strawBedPlacedInBulbasaurHabitat: true
      }
    };

    expect(isInsideSolarStationPowerRadius({
      session,
      storyState,
      position: [5.9, 0.02, 0],
      radiusMultiplier: 3,
      previewFootprint: [2, 2],
      getPlacementCollisionSize: (placement, fallbackSize) => placement?.size || fallbackSize
    })).toBe(true);
    expect(isInsideSolarStationPowerRadius({
      session,
      storyState,
      position: [6.1, 0.02, 0],
      radiusMultiplier: 3,
      previewFootprint: [2, 2],
      getPlacementCollisionSize: (placement, fallbackSize) => placement?.size || fallbackSize
    })).toBe(false);
  });

  it("creates a runtime that injects session, story state and config", () => {
    const session = {
      buildGridConfig: {
        cellSize: 1,
        origin: { x: -2, z: -2 },
        width: 5,
        height: 5
      },
      strawBed: {
        position: [0, 0.02, 0],
        size: [2, 2]
      },
      strawBedModelInstance: {
        solarStationFinalScale: 2
      }
    };
    const storyState = {
      flags: {
        strawBedPlacedInBulbasaurHabitat: true
      }
    };
    const preview = {
      snappedPosition: [0, 0.02, 0],
      gridConfig: session.buildGridConfig,
      gridStep: 1
    };
    const runtime = createSolarStationPowerRadiusRuntime({
      session,
      getStoryState: () => storyState,
      radiusMultiplier: 3,
      previewFootprint: [2, 2],
      gridFootprint: { width: 2, height: 2 },
      markedTileLimit: 4,
      getPlacementCollisionSize: (placement, fallbackSize) => placement?.size || fallbackSize,
      getPlacementPreviewFootprintWorldSize: () => [2, 2]
    });

    expect(runtime.getPowerPosition()).toBe(session.strawBed.position);
    expect(runtime.getPowerRadius()).toBe(6);
    expect(runtime.isInsidePowerRadius([5.9, 0.02, 0])).toBe(true);
    expect(runtime.isInsidePowerRadius([6.1, 0.02, 0])).toBe(false);
    expect(runtime.buildPreviewPowerRadiusGroundCells(preview)).toHaveLength(4);
    expect(runtime.buildPlacedPowerRadiusGroundCells()).toHaveLength(4);
  });
});
