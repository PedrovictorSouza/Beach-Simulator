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
- Completed: extract the repair box reveal flash runtime.
- Completed: preflight and prepare the isolated workbench rotation runtime core.
- Completed: integrate the workbench rotation runtime through existing side-effect wrappers.
- Completed: review frame lifecycle ordering and run the final state audit.
- Completed: prepare the isolated companion lost hint runtime core.
- Completed: define the OpenSpec for incremental frame-runtime extraction.
- Completed: prepare the isolated game-loop frame clock.
- Completed: integrate the frame clock and remove `previousTime` from loop state.
- Completed: isolate the local gameplay frame-start context.
- Completed: prepare the narrow game-loop frame runtime boundary.
- Completed: integrate the narrow game-loop frame runtime boundary.
- Completed: route snapshot commits through the frame runtime.
- Completed: integrate the companion lost hint runtime.
- Completed: prepare the isolated Chopper attention cue runtime core.
- Completed: integrate the Chopper attention cue runtime.
- Completed: prepare the isolated run breadcrumb prompt runtime core.
- Completed: integrate the run breadcrumb prompt runtime.
- Completed: prepare Chopper cue sound-cycle ownership.
- Completed: integrate Chopper cue sound-cycle ownership.
- Completed: prepare the isolated companion follow direction runtime core.
- Completed: integrate the companion follow direction runtime.
- Completed: prepare the isolated repair box motion runtime core.
- Completed: integrate the repair box motion runtime.
- Completed: prepare the isolated Water Gun SFX burst runtime core.
- Completed: integrate the Water Gun SFX burst runtime.
- Completed: prepare the isolated field-move invalid-target prompt runtime
  core.
- Completed: integrate the field-move invalid-target prompt runtime.
- Completed: prepare the isolated world-cell planner click runtime core.
- Completed: integrate the world-cell planner click runtime.
- Completed: prepare the isolated movement quest runtime core.
- Next: keep camera and intro-room decisions local until a smaller tested
  boundary is identified, then integrate the prepared movement quest runtime.

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

### Repair Box Reveal Flash Runtime

Added `repairBoxRevealFlashRuntime.js`. The runtime owns the reveal flash DOM
element, opacity updates, projected gradient origin and the sinusoidal flash
pulse. `createGameLoopState()` no longer stores `repairBoxRevealFlashElement`.

Study path:

1. `startGameLoop()` creates `createRepairBoxRevealFlashRuntime(...)` with the
   stage mount, canvas, camera, tuning values and the existing
   `getEncounterRepairBoxPosition()` callback.
2. `updateBotRevealBoxOpening()` continues to own reveal-box gameplay timing
   and bot visibility. It delegates only visual flash work to
   `repairBoxRevealFlashRuntime.update({ opening, encounter })`.
3. The runtime derives progress from `opening.elapsed`, `flashStart` and
   `flashDuration`, then applies the existing `Math.sin(progress * Math.PI)`
   pulse.
4. The runtime projects the floating repair-box position into canvas space and
   preserves the same radial-gradient origin format.
5. Reset paths call `repairBoxRevealFlashRuntime.setOpacity(0)` so the existing
   element is hidden and reused.

The extraction also adds a guarded fallback to `"50% 55%"` when
`camera.project` is unavailable, matching the existing fallback used for
missing canvas or invalid projection data.

Passed:

```sh
npm test -- --run tests/repairBoxRevealFlashRuntime.test.js tests/gameLoopState.test.js
git diff --check
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The dev server returned `HTTP 200`. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1301` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The three new runtime tests cover projected origin and pulse calculation,
overlay hiding and reuse, and safe fallback behavior without a DOM mount or
camera projection. Manual reveal-flash validation remains pending because the
in-app browser backend was not available during this pass.

### Workbench Rotation Runtime Preparation

Added `workbenchRotationRuntime.js` as an isolated, tested core. It is not
imported by `gameLoop.js` yet, so this preparation step does not change active
gameplay behavior.

The preflight found that the current workbench rotation flow crosses several
responsibilities:

- candidate discovery from `session` and story flags;
- target-distance validation around the player;
- private selection state;
- rotation and size preview;
- HUD notices and audio events;
- Solar Station yaw synchronization;
- Train House, House and player-house visual tint;
- input cancel ordering;
- prompt selection and ground-cell snapshot preparation.

Moving all of those concerns in one commit would make regression diagnosis
difficult. The extraction is therefore split into a private state core and a
later integration pass.

Study path:

1. `createWorkbenchRotationRuntime(...)` receives four pure dependencies:
   `normalizePlacementYaw`, `getRotatedPlacementSize`, `getTargetSize` and
   `placementRotationStep`.
2. `select(target)` stores private pending yaw and size state.
3. `rotate(target, direction)` updates only the pending preview.
4. `confirm(target, { syncPlacementYaw })` applies yaw and size, optionally
   forwards Solar Station synchronization and clears selection.
5. `getSelectedTarget(candidates, { isTargetValid })` clears stale selection
   when the selected construction disappears or leaves the valid range.
6. `applySelectionTint()` and `getGroundCell()` preserve existing preview
   calculations without depending on `session`, HUD or audio.

The integration pass should keep candidate collection, notices, sound events
and input ordering in small wrappers inside `startGameLoop()` while replacing
direct reads and writes of `loopState.workbenchRotationSelection`. Only after
that integration is validated should the old field be removed from
`createGameLoopState()`.

Passed:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js
git diff --cached --check
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `1306` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The five new runtime tests cover selection and clear, pending yaw and size
rotation, confirmation, stale-target cleanup, tint and ground-cell preview
calculations. Manual gameplay validation is intentionally deferred until the
runtime is integrated into `gameLoop.js`.

### Workbench Rotation Runtime Integration

Integrated `createWorkbenchRotationRuntime()` into `startGameLoop()` and
removed `workbenchRotationSelection` from `createGameLoopState()`. The runtime
is now the only owner of pending selection, yaw and size state.

Study path:

1. Candidate collection remains in `getRotatableWorkbenchPlacementCandidates()`
   because it reads `session` objects and story flags.
2. `getSelectedRotatableWorkbenchPlacement()` forwards those candidates to
   `workbenchRotationRuntime.getSelectedTarget(...)` and keeps the existing
   player-distance invalidation callback local.
3. The local select, clear, rotate and confirm wrappers delegate private state
   changes to the runtime, then emit the existing HUD notices and sound events
   in their original order.
4. Solar Station confirmation passes `syncSolarStationPlacementYaw` only for
   the `solarStation` target, preserving its model-specific visual sync.
5. Train House, House, player-house and Solar Station model sync functions keep
   their existing call sites while reading preview yaw and tint through the
   runtime wrappers.
6. Placement cancel ordering remains unchanged: active workbench selection is
   still handled before placement previews and pending placement intents.
7. Snapshot preparation still builds the same workbench rotation ground-cell
   object through the runtime.

Passed:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js tests/workbenchRuntime.test.js tests/gameLoopState.test.js
git diff --check
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The dev server returned `HTTP 200`. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1306` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual validation is still required for selecting, rotating, canceling and
confirming each rotatable construction. The in-app browser backend was not
available during this pass.

### Frame Lifecycle Review And Final State Audit

Reviewed `frame(now)` without moving another subsystem. The lifecycle already
calculates the values required by input in the correct order:

1. Begin the frame snapshot, calculate timing and read flow state.
2. Update controls, handle pause and update the camera base state.
3. Start the gameplay opening frame and read its camera and movement locks.
4. Resolve placement preview state and foundation-build camera focus.
5. Resolve movement blockers before calling `gameplayInputRuntime.update(...)`.
6. Resolve camera input permissions before consuming camera movement.
7. Preserve the existing placement, player movement, simulation and snapshot
   preparation order.
8. Commit the frame snapshot before scheduling the next animation frame.

The audit found one remaining incomplete `loopState` migration:
`getPeriodicCompanionLostHint()` checked
`loopState.companionLostHintActive`, but spread an old bare
`companionLostHintActive` reference when returning an active hint. The spread
now reads `loopState.companionLostHintActive`, preventing a possible
`ReferenceError` without changing hint timing, text or position updates.

State audit classification:

- `companionFollowDirection`, `companionLostHintActive` and
  `companionLostHintActiveUntil` remain valid `createGameLoopState()` fields.
- `playerCounterPrompt` results refer only to
  `createPlayerCounterPromptRuntime()` and its tests.
- Snowstorm fog, ground action feedback, field-tool pulse, camera debug,
  repair-box flash and workbench rotation private state no longer remain in
  `gameLoop.js` or `gameLoopState.js`.

Passed:

```sh
git diff --check
npm test -- --run tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/workbenchRotationRuntime.test.js
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `14` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1306` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Chopper Attention Cue Runtime Preparation

Added `chopperAttentionCueRuntime.js` as an isolated, tested scheduler core. It
is not imported by `gameLoop.js` yet, so this preparation step does not change
active gameplay behavior.

The runtime intentionally owns only periodic cue scheduling:

1. `get(cue, now)` accepts an already resolved cue or `null`.
2. A valid cue starts the existing initial-delay window.
3. Once active, the runtime preserves the existing duration and repetition
   windows.
4. While active, it forwards the latest `worldPosition`, so the cue follows
   Chopper.
5. A missing cue resets the private timing schedule without reusing a
   `cycleId`.

The wake-guide task check, player-distance check, `"Hey!"` text, speech
priority and voice sound dispatch remain in `gameLoop.js`. This keeps the
preparation independent from narrative, world-space UI and audio behavior.

The next integration pass should:

1. Create `createChopperAttentionCueRuntime(...)` inside `startGameLoop()`.
2. Keep the wake-guide and distance checks local.
3. Replace the timing internals of `getPeriodicChopperAttentionCue(...)` with
   `chopperAttentionCueRuntime.get(cue, now)`.
4. Remove `chopperAttentionCueNextAt`, `chopperAttentionCueActiveUntil` and
   `chopperAttentionCueCycleId` from `createGameLoopState()`.
5. Keep `chopperAttentionCueSoundCycleId` local until audio dispatch receives
   its own narrow ownership boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/chopperAttentionCueRuntime.test.js tests/companionLostHintRuntime.test.js tests/gameLoopState.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `10` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1323` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Chopper Attention Cue Runtime Integration

Integrated `createChopperAttentionCueRuntime()` into `startGameLoop()` and
removed the three migrated scheduler fields from `createGameLoopState()`.

Study path:

1. `getPeriodicChopperAttentionCue(...)` still owns the wake-guide task check,
   player-distance check, `"Hey!"` text and current Chopper position.
2. The helper passes a resolved cue or `null` to
   `chopperAttentionCueRuntime.get(cue, now)`.
3. The runtime owns the initial delay, repetition window, active lifetime and
   `cycleId`.
4. `chopperAttentionCueSoundCycleId` remains in `createGameLoopState()` and
   the existing world-speech branch still uses it to dispatch one voice sound
   per visible cycle.
5. Speech priority and snapshot writes are unchanged.

Passed:

```sh
rg -n "loopState\\.chopperAttentionCue(NextAt|ActiveUntil|CycleId)|resetChopperAttentionCueSchedule|createChopperAttentionCueRuntime|chopperAttentionCueSoundCycleId" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/chopperAttentionCueRuntime.test.js tests/companionLostHintRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `18` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1323` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Run Breadcrumb Prompt Runtime Preparation

Added `runBreadcrumbPromptRuntime.js` as an isolated, tested one-shot prompt
core. It is not imported by `gameLoop.js` yet, so this preparation step does
not change active gameplay behavior.

The runtime intentionally owns only prompt lifetime state:

1. `trigger(now)` exposes the prompt for the configured duration the first
   time it is called.
2. Further `trigger(now)` calls return `false`, including after the prompt
   expires.
3. `isVisible(now)` preserves the existing strict `until > now` visibility
   check.
4. Each factory call owns independent private state.

The movement threshold, opening and tutorial blockers, `learn-to-move` quest
check, run-input check, prompt text and world-space UI priority remain in
`gameLoop.js`.

The next integration pass should:

1. Create `createRunBreadcrumbPromptRuntime(...)` inside `startGameLoop()`.
2. Keep the existing movement and tutorial condition local.
3. Replace the two direct state writes with
   `runBreadcrumbPromptRuntime.trigger(now)`.
4. Replace the visibility read with
   `runBreadcrumbPromptRuntime.isVisible(now)`.
5. Remove `runBreadcrumbPromptShown` and `runBreadcrumbPromptUntil` from
   `createGameLoopState()`.

Passed:

```sh
git diff --check
npm test -- --run tests/runBreadcrumbPromptRuntime.test.js tests/gameLoopState.test.js tests/chopperAttentionCueRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `9` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1326` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Run Breadcrumb Prompt Runtime Integration

Integrated `createRunBreadcrumbPromptRuntime()` into `startGameLoop()` and
removed `runBreadcrumbPromptShown` and `runBreadcrumbPromptUntil` from
`createGameLoopState()`.

Study path:

1. The existing movement, opening lock, tutorial, `learn-to-move` quest and
   run-input checks remain local in `frame(now)`.
2. When those checks pass, the frame calls
   `runBreadcrumbPromptRuntime.trigger(now)`.
3. The runtime owns the one-shot guard and configured visibility lifetime.
4. World-space UI gating now asks
   `runBreadcrumbPromptRuntime.isVisible(now)`.
5. Prompt text, placement in the priority chain and snapshot writes are
   unchanged.

Passed:

```sh
rg -n "loopState\\.runBreadcrumbPrompt|createRunBreadcrumbPromptRuntime|runBreadcrumbPromptRuntime" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/runBreadcrumbPromptRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js tests/chopperAttentionCueRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `17` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1326` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Chopper Cue Sound Cycle Ownership Preparation

Extended `createChopperAttentionCueRuntime()` with a private sound-cycle
deduplication API. `gameLoop.js` does not call the new method yet, so this
preparation step does not change active gameplay behavior.

Study path:

1. The runtime already creates a monotonically increasing `cycleId` for each
   visible Chopper attention cue window.
2. `consumeSoundCycle(cycleId)` returns `true` only for the first consumption
   of a cycle and `false` for repeated calls.
3. The runtime does not import audio dependencies and does not dispatch sound.
4. The active `gameLoop.js` branch still uses
   `loopState.chopperAttentionCueSoundCycleId` until the next integration
   pass.

The next integration pass should:

1. Replace the direct sound-cycle comparison and assignment with
   `chopperAttentionCueRuntime.consumeSoundCycle(chopperAttentionCue.cycleId)`.
2. Keep `playSoundEvent(SOUND_EVENT_IDS.CHOPPER_VOICE)` in `gameLoop.js`.
3. Remove `chopperAttentionCueSoundCycleId` from `createGameLoopState()`.

Passed:

```sh
git diff --check
npm test -- --run tests/chopperAttentionCueRuntime.test.js tests/gameLoopState.test.js tests/runBreadcrumbPromptRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `10` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1327` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Chopper Cue Sound Cycle Ownership Integration

Integrated `chopperAttentionCueRuntime.consumeSoundCycle(cycleId)` into the
existing world-speech branch and removed `chopperAttentionCueSoundCycleId`
from `createGameLoopState()`.

Study path:

1. `chopperAttentionCueRuntime.get(...)` still creates the visible cue and its
   monotonically increasing `cycleId`.
2. The existing speech-priority branch still decides whether Chopper speech
   can be shown.
3. When the branch is active, `consumeSoundCycle(cycleId)` returns `true` only
   for the first frame of that cycle.
4. `playSoundEvent(SOUND_EVENT_IDS.CHOPPER_VOICE)` remains in `gameLoop.js` at
   the same point.
5. `createGameLoopState()` no longer stores any Chopper attention-cue state.

Passed:

```sh
rg -n "chopperAttentionCueSoundCycleId|consumeSoundCycle|CHOPPER_VOICE" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/chopperAttentionCueRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js tests/runBreadcrumbPromptRuntime.test.js tests/soundEventRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `24` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1327` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Companion Follow Direction Runtime Preparation

Added `companionFollowDirectionRuntime.js` as an isolated, tested direction
memory core. It is not imported by `gameLoop.js` yet, so this preparation step
does not change active gameplay behavior.

The runtime intentionally owns only companion follow-direction memory:

1. `update(deltaX, deltaZ)` preserves the existing `0.0005` movement threshold.
2. Valid movement stores a normalized planar direction.
3. `get(playerYaw)` returns the stored movement direction when available.
4. Before movement establishes a direction, `get(playerYaw)` preserves the
   existing player-yaw fallback.
5. Without movement or a finite yaw, the existing `[0, -1]` default remains.

Formation spacing, follow distance, follow speed, target-position assembly and
companion movement remain in `gameLoop.js`.

The next integration pass should:

1. Create `createCompanionFollowDirectionRuntime()` inside `startGameLoop()`.
2. Replace `updateCompanionFollowDirection(...)` with
   `companionFollowDirectionRuntime.update(...)`.
3. Replace `getCompanionFollowDirection()` with
   `companionFollowDirectionRuntime.get(session.playerModelInstance?.yaw)`.
4. Remove `companionFollowDirection` from `createGameLoopState()`.

Passed:

```sh
git diff --check
npm test -- --run tests/companionFollowDirectionRuntime.test.js tests/companionFollowFormation.test.js tests/gameLoopState.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `11` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1332` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Companion Follow Direction Runtime Integration

Integrated `createCompanionFollowDirectionRuntime()` into `startGameLoop()`
and removed `companionFollowDirection` from `createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private direction runtime for the gameplay
   loop instance.
2. Player movement now calls `companionFollowDirectionRuntime.update(...)` at
   the same point after position updates.
3. Companion target-position assembly asks
   `companionFollowDirectionRuntime.get(session.playerModelInstance?.yaw)`.
4. The runtime preserves normalization, the `0.0005` threshold, player-yaw
   fallback and `[0, -1]` default.
5. Formation spacing, follow distance, follow speed and companion movement
   remain in `gameLoop.js`.

Passed:

```sh
rg -n "loopState\\.companionFollowDirection|updateCompanionFollowDirection|getCompanionFollowDirection|createCompanionFollowDirectionRuntime|companionFollowDirectionRuntime" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/companionFollowDirectionRuntime.test.js tests/companionFollowFormation.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `19` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1332` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Repair Box Motion Runtime Preparation

Added `repairBoxMotionRuntime.js` as an isolated, tested visual-motion core. It
is not imported by `gameLoop.js` yet, so this preparation step does not change
active gameplay behavior.

The runtime intentionally owns only repair-box motion state:

1. `update(deltaTime)` accumulates the same clamped frame delta forwarded by
   the existing frame runtime callback.
2. `getFloatOffset(position)` preserves the existing float height and
   `Math.sin(elapsed * bobSpeed) * bobHeight` calculation.
3. `getYaw(baseYaw)` preserves the existing `baseYaw + elapsed * spinSpeed`
   calculation.
4. Each factory call owns independent private elapsed state.

Repair-box model sync, opening progress, reveal flash, DOM overlay and all four
visual tuning constants remain unchanged.

The next integration pass should:

1. Create `createRepairBoxMotionRuntime(...)` inside `startGameLoop()` with the
   existing float, bob and spin constants.
2. Route the frame runtime `advanceElapsed(deltaTime)` callback to
   `repairBoxMotionRuntime.update(deltaTime)`.
3. Replace `getRepairBoxFloatOffset(...)` with
   `repairBoxMotionRuntime.getFloatOffset(...)`.
4. Replace the inline spin-yaw calculation with
   `repairBoxMotionRuntime.getYaw(instance.repairBoxBaseYaw)`.
5. Remove `repairBoxElapsed` from `createGameLoopState()` and its state
   contract test.

Passed:

```sh
git diff --check
npm test -- --run tests/repairBoxMotionRuntime.test.js tests/repairBoxRevealFlashRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `13` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1335` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Repair Box Motion Runtime Integration

Integrated `createRepairBoxMotionRuntime()` into `startGameLoop()` and removed
`repairBoxElapsed` from `createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private motion runtime using the four existing
   repair-box visual tuning constants.
2. The frame runtime keeps the same `advanceElapsed(deltaTime)` callback point,
   but forwards the clamped frame delta to `repairBoxMotionRuntime.update(...)`.
3. Repair-box model sync asks `repairBoxMotionRuntime.getFloatOffset(...)` for
   the same float-height and sine-bob offset.
4. Repair-box model sync asks `repairBoxMotionRuntime.getYaw(...)` for the same
   base-yaw plus elapsed-spin calculation.
5. Opening progress, opened-box pose, reveal flash and model synchronization
   remain in `gameLoop.js`.

Passed:

```sh
rg -n "repairBoxElapsed|getRepairBoxFloatOffset|repairBoxMotionRuntime" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/repairBoxMotionRuntime.test.js tests/repairBoxRevealFlashRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `16` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1335` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Water Gun SFX Burst Runtime Preparation

Added `waterGunSfxBurstRuntime.js` as an isolated, tested temporal core. It is
not imported by `gameLoop.js` yet, so this preparation step does not change
active gameplay behavior.

The runtime intentionally owns only the temporary SFX extension window:

1. `trigger(nowSeconds, durationSeconds)` extends `untilSeconds` with the same
   `Math.max(...)` rule used by the loop.
2. `isActive(nowSeconds)` preserves the existing strict
   `nowSeconds < untilSeconds` check.
3. Retriggering with a shorter window cannot shorten an active burst.
4. Each factory call owns independent private state.

Water Gun action phases, stamina, field-move tuning, particles and
`audio.updateWaterGun(...)` remain unchanged.

The next integration pass should:

1. Create `createWaterGunSfxBurstRuntime()` inside `startGameLoop()`.
2. Route `triggerWaterGunSfxBurst(duration)` to
   `waterGunSfxBurstRuntime.trigger(getRuntimeNowSeconds(), duration)`.
3. Replace the inline SFX extension-window comparison with
   `waterGunSfxBurstRuntime.isActive(now * 0.001)`.
4. Remove `waterGunSfxBurstUntilSeconds` from `createGameLoopState()` and its
   state contract test.

Passed:

```sh
git diff --check
npm test -- --run tests/waterGunSfxBurstRuntime.test.js tests/gameLoopState.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `6` tests and the dev server returned `HTTP 200`.
`npm test` completed with the existing Leafage Native Tree baseline:

- `1339` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Water Gun SFX Burst Runtime Integration

Integrated `createWaterGunSfxBurstRuntime()` into `startGameLoop()` and removed
`waterGunSfxBurstUntilSeconds` from `createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private SFX burst runtime.
2. The existing five gameplay call sites still call
   `triggerWaterGunSfxBurst()` at the same points.
3. `triggerWaterGunSfxBurst(duration)` forwards the existing runtime clock and
   duration to `waterGunSfxBurstRuntime.trigger(...)`.
4. `audio.updateWaterGun(...)` keeps the existing active spray-phase check and
   asks `waterGunSfxBurstRuntime.isActive(now * 0.001)` for the extension
   window.
5. Water Gun action state, stamina, particles, targeting and audio internals
   remain unchanged.

Passed:

```sh
rg -n "waterGunSfxBurstUntilSeconds|triggerWaterGunSfxBurst|createWaterGunSfxBurstRuntime|waterGunSfxBurstRuntime|audio\\.updateWaterGun" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/waterGunSfxBurstRuntime.test.js tests/gameLoopState.test.js tests/soundEventRuntime.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `20` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1339` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Field-Move Invalid-Target Prompt Runtime Preparation

Added `fieldMoveInvalidTargetPromptRuntime.js` as an isolated, tested temporal
core. It is not imported by `gameLoop.js` yet, so this preparation step does
not change active gameplay behavior.

The runtime intentionally owns only the two visibility clocks:

1. `triggerLeafage(now)` and `triggerFire(now)` preserve the existing
   `now + durationMs` windows.
2. `resetLeafage()` and `resetFire()` preserve the existing explicit resets.
3. `isLeafageVisible(now)` and `isFireVisible(now)` preserve the existing
   strict `until > now` checks.
4. Leafage and Fire clocks remain independent.
5. Each factory call owns independent private state.

Field-move target decisions, texts, durations, cancel SFX, world-prompt
priority and HUD snapshot writes remain unchanged in `gameLoop.js`.

The next integration pass should:

1. Create `createFieldMoveInvalidTargetPromptRuntime(...)` inside
   `startGameLoop()` with the two existing duration constants.
2. Replace direct Leafage and Fire clock writes with the explicit trigger and
   reset methods.
3. Replace the two inline visibility comparisons with the runtime queries.
4. Remove `leafageInvalidTargetPromptUntil` and
   `fireInvalidTargetPromptUntil` from `createGameLoopState()`.

Passed:

```sh
git diff --check
npm test -- --run tests/fieldMoveInvalidTargetPromptRuntime.test.js tests/gameLoopState.test.js tests/groundActionFeedbackRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `11` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1343` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Field-Move Invalid-Target Prompt Runtime Integration

Integrated `createFieldMoveInvalidTargetPromptRuntime()` into
`startGameLoop()` and removed `leafageInvalidTargetPromptUntil` and
`fireInvalidTargetPromptUntil` from `createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private prompt runtime using the two existing
   duration constants.
2. Successful Leafage-related actions keep resetting the Leafage clock at the
   same three branches.
3. Successful Fire actions keep resetting the Fire clock at the same branch.
4. Invalid Leafage and Fire actions keep playing cancel SFX, then trigger their
   respective clock with the existing frame timestamp.
5. World-space prompt gating keeps the same player and UI conditions and asks
   the runtime whether each prompt is visible.
6. Prompt messages, prompt ordering, target decisions and HUD snapshot writes
   remain in `gameLoop.js`.

Passed:

```sh
rg -n "leafageInvalidTargetPromptUntil|fireInvalidTargetPromptUntil|createFieldMoveInvalidTargetPromptRuntime|fieldMoveInvalidTargetPromptRuntime" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/fieldMoveInvalidTargetPromptRuntime.test.js tests/gameLoopState.test.js tests/groundActionFeedbackRuntime.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `19` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1343` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### World-Cell Planner Click Runtime Preparation

Added `worldCellPlannerClickRuntime.js` as an isolated, tested mailbox core. It
is not imported by `gameLoop.js` yet, so this preparation step does not change
active gameplay behavior.

The runtime intentionally owns only the pending debug-planner click:

1. `queue({ clientX, clientY })` stores the next click request.
2. A newer queued click replaces an older unconsumed request, preserving the
   existing latest-click-wins behavior.
3. `consume()` returns the queued request once and clears it.
4. Each factory call owns independent private state.

The pointer listener, planner-active guard, ground-cell projection, nearest-cell
pick, session selection, rendering callback and HUD notices remain unchanged in
`gameLoop.js`.

The next integration pass should:

1. Create `createWorldCellPlannerClickRuntime()` inside `startGameLoop()`.
2. Route accepted pointer events to `worldCellPlannerClickRuntime.queue(...)`.
3. Read the pending request through
   `worldCellPlannerClickRuntime.consume()` at the existing frame-processing
   point.
4. Remove `pendingWorldCellPlannerClick` from `createGameLoopState()` and its
   state contract test.

Passed:

```sh
git diff --check
npm test -- --run tests/worldCellPlannerClickRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `11` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1347` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### World-Cell Planner Click Runtime Integration

Integrated `createWorldCellPlannerClickRuntime()` into `startGameLoop()` and
removed `pendingWorldCellPlannerClick` from `createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private planner-click mailbox runtime.
2. The existing pointer listener keeps the same active-planner, primary-button
   and editable-target guards.
3. Accepted pointer events now call `worldCellPlannerClickRuntime.queue(...)`
   with the same viewport coordinates.
4. The existing frame-processing function calls
   `worldCellPlannerClickRuntime.consume()` once at its start.
5. Planner-active revalidation, ground-cell projection, nearest-cell pick,
   session selection, rendering callback and HUD notices remain in
   `gameLoop.js`.

Passed:

```sh
rg -n "pendingWorldCellPlannerClick|createWorldCellPlannerClickRuntime|worldCellPlannerClickRuntime|handleWorldCellPlannerPointerDown|processWorldCellPlannerClick" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/worldCellPlannerClickRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `14` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1347` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Movement Quest Runtime Preparation

Added `movementQuestRuntime.js` as an isolated, tested progression core. It is
not imported by `gameLoop.js` yet, so this preparation step does not change
active gameplay behavior.

The runtime intentionally owns only movement accumulation and report
acknowledgement:

1. `update({ active, movedDistance, reportMovement })` ignores inactive quest
   frames.
2. Movement at or below the existing `0.0005` minimum is ignored.
3. Accepted movement accumulates until the existing `0.04` report threshold.
4. Once the threshold is reached, the runtime calls the supplied reporter and
   preserves the existing acknowledgement rule: `changed` or a non-empty
   `completedQuestIds`.
5. An unacknowledged report is retried on later accepted movement.
6. Each factory call owns independent private state.

The `learn-to-move` quest lookup, `MOVE` event payload, gameplay adapter and
quest side effects remain unchanged in `gameLoop.js`.

The next integration pass should:

1. Create `createMovementQuestRuntime(...)` inside `startGameLoop()` with the
   existing `0.0005` minimum and `0.04` report threshold.
2. Replace the local accumulation block with
   `movementQuestRuntime.update(...)`.
3. Keep the active-system-quest lookup and `gameplay.recordQuestEvent(...)`
   callback in `gameLoop.js`.
4. Remove `movementQuestReported` and `movementQuestDistance` from
   `createGameLoopState()` and its state contract test.

Passed:

```sh
git diff --check
npm test -- --run tests/movementQuestRuntime.test.js tests/gameLoopState.test.js tests/questFlowGuards.test.js tests/createMissionSystemAdapter.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `19` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1352` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Companion Lost Hint Runtime Preparation

Added `companionLostHintRuntime.js` as an isolated, tested scheduler core. It is
not imported by `gameLoop.js` yet, so this preparation step does not change
active gameplay behavior.

The runtime intentionally owns only periodic hint scheduling:

1. `get(hint, now)` accepts an already resolved hint or `null`.
2. A new hint key starts the existing initial-delay window.
3. Once active, the runtime preserves the existing duration and repetition
   windows.
4. While active, it keeps the stored copy but forwards the latest
   `worldPosition`, so speech follows a moving companion.
5. A missing hint resets the private schedule.

The Water Gun quest checks, Squirtle and Bulbasaur position lookup, speech
priority and world-speech snapshot writes remain in `gameLoop.js`. This keeps
the preparation independent from narrative and rendering behavior.

The next integration pass should:

1. Create `createCompanionLostHintRuntime(...)` inside `startGameLoop()`.
2. Keep `resolveWaterGunCompanionLostHint(...)` local.
3. Replace `getPeriodicCompanionLostHint(...)` scheduling internals with
   `companionLostHintRuntime.get(hint, now)`.
4. Remove `companionLostHintKey`, `companionLostHintNextAt`,
   `companionLostHintActiveUntil` and `companionLostHintActive` from
   `createGameLoopState()`.

Passed:

```sh
git diff --check
npm test -- --run tests/companionLostHintRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The four new runtime tests cover initial delay and expiration, moving companion
position forwarding, key-change and missing-hint reset, and repeat scheduling.
The dev server returned `HTTP 200`. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1310` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Game Loop Frame Clock Preparation

Added `gameLoopFrameClock.js` as the first implementation slice from
`openspec/changes/extract-game-loop-frame-runtime`. It is not imported by
`gameLoop.js` yet, so frame timing behavior is unchanged in active gameplay.

Study path:

1. `createGameLoopFrameClock({ now, maxDeltaTime })` stores private
   `previousTime`.
2. `update(nextTime)` calculates non-negative `rawDeltaTime` in seconds.
3. It returns `deltaTime` with the existing `0.033` maximum supplied as
   configuration.
4. It advances the private previous-frame timestamp after each update.
5. `gameLoop.js` still performs the existing inline calculation until the next
   integration slice.

The next integration pass should create the clock inside `startGameLoop()`,
replace the three inline timing statements with `frameClock.update(now)` and
remove `previousTime` from `createGameLoopState()`.

Passed:

```sh
git diff --check
npm test -- --run tests/gameLoopFrameClock.test.js tests/gameLoopFramePolicies.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
openspec validate extract-game-loop-frame-runtime --strict
```

The focused suite passed with `11` tests. The four new clock tests cover normal
elapsed time, simulation clamp, backward time and sequential updates. The dev
server returned `HTTP 200` and the OpenSpec change remained valid in strict
mode. `npm test` completed with the existing Leafage Native Tree baseline:

- `1314` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Game Loop Frame Runtime Preparation

Added `gameLoopFrameRuntime.js` as an isolated, tested orchestration boundary.
It is not imported by `gameLoop.js` yet, so active frame behavior remains
unchanged during this preparation slice.

The runtime stays intentionally narrow:

1. `beginFrame(now)` begins the snapshot, asks `frameClock` for timing, updates
   the FPS panel, advances elapsed visual time through a callback and reads
   flow state.
2. `updateInputAndCheckPaused(deltaTime)` updates gamepads and returns whether
   the frame is paused.
3. When paused, it clears pending actions and movement input exactly once.
4. It does not call `requestAnimationFrame`, commit snapshots, run opening,
   update placement or implement gameplay rules.

The two-method API is deliberate. `gameLoop.js` currently updates the repaired
plant session flag after reading flow state and before updating gamepads. The
future integration can keep that rule in place between
`frameRuntime.beginFrame(now)` and
`frameRuntime.updateInputAndCheckPaused(deltaTime)`.

The next integration pass should:

1. Create `createGameLoopFrameRuntime(...)` inside `startGameLoop()`.
2. Replace snapshot, timing, FPS, elapsed and flow-state setup with
   `frameRuntime.beginFrame(now)`.
3. Preserve the repaired-plant session update in its current relative order.
4. Replace the inline gamepad and pause block with
   `frameRuntime.updateInputAndCheckPaused(deltaTime)`.
5. Keep all three `requestAnimationFrame(frame)` calls in `startGameLoop()`.

Passed:

```sh
git diff --check
npm test -- --run tests/gameLoopFrameRuntime.test.js tests/gameLoopFrameClock.test.js tests/gameLoopFramePolicies.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `15` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1318` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Frame Snapshot Commit Ownership

Expanded `createGameLoopFrameRuntime()` with a narrow `commitFrame()` method.
Both snapshot commits now delegate through the runtime, while `frame(now)`
continues to decide when a commit occurs.

Study path:

1. `frameRuntime.beginFrame(now)` starts the working snapshot.
2. If the intro room consumes the frame, `frame(now)` calls
   `frameRuntime.commitFrame()`, schedules the next frame and returns.
3. For a normal gameplay frame, snapshot channels continue to be populated in
   their existing order.
4. At the end, `frame(now)` calls `frameRuntime.commitFrame()` and schedules the
   next frame.
5. `gameLoopFrameRuntime.js` delegates both commits to
   `frameSnapshotController.commitFrame()`.

The preflight deliberately stopped here:

- Moving the intro-room condition would require scene, camera, canvas, snapshot
  and timing dependencies without reducing domain coupling.
- Moving camera update or camera-input consumption would mix camera policy,
  controls and tutorial side effects into the generic frame runtime.
- Moving `requestAnimationFrame(frame)` would violate the OpenSpec ownership
  rule that scheduling stays in `startGameLoop()`.

Passed:

```sh
rg -n "frameSnapshotController\\.commitFrame|frameRuntime\\.commitFrame|requestAnimationFrame\\(frame\\)" app/runtime/gameLoop.js app/runtime/gameLoopFrameRuntime.js tests/gameLoopFrameRuntime.test.js
git diff --check
npm test -- --run tests/gameLoopFrameRuntime.test.js tests/frameSnapshotController.test.js tests/gameLoopFrameClock.test.js tests/gameLoopFramePolicies.test.js tests/gameplayOpeningShip.test.js tests/introRoomScene.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `28` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1319` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Game Loop Frame Runtime Integration

Integrated `createGameLoopFrameRuntime()` into `startGameLoop()` without moving
animation-frame scheduling or domain behavior.

Study path:

1. `startGameLoop()` creates `frameRuntime` after the snapshot and FPS panel
   controllers are available.
2. `frameRuntime.beginFrame(now)` now owns snapshot start, clock update, FPS
   panel update, repair-box elapsed callback and flow-state read.
3. `frame(now)` still applies the repaired-plant session flag immediately after
   flow-state reading.
4. `frameRuntime.updateInputAndCheckPaused(deltaTime)` runs next, preserving
   gamepad update and pause input clearing order.
5. On pause, `frame(now)` still schedules the next animation frame and returns.
6. Intro-room early commit, opening, camera permissions, simulation, render
   snapshot population, final commit and all `requestAnimationFrame(frame)`
   calls remain in `gameLoop.js`.

The boundary is intentionally narrow. Moving intro-room commit or final frame
commit into the runtime now would require passing wider orchestration callbacks
and would reduce readability without removing domain coupling. Any expansion
should start with a new preflight and a separately testable contract.

Passed:

```sh
rg -n "frameRuntime|requestAnimationFrame\\(frame\\)|controls\\.updateGamepads|controls\\.isPaused|frameClock\\.update|fpsPanelController\\.update|loopState\\.repairBoxElapsed \\+=" app/runtime/gameLoop.js app/runtime/gameLoopFrameRuntime.js
git diff --check
npm test -- --run tests/gameLoopFrameRuntime.test.js tests/gameLoopFrameClock.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopState.test.js tests/gameplayOpeningShip.test.js tests/placementCameraAssist.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `21` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1318` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Gameplay Frame Start Context

Added the internal `beginGameplayFrameContext(...)` helper inside
`startGameLoop()`. The review rejected a separate pure builder because it would
only forward values while leaving the meaningful side effects scattered across
`frame(now)`.

Study path:

1. `frame(now)` still reads flow state before any opening work.
2. After base camera and interactable synchronization,
   `beginGameplayFrameContext(...)` runs the existing opening `beginFrame`.
3. It reads opening camera and movement locks immediately afterward.
4. It checks active placement previews and updates `placementCameraAssist`.
5. It updates foundation-build camera focus.
6. It calls the existing tested `resolveGameLoopBlockers(...)` policy last.
7. It returns one context object for `frame(now)` to destructure before
   updating `gameplayInputRuntime`.

This keeps all side effects and their order unchanged while removing detailed
opening, placement-assist and blocker assembly from the main frame body. The
helper remains local because its dependencies belong to `startGameLoop()`;
creating a new external runtime for this block would widen the dependency
surface without adding ownership value.

Passed:

```sh
git diff --check
npm test -- --run tests/gameLoopFramePolicies.test.js tests/gameLoopFrameClock.test.js tests/gameLoopState.test.js tests/gameplayOpeningShip.test.js tests/placementCameraAssist.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `17` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1314` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Game Loop Frame Clock Integration

Integrated `createGameLoopFrameClock()` into `startGameLoop()` and removed
`previousTime` from `createGameLoopState()`. Frame timing now has one explicit
owner.

Study path:

1. `startGameLoop()` creates `frameClock` with the same initial
   `performance.now()` or `Date.now()` fallback previously used by
   `createGameLoopState()`.
2. The clock receives the existing `0.033` simulation-delta maximum.
3. At the start of `frame(now)`, `frameClock.update(now)` returns
   `{ rawDeltaTime, deltaTime }`.
4. `fpsPanelController.update(rawDeltaTime)` still receives unclamped timing.
5. Simulation paths still receive the clamped `deltaTime`.
6. `createGameLoopState()` no longer stores timing state unrelated to its
   remaining gameplay-loop fields.

The next frame-runtime slice is a review step: only add a frame-start context
builder if it removes real orchestration complexity without moving gameplay
rules or changing lifecycle order.

Passed:

```sh
rg -n "previousTime" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/gameLoopFrameClock.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopState.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `13` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1314` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Companion Lost Hint Runtime Integration

Integrated `createCompanionLostHintRuntime()` into `startGameLoop()` and
removed the four migrated companion-hint scheduler fields from
`createGameLoopState()`.

Study path:

1. `resolveWaterGunCompanionLostHint(...)` remains local and still owns the
   Water Gun quest checks and current companion-position lookup.
2. `getPeriodicCompanionLostHint(...)` resolves the current hint and delegates
   scheduling to `companionLostHintRuntime.get(hint, now)`.
3. The runtime owns the initial delay, repetition window, active lifetime and
   latest-position forwarding.
4. The world-speech priority chain and snapshot writes are unchanged.
5. `createGameLoopState()` no longer stores scheduler state owned by the
   runtime.

Passed:

```sh
rg -n "loopState\\.companionLostHint|resetCompanionLostHintSchedule|createCompanionLostHintRuntime|getPeriodicCompanionLostHint" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/companionLostHintRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `14` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1319` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.
