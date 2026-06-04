import { describe, expect, it } from "vitest";

import {
  getLeppaTreeMusicNoteBillboards,
  updateLeppaTreeMusicNotes
} from "../app/runtime/leppaTreeMusicNotes.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));

describe("leppa tree music notes", () => {
  it("starts the revived tree music notes with the existing burst count", () => {
    const leppaTree = {
      revived: true,
      position: [1, 0.02, -2]
    };

    updateLeppaTreeMusicNotes({
      leppaTree,
      textures: ["note-a", "note-b", "note-c"],
      deltaTime: 0.1,
      random: () => 0.5
    });

    expect(leppaTree.musicNotes.active).toBe(true);
    expect(leppaTree.musicNotes.nextIndex).toBe(3);
    expect(leppaTree.musicNotes.particles).toHaveLength(3);
    expect(leppaTree.musicNotes.particles[0]).toMatchObject({
      age: 0.1,
      textureIndex: 0
    });
  });

  it("resets particles when the tree cannot emit notes", () => {
    const leppaTree = {
      revived: false,
      position: [1, 0.02, -2],
      musicNotes: {
        active: true,
        emitTimer: 1,
        nextIndex: 4,
        particles: [{ age: 0 }]
      }
    };

    updateLeppaTreeMusicNotes({
      leppaTree,
      textures: ["note-a"],
      deltaTime: 0.1,
      random: () => 0.5
    });

    expect(leppaTree.musicNotes.active).toBe(false);
    expect(leppaTree.musicNotes.emitTimer).toBe(0);
    expect(leppaTree.musicNotes.particles).toEqual([]);
  });

  it("creates billboards from active note particles", () => {
    const uvRect = [0, 0, 1, 1];
    const billboards = getLeppaTreeMusicNoteBillboards({
      leppaTree: {
        revived: true,
        musicNotes: {
          particles: [{
            age: 0.5,
            duration: 2,
            textureIndex: 1,
            position: [1, 2, 3],
            size: 0.5,
            rotation: 0.2,
            phase: 0
          }]
        }
      },
      textures: ["note-a", "note-b"],
      uvRect,
      now: 0,
      clamp01
    });

    expect(billboards).toHaveLength(1);
    expect(billboards[0]).toMatchObject({
      texture: "note-b",
      position: [1, 2, 3.045],
      uvRect,
      alpha: 1,
      rotation: 0.2
    });
    expect(billboards[0].size[0]).toBeCloseTo(0.5275 * (97 / 227), 4);
    expect(billboards[0].size[1]).toBeCloseTo(0.5275, 4);
  });
});
