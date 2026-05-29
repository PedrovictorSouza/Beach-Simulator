# Tasks: Materials-Driven Implementation Workflow

## 1. Workflow Definition

- [x] Define when material reading is mandatory.
- [x] Define when small isolated tasks may skip material reading.
- [x] Define the narrow-read rule to avoid broad context consumption.
- [x] Define the Sandbots translation rule.
- [x] Define copy/IP safety boundaries.

## 2. Spec Requirements

- [x] Add a requirement for relevant implementation tasks to inspect `materials/`.
- [x] Add a requirement for preflight notes to mention material findings.
- [x] Add a requirement to translate external patterns into Sandbots-native
  architecture.
- [x] Add a requirement to avoid direct copying.
- [x] Add a requirement to stop and split overly broad material-driven tasks.

## 3. Future Agent Behavior

- [ ] Update any project agent workflow document to point at this OpenSpec rule
  after the change is accepted.
- [ ] Add a lightweight checklist item to implementation preflight templates if
  such a template is introduced.
- [ ] Prefer local OpenSpec material summaries when they already capture a
  source reading.

## 4. Validation

- [x] Validate this OpenSpec change with `openspec validate
  add-materials-driven-implementation --strict`.
- [x] Confirm the change does not require runtime code changes.

## 5. Material-Derived Implementation Backlog

- [x] Inspect the `materials/` folder and identify source systems that are relevant to Sandbots.
- [x] Group the inspected material into implementation domains:
  - world/grid
  - block registry
  - block placement
  - block breaking
  - terrain/world storage
  - chunk or region management
  - inventory
  - item stacks
  - crafting/resource conversion
  - construction/building kits
  - player interaction
  - camera/world targeting
  - collision
  - persistence/save-load
  - rendering/debug visualization
  - simulation ticks
- [x] Create a material-derived backlog with at least 30 small implementation tasks.
- [x] Each generated task MUST describe:
  - the reference material inspected
  - the Sandbots-native system it maps to
  - what behavior should be adapted
  - what must be ignored
  - which project files are likely to be touched
  - the safest first implementation slice
- [x] Store the generated backlog in `docs/materials-implementation-backlog.md`.
- [x] Do not implement directly from the material until the backlog exists.
- [x] Do not create large vague tasks such as "implement Minecraft blocks" or "implement chunk system".
- [x] Split every material-derived feature into small, verifiable tasks.
- [x] Prefer implementing tasks in dependency order.
- [x] After each completed task, update the backlog status.
- [x] Add a rule requiring future broad continuation requests to use the backlog automatically.
