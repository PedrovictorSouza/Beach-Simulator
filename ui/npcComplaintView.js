export function createNpcComplaintView({ root }) {
  if (!root) {
    throw new Error("NpcComplaintView precisa de um elemento root.");
  }

  const documentRef = root.ownerDocument;
  const layerElement = documentRef.createElement("div");
  const elementsByNpcId = new Map();

  layerElement.className = "npc-complaints";
  layerElement.setAttribute("aria-live", "polite");
  root.append(layerElement);

  return Object.freeze({
    render(complaints) {
      const visibleIds = new Set();

      for (const complaint of complaints) {
        let element = elementsByNpcId.get(complaint.id);
        const left = `${Math.round(complaint.x)}px`;
        const top = `${Math.round(complaint.y)}px`;

        if (!element) {
          element = documentRef.createElement("div");
          element.className = "npc-complaint";
          elementsByNpcId.set(complaint.id, element);
          layerElement.append(element);
        }

        visibleIds.add(complaint.id);
        if (element.textContent !== complaint.text) {
          element.textContent = complaint.text;
        }
        if (element.style.left !== left) {
          element.style.left = left;
        }
        if (element.style.top !== top) {
          element.style.top = top;
        }
      }

      for (const [npcId, element] of elementsByNpcId) {
        if (!visibleIds.has(npcId)) {
          element.remove();
          elementsByNpcId.delete(npcId);
        }
      }
    }
  });
}
