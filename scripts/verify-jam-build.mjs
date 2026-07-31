import { readFile, readdir, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";

const DIST_DIRECTORY = resolve("dist");
const JAM_SIZE_LIMIT_BYTES = 100 * 1024 * 1024;
const ITCH_FILE_LIMIT = 1_000;
const ITCH_PATH_LIMIT = 240;
const ITCH_SINGLE_FILE_LIMIT_BYTES = 200 * 1024 * 1024;
const FORBIDDEN_ARCHIVE_FILE_PATTERN = /(?:^|\/)(?:\.DS_Store|.*\.(?:dll|dylib|exe|log|so))$/i;

function assertBuild(condition, message) {
  if (!condition) {
    throw new Error(`Jam build inválido: ${message}`);
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(absolutePath));
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

const indexPath = resolve(DIST_DIRECTORY, "index.html");
const configPath = resolve(DIST_DIRECTORY, "playgama-bridge-config.json");
const [indexHtml, configText, files] = await Promise.all([
  readFile(indexPath, "utf8"),
  readFile(configPath, "utf8"),
  listFiles(DIST_DIRECTORY)
]);

const fileRecords = await Promise.all(files.map(async (absolutePath) => ({
  absolutePath,
  archivePath: relative(DIST_DIRECTORY, absolutePath),
  size: (await stat(absolutePath)).size
})));
const totalSize = fileRecords.reduce((sum, file) => sum + file.size, 0);

assertBuild(files.length <= ITCH_FILE_LIMIT,
  `${files.length} arquivos; o itch.io aceita no máximo ${ITCH_FILE_LIMIT}.`);
assertBuild(totalSize <= JAM_SIZE_LIMIT_BYTES,
  `${(totalSize / 1024 / 1024).toFixed(2)} MB; a jam aceita no máximo 100 MB.`);
assertBuild(fileRecords.every((file) => file.size <= ITCH_SINGLE_FILE_LIMIT_BYTES),
  "há um arquivo individual maior que 200 MB.");
assertBuild(fileRecords.every((file) => file.archivePath.length <= ITCH_PATH_LIMIT),
  "há um caminho de arquivo maior que 240 caracteres.");
assertBuild(fileRecords.every((file) => /^[\x20-\x7E]+$/.test(file.archivePath)),
  "há nome de arquivo fora do conjunto ASCII/latino.");
assertBuild(
  fileRecords.every((file) => !FORBIDDEN_ARCHIVE_FILE_PATTERN.test(file.archivePath)),
  "há executável, biblioteca nativa, log ou metadado de sistema no build."
);
assertBuild(
  indexHtml.includes("https://bridge.playgama.com/v1/stable/playgama-bridge.js"),
  "o Playgama Bridge SDK não está no index.html."
);
assertBuild(
  /<script\b(?=[^>]*\bdefer\b)(?=[^>]*bridge\.playgama\.com\/v1\/stable\/playgama-bridge\.js)[^>]*>/i
    .test(indexHtml),
  "o Playgama Bridge precisa aguardar o documento ser analisado."
);
assertBuild(
  indexHtml.indexOf("bridge.playgama.com") < indexHtml.indexOf("type=\"module\""),
  "o Playgama Bridge precisa carregar antes do módulo principal."
);
assertBuild(!/(?:src|href)=["']\/(?!\/)/i.test(indexHtml),
  "o index.html contém caminho absoluto, que quebra dentro do iframe do itch.io.");

const bridgeConfig = JSON.parse(configText);
assertBuild(bridgeConfig?.advertisement?.interstitial?.disable === false,
  "anúncio interstitial do Playgama está desativado.");
assertBuild(bridgeConfig?.device?.supportedOrientations?.includes("landscape"),
  "a orientação landscape não está declarada no Playgama.");
const ratingLeaderboard = bridgeConfig?.leaderboards?.find?.(
  (leaderboard) => leaderboard?.id === "beach_rating"
);
assertBuild(Boolean(ratingLeaderboard),
  "o ranking beach_rating não está declarado no Playgama.");
assertBuild(ratingLeaderboard?.isMain === true,
  "o ranking principal de rating não está marcado como isMain.");

console.log([
  "Jam build aprovado.",
  `Arquivos: ${files.length}/${ITCH_FILE_LIMIT}`,
  `Tamanho: ${(totalSize / 1024 / 1024).toFixed(2)} MB/100 MB`,
  "index.html: raiz do build",
  "Playgama Bridge: presente",
  "Ranking Playgama: beach_rating",
  "Assets: caminhos relativos"
].join("\n"));
