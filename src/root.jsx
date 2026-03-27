import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from "react-router";
import { ThemeProvider } from "./hooks/useTheme";
import ErrorBoundary from "./components/ErrorBoundary";
import { CONTENT } from "./data/content";
import "./index.css";

const JSON_LD = JSON.stringify(CONTENT.structured.website);

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://pagead2.googlesyndication.com https://partner.googleadservices.com",
            // 'unsafe-inline' required: dynamic style attributes for runtime colors, flex widths, and sizing
            // cannot use nonces/hashes (CSP only supports those for <style> blocks, not style attributes)
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: https://hgxtwlynuixwwyjykiqd.supabase.co",
            "connect-src 'self' https://*.cloudflareinsights.com https://cloudflareinsights.com https://pagead2.googlesyndication.com https://hgxtwlynuixwwyjykiqd.supabase.co",
            "frame-src https://googleads.g.doubleclick.net",
            "object-src 'none'",
            "base-uri 'self'",
          ].join("; ")}
        />
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/images/app-icon.svg" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/images/app-icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F5F0E8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-adsense-account" content="ca-pub-7739329133284929" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
        />
        <link
          id="google-fonts"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
          media="print"
          suppressHydrationWarning
        />
        {/* Inline script to swap font media from print to all on load - content is a static string, not user input */}
        <script dangerouslySetInnerHTML={{ __html: "var f=document.getElementById('google-fonts');if(f)f.onload=function(){f.media='all'}" }} />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
            rel="stylesheet"
          />
        </noscript>
        <link rel="preload" href="/images/app-icon.svg" as="image" />

        {/* Open Graph defaults */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="KeyShortcut" />
        <meta
          property="og:image"
          content="https://keyshortcut.com/images/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://keyshortcut.com/images/og-image.png"
        />

        {/* JSON-LD WebSite — static content, safe to inline */}
        <script type="application/ld+json">{JSON_LD}</script>

        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />

        {/* Google AdSense (production only) */}
        {import.meta.env.PROD && import.meta.env.VITE_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Analytics: Cloudflare Web Analytics (production only) */}
        {import.meta.env.PROD && import.meta.env.VITE_CF_ANALYTICS_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${import.meta.env.VITE_CF_ANALYTICS_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  );
}

function NavigationLoader() {
  const { state } = useNavigation();
  if (state === "idle") return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-theme-border overflow-hidden">
      <div className="h-full bg-theme-accent animate-nav-loading" />
    </div>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      <div className="relative">
        <NavigationLoader />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export function HydrateFallback() {
  return <div className="min-h-screen" />;
}
