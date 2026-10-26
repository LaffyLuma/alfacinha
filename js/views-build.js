/* Construir: sentence building. An English idea + 2–3 Portuguese word hints → say the whole sentence out loud →
   reveal the model + one line aimed at the weak spot → grade yourself. The step between verb forms and conversation. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views, act = P.actions;
  const BI = {}; BUILD.forEach(b => { BI[b.id] = b; });
  const PATS = ['did', 'used to', 'have been doing lately', 'had done', 'would', 'if I were', 'that I', 'for me to', 'hei de', 'will', 'pronouns', 'passive', 'slips'];
  const keyOk = e => !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
  // Planner focus → sentence patterns
  const FOCUS_PATS = { past: ['did', 'used to'], pron: ['pronouns'], would: ['would', 'if I were'], lately: ['have been doing lately', 'had done'], forme: ['for me to', 'hei de'], thati: ['that I', 'passive'] };
  let BS = null, pat = 'all';
  function weight(b) {
    const x = S().build[b.id];
    return !x ? 1.3 : 0.2 + (1 - x.ema) * 2 + Math.min(1, (Date.now() - (x.last || 0)) / (7 * P.DAY)) * 0.5;
  }
  function start(pats, n) {
    let pool = BUILD.filter(b => !pats || pats.includes(b.pat)); const items = [];
    n = Math.min(n || S().settings.transLen || 12, pool.length);
    while (items.length < n && pool.length) { const b = P.pickWeighted(pool, weight); items.push(b.id); pool = pool.filter(x => x !== b); }
    BS = { items, i: 0, phase: 'ask', hint: false, ok: 0, done: 0, missed: [] };
    P.render();
  }
  P.startBuild = f => start(f && FOCUS_PATS[f.k] ? FOCUS_PATS[f.k] : null, 10);
  V.construir = function (el) {
    if (!BS) {
      const seen = Object.keys(S().build).length;
      el.innerHTML = `<div class="hero"><div><h1>Construir</h1><div class="muted">An idea in English and a few Portuguese words. Say the whole sentence out loud, then compare.</div></div></div>
        <div class="card"><div class="chips" style="margin-bottom:16px"><button class="chip big ${pat === 'all' ? 'on' : ''}" data-act="bd-pat" data-k="all">All</button>${PATS.map(p => `<button class="chip big ${pat === p ? 'on' : ''}" data-act="bd-pat" data-k="${esc(p)}">${esc(p)}</button>`).join('')}</div>
          <button class="btn primary block say-main" data-act="bd-start">Start (${Math.min(S().settings.transLen || 12, BUILD.filter(b => pat === 'all' || b.pat === pat).length)})</button>
          <p class="tiny" style="margin:10px 0 0">${seen} of ${BUILD.length} sentences practised. <span class="kbd">Space</span> reveal · <span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">3</span> grade · <span class="kbd">h</span> starter.</p></div>`;
      return;
    }
    if (BS.i >= BS.items.length) return summary(el);
    const b = BI[BS.items[BS.i]]; const revealed = BS.phase === 'reveal';
    el.innerHTML = P.sayCard({
      meta: [`Construir · ${BS.ok} ✓`, `${BS.i + 1} / ${BS.items.length}`], progress: BS.i / BS.items.length,
      label: `Say it in Portuguese · <span class="tiny term">${esc(b.pat)}</span>`,
      front: `<div class="big" style="font-size:1.35rem">${esc(b.en)}</div><div class="chips" style="justify-content:center;margin-top:10px">${b.hints.map(h => `<span class="hintchip">${esc(h)}</span>`).join('')}</div>`,
      hint: esc(b.a[0].split(/\s+/).slice(0, 3).join(' ')) + '…', hintShown: BS.hint,
      answer: P.markHTML(b.a[0], b.mark) + (b.a.length > 1 ? `<div class="small muted" style="margin-top:6px">also: ${b.a.slice(1).map(esc).join(' · ')}</div>` : ''),
      say: b.a[0], help: esc(b.why), revealed,
      acts: { reveal: 'bd-reveal', hint: 'bd-hint', grade: 'bd-grade', end: 'bd-end' },
    });
  };
  function summary(el) {
    const acc = Math.round(BS.ok / Math.max(1, BS.done) * 100);
    el.innerHTML = `<div class="study"><div class="card"><h1 style="text-align:center">Feito!</h1>
      <div class="grid three" style="margin:16px 0"><div class="stat"><div class="n">${acc}%</div><div class="l">got it</div></div><div class="stat"><div class="n">${BS.done}</div><div class="l">sentences said</div></div><div class="stat"><div class="n">${BS.missed.length}</div><div class="l">missed</div></div></div>
      ${BS.missed.length ? `<h3>Missed</h3><ul class="summary-list">${BS.missed.map(id => { const b = BI[id]; return `<li><span><span class="small muted">${esc(b.en)}</span><br>${esc(b.a[0])}</span><button class="iconbtn" data-act="say" data-say="${esc(b.a[0])}" aria-label="Listen">${ICON.speaker}</button></li>`; }).join('')}</ul>` : '<div class="note-good">Nothing missed. Muito bem!</div>'}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-act="bd-start">Again</button><a class="btn ghost" href="#/today">Today</a></div></div></div>`;
    P.bump('buildSessions'); Store.change({ silent: true });
    if (P.stepDone) P.stepDone('build');
    BS = null;
  }
  act['bd-pat'] = b => { pat = b.dataset.k; P.render(); };
  act['bd-start'] = () => start(pat === 'all' ? null : [pat]);
  act['bd-hint'] = () => { if (BS) { BS.hint = true; P.render(); } };
  act['bd-reveal'] = () => { if (!BS || BS.phase === 'reveal') return; BS.phase = 'reveal'; P.render(); if (S().settings.autoplay) { TTS.stop(); TTS.say(BI[BS.items[BS.i]].a[0]); } };
  act['bd-grade'] = el => {
    if (!BS || BS.phase !== 'reveal') return;
    const g = +el.dataset.g; const id = BS.items[BS.i];
    const x = S().build[id] || { n: 0, ok: 0, ema: 0.5, last: 0 };
    x.n++; if (g === 3) x.ok++; x.ema = x.ema * 0.7 + P.gradeScore(g) * 0.3; x.last = Date.now(); S().build[id] = x;
    P.bump('build'); BS.done++; if (g === 3) BS.ok++;
    if (g === 1) { if (!BS.missed.includes(id)) BS.missed.push(id); if (BS.items.indexOf(id, BS.i + 1) < 0) BS.items.splice(Math.min(BS.items.length, BS.i + 4), 0, id); }
    TTS.stop(); Store.change({ silent: true });
    BS.i++; BS.phase = 'ask'; BS.hint = false; P.render();
  };
  act['bd-end'] = () => { TTS.stop(); if (BS && BS.done) BS.i = BS.items.length; else BS = null; P.render(); };
  P.keys.construir = e => {
    if (!BS || BS.i >= BS.items.length || !keyOk(e)) return;
    const k = e.key;
    if (BS.phase !== 'reveal' && (k === ' ' || k === 'Enter')) { e.preventDefault(); act['bd-reveal'](); }
    else if (BS.phase === 'reveal' && ['1', '2', '3'].includes(k)) { e.preventDefault(); act['bd-grade']({ dataset: { g: k } }); }
    else if ((k === 'h' || k === 'H') && BS.phase !== 'reveal') { e.preventDefault(); act['bd-hint'](); }
    else if ((k === 'r' || k === 'R') && BS.phase === 'reveal') { e.preventDefault(); TTS.speak(BI[BS.items[BS.i]].a[0]); }
  };
  P.leave.construir = () => { pat = 'all'; };
})(Pois);
