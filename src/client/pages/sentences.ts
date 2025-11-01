import { Sentence } from "../types.js";

const app = document.getElementById("app") as HTMLElement;

export async function showSentences(level?: string): Promise<void> {
  const lvl = (level ?? "A1").toLowerCase();

  console.log("Selected level:", lvl);

  const sentences =
    lvl === "all"
      ? await loadAllLevels()
      : await loadOneLevel(lvl);

  if (!sentences || sentences.length === 0) {
    app.innerHTML = `<div class="card"><h2>Sätze</h2><p>Keine Daten.</p></div>`;
    return;
  }

  console.log("Loaded sentences:", sentences.length);

  const sent = sentences[Math.floor(Math.random() * sentences.length)];
  const rawTokens = normalizeTokens(sent.tokens);
  const shuffled = [...rawTokens].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="card">
      <h2>Satz bilden</h2>
      <p><small>Niveau: ${sent.level ?? level ?? "-"}</small></p>
      ${sent.translation_en ? `<p><small><b>${sent.translation_en}</b></small></p>` : ""}
      <div id="tokens"></div>
      <div id="drop" class="dropzone"></div>
      <button id="checkSentence">Prüfen</button>
      <button id="nextSentence">Weiter</button>
      <button id="resetSentence" style="display:none;">Zurücksetzen</button>
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

  // Track which tokens are in suggestions vs answer
  let availableTokens = [...shuffled];
  let answerTokens: string[] = [];

  // Render both token areas
  const renderTokens = () => {
    if (!tokensDiv || !drop) return;
    
    // Clear and render available tokens
    tokensDiv.innerHTML = '';
    availableTokens.forEach(t => {
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

    // Clear and render answer tokens
    drop.innerHTML = '';
    answerTokens.forEach(t => {
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

  // Initial render
  renderTokens();

  let lastCorrect = false;
  let wasChecked = false;

  const doCheck = () => {
    const userStr = answerTokens.join(" ").trim();
    const targetStr = sent.target.trim();
    const norm = (s: string) => s.trim().replace(/[.?!]\s*$/, "");

    if (norm(userStr) === norm(targetStr)) {
      resultP.textContent = "✅ Richtig!";
      drop.classList.remove("wrong");
      drop.classList.add("correct");
      lastCorrect = true;
      resetBtn.style.display = "none";
    } else {
      resultP.textContent = "❌ Nicht ganz. Richtig: " + sent.target;
      drop.classList.remove("correct");
      drop.classList.add("wrong");
      lastCorrect = false;
      resetBtn.style.display = "inline-block";
    }
    wasChecked = true;
  };

  const doNext = () => {
    document.removeEventListener("keydown", onKey);
    showSentences(level);
  };

  const doReset = () => {
    // Move all tokens back to available
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

/* ===== helpers ===== */

async function loadOneLevel(lvl: string): Promise<Sentence[]> {
  const res = await fetch(`/api/sentences/${lvl}`);
  if (!res.ok) return [];
  return (await res.json()) as Sentence[];
}

async function loadAllLevels(): Promise<Sentence[]> {
  // какие уровни есть — жёстко задаём
  const levels = ["a1", "a2", "b1", "b2", "c1", "c2"];
  const results: Sentence[] = [];

  for (const l of levels) {
    const res = await fetch(`/api/sentences/${l}`);
    if (res.ok) {
      const part = (await res.json()) as Sentence[];
      results.push(...part);
    }
  }

  return results;
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
