export function createCleanupDecisionView({ root, translator } = {}) {
  if (!root) {
    throw new Error("CleanupDecisionView precisa de root.");
  }

  if (!translator || typeof translator.t !== "function") {
    throw new Error("CleanupDecisionView precisa de translator.");
  }

  const documentRef = root.ownerDocument;
  const overlayElement = documentRef.createElement("div");
  const dialogElement = documentRef.createElement("section");
  const titleElement = documentRef.createElement("h2");
  const summaryElement = documentRef.createElement("p");
  const optionsElement = documentRef.createElement("div");

  overlayElement.className = "cleanup-decision";
  overlayElement.hidden = true;
  dialogElement.className = "cleanup-decision__dialog";
  dialogElement.setAttribute("role", "dialog");
  dialogElement.setAttribute("aria-modal", "true");
  dialogElement.setAttribute("aria-labelledby", "cleanup-decision-title");
  titleElement.id = "cleanup-decision-title";
  titleElement.className = "cleanup-decision__title";
  summaryElement.className = "cleanup-decision__summary";
  optionsElement.className = "cleanup-decision__options";
  dialogElement.append(titleElement, summaryElement, optionsElement);
  overlayElement.append(dialogElement);
  overlayElement.addEventListener("keydown", (event) => event.stopPropagation());
  root.append(overlayElement);

  return Object.freeze({
    show({ plan, moneyInCents = 0 } = {}) {
      if (!plan || plan.visibleLitterCount <= 0) {
        return Promise.resolve("save");
      }

      if (!overlayElement.hidden) {
        throw new Error("Ja existe uma decisao de limpeza aberta.");
      }

      const canPay = moneyInCents >= plan.cleanupCostInCents;
      titleElement.textContent = translator.t("cleanup.title");
      summaryElement.textContent = translator.t("cleanup.summary", {
        condition: translator.t(`cleanup.conditions.${plan.conditionBand}`),
        count: translator.formatNumber(plan.visibleLitterCount)
      });
      const payButton = documentRef.createElement("button");
      const saveButton = documentRef.createElement("button");
      const payTitleElement = documentRef.createElement("strong");
      const payEffectElement = documentRef.createElement("span");
      const saveTitleElement = documentRef.createElement("strong");
      const saveEffectElement = documentRef.createElement("span");

      payButton.className = "cleanup-decision__option";
      payButton.type = "button";
      payButton.disabled = !canPay;
      payTitleElement.textContent = translator.t("cleanup.pay.title", {
        amount: translator.formatCurrency(plan.cleanupCostInCents / 100)
      });
      payEffectElement.textContent = translator.t("cleanup.pay.effect", {
        count: translator.formatNumber(plan.pay.nextDayDebtCount)
      });
      payButton.append(payTitleElement, payEffectElement);
      saveButton.className = "cleanup-decision__option";
      saveButton.type = "button";
      saveTitleElement.textContent = translator.t("cleanup.save.title");
      saveEffectElement.textContent = translator.t("cleanup.save.effect", {
        count: translator.formatNumber(plan.save.nextDayDebtCount)
      });
      saveButton.append(saveTitleElement, saveEffectElement);
      optionsElement.replaceChildren(payButton, saveButton);
      overlayElement.hidden = false;
      saveButton.focus();

      return new Promise((resolve) => {
        const finish = (policy) => {
          overlayElement.hidden = true;
          optionsElement.replaceChildren();
          resolve(policy);
        };

        payButton.addEventListener("click", () => finish("pay"), {
          once: true
        });
        saveButton.addEventListener("click", () => finish("save"), {
          once: true
        });
      });
    }
  });
}
