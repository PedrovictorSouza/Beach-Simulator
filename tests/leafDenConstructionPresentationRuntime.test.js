import { describe, expect, it } from "vitest";

import { createLeafDenConstructionPresentationRuntime } from "../app/runtime/construction/leafDenConstructionPresentationRuntime.js";

function createRuntime(overrides = {}) {
  const storyState = {
    flags: {
      leafDenConstructionStarted: true,
      leafDenBuilt: false,
      leafDenConstructionStartedAt: 1000,
      leafDenConstructionCompletesAt: 3000,
      ...overrides.flags
    }
  };
  const session = {
    leafDen: {
      position: [4, 0.02, 6]
    },
    squirtleWaterStaminaBackTexture: "bar-back",
    charmanderCarbonFillTexture: "bar-fill",
    logChairStarTexture: "star",
    constructionCloudBursts: [
      {
        position: [5, 0.02, 7],
        startedAt: 1000,
        durationMs: 3000
      }
    ],
    cloudAtmosphere: {
      cloudInstances: []
    },
    ...overrides.session
  };
  const runtime = createLeafDenConstructionPresentationRuntime({
    session,
    getStoryState: () => storyState,
    getNowMs: () => 2000
  });

  return {
    runtime,
    session,
    storyState
  };
}

describe("createLeafDenConstructionPresentationRuntime", () => {
  it("resolves Leaf Den construction activity, progress and busy companions", () => {
    const { runtime } = createRuntime();

    expect(runtime.isActive()).toBe(true);
    expect(runtime.getProgress()).toBe(0.5);
    expect(runtime.isBusyCompanionTarget({
      kind: "pokemonCompanion",
      id: "charmander"
    })).toBe(true);
    expect(runtime.isBusyCompanionTarget({
      kind: "pokemonCompanion",
      id: "bulbasaur"
    })).toBe(false);
  });

  it("builds Leaf Den construction billboards from session textures", () => {
    const { runtime } = createRuntime();

    const billboards = runtime.getConstructionBillboards("uv", 1.25);

    expect(billboards[0]).toMatchObject({
      texture: "bar-back",
      position: [4, 2.57, 6],
      uvRect: "uv"
    });
    expect(billboards[1]).toMatchObject({
      texture: "bar-fill",
      uvRect: "uv"
    });
    expect(billboards.some((billboard) => billboard.texture === "star")).toBe(true);
  });

  it("syncs Leaf Den construction clouds and construction cloud burst billboards", () => {
    const { runtime, session } = createRuntime();

    const constructionClouds = runtime.syncConstructionClouds(1.25);
    const burstClouds = runtime.syncCloudBurstEffects(1.25);
    const burstBillboards = runtime.getCloudBurstBillboards("uv", 1.25);

    expect(constructionClouds.some((instance) => instance.active)).toBe(true);
    expect(burstClouds.some((instance) => instance.active)).toBe(true);
    expect(session.cloudAtmosphere.cloudInstances.length).toBeGreaterThan(0);
    expect(burstBillboards.length).toBeGreaterThan(0);
    expect(burstBillboards.every((billboard) => billboard.texture === "star")).toBe(true);
  });

  it("returns no construction billboards while inactive", () => {
    const { runtime } = createRuntime({
      flags: {
        leafDenBuilt: true
      }
    });

    expect(runtime.isActive()).toBe(false);
    expect(runtime.getConstructionBillboards("uv", 1.25)).toEqual([]);
  });
});
