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
- Completed: preserve lazy movement-quest activity lookup before integration.
- Completed: integrate the movement quest runtime.
- Completed: prepare the isolated wood collect pop runtime core.
- Completed: integrate the wood collect pop runtime.
- Completed: prepare the isolated gear pickup particle runtime core.
- Completed: integrate the gear pickup particle runtime.
- Completed: prepare the isolated foundation build-zone camera focus scheduler.
- Completed: preserve foundation-focus side-effect order before integration.
- Completed: integrate the foundation build-zone camera focus scheduler.
- Completed: prepare the isolated tree-revival leaf-burst runtime core.
- Completed: integrate the tree-revival leaf-burst runtime.
- Completed: prepare the isolated landscape-cut effect runtime core.
- Completed: integrate the landscape-cut effect runtime.
- Completed: prepare the isolated save-point star billboard helper.
- Completed: integrate the save-point star billboard helper.
- Completed: prepare the isolated Leppa Tree mission-particle billboard
  helper.
- Completed: integrate the Leppa Tree mission-particle billboard helper.
- Completed: prepare the isolated Bulbasaur interaction-radius gizmo helper.
- Completed: integrate the Bulbasaur interaction-radius gizmo helper.
- Completed: prepare the isolated repair-box reveal ray helper.
- Completed: integrate the repair-box reveal ray helper.
- Completed: prepare the isolated rustling-grass particle helper.
- Completed: integrate the rustling-grass particle helper.
- Completed: prepare the isolated leaf billboard helper.
- Completed: integrate the leaf billboard helper.
- Completed: prepare the isolated flower arrangement billboard helper.
- Completed: integrate the flower arrangement billboard helper.
- Completed: prepare the isolated grass player bend helper.
- Completed: integrate the grass player bend helper.
- Completed: prepare the isolated tall grass motion helper.
- Completed: integrate the tall grass motion helper.
- Completed: move tall grass instance scale math into the tall grass helper.
- Completed: extract the interaction info billboard helper.
- Completed: extract the train house dance helper.
- Completed: extract the mission target indicator billboard helper.
- Completed: extract the Leppa Tree music notes helper.
- Completed: extract the Campfire wood pile billboard helper.
- Completed: extract the Repair Box particle target helpers.
- Completed: extract the Repair Box prompt target helper.
- Completed: extract the mission target position helper.
- Completed: extract the collectible source snapshot helper.
- Completed: extract the supply pickup viewport origin helper.
- Completed: extract the world cell planner picking helper.
- Completed: extract the bot reveal motion helper.
- Completed: extract the player model motion helper.
- Completed: extract the model facing helper.
- Completed: extract the interaction debug collider helper.
- Completed: extract the camera debug frame-state helper.
- Completed: extract the Rebirth of Nature ghost-tree helper.
- Completed: extract the mission target position lookup helper.
- Completed: extract the player movement frame helper.
- Completed: extract the camera input frame helper.
- Completed: extract the gameplay input frame helper.
- Completed: extract the gameplay presentation frame helper.
- Completed: extract the early gameplay control frame helper.
- Completed: extract the frame scene sync helper.
- Completed: extract the gameplay camera frame helper.
- Completed: extract the passive effect frame helper.
- Completed: extract the render snapshot context helper.
- Completed: extract the ground-cell highlight frame helper.
- Completed: extract the lightweight UI snapshot frame helpers.
- Completed: extract the base render snapshot frame helper.
- Completed: extract the world-space UI context frame helper.
- Completed: extract the world speech snapshot frame helper.
- Completed: extract the world prompt snapshot frame helper.
- Completed: extract the HUD prompt copy frame helper.
- Completed: extract the frame prompt target-state helper.
- Completed: extract the follower call frame helper.
- Completed: extract the ambient world simulation frame helper.
- Completed: extract the companion follow motion helper.
- Completed: move companion follow motion into the `companions` boundary.
- Completed: extract the companion follow formation policy.
- Completed: extract the companion follow membership policy.
- Completed: move companion follow direction runtime into the `companions` boundary.
- Completed: move companion lost hint runtime into the `companions` boundary.
- Completed: move camera debug modules into the `camera` boundary.
- Completed: move foundation build zone camera focus runtime into the `camera`
  boundary.
- Completed: move camera zoom preset controller into the `camera` boundary.
- Completed: move player movement tuning into the `movement` boundary and
  preserve the companion follow spacing contract.
- Completed: move dialogue camera controller into the `camera` boundary.
- Completed: move placement camera assist into the `camera` boundary.
- Next: select the next small visual helper boundary without moving placement,
  construction, music, field moves or camera rules.

## Validation Log

### Placement Camera Assist Boundary Move

Moved `createPlacementCameraAssist()` from root-level `app/runtime` into
`app/runtime/camera/`.

Boundary classification: `camera runtime/debug`, with placement state consumed
as input from the existing construction/placement flow.

Study path:

1. `app/runtime/camera/placementCameraAssist.js` owns only camera preset
   switching while placement preview is active.
2. `gameLoop.js` still computes `placementPreviewActive` and calls the assist in
   the same frame position.
3. Placement rules, blockers, previews and contracts stayed in their current
   modules.
4. The assist implementation was moved without logic changes.
5. `frame(now)` order was not changed.

This cut reduces root-level `app/runtime` sprawl and keeps camera-specific
placement assistance beside the other camera runtime modules. It does not
change placement rules, camera zoom values, distance values, projection mode,
input, field moves, audio, render output or frame order.

TDD:

- Red: `npm test -- --run tests/placementCameraAssist.test.js` failed while
  the test imported from `app/runtime/camera/` and the module still lived at the
  old root-level path.
- Green: the focused test passed after moving the assist into
  `app/runtime/camera/` and updating the `gameLoop.js` import.

Passed:

```sh
git diff --check
npm test -- --run tests/placementCameraAssist.test.js
npm test -- --run tests/placementCameraAssist.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js tests/camera.test.js tests/cameraZoomPresetController.test.js tests/dialogueCameraController.test.js tests/foundationBuildZoneCameraFocusRuntime.test.js tests/placementBlockers.test.js tests/worldObjectPlacementPreview.test.js
npm run build
npm test
```

Focused tests passed:

- `1` file / `1` test for direct placement camera assist coverage.
- `9` files / `50` tests for adjacent camera/frame/placement coverage.

`npm test` completed with:

- `1483` passed
- `3` failed

Failure classification:

- `3` known Leafage Native Tree baseline failures in
  `tests/gameplayInteractions.test.js`.

### Dialogue Camera Controller Boundary Move

Moved `createDialogueCameraController()` from root-level `app/runtime` into
`app/runtime/camera/`.

Boundary classification: `camera runtime/debug`.

Study path:

1. `app/runtime/camera/dialogueCameraController.js` owns dialogue conversation
   framing, scripted world-point focus and restoring gameplay camera pose after
   dialogue focus.
2. `createApplicationRuntime.js` still creates the controller as part of the
   application composition root.
3. The controller implementation was moved without timing, tuning or behavior
   changes. Only the relative import for `actTwoSceneConfig.js` changed because
   the file moved one folder deeper.
4. `frame(now)` was not changed.

This cut reduces root-level `app/runtime` sprawl and keeps dialogue camera
behavior beside the other camera runtime modules. It does not change dialogue
camera zoom, distance, focus heights, transition duration, input, placement,
field moves, audio, render output or frame order.

TDD:

- Red: `npm test -- --run tests/dialogueCameraController.test.js` failed while
  the test imported from `app/runtime/camera/` and the module still lived at the
  old root-level path.
- Green: the focused test passed after moving the controller into
  `app/runtime/camera/` and updating the composition-root import.

Passed:

```sh
git diff --check
npm test -- --run tests/dialogueCameraController.test.js
npm test -- --run tests/dialogueCameraController.test.js tests/narrativeCameraSystem.test.js tests/camera.test.js tests/gameplayCameraDirector.test.js tests/foundationBuildZoneCameraFocusRuntime.test.js tests/cameraDebugRuntime.test.js tests/cameraDebugFrameState.test.js tests/applicationBootScene.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
```

Focused tests passed:

- `1` file / `6` tests for direct dialogue camera coverage.
- `9` files / `42` tests for adjacent camera/narrative/bootstrap coverage.

`npm test` completed with:

- `1483` passed
- `3` failed

Failure classification:

- `3` known Leafage Native Tree baseline failures in
  `tests/gameplayInteractions.test.js`.

### Player Movement Tuning Boundary Move

Completed an interrupted movement tuning migration that was blocking validation,
then moved the tuning constants into a dedicated movement boundary.

Boundary classification: `bot/companion motion` and player movement tuning.

Study path:

1. `app/runtime/movement/playerMovementTuning.js` owns the Act Two player movement
   constants.
2. `configurePlayerSpawner.js` imports those constants and re-exports them to
   preserve the existing public API used by tests, `gameLoop.js`, field-move
   tuning and older imports.
3. `PLAYER_SPEED` is the preferred name; `ACT_TWO_PLAYER_SPEED` remains as a
   compatibility alias.
4. `companionFollowMotion.js` imports the speed constant from the movement
   boundary instead of depending on the player spawner module.
5. Companion follow distance keeps the existing contract: Water Gun and Leafage
   can use active/inactive spacing outside a formation slot, while Fire and
   Build Block keep their provided default spacing.

This cut does not change movement speed numbers, run multiplier numbers,
companion distance constants, input mapping, frame order, placement, field
moves or render output.

TDD / regression path:

- Red: `npm run build` failed because `configurePlayerSpawner.js` imported
  missing `./playerMovementTuning.js`.
- Red: `npm test -- --run tests/companionFollowFormation.test.js
  tests/companionFollowMotion.test.js tests/gameLoopFrameRuntime.test.js`
  failed because Fire/Build Block spacing returned `1.12` instead of the
  caller-provided default.
- Green: focused companion/frame tests passed after adding the movement tuning
  module, preserving the compatibility export and restoring the spacing policy.

Passed:

```sh
git diff --check
npm test -- --run tests/companionFollowFormation.test.js tests/companionFollowMotion.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
```

Focused tests passed:

- `3` files / `19` tests for companion movement and frame adjacency.

`npm test` completed with:

- `1483` passed
- `3` failed

Failure classification:

- `3` known Leafage Native Tree baseline failures in
  `tests/gameplayInteractions.test.js`.

### Camera Zoom Preset Boundary Move

Moved `createCameraZoomPresetController()` from root-level `app/runtime` into
`app/runtime/camera/`.

Boundary classification: `camera runtime/debug`.

Study path:

1. `createCameraZoomPresetController(...)` still owns only preset index state
   and applying the selected zoom/distance to the camera.
2. `gameLoop.js` still creates the controller and calls it from the same places.
3. The controller implementation was moved without logic changes.
4. `frame(now)` was not changed.

This cut reduces root-level `app/runtime` sprawl and keeps camera zoom policy
beside the other camera runtime modules. It does not change zoom values,
distance values, camera order, input, placement, field moves, audio, render
output or frame order.

TDD:

- Red: `npm test -- --run tests/cameraZoomPresetController.test.js` failed
  while the test imported from `app/runtime/camera/` and the module still lived
  at the old root-level path.
- Green: the focused test passed after moving the controller into
  `app/runtime/camera/` and updating the `gameLoop.js` import.

Passed:

```sh
git diff --check
npm test -- --run tests/cameraZoomPresetController.test.js
npm test -- --run tests/cameraZoomPresetController.test.js tests/camera.test.js tests/gameplayCameraDirector.test.js tests/dialogueCameraController.test.js tests/foundationBuildZoneCameraFocusRuntime.test.js tests/cameraDebugRuntime.test.js tests/cameraDebugFrameState.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js
```

Focused tests passed:

- `1` file / `1` test for direct camera zoom preset coverage.
- `9` files / `37` tests for adjacent camera/frame coverage.

Blocked validation:

- `npm run build` failed before this cut's moved module became relevant because
  the dirty external change in `app/session/configurePlayerSpawner.js` imports
  missing `./playerMovementTuning.js`.
- `npm test` completed with import-resolution failures from the same dirty
  external change plus the known Leafage Native Tree baseline failures.

Failure classification:

- Dirty external import problem:
  `app/session/configurePlayerSpawner.js` imports
  `./playerMovementTuning.js`, while the untracked file currently exists at
  `app/runtime/movement/playerMovementTuning.js`.
- `3` known Leafage Native Tree baseline failures in
  `tests/gameplayInteractions.test.js`.

Dirty files intentionally left outside this cut:

- `app/runtime/companions/companionFollowMotion.js`
- `app/session/configurePlayerSpawner.js`
- `app/runtime/movement/playerMovementTuning.js`

### Foundation Build Zone Camera Focus Boundary Move

Moved `createFoundationBuildZoneCameraFocusRuntime()` from root-level
`app/runtime` into `app/runtime/camera/`.

Boundary classification: `camera runtime/debug`.

Study path:

1. `createFoundationBuildZoneCameraFocusRuntime(...)` still owns the small
   state machine for one-time foundation build-zone camera focus.
2. `gameLoop.js` still decides when to call the runtime and passes the same
   callbacks and flags as before.
3. The runtime implementation was moved without logic changes.
4. `frame(now)` was not changed.

This cut reduces root-level `app/runtime` sprawl and keeps camera-specific
focus behavior beside the other camera runtime modules. It does not change
camera timing, focus duration, mission gates, input, placement, field moves,
audio, render output or frame order.

TDD:

- Red: `npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js`
  failed while the test imported from `app/runtime/camera/` and the module
  still lived at the old root-level path.
- Green: the focused test passed after moving the runtime into
  `app/runtime/camera/` and updating the `gameLoop.js` import.

Passed:

```sh
git diff --check
npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js
npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js tests/cameraDebugRuntime.test.js tests/cameraDebugFrameState.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js tests/gameplayOpeningShip.test.js
npm run build
```

Focused tests passed:

- `1` file / `6` tests for direct foundation camera focus coverage.
- `6` files / `26` tests for adjacent camera/frame/opening coverage.

`npm test` completed with:

- `1482` passed
- `4` failed

Failure classification:

- `3` known Leafage Native Tree baseline failures in
  `tests/gameplayInteractions.test.js`.
- `1` unrelated dirty-worktree failure in `tests/companionFollowMotion.test.js`
  caused by the pre-existing uncommitted change in
  `app/runtime/companions/companionFollowMotion.js`.

Dirty files intentionally left outside this cut:

- `app/runtime/companions/companionFollowMotion.js`
- `app/session/configurePlayerSpawner.js`
- `app/runtime/movement/playerMovementTuning.js`

### Camera Debug Boundary Move

Moved camera debug modules from root-level `app/runtime` into
`app/runtime/camera/`:

- `cameraDebugRuntime.js`
- `cameraDebugFrameState.js`

Boundary classification: `camera runtime/debug`.

Study path:

1. `createCameraDebugRuntime(...)` still owns the DOM overlay element, global
   error listener wiring and capped error list.
2. `createCameraDebugFrameState(...)` still owns the pure debug payload sent to
   the overlay.
3. `gameLoop.js` imports both through the `camera` boundary.
4. Runtime implementations were not changed.
5. `frame(now)` was not changed.

This cut reduces root-level `app/runtime` sprawl without adding another helper
file. It does not change camera debug payload shape, listener behavior, overlay
CSS, camera behavior, input, placement, field moves, audio, render output or
frame order.

TDD:

- Red: `npm test -- --run tests/cameraDebugRuntime.test.js
  tests/cameraDebugFrameState.test.js` failed while the modules still lived at
  the old paths.
- Green: focused camera debug tests passed after moving the modules into
  `app/runtime/camera/`.

Passed:

```sh
git diff --check
npm test -- --run tests/cameraDebugRuntime.test.js tests/cameraDebugFrameState.test.js
npm test -- --run tests/cameraDebugRuntime.test.js tests/cameraDebugFrameState.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js tests/renderFrameController.test.js
npm run build
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `2` files / `5` tests for direct camera debug coverage.
- `5` files / `23` tests for adjacent frame/render coverage.

`npm test` completed with:

- `1482` passed
- `4` failed

Failure classification:

- `3` known Leafage Native Tree baseline failures in
  `tests/gameplayInteractions.test.js`.
- `1` unrelated dirty-worktree failure in `tests/companionFollowMotion.test.js`
  caused by the pre-existing uncommitted change in
  `app/runtime/companions/companionFollowMotion.js`.

Manual smoke:

- A Vite server for this project was already listening on
  `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The pre-existing dev server was left running because this step did not start
  it.

### Companion Lost Hint Boundary Move

Moved `createCompanionLostHintRuntime()` from
`app/runtime/companionLostHintRuntime.js` to
`app/runtime/companions/companionLostHintRuntime.js`.

Boundary classification: `bot/companion motion`.

Study path:

1. The lost-companion hint scheduler now lives in the companion runtime
   boundary beside follow motion and follow direction.
2. `gameLoop.js` imports the scheduler through `app/runtime/companions/`.
3. The scheduler implementation was not changed.
4. Historical note: at this step, `resolveWaterGunCompanionLostHint(...)`
   still lived in `gameLoop.js`; the later Companion Lost Hint Resolver
   Extraction moved the pure decision into the `companions` boundary.
5. `frame(now)` was not changed.

This cut reduces root-level `app/runtime` sprawl without adding another file.
It does not change hint timing, repeat timing, hint text, world position update
behavior, input, camera, placement, field moves, audio, render output or frame
order.

TDD:

- Red: `npm test -- --run tests/companionLostHintRuntime.test.js` failed while
  the runtime still lived at the old path.
- Green: focused companion lost-hint, follow-direction, follow-motion and
  follow-formation tests passed after moving the runtime into
  `app/runtime/companions/`.

Passed:

```sh
git diff --check
npm test -- --run tests/companionLostHintRuntime.test.js tests/companionFollowDirectionRuntime.test.js tests/companionFollowMotion.test.js tests/companionFollowFormation.test.js
npm run build
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `4` files
- `23` tests

`npm test` completed with the existing Leafage Native Tree baseline:

- `1483` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the companion lost-hint boundary move and were not
modified.

Manual smoke:

- A Vite server for this project was already listening on
  `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The pre-existing dev server was left running because this step did not start
  it.

### Companion Follow Direction Boundary Move

Moved `createCompanionFollowDirectionRuntime()` from
`app/runtime/companionFollowDirectionRuntime.js` to
`app/runtime/companions/companionFollowDirectionRuntime.js`.

Boundary classification: `bot/companion motion`.

Study path:

1. The companion follow direction runtime now lives beside the companion follow
   motion policy.
2. `gameLoop.js` imports the direction runtime through the `companions`
   boundary.
3. The direction runtime implementation was not changed.
4. `frame(now)` was not changed.
5. The pre-existing `distances` table edit in `companionFollowMotion.js` was
   made syntactically valid while preserving the previous distance behavior:
   Water Gun and Leafage may override spacing, while Fire and Build Block keep
   `defaultDistance` unless a formation slot is supplied.

This cut reduces root-level `app/runtime` sprawl without creating a new helper
file. It does not change companion direction normalization, follow fallback
direction, movement, input, camera, placement, field moves, audio, render output
or frame order.

TDD:

- Red: `npm test -- --run tests/companionFollowDirectionRuntime.test.js`
  failed while the runtime still lived at the old path.
- Green: focused companion direction, motion and formation tests passed after
  moving the runtime into `app/runtime/companions/`.

Passed:

```sh
git diff --check
npm test -- --run tests/companionFollowDirectionRuntime.test.js tests/companionFollowMotion.test.js tests/companionFollowFormation.test.js
npm run build
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `3` files
- `19` tests

`npm test` completed with the existing Leafage Native Tree baseline:

- `1483` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the companion follow direction boundary move and were
not modified.

Manual smoke:

- A Vite server for this project was already listening on
  `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The pre-existing dev server was left running because this step did not start
  it.

### Companion Follow Membership Policy Extraction

Moved the per-companion follow eligibility rules into
`app/runtime/companions/companionFollowMotion.js`.

Boundary classification: `bot/companion motion`.

Study path:

1. `isCompanionFollowFormationMember(...)` owns the pure membership policy for
   Hydro, Grow, Thermal and Builder bots.
2. `gameLoop.js` now builds explicit snapshots from `session`, `storyState`,
   current actions and local blockers, then delegates the decision to the
   companion module.
3. `gameLoop.js` still owns the session-specific sources: Water Gun queue
   length and Bulbasaur Workbench guide activity.
4. `frame(now)` was not changed.

This extraction does not change follow flags, encounter visibility checks,
action blockers, Leaf Den construction blockers, active move priority, input,
camera, placement, field moves, audio, render output or frame order.

TDD:

- Red: `npm test -- --run tests/companionFollowMotion.test.js` failed because
  `isCompanionFollowFormationMember(...)` did not exist yet.
- Green: focused companion motion, formation and direction tests passed after
  moving the membership rules.

Passed:

```sh
git diff --check
npm test -- --run tests/companionFollowMotion.test.js tests/companionFollowFormation.test.js tests/companionFollowDirectionRuntime.test.js
npm run build
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `3` files
- `18` tests

`npm test` completed with the existing Leafage Native Tree baseline:

- `1482` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the companion follow membership extraction and were not
modified.

Manual smoke:

- A Vite server for this project was already listening on
  `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The pre-existing dev server was left running because this step did not start
  it.

### Companion Follow Formation Policy Extraction

Moved the companion follow motion module into
`app/runtime/companions/companionFollowMotion.js` and added the pure follow
formation ordering policy to that same boundary.

Boundary classification: `bot/companion motion`.

Study path:

1. `app/runtime/companions/` is now the domain folder for companion runtime
   motion policy.
2. `resolveCompanionFollowFormationIds(...)` owns the active-move-first ordering
   and filters through an explicit `isFollowing` predicate.
3. `resolveCompanionFollowFormationIndex(...)` returns `null` at the pure-module
   boundary when a companion is not part of the current formation.
4. `gameLoop.js` keeps the session-specific `isCompanionInFollowFormation(...)`
   check local because it reads story flags, encounter visibility and action
   state.
5. `gameLoop.js` preserves the previous fallback behavior by converting the
   pure `null` result back to index `0`.

This extraction does not change companion spacing, follow speed, active move
priority, input, camera, placement, field moves, audio, render output or frame
order. It also removes the loose `app/runtime/companionFollowMotion.js` file so
new companion motion work lives under a named module boundary instead of
directly under `app/runtime/`.

TDD:

- Red: `npm test -- --run tests/companionFollowMotion.test.js` failed while
  `app/runtime/companions/companionFollowMotion.js` did not exist.
- Green: focused companion motion, formation and direction tests passed after
  moving the module and extracting the formation policy.

Passed:

```sh
git diff --check
npm test -- --run tests/companionFollowMotion.test.js tests/companionFollowFormation.test.js tests/companionFollowDirectionRuntime.test.js
npm run build
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `3` files
- `15` tests

`npm test` completed with the existing Leafage Native Tree baseline:

- `1479` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the companion follow formation extraction and were not
modified.

Manual smoke:

- A Vite server for this project was already listening on
  `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The pre-existing dev server was left running because this step did not start
  it.

### Companion Follow Motion Helper Extraction

Created `app/runtime/companions/companionFollowMotion.js` for the pure
companion follow spacing and speed helpers.

Boundary classification: `bot/companion motion`.

Study path:

1. `gameLoop.js` still owns composition and frame orchestration; `frame(now)`
   was not changed in this cut.
2. `resolveCompanionFollowDistance(...)` and `resolveCompanionFollowSpeed()`
   moved out of `gameLoop.js`.
3. `gameLoop.js` imports the helpers for internal use and re-exports them to
   preserve the existing public API.
4. Existing formation tests still cover the `gameLoop.js` re-export path.
5. New module tests import `companionFollowMotion.js` from the `companions`
   boundary directly and protect the extracted boundary.

This extraction does not change companion spacing, movement speed, formation
slots, field moves, input, camera, audio, placement or frame order.

TDD:

- Red: `npm test -- --run tests/companionFollowMotion.test.js` failed while
  the new module did not exist.
- Green: focused tests passed after moving the helpers and preserving the
  `gameLoop.js` re-export.

Passed:

```sh
git diff --check
npm test -- --run tests/companionFollowMotion.test.js tests/companionFollowFormation.test.js
npm test -- --run tests/gameLoopFrameRuntime.test.js tests/companionFollowDirectionRuntime.test.js tests/companionFollowFormation.test.js tests/companionFollowMotion.test.js
npm run build
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `2` files / `7` tests for direct module plus re-export coverage.
- `4` files / `17` tests for adjacent frame and companion-follow coverage.

`npm test` completed with the existing Leafage Native Tree baseline:

- `1476` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the companion follow motion helper extraction and were
not modified.

Manual smoke:

- A Vite server for this project was already listening on
  `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The pre-existing dev server was left running because this step did not start
  it.

### Ambient World Simulation Frame Helper Extraction

Added an internal `updateAmbientWorldSimulationFrame({ deltaTime, now })`
helper inside `startGameLoop()`. This moves the first ambient simulation update
group out of the body of `frame(now)`.

Study path:

1. `frame(now)` still calls the helper immediately after follower-call handling
   and before companion, repair-box, field-move and robot updates.
2. The helper keeps the exact update order for HUD transient notices, palm shake,
   resource node animation, landscape cut effects, resource model sync, cloud
   atmosphere, snowstorm particles, snowstorm fog, Leppa Tree state, Leppa Tree
   dance and Leppa Tree music notes.
3. The helper does not move gameplay actions, placement, field moves, camera
   rules or render snapshot preparation.

This extraction does not change tuning, resource behavior, fog behavior, Leppa
Tree behavior, render output, input handling or frame order. It only gives the
ambient simulation update group a local helper boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/snowstormFogRuntime.test.js tests/snowstormParticleField.test.js tests/leppaTreeMusicNotes.test.js tests/landscapeCutEffectRuntime.test.js tests/worldObjectRecipeRuntime.test.js tests/gameLoopFrameRuntime.test.js tests/frameSnapshotController.test.js
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `7` files passed
- `32` tests passed

`npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the ambient world simulation helper extraction and were
not modified.

Manual smoke:

- Dev server started on `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The dev server was stopped and port `5173` was confirmed free.

### Follower Call Frame Helper Extraction

Added an internal `processFollowerCallFrame()` helper inside `startGameLoop()`.
This moves the follower-call request handling out of the body of `frame(now)`.

Study path:

1. `frame(now)` still calls the helper in the same location: after explicit
   interact handling and before simulation updates.
2. The helper still consumes `controls.consumeFollowerCallRequest?.()` exactly
   once per frame.
3. The same bot signal sound, story flags and HUD notices are used.
4. Leaf Den construction help, Thermal Cabin follow and Charmander celebration
   follow branches keep the same priority order.

This extraction does not change follower behavior, notice text, sound events,
input mapping, movement, placement, field moves, render output or frame order.
It only gives follower-call side effects a local helper boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/companionFollowDirectionRuntime.test.js tests/companionFollowFormation.test.js tests/gameplayInteractions.test.js tests/gameLoopFrameRuntime.test.js tests/soundEventRuntime.test.js
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

Focused command completed with the existing Leafage Native Tree baseline:

- `133` passed
- `3` failed in `tests/gameplayInteractions.test.js`

`npm test` completed with the same baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the follower call helper extraction and were not
modified.

Manual smoke:

- Dev server started on `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The dev server was stopped and port `5173` was confirmed free.

### Frame Prompt Target-State Helper Extraction

Added an internal `resolveFramePromptTargetState(state)` helper inside
`startGameLoop()`. This moves the frame-local prompt target setup out of the
body of `frame(now)`.

Study path:

1. `frame(now)` still refreshes placement previews and resolves nearby gameplay
   targets before calling the helper.
2. The helper resolves placement prompt text, pending placement intent,
   pending placement HUD prompt, selected and nearby workbench rotation targets,
   workbench rotation prompt text and destroyable-object prompt state.
3. The helper preserves the old placement-preview gate: pending placement,
   workbench rotation and destroyable-object prompts do not activate while any
   placement preview is active.
4. The destroyable-object debug payload stayed in the same logical boundary and
   now uses the shared `placementPreviewBlocked` boolean.
5. Returned values still feed the existing HUD prompt helper, world prompt
   helper, workbench rotation ground-cell highlight and base render snapshot.

This extraction does not change prompt text, placement rules, workbench rotation
rules, field-move rules, render output, camera behavior or frame order. It only
groups the prompt target-state calculation behind a local helper.

Passed:

```sh
git diff --check
npm test -- --run tests/inputPromptResolver.test.js tests/gameHudController.test.js tests/worldPromptState.test.ts tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayUiVisibilityController.test.js tests/playerCounterPromptRuntime.test.js tests/placementPreviewVisual.test.js tests/worldObjectPlacementPreview.test.js tests/workbenchRotationRuntime.test.js tests/placementBlockers.test.js
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `11` files passed
- `81` tests passed

`npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the prompt target-state helper extraction and were not
modified.

Manual smoke:

- Dev server started on `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The dev server was stopped and port `5173` was confirmed free.

### HUD Prompt Copy Frame Helper Extraction

Added an internal `resolveFrameHudPromptCopy(state)` helper inside
`startGameLoop()`. This moves the HUD `promptCopy` priority chain and its
`debugInteractionFlow("gameLoop.promptCopy.resolved", ...)` payload out of the
body of `frame(now)`.

Study path:

1. `frame(now)` still resolves nearby gameplay targets, placement previews,
   pending placement intent, workbench rotation prompt and destroyable-object
   prompt before calling the helper.
2. The helper only chooses the HUD prompt text from already-resolved inputs.
3. Prompt priority is unchanged: blocked flow returns empty text first, then
   placement prompts, pending placement, workbench rotation, destroyable object
   and the existing `gameplay.buildNearbyPrompt(...)` fallback.
4. The HUD snapshot still receives the same `promptCopy` through
   `updateHudSnapshotFrame(...)`.

This extraction does not change prompt text, placement rules, field-move rules,
world prompt priority, render output, camera behavior or frame order. It only
gives the HUD prompt-copy calculation a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/inputPromptResolver.test.js tests/gameHudController.test.js tests/worldPromptState.test.ts tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayUiVisibilityController.test.js tests/playerCounterPromptRuntime.test.js tests/placementPreviewVisual.test.js tests/worldObjectPlacementPreview.test.js
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `9` files passed
- `61` tests passed

`npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the HUD prompt-copy helper extraction and were not
modified.

Manual smoke:

- Dev server started on `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The dev server was stopped and port `5173` was confirmed free.

### World Prompt Snapshot Frame Helper Extraction

Added an internal `updateWorldPromptSnapshotFrame(nextFrame, state)` helper
inside `startGameLoop()`. This moves the `setFrameWorldPrompt(...)` priority
chain out of the body of `frame(now)`.

Study path:

1. The helper receives already-resolved prompt condition booleans; it does not
   calculate placement, field-move, prompt-target or visibility rules.
2. Placement, destroyable-object, pending placement, workbench rotation, cost,
   counter, field-move switch, charging, invalid-target, transient, dry-grass,
   run breadcrumb, player interaction, repair box and first-use prompt writes
   keep the same priority order.
3. Prompt text still uses the same existing helpers and constants.
4. `setFrameWorldPrompt(...)` remains the only writer used by the chain.
5. Ground-cell highlights still run after the world prompt snapshot helper.

This extraction does not change prompt text, prompt priority, placement rules,
field-move rules, render output, camera behavior or frame order. It only gives
world-prompt snapshot writes a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/worldPromptState.test.ts tests/inputPromptResolver.test.js tests/gameplayUiVisibilityController.test.js tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js tests/gameHudController.test.js tests/playerCounterPromptRuntime.test.js tests/runBreadcrumbPromptRuntime.test.js tests/fieldMoveInvalidTargetPromptRuntime.test.js tests/placementPreviewVisual.test.js tests/worldObjectPlacementPreview.test.js
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

Focused tests passed:

- `11` files passed
- `68` tests passed

`npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

The remaining failures cover Native Tree growth, safe-cell selection and Wood
drops. They are outside the world prompt snapshot helper extraction and were not
modified.

Manual smoke:

- Dev server started on `http://127.0.0.1:5173/`.
- `curl -sI http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`.
- The dev server was stopped and port `5173` was confirmed free.

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

### Companion Lost Hint Resolver Extraction

Moved the Water Gun companion-lost hint decision out of
`app/runtime/gameLoop.js` and into the existing `companions` boundary at
`app/runtime/companions/companionLostHintRuntime.js`.

Study path:

1. `resolveWaterGunCompanionLostHint(...)` is now a pure companion-domain helper.
2. `gameLoop.js` still reads live state from `controls`, `session` and
   `getSquirtleWorldPosition()`.
3. `gameLoop.js` now passes those values into the helper and delegates scheduling
   to `companionLostHintRuntime.get(hint, now)` as before.
4. Hint texts, quest ids, mission thresholds, active-move checks and world-speech
   snapshot ordering are unchanged.
5. No new file was created; the existing `companions/` runtime became the owner
   of the companion-specific rule.

Reduced pressure:

- `gameLoop.js` line count changed from `12192` to `12165`.
- Removed the local Water Gun/Bulbasaur companion lost-hint decision block from
  `gameLoop.js`.
- Added focused tests for the pure companion hint policy.

Passed:

```sh
npm test -- --run tests/companionLostHintRuntime.test.js
git diff --check
npm test -- --run tests/companionLostHintRuntime.test.js tests/gameLoopFrameRuntime.test.js tests/worldSpeechController.test.js tests/frameSnapshotController.test.js
npm run build
```

The focused suite passed with `27` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1489` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Player Model Motion Domain Boundary

Moved player visual model motion from `app/runtime/gameLoop.js` into the
`player` domain at `app/player/playerModelMotion.js`.

Study path:

1. `startGameLoop()` still owns composition and creates
   `createPlayerModelRuntime(...)` with explicit dependencies:
   `moveValueToward`, `rotateAngleToward` and the existing jump sound trigger.
2. `gameLoop.js` now calls only:
   - `playerModelRuntime.startJumpFlip(session)` when the player jump starts.
   - `playerModelRuntime.sync(session, deltaTime, movementDelta)` when the
     player model needs visual sync.
3. The `player` module now owns the player model tuning, walk-cycle advance,
   body bob, jump-flip roll, model yaw, leg sync and arm sync.
4. `app/runtime/playerModelMotion.js` remains as a compatibility re-export so
   existing external imports keep working while new code imports from
   `app/player/playerModelMotion.js`.
5. `frame(now)` order is unchanged; only the implementation behind the existing
   sync call moved.

Reduced pressure:

- `gameLoop.js` line count changed from `12403` to `12192`.
- Removed the local player visual sync helper block and player model constants
  from `gameLoop.js`.
- Created a game-domain boundary instead of another loose runtime helper.

Tests:

- `tests/playerModelMotion.test.js` now imports from the `player` domain.
- Added coverage for `createPlayerModelRuntime(...)` syncing body, limbs, walk
  cycle and jump roll from session state.

Passed:

```sh
npm test -- --run tests/playerModelMotion.test.js
git diff --check
npm test -- --run tests/playerModelMotion.test.js tests/modelFacing.test.js tests/characterFactory.test.js tests/playerDustParticles.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1489` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

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

### Movement Quest Lazy Activity Lookup

Refined `movementQuestRuntime.js` before active wiring. The `active` input may
now be either the existing boolean form or a resolver function.

This preserves an ordering detail from `gameLoop.js`: after movement progress
has been acknowledged, the old `movementQuestReported` guard prevents further
`gameplay.getActiveSystemQuest()` reads. The integration pass can provide a
lazy resolver so the private runtime state keeps that short-circuit behavior.

The new test confirms that the activity resolver and report callback each run
only once after progress is acknowledged.

Passed:

```sh
git diff --check
npm test -- --run tests/movementQuestRuntime.test.js tests/gameLoopState.test.js tests/questFlowGuards.test.js tests/createMissionSystemAdapter.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `20` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1353` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Movement Quest Runtime Integration

Integrated `createMovementQuestRuntime()` into `startGameLoop()` and removed
`movementQuestReported` and `movementQuestDistance` from
`createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private movement-quest runtime with the
   existing `0.0005` minimum movement distance and `0.04` report threshold.
2. The player-movement section still calculates `movedDistance` at the same
   frame point.
3. It now forwards that distance to `movementQuestRuntime.update(...)`.
4. The `active` resolver keeps the existing lazy
   `gameplay.getActiveSystemQuest()` lookup and the reporter keeps the same
   `{ type: "MOVE", targetId: "player" }` event payload.
5. The runtime privately owns accumulated distance and the acknowledged-report
   flag, so those fields no longer belong to general loop state.

The breadcrumb prompt check remains separate because it controls tutorial UI,
not movement-quest progress.

Passed:

```sh
rg -n "movementQuestReported|movementQuestDistance|createMovementQuestRuntime|movementQuestRuntime|learn-to-move|type: \"MOVE\"" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/movementQuestRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js tests/questFlowGuards.test.js tests/createMissionSystemAdapter.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `28` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1353` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Wood Collect Pop Runtime Preparation

Added `woodCollectPopRuntime.js` as an isolated, tested visual-effect core. It
is not imported by `gameLoop.js` yet, so this preparation step does not change
active gameplay behavior.

This boundary was selected before the remaining foundation build-zone camera
focus because the camera path starts a transition, synchronizes orbit state,
clears input and contributes to multiple frame blockers. The wood collection
pop effect has a narrower contract and no gameplay side effects.

The runtime intentionally owns only the private effect array and its visual
lifecycle:

1. `trigger(woodDropSnapshots)` queues snapshots whose drop became collected.
2. `update(deltaTime)` preserves the existing age increment and expiry rule.
3. `getBillboards(texture, fallbackUvRect)` preserves the existing sinusoidal
   lift, scale pulse, fade curve and snapshot UV preference.
4. Each factory call owns independent private state.

At this preparation point, the pre-collection snapshot, wood-drop comparison,
resource collection flow and render-snapshot append point still remained
unchanged in `gameLoop.js`. The snapshot helpers were extracted later in the
Collectible Source Snapshot Helper pass.

The next integration pass should:

1. Create `createWoodCollectPopRuntime(...)` inside `startGameLoop()` with the
   existing duration, lift and scale constants.
2. Replace the local trigger, update and billboard-builder calls with runtime
   calls at the same points.
3. Keep `snapshotAvailableWoodDrops(...)` in `gameLoop.js` for this pass.
4. Remove `woodCollectPopEffects` from `createGameLoopState()` and its state
   contract test.

Passed:

```sh
rg -n "createWoodCollectPopRuntime|woodCollectPopEffects|triggerWoodCollectPopEffects|getWoodCollectPopBillboards|updateWoodCollectPopEffects" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/woodCollectPopRuntime.test.js tests/gameLoopState.test.js tests/gameplayWoodDrops.test.js tests/gameLoopFrameRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `14` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1357` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Wood Collect Pop Runtime Integration

Integrated `createWoodCollectPopRuntime()` into `startGameLoop()` and removed
`woodCollectPopEffects` from `createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private wood-pop runtime with the existing
   duration, lift and scale constants.
2. At integration time, `snapshotAvailableWoodDrops(...)` remained local and
   continued to capture uncollected drop data before the existing destroy action
   ran. It was extracted later with the collectible source snapshot helpers.
3. When collected wood is detected, the loop calls
   `woodCollectPopRuntime.trigger(woodDropSnapshots)` at the same point.
4. The frame lifecycle calls `woodCollectPopRuntime.update(deltaTime)` where
   the local age update previously ran.
5. Render preparation appends
   `woodCollectPopRuntime.getBillboards(...)` into the same
   `nextFrame.render.genericBillboards` array.

The resource collection flow, audio loop, HUD feedback and fly-to-slot
animation remain in `gameLoop.js`.

Passed:

```sh
rg -n "woodCollectPopEffects|createWoodCollectPopRuntime|woodCollectPopRuntime|triggerWoodCollectPopEffects|updateWoodCollectPopEffects|getWoodCollectPopBillboards|snapshotAvailableWoodDrops" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/woodCollectPopRuntime.test.js tests/gameLoopState.test.js tests/gameplayWoodDrops.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `17` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1357` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Gear Pickup Particle Runtime Preparation

Added `gearPickupParticleRuntime.js` as an isolated, tested visual-effect core.
It is not imported by `gameLoop.js` yet, so this preparation step does not
change active gameplay behavior.

The runtime intentionally owns only the private particle array and its visual
lifecycle:

1. `trigger(sourcePositions)` creates the existing particle ring for each
   valid collected-gear position.
2. `update(deltaTime)` preserves the existing age increment and expiry rule.
3. `getBillboards(texture, fallbackUvRect)` preserves the existing radial
   spread, arc lift, pulse, fade and rotation formulas.
4. Each factory call owns independent private state.

The collectible snapshots, gear-count comparison, HUD feedback, audio and
render-snapshot append point remain unchanged in `gameLoop.js`.

The next integration pass should:

1. Create `createGearPickupParticleRuntime(...)` inside `startGameLoop()` with
   the existing count, duration, height, lift, radius and size constants.
2. Replace the local trigger, update and billboard-builder calls with runtime
   calls at the same points.
3. Remove `gearPickupParticleEffects` from `createGameLoopState()` and its
   state contract test.

Passed:

```sh
rg -n "createGearPickupParticleRuntime|gearPickupParticleEffects|triggerGearPickupParticleEffects|updateGearPickupParticleEffects|getGearPickupParticleBillboards" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/gearPickupParticleRuntime.test.js tests/gameLoopState.test.js tests/gameplayWoodDrops.test.js tests/gameLoopFrameRuntime.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `14` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1361` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Gear Pickup Particle Runtime Integration

Integrated `createGearPickupParticleRuntime()` into `startGameLoop()` and
removed `gearPickupParticleEffects` from `createGameLoopState()`.

Study path:

1. `startGameLoop()` creates one private gear-particle runtime with the
   existing count, duration, base height, lift, radius and size constants.
2. The resource-collection section continues to calculate
   `collectedGearPositions` at the same point and forwards them to
   `gearPickupParticleRuntime.trigger(...)`.
3. The frame lifecycle calls `gearPickupParticleRuntime.update(deltaTime)`
   where the local age update previously ran.
4. Render preparation appends
   `gearPickupParticleRuntime.getBillboards(...)` into the same
   `nextFrame.render.genericBillboards` array.
5. `createGameLoopState()` now stores only
   `foundationBuildZoneCameraFocus`.

The old mutable-array independence test was removed from `gameLoopState.test.js`
because no arrays remain in that state contract. Runtime instance independence
continues to be covered directly by `gearPickupParticleRuntime.test.js`.

Passed:

```sh
rg -n "gearPickupParticleEffects|createGearPickupParticleRuntime|gearPickupParticleRuntime|triggerGearPickupParticleEffects|updateGearPickupParticleEffects|getGearPickupParticleBillboards|foundationBuildZoneCameraFocus" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/gearPickupParticleRuntime.test.js tests/gameLoopState.test.js tests/gameplayWoodDrops.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `16` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1360` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Foundation Build-Zone Camera Focus Runtime Preparation

Added `foundationBuildZoneCameraFocusRuntime.js` as an isolated, tested
scheduler core. It is not imported by `gameLoop.js` yet, so this preparation
step does not change active camera or input behavior.

This extraction deliberately stops before camera side effects. The runtime
owns only the private focus window and one-time zone decision:

1. `update(...)` resets private focus when the mission or zone is unavailable.
2. The same zone remains active until the existing duration expires.
3. The story flag prevents the same zone from starting focus twice.
4. A supplied `startFocus()` callback must succeed before the runtime records
   the story flag or private focus window.
5. Each factory call owns independent private state.

The mission lookup, active build-zone lookup, pose builder,
`camera.startPoseTransition(...)`, orbit sync, input clearing and frame
blockers remain unchanged in `gameLoop.js`.

The next integration pass should:

1. Create `createFoundationBuildZoneCameraFocusRuntime(...)` inside
   `startGameLoop()` with the existing duration and story-flag constant.
2. Keep mission, zone and pose resolution local.
3. Route the scheduler decision through `runtime.update(...)`.
4. Perform camera transition and orbit sync inside the local `startFocus()`
   callback at the same execution point.
5. Clear pending actions and movement input inside `onFocusStarted()` after
   the runtime records the story flag and private focus window.
6. Remove `foundationBuildZoneCameraFocus` from `createGameLoopState()` and
   adjust its contract test.

Passed:

```sh
rg -n "createFoundationBuildZoneCameraFocusRuntime|foundationBuildZoneCameraFocus|updateFoundationBuildZoneCameraFocus|startPoseTransition|clearPendingActions|clearMovementInput" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `21` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1365` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Foundation Focus Side-Effect Order

Refined `foundationBuildZoneCameraFocusRuntime.js` before active wiring. The
scheduler now separates two callback phases:

1. `startFocus()` prepares camera transition and orbit sync.
2. The runtime records the story flag and private focus window.
3. `onFocusStarted()` performs post-start effects such as clearing pending
   actions and movement input.

This preserves the existing observable order in `gameLoop.js`. The new test
verifies that the flag is recorded between the pre-start and post-start
callbacks and that the private focus window is active immediately afterward.

Passed:

```sh
git diff --check
npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `22` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1366` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Foundation Build-Zone Camera Focus Runtime Integration

Integrated `createFoundationBuildZoneCameraFocusRuntime()` into
`startGameLoop()` without moving mission, zone, pose or blocker rules.

Study path:

1. `startGameLoop()` creates the runtime with the existing duration and story
   flag constants.
2. `updateFoundationBuildZoneCameraFocus(now)` still resolves mission activity
   and the active build zone locally.
3. The runtime receives zone availability, signature and story flags.
4. The local `startFocus()` callback still builds the pose, starts the camera
   transition and synchronizes orbit direction in the existing order.
5. The runtime records its private focus window and one-time story flag.
6. The local `onFocusStarted()` callback then clears pending actions and
   movement input.
7. The returned boolean still flows through the existing blocker and camera
   priority paths.

`createGameLoopState()` no longer owns active state. Its export remains as an
empty compatibility factory while callers outside `gameLoop.js` are audited
separately.

Passed:

```sh
rg -n "loopState|foundationBuildZoneCameraFocus|createGameLoopState|createFoundationBuildZoneCameraFocusRuntime|foundationBuildZoneCameraFocusRuntime|updateFoundationBuildZoneCameraFocus|startPoseTransition|clearPendingActions|clearMovementInput" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `22` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1366` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Tree Revival Leaf-Burst Runtime Preparation

Added `treeRevivalLeafBurstRuntime.js` as an isolated, tested visual-effect
runtime. It is not imported by `gameLoop.js` yet, so this preparation step does
not change active gameplay or rendering behavior.

This boundary was selected because it has transient visual state and explicit
dependencies. The runtime owns only leaf-particle details:

1. `queue(position, sourceId)` creates one deterministic burst shape using the
   supplied random source and unchanged tuning values.
2. `update(deltaTime)` applies the existing gravity, velocity, drift and
   expiration calculations.
3. `appendBillboards(...)` preserves the current billboard data shape,
   including texture, position, size, UV rectangle, alpha and rotation.
4. Each factory call owns an independent private burst list.

The following rules remain unchanged in `gameLoop.js`:

- snapshotting palm and Leppa-tree revival state;
- deciding whether a tree became newly revived;
- selecting the leaves texture fallback order;
- choosing when updates and billboard appends occur in the frame.

The next integration pass should:

1. Create `createTreeRevivalLeafBurstRuntime(...)` inside `startGameLoop()` with
   the existing constants and math helpers.
2. Delegate `queueTreeRevivalLeafBurst(...)` to `runtime.queue(...)`.
3. Delegate the existing frame update to `runtime.update(deltaTime)`.
4. Delegate billboard append after resolving the existing texture fallback.
5. Remove the transient `session.treeRevivalLeafBursts` ownership only after
   the three call sites are wired.

Passed:

```sh
rg -n "TREE_REVIVAL_LEAF_BURST_|queueTreeRevivalLeafBurst|updateTreeRevivalLeafBursts|appendTreeRevivalLeafBurstBillboards" app/runtime/gameLoop.js tests --glob '!*.bak'
git diff --check
npm test -- --run tests/treeRevivalLeafBurstRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `20` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1370` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Tree Revival Leaf-Burst Runtime Integration

Integrated `createTreeRevivalLeafBurstRuntime()` into `startGameLoop()` and
removed `74` net lines from `gameLoop.js`.

Study path:

1. `startGameLoop()` creates the runtime with the existing visual constants and
   math helpers.
2. `queueTreeRevivalLeafBurstsForNewlyRevivedTrees(...)` still detects newly
   revived palms and the Leppa tree locally.
3. The two detected revival paths delegate particle creation to
   `treeRevivalLeafBurstRuntime.queue(...)`.
4. The frame still updates leaf particles immediately after nature-revival
   effects, now through `treeRevivalLeafBurstRuntime.update(deltaTime)`.
5. `appendTreeRevivalLeafBurstBillboards(...)` still resolves the existing
   texture fallback order locally and delegates billboard creation.
6. The runtime now owns the transient burst list privately. The old
   `session.treeRevivalLeafBursts` array no longer exists.

This extraction removes visual particle details from `gameLoop.js` without
moving tree-revival detection, harvest rules, texture selection or render
ordering.

Passed:

```sh
rg -n "session\\.treeRevivalLeafBursts|queueTreeRevivalLeafBurst\\(|updateTreeRevivalLeafBursts\\(|treeRevivalLeafBurstRuntime|appendTreeRevivalLeafBurstBillboards" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/treeRevivalLeafBurstRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `20` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1370` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Landscape Cut Effect Runtime Preparation

Added `landscapeCutEffectRuntime.js` as an isolated, tested visual-effect
runtime. It is not imported by `gameLoop.js` yet, so this preparation step does
not change active gameplay or rendering behavior.

This boundary was selected because the state lifecycle and pose calculation
are self-contained:

1. `queue(patch)` clones the destroyed patch, preserves the existing fallback
   size and creates the same temporal identifier shape.
2. `update(deltaTime)` advances elapsed time and removes expired effects.
3. `forEachEffect(callback)` exposes each active cloned patch with its current
   pose.
4. The pose keeps the existing two phases: initial shrink/lift and final
   pop/fade.
5. Each factory call owns an independent private effect list.

The following rules remain unchanged in `gameLoop.js`:

- finding the destroyable landscape patch;
- deciding whether the interact action changed garden progress;
- dispatching autosave feedback;
- choosing grass, garden, Native Tree or dead-grass model instances;
- falling back to grass billboards when no model instance is available;
- frame update and render ordering.

The next integration pass should:

1. Create `createLandscapeCutEffectRuntime(...)` inside `startGameLoop()` with
   the existing constants and math helpers.
2. Delegate `queueLandscapeCutEffect(...)` to `runtime.queue(...)`.
3. Delegate the existing frame update to `runtime.update(deltaTime)`.
4. Replace the local effect loop with `runtime.forEachEffect(...)` while
   preserving the current model-instance and billboard rendering block.
5. Remove `session.landscapeCutEffects` ownership and the local pose helper
   only after all three paths are wired.

Passed:

```sh
rg -n "landscapeCutEffectRuntime|landscapeCutEffects|queueLandscapeCutEffect|updateLandscapeCutEffects|getLandscapeCutEffectPose|appendLandscapeCutEffectRenderables" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/landscapeCutEffectRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `20` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1374` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Landscape Cut Effect Runtime Integration

Integrated `createLandscapeCutEffectRuntime()` into `startGameLoop()` and
removed `47` net lines from `gameLoop.js`.

Study path:

1. `startGameLoop()` creates the runtime with the existing visual constants and
   math helpers.
2. `getDestroyableLandscapePatchForInteractOptions(...)` still captures the
   patch before the gameplay interaction mutates session state.
3. `queueLandscapeCutEffect(...)` delegates the captured patch to
   `landscapeCutEffectRuntime.queue(...)`.
4. The simulation frame still updates the effect immediately after resource
   node updates, now through `landscapeCutEffectRuntime.update(deltaTime)`.
5. `appendLandscapeCutEffectRenderables(...)` iterates private runtime effects
   and receives the calculated pose from `runtime.forEachEffect(...)`.
6. The existing render block still chooses garden, Native Tree, tall-grass,
   dead-grass or billboard output locally.
7. The old `session.landscapeCutEffects` array no longer exists.

This extraction moves transient state, cloning, timing, expiration and pose
math out of `gameLoop.js`. Interaction rules, autosave feedback, model assets
and render ordering remain local.

Passed:

```sh
rg -n "session\\.landscapeCutEffects|updateLandscapeCutEffects|getLandscapeCutEffectPose|queueLandscapeCutEffect|landscapeCutEffectRuntime|appendLandscapeCutEffectRenderables" . --glob '!node_modules/**' --glob '!dist/**' --glob '!*.bak'
git diff --check
npm test -- --run tests/landscapeCutEffectRuntime.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `20` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1374` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Save-Point Star Billboard Helper Preparation

Added `savePointStarBillboards.js` as an isolated, tested pure visual helper.
It is not imported by `gameLoop.js` yet, so this preparation step does not
change active rendering behavior.

This boundary was selected after mutable-state candidates were excluded because
they belong to placement, construction or music. The helper owns no runtime
state and preserves the current deterministic billboard calculation:

1. Invalid save-point positions or missing textures return an empty list.
2. The configured particle count is preserved.
3. Cycle, orbit radius, vertical lift, pulse, alpha and rotation are derived
   from the current frame timestamp.
4. Each billboard preserves texture, position, size, UV rectangle, alpha and
   rotation.

The next integration pass should:

1. Import the helper into `gameLoop.js`.
2. Remove the local `getSavePointStarBillboards(...)`.
3. Pass the existing four constants through a config object at the existing
   render call site.
4. Keep the render push in the same order.

Passed:

```sh
rg -n "savePointStarBillboards|getSavePointStarBillboards|SAVE_POINT_STAR_" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `19` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1377` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Save-Point Star Billboard Helper Integration

Integrated `getSavePointStarBillboards(...)` into `gameLoop.js` and removed
`24` net lines from the loop module.

Study path:

1. `gameLoop.js` imports the pure helper from `savePointStarBillboards.js`.
2. The four existing particle constants keep their original values.
3. `SAVE_POINT_STAR_BILLBOARD_CONFIG` groups those constants without changing
   tuning.
4. The local `getSavePointStarBillboards(...)` implementation was removed.
5. The existing `nextFrame.render.genericBillboards.push(...)` call remains in
   the same render position and now passes explicit helper dependencies.

The helper owns only deterministic billboard calculation. Save-point state,
texture selection, render collection ownership and render ordering remain in
`gameLoop.js`.

Passed:

```sh
rg -n "savePointStarBillboards|getSavePointStarBillboards|SAVE_POINT_STAR_" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `19` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1377` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Leppa Tree Mission-Particle Billboard Helper Preparation

Added `leppaTreeMissionParticleBillboards.js` as an isolated, tested pure visual
helper. It is not imported by `gameLoop.js` yet, so this preparation step does
not change active rendering behavior.

The narrative condition intentionally remains outside the helper. The new
helper receives an `active` boolean instead of importing or reproducing
`isOpeningLeppaTreeRequestActive(...)`. It owns only the deterministic visual
calculation:

1. Inactive effects, invalid tree positions or missing textures return an empty
   list.
2. The configured particle count is preserved.
3. Cycle, orbit radius, vertical lift, pulse, alpha and rotation are derived
   from the current frame timestamp.
4. Each billboard preserves texture, position, size, UV rectangle, alpha and
   rotation.

The next integration pass should:

1. Import the helper into `gameLoop.js`.
2. Remove the local `getLeppaTreeMissionParticleBillboards(...)`.
3. Keep `isOpeningLeppaTreeRequestActive(controls.storyState)` in
   `gameLoop.js`.
4. Pass the existing four constants through a config object at the current
   render call site.
5. Keep the render push in the same order.

Passed:

```sh
rg -n "leppaTreeMissionParticleBillboards|getLeppaTreeMissionParticleBillboards|LEPPA_TREE_MISSION_PARTICLE" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `22` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1380` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Leppa Tree Mission-Particle Billboard Helper Integration

Integrated `getLeppaTreeMissionParticleBillboards(...)` into `gameLoop.js` and
removed `29` net lines from the loop module.

Study path:

1. `gameLoop.js` imports the pure helper from
   `leppaTreeMissionParticleBillboards.js`.
2. The four existing particle constants keep their original values.
3. `LEPPA_TREE_MISSION_PARTICLE_BILLBOARD_CONFIG` groups those constants
   without changing tuning.
4. The local `getLeppaTreeMissionParticleBillboards(...)` implementation was
   removed.
5. `isOpeningLeppaTreeRequestActive(controls.storyState)` remains visible in
   `gameLoop.js` and supplies the helper's `active` argument.
6. The existing `nextFrame.render.genericBillboards.push(...)` call remains in
   the same render position.

The helper owns only deterministic visual calculation. Narrative policy,
session state, texture selection, render collection ownership and render
ordering remain in `gameLoop.js`.

Passed:

```sh
rg -n "leppaTreeMissionParticleBillboards|getLeppaTreeMissionParticleBillboards|LEPPA_TREE_MISSION_PARTICLE" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `22` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1380` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Bulbasaur Interaction-Radius Gizmo Helper Preparation

Added `bulbasaurInteractionRadiusGizmoBillboards.js` as an isolated, tested pure
visual helper. It is not imported by `gameLoop.js` yet, so this preparation
step does not change active rendering behavior.

The helper receives `interactDistance` through config instead of importing the
gameplay tuning constant. This keeps the visual ring calculation independent
from encounter policy and preserves the current dependency direction:

1. Hidden encounters, invalid positions or missing textures return an empty
   list.
2. The configured dot count is preserved.
3. Ring radius, dot pulse, alpha and rotation are derived from the current
   frame timestamp and config.
4. Each billboard preserves texture, position, size, UV rectangle, alpha and
   rotation.

The next integration pass should:

1. Import the helper into `gameLoop.js`.
2. Remove the local `getBulbasaurInteractionRadiusGizmoBillboards(...)`.
3. Pass `BULBASAUR_TALK_INTERACT_DISTANCE`,
   `BULBASAUR_INTERACTION_GIZMO_DOT_COUNT` and
   `BULBASAUR_INTERACTION_GIZMO_DOT_SIZE` through a config object.
4. Keep encounter visibility checks and render push ordering unchanged.

Passed:

```sh
rg -n "bulbasaurInteractionRadiusGizmoBillboards|getBulbasaurInteractionRadiusGizmoBillboards|BULBASAUR_INTERACTION_GIZMO" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `25` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1383` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Bulbasaur Interaction-Radius Gizmo Helper Integration

Integrated `getBulbasaurInteractionRadiusGizmoBillboards(...)` into
`gameLoop.js` and removed `21` net lines from the loop module.

Study path:

1. `gameLoop.js` imports the pure helper from
   `bulbasaurInteractionRadiusGizmoBillboards.js`.
2. `BULBASAUR_INTERACTION_RADIUS_GIZMO_CONFIG` groups the existing dot count,
   dot size and interact-distance constants without changing tuning.
3. The local `getBulbasaurInteractionRadiusGizmoBillboards(...)`
   implementation was removed.
4. The existing `nextFrame.render.genericBillboards.push(...)` call remains in
   the same render position and passes explicit helper dependencies.

The helper owns only deterministic ring-billboard calculation. Encounter
state, texture selection, render collection ownership and render ordering remain
in `gameLoop.js`.

Passed:

```sh
rg -n "bulbasaurInteractionRadiusGizmoBillboards|getBulbasaurInteractionRadiusGizmoBillboards|BULBASAUR_INTERACTION_GIZMO|BULBASAUR_INTERACTION_RADIUS_GIZMO" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `25` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1383` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Repair-Box Reveal Ray Helper Preparation

Added `repairBoxRevealRayBillboards.js` as an isolated, tested pure visual
helper. It is not imported by `gameLoop.js` yet, so this preparation step does
not change active rendering behavior.

The helper receives `clamp01` and a config object explicitly. It owns only the
ray billboard math derived from `target.progress` and `now`; the Repair Box
opening lifecycle, particle target selection and render ordering remain in
`gameLoop.js`.

The helper preserves:

1. empty output when the texture or target position is missing;
2. configured ray count;
3. progress clamping before charge calculation;
4. ray cycle, radius, lift, size, alpha and rotation;
5. texture, position, size and UV rectangle shape.

The next integration pass should:

1. Import the helper into `gameLoop.js`.
2. Remove the local `getRepairBoxRevealRayBillboards(...)`.
3. Pass `BULBASAUR_REVEAL_BOX_RAY_COUNT`,
   `BULBASAUR_REVEAL_BOX_RAY_BASE_SIZE` and the current charge-progress tuning
   through config.
4. Keep the existing `repairBoxRevealParticleTarget` render block and push
   ordering unchanged.

Passed:

```sh
rg -n "repairBoxRevealRayBillboards|getRepairBoxRevealRayBillboards|BULBASAUR_REVEAL_BOX_RAY" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `29` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1387` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Repair-Box Reveal Ray Helper Integration

Integrated `getRepairBoxRevealRayBillboards(...)` into `gameLoop.js` and
removed `26` net lines from the loop module.

Study path:

1. `gameLoop.js` imports the pure helper from
   `repairBoxRevealRayBillboards.js`.
2. `BULBASAUR_REVEAL_BOX_RAY_BILLBOARD_CONFIG` groups the existing ray count,
   base size and charge-progress tuning without changing numeric behavior.
3. The local `getRepairBoxRevealRayBillboards(...)` implementation was
   removed.
4. The existing `repairBoxRevealParticleTarget` render block remains in the
   same position and still pushes ray billboards before rustling particles.

The helper owns only deterministic ray-billboard math. Repair Box lifecycle,
target selection, texture selection, render collection ownership and render
ordering remain in `gameLoop.js`.

Passed:

```sh
rg -n "repairBoxRevealRayBillboards|getRepairBoxRevealRayBillboards|BULBASAUR_REVEAL_BOX_RAY" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `29` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1387` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Rustling-Grass Particle Helper Preparation

Added `rustlingGrassParticleBillboards.js` as an isolated, tested pure visual
helper. It is not imported by `gameLoop.js` yet, so this preparation step does
not change active rendering behavior.

The helper intentionally keeps the current positional signature from the local
`gameLoop.js` function. That lets the next integration remove the local
implementation with minimal call-site churn while preserving the two Repair Box
render paths.

The helper preserves:

1. empty output when the texture is missing;
2. the existing five-particle output;
3. particle cycle, angle, radius, size and vertical lift;
4. texture, position, size and UV rectangle shape;
5. deterministic output for a given frame timestamp.

The next integration pass should:

1. Import the helper into `gameLoop.js`.
2. Remove the local `getRustlingGrassParticleBillboards(...)`.
3. Keep both existing call sites unchanged or mechanically equivalent.
4. Preserve the current render ordering: reveal rays first, rustling particles
   second.

Passed:

```sh
rg -n "rustlingGrassParticleBillboards|getRustlingGrassParticleBillboards" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `32` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1390` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Rustling-Grass Particle Helper Integration

Integrated `getRustlingGrassParticleBillboards(...)` into `gameLoop.js` and
removed `25` net lines from the loop module.

Study path:

1. `gameLoop.js` imports the pure helper from
   `rustlingGrassParticleBillboards.js`.
2. The local `getRustlingGrassParticleBillboards(...)` implementation was
   removed.
3. Both existing call sites keep the same argument order and remain in the same
   Repair Box render block.
4. Reveal rays are still pushed before rustling particles.

The helper owns only deterministic rustling-particle math. Repair Box target
selection, texture selection, render collection ownership and render ordering
remain in `gameLoop.js`.

Passed:

```sh
rg -n "rustlingGrassParticleBillboards|getRustlingGrassParticleBillboards" app/runtime tests --glob '!*.bak'
git diff --check
npm test -- --run tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm test
npm run build
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `32` tests and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1390` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because the in-app browser backend
was not available during this pass.

### Leaf Billboard Helper Preparation

Added `leafBillboards.js` as an isolated, tested pure visual helper. It is not
imported by `gameLoop.js` yet, so this preparation step does not change active
rendering behavior.

The helper owns only billboard projection for existing leaf sources:

1. `getLeafResourceBillboards(...)` maps active matching resource nodes to leaf
   billboards.
2. `getLeafDropBillboards(...)` maps uncollected matching field drops to leaf
   billboards.
3. Item id, render-distance predicate, resource-active predicate and tuning are
   passed explicitly.
4. The helper has no imports and does not read `gameLoop.js` state.

The next integration pass should:

1. Import both helper functions into `gameLoop.js`.
2. Remove the local `getLeafResourceBillboards(...)` and
   `getLeafDropBillboards(...)` implementations.
3. Pass the existing `LEAVES_ITEM_ID`, `rendering.isResourceNodeActive`,
   `isWorldPositionWithinRenderDistance`, `NATURE_PATCH_BILLBOARD_PREPARE_DISTANCE`,
   `LEAF_RESOURCE_BILLBOARD_Y_OFFSET` and `LEAF_RESOURCE_BILLBOARD_SIZE` values
   through the helper options.
4. Preserve the current render ordering: field drops first, resource nodes
   second.

Passed:

```sh
npm test -- --run tests/leafBillboards.test.js
git diff --check
rg -n "leafBillboards|getLeafResourceBillboards|getLeafDropBillboards" app/runtime tests --glob '!*.bak'
npm test -- --run tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
```

The isolated helper test passed with `3` tests, the focused suite passed with
`35` tests and the production build passed. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1393` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because this pass did not change
active runtime wiring.

### Leaf Billboard Helper Integration

Integrated `getLeafDropBillboards(...)` and `getLeafResourceBillboards(...)`
into `gameLoop.js` and removed `41` net lines from the loop module.

Study path:

1. `gameLoop.js` imports both pure helper functions from `leafBillboards.js`.
2. The local leaf drop and leaf resource billboard implementations were
   removed from `startGameLoop()`.
3. The two render call sites now pass explicit options:
   `LEAVES_ITEM_ID`, render-distance predicate, prepare distance, leaf resource
   size and Y offset.
4. Existing ordering is unchanged: leaf drops are pushed before leaf resource
   node billboards.

The helper owns only deterministic billboard mapping. Leaf collection,
resource-node lifecycle, `rendering.isResourceNodeActive`, render-center
selection and render collection ownership remain in `gameLoop.js`.

Passed:

```sh
git diff --check
rg -n "function getLeafResourceBillboards|function getLeafDropBillboards|getLeafResourceBillboards|getLeafDropBillboards|leafBillboards" app/runtime/gameLoop.js app/runtime/leafBillboards.js tests/leafBillboards.test.js
npm test -- --run tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `35` tests, the production build passed and the
dev server returned `HTTP 200`. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1393` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not available during this pass.

### Flower Arrangement Billboard Helper Preparation

Added `flowerArrangementBillboards.js` as an isolated, tested visual helper. It
is not imported by `gameLoop.js` yet, so this preparation step does not change
active rendering behavior.

The helper intentionally preserves the current side effect on
`groundFlowerPatch`:

1. It stores `flowerArrangementSeedHash` on the patch.
2. It stores `flowerArrangementJitters` on the patch.
3. It reuses that cached jitter on later calls.

This cache belongs to the visual arrangement behavior because it keeps flowers
stable between frames. The helper also preserves the existing player reaction:
nearby player position can add scatter, lift, scale and rotation response.

The next integration pass should:

1. Import `getFlowerArrangementBillboards(...)` into `gameLoop.js`.
2. Remove the local implementation and the flower-arrangement constants from
   `gameLoop.js`.
3. Keep the existing call site inside the `groundFlowerPatches` render loop.
4. Preserve the current behavior: alive flower patches append arrangement
   billboards to `nextFrame.render.flowerBillboards`; dead flower patches still
   push the existing single dead-flower billboard.

Passed:

```sh
npm test -- --run tests/flowerArrangementBillboards.test.js
git diff --check
rg -n "flowerArrangementBillboards|getFlowerArrangementBillboards" app/runtime tests --glob '!*.bak'
npm test -- --run tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
```

The isolated helper test passed with `3` tests, the focused suite passed with
`38` tests and the production build passed. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1396` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because this pass did not change
active runtime wiring.

### Flower Arrangement Billboard Helper Integration

Integrated `getFlowerArrangementBillboards(...)` into `gameLoop.js` and removed
`83` net lines from the loop module.

Study path:

1. `gameLoop.js` imports the pure helper from
   `flowerArrangementBillboards.js`.
2. The local flower-arrangement constants were removed from `gameLoop.js`.
3. The local `getFlowerArrangementBillboards(...)` implementation was removed.
4. The existing call site inside the `groundFlowerPatches` render loop stayed
   in place and still appends to `nextFrame.render.flowerBillboards`.

The helper owns only flower billboard arrangement math plus the existing
per-patch visual cache. Flower patch selection, render-distance filtering,
alive/dead branch selection, nature revival scale and render collection
ownership remain in `gameLoop.js`.

Passed:

```sh
git diff --check
rg -n "function getFlowerArrangementBillboards|FLOWER_ARRANGEMENT|FLOWER_PLAYER_REACT|FLOWER_AMBIENT_WOBBLE|getFlowerArrangementBillboards|getStableHash\\(" app/runtime/gameLoop.js app/runtime/flowerArrangementBillboards.js tests/flowerArrangementBillboards.test.js
npm test -- --run tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `38` tests, the production build passed and the
dev server returned `HTTP 200`. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1396` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not available during this pass.

### Grass Player Bend Helper Preparation

Added `grassPlayerBend.js` as an isolated, tested visual helper. It is not
imported by `gameLoop.js` yet, so this preparation step does not change active
grass rendering behavior.

The helper preserves the current grass-player interaction math:

1. invalid patch or player inputs return a neutral bend;
2. patches at or beyond the bend radius return a neutral bend;
3. nearby player position produces the existing `offsetX`, `offsetZ` and
   `swayStrength`;
4. exact player/patch overlap preserves the current fallback behavior, including
   the large offset caused by `deltaX = 1` with `distance = 0.001`.

That overlap behavior looks surprising, but it is existing behavior and was
documented in the test instead of being changed during this refactor.

The next integration pass should:

1. Import `getGrassPlayerBend(...)` into `gameLoop.js`.
2. Remove the local `getGrassPlayerBend(...)` implementation and the
   `GRASS_PLAYER_BEND_*` constants from `gameLoop.js`.
3. Keep the existing call site in the `groundGrassPatches` render loop.
4. Preserve model-selection branches, rustle offsets, tall grass sway, Leafage
   object visuals and render ordering.

Passed:

```sh
npm test -- --run tests/grassPlayerBend.test.js
git diff --check
rg -n "grassPlayerBend|getGrassPlayerBend|GRASS_PLAYER_BEND" app/runtime tests --glob '!*.bak'
npm test -- --run tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
```

The isolated helper test passed with `4` tests, the focused suite passed with
`42` tests and the production build passed. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1400` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because this pass did not change
active runtime wiring.

### Grass Player Bend Helper Integration

Integrated `getGrassPlayerBend(...)` into `gameLoop.js` and removed `41` net
lines from the loop module.

Study path:

1. `gameLoop.js` imports `getGrassPlayerBend(...)` from `grassPlayerBend.js`.
2. The local `GRASS_PLAYER_BEND_*` constants were removed from `gameLoop.js`.
3. The local `getGrassPlayerBend(...)` implementation was removed.
4. The existing call site remains in the `groundGrassPatches` render loop.

The helper owns only grass-player bend math. Grass patch filtering,
model-selection branches, rustle offsets, tall grass sway, Leafage object
visuals and render ordering remain in `gameLoop.js`.

Passed:

```sh
git diff --check
rg -n "function getGrassPlayerBend|GRASS_PLAYER_BEND|getGrassPlayerBend|grassPlayerBend" app/runtime/gameLoop.js app/runtime/grassPlayerBend.js tests/grassPlayerBend.test.js
npm test -- --run tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `42` tests, the production build passed and the
dev server returned `HTTP 200`. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1400` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not available during this pass.

### Tall Grass Motion Helper Preparation

Added `tallGrassMotion.js` as an isolated, tested visual helper. It is not
imported by `gameLoop.js` yet, so this preparation step does not change active
grass rendering behavior.

The helper preserves the current tall-grass visual motion math:

1. `getTallGrassYaw(...)` keeps the stable hash-based yaw from patch
   `cellId:id`.
2. Missing patch identity still resolves to the same fallback yaw.
3. `getTallGrassSway(...)` keeps the ambient time/position sway.
4. Rustling encounters add the existing rustle sway term.

The next integration pass should:

1. Import `getTallGrassYaw(...)` and `getTallGrassSway(...)` into
   `gameLoop.js`.
2. Remove the local `getTallGrassYaw(...)`, local `getTallGrassSway(...)` and
   local `getStableHash(...)` from `gameLoop.js` if no longer used there.
3. Keep all existing call sites in place.
4. Preserve model-selection branches, rustle offsets, grass player bend,
   Leafage object visuals and render ordering.

Passed:

```sh
npm test -- --run tests/tallGrassMotion.test.js
git diff --check
rg -n "tallGrassMotion|getTallGrassYaw|getTallGrassSway|getStableHash" app/runtime tests --glob '!*.bak'
npm test -- --run tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
```

The isolated helper test passed with `4` tests, the focused suite passed with
`46` tests and the production build passed. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1404` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending because this pass did not change
active runtime wiring.

### Tall Grass Motion Helper Integration

Integrated `getTallGrassYaw(...)` and `getTallGrassSway(...)` into
`gameLoop.js` and removed `25` local implementation lines from the loop module.

Study path:

1. `gameLoop.js` imports tall grass motion from `tallGrassMotion.js`.
2. The local `getTallGrassYaw(...)` implementation was removed.
3. The local `getTallGrassSway(...)` implementation was removed.
4. The local `getStableHash(...)` helper was removed from `gameLoop.js`
   because no remaining game-loop code used it.
5. Existing render call sites still pass the same grass patches, rustle state
   and `now` timestamp.

The helper owns only deterministic tall-grass yaw and sway math. Grass patch
filtering, model-selection branches, rustle offsets, grass player bend,
Leafage object visuals and render ordering remain in `gameLoop.js`.

Passed:

```sh
git diff --check
rg -n "function getTallGrassYaw|function getTallGrassSway|function getStableHash|getTallGrassYaw|getTallGrassSway|tallGrassMotion" app/runtime/gameLoop.js app/runtime/tallGrassMotion.js tests/tallGrassMotion.test.js --glob '!*.bak'
npm test -- --run tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused suite passed with `46` tests, the production build passed and the
dev server returned `HTTP 200`. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1404` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Tall Grass Instance Scale Helper Extension

Moved `getTallGrassInstanceScale(...)` and the `TALL_GRASS_MIN_FOOTPRINT`
constant into `tallGrassMotion.js`. This keeps the same `1.28` minimum
footprint and preserves all existing render call sites in `gameLoop.js`.

Study path:

1. `tallGrassMotion.js` now exports `TALL_GRASS_MIN_FOOTPRINT`.
2. `tallGrassMotion.js` now exports `getTallGrassInstanceScale(...)`.
3. `gameLoop.js` imports both values and no longer owns the local scale helper.
4. Existing uses in landscape-cut renderables and grass render preparation
   remain in the same order.
5. Grass billboard fallback sizing still uses the same minimum footprint value.

The helper owns only pure tall-grass visual math. Model availability checks,
Leafage object branches, session instance pushes, player bend and render
ordering remain in `gameLoop.js`.

Passed:

```sh
git diff --check
rg -n "const TALL_GRASS_MIN_FOOTPRINT|function getTallGrassInstanceScale|getTallGrassInstanceScale|tallGrassMotion" app/runtime/gameLoop.js app/runtime/tallGrassMotion.js tests/tallGrassMotion.test.js --glob '!*.bak'
npm test -- --run tests/tallGrassMotion.test.js
npm test -- --run tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The isolated helper test passed with `7` tests, the focused suite passed with
`49` tests, the production build passed and the dev server returned `HTTP 200`.
`npm test` completed with the existing Leafage Native Tree baseline:

- `1407` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Interaction Info Billboard Helper Extraction

Added `interactionInfoBillboards.js` for small world-space UI billboards. This
removed `75` lines from `gameLoop.js` while preserving the public
`getWorkbenchInteractionParticleBillboards(...)` export through `gameLoop.js`.

Study path:

1. `interactionInfoBillboards.js` owns `createInteractionInfoBillboard(...)`.
2. It owns the Workbench interaction particle billboard math and constants.
3. It exports the existing Workbench info offset and Pokemon Center PC info
   offset used by `gameLoop.js`.
4. `gameLoop.js` still decides when to push those billboards into
   `nextFrame.render.genericBillboards`.
5. The existing `tests/workbenchRuntime.test.js` import from `gameLoop.js`
   still works, so the public helper export was preserved.

This extraction does not move placement, construction state, Workbench
interaction rules or world-space UI visibility rules. It only moves billboard
shape/math.

Passed:

```sh
git diff --check
rg -n "INTERACTION_INFO_ICON_SIZE|WORKBENCH_INFO_ICON_OFFSET|WORKBENCH_INTERACTION_PARTICLE|POKEMON_CENTER_PC_INFO_ICON_OFFSET|createInteractionInfoBillboard|getWorkbenchInteractionParticleBillboards" app/runtime/gameLoop.js app/runtime/interactionInfoBillboards.js tests/workbenchRuntime.test.js --glob '!*.bak'
npm test -- --run tests/workbenchRuntime.test.js
npm test -- --run tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The Workbench focused test passed with `8` tests, the broader focused suite
passed with `57` tests, the production build passed and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1409` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Train House Dance Helper Extraction

Added `trainHouseDance.js` for the Thermal Cabin model dance animation. This
removed `28` local implementation lines from `gameLoop.js` and moved the
`TRAIN_HOUSE_DANCE_*` tuning imports into the helper.

Study path:

1. `trainHouseDance.js` owns `applyTrainHouseDance(...)`.
2. `gameLoop.js` imports that helper for its existing internal call site.
3. `gameLoop.js` re-exports `applyTrainHouseDance(...)`, preserving the public
   test/import contract used by `tests/trainHouseRuntime.test.js`.
4. The helper still mutates the same model instance fields: base scale, base
   yaw, ground pivot, offset, scale, yaw, sway strength and active flag.
5. Thermal Cabin music, completion rules, placement/construction and render
   order remain in `gameLoop.js`.

This extraction only moves the visual dance mutation for the Thermal Cabin
model. It does not alter tuning values, home-beat conditions, audio, placement
or frame order.

Passed:

```sh
git diff --check
rg -n "applyTrainHouseDance|TRAIN_HOUSE_DANCE" app/runtime/gameLoop.js app/runtime/trainHouseDance.js tests/trainHouseRuntime.test.js --glob '!*.bak'
npm test -- --run tests/trainHouseRuntime.test.js
npm test -- --run tests/trainHouseRuntime.test.js tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The Thermal Cabin focused test passed with `5` tests, the broader focused suite
passed with `62` tests, the production build passed and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1409` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Mission Target Indicator Billboard Helper Extraction

Added `missionTargetIndicatorBillboard.js` for the small spinning mission
target marker. This moves the marker tuning and billboard math out of
`gameLoop.js` while keeping mission target resolution and render push order in
the loop.

Study path:

1. `missionTargetIndicatorBillboard.js` owns
   `createMissionTargetIndicatorBillboard(...)`.
2. The helper receives `texture`, `targetPosition`, `now` and `uvRect`
   explicitly.
3. `gameLoop.js` still resolves active mission target positions from quest and
   story state.
4. `gameLoop.js` still decides when world-space UI is visible and when the
   billboard is pushed into `nextFrame.render.genericBillboards`.
5. The helper preserves the same height, size, spin speed, bob, pixel jitter,
   alpha and rotation math.

This extraction only moves billboard shape/math. It does not change mission
resolution, quest state, HUD behavior or frame order.

Passed:

```sh
git diff --check
rg -n "MISSION_TARGET_INDICATOR|createMissionTargetIndicatorBillboard|missionTargetIndicatorBillboard" app/runtime/gameLoop.js app/runtime/missionTargetIndicatorBillboard.js tests/missionTargetIndicatorBillboard.test.js
npm test -- --run tests/missionTargetIndicatorBillboard.test.js
npm test -- --run tests/missionTargetIndicatorBillboard.test.js tests/trainHouseRuntime.test.js tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The mission-target focused test passed with `2` tests, the broader focused
suite passed with `64` tests, the production build passed and the dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1411` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Leppa Tree Music Notes Helper Extraction

Added `leppaTreeMusicNotes.js` for the revived Leppa Tree music-note particle
loop. This moves particle creation, note emission, particle aging and billboard
mapping out of `gameLoop.js`.

Study path:

1. `leppaTreeMusicNotes.js` owns `updateLeppaTreeMusicNotes(...)` and
   `getLeppaTreeMusicNoteBillboards(...)`.
2. The helper still stores runtime particle state on `leppaTree.musicNotes`,
   matching the previous behavior.
3. `gameLoop.js` still calls the update immediately after
   `gameplay.syncLeppaTreeState(...)` and `updateLeppaTreeDance(...)`.
4. `gameLoop.js` still pushes the resulting billboards into
   `nextFrame.render.genericBillboards` in the same render-prep position.
5. The helper preserves the same emit interval, max particle count, burst
   count, duration, base height, image aspects, drift, fade and wobble math.

This extraction does not change Leppa Tree revival rules, mission particles,
Leafage behavior, music/audio, quest state or frame order. It only moves the
note-particle state update and billboard mapping.

Passed:

```sh
git diff --check
rg -n "LEPPA_TREE_MUSIC_NOTE|createLeppaTreeMusicNoteParticle|resetLeppaTreeMusicNotes|updateLeppaTreeMusicNotes|getLeppaTreeMusicNoteBillboards|leppaTreeMusicNotes" app/runtime/gameLoop.js app/runtime/leppaTreeMusicNotes.js tests/leppaTreeMusicNotes.test.js
npm test -- --run tests/leppaTreeMusicNotes.test.js
npm test -- --run tests/leppaTreeMusicNotes.test.js tests/missionTargetIndicatorBillboard.test.js tests/trainHouseRuntime.test.js tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The Leppa Tree music-notes focused test passed with `3` tests, the broader
focused suite passed with `67` tests, the production build passed and the dev
server returned `HTTP 200`. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1414` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Campfire Wood Pile Billboard Helper Extraction

Added `campfireWoodPileBillboards.js` for the unlit Campfire Wood pile visual.
This moves the static wood offsets and billboard construction out of
`gameLoop.js`.

Study path:

1. `campfireWoodPileBillboards.js` owns
   `getCampfireWoodPileBillboards(...)`.
2. The helper imports `CAMPFIRE_WOOD_PILE_SIZE` from the existing presentation
   tuning module.
3. `gameLoop.js` still decides whether the campfire is spat out, lit, or
   replaced by the train-house model.
4. `gameLoop.js` still pushes the returned billboards into
   `nextFrame.render.genericBillboards` in the same render-prep position.
5. The helper preserves the same five offsets, rotations, texture, uvRect and
   size behavior.

This extraction does not change Campfire placement, crafting, lighting,
Charmander story flags, train-house model behavior or frame order. It only
moves the wood-pile billboard shape.

Passed:

```sh
git diff --check
rg -n "CAMPFIRE_WOOD_PILE|getCampfireWoodPileBillboards|campfireWoodPileBillboards" app/runtime/gameLoop.js app/runtime/campfireWoodPileBillboards.js tests/campfireWoodPileBillboards.test.js
npm test -- --run tests/campfireWoodPileBillboards.test.js
npm test -- --run tests/campfireWoodPileBillboards.test.js tests/leppaTreeMusicNotes.test.js tests/missionTargetIndicatorBillboard.test.js tests/trainHouseRuntime.test.js tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The Campfire wood-pile focused test passed with `2` tests, the broader focused
suite passed with `69` tests, the production build passed and the dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1416` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Repair Box Particle Target Helper Extraction

Added `repairBoxParticleTargets.js` for the two small Repair Box particle target
selectors. This moves the target-object shaping for rustling particles and
reveal rays out of `gameLoop.js`.

Study path:

1. `repairBoxParticleTargets.js` owns
   `getSelectedRepairBoxParticleTarget(...)` and
   `getRepairBoxRevealParticleTarget(...)`.
2. The selected target helper receives the four repair-module instances
   explicitly and returns the first active instance with an offset.
3. The reveal target helper receives active encounter candidates, the existing
   `getEncounterRepairBoxPosition(...)` callback and `clamp01`.
4. `gameLoop.js` still decides which encounter/session objects are passed in.
5. `gameLoop.js` still decides when rustling particles and reveal rays are
   pushed into render data.

This extraction does not change Repair Box opening, encounter state, Bulbasaur
or Charmander reveal timing, prompt behavior, audio, camera or frame order. It
only moves particle-target DTO construction.

Passed:

```sh
git diff --check
rg -n "getSelectedRepairBoxParticleTarget|getRepairBoxRevealParticleTarget|repairBoxParticleTargets" app/runtime/gameLoop.js app/runtime/repairBoxParticleTargets.js tests/repairBoxParticleTargets.test.js
npm test -- --run tests/repairBoxParticleTargets.test.js
npm test -- --run tests/repairBoxParticleTargets.test.js tests/campfireWoodPileBillboards.test.js tests/leppaTreeMusicNotes.test.js tests/missionTargetIndicatorBillboard.test.js tests/trainHouseRuntime.test.js tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/repairBoxRevealFlashRuntime.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The Repair Box particle-target focused test passed with `5` tests, the broader
focused suite passed with `77` tests, the production build passed and the dev
server returned `HTTP 200`. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1421` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Repair Box Prompt Target Helper Extraction

Added `repairBoxPromptTargets.js` for the Repair Box world-prompt target
selection. This moves prompt-position fallback and nearest-active-box selection
out of `gameLoop.js`.

Study path:

1. `repairBoxPromptTargets.js` owns `getRepairBoxPromptPosition(...)` and
   `getNearbyRepairBoxPrompt(...)`.
2. The prompt-position helper preserves the existing fallback order:
   encounter repair-box position, module `baseOffset`, then module `offset`.
3. The nearby prompt helper receives `playerPosition`, explicit repair-box
   targets, `promptDistance` and `getEncounterRepairBoxPosition`.
4. `gameLoop.js` still decides the target order for Hydro, Grow, Thermal and
   Builder.
5. `gameLoop.js` still decides whether world-space UI is visible and where the
   prompt sits in the prompt priority chain.

This extraction does not change Repair Box encounter state, prompt priority,
world-speech behavior, story flags, camera, input or frame order. It only moves
prompt-target DTO calculation.

Passed:

```sh
git diff --check
rg -n "getRepairBoxPromptPosition|getNearbyRepairBoxPrompt|repairBoxPromptTargets" app/runtime/gameLoop.js app/runtime/repairBoxPromptTargets.js tests/repairBoxPromptTargets.test.js
npm test -- --run tests/repairBoxPromptTargets.test.js
npm test -- --run tests/repairBoxPromptTargets.test.js tests/repairBoxParticleTargets.test.js tests/campfireWoodPileBillboards.test.js tests/leppaTreeMusicNotes.test.js tests/missionTargetIndicatorBillboard.test.js tests/trainHouseRuntime.test.js tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/repairBoxRevealFlashRuntime.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The Repair Box prompt-target focused test passed with `3` tests, the broader
focused suite passed with `80` tests, the production build passed and the dev
server returned `HTTP 200`. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1424` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Mission Target Position Helper Extraction

Added `missionTargetPositions.js` for the pure mission-target position
composition rules. This moves tracked-task, active-quest and mission-copy target
composition out of `gameLoop.js`.

Study path:

1. `missionTargetPositions.js` owns `getMissionTargetPositions(...)`.
2. The helper receives `activeQuest`, `storyState` and
   `getMissionTargetPositionsById` explicitly.
3. `gameLoop.js` still owns concrete position lookup because that depends on
   `session`, actors, companions, dry grass, Workbench, Leppa Tree, Pokemon
   Center and build-zone state.
4. `gameLoop.js` still decides when world-space UI is visible and when mission
   target indicator billboards are pushed.
5. The helper preserves tracked-task guards, active-quest objective fallback,
   TALK copy fallback and mission-target dedupe behavior.

This extraction does not change mission target aliases, quest data, story
flags, target positions, indicator visuals, HUD behavior or frame order. It
only moves target-position composition rules that do not need direct access to
`session`.

Passed:

```sh
git diff --check
rg -n "getTrackedMissionTargetPositions|getActiveQuestMissionTargetPositions|getActiveQuestObjectiveCandidates|getMissionTargetPositionsFromCopy|resolveMissionCopyValue|getMissionTargetPositions\\(|missionTargetPositions" app/runtime/gameLoop.js app/runtime/missionTargetPositions.js tests/missionTargetPositions.test.js tests/missionTargetResolver.test.js
npm test -- --run tests/missionTargetPositions.test.js tests/missionTargetResolver.test.js
npm test -- --run tests/missionTargetPositions.test.js tests/missionTargetResolver.test.js tests/repairBoxPromptTargets.test.js tests/repairBoxParticleTargets.test.js tests/campfireWoodPileBillboards.test.js tests/leppaTreeMusicNotes.test.js tests/missionTargetIndicatorBillboard.test.js tests/trainHouseRuntime.test.js tests/workbenchRuntime.test.js tests/tallGrassMotion.test.js tests/grassPlayerBend.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/repairBoxRevealFlashRuntime.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/savePointStarBillboards.test.js tests/gameLoopState.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The mission-target focused tests passed with `8` tests, the broader focused
suite passed with `88` tests, the production build passed and the dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1428` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Collectible Source Snapshot Helper Extraction

Added `collectibleSourceSnapshots.js` for the small snapshot/position helpers
used immediately around resource pickup feedback. This moves the pre-collection
snapshot DTOs and post-collection source-position detection out of
`gameLoop.js`.

Study path:

1. `snapshotAvailableWoodDrops(...)` captures uncollected wood-drop positions,
   sizes and UVs before `gameplay.collectWoodDrops(...)` mutates drops.
2. `snapshotCollectibleSources(...)` captures active resource/drop state before
   leaf, gear, carbon and Pulse Berry collection mutates sources.
3. `getNewlyCollectedDropPositions(...)` compares a drop snapshot with the
   mutated drop state.
4. `getNewlyCollectedResourcePositions(...)` compares active/cooldown state and
   expands positions by the captured `yield`.
5. `gameLoop.js` still owns when collection happens, which gameplay collection
   API is called, HUD notices, audio, particle triggers and fly-to-slot
   feedback.

This extraction does not change collection radius, inventory mutation, pickup
counts, notices, audio, particles, fly feedback, resource yields or frame
order. It only moves pure snapshot comparison helpers.

Passed:

```sh
git diff --check
rg -n "snapshotAvailableWoodDrops|snapshotCollectibleSources|getNewlyCollectedDropPositions|getNewlyCollectedResourcePositions|collectibleSourceSnapshots" app/runtime/gameLoop.js app/runtime/collectibleSourceSnapshots.js tests/collectibleSourceSnapshots.test.js
npm test -- --run tests/collectibleSourceSnapshots.test.js
npm test -- --run tests/collectibleSourceSnapshots.test.js tests/gameplayWoodDrops.test.js tests/woodCollectPopRuntime.test.js tests/gearPickupParticleRuntime.test.js tests/islandWorld.test.js
npm run build
npm test
```

The collectible snapshot focused test passed with `4` tests, the collection
focused suite passed with `84` tests and the production build passed. `npm
test` completed with the existing Leafage Native Tree baseline:

- `1432` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Supply Pickup Viewport Origin Helper Extraction

Added `supplyPickupViewportOrigin.js` for the viewport-origin calculation used
by supply pickup fly-to-slot feedback. This moves the projection/fallback DTO
helpers out of `gameLoop.js` while keeping the pickup queueing and HUD side
effects in the loop.

Study path:

1. `projectWorldPositionToViewport(...)` preserves the existing camera
   projection call, `+0.5` vertical offset, depth check and canvas-rect scaling.
2. `isViewportOriginUsable(...)` preserves the finite-coordinate check and the
   existing `64px` viewport margin.
3. `getCanvasCenterViewportOrigin(...)` preserves the canvas center fallback,
   then the window center fallback.
4. `resolveSupplyPickupViewportOrigin(...)` preserves the fallback order:
   source position, player position, canvas/window center.
5. `gameLoop.js` still owns when pickup fly feedback is queued, the
   `slice(0, 3)` cap, HUD calls and all collection-side effects.

This extraction does not change camera pose, camera input permissions, pickup
counts, collection timing, HUD fly behavior, inventory state, audio, particles
or frame order. It only moves the viewport-origin calculation for existing
pickup feedback.

Passed:

```sh
git diff --check
rg -n "projectWorldPositionToViewport|getCanvasCenterViewportOrigin|isViewportOriginUsable|resolveSupplyPickupViewportOrigin|supplyPickupViewportOrigin" app/runtime/gameLoop.js app/runtime/supplyPickupViewportOrigin.js tests/supplyPickupViewportOrigin.test.js
npm test -- --run tests/supplyPickupViewportOrigin.test.js
npm test -- --run tests/supplyPickupViewportOrigin.test.js tests/gameHudController.test.js tests/collectibleSourceSnapshots.test.js tests/gameplayWoodDrops.test.js tests/woodCollectPopRuntime.test.js tests/gearPickupParticleRuntime.test.js
npm run build
npm test
```

The supply pickup origin focused test passed with `5` tests, the HUD/pickup
focused suite passed with `45` tests and the production build passed. `npm
test` completed with the existing Leafage Native Tree baseline:

- `1437` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### World Cell Planner Picking Helper Extraction

Added `worldCellPlannerPicking.js` for the debug planner's pure cell-picking
DTOs. This moves selectable-cell collection, ground-cell projection, selection
DTO construction and nearest-pick selection out of `gameLoop.js`.

Study path:

1. `getWorldCellPlannerGroundCells(...)` owns dedupe and validity filtering
   across dead, purified and ice ground collections.
2. `projectWorldCellPlannerGroundCell(...)` preserves the existing camera
   projection, `surfaceY + 0.08` offset, depth check and canvas-rect scaling.
3. `createWorldCellPlannerSelection(...)` preserves selection shape and
   rounding while receiving grid/cold-cell decisions as callbacks.
4. `resolveWorldCellPlannerPick(...)` preserves nearest projected cell picking
   inside the existing max pixel distance.
5. `gameLoop.js` still owns debug activation, pointer-event filtering, click
   mailbox consumption, selected-cell session mutation, HUD notices and the
   concrete grid mapping callback.

This extraction does not change world-cell planner activation, pointer
handling, selected-cell state, placement/construction rules, camera behavior,
notices, render highlights or frame order. It only moves debug picking DTO
calculation.

Passed:

```sh
git diff --check
rg -n "getWorldCellPlannerGroundCells|projectWorldCellPlannerGroundCell|createWorldCellPlannerSelection|resolveWorldCellPlannerPick|worldCellPlannerPicking" app/runtime/gameLoop.js app/runtime/worldCellPlannerPicking.js tests/worldCellPlannerPicking.test.js
npm test -- --run tests/worldCellPlannerPicking.test.js tests/worldCellPlannerClickRuntime.test.js
npm test -- --run tests/worldCellPlannerPicking.test.js tests/worldCellPlannerClickRuntime.test.js tests/gameLoopFrameRuntime.test.js tests/gameplayOpeningShip.test.js
npm run build
npm test
```

The world-cell planner picking focused tests passed with `10` tests, the
broader focused suite passed with `18` tests and the production build passed.
`npm test` completed with the existing Leafage Native Tree baseline:

- `1443` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Bot Reveal Motion Helper Extraction

Added `botRevealMotion.js` for Repair Box bot reveal positioning and fall
motion. This moves landing/origin calculation, visibility flag compatibility
and the falling interpolation out of `gameLoop.js`.

Study path:

1. `getBotRevealLandingPosition(...)` preserves the repair-position landing
   copy.
2. `getBotRevealOriginPosition(...)` preserves the Repair Box position fallback
   before landing position and receives fall height explicitly.
3. `revealBotAtRepairPosition(...)` preserves encounter mutation shape:
   `visible`, `jumpTimer`, `originPosition`, `landingPosition` and `position`.
4. `isRevealBoxBotVisible(...)` and `setRevealBoxBotVisible(...)` preserve both
   old visibility flag names: `botVisible` and `bulbasaurVisible`.
5. `updateBotRevealFall(...)` preserves fall start/end progress, quadratic fall
   easing, landing bounce and cleanup when settled.
6. `gameLoop.js` still owns reveal-box opening timing, SFX, flash runtime,
   hide-box behavior, `onComplete`, model sync and encounter lifecycle.

This extraction does not change reveal duration, SFX timing, flash behavior,
Repair Box active state, bot visibility timing, model sync, camera, input or
frame order. It only moves motion/position helpers that are configured by the
existing constants in `gameLoop.js`.

Passed:

```sh
git diff --check
rg -n "botRevealMotion|getBotRevealLandingPosition|getBotRevealOriginPosition|revealBotAtRepairPosition|isRevealBoxBotVisible|setRevealBoxBotVisible|updateBotRevealFall" app/runtime/gameLoop.js app/runtime/botRevealMotion.js tests/botRevealMotion.test.js
npm test -- --run tests/botRevealMotion.test.js
npm test -- --run tests/botRevealMotion.test.js tests/repairBoxParticleTargets.test.js tests/repairBoxRevealFlashRuntime.test.js tests/repairBoxRevealRayBillboards.test.js tests/repairBoxMotionRuntime.test.js
npm run build
npm test
```

The bot reveal motion focused test passed with `6` tests, the Repair Box/reveal
focused suite passed with `21` tests and the production build passed. `npm
test` completed with the existing Leafage Native Tree baseline:

- `1449` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Player Model Motion Helper Extraction

Added `playerModelMotion.js` for pure visual motion math used by the player
model. This moves yaw-from-movement, walk leg offsets, walk-cycle advancement,
body bob, jump-flip roll, foot roll and arm-back offset formulas out of
`gameLoop.js`.

Study path:

1. `getPlayerModelYawFromMovement(...)` preserves the movement-delta yaw and
   face-yaw offset formula.
2. `getPlayerWalkLegArcOffset(...)`, `getPlayerWalkFootRoll(...)`,
   `getPlayerWalkBodyLift(...)` and `getPlayerWalkArmBackOffset(...)` preserve
   the existing visual formulas while receiving tuning values explicitly.
3. `advancePlayerWalkCycle(...)` preserves speed acceleration/deceleration,
   phase advancement above the idle threshold and blend calculation.
4. `advancePlayerJumpFlipRoll(...)` preserves jump-flip elapsed clamping and
   roll calculation.
5. `gameLoop.js` still owns `session` mutation, sound trigger, player position,
   model instance sync, turn interpolation, input-derived movement delta and all
   tuning constants.

This extraction does not change player movement, input, camera, model scale,
turn speed, walk timing, leg/arm sync, jump SFX, render order or gameplay
state. It only moves visual math into a tested helper.

Passed:

```sh
git diff --check
rg -n "playerModelMotion|getPlayerModelYawFromMovement|advancePlayerWalkCycle|getPlayerWalkLegArcOffset|getPlayerWalkBodyLift|advancePlayerJumpFlipRoll|getPlayerWalkFootRoll|getPlayerWalkArmBackOffset" app/runtime/gameLoop.js app/runtime/playerModelMotion.js tests/playerModelMotion.test.js
npm test -- --run tests/playerModelMotion.test.js
npm test -- --run tests/playerModelMotion.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js tests/renderFrameController.test.js tests/characterFactory.test.js tests/playerDustParticles.test.js
npm run build
npm test
```

The player model motion focused test passed with `6` tests, the broader
frame/render focused suite passed with `28` tests and the production build
passed. `npm test` completed with the existing Leafage Native Tree baseline:

- `1455` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Model Facing Helper Extraction

Added `modelFacing.js` for pure yaw math shared by model-facing callers. This
moves the generic "face a world position" formula and model face-yaw offset
calculation out of `gameLoop.js` while preserving the local bot-specific
wrappers that carry Squirtle/Bulbasaur/Charmander constants.

Study path:

1. `getYawToward(fromPosition, toPosition)` preserves the previous
   ground-plane `Math.atan2(deltaX, deltaZ)` formula.
2. `getModelYawToward(...)` applies the visual model face-yaw offset without
   changing the logical direction.
3. `getLogicalFacingYaw(...)` converts visual model yaw back to logical facing
   with the same `(yaw || 0) - offset` fallback behavior.
4. `gameLoop.js` still owns session lookups, model-specific constants,
   companion/encounter decisions and all side effects.

This extraction does not change any 3D orientation tuning, offsets, camera,
input, field moves, placement, render order or interaction behavior. It only
gives the yaw math an explicit tested boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/modelFacing.test.js
npm test -- --run tests/modelFacing.test.js tests/botAttentionFacing.test.js tests/playerModelMotion.test.js tests/chopperNpcActor.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The model facing focused test passed with `3` tests, the broader
model-orientation focused suite passed with `21` tests, the production build
passed with the existing chunk-size warning, and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1458` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### World Speech Snapshot Frame Helper Extraction

Added an internal `updateWorldSpeechSnapshotFrame(nextFrame, state)` helper
inside `startGameLoop()`. This moves the `nextFrame.worldSpeech` write chain out
of the body of `frame(now)`.

Study path:

1. The helper receives already-resolved speech condition booleans; it does not
   calculate quest, placement, prompt or field-move state.
2. Tangrowth, repair-box, Bulbasaur and Charmander speech writes keep the same
   order and text.
3. The companion-lost hint still only runs if no earlier world speech was made
   visible.
4. Chopper's attention cue still only runs after companion-lost hint fallback
   and still consumes the sound cycle before playing `CHOPPER_VOICE`.
5. World prompt selection remains in `frame(now)` after the speech snapshot
   helper, so prompt priority is unchanged.

This extraction does not change narrative text, world-speech priority, companion
hint timing, Chopper cue sound behavior, placement, field moves, render output,
camera behavior or frame order. It only gives world-speech snapshot writes a
local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/worldSpeechController.test.js tests/companionLostHintRuntime.test.js tests/chopperAttentionCueRuntime.test.js tests/soundEventRuntime.test.js tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused world-speech snapshot suite passed with `33` tests and the
production build passed with the existing chunk-size warning. The dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### World-Space UI Context Frame Helper Extraction

Added an internal `prepareWorldSpaceUiFrameContext(state)` helper inside
`startGameLoop()`. This moves the initial world-space UI context setup out of
the body of `frame(now)`.

Study path:

1. The helper resolves Tangrowth's current world position from the same NPC
   actor lookup.
2. World-space UI visibility still uses `resolveWorldSpaceUiVisibility(...)`
   with the same opening camera lock and current flow state inputs.
3. The Workbench green-arrow cue still updates at the same frame phase, after
   base render snapshot setup and before speech/prompt conditions.
4. The cue still depends on the same active quest, task, system quest and story
   state values.
5. The helper returns only `canShowWorldSpaceUi` and `tangrowthPosition`; all
   speech, prompt and companion cue rules remain in `frame(now)`.

This extraction does not change world-speech ordering, prompt text, Workbench
cue tuning, placement, field moves, render output, camera behavior or frame
order. It only gives the initial world-space UI context a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/workbenchRuntime.test.js tests/gameplayUiVisibilityController.test.js tests/worldSpeechController.test.js tests/gameLoopFrameRuntime.test.js tests/frameSnapshotController.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused world-space UI context suite passed with `30` tests and the
production build passed with the existing chunk-size warning. The dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Base Render Snapshot Frame Helper Extraction

Added an internal `updateBaseRenderSnapshotFrame(nextFrame, state)` helper
inside `startGameLoop()`. This moves base render snapshot writes and the adjacent
model-sync calls out of the body of `frame(now)`.

Study path:

1. The helper still runs after HUD snapshot writes and before world-space UI
   speech/prompt resolution.
2. Camera view-projection calculation still uses `worldCanvas.width` and
   `worldCanvas.height` at the same frame phase.
3. Repair-box highlight, Greenhouse model, Campfire/Train House model, Leaf Den
   construction clouds, Leaf Den model and player-house model sync still run in
   the same sequence.
4. Interaction object highlight still receives the same nearby interactable and
   workbench rotation target inputs.
5. Base render fields still write to the same `nextFrame.render` properties:
   `viewProjection`, `sceneObjects`, `skyTexture` and `psxDistanceFog`.
6. PSX distance fog still resolves from the same cinematic/gameplay scene id.

This extraction does not change model sync timing, render output, fog config,
interaction highlighting, placement, field moves, camera behavior or frame
order. It only gives the base render snapshot preparation a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js tests/renderFrameController.test.js tests/interactionObjectHighlight.test.js tests/psxDistanceFogConfig.test.js tests/gameplayOpeningShip.test.js tests/camera.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused base-render snapshot suite passed with `30` tests and the
production build passed with the existing chunk-size warning. The dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Lightweight UI Snapshot Frame Helpers Extraction

Added internal `updateHudSnapshotFrame(nextFrame, state)` and
`updateFrameStatusPopups(nextFrame, state)` helpers inside `startGameLoop()`.
These move lightweight UI snapshot writes out of the body of `frame(now)`.

Study path:

1. `updateHudSnapshotFrame(...)` keeps the same HUD visibility gates:
   opening camera lock, opening HUD hidden, cinematic, tutorial, Pokedex and
   skill-learn states.
2. HUD state, inventory, player position, prompt copy and input modality still
   write to the same `nextFrame.hud` fields.
3. `updateFrameStatusPopups(...)` keeps the dry-grass hint write behind the
   same `nearbyDryGrassHintTarget && session.playerCharacter` gate.
4. Quest completion task pop still calls `gameplay.getQuestCompletionPop?.()`
   at the same frame phase and keeps the same opening/cinematic/tutorial/Pokedex
   visibility gates.
5. The helper does not calculate prompt text, notices, quest state or hint
   targets; those values are still resolved before the snapshot write.

This extraction does not change HUD text, prompt text, dry-grass hint targeting,
quest completion pop timing, placement, field moves, render output, camera
behavior or frame order. It only gives lightweight UI snapshot writes a local
boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/gameHudController.test.js tests/gameplayUiVisibilityController.test.js tests/worldPromptState.test.ts tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js tests/taskPresentation.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused UI snapshot suite passed with `52` tests and the production build
passed with the existing chunk-size warning. The dev server returned `HTTP 200`.
`npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Ground-Cell Highlight Frame Helper Extraction

Added an internal `updateGroundCellHighlightFrame(nextFrame, state)` helper
inside `startGameLoop()`. This moves the final write step for
`nextFrame.groundCellHighlight` out of the body of `frame(now)`.

Study path:

1. The helper does not calculate placement, workbench, Fire, field-tool or
   feedback targets; those values are still resolved before the call.
2. Placement preview highlights still keep the same priority order:
   Solar Station, Greenhouse, Campfire, House Kit.
3. Workbench rotation, Fire target and generic ground-cell guidance still use
   the same fallback order after placement highlights.
4. Marked action cells and ground-action feedback still append after the primary
   highlight branch.
5. Field-tool pulse data still writes last, preserving its previous ability,
   scale, brightness and progress fields.

This extraction does not change placement rules, field-move rules, highlight
tuning, feedback timing, render output, camera behavior or frame order. It only
gives the ground-cell highlight snapshot mutation a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/groundCellHighlightController.test.js tests/groundActionFeedbackRuntime.test.js tests/placementPreviewVisual.test.js tests/worldObjectPlacementPreview.test.js tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused ground-cell highlight suite passed with `26` tests and the
production build passed with the existing chunk-size warning. The dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Render Snapshot Context Helper Extraction

Added an internal `prepareRenderSnapshotContext({ cinematicActive })` helper
inside `startGameLoop()`. This moves the render snapshot prelude out of the body
of `frame(now)` without moving the render loops themselves.

Study path:

1. The helper still runs at the start of render snapshot preparation.
2. Tall-grass, garden, native-tree and dead-grass instance buffers are still
   cleared before the ground grass loop repopulates them.
3. `grassBendPlayerPosition`, `natureRenderCenter` and `grassCollisionObjects`
   are still calculated before grass and flower render preparation.
4. Repair-box particle targets are still resolved before the rustling/reveal
   billboard branch.
5. `shouldShowRepairBoxRustlingParticles` still starts as `false` and remains
   mutable in `frame(now)` for the ground grass loop to update.

This extraction does not change render output, culling distances, repair-box
particles, grass bending, placement, field moves, camera behavior or frame
order. It only gives the render snapshot setup values a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/renderCulling.test.js tests/grassPlayerBend.test.js tests/repairBoxParticleTargets.test.js tests/repairBoxRevealRayBillboards.test.js tests/frameSnapshotController.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused render-context suite passed with `26` tests and the production
build passed with the existing chunk-size warning. The dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Passive Effect Frame Helper Extraction

Added an internal `updatePassiveEffectFrames(deltaTime)` helper inside
`startGameLoop()`. This moves the passive visual effect update block out of the
body of `frame(now)` while preserving the exact update order.

Study path:

1. The helper still runs after player movement and dust updates.
2. Nature revival effects still update first from `session.natureRevivalEffects`.
3. Tree revival leaf bursts, Wood collect pops and Gear pickup particles still
   update in the same sequence.
4. The helper has no return value; it only groups existing passive visual
   side effects that already ran sequentially.

This extraction does not change effect tuning, gameplay actions, placement,
field moves, render output, camera behavior or frame order. It only gives the
passive effect update portion of the frame a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/natureRevivalEffects.test.js tests/treeRevivalLeafBurstRuntime.test.js tests/woodCollectPopRuntime.test.js tests/gearPickupParticleRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused passive-effect suite passed with `16` tests and the production
build passed with the existing chunk-size warning. The dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Gameplay Camera Frame Helper Extraction

Added an internal `updateGameplayCameraFrame(...)` helper inside
`startGameLoop()`. This moves the camera-follow decision block out of the body
of `frame(now)` while keeping the camera priority order and tuning unchanged.

Study path:

1. The helper still skips all camera-follow decisions while cinematic flow is
   active.
2. Tutorial camera focus still wins first and applies the same hard-coded pose:
   target height `1.25`, zoom `3.95` and distance `7.35`.
3. Foundation build-zone camera focus still holds the existing pose and does not
   issue a new camera command.
4. Gameplay opening camera still runs before normal player follow when the
   opening frame has not been skipped.
5. Opening camera follow still uses the same gate:
   `!dialogueActive && !cameraTransitionActive && !scriptedInteractionActive`.
6. Normal camera follow still requires a player character, no dialogue and no
   active camera target transition.
7. The helper returns the updated `gameplayOpeningCameraFrame` because the
   presentation handoff below still uses that frame state.

This extraction does not change camera tuning, camera priority, opening timing,
dialogue/scripted-interaction gates, placement, field moves, render output or
frame order. It only gives the camera decision block a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/camera.test.js tests/gameplayCameraDirector.test.js tests/dialogueCameraController.test.js tests/foundationBuildZoneCameraFocusRuntime.test.js tests/gameplayOpeningShip.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused camera/opening/focus suite passed with `27` tests and the production
build passed with the existing chunk-size warning. The dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Frame Scene Sync Helper Extraction

Added an internal `updateFrameSceneSync(...)` helper inside `startGameLoop()`.
This moves the first per-frame scene synchronization block out of the body of
`frame(now)`.

Study path:

1. The helper still runs after pause handling and before gameplay opening
   context begins.
2. Canvas resize still happens before `camera.update(deltaTime)`.
3. Interaction highlights are still cleared immediately after the camera update.
4. Workbench interactable sync and Pokemon Center workshop visual sync still run
   before opening/input blocker resolution.
5. The helper does not return state; it only groups existing side effects that
   were already sequential and local to the frame.

This extraction does not change camera tuning, highlight behavior, workbench
state, Pokemon Center workshop visuals, opening locks, placement, field moves,
render output or frame order. It only gives the scene-sync prelude of the frame
a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/camera.test.js tests/interactionObjectHighlight.test.js tests/gameLoopFrameRuntime.test.js tests/frameSnapshotController.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused camera/highlight/frame suite passed with `16` tests and the
production build passed with the existing chunk-size warning. The dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Early Gameplay Control Frame Helper Extraction

Added an internal `updateEarlyGameplayControlFrame(...)` helper inside
`startGameLoop()`. This moves the first control-maintenance block after input
runtime updates out of the body of `frame(now)`.

Study path:

1. `processWorldCellPlannerClick()` still runs before the intro-room early
   frame branch.
2. The intro-room branch still calls `updateIntroRoomFrame(...)` with the same
   scene, camera, canvas, frame snapshot and `deltaTime` inputs.
3. When intro-room rendering handles the frame, the helper still commits the
   frame immediately and returns `committedEarlyFrame: true`; `frame(now)` still
   owns the `requestAnimationFrame(frame)` scheduling and `return`.
4. Pending actions and movement input are still cleared only when the blocker
   policy says so.
5. Rustling grass still advances after blocked input cleanup and before camera
   input processing.

This extraction does not change intro timing, frame commit semantics,
world-cell planner behavior, input clearing, rustling grass timing, placement,
field moves, render output or camera order. It only gives the early control
maintenance portion of the frame a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js tests/introRoomScene.test.js tests/worldCellPlannerClickRuntime.test.js tests/worldCellPlannerPicking.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused early-frame/control suite passed with `27` tests and the production
build passed with the existing chunk-size warning. The dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Gameplay Presentation Frame Helper Extraction

Added an internal `updateGameplayPresentationFrame(...)` helper inside
`startGameLoop()`. This moves the frame's opening/audio/music/HUD-reveal
handoff out of the body of `frame(now)` while keeping the later prompt and
render preparation in place.

Study path:

1. `frame(now)` still runs gameplay actions, camera follow and collision updates
   before this helper.
2. `updateGameplayPresentationFrame(...)` still updates opening ship audio
   before driving audio.
3. Driving audio still uses the previous condition:
   `playerMovedThisFrame || gameplayOpeningCameraFrame?.phase === "player-exit"`.
4. Train house music and `gameplay.musicRuntime` still receive the same
   `nowSeconds` value derived from the current frame timestamp.
5. Opening HUD reveal still runs before reading the latest opening camera frame
   and HUD-hidden state.
6. The helper returns `gameplayOpeningCameraFrame`, `gameplayOpeningHudHidden`
   and `currentFlowState` because the prompt/target/render preparation below
   still owns those decisions.

This extraction does not change audio tuning, music timing, opening HUD timing,
camera behavior, prompt logic, placement, field moves, render output or frame
order. It only gives the presentation handoff portion of the frame a local
boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/gameplayOpeningShip.test.js tests/audioMixRuntime.test.js tests/musicRuntime.test.js tests/gameLoopFramePolicies.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused opening/audio/music suite passed with `23` tests and the production
build passed with the existing chunk-size warning. The dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Gameplay Input Frame Helper Extraction

Added an internal `updateGameplayInputFrame(...)` helper inside
`startGameLoop()`. This moves the gameplay input runtime update, input modality
panel update and camera debug frame overlay update out of the body of
`frame(now)`.

Study path:

1. `frame(now)` still resolves opening state and movement blockers before
   updating gameplay input.
2. `updateGameplayInputFrame(...)` still passes the same gameplay, cinematic,
   movement, placement, dialogue, tutorial, skill-learn and scripted-interaction
   gates to `gameplayInputRuntime.update(...)`.
3. The input modality panel still updates immediately after the gameplay input
   runtime consumes the frame.
4. `cameraTransitionActive` is still read from `camera.isTargetTransitionActive()`
   at the same point in the frame.
5. The camera debug overlay still receives the same flow state, blocker state,
   opening movement lock and camera transition state.
6. The helper returns `cameraTransitionActive` because later camera-follow logic
   still owns that decision in `frame(now)`.

This extraction does not change input mapping, movement blockers, camera debug
payload shape, camera behavior, placement, field moves, HUD copy, render output
or frame order. It only gives the input/debug portion of the frame a local
boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/gameInputController.test.js tests/inputModality.test.js tests/cameraDebugFrameState.test.js tests/cameraDebugRuntime.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused input/debug suite passed with `65` tests and the production build
passed with the existing chunk-size warning. The dev server returned `HTTP 200`.
`npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Camera Input Frame Helper Extraction

Added an internal `updateCameraInputFrame(...)` helper inside `startGameLoop()`.
This moves the frame's camera input consumption out of the body of `frame(now)`
without creating a new runtime or changing when camera input is processed.

Study path:

1. `frame(now)` still updates opening/input blockers, clears blocked actions and
   advances rustling grass before camera input.
2. `updateCameraInputFrame(...)` still calls
   `resolveCameraInputPermissions(...)` with the same player, opening camera
   lock, foundation focus, builder panel, placement preview, tutorial camera
   and flow-state inputs.
3. Zoom-cycle requests are still consumed every frame; they only cycle the zoom
   preset and play `UI_NAVIGATE` when `canCycleCameraZoom` is true.
4. Keyboard turn keys and pointer/gamepad look delta still combine into one
   orbit rotation.
5. Tutorial camera-look registration still happens only when rotation is
   allowed and actual look input was applied.
6. Blocked camera look still clears pending look input through
   `controls.clearCameraLookInput?.()`.

This extraction does not change camera tuning, zoom behavior, tutorial gates,
opening locks, placement locks, input mapping, field moves, render output or
camera ordering. It only gives the camera input portion of the frame a local
boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/gameLoopFramePolicies.test.js tests/cameraZoomPresetController.test.js tests/gameInputController.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused camera-policy/input suite passed with `60` tests and the production
build passed with the existing chunk-size warning. The dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Player Movement Frame Helper Extraction

Added an internal `updatePlayerMovementFrame(...)` helper inside
`startGameLoop()`. This moves the player movement update block out of the body
of `frame(now)` without creating a new runtime or changing frame order.

Study path:

1. `frame(now)` still resolves placement previews and spawn effects before
   player movement.
2. `updatePlayerMovementFrame(...)` still calls
   `resolvePlayerMovementPermission(...)` with the same flow state,
   player-existence and foundation-camera-focus inputs.
3. When movement is allowed, the helper preserves the same order:
   player update, jump flip, moved-distance calculation, run breadcrumb prompt,
   companion follow direction, player model sync, zoom restore and movement
   quest update.
4. When movement is blocked, the helper still only syncs the player model.
5. Player dust still updates immediately after movement permission is resolved,
   and the helper returns `playerMovedThisFrame` for the driving-audio gate
   later in the frame.

This extraction does not change movement tuning, input mapping, camera tuning,
opening locks, tutorial locks, quest rules, field moves, placement or render
output. It only gives the movement portion of the frame a local boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/gameLoopFramePolicies.test.js tests/movementQuestRuntime.test.js tests/runBreadcrumbPromptRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The focused movement-policy/runtime suite passed with `16` tests and the
production build passed with the existing chunk-size warning. The dev server
returned `HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Mission Target Position Lookup Helper Extraction

Added `missionTargetPositionLookup.js` for resolving a single mission target id
into world positions. This moves NPC, companion, dry-grass, static world-target
and fallback lookup rules out of `gameLoop.js`, while keeping mission target
aggregation in the existing `missionTargetPositions.js` helper.

Study path:

1. `getMissionTargetPositionsById(...)` still normalizes target aliases through
   `resolveMissionTargetAliasId(...)`.
2. NPC targets keep the previous position priority:
   `character.getPosition()`, actor `position`, then actor `offset`.
3. Companion targets keep their existing position/repair-position/module
   fallback order for Hydro, Grow, Thermal and Builder bots.
4. Dry grass targets still skip alive/invalid patches and sort by distance
   from the player when a player position exists.
5. Static and session-backed targets still cover Workbench, Leppa Tree, Ruined
   Pokemon Center and foundation wall.
6. `gameLoop.js` still owns the live `session`, Workbench position, Ruined
   Pokemon Center fallback and foundation-zone callback.

This extraction does not change mission copy parsing, mission target
aggregation, placement, field moves, quest state or render order. It only moves
target id lookup into a tested helper.

Passed:

```sh
git diff --check
npm test -- --run tests/missionTargetPositionLookup.test.js
npm test -- --run tests/missionTargetPositionLookup.test.js tests/missionTargetPositions.test.js tests/missionTargetResolver.test.js tests/missionTargetIndicatorBillboard.test.js tests/renderFrameController.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The mission target lookup focused test passed with `5` tests, the broader
mission-target focused suite passed with `26` tests, the production build
passed with the existing chunk-size warning, and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1473` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Rebirth Of Nature Ghost-Tree Helper Extraction

Added `rebirthOfNatureGhostTree.js` for the visual ghost tree preview used by
the Rebirth of Nature mission. This moves the mission-preview constants,
mission-active check, target-cell lookup, alpha pulse and instance append out
of `gameLoop.js`.

Study path:

1. `isRebirthOfNatureMissionActive(...)` preserves the previous flag gate:
   Bulbasaur's dry-grass request must be turned in and
   `rebirthOfNatureComplete` must be false.
2. `getRebirthOfNatureGroundCell(...)` still searches dead ground instances
   before purified ground instances for `ground-110-82`.
3. `getRebirthOfNatureGhostTreeAlpha(...)` preserves the same sine pulse,
   speed and max alpha.
4. `appendRebirthOfNatureGhostTree(...)` appends the same
   `rebirth-of-nature-tree-preview` instance shape, offset, scale, tint,
   tint strength, yaw and sway strength.
5. `gameLoop.js` still calls the helper at the same render-prep point, after
   grass billboards and before landscape cut effects.

This extraction does not change Leafage behavior, mission completion logic,
tree growth rules, placement, field moves, camera or render order. It only
moves a visual preview assembly into a tested helper.

Passed:

```sh
git diff --check
npm test -- --run tests/rebirthOfNatureGhostTree.test.js
npm test -- --run tests/rebirthOfNatureGhostTree.test.js tests/tallGrassMotion.test.js tests/renderFrameController.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The Rebirth of Nature ghost-tree focused test passed with `5` tests, the
broader visual/render focused suite passed with `23` tests, the production
build passed with the existing chunk-size warning, and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1468` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Camera Debug Frame-State Helper Extraction

Added `cameraDebugFrameState.js` for the pure payload sent to
`cameraDebugRuntime.update(...)`. This moves debug overlay DTO composition out
of `gameLoop.js` while keeping `gameLoop.js` responsible for reading live
runtime state from controls, camera, gameplay and session.

Study path:

1. `createCameraDebugFrameState(...)` preserves the previous payload shape:
   `frame`, `flow`, `blockers`, `camera`, `quest`, `player` and `ship`.
2. Frame time is still rounded with `Math.round(now)`.
3. Camera state still receives the gameplay camera director state first, then
   opening-input lock, transition activity and current camera pose.
4. Quest, player and ship values keep the same nullable fallback behavior.
5. `gameLoop.js` still decides whether camera debug is enabled and still owns
   all live runtime reads before passing values to the helper.

This extraction does not change gameplay, camera behavior, input blockers,
render order or debug overlay DOM behavior. It only gives the frame debug
payload an explicit tested boundary.

Passed:

```sh
git diff --check
npm test -- --run tests/cameraDebugFrameState.test.js
npm test -- --run tests/cameraDebugFrameState.test.js tests/cameraDebugRuntime.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js tests/renderFrameController.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The camera debug frame-state focused test passed with `2` tests, the broader
camera/debug/frame focused suite passed with `23` tests, the production build
passed with the existing chunk-size warning, and the dev server returned
`HTTP 200`. `npm test` completed with the existing Leafage Native Tree
baseline:

- `1463` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

### Interaction Debug Collider Helper Extraction

Added `interactionDebugColliders.js` for debug-only collider DTO assembly. This
moves the interaction trigger collider builder out of `gameLoop.js` while
keeping the local wrapper that wires current `session`, `storyState`,
`rendering` filters and interaction-distance constants.

Study path:

1. `createDebugAreaCollider(...)` preserves the previous debug collider shape:
   `id`, ground-plane `position`, `size`, raised `surfaceY` and
   `blocksPlayer`.
2. `getActorDebugPosition(...)` preserves the priority order of
   `character.getPosition()`, actor `position`, then actor `offset`.
3. `getInteractionDebugColliders(...)` still filters NPCs, interactables and
   resource nodes through the existing rendering activity callbacks.
4. Grow Bot, wood drops, field drops and Leppa Berry drops keep the same ids,
   radii, surface heights and fallback behavior.
5. `gameLoop.js` still decides when debug colliders are appended to
   `nextFrame` and still combines them with elevated terrain colliders.

This extraction does not change normal gameplay, collision, field moves,
placement, render order or debug flag parsing. It only moves debug overlay DTO
construction into a tested helper.

Passed:

```sh
git diff --check
npm test -- --run tests/interactionDebugColliders.test.js
npm test -- --run tests/interactionDebugColliders.test.js tests/colliderGizmoOverlay.test.js tests/runtimeFlags.test.js tests/renderFrameController.test.js tests/gameLoopFrameRuntime.test.js
npm run build
npm test
npm run dev -- --host 127.0.0.1
curl -sI http://127.0.0.1:5173/
```

The interaction debug collider focused test passed with `3` tests, the broader
debug/render focused suite passed with `21` tests, the production build passed
with the existing chunk-size warning, and the dev server returned `HTTP 200`.
`npm test` completed with the existing Leafage Native Tree baseline:

- `1461` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because only the local HTTP
smoke was run during this pass.

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

The next integration pass completed later:

1. Create `createCompanionLostHintRuntime(...)` inside `startGameLoop()`.
2. Move the pure `resolveWaterGunCompanionLostHint(...)` decision into the
   `companions` boundary.
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

1. Historical note: at this step, `resolveWaterGunCompanionLostHint(...)`
   remained local; the later Companion Lost Hint Resolver Extraction moved the
   pure Water Gun hint decision into `companionLostHintRuntime.js`.
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
