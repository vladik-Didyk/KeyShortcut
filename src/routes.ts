import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  layout("./layouts/directory-layout.jsx", [
    index("./routes/home.jsx"),
    route("privacy", "./routes/privacy.jsx"),
    route("about", "./routes/about.jsx"),
    route("guides", "./routes/guides-index.jsx"),
    route("guides/:slug", "./routes/guide-page.jsx"),
    route("cheat-sheets", "./routes/cheat-sheets.jsx"),
    route("compare", "./routes/compare-index.jsx"),
    route("compare/:slug", "./routes/compare-page.jsx"),
    route(":platformId", "./routes/platform-index.jsx"),
    route(":platformId/:slug", "./routes/shortcut-page.jsx"),
  ]),
  route("mac-hud", "./routes/product-page.jsx"),
  route("directory", "./routes/redirect-directory.jsx"),
  route("shortcuts/*", "./routes/redirect-legacy.jsx"),
  route("*", "./routes/catch-all.jsx"),
] satisfies RouteConfig;
