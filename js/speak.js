/* Speech sequencing (say / stop / pause / two voices) and the shared speak → reveal → grade card
   used by Transformations, Dialogues and (for its voices) Radio. */
(function (P) {
  const { S, esc, ICON, TTS } = P;

  // ---------- speech queue ----------
  // say() resolves when the line has been spoken (or failed, or was stopped). stop() bumps the token,
  // so a running sequence can check `t !== TTS.token()` after each await and exit quietly.
  let tok = 0;
  const live = new Set(), waits = new Set();
  const clean = s => String(s == null ? '' : s).replace(/[{}]/g, '').replace(/___/g, '…').replace(/—/g, ',').trim();
  const isPT = v => /pt[-_]PT/i.test(v.lang) || /portugal/i.test(v.name);
  TTS.token = () => tok;
  TTS.ptVoices = () => TTS.voices.filter(isPT);
  TTS.enVoice = function () {
    if (!('speechSynthesis' in window)) return null;
    const all = speechSynthesis.getVoices();
    return all.find(v => /en[-_]GB/i.test(v.lang) && /natural|online/i.test(v.name)) || all.find(v => /en[-_]GB/i.test(v.lang))
      || all.find(v => /^en/i.test(v.lang) && /natural|online/i.test(v.name)) || all.find(v => /^en/i.test(v.lang)) || null;
  };
  // Two different pt-PT voices if the device has them (Edge: Raquel + Duarte), else the same voice twice
  // and the caller varies pitch.
  TTS.voices2 = function () {
    const pt = TTS.ptVoices();
    const pick = re => pt.find(v => re.test(v.name) && /natural|online/i.test(v.name)) || pt.find(v => re.test(v.name));
    const raquel = pick(/raquel/i), duarte = pick(/duarte/i);
    if (raquel && duarte) return [raquel, duarte];
    const a = TTS.voice();
    const b = pt.find(v => a && v.name !== a.name);
    return [a, b || a];
  };
  TTS.say = function (text, o) {
    o = o || {};
    return new Promise(res => {
      const t = clean(text);
      if (!t || !('speechSynthesis' in window)) return res();
      const en = o.lang === 'en';
      let v = o.voice !== undefined ? o.voice : en ? TTS.enVoice() : TTS.voice();
      if (!v && en) v = TTS.voice();
      // Voices are loaded but none is Portuguese: show the text, don't read Portuguese in an English voice.
      if (!v && !en && speechSynthesis.getVoices().length) return res();
      const u = new SpeechSynthesisUtterance(t);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = en ? 'en-GB' : 'pt-PT';
      u.rate = o.rate || S().settings.rate || 0.9; u.pitch = o.pitch || 1;
      const rec = { u };
      // Chrome sometimes never fires 'end': resolve anyway after a generous estimate.
      const timer = setTimeout(() => rec.done(), Math.max(4000, t.length * 120 / Math.min(1, u.rate)));
      rec.done = () => { if (rec.fin) return; rec.fin = true; clearTimeout(timer); live.delete(rec); res(); };
      u.onend = rec.done; u.onerror = rec.done;
      live.add(rec); // keeps the utterance referenced so it isn't garbage-collected mid-speech
      speechSynthesis.speak(u);
    });
  };
  // True when nothing can be spoken in Portuguese (no speech API, or voices loaded and none is Portuguese).
  TTS.silent = () => !('speechSynthesis' in window) || (!TTS.voice() && speechSynthesis.getVoices().length > 0);
  // Speak, or when there's no voice, hold the line on screen for reading time so sequences don't race ahead.
  TTS.sayOrRead = async function (text, o) {
    if (TTS.silent() && !(o && o.lang === 'en' && TTS.enVoice())) return TTS.pause(Math.max(1500, clean(text).length * 60));
    return TTS.say(text, o);
  };
  TTS.stop = function () {
    tok++;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    [...live].forEach(r => r.done());
    [...waits].forEach(f => f());
  };
  TTS.pause = function (ms) {
    return new Promise(res => { const f = () => { clearTimeout(id); waits.delete(f); res(); }; const id = setTimeout(f, ms); waits.add(f); });
  };

  // Per-route cleanup, called by the router when you leave a page (after TTS.stop()).
  P.leave = P.leave || {};

  // ---------- flagged items (radio / dialogues → next on-screen session) ----------
  // Descriptors: {kind:'verb', v,t,p} · {kind:'trans', id, idx} · {kind:'dialog', id, i} · {kind:'vocab', id}
  P.flag = function (d) {
    const r = S().radio; const k = Store.radioKey(d);
    if (r.flagged.some(x => Store.radioKey(x) === k)) return false;
    r.flagged.push(Object.assign({ at: Date.now() }, d)); return true;
  };
  // Take up to max flagged items of the given kinds and mark them used (so a sync doesn't bring them back).
  P.takeFlagged = function (kinds, max) {
    const r = S().radio; r.used = r.used || {};
    const out = [], keep = [];
    r.flagged.forEach(d => { if (kinds.includes(d.kind) && out.length < max) { out.push(d); r.used[Store.radioKey(d)] = Date.now(); } else keep.push(d); });
    r.flagged = keep; return out;
  };

  // ---------- highlighting ----------
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Escape text and wrap each whole-word match of the given words/phrases in <mark> (case-insensitive, accent-aware).
  function markHTML(text, marks) {
    text = String(text || ''); const rs = [];
    (marks || []).filter(Boolean).forEach(m => {
      const re = new RegExp(`(?<![\\p{L}\\p{M}])${escRe(m)}(?![\\p{L}\\p{M}])`, 'giu'); let r;
      while ((r = re.exec(text))) rs.push([r.index, r.index + r[0].length]);
    });
    rs.sort((a, b) => a[0] - b[0]);
    let out = '', at = 0;
    for (const [a, b] of rs) { if (a < at) continue; out += esc(text.slice(at, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>'; at = b; }
    return out + esc(text.slice(at));
  }
  P.markHTML = markHTML;

  // ---------- shared say card ----------
  // Before reveal only the cue exists in the DOM; the answer is rendered after reveal, never hidden.
  P.sayCard = function (o) {
    const a = Object.assign({ reveal: 'tr-reveal', hint: 'tr-hint', grade: 'tr-grade', end: 'tr-end', replay: 'say' }, o.acts || {});
    const meta = o.meta || ['', ''];
    const pct = Math.round(Math.max(0, Math.min(1, o.progress || 0)) * 100);
    const cueBtn = o.cue ? `<button class="btn ${o.cueBig ? 'primary block' : 'ghost'}" data-act="${a.replay}" data-say="${esc(o.cue)}">${ICON.speaker} ${o.cueBig ? 'Hear it' : 'Hear the cue'} <span class="kbd">r</span></button>` : '';
    let body, below;
    if (!o.revealed) {
      body = o.hint && o.hintShown ? `<div class="sayhint">${o.hint}</div>` : '';
      below = `${o.cueBig ? `<div style="margin-top:14px">${cueBtn}</div>` : ''}
        <button class="btn primary block say-main" data-act="${a.reveal}">Reveal <span class="kbd">Space</span></button>
        <div class="say-row">${o.hint && !o.hintShown ? `<button class="btn ghost" data-act="${a.hint}">Hint <span class="kbd">h</span></button>` : ''}${o.cueBig ? '' : cueBtn}</div>`;
    } else {
      body = `<div class="answer-block"><div class="row" style="justify-content:center;flex-wrap:nowrap;gap:10px">
          <div class="sentence" style="margin:0">${o.answer}</div>
          ${o.say ? `<button class="iconbtn" data-act="say" data-say="${esc(o.say)}" title="Listen" aria-label="Listen">${ICON.speaker}</button>` : ''}</div>
        ${o.help ? `<div class="tip" style="margin-top:12px;text-align:left">${o.help}</div>` : ''}</div>`;
      below = o.after != null ? o.after : `<div class="grades three">
          <button class="g1" data-act="${a.grade}" data-g="1">Missed<small>1</small></button>
          <button class="g2" data-act="${a.grade}" data-g="2">Slow<small>2</small></button>
          <button class="g3" data-act="${a.grade}" data-g="3">Got it<small>3</small></button></div>`;
    }
    return `<div class="study say">
      <div class="meta"><span>${meta[0]}</span><span>${meta[1]}</span></div>
      <div class="progress" style="margin-bottom:14px"><div style="width:${pct}%"></div></div>
      <div class="qcard">
        ${o.label ? `<div class="prompt-label">${o.label}</div>` : ''}
        ${o.front || ''}${body}
      </div>
      ${below}
      <div class="row between" style="margin-top:14px"><button class="btn ghost" data-act="${a.end}">End</button>${o.extra || ''}</div>
    </div>`;
  };
  // Got it = 1, Slow = 0.6, Missed = 0 (same idea as the conj ema)
  P.gradeScore = g => g === 3 ? 1 : g === 2 ? 0.6 : 0;
})(Pois);
