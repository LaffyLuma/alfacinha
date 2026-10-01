"""Two 'devices' (separate browser contexts) syncing through a simulated Google sign-in + Drive API."""
import subprocess, sys, time, json, re, itertools
from playwright.sync_api import sync_playwright

srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8766', '-d', '/home/claude/app'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
DRIVE = {}          # id -> {'name', 'content'}
ids = itertools.count(1)
calls = []
CID = '123-test.apps.googleusercontent.com'
GIS = """window.google = { accounts: { oauth2: {
  initTokenClient(cfg) { window.__cid = cfg.client_id; window.__scope = cfg.scope; return { requestAccessToken(o) { window.__tokReqs = (window.__tokReqs || 0) + 1; window.__lastPrompt = o.prompt; setTimeout(() => cfg.callback({ access_token: 'tok' + Date.now(), expires_in: 3600 }), 20); } }; },
  revoke(t, cb) { cb && cb(); } } } };"""
CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'}

def gis(route): route.fulfill(status=200, content_type='application/javascript', body=GIS)
def api(route):
    req = route.request
    if req.method == 'OPTIONS': return route.fulfill(status=204, headers=CORS)
    auth = req.headers.get('authorization', '')
    if not auth.startswith('Bearer tok'): return route.fulfill(status=401, headers=CORS, body='no auth')
    url = req.url; calls.append((req.method, url.split('?')[0].split('/')[-1]))
    m = re.search(r'/files/([^/?]+)', url)
    if req.method == 'GET' and 'alt=media' in url:
        f = DRIVE.get(m.group(1))
        return route.fulfill(status=404 if not f else 200, headers=CORS, body=f['content'] if f else 'nope')
    if req.method == 'GET':
        files = [{'id': k, 'modifiedTime': 'x'} for k, v in DRIVE.items() if v['name'] == 'pois-progress.json']
        assert 'spaces=appDataFolder' in url
        return route.fulfill(status=200, headers=CORS, content_type='application/json', body=json.dumps({'files': files}))
    if req.method == 'PATCH':
        DRIVE[m.group(1)]['content'] = req.post_data
        return route.fulfill(status=200, headers=CORS, content_type='application/json', body='{}')
    if req.method == 'POST':
        body = req.post_data
        parts = body.split('\r\n\r\n')
        meta = json.loads(parts[1].split('\r\n--')[0]); content = parts[2].rsplit('\r\n--', 1)[0]
        assert meta['parents'] == ['appDataFolder']
        fid = f'f{next(ids)}'; DRIVE[fid] = {'name': meta['name'], 'content': content}
        return route.fulfill(status=200, headers=CORS, content_type='application/json', body=json.dumps({'id': fid}))
    route.fulfill(status=500, headers=CORS)

errors = []
def device(browser, name):
    ctx = browser.new_context(viewport={'width': 390, 'height': 844})
    ctx.route('https://accounts.google.com/gsi/client', gis)
    ctx.route(re.compile(r'https://www\.googleapis\.com/.*'), api)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'{name}: {e}'))
    pg.on('console', lambda m: errors.append(f'{name} console: {m.text}') if m.type == 'error' else None)
    pg.goto('http://localhost:8766/index.html#/settings'); pg.wait_for_timeout(300)
    return pg

def S(pg, expr): return pg.evaluate(expr)
def status(pg): return pg.evaluate('Pois.Drive.statusText()')

try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        A = device(b, 'A')
        # no client id -> input shown
        assert A.query_selector('#gcid'), 'client id input missing'
        A.fill('#gcid', CID); A.click('[data-act=drive-client]'); A.wait_for_timeout(100)
        A.screenshot(path='/home/claude/tests/shots/drive-settings-connect.png', full_page=True)
        A.click('[data-act=drive-connect]'); A.wait_for_timeout(800)
        assert S(A, 'window.__scope') == 'https://www.googleapis.com/auth/drive.appdata'
        assert S(A, 'window.__lastPrompt') == 'consent'
        print('A after connect:', status(A), '| drive files', len(DRIVE))
        A.screenshot(path='/home/claude/tests/shots/drive-settings-connected.png', full_page=True)
        # A studies: capture a note + a verb sprint answer
        A.goto('http://localhost:8766/index.html#/capture'); A.wait_for_timeout(100)
        A.fill('#c-pt', 'desenrascar'); A.fill('#c-en', 'to improvise'); A.click('[data-act=cap-save]')
        A.fill('#c-pt', 'o agrafador'); A.fill('#c-en', 'stapler'); A.click('[data-act=cap-save]')
        A.evaluate("Pois.recordConj('fazer','pps',true,2000); Store.change()")
        A.wait_for_timeout(5500)
        remote = json.loads(DRIVE['f1']['content'])
        print('remote notes after A study:', [n['pt'] for n in remote['notes'].values()], '| conj', list(remote['conj']))
        assert len(remote['notes']) == 2

        B = device(b, 'B')
        B.evaluate(f"localStorage.setItem('pois.drive.clientId','{CID}')"); B.reload(); B.wait_for_timeout(200)
        B.click('[data-act=drive-connect]'); B.wait_for_timeout(800)
        bn = S(B, "Object.values(Store.get().notes).map(n => n.pt)")
        print('B pulled notes:', bn, '| B conj:', list(S(B, 'Store.get().conj')))
        assert set(bn) == {'desenrascar', 'o agrafador'} and 'fazer|pps' in S(B, 'Store.get().conj')
        assert len(DRIVE) == 1, 'B created a second file'
        # B: delete a note, add one, review a card
        B.goto('http://localhost:8766/index.html#/capture'); B.wait_for_timeout(150)
        agr = S(B, "Object.values(Store.get().notes).find(n => n.pt === 'o agrafador').id")
        B.click(f'[data-act=cap-del][data-k="{agr}"]')
        B.fill('#c-pt', 'meter água'); B.fill('#c-en', 'to mess up'); B.click('[data-act=cap-save]')
        B.goto('http://localhost:8766/index.html#/review'); B.wait_for_timeout(100)
        B.click('[data-act=rv-start]'); B.wait_for_timeout(100); B.keyboard.press('Space'); B.keyboard.press('3'); B.wait_for_timeout(100)
        B.click('[data-act=rv-end]')
        B.wait_for_timeout(5500)
        # A syncs (tap on pill)
        A.goto('http://localhost:8766/index.html#/today'); A.wait_for_timeout(100)
        A.click('[data-act=drive-sync]'); A.wait_for_timeout(800)
        an = sorted(S(A, "Object.values(Store.get().notes).map(n => n.pt)"))
        a_cards = S(A, "Object.values(Store.get().cards).filter(c => c.state > 0).length"); b_cards = S(B, "Object.values(Store.get().cards).filter(c => c.state > 0).length")
        print('A notes after sync:', an, '| reviewed cards A/B:', a_cards, b_cards)
        assert an == ['desenrascar', 'meter água'], an
        assert a_cards == b_cards >= 1
        A.screenshot(path='/home/claude/tests/shots/drive-today-synced.png')
        # token expiry on A -> reload -> needs tap
        A.evaluate("localStorage.setItem('pois.drive.token', JSON.stringify({token:'tokold', exp: Date.now()-1000}))")
        A.reload(); A.wait_for_timeout(400)
        print('A after expired token:', status(A))
        assert status(A) == 'Tap to sync'
        assert A.query_selector('.card [data-act=drive-sync]'), 'Today sync banner missing'
        A.screenshot(path='/home/claude/tests/shots/drive-today-needsauth.png')
        reqs = S(A, 'window.__tokReqs || 0')
        A.click('#topbar [data-act=drive-sync]'); A.wait_for_timeout(800)
        print('A after tap:', status(A), '| prompt', S(A, 'window.__lastPrompt'))
        assert status(A).startswith('Synced') and S(A, 'window.__lastPrompt') == ''
        # 401 mid-session -> needsAuth, no crash
        A.evaluate("localStorage.setItem('pois.drive.token', JSON.stringify({token:'bad', exp: Date.now()+3600e3}))")
        A.evaluate("Pois.Drive.sync()"); A.wait_for_timeout(400)
        print('A after 401:', status(A)); assert status(A) == 'Tap to sync'
        A.click('#topbar [data-act=drive-sync]'); A.wait_for_timeout(600)
        # Reset on B propagates
        B.goto('http://localhost:8766/index.html#/settings'); B.wait_for_timeout(100)
        B.click('[data-act=reset]'); B.wait_for_timeout(100); B.click('[data-c="1"]'); B.wait_for_timeout(5500)
        A.click('#topbar [data-act=drive-sync]'); A.wait_for_timeout(800)
        print('A after B reset: notes', len(S(A, 'Store.get().notes')), 'cards', len(S(A, 'Store.get().cards')), 'conj', len(S(A, 'Store.get().conj')))
        assert len(S(A, 'Store.get().notes')) == 0 and len(S(A, 'Store.get().cards')) == 0
        # after reset, new study still syncs normally
        A.evaluate("Pois.recordConj('ser','pimp',true,1500); Store.change()"); A.wait_for_timeout(5500)
        B.click('#topbar [data-act=drive-sync]'); B.wait_for_timeout(800)
        assert 'ser|pimp' in S(B, 'Store.get().conj'), 'post-reset sync failed'
        print('post-reset sync OK; total API calls', len(calls), '| files in Drive:', len(DRIVE))
        B.goto('http://localhost:8766/index.html#/settings'); B.wait_for_timeout(200)
        B.screenshot(path='/home/claude/tests/shots/drive-settings-B.png')
        b.close()
finally:
    srv.terminate()
print('ERRORS:', *errors, sep='\n') if errors else print('NO ERRORS')
