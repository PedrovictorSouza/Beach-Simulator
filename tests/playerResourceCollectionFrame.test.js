import { describe, expect, it, vi } from "vitest";

import { createPlayerResourceCollectionFrameRuntime } from "../app/player/playerResourceCollectionFrame.js";

function createRuntime(overrides = {}) {
  const session = overrides.session || {
    playerCharacter: {
      getPosition: vi.fn(() => [0, 0, 0])
    },
    woodDrops: [
      { id: "wood-a", collected: false, position: [1, 0, 2], size: [1, 1] },
      { id: "wood-b", collected: false, position: [2, 0, 3], size: [1, 1] }
    ],
    resourceNodes: [
      { id: "leaf-node", itemId: "leaves", active: true, cooldown: 0, yield: 2, position: [3, 0, 4] },
      { id: "gear-node", itemId: "gear", active: true, cooldown: 0, yield: 1, position: [4, 0, 5] },
      { id: "carbon-node", itemId: "carbon", active: true, cooldown: 0, yield: 1, position: [5, 0, 6] }
    ],
    leppaBerryDrops: [
      { id: "berry-a", collected: false, position: [6, 0, 7], size: [1, 1] }
    ]
  };
  const controls = overrides.controls || {
    inventory: { wood: 0, leaves: 0, gear: 0, carbon: 0, pulseBerry: 0 },
    storyState: {
      flags: {
        bulbasaurStrawBedChallengeCompletionNoticePending: true
      }
    }
  };
  const gameplay = overrides.gameplay || {
    collectWoodDrops: vi.fn((position, woodDrops) => {
      woodDrops[0].collected = true;
      woodDrops[1].collected = true;
      return 2;
    }),
    collectLeafDrops: vi.fn(() => 0),
    collectLeafResourceNodes: vi.fn((position, resourceNodes) => {
      resourceNodes[0].active = false;
      resourceNodes[0].cooldown = 5;
      return 2;
    }),
    collectGearResourceNodes: vi.fn((position, resourceNodes) => {
      resourceNodes[1].active = false;
      resourceNodes[1].cooldown = 5;
      return 1;
    }),
    collectCarbonResourceNodes: vi.fn((position, resourceNodes) => {
      resourceNodes[2].active = false;
      resourceNodes[2].cooldown = 5;
      return 1;
    }),
    collectLeppaBerryDrops: vi.fn((position, leppaBerryDrops) => {
      leppaBerryDrops[0].collected = true;
      return 1;
    })
  };
  const feedback = {
    triggerWoodCollectPop: vi.fn(),
    playWoodGrab: vi.fn(),
    syncInventoryUi: vi.fn(),
    queueSupplyPickupFlyItems: vi.fn(),
    pushNotice: vi.fn(),
    triggerSupplyCounterPrompt: vi.fn(),
    pushSupplyResourceCollectFeedback: vi.fn(),
    triggerGearPickupParticles: vi.fn(),
    getHabitatCheckCompleteNotice: vi.fn(() => "Habitat check complete"),
    ...overrides.feedback
  };

  return {
    runtime: createPlayerResourceCollectionFrameRuntime({
      session,
      controls,
      gameplay,
      feedback,
      itemIds: {
        wood: "wood",
        leaves: "leaves",
        gear: "gear",
        carbon: "carbon",
        leppaBerry: "pulseBerry"
      },
      labels: {
        leaves: "Leaves",
        gear: "Gear",
        carbon: "Carbon",
        leppaBerry: "Pulse Berry"
      }
    }),
    session,
    controls,
    gameplay,
    feedback
  };
}

describe("player resource collection frame", () => {
  it("collects passive resources and preserves the existing feedback contract", () => {
    const { runtime, controls, feedback } = createRuntime();

    const result = runtime.update({
      now: 1500,
      cinematicActive: false,
      tutorialActive: false,
      pokedexModalOpen: false,
      skillLearnActive: false,
      scriptedInteractionActive: false
    });

    expect(result).toEqual({
      collectedAny: true,
      collectedWoodCount: 2,
      collectedLeafCount: 2,
      collectedGearCount: 1,
      collectedCarbonCount: 1,
      collectedLeppaBerryCount: 1
    });
    expect(feedback.triggerWoodCollectPop).toHaveBeenCalledWith(expect.any(Map));
    expect(feedback.playWoodGrab).toHaveBeenNthCalledWith(1, {
      active: true,
      nowSeconds: 1.5
    });
    expect(feedback.playWoodGrab).toHaveBeenNthCalledWith(2, {
      active: true,
      nowSeconds: 1.525
    });
    expect(feedback.syncInventoryUi).toHaveBeenCalledWith(controls.inventory);
    expect(feedback.queueSupplyPickupFlyItems).toHaveBeenCalledWith("wood", [
      [1, 0, 2],
      [2, 0, 3]
    ]);
    expect(feedback.pushNotice).toHaveBeenCalledWith("+2 Wood");
    expect(feedback.triggerSupplyCounterPrompt).toHaveBeenCalledWith("wood", controls.inventory, 1500);
    expect(controls.storyState.flags.bulbasaurStrawBedChallengeCompletionNoticePending).toBe(false);
    expect(feedback.pushNotice).toHaveBeenCalledWith("Habitat check complete");
    expect(feedback.pushSupplyResourceCollectFeedback).toHaveBeenCalledWith({
      itemId: "leaves",
      count: 2,
      sourcePositions: [
        [3, 0, 4],
        [3, 0, 4]
      ],
      label: "Leaves",
      now: 1500
    });
    expect(feedback.triggerGearPickupParticles).toHaveBeenCalledWith([[4, 0, 5]]);
    expect(feedback.pushSupplyResourceCollectFeedback).toHaveBeenCalledWith({
      itemId: "gear",
      count: 1,
      sourcePositions: [[4, 0, 5]],
      label: "Gear",
      now: 1500
    });
    expect(feedback.pushSupplyResourceCollectFeedback).toHaveBeenCalledWith({
      itemId: "carbon",
      count: 1,
      sourcePositions: [[5, 0, 6]],
      label: "Carbon",
      now: 1500
    });
    expect(feedback.queueSupplyPickupFlyItems).toHaveBeenCalledWith("pulseBerry", [[6, 0, 7]]);
    expect(feedback.pushNotice).toHaveBeenCalledWith("+1 Pulse Berry");
    expect(feedback.triggerSupplyCounterPrompt).toHaveBeenCalledWith("pulseBerry", controls.inventory, 1500);
  });

  it("does not collect while player collection is frame-blocked", () => {
    const { runtime, gameplay, feedback } = createRuntime();

    const result = runtime.update({
      now: 1500,
      cinematicActive: true
    });

    expect(result.collectedAny).toBe(false);
    expect(gameplay.collectWoodDrops).not.toHaveBeenCalled();
    expect(feedback.pushNotice).not.toHaveBeenCalled();
  });
});
