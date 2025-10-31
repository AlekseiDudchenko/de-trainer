import { Sentence } from "../types.js";

const app = document.getElementById("app") as HTMLElement;

export async function showSentences(level?: string): Promise<void> {
  const lvl = (level ?? "A1").toLowerCase();
  const res = await fetch(`/api/sentences/${lvl}`);

  if (!res.ok) {
    app.innerHTML = `<div class="card"><h2>Sätze (${level ?? "A1"})</h2><p>Keine Daten.</p></div>`;
    return;
  }

  const sentences: Sentence[] = await res.json();
  const sent = sentences[Math.floor(Math.random() * sentences.length)];

  // 👇 нормализация токенов
  const rawTokens = Array.isArray(sent.tokens)
    ? sent.tokens
    : (sent.tokens as unknown as string).split(" ");

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

  shuffled.forEach((t) => {
    const span = document.createElement("span");
    span.textContent = t;
    span.className = "token";
    span.onclick = () => {
      const clone = span.cloneNode(true) as HTMLSpanElement;
      clone.onclick = () => drop.removeChild(clone);
      drop.appendChild(clone);
    };
    tokensDiv.appendChild(span);
  });

  let lastCorrect = false;
  let wasChecked = false;

  const doCheck = () => {
    const userTokens = Array.from(drop.querySelectorAll(".token")).map(
      (n) => n.textContent ?? ""
    );
    const userStr = userTokens.join(" ").trim();
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
    drop.innerHTML = "";
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
