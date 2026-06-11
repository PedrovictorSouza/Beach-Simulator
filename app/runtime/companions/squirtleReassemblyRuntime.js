const NOOP = () => {};

function defaultClamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function defaultEaseOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function defaultLerp(from, to, amount) {
  return from + (to - from) * amount;
}

function createPrimitiveModel(model, primitive) {
  return {
    ...model,
    primitives: [primitive]
  };
}

export function createSquirtleReassemblyRuntime({
  session = {},
  clamp01 = defaultClamp01,
  easeOutCubic = defaultEaseOutCubic,
  lerp = defaultLerp,
  partScale = 0.5,
  syncSquirtleModelInstance = NOOP
} = {}) {
  function getPartPose(index, progress) {
    const scatterProgress = easeOutCubic(progress);
    const angle = index * 1.78;
    const radius = 0.42 + (index % 4) * 0.14;
    const lifted = 0.04 + (index % 3) * 0.035;
    const startX = Math.cos(angle) * radius;
    const startZ = Math.sin(angle) * radius;

    return {
      offset: [
        lerp(startX, 0, scatterProgress),
        lerp(lifted, 0, scatterProgress),
        lerp(startZ, 0, scatterProgress)
      ],
      yaw: lerp(((index % 5) - 2) * 0.62, 0, scatterProgress),
      pitch: lerp(((index % 3) - 1) * 0.42, 0, scatterProgress),
      roll: lerp(((index % 4) - 1.5) * 0.54, 0, scatterProgress)
    };
  }

  function update(deltaTime) {
    const squirtle = session.actTwoSquirtle;
    const reassembly = squirtle?.reassembly;

    if (!reassembly?.active) {
      return;
    }

    const duration = Math.max(0.01, reassembly.duration || 1.25);
    reassembly.elapsed = Math.min(duration, (reassembly.elapsed || 0) + deltaTime);
    reassembly.progress = clamp01(reassembly.elapsed / duration);

    if (reassembly.progress < 1) {
      return;
    }

    const onComplete = reassembly.onComplete;
    reassembly.active = false;
    reassembly.onComplete = null;
    squirtle.visible = true;
    squirtle.assemblyState = "assembled";
    syncSquirtleModelInstance();

    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  function getSceneObjects(sceneObjects, squirtle = session.actTwoSquirtle) {
    if (
      !squirtle?.visible ||
      squirtle.assemblyState === "hidden" ||
      squirtle.assemblyState === "assembled" ||
      !squirtle.model?.primitives?.length
    ) {
      return sceneObjects;
    }

    const progress = squirtle.reassembly?.active ?
      clamp01(squirtle.reassembly.progress || 0) :
      0;
    const origin = squirtle.position || squirtle.modelInstance?.offset || [0, 0, 0];
    const partObjects = squirtle.model.primitives.map((primitive, index) => {
      const pose = getPartPose(index, progress);
      return {
        model: createPrimitiveModel(squirtle.model, primitive),
        brightness: 1,
        instances: [{
          offset: [
            origin[0] + pose.offset[0],
            (origin[1] || 0) + pose.offset[1],
            origin[2] + pose.offset[2]
          ],
          scale: partScale,
          yaw: pose.yaw,
          pitch: pose.pitch,
          roll: pose.roll,
          active: true
        }]
      };
    });

    return [...sceneObjects, ...partObjects];
  }

  return {
    getPartPose,
    getSceneObjects,
    update
  };
}
