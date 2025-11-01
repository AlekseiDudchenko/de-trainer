import { handleRoute } from "./router.js";

function boot() {
  handleRoute();

  // back/forward
  window.addEventListener("popstate", handleRoute, { once: false });

  // intercept internal <a> clicks
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
    if (!a) return;

    const url = new URL(a.href, location.origin);
    const sameOrigin = url.origin === location.origin;
    const isApi = url.pathname.startsWith("/api/");
    const isFile = url.pathname.includes(".");

    if (sameOrigin && !isApi && !isFile) {
      e.preventDefault();
      // only navigate if path/search/hash actually changes
      const target = url.pathname + url.search + url.hash;
      const current = location.pathname + location.search + location.hash;
      if (target !== current) {
        history.pushState(null, "", target);
        handleRoute();
      }
    }
  });
}

// call boot once
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}