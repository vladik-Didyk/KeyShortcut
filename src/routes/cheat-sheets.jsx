import { CONTENT, buildMeta } from "../data/content";
import { getPlatformApps, getPlatforms } from "../utils/supabase.server";
import CheatSheetsPage from "../components/CheatSheetsPage";

export function meta() {
  return buildMeta(CONTENT.meta.cheatSheets);
}

export async function loader() {
  const platforms = await getPlatforms();
  const allApps = [];
  for (const platform of platforms) {
    const apps = await getPlatformApps(platform.id);
    for (const app of apps) {
      // Avoid duplicates across platforms — keep the first occurrence
      if (!allApps.find(a => a.slug === app.slug && a.platformId === platform.id)) {
        allApps.push({
          slug: app.slug,
          displayName: app.displayName,
          category: app.category,
          shortcutCount: app.shortcutCount,
          platformId: platform.id,
          platformName: platform.display_name,
        });
      }
    }
  }
  return { apps: allApps, platforms };
}

export default function CheatSheetsRoute() {
  return <CheatSheetsPage />;
}
