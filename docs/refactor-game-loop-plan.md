# Game Loop Refactor Plan

## Current State

`app/runtime/gameLoop.js` remains the frame orchestrator, but it still owns state
and detailed logic for several domains. Existing runtime factories establish the
preferred pattern:

- `createGameLoopState()`
- `createGameplayInputRuntime()`
- `createGameplayAudioRuntime()`
- `createGameplayOpeningRuntime()`
- `createFrameSnapshotController()`

The first required step is to finish the existing `createGameLoopState()`
migration. Several fields already exist in `gameLoopState.js`, while
`gameLoop.js` still has duplicate local variables or bare references.

## Risks

- Frame lifecycle ordering must remain stable.
- Input blockers must be calculated before updating the input runtime.
- Camera, opening, placement, HUD, tile feedback and DOM overlays are
  user-visible systems.
- Workbench rotation and field move feedback are coupled to multiple session
  objects and should only move after state consistency is restored.
- Existing Leafage Native Tree test failures are outside this refactor and must
  not be mixed into these commits.

## Extraction Order

1. Complete the `loopState` migration.
2. Add contract tests for `createGameLoopState()`.
3. Extract `snowstormFogRuntime`.
4. Extract `groundActionFeedbackRuntime`.
5. Extract `playerCounterPromptRuntime`.
6. Extract `cameraDebugRuntime`.
7. Extract `repairBoxRevealFlashRuntime`.
8. Extract `workbenchRotationRuntime`.
9. Review frame lifecycle ordering.
10. Run the final audit and manual checklist.

Each extraction is a separate reviewable step. Do not combine unrelated
subsystems in one commit.

## Validation Commands

```sh
git diff --check
npm test
npm run build
npm run dev
```

Available focused commands include:

```sh
npm test -- --run tests/gameplayCameraDirector.test.js
npm test -- --run tests/gameplayOpeningShip.test.js
npm test -- --run tests/frameSnapshotController.test.js
```

There is no dedicated lint or typecheck script in `package.json`.

## Acceptance Criteria

- No bare or duplicate references remain for fields owned by `loopState`.
- No variable is used before initialization inside `frame(now)`.
- The game builds and the focused tests pass after every step.
- The game opens without `ReferenceError`.
- Opening timing, camera locks, player movement, placement, workbench rotation,
  tile feedback, snowstorm fog and debug overlay behavior remain unchanged.
- Manual browser checks are recorded when a browser backend is available.

## Progress

- Completed: gameplay opening boundary extraction.
- Completed: `loopState` migration consistency pass.
- Completed: add `createGameLoopState()` contract tests.
- Completed: prepare the isolated snowstorm fog runtime.
- Completed: integrate the snowstorm fog runtime into `gameLoop.js`.
- Completed: prepare the isolated ground action feedback runtime.
- Next: integrate the ground action feedback runtime into `gameLoop.js`.

## Validation Log

### Loop State Migration

Passed:

```sh
git diff --check
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `1274` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the game loop state migration and were not modified.

Manual browser validation remains pending because an in-app browser backend was
not available during this pass.

### Game Loop State Contract

Passed:

```sh
npm test -- --run tests/gameLoopState.test.js
git diff --check
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `1276` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The two new `createGameLoopState()` contract tests passed. The remaining
failures are the same Native Tree growth, safe-cell selection and Wood drop
failures recorded during the loop state migration.

### Snowstorm Fog Runtime Preparation

Added the isolated `createSnowstormFogRuntime()` factory and DOM contract tests.
The runtime owns its overlay element and eased opacity state. Integration into
`gameLoop.js` remains a separate small step so the visual frame change can be
reviewed and validated independently.

Passed:

```sh
npm test -- --run tests/snowstormFogRuntime.test.js
git diff --check
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `1279` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Snowstorm Fog Runtime Integration

Integrated `createSnowstormFogRuntime()` into `startGameLoop()`. The game loop
now keeps the existing frame order while delegating overlay creation, eased
opacity state and background drift to the dedicated runtime. The obsolete
`snowstormFogOverlayElement` and `snowstormFogOpacity` fields were removed from
`createGameLoopState()`.

Passed:

```sh
npm test -- --run tests/snowstormFogRuntime.test.js tests/gameLoopState.test.js
git diff --check
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `1279` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The Vite dev server started successfully. Manual browser validation remains
pending because the in-app browser backend was not available during this pass.

### Ground Action Feedback Runtime Preparation

Added the isolated `createGroundActionFeedbackRuntime()` factory and contract
tests. The runtime owns queued feedback accumulation, expiry, cell
deduplication, invalid feedback SFX forwarding and field-tool target pulse
state. Integration into `gameLoop.js` remains a separate small step so tile
feedback behavior can be reviewed independently.

Passed:

```sh
npm test -- --run tests/groundActionFeedbackRuntime.test.js
git diff --check
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `1284` passed
- `3` failed in `tests/gameplayInteractions.test.js`
