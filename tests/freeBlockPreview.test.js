import { describe, expect, it } from "vitest";

import {
  buildFreeBlockPreviewDebug,
  syncFreeBlockPreviewInstance
} from "../app/runtime/construction/freeBlockPreview.js";

describe("free block preview", () => {
  it("clears the preview when inactive or missing player position", () => {
    const instance = { active: true };

    expect(syncFreeBlockPreviewInstance({
      instance,
      active: false,
      playerPosition: [0, 0, 0],
      target: {
        targetCell: { x: 1, y: 2 },
        targetPosition: [1, 0.03, 2]
      }
    })).toBeNull();
    expect(instance.active).toBe(false);

    instance.active = true;
    expect(syncFreeBlockPreviewInstance({
      instance,
      active: true,
      playerPosition: null,
      target: {
        targetCell: { x: 1, y: 2 },
        targetPosition: [1, 0.03, 2]
      }
    })).toBeNull();
    expect(instance.active).toBe(false);
  });

  it("clears the preview when the target cannot be rendered", () => {
    const instance = { active: true };

    expect(syncFreeBlockPreviewInstance({
      instance,
      active: true,
      playerPosition: [0, 0, 0],
      target: {
        targetCell: { x: 1, y: 2 },
        targetPosition: null
      }
    })).toBeNull();
    expect(instance.active).toBe(false);
  });

  it("syncs a valid preview instance without changing target shape", () => {
    const instance = {};
    const target = {
      targetCell: { x: 1, y: 2 },
      targetPosition: [4, 0.03, 5],
      valid: true,
      reason: null
    };

    expect(syncFreeBlockPreviewInstance({
      instance,
      active: true,
      playerPosition: [0, 0, 0],
      target,
      cellSize: 1.5,
      nowSeconds: 0
    })).toBe(target);
    expect(instance).toMatchObject({
      active: true,
      offset: [4, 0.03, 5],
      scale: 1.5,
      yaw: 0,
      pitch: 0,
      roll: 0,
      tint: [0.36, 1.35, 0.46],
      freeBlockCell: { x: 1, y: 2 },
      freeBlockPreviewValid: true,
      freeBlockPreviewReason: null
    });
    expect(instance.alpha).toBeCloseTo(0.64);
    expect(instance.tintStrength).toBeCloseTo(0.4);
  });

  it("syncs an invalid preview with invalid visual feedback", () => {
    const instance = {};
    const target = {
      targetCell: { x: 1, y: 2 },
      targetPosition: [4, 0.03, 5],
      valid: false,
      reason: "blocked-cell"
    };

    expect(syncFreeBlockPreviewInstance({
      instance,
      active: true,
      playerPosition: [0, 0, 0],
      target,
      cellSize: 1,
      nowSeconds: 0
    })).toBe(target);
    expect(instance.tint).toEqual([1.8, 0.32, 0.28]);
    expect(instance.alpha).toBeCloseTo(0.46);
    expect(instance.tintStrength).toBeCloseTo(0.58);
    expect(instance.freeBlockPreviewValid).toBe(false);
    expect(instance.freeBlockPreviewReason).toBe("blocked-cell");
  });

  it("builds the Build Block preview debug payload", () => {
    const gridSystem = {
      worldToCell({ x, z }) {
        return {
          x: Math.floor(x),
          y: Math.floor(z)
        };
      }
    };

    expect(buildFreeBlockPreviewDebug({
      rawTargetCell: { x: 1, y: 2 },
      targetCell: { x: 3, y: 4 },
      playerPosition: [2.2, 0, 5.8],
      targetPosition: [3.5, 0.03, 4.5],
      validation: {
        reason: "duplicate-block"
      },
      previewValidity: {
        valid: false,
        reason: "duplicate-block",
        blockedByConstruction: true
      },
      blockingColliderIds: ["greenhouse-0"],
      rawTargetBlock: { blockType: "wall" },
      targetBlock: null,
      wood: 6,
      gridSystem
    })).toEqual({
      rawTargetCell: { x: 1, y: 2 },
      targetCell: { x: 3, y: 4 },
      playerCell: { x: 2, y: 5 },
      targetPosition: [3.5, 0.03, 4.5],
      valid: false,
      reason: "duplicate-block",
      validationReason: "duplicate-block",
      blockedByConstruction: true,
      blockingColliderIds: ["greenhouse-0"],
      rawTargetBlockType: "wall",
      targetBlockType: null,
      wood: 6
    });
  });
});
