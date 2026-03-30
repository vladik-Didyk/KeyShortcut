import { CONTENT, buildMeta } from "../data/content";
import AboutPage from "../components/AboutPage";

export function meta() {
  return buildMeta(CONTENT.meta.about);
}

export default function AboutRoute() {
  return <AboutPage />;
}
