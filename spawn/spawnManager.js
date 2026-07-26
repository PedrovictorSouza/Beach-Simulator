import {
  SPAWNABLE_OBJECT_TYPES,
  SPAWN_SOURCES,
  getSpawnableObjectDto
} from "./spawnableObjectDto.js";
import { createScheduledSpawnQueue } from "./scheduledSpawnQueue.js";

export const SPAWN_TYPES = Object.freeze({
  BATHER: SPAWNABLE_OBJECT_TYPES.BATHER
});

const BASE_INTERVAL_SECONDS = Object.freeze({ min: 30, max: 120 });
const FIVE_STAR_INTERVAL_SECONDS = Object.freeze({ min: 15, max: 60 });
const WELCOME_BATHER_INTERVAL_SECONDS = Object.freeze({ min: 12, max: 20 });
const WELCOME_BATHER_TARGET = 3;
const BEVERAGE_STORE_BATHER_RATE_MULTIPLIER = 1.05;
const BATHER_LITTER_TYPES = Object.freeze([
  SPAWNABLE_OBJECT_TYPES.BANANA,
  SPAWNABLE_OBJECT_TYPES.PAPER,
  SPAWNABLE_OBJECT_TYPES.CAN,
  SPAWNABLE_OBJECT_TYPES.BOTTLE
]);
const BATHER_LITTER_CHANCE = Object.freeze({
  WITHOUT_TRASH_CANS: 0.35,
  WITH_TRASH_CANS: 0.08,
  BEVERAGE_STORE_BONUS: 0.2
});
const BATHER_LITTER_DELAY_SECONDS = Object.freeze({ min: 12, max: 30 });
const FIRST_BATHER_LITTER_DELAY_SECONDS = Object.freeze({ min: 10, max: 15 });
const BATHER_LITTER_OFFSET = 1.5;
const SPAWN_CHANNELS = Object.freeze({
  BATHERS: "bathers",
  BATHER_LITTER: "bather-litter"
});
const SPAWN_CHANNEL_POLICIES = Object.freeze({
  [SPAWN_CHANNELS.BATHERS]: Object.freeze({
    designPriority: 1,
    attentionCost: 1
  }),
  [SPAWN_CHANNELS.BATHER_LITTER]: Object.freeze({
    designPriority: 1,
    attentionCost: 0.25
  })
});
const ATTENTION_COST_PRIORITY_PENALTY = 0.5;
const WAITING_PRIORITY_PER_SECOND = 0.1;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(start, end, progress) {
  return start + (end - start) * progress;
}

function getIntervalRange(averageRating) {
  const ratingProgress = clamp(Number(averageRating) || 0, 0, 5) / 5;

  return {
    min: interpolate(
      BASE_INTERVAL_SECONDS.min,
      FIVE_STAR_INTERVAL_SECONDS.min,
      ratingProgress
    ),
    max: interpolate(
      BASE_INTERVAL_SECONDS.max,
      FIVE_STAR_INTERVAL_SECONDS.max,
      ratingProgress
    )
  };
}

export function createSpawnManager({ random = Math.random } = {}) {
  if (typeof random !== "function") {
    throw new Error("SpawnManager precisa de uma funcao random.");
  }

  let running = false;
  let elapsedSeconds = 0;
  let activeBatherEventSequence = null;
  let firstBatherSpawned = false;
  let immediateBatherRequested = false;
  let spawnedBatherCount = 0;
  let welcomeSequenceActive = false;
  let guaranteedFirstLitterPending = false;
  const timeline = createScheduledSpawnQueue();
  const readyEvents = [];
  const knownBatherIds = new Set();
  const litterPlanByEventSequence = new Map();

  const readRandomUnit = () => clamp(Number(random()) || 0, 0, 1);
  const readRandomIndex = (length) => Math.min(
    length - 1,
    Math.floor(readRandomUnit() * length)
  );
  const getSecondsUntilNextSpawn = () => {
    const nextEvent = timeline.peek();

    return nextEvent ? Math.max(0, nextEvent.executeAt - elapsedSeconds) : null;
  };
  const getSnapshot = () => Object.freeze({
    running,
    firstBatherSpawned,
    immediateBatherRequested,
    secondsUntilNextSpawn: getSecondsUntilNextSpawn(),
    scheduledCount: timeline.size,
    readyCount: readyEvents.length
  });

  const scheduleNextBather = (
    averageRating,
    fromSeconds = elapsedSeconds,
    buildingServices = {},
    attractionMultiplier = 1
  ) => {
    const interval = welcomeSequenceActive && spawnedBatherCount < WELCOME_BATHER_TARGET ?
      WELCOME_BATHER_INTERVAL_SECONDS :
      getIntervalRange(averageRating);
    const policy = SPAWN_CHANNEL_POLICIES[SPAWN_CHANNELS.BATHERS];
    const buildingRateMultiplier = buildingServices.hasBeverageStore ?
      BEVERAGE_STORE_BATHER_RATE_MULTIPLIER :
      1;
    const batherRateMultiplier = buildingRateMultiplier * clamp(
      Number(attractionMultiplier) || 1,
      0.25,
      2
    );
    const delaySeconds = interpolate(
      interval.min,
      interval.max,
      readRandomUnit()
    ) / batherRateMultiplier;

    const event = timeline.enqueue({
      executeAt: fromSeconds + delaySeconds,
      channel: SPAWN_CHANNELS.BATHERS,
      designPriority: policy.designPriority,
      attentionCost: policy.attentionCost
    });

    activeBatherEventSequence = event.sequence;
  };

  const scheduleLitterForNewBathers = (bathers, buildingServices) => {
    const baseLitterChance = buildingServices.hasTrashCans ?
      BATHER_LITTER_CHANCE.WITH_TRASH_CANS :
      BATHER_LITTER_CHANCE.WITHOUT_TRASH_CANS;
    const litterChance = clamp(
      baseLitterChance + (buildingServices.hasBeverageStore ?
        BATHER_LITTER_CHANCE.BEVERAGE_STORE_BONUS : 0),
      0,
      1
    );

    for (const bather of bathers) {
      const batherId = String(bather?.id || "").trim();

      if (!batherId || knownBatherIds.has(batherId)) {
        continue;
      }

      knownBatherIds.add(batherId);
      const guaranteedLitter = guaranteedFirstLitterPending;
      guaranteedFirstLitterPending = false;

      if (!guaranteedLitter && readRandomUnit() >= litterChance) {
        continue;
      }

      const policy = SPAWN_CHANNEL_POLICIES[SPAWN_CHANNELS.BATHER_LITTER];
      const litterType = BATHER_LITTER_TYPES[
        readRandomIndex(BATHER_LITTER_TYPES.length)
      ];
      const delayRange = guaranteedLitter ?
        FIRST_BATHER_LITTER_DELAY_SECONDS :
        BATHER_LITTER_DELAY_SECONDS;
      const delaySeconds = interpolate(
        delayRange.min,
        delayRange.max,
        readRandomUnit()
      );
      const event = timeline.enqueue({
        executeAt: elapsedSeconds + delaySeconds,
        channel: SPAWN_CHANNELS.BATHER_LITTER,
        designPriority: policy.designPriority,
        attentionCost: policy.attentionCost
      });

      litterPlanByEventSequence.set(event.sequence, Object.freeze({
        batherId,
        litterType
      }));
    }
  };

  const createBatherLitterRequest = (event, bathersById) => {
    const plan = litterPlanByEventSequence.get(event.sequence);
    litterPlanByEventSequence.delete(event.sequence);

    const bather = plan ? bathersById.get(plan.batherId) : null;
    if (!bather || !Array.isArray(bather.position)) {
      return null;
    }

    const [x, z] = bather.position;
    if (!Number.isFinite(x) || !Number.isFinite(z)) {
      return null;
    }

    const angle = readRandomUnit() * Math.PI * 2;
    const definition = getSpawnableObjectDto(plan.litterType);

    return Object.freeze({
      id: `npc-drop-${event.sequence}`,
      type: plan.litterType,
      source: SPAWN_SOURCES.NPC_DROP,
      zone: definition.spawnZones[0],
      placement: Object.freeze({
        position: Object.freeze([
          x + Math.cos(angle) * BATHER_LITTER_OFFSET,
          z - BATHER_LITTER_OFFSET
        ]),
        yaw: angle
      })
    });
  };

  const getReadyPriority = (event) => (
    event.designPriority -
    event.attentionCost * ATTENTION_COST_PRIORITY_PENALTY +
    Math.max(0, elapsedSeconds - event.executeAt) * WAITING_PRIORITY_PER_SECOND
  );

  const dequeueHighestDesignPriority = () => {
    let selectedIndex = 0;

    for (let index = 1; index < readyEvents.length; index += 1) {
      const selected = readyEvents[selectedIndex];
      const candidate = readyEvents[index];
      const priorityDifference = getReadyPriority(candidate) - getReadyPriority(selected);

      if (priorityDifference > 0 || (
        priorityDifference === 0 && candidate.sequence < selected.sequence
      )) {
        selectedIndex = index;
      }
    }

    return readyEvents.splice(selectedIndex, 1)[0];
  };

  return Object.freeze({
    getSnapshot,
    start({ averageRating = 0 } = {}) {
      if (!running) {
        running = true;
        timeline.clear();
        readyEvents.length = 0;
        knownBatherIds.clear();
        litterPlanByEventSequence.clear();
        activeBatherEventSequence = null;
        firstBatherSpawned = false;
        immediateBatherRequested = false;
        spawnedBatherCount = 0;
        welcomeSequenceActive = false;
        guaranteedFirstLitterPending = false;
        scheduleNextBather(averageRating);
      }

      return getSnapshot();
    },
    stop() {
      running = false;

      return getSnapshot();
    },
    requestImmediateBather() {
      if (!running || firstBatherSpawned || immediateBatherRequested) {
        return false;
      }

      const policy = SPAWN_CHANNEL_POLICIES[SPAWN_CHANNELS.BATHERS];
      const event = timeline.enqueue({
        executeAt: elapsedSeconds,
        channel: SPAWN_CHANNELS.BATHERS,
        designPriority: policy.designPriority,
        attentionCost: policy.attentionCost
      });

      activeBatherEventSequence = event.sequence;
      immediateBatherRequested = true;
      welcomeSequenceActive = true;
      guaranteedFirstLitterPending = true;
      return true;
    },
    update(deltaSeconds, {
      averageRating = 0,
      bathers = [],
      buildingServices = {},
      attractionMultiplier = 1
    } = {}) {
      if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
        throw new Error("deltaSeconds precisa ser um numero finito e nao negativo.");
      }

      if (!Array.isArray(bathers)) {
        throw new Error("SpawnManager precisa receber bathers como lista.");
      }

      if (!running || deltaSeconds === 0) {
        return [];
      }

      elapsedSeconds += deltaSeconds;
      scheduleLitterForNewBathers(bathers, buildingServices);
      const requests = [];
      const bathersById = new Map(bathers.map((bather) => [bather.id, bather]));

      while (timeline.peek()?.executeAt <= elapsedSeconds) {
        readyEvents.push(timeline.dequeue());
      }

      while (readyEvents.length > 0) {
        const event = dequeueHighestDesignPriority();

        if (event.channel === SPAWN_CHANNELS.BATHERS) {
          if (event.sequence !== activeBatherEventSequence) {
            continue;
          }

          firstBatherSpawned = true;
          immediateBatherRequested = false;
          spawnedBatherCount += 1;
          if (spawnedBatherCount >= WELCOME_BATHER_TARGET) {
            welcomeSequenceActive = false;
          }
          requests.push(Object.freeze({
            type: SPAWN_TYPES.BATHER,
            entryProgress: readRandomUnit()
          }));
          scheduleNextBather(
            averageRating,
            elapsedSeconds,
            buildingServices,
            attractionMultiplier
          );
        }

        if (event.channel === SPAWN_CHANNELS.BATHER_LITTER) {
          const litterRequest = createBatherLitterRequest(event, bathersById);

          if (litterRequest) {
            requests.push(litterRequest);
          }
        }
      }

      return requests;
    }
  });
}
