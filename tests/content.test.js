/* Content checks for the speaking drills: transformations (data/transform.js) and minus-one dialogues (data/dialogues.js).
   Run: node tests/content.test.js
   Partial check of one file while writing content (skips the totals and coverage checks):
     node tests/content.test.js --transform path/to/part.js
     node tests/content.test.js --dialogues path/to/part.js */
const path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const argOf = k => { const i = args.indexOf(k); return i >= 0 ? path.resolve(args[i + 1]) : null; };
const partial = args.length > 0;
const tPath = argOf('--transform') || (partial ? null : path.join(ROOT, 'data', 'transform.js'));
const dPath = argOf('--dialogues') || (partial ? null : path.join(ROOT, 'data', 'dialogues.js'));

const Conj = require(path.join(ROOT, 'js', 'conj.js'));
const VERBS = require(path.join(ROOT, 'data', 'verbs.js'));
const FORMS = Object.fromEntries(VERBS.map(v => [v.v, Conj.conjugate(v)]));
const TRANSFORM = tPath ? require(tPath).TRANSFORM : [];
const DIALOGUES = dPath ? require(dPath).DIALOGUES : [];

let fails = 0, checks = 0;
const fail = (where, msg) => { fails++; console.log(`FAIL ${where}: ${msg}`); };
const check = (cond, where, msg) => { checks++; if (!cond) fail(where, msg); };

// Whole-word match that understands accented letters (\b does not).
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasWord = (text, w) => new RegExp(`(?<![\\p{L}\\p{M}])${escRe(w)}(?![\\p{L}\\p{M}])`, 'iu').test(text);
const words = s => s.trim().split(/\s+/).filter(x => /[\p{L}\d]/u.test(x)).length;

// ---------- Brazilian-marker guard ----------
const BR = [
  [/\b(est(ou|ás|á|amos|ão)|estava\w*)\s+\w+ndo\b/i, '-ndo progressive (use estar a + infinitivo)'],
  [/(?<![\p{L}])(estou|estás|está|estamos|estão|estava|estavas|estávamos|estavam|fico|ficou|continua|continuo|ando|anda)\s+[\p{L}]+ndo(?![\p{L}])/iu, '-ndo progressive (use estar a + infinitivo)'],
  [/\ba gente\b/, '"a gente"'],
  [/(?<![\p{L}])(legal|ônibus|onibus|trem|celular|tchau|banheiro|café da manhã|sorvete|açougue|bonde)(?![\p{L}])/iu, 'Brazilian word'],
  [/(?<![\p{L}])(pra|pro|tela|mouse|geladeira|arquivo|arquivos|deletar|deletei|cadastro|xícara|suco|galera|bacana|garoto|garota|planejar|planejei|planejamos|registro|acessar|acessei|equipe|contato|time de futebol|moça|ônibus)(?![\p{L}])/iu, 'Brazilian word or spelling'],
  [/(?<![\p{L}])(salvar|salvei|salvaste|salvou|salvámos)\s+(o|a|os|as)\s+(ficheiro|projeto|projecto|faixa|trabalho|documento)/iu, '"salvar" a file (EP: guardar / gravar)'],
];
function guard(where, s) {
  if (typeof s !== 'string') return;
  for (const [re, msg] of BR) { checks++; if (re.test(s)) fail(where, `${msg} in "${s}"`); }
}

// ---------- transformations ----------
const KINDS = ['person', 'tense', 'question', 'negate', 'pronoun', 'polite', 'passive', 'reported'];
const TOPICS = ['daily', 'bike', 'games', 'music', 'tech', 'friends', 'errands', 'work', 'slips'];
const TERMS = /(imperfeito|perfeito|condicional|conjuntivo|subjuntivo|infinitivo|pretérito|futuro|presente|imperativo|subjunctive|conditional|imperfect|preterite)/i;
const tIds = new Set();
TRANSFORM.forEach((it, n) => {
  const W = `transform[${n}] ${it.id}`;
  check(typeof it.id === 'string' && it.id && !tIds.has(it.id), W, 'missing or duplicate id'); tIds.add(it.id);
  check(typeof it.base === 'string' && it.base.trim(), W, 'base missing');
  check(typeof it.en === 'string' && it.en.trim(), W, 'en missing');
  check(['A2', 'B1'].includes(it.lvl), W, `lvl must be A2 or B1 (got ${it.lvl})`);
  check(TOPICS.includes(it.topic), W, `topic not allowed: ${it.topic}`);
  check(!!FORMS[it.v], W, `verb not in VERBS: ${it.v}`);
  check(!!Conj.TENSE[it.t], W, `tense not in Conj.TENSE: ${it.t}`);
  if (it.base) {
    const wc = words(it.base); check(wc >= 6 && wc <= 14, W, `base should be 6–14 words (has ${wc}): ${it.base}`);
    if (FORMS[it.v] && Conj.TENSE[it.t]) check(FORMS[it.v][it.t].some(f => f && hasWord(it.base, f)), W, `no ${it.v}/${it.t} form found in base "${it.base}" (forms: ${FORMS[it.v][it.t].filter(Boolean).join(', ')})`);
    guard(W + ' base', it.base);
  }
  check(Array.isArray(it.tr) && it.tr.length >= 3 && it.tr.length <= 5, W, `needs 3–5 transformations (has ${it.tr && it.tr.length})`);
  (it.tr || []).forEach((x, i) => {
    const w = `${W} tr[${i}]`;
    check(KINDS.includes(x.kind), w, `kind not allowed: ${x.kind}`);
    check(typeof x.ask === 'string' && x.ask.trim(), w, 'ask missing');
    if (x.ask) check(/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,}/.test(x.ask), w, `ask should put the key in CAPS: "${x.ask}"`);
    if (x.ask && x.kind === 'tense') check(!TERMS.test(x.ask), w, `tense ask must use the pattern label, not the grammar term: "${x.ask}"`);
    check(Array.isArray(x.a) && x.a.length && x.a.every(s => typeof s === 'string' && s.trim()), w, 'a[] missing or empty');
    check(typeof x.why === 'string' && x.why.trim(), w, 'why missing');
    if (x.why) check(x.why.length <= 140, w, `why is ${x.why.length} chars (max 140): ${x.why}`);
    check(Array.isArray(x.mark) && x.mark.length > 0, w, 'mark[] missing');
    if (Array.isArray(x.a) && x.a[0]) {
      (x.mark || []).forEach(m => check(hasWord(x.a[0], m), w, `mark "${m}" not found as a whole word in "${x.a[0]}"`));
      const wc = words(x.a[0]); check(wc <= 20, w, `answer too long (${wc} words)`);
      check(x.a[0].trim() !== (it.base || '').trim(), w, 'answer is identical to the base');
    }
    if (x.kind === 'tense') check(!!Conj.TENSE[x.t], w, `tense transformation needs t (target tense), got ${x.t}`);
    if (x.t !== undefined) check(!!Conj.TENSE[x.t], w, `t not in Conj.TENSE: ${x.t}`);
    if (x.v !== undefined) check(!!FORMS[x.v], w, `v not in VERBS: ${x.v}`);
    if (x.p !== undefined) check([0, 1, 2, 3, 4].includes(x.p), w, `p must be 0–4: ${x.p}`);
    if (x.v && x.t && x.p !== undefined && FORMS[x.v] && FORMS[x.v][x.t]) {
      const f = FORMS[x.v][x.t][x.p];
      check(!!f, w, `no form for ${x.v}/${x.t}/${x.p}`);
      if (f && x.a && x.a[0]) check(hasWord(x.a[0], f), w, `form "${f}" (${x.v}/${x.t}/${x.p}) not in answer "${x.a[0]}"`);
    }
    if (x.hint !== undefined) check(typeof x.hint === 'string' && x.hint.trim(), w, 'hint must be a non-empty string');
    (x.a || []).forEach(s => guard(w + ' a', s)); guard(w + ' hint', x.hint);
  });
});

// ---------- dialogues ----------
const DTOPICS = ['bike', 'cafe', 'health', 'errands', 'phone', 'friends', 'games', 'music', 'tech', 'family', 'canada', 'class'];
const dIds = new Set();
DIALOGUES.forEach((d, n) => {
  const W = `dialogue[${n}] ${d.id}`;
  check(typeof d.id === 'string' && d.id && !dIds.has(d.id), W, 'missing or duplicate id'); dIds.add(d.id);
  ['title', 'en', 'target', 'terms'].forEach(k => check(typeof d[k] === 'string' && d[k].trim(), W, `${k} missing`));
  check(DTOPICS.includes(d.topic), W, `topic not allowed: ${d.topic}`);
  check(['A2', 'B1'].includes(d.lvl), W, `lvl must be A2 or B1 (got ${d.lvl})`);
  check(d.roles && d.roles.A && d.roles.B === 'Ryan', W, 'roles must be { A: <name>, B: "Ryan" }');
  check(typeof d.formal === 'boolean', W, 'formal must be true or false');
  check(Array.isArray(d.lines) && d.lines.length >= 8 && d.lines.length <= 14, W, `needs 8–14 lines (has ${d.lines && d.lines.length})`);
  let bMarks = 0, run = 1;
  (d.lines || []).forEach((l, i) => {
    const w = `${W} line ${i}`;
    check(l.r === 'A' || l.r === 'B', w, `role must be A or B: ${l.r}`);
    check(typeof l.pt === 'string' && l.pt.trim(), w, 'pt missing');
    check(typeof l.en === 'string' && l.en.trim(), w, 'en missing');
    if (i > 0) { run = l.r === d.lines[i - 1].r ? run + 1 : 1; check(run <= 2, w, 'more than two lines in a row from the same role'); }
    if (l.r === 'B') {
      check(typeof l.hint === 'string' && l.hint.trim(), w, 'B line needs hint');
      check(Array.isArray(l.mark) && l.mark.length > 0, w, 'B line needs mark[]');
      (l.mark || []).forEach(m => check(hasWord(l.pt || '', m), w, `mark "${m}" not found as a whole word in "${l.pt}"`));
      bMarks += (l.mark || []).length;
    }
    guard(w, l.pt); guard(w + ' hint', l.hint);
    if (d.formal === false) { checks++; if (/(?<![\p{L}])você(s)?(?![\p{L}])/iu.test(l.pt || '')) fail(w, `"você" in a dialogue with formal: false: "${l.pt}"`); }
  });
  check(bMarks >= 3, W, `B lines should use the target at least 3 times (only ${bMarks} marked words)`);
  check(Array.isArray(d.notes) && d.notes.length >= 2 && d.notes.length <= 4, W, `needs 2–4 notes (has ${d.notes && d.notes.length})`);
});

// ---------- totals and coverage (full run only) ----------
if (!partial) {
  check(TRANSFORM.length >= 70, 'transform', `at least 70 items needed (has ${TRANSFORM.length})`);
  const nTr = TRANSFORM.reduce((a, it) => a + it.tr.length, 0);
  const lv = k => TRANSFORM.filter(it => it.lvl === k).length;
  check(lv('A2') >= 20, 'transform', `about 25 A2 items expected (has ${lv('A2')})`);
  check(lv('B1') >= 40, 'transform', `about 45 B1 items expected (has ${lv('B1')})`);
  const allTr = TRANSFORM.flatMap(it => it.tr.map(x => ({ it, x })));
  KINDS.forEach(k => check(allTr.some(({ x }) => x.kind === k), 'transform coverage', `no transformation of kind "${k}"`));
  ['pps', 'pimp', 'ppc', 'cond', 'fut', 'cpres', 'cimp', 'cfut', 'infp', 'hav'].forEach(t =>
    check(allTr.some(({ x }) => x.kind === 'tense' && x.t === t), 'transform coverage', `no tense shift into "${Conj.label ? Conj.label(t) : t}" (${t})`));
  TOPICS.forEach(t => check(TRANSFORM.some(it => it.topic === t), 'transform coverage', `no item with topic "${t}"`));
  check(TRANSFORM.filter(it => it.topic === 'slips').length >= 5, 'transform coverage', 'at least 5 "slips" items expected');
  const ans = allTr.map(({ x }) => x.a[0]);
  [[/queres ir/i, 'queres ir'], [/(?<![\p{L}])vou ao(?![\p{L}])/iu, 'vou ao'], [/esqueci-me/i, 'esqueci-me'], [/(?<![\p{L}])sim(?![\p{L}])/iu, 'sim']].forEach(([re, l]) =>
    check(ans.some(s => re.test(s)), 'transform slips', `no answer uses "${l}"`));
  check(allTr.some(({ x }) => /(?<![\p{L}])em(?![\p{L}])/iu.test(x.why) && /(?<![\p{L}])(no|na)(?![\p{L}])/iu.test(x.why)), 'transform slips', 'no transformation explains em vs no/na');
  check(allTr.some(({ x }) => x.kind === 'pronoun' && /(?<![\p{L}])já te(?![\p{L}])/iu.test(x.a[0])), 'transform coverage', 'no pronoun transformation with "já te"');
  check(allTr.some(({ x }) => x.kind === 'polite' && /(?<![\p{L}])(queria|podia)(?![\p{L}])/iu.test(x.a[0])), 'transform coverage', 'no polite transformation with Queria / Podia');

  check(DIALOGUES.length >= 24, 'dialogues', `at least 24 dialogues needed (has ${DIALOGUES.length})`);
  DTOPICS.forEach(t => { const c = DIALOGUES.filter(d => d.topic === t).length; check(c >= 2, 'dialogue coverage', `topic "${t}" needs 2 dialogues (has ${c})`); });
  const targets = DIALOGUES.map(d => d.target.toLowerCase()).join(' | ');
  ['did', 'used to', 'have been doing lately', 'would', 'pronoun', 'for me to', 'hei de', 'that i', 'passive'].forEach(p =>
    check(targets.includes(p), 'dialogue coverage', `no dialogue targets "${p}"`));
  check(DIALOGUES.some(d => d.formal), 'dialogue coverage', 'no formal dialogue');
  check(tIds.size === TRANSFORM.length && dIds.size === DIALOGUES.length, 'ids', 'duplicate ids');
  const nLines = DIALOGUES.reduce((a, d) => a + d.lines.length, 0);
  console.log(`${TRANSFORM.length} transformation items (${lv('A2')} A2, ${lv('B1')} B1), ${nTr} transformations · ${DIALOGUES.length} dialogues, ${nLines} lines`);
}
console.log(`${checks} checks, ${fails} failures`);
process.exitCode = fails ? 1 : 0;
