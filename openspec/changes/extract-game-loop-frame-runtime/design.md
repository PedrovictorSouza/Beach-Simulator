# Game Loop Frame Runtime Extraction Design Notes

## Current Shape

`startGameLoop()` wires many runtime dependencies and defines an inner
`frame(now)` function. The frame currently:

1. Begins the frame snapshot.
2. Calculates `rawDeltaTime` and clamped `deltaTime`.
3. Updates previous time and the FPS panel.
4. Reads flow state.
5. Updates gamepads.
6. Handles paused state.
7. Updates camera and interaction highlights.
8. Begins the gameplay opening frame.
9. Computes placement, camera and input blockers.
10. Updates gameplay input.
11. Updates debug overlays.
12. Handles the intro-room early commit.
13. Continues into gameplay, UI, render and tutorial snapshot population.
14. Commits the frame.
15. Schedules the next animation frame.

`gameLoopFramePolicies.js` already owns pure blocker and permission policies.
The next extraction should reuse that boundary instead of duplicating policy
logic.

## Target Shape

`gameLoop.js` remains the entrypoint and dependency wiring module.

Conceptually:

```js
export function startGameLoop(deps) {
  const loopState = createGameLoopState();

  const frameRuntime = createGameLoopFrameRuntime({
    ...deps,
    loopState,
    frameSnapshotController,
    fpsPanelController,
    gameplayOpeningRuntime,
    gameplayInputRuntime,
    placementCameraAssist,
    inputModalityPanelController
  });

  function frame(now) {
    frameRuntime.update(now);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
```

This is a directional target, not a single implementation step. The runtime
must not become a large dependency bag that merely relocates the existing
function.

## Extraction Slices

### Slice 1: Frame Clock

Add `createGameLoopFrameClock({ now, maxDeltaTime })`.

The clock owns previous frame time and returns:

```js
{
  rawDeltaTime,
  deltaTime
}
```

It preserves the existing non-negative raw delta and `0.033` clamp. This slice
does not move pause behavior, rendering or frame scheduling.

### Slice 2: Frame Start Context

After the clock is integrated, introduce a small frame-start context builder
only if it removes repeated orchestration without widening dependencies. It may
group:

- timing;
- flow state;
- gameplay-opening locks;
- placement-preview state;
- resolved blockers.

It must calculate values in the existing order and must not own gameplay rules.

### Slice 3: Frame Runtime Boundary

Introduce `createGameLoopFrameRuntime(...)` only after earlier slices are
covered. Move a narrow orchestration segment behind `update(now)` while keeping
`requestAnimationFrame` in `startGameLoop()`.

The runtime boundary must preserve:

- pause early return;
- intro-room early commit;
- camera and input ordering;
- frame commit ordering;
- existing `nextFrame` shape.

The implemented narrow boundary exposes three methods instead of a single
`update(now)` call:

- `beginFrame(now)` for snapshot start, timing, FPS and flow-state read;
- `updateInputAndCheckPaused(deltaTime)` for gamepad update and pause clearing;
- `commitFrame()` for snapshot commit delegation.

This keeps the decisions to early-return, commit the intro frame and schedule
the next animation frame inside `startGameLoop()`. Those decisions still
surround domain-specific orchestration and should not move until a later
preflight identifies a smaller tested contract.

## Ownership Rules

`startGameLoop()` continues to wire domain runtimes. The frame runtime may call
them but must not absorb their internal rules.

The frame runtime must not:

- implement field moves;
- implement placement rules;
- tune camera behavior;
- change opening cinematic phases;
- reshape render snapshots;
- schedule animation frames directly.

## Testing And Verification

Each slice should add focused tests before integration. Validation should
include:

- clock initialization, clamping and non-negative delta tests;
- existing `gameLoopFramePolicies` tests;
- build;
- local HTTP smoke;
- manual opening, pause, camera and movement checks when browser automation is
  available.
