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
- Completed: integrate the ground action feedback runtime into `gameLoop.js`.
- Completed: isolate repeated frame lifecycle policies and local frame builders.
- Completed: extract the player counter prompt runtime.
- Completed: extract the camera debug runtime.
- Next: extract the repair box reveal flash runtime.

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

### Ground Action Feedback Runtime Integration

Integrated `createGroundActionFeedbackRuntime()` into `startGameLoop()`. The
game loop now forwards feedback triggers, invalid field-move feedback, queued
session feedback reads and field-tool target pulse reads to the dedicated
runtime. The obsolete `groundActionFeedbacks`, `fieldToolTargetPulseStartedAt`
and `fieldToolTargetPulseAbilityId` fields were removed from
`createGameLoopState()`.

Passed:

```sh
npm test -- --run tests/groundActionFeedbackRuntime.test.js tests/gameLoopState.test.js
git diff --check
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `1284` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual tile-feedback validation remains pending because the in-app browser
backend was not available during this pass.

### Frame Lifecycle Policy Extraction

Added `gameLoopFramePolicies.js` with pure boolean resolvers for input blockers,
camera permissions, player movement, gameplay actions, nearby target queries,
ground guidance and world-space UI. `frame(now)` now reads flow state once,
delegates the repeated policies and uses small internal builders for placement
prompts and the camera debug payload. Frame ordering and snapshot shapes remain
unchanged. The frame body is approximately `4.9%` smaller than before this
round, while additional repeated condition chains are isolated behind tested
policies.

Passed:

```sh
npm test -- --run tests/gameLoopFramePolicies.test.js tests/gameLoopState.test.js
git diff --check
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The dev server returned `HTTP 200`. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1291` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures still cover Native Tree growth, safe-cell selection and
Wood drops. Manual gameplay validation remains pending because the in-app
browser backend was not available during this pass.

### Player Counter Prompt Runtime

Added `playerCounterPromptRuntime.js`. The runtime owns the current prompt,
expiry timestamp and quest-counter formatting. `createGameLoopState()` no
longer stores `playerCounterPrompt`.

Study path:

1. `createPlayerCounterPromptRuntime({ durationMs })` creates private prompt
   state.
2. Supply pickup adapters in `gameLoop.js` still resolve inventory labels and
   call `playerCounterPromptRuntime.trigger(text, now)`.
3. Water Gun quest progress calls
   `playerCounterPromptRuntime.triggerQuestCounter(...)`.
4. During snapshot preparation, `frame(now)` calls
   `playerCounterPromptRuntime.get(now)` and forwards the returned text without
   changing the existing HUD snapshot shape.

The supply adapters remain in `gameLoop.js` because they still depend on
`gameplay.getItemLabel()`, inventory reads and `formatResourcePickupPrompt()`.
Moving them now would widen the dependency surface without reducing runtime
ownership.

Passed:

```sh
npm test -- --run tests/playerCounterPromptRuntime.test.js tests/gameLoopState.test.js
git diff --check
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The dev server returned `HTTP 200`. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1295` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The four new runtime tests cover expiry, ignored empty text, bounded quest
counter formatting and preservation of an active prompt after an empty quest
counter update. Manual HUD prompt validation remains pending because the
in-app browser backend was not available during this pass.

### Camera Debug Runtime

Added `cameraDebugRuntime.js`. The runtime owns the debug overlay element, the
four-entry error buffer and global listener registration. `createGameLoopState()`
no longer stores `cameraDebugElement` or `cameraDebugErrors`.

Study path:

1. `CAMERA_DEBUG_ENABLED` in `gameLoop.js` continues to read
   `?cameraDebug=1`.
2. `startGameLoop()` creates `createCameraDebugRuntime({ enabled, mount })` and
   calls `attachGlobalListeners()` once.
3. The runtime listens for `error` and `unhandledrejection`, normalizes their
   messages and retains only the four latest records.
4. `updateCameraDebugFrameOverlay()` remains inside `startGameLoop()` because
   it assembles camera, quest and session data from orchestration-level
   dependencies.
5. The builder forwards that payload to `cameraDebugRuntime.update(payload)`.
   The runtime appends its private `errors` array and updates the same `<pre>`
   overlay shape and CSS used before the extraction.

Passed:

```sh
npm test -- --run tests/cameraDebugRuntime.test.js tests/gameLoopState.test.js
git diff --check
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The dev server returned `HTTP 200`. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1298` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The three new runtime tests cover disabled mode, listener forwarding with the
four-error limit and overlay element reuse. Manual `?cameraDebug=1` overlay
validation remains pending because the in-app browser backend was not
available during this pass.
