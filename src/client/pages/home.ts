const app = document.getElementById("app") as HTMLElement;

export function showHome() {
    app.innerHTML = `
    <div class="home">
      <h1>Deutsch-Trainer</h1>
      <p class="subtitle">Wähle dein Niveau und eine Übung.</p>

      <div class="levels">

        <!-- A1 -->
        <section class="level">
          <details open>
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
  <details id="level-b1">
    <summary class="level-summary">
      <span class="level-badge">B1</span>
      <span class="level-title">Selbstständige Sprachverwendung</span>
      <span class="level-hint">Komplexere Sätze & Grammatik</span>
    </summary>
    <div class="level-cards" id="b1-cards">
      <!-- фиксированные карточки -->
      <a class="card-link" href="words/b1">
        <div class="card small muted">
          <h3>B1 Wortschatz</h3>
          <p>Bald verfügbar.</p>
        </div>
      </a>
      <a class="card-link" href="sentences/b1">
        <div class="card small">
          <h3>B1 Sätze bauen</h3>
          <p>Nebensätze mit obwohl, damit, usw.</p>
        </div>
      </a>
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
      <!-- сюда мы динамически ДОБАВИМ ещё карточки по тегам -->
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
}
