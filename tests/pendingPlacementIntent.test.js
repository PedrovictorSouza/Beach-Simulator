import { describe, expect, it } from "vitest";

import {
  cancelPendingWorkbenchPlacementIntent,
  getActivePendingPlacementIntent,
  hasPendingWorkbenchPlacementIntent
} from "../app/runtime/construction/pendingPlacementIntent.js";

describe("pending placement intent", () => {
  it("returns only owned active placement intents", () => {
    expect(getActivePendingPlacementIntent({
      pendingPlacementIntent: {
        itemId: "greenhouse",
        label: "Greenhouse"
      }
    }, {}, {})).toBeNull();

    const intent = {
      itemId: "greenhouse",
      label: "Greenhouse"
    };
    expect(getActivePendingPlacementIntent({
      pendingPlacementIntent: intent
    }, {}, {
      greenhouse: 1
    })).toBe(intent);
  });

  it("keeps straw beds from being active after the habitat placement is already done", () => {
    expect(getActivePendingPlacementIntent({
      pendingPlacementIntent: {
        itemId: "strawBed",
        label: "Straw Bed"
      }
    }, {
      flags: {
        strawBedPlacedInBulbasaurHabitat: true
      }
    }, {
      strawBed: 1
    })).toBeNull();
  });

  it("unblocks the House Kit intent once the Solar Station dependency is satisfied", () => {
    expect(getActivePendingPlacementIntent({
      pendingPlacementIntent: {
        itemId: "leafDenKit",
        label: "House Kit",
        blockedReason: "needs-solar-station"
      },
      strawBed: {
        position: [1, 0, 2]
      }
    }, {
      flags: {
        strawBedPlacedInBulbasaurHabitat: true
      }
    }, {
      leafDenKit: 1
    })).toEqual({
      itemId: "leafDenKit",
      label: "House Kit",
      blockedReason: null
    });
  });

  it("cancels only pending Workbench placement intents", () => {
    const workbenchSession = {
      pendingPlacementIntent: {
        source: "workbench",
        itemId: "greenhouse",
        label: "Greenhouse"
      }
    };
    expect(hasPendingWorkbenchPlacementIntent(workbenchSession)).toBe(true);
    expect(cancelPendingWorkbenchPlacementIntent(workbenchSession)).toEqual({
      source: "workbench",
      itemId: "greenhouse",
      label: "Greenhouse"
    });
    expect(workbenchSession.pendingPlacementIntent).toBeNull();

    const debugIntent = {
      source: "debug",
      itemId: "greenhouse",
      label: "Greenhouse"
    };
    const debugSession = {
      pendingPlacementIntent: debugIntent
    };
    expect(hasPendingWorkbenchPlacementIntent(debugSession)).toBe(false);
    expect(cancelPendingWorkbenchPlacementIntent(debugSession)).toBeNull();
    expect(debugSession.pendingPlacementIntent).toBe(debugIntent);
  });
});
