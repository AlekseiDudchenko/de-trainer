import { Sentence } from "../types.js";
import { assetUrl } from "../config.js";

const app = document.getElementById("app") as HTMLElement;
const sentenceCache = new Map<string, Sentence[]>();
const pendingLoads = new Map<string, Promise<Sentence[]>>();

const SENTENCE_LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];

export async function showSentences(level?: string): Promise<void> {
  const lvl = (level ?? "A1").toLowerCase();
  console.log("pages/sentences.ts: showSentences called with level:", lvl);

  const sentences = lvl === "all" ? await loadAllLevels() : await loadOneLevel(lvl);

  if (!sentences || sentences.length === 0) {
    app.innerHTML = `<div class="card"><h2>Saetze</h2><p>Keine Daten.</p></div>`;
    return;
  }

  console.log("pages/sentences.ts: Loaded sentences:", sentences.length);

  const sent = sentences[Math.floor(Math.random() * sentences.length)];
  const rawTokens = normalizeTokens(sent.tokens);
  const shuffled = [...rawTokens].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="card">
      <h2>Satz bilden</h2>
      <p><small>Niveau: ${sent.level ?? level ?? "-"}</small></p>
      ${sent.translation_en ? `<p><small><b>${sent.translation_en}</b></small></p>` : ""}
      ${sent.translation_ru ? `<p><small>${sent.translation_ru}</small></p>` : ""}
      <div id="tokens"></div>
      <div id="drop" class="dropzone"></div>
      <button id="checkSentence">Pruefen</button>
      <button id="nextSentence">Weiter</button>
      <button id="resetSentence" style="display:none;">Zuruecksetzen</button>
      <p id="result"></p>
      <p><small>${sent.explanation ?? ""}</small></p>
    </div>
  `;

  const tokensDiv = document.getElementById("tokens") as HTMLDivElement;
  const drop = document.getElementById("drop") as HTMLDivElement;
  const checkBtn = document.getElementById("checkSentence") as HTMLButtonElement;
  const nextBtn = document.getElementById("nextSentence") as HTMLButtonElement;
  const resetBtn = document.getElementById("resetSentence") as HTMLButtonElement;
  const resultP = document.getElementById("result") as HTMLParagraphElement;

  let availableTokens = [...shuffled];
  let answerTokens: string[] = [];

  const renderTokens = () => {
    if (!tokensDiv || !drop) return;

    tokensDiv.innerHTML = "";
    availableTokens.forEach((t) => {
      const span = document.createElement("span");
      span.textContent = t;
      span.className = "token";
      span.onclick = () => {
        const idx = availableTokens.indexOf(t);
        if (idx >= 0) {
          availableTokens.splice(idx, 1);
          answerTokens.push(t);
          renderTokens();
        }
      };
      tokensDiv.appendChild(span);
    });

    drop.innerHTML = "";
    answerTokens.forEach((t) => {
      const span = document.createElement("span");
      span.textContent = t;
      span.className = "token";
      span.onclick = () => {
        const idx = answerTokens.indexOf(t);
        if (idx >= 0) {
          answerTokens.splice(idx, 1);
          availableTokens.push(t);
          renderTokens();
        }
      };
      drop.appendChild(span);
    });
  };

  renderTokens();

  let lastCorrect = false;
  let wasChecked = false;

  const doCheck = () => {
    const userStr = answerTokens.join(" ").trim();
    const targetStr = sent.target.trim();
    const norm = (s: string) => s.trim().replace(/[.?!]\s*$/, "");

    if (norm(userStr) === norm(targetStr)) {
      resultP.textContent = "Richtig!";
      drop.classList.remove("wrong");
      drop.classList.add("correct");
      lastCorrect = true;
      resetBtn.style.display = "none";
    } else {
      resultP.textContent = `Nicht ganz. Richtig: ${sent.target}`;
      drop.classList.remove("correct");
      drop.classList.add("wrong");
      lastCorrect = false;
      resetBtn.style.display = "inline-block";
    }
    wasChecked = true;
  };

  const cleanup = () => {
    document.removeEventListener("keydown", onKey);
  };

  const doNext = () => {
    cleanup();
    showSentences(level);
  };

  const doReset = () => {
    availableTokens = [...availableTokens, ...answerTokens];
    answerTokens = [];
    renderTokens();

    drop.classList.remove("wrong", "correct");
    resultP.textContent = "";
    lastCorrect = false;
    wasChecked = false;
    resetBtn.style.display = "none";
  };

  checkBtn.onclick = doCheck;
  nextBtn.onclick = doNext;
  resetBtn.onclick = doReset;

  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextBtn.click();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (!wasChecked) {
        checkBtn.click();
        return;
      }
      if (lastCorrect) {
        nextBtn.click();
      } else {
        resetBtn.click();
      }
    }
  };

  document.addEventListener("keydown", onKey);
}

async function loadOneLevel(lvl: string): Promise<Sentence[]> {
  const key = lvl.toLowerCase();

  if (sentenceCache.has(key)) {
    return sentenceCache.get(key)!;
  }
  if (pendingLoads.has(key)) {
    return pendingLoads.get(key)!;
  }

  const promise = fetch(assetUrl(`data/sentences-${key}.json`))
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load sentences-${key}.json`);
      }
      return res.json() as Promise<Sentence[]>;
    })
    .then((data) => {
      sentenceCache.set(key, data);
      return data;
    })
    .finally(() => {
      pendingLoads.delete(key);
    });

  pendingLoads.set(key, promise);
  return promise;
}

async function loadAllLevels(): Promise<Sentence[]> {
  const cacheKey = "all";
  if (sentenceCache.has(cacheKey)) {
    return sentenceCache.get(cacheKey)!;
  }
  if (pendingLoads.has(cacheKey)) {
    return pendingLoads.get(cacheKey)!;
  }

  const promise = Promise.all(SENTENCE_LEVELS.map((lvl) => loadOneLevel(lvl))).then((parts) => {
    const merged = parts.flat();
    sentenceCache.set(cacheKey, merged);
    return merged;
  }).finally(() => {
    pendingLoads.delete(cacheKey);
  });

  pendingLoads.set(cacheKey, promise);
  return promise;
}

function normalizeTokens(input: unknown): string[] {
  if (Array.isArray(input)) {
    if (input.length === 1 && typeof input[0] === "string") {
      return splitToWords(input[0]);
    }
    return input.map(String);
  }
  if (typeof input === "string") {
    return splitToWords(input);
  }
  return [];
}

function splitToWords(s: string): string[] {
  return s
    .replace(/,/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}




