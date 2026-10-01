/* Router, navigation, global events, boot. */
(function (P) {
  const { ICON, esc } = P;
  const NAV = [
    ['today', 'Hoje', 'today'], ['review', 'Rever', 'review'], ['gym', 'Verbos', 'verbs'], ['drills', 'Contexto', 'drills'],
    ['write', 'Escrever', 'write'], ['partner', 'A dois', 'partner'], ['sep'], ['grammar', 'Gramática', 'grammar'], ['capture', 'Capture', 'capture'],
    ['progress', 'Progresso', 'progress'], ['settings', 'Definições', 'settings'],
  ];
  const TABS = [['today', 'Hoje', 'today'], ['review', 'Rever', 'review'], ['gym', 'Verbos', 'verbs'], ['partner', 'A dois', 'partner'], ['more', 'Mais', 'more']];
  const route = () => (location.hash.replace(/^#\/?/, '').split('?')[0] || 'today');
  P.route = route;

  function renderChrome(r) {
    const rr = r === 'tables' ? 'gym' : r;
    document.getElementById('sidebar').innerHTML = `<a class="brand" href="#/today"><span class="brand-mark">A</span>Alfacinha</a>` +
      NAV.map(n => n[0] === 'sep' ? '<div class="sep"></div>' : `<a class="nav ${rr === n[0] ? 'on' : ''}" href="#/${n[0]}">${ICON[n[2]]}${n[1]}</a>`).join('');
    const moreRoutes = ['more', 'drills', 'write', 'grammar', 'capture', 'progress', 'settings', 'tables'];
    document.getElementById('tabbar').innerHTML = TABS.map(t => `<a href="#/${t[0]}" class="${(t[0] === 'more' ? moreRoutes.includes(r) && r !== 'tables' : rr === t[0]) ? 'on' : ''}">${ICON[t[2]]}${t[1]}</a>`).join('');
    const fs = Store.fileStatus();
    const due = P.dueIds().length;
    const D = P.Drive, dcon = D && D.connected();
    const dcls = dcon ? ({ ok: '', syncing: '', needsAuth: 'warn', offline: 'warn', error: 'warn' }[D.state.status] || '') : '';
    const drivePill = dcon ? `<button class="savepill drivepill ${dcls}" data-act="drive-sync" title="${esc(D.state.error || 'Google Drive sync: tap to sync now')}">${ICON.cloud}${esc(D.statusText())}</button>` : '';
    document.getElementById('topbar').innerHTML = `<a class="brand" href="#/today"><span class="brand-mark">A</span>Alfacinha</a>
      <div class="row" style="gap:12px">${due ? `<a class="badge acc" href="#/review" style="text-decoration:none">${due} due</a>` : ''}
      ${drivePill || (fs.needsPermission ? `<button class="btn sm" data-act="file-reconnect">Reconnect save file</button>` : `<span class="savepill ${fs.error ? 'warn' : ''}" title="${esc(fs.error || '')}"><span class="dot"></span>${fs.linked ? 'Saved to ' + esc(fs.name) : 'Saved on this device'}</span>`)}</div>`;
  }
  P.renderChrome = () => renderChrome(route());
  let lastRoute = null;
  function render() {
    const r = route();
    const view = P.views[r] || P.views.today;
    renderChrome(r);
    const el = document.getElementById('view');
    view(el);
    if (r !== lastRoute) { window.scrollTo(0, 0); lastRoute = r; }
  }
  P.render = render;

  P.confirm = (msg) => new Promise(res => {
    const m = document.getElementById('modal');
    m.innerHTML = `<div class="box"><p>${esc(msg)}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-c="0">Cancel</button><button class="btn primary" data-c="1">Yes</button></div></div>`;
    m.hidden = false;
    m.onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b && e.target !== m) return; m.hidden = true; res(!!(b && b.dataset.c === '1')); };
  });

  // ---------- global events ----------
  document.addEventListener('mousedown', (e) => { if (e.target.closest('[data-ins]')) e.preventDefault(); });
  document.addEventListener('click', (e) => {
    const ins = e.target.closest('[data-ins]');
    if (ins) {
      const target = document.getElementById(ins.parentElement.dataset.accents);
      if (target && !target.readOnly) {
        const a = target.selectionStart ?? target.value.length, b = target.selectionEnd ?? a;
        target.value = target.value.slice(0, a) + ins.dataset.ins + target.value.slice(b);
        target.focus(); target.setSelectionRange(a + 1, a + 1); target.dispatchEvent(new Event('input'));
      }
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); const href = go.getAttribute('href'); if (location.hash !== href) { lastRoute = href.slice(2); history.pushState(null, '', href); } P.actions[go.dataset.go](go); if (!P.views[route()]) render(); return; }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const a = el.dataset.act;
    if (a === 'say') { e.preventDefault(); P.TTS.speak(el.dataset.say); return; }
    if (el.tagName === 'A') e.preventDefault();
    if (el.tagName === 'DETAILS' && e.target.closest('summary') == null) return;
    const fn = P.actions[a]; if (fn) fn(el, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('pcard')) { e.target.click(); return; }
    const k = P.keys[route()]; if (k) k(e);
  });
  window.addEventListener('hashchange', render);
  window.addEventListener('popstate', render);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') Store.flush(); });
  window.addEventListener('pagehide', () => Store.flush());

  // ---------- boot ----------
  async function boot() {
    Store.load();
    P.TTS.init();
    P.Drive.init();
    Store.onChange(render);
    render();
    await Store.initFile();
    render();
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/localhost|127\.0\.0\.1/.test(location.hostname)) {
      navigator.serviceWorker.register('sw.js').catch(() => { });
    }
  }
  boot();
})(Pois);
