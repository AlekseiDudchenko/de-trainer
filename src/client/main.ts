import { handleRoute } from "./router";

window.addEventListener("hashchange", handleRoute);
handleRoute();
