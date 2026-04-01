import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../public/data");

function readJSON(relativePath) {
  return JSON.parse(readFileSync(join(DATA_DIR, relativePath), "utf-8"));
}

// Cache loaded JSON in memory (avoid re-reading files on every call)
const _cache = new Map();
function cached(key, fn) {
  if (!_cache.has(key)) _cache.set(key, fn());
  return _cache.get(key);
}

export function getPlatforms() {
  return Promise.resolve(cached("platforms", () => readJSON("platforms.json")));
}

export function getCategories() {
  return Promise.resolve(cached("categories", () => readJSON("categories.json")));
}

export function getManifest() {
  return Promise.resolve(cached("manifest", () => readJSON("manifest.json")));
}

export function getPlatformApps(platformId) {
  return Promise.resolve(
    cached(`apps:${platformId}`, () => {
      const data = readJSON(`platforms/${platformId}.json`);
      return data.apps;
    })
  );
}

export async function getAppBySlug(platformId, slug) {
  const apps = await getPlatformApps(platformId);
  return apps.find((a) => a.slug === slug) || null;
}

export async function getOtherPlatforms(slug, currentPlatformId) {
  const data = cached(`platformData:${currentPlatformId}`, () =>
    readJSON(`platforms/${currentPlatformId}.json`)
  );
  return data.otherPlatforms[slug] || [];
}

export function getOtherPlatformsMap(platformId) {
  return Promise.resolve(
    cached(`otherPlatformsMap:${platformId}`, () => {
      const data = readJSON(`platforms/${platformId}.json`);
      return data.otherPlatforms || {};
    })
  );
}
