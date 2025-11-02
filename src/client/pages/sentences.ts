import { Sentence } from "../types.js";
import { url } from "../config.js";

const app = document.getElementById("app") as HTMLElement;

const sentenceCache = new Map<string, Sentence[]>();
const pendingLoads = new Map<string, Promise<Sentence[]>>();

// уровни, для которых потенциально есть файлы
const SENTENCE_LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
const DEFAULT_LEVEL = "all";


export async function showSentences(level?: string): Promise<void> {
  const lvl = (level ?? DEFAULT_LEVEL).toLowerCase();

  let sentences: Sentence[] = [];
  try {
    sentences = lvl === "all" ? await loadAllLevels() : await loadOneLevel(lvl);
  } catch (e) {
    console.error("load sentences failed:", e);
    sentences = [];
  }

  if (!Array.isArray(sentences) || sentences.length === 0) {
    app.innerHTML = `<section class="sentences-screen">
      <article class="card card-sentence">
        <h2>Sätze</h2>
        <p>Keine Daten.</p>
      </article>
    </section>`;
    return;
  }

  const sent = sentences[Math.floor(Math.random() * sentences.length)];
  const rawTokens = normalizeTokens(sent.tokens);
  const shuffled = [...rawTokens].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <section class="sentences-screen">
      <article class="card card-sentence">
        <h2>Satz bilden</h2>
        <p><small>Niveau: ${sent.level ?? lvl}</small></p>
        ${sent.translation_en ? `<p><small><b>${sent.translation_en}</b></small></p>` : ""}
        ${sent.translation_ru ? `<p><small>${sent.translation_ru}</small></p>` : ""}

        <div id="drop" class="drop-zone"></div>
        <div id="tokens" class="tokens"></div>

        <div class="sentence-actions">
          <button id="checkSentence" type="button">Check</button>
          <button id="nextSentence" type="button">Next</button>
          <button id="resetSentence" type="button" style="display:none;">Reset</button>
        </div>

        ${sent.explanation ? `<p class="sentence-text muted">${sent.explanation}</p>` : ""}
        <p id="result" aria-live="polite"></p>
      </article>
    </section>
  `;

  const tokensDiv = document.getElementById("tokens") as HTMLDivElement;
  const drop = document.getElementById("drop") as HTMLDivElement;
  const checkBtn = document.getElementById("checkSentence") as HTMLButtonElement;
  const nextBtn = document.getElementById("nextSentence") as HTMLButtonElement;
  const resetBtn = document.getElementById("resetSentence") as HTMLButtonElement;
  const resultP = document.getElementById("result") as HTMLParagraphElement;

  let availableTokens = [...shuffled];
  let answerTokens: string[] = [];

  let doCheck: () => void;

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

    if (availableTokens.length === 0 && !wasChecked) {
      doCheck();
    }
  };

  doCheck = () => {
    const userStr = answerTokens.join(" ").trim();
    const norm = (s: string) => s.trim().replace(/[.?!]\s*$/, "");

    const correctStrings = [
      sent.target,
      ...(sent.alternatives ?? [])
    ].map(norm);

    if (correctStrings.includes(norm(userStr))) {
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

  renderTokens();

  let lastCorrect = false;
  let wasChecked = false;

  const cleanup = () => document.removeEventListener("keydown", onKey);

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

  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === "ArrowRight") { e.preventDefault(); nextBtn.click(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      if (!wasChecked) { checkBtn.click(); return; }
      if (lastCorrect) nextBtn.click(); else resetBtn.click();
    }
  };

  checkBtn.onclick = doCheck;
  nextBtn.onclick = doNext;
  resetBtn.onclick = doReset;
  document.addEventListener("keydown", onKey);
}

/* === загрузка данных ==================================================== */

async function loadOneLevel(lvl: string): Promise<Sentence[]> {
  const key = lvl.toLowerCase();
  if (sentenceCache.has(key)) return sentenceCache.get(key)!;
  if (pendingLoads.has(key)) return pendingLoads.get(key)!;

  const p = (async () => {
    try {
      const res = await fetch(url(`data/sentences-${key}.json`), { cache: "no-store" });
      if (!res.ok) {
        console.warn(`sentences-${key}.json not found (${res.status})`);
        return [];
      }
      const data = (await res.json()) as unknown;
      const arr = Array.isArray(data) ? (data as Sentence[]) : [];
      sentenceCache.set(key, arr);
      return arr;
    } catch (err) {
      console.error("loadOneLevel error:", key, err);
      return [];
    }
  })();

  pendingLoads.set(key, p);
  return p;
}

async function loadAllLevels(): Promise<Sentence[]> {
  const cacheKey = "all";
  if (sentenceCache.has(cacheKey)) return sentenceCache.get(cacheKey)!;
  if (pendingLoads.has(cacheKey)) return pendingLoads.get(cacheKey)!;

  const p = Promise.allSettled(SENTENCE_LEVELS.map((lvl) => loadOneLevel(lvl)))
    .then((results) => results.flatMap((r) => (r.status === "fulfilled" ? r.value : [])))
    .then((merged) => {
      sentenceCache.set(cacheKey, merged);
      return merged;
    })
    .finally(() => pendingLoads.delete(cacheKey));

  pendingLoads.set(cacheKey, p);
  return p;
}

/* === утилиты ============================================================ */

function normalizeTokens(input: unknown): string[] {
  if (Array.isArray(input)) {
    if (input.length === 1 && typeof input[0] === "string") {
      return splitToWords(input[0]);
    }
    return input.map(String);
  }
  if (typeof input === "string") return splitToWords(input);
  return [];
}

function splitToWords(s: string): string[] {
  return s
    .replace(/,/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}
