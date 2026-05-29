# Materials Implementation Backlog

This backlog is generated from the `materials/` reference source.

The material is used for behavior study only. Sandbots must receive original, clean-room implementations adapted to its own architecture.

No source code, comments, assets, proprietary identifiers, or implementation structure should be copied directly.

## Status Legend

- `todo`
- `doing`
- `done`
- `blocked`
- `deferred`

## Backlog

### 1. World / Grid Foundation

- [x] Define Sandbots world coordinate model
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/util/math/BlockPos.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/nbt/NBTUtil.java`
  - Sandbots mapping: world positions are normalized `x/y/z` values; ground grid cells are normalized `x/y` values where cell `x` maps to world `x`, cell `y` maps to world `z`, and world `y` remains elevation.
  - Behavior to adapt: stable integer coordinate objects, deterministic cell keys, moved-origin conversion, and explicit serialization-friendly coordinate shapes.
  - Ignore: Minecraft chunks, packed long coordinates, mutable/pooled positions, block height stacks, proprietary class names, and source implementation structure.
  - Likely files: `app/gameplay/worldCoordinateModel.js`; `tests/worldCoordinateModel.test.js`
  - Safe first slice: Pure coordinate model helpers only, with no runtime integration into camera, input, render, or construction systems.

- [x] Define grid cell addressing helpers
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/util/math/BlockPos.java`
  - Sandbots mapping: Sandbots grid helpers operate on immutable `x/y` cell objects, with cardinal offsets, equality, deterministic ranges, and rectangular footprint helpers.
  - Behavior to adapt: integer-cell offsets, cardinal neighbor stepping, and inclusive min/max cell iteration.
  - Ignore: mutable pooled positions, 3D vertical iteration, chunk traversal, and direct Minecraft method names.
  - Likely files: `app/gameplay/worldCoordinateModel.js`; `tests/worldCoordinateModel.test.js`
  - Safe first slice: Add standalone addressing helpers and tests without replacing existing runtime grid/building helpers yet.

- [x] Define world bounds and valid placement area
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/border/WorldBorder.java`
  - Sandbots mapping: Sandbots placement areas are rectangular grid-cell bounds with optional allowed cells and blocked cells, independent from runtime object placement.
  - Behavior to adapt: explicit min/max bounds, inside checks, clamping to bounds, and rejecting placements that do not fully fit inside the valid area.
  - Ignore: dynamic border animation, multiplayer sync/listeners, chunk checks, entity damage/warnings, and global Minecraft world-size constants.
  - Likely files: `app/gameplay/worldCoordinateModel.js`; `tests/worldCoordinateModel.test.js`
  - Safe first slice: Add standalone bounds and placement-area helpers, with no migration of current construction systems yet.

- [x] Add debug grid visualization
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/client/renderer/debug/DebugRenderer.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/client/renderer/debug/DebugRendererChunkBorder.java`
  - Sandbots mapping: Sandbots debug visualization is a renderer-agnostic payload of grid cells, labels, states, world centers, and cell sizes for future UI/canvas overlays.
  - Behavior to adapt: keep debug rendering separate from gameplay rules, derive visible debug cells from stable grid/bounds data, and label cells at their world centers.
  - Ignore: OpenGL/Tessellator calls, chunk-specific rendering, camera-relative draw calls, and Minecraft debug toggles.
  - Likely files: `app/gameplay/worldCoordinateModel.js`; `tests/worldCoordinateModel.test.js`
  - Safe first slice: Generate debug visualization data only, without attaching it to runtime render, input, or UI overlays yet.

---

### 2. Block / Object Registry

- [x] Create Sandbots-native object registry
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/util/registry/RegistryNamespaced.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/block/Block.java`
  - Sandbots mapping: Sandbots world objects now have a standalone immutable registry with stable id lookup, insertion order, optional fallback lookup, index lookup, and required-id errors.
  - Behavior to adapt: keyed registration, reverse/index lookup behavior, duplicate-id rejection, and stable immutable records.
  - Ignore: numeric packed block state ids, default Minecraft block ids, `ResourceLocation` syntax, mutable global static registration, and item/block class hierarchies.
  - Likely files: `app/gameplay/worldObjectRegistry.js`; `tests/worldObjectRegistry.test.js`
  - Safe first slice: Create the registry contract and tests only, without migrating `worldObjectCatalog.js` or runtime lookups yet.

- [x] Add object metadata model
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/block/Block.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/block/material/Material.java`
  - Sandbots mapping: Sandbots world object metadata now has a normalized immutable model for id, label, kind, placement mode, tags, lifecycle, emits, position, footprint, activation, runtime refs, and related recipe/placeable ids.
  - Behavior to adapt: separate object identity from object properties, keep material-like properties as data, normalize shape once before registry lookup, and freeze nested metadata.
  - Ignore: Minecraft material flags, map colors, hardness/resistance values, sound types, creative tabs, block state conversion, and obfuscated method names.
  - Likely files: `app/gameplay/worldObjectRegistry.js`; `tests/worldObjectRegistry.test.js`
  - Safe first slice: Add metadata normalization to the standalone registry without validating domain enums or migrating current catalogs yet.

- [x] Add object categories
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/creativetab/CreativeTabs.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/block/Block.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/Item.java`
  - Sandbots mapping: World objects expose category ids derived from explicit categories, kind, placement mode, and tags.
  - Behavior to adapt: Keep categories as a filter/grouping layer separate from object identity, so menus and debug tools can query objects without hardcoded ids.
  - Ignore: Minecraft creative-tab rendering, icons, search tab, enchantment tabs, and item-stack population.
  - Likely files: `app/gameplay/worldObjectRegistry.js`; `tests/worldObjectRegistry.test.js`
  - Safe first slice: Add immutable category metadata and registry category queries without changing the live catalog or UI.

- [x] Add placement rules per object type
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/block/Block.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/ItemDoor.java`
  - Sandbots mapping: World object metadata now includes immutable placement rules with defaults by placement mode and per-object overrides.
  - Behavior to adapt: Keep the placement predicate/rules owned by the object definition while action code can ask for those rules later.
  - Ignore: Minecraft world mutation, item stack consumption, block face math, sound playback, and obfuscated implementation structure.
  - Likely files: `app/gameplay/worldObjectRegistry.js`; `tests/worldObjectRegistry.test.js`
  - Safe first slice: Normalize/query placement rules only, without wiring them into runtime construction validation yet.

---

### 3. Placement / Breaking

- [x] Implement basic placement validation
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/block/Block.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/ItemBlock.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/ItemDoor.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/entity/player/EntityPlayer.java`
  - Sandbots mapping: Placement validation is a pure contract that checks object placement rules against target cell, bounds, occupancy, source item metadata, grid placeable metadata, and authored world position.
  - Behavior to adapt: Validate before mutation and return explicit failure reasons, keeping action/input code separate from object placement rules.
  - Ignore: Minecraft world mutation, block state replacement, player permission internals, item stack decrement, sound playback, and block-face orientation math.
  - Likely files: `app/gameplay/worldObjectPlacementValidation.js`; `tests/worldObjectPlacementValidation.test.js`
  - Safe first slice: Add a standalone validator without wiring it into the live construction flow yet.

- [x] Implement object placement preview
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/client/renderer/RenderGlobal.java`; existing Sandbots `app/gameplay/gridBuildingSystem.js` placement preview contract.
  - Sandbots mapping: Object placement preview now produces a renderer-ready descriptor with validation state, reason, footprint cells, outline state, visual tint, and confirm readiness.
  - Behavior to adapt: Preview should be derived from target validation and remain separate from world mutation.
  - Ignore: Minecraft GL state, tessellation, block AABB rendering, camera interpolation, and immediate render calls.
  - Likely files: `app/gameplay/worldObjectPlacementPreview.js`; `tests/worldObjectPlacementPreview.test.js`
  - Safe first slice: Add a pure preview descriptor without wiring it into the live renderer or construction controller.

- [x] Implement confirm placement action
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/ItemBlock.java`; existing Sandbots `app/gameplay/gridBuildingSystem.js` occupancy adapter and `app/gameplay/placementConsumptionContract.js`.
  - Sandbots mapping: Placement confirmation validates preview readiness, creates a placement record, optionally commits through a provided store adapter, and returns placement/consume effects.
  - Behavior to adapt: Confirm only after validation succeeds, then mutate through a narrow adapter and report whether commit succeeded.
  - Ignore: Minecraft block state construction, NBT transfer, sound playback, criteria triggers, and direct inventory mutation.
  - Likely files: `app/gameplay/worldObjectPlacementConfirmation.js`; `tests/worldObjectPlacementConfirmation.test.js`
  - Safe first slice: Add a standalone confirmation contract without wiring it into live input or construction controllers yet.

- [x] Implement object removal/breaking action
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/block/Block.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/server/management/PlayerInteractionManager.java`; existing Sandbots `app/gameplay/gridBuildingSystem.js` and `app/gameplay/freeBlockBuildSystem.js` removal flows.
  - Sandbots mapping: Object removal is a standalone contract that resolves a target record, blocks locked/non-removable records, optionally commits through a store adapter, and returns removal/release-footprint effects.
  - Behavior to adapt: Run removal through narrow hooks/adapters and report clear failure reasons before mutating occupancy.
  - Ignore: Minecraft block state replacement, drops, harvest XP, tool durability, sound playback, and direct renderer cleanup.
  - Likely files: `app/gameplay/worldObjectRemovalAction.js`; `tests/worldObjectRemovalAction.test.js`
  - Safe first slice: Add a pure removal action contract without wiring it into live destroy input, inventory refunds, or instance cleanup yet.

- [x] Add invalid placement feedback
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/ItemBlock.java`; existing Sandbots `app/gameplay/actionFeedbackContracts.js` and `app/gameplay/colonyFeedbackContracts.js`.
  - Sandbots mapping: Placement failure reasons now resolve to stable UI feedback with channels, message, world prompt, severity, visual state, repeatability, and cooldown.
  - Behavior to adapt: Failed placement should return a clear, low-noise response instead of mutating state or failing silently.
  - Ignore: Minecraft enum action handling, sound playback, localization system, and direct HUD rendering.
  - Likely files: `app/gameplay/worldObjectPlacementFeedback.js`; `tests/worldObjectPlacementFeedback.test.js`
  - Safe first slice: Add a pure feedback resolver without wiring it into the live HUD or placement controller yet.

---

### 4. World Storage

- [x] Define in-memory world storage
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/IBlockAccess.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/World.java`; existing Sandbots `app/gameplay/gridBuildingSystem.js` occupancy store.
  - Sandbots mapping: World objects now have a standalone in-memory store keyed by `placedObjectId`, with normalized immutable records, footprint cells, runtime refs, and data payloads.
  - Behavior to adapt: Keep world reads/writes behind a small storage interface instead of letting systems own scattered arrays/maps.
  - Ignore: Minecraft chunk loading, lighting, weather, tile entity ticks, block states, networking, and persistence.
  - Likely files: `app/gameplay/worldObjectMemoryStore.js`; `tests/worldObjectMemoryStore.test.js`
  - Safe first slice: Add add/get/list/require/id storage only; coordinate lookup and update/remove operations remain separate backlog tasks.

- [x] Add lookup by grid coordinate
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/IBlockAccess.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/World.java`; existing Sandbots `app/gameplay/gridBuildingSystem.js` occupancy store.
  - Sandbots mapping: The in-memory world object store now maintains a cell index from normalized grid coordinates to placed object records.
  - Behavior to adapt: World systems should be able to answer "what object occupies this cell?" through a small coordinate lookup interface.
  - Ignore: Minecraft chunk fetch internals, tile entity lifecycle, block states, lighting, and lazy chunk creation.
  - Likely files: `app/gameplay/worldObjectMemoryStore.js`; `tests/worldObjectMemoryStore.test.js`
  - Safe first slice: Add `getObjectAt(cell)` and `hasObjectAt(cell)`, index every occupied footprint cell, and reject overlapping inserts.

- [x] Add update/remove world object operations
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/World.java`; existing Sandbots `app/gameplay/gridBuildingSystem.js` occupancy store; `app/gameplay/worldObjectRemovalAction.js`.
  - Sandbots mapping: The in-memory world object store now supports removing by placed id or occupied cell, force-removing locked records, and updating records while keeping the cell index consistent.
  - Behavior to adapt: World mutations should pass through storage operations that update both object records and coordinate lookup state together.
  - Ignore: Minecraft block replacement flags, event listeners, drops, neighbor notifications, chunk internals, and renderer cleanup.
  - Likely files: `app/gameplay/worldObjectMemoryStore.js`; `tests/worldObjectMemoryStore.test.js`
  - Safe first slice: Add `removeObject`, `removeObjectAt`, `removePlacedObjectAt`, `updateObject`, and `update` without wiring the store into live gameplay yet.

- [x] Add lightweight region/chunk abstraction only if needed
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/ChunkCache.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/world/chunk/Chunk.java`; existing Sandbots placement-area scanning needs.
  - Sandbots mapping: Sandbots now keeps this as lightweight region queries on the in-memory world object store instead of introducing chunk ownership.
  - Behavior to adapt: Systems can ask which placed objects intersect a cell list or rectangular grid area without scanning every stored record.
  - Ignore: Chunk loading, chunk persistence, world generation, vertical sections, lighting, tile entity creation, and full region-file storage.
  - Likely files: `app/gameplay/worldObjectMemoryStore.js`; `tests/worldObjectMemoryStore.test.js`
  - Safe first slice: Add `listObjectsAtCells`, `listObjectsInArea`, and `hasObjectsInArea` backed by the existing cell index.

---

### 5. Inventory / Resources

- [x] Define item/resource registry
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/Item.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/util/registry/RegistryNamespaced.java`; existing Sandbots inventory/resource usages.
  - Sandbots mapping: Sandbots now has a standalone item/resource registry with normalized immutable item metadata, stable id lookup, fallback lookup, index lookup, categories, groups, kinds, tags, icon metadata, and optional stack metadata.
  - Behavior to adapt: Keep item identity and resource metadata behind a registry instead of spreading hardcoded labels, groups, and ids across gameplay systems.
  - Ignore: Minecraft numeric item ids, item subclasses, NBT, property getters, equipment slots, creative tabs, localization internals, and direct inventory mutation.
  - Likely files: `app/gameplay/itemResourceRegistry.js`; `tests/itemResourceRegistry.test.js`
  - Safe first slice: Add the registry and metadata normalization only; stack operations and inventory add/remove behavior remain separate backlog tasks.

- [x] Implement stackable inventory items
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/ItemStack.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/inventory/InventoryBasic.java`; existing Sandbots item/resource registry.
  - Sandbots mapping: Sandbots now has a pure stack model that resolves stack limits from the item/resource registry, creates immutable item stacks, splits quantities into legal stacks, checks merge compatibility, and merges matching stacks up to capacity.
  - Behavior to adapt: Keep stack quantity, item identity, max stack size, overflow, and merge compatibility as explicit data before wiring inventory mutation.
  - Ignore: Minecraft NBT, damage values, enchantments, equipment slots, container slots, drag behavior, item use actions, and direct inventory mutation.
  - Likely files: `app/gameplay/inventoryItemStack.js`; `tests/inventoryItemStack.test.js`
  - Safe first slice: Add stack helpers only; inventory add/remove operations and capacity rules remain separate backlog tasks.

- [x] Implement add/remove resource operations
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/inventory/InventoryBasic.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/inventory/ItemStackHelper.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/ItemStack.java`; existing Sandbots simple inventory counters.
  - Sandbots mapping: Sandbots now has pure resource operations for stack-list inventories: normalize stacks, count resources, check availability, add resources by filling compatible stacks first, append new legal stacks, remove quantities across matching stacks, and report missing amounts.
  - Behavior to adapt: Resource mutation should be explicit, result-based, and preserve stack identity/metadata instead of directly changing scattered counters.
  - Ignore: Minecraft slots, NBT serialization, drag behavior, item use side effects, equipment slots, crafting grids, and live HUD mutation.
  - Likely files: `app/gameplay/inventoryResourceOperations.js`; `tests/inventoryResourceOperations.test.js`
  - Safe first slice: Add add/remove/count helpers only; slot capacity rules and migration of existing live inventory remain separate tasks.

- [x] Implement inventory capacity rules
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/inventory/IInventory.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/inventory/InventoryBasic.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/inventory/Slot.java`; existing Sandbots stack/resource operations.
  - Sandbots mapping: Sandbots now has pure capacity rules for stack-list inventories, including max slot normalization, capacity summaries, item-specific merge space, empty-slot capacity, fit checks, and add-operation clamping.
  - Behavior to adapt: Capacity should be evaluated before mutating resources, combining slot count limits with per-item max stack size and stack metadata compatibility.
  - Ignore: Minecraft container UI slots, sided inventories, drag behavior, equipment slots, listeners, NBT serialization, and live HUD mutation.
  - Likely files: `app/gameplay/inventoryCapacityRules.js`; `tests/inventoryCapacityRules.test.js`
  - Safe first slice: Add capacity evaluation helpers only; migration of existing live inventory remains separate from this backlog task.

---

### 6. Crafting / Construction

- [x] Define recipe/build cost model
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/crafting/IRecipe.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/crafting/ShapelessRecipes.java`; existing Sandbots `app/gameplay/workbenchRecipeRegistry.js` and `app/gameplay/buildableCatalog.js`.
  - Sandbots mapping: Sandbots now has a standalone recipe/build cost model that normalizes cost and output resources from current Workbench recipe maps, building-kit material costs, and array resource entries.
  - Behavior to adapt: Recipes should expose explicit inputs, outputs, ids, station/kind metadata, totals, and map forms before requirement validation or resource mutation.
  - Ignore: Minecraft shaped-grid matching, recipe book state, remaining-item containers, NBT, unlock criteria, JSON parsing internals, and crafting UI.
  - Likely files: `app/gameplay/recipeBuildCostModel.js`; `tests/recipeBuildCostModel.test.js`
  - Safe first slice: Add model normalization and registry only; validation, consumption, partial construction, and completion state remain separate tasks.

- [x] Implement build requirement validation
  - Status: done
  - Material reference: `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/crafting/ShapelessRecipes.java`; `materials/minecraft-source-code/temp/src/minecraft/net/minecraft/item/crafting/IRecipe.java`; existing Sandbots `app/gameplay/worldObjectRecipeRuntime.js`, `app/gameplay/freeBlockBuildSystem.js`, and `app/gameplay/recipeBuildCostModel.js`.
  - Sandbots mapping: Sandbots now has a pure requirement validator that checks recipe/build costs against map inventories and stack inventories, preserving missing-resource details without mutating resources.
  - Behavior to adapt: Craft/build availability should be computed before confirmation, with explicit missing quantities, station mismatch, and lock reasons separated from later resource consumption.
  - Ignore: Minecraft crafting-grid shape matching, recipe output calculation, container remainders, achievement hooks, recipe book UI, and direct inventory mutation.
  - Likely files: `app/gameplay/buildRequirementValidation.js`; `tests/buildRequirementValidation.test.js`
  - Safe first slice: Add validation and summary formatting only; actual resource consumption and runtime integration remain separate tasks.

- [ ] Implement resource consumption on build
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add partial construction state
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add construction completion state
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

---

### 7. Player Interaction

- [ ] Define interaction target selection
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add interactable object interface
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add contextual interaction prompt
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add input routing for build/interact modes
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

---

### 8. Camera / Targeting

- [ ] Define camera-to-grid targeting
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add world cursor projection
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add cinematic-safe camera constraints
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add camera behavior for construction mode
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

---

### 9. Save / Load

- [ ] Define serializable world state
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Serialize placed objects
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Serialize inventory state
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Restore world from save data
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

---

### 10. Debug / Validation

- [ ] Add debug overlay for selected cell/object
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add validation logs for failed placement
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add smoke test for object placement
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:

- [ ] Add smoke test for save/load roundtrip
  - Status: todo
  - Material reference:
  - Sandbots mapping:
  - Behavior to adapt:
  - Ignore:
  - Likely files:
  - Safe first slice:
