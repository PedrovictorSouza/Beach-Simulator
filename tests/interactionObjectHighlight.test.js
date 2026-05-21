import { describe, expect, it } from "vitest";
import {
  applyInteractionObjectHighlight,
  clearInteractionObjectHighlights,
  getInteractionObjectHighlightInstances,
  INTERACTION_OBJECT_HIGHLIGHT_TINT,
  INTERACTION_OBJECT_HIGHLIGHT_TINT_STRENGTH
} from "../app/runtime/interactionObjectHighlight.js";

describe("interaction object highlight", () => {
  it("applies yellow tint to the active Workbench trigger target", () => {
    const workbenchModelInstance = { id: "workbench-model" };
    const session = {
      workbenchModelInstance,
      sceneObjects: [{ instances: [workbenchModelInstance] }]
    };

    const highlighted = applyInteractionObjectHighlight(session, {
      interactTarget: { target: { id: "workbench" } }
    });

    expect(highlighted).toBe(1);
    expect(workbenchModelInstance.tint).toEqual([...INTERACTION_OBJECT_HIGHLIGHT_TINT]);
    expect(workbenchModelInstance.tintStrength).toBe(INTERACTION_OBJECT_HIGHLIGHT_TINT_STRENGTH);
  });

  it("restores the previous tint when the trigger target clears", () => {
    const leppaTreeDeadInstance = {
      id: "leppa-tree-dead",
      tint: [1.82, 1.72, 1.24],
      tintStrength: 0.76
    };
    const session = {
      leppaTree: { deadInstance: leppaTreeDeadInstance },
      sceneObjects: [{ instances: [leppaTreeDeadInstance] }]
    };

    applyInteractionObjectHighlight(session, {
      interactTarget: { target: { id: "leppaTree" } }
    });
    const restored = clearInteractionObjectHighlights(session);

    expect(restored).toBe(1);
    expect(leppaTreeDeadInstance.tint).toEqual([1.82, 1.72, 1.24]);
    expect(leppaTreeDeadInstance.tintStrength).toBe(0.76);
  });

  it("maps nearby Workbench-placed rotation targets to their model instance", () => {
    const trainHouseInstance = { id: "campfire-train-house-model" };
    const session = {
      campfireTrainHouseModelInstance: trainHouseInstance
    };

    expect(getInteractionObjectHighlightInstances(session, {
      workbenchRotationTarget: { kind: "trainHouse" }
    })).toEqual([trainHouseInstance]);
  });
});
