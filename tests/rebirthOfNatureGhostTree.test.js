import { describe, expect, it } from "vitest";

import {
  appendRebirthOfNatureGhostTree,
  getRebirthOfNatureGhostTreeAlpha,
  getRebirthOfNatureGroundCell,
  isRebirthOfNatureMissionActive
} from "../app/runtime/rebirthOfNatureGhostTree.js";

describe("rebirth of nature ghost tree", () => {
  it("requires the Rebirth of Nature mission to be active", () => {
    expect(isRebirthOfNatureMissionActive({
      flags: { bulbasaurDryGrassRequestTurnedIn: true }
    })).toBe(true);
    expect(isRebirthOfNatureMissionActive({
      flags: {
        bulbasaurDryGrassRequestTurnedIn: true,
        rebirthOfNatureComplete: true
      }
    })).toBe(false);
    expect(isRebirthOfNatureMissionActive({ flags: {} })).toBe(false);
  });

  it("prefers the dead mission ground cell before the purified fallback", () => {
    const deadCell = { id: "ground-110-82", offset: [1, 0, 2] };
    const purifiedCell = { id: "ground-110-82", offset: [3, 0, 4] };

    expect(getRebirthOfNatureGroundCell({
      groundDeadInstances: [{ id: "other" }, deadCell],
      groundPurifiedInstances: [purifiedCell]
    })).toBe(deadCell);
    expect(getRebirthOfNatureGroundCell({
      groundDeadInstances: [],
      groundPurifiedInstances: [purifiedCell]
    })).toBe(purifiedCell);
  });

  it("appends the visual ghost tree preview with the existing tuning", () => {
    const session = {
      leafageNativeTreeModel: { size: [2, 1, 2] },
      leafageNativeTreeModelScale: 1.5,
      leafageNativeTreeModelFaceYawOffset: 0.25,
      leafageNativeTreeInstances: [],
      groundDeadInstances: [{
        id: "ground-110-82",
        offset: [8, 0, 9],
        surfaceY: 0.04
      }],
      groundPurifiedInstances: []
    };

    appendRebirthOfNatureGhostTree(
      session,
      { flags: { bulbasaurDryGrassRequestTurnedIn: true } },
      0
    );

    expect(session.leafageNativeTreeInstances).toEqual([{
      id: "rebirth-of-nature-tree-preview",
      offset: [8, 0.06, 9],
      scale: 0.99,
      alpha: 0.25,
      tint: [1, 0.18, 0.72],
      tintStrength: 0.86,
      yaw: 0.25,
      swayStrength: 0
    }]);
  });

  it("skips missing render state without mutating instances", () => {
    const session = {
      leafageNativeTreeModel: null,
      leafageNativeTreeInstances: [],
      groundDeadInstances: [{ id: "ground-110-82", offset: [1, 0, 2] }]
    };

    appendRebirthOfNatureGhostTree(
      session,
      { flags: { bulbasaurDryGrassRequestTurnedIn: true } },
      0
    );

    expect(session.leafageNativeTreeInstances).toEqual([]);
  });

  it("keeps the alpha pulse bounded by the existing maximum", () => {
    expect(getRebirthOfNatureGhostTreeAlpha(0)).toBeCloseTo(0.25);
    expect(getRebirthOfNatureGhostTreeAlpha(Math.PI / (2 * 0.004))).toBeCloseTo(0.5);
  });
});
