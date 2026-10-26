/* Ler e ouvir: a reading log for parallel EP/English books, a Portuguese music list, and lyric-to-card
   (paste a line you liked, tap the words you want, it becomes a review card). Lyrics are never bundled:
   you paste only the line you want, and it stays on your device. */
(function (P) {
  const { S, esc, ICON } = P;
  const V = P.views, act = P.actions;
  const BK = {}; BOOKS.forEach(b => { BK[b.id] = b; });
  const q = s => encodeURIComponent(s);
  let LY = { line: '', words: [], a: -1, b: -1, saved: false }, LOG = { pages: 0, mins: 0 };
  const pagesFor = id => S().reading.filter(r => r.book === id).reduce((a, r) => a + (r.pages || 0), 0);
  V.ler = function (el) {
    const s = S(); const cur = BK[s.readCur];
    const recent = s.reading.slice().sort((a, b) => b.date - a.date).slice(0, 5);
    el.innerHTML = `<div class="hero"><div><h1>Ler e ouvir</h1><div class="muted">Read the Portugal edition with the English one beside it, and turn lines from songs into cards.</div></div></div>
      <div class="card"><h2>Reading log</h2>
        ${cur ? `<div class="row between" style="flex-wrap:nowrap;gap:10px"><div><b>${esc(cur.pt)}</b><div class="small muted">${esc(cur.en)} · ${pagesFor(cur.id)} pages so far</div></div><button class="btn ghost" data-act="rd-unset">Change</button></div>
          <h3 style="margin-top:14px">Today's session</h3>
          <div class="row" style="margin-bottom:8px"><span class="small muted" style="width:64px">Pages</span>${[5, 10, 20, 40].map(n => `<button class="chip big ${LOG.pages === n ? 'on' : ''}" data-act="rl-pages" data-k="${n}">${n}</button>`).join('')}</div>
          <div class="row" style="margin-bottom:12px"><span class="small muted" style="width:64px">Minutes</span>${[10, 20, 30, 45].map(n => `<button class="chip big ${LOG.mins === n ? 'on' : ''}" data-act="rl-mins" data-k="${n}">${n}</button>`).join('')}</div>
          <details><summary class="small">Three words you met (optional; they become cards)</summary><div style="margin-top:8px">${[0, 1, 2].map(i => `<div class="grid two" style="gap:8px;margin-bottom:6px"><input type="text" id="rw-pt${i}" placeholder="português"><input type="text" id="rw-en${i}" placeholder="English"></div>`).join('')}</div></details>
          <button class="btn primary block say-main" data-act="rl-save" style="margin-top:12px" ${LOG.pages || LOG.mins ? '' : 'disabled'}>Log this session</button>`
        : `<p class="small muted">Pick the book you're reading from the list below.</p>`}
        ${recent.length ? `<div style="margin-top:14px">${recent.map(r => `<div class="list-item"><span class="small">${new Date(r.date).toLocaleDateString('pt-PT')} · ${esc((BK[r.book] || {}).pt || r.book)}</span><span class="small muted">${r.pages ? r.pages + ' p' : ''}${r.pages && r.mins ? ' · ' : ''}${r.mins ? r.mins + ' min' : ''}</span></div>`).join('')}</div>` : ''}</div>
      <div class="card"><h2>Lyric → card</h2>
        <p class="small muted">Paste one line you liked from a Portuguese song, tap the word or phrase you want to learn, and it becomes a review card with the line as its example.</p>
        ${lyricHTML()}</div>
      <h2 style="margin-top:20px">Books to read in parallel</h2>
      <p class="small muted">Before buying an ebook, check the publisher is Portuguese (Presença, Porto Editora, Leya/ASA/Dom Quixote, Bertrand, Booksmile, Relógio d'Água, Quetzal, Tinta-da-china) and the language says <b>Português (Portugal)</b>.</p>
      <div class="grid two">${BOOKS.map(b => `<div class="card book ${s.readCur === b.id ? 'on' : ''}">
        <div class="row between"><span class="badge">${esc(b.lvl)}</span>${pagesFor(b.id) ? `<span class="tiny">${pagesFor(b.id)} pages read</span>` : ''}</div>
        <h3 style="margin:8px 0 2px">${esc(b.pt)}</h3><div class="small muted">${esc(b.en)} · ${esc(b.by)}</div><div class="tiny">${esc(b.pub)}</div>
        <p class="small" style="margin:8px 0">${esc(b.why)}</p>
        <div class="row"><button class="btn ${s.readCur === b.id ? '' : 'primary'}" data-act="rd-set" data-k="${b.id}">${s.readCur === b.id ? 'Reading ✓' : 'I\'m reading this'}</button>
          <a class="btn ghost" href="https://www.kobo.com/pt/pt/search?query=${q(b.pt)}" target="_blank" rel="noopener">Kobo</a><a class="btn ghost" href="https://www.wook.pt/pesquisa?keyword=${q(b.pt)}" target="_blank" rel="noopener">Wook</a></div></div>`).join('')}</div>
      <h2 style="margin-top:20px">Portuguese music</h2>
      <div class="card">${ARTISTS.map(a => `<div class="list-item"><span><b>${esc(a.name)}</b>${a.play ? ' <span class="badge acc">learn on guitar</span>' : ''}<br><span class="small muted">${esc(a.style)}</span></span>
        <span class="row" style="flex-wrap:nowrap;gap:4px"><a class="btn ghost" href="https://www.youtube.com/results?search_query=${q(a.name)}" target="_blank" rel="noopener">Listen</a><a class="btn ghost" href="https://duckduckgo.com/?q=${q(a.name + ' letras')}" target="_blank" rel="noopener">Lyrics</a></span></div>`).join('')}</div>`;
  };
  function lyricHTML() {
    if (LY.saved) return `<div class="note-good">Card made. It'll come up in your reviews.</div><button class="btn" style="margin-top:10px" data-act="ly-new">Another line</button>`;
    if (!LY.words.length) return `<textarea id="ly-line" rows="2" placeholder="Cola aqui um verso…">${esc(LY.line)}</textarea>
      <button class="btn primary" style="margin-top:8px" data-act="ly-split">Next: pick the words</button>`;
    const lo = Math.min(LY.a, LY.b), hi = Math.max(LY.a, LY.b);
    const chunk = lo >= 0 ? LY.words.slice(lo, hi + 1).join(' ').replace(/^[«"“(]+|[.,;:!?»"”)]+$/g, '') : '';
    return `<p class="small">Tap the first and last word of what you want to learn:</p>
      <div class="lyric">${LY.words.map((w, i) => `<button class="lw ${lo >= 0 && i >= lo && i <= hi ? 'on' : ''}" data-act="ly-word" data-i="${i}">${esc(w)}</button>`).join('')}</div>
      ${chunk ? `<div class="grid two" style="gap:8px;margin-top:10px"><label class="field"><span>It means… (optional)</span><input type="text" id="ly-en" placeholder="English"></label><label class="field"><span>Song / artist (optional)</span><input type="text" id="ly-src" placeholder="Zambujo – …"></label></div>
        <div class="row"><button class="btn primary" data-act="ly-save">Make a card: “${esc(chunk)}”</button><button class="btn ghost" data-act="ly-new">Start over</button></div>` : `<button class="btn ghost" style="margin-top:8px" data-act="ly-new">Start over</button>`}`;
  }
  act['rd-set'] = b => { S().readCur = b.dataset.k; Store.change(); window.scrollTo(0, 0); };
  act['rd-unset'] = () => { S().readCur = ''; Store.change(); };
  act['rl-pages'] = b => { LOG.pages = LOG.pages === +b.dataset.k ? 0 : +b.dataset.k; P.render(); };
  act['rl-mins'] = b => { LOG.mins = LOG.mins === +b.dataset.k ? 0 : +b.dataset.k; P.render(); };
  act['rl-save'] = () => {
    const s = S(); if (!s.readCur || !(LOG.pages || LOG.mins)) return;
    let n = 0;
    [0, 1, 2].forEach(i => { const pt = (document.getElementById('rw-pt' + i)?.value || '').trim(), en = (document.getElementById('rw-en' + i)?.value || '').trim(); if (pt) { P.addNote({ type: 'word', pt, en: en || '?', src: 'life' }); n++; } });
    s.reading.push({ id: P.uid(), date: Date.now(), book: s.readCur, pages: LOG.pages, mins: LOG.mins });
    P.bump('read', Math.max(1, LOG.mins || 1)); LOG = { pages: 0, mins: 0 };
    Store.change(); P.toast(n ? `Logged. ${n} word${n > 1 ? 's' : ''} added to your reviews.` : 'Logged. Boa leitura!');
  };
  act['ly-split'] = () => {
    const line = (document.getElementById('ly-line')?.value || '').trim().replace(/\s+/g, ' ');
    if (!line) { P.toast('Paste a line first.'); return; }
    LY = { line, words: line.split(' '), a: -1, b: -1, saved: false }; P.render();
  };
  act['ly-word'] = b => {
    const i = +b.dataset.i;
    if (LY.a < 0 || (LY.a >= 0 && LY.b >= 0 && LY.a !== LY.b)) { LY.a = i; LY.b = i; } else LY.b = i;
    P.render();
  };
  act['ly-save'] = () => {
    const lo = Math.min(LY.a, LY.b), hi = Math.max(LY.a, LY.b);
    const pt = LY.words.slice(lo, hi + 1).join(' ').replace(/^[«"“(]+|[.,;:!?»"”)]+$/g, '');
    const en = (document.getElementById('ly-en')?.value || '').trim(); const src = (document.getElementById('ly-src')?.value || '').trim();
    P.addNote({ type: 'word', pt, en: en || '(from a song: look it up when it comes up)', ex: LY.line, exEn: src, src: 'life' });
    P.bump('lyric'); LY.saved = true; Store.change();
  };
  act['ly-new'] = () => { LY = { line: '', words: [], a: -1, b: -1, saved: false }; P.render(); };
  P.leave.ler = () => { LOG = { pages: 0, mins: 0 }; };
})(Pois);
