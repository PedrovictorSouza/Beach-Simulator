function isRenderablePosition(position, renderCenter, prepareDistance, isWorldPositionWithinRenderDistance) {
  if (typeof isWorldPositionWithinRenderDistance !== "function") {
    return true;
  }

  return isWorldPositionWithinRenderDistance(position, renderCenter, prepareDistance);
}

export function getLeafResourceBillboards({
  resourceNodes,
  texture,
  uvRect,
  storyState,
  renderCenter = null,
  itemId,
  isResourceNodeActive = () => true,
  isWorldPositionWithinRenderDistance,
  prepareDistance,
  yOffset = 0,
  size
}) {
  if (!texture || !Array.isArray(resourceNodes)) {
    return [];
  }

  const isActive = typeof isResourceNodeActive === "function" ?
    isResourceNodeActive :
    () => true;

  return resourceNodes
    .filter((resourceNode) => (
      resourceNode?.itemId === itemId &&
      isActive(resourceNode, storyState) &&
      isRenderablePosition(
        resourceNode.position,
        renderCenter,
        prepareDistance,
        isWorldPositionWithinRenderDistance
      )
    ))
    .map((resourceNode) => ({
      texture,
      position: [
        resourceNode.position[0],
        resourceNode.position[1] + yOffset,
        resourceNode.position[2]
      ],
      size,
      uvRect
    }));
}

export function getLeafDropBillboards({
  fieldDrops,
  texture,
  uvRect,
  renderCenter = null,
  itemId,
  isWorldPositionWithinRenderDistance,
  prepareDistance
}) {
  if (!texture || !Array.isArray(fieldDrops)) {
    return [];
  }

  return fieldDrops
    .filter((drop) => (
      drop?.itemId === itemId &&
      !drop.collected &&
      isRenderablePosition(
        drop.position,
        renderCenter,
        prepareDistance,
        isWorldPositionWithinRenderDistance
      )
    ))
    .map((drop) => ({
      texture,
      position: drop.position,
      size: drop.size,
      uvRect: drop.uvRect || uvRect
    }));
}
