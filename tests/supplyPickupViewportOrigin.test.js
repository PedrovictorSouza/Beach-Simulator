import { describe, expect, it, vi } from "vitest";

import {
  getCanvasCenterViewportOrigin,
  isViewportOriginUsable,
  projectWorldPositionToViewport,
  resolveSupplyPickupViewportOrigin
} from "../app/runtime/supplyPickupViewportOrigin.js";

function createCanvas({
  width = 200,
  height = 100,
  rect = {
    left: 10,
    top: 20,
    width: 400,
    height: 200
  },
  windowSize = {
    innerWidth: 800,
    innerHeight: 600
  }
} = {}) {
  return {
    width,
    height,
    ownerDocument: {
      defaultView: windowSize
    },
    getBoundingClientRect: () => rect
  };
}

describe("supply pickup viewport origin", () => {
  it("projects a world position through the camera and canvas rect", () => {
    const getViewProjection = vi.fn();
    const project = vi.fn(() => ({ x: 50, y: 25, depth: 0.5 }));
    const camera = { getViewProjection, project };
    const worldCanvas = createCanvas();

    expect(projectWorldPositionToViewport({
      position: [1, 2, 3],
      camera,
      worldCanvas
    })).toEqual({ x: 110, y: 70 });
    expect(getViewProjection).toHaveBeenCalledWith(200, 100);
    expect(project).toHaveBeenCalledWith([1, 2.5, 3], 200, 100);
  });

  it("falls back to raw projected coordinates when the canvas rect is unusable", () => {
    expect(projectWorldPositionToViewport({
      position: [0, 0, 0],
      camera: {
        project: () => ({ x: 12, y: 18, depth: 0.2 })
      },
      worldCanvas: createCanvas({
        rect: {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        }
      })
    })).toEqual({ x: 12, y: 18 });
  });

  it("uses the source origin first, then player origin, then canvas center", () => {
    const worldCanvas = createCanvas();
    const project = vi.fn((position) => {
      if (position[0] === 1) {
        return { x: -1000, y: -1000, depth: 0.5 };
      }
      if (position[0] === 4) {
        return { x: 40, y: 20, depth: 0.5 };
      }
      return null;
    });
    const camera = { project };

    expect(resolveSupplyPickupViewportOrigin({
      sourcePosition: [1, 0, 1],
      getPlayerPosition: () => [4, 0, 4],
      camera,
      worldCanvas
    })).toEqual({ x: 90, y: 60 });

    expect(resolveSupplyPickupViewportOrigin({
      sourcePosition: [9, 0, 9],
      getPlayerPosition: () => null,
      camera,
      worldCanvas
    })).toEqual({ x: 210, y: 120 });
  });

  it("resolves usability against viewport bounds with the existing margin", () => {
    const worldCanvas = createCanvas({
      windowSize: {
        innerWidth: 800,
        innerHeight: 600
      }
    });

    expect(isViewportOriginUsable({ origin: { x: -64, y: 300 }, worldCanvas })).toBe(true);
    expect(isViewportOriginUsable({ origin: { x: -65, y: 300 }, worldCanvas })).toBe(false);
    expect(isViewportOriginUsable({ origin: { x: 864, y: 664 }, worldCanvas })).toBe(true);
    expect(isViewportOriginUsable({ origin: { x: 865, y: 300 }, worldCanvas })).toBe(false);
    expect(isViewportOriginUsable({ origin: { x: Number.NaN, y: 0 }, worldCanvas })).toBe(false);
  });

  it("centers on the canvas rect or window fallback", () => {
    expect(getCanvasCenterViewportOrigin({
      worldCanvas: createCanvas({
        rect: {
          left: 20,
          top: 30,
          width: 100,
          height: 80
        }
      })
    })).toEqual({ x: 70, y: 70 });

    expect(getCanvasCenterViewportOrigin({
      worldCanvas: createCanvas({
        rect: null,
        windowSize: {
          innerWidth: 1024,
          innerHeight: 768
        }
      })
    })).toEqual({ x: 512, y: 384 });
  });
});
