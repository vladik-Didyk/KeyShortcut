import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Disk + memory cache (survives HMR in dev) ───────────────
const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const isDev = import.meta.env.DEV;
const DISK_CACHE_DIR = isDev
  ? join(dirname(fileURLToPath(import.meta.url)), "../../node_modules/.cache/supabase")
  : null;

function readDiskCache(key) {
  if (!DISK_CACHE_DIR) return null;
  try {
    const file = join(DISK_CACHE_DIR, `${key.replace(/[:/]/g, "_")}.json`);
    const raw = readFileSync(file, "utf-8");
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch { /* miss */ }
  return null;
}

function writeDiskCache(key, data) {
  if (!DISK_CACHE_DIR) return;
  try {
    mkdirSync(DISK_CACHE_DIR, { recursive: true });
    const file = join(DISK_CACHE_DIR, `${key.replace(/[:/]/g, "_")}.json`);
    writeFileSync(file, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
}

function cached(key, fn) {
  const entry = _cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.promise;

  // Check disk cache (survives HMR restarts in dev)
  const disk = readDiskCache(key);
  if (disk) {
    const promise = Promise.resolve(disk);
    _cache.set(key, { promise, ts: Date.now() });
    return promise;
  }

  const promise = fn().then((result) => {
    writeDiskCache(key, result);
    return result;
  });
  _cache.set(key, { promise, ts: Date.now() });
  promise.catch(() => _cache.delete(key));
  return promise;
}

// ── Batch helper: run all batches in parallel ────────────────
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

// ── Query helpers ────────────────────────────────────────────

export function getPlatforms() {
  return cached("platforms", async () => {
    const { data } = await supabase
      .from("platforms")
      .select("id, display_name, icon_url, sort_order")
      .order("sort_order");
    return data || [];
  });
}

export function getModifierSymbols(platformId) {
  return cached(`modSymbols:${platformId}`, async () => {
    const { data } = await supabase
      .from("modifier_symbols")
      .select("modifier, symbol, sort_order")
      .eq("platform_id", platformId)
      .order("sort_order");
    return data || [];
  });
}

export function getCategories() {
  return cached("categories", async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, display_name, icon, color, sort_order")
      .order("sort_order");
    return data || [];
  });
}

function getCategoryMap() {
  return cached("catMap", async () => {
    const { data } = await supabase.from("categories").select("id, display_name");
    return Object.fromEntries((data || []).map((c) => [c.id, c.display_name]));
  });
}

/** Get all apps for a platform with sections and shortcuts */
export function getPlatformApps(platformId) {
  return cached(`platformApps:${platformId}`, async () => {
    // Step 1: Get app IDs
    const { data: links } = await supabase
      .from("app_platforms")
      .select("app_id")
      .eq("platform_id", platformId);
    if (!links?.length) return [];
    const appIds = links.map((l) => l.app_id);

    // Step 2: Fetch apps, sections, modifiers, categories — ALL IN PARALLEL
    const [apps, sections, modSymbols, catMap] = await Promise.all([
      batchIn("apps", "id", appIds, "id, slug, display_name, category_id, icon_url, sort_order, docs_url"),
      supabase
        .from("sections")
        .select("id, app_id, name, sort_order")
        .in("app_id", appIds)
        .eq("platform_id", platformId)
        .order("sort_order")
        .then((r) => r.data || []),
      getModifierSymbols(platformId),
      getCategoryMap(),
    ]);

    if (!apps.length) return [];
    apps.sort((a, b) => a.sort_order - b.sort_order);

    const modMap = Object.fromEntries(modSymbols.map((m) => [m.modifier, m.symbol]));
    const sectionIds = sections.map((s) => s.id);

    // Step 3: Fetch shortcuts (batched in parallel)
    const shortcuts = await batchIn(
      "shortcuts", "section_id", sectionIds,
      "section_id, modifiers, key, action_key, sort_order"
    );

    // Step 4: Fetch translations (batched in parallel)
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
  });
}

/** Get a single app by slug on a platform */
export async function getAppBySlug(platformId, slug) {
  const apps = await getPlatformApps(platformId);
  return apps.find((a) => a.slug === slug) || null;
}

/** Get manifest-like object (platforms with categories) */
export function getManifest() {
  return cached("manifest", async () => {
    const [platforms, allLinks, allApps, categories] = await Promise.all([
      getPlatforms(),
      supabase.from("app_platforms").select("app_id, platform_id").then((r) => r.data || []),
      supabase.from("apps").select("id, category_id").then((r) => r.data || []),
      supabase.from("categories").select("id, display_name, sort_order").order("sort_order").then((r) => r.data || []),
    ]);

    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.display_name]));
    const appById = Object.fromEntries(allApps.map((a) => [a.id, a]));

    const appCatByPlatform = {};
    for (const link of allLinks) {
      (appCatByPlatform[link.platform_id] ||= new Set());
      const app = appById[link.app_id];
      if (app) appCatByPlatform[link.platform_id].add(app.category_id);
    }

    // Fetch all modifier symbols in parallel
    const modResults = await Promise.all(platforms.map((p) => getModifierSymbols(p.id)));
    const modSymbolsByPlatform = {};
    platforms.forEach((p, i) => { modSymbolsByPlatform[p.id] = modResults[i].map((s) => s.symbol); });

    const platformIconMap = { macos: "apple.png", windows: "windows.png", linux: "linux.png" };

    return {
      platforms: platforms.map((p) => ({
        id: p.id,
        displayName: p.display_name,
        icon: platformIconMap[p.id] || null,
        modifierSymbols: modSymbolsByPlatform[p.id] || [],
        categories: [...(appCatByPlatform[p.id] || [])].map((cid) => catMap[cid] || cid),
      })),
    };
  });
}

/** Get platform index */
export async function getPlatformIndex() {
  const platforms = await getPlatforms();
  const allApps = await Promise.all(platforms.map((p) => getPlatformApps(p.id)));
  const index = {};
  platforms.forEach((p, i) => {
    index[p.id] = {
      appCount: allApps[i].length,
      shortcutCount: allApps[i].reduce((sum, a) => sum + a.shortcutCount, 0),
      slugs: allApps[i].map((a) => a.slug),
    };
  });
  return index;
}

/** Get other platforms an app exists on */
export async function getOtherPlatforms(slug, currentPlatformId) {
  const [{ data: app }, platforms] = await Promise.all([
    supabase.from("apps").select("id").eq("slug", slug).single(),
    getPlatforms(),
  ]);
  if (!app) return [];

  const { data: links } = await supabase
    .from("app_platforms")
    .select("platform_id")
    .eq("app_id", app.id)
    .neq("platform_id", currentPlatformId);
  if (!links?.length) return [];

  const platMap = Object.fromEntries(platforms.map((p) => [p.id, p.display_name]));
  return links.map((l) => ({ id: l.platform_id, name: platMap[l.platform_id] || l.platform_id }));
}

/** Get site config as object */
export async function getSiteConfig() {
  const { data } = await supabase.from("site_config").select("key, value");
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
}

/** Get CMS page content */
export async function getCmsPage(page, section) {
  const { data } = await supabase
    .from("cms_pages")
    .select("data")
    .eq("page", page)
    .eq("section", section)
    .single();
  return data?.data || null;
}

/** Get all CMS content for a page */
export async function getCmsPageAll(page) {
  const { data } = await supabase
    .from("cms_pages")
    .select("section, data")
    .eq("page", page);
  const result = {};
  for (const row of data || []) {
    result[row.section] = row.data;
  }
  return result;
}

/** Get FAQs */
export async function getFaqs() {
  const { data } = await supabase
    .from("faqs")
    .select("question, answer, sort_order")
    .eq("published", true)
    .order("sort_order");
  return data || [];
}

/** Get product features */
export async function getProductFeatures() {
  const { data } = await supabase
    .from("product_features")
    .select("title, description, screenshot_key, alt_text, sort_order")
    .eq("published", true)
    .order("sort_order");
  return (data || []).map((f) => ({
    title: f.title,
    description: f.description,
    screenshot: f.screenshot_key,
    alt: f.alt_text,
  }));
}

/** Get product details */
export async function getProductDetails() {
  const { data } = await supabase
    .from("product_details")
    .select("icon_name, title, description, sort_order")
    .eq("published", true)
    .order("sort_order");
  return (data || []).map((d) => ({
    icon: d.icon_name,
    title: d.title,
    description: d.description,
  }));
}

/** Get legal policies */
export async function getLegalPolicies() {
  const { data } = await supabase
    .from("legal_policies")
    .select("slug, title, effective_date, intro, content, sort_order")
    .eq("published", true)
    .order("sort_order");
  return data || [];
}
