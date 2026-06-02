export function createMovementQuestRuntime({
  minimumMovementDistance,
  reportDistance
}) {
  let reported = false;
  let distance = 0;

  function update({
    active,
    movedDistance,
    reportMovement
  } = {}) {
    if (
      reported ||
      !active ||
      !(movedDistance > minimumMovementDistance)
    ) {
      return false;
    }

    distance += movedDistance;
    if (distance < reportDistance) {
      return false;
    }

    const result = reportMovement?.();
    reported = Boolean(
      result?.changed ||
      result?.completedQuestIds?.length
    );
    return reported;
  }

  return {
    update
  };
}
