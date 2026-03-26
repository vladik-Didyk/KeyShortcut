import { isRouteErrorResponse, useRouteError } from "react-router";
import { CONTENT, buildMeta } from "../data/content";
import Navbar from "../components/Navbar";
import NotFound from "../components/NotFound";
import Footer from "../components/Footer";

export function meta() {
  return buildMeta(CONTENT.meta.catchAll);
}

export function loader() {
  throw new Response("Not Found", { status: 404 });
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <Navbar />
        <NotFound />
        <Footer />
      </>
    );
  }

  throw error;
}
