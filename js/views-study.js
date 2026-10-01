/* Study views: spaced-repetition review, conjugation gym, context drills, verb tables. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views = P.views || {};

  // ======================= REVIEW =======================
  let RS = null; // review session
  function buildSession() {
    const s = S();
    const due = P.dueIds().slice(0, s.settings.maxReviews || 200);
    const fresh = P.newIds(P.newLeft());
    const q = [];
    let i = 0, j = 0;
    while (i < due.length || j < fresh.length) {
      if (i < due.length) q.push(due[i++]);
      if (i < due.length) q.push(due[i++]);
      if (j < fresh.length) q.push(fresh[j++]);
    }
    return { queue: q, i: 0, phase: 'front', graded: 0, again: 0, start: Date.now(), result: null, showHint: false };
  }
  V.review = function (el) {
    if (!RS || RS.i >= RS.queue.length) {
      if (RS && RS.graded) return reviewDone(el);
      const due = P.dueIds().length, fresh = Math.min(P.newLeft(), P.newIds(P.newLeft()).length);
      el.innerHTML = `
        <div class="hero"><div><h1>Rever</h1><div class="muted">Spaced repetition: each card comes back just before you'd forget it.</div></div></div>
        <div class="grid three">
          <div class="stat"><div class="n">${due}</div><div class="l">due for review</div></div>
          <div class="stat"><div class="n">${fresh}</div><div class="l">new today</div></div>
          <div class="stat"><div class="n">${Object.values(S().cards).filter(c => c.state === 2).length}</div><div class="l">cards in rotation</div></div>
        </div>
        <div class="card" style="margin-top:14px">
          ${due + fresh ? `<button class="btn primary block" data-act="rv-start">Start session (${due + fresh})</button>` : `<div class="note-good">All caught up for now. Nice. Try a verb sprint or a context drill.</div>`}
          <p class="small muted" style="margin:12px 0 0">Recognition cards: <span class="kbd">Space</span> to reveal, <span class="kbd">1</span>–<span class="kbd">4</span> to grade. Typing cards: <span class="kbd">Enter</span> to check, <span class="kbd">Enter</span> again to accept the suggested grade.</p>
        </div>
        ${P.newLeft() === 0 ? `<div class="card flat"><div class="row between"><span class="small muted">You've had today's ${S().settings.newPerDay} new cards.</span><button class="btn sm" data-act="rv-extra">+5 more new</button></div></div>` : ''}`;
      return;
    }
    const id = RS.queue[RS.i];
    const c = P.view(id);
    if (!c) { RS.i++; return V.review(el); }
    const card = S().cards[id] || { state: 0 };
    const prev = FSRS.preview(card, Date.now(), { retention: S().settings.retention });
    const prog = Math.round(RS.i / RS.queue.length * 100);
    const revealed = RS.phase !== 'front';
    const typed = c.type === 'type';
    const res = RS.result;
    let body = '';
    if (typed) {
      body = `<div class="answer-area" style="margin-top:14px">
        <input class="answer ${res ? (res.ok ? 'ok' : 'bad') : ''}" id="ans" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" autocorrect="off" placeholder="type in Portuguese…" ${revealed ? 'readonly' : ''} value="${esc(RS.typed || '')}">
        ${revealed ? '' : P.accentBar('ans')}
        ${!revealed && c.hint ? (RS.showHint ? `<div class="small muted" style="margin-top:8px">Hint: ${c.hint}</div>` : `<button class="btn ghost sm" data-act="rv-hint" style="margin-top:6px">Show hint</button>`) : ''}
      </div>`;
      if (revealed) {
        body += `<div class="answer-block">
          ${res.ok && !res.accent ? `<div class="note-good">Certo!</div>` : res.ok && res.accent ? `<div class="note-warn">Almost: watch the accents → <b>${esc(c.answer)}</b></div>` : `<div class="note-bad">${res.empty ? 'Answer' : 'Not quite'}: <b>${esc(c.answer)}</b></div>`}
          <div style="margin-top:12px">${c.back}</div></div>`;
      }
    } else if (revealed) body = `<div class="answer-block">${c.back}</div>`;
    const sug = typed && revealed ? (res.ok ? (res.accent ? 2 : 3) : 1) : 0;
    el.innerHTML = `<div class="study">
      <div class="meta"><span>${esc(c.deck)} ${c.isNew ? '<span class="badge new">NOVO</span>' : ''}</span><span>${RS.i + 1} / ${RS.queue.length}</span></div>
      <div class="progress" style="margin-bottom:14px"><div style="width:${prog}%"></div></div>
      <div class="qcard">
        <div class="row between" style="margin-bottom:6px"><span class="prompt-label" style="margin:0">${esc(c.label)}</span>
          <button class="iconbtn" data-act="say" data-say="${esc(c.say)}" title="Listen" aria-label="Listen">${ICON.speaker}</button></div>
        ${c.front}${body}
      </div>
      ${revealed ? `<div class="grades">
          <button class="g1 ${sug === 1 ? 'suggest' : ''}" data-act="rv-grade" data-g="1">Again<small>${prev[1]}</small></button>
          <button class="g2 ${sug === 2 ? 'suggest' : ''}" data-act="rv-grade" data-g="2">Hard<small>${prev[2]}</small></button>
          <button class="g3 ${sug === 3 ? 'suggest' : ''}" data-act="rv-grade" data-g="3">Good<small>${prev[3]}</small></button>
          <button class="g4" data-act="rv-grade" data-g="4">Easy<small>${prev[4]}</small></button></div>`
        : `<div class="row" style="margin-top:14px">${typed ? `<button class="btn primary" style="flex:1" data-act="rv-check">Check</button>` : `<button class="btn primary" style="flex:1" data-act="rv-reveal">Show answer</button>`}
           ${c.isNew ? `<button class="btn" data-act="rv-know" title="Skip ahead: you already know this word">I know this</button>` : ''}</div>`}
      <div class="row between" style="margin-top:14px"><button class="btn ghost sm" data-act="rv-end">End session</button>
        ${P.parseId(id).kind === 'n' ? `<button class="btn ghost sm" data-act="rv-suspend">Suspend card</button>` : `<button class="btn ghost sm" data-act="rv-suspend">Suspend card</button>`}</div>
    </div>`;
    const input = el.querySelector('#ans');
    if (input && !revealed) setTimeout(() => input.focus(), 30);
    if (!RS.spoken && S().settings.autoplay && ((c.type === 'self' && !revealed) || (c.sayAfter && revealed))) { RS.spoken = true; TTS.speak(c.say); }
  };
  function reviewDone(el) {
    const mins = Math.max(1, Math.round((Date.now() - RS.start) / 60000));
    el.innerHTML = `<div class="study"><div class="card" style="text-align:center">
      <h1>Feito! 🎉</h1><p class="muted">${RS.graded} cards in ${mins} min${RS.again ? ` · ${RS.again} to see again soon` : ''}.</p>
      <div class="row" style="justify-content:center"><a class="btn primary" href="#/today">Back to today</a><a class="btn" href="#/gym">Verb sprint</a></div></div></div>`;
    RS = null;
  }
  function next() { RS.i++; RS.phase = 'front'; RS.result = null; RS.typed = ''; RS.spoken = false; RS.showHint = false; }
  const act = P.actions = P.actions || {};
  act['rv-start'] = () => { RS = buildSession(); P.render(); };
  act['rv-extra'] = () => { P.dayRec().newc = Math.max(0, (P.dayRec().newc || 0) - 5); Store.change(); };
  act['rv-reveal'] = () => { RS.phase = 'back'; RS.spoken = false; P.render(); };
  act['rv-hint'] = () => { RS.showHint = true; RS.typed = document.getElementById('ans')?.value || ''; P.render(); };
  act['rv-check'] = () => {
    const c = P.view(RS.queue[RS.i]); const v = document.getElementById('ans').value;
    RS.typed = v; RS.result = P.checkAnswer(v, c.answer); RS.phase = 'back'; RS.spoken = false; P.render();
  };
  act['rv-grade'] = (b) => {
    const g = +b.dataset.g; const id = RS.queue[RS.i];
    const n = P.gradeCard(id, g); RS.graded++;
    if (n.state === 1) { RS.again++; RS.queue.splice(Math.min(RS.queue.length, RS.i + 4), 0, id); }
    next(); P.render();
  };
  act['rv-know'] = () => { P.knowIt(RS.queue[RS.i]); RS.graded++; next(); P.render(); };
  act['rv-suspend'] = () => { const id = RS.queue[RS.i]; const c = P.ensureCard(id); c.suspended = true; Store.change({ silent: true }); P.toast('Card suspended. Undo it in Progress → Cards.'); next(); P.render(); };
  act['rv-end'] = () => { if (RS && RS.graded) { RS.i = RS.queue.length; } else RS = null; P.render(); };
  P.keys.review = (e) => {
    if (!RS || RS.i >= RS.queue.length) return;
    const c = P.view(RS.queue[RS.i]); if (!c) return;
    const inInput = e.target && e.target.id === 'ans';
    if (RS.phase === 'front') {
      if (c.type === 'self' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); act['rv-reveal'](); }
      else if (c.type === 'type' && e.key === 'Enter' && inInput) { e.preventDefault(); act['rv-check'](); }
    } else {
      if (['1', '2', '3', '4'].includes(e.key)) { e.preventDefault(); act['rv-grade']({ dataset: { g: e.key } }); }
      else if (e.key === 'Enter' || (e.key === ' ' && !inInput)) {
        e.preventDefault();
        let g = 3; if (c.type === 'type') g = RS.result.ok ? (RS.result.accent ? 2 : 3) : 1;
        act['rv-grade']({ dataset: { g } });
      }
    }
  };

  // ======================= CONJUGATION GYM =======================
  let GS = null;
  function gymCandidates() {
    const st = S().settings; const out = [];
    for (const [v, { def, f }] of Object.entries(P.VERB)) {
      if (!st.verbSets.includes(def.set)) continue;
      for (const t of st.tenses) {
        const persons = [0, 1, 2, 3, 4].filter(p => f[t] && f[t][p] && (st.persons.includes(p) || def.persons));
        if (persons.length) out.push({ v, t, persons });
      }
    }
    return out;
  }
  function gymWeight(c) {
    const x = S().conj[c.v + '|' + c.t];
    const set = P.VERB[c.v].def.set;
    const base = set === 'irr' ? 1.5 : set === 'stem' ? 1.1 : 0.8;
    if (!x) return base * 1.2;
    const days = (Date.now() - (x.last || 0)) / P.DAY;
    return base * (0.15 + (1 - x.ema) * 2.2 + (x.ms > 6000 ? 0.5 : x.ms > 4000 ? 0.25 : 0) + Math.min(1, days / 5) * 0.6);
  }
  function gymNext() {
    const cands = gymCandidates();
    if (!cands.length) return null;
    let c, guard = 0;
    do { c = P.pickWeighted(cands, gymWeight); guard++; } while (GS.last && c.v === GS.last.v && guard < 6 && cands.length > 3);
    const p = c.persons[Math.floor(Math.random() * c.persons.length)];
    return { v: c.v, t: c.t, p };
  }
  V.gym = function (el) {
    const st = S().settings;
    if (!GS) {
      const cands = gymCandidates();
      el.innerHTML = `
        <div class="hero"><div><h1>Verbos</h1><div class="muted">Fast, typed recall until the forms come automatically. Mistakes go into your reviews.</div></div>
          <a class="btn" href="#/tables">${ICON.table} Verb tables</a></div>
        <div class="card">
          <h3>Tenses</h3>
          <div class="chips" style="margin-bottom:14px">${Conj.TENSES.map(t => `<button class="chip ${st.tenses.includes(t.k) ? 'on' : ''}" data-act="gym-tense" data-k="${t.k}" title="${esc(t.en)}">${esc(t.pt)}<span class="lvl">${t.lvl}</span></button>`).join('')}</div>
          <h3>Verbs</h3>
          <div class="chips" style="margin-bottom:14px">
            ${[['irr', 'Core irregulars'], ['stem', 'Stem & spelling changes'], ['reg', 'Regular']].map(([k, l]) => `<button class="chip ${st.verbSets.includes(k) ? 'on' : ''}" data-act="gym-set" data-k="${k}">${l} <span class="lvl">${VERBS.filter(v => v.set === k).length}</span></button>`).join('')}
          </div>
          <h3>Persons</h3>
          <div class="chips" style="margin-bottom:14px">${['eu', 'tu', 'ele/ela/você', 'nós', 'eles/vocês'].map((l, p) => `<button class="chip ${st.persons.includes(p) ? 'on' : ''}" data-act="gym-person" data-k="${p}">${l}</button>`).join('')}</div>
          <h3>Length</h3>
          <div class="chips" style="margin-bottom:18px">${[10, 20, 40].map(n => `<button class="chip ${st.sprintLen === n ? 'on' : ''}" data-act="gym-len" data-k="${n}">${n}</button>`).join('')}</div>
          <button class="btn primary block" data-act="gym-start" ${cands.length ? '' : 'disabled'}>Start sprint</button>
          <p class="small muted" style="margin:10px 0 0">The picker favours the verbs and tenses you get wrong or answer slowly. Target: under ~3 seconds each.</p>
        </div>
        ${quickFocus()}`;
      return;
    }
    if (GS.i >= GS.items.length) return gymSummary(el);
    const it = GS.items[GS.i]; const vb = P.VERB[it.v]; const ans = vb.f[it.t][it.p];
    const res = GS.result;
    el.innerHTML = `<div class="study">
      <div class="meta"><span>Sprint · ${GS.ok} ✓</span><span>${GS.i + 1} / ${GS.items.length}</span></div>
      <div class="progress" style="margin-bottom:14px"><div style="width:${GS.i / GS.items.length * 100}%"></div></div>
      <div class="qcard">
        <div class="prompt-label">${esc(Conj.TENSE[it.t].pt)} <span class="tiny">· ${esc(Conj.TENSE[it.t].en)}</span></div>
        <div class="verbline">${esc(P.personLabel(it.t, it.p))}<b>${esc(it.v)}</b></div>
        <div class="small muted">${esc(vb.def.en)}</div>
        <div style="margin-top:14px"><input class="answer ${res ? (res.ok ? 'ok' : 'bad') : ''}" id="ans" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" autocorrect="off" ${res ? 'readonly' : ''} value="${esc(GS.typed || '')}"></div>
        ${res ? '' : P.accentBar('ans') + `<div class="timerbar"><div id="tb"></div></div>`}
        ${res ? `<div class="answer-block">
          ${res.ok && !res.accent ? `<div class="note-good">Certo! <span class="small">${(GS.ms / 1000).toFixed(1)}s</span></div>` : res.ok ? `<div class="note-warn">Accent: <b>${esc(ans)}</b></div>` : `<div class="note-bad">${esc(ans)}</div>`}
          ${P.conjTable(it.v, it.t, it.p)}
          <button class="btn primary block" style="margin-top:16px" data-act="gym-next">Continue <span class="kbd">Enter</span></button></div>` : ''}
      </div>
      <div class="row between" style="margin-top:12px"><button class="btn ghost sm" data-act="gym-end">End sprint</button><button class="btn ghost sm" data-act="say" data-say="${esc(ans)}">${ICON.speaker} Listen</button></div>
    </div>`;
    if (!res) {
      GS.t0 = GS.t0 || performance.now();
      const input = el.querySelector('#ans'); setTimeout(() => input.focus(), 20);
      const tb = el.querySelector('#tb');
      if (tb) { tb.animate([{ transform: 'scaleX(1)', background: 'var(--good)' }, { transform: 'scaleX(0.35)', background: 'var(--warn)' }, { transform: 'scaleX(0)', background: 'var(--bad)' }], { duration: 8000, fill: 'forwards' }); }
    }
  };
  function quickFocus() {
    const irr = VERBS.filter(v => v.set === 'irr').slice(0, 16);
    return `<div class="card flat"><h3>Focus one verb</h3><p class="small muted">Drill every tense of a single verb in a row.</p>
      <div class="chips">${irr.map(v => `<button class="chip" data-act="gym-focus" data-k="${esc(v.v)}">${esc(v.v)}</button>`).join('')}</div></div>`;
  }
  function gymSummary(el) {
    const acc = Math.round(GS.ok / GS.done * 100) || 0;
    const avg = GS.times.length ? (GS.times.reduce((a, b) => a + b, 0) / GS.times.length / 1000).toFixed(1) : '–';
    const slow = GS.log.filter(x => x.ok).sort((a, b) => b.ms - a.ms).slice(0, 4);
    el.innerHTML = `<div class="study"><div class="card">
      <h1 style="text-align:center">Sprint done</h1>
      <div class="grid three" style="margin:16px 0"><div class="stat"><div class="n">${acc}%</div><div class="l">accuracy</div></div><div class="stat"><div class="n">${avg}s</div><div class="l">avg time</div></div><div class="stat"><div class="n">${GS.misses.length}</div><div class="l">added to reviews</div></div></div>
      ${GS.misses.length ? `<h3>Missed</h3><ul class="summary-list">${GS.misses.map(m => `<li><span>${esc(P.personLabel(m.t, m.p))} · ${esc(m.v)} · <span class="muted small">${esc(Conj.TENSE[m.t].pt)}</span></span><b>${esc(P.VERB[m.v].f[m.t][m.p])}</b></li>`).join('')}</ul>` : '<div class="note-good">No misses!</div>'}
      ${slow.length ? `<h3 style="margin-top:16px">Slowest correct</h3><ul class="summary-list">${slow.map(m => `<li><span>${esc(P.personLabel(m.t, m.p))} · ${esc(m.v)}</span><span>${esc(P.VERB[m.v].f[m.t][m.p])} <span class="muted small">${(m.ms / 1000).toFixed(1)}s</span></span></li>`).join('')}</ul>` : ''}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-act="gym-again">Another sprint</button><a class="btn" href="#/drills">Context drills</a><a class="btn ghost" href="#/today">Today</a></div>
    </div></div>`;
    P.bump('sprints'); Store.change({ silent: true });
    GS = null;
  }
  function startGym(items) { GS = { items, i: 0, ok: 0, done: 0, times: [], misses: [], log: [], result: null, typed: '' }; if (!items) { GS.items = []; for (let k = 0; k < S().settings.sprintLen; k++) { const n = gymNext(); if (!n) break; GS.items.push(n); GS.last = n; } } P.render(); }
  act['gym-start'] = () => startGym();
  act['gym-again'] = () => startGym();
  act['gym-focus'] = (b) => {
    const v = b.dataset.k; const f = P.VERB[v].f; const items = [];
    Conj.TENSES.forEach(t => { if (!S().settings.tenses.includes(t.k)) return; [0, 1, 2, 3, 4].forEach(p => { if (f[t.k][p]) items.push({ v, t: t.k, p }); }); });
    startGym(items);
  };
  const toggle = (arr, k) => arr.includes(k) ? arr.filter(x => x !== k) : arr.concat([k]);
  act['gym-tense'] = (b) => { const st = S().settings; const n = toggle(st.tenses, b.dataset.k); if (n.length) st.tenses = Conj.TENSES.map(t => t.k).filter(k => n.includes(k)); Store.change(); };
  act['gym-set'] = (b) => { const st = S().settings; const n = toggle(st.verbSets, b.dataset.k); if (n.length) st.verbSets = n; Store.change(); };
  act['gym-person'] = (b) => { const st = S().settings; const n = toggle(st.persons, +b.dataset.k); if (n.length) st.persons = n.sort(); Store.change(); };
  act['gym-len'] = (b) => { S().settings.sprintLen = +b.dataset.k; Store.change(); };
  act['gym-end'] = () => { if (GS && GS.done) GS.i = GS.items.length; else GS = null; P.render(); };
  function gymCheck() {
    const it = GS.items[GS.i]; const ans = P.VERB[it.v].f[it.t][it.p];
    const input = document.getElementById('ans'); const v = input.value;
    if (!v.trim()) return;
    const ms = performance.now() - GS.t0;
    const r = P.checkAnswer(v, ans);
    GS.result = r; GS.typed = v; GS.ms = ms; GS.done++;
    P.recordConj(it.v, it.t, r.ok && !r.accent, ms);
    GS.log.push({ ...it, ok: r.ok, ms });
    if (r.ok) { GS.ok++; GS.times.push(ms); }
    if (!r.ok) {
      GS.misses.push(it); P.addFormCard(it.v, it.t, it.p);
      if (!it.retry) GS.items.splice(Math.min(GS.items.length, GS.i + 4), 0, { ...it, retry: true });
    }
    if (S().settings.autoplay) TTS.speak((it.t === 'imp' ? '' : P.personLabel(it.t, it.p).split(' / ')[0] + ' ') + ans);
    Store.change({ silent: true }); P.render();
  }
  act['gym-next'] = () => { GS.i++; GS.result = null; GS.typed = ''; GS.t0 = 0; P.render(); };
  P.keys.gym = (e) => {
    if (!GS || GS.i >= GS.items.length) return;
    if (e.key === 'Enter') { e.preventDefault(); if (GS.result) act['gym-next'](); else gymCheck(); }
  };

  // ======================= CONTEXT DRILLS =======================
  let DS = null;
  const drillKey = d => d.set + '|' + d.s;
  function drillPick(n) {
    const sets = S().settings.drillSets; const pool = DRILLS.filter(d => sets.includes(d.set));
    const st = S().drills; const out = []; const used = new Set();
    for (let k = 0; k < Math.min(n, pool.length); k++) {
      const avail = pool.filter(d => !used.has(d));
      const d = P.pickWeighted(avail, d => { const x = st[drillKey(d)]; if (!x) return 1.3; const acc = x.ok / x.n; return 0.2 + (1 - acc) * 2 + Math.min(1, (Date.now() - x.last) / (P.DAY * 7)) * 0.5; });
      used.add(d); out.push(d);
    }
    return out;
  }
  function drillCorrectOpt(d) { const set = DRILL_SETS[d.set]; if (set.by === 't') return d.t; if (set.by === 'v') return d.v; if (set.by === 'pos') return d.pos; return ['cpres', 'cimp', 'cfut'].includes(d.t) ? 'conj' : 'ind'; }
  // Drills with a literal answer (d.a, e.g. pronoun placement) vs a form from the conjugation engine.
  const drillAns = d => d.a ? [].concat(d.a)[0] : P.VERB[d.v].f[d.t][d.p];
  // In EP speech the imperfeito often stands in for the condicional (gostava, comprava), so accept both.
  const drillAccepted = d => d.a ? [].concat(d.a) : d.t === 'cond' ? [drillAns(d), P.VERB[d.v].f.pimp[d.p]] : [drillAns(d)];
  V.drills = function (el) {
    const st = S().settings;
    if (!DS) {
      el.innerHTML = `<div class="hero"><div><h1>Contexto</h1><div class="muted">Choose the right tense or verb from the sentence, then type the form. Mixing the types trains the decision itself.</div></div></div>
        <div class="card"><h3>Mix</h3><div class="stack">${Object.entries(DRILL_SETS).map(([k, s]) => {
          const items = DRILLS.filter(d => d.set === k); const seen = items.filter(d => S().drills[drillKey(d)]); const acc = seen.length ? Math.round(seen.reduce((a, d) => a + S().drills[drillKey(d)].ok / S().drills[drillKey(d)].n, 0) / seen.length * 100) : null;
          return `<label class="row" style="flex-wrap:nowrap;gap:12px;align-items:flex-start;cursor:pointer"><input type="checkbox" data-act="drill-set" data-k="${k}" ${st.drillSets.includes(k) ? 'checked' : ''} style="width:20px;height:20px;margin-top:3px">
            <span><b>${esc(s.name)}</b> ${s.b1 ? '<span class="badge acc">B1</span>' : ''}<br><span class="small muted">${esc(s.desc)} · ${items.length} sentences${acc != null ? ` · ${acc}% so far` : ''}</span></span></label>`;
        }).join('')}</div>
        <button class="btn primary block" style="margin-top:16px" data-act="drill-start">Start (${st.drillLen})</button></div>`;
      return;
    }
    if (DS.i >= DS.items.length) return drillSummary(el);
    const d = DS.items[DS.i]; const set = DRILL_SETS[d.set]; const ans = drillAns(d);
    const correct = drillCorrectOpt(d);
    const cue = d.a ? esc(d.cue) : set.by === 'v' ? 'ser / estar' : esc(d.v);
    const sentence = esc(d.s).replace(/___( \(([^)]+)\))?/, (m, g1, g2) => `<span class="blank">&nbsp;</span> <span class="muted small">(${cue}${g2 ? ', ' + g2 : ''})</span>`);
    const filled = d.s.replace(/___( \([^)]+\))?/, ans);
    let step = '';
    if (DS.phase === 'choose') step = `<div class="optbtns">${set.opts.map(([k, l]) => `<button class="btn" data-act="drill-opt" data-k="${k}">${esc(l)}</button>`).join('')}</div>`;
    else {
      const optRow = `<div class="optbtns">${set.opts.map(([k, l]) => `<button class="btn ${k === correct ? 'right' : k === DS.chosen ? 'wrong' : ''}" disabled>${esc(l)}</button>`).join('')}</div>`;
      const tenseInfo = d.a ? `${esc(d.cue)} → verb + pronoun` : `${esc(P.personLabel(d.t, d.p))} · ${esc(d.v)} · ${esc(Conj.TENSE[d.t].pt)}`;
      if (DS.phase === 'type') step = `${optRow}<div class="small muted" style="margin-top:12px">${DS.chosen === correct ? 'Yes!' : 'Not this time.'} Now type it: <b>${tenseInfo}</b></div>
        <input class="answer" id="ans" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" autocorrect="off" style="margin-top:8px">${P.accentBar('ans')}
        <button class="btn primary block" style="margin-top:12px" data-act="drill-check">Check</button>`;
      else {
        const r = DS.result; const full = filled;
        const alt = !d.a && d.t === 'cond' ? `<div class="small muted" style="margin-top:6px">In speech the imperfeito <b>${esc(P.VERB[d.v].f.pimp[d.p])}</b> works here too.</div>` : '';
        step = `${optRow}<input class="answer ${r.ok ? 'ok' : 'bad'}" value="${esc(DS.typed)}" readonly style="margin-top:12px">
          <div class="answer-block">${r.ok && !r.accent ? '<div class="note-good">Certo!</div>' : r.ok ? `<div class="note-warn">Accent: <b>${esc(ans)}</b></div>` : `<div class="note-bad">${esc(ans)}</div>`}${alt}
          <div class="sentence" style="margin-top:12px">${esc(full).replace(esc(ans), `<mark>${esc(ans)}</mark>`)}</div>
          <div class="en small">${esc(d.en)}</div><div class="tip" style="margin-top:12px;text-align:left">${esc(d.why)}</div>
          <button class="btn primary block" style="margin-top:14px" data-act="drill-next">Continue <span class="kbd">Enter</span></button></div>`;
      }
    }
    el.innerHTML = `<div class="study">
      <div class="meta"><span>${esc(set.name)}</span><span>${DS.i + 1} / ${DS.items.length}</span></div>
      <div class="progress" style="margin-bottom:14px"><div style="width:${DS.i / DS.items.length * 100}%"></div></div>
      <div class="qcard"><div class="row between"><span class="prompt-label" style="margin:0">${DS.phase === 'choose' ? 'Which one?' : 'Type the form'}</span>
        <button class="iconbtn" data-act="say" data-say="${esc(filled)}" title="Listen" aria-label="Listen" ${DS.phase === 'done' ? '' : 'hidden'}>${ICON.speaker}</button></div>
        <div class="sentence" style="margin-top:8px">${sentence}</div>
        ${DS.phase === 'choose' ? `<div class="en small">${esc(d.en)}</div>` : ''}
        ${step}</div>
      <div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="drill-end">End</button></div></div>`;
    const input = el.querySelector('#ans'); if (input && DS.phase === 'type') setTimeout(() => input.focus(), 20);
  };
  function drillSummary(el) {
    const acc = Math.round(DS.ok / Math.max(1, DS.done) * 100);
    el.innerHTML = `<div class="study"><div class="card" style="text-align:center"><h1>Feito!</h1>
      <p class="muted">${DS.ok}/${DS.done} fully right (${acc}%). Choice correct: ${DS.choiceOk}/${DS.done}.</p>
      <div class="row" style="justify-content:center"><button class="btn primary" data-act="drill-start">Again</button><a class="btn" href="#/grammar">Grammar notes</a><a class="btn ghost" href="#/today">Today</a></div></div></div>`;
    P.bump('drillSessions'); Store.change({ silent: true }); DS = null;
  }
  act['drill-set'] = (b) => { const st = S().settings; const n = toggle(st.drillSets, b.dataset.k); if (n.length) st.drillSets = n; else b.checked = true; Store.change(); };
  act['drill-start'] = () => { DS = { items: drillPick(S().settings.drillLen), i: 0, phase: 'choose', ok: 0, done: 0, choiceOk: 0 }; P.render(); };
  P.startDrill = (setKey) => { S().settings.drillSets = [setKey]; Store.change({ silent: true }); DS = { items: drillPick(S().settings.drillLen), i: 0, phase: 'choose', ok: 0, done: 0, choiceOk: 0 }; location.hash = '#/drills'; P.render(); };
  act['drill-opt'] = (b) => { DS.chosen = b.dataset.k; DS.phase = 'type'; P.render(); };
  act['drill-check'] = () => {
    const d = DS.items[DS.i]; const ans = drillAns(d); const v = document.getElementById('ans').value;
    if (!v.trim()) return;
    const r = P.checkAnswer(v, drillAccepted(d)); DS.result = r; DS.typed = v; DS.phase = 'done'; DS.done++;
    const choiceOk = DS.chosen === drillCorrectOpt(d); if (choiceOk) DS.choiceOk++;
    const full = choiceOk && r.ok && !r.accent; if (full) DS.ok++;
    const k = drillKey(d); const x = S().drills[k] || { n: 0, ok: 0 }; x.n++; if (full) x.ok++; x.last = Date.now(); S().drills[k] = x;
    P.bump('drill'); if (full) P.bump('drillOk');
    if (!d.a) { P.recordConj(d.v, d.t, r.ok && !r.accent, 5000); if (!r.ok) P.addFormCard(d.v, d.t, d.p); }
    if (S().settings.autoplay) TTS.speak(d.s.replace(/___( \([^)]+\))?/, ans));
    Store.change({ silent: true }); P.render();
  };
  act['drill-next'] = () => { DS.i++; DS.phase = 'choose'; DS.result = null; DS.chosen = null; P.render(); };
  act['drill-end'] = () => { if (DS && DS.done) DS.i = DS.items.length; else DS = null; P.render(); };
  P.keys.drills = (e) => {
    if (!DS || DS.i >= DS.items.length) return;
    if (DS.phase === 'choose' && ['1', '2'].includes(e.key)) { const set = DRILL_SETS[DS.items[DS.i].set]; act['drill-opt']({ dataset: { k: set.opts[+e.key - 1][0] } }); }
    else if (e.key === 'Enter') { e.preventDefault(); if (DS.phase === 'type') act['drill-check'](); else if (DS.phase === 'done') act['drill-next'](); }
  };

  // ======================= VERB TABLES =======================
  let tableVerb = 'fazer', tableQ = '';
  V.tables = function (el) {
    const list = VERBS.filter(v => !tableQ || v.v.includes(tableQ) || v.en.toLowerCase().includes(tableQ.toLowerCase()));
    const vb = P.VERB[tableVerb];
    el.innerHTML = `<div class="hero"><div><h1>Verb tables</h1><div class="muted">All ${VERBS.length} verbs, every tense. Tap a form to hear it.</div></div><a class="btn" href="#/gym">Back to sprints</a></div>
      <div class="card"><input type="text" id="tq" placeholder="Search verbs (pt or en)…" value="${esc(tableQ)}">
        <div class="chips" style="margin-top:10px;max-height:140px;overflow:auto">${list.map(v => `<button class="chip ${v.v === tableVerb ? 'on' : ''}" data-act="tbl-verb" data-k="${esc(v.v)}">${esc(v.v)}</button>`).join('')}</div></div>
      <div class="card"><div class="row between"><div><h2 style="margin:0">${esc(tableVerb)}</h2><div class="muted small">${esc(vb.def.en)} · particípio: <b>${esc(vb.f.part)}</b></div></div>
        <button class="btn sm" data-act="gym-focus" data-k="${esc(tableVerb)}">Drill this verb</button></div>
        <div class="tablewrap" style="margin-top:12px"><table><tr><th></th>${[0, 1, 2, 3, 4].map(p => `<th>${['eu', 'tu', 'ele/você', 'nós', 'eles/vocês'][p]}</th>`).join('')}</tr>
        ${Conj.TENSES.map(t => `<tr><td><b>${esc(t.pt)}</b><div class="tiny">${esc(t.lvl)}</div></td>${[0, 1, 2, 3, 4].map(p => { const x = vb.f[t.k][p]; return `<td>${x ? `<a href="#" data-act="say" data-say="${esc(x)}">${esc(x)}</a>` : '<span class="tiny">–</span>'}</td>`; }).join('')}</tr>`).join('')}</table></div>
        <p class="tiny" style="margin-top:8px">Imperativo shows tu (affirmative), você and vocês. Negative commands use the conjuntivo: não fales, não comas.</p></div>`;
    const tq = el.querySelector('#tq');
    tq.addEventListener('input', () => { tableQ = tq.value.trim(); const pos = tq.selectionStart; P.render(); const n = document.getElementById('tq'); n.focus(); n.setSelectionRange(pos, pos); });
  };
  act['tbl-verb'] = (b) => { tableVerb = b.dataset.k; P.render(); };
})(Pois);
