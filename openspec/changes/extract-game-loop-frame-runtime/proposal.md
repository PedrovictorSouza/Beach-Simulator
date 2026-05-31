# Change: Extract Game Loop Frame Runtime

## Why

`app/runtime/gameLoop.js` has become a high-pressure runtime hub. The inner
`frame(now)` function currently owns several responsibilities at once:

- frame timing;
- snapshot creation;
- pause behavior;
- flow-state reading;
- gameplay opening updates;
- movement and input blockers;
- camera input permissions;
- frame commit and next `requestAnimationFrame`.

This makes the loop harder to test and risky to modify. The architecture report
already identifies `app/runtime/gameLoop.js` as a hub-risk module and recommends
reducing pressure by extracting stable helpers first while keeping orchestration
behavior in place.

This change extracts frame-level orchestration in small, testable steps without
changing gameplay behavior.

## What Changes

- Add a small `gameLoopFrameClock.js` module for timing and delta calculation.
- Add a `gameLoopFrameRuntime.js` module that can own frame execution behind an
  explicit dependency object.
- Keep `startGameLoop()` as the owner of dependency wiring and
  `requestAnimationFrame` scheduling.
- Preserve existing gameplay behavior, camera behavior, opening timing, input
  clearing and rendering output.
- Add focused tests for frame clock behavior and pure policy helpers introduced
  during extraction.

## Out Of Scope

- Do not redesign the full game loop.
- Do not move all gameplay logic out of `gameLoop.js` in one pass.
- Do not change ability behavior, camera tuning, cinematic timing, quest logic,
  placement logic or rendering output.
- Do not rename gameplay concepts.
- Do not introduce a new global event bus.
- Do not add new gameplay features.

## Preflight

- Objective: reduce pressure in `frame(now)` through stable, independently
  testable frame helpers.
- Likely files for implementation: `app/runtime/gameLoop.js`, new frame runtime
  modules and focused runtime tests.
- Smallest safe implementation: extract frame clock calculation first.
- Files not to touch: field-move runtimes, session systems, renderer core,
  narrative data, assets, input mapping and build configuration.
- Risk: medium. The frame function touches many runtime systems, so
  orchestration movement must follow helper coverage.
- Size: large as a complete extraction, small when implemented in slices.

## Validation

- Existing game starts normally.
- Opening cinematic still runs.
- Pause still clears pending actions and movement input.
- Input modality panel still updates.
- Camera still rotates and zooms only when allowed.
- Intro-room early return still commits the frame before scheduling the next
  frame.
- `npm run build` passes.
- Smallest relevant tests pass after every slice.
