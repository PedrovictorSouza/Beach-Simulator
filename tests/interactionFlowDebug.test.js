import { afterEach, describe, expect, it, vi } from "vitest";

import { debugInteractionFlow } from "../app/runtime/interactionFlowDebug.js";

describe("debugInteractionFlow", () => {
  afterEach(() => {
    delete globalThis.__DEBUG_INTERACTION_FLOW__;
    vi.restoreAllMocks();
  });

  it("does not log while the debug flag is disabled", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    debugInteractionFlow("node", { id: 1 });

    expect(log).not.toHaveBeenCalled();
  });

  it("logs the interaction-flow node and payload while enabled", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    globalThis.__DEBUG_INTERACTION_FLOW__ = true;
    const payload = { id: 1 };

    debugInteractionFlow("node", payload);

    expect(log).toHaveBeenCalledWith("[interaction-flow:node]", payload);
  });
});
