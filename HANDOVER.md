# Handover: Alfacinha (26 Oct 2026)

Read `CLAUDE.md` first (architecture table, conventions, state keys). This file is the live work state.

## Live now (laffyluma.github.io/alfacinha)
| Cache | Commit | What |
|---|---|---|
| pois-v6 | 75010c5 | Transformar, Diálogos, Rádio (speech queue, say card) |
| pois-v7 | 553b69b | Conversas, Ritmo (tempo loop + click track), Missões |
| pois-v8 | 7d49b06 | Phase 1: speak-first Verbos, Verbo rápido panel, Hoje planner (2 × 30-min blocks, 5-min mode), "had done" tense |
| pois-v10 | a87a570 | Phase 2 (Construir, 187 topic words first in the deck, passive note) + Phase 4 (Ler e ouvir, lyric → card) |

## How work is done here
- **Content** is written by parallel fork agents into `data/_parts/*.js` (never committed), each validated with `node tests/content.test.js --<kind> data/_parts/<file>.js` (kinds: transform, dialogues, conversas, missions, topicvocab, build, chunks, verbsent). Then merged into `data/` with a small node script (strip each part's header/footer, concatenate, write the final file with its own header), then a fresh general-purpose agent proofreads the merged file in place. Full run: `node tests/content.test.js` and `node tests/conj.test.js` must both end with 0 failures.
- The content test has a Brazilian-marker guard (`BR` list). "toda a gente" is allowed.
- **Starting an activity from code:** use `history.pushState(null, '', '#/route')` + `P.render()` (or the activity's own start function), never `location.hash = …`: the hashchange handler calls `TTS.stop()` and cuts off the first spoken prompt.
- Local test server: `.claude/launch.json` → "alfacinha" (python http.server 8765). The browser pane caches JS: before reloading, `fetch(file, {cache:'reload'})` every script.
- Ship: bump `CACHE` in `sw.js` (and add new files to `FILES`), commit with the Co-Authored-By line, `git push origin main`, poll `https://laffyluma.github.io/alfacinha/sw.js` for the new cache name, load the live page and check the console. Never commit `*.json` or `data/_parts/`.
- Reports go to the director session `local_ff4b4148-be7e-4bc8-a0c2-2576268aa8d0` ("Rack/NEXT SESSION continuation") via SendMessage, 4 lines per piece.

## Current direction (from Ryan via the director, 26 Oct)
"I want more full phrases, verbs, words, drills… I know a lot but my recall is slow. Fun and interactive… just start a session and there's a good flow for everything." Priorities:
1. **One big "Start session" button** on Hoje: guided flow with no decisions: warm-up → due reviews → new content → speaking drill → fun finisher → summary. Short (~10 min) and long (~25 min). Mixes what exists. The planner blocks stay, but secondary.
2. **Recall speed**: timed retrieval with a gentle shrinking time window per item kind, "Got it" after the window counts as Slow (comes back sooner), speed personal bests, rapid-fire rounds, interleaving.
3. **More content**: everyday phrases (`data/chunks2.js`, `CHUNKS2`, appended to `CHUNKS`) and high-frequency verbs in real sentences (`data/verbsent.js`, `VERBSENT` = `{id, v, t, p, s:'…{form}…', en}`; the test checks `{form}` equals the engine form). Being written now by fork agents into `data/_parts/chunks_a.js`, `chunks_b.js`, `verbsent_a.js`, `verbsent_b.js`; test rules already in `tests/content.test.js`. Merge note: `chunks.js` declares `var CHUNKS = [...]`, so `chunks2.js` must end with `var CHUNKS = CHUNKS.concat(CHUNKS2);` and load after it.
4. **Fun**: combo counter, best combo, beat-the-clock rapid-fire round (PB = correct answers in 60 s), boss fights for recurring slips (boss HP 5: beat it with 5 right in a row; a miss heals it; bosses = Ryan's slips + his weakest forms), N2 route map (Chaves km 0 → Faro km ~739; km from correct answers; towns unlock a one-line fact in PT).

## Session engine: BUILT (pois-v11), see `js/session.js`. Original design notes:
- New `js/session.js` + route `#/sessao`. One item model: `{kind, label, front, answer, say, cue, window, grade(g, ms)}` built from: verb forms (`P.gymPick`/views-verbs weighting), due review cards via `P.view(id)` shown speak-first (front → reveal back → Missed/Slow/Got it → `P.gradeCard(id, 1|2|3)`), new cards (`P.newIds`), verb sentences (`VERBSENT`), transformations, Construir items, dialogue B lines.
- Flow (short / long): warm-up rapid-fire verbs 60 s → reviews (10 / 25) → new (3 / 6) → speaking drill (5 / 10, alternating Transformar / Construir / verb sentences) → finisher (boss fight or beat-the-clock; long adds one Conversa question) → summary (items, accuracy, best combo, PBs, km on the N2, streak).
- Time window per kind (verbs 5 s, cards 8 s, verb sentences 9 s, transformations/build 12 s), shrinking 6% after each fast Got it, growing 10% after Slow/Missed, kept in `S().fun.win[kind]`. Show a draining bar; reveal after the window caps the grade at Slow.
- State: `S().fun = { win:{}, pb:{ rapid, combo }, bosses:{ key:{ hp, beaten } }, km }` (add to `fresh()`, merge with max, prune).
- Hoje: big "Start session" (Short / Long) at the top; the two planner blocks move into a collapsed "Plan by blocks" section.

## 26 Oct, later: content volume (pois-v12)
+287 everyday phrases (reactions, small talk, opinions, plans, texting/WhatsApp, phone, feelings, time, help, fillers → `CHUNKS2` now 432), +200 verb sentences on the slow tenses (`vc_*`: would / if I were / "that I…" / when-future / for me to / had done; `vd_*`: did / used to / lately / hei de / will → `VERBSENT` now 361), +12 branching conversations (`c_*` → 28). Proofread by two fresh agents. After this, the director asked to PAUSE and wait for Ryan's feedback from real use on the phone.
