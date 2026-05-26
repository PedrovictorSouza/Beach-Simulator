import { describe, expect, it, vi } from "vitest";
import {
  CHARMANDER_FIRE_CARBON_USES_FLAG,
  canAddPokemonFollower,
  countActivePokemonFollowers,
  createGameplayInteractions
} from "../world/gameplayInteractions.js";
import { HABITAT_EVENT } from "../app/sandbox/habitatData.js";
import {
  BOULDER_SHADED_TALL_GRASS_BOULDER_POSITION,
  CAMPFIRE_ITEM_ID,
  CARBON_ITEM_ID,
  DITTO_FLAG_ITEM_ID,
  GEAR_ITEM_ID,
  GREENHOUSE_ITEM_ID,
  LEAF_DEN_KIT_ITEM_ID,
  LEAVES_ITEM_ID,
  LOG_CHAIR_ITEM_ID,
  PLACEHOLDER_RECIPES,
  STRAW_BED_ITEM_ID
} from "../gameplayContent.js";
import {
  addItems,
  consumeItems
} from "../story/progression.js";
import { findNearbyInteractable } from "../world/islandWorld.js";
import { MOTION_IMPACT_PRESET_IDS } from "../app/motion/motionImpactPresets.js";

function createInteractions(overrides = {}) {
  return createGameplayInteractions({
    npcProfiles: {},
    placeholderRecipes: {},
    getActiveQuest: () => ({
      id: "freeRoam",
      title: "Free Roam",
      actionLabel: "Explore",
    }),
    hasItems: () => true,
    consumeItems: vi.fn(() => true),
    addItems: vi.fn(),
    formatRequirementSummary: () => "",
    getItemLabel: (itemId) => itemId,
    showPokedexEntry: vi.fn(),
    findNearbyInteractable: vi.fn(() => null),
    findNearbyHarvestTarget: vi.fn(() => null),
    findNearbyGroundCell: vi.fn(() => null),
    purifyGroundCell: vi.fn(() => false),
    reviveGroundGrass: vi.fn(),
    strikeNearbyPalm: vi.fn(() => ({
      hit: false,
      felled: false,
      palm: null,
      nextWoodDropId: 1
    })),
    syncInventoryUi: vi.fn(),
    pushNotice: vi.fn(),
    ...overrides
  });
}

describe("createGameplayInteractions", () => {
  it("advances the onboarding quest when talking to Tangrowth", () => {
    const pushNotice = vi.fn();
    let onComplete = null;
    const startDialogue = vi.fn(({ onComplete: nextOnComplete }) => {
      onComplete = nextOnComplete;
      return true;
    });
    const interactions = createInteractions({
      startDialogue,
      getActiveQuest: () => ({
        id: "meetTangrowth",
        title: "Talk to Tangrowth",
        actionLabel: "E / Talk",
        resolveLine: "Tangrowth onboarding complete."
      }),
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Tangrowth"
        },
        distance: 1.2
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {}
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {}
    });

    expect(result).toBe(true);
    expect(startDialogue).toHaveBeenCalledWith({
      targetId: "tangrowth",
      dialogueId: "onboarding",
      onComplete: expect.any(Function)
    });
    expect(storyState.questIndex).toBe(0);
    onComplete();
    expect(storyState.questIndex).toBe(1);
    expect(pushNotice).toHaveBeenCalledWith(
      expect.stringContaining("Tangrowth onboarding complete.")
    );
  });

  it("opens Chopper's first habitat report from the active system quest", () => {
    let onComplete = null;
    const startDialogue = vi.fn(({ onComplete: nextOnComplete }) => {
      onComplete = nextOnComplete;
      return true;
    });
    const questSystem = {
      getActiveQuest: vi.fn(() => ({
        id: "chopper-first-habitat-report"
      })),
      emit: vi.fn()
    };
    const interactions = createInteractions({
      startDialogue,
      questSystem,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Tangrowth"
        },
        distance: 1.2
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 1,
        flags: {}
      },
      inventory: {}
    });

    expect(result).toBe(true);
    expect(startDialogue).toHaveBeenCalledWith({
      targetId: "tangrowth",
      dialogueId: "firstHabitatReport",
      onComplete: expect.any(Function)
    });

    onComplete();
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "TALK",
      targetId: "chopper-first-habitat-report"
    });
  });

  it("escalates repeated empty interactions into a valid input hint", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });
    const action = {
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: { questIndex: 0, flags: {} },
      inventory: {}
    };

    expect(interactions.performInteractAction(action)).toBe(false);
    expect(interactions.performInteractAction(action)).toBe(false);

    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "No interaction nearby. Move closer to a marker, object, or bot, then press E / X."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "Still no interaction. Look for a marker, object, or bot, then press A / E / X."
    );
  });

  it("requests Professor Tangrowth's house-building talk when available", () => {
    const onTangrowthHouseTalkRequested = vi.fn();
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      onTangrowthHouseTalkRequested,
      pushNotice,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Professor Tangrowth"
        },
        distance: 1.05
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          tangrowthHouseTalkAvailable: true
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onTangrowthHouseTalkRequested).toHaveBeenCalledWith({
      targetId: "tangrowth"
    });
    expect(pushNotice).not.toHaveBeenCalled();
  });

  it("purifies a nearby corrupted ground cell when the water power is available", () => {
    const groundCell = {
      id: "ground-1-1",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const groundDeadInstances = [groundCell];
    const groundPurifiedInstances = [];
    const pushNotice = vi.fn();
    const purifyGroundCell = vi.fn(() => true);
    const reviveGroundGrass = vi.fn();
    const onWaterGunImpactMotionRequested = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.32
      })),
      purifyGroundCell,
      reviveGroundGrass,
      onWaterGunImpactMotionRequested,
      pushNotice
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0.1, 0, 0.1],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: {
        questIndex: 0,
        flags: {
          bulbasaurDryGrassMissionComplete: true
        }
      },
      woodDrops: [],
      groundDeadInstances,
      groundGrassPatches: [],
      groundPurifiedInstances,
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(purifyGroundCell).toHaveBeenCalledWith(
      groundCell,
      groundDeadInstances,
      groundPurifiedInstances
    );
    expect(reviveGroundGrass).toHaveBeenCalledWith(groundCell, []);
    expect(onWaterGunImpactMotionRequested).toHaveBeenCalledWith({
      presetId: MOTION_IMPACT_PRESET_IDS.WATER_GUN_HIT,
      groundCell,
      patch: null,
      type: "ground"
    });
    expect(pushNotice).toHaveBeenCalledWith("Ground restored. Soil is viable.");
  });

  it("paints a 3x3 ground grid with one Hydro Jet impact", () => {
    const tileSpan = 1.425;
    const gridCells = [];

    for (let z = -1; z <= 1; z += 1) {
      for (let x = -1; x <= 1; x += 1) {
        gridCells.push({
          id: `ground-${x}-${z}`,
          offset: [x * tileSpan, 0, z * tileSpan],
          scale: 1,
          tileSpan,
          yaw: 0
        });
      }
    }

    const targetCell = gridCells.find((groundCell) => groundCell.id === "ground-0-0");
    const farCell = {
      id: "ground-3-3",
      offset: [tileSpan * 3, 0, tileSpan * 3],
      scale: 1,
      tileSpan,
      yaw: 0
    };
    const groundDeadInstances = [
      ...gridCells,
      farCell
    ];
    const groundPurifiedInstances = [];
    const purifyGroundCell = vi.fn(() => true);
    const onWaterGunImpactMotionRequested = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell: targetCell,
        distance: 0.2
      })),
      purifyGroundCell,
      reviveGroundGrass: vi.fn(() => false),
      reviveGroundFlower: vi.fn(() => false),
      onWaterGunImpactMotionRequested,
      pushNotice: vi.fn()
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0.1, 0, 0.1],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances,
      groundPurifiedInstances,
      groundGrassPatches: [],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(new Set(purifyGroundCell.mock.calls.map((call) => call[0].id))).toEqual(
      new Set(gridCells.map((groundCell) => groundCell.id))
    );
    expect(onWaterGunImpactMotionRequested).toHaveBeenCalledTimes(9);
    expect(purifyGroundCell.mock.calls.map((call) => call[0].id)).not.toContain("ground-3-3");
  });

  it("allows Hydro Jet on empty dry ground before the dry grass mission is complete", () => {
    const groundCell = {
      id: "ground-empty-early",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const purifyGroundCell = vi.fn(() => true);
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell,
      pushNotice
    });

    const inventory = {
      [CARBON_ITEM_ID]: 2
    };
    const storyState = { questIndex: 0, flags: {} };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory,
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      canPurifyGround: true,
      forcedHarvestTarget: {
        groundCell,
        distance: 0
      }
    });

    expect(result).toBe(true);
    expect(purifyGroundCell).toHaveBeenCalledWith(
      groundCell,
      [groundCell],
      []
    );
    expect(pushNotice).toHaveBeenCalledWith("Ground restored. Soil is viable.");
  });

  it("allows Water Gun on dry grass before Bulbasaur's dry grass mission is complete", () => {
    const groundCell = {
      id: "ground-grass-early",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const groundDeadInstances = [groundCell];
    const groundPurifiedInstances = [];
    const groundGrassPatches = [
      {
        id: "dry-grass-early",
        cellId: groundCell.id,
        state: "dead"
      }
    ];
    const purifyGroundCell = vi.fn(() => true);
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell,
      reviveGroundGrass: vi.fn(() => ({
        id: "dry-grass-early",
        cellId: groundCell.id,
        state: "alive"
      })),
      pushNotice: vi.fn()
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances,
      groundPurifiedInstances,
      groundGrassPatches,
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(purifyGroundCell).toHaveBeenCalledWith(
      groundCell,
      groundDeadInstances,
      groundPurifiedInstances
    );
  });

  it("targets the nearest dry ground instead of forcing the player toward dry grass", () => {
    const emptyGroundCell = {
      id: "ground-empty-nearby",
      offset: [0.1, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const dryGrassGroundCell = {
      id: "ground-dry-grass-visible",
      offset: [1, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const groundDeadInstances = [emptyGroundCell, dryGrassGroundCell];
    const groundGrassPatches = [
      {
        id: "dry-grass-visible",
        cellId: dryGrassGroundCell.id,
        position: [1, 0.02, 0],
        size: [1.18, 0.96],
        state: "dead"
      }
    ];
    const purifyGroundCell = vi.fn(() => true);
    const reviveGroundGrass = vi.fn(() => null);
    const resourceNode = {
      id: "wood-nearby",
      itemId: "wood",
      yield: 1,
      cooldown: 0,
      respawnDuration: 8
    };
    const interactions = createInteractions({
      findNearbyHarvestTarget: vi.fn(() => ({
        resourceNode,
        distance: 0.05
      })),
      findNearbyGroundCell: vi.fn(() => ({
        groundCell: emptyGroundCell,
        distance: 0.1
      })),
      purifyGroundCell,
      reviveGroundGrass,
      pushNotice: vi.fn()
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances,
      groundPurifiedInstances: [],
      groundGrassPatches,
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(purifyGroundCell).toHaveBeenCalledWith(
      emptyGroundCell,
      groundDeadInstances,
      []
    );
    expect(reviveGroundGrass).toHaveBeenCalledWith(
      emptyGroundCell,
      groundGrassPatches
    );
    expect(resourceNode.cooldown).toBe(0);
  });

  it("revives dry grass even when its ground tile is already green", () => {
    const greenGroundCell = {
      id: "ground-green-with-dry-grass",
      offset: [0.45, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const groundGrassPatches = [
      {
        id: "dry-grass-on-green-ground",
        cellId: greenGroundCell.id,
        position: [0.45, 0.02, 0],
        size: [1.18, 0.96],
        state: "dead"
      }
    ];
    const purifyGroundCell = vi.fn(() => false);
    const reviveGroundGrass = vi.fn(() => ({
      id: "dry-grass-on-green-ground",
      cellId: greenGroundCell.id,
      state: "alive"
    }));
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => null),
      purifyGroundCell,
      reviveGroundGrass,
      pushNotice: vi.fn()
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances: [greenGroundCell],
      groundGrassPatches,
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(purifyGroundCell).not.toHaveBeenCalled();
    expect(reviveGroundGrass).toHaveBeenCalledWith(
      greenGroundCell,
      groundGrassPatches
    );
  });

  it("burns a white ground cell into dry ground with Fire", () => {
    const fireGroundCell = {
      id: "white-ground-1",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0,
      purifiable: false,
      groundKind: "cold"
    };
    const iceGroundInstances = [fireGroundCell];
    const groundDeadInstances = [];
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });
    const inventory = {
      [CARBON_ITEM_ID]: 2
    };
    const storyState = { questIndex: 0, flags: {} };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory,
      storyState,
      woodDrops: [],
      groundDeadInstances,
      iceGroundInstances,
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      canUseFire: true,
      useFire: true,
      forcedHarvestTarget: {
        fireGroundCell,
        distance: 0
      }
    });

    expect(result).toBe(true);
    expect(inventory[CARBON_ITEM_ID]).toBe(2);
    expect(storyState.flags[CHARMANDER_FIRE_CARBON_USES_FLAG]).toBe(1);
    expect(iceGroundInstances).toEqual([]);
    expect(groundDeadInstances).toEqual([fireGroundCell]);
    expect(fireGroundCell).toEqual(expect.objectContaining({
      groundKind: "dead",
      purifiable: true,
      wasColdGroundBurned: true
    }));
    expect(pushNotice).toHaveBeenCalledWith(
      "Thermal Torch burned the white ground into dry ground."
    );
  });

  it("spends one Carbon after ten Charmander Fire uses", () => {
    const fireGroundCells = Array.from({ length: 10 }, (_, index) => ({
      id: `white-ground-${index}`,
      offset: [index, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0,
      purifiable: false,
      groundKind: "cold"
    }));
    const extraFireGroundCell = {
      id: "white-ground-extra",
      offset: [12, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0,
      purifiable: false,
      groundKind: "cold"
    };
    const iceGroundInstances = [...fireGroundCells, extraFireGroundCell];
    const groundDeadInstances = [];
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });
    const inventory = {
      [CARBON_ITEM_ID]: 1
    };
    const storyState = { questIndex: 0, flags: {} };

    for (const [index, fireGroundCell] of fireGroundCells.entries()) {
      const result = interactions.performHarvestAction({
        playerPosition: [0, 0, 0],
        palmModel: null,
        palmInstances: [],
        resourceNodes: [],
        inventory,
        storyState,
        woodDrops: [],
        groundDeadInstances,
        iceGroundInstances,
        groundPurifiedInstances: [],
        groundGrassPatches: [],
        canUseFire: true,
        useFire: true,
        forcedHarvestTarget: {
          fireGroundCell,
          distance: 0
        }
      });

      expect(result).toBe(true);
      expect(storyState.flags[CHARMANDER_FIRE_CARBON_USES_FLAG]).toBe((index + 1) % 10);
    }

    expect(inventory[CARBON_ITEM_ID]).toBe(0);
    expect(groundDeadInstances).toEqual(fireGroundCells);
    expect(iceGroundInstances).toEqual([extraFireGroundCell]);

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory,
      storyState,
      woodDrops: [],
      groundDeadInstances,
      iceGroundInstances,
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      canUseFire: true,
      useFire: true,
      forcedHarvestTarget: {
        fireGroundCell: extraFireGroundCell,
        distance: 0
      }
    });

    expect(result).toBe(false);
    expect(iceGroundInstances).toEqual([extraFireGroundCell]);
    expect(pushNotice).toHaveBeenCalledWith("Thermal Bot needs Carbon to use Thermal Torch.");
  });

  it("does not burn a white ground cell with Fire when Carbon is empty", () => {
    const fireGroundCell = {
      id: "white-ground-1",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0,
      purifiable: false,
      groundKind: "cold"
    };
    const iceGroundInstances = [fireGroundCell];
    const groundDeadInstances = [];
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {
        [CARBON_ITEM_ID]: 0
      },
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances,
      iceGroundInstances,
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      canUseFire: true,
      useFire: true,
      forcedHarvestTarget: {
        fireGroundCell,
        distance: 0
      }
    });

    expect(result).toBe(false);
    expect(iceGroundInstances).toEqual([fireGroundCell]);
    expect(groundDeadInstances).toEqual([]);
    expect(fireGroundCell.groundKind).toBe("cold");
    expect(pushNotice).toHaveBeenCalledWith("Thermal Bot needs Carbon to use Thermal Torch.");
  });

  it("lets LT field moves ignore pending Solar Station placement targets", () => {
    const fireGroundCell = {
      id: "white-ground-1",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0,
      purifiable: false,
      groundKind: "cold"
    };
    const interactions = createInteractions();
    const target = interactions.findNearbyActionTarget({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {
        [STRAW_BED_ITEM_ID]: 1
      },
      storyState: {
        questIndex: 0,
        flags: {
          strawBedCrafted: true,
          strawBedPlacedInBulbasaurHabitat: false,
          rustlingGrassCellId: "grass-0"
        }
      },
      groundDeadInstances: [],
      iceGroundInstances: [fireGroundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [
        { cellId: "grass-0", habitatGroupId: "bulba", state: "alive", position: [0, 0, 0] },
        { cellId: "grass-1", habitatGroupId: "bulba", state: "alive", position: [1.425, 0, 0] },
        { cellId: "grass-2", habitatGroupId: "bulba", state: "alive", position: [0, 0, 1.425] },
        { cellId: "grass-3", habitatGroupId: "bulba", state: "alive", position: [1.425, 0, 1.425] }
      ],
      groundFlowerPatches: [],
      canUseFire: true,
      allowPlacement: false
    });

    expect(target).toEqual(expect.objectContaining({
      fireGroundCell,
      distance: 0
    }));
  });

  it("can purify a specific ground cell through a forced harvest target", () => {
    const groundCell = {
      id: "ground-2-2",
      offset: [2, 0, 2],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const groundDeadInstances = [groundCell];
    const groundPurifiedInstances = [];
    const findNearbyGroundCell = vi.fn(() => null);
    const purifyGroundCell = vi.fn(() => true);
    const interactions = createInteractions({
      findNearbyGroundCell,
      purifyGroundCell
    });

    const result = interactions.performHarvestAction({
      playerPosition: [10, 0, 10],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: {
        questIndex: 0,
        flags: {
          restoredGrassCount: 10
        }
      },
      woodDrops: [],
      groundDeadInstances,
      groundGrassPatches: [],
      groundPurifiedInstances,
      canPurifyGround: true,
      forcedHarvestTarget: {
        groundCell,
        distance: 0
      }
    });

    expect(result).toBe(true);
    expect(findNearbyGroundCell).not.toHaveBeenCalled();
    expect(purifyGroundCell).toHaveBeenCalledWith(
      groundCell,
      groundDeadInstances,
      groundPurifiedInstances
    );
  });

  it("ignores palm strike while equipped field moves are active", () => {
    const palm = {
      id: "palm-0"
    };
    const leafageCell = {
      id: "ground-leafage-0",
      offset: [0, 0, 0],
      tileSpan: 1.425
    };
    const strikeNearbyPalm = vi.fn(() => ({
      hit: true,
      felled: false,
      palm: {
        ...palm,
        hitCount: 1
      },
      nextWoodDropId: 1
    }));
    const interactions = createInteractions({
      findNearbyHarvestTarget: vi.fn(() => ({
        palm,
        distance: 0.9
      })),
      strikeNearbyPalm
    });
    const groundGrassPatches = [];

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: {},
      palmInstances: [palm],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundPurifiedInstances: [leafageCell],
      groundGrassPatches,
      canUseLeafage: true
    });

    expect(result).toBe(true);
    expect(strikeNearbyPalm).not.toHaveBeenCalled();
    expect(groundGrassPatches).toHaveLength(1);
  });

  it("emits a ground-item callback when harvesting a resource node", () => {
    const resourceNode = {
      id: "reed-node",
      itemId: "reed",
      yield: 2,
      respawnDuration: 8
    };
    const syncInventoryUi = vi.fn();
    const onGroundItemCollected = vi.fn();
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyHarvestTarget: vi.fn(() => ({
        resourceNode,
        distance: 0.4
      })),
      syncInventoryUi,
      onGroundItemCollected,
      pushNotice
    });
    const inventory = {};

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [resourceNode],
      inventory,
      storyState: { questIndex: 0, flags: {} },
      woodDrops: []
    });

    expect(result).toBe(true);
    expect(inventory.reed).toBe(2);
    expect(resourceNode.cooldown).toBe(8);
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(onGroundItemCollected).toHaveBeenCalledWith({
      itemId: "reed",
      amount: 2
    });
    expect(pushNotice).toHaveBeenCalledWith("+2 reed added to cache");
  });

  it("explains the colony purpose for cataloged resource pickups", () => {
    const resourceNode = {
      id: "wood-node",
      itemId: "wood",
      yield: 3,
      respawnDuration: 12
    };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyHarvestTarget: vi.fn(() => ({
        resourceNode,
        distance: 0.4
      })),
      getItemLabel: (itemId) => itemId === "wood" ? "Wood" : itemId,
      pushNotice
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [resourceNode],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: []
    });

    expect(result).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith(
      "+3 Wood added to Colony Cache: Turns local debris into the first shelter and furniture projects."
    );
  });

  it("summarizes protected supplies when interacting with the Colony Cache", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "colonyCache",
          label: "Colony Cache"
        },
        distance: 0.6
      })),
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [34.6, 0, -14],
      npcActors: [],
      interactables: [],
      storyState: { questIndex: 0, flags: {} },
      inventory: { wood: 3 },
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith(
      "Colony Cache: 3 protected supplies. Sturdy stick: Turns local debris into the first shelter and furniture projects."
    );
  });

  it("keeps the old no-resource fallback when the purification power is unavailable", () => {
    const findNearbyGroundCell = vi.fn();
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell,
      pushNotice
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances: [],
      canPurifyGround: false
    });

    expect(result).toBe(false);
    expect(findNearbyGroundCell).not.toHaveBeenCalled();
    expect(pushNotice).toHaveBeenCalledWith(
      "No resource in range. Move closer to a tree, supply drop, or resource marker, then press Enter."
    );
  });

  it("escalates repeated empty field actions into a visible target hint", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });
    const action = {
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances: [],
      canPurifyGround: true
    };

    expect(interactions.performHarvestAction(action)).toBe(false);
    expect(interactions.performHarvestAction(action)).toBe(false);

    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "No Hydro Jet target. Look for cracked dry soil, dry grass, or a thirsty tree, then press Enter."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "Still no Hydro Jet target. Aim for cracked soil, dry grass, or thirsty trees until the tile outline appears."
    );
  });

  it("teaches Bio-Grow target reading when no restored soil is in range", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });
    const action = {
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances: [],
      canUseLeafage: true
    };

    expect(interactions.performHarvestAction(action)).toBe(false);
    expect(interactions.performHarvestAction(action)).toBe(false);

    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "No Bio-Grow target. Look for restored green soil, then press Enter."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "Still no Bio-Grow target. Aim at restored green soil until the tile outline appears."
    );
  });

  it("resets missed target escalation when the selected field tool changes", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });
    const baseAction = {
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: { questIndex: 0, flags: {} },
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances: []
    };

    expect(interactions.performHarvestAction({
      ...baseAction,
      canPurifyGround: true
    })).toBe(false);
    expect(interactions.performHarvestAction({
      ...baseAction,
      canUseLeafage: true
    })).toBe(false);

    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "No Hydro Jet target. Look for cracked dry soil, dry grass, or a thirsty tree, then press Enter."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "No Bio-Grow target. Look for restored green soil, then press Enter."
    );
  });

  it("advances the quest when the player finds the stranded pokemon", () => {
    const pushNotice = vi.fn();
    let onComplete = null;
    const unlockPlayerAbility = vi.fn();
    const unlockPokedexReward = vi.fn();
    const startDialogue = vi.fn(({ onComplete: nextOnComplete }) => {
      onComplete = nextOnComplete;
      return true;
    });
    const interactions = createInteractions({
      startDialogue,
      unlockPlayerAbility,
      unlockPokedexReward,
      getActiveQuest: () => ({
        id: "findPokemon",
        title: "Find the Pokemon",
        actionLabel: "E / Talk",
        resolveLine: "You found the stranded Pokemon."
      }),
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "squirtle",
          label: "Stranded Pokemon"
        },
        distance: 1.1
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 1,
      flags: {}
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {}
    });

    expect(result).toBe(true);
    expect(startDialogue).toHaveBeenCalledWith({
      targetId: "squirtle",
      dialogueId: "discovery",
      onComplete: expect.any(Function)
    });
    expect(storyState.questIndex).toBe(1);
    expect(unlockPlayerAbility).not.toHaveBeenCalled();
    expect(unlockPokedexReward).not.toHaveBeenCalled();
    onComplete();
    expect(unlockPlayerAbility).toHaveBeenCalledWith("waterGun");
    expect(unlockPokedexReward).toHaveBeenCalledTimes(1);
    expect(storyState.flags.squirtleRobotReactivated).toBe(true);
    expect(storyState.flags.squirtleFollowing).toBe(true);
    expect(storyState.questIndex).toBe(2);
    expect(pushNotice).toHaveBeenCalledWith(
      expect.stringContaining("You found the stranded Pokemon.")
    );
  });

  it("keeps Hydro Bot interaction readable when it is not the current task", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      getActiveQuest: () => ({
        id: "water-dry-grass",
        title: "Water dry grass"
      }),
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "squirtle",
          label: "Hydro Bot"
        },
        distance: 1.1
      })),
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {}
      },
      inventory: {}
    });

    expect(result).toBe(false);
    expect(pushNotice).toHaveBeenCalledWith(
      "Hydro Bot is quiet for now. Follow the current colony task first."
    );
  });

  it("escalates repeated early interaction feedback on the same valid target", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      getActiveQuest: () => ({
        id: "water-dry-grass",
        title: "Water dry grass"
      }),
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "squirtle",
          label: "Hydro Bot"
        },
        distance: 1.1
      })),
      pushNotice
    });
    const action = {
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {}
      },
      inventory: {}
    };

    expect(interactions.performInteractAction(action)).toBe(false);
    expect(interactions.performInteractAction(action)).toBe(false);
    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "Hydro Bot is quiet for now. Follow the current colony task first."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "Still not ready. Follow the current colony task, then come back."
    );
  });

  it("keeps blocked route interactions readable before their quest step", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      getActiveQuest: () => ({
        id: "freeRoam",
        title: "Free Roam"
      }),
      findNearbyInteractable: vi.fn()
        .mockReturnValueOnce({
          target: {
            kind: "site",
            id: "bridge",
            label: "Bridge"
          },
          distance: 1.2
        })
        .mockReturnValueOnce({
          target: {
            kind: "site",
            id: "graniteGate",
            label: "Granite Gate"
          },
          distance: 1.2
        }),
      pushNotice
    });
    const baseAction = {
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {}
      },
      inventory: {}
    };

    interactions.performInteractAction({
      ...baseAction,
      interactables: []
    });
    interactions.performInteractAction({
      ...baseAction,
      interactables: []
    });

    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "The bridge route is not ready yet. Follow the current colony task first."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "The Granite Gate stays sealed until the current route opens it."
    );
  });

  it("shows a special notice when the player restores the first dead grass", () => {
    const groundCell = {
      id: "ground-1-1",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const habitatSystem = { recordEvent: vi.fn() };
    const onFirstGrassRestored = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.32
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => true),
      onFirstGrassRestored,
      habitatSystem,
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: false
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0.1, 0, 0.1],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [{ cellId: groundCell.id, state: "dead" }],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.firstGrassRestored).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith("Dry grass restored. 1/10 patches viable.");
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.REVIVE_PATCH,
      targetId: "grass"
    });
    expect(onFirstGrassRestored).toHaveBeenCalledTimes(1);
  });

  it("rewards Hydro Jet rhythm with leaves every third restored dry grass patch", () => {
    const groundCell = {
      id: "ground-1-3",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const syncInventoryUi = vi.fn();
    const addItemsMock = vi.fn(addItems);
    const inventory = {};
    const interactions = createInteractions({
      addItems: addItemsMock,
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.32
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => ({
        id: "grass-2",
        cellId: groundCell.id,
        state: "alive"
      })),
      pushNotice,
      syncInventoryUi
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true,
        restoredGrassCount: 2
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0.1, 0, 0.1],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory,
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [{ cellId: groundCell.id, state: "dead" }],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredGrassCount).toBe(3);
    expect(inventory[LEAVES_ITEM_ID]).toBe(1);
    expect(addItemsMock).toHaveBeenCalledWith(inventory, {
      [LEAVES_ITEM_ID]: 1
    });
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(pushNotice).toHaveBeenCalledWith(
      "Hydro rhythm: +1 Leaf from restored growth."
    );
  });

  it("counts any purified ground tile as restored patch quest progress", () => {
    const groundCell = {
      id: "ground-1-2",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.32
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => null),
      questSystem
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0.1, 0, 0.1],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: {
        questIndex: 0,
        flags: {
          firstGrassRestored: false,
          restoredGrassCount: 10
        }
      },
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      groundFlowerPatches: [],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "BUILD",
      targetId: "revived-habitat"
    });
  });

  it("schedules a delayed rustling grass encounter after enough grass is restored", () => {
    const groundCell = {
      id: "ground-4-4",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const restoredPatch = {
      id: "tall-grass-habitat-0-grass-3",
      cellId: groundCell.id,
      habitatGroupId: "tall-grass-habitat-0",
      state: "alive"
    };
    const habitatSystem = {
      recordEvent: vi.fn((event) => {
        if (
          event.type === HABITAT_EVENT.RESTORE_HABITAT &&
          event.targetId === "tall-grass"
        ) {
          storyState.flags.tallGrassDiscovered = true;
        }
      })
    };
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => restoredPatch),
      habitatSystem,
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true,
        restoredGrassCount: 3,
        tallGrassDiscovered: false
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [
        {
          id: "tall-grass-habitat-0-grass-0",
          cellId: "ground-4-3",
          habitatGroupId: "tall-grass-habitat-0",
          state: "alive"
        },
        {
          id: "tall-grass-habitat-0-grass-1",
          cellId: "ground-5-3",
          habitatGroupId: "tall-grass-habitat-0",
          state: "alive"
        },
        {
          id: "tall-grass-habitat-0-grass-2",
          cellId: "ground-5-4",
          habitatGroupId: "tall-grass-habitat-0",
          state: "alive"
        },
        restoredPatch
      ],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredGrassCount).toBe(4);
    expect(storyState.flags.tallGrassDiscovered).toBe(true);
    expect(storyState.flags.rustlingGrassCellId).toBeUndefined();
    expect(storyState.flags.pendingRustlingGrassCellId).toBe("ground-4-3");
    expect(storyState.flags.rustlingGrassDelay).toBeGreaterThan(0);
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.REVIVE_PATCH,
      targetId: "grass"
    });
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.RESTORE_HABITAT,
      targetId: "tall-grass"
    });
  });

  it("grows Leafage tall grass and starts Charmander's rustling grass encounter", () => {
    const groundCell = {
      id: "ground-8-8",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const questSystem = {
      emit: vi.fn()
    };
    const habitatSystem = {
      recordEvent: vi.fn()
    };
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.22
      })),
      questSystem,
      habitatSystem,
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        leafageTallGrassCount: 3
      }
    };
    const groundGrassPatches = [
      {
        id: "leafage-grass-a",
        cellId: "ground-8-7",
        habitatGroupId: "leafage-tall-grass-habitat-0",
        state: "alive"
      },
      {
        id: "leafage-grass-b",
        cellId: "ground-9-7",
        habitatGroupId: "leafage-tall-grass-habitat-0",
        state: "alive"
      },
      {
        id: "leafage-grass-c",
        cellId: "ground-9-8",
        habitatGroupId: "leafage-tall-grass-habitat-0",
        state: "alive"
      }
    ];

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances: [groundCell],
      groundGrassPatches,
      groundFlowerPatches: [],
      canUseLeafage: true
    });

    expect(result).toBe(true);
    expect(groundGrassPatches).toHaveLength(4);
    expect(storyState.flags.leafageTallGrassCount).toBe(4);
    expect(storyState.flags.leafageTallGrassHabitatCreated).toBe(true);
    expect(storyState.flags.charmanderRustlingGrassCellId).toBe("ground-8-7");
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "PLACE",
      targetId: "leafy-home-patch"
    });
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.RESTORE_HABITAT,
      targetId: "tall-grass"
    });
    expect(pushNotice).toHaveBeenCalledWith("A patch of tall grass is rustling.", 3.4);
  });

  it("grows a revived flower with Leafage when Bulbasaur's object is set to flower", () => {
    const groundCell = {
      id: "ground-flower-leafage",
      offset: [0, 0, 0],
      surfaceY: 0,
      tileSpan: 1.425,
      active: true,
      purifiable: true
    };
    const pushNotice = vi.fn();
    const habitatSystem = {
      recordEvent: vi.fn()
    };
    const onNaturePatchRevived = vi.fn();
    const interactions = createInteractions({
      habitatSystem,
      onNaturePatchRevived,
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        leafageObjectId: "flower"
      }
    };
    const groundGrassPatches = [];
    const groundFlowerPatches = [];

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances: [groundCell],
      groundGrassPatches,
      groundFlowerPatches,
      canUseLeafage: true
    });

    expect(result).toBe(true);
    expect(groundGrassPatches).toEqual([]);
    expect(groundFlowerPatches).toEqual([
      expect.objectContaining({
        id: "leafage-flower-ground-flower-leafage",
        cellId: "ground-flower-leafage",
        habitatGroupId: "leafage-flower-bed-habitat-0",
        source: "leafage",
        state: "alive"
      })
    ]);
    expect(storyState.flags.leafageFlowerCount).toBe(1);
    expect(onNaturePatchRevived).toHaveBeenCalledWith({
      patch: groundFlowerPatches[0],
      type: "flower"
    });
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.REVIVE_PATCH,
      targetId: "flower"
    });
    expect(pushNotice).toHaveBeenCalledWith("Flower planted. This patch can become a flower bed.");
  });

  it("finds a Leafage target without rebuilding the full ground grid candidate list", () => {
    const targetGroundCell = {
      id: "near-leafage-cell",
      offset: [0, 0, 0],
      surfaceY: 0,
      tileSpan: 1.425,
      active: true,
      purifiable: true
    };
    const groundPurifiedInstances = [
      ...Array.from({ length: 2500 }, (_, index) => ({
        id: `far-leafage-cell-${index}`,
        offset: [120 + index, 0, 120],
        surfaceY: 0,
        tileSpan: 1.425,
        active: true,
        purifiable: true
      })),
      targetGroundCell
    ];
    const findNearbyGroundCell = vi.fn(() => {
      throw new Error("Leafage target lookup should use the optimized direct scan.");
    });
    const interactions = createInteractions({
      findNearbyGroundCell,
      pushNotice: vi.fn()
    });
    const groundGrassPatches = [];

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: {
        questIndex: 2,
        flags: {}
      },
      woodDrops: [],
      groundDeadInstances: [],
      groundPurifiedInstances,
      groundGrassPatches,
      groundFlowerPatches: [],
      canUseLeafage: true
    });

    expect(result).toBe(true);
    expect(findNearbyGroundCell).not.toHaveBeenCalled();
    expect(groundGrassPatches).toEqual([
      expect.objectContaining({
        cellId: "near-leafage-cell",
        state: "alive"
      })
    ]);
  });

  it("does not grow Leafage on dry ground that has not been watered", () => {
    const dryGroundCell = {
      id: "dry-leafage-cell",
      offset: [0, 0, 0],
      surfaceY: 0,
      tileSpan: 1.425,
      active: true,
      purifiable: true
    };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell: dryGroundCell,
        distance: 0.2
      })),
      pushNotice
    });
    const groundGrassPatches = [];
    const action = {
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: {
        questIndex: 2,
        flags: {}
      },
      woodDrops: [],
      groundDeadInstances: [dryGroundCell],
      groundPurifiedInstances: [],
      groundGrassPatches,
      groundFlowerPatches: [],
      canUseLeafage: true
    };

    expect(interactions.performHarvestAction(action)).toBe(false);
    expect(interactions.performHarvestAction(action)).toBe(false);
    expect(groundGrassPatches).toEqual([]);
    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "Bio-Grow needs restored ground. Use Hydro Jet here first."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "Hydro Jet first, then Bio-Grow. Restored ground becomes a valid growth target."
    );
  });

  it("destroys a nearby Leafage-instantiated object", () => {
    const pushNotice = vi.fn();
    const groundGrassPatches = [
      {
        id: "leafage-grass-ground-1",
        cellId: "ground-1",
        habitatGroupId: "leafage-tall-grass-habitat-0",
        leafageObjectId: "garden1",
        source: "leafage",
        state: "alive",
        position: [0, 0.02, 0],
        size: [1.42, 1.18]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "leafage-grass-ground-1",
          label: "Garden-1",
          action: "destroyInstantiatedObject",
          cellId: "ground-1"
        },
        distance: 0.25
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurDryGrassMissionComplete: true,
        leafageTallGrassCount: 1
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(true);
    expect(groundGrassPatches).toEqual([]);
    expect(storyState.flags.leafageTallGrassCount).toBe(0);
    expect(pushNotice).toHaveBeenCalledWith("Garden-1 destroyed.");
  });

  it("destroys a nearby Leafage-instantiated flower", () => {
    const pushNotice = vi.fn();
    const groundFlowerPatches = [
      {
        id: "leafage-flower-ground-1",
        cellId: "ground-1",
        habitatGroupId: "leafage-flower-bed-habitat-0",
        source: "leafage",
        state: "alive",
        position: [0, 0.02, 0],
        size: [1.12, 1.12]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable,
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        leafageFlowerCount: 1
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: [],
      groundFlowerPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(true);
    expect(groundFlowerPatches).toEqual([]);
    expect(storyState.flags.leafageFlowerCount).toBe(0);
    expect(pushNotice).toHaveBeenCalledWith("Flower destroyed.");
  });

  it("destroys a restored flower even without a Leafage source flag", () => {
    const pushNotice = vi.fn();
    const groundFlowerPatches = [
      {
        id: "flower-ground-1",
        cellId: "ground-1",
        habitatGroupId: "water-gun-flower-field-0",
        state: "alive",
        position: [0, 0.02, 0],
        size: [1.12, 1.12]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable,
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: { questIndex: 2, flags: { bulbasaurRevealed: true } },
      inventory: {},
      groundGrassPatches: [],
      groundFlowerPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(true);
    expect(groundFlowerPatches).toEqual([]);
    expect(pushNotice).toHaveBeenCalledWith("Flower destroyed.");
  });

  it("destroys restored green grass even without a Leafage source flag", () => {
    const pushNotice = vi.fn();
    const groundGrassPatches = [
      {
        id: "grass-ground-1",
        cellId: "ground-1",
        state: "alive",
        position: [0, 0.02, 0],
        size: [1.18, 0.96]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable,
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          bulbasaurDryGrassMissionComplete: true,
          bulbasaurRevealed: true
        }
      },
      inventory: {},
      groundGrassPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(true);
    expect(groundGrassPatches).toEqual([]);
    expect(pushNotice).toHaveBeenCalledWith("Tall Grass destroyed.");
  });

  it("uses Y destroy mode even when the normal interact target would be something else", () => {
    const pushNotice = vi.fn();
    const groundGrassPatches = [
      {
        id: "dry-grass-ground-1",
        cellId: "ground-1",
        state: "dead",
        position: [0, 0.02, 0],
        size: [1.18, 0.96]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "squirtle",
          label: "Squirtle"
        },
        distance: 0.1
      })),
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          bulbasaurDryGrassMissionComplete: true,
          bulbasaurRevealed: true
        }
      },
      inventory: {},
      groundGrassPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(true);
    expect(groundGrassPatches).toEqual([]);
    expect(pushNotice).toHaveBeenCalledWith("Dry Grass cut.");
  });

  it("blocks cutting world dry grass before the dry tall grass mission is complete", () => {
    const pushNotice = vi.fn();
    const groundGrassPatches = [
      {
        id: "dry-grass-ground-1",
        cellId: "ground-1",
        state: "dead",
        position: [0, 0.02, 0],
        size: [1.18, 0.96]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable,
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          bulbasaurDryGrassMissionAccepted: true,
          bulbasaurRevealed: true
        }
      },
      inventory: {},
      groundGrassPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(false);
    expect(groundGrassPatches).toHaveLength(1);
    expect(pushNotice).toHaveBeenCalledWith(
      "Finish the dry tall grass mission before cutting grass."
    );
  });

  it("prefers the exact Leafage flower id when another patch shares its cell", () => {
    const pushNotice = vi.fn();
    const groundGrassPatches = [
      {
        id: "leafage-grass-ground-1",
        cellId: "ground-1",
        habitatGroupId: "leafage-tall-grass-habitat-0",
        source: "leafage",
        state: "alive",
        position: [0, 0.02, 0],
        size: [1.18, 0.96]
      }
    ];
    const groundFlowerPatches = [
      {
        id: "leafage-flower-ground-1",
        cellId: "ground-1",
        habitatGroupId: "leafage-flower-bed-habitat-0",
        source: "leafage",
        state: "alive",
        position: [0, 0.02, 0],
        size: [1.12, 1.12]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "leafage-flower-ground-1",
          label: "Flower",
          action: "destroyInstantiatedObject",
          cellId: "ground-1"
        },
        distance: 0.25
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        leafageTallGrassCount: 1,
        leafageFlowerCount: 1
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches,
      groundFlowerPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(true);
    expect(groundGrassPatches).toHaveLength(1);
    expect(groundFlowerPatches).toEqual([]);
    expect(storyState.flags.leafageTallGrassCount).toBe(1);
    expect(storyState.flags.leafageFlowerCount).toBe(0);
    expect(pushNotice).toHaveBeenCalledWith("Flower destroyed.");
  });

  it("destroys dry grass with the explicit destroy action", () => {
    const pushNotice = vi.fn();
    const groundGrassPatches = [
      {
        id: "dry-grass-ground-1",
        cellId: "ground-1",
        state: "dead",
        position: [0, 0.02, 0],
        size: [1.18, 0.96]
      }
    ];
    const interactions = createInteractions({
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "dry-grass-ground-1",
          label: "Dry Grass",
          action: "destroyInstantiatedObject",
          cellId: "ground-1"
        },
        distance: 0.25
      })),
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          bulbasaurDryGrassMissionComplete: true,
          bulbasaurRevealed: true
        }
      },
      inventory: {},
      groundGrassPatches,
      allowDestroyInstantiatedObject: true
    });

    expect(result).toBe(true);
    expect(groundGrassPatches).toEqual([]);
    expect(pushNotice).toHaveBeenCalledWith("Dry Grass cut.");
  });

  it("shows a tall grass colony-zone notice when a full grass group is restored", () => {
    const groundCell = {
      id: "ground-4-4",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const restoredPatch = {
      id: "tall-grass-habitat-0-grass-3",
      cellId: groundCell.id,
      habitatGroupId: "tall-grass-habitat-0",
      state: "alive"
    };
    const habitatSystem = { recordEvent: vi.fn() };
    const pushNotice = vi.fn();
    const onTallGrassHabitatRestored = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => restoredPatch),
      habitatSystem,
      onTallGrassHabitatRestored,
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [
        {
          id: "tall-grass-habitat-0-grass-0",
          cellId: "ground-4-3",
          habitatGroupId: "tall-grass-habitat-0",
          state: "alive"
        },
        {
          id: "tall-grass-habitat-0-grass-1",
          cellId: "ground-5-3",
          habitatGroupId: "tall-grass-habitat-0",
          state: "alive"
        },
        {
          id: "tall-grass-habitat-0-grass-2",
          cellId: "ground-5-4",
          habitatGroupId: "tall-grass-habitat-0",
          state: "alive"
        },
        restoredPatch
      ],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredTallGrassHabitatIds).toEqual([
      "tall-grass-habitat-0"
    ]);
    expect(pushNotice).toHaveBeenCalledWith(
      "You've restored a tall grass colony zone!",
      3.6
    );
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.RESTORE_HABITAT,
      targetId: "tall-grass"
    });
    expect(onTallGrassHabitatRestored).toHaveBeenCalledWith({
      groundCell,
      restoredGrassHabitat: {
        id: "tall-grass-habitat-0",
        patches: expect.any(Array)
      },
      newlyDiscoveredHabitats: []
    });
  });

  it("triggers Tangrowth's flower recovery comment after enough flowers are revived", () => {
    const groundCell = {
      id: "ground-6-2",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const onFlowersRecovered = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => false),
      reviveGroundFlower: vi.fn(() => true),
      onFlowersRecovered,
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true,
        restoredGrassCount: 10,
        tallGrassDiscovered: false,
        restoredFlowerCount: 1,
        tangrowthFlowerCommentSeen: false
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundFlowerPatches: [{ cellId: groundCell.id, state: "dead" }],
      groundGrassPatches: [],
      groundPurifiedInstances: [],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredFlowerCount).toBe(2);
    expect(storyState.flags.tangrowthFlowerCommentSeen).toBe(true);
    expect(onFlowersRecovered).toHaveBeenCalledTimes(1);
  });

  it("shows flower restoration progress before a flower bed habitat is complete", () => {
    const groundCell = {
      id: "ground-6-1",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => false),
      reviveGroundFlower: vi.fn(() => ({
        id: "flower-1",
        cellId: groundCell.id,
        habitatGroupId: "pretty-flower-bed-habitat-0",
        state: "alive"
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        restoredGrassCount: 10,
        restoredFlowerCount: 0,
        tangrowthFlowerCommentSeen: false
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundFlowerPatches: [{ cellId: groundCell.id, state: "dead" }],
      groundGrassPatches: [],
      groundPurifiedInstances: [],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredFlowerCount).toBe(1);
    expect(pushNotice).toHaveBeenCalledWith("Flower restored. 1 patch blooming.");
  });

  it("shows a pretty flower bed habitat notice when a full flower group is restored", () => {
    const groundCell = {
      id: "ground-8-6",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const restoredPatch = {
      id: "pretty-flower-bed-habitat-0-flower-3",
      cellId: groundCell.id,
      habitatGroupId: "pretty-flower-bed-habitat-0",
      state: "alive"
    };
    const habitatSystem = { recordEvent: vi.fn() };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => false),
      reviveGroundFlower: vi.fn(() => restoredPatch),
      habitatSystem,
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        restoredGrassCount: 10,
        restoredFlowerCount: 3,
        tangrowthFlowerCommentSeen: true
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundFlowerPatches: [
        {
          id: "pretty-flower-bed-habitat-0-flower-0",
          cellId: "ground-7-5",
          habitatGroupId: "pretty-flower-bed-habitat-0",
          state: "alive"
        },
        {
          id: "pretty-flower-bed-habitat-0-flower-1",
          cellId: "ground-8-5",
          habitatGroupId: "pretty-flower-bed-habitat-0",
          state: "alive"
        },
        {
          id: "pretty-flower-bed-habitat-0-flower-2",
          cellId: "ground-7-6",
          habitatGroupId: "pretty-flower-bed-habitat-0",
          state: "alive"
        },
        restoredPatch
      ],
      groundGrassPatches: [],
      groundPurifiedInstances: [],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredFlowerCount).toBe(4);
    expect(storyState.flags.restoredFlowerBedHabitatIds).toEqual([
      "pretty-flower-bed-habitat-0"
    ]);
    expect(pushNotice).toHaveBeenCalledWith(
      "You've restored a pretty flower bed habitat!",
      3.6
    );
    expect(pushNotice).not.toHaveBeenCalledWith("Ground restored.");
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.REVIVE_PATCH,
      targetId: "flower"
    });
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.RESTORE_HABITAT,
      targetId: "pretty-flower-bed"
    });
  });

  it("keeps Bee Box feedback tied to the flower field state", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "beeFieldRepairBox",
          id: "beeFieldRepairBox",
          label: "Bee Box"
        },
        distance: 1
      })),
      pushNotice
    });
    const baseAction = {
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      inventory: {},
      groundGrassPatches: []
    };

    expect(interactions.performInteractAction({
      ...baseAction,
      storyState: {
        questIndex: 2,
        flags: {}
      }
    })).toBe(true);
    expect(interactions.performInteractAction({
      ...baseAction,
      storyState: {
        questIndex: 2,
        flags: {
          restoredFlowerBedHabitatIds: ["water-gun-flower-field-0"],
          beeFieldRepairBoxOpened: true
        }
      }
    })).toBe(true);

    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "Restore every flower in this field first. The Bee Box is still sealed."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "The Bee Box is open. Follow the next colony task."
    );
  });

  it("reveals Bulbasaur when the player interacts with the rustling grass", () => {
    const onBulbasaurRevealed = vi.fn();
    const interactions = createInteractions({
      onBulbasaurRevealed,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "grassEncounter",
          id: "rustlingGrass",
          label: "Check on Grow Bot",
          cellId: "ground-2-3"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurRevealed: false,
        chopperBulbasaurRepairBoxIntroComplete: true
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(storyState.flags.bulbasaurRevealed).toBe(true);
    expect(storyState.flags.bulbasaurRobotReactivated).toBe(true);
    expect(storyState.flags.bulbasaurFollowing).toBe(true);
    expect(onBulbasaurRevealed).toHaveBeenCalledWith({
      cellId: "ground-2-3"
    });
  });

  it("reveals Charmander when the player inspects the Leafage rustling grass", () => {
    const onCharmanderRevealed = vi.fn();
    const interactions = createInteractions({
      onCharmanderRevealed,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "charmanderGrassEncounter",
          id: "charmanderRustlingGrass",
          label: "Help Thermal Bot",
          cellId: "ground-8-7"
        },
        distance: 1.05
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        charmanderRevealed: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(storyState.flags.charmanderRevealed).toBe(true);
    expect(storyState.flags.charmanderRobotReactivated).toBe(true);
    expect(storyState.flags.charmanderFollowing).toBe(true);
    expect(onCharmanderRevealed).toHaveBeenCalledWith({
      cellId: "ground-8-7"
    });
  });

  it("accepts Bulbasaur's dry grass mission from the Bulbasaur interaction", () => {
    const onBulbasaurDryGrassMissionAccepted = vi.fn();
    const onNpcInteractionStart = vi.fn();
    const interactions = createInteractions({
      onBulbasaurDryGrassMissionAccepted,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "bulbasaurMission",
          id: "bulbasaurDryGrassMission",
          label: "Talk to Bulbasaur",
          cellId: "ground-2-3"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurRevealed: true,
        bulbasaurDryGrassMissionAccepted: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: [
        {
          cellId: "ground-2-3",
          position: [2, 0.02, 3]
        }
      ],
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(storyState.flags.bulbasaurDryGrassMissionAccepted).toBe(true);
    expect(onBulbasaurDryGrassMissionAccepted).toHaveBeenCalledTimes(1);
    expect(onNpcInteractionStart).toHaveBeenCalledWith({
      targetId: "bulbasaurDryGrassMission",
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      targetPosition: [2, 0.02, 3]
    });
  });

  it("accepts Bulbasaur's dry grass mission as complete if 10 patches were already restored", () => {
    const onBulbasaurDryGrassMissionAccepted = vi.fn();
    const interactions = createInteractions({
      onBulbasaurDryGrassMissionAccepted,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "bulbasaurMission",
          id: "bulbasaurDryGrassMission",
          label: "Talk to Bulbasaur",
          cellId: "ground-2-3"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurRevealed: true,
        bulbasaurDryGrassMissionAccepted: false,
        restoredGrassCount: 10
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(storyState.flags.bulbasaurDryGrassMissionAccepted).toBe(true);
    expect(storyState.flags.bulbasaurDryGrassMissionComplete).toBe(true);
    expect(onBulbasaurDryGrassMissionAccepted).toHaveBeenCalledTimes(1);
  });

  it("marks Bulbasaur's dry grass mission complete after enough grass is restored", () => {
    const groundCell = {
      id: "ground-4-4",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => ({
        id: "grass-9",
        cellId: groundCell.id,
        state: "alive"
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true,
        bulbasaurDryGrassMissionAccepted: true,
        restoredGrassCount: 9
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [
        {
          id: "grass-9",
          cellId: groundCell.id,
          state: "alive"
        }
      ],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredGrassCount).toBe(10);
    expect(storyState.flags.bulbasaurDryGrassMissionComplete).toBe(true);
    expect(storyState.flags.firstRequiredTaughtActionComplete).toBe(true);
    expect(storyState.flags.firstRequiredTaughtActionFreedomWindowActive).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith("Dry grass restored. 10/10 patches viable.");
  });

  it("rewards extra Hydro Jet experiments during the early freedom window with exploratory feedback", () => {
    const groundCell = {
      id: "ground-4-5",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => ({
        id: "grass-10",
        cellId: groundCell.id,
        state: "alive"
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true,
        bulbasaurDryGrassMissionAccepted: true,
        bulbasaurDryGrassMissionComplete: true,
        restoredGrassCount: 10,
        firstRequiredTaughtActionFreedomWindowActive: true,
        firstRequiredTaughtActionFreedomWindowActionId: "water-dry-grass"
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [
        {
          id: "grass-10",
          cellId: groundCell.id,
          state: "alive"
        }
      ],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredGrassCount).toBe(11);
    expect(pushNotice).toHaveBeenCalledWith(
      "Another dry patch is viable. Keep experimenting with Hydro Jet."
    );
  });

  it("nudges the player to test farther soil after repeated Hydro Jet experiments", () => {
    const groundCell = {
      id: "ground-4-7",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => ({
        id: "grass-11",
        cellId: groundCell.id,
        state: "alive"
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true,
        bulbasaurDryGrassMissionAccepted: true,
        bulbasaurDryGrassMissionComplete: true,
        restoredGrassCount: 11,
        firstRequiredTaughtActionFreedomWindowActive: true,
        firstRequiredTaughtActionFreedomWindowActionId: "water-dry-grass",
        firstRequiredTaughtActionFreedomWindowOverCompletion: 1
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [
        {
          id: "grass-11",
          cellId: groundCell.id,
          state: "alive"
        }
      ],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.restoredGrassCount).toBe(12);
    expect(pushNotice).toHaveBeenCalledWith(
      "The soil response is spreading. Try a dry patch farther from the first colony zone."
    );
  });

  it("closes the early Hydro Jet freedom window with a soft next-step notice", () => {
    const groundCell = {
      id: "ground-4-6",
      offset: [0, 0, 0],
      scale: 1,
      tileSpan: 1.425,
      yaw: 0
    };
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn(() => ({
        groundCell,
        distance: 0.28
      })),
      purifyGroundCell: vi.fn(() => true),
      reviveGroundGrass: vi.fn(() => ({
        id: "grass-14",
        cellId: groundCell.id,
        state: "alive"
      })),
      pushNotice
    });
    const storyState = {
      questIndex: 0,
      flags: {
        firstGrassRestored: true,
        bulbasaurDryGrassMissionAccepted: true,
        bulbasaurDryGrassMissionComplete: true,
        restoredGrassCount: 14,
        firstRequiredTaughtActionFreedomWindowActive: true,
        firstRequiredTaughtActionFreedomWindowActionId: "water-dry-grass",
        firstRequiredTaughtActionFreedomWindowOverCompletion: 4
      }
    };

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      groundDeadInstances: [groundCell],
      groundPurifiedInstances: [],
      groundGrassPatches: [
        {
          id: "grass-14",
          cellId: groundCell.id,
          state: "alive"
        }
      ],
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.firstRequiredTaughtActionFreedomWindowActive).toBe(false);
    expect(storyState.flags.firstRequiredTaughtActionFreedomWindowEndReason).toBe("over-completion");
    expect(pushNotice).toHaveBeenCalledWith(
      "The soil has enough viable patches. Grow Bot is ready when you are."
    );
  });

  it("turns in Bulbasaur's completed dry grass request from the Bulbasaur interaction", () => {
    const onBulbasaurDryGrassRequestCompleted = vi.fn();
    const interactions = createInteractions({
      onBulbasaurDryGrassRequestCompleted,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "bulbasaurRequestComplete",
          id: "bulbasaurLeafageReward",
          label: "Talk to Bulbasaur",
          cellId: "ground-2-3"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurRevealed: true,
        bulbasaurDryGrassMissionAccepted: true,
        bulbasaurDryGrassMissionComplete: true,
        restoredGrassCount: 10
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onBulbasaurDryGrassRequestCompleted).toHaveBeenCalledTimes(1);
  });

  it("requests Bulbasaur's Solar Station recipe from the Do you need anything interaction", () => {
    const onBulbasaurStrawBedRecipeRequested = vi.fn();
    const interactions = createInteractions({
      onBulbasaurStrawBedRecipeRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "bulbasaurStrawBedRecipe",
          id: "bulbasaurStrawBedRecipe",
          label: "Do you need anything?",
          cellId: "ground-2-3"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          bulbasaurStrawBedChallengeComplete: true
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onBulbasaurStrawBedRecipeRequested).toHaveBeenCalledTimes(1);
  });

  it("turns in Bulbasaur's request after the Solar Station is placed", () => {
    const onBulbasaurStrawBedRequestCompleted = vi.fn();
    const interactions = createInteractions({
      onBulbasaurStrawBedRequestCompleted,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "bulbasaurStrawBedComplete",
          id: "bulbasaurStrawBedComplete",
          label: "Talk to Bulbasaur",
          cellId: "ground-2-3"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          strawBedPlacedInBulbasaurHabitat: true
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onBulbasaurStrawBedRequestCompleted).toHaveBeenCalledTimes(1);
  });

  it("waters nearby trees for Bulbasaur's first challenge set without striking them", () => {
    const palm = {
      id: "palm-0"
    };
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurStrawBedChallengeAvailable: true,
        wateredTreeCount: 4,
        sturdySticksGatheredForChallenge: 10
      }
    };
    const strikeNearbyPalm = vi.fn(() => ({
      hit: true,
      felled: false,
      palm,
      nextWoodDropId: 1
    }));
    const waterNearbyPalm = vi.fn((playerPosition, palmModel, palmInstances, nextStoryState) => {
      nextStoryState.flags.wateredTreeCount = 5;
      nextStoryState.flags.bulbasaurStrawBedChallengeComplete = true;
      return {
        hit: true,
        counted: true,
        challengeComplete: true,
        palm
      };
    });
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      findNearbyHarvestTarget: vi.fn(() => ({
        palm,
        distance: 0.4
      })),
      strikeNearbyPalm,
      waterNearbyPalm,
      pushNotice
    });

    const result = interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: {},
      palmInstances: [palm],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      canPurifyGround: true,
      useWaterGun: true
    });

    expect(result).toBe(true);
    expect(waterNearbyPalm).toHaveBeenCalledTimes(1);
    expect(strikeNearbyPalm).not.toHaveBeenCalled();
    expect(pushNotice).toHaveBeenCalledWith("First colony check complete. Talk to Grow Bot.");
  });

  it("does not revive the Leppa tree by clicking the dead tree with Water Gun", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        squirtleLeppaRequestAvailable: true,
        leppaBerryGiftComplete: false
      }
    };
    const leppaTree = {
      position: [1, 0.02, 1],
      revived: false,
      berryDropped: false,
      deadInstance: { active: false },
      aliveInstance: { active: false }
    };

    expect(interactions.performHarvestAction({
      playerPosition: [1.2, 0, 1.2],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      leppaTree,
      canPurifyGround: true
    })).toBe(false);

    expect(storyState.flags.leppaTreeRevived).toBeUndefined();
    expect(leppaTree.aliveInstance.active).toBe(false);
  });

  it("revives the Leppa tree after Hydro Jet waters the full surrounding perimeter", () => {
    const tileSpan = 1.425;
    const createGroundCell = (id, cellX, cellZ) => ({
      id,
      offset: [1 + cellX * tileSpan, 0, 1 + cellZ * tileSpan],
      scale: 1,
      tileSpan,
      yaw: 0
    });
    const finalGroundCell = {
      ...createGroundCell("ground-near-leppa-north-west", -1, -1)
    };
    const storyState = {
      flags: {
        squirtleLeppaRequestAvailable: true,
        leppaBerryGiftComplete: false
      }
    };
    const leppaTree = {
      position: [1, 0.02, 1],
      revived: false,
      berryDropped: false,
      deadInstance: { active: false },
      aliveInstance: { active: false }
    };
    const groundPurifiedInstances = [
      createGroundCell("ground-near-leppa-north", 0, -1),
      createGroundCell("ground-near-leppa-north-east", 1, -1),
      createGroundCell("ground-near-leppa-west", -1, 0),
      createGroundCell("ground-near-leppa-east", 1, 0),
      createGroundCell("ground-near-leppa-south-west", -1, 1),
      createGroundCell("ground-near-leppa-south", 0, 1),
      createGroundCell("ground-near-leppa-south-east", 1, 1)
    ];
    const findNearbyGroundCell = vi.fn(() => ({
      groundCell: finalGroundCell,
      distance: 0.02
    }));
    const purifyGroundCell = vi.fn((groundCell, groundDeadInstances, purifiedInstances) => {
      purifiedInstances.push(groundCell);
      return true;
    });
    const pushNotice = vi.fn();
    const onLeppaTreeRevived = vi.fn();
    const interactions = createInteractions({
      findNearbyGroundCell,
      purifyGroundCell,
      pushNotice,
      onLeppaTreeRevived
    });

    const result = interactions.performHarvestAction({
      playerPosition: finalGroundCell.offset,
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState,
      woodDrops: [],
      leppaTree,
      groundDeadInstances: [finalGroundCell],
      groundPurifiedInstances,
      canPurifyGround: true
    });

    expect(result).toBe(true);
    expect(storyState.flags.leppaTreeRevived).toBe(true);
    expect(leppaTree.deadInstance.active).toBe(true);
    expect(leppaTree.deadInstance.tintStrength).toBeGreaterThan(0);
    expect(leppaTree.aliveInstance.active).toBe(false);
    expect(purifyGroundCell).toHaveBeenCalledWith(
      finalGroundCell,
      [finalGroundCell],
      groundPurifiedInstances
    );
    expect(pushNotice).toHaveBeenCalledWith("The dead tree perked back up.");
    expect(onLeppaTreeRevived).toHaveBeenCalledWith({
      leppaTree
    });
  });

  it("requests the Leppa Berry gift flow from Bulbasaur's Look at this interaction", () => {
    const onLeppaBerryGiftRequested = vi.fn();
    const interactions = createInteractions({
      onLeppaBerryGiftRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "leppaBerryGift",
          id: "bulbasaur",
          label: "Look at this!",
          cellId: "ground-2-3"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          leppaBerryCollected: true
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onLeppaBerryGiftRequested).toHaveBeenCalledWith({
      targetId: "bulbasaur"
    });
  });

  it("collects a Pulse Berry from a revived tree through the interact action", () => {
    const pushNotice = vi.fn();
    const syncInventoryUi = vi.fn();
    const interactions = createInteractions({
      pushNotice,
      syncInventoryUi,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "leppaBerryTree",
          id: "leppaTree",
          label: "Pick Pulse Berry"
        },
        distance: 1.2
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        squirtleLeppaRequestAvailable: true,
        leppaTreeRevived: true,
        leppaBerryGiftComplete: false
      }
    };
    const inventory = {};
    const leppaTree = {
      position: [1, 0.02, 1],
      revived: true,
      berryDropped: false
    };
    const leppaBerryDrops = [];

    const result = interactions.performInteractAction({
      playerPosition: [1.2, 0, 1.2],
      npcActors: [],
      interactables: [],
      storyState,
      inventory,
      leppaTree,
      leppaBerryDrops
    });

    expect(result).toBe(true);
    expect(inventory.leppaBerry).toBe(1);
    expect(storyState.flags.leppaBerryDropped).toBe(true);
    expect(storyState.flags.leppaBerryCollected).toBe(true);
    expect(leppaBerryDrops).toHaveLength(1);
    expect(leppaBerryDrops[0].collected).toBe(true);
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(pushNotice).toHaveBeenCalledWith("Pulse Berry picked. Grow Bot can use this.");
  });

  it("opens Leafage object options from a revived Leppa tree after the berry drops", () => {
    const onLeppaTreeLeafageOptionsRequested = vi.fn();
    const interactions = createInteractions({
      onLeppaTreeLeafageOptionsRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "leppaTreeLeafageOptions",
          id: "leppaTree",
          label: "Bio-Grow Options"
        },
        distance: 2.8
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        leppaTreeRevived: true,
        leppaBerryDropped: true
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [1.2, 0, 1.2],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      leppaTree: {
        position: [1, 0.02, 1],
        revived: true,
        berryDropped: true
      }
    });

    expect(result).toBe(true);
    expect(onLeppaTreeLeafageOptionsRequested).toHaveBeenCalledWith({
      targetId: "leppaTree"
    });
  });

  it("explains where to look when the revived tree already dropped its Pulse Berry", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "leppaBerryTree",
          id: "leppaTree",
          label: "Pick Pulse Berry"
        },
        distance: 1.2
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        squirtleLeppaRequestAvailable: true,
        leppaTreeRevived: true,
        leppaBerryDropped: true
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [1.2, 0, 1.2],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      leppaTree: {
        position: [1, 0.02, 1],
        revived: true,
        berryDropped: true
      },
      leppaBerryDrops: []
    });

    expect(result).toBe(false);
    expect(pushNotice).toHaveBeenCalledWith(
      "The tree already dropped its Pulse Berry. Check the ground nearby."
    );
  });

  it("starts the revived tree dialogue when the tree can talk", () => {
    let completeTreeDialogue = null;
    const startDialogue = vi.fn(({ onComplete }) => {
      completeTreeDialogue = onComplete;
      return true;
    });
    const interactions = createInteractions({
      startDialogue,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "leppaBerryTree",
          id: "leppaTree",
          label: "Pick Pulse Berry"
        },
        distance: 1.2
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        squirtleLeppaRequestAvailable: true,
        leppaTreeRevived: true
      }
    };
    const leppaTree = {
      position: [1, 0.02, 1],
      revived: true,
      berryDropped: false
    };
    const inventory = {};
    const leppaBerryDrops = [];
    const onNpcInteractionStart = vi.fn();

    const result = interactions.performInteractAction({
      playerPosition: [1.2, 0, 1.2],
      npcActors: [],
      interactables: [],
      storyState,
      inventory,
      leppaTree,
      leppaBerryDrops,
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(inventory.leppaBerry).toBeUndefined();
    expect(storyState.flags.leppaBerryDropped).toBeUndefined();
    expect(storyState.flags.leppaBerryCollected).toBeUndefined();
    expect(leppaBerryDrops).toHaveLength(0);
    expect(completeTreeDialogue).toEqual(expect.any(Function));
    completeTreeDialogue();

    expect(inventory.leppaBerry).toBe(1);
    expect(storyState.flags.leppaBerryDropped).toBe(true);
    expect(storyState.flags.leppaBerryCollected).toBe(true);
    expect(leppaBerryDrops).toHaveLength(1);
    expect(leppaBerryDrops[0].collected).toBe(true);
    expect(startDialogue).toHaveBeenCalledWith({
      targetId: "leppaTree",
      dialogueId: "revivedTree",
      onComplete: expect.any(Function)
    });
    expect(onNpcInteractionStart).toHaveBeenCalledWith({
      targetId: "leppaTree",
      playerPosition: [1.2, 0, 1.2],
      npcActors: [],
      interactables: [],
      targetPosition: leppaTree.position
    });
  });

  it("starts Chopper's log chair gift dialogue when the request is available", () => {
    let onComplete = null;
    const startDialogue = vi.fn(({ onComplete: nextOnComplete }) => {
      onComplete = nextOnComplete;
      return true;
    });
    const onChopperLogChairGiftRequested = vi.fn();
    const interactions = createInteractions({
      startDialogue,
      onChopperLogChairGiftRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Tangrowth"
        },
        distance: 1.05
      })),
      pushNotice: vi.fn()
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          tangrowthLogChairRequestAvailable: true,
          logChairReceived: false
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(startDialogue).toHaveBeenCalledWith({
      targetId: "tangrowth",
      dialogueId: "logChairGift",
      onComplete: expect.any(Function)
    });
    onComplete();
    expect(onChopperLogChairGiftRequested).toHaveBeenCalledTimes(1);
  });

  it("requests log chair placement from the contextual action", () => {
    const onLogChairPlacementRequested = vi.fn();
    const strikeNearbyPalm = vi.fn();
    const interactions = createInteractions({
      onLogChairPlacementRequested,
      findNearbyHarvestTarget: vi.fn(() => ({
        palm: { id: "palm-0" },
        distance: 0.8
      })),
      strikeNearbyPalm,
      pushNotice: vi.fn()
    });
    const playerPosition = [3, 0, 3];

    const result = interactions.performHarvestAction({
      playerPosition,
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {
        [LOG_CHAIR_ITEM_ID]: 1
      },
      storyState: {
        questIndex: 2,
        flags: {
          logChairReceived: true,
          logChairPlaced: false
        }
      },
      woodDrops: [],
      canPurifyGround: false
    });

    expect(result).toBe(true);
    expect(onLogChairPlacementRequested).toHaveBeenCalledWith({
      playerPosition
    });
    expect(strikeNearbyPalm).not.toHaveBeenCalled();
  });

  it("requests sitting when the player interacts with the placed log chair", () => {
    const onLogChairSitRequested = vi.fn();
    const interactions = createInteractions({
      onLogChairSitRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "logChairSeat",
          id: "logChair",
          label: "Sit on Log Chair"
        },
        distance: 0.5
      })),
      pushNotice: vi.fn()
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          logChairPlaced: true
        }
      },
      inventory: {},
      groundGrassPatches: [],
      logChair: {
        position: [0, 0.1, 0]
      }
    });

    expect(result).toBe(true);
    expect(onLogChairSitRequested).toHaveBeenCalledWith({
      targetId: "logChair"
    });
  });

  it("requests simple wooden DIY recipes from the Workbench first", () => {
    const onWorkbenchRecipesRequested = vi.fn();
    const interactions = createInteractions({
      onWorkbenchRecipesRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 0.8
      })),
      pushNotice: vi.fn()
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          bulbasaurWorkbenchGuideAvailable: true,
          workbenchDiyRecipesReceived: false
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onWorkbenchRecipesRequested).toHaveBeenCalledTimes(1);
  });

  it("detects Grow Bot as the Workbench guide conversation target", () => {
    const result = findNearbyInteractable(
      [3.2, 0, 1.1],
      [],
      [],
      {
        flags: {
          bulbasaurRevealed: true,
          bulbasaurFollowing: true,
          bulbasaurWorkbenchGuideAvailable: true,
          workbenchDiyRecipesReceived: false
        }
      },
      [],
      null,
      null,
      null,
      null,
      null,
      {
        visible: true,
        position: [3, 0.02, 1]
      }
    );

    expect(result).toEqual({
      target: {
        kind: "bulbasaurWorkbenchGuide",
        id: "bulbasaurWorkbenchGuide",
        label: "Talk to Grow Bot",
        position: [3, 0.02, 1]
      },
      distance: expect.any(Number)
    });
  });

  it("requests Workbench recipes when talking to Grow Bot during the guide", () => {
    const onWorkbenchRecipesRequested = vi.fn();
    const interactions = createInteractions({
      onWorkbenchRecipesRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "bulbasaurWorkbenchGuide",
          id: "bulbasaurWorkbenchGuide",
          label: "Talk to Grow Bot"
        },
        distance: 0.8
      })),
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurRevealed: true,
        bulbasaurWorkbenchGuideAvailable: true,
        workbenchDiyRecipesReceived: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(storyState.flags.bulbasaurFollowing).toBe(true);
    expect(onWorkbenchRecipesRequested).toHaveBeenCalledTimes(1);
  });

  it("opens the Workbench catalog as a locked preview before recipes are learned", () => {
    const onWorkbenchCraftOptionsRequested = vi.fn();
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      onWorkbenchCraftOptionsRequested,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 0.8
      })),
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {}
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(pushNotice).not.toHaveBeenCalled();
    expect(onWorkbenchCraftOptionsRequested).toHaveBeenCalledWith({
      recipes: [
        expect.objectContaining({
          recipe: expect.objectContaining({ id: GREENHOUSE_ITEM_ID }),
          disabled: false,
          guidance: "Greenhouse creates green soil in its footprint."
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "campfire" }),
          disabled: true,
          status: "Locked"
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "strawBed" }),
          disabled: true,
          status: "Locked"
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "leafDenKit" }),
          disabled: true,
          status: "Locked"
        })
      ]
    });
  });

  it("keeps idle station feedback in colony terminology", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      placeholderRecipes: {},
      findNearbyInteractable: vi.fn()
        .mockReturnValueOnce({
          target: {
            kind: "station",
            id: "inactiveStation",
            label: "Inactive Station"
          },
          distance: 0.8
        })
        .mockReturnValueOnce({
          target: {
            kind: "station",
            id: "stove",
            label: "Stove"
          },
          distance: 0.8
        }),
      pushNotice
    });
    const action = {
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {}
      },
      inventory: {},
      groundGrassPatches: []
    };

    expect(interactions.performInteractAction(action)).toBe(false);
    expect(interactions.performInteractAction(action)).toBe(false);
    expect(pushNotice).toHaveBeenNthCalledWith(
      1,
      "This station has no active colony protocol."
    );
    expect(pushNotice).toHaveBeenNthCalledWith(
      2,
      "The stove has no active colony recipe."
    );
  });

  it("keeps the Campfire Workbench option locked until the Greenhouse is placed", () => {
    const onCampfireCraftRequested = vi.fn();
    const onCampfireCrafted = vi.fn();
    const onWorkbenchCraftOptionsRequested = vi.fn();
    const syncInventoryUi = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onCampfireCraftRequested,
      onCampfireCrafted,
      onWorkbenchCraftOptionsRequested,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 0.8
      })),
      pushNotice: vi.fn()
    });
    const inventory = {
      [GEAR_ITEM_ID]: 10
    };
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurWorkbenchGuideAvailable: true,
        workbenchDiyRecipesReceived: true,
        campfireCrafted: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory,
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(inventory[GEAR_ITEM_ID]).toBe(10);
    expect(inventory[CAMPFIRE_ITEM_ID]).toBeUndefined();
    expect(storyState.flags.campfireCrafted).toBe(false);
    expect(syncInventoryUi).not.toHaveBeenCalled();
    expect(questSystem.emit).not.toHaveBeenCalled();
    expect(onCampfireCrafted).not.toHaveBeenCalled();
    expect(onCampfireCraftRequested).not.toHaveBeenCalled();
    expect(onWorkbenchCraftOptionsRequested).toHaveBeenCalledWith({
      recipes: [
        expect.objectContaining({
          recipe: expect.objectContaining({
            id: GREENHOUSE_ITEM_ID
          }),
          disabled: false
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({
            id: "campfire"
          }),
          disabled: true,
          status: "Locked · Build Greenhouse first"
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({
            id: "strawBed"
          }),
          disabled: true,
          status: "Locked"
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({
            id: "leafDenKit"
          }),
          disabled: true,
          status: "Locked"
        })
      ]
    });
  });

  it("crafts a Campfire only after confirming the Workbench modal", () => {
    const onCampfireCrafted = vi.fn();
    const onWorkbenchCraftMotionRequested = vi.fn();
    const syncInventoryUi = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onCampfireCrafted,
      onWorkbenchCraftMotionRequested,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      pushNotice: vi.fn()
    });
    const inventory = {
      [GEAR_ITEM_ID]: 10
    };
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurWorkbenchGuideAvailable: true,
        workbenchDiyRecipesReceived: true,
        greenhousePlaced: true,
        campfireCrafted: false
      }
    };

    const result = interactions.craftCampfireAtWorkbench({
      storyState,
      inventory
    });

    expect(result).toBe(true);
    expect(inventory[GEAR_ITEM_ID]).toBe(0);
    expect(inventory[CAMPFIRE_ITEM_ID]).toBe(1);
    expect(storyState.flags.campfireCrafted).toBe(true);
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "BUILD",
      targetId: CAMPFIRE_ITEM_ID,
      amount: 1
    });
    expect(onCampfireCrafted).toHaveBeenCalledWith({
      recipe: expect.objectContaining({
        id: "campfire"
      })
    });
    expect(onWorkbenchCraftMotionRequested).toHaveBeenCalledWith({
      presetId: MOTION_IMPACT_PRESET_IDS.WORKBENCH_CRAFT,
      recipe: expect.objectContaining({
        id: "campfire"
      })
    });
  });

  it("refuses to craft the Campfire before the Greenhouse is placed", () => {
    const onCampfireCrafted = vi.fn();
    const syncInventoryUi = vi.fn();
    const pushNotice = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onCampfireCrafted,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      pushNotice
    });
    const inventory = {
      [GEAR_ITEM_ID]: 10
    };
    const storyState = {
      questIndex: 2,
      flags: {
        bulbasaurWorkbenchGuideAvailable: true,
        workbenchDiyRecipesReceived: true,
        campfireCrafted: false
      }
    };

    const result = interactions.craftCampfireAtWorkbench({
      storyState,
      inventory
    });

    expect(result).toBe(false);
    expect(inventory[GEAR_ITEM_ID]).toBe(10);
    expect(inventory[CAMPFIRE_ITEM_ID]).toBeUndefined();
    expect(storyState.flags.campfireCrafted).toBe(false);
    expect(syncInventoryUi).not.toHaveBeenCalled();
    expect(questSystem.emit).not.toHaveBeenCalled();
    expect(onCampfireCrafted).not.toHaveBeenCalled();
    expect(pushNotice).toHaveBeenCalledWith("Locked · Build Greenhouse first");
  });

  it("crafts a Greenhouse when the crafted flag is stale but the kit is not in the bag", () => {
    const onGreenhouseCrafted = vi.fn();
    const syncInventoryUi = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onGreenhouseCrafted,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      pushNotice: vi.fn()
    });
    const inventory = {
      [GEAR_ITEM_ID]: 5
    };
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: false
      }
    };

    const result = interactions.craftGreenhouseAtWorkbench({
      storyState,
      inventory
    });

    expect(result).toBe(true);
    expect(inventory[GEAR_ITEM_ID]).toBe(0);
    expect(inventory[GREENHOUSE_ITEM_ID]).toBe(1);
    expect(storyState.flags.greenhouseCrafted).toBe(true);
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "BUILD",
      targetId: GREENHOUSE_ITEM_ID,
      amount: 1
    });
    expect(onGreenhouseCrafted).toHaveBeenCalledWith({
      recipe: expect.objectContaining({
        id: GREENHOUSE_ITEM_ID
      })
    });
  });

  it("routes an already prepared Greenhouse Workbench action to placement", () => {
    const onGreenhousePlacementRequested = vi.fn();
    const onGreenhouseCrafted = vi.fn();
    const interactions = createInteractions({
      onGreenhousePlacementRequested,
      onGreenhouseCrafted,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      pushNotice: vi.fn()
    });
    const inventory = {
      [GREENHOUSE_ITEM_ID]: 1
    };
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: false
      }
    };

    const result = interactions.craftGreenhouseAtWorkbench({
      storyState,
      inventory
    });

    expect(result).toBe(true);
    expect(inventory[GREENHOUSE_ITEM_ID]).toBe(1);
    expect(onGreenhouseCrafted).not.toHaveBeenCalled();
    expect(onGreenhousePlacementRequested).toHaveBeenCalledWith({
      source: "workbench"
    });
  });

  it("crafts another Greenhouse after the first one is placed", () => {
    const onGreenhouseCrafted = vi.fn();
    const syncInventoryUi = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onGreenhouseCrafted,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      pushNotice: vi.fn()
    });
    const inventory = {
      [GEAR_ITEM_ID]: 5
    };
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: true
      }
    };

    const result = interactions.craftGreenhouseAtWorkbench({
      storyState,
      inventory
    });

    expect(result).toBe(true);
    expect(inventory[GEAR_ITEM_ID]).toBe(0);
    expect(inventory[GREENHOUSE_ITEM_ID]).toBe(1);
    expect(storyState.flags.greenhousePlaced).toBe(true);
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "BUILD",
      targetId: GREENHOUSE_ITEM_ID,
      amount: 1
    });
    expect(onGreenhouseCrafted).toHaveBeenCalledWith({
      recipe: expect.objectContaining({
        id: GREENHOUSE_ITEM_ID
      })
    });
  });

  it("routes another prepared Greenhouse to placement after the first one is placed", () => {
    const onGreenhousePlacementRequested = vi.fn();
    const onGreenhouseCrafted = vi.fn();
    const interactions = createInteractions({
      onGreenhousePlacementRequested,
      onGreenhouseCrafted,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      pushNotice: vi.fn()
    });
    const inventory = {
      [GREENHOUSE_ITEM_ID]: 1
    };
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: true
      }
    };

    const result = interactions.craftGreenhouseAtWorkbench({
      storyState,
      inventory
    });

    expect(result).toBe(true);
    expect(inventory[GREENHOUSE_ITEM_ID]).toBe(1);
    expect(onGreenhouseCrafted).not.toHaveBeenCalled();
    expect(onGreenhousePlacementRequested).toHaveBeenCalledWith({
      source: "workbench"
    });
  });

  it("places a prepared Greenhouse from interaction before nearby NPC interactions", () => {
    const onGreenhousePlacementRequested = vi.fn();
    const onNpcInteractionStart = vi.fn();
    const interactions = createInteractions({
      onGreenhousePlacementRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Professor Tangrowth"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {
        [GREENHOUSE_ITEM_ID]: 1
      },
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(onNpcInteractionStart).not.toHaveBeenCalled();
    expect(onGreenhousePlacementRequested).toHaveBeenCalledWith({
      playerPosition: [0, 0, 0]
    });
  });

  it("places another prepared Greenhouse from interaction after the first one is placed", () => {
    const onGreenhousePlacementRequested = vi.fn();
    const onNpcInteractionStart = vi.fn();
    const interactions = createInteractions({
      onGreenhousePlacementRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Professor Tangrowth"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: true
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {
        [GREENHOUSE_ITEM_ID]: 1
      },
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(onNpcInteractionStart).not.toHaveBeenCalled();
    expect(onGreenhousePlacementRequested).toHaveBeenCalledWith({
      playerPosition: [0, 0, 0]
    });
  });

  it("opens the Workbench instead of placing a prepared Greenhouse when nearby", () => {
    const onGreenhousePlacementRequested = vi.fn();
    const onWorkbenchRecipesRequested = vi.fn();
    const interactions = createInteractions({
      onGreenhousePlacementRequested,
      onWorkbenchRecipesRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: false,
        bulbasaurWorkbenchGuideAvailable: true,
        workbenchDiyRecipesReceived: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {
        [GREENHOUSE_ITEM_ID]: 1
      },
      groundPurifiedInstances: [],
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onWorkbenchRecipesRequested).toHaveBeenCalledTimes(1);
    expect(onGreenhousePlacementRequested).not.toHaveBeenCalled();
  });

  it("starts prepared Greenhouse placement preview outside green ground", () => {
    const onGreenhousePlacementRequested = vi.fn();
    const onNpcInteractionStart = vi.fn();
    const interactions = createInteractions({
      onGreenhousePlacementRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Professor Tangrowth"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        greenhouseCrafted: true,
        greenhousePlaced: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {
        [GREENHOUSE_ITEM_ID]: 1
      },
      groundPurifiedInstances: [],
      groundGrassPatches: [],
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(onNpcInteractionStart).not.toHaveBeenCalled();
    expect(onGreenhousePlacementRequested).toHaveBeenCalledWith({
      playerPosition: [0, 0, 0]
    });
  });

  it("shows concrete Workbench material progress when a protocol is missing supplies", () => {
    const pushNotice = vi.fn();
    const formatRequirementSummary = vi.fn(() => "10 Gear");
    const interactions = createInteractions({
      placeholderRecipes: PLACEHOLDER_RECIPES,
      hasItems: vi.fn(() => false),
      formatRequirementSummary,
      getItemLabel: (itemId) => ({
        [GEAR_ITEM_ID]: "Gear"
      })[itemId] || itemId,
      pushNotice
    });
    const inventory = {
      [GEAR_ITEM_ID]: 1
    };
    const storyState = {
      questIndex: 2,
      flags: {
        workbenchDiyRecipesReceived: true,
        greenhousePlaced: true,
        campfireCrafted: false
      }
    };

    expect(interactions.craftCampfireAtWorkbench({ storyState, inventory })).toBe(false);
    expect(inventory[GEAR_ITEM_ID]).toBe(1);
    expect(storyState.flags.campfireCrafted).toBe(false);
    expect(pushNotice).toHaveBeenCalledWith("Missing: Gear 1/10");
    expect(formatRequirementSummary).not.toHaveBeenCalled();
  });

  it("opens Workbench craft options with Campfire first and Solar Station second", () => {
    const onStrawBedCrafted = vi.fn();
    const onWorkbenchCraftMotionRequested = vi.fn();
    const onWorkbenchCraftOptionsRequested = vi.fn();
    const syncInventoryUi = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onStrawBedCrafted,
      onWorkbenchCraftMotionRequested,
      onWorkbenchCraftOptionsRequested,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 0.8
      })),
      pushNotice: vi.fn()
    });
    const inventory = {
      [GEAR_ITEM_ID]: 20
    };
    const storyState = {
      questIndex: 2,
      flags: {
        workbenchDiyRecipesReceived: true,
        campfireCrafted: true,
        campfireSpatOut: true,
        strawBedRecipeUnlocked: true,
        strawBedCrafted: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory,
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onWorkbenchCraftOptionsRequested).toHaveBeenCalledWith({
      recipes: [
        expect.objectContaining({
          recipe: expect.objectContaining({ id: GREENHOUSE_ITEM_ID }),
          disabled: false
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "campfire" }),
          disabled: true,
          status: "Placed"
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "strawBed" }),
          disabled: false
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "leafDenKit" }),
          disabled: true,
          status: "Locked"
        })
      ]
    });
    expect(inventory[GEAR_ITEM_ID]).toBe(20);
    expect(inventory[STRAW_BED_ITEM_ID]).toBeUndefined();

    expect(interactions.craftStrawBedAtWorkbench({ storyState, inventory })).toBe(true);
    expect(inventory[GEAR_ITEM_ID]).toBe(0);
    expect(inventory[STRAW_BED_ITEM_ID]).toBe(1);
    expect(storyState.flags.strawBedCrafted).toBe(true);
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "BUILD",
      targetId: STRAW_BED_ITEM_ID,
      amount: 1
    });
    expect(onStrawBedCrafted).toHaveBeenCalledWith({
      recipe: expect.objectContaining({
        id: "strawBed"
      })
    });
    expect(onWorkbenchCraftMotionRequested).toHaveBeenCalledWith({
      presetId: MOTION_IMPACT_PRESET_IDS.WORKBENCH_CRAFT,
      recipe: expect.objectContaining({
        id: "strawBed"
      })
    });
  });

  it("keeps the unplaced Thermal Cabin available at the Workbench for recovery", () => {
    const onCampfireSpitOutRequested = vi.fn();
    const onCampfireCrafted = vi.fn();
    const onWorkbenchCraftOptionsRequested = vi.fn();
    const syncInventoryUi = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onCampfireCrafted,
      onCampfireSpitOutRequested,
      onWorkbenchCraftOptionsRequested,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 0.8
      })),
      pushNotice: vi.fn()
    });
    const inventory = {
      [GEAR_ITEM_ID]: 10
    };
    const storyState = {
      questIndex: 2,
      flags: {
        workbenchDiyRecipesReceived: true,
        greenhousePlaced: true,
        campfireCrafted: true,
        campfireSpatOut: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory,
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onWorkbenchCraftOptionsRequested).toHaveBeenCalledWith({
      recipes: expect.arrayContaining([
        expect.objectContaining({
          recipe: expect.objectContaining({ id: GREENHOUSE_ITEM_ID }),
          disabled: false,
          status: null,
          actionLabel: "Prepare Greenhouse",
          guidance: "Greenhouse creates green soil in its footprint."
        }),
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "campfire" }),
          disabled: false,
          status: null
        })
      ])
    });

    expect(interactions.craftCampfireAtWorkbench({ storyState, inventory })).toBe(true);
    expect(inventory[GEAR_ITEM_ID]).toBe(0);
    expect(inventory[CAMPFIRE_ITEM_ID]).toBe(1);
    expect(onCampfireCrafted).toHaveBeenCalledWith({
      recipe: expect.objectContaining({
        id: "campfire"
      })
    });
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "BUILD",
      targetId: CAMPFIRE_ITEM_ID,
      amount: 1
    });

    expect(interactions.craftCampfireAtWorkbench({ storyState, inventory })).toBe(true);
    expect(onCampfireSpitOutRequested).toHaveBeenCalledWith({ source: "workbench" });
  });

  it("selects an owned House Kit at the Workbench without crafting another one", () => {
    const syncInventoryUi = vi.fn();
    const consumeItemsMock = vi.fn();
    const addItemsMock = vi.fn();
    const pushNotice = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      consumeItems: consumeItemsMock,
      addItems: addItemsMock,
      questSystem,
      syncInventoryUi,
      pushNotice
    });
    const inventory = {
      wood: 7,
      [LEAF_DEN_KIT_ITEM_ID]: 1
    };
    const storyState = {
      questIndex: 2,
      flags: {
        leafDenKitPurchaseAvailable: true,
        leafDenBuildAvailable: true,
        leafDenKitSelected: false
      }
    };

    expect(interactions.craftLeafDenKitAtWorkbench({ storyState, inventory })).toBe(true);
    expect(inventory.wood).toBe(7);
    expect(inventory[LEAF_DEN_KIT_ITEM_ID]).toBe(1);
    expect(storyState.flags.leafDenKitSelected).toBe(true);
    expect(consumeItemsMock).not.toHaveBeenCalled();
    expect(addItemsMock).not.toHaveBeenCalled();
    expect(questSystem.emit).not.toHaveBeenCalled();
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(pushNotice).toHaveBeenCalledWith("House Kit selected. Set it inside the blue zone.");
  });

  it("issues an authorized House Kit at the Workbench without currency or material cost", () => {
    const syncInventoryUi = vi.fn();
    const consumeItemsMock = vi.fn();
    const onWorkbenchCraftMotionRequested = vi.fn();
    const pushNotice = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      consumeItems: consumeItemsMock,
      addItems,
      onWorkbenchCraftMotionRequested,
      questSystem,
      syncInventoryUi,
      pushNotice
    });
    const inventory = {
      lifeCoins: 10,
      wood: 0
    };
    const storyState = {
      questIndex: 2,
      flags: {
        leafDenKitPurchaseAvailable: true,
        leafDenKitSelected: false
      }
    };

    expect(interactions.craftLeafDenKitAtWorkbench({ storyState, inventory })).toBe(true);
    expect(inventory.lifeCoins).toBe(10);
    expect(inventory.wood).toBe(0);
    expect(inventory[LEAF_DEN_KIT_ITEM_ID]).toBe(1);
    expect(storyState.flags.leafDenKitPurchased).toBe(true);
    expect(storyState.flags.leafDenBuildAvailable).toBe(true);
    expect(storyState.flags.leafDenKitSelected).toBe(true);
    expect(consumeItemsMock).not.toHaveBeenCalled();
    expect(questSystem.emit).toHaveBeenCalledWith({
      type: "BUILD",
      targetId: LEAF_DEN_KIT_ITEM_ID,
      amount: 1
    });
    expect(syncInventoryUi).toHaveBeenCalledWith(inventory);
    expect(pushNotice).toHaveBeenCalledWith("House Kit prepared.");
    expect(onWorkbenchCraftMotionRequested).toHaveBeenCalledWith({
      presetId: MOTION_IMPACT_PRESET_IDS.WORKBENCH_CRAFT,
      recipe: expect.objectContaining({
        id: LEAF_DEN_KIT_ITEM_ID
      })
    });
  });

  it("keeps the crafted Solar Station available at the Workbench until placed", () => {
    const onStrawBedPlacementRequested = vi.fn();
    const onStrawBedCrafted = vi.fn();
    const onWorkbenchCraftOptionsRequested = vi.fn();
    const syncInventoryUi = vi.fn();
    const questSystem = { emit: vi.fn() };
    const interactions = createInteractions({
      onStrawBedCrafted,
      onStrawBedPlacementRequested,
      onWorkbenchCraftOptionsRequested,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      addItems,
      consumeItems,
      questSystem,
      syncInventoryUi,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 0.8
      })),
      pushNotice: vi.fn()
    });
    const inventory = {
      [GEAR_ITEM_ID]: 20,
      [STRAW_BED_ITEM_ID]: 1
    };
    const storyState = {
      questIndex: 2,
      flags: {
        strawBedRecipeUnlocked: true,
        strawBedCrafted: true,
        strawBedPlacedInBulbasaurHabitat: false
      }
    };

    expect(interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory,
      groundGrassPatches: []
    })).toBe(true);

    expect(onWorkbenchCraftOptionsRequested).toHaveBeenCalledWith({
      recipes: expect.arrayContaining([
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "strawBed" }),
          disabled: false,
          status: "Ready to place",
          actionLabel: "X Place Solar Station"
        })
      ])
    });

    expect(interactions.craftStrawBedAtWorkbench({ storyState, inventory })).toBe(true);
    expect(onStrawBedPlacementRequested).toHaveBeenCalledWith({ source: "workbench" });
    expect(inventory[GEAR_ITEM_ID]).toBe(20);
    expect(inventory[STRAW_BED_ITEM_ID]).toBe(1);
    expect(onStrawBedCrafted).not.toHaveBeenCalled();
    expect(questSystem.emit).not.toHaveBeenCalled();
  });

  it("keeps an owned House Kit blocked in the Workbench catalog until Solar Station support exists", () => {
    const onWorkbenchCraftOptionsRequested = vi.fn();
    const interactions = createInteractions({
      onWorkbenchCraftOptionsRequested,
      placeholderRecipes: PLACEHOLDER_RECIPES,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "station",
          id: "workbench",
          label: "Workbench"
        },
        distance: 0.8
      })),
      pushNotice: vi.fn()
    });
    const inventory = {
      [LEAF_DEN_KIT_ITEM_ID]: 1
    };
    const storyState = {
      questIndex: 2,
      flags: {
        leafDenBuildAvailable: true,
        leafDenKitSelected: false
      }
    };

    expect(interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory,
      groundGrassPatches: []
    })).toBe(true);

    expect(onWorkbenchCraftOptionsRequested).toHaveBeenCalledWith({
      recipes: expect.arrayContaining([
        expect.objectContaining({
          recipe: expect.objectContaining({ id: "leafDenKit" }),
          disabled: true,
          status: "Place the Solar Station before placing the House Kit.",
          actionLabel: null,
          guidance: "Place the Solar Station first. Its blue support zone enables House Kit placement."
        })
      ])
    });
  });

  it("places the crafted Solar Station on open terrain", () => {
    const onStrawBedPlacementRequested = vi.fn();
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      onStrawBedPlacementRequested,
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        rustlingGrassCellId: "ground-1",
        strawBedCrafted: true,
        strawBedPlacedInBulbasaurHabitat: false
      }
    };
    const groundGrassPatches = [
      {
        cellId: "ground-1",
        habitatGroupId: "tall-grass-habitat-0",
        state: "alive",
        position: [8, 0.02, -6]
      },
      {
        cellId: "ground-2",
        habitatGroupId: "tall-grass-habitat-0",
        state: "alive",
        position: [9, 0.02, -6]
      },
      {
        cellId: "ground-3",
        habitatGroupId: "tall-grass-habitat-0",
        state: "alive",
        position: [8, 0.02, -5]
      },
      {
        cellId: "ground-4",
        habitatGroupId: "tall-grass-habitat-0",
        state: "alive",
        position: [9, 0.02, -5]
      }
    ];

    expect(interactions.performHarvestAction({
      playerPosition: [8.4, 0, -5.4],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {
        [STRAW_BED_ITEM_ID]: 1
      },
      storyState,
      woodDrops: [],
      groundGrassPatches
    })).toBe(true);
    expect(onStrawBedPlacementRequested).toHaveBeenCalledWith({
      placementTarget: expect.objectContaining({
        canPlace: true,
        center: [8.4, 0.02, -5.4],
        bounds: {
          minX: -141.8,
          maxX: 141.8,
          minZ: -141.8,
          maxZ: 141.8
        },
        gridStep: 1
      })
    });
  });

  it("places the selected House Kit in the current area", () => {
    const onLeafDenKitPlacementRequested = vi.fn();
    const interactions = createInteractions({
      onLeafDenKitPlacementRequested
    });
    const storyState = {
      questIndex: 2,
      flags: {
        leafDenBuildAvailable: true,
        leafDenKitSelected: true,
        strawBedPlacedInBulbasaurHabitat: true,
        leafDenKitPlaced: false
      }
    };

    expect(interactions.performHarvestAction({
      playerPosition: [5, 0, 5],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      },
      storyState,
      woodDrops: []
    })).toBe(true);

    expect(onLeafDenKitPlacementRequested).toHaveBeenCalledWith({
      playerPosition: [5, 0, 5]
    });
  });

  it("blocks House Kit placement until the Solar Station is placed", () => {
    const onLeafDenKitPlacementRequested = vi.fn();
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      onLeafDenKitPlacementRequested,
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        leafDenBuildAvailable: true,
        leafDenKitSelected: true,
        strawBedPlacedInBulbasaurHabitat: false
      }
    };

    expect(interactions.performHarvestAction({
      playerPosition: [5, 0, 5],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {
        [LEAF_DEN_KIT_ITEM_ID]: 1
      },
      storyState,
      woodDrops: []
    })).toBe(false);

    expect(onLeafDenKitPlacementRequested).not.toHaveBeenCalled();
    expect(pushNotice).toHaveBeenCalledWith("Place the Solar Station before placing the House Kit.");
  });

  it("requests House construction when inspecting the placed kit", () => {
    const onLeafDenConstructionRequested = vi.fn();
    const interactions = createInteractions({
      onLeafDenConstructionRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "leafDenConstruction",
          id: "leafDen",
          label: "House"
        },
        distance: 1.1
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          leafDenKitPlaced: true
        }
      },
      inventory: {},
      groundGrassPatches: [],
      leafDen: {
        position: [0, 0.02, 0]
      }
    });

    expect(result).toBe(true);
    expect(onLeafDenConstructionRequested).toHaveBeenCalledWith({
      targetId: "leafDen"
    });
  });

  it("requests House entry after the den is complete", () => {
    const onLeafDenEnterRequested = vi.fn();
    const interactions = createInteractions({
      onLeafDenEnterRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "leafDenEntrance",
          id: "leafDen",
          label: "House"
        },
        distance: 1.1
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          leafDenBuilt: true,
          leafDenFurnitureRequestAvailable: true
        }
      },
      inventory: {},
      groundGrassPatches: [],
      leafDen: {
        position: [0, 0.02, 0]
      }
    });

    expect(result).toBe(true);
    expect(onLeafDenEnterRequested).toHaveBeenCalledWith({
      targetId: "leafDen"
    });
  });

  it("places furniture inside the House once the player has entered", () => {
    const onLeafDenFurniturePlacementRequested = vi.fn();
    const interactions = createInteractions({
      onLeafDenFurniturePlacementRequested
    });

    expect(interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {},
      storyState: {
        questIndex: 2,
        flags: {
          leafDenFurnitureRequestAvailable: true,
          leafDenInteriorEntered: true,
          leafDenFurniturePlacedCount: 1
        }
      },
      woodDrops: []
    })).toBe(true);

    expect(onLeafDenFurniturePlacementRequested).toHaveBeenCalledWith({
      playerPosition: [0, 0, 0]
    });
  });

  it("places the selected Ditto Flag on the House", () => {
    const onDittoFlagPlacementRequested = vi.fn();
    const interactions = createInteractions({
      onDittoFlagPlacementRequested
    });
    const leafDen = {
      id: "leaf-den-0",
      position: [0.4, 0.02, 0.4]
    };

    expect(interactions.performHarvestAction({
      playerPosition: [0, 0, 0],
      palmModel: null,
      palmInstances: [],
      resourceNodes: [],
      inventory: {
        [DITTO_FLAG_ITEM_ID]: 1
      },
      storyState: {
        questIndex: 2,
        flags: {
          dittoFlagReceived: true,
          dittoFlagSelectedForHouse: true,
          dittoFlagPlacedOnHouse: false,
          leafDenKitPlaced: true,
          leafDenBuilt: true
        }
      },
      leafDen,
      woodDrops: []
    })).toBe(true);

    expect(onDittoFlagPlacementRequested).toHaveBeenCalledWith({
      placementTarget: {
        leafDen
      }
    });
  });

  it("requests Timburr's House furniture completion dialogue", () => {
    const onTimburrLeafDenFurnitureCompleteRequested = vi.fn();
    const interactions = createInteractions({
      onTimburrLeafDenFurnitureCompleteRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "timburrLeafDenFurnitureComplete",
          id: "timburr",
          label: "Talk to Timburr"
        },
        distance: 1.1
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          leafDenFurnitureRequestAvailable: true,
          leafDenFurniturePlacedCount: 3,
          timburrRevealed: true
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onTimburrLeafDenFurnitureCompleteRequested).toHaveBeenCalledWith({
      targetId: "timburr"
    });
  });

  it("lets the player choose follow me near a companion Pokemon", () => {
    const pushNotice = vi.fn();
    const interactions = createInteractions({
      pushNotice,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "pokemonCompanion",
          id: "charmander",
          label: "Follow me: Charmander"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        charmanderRevealed: true,
        charmanderFollowing: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(storyState.flags.charmanderFollowing).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith("Thermal Bot is following you.");
  });

  it("enforces the active follower limit before adding another Pokemon", () => {
    const followFlags = {
      one: "oneFollowing",
      two: "twoFollowing",
      three: "threeFollowing",
      four: "fourFollowing",
      five: "fiveFollowing",
      six: "sixFollowing"
    };
    const storyState = {
      flags: {
        oneFollowing: true,
        twoFollowing: true,
        threeFollowing: true,
        fourFollowing: true,
        fiveFollowing: true
      }
    };

    expect(countActivePokemonFollowers(storyState.flags, followFlags)).toBe(5);
    expect(canAddPokemonFollower(storyState, "six", {
      followFlags,
      maxFollowers: 5
    })).toBe(false);
    expect(canAddPokemonFollower(storyState, "one", {
      followFlags,
      maxFollowers: 5
    })).toBe(true);
  });

  it("shows feedback when the follower group is full", () => {
    const pushNotice = vi.fn();
    const pokemonFollowFlags = {
      one: "oneFollowing",
      two: "twoFollowing",
      three: "threeFollowing",
      four: "fourFollowing",
      five: "fiveFollowing",
      six: "sixFollowing"
    };
    const interactions = createInteractions({
      maxPokemonFollowers: 5,
      pokemonFollowFlags,
      pushNotice,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "pokemonCompanion",
          id: "six",
          label: "Follow me: Six"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        oneFollowing: true,
        twoFollowing: true,
        threeFollowing: true,
        fourFollowing: true,
        fiveFollowing: true
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(pushNotice).toHaveBeenCalledWith(
      "Too many bots are following. Ask one to wait before adding another."
    );
    expect(storyState.flags.sixFollowing).toBeUndefined();
  });

  it("starts Charmander's celebration request from Charmander", () => {
    const onCharmanderCelebrationSuggested = vi.fn();
    const interactions = createInteractions({
      onCharmanderCelebrationSuggested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "charmanderCelebrationRequest",
          id: "charmander",
          label: "Talk to Charmander"
        },
        distance: 1.1
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          charmanderCelebrationRequestAvailable: true,
          charmanderRevealed: true
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onCharmanderCelebrationSuggested).toHaveBeenCalledWith({
      targetId: "charmander"
    });
  });

  it("starts the Charmander celebration cutscene through Tangrowth", () => {
    const onCharmanderCelebrationTangrowthRequested = vi.fn();
    const onNpcInteractionStart = vi.fn();
    const interactions = createInteractions({
      onCharmanderCelebrationTangrowthRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Professor Tangrowth"
        },
        distance: 1.1
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          charmanderCelebrationSuggested: true,
          charmanderCelebrationComplete: false
        }
      },
      inventory: {},
      groundGrassPatches: [],
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(onNpcInteractionStart).toHaveBeenCalledWith({
      targetId: "tangrowth",
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: []
    });
    expect(onCharmanderCelebrationTangrowthRequested).toHaveBeenCalledWith({
      targetId: "tangrowth"
    });
  });

  it("places crafted Campfire wood from interaction without selecting it in the bag", () => {
    const pushNotice = vi.fn();
    const onCampfireSpitOutRequested = vi.fn();
    const interactions = createInteractions({
      onCampfireSpitOutRequested,
      findNearbyInteractable: vi.fn(() => null),
      pushNotice
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          greenhousePlaced: true,
          campfireCrafted: true,
          campfireSpatOut: false
        }
      },
      inventory: {
        [CAMPFIRE_ITEM_ID]: 1
      },
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(pushNotice).not.toHaveBeenCalled();
    expect(onCampfireSpitOutRequested).toHaveBeenCalledWith({
      playerPosition: [0, 0, 0]
    });
  });

  it("places Campfire wood before nearby NPC interactions while the crafted Campfire is ready", () => {
    const onCampfireSpitOutRequested = vi.fn();
    const onNpcInteractionStart = vi.fn();
    const interactions = createInteractions({
      onCampfireSpitOutRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Professor Tangrowth"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        greenhousePlaced: true,
        campfireCrafted: true,
        campfireSpatOut: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {
        [CAMPFIRE_ITEM_ID]: 1
      },
      groundGrassPatches: [],
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(onNpcInteractionStart).not.toHaveBeenCalled();
    expect(onCampfireSpitOutRequested).toHaveBeenCalledWith({
      playerPosition: [0, 0, 0]
    });
  });

  it("opens Tangrowth's tall grass return dialogue after the habitat has been restored", () => {
    let onComplete = null;
    const startDialogue = vi.fn(({ onComplete: nextOnComplete }) => {
      onComplete = nextOnComplete;
      return true;
    });
    const interactions = createInteractions({
      startDialogue,
      getActiveQuest: () => ({
        id: "findPokemon",
        title: "Find the Pokemon",
        actionLabel: "E / Talk"
      }),
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "npc",
          id: "tangrowth",
          label: "Tangrowth"
        },
        distance: 1.1
      })),
      pushNotice: vi.fn()
    });
    const storyState = {
      questIndex: 1,
      flags: {
        tallGrassDiscovered: true,
        tangrowthTallGrassCommentSeen: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {}
    });

    expect(result).toBe(true);
    expect(startDialogue).toHaveBeenCalledWith({
      targetId: "tangrowth",
      dialogueId: "tallGrassReturn",
      onComplete: expect.any(Function)
    });
    expect(storyState.flags.tangrowthTallGrassCommentSeen).toBe(false);
    onComplete();
    expect(storyState.flags.tangrowthTallGrassCommentSeen).toBe(true);
  });

  it("requests Ruined Colony Terminal inspection from the site interaction", () => {
    const onRuinedPokemonCenterInspectRequested = vi.fn();
    const onNpcInteractionStart = vi.fn();
    const interactions = createInteractions({
      onRuinedPokemonCenterInspectRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "ruinedPokemonCenter",
          label: "Ruined Colony Terminal"
        },
        distance: 1.4
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          pokemonCenterGuideStarted: true
        }
      },
      inventory: {},
      groundGrassPatches: [],
      onNpcInteractionStart
    });

    expect(result).toBe(true);
    expect(onNpcInteractionStart).toHaveBeenCalledWith({
      targetId: "ruinedPokemonCenter",
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: []
    });
    expect(onRuinedPokemonCenterInspectRequested).toHaveBeenCalledWith({
      targetId: "ruinedPokemonCenter"
    });
  });

  it("requests Habitat Checks unlock from the Colony Terminal interaction", () => {
    const onPokemonCenterPcCheckRequested = vi.fn();
    const interactions = createInteractions({
      onPokemonCenterPcCheckRequested,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "site",
          id: "pokemonCenterPc",
          label: "Colony Terminal"
        },
        distance: 1.2
      }))
    });

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState: {
        questIndex: 2,
        flags: {
          ruinedPokemonCenterInspected: true
        }
      },
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(onPokemonCenterPcCheckRequested).toHaveBeenCalledWith({
      targetId: "pokemonCenterPc"
    });
  });

  it("creates Boulder-Shaded Tall Grass with Leafage near the challenge boulder", () => {
    const groundPurifiedInstances = [0, 1, 2, 3].map((index) => ({
      id: `boulder-ground-${index}`,
      offset: [
        BOULDER_SHADED_TALL_GRASS_BOULDER_POSITION[0] + (index % 2) * 1.1,
        0,
        BOULDER_SHADED_TALL_GRASS_BOULDER_POSITION[2] + Math.floor(index / 2) * 1.1
      ],
      surfaceY: 0,
      tileSpan: 1.425,
      active: true,
      purifiable: true
    }));
    const groundGrassPatches = [];
    const pushNotice = vi.fn();
    const habitatSystem = { recordEvent: vi.fn() };
    const interactions = createInteractions({
      findNearbyGroundCell: vi.fn((playerPosition, candidateGroundCells) => ({
        groundCell: candidateGroundCells[0],
        distance: 0.2
      })),
      habitatSystem,
      pushNotice
    });
    const storyState = {
      questIndex: 2,
      flags: {
        boulderChallengeAvailable: true
      }
    };

    for (let index = 0; index < 4; index += 1) {
      expect(interactions.performHarvestAction({
        playerPosition: groundPurifiedInstances[index].offset,
        palmModel: null,
        palmInstances: [],
        resourceNodes: [],
        inventory: {},
        storyState,
        woodDrops: [],
        groundDeadInstances: [],
        groundGrassPatches,
        groundPurifiedInstances,
        canUseLeafage: true
      })).toBe(true);
    }

    expect(storyState.flags.boulderShadedTallGrassCount).toBe(4);
    expect(storyState.flags.boulderShadedTallGrassHabitatCreated).toBe(true);
    expect(storyState.flags.timburrRustlingGrassCellId).toBe("boulder-ground-0");
    expect(pushNotice).toHaveBeenCalledWith(
      "A boulder-shaded tall grass colony zone is rustling.",
      3.6
    );
    expect(habitatSystem.recordEvent).toHaveBeenCalledWith({
      type: HABITAT_EVENT.RESTORE_HABITAT,
      targetId: "boulder-shaded-tall-grass"
    });
  });

  it("reveals Timburr from the Boulder-Shaded Tall Grass inspection", () => {
    const onTimburrRevealed = vi.fn();
    const interactions = createInteractions({
      onTimburrRevealed,
      findNearbyInteractable: vi.fn(() => ({
        target: {
          kind: "timburrGrassEncounter",
          id: "timburrRustlingGrass",
          label: "Help Builder Bot",
          cellId: "boulder-ground-0"
        },
        distance: 1.1
      }))
    });
    const storyState = {
      questIndex: 2,
      flags: {
        boulderShadedTallGrassHabitatCreated: true,
        timburrRustlingGrassCellId: "boulder-ground-0",
        timburrRevealed: false
      }
    };

    const result = interactions.performInteractAction({
      playerPosition: [0, 0, 0],
      npcActors: [],
      interactables: [],
      storyState,
      inventory: {},
      groundGrassPatches: []
    });

    expect(result).toBe(true);
    expect(storyState.flags.timburrRevealed).toBe(true);
    expect(storyState.flags.timburrRobotReactivated).toBe(true);
    expect(storyState.flags.timburrFollowing).toBe(true);
    expect(onTimburrRevealed).toHaveBeenCalledWith({
      cellId: "boulder-ground-0"
    });
  });
});
