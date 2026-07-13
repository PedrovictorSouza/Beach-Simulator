export const COASTAL_ZONES = Object.freeze({
  LAND: "land",
  SHALLOW: "shallow",
  BREAK: "break",
  SWIM: "swim",
  DEEP: "deep"
});

export const NPC_WATER_PROFILES = Object.freeze({
  CHILD: "child",
  ADULT: "adult"
});

export const COASTAL_ZONE_LIMITS = Object.freeze({
  landMaxRadius: 78,
  shallowMaxRadius: 88,
  breakMaxRadius: 104,
  swimMaxRadius: 132
});

export const NPC_ALLOWED_COASTAL_ZONES = Object.freeze({
  [NPC_WATER_PROFILES.CHILD]: Object.freeze([
    COASTAL_ZONES.LAND,
    COASTAL_ZONES.SHALLOW
  ]),
  [NPC_WATER_PROFILES.ADULT]: Object.freeze([
    COASTAL_ZONES.LAND,
    COASTAL_ZONES.SHALLOW,
    COASTAL_ZONES.BREAK,
    COASTAL_ZONES.SWIM
  ])
});

function readPlanarPosition(position) {
  return [
    Number(position?.[0]) || 0,
    Number(position?.[2]) || 0
  ];
}

export function getCoastalDistance(position) {
  const [x, z] = readPlanarPosition(position);
  return Math.hypot(x, z);
}

export function getCoastalZone(position, limits = COASTAL_ZONE_LIMITS) {
  const distance = getCoastalDistance(position);

  if (distance <= limits.landMaxRadius) {
    return COASTAL_ZONES.LAND;
  }

  if (distance <= limits.shallowMaxRadius) {
    return COASTAL_ZONES.SHALLOW;
  }

  if (distance <= limits.breakMaxRadius) {
    return COASTAL_ZONES.BREAK;
  }

  if (distance <= limits.swimMaxRadius) {
    return COASTAL_ZONES.SWIM;
  }

  return COASTAL_ZONES.DEEP;
}

export function getAllowedCoastalZones(profile) {
  return NPC_ALLOWED_COASTAL_ZONES[profile] || NPC_ALLOWED_COASTAL_ZONES[NPC_WATER_PROFILES.ADULT];
}

export function canNpcEnterCoastalZone(profile, zone) {
  return getAllowedCoastalZones(profile).includes(zone);
}

export function canNpcEnterPosition(profile, position, limits = COASTAL_ZONE_LIMITS) {
  return canNpcEnterCoastalZone(profile, getCoastalZone(position, limits));
}
