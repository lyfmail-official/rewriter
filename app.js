/**
 * REWRITER — Narrative Therapy PWA
 * A privacy-first companion for re-authoring your story.
 * Built for LYF Mail (https://lyfmail.com)
 */

'use strict';

// =====================================================
// CONFIG
// =====================================================
const CONFIG = {
  APP_NAME: 'Rewriter',
  VERSION: '1.0.0',
  DB_NAME: 'rewriter-db',
  DB_VERSION: 2,
  ORG_NAME: 'LYF Mail',
  ORG_URL: 'https://lyfmail.com',
  CONTACT: 'rewriter@lyfmail.com',
  PHASES: [
    { id: 1, name: 'Externalize',       icon: '🌊', time: '10–15 min' },
    { id: 2, name: 'Map Influence',     icon: '🗺️',  time: '10–15 min' },
    { id: 3, name: 'Deconstruct',       icon: '🔍',  time: '10 min'   },
    { id: 4, name: 'Sparkling Moments', icon: '✨',  time: '15–20 min' },
    { id: 5, name: 'Re-author',         icon: '✍️',  time: '15–20 min' },
    { id: 6, name: 'Witness',           icon: '🌱',  time: '10 min'   },
  ],
  TACTICS: [
    { emoji: '🏝️', label: 'Telling me I\'m alone' },
    { emoji: '😔', label: 'Using shame' },
    { emoji: '📊', label: 'Making me compare myself to others' },
    { emoji: '🌑', label: 'Convincing me of hopelessness' },
    { emoji: '😴', label: 'Using exhaustion against me' },
    { emoji: '⚖️', label: 'Making me believe I deserve this' },
    { emoji: '🛡️', label: 'Convincing me it protects me' },
    { emoji: '🎭', label: 'Making me think this is who I am' },
  ],
  DOMAINS: [
    {
      id: 'self',
      icon: '🪞',
      title: 'Self Relationship',
      prompts: [
        'How does it affect how you see yourself?',
        'What does it tell you about your worth or capabilities?',
        'How does it influence your self-care?',
      ],
    },
    {
      id: 'relationships',
      icon: '👥',
      title: 'Relationships',
      prompts: [
        'How does it impact your connections with others?',
        'Does it make you withdraw, attack, or perform?',
        'What does it say about your lovability or belonging?',
      ],
    },
    {
      id: 'direction',
      icon: '🧭',
      title: 'Life Direction',
      prompts: [
        'How does it interfere with your hopes for the future?',
        'What possibilities has it closed off?',
        'What does it say you\'re allowed to want?',
      ],
    },
    {
      id: 'daily',
      icon: '🌅',
      title: 'Daily Living',
      prompts: [
        'What does it make you avoid or do in daily life?',
        'How does it affect sleep, eating, or work?',
        'What routines has it established?',
      ],
    },
  ],
};

// =====================================================
// UTILITIES
// =====================================================
const Utils = {
  // Crypto — AES-GCM via Web Crypto API
  crypto: {
    async deriveKey(password, salt) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
      );
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    },
    async encrypt(data, password) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv   = crypto.getRandomValues(new Uint8Array(12));
      const key  = await Utils.crypto.deriveKey(password, salt);
      const enc  = new TextEncoder();
      const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(data));
      // Pack: [salt(16)][iv(12)][cipher]
      const buf = new Uint8Array(16 + 12 + cipher.byteLength);
      buf.set(salt, 0);
      buf.set(iv, 16);
      buf.set(new Uint8Array(cipher), 28);
      return btoa(String.fromCharCode(...buf));
    },
    async decrypt(b64, password) {
      const buf  = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const salt = buf.slice(0, 16);
      const iv   = buf.slice(16, 28);
      const data = buf.slice(28);
      const key  = await Utils.crypto.deriveKey(password, salt);
      const dec  = new TextDecoder();
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
      return dec.decode(plain);
    },
  },

  // DOM helpers
  dom: {
    qs: (sel, ctx = document) => ctx.querySelector(sel),
    qsa: (sel, ctx = document) => [...ctx.querySelectorAll(sel)],
    el(tag, attrs = {}, children = []) {
      const e = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v);
      });
      children.forEach(c => c && e.append(typeof c === 'string' ? document.createTextNode(c) : c));
      return e;
    },
    clear(el) { while (el.firstChild) el.removeChild(el.firstChild); },
  },

  // Text helpers
  text: {
    truncate(str, max = 40) {
      return str && str.length > max ? str.slice(0, max) + '…' : (str || '');
    },
    initials(name = '') {
      return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase()).slice(0, 2).join('');
    },
    dateLabel(iso) {
      if (!iso) return '';
      try {
        return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
      } catch { return iso; }
    },
    relativeTime(iso) {
      if (!iso) return '';
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1)   return 'just now';
      if (mins < 60)  return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24)   return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 7)   return `${days}d ago`;
      return Utils.text.dateLabel(iso);
    },
  },

  // Debounce
  debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },
  // UUID
  uid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  },
};

// =====================================================
// DATABASE
// =====================================================
class RewriterDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('stories')) {
          const store = db.createObjectStore('stories', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
          store.createIndex('status', 'status');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      req.onsuccess = e => { this.db = e.target.result; resolve(); };
      req.onerror   = () => reject(req.error);
    });
  }

  _tx(store, mode = 'readonly') {
    return this.db.transaction(store, mode).objectStore(store);
  }

  async saveStory(story) {
    return new Promise((resolve, reject) => {
      const req = this._tx('stories', 'readwrite').put(story);
      req.onsuccess = () => resolve(story);
      req.onerror   = () => reject(req.error);
    });
  }

  async getStory(id) {
    return new Promise((resolve, reject) => {
      const req = this._tx('stories').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = () => reject(req.error);
    });
  }

  async getAllStories() {
    return new Promise((resolve, reject) => {
      const req = this._tx('stories').getAll();
      req.onsuccess = () => resolve(req.result.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)));
      req.onerror   = () => reject(req.error);
    });
  }

  async deleteStory(id) {
    return new Promise((resolve, reject) => {
      const req = this._tx('stories', 'readwrite').delete(id);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const req = this._tx('settings').get(key);
      req.onsuccess = () => resolve(req.result?.value ?? null);
      req.onerror   = () => reject(req.error);
    });
  }

  async setSetting(key, value) {
    return new Promise((resolve, reject) => {
      const req = this._tx('settings', 'readwrite').put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  async exportAll() {
    const stories = await this.getAllStories();
    return { version: CONFIG.VERSION, exportedAt: new Date().toISOString(), stories };
  }

  async importData(data) {
    if (!data?.stories) throw new Error('Invalid import format');
    const tx = this.db.transaction('stories', 'readwrite');
    const store = tx.objectStore('stories');
    data.stories.forEach(s => store.put(s));
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
}

// =====================================================
// STATE
// =====================================================
class AppState {
  constructor(db) {
    this.db = db;
    this.subscribers = [];
    this.story = null;
    this.currentView = 'dashboard'; // welcome | dashboard | phase-N | summary
    this.theme = 'light';
    this._saveDebounced = Utils.debounce(() => this._persist(), 800);
  }

  subscribe(cb) { this.subscribers.push(cb); }

  notify(hint = {}) {
    this.subscribers.forEach(cb => cb({ story: this.story, view: this.currentView, ...hint }));
  }

  setView(view) {
    this.currentView = view;
    this.notify();
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : '';
    this.db.setSetting('theme', theme);
  }

  newStory() {
    this.story = {
      id:        Utils.uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status:    'active',
      phase:     1,
      externalize: {
        problemName: '',
        physicalForm: '',
        intent: '',
        tactics: [],
      },
      influence: {
        self: '',
        relationships: '',
        direction: '',
        daily: '',
      },
      deconstruct: {
        history: '',
        culturalSupport: '',
        whoHelped: '',
      },
      sparkling: {
        moments: [],
      },
      reauthor: {
        alternativeStory: '',
        identityClaims: [],
        newName: '',
      },
      witness: {
        declaration: '',
        supportTeam: [],
        nextSteps: '',
      },
    };
    this.notify();
  }

  async loadStory(id) {
    this.story = await this.db.getStory(id);
    this.notify();
  }

  updateField(section, field, value) {
    if (!this.story) return;
    if (!this.story[section]) this.story[section] = {};
    this.story[section][field] = value;
    this.story.updatedAt = new Date().toISOString();
    this._saveDebounced();
    this.notify({ silent: true });
  }

  setPhase(phase) {
    if (!this.story) return;
    this.story.phase = Math.max(1, Math.min(6, phase));
    this.story.updatedAt = new Date().toISOString();
    this._persist();
    this.notify();
  }

  addSparklingMoment(moment) {
    if (!this.story) return;
    this.story.sparkling.moments.push({
      id: Utils.uid(),
      createdAt: new Date().toISOString(),
      ...moment,
    });
    this.story.updatedAt = new Date().toISOString();
    this._persist();
    this.notify();
  }

  removeSparklingMoment(id) {
    if (!this.story) return;
    this.story.sparkling.moments = this.story.sparkling.moments.filter(m => m.id !== id);
    this.story.updatedAt = new Date().toISOString();
    this._persist();
    this.notify();
  }

  addIdentityClaim(claim) {
    if (!this.story || !claim.trim()) return;
    this.story.reauthor.identityClaims.push(claim.trim());
    this.story.updatedAt = new Date().toISOString();
    this._persist();
    this.notify();
  }

  removeIdentityClaim(idx) {
    if (!this.story) return;
    this.story.reauthor.identityClaims.splice(idx, 1);
    this.story.updatedAt = new Date().toISOString();
    this._persist();
    this.notify();
  }

  addSupportPerson(person) {
    if (!this.story || !person.name?.trim()) return;
    this.story.witness.supportTeam.push({ id: Utils.uid(), ...person });
    this.story.updatedAt = new Date().toISOString();
    this._persist();
    this.notify();
  }

  removeSupportPerson(id) {
    if (!this.story) return;
    this.story.witness.supportTeam = this.story.witness.supportTeam.filter(p => p.id !== id);
    this.story.updatedAt = new Date().toISOString();
    this._persist();
    this.notify();
  }

  toggleTactic(label) {
    if (!this.story) return;
    const tactics = this.story.externalize.tactics;
    const idx = tactics.indexOf(label);
    if (idx >= 0) tactics.splice(idx, 1);
    else tactics.push(label);
    this.story.updatedAt = new Date().toISOString();
    this._saveDebounced();
    this.notify({ silent: true });
  }

  async _persist() {
    if (this.story) await this.db.saveStory(this.story);
  }

  completeStory() {
    if (!this.story) return;
    this.story.status = 'complete';
    this.story.completedAt = new Date().toISOString();
    this.story.updatedAt = this.story.completedAt;
    this._persist();
    this.notify();
  }
}

// =====================================================
// TOAST
// =====================================================
class Toast {
  static show(msg, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    const t = Utils.dom.el('div', { class: `toast ${type}` });
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    t.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${msg}`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.animation = 'toast-out 0.3s ease forwards';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }
}

// =====================================================
// VOICE CONTROLLER
// =====================================================
class VoiceController {
  constructor() {
    this.recognition = null;
    this.active = false;
    this._init();
  }

  _init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
  }

  start(callback, btnEl) {
    if (!this.recognition) { Toast.show('Voice input not supported in this browser.', 'warning'); return; }
    if (this.active) { this.stop(); return; }
    this.active = true;
    if (btnEl) btnEl.classList.add('active');
    this.recognition.onresult = e => {
      const transcript = e.results[0][0].transcript;
      callback(transcript);
      this.stop(btnEl);
    };
    this.recognition.onerror = () => this.stop(btnEl);
    this.recognition.onend   = () => this.stop(btnEl);
    this.recognition.start();
  }

  stop(btnEl) {
    this.active = false;
    if (btnEl) btnEl.classList.remove('active');
    try { this.recognition?.stop(); } catch {}
  }
}

// =====================================================
// UI RENDERER
// =====================================================
class UIRenderer {
  constructor(state, app) {
    this.state = state;
    this.app = app;
    this.root = document.getElementById('root');
  }

  render() {
    const { view } = this.state;
    Utils.dom.clear(this.root);

    if (view === 'welcome') {
      this.root.appendChild(this.renderWelcome());
    } else if (view === 'dashboard') {
      this.root.appendChild(this.renderDashboard());
    } else if (view === 'summary') {
      this.root.appendChild(this.renderSummary());
    } else if (view === 'settings') {
      this.root.appendChild(this.renderSettings());
    } else if (view.startsWith('phase-')) {
      const phase = parseInt(view.split('-')[1]);
      this.root.appendChild(this.renderPhase(phase));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- WELCOME ----
  renderWelcome() {
    const el = Utils.dom.el('div', { class: 'welcome-screen' });
    el.innerHTML = `
      <svg class="welcome-emblem" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="44" stroke="#8B9DC3" stroke-width="2" opacity="0.25"/>
        <circle cx="48" cy="48" r="36" fill="#8B9DC3" opacity="0.08"/>
        <path d="M26 34 Q48 22 70 34 Q70 62 48 72 Q26 62 26 34Z" fill="#8B9DC3" opacity="0.12"/>
        <path d="M34 46 L43 55 L62 36" stroke="#8B9DC3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M30 68 Q48 76 66 68" stroke="#8B9DC3" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
      </svg>
      <div>
        <h1 class="welcome-title">Rewriter</h1>
        <p class="welcome-subtitle">Re-author Your Story</p>
      </div>
      <div class="welcome-quote">
        <blockquote>
          "The problem is the problem. The person is not the problem."
        </blockquote>
        <cite>— Michael White & David Epston, Narrative Therapy</cite>
      </div>
      <div class="welcome-ctas">
        <button class="btn btn-primary btn-lg" id="btn-new-story">✦ Begin New Story</button>
        <button class="btn btn-secondary btn-lg" id="btn-continue">Continue a Story</button>
      </div>
      <p class="welcome-privacy-note">🔒 Your data stays private — stored only on your device.</p>
    `;
    el.querySelector('#btn-new-story').onclick = () => this.app.startNewStory();
    el.querySelector('#btn-continue').onclick  = () => this.state.setView('dashboard');
    el.appendChild(this.renderFooter());
    return el;
  }

  // ---- DASHBOARD ----
  renderDashboard() {
    const el = Utils.dom.el('div', { class: 'dashboard' });
    el.innerHTML = `
      <div class="dashboard-header">
        <h1 class="dashboard-title">Your Stories</h1>
        <p class="dashboard-subtitle">Each story is a chapter in your re-authored life.</p>
        <div class="dashboard-actions">
          <button class="btn btn-primary" id="dash-new-btn">✦ New Story</button>
          <button class="btn btn-secondary" id="dash-import-btn">⬆ Import</button>
        </div>
      </div>
      <div id="story-list-container"></div>
    `;

    el.querySelector('#dash-new-btn').onclick = () => this.app.startNewStory();
    el.querySelector('#dash-import-btn').onclick = () => this.app.importStories();

    this.app.db.getAllStories().then(stories => {
      const container = el.querySelector('#story-list-container');
      if (!stories.length) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📖</div>
            <div class="empty-state-title">No stories yet</div>
            <p class="empty-state-desc">Begin a new story to start your narrative therapy journey. Your stories are stored privately on this device.</p>
          </div>`;
        return;
      }
      const list = Utils.dom.el('div', { class: 'story-list' });
      stories.forEach(story => {
        const phase = CONFIG.PHASES[story.phase - 1] || CONFIG.PHASES[0];
        const item = Utils.dom.el('div', { class: 'story-item' });
        item.innerHTML = `
          <div class="story-item-icon">${phase.icon}</div>
          <div class="story-item-body">
            <div class="story-item-name">${story.externalize?.problemName
              ? `The ${story.externalize.problemName} Story`
              : 'Untitled Story'}</div>
            <div class="story-item-meta">
              <span class="story-phase-badge">Phase ${story.phase}/6 — ${phase.name}</span>
              <span>${Utils.text.relativeTime(story.updatedAt)}</span>
              ${story.status === 'complete' ? '<span>✓ Complete</span>' : ''}
            </div>
          </div>
          <span class="story-item-arrow">›</span>`;
        item.onclick = () => this.app.loadStory(story.id);
        list.appendChild(item);
      });
      container.appendChild(list);
    });

    el.appendChild(this.renderFooter());
    return el;
  }

  // ---- PHASE ROUTER ----
  renderPhase(phase) {
    const renderers = {
      1: () => this.renderPhase1(),
      2: () => this.renderPhase2(),
      3: () => this.renderPhase3(),
      4: () => this.renderPhase4(),
      5: () => this.renderPhase5(),
      6: () => this.renderPhase6(),
    };
    return (renderers[phase] || renderers[1])();
  }

  // ---- PHASE WRAPPER ----
  _phaseWrap(phaseIdx, content, { canProceed = true, onBack, onNext } = {}) {
    const p = CONFIG.PHASES[phaseIdx - 1];
    const pct = Math.round(((phaseIdx - 1) / 6) * 100);
    const el = Utils.dom.el('div', { class: 'page-content' });

    el.innerHTML = `
      <div class="progress-track">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label">${phaseIdx}/6</span>
      </div>
      <div class="phase-header">
        <div class="phase-badge">${p.icon} Phase ${phaseIdx}</div>
        <h2 class="phase-title">${p.name}</h2>
        <div class="phase-time">⏱ ${p.time}</div>
      </div>`;

    el.appendChild(content);

    const nav = Utils.dom.el('div', { class: 'page-nav' });
    if (phaseIdx > 1) {
      const backBtn = Utils.dom.el('button', { class: 'btn btn-secondary' });
      backBtn.textContent = '← Back';
      backBtn.onclick = onBack || (() => this.state.setView(`phase-${phaseIdx - 1}`));
      nav.appendChild(backBtn);
    } else {
      const dashBtn = Utils.dom.el('button', { class: 'btn btn-ghost' });
      dashBtn.textContent = '← Dashboard';
      dashBtn.onclick = () => this.state.setView('dashboard');
      nav.appendChild(dashBtn);
    }

    nav.appendChild(Utils.dom.el('span', { class: 'page-nav-spacer' }));

    const nextBtn = Utils.dom.el('button', { class: 'btn btn-primary' });
    nextBtn.textContent = phaseIdx < 6 ? `Continue →` : 'Complete Story ✓';
    nextBtn.onclick = onNext || (() => {
      if (phaseIdx < 6) {
        this.state.setPhase(phaseIdx + 1);
        this.state.setView(`phase-${phaseIdx + 1}`);
      } else {
        this.state.completeStory();
        this.state.setView('summary');
      }
    });
    if (!canProceed) nextBtn.disabled = true;
    nav.appendChild(nextBtn);

    el.appendChild(nav);
    el.appendChild(this.renderFooter());
    return el;
  }

  // ---- PHASE 1: EXTERNALIZE ----
  renderPhase1() {
    const s = this.state.story?.externalize || {};
    const content = Utils.dom.el('div');
    content.innerHTML = `
      <p class="phase-theory">
        In narrative therapy, we "externalize" the problem — treating it as separate from your identity.
        The problem is not you; the problem is a problem. Giving it a name and form helps you relate to it
        as something outside yourself, which you can examine, challenge, and resist.
      </p>

      <div class="form-section mt-xl">
        <div class="form-group">
          <label for="problem-name">Name the Problem</label>
          <p class="hint">If this problem was a character, what would you call it?
            <em>e.g. The Critic, Dark Cloud, Perfectionism, The Void</em></p>
          <div class="input-with-action">
            <input type="text" id="problem-name" class="input"
              placeholder="Give it a name…" value="${s.problemName || ''}" maxlength="60">
            <button class="input-voice-btn" id="voice-name" title="Speak" aria-label="Voice input">🎙</button>
          </div>
        </div>

        <div class="form-group">
          <label for="physical-form">Personify It</label>
          <p class="hint">If it had a physical form — size, color, texture, sound, smell — what would it be like?</p>
          <div class="input-with-action">
            <textarea id="physical-form" class="textarea"
              placeholder="Describe its appearance and presence…">${s.physicalForm || ''}</textarea>
            <button class="input-voice-btn" id="voice-form" title="Speak" aria-label="Voice input">🎙</button>
          </div>
        </div>

        <div class="form-group">
          <label for="intent">Its Intent</label>
          <p class="hint">What does <span class="problem-name-inline">${s.problemName || 'it'}</span> want you to believe?</p>
          <div class="input-with-action">
            <textarea id="intent" class="textarea"
              placeholder="What lies or distortions does it push on you?…">${s.intent || ''}</textarea>
            <button class="input-voice-btn" id="voice-intent" title="Speak" aria-label="Voice input">🎙</button>
          </div>
        </div>

        <div class="form-group">
          <label>Its Tactics</label>
          <p class="hint">How does it operate? Select all that apply.</p>
          <div class="pill-group" id="tactics-group"></div>
        </div>
      </div>`;

    // Tactics pills
    const pillGroup = content.querySelector('#tactics-group');
    CONFIG.TACTICS.forEach(t => {
      const pill = Utils.dom.el('button', { class: `pill-option${s.tactics?.includes(t.label) ? ' selected' : ''}` });
      pill.textContent = `${t.emoji} ${t.label}`;
      pill.onclick = () => {
        this.state.toggleTactic(t.label);
        pill.classList.toggle('selected');
      };
      pillGroup.appendChild(pill);
    });

    // Inputs
    const nameInput = content.querySelector('#problem-name');
    nameInput.oninput = e => {
      this.state.updateField('externalize', 'problemName', e.target.value);
      const labels = document.querySelectorAll('.problem-name-inline');
      labels.forEach(l => l.textContent = e.target.value || 'it');
    };

    const formInput = content.querySelector('#physical-form');
    formInput.oninput = e => this.state.updateField('externalize', 'physicalForm', e.target.value);

    const intentInput = content.querySelector('#intent');
    intentInput.oninput = e => this.state.updateField('externalize', 'intent', e.target.value);

    // Voice
    content.querySelector('#voice-name').onclick = e =>
      this.app.voice.start(t => { nameInput.value = t; nameInput.dispatchEvent(new Event('input')); }, e.target);
    content.querySelector('#voice-form').onclick = e =>
      this.app.voice.start(t => { formInput.value += (formInput.value ? ' ' : '') + t; formInput.dispatchEvent(new Event('input')); }, e.target);
    content.querySelector('#voice-intent').onclick = e =>
      this.app.voice.start(t => { intentInput.value += (intentInput.value ? ' ' : '') + t; intentInput.dispatchEvent(new Event('input')); }, e.target);

    const canProceed = () => !!(this.state.story?.externalize?.problemName?.trim() &&
                                this.state.story?.externalize?.intent?.trim());

    return this._phaseWrap(1, content, {
      onNext: () => {
        if (!canProceed()) { Toast.show('Please name the problem and describe its intent.', 'warning'); return; }
        this.state.setPhase(2);
        this.state.setView('phase-2');
      }
    });
  }

  // ---- PHASE 2: MAP INFLUENCE ----
  renderPhase2() {
    const s  = this.state.story?.influence || {};
    const ex = this.state.story?.externalize || {};
    const pName = ex.problemName || 'the problem';
    const content = Utils.dom.el('div');

    content.innerHTML = `
      <p class="phase-theory">
        Now we map the reach of <em>${pName}</em>. Understanding where it has influence — and where it doesn't —
        helps reveal the full landscape of the problem and shows us where your alternative story might grow.
      </p>
      <div class="card-grid mt-xl" id="domain-grid"></div>`;

    const grid = content.querySelector('#domain-grid');
    CONFIG.DOMAINS.forEach(domain => {
      const card = Utils.dom.el('div', { class: 'domain-card' });
      card.innerHTML = `
        <div class="domain-card-header">
          <span class="domain-icon">${domain.icon}</span>
          <span class="domain-title">${domain.title}</span>
        </div>
        <p class="hint" style="font-size:0.78rem; margin-bottom:0.75rem; color:var(--text-muted);">
          ${domain.prompts[0]}
        </p>
        <textarea class="textarea" id="domain-${domain.id}"
          placeholder="How does ${pName} show up here?…"
          style="min-height:90px">${s[domain.id] || ''}</textarea>`;
      const ta = card.querySelector(`#domain-${domain.id}`);
      ta.oninput = e => this.state.updateField('influence', domain.id, e.target.value);
      grid.appendChild(card);
    });

    return this._phaseWrap(2, content);
  }

  // ---- PHASE 3: DECONSTRUCT ----
  renderPhase3() {
    const s  = this.state.story?.deconstruct || {};
    const ex = this.state.story?.externalize || {};
    const pName = ex.problemName || 'the problem';
    const content = Utils.dom.el('div');

    content.innerHTML = `
      <p class="phase-theory">
        Problems don't appear in a vacuum. They're shaped by history, culture, and the messages we've absorbed.
        Deconstructing these influences weakens the problem's authority — revealing it as a social construction,
        not an immutable truth about who you are.
      </p>

      <div class="form-section mt-xl">
        <div class="form-group">
          <label for="dec-history">History of the Problem</label>
          <p class="hint">When did <em>${pName}</em> first show up in your life? What was happening then?</p>
          <textarea id="dec-history" class="textarea"
            placeholder="Trace where it came from…">${s.history || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="dec-cultural">Cultural & Social Support</label>
          <p class="hint">What messages from society, family, or culture does <em>${pName}</em> draw on?</p>
          <textarea id="dec-cultural" class="textarea"
            placeholder="What wider narratives prop it up?…">${s.culturalSupport || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="dec-helped">Who or What Has Helped?</label>
          <p class="hint">Who or what has offered a different story — even briefly?</p>
          <textarea id="dec-helped" class="textarea"
            placeholder="People, moments, places that told a different story…">${s.whoHelped || ''}</textarea>
        </div>
      </div>`;

    content.querySelector('#dec-history').oninput   = e => this.state.updateField('deconstruct','history', e.target.value);
    content.querySelector('#dec-cultural').oninput  = e => this.state.updateField('deconstruct','culturalSupport', e.target.value);
    content.querySelector('#dec-helped').oninput    = e => this.state.updateField('deconstruct','whoHelped', e.target.value);

    return this._phaseWrap(3, content);
  }

  // ---- PHASE 4: SPARKLING MOMENTS ----
  renderPhase4() {
    const s  = this.state.story?.sparkling || {};
    const ex = this.state.story?.externalize || {};
    const pName = ex.problemName || 'the problem';
    const moments = s.moments || [];
    const content = Utils.dom.el('div');

    content.innerHTML = `
      <p class="phase-theory">
        Unique outcomes — or "sparkling moments" — are times when the problem did not dominate.
        They are openings in the dominant story. Finding them is not about denying difficulty;
        it's about discovering the truth the problem doesn't want you to see.
      </p>

      <div class="guide-questions mt-xl">
        <div class="guide-q">💫 When did <em>${pName}</em> not totally win?</div>
        <div class="guide-q">🔥 What would <em>${pName}</em> hate to know about you?</div>
        <div class="guide-q">⚡ When did you surprise <em>${pName}</em>?</div>
      </div>

      <div id="spark-list"></div>

      <div class="card mt-lg" id="add-spark-card">
        <div class="section-title">Add a Sparkling Moment</div>
        <div class="form-group">
          <label for="spark-situation">The Situation</label>
          <textarea id="spark-situation" class="textarea" style="min-height:80px"
            placeholder="Describe the context — when, where, what was happening…"></textarea>
        </div>
        <div class="form-group">
          <label for="spark-action">Your Action</label>
          <textarea id="spark-action" class="textarea" style="min-height:80px"
            placeholder="What did you do, think, or feel that defied the problem?…"></textarea>
        </div>
        <div class="form-group">
          <label for="spark-reveals">What It Reveals About You</label>
          <textarea id="spark-reveals" class="textarea" style="min-height:80px"
            placeholder="What does this moment say about your values, strengths, or character?…"></textarea>
        </div>
        <div class="form-group">
          <label for="spark-witness">Witness (optional)</label>
          <input type="text" id="spark-witness" class="input"
            placeholder="Who else saw or knows about this moment?">
        </div>
        <button class="btn btn-secondary" id="btn-add-spark">+ Add This Moment</button>
        <p class="text-muted mt-sm" id="spark-count-hint">Add at least 2 sparkling moments to continue.</p>
      </div>`;

    const renderMoments = () => {
      const list = content.querySelector('#spark-list');
      Utils.dom.clear(list);
      const m = this.state.story?.sparkling?.moments || [];
      m.forEach((mom, i) => {
        const card = Utils.dom.el('div', { class: 'spark-card' });
        card.innerHTML = `
          <div class="spark-card-header">
            <span class="spark-card-num">✦ Moment ${i + 1}</span>
            <button class="spark-card-delete" data-id="${mom.id}" title="Remove">✕</button>
          </div>
          ${mom.situation ? `<div class="spark-field"><div class="spark-field-label">Situation</div><div class="spark-field-value">${mom.situation}</div></div>` : ''}
          ${mom.action    ? `<div class="spark-field"><div class="spark-field-label">Your Action</div><div class="spark-field-value">${mom.action}</div></div>` : ''}
          ${mom.reveals   ? `<div class="spark-field"><div class="spark-field-label">What It Reveals</div><div class="spark-field-value">${mom.reveals}</div></div>` : ''}
          ${mom.witness   ? `<div class="spark-field"><div class="spark-field-label">Witness</div><div class="spark-field-value">${mom.witness}</div></div>` : ''}
          <div class="spark-card-date">${Utils.text.dateLabel(mom.createdAt)}</div>`;
        card.querySelector('.spark-card-delete').onclick = () => {
          this.state.removeSparklingMoment(mom.id);
          renderMoments();
        };
        list.appendChild(card);
      });
      const hint = content.querySelector('#spark-count-hint');
      if (hint) {
        const cnt = this.state.story?.sparkling?.moments?.length || 0;
        hint.textContent = cnt >= 2 ? `✓ ${cnt} moments captured.` : `Add at least 2 moments to continue (${cnt}/2).`;
      }
    };

    renderMoments();

    content.querySelector('#btn-add-spark').onclick = () => {
      const sit = content.querySelector('#spark-situation').value.trim();
      const act = content.querySelector('#spark-action').value.trim();
      const rev = content.querySelector('#spark-reveals').value.trim();
      const wit = content.querySelector('#spark-witness').value.trim();
      if (!sit || !act) { Toast.show('Please describe the situation and your action.', 'warning'); return; }
      this.state.addSparklingMoment({ situation: sit, action: act, reveals: rev, witness: wit });
      content.querySelector('#spark-situation').value = '';
      content.querySelector('#spark-action').value    = '';
      content.querySelector('#spark-reveals').value   = '';
      content.querySelector('#spark-witness').value   = '';
      renderMoments();
      Toast.show('Sparkling moment added!', 'success');
    };

    return this._phaseWrap(4, content, {
      onNext: () => {
        if ((this.state.story?.sparkling?.moments?.length || 0) < 2) {
          Toast.show('Add at least 2 sparkling moments to continue.', 'warning'); return;
        }
        this.state.setPhase(5);
        this.state.setView('phase-5');
      }
    });
  }

  // ---- PHASE 5: RE-AUTHOR ----
  renderPhase5() {
    const s  = this.state.story?.reauthor || {};
    const ex = this.state.story?.externalize || {};
    const content = Utils.dom.el('div');

    content.innerHTML = `
      <p class="phase-theory">
        Using the sparkling moments as evidence, we now write the alternative story — the one that the dominant
        narrative tried to erase. This is the story that reflects your actual values, strengths, and intentions.
        It is not a fantasy; it is a truer account of who you are.
      </p>

      <div class="form-section mt-xl">
        <div class="form-group">
          <label for="reauth-name">A New Name for This Story</label>
          <p class="hint">If your life story had a new title — one that captures who you're becoming — what would it be?</p>
          <input type="text" id="reauth-name" class="input"
            placeholder="e.g. The Resilient Explorer, The Tender Warrior…"
            value="${s.newName || ''}">
        </div>

        <div class="form-group">
          <label for="alt-story">The Alternative Story</label>
          <p class="hint">Write the story of your life from the perspective of your sparkling moments.
            What kind of person do they reveal you to be?</p>
          <textarea id="alt-story" class="textarea" style="min-height:180px"
            placeholder="Begin: &quot;Despite ${ex.problemName || 'the problem'}'s attempts, I have shown that I am someone who…&quot;">${s.alternativeStory || ''}</textarea>
        </div>

        <div class="form-group">
          <label>Identity Claims</label>
          <p class="hint">Complete the sentence: <em>"I am someone who…"</em> — one claim at a time.</p>
          <div id="claims-list" class="flex flex-col gap-sm mb-md"></div>
          <div class="add-item-row">
            <input type="text" id="new-claim" class="input" placeholder="I am someone who…" maxlength="200">
            <button class="btn btn-secondary" id="btn-add-claim">+</button>
          </div>
        </div>
      </div>`;

    const renderClaims = () => {
      const list = content.querySelector('#claims-list');
      Utils.dom.clear(list);
      (this.state.story?.reauthor?.identityClaims || []).forEach((claim, i) => {
        const row = Utils.dom.el('div', { class: 'identity-claim' });
        row.innerHTML = `
          <div class="identity-claim-num">${i + 1}</div>
          <div class="identity-claim-text">${claim}</div>
          <button class="identity-claim-del" data-idx="${i}" title="Remove">✕</button>`;
        row.querySelector('.identity-claim-del').onclick = () => {
          this.state.removeIdentityClaim(i);
          renderClaims();
        };
        list.appendChild(row);
      });
    };
    renderClaims();

    content.querySelector('#reauth-name').oninput   = e => this.state.updateField('reauthor','newName', e.target.value);
    content.querySelector('#alt-story').oninput     = e => this.state.updateField('reauthor','alternativeStory', e.target.value);

    const addClaim = () => {
      const inp = content.querySelector('#new-claim');
      const val = inp.value.trim();
      if (!val) return;
      this.state.addIdentityClaim(val);
      inp.value = '';
      renderClaims();
    };
    content.querySelector('#btn-add-claim').onclick = addClaim;
    content.querySelector('#new-claim').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); addClaim(); } };

    return this._phaseWrap(5, content, {
      onNext: () => {
        if (!this.state.story?.reauthor?.alternativeStory?.trim()) {
          Toast.show('Please write your alternative story before continuing.', 'warning'); return;
        }
        this.state.setPhase(6);
        this.state.setView('phase-6');
      }
    });
  }

  // ---- PHASE 6: WITNESS ----
  renderPhase6() {
    const s = this.state.story?.witness || {};
    const r = this.state.story?.reauthor || {};
    const content = Utils.dom.el('div');

    content.innerHTML = `
      <p class="phase-theory">
        Stories are made real through being witnessed. Sharing your alternative story with trusted others —
        or even with an imagined audience — reinforces the new narrative and gives it a life beyond your own mind.
        Who should know who you're becoming?
      </p>

      <div class="form-section mt-xl">
        <div class="form-group">
          <label for="declaration">Your Declaration</label>
          <p class="hint">Write a statement that declares your new story — something you could share or return to.</p>
          <textarea id="declaration" class="textarea" style="min-height:140px"
            placeholder="e.g. &quot;I, [name], am someone who… Despite everything, I choose to live by…&quot;">${s.declaration || ''}</textarea>
        </div>

        <div class="form-group">
          <label>Support Team</label>
          <p class="hint">Who are the people (real or imagined) who support your alternative story?</p>
          <div id="support-list" class="mb-md"></div>
          <div class="add-item-row" id="support-add-row">
            <input type="text" id="support-name" class="input" placeholder="Name…" style="flex:1.2">
            <input type="text" id="support-role" class="input" placeholder="Role (e.g. friend, therapist)…" style="flex:2">
            <button class="btn btn-secondary" id="btn-add-support">+</button>
          </div>
        </div>

        <div class="form-group">
          <label for="next-steps">Next Steps</label>
          <p class="hint">What small actions will help you live this new story?</p>
          <textarea id="next-steps" class="textarea"
            placeholder="What will you do in the next week to embody your new story?…">${s.nextSteps || ''}</textarea>
        </div>
      </div>`;

    const renderTeam = () => {
      const list = content.querySelector('#support-list');
      Utils.dom.clear(list);
      const team = this.state.story?.witness?.supportTeam || [];
      if (!team.length) {
        list.innerHTML = '<p class="text-muted" style="padding:0.5rem 0">No team members yet.</p>';
        return;
      }
      team.forEach(person => {
        const row = Utils.dom.el('div', { class: 'support-person' });
        row.innerHTML = `
          <div class="support-person-avatar">${Utils.text.initials(person.name)}</div>
          <div class="support-person-info">
            <div class="support-person-name">${person.name}</div>
            ${person.role ? `<div class="support-person-role">${person.role}</div>` : ''}
          </div>
          <button class="support-person-del" data-id="${person.id}" title="Remove">✕</button>`;
        row.querySelector('.support-person-del').onclick = () => {
          this.state.removeSupportPerson(person.id);
          renderTeam();
        };
        list.appendChild(row);
      });
    };
    renderTeam();

    content.querySelector('#declaration').oninput = e => this.state.updateField('witness','declaration', e.target.value);
    content.querySelector('#next-steps').oninput  = e => this.state.updateField('witness','nextSteps', e.target.value);

    const addPerson = () => {
      const name = content.querySelector('#support-name').value.trim();
      const role = content.querySelector('#support-role').value.trim();
      if (!name) { Toast.show('Please enter a name.', 'warning'); return; }
      this.state.addSupportPerson({ name, role });
      content.querySelector('#support-name').value = '';
      content.querySelector('#support-role').value = '';
      renderTeam();
    };
    content.querySelector('#btn-add-support').onclick = addPerson;
    content.querySelector('#support-name').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); addPerson(); } };

    return this._phaseWrap(6, content, {
      onNext: () => {
        if (!this.state.story?.witness?.declaration?.trim()) {
          Toast.show('Please write your declaration before completing.', 'warning'); return;
        }
        this.state.completeStory();
        this.state.setView('summary');
      }
    });
  }

  // ---- SUMMARY ----
  renderSummary() {
    const story = this.state.story;
    const ex    = story?.externalize || {};
    const r     = story?.reauthor    || {};
    const w     = story?.witness     || {};
    const sp    = story?.sparkling   || {};
    const el    = Utils.dom.el('div', { class: 'page-content' });

    el.innerHTML = `
      <div class="summary-header">
        <div class="summary-emblem">🌱</div>
        <h1 class="summary-title">${r.newName || 'Your Re-authored Story'}</h1>
        <p class="summary-subtitle">You've completed your narrative therapy journey. This story belongs to you.</p>
      </div>

      <div class="summary-section">
        <div class="summary-section-title">The Problem You Externalized</div>
        <div class="summary-item">
          <span class="summary-label">Name</span>
          <span class="summary-value">${ex.problemName || '—'}</span>
        </div>
        ${ex.intent ? `<div class="summary-item">
          <span class="summary-label">Its Intent</span>
          <span class="summary-value">${ex.intent}</span>
        </div>` : ''}
      </div>

      ${sp.moments?.length ? `
      <div class="summary-section">
        <div class="summary-section-title">Sparkling Moments (${sp.moments.length})</div>
        ${sp.moments.map((m,i) => `
          <div class="summary-item">
            <span class="summary-label">Moment ${i+1}</span>
            <span class="summary-value">${m.situation}${m.reveals ? ` — <em>${m.reveals}</em>` : ''}</span>
          </div>`).join('')}
      </div>` : ''}

      ${r.alternativeStory ? `
      <div class="summary-section">
        <div class="summary-section-title">Your Alternative Story</div>
        <div class="card" style="border-left: 4px solid var(--accent-primary)">
          <p style="font-family:var(--font-serif); line-height:1.75; color:var(--text-primary)">${r.alternativeStory}</p>
        </div>
      </div>` : ''}

      ${r.identityClaims?.length ? `
      <div class="summary-section">
        <div class="summary-section-title">Who You Are</div>
        ${r.identityClaims.map((c,i) => `
          <div class="identity-claim">
            <div class="identity-claim-num">${i+1}</div>
            <div class="identity-claim-text">${c}</div>
          </div>`).join('')}
      </div>` : ''}

      ${w.declaration ? `
      <div class="summary-section">
        <div class="summary-section-title">Your Declaration</div>
        <div class="guide-q" style="font-size:1rem; border-color:var(--accent-secondary)">${w.declaration}</div>
      </div>` : ''}

      <div class="summary-actions">
        <button class="btn btn-primary btn-lg" id="sum-export">⬇ Export My Story</button>
        <button class="btn btn-secondary btn-lg" id="sum-dashboard">Back to Dashboard</button>
        <button class="btn btn-ghost" id="sum-crisis" style="color:var(--text-muted); font-size:0.82rem">
          🌿 Crisis Resources
        </button>
      </div>`;

    el.querySelector('#sum-export').onclick = () => this.app.exportSingleStory();
    el.querySelector('#sum-dashboard').onclick = () => this.state.setView('dashboard');
    el.querySelector('#sum-crisis').onclick = () => { document.getElementById('crisis-modal').hidden = false; };
    el.appendChild(this.renderFooter());
    return el;
  }

  // ---- SETTINGS ----
  renderSettings() {
    const el = Utils.dom.el('div', { class: 'page-content' });
    const isDark = this.state.theme === 'dark';

    el.innerHTML = `
      <div class="phase-header">
        <h2 class="phase-title">Settings</h2>
      </div>
      <div class="settings-list">
        <div class="settings-item">
          <div>
            <div class="settings-item-label">Dark Mode</div>
            <div class="settings-item-desc">Switch to a darker, low-light theme.</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="toggle-dark" ${isDark ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <div>
            <div class="settings-item-label">Export All Stories</div>
            <div class="settings-item-desc">Download a JSON backup of all your stories.</div>
          </div>
          <button class="btn btn-secondary btn-sm" id="set-export">Export</button>
        </div>
        <div class="settings-item">
          <div>
            <div class="settings-item-label">Import Stories</div>
            <div class="settings-item-desc">Restore stories from a JSON backup.</div>
          </div>
          <button class="btn btn-secondary btn-sm" id="set-import">Import</button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="text-center" style="padding: var(--space-lg) 0">
        <p class="text-muted">Version ${CONFIG.VERSION} · All data is stored locally on your device.</p>
        <p class="text-muted mt-sm">
          <a href="https://lyfmail.com" target="_blank" rel="noopener">LYF Mail</a> ·
          <a href="mailto:${CONFIG.CONTACT}">${CONFIG.CONTACT}</a>
        </p>
      </div>

      <div class="page-nav">
        <button class="btn btn-ghost" id="set-back">← Back</button>
      </div>`;

    el.querySelector('#toggle-dark').onchange = e => {
      this.state.setTheme(e.target.checked ? 'dark' : 'light');
    };
    el.querySelector('#set-export').onclick = () => this.app.exportAllStories();
    el.querySelector('#set-import').onclick = () => this.app.importStories();
    el.querySelector('#set-back').onclick   = () => history.back() || this.state.setView('dashboard');

    el.appendChild(this.renderFooter());
    return el;
  }

  // ---- FOOTER ----
  renderFooter() {
    const footer = Utils.dom.el('footer', { class: 'app-footer' });
    footer.innerHTML = `
      <a href="${CONFIG.ORG_URL}" target="_blank" rel="noopener" class="footer-brand">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        Made by ${CONFIG.ORG_NAME}
      </a>
      <div class="footer-links">
        <a href="${CONFIG.ORG_URL}" target="_blank" rel="noopener">lyfmail.com</a>
        <span class="footer-sep">·</span>
        <a href="mailto:${CONFIG.CONTACT}">${CONFIG.CONTACT}</a>
        <span class="footer-sep">·</span>
        <button class="btn btn-ghost" style="padding:0; font-size:0.78rem; height:auto; color:var(--text-muted)"
          onclick="document.getElementById('crisis-modal').hidden=false">🌿 Crisis Resources</button>
      </div>`;
    return footer;
  }
}

// =====================================================
// APP HEADER
// =====================================================
function renderHeader(state, app) {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="header-logo" id="header-logo" role="button" tabindex="0" aria-label="Go to dashboard">
      <svg width="26" height="26" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="40" fill="var(--accent-primary)" opacity="0.15"/>
        <path d="M28 36 Q48 24 68 36 Q68 60 48 70 Q28 60 28 36Z" fill="var(--accent-primary)" opacity="0.2"/>
        <path d="M36 48 L44 56 L60 40" stroke="var(--accent-primary)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Rewriter
    </div>
    <div class="header-actions">
      <button class="icon-btn" id="hdr-crisis" title="Crisis Resources" aria-label="Crisis Resources">🌿</button>
      <button class="icon-btn" id="hdr-settings" title="Settings" aria-label="Settings">⚙</button>
    </div>`;

  const logo = header.querySelector('#header-logo');
  logo.onclick = () => {
    if (state.currentView !== 'dashboard' && state.currentView !== 'welcome') {
      state.setView('dashboard');
    }
  };
  logo.onkeydown = e => { if (e.key === 'Enter') logo.click(); };

  header.querySelector('#hdr-crisis').onclick = () => { document.getElementById('crisis-modal').hidden = false; };
  header.querySelector('#hdr-settings').onclick = () => state.setView('settings');

  return header;
}

// =====================================================
// MAIN APP
// =====================================================
class RewriterApp {
  constructor() {
    this.db     = new RewriterDatabase();
    this.state  = null;
    this.voice  = new VoiceController();
    this._deferredInstallPrompt = null;
  }

  async init() {
    // DB
    await this.db.init();

    // State
    this.state = new AppState(this.db);

    // Theme
    const savedTheme = await this.db.getSetting('theme');
    if (savedTheme) this.state.setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) this.state.setTheme('dark');

    // Renderer
    this.renderer = new UIRenderer(this.state, this);

    // Build shell
    const appEl = document.getElementById('app');
    const header = renderHeader(this.state, this);
    appEl.insertBefore(header, document.getElementById('root'));

    // Subscribe to state
    this.state.subscribe(() => this.renderer.render());

    // Check for existing stories
    const stories = await this.db.getAllStories();
    if (stories.length === 0) {
      this.state.currentView = 'welcome';
    } else {
      this.state.currentView = 'dashboard';
    }

    // Initial render
    this.renderer.render();

    // Hide loading screen
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.classList.add('fade-out');
      setTimeout(() => loading.remove(), 400);
    }

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this._deferredInstallPrompt = e;
      this._showInstallPrompt();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.state.story) {
          this.db.saveStory(this.state.story)
            .then(() => Toast.show('Saved!', 'success', 1500));
        }
      }
    });

    // Encryption modal
    this._setupEncryptModal();
  }

  startNewStory() {
    this.state.newStory();
    this.state.setPhase(1);
    this.state.setView('phase-1');
  }

  async loadStory(id) {
    await this.state.loadStory(id);
    this.state.setView(`phase-${this.state.story.phase}`);
  }

  // ---- EXPORT ----
  async exportAllStories(encrypt = false) {
    const data = await this.db.exportAll();
    if (encrypt) {
      await this._encryptExport(data, 'rewriter-all-stories');
    } else {
      this._downloadJSON(data, 'rewriter-all-stories');
    }
  }

  async exportSingleStory() {
    if (!this.state.story) return;
    const data = { version: CONFIG.VERSION, exportedAt: new Date().toISOString(), stories: [this.state.story] };
    this._downloadJSON(data, `rewriter-${this.state.story.externalize?.problemName || 'story'}`);
  }

  _downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('Story exported!', 'success');
  }

  async _encryptExport(data, filename) {
    return new Promise(resolve => {
      const modal    = document.getElementById('encrypt-modal');
      const confirm  = document.getElementById('encrypt-modal-confirm');
      const cancel   = document.getElementById('encrypt-modal-cancel');
      const close    = document.getElementById('encrypt-modal-close');
      const passEl   = document.getElementById('encrypt-passphrase');

      modal.hidden = false;
      passEl.value = '';
      passEl.focus();

      const done = async () => {
        const pw = passEl.value;
        if (!pw) { Toast.show('Please enter a passphrase.', 'warning'); return; }
        try {
          const cipher = await Utils.crypto.encrypt(JSON.stringify(data), pw);
          const encData = { encrypted: true, data: cipher };
          this._downloadJSON(encData, filename + '-encrypted');
        } catch (e) {
          Toast.show('Encryption failed.', 'error');
        }
        modal.hidden = true;
        resolve();
      };

      confirm.onclick = done;
      cancel.onclick  = () => { modal.hidden = true; resolve(); };
      close.onclick   = () => { modal.hidden = true; resolve(); };
      passEl.onkeydown = e => { if (e.key === 'Enter') done(); };
    });
  }

  // ---- IMPORT ----
  async importStories() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        let data = JSON.parse(text);
        if (data.encrypted) {
          const pw = prompt('This file is encrypted. Enter the passphrase:');
          if (!pw) return;
          const plain = await Utils.crypto.decrypt(data.data, pw);
          data = JSON.parse(plain);
        }
        await this.db.importData(data);
        Toast.show(`Imported ${data.stories?.length || 0} stories.`, 'success');
        this.state.setView('dashboard');
      } catch (err) {
        Toast.show('Import failed. Check the file and try again.', 'error');
      }
    };
    input.click();
  }

  // ---- PWA INSTALL ----
  _showInstallPrompt() {
    let prompt = document.querySelector('.install-prompt');
    if (!prompt) {
      prompt = document.createElement('div');
      prompt.className = 'install-prompt';
      prompt.innerHTML = `
        <div class="install-prompt-text">
          <strong>Install Rewriter</strong>
          <span>Add to your home screen for offline access.</span>
        </div>
        <div class="install-actions">
          <button class="btn btn-primary btn-sm" id="install-yes">Install</button>
          <button class="btn btn-ghost btn-sm" id="install-no">Not now</button>
        </div>`;
      document.body.appendChild(prompt);
    }
    prompt.hidden = false;

    prompt.querySelector('#install-yes').onclick = async () => {
      if (this._deferredInstallPrompt) {
        this._deferredInstallPrompt.prompt();
        await this._deferredInstallPrompt.userChoice;
        this._deferredInstallPrompt = null;
      }
      prompt.hidden = true;
    };
    prompt.querySelector('#install-no').onclick = () => { prompt.hidden = true; };
  }

  // ---- ENCRYPT MODAL SETUP ----
  _setupEncryptModal() {
    // Handled inline via _encryptExport
  }
}

// ---- BOOT ----
const app = new RewriterApp();
document.addEventListener('DOMContentLoaded', () => app.init());
