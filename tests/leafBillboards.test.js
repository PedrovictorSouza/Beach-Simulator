import { describe, expect, it, vi } from "vitest";

import {
  getLeafDropBillboards,
  getLeafResourceBillboards
} from "../app/runtime/leafBillboards.js";

const itemId = "leaves";
const uvRect = [0, 0, 1, 1];
const size = [0.72, 0.72];
const renderCenter = [0, 0, 0];
const prepareDistance = 10;
const isWithinRenderDistance = (position, center, distance) => (
  Math.abs(position[0] - center[0]) <= distance &&
  Math.abs(position[2] - center[2]) <= distance
);

describe("leaf billboards", () => {
  it("returns empty lists without textures or source arrays", () => {
    expect(getLeafResourceBillboards({
      resourceNodes: [],
      texture: null,
      itemId
    })).toEqual([]);
    expect(getLeafResourceBillboards({
      resourceNodes: null,
      texture: "leaf",
      itemId
    })).toEqual([]);
    expect(getLeafDropBillboards({
      fieldDrops: [],
      texture: null,
      itemId
    })).toEqual([]);
    expect(getLeafDropBillboards({
      fieldDrops: null,
      texture: "leaf",
      itemId
    })).toEqual([]);
  });

  it("creates leaf resource billboards for active matching resources within render distance", () => {
    const storyState = { quest: "active" };
    const activeResource = {
      itemId,
      position: [1, 2, 3],
      active: true
    };
    const inactiveResource = {
      itemId,
      position: [2, 0, 3],
      active: false
    };
    const distantResource = {
      itemId,
      position: [20, 0, 0],
      active: true
    };
    const isResourceNodeActive = vi.fn((resourceNode) => resourceNode.active);

    expect(getLeafResourceBillboards({
      resourceNodes: [
        activeResource,
        inactiveResource,
        distantResource,
        { itemId: "wood", position: [1, 0, 1], active: true }
      ],
      texture: "leaf",
      uvRect,
      storyState,
      renderCenter,
      itemId,
      isResourceNodeActive,
      isWorldPositionWithinRenderDistance: isWithinRenderDistance,
      prepareDistance,
      yOffset: 0.32,
      size
    })).toEqual([
      {
        texture: "leaf",
        position: [1, 2.32, 3],
        size,
        uvRect
      }
    ]);
    expect(isResourceNodeActive).toHaveBeenCalledWith(activeResource, storyState);
  });

  it("creates leaf drop billboards for uncollected matching drops within render distance", () => {
    const fallbackUvRect = [0, 0, 0.5, 0.5];
    const customUvRect = [0.5, 0, 1, 0.5];
    const leafDrop = {
      itemId,
      position: [1, 0, 2],
      size: [0.4, 0.4],
      uvRect: customUvRect
    };
    const fallbackLeafDrop = {
      itemId,
      position: [2, 0, 3],
      size: [0.5, 0.5]
    };

    expect(getLeafDropBillboards({
      fieldDrops: [
        leafDrop,
        fallbackLeafDrop,
        { itemId, position: [1, 0, 1], size: [0.4, 0.4], collected: true },
        { itemId: "wood", position: [1, 0, 1], size: [0.4, 0.4] },
        { itemId, position: [12, 0, 0], size: [0.4, 0.4] }
      ],
      texture: "leaf",
      uvRect: fallbackUvRect,
      renderCenter,
      itemId,
      isWorldPositionWithinRenderDistance: isWithinRenderDistance,
      prepareDistance
    })).toEqual([
      {
        texture: "leaf",
        position: leafDrop.position,
        size: leafDrop.size,
        uvRect: customUvRect
      },
      {
        texture: "leaf",
        position: fallbackLeafDrop.position,
        size: fallbackLeafDrop.size,
        uvRect: fallbackUvRect
      }
    ]);
  });
});
