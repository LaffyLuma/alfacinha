/* Today, partner mode, writing, grammar, capture, progress, settings, more. */
(function (P) {
  const { S, esc, ICON, TTS } = P;
  const V = P.views, act = P.actions;

  const TIPS = [
    'When someone switches to English, try: <b>"Podemos falar em português? Estou a aprender."</b>',
    'Order in Portuguese even when it\'s slower. Cafés are the best free practice in Lisbon.',
    'Put one show or podcast a week in Portuguese. RTP Play is free and European.',
    'Say your sentences out loud. Speaking is a separate skill from reading.',
    'After class, spend 5 minutes in <b>Capture</b>. That turns the lesson into reviews for the next weeks.',
    'Stuck mid-sentence? Say <b>"Como se diz…?"</b> instead of switching to English.',
    'Shadowing: play a 15-second clip and speak along with it, a split second behind. Do it 3–5 times.',
    'If a card feels easy, your memory is not being stretched. Effortful recall is what makes it stick.',
    'Learn a Portuguese song. Music is an unusually strong memory hook, especially for a musician.',
    'Set your phone to Português (Portugal) for a week. You already know where everything is.',
  ];
  const dayIndex = () => Math.floor((Date.now() - new Date(2026, 0, 1)) / P.DAY);

  // ======================= TODAY =======================
  V.today = function (el) {
    const s = S(), d = P.dayRec();
    const due = P.dueIds().length, fresh = Math.min(P.newLeft(), P.newIds(P.newLeft()).length);
    const reviewsDone = (d.rev || 0) > 0 && due === 0;
    const hr = new Date().getHours();
    const greet = hr < 12 ? 'Bom dia' : hr < 20 ? 'Boa tarde' : 'Boa noite';
    const prompt = PROMPTS[dayIndex() % PROMPTS.length];
    const first = !Object.keys(s.cards).length && !Object.keys(s.conj).length;
    const items = [
      { done: reviewsDone || (due + fresh === 0 && (d.rev || 0) > 0), t: 'Reviews', d: due + fresh ? `${due} due · ${fresh} new` : ((d.rev || 0) ? `${d.rev} done today` : 'nothing due'), href: '#/review', go: 'rv-start', btn: due + fresh ? 'Start' : 'Open' },
      { done: (d.sprints || 0) > 0, t: 'Verb sprint', d: `${s.settings.sprintLen} quick forms · ${s.settings.tenses.map(k => Conj.TENSE[k].pt.replace('Pretérito ', '')).join(', ')}`, href: '#/gym', go: 'gym-start', btn: 'Start' },
      { done: (d.drillSessions || 0) > 0, t: 'Context drill', d: 'Pick the right tense in real sentences', href: '#/drills', go: 'drill-start', btn: 'Start' },
      { done: (d.write || 0) > 0, t: 'Say or write it', d: esc(prompt.pt), href: '#/write', btn: 'Open' },
    ];
    const doneCount = items.filter(i => i.done).length;
    el.innerHTML = `
      <div class="hero"><div><div class="muted small">${new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</div><h1>${greet}, ${esc(s.settings.name || '')}!</h1></div>
        <div class="row"><span class="badge acc">🔥 ${P.streak()} day streak</span><span class="badge">${doneCount}/4 today</span></div></div>
      ${first ? `<div class="card" style="border-color:var(--accent)"><h2>Bem-vindo 👋</h2>
        <p>Here's how to use this: <b>20–30 minutes a day</b>, top to bottom. Reviews first (spaced repetition), then a verb sprint, a context drill, and one thing you say or write. Add what you learn in class under <b>Capture</b>, and give your partner the <b>Partner</b> tab.</p>
        <p class="small muted">Everything is saved on this device. ${Store.fsSupported() ? 'On this computer you can also link a save file in your Portuguese folder (Settings → Save file).' : 'Use Settings → Backup to export a save file now and then.'}</p></div>` : ''}
      ${P.Drive.connected() && P.Drive.state.status === 'needsAuth' ? `<div class="card" style="border-color:var(--warn)"><div class="row between"><span>Sync with Google Drive before you start, so you have your latest progress.</span><button class="btn sm primary" data-act="drive-sync">${ICON.cloud} Sync</button></div></div>` : ''}
      <div class="card"><h2>Hoje</h2><ul class="plan">${items.map(i => `<li class="${i.done ? 'done' : ''}">
        <span class="check">${ICON.check}</span><div class="grow"><div class="t">${i.t}</div><div class="d">${i.d}</div></div>
        <a class="btn sm ${i.done ? '' : 'primary'}" href="${i.href}" ${i.go ? `data-go="${i.go}"` : ''}>${i.done ? 'Again' : i.btn}</a></li>`).join('')}</ul></div>
      <div class="grid two">
        <div class="card"><h3>Had a class today?</h3><p class="small muted">Capture new words, corrections and phrases while they're fresh. They jump to the front of your new cards.</p><a class="btn" href="#/capture">${ICON.capture} Capture</a></div>
        <div class="card"><h3>Português a dois</h3><p class="small muted">A 15-minute Portuguese-only game with your partner. Cards, a timer and a notebook for her.</p><a class="btn" href="#/partner">${ICON.partner} Partner mode</a></div>
      </div>
      <div class="tip">💡 ${TIPS[dayIndex() % TIPS.length]}</div>
      ${Store.fileStatus().needsPermission ? `<div class="card" style="margin-top:14px;border-color:var(--warn)"><div class="row between"><span>Your save file needs permission again.</span><button class="btn sm primary" data-act="file-reconnect">Reconnect</button></div></div>` : ''}`;
  };

  // ======================= PARTNER =======================
  let PT = { card: null, running: false, end: 0, mins: 15, tick: null, word: null };
  V.partner = function (el) {
    const s = S();
    if (PT.card) return partnerCard(el);
    const log = s.partnerLog.slice(0, 5);
    el.innerHTML = `
      <div class="hero"><div><h1>Português a dois</h1><div class="muted">For you and your partner. Short, structured, Portuguese-only.</div></div></div>
      ${timerCard()}
      <details class="card" ${s.seenGuide ? '' : 'open'} data-act="guide-seen"><summary>For her: how to help without being a teacher (2-min read)</summary><div class="prose" style="margin-top:12px">${PARTNER_GUIDE}</div></details>
      <h2 style="margin-top:20px">Cards</h2>
      <div class="grid two">${PARTNER_CARDS.map(c => `<div class="card pcard" data-act="p-open" data-k="${c.id}" role="button" tabindex="0">
        <div class="row between"><span class="badge">${esc(c.kind)}</span><span class="tiny">${esc(c.time)}</span></div>
        <h3 style="margin:8px 0 2px">${esc(c.title)}</h3><div class="small muted">${esc(c.en)} · <i>${esc(c.target)}</i></div></div>`).join('')}</div>
      <div class="card" style="margin-top:6px"><h2>Caderno <span class="muted small">(notebook)</span></h2>
        <p class="small muted">3 things per session: a mistake he kept making, a word he was missing, a good phrase you used. They go straight into his reviews.</p>
        ${notebookForm()}</div>
      ${log.length ? `<div class="card flat"><h3>Recent sessions</h3>${log.map(l => `<div class="list-item"><span>${new Date(l.date).toLocaleDateString('pt-PT')} · ${esc(l.title || 'Session')}</span><span class="small muted">${l.minutes} min</span></div>`).join('')}</div>` : ''}`;
    bindTimer();
  };
  function timerCard() {
    const left = PT.running ? Math.max(0, PT.end - Date.now()) : PT.mins * 60000;
    const mm = Math.floor(left / 60000), ss = Math.floor(left % 60000 / 1000);
    return `<div class="card" style="text-align:center">
      <div class="prompt-label">${PT.running ? 'Agora é em português 🇵🇹' : 'Portuguese-only timer'}</div>
      <div class="timer" id="ptimer">${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}</div>
      ${PT.running ? `<button class="btn" data-act="p-stop">Stop</button>` : `<div class="chips" style="justify-content:center;margin:8px 0 12px">${[10, 15, 20, 30].map(m => `<button class="chip ${PT.mins === m ? 'on' : ''}" data-act="p-mins" data-k="${m}">${m} min</button>`).join('')}</div>
        <button class="btn primary" data-act="p-start">Começar</button>`}
      <p class="small muted" style="margin:10px 0 0">Rescue phrases: <b>Como se diz…?</b> · <b>Podes repetir?</b> · <b>Mais devagar, por favor.</b></p></div>`;
  }
  function bindTimer() {
    clearInterval(PT.tick);
    if (!PT.running) return;
    PT.tick = setInterval(() => {
      const el = document.getElementById('ptimer'); const left = PT.end - Date.now();
      if (left <= 0) { clearInterval(PT.tick); finishSession(true); return; }
      if (el) el.textContent = `${String(Math.floor(left / 60000)).padStart(2, '0')}:${String(Math.floor(left % 60000 / 1000)).padStart(2, '0')}`;
    }, 500);
  }
  function finishSession(auto) {
    const mins = Math.max(1, Math.round((Date.now() - PT.started) / 60000));
    PT.running = false; clearInterval(PT.tick);
    S().partnerLog.unshift({ id: P.uid(), date: Date.now(), minutes: mins, title: PT.card ? PARTNER_CARDS.find(c => c.id === PT.card)?.title : (PT.lastCard || 'Conversa') });
    P.bump('partnerMin', mins); Store.change({ silent: true });
    if (auto) { try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { } }
    P.toast(auto ? 'Fim! Back to English. Now fill in the caderno.' : 'Session saved.');
    PT.card = null; location.hash = '#/partner'; P.render();
    setTimeout(() => document.getElementById('nb-mistake')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }
  act['p-mins'] = (b) => { PT.mins = +b.dataset.k; P.render(); };
  act['p-start'] = () => { PT.running = true; PT.started = Date.now(); PT.end = Date.now() + PT.mins * 60000; P.render(); };
  act['p-stop'] = () => finishSession(false);
  act['guide-seen'] = () => { if (!S().seenGuide) { S().seenGuide = true; Store.change({ silent: true }); } };
  act['p-open'] = (b) => { PT.card = b.dataset.k; PT.lastCard = PARTNER_CARDS.find(c => c.id === PT.card).title; PT.word = null; P.render(); window.scrollTo(0, 0); };
  act['p-close'] = () => { PT.card = null; P.render(); };
  act['p-word'] = () => {
    const seen = Object.values(S().cards).filter(c => c.state > 0 && c.id.startsWith('v:')).map(c => P.parseId(c.id).ref);
    const pool = seen.length >= 15 ? seen : VOCAB.slice(0, 200).map(e => e[0]);
    PT.word = pool[Math.floor(Math.random() * pool.length)]; P.render();
  };
  function partnerCard(el) {
    const c = PARTNER_CARDS.find(x => x.id === PT.card);
    const phrase = t => `<div class="phrase"><span>${esc(t)}</span><button class="iconbtn" data-act="say" data-say="${esc(t)}" aria-label="Listen">${ICON.speaker}</button></div>`;
    el.innerHTML = `<div class="study" style="max-width:720px">
      <button class="btn ghost sm" data-act="p-close">← All cards</button>
      <div class="card" style="margin-top:10px"><div class="row between"><span class="badge">${esc(c.kind)} · ${esc(c.time)}</span><span class="badge acc">${esc(c.target)}</span></div>
        <h1 style="margin:10px 0 2px">${esc(c.title)}</h1><div class="muted">${esc(c.en)}</div>
        <div class="tip" style="margin-top:14px"><b>For her:</b> ${esc(c.forHer)}</div></div>
      ${timerCard()}
      ${c.tabu ? `<div class="card" style="text-align:center"><div class="prompt-label">Secret word</div>${PT.word ? `<div class="big" style="font-size:2rem;font-weight:800">${esc(PT.word)}</div><div class="small muted">${esc(P.VOC[PT.word]?.[1] || '')}</div>` : '<p class="muted">Tap to get a word from his deck. Don\'t let him see!</p>'}<button class="btn" data-act="p-word" style="margin-top:10px">Pick a word</button></div>` : ''}
      <div class="grid two"><div class="card"><h3>Her questions / lines</h3>${c.starters.map(phrase).join('')}</div>
        <div class="card"><h3>Useful for him</h3>${c.him.map(phrase).join('')}</div></div></div>`;
    bindTimer();
  }
  function notebookForm() {
    return `<div class="grid two">
      <div><label class="field"><span>He said (mistake)</span><input type="text" id="nb-mistake" placeholder="Ontem eu ia ao mercado"></label>
        <label class="field"><span>Correct version</span><input type="text" id="nb-fix" placeholder="Ontem fui ao mercado"></label></div>
      <div><label class="field"><span>Word he was missing (PT)</span><input type="text" id="nb-word" placeholder="o agrafador"></label>
        <label class="field"><span>…meaning (EN)</span><input type="text" id="nb-wordEn" placeholder="stapler"></label></div>
      <div><label class="field"><span>Good phrase you used (PT)</span><input type="text" id="nb-phrase" placeholder="Deixa estar"></label>
        <label class="field"><span>…meaning (EN)</span><input type="text" id="nb-phraseEn" placeholder="Never mind"></label></div></div>
      <button class="btn primary" data-act="nb-save">Save to his reviews</button>`;
  }
  act['nb-save'] = () => {
    const g = id => (document.getElementById(id)?.value || '').trim();
    let n = 0;
    if (g('nb-mistake') && g('nb-fix')) { addNote({ type: 'fix', pt: g('nb-mistake'), fix: g('nb-fix'), src: 'partner' }); n++; }
    if (g('nb-word') && g('nb-wordEn')) { addNote({ type: 'word', pt: g('nb-word'), en: g('nb-wordEn'), src: 'partner' }); n++; }
    if (g('nb-phrase') && g('nb-phraseEn')) { addNote({ type: 'word', pt: g('nb-phrase'), en: g('nb-phraseEn'), src: 'partner' }); n++; }
    if (!n) { P.toast('Fill in a pair (PT + EN, or mistake + fix).'); return; }
    Store.change(); P.toast(`Saved ${n} item${n > 1 ? 's' : ''}. Obrigado! 💙`);
  };
  function addNote(o) { const id = P.uid(); S().notes[id] = Object.assign({ id, date: Date.now(), ex: '', exEn: '', en: '' }, o); return id; }
  P.addNote = addNote;

  // ======================= WRITE =======================
  let WP = null;
  V.write = function (el) {
    const s = S();
    if (WP == null) WP = dayIndex() % PROMPTS.length;
    const p = PROMPTS[WP];
    const draft = s.draft && s.draft.prompt === WP ? s.draft.text : '';
    el.innerHTML = `
      <div class="hero"><div><h1>Escrever e falar</h1><div class="muted">Pushed output: produce the language, notice the gaps. Write it, then read it out loud.</div></div></div>
      <div class="card"><div class="row between"><span class="badge acc">${esc(p.target)}</span><button class="btn ghost sm" data-act="w-shuffle">Another prompt ↻</button></div>
        <h2 style="margin:12px 0 4px">${esc(p.pt)}</h2><div class="muted small">${esc(p.en)}</div>
        <textarea id="wtext" style="margin-top:14px" placeholder="Escreve aqui… (5–8 sentences is perfect)">${esc(draft)}</textarea>
        ${P.accentBar('wtext')}
        <div class="row between" style="margin-top:12px"><span class="small muted" id="wcount"></span>
          <div class="row"><button class="btn" data-act="w-listen">${ICON.speaker} Hear it</button><button class="btn" data-act="w-copy">Copy for corrections</button><button class="btn primary" data-act="w-save">Save</button></div></div>
        <details style="margin-top:14px"><summary class="small">Self-check before saving</summary><ul class="small prose" style="margin-top:8px">
          <li>Did you use the target structure at least 3 times?</li><li>Perfeito for events, imperfeito for background and habits?</li><li>Object pronouns after the verb (EP): <i>levantei-me</i>, <i>disse-lhe</i>?</li><li>Now read it <b>out loud</b> twice. Speaking is its own skill.</li></ul></details>
        <p class="tiny" style="margin-top:10px">"Copy for corrections" copies the prompt and your text with a request to correct it, ready to paste to your partner, your teacher, or Claude.</p></div>
      ${s.journal.length ? `<div class="card flat"><h3>Diário</h3>${s.journal.slice(0, 10).map(j => `<details class="list-item" style="display:block"><summary>${new Date(j.date).toLocaleDateString('pt-PT')} · ${esc(j.prompt)}</summary><p style="white-space:pre-wrap;margin-top:8px">${esc(j.text)}</p></details>`).join('')}</div>` : ''}`;
    const ta = el.querySelector('#wtext'); const wc = el.querySelector('#wcount');
    const upd = () => { const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0; wc.textContent = `${n} words`; };
    upd();
    ta.addEventListener('input', () => { upd(); s.draft = { prompt: WP, text: ta.value }; Store.change({ silent: true }); });
  };
  act['w-shuffle'] = () => { WP = (WP + 1 + Math.floor(Math.random() * (PROMPTS.length - 1))) % PROMPTS.length; P.render(); };
  act['w-listen'] = () => TTS.speak(document.getElementById('wtext').value);
  act['w-copy'] = async () => {
    const t = document.getElementById('wtext').value.trim(); if (!t) return;
    const msg = `Can you correct my European Portuguese (A2/B1)? Show the corrected version, then list each mistake briefly with why.\n\nPrompt: ${PROMPTS[WP].pt}\n\n${t}`;
    try { await navigator.clipboard.writeText(msg); P.toast('Copied.'); } catch (e) { P.toast('Copy failed: select the text manually.'); }
  };
  act['w-save'] = () => {
    const t = document.getElementById('wtext').value.trim(); if (!t) { P.toast('Write something first 🙂'); return; }
    const s = S(); s.journal.unshift({ id: P.uid(), date: Date.now(), prompt: PROMPTS[WP].pt, text: t }); s.draft = null;
    P.bump('write'); Store.change(); P.toast('Guardado! Now read it out loud.');
  };

  // ======================= GRAMMAR =======================
  let GR = null;
  V.grammar = function (el) {
    if (GR) {
      const g = GRAMMAR.find(x => x.id === GR);
      const drillBtn = g.drill ? (DRILL_SETS[g.drill] ? `<button class="btn primary" data-act="g-drill" data-k="${g.drill}">Practise: ${esc(DRILL_SETS[g.drill].name)}</button>` : `<button class="btn primary" data-act="g-gym" data-k="${g.drill}">Practise in verb sprints</button>`) : '';
      el.innerHTML = `<div class="study" style="max-width:760px"><button class="btn ghost sm" data-act="g-back">← All notes</button>
        <div class="card" style="margin-top:10px"><span class="badge acc">${esc(g.lvl)}</span><h1 style="margin-top:8px">${esc(g.title)}</h1><div class="prose tablewrap">${g.html}</div>
        <div class="row" style="margin-top:14px">${drillBtn}</div></div></div>`;
      return;
    }
    el.innerHTML = `<div class="hero"><div><h1>Gramática</h1><div class="muted">Short explanations for English speakers, each linked to a drill. Read the rule, then practise it.</div></div></div>
      <div class="card">${GRAMMAR.map(g => `<a class="list-item" href="#" data-act="g-open" data-k="${g.id}" style="text-decoration:none;color:inherit"><span><b>${esc(g.title)}</b></span><span class="badge">${esc(g.lvl)}</span></a>`).join('')}</div>`;
  };
  act['g-open'] = (b) => { GR = b.dataset.k; P.render(); window.scrollTo(0, 0); };
  act['g-back'] = () => { GR = null; P.render(); };
  act['g-drill'] = (b) => { GR = null; P.startDrill(b.dataset.k); };
  act['g-gym'] = (b) => { const k = b.dataset.k; S().settings.tenses = [k]; Store.change({ silent: true }); GR = null; location.hash = '#/gym'; };

  // ======================= CAPTURE =======================
  let capType = 'word';
  V.capture = function (el) {
    const s = S(); const notes = Object.values(s.notes).sort((a, b) => b.date - a.date);
    el.innerHTML = `<div class="hero"><div><h1>Capture</h1><div class="muted">New words, corrections and phrases from class, your partner or the street. They come up first in your new cards.</div></div></div>
      <div class="card"><div class="chips" style="margin-bottom:14px">${[['word', 'Word / phrase'], ['fix', 'Mistake → correction'], ['bulk', 'Paste a list']].map(([k, l]) => `<button class="chip ${capType === k ? 'on' : ''}" data-act="cap-type" data-k="${k}">${l}</button>`).join('')}</div>
      ${capType === 'word' ? `<div class="grid two"><label class="field"><span>Portuguese *</span><input type="text" id="c-pt" placeholder="desenrascar"></label><label class="field"><span>English *</span><input type="text" id="c-en" placeholder="to improvise a solution"></label></div>
        <div class="grid two"><label class="field"><span>Example sentence (PT, optional)</span><input type="text" id="c-ex" placeholder="Lá nos desenrascámos."></label><label class="field"><span>Example (EN, optional)</span><input type="text" id="c-exEn" placeholder="We managed somehow."></label></div>` : ''}
      ${capType === 'fix' ? `<label class="field"><span>What I said / wrote *</span><input type="text" id="c-pt" placeholder="Eu tenho visto esse filme ontem."></label><label class="field"><span>Correct version *</span><input type="text" id="c-fix" placeholder="Eu vi esse filme ontem."></label><label class="field"><span>Note (optional)</span><input type="text" id="c-en" placeholder="perfeito composto ≠ have done"></label>` : ''}
      ${capType === 'bulk' ? `<label class="field"><span>One per line: <code>portuguese = english</code> (also accepts ; or tab)</span><textarea id="c-bulk" placeholder="o agrafador = stapler\nter jeito para = to be good at\nmeter água = to mess up"></textarea></label>` : ''}
      ${capType !== 'bulk' ? P.accentBar('c-pt') : ''}
      <div class="row" style="margin-top:12px"><label class="row small" style="gap:6px">Source <select id="c-src" style="width:auto;min-height:36px;padding:4px 8px"><option value="class">Class</option><option value="partner">Partner</option><option value="life">Life</option></select></label>
        <button class="btn primary" data-act="cap-save">Add</button></div></div>
      <div class="card flat"><div class="row between"><h3 style="margin:0">Captured (${notes.length})</h3></div>
        ${notes.length ? notes.slice(0, 60).map(n => `<div class="list-item"><div><b>${esc(n.type === 'fix' ? n.fix : n.pt)}</b>${n.type === 'fix' ? ` <span class="small muted">(not: ${esc(n.pt)})</span>` : ` · <span class="muted">${esc(n.en)}</span>`}<div class="tiny">${esc(n.src)} · ${new Date(n.date).toLocaleDateString('pt-PT')}</div></div>
          <button class="btn ghost sm danger" data-act="cap-del" data-k="${n.id}">Delete</button></div>`).join('') : '<p class="small muted">Nothing yet. After tomorrow\'s class, add 5–10 things here.</p>'}</div>`;
  };
  act['cap-type'] = (b) => { capType = b.dataset.k; P.render(); };
  act['cap-save'] = () => {
    const g = id => (document.getElementById(id)?.value || '').trim(); const src = g('c-src') || 'class';
    if (capType === 'word') { if (!g('c-pt') || !g('c-en')) return P.toast('Portuguese and English are needed.'); addNote({ type: 'word', pt: g('c-pt'), en: g('c-en'), ex: g('c-ex'), exEn: g('c-exEn'), src }); }
    else if (capType === 'fix') { if (!g('c-pt') || !g('c-fix')) return P.toast('Add both versions.'); addNote({ type: 'fix', pt: g('c-pt'), fix: g('c-fix'), en: g('c-en'), src }); }
    else {
      const lines = g('c-bulk').split('\n').map(l => l.trim()).filter(Boolean); let n = 0;
      lines.forEach(l => { const m = l.split(/\s*(?:=|;|\t|\s-\s|\s–\s)\s*/); if (m.length >= 2 && m[0] && m[1]) { addNote({ type: 'word', pt: m[0], en: m.slice(1).join(' / '), src }); n++; } });
      if (!n) return P.toast('Nothing recognised. Use "pt = en" per line.');
      P.toast(`Added ${n}.`);
    }
    Store.change(); if (capType !== 'bulk') P.toast('Added. It\'ll show up in your next review session.');
  };
  act['cap-del'] = (b) => { const s = S(); (s.deleted = s.deleted || { notes: {} }).notes[b.dataset.k] = Date.now(); delete s.notes[b.dataset.k]; for (const id of Object.keys(s.cards)) if (id.startsWith('n:' + b.dataset.k + ':')) delete s.cards[id]; Store.change(); };

  // ======================= PROGRESS =======================
  V.progress = function (el) {
    const s = S(), now = Date.now();
    const cards = Object.values(s.cards).filter(c => P.exists(c.id));
    const vocabKnown = cards.filter(c => c.state === 2 && /:rec$/.test(c.id) && (c.s >= 21 || c.known)).length;
    const learning = cards.filter(c => c.state === 1 || (c.state === 2 && c.s < 21)).length;
    const mature = cards.filter(c => c.state === 2 && c.s >= 21).length;
    const keys = []; const d0 = new Date(); for (let i = 29; i >= 0; i--) { const d = new Date(d0); d.setDate(d.getDate() - i); keys.push(P.todayKey(d)); }
    const act30 = keys.map(k => { const r = s.days[k] || {}; return (r.rev || 0) + (r.conj || 0) + (r.drill || 0); });
    const max = Math.max(1, ...act30);
    let revN = 0, revOk = 0; keys.forEach(k => { const r = s.days[k] || {}; revN += r.revN || 0; revOk += r.revOk || 0; });
    const tenses = Conj.TENSES.filter(t => s.settings.tenses.includes(t.k) || Object.keys(s.conj).some(k => k.endsWith('|' + t.k)));
    const verbs = VERBS.filter(v => v.set === 'irr' || tenses.some(t => s.conj[v.v + '|' + t.k])).map(v => v.v).slice(0, 45);
    const color = m => m == null ? '' : `background: ${m >= 0.7 ? 'var(--good)' : m >= 0.4 ? 'var(--warn)' : 'var(--bad)'}; opacity:${(0.45 + Math.abs(m - 0.5) * 1.1).toFixed(2)}`;
    const weak = Object.entries(s.conj).filter(([, x]) => x.n >= 2).map(([k, x]) => ({ k, x, m: P.mastery(...k.split('|')) })).sort((a, b) => a.m - b.m).slice(0, 8);
    const suspended = cards.filter(c => c.suspended);
    const drillStats = Object.entries(DRILL_SETS).map(([k, set]) => { let n = 0, ok = 0; DRILLS.filter(d => d.set === k).forEach(d => { const x = s.drills[k + '|' + d.s]; if (x) { n += x.n; ok += x.ok; } }); return { name: set.name, n, ok }; });
    el.innerHTML = `<div class="hero"><div><h1>Progresso</h1><div class="muted">What's sticking and what needs work.</div></div></div>
      <div class="grid three">
        <div class="stat"><div class="n">${P.streak()}</div><div class="l">day streak</div></div>
        <div class="stat"><div class="n">${vocabKnown}</div><div class="l">words & phrases known well</div></div>
        <div class="stat"><div class="n">${revN ? Math.round(revOk / revN * 100) + '%' : '–'}</div><div class="l">review recall (30 days)</div></div>
        <div class="stat"><div class="n">${learning}</div><div class="l">cards learning</div></div>
        <div class="stat"><div class="n">${mature}</div><div class="l">mature cards (21d+)</div></div>
        <div class="stat"><div class="n">${Object.values(s.conj).reduce((a, x) => a + x.n, 0)}</div><div class="l">verb forms typed</div></div>
      </div>
      <div class="card" style="margin-top:14px"><h3>Last 30 days</h3><div class="bars">${act30.map((v, i) => `<div class="${v ? '' : 'zero'}" style="height:${Math.max(3, v / max * 100)}%" title="${keys[i]}: ${v}"></div>`).join('')}</div>
        <div class="row between tiny" style="margin-top:4px"><span>${keys[0].slice(5)}</span><span>today</span></div></div>
      <div class="card"><h3>Verb mastery</h3><p class="small muted">Accuracy × speed per verb and tense. <span style="color:var(--good)">■</span> solid · <span style="color:var(--warn)">■</span> getting there · <span style="color:var(--bad)">■</span> needs work · grey = not practised yet.</p>
        <div class="tablewrap"><table class="heat"><tr><th></th>${tenses.map(t => `<th>${esc(t.pt.replace('Pretérito ', 'P. ').replace('Conjuntivo ', 'Conj. '))}</th>`).join('')}</tr>
        ${verbs.map(v => `<tr><td class="v">${esc(v)}</td>${tenses.map(t => { const m = P.mastery(v, t.k); const x = s.conj[v + '|' + t.k]; return `<td class="c" style="${color(m)}" title="${x ? `${x.ok}/${x.n} · ${(x.ms / 1000).toFixed(1)}s` : 'not practised'}"></td>`; }).join('')}</tr>`).join('')}</table></div></div>
      <div class="grid two">
        <div class="card"><h3>Weakest verb forms</h3>${weak.length ? `<ul class="summary-list">${weak.map(w => { const [v, t] = w.k.split('|'); return `<li><span>${esc(v)} · <span class="small muted">${esc(Conj.TENSE[t].pt)}</span></span><span class="small">${Math.round(w.x.ok / w.x.n * 100)}% · ${(w.x.ms / 1000).toFixed(1)}s</span></li>`; }).join('')}</ul>` : '<p class="small muted">Do a few sprints first.</p>'}</div>
        <div class="card"><h3>Context drills</h3><ul class="summary-list">${drillStats.map(d => `<li><span>${esc(d.name)}</span><span class="small">${d.n ? Math.round(d.ok / d.n * 100) + '% of ' + d.n : '–'}</span></li>`).join('')}</ul></div>
      </div>
      ${suspended.length ? `<div class="card flat"><h3>Suspended cards (${suspended.length})</h3>${suspended.slice(0, 30).map(c => `<div class="list-item"><span class="small">${esc(P.parseId(c.id).ref)} <span class="tiny">${esc(P.parseId(c.id).dir)}</span></span><button class="btn sm" data-act="unsuspend" data-k="${esc(c.id)}">Restore</button></div>`).join('')}</div>` : ''}`;
  };
  act['unsuspend'] = (b) => { const c = S().cards[b.dataset.k]; if (c) { delete c.suspended; Store.change(); } };

  // ======================= SETTINGS =======================
  V.settings = function (el) {
    const s = S(), st = s.settings, fs = Store.fileStatus();
    const voices = TTS.voices;
    el.innerHTML = `<div class="hero"><div><h1>Definições</h1></div></div>
      ${driveCard()}
      <div class="card"><h2>Save file</h2>
        <p class="small muted">Your progress is always saved in this browser. ${Store.fsSupported() ? 'On this computer you can also link a file (e.g. <b>E:\\Portuguese - Claude\\pois-progress.json</b>). The app then saves to it automatically, so you have a real file you can back up or copy to your phone.' : 'This browser can\'t auto-save to a file (normal on phones). Use Backup below to export a save file and import it on another device.'}</p>
        ${Store.fsSupported() ? (fs.linked ? `<div class="note-good" style="margin-bottom:10px">Linked to <b>${esc(fs.name)}</b>${fs.lastSaved ? ` · saved ${new Date(fs.lastSaved).toLocaleTimeString('pt-PT')}` : ''}</div>
          ${fs.needsPermission ? `<button class="btn primary" data-act="file-reconnect">Reconnect (permission)</button>` : ''}${fs.error ? `<div class="note-bad small">${esc(fs.error)}</div>` : ''}
          <div class="row" style="margin-top:8px"><button class="btn" data-act="file-savenow">Save now</button><button class="btn ghost" data-act="file-unlink">Unlink</button></div>`
          : `<div class="row"><button class="btn primary" data-act="file-new">Create save file…</button><button class="btn" data-act="file-open">Open existing save file…</button></div>`) : ''}
      </div>
      <div class="card"><h2>Backup & move between devices</h2>
        <p class="small muted">Export downloads a <code>.json</code> file. On the other device, Import it: <b>Merge</b> keeps the most recent progress for every card, so phone and computer can both be used.</p>
        <div class="row"><button class="btn" data-act="exp">Export backup</button><label class="btn">Import (merge)…<input type="file" accept=".json,application/json" data-import="merge" hidden></label><label class="btn ghost">Import (replace)…<input type="file" accept=".json,application/json" data-import="replace" hidden></label></div></div>
      <div class="card"><h2>Study</h2>
        <div class="grid two">
          <label class="field"><span>Your name</span><input type="text" data-set="name" value="${esc(st.name)}"></label>
          <label class="field"><span>New cards per day</span><input type="number" min="0" max="50" data-set="newPerDay" value="${st.newPerDay}"></label>
          <label class="field"><span>Target recall (%) · higher = more reviews</span><input type="number" min="75" max="97" data-set="retention" value="${Math.round(st.retention * 100)}"></label>
          <label class="field"><span>Max reviews per session</span><input type="number" min="20" max="999" data-set="maxReviews" value="${st.maxReviews}"></label>
          <label class="field"><span>Context drill length</span><input type="number" min="5" max="40" data-set="drillLen" value="${st.drillLen}"></label>
          <label class="field"><span>One expression every N words</span><input type="number" min="1" max="20" data-set="chunkEvery" value="${st.chunkEvery}"></label>
        </div>
        <label class="row" style="flex-wrap:nowrap;gap:10px;margin-bottom:8px"><input type="checkbox" data-set="strictAccents" ${st.strictAccents ? 'checked' : ''} style="width:20px;height:20px"> Strict accents (missing accents count as wrong)</label>
        <label class="row" style="flex-wrap:nowrap;gap:10px"><input type="checkbox" data-set="autoplay" ${st.autoplay ? 'checked' : ''} style="width:20px;height:20px"> Play audio automatically</label></div>
      <div class="card"><h2>Voice</h2>
        ${voices.length ? '' : '<div class="note-warn small">No Portuguese voice found on this device.</div>'}
        ${voices.length && !TTS.hasPT() ? '<div class="note-warn small">Only a Brazilian voice was found. For European Portuguese, see below.</div>' : ''}
        <div class="grid two" style="margin-top:10px"><label class="field"><span>Voice</span><select data-set="voice"><option value="">Automatic (prefers pt-PT)</option>${voices.map(v => `<option value="${esc(v.name)}" ${st.voice === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>
          <label class="field"><span>Speed</span><input type="number" step="0.05" min="0.5" max="1.3" data-set="rate" value="${st.rate}"></label></div>
        <button class="btn" data-act="say" data-say="Olá! Hoje fui ao mercado e comprei pão, queijo e fruta.">${ICON.speaker} Test voice</button>
        <details style="margin-top:12px"><summary class="small">How to get a European Portuguese voice</summary><div class="small prose" style="margin-top:8px"><ul>
          <li><b>Windows:</b> Settings → Time & language → Language & region → Add a language → <i>Português (Portugal)</i> and tick <i>Text-to-speech</i>. Restart the browser. In <b>Edge</b>, the online "Raquel/Duarte (Natural)" voices sound best.</li>
          <li><b>Android:</b> Settings → search <i>Text-to-speech</i> → Google engine → Install voice data → <i>Português (Portugal)</i>.</li></ul></div></details></div>
      <div class="card"><h2>About</h2><p class="small muted">Alfacinha Incubator uses FSRS spaced repetition (the algorithm in modern Anki), retrieval practice, interleaving and pushed output. Content: ${VOCAB.length} words in European Portuguese sentences, ${CHUNKS.length} expressions, ${VERBS.length} verbs × ${Conj.TENSES.length} tenses, ${DRILLS.length} context drills, ${GRAMMAR.length} grammar notes, ${PARTNER_CARDS.length} partner cards.</p>
        <button class="btn ghost danger sm" data-act="reset">Reset all progress…</button></div>`;
    el.querySelectorAll('[data-set]').forEach(inp => inp.addEventListener('change', () => {
      const k = inp.dataset.set; let v = inp.type === 'checkbox' ? inp.checked : inp.value;
      if (inp.type === 'number') { v = parseFloat(v); if (isNaN(v)) return; if (k === 'retention') v = Math.min(0.97, Math.max(0.75, v / 100)); }
      st[k] = v; Store.change({ silent: true }); P.toast('Saved');
    }));
    el.querySelectorAll('[data-import]').forEach(inp => inp.addEventListener('change', async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        const obj = JSON.parse(await f.text());
        if (!Store.validate(obj)) throw new Error('Not an Alfacinha save file');
        if (inp.dataset.import === 'replace') { if (!await P.confirm('Replace ALL progress on this device with this file?')) return; Store.replace(obj); }
        else Store.replace(Store.merge(Store.get(), obj));
        P.toast('Imported.');
      } catch (e) { P.toast('Import failed: ' + e.message); }
    }));
  };
  function driveCard() {
    const D = P.Drive;
    if (!D.usable()) return `<div class="card"><h2>Google Drive sync</h2><p class="small muted">Drive sync only works when the app is opened from its web address (for example your GitHub Pages link), not from the file on your hard drive. See the README.</p></div>`;
    if (!D.connected()) return `<div class="card" style="border-color:var(--accent)"><h2>Google Drive sync</h2>
      <p class="small muted">Keep phone, PC and any other computer in sync through <b>your own Google Drive</b>. The app only gets access to a hidden folder of its own, never your other files.</p>
      ${D.clientId() ? `<button class="btn primary" data-act="drive-connect">${ICON.cloud} Connect Google Drive</button>
        <details style="margin-top:10px"><summary class="small">Client ID</summary><div class="row" style="margin-top:8px"><input type="text" id="gcid" value="${esc(D.clientId())}"><button class="btn sm" data-act="drive-client">Save</button></div></details>`
      : `<p class="small">First, create a free Google client ID (one-time, ~10 min, steps in the README), then paste it here or into <code>config.js</code>:</p>
        <div class="row" style="flex-wrap:nowrap"><input type="text" id="gcid" placeholder="1234567890-abc….apps.googleusercontent.com"><button class="btn" data-act="drive-client">Save</button></div>`}</div>`;
    return `<div class="card"><h2>Google Drive sync</h2>
      <div class="${D.state.status === 'error' ? 'note-bad' : D.state.status === 'needsAuth' || D.state.status === 'offline' ? 'note-warn' : 'note-good'}" id="drive-status" style="margin-bottom:8px">${esc(D.statusText())}</div>
      ${D.state.error ? `<p class="small muted">${esc(D.state.error)}</p>` : ''}
      <p class="small muted">Syncs automatically a few seconds after you study, and whenever you open the app. Sign-ins last about an hour; after that, one tap on "Sync" refreshes it.</p>
      <div class="row"><button class="btn primary" data-act="drive-sync">${ICON.cloud} Sync now</button><button class="btn ghost" data-act="drive-disconnect">Disconnect</button></div></div>`;
  }
  act['drive-client'] = () => { const v = (document.getElementById('gcid').value || '').trim(); if (v && !/\.apps\.googleusercontent\.com$/.test(v)) { P.toast('That doesn\'t look like a client ID (…apps.googleusercontent.com).'); return; } P.Drive.setClientId(v); P.toast('Saved.'); P.render(); };
  act['drive-connect'] = async () => { try { await P.Drive.connect(); P.toast('Google Drive connected.'); } catch (e) { P.toast(e.message); } P.render(); };
  act['drive-sync'] = async () => { await P.Drive.sync({ interactive: true }); if (P.Drive.state.status === 'ok') P.toast('Synced.'); else if (P.Drive.state.error) P.toast(P.Drive.state.error); P.render(); };
  act['drive-disconnect'] = async () => { if (await P.confirm('Stop syncing this device with Google Drive? Your progress stays on this device and in Drive.')) { P.Drive.disconnect(); P.render(); } };
  act['exp'] = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(Store.exportBlob());
    a.download = `pois-backup-${P.todayKey()}.json`; document.body.appendChild(a); a.click(); a.remove();
  };
  act['file-new'] = async () => { try { await Store.linkNewFile(); P.toast('Save file linked.'); } catch (e) { if (e.name !== 'AbortError') P.toast(e.message); } };
  act['file-open'] = async () => {
    try {
      const obj = await Store.linkExistingFile();
      if (obj && Store.validate(obj)) { Store.replace(Store.merge(Store.get(), obj)); P.toast('Loaded and merged. Auto-saving to this file now.'); }
      else { await Store.saveFile(); P.render(); }
    } catch (e) { if (e.name !== 'AbortError') P.toast(e.message); }
  };
  act['file-reconnect'] = async () => { const ok = await Store.reconnect(); P.toast(ok ? 'Reconnected.' : 'Permission not granted.'); P.render(); };
  act['file-savenow'] = async () => { await Store.saveFile(); P.toast('Saved.'); P.render(); };
  act['file-unlink'] = async () => { await Store.unlinkFile(); };
  act['reset'] = async () => { if (await P.confirm('Delete ALL progress, cards, notes and journal on this device? Export a backup first if unsure.')) { const f = Store.fresh(); f.resetAt = Date.now(); f.settings = S().settings; Store.replace(f); P.toast('Reset.'); } };

  // ======================= MORE (mobile menu) =======================
  V.more = function (el) {
    const items = [['drills', 'Context drills', 'Perfeito vs imperfeito, ser/estar, conjuntivo'], ['write', 'Escrever', 'Daily speaking & writing prompt'], ['grammar', 'Gramática', 'Short notes + linked drills'], ['capture', 'Capture', 'Add words from class or life'], ['tables', 'Verb tables', 'Every verb, every tense'], ['progress', 'Progresso', 'Stats, verb mastery'], ['settings', 'Definições', 'Save file, backup, voice']];
    el.innerHTML = `<h1>Mais</h1><div class="card menu">${items.map(([k, t, d]) => `<a href="#/${k}">${ICON[k === 'drills' ? 'drills' : k === 'tables' ? 'table' : k]}<span>${t}<small>${d}</small></span></a>`).join('')}</div>`;
  };
})(Pois);
