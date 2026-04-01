#!/usr/bin/env node
/**
 * Download icons from Supabase Storage into public/images/ for same-origin serving.
 * Reads app data from exported JSON files — no Supabase credentials needed.
 * Run before `pnpm build` to bundle icons with the deploy.
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "public/data");
const APP_ICONS_DIR = join(ROOT, "public/images/app-icons");
const PLATFORM_ICONS_DIR = join(ROOT, "public/images/platform-icons");

function readJSON(relativePath) {
  return JSON.parse(readFileSync(join(DATA_DIR, relativePath), "utf-8"));
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return true;
}

async function main() {
  console.log("=== Downloading icons from Supabase Storage ===\n");

  mkdirSync(APP_ICONS_DIR, { recursive: true });
  mkdirSync(PLATFORM_ICONS_DIR, { recursive: true });

  // Collect all unique apps across platforms
  const platforms = readJSON("platforms.json");
  const seen = new Set();
  const apps = [];
  for (const platform of platforms) {
    const { apps: platformApps } = readJSON(`platforms/${platform.id}.json`);
    for (const app of platformApps) {
      if (!seen.has(app.slug)) {
        seen.add(app.slug);
        apps.push(app);
      }
    }
  }

  console.log(`1. Downloading ${apps.length} app icons...`);
  const BATCH = 20;
  let downloaded = 0;
  for (let i = 0; i < apps.length; i += BATCH) {
    const batch = apps.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((app) => {
        if (!app.iconUrl) return Promise.resolve(false);
        return downloadFile(app.iconUrl, join(APP_ICONS_DIR, `${app.slug}.webp`));
      })
    );
    downloaded += results.filter(Boolean).length;
    process.stdout.write(`   ${downloaded}/${apps.length}\r`);
  }
  console.log(`   ${downloaded}/${apps.length} app icons downloaded`);

  // Platform icons
  console.log(`\n2. Downloading platform icons...`);
  let platformDownloaded = 0;
  for (const platform of platforms) {
    if (!platform.icon_url) continue;
    const filename = platform.id === "macos" ? "apple.webp" : `${platform.id}.webp`;
    const ok = await downloadFile(platform.icon_url, join(PLATFORM_ICONS_DIR, filename));
    if (ok) platformDownloaded++;
  }
  console.log(`   ${platformDownloaded} platform icons downloaded`);

  console.log("\n=== Done ===");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
