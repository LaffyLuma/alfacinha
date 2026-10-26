/* More speaking: Conversas (scripted conversations, corrections after the thought), Ritmo (tempo-ramped
   shadowing loops + verbs on a click track) and Missões (weekly real-life quests in Lisbon). No typing. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views, act = P.actions;
  const now = () => Date.now();
  const keyOk = e => !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
  const ago = t => { const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / P.DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };
  const play = t => `<button class="iconbtn" data-act="say" data-say="${esc(t)}" title="Listen" aria-label="Listen">${ICON.speaker}</button>`;
  const TOPIC = { bike: 'Bike', games: 'Jogos', music: 'Música', tech: 'Tech', friends: 'Amigos', canada: 'Canadá', lisbon: 'Lisboa', class: 'Aula', work: 'Trabalho', opinion: 'Opinião', food: 'Comida', travel: 'Viagens', health: 'Saúde' };

  // ======================= CONVERSAS =======================
  // The app asks; you answer out loud for as long as you like; only then you see model answers and a short check list.
  const CVI = {}; CONVERSAS.forEach(c => { CVI[c.id] = c; });
  let CV = null;
  const cvNode = () => CVI[CV.id].nodes.find(n => n.id === CV.node);
  const cvLeast = except => CONVERSAS.filter(c => c.id !== except).slice().sort((a, b) => {
    const x = S().conv[a.id] || {}, y = S().conv[b.id] || {};
    return (x.runs || 0) - (y.runs || 0) || (x.last || 0) - (y.last || 0);
  })[0];
  function openConv(id) {
    TTS.stop();
    CV = { id, node: CVI[id].nodes[0].id, n: 1, phase: 'ask', hint: false, en: CV ? CV.en : false, done: false, rated: false };
    P.render(); window.scrollTo(0, 0); cvAsk();
  }
  async function cvAsk() {
    const x = cvNode(); CV.phase = 'ask'; CV.hint = false;
    if (!S().settings.autoplay) { CV.phase = 'speak'; P.render(); return; }
    P.render();
    const t = TTS.token();
    await TTS.sayOrRead(x.q, P.roleOpts('A'));
    if (t !== TTS.token() || !CV || CV.phase !== 'ask') return;
    CV.phase = 'speak'; P.render();
  }
  V.conversas = function (el) {
    if (!CV) return convList(el);
    const c = CVI[CV.id], x = cvNode();
    const head = `<button class="btn ghost sm" data-act="cv-back">← All conversations</button>
      <div class="row between" style="margin-top:8px;align-items:flex-start"><div><h1 style="margin:0">${esc(c.title)}</h1>
        <div class="muted small">${esc(c.en)} · ${esc(c.target)} <span class="tiny">${esc(c.terms)}</span></div></div><span class="badge">${esc(TOPIC[c.topic] || c.topic)}</span></div>`;
    if (CV.done) { el.innerHTML = `<div class="study say">${head}${convEnd(c)}</div>`; return; }
    const ask = `<div class="qcard" style="margin-top:14px">
        <div class="row between" style="margin-bottom:6px"><span class="prompt-label" style="margin:0">${esc(c.who)} · question ${CV.n}</span>${play(x.q)}</div>
        <div class="sentence">${esc(x.q)}</div>${CV.en ? `<div class="en small">${esc(x.en)}</div>` : ''}
        ${CV.phase === 'speak' && CV.hint ? `<div class="sayhint">${esc(x.models[0].split(/\s+/).slice(0, 4).join(' '))}…</div>` : ''}</div>`;
    const toggles = `<button class="chip big ${CV.en ? 'on' : ''}" data-act="cv-en">Show English <span class="kbd">e</span></button>`;
    let below = '';
    if (CV.phase === 'ask') below = `<p class="muted" style="text-align:center;margin:16px 0">Listen…</p>`;
    else if (CV.phase === 'speak') below = `<p style="text-align:center;margin:16px 0 4px"><b>Your turn.</b> Answer out loud, as long as you like. Mistakes are fine.</p>
        <button class="btn primary block say-main" data-act="cv-done">I'm done <span class="kbd">Space</span></button>
        <div class="say-row"><button class="btn ghost" data-act="cv-hint">Starter <span class="kbd">h</span></button><button class="btn ghost" data-act="cv-replay">${ICON.speaker} Hear it again <span class="kbd">r</span></button></div>`;
    else {
      const nextBtns = x.choices
        ? `<h3 style="margin-top:16px">What did you say?</h3><div class="stack">${x.choices.map((ch, i) => `<button class="btn block" data-act="cv-choice" data-k="${esc(ch.next)}">${esc(ch.t)} <span class="kbd">${i + 1}</span></button>`).join('')}</div>`
        : `<button class="btn primary block say-main" data-act="cv-next">${x.next ? 'Next question' : 'Finish'} <span class="kbd">Enter</span></button>`;
      below = `<div class="card" style="margin-top:14px"><h3>You could have said</h3>
          ${x.models.map(m => `<div class="model"><div class="sentence-sm">${P.markHTML(m, x.mark)}</div>${play(m)}</div>`).join('')}
          <h3 style="margin-top:14px">Check yourself</h3><ul class="checklist">${x.check.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>${nextBtns}`;
    }
    el.innerHTML = `<div class="study say">${head}${ask}${below}
      <div class="row between" style="margin-top:14px"><button class="btn ghost" data-act="cv-back">End</button>${toggles}</div></div>`;
  };
  function convEnd(c) {
    const x = S().conv[c.id];
    if (!CV.rated) return `<div class="card" style="text-align:center;margin-top:14px"><h2>How did it go?</h2>
      <div class="grades three"><button class="g1" data-act="cv-rate" data-g="1">Rough<small>1</small></button><button class="g2" data-act="cv-rate" data-g="2">OK<small>2</small></button><button class="g3" data-act="cv-rate" data-g="3">Smooth<small>3</small></button></div></div>`;
    return `<div class="note-good" style="margin:14px 0">Saved · ${x ? x.runs : 1} time${x && x.runs > 1 ? 's' : ''} through this conversation. Try a different branch next time.</div>
      <div class="row"><button class="btn primary" data-act="cv-again">Again</button><button class="btn" data-act="cv-nextc">Next conversation</button><a class="btn ghost" href="#/today">Today</a></div>`;
  }
  function convList(el) {
    const sug = cvLeast();
    el.innerHTML = `<div class="hero"><div><h1>Conversas</h1><div class="muted">Questions about your life. Answer out loud first; model answers and a short check list come after, never during.</div></div>
        <button class="btn" data-act="cv-random">Random</button></div>
      ${sug ? `<div class="chips" style="margin-bottom:14px"><button class="chip big on" data-act="cv-open" data-k="${esc(sug.id)}">Suggested: ${esc(sug.title)}</button></div>` : ''}
      <div class="grid two">${CONVERSAS.map(c => {
        const x = S().conv[c.id];
        return `<div class="card pcard" data-act="cv-open" data-k="${esc(c.id)}" role="button" tabindex="0">
          <div class="row between"><span class="badge">${esc(TOPIC[c.topic] || c.topic)}</span><span class="tiny">${x ? `${x.runs}× · last ${ago(x.last)}` : 'new'}</span></div>
          <h3 style="margin:8px 0 2px">${esc(c.title)}</h3><div class="small muted">${esc(c.en)} · <i>${esc(c.target)}</i></div></div>`;
      }).join('')}</div>`;
  }
  function cvGo(next) {
    TTS.stop();
    if (!next) { CV.done = true; P.render(); return; }
    CV.node = next; CV.n++; window.scrollTo(0, 0); cvAsk();
  }
  act['cv-open'] = b => openConv(b.dataset.k);
  act['cv-suggest'] = () => { const c = cvLeast(); if (c) openConv(c.id); };
  act['cv-random'] = () => openConv(CONVERSAS[Math.floor(Math.random() * CONVERSAS.length)].id);
  act['cv-again'] = () => openConv(CV.id);
  act['cv-nextc'] = () => { const c = cvLeast(CV && CV.id); if (c) openConv(c.id); };
  act['cv-back'] = () => { TTS.stop(); CV = null; P.render(); };
  act['cv-en'] = () => { CV.en = !CV.en; P.render(); };
  act['cv-hint'] = () => { CV.hint = true; P.render(); };
  act['cv-replay'] = () => { TTS.stop(); TTS.say(cvNode().q, P.roleOpts('A')); };
  act['cv-done'] = () => { if (!CV || CV.phase === 'models') return; TTS.stop(); CV.phase = 'models'; P.render(); };
  act['cv-choice'] = b => cvGo(b.dataset.k);
  act['cv-next'] = () => cvGo(cvNode().next);
  act['cv-rate'] = b => {
    const x = S().conv[CV.id] || { runs: 0, last: 0, rating: 0 };
    x.runs++; x.last = now(); x.rating = +b.dataset.g; S().conv[CV.id] = x;
    P.bump('conv'); CV.rated = true; Store.change({ silent: true }); P.render();
  };
  P.keys.conversas = e => {
    if (!CV || !keyOk(e)) return;
    const k = e.key; const x = cvNode();
    if (CV.done) { if (!CV.rated && ['1', '2', '3'].includes(k)) { e.preventDefault(); act['cv-rate']({ dataset: { g: k } }); } return; }
    if (k === 'e' || k === 'E') { e.preventDefault(); act['cv-en'](); }
    else if (k === 'r' || k === 'R') { e.preventDefault(); act['cv-replay'](); }
    else if (CV.phase !== 'models' && (k === ' ' || k === 'Enter')) { e.preventDefault(); act['cv-done'](); }
    else if (CV.phase === 'speak' && (k === 'h' || k === 'H')) { e.preventDefault(); act['cv-hint'](); }
    else if (CV.phase === 'models' && x.choices && /^[1-3]$/.test(k) && x.choices[+k - 1]) { e.preventDefault(); cvGo(x.choices[+k - 1].next); }
    else if (CV.phase === 'models' && !x.choices && k === 'Enter') { e.preventDefault(); act['cv-next'](); }
  };
  P.leave.conversas = () => { if (CV && CV.phase === 'ask') CV.phase = 'speak'; };

  // ======================= RITMO =======================
  // 1) Tempo loop: the voice repeats one sentence; you speak along; each clean pass makes it faster.
  // 2) Click track: five persons of one verb, one per beat; held it → the tempo goes up.
  let RL = null, CT = null, ac = null, clicks = [], beatTimers = [];
  const LOOP_START = 0.7, LOOP_MAX = 1.6, NATIVE = 1.2;
  function loopPool() {
    const out = [], ok = s => { const n = s.split(/\s+/).length; return n >= 5 && n <= 14; };
    DIALOGUES.forEach(d => d.lines.forEach((l, i) => { if (l.r === 'B' && ok(l.pt)) out.push({ key: `d|${d.id}|${i}`, text: l.pt, en: l.en }); }));
    TRANSFORM.forEach(it => it.tr.forEach((x, i) => { if (ok(x.a[0])) out.push({ key: `t|${it.id}|${i}`, text: x.a[0], en: '' }); }));
    return out;
  }
  function loopPick(last) {
    const pool = loopPool().filter(p => !last || p.key !== last);
    return P.pickWeighted(pool, p => { const b = S().ritmo.loop[p.key]; return !b ? 1.2 : b >= NATIVE ? 0.15 : 0.6 + (NATIVE - b); });
  }
  async function loopRun() {
    TTS.stop(); const t = TTS.token(); RL.playing = true; draw();
    await TTS.pause(120); if (t !== TTS.token()) return;
    while (RL && RL.playing) {
      RL.reps++; draw();
      await TTS.sayOrRead(RL.text, { rate: RL.rate }); if (t !== TTS.token()) return;
      await TTS.pause(1100); if (t !== TTS.token()) return;
    }
  }
  function loopSave() {
    if (!RL || !RL.best) return;
    const L = S().ritmo.loop; L[RL.key] = Math.max(L[RL.key] || 0, RL.best);
    S().ritmo.last = now(); P.bump('ritmo'); Store.change({ silent: true });
  }
  function loopNew() { const p = loopPick(RL && RL.key); RL = Object.assign({ mode: 'loop', rate: LOOP_START, best: 0, reps: 0, playing: false, done: (RL && RL.done) || 0 }, p); loopRun(); }
  // ---- click track ----
  function ctPick() {
    for (let i = 0; i < 30; i++) {
      const g = P.gymPick(CT && CT.v ? { v: CT.v } : null);
      if (g && g.t !== 'imp' && !P.VERB[g.v].def.persons) return g;
    }
    return { v: 'fazer', t: 'pps' };
  }
  function stopClicks() {
    beatTimers.forEach(clearTimeout); beatTimers = [];
    clicks.forEach(o => { try { o.stop(0); } catch (e) { } }); clicks = [];
  }
  function tick(time, accent) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = accent ? 1600 : 1000;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(0.6, time + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
    o.connect(g); g.connect(ac.destination); o.start(time); o.stop(time + 0.09); clicks.push(o);
  }
  function ctRound() {
    stopClicks(); TTS.stop();
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
    CT.phase = 'count'; CT.beat = -1; draw();
    const dur = 60 / CT.bpm, t0 = (ac ? ac.currentTime : 0) + 0.2;
    for (let i = 0; i < 9; i++) {
      if (ac) tick(t0 + i * dur, i === 0 || i === 4);
      beatTimers.push(setTimeout(() => { CT.beat = i; CT.phase = i < 4 ? 'count' : 'go'; ctBeat(); }, (0.2 + i * dur) * 1000));
    }
    beatTimers.push(setTimeout(() => {
      CT.phase = 'reveal'; draw();
      const f = P.VERB[CT.v].f[CT.t];
      if (S().settings.autoplay) TTS.say([0, 1, 2, 3, 4].map(p => P.personLabel(CT.t, p).split(' / ')[0] + ' ' + f[p]).join(', '));
    }, (0.2 + 9 * dur) * 1000));
  }
  // Update the beat highlight in place (a full re-render every beat would be wasteful)
  function ctBeat() {
    const el = document.getElementById('ct-beats'); if (!el) return draw();
    el.querySelectorAll('[data-b]').forEach(n => n.classList.toggle('on', +n.dataset.b === CT.beat));
    const lab = document.getElementById('ct-label'); if (lab) lab.textContent = CT.phase === 'count' ? 'Count-in…' : 'Go!';
  }
  function draw() { if (P.route() === 'ritmo') P.render(); }
  V.ritmo = function (el) {
    const R = S().ritmo; const st = S().settings;
    if (RL) {
      const pct = Math.round((Math.min(RL.rate, NATIVE) - 0.6) / (NATIVE - 0.6) * 100);
      el.innerHTML = `<div class="study say">
        <div class="meta"><span>Tempo loop · ${RL.done} done</span><span>×${RL.rate.toFixed(1)}</span></div>
        <div class="progress" style="margin-bottom:14px"><div style="width:${pct}%"></div></div>
        <div class="qcard"><div class="prompt-label">Speak along with the voice · ${RL.playing ? 'playing' : 'paused'} · pass ${RL.reps}</div>
          <div class="sentence">${esc(RL.text)}</div>${RL.en ? `<div class="en small">${esc(RL.en)}</div>` : ''}
          <div class="tiny" style="margin-top:8px">Speed ×${RL.rate.toFixed(1)} · ×${NATIVE.toFixed(1)} ≈ natural Lisbon pace${R.loop[RL.key] ? ` · your best here ×${R.loop[RL.key].toFixed(1)}` : ''}</div></div>
        <button class="btn primary block say-main" data-act="rt-faster">Clean pass → faster <span class="kbd">Space</span></button>
        <div class="say-row"><button class="btn" data-act="rt-again">Again, same speed <span class="kbd">r</span></button><button class="btn" data-act="rt-slower">Slower <span class="kbd">s</span></button><button class="btn" data-act="rt-next">Next sentence <span class="kbd">n</span></button></div>
        <div class="row between" style="margin-top:14px"><button class="btn ghost" data-act="rt-stop">End</button>${RL.playing ? '<button class="btn ghost" data-act="rt-pause">Pause</button>' : '<button class="btn ghost" data-act="rt-again">Play</button>'}</div></div>`;
      return;
    }
    if (CT) {
      const f = P.VERB[CT.v].f[CT.t]; const pers = ['eu', 'tu', 'ele/ela', 'nós', 'eles/elas'];
      const best = R.bpm[CT.t] || 0;
      el.innerHTML = `<div class="study say">
        <div class="meta"><span>Click track · ${CT.held}/${CT.rounds} held</span><span>${CT.bpm} BPM</span></div>
        <div class="qcard"><div class="prompt-label">${esc(Conj.label(CT.t))} <span class="tiny term">${esc(Conj.TENSE[CT.t].pt)}</span></div>
          <div class="big">${esc(CT.v)}</div><div class="small muted">${esc(P.VERB[CT.v].def.en)}</div>
          <div id="ct-label" class="prompt-label" style="margin-top:14px">${CT.phase === 'count' ? 'Count-in…' : CT.phase === 'go' ? 'Go!' : CT.phase === 'reveal' ? 'How did you do?' : 'Say one person per beat'}</div>
          <div class="ct-beats" id="ct-beats">${[0, 1, 2, 3].map(i => `<span class="ct-dot" data-b="${i}">${i + 1}</span>`).join('')}${pers.map((p, i) => `<span class="ct-p" data-b="${i + 4}">${p}</span>`).join('')}</div>
          ${CT.phase === 'reveal' ? `<div class="answer-block"><div class="sentence">${[0, 1, 2, 3, 4].map(p => `<span class="nowrap"><span class="tiny">${pers[p]}</span> <b>${esc(f[p])}</b></span>`).join(' · ')}</div>${play([0, 1, 2, 3, 4].map(p => P.personLabel(CT.t, p).split(' / ')[0] + ' ' + f[p]).join(', '))}</div>` : ''}
          ${best ? `<div class="tiny" style="margin-top:10px">Your best on "${esc(Conj.label(CT.t))}": ${best} BPM</div>` : ''}</div>
        ${CT.phase === 'reveal' ? `<div class="grades three"><button class="g1" data-act="ct-grade" data-g="1">Lost it<small>1 · slower</small></button><button class="g2" data-act="ct-again">Again<small>2 · same</small></button><button class="g3" data-act="ct-grade" data-g="3">Held it<small>3 · faster</small></button></div>`
          : CT.phase === 'idle' ? `<button class="btn primary block say-main" data-act="ct-go">Start the click <span class="kbd">Space</span></button>` : '<p class="small muted" style="text-align:center;margin-top:14px">Say each form on its beat: eu… tu… ele… nós… eles…</p>'}
        <div class="row between" style="margin-top:14px"><button class="btn ghost" data-act="rt-stop">End</button><span class="small muted">Tempo: <button class="btn ghost" data-act="ct-bpm" data-k="-6" aria-label="Slower">−</button>${CT.bpm}<button class="btn ghost" data-act="ct-bpm" data-k="6" aria-label="Faster">+</button></span></div></div>`;
      return;
    }
    const loops = Object.values(R.loop); const nat = loops.filter(b => b >= NATIVE).length;
    const bpms = Object.entries(R.bpm).sort((a, b) => b[1] - a[1]).slice(0, 4);
    el.innerHTML = `<div class="hero"><div><h1>Ritmo</h1><div class="muted">Fluency is a rhythm thing. Use the musician in you.</div></div></div>
      <div class="grid two">
        <div class="card"><h2>Tempo loop</h2><p class="small muted">The voice repeats one sentence. Speak along with it (shadowing). Each clean pass, the speed goes up, until you're at natural Lisbon pace.</p>
          <p class="small">${loops.length ? `${loops.length} sentences practised · ${nat} at full speed` : 'Start slow (×0.7). Aim for ×1.2.'}</p>
          <button class="btn primary block say-main" data-act="rt-loop">Start a tempo loop</button></div>
        <div class="card"><h2>Verbs on a click track</h2><p class="small muted">Four clicks to count in, then say the five persons of one verb, one per beat. Held it? The tempo goes up.</p>
          <p class="small">${bpms.length ? 'Best: ' + bpms.map(([t, b]) => `${esc(Conj.label(t))} ${b} BPM`).join(' · ') : 'Starts at 60 BPM.'}</p>
          <button class="btn primary block say-main" data-act="rt-click">Start the click track</button></div></div>`;
  };
  act['rt-loop'] = () => { RL = null; CT = null; loopNew(); };
  act['rt-faster'] = () => { if (!RL) return; RL.best = Math.max(RL.best, RL.rate); RL.rate = Math.min(LOOP_MAX, Math.round((RL.rate + 0.1) * 10) / 10); loopSave(); loopRun(); };
  act['rt-slower'] = () => { if (!RL) return; RL.rate = Math.max(0.5, Math.round((RL.rate - 0.1) * 10) / 10); loopRun(); };
  act['rt-again'] = () => { if (RL) loopRun(); };
  act['rt-pause'] = () => { if (RL) { RL.playing = false; TTS.stop(); draw(); } };
  act['rt-next'] = () => { if (!RL) return; loopSave(); RL.done++; loopNew(); };
  act['rt-stop'] = () => { TTS.stop(); stopClicks(); if (RL) loopSave(); RL = null; CT = null; P.render(); };
  act['rt-click'] = () => { RL = null; CT = { bpm: 60, held: 0, rounds: 0, phase: 'idle', beat: -1, v: null }; Object.assign(CT, ctPick()); P.render(); };
  act['ct-go'] = () => { if (CT) ctRound(); };
  act['ct-again'] = () => { if (CT) ctRound(); };
  act['ct-bpm'] = b => { if (!CT) return; CT.bpm = Math.max(40, Math.min(180, CT.bpm + +b.dataset.k)); if (CT.phase === 'reveal' || CT.phase === 'idle') P.render(); };
  act['ct-grade'] = b => {
    if (!CT || CT.phase !== 'reveal') return;
    const g = +b.dataset.g; CT.rounds++;
    if (g === 3) { CT.held++; const B = S().ritmo.bpm; B[CT.t] = Math.max(B[CT.t] || 0, CT.bpm); CT.bpm = Math.min(180, CT.bpm + 6); }
    else CT.bpm = Math.max(40, CT.bpm - 6);
    S().ritmo.last = now(); P.bump('ritmo'); Store.change({ silent: true });
    Object.assign(CT, ctPick()); ctRound();
  };
  P.keys.ritmo = e => {
    if (!keyOk(e)) return; const k = e.key;
    if (RL) {
      if (k === ' ') { e.preventDefault(); act['rt-faster'](); }
      else if (k === 'r' || k === 'R') { e.preventDefault(); act['rt-again'](); }
      else if (k === 's' || k === 'S') { e.preventDefault(); act['rt-slower'](); }
      else if (k === 'n' || k === 'N') { e.preventDefault(); act['rt-next'](); }
    } else if (CT) {
      if (CT.phase === 'idle' && (k === ' ' || k === 'Enter')) { e.preventDefault(); ctRound(); }
      else if (CT.phase === 'reveal' && (k === '1' || k === '3')) { e.preventDefault(); act['ct-grade']({ dataset: { g: k } }); }
      else if (CT.phase === 'reveal' && (k === '2' || k === ' ')) { e.preventDefault(); ctRound(); }
    }
  };
  P.leave.ritmo = () => { stopClicks(); if (RL) { loopSave(); RL.playing = false; } if (CT && CT.phase !== 'reveal') CT.phase = 'idle'; };

  // ======================= MISSÕES =======================
  // Three real-life quests a week, picked from a fixed weekly shuffle so every device shows the same three.
  const MI = {}; MISSIONS.forEach(m => { MI[m.id] = m; });
  const WHERE = { 'café': 'Café', shop: 'Lojas', transport: 'Transportes', bike: 'Bike', health: 'Saúde', errands: 'Recados', neighbours: 'Vizinhos', phone: 'Telefone', media: 'Media', music: 'Música', games: 'Jogos', friends: 'Amigos', class: 'Aula' };
  let MS = { open: null, extra: null };
  function week(d = new Date()) {
    const s = new Date(d); s.setHours(0, 0, 0, 0); s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); // Monday 00:00
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    const y = t.getUTCFullYear(); const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / P.DAY + 1) / 7);
    return { key: `${y}-W${w}`, start: s.getTime() };
  }
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function weekMissions() {
    const w = week(); const st = S().missions;
    const order = MISSIONS.slice().sort((a, b) => hash(w.key + a.id) - hash(w.key + b.id));
    const fresh = m => { const x = st[m.id]; return (!x || !x.done || x.done >= w.start) && !(x && x.skip === w.key); };
    let list = order.filter(fresh).slice(0, 3);
    if (list.length < 3) list = list.concat(order.filter(m => !list.includes(m) && !(st[m.id] && st[m.id].skip === w.key)).sort((a, b) => ((st[a.id] || {}).done || 0) - ((st[b.id] || {}).done || 0)).slice(0, 3 - list.length));
    return list;
  }
  P.missionsWeekDone = () => { const w = week(); return weekMissions().filter(m => (S().missions[m.id] || {}).done >= w.start).length; };
  function missionCard(m, w) {
    const x = S().missions[m.id] || {}; const done = (x.done || 0) >= w.start; const choosing = MS.open === m.id;
    return `<div class="card mission ${done ? 'done' : ''}">
      <div class="row between"><span class="badge">${esc(WHERE[m.where] || m.where)} · ${esc(m.lvl)}</span>${done ? `<span class="badge good">✓ done</span>` : ''}</div>
      <div class="row" style="flex-wrap:nowrap;gap:10px;margin-top:8px"><h2 style="margin:0;flex:1">${esc(m.title)}</h2>${play(m.title)}</div>
      <div class="muted small">${esc(m.en)}</div>
      <p style="margin:10px 0">${esc(m.task)}</p>
      <div class="stack">${m.phrases.map((ph, i) => choosing
        ? `<button class="btn block phrase-pick" data-act="ms-pick" data-k="${esc(m.id)}" data-i="${i}"><span>${esc(ph.pt)}<small>${esc(ph.en)}</small></span></button>`
        : `<div class="phrase"><span>${esc(ph.pt)}<br><span class="small muted">${esc(ph.en)}</span></span>${play(ph.pt)}</div>`).join('')}</div>
      ${choosing ? `<p class="small muted" style="margin:10px 0 6px">Tap the phrase you used or heard: it goes into your reviews.</p><button class="btn ghost block" data-act="ms-pick" data-k="${esc(m.id)}" data-i="-1">None of these, just mark it done</button>`
        : done ? '' : `<div class="row" style="margin-top:12px"><button class="btn primary" style="flex:1" data-act="ms-done" data-k="${esc(m.id)}">I did it ✓</button><button class="btn ghost" data-act="ms-skip" data-k="${esc(m.id)}">Swap</button></div>`}</div>`;
  }
  V.missoes = function (el) {
    const w = week(); const list = weekMissions(); const st = S().missions;
    const extra = MS.extra && MI[MS.extra] && !list.includes(MI[MS.extra]) ? MI[MS.extra] : null;
    const past = MISSIONS.filter(m => (st[m.id] || {}).done).sort((a, b) => st[b.id].done - st[a.id].done);
    el.innerHTML = `<div class="hero"><div><h1>Missões</h1><div class="muted">Three small real-life quests this week. Do them in Portuguese, even when people switch to English.</div></div>
        <span class="badge acc">${P.missionsWeekDone()}/3 this week</span></div>
      ${extra ? missionCard(extra, w) : ''}${list.map(m => missionCard(m, w)).join('')}
      <details class="card flat"><summary>All missions (${MISSIONS.length})</summary><div style="margin-top:10px">${MISSIONS.map(m => `<a class="list-item" href="#" data-act="ms-show" data-k="${esc(m.id)}" style="text-decoration:none;color:inherit"><span>${esc(m.title)}<br><span class="small muted">${esc(m.en)}</span></span><span class="tiny">${(st[m.id] || {}).done ? '✓ ' + new Date(st[m.id].done).toLocaleDateString('pt-PT') : ''}</span></a>`).join('')}</div></details>
      ${past.length ? `<p class="small muted">${past.length} mission${past.length > 1 ? 's' : ''} done so far.</p>` : ''}`;
  };
  act['ms-done'] = b => { MS.open = b.dataset.k; P.render(); };
  act['ms-pick'] = b => {
    const m = MI[b.dataset.k]; const i = +b.dataset.i; const s = S();
    s.missions[m.id] = { done: now(), phrase: i };
    if (i >= 0) { const ph = m.phrases[i]; if (!Object.values(s.notes).some(n => n.pt === ph.pt)) P.addNote({ type: 'word', pt: ph.pt, en: ph.en, src: 'life' }); }
    P.bump('mission'); MS.open = null; Store.change({ silent: true }); P.render();
    P.toast(i >= 0 ? 'Feito! The phrase is in your reviews.' : 'Feito!');
  };
  act['ms-skip'] = b => { const s = S(); s.missions[b.dataset.k] = Object.assign({}, s.missions[b.dataset.k] || {}, { skip: week().key }); Store.change({ silent: true }); P.render(); };
  act['ms-show'] = b => { MS.extra = b.dataset.k; P.render(); window.scrollTo(0, 0); };
  P.leave.missoes = () => { MS = { open: null, extra: null }; };
})(Pois);
