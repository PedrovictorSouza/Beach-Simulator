import { describe, expect, it } from "vitest";
import {
  createRecipeBuildCostRegistry,
  normalizeRecipeBuildCostModel,
  normalizeRecipeResourceEntries,
  recipeResourceEntriesToMap
} from "../app/gameplay/recipeBuildCostModel.js";

describe("recipe/build cost model", () => {
  it("normalizes Workbench-style recipes into immutable cost and output entries", () => {
    const model = normalizeRecipeBuildCostModel({
      id: "greenhouse",
      title: "Greenhouse",
      stationId: "workbench",
      ingredients: { gear: 5 },
      output: { greenhouse: 1 },
      tags: ["starter", "restoration", "starter"]
    });

    expect(model).toEqual({
      id: "greenhouse",
      label: "Greenhouse",
      kind: "recipe",
      group: null,
      stationId: "workbench",
      sourceId: null,
      outputItemId: "greenhouse",
      tags: ["starter", "restoration"],
      cost: [
        { itemId: "gear", quantity: 5, data: null, role: null, optional: false }
      ],
      output: [
        { itemId: "greenhouse", quantity: 1, data: null, role: null, optional: false }
      ],
      costMap: { gear: 5 },
      outputMap: { greenhouse: 1 },
      totalCostQuantity: 5,
      totalOutputQuantity: 1,
      metadata: {}
    });
    expect(Object.isFrozen(model)).toBe(true);
    expect(Object.isFrozen(model.cost)).toBe(true);
    expect(Object.isFrozen(model.output)).toBe(true);
    expect(Object.isFrozen(model.costMap)).toBe(true);
  });

  it("normalizes single build material costs", () => {
    const model = normalizeRecipeBuildCostModel({
      id: "foundation-wall",
      kind: "build-cost",
      label: "Foundation Wall",
      materialCost: { itemId: "wood", quantity: 1 },
      metadata: { footprint: { width: 1, height: 1 } }
    });

    expect(model).toMatchObject({
      id: "foundation-wall",
      kind: "build-cost",
      label: "Foundation Wall",
      outputItemId: null,
      cost: [
        { itemId: "wood", quantity: 1, data: null, role: null, optional: false }
      ],
      output: [],
      costMap: { wood: 1 },
      outputMap: {},
      totalCostQuantity: 1,
      totalOutputQuantity: 0,
      metadata: { footprint: { width: 1, height: 1 } }
    });
    expect(Object.isFrozen(model.metadata)).toBe(true);
  });

  it("normalizes array resources with data and keeps them out of simple maps", () => {
    const entries = normalizeRecipeResourceEntries([
      { itemId: "pulseBerry", quantity: 1, data: { ripe: true } },
      { itemId: "nitrogen", amount: 1, role: "nutrient" },
      { itemId: "nitrogen", quantity: 2 }
    ], { fieldName: "cost" });

    expect(entries).toEqual([
      { itemId: "pulseBerry", quantity: 1, data: { ripe: true }, role: null, optional: false },
      { itemId: "nitrogen", quantity: 1, data: null, role: "nutrient", optional: false },
      { itemId: "nitrogen", quantity: 2, data: null, role: null, optional: false }
    ]);
    expect(recipeResourceEntriesToMap(entries)).toEqual({ nitrogen: 3 });
    expect(Object.isFrozen(entries[0].data)).toBe(true);
  });

  it("creates a registry for recipe and build cost models", () => {
    const registry = createRecipeBuildCostRegistry([
      {
        id: "greenhouse",
        stationId: "workbench",
        ingredients: { gear: 5 },
        output: { greenhouse: 1 }
      },
      {
        id: "foundation-wall",
        kind: "build-cost",
        materialCost: { itemId: "wood", quantity: 1 }
      },
      {
        id: "leaf-culture",
        stationId: "greenhouse",
        ingredients: { leaves: 1, nitrogen: 1 },
        output: { leaves: 3 }
      }
    ]);

    expect(registry.size).toBe(3);
    expect(registry.has("greenhouse")).toBe(true);
    expect(registry.get("greenhouse")?.costMap).toEqual({ gear: 5 });
    expect(registry.require("leaf-culture")?.outputMap).toEqual({ leaves: 3 });
    expect(registry.getByIndex(1)?.id).toBe("foundation-wall");
    expect(registry.indexOf("leaf-culture")).toBe(2);
    expect(registry.ids()).toEqual(["greenhouse", "foundation-wall", "leaf-culture"]);
    expect(registry.listByKind("build-cost").map((entry) => entry.id)).toEqual(["foundation-wall"]);
    expect(registry.listByStation("greenhouse").map((entry) => entry.id)).toEqual(["leaf-culture"]);
  });

  it("rejects malformed recipe/build cost models", () => {
    expect(() => normalizeRecipeBuildCostModel(null))
      .toThrow("recipe/build cost model at index 0 must be an object");
    expect(() => normalizeRecipeBuildCostModel({ label: "Missing id" }))
      .toThrow("recipe/build cost model at index 0 requires an id");
    expect(() => normalizeRecipeResourceEntries([{ quantity: 1 }], { fieldName: "cost" }))
      .toThrow("cost entry at index 0 requires an itemId");
    expect(() => normalizeRecipeResourceEntries({ wood: 0 }, { fieldName: "cost" }))
      .toThrow("cost quantity for wood must be greater than 0");
    expect(() => createRecipeBuildCostRegistry(null))
      .toThrow("recipe/build cost registry entries must be an array");
    expect(() => createRecipeBuildCostRegistry([{ id: "dup" }, { id: "dup" }]))
      .toThrow("Duplicate recipe/build cost id: dup");
    expect(() => createRecipeBuildCostRegistry([{ id: "wood-wall" }]).require("missing"))
      .toThrow("Unknown recipe/build cost id: missing");
  });
});
