#!/usr/bin/env node
/**
 * Export all shortcut data from Supabase to static JSON files.
 * Run by maintainer only: `pnpm export`
 *
 * Output:
 *   public/data/platforms.json
 *   public/data/categories.json
 *   public/data/manifest.json
 *   public/data/platforms/macos.json
 *   public/data/platforms/windows.json
 *   public/data/platforms/linux.json
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "public/data");
const PLATFORMS_DIR = join(DATA_DIR, "platforms");

try { process.loadEnvFile(join(ROOT, ".env")); } catch { /* env vars from CI secrets */ }
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  console.error("This script requires Supabase credentials. It is meant for maintainers only.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Batch helper ────────────────────────────────────────────
const BATCH = 50;
async function batchIn(table, column, ids, select, extraFilters) {
  if (!ids.length) return [];
  const batches = [];
  for (let i = 0; i < ids.length; i += BATCH) {
    let q = supabase.from(table).select(select).in(column, ids.slice(i, i + BATCH)).limit(10000);
    if (extraFilters) q = extraFilters(q);
    batches.push(q);
  }
  const results = await Promise.all(batches);
  return results.flatMap((r) => r.data || []);
}

// ── Query helpers ───────────────────────────────────────────

async function fetchPlatforms() {
  const { data } = await supabase
    .from("platforms")
    .select("id, display_name, icon_url, sort_order")
    .order("sort_order");
  return data || [];
}

async function fetchCategories() {
  const { data } = await supabase
    .from("categories")
    .select("id, display_name, icon, color, sort_order")
    .order("sort_order");
  return data || [];
}

async function fetchModifierSymbols(platformId) {
  const { data } = await supabase
    .from("modifier_symbols")
    .select("modifier, symbol, sort_order")
    .eq("platform_id", platformId)
    .order("sort_order");
  return data || [];
}

async function fetchPlatformApps(platformId) {
  // Step 1: Get app IDs for this platform
  const { data: links } = await supabase
    .from("app_platforms")
    .select("app_id")
    .eq("platform_id", platformId);
  if (!links?.length) return [];
  const appIds = links.map((l) => l.app_id);

  // Step 2: Fetch apps, sections, modifiers, categories in parallel
  const [apps, sections, modSymbols, catData] = await Promise.all([
    batchIn("apps", "id", appIds, "id, slug, display_name, category_id, icon_url, sort_order, docs_url"),
    supabase
      .from("sections")
      .select("id, app_id, name, sort_order")
      .in("app_id", appIds)
      .eq("platform_id", platformId)
      .order("sort_order")
      .then((r) => r.data || []),
    fetchModifierSymbols(platformId),
    supabase.from("categories").select("id, display_name").then((r) => r.data || []),
  ]);

  if (!apps.length) return [];
  apps.sort((a, b) => a.sort_order - b.sort_order);

  const modMap = Object.fromEntries(modSymbols.map((m) => [m.modifier, m.symbol]));
  const catMap = Object.fromEntries(catData.map((c) => [c.id, c.display_name]));
  const sectionIds = sections.map((s) => s.id);

  // Step 3: Fetch shortcuts
  const shortcuts = await batchIn(
    "shortcuts", "section_id", sectionIds,
    "section_id, modifiers, key, action_key, sort_order"
  );

  // Step 4: Fetch translations
  const actionKeys = [...new Set(shortcuts.map((s) => s.action_key))];
  const translations = await batchIn(
    "translations", "key", actionKeys,
    "key, value",
    (q) => q.eq("language", "en")
  );
  const transMap = Object.fromEntries(translations.map((t) => [t.key, t.value]));

  // Assemble
  const shortcutsBySection = {};
  for (const sc of shortcuts) {
    (shortcutsBySection[sc.section_id] ||= []).push({
      modifiers: sc.modifiers.map((m) => modMap[m] || m),
      key: sc.key,
      action: transMap[sc.action_key] || sc.action_key,
    });
  }

  const sectionsByApp = {};
  for (const sec of sections) {
    (sectionsByApp[sec.app_id] ||= []).push({
      name: sec.name,
      shortcuts: shortcutsBySection[sec.id] || [],
    });
  }

  return apps.map((app) => {
    const appSections = sectionsByApp[app.id] || [];
    return {
      slug: app.slug,
      displayName: app.display_name,
      category: catMap[app.category_id] || app.category_id,
      shortcutCount: appSections.reduce((sum, s) => sum + s.shortcuts.length, 0),
      iconUrl: app.icon_url,
      docsUrl: app.docs_url,
      sections: appSections,
    };
  });
}

function buildManifest(platforms, modSymbolsByPlatform, allApps) {
  const platformIconMap = { macos: "apple.png", windows: "windows.png", linux: "linux.png" };

  // Build category sets per platform from the fetched apps
  const categoriesByPlatform = {};
  for (const p of platforms) {
    const apps = allApps[p.id] || [];
    categoriesByPlatform[p.id] = [...new Set(apps.map((a) => a.category))];
  }

  return {
    platforms: platforms.map((p) => ({
      id: p.id,
      displayName: p.display_name,
      icon: platformIconMap[p.id] || null,
      modifierSymbols: (modSymbolsByPlatform[p.id] || []).map((s) => s.symbol),
      categories: categoriesByPlatform[p.id] || [],
    })),
  };
}

function buildOtherPlatforms(platformId, slug, platforms, allApps) {
  const others = [];
  for (const p of platforms) {
    if (p.id === platformId) continue;
    const apps = allApps[p.id] || [];
    if (apps.some((a) => a.slug === slug)) {
      others.push({ id: p.id, name: p.display_name });
    }
  }
  return others;
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log("=== Exporting data from Supabase ===\n");

  // Fetch platforms and categories
  const [platforms, categories] = await Promise.all([
    fetchPlatforms(),
    fetchCategories(),
  ]);
  console.log(`Platforms: ${platforms.map((p) => p.id).join(", ")}`);
  console.log(`Categories: ${categories.length}`);

  // Fetch modifier symbols for all platforms in parallel
  const modResults = await Promise.all(platforms.map((p) => fetchModifierSymbols(p.id)));
  const modSymbolsByPlatform = {};
  platforms.forEach((p, i) => { modSymbolsByPlatform[p.id] = modResults[i]; });

  // Fetch apps for all platforms in parallel
  console.log("\nFetching apps per platform...");
  const appResults = await Promise.all(platforms.map((p) => fetchPlatformApps(p.id)));
  const allApps = {};
  platforms.forEach((p, i) => { allApps[p.id] = appResults[i]; });

  // Build manifest
  const manifest = buildManifest(platforms, modSymbolsByPlatform, allApps);

  // Write files
  mkdirSync(PLATFORMS_DIR, { recursive: true });

  writeJSON(join(DATA_DIR, "platforms.json"), platforms);
  writeJSON(join(DATA_DIR, "categories.json"), categories);
  writeJSON(join(DATA_DIR, "manifest.json"), manifest);

  for (const p of platforms) {
    const apps = allApps[p.id];
    const otherPlatforms = {};
    for (const app of apps) {
      const others = buildOtherPlatforms(p.id, app.slug, platforms, allApps);
      if (others.length) otherPlatforms[app.slug] = others;
    }

    writeJSON(join(PLATFORMS_DIR, `${p.id}.json`), { apps, otherPlatforms });

    const shortcutCount = apps.reduce((sum, a) => sum + a.shortcutCount, 0);
    console.log(`  ${p.id}: ${apps.length} apps, ${shortcutCount} shortcuts`);
  }

  console.log("\n=== Export complete ===");
  console.log(`Files written to public/data/`);
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

main().catch((e) => {
  console.error("Export failed:", e.message);
  process.exit(1);
});
