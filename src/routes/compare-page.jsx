import { useLoaderData } from "react-router";
import { CONTENT, buildMeta } from "../data/content";
import { getComparisonBySlug } from "../data/comparisons";
import { getPlatformApps } from "../utils/supabase.server";
import ComparePage from "../components/ComparePage";

export async function loader({ params }) {
  const comparison = getComparisonBySlug(params.slug);
  if (!comparison) throw new Response("Not Found", { status: 404 });

  const apps = await getPlatformApps(comparison.platform);
  const appA = apps.find(a => a.slug === comparison.slugA);
  const appB = apps.find(a => a.slug === comparison.slugB);
  if (!appA || !appB) throw new Response("Not Found", { status: 404 });

  return { appA, appB, comparison };
}

export function meta({ data }) {
  if (!data) return buildMeta(CONTENT.meta.catchAll);
  const { appA, appB } = data;
  return buildMeta(CONTENT.meta.compare(appA.displayName, appB.displayName));
}

export default function ComparePageRoute() {
  const { appA, appB, comparison } = useLoaderData();
  return <ComparePage appA={appA} appB={appB} comparison={comparison} />;
}
