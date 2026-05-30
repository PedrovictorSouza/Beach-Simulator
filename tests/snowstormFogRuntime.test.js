// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { createSnowstormFogRuntime } from "../app/runtime/snowstormFogRuntime.js";

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function createSession(snowstorm = {}) {
  return {
    playerCharacter: {
      getPosition: () => [4, 0, 7]
    },
    snowstorm
  };
}

describe("createSnowstormFogRuntime", () => {
  it("creates and updates the snowstorm overlay with the existing visual calculation", () => {
    const mount = document.createElement("div");
    const getSnowstormFogIntensity = vi.fn(() => 0.5);
    const runtime = createSnowstormFogRuntime({
      mount,
      getSnowstormFogIntensity,
      maxOpacity: 0.54,
      opacityEase: 6.2,
      clamp01
    });

    runtime.update({
      session: createSession({ elapsed: 2 }),
      deltaTime: Number.POSITIVE_INFINITY
    });

    const element = mount.querySelector("[data-snowstorm-fog]");

    expect(getSnowstormFogIntensity).toHaveBeenCalledWith(
      expect.objectContaining({ elapsed: 2 }),
      [4, 0, 7]
    );
    expect(element.hidden).toBe(false);
    expect(Number(element.style.opacity)).toBeCloseTo(0.27);
    expect(element.style.backgroundPosition).toBe("center center, 0px 16px, -10px 0px");
  });

  it("hides and reuses the overlay when fog intensity returns to zero", () => {
    const mount = document.createElement("div");
    const runtime = createSnowstormFogRuntime({
      mount,
      getSnowstormFogIntensity: () => 0,
      maxOpacity: 0.54,
      opacityEase: 6.2,
      clamp01
    });
    const session = createSession({ fogIntensity: 1, elapsed: 1 });

    runtime.update({ session, deltaTime: Number.POSITIVE_INFINITY });
    const element = mount.querySelector("[data-snowstorm-fog]");

    session.snowstorm.fogIntensity = 0;
    runtime.update({ session, deltaTime: Number.POSITIVE_INFINITY });

    expect(mount.children).toHaveLength(1);
    expect(element.hidden).toBe(true);
    expect(element.style.opacity).toBe("0");
  });

  it("does not require a DOM mount", () => {
    const runtime = createSnowstormFogRuntime({
      mount: null,
      getSnowstormFogIntensity: () => 1,
      maxOpacity: 0.54,
      opacityEase: 6.2,
      clamp01
    });

    expect(() => {
      runtime.update({
        session: createSession({ elapsed: 1 }),
        deltaTime: Number.POSITIVE_INFINITY
      });
    }).not.toThrow();
  });
});
