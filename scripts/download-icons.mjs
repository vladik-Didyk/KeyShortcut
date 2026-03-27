#!/usr/bin/env node
/**
 * Download icons from Supabase Storage into public/images/ for same-origin serving.
 * Run before `pnpm build` to bundle icons with the deploy.
 */
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APP_ICONS_DIR = join(ROOT, "public/images/app-icons");
const PLATFORM_ICONS_DIR = join(ROOT, "public/images/platform-icons");

try { process.loadEnvFile(join(ROOT, ".env")); } catch { /* env vars from CI secrets */ }
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/icons`;
const REST_URL = `${SUPABASE_URL}/rest/v1`;
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function query(path) {
  const res = await fetch(`${REST_URL}/${path}`, { headers: HEADERS });
  return res.json();
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

  // Get all app slugs
  const apps = await query("apps?select=slug");
  console.log(`1. Downloading ${apps.length} app icons...`);

  const BATCH = 20;
  let downloaded = 0;
  for (let i = 0; i < apps.length; i += BATCH) {
    const batch = apps.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((app) =>
        downloadFile(
          `${STORAGE_URL}/app-icons/${app.slug}.webp`,
          join(APP_ICONS_DIR, `${app.slug}.webp`)
        )
      )
    );
    downloaded += results.filter(Boolean).length;
    process.stdout.write(`   ${downloaded}/${apps.length}\r`);
  }
  console.log(`   ${downloaded}/${apps.length} app icons downloaded`);

  // Platform icons
  const platformIcons = ["apple", "windows", "linux"];
  console.log(`\n2. Downloading ${platformIcons.length} platform icons...`);
  for (const name of platformIcons) {
    await downloadFile(
      `${STORAGE_URL}/platform-icons/${name}.webp`,
      join(PLATFORM_ICONS_DIR, `${name}.webp`)
    );
  }
  console.log(`   ${platformIcons.length} platform icons downloaded`);

  console.log("\n=== Done ===");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
