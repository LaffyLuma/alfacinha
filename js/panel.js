/* Verbo rápido: a quick-reference conjugation panel that opens over any page (side panel on the PC,
   bottom sheet on the phone). Shows only what you need: the one form, that tense down the persons,
   and that person across this week's tenses. It's a lookup, not a drill: typing in the search is optional. */
(function (P) {
  const { esc, ICON, TTS } = P;
  const act = P.actions;
  const COMMON = ['ser', 'estar', 'ter', 'ir', 'fazer', 'dizer', 'poder', 'querer', 'saber', 'dar', 'ver', 'pôr'];
  const FALLBACK = ['pps', 'pimp', 'ppc', 'cond'];
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  const VS = { v: null, t: 'pres', p: 0, q: '', open: false, more1: false, more3: false, seq: false, tab: 'verb' };

  // ---------- reverse index: any conjugated form → [{v, t, p}] ----------
  let IDX = null;
  function index() {
    if (IDX) return IDX;
    IDX = new Map();
    for (const [v, { f }] of Object.entries(P.VERB)) {
      for (const T of Conj.TENSES) (f[T.k] || []).forEach((x, p) => {
        if (!x) return;
        const k = norm(x); if (!IDX.has(k)) IDX.set(k, []);
        IDX.get(k).push({ v, t: T.k, p });
      });
    }
    return IDX;
  }
  // Search: exact infinitive, exact form (accent-insensitive), then infinitive prefix, then English meaning.
  // Returns [{kind:'verb', v} | {kind:'form', v, t, ps:[p…]}]
  function search(q) {
    const n = norm(q); if (!n) return [];
    const out = [], seen = new Set();
    const verbs = Object.keys(P.VERB);
    const addVerb = v => { if (!seen.has('v|' + v)) { seen.add('v|' + v); out.push({ kind: 'verb', v }); } };
    verbs.filter(v => norm(v) === n).forEach(addVerb);
    const groups = new Map();
    (index().get(n) || []).forEach(h => {
      if (P.VERB[h.v].f[h.t][h.p] === h.v) return; // the bare infinitive (infinitivo pessoal eu/ele) is the verb itself
      const k = h.v + '|' + h.t; if (!groups.has(k)) groups.set(k, { kind: 'form', v: h.v, t: h.t, ps: [] });
      groups.get(k).ps.push(h.p);
    });
    groups.forEach(g => out.push(g));
    verbs.filter(v => norm(v).startsWith(n)).forEach(addVerb);
    if (n.length >= 3) verbs.filter(v => norm(P.VERB[v].def.en).split(/[^a-z]+/).some(w => w.startsWith(n)) || norm(P.VERB[v].def.en).includes(n)).forEach(addVerb);
    return out.slice(0, 24);
  }
  P.panelSearch = search;

  // ---------- rendering ----------
  const persons = (v, t) => [0, 1, 2, 3, 4].filter(p => P.VERB[v].f[t] && P.VERB[v].f[t][p]);
  const focusTenses = () => { let f = null; try { f = P.planFocusTenses && P.planFocusTenses(); } catch (e) { f = null; } return (Array.isArray(f) && f.length ? f : FALLBACK).filter(k => Conj.TENSE[k]); };
  const who = (t, p) => P.personLabel(t, p);
  const speakBtn = (text, label) => `<button class="iconbtn vp-say" data-act="say" data-say="${esc(text)}" title="Listen" aria-label="${esc(label || 'Listen')}">${ICON.speaker}</button>`;
  function chip(r) {
    if (r.kind === 'verb') return `<button class="chip vp-chip" data-act="vp-pick" data-v="${esc(r.v)}"><b>${esc(r.v)}</b> <span class="vp-chip-en">${esc(P.VERB[r.v].def.en)}</span></button>`;
    return `<button class="chip vp-chip" data-act="vp-pick" data-v="${esc(r.v)}" data-t="${r.t}" data-p="${r.ps[0]}"><b>${esc(r.v)}</b> · ${esc(Conj.label(r.t))} · ${esc(r.ps.map(p => who(r.t, p).split(' / ')[0]).join(' / '))}</button>`;
  }
  function resultsHTML() {
    if (VS.q.trim()) {
      const rs = search(VS.q);
      return rs.length ? rs.map(chip).join('') : `<span class="small muted">No verb or form matches "${esc(VS.q)}".</span>`;
    }
    if (VS.v) return '';
    return COMMON.filter(v => P.VERB[v]).map(v => chip({ kind: 'verb', v })).join('');
  }
  // ---------- linking words (Aula): every connector, grouped by topic, filtered by the search box ----------
  function linkHTML() {
    const T = typeof CONNECT_TOPICS !== 'undefined' ? CONNECT_TOPICS : []; const n = norm(VS.q);
    const head = '<div class="vp-h"><h3>Linking words</h3><button class="btn sm" data-act="vp-aula">Open Aula</button></div>';
    const groups = T.map(tp => ({ tp, rows: tp.table.filter(r => !n || norm(r.join(' ')).includes(n)) })).filter(g => g.rows.length);
    if (!groups.length) return head + '<p class="small muted">' + (T.length ? 'No connector matches "' + esc(VS.q) + '".' : 'No linking words loaded.') + '</p>';
    return head + groups.map(g => '<section class="vp-block"><div class="vp-h"><h3>' + esc(g.tp.en) + ' <span class="tiny term vp-term">' + esc(g.tp.pt) + '</span></h3><button class="btn sm" data-act="vp-aula" data-k="' + esc(g.tp.id) + '">Topic</button></div><div class="vp-list">'
      + g.rows.map(r => '<button class="vp-conn" data-act="say" data-say="' + esc(r[3]) + '"><span class="vp-conn-top"><b>' + esc(r[0]) + '</b>' + (P.connectTag ? P.connectTag(r[2]) : '') + '</span><span class="small muted">' + esc(r[1]) + '</span><span class="vp-conn-ex">' + P.markHTML(r[3], [r[0]]) + ' ' + ICON.speaker + '</span><span class="small muted">' + esc(r[4]) + '</span></button>').join('') + '</div></section>').join('');
  }
  function bodyHTML() {
    if (VS.tab === 'link') return linkHTML();
    const { v, t, p } = VS;
    if (!v) return `<p class="small muted">Look up any verb or a form you heard. It opens on what you're practising when you open it from a drill.</p>`;
    const vb = P.VERB[v], T = Conj.TENSE[t], x = P.vform(v, t, p) || {};
    // 1. the one form
    const one = `<section class="vp-block">
      <div class="vp-one"><div class="vp-form">${P.vformHTML(v, t, p)}</div>${speakBtn(P.vsay(v, t, p), 'Hear ' + x.form)}</div>
      <div class="vp-pat"><b>${esc(Conj.label(t))}</b> · ${esc(who(t, p))} <span class="tiny vp-term">${esc(T.pt)}</span></div>
      <div class="small muted"><b>${esc(v)}</b> · ${esc(vb.def.en)}</div>
      ${x.irr ? `<div class="vp-irr small">★ irregular: the regular pattern would be <i>${esc(x.reg)}</i></div>` : ''}
      <details class="vp-more" data-more="1" ${VS.more1 ? 'open' : ''}><summary>Other tenses</summary>
        <div class="vp-chips">${Conj.TENSES.map(K => `<button class="chip vp-chip ${K.k === t ? 'on' : ''}" data-act="vp-tense" data-t="${K.k}">${esc(K.pat || K.pt)} <span class="vp-chip-en">${esc(K.pt)}</span></button>`).join('')}</div></details>
    </section>`;
    // 2. that tense down the persons, as a spoken list
    const ps = persons(v, t);
    const row = `<section class="vp-block"><div class="vp-h"><h3>Say the row</h3><button class="btn sm" data-act="vp-sayall">${ICON.speaker} Say it all</button></div>
      <div class="vp-list">${ps.map(q => `<button class="vp-row ${q === p ? 'on' : ''}" data-act="vp-person" data-p="${q}"><span class="vp-who">${esc(who(t, q))}</span><span class="vp-f">${P.vformHTML(v, t, q, { noStar: true })}</span></button>`).join('')}</div></section>`;
    // 3. that person across this week's tenses
    const shiftRow = k => { const f = vb.f[k] && vb.f[k][p]; if (!f) return ''; return `<button class="vp-row ${k === t ? 'on' : ''}" data-act="vp-tense" data-t="${k}"><span class="vp-who">${esc(Conj.label(k))}</span><span class="vp-f">${P.vformHTML(v, k, p, { noStar: true })}</span></button>`; };
    const ft = focusTenses();
    const shift = `<section class="vp-block"><div class="vp-h"><h3>Shift the tense</h3><span class="small muted">${esc(who(t, p).split(' / ')[0])}</span></div>
      <div class="vp-list">${ft.map(shiftRow).join('') || '<span class="small muted">No form for this person in these tenses.</span>'}</div>
      <details class="vp-more" data-more="3" ${VS.more3 ? 'open' : ''}><summary>All tenses</summary>
        <div class="vp-list">${Conj.TENSES.filter(K => !ft.includes(K.k)).map(K => shiftRow(K.k)).join('')}</div></details></section>`;
    const foot = `<div class="vp-foot"><button class="btn primary" data-act="vp-drill">Drill this</button><button class="btn" data-act="vp-table">${ICON.table} Full table</button></div>`;
    return one + row + shift + foot;
  }

  // ---------- DOM ----------
  let root = null, back = null, lastFocus = null;
  function build() {
    if (root) return;
    back = document.createElement('div'); back.className = 'vp-back'; back.hidden = true;
    back.addEventListener('click', () => P.closePanel());
    root = document.createElement('div'); root.id = 'vpanel'; root.className = 'vpanel'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Verb lookup');
    root.innerHTML = `<div class="vp-head"><div class="vp-grip" aria-hidden="true"></div>
        <div class="vp-top"><h2>Verbo rápido</h2><button class="iconbtn vp-x" data-act="vp-close" aria-label="Close">✕</button></div>
        <div class="vp-tabs" role="tablist"><button class="vp-tab" role="tab" data-act="vp-tab" data-k="verb">Verbs</button><button class="vp-tab" role="tab" data-act="vp-tab" data-k="link">Linking words</button></div>
        <input type="search" id="vp-q" placeholder="Find a verb or a form you heard (fez, foste…)" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Search verbs and forms">
        <div id="vp-results" class="vp-chips"></div></div>
      <div id="vp-body" class="vp-body"></div>`;
    document.body.appendChild(back); document.body.appendChild(root);
    const q = root.querySelector('#vp-q');
    q.addEventListener('input', () => { VS.q = q.value; if (VS.tab === 'link') draw(); else drawResults(); });
    root.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.more) VS['more' + d.dataset.more] = d.open; }, true);
  }
  function drawResults() { const r = root.querySelector('#vp-results'); r.innerHTML = VS.tab === 'link' ? '' : resultsHTML(); r.hidden = !r.innerHTML; }
  function draw() {
    if (!root) return;
    root.querySelectorAll('.vp-tab').forEach(b => { const on = b.dataset.k === VS.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    root.querySelector('#vp-q').placeholder = VS.tab === 'link' ? 'Search linking words (embora, caso, antes…)' : 'Find a verb or a form you heard (fez, foste…)';
    drawResults(); root.querySelector('#vp-body').innerHTML = bodyHTML(); }
  // Pick a valid person for the tense (imperativo has no eu/nós; impersonal verbs only ele)
  function fix() {
    if (!VS.v || !P.VERB[VS.v]) { VS.v = null; return; }
    if (!Conj.TENSE[VS.t]) VS.t = 'pres';
    const ps = persons(VS.v, VS.t);
    if (!ps.length) { VS.t = Conj.TENSES.map(K => K.k).find(k => persons(VS.v, k).length) || 'pres'; }
    const ps2 = persons(VS.v, VS.t);
    if (!ps2.includes(VS.p)) VS.p = ps2.includes(2) && P.VERB[VS.v].def.persons ? 2 : ps2[0];
  }
  P.openPanel = function (ctx) {
    build();
    ctx = ctx || P.panelCtx || {};
    if (ctx.tab) VS.tab = ctx.tab; else if (ctx.v || ctx.t) VS.tab = 'verb';
    if (ctx.v && P.VERB[ctx.v]) { VS.v = ctx.v; VS.t = ctx.t || 'pres'; VS.p = ctx.p != null ? +ctx.p : 0; }
    else if (ctx.t && Conj.TENSE[ctx.t]) { VS.t = ctx.t; }
    fix();
    VS.q = ''; root.querySelector('#vp-q').value = '';
    lastFocus = document.activeElement;
    back.hidden = false; root.hidden = false; VS.open = true;
    document.documentElement.classList.add('vp-open');
    draw();
    root.querySelector('#vp-body').scrollTop = 0;
    // On a phone, focusing the search would pop the keyboard up: focus the close button instead
    (window.matchMedia && matchMedia('(min-width: 900px)').matches && !VS.v ? root.querySelector('#vp-q') : root.querySelector('.vp-x')).focus();
    if (P.panelOpened) { try { P.panelOpened(); } catch (e) { } }
  };
  P.closePanel = function () {
    if (!root || !VS.open) return;
    if (VS.seq) { VS.seq = false; TTS.stop(); }
    root.hidden = true; back.hidden = true; VS.open = false;
    document.documentElement.classList.remove('vp-open');
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) { } }
  };
  P.panelIsOpen = () => VS.open;

  // ---------- actions ----------
  act['vpanel'] = () => (VS.open ? P.closePanel() : P.openPanel());
  act['vp-close'] = () => P.closePanel();
  act['vp-tab'] = (b) => { VS.tab = b.dataset.k; VS.q = ''; root.querySelector('#vp-q').value = ''; draw(); root.querySelector('#vp-body').scrollTop = 0; };
  act['vp-aula'] = (b) => { P.closePanel(); if (P.openAula) P.openAula(b.dataset.k); };
  act['vp-pick'] = (b) => {
    VS.v = b.dataset.v;
    if (b.dataset.t) { VS.t = b.dataset.t; VS.p = +b.dataset.p; }
    VS.q = ''; root.querySelector('#vp-q').value = '';
    fix(); draw(); root.querySelector('#vp-body').scrollTop = 0;
    if (b.dataset.t) TTS.speak(P.vsay(VS.v, VS.t, VS.p));
  };
  act['vp-tense'] = (b) => { VS.t = b.dataset.t; fix(); draw(); TTS.speak(P.vsay(VS.v, VS.t, VS.p)); };
  act['vp-person'] = (b) => { VS.p = +b.dataset.p; draw(); TTS.speak(P.vsay(VS.v, VS.t, VS.p)); };
  act['vp-sayall'] = async () => {
    if (!VS.v) return;
    TTS.stop(); VS.seq = true; const tok = TTS.token ? TTS.token() : 0;
    for (const p of persons(VS.v, VS.t)) {
      await TTS.say(P.vsay(VS.v, VS.t, p));
      if (!VS.seq || (TTS.token && tok !== TTS.token())) return;
      await TTS.pause(250);
      if (!VS.seq || (TTS.token && tok !== TTS.token())) return;
    }
    VS.seq = false;
  };
  act['vp-drill'] = () => {
    if (!VS.v) return;
    if (P.queueDrill) { P.queueDrill({ v: VS.v, t: VS.t }); P.toast('Queued for your next verb drill', 1600); }
  };
  act['vp-table'] = () => {
    const v = VS.v; P.closePanel();
    if (P.showTable) P.showTable(v); else location.hash = '#/tables';
  };

  // ---------- keyboard ----------
  // While the panel is open, keystrokes belong to it: Escape closes; nothing reaches the page's shortcuts
  // (so Space can't reveal a drill answer behind the panel). Default actions (typing, button activation) still work.
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('keydown', (e) => {
      if (!VS.open) return;
      if (e.key === 'Escape') { e.preventDefault(); P.closePanel(); }
      e.stopPropagation();
    }, true);
    // Leaving the page (route change) closes the panel
    window.addEventListener('hashchange', () => P.closePanel());
  }
  P._panelBody = () => bodyHTML(); // for tests
  P._panelState = VS;
})(Pois);
