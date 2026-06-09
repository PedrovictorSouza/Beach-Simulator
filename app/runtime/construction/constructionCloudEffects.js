const LEAF_DEN_CONSTRUCTION_CLOUD_COUNT = 18;
const CONSTRUCTION_CLOUD_BURST_MAX_EFFECTS = 3;
const CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT = 14;
const LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_X = 1.48;
const LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_Z = 1.08;
const LEAF_DEN_CONSTRUCTION_CLOUD_BASE_Y = 0.42;
const LEAF_DEN_CONSTRUCTION_CLOUD_BOB = 0.3;

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

export function ensureLeafDenConstructionCloudInstances(session = {}) {
  if (!Array.isArray(session.leafDenConstructionCloudInstances)) {
    session.leafDenConstructionCloudInstances = Array.from(
      { length: LEAF_DEN_CONSTRUCTION_CLOUD_COUNT },
      (_, index) => ({
        id: `leaf-den-construction-cloud-${index}`,
        offset: [0, 0, 0],
        scale: 1,
        yaw: 0,
        pitch: 0,
        roll: 0,
        active: false
      })
    );

    if (Array.isArray(session.cloudAtmosphere?.cloudInstances)) {
      session.cloudAtmosphere.cloudInstances.push(...session.leafDenConstructionCloudInstances);
    }
  }

  return session.leafDenConstructionCloudInstances;
}

export function getActiveConstructionCloudBursts(session = {}, nowMs = Date.now()) {
  if (!Array.isArray(session.constructionCloudBursts)) {
    return [];
  }

  const activeBursts = session.constructionCloudBursts
    .map((effect) => {
      const startedAt = Number(effect?.startedAt || 0);
      const durationMs = Number(effect?.durationMs || 0);
      const progress = durationMs > 0 ? clamp01((nowMs - startedAt) / durationMs) : 1;

      return {
        ...effect,
        progress
      };
    })
    .filter((effect) => {
      return (
        Array.isArray(effect?.position) &&
        Number(effect.startedAt || 0) > 0 &&
        Number(effect.durationMs || 0) > 0 &&
        effect.progress < 1
      );
    })
    .slice(-CONSTRUCTION_CLOUD_BURST_MAX_EFFECTS);

  session.constructionCloudBursts = activeBursts.map(({ progress, ...effect }) => effect);
  return activeBursts;
}

export function ensureConstructionCloudBurstInstances(session = {}) {
  const requiredCount = CONSTRUCTION_CLOUD_BURST_MAX_EFFECTS * CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT;

  if (!Array.isArray(session.constructionCloudBurstInstances)) {
    session.constructionCloudBurstInstances = [];
  }

  while (session.constructionCloudBurstInstances.length < requiredCount) {
    const index = session.constructionCloudBurstInstances.length;
    session.constructionCloudBurstInstances.push({
      id: `construction-cloud-burst-${index}`,
      offset: [0, 0, 0],
      scale: 1,
      yaw: 0,
      pitch: 0,
      roll: 0,
      active: false
    });
  }

  if (
    Array.isArray(session.cloudAtmosphere?.cloudInstances) &&
    !session.constructionCloudBurstInstancesRegistered
  ) {
    session.cloudAtmosphere.cloudInstances.push(...session.constructionCloudBurstInstances);
    session.constructionCloudBurstInstancesRegistered = true;
  }

  return session.constructionCloudBurstInstances;
}

export function syncConstructionCloudBurstEffects({
  session = {},
  nowMs = Date.now(),
  nowSeconds = 0
} = {}) {
  const bursts = getActiveConstructionCloudBursts(session, nowMs);
  const instances = ensureConstructionCloudBurstInstances(session);

  for (const instance of instances) {
    instance.active = false;
  }

  bursts.forEach((burst, burstIndex) => {
    const position = burst.position;
    const effectAlpha = Math.sin(Math.PI * clamp01(burst.progress));

    for (let index = 0; index < CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT; index += 1) {
      const instance = instances[(burstIndex * CONSTRUCTION_CLOUD_BURST_CLOUD_COUNT) + index];
      if (!instance) {
        continue;
      }

      const angle = index * 2.399 + nowSeconds * (3.2 + (index % 4) * 0.36);
      const wobble = Math.sin(nowSeconds * 6.1 + index * 1.7);
      const radiusPulse = 0.65 + effectAlpha * 0.55 + Math.sin(nowSeconds * 4.2 + index) * 0.14;
      instance.active = true;
      instance.offset = [
        position[0] + Math.cos(angle) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_X * radiusPulse,
        LEAF_DEN_CONSTRUCTION_CLOUD_BASE_Y + Math.abs(wobble) * LEAF_DEN_CONSTRUCTION_CLOUD_BOB,
        position[2] + Math.sin(angle * 1.08) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_Z * radiusPulse
      ];
      instance.scale = (0.24 + (index % 5) * 0.045 + Math.abs(wobble) * 0.08) * Math.max(0.12, effectAlpha);
      instance.yaw = angle;
      instance.pitch = Math.sin(nowSeconds * 3.7 + index) * 0.24;
      instance.roll = Math.cos(nowSeconds * 4.6 + index * 0.5) * 0.3;
    }
  });

  return instances;
}

export function syncLeafDenConstructionClouds({
  session = {},
  active = false,
  position = null,
  nowSeconds = 0
} = {}) {
  const instances = ensureLeafDenConstructionCloudInstances(session);

  for (let index = 0; index < instances.length; index += 1) {
    const instance = instances[index];
    instance.active = active;

    if (!active || !Array.isArray(position)) {
      continue;
    }

    const angle = index * 2.399 + nowSeconds * (2.4 + (index % 4) * 0.28);
    const wobble = Math.sin(nowSeconds * 4.4 + index * 1.7);
    const radiusPulse = 1 + Math.sin(nowSeconds * 3.1 + index) * 0.18;
    instance.offset = [
      position[0] + Math.cos(angle) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_X * radiusPulse,
      LEAF_DEN_CONSTRUCTION_CLOUD_BASE_Y + Math.abs(wobble) * LEAF_DEN_CONSTRUCTION_CLOUD_BOB,
      position[2] + Math.sin(angle * 1.08) * LEAF_DEN_CONSTRUCTION_CLOUD_RADIUS_Z * radiusPulse
    ];
    instance.scale = 0.34 + (index % 5) * 0.055 + Math.abs(wobble) * 0.08;
    instance.yaw = angle;
    instance.pitch = Math.sin(nowSeconds * 2.7 + index) * 0.22;
    instance.roll = Math.cos(nowSeconds * 3.6 + index * 0.5) * 0.26;
  }

  return instances;
}
