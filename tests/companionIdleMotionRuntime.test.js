import { describe, expect, it, vi } from "vitest";

import {
  createCompanionIdleMotionRuntime
} from "../app/runtime/companions/companionIdleMotionRuntime.js";

function createRuntime(overrides = {}) {
  return createCompanionIdleMotionRuntime({
    getPlayerPosition: () => [0, 0, 2],
    getModelYawToward: vi.fn(() => 1.5),
    attentionDistance: 4.8,
    patrolSpeed: 1,
    patrolPauseDuration: 0.75,
    patrolArriveDistance: 0.08,
    ...overrides
  });
}

describe("createCompanionIdleMotionRuntime", () => {
  it("faces an idle bot toward a nearby player", () => {
    const runtime = createRuntime();
    const robot = {
      position: [0, 0.04, 0],
      modelInstance: {
        yaw: 0
      }
    };

    expect(runtime.faceTowardPlayer(robot, { modelFaceYawOffset: Math.PI })).toBe(true);
    expect(robot.modelInstance.yaw).toBeCloseTo(Math.PI);
  });

  it("creates a paused patrol state around the current position", () => {
    const runtime = createRuntime();
    const robot = {
      position: [1, 0.04, 2],
      modelInstance: {
        yaw: 0
      }
    };

    runtime.updatePatrol(robot, {
      deltaTime: 0.25,
      radius: 2,
      modelFaceYawOffset: 0
    });

    expect(robot.patrol).toEqual(expect.objectContaining({
      origin: [1, 0.04, 2],
      waypointIndex: 0,
      pauseTimer: 0.5
    }));
    expect(robot.position).toEqual([1, 0.04, 2]);
  });

  it("moves a patrol bot toward its current waypoint and updates yaw", () => {
    const getModelYawToward = vi.fn(() => 2.25);
    const runtime = createRuntime({ getModelYawToward });
    const robot = {
      position: [0, 0.04, 0],
      patrol: {
        origin: [0, 0.04, 0],
        waypointIndex: 0,
        pauseTimer: 0,
        points: [[2, 0.04, 0]]
      },
      modelInstance: {
        yaw: 0
      }
    };

    runtime.updatePatrol(robot, {
      deltaTime: 0.5,
      radius: 2,
      modelFaceYawOffset: Math.PI
    });

    expect(robot.position).toEqual([0.5, 0.04, 0]);
    expect(getModelYawToward).toHaveBeenCalledWith([0.5, 0.04, 0], [2, 0.04, 0], Math.PI);
    expect(robot.modelInstance.yaw).toBe(2.25);
  });
});
