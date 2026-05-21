import { describe, expect, it } from "vitest";
import { resolveWorkbenchPlacementPreviewVisual } from "../app/gameplay/placementPreviewVisual.js";

describe("placement preview visual", () => {
  it("keeps valid workbench previews translucent and gently animated", () => {
    const first = resolveWorkbenchPlacementPreviewVisual({ valid: true, timeSeconds: 0 });
    const later = resolveWorkbenchPlacementPreviewVisual({ valid: true, timeSeconds: 0.3 });

    expect(first.tint).toEqual([0.55, 1, 0.46]);
    expect(first.alpha).toBeGreaterThanOrEqual(0.5);
    expect(first.alpha).toBeLessThanOrEqual(0.58);
    expect(later.alpha).not.toBe(first.alpha);
    expect(later.tintStrength).toBeGreaterThanOrEqual(0.18);
    expect(later.tintStrength).toBeLessThanOrEqual(0.3);
  });

  it("keeps invalid workbench previews readable without becoming opaque", () => {
    const visual = resolveWorkbenchPlacementPreviewVisual({ valid: false, timeSeconds: 0.2 });

    expect(visual.tint).toEqual([1, 0.04, 0.02]);
    expect(visual.alpha).toBeGreaterThanOrEqual(0.44);
    expect(visual.alpha).toBeLessThanOrEqual(0.48);
    expect(visual.tintStrength).toBeGreaterThanOrEqual(0.74);
    expect(visual.tintStrength).toBeLessThanOrEqual(0.84);
  });
});
