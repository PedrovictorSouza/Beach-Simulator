export function createTreeRevivalLeafBurstFrameRuntime({
  leafBurstRuntime,
  session,
  getStoryState,
  rendering
} = {}) {
  function queueForNewlyRevivedTrees(snapshot) {
    if (!snapshot) {
      return;
    }

    for (const palmInstance of session.palmInstances || []) {
      const wasAlive = snapshot.palmAliveById?.get(palmInstance?.id);
      if (!wasAlive && palmInstance?.alive && Array.isArray(palmInstance.offset)) {
        leafBurstRuntime.queue(palmInstance.offset, palmInstance.id);
      }
    }

    const leppaTreeRevived = Boolean(
      session.leppaTree?.revived ||
      getStoryState?.()?.flags?.leppaTreeRevived
    );
    if (
      !snapshot.leppaTreeRevived &&
      leppaTreeRevived &&
      Array.isArray(session.leppaTree?.position)
    ) {
      leafBurstRuntime.queue(
        session.leppaTree.position,
        session.leppaTree.id || "leppa-tree"
      );
    }
  }

  function update(deltaTime) {
    leafBurstRuntime.update(deltaTime);
  }

  function appendBillboards(nextFrame) {
    const texture =
      session.leavesTexture ||
      session.greenGrassTexture ||
      session.natureRevivalSparkTexture;

    leafBurstRuntime.appendBillboards({
      billboards: nextFrame.render.genericBillboards,
      texture,
      uvRect: rendering.fullUvRect
    });
  }

  return {
    appendBillboards,
    queueForNewlyRevivedTrees,
    update
  };
}
