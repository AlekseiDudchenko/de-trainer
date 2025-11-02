export const IS_GH_PAGES = location.hostname.endsWith('github.io');
function normalizePath(p) {
    return p.endsWith('/') ? p : p + '/';
}
function detectBasePath() {
    const baseEl = document.querySelector('base[href]');
    if (baseEl) {
        const href = baseEl.getAttribute('href');
        const path = new URL(href, location.origin).pathname;
        return normalizePath(path);
    }
    return IS_GH_PAGES ? '/de-trainer/' : '/';
}
export const BASE = detectBasePath();
export const ORIGIN_BASE = new URL(BASE, location.origin);
export function url(p) {
    return new URL(p, ORIGIN_BASE).toString();
}
export function withBase(path) {
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    return (BASE + normalized).replace(/\/{2,}/g, '/');
}
export function stripBase(pathname) {
    if (!BASE || BASE === '/')
        return pathname || '/';
    if (pathname.startsWith(BASE)) {
        const rest = pathname.slice(BASE.length);
        return rest ? (rest.startsWith('/') ? rest : '/' + rest) : '/';
    }
    return pathname || '/';
}
export function assetUrl(path) {
    const trimmed = path.replace(/^\/+/, '');
    return new URL(trimmed, ORIGIN_BASE).toString();
}
export function isExternal(href) {
    try {
        const u = new URL(href, location.href);
        return u.origin !== location.origin;
    }
    catch {
        return false;
    }
}
