import { Gap } from "../types";

const app = document.getElementById("app") as HTMLElement;

export async function showGaps(): Promise<void> {
  console.log("pages/gaps.ts: showGaps called");
  const task = await loadGap();
  renderGap(task);

  async function loadGap(): Promise<Gap> {
    const res = await fetch("/api/gaps/one");
    return (await res.json()) as Gap;
  }

  async function renderGap(g: Gap) {
    app.innerHTML = `
      <div class="card">
        <h2>Type missing word</h2>
        <p>${g.sentence}</p>
        <input id="gapInput" type="text" placeholder="type the word" />
        <button id="checkGap">Check</button>
        <button id="nextGapBtn">Next</button>
        <p id="gapResult"></p>
      </div>
    `;

    const input = document.getElementById("gapInput") as HTMLInputElement;
    const checkBtn = document.getElementById("checkGap") as HTMLButtonElement;
    const nextBtn = document.getElementById("nextGapBtn") as HTMLButtonElement;
    const result = document.getElementById("gapResult") as HTMLParagraphElement;

    let lastCorrect = false;

    const doCheck = () => {
      const user = input.value.trim();
      if (user.toLowerCase() === g.answer.toLowerCase()) {
        result.textContent = "✅ Correct!";
        result.className = "correct";
        lastCorrect = true;
      } else {
        result.textContent = `❌ Wrong. Correct: ${g.answer}`;
        result.className = "wrong";
        lastCorrect = false;
      }
    };

    const doNext = async () => {
      const newTask = await loadGap();
      renderGap(newTask);
    };

    checkBtn.onclick = doCheck;
    nextBtn.onclick = doNext;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (lastCorrect) {
          nextBtn.click();
        } else {
          checkBtn.click();
        }
      }
    });

    input.focus();
  }
}
