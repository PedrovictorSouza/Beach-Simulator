export function createWorldCellPlannerClickRuntime() {
  let pendingClick = null;

  function queue({ clientX, clientY } = {}) {
    pendingClick = {
      clientX,
      clientY
    };
  }

  function consume() {
    const click = pendingClick;
    pendingClick = null;
    return click;
  }

  return {
    consume,
    queue
  };
}
