/* Core helpers: content indexes, cards, answer checking, speech. */
var Pois = window.Pois = { keys: {}, actions: {}, views: {} };
(function (P) {
  const DAY = 86400000;
  const S = () => Store.get();
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dayRec = (k = todayKey()) => { const s = S(); return s.days[k] || (s.days[k] = {}); };
  const bump = (f, n = 1) => { const d = dayRec(); d[f] = (d[f] || 0) + n; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function pickWeighted(items, w) {
    const ws = items.map(w); const tot = ws.reduce((a, b) => a + b, 0);
    let r = Math.random() * tot;
    for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }
  let toastT;
  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }

  const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    today: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    review: I('<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>'),
    verbs: I('<path d="M4 7h16M4 12h10M4 17h13"/><path d="M18 14l3 3-3 3"/>'),
    drills: I('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
    partner: I('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
    more: I('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'),
    grammar: I('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'),
    capture: I('<path d="M12 5v14M5 12h14"/>'),
    write: I('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    progress: I('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/>'),
    settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    speaker: I('<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
    check: I('<path d="M20 6L9 17l-5-5"/>'),
    cloud: I('<path d="M18 10h-1.3A7 7 0 1 0 9 19h9a5 5 0 0 0 0-9z"/>'),
    table: I('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
  };

  // ---------- speech ----------
  const TTS = {
    voices: [],
    init() {
      if (!('speechSynthesis' in window)) return;
      const load = () => { TTS.voices = speechSynthesis.getVoices().filter(v => /^pt/i.test(v.lang)); if (P.route && P.route() === 'settings' && P.render) P.render(); };
      load(); speechSynthesis.onvoiceschanged = load;
    },
    voice() {
      const want = S().settings.voice;
      const vs = TTS.voices;
      return vs.find(v => v.name === want) || vs.find(v => /pt[-_]PT/i.test(v.lang)) || vs.find(v => /portugal/i.test(v.name)) || vs.find(v => /^pt/i.test(v.lang)) || null;
    },
    hasPT() { return TTS.voices.some(v => /pt[-_]PT/i.test(v.lang) || /portugal/i.test(v.name)); },
    speak(text) {
      if (!('speechSynthesis' in window) || !text) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[{}]/g, '').replace(/___/g, '…').replace(/—/g, ','));
      const v = TTS.voice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'pt-PT';
      u.rate = S().settings.rate || 0.9;
      speechSynthesis.speak(u);
    },
  };

  // ---------- answer checking ----------
  const norm = s => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/[.!?¿¡,;:"“”«»…()]/g, ' ').replace(/[-‐–]/g, '-').replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
  const strip = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function checkAnswer(input, expected) {
    const exp = (Array.isArray(expected) ? expected : [expected]).filter(Boolean);
    const all = [];
    exp.forEach(e => { all.push(e); (Conj.ALT[e] || []).forEach(a => all.push(a)); });
    const n = norm(input);
    if (!n) return { ok: false, accent: false, empty: true };
    if (all.some(e => norm(e) === n)) return { ok: true, accent: false };
    if (all.some(e => strip(norm(e)) === strip(n))) return { ok: !S().settings.strictAccents, accent: true };
    return { ok: false, accent: false };
  }

  // ---------- content indexes ----------
  const VERB = {}; VERBS.forEach(def => { VERB[def.v] = { def, f: Conj.conjugate(def) }; });
  const VOC = {}; VOCAB.forEach(e => { VOC[e[0]] = e; });
  const CHK = {}; CHUNKS.forEach(e => { CHK[e[0]] = e; });
  function deck() {
    const every = S().settings.chunkEvery || 4; const out = []; let c = 0;
    VOCAB.forEach((e, i) => { out.push('v:' + e[0]); if ((i + 1) % every === 0 && c < CHUNKS.length) out.push('c:' + CHUNKS[c++][0]); });
    while (c < CHUNKS.length) out.push('c:' + CHUNKS[c++][0]);
    return out;
  }
  const clozeAnswer = s => (s.match(/\{([^}]+)\}/) || [])[1] || '';
  const clozeBlank = s => esc(s).replace(/\{[^}]+\}/, '<span class="blank">&nbsp;</span>');
  const clozeMark = s => esc(s).replace(/\{([^}]+)\}/, '<mark>$1</mark>');
  const clozePlain = s => s.replace(/[{}]/g, '');

  // ---------- cards ----------
  // ids: v:<word>:rec|prod · c:<chunk>:rec|prod · n:<noteId>:rec|prod|fix · f:<verb>|<tense>|<person>:form
  function parseId(id) { const a = id.indexOf(':'), b = id.lastIndexOf(':'); return { kind: id.slice(0, a), ref: id.slice(a + 1, b), dir: id.slice(b + 1) }; }
  function exists(id) {
    const { kind, ref } = parseId(id);
    if (kind === 'v') return !!VOC[ref]; if (kind === 'c') return !!CHK[ref]; if (kind === 'n') return !!S().notes[ref];
    if (kind === 'f') { const [v, t, p] = ref.split('|'); return !!(VERB[v] && VERB[v].f[t] && VERB[v].f[t][+p]); }
    return false;
  }
  function ensureCard(id, extra) { const s = S(); if (!s.cards[id]) s.cards[id] = Object.assign({ id, state: 0, created: Date.now() }, extra || {}); return s.cards[id]; }
  function isDue(c, now) { return !c.suspended && ((c.state > 0 && c.due <= now) || (c.state === 0 && c.avail && c.avail <= now)); }
  function dueIds(now = Date.now()) {
    return Object.values(S().cards).filter(c => isDue(c, now) && exists(c.id)).sort((a, b) => (a.due || a.avail) - (b.due || b.avail)).map(c => c.id);
  }
  function newLeft() { return Math.max(0, (S().settings.newPerDay || 0) - (dayRec().newc || 0)); }
  function newIds(limit) {
    const s = S(), out = [];
    // captured notes first: they come from your real life
    Object.values(s.notes).sort((a, b) => a.date - b.date).forEach(n => {
      const id = n.type === 'fix' ? `n:${n.id}:fix` : `n:${n.id}:rec`;
      if (!s.cards[id] && out.length < limit) out.push(id);
    });
    for (const key of deck()) { if (out.length >= limit) break; const id = key + ':rec'; if (!s.cards[id]) out.push(id); }
    return out;
  }
  function gradeCard(id, g) {
    const s = S(), now = Date.now();
    const c = ensureCard(id);
    const wasNew = !c.state, wasReview = c.state === 2;
    const n = FSRS.grade(c, g, now, { retention: s.settings.retention });
    s.cards[id] = n;
    if (wasNew && !c.avail && !c.fromMiss) bump('newc');
    bump('rev');
    if (wasReview) { bump('revN'); if (g > 1) bump('revOk'); }
    const { kind, ref, dir } = parseId(id);
    if (dir === 'rec' && n.state === 2) {
      const pid = `${kind}:${ref}:prod`;
      if (!s.cards[pid]) ensureCard(pid, { avail: now + DAY * (g === 4 ? 2 : 1) });
    }
    Store.change({ silent: true });
    return n;
  }
  function knowIt(id) {
    // "I already know this": push recognition far out, start production soon
    const s = S(), now = Date.now();
    s.cards[id] = Object.assign(ensureCard(id), { state: 2, s: 45, d: 3, due: now + 45 * DAY, last: now, reps: 1, known: true });
    const { kind, ref } = parseId(id);
    const pid = `${kind}:${ref}:prod`;
    if (!s.cards[pid]) ensureCard(pid, { avail: now + 2 * DAY });
    bump('newc'); Store.change({ silent: true });
  }
  function addFormCard(v, t, p) {
    const id = `f:${v}|${t}|${p}:form`; const s = S();
    if (!s.cards[id]) ensureCard(id, { avail: Date.now() + 10 * 60000, fromMiss: true });
    else if (s.cards[id].state === 2) { s.cards[id] = FSRS.grade(s.cards[id], 1, Date.now(), { retention: s.settings.retention }); }
  }

  const PERSON_PT = ['eu', 'tu', 'ele / ela / você', 'nós', 'eles / elas / vocês'];
  function personLabel(t, p) { if (t === 'imp') return ['', 'tu', 'você', '', 'vocês'][p]; return PERSON_PT[p]; }

  /* Describe how to show a card. */
  function view(id) {
    const { kind, ref, dir } = parseId(id);
    const c = S().cards[id] || { state: 0 };
    const isNew = !c.state && !c.avail;
    if (kind === 'v' || kind === 'c') {
      const e = kind === 'v' ? VOC[ref] : CHK[ref];
      const [word, gloss, info, sPT, sEN] = kind === 'v' ? e : [e[0], e[1], e[2], e[3], e[4]];
      const infoLine = kind === 'v' ? `<span class="badge">${esc(info)}</span>` : (info ? `<div class="small muted">${esc(info)}</div>` : '');
      const deckName = kind === 'v' ? 'Vocab' : 'Expression';
      if (dir === 'rec') return { id, isNew, type: 'self', deck: deckName, label: 'What does the highlighted part mean?',
        front: `<div class="sentence">${clozeMark(sPT)}</div>`, say: clozePlain(sPT),
        back: `<div class="big">${esc(word)}</div>${infoLine}<div class="en" style="margin-top:6px">${esc(gloss)}</div><div class="small muted" style="margin-top:10px">${esc(sEN)}</div>` };
      return { id, isNew, type: 'type', deck: deckName, label: 'Fill the gap',
        front: `<div class="en" style="margin-bottom:10px">${esc(sEN)}</div><div class="sentence">${clozeBlank(sPT)}</div><div class="small muted">(${esc(gloss)})</div>`,
        hint: `${esc(word)} · starts with “${esc(clozeAnswer(sPT).slice(0, 1))}”`,
        answer: clozeAnswer(sPT), say: clozePlain(sPT), sayAfter: true,
        back: `<div class="sentence">${clozeMark(sPT)}</div>${infoLine}` };
    }
    if (kind === 'n') {
      const n = S().notes[ref];
      const src = n.src === 'partner' ? 'From partner' : n.src === 'class' ? 'From class' : 'Captured';
      if (dir === 'fix') return { id, isNew, type: 'type', deck: src, label: 'Fix the mistake', long: true,
        front: `<div class="sentence" style="text-decoration: line-through; text-decoration-color: var(--bad)">${esc(n.pt)}</div>${n.en ? `<div class="small muted">${esc(n.en)}</div>` : ''}`,
        answer: n.fix, say: n.fix, sayAfter: true, back: `<div class="sentence">${esc(n.fix)}</div>` };
      const hasEx = n.ex && n.ex.toLowerCase().includes(n.pt.toLowerCase());
      const exMarked = hasEx ? esc(n.ex).replace(new RegExp(esc(n.pt).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), m => `<mark>${m}</mark>`) : '';
      if (dir === 'rec') return { id, isNew, type: 'self', deck: src, label: 'What does it mean?',
        front: hasEx ? `<div class="sentence">${exMarked}</div>` : `<div class="big">${esc(n.pt)}</div>${n.ex ? `<div class="small muted">${esc(n.ex)}</div>` : ''}`,
        say: hasEx ? n.ex : n.pt, back: `<div class="big">${esc(n.pt)}</div><div class="en">${esc(n.en)}</div>${n.exEn ? `<div class="small muted" style="margin-top:8px">${esc(n.exEn)}</div>` : ''}` };
      const blanked = hasEx ? esc(n.ex).replace(new RegExp(esc(n.pt).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '<span class="blank">&nbsp;</span>') : '';
      return { id, isNew, type: 'type', deck: src, label: 'How do you say it?',
        front: hasEx ? `<div class="en" style="margin-bottom:10px">${esc(n.exEn || n.en)}</div><div class="sentence">${blanked}</div><div class="small muted">(${esc(n.en)})</div>` : `<div class="big" style="font-size:1.4rem">${esc(n.en)}</div>`,
        answer: n.pt, say: hasEx ? n.ex : n.pt, sayAfter: true, hint: `starts with “${esc(n.pt.slice(0, 2))}”`, back: `<div class="big">${esc(n.pt)}</div>` };
    }
    if (kind === 'f') {
      const [v, t, p] = ref.split('|'); const vb = VERB[v]; const ans = vb.f[t][+p];
      return { id, isNew: false, type: 'type', deck: 'Verb form', label: Conj.TENSE[t].pt,
        front: `<div class="verbline">${esc(personLabel(t, +p))} · <i>${esc(v)}</i><b>${esc(Conj.TENSE[t].pt)}</b></div><div class="small muted">${esc(vb.def.en)} · ${esc(Conj.TENSE[t].en)}</div>`,
        answer: ans, say: (t === 'imp' ? '' : personLabel(t, +p).split(' / ')[0] + ' ') + ans, sayAfter: true,
        back: conjTable(v, t, +p) };
    }
    return null;
  }
  function conjTable(v, t, hl) {
    const f = VERB[v].f[t];
    return `<div class="conjrow">${f.map((x, p) => x ? `<span class="p">${esc(personLabel(t, p))}</span><span class="${p === hl ? 'hl' : ''}">${esc(x)}</span>` : '').join('')}</div>`;
  }
  function accentBar(target) {
    return `<div class="accents" data-accents="${target}">${['á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'].map(c => `<button type="button" data-ins="${c}" tabindex="-1">${c}</button>`).join('')}</div>`;
  }
  function recordConj(v, t, ok, ms) {
    const s = S(), k = v + '|' + t; const x = s.conj[k] || { n: 0, ok: 0, ms: 0, ema: 0.5 };
    x.ms = Math.round((x.ms * x.n + Math.min(ms, 20000)) / (x.n + 1));
    x.n++; if (ok) x.ok++;
    x.ema = x.ema * 0.7 + (ok ? 0.3 : 0); x.last = Date.now(); s.conj[k] = x;
    bump('conj'); if (ok) bump('conjOk');
  }
  function mastery(v, t) { const x = S().conj[v + '|' + t]; if (!x) return null; const speed = x.ms < 3500 ? 1 : x.ms < 6000 ? 0.8 : 0.6; return Math.max(0, Math.min(1, x.ema * speed * Math.min(1, 0.4 + x.n / 10))); }
  function streak() {
    const s = S(); let n = 0; const d = new Date();
    const active = k => { const r = s.days[k]; return r && ((r.rev || 0) + (r.conj || 0) + (r.drill || 0) + (r.write || 0) + (r.partnerMin || 0)) > 0; };
    if (!active(todayKey(d))) d.setDate(d.getDate() - 1);
    while (active(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  Object.assign(P, { DAY, S, esc, todayKey, dayRec, bump, uid, shuffle, pickWeighted, toast, ICON, TTS, checkAnswer, norm, VERB, VOC, CHK, deck,
    clozeAnswer, clozeBlank, clozeMark, clozePlain, parseId, exists, ensureCard, dueIds, newLeft, newIds, gradeCard, knowIt, addFormCard,
    view, conjTable, accentBar, recordConj, mastery, streak, personLabel });
})(Pois);
