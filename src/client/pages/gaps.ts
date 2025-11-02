import { Gap } from "../types.js";
import { assetUrl } from "../config.js";

const app = document.getElementById("app") as HTMLElement;

let gapsCache: Gap[] | null = null;
let gapsPending: Promise<Gap[]> | null = null;

async function loadAllGaps(): Promise<Gap[]> {
  if (gapsCache) {
    return gapsCache;
  }
  if (!gapsPending) {
    gapsPending = fetch(assetUrl("data/gaps.json"))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load gaps.json: ${res.status}`);
        }
        return res.json() as Promise<Gap[]>;
      })
      .then((data) => {
        gapsCache = data;
        return data;
      })
      .finally(() => {
        gapsPending = null;
      });
  }
  return gapsPending;
}

async function getRandomGap(): Promise<Gap> {
  const gaps = await loadAllGaps();
  if (!gaps.length) {
    throw new Error("No gaps available");
  }
  return gaps[Math.floor(Math.random() * gaps.length)];
}

export async function showGaps(): Promise<void> {
  console.log("pages/gaps.ts: showGaps called");
  const task = await getRandomGap();
  renderGap(task);

  async function renderGap(g: Gap) {
    app.innerHTML = `
      <section class="gaps-screen">
        <article class="card card-gap">
          <div class="card-gap__header">
            <h2>Type missing word</h2>
            <p class="card-gap__sentence">${g.sentence}</p>
          </div>

          <div class="card-gap__input">
            <input id="gapInput" type="text" placeholder="Type the word" autocomplete="off" />
          </div>

          <div class="card-gap__actions">
            <button id="checkGap" type="button">Check</button>
            <button id="nextGapBtn" type="button">Next</button>
          </div>

          <p id="gapResult" class="gap-result"></p>
        </article>
      </section>
    `;

    const input = document.getElementById("gapInput") as HTMLInputElement;
    const checkBtn = document.getElementById("checkGap") as HTMLButtonElement;
    const nextBtn = document.getElementById("nextGapBtn") as HTMLButtonElement;
    const result = document.getElementById("gapResult") as HTMLParagraphElement;
    result.className = "gap-result";
    result.textContent = "";

    let lastCorrect = false;

    const doCheck = () => {
      const user = input.value.trim();
      if (user.toLowerCase() === g.answer.toLowerCase()) {
        result.textContent = "Correct!";
        result.className = "gap-result correct";
        lastCorrect = true;
      } else {
        result.textContent = `Wrong. Correct: ${g.answer}`;
        result.className = "gap-result wrong";
        lastCorrect = false;
      }
    };

    const doNext = async () => {
      const newTask = await getRandomGap();
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

