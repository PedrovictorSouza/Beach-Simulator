import { describe, expect, it } from "vitest";
import {
  BUILD_REQUIREMENT_STATUS,
  countBuildRequirementInventoryResource,
  formatBuildRequirementSummary,
  validateBuildRequirements
} from "../app/gameplay/buildRequirementValidation.js";

describe("build requirement validation", () => {
  it("marks a recipe as buildable when inventory satisfies every required resource", () => {
    const result = validateBuildRequirements({
      id: "greenhouse",
      label: "Greenhouse",
      stationId: "workbench",
      ingredients: { gear: 5 },
      output: { greenhouse: 1 }
    }, {
      inventory: { gear: 6 },
      stationId: "workbench"
    });

    expect(result).toMatchObject({
      id: "greenhouse",
      canBuild: true,
      status: BUILD_REQUIREMENT_STATUS.READY,
      reasons: [],
      missingResources: []
    });
    expect(result.requiredResources).toEqual([
      {
        itemId: "gear",
        requiredQuantity: 5,
        availableQuantity: 6,
        missingQuantity: 0,
        satisfied: true,
        optional: false,
        role: null,
        data: null
      }
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.requiredResources)).toBe(true);
  });

  it("reports missing resource quantities without mutating inventory", () => {
    const inventory = { gear: 2 };
    const result = validateBuildRequirements({
      id: "solar-station",
      stationId: "workbench",
      ingredients: { gear: 5 }
    }, { inventory });

    expect(result).toMatchObject({
      canBuild: false,
      status: BUILD_REQUIREMENT_STATUS.MISSING_RESOURCES,
      reasons: [BUILD_REQUIREMENT_STATUS.MISSING_RESOURCES],
      missingResources: [
        {
          itemId: "gear",
          requiredQuantity: 5,
          availableQuantity: 2,
          missingQuantity: 3
        }
      ]
    });
    expect(formatBuildRequirementSummary(result, {
      getItemLabel: (itemId) => itemId === "gear" ? "Gear" : itemId
    })).toBe("Gear 2/5");
    expect(inventory).toEqual({ gear: 2 });
  });

  it("keeps station and unlock failures separate from resource availability", () => {
    const result = validateBuildRequirements({
      id: "leaf-culture",
      stationId: "greenhouse",
      ingredients: { leaves: 1 }
    }, {
      inventory: { leaves: 3 },
      stationId: "workbench",
      unlocked: false
    });

    expect(result.canBuild).toBe(false);
    expect(result.status).toBe(BUILD_REQUIREMENT_STATUS.LOCKED);
    expect(result.reasons).toEqual([
      BUILD_REQUIREMENT_STATUS.LOCKED,
      BUILD_REQUIREMENT_STATUS.WRONG_STATION
    ]);
    expect(result.missingResources).toEqual([]);
  });

  it("validates stack inventories with data-specific resources", () => {
    const result = validateBuildRequirements({
      id: "pulse-berry-propagation",
      stationId: "greenhouse",
      cost: [
        { itemId: "pulseBerry", quantity: 1, data: { ripe: true } },
        { itemId: "nitrogen", quantity: 2 }
      ],
      output: { pulseBerry: 2 }
    }, {
      inventory: [
        { itemId: "pulseBerry", quantity: 1, data: { ripe: true } },
        { itemId: "pulseBerry", quantity: 6, data: { ripe: false } },
        { itemId: "nitrogen", quantity: 1 }
      ],
      stationId: "greenhouse"
    });

    expect(result.canBuild).toBe(false);
    expect(result.requiredResources).toEqual([
      {
        itemId: "pulseBerry",
        requiredQuantity: 1,
        availableQuantity: 1,
        missingQuantity: 0,
        satisfied: true,
        optional: false,
        role: null,
        data: { ripe: true }
      },
      {
        itemId: "nitrogen",
        requiredQuantity: 2,
        availableQuantity: 1,
        missingQuantity: 1,
        satisfied: false,
        optional: false,
        role: null,
        data: null
      }
    ]);
    expect(result.missingResources.map((resource) => resource.itemId)).toEqual(["nitrogen"]);
  });

  it("counts inventory resources from map and stack shapes", () => {
    expect(countBuildRequirementInventoryResource({ wood: 3 }, { itemId: "wood" })).toBe(3);
    expect(countBuildRequirementInventoryResource([
      { itemId: "wood", quantity: 2 },
      { itemId: "wood", quantity: 4, data: { treated: true } },
      { itemId: "stone", quantity: 9 }
    ], { itemId: "wood" })).toBe(6);
    expect(countBuildRequirementInventoryResource([
      { itemId: "wood", quantity: 2 },
      { itemId: "wood", quantity: 4, data: { treated: true } }
    ], { itemId: "wood", data: { treated: true } })).toBe(4);
    expect(countBuildRequirementInventoryResource(null, { itemId: "wood" })).toBe(0);
  });

  it("can format all requirement rows for UI affordances", () => {
    const result = validateBuildRequirements({
      id: "foundation-wall",
      kind: "build-cost",
      materialCost: { itemId: "wood", quantity: 1 }
    }, {
      inventory: { wood: 4 }
    });

    expect(formatBuildRequirementSummary(result, {
      includeSatisfied: true,
      getItemLabel: (itemId) => itemId === "wood" ? "Wood" : itemId
    })).toBe("Wood 4/1");
  });
});
