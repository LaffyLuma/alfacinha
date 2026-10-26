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
| `data/transform.js` | 72 transformation items (`TRANSFORM`): `base` + `tr[]` of `{kind, ask, a[], mark[], why, hint?, v?, t?, p?}`. Kinds: person/tense/question/negate/pronoun/polite/passive/reported. Checked by `tests/content.test.js` |
| `data/dialogues.js` | 24 minus-one dialogues (`DIALOGUES`): Ryan is always role B; B lines carry `hint` + `mark`; `formal` dialogues use o senhor / você |
| `data/vocab3.js` | 187 topic words (`VOCAB_TOPIC`, appended to `VOCAB`): bike, games, friends, music, audio, tech; `P.deck()` serves these themes before the generic deck |
| `data/build.js` | 153 sentence-building items (`BUILD`): `{id, en, hints[2–3], a[], mark[], why, pat, topic, t?}` |
| `data/media.js` | Ler e ouvir: `BOOKS` (parallel-reading list; editions not guaranteed, links to Kobo/Wook searches) and `ARTISTS` |
| `data/conversas.js` | 16 scripted conversations (`CONVERSAS`): `nodes[]` of `{id, q, en, models[], mark[], check[], choices?|next?}`; first node starts, `choices` branch on what he said |
| `data/missions.js` | 40 Lisbon missions (`MISSIONS`): `{id, title, en, task, where, lvl, phrases[{pt,en}]}`; three a week |
| `js/fsrs.js` | FSRS-4.5 scheduler with default weights |
| `js/store.js` | State in localStorage (`pois.state.v1`), optional linked save file (File System Access API), export/import, `merge()` (latest review wins per card, note tombstones, reset-aware), `fingerprint()` |
| `js/drive.js` | Google Drive sync: GIS token client, scope `drive.appdata`, one file `pois-progress.json` in appDataFolder; sync = pull → merge → push, 4 s after changes. Tokens last about 1 h; after that the user taps "Sync" because browsers block popups that aren't started by a tap |
| `js/speak.js` | Speech sequencing on `P.TTS`: `say()` → Promise, `stop()`, `pause()`, `token()`, `voices2()`, `sayOrRead()`; `P.sayCard()` (shared speak → reveal → grade card); `P.markHTML`; `P.flag` / `P.takeFlagged` (radio flags); `P.leave[route]` cleanup hooks (the router calls `TTS.stop()` on every route change) |
| `js/core.js` | Content indexes, card ids (`v:`/`c:`/`n:`/`f:` + `:rec`/`:prod`/`:fix`/`:form`), answer checking (accent-lenient), TTS (prefers pt-PT) |
| `js/views-study.js` | Review session, conjugation gym, context drills, verb tables |
| `js/views-other.js` | Today, partner mode, write, grammar, capture, progress, settings (including the Drive card) |
| `js/views-speak.js` | Falar hub, Transformations (`#/transform`), Dialogues (`#/dialogues`), Radio (`#/radio`), `P.focusTense()` |
| `js/views-extra.js` | Conversas (`#/conversas`), Ritmo (`#/ritmo`: tempo-ramped shadowing loops + verbs on a WebAudio click track), Missões (`#/missoes`: weekly shuffle by ISO week, `P.missionsWeekDone()`) |
| `js/verbkit.js` | `P.vform/vformHTML` (stem/ending split, irregular part vs the regular pattern, tense colour families `.tc-*`), `P.isIrr`, `P.CUE` (ontem/antigamente/…), `P.vsay` |
| `js/views-verbs.js` | Verbos (`#/gym`): speak-first verb drill (cue → say → reveal → 1/2/3), ★ irregulars, follow-up chains, one help line after a miss, `P.startVerbDrill({minutes, tenses, verb})`, `P.queueDrill`. The typed sprint moved to `#/sprint` (`V.sprint` in views-study.js) |
| `js/panel.js`, `css/panel.css` | Verbo rápido lookup panel (top-bar button, `P.openPanel(ctx)`); pages set `P.panelCtx`; opening it during a drill's cue counts as a peek (graded Slow at best) |
| `js/planner.js` | Hoje planner: focus per weekday (`P.todayFocus`, `P.planFocusTenses`), two guided ~30-min blocks with a session bar and hand-off via `P.stepDone(kind)` from each activity's end screen, 5-min mode |
| `js/views-build.js` | Construir (`#/construir`): English idea + hints → say the whole sentence → model + note → 1/2/3; `P.startBuild(focus)` for the planner |
| `js/views-read.js` | Ler e ouvir (`#/ler`): reading log (`reading[]`, `readCur`), book and music lists, lyric → card (paste a line, tap first/last word, becomes a note card) |
| `js/main.js` | Hash router, nav, global `data-act` click delegation, boot |
| `sw.js` | Network-first offline cache. **Bump `CACHE`** whenever files change |
| `config.js` | `window.POIS_CONFIG.googleClientId`. Not secret |

State added in Oct 2026: `trans`, `dialog`, `radio` (top level) and settings `transLen`, `radioGap`, `radioLen`, `radioMix`; day counters `trans`, `transSessions`, `dialog`, `radioMin` (all count for the streak). Added 26 Oct 2026: `conv`, `ritmo` (`loop`, `bpm`, `last`), `missions`; day counters `conv`, `ritmo`, `mission`. Tenses have a plain-English `pat` label: `Conj.label(k)`. Added 26 Oct 2026: tense `mqp` = had done (tinha + particípio); settings `sayTenses` ([] = all), `saySets`, `sayLen`; day counters `vsay`, `vsaySessions`, `amDone`, `pmDone`, `planMin`. Start activities from code with `history.pushState` + render, not `location.hash` (the hashchange handler stops speech).

Conventions: views render HTML strings into `#view`; buttons use `data-act="name"`, which maps to `Pois.actions[name]`; keyboard handlers are in `Pois.keys[route]`. Call `Store.change()` after mutating state (pass `{silent:true}` to skip the re-render).

## Testing
`python3 tests/e2e.py` and `python3 tests/drive_sync.py` both serve `app/` on localhost and need Playwright with Chromium. `node tests/conj.test.js` checks conjugations; `node tests/content.test.js` checks the transformation and dialogue content (EP rules, Brazilian-marker guard, coverage). The node tests find the app folder themselves; the Python tests assume the app is at `/home/claude/app`, so adjust `ROOT` / `-d` to wherever this folder lives.

## B1 course
Ryan's class (Lisbon Language Café B1) is the topic guide, not something to copy: imperfeito, condicional, object pronouns, infinitivo pessoal, haver de, PPC, and the conjuntivo for his class presentations. Don't put classmates' names or the course site password from his handouts into this public repo.

## Ideas not built yet
- Speaking practice: record yourself and compare against TTS. Avoid the Web Speech API recognition, because it sends audio to Google.
- Ask the girlfriend to check the example sentences for naturalness. Claude wrote them all.

## Planned work (Oct 2026)
- `../Audit and Plan.md`: audit of the app against Ryan's learning brief and the phased plan. Read it before proposing features.
- `../Build Spec - Speaking Drills.md`: full build spec for three features (transformation drills, minus-one dialogues, radio mode). Built and live (pois-v6).
- 26 Oct 2026 (Ryan: "keep building"): built Phase 3 Conversas (scripted only, no Claude API), backlog Ritmo (tempo loops + click track) and Lisbon missions (pois-v7), then Phase 1: speak-first verb drill, verb panel, planner + 5-min mode (pois-v8). Then Phase 2: topic vocab packs, sentence building, passive grammar note; Phase 4 Ler e ouvir (pois-v10). Still unbuilt: Phase 1d reminders, Phase 2 production-first review flip and foundations check, Phase 5 polish. NEXT (Ryan, 26 Oct, via the director session): one big "Start session" guided flow and recall-speed features; see HANDOVER.md. Don't add the Claude-API partner unless Ryan says yes.
- Ryan does not want to be asked "shall I build this?" repeatedly. When given a spec, build it; when thinking, just think.
