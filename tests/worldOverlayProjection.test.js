import test from "node:test";
import assert from "node:assert/strict";

import {
  getWorldObjectScreenPosition,
  WORLD_OVERLAY_ANCHORS
} from "../interaction/worldObjectInteraction.js";

const IDENTITY_MATRIX = Object.freeze([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]);

test("diálogo do NPC pode usar os pés como âncora sem alterar a projeção padrão", () => {
  const sceneObjects = [{
    model: { size: [2, 4, 2] },
    instances: [{ id: "bather-1", offset: [0, 0, 0], scale: 1 }]
  }];
  const projection = {
    objectId: "bather-1",
    sceneObjects,
    viewProjection: IDENTITY_MATRIX,
    viewport: { width: 100, height: 100 }
  };

  assert.deepEqual(getWorldObjectScreenPosition(projection), {
    x: 50,
    y: -50
  });
  assert.deepEqual(getWorldObjectScreenPosition({
    ...projection,
    anchor: WORLD_OVERLAY_ANCHORS.ORIGIN
  }), {
    x: 50,
    y: 50
  });
});
