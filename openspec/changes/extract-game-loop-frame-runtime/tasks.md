# Tasks: Extract Game Loop Frame Runtime

## 1. Proposal Scope

- [x] Create OpenSpec change under
  `openspec/changes/extract-game-loop-frame-runtime`.
- [x] Identify frame lifecycle ownership and high-risk boundaries.
- [x] Define incremental extraction slices.
- [x] Keep this proposal documentation-only.

## 2. Frame Clock Slice

- [x] Add `app/runtime/gameLoopFrameClock.js`.
- [x] Keep previous-frame time private to the clock.
- [x] Preserve non-negative raw delta calculation.
- [x] Preserve the current `0.033` delta clamp.
- [x] Add focused frame-clock tests.
- [x] Integrate the clock into `gameLoop.js`.
- [x] Remove `previousTime` from `createGameLoopState()` after integration.

## 3. Frame Start Context Slice

- [x] Review whether a small frame-start context builder removes real
  orchestration complexity.
- [x] Preserve flow-state read order.
- [x] Preserve gameplay-opening update order.
- [x] Preserve placement-preview and blocker calculation order.
- [x] Keep the helper internal after the review found no useful pure-builder
  contract to add.

## 4. Frame Runtime Slice

- [ ] Add `app/runtime/gameLoopFrameRuntime.js` only after earlier slices pass.
- [ ] Keep dependency wiring in `startGameLoop()`.
- [ ] Keep `requestAnimationFrame` scheduling in `startGameLoop()`.
- [ ] Preserve pause clearing behavior.
- [ ] Preserve intro-room early commit behavior.
- [ ] Preserve camera permission and input ordering.
- [ ] Preserve snapshot output shape and final commit ordering.

## 5. Validation

- [ ] Run focused frame-clock tests.
- [ ] Run `npm test -- --run tests/gameLoopFramePolicies.test.js`.
- [ ] Run `git diff --check`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run local HTTP smoke.
- [ ] Run manual opening, pause, camera and movement checks when browser
  automation is available.
- [ ] Validate this OpenSpec change with
  `openspec validate extract-game-loop-frame-runtime --strict`.
