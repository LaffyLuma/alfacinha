/* Google Drive sync.
   - Sign-in: Google Identity Services token client (browser-only, no server). Scope: drive.appdata, which
     gives access ONLY to a hidden folder that belongs to this app, never the rest of your Drive.
   - One file, pois-progress.json, in that folder. Sync = download → merge with this device → upload.
   - Access tokens last ~1 hour. When one expires the app asks for a single tap ("Sync") to get a new one,
     because browsers block sign-in popups that aren't started by a tap. */
(function (P) {
  const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const FILE = 'pois-progress.json';
  const API = 'https://www.googleapis.com/drive/v3/files';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
  const LS = { conn: 'pois.drive.connected', tok: 'pois.drive.token', id: 'pois.drive.fileId', last: 'pois.drive.lastSync', client: 'pois.drive.clientId' };
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } } };

  const st = { status: 'off', error: '', lastSync: +ls.get(LS.last) || 0, pending: false, busy: false };
  let tokenClient = null, gisPromise = null, timer = null, tokenWaiters = [];

  const clientId = () => (ls.get(LS.client) || (window.POIS_CONFIG && window.POIS_CONFIG.googleClientId) || '').trim();
  const connected = () => ls.get(LS.conn) === '1';
  const usable = () => /^https?:$/.test(location.protocol);
  function token() {
    try { const t = JSON.parse(ls.get(LS.tok) || 'null'); if (t && t.exp > Date.now() + 60000) return t.token; } catch (e) { }
    return null;
  }
  function setStatus(s, err) { st.status = s; st.error = err || ''; if (P.renderChrome) P.renderChrome(); const el = document.getElementById('drive-status'); if (el) el.innerHTML = statusText(); }

  function loadGis() {
    if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
    if (gisPromise) return gisPromise;
    gisPromise = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = () => res(); s.onerror = () => { gisPromise = null; rej(new Error('Could not load Google sign-in (are you online?)')); };
      document.head.appendChild(s);
    });
    return gisPromise;
  }
  async function ensureClient() {
    await loadGis();
    if (tokenClient) return tokenClient;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId(), scope: SCOPE,
      callback: (resp) => {
        const w = tokenWaiters; tokenWaiters = [];
        if (resp.error) { w.forEach(x => x.rej(new Error(resp.error_description || resp.error))); return; }
        ls.set(LS.tok, JSON.stringify({ token: resp.access_token, exp: Date.now() + (resp.expires_in || 3600) * 1000 }));
        w.forEach(x => x.res(resp.access_token));
      },
      error_callback: (e) => { const w = tokenWaiters; tokenWaiters = []; w.forEach(x => x.rej(new Error(e && e.type === 'popup_closed' ? 'Sign-in window was closed' : (e && e.message) || 'Sign-in failed'))); },
    });
    return tokenClient;
  }
  /* Must be called from a tap/click (browsers block the popup otherwise). */
  async function requestToken(consent) {
    const c = await ensureClient();
    return new Promise((res, rej) => { tokenWaiters.push({ res, rej }); c.requestAccessToken({ prompt: consent ? 'consent' : '' }); });
  }

  async function api(url, opts = {}, retry = true) {
    const t = token(); if (!t) { const e = new Error('Sign-in expired'); e.auth = true; throw e; }
    const r = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: 'Bearer ' + t }, opts.headers || {}) }));
    if (r.status === 401) { ls.set(LS.tok, null); const e = new Error('Sign-in expired'); e.auth = true; throw e; }
    if (r.status === 404 && retry && url.includes(ls.get(LS.id) || '\u0000')) { ls.set(LS.id, null); const e = new Error('file gone'); e.gone = true; throw e; }
    if (!r.ok) throw new Error(`Drive error ${r.status}: ${(await r.text()).slice(0, 160)}`);
    return r;
  }
  async function findFile() {
    const cached = ls.get(LS.id); if (cached) return cached;
    const q = encodeURIComponent(`name='${FILE}'`);
    const r = await api(`${API}?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`);
    const j = await r.json();
    const id = j.files && j.files[0] && j.files[0].id;
    if (id) ls.set(LS.id, id);
    return id || null;
  }
  async function download(id) { const r = await api(`${API}/${id}?alt=media`); const t = await r.text(); return t ? JSON.parse(t) : null; }
  async function upload(id, data) {
    const body = JSON.stringify(data);
    if (id) { await api(`${UPLOAD}/${id}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body }); return id; }
    const boundary = 'pois' + Math.random().toString(36).slice(2);
    const meta = JSON.stringify({ name: FILE, parents: ['appDataFolder'], mimeType: 'application/json' });
    const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
    const r = await api(`${UPLOAD}?uploadType=multipart&fields=id`, { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + boundary }, body: multipart });
    const j = await r.json(); ls.set(LS.id, j.id); return j.id;
  }

  /* Pull → merge → push. */
  async function sync(opts = {}) {
    if (!connected() || !usable()) return;
    if (st.busy) { st.pending = true; return; }
    if (!navigator.onLine) { setStatus('offline'); st.pending = true; return; }
    if (!token()) {
      if (opts.interactive) { try { await requestToken(false); } catch (e) { setStatus('needsAuth', e.message); return; } }
      else { st.pending = true; setStatus('needsAuth'); return; }
    }
    st.busy = true; st.pending = false; setStatus('syncing');
    try {
      let id, remote = null;
      try { id = await findFile(); if (id) remote = await download(id); }
      catch (e) { if (e.gone) { id = await findFile(); if (id) remote = await download(id); } else throw e; }
      const local = Store.get();
      if (remote && Store.validate(remote)) {
        const merged = Store.merge(local, remote);
        if (Store.fingerprint(merged) !== Store.fingerprint(local)) {
          merged.settings = local.settings;
          const busyRoute = ['review', 'gym', 'drills', 'write', 'capture', 'partner'].includes(P.route && P.route());
          Store.replace(merged, { fromSync: true, silent: busyRoute });
          if (busyRoute && P.renderChrome) P.renderChrome();
        }
        if (Store.fingerprint(Store.get()) !== Store.fingerprint(remote) || opts.forcePush) await upload(id, Store.get());
      } else {
        id = await upload(id, Store.get());
      }
      st.lastSync = Date.now(); ls.set(LS.last, String(st.lastSync));
      setStatus('ok');
    } catch (e) {
      if (e.auth) { st.pending = true; setStatus('needsAuth'); }
      else if (!navigator.onLine) { st.pending = true; setStatus('offline'); }
      else setStatus('error', e.message);
    } finally {
      st.busy = false;
      if (st.pending && token() && navigator.onLine) { clearTimeout(timer); timer = setTimeout(() => sync(), 1500); }
    }
  }
  function schedule() {
    if (!connected()) return;
    st.pending = true;
    clearTimeout(timer);
    if (token()) timer = setTimeout(() => sync(), 4000); else setStatus('needsAuth');
  }
  async function connect() {
    if (!clientId()) throw new Error('Add your Google client ID first.');
    tokenClient = null; // pick up a changed client ID
    await requestToken(true);
    ls.set(LS.conn, '1');
    await sync({ forcePush: true });
  }
  function disconnect() {
    const t = token();
    try { if (t && window.google && google.accounts) google.accounts.oauth2.revoke(t, () => { }); } catch (e) { }
    [LS.conn, LS.tok, LS.id, LS.last].forEach(k => ls.set(k, null));
    st.lastSync = 0; setStatus('off');
  }
  function statusText() {
    if (!connected()) return 'Not connected';
    const t = st.lastSync ? new Date(st.lastSync).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '';
    switch (st.status) {
      case 'syncing': return 'Syncing…';
      case 'needsAuth': return 'Tap to sync';
      case 'offline': return 'Offline, will sync later';
      case 'error': return 'Sync problem';
      case 'ok': return 'Synced ' + t;
      default: return t ? 'Synced ' + t : 'Connected';
    }
  }
  function init() {
    Store.onAnyChange(schedule);
    document.addEventListener('visibilitychange', () => {
      if (!connected()) return;
      if (document.visibilityState === 'visible') { if (token()) sync(); else setStatus('needsAuth'); }
      else if (st.pending && token()) sync();
    });
    window.addEventListener('online', () => { if (connected() && token()) sync(); });
    if (!connected()) return;
    if (!usable()) { setStatus('error', 'Open the app from its web address to use Drive sync.'); return; }
    if (token()) sync(); else setStatus('needsAuth');
  }
  P.Drive = { init, sync, connect, disconnect, connected, usable, clientId, setClientId: v => { ls.set(LS.client, v || null); tokenClient = null; }, state: st, statusText, hasToken: () => !!token() };
})(Pois);
