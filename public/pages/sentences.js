import { url } from "../config.js";
const app = document.getElementById("app");
const sentenceCache = new Map();
const pendingLoads = new Map();
const SENTENCE_LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
export async function showSentences(level) {
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
    <section class="sentences-screen">
      <article class="card card-sentence">
        <h2>Satz bilden</h2>
        <p><small>Niveau: ${sent.level ?? level ?? "-"}</small></p>
        ${sent.translation_en ? `<p><small><b>${sent.translation_en}</b></small></p>` : ""}
        ${sent.translation_ru ? `<p><small>${sent.translation_ru}</small></p>` : ""}

        <p class="sentence-text muted">${sent.explanation ?? ""}</p>

        <div id="drop" class="drop-zone"></div>
        <div id="tokens" class="tokens"></div>

        <div class="actions">
          <button id="checkSentence" type="button">Pruefen</button>
          <button id="nextSentence" type="button">Weiter</button>
          <button id="resetSentence" type="button" style="display:none;">Zuruecksetzen</button>
        </div>

        <p id="result"></p>
      </article>
    </section>
  `;
    const tokensDiv = document.getElementById("tokens");
    const drop = document.getElementById("drop");
    const checkBtn = document.getElementById("checkSentence");
    const nextBtn = document.getElementById("nextSentence");
    const resetBtn = document.getElementById("resetSentence");
    const resultP = document.getElementById("result");
    let availableTokens = [...shuffled];
    let answerTokens = [];
    const renderTokens = () => {
        if (!tokensDiv || !drop)
            return;
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
        const norm = (s) => s.trim().replace(/[.?!]\s*$/, "");
        if (norm(userStr) === norm(targetStr)) {
            resultP.textContent = "Richtig!";
            drop.classList.remove("wrong");
            drop.classList.add("correct");
            lastCorrect = true;
            resetBtn.style.display = "none";
        }
        else {
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
    const onKey = (e) => {
        if (e.repeat)
            return;
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
            }
            else {
                resetBtn.click();
            }
        }
    };
    document.addEventListener("keydown", onKey);
}
async function loadOneLevel(lvl) {
    const key = lvl.toLowerCase();
    if (sentenceCache.has(key)) {
        return sentenceCache.get(key);
    }
    if (pendingLoads.has(key)) {
        return pendingLoads.get(key);
    }
    const promise = fetch(url(`data/sentences-${key}.json`))
        .then((res) => {
        if (!res.ok)
            throw new Error(`Failed to load sentences-${key}.json`);
        return res.json();
    })
        .then((data) => {
        sentenceCache.set(key, data);
        return data;
    })
        .finally(() => {
        pendingLoads.delete(key);
    });
    async function loadAllLevels() {
        const cacheKey = "all";
        if (sentenceCache.has(cacheKey)) {
            return sentenceCache.get(cacheKey);
        }
        if (pendingLoads.has(cacheKey)) {
            return pendingLoads.get(cacheKey);
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
    function normalizeTokens(input) {
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
    function splitToWords(s) {
        return s
            .replace(/,/g, " ")
            .split(/\s+/)
            .map((w) => w.trim())
            .filter(Boolean);
    }
}
