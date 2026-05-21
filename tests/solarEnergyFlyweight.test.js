import { describe, expect, it } from "vitest";
import { buildSceneAssembly } from "../app/session/buildSceneAssembly.js";

function createModel(id) {
  return {
    id,
    primitives: [],
    texture: null,
    offset: [0, 0, 0],
    scale: 1,
    size: [1, 1, 1]
  };
}

function createSession() {
  return {
    groundDeadInstances: [],
    groundPurifiedInstances: [],
    iceGroundInstances: [],
    resourceNodes: [],
    deadGrassInstances: [],
    elevatedTerrainColliders: [{
      id: "existing-mountain-collider",
      position: [0, 0, 0],
      size: [2, 2, 2],
      surfaceY: 2,
      blocksPlayer: true
    }],
    palmInstances: [],
    leafageGardenInstances: [],
    sceneObjects: []
  };
}

function createAssets() {
  return {
    groundDeadModel: createModel("ground-dead"),
    groundPurifiedModel: createModel("ground-purified"),
    groundPurifiedAltModel: createModel("ground-purified-alt"),
    houseModel: createModel("house"),
    greenhouseModel: createModel("greenhouse"),
    solarEnergyModel: createModel("solar-energy"),
    chopperBodyModel: createModel("chopper-body"),
    chopperPropellerModel: createModel("chopper-propeller"),
    characterFactory: {
      createCharacter: ({ id, position }) => ({ id, position })
    }
  };
}

describe("solar energy map flyweights", () => {
  it("spreads solar energy as one shared model with many map instances", () => {
    const session = createSession();
    const assets = createAssets();

    buildSceneAssembly(session, assets);

    const solarSceneObjects = session.sceneObjects.filter((sceneObject) => {
      return sceneObject.model === assets.solarEnergyModel;
    });
    const instanceIds = new Set(session.solarEnergyInstances.map((instance) => instance.id));

    expect(solarSceneObjects).toHaveLength(1);
    expect(solarSceneObjects[0].instances).toBe(session.solarEnergyInstances);
    expect(session.solarEnergyInstances.length).toBeGreaterThanOrEqual(12);
    expect(instanceIds.size).toBe(session.solarEnergyInstances.length);
    expect(session.solarEnergyInstances.every((instance) => instance.active === true)).toBe(true);
    expect(session.solarEnergyInstances.every((instance) => instance.offset[1] === 0.02)).toBe(true);
    expect(session.solarEnergyInstances.every((instance) => instance.scale >= 7.8)).toBe(true);
    expect(session.solarEnergyColliders).toHaveLength(session.solarEnergyInstances.length);
    expect(session.solarEnergyColliders.every((collider) => collider.blocksPlayer === true)).toBe(true);
    expect(session.solarEnergyColliders.every((collider) => collider.allowPlayerLanding === false)).toBe(true);
    expect(session.solarEnergyColliders.every((collider) => collider.visualOnly === false)).toBe(true);
    expect(session.solarEnergyColliders.every((collider) => collider.surfaceY >= 2.4)).toBe(true);
    expect(session.elevatedTerrainColliders).toHaveLength(session.solarEnergyInstances.length + 1);
    expect(session.elevatedTerrainColliders[0].id).toBe("existing-mountain-collider");
  });

  it("renders a placed Greenhouse as one model instance", () => {
    const session = createSession();
    const assets = createAssets();
    session.greenhouse = {
      id: "greenhouse-0",
      position: [4, 0.02, -3],
      size: [2.85, 1.7],
      uvRect: [0, 0, 1, 1]
    };

    buildSceneAssembly(session, assets);

    const greenhouseSceneObjects = session.sceneObjects.filter((sceneObject) => {
      return sceneObject.model === assets.greenhouseModel;
    });

    expect(greenhouseSceneObjects).toHaveLength(1);
    expect(greenhouseSceneObjects[0].instances).toEqual([session.greenhouseModelInstance]);
    expect(session.greenhouseModelInstance).toMatchObject({
      id: "greenhouse-model",
      offset: [4, 0.02, -3],
      active: true
    });
  });
});
