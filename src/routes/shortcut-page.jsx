import { isRouteErrorResponse, useRouteError } from "react-router";
import { getPlatformApps, getPlatforms, getOtherPlatforms } from "../utils/supabase.server";
import { CONTENT, buildMeta } from "../data/content";
import NotFound from "../components/NotFound";
import ShortcutPage from "../components/ShortcutPage";

export async function loader({ params }) {
  const { platformId, slug } = params;
  const platforms = await getPlatforms();
  const valid = platforms.find((p) => p.id === platformId);
  if (!valid) throw new Response("Not Found", { status: 404 });

  const apps = await getPlatformApps(platformId);
  const app = apps.find((a) => a.slug === slug);
  if (!app) throw new Response("Not Found", { status: 404 });

  const otherPlatforms = await getOtherPlatforms(slug, platformId);

  return {
    platformId,
    platformName: valid.display_name,
    app,
    otherPlatforms,
  };
}

export function meta({ data }) {
  if (!data) {
    return buildMeta(CONTENT.meta.notFound);
  }
  const { app, platformName, platformId } = data;
  return buildMeta(CONTENT.meta.shortcutPage(app.displayName, platformName, app.shortcutCount, platformId, app.slug));
}

export default function ShortcutPageRoute() {
  return <ShortcutPage />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  throw error;
}
