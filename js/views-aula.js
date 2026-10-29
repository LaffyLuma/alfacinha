/* Aula (#/aula): the linking words class is working on (embora, caso, assim que, antes que / antes de…) and "had done".
   Hub of topics → topic page (walkthrough, connector table, verb tables) → speak-first drill (connector + English
   [+ verb hint | two sentences to join] → say it → reveal → 1/2/3). Content: data/connect.js. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views, act = P.actions;
  const TOP = typeof CONNECT_TOPICS !== 'undefined' ? CONNECT_TOPICS : [];
  const ITEMS = typeof CONNECT !== 'undefined' ? CONNECT : [];
  const CI = {}; ITEMS.forEach(x => { CI[x.id] = x; });
  const TI = {}; TOP.forEach(t => { TI[t.id] = t; });
  const keyOk = e => !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
  const who = (t, p) => P.personLabel(t, p).split(' / ')[0];
  P.CONNECT_CI = CI;

  // "then use" tags: plain English first, the Portuguese term small, coloured with the tense families
  const THEN = { conjuntivo: ['subjunctive', 'subj'], indicativo: ['normal verb', 'pres'], infinitivo: ['infinitive', 'infp'], 'tinha + particípio': ['had done', 'mqp'],
    perfeito: ['did', 'pps'], imperfeito: ['was doing', 'pimp'], 'perfeito composto': ['have been doing', 'ppc'] };
  P.connectTag = u => { const t = THEN[u] || [u, 'pres']; return `<span class="ac-tag tc-${t[1]}"><b>${esc(t[0])}</b><small>${esc(u)}</small></span>`; };

  let AS = { v: 'hub', topic: null, vb: null, vt: 'cpres' }; // v: hub | topic | drill | end
  let DR = null;
  const SUBJ_VERBS = ['ser', 'estar', 'ter', 'ir', 'fazer', 'poder', 'querer', 'saber', 'dar', 'haver', 'vir', 'dizer', 'falar', 'comer', 'abrir'];
  const BOOK_VERBS = ['ter', 'ser', 'ir', 'estar', 'fazer', 'dizer', 'ver', 'vir', 'poder', 'falar', 'comer', 'abrir'];
  const PARTS = ['fazer', 'dizer', 'ver', 'pôr', 'vir', 'escrever', 'abrir', 'ganhar', 'gastar', 'pagar'];
  const VT = [['cpres', 'Present subjunctive'], ['cfut', 'Future subjunctive'], ['infp', 'Personal infinitive']];
  const tlabel = t => `<b>${esc(Conj.label(t))}</b> <span class="tiny term">${esc(Conj.TENSE[t].pt)}</span>`;
  const items = topic => ITEMS.filter(x => !topic || x.topic === topic);

  P.openAula = function (topic) {
    TTS.stop(); DR = null;
    AS.v = topic && TI[topic] ? 'topic' : 'hub'; AS.topic = AS.v === 'topic' ? topic : null;
    if (P.route() !== 'aula') history.pushState(null, '', '#/aula');
    P.render(); window.scrollTo(0, 0);
  };

  // ---------- one drill item's front (shared with the guided session) ----------
  P.aulaFront = x => {
    const body = x.mode === 'join' ? `<div class="ac-src">${x.src.map(s => `<div>${esc(s)}</div>`).join('')}</div>` : `<div class="chips" style="justify-content:center;margin-top:10px"><span class="hintchip">${esc(x.hint)}</span></div>`;
    return `<div class="ac-conn"><span class="ac-chip">${esc(x.c)}</span></div><div class="big" style="font-size:1.3rem">${esc(x.en)}</div>${body}`;
  };
  P.aulaLabel = x => `${x.mode === 'join' ? 'Join them into one sentence' : 'Say the whole sentence'} · <span class="tiny term">${esc((TI[x.topic] || {}).pt || '')}</span>`;
  P.aulaGrade = (id, g) => {
    const x = S().aula[id] || { n: 0, ema: 0.5, last: 0 };
    x.n++; x.ema = x.ema * 0.7 + P.gradeScore(g) * 0.3; x.last = Date.now(); S().aula[id] = x; P.bump('aula');
  };

  // ---------- pages ----------
  V.aula = function (el) {
    if (AS.v === 'drill' && DR) return drill(el);
    if (AS.v === 'end' && DR) return summary(el);
    if (AS.v === 'topic' && TI[AS.topic]) { P.panelCtx = { tab: 'link' }; return topic(el, TI[AS.topic]); }
    AS.v = 'hub'; P.panelCtx = { tab: 'link' }; hub(el);
  };
  function hub(el) {
    const A = S().aula;
    el.innerHTML = `<div class="hero"><div><h1>Aula</h1><div class="muted">Linking words & had done · what class is doing</div></div></div>
      <button class="btn primary block say-main" data-act="ac-all" ${ITEMS.length ? '' : 'disabled'}>Drill all topics · ${Math.min(12, ITEMS.length)} mixed</button>
      <div class="grid two" style="margin-top:14px">${TOP.map(t => {
        const its = items(t.id), seen = its.filter(x => A[x.id]).length;
        return `<button class="card ac-topic" data-act="ac-topic" data-k="${esc(t.id)}"><span class="ac-en">${esc(t.en)}</span><span class="ac-pt">${esc(t.pt)}</span>
          <span class="ac-bar"><span style="width:${its.length ? Math.round(seen / its.length * 100) : 0}%"></span></span><span class="tiny">${seen} / ${its.length} practised</span></button>`;
      }).join('')}</div>`;
  }
  function row(r) {
    return `<div class="pcard ac-row" role="button" tabindex="0" data-act="say" data-say="${esc(r[3])}" aria-label="Hear: ${esc(r[3])}">
      <span class="ac-c">${esc(r[0])}</span><span class="ac-mean">${esc(r[1])}</span><span class="ac-then">${P.connectTag(r[2])}</span>
      <span class="ac-ex"><span class="ac-exrow"><span>${P.markHTML(r[3], [r[0]])}</span><span class="ac-spk">${ICON.speaker}</span></span><span class="ac-exen">${esc(r[4])}</span></span></div>`;
  }
  function topic(el, t) {
    const n = items(t.id).length;
    const drillBtn = `<button class="btn primary block say-main" data-act="ac-drill" data-k="${esc(t.id)}" ${n ? '' : 'disabled'}>Drill this · ${Math.min(12, n)} to say out loud</button>`;
    el.innerHTML = `<button class="btn ghost" data-act="ac-hub" style="margin-left:-12px">‹ All topics</button>
      <div class="hero"><div><h1>${esc(t.en)}</h1><div class="muted small">${esc(t.pt)}</div></div></div>
      <div class="card"><p style="margin:0">${esc(t.intro)}</p></div>
      ${drillBtn}
      <h2 class="ac-h">Walkthrough</h2>
      <ol class="ac-steps">${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <h2 class="ac-h">Connectors <span class="tiny muted">tap a row to hear it</span></h2>
      <div class="card ac-table"><div class="ac-row ac-head" aria-hidden="true"><span>Connector</span><span>Means</span><span>Then use</span><span>Example</span></div>${t.table.map(row).join('')}</div>
      <div class="tip" style="margin:14px 0"><b>Tip.</b> ${esc(t.tip)}</div>
      ${t.id === 'past' ? pastBlocks() : `<h2 class="ac-h">Verb tables</h2><div class="card" id="ac-vt">${vtHTML()}</div>`}
      <div style="margin-top:16px">${drillBtn}</div>`;
  }

  // ---------- verb tables ----------
  const vchips = (list, cur) => `<div class="chips ac-vchips">${list.map(v => `<button class="chip ac-vchip ${v === cur ? 'on' : ''}" data-act="ac-vb" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div>`;
  const sayBtn = ICON.speaker;
  function vtHTML() {
    const v = AS.vb && SUBJ_VERBS.includes(AS.vb) ? AS.vb : 'ser', t = AS.vt, vb = P.VERB[v];
    const rows = [0, 1, 2, 3, 4].filter(p => vb.f[t] && vb.f[t][p]);
    return `<div class="ac-vtabs">${VT.map(([k, n]) => `<button class="chip ac-vchip ${k === t ? 'on' : ''}" data-act="ac-vt" data-t="${k}">${n}</button>`).join('')}</div>
      <div class="small" style="margin:8px 0 10px">${tlabel(t)}</div>
      ${vchips(SUBJ_VERBS, v)}
      <div class="small muted" style="margin:10px 0 6px"><b>${esc(v)}</b> · ${esc(vb.def.en)}${vb.def.persons ? ' · only the ele form exists' : ''}</div>
      <div class="ac-vlist">${rows.map(p => `<button class="ac-vrow" data-act="say" data-say="${esc(P.vsay(v, t, p))}"><span class="ac-who">${esc(who(t, p))}</span><span class="ac-f">${P.vformHTML(v, t, p, { noStar: true })}</span>${sayBtn}</button>`).join('')}</div>`;
  }
  function pastBlocks() {
    const ter = P.VERB.ter.f.pimp;
    return `<h2 class="ac-h">Step 1 · ter in the imperfect</h2><div class="card"><div class="small" style="margin-bottom:8px">${tlabel('pimp')}</div>
        <div class="ac-vlist">${ter.map((f, p) => `<button class="ac-vrow" data-act="say" data-say="${esc(who('pimp', p) + ' ' + f)}"><span class="ac-who">${esc(who('pimp', p))}</span><span class="ac-f">${P.vformHTML('ter', 'pimp', p, { noStar: true })}</span>${sayBtn}</button>`).join('')}</div></div>
      <h2 class="ac-h">Step 2 · the participle <span class="tiny muted">tap to hear it with tinha</span></h2>
      <div class="card"><div class="chips">${PARTS.map(v => { const pt = P.VERB[v].f.part; return `<button class="chip ac-vchip" data-act="say" data-say="eu tinha ${esc(pt)}"><b>${esc(pt)}</b>&nbsp;<span class="muted">${esc(v)}</span></button>`; }).join('')}</div></div>
      <h2 class="ac-h">In books you'll see</h2><div class="card" id="ac-vt">${bookHTML()}</div>`;
  }
  // The one-word "had done" form of literature: the past subjunctive with -ra instead of -sse (tivéssemos → tivéramos)
  const oneWord = (v, p) => { const f = P.VERB[v].f.cimp[p]; return f ? f.replace(/ssemos$/, 'ramos').replace(/sses$/, 'ras').replace(/ssem$/, 'ram').replace(/sse$/, 'ra') : ''; };
  P.oneWord = oneWord;
  function bookHTML() {
    const v = AS.vb && BOOK_VERBS.includes(AS.vb) ? AS.vb : 'ter', vb = P.VERB[v];
    return `<p class="small" style="margin-top:0">Speech uses <b>tinha + participle</b>. Written Portuguese often squeezes the same idea into one word: <i>tinha falado</i> = <i>falara</i>. You only need to recognise it.</p>
      ${vchips(BOOK_VERBS, v)}
      <div class="ac-bk ac-bkhead"><span></span><span>Speech</span><span>Books</span></div>
      ${[0, 1, 2, 3, 4].map(p => `<button class="ac-bk" data-act="say" data-say="${esc(who('mqp', p) + ' ' + vb.f.mqp[p])}"><span class="ac-who">${esc(who('mqp', p))}</span><span>${P.vformHTML(v, 'mqp', p, { noStar: true })}</span><span class="ac-f">${esc(oneWord(v, p))}</span></button>`).join('')}`;
  }
  act['ac-vb'] = b => { AS.vb = b.dataset.v; const d = document.getElementById('ac-vt'); if (d) d.innerHTML = AS.topic === 'past' ? bookHTML() : vtHTML(); };
  act['ac-vt'] = b => { AS.vt = b.dataset.t; const d = document.getElementById('ac-vt'); if (d) d.innerHTML = vtHTML(); };

  // ---------- drill ----------
  function weight(x) {
    const s = S().aula[x.id];
    return !s ? 1.3 : 0.2 + (1 - s.ema) * 2 + Math.min(1, (Date.now() - (s.last || 0)) / (7 * P.DAY)) * 0.5;
  }
  function start(topic, n) {
    let pool = items(topic); const ids = []; n = Math.min(n || 12, pool.length);
    if (!n) return;
    while (ids.length < n && pool.length) { const x = P.pickWeighted(pool, weight); ids.push(x.id); pool = pool.filter(y => y !== x); }
    DR = { topic, items: ids, i: 0, phase: 'ask', hint: false, ok: 0, done: 0, missed: [] };
    AS.v = 'drill'; P.render(); window.scrollTo(0, 0);
  }
  function drill(el) {
    if (DR.i >= DR.items.length) return finish();
    const x = CI[DR.items[DR.i]], revealed = DR.phase === 'reveal', tp = TI[DR.topic];
    P.panelCtx = { v: x.v, t: x.t, p: x.p };
    el.innerHTML = P.sayCard({
      meta: [`Aula${tp ? ' · ' + esc(tp.en) : ''} · ${DR.ok} ✓`, `${DR.i + 1} / ${DR.items.length}`], progress: DR.i / DR.items.length,
      label: P.aulaLabel(x), front: P.aulaFront(x),
      hint: esc(x.a[0].split(/\s+/).slice(0, 3).join(' ')) + '…', hintShown: DR.hint,
      answer: P.markHTML(x.a[0], x.mark) + (x.a.length > 1 ? `<div class="small muted" style="margin-top:6px">also: ${x.a.slice(1).map(esc).join(' · ')}</div>` : ''),
      say: x.a[0], help: esc(x.why), revealed,
      acts: { reveal: 'ac-reveal', hint: 'ac-hint', grade: 'ac-grade', end: 'ac-end' },
    });
  }
  function finish() {
    if (AS.v === 'end') return;
    AS.v = 'end'; P.bump('aulaSessions'); Store.change({ silent: true });
    if (P.stepDone) P.stepDone('aula');
    P.render();
  }
  function summary(el) {
    const acc = Math.round(DR.ok / Math.max(1, DR.done) * 100), tp = TI[DR.topic];
    el.innerHTML = `<div class="study"><div class="card"><h1 style="text-align:center">Feito!</h1>
      <div class="grid three" style="margin:16px 0"><div class="stat"><div class="n">${acc}%</div><div class="l">got it</div></div><div class="stat"><div class="n">${DR.done}</div><div class="l">sentences said</div></div><div class="stat"><div class="n">${DR.missed.length}</div><div class="l">missed</div></div></div>
      ${DR.missed.length ? `<h3>Missed</h3><ul class="summary-list">${DR.missed.map(id => { const x = CI[id]; return `<li><span><span class="small muted">${esc(x.en)}</span><br>${P.markHTML(x.a[0], x.mark)}</span><button class="iconbtn" data-act="say" data-say="${esc(x.a[0])}" aria-label="Listen">${ICON.speaker}</button></li>`; }).join('')}</ul>` : '<div class="note-good">Nothing missed. Muito bem!</div>'}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-act="ac-again">Again</button>${tp ? `<button class="btn" data-act="ac-topic" data-k="${esc(tp.id)}">Back to topic</button>` : ''}<button class="btn ghost" data-act="ac-hub">All topics</button></div></div></div>`;
  }
  act['ac-topic'] = b => { AS.v = 'topic'; AS.topic = b.dataset.k; DR = null; P.render(); window.scrollTo(0, 0); };
  act['ac-hub'] = () => { AS.v = 'hub'; AS.topic = null; DR = null; TTS.stop(); P.render(); window.scrollTo(0, 0); };
  act['ac-all'] = () => start(null);
  act['ac-drill'] = b => start(b.dataset.k);
  act['ac-again'] = () => start(DR && DR.topic);
  act['ac-hint'] = () => { if (DR) { DR.hint = true; P.render(); } };
  act['ac-reveal'] = () => { if (!DR || DR.phase === 'reveal') return; DR.phase = 'reveal'; P.render(); if (S().settings.autoplay) { TTS.stop(); TTS.say(CI[DR.items[DR.i]].a[0]); } };
  act['ac-grade'] = el => {
    if (!DR || DR.phase !== 'reveal') return;
    const g = +el.dataset.g, id = DR.items[DR.i];
    P.aulaGrade(id, g); DR.done++; if (g === 3) DR.ok++;
    // a miss comes back a few items later, but never straight after itself
    if (g === 1) { if (!DR.missed.includes(id)) DR.missed.push(id); const at = Math.min(DR.items.length, DR.i + 4); if (at > DR.i + 1 && DR.items.indexOf(id, DR.i + 1) < 0) DR.items.splice(at, 0, id); }
    TTS.stop(); Store.change({ silent: true });
    DR.i++; DR.phase = 'ask'; DR.hint = false;
    if (DR.i >= DR.items.length) finish(); else P.render();
  };
  act['ac-end'] = () => { TTS.stop(); if (DR && DR.done) { DR.i = DR.items.length; finish(); } else { const t = DR && DR.topic; DR = null; AS.v = t ? 'topic' : 'hub'; AS.topic = t || null; P.render(); } };
  P.keys.aula = e => {
    if (AS.v !== 'drill' || !DR || DR.i >= DR.items.length || !keyOk(e)) return;
    const k = e.key;
    if (DR.phase !== 'reveal' && (k === ' ' || k === 'Enter')) { e.preventDefault(); act['ac-reveal'](); }
    else if (DR.phase === 'reveal' && ['1', '2', '3'].includes(k)) { e.preventDefault(); act['ac-grade']({ dataset: { g: k } }); }
    else if ((k === 'h' || k === 'H') && DR.phase !== 'reveal') { e.preventDefault(); act['ac-hint'](); }
    else if ((k === 'r' || k === 'R') && DR.phase === 'reveal') { e.preventDefault(); TTS.speak(CI[DR.items[DR.i]].a[0]); }
  };
  P.leave.aula = () => { AS.v = 'hub'; AS.topic = null; DR = null; P.panelCtx = null; };
})(Pois);
