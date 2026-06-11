import { describe, expect, it, vi } from "vitest";

import {
  createSquirtleReassemblyRuntime
} from "../app/runtime/companions/squirtleReassemblyRuntime.js";

function createRuntime(overrides = {}) {
  const syncSquirtleModelInstance = vi.fn();
  const session = {
    actTwoSquirtle: {
      visible: true,
      assemblyState: "reassembling",
      position: [2, 0.1, 4],
      model: {
        primitives: [
          { id: "shell" },
          { id: "head" }
        ]
      },
      reassembly: {
        active: true,
        elapsed: 0,
        duration: 1,
        progress: 0,
        onComplete: vi.fn()
      },
      ...overrides.squirtle
    },
    ...overrides.session
  };

  return {
    runtime: createSquirtleReassemblyRuntime({
      session,
      clamp01: (value) => Math.max(0, Math.min(1, value)),
      easeOutCubic: (value) => value,
      lerp: (from, to, amount) => from + (to - from) * amount,
      partScale: 0.5,
      syncSquirtleModelInstance,
      ...overrides.runtime
    }),
    session,
    syncSquirtleModelInstance
  };
}

describe("createSquirtleReassemblyRuntime", () => {
  it("advances reassembly progress without completing early", () => {
    const { runtime, session, syncSquirtleModelInstance } = createRuntime();

    runtime.update(0.25);

    expect(session.actTwoSquirtle.reassembly.elapsed).toBe(0.25);
    expect(session.actTwoSquirtle.reassembly.progress).toBe(0.25);
    expect(session.actTwoSquirtle.assemblyState).toBe("reassembling");
    expect(syncSquirtleModelInstance).not.toHaveBeenCalled();
  });

  it("completes reassembly, syncs the model, and calls onComplete once", () => {
    const { runtime, session, syncSquirtleModelInstance } = createRuntime();
    const onComplete = session.actTwoSquirtle.reassembly.onComplete;

    runtime.update(1);

    expect(session.actTwoSquirtle.reassembly.active).toBe(false);
    expect(session.actTwoSquirtle.reassembly.onComplete).toBeNull();
    expect(session.actTwoSquirtle.visible).toBe(true);
    expect(session.actTwoSquirtle.assemblyState).toBe("assembled");
    expect(syncSquirtleModelInstance).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);

    runtime.update(1);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("appends scattered primitive scene objects while reassembling", () => {
    const { runtime, session } = createRuntime();

    const sceneObjects = runtime.getSceneObjects(["base"], session.actTwoSquirtle);

    expect(sceneObjects).toHaveLength(3);
    expect(sceneObjects[0]).toBe("base");
    expect(sceneObjects[1]).toMatchObject({
      model: {
        primitives: [{ id: "shell" }]
      },
      brightness: 1,
      instances: [{
        scale: 0.5,
        active: true
      }]
    });
    expect(sceneObjects[1].instances[0].offset).not.toEqual([2, 0.1, 4]);
  });

  it("returns the original scene objects when Squirtle is hidden or assembled", () => {
    const { runtime, session } = createRuntime({
      squirtle: {
        assemblyState: "assembled"
      }
    });
    const sceneObjects = ["base"];

    expect(runtime.getSceneObjects(sceneObjects, session.actTwoSquirtle)).toBe(sceneObjects);
  });
});
