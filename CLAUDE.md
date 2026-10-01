# Alfacinha Incubator (formerly Pois): handoff notes for Claude Code

## Who / what
Ryan is Canadian and has lived in Lisbon for about 4 years. He is around A2 in **European** Portuguese and has started a B1 course at the Lisbon Language Cafe. His girlfriend is Portuguese (a native speaker, not a teacher). His weak spots are verb conjugation (especially the past tenses) and vocabulary. His comprehension is decent.
**Pois** is a local-first study app built for him: vanilla HTML/CSS/JS, no build step, no framework, no backend.
Background research and the study plan are in `../Research and Game Plan.md`.

Ryan is **not a developer**. Explain steps plainly and don't assume he knows git or the terminal.

## Current status
- The app is complete and tested: Playwright e2e at desktop and mobile widths, plus a two-device Drive sync test against a mocked Google sign-in and Drive API. The tests are in `tests/`.
- **The next step, which Ryan was stuck on:** deploying to **GitHub Pages** and creating a **Google OAuth client ID** so Drive sync works. Full click-by-click steps are in `README.md`. He is logged into GitHub but hasn't created the repo yet. Walk him through it step by step, or do it for him: e.g. `git init`, then `gh repo create pois --public --source=. --push`, then enable Pages (main, root) via `gh api`. If you do it for him, check that `gh` is installed and authenticated first.
- Once Pages is live at `https://<user>.github.io/pois/`:
  1. Create the OAuth client in Google Cloud Console. It needs: Drive API enabled, Google Auth Platform set to External / Testing with Ryan as a test user, and a Web client with JS origin `https://<user>.github.io`. He has to click through this himself.
  2. Put the client ID into `config.js` and push it.
  3. On each device, open the URL → Definições → Connect Google Drive.
- **Never** commit `pois-progress.json` or backup `*.json` files. Add a `.gitignore` for them.

## Architecture
| File | Role |
|---|---|
| `index.html` | Shell. Loads the scripts in order: data → conj → fsrs → store → config → core → views → drive → main |
| `data/verbs.js` | 146 verbs with overrides for irregular forms; sets are `irr` / `stem` / `reg` |
| `js/conj.js` | EP conjugation engine for 12 "tenses" (pres, pps, pimp, ppc, imp, fut, cond, cpres, cimp, cfut, plus infp = infinitivo pessoal and hav = haver de + inf). Persons 0–4: eu, tu, ele, nós, eles (no vós) |
| `data/vocab1.js`, `vocab2.js` | 439 entries: `[word, en, type, 'sentence with {cloze}', sentence_en, theme]` |
| `data/chunks.js` | 80 expressions: `[chunk, meaning, note, example with {cloze}, example_en]` |
| `data/drills.js` | Context drills: past / ppc / serestar / subj / hipot / infp / pron. The answer is generated from `v,t,p`, except `pron` drills, which carry a literal answer `a` plus `cue` and `pos`. `cond` answers also accept the imperfeito |
| `data/grammar.js`, `data/partner.js` | Grammar notes (HTML); partner guide, partner cards, writing prompts |
| `js/fsrs.js` | FSRS-4.5 scheduler with default weights |
| `js/store.js` | State in localStorage (`pois.state.v1`), optional linked save file (File System Access API), export/import, `merge()` (latest review wins per card, note tombstones, reset-aware), `fingerprint()` |
| `js/drive.js` | Google Drive sync: GIS token client, scope `drive.appdata`, one file `pois-progress.json` in appDataFolder; sync = pull → merge → push, 4 s after changes. Tokens last about 1 h; after that the user taps "Sync" because browsers block popups that aren't started by a tap |
| `js/core.js` | Content indexes, card ids (`v:`/`c:`/`n:`/`f:` + `:rec`/`:prod`/`:fix`/`:form`), answer checking (accent-lenient), TTS (prefers pt-PT) |
| `js/views-study.js` | Review session, conjugation gym, context drills, verb tables |
| `js/views-other.js` | Today, partner mode, write, grammar, capture, progress, settings (including the Drive card) |
| `js/main.js` | Hash router, nav, global `data-act` click delegation, boot |
| `sw.js` | Network-first offline cache. **Bump `CACHE`** whenever files change |
| `config.js` | `window.POIS_CONFIG.googleClientId`. Not secret |

Conventions: views render HTML strings into `#view`; buttons use `data-act="name"`, which maps to `Pois.actions[name]`; keyboard handlers are in `Pois.keys[route]`. Call `Store.change()` after mutating state (pass `{silent:true}` to skip the re-render).

## Testing
`python3 tests/e2e.py` and `python3 tests/drive_sync.py` both serve `app/` on localhost and need Playwright with Chromium. `node tests/conj.test.js` checks conjugations. The test paths assume the app is at `/home/claude/app`, so adjust `ROOT` / `-d` to wherever this folder lives.

## B1 course
Ryan's class (Lisbon Language Café B1) is the topic guide, not something to copy: imperfeito, condicional, object pronouns, infinitivo pessoal, haver de, PPC, and the conjuntivo for his class presentations. Don't put classmates' names or the course site password from his handouts into this public repo.

## Ideas not built yet
- Speaking practice: record yourself and compare against TTS. Avoid the Web Speech API recognition, because it sends audio to Google.
- Ask the girlfriend to check the example sentences for naturalness. Claude wrote them all.
