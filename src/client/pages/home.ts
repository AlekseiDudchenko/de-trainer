const app = document.getElementById("app") as HTMLElement;

export function showHome() {
  app.innerHTML = `
    <div class="home">
      <h1>Deutsch-Trainer</h1>
      <p class="subtitle">Wähle einen Bereich aus.</p>

      <div class="columns">
        <!-- Spalte 1: Wörter -->
        <div class="col">
          <h2>Wörter</h2>
          <a class="card-link" href="#/words-a1">
            <div class="card small">
              <h3>A1 Wortschatz</h3>
              <p>Alltägliche Wörter, Basisverben.</p>
            </div>
          </a>
          <a class="card-link" href="#/words-a2">
            <div class="card small muted">
              <h3>A2 Wortschatz</h3>
              <p>Bald verfügbar.</p>
            </div>
          </a>
          <a class="card-link" href="#/words-b1">
            <div class="card small muted">
              <h3>B1 Wortschatz</h3>
              <p>Bald verfügbar.</p>
            </div>
          </a>
          <a class="card-link" href="#/words-c1">
            <div class="card small muted">
              <h3>C1–C2 Wortschatz</h3>
              <p>Fortgeschrittene Wörter.</p>
            </div>
          </a>
        </div>

        <!-- Spalte 2: Sätze -->
        <div class="col">
          <h2>Sätze</h2>
          <a class="card-link" href="#/sentences-a1">
            <div class="card small">
              <h3>A1 Sätze bauen</h3>
              <p>Einfacher Satzbau.</p>
            </div>
          </a>
          <a class="card-link" href="#/sentences-a2">
            <div class="card small">
              <h3>A2 Sätze bauen</h3>
              <p>Haupt- und Nebensätze.</p>
            </div>
          </a>
          <a class="card-link" href="#/sentences-b1">
            <div class="card small muted">
              <h3>B1 Sätze bauen</h3>
              <p>Bald verfügbar.</p>
            </div>
          </a>
          <a class="card-link" href="#/sentences">
            <div class="card small">
              <h3>Zufälliger Satz</h3>
              <p>Jetzt üben →</p>
            </div>
          </a>
        </div>

        <!-- Spalte 3: Artikel / Grammatik -->
        <div class="col">
          <h2>Artikel & Grammatik</h2>
          <a class="card-link" href="#/gaps">
            <div class="card small">
              <h3>Artikel einsetzen</h3>
              <p>der / die / das / den ...</p>
            </div>
          </a>
          <a class="card-link" href="#/grammar-nominativ">
            <div class="card small muted">
              <h3>Nominativ (Subjekt)</h3>
              <p>Erklärung + Beispiele.</p>
            </div>
          </a>
          <a class="card-link" href="#/grammar-passiv">
            <div class="card small muted">
              <h3>Passiv</h3>
              <p>Bald verfügbar.</p>
            </div>
          </a>
          <a class="card-link" href="#/grammar-prep">
            <div class="card small muted">
              <h3>Präpositionen</h3>
              <p>mit Dativ / mit Akkusativ.</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  `;
}
