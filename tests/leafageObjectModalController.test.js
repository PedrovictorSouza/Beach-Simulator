// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { createLeafageObjectModalController } from "../app/ui/leafageObjectModalController.js";

describe("createLeafageObjectModalController", () => {
  it("renders Bio-Grow with the Workbench-style modal structure", () => {
    const mount = document.createElement("div");
    const controller = createLeafageObjectModalController({
      mount,
      clearGameFlowInput: vi.fn()
    });

    controller.open({
      options: [
        {
          id: "tallGrass",
          label: "Tall Grass",
          notice: "Grow Bot will grow Tall Grass.",
          artworkUrl: "/tall-grass.png"
        }
      ],
      selectedId: "tallGrass",
      onSelect: vi.fn()
    });

    const panel = mount.querySelector(".leafage-object-modal__panel");
    const title = mount.querySelector(".leafage-object-modal__title");
    const selectHint = mount.querySelector(".leafage-object-modal__hint-select");
    const card = mount.querySelector(".leafage-object-modal__option");

    expect(panel?.style.maxWidth).toBe("1180px");
    expect(title?.textContent).toBe("Bio-Grow");
    expect(selectHint?.textContent).toBe("// Left/Right Select");
    expect(card?.dataset.uiSelectionFrame).toBe("true");
    expect(mount.querySelector(".leafage-object-modal__details")?.textContent).toContain("Tall Grass");
    expect(mount.querySelector(".leafage-object-modal__actions button")?.textContent).toBe("Choose");
  });

  it("confirms the Grow Bot object selector with keyboard E", () => {
    const mount = document.createElement("div");
    const onSelect = vi.fn();
    const controller = createLeafageObjectModalController({
      mount,
      clearGameFlowInput: vi.fn()
    });

    controller.open({
      options: [
        { id: "tallGrass", label: "Tall Grass", notice: "Tall Grass selected" }
      ],
      selectedId: "tallGrass",
      onSelect
    });

    expect(controller.isOpen()).toBe(true);
    expect(controller.handleKeydown(new KeyboardEvent("keydown", { code: "KeyE" }))).toBe(true);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "tallGrass" })
    );
    expect(controller.isOpen()).toBe(false);
  });
});
