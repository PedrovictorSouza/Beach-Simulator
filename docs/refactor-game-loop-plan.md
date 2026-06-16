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
- Completed: move direct destroy/interact action request handling into the
  existing `player` action runtime.
- Completed: move held Water Gun primary-action fallback handling into the
  existing `player` action runtime.
- Completed: move primary field-move action dispatch into the existing
  `player` action runtime.
- Completed: move primary auto field-move target dispatch into the existing
  `player` action runtime.
- Completed: move primary player action fallback/feedback branch orchestration
  into the existing `player` action runtime.
- Completed: move primary player action frame context preparation into the
  existing `player` action runtime.
- Completed: move player action equipment and frame action orchestration into
  the existing `player` action runtime.
- Completed: move dialogue camera controller into the `camera` boundary.
- Completed: move placement camera assist into the `camera` boundary.
- Completed: move construction billboard builders into the `construction`
  boundary.
- Completed: move construction cloud effects into the `construction` boundary.
- Completed: move Leaf Den construction state policy into the `construction`
  boundary.
- Completed: move construction house model instance sync into the
  `construction` boundary.
- Completed: move construction helper companion motion into the `construction`
  boundary.
- Completed: move placement preview prompt copy into the `construction`
  boundary.
- Completed: move HUD prompt copy priority into the `presentation` boundary.
- Completed: move world prompt copy into the `presentation` boundary.
- Completed: move pending placement intent handling into the `construction`
  boundary.
- Completed: move dry grass prompt target selection into the `presentation`
  boundary.
- Completed: move supply counter prompt handling into the `presentation`
  boundary.
- Completed: move Free Block preview target/sync flow into the `construction`
  boundary.
- Completed: move Free Block foundation progress/active-zone session policy into
  the `construction` boundary.
- Completed: move Free Block foundation presentation builders into the
  `construction` boundary.
- Completed: move Free Block post-placement player displacement into the
  `construction` boundary.
- Completed: move companion follow formation index resolution into the
  `companions` boundary.
- Completed: move status popup frame writes into the `presentation` boundary.
- Completed: move HUD snapshot frame writes into the `presentation` boundary.
- Completed: move companion status billboard builders into the `companions`
  boundary.
- Completed: move Hydro Bot charging billboards into the `companions`
  boundary.
- Completed: move Water Gun spray billboards into the `fieldMoveRuntime`
  boundary.
- Completed: move Charmander Fire billboards into the `fieldMoveRuntime`
  boundary.
- Completed: move Bulbasaur Leafage billboards into the `fieldMoveRuntime`
  boundary.
- Completed: move field-move approach positions into the `fieldMoveRuntime`
  boundary.
- Completed: move field-move actor/emitter positions into the
  `fieldMoveRuntime` boundary.
- Completed: move Solar Station power-radius helpers into the `construction`
  boundary.
- Completed: move Solar Station placement blockers into the `construction`
  boundary.
- Completed: move world-object placement blockers into the `construction`
  boundary.
- Completed: move placement geometry into the `construction` boundary.
- Completed: move placement footprint cells into the `construction` boundary.
- Completed: move snapped placement preview position into the `construction`
  boundary.
- Completed: move foundation build-zone geometry into the `construction`
  boundary.
- Completed: move foundation build-zone candidate origins into the
  `construction` boundary.
- Completed: move Build Block approach/displacement positions into the
  `fieldMoveRuntime` boundary.
- Completed: move Build Block placement notices and cost marker formatting
  into the `construction` boundary.
- Completed: move foundation build-zone ground-cell builders into the
  `construction` boundary.
- Completed: move free-block build geometry helpers into the `construction`
  boundary.
- Completed: move foundation build-zone policy helpers into the `construction`
  boundary.
- Completed: move free-block removal target/drop helpers into the
  `construction` boundary.
- Completed: move foundation origin flag persistence into the `construction`
  boundary.
- Completed: move free-block preview visual sync into the `construction`
  boundary.
- Completed: move free-block target-cell occupancy geometry into the
  `construction` boundary.
- Completed: move free-block preview debug payload building into the
  `construction` boundary.
- Completed: move unavailable foundation-zone placement payload factories into
  the `construction` boundary.
- Completed: move builder tutorial foundation-zone creation into the
  `construction` boundary.
- Completed: move foundation-zone blocker assembly into the `construction`
  boundary.
- Completed: move builder tutorial foundation origin state policy into the
  `construction` boundary.
- Completed: move builder tutorial foundation available-zone search into the
  `construction` boundary.
- Completed: move foundation completion effect policy into the `construction`
  boundary.
- Completed: move foundation build-zone camera focus pose into the `camera`
  boundary.
- Completed: move active zoom preset restoration on movement into the `camera`
  boundary.
- Completed: move camera zoom-cycle request draining into the `camera`
  boundary.
- Completed: move camera look input calculation into the `gameLoop` policy
  boundary.
- Completed: move placement-preview prompt blocker state into the
  `construction` boundary.
- Completed: move frame pending placement intent gating into the
  `construction` boundary.
- Completed: move world-prompt visibility flags into the `presentation`
  boundary.
- Completed: move world-speech visibility priority into the `presentation`
  boundary.
- Completed: move world-prompt snapshot writing into the `presentation`
  boundary.
- Completed: move ground-cell highlight snapshot writing into the
  `presentation` boundary.
- Completed: move world-speech snapshot writing into the `presentation`
  boundary.
- Completed: move follower-call frame handling into the `companions`
  boundary.
- Completed: move nature progress snapshots into the `fieldMoveRuntime`
  boundary.
- Completed: move destroyable landscape patch target selection into the
  `fieldMoveRuntime` boundary.
- Completed: move world-space UI frame context into the `presentation`
  boundary.
- Completed: move frame HUD prompt copy resolution into the `presentation`
  boundary.
- Completed: move Leppa tree dance motion into the `presentation` boundary.
- Completed: move render snapshot context preparation into the `presentation`
  boundary.
- Completed: move grass collision presentation helpers into the
  `presentation` boundary.
- Completed: move wrapped render-distance helpers into the `presentation`
  boundary.
- Completed: move the nature render frame into the `presentation` boundary.
- Completed: move world-object billboard frame into the `presentation`
  boundary.
- Completed: move companion presentation frame into the `companions`
  boundary.
- Completed: move world-prompt frame-state preparation into the
  `presentation` boundary.
- Completed: move world-speech frame-state preparation into the
  `presentation` boundary.
- Completed: move ground-cell highlight frame-state preparation into the
  `presentation` boundary.
- Completed: move player movement frame ownership into the `player` boundary.
- Completed: move gameplay camera input/follow frame ownership into the
  `camera` boundary.
- Completed: move gameplay input frame coordination into the existing `input`
  boundary.
- Completed: move construction placement frame coordination into the
  `construction` boundary.
- Completed: move base render snapshot frame ownership into the `presentation`
  boundary.
- Completed: move passive player resource collection into the `player`
  boundary.
- Completed: move companion simulation frame coordination into the `companions`
  boundary.
- Completed: move Bulbasaur jump arc motion into the `companions` boundary.
- Completed: move companion follow formation movement into the `companions`
  boundary.
- Completed: move construction helper motion wiring into the `construction`
  boundary.
- Completed: move Thermal Cabin home-beat policy into the Train House runtime
  boundary.
- Completed: move construction house model-instance wiring into the
  `construction` boundary.
- Completed: move companion world-speech cue wiring into the `companions`
  boundary.
- Completed: move field-move position source wiring into the `fieldMoveRuntime`
  boundary.
- Completed: move Solar Station power-radius wiring into the `construction`
  boundary.
- Completed: move construction placement blocker wiring into the `construction`
  boundary.
- Completed: move foundation build-zone runtime wiring into the `construction`
  boundary.
- Completed: move Workbench rotation target/feedback wiring into the
  `construction` boundary.
- Completed: move Free Block build/preview/remove wiring into the
  `construction` boundary.
- Completed: move construction placement preview wiring into the
  `construction` boundary.
- Completed: move construction placement control wiring into the
  `construction` boundary.
- Completed: move companion facing/yaw wiring into the `companions` boundary.
- Completed: move player action payload assembly into the `player` boundary.
- Completed: move nearby player action target payload assembly into the
  `player` boundary.
- Completed: move primary player action target intent classification into the
  `player` boundary.
- Completed: move primary player action secondary target query policy into the
  `player` boundary.
- Completed: move player harvest side-effect orchestration into the existing
  `player` action runtime.
- Completed: move player harvest/interact/destroy action side effects into the
  `player` boundary.
- Completed: move gameplay prompt/highlight target preparation into the
  `presentation` boundary.
- Completed: move companion encounter update rules into the `companions`
  boundary.
- Completed: move world scene/interactable sync into the `world` boundary.
- Next: select the next small domain boundary without moving field moves,
  camera rules, input mapping or render core.

## Validation Log

### Gameplay Target Frame State Boundary

Moved nearby gameplay target preparation from `frame(now)` into
`app/runtime/presentation/gameplayTargetFrameState.js`.

Boundary classification: `presentation/render helpers`, focused on preparing
targets consumed by HUD prompt copy, world prompts and ground-cell highlight
snapshot writing.

Module boundary note:

- The new file belongs to the existing `presentation` boundary because it does
  not execute gameplay actions; it prepares frame state for prompts/highlights.
- `gameLoop.js` still owns frame order and passes the resulting state to the
  existing prompt/highlight helpers.
- Field-move execution rules remain in `gameLoop.js`; this extraction only
  preserves the old `findNearbyActionTarget(...)` and
  `findNearbyInteractable(...)` query sequence.
- The helper reuses the existing nearby-query policy from
  `gameLoopFramePolicies.js`.

Study path:

1. `resolveGameplayTargetFrameState(...)` first applies the same nearby-query
   permission gate.
2. When allowed, it resolves the primary nearby action target with the same
   Water Gun/Leafage/Fire capability flags.
3. It resolves the invalid alternate target with the same swapped Water
   Gun/Leafage query used previously.
4. It derives `highlightedGroundCell`, target state and ability id for the
   existing ground-cell highlight frame helper.
5. It resolves the nearby interactable with the same NPC/interactable/session
   arguments used before.

Reduced pressure:

- `gameLoop.js` line count changed from `7761` to `7683`.
- Removed the inline nearby target/highlight preparation block from
  `frame(now)`.
- Removed the direct `resolveNearbyGameplayQueryPermission` import from
  `gameLoop.js`.
- Added focused tests for invalid Leafage target highlighting and blocked-frame
  query gating.

Passed:

```sh
npm test -- --run tests/gameplayTargetFrameState.test.js
npm test -- --run tests/gameplayTargetFrameState.test.js tests/gameLoopFramePolicies.test.js tests/hudPromptCopy.test.js tests/worldPromptFrameState.test.js tests/groundCellHighlightFrameState.test.js tests/groundCellHighlightFrame.test.js tests/worldPromptSnapshotFrame.test.js
git diff --check
npm run build
npm test
```

TDD note: the first focused test run failed with the expected missing-module
error before `app/runtime/presentation/gameplayTargetFrameState.js` was added.

The focused presentation target-state suite passed with `29` tests. The
production build passed with the existing chunk-size warning. `npm test`
completed with the existing Leafage Native Tree baseline:

- `1725` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending for this pass.

### Companion Simulation Frame Boundary

Moved companion/bot simulation coordination from `frame(now)` into
`app/runtime/companions/companionFrameRuntime.js`.

Boundary classification: `bot/companion motion`, focused on the per-frame
update order for Chopper, Grow Bot, Hydro Bot, Thermal Bot, Builder Bot and Bee
Field repair companions.

Module boundary note:

- The new file belongs to the existing `companions` domain boundary.
- `gameLoop.js` still owns frame order. `processFollowerCallFrame(...)` remains
  before `updateAmbientWorldSimulationFrame(...)`, and the companion simulation
  runtime still runs immediately after ambient simulation.
- The runtime does not move field-move rules. Existing action/update functions
  are still passed as callbacks from `startGameLoop()`.
- Chopper actor update moved out of `gameLoop.js`; the runtime imports the
  default `updateChopperNpcActor(...)` and keeps it injectable for tests.

Study path:

1. `createCompanionFrameRuntime(...)` is wired in `startGameLoop()` with
   `session`, `controls`, `rendering`, `audio`, Chopper guide position and
   explicit callbacks.
2. `frame(now)` still processes follower calls first, then ambient world
   simulation, then calls `companionFrameRuntime.update(...)`.
3. The runtime returns `chopperBulbasaurRepairBoxInvestigationTarget`, preserving
   the later world-speech/prompt dependency.
4. Fire and Water Gun audio activity still derives from the same companion
   action phases and Water Gun SFX burst runtime.
5. Idle patrol gating still uses the same gameplay/opening/cinematic/tutorial/
   modal/dialogue/skill/scripted blockers.

Reduced pressure:

- `gameLoop.js` line count changed from `7769` to `7761`.
- More importantly, the body of `frame(now)` lost the direct companion
  simulation sequence and now delegates it through one domain runtime call.
- Removed the direct `updateChopperNpcActor` import from `gameLoop.js`.
- Added focused tests for companion simulation order, audio payloads, returned
  Chopper investigation target and idle patrol gating.

Passed:

```sh
npm test -- --run tests/companionFrameRuntime.test.js
npm test -- --run tests/companionFrameRuntime.test.js tests/chopperNpcActor.test.js tests/followerCallFrame.test.js tests/companionPresentationFrame.test.js tests/chopperAttentionCueRuntime.test.js tests/waterGunSfxBurstRuntime.test.js tests/audioMixRuntime.test.js
git diff --check
npm run build
npm test
```

TDD note: the first focused test run failed with the expected missing-module
error before `app/runtime/companions/companionFrameRuntime.js` was added.

The focused companion suite passed with `30` tests. The production build passed
with the existing chunk-size warning. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1723` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending for this pass.

### Player Resource Collection Frame Boundary

Moved passive player resource collection from `frame(now)` into
`app/player/playerResourceCollectionFrame.js`.

Boundary classification: `player`, focused on player-position based pickup of
Wood, Leaves, Gear, Carbon and Pulse Berry, plus the existing inventory/HUD/audio
feedback callbacks attached to those pickups.

Module boundary note:

- The new file belongs to the existing `player` domain boundary.
- `gameLoop.js` still owns frame order and calls the runtime in the same place:
  after cinematic simulation updates and before gameplay camera follow.
- The runtime does not import HUD, audio, gameplay controls or story feedback
  systems directly. Those side effects remain explicit callbacks wired by
  `startGameLoop()`.
- Field moves, placement, camera behavior and render snapshot shape are
  unchanged.

Study path:

1. `createPlayerResourceCollectionFrameRuntime(...)` receives `session`,
   `controls`, `gameplay`, item labels/ids and a grouped `feedback` callback
   object.
2. `update(...)` applies the old frame gates: no collection during cinematic,
   tutorial, Pokédex modal, skill-learn flow or scripted interaction.
3. Wood pickup still snapshots available drops before collection, plays the
   staggered grab sounds, syncs inventory, queues fly-to-slot items, shows the
   `+N Wood` notice and consumes the pending habitat-check completion notice.
4. Leaves, Gear and Carbon still delegate to
   `pushSupplyResourceCollectFeedback(...)`; Gear still also triggers the gear
   pickup particle runtime.
5. Pulse Berry still syncs inventory, queues fly-to-slot feedback, pushes the
   existing item-name notice and updates the supply counter prompt.

Reduced pressure:

- `gameLoop.js` line count changed from `7861` to `7769`.
- Removed the large passive collection block from `frame(now)`.
- Removed the collectible snapshot helper imports from `gameLoop.js`.
- Added focused tests for active collection feedback and blocked-frame gating.

Passed:

```sh
npm test -- --run tests/playerResourceCollectionFrame.test.js
npm test -- --run tests/playerResourceCollectionFrame.test.js tests/collectibleSourceSnapshots.test.js tests/gameplayWoodDrops.test.js tests/inventoryResourceOperations.test.js tests/supplyCounterPrompt.test.js tests/resourcePurposeCatalog.test.js
git diff --check
npm run build
npm test
```

TDD note: the first focused test run failed with the expected missing-module
error before `app/player/playerResourceCollectionFrame.js` was added.

The focused player resource-collection suite passed with `25` tests. The
production build passed with the existing chunk-size warning. `npm test`
completed with the existing Leafage Native Tree baseline:

- `1721` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending for this pass.

### Base Render Snapshot Frame Runtime Boundary

Moved base render snapshot frame ownership from the local
`updateBaseRenderSnapshotFrame(...)` helper inside `app/runtime/gameLoop.js` into
`app/runtime/presentation/baseRenderSnapshotFrame.js`.

Boundary classification: `presentation/render helpers`, focused on writing the
base render snapshot fields and running the adjacent presentation/model sync
callbacks needed before world-space UI and speech resolution.

Module boundary note:

- The new file belongs to the existing `presentation` domain boundary.
- `gameLoop.js` still owns frame order and dependency wiring.
- Construction and opening behavior are not reimplemented in the presentation
  module; existing functions are passed as explicit callbacks.
- No render data shape changed: the runtime still writes
  `viewProjection`, `sceneObjects`, `skyTexture` and `psxDistanceFog` into
  `nextFrame.render`.

Study path:

1. `startGameLoop()` creates `baseRenderSnapshotFrameRuntime` after construction
   placement coordination is wired.
2. `frame(now)` calls `baseRenderSnapshotFrameRuntime.update(...)` in the same
   position where the local helper previously ran: after HUD snapshot writes and
   before world-space UI context preparation.
3. View-projection, construction visual sync, Leaf Den completion polling,
   player-house model sync, interaction highlight, opening ship scene objects,
   Squirtle assembly scene objects and PSX distance fog are forwarded through
   explicit dependencies.

Reduced pressure:

- `gameLoop.js` line count changed from `7887` to `7861`.
- Removed the base render snapshot helper implementation from
  `startGameLoop()`.
- Added focused tests for construction visual sync calls, render snapshot writes,
  player-position fallback and disabled fog handling.

Passed:

```sh
npm test -- --run tests/baseRenderSnapshotFrame.test.js
npm test -- --run tests/baseRenderSnapshotFrame.test.js tests/frameSnapshotController.test.js tests/renderFrameController.test.js tests/interactionObjectHighlight.test.js tests/psxDistanceFogConfig.test.js tests/constructionHouseModelInstances.test.js
git diff --check
npm run build
npm test
```

The focused presentation/render-helper suite passed with `24` tests. The
production build passed with the existing chunk-size warning. `npm test`
completed with the existing Leafage Native Tree baseline:

- `1719` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending for this pass.

### Construction Placement Frame Boundary

Moved frame-level construction placement coordination from
`app/runtime/gameLoop.js` into
`app/runtime/construction/constructionPlacementFrameRuntime.js`.

Boundary classification: `construction`, focused on placement rotation,
placement cancellation, Build Block request routing, placement-preview updates,
Solar Station spawn/rotation visuals and free-block preview/debug updates.

Module boundary note:

- This file belongs to the existing `construction` domain boundary.
- The runtime does not implement placement rules or field-move rules directly;
  it calls existing game-loop functions through explicit callbacks.
- `gameLoop.js` still owns frame order: placement controls/previews run before
  player movement, and free-block preview still runs after `buildBlockEquipped`
  is resolved.
- Existing prompt text and feedback side effects are preserved, including
  `"Need Wood"` and invalid-placement notices.

Study path:

1. `updatePlacementControlsAndPreviews(...)` replaces the inline block that
   consumed placement rotation/cancel/build inputs and refreshed placement
   previews.
2. `updateFreeBlockPreview(...)` replaces the inline Build Block preview gate
   and debug overlay update after active field-move state is known.
3. `gameLoop.js` receives the same four placement preview objects and continues
   using them in the later prompt/highlight/render stages.

Reduced pressure:

- `gameLoop.js` line count changed from `7919` to `7887`.
- Removed the visibly awkward inline placement cancel/build request block from
  `frame(now)`.
- Added focused tests for rotation priority, cancel priority, blocked input
  draining, Build Block feedback, placement-preview update timing and Build
  Block preview/debug overlay state.

Passed:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js tests/freeBlockPreview.test.js tests/freeBlockBuildSystem.test.js tests/pendingPlacementIntent.test.js tests/placementConsumptionContract.test.js tests/workbenchRotationRuntime.test.js tests/placementPreviewPrompts.test.js
git diff --check
npm run build
npm test
```

The focused construction placement suite passed with `62` tests across the new
runtime and existing placement/free-block/workbench tests. The production build
passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1717` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Gameplay Input Frame Boundary

Moved frame-level gameplay input coordination from `app/runtime/gameLoop.js`
into the existing `app/runtime/input/createGameplayInputRuntime.js` module.

Boundary classification: `input runtime`, focused on applying per-frame input
state, updating the input-modality panel and forwarding the camera-debug payload
for the same frame.

Module boundary note:

- No new file was added; the existing `input` module boundary was extended.
- `gameLoop.js` still owns frame order and still receives
  `cameraTransitionActive` before camera input and movement updates.
- Camera debug remains a callback, so the input boundary does not become owner
  of camera debug internals.
- No input mapping, action consumption behavior, camera behavior or pause logic
  changed.

Study path:

1. `createGameplayInputRuntime(...)` still captures the low-level input frame.
2. `createGameplayInputFrameRuntime(...)` coordinates the old
   `updateGameplayInputFrame(...)` sequence: update input runtime, update input
   modality panel, read camera transition state and forward debug state.
3. `frame(now)` now calls `gameplayInputFrameRuntime.update(...)` in the same
   position where the local helper used to run.

Reduced pressure:

- `gameLoop.js` line count changed from `7948` to `7919`.
- Removed local `updateGameplayInputFrame(...)` from `gameLoop.js`.
- Added focused tests for input frame capture, modality panel update,
  camera-transition return value and camera-debug forwarding.

Passed:

```sh
npm test -- --run tests/gameplayInputRuntime.test.js tests/gameLoopFramePolicies.test.js tests/cameraDebugFrameState.test.js tests/cameraDebugRuntime.test.js
git diff --check
npm run build
npm test
```

The focused gameplay input suite passed with `16` tests across input runtime,
frame policies and camera-debug tests. The production build passed with the
existing chunk-size warning. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1711` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Gameplay Camera Frame Boundary

Moved the camera input and gameplay camera follow/opening pass from
`app/runtime/gameLoop.js` into
`app/runtime/camera/gameplayCameraFrameRuntime.js`.

Boundary classification: `camera runtime/debug`, focused on camera input,
camera zoom cycling, tutorial look registration, tutorial focus pose, opening
camera update and regular player-follow fallback.

Module boundary note:

- This module belongs to the existing `camera` boundary under `app/runtime`.
- `gameLoop.js` still owns the frame order and calls camera input before
  placement/player movement, then camera follow after gameplay simulation in the
  same old positions.
- The runtime imports the existing pure camera policies and zoom-cycle helper
  instead of duplicating input logic.
- Camera zoom restoration triggered by player movement remains in the player
  movement callback because that side effect is initiated by movement.

Study path:

1. `gameplayCameraFrameRuntime.updateInput(...)` replaces the old
   `updateCameraInputFrame(...)` helper and consumes zoom/look input with the
   same policy gates.
2. `gameplayCameraFrameRuntime.updateFollow(...)` replaces the old
   `updateGameplayCameraFrame(...)` helper and preserves tutorial focus,
   foundation build-zone camera hold, opening camera update and player follow
   priority.
3. `frame(now)` still computes `cameraTransitionActive` before camera input and
   still passes it into the later camera-follow update.
4. No camera tuning, camera preset values, opening timing, input mapping or
   frame scheduling changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8018` to `7948`.
- Removed local `updateCameraInputFrame(...)` and
  `updateGameplayCameraFrame(...)` implementations from `gameLoop.js`.
- Removed direct `resolveCameraInputPermissions(...)`,
  `resolveCameraLookInput(...)` and `consumeCameraZoomCycleRequests(...)`
  imports from `gameLoop.js`.
- Added focused tests for camera look input, tutorial look registration, zoom
  cycling, blocked look clearing, tutorial focus priority and gameplay opening
  camera delegation.

Passed:

```sh
npm test -- --run tests/gameplayCameraFrameRuntime.test.js tests/gameLoopFramePolicies.test.js tests/cameraZoomPresetController.test.js tests/gameplayOpeningShip.test.js tests/gameplayCameraDirector.test.js
git diff --check
npm run build
npm test
```

The focused gameplay camera suite passed with `25` tests across the new camera
frame runtime and existing camera policy/opening/director tests. The production
build passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1707` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Player Movement Frame Boundary

Moved the player movement frame pass from `app/runtime/gameLoop.js` into
`app/player/playerMovementFrame.js`.

Boundary classification: `player/`, focused on updating the player character
for one frame and coordinating player-owned movement side effects.

Module boundary note:

- This is a domain module under `app/player`, not a loose runtime helper in
  `app/runtime`.
- `gameLoop.js` still owns the temporal order and still decides when player
  movement is updated.
- The player boundary now owns character update, jump-start handoff to the
  model runtime, movement delta calculation, companion follow-direction update,
  movement quest update, run breadcrumb trigger and player dust update.
- Camera zoom restoration stays outside the player module as an explicit
  callback, because it is camera behavior triggered by player movement.

Study path:

1. `createPlayerMovementFrameRuntime(...)` is wired in `startGameLoop()` with
   the existing session, model runtime, follow-direction runtime, movement quest
   runtime and breadcrumb prompt runtime.
2. `frame(now)` now calls `playerMovementFrameRuntime.update(...)` where the
   old local helper was called.
3. The runtime returns `playerMovedThisFrame`, preserving the audio/presentation
   behavior that depends on player movement.
4. No input mapping, movement permission policy, movement speed, camera tuning,
   quest thresholds or dust tuning changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8062` to `8018`.
- Removed the local `updatePlayerMovementFrame(...)` implementation from
  `gameLoop.js`.
- Removed direct `updatePlayerDustParticles(...)` import from `gameLoop.js`.
- Added focused tests for allowed movement, blocked movement, model sync,
  follow-direction update, movement quest update, run breadcrumb gating, camera
  callback payload and dust update.

Passed:

```sh
npm test -- --run tests/playerMovementFrame.test.js tests/gameLoopFramePolicies.test.js tests/playerDustParticles.test.js tests/cameraZoomPresetController.test.js tests/movementQuestRuntime.test.js tests/runBreadcrumbPromptRuntime.test.js
git diff --check
npm run build
npm test
```

The focused player movement suite passed with `28` tests across the new
movement-frame test and related policy/effect/runtime tests. The production
build passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1702` passed
- `3` failed in `tests/gameplayInteractions.test.js`

### Ground Cell Highlight Frame-State Boundary

Moved the ground-cell highlight preparation pass from
`app/runtime/gameLoop.js` into
`app/runtime/presentation/groundCellHighlightFrameState.js`.

Boundary classification: `presentation/render helpers`, focused on preparing
the data consumed by `updateGroundCellHighlightFrame(...)`.

Module boundary note:

- This is one cohesive presentation module, not a one-helper file.
- `gameLoop.js` still owns frame order and still calls
  `updateGroundCellHighlightFrame(...)` in the same place.
- The module prepares marked guidance cells, pulse phase, active fire highlight,
  placement footprint cells, Solar Station radius cells, workbench rotation
  highlight, action feedback and field-tool target pulse state.
- Domain-specific behaviors remain explicit callbacks: pending Water Gun cells,
  free-roam restoration cells, Leppa Tree cells, Solar Station field markers,
  task markers, foundation-zone markers, world-cell planner selection, feedback
  frames and pulse frames.

Study path:

1. `resolveMarkedGroundCellGuidanceFrameState(...)` runs before inactive
   placement previews are nulled, matching the old frame order for free-roam
   restoration guidance.
2. `resolveGroundCellHighlightFrameState(...)` runs after placement previews are
   normalized, matching the old frame order for placement footprint rendering.
3. `updateGroundCellHighlightFrame(...)` still owns snapshot writes and visual
   priority between placement, workbench, fire, direct target, marked cells and
   pulse feedback.
4. No field-move rule, placement rule, camera behavior, render snapshot shape or
   frame scheduling changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8118` to `8062`.
- Removed direct `buildPlacementPreviewFootprintCells(...)` import from
  `gameLoop.js`.
- Removed the inline marked-guidance assembly from `frame(now)`.
- Removed the inline placement footprint / Solar Station radius / workbench /
  feedback / pulse state assembly from `frame(now)`.
- Added focused tests for marked guidance cells, deduping, active fire
  highlight, placement footprints, Solar Station radius cells, workbench
  rotation, feedback and target pulse state.

Passed:

```sh
npm test -- --run tests/groundCellHighlightFrameState.test.js tests/groundCellHighlightFrame.test.js tests/placementGeometry.test.js
git diff --check
npm run build
npm test
```

The focused ground-cell highlight suite passed with `31` tests across the new
frame-state test and existing highlight/geometry tests. The production build
passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1699` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### World Speech Frame-State Boundary

Moved the world-speech visibility preparation pass from
`app/runtime/gameLoop.js` into
`app/runtime/presentation/worldSpeechFrameState.js`.

Boundary classification: `presentation/render helpers`, focused on which
world-space speech candidate is visible before
`updateWorldSpeechSnapshotFrame(...)` writes the snapshot.

Module boundary note:

- This is one cohesive presentation module, not a generic helper file.
- `gameLoop.js` still owns frame order and still calls
  `updateWorldSpeechSnapshotFrame(...)` in the same place.
- `worldSpeechSnapshotFrame.js` still owns speech copy, companion-lost hint
  fallback and Chopper cue sound consumption.
- `resolveWorldSpeechFrameState(...)` delegates priority to the existing
  `resolveWorldSpeechVisibility(...)`, preserving the current first-visible
  candidate behavior.

Study path:

1. `resolveWorldSpeechFrameState(...)` receives frame state already resolved by
   `gameLoop.js`: world-space UI gate, active quest, Tangrowth position,
   story flags, session encounters and repair-box investigation state.
2. The module owns the previous inline conditions for Tangrowth, Chopper,
   Bulbasaur and Charmander world speech visibility.
3. Mission-specific counts remain explicit input:
   `restoredGrassMissionTargetCount` is passed in from `gameLoop.js` rather
   than hard-coded inside the presentation module.
4. No speech copy, field-move rule, placement rule, camera behavior, render
   snapshot shape or frame scheduling changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8205` to `8118`.
- Removed direct `resolveWorldSpeechVisibility(...)` usage from `gameLoop.js`.
- Removed the large inline `shouldShow...Speech` candidate object from
  `frame(now)`.
- Added focused tests for speech priority, repair-box distance gating,
  Bulbasaur request-ready speech and Charmander follow gating.

Passed:

```sh
npm test -- --run tests/worldSpeechFrameState.test.js tests/worldSpeechVisibility.test.js tests/worldSpeechSnapshotFrame.test.js tests/worldPromptFrameState.test.js
git diff --check
npm run build
npm test
```

The focused world-speech frame-state suite passed with `11` tests across the new
frame-state test and the existing speech/prompt tests. The production build
passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1695` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### World Prompt Frame-State Boundary

Moved the world-prompt target, visibility and copy preparation pass from
`app/runtime/gameLoop.js` into
`app/runtime/presentation/worldPromptFrameState.js`.

Boundary classification: `presentation/render helpers`, focused on world-space
prompt state before `updateWorldPromptSnapshotFrame(...)` writes the snapshot.

Module boundary note:

- This is one cohesive presentation module, not a generic helper file.
- `gameLoop.js` still owns frame order and still calls
  `updateWorldSpeechSnapshotFrame(...)` and `updateWorldPromptSnapshotFrame(...)`
  in the same order.
- Mission-specific decisions remain outside this boundary:
  `dryGrassHydroMissionActive` and `openingLeppaTreeRequestActive` are passed in
  as resolved booleans.
- Runtime state checks remain explicit callbacks for field-move invalid prompts,
  run breadcrumb visibility, Chopper cue lookup, Squirtle charging and Build
  Block cost markers.

Study path:

1. `resolveWorldPromptFrameState(...)` receives frame state already resolved by
   `gameLoop.js`: active move, quest/task ids, placement previews, player skill
   flags, nearby interaction target, input modality and world-space UI gate.
2. The module owns the previous pre-snapshot derivation of repair-box prompts,
   first-use prompts, field-move switch prompt, dry-grass prompt targets,
   interaction prompt text, run prompt text, Chopper attention cue and the final
   `shouldShow...` flags.
3. `updateWorldPromptSnapshotFrame(...)` still owns snapshot writes and prompt
   priority. This cut does not change prompt priority or prompt data shape.
4. No field-move rule, placement rule, input mapping, camera behavior, render
   snapshot shape or frame scheduling changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8289` to `8205`.
- Removed direct imports of dry-grass prompt target helpers from `gameLoop.js`.
- Removed direct imports of world-prompt text/visibility helpers from
  `gameLoop.js`, except `getPendingPlacementPrompt(...)`, which is still used
  earlier for HUD copy.
- Removed direct `getNearbyRepairBoxPrompt(...)` usage and
  `PLAYER_INTERACTION_WORLD_PROMPT_TARGET_IDS` knowledge from `gameLoop.js`.
- Added focused tests for prompt target resolution, prompt text derivation,
  visibility gates and disabled world-space UI behavior.

Passed:

```sh
npm test -- --run tests/worldPromptFrameState.test.js tests/worldPromptCopy.test.js tests/dryGrassPromptTargets.test.js tests/worldPromptSnapshotFrame.test.js tests/repairBoxPromptTargets.test.js
git diff --check
npm run build
npm test
```

The focused world-prompt frame-state suite passed with `16` tests across the
new frame-state test and the existing prompt tests. The production build passed
with the existing chunk-size warning. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1692` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Companion Presentation Frame Boundary

Moved the companion presentation pass from `app/runtime/gameLoop.js` into
`app/runtime/companions/companionPresentationFrame.js`.

Boundary classification: `bot/companion motion` plus companion presentation,
focused on status bars, fallback companion billboards, Bulbasaur interaction
gizmo billboards and field-move visual billboards emitted by companions.

Module boundary note:

- This is one cohesive `companions` domain module, not a one-helper file.
- `gameLoop.js` still owns frame order and calls this pass after world-object
  billboard assembly and before nature revival/debug collider billboards.
- The Squirtle model-instance active sync intentionally remains in
  `gameLoop.js` because it mutates runtime model state, not just presentation.
- Field-move gameplay state and action rules remain in `gameLoop.js`; this
  module only forwards existing action snapshots to already-tested billboard
  builders.

Study path:

1. `updateCompanionPresentationFrame(...)` receives frame state already resolved
   by `gameLoop.js`: active move id, player skill flags, camera, render UVs,
   companion position callbacks and current companion action objects.
2. The module owns the previous billboard chain for Hydro Bot stamina/charging,
   Thermal Bot carbon, Water Gun spray, Fire spray, Leafage stream, fallback
   Bulbasaur/Charmander/Timburr billboards and the Bulbasaur interaction ring.
3. The module preserves the placeholder fallback billboard behavior for hidden
   companions whose model instance is absent.
4. No field-move rule, companion movement rule, camera behavior, render snapshot
   shape or frame scheduling changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8389` to `8289`.
- Removed direct imports of companion status billboard builders from
  `gameLoop.js`.
- Removed direct imports of field-move billboard builders from `gameLoop.js`.
- Removed direct import of the Bulbasaur interaction-radius gizmo builder from
  `gameLoop.js`.
- Added focused tests for companion status/fallback/gizmo output and companion
  field-move/charging billboard forwarding.

Passed:

```sh
npm test -- --run tests/companionPresentationFrame.test.js tests/companionStatusBillboards.test.js tests/fieldMoveBillboards.test.js tests/bulbasaurInteractionRadiusGizmoBillboards.test.js
git diff --check
npm run build
npm test
```

The focused companion presentation suite passed with `20` tests across the new
frame test and the existing billboard tests. The production build passed with
the existing chunk-size warning. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1690` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### World Object Billboard Frame Boundary

Moved the world-object billboard presentation pass from
`app/runtime/gameLoop.js` into
`app/runtime/presentation/worldObjectBillboardFrame.js`.

Boundary classification: `presentation/render helpers`, focused on billboards
for placed world objects, construction-adjacent objects, interaction markers and
mission indicators.

Module boundary note:

- This is one cohesive presentation module, not a set of one-helper files.
- Helpers used only by the pass stay private inside
  `worldObjectBillboardFrame.js`.
- `gameLoop.js` still owns the render order and calls this pass after
  snowstorm/opening ship billboards and before companion/status/field-move
  billboards.
- The old order inside the pass is preserved: workbench, log chair/save point,
  straw bed, campfire, Leaf Den, construction clouds, house interior, late
  world objects and mission indicators.

Study path:

1. `updateWorldObjectBillboardFrame(...)` receives frame state that `gameLoop.js`
   already resolved: `storyState`, `inventory`, `rendering`, `canShowWorldSpaceUi`,
   placement preview state and construction billboard callbacks.
2. The module owns billboard assembly for Workbench markers/particles, Log Chair
   preview/save point, Campfire, Leaf Den, house interior furniture, Pokemon
   Center PC, challenge boulder, Bill cameo, repair plant and mission target
   indicators.
3. Companion status bars, fallback companion billboards and field-move effect
   billboards intentionally remain outside this boundary for a future companion
   or field-move presentation cut.
4. No placement rule, mission target rule, construction rule, camera behavior,
   render snapshot shape or frame scheduling changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8625` to `8389`.
- Removed the world-object billboard chain from `frame(now)`.
- Moved Log Chair preview alpha and Save Point star billboard config out of
  `gameLoop.js`.
- Added focused tests for Log Chair/save point/mission output and simple
  world-object billboard output.

Passed:

```sh
npm test -- --run tests/worldObjectBillboardFrame.test.js
npm test -- --run tests/worldObjectBillboardFrame.test.js tests/workbenchRuntime.test.js tests/savePointStarBillboards.test.js tests/campfireWoodPileBillboards.test.js tests/constructionBillboards.test.js tests/playerPlacementSpawnEffect.test.js tests/missionTargetIndicatorBillboard.test.js tests/missionTargetPositions.test.js
git diff --check
npm run build
npm test
```

The focused world-object billboard frame test passed with `2` tests, the
broader world-object billboard suite passed with `29` tests and the production
build passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1688` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Nature Render Frame Boundary

Moved the nature presentation pass from `app/runtime/gameLoop.js` into
`app/runtime/presentation/natureRenderFrame.js`.

Boundary classification: `presentation/render helpers`, focused on preparing
nature-related render buckets for grass, flowers, field drops, Leppa tree
billboards and Repair Box rustling/reveal particles.

Module boundary note:

- This is one cohesive domain module, not a one-helper file.
- Helpers that are only used by this pass stay private inside
  `natureRenderFrame.js`.
- The module owns visual presentation decisions for nature render buckets while
  `gameLoop.js` still owns frame order and still calls Rebirth ghost-tree and
  landscape-cut effect renderers at their previous position.
- The visual tuning values moved with the nature presentation pass; the numbers
  did not change.

Study path:

1. `gameLoop.js` calls `updateNatureGrassRenderFrame(...)` first, before the
   existing Rebirth ghost-tree and landscape-cut effect calls.
2. `gameLoop.js` then calls `updateNatureRenderFrame(...)` for Repair Box
   nature particles, flowers, wood/leaves/Leppa drops and Leppa tree particles.
3. Splitting the module into two exported frame functions preserves the old
   render order without exposing the internal per-patch helpers.
4. No field-move rule, drop collection rule, camera behavior, render snapshot
   shape or frame scheduling changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8956` to `8625`.
- Removed the large ground-grass render loop from `frame(now)`.
- Removed flower, drop, leaf-resource, Leppa tree and Repair Box nature
  billboard assembly from `frame(now)`.
- Removed nature render tuning constants from `gameLoop.js`.
- Added focused tests for model-vs-billboard grass output and the shared
  flowers/drops/leaf billboard pass.

Passed:

```sh
npm test -- --run tests/natureRenderFrame.test.js
npm test -- --run tests/natureRenderFrame.test.js tests/renderSnapshotContext.test.js tests/grassCollisionObjects.test.js tests/renderDistance.test.js tests/grassPlayerBend.test.js tests/tallGrassMotion.test.js tests/flowerArrangementBillboards.test.js tests/leafBillboards.test.js tests/repairBoxRevealRayBillboards.test.js tests/rustlingGrassParticleBillboards.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/leppaTreeMusicNotes.test.js
git diff --check
npm run build
npm test
```

The focused nature render frame test passed with `2` tests, the broader nature
presentation suite passed with `42` tests and the production build passed with
the existing chunk-size warning. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1686` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Render Distance Presentation Boundary

Moved wrapped planar render-distance helpers from `app/runtime/gameLoop.js` into
`app/runtime/presentation/renderDistance.js`.

Boundary classification: `presentation/render helpers`, focused on deciding
whether world-space presentation objects are close enough to prepare/render.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns the world-wrap planar delta and render-distance predicate used by
  grass, flower, drop and construction presentation preparation.
- The default world limit still comes from `gameplayContent.js`; tests can pass
  a local `worldLimit` to cover wrap behavior without changing gameplay tuning.
- `gameLoop.js` still decides where the predicate is used and keeps the same
  render-prep order.

Study path:

1. `isWorldPositionWithinRenderDistance(...)` keeps the previous permissive
   fallback for invalid distance or invalid vector inputs.
2. `getWrappedPlanarDelta(...)` keeps the existing wrap formula for world
   positions crossing `WORLD_LIMIT`.
3. `gameLoop.js` imports the helper and passes it to existing presentation
   callers exactly where the local function was previously used.
4. No culling distance, scene-object shape, frame order or render snapshot data
   changed.

Reduced pressure:

- `gameLoop.js` line count changed from `8989` to `8956`.
- Removed the private `isVector3Like(...)`, `getWrappedPlanarDelta(...)` and
  `isWorldPositionWithinRenderDistance(...)` implementations from
  `gameLoop.js`.
- Removed direct `WORLD_LIMIT` knowledge from `gameLoop.js`.
- Added focused tests for normal culling, world-wrap culling and permissive
  fallback behavior.

Passed:

```sh
npm test -- --run tests/renderDistance.test.js
npm test -- --run tests/renderDistance.test.js tests/renderCulling.test.js tests/renderSnapshotContext.test.js tests/leafBillboards.test.js tests/constructionHouseModelInstances.test.js
git diff --check
npm run build
npm test
```

The focused render-distance test passed with `3` tests and the focused
presentation/render culling suite passed with `17` tests. The production build
passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1684` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Grass Collision Presentation Boundary

Moved grass collision object collection and grass alpha overlap calculation from
`app/runtime/gameLoop.js` into
`app/runtime/presentation/grassCollisionObjects.js`.

Boundary classification: `presentation/render helpers`, focused on visual grass
fade around actors and repair modules.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns only render/presentation collision objects and grass alpha fade.
- The existing alpha and radius tuning values moved with the visual helper; the
  numbers did not change.
- It imports `TALL_GRASS_MIN_FOOTPRINT` from the existing tall-grass motion
  module instead of keeping that dependency in `gameLoop.js`.

Study path:

1. `gameLoop.js` still asks the render snapshot context for
   `grassCollisionObjects` in the same render-prep location.
2. `getGrassCollisionObjects(...)` now receives `session` explicitly and builds
   the same actor/module collision list.
3. `getGrassObjectCollisionAlpha(...)` now owns the visual fade decision for
   grass patches near those objects.
4. No actor visibility rule, grass render shape, sway behavior or frame order
   changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9075` to `8989`.
- Removed the private `appendGrassCollisionObject(...)`,
  `getGrassCollisionObjects(...)` and `getGrassObjectCollisionAlpha(...)`
  implementations from `startGameLoop()`.
- Moved grass collision alpha/radius tuning out of the `gameLoop.js` constant
  block.
- Added focused tests for actor/module collision collection, invalid position
  filtering and grass alpha overlap behavior.

Passed:

```sh
npm test -- --run tests/grassCollisionObjects.test.js
npm test -- --run tests/grassCollisionObjects.test.js tests/renderSnapshotContext.test.js tests/grassPlayerBend.test.js tests/tallGrassMotion.test.js
git diff --check
npm run build
npm test
```

The focused grass collision test passed with `4` tests, the focused
presentation/grass render suite passed with `18` tests and the production build
passed with the existing chunk-size warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1681` passed
- `3` failed in `tests/gameplayInteractions.test.js`

Manual visual gameplay validation remains pending because the in-app browser
backend was not used during this pass.

### Render Snapshot Context Boundary

Moved render snapshot context preparation from `app/runtime/gameLoop.js` into
`app/runtime/presentation/renderSnapshotContext.js`.

Boundary classification: `presentation/render helpers`, focused on preparing
frame-local render context values before snapshot population.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns clearing temporary nature render collections and resolving the
  per-frame grass bend, render center, grass collision and repair-box particle
  targets.
- It receives `session`, `camera` and the existing target/collision callbacks
  explicitly; it does not import gameplay, camera runtime or repair-box
  runtime state directly.

Study path:

1. `gameLoop.js` still calls context preparation in the same render-prep spot.
2. `prepareRenderSnapshotContext(...)` now owns the temporary collection reset
   and context object construction.
3. `getGrassCollisionObjects(...)`, `getSelectedRepairBoxParticleTarget(...)`
   and `getRepairBoxRevealParticleTarget(...)` remain the existing
   source-of-truth functions.
4. No render snapshot shape, repair-box particle priority, grass bend behavior
   or frame order changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9108` to `9075`.
- Removed the detailed render context preparation block from `startGameLoop()`.
- Added focused tests for temporary collection clearing, cinematic grass bend
  gating and repair-box target source forwarding.

Validation:

```sh
npm test -- --run tests/renderSnapshotContext.test.js
npm test -- --run tests/renderSnapshotContext.test.js tests/repairBoxParticleTargets.test.js tests/frameSnapshotController.test.js tests/grassPlayerBend.test.js
git diff --check
npm run build
npm test
```

The focused render snapshot context suite passed with `16` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1677` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Leppa Tree Dance Boundary

Moved Leppa tree sway motion from `app/runtime/gameLoop.js` into
`app/runtime/presentation/leppaTreeDance.js`.

Boundary classification: `presentation/render helpers`, focused on the visual
motion applied to the revived Leppa tree render instance.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns only the visual sway calculation for the tree's dead-instance model.
- The existing visual tuning values `0.28` and `0.0056` moved with the effect;
  the numbers did not change.

Study path:

1. `gameLoop.js` still syncs Leppa tree story state before updating visual
   presentation.
2. `updateLeppaTreeDance(...)` now receives `{ leppaTree, now }` explicitly.
3. Non-revived trees still reset `swayStrength` to `0`.
4. Revived trees still use `Math.sin(now * 0.0056) * 0.28`.

Reduced pressure:

- `gameLoop.js` line count changed from `9125` to `9108`.
- Removed the private `updateLeppaTreeDance(...)` implementation from
  `startGameLoop()`.
- Moved Leppa tree dance tuning out of the `gameLoop.js` constant block.
- Added focused tests for missing model instance, non-revived reset and revived
  sway tuning.

Validation:

```sh
npm test -- --run tests/leppaTreeDance.test.js
npm test -- --run tests/leppaTreeDance.test.js tests/leppaTreeMusicNotes.test.js tests/leppaTreeMissionParticleBillboards.test.js tests/natureRevivalEffects.test.js
git diff --check
npm run build
npm test
```

The focused Leppa/nature presentation suite passed with `13` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1674` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Frame HUD Prompt Copy Boundary

Moved frame-level HUD prompt copy resolution from `app/runtime/gameLoop.js` into
the existing `app/runtime/presentation/hudPromptCopy.js` module.

Boundary classification: `presentation/render helpers`, focused on turning
already-resolved frame blockers, placement prompts and nearby targets into the
HUD prompt copy string.

Module boundary note:

- No new file was created; the behavior belongs to the existing
  `presentation/hudPromptCopy.js` boundary.
- `resolveFrameHudPromptCopy(...)` builds the frame-specific blocked-mode
  payload and delegates to the existing `resolveHudPromptCopy(...)` resolver.
- `gameLoop.js` now passes `storyState`, `getItemLabel`, `buildNearbyPrompt`
  and `debug` explicitly instead of closing over `controls` and `gameplay`.

Study path:

1. `gameLoop.js` still computes placement prompts, nearby targets, active quest
   and blocker booleans in the same frame order.
2. `resolveFrameHudPromptCopy(...)` now owns the frame-to-presentation adapter
   for HUD prompt copy.
3. `resolveHudPromptCopy(...)` remains the source of prompt priority.
4. No prompt text, prompt priority, input rule, placement rule or HUD snapshot
   shape changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9163` to `9125`.
- Removed the private `resolveFrameHudPromptCopy(...)` implementation from
  `startGameLoop()`.
- Added focused tests for frame-level blocked-mode payload construction and
  opening movement lock hiding prompt copy.

Validation:

```sh
npm test -- --run tests/hudPromptCopy.test.js
npm test -- --run tests/hudPromptCopy.test.js tests/worldPromptCopy.test.js tests/hudSnapshotFrame.test.js tests/worldPromptSnapshotFrame.test.js
git diff --check
npm run build
npm test
```

The focused HUD/world prompt suite passed with `15` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1671` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### World-Space UI Frame Context Boundary

Moved world-space UI frame context preparation from `app/runtime/gameLoop.js`
into `app/runtime/presentation/worldSpaceUiFrameContext.js`.

Boundary classification: `presentation/render helpers`, focused on resolving
world-space UI visibility, Tangrowth speech anchor position and Workbench green
arrow cue activation for the current frame.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It receives `session`, `storyState`, flow state and the existing policy/cue
  callbacks explicitly.
- It does not change Workbench cue rules, world-space UI visibility rules,
  camera locks or frame order.

Study path:

1. `gameLoop.js` still calls the context helper in the same frame location and
   consumes `{ canShowWorldSpaceUi, tangrowthPosition }` exactly as before.
2. `prepareWorldSpaceUiFrameContext(...)` now owns finding Tangrowth's actor
   position and applying the Workbench green arrow cue.
3. `resolveWorldSpaceUiVisibility(...)`,
   `shouldShowWorkbenchGreenArrowCue(...)` and
   `applyWorkbenchGreenArrowCue(...)` remain the existing source-of-truth
   functions.
4. No presentation priority, text, cue timing or render snapshot shape changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9172` to `9163`.
- Removed the direct world-space UI visibility and Workbench cue block from
  `startGameLoop()`.
- Added focused tests for Tangrowth position resolution, world-space UI
  visibility forwarding and inactive Workbench cue behavior.

Validation:

```sh
npm test -- --run tests/worldSpaceUiFrameContext.test.js
npm test -- --run tests/worldSpaceUiFrameContext.test.js tests/gameLoopFramePolicies.test.js tests/workbenchRuntime.test.js
git diff --check
npm run build
npm test
```

The focused world-space UI/Workbench cue suite passed with `19` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1669` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Destroyable Landscape Patch Target Boundary

Moved destroyable landscape patch target selection from
`app/runtime/gameLoop.js` into
`app/runtime/fieldMoveRuntime/destroyableLandscapePatchTarget.js`.

Boundary classification: `gameplay action runtime`, focused on resolving the
patch snapshot used by landscape cut effects when a Leafage-instantiated grass
or flower patch is destroyed.

Module boundary note:

- This is a new file inside the existing `fieldMoveRuntime` domain, not a loose
  helper under `app/runtime/`.
- It owns only pure target selection/cloning for the cut-effect source patch.
- It receives `findNearbyDestroyableInstantiatedObject`, `session`,
  `storyState` and `playerPosition` explicitly and does not perform destroy
  actions, audio feedback or HUD notices.

Study path:

1. `gameLoop.js` still owns the action wrappers, audio failure feedback and
   garden progress callbacks.
2. `getDestroyableLandscapePatchForInteractOptions(...)` now resolves the
   cut-effect patch by exact id first, then by `cellId`, preserving the previous
   priority.
3. The cut-effect snapshot still clones `position` and `size`, using the same
   `[1.18, 0.96]` fallback size when no size is present.
4. No destroy action rule, Leafage rule, wood drop rule, UI notice or effect
   timing changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9202` to `9172`.
- Removed the private patch-cloning and patch-target lookup helpers from
  `startGameLoop()`.
- Added focused tests for ignored non-destroy targets, exact-id priority,
  cloned effect shape and fallback-by-cell behavior.

Validation:

```sh
npm test -- --run tests/destroyableLandscapePatchTarget.test.js
npm test -- --run tests/destroyableLandscapePatchTarget.test.js tests/landscapeCutEffectRuntime.test.js tests/gameplayWoodDrops.test.js
git diff --check
npm run build
npm test
```

The focused destroyable landscape/cut-effect suite passed with `10` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1667` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Nature Progress Snapshot Boundary

Moved garden progress and tree revival snapshot helpers from
`app/runtime/gameLoop.js` into
`app/runtime/fieldMoveRuntime/natureProgressSnapshots.js`.

Boundary classification: `gameplay action runtime`, focused on producing pure
before/after signatures used around existing field-move and interaction
actions.

Module boundary note:

- This is a new file inside the existing `fieldMoveRuntime` domain, not a loose
  helper under `app/runtime/`.
- It owns only pure snapshot construction; it does not perform Leafage, Water
  Gun, Fire or Build Block actions.
- The local key-building helpers remain private implementation details inside
  the module.

Study path:

1. `gameLoop.js` still decides when harvest/interact actions run and when
   autosave progress callbacks fire.
2. `getGardenProgressSnapshot(...)` now receives `session` and `storyState`
   explicitly and returns the same sorted signature used for before/after
   comparison.
3. `getTreeRevivalSnapshot(...)` now receives `session` and `storyState`
   explicitly and returns the same palm alive map plus Leppa tree revived state.
4. No field-move tuning, action dispatch order, visual effect timing or
   autosave callback shape changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9241` to `9202`.
- Removed the private garden progress key helpers and tree revival snapshot
  helper from `startGameLoop()`.
- Added focused tests for stable terrain signatures, independent revival maps
  and Leppa tree revived state from session.

Validation:

```sh
npm test -- --run tests/natureProgressSnapshots.test.js
npm test -- --run tests/natureProgressSnapshots.test.js tests/treeRevivalLeafBurstRuntime.test.js tests/natureRevivalEffects.test.js
git diff --check
npm run build
npm test
```

The focused nature/revival suite passed with `11` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1664` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Companion Follower Call Frame Boundary

Moved follower-call frame handling from `app/runtime/gameLoop.js` into
`app/runtime/companions/followerCallFrame.js`.

Boundary classification: `bot/companion motion`, focused on applying the
existing "call bots to follow" request for construction help, campfire help and
Charmander celebration follow-up.

Module boundary note:

- This is a new file inside the existing `companions` domain, not a loose helper
  under `app/runtime/`.
- It owns the companion follow-call rule and receives frame dependencies
  explicitly: `controls`, `session`, `pushNotice` and `playSoundEvent`.
- It imports only companion/audio copy contracts that were already used by the
  original implementation.

Study path:

1. `gameLoop.js` still decides frame order and calls the follower-call handler
   in the same spot before simulation updates.
2. `processFollowerCallFrame(...)` now owns consuming the follower-call request,
   playing the bot signal sound and mutating the same follow flags.
3. Notices remain unchanged for leaf-den construction help, campfire help and
   Charmander celebration follow-up.
4. No input mapping, movement rule, companion formation rule or frame order
   changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9275` to `9241`.
- Removed the private `processFollowerCallFrame()` implementation from
  `startGameLoop()`.
- Added focused tests for the no-request path, leaf-den construction helper
  call and Thermal Bot campfire call.

Validation:

```sh
npm test -- --run tests/followerCallFrame.test.js
git diff --check
npm run build
npm test
```

The focused companion test passed with `3` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1661` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### World Speech Snapshot Frame Boundary

Moved the world-speech snapshot writer from `app/runtime/gameLoop.js` into
`app/runtime/presentation/worldSpeechSnapshotFrame.js`.

Boundary classification: `presentation/render helpers`, focused on converting
already-resolved speech flags/cues into `nextFrame.worldSpeech`.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns a named responsibility: world-speech snapshot writing.
- It keeps the Chopper voice sound as an explicit callback so the presentation
  module does not import the audio runtime.

Study path:

1. `gameLoop.js` still computes speech visibility, companion lost hints,
   attention cues and frame timing.
2. `updateWorldSpeechSnapshotFrame(...)` now owns writing speech text and
   world positions into the frame snapshot.
3. Bulbasaur/Charmander positions and Tangrowth opening text are passed
   explicitly instead of being captured through `session`, `controls` or
   `gameplay`.
4. No dialogue text, voice cue rule, frame order or render shape changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9395` to `9275`.
- Removed the internal `updateWorldSpeechSnapshotFrame(...)` implementation from
  `startGameLoop()`.
- Added focused tests for Tangrowth guide copy, companion-lost priority over
  Chopper attention cues and Chopper voice callback consumption.

Validation:

```sh
npm test -- --run tests/worldSpeechSnapshotFrame.test.js
npm test -- --run tests/worldSpeechSnapshotFrame.test.js tests/worldSpeechVisibility.test.js tests/worldSpeechController.test.js tests/frameSnapshotController.test.js
git diff --check
npm run build
npm test
```

The focused presentation/snapshot suite passed with `19` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1658` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Ground Cell Highlight Frame Boundary

Moved the ground-cell highlight snapshot writer from `app/runtime/gameLoop.js`
into `app/runtime/presentation/groundCellHighlightFrame.js`.

Boundary classification: `presentation/render helpers`, focused on converting
already-resolved ground-cell highlight candidates into
`nextFrame.groundCellHighlight`.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns a named responsibility: ground-cell highlight snapshot writing.
- It preserves the existing priority order for placement footprints, direct
  highlights, marked action cells, feedback pulses and field-tool target pulses.

Study path:

1. `gameLoop.js` still computes placement footprints, active fire targets,
   field move targets and feedback frames.
2. `updateGroundCellHighlightFrame(...)` now owns writing the resolved data into
   the frame snapshot.
3. Field-tool target pulse details still override feedback action-pulse details
   because the write order is preserved.
4. No placement rule, field move rule, pulse tuning or render shape changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9487` to `9395`.
- Removed the internal `updateGroundCellHighlightFrame(...)` implementation from
  `startGameLoop()`.
- Added focused tests for placement footprint priority, highlighted-cell
  metadata and field-tool pulse override behavior.

Validation:

```sh
npm test -- --run tests/groundCellHighlightFrame.test.js
npm test -- --run tests/groundCellHighlightFrame.test.js tests/groundCellHighlightController.test.js tests/frameSnapshotController.test.js tests/groundActionFeedbackRuntime.test.js
git diff --check
npm run build
npm test
```

The focused presentation/snapshot suite passed with `17` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1655` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### World Prompt Snapshot Frame Boundary

Moved the world-prompt snapshot writer from `app/runtime/gameLoop.js` into
`app/runtime/presentation/worldPromptSnapshotFrame.js`.

Boundary classification: `presentation/render helpers`, focused on converting
already-resolved prompt flags and candidates into `nextFrame.worldPrompt`.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns a named responsibility: world-prompt snapshot writing.
- It preserves the existing prompt priority order and writes through
  `setFrameWorldPrompt(...)`, so the snapshot shape stays unchanged.

Study path:

1. `gameLoop.js` still computes prompt visibility, prompt text candidates and
   world query targets.
2. `updateWorldPromptSnapshotFrame(...)` now owns the `if/else` priority chain
   that chooses which prompt payload is written to `nextFrame.worldPrompt`.
3. Player position is passed explicitly instead of the helper reading
   `session.playerCharacter` directly.
4. First-use, invalid-target and placement prompt copy moved with the snapshot
   writer without changing text.

Reduced pressure:

- `gameLoop.js` line count changed from `9696` to `9487`.
- Removed the internal `updateWorldPromptSnapshotFrame(...)` implementation from
  `startGameLoop()`.
- Added focused tests for placement priority, destroyable fallback position and
  first-use prompt copy.

Validation:

```sh
npm test -- --run tests/worldPromptSnapshotFrame.test.js
npm test -- --run tests/worldPromptSnapshotFrame.test.js tests/worldPromptCopy.test.js tests/frameSnapshotController.test.js tests/worldSpeechController.test.js
git diff --check
npm run build
npm test
```

The focused presentation/snapshot suite passed with `20` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1652` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### World Speech Visibility Boundary

Moved the frame-local world-speech priority chain from `app/runtime/gameLoop.js`
into `app/runtime/presentation/worldSpeechVisibility.js`.

Boundary classification: `presentation/render helpers`, focused on deciding
which world-speech candidate wins for the frame before
`updateWorldSpeechSnapshotFrame(...)` writes the snapshot.

Module boundary note:

- This is a new file inside the existing `presentation` domain, not a loose
  helper under `app/runtime/`.
- It owns a named responsibility: world-speech visibility priority.
- It keeps candidate conditions lazy, so lower-priority checks are not evaluated
  after a higher-priority speech wins.

Study path:

1. `resolveWorldSpeechVisibility(...)` owns the current priority order for
   Tangrowth, Chopper, Bulbasaur and Charmander world speech candidates.
2. `gameLoop.js` still owns the candidate conditions because they depend on
   session, story flags, encounter positions and quest state.
3. `gameLoop.js` still owns speech text/position population through
   `updateWorldSpeechSnapshotFrame(...)`.
4. No dialogue text, frame order, render snapshot shape or gameplay rule
   changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9767` to `9696`.
- Removed repeated `!previousSpeech` checks from the frame body.
- Added focused tests for priority selection, all-false state and lazy
  lower-priority candidate evaluation.

Validation:

```sh
npm test -- --run tests/worldSpeechVisibility.test.js
npm test -- --run tests/worldSpeechVisibility.test.js tests/worldSpeechController.test.js tests/frameSnapshotController.test.js tests/worldPromptCopy.test.js
git diff --check
npm run build
npm test
```

The focused presentation/snapshot suite passed with `20` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1649` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### World Prompt Visibility Boundary

Moved the frame-local world-prompt visibility flag assembly from
`app/runtime/gameLoop.js` into `app/runtime/presentation/worldPromptCopy.js`.

Boundary classification: `presentation/render helpers`, focused on deciding
which already-computed world prompt candidates should be visible for the frame.

Study path:

1. `gameLoop.js` still owns world queries and side-effect-prone runtime calls,
   such as repair-box lookup, dry-grass lookup and prompt runtime visibility
   checks.
2. `resolveWorldPromptVisibility(...)` receives those already-computed values
   and returns the same `shouldShow...Prompt` flags used by
   `updateWorldPromptSnapshotFrame(...)`.
3. Workbench rotation still suppresses destroyable-object prompts through the
   same priority rule.
4. No prompt copy, render snapshot shape, input mapping or frame order changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9769` to `9767`.
- Removed the inline boolean assembly for placement, pending placement,
  workbench rotation, destroyable object, field-move, repair-box, counter,
  transient and dry-grass world prompt visibility.
- Added a focused contract test for the presentation policy, including the
  workbench-over-destroyable priority and global world-UI gating.

Validation:

```sh
npm test -- --run tests/worldPromptCopy.test.js
npm test -- --run tests/worldPromptCopy.test.js tests/hudPromptCopy.test.js tests/placementPreviewPrompts.test.js tests/pendingPlacementIntent.test.js
git diff --check
npm run build
npm test
```

The focused presentation/prompt suite passed with `21` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1646` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Frame Pending Placement Intent Boundary

Moved frame-level pending placement intent gating from
`app/runtime/gameLoop.js` into
`app/runtime/construction/pendingPlacementIntent.js`.

Boundary classification: `construction`, focused on whether a pending placement
intent can be active for the current frame while placement previews are active.

Study path:

1. `resolveFramePendingPlacementIntent(...)` owns the rule that active placement
   previews suppress pending placement intents for prompt resolution.
2. It reuses `getActivePendingPlacementIntent(...)` for ownership, inventory and
   story-flag checks.
3. `gameLoop.js` still owns HUD prompt composition and delegates prompt copy to
   `getPendingPlacementPrompt(...)`.
4. No prompt copy, placement rule, input mapping or frame order changed.

Reduced pressure:

- `gameLoop.js` line count stayed at `9769`, while the frame-local pending
  intent gate moved into the construction boundary.
- Removed direct `getActivePendingPlacementIntent(...)` usage from
  `gameLoop.js`.
- Added focused tests for blocked and allowed frame pending placement intents.

Validation:

```sh
npm test -- --run tests/pendingPlacementIntent.test.js
npm test -- --run tests/pendingPlacementIntent.test.js tests/placementPreviewPrompts.test.js tests/worldPromptCopy.test.js tests/hudPromptCopy.test.js tests/gameLoopFrameRuntime.test.js
git diff --check
npm run build
npm test
```

The focused construction/prompt/frame suite passed with `25` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1645` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Placement Preview Prompt State Boundary

Moved placement-preview prompt blocker state from `app/runtime/gameLoop.js` into
`app/runtime/construction/placementPreviewPrompts.js`.

Boundary classification: `construction`, focused on placement-preview prompt
state and whether active placement previews should block other prompt targets.

Study path:

1. `hasPlacementPreviewPromptBlocker(...)` owns the "any active placement
   preview blocks other prompt targets" check.
2. `resolveFramePlacementPromptState(...)` returns both
   `placementPreviewBlocked` and `framePlacementPrompts`.
3. `gameLoop.js` still owns workbench rotation target lookup, pending placement
   intent lookup, destroyable-object prompt lookup and debug payload emission.
4. No prompt copy, input mapping, placement rule or frame order changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9772` to `9769`.
- Removed local placement-preview blocker boolean assembly from
  `resolveFramePromptTargetState(...)`.
- Added focused tests for blocker detection and the combined prompt state.

Validation:

```sh
npm test -- --run tests/placementPreviewPrompts.test.js
npm test -- --run tests/placementPreviewPrompts.test.js tests/worldPromptCopy.test.js tests/hudPromptCopy.test.js tests/pendingPlacementIntent.test.js tests/gameLoopFrameRuntime.test.js
git diff --check
npm run build
npm test
```

The focused construction/prompt/frame suite passed with `24` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1644` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Camera Look Input Policy Boundary

Moved camera look input calculation from `app/runtime/gameLoop.js` into
`app/runtime/gameLoopFramePolicies.js`.

Boundary classification: `gameLoop` policy with camera input data. The frame
still owns applying the result to `cameraOrbit.rotate(...)`, clearing blocked
input and registering tutorial camera-look progress.

Study path:

1. `resolveCameraLookInput(...)` owns keyboard turn direction, consumed
   look-delta combination, yaw/pitch output and the existing `0.0001` input
   epsilon.
2. `gameLoop.js` still decides whether camera rotation is allowed through
   `resolveCameraInputPermissions(...)`.
3. The `cameraOrbit.rotate(...)` side effect remains in the same
   `updateCameraInputFrame(...)` position.
4. No camera tuning, input mapping or frame order changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9774` to `9772`.
- Removed keyboard-turn and look-delta math from the frame body.
- Added focused tests for keyboard yaw, analog look delta and below-epsilon
  no-input behavior.

Validation:

```sh
npm test -- --run tests/gameLoopFramePolicies.test.js
npm test -- --run tests/gameLoopFramePolicies.test.js tests/cameraZoomPresetController.test.js tests/camera.test.js tests/gameplayCameraDirector.test.js tests/gameLoopFrameRuntime.test.js
git diff --check
npm run build
npm test
```

The focused camera/frame suite passed with `26` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1642` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Camera Zoom-Cycle Request Boundary

Moved zoom-cycle request draining from `app/runtime/gameLoop.js` into
`app/runtime/camera/cameraZoomPresetController.js`.

Boundary classification: `camera runtime/debug`, focused on camera zoom input
application. The frame still decides whether zoom cycling is allowed through
`resolveCameraInputPermissions(...)`.

Study path:

1. `consumeCameraZoomCycleRequests(...)` drains every pending zoom-cycle request,
   preserving the previous behavior where blocked requests are consumed without
   applying a zoom change.
2. When cycling is allowed, it calls the active
   `cameraZoomPresetController.cycle()` and then the supplied `onCycle`
   callback for sound/UI side effects.
3. `gameLoop.js` still owns camera permission resolution and passes the same
   `SOUND_EVENT_IDS.UI_NAVIGATE` side effect from the same frame position.
4. No camera tuning, input mapping or frame order changed.

Reduced responsibility:

- `gameLoop.js` line count stayed effectively flat, changing from `9773` to
  `9774` because the extracted policy is called with explicit dependencies.
- Removed the manual zoom-cycle request drain loop from `gameLoop.js`.
- Added focused tests for allowed cycles and blocked-but-drained requests.

Validation:

```sh
npm test -- --run tests/cameraZoomPresetController.test.js
npm test -- --run tests/cameraZoomPresetController.test.js tests/camera.test.js tests/gameplayCameraDirector.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
npm test
```

The focused camera/frame suite passed with `24` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1640` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Active Zoom Preset Restore Boundary

Moved active zoom preset restoration on player movement from
`app/runtime/gameLoop.js` into
`app/runtime/camera/cameraZoomPresetController.js`.

Boundary classification: `camera runtime/debug`, focused on restoring the active
camera zoom/distance preset when player movement resumes while a target
transition is active.

Study path:

1. `restoreActiveZoomPresetOnMovement(...)` owns the camera pose restore
   payload: existing target fallback, orbit direction fallback, active preset
   zoom/distance, `applyCurrent()` and `camera.follow(...)`.
2. `gameLoop.js` still owns the movement gate: moved distance, tutorial state,
   gameplay-opening camera lock and foundation-focus lock.
3. The call remains in the same player movement frame position.
4. No camera tuning, input mapping or frame order changed.

Reduced pressure:

- `gameLoop.js` line count changed from `9783` to `9773`.
- Removed the local active zoom restore helper from `gameLoop.js`.
- Added focused tests for restore behavior and no-op conditions.

Validation:

```sh
npm test -- --run tests/cameraZoomPresetController.test.js
npm test -- --run tests/cameraZoomPresetController.test.js tests/camera.test.js tests/gameplayCameraDirector.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
npm test
```

The focused camera/frame suite passed with `22` tests.

The full suite completed with the existing Leafage Native Tree baseline:

- `1638` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Build-Zone Camera Focus Pose Boundary

Moved foundation build-zone camera focus pose creation from
`app/runtime/gameLoop.js` into
`app/runtime/camera/foundationBuildZoneCameraFocusRuntime.js`.

Boundary classification: `camera runtime/debug`, focused on camera pose payload
creation for the builder tutorial foundation-zone focus.

Study path:

1. `createFoundationBuildZoneCameraFocusPose(...)` owns the target height,
   zoom and distance values used by the one-time foundation focus.
2. `createFoundationBuildZoneCameraFocusRuntime(...)` now carries defaults for
   duration and story flag key, preserving the existing optional argument API.
3. `gameLoop.js` still decides mission activity, zone availability and when to
   call `camera.startPoseTransition(...)`.
4. Frame order and `startFocus` side effects are unchanged.

Reduced pressure:

- `gameLoop.js` line count changed from `9804` to `9783`.
- Removed foundation camera focus tuning constants and the local pose builder
  from `gameLoop.js`.
- Added focused tests for the exact pose payload and invalid-position behavior.

Validation:

```sh
npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js
npm test -- --run tests/foundationBuildZoneCameraFocusRuntime.test.js tests/camera.test.js tests/gameplayCameraDirector.test.js tests/gameLoopFrameRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
npm test
```

The focused camera/frame suite passed with `27` tests. Manual gameplay
validation remains pending in this pass.

The full suite completed with the existing Leafage Native Tree baseline:

- `1636` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

### Foundation Completion Effect Policy Boundary

Moved builder tutorial foundation completion effect policy from
`app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on foundation completion
flags, foundation-complete feedback metadata and cloud-burst payload
preparation. The live feedback runtime call and `session` assignment remain in
`gameLoop.js`.

Study path:

1. `applyFoundationBuildZoneCompleteEffects(...)` owns the specific story flags
   for foundation completion effects.
2. It preserves the existing `foundationComplete` feedback id, `3000ms`
   feedback duration, cloud burst id and `1800ms` cloud duration.
3. It filters active cloud bursts with the existing started/duration check and
   returns the next `constructionCloudBursts` list only when a cloud burst
   should be applied.
4. `gameLoop.js` still owns building interior ground cells, calling
   `groundActionFeedbackRuntime.triggerFeedback(...)` and assigning
   `session.constructionCloudBursts`.

Reduced pressure:

- `gameLoop.js` line count changed from `9824` to `9804`.
- Removed foundation completion flags, feedback tuning and cloud-burst payload
  construction from `gameLoop.js`.
- Added focused tests for one-time flag mutation, active cloud filtering and
  no-replay behavior after both effects have played.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/groundActionFeedbackRuntime.test.js tests/constructionCloudEffects.test.js
git diff --check
npm run build
```

The focused construction/foundation/effects suite passed with `53` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1634` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

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

### Repair Box Highlight Runtime Integration

Extended `app/runtime/companions/companionRepairBoxModelRuntime.js` instead of
creating another file.

Boundary:

- Domain: `companions/`.
- Responsibility: visual highlight policy for active companion repair boxes.
- Classification: companion/presentation runtime.

Extracted from `gameLoop.js`:

1. Choosing the first active repair box to highlight.
2. Preserving reveal-opening repair boxes so cinematic tint/alpha is not
   overwritten.
3. Resetting non-highlighted repair boxes to inactive tint/alpha state.

Kept in `gameLoop.js`:

1. `syncActiveRepairBoxHighlight()` remains as a small wiring function because
   `baseRenderSnapshotFrameRuntime` already receives that callback.
2. `gameLoop.js` only builds the current repair-module and reveal-encounter
   lists, then delegates to
   `companionRepairBoxModelRuntime.syncActiveHighlight(...)`.
3. Shared active-tint constants stay in `gameLoop.js` for now because Bee Field
   wiring also uses them.

Why this is safe:

- No frame order changed; the same render snapshot callback still runs in the
  same position.
- The highlight policy moved into the existing companion repair-box runtime
  rather than adding file sprawl.
- Existing tint, tint strength and inactive alpha values are passed through
  unchanged.

Validation:

```sh
npm test -- --run tests/companionRepairBoxModelRuntime.test.js
npm test -- --run tests/companionRepairBoxModelRuntime.test.js tests/baseRenderSnapshotFrame.test.js tests/beeFieldRuntime.test.js
npm run build
npm test
```

Results:

- Focused companion repair-box model runtime test: `6` passed.
- Neighbor render/Bee Field suite: `12` passed.
- Production build passed.
- Full suite completed with the existing Leafage Native Tree baseline:
  `1761` passed and `3` failed in `tests/gameplayInteractions.test.js`.

Manual gameplay validation remains pending for this cut.

### Nature Presentation Frame Runtime Boundary

Expanded `app/runtime/presentation/natureRenderFrame.js` with
`createNaturePresentationFrameRuntime(...)`.

Boundary classification: `presentation / render helpers`, focused on the
nature/environment render pass that prepares grass, flower, drop, repair-box
nature particles, landscape cut effects, snowstorm billboards and gameplay
opening ship billboards.

Study path:

1. `startGameLoop()` wires the runtime dependencies as composition root.
2. `frame(now)` still decides when render snapshot preparation happens.
3. The nature runtime now owns the local ordering for natural presentation:
   render context, grass pass, rebirth ghost tree, landscape cut, nature
   particles/drops, snowstorm billboards and opening ship billboards.
4. `gameLoop.js` keeps the handoff values still needed by later render passes:
   `grassBendPlayerPosition` and `natureRenderCenter`.

Removed from `gameLoop.js`:

- direct import/use of `prepareRenderSnapshotContext(...)`;
- direct import/use of `getGrassCollisionObjects(...)`;
- direct import/use of `getSelectedRepairBoxParticleTarget(...)`;
- direct import/use of `getRepairBoxRevealParticleTarget(...)`;
- direct import/use of `updateNatureGrassRenderFrame(...)`;
- direct import/use of `updateNatureRenderFrame(...)`;
- direct import/use of `appendRebirthOfNatureGhostTree(...)`;
- direct import/use of `getSnowstormBillboards(...)`;
- direct import/use of `appendGameplayOpeningShipBillboards(...)`;
- direct landscape-cut append wiring from the render-preparation block.

Kept in `gameLoop.js`:

- the overall frame order;
- world-object billboard rendering after the nature pass;
- companion render presentation after world-object billboards;
- nature revival leaf-burst billboards after companion rendering, because that
  ordering is later in the existing frame and was not moved in this cut;
- debug collider snapshot and render character channel assignment.

Line-count impact:

- Before this cut, committed `app/runtime/gameLoop.js` was `2631` lines.
- After this cut, `app/runtime/gameLoop.js` is `2559` lines.
- No new file was created; the boundary was added to the existing
  `presentation/natureRenderFrame.js` module.

Tests updated:

- `tests/natureRenderFrame.test.js`

TDD sequence:

```sh
npm test -- --run tests/natureRenderFrame.test.js
```

The first run failed because `createNaturePresentationFrameRuntime(...)` did
not exist yet. After adding the runtime factory, the focused test passed.

Passed:

```sh
npm test -- --run tests/natureRenderFrame.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1973` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Player Harvest Action Runtime Boundary

Expanded `app/player/playerActionRuntime.js` with
`createPlayerHarvestActionRuntime(...)` so the player boundary owns harvest
side-effect orchestration that was still implemented inside `frame(now)`.

Boundary classification: `player / gameplay action runtime`, focused on
post-harvest counters, supply feedback, stamina bookkeeping and field feedback.

Removed from `gameLoop.js`:

- local before/after Water Gun tree and restored-grass count tracking;
- local dry-grass and tree counter prompt updates;
- local changed-supply pickup feedback dispatch;
- local Squirtle Water Gun stamina usage bookkeeping;
- local Fire ground feedback dispatch;
- local harvest action type derivation.

Kept in `gameLoop.js`:

- the local `performHarvestAction(...)` wrapper, because it captures current
  frame state (`now`, equipped moves and player position);
- primary action branch order;
- field-move fallback branch order.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` baseline was `3065`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is `3041`
  lines.

Tests extended:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `createPlayerHarvestActionRuntime(...)` did not
exist yet. After extending the existing player action runtime module, the
focused test passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js
```

Focused result:

- `3` test files passed
- `20` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Player Primary Action Secondary Target Query Boundary

Expanded `app/player/playerActionTargetContext.js` so the player boundary also
owns the pure follow-up query decisions for the primary action branch.

Boundary classification: `player / gameplay action runtime`, focused on
secondary target query policy after the primary action target has been
classified.

Removed from `gameLoop.js`:

- inline invalid Leafage/Fire field-move classification;
- inline already-resolved field-move fallback condition;
- inline interact-target query condition;
- inline rotation-target query condition;
- inline bag-destroy target query condition;
- repeated positional argument assembly for `gameplay.findNearbyInteractable`;
- repeated positional argument assembly for
  `findNearbyDestroyableInstantiatedObject`.

Kept in `gameLoop.js`:

- calls that perform the actual target queries;
- workbench rotation side effects;
- invalid feedback side effects;
- field-move execution branches.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` baseline was `3087`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is `3065`
  lines.

Tests extended:

- `tests/playerActionTargetContext.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionTargetContext.test.js
```

The first run failed because `getNearbyInteractableArgs(...)`,
`getBagDestroyTargetArgs(...)`,
`resolvePrimaryActionTargetFollowupIntent(...)` and
`resolvePrimaryActionSecondaryTargetQueries(...)` did not exist yet. After
extending the existing player target context module, the focused test passed.

Passed:

```sh
npm test -- --run tests/playerActionTargetContext.test.js tests/playerActionContext.test.js tests/playerActionRuntime.test.js
```

Focused result:

- `3` test files passed
- `17` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Player Primary Action Target Intent Boundary

Expanded `app/player/playerActionTargetContext.js` so the player boundary also
owns the pure target-intent classification used by the primary action branch.

Boundary classification: `player / gameplay action runtime`, focused on
classifying action target intent without executing side effects.

Removed from `gameLoop.js`:

- inline placement-target classification;
- inline field-move intent classification;
- inline move/placement/blocked/bag-harvest classification;
- inline Leafage auto-Water-Gun target query condition;
- inline Water-Gun auto-Leafage target query condition;
- local Water Gun tree-target helper.

Kept in `gameLoop.js`:

- action execution order;
- calls to `gameplay.findNearbyActionTarget(...)`;
- feedback side effects;
- invalid target prompts;
- field-move runtime calls.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` baseline was `3124`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is `3087`
  lines.

Tests extended:

- `tests/playerActionTargetContext.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionTargetContext.test.js
```

The first run failed because `resolvePrimaryActionTargetIntent(...)` and
`resolvePrimaryActionAutoTargetQueries(...)` did not exist yet. After extending
the existing player target context module, the focused test passed.

Passed:

```sh
npm test -- --run tests/playerActionTargetContext.test.js tests/playerActionContext.test.js tests/playerActionRuntime.test.js
```

Focused result:

- `3` test files passed
- `14` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Player Action Target Context Boundary

Created `app/player/playerActionTargetContext.js` so the player boundary owns
the repeated payload assembly for `gameplay.findNearbyActionTarget(...)`.

Boundary classification: `player / gameplay action runtime`, focused on
assembling action-target query options from `session` and `controls`.

Removed from `gameLoop.js`:

- repeated nearby action target option objects for the primary action;
- repeated nearby action target option objects for Leafage/Water Gun fallback
  target queries;
- repeated nearby action target option object for held Water Gun targeting.

Kept in `gameLoop.js`:

- action decision order;
- equipped-state rules;
- field-move fallback selection;
- the distinction that held Water Gun targeting omits `iceGroundInstances` and
  `canUseFire`, matching the previous call shape.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` baseline was `3157`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is `3124`
  lines.

Tests added:

- `tests/playerActionTargetContext.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionTargetContext.test.js
```

The first run failed because `createPlayerActionTargetContext(...)` did not
exist yet. After adding the helper under the existing `player` boundary, the
focused test passed.

Passed:

```sh
npm test -- --run tests/playerActionTargetContext.test.js tests/playerActionContext.test.js tests/playerActionRuntime.test.js
```

Focused result:

- `3` test files passed
- `9` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Player Action Context Boundary

Created `app/player/playerActionContext.js` so the player boundary owns the
repeated payload assembly for harvest, interact and destroy actions.

Boundary classification: `player / gameplay action runtime`, focused on
assembling references from `session` and `controls` for existing player action
runtime calls.

Removed from `gameLoop.js`:

- repeated `performHarvest(...)` option object assembly;
- repeated `performDestroy(...)` option object assembly;
- repeated `performInteract(...)` option object assembly;
- direct duplication of the same `session` and `controls` references across the
  primary action, destroy action and interact action branches.

Kept in `gameLoop.js`:

- action decision order;
- harvest request source handling;
- field-move fallback behavior;
- counter prompts, audio, stamina recording and invalid target feedback;
- NPC interaction callback wiring.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` baseline was `3232`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is `3157`
  lines.

Tests added:

- `tests/playerActionContext.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionContext.test.js
```

The first run failed because `createPlayerActionContext(...)` did not exist yet.
After adding the helper under the existing `player` boundary, the focused test
passed.

Passed:

```sh
npm test -- --run tests/playerActionContext.test.js tests/playerActionRuntime.test.js tests/playerResourceCollectionFrame.test.js tests/playerMovementFrame.test.js
```

Focused result:

- `4` test files passed
- `12` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Companion Facing Runtime Wiring

Created `app/runtime/companions/companionFacingRuntime.js` so the companion
boundary owns bot model-facing helpers that were still implemented locally in
`gameLoop.js`.

Boundary classification: `bot/companion motion`, focused on model yaw toward
targets and logical facing yaw read from companion model instances.

Removed from `gameLoop.js`:

- local Hydro Bot model-yaw helper;
- local generic robot model-yaw helper;
- local Hydro Bot logical-facing helper;
- local Charmander logical-facing helper;
- local Bulbasaur logical-facing helper;
- direct imports of companion-facing math internals from `modelFacing.js`.

Kept in `gameLoop.js`:

- composition wiring;
- existing companion model-face yaw constants;
- raw `getYawToward(...)` for NPC conversation facing, because that is not a
  companion-specific rule.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` baseline was `3256`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is `3232`
  lines.

Tests added:

- `tests/companionFacingRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/companionFacingRuntime.test.js
```

The first run failed because `createCompanionFacingRuntime(...)` did not exist
yet. After adding the runtime under the existing `companions` boundary, the
focused runtime test passed.

Passed:

```sh
npm test -- --run tests/companionFacingRuntime.test.js tests/modelFacing.test.js tests/companionFollowMovementRuntime.test.js tests/companionIdleMotionRuntime.test.js tests/npcConversationFocusRuntime.test.js tests/waterGunRuntime.test.js tests/fireRuntime.test.js tests/leafageRuntime.test.js tests/buildBlockRuntime.test.js
```

Focused result:

- `9` test files passed
- `38` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Construction Placement Control Runtime Wiring

Created `app/runtime/construction/constructionPlacementControlRuntime.js` so
the construction boundary owns placement control helpers that were still
implemented locally in `gameLoop.js`.

Boundary classification: `construction`, focused on placement cancel/rotate,
Build Block equipped state and Free Block cost marker wiring.

Removed from `gameLoop.js`:

- local pending Workbench placement cancel-with-notice wrapper;
- local active placement preview rotation wrapper;
- local Build Block equipped-state helper;
- local Free Block cost-marker helper;
- direct local imports of placement rotate and cost marker internals.

Kept in `gameLoop.js`:

- composition wiring;
- placement frame runtime ordering;
- active placement preview cancellation used by broader placement contracts;
- Free Block invalid placement notice text for the primary-action branch.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was `3283` lines.
- After this cut, `app/runtime/gameLoop.js` is `3256` lines.

Tests added:

- `tests/constructionPlacementControlRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionPlacementControlRuntime.test.js
```

The first run failed because `createConstructionPlacementControlRuntime(...)`
did not exist yet. After adding the runtime under the existing `construction`
boundary, the focused runtime test passed.

Passed:

```sh
npm test -- --run tests/constructionPlacementControlRuntime.test.js tests/constructionPlacementFrameRuntime.test.js tests/pendingPlacementIntent.test.js tests/placementPreviewPrompts.test.js tests/worldPromptFrameState.test.js tests/worldSpacePresentationFrameState.test.js
npm run build
```

Focused result:

- `6` test files passed
- `37` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### World Scene Sync Runtime Wiring

Created `app/runtime/world/worldSceneSyncRuntime.js` so the world boundary owns
small scene/interactable sync responsibilities that were still implemented
inside `gameLoop.js`.

Boundary classification: `world`, focused on world-space scene sync and
distance queries used by presentation/companion systems.

Removed from `gameLoop.js`:

- local interactable position sync;
- local Workbench interactable sync;
- local Pokemon Center workshop visual-state sync;
- local player-near-world-position query.

Kept in `gameLoop.js`:

- composition wiring;
- frame scene-sync order;
- Workbench tuning constants passed into the world runtime;
- consumers in companion speech/model sync and presentation frame state.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was `3318` lines.
- After this cut, `app/runtime/gameLoop.js` is `3283` lines.

Tests added:

- `tests/worldSceneSyncRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/worldSceneSyncRuntime.test.js
```

The first run failed because `createWorldSceneSyncRuntime(...)` did not exist
yet. After adding the runtime under the existing `world` boundary, the focused
runtime test passed.

Passed:

```sh
npm test -- --run tests/worldSceneSyncRuntime.test.js tests/companionModelSyncRuntime.test.js tests/beeFieldRuntime.test.js tests/companionWorldSpeechCueRuntime.test.js tests/worldSpeechFrameState.test.js tests/worldSpacePresentationFrameState.test.js tests/baseRenderSnapshotFrame.test.js
npm run build
```

Focused result:

- `7` test files passed
- `24` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Companion Encounter Runtime Wiring

Created `app/runtime/companions/companionEncounterRuntime.js` so the companion
domain owns the existing Bulbasaur, Charmander and Timburr encounter update
rules.

Boundary classification: `companions`, focused on companion encounter frame
behavior. The runtime still delegates motion, model sync, repair-box reveal,
Workbench guide and Leaf Den helper movement to the existing specialized
runtimes.

Removed from `gameLoop.js`:

- local Bulbasaur encounter update function;
- local Charmander encounter update function;
- local Timburr encounter update function;
- direct local use of the Thermal Cabin home-beat policy inside frame wiring.

Kept in `gameLoop.js`:

- `startGameLoop()` composition wiring;
- `companionFrameRuntime` orchestration order;
- field-move action updates;
- companion tuning constants passed into the companion runtime;
- public re-export of `shouldCompleteThermalCabinHomeBeat`.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was `3457` lines.
- After this cut, `app/runtime/gameLoop.js` is `3318` lines.

Tests added:

- `tests/companionEncounterRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/companionEncounterRuntime.test.js
```

The first run failed because `createCompanionEncounterRuntime(...)` did not
exist yet. After adding the runtime under the existing `companions` boundary,
the focused runtime test passed.

Passed:

```sh
npm test -- --run tests/companionEncounterRuntime.test.js tests/companionFrameRuntime.test.js tests/companionFollowMovementRuntime.test.js tests/companionIdleMotionRuntime.test.js tests/bulbasaurWorkbenchGuideRuntime.test.js tests/trainHouseRuntime.test.js
npm run build
```

Focused result:

- `6` test files passed
- `28` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Construction Placement Preview Runtime Wiring

Created `app/runtime/construction/constructionPlacementPreviewRuntime.js` so
the construction boundary owns the wiring for Solar Station, Leaf Den Kit,
Campfire/Train House and Greenhouse placement previews.

Boundary classification: `construction`, focused on placement preview update
wiring. The runtime delegates to the existing preview update helpers and keeps
the same validation, blocker, solar-radius and model-state behavior.

Removed from `gameLoop.js`:

- local Solar Station placement preview wrapper;
- local Leaf Den Kit placement preview wrapper;
- local Campfire/Train House rectangular preview wrapper;
- local Greenhouse rectangular preview wrapper;
- direct imports of preview update internals from
  `constructionPlacementFrameRuntime.js`.

Kept in `gameLoop.js`:

- `startGameLoop()` composition wiring;
- construction placement frame ordering;
- placement cancel/rotate controls;
- placement tuning constants passed into the construction runtime.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was `3510` lines.
- After this cut, `app/runtime/gameLoop.js` is `3457` lines.

Tests added:

- `tests/constructionPlacementPreviewRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionPlacementPreviewRuntime.test.js
```

The first run failed because `createConstructionPlacementPreviewRuntime(...)`
did not exist yet. After adding the runtime under the existing
`app/runtime/construction` boundary, the focused runtime test passed.

Passed:

```sh
npm test -- --run tests/constructionPlacementPreviewRuntime.test.js tests/constructionPlacementFrameRuntime.test.js tests/solarStationPlacementBlockers.test.js tests/solarStationPowerRadius.test.js
npm run build
```

Focused result:

- `4` test files passed
- `32` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Player Action Runtime Wiring

Created `app/player/playerActionRuntime.js` so the player domain owns the
existing `harvest`, `interact` and `destroy` action side effects that were
previously implemented as local `gameLoop.js` functions.

Boundary classification: `player`, focused on player-triggered gameplay
actions. The runtime still delegates actual gameplay rules to the existing
`gameplay.performHarvestAction(...)`, `gameplay.performInteractAction(...)`,
Free Block construction runtime and existing pure target/snapshot helpers.

Removed from `gameLoop.js`:

- local harvest action progress/effect wrapper;
- local destroyable landscape patch lookup wrapper;
- local interact action landscape-cut wrapper;
- local destroy action Free Block/landscape/audio wrapper;
- direct imports of nature progress snapshots and destroyable landscape patch
  target lookup.

Kept in `gameLoop.js`:

- input branch ordering;
- construction and field-move action selection;
- all option payloads passed to player actions;
- sound IDs, notice text and callback wiring.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was `3592` lines.
- After this cut, `app/runtime/gameLoop.js` is `3510` lines.

Tests added:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `createPlayerActionRuntime(...)` did not exist
yet. After adding the runtime under the existing `app/player` boundary, the
focused runtime test passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js tests/fieldMoveImpactRuntime.test.js tests/natureProgressSnapshots.test.js tests/destroyableLandscapePatchTarget.test.js
npm run build
```

Focused result:

- `4` test files passed
- `13` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Free Block Build Runtime Wiring

Created `app/runtime/construction/freeBlockBuildRuntime.js` so the Free Block
construction boundary owns the existing build target resolution, preview sync,
placement result handling, Timburr impact placement, post-placement player
displacement, removal drops and feedback callbacks.

Boundary classification: `construction`, focused on Free Block build behavior
and its integration points with foundation zones, companion blockers, player
model sync and ground-action feedback.

Removed from `gameLoop.js`:

- local Free Block grid/controller wrappers;
- local Free Block cell-world-position wrapper;
- local Free Block feedback ground-cell wrapper;
- local Free Block snapshot sync wrapper;
- local post-placement player displacement wrapper;
- local placement result side-effect wrapper;
- local direct build-input placement wrapper;
- local Free Block build-target wrapper;
- local Free Block preview target/sync wrappers;
- local Timburr Build Block impact-placement wrapper;
- local nearby Free Block removal wrapper;
- direct imports of Free Block preview/removal/placement-result internals.

Kept in `gameLoop.js`:

- `startGameLoop()` dependency wiring;
- Build Block runtime callback wiring;
- construction placement frame callback wiring;
- destroy-action branch order;
- Free Block tuning constants and HUD/audio callback sources.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was `3754` lines.
- After this cut, `app/runtime/gameLoop.js` is `3592` lines.

Tests added:

- `tests/freeBlockBuildRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockBuildRuntime.test.js
```

The first run failed because `createFreeBlockBuildRuntime(...)` did not exist
yet. After adding the runtime factory, the focused runtime test passed.

Passed:

```sh
npm test -- --run tests/freeBlockBuildRuntime.test.js tests/freeBlockPreview.test.js tests/freeBlockPlacementResult.test.js tests/freeBlockRemoval.test.js tests/freeBlockBuildSessionRuntime.test.js tests/freeBlockBuildSystem.test.js tests/constructionPlacementFrameRuntime.test.js tests/buildBlockRuntime.test.js
npm run build
```

Focused result:

- `8` test files passed
- `85` tests passed

Full-suite validation was not repeated for this cut. The known baseline still
has failures outside this boundary: the existing Leafage Native Tree failures
and the isolated scene-flow failure tied to dirty `startScreen.js` / bootstrap
work.

Manual gameplay validation remains pending for this cut.

### Construction Placement Blocker Runtime Wiring

Integrated the existing placement blocker helpers through small runtime
factories inside the `construction` boundary:

- `createWorldObjectPlacementBlockerRuntime(...)` in
  `app/runtime/construction/worldObjectPlacementBlockers.js`
- `createSolarStationPlacementBlockerRuntime(...)` in
  `app/runtime/construction/solarStationPlacementBlockers.js`

Boundary classification: `construction`, focused on blocker dependency wiring
for placement preview validation and foundation-zone blocker assembly.

Study path:

1. `gameLoop.js` used to own local wrapper functions that injected tree
   footprint tuning, Solar Station footprints, story state, player blockers,
   world-object blockers and placement geometry callbacks.
2. The construction modules already owned the pure blocker rules. This cut
   moved the composition of those rules into runtime factories with explicit
   dependencies.
3. `startGameLoop()` still wires the dependencies as the composition root.
   The frame order, placement preview update order and `requestAnimationFrame`
   scheduling did not move.

Removed from `gameLoop.js`:

- local `getTreePlacementBlockerSize(...)` wrapper;
- local `getLeppaTreePlacementBlockerSize(...)` wrapper;
- local `getWorldObjectPlacementBlockers(...)` wrapper;
- local `getSolarStationPlacementBlockers(...)` wrapper;
- local `isSolarStationPlacementBlocked(...)` wrapper.

Kept in `gameLoop.js`:

- construction placement preview orchestration;
- placement geometry imports used by other local construction flows;
- all placement tuning constants;
- all gameplay, field move, input, audio and camera behavior.

Tests updated:

- `tests/worldObjectPlacementBlockers.test.js`
- `tests/solarStationPlacementBlockers.test.js`

TDD sequence:

```sh
npm test -- --run tests/worldObjectPlacementBlockers.test.js tests/solarStationPlacementBlockers.test.js
```

The first run failed because the runtime factories did not exist yet. After
adding the factories and wiring `gameLoop.js` through them, the focused
construction validation passed.

Passed:

```sh
npm test -- --run tests/worldObjectPlacementBlockers.test.js tests/solarStationPlacementBlockers.test.js tests/constructionPlacementFrameRuntime.test.js tests/foundationBuildZone.test.js tests/placementBlockers.test.js
npm run build
```

Focused result:

- `5` test files passed
- `63` tests passed

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `309` test files passed, `1` failed
- `1893` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

The three failures remain:

- `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
- `grows Native tree on a safe nearby cell instead of trapping the player under it`
- `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending for this cut.

### Companion World Speech Cue Runtime

Added `app/runtime/companions/companionWorldSpeechCueRuntime.js`.

Classification: `companions`, specifically world-space companion speech cues.

Study path:

1. `gameLoop.js` still owned the wiring for two companion speech policies:
   Chopper's periodic "Hey!" cue and the periodic lost-companion Water Gun
   hint.
2. The low-level pure policies remain in their existing modules:
   `chopperAttentionCueRuntime.js` and `companionLostHintRuntime.js`.
3. The new runtime composes those existing policies with frame/session
   dependencies: story flags, player skills, bot positions, player proximity
   checks and schedule/tuning values.
4. Presentation still receives the same callback names and data shapes, so the
   world-space UI and world-speech snapshot contracts did not change.

Removed from `gameLoop.js`:

- direct construction of `createChopperAttentionCueRuntime(...)`;
- direct construction of `createCompanionLostHintRuntime(...)`;
- local `getPeriodicChopperAttentionCue(...)` wrapper;
- local `getPeriodicCompanionLostHint(...)` wrapper;
- direct imports of the companion cue resolver functions.

Kept in `gameLoop.js`:

- runtime composition and injection of tuning/text constants;
- the existing presentation callback name `getPeriodicChopperAttentionCue`,
  because that is the current presentation-frame API;
- Chopper voice sound dispatch, because audio events still flow through the
  game-loop composition root.

Tests added:

- `tests/companionWorldSpeechCueRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/companionWorldSpeechCueRuntime.test.js
```

The first run failed because `companionWorldSpeechCueRuntime.js` did not exist.
After adding the runtime factory, the focused test passed.

Passed:

```sh
npm test -- --run tests/companionWorldSpeechCueRuntime.test.js
npm test -- --run tests/companionWorldSpeechCueRuntime.test.js tests/chopperAttentionCueRuntime.test.js tests/companionLostHintRuntime.test.js tests/worldSpacePresentationFrameState.test.js tests/worldPromptFrameState.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `309` test files passed, `1` failed
- `1888` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Field Move Position Source Runtime

Expanded existing `fieldMoveRuntime` modules:

- `app/runtime/fieldMoveRuntime/fieldMoveActorPositions.js`
- `app/runtime/fieldMoveRuntime/fieldMoveApproachPositions.js`

Classification: `fieldMoveRuntime`, specifically actor position and approach
position source wiring.

Study path:

1. The pure position math stayed in the existing field-move modules.
2. `createFieldMoveActorPositionRuntime(...)` now owns the session/yaw binding
   for Squirtle mouth position, Charmander mouth position, Bulbasaur grow
   emitter position and companion world positions.
3. `createFieldMoveApproachPositionRuntime(...)` now owns the session/blocker
   binding for Water Gun, Leafage, Fire and Build Block approach positions.
4. Water Gun, Leafage, Fire and Build Block runtimes still receive callbacks
   with the same behavior and timing. No ability tuning changed.

Removed from `gameLoop.js`:

- local `getSquirtleWaterGunApproachPosition(...)` wrapper;
- local `getBulbasaurLeafageApproachPosition(...)` wrapper;
- local `getTimburrBuildBlockApproachPosition(...)` wrapper;
- local `getCharmanderFireApproachPosition(...)` wrapper;
- local `getSquirtleMouthPosition(...)` wrapper;
- local `getCharmanderMouthPosition(...)` wrapper;
- local `getBulbasaurGrowEmitterPosition(...)` wrapper;
- local `getSquirtleWorldPosition(...)` wrapper;
- local `getCharmanderWorldPosition(...)` wrapper;
- direct imports of low-level field-move position resolvers for game-loop
  wiring.

Kept in `gameLoop.js`:

- composition of session, yaw and blocker dependencies;
- public re-export of `resolveTimburrBuildBlockApproachPosition(...)`;
- field move runtime ordering and ability dispatch.

Tests updated:

- `tests/fieldMoveActorPositions.test.js`
- `tests/fieldMoveApproachPositions.test.js`

TDD sequence:

```sh
npm test -- --run tests/fieldMoveActorPositions.test.js tests/fieldMoveApproachPositions.test.js
```

The first run failed because the two runtime factories did not exist yet.
After adding them, the focused tests passed.

Passed:

```sh
npm test -- --run tests/fieldMoveActorPositions.test.js tests/fieldMoveApproachPositions.test.js
npm test -- --run tests/fieldMoveActorPositions.test.js tests/fieldMoveApproachPositions.test.js tests/waterGunRuntime.test.js tests/fireRuntime.test.js tests/leafageRuntime.test.js tests/buildBlockRuntime.test.js tests/companionPresentationFrame.test.js tests/worldSpacePresentationFrameState.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `309` test files passed, `1` failed
- `1890` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Solar Station Power Radius Runtime

Expanded `app/runtime/construction/solarStationPowerRadius.js` with
`createSolarStationPowerRadiusRuntime(...)`.

Classification: `construction`, specifically Solar Station power-radius source
wiring.

Study path:

1. The pure power-radius calculations remain in
   `solarStationPowerRadius.js`.
2. The new runtime owns the repeated binding of `session`, `storyState`,
   radius multiplier, preview footprint, grid footprint, marked-tile limit and
   placement sizing callbacks.
3. `gameLoop.js` keeps composition and still passes callbacks to construction
   placement and presentation boundaries.
4. `buildSolarStationFieldMarkedGroundCells(...)` stayed in `gameLoop.js` for
   now because it belongs to `placementGeometry`, not power-radius behavior.

Removed from `gameLoop.js`:

- local `buildSolarStationPowerRadiusGroundCells(...)` wrapper;
- local `getSolarStationPreviewPowerRadius(...)` wrapper;
- local `buildSolarStationPreviewPowerRadiusGroundCells(...)` wrapper;
- local `buildPlacedSolarStationPowerRadiusGroundCells(...)` wrapper;
- local `getSolarStationPowerPosition(...)` wrapper;
- local `getSolarStationPowerRadius(...)` wrapper;
- local `isInsideSolarStationPowerRadius(...)` wrapper;
- direct imports of low-level Solar Station power-radius functions.

Kept in `gameLoop.js`:

- runtime composition;
- `buildSolarStationFieldMarkedGroundCells(...)`;
- small adapters for the current `groundCellHighlightFrameState` callback
  signature.

Tests updated:

- `tests/solarStationPowerRadius.test.js`

TDD sequence:

```sh
npm test -- --run tests/solarStationPowerRadius.test.js
```

The first run failed because `createSolarStationPowerRadiusRuntime(...)` did
not exist yet. After adding the runtime factory, the focused test passed.

Passed:

```sh
npm test -- --run tests/solarStationPowerRadius.test.js
npm test -- --run tests/solarStationPowerRadius.test.js tests/constructionPlacementFrameRuntime.test.js tests/groundCellHighlightFrameState.test.js tests/placementGeometry.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `309` test files passed, `1` failed
- `1891` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Workbench Rotation Runtime Domain Move

Moved the pre-existing Workbench rotation runtime from
`app/runtime/workbenchRotationRuntime.js` to
`app/runtime/construction/workbenchRotationRuntime.js`.

Classification: `construction`, focused on domain navigation and reducing root
runtime sprawl.

Study path:

1. The runtime already owned Workbench construction rotation state and behavior:
   selection, pending yaw, pending size, confirm/cancel, ground-cell highlight
   and Solar Station rotation visual sync.
2. Keeping it directly under `app/runtime/` made it harder to see that it is a
   construction subsystem, while the related target resolver already lived in
   `app/runtime/construction/workbenchRotationTargets.js`.
3. This cut only moved the module and adjusted import paths; no runtime behavior
   changed.

Changed:

- `app/runtime/workbenchRotationRuntime.js` moved to
  `app/runtime/construction/workbenchRotationRuntime.js`;
- `gameLoop.js` imports `createWorkbenchRotationRuntime` from the construction
  boundary;
- `tests/workbenchRotationRuntime.test.js` imports the runtime from the new
  boundary path.

Kept in `gameLoop.js`:

- Workbench rotation composition and frame ordering;
- wrapper callbacks used by placement and presentation code;
- audio/HUD orchestration around selection, cancellation, confirmation and
  preview rotation.

Tests updated:

- `tests/workbenchRotationRuntime.test.js`

Passed:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js tests/workbenchRotationTargets.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1857` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Workbench Rotation Feedback Runtime Extraction

Expanded `createWorkbenchRotationRuntime(...)` in
`app/runtime/construction/workbenchRotationRuntime.js`.

Classification: `construction`, focused on Workbench rotation feedback actions.

Study path:

1. `gameLoop.js` still owned the action wrappers for Workbench construction
   rotation: select, clear, confirm and nearby rotate.
2. Those wrappers mixed runtime state changes with fixed HUD/audio feedback
   strings.
3. The runtime now owns that feedback policy through
   `selectWithFeedback(...)`, `clearWithFeedback(...)`,
   `confirmWithFeedback(...)` and `rotateNearbyWithFeedback(...)`.
4. `gameLoop.js` keeps only composition callbacks: current prompt text,
   selected target lookup, Solar Station yaw sync, sound events and HUD notice
   dispatch.

Removed from `gameLoop.js`:

- direct selected-construction notice assembly;
- direct rotation-canceled notice dispatch;
- direct rotation-confirmed notice dispatch;
- direct nearby Workbench rotation step parsing and feedback dispatch.

Kept in `gameLoop.js`:

- thin wrappers used by existing frame/control flow;
- selection target resolution;
- audio/HUD callback wiring;
- Solar Station-specific yaw sync callback.

Tests updated:

- `tests/workbenchRotationRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js
```

The first run failed because the feedback action methods did not exist yet.
After adding them, the focused test passed.

Passed:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js
npm test -- --run tests/workbenchRotationRuntime.test.js tests/workbenchRotationTargets.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1859` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Placement Result Extraction

Added `app/runtime/construction/freeBlockPlacementResult.js`.

Classification: `construction`, focused on Free Block placement result
application.

Study path:

1. `gameLoop.js` still owned the post-placement result policy for Free Block
   builds.
2. That block mixed tile feedback, first-placement story flag, foundation wall
   quest callback, foundation completion effects, snapshot sync, audio and HUD
   notices.
3. `applyFreeBlockPlacementResult(...)` now owns that result policy after the
   placement controller has already produced a result.
4. `gameLoop.js` keeps composition callbacks for feedback runtime, story flags,
   quest hook, snapshot sync, audio and HUD.

Removed from `gameLoop.js`:

- direct build/invalid feedback ability selection for Free Block placement;
- direct Free Block placement notice formatting;
- direct placed-vs-invalid audio/HUD branching;
- direct foundation-wall result sequencing inside the handler body.

Kept in `gameLoop.js`:

- controller lookup and placement attempt timing;
- player displacement after successful placement;
- free block target resolution and preview state;
- callback wiring to existing HUD, audio, quest and snapshot systems.

Tests added:

- `tests/freeBlockPlacementResult.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockPlacementResult.test.js
```

The first run failed because `freeBlockPlacementResult.js` did not exist yet.
After adding the module, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockPlacementResult.test.js
npm test -- --run tests/freeBlockPlacementResult.test.js tests/placementGeometry.test.js tests/placementPreviewPrompts.test.js tests/constructionPlacementFrameRuntime.test.js tests/foundationBuildZone.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `307` test files passed, `1` failed
- `1861` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Removal Runtime Expansion

Expanded `app/runtime/construction/freeBlockRemoval.js`.

Classification: `construction`, focused on Free Block removal result handling.

Study path:

1. `gameLoop.js` still owned the full nearby Free Block removal flow after
   detecting a target.
2. That block mixed target removal, drop spawning, snapshot sync, tile feedback,
   impact audio and HUD notice.
3. `tryRemoveNearbyFreeBlock(...)` now owns the removal sequence in the Free
   Block removal module.
4. `gameLoop.js` keeps only composition callbacks for controller lookup,
   persisted drops, feedback-cell creation, snapshot sync, audio and HUD.

Removed from `gameLoop.js`:

- direct nearby Free Block target lookup;
- direct call to `removeBlockAtTarget(...)`;
- direct Wood drop spawning;
- direct removal feedback/audio/notice branching.

Kept in `gameLoop.js`:

- player/action timing for when removal is attempted;
- session-backed Wood drop storage callback;
- feedback cell builder callback;
- wiring to existing snapshot, feedback, audio and HUD systems.

Tests updated:

- `tests/freeBlockRemoval.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockRemoval.test.js
```

The first run failed because `tryRemoveNearbyFreeBlock(...)` was not exported
yet. After adding it, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockRemoval.test.js
npm test -- --run tests/freeBlockRemoval.test.js tests/freeBlockPlacementResult.test.js tests/freeBlockBuildSystem.test.js tests/constructionPlacementFrameRuntime.test.js tests/placementGeometry.test.js tests/foundationBuildZone.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `307` test files passed, `1` failed
- `1863` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Build Session Runtime Extraction

Added `app/runtime/construction/freeBlockBuildSessionRuntime.js`.

Classification: `construction`, focused on Free Block build session/controller
lifecycle.

Study path:

1. `gameLoop.js` still owned Free Block grid-config normalization,
   controller creation, build-state creation, snapshot restore and snapshot
   sync.
2. That made the loop aware of low-level `createFreeBlockBuildState(...)` and
   `createFreeBlockBuildController(...)` details.
3. `createFreeBlockBuildSessionRuntime(...)` now owns that lifecycle.
4. `gameLoop.js` keeps wrapper functions so existing construction, foundation
   and preview flow can continue calling the same local names.

Removed from `gameLoop.js`:

- direct Free Block grid-config normalization;
- direct Free Block build state construction;
- direct Free Block placement controller construction/reuse;
- direct restore of `freeBlockBuildSnapshot`;
- direct snapshot serialization assignment.

Kept in `gameLoop.js`:

- `FREE_BLOCK_BUILD_GRID_CONFIG` tuning constant;
- composition-time runtime creation;
- local wrappers used by existing construction flow;
- all placement, preview, foundation zone and field move timing.

Tests added:

- `tests/freeBlockBuildSessionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js
```

The first run failed because `freeBlockBuildSessionRuntime.js` did not exist
yet. After adding it, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js tests/freeBlockBuildSystem.test.js tests/freeBlockRemoval.test.js tests/freeBlockPlacementResult.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1866` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Placement Attempt Extraction

Expanded `app/runtime/construction/freeBlockPlacementResult.js`.

Classification: `construction`, focused on Free Block placement attempt/result
flow.

Study path:

1. `gameLoop.js` still had two near-duplicate Free Block placement attempts:
   direct build input and Timburr Build Block impact.
2. Both branches handled controller placement, unavailable foundation results,
   player displacement after placement and result application.
3. `tryPlaceFreeBlockFromBuildInput(...)` and
   `applyTimburrBuildBlockImpact(...)` now own those two attempt paths.
4. `gameLoop.js` keeps only composition callbacks for controller lookup,
   active build zone, stacking permission, player position, inventory and
   result side effects.

Removed from `gameLoop.js`:

- direct unavailable-foundation placement result creation;
- direct direct-input Free Block placement branch;
- direct Timburr impact Free Block placement branch;
- duplicated placed-block displacement/result application sequence.

Kept in `gameLoop.js`:

- when direct build input and Timburr impact are invoked;
- `FREE_BLOCK_TYPES.WALL` as current build block type;
- access to player/session/control context through callbacks;
- preview and target resolution logic.

Tests updated:

- `tests/freeBlockPlacementResult.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockPlacementResult.test.js
```

The first run failed because the new attempt functions were not exported yet.
After adding them, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockPlacementResult.test.js
npm test -- --run tests/freeBlockPlacementResult.test.js tests/freeBlockBuildSessionRuntime.test.js tests/freeBlockBuildSystem.test.js tests/freeBlockRemoval.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1869` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Preview Flow Extraction

Expanded `app/runtime/construction/freeBlockPreview.js`.

Classification: `construction`, focused on Free Block preview target
resolution, preview validity debug and preview instance sync.

Study path:

1. `gameLoop.js` still assembled Free Block preview target state directly:
   selected-block target, validation, collider blockers, debug payload and
   Timburr Build Block override.
2. The existing `freeBlockPreview.js` boundary already owned preview instance
   shape, so it was the right domain module to expand instead of creating a new
   loose helper file.
3. `resolveFreeBlockBuildTarget(...)`, `getFreeBlockPreviewTarget(...)` and
   `syncFreeBlockBuildPreview(...)` now own the isolated preview policy.
4. `gameLoop.js` keeps only composition callbacks for session, controls, grid,
   controller lookup, build-zone state and existing frame timing.

Removed from `gameLoop.js`:

- direct Timburr Build Block preview target override;
- direct Free Block selected-target validation/debug assembly;
- direct construction-collider blocker mapping for the Free Block preview;
- direct preview instance sync branch for active/inactive Free Block preview.

Kept in `gameLoop.js`:

- when the Free Block preview is updated in the frame;
- access to session/control state through callbacks;
- existing build-zone, inventory, target-cell and terrain-collider providers;
- frame order and all tuning values.

Tests updated:

- `tests/freeBlockPreview.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockPreview.test.js
```

The first run failed because the new preview flow functions were not exported
yet. After adding them, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockPreview.test.js
npm test -- --run tests/freeBlockPreview.test.js tests/freeBlockBuildSessionRuntime.test.js tests/freeBlockBuildSystem.test.js tests/constructionPlacementFrameRuntime.test.js tests/groundCellHighlightFrameState.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1872` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Build Zone Session Policy Extraction

Expanded `app/runtime/construction/freeBlockBuildSessionRuntime.js`.

Classification: `construction`, focused on Free Block foundation-zone session
state, progress counting and stacking permission.

Study path:

1. `gameLoop.js` still owned session policy for the active Free Block foundation
   zone: reading/saving the builder tutorial origin flag, resolving the active
   build zone, storing unavailable state and counting progress.
2. `createFreeBlockBuildSessionRuntime(...)` already owned the Free Block
   controller, grid config and serialized build snapshot, so it was the right
   owner for foundation progress and active-zone session writes.
3. The runtime now exposes explicit methods:
   `getBuildZoneProgress(...)`, `getFoundationBuildZoneProgressCount(...)`,
   `canStackFreeBlockPlacement(...)`, `syncActiveBuildZone(...)` and
   `isBuildZoneUnavailable()`.
4. `gameLoop.js` keeps only composition callbacks for blocker checks, available
   zone lookup, story flags and when the frame asks for the active zone.

Removed from `gameLoop.js`:

- direct builder tutorial foundation origin flag read/write;
- direct active Free Block build-zone resolution and session assignment;
- direct foundation progress count assembly from wall progress plus restored
  floor snapshot;
- direct stacking permission derivation from Free Block zone progress.

Kept in `gameLoop.js`:

- foundation build-zone blocker collection;
- foundation ground-cell rendering helpers;
- completion effects, feedback and construction cloud side effects;
- frame order and all tuning values.

Tests updated:

- `tests/freeBlockBuildSessionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js
```

The first run failed because the new runtime methods were not exported yet.
After adding them, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js tests/foundationBuildZone.test.js tests/freeBlockBuildSystem.test.js tests/freeBlockPreview.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1875` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Foundation Presentation Builder Extraction

Expanded `app/runtime/construction/freeBlockBuildSessionRuntime.js`.

Classification: `construction`, focused on Free Block foundation presentation
data derived from the build grid/session state.

Study path:

1. `gameLoop.js` still owned the local wiring from Free Block session/grid state
   into foundation ground-cell highlights, completion interior cells, build-zone
   center position and Free Block feedback cells.
2. Those objects are presentation data, but they are derived directly from the
   Free Block build grid/config/session, so expanding the existing Free Block
   session runtime avoided a new loose helper file.
3. The runtime now exposes:
   `getBuildZoneCenterPosition(...)`,
   `buildFoundationBuildZoneGroundCells(...)`,
   `buildFoundationCompletionInteriorGroundCells(...)` and
   `buildFeedbackGroundCell(...)`.
4. `gameLoop.js` keeps only visibility gating, effect timing and the call sites
   that preserve frame order.

Removed from `gameLoop.js`:

- direct conversion of foundation build-zone cells into renderable ground-cell
  highlight data;
- direct conversion of completion interior cells into feedback cells;
- direct Free Block build-zone center calculation from grid config;
- direct Free Block placement feedback cell construction.

Kept in `gameLoop.js`:

- foundation visibility gating based on active quest/system quest;
- completion effect trigger and cloud/feedback side effects;
- direct player displacement math after placing a block;
- frame order and all tuning values.

Tests updated:

- `tests/freeBlockBuildSessionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js
```

The first run failed because the new presentation-builder runtime methods were
not exported yet. After adding them, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js
npm test -- --run tests/freeBlockBuildSessionRuntime.test.js tests/placementGeometry.test.js tests/foundationBuildZone.test.js tests/freeBlockBuildSystem.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1877` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Free Block Placement Displacement Extraction

Expanded `app/runtime/construction/freeBlockPlacementResult.js`.

Classification: `construction`, focused on Free Block post-placement player
displacement.

Study path:

1. `gameLoop.js` still implemented the rule that moves the player away when a
   newly placed Free Block lands under the current player cell.
2. That rule is part of the Free Block placement result flow because it only
   runs after a successful placement and is already invoked from
   `tryPlaceFreeBlockFromBuildInput(...)` and `applyTimburrBuildBlockImpact(...)`.
3. `movePlayerAwayFromPlacedFreeBlock(...)` now owns the cell check, target
   position lookup, displacement resolution call, `setPosition` and model-sync
   callback.
4. `gameLoop.js` keeps only composition dependencies: player character, grid
   config, construction displacement resolver, blocker callback and player
   model sync.

Removed from `gameLoop.js`:

- direct check for whether the player is standing on the placed Free Block cell;
- direct Free Block target-position lookup for player displacement;
- direct displacement resolution call after Free Block placement;
- direct `playerCharacter.setPosition(...)` and `playerModelRuntime.sync(...)`
  sequence for this placement-specific case.

Kept in `gameLoop.js`:

- when displacement is invoked as part of placement effects;
- session/player model dependencies through explicit callbacks;
- grid creation from the current Free Block build config;
- frame order and all tuning values.

Tests updated:

- `tests/freeBlockPlacementResult.test.js`

TDD sequence:

```sh
npm test -- --run tests/freeBlockPlacementResult.test.js
```

The first run failed because `movePlayerAwayFromPlacedFreeBlock(...)` was not
exported yet. After adding it, the focused test passed.

Passed:

```sh
npm test -- --run tests/freeBlockPlacementResult.test.js
npm test -- --run tests/freeBlockPlacementResult.test.js tests/freeBlockBuildSessionRuntime.test.js tests/freeBlockBuildSystem.test.js tests/buildBlockRuntime.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1879` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Companion Follow Formation State Extraction

Expanded `app/runtime/companions/companionFollowMotion.js`.

Classification: `companions`, focused on follow-formation membership/index
resolution from companion state.

Study path:

1. `gameLoop.js` still owned the composition of follow formation state:
   flags, companion runtime objects, active field-move actions and blockers.
2. `companionFollowMotion.js` already owned formation order, membership rules,
   active-move priority and follow distance, so it was the right module to own
   the state-backed index resolver.
3. `resolveCompanionFollowFormationIndexFromState(...)` now wraps the existing
   membership/index functions without changing the underlying rules.
4. `gameLoop.js` keeps only the current state snapshot from session/runtimes.

Removed from `gameLoop.js`:

- local `isCompanionInFollowFormation(...)`;
- direct call chain from local membership callback into formation index;
- local ownership of the membership-to-index composition rule.

Kept in `gameLoop.js`:

- session/flags/action/blocker snapshot construction;
- fallback from missing formation index to `0`;
- all companion movement timing and follow-update order.

Tests updated:

- `tests/companionFollowMotion.test.js`

TDD sequence:

```sh
npm test -- --run tests/companionFollowMotion.test.js
```

The first run failed because `resolveCompanionFollowFormationIndexFromState(...)`
was not exported yet. After adding it, the focused test passed.

Passed:

```sh
npm test -- --run tests/companionFollowMotion.test.js
npm test -- --run tests/companionFollowMotion.test.js tests/companionFollowMovementRuntime.test.js tests/companionGroundPatrolFrameRuntime.test.js tests/companionFollowDirectionRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1880` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Solar Station Workbench Rotation Visual Extraction

Expanded the existing `createWorkbenchRotationRuntime(...)` boundary in
`app/runtime/workbenchRotationRuntime.js`.

Classification: `construction`, focused on Workbench rotation visual/yaw sync.

Study path:

1. `gameLoop.js` still owned Solar Station-specific Workbench rotation sync:
   confirmed yaw application, preview yaw display, selection tint, and tint
   reset when no rotation selection/spawn effect is active.
2. `syncSolarStationPlacementYaw(...)` and
   `syncSolarStationWorkbenchRotationVisual(...)` now live inside the
   Workbench rotation runtime.
3. `gameLoop.js` keeps only composition data: the Solar Station model instance,
   placement object, placement-preview-active flag, placed flag and frame time.

Removed from `gameLoop.js`:

- direct Solar Station base-yaw capture during Workbench rotation confirm;
- direct Solar Station visual yaw preview update;
- direct Workbench selection tint/reset policy for Solar Station rotation.

Kept in `gameLoop.js`:

- thin wrappers used by existing callbacks;
- target selection and prompt/audio orchestration;
- Workbench rotation runtime wiring.

Known structural follow-up:

- `app/runtime/workbenchRotationRuntime.js` is still a pre-existing root runtime
  file. It should move under `app/runtime/construction/` in a separate file-move
  only cut, because mixing a move with behavior extraction would make review
  noisier.

Tests updated:

- `tests/workbenchRotationRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js
```

The first run failed because the new runtime methods did not exist yet. After
adding them, the focused test passed.

Passed:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js
npm test -- --run tests/workbenchRotationRuntime.test.js tests/workbenchRotationTargets.test.js tests/constructionPlacementFrameRuntime.test.js tests/constructionHouseModelInstances.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1857` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Construction Placement Preview Rotation Extraction

Expanded the existing `constructionPlacementFrameRuntime` boundary in
`app/runtime/construction/constructionPlacementFrameRuntime.js`.

Classification: `construction`, focused on active placement-preview rotation.

Study path:

1. `gameLoop.js` still owned the rule that consumes a rotation direction,
   truncates it into steps, rotates every active construction placement preview,
   clears `readyForConfirm` and emits one feedback sound/notice.
2. `rotateActiveConstructionPlacementPreviews(...)` now owns that isolated
   mutation and feedback policy.
3. `gameLoop.js` keeps only composition data: the four session previews,
   `PLACEMENT_ROTATION_STEP`, `normalizePlacementYaw`, the UI sound event and
   HUD notice callback.

Removed from `gameLoop.js`:

- direct per-preview rotation mutation for Solar Station, Greenhouse, Thermal
  Cabin and Leaf Den Kit previews;
- direct `readyForConfirm = false` rule for active placement previews;
- direct rotation feedback gating after active preview rotation.

Kept in `gameLoop.js`:

- the `rotateActivePlacementPreview(...)` wrapper as composition glue;
- rotation tuning and feedback dependencies;
- fallback to nearby Workbench construction rotation in the existing frame
  runtime flow.

Tests updated:

- `tests/constructionPlacementFrameRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
```

The first run failed because
`rotateActiveConstructionPlacementPreviews(...)` did not exist yet. After
adding the helper, the focused test passed.

Passed:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
npm test -- --run tests/constructionPlacementFrameRuntime.test.js tests/placementGeometry.test.js tests/placementPreviewVisual.test.js tests/workbenchRotationRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1855` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Solar Station Placement Preview Frame Extraction

Expanded the existing `constructionPlacementFrameRuntime` boundary in
`app/runtime/construction/constructionPlacementFrameRuntime.js`.

Classification: `construction`, focused on the Solar Station placement-preview
frame rule.

Study path:

1. Solar Station preview still owned snap, placement rectangle construction,
   collision validity and preview model-instance visual mutation directly in
   `gameLoop.js`.
2. `updateSolarStationConstructionPlacementPreview(...)` now owns that sequence.
3. `gameLoop.js` keeps composition-only dependencies: session preview, model
   instance, follow distance, placement blocker callback and inactive-instance
   visibility policy.

Removed from `gameLoop.js`:

- local `getSnappedSolarStationPreviewPosition(...)`;
- direct Solar Station preview `snappedPosition`, `valid` and
  `readyForConfirm` mutation;
- direct Solar Station preview rectangle/collision calculation;
- direct `strawBedModelInstance` visual sync for placement preview frames;
- now-unused placement preview visual import.

Kept in `gameLoop.js`:

- the `updateSolarStationPlacementPreview(...)` wrapper as composition glue;
- tuning constants and story-state visibility policy;
- Solar Station blocker wrapper and power-radius helpers used elsewhere;
- frame order and placement control flow.

Tests updated:

- `tests/constructionPlacementFrameRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
```

The first run failed because
`updateSolarStationConstructionPlacementPreview(...)` did not exist yet. After
adding the helper, the focused test passed.

Passed:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
npm test -- --run tests/constructionPlacementFrameRuntime.test.js tests/placementGeometry.test.js tests/placementPreviewVisual.test.js tests/solarStationPlacementBlockers.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1853` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Leaf Den Kit Placement Preview Frame Extraction

Expanded the existing `constructionPlacementFrameRuntime` boundary in
`app/runtime/construction/constructionPlacementFrameRuntime.js`.

Classification: `construction`, focused on the powered House Kit / Leaf Den Kit
placement-preview frame rule.

Study path:

1. Leaf Den Kit preview still owned placement snap, collision footprint,
   building-kit validation, solar-station-radius gating, habitat `siteChoice`
   and preview model-instance visual mutation directly in `gameLoop.js`.
2. `updateLeafDenKitConstructionPlacementPreview(...)` now owns that sequence.
3. `gameLoop.js` keeps composition-only dependencies: session preview, model
   instance, footprints, blocker lookup, placement validation, power-radius
   checks, habitat site-choice evaluator and workbench position.

Removed from `gameLoop.js`:

- direct Leaf Den Kit preview validation state mutation;
- direct solar-station-radius invalid reason assignment;
- direct `siteChoice` construction for the Leaf Den Kit preview frame;
- direct `leafDen*` preview model-instance visual sync.

Kept in `gameLoop.js`:

- the `updateLeafDenKitPlacementPreview(...)` wrapper as composition glue;
- tuning constants and domain callbacks;
- Solar Station preview logic, because it still owns separate power-radius
  preview behavior;
- frame order and placement control flow.

Tests updated:

- `tests/constructionPlacementFrameRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
```

The first run failed because
`updateLeafDenKitConstructionPlacementPreview(...)` did not exist yet. After
adding the helper, the focused test passed.

Passed:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
npm test -- --run tests/constructionPlacementFrameRuntime.test.js tests/placementGeometry.test.js tests/placementPreviewVisual.test.js tests/placementPreviewPrompts.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1851` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Leaf Den Construction Presentation Runtime Extraction

Created the `construction/leaf-den-construction-presentation` boundary with
`app/runtime/construction/leafDenConstructionPresentationRuntime.js`.

Study path:

1. `leafDenConstructionState.js` still owns pure construction activity,
   progress and busy companion checks.
2. `constructionCloudEffects.js` still owns cloud instance motion and burst
   effect state.
3. `constructionBillboards.js` still owns billboard geometry.
4. The new runtime owns the session/story/texture/timing composition for the
   Leaf Den construction presentation and exposes the methods that `gameLoop`
   needs.

Removed from `gameLoop.js`:

- direct imports of Leaf Den construction state helpers;
- direct imports of construction cloud effect helpers;
- direct imports of construction billboard helpers;
- local progress/timing/cloud/billboard composition for Leaf Den construction.

Kept in `gameLoop.js`:

- wrapper names used by field move runtimes, companion movement and render
  snapshot preparation;
- frame-order call sites for construction cloud sync and billboard collection.

Tests added:

- `tests/leafDenConstructionPresentationRuntime.test.js`

Passed:

```sh
npm test -- --run tests/leafDenConstructionPresentationRuntime.test.js
npm test -- --run tests/leafDenConstructionPresentationRuntime.test.js tests/leafDenConstructionState.test.js tests/constructionCloudEffects.test.js tests/constructionBillboards.test.js tests/baseRenderSnapshotFrame.test.js tests/worldObjectBillboardFrame.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `303` test files passed, `1` failed
- `1828` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Construction Model Instance Sync Extraction

Expanded the existing `construction/model-instances` boundary in
`app/runtime/construction/constructionHouseModelInstances.js`.

Study path:

1. `constructionHouseModelInstances.js` now owns the model-state rules for
   Campfire Train House, Greenhouse, Leaf Den and player houses.
2. `gameLoop.js` still supplies session state and gameplay callbacks for spawn,
   rotation preview, Train House dance and rotation tint.
3. The render snapshot frame still receives the same callback names, so the
   frame order and render preparation contract are unchanged.

Removed from `gameLoop.js`:

- Campfire Train House model visibility/sync internals;
- Greenhouse model placement/spawn sync internals.

Kept in `gameLoop.js`:

- `syncCampfireTrainHouseModelInstance(...)` and
  `syncGreenhouseModelInstance(...)` as thin dependency-injection wrappers for
  `baseRenderSnapshotFrame`;
- construction model sync order inside render snapshot preparation.

Tests adjusted:

- `tests/constructionHouseModelInstances.test.js`

Passed:

```sh
npm test -- --run tests/constructionHouseModelInstances.test.js
npm test -- --run tests/constructionHouseModelInstances.test.js tests/baseRenderSnapshotFrame.test.js tests/renderFrameController.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `302` test files passed, `1` failed
- `1824` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### World Cell Planner Interaction Runtime Extraction

Created the `world/world-cell-planner` boundary with
`app/runtime/world/worldCellPlannerInteractionRuntime.js`.

Study path:

1. The existing picking helpers still own pure candidate selection and viewport
   projection.
2. The new interaction runtime owns planner activation checks, pointer event
   filtering, click mailbox consumption, grid-cell resolution, selected-cell
   session state, HUD notices and the highlighted selected-cell frame object.
3. `gameLoop.js` now wires the runtime, registers the pointer listener and
   calls `processWorldCellPlannerClick()` at the same frame point as before.

Removed from `gameLoop.js`:

- `isWorldCellPlannerActive(...)`
- `getWorldCellPlannerGridCell(...)`
- `resolveWorldCellPlannerPick(...)`
- `handleWorldCellPlannerPointerDown(...)`
- `processWorldCellPlannerClick(...)`
- `getWorldCellPlannerSelectedGroundCell(...)`
- direct imports of `worldCellPlannerClickRuntime.js` and
  `worldCellPlannerPicking.js`

Kept in `gameLoop.js`:

- runtime creation with explicit dependencies;
- `mount.addEventListener("pointerdown", ...)` registration;
- the same frame-order call site for planner click processing;
- the same selected-ground-cell callback passed into highlight frame state.

Tests added:

- `tests/worldCellPlannerInteractionRuntime.test.js`

Passed:

```sh
npm test -- --run tests/worldCellPlannerInteractionRuntime.test.js
npm test -- --run tests/worldCellPlannerInteractionRuntime.test.js tests/worldCellPlannerPicking.test.js tests/worldCellPlannerClickRuntime.test.js tests/groundCellHighlightFrameState.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `302` test files passed, `1` failed
- `1820` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Repair Box Investigation Runtime Integration

Extended `app/runtime/companions/companionRepairBoxModelRuntime.js` again
instead of creating a new file.

Boundary:

- Domain: `companions/`.
- Responsibility: repair-box rustle timing and Chopper investigation target
  resolution for the Bulbasaur repair-box intro.
- Classification: companion/presentation runtime.

Extracted from `gameLoop.js`:

1. Rustling repair-box active check based on story flags, alive grass patch and
   active repair module.
2. Chopper investigation target calculation around the Bulbasaur repair box.
3. Repair-box rustle elapsed/duration update and deactivation.

Kept in `gameLoop.js`:

1. The existing frame order in `companionFrameRuntime`.
2. A wiring callback that passes the current Bulbasaur encounter, story flags
   and grass patches into `companionRepairBoxModelRuntime.getInvestigationTarget(...)`.
3. A wiring callback that passes `deltaTime` into
   `companionRepairBoxModelRuntime.updateRepairBoxRustle(...)`.
4. `CHOPPER_BULBASAUR_REPAIR_BOX_INVESTIGATION_OFFSET`, passed as explicit
   config to keep tuning unchanged.

Why this is safe:

- No new module was created; the existing repair-box runtime now owns more of
  the same repair-box rule set.
- The frame call order is unchanged.
- The target object shape stays `{ position, lookAtPosition }`.
- Rustle timing still clamps to duration and deactivates at the same threshold.

Validation:

```sh
npm test -- --run tests/companionRepairBoxModelRuntime.test.js
npm test -- --run tests/companionRepairBoxModelRuntime.test.js tests/companionFrameRuntime.test.js tests/worldSpeechFrameState.test.js
npm run build
npm test
```

Results:

- Focused companion repair-box model runtime test: `8` passed.
- Neighbor companion/world-speech suite: `13` passed.
- Production build passed.
- Full suite completed with the existing Leafage Native Tree baseline:
  `1765` passed and `3` failed in `tests/gameplayInteractions.test.js`.

Manual gameplay validation remains pending for this cut.

### Bee Field Runtime Extraction

Created `app/runtime/companions/beeFieldRuntime.js`.

Boundary:

- Domain: `companions/`.
- Responsibility: Bee Field repair-box visual state and Bee Field bee patrol
  instances.
- Classification: companion/presentation runtime.

Extracted from `gameLoop.js`:

1. Bee Field restored/opened checks.
2. Bee Field repair-box sync, including opening progress, alpha, tint and
   interactable position.
3. Bee Field center resolution from repair-box offsets or flower patch average.
4. Bee patrol instance creation.
5. Bee patrol movement update and cleanup when the Bee Box is not opened.
6. Bee Field numeric tuning defaults that only belong to this runtime.

Kept in `gameLoop.js`:

1. `startGameLoop()` wires `createBeeFieldRuntime(...)` with `session`,
   `controls`, the companion repair-box model runtime and the interactable sync
   callback.
2. The shared repair-box active tint constants remain in `gameLoop.js` because
   they are also used by the generic active repair-box highlight path.
3. `companionFrameRuntime` still calls Bee Field sync at the same frame point,
   now through `beeFieldRuntime.syncRepairBox()` and
   `beeFieldRuntime.syncBees(deltaTime)`.

Why this is safe:

- Frame order is unchanged.
- The Bee Field tuning values were moved as runtime defaults with identical
  values.
- No field move, placement, input, camera or dialogue logic changed.
- The existing session shapes for `beeFieldRepairBox`, `beeInstances` and
  `beePatrolState` are preserved.

Validation:

```sh
npm test -- --run tests/beeFieldRuntime.test.js
npm test -- --run tests/beeFieldRuntime.test.js tests/companionFrameRuntime.test.js tests/companionRepairBoxModelRuntime.test.js
npm run build
npm test
```

Results:

- Focused Bee Field runtime test: `4` passed.
- Neighbor companion/repair-box suite: `10` passed.
- Production build passed.
- Full suite completed with the existing Leafage Native Tree baseline:
  `1758` passed and `3` failed in `tests/gameplayInteractions.test.js`.

Manual gameplay validation remains pending for this cut.

### Squirtle Reassembly Runtime Extraction

Created `app/runtime/companions/squirtleReassemblyRuntime.js`.

Boundary:

- Domain: `companions/`.
- Responsibility: Squirtle reassembly progression and temporary primitive scene
  objects while the bot is being assembled.
- Classification: companion motion/presentation support.

Extracted from `gameLoop.js`:

1. Squirtle reassembly progress update.
2. Reassembly completion side effects: deactivate reassembly, mark Squirtle
   visible/assembled, sync the model and call the completion callback.
3. Primitive model wrapping for temporary scattered assembly pieces.
4. Per-part assembly pose calculation.
5. Scene-object appending for Squirtle assembly pieces.

Kept in `gameLoop.js`:

1. `startGameLoop()` wires `createSquirtleReassemblyRuntime(...)` with existing
   math helpers, part scale and `syncSquirtleModelInstance`.
2. `companionFrameRuntime` still invokes Squirtle reassembly at the same frame
   point, now through `squirtleReassemblyRuntime.update(deltaTime)`.
3. `baseRenderSnapshotFrameRuntime` still receives a
   `getSquirtleAssemblySceneObjects` callback, now delegated to the runtime.

Why this is safe:

- Frame order is unchanged.
- The runtime uses the same constants and math helpers as the old local
  functions.
- No field move, input, placement, camera or narrative rule changed.
- The scene-object shape returned to render prep is unchanged.

Validation:

```sh
npm test -- --run tests/squirtleReassemblyRuntime.test.js
npm test -- --run tests/squirtleReassemblyRuntime.test.js tests/companionFrameRuntime.test.js tests/baseRenderSnapshotFrame.test.js
npm run build
npm test
```

Results:

- Focused Squirtle reassembly runtime test: `4` passed.
- Neighbor companion/render snapshot suite: `8` passed.
- Production build passed.
- Full suite completed with the existing Leafage Native Tree baseline:
  `1754` passed and `3` failed in `tests/gameplayInteractions.test.js`.

Manual gameplay validation remains pending for this cut.

### Companion Repair Box Model Runtime Extraction

Created `app/runtime/companions/companionRepairBoxModelRuntime.js`.

Boundary:

- Domain: `companions/`.
- Responsibility: repair-box model transform and reveal/rustle presentation for
  companion encounters.
- Classification: companion motion/presentation support.

Extracted from `gameLoop.js`:

1. Reveal opening progress calculation for companion repair boxes.
2. Repair-box instance transform sync: base offset, floating offset, yaw,
   pitch, roll, scale, opening pose and active flag.
3. Reveal-box cinematic mutations: shake, spin, tint, alpha and scale pulse.
4. Repair-box rustle mutations.
5. Dismantled companion encounter repair-module sync.

Kept in `gameLoop.js`:

1. `getEncounterRepairBoxPosition(...)`, because it is already passed to
   reveal flash/opening runtimes during `startGameLoop()` wiring before the
   repair-box motion runtime is created. Moving it now would require a wider
   constructor-order change for little ownership gain.
2. High-level calls from Squirtle, Bulbasaur, Charmander, Timburr and Bee Field
   sync paths into `companionRepairBoxModelRuntime`.

Why this is safe:

- The runtime receives the existing motion runtime, clamp/easing functions,
  reveal visibility predicate and numeric config explicitly.
- All tuning values are the same constants that were already used in
  `gameLoop.js`.
- The frame order is unchanged; only the implementation owner moved.
- `gameLoop.js` now wires and calls the companion repair-box runtime instead of
  implementing the internal model rules.

Validation:

```sh
npm test -- --run tests/companionRepairBoxModelRuntime.test.js
npm test -- --run tests/companionRepairBoxModelRuntime.test.js tests/repairBoxMotionRuntime.test.js tests/repairBoxRevealOpeningRuntime.test.js tests/repairBoxRevealFlashRuntime.test.js
npm run build
npm test
```

Results:

- Focused companion repair-box runtime test: `4` passed.
- Neighbor repair-box/motion suite: `12` passed.
- Production build passed.
- Full suite completed with the existing Leafage Native Tree baseline:
  `1750` passed and `3` failed in `tests/gameplayInteractions.test.js`.

Manual gameplay validation remains pending for this cut.

### Gameplay Prompt Target Frame State Boundary

Created `app/runtime/presentation/gameplayPromptTargetFrameState.js`.

Module boundary:

- Domain: `presentation/render helpers`.
- Responsibility: resolve the frame's prompt target state before HUD/world
  prompt copy is assembled.
- Removed from `gameLoop.js`: the private `resolveFramePromptTargetState(...)`
  implementation, including pending placement prompt resolution, workbench
  rotation prompt target selection, nearby workbench prompt gating and
  destroyable-object prompt lookup/debug payload.

Study path:

1. `frame(now)` still computes placement preview state, input modality and
   nearby gameplay targets in the same order as before.
2. `frame(now)` now calls `resolveGameplayPromptTargetFrameState(...)` with
   explicit dependencies: `session`, `storyState`, `inventory`, `gameplay`,
   workbench target callbacks and `debugInteractionFlow`.
3. The presentation resolver delegates to the existing construction prompt
   helpers and input prompt resolver. No placement, field-move or workbench
   gameplay rules were changed.
4. The resolver returns the same shape previously produced inside
   `gameLoop.js`: `framePlacementPrompts`, `pendingPlacementIntent`,
   `pendingPlacementPrompt`, selected/nearby workbench targets,
   `workbenchRotationPrompt` and `destroyableObjectPrompt`.
5. `resolveFrameHudPromptCopy(...)`, world prompt frame state and HUD snapshot
   updates consume the same fields as before.

Tests added:

- `tests/gameplayPromptTargetFrameState.test.js`

The tests cover:

- pending placement prompt and selected workbench prompt resolution;
- placement preview blockers suppressing lower-priority prompt targets;
- movement/flow gating for nearby workbench rotation prompts;
- destroyable-object prompt lookup and debug payload shape.

Risks reduced:

- `gameLoop.js` no longer imports or directly combines construction prompt
  state, pending placement intent, generic input prompt actions and
  destroyable-object prompt lookup for HUD prompt target assembly.
- Prompt target assembly is now testable without executing the full frame.

Risks remaining:

- `frame(now)` still performs substantial presentation orchestration around
  ground guidance, HUD prompt copy, world-space UI and render snapshot prep.
- Workbench rotation behavior is still runtime-owned elsewhere, but prompt
  routing still crosses presentation/construction boundaries by explicit
  callbacks.

Validation for this cut:

```sh
npm test -- --run tests/gameplayPromptTargetFrameState.test.js
npm test -- --run tests/gameplayPromptTargetFrameState.test.js tests/placementPreviewPrompts.test.js tests/pendingPlacementIntent.test.js tests/worldPromptCopy.test.js tests/hudPromptCopy.test.js tests/inputPromptResolver.test.js
git diff --check
npm run build
npm test
```

The focused suite passed with `31` tests. `npm run build` passed with the
existing large chunk warning. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1729` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### Gameplay Ground Guidance Frame State Wrapper

Expanded `app/runtime/presentation/groundCellHighlightFrameState.js` with
`resolveGameplayGroundGuidanceFrameState(...)`.

Module boundary:

- Domain: `presentation/render helpers`.
- Responsibility: resolve whether ground guidance can be shown for the frame
  and then build the marked ground-cell guidance state.
- Removed from `frame(now)`: direct calculation of
  `canShowGroundGuidance`, direct calculation of
  `canShowPassiveGroundGuidance` and direct wiring into
  `resolveMarkedGroundCellGuidanceFrameState(...)`.

Study path:

1. `frame(now)` still resolves active quest/task/system quest before ground
   guidance, preserving the existing order.
2. `resolveGameplayGroundGuidanceFrameState(...)` applies the existing
   `resolveGroundGuidanceVisibility(...)` policy twice: active guidance and
   passive dialogue-closed guidance.
3. The wrapper delegates to `resolveMarkedGroundCellGuidanceFrameState(...)`
   with the same callbacks and frame inputs previously passed by `gameLoop.js`.
4. `frame(now)` receives the same outputs:
   `pendingWaterGunGroundCells`, `activeFireGroundCell`,
   `markedGroundCellPulsePhase` and `markedActionGroundCells`.

Tests expanded:

- `tests/groundCellHighlightFrameState.test.js`

The new test covers:

- active/passive guidance visibility through the wrapper;
- forwarding pending Water Gun marked cells when guidance is visible;
- suppressing marked-cell callbacks while opening/HUD state blocks guidance.

Risks reduced:

- Ground-guidance visibility is now tested with the marked-cell assembly instead
  of being embedded directly in `frame(now)`.
- `gameLoop.js` no longer owns the first part of ground guidance presentation
  rules.

Risks remaining:

- `frame(now)` still directly computes direct highlight visibility with
  `resolveGroundGuidanceVisibility(...)` before calling
  `resolveGroundCellHighlightFrameState(...)`.
- Placement preview pruning still happens inline before prompt/highlight
  presentation state.

Validation for this cut:

```sh
npm test -- --run tests/groundCellHighlightFrameState.test.js
npm test -- --run tests/groundCellHighlightFrameState.test.js tests/groundCellHighlightFrame.test.js tests/gameLoopFramePolicies.test.js tests/gameplayTargetFrameState.test.js tests/gameplayPromptTargetFrameState.test.js
git diff --check
npm run build
npm test
npm test -- --run tests/actTwoTutorial.integration.test.js
```

The focused suite passed with `23` tests. `npm run build` passed with the
existing large chunk warning. `npm test` completed with the existing Leafage
Native Tree baseline and one transient timeout:

- `1730` passed
- `3` existing Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`
- `1` timeout in `tests/actTwoTutorial.integration.test.js`

The timed-out tutorial test passed when rerun in isolation, so it is treated as
execution-load noise for this cut rather than a behavior change.

No manual browser validation was run in this cut.

### Gameplay Ground Cell Highlight Frame State Wrapper

Expanded `app/runtime/presentation/groundCellHighlightFrameState.js` with
`resolveGameplayGroundCellHighlightFrameState(...)`.

Module boundary:

- Domain: `presentation/render helpers`.
- Responsibility: resolve direct ground-cell highlight visibility and then
  delegate highlight frame-state assembly.
- Removed from `frame(now)`: direct use of
  `resolveGroundGuidanceVisibility(...)` for ground-cell highlight visibility
  and direct wiring into `resolveGroundCellHighlightFrameState(...)`.

Study path:

1. `frame(now)` still computes gameplay targets before prompt/highlight
   presentation.
2. `resolveGameplayGroundCellHighlightFrameState(...)` applies the existing
   `resolveGroundGuidanceVisibility(...)` policy with
   `requireDialogueClosed: true`, matching the old inline logic.
3. The wrapper keeps the existing `Boolean(highlightedGroundCell)` gate before
   field-tool target pulse calculation.
4. The returned object preserves the same highlight fields consumed by
   `updateGroundCellHighlightFrame(...)`.

Tests expanded:

- `tests/groundCellHighlightFrameState.test.js`

The new test covers:

- direct highlight visibility while gameplay is available;
- suppression while opening movement lock is active;
- avoiding target-pulse callback execution when highlight visibility is blocked.

Risks reduced:

- `gameLoop.js` no longer imports or applies ground guidance visibility policy
  directly.
- Ground-cell highlight visibility is now covered next to the highlight frame
  state it controls.

Risks remaining:

- Placement preview pruning still happens inline before prompt/highlight
  presentation state.
- `frame(now)` still passes a wide set of placement/highlight dependencies into
  presentation, which is acceptable until construction placement preview state
  gets its own cleaner boundary.

Validation for this cut:

```sh
npm test -- --run tests/groundCellHighlightFrameState.test.js
npm test -- --run tests/groundCellHighlightFrameState.test.js tests/groundCellHighlightFrame.test.js tests/gameLoopFramePolicies.test.js tests/gameplayTargetFrameState.test.js tests/gameplayPromptTargetFrameState.test.js
git diff --check
npm run build
npm test
```

The focused suite passed with `24` tests. `npm run build` passed with the
existing large chunk warning and plugin timing report. `npm test` completed with
the existing Leafage Native Tree baseline:

- `1732` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### Active Construction Placement Preview State

Expanded `app/runtime/construction/constructionPlacementFrameRuntime.js` with
`resolveActiveConstructionPlacementPreviews(...)`.

Module boundary:

- Domain: `construction`.
- Responsibility: keep only placement preview frame objects whose backing
  session preview is still active.
- Removed from `frame(now)`: four direct checks against
  `session.*PlacementPreview?.active` used to null stale construction preview
  frame state.

Study path:

1. `constructionPlacementFrameRuntime.updatePlacementControlsAndPreviews(...)`
   still creates the raw preview frame objects in the same place.
2. Ground guidance still receives the raw preview values before this pruning,
   matching the previous frame order.
3. `resolveActiveConstructionPlacementPreviews(...)` then applies the same
   session-backed active gates before prompt/highlight/world prompt presentation.
4. `frame(now)` receives the same four names afterward:
   `solarStationPlacementPreview`, `greenhousePlacementPreview`,
   `campfirePlacementPreview` and `leafDenKitPlacementPreview`.

Tests expanded:

- `tests/constructionPlacementFrameRuntime.test.js`

The new test covers mixed active/inactive session preview state and verifies
that only inactive previews are nulled.

Risks reduced:

- Construction preview active-state filtering is now owned and tested in the
  construction runtime boundary.
- `gameLoop.js` no longer knows the specific active flag names for each
  construction preview at this point in the frame.

Risks remaining:

- `frame(now)` still carries placement preview variables across presentation
  systems because prompt, highlight and world prompt state all consume them.
- A later construction cut should consider returning a named placement preview
  frame state object instead of four loose variables.

Validation for this cut:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
npm test -- --run tests/constructionPlacementFrameRuntime.test.js tests/gameplayPromptTargetFrameState.test.js tests/groundCellHighlightFrameState.test.js tests/worldPromptFrameState.test.js tests/groundCellHighlightFrame.test.js
git diff --check
npm run build
npm test
```

The focused suite passed with `22` tests. `npm run build` passed with the
existing large chunk warning. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1733` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### World Space Presentation Frame State

Created `app/runtime/presentation/worldSpacePresentationFrameState.js`.

Module boundary:

- Domain: `presentation/render helpers`.
- Responsibility: compose the world-space UI context, world speech frame state
  and world prompt frame state for the current frame.
- Removed from `frame(now)`: the local `prepareWorldSpaceUiFrameContext(...)`
  helper, direct calls to `resolveWorldSpeechFrameState(...)` and direct calls
  to `resolveWorldPromptFrameState(...)`.

Study path:

1. `frame(now)` still calls the world-space presentation resolver at the same
   point after HUD/base render snapshot prep and before snapshot writers.
2. `resolveWorldSpacePresentationFrameState(...)` first delegates to
   `prepareWorldSpaceUiFrameContext(...)`, preserving Workbench arrow cue side
   effects and Tangrowth position lookup.
3. It then delegates to `resolveWorldSpeechFrameState(...)` with the same
   speech inputs previously passed by `gameLoop.js`.
4. It finally delegates to `resolveWorldPromptFrameState(...)`, including the
   same dry-grass Hydro mission predicate callback and runtime prompt
   visibility callbacks.
5. `frame(now)` keeps snapshot writes in the same order:
   world speech snapshot, world prompt snapshot, ground-cell highlight snapshot
   and status popups.

Tests added:

- `tests/worldSpacePresentationFrameState.test.js`

The test covers:

- world-space UI visibility and Tangrowth position forwarding;
- Workbench arrow cue callback forwarding;
- Tangrowth speech state from the composed speech resolver;
- world prompt state including free-block cost marker and chopper attention cue;
- dry-grass Hydro mission predicate forwarding.

Risks reduced:

- `gameLoop.js` no longer owns the orchestration chain for world-space
  presentation state.
- The presentation module now owns the dependency order between UI context,
  speech state and world prompt state.

Risks remaining:

- The snapshot writer chain was intentionally left for the next presentation
  cut, so this state resolver stayed focused on deriving frame state.
- The new resolver intentionally accepts many explicit dependencies because it
  composes existing systems without becoming a service locator.

Validation for this cut:

```sh
npm test -- --run tests/worldSpacePresentationFrameState.test.js
npm test -- --run tests/worldSpacePresentationFrameState.test.js tests/worldSpaceUiFrameContext.test.js tests/worldSpeechFrameState.test.js tests/worldPromptFrameState.test.js tests/gameLoopFrameRuntime.test.js
npm run build
git diff --check
npm test
```

The focused suite passed with `13` tests. `npm run build` passed with the
existing large chunk warning. `git diff --check` passed. `npm test` completed
with the existing Leafage Native Tree baseline:

- `1734` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### World Space Presentation Snapshot Frame

Created `app/runtime/presentation/worldSpacePresentationSnapshotFrame.js`.

Module boundary:

- Domain: `presentation/render helpers`.
- Responsibility: write world-space speech, world prompts, ground-cell
  highlights and status popups into `nextFrame` from already-resolved frame
  state.
- Removed from `frame(now)`: direct calls to
  `updateWorldSpeechSnapshotFrame(...)`,
  `updateWorldPromptSnapshotFrame(...)`,
  `updateGroundCellHighlightFrame(...)` and `updateStatusPopupsFrame(...)`.

Study path:

1. `frame(now)` still resolves `worldSpacePresentationFrameState` at the same
   point in the frame.
2. `frame(now)` keeps only `canShowWorldSpaceUi` because later billboard
   rendering still needs it.
3. `updateWorldSpacePresentationSnapshotFrame(...)` preserves the previous
   writer order: speech, prompt, ground-cell highlight, status popups.
4. The new module delegates to the existing snapshot writers; it does not own
   prompt copy, speech copy, highlight rules or popup rules.
5. The module belongs in `presentation/` because it translates frame
   presentation state into snapshot channels, not gameplay state.

Tests added:

- `tests/worldSpacePresentationSnapshotFrame.test.js`

The test covers:

- speech snapshot write from Tangrowth presentation state;
- world prompt snapshot write using the previous player-position fallback;
- ground-cell highlight snapshot write;
- dry grass hint and quest completion popup writes;
- `gameplay.getQuestCompletionPop()` forwarding.

Risks reduced:

- `gameLoop.js` no longer coordinates four world-space snapshot writer calls.
- The order of world-space presentation snapshot writes is now explicit and
  testable in a single domain module.
- Four presentation imports were removed from `gameLoop.js`.

Risks remaining:

- `frame(now)` still assembles grouped source objects for prompt and highlight
  snapshot writing. That is acceptable for this cut because those sources cross
  presentation, placement and field-move state.
- The broader render snapshot section after world-space presentation is still
  large and should be split by domain later.

Validation for this cut:

```sh
npm test -- --run tests/worldSpacePresentationSnapshotFrame.test.js
npm test -- --run tests/worldSpacePresentationSnapshotFrame.test.js tests/worldSpacePresentationFrameState.test.js tests/worldSpeechSnapshotFrame.test.js tests/worldPromptSnapshotFrame.test.js tests/groundCellHighlightFrame.test.js tests/statusPopupsFrame.test.js
npm run build
npm test
```

The focused suite passed with `14` tests. `npm run build` passed with the
existing large chunk warning. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1735` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### Repair Box Reveal Opening Runtime

Created `app/runtime/companions/repairBoxRevealOpeningRuntime.js`.

Module boundary:

- Domain: `companions`.
- Responsibility: own the repair-box reveal opening sequence for companion
  bots: reveal timing, falling reveal origin, box hiding, flash opacity reset,
  reveal SFX trigger and completion callback.
- Removed from `gameLoop.js`: local `revealBotAtRepairPosition(...)`,
  `updateBotRevealFall(...)`, `updateBotRevealBoxOpening(...)`,
  `updateBulbasaurRevealBoxOpening(...)` and
  `updateCharmanderRevealBoxOpening(...)` wrappers.

Study path:

1. `startGameLoop()` still composes the runtime because it owns the concrete
   dependencies: repair-box position lookup, flash runtime, SFX callback,
   clamp helper and existing tuning constants.
2. `updateBulbasaurEncounter(...)` and `updateCharmanderEncounter(...)` now
   call `repairBoxRevealOpeningRuntime.update(...)` with their current model
   sync callbacks.
3. The fallback already-revealed Bulbasaur path now calls
   `repairBoxRevealOpeningRuntime.revealAtRepairPosition(...)`.
4. The runtime delegates pure motion math to the existing
   `botRevealMotion.js` helpers instead of duplicating reveal-position logic.
5. No reveal duration, progress threshold, fall height, flash visual, SFX or
   model sync timing changed intentionally.

Tests added:

- `tests/repairBoxRevealOpeningRuntime.test.js`

The test covers:

- falling reveal from repair-box origin;
- one-shot reveal SFX start;
- repair module hiding when the bot becomes visible;
- completion callback and flash opacity reset;
- invalid opening cleanup when `repairPosition` is missing.

Risks reduced:

- `gameLoop.js` no longer owns the internal reveal-opening state machine for
  companion repair boxes.
- Bulbasaur and Charmander reveal openings now share one domain runtime instead
  of local wrappers.

Risks remaining:

- Companion encounter update functions still contain patrol, follow, guide and
  construction-helper movement logic. Those are separate companion-motion cuts.
- `botRevealMotion.js` still lives at the old runtime root for compatibility;
  a later domain move should preserve its public import path through re-export.

Validation for this cut:

```sh
npm test -- --run tests/repairBoxRevealOpeningRuntime.test.js
npm test -- --run tests/repairBoxRevealOpeningRuntime.test.js tests/botRevealMotion.test.js
npm test -- --run tests/repairBoxRevealOpeningRuntime.test.js tests/botRevealMotion.test.js tests/repairBoxRevealFlashRuntime.test.js tests/repairBoxMotionRuntime.test.js
npm run build
npm test
```

The focused repair-box suite passed with `14` tests. `npm run build` passed
with the existing large chunk warning. `npm test` completed with the existing
Leafage Native Tree baseline:

- `1737` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### Companion Follow Movement Runtime

Created `app/runtime/companions/companionFollowMovementRuntime.js`.

Module boundary:

- Domain: `companions`.
- Responsibility: resolve a ground companion follow target behind the player
  and move the companion toward that slot, including patrol clearing,
  collision-aware movement callback and model yaw update.
- Removed from `gameLoop.js`: local `getCompanionFollowTargetPosition(...)`
  and `moveGroundCompanionTowardPlayer(...)`.

Study path:

1. `startGameLoop()` composes `createCompanionFollowMovementRuntime(...)`
   with explicit dependencies: player position, player yaw, follow direction,
   collision-aware move callback, model yaw callback and arrival distance.
2. Formation membership and formation index still stay in `gameLoop.js` for
   this cut because they depend on current action queues and guide state.
3. Squirtle, Bulbasaur, Charmander and Timburr follow branches now call
   `companionFollowMovementRuntime.moveTowardPlayer(...)` with their existing
   speeds, distances and model face-yaw offsets.
4. No companion follow distance, speed, arrival distance, y-position,
   collision behavior or model yaw calculation changed intentionally.

Tests added:

- `tests/companionFollowMovementRuntime.test.js`

The test covers:

- target position behind the player from follow direction;
- movement toward the follow slot with unchanged travel calculation;
- patrol clearing;
- model yaw update through the injected yaw callback;
- no movement when player or companion position is missing.

Risks reduced:

- `gameLoop.js` no longer owns the low-level movement mechanics for companion
  follow slots.
- Companion follow target calculation is now independently testable.

Risks remaining:

- `updateSquirtleIdlePatrol(...)` and `updateBulbasaurIdlePatrol(...)` still
  live in `gameLoop.js`; moving them should be a separate companion patrol cut.
- Formation membership is still locally wired because it crosses action
  queues, reveal state and workbench guide state.

Validation for this cut:

```sh
npm test -- --run tests/companionFollowMovementRuntime.test.js
npm test -- --run tests/companionFollowMovementRuntime.test.js tests/companionFollowMotion.test.js
npm test -- --run tests/companionFollowMovementRuntime.test.js tests/companionFollowMotion.test.js tests/companionFrameRuntime.test.js tests/companionFollowDirectionRuntime.test.js
npm run build
npm test
```

The focused companion movement suite passed with `20` tests. `npm run build`
passed with the existing large chunk warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1740` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### Companion Follow Formation Movement Expansion

Expanded `app/runtime/companions/companionFollowMovementRuntime.js`.

Classification: `companions`, specifically follow-slot movement orchestration.

Study path:

1. `gameLoop.js` still decides whether Charmander or Timburr may follow in the
   current encounter branch.
2. Once following is allowed, `gameLoop.js` now passes the companion id, active
   move id, speed, default distance and model face-yaw offset to
   `moveFormationMemberTowardPlayer(...)`.
3. The runtime resolves formation index, resolves final follow distance, and
   delegates to the existing `moveTowardPlayer(...)` path.
4. The movement algorithm, collision-aware callback, arrival distance and yaw
   application remain unchanged.

Removed from `gameLoop.js`:

- duplicated Charmander formation-index local variable;
- duplicated Timburr formation-index local variable;
- direct per-branch `resolveCompanionFollowDistance(...)` object assembly for
  Charmander and Timburr.

Kept in `gameLoop.js`:

- encounter lifecycle gates;
- reveal/follow/action/construction blockers;
- companion-specific speed constants and model face-yaw offsets.

Tests updated:

- `tests/companionFollowMovementRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/companionFollowMovementRuntime.test.js
```

The first run failed because `moveFormationMemberTowardPlayer(...)` did not
exist yet. After adding the runtime method, the focused suite passed.

Passed:

```sh
npm test -- --run tests/companionFollowMovementRuntime.test.js
npm test -- --run tests/companionFollowMovementRuntime.test.js tests/companionFollowMotion.test.js tests/companionFollowFormation.test.js tests/companionFrameRuntime.test.js tests/companionGroundPatrolFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1883` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Companion Idle Motion Runtime

Created `app/runtime/companions/companionIdleMotionRuntime.js`.

Module boundary:

- Domain: `companions`.
- Responsibility: face idle companions toward a nearby player and update
  non-following ground companion patrol motion.
- Removed from `gameLoop.js`: local `createRobotPatrolState(...)`,
  `updateRobotIdlePatrol(...)` and `faceIdleBotTowardPlayer(...)`.

Study path:

1. `startGameLoop()` composes `createCompanionIdleMotionRuntime(...)` with
   player position, model yaw callback and existing idle tuning constants.
2. Squirtle and Bulbasaur idle branches still decide whether patrol is allowed;
   the runtime only owns what happens after that decision.
3. Charmander's idle branch now uses the same `faceTowardPlayer(...)` entry
   point for nearby-player attention facing.
4. The runtime delegates attention-facing math to the existing
   `botAttentionFacing.js` helper.
5. No attention distance, patrol radius, patrol speed, pause duration, arrival
   distance or model yaw offset changed intentionally.

Tests added:

- `tests/companionIdleMotionRuntime.test.js`

The test covers:

- facing a nearby player;
- creating the paused patrol state around the current robot position;
- moving toward a patrol waypoint;
- preserving model yaw updates through the injected yaw callback.

Risks reduced:

- `gameLoop.js` no longer owns low-level idle patrol path construction or
  attention-facing application.
- Idle movement behavior is now independently testable under the companions
  domain.

Risks remaining:

- `updateSquirtleIdlePatrol(...)` and `updateBulbasaurIdlePatrol(...)` still
  decide when to follow, face or patrol. That policy can move later after the
  remaining blockers are grouped.
- `robotPatrolConfig.js` and `botAttentionFacing.js` still live at the runtime
  root for compatibility; a later domain move should use re-exports.

Validation for this cut:

```sh
npm test -- --run tests/companionIdleMotionRuntime.test.js
npm test -- --run tests/companionIdleMotionRuntime.test.js tests/botAttentionFacing.test.js tests/robotPatrolConfig.test.js
npm test -- --run tests/companionIdleMotionRuntime.test.js tests/botAttentionFacing.test.js tests/robotPatrolConfig.test.js tests/companionFollowMovementRuntime.test.js tests/companionFrameRuntime.test.js
npm run build
npm test
```

The focused companion idle suite passed with `12` tests. `npm run build`
passed with the existing large chunk warning. `npm test` completed with the
existing Leafage Native Tree baseline:

- `1743` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### Bulbasaur Jump Arc Motion Extraction

Expanded the existing `app/runtime/companions/companionIdleMotionRuntime.js`
boundary.

Classification: `companions`, specifically encounter jump motion.

Study path:

1. `updateBulbasaurEncounter(...)` still owns the encounter lifecycle gates:
   repair-box reveal opening, already-revealed fallback, Workbench guide branch,
   visibility checks and model sync timing.
2. Once the encounter is visible and has a position, `gameLoop.js` now delegates
   the jump arc mutation to `companionIdleMotionRuntime.updateJumpArc(...)`.
3. The runtime owns the previous low-level motion details: `jumpTimer`
   decrementing, landing cleanup, eased X/Z interpolation, vertical sine arc and
   model yaw toward the landing position.
4. The numeric tuning was preserved: cubic ease-out and the `0.92` arc height
   remain unchanged.

Removed from `gameLoop.js`:

- direct Bulbasaur jump timer settlement logic;
- direct Bulbasaur jump arc interpolation math;
- direct Bulbasaur jump yaw assignment.

Kept in `gameLoop.js`:

- the high-level Bulbasaur encounter lifecycle;
- reveal opening and Workbench guide branches;
- the `companionModelSyncRuntime.syncBulbasaur()` call order.

Tests updated:

- `tests/companionIdleMotionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/companionIdleMotionRuntime.test.js
```

The first run failed because `updateJumpArc(...)` did not exist yet. After
adding the runtime method, the focused suite passed.

Passed:

```sh
npm test -- --run tests/companionIdleMotionRuntime.test.js
npm test -- --run tests/companionIdleMotionRuntime.test.js tests/companionFrameRuntime.test.js tests/companionGroundPatrolFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1882` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Companion Ground Patrol Frame Runtime

Created `app/runtime/companions/companionGroundPatrolFrameRuntime.js`.

Module boundary:

- Domain: `companions`.
- Responsibility: own the per-frame follow/idle/patrol policy for ground
  companions currently handled by Squirtle and Bulbasaur.
- Removed from `gameLoop.js`: local `updateSquirtleIdlePatrol(...)` and
  `updateBulbasaurIdlePatrol(...)`.

Study path:

1. `startGameLoop()` composes `createCompanionGroundPatrolFrameRuntime(...)`
   with session, controls, follow movement runtime, idle motion runtime,
   existing queue/blocker callbacks and current tuning constants.
2. `companionFrameRuntime` still owns frame order; its callbacks now delegate
   Squirtle/Bulbasaur idle updates to the ground patrol runtime.
3. The runtime preserves the previous decision order: blocked clears patrol
   and syncs, following moves toward formation, otherwise face nearby player or
   idle patrol.
4. Formation membership remains outside this runtime because it still crosses
   current action queues and workbench guide state.
5. No follow speeds, distances, patrol radii, face-yaw offsets, action blockers
   or sync timing changed intentionally.

Tests added:

- `tests/companionGroundPatrolFrameRuntime.test.js`

The test covers:

- following Squirtle moving toward a formation slot;
- Bulbasaur idle patrol fallback when not following and not facing the player;
- blocked movement clearing patrol and syncing without moving.

Risks reduced:

- `gameLoop.js` no longer owns Squirtle/Bulbasaur ground companion idle-frame
  policy.
- Companion frame runtime now delegates ground patrol behavior to a cohesive
  companions module.

Risks remaining:

- Charmander and Timburr follow branches still live in their encounter update
  functions. They can move after their encounter-specific construction/action
  behavior is separated.
- Follow formation membership wiring remains local until action queue state is
  grouped under a cleaner companion action boundary.

Validation for this cut:

```sh
npm test -- --run tests/companionGroundPatrolFrameRuntime.test.js
npm test -- --run tests/companionGroundPatrolFrameRuntime.test.js tests/companionIdleMotionRuntime.test.js tests/companionFollowMovementRuntime.test.js tests/companionFrameRuntime.test.js
npm test -- --run tests/companionGroundPatrolFrameRuntime.test.js tests/companionIdleMotionRuntime.test.js tests/companionFollowMovementRuntime.test.js tests/companionFrameRuntime.test.js tests/companionFollowMotion.test.js
npm run build
npm test
```

The focused companion ground patrol suite passed with `21` tests.
`npm run build` passed with the existing large chunk warning. `npm test`
completed with the existing Leafage Native Tree baseline:

- `1746` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

### Gameplay Prompt Frame State Wrapper

Expanded `app/runtime/presentation/gameplayPromptTargetFrameState.js` with
`resolveGameplayPromptFrameState(...)`.

Module boundary:

- Domain: `presentation/render helpers`.
- Responsibility: gather the frame prompt presentation state after ground
  guidance has produced `pendingWaterGunGroundCells`.
- Removed from `frame(now)`: direct input-modality lookup for prompt assembly,
  transient notice routing, counter prompt text lookup, prompt target resolution
  call wiring and `resolveFrameHudPromptCopy(...)` wiring.

Study path:

1. `frame(now)` still computes `activeQuest`, `activeTask`,
   `activeSystemQuest` and ground guidance before prompt copy. This preserves
   the existing dependency order.
2. `resolveGameplayPromptFrameState(...)` receives the already-known frame
   inputs and explicit callbacks for modality, counter prompt and workbench
   targets.
3. The wrapper delegates to `resolveGameplayPromptTargetFrameState(...)`,
   `resolveTransientNoticeRoute(...)` and `resolveFrameHudPromptCopy(...)`.
4. The returned object preserves the same names consumed later by HUD snapshot,
   world prompt state and render snapshot prep.

Tests expanded:

- `tests/gameplayPromptTargetFrameState.test.js`

The new test covers prompt-copy priority through the wrapper, transient notice
routing, input modality forwarding and player counter prompt forwarding.

Risks reduced:

- `gameLoop.js` no longer coordinates the low-level HUD prompt-copy adapter.
- `resolveFrameHudPromptCopy(...)` and `resolveTransientNoticeRoute(...)` are no
  longer direct `gameLoop.js` imports.

Risks remaining:

- `frame(now)` still owns the ordering between gameplay target lookup, ground
  guidance, prompt frame state and ground-cell highlight state.
- The presentation module intentionally receives explicit callbacks instead of
  owning gameplay systems.

Validation for this cut:

```sh
npm test -- --run tests/gameplayPromptTargetFrameState.test.js
npm test -- --run tests/gameplayPromptTargetFrameState.test.js tests/placementPreviewPrompts.test.js tests/pendingPlacementIntent.test.js tests/worldPromptCopy.test.js tests/hudPromptCopy.test.js tests/inputPromptResolver.test.js tests/worldPromptFrameState.test.js tests/worldPromptSnapshotFrame.test.js
git diff --check
npm run build
npm test
```

The focused suite passed with `37` tests. `npm run build` passed with the
existing large chunk warning. `npm test` completed with the existing Leafage
Native Tree baseline:

- `1730` passed
- `3` failed in `tests/gameplayInteractions.test.js`

No manual browser validation was run in this cut.

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

### Status Popup Frame Boundary

Moved dry-grass hint and quest completion task-pop snapshot writes from
`app/runtime/gameLoop.js` into the `presentation` boundary at
`app/runtime/presentation/statusPopupsFrame.js`.

Study path:

1. `updateStatusPopupsFrame(...)` owns writing `nextFrame.dryGrassHint` from a
   resolved nearby dry-grass target.
2. The helper owns the existing task-pop blocker checks for opening camera,
   cinematic, tutorial and Pokedex modal states.
3. `gameLoop.js` still owns reading gameplay state, resolving the dry-grass
   hint target and providing player position through an explicit callback.

Reduced pressure:

- `gameLoop.js` line count changed from `11376` to `11351`.
- Removed the local `updateFrameStatusPopups(...)` helper from `gameLoop.js`.
- Added focused tests for dry-grass hint world-position behavior and task-pop
  blocker behavior.

Validation:

```sh
npm test -- --run tests/statusPopupsFrame.test.js
npm test -- --run tests/statusPopupsFrame.test.js tests/frameSnapshotController.test.js tests/worldSpeechController.test.js
git diff --check
npm run build
```

The focused status popup suite passed with `16` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1541` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Builder Tutorial Foundation Available-Zone Boundary

Moved the available builder tutorial foundation-zone search from
`app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on scanning candidate origins,
skipping out-of-grid origins and returning the first unblocked tutorial
foundation zone. The live blocked-zone callback remains wired by `gameLoop.js`
because it still depends on live session blockers.

Study path:

1. `findAvailableBuilderTutorialFoundationBuildZone(...)` owns iterating
   candidate origins and constructing candidate zones.
2. It reuses `isBuilderTutorialFoundationOriginInsideGrid(...)` and
   `createBuilderTutorialFoundationBuildZone(...)`, keeping tutorial dimensions
   inside the construction module.
3. `gameLoop.js` still supplies `gridConfig` and the live
   `isBuilderTutorialFoundationBuildZoneBlocked(...)` callback.

Reduced pressure:

- `gameLoop.js` line count changed from `9841` to `9824`.
- Removed local candidate-origin scanning and grid-fit wrapper from
  `gameLoop.js`.
- Removed direct imports for tutorial candidate origins and zone creation from
  `gameLoop.js`.
- Added a focused test that verifies out-of-grid origins are skipped and the
  first unblocked candidate is selected.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction/foundation/placement suite passed with `88` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1632` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Builder Tutorial Foundation Origin Policy Boundary

Moved builder tutorial foundation-origin grid checks, saved-origin flag access
and active-zone resolution policy from `app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on foundation tutorial origin
state and saved/available zone selection. The live `session` writes remain in
`gameLoop.js`.

Study path:

1. `isBuilderTutorialFoundationOriginInsideGrid(...)` owns the tutorial zone
   width/height check against the free-block grid.
2. `getSavedBuilderTutorialFoundationOriginCell(...)` and
   `saveBuilderTutorialFoundationOriginCell(...)` own the specific story flag
   key and default origin for this tutorial zone.
3. `resolveActiveBuilderTutorialFoundationBuildZone(...)` owns choosing between
   the saved origin, an available alternate zone or an unavailable saved zone
   when progress already exists.
4. `gameLoop.js` still owns reading live flags, applying `session` state and
   saving the selected origin when the policy returns one.

Reduced pressure:

- `gameLoop.js` line count changed from `9860` to `9841`.
- Removed tutorial foundation origin constants and generic origin helper wiring
  from `gameLoop.js`.
- Added focused tests for grid-fit policy, story flag read/write behavior and
  active-zone resolution.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction/foundation/placement suite passed with `87` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1631` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Zone Blocker Assembly Boundary

Moved foundation build-zone blocker assembly and blocked-zone overlap policy
from `app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on deciding which active world
entities block the builder tutorial foundation zone. The live session reads,
rendering activity callbacks and saved-zone selection loop remain in
`gameLoop.js`.

Study path:

1. `buildFoundationBuildZoneBlockers(...)` owns the conversion from active
   construction/world entities into rectangular blockers.
2. It preserves the existing blocker categories and radii for terrain
   colliders, free blocks, world objects, player, NPCs, interactables,
   companions, resource nodes, drops and ground patches.
3. `isBuilderTutorialFoundationBuildZoneBlocked(...)` owns the final
   missing-rect and rectangle-overlap policy.
4. `gameLoop.js` still owns collecting live session arrays, activity callbacks
   and calling this boundary while searching for an available zone.

Reduced pressure:

- `gameLoop.js` line count changed from `9974` to `9860`.
- Removed direct foundation-zone blocker rectangle construction and overlap
  checks from `gameLoop.js`.
- Removed the direct `createFoundationBuildZoneBlockerRect(...)` and
  `doFoundationBuildZoneRectsOverlap(...)` dependencies from `gameLoop.js`.
- Added focused tests for active source filtering, blocker id/kind shape,
  terrain sizing and blocked-zone overlap behavior.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction/foundation/placement suite passed with `53` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1628` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Builder Tutorial Foundation Zone Boundary

Moved builder tutorial foundation-zone creation, signature forwarding and
candidate-origin generation from `app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on the fixed foundation-zone
shape and search origins used by the builder tutorial. The live mission checks,
camera focus, saved-origin flow and blocker checks remain in `gameLoop.js`.

Study path:

1. `createBuilderTutorialFoundationBuildZone(...)` owns the tutorial zone id,
   dimensions and the existing `borderCells: zone.cells` behavior.
2. `buildBuilderTutorialFoundationCandidateOrigins(...)` owns the existing
   search radius and origin expansion around the default tutorial origin.
3. `getBuilderTutorialFoundationZoneSignature(...)` keeps the signature lookup
   near the zone factory while delegating to placement geometry.
4. `gameLoop.js` still decides when to find, save, render and focus the active
   foundation zone.

Reduced pressure:

- `gameLoop.js` line count changed from `10005` to `9974`.
- Removed tutorial foundation-zone constants, factory wrappers and candidate
  origin generation from `gameLoop.js`.
- Removed the direct `createRectangularFreeBlockBuildZone(...)`,
  `buildFoundationBuildZoneCandidateOrigins(...)` and
  `getFoundationBuildZoneSignature(...)` dependencies from `gameLoop.js`.
- Added focused tests for the default origin, fixed zone shape, candidate count
  and signature behavior.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction/foundation/placement suite passed with `82` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1626` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Unavailable Payload Boundary

Moved unavailable foundation build-zone placement/validation payload creation
from `app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on foundation-zone blocked
placement state. The live action/control flow remains in `gameLoop.js`.

Study path:

1. `createUnavailableFoundationBuildZonePlacementResult(...)` owns the
   `{ placed: false, reason: "blocked-cell", ... }` payload used by direct
   player placement and Timburr impact placement.
2. `createUnavailableFoundationBuildZoneValidation(...)` owns the
   `{ valid: false, reason: "blocked-cell", ... }` payload used by preview
   target validation.
3. `gameLoop.js` still owns deciding when the foundation zone is unavailable,
   invoking controllers and applying HUD/audio/feedback side effects.

Reduced pressure:

- `gameLoop.js` line count changed from `10012` to `10005`.
- Removed duplicated unavailable/blocked-cell placement and validation payload
  literals from `gameLoop.js`.
- Added focused tests for unavailable placement and validation payload shape.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/freeBlockBuildSystem.test.js tests/freeBlockPreview.test.js tests/placementGeometry.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction/foundation/build suite passed with `84` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1623` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Build-Zone Policy Boundary

Moved foundation build-zone policy/progress helpers from
`app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on foundation-zone visibility,
allowed in-zone free blocks, progress counting and stacking policy.

Study path:

1. `shouldShowFoundationBuildZone(...)` owns active quest, active system quest
   and foundation-wall objective gating.
2. `isFoundationFreeBlockAllowedInZone(...)` owns whether an existing free block
   belongs to the active foundation zone.
3. `getFoundationBuildZoneProgressCount(...)` owns completed-count priority and
   saved floor-block fallback.
4. `canStackFreeBlockPlacement(...)` owns the complete-progress boolean policy.
5. `gameLoop.js` still owns live session/build-state lookup and calls
   `getFreeBlockBuildZoneProgress(...)`.

Reduced pressure:

- `gameLoop.js` line count changed from `10114` to `10101`.
- Removed foundation objective scanning, in-zone free-block checks, progress
  fallback counting and stack policy implementation from `gameLoop.js`.
- Added focused tests for quest gating, in-zone free blocks, progress fallback
  and stacking.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction policy/geometry/build suite passed with `74` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1608` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Free-Block Preview Debug Boundary

Moved the free-block preview debug payload builder from `app/runtime/gameLoop.js`
into `app/runtime/construction/freeBlockPreview.js`.

Boundary classification: `construction`, focused on Build Block/free-block
preview debug presentation data.

Study path:

1. `buildFreeBlockPreviewDebug(...)` owns the debug object shape consumed by the
   Build Block debug overlay.
2. It converts player world position to the debug `playerCell`, preserves
   validation/blocked-by-construction fields and reports raw/target block types.
3. `gameLoop.js` still owns target resolution, validation, collision queries and
   inventory lookup.

Reduced pressure:

- `gameLoop.js` line count changed from `10017` to `10012`.
- Removed debug payload construction and preview-debug `worldToCell(...)`
  conversion from `gameLoop.js`.
- Added focused tests for the debug payload shape.

Validation:

```sh
npm test -- --run tests/freeBlockPreview.test.js
npm test -- --run tests/freeBlockPreview.test.js tests/placementBlockers.test.js tests/freeBlockBuildSystem.test.js tests/placementGeometry.test.js
git diff --check
npm run build
```

The focused construction preview/debug suite passed with `75` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1621` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Free-Block Target Cell Geometry Boundary

Moved the free-block target-cell occupancy check from `app/runtime/gameLoop.js`
into `app/runtime/construction/placementGeometry.js`.

Boundary classification: `construction`, focused on grid/cell geometry for
free-block placement displacement.

Study path:

1. `isWorldPositionOnFreeBlockCell(...)` owns converting a world position into a
   grid cell and comparing it to a free-block target cell.
2. `movePlayerAwayFromPlacedFreeBlock(...)` remains in `gameLoop.js` because it
   still owns player mutation, model sync and construction displacement
   callbacks.

Reduced pressure:

- `gameLoop.js` line count changed from `10026` to `10017`.
- Removed target-cell/world-position comparison and direct `worldToCell(...)`
  construction from `gameLoop.js`.
- Added focused tests for matching target cells, non-matching target cells and
  null target handling.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/freeBlockPreview.test.js tests/freeBlockRemoval.test.js tests/foundationBuildZone.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction geometry/build suite passed with `86` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1620` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Free-Block Preview Boundary

Moved free-block preview instance visual sync from `app/runtime/gameLoop.js`
into `app/runtime/construction/freeBlockPreview.js`.

Boundary classification: `construction`, focused on Build Block/free-block
preview presentation state. Target resolution remains in `gameLoop.js`.

Study path:

1. `syncFreeBlockPreviewInstance(...)` owns preview instance activation,
   offset/scale/yaw fields, valid/invalid alpha, tint and tint strength.
2. `gameLoop.js` still owns resolving the free-block target, building the grid
   system and passing the current cell size.
3. The wrapper in `gameLoop.js` preserves the old early-return order: missing
   instance, inactive/missing player position, missing target, then grid lookup.

Reduced pressure:

- `gameLoop.js` line count changed from `10030` to `10026`.
- Removed preview visual tuning and direct preview instance field mutation from
  `gameLoop.js`.
- Added focused tests for inactive/missing target handling and valid/invalid
  preview visuals.

Validation:

```sh
npm test -- --run tests/freeBlockPreview.test.js
npm test -- --run tests/freeBlockPreview.test.js tests/freeBlockBuildSystem.test.js tests/freeBlockRemoval.test.js tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction preview/build suite passed with `85` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1619` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Origin Persistence Boundary

Moved foundation build-zone origin flag read/write helpers from
`app/runtime/gameLoop.js` into
`app/runtime/construction/foundationBuildZone.js`.

Boundary classification: `construction`, focused on persisted foundation-zone
origin state. The live story-state lookup remains in `gameLoop.js`.

Study path:

1. `getSavedFoundationBuildZoneOriginCell(...)` owns reading the configured
   origin flag and normalizing it with a fallback origin.
2. `saveFoundationBuildZoneOriginCell(...)` owns writing the normalized
   `{ x, y }` payload back into the flags object.
3. `gameLoop.js` still owns selecting `controls.storyState.flags`, the
   builder-tutorial flag name and the builder-tutorial default origin.

Reduced pressure:

- `gameLoop.js` line count changed from `10038` to `10030`.
- Removed local builder-tutorial origin normalization and direct flag write
  implementation from `gameLoop.js`.
- Added focused tests for saved-origin fallback normalization and normalized
  flag writes without requiring a story state object.

Validation:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction policy/geometry/build suite passed with `76` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1615` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Free-Block Removal Boundary

Moved free-block removal target selection and wood-drop spawning helpers from
`app/runtime/gameLoop.js` into
`app/runtime/construction/freeBlockRemoval.js`.

Boundary classification: `construction`, focused on free-block removal support
data. The side-effectful action remains in `gameLoop.js`.

Study path:

1. `findNearbyFreeBlockTarget(...)` owns active target filtering, distance
   gating and higher-layer tie-breaking.
2. `getNextFreeBlockWoodDropId(...)` owns sequential wood-drop id allocation.
3. `spawnFreeBlockRemovalDrops(...)` owns material refund drop payload creation
   for removed free blocks.
4. `tryRemoveNearbyFreeBlock(...)` remains in `gameLoop.js` because it still
   calls the controller, syncs snapshots, triggers feedback, plays audio and
   pushes HUD notices.

Reduced pressure:

- `gameLoop.js` line count changed from `10101` to `10038`.
- Removed free-block target scanning, wood-drop id parsing and wood-drop payload
  construction from `gameLoop.js`.
- Added focused tests for target filtering, layer tie-breaking, id allocation,
  invalid drop inputs and configured wood-drop payloads.

Validation:

```sh
npm test -- --run tests/freeBlockRemoval.test.js
npm test -- --run tests/freeBlockRemoval.test.js tests/freeBlockBuildSystem.test.js tests/foundationBuildZone.test.js tests/placementGeometry.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction removal/build suite passed with `79` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1613` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Free-Block Build Geometry Boundary

Moved free-block build-zone center, layered cell world-position and feedback
ground-cell payload helpers from `app/runtime/gameLoop.js` into
`app/runtime/construction/placementGeometry.js`.

Boundary classification: `construction`, focused on geometry and payloads for
Build Block/free-block feedback.

Study path:

1. `getFreeBlockBuildZoneCenterPosition(...)` owns foundation build-zone center
   math from a build zone and grid config.
2. `getFreeBlockCellWorldPosition(...)` owns grid-cell to world-position
   conversion, including vertical layer offset.
3. `buildFreeBlockFeedbackGroundCell(...)` owns valid/invalid feedback tile
   payload creation.
4. `gameLoop.js` still owns active zone lookup, grid-system creation and
   gameplay actions that trigger feedback.

Reduced pressure:

- `gameLoop.js` line count changed from `10140` to `10114`.
- Removed free-block center/world-position/feedback payload math from
  `gameLoop.js`.
- Kept no new file; extended the existing `construction` geometry module.
- Added focused tests for center position, layered world position and
  valid/invalid feedback ground cells.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction geometry/build suite passed with `69` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1603` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Build-Zone Ground Cell Boundary

Moved foundation build-zone ground-cell payload builders from
`app/runtime/gameLoop.js` into `app/runtime/construction/placementGeometry.js`.

Boundary classification: `construction`, focused on visual ground-cell payloads
derived from foundation build-zone cells and grid positions.

Study path:

1. `buildFoundationBuildZoneGroundCells(...)` owns border-cell payload creation,
   including completed wall, valid target and invalid-zone highlight state.
2. `buildFoundationCompletionInteriorGroundCells(...)` owns completed interior
   ground-cell payload creation.
3. `gameLoop.js` still owns quest gating, active build-zone lookup, controller
   sync, grid creation and zone-unavailable decisions.

Reduced pressure:

- `gameLoop.js` line count changed from `10161` to `10140`.
- Removed foundation border/interior ground-cell map implementations from
  `gameLoop.js`.
- Kept no new file; extended the existing `construction` geometry module.
- Added focused tests for completed/valid/invalid border cells and completion
  interior cells.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused construction geometry/build suite passed with `66` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1600` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Build Block Placement Prompt Boundary

Moved Build Block placement notices and free-block cost marker formatting from
`app/runtime/gameLoop.js` into
`app/runtime/construction/placementPreviewPrompts.js`.

Boundary classification: `construction`, focused on placement prompt copy and
small HUD marker payloads for Build Block.

Study path:

1. `getFreeBlockInvalidPlacementNotice(...)` owns invalid placement notice copy.
2. `getFreeBlockPlacementNotice(...)` owns success, wall-success and missing
   material notice copy.
3. `formatFreeBlockCostNumber(...)` and `buildFreeBlockBuildCostMarker(...)`
   own the free-block material marker payload.
4. `gameLoop.js` still owns live controller lookup and inventory access before
   calling the pure marker builder.

Reduced pressure:

- `gameLoop.js` line count changed from `10208` to `10161`.
- Removed Build Block notice-copy branching and cost formatting from
  `gameLoop.js`.
- Kept no new file; extended the existing `construction` prompt module.
- Added focused tests for placement notice copy and free-block cost markers.

Validation:

```sh
npm test -- --run tests/placementPreviewPrompts.test.js
npm test -- --run tests/placementPreviewPrompts.test.js tests/placementBlockers.test.js tests/freeBlockBuildSystem.test.js
git diff --check
npm run build
```

The focused construction prompt/build suite passed with `52` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1598` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Build Block Approach Runtime Boundary

Moved Build Block approach and construction displacement position resolution
from `app/runtime/gameLoop.js` into
`app/runtime/fieldMoveRuntime/buildBlockRuntime.js`.

Boundary classification: `fieldMoveRuntime`, focused on Builder Bot Build Block
approach positions and player displacement away from newly placed blocks.

Study path:

1. `resolveTimburrBuildBlockApproachPosition(...)` owns candidate approach
   ordering and blocked-candidate fallback for Builder Bot.
2. `resolveConstructionDisplacementPosition(...)` owns candidate positions used
   to move the player out of a newly placed construction target.
3. `gameLoop.js` imports these functions for existing runtime flow and
   re-exports them to preserve the public API currently used by tests.
4. Build Block action state, impact timing, placement result handling and HUD
   notices remain in `gameLoop.js`.

Reduced pressure:

- `gameLoop.js` line count changed from `10318` to `10208`.
- Removed Build Block direction normalization and candidate-position generation
  from `gameLoop.js`.
- Kept `TIMBURR_BUILD_BLOCK_STAND_DISTANCE` inside the field-move runtime
  boundary through `fieldMoveTuning.js`.
- Reused existing placement blocker tests by moving the pure position imports to
  `buildBlockRuntime.js`.

Validation:

```sh
npm test -- --run tests/placementBlockers.test.js
npm test -- --run tests/placementBlockers.test.js tests/fieldMoveApproachPositions.test.js tests/fieldMoveActorPositions.test.js tests/fieldMoveBillboards.test.js tests/freeBlockBuildSystem.test.js
git diff --check
npm run build
```

The focused placement/field-move suite passed with `62` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1596` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Build-Zone Candidate Origin Boundary Extension

Extended `app/runtime/construction/placementGeometry.js` with foundation
build-zone signature and candidate-origin generation previously implemented in
`app/runtime/gameLoop.js`.

Boundary classification: `construction`, focused on deterministic foundation
zone identity and grid-origin search order.

Study path:

1. `getFoundationBuildZoneSignature(...)` owns the stable
   `originX:originY:width:height` signature used by the camera focus flag.
2. `buildFoundationBuildZoneCandidateOrigins(...)` owns the expanding square
   search order for candidate foundation origins.
3. `gameLoop.js` still owns the builder tutorial constants, zone creation,
   blocker checks and fallback selection.

Reduced pressure:

- `gameLoop.js` line count changed from `10338` to `10318`.
- Removed candidate-origin loop and zone-signature formatting from
  `gameLoop.js`.
- Kept local wrappers so existing builder tutorial naming and call sites remain
  stable.
- Added focused tests for zone signature fallback and candidate-origin search
  order.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js tests/placementPreviewVisual.test.js tests/placementConsumptionContract.test.js tests/worldObjectPlacementValidation.test.js
git diff --check
npm run build
```

The focused construction suite passed with `75` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1596` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Foundation Build-Zone Geometry Boundary Extension

Extended `app/runtime/construction/placementGeometry.js` with pure foundation
build-zone geometry previously implemented in `app/runtime/gameLoop.js`.

Boundary classification: `construction`, focused on Build Block foundation
zone origin validation, cell keys, world rects, blocker rects and padded overlap
checks.

Study path:

1. `normalizeFoundationBuildZoneOriginCell(...)` owns origin-cell coercion and
   fallback selection.
2. `isFoundationBuildZoneOriginInsideGrid(...)` owns the grid-fit check for a
   rectangular foundation zone.
3. `getFoundationBuildZoneCellKeys(...)` and
   `getFoundationBuildZoneWorldRect(...)` own zone geometry derived from cells
   and grid config.
4. `createFoundationBuildZoneBlockerRect(...)` and
   `doFoundationBuildZoneRectsOverlap(...)` own blocker rectangle math.
5. `gameLoop.js` still owns Build Block runtime flow, session/blocker
   collection and foundation mission decisions.

Reduced pressure:

- `gameLoop.js` line count changed from `10396` to `10338`.
- Removed local foundation cell-key, world-rect, blocker-rect and overlap
  implementations from `gameLoop.js`.
- Kept local wrappers only where `gameLoop.js` supplies tutorial constants or
  live grid config.
- Added focused tests for origin normalization, grid bounds, zone world rects,
  blocker rectangles and padded overlap.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/freeBlockBuildSystem.test.js tests/placementBlockers.test.js tests/placementPreviewVisual.test.js tests/placementConsumptionContract.test.js tests/worldObjectPlacementValidation.test.js
git diff --check
npm run build
```

The focused construction suite passed with `73` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1594` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Snapped Placement Preview Position Boundary Extension

Extended `app/runtime/construction/placementGeometry.js` with snapped
placement-preview position resolution previously implemented in
`app/runtime/gameLoop.js`.

Boundary classification: `construction`, focused on grid/bounds snapping for
active placement previews.

Study path:

1. `getSnappedPlacementPreviewPosition(...)` owns grid-config snapping,
   finite-bounds clamping and grid-step fallback snapping.
2. `hasFinitePlacementBounds(...)` is exported because `gameLoop.js` still
   needs it while syncing a preview to the player.
3. `gameLoop.js` keeps the local `getSnappedSolarStationPreviewPosition(...)`
   wrapper to preserve existing call sites and placement-preview update order.

Reduced pressure:

- `gameLoop.js` line count changed from `10454` to `10396`.
- Removed grid snapping/clamping implementation from `gameLoop.js`.
- Kept placement preview lifecycle and player-follow sync in `gameLoop.js`.
- Added focused tests for finite bounds, grid cell snapping, grid-step fallback
  snapping and no-bounds fallback.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/solarStationPlacementBlockers.test.js tests/solarStationPowerRadius.test.js tests/worldObjectPlacementBlockers.test.js tests/placementBlockers.test.js tests/worldObjectPlacementValidation.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js tests/workbenchRotationRuntime.test.js
git diff --check
npm run build
```

The focused construction/placement suite passed with `59` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1590` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Placement Footprint Cell Boundary Extension

Extended `app/runtime/construction/placementGeometry.js` with placement
footprint/cell helpers previously implemented in `app/runtime/gameLoop.js`.

Boundary classification: `construction`, focused on placement-preview footprint
cells, Solar Station marked-field cells and preview footprint world-size math.

Study path:

1. `buildPlacementPreviewFootprintCells(...)` owns the snapped-position,
   rotated-footprint and target-state cell shape used by construction previews.
2. `getPlacementPreviewFootprintWorldSize(...)` owns footprint-to-world-size
   conversion for preview collision checks.
3. `buildSolarStationFieldMarkedGroundCells(...)` owns Solar Station field
   marked-cell generation while `gameLoop.js` still provides the marked-tile
   limit through a wrapper.
4. `gameLoop.js` still owns preview lifecycle, render insertion order and
   feature-specific placement decisions.

Reduced pressure:

- `gameLoop.js` line count changed from `10553` to `10454`.
- Removed preview footprint cell generation from `gameLoop.js`.
- Removed local finite-bounds helper from `gameLoop.js`.
- Added focused tests for preview footprint cells, footprint world size and
  Solar Station marked-field tile limiting.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/solarStationPlacementBlockers.test.js tests/solarStationPowerRadius.test.js tests/worldObjectPlacementBlockers.test.js tests/placementBlockers.test.js tests/worldObjectPlacementValidation.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js tests/workbenchRotationRuntime.test.js
git diff --check
npm run build
```

The focused construction/placement suite passed with `55` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1586` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Placement Geometry Boundary

Moved pure placement geometry helpers from `app/runtime/gameLoop.js` into
`app/runtime/construction/placementGeometry.js`.

Boundary classification: `construction`, focused on placement rectangle math,
overlap checks, collision size fallback and quarter-turn rotation helpers.

Study path:

1. `getPlacementRect(...)` owns centered placement rectangle construction.
2. `doPlacementRectsOverlap(...)` owns the existing gutter-aware overlap policy.
3. `getPlacementCollisionSize(...)` owns placement `size` fallback behavior.
4. `normalizePlacementYaw(...)`, `getRotatedPlacementSize(...)` and
   `getRotatedGridFootprint(...)` own quarter-turn rotation geometry.
5. `gameLoop.js` still owns placement lifecycle, preview updates and the
   `PLACEMENT_ROTATION_STEP` tuning through a thin local wrapper.

Reduced pressure:

- `gameLoop.js` line count changed from `10605` to `10553`.
- Removed generic placement geometry implementation from `gameLoop.js`.
- Kept preview-cell formatting and blocker lifecycles in `gameLoop.js`.
- Added focused tests for rect construction, overlap, collision-size fallback,
  yaw normalization and placement/grid footprint rotation.

Validation:

```sh
npm test -- --run tests/placementGeometry.test.js
npm test -- --run tests/placementGeometry.test.js tests/solarStationPlacementBlockers.test.js tests/solarStationPowerRadius.test.js tests/worldObjectPlacementBlockers.test.js tests/placementBlockers.test.js tests/worldObjectPlacementValidation.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js tests/workbenchRotationRuntime.test.js
git diff --check
npm run build
```

The focused construction/placement suite passed with `52` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1583` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### World Object Placement Blocker Boundary

Moved tree and Leppa Tree placement blocker sizing/assembly from
`app/runtime/gameLoop.js` into
`app/runtime/construction/worldObjectPlacementBlockers.js`.

Boundary classification: `construction`, focused on world objects that block
construction placement and foundation zones.

Study path:

1. `getTreePlacementBlockerSize(...)` owns living/dead tree blocker footprint
   sizing.
2. `getLeppaTreePlacementBlockerSize(...)` owns the Leppa Tree default/grid
   footprint blocker sizing.
3. `getWorldObjectPlacementBlockers(...)` owns active palm and Leppa Tree
   blocker assembly.
4. `gameLoop.js` still owns the tuning constants and `treeFootprint(...)`
   dependency through a wrapper, so construction/foundation call sites did not
   change.

Reduced pressure:

- `gameLoop.js` line count changed from `10639` to `10605`.
- Removed tree/Leppa Tree blocker implementation details from `gameLoop.js`.
- Kept foundation-zone blocker lifecycle and Solar Station placement lifecycle
  in `gameLoop.js`.
- Added focused tests for living/dead tree sizing, fallback sizing, Leppa Tree
  grid sizing and blocker filtering/assembly.

Validation:

```sh
npm test -- --run tests/worldObjectPlacementBlockers.test.js
npm test -- --run tests/worldObjectPlacementBlockers.test.js tests/solarStationPlacementBlockers.test.js tests/solarStationPowerRadius.test.js tests/placementBlockers.test.js tests/worldObjectPlacementValidation.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js
git diff --check
npm run build
```

The focused construction/placement suite passed with `42` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1578` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Solar Station Placement Blocker Boundary

Moved Solar Station placement blocker assembly and collision checks from
`app/runtime/gameLoop.js` into
`app/runtime/construction/solarStationPlacementBlockers.js`.

Boundary classification: `construction`, focused on placement blockers and
collision policy for Solar Station preview validation.

Study path:

1. `getSolarStationPlacementBlockers(...)` owns the assembly of player
   construction blockers, world object blockers and optional story-gated
   blockers such as log chair, Ditto flag, challenge boulder and Leaf Den
   furniture.
2. `isSolarStationPlacementBlocked(...)` owns the object/terrain collider
   overlap decision for a proposed Solar Station placement rect.
3. `gameLoop.js` still owns footprints, placement geometry callbacks and the
   existing preview lifecycle. The preview update order did not move.

Reduced pressure:

- `gameLoop.js` line count changed from `10694` to `10639`.
- Removed Solar Station blocker assembly and terrain-collider overlap helper
  details from `gameLoop.js`.
- Kept placement geometry primitives and broader placement validation in
  `gameLoop.js`.
- Added focused tests for callback forwarding, story-gated blockers, object
  collision and elevated terrain collision.

Validation:

```sh
npm test -- --run tests/solarStationPlacementBlockers.test.js
npm test -- --run tests/solarStationPlacementBlockers.test.js tests/solarStationPowerRadius.test.js tests/placementBlockers.test.js tests/worldObjectPlacementValidation.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js
git diff --check
npm run build
```

The focused construction/placement suite passed with `38` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1574` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Solar Station Power Radius Boundary

Moved Solar Station support-field radius and marked-ground-cell helpers from
`app/runtime/gameLoop.js` into
`app/runtime/construction/solarStationPowerRadius.js`.

Boundary classification: `construction`, with presentation data limited to the
existing ground-cell highlight shape consumed by the frame snapshot.

Study path:

1. `buildSolarStationPowerRadiusGroundCells(...)` owns the grid scan and
   `powerRadius` highlight-cell shape.
2. `getSolarStationPreviewPowerRadius(...)` and
   `buildSolarStationPreviewPowerRadiusGroundCells(...)` own preview support
   radius math.
3. `getSolarStationPowerPosition(...)`, `getSolarStationPowerRadius(...)`,
   `buildPlacedSolarStationPowerRadiusGroundCells(...)` and
   `isInsideSolarStationPowerRadius(...)` own placed Solar Station support-zone
   policy.
4. `gameLoop.js` still owns constants, placement collision callbacks and call
   order through small wrappers, so placement lifecycle and render order did not
   move in this cut.

Reduced pressure:

- `gameLoop.js` line count changed from `10813` to `10694`.
- Removed the Solar Station radius grid scan from `gameLoop.js`.
- Kept Solar Station placement blockers and placement validation in
  `gameLoop.js`.
- Added focused tests for flag-gated power position, model-scale radius,
  fallback radius, grid highlight cells and inside/outside radius checks.

Validation:

```sh
npm test -- --run tests/solarStationPowerRadius.test.js
npm test -- --run tests/solarStationPowerRadius.test.js tests/placementBlockers.test.js tests/worldObjectPlacementValidation.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js
git diff --check
npm run build
```

The focused construction/placement suite passed with `34` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1570` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Field Move Actor Position Boundary

Moved Water Gun, Fire and Leafage actor mouth/emitter/world-position offset
math from `app/runtime/gameLoop.js` into
`app/runtime/fieldMoveRuntime/fieldMoveActorPositions.js`.

Study path:

1. `getSquirtleMouthPosition(...)`, `getCharmanderMouthPosition(...)` and
   `getBulbasaurGrowEmitterPosition(...)` own the pure forward/height offset
   math for field-move emitters.
2. `getSquirtleWorldPosition(...)` and `getCharmanderWorldPosition(...)` own
   the actor-position/model-offset fallback policy used by status and charging
   billboards.
3. `gameLoop.js` still owns `session` lookup, logical facing yaw lookup and the
   action lifecycle; its local functions are now wrappers that pass explicit
   actor/yaw inputs into the domain helper.

Reduced pressure:

- `gameLoop.js` line count changed from `10819` to `10813`.
- Removed hardcoded mouth/emitter vector math from `gameLoop.js`.
- Kept Water Gun, Fire and Leafage render insertion order unchanged.
- Added focused tests for direct actor position, model-offset fallback, origin
  fallback and missing-world-position fallback.

Validation:

```sh
npm test -- --run tests/fieldMoveActorPositions.test.js
npm test -- --run tests/fieldMoveActorPositions.test.js tests/fieldMoveBillboards.test.js tests/fieldMoveApproachPositions.test.js
git diff --check
npm run build
```

The focused field-move actor-position suite passed with `16` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1565` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Field Move Approach Position Boundary

Moved repeated Water Gun, Leafage and Fire companion stand-position
calculations from `app/runtime/gameLoop.js` into
`app/runtime/fieldMoveRuntime/fieldMoveApproachPositions.js`.

Study path:

1. `resolveSquirtleWaterGunApproachPosition(...)`,
   `resolveBulbasaurLeafageApproachPosition(...)` and
   `resolveCharmanderFireApproachPosition(...)` own pure stand-position math.
2. `gameLoop.js` still owns session lookups, active action lifecycle and wrapper
   call sites.
3. Build Block/Timburr approach remains in `gameLoop.js` because it uses
   construction blockers and the existing public
   `resolveTimburrBuildBlockApproachPosition(...)` export.

Reduced pressure:

- `gameLoop.js` line count changed from `10874` to `10819`.
- Removed duplicated stand-distance vector math for Water Gun, Leafage and Fire.
- Removed Water Gun/Leafage/Fire stand-distance tuning imports from
  `gameLoop.js`.
- Added focused tests for direct companion positioning, player fallback and
  default forward fallback.

Validation:

```sh
npm test -- --run tests/fieldMoveApproachPositions.test.js
npm test -- --run tests/fieldMoveApproachPositions.test.js tests/fieldMoveBillboards.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused approach-position suite passed with `27` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1561` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Bulbasaur Leafage Billboard Boundary

Moved Bulbasaur Leafage stream/burst billboard geometry from
`app/runtime/gameLoop.js` into the existing field-move billboard boundary at
`app/runtime/fieldMoveRuntime/fieldMoveBillboards.js`.

Study path:

1. `getBulbasaurLeafageBillboards(...)` owns only visual billboard geometry for
   Leafage stream and burst particles.
2. `gameLoop.js` still owns Leafage action lifecycle, target selection, impact
   application, object growth/destruction logic and render insertion order.
3. The builder receives `getEmitterPosition` as an explicit callback, so
   Bulbasaur pose lookup remains owned by `gameLoop` and is not read while
   inactive.

Reduced pressure:

- `gameLoop.js` line count changed from `10967` to `10874`.
- Removed the local Leafage particle billboard builder from `gameLoop.js`.
- Removed Leafage visual tuning imports from `gameLoop.js`; the field-move
  billboard boundary imports the existing tuning values directly.
- Extended focused tests for Leafage stream count, burst count and inactive
  behavior.

Validation:

```sh
npm test -- --run tests/fieldMoveBillboards.test.js
npm test -- --run tests/fieldMoveBillboards.test.js tests/gameLoopFrameRuntime.test.js tests/frameSnapshotController.test.js
git diff --check
npm run build
```

The focused field-move billboard suite passed with `18` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1558` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Charmander Fire Billboard Boundary

Moved Charmander Fire spray/burst billboard geometry from
`app/runtime/gameLoop.js` into the existing field-move billboard boundary at
`app/runtime/fieldMoveRuntime/fieldMoveBillboards.js`.

Study path:

1. `getCharmanderFireBillboards(...)` owns only visual billboard geometry for
   Fire stream and burst particles.
2. `gameLoop.js` still owns Fire action lifecycle, Carbon energy, impact
   application, sound/notice behavior and render insertion order.
3. The builder receives `getMouthPosition` as an explicit callback, so companion
   pose lookup remains owned by `gameLoop` and is not read while inactive.

Reduced pressure:

- `gameLoop.js` line count changed from `11091` to `10967`.
- Removed the local Fire particle billboard builder from `gameLoop.js`.
- Removed Fire visual tuning imports and the duplicate local
  `CHARMANDER_FIRE_VISUAL_SCALE` constant from `gameLoop.js`.
- Extended focused tests for Fire stream count, burst count and inactive
  behavior.

Validation:

```sh
npm test -- --run tests/fieldMoveBillboards.test.js
npm test -- --run tests/fieldMoveBillboards.test.js tests/gameLoopFrameRuntime.test.js tests/frameSnapshotController.test.js
git diff --check
npm run build
```

The focused field-move billboard suite passed with `15` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1555` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Water Gun Billboard Boundary

Created `app/runtime/fieldMoveRuntime/fieldMoveBillboards.js` and moved the
Water Gun spray/splash billboard geometry out of `app/runtime/gameLoop.js`.

Study path:

1. `getSquirtleWaterGunBillboards(...)` owns only visual billboard geometry for
   Water Gun stream and splash particles.
2. `gameLoop.js` still owns the Water Gun action lifecycle, stamina, queueing,
   impact handling, sound triggering and render insertion order.
3. The builder receives `getMouthPosition` as an explicit callback, so the mouth
   position remains lazy and is not read when the action is inactive.

Reduced pressure:

- `gameLoop.js` line count changed from `11192` to `11091`.
- Removed the local Water Gun particle billboard builder from `gameLoop.js`.
- Removed Water Gun particle tuning imports from `gameLoop.js`; the field-move
  billboard boundary imports the existing tuning values directly.
- Added focused tests for stream geometry, splash particle count and inactive
  behavior.

Validation:

```sh
npm test -- --run tests/fieldMoveBillboards.test.js
npm test -- --run tests/fieldMoveBillboards.test.js tests/companionStatusBillboards.test.js tests/frameSnapshotController.test.js
git diff --check
npm run build
```

The focused field-move billboard suite passed with `13` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1552` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Hydro Bot Charging Billboard Boundary

Moved Hydro Bot charging particle billboard geometry from
`app/runtime/gameLoop.js` into the existing `companions` boundary at
`app/runtime/companions/companionStatusBillboards.js`.

Study path:

1. `getSquirtleChargingBillboards(...)` owns the deterministic charging
   particle positions, sizes, UVs and alpha values.
2. `gameLoop.js` still owns the visibility decision through
   `isSquirtleWaterCharging()`, the companion world position lookup, texture
   selection and render insertion order.
3. No new file was created; this reused the companion status billboard module
   added in the previous cut.

Reduced pressure:

- `gameLoop.js` line count changed from `11224` to `11192`.
- Removed the local Hydro Bot charging billboard builder from `gameLoop.js`.
- Removed charging-particle tuning imports from `gameLoop.js`; the companions
  boundary now imports the existing tuning values directly.
- Extended focused tests for deterministic charging particle geometry and
  inactive-state behavior.

Validation:

```sh
npm test -- --run tests/companionStatusBillboards.test.js
npm test -- --run tests/companionStatusBillboards.test.js tests/companionFollowMotion.test.js tests/frameSnapshotController.test.js
git diff --check
npm run build
```

The focused companion status suite passed with `20` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1549` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Companion Status Billboard Boundary

Moved Hydro Bot stamina and Thermal Bot carbon status billboard builders from
`app/runtime/gameLoop.js` into the `companions` boundary at
`app/runtime/companions/companionStatusBillboards.js`.

Study path:

1. `getSquirtleStaminaBillboards(...)` owns the fill billboard geometry for
   Hydro Bot stamina.
2. `getCharmanderCarbonBillboards(...)` owns the back/fill billboard geometry
   for Thermal Bot carbon energy.
3. `gameLoop.js` still owns when these companion status indicators are visible,
   and passes position, textures, UVs, visual energy state and camera axes
   explicitly.

Reduced pressure:

- `gameLoop.js` line count changed from `11327` to `11224`.
- Removed the local companion status billboard builders and their private camera
  offset helper from `gameLoop.js`.
- Removed status-bar tuning imports from `gameLoop.js`; the companion boundary
  now imports the existing tuning values directly.
- Added focused tests for fill geometry, missing texture/position behavior and
  camera-depth offset behavior.

Validation:

```sh
npm test -- --run tests/companionStatusBillboards.test.js
npm test -- --run tests/companionStatusBillboards.test.js tests/frameSnapshotController.test.js tests/companionFollowMotion.test.js tests/companionLostHintRuntime.test.js
git diff --check
npm run build
```

The focused companion status suite passed with `27` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1547` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### HUD Snapshot Frame Boundary

Moved active HUD snapshot writes from `app/runtime/gameLoop.js` into the
`presentation` boundary at `app/runtime/presentation/hudSnapshotFrame.js`.

Study path:

1. `updateHudSnapshotFrame(...)` owns writing the active HUD snapshot fields
   after blockers are resolved.
2. `gameLoop.js` still owns blocker calculation, story/inventory sources and
   player-position lookup.
3. The helper receives plain frame data and does not import controls, session or
   gameplay.

Reduced pressure:

- `gameLoop.js` line count changed from `11351` to `11327`.
- Removed the local HUD snapshot writer from `gameLoop.js`.
- Added focused tests for active HUD snapshot writes and blocker behavior.

Validation:

```sh
npm test -- --run tests/hudSnapshotFrame.test.js
npm test -- --run tests/hudSnapshotFrame.test.js tests/hudPromptCopy.test.js tests/gameHudController.test.js tests/frameSnapshotController.test.js
git diff --check
npm run build
```

The focused HUD snapshot suite passed with `35` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1543` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Supply Counter Prompt Boundary

Moved supply counter snapshot, label and trigger logic from
`app/runtime/gameLoop.js` into the `presentation` boundary at
`app/runtime/presentation/supplyCounterPrompt.js`.

Study path:

1. `createSupplyCounterPromptController(...)` owns inventory count snapshots,
   fallback item labels and formatted pickup prompt triggering.
2. The controller receives `getItemLabel` and `triggerPrompt` explicitly, so it
   does not import gameplay state or the player counter prompt runtime.
3. `gameLoop.js` still owns when resource collection occurs, inventory
   mutation, pickup fly effects, audio, notices and quest counters.

Reduced pressure:

- `gameLoop.js` line count changed from `11410` to `11376`.
- Removed supply counter helper functions and the direct
  `formatResourcePickupPrompt` import from `gameLoop.js`.
- Added focused tests for snapshotting, label fallback, positive-count
  triggering and first increased inventory item triggering.

Validation:

```sh
npm test -- --run tests/supplyCounterPrompt.test.js
npm test -- --run tests/supplyCounterPrompt.test.js tests/playerCounterPromptRuntime.test.js tests/resourcePurposeCatalog.test.js
git diff --check
npm run build
```

The focused supply prompt suite passed with `13` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1538` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Dry Grass Prompt Target Boundary

Moved dry-grass prompt and hint target selection from
`app/runtime/gameLoop.js` into the `presentation` boundary at
`app/runtime/presentation/dryGrassPromptTargets.js`.

Study path:

1. `findNearbyDryGrassWorldPromptTarget(...)` owns selecting the nearest
   reachable dead grass patch backed by an active purifiable ground cell.
2. `findNearbyDryGrassHintTarget(...)` owns selecting dry grass hint anchors
   and optional Leppa Tree perimeter hint anchors.
3. `gameLoop.js` still owns whether Water Gun is equipped, whether the dry
   grass mission/request is active and whether world-space UI is visible.
4. Leppa Tree perimeter lookup remains outside the presentation module and is
   passed in explicitly, so this boundary does not import world topology.

Reduced pressure:

- `gameLoop.js` line count changed from `11547` to `11410`.
- Removed dry-grass prompt reach constants and target-selection loops from
  `gameLoop.js`.
- Added focused tests for valid/invalid dry grass targets, fallback hint ids
  and Leppa Tree perimeter dependency wiring.

Validation:

```sh
npm test -- --run tests/dryGrassPromptTargets.test.js
npm test -- --run tests/dryGrassPromptTargets.test.js tests/worldPromptCopy.test.js tests/hudPromptCopy.test.js tests/frameSnapshotController.test.js tests/worldSpeechController.test.js
git diff --check
npm run build
```

The focused presentation suite passed with `24` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1534` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Pending Placement Intent Boundary

Moved pending placement-intent policy from `app/runtime/gameLoop.js` into the
`construction` boundary at
`app/runtime/construction/pendingPlacementIntent.js`.

Study path:

1. `getActivePendingPlacementIntent(...)` owns the checks for owned pending
   placement items, already placed Straw Bed state and the existing House Kit
   unblock rule after its dependency is satisfied.
2. `hasPendingWorkbenchPlacementIntent(...)` and
   `cancelPendingWorkbenchPlacementIntent(...)` own Workbench pending-placement
   detection and cancellation.
3. `gameLoop.js` still wires those functions into placement runtime contracts
   and preserves the previous public exports via re-export.

Reduced pressure:

- `gameLoop.js` line count changed from `11577` to `11547`.
- Removed pending-placement intent rules from `gameLoop.js`.
- Added direct construction-domain tests while keeping the older
  `gameLoop.js` public export path covered.

Validation:

```sh
npm test -- --run tests/pendingPlacementIntent.test.js
npm test -- --run tests/pendingPlacementIntent.test.js tests/workbenchRuntime.test.js tests/placementConsumptionContract.test.js
git diff --check
npm run build
```

The focused construction suite passed with `14` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1530` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### World Prompt Copy Boundary

Moved pure world-prompt copy helpers from `app/runtime/gameLoop.js` into the
`presentation` boundary at `app/runtime/presentation/worldPromptCopy.js`.

Study path:

1. `getPendingPlacementPrompt(...)` owns pending-placement HUD copy for House
   Kit, Straw Bed and generic pending objects.
2. `getPendingPlacementWorldPromptText(...)` owns the shorter world-space
   pending-placement prompt copy.
3. `getPlayerInteractionWorldPromptText(...)`,
   `getRunBreadcrumbWorldPromptText(...)` and
   `getFieldToolWorldPromptText(...)` own prompt text derived from input
   modality labels.
4. `gameLoop.js` still owns deciding when each prompt is visible and where it
   is written into the frame snapshot.

Reduced pressure:

- `gameLoop.js` line count changed from `11634` to `11577`.
- Removed prompt-copy rules and placement-ready prompt formatting from
  `gameLoop.js`.
- Removed direct `getColonyFeedbackPlacementLabel` and
  `resolvePlacementReadyPrompt` imports from `gameLoop.js`.

Validation:

```sh
npm test -- --run tests/worldPromptCopy.test.js
npm test -- --run tests/worldPromptCopy.test.js tests/hudPromptCopy.test.js tests/placementPreviewPrompts.test.js tests/inputPromptResolver.test.js tests/gameHudController.test.js tests/frameSnapshotController.test.js
npm run build
```

The focused world/prompt suite passed with `45` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1526` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### HUD Prompt Copy Boundary

Moved HUD prompt-copy priority from `app/runtime/gameLoop.js` into the
`presentation` boundary at `app/runtime/presentation/hudPromptCopy.js`.

Study path:

1. `resolveHudPromptCopy(...)` owns the priority order for HUD text:
   placement prompts, pending placement, workbench rotation, destroy prompt and
   nearby gameplay prompt fallback.
2. The helper owns mode blocking for opening/cinematic/tutorial/skill/scripted
   states.
3. The helper receives `buildNearbyPrompt`, `getItemLabel`, `storyState` and
   `debug` explicitly, so it does not import gameplay, controls or global
   state.
4. `gameLoop.js` still owns resolving the actual frame targets, placement
   prompts, workbench prompts, nearby objects and when HUD snapshot data is
   written.

Reduced pressure:

- `gameLoop.js` line count changed from `11654` to `11634`.
- Removed HUD prompt priority and nearby-prompt fallback payload assembly from
  `gameLoop.js`.
- Added focused tests for blocking modes, prompt priority, nearby prompt
  context and debug payload shape.

Passed:

```sh
npm test -- --run tests/hudPromptCopy.test.js
npm test -- --run tests/hudPromptCopy.test.js tests/placementPreviewPrompts.test.js tests/inputPromptResolver.test.js tests/gameHudController.test.js tests/frameSnapshotController.test.js
git diff --check
npm run build
```

The focused HUD/prompt suite passed with `42` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1523` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Placement Preview Prompt Boundary

Moved placement-preview prompt copy from `app/runtime/gameLoop.js` into the
`construction` boundary at
`app/runtime/construction/placementPreviewPrompts.js`.

Study path:

1. `resolveFramePlacementPrompts(...)` owns the prompt text selection for Solar
   Station, Greenhouse, Thermal Cabin and House Kit placement previews.
2. The module uses the existing colony feedback contracts, Sandbots lexicon and
   input prompt resolver, so input mapping and copy sources remain unchanged.
3. `gameLoop.js` still owns when placement previews exist, pending placement
   intent resolution, workbench rotation prompts and the HUD prompt priority
   order.
4. Placement validation, footprint geometry, preview positioning and render
   ground highlights stayed in their existing modules.

Reduced pressure:

- `gameLoop.js` line count changed from `11722` to `11654`.
- Removed placement prompt branching and text assembly from `gameLoop.js`.
- Added focused tests for valid previews, blocked previews, House Kit power
  radius copy and gamepad prompt formatting.

Passed:

```sh
npm test -- --run tests/placementPreviewPrompts.test.js
npm test -- --run tests/placementPreviewPrompts.test.js tests/inputPromptResolver.test.js tests/placementPreviewVisual.test.js tests/worldObjectPlacementPreview.test.js tests/placementBlockers.test.js
git diff --check
npm run build
```

The focused placement suite passed with `31` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1519` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Construction Helper Companion Motion Boundary

Moved the construction-site helper motion formula from `app/runtime/gameLoop.js`
into the `construction` boundary at
`app/runtime/construction/constructionHelperMotion.js`.

Study path:

1. `moveConstructionHelperToLeafDen(...)` owns the bobbing position around the
   Leaf Den anchor, helper visibility, model yaw callback and squash/scale
   update.
2. `gameLoop.js` still owns which companion should help, the Charmander/Timburr
   encounter update order, model face yaw offsets and the active construction
   check.
3. The helper receives `leafDenPosition` and `getYawToward` explicitly, so it
   does not import session, controls or model-facing helpers.

Reduced pressure:

- `gameLoop.js` line count changed from `11734` to `11722`.
- Removed construction-helper motion math from `gameLoop.js`.
- Added focused tests for helper movement, guard behavior and scale clamping.

Passed:

```sh
npm test -- --run tests/constructionHelperMotion.test.js
npm test -- --run tests/constructionHelperMotion.test.js tests/constructionHouseModelInstances.test.js tests/leafDenConstructionState.test.js tests/constructionCloudEffects.test.js tests/companionFollowMotion.test.js
git diff --check
npm run build
```

The focused construction/companion suite passed with `25` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1515` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Construction Helper Motion Runtime Expansion

Expanded `app/runtime/construction/constructionHelperMotion.js`.

Classification: `construction`, specifically Leaf Den construction helper
motion wiring.

Study path:

1. `moveConstructionHelperToLeafDen(...)` remains the pure helper for the
   bobbing construction-helper motion formula.
2. `createConstructionHelperMotionRuntime(...)` now owns the wiring that was
   previously a private `gameLoop.js` wrapper: current Leaf Den position,
   current runtime seconds and model yaw callback.
3. Charmander and Timburr encounter branches still decide when construction
   helper motion is active and which offsets/yaw constants apply.
4. No motion formula, scale clamp, offset, yaw offset or sync order changed.

Removed from `gameLoop.js`:

- private `moveConstructionHelperToLeafDen(...)` wrapper;
- direct construction-helper dependency assembly from the encounter section.

Kept in `gameLoop.js`:

- construction-active gate;
- Charmander/Timburr encounter lifecycle;
- companion-specific helper offsets and model face-yaw offsets.

Tests updated:

- `tests/constructionHelperMotion.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionHelperMotion.test.js
```

The first run failed because `createConstructionHelperMotionRuntime(...)` did
not exist yet. After adding the runtime factory, the focused suite passed.

Passed:

```sh
npm test -- --run tests/constructionHelperMotion.test.js
npm test -- --run tests/constructionHelperMotion.test.js tests/companionFrameRuntime.test.js tests/companionFollowMovementRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1884` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Construction House Model Instance Boundary

Moved Leaf Den and player-house model instance sync from
`app/runtime/gameLoop.js` into the `construction` boundary at
`app/runtime/construction/constructionHouseModelInstances.js`.

Study path:

1. `syncLeafDenModelInstance(...)` owns the placed Leaf Den model pose,
   base-scale/base-yaw/ground-y caching, spawn-effect application and rotation
   tint callback invocation.
2. `ensurePlayerHouseModelInstances(...)` owns creating and registering model
   instances for extra player houses based on Leaf Den model defaults.
3. `syncPlayerHouseModelInstances(...)` owns per-house render-distance gating,
   selected-rotation override, spawn-effect application and rotation tint
   callback invocation.
4. `gameLoop.js` still owns frame timing, render-center calculation,
   `workbenchRotationRuntime` selection, render-distance policy callback and
   when the sync runs.
5. The Leaf Den placement-preview model sync stayed in `gameLoop.js` because it
   belongs to placement preview positioning and should move with a dedicated
   placement-preview boundary later.

Reduced pressure:

- `gameLoop.js` line count changed from `11856` to `11734`.
- Removed direct model-instance creation/sync details for placed Leaf Den and
  player houses from `gameLoop.js`.
- Added focused tests for Leaf Den model sync, preview-active guard, player
  house instance creation and selected player-house sync outside render
  distance.

Passed:

```sh
npm test -- --run tests/constructionHouseModelInstances.test.js
npm test -- --run tests/constructionHouseModelInstances.test.js tests/leafDenConstructionState.test.js tests/constructionCloudEffects.test.js tests/constructionBillboards.test.js tests/playerPlacementSpawnEffect.test.js
git diff --check
npm run build
```

The focused construction suite passed with `20` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1512` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Construction House Model Instance Runtime Expansion

Expanded `app/runtime/construction/constructionHouseModelInstances.js` with
`createConstructionHouseModelInstanceRuntime(...)`.

Classification: `construction`, specifically placed construction model-instance
sync wiring.

Study path:

1. The existing pure functions still own the actual model rules for Campfire
   Train House, Greenhouse, Leaf Den and player houses.
2. The new runtime owns the dependency wiring that was still duplicated in
   `gameLoop.js`: `session`, `storyState`, runtime seconds, selected rotation
   kind, render-distance policy and spawn/tint/dance callbacks.
3. `baseRenderSnapshotFrameRuntime` now receives methods from
   `constructionHouseModelInstanceRuntime` instead of local wrappers.
4. No model pose math, spawn-effect behavior, render-distance gating, tint
   behavior or frame order changed.

Removed from `gameLoop.js`:

- local `syncCampfireTrainHouseModelInstance(...)` wrapper;
- local `syncGreenhouseModelInstance(...)` wrapper;
- local `syncLeafDenModelInstance(...)` wrapper;
- local `ensurePlayerHouseModelInstances(...)` wrapper;
- local `syncPlayerHouseModelInstances(...)` wrapper;
- direct imports of the individual construction model sync functions.

Kept in `gameLoop.js`:

- composition of runtime dependencies;
- base render frame ordering;
- construction placement preview and rotation-specific wrappers not covered by
  this model-instance runtime.

Tests updated:

- `tests/constructionHouseModelInstances.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionHouseModelInstances.test.js
```

The first run failed because `createConstructionHouseModelInstanceRuntime(...)`
did not exist yet. After adding the runtime factory, the focused suite passed.

Passed:

```sh
npm test -- --run tests/constructionHouseModelInstances.test.js
npm test -- --run tests/constructionHouseModelInstances.test.js tests/baseRenderSnapshotFrame.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1885` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Leaf Den Construction State Boundary

Moved Leaf Den construction state policy from `app/runtime/gameLoop.js` into the
`construction` boundary at
`app/runtime/construction/leafDenConstructionState.js`.

Study path:

1. `isLeafDenConstructionActive(...)` owns the rule for active construction:
   construction started, house not built and Leaf Den position exists.
2. `getLeafDenConstructionProgress(...)` owns timestamp parsing and clamped
   progress calculation from story flags.
3. `isLeafDenBusyCompanionTarget(...)` owns the rule that only Charmander and
   Timburr are busy while construction is active.
4. `gameLoop.js` still owns `controls.storyState`, `session.leafDen`, time
   lookup and where the rule is queried during interaction and companion
   updates.

Reduced pressure:

- `gameLoop.js` line count changed from `11858` to `11856`.
- Removed direct knowledge of Leaf Den construction timestamp flags and helper
  companion ids from `gameLoop.js`.
- Added focused tests for active-state guards, progress clamping, invalid
  timestamps and busy companion target policy.

Passed:

```sh
npm test -- --run tests/leafDenConstructionState.test.js
npm test -- --run tests/leafDenConstructionState.test.js tests/constructionCloudEffects.test.js tests/constructionBillboards.test.js tests/playerPlacementSpawnEffect.test.js
git diff --check
npm run build
```

The focused construction suite passed with `16` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1508` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Construction Cloud Effects Boundary

Moved construction cloud visual effects from `app/runtime/gameLoop.js` into the
`construction` boundary at
`app/runtime/construction/constructionCloudEffects.js`.

Study path:

1. `ensureLeafDenConstructionCloudInstances(...)` owns creation and
   cloud-atmosphere registration for the Leaf Den construction clouds.
2. `getActiveConstructionCloudBursts(...)` owns burst progress calculation,
   expiry filtering, capping to the existing max count and session pruning.
3. `ensureConstructionCloudBurstInstances(...)` owns creation and registration
   of reusable burst cloud model instances.
4. `syncConstructionCloudBurstEffects(...)` owns burst cloud pose, scale, yaw,
   pitch and roll updates.
5. `syncLeafDenConstructionClouds(...)` owns the active/inactive cloud pose
   updates around the Leaf Den construction site.
6. `gameLoop.js` still owns when these effects are advanced in the frame,
   construction active-state checks and render order.

Reduced pressure:

- `gameLoop.js` line count changed from `11986` to `11858`.
- Moved cloud-count, burst-limit, radius, base-height and bob tuning constants
  out of `gameLoop.js` with their owning construction effect logic.
- Added focused tests for instance registration, active burst pruning/capping,
  burst cloud pose sync and Leaf Den cloud active/inactive sync.

Passed:

```sh
npm test -- --run tests/constructionCloudEffects.test.js
npm test -- --run tests/constructionCloudEffects.test.js tests/constructionBillboards.test.js tests/playerPlacementSpawnEffect.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js
git diff --check
npm run build
```

The focused construction suite passed with `19` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1504` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Construction Billboard Builder Boundary

Moved construction billboard builders from `app/runtime/gameLoop.js` into the
`construction` boundary at
`app/runtime/construction/constructionBillboards.js`.

Study path:

1. `getLeafDenConstructionBillboards(...)` now owns the Leaf Den construction
   progress-bar and star-billboard construction details.
2. `getConstructionCloudBurstBillboards(...)` now owns construction cloud-burst
   star billboard construction.
3. The moved module owns the local billboard constants for bar size, bar height,
   bar Y offset and star counts.
4. `gameLoop.js` still owns session texture lookup, active construction state,
   construction progress, render order and the frame position where these
   billboards are appended.
5. Construction cloud model syncing, construction placement validation,
   placement contracts and gameplay tuning stayed in their existing modules.

Reduced pressure:

- `gameLoop.js` line count changed from `12061` to `11986`.
- Removed detailed construction billboard geometry from `gameLoop.js`.
- Added focused tests for Leaf Den construction billboards, inactive guards,
  construction cloud burst billboards and missing-texture guards.

Passed:

```sh
npm test -- --run tests/constructionBillboards.test.js tests/playerPlacementSpawnEffect.test.js tests/worldObjectPlacementPreview.test.js tests/placementPreviewVisual.test.js
git diff --check
npm run build
```

The focused suite passed with `15` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1500` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Construction Placement Spawn Effect Boundary

Moved player placement spawn visuals from `app/runtime/gameLoop.js` into the
`construction` boundary at
`app/runtime/construction/playerPlacementSpawnEffect.js`.

Study path:

1. `updateSolarStationSpawnEffect(...)` now receives the model instance
   explicitly and owns the same scale, alpha, y-offset and tint easing.
2. `advancePlayerPlacementSpawnEffect(...)` owns spawn-effect elapsed/progress
   advancement and clears `placement.spawnEffect` at completion.
3. `applyPlayerPlacementSpawnToBillboard(...)` and
   `applyPlayerPlacementSpawnToModelInstance(...)` own visual application for
   billboards and model instances.
4. `gameLoop.js` still decides when construction models/billboards are prepared
   and keeps render order unchanged.
5. No gameplay placement rule, placement contract, placement validation or
   tuning value changed.

Reduced pressure:

- `gameLoop.js` line count changed from `12161` to `12061`.
- Removed the local placement spawn-effect implementation block from
  `gameLoop.js`.
- Added focused tests for spawn pose advancement, billboard application, model
  application and solar-station spawn completion.

Passed:

```sh
npm test -- --run tests/playerPlacementSpawnEffect.test.js
git diff --check
npm test -- --run tests/playerPlacementSpawnEffect.test.js tests/worldObjectPlacementPreview.test.js tests/worldObjectPlacementFeedback.test.js tests/placementPreviewVisual.test.js
npm run build
```

The focused suite passed with `17` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1496` passed
- `3` failed in `tests/gameplayInteractions.test.js`
  - `grows a collidable Native tree with Leafage when Grow Bot's object is set to nativeTree`
  - `grows Native tree on a safe nearby cell instead of trapping the player under it`
  - `drops Wood when a Leafage Native tree is destroyed`

Manual gameplay validation remains pending in this pass.

### Chopper Attention Cue Companion Boundary

Moved Chopper's attention-cue runtime from the loose
`app/runtime/chopperAttentionCueRuntime.js` module into the `companions`
boundary at `app/runtime/companions/chopperAttentionCueRuntime.js`.

Study path:

1. `createChopperAttentionCueRuntime(...)` still owns the cue scheduler,
   active window, repeat timing and sound-cycle consumption.
2. `resolveChopperAttentionCue(...)` now owns the companion-specific policy for
   the `wake-guide` cue.
3. `gameLoop.js` still reads live task/system-quest state and passes
   `isPlayerNearWorldPosition(...)` as an explicit dependency.
4. `gameLoop.js` still decides where the returned cue fits in the world-speech
   priority chain.
5. `app/runtime/chopperAttentionCueRuntime.js` remains a compatibility re-export
   for existing imports.

Reduced pressure:

- `gameLoop.js` line count changed from `12165` to `12161`.
- Removed the local `shouldCueChopper` policy and cue-object construction from
  `gameLoop.js`.
- Moved a loose runtime into the game-domain `companions/` boundary.

Passed:

```sh
npm test -- --run tests/chopperAttentionCueRuntime.test.js
git diff --check
npm test -- --run tests/chopperAttentionCueRuntime.test.js tests/companionLostHintRuntime.test.js tests/gameLoopFrameRuntime.test.js tests/worldSpeechController.test.js
npm run build
```

The focused suite passed with `31` tests.

Full-suite baseline:

```sh
npm test
```

The full suite completed with the existing Leafage Native Tree baseline:

- `1492` passed
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

### Thermal Cabin Home Beat Policy Extraction

Expanded `app/runtime/trainHouseDance.js` into the Train House/Thermal Cabin
runtime boundary by moving `shouldCompleteThermalCabinHomeBeat(...)` out of
`gameLoop.js`.

Classification: `construction`, specifically Thermal Cabin home-beat policy.

Study path:

1. `trainHouseDance.js` now owns both Thermal Cabin model dance mutation and
   the pure home-beat completion predicate.
2. `gameLoop.js` imports the predicate for the existing Charmander/Thermal Bot
   encounter branch and re-exports it to preserve the previous public import
   contract.
3. `tests/trainHouseRuntime.test.js` now imports
   `shouldCompleteThermalCabinHomeBeat(...)` from the domain module directly.
4. The activation distance stayed `1.9`; it was moved with the predicate and
   not retuned.

Removed from `gameLoop.js`:

- local `shouldCompleteThermalCabinHomeBeat(...)` implementation;
- local `CHARMANDER_CAMPFIRE_LIGHT_DISTANCE` constant.

Kept in `gameLoop.js`:

- the encounter-side mutation when the beat completes:
  `encounter.litCampfire`, `charmanderCampfireLit`,
  `charmanderFollowing = false` and `onCharmanderCampfireLit`;
- the existing call site order inside `updateCharmanderEncounter(...)`;
- re-export compatibility for `shouldCompleteThermalCabinHomeBeat(...)`.

Tests updated:

- `tests/trainHouseRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/trainHouseRuntime.test.js
```

The first run failed because the domain module did not export
`shouldCompleteThermalCabinHomeBeat(...)` yet. After moving the predicate, the
focused suite passed.

Passed:

```sh
npm test -- --run tests/trainHouseRuntime.test.js
npm test -- --run tests/trainHouseRuntime.test.js tests/constructionHouseModelInstances.test.js tests/baseRenderSnapshotFrame.test.js tests/worldSpeechFrameState.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `308` test files passed, `1` failed
- `1884` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

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

### Companion Model Sync Runtime Extraction

Created the `companions/model sync` boundary with
`createCompanionModelSyncRuntime()` in
`app/runtime/companions/companionModelSyncRuntime.js`.

Study path:

1. `startGameLoop()` still wires the runtime and keeps `frame(now)` as the
   temporal orchestrator.
2. `gameLoop.js` now passes the existing companion scale constants into the
   runtime instead of hardcoding or changing tuning.
3. Squirtle, Bulbasaur, Charmander and Timburr model-instance synchronization
   moved out of `gameLoop.js`.
4. Squirtle repair-box visibility and interactable-position forwarding moved
   with the Squirtle model sync because they are part of the same visual model
   synchronization step.
5. Bulbasaur, Charmander and Timburr dismantled repair-module forwarding now
   goes through the companion model sync runtime.
6. Existing action and encounter logic still decides movement, yaw, abilities,
   impact timing and state transitions in `gameLoop.js`; this cut only changes
   the owner of model-instance mutation.

Removed from `gameLoop.js`:

- `syncSquirtleModelInstance()`
- `syncBulbasaurModelInstance()`
- `syncCharmanderModelInstance()`
- `syncTimburrModelInstance()`
- `syncCompanionRepairModules()`

Kept in `gameLoop.js`:

- field move action rules for Water Gun, Leafage and Fire;
- encounter movement/state transitions;
- repair-box reveal opening orchestration;
- `getEncounterRepairBoxPosition(...)`, because multiple composed runtimes
  still receive it as an explicit dependency.

Tests added:

- `tests/companionModelSyncRuntime.test.js`

Passed:

```sh
npm test -- --run tests/companionModelSyncRuntime.test.js
npm test -- --run tests/companionModelSyncRuntime.test.js tests/companionGroundPatrolFrameRuntime.test.js tests/squirtleReassemblyRuntime.test.js tests/companionFrameRuntime.test.js tests/companionRepairBoxModelRuntime.test.js
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `291` test files passed, `1` failed
- `1772` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Bulbasaur Workbench Guide Runtime Extraction

Created the `companions/bulbasaur workbench guide` boundary with
`createBulbasaurWorkbenchGuideRuntime()` in
`app/runtime/companions/bulbasaurWorkbenchGuideRuntime.js`.

Study path:

1. `startGameLoop()` wires the runtime with the same guide tuning constants
   that previously lived directly inside `gameLoop.js`.
2. The runtime owns the guide-active policy:
   `bulbasaurWorkbenchGuideAvailable`, missing Workbench DIY recipes and the
   presence of the Bulbasaur encounter.
3. The runtime owns the ramp-collider path calculation for the guide approach.
4. The runtime owns the per-frame guide movement, waypoint progression, jump
   cancellation and model yaw update.
5. `gameLoop.js` still decides when `updateBulbasaurEncounter(...)` runs and
   still syncs the model through `companionModelSyncRuntime` after movement.

Removed from `gameLoop.js`:

- `getWorkbenchRampCollider()`
- `getBulbasaurWorkbenchGuidePath()`
- `isBulbasaurWorkbenchGuideActive()`
- `advanceBulbasaurAlongWorkbenchGuide(...)`

Kept in `gameLoop.js`:

- Bulbasaur reveal/encounter lifecycle;
- the Workbench guide branch inside `updateBulbasaurEncounter(...)`;
- follow/action blockers that now query `bulbasaurWorkbenchGuideRuntime`.

Tests added:

- `tests/bulbasaurWorkbenchGuideRuntime.test.js`

Passed:

```sh
npm test -- --run tests/bulbasaurWorkbenchGuideRuntime.test.js
npm test -- --run tests/bulbasaurWorkbenchGuideRuntime.test.js tests/companionGroundPatrolFrameRuntime.test.js tests/companionFollowMotion.test.js tests/companionFrameRuntime.test.js tests/companionModelSyncRuntime.test.js
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `292` test files passed, `1` failed
- `1777` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Companion Ability Resources Runtime Extraction

Created the `fieldMoveRuntime/companion ability resources` boundary with
`createCompanionAbilityResourcesRuntime()` in
`app/runtime/fieldMoveRuntime/companionAbilityResourcesRuntime.js`.

Study path:

1. `startGameLoop()` wires the runtime with `session`, `controls`,
   `clamp01`, `moveValueToward` and the existing queued-Water-Gun callback.
2. The runtime owns Hydro Bot Water Gun use count, derived level, stamina max,
   stamina consumption, recharge timing, visual easing and speed/duration
   scaling.
3. The runtime owns Thermal Bot Carbon use count, inventory-derived energy
   ratio and visual easing.
4. `gameLoop.js` still owns Water Gun and Fire action phases, targeting,
   movement, impact application and field-move dispatch.
5. Companion presentation still receives the same getter-shaped callbacks, now
   backed by the resources runtime.

Removed from `gameLoop.js`:

- `getSquirtleWaterGunUseCount()`
- `getSquirtleWaterGunLevel()`
- `getSquirtleWaterStaminaMax()`
- `getSquirtleWaterGunSpeedMultiplier()`
- `getSquirtleWaterGunSprayDuration(...)`
- `getSquirtleWaterGunImpactTime(...)`
- `recordSquirtleWaterGunUse()`
- `getSquirtleWaterStaminaState()`
- `isSquirtleWaterCharging()`
- `beginSquirtleWaterRecharge()`
- `consumeSquirtleWaterStamina()`
- `consumeSquirtleWaterStaminaForInstantAction()`
- `updateSquirtleWaterStamina(...)`
- `getCharmanderCarbonUseCount()`
- `getCharmanderCarbonEnergyRatio()`
- `getCharmanderCarbonEnergyState()`
- `updateCharmanderCarbonEnergy(...)`

Kept in `gameLoop.js`:

- Water Gun queue/action lifecycle;
- Water Gun target movement and impact;
- Fire action lifecycle and impact;
- render/presentation orchestration.

Tests added:

- `tests/companionAbilityResourcesRuntime.test.js`

Passed:

```sh
npm test -- --run tests/companionAbilityResourcesRuntime.test.js
npm test -- --run tests/companionAbilityResourcesRuntime.test.js tests/companionFrameRuntime.test.js tests/companionPresentationFrame.test.js tests/companionStatusBillboards.test.js tests/fieldMoveBillboards.test.js
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `293` test files passed, `1` failed
- `1783` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Water Gun Runtime Extraction

Created the `fieldMoveRuntime/water gun` boundary with
`createWaterGunRuntime()` in
`app/runtime/fieldMoveRuntime/waterGunRuntime.js`.

Study path:

1. `startGameLoop()` still wires all dependencies and keeps frame order.
2. The Water Gun runtime owns Hydro Bot Water Gun queue initialization,
   duplicate-target detection, action start, queued-action advancement,
   pending ground-cell reporting, approach movement, spray timing, impact
   timing, blocked-path cancellation and action cleanup.
3. `gameLoop.js` still owns the Water Gun impact side effect through
   `applySquirtleWaterGunImpact(...)`, because that path touches harvest,
   inventory, story flags, drops, sound and grass state.
4. Companion patrol, companion frame update and ground-cell highlight now ask
   the runtime for queue/update/pending state instead of reading queue rules
   implemented inside `gameLoop.js`.

Removed from `gameLoop.js`:

- `getSquirtleWaterGunQueue()`
- `isSquirtleWaterGunCellPending(...)`
- `enqueueSquirtleWaterGunAction(...)`
- `startSquirtleWaterGunAction(...)`
- local queued-Water-Gun advancement logic
- `getPendingSquirtleWaterGunGroundCells()`
- `updateSquirtleWaterGunAction(...)`

Kept in `gameLoop.js`:

- `applySquirtleWaterGunImpact(...)`;
- direct fallback harvesting when Hydro Bot is unavailable;
- instant Water Gun actions against trees/palms;
- Water Gun SFX burst orchestration.

Tests added:

- `tests/waterGunRuntime.test.js`

Passed:

```sh
npm test -- --run tests/waterGunRuntime.test.js
npm test -- --run tests/waterGunRuntime.test.js tests/companionFrameRuntime.test.js tests/companionGroundPatrolFrameRuntime.test.js tests/companionPresentationFrame.test.js tests/groundCellHighlightFrameState.test.js tests/companionAbilityResourcesRuntime.test.js
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `294` test files passed, `1` failed
- `1787` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Fire Runtime Extraction

Created the `fieldMoveRuntime/fire` boundary with `createFireRuntime()` in
`app/runtime/fieldMoveRuntime/fireRuntime.js`.

Study path:

1. `startGameLoop()` wires the runtime with the existing Charmander encounter,
   busy-state policy, Carbon availability check, approach-position resolver,
   model yaw resolver, movement blocker and model sync callback.
2. The Fire runtime owns Thermal Bot Fire action start, action shape,
   approach movement, blocked-path cancellation, spray timing, impact timing
   and action cleanup.
3. `gameLoop.js` still owns `applyCharmanderFireImpact(...)`, because the
   impact path touches harvest, inventory, HUD, Carbon counters and ground
   feedback.
4. Companion frame update now delegates the Fire action update to the runtime.

Removed from `gameLoop.js`:

- `startCharmanderFireAction(...)`
- `updateCharmanderFireAction(...)`
- direct use of `CHARMANDER_FIRE_SPEED`
- direct use of `CHARMANDER_FIRE_ARRIVE_DISTANCE`
- direct use of `CHARMANDER_FIRE_IMPACT_TIME`
- direct use of `CHARMANDER_FIRE_SPRAY_DURATION`

Kept in `gameLoop.js`:

- `applyCharmanderFireImpact(...)`;
- `hasCharmanderFireCarbon()`, because it owns the existing HUD notice;
- Fire fallback harvest behavior when Thermal Bot is unavailable.

Tests added:

- `tests/fireRuntime.test.js`

Passed:

```sh
npm test -- --run tests/fireRuntime.test.js
npm test -- --run tests/fireRuntime.test.js tests/companionFrameRuntime.test.js tests/companionPresentationFrame.test.js tests/fieldMoveBillboards.test.js tests/companionAbilityResourcesRuntime.test.js tests/waterGunRuntime.test.js
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `295` test files passed, `1` failed
- `1791` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Leafage Runtime Extraction

Created the `fieldMoveRuntime/leafage` boundary with
`createLeafageRuntime()` in
`app/runtime/fieldMoveRuntime/leafageRuntime.js`.

Study path:

1. `startGameLoop()` wires the runtime with the existing Bulbasaur encounter,
   Workbench-guide busy policy, approach-position resolver, model yaw resolver,
   movement blocker and model sync callback.
2. The Leafage runtime owns Grow Bot Leafage action start, action shape,
   approach movement, blocked-path cancellation, cast timing, impact timing
   and action cleanup.
3. `gameLoop.js` still owns `applyBulbasaurLeafageImpact(...)`, because the
   impact path touches harvest, habitat state, ground patches, drops and
   instance-object SFX.
4. Companion frame update now delegates the Leafage action update to the
   runtime.

Removed from `gameLoop.js`:

- `startBulbasaurLeafageAction(...)`
- `updateBulbasaurLeafageAction(...)`
- direct use of `BULBASAUR_LEAFAGE_SPEED`
- direct use of `BULBASAUR_LEAFAGE_ARRIVE_DISTANCE`
- direct use of `BULBASAUR_LEAFAGE_IMPACT_TIME`
- direct use of `BULBASAUR_LEAFAGE_CAST_DURATION`

Kept in `gameLoop.js`:

- `applyBulbasaurLeafageImpact(...)`;
- Leafage fallback harvest behavior when Grow Bot is unavailable.

Tests added:

- `tests/leafageRuntime.test.js`

Passed:

```sh
npm test -- --run tests/leafageRuntime.test.js
npm test -- --run tests/leafageRuntime.test.js tests/fireRuntime.test.js tests/waterGunRuntime.test.js tests/companionFrameRuntime.test.js tests/companionPresentationFrame.test.js tests/fieldMoveBillboards.test.js tests/companionAbilityResourcesRuntime.test.js
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `296` test files passed, `1` failed
- `1795` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Build Block Runtime Extraction

Extended the existing `fieldMoveRuntime/buildBlock` boundary with
`createBuildBlockRuntime()` in
`app/runtime/fieldMoveRuntime/buildBlockRuntime.js`.

Study path:

1. `startGameLoop()` wires the runtime with the existing Timburr encounter,
   skill/story-state checks, free-block target resolver, approach-position
   resolver, construction blockers, blocked-approach policy, movement helper,
   yaw resolver and impact callback.
2. The Build Block runtime owns Builder Bot action start, validation outcome
   forwarding, action shape, approach movement, blocked-path cancellation,
   cast-from-blocked-approach transition, cast timing, impact timing and action
   cleanup.
3. `gameLoop.js` still owns `applyTimburrBuildBlockImpact(...)`, because the
   impact path touches construction controllers, inventory, build-zone state,
   player displacement, feedback and sound.
4. `constructionPlacementFrameRuntime` keeps the same callback name
   `startTimburrBuildBlockAction`, now backed by the runtime.

Removed from `gameLoop.js`:

- `startTimburrBuildBlockAction(...)`
- `updateTimburrBuildBlockAction(...)`
- direct use of `TIMBURR_BUILD_BLOCK_SPEED`
- direct use of `TIMBURR_BUILD_BLOCK_ARRIVE_DISTANCE`
- direct use of `TIMBURR_BUILD_BLOCK_IMPACT_TIME`
- direct use of `TIMBURR_BUILD_BLOCK_CAST_DURATION`

Kept in `gameLoop.js`:

- `applyTimburrBuildBlockImpact(...)`;
- free-block target resolution and preview state;
- construction placement side effects and notices.

Tests added:

- `tests/buildBlockRuntime.test.js`

Passed:

```sh
npm test -- --run tests/buildBlockRuntime.test.js
npm test -- --run tests/buildBlockRuntime.test.js tests/constructionPlacementFrameRuntime.test.js tests/companionFrameRuntime.test.js tests/placementBlockers.test.js tests/fieldMoveBillboards.test.js tests/leafageRuntime.test.js tests/fireRuntime.test.js tests/waterGunRuntime.test.js
npm run build
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `297` test files passed, `1` failed
- `1800` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Field Move Impact Runtime Extraction

Created the `fieldMoveRuntime/impact` boundary with
`createFieldMoveImpactRuntime()` in
`app/runtime/fieldMoveRuntime/fieldMoveImpactRuntime.js`.

Study path:

1. `startGameLoop()` still wires the Water Gun, Fire and Leafage runtimes.
2. Those runtimes now call impact callbacks owned by
   `createFieldMoveImpactRuntime()`.
3. The impact runtime owns the repeated domain side effects for Water Gun,
   Leafage and Fire impact resolution: harvest call shape, patch transition SFX,
   Fire inventory sync, Carbon counter prompt, Fire ground feedback and Squirtle
   stamina-use recording.
4. `gameLoop.js` still owns `performGameplayHarvestAction(...)`, because it is
   also used by primary interaction handling and remains coupled to inventory,
   quest counters and pickup prompts.

Removed from `gameLoop.js`:

- `applySquirtleWaterGunImpact(...)`
- `applyBulbasaurLeafageImpact(...)`
- `applyCharmanderFireImpact(...)`
- `findGrassPatchForGroundCell(...)`
- `isAliveGrassPatchForGroundCell(...)`

Kept in `gameLoop.js`:

- `performGameplayHarvestAction(...)`;
- `hasGroundPatchForCellId(...)`, because target resolution still uses it;
- primary action routing and fallback harvest behavior.

Tests added:

- `tests/fieldMoveImpactRuntime.test.js`

Passed:

```sh
npm test -- --run tests/fieldMoveImpactRuntime.test.js
npm test -- --run tests/fieldMoveImpactRuntime.test.js tests/waterGunRuntime.test.js tests/fireRuntime.test.js tests/leafageRuntime.test.js tests/buildBlockRuntime.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `298` test files passed, `1` failed
- `1803` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Field Move Ground Targets Extraction

Created the `fieldMoveRuntime/ground-targets` boundary with
`app/runtime/fieldMoveRuntime/fieldMoveGroundTargets.js`.

Study path:

1. The module owns pure target-selection policies for field-move ground cells:
   free-roam restoration cells, already-resolved feedback cells, Grow First
   Habitat guidance cells, Boulder-Shaded Tall Grass guidance cells and the
   dry-grass Hydro mission visibility policy.
2. `gameLoop.js` now wires session arrays into those helpers but no longer owns
   the filtering, distance sorting, task-state checks or highlight state
   decoration.
3. Presentation modules keep receiving the same callback names through
   `resolveGameplayGroundGuidanceFrameState(...)`; only the implementation
   behind the callbacks moved.

Removed from `gameLoop.js`:

- `isDryGrassHydroMissionActive(...)`
- `findNearbyFeedbackGroundCell(...)`
- `isFreeRoamRestorationGroundCellCandidate(...)`
- `buildFreeRoamRestorationGroundCells(...)`
- `getFreeRoamRestorationGroundCells(...)`
- `hasGrowFirstHabitatObjective(...)`
- `isGrowFirstHabitatTaskActive(...)`
- `getGrowFirstHabitatMarkedCellCount(...)`
- `getGrowFirstHabitatReferencePosition(...)`
- `getGrowFirstHabitatTaskGroundCells(...)`
- `isBoulderShadedTallGrassTaskActive(...)`
- `getBoulderShadedGroundCellDistanceEntries(...)`
- `getBoulderShadedTaskGroundCells(...)`
- `hasGroundPatchForCellId(...)`
- `findAlreadyResolvedFieldMoveGroundCell(...)`

Kept in `gameLoop.js`:

- session wiring for ground-cell arrays and patch arrays;
- primary action routing;
- presentation-frame orchestration.

Tests added:

- `tests/fieldMoveGroundTargets.test.js`

Passed:

```sh
npm test -- --run tests/fieldMoveGroundTargets.test.js
npm test -- --run tests/fieldMoveGroundTargets.test.js tests/groundCellHighlightFrameState.test.js tests/worldSpacePresentationFrameState.test.js tests/fieldMoveImpactRuntime.test.js tests/waterGunRuntime.test.js tests/fireRuntime.test.js tests/leafageRuntime.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `299` test files passed, `1` failed
- `1808` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Workbench Rotation Targets Extraction

Created the `construction/workbench-rotation-targets` boundary with
`app/runtime/construction/workbenchRotationTargets.js`.

Study path:

1. `gameLoop.js` still owns user-facing side effects for Workbench rotation:
   selection notices, confirmation/cancel sounds, Solar Station visual sync and
   calls into `createWorkbenchRotationRuntime()`.
2. The new construction module owns pure candidate and distance policy:
   which placed Workbench constructions are rotatable, how target size is
   resolved, how edge distance is calculated, how trigger distance uses build
   grid cell size and which candidate is nearest.
3. Existing callbacks keep their names for construction placement,
   prompt frame state and ground-cell highlight frame state.

Removed from `gameLoop.js`:

- candidate construction rules for Solar Station, Thermal Cabin, House and
  player houses;
- target-size override resolution;
- edge-distance math;
- trigger-distance tile margin math;
- nearest-candidate reduction.

Kept in `gameLoop.js`:

- small wrapper functions that wire `session`, footprints and labels;
- rotation selection/confirm/cancel side effects;
- Solar Station rotation visual sync;
- `createWorkbenchRotationRuntime()` state management.

Tests added:

- `tests/workbenchRotationTargets.test.js`

Passed:

```sh
npm test -- --run tests/workbenchRotationTargets.test.js
npm test -- --run tests/workbenchRotationTargets.test.js tests/workbenchRotationRuntime.test.js tests/constructionPlacementFrameRuntime.test.js tests/constructionHouseModelInstances.test.js tests/gameplayPromptTargetFrameState.test.js tests/groundCellHighlightFrameState.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `300` test files passed, `1` failed
- `1812` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Supply Pickup Feedback Runtime Extraction

Created the `presentation/supply-pickup-feedback` boundary with
`app/runtime/presentation/supplyPickupFeedbackRuntime.js`.

Study path:

1. `gameLoop.js` still owns inventory collection orchestration and delegates
   passive resource collection through `createPlayerResourceCollectionFrameRuntime()`.
2. The new presentation runtime owns HUD-side feedback for supply pickups:
   projecting source positions to viewport origins, queueing fly-to-slot
   animations, detecting gained supply counts, playing pickup SFX for counted
   feedback, syncing inventory UI, pushing notices and triggering supply
   counter prompts.
3. The runtime depends explicitly on `hud`, `audio`, `controls`, `session`,
   `camera`, `worldCanvas` and `supplyCounterPromptController`; it does not
   import or mutate `gameLoop` state.

Removed from `gameLoop.js`:

- `queueSupplyPickupFlyItems(...)`
- `queueChangedSupplyPickupFlyItems(...)`
- `pushSupplyResourceCollectFeedback(...)`
- direct import of `resolveSupplyPickupViewportOrigin(...)`

Kept in `gameLoop.js`:

- resource collection timing;
- previous/next inventory snapshot logic;
- calls to `supplyCounterPromptController.triggerChanged(...)`;
- wiring of resource feedback callbacks into player collection.

Tests added:

- `tests/supplyPickupFeedbackRuntime.test.js`

Passed:

```sh
npm test -- --run tests/supplyPickupFeedbackRuntime.test.js
npm test -- --run tests/supplyPickupFeedbackRuntime.test.js tests/playerResourceCollectionFrame.test.js tests/supplyPickupViewportOrigin.test.js tests/gameHudController.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `301` test files passed, `1` failed
- `1816` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### NPC Conversation Focus Runtime Extraction

Created the `npcs/conversation-focus` boundary with
`app/runtime/npcs/npcConversationFocusRuntime.js`.

Study path:

1. The runtime owns conversation-facing behavior for NPC actors and Squirtle's
   interactable model.
2. The runtime also owns the deferred dialogue camera focus gate, including the
   checks for active dialogue and scripted interactions.
3. `gameLoop.js` still wires dependencies and passes the runtime handler into
   gameplay interactions; it no longer implements the conversation-facing rule.

Removed from `gameLoop.js`:

- `faceInteractionTargetTowardPlayer(...)`
- `focusNpcConversationWhenDialogueOpens(...)`
- duplicated `onNpcInteractionStart` handler bodies in the two gameplay
  interaction calls.

Kept in `gameLoop.js`:

- dependency wiring for dialogue camera, dialogue state, controls and Squirtle
  yaw helpers;
- the same `onNpcInteractionStart` integration points.

Tests added:

- `tests/npcConversationFocusRuntime.test.js`

Passed:

```sh
npm test -- --run tests/npcConversationFocusRuntime.test.js
npm test -- --run tests/npcConversationFocusRuntime.test.js tests/companionFrameRuntime.test.js tests/gameplayInteractions.test.js
npm run build
npm test
```

The focused `gameplayInteractions` run completed with the existing Leafage
Native Tree baseline:

- `2` test files passed, `1` failed
- `120` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

`npm test` completed with the existing Leafage Native Tree baseline:

- `304` test files passed, `1` failed
- `1833` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Train House Music Runtime Extraction

Created the `audio/train-house-music` boundary with
`app/runtime/audio/trainHouseMusicRuntime.js`.

Study path:

1. The runtime owns Thermal Cabin music activation, distance volume resolution
   and object-music activity reporting.
2. `gameLoop.js` keeps frame timing and calls
   `trainHouseMusicRuntime.update(nowSeconds)` at the same presentation-frame
   point where the local function used to run.
3. The public `resolveTrainHouseMusicVolume(...)` API remains available from
   `gameLoop.js` through a re-export, so existing callers do not need to move
   immediately.
4. The audio wiring order was corrected so `createGameplayAudioRuntime(...)`
   runs before runtimes that receive `audio`; this removes a possible TDZ
   `ReferenceError` without changing frame order.

Removed from `gameLoop.js`:

- local `resolveTrainHouseMusicVolume(...)` implementation;
- local `updateTrainHouseMusic(...)` implementation;
- direct imports of Thermal Cabin music tuning constants.

Kept in `gameLoop.js`:

- composition-root wiring for `audio`, `session`, `controls` and
  `gameplay.musicRuntime`;
- the existing presentation-frame update order.

Tests added:

- `tests/trainHouseRuntime.test.js` now covers inactive cabin music gating and
  active cabin object-music reporting through `createTrainHouseMusicRuntime()`.

Passed:

```sh
npm test -- --run tests/trainHouseRuntime.test.js
npm test -- --run tests/trainHouseRuntime.test.js tests/audioLifecycle.test.js
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `304` test files passed, `1` failed
- `1835` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Rustling Grass Event Runtime Extraction

Created the `world/rustling-grass-event` boundary with
`app/runtime/world/rustlingGrassEventRuntime.js`.

Study path:

1. The runtime owns the delayed world-state transition from
   `pendingRustlingGrassCellId` to `rustlingGrassCellId`.
2. `gameLoop.js` still decides when the world event is allowed to advance via
   `canAdvanceRustlingGrass`, preserving the existing frame policy boundary.
3. `gameLoop.js` now calls
   `rustlingGrassEventRuntime.update({ deltaTime, canAdvance })` from the same
   early gameplay control frame point where the local function used to run.

Removed from `gameLoop.js`:

- local `updateRustlingGrassEvent(...)` implementation;
- direct mutation details for `rustlingGrassDelay`,
  `pendingRustlingGrassCellId` and `rustlingGrassCellId`.

Kept in `gameLoop.js`:

- frame ordering;
- blocker/policy calculation for `canAdvanceRustlingGrass`;
- composition-root wiring to `controls.storyState`.

Tests added:

- `tests/rustlingGrassEventRuntime.test.js`

Passed:

```sh
npm test -- --run tests/rustlingGrassEventRuntime.test.js
npm test -- --run tests/rustlingGrassEventRuntime.test.js tests/gameLoopFramePolicies.test.js
npm test -- --run tests/gameplayInteractions.test.js -t rustling
npm run build
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `305` test files passed, `1` failed
- `1839` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Tree Revival Leaf Burst Frame Runtime Extraction

Created the `presentation/tree-revival-leaf-burst-frame` boundary with
`app/runtime/presentation/treeRevivalLeafBurstFrameRuntime.js`.

Study path:

1. The existing `treeRevivalLeafBurstRuntime` still owns the particle state,
   physics and billboard shape.
2. The new presentation frame runtime owns the game-session presentation
   composition: detecting newly revived palms/Leppa tree from a snapshot,
   forwarding passive updates and appending the resulting billboards to the
   render frame.
3. `gameLoop.js` still owns harvest orchestration and garden progress checks;
   it now delegates leaf-burst presentation details to the runtime.

Removed from `gameLoop.js`:

- `queueTreeRevivalLeafBurstsForNewlyRevivedTrees(...)`;
- `appendTreeRevivalLeafBurstBillboards(...)`;
- direct update of `treeRevivalLeafBurstRuntime` from the passive effect frame.

Kept in `gameLoop.js`:

- tree revival snapshot timing before harvest;
- garden progress autosave notification;
- the same passive effect and render-frame call sites.

Tests added:

- `tests/treeRevivalLeafBurstFrameRuntime.test.js`

Passed:

```sh
npm test -- --run tests/treeRevivalLeafBurstFrameRuntime.test.js
npm test -- --run tests/treeRevivalLeafBurstFrameRuntime.test.js tests/treeRevivalLeafBurstRuntime.test.js tests/natureRevivalEffects.test.js
npm test -- --run tests/gameplayInteractions.test.js -t "revives the Leppa tree|waters nearby trees|collects a Pulse Berry"
npm run build
npm test
```

The broader filtered run below also hit the existing Native Tree baseline:

```sh
npm test -- --run tests/treeRevivalLeafBurstFrameRuntime.test.js tests/treeRevivalLeafBurstRuntime.test.js tests/natureRevivalEffects.test.js tests/gameplayInteractions.test.js -t "revives|tree|rustling|Leafage"
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1842` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Landscape Cut Effect Renderables Runtime Extraction

Expanded the existing `presentation/landscape-cut-effect` responsibility in
`app/runtime/landscapeCutEffectRuntime.js` without adding a new file.

Study path:

1. `landscapeCutEffectRuntime` already owned queued cut-effect state and pose
   timing.
2. It now also owns renderable projection for that effect: garden model
   instances, native-tree model instances, tall/dead grass model instances and
   billboard fallback.
3. `gameLoop.js` still decides when an interaction should queue the effect and
   still passes the current `session`, `nextFrame` and tall-grass helpers
   explicitly.

Removed from `gameLoop.js`:

- `queueLandscapeCutEffect(...)`;
- `appendLandscapeCutEffectRenderables(...)`;
- direct branching over cut-effect render target types.

Kept in `gameLoop.js`:

- destroy/interact orchestration;
- garden progress comparison;
- explicit call to `landscapeCutEffectRuntime.appendRenderables(...)` in the
  same render-frame point.

Tests updated:

- `tests/landscapeCutEffectRuntime.test.js`

Passed:

```sh
npm test -- --run tests/landscapeCutEffectRuntime.test.js
npm test -- --run tests/gameplayInteractions.test.js -t "destroys a nearby Leafage-instantiated object|destroys a nearby Leafage-instantiated flower|destroys restored|destroys dry grass"
npm run build
npm test
```

The broader filtered destroy run also hit one existing Native Tree baseline
failure:

```sh
npm test -- --run tests/landscapeCutEffectRuntime.test.js tests/natureRenderFrame.test.js tests/gameplayInteractions.test.js -t "destroys|removable|Leafage-instantiated|destroy"
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1844` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Companion Construction Blocker Runtime Extraction

Expanded the existing `gameplay/placement-blockers` boundary in
`app/gameplay/placementBlockers.js` instead of creating another runtime file.

Classification: `bot/companion motion` plus `construction`, focused only on
companion movement permission against construction terrain colliders.

Study path:

1. `placementBlockers.js` already owns construction terrain colliders and
   blocked-position checks.
2. `createCompanionConstructionBlockerRuntime(...)` now composes those checks
   into the companion-facing operations that `gameLoop.js` previously owned:
   get blockers, test blocked positions, try movement and report blocked
   actions.
3. `startGameLoop()` remains the composition root. It wires the runtime with
   `getPlayerConstructionTerrainColliders`, the existing cancel sound and HUD
   notice callback.

Removed from `gameLoop.js`:

- `getCompanionPositionConstructionBlockers(...)`;
- `isCompanionPositionBlockedByConstruction(...)`;
- `tryMoveCompanionToPosition(...)`;
- `cancelBlockedCompanionAction(...)`;
- direct blocker-notice string construction for companion path blocking.

Kept in `gameLoop.js`:

- `getPlayerConstructionTerrainColliders(...)`, because free-block preview,
  debug and placement calculations still share that construction collider
  snapshot;
- field-move/runtime wiring order;
- all placement, field-move and companion tuning.

Tests updated:

- `tests/placementBlockers.test.js`

TDD sequence:

```sh
npm test -- --run tests/placementBlockers.test.js
```

The first run failed because `createCompanionConstructionBlockerRuntime` did not
exist yet. After adding the factory, the focused test passed.

Passed:

```sh
npm test -- --run tests/placementBlockers.test.js
npm test -- --run tests/placementBlockers.test.js tests/companionFollowMovementRuntime.test.js tests/waterGunRuntime.test.js tests/fireRuntime.test.js tests/leafageRuntime.test.js tests/buildBlockRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1845` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Construction Placement Preview Position Sync Extraction

Expanded the existing `constructionPlacementFrameRuntime` boundary in
`app/runtime/construction/constructionPlacementFrameRuntime.js`.

Classification: `construction`, focused on frame-level placement-preview
position sync.

Study path:

1. `gameLoop.js` previously owned the rule that keeps active placement previews
   offset from the player, applies the default forward spacing for near-player
   previews and clamps preview positions to finite bounds.
2. `syncPlacementPreviewPositionToPlayer(...)` now owns that rule as a tested
   construction helper.
3. `createConstructionPlacementFrameRuntime(...)` exposes
   `syncPlacementPreviewPositionToPlayer(preview, defaultForwardDistance)` after
   `startGameLoop()` injects `getPlayerPosition` and `getMovementAxes`.

Removed from `gameLoop.js`:

- local `syncPlacementPreviewPositionToPlayer(...)`;
- local `clampNumber(...)`, which was only used by that preview sync rule;
- direct camera-axis/default-forward placement offset calculation.

Kept in `gameLoop.js`:

- the per-preview update functions for Solar Station, House Kit, Thermal Cabin
  and Greenhouse;
- placement validation, snapped-position calculation and model-instance visual
  mutation;
- frame order and all placement tuning constants.

Tests updated:

- `tests/constructionPlacementFrameRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
```

The first run failed because the helper and runtime method did not exist yet.
After adding them, the focused test passed.

Passed:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
npm test -- --run tests/constructionPlacementFrameRuntime.test.js tests/placementGeometry.test.js tests/placementPreviewVisual.test.js tests/placementPreviewPrompts.test.js tests/freeBlockPreview.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1848` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Rectangular Construction Preview Frame Extraction

Expanded the existing `constructionPlacementFrameRuntime` boundary again in
`app/runtime/construction/constructionPlacementFrameRuntime.js`.

Classification: `construction`, focused on the shared Campfire/Greenhouse
placement-preview frame rule.

Study path:

1. Campfire and Greenhouse previews shared the same sequence in `gameLoop.js`:
   sync preview to player, snap to placement grid, compute collision footprint,
   validate against blockers, update preview state and sync the model instance
   visual.
2. `updateRectangularConstructionPlacementPreview(...)` now owns that shared
   sequence.
3. `gameLoop.js` keeps only the domain-specific configuration: which preview,
   which instance, which footprints, which model-state keys and whether an
   inactive preview should hide the model instance.

Removed from `gameLoop.js`:

- duplicated validation/snap/effective-size logic for Campfire and Greenhouse
  previews;
- duplicated model-instance visual sync for `trainHouse*` and `greenhouse*`
  preview state;
- direct `swayStrength = 0` detail for the Thermal Cabin preview.

Kept in `gameLoop.js`:

- per-feature wrapper functions `updateCampfirePlacementPreview(...)` and
  `updateGreenhousePlacementPreview(...)`;
- callbacks for blockers and `validateBuildingKitPlacement(...)`, avoiding a
  new import from construction runtime into `world/islandWorld.js`;
- Solar Station and House Kit preview rules, because they still have distinct
  energy/site-choice behavior.

Tests updated:

- `tests/constructionPlacementFrameRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
```

The first run failed because `updateRectangularConstructionPlacementPreview`
did not exist yet. After adding the helper, the focused test passed.

Passed:

```sh
npm test -- --run tests/constructionPlacementFrameRuntime.test.js
npm test -- --run tests/constructionPlacementFrameRuntime.test.js tests/placementGeometry.test.js tests/placementPreviewVisual.test.js tests/placementPreviewPrompts.test.js tests/freeBlockPreview.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with the existing Leafage Native Tree baseline:

- `306` test files passed, `1` failed
- `1850` tests passed, `3` failed in `tests/gameplayInteractions.test.js`

Manual gameplay validation remains pending for this cut.

### Foundation Build Zone Runtime Wiring

Created `createFoundationBuildZoneRuntime(...)` inside the existing
`app/runtime/construction/foundationBuildZone.js` domain module.

Boundary classification: `construction`, focused on Builder Bot foundation
zone state, blocker source collection, active-zone resolution, completion
effects and Free Block foundation policy.

Why this cut was larger:

1. The previous placement-blocker cut removed local wrappers but only changed
   line count modestly.
2. This cut moved a full responsibility cluster out of `gameLoop.js`, not just
   one helper.
3. The runtime still receives explicit dependencies from `startGameLoop()`, so
   `gameLoop.js` remains the composition root and the frame order did not move.

Removed from `gameLoop.js`:

- local foundation zone world-rect wrapper;
- local foundation free-block allowlist wrapper;
- local foundation progress-count wrapper;
- local foundation blocker source assembly;
- local builder tutorial blocked-zone lookup;
- local available-zone search wiring;
- local active-zone sync wrapper;
- local foundation zone unavailable wrapper;
- local build-zone center wrapper;
- local foundation visibility wrapper;
- local foundation ground-cell builder;
- local foundation completion interior builder;
- local foundation completion effect dispatcher;
- local foundation completion sync wrapper;
- local Free Block stacking wrapper.

Kept in `gameLoop.js`:

- Free Block input, preview and placement call sites;
- `startGameLoop()` dependency wiring;
- camera focus trigger callback, because it starts camera transitions and clears
  input;
- placement result side-effect callbacks for sounds, HUD notices and autosave
  hooks;
- all gameplay tuning constants and input mapping.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was around `4030` lines in the
  current working tree.
- After this cut, `app/runtime/gameLoop.js` is `3871` lines.

Tests updated:

- `tests/foundationBuildZone.test.js`

TDD sequence:

```sh
npm test -- --run tests/foundationBuildZone.test.js
```

The first run failed because `createFoundationBuildZoneRuntime(...)` did not
exist yet. After adding the runtime factory, the focused test passed.

Passed:

```sh
npm test -- --run tests/foundationBuildZone.test.js
npm test -- --run tests/foundationBuildZone.test.js tests/freeBlockBuildSessionRuntime.test.js tests/freeBlockBuildSystem.test.js tests/freeBlockPreview.test.js tests/freeBlockPlacementResult.test.js tests/freeBlockRemoval.test.js tests/constructionPlacementFrameRuntime.test.js
npm run build
```

Focused result:

- `7` test files passed
- `99` tests passed

Full-suite result:

```sh
npm test
```

`npm test` completed with `1893` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` extra scene-flow failure in
  `tests/sceneFlowRuntimeCompletion.test.js`.

The scene-flow failure was reproduced in isolation:

```sh
npm test -- --run tests/sceneFlowRuntimeCompletion.test.js
```

That failure is outside this `construction` cut. The working tree already had
unrelated dirty changes in `startScreen.js` and
`app/bootstrap/createApplicationRuntime.js`, which are the relevant scene-flow
files for that isolated failure.

Manual gameplay validation remains pending for this cut.

### Workbench Rotation Runtime Wiring

Expanded the existing
`app/runtime/construction/workbenchRotationRuntime.js` module so Workbench
rotation target lookup, selected-target validation, feedback actions and Solar
Station visual/yaw sync can be wired through the construction runtime instead
of local wrappers in `gameLoop.js`.

Boundary classification: `construction`, focused on Workbench rotation for
constructed objects.

Removed from `gameLoop.js`:

- local rotatable Workbench placement candidate wrapper;
- local Workbench rotation target size/distance/trigger-distance wrappers;
- local nearest-target lookup wrapper;
- local selected-target validation wrapper;
- local preview yaw/size wrappers;
- local tint wrapper;
- local select/clear/confirm feedback wrappers;
- local Solar Station placement yaw wrapper;
- local Solar Station Workbench rotation visual wrapper;
- local nearby-rotation feedback wrapper;
- local Workbench rotation ground-cell wrapper.

Kept in `gameLoop.js`:

- `startGameLoop()` dependency wiring;
- primary-action ordering and branching;
- construction placement frame orchestration;
- input mapping, sounds, HUD text and tuning constants.

Line-count impact:

- Before this cut, `app/runtime/gameLoop.js` was `3871` lines.
- After this cut, `app/runtime/gameLoop.js` is `3754` lines.

Tests updated:

- `tests/workbenchRotationRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js
```

The first run failed because the new source-wiring methods did not exist yet.
After extending `createWorkbenchRotationRuntime(...)`, the focused runtime test
passed.

Passed:

```sh
npm test -- --run tests/workbenchRotationRuntime.test.js
npm test -- --run tests/workbenchRotationRuntime.test.js tests/workbenchRotationTargets.test.js tests/constructionHouseModelInstances.test.js tests/constructionPlacementFrameRuntime.test.js tests/gameplayPromptTargetFrameState.test.js tests/groundCellHighlightFrameState.test.js
npm run build
```

Focused result:

- `6` test files passed
- `50` tests passed

Full-suite validation was not repeated for this cut. The immediately previous
full run already had known failures outside this boundary: the existing `3`
Leafage Native Tree failures and `1` isolated scene-flow failure tied to dirty
`startScreen.js` / bootstrap work.

Manual gameplay validation remains pending for this cut.

### Player Direct Action Runtime Boundary

Expanded the existing `app/player/playerActionRuntime.js` domain module with
`createPlayerDirectActionRuntime(...)`.

Boundary classification: `player / gameplay action runtime`, focused on direct
player destroy/interact request consumption and dispatch after the primary
action branch.

Study path:

1. `gameLoop.js` still decides whether gameplay actions are currently allowed
   through `resolveGameplayActionPermission(...)`.
2. `createPlayerDirectActionRuntime(...)` now owns the direct destroy/interact
   request consumption sequence.
3. The runtime keeps the previous order: consume destroy request, emit the
   destroy debug payload, perform destroy when allowed, consume interact
   request, then perform interact and confirmation SFX when allowed.

Removed from `gameLoop.js`:

- direct destroy request consumption;
- direct destroy debug payload construction;
- direct destroy action dispatch;
- direct interact request consumption;
- direct interact confirmation SFX and dispatch.

Kept in `gameLoop.js`:

- primary-action target branching;
- gameplay action permission calculation;
- `startGameLoop()` dependency wiring;
- frame ordering around primary actions, follower call and simulation updates.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` baseline was `3041`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is `3029`
  lines.

Tests updated:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `createPlayerDirectActionRuntime(...)` did not
exist yet. After adding the runtime and updating the game-loop wiring, the
focused tests passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1939` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Player Held Water Gun Action Runtime Boundary

Expanded the existing `app/player/playerActionRuntime.js` domain module with
`createPlayerHeldWaterGunActionRuntime(...)`.

Boundary classification: `player / gameplay action runtime`, focused on the
held-primary-action Water Gun fallback that keeps Water Gun behavior active
while the primary action is held and no new harvest request is being processed.

Study path:

1. `gameLoop.js` still owns the primary-action branch and frame order.
2. When that branch does not run, `gameLoop.js` now delegates the held Water Gun
   fallback to `playerHeldWaterGunActionRuntime.update(...)`.
3. The runtime preserves the old checks for active primary input, Water Gun
   equipped, player presence and flow blockers.
4. The runtime preserves both fallback paths: ground-cell Water Gun action and
   instant tree/palm Water Gun harvest with Squirtle stamina.

Removed from `gameLoop.js`:

- held primary-action Water Gun blocker checks;
- held Water Gun nearby target query construction;
- held Water Gun ground-cell `startAction(...)` fallback;
- held Water Gun tree/palm instant stamina fallback.

Kept in `gameLoop.js`:

- primary-action target branching;
- `performHarvestAction(...)` frame wrapper;
- Water Gun runtime creation and composition-root wiring;
- frame order around primary action, direct action, follower call and
  simulation updates.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` version was `3029`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is expected
  to be `2997` lines.

Tests updated:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `createPlayerHeldWaterGunActionRuntime(...)` did
not exist yet. After adding the runtime, the focused player action runtime test
passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js tests/waterGunRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` was attempted for this cut, but the machine is currently low on
disk space (`467MiB` available on `/System/Volumes/Data`) and Vitest hit
`ENOSPC` while writing temporary SSR files. Before the ENOSPC failures, the run
also showed the known baseline failures:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Player Primary Field Move Action Runtime Boundary

Expanded the existing `app/player/playerActionRuntime.js` domain module with
`createPlayerPrimaryFieldMoveActionRuntime(...)`.

Boundary classification: `player / gameplay action runtime`, focused on the
field-move dispatch sub-branch inside the primary-action path.

Study path:

1. `gameLoop.js` still computes the primary action target, intent and
   follow-up state.
2. When the primary action is classified as a field move and dialogue is not
   active, `gameLoop.js` delegates dispatch to
   `playerPrimaryFieldMoveActionRuntime.update(...)`.
3. The runtime preserves the old branch order: Build Block, Water Gun ground,
   Water Gun tree/palm, Leafage and Fire.
4. The runtime receives existing field-move runtimes explicitly; it does not
   import field-move modules directly and does not own frame order.

Removed from `gameLoop.js`:

- Build Block primary-action result handling and notices;
- Water Gun primary-action ground target fallback;
- Water Gun primary-action tree/palm instant stamina fallback;
- Leafage primary-action fallback;
- Fire primary-action fallback.

Kept in `gameLoop.js`:

- primary-action target and intent resolution;
- auto Leafage-to-Water Gun and auto Leafage-grow branches;
- repeated/invalid target feedback branch;
- placement, bag harvest, interact and fallback harvest branches;
- `performHarvestAction(...)` frame wrapper and composition-root wiring.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` version was `2997`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is expected
  to be `2963` lines.

Tests updated:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `createPlayerPrimaryFieldMoveActionRuntime(...)`
did not exist yet. After adding the runtime, the focused player action runtime
test passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js tests/buildBlockRuntime.test.js tests/waterGunRuntime.test.js tests/leafageRuntime.test.js tests/fireRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1947` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Player Primary Auto Field Move Action Runtime Boundary

Expanded the existing `createPlayerPrimaryFieldMoveActionRuntime(...)` in
`app/player/playerActionRuntime.js` with `tryAutoTargetAction(...)`.

Boundary classification: `player / gameplay action runtime`, focused on the
auto field-move target branches inside primary-action dispatch.

Study path:

1. `gameLoop.js` still computes `leafageAutoWaterGunTarget` and
   `leafageAutoGrowTarget`, preserving target-query order.
2. `tryAutoTargetAction(...)` now owns the side effects for the auto target
   branches and returns whether the branch was handled.
3. The return value preserves the existing `else if` priority before repeated
   and invalid target feedback.

Removed from `gameLoop.js`:

- Leafage auto Water Gun branch side effects;
- Leafage auto Grow branch side effects;
- direct active move switching for these auto branches;
- direct Water Gun first-use flag mutation for this branch;
- direct fallback harvest calls for these auto branches.

Kept in `gameLoop.js`:

- target-query decisions for `leafageAutoWaterGunTarget` and
  `leafageAutoGrowTarget`;
- primary-action branch priority around rotation, bag destroy, repeated
  feedback, invalid feedback, placement, bag harvest, interact and fallback
  harvest;
- frame-local `performHarvestAction(...)` wrapper.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` version was `2963`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is expected
  to be `2944` lines.

Tests updated:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `tryAutoTargetAction(...)` did not exist yet.
After adding it, the focused player action runtime test passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js tests/waterGunRuntime.test.js tests/leafageRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1950` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Player Primary Action Runtime Boundary

Expanded `app/player/playerActionRuntime.js` with:

- `createPlayerPrimaryActionFallbackRuntime(...)`;
- `createPlayerPrimaryActionRuntime(...)`.

Boundary classification: `player / gameplay action runtime`, focused on the
primary-action side-effect branch after `gameLoop.js` has already computed the
target context and follow-up intent.

Study path:

1. `gameLoop.js` still computes primary action target state, secondary target
   queries, rotation candidates and interact candidates.
2. `playerPrimaryActionRuntime.update(...)` now owns the action branch order:
   rotation confirm, rotation select, destroy, auto field move, blocked feedback,
   placement/bag harvest, field move, busy companion notice, interact and default
   harvest fallback.
3. `createPlayerPrimaryActionFallbackRuntime(...)` owns the repeated/invalid
   feedback and harvest fallback details used by that branch.
4. `startGameLoop()` remains the composition root; the new runtimes are created
   in `gameLoop.js` and receive dependencies explicitly.

Removed from `gameLoop.js`:

- direct rotation confirmation/select side effects inside the primary-action
  branch;
- direct destroy dispatch inside that branch;
- repeated field-move cancel feedback;
- invalid Leafage and Fire prompt dispatch;
- blocked placement cancel feedback;
- placement harvest fallback;
- bag harvest fallback;
- direct primary field-move runtime dispatch;
- Leaf Den busy notice dispatch;
- direct interact dispatch;
- default harvest fallback dispatch.

Kept in `gameLoop.js`:

- frame timing and frame order;
- primary target and follow-up intent calculation;
- secondary target query calculation;
- workbench rotation candidate lookup;
- bag destroy candidate lookup;
- first Water Gun primary-use flag mutation;
- `performHarvestAction(...)` wrapper;
- held Water Gun branch.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` version was `2944`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is expected
  to be `2936` lines.
- The visible worktree may show `2937` lines while the unrelated
  `shouldShowGroundCellHighlight` residual line is restored.

Tests updated:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first new fallback-runtime run failed because
`createPlayerPrimaryActionFallbackRuntime(...)` did not exist yet. After adding
it, the focused test passed. The next primary-action-runtime run failed because
`createPlayerPrimaryActionRuntime(...)` did not exist yet. After adding it, the
focused test passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js tests/waterGunRuntime.test.js tests/leafageRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1960` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Player Primary Action Frame Runtime Boundary

Expanded `app/player/playerActionRuntime.js` with
`createPlayerPrimaryActionFrameRuntime(...)`.

Boundary classification: `player / gameplay action runtime`, focused on the
frame-level preparation for a primary player action.

Study path:

1. `gameLoop.js` still computes active move equipment and the frame-level flow
   blockers.
2. `playerPrimaryActionFrameRuntime.update(...)` now consumes the harvest
   request, checks action blockers, finds primary/auto/interact/rotation/destroy
   targets and builds the context for `playerPrimaryActionRuntime.update(...)`.
3. The runtime uses the existing `playerActionTargetContext` policies for target
   intent, follow-up intent and secondary target queries.
4. `startGameLoop()` remains the composition root; `gameLoop.js` injects
   gameplay/session/context dependencies and does not own the detailed target
   lookup sequence anymore.

Removed from `gameLoop.js`:

- direct `controls.consumeHarvestRequest()` handling;
- harvest request source classification;
- primary action target lookup;
- primary action intent resolution;
- ground feedback pulse trigger decision for primary actions;
- Leafage auto Water Gun target lookup;
- Leafage auto Grow target lookup;
- follow-up intent resolution;
- already-resolved field-move target lookup;
- interact target query and lookup;
- workbench rotation query calculation;
- bag destroy target lookup;
- Water Gun first-use prompt mutation for primary action.

Kept in `gameLoop.js`:

- active move/equipment calculation;
- `syncFirstTaughtActionFreedomWindow(...)`, because that feeds render snapshot
  state;
- `performHarvestAction(...)` frame wrapper;
- held Water Gun branch fallback when primary action was not handled;
- composition of the player action runtimes.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` version was `2936`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is expected
  to be `2782` lines.
- The visible worktree may show `2783` lines while the unrelated
  `shouldShowGroundCellHighlight` residual line is restored.

Tests updated:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `createPlayerPrimaryActionFrameRuntime(...)` did
not exist yet. After adding it, one assertion exposed the preserved
`gamepadPrimary` placement block behavior, so the test was corrected to expect
`allowPlacement: false`. The focused test then passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js tests/waterGunRuntime.test.js tests/leafageRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1963` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Player Action Frame Runtime Boundary

Expanded `app/player/playerActionRuntime.js` with
`createPlayerActionFrameRuntime(...)`.

Boundary classification: `player / gameplay action runtime`, focused on the
frame-level action orchestration after movement and placement preview updates.

Study path:

1. `gameLoop.js` still syncs the first taught action freedom window because the
   result feeds render/UI presentation state.
2. `playerActionFrameRuntime.getActionState()` now owns active move equipment
   resolution for Water Gun, Leafage, Fire and Build Block.
3. `gameLoop.js` still passes `buildBlockEquipped` to construction preview
   update, preserving preview order.
4. `playerActionFrameRuntime.update(...)` now creates the harvest action wrapper,
   delegates primary action, falls back to held Water Gun only when primary did
   not handle the frame, and updates direct destroy/interact action processing.
5. The runtime returns the action state that the rest of the frame still needs
   for companions, prompts, guidance and render preparation.

Removed from `gameLoop.js`:

- direct active move equipment calculation;
- direct Bulbasaur workbench guide check for Leafage equipment;
- local `performHarvestAction(...)` wrapper;
- direct primary action frame runtime call;
- direct held Water Gun fallback call;
- direct gameplay action permission calculation;
- direct `playerDirectActionRuntime.update(...)` call.

Kept in `gameLoop.js`:

- first taught action freedom window sync;
- free block preview update, because it belongs to construction preview order;
- action state destructuring for later frame presentation and simulation;
- composition of all player action runtimes.

Line-count impact:

- Before this cut, the committed `app/runtime/gameLoop.js` version was `2782`
  lines.
- After this cut, the committed `app/runtime/gameLoop.js` version is expected
  to be `2751` lines.
- The visible worktree may show `2752` lines while the unrelated
  `shouldShowGroundCellHighlight` residual line is restored.

Tests updated:

- `tests/playerActionRuntime.test.js`

TDD sequence:

```sh
npm test -- --run tests/playerActionRuntime.test.js
```

The first run failed because `createPlayerActionFrameRuntime(...)` did not
exist yet. After adding it, the focused player action runtime tests passed.

Passed:

```sh
npm test -- --run tests/playerActionRuntime.test.js
npm test -- --run tests/playerActionRuntime.test.js tests/playerActionContext.test.js tests/playerActionTargetContext.test.js tests/waterGunRuntime.test.js tests/leafageRuntime.test.js tests/gameLoopFramePolicies.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1967` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Companion Render Frame Runtime Boundary

Expanded `app/runtime/companions/companionPresentationFrame.js` with
`createCompanionRenderFrameRuntime(...)`.

Boundary classification: `companions / presentation runtime`, focused on
companion model visibility and companion-specific render billboards.

Study path:

1. `startGameLoop()` still wires the runtime dependencies as composition root.
2. `frame(now)` now calls `companionRenderFrameRuntime.update(...)` instead of
   knowing every companion presentation callback.
3. The companions module now owns the Act Two Squirtle render visibility rule:
   sync the Squirtle model instance, check story/tutorial visibility gates,
   keep it active when assembled/recovered, and keep it active for Water Gun or
   charging presentation.
4. `updateCompanionPresentationFrame(...)` remains exported for existing tests
   and direct focused use; the new runtime wraps it with the missing companion
   model visibility step.

Removed from `gameLoop.js`:

- direct Act Two Squirtle model visibility rule;
- direct call to `companionModelSyncRuntime.syncSquirtle()` inside render prep;
- long companion presentation callback list inside the `frame(now)` body.

Kept in `gameLoop.js`:

- companion render runtime construction and dependency wiring;
- temporal placement of companion presentation inside render snapshot
  preparation;
- `activeMoveId`, `nextFrame` and `now` handoff from the frame.

Line-count impact:

- Before this cut, committed `app/runtime/gameLoop.js` was `2751` lines.
- After this cut, committed `app/runtime/gameLoop.js` is expected to be `2740`
  lines.
- The visible worktree may show one extra line while the unrelated
  `shouldShowGroundCellHighlight` residual line is restored.
- The body of `frame(now)` loses the companion-specific Squirtle visibility
  rule and the companion presentation dependency list; some lines move to
  composition-root wiring, which is intentional.

Tests updated:

- `tests/companionPresentationFrame.test.js`

TDD sequence:

```sh
npm test -- --run tests/companionPresentationFrame.test.js
```

The first run failed because `updateCompanionRenderFrame(...)` did not exist
yet. After adding that function, the second TDD step failed because
`createCompanionRenderFrameRuntime(...)` did not exist yet. After adding the
factory and updating `gameLoop.js`, the focused test passed.

Passed:

```sh
npm test -- --run tests/companionPresentationFrame.test.js
npm test -- --run tests/companionModelSyncRuntime.test.js tests/companionFrameRuntime.test.js tests/baseRenderSnapshotFrame.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1970` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### World-Space Presentation Frame Runtime Boundary

Expanded `app/runtime/presentation/worldSpacePresentationSnapshotFrame.js` with
`createWorldSpacePresentationFrameRuntime(...)`.

Boundary classification: `presentation / render helpers`, focused on
world-space UI state and snapshot population: speech bubbles, prompts, ground
cell highlights and status popups.

Study path:

1. `startGameLoop()` still wires dependencies as composition root.
2. `frame(now)` still decides the temporal point where world-space
   presentation runs.
3. The presentation boundary now owns the bridge between
   `resolveWorldSpacePresentationFrameState(...)` and
   `updateWorldSpacePresentationSnapshotFrame(...)`.
4. `gameLoop.js` now passes a compact frame payload to
   `worldSpacePresentationFrameRuntime.update(...)` and receives
   `canShowWorldSpaceUi` for later world object billboards.
5. Ground-cell highlight output now moves as one `groundCellHighlightFrameState`
   object instead of being destructured into many one-use locals in `frame(now)`.

Removed from `gameLoop.js`:

- direct import/use of `resolveWorldSpacePresentationFrameState(...)`;
- direct import/use of `updateWorldSpacePresentationSnapshotFrame(...)`;
- manual world-space presentation state composition;
- manual snapshot population call for world speech, prompts, highlights and
  status popups;
- long one-use destructuring of ground-cell highlight frame state.

Kept in `gameLoop.js`:

- world-space presentation runtime construction and dependency wiring;
- frame ordering around HUD/base snapshot before world-space presentation;
- `canShowWorldSpaceUi` handoff to world-object billboard rendering.

Line-count impact:

- Before this cut, committed `app/runtime/gameLoop.js` was `2740` lines.
- After this cut, `app/runtime/gameLoop.js` is `2697` lines.
- The previous loose `shouldShowGroundCellHighlight` destructuring line is no
  longer needed because the full ground-cell highlight state object is passed
  through to the presentation runtime.

Tests updated:

- `tests/worldSpacePresentationSnapshotFrame.test.js`
- `tests/gameLoopGroundCellHighlightWiring.test.js`

TDD sequence:

```sh
npm test -- --run tests/worldSpacePresentationSnapshotFrame.test.js
```

The first run failed because `createWorldSpacePresentationFrameRuntime(...)`
did not exist yet. After adding the runtime factory, the focused test passed.

Passed:

```sh
npm test -- --run tests/worldSpacePresentationSnapshotFrame.test.js
npm test -- --run tests/worldSpacePresentationSnapshotFrame.test.js tests/worldSpacePresentationFrameState.test.js tests/worldPromptFrameState.test.js tests/worldSpeechFrameState.test.js tests/groundCellHighlightFrameState.test.js tests/gameLoopGroundCellHighlightWiring.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1971` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.

### Gameplay Prompt Preparation Frame Runtime Boundary

Expanded `app/runtime/presentation/gameplayPromptTargetFrameState.js` with
`createGameplayPromptPreparationFrameRuntime(...)`.

Boundary classification: `presentation / render helpers`, focused on preparing
the gameplay target, ground guidance, prompt and ground-cell highlight state
that later feeds HUD and world-space presentation.

Study path:

1. `startGameLoop()` wires the runtime dependencies as composition root.
2. `frame(now)` still decides when prompt/snapshot preparation happens.
3. The new runtime now owns the coordination between nearby gameplay targets,
   active quest/task lookups, ground guidance cells, active construction
   preview filtering, prompt text state and ground-cell highlight frame state.
4. `gameLoop.js` now asks for one `gameplayPromptPreparationFrame` and keeps
   only the small set of values needed by HUD, base render snapshot and
   world-space presentation.

Removed from `gameLoop.js`:

- direct import/use of `resolveGameplayTargetFrameState(...)`;
- direct import/use of `resolveGameplayGroundGuidanceFrameState(...)`;
- direct import/use of `resolveGameplayGroundCellHighlightFrameState(...)`;
- direct import/use of `resolveActiveConstructionPlacementPreviews(...)`;
- direct import/use of `resolveGameplayPromptFrameState(...)`;
- large inline target/guidance/prompt/highlight preparation block;
- one-off callback wiring for water-gun pending cells, free-roam restoration
  cells, boulder shaded task cells, grow-first-habitat cells, foundation build
  zone cells, solar power radius cells and ground action feedback frames.

Kept in `gameLoop.js`:

- temporal order of prompt preparation after gameplay presentation frame;
- compact `equipmentState`, `placementPreviews` and `placementFootprints`
  inputs;
- handoff of prompt state to HUD and world-space presentation.

Line-count impact:

- Before this cut, committed `app/runtime/gameLoop.js` was `2697` lines.
- After this cut, `app/runtime/gameLoop.js` is `2631` lines.
- This cut is a real frame-body reduction; some dependency wiring moved to
  `startGameLoop()` where it belongs.

Tests updated:

- `tests/gameplayPromptTargetFrameState.test.js`
- `tests/gameLoopGroundCellHighlightWiring.test.js`

TDD sequence:

```sh
npm test -- --run tests/gameplayPromptTargetFrameState.test.js
```

The first run failed because `createGameplayPromptPreparationFrameRuntime(...)`
did not exist yet. After adding the runtime factory, the focused test passed.

Passed:

```sh
npm test -- --run tests/gameplayPromptTargetFrameState.test.js
npm test -- --run tests/gameplayPromptTargetFrameState.test.js tests/gameplayTargetFrameState.test.js tests/groundCellHighlightFrameState.test.js tests/worldSpacePresentationSnapshotFrame.test.js tests/gameLoopGroundCellHighlightWiring.test.js
git diff --check
npm run build
```

Full-suite baseline:

```sh
npm test
```

`npm test` completed with `1972` passed and `4` failed:

- the existing `3` Leafage Native Tree failures in
  `tests/gameplayInteractions.test.js`;
- `1` scene-flow failure in `tests/sceneFlowRuntimeCompletion.test.js`, tied
  to dirty `startScreen.js` / bootstrap work already present in the worktree.

Manual gameplay validation remains pending for this cut.
