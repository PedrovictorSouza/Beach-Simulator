# Design: Materials-Driven Implementation Workflow

## Problem

Reference material exists locally, but implementation work can bypass it unless
the user explicitly asks for it. That creates repeated clarification loops and
systems that miss useful data structures, edge cases or interaction models.

The workflow must make references useful without making every task large.

## Reference Scope

The required source of truth is the local `materials/` directory.

Relevant material includes:

- PDFs, books, notes and design references.
- Source-code folders such as `materials/minecraft-source-code`.
- Existing summaries or OpenSpec changes derived from material readings.

The AI should not read the entire material folder. It should search for the
smallest relevant references, inspect a narrow slice and stop when it has enough
context for the requested implementation.

## Triggering Work

The workflow applies before implementing or substantially modifying:

- gameplay systems
- world simulation
- grid/cell/block placement
- inventory, resources, loot, drops or crafting
- construction and build previews
- camera/cinematic gameplay behavior
- interaction, input or prompt logic
- task/progression/objective systems
- AI/bot behavior

Pure visual text tweaks, copy edits, small CSS-only positioning changes, and
isolated bug fixes may skip material reading when no system behavior is being
designed.

## Workflow

1. Run a targeted search in `materials/` for terms connected to the task.
2. Run a targeted search in `app/` and `tests/` for the local system.
3. Read a small number of relevant snippets from both sides.
4. Write a preflight note that names:
   - the implementation goal
   - relevant material inspected
   - local files likely involved
   - the Sandbots translation of the external pattern
   - what will not be copied
   - smallest safe implementation slice
5. Implement original code using local naming, architecture and tests.
6. Validate with focused tests and build when possible.

## Translation Rules

External material is a technical lens, not source content.

The AI may extract:

- concepts
- architecture patterns
- validation models
- state machines
- edge cases
- player feedback loops
- data-shape ideas

The AI must not copy:

- proprietary code
- assets
- comments
- names
- exact identifiers
- texture/audio/model content
- franchise-specific mechanics without Sandbots justification

## Context Budget

Material reading must stay narrow. If the task requires broad material reading,
the AI must stop and split the work into a documentation or investigation slice
before implementing.

Signals that the task is too broad:

- more than 8 files need reading
- more than 3 files need editing
- multiple runtime systems are involved
- the AI cannot state a concrete Sandbots translation
- validation would require trial-and-error in camera, render frame or global
  gameplay loops

## Current Example Translation

Minecraft source-code reading has already produced useful Sandbots-native
patterns:

- `RecipeBook` becomes a station recipe book with `known`, `seen`, `isNew` and
  `canCraft`.
- advancement criteria become task criteria and objective requirement groups.
- loot tables can become resource drop pools.
- block-state predicates can become cell-state contracts for build previews.

These translations are original Sandbots systems and should remain separated
from external names and implementation details.
