import { Sentence } from "../types.js";

const app = document.getElementById("app") as HTMLElement;

export async function showSentences(): Promise<void> {
  const res = await fetch("/api/sentences");
  const sentences: Sentence[] = await res.json();

  const sent = sentences[Math.floor(Math.random() * sentences.length)];
  const shuffled = [...sent.tokens].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="card">
      <h2>Make a sentence</h2>
      <p><small>Level: ${sent.level ?? "-"}</small></p>
      ${sent.translation_en ? `<p><small><b>${sent.translation_en}</b></small></p>` : ""}
      <div id="tokens"></div>
      <div id="drop" class="dropzone"></div>
      <button id="checkSentence">Check</button>
      <button id="nextSentence">Next</button>
      <button id="resetSentence" style="display:none;">Reset</button>
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
      clone.onclick = () => {
        drop.removeChild(clone);
      };
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
      resultP.textContent = "✅ Correct!";
      drop.classList.remove("wrong");
      drop.classList.add("correct");
      lastCorrect = true;
      resetBtn.style.display = "none";
    } else {
      resultP.textContent = "❌ No. Correct: " + sent.target;
      drop.classList.remove("correct");
      drop.classList.add("wrong");
      lastCorrect = false;
      resetBtn.style.display = "inline-block";
    }
    wasChecked = true;
  };

  const doNext = () => {
    document.removeEventListener("keydown", onKey);
    showSentences();
  };

  const doReset = () => {
    drop.innerHTML = "";
    drop.classList.remove("wrong", "correct");
    resultP.textContent = "";
    lastCorrect = false;
    resetBtn.style.display = "none";
    wasChecked = false;
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
