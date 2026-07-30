export function createNpcComplaintView({
  root,
  translator,
  onComplaint = () => {}
}) {
  if (!root) {
    throw new Error("NpcComplaintView precisa de um elemento root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("NpcComplaintView precisa de um translator.");
  }

  if (typeof onComplaint !== "function") {
    throw new Error("NpcComplaintView precisa de um callback de reclamacao valido.");
  }

  const documentRef = root.ownerDocument;
  const layerElement = documentRef.createElement("div");
  const elementsByNpcId = new Map();

  layerElement.className = "npc-complaints";
  layerElement.setAttribute("aria-live", "polite");
  root.append(layerElement);

  let currentComplaints = [];
  const resolveComplaintText = (complaint) => {
    const messageId = complaint?.messageId || complaint?.text;
    const translated = messageId ? translator.t(messageId) : "";

    return translated === messageId ? String(complaint?.text || "") : translated;
  };
  const renderComplaints = (complaints) => {
    const nextComplaints = Array.isArray(complaints) ? complaints : [];

    currentComplaints = nextComplaints;
    const visibleIds = new Set();

    for (const complaint of nextComplaints) {
        let entry = elementsByNpcId.get(complaint.id);
        const left = `${Math.round(complaint.x)}px`;
        const top = `${Math.round(complaint.y)}px`;

        if (!entry) {
          const element = documentRef.createElement("div");
          const textElement = documentRef.createElement("span");
          const needElement = documentRef.createElement("span");

          element.className = "npc-complaint";
          textElement.className = "npc-complaint__text";
          needElement.className = "npc-complaint__need";
          needElement.setAttribute("aria-hidden", "true");
          element.append(textElement, needElement);
          entry = { element, textElement, needElement, complaintKey: null };
          elementsByNpcId.set(complaint.id, entry);
          layerElement.append(element);
        }

        visibleIds.add(complaint.id);
        const complaintKey = String(complaint.messageId || complaint.text || "");
        const complaintText = resolveComplaintText(complaint);
        if (entry.complaintKey !== complaintKey) {
          entry.complaintKey = complaintKey;
          onComplaint(complaint);
        }
        if (entry.textElement.textContent !== complaintText) {
          entry.textElement.textContent = complaintText;
        }
        if (entry.element.style.left !== left) {
          entry.element.style.left = left;
        }
        if (entry.element.style.top !== top) {
          entry.element.style.top = top;
        }
        const needPercent = Math.min(
          100,
          Math.max(0, Number(complaint.needPercent) || 0)
        );
        entry.needElement.style.setProperty("--need-level", `${needPercent}%`);
        const needLabel = complaint.needMotive ?
          translator.t(`hud.bathers.needsByMotive.${complaint.needMotive}`) :
          translator.t("complaints.needLevel");
        entry.needElement.title = `${needLabel} ${Math.round(needPercent)}%`;
      }

    for (const [npcId, entry] of elementsByNpcId) {
      if (!visibleIds.has(npcId)) {
        entry.element.remove();
        elementsByNpcId.delete(npcId);
      }
    }
  };
  translator.subscribe(() => renderComplaints(currentComplaints));

  return Object.freeze({
    render(complaints) {
      renderComplaints(complaints);
    }
  });
}
