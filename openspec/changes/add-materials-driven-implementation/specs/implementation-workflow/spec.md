# implementation-workflow Specification

## ADDED Requirements

### Requirement: Relevant Implementation Must Inspect Local Material

The implementation workflow SHALL inspect local reference material before
implementing relevant gameplay, world, grid, block, inventory, construction,
camera, interaction or simulation systems.

#### Scenario: AI implements a gameplay system

- **GIVEN** the task changes gameplay, world simulation, inventory, resources,
  construction, camera, interaction, input, AI, progression or task behavior
- **WHEN** the AI performs implementation preflight
- **THEN** it MUST search `materials/` for relevant reference material
- **AND** it SHOULD also use existing OpenSpec summaries when they already
  capture relevant source reading
- **AND** it MUST inspect only the smallest relevant material slice needed for
  the task.

#### Scenario: Task is a small isolated visual or copy adjustment

- **GIVEN** the task only changes copy, simple CSS positioning or another
  isolated presentation detail
- **WHEN** no system behavior or architecture is being designed
- **THEN** the AI MAY skip material reading
- **AND** it SHOULD keep the change local and testable.

### Requirement: Preflight Must Record Material Translation

The implementation preflight SHALL state how external material maps to Sandbots
before code is changed.

#### Scenario: Material informs an implementation

- **GIVEN** the AI found relevant local material
- **WHEN** it explains the implementation plan
- **THEN** it MUST name the material inspected
- **AND** it MUST summarize the useful pattern, edge case or data shape
- **AND** it MUST state the Sandbots-native translation
- **AND** it MUST name what will not be copied or imported.

### Requirement: External References Must Not Be Copied Directly

Reference material SHALL be used only as a technical lens for original Sandbots
systems.

#### Scenario: Reference source code suggests an implementation pattern

- **GIVEN** external or reference source code is available in `materials/`
- **WHEN** the AI implements a related system
- **THEN** it MUST NOT copy proprietary code, comments, assets, identifiers,
  textures, models, audio or franchise-specific names
- **AND** it MUST implement original code using the project's existing patterns,
  names and architecture
- **AND** any borrowed concept MUST be translated into the colony-restoration
  design of Sandbots.

### Requirement: Material Reading Must Stay Narrow

Material-driven implementation SHALL remain incremental and bounded.

#### Scenario: Relevant material is large

- **GIVEN** the material folder contains a large source tree, book or dataset
- **WHEN** the AI needs reference context
- **THEN** it MUST search before reading
- **AND** it MUST prefer targeted snippets over broad file reads
- **AND** it MUST stop reading when enough context exists for a small
  implementation slice.

### Requirement: Broad Material-Driven Work Must Be Split

The AI SHALL stop and split the work when material reading expands beyond a safe
implementation slice.

#### Scenario: Task becomes too broad

- **GIVEN** the AI would need to read more than 8 files, edit more than 3 files,
  touch multiple runtime systems, or make camera/render/input/global gameplay
  changes without a clear validation path
- **WHEN** material-driven implementation is still requested
- **THEN** the AI MUST stop before implementation
- **AND** it MUST report what it understood from the material
- **AND** it MUST propose the first smaller safe implementation task.

### Requirement: Material-Derived Systems Must Be Validated Locally

Material-derived implementation SHALL be proven through local tests or build
validation whenever possible.

#### Scenario: AI implements a translated pattern

- **GIVEN** a reference pattern has been translated into Sandbots code
- **WHEN** implementation is complete
- **THEN** the AI SHOULD run focused tests for the changed local system
- **AND** it SHOULD run a build when imports, runtime modules or UI integration
  changed
- **AND** it MUST report any validation that could not be run.

### Requirement: AI Must Generate A Material-Derived Implementation Backlog

The AI MUST create a backlog of small implementation tasks derived from the reference material before implementing broad systems inspired by `materials/`.

The backlog MUST translate external source behavior into Sandbots-native architecture.

The backlog MUST contain many small, safe tasks instead of a few large ambiguous tasks.

#### Scenario: User asks the AI to use the material as continuous implementation reference

- **GIVEN** the user wants the AI to keep adapting relevant systems from `materials/`
- **WHEN** the AI begins material-driven work
- **THEN** it MUST inspect the relevant material
- **AND** it MUST create a backlog with at least 30 small tasks
- **AND** it MUST group those tasks by system area
- **AND** it MUST order them by dependency and implementation safety
- **AND** it MUST store the backlog in `docs/materials-implementation-backlog.md`

#### Scenario: Material contains a large source system

- **GIVEN** a source system in `materials/` is too large to implement directly
- **WHEN** the AI analyzes it
- **THEN** it MUST split the system into small Sandbots-native tasks
- **AND** each task MUST be independently understandable
- **AND** each task MUST be independently testable
- **AND** each task MUST avoid direct source copying

#### Scenario: Generated task references external source behavior

- **GIVEN** a backlog task is derived from external material
- **WHEN** the AI writes the task
- **THEN** it MUST describe the behavior in original language
- **AND** it MUST not paste source code from the material
- **AND** it MUST not preserve proprietary identifiers unnecessarily
- **AND** it MUST explain how the behavior maps to Sandbots

#### Scenario: Backlog already exists

- **GIVEN** `docs/materials-implementation-backlog.md` already exists
- **WHEN** the AI continues material-driven implementation
- **THEN** it MUST read the existing backlog first
- **AND** it MUST continue from the next safe incomplete task
- **AND** it MUST update completed task statuses
- **AND** it MUST add new tasks only when new material understanding is discovered

### Requirement: AI Must Continue From The Material Backlog Automatically

Once the material-derived backlog exists, the AI MUST use it as the default source of implementation tasks for future work on Sandbots systems.

#### Scenario: User asks the AI to continue implementation

- **GIVEN** `docs/materials-implementation-backlog.md` exists
- **WHEN** the user asks the AI to continue, improve, implement more, or work on the game
- **THEN** the AI MUST inspect the backlog
- **AND** it MUST choose the next safest incomplete task
- **AND** it MUST inspect the related material files
- **AND** it MUST implement that task only
- **AND** it MUST update the backlog status after implementation

#### Scenario: User does not specify what to implement next

- **GIVEN** the user gives a broad instruction like "continue", "implement more", or "advance the game"
- **WHEN** material-derived backlog tasks exist
- **THEN** the AI MUST not ask the user to choose manually
- **AND** it MUST select the next task by dependency order, safety, and project impact
