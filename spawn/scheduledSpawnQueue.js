function compareEvents(left, right) {
  return left.executeAt - right.executeAt || left.sequence - right.sequence;
}

export function createScheduledSpawnQueue() {
  const heap = [];
  let nextSequence = 0;

  const swap = (leftIndex, rightIndex) => {
    [heap[leftIndex], heap[rightIndex]] = [heap[rightIndex], heap[leftIndex]];
  };

  const bubbleUp = (startIndex) => {
    let index = startIndex;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (compareEvents(heap[parentIndex], heap[index]) <= 0) {
        return;
      }

      swap(parentIndex, index);
      index = parentIndex;
    }
  };

  const bubbleDown = (startIndex) => {
    let index = startIndex;

    while (true) {
      const leftIndex = index * 2 + 1;
      const rightIndex = leftIndex + 1;
      let earliestIndex = index;

      if (
        leftIndex < heap.length &&
        compareEvents(heap[leftIndex], heap[earliestIndex]) < 0
      ) {
        earliestIndex = leftIndex;
      }

      if (
        rightIndex < heap.length &&
        compareEvents(heap[rightIndex], heap[earliestIndex]) < 0
      ) {
        earliestIndex = rightIndex;
      }

      if (earliestIndex === index) {
        return;
      }

      swap(index, earliestIndex);
      index = earliestIndex;
    }
  };

  return Object.freeze({
    get size() {
      return heap.length;
    },
    clear() {
      heap.length = 0;
    },
    peek() {
      return heap[0] || null;
    },
    enqueue({ executeAt, channel, designPriority, attentionCost }) {
      if (!Number.isFinite(executeAt) || executeAt < 0) {
        throw new Error("Evento de spawn precisa de executeAt valido.");
      }

      const normalizedChannel = String(channel || "").trim();
      if (!normalizedChannel) {
        throw new Error("Evento de spawn precisa de channel.");
      }

      if (!Number.isFinite(designPriority)) {
        throw new Error("Evento de spawn precisa de designPriority valida.");
      }

      if (!Number.isFinite(attentionCost) || attentionCost <= 0) {
        throw new Error("Evento de spawn precisa de attentionCost positivo.");
      }

      const event = Object.freeze({
        executeAt,
        channel: normalizedChannel,
        designPriority,
        attentionCost,
        sequence: nextSequence
      });
      nextSequence += 1;
      heap.push(event);
      bubbleUp(heap.length - 1);

      return event;
    },
    dequeue() {
      if (heap.length === 0) {
        return null;
      }

      const earliest = heap[0];
      const last = heap.pop();

      if (heap.length > 0) {
        heap[0] = last;
        bubbleDown(0);
      }

      return earliest;
    }
  });
}
