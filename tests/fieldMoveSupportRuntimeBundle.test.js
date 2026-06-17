import { describe, expect, it, vi } from "vitest";

import {
  createFieldMoveSupportRuntimeBundle
} from "../app/runtime/fieldMoveRuntime/fieldMoveSupportRuntimeBundle.js";

describe("createFieldMoveSupportRuntimeBundle", () => {
  it("wires field-move prompts, actor positions and approach positions", () => {
    const isBlocked = vi.fn((position) => position[2] > 0);
    const bundle = createFieldMoveSupportRuntimeBundle({
      session: {
        actTwoSquirtle: {
          position: [1, 0.2, 2]
        },
        bulbasaurEncounter: {
          position: [0, 0.04, 0]
        },
        charmanderEncounter: {
          modelInstance: {
            offset: [3, 0.1, 4]
          }
        },
        timburrEncounter: {
          position: [0, 0.04, 2]
        }
      },
      companionFacingRuntime: {
        getBulbasaurLogicalFacingYaw: () => 0,
        getCharmanderLogicalFacingYaw: () => 0,
        getSquirtleLogicalFacingYaw: () => Math.PI * 0.5
      },
      companionConstructionBlockerRuntime: {
        isBlocked
      }
    });

    const squirtleMouth = bundle.fieldMoveActorPositionRuntime.getSquirtleMouthPosition();
    expect(squirtleMouth[0]).toBeCloseTo(1.34);
    expect(squirtleMouth[1]).toBeCloseTo(0.86);
    expect(squirtleMouth[2]).toBeCloseTo(2);
    expect(bundle.fieldMoveActorPositionRuntime.getCharmanderWorldPosition())
      .toEqual([3, 0.1, 4]);

    expect(
      bundle.fieldMoveApproachPositionRuntime.getBulbasaurLeafageApproachPosition(
        [0, 0, 0],
        [3, 0.04, 0]
      )
    ).toEqual([1.04, 0.04, 0]);
    expect(bundle.fieldMoveApproachPositionRuntime.getTimburrBuildBlockApproachPosition(
      [0, 0, 0]
    )).toEqual([-1.04, 0.04, 0]);
    expect(isBlocked).toHaveBeenCalled();

    bundle.fieldMoveInvalidTargetPromptRuntime.triggerLeafage(100);
    bundle.fieldMoveInvalidTargetPromptRuntime.triggerFire(200);
    expect(bundle.fieldMoveInvalidTargetPromptRuntime.isLeafageVisible(1699)).toBe(true);
    expect(bundle.fieldMoveInvalidTargetPromptRuntime.isLeafageVisible(1700)).toBe(false);
    expect(bundle.fieldMoveInvalidTargetPromptRuntime.isFireVisible(1799)).toBe(true);
    expect(bundle.fieldMoveInvalidTargetPromptRuntime.isFireVisible(1800)).toBe(false);
  });
});
