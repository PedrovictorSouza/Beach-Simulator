import { describe, expect, it } from "vitest";
import {
  applyWorkbenchGreenArrowCue,
  cancelPendingWorkbenchPlacementIntent,
  getWorkbenchInteractionParticleBillboards,
  hasPendingWorkbenchPlacementIntent,
  shouldShowWorkbenchGreenArrowCue
} from "../app/runtime/gameLoop.js";
import {
  createInteractionInfoBillboard,
  WORKBENCH_INFO_ICON_OFFSET
} from "../app/runtime/interactionInfoBillboards.js";

describe("Workbench runtime feedback", () => {
  it("creates an interaction info billboard from a base position and offset", () => {
    const texture = { id: "workbench-marker" };
    const billboard = createInteractionInfoBillboard(
      texture,
      [10, 0.02, -4],
      WORKBENCH_INFO_ICON_OFFSET,
      [0, 0, 1, 1]
    );

    expect(billboard).toEqual({
      texture,
      position: [
        11.42,
        1.36,
        -4.42
      ],
      size: [0.72, 0.72],
      uvRect: [0, 0, 1, 1]
    });
  });

  it("skips interaction info billboards without required inputs", () => {
    expect(createInteractionInfoBillboard(null, [0, 0, 0], [1, 1, 1], null)).toBeNull();
    expect(createInteractionInfoBillboard({ id: "marker" }, null, [1, 1, 1], null)).toBeNull();
    expect(createInteractionInfoBillboard({ id: "marker" }, [0, 0, 0], null, null)).toBeNull();
  });

  it("creates a stable particle marker around the Workbench interaction spot", () => {
    const texture = { id: "spark" };
    const billboards = getWorkbenchInteractionParticleBillboards({
      texture,
      uvRect: [0, 0, 1, 1],
      basePosition: [10, 0.02, -4],
      playerPosition: [10, 0.02, -3],
      now: 1000,
      interactDistance: 5.4
    });

    expect(billboards).toHaveLength(12);
    expect(billboards.every((billboard) => billboard.texture === texture)).toBe(true);
    expect(billboards.every((billboard) => billboard.position[1] > 0.02)).toBe(true);
    expect(billboards.some((billboard) => billboard.position[0] !== 10)).toBe(true);
    expect(billboards.some((billboard) => billboard.position[2] !== -4)).toBe(true);
  });

  it("boosts the marker when the player can open the Workbench", () => {
    const texture = { id: "spark" };
    const far = getWorkbenchInteractionParticleBillboards({
      texture,
      basePosition: [0, 0.02, 0],
      playerPosition: [20, 0.02, 0],
      now: 1000,
      interactDistance: 5.4
    });
    const near = getWorkbenchInteractionParticleBillboards({
      texture,
      basePosition: [0, 0.02, 0],
      playerPosition: [1, 0.02, 0],
      now: 1000,
      interactDistance: 5.4
    });

    expect(near[0].alpha).toBeGreaterThan(far[0].alpha);
    expect(near[0].size[0]).toBeGreaterThan(far[0].size[0]);
  });

  it("clears pending Workbench placement intents so B can cancel after build", () => {
    const session = {
      pendingPlacementIntent: {
        source: "workbench",
        itemId: "greenhouse",
        label: "Greenhouse"
      }
    };

    expect(hasPendingWorkbenchPlacementIntent(session)).toBe(true);
    expect(cancelPendingWorkbenchPlacementIntent(session)).toEqual({
      source: "workbench",
      itemId: "greenhouse",
      label: "Greenhouse"
    });
    expect(session.pendingPlacementIntent).toBeNull();
    expect(hasPendingWorkbenchPlacementIntent(session)).toBe(false);
  });

  it("does not clear non-Workbench placement intents", () => {
    const intent = {
      source: "debug",
      itemId: "greenhouse",
      label: "Greenhouse"
    };
    const session = {
      pendingPlacementIntent: intent
    };

    expect(cancelPendingWorkbenchPlacementIntent(session)).toBeNull();
    expect(session.pendingPlacementIntent).toBe(intent);
  });

  it("shows the Workbench arrow only while Workbench interaction is still needed", () => {
    expect(shouldShowWorkbenchGreenArrowCue({
      activeTask: {
        id: "clear-white-ground",
        objectives: [{ id: "place-thermal-cabin" }]
      },
      storyState: { flags: {} }
    })).toBe(true);
    expect(shouldShowWorkbenchGreenArrowCue({
      activeTask: {
        id: "clear-white-ground",
        objectives: [{ id: "place-thermal-cabin" }]
      },
      storyState: { flags: { campfireCrafted: true } }
    })).toBe(false);
    expect(shouldShowWorkbenchGreenArrowCue({
      activeTask: {
        id: "report-base-ready",
        objectives: [{ id: "build-greenhouse" }]
      },
      storyState: { flags: {} }
    })).toBe(true);
    expect(shouldShowWorkbenchGreenArrowCue({
      activeTask: {
        id: "report-base-ready",
        objectives: [{ id: "build-greenhouse" }]
      },
      storyState: { flags: { greenhouseCrafted: true } }
    })).toBe(false);
  });

  it("animates the Workbench arrow with a small bob and rotation", () => {
    const instance = {
      baseYaw: 0.2,
      baseScale: 1,
      scale: 1
    };

    expect(applyWorkbenchGreenArrowCue(instance, {
      active: true,
      basePosition: [10, 0.02, -4],
      now: 1000
    })).toBe(true);
    expect(instance.active).toBe(true);
    expect(instance.offset[0]).toBe(10);
    expect(instance.offset[1]).toBeGreaterThan(2);
    expect(instance.offset[2]).toBe(-4);
    expect(instance.scale).toBe(3);
    expect(instance.yaw).not.toBe(0.2);
    expect(Math.abs(instance.roll)).toBeGreaterThan(0);

    expect(applyWorkbenchGreenArrowCue(instance, { active: false })).toBe(false);
    expect(instance.active).toBe(false);
  });
});
