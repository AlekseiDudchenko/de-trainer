import { handleRoute, navigate } from "./router.js";

function boot() {
  handleRoute();

  // back/forward
  window.addEventListener("popstate", handleRoute, { once: false });

  // intercept internal <a> clicks
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
    if (!a || a.target === "_blank") return;

    const rawHref = a.getAttribute("href");
    if (!rawHref) return;
    if (rawHref.startsWith("http") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      return;
    }
    if (rawHref.startsWith("#")) {
      return;
    }

    const route = (rawHref.startsWith("/") ? rawHref : `/${rawHref}`).replace(/\/{2,}/g, "/");
    e.preventDefault();
    navigate(route);
  });
}

// call boot once
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
