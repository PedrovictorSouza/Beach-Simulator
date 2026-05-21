// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { createLeafageObjectModalController } from "../app/ui/leafageObjectModalController.js";

describe("createLeafageObjectModalController", () => {
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
