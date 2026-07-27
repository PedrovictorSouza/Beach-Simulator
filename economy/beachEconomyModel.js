function createSnapshot({
  moneyInCents,
  transactionCount,
  totalIncomeInCents,
  totalExpenseInCents
}) {
  return Object.freeze({
    moneyInCents,
    transactionCount,
    totalIncomeInCents,
    totalExpenseInCents,
    netChangeInCents: totalIncomeInCents - totalExpenseInCents,
    economicActivityInCents: totalIncomeInCents + totalExpenseInCents
  });
}

export function createBeachEconomyModel() {
  const observers = new Set();
  let moneyInCents = 0;
  let transactionCount = 0;
  let totalIncomeInCents = 0;
  let totalExpenseInCents = 0;

  const getSnapshot = () => createSnapshot({
    moneyInCents,
    transactionCount,
    totalIncomeInCents,
    totalExpenseInCents
  });
  const notify = () => {
    const snapshot = getSnapshot();

    for (const observer of observers) {
      observer(snapshot);
    }
  };

  return Object.freeze({
    getSnapshot,
    recordIncome({ sourceId, amountInCents }) {
      const normalizedSourceId = String(sourceId || "").trim();
      const normalizedAmount = Number(amountInCents);

      if (!normalizedSourceId) {
        throw new Error("Entrada de dinheiro precisa de sourceId.");
      }

      if (!Number.isSafeInteger(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error("Entrada de dinheiro precisa de amountInCents inteiro e positivo.");
      }

      const nextMoneyInCents = moneyInCents + normalizedAmount;

      if (!Number.isSafeInteger(nextMoneyInCents)) {
        throw new Error("Saldo da praia excedeu o limite seguro.");
      }

      moneyInCents = nextMoneyInCents;
      totalIncomeInCents += normalizedAmount;
      transactionCount += 1;
      notify();
      return getSnapshot();
    },
    recordExpense({ sourceId, amountInCents }) {
      const normalizedSourceId = String(sourceId || "").trim();
      const normalizedAmount = Number(amountInCents);

      if (!normalizedSourceId) {
        throw new Error("Saida de dinheiro precisa de sourceId.");
      }

      if (!Number.isSafeInteger(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error("Saida de dinheiro precisa de amountInCents inteiro e positivo.");
      }

      if (normalizedAmount > moneyInCents) {
        throw new Error("Saldo insuficiente para registrar a despesa.");
      }

      moneyInCents -= normalizedAmount;
      totalExpenseInCents += normalizedAmount;
      transactionCount += 1;
      notify();
      return getSnapshot();
    },
    refundExpense({ sourceId, amountInCents }) {
      const normalizedSourceId = String(sourceId || "").trim();
      const normalizedAmount = Number(amountInCents);

      if (!normalizedSourceId) {
        throw new Error("Reembolso precisa de sourceId.");
      }

      if (!Number.isSafeInteger(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error("Reembolso precisa de amountInCents inteiro e positivo.");
      }

      if (normalizedAmount > totalExpenseInCents) {
        throw new Error("Reembolso excede as despesas registradas.");
      }

      const nextMoneyInCents = moneyInCents + normalizedAmount;

      if (!Number.isSafeInteger(nextMoneyInCents)) {
        throw new Error("Saldo da praia excedeu o limite seguro.");
      }

      moneyInCents = nextMoneyInCents;
      totalExpenseInCents -= normalizedAmount;
      transactionCount += 1;
      notify();
      return getSnapshot();
    },
    subscribe(observer) {
      if (typeof observer !== "function") {
        throw new Error("Observer da economia precisa ser uma funcao.");
      }

      observers.add(observer);
      observer(getSnapshot());

      let subscribed = true;
      return () => {
        if (!subscribed) {
          return;
        }

        subscribed = false;
        observers.delete(observer);
      };
    }
  });
}
