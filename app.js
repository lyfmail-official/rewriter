/**
 * ══════════════════════════════════════════════════════
 * REWRITER v3 — THE LIVING MANUSCRIPT
 * Next-generation narrative therapy PWA
 *
 * Built for LYF Mail · https://lyfmail.com
 * ══════════════════════════════════════════════════════
 */

'use strict';

// ═══════════════════════
// §0 — CONFIG
// ═══════════════════════
const C = Object.freeze({
  APP: 'Rewriter', VERSION: '3.0.0',
  DB: { name: 'rewriter-db', version: 4 },
  ORG: { name: 'LYF Mail', url: 'https://lyfmail.com', email: 'rewriter@lyfmail.com' },
  CRYPTO: { ALGO:'AES-GCM', KEY_LEN:256, HASH:'SHA-256', ITER:310_000, SALT:16, IV:12 },
  SAVE_DELAY: 800,
  MIN_MOMENTS: 2,
  DISTRESS_RE: [
    /\b(suicid|end my life|kill myself|want to die|no point living|can't go on)\b/i,
    /\b(self.?harm|hurt myself|cutting)\b/i,
    /\b(hopeless|worthless|no one cares|completely alone forever)\b/i,
  ],
  PHASES: [
    { id:1, name:'Externalize',       icon:'🌊', time:'10–15 min' },
    { id:2, name:'Map Influence',     icon:'🗺️',  time:'10–15 min' },
    { id:3, name:'Deconstruct',       icon:'🔍',  time:'10 min'   },
    { id:4, name:'Sparkling Moments', icon:'✨',  time:'15–20 min' },
    { id:5, name:'Re-author',         icon:'✍️',  time:'15–20 min' },
    { id:6, name:'Witness',           icon:'🌱',  time:'10 min'   },
  ],
  TACTICS: [
    { e:'🏝️', t:'Telling me I\'m alone' },
    { e:'😔', t:'Using shame against me' },
    { e:'📊', t:'Making me compare myself to others' },
    { e:'🌑', t:'Convincing me things are hopeless' },
    { e:'😴', t:'Using exhaustion to keep me stuck' },
    { e:'⚖️', t:'Making me believe I deserve this' },
    { e:'🛡️', t:'Claiming to protect me' },
    { e:'🎭', t:'Convincing me this is who I am' },
  ],
  DOMAINS: [
    { id:'self',          icon:'🪞', name:'Self Relationship',
      hint:'How does it shape how you see yourself — your worth, your capabilities, your self-care?' },
    { id:'relationships', icon:'👥', name:'Relationships',
      hint:'How does it affect your connections — withdrawal, performance, feeling unlovable?' },
    { id:'direction',     icon:'🧭', name:'Life Direction',
      hint:'What possibilities or hopes has it closed? What does it say you are allowed to want?' },
    { id:'daily',         icon:'🌅', name:'Daily Living',
      hint:'What does it make you do or avoid daily — sleep, eating, work, routine?' },
  ],
});

// ═══════════════════════
// §1 — CANVAS AMBIENT SYSTEM
// ═══════════════════════
class AmbientCanvas {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.motes  = [];
    this.veins  = [];
    this.rafId  = null;
    this.mouse  = { x: 0, y: 0 };
    this._resize();
    this._spawn();
    this._spawnVeins();
    window.addEventListener('resize', () => this._resize(), { passive: true });
    window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }, { passive: true });
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _isDark() { return document.documentElement.dataset.theme !== 'light'; }

  _spawn() {
    const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    this.motes = Array.from({ length: count }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2 - 0.05,
      op: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.01 + 0.005,
    }));
  }

  _spawnVeins() {
    this.veins = Array.from({ length: 6 }, (_, i) => {
      const points = [];
      let x = Math.random() * window.innerWidth;
      let y = Math.random() * window.innerHeight;
      for (let j = 0; j < 12; j++) {
        x += (Math.random() - 0.5) * 80;
        y += (Math.random() - 0.5) * 60;
        points.push({ x, y });
      }
      return { points, alpha: Math.random() * 0.04 + 0.01, offset: Math.random() * 1000 };
    });
  }

  _drawMotes(t) {
    const dark = this._isDark();
    const gold  = dark ? 'rgba(201,168,76,' : 'rgba(139,94,20,';
    const teal  = dark ? 'rgba(42,107,107,' : 'rgba(26,85,85,';

    this.motes.forEach(m => {
      m.pulse += m.pulseSpeed;
      const op = m.op * (0.6 + 0.4 * Math.sin(m.pulse));
      const isGold = (m.r > 1.0);
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `${isGold ? gold : teal}${op})`;
      this.ctx.fill();

      // Drift
      m.x += m.vx + (this.mouse.x / window.innerWidth - 0.5) * 0.02;
      m.y += m.vy;

      // Wrap
      if (m.x < 0) m.x = window.innerWidth;
      if (m.x > window.innerWidth) m.x = 0;
      if (m.y < 0) m.y = window.innerHeight;
      if (m.y > window.innerHeight) m.y = 0;
    });
  }

  _drawVeins(t) {
    const dark = this._isDark();
    this.veins.forEach((v, i) => {
      const phase  = t * 0.0003 + v.offset;
      const alpha  = v.alpha * (0.5 + 0.5 * Math.sin(phase));
      const color  = dark ? `rgba(201,168,76,${alpha})` : `rgba(139,94,20,${alpha})`;

      this.ctx.beginPath();
      this.ctx.moveTo(v.points[0].x, v.points[0].y);
      for (let j = 1; j < v.points.length - 1; j++) {
        const cpx = (v.points[j].x + v.points[j+1].x) / 2;
        const cpy = (v.points[j].y + v.points[j+1].y) / 2;
        this.ctx.quadraticCurveTo(v.points[j].x, v.points[j].y, cpx, cpy);
      }
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth   = 0.5;
      this.ctx.stroke();
    });
  }

  start() {
    const tick = (t) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this._drawVeins(t);
      this._drawMotes(t);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

// ═══════════════════════
// §3 — CRYPTO
// ═══════════════════════
const Crypto = {
  async deriveKey(pw, salt) {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), { name:'PBKDF2' }, false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name:'PBKDF2', salt, iterations: C.CRYPTO.ITER, hash: C.CRYPTO.HASH },
      k, { name: C.CRYPTO.ALGO, length: C.CRYPTO.KEY_LEN }, false, ['encrypt','decrypt']
    );
  },
  async encrypt(plain, pw) {
    const salt = crypto.getRandomValues(new Uint8Array(C.CRYPTO.SALT));
    const iv   = crypto.getRandomValues(new Uint8Array(C.CRYPTO.IV));
    const key  = await Crypto.deriveKey(pw, salt);
    const enc  = await crypto.subtle.encrypt({ name: C.CRYPTO.ALGO, iv }, key, new TextEncoder().encode(plain));
    const buf  = new Uint8Array(C.CRYPTO.SALT + C.CRYPTO.IV + enc.byteLength);
    buf.set(salt, 0); buf.set(iv, C.CRYPTO.SALT); buf.set(new Uint8Array(enc), C.CRYPTO.SALT + C.CRYPTO.IV);
    return btoa(String.fromCharCode(...buf));
  },
  async decrypt(b64, pw) {
    let buf;
    try { buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0)); } catch { throw new Error('DECODE'); }
    const salt = buf.slice(0, C.CRYPTO.SALT);
    const iv   = buf.slice(C.CRYPTO.SALT, C.CRYPTO.SALT + C.CRYPTO.IV);
    const data = buf.slice(C.CRYPTO.SALT + C.CRYPTO.IV);
    const key  = await Crypto.deriveKey(pw, salt);
    try {
      const plain = await crypto.subtle.decrypt({ name: C.CRYPTO.ALGO, iv }, key, data);
      return new TextDecoder().decode(plain);
    } catch { throw new Error('WRONG_PASSWORD'); }
  },
  ok() { return !!(crypto?.subtle?.encrypt); },
};

// ═══════════════════════
// §4 — DATABASE
// ═══════════════════════
class DB {
  constructor() { this.db = null; this._mem = new Map(); this.fallback = false; }

  async init() {
    try { await this._open(); }
    catch(e) {
      console.warn('[RW] IndexedDB unavailable, using memory fallback', e);
      this.fallback = true;
      Toast.show('⚠ Storage limited — data may not persist.', 'warning', 6000);
    }
  }

  async _open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(C.DB.name, C.DB.version);
      r.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('stories')) {
          const s = db.createObjectStore('stories', { keyPath:'id' });
          s.createIndex('updatedAt', 'updatedAt');
          s.createIndex('status', 'status');
        }
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath:'key' });
      };
      r.onsuccess = e => { this.db = e.target.result; this.db.onversionchange = () => { this.db.close(); location.reload(); }; res(); };
      r.onerror   = () => rej(r.error);
      r.onblocked = () => rej(new Error('IDB blocked'));
    });
  }

  _tx(s, m = 'readonly') { return this.db.transaction(s, m).objectStore(s); }
  _p(r, fb = null) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result ?? fb); r.onerror = () => rej(r.error); }); }

  async save(story) {
    if (this.fallback) { this._mem.set(story.id, story); return; }
    return this._p(this._tx('stories','readwrite').put(story));
  }
  async get(id) {
    if (this.fallback) return this._mem.get(id) || null;
    return this._p(this._tx('stories').get(id), null);
  }
  async all() {
    if (this.fallback) return [...this._mem.values()].sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt));
    const r = await this._p(this._tx('stories').getAll(), []);
    return r.sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt));
  }
  async del(id) {
    if (this.fallback) { this._mem.delete(id); return; }
    return this._p(this._tx('stories','readwrite').delete(id));
  }
  async getSetting(k)    { if (this.fallback) return null; const r = await this._p(this._tx('settings').get(k), null); return r?.value ?? null; }
  async setSetting(k, v) { if (this.fallback) return; return this._p(this._tx('settings','readwrite').put({ key:k, value:v })); }

  async exportAll() {
    return { version: C.VERSION, schemaVersion:3, app:C.APP, exportedAt: new Date().toISOString(), stories: await this.all() };
  }

  async importData(data) {
    if (!data?.stories) throw new Error('INVALID');
    let ok = 0, skip = 0;
    for (const raw of data.stories) {
      const s = migrate(raw);
      const { valid } = validate(s);
      if (!valid) { skip++; continue; }
      await this.save(s); ok++;
    }
    return { ok, skip };
  }
}

// ═══════════════════════
// §5 — SCHEMA
// ═══════════════════════
function blank() {
  return {
    id: uid(), createdAt: now(), updatedAt: now(),
    phase: 1, status: 'in-progress', schemaVersion: 3,
    externalize: { name:'', personification:'', intent:'', tactics:[] },
    influence:   { self:'', relationships:'', direction:'', daily:'' },
    deconstruct: { history:'', culturalSupport:'', whoHelped:'' },
    sparkling:   { moments:[] },
    reauthor:    { newName:'', alternativeStory:'', identityClaims:[], values:'' },
    witness:     { declaration:'', supportTeam:[], nextSteps:'', commitments:'' },
  };
}

function migrate(s) {
  const r = { ...blank(), ...s };
  r.externalize = { name:'', personification:'', intent:'', tactics:[], ...s.externalize };
  r.influence   = { self:'', relationships:'', direction:'', daily:'', ...s.influence };
  r.deconstruct = { history:'', culturalSupport:'', whoHelped:'', ...s.deconstruct };
  r.sparkling   = { moments:[], ...s.sparkling };
  r.reauthor    = { newName:'', alternativeStory:'', identityClaims:[], values:'', ...s.reauthor };
  r.witness     = { declaration:'', supportTeam:[], nextSteps:'', commitments:'', ...s.witness };
  r.status      = r.status === 'complete' ? 'completed' : (r.status || 'in-progress');
  r.schemaVersion = 3;
  return r;
}

function validate(s) {
  const errs = [];
  if (!s?.id)        errs.push('No id');
  if (!s?.createdAt) errs.push('No createdAt');
  if (typeof s?.phase !== 'number' || s.phase < 1 || s.phase > 6) errs.push('Bad phase');
  ['externalize','influence','deconstruct','sparkling','reauthor','witness'].forEach(k => {
    if (!s?.[k]) errs.push(`Missing ${k}`);
  });
  return { valid: errs.length === 0, errs };
}

function hasDistress(text) {
  return C.DISTRESS_RE.some(r => r.test(text || ''));
}

// ═══════════════════════
// §6 — UTILS
// ═══════════════════════
const uid  = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c/4).toString(16));
const now  = () => new Date().toISOString();
const trunc = (s, n=50) => s && s.length > n ? s.slice(0,n)+'…' : (s||'');
const initials = n => (n||'').trim().split(/\s+/).map(w=>w[0]?.toUpperCase()||'').slice(0,2).join('');
const dateStr  = iso => { try { return new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric'}).format(new Date(iso)); } catch { return iso; } };
const ago = iso => {
  if (!iso) return '';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d/60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h/24);
  if (day < 7) return `${day}d ago`;
  return dateStr(iso);
};

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

function el(tag, props={}, ...ch) {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html')  e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, String(v));
  }
  for (const c of ch) c != null && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
}

const qs   = (s, ctx=document) => ctx.querySelector(s);
const clr  = n => { while (n.firstChild) n.removeChild(n.firstChild); };

// HTML escape helper — prevents user input from breaking templates
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ═══════════════════════
// §7 — TOAST
// ═══════════════════════
const Toast = {
  show(msg, type='info', dur=3200) {
    const icons = { success:'✦', error:'✕', warning:'⚠', info:'◆' };
    const t = el('div', { class:`toast ${type}` });
    t.textContent = `${icons[type]||'◆'} ${msg}`;
    qs('#toasts').appendChild(t);
    setTimeout(() => { t.style.animation=`toast-fall 300ms ease forwards`; setTimeout(()=>t.remove(),300); }, dur);
  },
};

// ═══════════════════════
// §8 — SAVE INDICATOR
// ═══════════════════════
const SavePulse = {
  el: null,
  _t: null,
  init() { this.el = qs('#save-pulse'); },
  saving() { this.el?.classList.remove('saved'); this.el?.classList.add('saving'); clearTimeout(this._t); },
  saved()  {
    this.el?.classList.remove('saving'); this.el?.classList.add('saved');
    this._t = setTimeout(() => this.el?.classList.remove('saved'), 2400);
  },
};

// ═══════════════════════
// §9 — MODAL
// ═══════════════════════
const Modal = {
  _stack: [],
  show(id) {
    const m = qs(`#${id}`); if (!m) return;
    m.hidden = false;
    this._stack.push(id);
    setTimeout(() => m.querySelector('button,input,textarea,a[href]')?.focus(), 60);
  },
  hide(id) {
    const m = qs(`#${id}`); if (!m) return;
    m.hidden = true;
    this._stack = this._stack.filter(x => x !== id);
  },
  _esc(e) { if (e.key==='Escape' && Modal._stack.length) Modal.hide(Modal._stack.at(-1)); },
  confirm(title, body) {
    return new Promise(res => {
      qs('#confirm-title').textContent = title;
      qs('#confirm-body').textContent = body;
      Modal.show('modal-confirm');
      const ok = qs('#confirm-ok');
      const no = qs('[data-close="modal-confirm"]');
      const done = v => { Modal.hide('modal-confirm'); ok.onclick=null; no.onclick=null; res(v); };
      ok.onclick = () => done(true);
      no.onclick = () => done(false);
    });
  },
  passphrase(title, desc, label='Confirm') {
    return new Promise(res => {
      qs('#pass-title').textContent = title;
      qs('#pass-desc').innerHTML    = desc;
      qs('#pass-confirm').textContent = label;
      const inp  = qs('#pass-input');
      const note = qs('#pass-note');
      const eye  = qs('#pass-eye');
      inp.value = ''; note.textContent = '';
      Modal.show('modal-pass');

      eye.onclick = () => { inp.type = inp.type==='password'?'text':'password'; eye.textContent=inp.type==='password'?'👁':'🙈'; };

      const done = v => {
        Modal.hide('modal-pass');
        inp.type='password'; eye.textContent='👁';
        qs('#pass-confirm').onclick = null;
        qs('[data-close="modal-pass"]').onclick = null;
        res(v);
      };
      qs('#pass-confirm').onclick = () => {
        const pw = inp.value.trim();
        if (!pw) { note.textContent='Please enter a passphrase.'; inp.focus(); return; }
        if (pw.length < 8) { note.textContent='Use at least 8 characters.'; return; }
        done(pw);
      };
      qs('[data-close="modal-pass"]').onclick = () => done(null);
      inp.onkeydown = e => { if (e.key==='Enter') qs('#pass-confirm').click(); };
    });
  },
};

// ═══════════════════════
// §10 — VOICE
// ═══════════════════════
class Voice {
  constructor() {
    this.rec = null; this.active = false; this.enabled = false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { this.rec = new SR(); this.rec.continuous=false; this.rec.lang='en-US'; this.available=true; }
  }
  start(cb, btn) {
    if (!this.rec)    { Toast.show('Voice not supported in this browser.','warning'); return; }
    if (!this.enabled){ Toast.show('Enable voice input in Settings first.','info'); return; }
    if (this.active)  { this.stop(btn); return; }
    this.active = true;
    if (btn) btn.classList.add('recording');
    this.rec.onresult = e => { cb(e.results[0][0].transcript); this.stop(btn); };
    this.rec.onerror  = () => { Toast.show('Voice error.','error'); this.stop(btn); };
    this.rec.onend    = () => this.stop(btn);
    this.rec.start();
  }
  stop(btn) {
    this.active = false;
    if (btn) btn.classList.remove('recording');
    try { this.rec?.stop(); } catch {}
  }
}

// ═══════════════════════
// §11 — ROUTER (hash-based)
// ═══════════════════════
const Router = {
  _cbs: [],
  get now() { return location.hash.slice(1) || 'welcome'; },
  push(r)    { if (this.now !== r) location.hash = r; else this._fire(r); },
  replace(r) { history.replaceState(null,'',`#${r}`); this._fire(r); },
  on(cb)     { this._cbs.push(cb); window.addEventListener('hashchange', () => this._fire(this.now)); },
  _fire(r)   { this._cbs.forEach(cb => cb(r)); },
};

// ═══════════════════════
// §12 — STATE
// ═══════════════════════
class State {
  constructor(db) {
    this.db = db; this.story = null; this.theme='dark'; this.voiceOn=false; this._subs=[];
    this._persist = debounce(async () => {
      if (!this.story) return;
      SavePulse.saving();
      try { await this.db.save(this.story); SavePulse.saved(); }
      catch(e) { console.error('[RW] Save fail',e); Toast.show('Save failed — check storage settings.','error'); }
    }, C.SAVE_DELAY);
  }

  sub(cb) { this._subs.push(cb); }
  _notify() { this._subs.forEach(cb=>cb()); }

  new() { this.story = blank(); this._notify(); }

  async load(id) {
    const r = await this.db.get(id);
    if (!r) { Toast.show('Story not found.','error'); return false; }
    this.story = migrate(r); this._notify(); return true;
  }

  set(section, field, val) {
    if (!this.story) return;
    this.story[section][field] = val;
    this.story.updatedAt = now();
    this._persist();
  }

  setPhase(n) {
    if (!this.story) return;
    this.story.phase     = Math.max(1, Math.min(6, n));
    this.story.updatedAt = now();
    this.db.save(this.story);
    this._notify();
  }

  toggleTactic(t) {
    if (!this.story) return;
    const arr = this.story.externalize.tactics;
    const i   = arr.indexOf(t);
    if (i >= 0) arr.splice(i,1); else arr.push(t);
    this.story.updatedAt = now();
    this._persist();
  }

  addMoment(m) {
    if (!this.story) return;
    this.story.sparkling.moments.push({ id:uid(), createdAt:now(), ...m });
    this.story.updatedAt = now();
    this.db.save(this.story); this._notify();
  }

  delMoment(id) {
    if (!this.story) return;
    this.story.sparkling.moments = this.story.sparkling.moments.filter(m=>m.id!==id);
    this.story.updatedAt = now();
    this.db.save(this.story); this._notify();
  }

  addClaim(t) {
    if (!this.story||!t?.trim()) return;
    this.story.reauthor.identityClaims.push(t.trim());
    this.story.updatedAt = now();
    this.db.save(this.story); this._notify();
  }

  delClaim(i) {
    if (!this.story) return;
    this.story.reauthor.identityClaims.splice(i,1);
    this.story.updatedAt = now();
    this.db.save(this.story); this._notify();
  }

  addSupport(p) {
    if (!this.story||!p?.name?.trim()) return;
    this.story.witness.supportTeam.push({ id:uid(), ...p });
    this.story.updatedAt = now();
    this.db.save(this.story); this._notify();
  }

  delSupport(id) {
    if (!this.story) return;
    this.story.witness.supportTeam = this.story.witness.supportTeam.filter(p=>p.id!==id);
    this.story.updatedAt = now();
    this.db.save(this.story); this._notify();
  }

  complete() {
    if (!this.story) return;
    this.story.status = 'completed';
    this.story.completedAt = now();
    this.story.updatedAt   = this.story.completedAt;
    this.db.save(this.story); this._notify();
  }

  pause() { if (this.story) this.db.save(this.story); this.story=null; Router.push('dashboard'); }

  async setTheme(t) { this.theme=t; document.documentElement.dataset.theme=t; await this.db.setSetting('theme',t); }
  async setVoice(v) { this.voiceOn=v; await this.db.setSetting('voice',v); }
}

// ═══════════════════════
// §13 — RENDERER
// ═══════════════════════
class Renderer {
  constructor(state, app) { this.S=state; this.app=app; this.root=qs('#root'); this._distressShown=false; }

  render(route) {
    clr(this.root);
    window.scrollTo({ top:0, behavior:'instant' });
    this._distressShown = false; // reset per page

    const map = {
      welcome:   () => this._welcome(),
      dashboard: () => this._dashboard(),
      summary:   () => this._summary(),
      settings:  () => this._settings(),
    };

    const fn = map[route] || (() => {
      const m = route.match(/^phase-([1-6])$/);
      if (m) { if (!this.S.story) { Router.replace('dashboard'); return el('div'); } return this._wrap(+m[1]); }
      Router.replace('welcome'); return el('div');
    });

    const page = fn();
    if (page) { page.classList?.add('page-enter'); this.root.appendChild(page); }

    // Update header
    const ind  = qs('#hdr-phase');
    const pause = qs('#hdr-pause');
    clr(ind);
    const pm = route.match(/^phase-([1-6])$/);
    if (pm && this.S.story) {
      const p = C.PHASES[+pm[1]-1];
      ind.appendChild(el('span', { class:'phase-stamp' }, `${p.icon} ${p.name}`));
      pause.hidden = false;
    } else {
      pause.hidden = true;
    }
  }

  // ── PHASE WRAPPER ────────────────────────────────
  _wrap(n) {
    const pct  = Math.round(((n-1)/6)*100);
    const page = el('div', { class:'manuscript' });

    // Quill progress
    const qp = el('div', { class:'quill-progress' });
    const qt = el('div', { class:'quill-track' });
    qt.appendChild(el('div', { class:'quill-fill', style:`width:${pct}%` }));
    qp.append(qt, el('span', { class:'quill-fraction' }, `${n}/6`));
    page.appendChild(qp);

    // Chapter content
    const content = this[`_p${n}`]();
    page.appendChild(content);

    // Navigation
    const nav = el('div', { class:'page-folio' });

    if (n > 1) {
      const b = el('button', { class:'ink-btn ghost', onclick:()=>{ this.S.setPhase(n-1); Router.push(`phase-${n-1}`); }});
      b.innerHTML = '← Return gently'; nav.appendChild(b);
    } else {
      const b = el('button', { class:'ink-btn ghost', onclick:()=>{ if(this.S.story) this.S.db.save(this.story); Router.push('dashboard'); }});
      b.innerHTML = '← Library'; nav.appendChild(b);
    }

    nav.appendChild(el('span', { class:'folio-spacer' }));

    const fwd = el('button', { class:'ink-btn gold', onclick:()=>this._advance(n) });
    fwd.innerHTML = n < 6 ? 'Continue the story →' : 'Complete My Story ✓';
    nav.appendChild(fwd);

    page.append(nav);
    return page;
  }

  // ── ADVANCE WITH VALIDATION ──────────────────────
  _advance(n) {
    const s  = this.S.story;
    const ok = {
      1: () => { if (!s.externalize.name?.trim()) { Toast.show('Please name the problem first.','warning'); return false; } if (!s.externalize.intent?.trim()) { Toast.show('Please describe its intent first.','warning'); return false; } return true; },
      2: () => true,
      3: () => true,
      4: () => { if ((s.sparkling.moments?.length||0) < C.MIN_MOMENTS) { Toast.show(`Add at least ${C.MIN_MOMENTS} moments to continue.`,'warning'); return false; } return true; },
      5: () => { if (!s.reauthor.alternativeStory?.trim()) { Toast.show('Please write your alternative story first.','warning'); return false; } return true; },
      6: () => { if (!s.witness.declaration?.trim()) { Toast.show('Please write your declaration first.','warning'); return false; } return true; },
    };
    if (!ok[n]?.()) return;
    if (n < 6) { this.S.setPhase(n+1); Router.push(`phase-${n+1}`); }
    else { this.S.complete(); Router.push('summary'); }
  }

  _checkDistress(text) {
    if (this._distressShown || !hasDistress(text)) return;
    this._distressShown = true;
    Modal.show('modal-distress');
  }

  _bindVoice(ctx, key, target, append=false) {
    const btn = ctx.querySelector(`[data-voice="${key}"]`);
    if (!btn) return;
    btn.onclick = () => this.app.voice.start(t => {
      target.value = append ? (target.value ? target.value+' '+t : t) : t;
      target.dispatchEvent(new Event('input'));
    }, btn);
  }

  // ══ WELCOME ══════════════════════════════════════
  _welcome() {
    const w = el('div', { class:'welcome page-enter' });
    w.innerHTML = `
      <svg class="welcome-quill" viewBox="0 0 80 120" fill="none" aria-hidden="true">
        <path d="M40 3 C62 3 76 24 73 55 C70 76 56 87 40 117 C24 87 10 76 7 55 C4 24 18 3 40 3Z"
          fill="url(#wqg)" opacity="0.85"/>
        <path d="M40 3 L40 117" stroke="rgba(201,168,76,0.4)" stroke-width="1"/>
        <path d="M36 110 L40 120 L44 110 L40 107 Z" fill="#C9A84C"/>
        <line x1="40" y1="120" x2="40" y2="134" stroke="#2A6B6B" stroke-width="1.5" stroke-linecap="round"/>
        <defs>
          <linearGradient id="wqg" x1="7" y1="3" x2="73" y2="117" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#E8E0CC"/>
            <stop offset="55%" stop-color="#C9A84C" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#2A6B6B" stop-opacity="0.4"/>
          </linearGradient>
        </defs>
      </svg>

      <div class="ornament">Narrative Therapy</div>

      <div>
        <h1 class="welcome-title">Rewriter</h1>
        <p class="welcome-tagline">Where your story gets rewritten — by you.</p>
      </div>

      <div class="illuminated-quote">
        <blockquote>The problem is the problem.<br>The person is not the problem.</blockquote>
        <cite>Michael White &amp; David Epston — Narrative Therapy</cite>
      </div>

      <div class="welcome-ctas">
        <button class="ink-btn gold full lg" id="w-new">✦ Begin a New Story</button>
        <button class="ink-btn ghost full lg" id="w-cont">Open the Library</button>
      </div>

      <p class="welcome-private">🔒 Everything stays on your device, always</p>`;

    w.querySelector('#w-new').onclick  = () => this.app.startNew();
    w.querySelector('#w-cont').onclick = () => Router.push('dashboard');
    // footer removed
    return w;
  }

  // ══ DASHBOARD ════════════════════════════════════
  _dashboard() {
    const page = el('div', { class:'library page-enter' });
    page.innerHTML = `
      <div class="library-head">
        <h1 class="library-title">The Library</h1>
        <p class="library-sub">Each story is a chapter in your re-authored life.</p>
        <div class="library-controls">
          <button class="ink-btn gold" id="lib-new">✦ New Story</button>
          <button class="ink-btn ghost" id="lib-import">⬆ Import</button>
          <button class="ink-btn ghost" id="lib-export">⬇ Export All</button>
        </div>
      </div>
      <div id="codex"></div>`;

    page.querySelector('#lib-new').onclick    = () => this.app.startNew();
    page.querySelector('#lib-import').onclick = () => this.app.importStories();
    page.querySelector('#lib-export').onclick = () => this.app.exportAll();

    const codex = page.querySelector('#codex');
    this.app.db.all().then(stories => {
      if (!stories.length) {
        codex.innerHTML = `
          <div class="empty-tome">
            <div class="empty-tome-icon">📖</div>
            <div class="empty-tome-title">Your first story awaits</div>
            <p class="empty-tome-desc">Begin a new story to enter the narrative therapy journey. All stories rest privately on your device — no account, no cloud.</p>
          </div>`;
        return;
      }
      const list = el('div', { class:'codex-list', role:'list' });
      stories.forEach(s => {
        const p    = C.PHASES[Math.min(s.phase,6)-1] || C.PHASES[0];
        const item = el('div', { class:'codex-entry', role:'listitem', tabindex:'0',
          'aria-label':`${esc(s.externalize?.name||'Untitled')} — Phase ${s.phase}` });
        const title = s.externalize?.name ? `The ${s.externalize.name} Story` : 'Untitled Story';
        item.innerHTML = `
          <div class="codex-phase-icon" aria-hidden="true">${p.icon}</div>
          <div class="codex-body">
            <div class="codex-name">${esc(trunc(title))}</div>
            <div class="codex-meta">
              <span class="codex-phase-tag">Phase ${s.phase}/6 — ${p.name}</span>
              <span>${ago(s.updatedAt)}</span>
              ${s.status==='completed' ? '<span>✦ Complete</span>' : ''}
            </div>
          </div>
          <button class="codex-del" data-id="${s.id}" aria-label="Delete" title="Delete">✕</button>
          <span aria-hidden="true" style="color:var(--text-3)">›</span>`;

        item.onclick = e => { if (e.target.closest('.codex-del')) return; this.app.open(s.id); };
        item.onkeydown = e => { if (e.key==='Enter') item.click(); };

        item.querySelector('.codex-del').onclick = async e => {
          e.stopPropagation();
          const ok = await Modal.confirm('Delete this story?', 'This permanently removes the story from your device. It cannot be undone.');
          if (ok) { await this.app.db.del(s.id); Toast.show('Story removed.','success'); Router.push('dashboard'); }
        };

        list.appendChild(item);
      });
      codex.appendChild(list);
    }).catch(err => {
      console.error('[RW] DB error', err);
      codex.innerHTML = `
        <div class="empty-tome">
          <div class="empty-tome-icon">⚠</div>
          <div class="empty-tome-title">Unable to load stories</div>
          <p class="empty-tome-desc">There was a problem accessing your device storage. Please refresh and try again.</p>
        </div>`;
    });

    // footer removed
    return page;
  }

  // ══ PHASE 1 ══════════════════════════════════════
  _p1() {
    const s  = this.S.story?.externalize || {};
    const pn = s.name || 'the problem';
    const w  = el('div');
    w.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-mark">Phase One</div>
        <h2 class="chapter-title"><span class="drop">E</span>xternalize</h2>
        <div class="chapter-lore">In narrative therapy, we name the problem as something separate from you. The problem is the problem — not you. Naming it, giving it form, strips it of the power it gains by hiding inside your identity.</div>
        <div class="chapter-timing">⏱ 10–15 min</div>
      </div>

      <div class="field-section">
        <div class="field-wrap">
          <label class="field-label" for="ext-name">Name the Problem *</label>
          <span class="field-lore">If this problem were a character — a creature, a force, a figure — what would you call it? <em>e.g. The Critic, Dark Cloud, The Void, Perfectionism</em></span>
          <div class="field-ink-wrap">
            <input type="text" id="ext-name" class="field-ink" maxlength="60"
              placeholder="Give it a name…" value="${esc(s.name)}" aria-required="true">
            <button class="voice-glyph" data-voice="ext-name" title="Voice (browser only, not stored)" aria-label="Voice input">🎙</button>
          </div>
          <span class="field-note">🎙 Voice processed locally by your browser — never sent anywhere</span>
        </div>

        <div class="field-wrap">
          <label class="field-label" for="ext-form">Personify It</label>
          <span class="field-lore">If <em id="pn1">${esc(pn)}</em> had a physical form — a size, colour, texture, sound, smell — describe it.</span>
          <div class="field-ink-wrap">
            <textarea id="ext-form" class="field-ink" placeholder="Describe its presence…">${esc(s.personification)}</textarea>
            <button class="voice-glyph" data-voice="ext-form" title="Voice input" aria-label="Voice input">🎙</button>
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label" for="ext-intent">Its Intent *</label>
          <span class="field-lore">What does <em id="pn2">${esc(pn)}</em> want you to believe about yourself or the world?</span>
          <div class="field-ink-wrap">
            <textarea id="ext-intent" class="field-ink" placeholder="What does it whisper?…" aria-required="true">${esc(s.intent)}</textarea>
            <button class="voice-glyph" data-voice="ext-intent" title="Voice input" aria-label="Voice input">🎙</button>
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label" id="tact-lbl">Its Tactics</label>
          <span class="field-lore">How does it operate? Select all that apply.</span>
          <div class="rune-set" role="group" aria-labelledby="tact-lbl" id="runes"></div>
        </div>
      </div>`;

    // Rune pills
    const rs = w.querySelector('#runes');
    C.TACTICS.forEach(t => {
      const r = el('button', { class:`rune${s.tactics?.includes(t.t)?' lit':''}`, type:'button',
        'aria-pressed': String(s.tactics?.includes(t.t)??false) });
      r.innerHTML = `<span>${t.e} ${t.t}</span>`;
      r.onclick = () => {
        this.S.toggleTactic(t.t);
        r.classList.toggle('lit');
        r.setAttribute('aria-pressed', String(r.classList.contains('lit')));
      };
      rs.appendChild(r);
    });

    // Bindings
    const ni = w.querySelector('#ext-name');
    const fi = w.querySelector('#ext-form');
    const ii = w.querySelector('#ext-intent');

    ni.oninput = e => {
      this.S.set('externalize','name',e.target.value);
      w.querySelectorAll('#pn1,#pn2').forEach(n => n.textContent = e.target.value||'the problem');
    };
    fi.oninput = e => { this.S.set('externalize','personification',e.target.value); this._checkDistress(e.target.value); };
    ii.oninput = e => { this.S.set('externalize','intent',e.target.value); this._checkDistress(e.target.value); };

    this._bindVoice(w,'ext-name',ni,false);
    this._bindVoice(w,'ext-form',fi,true);
    this._bindVoice(w,'ext-intent',ii,true);

    return w;
  }

  // ══ PHASE 2 ══════════════════════════════════════
  _p2() {
    const s  = this.S.story?.influence || {};
    const pn = this.S.story?.externalize?.name || 'the problem';
    const w  = el('div');
    w.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-mark">Phase Two</div>
        <h2 class="chapter-title"><span class="drop">M</span>ap the Influence</h2>
        <div class="chapter-lore">Now we trace how far <em>${esc(pn)}</em> has reached. Understanding its scope — and crucially its limits — reveals where your alternative story can take root and grow.</div>
        <div class="chapter-timing">⏱ 10–15 min</div>
      </div>
      <div class="vellum-grid" id="domain-grid"></div>`;

    C.DOMAINS.forEach(d => {
      const card = el('div', { class:'vellum' });
      card.innerHTML = `
        <div class="vellum-icon" aria-hidden="true">${d.icon}</div>
        <div class="vellum-label">${d.name}</div>
        <span class="field-lore" style="font-size:0.88rem;margin-bottom:var(--s3)">${d.hint}</span>
        <textarea class="field-ink" id="dom-${d.id}" style="min-height:90px"
          placeholder="How does ${esc(pn)} show up here?…" aria-label="${d.name}">${esc(s[d.id])}</textarea>`;
      const ta = card.querySelector(`#dom-${d.id}`);
      ta.oninput = e => { this.S.set('influence',d.id,e.target.value); this._checkDistress(e.target.value); };
      w.querySelector('#domain-grid').appendChild(card);
    });
    return w;
  }

  // ══ PHASE 3 ══════════════════════════════════════
  _p3() {
    const s  = this.S.story?.deconstruct || {};
    const pn = this.S.story?.externalize?.name || 'the problem';
    const w  = el('div');
    w.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-mark">Phase Three</div>
        <h2 class="chapter-title"><span class="drop">D</span>econstruct</h2>
        <div class="chapter-lore">Problems don't appear from nothing. They are shaped by history, culture, and messages absorbed over a lifetime. Tracing these origins weakens the problem's authority — revealing it as a construction, not a fixed truth about you.</div>
        <div class="chapter-timing">⏱ 10 min</div>
      </div>
      <div class="field-section">
        <div class="field-wrap">
          <label class="field-label" for="dec-hist">History of the Problem</label>
          <span class="field-lore">When did <em>${esc(pn)}</em> first appear? What was happening in your life then?</span>
          <textarea id="dec-hist" class="field-ink" placeholder="Trace its origins…">${esc(s.history)}</textarea>
        </div>
        <div class="field-wrap">
          <label class="field-label" for="dec-cult">Cultural &amp; Social Support</label>
          <span class="field-lore">What messages from family, culture, or society does <em>${esc(pn)}</em> draw power from?</span>
          <textarea id="dec-cult" class="field-ink" placeholder="What wider narratives sustain it?…">${esc(s.culturalSupport)}</textarea>
        </div>
        <div class="field-wrap">
          <label class="field-label" for="dec-help">Who Has Offered a Different Story?</label>
          <span class="field-lore">Who or what — even briefly — has told a different story about you?</span>
          <textarea id="dec-help" class="field-ink" placeholder="People, moments, or places that offered another view…">${esc(s.whoHelped)}</textarea>
        </div>
      </div>`;

    w.querySelector('#dec-hist').oninput = e => { this.S.set('deconstruct','history',e.target.value); this._checkDistress(e.target.value); };
    w.querySelector('#dec-cult').oninput = e => this.S.set('deconstruct','culturalSupport',e.target.value);
    w.querySelector('#dec-help').oninput = e => this.S.set('deconstruct','whoHelped',e.target.value);
    return w;
  }

  // ══ PHASE 4 ══════════════════════════════════════
  _p4() {
    const s  = this.S.story?.sparkling || {};
    const pn = this.S.story?.externalize?.name || 'the problem';
    const w  = el('div');

    w.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-mark">Phase Four</div>
        <h2 class="chapter-title"><span class="drop">S</span>parkling Moments</h2>
        <div class="chapter-lore">Unique outcomes — "sparkling moments" — are times when the problem did not win. Finding them is not denial. It is discovering the truth the problem has been trying to bury.</div>
        <div class="chapter-timing">⏱ 15–20 min</div>
      </div>

      <div class="illumined-qs" aria-label="Guiding questions">
        <div class="illumined-q">💫 When did <em>${esc(pn)}</em> not totally win?</div>
        <div class="illumined-q">🔥 What would <em>${esc(pn)}</em> hate to know about you?</div>
        <div class="illumined-q">⚡ When did you surprise <em>${esc(pn)}</em> — even a little?</div>
      </div>

      <div id="scroll-list" class="scroll-list" aria-live="polite" aria-label="Sparkling moments"></div>

      <div class="vellum" style="margin-top:var(--s6)" id="add-scroll">
        <div class="vellum-label" style="margin-bottom:var(--s4)">Add a Sparkling Moment</div>
        <div class="field-wrap">
          <label class="field-label" for="sc-sit">The Situation</label>
          <textarea id="sc-sit" class="field-ink" style="min-height:80px"
            placeholder="When did it happen? What was the context?…"></textarea>
        </div>
        <div class="field-wrap">
          <label class="field-label" for="sc-act">Your Action or Response</label>
          <textarea id="sc-act" class="field-ink" style="min-height:80px"
            placeholder="What did you do, think, or feel that defied the problem?…"></textarea>
        </div>
        <div class="field-wrap">
          <label class="field-label" for="sc-rev">What It Reveals About You</label>
          <textarea id="sc-rev" class="field-ink" style="min-height:80px"
            placeholder="What does this moment say about your values or character?…"></textarea>
        </div>
        <div class="field-wrap">
          <label class="field-label" for="sc-wit">Witness <span style="color:var(--text-3);font-weight:300">(optional)</span></label>
          <input type="text" id="sc-wit" class="field-ink" placeholder="Who else witnessed or knows of this?">
        </div>
        <button class="ink-btn teal" id="btn-add-scroll">+ Record This Moment</button>
        <p style="font-size:0.75rem;color:var(--text-3);margin-top:var(--s2);font-style:italic" id="scroll-note" aria-live="polite"></p>
      </div>`;

    const renderScrolls = () => {
      const list = w.querySelector('#scroll-list');
      clr(list);
      const moments = this.S.story?.sparkling?.moments || [];
      moments.forEach((m,i) => {
        const card = el('div', { class:'scroll', role:'article', 'aria-label':`Moment ${i+1}` });
        card.innerHTML = `
          <div class="scroll-num">✦ Moment ${i+1}</div>
          <button class="scroll-del" data-id="${m.id}" aria-label="Remove moment ${i+1}">✕</button>
          ${m.situation?`<div class="scroll-field"><div class="scroll-field-label">Situation</div><div class="scroll-field-value">${esc(m.situation)}</div></div>`:''}
          ${m.action?   `<div class="scroll-field"><div class="scroll-field-label">Your Action</div><div class="scroll-field-value">${esc(m.action)}</div></div>`:''}
          ${m.reveals?  `<div class="scroll-field"><div class="scroll-field-label">What It Reveals</div><div class="scroll-field-value">${esc(m.reveals)}</div></div>`:''}
          ${m.witness?  `<div class="scroll-field"><div class="scroll-field-label">Witness</div><div class="scroll-field-value">${esc(m.witness)}</div></div>`:''}
          <div class="scroll-date">${dateStr(m.createdAt)}</div>`;
        card.querySelector('.scroll-del').onclick = async () => {
          const ok = await Modal.confirm('Remove this moment?','This sparkling moment will be removed from your story.');
          if (ok) { this.S.delMoment(m.id); renderScrolls(); }
        };
        list.appendChild(card);
      });

      const note = w.querySelector('#scroll-note');
      const cnt  = this.S.story?.sparkling?.moments?.length||0;
      if (note) note.textContent = cnt >= C.MIN_MOMENTS
        ? `✦ ${cnt} moment${cnt!==1?'s':''} captured.`
        : `Add at least ${C.MIN_MOMENTS} moments to continue (${cnt}/${C.MIN_MOMENTS}).`;
    };
    renderScrolls();

    w.querySelector('#btn-add-scroll').onclick = () => {
      const sit = w.querySelector('#sc-sit').value.trim();
      const act = w.querySelector('#sc-act').value.trim();
      if (!sit||!act) { Toast.show('Please describe the situation and your response.','warning'); return; }
      this.S.addMoment({ situation:sit, action:act, reveals:w.querySelector('#sc-rev').value.trim(), witness:w.querySelector('#sc-wit').value.trim() });
      ['#sc-sit','#sc-act','#sc-rev','#sc-wit'].forEach(id=>{ w.querySelector(id).value=''; });
      renderScrolls();
      Toast.show('Sparkling moment recorded ✦','success');
    };

    return w;
  }

  // ══ PHASE 5 ══════════════════════════════════════
  _p5() {
    const s  = this.S.story?.reauthor || {};
    const pn = this.S.story?.externalize?.name || 'the problem';
    const w  = el('div');

    w.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-mark">Phase Five</div>
        <h2 class="chapter-title"><span class="drop">R</span>e-author</h2>
        <div class="chapter-lore">Using your sparkling moments as evidence, write the alternative story — the one the dominant narrative tried to erase. This is not fantasy. It is a truer account of who you actually are.</div>
        <div class="chapter-timing">⏱ 15–20 min</div>
      </div>

      <div class="field-section">
        <div class="field-wrap">
          <label class="field-label" for="ra-title">A New Title for This Chapter</label>
          <span class="field-lore">If your life had a new chapter title — capturing who you're becoming — what would it be?</span>
          <input type="text" id="ra-title" class="field-ink" maxlength="80"
            placeholder="e.g. The Resilient Wanderer, The Tender Warrior…" value="${esc(s.newName)}">
        </div>

        <div class="field-wrap">
          <label class="field-label" for="ra-story">The Alternative Story *</label>
          <span class="field-lore">Write the story of your life from the perspective of your sparkling moments. What kind of person do they reveal you to be?</span>
          <div class="field-ink-wrap">
            <textarea id="ra-story" class="field-ink" style="min-height:200px"
              placeholder="Begin: &quot;Despite ${esc(pn)}'s attempts, I have shown that I am someone who…&quot;"
              aria-required="true">${esc(s.alternativeStory)}</textarea>
            <button class="voice-glyph" data-voice="ra-story" aria-label="Voice input">🎙</button>
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label" for="ra-vals">Your Core Values</label>
          <span class="field-lore">What values does this alternative story honour? What do you care deeply about?</span>
          <textarea id="ra-vals" class="field-ink" style="min-height:80px"
            placeholder="e.g. connection, courage, honesty, creativity, tenderness…">${esc(s.values)}</textarea>
        </div>

        <div class="field-wrap">
          <label class="field-label" id="claims-lbl">Identity Claims</label>
          <span class="field-lore">Complete: <em>"I am someone who…"</em> — one at a time.</span>
          <div id="claim-codex" class="claim-codex" role="list" aria-labelledby="claims-lbl" aria-live="polite"></div>
          <div class="add-row">
            <input type="text" id="new-claim" class="field-ink" placeholder="I am someone who…" maxlength="200" aria-label="New identity claim">
            <button class="ink-btn teal" id="btn-claim">+</button>
          </div>
        </div>
      </div>`;

    const renderClaims = () => {
      const codex = w.querySelector('#claim-codex');
      clr(codex);
      (this.S.story?.reauthor?.identityClaims||[]).forEach((c,i)=>{
        const row = el('div', { class:'claim-verse', role:'listitem' });
        row.innerHTML = `<div class="claim-numeral" aria-hidden="true">${i+1}</div><div class="claim-text">${esc(c)}</div><button class="claim-erase" aria-label="Remove claim ${i+1}">✕</button>`;
        row.querySelector('.claim-erase').onclick = ()=>{ this.S.delClaim(i); renderClaims(); };
        codex.appendChild(row);
      });
    };
    renderClaims();

    w.querySelector('#ra-title').oninput = e => this.S.set('reauthor','newName',e.target.value);
    w.querySelector('#ra-vals').oninput  = e => this.S.set('reauthor','values',e.target.value);
    w.querySelector('#ra-story').oninput = e => { this.S.set('reauthor','alternativeStory',e.target.value); this._checkDistress(e.target.value); };

    this._bindVoice(w,'ra-story',w.querySelector('#ra-story'),true);

    const addClaim = () => {
      const inp = w.querySelector('#new-claim');
      if (!inp.value.trim()) return;
      this.S.addClaim(inp.value); inp.value=''; renderClaims(); inp.focus();
    };
    w.querySelector('#btn-claim').onclick   = addClaim;
    w.querySelector('#new-claim').onkeydown = e => { if(e.key==='Enter'){e.preventDefault();addClaim();} };

    return w;
  }

  // ══ PHASE 6 ══════════════════════════════════════
  _p6() {
    const s = this.S.story?.witness || {};
    const w = el('div');

    w.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-mark">Phase Six</div>
        <h2 class="chapter-title"><span class="drop">W</span>itness</h2>
        <div class="chapter-lore">Stories become real through being witnessed. Sharing your alternative story — even with an imagined audience — gives it life beyond your own mind. Who should know who you're becoming?</div>
        <div class="chapter-timing">⏱ 10 min</div>
      </div>

      <div class="field-section">
        <div class="field-wrap">
          <label class="field-label" for="wit-decl">Your Declaration *</label>
          <span class="field-lore">Write a statement that declares your new story — something you can return to when the old narrative grows loud.</span>
          <div class="field-ink-wrap">
            <textarea id="wit-decl" class="field-ink" style="min-height:150px"
              placeholder="I, [your name], am someone who… Despite everything, I choose to live by…"
              aria-required="true">${esc(s.declaration)}</textarea>
            <button class="voice-glyph" data-voice="wit-decl" aria-label="Voice input">🎙</button>
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label">Support Guild</label>
          <span class="field-lore">Who stands as witness to your alternative story — real or imagined?</span>
          <div id="guild-list" class="guild-list" role="list" aria-live="polite"></div>
          <div class="add-row" style="margin-top:var(--s4)">
            <input type="text" id="g-name" class="field-ink" placeholder="Name…" style="flex:1.2" aria-label="Name">
            <input type="text" id="g-role" class="field-ink" placeholder="Role (friend, therapist…)" style="flex:2" aria-label="Role">
            <button class="ink-btn teal" id="btn-guild">+</button>
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label" for="wit-next">Next Steps</label>
          <span class="field-lore">What small actions will help you live this new story in the week ahead?</span>
          <textarea id="wit-next" class="field-ink" placeholder="What will you do to embody your new story?…">${esc(s.nextSteps)}</textarea>
        </div>

        <div class="field-wrap">
          <label class="field-label" for="wit-commit">Commitments</label>
          <span class="field-lore">What do you commit to — to yourself and your witnesses?</span>
          <textarea id="wit-commit" class="field-ink" placeholder="I commit to…">${esc(s.commitments)}</textarea>
        </div>
      </div>`;

    const renderGuild = () => {
      const gl = w.querySelector('#guild-list');
      clr(gl);
      const team = this.S.story?.witness?.supportTeam||[];
      if (!team.length) { gl.innerHTML='<p style="font-size:0.8rem;color:var(--text-3);padding:var(--s2) 0;font-style:italic">No members yet.</p>'; return; }
      team.forEach(p => {
        const row = el('div', { class:'guild-member', role:'listitem' });
        row.innerHTML = `
          <div class="guild-crest" aria-hidden="true">${initials(p.name)}</div>
          <div class="guild-info"><div class="guild-name">${esc(p.name)}</div>${p.role?`<div class="guild-role">${esc(p.role)}</div>`:''}</div>
          <button class="guild-dismiss" data-id="${p.id}" aria-label="Remove ${esc(p.name)}">✕</button>`;
        row.querySelector('.guild-dismiss').onclick = ()=>{ this.S.delSupport(p.id); renderGuild(); };
        gl.appendChild(row);
      });
    };
    renderGuild();

    w.querySelector('#wit-decl').oninput  = e=>{ this.S.set('witness','declaration',e.target.value); this._checkDistress(e.target.value); };
    w.querySelector('#wit-next').oninput  = e=>this.S.set('witness','nextSteps',e.target.value);
    w.querySelector('#wit-commit').oninput= e=>this.S.set('witness','commitments',e.target.value);

    this._bindVoice(w,'wit-decl',w.querySelector('#wit-decl'),true);

    const addMember = ()=>{
      const n=w.querySelector('#g-name').value.trim();
      const r=w.querySelector('#g-role').value.trim();
      if (!n){Toast.show('Please enter a name.','warning');return;}
      this.S.addSupport({name:n,role:r});
      w.querySelector('#g-name').value=''; w.querySelector('#g-role').value='';
      renderGuild();
    };
    w.querySelector('#btn-guild').onclick = addMember;
    w.querySelector('#g-name').onkeydown  = e=>{if(e.key==='Enter'){e.preventDefault();addMember();}};

    return w;
  }

  // ══ SUMMARY ══════════════════════════════════════
  _summary() {
    const s  = this.S.story;
    if (!s) { Router.replace('dashboard'); return el('div'); }
    const ex = s.externalize; const r=s.reauthor; const w=s.witness; const sp=s.sparkling;

    const page = el('div', { class:'manuscript-complete page-enter' });
    page.innerHTML = `
      <div class="completion-crown">
        <h1 class="completion-title">${esc(r.newName) || 'Your Re-authored Story'}</h1>
        <p class="completion-sub">You have completed your narrative therapy journey. This story belongs to you alone.</p>
      </div>

      ${ex.name?`
      <div class="summary-chapter">
        <div class="summary-chapter-head">The Problem Externalized</div>
        <div class="summary-entry"><div class="summary-entry-label">Name</div><div class="summary-entry-value">${esc(ex.name)}</div></div>
        ${ex.intent?`<div class="summary-entry"><div class="summary-entry-label">Its Intent</div><div class="summary-entry-value">${esc(ex.intent)}</div></div>`:''}
        ${ex.tactics?.length?`<div class="summary-entry"><div class="summary-entry-label">Tactics Identified</div><div class="summary-entry-value">${ex.tactics.join(' · ')}</div></div>`:''}
      </div>`:''}

      ${sp.moments?.length?`
      <div class="summary-chapter">
        <div class="summary-chapter-head">Sparkling Moments (${sp.moments.length})</div>
        ${sp.moments.map((m,i)=>`
          <div class="summary-entry">
            <div class="summary-entry-label">Moment ${i+1}</div>
            <div class="summary-entry-value">${esc(m.situation)}${m.reveals?`<br><em style="color:var(--text-3)">${esc(m.reveals)}</em>`:''}</div>
          </div>`).join('')}
      </div>`:''}

      ${r.alternativeStory?`
      <div class="summary-chapter">
        <div class="summary-chapter-head">The Alternative Story</div>
        <div class="declaration-folio">${esc(r.alternativeStory)}</div>
      </div>`:''}

      ${r.identityClaims?.length?`
      <div class="summary-chapter">
        <div class="summary-chapter-head">Who You Are</div>
        <div class="claim-codex">
          ${r.identityClaims.map((c,i)=>`
            <div class="claim-verse">
              <div class="claim-numeral">${i+1}</div>
              <div class="claim-text">${esc(c)}</div>
            </div>`).join('')}
        </div>
      </div>`:''}

      ${w.declaration?`
      <div class="summary-chapter">
        <div class="summary-chapter-head">Your Declaration</div>
        <div class="declaration-folio">${esc(w.declaration)}</div>
      </div>`:''}

      <div class="summary-actions">
        <button class="ink-btn gold full lg" id="sum-export">⬇ Export My Story</button>
        <button class="ink-btn ghost full" id="sum-export-enc">🔒 Export Encrypted</button>
        <button class="ink-btn ghost full" id="sum-dash">← Return to the Library</button>
        <button class="ink-btn ghost" style="margin-top:var(--s2);font-size:0.8rem;color:var(--text-3)"
          onclick="Modal.show('modal-crisis')">🌿 Crisis Resources</button>
      </div>`;

    page.querySelector('#sum-export').onclick     = ()=>this.app.exportSingle(false);
    page.querySelector('#sum-export-enc').onclick = ()=>this.app.exportSingle(true);
    page.querySelector('#sum-dash').onclick       = ()=>Router.push('dashboard');
    // footer removed
    return page;
  }

  // ══ SETTINGS ═════════════════════════════════════
  _settings() {
    const isDark = this.S.theme==='dark';
    const voice  = this.S.voiceOn;
    const page   = el('div', { class:'manuscript page-enter' });

    page.innerHTML = `
      <div class="chapter-header" style="margin-bottom:var(--s6)">
        <div class="chapter-mark">Settings</div>
        <h2 class="chapter-title" style="font-size:2rem">Preferences</h2>
      </div>

      <div class="settings-tome">
        <div class="settings-leaf">
          <div><div class="settings-leaf-label">Dark Mode</div><div class="settings-leaf-desc">Aged vellum dark theme (default) or warm parchment light.</div></div>
          <label class="rune-toggle" aria-label="Toggle dark mode">
            <input type="checkbox" id="set-dark" ${isDark?'checked':''}><span class="rune-track"></span>
          </label>
        </div>
        <div class="settings-leaf">
          <div>
            <div class="settings-leaf-label">Voice Input</div>
            <div class="settings-leaf-desc">Opt in to browser speech recognition. Audio never leaves your device.</div>
          </div>
          <label class="rune-toggle" aria-label="Toggle voice input">
            <input type="checkbox" id="set-voice" ${voice?'checked':''}><span class="rune-track"></span>
          </label>
        </div>
        <div class="settings-leaf">
          <div><div class="settings-leaf-label">Export All Stories</div><div class="settings-leaf-desc">Download a JSON backup of every story.</div></div>
          <div style="display:flex;gap:var(--s2)">
            <button class="ink-btn ghost sm" id="set-exp">Export</button>
            ${Crypto.ok()?'<button class="ink-btn ghost sm" id="set-exp-enc">🔒 Encrypted</button>':''}
          </div>
        </div>
        <div class="settings-leaf">
          <div><div class="settings-leaf-label">Import Stories</div><div class="settings-leaf-desc">Restore from a JSON backup (plain or encrypted).</div></div>
          <button class="ink-btn ghost sm" id="set-imp">Import</button>
        </div>
      </div>

      <div class="ornamental-divide"><span>✦ ✦ ✦</span></div>

      <p style="text-align:center;font-family:var(--fell);font-style:italic;font-size:0.85rem;color:var(--text-3)">
        Version ${C.VERSION} · All data lives only on your device<br>
        <a href="${C.ORG.url}" target="_blank" rel="noopener noreferrer">${C.ORG.name}</a> ·
        <a href="mailto:${C.ORG.email}">${C.ORG.email}</a>
      </p>

      <div class="page-folio" style="margin-top:var(--s8);border-top:none">
        <button class="ink-btn ghost" onclick="Router.push('dashboard')">← Back to the Library</button>
      </div>`;

    page.querySelector('#set-dark').onchange  = e=>this.S.setTheme(e.target.checked?'dark':'light');
    page.querySelector('#set-voice').onchange = e=>{ this.S.setVoice(e.target.checked); this.app.voice.enabled=e.target.checked; Toast.show(e.target.checked?'Voice enabled.':'Voice disabled.','info'); };
    page.querySelector('#set-exp').onclick    = ()=>this.app.exportAll(false);
    page.querySelector('#set-exp-enc')?.addEventListener('click', ()=>this.app.exportAll(true));
    page.querySelector('#set-imp').onclick    = ()=>this.app.importStories();

    // footer removed
    return page;
  }
}

// ═══════════════════════
// §14 — APP
// ═══════════════════════
class App {
  constructor() {
    this.db      = new DB();
    this.state   = null;
    this.rend    = null;
    this.voice   = new Voice();
    this.ambient = null;
    // cursor removed
    this._pwa    = null;
  }

  async init() {
    // Ambient canvas
    this.ambient = new AmbientCanvas();
    this.ambient.start();


    // DB
    await this.db.init();

    // State
    this.state = new State(this.db);

    // Theme
    const t = await this.db.getSetting('theme');
    if (t) { this.state.theme=t; document.documentElement.dataset.theme=t; }
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) { this.state.theme='light'; document.documentElement.dataset.theme='light'; }

    // Voice setting
    const v = await this.db.getSetting('voice');
    if (v) { this.state.voiceOn=true; this.voice.enabled=true; }

    // Save indicator
    SavePulse.init();

    // Renderer
    this.rend = new Renderer(this.state, this);

    // Header wiring
    qs('#hdr-home').onclick    = ()=>{ if(this.state.story) this.db.save(this.state.story); Router.push('dashboard'); };
    qs('#hdr-crisis').onclick  = ()=>Modal.show('modal-crisis');
    qs('#hdr-settings').onclick= ()=>Router.push('settings');
    qs('#hdr-pause').onclick   = ()=>this.state.pause();
    qs('#hdr-theme').onclick   = ()=>this.state.setTheme(this.state.theme==='dark'?'light':'dark');

    // Modal dismissals
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', ()=>Modal.hide(b.dataset.close)));
    document.querySelectorAll('.modal-veil').forEach(m => m.addEventListener('click', e=>{ if(e.target===m) Modal.hide(m.id); }));
    document.addEventListener('keydown', Modal._esc.bind(Modal));

    // Distress modal actions
    qs('#dc-crisis').onclick   = ()=>{ Modal.hide('modal-distress'); Modal.show('modal-crisis'); };
    qs('#dc-pause').onclick    = ()=>{ Modal.hide('modal-distress'); this.state.pause(); };
    qs('#dc-continue').onclick = ()=>Modal.hide('modal-distress');

    // Router
    Router.on(route => this.rend.render(route));

    // Initial route
    const stories = await this.db.all();
    const h = location.hash.slice(1);
    const validRoutes = /^(welcome|dashboard|settings|phase-[1-6]|summary)$/;
    Router.replace(h && validRoutes.test(h) ? h : (stories.length ? 'dashboard' : 'welcome'));

    // Loader out
    setTimeout(()=>{
      const loader = qs('#loader');
      if (loader) { loader.classList.add('out'); setTimeout(()=>loader.remove(), 900); }
    }, 800);

    // Service worker
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});

    // PWA install
    window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); this._pwa=e; qs('#install-banner').hidden=false; });
    qs('#install-yes').onclick = async ()=>{ if(this._pwa){this._pwa.prompt();await this._pwa.userChoice;this._pwa=null;} qs('#install-banner').hidden=true; };
    qs('#install-no').onclick  = ()=>qs('#install-banner').hidden=true;

    // Ctrl+S
    document.addEventListener('keydown', e=>{ if((e.ctrlKey||e.metaKey)&&e.key==='s'){ e.preventDefault(); if(this.state.story){ SavePulse.saving(); this.db.save(this.state.story).then(()=>{SavePulse.saved();Toast.show('✦ Saved','success',1800);}); } } });
  }

  startNew() { this.state.new(); this.state.setPhase(1); Router.push('phase-1'); }

  async open(id) {
    const ok = await this.state.load(id);
    if (!ok) return;
    Router.push(`phase-${this.state.story.phase}`);
  }

  async exportSingle(enc=false) {
    if (!this.state.story) return;
    const data = { version:C.VERSION, schemaVersion:3, app:C.APP, exportedAt:now(), stories:[this.state.story] };
    enc ? await this._encExport(data, `rewriter-${this.state.story.externalize?.name||'story'}`)
        : this._dl(data, `rewriter-${this.state.story.externalize?.name||'story'}`);
  }

  async exportAll(enc=false) {
    const data = await this.db.exportAll();
    enc ? await this._encExport(data,'rewriter-all-stories') : this._dl(data,'rewriter-all-stories');
  }

  async _encExport(data, name) {
    if (!Crypto.ok()) { Toast.show('Encryption unavailable — exporting plain.','warning'); this._dl(data,name); return; }
    const pw = await Modal.passphrase('Encrypt Your Export','Enter a strong passphrase. It is <strong>never stored</strong> — you need it to import later.','Encrypt & Export');
    if (!pw) return;
    try {
      const cipher = await Crypto.encrypt(JSON.stringify(data,null,2), pw);
      this._dl({ encrypted:true, version:C.VERSION, data:cipher }, name+'-encrypted');
      Toast.show('✦ Exported & encrypted','success');
    } catch(e) {
      console.error('[RW] Encrypt fail',e);
      Toast.show('Encryption failed — exporting plain.','error');
      this._dl(data, name);
    }
  }

  async importStories() {
    const inp = Object.assign(document.createElement('input'),{type:'file',accept:'.json'});
    inp.onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      let raw;
      try { raw = JSON.parse(await file.text()); } catch { Toast.show('Could not parse file.','error'); return; }

      if (raw.encrypted) {
        if (!Crypto.ok()) { Toast.show('Encryption unavailable — cannot import.','error'); return; }
        const pw = await Modal.passphrase('Decrypt Import','This file is encrypted. Enter the passphrase used when exporting.','Decrypt & Import');
        if (!pw) return;
        try { raw = JSON.parse(await Crypto.decrypt(raw.data, pw)); }
        catch(err) {
          Toast.show(err.message==='WRONG_PASSWORD'?'Wrong passphrase.':'File may be corrupted.','error');
          return;
        }
      }

      try {
        const { ok, skip } = await this.db.importData(raw);
        Toast.show(`Imported ${ok} stor${ok!==1?'ies':'y'}${skip?`, skipped ${skip} invalid`:''}`, ok>0?'success':'warning');
        Router.push('dashboard');
      } catch { Toast.show('Import failed — invalid format.','error'); }
    };
    inp.click();
  }

  _dl(data, name) {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'),{href:url,download:`${name.replace(/[^a-z0-9-_]/gi,'-').toLowerCase()}.json`}).click();
    URL.revokeObjectURL(url);
    Toast.show('✦ Downloaded','success',2000);
  }
}

// ═══════════════════════
// BOOT
// ═══════════════════════
window.Modal  = Modal;
window.Router = Router;

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
