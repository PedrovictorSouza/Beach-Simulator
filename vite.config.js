import { defineConfig } from "vite";
import { cpSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RUNTIME_ASSET_DIRECTORIES = Object.freeze([
  "terrain/assets",
  "Trees/PalmTree",
  "kiosk",
  "beach-house",
  "npcs/bather-1"
]);

function copyRuntimeAssets() {
  return {
    name: "copy-runtime-assets",
    closeBundle() {
      for (const assetDirectory of RUNTIME_ASSET_DIRECTORIES) {
        const outputDirectory = resolve("dist", assetDirectory);

        mkdirSync(outputDirectory, { recursive: true });
        cpSync(resolve(assetDirectory), outputDirectory, { recursive: true });
      }
    }
  };
}

export default defineConfig({
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
