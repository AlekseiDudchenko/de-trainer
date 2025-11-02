import { assetUrl } from "../config.js";
const app = document.getElementById("app");
const WORD_LEVELS = ["a1", "a2", "b1", "b2"];
const wordCache = new Map();
const pendingLevels = new Map();
let allWordsPromise = null;
async function loadLevel(level) {
    const key = level.toLowerCase();
    if (wordCache.has(key)) {
        return wordCache.get(key);
    }
    if (pendingLevels.has(key)) {
        return pendingLevels.get(key);
    }
    const promise = fetch(assetUrl(`data/words-${key}.json`))
        .then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to load words-${key}.json`);
        }
        return res.json();
    })
        .then((data) => {
        wordCache.set(key, data);
        return data;
    })
        .finally(() => {
        pendingLevels.delete(key);
    });
    pendingLevels.set(key, promise);
    return promise;
}
async function loadAllWords() {
    if (wordCache.has("all")) {
        return wordCache.get("all");
    }
    if (!allWordsPromise) {
        allWordsPromise = Promise.all(WORD_LEVELS.map((lvl) => loadLevel(lvl))).then((parts) => {
            const merged = parts.flat();
            wordCache.set("all", merged);
            return merged;
        });
    }
    return allWordsPromise;
}
function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}
export async function showWords(level) {
    const lvl = level?.toLowerCase();
    console.log("pages/words.ts: showWords called with level:", lvl ?? "all");
    let pool;
    if (lvl && WORD_LEVELS.includes(lvl)) {
        pool = await loadLevel(lvl);
    }
    else {
        pool = await loadAllWords();
    }
    if (!pool.length) {
        app.innerHTML = `<div class="card"><h2>Woerter</h2><p>Keine Daten.</p></div>`;
        return;
    }
    const word = pickRandom(pool);
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
    const showRuBtn = document.getElementById("showRu");
    const nextWordBtn = document.getElementById("nextWord");
    const answerP = document.getElementById("answer");
    showRuBtn.onclick = () => {
        answerP.textContent = `${word.article ? word.article + " " : ""}${word.ru}`;
    };
    nextWordBtn.onclick = () => showWords(level);
}
