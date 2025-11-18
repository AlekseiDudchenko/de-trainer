import { getTagsForLevel } from "./sentences.js";
const app = document.getElementById("app");
export function showHome() {
    app.innerHTML = `
    <div class="home">
      <h1>Deutsch-Trainer</h1>
      <p class="subtitle">Wähle dein Niveau und eine Übung.</p>

      <div class="levels">

        <!-- A1 -->
        <section class="level">
          <details>
            <summary class="level-summary">
              <span class="level-badge">A1</span>
              <span class="level-title">Erste Schritte</span>
              <span class="level-hint">Grundwortschatz & einfache Sätze</span>
            </summary>
            <div class="level-cards">
              <a class="card-link" href="words/a1">
                <div class="card small">
                  <h3>A1 Wortschatz</h3>
                  <p>Alltägliche Wörter, Basisverben.</p>
                </div>
              </a>
              <a class="card-link" href="sentences/a1">
                <div class="card small">
                  <h3>A1 Sätze bauen</h3>
                  <p>Sehr einfacher Satzbau.</p>
                </div>
              </a>
            </div>
          </details>
        </section>

        <!-- A2 -->
        <section class="level">
          <details>
            <summary class="level-summary">
              <span class="level-badge">A2</span>
              <span class="level-title">Grundlagen vertiefen</span>
              <span class="level-hint">Mehr Wortschatz, einfache Nebensätze</span>
            </summary>
            <div class="level-cards">
              <a class="card-link" href="words/a2">
                <div class="card small muted">
                  <h3>A2 Wortschatz</h3>
                  <p>Bald verfügbar.</p>
                </div>
              </a>
              <a class="card-link" href="sentences/a2">
                <div class="card small">
                  <h3>A2 Sätze bauen</h3>
                  <p>Haupt- und Nebensätze.</p>
                </div>
              </a>
            </div>
          </details>
        </section>

        <!-- B1 -->
        <section class="level">
          <details id="level-b1" open>
            <summary class="level-summary">
              <span class="level-badge">B1</span>
              <span class="level-title">Selbstständige Sprachverwendung</span>
              <span class="level-hint">Komplexere Sätze & Grammatik</span>
            </summary>

            <div class="sublevels">

              <!-- B1: Wörter -->
              <section class="sublevel">
                <details>
                  <summary class="sublevel-summary">
                    <span class="sublevel-title">Wörter</span>
                    <span class="sublevel-hint">Bald nach Themen (Tags)</span>
                  </summary>
                  <div class="level-cards" id="b1-words-cards">
                    <a class="card-link" href="words/b1">
                      <div class="card small muted">
                        <h3>B1 Wortschatz (alles)</h3>
                        <p>Gesamter Wortschatz B1. Bald thematisch gefiltert.</p>
                      </div>
                    </a>
                  </div>
                </details>
              </section>

              <!-- B1: Sätze bauen -->
              <section class="sublevel">
                <details open>
                  <summary class="sublevel-summary">
                    <span class="sublevel-title">Sätze bauen</span>
                    <span class="sublevel-hint">nach Grammatik-Themen (Tags)</span>
                  </summary>
                  <div class="level-cards" id="b1-sentences-cards">
                    <a class="card-link" href="sentences/b1">
                      <div class="card small">
                        <h3>B1 Sätze (gemischt)</h3>
                        <p>Nebensätze mit obwohl, damit, usw.</p>
                      </div>
                    </a>
                    <!-- сюда динамически прилетят карточки по тегам -->
                  </div>
                </details>
              </section>

              <!-- B1: Grammatik -->
              <section class="sublevel">
                <details open>
                  <summary class="sublevel-summary">
                    <span class="sublevel-title">Grammatik</span>
                    <span class="sublevel-hint">Strukturen & Artikel</span>
                  </summary>
                  <div class="level-cards" id="b1-grammar-cards">
                    <a class="card-link" href="grammar/b1/relativpronomen-gap">
                      <div class="card small">
                        <h3>Artikel im Relativsatz</h3>
                        <p>Lücke mit der/die/das/den ... füllen</p>
                      </div>
                    </a>
                    <a class="card-link" href="grammar/artikel">
                      <div class="card small">
                        <h3>Artikel einsetzen</h3>
                        <p>der / die / das auswählen</p>
                      </div>
                    </a>
                  </div>
                </details>
              </section>

            </div>
          </details>
        </section>

        <!-- B2 -->
        <section class="level">
          <details>
            <summary class="level-summary">
              <span class="level-badge">B2</span>
              <span class="level-title">Fortgeschritten</span>
              <span class="level-hint">Längere Sätze & anspruchsvollere Texte</span>
            </summary>
            <div class="level-cards">
              <a class="card-link" href="sentences/b2">
                <div class="card small">
                  <h3>B2 Sätze bauen</h3>
                  <p>Geschäfts- und Fachsprache.</p>
                </div>
              </a>
              <a class="card-link" href="grammar-passiv">
                <div class="card small muted">
                  <h3>Passiv</h3>
                  <p>Bald verfügbar.</p>
                </div>
              </a>
            </div>
          </details>
        </section>

        <!-- C1 / C2 -->
        <section class="level">
          <details>
            <summary class="level-summary">
              <span class="level-badge">C1–C2</span>
              <span class="level-title">Sehr fortgeschritten</span>
              <span class="level-hint">Abstrakte & wissenschaftliche Sprache</span>
            </summary>
            <div class="level-cards">
              <a class="card-link" href="words/c1">
                <div class="card small muted">
                  <h3>C1–C2 Wortschatz</h3>
                  <p>Fortgeschrittene Wörter.</p>
                </div>
              </a>
              <a class="card-link" href="sentences/c1">
                <div class="card small">
                  <h3>C1 Sätze bauen</h3>
                  <p>Komplexe Strukturen, Konjunktiv.</p>
                </div>
              </a>
              <a class="card-link" href="sentences/c2">
                <div class="card small">
                  <h3>C2 Sätze bauen</h3>
                  <p>Wissenschaftssprache, Abstraktion.</p>
                </div>
              </a>
              <a class="card-link" href="grammar-prep">
                <div class="card small muted">
                  <h3>Präpositionen</h3>
                  <p>mit Dativ / mit Akkusativ (bald verfügbar).</p>
                </div>
              </a>
            </div>
          </details>
        </section>

      </div>
    </div>
  `;
    renderB1SentenceTagCards();
}
function prettyTagName(tag) {
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
async function renderB1SentenceTagCards() {
    const container = document.getElementById("b1-sentences-cards");
    if (!container)
        return;
    let tags;
    try {
        tags = await getTagsForLevel("b1");
    }
    catch (e) {
        console.error("renderB1SentenceTagCards failed:", e);
        return;
    }
    if (!tags.length)
        return;
    tags.sort((a, b) => a.localeCompare(b));
    for (const tag of tags) {
        const a = document.createElement("a");
        a.className = "card-link";
        // /sentences/b1/tag/<tag>
        a.href = `sentences/b1/tag/${tag}`;
        const card = document.createElement("div");
        card.className = "card small";
        card.innerHTML = `
      <h3>${prettyTagName(tag)}</h3>
      <p>Sätze bauen nur mit diesem Thema.</p>
    `;
        a.appendChild(card);
        container.appendChild(a);
    }
}
