import { CONTENT, buildMeta } from "../data/content";
import CompareIndex from "../components/CompareIndex";

export function meta() {
  return buildMeta(CONTENT.meta.compareIndex);
}

export default function CompareIndexRoute() {
  return <CompareIndex />;
}
