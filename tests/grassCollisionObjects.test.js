import { describe, expect, it } from "vitest";

import {
  getGrassCollisionObjects,
  getGrassObjectCollisionAlpha
} from "../app/runtime/presentation/grassCollisionObjects.js";

describe("grass collision presentation helpers", () => {
  it("collects active actor and repair-module collision objects with existing radii", () => {
    const session = {
      playerCharacter: {
        getPosition: () => [1, 0, 2]
      },
      chopperNpcActor: {
        bodyInstance: {
          offset: [3, 0, 4]
        }
      },
      actTwoSquirtle: {
        modelInstance: {
          active: true,
          offset: [5, 0, 6]
        }
      },
      bulbasaurEncounter: {
        visible: true,
        position: [7, 0, 8]
      },
      charmanderEncounter: {
        visible: true,
        position: [9, 0, 10]
      },
      timburrEncounter: {
        visible: true,
        position: [11, 0, 12]
      },
      robotRepairModuleInstances: [
        {
          active: true,
          baseOffset: [13, 0, 14]
        },
        {
          active: false,
          offset: [99, 0, 99]
        }
      ]
    };

    expect(getGrassCollisionObjects({ session })).toEqual([
      { position: [1, 0, 2], radius: 0.52 },
      { position: [3, 0, 4], radius: 0.54 },
      { position: [5, 0, 6], radius: 0.48 },
      { position: [7, 0, 8], radius: 0.66 },
      { position: [9, 0, 10], radius: 0.54 },
      { position: [11, 0, 12], radius: 0.56 },
      { position: [13, 0, 14], radius: 0.62 }
    ]);
  });

  it("ignores invalid and non-finite collision positions", () => {
    const session = {
      playerCharacter: {
        getPosition: () => [NaN, 0, 2]
      },
      chopperNpcActor: {
        bodyInstance: {
          offset: [3, 0]
        }
      },
      robotRepairModuleInstances: [
        {
          active: true,
          offset: [1, 0, Infinity]
        }
      ]
    };

    expect(getGrassCollisionObjects({ session })).toEqual([]);
  });

  it("returns faded alpha when a grass patch overlaps a collision object", () => {
    const grassPatch = {
      position: [0.4, 0, 0],
      size: [1, 1]
    };

    expect(getGrassObjectCollisionAlpha(grassPatch, [
      { position: [0, 0, 0], radius: 0.2 }
    ])).toBe(0.5);
  });

  it("returns opaque alpha without overlap or valid patch position", () => {
    expect(getGrassObjectCollisionAlpha({
      position: [10, 0, 10],
      size: [1, 1]
    }, [
      { position: [0, 0, 0], radius: 0.2 }
    ])).toBe(1);

    expect(getGrassObjectCollisionAlpha({ size: [1, 1] }, [
      { position: [0, 0, 0], radius: 0.2 }
    ])).toBe(1);
  });
});
