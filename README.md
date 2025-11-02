# Deutsch Trainer (Static SPA)

Deutsch Trainer is a single-page app for practising German vocabulary, sentence building, and gap-filling exercises. The app now runs entirely in the browser: it loads all content from static JSON files and requires no backend services, making it perfect for GitHub Pages or any static host.

---

## Features

- **Words practice** – random words with translations and example sentences.
- **Sentence builder** – drag-and-drop style reconstruction exercises with English and Russian translations where available.
- **Gap tasks** – fill in missing articles/words; keyboard friendly with Enter/Arrow shortcuts.
- **Responsive layout** – optimised for mobile viewports (full-screen gap cards, large touch targets).
- **Base path aware routing** – client-side navigation works when hosted in a subdirectory (e.g. GitHub Pages project sites).

---

## Project Structure

```
.
├── public/              # Production-ready static assets
│   ├── data/            # JSON datasets consumed by the SPA
│   ├── pages/           # Transpiled client modules (do not edit)
│   ├── config.js        # Base-path helper (generated)
│   ├── main.js          # SPA bootstrap (generated)
│   ├── router.js        # SPA router (generated)
│   ├── style.css        # Global styles
│   ├── index.html       # App entry (also copied to 404.html)
│   └── 404.html         # Redirect fallback for static hosts
├── src/
│   └── client/
│       ├── config.ts    # Base-path helpers (source)
│       ├── main.ts      # App bootstrap (source)
│       ├── router.ts    # Client router (source)
│       └── pages/       # Words/Sentences/Gaps/Home/Todo views (TS)
├── tsconfig.client.json # TypeScript config for client builds
├── package.json         # Minimal toolchain with TypeScript + helpers
└── README.md            # You are here
```

All TypeScript source files reside under `src/client/**`. Running the build emits ES modules into `public/`. Only edit the files in `src/client`; the generated JS in `public/` will be overwritten on build.

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)  
- npm (ships with Node)

### Install dependencies

```bash
npm install
```

### Build

Transpile the TypeScript client into `public/`:

```bash
npm run build
```

For continuous builds during development:

```bash
npm run watch
```

### Local preview

Serve the static output (requires `npx` which comes with npm):

```bash
npm run serve
```

This launches [`serve`](https://github.com/vercel/serve) on the default port (usually 3000). Visit `http://localhost:3000/`.  
> **Note:** When testing locally, use root-level URLs (e.g. `/`) or a SPA-friendly server that rewrites deep links to `/index.html`. GitHub Pages handles this via the bundled `404.html` redirect.

---

## Hosting on GitHub Pages

1. Build the project: `npm run build`  
2. Push the contents of `public/` to your `gh-pages` branch (or Configure Pages → “Deploy from branch” → `/public`).  
3. GitHub Pages automatically serves `index.html`; the included `404.html` routes deep links back into the SPA.  
4. Ensure links are relative (already handled) so assets load correctly under `https://username.github.io/repo-name/`.

---

## Development Notes

- **Datasets**: Update exercises by editing the JSON under `public/data`. Keep arrays consistent with the object shapes defined in `src/client/types.ts`.
- **Routing**: All navigation is handled client-side. Avoid adding `<a>` tags with absolute URLs unless they truly go out of the app.
- **Encoding**: Files are stored in UTF-8. When editing translations, prefer plain ASCII fallback (e.g. `Saetze`, `Woerter`) to avoid encoding glitches in tooling/build outputs.
- **Testing dynamic links**: When testing locally without rewrites, navigate from `/` – deep linking to `/sentences/b1` may 404 because the simple static server doesn’t rewrite. On GitHub Pages the 404 redirect covers this.

---

## Scripts Summary

| Script        | Description                                  |
|---------------|----------------------------------------------|
| `npm run build` | Compile TypeScript client into `public/`     |
| `npm run watch` | Watch-and-rebuild client source continuously |
| `npm run serve` | Serve the `public/` directory for preview     |

---

## Contributing / Customising

1. Edit TypeScript in `src/client/**` and styles in `public/style.css`.  
2. Run `npm run build` to regenerate the JS modules.  
3. Test locally via `npm run serve`.  
4. Commit the updated `public/` assets (GitHub Pages requires them).  

Feel free to extend the datasets, add new exercise pages, or adjust the UI. The project intentionally keeps dependencies minimal to remain easy to host and maintain.

---

## License

This project is provided as-is. Adapt it for your own teaching or learning needs. Contributions are welcome! 🎓🇩🇪

