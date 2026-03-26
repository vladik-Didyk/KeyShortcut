import { redirect } from "react-router";

const VALID_PLATFORMS = new Set(["macos", "windows", "linux"]);

export function loader({ params }) {
  const rest = params["*"];

  if (!rest) {
    return redirect("/macos", 301);
  }

  const parts = rest.split("/");

  if (VALID_PLATFORMS.has(parts[0])) {
    return redirect(`/${rest}`, 301);
  }

  return redirect(`/macos/${rest}`, 301);
}
