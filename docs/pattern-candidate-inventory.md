# Game Programming Patterns Mapping

This document maps existing code shapes in the game to known patterns from
`material/Game Programming Patterns.pdf`. It must not invent new pattern names.

Use this document as an investigation map, not as permission to refactor. A code
shape should only be treated as a pattern candidate when it matches a known
pattern and there is concrete evidence in the current code.

Known pattern names used here:

- Command
- Flyweight
- Observer
- State
- Double Buffer
- Game Loop
- Update Method
- Component
- Event Queue
- Service Locator
- Data Locality
- Dirty Flag
- Object Pool
- Spatial Partition
- Type Object

## Area: Progression Events

Known patterns that may apply:

- Observer
- Event Queue

Evidence:

- `app/quest/createQuestSystem.js`
  - Provides `emit(event)`.
  - Stores event totals.
  - Notifies through `onChange`.

- `app/sandbox/createHabitatSystem.js`
  - Provides `recordEvent(event)`.
  - Stores event totals.
  - Calls `onDiscover` when requirements are met.

- `app/tasks/createQuestTaskBridgeAdapter.js`
  - Receives one event and forwards it to quest and task systems.

- `app/story/progressionTriggerContract.js`
  - Resolves progress events into quest events, milestones, and autosave events.

Why this is not confirmed yet:

- The code has event-shaped data and callbacks, but there is not one explicit
  event queue object.
- Some flows are direct calls, not queued dispatch.
- The current names differ across systems: `emit`, `recordEvent`, `applyEvent`,
  and `resolveColonyProgressTriggers`.

Safe next investigation:

- Compare the event shape used by quest, task, habitat, and colony progression.
- Do not rename the architecture yet.
- If anything is extracted, start only with shared event-key or amount helpers
  after tests prove no behavior changed.

## Area: Game Shell

Known patterns that may apply:

- None confirmed from the book yet.

Evidence:

- `app/ui/gameShell/index.js`
- `app/ui/gameShell/createGameShell.js`
- `app/ui/gameShell/resolveGameShellElements.js`
- `app/ui/gameShell/gameShellDomIds.js`

What is known:

- This area creates the DOM shell and returns a DOM contract.
- It is a boot boundary for canvas, overlays, HUD roots, and render frame.

Why this should not be named as a book pattern yet:

- It may be a local module boundary, not a Game Programming Patterns pattern.
- Naming it with architecture vocabulary from outside the selected material
  would make this inventory less precise.

Safe next investigation:

- Keep improving the explicit DOM contract.
- Do not claim this is a formal pattern unless it is mapped to a known pattern
  from the material.

## Area: Per-Frame Runtime Code

Known patterns that may apply:

- Game Loop
- Update Method
- Double Buffer

Evidence:

- `app/runtime/gameLoop.js`
- `app/runtime/gameLoopFrameRuntime.js`
- `app/runtime/presentation/gameplayTargetFrameState.js`
- `app/runtime/presentation/gameplayPromptTargetFrameState.js`
- `app/runtime/companions/companionFrameRuntime.js`

What is known:

- Some modules compute frame-local state.
- Some modules expose an update-like API called once per frame.
- `app/runtime/gameLoopFrameRuntime.js` appears to organize begin/update/commit
  frame steps.

Why this is not fully confirmed:

- Each file needs to be checked separately.
- A "frame state" helper is not automatically the Update Method pattern.
- Double Buffer only applies if there are two separate buffers or snapshots
  intentionally swapped or committed.

Safe next investigation:

- Inspect one module at a time.
- Confirm whether it owns per-object `update()` behavior, frame snapshots, or
  actual double buffering before labeling it.

## Area: Authored Data Catalogs

Known patterns that may apply:

- Type Object
- Flyweight

Evidence:

- `app/gameplay/worldObjectRegistry.js`
- `app/gameplay/worldObjectCatalog.js`
- `app/gameplay/content/companionAbilities.js`
- `app/story/currentPlaceholderCatalogData.js`
- `app/story/contentCatalogContracts.js`

What is known:

- The game has authored data for world objects, abilities, quests, habitats,
  recipes, regions, and placeholders.
- Some runtime systems consume these entries by id.
- Some catalog modules validate and normalize entries.

Why this is not fully confirmed:

- Type Object applies only where data entries replace many hardcoded classes or
  behavior-specific subclasses.
- Flyweight applies only where shared immutable data is intentionally reused by
  many instances.

Safe next investigation:

- Pick one catalog, such as world objects.
- Check whether instances share immutable metadata from the catalog.
- Only then label that catalog as Flyweight or Type Object.

## Area: Scene Flow

Known patterns that may apply:

- State

Evidence:

- `app/scene/createSceneFlowRuntime.js`
- `app/scene/sceneDirector.js`
- `app/scene/gameScenes.js`
- `app/scene/cinematicControlPolicy.js`

What is known:

- The game has start screen, intro, cinematic, tutorial, and gameplay modes.
- There is a `sceneDirector`.
- Flow code transitions between named modes.

Why this is not fully confirmed:

- The State pattern has a specific structure: behavior varies by current state,
  and states may encapsulate behavior or transition logic.
- A list of scene ids alone is not enough to call it State.

Safe next investigation:

- Inspect `sceneDirector.js` and `createSceneFlowRuntime.js` together.
- Confirm where behavior changes by current state.
- Avoid touching scene flow during pattern investigation unless there is a
  focused test target.

## First Safe Follow-Up

Start by confirming or rejecting the pattern mapping for **Progression Events**.

Reason:

- It has the clearest repeated event-shaped code.
- It affects story, quests, tasks, and habitats.
- It can be investigated without changing render, camera, input, or scene flow.

First small task:

1. List the event shapes currently used by quest, task, habitat, and colony
   progression.
2. Mark which parts match Observer.
3. Mark which parts match Event Queue.
4. Do not rename or extract anything until the mapping is confirmed.
