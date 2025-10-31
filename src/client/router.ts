import { showWords } from "./pages/words.js";
import { showSentences } from "./pages/sentences.js";
import { showGaps } from "./pages/gaps.js";

export function handleRoute() {
  const hash = window.location.hash || "#/words";
  switch (hash) {
    case "#/words":
      showWords();
      break;
    case "#/sentences":
      showSentences();
      break;
    case "#/gaps":
      showGaps();
      break;
    default:
      showWords();
  }
}
