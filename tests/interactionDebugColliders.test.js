import { describe, expect, it, vi } from "vitest";

import {
  createDebugAreaCollider,
  getActorDebugPosition,
  getInteractionDebugColliders
} from "../app/runtime/interactionDebugColliders.js";

describe("interaction debug colliders", () => {
  it("creates area colliders on the ground plane", () => {
    expect(createDebugAreaCollider({
      id: "test",
      position: [1, 9, 2],
      radius: 0.5,
      surfaceY: 0.1,
      blocksPlayer: true
    })).toEqual({
      id: "test",
      position: [1, 0.1, 2],
      size: [1, 0.12, 1],
      surfaceY: 0.18,
      blocksPlayer: true
    });

    expect(createDebugAreaCollider({ id: "missing-position", radius: 1 })).toBeNull();
  });

  it("resolves actor debug positions from character, position, then offset", () => {
    expect(getActorDebugPosition({
      character: { getPosition: () => [1, 0, 2] },
      position: [3, 0, 4],
      offset: [5, 0, 6]
    })).toEqual([1, 0, 2]);

    expect(getActorDebugPosition({ position: [3, 0, 4], offset: [5, 0, 6] })).toEqual([3, 0, 4]);
    expect(getActorDebugPosition({ offset: [5, 0, 6] })).toEqual([5, 0, 6]);
    expect(getActorDebugPosition({ position: "invalid" })).toBeNull();
  });

  it("builds active interaction colliders without mutating session state", () => {
    const npc = {
      id: "npc-a",
      character: { getPosition: vi.fn(() => [1, 0, 2]) },
      interactDistance: 1.25
    };
    const hiddenNpc = { id: "npc-hidden", position: [9, 0, 9], interactDistance: 1 };
    const session = {
      npcActors: [npc, hiddenNpc],
      interactables: [{ id: "bench", position: [3, 0, 4] }],
      resourceNodes: [{ id: "berry", position: [5, 0, 6], pickupRadius: 0.75 }],
      bulbasaurEncounter: { visible: true, position: [7, 0, 8] },
      woodDrops: [{ id: "wood-a", position: [9, 0, 10] }],
      fieldDrops: [{ itemId: "leaf", position: [11, 0, 12], pickupRadius: 1.3 }],
      leppaBerryDrops: []
    };
    const storyState = {};
    const rendering = {
      isNpcActive: vi.fn((actor) => actor !== hiddenNpc),
      isInteractableActive: vi.fn(() => true),
      isResourceNodeActive: vi.fn(() => true)
    };

    expect(getInteractionDebugColliders({
      session,
      storyState,
      rendering,
      pokemonTalkInteractDistance: 1.5,
      workbenchInteractDistance: 2,
      bulbasaurTalkInteractDistance: 1.75
    }).map((collider) => ({
      id: collider.id,
      position: collider.position,
      size: collider.size
    }))).toEqual([
      { id: "npc-a:talk-trigger", position: [1, 0.1, 2], size: [2.5, 0.12, 2.5] },
      { id: "bench:interact-trigger", position: [3, 0.09, 4], size: [4, 0.12, 4] },
      { id: "berry:pickup-trigger", position: [5, 0.07, 6], size: [1.5, 0.12, 1.5] },
      { id: "grow-bot:talk-trigger", position: [7, 0.12, 8], size: [3.5, 0.12, 3.5] },
      { id: "wood-a:pickup-trigger", position: [9, 0.06, 10], size: [2.2, 0.12, 2.2] },
      { id: "leaf:pickup-trigger", position: [11, 0.06, 12], size: [2.6, 0.12, 2.6] }
    ]);

    expect(rendering.isNpcActive).toHaveBeenCalledWith(npc, storyState);
    expect(npc.character.getPosition).toHaveBeenCalledTimes(1);
    expect(session.npcActors).toHaveLength(2);
  });
});
