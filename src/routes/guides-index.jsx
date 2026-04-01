import { CONTENT, buildMeta } from "../data/content";
import GuidesIndex from "../components/GuidesIndex";

export function meta() {
  return buildMeta(CONTENT.meta.guidesIndex);
}

export default function GuidesIndexRoute() {
  return <GuidesIndex />;
}
