import { describe, expect, it } from "vitest";

import {
  ensureConstructionCloudBurstInstances,
  ensureLeafDenConstructionCloudInstances,
  getActiveConstructionCloudBursts,
  syncConstructionCloudBurstEffects,
  syncLeafDenConstructionClouds
} from "../app/runtime/construction/constructionCloudEffects.js";

describe("construction cloud effects", () => {
  it("creates and registers Leaf Den construction cloud instances once", () => {
    const session = {
      cloudAtmosphere: {
        cloudInstances: []
      }
    };

    const instances = ensureLeafDenConstructionCloudInstances(session);

    expect(instances).toHaveLength(18);
    expect(instances[0]).toEqual({
      id: "leaf-den-construction-cloud-0",
      offset: [0, 0, 0],
      scale: 1,
      yaw: 0,
      pitch: 0,
      roll: 0,
      active: false
    });
    expect(session.cloudAtmosphere.cloudInstances).toEqual(instances);
    expect(ensureLeafDenConstructionCloudInstances(session)).toBe(instances);
    expect(session.cloudAtmosphere.cloudInstances).toHaveLength(18);
  });

  it("resolves active construction cloud bursts, caps them and prunes expired entries", () => {
    const session = {
      constructionCloudBursts: [
        { id: "expired", position: [0, 0, 0], startedAt: 1000, durationMs: 100 },
        { id: "a", position: [1, 0, 0], startedAt: 1000, durationMs: 1000 },
        { id: "b", position: [2, 0, 0], startedAt: 1100, durationMs: 1000 },
        { id: "c", position: [3, 0, 0], startedAt: 1200, durationMs: 1000 },
        { id: "d", position: [4, 0, 0], startedAt: 1300, durationMs: 1000 }
      ]
    };

    const bursts = getActiveConstructionCloudBursts(session, 1500);

    expect(bursts.map((burst) => burst.id)).toEqual(["b", "c", "d"]);
    expect(bursts[0].progress).toBeCloseTo(0.4);
    expect(bursts[2].progress).toBeCloseTo(0.2);
    expect(session.constructionCloudBursts).toEqual([
      { id: "b", position: [2, 0, 0], startedAt: 1100, durationMs: 1000 },
      { id: "c", position: [3, 0, 0], startedAt: 1200, durationMs: 1000 },
      { id: "d", position: [4, 0, 0], startedAt: 1300, durationMs: 1000 }
    ]);
  });

  it("creates and syncs construction cloud burst instances", () => {
    const session = {
      cloudAtmosphere: {
        cloudInstances: []
      },
      constructionCloudBursts: [
        { id: "burst", position: [2, 0.1, 3], startedAt: 1000, durationMs: 1000 }
      ]
    };

    const instances = syncConstructionCloudBurstEffects({
      session,
      nowMs: 1500,
      nowSeconds: 0
    });

    expect(instances).toHaveLength(42);
    expect(session.cloudAtmosphere.cloudInstances).toHaveLength(42);
    expect(instances[0].active).toBe(true);
    expect(instances[0].offset[0]).toBeCloseTo(3.776);
    expect(instances[0].offset[1]).toBeCloseTo(0.42);
    expect(instances[0].offset[2]).toBeCloseTo(3);
    expect(instances[0].scale).toBeCloseTo(0.24);
    expect(instances[0].yaw).toBe(0);
    expect(instances[0].pitch).toBe(0);
    expect(instances[0].roll).toBeCloseTo(0.3);
    expect(ensureConstructionCloudBurstInstances(session)).toBe(instances);
  });

  it("syncs Leaf Den construction cloud poses and clears them when inactive", () => {
    const session = {
      cloudAtmosphere: {
        cloudInstances: []
      }
    };

    const instances = syncLeafDenConstructionClouds({
      session,
      active: true,
      position: [2, 0.1, 3],
      nowSeconds: 0
    });

    expect(instances).toHaveLength(18);
    expect(instances[0].active).toBe(true);
    expect(instances[0].offset).toEqual([3.48, 0.42, 3]);
    expect(instances[0].scale).toBeCloseTo(0.34);
    expect(instances[0].yaw).toBe(0);
    expect(instances[0].pitch).toBe(0);
    expect(instances[0].roll).toBeCloseTo(0.26);

    syncLeafDenConstructionClouds({
      session,
      active: false,
      position: [2, 0.1, 3],
      nowSeconds: 0
    });

    expect(instances.every((instance) => instance.active === false)).toBe(true);
  });
});
