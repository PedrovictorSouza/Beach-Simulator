import { describe, expect, it, vi } from "vitest";

import { createBeeFieldRuntime } from "../app/runtime/companions/beeFieldRuntime.js";

function createRuntime(overrides = {}) {
  const repairBoxRuntime = {
    syncRepairBoxInstance: vi.fn((instance, basePosition, active, options) => {
      instance.lastSync = { basePosition, active, options };
    })
  };
  const syncInteractablePosition = vi.fn();
  const session = {
    beeFieldRepairBox: {
      baseOffset: [4, 0.1, 6],
      offset: [9, 0, 9]
    },
    beeInstances: [],
    beeModel: { id: "bee-model" },
    groundFlowerPatches: [],
    ...overrides.session
  };
  const controls = {
    storyState: {
      flags: {
        ...overrides.flags
      }
    }
  };

  return {
    runtime: createBeeFieldRuntime({
      session,
      controls,
      repairBoxRuntime,
      syncInteractablePosition,
      config: {
        flowerGroupId: "bee-field",
        lockedAlpha: 0.4,
        activeTint: [0.1, 0.9, 0.2],
        activeTintStrength: 0.7,
        beeCount: 3,
        beeScale: 0.2,
        patrolRadiusX: 2,
        patrolRadiusZ: 1,
        baseHeight: 0.5,
        bobHeight: 0.1,
        modelFaceYawOffset: Math.PI
      },
      ...overrides.runtime
    }),
    session,
    controls,
    repairBoxRuntime,
    syncInteractablePosition
  };
}

describe("createBeeFieldRuntime", () => {
  it("syncs the repair box locked, active, and opened visual states", () => {
    const {
      runtime,
      session,
      repairBoxRuntime,
      syncInteractablePosition
    } = createRuntime();

    runtime.syncRepairBox();

    expect(repairBoxRuntime.syncRepairBoxInstance).toHaveBeenCalledWith(
      session.beeFieldRepairBox,
      [4, 0.1, 6],
      true,
      { openingProgress: 0 }
    );
    expect(syncInteractablePosition).toHaveBeenCalledWith("beeFieldRepairBox", [4, 0.1, 6]);
    expect(session.beeFieldRepairBox.alpha).toBe(0.4);
    expect(session.beeFieldRepairBox.tint).toBeNull();
    expect(session.beeFieldRepairBox.tintStrength).toBe(0);

    const restored = createRuntime({
      flags: {
        restoredFlowerBedHabitatIds: ["bee-field"]
      }
    });

    restored.runtime.syncRepairBox();

    expect(restored.session.beeFieldRepairBox.alpha).toBe(1);
    expect(restored.session.beeFieldRepairBox.tint).toEqual([0.1, 0.9, 0.2]);
    expect(restored.session.beeFieldRepairBox.tintStrength).toBe(0.7);

    const opened = createRuntime({
      flags: {
        restoredFlowerBedHabitatIds: ["bee-field"],
        beeFieldRepairBoxOpened: true
      }
    });

    opened.runtime.syncRepairBox();

    expect(opened.repairBoxRuntime.syncRepairBoxInstance).toHaveBeenCalledWith(
      opened.session.beeFieldRepairBox,
      [4, 0.1, 6],
      true,
      { openingProgress: 1 }
    );
    expect(opened.session.beeFieldRepairBox.tint).toBeNull();
    expect(opened.session.beeFieldRepairBox.tintStrength).toBe(0);
  });

  it("resolves center from repair box offsets before averaging flower patches", () => {
    const { runtime } = createRuntime();

    expect(runtime.getCenterPosition()).toEqual([4, 0.1, 6]);

    const fromOffset = createRuntime({
      session: {
        beeFieldRepairBox: {
          offset: [7, 0.2, 8]
        }
      }
    });

    expect(fromOffset.runtime.getCenterPosition()).toEqual([7, 0.2, 8]);

    const fromPatches = createRuntime({
      session: {
        beeFieldRepairBox: null,
        groundFlowerPatches: [
          { habitatGroupId: "bee-field", position: [0, 0, 2] },
          { habitatGroupId: "other-field", position: [99, 0, 99] },
          { habitatGroupId: "bee-field", position: [4, 0.2, 6] }
        ]
      }
    });

    expect(fromPatches.runtime.getCenterPosition()).toEqual([2, 0.1, 4]);
  });

  it("clears bees until the bee field box has opened", () => {
    const { runtime, session } = createRuntime({
      session: {
        beeInstances: [{ id: "existing" }]
      }
    });

    runtime.syncBees(0.25);

    expect(session.beeInstances).toEqual([]);
  });

  it("creates and updates bee patrol instances after the box opens", () => {
    const { runtime, session } = createRuntime({
      flags: {
        beeFieldRepairBoxOpened: true
      }
    });

    runtime.syncBees(0.5);

    expect(session.beeInstances).toHaveLength(3);
    expect(session.beePatrolState.elapsed).toBe(0.5);
    expect(session.beeInstances[0]).toMatchObject({
      id: "bee-field-bee-0",
      active: true,
      scale: 0.2 * 0.9
    });
    expect(session.beeInstances[0].offset).not.toEqual([0, 0, 0]);
    expect(session.beeInstances[0].yaw).toBeGreaterThan(Math.PI);
  });
});
