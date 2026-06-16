import { describe, expect, it, vi } from "vitest";
import { createTreeRevivalLeafBurstFrameRuntime } from "../app/runtime/presentation/treeRevivalLeafBurstFrameRuntime.js";

function createFrameRuntime({ sessionOverrides = {}, flags = {} } = {}) {
  const leafBurstRuntime = {
    appendBillboards: vi.fn(),
    queue: vi.fn(),
    update: vi.fn()
  };
  const session = {
    palmInstances: [],
    leppaTree: null,
    leavesTexture: "leaves",
    greenGrassTexture: "grass",
    natureRevivalSparkTexture: "spark",
    ...sessionOverrides
  };
  const runtime = createTreeRevivalLeafBurstFrameRuntime({
    leafBurstRuntime,
    session,
    getStoryState: () => ({ flags }),
    rendering: {
      fullUvRect: [0, 0, 1, 1]
    }
  });

  return {
    leafBurstRuntime,
    runtime,
    session
  };
}

describe("createTreeRevivalLeafBurstFrameRuntime", () => {
  it("queues leaf bursts for newly revived palms and Leppa tree", () => {
    const { leafBurstRuntime, runtime } = createFrameRuntime({
      sessionOverrides: {
        palmInstances: [
          { id: "palm-a", alive: true, offset: [1, 0, 2] },
          { id: "palm-b", alive: true, offset: [3, 0, 4] },
          { id: "palm-c", alive: false, offset: [5, 0, 6] }
        ],
        leppaTree: {
          id: "leppa-a",
          position: [7, 0, 8],
          revived: true
        }
      }
    });

    runtime.queueForNewlyRevivedTrees({
      palmAliveById: new Map([
        ["palm-a", false],
        ["palm-b", true]
      ]),
      leppaTreeRevived: false
    });

    expect(leafBurstRuntime.queue).toHaveBeenCalledTimes(2);
    expect(leafBurstRuntime.queue).toHaveBeenNthCalledWith(1, [1, 0, 2], "palm-a");
    expect(leafBurstRuntime.queue).toHaveBeenNthCalledWith(2, [7, 0, 8], "leppa-a");
  });

  it("uses story flags when resolving whether the Leppa tree was revived", () => {
    const { leafBurstRuntime, runtime } = createFrameRuntime({
      flags: { leppaTreeRevived: true },
      sessionOverrides: {
        leppaTree: {
          position: [7, 0, 8]
        }
      }
    });

    runtime.queueForNewlyRevivedTrees({
      palmAliveById: new Map(),
      leppaTreeRevived: false
    });

    expect(leafBurstRuntime.queue).toHaveBeenCalledWith([7, 0, 8], "leppa-tree");
  });

  it("updates and appends billboards through the wrapped leaf burst runtime", () => {
    const { leafBurstRuntime, runtime } = createFrameRuntime();
    const nextFrame = {
      render: {
        genericBillboards: []
      }
    };

    runtime.update(0.25);
    runtime.appendBillboards(nextFrame);

    expect(leafBurstRuntime.update).toHaveBeenCalledWith(0.25);
    expect(leafBurstRuntime.appendBillboards).toHaveBeenCalledWith({
      billboards: nextFrame.render.genericBillboards,
      texture: "leaves",
      uvRect: [0, 0, 1, 1]
    });
  });
});
