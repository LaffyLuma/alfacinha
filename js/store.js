/* State + persistence. Local-first: browser storage always, plus an optional linked save file
   (desktop Chrome/Edge) and manual export/import (phone). No servers, no accounts. */
(function (root) {
  const KEY = 'pois.state.v1';
  const DEFAULT_SETTINGS = {
    name: 'Ryan', newPerDay: 10, retention: 0.9, maxReviews: 200, strictAccents: false,
    voice: '', rate: 0.9, autoplay: true,
    tenses: ['pres', 'pps', 'pimp'], verbSets: ['irr', 'stem', 'reg'], persons: [0, 1, 2, 3, 4], sprintLen: 20,
    drillSets: ['past', 'ppc', 'serestar'], drillLen: 10, chunkEvery: 4,
  };
  function fresh() {
    return { v: 1, created: Date.now(), updated: Date.now(), settings: Object.assign({}, DEFAULT_SETTINGS),
      cards: {}, notes: {}, conj: {}, drills: {}, days: {}, journal: [], partnerLog: [], seenGuide: false,
      deleted: { notes: {} }, resetAt: 0 };
  }
  let state = null;
  let listeners = [], anyListeners = [];
  let saveTimer = null, fileTimer = null;
  let fileHandle = null, fileStatus = { linked: false, name: '', lastSaved: 0, needsPermission: false, error: '' };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = upgrade(JSON.parse(raw));
    } catch (e) { console.warn('load failed', e); }
    if (!state) state = fresh();
    return state;
  }
  function upgrade(s) {
    const f = fresh();
    for (const k in f) if (s[k] === undefined) s[k] = f[k];
    s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
    return s;
  }
  function get() { return state; }
  function change(opts) {
    state.updated = Date.now();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveLocal, 250);
    if (fileHandle && !fileStatus.needsPermission) { clearTimeout(fileTimer); fileTimer = setTimeout(saveFile, 1500); }
    if (!(opts && opts.silent)) listeners.forEach(fn => fn());
    if (!(opts && opts.fromSync)) anyListeners.forEach(fn => fn());
  }
  function saveLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('local save failed', e); }
  }
  function flush() { clearTimeout(saveTimer); saveLocal(); if (fileHandle && !fileStatus.needsPermission) { clearTimeout(fileTimer); return saveFile(); } }
  function onChange(fn) { listeners.push(fn); }
  function onAnyChange(fn) { anyListeners.push(fn); }
  function replace(s, opts) { const u = state && state.updated; state = upgrade(s); if (opts && opts.keepUpdated) { state.updated = s.updated || u; saveLocal(); if (!opts.silent) listeners.forEach(fn => fn()); return; } change(opts); }

  // ---------- linked save file (File System Access API) ----------
  const fsSupported = () => typeof window !== 'undefined' && 'showSaveFilePicker' in window;
  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('pois', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  }
  async function idbSet(k, v) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
  async function idbGet(k) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('kv'); const q = tx.objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
  async function idbDel(k) { const db = await idb(); return new Promise((res) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').delete(k); tx.oncomplete = res; }); }

  async function initFile() {
    if (!fsSupported()) return;
    try {
      const h = await idbGet('saveHandle');
      if (!h) return;
      fileHandle = h; fileStatus.linked = true; fileStatus.name = h.name;
      const p = await h.queryPermission({ mode: 'readwrite' });
      if (p === 'granted') await syncFromFile();
      else fileStatus.needsPermission = true;
    } catch (e) { fileStatus.error = String(e.message || e); }
  }
  async function reconnect() {
    if (!fileHandle) return false;
    const p = await fileHandle.requestPermission({ mode: 'readwrite' });
    if (p !== 'granted') return false;
    fileStatus.needsPermission = false;
    await syncFromFile();
    listeners.forEach(fn => fn());
    return true;
  }
  async function syncFromFile() {
    try {
      const file = await fileHandle.getFile();
      const text = await file.text();
      if (text.trim()) {
        const fromFile = JSON.parse(text);
        if (fromFile && fromFile.v && (fromFile.updated || 0) > (state.updated || 0)) { state = upgrade(fromFile); saveLocal(); }
        else await saveFile();
      } else await saveFile();
    } catch (e) { fileStatus.error = 'Could not read save file: ' + (e.message || e); }
  }
  async function linkNewFile() {
    const h = await window.showSaveFilePicker({ suggestedName: 'pois-progress.json', types: [{ description: 'Alfacinha progress', accept: { 'application/json': ['.json'] } }] });
    fileHandle = h; await idbSet('saveHandle', h);
    fileStatus = { linked: true, name: h.name, lastSaved: 0, needsPermission: false, error: '' };
    await saveFile(); listeners.forEach(fn => fn());
  }
  async function linkExistingFile() {
    const [h] = await window.showOpenFilePicker({ types: [{ description: 'Alfacinha progress', accept: { 'application/json': ['.json'] } }] });
    const p = await h.requestPermission({ mode: 'readwrite' });
    if (p !== 'granted') throw new Error('Permission denied');
    const text = await (await h.getFile()).text();
    fileHandle = h; await idbSet('saveHandle', h);
    fileStatus = { linked: true, name: h.name, lastSaved: 0, needsPermission: false, error: '' };
    return text ? JSON.parse(text) : null;
  }
  async function unlinkFile() { fileHandle = null; await idbDel('saveHandle'); fileStatus = { linked: false, name: '', lastSaved: 0, needsPermission: false, error: '' }; listeners.forEach(fn => fn()); }
  async function saveFile() {
    if (!fileHandle) return;
    try {
      const w = await fileHandle.createWritable();
      await w.write(JSON.stringify(state));
      await w.close();
      fileStatus.lastSaved = Date.now(); fileStatus.error = '';
    } catch (e) {
      fileStatus.error = 'Save to file failed: ' + (e.message || e);
      if (/permission/i.test(fileStatus.error)) fileStatus.needsPermission = true;
    }
  }

  // ---------- export / import / merge ----------
  function exportBlob() { return new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' }); }
  function merge(a, b) {
    // Combine two progress files (phone, desktop, Drive). Most recently reviewed version of each card wins.
    // Deleted notes and "reset all progress" are respected on both sides. Settings stay per-device (a's).
    a = upgrade(JSON.parse(JSON.stringify(a))); b = upgrade(JSON.parse(JSON.stringify(b)));
    const R = Math.max(a.resetAt || 0, b.resetAt || 0);
    if (R) [a, b].forEach(x => prune(x, R));
    const out = a;
    for (const [id, cb] of Object.entries(b.cards)) {
      const ca = out.cards[id];
      if (!ca || (cb.last || 0) > (ca.last || 0) || (!ca.last && !cb.last && cb.suspended !== ca.suspended && (cb.created || 0) > (ca.created || 0))) out.cards[id] = cb;
      else if (ca.last === cb.last && cb.suspended && !ca.suspended) out.cards[id] = cb;
    }
    for (const [id, n] of Object.entries(b.notes)) if (!out.notes[id]) out.notes[id] = n;
    out.deleted = { notes: Object.assign({}, a.deleted.notes || {}, b.deleted.notes || {}) };
    for (const id of Object.keys(out.deleted.notes)) {
      delete out.notes[id];
      for (const cid of Object.keys(out.cards)) if (cid.startsWith('n:' + id + ':')) delete out.cards[cid];
    }
    // Stats: keep whichever side has more data (idempotent, so merging the same file twice is harmless)
    for (const [k, x] of Object.entries(b.conj)) { const y = out.conj[k]; if (!y || (x.n || 0) > (y.n || 0)) out.conj[k] = x; }
    for (const [k, x] of Object.entries(b.drills)) { const y = out.drills[k]; if (!y || (x.n || 0) > (y.n || 0)) out.drills[k] = x; }
    for (const [d, x] of Object.entries(b.days)) {
      const y = out.days[d];
      if (!y) { out.days[d] = x; continue; }
      const m = {}; for (const k of new Set([...Object.keys(y), ...Object.keys(x)])) m[k] = (typeof y[k] === 'number' || typeof x[k] === 'number') ? Math.max(y[k] || 0, x[k] || 0) : (y[k] || x[k]);
      out.days[d] = m;
    }
    const ids = new Set(out.journal.map(j => j.id)); b.journal.forEach(j => { if (!ids.has(j.id)) out.journal.push(j); });
    const pids = new Set(out.partnerLog.map(j => j.id)); b.partnerLog.forEach(j => { if (!pids.has(j.id)) out.partnerLog.push(j); });
    out.journal.sort((x, y) => y.date - x.date); out.partnerLog.sort((x, y) => y.date - x.date);
    out.seenGuide = a.seenGuide || b.seenGuide;
    out.resetAt = R;
    out.updated = Math.max(a.updated || 0, b.updated || 0);
    return out;
  }
  function prune(x, R) {
    for (const [id, c] of Object.entries(x.cards)) if ((c.last || c.created || 0) < R) delete x.cards[id];
    for (const [id, n] of Object.entries(x.notes)) if ((n.date || 0) < R) delete x.notes[id];
    for (const [k, c] of Object.entries(x.conj)) if ((c.last || 0) < R) delete x.conj[k];
    for (const [k, c] of Object.entries(x.drills)) if ((c.last || 0) < R) delete x.drills[k];
    const rk = new Date(R); const rkey = `${rk.getFullYear()}-${String(rk.getMonth() + 1).padStart(2, '0')}-${String(rk.getDate()).padStart(2, '0')}`;
    for (const k of Object.keys(x.days)) if (k < rkey) delete x.days[k];
    x.journal = x.journal.filter(j => j.date >= R); x.partnerLog = x.partnerLog.filter(j => j.date >= R);
  }
  // A compact fingerprint of the learning data, used to tell whether a merge actually changed anything.
  function fingerprint(x) { return JSON.stringify([x.cards, x.notes, x.conj, x.drills, x.days, x.journal.length, x.partnerLog.length, x.deleted, x.resetAt]); }
  function validate(obj) { return obj && typeof obj === 'object' && obj.v && obj.cards && obj.settings; }

  const api = { load, get, change, flush, onChange, onAnyChange, replace, fingerprint, fresh, merge, validate, exportBlob,
    fsSupported, initFile, reconnect, linkNewFile, linkExistingFile, unlinkFile, saveFile, fileStatus: () => fileStatus, DEFAULT_SETTINGS };
  root.Store = api;
})(this);
