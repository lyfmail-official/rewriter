# Rewriter — Privacy-First Narrative Therapy Companion & AI Health Content Writing Assistant

**Re-author your story. A free, open-source, privacy-first narrative therapy app and mental health writing assistant that guides you through structured therapeutic exercises — all data stays 100% on your device.**

[![Live App](https://img.shields.io/badge/%F0%9F%8C%B1%20Live%20App-rewriter.lyfmail.com-green)](https://lyfmail-official.github.io/rewriter/)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-blue)](https://lyfmail-official.github.io/rewriter/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-orange)](https://lyfmail-official.github.io/rewriter/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/lyfmail-official/rewriter/blob/main/LICENSE)
[![Maintained by LYF Mail](https://img.shields.io/badge/Maintained%20by-LYF%20Mail-purple)](https://lyfmail.com)

**"Re-author Your Story."**  
A free, open-source narrative therapy tool and mental health writing assistant from [LYF Mail](https://lyfmail.com) — India's privacy-first digital wellness platform.

---

## 🌱 What Is Rewriter?

**Rewriter** is a free, open-source, **privacy-first narrative therapy companion** and **AI health content writing assistant** designed to help you re-author your personal story through structured therapeutic writing exercises. Built on the evidence-based framework of **Narrative Therapy** by Michael White & David Epston, Rewriter guides you through a complete six-phase process — from externalizing the problem to writing your alternative story — while ensuring **every piece of data stays 100% on your device**.

Unlike traditional therapy apps or mental health platforms that store your most intimate thoughts on cloud servers, Rewriter follows a **strict zero-backend architecture**. There are no servers. No databases. No tracking. No accounts. Your journal entries, therapy sessions, and personal narratives never leave your browser.

Built by [LYF Mail](https://lyfmail.com), a [privacy-first digital wellness platform](https://lyfmail.com) serving 50,000+ subscribers across India since 2020, Rewriter extends our mission of **"Every Choice Shapes Tomorrow"** into **mental health technology**, **narrative therapy journaling**, and **compassionate health communication**.

---

## 🧠 Why Rewriter Exists — The Privacy Crisis in Mental Health Apps

Mental health and therapy apps handle the most sensitive personal data imaginable — your fears, traumas, struggles, and innermost thoughts. Yet most platforms:

| Risk | How It Hurts You | How Rewriter Protects You |
|------|-----------------|---------------------------|
| **Cloud Data Storage** | Your therapy journals stored on company servers. | **100% local** — IndexedDB only, zero network transmission. |
| **Data Monetization** | Sensitive mental health data sold to advertisers. | **Impossible** — no data collection, no analytics, no cookies. |
| **Account Breaches** | Hacked accounts exposing intimate journal entries. | **No accounts** — no usernames, no passwords, no login. |
| **Therapist-client Privilege Gaps** | No legal protection for app-stored therapy data. | **Zero backend** — no server means no subpoena, no breach. |
| **Subscription Paywalls** | Mental health tools locked behind monthly fees. | **Completely free** — MIT licensed, no paywalls, ever. |

Rewriter exists because **your mental health journey deserves the same privacy as a locked diary** — but with the structure and guidance of professional narrative therapy techniques.

---

## ✨ Key Features

### 🔒 100% Private — Zero-Backend Architecture
- **No servers** — all processing happens locally in your browser.
- **No cloud storage** — your data lives exclusively in browser IndexedDB.
- **No tracking** — zero analytics, zero cookies, zero fingerprinting.
- **No accounts** — no signup, no login, no email, no phone number.
- **Optional AES-256 encryption** — export your data with a passphrase that is **never stored anywhere**. You alone hold the key.

### 📴 Offline-First Progressive Web App (PWA)
- Works **entirely without internet** after first load.
- Install to your home screen on **iOS, Android, or desktop** — behaves like a native app.
- No app store required. No permissions demanded. No tracking SDKs.

### 🎙 Voice Input Support
- **Web Speech API integration** — speak your responses instead of typing.
- Perfect for users with motor difficulties, visual impairments, or those who process thoughts better through speech.
- All voice processing happens locally — no audio sent to any server.

### 🌙 Dark Mode & Accessible Design
- **Dark mode** — easy on the eyes for late-night journaling.
- **High-contrast modes** — accessible for users with visual impairments.
- **Keyboard shortcuts** — `Ctrl+S` / `Cmd+S` to save instantly.
- **Print-ready styles** — clean, beautiful formatting for printing your therapeutic story.

### 📤 Export & Import with Encryption
- **JSON backup** — export your complete narrative therapy journey.
- **AES-256 encrypted exports** — protect your backup with a strong passphrase.
- **Import on any device** — restore your sessions seamlessly across devices.
- **The passphrase is never stored** — you alone control decryption.

### 🖨 Print-Ready Story Output
- Clean, professional print styles for your completed alternative story.
- Share with a therapist, keep as a personal milestone, or frame as a reminder of your resilience.

---

## 🧩 The 6 Phases of Narrative Therapy

Rewriter guides you through the complete **evidence-based narrative therapy framework** developed by Michael White & David Epston:

| Phase | Name | What You Do | Therapeutic Goal |
|-------|------|-------------|------------------|
| **1** | **Externalize** | Name the problem, give it form, understand its intent and tactics. | Separate your identity from the problem. |
| **2** | **Map Influence** | See where the problem has power across 4 life domains. | Understand the problem's reach and impact. |
| **3** | **Deconstruct** | Trace its history and the cultural forces that sustain it. | Uncover how the problem became so powerful. |
| **4** | **Sparkling Moments** | Discover unique outcomes where the problem didn't win. | Find evidence of your agency and strength. |
| **5** | **Re-author** | Write your alternative story and claim a new identity. | Construct a preferred, empowering narrative. |
| **6** | **Witness** | Declare your story and build your support team. | Solidify your new identity with community. |

Each phase includes **guided writing prompts**, **compassionate language suggestions**, and **reflective exercises** that help you process difficult experiences through structured narrative therapy journaling.

---

## 🚀 Quick Start Guide

### For Users (No Technical Knowledge Required)

1. **Visit** [lyfmail-official.github.io/rewriter](https://lyfmail-official.github.io/rewriter/)
2. **No signup required** — open the app and start your narrative therapy journey immediately.
3. **Begin Phase 1: Externalize** — name your problem and give it form.
4. **Progress through all 6 phases** at your own pace. Your data saves automatically to your device.
5. **Install as PWA** — tap "Add to Home Screen" for offline, app-like experience.
6. **Export your story** — optionally encrypt with AES-256 and back up your therapeutic journey.

### For Developers

1. **Clone the repository**
```bash
git clone https://github.com/lyfmail-official/rewriter.git
```

2. **Serve locally** (any static file server)
```bash
cd rewriter
npx serve .
# or
python3 -m http.server 8080
```

3. **Open in your browser**
```bash
http://localhost:8080
```

4. **No build step required** — pure HTML, CSS, and vanilla JavaScript. Zero dependencies.

---

## 📁 Project Structure

```
rewriter/
├── index.html          # Single entry point — complete app shell
├── app.js              # Modular ES2022+ application logic
│   ├── phases/         # Narrative therapy phase modules
│   │   ├── externalize.js
│   │   ├── map-influence.js
│   │   ├── deconstruct.js
│   │   ├── sparkling-moments.js
│   │   ├── re-author.js
│   │   └── witness.js
│   ├── storage.js      # IndexedDB local data management
│   ├── crypto.js       # AES-256 export encryption
│   ├── voice.js        # Web Speech API integration
│   └── ui.js           # UI components & accessibility
├── styles.css          # CSS3 with custom properties & dark mode
├── manifest.json       # PWA manifest for installability
├── sw.js               # Service Worker — cache-first offline strategy
├── assets/
│   └── icons/          # PWA icons (192x192, 512x512)
├── docs/
│   ├── narrative-therapy-framework.md  # Clinical methodology
│   ├── privacy.md      # Privacy architecture documentation
│   └── accessibility.md  # Accessibility features & compliance
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

**No build step. No bundler. No framework. Pure web platform.**  
This architectural simplicity ensures maximum transparency, minimal attack surface, and complete auditability.

---

## 🏗️ Architecture & Technical Design

Rewriter is intentionally built with **radical simplicity** to maximize privacy, performance, and transparency:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES2022+) | Zero dependencies, zero framework bloat. |
| **Storage** | Browser IndexedDB | Local, encrypted-at-rest data persistence. |
| **Encryption** | Web Crypto API (AES-256-GCM) | Client-side export encryption. |
| **Voice Input** | Web Speech API | Local speech-to-text for accessibility. |
| **Offline** | Service Worker + Cache API | Full PWA offline functionality. |
| **Deployment** | Static Site (GitHub Pages) | No server, no backend, no database. |

---

## 🔐 Privacy Policy

Rewriter stores all data exclusively in your browser's **IndexedDB**. Nothing is ever transmitted to any server. There are:

- ✅ **No analytics** — we don't know how many people use Rewriter.
- ✅ **No cookies** — zero tracking technologies.
- ✅ **No user accounts** — no identity to link to your therapeutic data.
- ✅ **No cloud backup** — your data lives only where you choose to keep it.
- ✅ **No external APIs** — no OpenAI, no Google Cloud, no third-party services.

**Your therapeutic journal is as private as a notebook in your drawer.** The only difference is that Rewriter provides the structure of professional narrative therapy — without the surveillance of corporate mental health apps.

---

## 🌍 Who Uses Rewriter?

### 🧠 Individuals in Therapy or Self-Reflection
People working through anxiety, depression, trauma, or life transitions who want a **structured, private journaling tool** based on clinical narrative therapy techniques.

### 🎓 Students & Educators
Students of psychology, counseling, and social work studying **narrative therapy frameworks** (Michael White & David Epston). Educators teaching therapeutic writing and mental health literacy.

### ✍️ Writers & Journalers
Creative writers and journalers who want to **re-author their personal narratives** through a guided, evidence-based therapeutic framework.

### 🏥 Healthcare Communicators
Professionals and patients who need to **rewrite health information into clear, compassionate language** — making medical jargon accessible and emotionally supportive.

### 🧘 Mindfulness & Wellness Practitioners
Yoga instructors, meditation teachers, and wellness coaches who want to offer clients a **privacy-first mental health journaling tool** without data collection concerns.

### 💻 Privacy Advocates & Open-Source Enthusiasts
Users who refuse to surrender their mental health data to corporate platforms and demand **transparent, auditable, local-first software**.

---

## 🗺️ Roadmap & Future Development

Planned enhancements include:

- **🤖 On-Device AI Health Content Rewriting** — Local NLP models to rewrite medical information into compassionate, accessible language (TensorFlow.js, fully on-device).
- **📊 Narrative Therapy Progress Visualization** — Visual timelines of your therapeutic journey, stored locally.
- **🌍 Multi-Language Support** — Narrative therapy prompts in Hindi, Tamil, Bengali, and other Indian languages.
- **♿ Enhanced Accessibility** — Screen-reader optimization, motor-friendly inputs, high-contrast themes.
- **📱 Enhanced PWA Features** — Push notifications for daily journaling reminders (local only, no server).
- **🔍 Full-Text Search** — Search across all your journal entries locally.
- **📤 Encrypted Cloud Sync (Optional)** — Optional, user-controlled, end-to-end encrypted sync for users who choose it.

---

## 🤝 Contributing to Rewriter

Rewriter welcomes contributions that respect our core principles:

- **Privacy-first** — never introduce server-side components or data collection.
- **Mental health respectful** — no gamification, no metrics, no social pressure.
- **Accessibility-focused** — every feature must work for users with disabilities.
- **Offline-first** — all functionality must work without internet.
- **Zero-dependency** — prefer vanilla web platform APIs over frameworks.

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## 🏗️ The LYF Mail Ecosystem

Rewriter is one of nine free, open-source privacy tools built by [LYF Mail](https://lyfmail.com), a [digital wellness platform](https://lyfmail.com) from Varanasi, India, serving 50,000+ subscribers since 2020. Explore our other projects:

| Project | Description | Live App | Repository |
|---------|-------------|----------|------------|
| **[LYF Mail](https://lyfmail.com)** | Privacy-first newsletters for health, wealth, career & mindfulness. | [lyfmail.com](https://lyfmail.com) | `lyfmail` |
| **[TrustLens](https://trustlens.lyfmail.com)** | Detect misinformation before you share. Privacy-first credibility analysis. | [trustlens.lyfmail.com](https://trustlens.lyfmail.com) | `trustlens` |
| **[Signals](https://signals.lyfmail.com)** | Privacy-first analytics. Human vs. bot detection without cookies or fingerprinting. | [signals.lyfmail.com](https://signals.lyfmail.com) | `signals` |
| **[Ebb](https://ebb.lyfmail.com)** | Period tracker with homomorphic encryption. Your data stays encrypted — even from us. | [ebb.lyfmail.com](https://ebb.lyfmail.com) | `ebb` |
| **[LYF SOS](https://lyfsos.lyfmail.com)** | Offline emergency safety app for Android. Built for Indian families. | [lyfsos.lyfmail.com](https://lyfsos.lyfmail.com) | `lyfsos` |
| **[PDPR](https://pdpr.lyfmail.com)** | Public Dark Pattern Registry. Document deceptive UX ethically. | [pdpr.lyfmail.com](https://pdpr.lyfmail.com) | `pdpr` |
| **[Together](https://together.lyfmail.com)** | Mental health support through therapeutic silence and shared presence. | [together.lyfmail.com](https://together.lyfmail.com) | `together` |
| **[Offload](https://lyfmail-official.github.io/offload/)** | Stress relief with binaural beats and dream journal. Zero cloud storage. | [lyfmail-official.github.io/offload](https://lyfmail-official.github.io/offload/) | `offload` |

### 📚 Free Newsletters & Guides
- [Health & Wellness Guide](https://lyfmail.com/health-wellness-guide)
- [Personal Finance Guide](https://lyfmail.com/personal-finance-guide)
- [Career Development Guide](https://lyfmail.com/career-development-guide)
- [Creativity Resources](https://lyfmail.com/creativity-resources)
- [Mindfulness Practices](https://lyfmail.com/mindfulness-practices)

**Newsletter Signups:** [Health](https://health.signup.lyfmail.com) · [Finance](https://financing.signup.lyfmail.com) · [Career](https://career.signup.lyfmail.com) · [Creativity](https://creativity.signup.lyfmail.com) · [Personal Development](https://intuition.signup.lyfmail.com)

---

## ⚠️ Crisis Resources

Rewriter is a **journaling and narrative therapy companion**, not a replacement for professional mental health care. If you are experiencing a mental health crisis, please reach out immediately:

- **🇮🇳 India — iCall** — Call **022-25521111** or email icall@tiss.edu
- **🇮🇳 India — Kiran** — Call **1800-599-0019** (24/7 mental health helpline)
- **🇺🇸 United States — 988 Suicide & Crisis Lifeline** — Call or text **988**
- **🇺🇸 United States — Crisis Text Line** — Text **HOME** to **741741**
- **🌍 International** — Find your local crisis center at [iasp.info/resources/Crisis_Centres](https://iasp.info/resources/Crisis_Centres)

---

## 📜 License

Rewriter is released under the **MIT License**.

You are free to use, modify, and distribute it — including commercially. See [`LICENSE`](LICENSE) for full terms.

---

## 📫 Connect With Us

- **🌐 Website:** [lyfmail.com](https://lyfmail.com)
- **🌱 Rewriter App:** [lyfmail-official.github.io/rewriter](https://lyfmail-official.github.io/rewriter/)
- **📱 PWA:** [app.lyfmail.com](https://app.lyfmail.com)
- **📚 Documentation:** [docs.lyfmail.com](https://docs.lyfmail.com)
- **🎨 Brand Assets:** [github.com/lyfmail-official/lyfmail-brand-assets](https://github.com/lyfmail-official/lyfmail-brand-assets)
- **🐦 X / Twitter:** [@lyfmailcom](https://x.com/lyfmailcom)
- **📘 Facebook:** [thelyfmail](https://www.facebook.com/thelyfmail)
- **▶️ YouTube:** [LYF Mail](https://m.youtube.com/channel/UCurymhWrl2nkvv31uJMuc0g)
- **💼 LinkedIn:** [lyfmailcom](https://in.linkedin.com/in/lyfmailcom)
- **📧 Rewriter Email:** rewriter@lyfmail.com
- **📧 General Email:** contact@lyfmail.com
- **🆘 Support:** [support.lyfmail.com](https://support.lyfmail.com)

---

*"Every Choice Shapes Tomorrow"*

**Maintained by [LYF Mail](https://lyfmail.com)** · Founded by [Ajay Kumar Chaudhary](https://github.com/lyfmail) · Varanasi, Uttar Pradesh, India · Since 2020

---

## 💬 Frequently Asked Questions

**Q: What is Rewriter and how does it work?**  
A: Rewriter is a free, privacy-first narrative therapy companion and AI health content writing assistant. It guides you through structured narrative therapy exercises based on the framework by Michael White & David Epston, helping you externalize problems, map their influence, and re-author your personal story. All processing happens locally in your browser — your words never leave your device.

**Q: Is Rewriter really free to use?**  
A: Yes. Rewriter is completely free. There are no subscription fees, no hidden charges, and no paywalls. It is an open-source project by [LYF Mail](https://lyfmail.com) committed to making mental wellness tools accessible to everyone.

**Q: How does Rewriter protect my privacy?**  
A: Rewriter is built with a privacy-first architecture. All text processing and narrative therapy sessions happen locally in your browser using IndexedDB. No data is sent to external servers, no cookies are used for tracking, and no personal information is collected. You can also encrypt your exports with a passphrase that is never stored anywhere.

**Q: Can I use Rewriter without an internet connection?**  
A: Yes. Once loaded, Rewriter works entirely offline as a Progressive Web App (PWA). You can install it to your home screen on any device and continue your narrative therapy journaling and rewriting sessions without an active internet connection.

**Q: What is narrative therapy and how does Rewriter use it?**  
A: Narrative therapy is a form of counseling developed by Michael White & David Epston that helps people re-author their personal stories by separating themselves from their problems. Rewriter applies this through six structured phases — Externalize, Map Influence, Deconstruct, Sparkling Moments, Re-author, and Witness — with guided writing prompts, compassionate language generation, and reflective exercises.

**Q: Can I export or backup my Rewriter data?**  
A: Yes. Rewriter allows you to export your journal entries and narrative therapy sessions as JSON. You can choose to encrypt your export with AES-256 using a strong passphrase for additional security. The passphrase is never stored — you alone hold the key to decrypt your data later.

**Q: Is Rewriter a substitute for professional therapy?**  
A: No. Rewriter is a journaling and writing companion designed to support mental wellness through narrative exercises. It is not a replacement for professional mental health care, licensed therapy, or psychiatric treatment. If you are experiencing a crisis, please use the crisis resources listed above or reach out to a qualified professional.

**Q: Does Rewriter use AI or send my data to AI services?**  
A: No. Rewriter does not use external AI APIs like OpenAI, Google Cloud, or any third-party service. All text processing, narrative therapy guidance, and health content rewriting happens locally in your browser. Future on-device AI features (using TensorFlow.js) will also run entirely locally without network transmission.

**Q: Can I use Rewriter on my phone?**  
A: Yes. Rewriter is a Progressive Web App (PWA) optimized for mobile, tablet, and desktop. Visit [lyfmail-official.github.io/rewriter](https://lyfmail-official.github.io/rewriter/) on any device, tap "Add to Home Screen," and use it like a native app — fully offline, no app store required.

**Q: Does Rewriter support voice input?**  
A: Yes. Rewriter includes Web Speech API integration, allowing you to speak your responses instead of typing. This is especially helpful for users with motor difficulties, visual impairments, or those who prefer verbal processing. All voice processing happens locally in your browser.

**Q: Can I print my completed narrative therapy story?**  
A: Yes. Rewriter includes print-ready CSS styles that format your completed alternative story beautifully for printing. Share it with a therapist, keep it as a personal milestone, or frame it as a reminder of your resilience.

**Q: How can I contribute to Rewriter?**  
A: We welcome contributions from developers, UX designers, mental health professionals, narrative therapy practitioners, and accessibility advocates. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and ensure your contributions respect our privacy-first, zero-backend, offline-first principles.

**Q: What is the difference between Rewriter and other journaling apps like Day One or Journey?**  
A: Most journaling apps store your entries on cloud servers, require accounts, and may monetize your data. Rewriter is **100% local, zero-backend, account-free, and open-source**. Your mental health data never leaves your device, and you can verify this by auditing our code. We also provide structured narrative therapy guidance rather than blank-page journaling.

---

*This README is maintained by the LYF Mail team. For issues, feature requests, research collaborations, or contributions, please visit our [GitHub repository](https://github.com/lyfmail-official/rewriter).*
