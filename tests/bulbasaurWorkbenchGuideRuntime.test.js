import { describe, expect, it, vi } from "vitest";

import {
  createBulbasaurWorkbenchGuideRuntime
} from "../app/runtime/companions/bulbasaurWorkbenchGuideRuntime.js";

const CONFIG = Object.freeze({
  start: [8.55, 0.02, -5.7],
  speed: 2.4,
  waypointDistance: 0.08,
  rampColliderId: "workbench-ramp-collider",
  rampApproachMargin: 0.92,
  sideApproachMargin: 1.22,
  modelFaceYawOffset: 0.4
});

function createRuntime(overrides = {}) {
  const session = {
    bulbasaurEncounter: {},
    elevatedTerrainColliders: [],
    ...overrides.session
  };
  const controls = {
    storyState: {
      flags: {
        ...overrides.flags
      }
    }
  };
  const getYawToward = vi.fn(() => 1.25);
  const runtime = createBulbasaurWorkbenchGuideRuntime({
    session,
    controls,
    workbenchPosition: [10, 0.02, 12],
    getYawToward,
    config: CONFIG,
    ...overrides.runtime
  });

  return {
    controls,
    getYawToward,
    runtime,
    session
  };
}

describe("createBulbasaurWorkbenchGuideRuntime", () => {
  it("is active only while the guide flag is available and recipes are missing", () => {
    expect(createRuntime().runtime.isActive()).toBe(false);

    expect(createRuntime({
      flags: {
        bulbasaurWorkbenchGuideAvailable: true
      }
    }).runtime.isActive()).toBe(true);

    expect(createRuntime({
      flags: {
        bulbasaurWorkbenchGuideAvailable: true,
        workbenchDiyRecipesReceived: true
      }
    }).runtime.isActive()).toBe(false);

    expect(createRuntime({
      session: {
        bulbasaurEncounter: null
      },
      flags: {
        bulbasaurWorkbenchGuideAvailable: true
      }
    }).runtime.isActive()).toBe(false);
  });

  it("uses the workbench position as fallback path when the ramp collider is missing", () => {
    const { runtime } = createRuntime();

    expect(runtime.getPath()).toEqual([[10, 0.02, 12]]);
  });

  it("builds the ramp approach path from the configured collider", () => {
    const { runtime } = createRuntime({
      session: {
        elevatedTerrainColliders: [{
          id: "workbench-ramp-collider",
          position: [6, 0, 8],
          size: [2, 1, 4],
          padding: 0.5
        }]
      }
    });

    const path = runtime.getPath();

    expect(path[0][0]).toBeCloseTo(3.28);
    expect(path[0][1]).toBeCloseTo(0.02);
    expect(path[0][2]).toBeCloseTo(4.58);
    expect(path[1][0]).toBeCloseTo(6);
    expect(path[1][1]).toBeCloseTo(0.02);
    expect(path[1][2]).toBeCloseTo(4.58);
  });

  it("advances Bulbasaur toward the current waypoint and updates yaw", () => {
    const {
      getYawToward,
      runtime
    } = createRuntime({
      session: {
        elevatedTerrainColliders: [{
          id: "workbench-ramp-collider",
          position: [4, 0, 0],
          size: [2, 1, 2],
          padding: 0
        }]
      }
    });
    const encounter = {
      position: [0, 0.02, 0],
      jumpTimer: 1,
      originPosition: [1, 0.02, 1],
      landingPosition: [2, 0.02, 2],
      modelInstance: {
        yaw: 0
      }
    };

    runtime.advance(0.5, encounter);

    expect(encounter.visible).toBe(true);
    expect(encounter.jumpTimer).toBe(0);
    expect(encounter.originPosition).toBeNull();
    expect(encounter.landingPosition).toBeNull();
    expect(encounter.workbenchGuideWaypointIndex).toBe(0);
    expect(encounter.position[0]).toBeCloseTo(0.816);
    expect(encounter.position[1]).toBeCloseTo(0.02);
    expect(encounter.position[2]).toBeCloseTo(-0.88);
    expect(getYawToward).toHaveBeenCalledWith(
      [0, 0.02, 0],
      [1.78, 0.02, -1.92],
      CONFIG.modelFaceYawOffset
    );
    expect(encounter.modelInstance.yaw).toBe(1.25);
  });

  it("snaps to a reached waypoint and advances to the next one", () => {
    const { runtime } = createRuntime({
      session: {
        elevatedTerrainColliders: [{
          id: "workbench-ramp-collider",
          position: [4, 0, 0],
          size: [2, 1, 2],
          padding: 0
        }]
      }
    });
    const encounter = {
      position: [1.76, 0.02, -1.91],
      modelInstance: {}
    };

    runtime.advance(0.5, encounter);

    expect(encounter.position).toEqual([1.78, 0.02, -1.92]);
    expect(encounter.workbenchGuideWaypointIndex).toBe(1);
  });
});
