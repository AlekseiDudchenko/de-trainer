import { url } from "../config.js";
const app = document.getElementById("app");
const sentenceCache = new Map();
const pendingLoads = new Map();
// уровни, для которых потенциально есть файлы
const SENTENCE_LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const DEFAULT_LEVEL = "all";
export async function showSentences(level) {
    const lvl = (level ?? DEFAULT_LEVEL).toLowerCase();
    let sentences = [];
    try {
        sentences = lvl === "all" ? await loadAllLevels() : await loadOneLevel(lvl);
    }
    catch (e) {
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
    const tokensDiv = document.getElementById("tokens");
    const drop = document.getElementById("drop");
    const checkBtn = document.getElementById("checkSentence");
    const nextBtn = document.getElementById("nextSentence");
    const resetBtn = document.getElementById("resetSentence");
    const resultP = document.getElementById("result");
    let availableTokens = [...shuffled];
    let answerTokens = [];
    let doCheck;
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
        if (availableTokens.length === 0 && !wasChecked) {
            doCheck();
        }
    };
    doCheck = () => {
        const userStr = answerTokens.join(" ").trim();
        const norm = (s) => s.trim().replace(/[.?!]\s*$/, "");
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
            if (lastCorrect)
                nextBtn.click();
            else
                resetBtn.click();
        }
    };
    checkBtn.onclick = doCheck;
    nextBtn.onclick = doNext;
    resetBtn.onclick = doReset;
    document.addEventListener("keydown", onKey);
}
/* === загрузка данных ==================================================== */
async function loadOneLevel(lvl) {
    const key = lvl.toLowerCase();
    if (sentenceCache.has(key))
        return sentenceCache.get(key);
    if (pendingLoads.has(key))
        return pendingLoads.get(key);
    const p = (async () => {
        try {
            const res = await fetch(url(`data/sentences-${key}.json`), { cache: "no-store" });
            if (!res.ok) {
                console.warn(`sentences-${key}.json not found (${res.status})`);
                return [];
            }
            const data = (await res.json());
            const arr = Array.isArray(data) ? data : [];
            sentenceCache.set(key, arr);
            return arr;
        }
        catch (err) {
            console.error("loadOneLevel error:", key, err);
            return [];
        }
    })();
    pendingLoads.set(key, p);
    return p;
}
async function loadAllLevels() {
    const cacheKey = "all";
    if (sentenceCache.has(cacheKey))
        return sentenceCache.get(cacheKey);
    if (pendingLoads.has(cacheKey))
        return pendingLoads.get(cacheKey);
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
function normalizeTokens(input) {
    if (Array.isArray(input)) {
        if (input.length === 1 && typeof input[0] === "string") {
            return splitToWords(input[0]);
        }
        return input.map(String);
    }
    if (typeof input === "string")
        return splitToWords(input);
    return [];
}
function splitToWords(s) {
    return s
        .replace(/,/g, " ")
        .split(/\s+/)
        .map((w) => w.trim())
        .filter(Boolean);
}
