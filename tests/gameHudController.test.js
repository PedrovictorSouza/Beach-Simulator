// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGameHudController,
  formatColonyCacheHudText,
  formatColonyStatusHudText
} from "../app/ui/gameHudController.js";
import {
  DEFAULT_GAME_HUD_INITIAL_STATUS,
  resolveGameHudInitialStatus
} from "../app/ui/gameHudControllerConfig.ts";
import { renderInventoryCountHtml } from "../app/ui/uiTextValue.ts";
import {
  GAMEPAD_LAYOUT,
  INPUT_DEVICE
} from "../input/inputModality.js";

function createController() {
  const currentActionElement = document.createElement("section");
  currentActionElement.className = "hud-current-action";
  const instructionsElement = document.createElement("span");
  currentActionElement.appendChild(instructionsElement);

  const controller = createGameHudController({
    hudInstructionsElement: instructionsElement,
    questSystem: {
      getActiveQuest: () => ({
        id: "makingHabitats",
        description: "Arrange restored items into a habitat.",
        guidance: "Restore one nearby patch."
      })
    }
  });

  return {
    controller,
    currentActionElement,
    instructionsElement
  };
}

describe("createGameHudController", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("renders typed inventory count values without any", () => {
    expect(renderInventoryCountHtml({ value: 3 })).toBe('<span class="inventory-count">3</span>');
    expect(renderInventoryCountHtml({ value: "+2" })).toBe('<span class="inventory-count">+2</span>');
    expect(renderInventoryCountHtml({ value: null })).toBe("");
  });

  it("uses a default initial status when the optional prop is omitted", () => {
    expect(resolveGameHudInitialStatus()).toBe(DEFAULT_GAME_HUD_INITIAL_STATUS);
    expect(resolveGameHudInitialStatus({})).toBe(DEFAULT_GAME_HUD_INITIAL_STATUS);
    expect(resolveGameHudInitialStatus({ initialStatus: "Ready" })).toBe("Ready");
  });

  it("shows tracked workbench plans in colony language", () => {
    const statusElement = document.createElement("div");
    const controller = createGameHudController({
      statusElement,
      initialStatus: "Colony systems online."
    });

    controller.setTrackedRecipe({
      name: "Bridge Repair Kit",
      ingredients: [
        { amount: 4, name: "Wood" },
        { amount: 2, name: "Flax Fiber" }
      ]
    });

    expect(statusElement.textContent).toBe(
      "Colony systems online. | Plan: Bridge Repair Kit | 4 Wood, 2 Flax Fiber"
    );
  });

  it("formats colony status as compact HUD meta instead of quest copy", () => {
    expect(formatColonyStatusHudText({
      activeTool: "Hydro Jet",
      systems: [
        { label: "Power", state: "active", detail: "Solar Station online." },
        { label: "Water", state: "active", detail: "Hydro Jet selected." },
        { label: "Soil", state: "active", detail: "4/10 dry grass restored." },
        { label: "Shelter", state: "ready", detail: "House Kit ready." }
      ]
    })).toBe("Tool Hydro Jet • Power online • Water online • Soil 4/10 • Shelter ready");
  });

  it("formats colony cache supply counts for the HUD meta", () => {
    expect(formatColonyCacheHudText({
      totalItems: 0,
      groupCounts: {}
    })).toBe("");

    expect(formatColonyCacheHudText({
      totalItems: 4,
      groupCounts: {
        materials: 3
      }
    })).toBe("Cache build-ready: 4 supplies, 3 materials");
  });

  it("removes the legacy HUD meta element instead of rendering colony status", () => {
    const hudMetaElement = document.createElement("span");
    hudMetaElement.id = "hud-meta";
    document.body.appendChild(hudMetaElement);

    const controller = createGameHudController({
      hudMetaElement
    });

    expect(document.getElementById("hud-meta")).toBeNull();

    controller.syncSkillsUi({ waterGun: true }, "waterGun", {
      flags: {
        restoredGrassCount: 4
      }
    });
    controller.syncHudMeta({
      flags: {
        strawBedPlacedInBulbasaurHabitat: true,
        restoredGrassCount: 4,
        leafDenBuildAvailable: true
      }
    }, {
      waterGunTotem: 1,
      leafDenKit: 1
    });

    expect(hudMetaElement.textContent).toBe("");
    expect(hudMetaElement.dataset.colonyStatus).toBeUndefined();
  });

  it("shows immediate prompts as the current action instead of repeating quest copy", () => {
    const {
      controller,
      currentActionElement,
      instructionsElement
    } = createController();

    controller.syncHudInstructions({}, "[Enter] Mark dry ground for Hydro Bot \u2022 1 queued");

    expect(instructionsElement.textContent).toBe("[Enter] Mark dry ground for Hydro Bot \u2022 1 queued");
    expect(currentActionElement.dataset.actionKind).toBe("water");
  });

  it("classifies Sandbots bot names as talk actions when no stronger action term exists", () => {
    const {
      controller,
      currentActionElement,
      instructionsElement
    } = createController();

    controller.syncHudInstructions({}, "Talk to Grow Bot");

    expect(instructionsElement.textContent).toBe("Talk to Grow Bot");
    expect(currentActionElement.dataset.actionKind).toBe("talk");
  });

  it("prioritizes explicit Hydro Jet guidance over bot names in current-action styling", () => {
    const {
      controller,
      currentActionElement,
      instructionsElement
    } = createController();

    controller.syncHudInstructions(
      {},
      "Experiment with Hydro Jet. Restore any dry patch that looks interesting; Grow Bot can wait."
    );

    expect(instructionsElement.textContent).toBe(
      "Experiment with Hydro Jet. Restore any dry patch that looks interesting; Grow Bot can wait."
    );
    expect(currentActionElement.dataset.actionKind).toBe("water");
  });

  it("falls back to quest guidance when no immediate prompt is available", () => {
    const {
      controller,
      currentActionElement,
      instructionsElement
    } = createController();

    controller.syncHudInstructions({}, "");

    expect(instructionsElement.textContent).toBe("Restore one nearby patch.");
    expect(currentActionElement.dataset.actionKind).toBe("water");
  });

  it("uses exploration guidance during the first taught action freedom window", () => {
    const {
      controller,
      currentActionElement,
      instructionsElement
    } = createController();

    controller.syncHudInstructions({
      flags: {
        firstRequiredTaughtActionFreedomWindowActive: true
      }
    }, "");

    expect(instructionsElement.textContent).toBe(
      "Experiment with Hydro Jet. Restore any dry patch that looks interesting; Grow Bot can wait until you're ready."
    );
    expect(currentActionElement.dataset.actionKind).toBe("water");
  });

  it("uses errand quest HUD text before generic guidance", () => {
    const instructionsElement = document.createElement("span");
    const controller = createGameHudController({
      hudInstructionsElement: instructionsElement,
      questSystem: {
        getActiveQuest: () => ({
          id: "gather-first-supplies",
          description: "Wake Hydro Bot.",
          guidance: "Follow Chopper's marker.",
          errandQuest: {
            hudText: "Wake up Hydro Bot"
          }
        })
      }
    });

    controller.syncHudInstructions({}, "");

    expect(instructionsElement.textContent).toBe(
      "Wake up Hydro Bot"
    );
  });

  it("does not repeat the active quest title in the current-action instructions", () => {
    const instructionsElement = document.createElement("span");
    const controller = createGameHudController({
      hudInstructionsElement: instructionsElement,
      questSystem: {
        getActiveQuest: () => ({
          id: "gather-first-supplies",
          title: "Wake up Hydro Bot",
          description: "Bring Hydro Bot back online.",
          guidance: "Follow Chopper's marker to Hydro Bot, then interact when the prompt appears.",
          errandQuest: {
            hudText: "Wake up Hydro Bot"
          }
        })
      }
    });

    controller.syncHudInstructions({}, "");

    expect(instructionsElement.textContent).toBe(
      "Follow Chopper's marker to Hydro Bot, then interact when the prompt appears."
    );
  });

  it("uses the input modality for the initial HUD guide", () => {
    const instructionsElement = document.createElement("span");
    const controller = createGameHudController({
      hudInstructionsElement: instructionsElement,
      getActiveQuest: () => null
    });

    controller.syncHudInstructions({}, "", {
      device: INPUT_DEVICE.GAMEPAD,
      gamepadLayout: GAMEPAD_LAYOUT.GENERIC
    });

    expect(instructionsElement.textContent).toBe(
      "Use the left stick to reach Chopper. He will point out the first repair."
    );
  });

  it("updates the first movement checklist when the input modality changes", () => {
    const instructionsElement = document.createElement("span");
    const hudChecklistElement = document.createElement("div");
    const taskHudView = {
      active: true,
      objectives: [
        {
          id: "move-after-crash",
          title: "Move away from the crash site",
          completed: false,
          progressText: "0/1"
        }
      ]
    };
    const controller = createGameHudController({
      hudInstructionsElement: instructionsElement,
      hudChecklistElement,
      questSystem: {
        getActiveQuest: () => ({
          id: "learn-to-move",
          title: "Take Your First Steps",
          description: "Move after the crash."
        }),
        getTaskHudView: () => taskHudView
      }
    });

    controller.syncQuestFocus({ flags: {} });
    expect(hudChecklistElement.textContent).toContain("Use W/A/S/D to move away.");
    expect(hudChecklistElement.textContent).not.toContain("Left stick");

    controller.syncHudInstructions({ flags: {} }, "", {
      device: INPUT_DEVICE.GAMEPAD,
      gamepadLayout: GAMEPAD_LAYOUT.GENERIC
    });

    expect(hudChecklistElement.textContent).toContain("Use the left stick to move away.");
    expect(hudChecklistElement.textContent).not.toContain("Use W/A/S/D to move away.");
  });

  it("treats invalid nearby habitat values as an empty list", () => {
    const hudChecklistElement = document.createElement("div");
    const activeQuest = {
      id: "makingHabitats",
      title: "Making colony zones",
      objectives: []
    };
    const controller = createGameHudController({
      hudChecklistElement,
      getActiveQuest: () => activeQuest
    });
    const storyState = { flags: {} };

    expect(() => controller.setNearbyHabitats(null)).not.toThrow();
    expect(() => controller.setNearbyHabitats("Tall Grass")).not.toThrow();
    controller.syncQuestFocus(storyState);

    let checklistItems = [...hudChecklistElement.querySelectorAll(".hud-checklist__item")];
    expect(checklistItems.map((item) => item.textContent.replace(/\s+/g, " ").trim())).toEqual([
      "Use Hydro Jet on a dry object",
      "Find a restored colony zone",
      "Discover the tall grass clue"
    ]);
    expect(checklistItems[1]?.dataset.done).toBe("false");

    controller.setNearbyHabitats(["Tall Grass", null, "Flower Bed"]);
    controller.syncQuestFocus(storyState);

    checklistItems = [...hudChecklistElement.querySelectorAll(".hud-checklist__item")];
    expect(checklistItems[1]?.dataset.done).toBe("true");
  });

  it("turns the first taught action checklist into exploration while the freedom window is active", () => {
    const hudChecklistElement = document.createElement("div");
    const activeQuest = {
      id: "makingHabitats",
      title: "Making colony zones",
      objectives: []
    };
    const controller = createGameHudController({
      hudChecklistElement,
      getActiveQuest: () => activeQuest
    });
    const storyState = {
      flags: {
        firstRequiredTaughtActionFreedomWindowActive: true,
        firstGrassRestored: true
      }
    };

    controller.setNearbyHabitats(["Tall Grass"]);
    controller.syncQuestFocus(storyState);

    const checklistItems = [...hudChecklistElement.querySelectorAll(".hud-checklist__item")];
    expect(checklistItems.map((item) => item.textContent.replace(/\s+/g, " ").trim())).toEqual([
      "Try Hydro Jet on any dry patch that catches your eye",
      "Watch what changes around the soil",
      "Keep exploring; Grow Bot can wait"
    ]);
    expect(checklistItems.map((item) => item.dataset.done)).toEqual(["true", "true", "false"]);
  });

  it("quietly hides the quest checklist while the player is placing an object", () => {
    const instructionsElement = document.createElement("span");
    const hudChecklistElement = document.createElement("div");
    const activeQuest = {
      id: "makingHabitats",
      title: "Making colony zones",
      objectives: []
    };
    const controller = createGameHudController({
      hudInstructionsElement: instructionsElement,
      hudChecklistElement,
      getActiveQuest: () => activeQuest
    });

    controller.syncQuestFocus({ flags: {} });
    expect(hudChecklistElement.querySelectorAll(".hud-checklist__item")).toHaveLength(3);

    controller.syncHudInstructions(
      { flags: {} },
      "Set Solar Station site  X / Enter Place  B Cancel  LB/RB Rotate"
    );
    expect(instructionsElement.textContent).toBe(
      "Set Solar Station site  X / Enter Place  B Cancel  LB/RB Rotate"
    );
    expect(hudChecklistElement.hidden).toBe(true);
    expect(hudChecklistElement.dataset.presentation).toBe("quiet-placement");

    controller.syncHudInstructions({ flags: {} }, "Talk to Grow Bot");
    expect(hudChecklistElement.hidden).toBe(false);
    expect(hudChecklistElement.dataset.presentation).toBe("quest");
  });

  it("renders the visible inventory as a field-use belt", () => {
    const inventoryGridElement = document.createElement("div");
    const controller = createGameHudController({
      inventoryGridElement,
      inventoryOrder: [
        "waterGunTotem",
        "simpleWoodenDiyRecipes",
        "lifeCoins",
        "wood",
        "campfire",
        "leppaBerry"
      ],
      itemDefs: {
        waterGunTotem: {
          shortLabel: "Totem",
          glyph: "T",
          color: "#65c7ff",
          ink: "#081f33",
          slotRole: "key"
        },
        simpleWoodenDiyRecipes: {
          shortLabel: "DIY",
          glyph: "D",
          color: "#d2a36a",
          ink: "#2a1809",
          slotRole: "recipe"
        },
        lifeCoins: {
          shortLabel: "Log",
          glyph: "V",
          color: "#7bc7ff",
          ink: "#0b1f32",
          slotRole: "key",
          hiddenFromInventory: true
        },
        wood: {
          shortLabel: "Wood",
          glyph: "W",
          color: "#8c5a34",
          ink: "#fff1e8",
          slotRole: "material"
        },
        campfire: {
          shortLabel: "Fire",
          glyph: "F",
          color: "#f07d38",
          ink: "#2a1205",
          slotRole: "placeable"
        },
        leppaBerry: {
          shortLabel: "Leppa",
          glyph: "L",
          color: "#e85e50",
          ink: "#fff7de",
          slotRole: "gift"
        }
      }
    });

    controller.syncInventoryUi({
      waterGunTotem: 1,
      simpleWoodenDiyRecipes: 1,
      lifeCoins: 10,
      wood: 3,
      campfire: 1,
      leppaBerry: 1
    });

    const slots = [...inventoryGridElement.querySelectorAll(".inventory-slot[data-filled='true']")];
    expect(inventoryGridElement.querySelector(".inventory-slot__label")).toBeNull();
    expect(inventoryGridElement.querySelector(".inventory-slot__role")).toBeNull();
    expect(slots.some((slot) => slot.dataset.slotRole === "key")).toBe(false);
    expect(slots.some((slot) => slot.dataset.slotRole === "recipe")).toBe(false);
    expect(slots.some((slot) => slot.dataset.slotRole === "currency")).toBe(false);
    expect(inventoryGridElement.textContent).not.toContain("V");
    expect(inventoryGridElement.textContent).not.toContain("T");
    expect(inventoryGridElement.textContent).not.toContain("D");

    const woodSlot = slots.find((slot) => {
      return slot.dataset.slotRole === "material";
    });

    expect(woodSlot?.dataset.iconKind).toBe("image");
    expect(woodSlot?.dataset.itemId).toBe("wood");
    expect(woodSlot?.querySelector(".inventory-slot__image")?.getAttribute("src")).toContain("Objects/wood.png");
  });

  it("queues pickup fly animations only for visible supplies slots", () => {
    const inventoryGridElement = document.createElement("div");
    document.body.appendChild(inventoryGridElement);
    const controller = createGameHudController({
      inventoryGridElement,
      inventoryOrder: ["waterGunTotem", "wood"],
      itemDefs: {
        waterGunTotem: {
          shortLabel: "Totem",
          glyph: "T",
          color: "#65c7ff",
          ink: "#081f33",
          slotRole: "key"
        },
        wood: {
          shortLabel: "Wood",
          glyph: "W",
          color: "#8c5a34",
          ink: "#fff1e8",
          slotRole: "material"
        }
      }
    });

    controller.syncInventoryUi({
      waterGunTotem: 1,
      wood: 2
    });

    expect(controller.queueSupplyPickupFlyToSlot({
      itemId: "waterGunTotem",
      origin: { x: 12, y: 18 }
    })).toBe(false);
    expect(controller.queueSupplyPickupFlyToSlot({
      itemId: "wood",
      origin: { x: 12, y: 18 }
    })).toBe(true);

    const flyElement = document.body.querySelector(".supply-pickup-fly");
    expect(flyElement?.dataset.itemId).toBe("wood");
    expect(document.body.querySelector(".supply-pickup-fly-layer")).not.toBeNull();
    expect(inventoryGridElement.querySelector(".inventory-slot[data-item-id='wood']")).not.toBeNull();
  });

  it("starts pickup fly feedback at the collected item screen origin before flying to the supply slot", () => {
    const inventoryGridElement = document.createElement("div");
    document.body.appendChild(inventoryGridElement);
    const controller = createGameHudController({
      inventoryGridElement,
      inventoryOrder: ["scrap"],
      itemDefs: {
        scrap: {
          shortLabel: "Scrap",
          glyph: "S",
          color: "#8c5a34",
          ink: "#fff1e8",
          slotRole: "material"
        }
      }
    });
    let rafCalls = 0;
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      rafCalls += 1;
      if (rafCalls === 1) {
        callback(1000);
      }
      return rafCalls;
    });
    vi.spyOn(window.performance, "now").mockReturnValue(1000);
    Object.defineProperty(window, "innerWidth", { value: 800, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 600, configurable: true });

    controller.syncInventoryUi({ scrap: 1 });

    const scrapSlot = inventoryGridElement.querySelector(".inventory-slot[data-item-id='scrap']");
    scrapSlot.getBoundingClientRect = () => ({
      left: 24,
      top: 520,
      width: 52,
      height: 52,
      right: 76,
      bottom: 572
    });

    expect(controller.queueSupplyPickupFlyToSlot({
      itemId: "scrap",
      origin: { x: 12, y: 18 }
    })).toBe(true);

    const flyElement = document.body.querySelector(".supply-pickup-fly");
    const styleElement = [...document.head.querySelectorAll("style")]
      .find((style) => style.textContent.includes("supplyPickupSlotPulse"));

    expect(flyElement?.style.transform).toContain("translate(12px, 18px)");
    expect(flyElement?.style.transform).toContain("scale(1)");
    expect(flyElement?.textContent).toContain("S");
    expect(styleElement?.textContent).toContain("scale(1.48)");
    expect(styleElement?.textContent).toContain("brightness(1.7)");

    rafSpy.mockRestore();
  });

  it("does not queue pickup fly feedback without a collected item screen origin", () => {
    const inventoryGridElement = document.createElement("div");
    document.body.appendChild(inventoryGridElement);
    const controller = createGameHudController({
      inventoryGridElement,
      inventoryOrder: ["scrap"],
      itemDefs: {
        scrap: {
          shortLabel: "Scrap",
          glyph: "S",
          color: "#8c5a34",
          ink: "#fff1e8",
          slotRole: "material"
        }
      }
    });

    controller.syncInventoryUi({ scrap: 1 });

    expect(controller.queueSupplyPickupFlyToSlot({ itemId: "scrap" })).toBe(false);
    expect(document.body.querySelector(".supply-pickup-fly")).toBeNull();
  });

  it("keeps companion move information out of the persistent supplies HUD", () => {
    const uiLayerElement = document.createElement("div");
    const inventoryPanelElement = document.createElement("div");
    inventoryPanelElement.className = "inventory";
    const inventoryTitleElement = document.createElement("strong");
    inventoryTitleElement.textContent = "Supplies";
    const inventoryGridElement = document.createElement("div");
    inventoryPanelElement.append(inventoryTitleElement, inventoryGridElement);
    uiLayerElement.append(inventoryPanelElement);
    const skillsPanelElement = document.createElement("div");
    const skillsGridElement = document.createElement("div");
    const hudInstructionsElement = document.createElement("span");
    const controller = createGameHudController({
      hudInstructionsElement,
      inventoryGridElement,
      skillsPanelElement,
      skillsGridElement,
      questSystem: {
        getActiveQuest: () => ({
          id: "makingHabitats",
          guidance: "Restore one nearby patch."
        })
      },
      playerSkillOrder: ["waterGun", "leafage", "fire"],
      playerSkillDefs: {
        waterGun: {
          shortLabel: "Water",
          glyph: "W",
          color: "#65c7ff",
          ink: "#081f33"
        },
        leafage: {
          shortLabel: "Leaf",
          glyph: "L",
          color: "#7ed36d",
          ink: "#0b2610"
        },
        fire: {
          shortLabel: "Heat",
          glyph: "H",
          color: "#ff9d33",
          ink: "#2a1000"
        }
      }
    });
    const unlockedSkills = { waterGun: true, leafage: true, fire: true };

    controller.syncSkillsUi(unlockedSkills, "waterGun", {
      flags: {}
    });

    const companionHudElement = uiLayerElement.querySelector(".active-companion-hud");
    expect(inventoryPanelElement.querySelector("strong")).toBeNull();
    expect(inventoryPanelElement.querySelector(".inventory-header")).toBeNull();
    expect(inventoryPanelElement.querySelector(".active-companion-hud")).toBeNull();
    expect(companionHudElement?.parentElement).toBe(uiLayerElement);
    expect(companionHudElement?.hidden).toBe(false);
    expect(companionHudElement?.dataset.companionId).toBe("squirtle");
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__portrait-image")
        ?.getAttribute("src")
    ).toContain("Robot-1-thumb.png");
    expect(companionHudElement?.querySelectorAll(".active-companion-hud__portrait-image")).toHaveLength(3);
    expect(companionHudElement?.querySelectorAll(".active-companion-hud__portrait[data-carousel-slot='active']")).toHaveLength(1);
    expect(companionHudElement?.querySelectorAll(".active-companion-hud__portrait[data-carousel-slot='previous']")).toHaveLength(1);
    expect(companionHudElement?.querySelectorAll(".active-companion-hud__portrait[data-carousel-slot='next']")).toHaveLength(1);
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__portrait[data-carousel-slot='previous'] .active-companion-hud__portrait-image")
        ?.getAttribute("src")
    ).toContain("Robot-3-thumb.png");
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__portrait[data-carousel-slot='next'] .active-companion-hud__portrait-image")
        ?.getAttribute("src")
    ).toContain("Robot-2-thumb.png");
    expect(companionHudElement?.querySelector(".active-companion-hud__switch-button")).toBeNull();
    expect(companionHudElement?.querySelector(".active-companion-hud__switch-icon")).toBeNull();
    expect(companionHudElement?.textContent).toContain("Water");
    expect(companionHudElement?.textContent).toContain("Hydro Bot");
    expect(companionHudElement?.getAttribute("aria-label")).toContain("Hydro Bot: Hydro Jet selected");
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__hint-image")
        ?.getAttribute("alt")
    ).toContain("mark dry ground");

    controller.syncHudInstructions({
      flags: {
        firstGrassRestored: true
      }
    });

    expect(companionHudElement?.textContent).not.toContain("Hydro Bot will move over and restore it");
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__hint-image")
        ?.getAttribute("src")
    ).toContain("Lt-thumb.png");

    controller.syncSkillsUi(unlockedSkills, "leafage", {
      flags: {}
    });

    expect(companionHudElement?.hidden).toBe(false);
    expect(companionHudElement?.dataset.companionId).toBe("bulbasaur");
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__portrait-image")
        ?.getAttribute("src")
    ).toContain("Robot-2-thumb.png");
    expect(companionHudElement?.querySelectorAll(".active-companion-hud__portrait-image")).toHaveLength(3);
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__portrait[data-carousel-slot='previous'] .active-companion-hud__portrait-image")
        ?.getAttribute("src")
    ).toContain("Robot-1-thumb.png");
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__portrait[data-carousel-slot='next'] .active-companion-hud__portrait-image")
        ?.getAttribute("src")
    ).toContain("Robot-3-thumb.png");
    expect(companionHudElement?.textContent).toContain("Leaf");
    expect(companionHudElement?.textContent).toContain("Grow Bot");
    expect(
      companionHudElement
        ?.querySelector(".active-companion-hud__hint-image")
        ?.getAttribute("alt")
    ).toContain("restored ground");

    controller.syncSkillsUi({ waterGun: true, leafage: false }, "leafage");

    expect(companionHudElement?.hidden).toBe(true);
  });

  it("flashes completed tracked tasks for 3 seconds before removing them from the HUD stack", () => {
    const missionsStackElement = document.createElement("div");
    const hudChecklistElement = document.createElement("div");
    const hudContextElement = document.createElement("div");
    const activeQuest = {
      id: "water-dry-grass",
      status: "active",
      title: "Gather first supplies",
      description: "Collect simple wood so Chopper can test your field rhythm.",
      guidance: "Water dry tall grass.",
      objectives: []
    };
    const nowSpy = vi.spyOn(performance, "now").mockReturnValue(1000);
    const controller = createGameHudController({
      missionsStackElement,
      hudChecklistElement,
      hudContextElement,
      questSystem: {
        getActiveQuest: () => activeQuest,
        getQuestLog: () => [activeQuest]
      }
    });
    const storyState = {
      flags: {
        trackedTaskIds: ["making-habitats"]
      }
    };

    controller.renderMissionCards(storyState, {}, "");
    controller.syncQuestFocus(storyState);

    expect(missionsStackElement.innerHTML).toContain('data-task-id="making-habitats"');
    expect(hudChecklistElement.innerHTML).toContain("Making colony zones");
    expect(controller.getNoticeMessage()).toBe("");

    storyState.flags.makingHabitatsComplete = true;
    nowSpy.mockReturnValue(1500);
    controller.renderMissionCards(storyState, {}, "");
    controller.syncQuestFocus(storyState);

    expect(missionsStackElement.innerHTML).toContain('data-task-flashing="true"');
    expect(hudChecklistElement.innerHTML).toContain('data-task-flashing="true"');
    expect(hudChecklistElement.innerHTML).toContain("Making colony zones");
    expect(controller.getNoticeMessage()).toBe("Task complete: Making colony zones.");

    nowSpy.mockReturnValue(4601);
    controller.renderMissionCards(storyState, {}, "");
    controller.syncQuestFocus(storyState);

    expect(missionsStackElement.innerHTML).not.toContain('data-task-id="making-habitats"');
    expect(hudChecklistElement.innerHTML).not.toContain("Making colony zones");
    expect(controller.getNoticeMessage()).toBe("Task complete: Making colony zones.");
  });

  it("queues rapid notices instead of overwriting current feedback", () => {
    const controller = createGameHudController({});

    controller.pushNotice("+1 Wood", 1);
    controller.pushNotice("New Workbench protocol available: Power.", 1);

    expect(controller.getNoticeMessage()).toBe("+1 Wood");

    controller.updateTransientNotice(1);

    expect(controller.getNoticeMessage()).toBe("New Workbench protocol available: Power.");
  });
});
