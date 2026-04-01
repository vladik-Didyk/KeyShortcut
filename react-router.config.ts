import type { Config } from "@react-router/dev/config";
import { readFileSync } from "fs";
import { join } from "path";

export default {
  appDirectory: "src",
  ssr: true,
  routeDiscovery: { mode: "initial" },
  async prerender() {
    const dataDir = join(process.cwd(), "public/data");
    const paths = ["/", "/mac-hud", "/privacy", "/about", "/guides", "/cheat-sheets", "/compare"];

    // Guide pages — import slugs from guide data
    const { GUIDES } = await import("./src/data/guides/index.js");
    for (const guide of GUIDES) {
      paths.push(`/guides/${guide.slug}`);
    }

    // Comparison pages
    const { COMPARISONS } = await import("./src/data/comparisons.js");
    for (const c of COMPARISONS) {
      paths.push(`/compare/${c.slugA}-vs-${c.slugB}`);
    }

    // Platform + app pages from exported JSON
    const platforms: { id: string }[] = JSON.parse(
      readFileSync(join(dataDir, "platforms.json"), "utf-8")
    );

    for (const platform of platforms) {
      paths.push(`/${platform.id}`);
      const { apps }: { apps: { slug: string }[] } = JSON.parse(
        readFileSync(join(dataDir, `platforms/${platform.id}.json`), "utf-8")
      );
      for (const app of apps) {
        paths.push(`/${platform.id}/${app.slug}`);
      }
    }

    return paths;
  },
} satisfies Config;
