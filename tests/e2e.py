import subprocess, time, sys, os, json
from playwright.sync_api import sync_playwright

ROOT = '/home/claude/app'
OUT = '/home/claude/tests/shots'
os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for label, vp in [('desktop', {'width': 1280, 'height': 860}), ('mobile', {'width': 390, 'height': 844})]:
            ctx = b.new_context(viewport=vp)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'{label} pageerror: {e}'))
            pg.on('console', lambda m: errors.append(f'{label} console {m.type}: {m.text}') if m.type == 'error' else None)
            pg.goto('http://localhost:8765/index.html')
            pg.wait_for_timeout(500)
            pg.screenshot(path=f'{OUT}/{label}-today.png', full_page=True)
            # --- review session ---
            pg.goto('http://localhost:8765/index.html#/review'); pg.wait_for_timeout(200)
            pg.click('[data-act=rv-start]')
            for i in range(12):
                pg.wait_for_timeout(60)
                if pg.query_selector('[data-act=rv-reveal]'):
                    if i == 0: pg.screenshot(path=f'{OUT}/{label}-review-front.png')
                    pg.keyboard.press('Space'); pg.wait_for_timeout(60)
                    if i == 0: pg.screenshot(path=f'{OUT}/{label}-review-back.png')
                    pg.keyboard.press('3' if i % 3 else '1')
                elif pg.query_selector('#ans:not([readonly])'):
                    pg.fill('#ans', 'xyz'); pg.keyboard.press('Enter'); pg.wait_for_timeout(60); pg.keyboard.press('Enter')
                else:
                    break
            pg.screenshot(path=f'{OUT}/{label}-review-later.png')
            pg.click('[data-act=rv-end]') if pg.query_selector('[data-act=rv-end]') else None
            pg.wait_for_timeout(100)
            # --- gym ---
            pg.goto('http://localhost:8765/index.html#/gym'); pg.wait_for_timeout(200)
            pg.screenshot(path=f'{OUT}/{label}-gym-setup.png', full_page=True)
            pg.click('[data-act=gym-len][data-k="10"]'); pg.wait_for_timeout(100)
            pg.click('[data-act=gym-start]')
            for i in range(14):
                pg.wait_for_timeout(40)
                if not pg.query_selector('#ans:not([readonly])'): break
                # read expected answer
                ans = pg.evaluate("""() => { const t = document.querySelector('.prompt-label').childNodes[0].textContent.trim(); const v = document.querySelector('.verbline b').textContent; const per = document.querySelector('.verbline').childNodes[0].textContent.trim();
                  const tk = Conj.TENSES.find(x => x.pt === t).k; const f = Pois.VERB[v].f[tk]; const p = [0,1,2,3,4].find(p => f[p] && Pois.personLabel(tk,p) === per); return f[p]; }""")
                pg.fill('#ans', ans if i % 4 else 'errado')
                pg.keyboard.press('Enter'); pg.wait_for_timeout(40)
                if i == 1: pg.screenshot(path=f'{OUT}/{label}-gym-feedback.png')
                pg.keyboard.press('Enter')
            pg.wait_for_timeout(100)
            pg.screenshot(path=f'{OUT}/{label}-gym-summary.png', full_page=True)
            # --- drills ---
            pg.goto('http://localhost:8765/index.html#/drills'); pg.wait_for_timeout(100)
            pg.screenshot(path=f'{OUT}/{label}-drills-setup.png', full_page=True)
            pg.click('[data-act=drill-start]')
            for i in range(10):
                pg.wait_for_timeout(40)
                opt = pg.query_selector('[data-act=drill-opt]')
                if not opt: break
                if i == 0: pg.screenshot(path=f'{OUT}/{label}-drill-choose.png')
                opt.click(); pg.wait_for_timeout(40)
                pg.fill('#ans', 'teste'); pg.keyboard.press('Enter'); pg.wait_for_timeout(40)
                if i == 0: pg.screenshot(path=f'{OUT}/{label}-drill-done.png', full_page=True)
                pg.keyboard.press('Enter')
            pg.screenshot(path=f'{OUT}/{label}-drill-summary.png')
            # --- capture ---
            pg.goto('http://localhost:8765/index.html#/capture'); pg.wait_for_timeout(100)
            pg.fill('#c-pt', 'desenrascar'); pg.fill('#c-en', 'to improvise'); pg.fill('#c-ex', 'Lá nos desenrascámos.')
            pg.click('[data-act=cap-save]'); pg.wait_for_timeout(100)
            pg.click('[data-act=cap-type][data-k=fix]'); pg.fill('#c-pt', 'Tenho visto o filme ontem'); pg.fill('#c-fix', 'Vi o filme ontem'); pg.click('[data-act=cap-save]')
            pg.click('[data-act=cap-type][data-k=bulk]'); pg.fill('#c-bulk', 'o agrafador = stapler\nmeter água; to mess up'); pg.click('[data-act=cap-save]')
            pg.wait_for_timeout(100); pg.screenshot(path=f'{OUT}/{label}-capture.png', full_page=True)
            # --- partner ---
            pg.goto('http://localhost:8765/index.html#/partner'); pg.wait_for_timeout(100)
            pg.screenshot(path=f'{OUT}/{label}-partner.png', full_page=True)
            pg.click('[data-act=p-open][data-k=tabu]'); pg.wait_for_timeout(100); pg.click('[data-act=p-word]'); pg.wait_for_timeout(100)
            pg.screenshot(path=f'{OUT}/{label}-partner-card.png', full_page=True)
            pg.click('[data-act=p-start]'); pg.wait_for_timeout(1200); pg.click('[data-act=p-stop]'); pg.wait_for_timeout(200)
            pg.fill('#nb-mistake', 'Ontem eu ia ao mercado'); pg.fill('#nb-fix', 'Ontem fui ao mercado'); pg.fill('#nb-word', 'o agrafador'); pg.fill('#nb-wordEn', 'stapler')
            pg.click('[data-act=nb-save]'); pg.wait_for_timeout(100)
            # --- write ---
            pg.goto('http://localhost:8765/index.html#/write'); pg.wait_for_timeout(100)
            pg.fill('#wtext', 'Ontem fui ao mercado e comprei fruta. Estava muito calor.')
            pg.click('[data-ins="á"]')
            pg.click('[data-act=w-save]'); pg.wait_for_timeout(100)
            pg.screenshot(path=f'{OUT}/{label}-write.png', full_page=True)
            # --- grammar ---
            pg.goto('http://localhost:8765/index.html#/grammar'); pg.wait_for_timeout(100)
            pg.click('[data-act=g-open][data-k=past]'); pg.wait_for_timeout(100)
            pg.screenshot(path=f'{OUT}/{label}-grammar.png', full_page=True)
            pg.click('[data-act=g-drill]'); pg.wait_for_timeout(150)
            assert pg.query_selector('[data-act=drill-opt]'), 'grammar->drill failed'
            # --- tables, progress, settings, more ---
            for r in ['tables', 'progress', 'settings', 'more', 'review', 'today']:
                pg.goto(f'http://localhost:8765/index.html#/{r}'); pg.wait_for_timeout(150)
                pg.screenshot(path=f'{OUT}/{label}-{r}.png', full_page=True)
            # horizontal overflow check
            ov = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            if ov > 0: errors.append(f'{label} horizontal overflow {ov}px on today')
            for r in ['review', 'gym', 'drills', 'partner', 'capture', 'write', 'grammar', 'tables', 'progress', 'settings']:
                pg.goto(f'http://localhost:8765/index.html#/{r}'); pg.wait_for_timeout(80)
                ov = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
                if ov > 0: errors.append(f'{label} horizontal overflow {ov}px on {r}')
            # persistence
            state = pg.evaluate("JSON.parse(localStorage.getItem('pois.state.v1'))")
            print(label, 'cards', len(state['cards']), 'notes', len(state['notes']), 'conj', len(state['conj']), 'days', state['days'], 'journal', len(state['journal']), 'partner', len(state['partnerLog']))
            pg.reload(); pg.wait_for_timeout(300)
            state2 = pg.evaluate("JSON.parse(localStorage.getItem('pois.state.v1'))")
            assert len(state2['cards']) == len(state['cards'])
            # merge idempotence
            merged = pg.evaluate("(() => { const a = Store.get(); const m = Store.merge(a, JSON.parse(JSON.stringify(a))); return [Object.keys(m.cards).length, Object.keys(a.cards).length, JSON.stringify(m.days) === JSON.stringify(a.days)]; })()")
            print('merge', merged)
            ctx.close()
        b.close()
finally:
    srv.terminate()
print('ERRORS:' if errors else 'NO ERRORS', *errors, sep='\n')
