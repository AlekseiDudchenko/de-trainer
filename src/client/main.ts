import { handleRoute } from "./router.js";

window.addEventListener("hashchange", handleRoute);
handleRoute();
