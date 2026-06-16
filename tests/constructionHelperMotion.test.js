import { describe, expect, it, vi } from "vitest";

import {
  createConstructionHelperMotionRuntime,
  moveConstructionHelperToLeafDen
} from "../app/runtime/construction/constructionHelperMotion.js";

describe("construction helper motion", () => {
  it("moves a helper around the Leaf Den construction anchor", () => {
    const getYawToward = vi.fn(() => 1.25);
    const encounter = {
      visible: false,
      position: [0, 0, 0],
      modelInstance: {
        scale: 1,
        yaw: 0
      }
    };

    const moved = moveConstructionHelperToLeafDen({
      encounter,
      leafDenPosition: [4, 0.02, 6],
      offset: [1, 0, -0.5],
      modelFaceYawOffset: Math.PI,
      nowSeconds: 0,
      getYawToward
    });

    expect(moved).toBe(true);
    expect(encounter.visible).toBe(true);
    expect(encounter.position[0]).toBeCloseTo(4.9616);
    expect(encounter.position[1]).toBe(0.04);
    expect(encounter.position[2]).toBeCloseTo(5.5324);
    expect(getYawToward).toHaveBeenCalledWith(
      encounter.position,
      [4, 0.02, 6],
      Math.PI
    );
    expect(encounter.modelInstance.yaw).toBe(1.25);
    expect(encounter.modelInstance.scale).toBeCloseTo(1.0273);
  });

  it("creates a runtime that injects Leaf Den position, clock and yaw callback", () => {
    const getLeafDenPosition = vi.fn(() => [4, 0.02, 6]);
    const getNowSeconds = vi.fn(() => 0);
    const getYawToward = vi.fn(() => 1.25);
    const runtime = createConstructionHelperMotionRuntime({
      getLeafDenPosition,
      getNowSeconds,
      getYawToward
    });
    const encounter = {
      visible: false,
      position: [0, 0, 0],
      modelInstance: {
        scale: 1,
        yaw: 0
      }
    };

    const moved = runtime.moveToLeafDen(encounter, {
      offset: [1, 0, -0.5],
      modelFaceYawOffset: Math.PI
    });

    expect(moved).toBe(true);
    expect(getLeafDenPosition).toHaveBeenCalled();
    expect(getNowSeconds).toHaveBeenCalled();
    expect(encounter.position[0]).toBeCloseTo(4.9616);
    expect(encounter.position[2]).toBeCloseTo(5.5324);
    expect(getYawToward).toHaveBeenCalledWith(
      encounter.position,
      [4, 0.02, 6],
      Math.PI
    );
  });

  it("does not move without an encounter or Leaf Den position", () => {
    expect(moveConstructionHelperToLeafDen({
      encounter: null,
      leafDenPosition: [4, 0.02, 6]
    })).toBe(false);

    const encounter = {
      visible: false
    };

    expect(moveConstructionHelperToLeafDen({
      encounter,
      leafDenPosition: null
    })).toBe(false);
    expect(encounter.visible).toBe(false);
  });

  it("clamps model scale to the existing minimum", () => {
    const encounter = {
      modelInstance: {
        scale: 0.01
      }
    };

    moveConstructionHelperToLeafDen({
      encounter,
      leafDenPosition: [0, 0, 0],
      offset: [-2, 0, 0],
      nowSeconds: 0
    });

    expect(encounter.modelInstance.scale).toBe(0.1);
  });
});
