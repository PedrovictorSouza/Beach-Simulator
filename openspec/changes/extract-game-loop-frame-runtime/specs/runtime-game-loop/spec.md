# runtime-game-loop Specification

## ADDED Requirements

### Requirement: Frame Timing Has Explicit Ownership

The game loop MUST calculate frame timing through an isolated runtime boundary.

#### Scenario: Frame clock advances normally

- **GIVEN** the previous frame time is known
- **WHEN** a later frame time is processed
- **THEN** the clock MUST return the elapsed time in seconds
- **AND** the clock MUST preserve the existing maximum delta clamp

#### Scenario: Frame time moves backward

- **GIVEN** the previous frame time is known
- **WHEN** an earlier frame time is processed
- **THEN** the raw delta MUST be clamped to zero
- **AND** simulation delta MUST NOT become negative

### Requirement: Start Game Loop Owns Scheduling

`startGameLoop()` MUST remain the owner of animation-frame scheduling.

#### Scenario: Runtime update completes

- **GIVEN** a frame runtime update has completed
- **WHEN** the next frame is requested
- **THEN** `startGameLoop()` MUST schedule the next animation frame
- **AND** domain runtimes MUST NOT schedule animation frames independently

### Requirement: Frame Runtime Preserves Lifecycle Ordering

The extracted frame runtime MUST preserve the established frame lifecycle
ordering.

#### Scenario: Input runtime receives resolved blockers

- **GIVEN** a gameplay frame is being processed
- **WHEN** the gameplay input runtime is updated
- **THEN** gameplay-opening locks MUST already be resolved
- **AND** placement-preview state MUST already be resolved
- **AND** movement blockers MUST already be resolved

#### Scenario: Intro room handles a frame

- **GIVEN** the intro room is active
- **WHEN** the intro room consumes the current frame
- **THEN** the frame snapshot MUST be committed
- **AND** gameplay simulation MUST NOT continue for that frame

### Requirement: Frame Runtime Does Not Own Domain Rules

The extracted frame runtime MUST orchestrate specialized runtimes without
implementing their detailed rules.

#### Scenario: Domain behavior changes later

- **GIVEN** a future change adjusts field moves, placement, opening phases or
  camera tuning
- **WHEN** that behavior is implemented
- **THEN** the detailed rule MUST remain in its specialized runtime or owning
  module
- **AND** the frame runtime MUST only coordinate the required update order

### Requirement: Frame Extraction Preserves Observable Behavior

The frame extraction MUST not intentionally change gameplay behavior.

#### Scenario: Existing gameplay loop runs after extraction

- **GIVEN** the game starts normally
- **WHEN** opening, pause, camera input, player movement and rendering are used
- **THEN** their observable behavior MUST remain unchanged
- **AND** snapshot output shape MUST remain compatible with existing render
  consumers
