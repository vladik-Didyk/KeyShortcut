// Lightweight analytics wrapper for GA4, Microsoft Clarity, and PostHog.
// All three are consent-gated — nothing loads until initAnalytics() is called,
// which only happens after the user accepts the cookie banner.
// SSR-safe: every DOM/window access is guarded.
// Each tool is independent: omit its env var to disable it.

const GA4_ID = import.meta.env.VITE_GA4_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

const CONSENT_KEY = "cookie-consent";

let initialized = false;
let posthogInstance = null;

export function hasConsented() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

function injectGA4() {
  if (!GA4_ID) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // send_page_view: false — we fire page views manually via trackPageView so
  // client-side route changes get counted.
  window.gtag("config", GA4_ID, { send_page_view: false });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
}

function injectClarity() {
  if (!CLARITY_ID) return;
  // Microsoft Clarity official bootstrap snippet.
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_ID);
}

async function initPostHog() {
  if (!POSTHOG_KEY) return;
  // Dynamic import keeps posthog-js out of the initial client bundle and
  // out of any SSR evaluation path.
  const mod = await import("posthog-js");
  const posthog = mod.default;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // handled manually in trackPageView
    persistence: "localStorage+cookie",
  });
  posthogInstance = posthog;
}

export async function initAnalytics() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  initialized = true;
  injectGA4();
  injectClarity();
  await initPostHog();
}

export function trackPageView(path) {
  if (typeof window === "undefined") return;
  if (!hasConsented()) return;
  if (GA4_ID && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  if (posthogInstance) {
    posthogInstance.capture("$pageview", { $current_url: window.location.href });
  }
}

export function trackEvent(name, props = {}) {
  if (typeof window === "undefined") return;
  if (!hasConsented()) return;
  if (GA4_ID && window.gtag) window.gtag("event", name, props);
  if (posthogInstance) posthogInstance.capture(name, props);
}

export function optOut() {
  if (typeof window === "undefined") return;
  if (GA4_ID) window[`ga-disable-${GA4_ID}`] = true;
  if (posthogInstance) posthogInstance.opt_out_capturing();
}
