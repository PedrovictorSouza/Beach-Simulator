const LEPPA_TREE_MUSIC_NOTE_EMIT_INTERVAL = 0.36;
const LEPPA_TREE_MUSIC_NOTE_MAX_PARTICLES = 12;
const LEPPA_TREE_MUSIC_NOTE_BURST_COUNT = 3;
const LEPPA_TREE_MUSIC_NOTE_DURATION = 2.45;
const LEPPA_TREE_MUSIC_NOTE_BASE_HEIGHT = 1.72;
const LEPPA_TREE_MUSIC_NOTE_IMAGE_ASPECTS = Object.freeze([
  190 / 235,
  97 / 227,
  130 / 247
]);

function createLeppaTreeMusicNoteParticle(leppaTree, textureCount, random) {
  const state = leppaTree.musicNotes;
  const index = state.nextIndex % textureCount;
  state.nextIndex += 1;

  const angle = random() * Math.PI * 2;
  const radius = 0.24 + random() * 0.58;
  const height = LEPPA_TREE_MUSIC_NOTE_BASE_HEIGHT + random() * 0.54;
  const lateralSpeed = 0.12 + random() * 0.1;

  return {
    age: 0,
    duration: LEPPA_TREE_MUSIC_NOTE_DURATION * (0.86 + random() * 0.28),
    textureIndex: index,
    position: [
      leppaTree.position[0] + Math.cos(angle) * radius,
      leppaTree.position[1] + height,
      leppaTree.position[2] + Math.sin(angle) * radius
    ],
    drift: [
      Math.cos(angle) * lateralSpeed,
      0.54 + random() * 0.28,
      Math.sin(angle) * lateralSpeed
    ],
    size: 0.42 + random() * 0.16,
    rotation: (random() - 0.5) * 0.32,
    rotationSpeed: (random() - 0.5) * 0.42,
    phase: random() * Math.PI * 2
  };
}

function resetLeppaTreeMusicNotes(leppaTree) {
  if (!leppaTree?.musicNotes) {
    return;
  }

  leppaTree.musicNotes.active = false;
  leppaTree.musicNotes.emitTimer = 0;
  leppaTree.musicNotes.particles.length = 0;
}

export function updateLeppaTreeMusicNotes({
  leppaTree,
  textures,
  deltaTime,
  random = Math.random
} = {}) {
  if (!leppaTree?.revived || !Array.isArray(leppaTree.position) || !Array.isArray(textures) || textures.length === 0) {
    resetLeppaTreeMusicNotes(leppaTree);
    return;
  }

  leppaTree.musicNotes ||= {
    active: false,
    emitTimer: 0,
    nextIndex: 0,
    particles: []
  };

  if (!leppaTree.musicNotes.active) {
    leppaTree.musicNotes.active = true;
    for (let index = 0; index < LEPPA_TREE_MUSIC_NOTE_BURST_COUNT; index += 1) {
      leppaTree.musicNotes.particles.push(
        createLeppaTreeMusicNoteParticle(leppaTree, textures.length, random)
      );
    }
  }

  leppaTree.musicNotes.emitTimer += deltaTime;
  while (
    leppaTree.musicNotes.emitTimer >= LEPPA_TREE_MUSIC_NOTE_EMIT_INTERVAL &&
    leppaTree.musicNotes.particles.length < LEPPA_TREE_MUSIC_NOTE_MAX_PARTICLES
  ) {
    leppaTree.musicNotes.emitTimer -= LEPPA_TREE_MUSIC_NOTE_EMIT_INTERVAL;
    leppaTree.musicNotes.particles.push(
      createLeppaTreeMusicNoteParticle(leppaTree, textures.length, random)
    );
  }
  leppaTree.musicNotes.emitTimer = Math.min(
    leppaTree.musicNotes.emitTimer,
    LEPPA_TREE_MUSIC_NOTE_EMIT_INTERVAL
  );

  for (let index = leppaTree.musicNotes.particles.length - 1; index >= 0; index -= 1) {
    const particle = leppaTree.musicNotes.particles[index];
    particle.age += deltaTime;

    if (particle.age >= particle.duration) {
      leppaTree.musicNotes.particles.splice(index, 1);
      continue;
    }

    particle.position[0] += particle.drift[0] * deltaTime;
    particle.position[1] += particle.drift[1] * deltaTime;
    particle.position[2] += particle.drift[2] * deltaTime;
    particle.rotation += particle.rotationSpeed * deltaTime;
  }
}

export function getLeppaTreeMusicNoteBillboards({
  leppaTree,
  textures,
  uvRect,
  now,
  clamp01
} = {}) {
  if (!leppaTree?.revived || !Array.isArray(textures) || textures.length === 0) {
    return [];
  }

  const particles = leppaTree.musicNotes?.particles || [];

  return particles.map((particle) => {
    const progress = clamp01(particle.age / particle.duration);
    const textureIndex = particle.textureIndex % textures.length;
    const aspect = LEPPA_TREE_MUSIC_NOTE_IMAGE_ASPECTS[textureIndex] || 1;
    const height = particle.size * (1 + progress * 0.22);
    const fadeIn = clamp01(progress / 0.18);
    const fadeOut = clamp01((1 - progress) / 0.32);
    const floatWobble = Math.sin(now * 0.0024 + particle.phase) * 0.045;

    return {
      texture: textures[textureIndex],
      position: [
        particle.position[0] + Math.sin(now * 0.0016 + particle.phase) * 0.045,
        particle.position[1],
        particle.position[2] + Math.cos(now * 0.0014 + particle.phase) * 0.045
      ],
      size: [height * aspect, height],
      uvRect,
      alpha: fadeIn * fadeOut,
      rotation: particle.rotation + floatWobble
    };
  });
}
