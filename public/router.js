import { showHome } from "./pages/home.js";
import { showWords } from "./pages/words.js";
import { showSentences } from "./pages/sentences.js";
import { showGaps } from "./pages/gaps.js";
import { showTodo } from "./pages/todo.js";
import { stripBase, withBase } from "./config.js";
const SENTENCE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
function currentPath() {
    const path = stripBase(location.pathname);
    return path || "/";
}
function matchPath(path, re) {
    return path.match(re);
}
export function navigate(to) {
    const normalized = to.startsWith("/") ? to : `/${to}`;
    const absolute = withBase(normalized);
    if (location.pathname === absolute) {
        handleRoute();
        return;
    }
    history.pushState(null, "", absolute);
    handleRoute();
}
export function handleRoute() {
    const p = currentPath();
    console.log("router.ts: handleRoute for path:", p);
    // Home
    if (p === "/" || p === "/home")
        return showHome();
    // Wörter
    if (p === "/words")
        return showWords();
    const mWords = matchPath(p, /^\/words\/([a-z0-9]+)$/i);
    if (mWords) {
        const level = mWords[1].toUpperCase();
        console.warn(`Words for level ${level} not yet implemented; showing default list.`);
        return showWords();
    }
    // ===== Sätze =====
    // /sentences -> all levels, no tag
    if (p === "/sentences")
        return showSentences("all");
    // /sentences/tag/konjunktiv_ii_perfekt -> all levels, given tag
    const mSentTagOnly = matchPath(p, /^\/sentences\/tag\/([a-z0-9_]+)$/i);
    if (mSentTagOnly) {
        const tag = mSentTagOnly[1].toLowerCase();
        return showSentences("all", tag);
    }
    // /sentences/b1/tag/konjunktiv_ii_perfekt -> level + tag
    const mSentLevelTag = matchPath(p, /^\/sentences\/([a-z0-9]+)\/tag\/([a-z0-9_]+)$/i);
    if (mSentLevelTag) {
        const levelRaw = mSentLevelTag[1].toUpperCase();
        const tag = mSentLevelTag[2].toLowerCase();
        if (SENTENCE_LEVELS.includes(levelRaw)) {
            return showSentences(levelRaw, tag);
        }
        else {
            return showTodo(`Saetze - Niveau ${levelRaw} mit Tag ${tag} (nicht unterstuetzt)`);
        }
    }
    // /sentences/b1
    const mSentLevel = matchPath(p, /^\/sentences\/([a-z0-9]+)$/i);
    if (mSentLevel) {
        const levelRaw = mSentLevel[1].toUpperCase();
        if (SENTENCE_LEVELS.includes(levelRaw)) {
            return showSentences(levelRaw);
        }
        else {
            return showTodo(`Saetze - Niveau ${levelRaw} (nicht unterstuetzt)`);
        }
    }
    // ===== Grammatik =====
    if (p === "/grammar/b1/relativpronomen-gap")
        return showGaps();
    if (p === "/grammar/artikel")
        return showTodo("Grammatik - Artikel einsetzen");
    const mGram = matchPath(p, /^\/grammar-(.+)$/i);
    if (mGram)
        return showTodo(`Grammatik - ${mGram[1]} (bald verfuegbar)`);
    // 404
    return showTodo("Seite nicht gefunden");
}
