import { Word } from "../types";

const app = document.getElementById("app") as HTMLElement;

export async function showWords(): Promise<void> {
  const res = await fetch("/api/words");
  const words: Word[] = await res.json();
  const word = words[Math.floor(Math.random() * words.length)];

  app.innerHTML = `
    <div class="card">
      <h2>${word.de}</h2>
      <p><i>${word.exampleDe ?? ""}</i></p>
      <div class="words-controls">
        <button id="showRu">Show translation</button>
        <button id="nextWord">Next</button>
      </div>
      <p id="answer" style="margin-top:12px;"></p>
    </div>
  `;

  const showRuBtn = document.getElementById("showRu") as HTMLButtonElement;
  const nextWordBtn = document.getElementById("nextWord") as HTMLButtonElement;
  const answerP = document.getElementById("answer") as HTMLParagraphElement;

  showRuBtn.onclick = () => {
    answerP.textContent = word.ru;
  };
  nextWordBtn.onclick = () => showWords();
}
