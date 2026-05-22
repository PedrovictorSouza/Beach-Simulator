import { describe, expect, it } from "vitest";
import {
  buildGreenhouseFootprintGroundPositions,
  restoreGreenhouseFootprintGround
} from "../app/bootstrap/createApplicationRuntime.js";

function createGroundCell(position, index) {
  return {
    id: `ground-${index}`,
    offset: [...position],
    tileSpan: 1.425,
    active: true
  };
}

describe("Greenhouse footprint ground", () => {
  it("restores every ground cell covered by the 5x3 Greenhouse footprint", () => {
    const preview = {
      snappedPosition: [0, 0.02, 0],
      gridStep: 1.425,
      yaw: 0
    };
    const groundDeadInstances = buildGreenhouseFootprintGroundPositions(preview).map((footprintCell, index) => {
      return createGroundCell(footprintCell.position, index);
    });
    const groundPurifiedInstances = [];

    const restoredCount = restoreGreenhouseFootprintGround({
      preview,
      groundDeadInstances,
      groundPurifiedInstances
    });

    expect(restoredCount).toBe(15);
    expect(groundDeadInstances).toHaveLength(0);
    expect(groundPurifiedInstances).toHaveLength(15);
    expect(groundPurifiedInstances.map((groundCell) => groundCell.id)).toEqual(
      Array.from({ length: 15 }, (_, index) => `ground-${index}`)
    );
  });

  it("rotates the Greenhouse footprint before restoring ground", () => {
    const positions = buildGreenhouseFootprintGroundPositions({
      snappedPosition: [0, 0.02, 0],
      gridStep: 1,
      yaw: Math.PI * 0.5
    });

    const uniqueX = new Set(positions.map((footprintCell) => footprintCell.position[0]));
    const uniqueZ = new Set(positions.map((footprintCell) => footprintCell.position[2]));

    expect(positions).toHaveLength(15);
    expect(uniqueX.size).toBe(3);
    expect(uniqueZ.size).toBe(5);
  });
});
