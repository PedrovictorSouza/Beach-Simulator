import { describe, expect, it } from "vitest";

import {
  createFieldMoveActorPositionRuntime,
  getBulbasaurGrowEmitterPosition,
  getCharmanderMouthPosition,
  getSquirtleMouthPosition,
  getSquirtleWorldPosition
} from "../app/runtime/fieldMoveRuntime/fieldMoveActorPositions.js";

describe("field move actor positions", () => {
  it("resolves Hydro Bot mouth position from actor position and facing yaw", () => {
    const position = getSquirtleMouthPosition({
      squirtle: {
        position: [1, 0.2, 2]
      },
      yaw: Math.PI * 0.5
    });

    expect(position[0]).toBeCloseTo(1.34);
    expect(position[1]).toBeCloseTo(0.86);
    expect(position[2]).toBeCloseTo(2);
  });

  it("resolves Thermal Bot mouth position from model offset fallback", () => {
    expect(getCharmanderMouthPosition({
      charmander: {
        modelInstance: {
          offset: [3, 0.1, 4]
        }
      },
      yaw: 0
    })).toEqual([
      3,
      0.6799999999999999,
      4.28
    ]);
  });

  it("uses origin fallback for Grow Bot emitter when actor position is unresolved", () => {
    expect(getBulbasaurGrowEmitterPosition({
      bulbasaur: null,
      yaw: 0
    })).toEqual([
      0,
      0.72,
      0.3
    ]);
  });

  it("resolves world position from actor position and returns null when missing", () => {
    expect(getSquirtleWorldPosition({
      squirtle: {
        position: [1, 0.04, 2],
        modelInstance: {
          offset: [9, 0.04, 9]
        }
      }
    })).toEqual([1, 0.04, 2]);

    expect(getSquirtleWorldPosition()).toBeNull();
  });

  it("creates a runtime that injects actor sources and logical yaws", () => {
    const runtime = createFieldMoveActorPositionRuntime({
      getSquirtle: () => ({
        position: [1, 0.2, 2]
      }),
      getCharmander: () => ({
        modelInstance: {
          offset: [3, 0.1, 4]
        }
      }),
      getBulbasaur: () => null,
      getSquirtleYaw: () => Math.PI * 0.5,
      getCharmanderYaw: () => 0,
      getBulbasaurYaw: () => 0
    });

    const squirtleMouth = runtime.getSquirtleMouthPosition();
    expect(squirtleMouth[0]).toBeCloseTo(1.34);
    expect(squirtleMouth[1]).toBeCloseTo(0.86);
    expect(squirtleMouth[2]).toBeCloseTo(2);
    expect(runtime.getCharmanderWorldPosition()).toEqual([3, 0.1, 4]);
    expect(runtime.getBulbasaurGrowEmitterPosition()).toEqual([0, 0.72, 0.3]);
  });
});
