import { describe, expect, it, vi } from "vitest";

import {
  createCompanionFollowMovementRuntime
} from "../app/runtime/companions/companionFollowMovementRuntime.js";

describe("createCompanionFollowMovementRuntime", () => {
  it("resolves the follow target behind the player", () => {
    const runtime = createCompanionFollowMovementRuntime({
      getPlayerPosition: () => [10, 0, 20],
      getPlayerYaw: () => Math.PI,
      getFollowDirection: vi.fn(() => [0, 1])
    });

    expect(runtime.getTargetPosition(2)).toEqual([10, 0.04, 18]);
  });

  it("moves a companion toward its follow slot and turns its model", () => {
    const tryMoveCompanionToPosition = vi.fn((companion, nextPosition) => {
      companion.position = nextPosition;
      return true;
    });
    const getModelYawToward = vi.fn(() => 1.25);
    const runtime = createCompanionFollowMovementRuntime({
      getPlayerPosition: () => [2, 0, 0],
      getPlayerYaw: () => 0,
      getFollowDirection: () => [0, 1],
      tryMoveCompanionToPosition,
      getModelYawToward,
      arriveDistance: 0.1
    });
    const companion = {
      position: [0, 0.04, 0],
      patrol: { active: true },
      modelInstance: {
        yaw: 0
      }
    };

    expect(runtime.moveTowardPlayer(companion, {
      deltaTime: 0.5,
      speed: 2,
      followDistance: 0,
      modelFaceYawOffset: Math.PI
    })).toBe(true);

    expect(companion.patrol).toBeNull();
    expect(tryMoveCompanionToPosition).toHaveBeenCalledWith(companion, [1, 0.04, 0]);
    expect(getModelYawToward).toHaveBeenCalledWith([0, 0.04, 0], [1, 0.04, 0], Math.PI);
    expect(companion.modelInstance.yaw).toBe(1.25);
  });

  it("does not move without a player or companion position", () => {
    const tryMoveCompanionToPosition = vi.fn();
    const runtime = createCompanionFollowMovementRuntime({
      getPlayerPosition: () => null,
      tryMoveCompanionToPosition
    });

    expect(runtime.moveTowardPlayer({ position: [0, 0, 0] }, {
      deltaTime: 1,
      speed: 1,
      followDistance: 1
    })).toBe(false);
    expect(runtime.moveTowardPlayer({}, {
      deltaTime: 1,
      speed: 1,
      followDistance: 1
    })).toBe(false);
    expect(tryMoveCompanionToPosition).not.toHaveBeenCalled();
  });
});
