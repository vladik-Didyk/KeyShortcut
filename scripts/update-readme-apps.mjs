#!/usr/bin/env node
/**
 * Update the "Supported apps" section in README.md with current data from Supabase.
 * Replaces content between APP-DIRECTORY:START and APP-DIRECTORY:END markers.
 *
 * Usage: node scripts/update-readme-apps.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const README = join(ROOT, "README.md");

try { process.loadEnvFile(join(ROOT, ".env")); } catch { /* env vars from CI secrets */ }

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchData() {
  const [{ data: apps }, { data: links }, { data: categories }, { data: platforms }] =
    await Promise.all([
      supabase.from("apps").select("id, slug, display_name, category_id, icon_url, sort_order").order("sort_order"),
      supabase.from("app_platforms").select("app_id, platform_id"),
      supabase.from("categories").select("id, display_name, sort_order").order("sort_order"),
      supabase.from("platforms").select("id, display_name").order("sort_order"),
    ]);
  return { apps, links, categories, platforms };
}

const COLS = 8; // apps per row in the grid

function appCell(app, platformId) {
  const icon = app.icon_url || "";
  const url = `https://keyshortcut.com/${platformId}/${app.slug}`;
  return `<td align="center"><a href="${url}"><img src="${icon}" width="36" height="36" alt="${app.display_name}" /><br /><sub>${app.display_name}</sub></a></td>`;
}

function generateMarkdown({ apps, links, categories, platforms }) {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.display_name]));
  const catOrder = categories.map((c) => c.display_name);
  const lines = [];

  for (const platform of platforms) {
    const platformAppIds = new Set(
      links.filter((l) => l.platform_id === platform.id).map((l) => l.app_id)
    );
    const platformApps = apps.filter((a) => platformAppIds.has(a.id));

    // Group by category
    const catGroups = {};
    for (const app of platformApps) {
      const catName = catMap[app.category_id] || "Other";
      (catGroups[catName] ||= []).push(app);
    }

    const sortedCats = Object.keys(catGroups).sort(
      (a, b) => catOrder.indexOf(a) - catOrder.indexOf(b)
    );

    lines.push("<details>");
    lines.push(
      `<summary><strong>${platform.display_name}</strong> — ${platformApps.length} apps</summary>`
    );
    lines.push("");

    for (const cat of sortedCats) {
      const sorted = catGroups[cat].sort((a, b) =>
        a.display_name.localeCompare(b.display_name)
      );
      lines.push(`<h4>${cat}</h4>`);
      lines.push("");
      lines.push("<table>");

      for (let i = 0; i < sorted.length; i += COLS) {
        const row = sorted.slice(i, i + COLS);
        lines.push("<tr>");
        lines.push(row.map((a) => appCell(a, platform.id)).join(""));
        lines.push("</tr>");
      }

      lines.push("</table>");
      lines.push("");
    }

    lines.push("</details>");
    lines.push("");
  }

  return lines.join("\n").trim();
}

async function main() {
  console.log("Fetching app data from Supabase...");
  const data = await fetchData();
  console.log(
    `Found ${data.apps.length} apps, ${data.platforms.length} platforms, ${data.categories.length} categories`
  );

  const markdown = generateMarkdown(data);

  const readme = readFileSync(README, "utf-8");
  const startMarker = "<!-- APP-DIRECTORY:START — auto-generated, do not edit manually -->";
  const endMarker = "<!-- APP-DIRECTORY:END -->";

  const startIdx = readme.indexOf(startMarker);
  const endIdx = readme.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find APP-DIRECTORY markers in README.md");
    process.exit(1);
  }

  const updated =
    readme.slice(0, startIdx + startMarker.length) +
    "\n\n" +
    markdown +
    "\n\n" +
    readme.slice(endIdx);

  if (updated === readme) {
    console.log("README.md is already up to date.");
    return;
  }

  writeFileSync(README, updated);
  console.log("README.md updated with latest app directory.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
