# Change: Materials-Driven Implementation Workflow

## Summary

Introduce a permanent implementation workflow requiring the AI to inspect the
`materials/` folder before implementing gameplay, world, grid, block, inventory,
construction, camera, interaction, or simulation systems.

The AI must use the material as technical reference only, extracting intent,
patterns, data structures, edge cases, and behavior models, then reimplementing
original systems inside our game codebase.

The goal is to avoid repeated manual prompting from the user and make the AI
proactively consult the available reference material whenever it is relevant.

## Motivation

The project needs a more autonomous implementation process.

The AI currently tends to implement systems in isolation, without checking the
reference material that already exists in the repository. This causes shallow
implementations, naming drift, missing edge cases, and repeated user
intervention.

This change creates a rule: before touching a relevant system, the AI must look
at `materials/`, understand what is applicable, map it to our game, and implement
only safe, original, maintainable slices.

## Goals

- Make `materials/` a mandatory reference source for relevant implementation
  work.
- Reduce the need for the user to repeatedly say "look at the source/reference
  first".
- Preserve clean, scalable, original code.
- Avoid blind copying.
- Avoid overengineering.
- Implement small safe steps with clear understanding.
- Respect the current game design direction.
- Translate external concepts into our own architecture and naming.

## Non-Goals

- Do not clone Minecraft.
- Do not copy proprietary code, assets, names, textures, comments, identifiers,
  or internal implementation directly.
- Do not force the game to become Minecraft-like.
- Do not rewrite stable systems without a clear reason.
- Do not introduce large ambiguous refactors.
- Do not implement systems the AI does not fully understand.

## What Changes

- Adds an implementation workflow requirement that relevant coding tasks must
  start by checking local reference material.
- Defines how to read references narrowly, extract reusable patterns and map them
  to Sandbots.
- Requires explicit source notes in the implementation preflight when material
  informed the task.
- Keeps implementation scope small, testable and original.

## Preflight

- Objective: make material-driven implementation a formal OpenSpec workflow.
- Likely files involved: only OpenSpec documentation in this change.
- Smallest safe change: add proposal, design, tasks and spec delta.
- Files not to touch: runtime, gameplay, camera, UI, input, inventory and
  construction code.
- Risk: making the rule too broad and encouraging context-heavy reads.
- Size: small documentation/spec slice.
