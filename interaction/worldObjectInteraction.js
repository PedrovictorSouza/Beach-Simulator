const MIN_HIT_RADIUS_PX = 14;
const LOGICAL_STAGE_WIDTH = 480;
const LOGICAL_STAGE_HEIGHT = 272;
const SPRITE_HIT_PADDING_LOGICAL_PX = 8;

function projectPoint(point, matrix, viewport) {
  const [x, y, z] = point;
  const clipX = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
  const clipY = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
  const clipW = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];

  if (clipW <= 0) {
    return null;
  }

  return {
    x: (clipX / clipW * 0.5 + 0.5) * viewport.width,
    y: (0.5 - clipY / clipW * 0.5) * viewport.height
  };
}

function getProjectedInstance(instance, sceneObject, viewProjection, viewport) {
  const { model } = sceneObject;
  const instanceScale = Number(instance.scale) || 1;
  const center = sceneObject.screenSpaceSprite ?
    instance.offset :
    [
      instance.offset[0],
      instance.offset[1] + model.size[1] * instanceScale * 0.5,
      instance.offset[2]
    ];
  const centerScreen = projectPoint(center, viewProjection, viewport);

  if (!centerScreen) {
    return null;
  }

  if (sceneObject.screenSpaceSprite && Array.isArray(model.spriteSize)) {
    const stageScale = Math.min(
      viewport.width / LOGICAL_STAGE_WIDTH,
      viewport.height / LOGICAL_STAGE_HEIGHT
    );
    const spriteWidth = model.spriteSize[0] * instanceScale * stageScale;
    const spriteHeight = model.spriteSize[1] * instanceScale * stageScale;

    return {
      x: centerScreen.x,
      y: centerScreen.y - spriteHeight * 0.5,
      radius: Math.max(
        MIN_HIT_RADIUS_PX,
        Math.max(spriteWidth, spriteHeight) * 0.5 +
          SPRITE_HIT_PADDING_LOGICAL_PX * stageScale
      )
    };
  }

  const worldRadius = Math.max(model.size[0], model.size[2]) * instanceScale * 0.5;
  const radiusX = projectPoint(
    [center[0] + worldRadius, center[1], center[2]],
    viewProjection,
    viewport
  );
  const radiusY = projectPoint(
    [center[0], center[1] + worldRadius, center[2]],
    viewProjection,
    viewport
  );
  const projectedRadius = Math.max(
    radiusX ? Math.hypot(radiusX.x - centerScreen.x, radiusX.y - centerScreen.y) : 0,
    radiusY ? Math.hypot(radiusY.x - centerScreen.x, radiusY.y - centerScreen.y) : 0
  );

  return {
    ...centerScreen,
    radius: Math.max(MIN_HIT_RADIUS_PX, projectedRadius)
  };
}

export function findWorldObjectSelection({
  pointer,
  sceneObjects,
  viewProjection,
  viewport
}) {
  let selected = null;

  for (const sceneObject of sceneObjects) {
    for (const instance of sceneObject.instances) {
      const projected = getProjectedInstance(
        instance,
        sceneObject,
        viewProjection,
        viewport
      );

      if (!projected) {
        continue;
      }

      const distanceSquared = (
        (pointer.x - projected.x) ** 2 +
        (pointer.y - projected.y) ** 2
      );
      const normalizedDistance = distanceSquared / (projected.radius ** 2);

      if (normalizedDistance <= 1 && (
        !selected || normalizedDistance < selected.normalizedDistance
      )) {
        selected = {
          objectId: instance.id,
          objectType: instance.spawnableType,
          normalizedDistance
        };
      }
    }
  }

  return selected ? Object.freeze({
    objectId: selected.objectId,
    objectType: selected.objectType
  }) : null;
}
