import { describe, expect, it, vi } from "vitest";
import { GEAR_ITEM_ID, LEAVES_ITEM_ID } from "../gameplayContent.js";
import { createEmptySession } from "../app/session/createEmptySession.js";
import { initializeGameplayState } from "../app/session/initializeGameplatState.js";
import {
  collectWoodDrops,
  collectGearResourceNodes,
  updateResourceNodes
} from "../world/islandWorld.js";

describe("gameplay field resource drops", () => {
  it("starts the planet with an exploration-sized supply of sturdy sticks and leaf piles", () => {
    const session = createEmptySession();

    initializeGameplayState(session, {
      storyState: {},
      inventory: {},
      resetGameplayRuntimeState: vi.fn(),
      syncInventoryUi: vi.fn(),
      syncHudMeta: vi.fn(),
      renderMissionCards: vi.fn()
    });

    const positions = session.woodDrops.map((drop) => drop.position);
    const xs = positions.map((position) => position[0]);
    const zs = positions.map((position) => position[2]);
    const leafNodes = session.resourceNodes.filter((node) => node.itemId === LEAVES_ITEM_ID);
    const gearNodes = session.resourceNodes.filter((node) => node.itemId === GEAR_ITEM_ID);
    const elevatedGearNodes = gearNodes.filter((node) => Number(node.position?.[1] || 0) > 1);
    expect(session.woodDrops.length).toBeGreaterThanOrEqual(14);
    expect(session.woodDrops.length).toBeLessThanOrEqual(18);
    expect(new Set(session.woodDrops.map((drop) => drop.id)).size).toBe(session.woodDrops.length);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(180);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(80);
    expect(positions.every((position) => Math.hypot(position[0] - 1.42, position[2] - 62.48) >= 18)).toBe(true);
    expect(positions.every((position) => Math.hypot(position[0] - 12, position[2] + 3.5) >= 20)).toBe(true);
    expect(session.woodDrops.every((drop) => drop.collected === false)).toBe(true);
    expect(leafNodes.length).toBe(5);
    expect(new Set(leafNodes.map((node) => node.id)).size).toBe(leafNodes.length);
    expect(gearNodes.length).toBeGreaterThanOrEqual(10);
    expect(gearNodes.length).toBeLessThanOrEqual(12);
    expect(new Set(gearNodes.map((node) => node.id)).size).toBe(gearNodes.length);
    expect(elevatedGearNodes.length).toBeGreaterThanOrEqual(4);
    expect(Math.max(...elevatedGearNodes.map((node) => node.position[1]))).toBeGreaterThan(15);
    expect(elevatedGearNodes.every((node) => node.terrainSafeZone === false)).toBe(true);
    expect(gearNodes.every((node) => node.usesModelInstance === true)).toBe(true);
    expect(gearNodes.every((node) => Number(node.spinYawSpeed) > 0)).toBe(true);
    expect(gearNodes.every((node) => node.activeWhen({}) === true)).toBe(true);
  });

  it("collects gear supplies from world resource nodes", () => {
    const inventory = {
      [GEAR_ITEM_ID]: 0
    };
    const resourceNodes = [
      {
        id: "gear-supply-test",
        itemId: GEAR_ITEM_ID,
        position: [1, 0.03, 1],
        yield: 2,
        respawnDuration: 18,
        interactDistance: 0.75,
        cooldown: 0,
        activeWhen: () => true
      }
    ];

    expect(collectGearResourceNodes(
      [1.1, 0, 1.05],
      resourceNodes,
      { flags: {} },
      inventory
    )).toBe(2);
    expect(inventory[GEAR_ITEM_ID]).toBe(2);
    expect(resourceNodes[0].cooldown).toBe(18);
    expect(resourceNodes[0].active).toBe(false);
  });

  it("respawns collected wood drops after their ecosystem cooldown", () => {
    const woodDrops = [
      {
        id: "wood-1",
        position: [0, 0.02, 0],
        size: [0.78, 0.78],
        pickupRadius: 0.64,
        collected: false,
        respawnDuration: 3
      }
    ];
    const inventory = { wood: 0 };

    expect(collectWoodDrops([0, 0, 0], woodDrops, inventory)).toBe(1);
    expect(inventory.wood).toBe(1);
    expect(woodDrops[0].collected).toBe(true);
    expect(woodDrops[0].cooldown).toBe(3);

    updateResourceNodes(2, woodDrops);
    expect(woodDrops[0].collected).toBe(true);
    expect(woodDrops[0].cooldown).toBe(1);

    updateResourceNodes(1, woodDrops);
    expect(woodDrops[0].collected).toBe(false);
    expect(woodDrops[0].cooldown).toBe(0);
  });
});
