const MISSION_TARGET_ALIAS_IDS = Object.freeze({
  chopper: "tangrowth",
  shopper: "tangrowth",
  overseer: "tangrowth",
  "overseer-bot": "tangrowth",
  tangrowth: "tangrowth",
  "chopper-first-habitat-report": "tangrowth",

  hydro: "squirtle",
  "hydro-bot": "squirtle",
  squirtle: "squirtle",
  watergun: "squirtle",
  "water-gun": "squirtle",

  grow: "leaf-helper",
  "grow-bot": "leaf-helper",
  bulbasaur: "leaf-helper",
  "leaf-helper": "leaf-helper",
  leafage: "leaf-helper",

  thermal: "charmander",
  "thermal-bot": "charmander",
  charmander: "charmander",
  fire: "charmander",

  builder: "timburr",
  "builder-bot": "timburr",
  timburr: "timburr"
});

const MISSION_COPY_TARGET_PATTERNS = Object.freeze([
  {
    targetId: "tangrowth",
    pattern: /\b(?:talk to|return to|tell|report back to)\s+(?:chopper|shopper|overseer(?:\s+bot)?|the overseer)\b/i
  },
  {
    targetId: "squirtle",
    pattern: /\b(?:talk to|return to|give\b.*?\bto)\s+hydro\s+bot\b/i
  },
  {
    targetId: "leaf-helper",
    pattern: /\b(?:talk to|return to|follow|give\b.*?\bto)\s+grow\s+bot\b/i
  },
  {
    targetId: "workbench",
    pattern: /\b(?:interact with|use|open|go to|head to)\s+(?:the\s+)?workbench\b/i
  },
  {
    targetId: "charmander",
    pattern: /\b(?:talk to|return to|give\b.*?\bto)\s+thermal\s+bot\b/i
  },
  {
    targetId: "timburr",
    pattern: /\b(?:talk to|return to|give\b.*?\bto)\s+builder\s+bot\b/i
  }
]);

function getMissionTargetAliasKey(targetId) {
  return String(targetId || "")
    .trim()
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

export function resolveMissionTargetAliasId(targetId) {
  if (!targetId) {
    return null;
  }

  const trimmedTargetId = String(targetId).trim();

  if (!trimmedTargetId) {
    return null;
  }

  return MISSION_TARGET_ALIAS_IDS[getMissionTargetAliasKey(trimmedTargetId)] || trimmedTargetId;
}

function flattenMissionCopyParts(copyParts, flattened = []) {
  for (const copyPart of copyParts) {
    if (Array.isArray(copyPart)) {
      flattenMissionCopyParts(copyPart, flattened);
      continue;
    }

    if (typeof copyPart === "string" && copyPart.trim()) {
      flattened.push(copyPart.trim());
    }
  }

  return flattened;
}

export function resolveMissionTargetIdsFromMissionCopy(...copyParts) {
  const copy = flattenMissionCopyParts(copyParts).join(" ").replace(/\s+/g, " ").trim();

  if (!copy) {
    return [];
  }

  const targetIds = [];

  for (const { targetId, pattern } of MISSION_COPY_TARGET_PATTERNS) {
    if (pattern.test(copy) && !targetIds.includes(targetId)) {
      targetIds.push(targetId);
    }
  }

  return targetIds;
}