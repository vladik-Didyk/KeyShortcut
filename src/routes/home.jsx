import { getManifest, getPlatformApps } from "../utils/supabase.server";
import { CONTENT, buildMeta } from "../data/content";
import DirectoryHomepage from "../components/DirectoryHomepage";

export function meta() {
  return buildMeta(CONTENT.meta.home);
}

export async function loader() {
  const [manifest, macosApps] = await Promise.all([
    getManifest(),
    getPlatformApps("macos"),
  ]);
  return {
    manifest,
    platformData: { platform: "macos", apps: macosApps },
    defaultPlatformId: "macos",
  };
}

export default function HomeRoute() {
  return <DirectoryHomepage />;
}
