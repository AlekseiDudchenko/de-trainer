import { showHome } from "./pages/home.js";
import { showWords } from "./pages/words.js";
import { showSentences } from "./pages/sentences.js";
import { showGaps } from "./pages/gaps.js";
import { showTodo } from "./pages/todo.js";
import { Level } from "./types.js";
import { stripBase, withBase } from "./config.js";

const SENTENCE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function currentPath(): string {
  const path = stripBase(location.pathname);
  return path || "/";
}

function matchPath(path: string, re: RegExp): RegExpMatchArray | null {
  return path.match(re);
}

export function navigate(to: string) {
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

  if (p === "/" || p === "/home") return showHome();

  if (p === "/words") return showWords();
  const mWords = matchPath(p, /^\/words\/([a-z0-9]+)$/i);
  if (mWords) {
    const level = mWords[1].toUpperCase();
    console.warn(`Words for level ${level} not yet implemented; showing default list.`);
    return showWords();
  }

  if (p === "/sentences") return showSentences("all");
  const mSent = matchPath(p, /^\/sentences\/([a-z0-9]+)$/i);
  if (mSent && !mSent[1]) {
    return showSentences("all");
  }

  const raw = mSent?.[1]?.toUpperCase();
  if (raw && SENTENCE_LEVELS.includes(raw)) {
    return showSentences(raw as Level);
  } else if (raw) {
    return showTodo(`Saetze - Niveau ${raw} (nicht unterstuetzt)`);
  }

  if (p === "/grammar/b1/relativpronomen-gap") return showGaps();
  if (p === "/grammar/artikel") return showTodo("Grammatik - Artikel einsetzen");

  const mGram = matchPath(p, /^\/grammar-(.+)$/i);
  if (mGram) return showTodo(`Grammatik - ${mGram[1]} (bald verfuegbar)`);

  return showTodo("Seite nicht gefunden");
}

