import test from "node:test";
import assert from "node:assert/strict";

import { createTypewriter } from "../ui/typewriter.js";

function createTypewriterHarness({ reducedMotion = false } = {}) {
  const intervals = new Map();
  let nextIntervalId = 1;
  const documentRef = {
    createTextNode() {
      return {
        nodeType: 3,
        data: "",
        appendData(value) {
          this.data += value;
        }
      };
    }
  };
  const target = {
    nodeType: 1,
    ownerDocument: documentRef,
    children: [],
    replaceChildren(...children) {
      this.children = [...children];
    },
    append(child) {
      this.children.push(child);
    }
  };
  const windowRef = {
    setInterval(callback) {
      const intervalId = nextIntervalId;

      nextIntervalId += 1;
      intervals.set(intervalId, callback);
      return intervalId;
    },
    clearInterval(intervalId) {
      intervals.delete(intervalId);
    },
    matchMedia() {
      return { matches: reducedMotion };
    }
  };

  return {
    target,
    windowRef,
    tick() {
      [...intervals.values()].forEach((callback) => callback());
    },
    get activeIntervals() {
      return intervals.size;
    }
  };
}

test("typewriter compartilha texto, imagem inline e som por caractere", async () => {
  const harness = createTypewriterHarness();
  const heardCharacters = [];
  const star = { nodeType: 1, name: "star" };
  const typewriter = createTypewriter({
    target: harness.target,
    windowRef: harness.windowRef,
    onCharacter: (character) => heardCharacters.push(character)
  });
  const playback = typewriter.play(["HI ", star, "!"]);

  for (let index = 0; index < 5; index += 1) {
    harness.tick();
  }

  assert.deepEqual(await playback, { completed: true });
  assert.equal(harness.activeIntervals, 0);
  assert.deepEqual(heardCharacters, ["H", "I", "!"]);
  assert.equal(harness.target.children.length, 3);
  assert.equal(harness.target.children[0].data, "HI ");
  assert.equal(harness.target.children[1], star);
  assert.equal(harness.target.children[2].data, "!");
});

test("typewriter interrompe a fala anterior antes de iniciar outra", async () => {
  const harness = createTypewriterHarness();
  const typewriter = createTypewriter({
    target: harness.target,
    windowRef: harness.windowRef
  });
  const firstPlayback = typewriter.play("OLD");

  harness.tick();
  const secondPlayback = typewriter.play("NEW");

  for (let index = 0; index < 3; index += 1) {
    harness.tick();
  }

  assert.deepEqual(await firstPlayback, { completed: false });
  assert.deepEqual(await secondPlayback, { completed: true });
  assert.equal(harness.target.children[0].data, "NEW");
});
