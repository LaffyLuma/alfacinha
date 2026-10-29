/* Sessão: one button, no decisions. Warm-up (rapid-fire verbs, beat your best) → due reviews → new phrases and
   words → a speaking drill → a boss fight on a recurring slip → summary with the N2 road trip.
   Recall speed is the point: every item has a gently shrinking time window; "Got it" after the window counts as
   Slow, so it comes back sooner. Combos for answers in a row inside the window. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views, act = P.actions;
  const now = () => Date.now();
  const keyOk = e => !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const who = (t, p) => P.personLabel(t, p).split(' / ')[0];
  const VS = typeof VERBSENT !== 'undefined' ? VERBSENT : [];
  // Base time window per kind (ms). It shrinks 6% after a fast "Got it" and grows 10% after Slow / Missed.
  const WIN = { verb: 5000, card: 8000, vsent: 9000, trans: 12000, build: 12000, connect: 12000, line: 10000 };
  const fun = () => { const s = S(); if (!s.fun) s.fun = {}; const f = s.fun; f.win = f.win || {}; f.pb = f.pb || {}; f.bosses = f.bosses || {}; f.km = f.km || 0; return f; };
  const win = k => Math.round(fun().win[k] || WIN[k]);
  const KM = { 3: 0.5, 2: 0.3, 1: 0.1 };

  // ---------- the N2: Chaves → Faro (≈ km, for the game) ----------
  const N2 = [
    [0, 'Chaves', 'Chaves é famosa pelos pastéis de Chaves e pelas termas.'],
    [70, 'Vila Real', 'Perto de Vila Real fica o Palácio de Mateus, o do rótulo do vinho.'],
    [95, 'Peso da Régua', 'Na Régua começa o Douro vinhateiro, a terra do vinho do Porto.'],
    [105, 'Lamego', 'O santuário de Lamego tem uma escadaria com centenas de degraus.'],
    [150, 'Castro Daire', 'Castro Daire fica entre a serra de Montemuro e o rio Paiva.'],
    [190, 'Viseu', 'Viseu é conhecida como a cidade-jardim.'],
    [235, 'Santa Comba Dão', 'Santa Comba Dão fica junto ao rio Dão, que dá nome a uma região de vinho.'],
    [270, 'Penacova', 'Penacova tem miradouros sobre o Mondego e é famosa pelos palitos.'],
    [300, 'Góis', 'Em Góis, no verão, há um grande encontro de motas.'],
    [335, 'Pedrógão Grande', 'Perto de Pedrógão Grande fica a barragem do Cabril, no rio Zêzere.'],
    [360, 'Sertã', 'A Sertã é conhecida pelo maranho, um prato tradicional da Beira Baixa.'],
    [410, 'Abrantes', 'Abrantes fica num monte sobre o Tejo, com um castelo lá em cima.'],
    [455, 'Ponte de Sor', 'Em Ponte de Sor começa a planície do Alentejo, com montados de sobro.'],
    [495, 'Mora', 'Em Mora há um fluviário, um aquário de peixes de rio.'],
    [530, 'Montemor-o-Novo', 'Montemor-o-Novo tem um castelo e é a terra de São João de Deus.'],
    [600, 'Ferreira do Alentejo', 'À volta de Ferreira do Alentejo há olivais a perder de vista.'],
    [640, 'Castro Verde', 'Castro Verde fica nos campos brancos, uma planície cheia de aves.'],
    [665, 'Almodôvar', 'Depois de Almodôvar, a estrada sobe para a serra do Caldeirão.'],
    [720, 'São Brás de Alportel', 'São Brás de Alportel é uma vila algarvia com muita cortiça.'],
    [738, 'Faro', 'Faro: o fim da N2, 738 quilómetros desde Chaves. Parabéns!'],
  ];
  const lap = km => Math.floor(km / 738);
  const pos = km => km % 738;
  const townAt = km => N2.filter(t => t[0] <= pos(km)).pop();
  const nextTown = km => N2.find(t => t[0] > pos(km)) || N2[0];
  P.n2HTML = function (km) {
    const p = pos(km), t = townAt(km), nx = nextTown(km);
    return `<div class="n2"><div class="row between small"><b>N2 · Chaves → Faro</b><span>${p.toFixed(1)} km${lap(km) ? ` · lap ${lap(km) + 1}` : ''}</span></div>
      <div class="n2-road"><div class="n2-fill" style="width:${(p / 738 * 100).toFixed(1)}%"></div>${N2.map(x => `<span class="n2-dot ${x[0] <= p ? 'on' : ''}" style="left:${(x[0] / 738 * 100).toFixed(1)}%" title="${esc(x[1])}"></span>`).join('')}</div>
      <div class="small" style="margin-top:6px">Now in <b>${esc(t[1])}</b>. ${nx[0] > p ? `Next: ${esc(nx[1])} in ${(nx[0] - p).toFixed(1)} km.` : ''}</div>
      <div class="small muted">${esc(t[2])}</div></div>`;
  };

  // ---------- item makers: one shape for everything ----------
  // { kind, label, front, answer, say, cue, help, grade(g, ms) }
  function verbItem(v, t, p, extra) {
    const vb = P.VERB[v]; const irr = P.isIrr(v, t, p); const cue = P.CUE[t];
    return Object.assign({ kind: 'verb', key: `f|${v}|${t}|${p}`,
      label: `${esc(Conj.label(t))} <span class="tiny term">${esc(Conj.TENSE[t].pt)}</span>`,
      front: `<div class="verbline">${cue ? `<span class="muted">${esc(cue)}</span> ` : ''}${esc(P.personLabel(t, p))}<b>${esc(v)}</b></div><div class="small muted">${esc(vb.def.en)}${irr ? ' · <span class="irr-flag">★ irregular</span>' : ''}</div>`,
      answer: `<span class="big-form">${cue ? `<span class="muted">${esc(cue)}</span> ` : ''}${t === 'imp' ? '' : esc(who(t, p)) + ' '}${P.vformHTML(v, t, p)}</span>`,
      say: P.vsay(v, t, p, true), cue: [cue, who(t, p), v].filter(Boolean).join(', '),
      grade(g, ms) { P.recordConj(v, t, g > 1, g === 3 ? ms : Math.max(ms, 6500)); if (g === 1) P.addFormCard(v, t, p); P.bump('vsay'); } }, extra || {});
  }
  function pickVerb(tenses) {
    for (let i = 0; i < 20; i++) { const g = P.gymPick(); if (g && (!tenses || tenses.includes(g.t))) return g; }
    return P.gymPick() || { v: 'fazer', t: 'pps', p: 0 };
  }
  function cardItem(id, isNew) {
    const pr = P.parseId(id);
    if (pr.kind === 'f') { const [v, t, p] = pr.ref.split('|'); const it = verbItem(v, t, +p); const g0 = it.grade; return Object.assign(it, { kind: 'card', grade(g, ms) { g0(g, ms); P.gradeCard(id, g); } }); }
    const c = P.view(id); if (!c) return null;
    const self = c.type === 'self';
    return { kind: 'card', key: id, label: (isNew ? '<span class="badge new">NOVO</span> ' : '') + esc(self ? 'What does it mean? Say it' : 'Say it in Portuguese'),
      front: c.front, answer: c.back, say: c.say, cue: self ? c.say : '', help: c.hint && !self ? '' : '',
      grade(g) { P.gradeCard(id, g); } };
  }
  function vsentItem(x) {
    const blank = esc(x.s).replace(/\{[^}]+\}/, `<span class="blank">&nbsp;</span> <span class="muted small">(${esc(x.v)})</span>`);
    const full = x.s.replace(/[{}]/g, ''); const form = (x.s.match(/\{([^}]+)\}/) || [])[1];
    return { kind: 'vsent', key: 'vs|' + x.id, label: `${esc(Conj.label(x.t))} · say the whole sentence`,
      front: `<div class="en" style="margin-bottom:8px">${esc(x.en)}</div><div class="sentence">${blank}</div>`,
      answer: P.markHTML(full, [form]), say: full, cue: '',
      grade(g, ms) { P.recordConj(x.v, x.t, g > 1, g === 3 ? Math.min(ms, 6000) : 7000); if (g === 1) P.addFormCard(x.v, x.t, x.p); P.bump('vsay'); } };
  }
  function transItem(id, idx) {
    const it = TRANSFORM.find(x => x.id === id); const x = it.tr[idx];
    return { kind: 'trans', key: 't|' + id + '|' + idx, label: esc(x.ask),
      front: `<div class="sentence">${esc(it.base)}</div><div class="en small">${esc(it.en)}</div>`,
      answer: P.markHTML(x.a[0], x.mark), say: x.a[0], cue: it.base, help: esc(x.why),
      grade(g) { const k = id + '|' + idx; const st = S().trans[k] || { n: 0, ok: 0, slow: 0, ema: 0.5, last: 0 }; st.n++; if (g === 3) st.ok++; if (g === 2) st.slow++; st.ema = st.ema * 0.7 + P.gradeScore(g) * 0.3; st.last = now(); S().trans[k] = st; P.bump('trans'); if (g === 1 && x.v && x.t && x.p != null) P.addFormCard(x.v, x.t, x.p); } };
  }
  function buildItem(b) {
    return { kind: 'build', key: 'b|' + b.id, label: `Say it in Portuguese · <span class="tiny term">${esc(b.pat)}</span>`,
      front: `<div class="big" style="font-size:1.3rem">${esc(b.en)}</div><div class="chips" style="justify-content:center;margin-top:8px">${b.hints.map(h => `<span class="hintchip">${esc(h)}</span>`).join('')}</div>`,
      answer: P.markHTML(b.a[0], b.mark), say: b.a[0], cue: '', help: esc(b.why),
      grade(g) { const x = S().build[b.id] || { n: 0, ok: 0, ema: 0.5, last: 0 }; x.n++; if (g === 3) x.ok++; x.ema = x.ema * 0.7 + P.gradeScore(g) * 0.3; x.last = now(); S().build[b.id] = x; P.bump('build'); } };
  }
  function connectItem(x) {
    return { kind: 'connect', key: 'cn|' + x.id, label: P.aulaLabel(x), front: P.aulaFront(x), answer: P.markHTML(x.a[0], x.mark), say: x.a[0], cue: '', help: esc(x.why),
      grade(g) { P.aulaGrade(x.id, g); if (g === 1 && x.v && x.t && x.p != null) P.addFormCard(x.v, x.t, x.p); } };
  }
  const leastSeen = (arr, statOf, n) => P.shuffle(arr).sort((a, b) => ((statOf(a) || {}).ema ?? -1) - ((statOf(b) || {}).ema ?? -1)).slice(0, n);

  // ---------- bosses: recurring slips ----------
  // A boss has 5 HP. A fast "Got it" hits it; a miss heals it. Beat it and it stays beaten.
  function bossPick() {
    const B = fun().bosses; const out = [];
    const slips = BUILD.filter(b => b.pat === 'slips');
    if (slips.length) out.push({ key: 'slips', name: 'O Boss dos Deslizes', sub: 'queres ir · vou ao · esqueci-me · em/no · sim', items: () => buildItem(rnd(slips)) });
    Object.entries(S().conj).filter(([, x]) => x.n >= 3).sort((a, b) => a[1].ema - b[1].ema).slice(0, 6).forEach(([k]) => {
      const [v, t] = k.split('|'); if (!P.VERB[v] || !P.VERB[v].f[t]) return;
      const ps = [0, 1, 2, 3, 4].filter(p => P.VERB[v].f[t][p]);
      out.push({ key: 'conj|' + k, name: `O Boss: ${v}`, sub: `${Conj.label(t)} · all persons`, items: () => verbItem(v, t, rnd(ps)) });
    });
    const open = out.filter(b => !(B[b.key] && B[b.key].beaten));
    return open[0] || out[0] || null;
  }

  // ---------- building a session ----------
  const STAGE_NAMES = { warm: 'Warm-up', rev: 'Reviews', new: 'New', speak: 'Speak', boss: 'Boss' };
  function buildSession(len) {
    const long = len === 'long';
    const focus = P.planFocusTenses ? P.planFocusTenses() : null;
    const stages = [];
    stages.push({ k: 'warm', rapid: true, secs: long ? 60 : 45, items: [] });
    const due = P.dueIds().slice(0, long ? 20 : 8).map(id => cardItem(id)).filter(Boolean);
    if (due.length) stages.push({ k: 'rev', items: due });
    // New: half everyday phrases (CHUNKS added since the start), half from the deck
    const nNew = long ? 6 : 3; const s = S();
    const newIds = P.newIds(Math.max(0, Math.min(P.newLeft(), nNew * 2)));
    const phrases = (typeof CHUNKS2 !== 'undefined' ? CHUNKS2 : []).map(e => `c:${e[0]}:rec`).filter(id => !s.cards[id]).slice(0, Math.ceil(nNew / 2));
    const fresh = phrases.concat(newIds.filter(id => !phrases.includes(id))).slice(0, Math.min(nNew, P.newLeft()));
    if (fresh.length) stages.push({ k: 'new', items: fresh.map(id => cardItem(id, true)).filter(Boolean) });
    // Speak: interleave verb sentences, transformations and sentence building, steered by today's focus
    const n = long ? 12 : 6; const sp = [];
    const vs = VS.filter(x => !focus || focus.includes(x.t)); const vsPool = vs.length >= 4 ? vs : VS;
    leastSeen(vsPool, x => S().conj[x.v + '|' + x.t], Math.ceil(n / 3)).forEach(x => sp.push(vsentItem(x)));
    for (let i = 0; i < Math.ceil(n / 3); i++) { const p = P.trPick ? P.trPick() : null; if (p) sp.push(transItem(p.id, p.idx)); }
    leastSeen(BUILD, b => S().build[b.id], Math.floor(n / 3)).forEach(b => sp.push(buildItem(b)));
    if (P.aulaFront && typeof CONNECT !== 'undefined') leastSeen(CONNECT, x => S().aula[x.id], Math.max(1, Math.floor(n / 4))).forEach(x => sp.push(connectItem(x)));
    stages.push({ k: 'speak', items: P.shuffle(sp) });
    const boss = bossPick();
    if (boss) stages.push({ k: 'boss', boss, hp: 5, max: long ? 14 : 10, items: [] });
    return { len, stages, si: 0, i: 0, phase: 'cue', t0: 0, start: now(), combo: 0, bestCombo: 0, n: 0, ok: 0, slow: 0, km: 0, rapid: 0, rapidEnd: 0, missed: [], prev: { rapid: fun().pb.rapid || 0, combo: fun().pb.combo || 0 } };
  }

  // ---------- running ----------
  let SS = null;
  const stage = () => SS.stages[SS.si];
  function current() {
    const st = stage(); if (!st) return null;
    if (st.rapid || st.boss) { if (!st.items[SS.i]) st.items[SS.i] = st.rapid ? verbItem(...Object.values(pickVerb())) : st.boss.items(); }
    return st.items[SS.i];
  }
  function nextStage() {
    SS.si++; SS.i = 0;
    const st = stage(); if (!st) return;
    if (st.rapid) st.started = 0;
    P.toast(STAGE_NAMES[st.k] + (st.boss ? `: ${st.boss.name}` : ''), 1400);
  }
  function advance() {
    const st = stage(); SS.i++; SS.phase = 'cue'; SS.spoken = false; SS.t0 = 0;
    if (st.rapid && now() >= SS.rapidEnd) return finishRapid();
    if (st.boss && (st.hp <= 0 || SS.i >= st.max)) return finishBoss();
    if (!st.rapid && !st.boss && SS.i >= st.items.length) nextStage();
    if (!stage()) return finish();
    P.render();
  }
  function finishRapid() {
    const f = fun(); if (SS.rapid > (f.pb.rapid || 0)) { f.pb.rapid = SS.rapid; SS.rapidPB = true; }
    nextStage(); if (!stage()) return finish(); P.render();
  }
  function finishBoss() {
    const st = stage(); const B = fun().bosses; const b = B[st.boss.key] || { tries: 0 };
    b.tries++; if (st.hp <= 0) { b.beaten = now(); SS.bossWon = st.boss.name; } else SS.bossLost = st.boss.name;
    B[st.boss.key] = b; nextStage(); finish();
  }
  function finish() {
    const f = fun(); f.km = (f.km || 0) + SS.km;
    if (SS.bestCombo > (f.pb.combo || 0)) { f.pb.combo = SS.bestCombo; SS.comboPB = true; }
    P.bump('session'); P.bump('sessionMin', Math.max(1, Math.round((now() - SS.start) / 60000)));
    SS.done = true; Store.change({ silent: true }); P.render();
    if (P.stepDone) P.stepDone('session');
  }
  async function speakCue(it) {
    const t = TTS.token();
    if (it.cue && S().settings.autoplay) { await TTS.sayOrRead(it.cue); if (t !== TTS.token()) return; }
    if (SS && current() === it && SS.phase === 'cue') { SS.t0 = performance.now(); P.render(); }
  }
  P.startSession = len => { TTS.stop(); SS = buildSession(len || 'short'); if (P.route() !== 'sessao') history.pushState(null, '', '#/sessao'); P.render(); };
  V.sessao = function (el) {
    if (!SS) return landing(el);
    if (SS.done) return summary(el);
    const st = stage(); const it = current();
    if (st.rapid && !SS.rapidEnd) SS.rapidEnd = now() + st.secs * 1000;
    const revealed = SS.phase !== 'cue';
    const w = st.rapid ? 0 : win(it.kind);
    const elapsed = SS.t0 ? performance.now() - SS.t0 : 0;
    const strip = `<div class="ss-strip">${SS.stages.map((x, i) => `<span class="${i < SS.si ? 'done' : i === SS.si ? 'on' : ''}">${STAGE_NAMES[x.k]}</span>`).join('')}</div>`;
    const combo = SS.combo >= 2 ? `<span class="combo">×${SS.combo}</span>` : '';
    const top = st.rapid ? `<div class="ss-rapid"><span>Beat the clock: <b id="ss-clock">${Math.max(0, Math.ceil((SS.rapidEnd - now()) / 1000))}</b>s</span><span>Score <b>${SS.rapid}</b>${SS.prev.rapid ? ` · best ${SS.prev.rapid}` : ''}</span></div>`
      : st.boss ? `<div class="ss-boss"><div><b>${esc(st.boss.name)}</b><div class="tiny">${esc(st.boss.sub)}</div></div><span class="hp">${'♥'.repeat(Math.max(0, st.hp))}<span class="lost">${'♥'.repeat(5 - Math.max(0, st.hp))}</span></span></div>` : '';
    const bar = !revealed && w && SS.t0 ? `<div class="tbar"><div style="animation-duration:${w}ms;animation-delay:-${Math.round(elapsed)}ms"></div></div>` : '';
    const late = revealed && w && SS.ms > w ? `<div class="small" style="color:var(--warn);margin-top:6px">Past the ${(w / 1000).toFixed(1)}s window: "Got it" counts as Slow.</div>` : '';
    const grades = st.rapid ? `<div class="grades two"><button class="g1" data-act="ss-grade" data-g="1">Missed<small>1</small></button><button class="g3" data-act="ss-grade" data-g="3">Got it<small>3</small></button></div>` : null;
    el.innerHTML = strip + P.sayCard({
      meta: [`${STAGE_NAMES[st.k]} ${combo}`, st.rapid || st.boss ? '' : `${SS.i + 1} / ${st.items.length}`],
      progress: (SS.si + (st.items.length && !st.rapid && !st.boss ? SS.i / st.items.length : 0)) / SS.stages.length,
      label: it.label, front: top + bar + it.front, answer: it.answer + late, say: it.say, help: it.help || '', revealed,
      cue: it.cue, cueBig: !!it.cue && !S().settings.autoplay, after: revealed ? grades : null,
      acts: { reveal: 'ss-reveal', grade: 'ss-grade', end: 'ss-end', replay: 'ss-cue' },
    });
    if (!SS.spoken) { SS.spoken = true; SS.t0 = 0; speakCue(it); }
    if (st.rapid) { clearInterval(SS.tick); SS.tick = setInterval(() => { const c = document.getElementById('ss-clock'); if (!SS || !c) return clearInterval(SS && SS.tick); const left = Math.max(0, Math.ceil((SS.rapidEnd - now()) / 1000)); c.textContent = left; if (left <= 0 && SS.phase === 'cue') { clearInterval(SS.tick); finishRapid(); } }, 250); }
  };
  function landing(el) {
    const f = fun();
    el.innerHTML = `<div class="hero"><div><h1>Sessão</h1><div class="muted">One button. The app runs the whole thing: warm-up, reviews, new phrases, speaking, a boss fight.</div></div></div>
      <div class="grid two"><button class="btn primary say-main ss-start" data-act="ss-start" data-k="short">Short · ~10 min</button><button class="btn say-main ss-start" data-act="ss-start" data-k="long">Long · ~25 min</button></div>
      <div class="card" style="margin-top:14px">${P.n2HTML(f.km)}</div>
      <div class="grid three"><div class="stat"><div class="n">${f.pb.rapid || 0}</div><div class="l">best warm-up score</div></div><div class="stat"><div class="n">×${f.pb.combo || 0}</div><div class="l">best combo</div></div><div class="stat"><div class="n">${Object.values(f.bosses).filter(b => b.beaten).length}</div><div class="l">bosses beaten</div></div></div>`;
  }
  function summary(el) {
    const acc = Math.round(SS.ok / Math.max(1, SS.n) * 100); const f = fun();
    const before = f.km - SS.km; const passed = N2.filter(t => t[0] > pos(before) && t[0] <= pos(f.km));
    el.innerHTML = `<div class="study"><div class="card"><h1 style="text-align:center">Sessão feita!</h1>
      <div class="grid three" style="margin:14px 0"><div class="stat"><div class="n">${SS.n}</div><div class="l">answers out loud</div></div><div class="stat"><div class="n">${acc}%</div><div class="l">got it in time</div></div><div class="stat"><div class="n">×${SS.bestCombo}</div><div class="l">best combo${SS.comboPB ? ' · new record!' : ''}</div></div></div>
      <ul class="summary-list">
        <li><span>Warm-up score</span><b>${SS.rapid}${SS.rapidPB ? ' · new record!' : SS.prev.rapid ? ` (best ${SS.prev.rapid})` : ''}</b></li>
        ${SS.bossWon ? `<li><span>Boss</span><b>Beaten: ${esc(SS.bossWon)} ⚔️</b></li>` : SS.bossLost ? `<li><span>Boss</span><b>${esc(SS.bossLost)} got away. Next time.</b></li>` : ''}
        <li><span>N2 road trip</span><b>+${SS.km.toFixed(1)} km</b></li></ul>
      ${passed.length ? `<div class="tip" style="margin-top:12px">You reached <b>${passed.map(t => esc(t[1])).join(', ')}</b>. ${esc(passed[passed.length - 1][2])}</div>` : ''}
      <div style="margin-top:14px">${P.n2HTML(f.km)}</div>
      ${SS.missed.length ? `<h3 style="margin-top:14px">Missed (they'll come back)</h3><ul class="summary-list">${SS.missed.slice(0, 8).map(m => `<li><span>${esc(m.say)}</span><button class="iconbtn" data-act="say" data-say="${esc(m.say)}" aria-label="Listen">${ICON.speaker}</button></li>`).join('')}</ul>` : ''}
      <div class="row" style="margin-top:16px"><button class="btn primary" data-act="ss-start" data-k="${SS.len}">Another</button><a class="btn ghost" href="#/today">Today</a></div></div></div>`;
  }
  act['ss-start'] = b => P.startSession(b.dataset.k);
  act['ss-cue'] = () => { const it = SS && current(); if (it && it.cue) { TTS.stop(); TTS.say(it.cue); } };
  act['ss-reveal'] = () => {
    if (!SS || SS.done || SS.phase !== 'cue') return;
    SS.ms = SS.t0 ? performance.now() - SS.t0 : 4000; TTS.stop(); SS.phase = 'reveal'; P.render();
    if (S().settings.autoplay) TTS.say(current().say);
  };
  act['ss-grade'] = b => {
    if (!SS || SS.phase !== 'reveal') return;
    const st = stage(); const it = current(); let g = +b.dataset.g;
    const w = st.rapid ? Infinity : win(it.kind);
    if (g === 3 && SS.ms > w) g = 2; // slow recall comes back sooner
    try { it.grade(g, SS.ms); } catch (e) { console.warn(e); }
    SS.n++; if (g === 3) SS.ok++; if (g === 2) SS.slow++;
    SS.km += KM[g];
    if (g === 3) { SS.combo++; SS.bestCombo = Math.max(SS.bestCombo, SS.combo); } else SS.combo = 0;
    if (g === 1 && !SS.missed.includes(it)) SS.missed.push(it);
    if (!st.rapid) { const f = fun(); const cur = win(it.kind); f.win[it.kind] = Math.max(WIN[it.kind] * 0.45, Math.min(WIN[it.kind] * 1.4, g === 3 ? cur * 0.94 : cur * 1.1)); }
    if (st.rapid && g === 3) SS.rapid++;
    if (st.boss) st.hp = g === 3 ? st.hp - 1 : g === 1 ? Math.min(5, st.hp + 1) : st.hp;
    if (g === 1 && !st.rapid && !st.boss && !it.retry) st.items.splice(Math.min(st.items.length, SS.i + 4), 0, Object.assign(Object.create(Object.getPrototypeOf(it)), it, { retry: true }));
    TTS.stop(); Store.change({ silent: true }); advance();
  };
  act['ss-end'] = () => { TTS.stop(); if (SS && SS.n && !SS.done) finish(); else { SS = null; P.render(); } };
  P.keys.sessao = e => {
    if (!SS || SS.done || !keyOk(e)) return;
    const k = e.key;
    if (SS.phase === 'cue' && (k === ' ' || k === 'Enter')) { e.preventDefault(); act['ss-reveal'](); }
    else if (SS.phase === 'reveal' && ['1', '2', '3'].includes(k)) { if (stage().rapid && k === '2') return; e.preventDefault(); act['ss-grade']({ dataset: { g: k } }); }
    else if (k === 'r' || k === 'R') { e.preventDefault(); act['ss-cue'](); }
  };
  P.leave.sessao = () => { if (SS) { clearInterval(SS.tick); SS.spoken = SS.phase !== 'cue'; if (SS.done) SS = null; } };
})(Pois);
