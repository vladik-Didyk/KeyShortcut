import { CONTENT, buildMeta } from "../data/content";
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
import AdSlot from "../components/AdSlot";
import Footer from "../components/Footer";

export function meta() {
  return buildMeta(CONTENT.meta.productPage);
}

export default function ProductPageRoute() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <AdSlot adSlot="1234567890" />
        <Features />
        <Details />
        <ShortcutPreview />
        <AppCoverage />
        <AppGrid />
        <AdSlot adSlot="1234567891" />
        {/* <InteractiveKeyboard /> */}
        <FAQ />
        <AdSlot adSlot="1234567892" />
        <Policies />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
