/* Verbos: the speak-first verb drill ("ouvir e dizer"). The voice gives a cue ("ontem, eu, fazer"), you say the form
   out loud, reveal, hear it, grade yourself. Irregular forms are flagged ★ before and after. No tables, no typing:
   one line of help only after a miss. Timing from cue to reveal feeds the same mastery stats as the typed sprint. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views, act = P.actions;
  const now = () => Date.now();
  const ALL = () => Conj.TENSES.map(t => t.k);
  const keyOk = e => !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
  const patHTML = k => `${esc(Conj.label(k))} <span class="tiny term">${esc(Conj.TENSE[k].pt)}</span>`;
  const PERSON_EN = ['I', 'you (tu)', 'he / she / você', 'we', 'they / vocês'];
  const CHAIN_P = ['EU (I)', 'TU (you)', 'ELE / ELA', 'NÓS (we)', 'ELES (they)'];
  const who = (t, p) => P.personLabel(t, p).split(' / ')[0];
  const focusTenses = () => (P.planFocusTenses ? P.planFocusTenses() : null) || [P.focusTense ? P.focusTense() : 'pps'];
  const persons = (v, t) => [0, 1, 2, 3, 4].filter(p => P.VERB[v].f[t] && P.VERB[v].f[t][p]);

  // ---------- picking ----------
  function candidates(st) {
    const tenses = st.sayTenses && st.sayTenses.length ? st.sayTenses : ALL(); const sets = st.saySets || ['irr', 'stem', 'reg'];
    const out = [];
    for (const [v, { def }] of Object.entries(P.VERB)) {
      if (!sets.includes(def.set)) continue;
      for (const t of tenses) { const ps = persons(v, t); if (ps.length) out.push({ v, t, ps }); }
    }
    return out;
  }
  function weight(c, focus) {
    const x = S().conj[c.v + '|' + c.t]; const set = P.VERB[c.v].def.set;
    let w = set === 'irr' ? 4 : set === 'stem' ? 1.2 : 0.5; // irregulars weighted well up: there are far more regular verbs
    w *= !x ? 1.2 : 0.15 + (1 - x.ema) * 2.2 + (x.ms > 6000 ? 0.5 : x.ms > 4000 ? 0.25 : 0) + Math.min(1, (now() - (x.last || 0)) / (5 * P.DAY)) * 0.6;
    if (focus.includes(c.t)) w *= 1.8;
    return w;
  }
  let queue = []; // "Drill this" from the verb panel
  P.queueDrill = d => { if (d && P.VERB[d.v] && persons(d.v, d.t).length) queue.push({ v: d.v, t: d.t }); };
  function build(n, opts) {
    const st = Object.assign({}, S().settings, opts.tenses ? { sayTenses: opts.tenses } : {});
    const items = [];
    queue.splice(0).forEach(q => { const ps = persons(q.v, q.t); items.push({ v: q.v, t: q.t, p: ps[Math.floor(Math.random() * ps.length)] }); });
    P.takeFlagged(['verb'], n).forEach(d => { if (P.VERB[d.v] && P.VERB[d.v].f[d.t] && P.VERB[d.v].f[d.t][d.p]) items.push({ v: d.v, t: d.t, p: d.p }); });
    if (opts.verb) { const ts = (st.sayTenses || ALL()).filter(t => persons(opts.verb, t).length); P.shuffle(ts).forEach(t => { const ps = persons(opts.verb, t); items.push({ v: opts.verb, t, p: ps[Math.floor(Math.random() * ps.length)] }); }); return items; }
    const cands = candidates(st); if (!cands.length) return items;
    const focus = opts.tenses || focusTenses();
    let last = items.length ? items[items.length - 1].v : null, guard = 0;
    while (items.length < n && guard++ < n * 10) {
      const c = P.pickWeighted(cands, x => weight(x, focus));
      if (c.v === last && cands.length > 3) continue;
      items.push({ v: c.v, t: c.t, p: c.ps[Math.floor(Math.random() * c.ps.length)] }); last = c.v;
    }
    return items;
  }

  // ---------- session ----------
  let VD = null;
  P.startVerbDrill = function (opts) {
    opts = opts || {};
    TTS.stop();
    const n = opts.minutes ? 80 : opts.len || S().settings.sayLen || 20;
    VD = { items: build(n, opts), i: 0, phase: 'cue', ok: 0, slow: 0, done: 0, missed: [], times: [], start: now(), minutes: opts.minutes || 0, t0: 0, peek: false };
    Store.change({ silent: true });
    if (P.route() !== 'gym') history.pushState(null, '', '#/gym'); P.render();
  };
  // Opening the verb panel before revealing counts as a peek: the item is graded at most "Slow".
  P.panelOpened = () => { if (VD && P.route() === 'gym' && VD.phase === 'cue' && VD.i < VD.items.length) VD.peek = true; };
  const cueText = it => [P.CUE[it.t], who(it.t, it.p), it.v].filter(Boolean).join(', ');
  const timeLeft = () => VD.minutes ? VD.minutes * 60000 - (now() - VD.start) : Infinity;
  async function speakCue(it) {
    const t = TTS.token();
    if (S().settings.autoplay) { await TTS.sayOrRead(cueText(it)); if (t !== TTS.token()) return; }
    if (VD && VD.items[VD.i] === it && VD.phase === 'cue' && !VD.t0) VD.t0 = performance.now(); // the clock starts when the cue has been heard
  }
  const chainLine = (v, t) => persons(v, t).map(p => `${who(t, p)} ${P.VERB[v].f[t][p]}`).join(' · ');
  V.gym = function (el) {
    if (!VD) return landing(el);
    if (VD.i >= VD.items.length || (VD.phase === 'cue' && timeLeft() <= 0 && VD.done)) return summary(el);
    const it = VD.items[VD.i]; const vb = P.VERB[it.v]; const irr = P.isIrr(it.v, it.t, it.p);
    P.panelCtx = { v: it.v, t: it.t, p: it.p };
    const revealed = VD.phase !== 'cue';
    const cue = P.CUE[it.t];
    const front = `<div class="verbline">${cue ? `<span class="muted">${esc(cue)}</span> ` : ''}${esc(P.personLabel(it.t, it.p))}<b>${esc(it.v)}</b></div>
      <div class="small muted">${esc(vb.def.en)}${irr ? ' · <span class="irr-flag">★ irregular here</span>' : ''}</div>`;
    const answer = `<span class="big-form">${cue ? `<span class="muted">${esc(cue)}</span> ` : ''}${it.t === 'imp' ? '' : esc(who(it.t, it.p)) + ' '}${P.vformHTML(it.v, it.t, it.p)}</span>
      <div class="small muted" style="margin-top:4px">${esc(Conj.label(it.t))} · ${esc(PERSON_EN[it.p])}</div>`;
    const meta = [`Verbos · ${VD.ok} ✓${VD.peek && !revealed ? ' · peeked' : ''}`, VD.minutes ? `${Math.max(0, Math.ceil(timeLeft() / 60000))} min left` : `${VD.i + 1} / ${VD.items.length}`];
    el.innerHTML = P.sayCard({
      meta, progress: VD.minutes ? Math.min(1, (now() - VD.start) / (VD.minutes * 60000)) : VD.i / VD.items.length,
      label: it.chain && it.chain.startsWith('as ') ? `<span class="chain">Now ${esc(it.chain)}</span> <span class="tiny term">${esc(Conj.TENSE[it.t].pt)}</span>`
        : (it.chain ? `<span class="chain">Now ${esc(it.chain)}</span> · ` : '') + patHTML(it.t),
      front, answer, say: P.vsay(it.v, it.t, it.p, true), revealed, cue: cueText(it), cueBig: !S().settings.autoplay,
      help: VD.phase === 'missed' ? `${esc(Conj.label(it.t))}${irr ? ' (irregular)' : ''}: ${esc(chainLine(it.v, it.t))}` : '',
      after: VD.phase === 'missed' ? `<button class="btn primary block say-main" data-act="vd-cont">Continue <span class="kbd">Enter</span></button>` : null,
      acts: { reveal: 'vd-reveal', grade: 'vd-grade', end: 'vd-end', replay: 'vd-cue' },
      extra: `<button class="btn ghost" data-act="vpanel">${ICON.table} Look up</button>`,
    });
    if (!VD.spoken) { VD.spoken = true; VD.t0 = 0; speakCue(it); }
  };
  function landing(el) {
    const st = S().settings; const sel = st.sayTenses && st.sayTenses.length ? st.sayTenses : ALL(); const sets = st.saySets || ['irr', 'stem', 'reg'];
    const focus = focusTenses(); P.panelCtx = { t: focus[0] };
    el.innerHTML = `<div class="hero"><div><h1>Verbos</h1><div class="muted">Hear the cue, say the form out loud, reveal, grade yourself. Irregular forms are marked ★.</div></div>
        <div class="row"><button class="btn" data-act="vpanel">${ICON.table} Look up a verb</button></div></div>
      <div class="card">
        <div class="grid two" style="gap:10px"><button class="btn primary say-main" data-act="vd-start">Start (${st.sayLen || 20})</button><button class="btn say-main" data-act="vd-five">5 minutes</button></div>
        <p class="small muted" style="margin:12px 0 0">Focus now: <b>${focus.map(t => esc(Conj.label(t))).join(' · ')}</b>, mixed with everything else, weighted towards irregulars and the forms you miss or answer slowly. <span class="kbd">Space</span> reveal · <span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">3</span> grade · <span class="kbd">r</span> hear the cue again.</p>
        <details style="margin-top:14px"><summary class="small">Advanced</summary>
          <h3 style="margin-top:12px">Patterns</h3><div class="chips" style="margin-bottom:14px">${Conj.TENSES.map(t => `<button class="chip big ${sel.includes(t.k) ? 'on' : ''}" data-act="vd-tense" data-k="${t.k}">${esc(t.pat)} <span class="lvl">${esc(t.pt)}</span></button>`).join('')}</div>
          <h3>Verbs</h3><div class="chips" style="margin-bottom:14px">${[['irr', 'Core irregulars'], ['stem', 'Stem & spelling changes'], ['reg', 'Regular']].map(([k, l]) => `<button class="chip big ${sets.includes(k) ? 'on' : ''}" data-act="vd-set" data-k="${k}">${l}</button>`).join('')}</div>
          <h3>Length</h3><div class="chips">${[10, 20, 40].map(n => `<button class="chip big ${(st.sayLen || 20) === n ? 'on' : ''}" data-act="vd-len" data-k="${n}">${n}</button>`).join('')}</div></details></div>
      <div class="card flat"><h3>Focus one verb</h3><p class="small muted">Every pattern of a single verb in a row.</p>
        <div class="chips">${VERBS.filter(v => v.set === 'irr').slice(0, 16).map(v => `<button class="chip big" data-act="vd-focus" data-k="${esc(v.v)}">${esc(v.v)}</button>`).join('')}</div></div>
      <div class="row"><a class="btn ghost" href="#/sprint">Typed sprint (keyboard)</a><a class="btn ghost" href="#/tables">${ICON.table} Verb tables</a></div>`;
  }
  function summary(el) {
    const acc = Math.round(VD.ok / Math.max(1, VD.done) * 100);
    const avg = VD.times.length ? (VD.times.reduce((a, b) => a + b, 0) / VD.times.length / 1000).toFixed(1) : '–';
    el.innerHTML = `<div class="study"><div class="card">
      <h1 style="text-align:center">Feito!</h1>
      <div class="grid three" style="margin:16px 0"><div class="stat"><div class="n">${acc}%</div><div class="l">got it</div></div><div class="stat"><div class="n">${avg}s</div><div class="l">avg time to answer</div></div><div class="stat"><div class="n">${VD.missed.length}</div><div class="l">added to reviews</div></div></div>
      ${VD.missed.length ? `<h3>Missed</h3><ul class="summary-list">${VD.missed.map(m => `<li><span>${esc(Conj.label(m.t))} · ${esc(who(m.t, m.p))} · ${esc(m.v)}<br>${P.vformHTML(m.v, m.t, m.p)}</span><button class="iconbtn" data-act="say" data-say="${esc(P.vsay(m.v, m.t, m.p, true))}" aria-label="Listen">${ICON.speaker}</button></li>`).join('')}</ul>` : '<div class="note-good">No misses. Muito bem!</div>'}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-act="vd-start">Again</button><a class="btn" href="#/transform">Transformations</a><a class="btn ghost" href="#/today">Today</a></div></div></div>`;
    P.bump('vsaySessions'); Store.change({ silent: true });
    if (P.stepDone) P.stepDone('verbs');
    VD = null;
  }
  function next() { VD.i++; VD.phase = 'cue'; VD.spoken = false; VD.peek = false; VD.t0 = 0; P.render(); }
  act['vd-start'] = () => P.startVerbDrill();
  act['vd-five'] = () => P.startVerbDrill({ minutes: 5 });
  act['vd-focus'] = b => P.startVerbDrill({ verb: b.dataset.k });
  act['vd-cue'] = () => { if (VD && VD.items[VD.i]) { TTS.stop(); TTS.say(cueText(VD.items[VD.i])); } };
  act['vd-reveal'] = () => {
    if (!VD || VD.phase !== 'cue') return;
    VD.ms = VD.t0 ? performance.now() - VD.t0 : 5000;
    TTS.stop(); VD.phase = 'reveal'; P.render();
    const it = VD.items[VD.i]; if (S().settings.autoplay) TTS.say(P.vsay(it.v, it.t, it.p, true));
  };
  act['vd-grade'] = b => {
    if (!VD || VD.phase !== 'reveal') return;
    let g = +b.dataset.g; const it = VD.items[VD.i];
    if (VD.peek && g === 3) g = 2;
    const ms = g === 3 ? VD.ms : Math.max(VD.ms, 6500);
    P.recordConj(it.v, it.t, g > 1, ms); P.bump('vsay');
    VD.done++; if (g === 3) { VD.ok++; VD.times.push(VD.ms); } if (g === 2) VD.slow++;
    if (g === 1) {
      P.addFormCard(it.v, it.t, it.p);
      if (!VD.missed.some(m => m.v === it.v && m.t === it.t && m.p === it.p)) VD.missed.push(it);
      if (!it.retry) VD.items.splice(Math.min(VD.items.length, VD.i + 4), 0, { v: it.v, t: it.t, p: it.p, retry: true });
      VD.phase = 'missed'; Store.change({ silent: true }); P.render();
      TTS.stop(); TTS.say(chainLine(it.v, it.t).replace(/ · /g, ', '));
      return;
    }
    // Chains: sometimes the same verb comes straight back for another person or another pattern
    if (!it.chain && !it.retry && Math.random() < 0.35) {
      let c = null;
      if (Math.random() < 0.5) { const ps = persons(it.v, it.t).filter(p => p !== it.p); if (ps.length) { const p = ps[Math.floor(Math.random() * ps.length)]; c = { v: it.v, t: it.t, p, chain: `for ${CHAIN_P[p]}` }; } }
      else { const ts = focusTenses().concat(['pps', 'pimp', 'ppc', 'cond']).filter(t => t !== it.t && P.VERB[it.v].f[t] && P.VERB[it.v].f[t][it.p]); if (ts.length) { const t = ts[0]; c = { v: it.v, t, p: it.p, chain: `as ${Conj.label(t).toUpperCase()}` }; } }
      if (c) VD.items.splice(VD.i + 1, 0, c);
    }
    Store.change({ silent: true }); next();
  };
  act['vd-cont'] = () => { if (VD && VD.phase === 'missed') { TTS.stop(); next(); } };
  act['vd-end'] = () => { TTS.stop(); if (VD && VD.done) VD.i = VD.items.length; else VD = null; P.render(); };
  const toggle = (arr, k) => arr.includes(k) ? arr.filter(x => x !== k) : arr.concat([k]);
  act['vd-tense'] = b => { const st = S().settings; const cur = st.sayTenses && st.sayTenses.length ? st.sayTenses : ALL(); const n = toggle(cur, b.dataset.k); if (n.length) st.sayTenses = ALL().filter(k => n.includes(k)); Store.change(); };
  act['vd-set'] = b => { const st = S().settings; const n = toggle(st.saySets || ['irr', 'stem', 'reg'], b.dataset.k); if (n.length) st.saySets = n; Store.change(); };
  act['vd-len'] = b => { S().settings.sayLen = +b.dataset.k; Store.change(); };
  P.keys.gym = e => {
    if (!VD || !keyOk(e)) return;
    const k = e.key;
    if (VD.phase === 'cue' && (k === ' ' || k === 'Enter')) { e.preventDefault(); act['vd-reveal'](); }
    else if (VD.phase === 'reveal' && ['1', '2', '3'].includes(k)) { e.preventDefault(); act['vd-grade']({ dataset: { g: k } }); }
    else if (VD.phase === 'missed' && (k === 'Enter' || k === ' ')) { e.preventDefault(); act['vd-cont'](); }
    else if (k === 'r' || k === 'R') { e.preventDefault(); act['vd-cue'](); }
  };
  P.leave.gym = () => { P.panelCtx = null; if (VD) VD.spoken = VD.phase !== 'cue'; };
})(Pois);
