import { showHome } from "./pages/home.js";
import { showWords } from "./pages/words.js";
import { showSentences } from "./pages/sentences.js";
import { showGaps } from "./pages/gaps.js";
import { showTodo } from "./pages/todo.js";

export function handleRoute() {
  const hash = window.location.hash || "#/";
  switch (hash) {
    case "#/":
    case "#/home":
      showHome();
      break;

    // Wörter
    case "#/words":
    case "#/words-a1":
      showWords();
      break;
    case "#/words-a2":
    case "#/words-b1":
    case "#/words-c1":
      showTodo("Wortschatz – bald verfügbar");
      break;

    // Sätze
    case "#/sentences":
      showSentences(); //all levels
    case "#/sentences-a1":
      showSentences("A1");
      break;
    case "#/sentences-a2":
      showSentences("A2");
      break;
    case "#/sentences-b1":
      showTodo("Satztraining – bald verfügbar");
      break;

    // Gaps / Artikel
    case "#/gaps":
      showGaps();
      break;

    // Grammatik
    case "#/grammar-nominativ":
    case "#/grammar-passiv":
    case "#/grammar-prep":
      showTodo("Grammatik – bald verfügbar");
      break;

    default:
      showHome();
  }
}
