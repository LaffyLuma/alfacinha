/* Hoje as a planner that decides: a focus for each day of the week (swapped for your weakest pattern when you
   already know it well), two guided ~30-minute blocks (morning fundamentals, evening production) that hand off
   from one activity to the next, and a 5-minute mode. */
(function (P) {
  const { S, esc, ICON } = P;
  const act = P.actions;
  // Monday → Sunday. tenses steer the verb drill; tr = Transformations focus chip; drill = context drill set.
  const WEEK = [
    { k: 'past', label: 'did ↔ was doing / used to', tenses: ['pps', 'pimp'], tr: 'past', drill: 'past' },
    { k: 'pron', label: 'pronouns (dá-me · não lhe dei · já te disse)', tenses: ['pps', 'pres'], tr: 'pron', drill: 'pron' },
    { k: 'would', label: 'would + "if I were"', tenses: ['cond', 'cimp'], tr: 'would', drill: 'hipot' },
    { k: 'lately', label: 'have been doing lately + had done', tenses: ['ppc', 'mqp'], tr: 'all', drill: 'ppc' },
    { k: 'forme', label: '"for me to…" + hei de', tenses: ['infp', 'hav'], tr: 'all', drill: 'infp' },
    { k: 'thati', label: '"that I…" + passive', tenses: ['cpres', 'cfut'], tr: 'passive', drill: 'subj' },
    { k: 'free', label: 'free conversation + a mix of everything', tenses: null, tr: 'all', drill: null },
  ];
  const WEAK = { pps: 'past', pimp: 'past', cond: 'would', cimp: 'would', ppc: 'lately', mqp: 'lately', infp: 'forme', hav: 'forme', cpres: 'thati', cfut: 'thati' };
  const avgMastery = ts => { const ms = []; Object.keys(S().conj).forEach(k => { const [v, t] = k.split('|'); if (ts.includes(t)) { const m = P.mastery(v, t); if (m != null) ms.push(m); } }); return ms.length >= 6 ? ms.reduce((a, b) => a + b, 0) / ms.length : null; };
  // Today's focus. If you already know today's pattern well (≥ 0.8), the weakest B1 pattern takes its place.
  P.todayFocus = function () {
    const f = WEEK[(new Date().getDay() + 6) % 7];
    if (f.tenses) { const m = avgMastery(f.tenses); if (m != null && m >= 0.8 && P.focusTense) { const w = WEEK.find(x => x.k === WEAK[P.focusTense()]); if (w && w !== f) return Object.assign({ swapped: f.label }, w); } }
    return f;
  };
  P.planFocusTenses = () => P.todayFocus().tenses || ['pps', 'pimp', 'ppc', 'cond'];

  // ---------- steps ----------
  // Start an activity without a hashchange (a hashchange stops speech, which would cut off the first prompt).
  const goto = r => { if (P.route() !== r) history.pushState(null, '', '#/' + r); };
  const d = () => P.dayRec();
  const STEPS = {
    review: { t: 'Reviews', min: 10, desc: () => { const due = P.dueIds().length, fr = Math.min(P.newLeft(), P.newIds(P.newLeft()).length); return due + fr ? `${due} due · ${fr} new` : 'nothing due'; },
      done: () => (d().rev || 0) > 0 && P.dueIds().length === 0 || (P.dueIds().length + Math.min(P.newLeft(), P.newIds(P.newLeft()).length) === 0),
      go: () => { goto('review'); act['rv-start'](); } },
    verbs: { t: 'Verbos: say the forms', min: 8, desc: f => `today: ${f.tenses ? f.tenses.map(Conj.label).join(' · ') : 'a mix'}`,
      done: () => (d().vsay || 0) >= 15, go: f => P.startVerbDrill({ minutes: 8, tenses: f.tenses || undefined }) },
    trans: { t: 'Transformations', min: 8, desc: () => 'Hear it, then say it changed', done: () => (d().trans || 0) >= 8,
      go: f => { goto('transform'); P.startTransform(f.tr); } },
    drill: { t: 'Context drill', min: 5, desc: () => 'Pick the right pattern in real sentences', done: () => (d().drillSessions || 0) > 0,
      go: f => P.startDrill(f.drill || 'past') },
    talk: { t: 'Conversation or dialogue', min: 10, desc: () => P.dayIndex() % 2 ? 'Answer out loud about your life' : 'Minus one: play your part out loud', done: () => (d().dialog || 0) + (d().conv || 0) > 0,
      go: () => { if (P.dayIndex() % 2) { goto('conversas'); act['cv-suggest'](); } else { goto('dialogues'); act['dl-nextd'](); } } },
    build: { t: 'Build sentences', min: 8, desc: () => 'English idea → say the whole sentence', done: () => (d().build || 0) >= 8,
      go: f => { goto('construir'); if (P.startBuild) P.startBuild(f); else P.render(); } },
    write: { t: 'Say or write it', min: 7, desc: () => 'Today\'s prompt, out loud', done: () => (d().write || 0) > 0, go: () => { goto('write'); P.render(); } },
    ritmo: { t: 'Ritmo: tempo loop', min: 5, desc: () => 'Shadow one sentence until it\'s at full speed', done: () => (d().ritmo || 0) > 0, go: () => { goto('ritmo'); act['rt-loop'](); } },
  };
  const BLOCKS = {
    am: { t: 'Manhã · fundamentals', steps: ['review', 'verbs', 'trans', 'drill'] },
    pm: { t: 'Noite · production', steps: () => ['talk', P.views.construir ? 'build' : 'trans', 'write', 'ritmo'] },
  };
  const blockSteps = b => typeof BLOCKS[b].steps === 'function' ? BLOCKS[b].steps() : BLOCKS[b].steps;
  P.planProgress = () => { const all = blockSteps('am').concat(blockSteps('pm')); return { done: all.filter(k => STEPS[k].done()).length, total: all.length }; };

  // ---------- guided session ----------
  // One block at a time; each activity's summary calls P.stepDone(kind), which hands off to the next step.
  let SES = null, barTick = null;
  function startStep() {
    const k = blockSteps(SES.block)[SES.i]; SES.stepStart = Date.now();
    P.toast(`${SES.i + 1}/${blockSteps(SES.block).length}: ${STEPS[k].t}`, 1600);
    STEPS[k].go(P.todayFocus());
    P.drawSessionBar();
  }
  function advance() {
    if (!SES) return;
    SES.i++;
    if (SES.i >= blockSteps(SES.block).length) {
      const mins = Math.max(1, Math.round((Date.now() - SES.start) / 60000));
      d()[SES.block === 'am' ? 'amDone' : 'pmDone'] = 1; P.bump('planMin', mins); Store.change({ silent: true });
      SES = null; P.drawSessionBar(); P.toast(`Block done: ${mins} min. Muito bem!`, 3000);
      history.pushState(null, '', '#/today'); P.render(); return;
    }
    startStep();
  }
  P.stepDone = kind => {
    if (!SES) return;
    const k = blockSteps(SES.block)[SES.i];
    if (k === kind || (k === 'talk' && kind === 'talk')) setTimeout(advance, 1200); // let the summary show for a moment
  };
  act['plan-block'] = b => { SES = { block: b.dataset.k, i: 0, start: Date.now() }; startStep(); };
  act['plan-step'] = b => { const k = b.dataset.k; STEPS[k].go(P.todayFocus()); };
  act['plan-next'] = () => advance();
  act['plan-end'] = () => { SES = null; P.drawSessionBar(); };
  act['plan-five'] = () => P.startVerbDrill({ minutes: 5, tenses: P.todayFocus().tenses || undefined });
  const mmss = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  // A slim bar at the bottom while a guided block runs: step, time left on this step, Next and End.
  P.drawSessionBar = function () {
    let bar = document.getElementById('sessionbar');
    if (!SES) { if (bar) bar.remove(); clearInterval(barTick); barTick = null; return; }
    if (!bar) { bar = document.createElement('div'); bar.id = 'sessionbar'; bar.setAttribute('role', 'status'); document.body.appendChild(bar); }
    const ks = blockSteps(SES.block); const k = ks[SES.i]; const left = STEPS[k].min * 60000 - (Date.now() - SES.stepStart);
    bar.className = left <= 0 ? 'over' : '';
    bar.innerHTML = `<span class="sb-t">${esc(BLOCKS[SES.block].t.split(' · ')[0])} · ${SES.i + 1}/${ks.length} · <b>${esc(STEPS[k].t)}</b></span>
      <span class="sb-time">${left > 0 ? mmss(left) + ' left' : 'time\'s up'}</span>
      <button class="btn sm primary" data-act="plan-next">${SES.i + 1 < ks.length ? 'Next: ' + esc(STEPS[ks[SES.i + 1]].t.split(':')[0]) : 'Finish'}</button><button class="btn sm ghost" data-act="plan-end">End</button>`;
    if (!barTick) barTick = setInterval(() => P.drawSessionBar(), 1000);
  };

  // ---------- Hoje card ----------
  P.planHTML = function () {
    const f = P.todayFocus();
    const row = (k, b) => { const s = STEPS[k]; const done = s.done(); return `<li class="${done ? 'done' : ''}"><span class="check">${ICON.check}</span>
      <div class="grow"><div class="t">${esc(s.t)} <span class="tiny">${s.min} min</span></div><div class="d">${esc(s.desc(f))}</div></div>
      <button class="btn sm ${done ? '' : 'ghost'}" data-act="plan-step" data-k="${k}">${done ? 'Again' : 'Go'}</button></li>`; };
    const block = b => { const ks = blockSteps(b); const n = ks.filter(k => STEPS[k].done()).length; const mins = ks.reduce((a, k) => a + STEPS[k].min, 0);
      return `<div class="card plan-block"><div class="row between"><h2 style="margin:0">${esc(BLOCKS[b].t)}</h2><span class="badge ${n === ks.length ? 'good' : ''}">${n}/${ks.length} · ~${mins} min</span></div>
        <ul class="plan">${ks.map(k => row(k, b)).join('')}</ul>
        <button class="btn primary block say-main" data-act="plan-block" data-k="${b}">${n ? 'Continue' : 'Start'} the ${b === 'am' ? 'morning' : 'evening'} block</button></div>`; };
    return `<div class="card focus-card"><div class="row between" style="align-items:flex-start;flex-wrap:nowrap;gap:12px">
        <div><div class="prompt-label" style="margin:0 0 4px">Today's focus</div><div class="focus-line">${esc(f.label)}</div>
          ${f.swapped ? `<div class="tiny">You already know "${esc(f.swapped)}" well, so today works on this instead.</div>` : ''}</div>
        <button class="btn primary five" data-act="plan-five">5 min</button></div></div>
      ${block('am')}${block('pm')}`;
  };
})(Pois);
