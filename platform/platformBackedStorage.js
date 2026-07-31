function serializeStorageValue(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function createPlatformBackedStorage({
  localStorage = null,
  platformGateway = null
} = {}) {
  let writeQueue = Promise.resolve();

  const queuePlatformWrite = (key, value) => {
    if (!platformGateway?.setStorage) {
      return;
    }

    writeQueue = writeQueue
      .then(() => platformGateway.setStorage(key, value))
      .catch(() => false);
  };
  const getLocalItem = (key) => {
    try {
      return localStorage?.getItem?.(key) ?? null;
    } catch {
      return null;
    }
  };

  return Object.freeze({
    async flush() {
      await writeQueue;
    },
    getItem(key) {
      return getLocalItem(key);
    },
    async hydrate(keys) {
      const normalizedKeys = [...new Set(
        (Array.isArray(keys) ? keys : [keys])
          .map((key) => String(key || "").trim())
          .filter(Boolean)
      )];

      for (const key of normalizedKeys) {
        const remoteValue = await platformGateway?.getStorage?.(key);

        if (remoteValue !== null && remoteValue !== undefined) {
          try {
            localStorage?.setItem?.(key, serializeStorageValue(remoteValue));
          } catch {
            // O cache local e opcional; o valor remoto continua valido.
          }
          continue;
        }

        const localValue = getLocalItem(key);
        if (localValue !== null) {
          queuePlatformWrite(key, localValue);
        }
      }

      await writeQueue;
    },
    removeItem(key) {
      try {
        localStorage?.removeItem?.(key);
      } catch {
        // A remocao remota continua sendo best-effort.
      }

      queuePlatformWrite(key, null);
    },
    setItem(key, value) {
      const serializedValue = String(value);

      try {
        localStorage?.setItem?.(key, serializedValue);
      } catch {
        // O SDK ainda pode salvar mesmo quando o storage local esta bloqueado.
      }
      queuePlatformWrite(key, serializedValue);
    }
  });
}
