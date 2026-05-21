import { describe, expect, it } from "vitest";
import { getWorkbenchInteractionParticleBillboards } from "../app/runtime/gameLoop.js";

describe("Workbench runtime feedback", () => {
  it("creates a stable particle marker around the Workbench interaction spot", () => {
    const texture = { id: "spark" };
    const billboards = getWorkbenchInteractionParticleBillboards({
      texture,
      uvRect: [0, 0, 1, 1],
      basePosition: [10, 0.02, -4],
      playerPosition: [10, 0.02, -3],
      now: 1000,
      interactDistance: 5.4
    });

    expect(billboards).toHaveLength(12);
    expect(billboards.every((billboard) => billboard.texture === texture)).toBe(true);
    expect(billboards.every((billboard) => billboard.position[1] > 0.02)).toBe(true);
    expect(billboards.some((billboard) => billboard.position[0] !== 10)).toBe(true);
    expect(billboards.some((billboard) => billboard.position[2] !== -4)).toBe(true);
  });

  it("boosts the marker when the player can open the Workbench", () => {
    const texture = { id: "spark" };
    const far = getWorkbenchInteractionParticleBillboards({
      texture,
      basePosition: [0, 0.02, 0],
      playerPosition: [20, 0.02, 0],
      now: 1000,
      interactDistance: 5.4
    });
    const near = getWorkbenchInteractionParticleBillboards({
      texture,
      basePosition: [0, 0.02, 0],
      playerPosition: [1, 0.02, 0],
      now: 1000,
      interactDistance: 5.4
    });

    expect(near[0].alpha).toBeGreaterThan(far[0].alpha);
    expect(near[0].size[0]).toBeGreaterThan(far[0].size[0]);
  });
});
