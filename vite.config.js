import { defineConfig } from "vite";
import { cpSync, mkdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const RUNTIME_ASSET_DIRECTORIES = Object.freeze([
  "terrain/assets",
  "Trees/PalmTree",
  "kiosk",
  "beach-house",
  "beberage",
  "wifi-spot",
  "objects/sun-shade",
  "objects/Trash-Can",
  "objects/Toilet",
  "npcs/bather-1",
  "npcs/shark"
]);
const RUNTIME_ASSET_EXCLUDED_NAMES = new Set([
  ".DS_Store",
  "README.md",
  "beach-house.gif",
  "gifcatlib.so",
  "ground-2",
  "ground-dead.bin",
  "ground-dead.gltf",
  "ground-dead.png",
  "ground-dead.txt",
  "settings.json",
  "skrovet.log",
  "sun-shade.txt",
  "toillet.txt",
  "Trash-can.txt",
  "wifi-spot.txt"
]);

function shouldCopyRuntimeAsset(sourcePath) {
  return !RUNTIME_ASSET_EXCLUDED_NAMES.has(basename(sourcePath));
}

function copyRuntimeAssets() {
  return {
    name: "copy-runtime-assets",
    closeBundle() {
      for (const assetDirectory of RUNTIME_ASSET_DIRECTORIES) {
        const outputDirectory = resolve("dist", assetDirectory);

        mkdirSync(outputDirectory, { recursive: true });
        cpSync(resolve(assetDirectory), outputDirectory, {
          recursive: true,
          filter: shouldCopyRuntimeAsset
        });
      }
    }
  };
}

export default defineConfig({
  // The jam build is hosted inside an itch.io/Playgama subdirectory. Relative
  // asset URLs keep the same archive working there and in local previews.
  base: "./",
  build: {
    // The game emits a single module bundle, so Vite's modulepreload observer is
    // unnecessary and can fail in sandboxed iframe hosts.
    modulePreload: { polyfill: false }
  },
  plugins: [copyRuntimeAssets()],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  }
});
