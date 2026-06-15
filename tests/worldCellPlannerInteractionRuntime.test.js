import { describe, expect, it, vi } from "vitest";

import { createWorldCellPlannerInteractionRuntime } from "../app/runtime/world/worldCellPlannerInteractionRuntime.js";

function createCanvas() {
  return {
    width: 100,
    height: 100,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100
    })
  };
}

function createPointerEvent(overrides = {}) {
  return {
    button: 0,
    clientX: 10,
    clientY: 20,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {
      closest: vi.fn(() => null)
    },
    ...overrides
  };
}

function createHarness(overrides = {}) {
  const groundCell = {
    id: "ground-2-3",
    offset: [2, 0, 3],
    surfaceY: 0,
    tileSpan: 1
  };
  const session = {
    groundDeadInstances: [groundCell],
    groundPurifiedInstances: [],
    iceGroundInstances: [],
    ...overrides.session
  };
  const rendering = {
    debugWorldCellPlanner: true,
    onWorldCellPlannerPick: vi.fn(),
    ...overrides.rendering
  };
  const hud = {
    pushNotice: vi.fn(),
    ...overrides.hud
  };
  const camera = {
    project: vi.fn(() => ({
      x: 10,
      y: 20,
      depth: 0.5
    })),
    ...overrides.camera
  };
  const runtime = createWorldCellPlannerInteractionRuntime({
    camera,
    getGridConfig: () => ({
      cellSize: 1,
      origin: { x: 0, y: 0, z: 0 },
      width: 8,
      height: 8
    }),
    hud,
    maxDistancePx: 72,
    rendering,
    session,
    worldCanvas: createCanvas(),
    ...overrides.runtimeOptions
  });

  return {
    camera,
    groundCell,
    hud,
    rendering,
    runtime,
    session
  };
}

describe("createWorldCellPlannerInteractionRuntime", () => {
  it("queues accepted pointer events and processes the selected world cell", () => {
    const { groundCell, hud, rendering, runtime, session } = createHarness();
    const event = createPointerEvent();

    runtime.handlePointerDown(event);
    runtime.processClick();

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(session.worldCellPlannerSelectedGroundCell).toBe(groundCell);
    expect(rendering.onWorldCellPlannerPick).toHaveBeenCalledWith({
      cellId: "ground-2-3",
      gridCell: { x: 2, y: 3 },
      worldPosition: [2, 0, 3],
      tileSpan: 1,
      groundKind: "dead"
    });
    expect(hud.pushNotice).toHaveBeenCalledWith("Cell ground-2-3 selected.");
  });

  it("ignores pointer events while inactive or inside editable controls", () => {
    const { runtime } = createHarness({
      rendering: {
        debugWorldCellPlanner: false
      }
    });
    const inactiveEvent = createPointerEvent();
    runtime.handlePointerDown(inactiveEvent);
    runtime.processClick();

    expect(inactiveEvent.preventDefault).not.toHaveBeenCalled();

    const active = createHarness();
    const editableEvent = createPointerEvent({
      target: {
        closest: vi.fn(() => ({}))
      }
    });
    active.runtime.handlePointerDown(editableEvent);
    active.runtime.processClick();

    expect(editableEvent.preventDefault).not.toHaveBeenCalled();
    expect(active.rendering.onWorldCellPlannerPick).not.toHaveBeenCalled();
  });

  it("returns the selected ground cell highlight only while active", () => {
    const { groundCell, runtime, session } = createHarness();
    session.worldCellPlannerSelectedGroundCell = groundCell;

    expect(runtime.getSelectedGroundCell()).toEqual({
      ...groundCell,
      highlightTargetState: "powerRadius",
      highlightAbilityId: "debug"
    });

    const inactive = createHarness({
      rendering: {
        debugWorldCellPlanner: false
      }
    });
    inactive.session.worldCellPlannerSelectedGroundCell = groundCell;

    expect(inactive.runtime.getSelectedGroundCell()).toBe(null);
  });

  it("notices when a queued click has no nearby world cell", () => {
    const { hud, runtime } = createHarness({
      camera: {
        project: vi.fn(() => ({
          x: 90,
          y: 90,
          depth: 0.5
        }))
      }
    });

    runtime.handlePointerDown(createPointerEvent({ clientX: 10, clientY: 20 }));
    runtime.processClick();

    expect(hud.pushNotice).toHaveBeenCalledWith("No world cell found there.");
  });
});
