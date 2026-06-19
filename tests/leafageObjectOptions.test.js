import { describe, expect, it } from "vitest";
import { LEAFAGE_OBJECT_OPTIONS } from "../app/bootstrap/leafageObjectOptions.js";

describe("leafage object options", () => {
  it("keeps the selectable Leafage object ids and notices together", () => {
    expect(LEAFAGE_OBJECT_OPTIONS.map((option) => option.id)).toEqual([
      "tallGrass",
      "garden1",
      "flower",
      "nativeTree"
    ]);
    expect(LEAFAGE_OBJECT_OPTIONS.map((option) => option.label)).toEqual([
      "Tall Grass",
      "Garden-1",
      "Flower",
      "Native tree"
    ]);
    expect(LEAFAGE_OBJECT_OPTIONS[0].notice).toContain("will grow Tall Grass");
    expect(LEAFAGE_OBJECT_OPTIONS[3].notice).toContain("will grow a Native tree");
  });

  it("provides artwork URLs for every option", () => {
    expect(LEAFAGE_OBJECT_OPTIONS.every((option) => typeof option.artworkUrl === "string")).toBe(true);
    expect(LEAFAGE_OBJECT_OPTIONS.every((option) => option.artworkUrl.length > 0)).toBe(true);
    expect(LEAFAGE_OBJECT_OPTIONS.find((option) => option.id === "flower")?.artworkUrl)
      .toMatch(/^data:image\/svg\+xml/);
  });
});
