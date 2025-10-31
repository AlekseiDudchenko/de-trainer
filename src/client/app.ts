type Word = {
  id: string;
  de: string;
  article?: string;
  ru: string;
  exampleDe?: string;
  exampleRu?: string;
  level?: string;
  tags?: string[];
};

type Sentence = {
  id: string;
  target: string;
  tokens: string[];
  type: "drag";
  explanation?: string;
  translation_en: string;
  level?: string;
};

type Gap = {
  id: number;
  sentence: string;
  answer: string;
};

const app = document.getElementById("app") as HTMLElement;

window.addEventListener("hashchange", handleRoute);
handleRoute(); // старт

function handleRoute() {
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

async function showWords(): Promise<void> {
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

async function showSentences(): Promise<void> {
  const res = await fetch("/api/sentences");
  const sentences: Sentence[] = await res.json();

  const sent = sentences[Math.floor(Math.random() * sentences.length)];
  const shuffled = [...sent.tokens].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="card">
      <h2>Make a sentence</h2>
      <p><small>Level: ${sent.level ?? "-"}</small></p>
      ${sent.translation_en ? `<p><small>EN: ${sent.translation_en}</small></p>` : ""}
      <div id="tokens"></div>
      <div id="drop" class="dropzone"></div>
      <button id="checkSentence">Check</button>
      <button id="nextSentence">Next</button>
      <p id="result"></p>
      <p><small>${sent.explanation ?? ""}</small></p>
    </div>
  `;

  const tokensDiv = document.getElementById("tokens") as HTMLDivElement;
  const drop = document.getElementById("drop") as HTMLDivElement;
  const checkBtn = document.getElementById("checkSentence") as HTMLButtonElement;
  const nextBtn = document.getElementById("nextSentence") as HTMLButtonElement;
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

  checkBtn.onclick = () => {
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
    } else {
      resultP.textContent = "❌ No. Correct: " + sent.target;
      drop.classList.remove("correct");
      drop.classList.add("wrong");
    }
  };

  nextBtn.onclick = () => showSentences();
}

async function showGaps(): Promise<void> {
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
