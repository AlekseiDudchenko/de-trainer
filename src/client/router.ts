import { showHome } from "./pages/home.js";
import { showWords } from "./pages/words.js";
import { showSentences } from "./pages/sentences.js";
import { showGaps } from "./pages/gaps.js";
import { showTodo } from "./pages/todo.js";
import { Level } from "./types.js";
import e from "express";

function matchPath(re: RegExp): RegExpMatchArray | null {
  return location.pathname.match(re);
}

export function navigate(to: string) {
  if (location.pathname === to) {
    handleRoute();
  } else {
    history.pushState(null, "", to);
    handleRoute();
  }
}

export function handleRoute() {
  // examples:
  // "/"                       -> home
  // "/words"                  -> words (default level)
  // "/words/a1"               -> words A1 (if you support it)
  // "/sentences"              -> sentences (all)
  // "/sentences/a2"           -> sentences A2
  // "/gaps"                   -> gaps
  const p = location.pathname;
  console.log("router.ts: handleRoute for path:", p);

  // Home
  if (p === "/" || p === "/home") return showHome();

  // Words
  if (p === "/words") return showWords();
  const mWords = matchPath(/^\/words\/([a-z0-9]+)$/i);
  if (mWords) {
    // If/when you support levels for words:
    const level = mWords[1].toUpperCase();
    return showWords(); // or showTodo until implemented
  }

  // Sentences
  if (p === "/sentences") return showSentences("all");
  const mSent = matchPath(/^\/sentences\/([a-z0-9]+)$/i);
  if (mSent && !mSent[1]) {
    return showSentences("all");
  }

  const raw = mSent?.[1]?.toUpperCase();
  if (raw && ["A1","A2","B1","B2","C1","C2"].includes(raw)) {
    return showSentences(raw as Level);
  }
 else if (raw) {
    return showTodo(`Sätze – Niveau ${raw} (nicht unterstützt)`);
  }

  // Grammar 
  if (p === "/grammar/b1/relativpronomen-gap") return showGaps();
  
  if (p === "/grammar/artikel") return showTodo("Grammatik – Artikel einsetzen");

  // Grammar placeholders
  const mGram = matchPath(/^\/grammar-(.+)$/i);
  if (mGram) return showTodo(`Grammatik – ${mGram[1]} (bald verfügbar)`);

  // 404
  return showTodo("Seite nicht gefunden");
}
