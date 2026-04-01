import { getManifest, getPlatformApps, getOtherPlatformsMap } from "../utils/supabase.server";
import { CONTENT, buildMeta } from "../data/content";
import DirectoryHomepage from "../components/DirectoryHomepage";

export function meta() {
  return buildMeta(CONTENT.meta.home);
}

export async function loader() {
  const [manifest, macosApps, otherPlatformsMap] = await Promise.all([
    getManifest(),
    getPlatformApps("macos"),
    getOtherPlatformsMap("macos"),
  ]);
  return {
    manifest,
    platformData: { platform: "macos", apps: macosApps, otherPlatformsMap },
    defaultPlatformId: "macos",
  };
}

export default function HomeRoute() {
  return <DirectoryHomepage />;
}
