const rootUrl = new URL("./", import.meta.url);
const basePathWithSlash = rootUrl.pathname.endsWith("/")
    ? rootUrl.pathname
    : `${rootUrl.pathname}/`;
const trimmedBase = basePathWithSlash === "/" ? "" : basePathWithSlash.replace(/\/$/, "");
export const basePath = trimmedBase;
export function withBase(path) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (!basePath) {
        return normalized;
    }
    return `${basePath}${normalized}`.replace(/\/{2,}/g, "/");
}
export function stripBase(pathname) {
    if (!basePath) {
        return pathname || "/";
    }
    if (pathname.startsWith(basePath)) {
        const stripped = pathname.slice(basePath.length);
        if (!stripped)
            return "/";
        return stripped.startsWith("/") ? stripped : `/${stripped}`;
    }
    return pathname || "/";
}
export function assetUrl(path) {
    const trimmed = path.replace(/^\/+/, "");
    return `${basePathWithSlash}${trimmed}`;
}
