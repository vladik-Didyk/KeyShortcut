import { useLoaderData } from "react-router";
import { CONTENT, buildMeta } from "../data/content";
import { getPlatformApps, getCategories } from "../utils/supabase.server";
import { groupByCategories } from "../utils/platformHelpers";
import { APP_COUNT, PRICE, APP_STORE_URL, formatShortcutCount } from "../data/siteConfig";
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

/**
 * SoftwareApplication JSON-LD for Google rich results.
 * Safe: all values come from our own static siteConfig, not user input.
 */
const SOFTWARE_APP_JSONLD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KeyShortcut',
  operatingSystem: 'macOS',
  applicationCategory: 'UtilitiesApplication',
  description: `Floating keyboard shortcut panel for macOS. ${formatShortcutCount()} shortcuts across ${APP_COUNT} apps with active app detection, search, and custom shortcuts.`,
  url: 'https://keyshortcut.com/mac-hud',
  ...(APP_STORE_URL ? { downloadUrl: APP_STORE_URL } : {}),
  offers: {
    '@type': 'Offer',
    price: PRICE.replace('$', ''),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  screenshot: 'https://keyshortcut.com/images/og-image.png',
});

export default function ProductPageRoute() {
  const { appCategories } = useLoaderData();
  return (
    <div className="product-dark min-h-screen">
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
      {/* Safe: built from our own static siteConfig constants, not user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SOFTWARE_APP_JSONLD }} />
    </div>
  );
}
