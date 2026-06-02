import { describe, expect, it } from "vitest";

import { createTreeRevivalLeafBurstRuntime } from "../app/runtime/treeRevivalLeafBurstRuntime.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const easeOutCubic = (value) => 1 - Math.pow(1 - clamp01(value), 3);

function createRuntime() {
  return createTreeRevivalLeafBurstRuntime({
    clamp01,
    easeOutCubic,
    lerp,
    random: () => 0.5,
    config: {
      count: 2,
      duration: 1,
      drift: 1,
      gravity: 1,
      baseHeight: 2,
      heightRange: 1,
      sizeMin: 0.2,
      sizeMax: 0.4
    }
  });
}

describe("createTreeRevivalLeafBurstRuntime", () => {
  it("queues deterministic leaf billboards with the existing render shape", () => {
    const runtime = createRuntime();
    const billboards = [];

    runtime.queue([1, 2, 3], "palm-a");
    runtime.appendBillboards({
      billboards,
      texture: "leaves",
      uvRect: [0, 0, 1, 1]
    });

    expect(billboards).toHaveLength(2);
    expect(billboards[0]).toMatchObject({
      texture: "leaves",
      position: [1.55, 4.5, 3],
      uvRect: [0, 0, 1, 1],
      alpha: 1,
      rotation: Math.PI
    });
    expect(billboards[0].size).toHaveLength(2);
  });

  it("updates leaf physics and removes expired bursts", () => {
    const runtime = createRuntime();
    const before = [];
    const during = [];
    const after = [];

    runtime.queue([1, 2, 3]);
    runtime.appendBillboards({ billboards: before, texture: "leaves" });
    const beforePosition = [...before[0].position];
    runtime.update(0.25);
    runtime.appendBillboards({ billboards: during, texture: "leaves" });
    runtime.update(1);
    runtime.appendBillboards({ billboards: after, texture: "leaves" });

    expect(during).toHaveLength(2);
    expect(during[0].position).not.toEqual(beforePosition);
    expect(after).toEqual([]);
  });

  it("ignores invalid positions and missing render targets", () => {
    const runtime = createRuntime();
    const billboards = [];

    runtime.queue(null);
    runtime.queue([1, 2, 3]);
    runtime.appendBillboards({ billboards });
    runtime.appendBillboards({ texture: "leaves" });

    expect(billboards).toEqual([]);
  });

  it("keeps burst state independent between runtime instances", () => {
    const first = createRuntime();
    const second = createRuntime();
    const firstBillboards = [];
    const secondBillboards = [];

    first.queue([1, 2, 3]);
    first.appendBillboards({ billboards: firstBillboards, texture: "leaves" });
    second.appendBillboards({ billboards: secondBillboards, texture: "leaves" });

    expect(firstBillboards).toHaveLength(2);
    expect(secondBillboards).toEqual([]);
  });
});
