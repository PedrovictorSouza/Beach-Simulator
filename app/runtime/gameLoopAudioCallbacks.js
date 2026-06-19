export function createGameLoopAudioCallbacks(audio) {
  return {
    playInstanceObjectSfx() {
      audio.playInstanceObject();
    },
    playTreeBirthSfx() {
      audio.playTreeBirth();
    },
    playGrowBotRevealSfx() {
      audio.playGrowBotReveal();
    }
  };
}
