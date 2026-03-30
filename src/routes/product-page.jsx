import { useLoaderData } from "react-router";
import { CONTENT, buildMeta } from "../data/content";
import { getPlatformApps, getCategories } from "../utils/supabase.server";
import { groupByCategories } from "../utils/platformHelpers";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Problem from "../components/Problem";
import Features from "../components/Features";
import Details from "../components/Details";
import ShortcutPreview from "../components/ShortcutPreview";
import AppCoverage from "../components/AppCoverage";
import AppGrid from "../components/AppGrid";
import FAQ from "../components/FAQ";
import Policies from "../components/Policies";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";

export function meta() {
  return buildMeta(CONTENT.meta.productPage);
}

export async function loader() {
  const [macosApps, categories] = await Promise.all([
    getPlatformApps("macos"),
    getCategories(),
  ]);
  const categoryOrder = categories.map((c) => c.display_name);
  const appCategories = groupByCategories(macosApps, categoryOrder).map(
    (group) => ({
      name: group.name,
      apps: group.apps.map(({ slug, displayName }) => ({ slug, displayName })),
    })
  );
  return { appCategories };
}

export default function ProductPageRoute() {
  const { appCategories } = useLoaderData();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Features />
        <Details />
        <ShortcutPreview />
        <AppCoverage />
        <AppGrid appCategories={appCategories} />
        <FAQ />
        <Policies />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
