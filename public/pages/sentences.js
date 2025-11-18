import { url } from "../config.js";
const app = document.getElementById("app");
const sentenceCache = new Map();
const pendingLoads = new Map();
// levels available for sentences
const SENTENCE_LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"];
const DEFAULT_LEVEL = "all";
export async function getTagsForLevel(level) {
    const lvl = level.toLowerCase();
    const sentences = lvl === "all" ? await loadAllLevels() : await loadOneLevel(lvl);
    const set = new Set();
    for (const s of sentences) {
        if (!Array.isArray(s.tags))
            continue;
        for (const t of s.tags) {
            set.add(t);
        }
    }
    return Array.from(set);
}
export async function showSentences(level, tag) {
    const lvl = (level ?? DEFAULT_LEVEL).toLowerCase();
    let sentences = [];
    try {
        sentences = lvl === "all" ? await loadAllLevels() : await loadOneLevel(lvl);
    }
    catch (e) {
        console.error("load sentences failed:", e);
        sentences = [];
    }
    if (tag) {
        const tagLower = tag.toLowerCase();
        sentences = sentences.filter((s) => Array.isArray(s.tags) && s.tags.some((t) => t.toLowerCase() === tagLower));
    }
    if (!Array.isArray(sentences) || sentences.length === 0) {
        const tagPart = tag ? ` (Tag: ${formatTagLabel(tag)})` : "";
        app.innerHTML = `<section class="sentences-screen">
      <article class="card card-sentence">
        <h2>Sätze</h2>
        <p>Keine Daten${tagPart}.</p>
      </article>
    </section>`;
        return;
    }
    const sent = sentences[Math.floor(Math.random() * sentences.length)];
    const rawTokens = normalizeTokens(sent.tokens);
    const shuffled = [...rawTokens].sort(() => Math.random() - 0.5);
    const tagInfo = tag ? `, Thema: ${formatTagLabel(tag)}` : "";
    app.innerHTML = `
    <section class="sentences-screen">
      <article class="card card-sentence">
        <h2>Satz bilden</h2>
        <p><small>Niveau: ${sent.level ?? lvl}${tagInfo}</small></p>
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
    function moveToken(token, from, to, fromDiv, toDiv) {
        const idx = from.indexOf(token);
        if (idx >= 0) {
            from.splice(idx, 1);
            to.push(token);
            const tokenElem = Array.from(fromDiv.children).find((el) => el.textContent === token);
            if (tokenElem) {
                toDiv.appendChild(tokenElem);
            }
        }
    }
    const renderTokens = () => {
        if (!tokensDiv || !drop)
            return;
        if (tokensDiv.children.length === 0 && drop.children.length === 0) {
            availableTokens.forEach((t) => {
                const span = document.createElement("span");
                span.textContent = t;
                span.className = "token";
                span.onclick = () => moveToken(t, availableTokens, answerTokens, tokensDiv, drop);
                tokensDiv.appendChild(span);
            });
            answerTokens.forEach((t) => {
                const span = document.createElement("span");
                span.textContent = t;
                span.className = "token";
                span.onclick = () => moveToken(t, answerTokens, availableTokens, drop, tokensDiv);
                drop.appendChild(span);
            });
        }
        if (availableTokens.length === 0 && !wasChecked) {
            doCheck();
        }
    };
    doCheck = () => {
        const userStr = answerTokens.join(" ").trim();
        const norm = (s) => s.trim().replace(/[.?!]\s*$/, "");
        const correctStrings = [sent.target, ...(sent.alternatives ?? [])].map(norm);
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
    let lastCorrect = false;
    let wasChecked = false;
    renderTokens();
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
    const cleanup = () => {
        document.removeEventListener("keydown", onKey);
    };
    const doNext = () => {
        cleanup();
        void showSentences(level, tag);
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
function formatTagLabel(tag) {
    return tag
        .split("_")
        .map((part) => {
        const lower = part.toLowerCase();
        if (lower === "ii")
            return "II";
        return part.charAt(0).toUpperCase() + part.slice(1);
    })
        .join(" ");
}
