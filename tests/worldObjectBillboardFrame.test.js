import { describe, expect, it } from "vitest";

import { updateWorldObjectBillboardFrame } from "../app/runtime/presentation/worldObjectBillboardFrame.js";

function createNextFrame() {
  return {
    render: {
      genericBillboards: []
    }
  };
}

describe("world object billboard frame", () => {
  it("renders workbench particles, log chair preview, placed save point and mission indicators", () => {
    const nextFrame = createNextFrame();
    const session = {
      markerTextures: {
        workbench: "workbench-marker"
      },
      logChairTexture: "log-chair",
      logChairStarTexture: "star",
      natureRevivalSparkTexture: "spark",
      missionTargetIndicatorTexture: "mission",
      playerCharacter: {
        getPosition: () => [2, 0, 3]
      },
      logChair: {
        position: [4, 0, 5],
        size: [1, 1]
      }
    };

    updateWorldObjectBillboardFrame({
      session,
      nextFrame,
      storyState: {
        flags: {
          logChairReceived: true,
          logChairPlaced: true
        }
      },
      inventory: {
        logChair: 1
      },
      rendering: {
        fullUvRect: "uv"
      },
      now: 100,
      deltaTime: 0.16,
      canShowWorldSpaceUi: true,
      activeQuest: {
        id: "quest-a",
        objectives: [
          { targetId: "target-a", current: 0, required: 1 }
        ]
      },
      getMissionTargetPositionsById: (targetId) => targetId === "target-a" ? [[8, 0, 9]] : [],
      getLeafDenConstructionBillboards: () => [],
      getConstructionCloudBurstBillboards: () => []
    });

    expect(nextFrame.render.genericBillboards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          texture: "workbench-marker"
        }),
        expect.objectContaining({
          texture: "star"
        }),
        expect.objectContaining({
          texture: "mission"
        }),
        expect.objectContaining({
          texture: "log-chair",
          position: [4, 0, 5]
        })
      ])
    );
  });

  it("renders simple world object billboards from story flags", () => {
    const nextFrame = createNextFrame();
    const session = {
      strawBed: {
        position: [1, 0, 1],
        size: [1, 1]
      },
      strawBedTexture: "straw-bed",
      challengeBoulder: {
        texture: "boulder",
        position: [2, 0, 2],
        size: [2, 2]
      },
      billCameo: {
        visible: true,
        texture: "bill",
        position: [3, 0, 3],
        size: [1, 2]
      },
      actTwoRepairPlant: {
        fixed: false,
        position: [4, 0, 4],
        size: [1, 1]
      },
      repairPlantBrokenTexture: "repair-broken",
      repairPlantFixedTexture: "repair-fixed"
    };

    updateWorldObjectBillboardFrame({
      session,
      nextFrame,
      storyState: {
        flags: {
          strawBedPlacedInBulbasaurHabitat: true,
          boulderChallengeAvailable: true
        }
      },
      inventory: {},
      rendering: {
        fullUvRect: "uv"
      },
      now: 100,
      deltaTime: 0,
      canShowWorldSpaceUi: false,
      getLeafDenConstructionBillboards: () => [],
      getConstructionCloudBurstBillboards: () => []
    });

    expect(nextFrame.render.genericBillboards).toEqual([
      expect.objectContaining({ texture: "straw-bed", position: [1, 0, 1] }),
      expect.objectContaining({ texture: "boulder", position: [2, 0, 2] }),
      expect.objectContaining({ texture: "bill", position: [3, 0, 3] }),
      expect.objectContaining({ texture: "repair-broken", position: [4, 0, 4] })
    ]);
  });
});
