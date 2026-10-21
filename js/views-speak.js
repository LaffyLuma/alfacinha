/* Speaking views: Falar hub, Transformations, Minus-one dialogues, Radio mode. No typing anywhere:
   prompt → say it out loud → reveal → hear it → self-grade. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views, act = P.actions;
  const TR = {}; TRANSFORM.forEach(it => { TR[it.id] = it; });
  const DL = {}; DIALOGUES.forEach(d => { DL[d.id] = d; });
  const now = () => Date.now();
  // Pattern label first, the Portuguese term small and muted
  const patHTML = k => `${esc(Conj.label(k))} <span class="tiny term">${esc(Conj.TENSE[k].pt)}</span>`;
  // How a pattern label sounds when read out by an English voice (radio)
  const SPOKEN = { pres: 'now', pps: 'did', pimp: 'was doing, or used to', ppc: 'have been doing lately', imp: 'command', fut: 'will', cond: 'would',
    cpres: 'that I', cimp: 'if I were', cfut: 'when I will have', infp: 'for me to', hav: 'I\'ll make sure I' };
  const keyOk = e => !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
  const firstPerson = (t, p) => P.personLabel(t, p).split(' / ')[0];
  const formSay = (v, t, p) => (t === 'imp' ? '' : firstPerson(t, p) + ' ') + P.VERB[v].f[t][p];
  const ago = t => { const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / P.DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };

  // ======================= PLANNER HOOK =======================
  // Weakest of the B1 tenses by average mastery; tenses never practised count as weak-ish (0.3).
  const B1_TENSES = ['pps', 'pimp', 'ppc', 'cond', 'cpres', 'cimp', 'infp', 'hav'];
  P.focusTense = function () {
    const keys = Object.keys(S().conj);
    if (!keys.length) return 'pps';
    let best = 'pps', bm = 2;
    B1_TENSES.forEach(t => {
      const ms = keys.filter(k => k.endsWith('|' + t)).map(k => P.mastery(...k.split('|'))).filter(m => m != null);
      const m = ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : 0.3;
      if (m < bm) { bm = m; best = t; }
    });
    return best;
  };

  // ======================= HUB =======================
  V.speak = function (el) {
    const items = [['transform', 'Transformar', 'Hear a sentence, then say it changed'], ['dialogues', 'Diálogos', 'Minus one: play your part out loud'],
      ['radio', 'Rádio', 'Hands-free drills for walks and rides'], ['write', 'Escrever', 'Daily speaking & writing prompt']];
    el.innerHTML = `<div class="hero"><div><h1>Falar</h1><div class="muted">Say it out loud. Nothing to type.</div></div></div>
      <div class="card menu">${items.map(([k, t, d]) => `<a href="#/${k}">${ICON[{ transform: 'transform', dialogues: 'dialog', radio: 'radio', write: 'write' }[k]]}<span>${t}<small>${d}</small></span></a>`).join('')}</div>`;
  };

  // ======================= TRANSFORMATIONS =======================
  const FOCUS = [
    ['all', 'All', () => true],
    ['past', 'did ↔ used to', (it, x) => x.kind === 'tense' && ['pps', 'pimp'].includes(x.t)],
    ['would', 'would / if', (it, x) => x.kind === 'polite' || (x.kind === 'tense' && ['cond', 'cimp'].includes(x.t))],
    ['pron', 'pronouns', (it, x) => x.kind === 'pronoun'],
    ['q', 'questions', (it, x) => x.kind === 'question'],
    ['slips', 'my slips', it => it.topic === 'slips'],
  ];
  let TS = null, trFocus = 'all';
  const trKey = (id, idx) => id + '|' + idx;
  function trPairs(f) {
    const fn = (FOCUS.find(x => x[0] === f) || FOCUS[0])[2]; const out = [];
    TRANSFORM.forEach(it => it.tr.forEach((x, idx) => { if (fn(it, x)) out.push({ id: it.id, idx }); }));
    return out;
  }
  function trWeight(p, focusT) {
    const x = S().trans[trKey(p.id, p.idx)];
    let w = !x ? 1.3 : 0.2 + (1 - x.ema) * 2 + Math.min(1, (now() - (x.last || 0)) / (7 * P.DAY)) * 0.5;
    if (focusT && TR[p.id].tr[p.idx].t === focusT) w *= 1.4;
    return w;
  }
  P.trPick = function (avoid) { // one weighted transformation (radio uses this too)
    const f = P.focusTense();
    const pool = trPairs('all').filter(p => !avoid || !avoid.has(trKey(p.id, p.idx)));
    return pool.length ? P.pickWeighted(pool, p => trWeight(p, f)) : null;
  };
  // A flagged descriptor still points at existing content?
  function flagOk(d) {
    if (d.kind === 'trans') return !!(TR[d.id] && TR[d.id].tr[d.idx]);
    if (d.kind === 'dialog') return !!(DL[d.id] && DL[d.id].lines[d.i]);
    if (d.kind === 'vocab') { const { kind, ref } = P.parseId(d.id + ':x'); return kind === 'v' ? !!P.VOC[ref] : kind === 'c' ? !!P.CHK[ref] : false; }
    if (d.kind === 'verb') return !!(P.VERB[d.v] && P.VERB[d.v].f[d.t] && P.VERB[d.v].f[d.t][d.p]);
    return false;
  }
  function arrange(arr) {
    arr = P.shuffle(arr);
    // no two transformations of the same sentence back to back
    for (let k = 1; k < arr.length; k++) {
      if (arr[k].id !== arr[k - 1].id) continue;
      const m = arr.findIndex((s, j) => j > k && s.id !== arr[k - 1].id && (!arr[k + 1] || s.id !== arr[k + 1].id) && (!arr[j - 1] || j - 1 === k || arr[j - 1].id !== arr[k].id) && (!arr[j + 1] || arr[j + 1].id !== arr[k].id));
      if (m > 0) [arr[k], arr[m]] = [arr[m], arr[k]];
    }
    // two from the same sentence play in their tr order
    const pos = {}; arr.forEach((s, k) => (pos[s.id] = pos[s.id] || []).push(k));
    Object.values(pos).forEach(ks => { const idxs = ks.map(k => arr[k].idx).sort((a, b) => a - b); ks.forEach((k, n) => { arr[k] = Object.assign({}, arr[k], { idx: idxs[n] }); }); });
    return arr;
  }
  function buildTrans(n, f) {
    const flagged = P.takeFlagged(['trans', 'dialog', 'vocab', 'verb'], n).filter(flagOk)
      .map(d => d.kind === 'trans' ? { id: d.id, idx: d.idx, flagged: true } : { flag: d, flagged: true });
    const focusT = P.focusTense(); const seen = new Set(flagged.filter(s => s.id).map(s => trKey(s.id, s.idx)));
    let pool = trPairs(f).filter(p => !seen.has(trKey(p.id, p.idx)));
    const picked = [];
    while (flagged.length + picked.length < n && pool.length) { const p = P.pickWeighted(pool, q => trWeight(q, focusT)); picked.push(p); pool = pool.filter(q => q !== p); }
    return flagged.concat(arrange(picked));
  }
  // What one step shows and says. Only the cue is rendered before reveal.
  function stepView(st) {
    if (st.id) {
      const it = TR[st.id], x = it.tr[st.idx];
      const term = x.kind === 'tense' ? ` <span class="tiny term">${esc(Conj.TENSE[x.t].pt)}</span>` : '';
      return { cue: it.base, listen: true, ask: esc(x.ask) + term,
        front: `<div class="sentence">${esc(it.base)}</div><div class="en small">${esc(it.en)}</div>`,
        hint: x.hint ? esc(x.hint) : '', answer: P.markHTML(x.a[0], x.mark) + (x.a.length > 1 ? `<div class="small muted" style="margin-top:6px">also: ${x.a.slice(1).map(esc).join(' · ')}</div>` : ''),
        say: x.a[0], help: esc(x.why), title: esc(x.ask) };
    }
    const d = st.flag;
    if (d.kind === 'dialog') {
      const dl = DL[d.id], l = dl.lines[d.i];
      return { ask: 'Say it in Portuguese', front: `<div class="big" style="font-size:1.35rem">${esc(l.en)}</div><div class="small muted">${esc(dl.title)} · ${esc(dl.roles[l.r])}</div>`,
        hint: l.hint ? esc(l.hint) : '', answer: P.markHTML(l.pt, l.mark), say: l.pt, help: '', title: esc(l.en) };
    }
    if (d.kind === 'vocab') {
      const { kind, ref } = P.parseId(d.id + ':x'); const e = kind === 'v' ? P.VOC[ref] : P.CHK[ref];
      return { ask: 'Say it in Portuguese', front: `<div class="big" style="font-size:1.35rem">${esc(e[4])}</div>`,
        hint: esc(e[0]), answer: P.clozeMark(e[3]), say: P.clozePlain(e[3]), help: '', title: esc(e[4]) };
    }
    const vb = P.VERB[d.v];
    return { ask: patHTML(d.t), front: `<div class="verbline">${esc(P.personLabel(d.t, d.p))}<b>${esc(d.v)}</b></div><div class="small muted">${esc(vb.def.en)}</div>`,
      hint: '', answer: `<b>${esc(vb.f[d.t][d.p])}</b>`, say: formSay(d.v, d.t, d.p), help: '', title: `${esc(Conj.label(d.t))} · ${esc(P.personLabel(d.t, d.p))} · ${esc(d.v)}` };
  }
  async function playBase(text) {
    const t = TTS.token();
    await TTS.say(text);
    if (t !== TTS.token() || !TS || TS.phase !== 'listen') return;
    TS.phase = 'ask'; P.render();
  }
  V.transform = function (el) {
    const st = S().settings;
    if (!TS) {
      const pool = trPairs(trFocus).length; const waiting = S().radio.flagged.filter(flagOk).length;
      const n = Math.min(st.transLen || 12, pool + waiting);
      const seen = Object.keys(S().trans).length; const total = TRANSFORM.reduce((a, it) => a + it.tr.length, 0);
      el.innerHTML = `<div class="hero"><div><h1>Transformar</h1><div class="muted">Hear a sentence, then say it changed. The changed part is the practice.</div></div></div>
        <div class="card">
          <div class="chips" style="margin-bottom:16px">${FOCUS.map(([k, l]) => `<button class="chip big ${trFocus === k ? 'on' : ''}" data-act="tr-focus" data-k="${k}">${esc(l)}</button>`).join('')}</div>
          <button class="btn primary block say-main" data-act="tr-start" ${n ? '' : 'disabled'}>Start (${n})</button>
          <p class="small muted" style="margin:12px 0 0">Listen, say the changed sentence out loud, then <span class="kbd">Space</span> to reveal and <span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">3</span> to grade yourself.
            Today's focus: <b>${esc(Conj.label(P.focusTense()))}</b>.${waiting ? ` ${waiting} flagged item${waiting > 1 ? 's' : ''} from radio or dialogues come first.` : ''}</p>
          <p class="tiny" style="margin:6px 0 0">${seen} of ${total} transformations practised.</p></div>`;
      return;
    }
    if (TS.i >= TS.steps.length) return trSummary(el);
    const step = TS.steps[TS.i]; const v = stepView(step);
    const revealed = TS.phase === 'reveal';
    const label = TS.phase === 'listen' ? 'Listen…' : v.ask;
    el.innerHTML = P.sayCard({
      meta: [`Transformations · ${TS.ok} ✓${step.flagged ? ' <span class="badge new">FLAGGED</span>' : ''}`, `${TS.i + 1} / ${TS.steps.length}`],
      progress: TS.i / TS.steps.length, label, front: v.front, hint: v.hint, answer: v.answer, say: v.say, help: v.help,
      revealed, hintShown: TS.hint, cue: v.cue, cueBig: !!v.cue && !st.autoplay,
      acts: { reveal: 'tr-reveal', hint: 'tr-hint', grade: 'tr-grade', end: 'tr-end', replay: 'say' },
    });
    if (!TS.spoken) {
      TS.spoken = true;
      if (v.listen && st.autoplay && TS.phase === 'listen') playBase(v.cue);
      else if (TS.phase === 'listen') { TS.phase = 'ask'; P.render(); }
    }
  };
  function trSummary(el) {
    const acc = Math.round(TS.ok / Math.max(1, TS.done) * 100);
    const missed = TS.missed.map(stepView);
    el.innerHTML = `<div class="study"><div class="card">
      <h1 style="text-align:center">Feito!</h1>
      <div class="grid three" style="margin:16px 0"><div class="stat"><div class="n">${acc}%</div><div class="l">got it</div></div><div class="stat"><div class="n">${TS.done}</div><div class="l">said out loud</div></div><div class="stat"><div class="n">${TS.missed.length}</div><div class="l">missed</div></div></div>
      ${missed.length ? `<h3>Missed</h3><ul class="summary-list">${missed.map(m => `<li><span><span class="small muted">${m.title}</span><br>${esc(m.say)}</span><button class="iconbtn" data-act="say" data-say="${esc(m.say)}" aria-label="Listen">${ICON.speaker}</button></li>`).join('')}</ul>` : '<div class="note-good">Nothing missed. Muito bem!</div>'}
      <div class="row" style="margin-top:18px"><button class="btn primary" data-act="tr-again">Again</button><a class="btn" href="#/today">Today</a></div>
    </div></div>`;
    P.bump('transSessions'); Store.change({ silent: true });
    TS = null;
  }
  function trNext() { TS.i++; TS.phase = 'listen'; TS.spoken = false; TS.hint = false; P.render(); }
  act['tr-focus'] = (b) => { trFocus = b.dataset.k; P.render(); };
  act['tr-start'] = () => {
    TS = { steps: buildTrans(S().settings.transLen || 12, trFocus), i: 0, phase: 'listen', spoken: false, hint: false, ok: 0, done: 0, missed: [] };
    Store.change({ silent: true }); P.render();
  };
  act['tr-again'] = act['tr-start'];
  act['tr-reveal'] = () => {
    if (!TS || TS.phase === 'reveal') return;
    TTS.stop(); TS.phase = 'reveal'; P.render();
    if (S().settings.autoplay) TTS.say(stepView(TS.steps[TS.i]).say);
  };
  act['tr-hint'] = () => { if (TS) { TS.hint = true; P.render(); } };
  act['tr-grade'] = (b) => {
    if (!TS || TS.phase !== 'reveal') return;
    const g = +b.dataset.g; const step = TS.steps[TS.i]; const t = now();
    TTS.stop();
    if (step.id) {
      const k = trKey(step.id, step.idx); const x = S().trans[k] || { n: 0, ok: 0, slow: 0, ema: 0.5, last: 0 };
      x.n++; if (g === 3) x.ok++; if (g === 2) x.slow++; x.ema = x.ema * 0.7 + P.gradeScore(g) * 0.3; x.last = t; S().trans[k] = x;
      const tr = TR[step.id].tr[step.idx];
      if (g === 1 && tr.v && tr.t && tr.p != null && P.VERB[tr.v]) P.addFormCard(tr.v, tr.t, tr.p);
    } else if (step.flag.kind === 'verb') {
      const d = step.flag; P.recordConj(d.v, d.t, g === 3, g === 3 ? 2500 : g === 2 ? 5000 : 9000);
      if (g === 1) P.addFormCard(d.v, d.t, d.p);
    }
    P.bump('trans'); TS.done++; if (g === 3) TS.ok++;
    if (g === 1) {
      if (!TS.missed.includes(step) && !TS.missed.some(m => m.id && m.id === step.id && m.idx === step.idx)) TS.missed.push(step);
      if (!step.retry) TS.steps.splice(Math.min(TS.steps.length, TS.i + 4), 0, Object.assign({}, step, { retry: true }));
    }
    Store.change({ silent: true }); trNext();
  };
  act['tr-end'] = () => { TTS.stop(); if (TS && TS.done) TS.i = TS.steps.length; else TS = null; P.render(); };
  P.keys.transform = (e) => {
    if (!TS || TS.i >= TS.steps.length || !keyOk(e)) return;
    const v = stepView(TS.steps[TS.i]);
    if (TS.phase !== 'reveal' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); act['tr-reveal'](); }
    else if (TS.phase === 'reveal' && ['1', '2', '3'].includes(e.key)) { e.preventDefault(); act['tr-grade']({ dataset: { g: e.key } }); }
    else if (e.key === 'r' || e.key === 'R') { const t = v.cue || (TS.phase === 'reveal' ? v.say : ''); if (t) { e.preventDefault(); TTS.speak(t); } }
    else if ((e.key === 'h' || e.key === 'H') && v.hint && TS.phase !== 'reveal') { e.preventDefault(); act['tr-hint'](); }
  };
  P.leave.transform = () => { trFocus = 'all'; if (TS) TS.spoken = TS.phase !== 'listen'; };

  // ======================= DIALOGUES =======================
  const TOPIC = { bike: 'Bike', cafe: 'Café', health: 'Saúde', errands: 'Recados', phone: 'Telefone', friends: 'Amigos', games: 'Jogos', music: 'Música', tech: 'Tech', family: 'Família', canada: 'Canadá', class: 'Aula' };
  let DG = null;
  function roleOpts(r) {
    const [va, vb] = TTS.voices2();
    const same = !va || !vb || va.name === vb.name;
    return r === 'A' ? { voice: va || undefined, pitch: same ? 0.85 : 1 } : { voice: vb || undefined, pitch: 1 };
  }
  const leastPractised = (except) => DIALOGUES.filter(d => d.id !== except).slice().sort((a, b) => {
    const x = S().dialog[a.id] || {}, y = S().dialog[b.id] || {};
    return (x.passes || 0) - (y.passes || 0) || (x.last || 0) - (y.last || 0);
  })[0];
  const mine = () => DG.pass === 3 ? 'A' : 'B';
  const gapFor = l => Math.min(10, (S().settings.radioGap || 4) + 0.4 * l.pt.split(/\s+/).length) * 1000;
  function openDialog(id, pass) {
    TTS.stop();
    DG = { id, pass: pass || (S().dialog[id] ? 2 : 1), i: 0, playing: false, revealed: false, hint: false, done: false, rated: false, en: DG ? DG.en : false, hands: DG ? DG.hands : false };
    P.render(); window.scrollTo(0, 0);
    if (S().settings.autoplay) startPass();
  }
  function startPass() { if (DG.pass === 1) playListen(); else runPass(); }
  async function playListen() {
    const d = DL[DG.id]; if (DG.done) { DG.i = 0; DG.done = false; }
    TTS.stop(); const t = TTS.token(); DG.playing = true; P.render();
    while (DG && DG.i < d.lines.length) {
      const l = d.lines[DG.i]; P.render();
      await TTS.sayOrRead(l.pt, roleOpts(l.r)); if (t !== TTS.token()) return;
      await TTS.pause(500); if (t !== TTS.token()) return;
      DG.i++;
    }
    DG.playing = false; DG.done = true; P.render();
  }
  async function runPass() {
    const d = DL[DG.id]; const me = mine();
    TTS.stop(); const t = TTS.token(); DG.playing = true;
    while (DG && DG.i < d.lines.length) {
      const l = d.lines[DG.i];
      if (l.r === me && !DG.revealed) {
        if (!DG.hands) { DG.playing = false; P.render(); return; } // wait for Reveal
        P.render();
        await TTS.sayOrRead(l.en, { lang: 'en' }); if (t !== TTS.token()) return;
        await TTS.pause(gapFor(l)); if (t !== TTS.token()) return;
        DG.revealed = true;
      }
      P.render();
      await TTS.sayOrRead(l.pt, roleOpts(l.r)); if (t !== TTS.token()) return;
      await TTS.pause(l.r === me ? 800 : 500); if (t !== TTS.token()) return;
      DG.i++; DG.revealed = false; DG.hint = false;
    }
    DG.playing = false; DG.done = true; P.render();
  }
  function lineHTML(d, l, i, cls) {
    return `<div class="dline ${cls || ''} ${l.r === 'B' ? 'b' : 'a'}" data-act="dl-line" data-i="${i}" role="button" tabindex="0"><span class="who">${esc(d.roles[l.r])}</span>
      <span class="pt">${esc(l.pt)}</span>${DG.en ? `<span class="en">${esc(l.en)}</span>` : ''}</div>`;
  }
  V.dialogues = function (el) {
    if (!DG) return dialogList(el);
    const d = DL[DG.id]; const n = d.lines.length;
    const passBtn = (k, l) => `<button class="chip big ${DG.pass === k ? 'on' : ''}" data-act="dl-pass" data-k="${k}">${k} · ${esc(l)}</button>`;
    const head = `<button class="btn ghost sm" data-act="dl-back">← All dialogues</button>
      <div class="row between" style="margin-top:8px;align-items:flex-start"><div><h1 style="margin:0">${esc(d.title)}</h1><div class="muted small">${esc(d.en)} · ${esc(d.target)} <span class="tiny">${esc(d.terms)}</span></div></div><span class="badge">${esc(TOPIC[d.topic] || d.topic)}</span></div>
      <div class="chips" style="margin:12px 0">${passBtn(1, 'Listen')}${passBtn(2, 'You are Ryan')}${passBtn(3, 'You are ' + d.roles.A)}</div>`;
    const toggles = `<div class="row" style="gap:8px">
      <button class="chip big ${DG.en ? 'on' : ''}" data-act="dl-en">Show English <span class="kbd">e</span></button>
      ${DG.pass > 1 ? `<button class="chip big ${DG.hands ? 'on' : ''}" data-act="dl-hands">Hands-free</button>` : ''}</div>`;
    if (DG.done) { el.innerHTML = `<div class="study dlg">${head}${dialogEnd(d)}</div>`; return; }
    if (DG.pass === 1) {
      el.innerHTML = `<div class="study dlg">${head}
        <div class="row" style="margin-bottom:12px"><button class="btn primary" data-act="dl-play">${DG.playing ? 'Pause' : 'Play'} <span class="kbd">Space</span></button>
          <button class="btn" data-act="dl-restart">Restart</button>${toggles}</div>
        <div class="transcript">${d.lines.map((l, i) => lineHTML(d, l, i, i === DG.i && (DG.playing || DG.i) ? 'on' : '')).join('')}</div>
        <p class="tiny" style="margin-top:10px">Tap a line to hear it again.</p></div>`;
      const on = el.querySelector('.dline.on'); if (on && DG.playing) on.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    const me = mine(); const l = d.lines[DG.i]; const prev = DG.i > 0 ? d.lines[DG.i - 1] : null;
    if (l.r !== me) {
      el.innerHTML = `<div class="study dlg">${head}
        <div class="meta"><span>Pass ${DG.pass}</span><span>line ${DG.i + 1} / ${n}</span></div>
        <div class="progress" style="margin-bottom:14px"><div style="width:${DG.i / n * 100}%"></div></div>
        <div class="transcript">${prev ? lineHTML(d, prev, DG.i - 1, 'past') : ''}${lineHTML(d, l, DG.i, 'on')}</div>
        <div class="row" style="margin-top:14px"><button class="btn primary" data-act="dl-play">${DG.playing ? 'Pause' : 'Play'} <span class="kbd">Space</span></button>${toggles}</div></div>`;
      return;
    }
    const hint = l.hint || l.pt.split(/\s+/).slice(0, 3).join(' ') + '…';
    const card = P.sayCard({
      meta: [`Pass ${DG.pass} · you are ${esc(d.roles[me])}`, `line ${DG.i + 1} / ${n}`], progress: DG.i / n,
      label: 'Your line', front: `${prev ? `<div class="dprev"><span class="who">${esc(d.roles[prev.r])}</span> ${esc(prev.pt)}${DG.en ? `<div class="small muted">${esc(prev.en)}</div>` : ''}</div>` : ''}<div class="big" style="font-size:1.35rem">${esc(l.en)}</div>`,
      hint: esc(hint), answer: P.markHTML(l.pt, l.mark), say: l.pt, revealed: DG.revealed, hintShown: DG.hint,
      cue: prev && prev.r !== me ? prev.pt : '', acts: { reveal: 'dl-reveal', hint: 'dl-hint', end: 'dl-back', replay: 'dl-replay' },
      after: `<div class="say-row"><button class="btn primary" style="flex:1" data-act="dl-next">Next <span class="kbd">Enter</span></button><button class="btn" data-act="dl-flag">Flag <span class="kbd">f</span></button></div>`,
      extra: toggles,
    });
    el.innerHTML = `<div class="study dlg">${head}</div>${card}`;
  };
  function dialogEnd(d) {
    const x = S().dialog[d.id];
    const notes = `<div class="card flat"><h3>Notes</h3><ul class="small prose" style="margin:0">${d.notes.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
    const nav = `<div class="row" style="margin-top:14px"><button class="btn primary" data-act="dl-pass" data-k="2">Again (pass 2)</button><button class="btn" data-act="dl-nextd">Next dialogue</button><a class="btn ghost" href="#/today">Today</a></div>`;
    if (DG.pass === 1) return `<div class="card" style="text-align:center"><h2>Now your turn</h2><p class="muted">Play it again with your part muted and say Ryan's lines out loud.</p>
      <button class="btn primary say-main" data-act="dl-pass" data-k="2">2 · You are Ryan</button></div>${notes}
      <div class="row"><button class="btn" data-act="dl-nextd">Next dialogue</button><a class="btn ghost" href="#/today">Today</a></div>`;
    if (!DG.rated) return `<div class="card" style="text-align:center"><h2>How did it go?</h2>
      <div class="grades three"><button class="g1" data-act="dl-rate" data-g="1">Rough<small>1</small></button><button class="g2" data-act="dl-rate" data-g="2">OK<small>2</small></button><button class="g3" data-act="dl-rate" data-g="3">Smooth<small>3</small></button></div></div>${notes}`;
    return `<div class="note-good" style="margin-bottom:14px">Saved · ${x ? x.passes : 1} pass${x && x.passes > 1 ? 'es' : ''} on this dialogue.</div>${notes}${nav}`;
  }
  function dialogList(el) {
    const sug = leastPractised();
    el.innerHTML = `<div class="hero"><div><h1>Diálogos</h1><div class="muted">Like a backing track with one part muted: listen, then play your part out loud.</div></div>
        <button class="btn" data-act="dl-random">Random</button></div>
      ${sug ? `<div class="chips" style="margin-bottom:14px"><button class="chip big on" data-act="dl-open" data-k="${esc(sug.id)}">Suggested: ${esc(sug.title)}</button></div>` : ''}
      <div class="grid two">${DIALOGUES.map(d => {
        const x = S().dialog[d.id];
        return `<div class="card pcard" data-act="dl-open" data-k="${esc(d.id)}" role="button" tabindex="0">
          <div class="row between"><span class="badge">${esc(TOPIC[d.topic] || d.topic)}</span><span class="tiny">${x ? `${x.passes} pass${x.passes > 1 ? 'es' : ''} · last ${ago(x.last)}` : 'new'}</span></div>
          <h3 style="margin:8px 0 2px">${esc(d.title)}</h3><div class="small muted">${esc(d.en)} · <i>${esc(d.target)}</i></div></div>`;
      }).join('')}</div>`;
  }
  act['dl-open'] = (b) => openDialog(b.dataset.k);
  act['dl-random'] = () => openDialog(DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)].id);
  act['dl-nextd'] = () => { const d = leastPractised(DG && DG.id); if (d) openDialog(d.id); };
  act['dl-back'] = () => { TTS.stop(); DG = null; P.render(); };
  act['dl-pass'] = (b) => openDialog(DG.id, +b.dataset.k);
  act['dl-play'] = () => {
    if (DG.playing) { TTS.stop(); DG.playing = false; P.render(); return; }
    startPass();
  };
  act['dl-restart'] = () => { TTS.stop(); DG.i = 0; DG.done = false; playListen(); };
  act['dl-en'] = () => { DG.en = !DG.en; P.render(); };
  act['dl-hands'] = () => { DG.hands = !DG.hands; if (DG.hands && !DG.playing && !DG.revealed) runPass(); else P.render(); };
  act['dl-line'] = (b) => {
    const i = +b.dataset.i; const d = DL[DG.id];
    if (DG.pass !== 1 && d.lines[i].r === mine() && i === DG.i && !DG.revealed) return; // your own hidden line: no peeking
    TTS.stop(); DG.playing = false; if (DG.pass === 1) DG.i = i; P.render();
    TTS.say(d.lines[i].pt, roleOpts(d.lines[i].r));
  };
  act['dl-replay'] = () => { const d = DL[DG.id]; const prev = d.lines[DG.i - 1]; if (prev) { TTS.stop(); TTS.say(prev.pt, roleOpts(prev.r)); } };
  act['dl-hint'] = () => { DG.hint = true; P.render(); };
  act['dl-reveal'] = () => { if (DG.revealed) return; DG.revealed = true; runPass(); };
  act['dl-next'] = () => { TTS.stop(); DG.i++; DG.revealed = false; DG.hint = false; runPass(); };
  act['dl-flag'] = () => {
    const d = DL[DG.id]; const i = DG.i; const l = d.lines[i]; if (!l) return;
    const fresh = P.flag({ kind: 'dialog', id: d.id, i });
    if (fresh && !Object.values(S().notes).some(n => n.pt === l.pt)) P.addNote({ type: 'word', pt: l.pt, en: l.en, src: 'life' });
    Store.change({ silent: true }); P.toast(fresh ? 'Flagged: added to your reviews' : 'Already flagged', 1200);
  };
  act['dl-rate'] = (b) => {
    const x = S().dialog[DG.id] || { passes: 0, last: 0, rating: 0 };
    x.passes++; x.last = now(); x.rating = +b.dataset.g; S().dialog[DG.id] = x;
    P.bump('dialog'); DG.rated = true; Store.change({ silent: true }); P.render();
  };
  P.keys.dialogues = (e) => {
    if (!DG || !keyOk(e)) return;
    const d = DL[DG.id]; const k = e.key;
    const own = DG.pass > 1 && !DG.done && d.lines[DG.i] && d.lines[DG.i].r === mine();
    if (['1', '2', '3'].includes(k)) {
      e.preventDefault();
      if (DG.done && DG.pass > 1 && !DG.rated) act['dl-rate']({ dataset: { g: k } }); else openDialog(DG.id, +k);
    } else if (k === ' ') {
      e.preventDefault(); if (DG.done) return;
      if (own && !DG.revealed) act['dl-reveal'](); else act['dl-play']();
    } else if (k === 'Enter') {
      e.preventDefault(); if (DG.done) return;
      if (own) { if (DG.revealed) act['dl-next'](); else act['dl-reveal'](); }
      else if (DG.pass > 1) { TTS.stop(); DG.i++; runPass(); }
    } else if (k === 'h' || k === 'H') { if (own && !DG.revealed) { e.preventDefault(); act['dl-hint'](); } }
    else if (k === 'f' || k === 'F') { if ((own && DG.revealed) || DG.pass === 1) { e.preventDefault(); act['dl-flag'](); } }
    else if (k === 'e' || k === 'E') { e.preventDefault(); act['dl-en'](); }
  };
  P.leave.dialogues = () => { if (DG) DG.playing = false; };

  // ======================= RADIO =======================
  let RD = null, wake = null, audio = null, tick = null;
  const MIX = [['verbs', 'Verbs'], ['trans', 'Transformations'], ['dialog', 'Dialogue lines'], ['vocab', 'Vocab']];
  const elapsed = () => RD ? RD.activeMs + (RD.playing ? now() - RD.resumed : 0) : 0;
  const mmss = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  // English asks have keys in CAPS; an English voice would spell those out, so lower-case them for speech.
  const speakAsk = s => s.replace(/(?<![\p{L}])[\p{Lu}]{2,}(?![\p{L}])/gu, w => w.toLowerCase()).replace(/["“”]/g, '');
  const STREAM = {
    verbs() {
      const g = P.gymPick(RD.lastVerb); if (!g) return null; RD.lastVerb = g;
      const person = P.personLabel(g.t, g.p).split(' / ')[0];
      return { d: { kind: 'verb', v: g.v, t: g.t, p: g.p }, segs: [{ text: SPOKEN[g.t], lang: 'en' }, { text: `${person}, ${g.v}` }],
        show: `${Conj.label(g.t)} · ${person} · ${g.v}`, ans: formSay(g.v, g.t, g.p) };
    },
    trans() {
      const p = P.trPick(RD.used); if (!p) return null; const it = TR[p.id], x = it.tr[p.idx]; RD.used.add(trKey(p.id, p.idx));
      return { d: { kind: 'trans', id: p.id, idx: p.idx }, segs: [{ text: it.base }, { pause: 1000 }, { text: speakAsk(x.ask), lang: 'en' }],
        show: it.base, sub: x.ask, ans: x.a[0] };
    },
    dialog() {
      const lines = []; DIALOGUES.forEach(d => d.lines.forEach((l, i) => { if (l.r === 'B' && !RD.used.has('d|' + d.id + '|' + i)) lines.push({ d, l, i }); }));
      if (!lines.length) return null; const { d, l, i } = lines[Math.floor(Math.random() * lines.length)]; RD.used.add('d|' + d.id + '|' + i);
      return { d: { kind: 'dialog', id: d.id, i }, segs: [{ text: 'Diz em português:' }, { text: l.en, lang: 'en' }], show: l.en, sub: d.title, ans: l.pt };
    },
    vocab() {
      const ok = id => /^(v|c):/.test(id) && P.exists(id) && !RD.used.has(id);
      let ids = P.dueIds().filter(id => /:prod$/.test(id) && ok(id));
      if (!ids.length) ids = Object.values(S().cards).filter(c => c.state === 2 && /:rec$/.test(c.id) && ok(c.id)).map(c => c.id);
      if (!ids.length) return null;
      const id = ids[Math.floor(Math.random() * ids.length)]; RD.used.add(id);
      const { kind, ref } = P.parseId(id); const e = kind === 'v' ? P.VOC[ref] : P.CHK[ref];
      return { d: { kind: 'vocab', id: kind + ':' + ref }, segs: [{ text: e[4], lang: 'en' }], show: e[4], ans: P.clozePlain(e[3]) };
    },
  };
  function nextItem() {
    const mix = (S().settings.radioMix || []).filter(k => STREAM[k]);
    for (let n = 0; n < mix.length; n++) {
      const k = mix[RD.rr++ % mix.length];
      const it = STREAM[k](); if (it) return it;
    }
    return null;
  }
  function silentWav() {
    const n = 8000, b = new Uint8Array(44 + n), dv = new DataView(b.buffer);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
    w(0, 'RIFF'); dv.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); w(36, 'data'); dv.setUint32(40, n, true);
    b.fill(128, 44); let s = ''; b.forEach(x => { s += String.fromCharCode(x); }); return 'data:audio/wav;base64,' + btoa(s);
  }
  async function lockOn() { try { if ('wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) { wake = null; } }
  function lockOff() { try { if (wake) wake.release(); } catch (e) { } wake = null; }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && RD && !RD.summary) lockOn(); });
  function mediaOn() {
    try { if (!audio) { audio = new Audio(silentWav()); audio.loop = true; } audio.play().catch(() => { }); } catch (e) { }
    if (!('mediaSession' in navigator)) return;
    const h = { play: () => act['rd-play'](), pause: () => act['rd-pause'](), nexttrack: () => act['rd-skip'](), previoustrack: () => act['rd-again']() };
    for (const [k, f] of Object.entries(h)) { try { navigator.mediaSession.setActionHandler(k, f); } catch (e) { } }
  }
  function mediaMeta(text) { try { if ('mediaSession' in navigator && window.MediaMetadata) { navigator.mediaSession.metadata = new MediaMetadata({ title: 'Alfacinha rádio', artist: text || '' }); navigator.mediaSession.playbackState = RD && RD.playing ? 'playing' : 'paused'; } } catch (e) { } }
  function mediaOff() {
    try { if (audio) audio.pause(); } catch (e) { }
    if (!('mediaSession' in navigator)) return;
    ['play', 'pause', 'nexttrack', 'previoustrack'].forEach(k => { try { navigator.mediaSession.setActionHandler(k, null); } catch (e) { } });
    try { navigator.mediaSession.metadata = null; } catch (e) { }
  }
  async function radioLoop() {
    TTS.stop(); const t = TTS.token();
    await TTS.pause(150); if (t !== TTS.token()) return; // let the cancel settle before speaking again (Chrome)
    while (RD && RD.playing) {
      if (elapsed() >= RD.len) return finishRadio();
      let it = RD.items[RD.i];
      if (!it) { it = nextItem(); if (!it) return finishRadio(); RD.items.push(it); }
      RD.phase = 'prompt'; draw(); mediaMeta(it.show);
      for (const s of it.segs) {
        if (s.pause) await TTS.pause(s.pause); else await TTS.sayOrRead(s.text, s.lang === 'en' ? { lang: 'en' } : {});
        if (t !== TTS.token()) return;
        await TTS.pause(200); if (t !== TTS.token()) return;
      }
      RD.phase = 'gap'; draw();
      await TTS.pause((S().settings.radioGap || 4) * 1000); if (t !== TTS.token()) return;
      RD.phase = 'answer'; draw();
      await TTS.sayOrRead(it.ans); if (t !== TTS.token()) return;
      await TTS.pause(1200); if (t !== TTS.token()) return;
      RD.count++; RD.i++;
    }
  }
  function finishRadio(leaving) {
    if (!RD || RD.summary) return;
    if (RD.playing) { RD.activeMs += now() - RD.resumed; RD.playing = false; }
    TTS.stop(); clearInterval(tick); lockOff(); mediaOff();
    const minutes = Math.max(RD.count ? 1 : 0, Math.round(RD.activeMs / 60000));
    if (minutes) { P.bump('radioMin', minutes); S().radio.minutes = (S().radio.minutes || 0) + minutes; }
    RD.summary = { minutes, items: RD.count, flagged: RD.flagged };
    Store.change({ silent: true });
    if (leaving) RD = null; else P.render();
  }
  // Update the pocket screen in place when it's showing, otherwise render the page.
  function draw() {
    const el = document.getElementById('pocket');
    if (!el) return P.render();
    el.outerHTML = pocketHTML();
  }
  function pocketHTML() {
    const it = RD.items[RD.i];
    const phase = !RD.playing ? 'Paused' : RD.phase === 'gap' ? 'Your turn: say it' : RD.phase === 'answer' ? 'Answer' : 'Listen';
    return `<div id="pocket" class="pocket" role="dialog" aria-label="Radio">
      <div class="pk-top"><span>Item ${RD.i + 1} · <span id="rd-time">${mmss(elapsed())}</span> / ${mmss(RD.len)}</span><button class="pk-stop" data-act="rd-stop">Stop</button></div>
      <div class="pk-main"><div class="pk-phase ${RD.phase === 'gap' && RD.playing ? 'go' : ''}">${phase}</div>
        <div class="pk-prompt">${it ? esc(it.show) : ''}</div>${it && it.sub ? `<div class="pk-sub">${esc(it.sub)}</div>` : ''}
        ${it && RD.phase === 'answer' ? `<div class="pk-ans">${esc(it.ans)}</div>` : ''}</div>
      <div class="pk-btns">
        <button data-act="${RD.playing ? 'rd-pause' : 'rd-play'}">${RD.playing ? 'Pause' : 'Play'}</button>
        <button data-act="rd-again">Again</button><button data-act="rd-skip">Skip</button><button data-act="rd-flag">Flag</button></div></div>`;
  }
  V.radio = function (el) {
    const st = S().settings;
    if (RD && RD.summary) {
      const s = RD.summary;
      el.innerHTML = `<div class="study"><div class="card" style="text-align:center"><h1>Done</h1>
        <p class="muted" style="font-size:1.1rem">${s.minutes} min, ${s.items} item${s.items === 1 ? '' : 's'}, ${s.flagged} flagged.</p>
        ${s.flagged ? '<p class="small muted">Flagged items come first in your next Transformations session.</p>' : ''}
        <div class="row" style="justify-content:center"><button class="btn primary" data-act="rd-new">Again</button>${s.flagged ? '<a class="btn" href="#/transform">Transformations</a>' : ''}<a class="btn ghost" href="#/today">Today</a></div></div></div>`;
      return;
    }
    if (RD) { el.innerHTML = pocketHTML(); return; }
    const mix = st.radioMix || [];
    el.innerHTML = `<div class="hero"><div><h1>Rádio</h1><div class="muted">Hands-free drill for walks, commutes and easy rides. The app asks, waits, answers, moves on.</div></div></div>
      <div class="card">
        <button class="btn primary block say-main" data-act="rd-start" ${mix.length ? '' : 'disabled'}>${ICON.radio} Play (${st.radioLen} min)</button>
        <p style="margin:14px 0">Put earbuds in. Nothing to tap: say each answer in the gap.</p>
        <h3>Length</h3><div class="chips" style="margin-bottom:14px">${[10, 15, 30].map(n => `<button class="chip big ${st.radioLen === n ? 'on' : ''}" data-act="rd-len" data-k="${n}">${n} min</button>`).join('')}</div>
        <h3>Gap to answer</h3><div class="chips" style="margin-bottom:14px">${[3, 4, 5, 7].map(n => `<button class="chip big ${st.radioGap === n ? 'on' : ''}" data-act="rd-gap" data-k="${n}">${n} s</button>`).join('')}</div>
        <h3>Mix</h3><div class="stack">${MIX.map(([k, l]) => `<label class="row" style="flex-wrap:nowrap;gap:12px;cursor:pointer"><input type="checkbox" data-act="rd-mix" data-k="${k}" ${mix.includes(k) ? 'checked' : ''} style="width:22px;height:22px"> ${l}</label>`).join('')}</div>
        <p class="tiny" style="margin:14px 0 0">The screen stays on (dark) while it plays, because phones can pause speech when the screen turns off. Earbud buttons: play/pause, next = skip, previous = again.</p></div>`;
  };
  act['rd-len'] = (b) => { S().settings.radioLen = +b.dataset.k; Store.change(); };
  act['rd-gap'] = (b) => { S().settings.radioGap = +b.dataset.k; Store.change(); };
  act['rd-mix'] = (b) => {
    const st = S().settings; const k = b.dataset.k; const cur = st.radioMix || [];
    const n = cur.includes(k) ? cur.filter(x => x !== k) : MIX.map(m => m[0]).filter(x => x === k || cur.includes(x));
    if (n.length) st.radioMix = n; else b.checked = true;
    Store.change();
  };
  act['rd-start'] = () => {
    RD = { items: [], i: 0, rr: 0, count: 0, flagged: 0, used: new Set(), playing: true, resumed: now(), activeMs: 0, len: (S().settings.radioLen || 15) * 60000, phase: 'prompt', summary: null };
    P.render(); lockOn(); mediaOn();
    clearInterval(tick); tick = setInterval(() => { const t = document.getElementById('rd-time'); if (t) t.textContent = mmss(elapsed()); }, 1000);
    radioLoop();
  };
  act['rd-new'] = () => { RD = null; act['rd-start'](); };
  act['rd-pause'] = () => { if (!RD || !RD.playing) return; RD.activeMs += now() - RD.resumed; RD.playing = false; TTS.stop(); draw(); mediaMeta(RD.items[RD.i] && RD.items[RD.i].show); };
  act['rd-play'] = () => { if (!RD || RD.playing || RD.summary) return; RD.playing = true; RD.resumed = now(); lockOn(); mediaOn(); radioLoop(); };
  act['rd-again'] = () => { if (!RD || RD.summary) return; if (!RD.playing) { RD.playing = true; RD.resumed = now(); } radioLoop(); };
  act['rd-skip'] = () => { if (!RD || RD.summary) return; TTS.stop(); RD.i++; if (RD.playing) radioLoop(); else draw(); };
  act['rd-flag'] = () => {
    if (!RD) return; const it = RD.items[RD.i]; if (!it) return;
    if (P.flag(it.d)) { RD.flagged++; Store.change({ silent: true }); }
    P.toast('Flagged', 1000);
  };
  act['rd-stop'] = () => finishRadio();
  P.keys.radio = (e) => {
    if (!RD || RD.summary || !keyOk(e)) return;
    const k = e.key;
    if (k === ' ') { e.preventDefault(); act[RD.playing ? 'rd-pause' : 'rd-play'](); }
    else if (k === 'ArrowRight' || k === 's' || k === 'S') { e.preventDefault(); act['rd-skip'](); }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); act['rd-again'](); }
    else if (k === 'f' || k === 'F') { e.preventDefault(); act['rd-flag'](); }
    else if (k === 'Escape') { e.preventDefault(); finishRadio(); }
  };
  P.leave.radio = () => { if (RD && !RD.summary) finishRadio(true); else RD = null; };
})(Pois);
