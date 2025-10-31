const app = document.getElementById("app") as HTMLElement;

export function showTodo(title = "Bald verfügbar") {
  app.innerHTML = `
    <div class="card">
      <h2>${title}</h2>
      <p>Dieser Bereich wird bald hinzugefügt.</p>
      <p><a href="#/">Zur Startseite</a></p>
    </div>
  `;
}
