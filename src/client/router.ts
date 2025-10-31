import { showWords } from "./pages/words";
import { showSentences } from "./pages/sentences";
import { showGaps } from "./pages/gaps";

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
