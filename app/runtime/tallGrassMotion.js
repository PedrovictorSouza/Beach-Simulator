function getStableHash(seed) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getTallGrassYaw(groundGrassPatch) {
  const seed = `${groundGrassPatch?.cellId || ""}:${groundGrassPatch?.id || ""}`;
  const hash = getStableHash(seed);
  const quarterTurn = (hash % 4) * Math.PI * 0.5;
  const smallTurn = ((hash % 13) - 6) * 0.035;
  return quarterTurn + smallTurn;
}

export function getTallGrassSway(groundGrassPatch, shouldRustle, now) {
  const position = groundGrassPatch?.position || [0, 0, 0];
  const ambient = Math.sin(now * 0.0018 + position[0] * 0.63 + position[2] * 0.41) * 0.018;
  const rustle = shouldRustle ? Math.sin(now * 0.024) * 0.09 : 0;
  return ambient + rustle;
}
