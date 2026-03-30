import type { Config } from "@react-router/dev/config";
import { loadEnv } from "vite";

export default {
  appDirectory: "src",
  ssr: true,
  routeDiscovery: { mode: "initial" },
  async prerender() {
    const env = loadEnv("production", process.cwd(), "VITE_");
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
    const base = `${supabaseUrl}/rest/v1`;
    const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

    const paths = ["/", "/mac-hud", "/privacy", "/about"];

    // Get platforms
    const platforms = await fetch(`${base}/platforms?select=id&order=sort_order`, { headers }).then((r) => r.json());

    // Get all app slugs per platform
    for (const platform of platforms) {
      paths.push(`/${platform.id}`);
      const links = await fetch(`${base}/app_platforms?select=app_id&platform_id=eq.${platform.id}`, { headers }).then((r) => r.json());
      const appIds = links.map((l: { app_id: string }) => l.app_id);
      if (appIds.length) {
        const apps = await fetch(`${base}/apps?select=slug&id=in.(${appIds.join(",")})`, { headers }).then((r) => r.json());
        for (const app of apps) {
          paths.push(`/${platform.id}/${app.slug}`);
        }
      }
    }

    return paths;
  },
} satisfies Config;
