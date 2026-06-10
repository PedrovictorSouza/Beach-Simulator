import { describe, expect, it, vi } from "vitest";

import {
  getDestroyableLandscapePatchForInteractOptions
} from "../app/runtime/fieldMoveRuntime/destroyableLandscapePatchTarget.js";

describe("destroyable landscape patch target", () => {
  it("returns null when the nearby target is not a destroy-instantiated-object action", () => {
    const findNearbyDestroyableInstantiatedObject = vi.fn(() => ({
      target: {
        action: "talk",
        id: "grass-a"
      }
    }));

    expect(getDestroyableLandscapePatchForInteractOptions({
      findNearbyDestroyableInstantiatedObject,
      session: {
        groundGrassPatches: [{ id: "grass-a", position: [1, 0, 2] }]
      }
    })).toBeNull();
  });

  it("prefers an exact patch id and clones position and size for effects", () => {
    const patch = {
      id: "flower-a",
      cellId: "shared-cell",
      position: [1, 0.02, 2],
      size: [1.4, 0.8],
      state: "alive"
    };
    const findNearbyDestroyableInstantiatedObject = vi.fn(() => ({
      target: {
        action: "destroyInstantiatedObject",
        id: "flower-a",
        cellId: "shared-cell"
      }
    }));

    const result = getDestroyableLandscapePatchForInteractOptions({
      findNearbyDestroyableInstantiatedObject,
      playerPosition: [0, 0, 0],
      storyState: { flags: {} },
      session: {
        groundGrassPatches: [
          { id: "grass-a", cellId: "shared-cell", position: [9, 0, 9] }
        ],
        groundFlowerPatches: [patch]
      }
    });

    expect(result).toEqual({
      ...patch,
      position: [1, 0.02, 2],
      size: [1.4, 0.8]
    });
    expect(result).not.toBe(patch);
    expect(result.position).not.toBe(patch.position);
    expect(result.size).not.toBe(patch.size);
    expect(findNearbyDestroyableInstantiatedObject).toHaveBeenCalledWith(
      [0, 0, 0],
      expect.any(Array),
      { flags: {} },
      expect.any(Array)
    );
  });

  it("falls back to cell id and the existing default effect size", () => {
    const result = getDestroyableLandscapePatchForInteractOptions({
      findNearbyDestroyableInstantiatedObject: () => ({
        target: {
          action: "destroyInstantiatedObject",
          cellId: "grass-cell"
        }
      }),
      session: {
        groundGrassPatches: [
          {
            id: "grass-a",
            cellId: "grass-cell",
            position: [3, 0.02, 4]
          }
        ],
        groundFlowerPatches: []
      }
    });

    expect(result).toEqual({
      id: "grass-a",
      cellId: "grass-cell",
      position: [3, 0.02, 4],
      size: [1.18, 0.96]
    });
  });
});
