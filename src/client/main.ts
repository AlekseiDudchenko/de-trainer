import { handleRoute } from "./router.js";

// Handle back/forward
window.addEventListener("popstate", handleRoute);

// Intercept internal links <a href="/..."> to avoid full reload
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
  if (!a) return;

  const url = new URL(a.href, location.origin);
  const isSameOrigin = url.origin === location.origin;
  const isApi = url.pathname.startsWith("/api/");
  const isFile = url.pathname.includes("."); // /main.js, /style.css

  if (isSameOrigin && !isApi && !isFile) {
    e.preventDefault();
    history.pushState(null, "", url.pathname + url.search + url.hash);
    handleRoute();
  }
});

window.addEventListener("load", handleRoute);
handleRoute();
