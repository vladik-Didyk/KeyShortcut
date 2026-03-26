import { CONTENT, buildMeta } from "../data/content";
import PrivacyPage from "../components/PrivacyPage";

export function meta() {
  return buildMeta(CONTENT.meta.privacy);
}

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
