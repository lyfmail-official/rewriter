# Rewriter 🌱

> *Re-author Your Story* — A privacy-first narrative therapy companion.

Built on the framework of **Narrative Therapy** by Michael White & David Epston.

---

## What is Rewriter?

Rewriter is a Progressive Web App (PWA) that guides you through a complete narrative therapy process — from externalizing the problem to writing your alternative story. Every piece of data stays **100% on your device**. No servers. No tracking. No accounts.

## The 6 Phases

| Phase | Name | What You Do |
|-------|------|-------------|
| 1 | **Externalize** | Name the problem, give it form, understand its intent and tactics |
| 2 | **Map Influence** | See where the problem has power across 4 life domains |
| 3 | **Deconstruct** | Trace its history and the cultural forces that sustain it |
| 4 | **Sparkling Moments** | Discover unique outcomes where the problem didn't win |
| 5 | **Re-author** | Write your alternative story and claim new identity |
| 6 | **Witness** | Declare your story and build your support team |

## Features

- 🔒 **100% Private** — IndexedDB storage, zero backend
- 📴 **Offline-First** — Works without internet after first load
- 📱 **Installable PWA** — Add to Home Screen on any device
- 🎙 **Voice Input** — Speak your responses (Web Speech API)
- 🌙 **Dark Mode** — Easy on the eyes
- 📤 **Export/Import** — JSON backup with optional AES-256 encryption
- 🖨 **Print-Ready** — Clean print styles for your story
- ⌨️ **Keyboard Shortcut** — Ctrl+S / Cmd+S to save

## Setup & Deployment

### GitHub Pages (Recommended)

1. Fork or clone this repository to `lyfmail-official/rewriter`
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Push to `main` — the Actions workflow deploys automatically
4. Your app is live at `https://lyfmail-official.github.io/rewriter/`

### Custom Domain (Optional)

Add a `CNAME` file with your domain (e.g. `rewriter.lyfmail.com`) and configure DNS accordingly.

### Local Development

```bash
# Serve locally (any static server)
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Architecture

```
rewriter/
├── index.html          # Single entry point
├── app.js              # Modular ES2022+ application
├── styles.css          # CSS3 with custom properties
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (cache-first)
└── assets/icons/       # PWA icons
```

**No build step. No bundler. No framework. Pure web platform.**

## Privacy Policy

Rewriter stores all data exclusively in your browser's IndexedDB. Nothing is ever transmitted to any server. There are no analytics, no cookies, and no user accounts.

## Crisis Resources

If you're experiencing a mental health crisis:

- **988 Suicide & Crisis Lifeline** — Call or text **988** (US)
- **Crisis Text Line** — Text **HOME** to **741741**
- **International** — [iasp.info/resources/Crisis_Centres](https://iasp.info/resources/Crisis_Centres)

---

## Credits

Narrative therapy framework by **Michael White & David Epston**.

Built by **[LYF Mail](https://lyfmail.com)** · [rewriter@lyfmail.com](mailto:rewriter@lyfmail.com)

## License

MIT License — see [LICENSE](LICENSE) for details.
