// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createWorkbenchModalController } from "../app/ui/workbenchModalController.js";
import {
  getWorkbenchRecipePresentation,
  listWorkbenchRecipePresentations,
  WORKBENCH_REQUIREMENT_PRESENTATION
} from "../app/ui/workbenchRecipePresentationContract.js";

function createController() {
  const mount = document.createElement("div");
  const controller = createWorkbenchModalController({
    mount,
    inventory: { gear: 20, wood: 3 },
    getItemLabel: (itemId) => ({
      gear: "Gear",
      wood: "Wood",
      leaves: "Leaves"
    }[itemId] || "Thermal Cabin"),
    formatRequirementSummary: () => "10 Gear",
    clearGameFlowInput: vi.fn()
  });

  return { controller, mount };
}

describe("createWorkbenchModalController", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses a stable presentation contract for Workbench recipes", () => {
    expect(listWorkbenchRecipePresentations().map((presentation) => presentation.recipeId)).toEqual([
      "greenhouse",
      "campfire",
      "strawBed",
      "leafDenKit"
    ]);
    expect(getWorkbenchRecipePresentation("greenhouse")).toMatchObject({
      recipeId: "greenhouse",
      protocol: {
        label: "Soil Plans",
        purpose: "Marks the first greenhouse restoration footprint."
      }
    });
    expect(getWorkbenchRecipePresentation("campfire").artworkUrl).toContain("train-house.gif");
    expect(getWorkbenchRecipePresentation("strawBed").artworkUrl).toContain("Solar-Station.gif");
    expect(getWorkbenchRecipePresentation("leafDenKit").artworkUrl).toContain("house_2.png");
    expect(WORKBENCH_REQUIREMENT_PRESENTATION.iconUrl).toContain("gear.png");
    expect(getWorkbenchRecipePresentation("missing")).toMatchObject({
      protocol: {
        label: "Colony Plans"
      },
      artworkUrl: ""
    });
  });

  it("does not leave the dark modal layer visible after crafting closes it", () => {
    const { controller, mount } = createController();

    controller.open({
      recipes: [
        {
          recipe: {
            id: "campfire",
            title: "Thermal Cabin",
            ingredients: { gear: 10 }
          },
          disabled: true,
          status: "Created",
          onConfirm: () => true
        }
      ]
    });

    const modal = mount.querySelector(".workbench-modal");
    const panel = mount.querySelector(".workbench-modal__panel");
    const header = mount.querySelector(".workbench-modal__header");
    const titleImage = mount.querySelector(".workbench-modal__title");
    const recipeGrid = mount.querySelector(".workbench-modal__recipe-grid");
    const recipeButton = mount.querySelector(".workbench-modal__recipe");
    const recipeArt = mount.querySelector(".workbench-modal__recipe-art");
    const recipeDetails = mount.querySelector(".workbench-modal__recipe-details");
    const requirement = recipeDetails?.querySelector(".workbench-modal__recipe-requirement");

    expect(modal?.hidden).toBe(false);
    expect(modal?.style.display).toBe("grid");
    expect(modal?.style.height).toBe("100vh");
    expect(panel?.style.position).toBe("relative");
    expect(panel?.style.width).toBe("96%");
    expect(panel?.style.maxWidth).toBe("1180px");
    expect(panel?.style.padding).toBe("24px 28px 26px");
    expect(panel?.style.border).toContain("rgba(255, 255, 255, 0.34)");
    expect(panel?.style.boxShadow).toBe("none");
    expect(panel?.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(panel?.style.backgroundImage).toBe("");
    expect(panel?.style.backgroundSize).toBe("cover");
    expect(recipeDetails?.style.backgroundColor).toBe("transparent");
    expect(recipeDetails?.style.backgroundImage).toContain("dialogue-box.png");
    expect(recipeDetails?.style.backgroundSize).toBe("100% 100%");
    expect(recipeDetails?.style.imageRendering).toBe("pixelated");
    expect(recipeDetails?.style.border).toBe("0px");
    expect(recipeDetails?.style.borderImage).toBe("none");
    expect(recipeDetails?.style.color).toBe("");
    expect(titleImage?.tagName).toBe("IMG");
    expect(titleImage?.getAttribute("src")).toContain("workbench-title.png");
    expect(titleImage?.getAttribute("alt")).toBe("Workbench");
    expect(titleImage?.style.width).toBe("500px");
    expect(titleImage?.style.height).toBe("100px");
    expect(header?.style.flexDirection).toBe("column");
    expect(header?.style.justifyContent).toBe("center");
    expect(header?.textContent).toContain("Left/Right Select");
    expect(mount.querySelector(".workbench-modal__hint")?.textContent).not.toContain("Left/Right Select");
    expect(recipeGrid?.style.gap).toBe("10px");
    expect(recipeGrid?.style.minHeight).toBe("220px");
    expect(recipeButton?.style.minHeight).toContain("clamp(220px");
    expect(recipeButton?.style.border).toContain("rgba(255, 255, 255");
    expect(recipeButton?.style.backgroundImage).toBe("none");
    expect(recipeArt?.style.backgroundImage).toContain("train-house.gif");
    expect(recipeButton?.dataset.uiSelectionFrame).toBe("true");
    expect(recipeButton?.querySelector(".workbench-modal__recipe-selected-frame")).toBeNull();
    expect(recipeButton?.querySelector(".workbench-modal__recipe-wash")).toBeNull();
    expect(recipeButton?.querySelector(".workbench-modal__recipe-overlay")).toBeNull();
    expect(recipeButton?.querySelector(".workbench-modal__recipe-bar")).toBeNull();
    expect(recipeButton?.querySelector(".workbench-modal__recipe-scan")).toBeNull();
    expect(recipeButton?.style.backgroundImage).not.toContain("linear-gradient");
    expect(recipeButton?.style.opacity).toBe("1");
    expect(mount.querySelector(".workbench-modal__recipe-thumbnail")).toBeNull();
    expect(mount.querySelector(".workbench-modal__recipe-icon img")).toBeNull();
    expect(recipeButton?.firstElementChild).toBe(recipeArt);
    expect(mount.querySelector(".workbench-modal__recipe-tab")).toBeNull();
    expect(recipeButton?.querySelector(".workbench-modal__recipe-copy")?.textContent).toBe("Thermal Cabin");
    expect(recipeButton?.querySelector(".workbench-modal__recipe-card-name")?.style.color).toBe("rgb(0, 0, 0)");
    expect(recipeButton?.querySelector(".workbench-modal__recipe-protocol")).toBeNull();
    expect(recipeButton?.querySelector(".workbench-modal__recipe-status")).toBeNull();
    expect(recipeGrid?.nextElementSibling).toBe(recipeDetails);
    expect(recipeDetails?.style.margin).toBe("18px 0px 0px");
    expect(recipeDetails?.querySelector(".workbench-modal__recipe-protocol")).toBeNull();
    expect(recipeDetails?.querySelector(".workbench-modal__recipe-purpose")).toBeNull();
    expect(recipeDetails?.querySelector(".workbench-modal__recipe-guidance")?.textContent).toContain("Already prepared");
    const recipeCopyChildren = recipeDetails?.querySelectorAll(":scope > span") || [];
    expect([...recipeCopyChildren].map((child) => child.style.color)).toEqual([
      "rgb(255, 255, 255)",
      "rgb(0, 255, 157)"
    ]);
    expect(requirement?.tagName).toBe("DIV");
    expect(requirement?.style.display).toBe("flex");
    expect(requirement?.querySelector(".workbench-modal__recipe-requirement-icon")?.tagName).toBe("IMG");
    expect(requirement?.querySelector(".workbench-modal__recipe-requirement-icon")?.getAttribute("src")).toContain("gear.png");
    expect(requirement?.querySelector(".workbench-modal__recipe-requirement-icon")?.style.width).toBe("100px");
    expect(requirement?.querySelector(".workbench-modal__recipe-requirement-icon")?.style.height).toBe("100px");
    expect(requirement?.querySelector(".workbench-modal__recipe-requirement-copy")?.textContent).toBe("Created");
    expect(requirement?.querySelector(".workbench-modal__recipe-requirement-copy")?.style.fontFamily).toContain("Super Mario World");
    expect(requirement?.querySelector(".workbench-modal__recipe-requirement-copy")?.style.fontSize).toBe("34px");
    expect(requirement?.textContent).toBe("Created");
    expect(requirement?.style.color).toBe("rgb(0, 255, 157)");
    expect(requirement?.style.fontSize).toBe("28px");
    const actions = mount.querySelector(".workbench-modal__actions");
    const buildButton = mount.querySelector(".workbench-modal__hint");
    const closeButton = mount.querySelector(".workbench-modal__hint-close");
    expect(actions?.style.display).toBe("flex");
    expect(actions?.children[0]).toBe(buildButton);
    expect(actions?.children[1]).toBe(closeButton);
    expect(buildButton?.tagName).toBe("BUTTON");
    expect(buildButton?.disabled).toBe(true);
    expect(buildButton?.style.fontFamily).toContain("Super Mario World");
    expect(buildButton?.style.font).toBe("");
    expect(mount.querySelector(".workbench-modal__hint-action")?.textContent).toBe("LOCKED");
    expect(mount.querySelector(".workbench-modal__hint-action")?.style.fontFamily).toContain("Super Mario World");
    expect(closeButton?.tagName).toBe("BUTTON");
    expect(closeButton?.getAttribute("type")).toBe("button");
    expect(closeButton?.getAttribute("aria-label")).toBe("Close Workbench");
    expect(closeButton?.textContent).toBe("B / Esc Close");
    expect(buildButton?.textContent).not.toContain("B / Esc Close");
    expect(buildButton?.style.backgroundImage).toContain("btn.png");
    expect(closeButton?.style.backgroundImage).toContain("btn.png");
    expect(closeButton?.style.backgroundColor).toBe("rgb(233, 30, 99)");
    expect(closeButton?.style.color).toBe("rgb(255, 255, 255)");
    expect(closeButton?.style.position).toBe("");
    expect(closeButton?.style.animation).toBe("");

    closeButton?.click();

    expect(controller.isOpen()).toBe(false);
    expect(modal?.hidden).toBe(true);
    expect(modal?.style.display).toBe("none");
  });

  it("shows the construction recipes and crafts the selected solar station recipe", () => {
    vi.useFakeTimers();
    const { controller, mount } = createController();
    const craftGreenhouse = vi.fn(() => true);
    const craftCampfire = vi.fn(() => true);
    const craftStrawBed = vi.fn(() => true);
    const craftHouse = vi.fn(() => true);

    controller.open({
      recipes: [
        {
          recipe: {
            id: "greenhouse",
            title: "Greenhouse",
            ingredients: { gear: 5 }
          },
          guidance: "Greenhouse creates green soil in its footprint.",
          onConfirm: craftGreenhouse
        },
        {
          recipe: {
            id: "campfire",
            title: "Thermal Cabin",
            ingredients: { gear: 10 }
          },
          onConfirm: craftCampfire
        },
        {
          recipe: {
            id: "strawBed",
            title: "Solar Station",
            ingredients: { gear: 20 }
          },
          onConfirm: craftStrawBed
        },
        {
          recipe: {
            id: "leafDenKit",
            title: "House",
            ingredients: {}
          },
          onConfirm: craftHouse
        }
      ]
    });

    const recipeButtons = [...mount.querySelectorAll(".workbench-modal__recipe")];
    const recipeDetails = mount.querySelector(".workbench-modal__recipe-details");
    expect(recipeButtons).toHaveLength(4);
    expect(recipeDetails?.textContent).toContain("Greenhouse");
    expect(recipeDetails?.textContent).toContain("Gear 5/5");
    expect(recipeDetails?.textContent).not.toContain("Soil Plans");
    expect(recipeButtons[0].dataset.selected).toBe("true");
    expect(recipeButtons[0].dataset.uiSelectionFrame).toBe("true");
    expect(recipeButtons[0].style.opacity).toBe("1");
    expect(recipeButtons[0].getAttribute("aria-pressed")).toBe("true");
    expect(recipeButtons[0].getAttribute("aria-disabled")).toBe("false");
    expect(recipeButtons[0].getAttribute("aria-label")).toContain("Selected: Greenhouse");
    expect(recipeButtons[0].getAttribute("aria-label")).toContain("Soil Plans");
    expect(recipeButtons[0].getAttribute("aria-label")).toContain("Greenhouse creates green soil in its footprint.");
    expect(recipeDetails?.querySelector(".workbench-modal__recipe-guidance")?.textContent).toBe(
      "Greenhouse creates green soil in its footprint."
    );
    expect(recipeButtons[0].style.border).toContain("rgba(255, 255, 255");
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-copy")?.textContent).toBe("Greenhouse");
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-card-name")?.style.color).toBe("rgb(0, 0, 0)");
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-card-name")?.style.textAlign).toBe("center");
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-card-name")?.style.marginBottom).toBe("26px");
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-protocol")).toBeNull();
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-status")).toBeNull();
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-selected-frame")).toBeNull();
    expect(recipeButtons[1].dataset.selected).toBe("false");
    expect(recipeButtons[1].dataset.uiSelectionFrame).toBe("false");
    expect(recipeButtons[1].style.opacity).toBe("0.52");
    expect(recipeButtons[1].getAttribute("aria-pressed")).toBe("false");
    expect(recipeButtons[1].getAttribute("aria-label")).toContain("Power Plans");
    expect(recipeButtons[1].style.border).toContain("rgba(255, 255, 255");
    expect(recipeButtons[1].querySelector(".workbench-modal__recipe-copy")?.textContent).toBe("Thermal Cabin");
    expect(recipeButtons[1].querySelector(".workbench-modal__recipe-selected-frame")).toBeNull();
    expect(recipeButtons[0].style.backgroundImage).toBe("none");
    expect(recipeButtons[0].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("Estufa.gif");
    expect(recipeButtons[1].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("train-house.gif");
    expect(recipeButtons[2].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("Solar-Station.gif");
    expect(recipeButtons[3].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("house_2.png");
    expect(recipeButtons[2].querySelector(".workbench-modal__recipe-tab")).toBeNull();
    expect(mount.querySelector(".workbench-modal__hint")?.tagName).toBe("BUTTON");
    expect(mount.querySelector(".workbench-modal__hint-action")?.textContent).toBe("BUILD");

    controller.handleKeydown({
      code: "ArrowRight",
      preventDefault() {}
    });
    controller.handleKeydown({
      code: "ArrowRight",
      preventDefault() {}
    });

    const updatedRecipeButtons = [...mount.querySelectorAll(".workbench-modal__recipe")];
    const updatedRecipeDetails = mount.querySelector(".workbench-modal__recipe-details");
    expect(updatedRecipeButtons[0].dataset.selected).toBe("false");
    expect(updatedRecipeButtons[0].dataset.uiSelectionFrame).toBe("false");
    expect(updatedRecipeButtons[0].style.opacity).toBe("0.52");
    expect(updatedRecipeButtons[0].style.border).toContain("rgba(255, 255, 255");
    expect(updatedRecipeButtons[2].dataset.selected).toBe("true");
    expect(updatedRecipeButtons[2].dataset.uiSelectionFrame).toBe("true");
    expect(updatedRecipeButtons[2].style.opacity).toBe("1");
    expect(updatedRecipeButtons[2].style.border).toContain("rgba(255, 255, 255");
    expect(updatedRecipeButtons[2].querySelector(".workbench-modal__recipe-selected-frame")).toBeNull();
    expect(updatedRecipeDetails?.textContent).toContain("Solar Station");
    expect(updatedRecipeDetails?.textContent).toContain("Gear 20/20");
    expect(updatedRecipeDetails?.querySelector(".workbench-modal__recipe-guidance")?.textContent).toContain(
      "Prepare this kit here"
    );
    expect(updatedRecipeButtons[0].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("Estufa.gif");
    expect(updatedRecipeButtons[1].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("train-house.gif");
    expect(updatedRecipeButtons[2].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("Solar-Station.gif");
    expect(updatedRecipeButtons[3].querySelector(".workbench-modal__recipe-art")?.style.backgroundImage).toContain("house_2.png");

    controller.handleKeydown({
      code: "KeyX",
      preventDefault() {}
    });

    expect(craftGreenhouse).not.toHaveBeenCalled();
    expect(craftCampfire).not.toHaveBeenCalled();
    expect(craftStrawBed).toHaveBeenCalledTimes(1);
    expect(craftHouse).not.toHaveBeenCalled();
    expect(controller.isOpen()).toBe(true);
    expect(mount.querySelector(".workbench-modal__hint-action")?.textContent).toBe("BUILT");
    expect(mount.querySelector(".workbench-modal__recipe-guidance")?.textContent).toContain(
      "Built. Choose a site"
    );

    vi.advanceTimersByTime(620);

    expect(controller.isOpen()).toBe(false);
    vi.useRealTimers();
  });

  it("lets directional navigation select locked recipes and shows locked instead of build", () => {
    const { controller, mount } = createController();
    const craftGreenhouse = vi.fn(() => true);
    const craftSolarStation = vi.fn(() => true);

    controller.open({
      recipes: [
        {
          recipe: {
            id: "greenhouse",
            title: "Greenhouse",
            ingredients: { gear: 5 }
          },
          onConfirm: craftGreenhouse
        },
        {
          recipe: {
            id: "strawBed",
            title: "Solar Station",
            ingredients: { gear: 20 }
          },
          disabled: true,
          status: "Locked · Needs Gear 11/20",
          onConfirm: craftSolarStation
        }
      ]
    });

    expect(mount.querySelector(".workbench-modal__hint-action")?.textContent).toBe("BUILD");

    controller.handleKeydown({
      code: "ArrowRight",
      preventDefault() {}
    });

    const recipeButtons = [...mount.querySelectorAll(".workbench-modal__recipe")];
    expect(recipeButtons[0].dataset.selected).toBe("false");
    expect(recipeButtons[0].style.opacity).toBe("0.52");
    expect(recipeButtons[1].dataset.selected).toBe("true");
    expect(recipeButtons[1].style.opacity).toBe("1");
    expect(recipeButtons[1].getAttribute("aria-disabled")).toBe("true");
    expect(mount.querySelector(".workbench-modal__recipe-details")?.textContent).toContain("Solar Station");
    expect(mount.querySelector(".workbench-modal__hint")?.disabled).toBe(true);
    expect(mount.querySelector(".workbench-modal__hint-action")?.textContent).toBe("LOCKED");

    controller.handleKeydown({
      code: "Enter",
      preventDefault() {}
    });

    expect(craftGreenhouse).not.toHaveBeenCalled();
    expect(craftSolarStation).not.toHaveBeenCalled();

    controller.handleKeydown({
      code: "ArrowLeft",
      preventDefault() {}
    });

    const wrappedRecipeButtons = [...mount.querySelectorAll(".workbench-modal__recipe")];
    expect(wrappedRecipeButtons[0].dataset.selected).toBe("true");
    expect(wrappedRecipeButtons[0].style.opacity).toBe("1");
    expect(wrappedRecipeButtons[1].dataset.selected).toBe("false");
    expect(wrappedRecipeButtons[1].style.opacity).toBe("0.52");
    expect(mount.querySelector(".workbench-modal__hint")?.disabled).toBe(false);
    expect(mount.querySelector(".workbench-modal__hint-action")?.textContent).toBe("BUILD");
  });

  it("captures left and right arrow keys from the Workbench DOM", () => {
    const { controller, mount } = createController();

    controller.open({
      recipes: [
        {
          recipe: {
            id: "greenhouse",
            title: "Greenhouse",
            ingredients: { gear: 5 }
          },
          onConfirm: vi.fn(() => true)
        },
        {
          recipe: {
            id: "campfire",
            title: "Thermal Cabin",
            ingredients: { gear: 10 }
          },
          onConfirm: vi.fn(() => true)
        }
      ]
    });

    const modal = mount.querySelector(".workbench-modal");
    expect(modal?.tabIndex).toBe(-1);
    expect([...mount.querySelectorAll(".workbench-modal__recipe")][0]?.dataset.selected).toBe("true");

    const rightEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      code: "ArrowRight"
    });
    modal?.dispatchEvent(rightEvent);

    expect(rightEvent.defaultPrevented).toBe(true);
    expect([...mount.querySelectorAll(".workbench-modal__recipe")][0]?.dataset.selected).toBe("false");
    expect([...mount.querySelectorAll(".workbench-modal__recipe")][1]?.dataset.selected).toBe("true");

    const leftEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      code: "ArrowLeft"
    });
    modal?.dispatchEvent(leftEvent);

    expect(leftEvent.defaultPrevented).toBe(true);
    expect([...mount.querySelectorAll(".workbench-modal__recipe")][0]?.dataset.selected).toBe("true");
    expect([...mount.querySelectorAll(".workbench-modal__recipe")][1]?.dataset.selected).toBe("false");
  });

  it("can open with the current Workbench objective selected", () => {
    const { controller, mount } = createController();
    const craftGreenhouse = vi.fn(() => true);
    const craftCampfire = vi.fn(() => true);

    controller.open({
      initialRecipeId: "campfire",
      recipes: [
        {
          recipe: {
            id: "greenhouse",
            title: "Greenhouse",
            ingredients: { gear: 5 }
          },
          onConfirm: craftGreenhouse
        },
        {
          recipe: {
            id: "campfire",
            title: "Thermal Cabin",
            ingredients: { gear: 10 }
          },
          onConfirm: craftCampfire
        }
      ]
    });

    const recipeButtons = [...mount.querySelectorAll(".workbench-modal__recipe")];

    expect(recipeButtons[0].dataset.selected).toBe("false");
    expect(recipeButtons[1].dataset.selected).toBe("true");
    expect(recipeButtons[1].getAttribute("aria-label")).toContain("Selected: Thermal Cabin");
    expect(mount.querySelector(".workbench-modal__recipe-details")?.textContent).toContain("Gear 10/10");
    expect(mount.querySelector(".workbench-modal__hint-action")?.textContent).toBe("BUILD");
  });
});
