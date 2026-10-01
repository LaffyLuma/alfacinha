/* European Portuguese conjugation engine.
   Persons: 0 eu, 1 tu, 2 ele/ela/você, 3 nós, 4 eles/elas/vocês  (vós omitted) */
(function (root) {
  const PERSONS = ['eu', 'tu', 'ele/ela/você', 'nós', 'eles/elas/vocês'];
  const TENSES = [
    { k: 'pres', pt: 'Presente', en: 'Present', lvl: 'A1' },
    { k: 'pps', pt: 'Pretérito perfeito', en: 'Simple past (completed)', lvl: 'A2' },
    { k: 'pimp', pt: 'Pretérito imperfeito', en: 'Imperfect (was -ing / used to)', lvl: 'A2' },
    { k: 'ppc', pt: 'Pretérito perfeito composto', en: 'Have been -ing lately (tenho + particípio)', lvl: 'A2' },
    { k: 'imp', pt: 'Imperativo', en: 'Commands (tu / você / vocês)', lvl: 'A2' },
    { k: 'fut', pt: 'Futuro', en: 'Future (will)', lvl: 'B1' },
    { k: 'cond', pt: 'Condicional', en: 'Conditional (would)', lvl: 'B1' },
    { k: 'cpres', pt: 'Conjuntivo presente', en: 'Present subjunctive', lvl: 'B1' },
    { k: 'cimp', pt: 'Conjuntivo imperfeito', en: 'Past subjunctive', lvl: 'B1' },
    { k: 'cfut', pt: 'Conjuntivo futuro', en: 'Future subjunctive (quando/se…)', lvl: 'B1' },
    { k: 'infp', pt: 'Infinitivo pessoal', en: 'Personal infinitive (para tu veres, antes de saíres)', lvl: 'B1' },
    { k: 'hav', pt: 'Haver de + infinitivo', en: 'Going to, with conviction (hei de ir)', lvl: 'B1' },
  ];
  const TENSE = Object.fromEntries(TENSES.map(t => [t.k, t]));

  const END = {
    ar: { pres: ['o', 'as', 'a', 'amos', 'am'], pps: ['ei', 'aste', 'ou', 'ámos', 'aram'], pimp: ['ava', 'avas', 'ava', 'ávamos', 'avam'], cpres: ['e', 'es', 'e', 'emos', 'em'] },
    er: { pres: ['o', 'es', 'e', 'emos', 'em'], pps: ['i', 'este', 'eu', 'emos', 'eram'], pimp: ['ia', 'ias', 'ia', 'íamos', 'iam'], cpres: ['a', 'as', 'a', 'amos', 'am'] },
    ir: { pres: ['o', 'es', 'e', 'imos', 'em'], pps: ['i', 'iste', 'iu', 'imos', 'iram'], pimp: ['ia', 'ias', 'ia', 'íamos', 'iam'], cpres: ['a', 'as', 'a', 'amos', 'am'] },
  };
  const FUT = ['ei', 'ás', 'á', 'emos', 'ão'];
  const COND = ['ia', 'ias', 'ia', 'íamos', 'iam'];
  const TER = ['tenho', 'tens', 'tem', 'temos', 'têm'];
  const HAV = ['hei de', 'hás de', 'há de', 'havemos de', 'hão de'];

  // spelling: -ar stem before e
  function arBeforeE(stem) {
    if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu';
    if (stem.endsWith('ç')) return stem.slice(0, -1) + 'c';
    if (stem.endsWith('g')) return stem.slice(0, -1) + 'gu';
    return stem;
  }
  // spelling: -er/-ir stem before o/a
  function erBeforeOA(stem) {
    if (stem.endsWith('gu')) return stem.slice(0, -2) + 'g';
    if (stem.endsWith('c')) return stem.slice(0, -1) + 'ç';
    if (stem.endsWith('g')) return stem.slice(0, -1) + 'j';
    return stem;
  }
  function replaceLast(str, from, to) {
    const i = str.lastIndexOf(from);
    return i < 0 ? str : str.slice(0, i) + to + str.slice(i + from.length);
  }
  const ACC = { a: 'á', e: 'é', i: 'í', o: 'ô', u: 'ú' };
  function accentLastVowel(s, strong) {
    for (let i = s.length - 1; i >= 0; i--) {
      const c = s[i];
      if ('áéíóúâêôãõ'.includes(c)) return s;
      if ('aeiou'.includes(c)) {
        let r = ACC[c];
        if (c === 'e' && !strong) r = 'ê';
        return s.slice(0, i) + r + s.slice(i + 1);
      }
    }
    return s;
  }

  function conjugate(def) {
    const v = def.v;
    const o = def.ov || {};
    const type = v === 'pôr' ? 'er' : v.slice(-2);
    const stem = v.slice(0, -2);
    const E = END[type];
    const f = {};
    const isEar = type === 'ar' && v.endsWith('ear');

    // presente
    if (o.pres) f.pres = o.pres.slice();
    else {
      f.pres = E.pres.map((e, p) => {
        let s = stem;
        if (p === 0 && type !== 'ar') {
          s = erBeforeOA(s);
          if (def.eI) s = replaceLast(s, 'e', 'i');
          if (def.oU) s = replaceLast(s, 'o', 'u');
        }
        if (def.uO && (p === 1 || p === 2 || p === 4)) s = replaceLast(s, 'u', 'o');
        if (isEar && p !== 3) s = s + 'i';
        let form = s + e;
        if (def.uzir && p === 2) form = form.slice(0, -1); // conduz
        return form;
      });
    }
    // perfeito
    if (o.pps) f.pps = o.pps.slice();
    else f.pps = E.pps.map((e, p) => ((type === 'ar' && p === 0) ? arBeforeE(stem) : stem) + e);
    // imperfeito
    f.pimp = o.pimp ? o.pimp.slice() : E.pimp.map(e => stem + e);
    // futuro / condicional
    const fs = o.futStem || v.replace('ô', 'o');
    f.fut = FUT.map(e => fs + e);
    f.cond = COND.map(e => fs + e);
    // conjuntivo presente
    if (o.cpres) f.cpres = o.cpres.slice();
    else {
      let s;
      if (type === 'ar') s = arBeforeE(f.pres[0].replace(/o$/, ''));
      else s = f.pres[0].replace(/o$/, '');
      f.cpres = E.cpres.map((e, p) => {
        if (isEar && p === 3) return arBeforeE(stem) + e; // passeemos
        return s + e;
      });
    }
    // conjuntivo imperfeito / futuro from 3pl perfeito
    const S = f.pps[4].replace(/ram$/, '');
    const strong = !!o.pps;
    f.cimp = o.cimp ? o.cimp.slice() : ['sse', 'sses', 'sse', 'ssemos', 'ssem'].map((e, p) => (p === 3 ? accentLastVowel(S, strong) : S) + e);
    f.cfut = o.cfut ? o.cfut.slice() : ['r', 'res', 'r', 'rmos', 'rem'].map(e => S + e);
    // particípio
    f.part = o.part || (stem + (type === 'ar' ? 'ado' : 'ido'));
    f.ppc = TER.map(t => t + ' ' + f.part);
    // infinitivo pessoal: sair → saíres/saírem (hiatus í), pôr → pores
    const base = v.replace('ô', 'o');
    const acc = /[aeiou]ir$/.test(v) && !/[gq]uir$/.test(v) ? base.slice(0, -2) + 'ír' : base;
    f.infp = [v, acc + 'es', v, base + 'mos', acc + 'em'];
    // haver de + infinitivo
    f.hav = HAV.map(h => h + ' ' + v);
    // imperativo: tu (affirmative), você, vocês
    const impTu = o.impTu !== undefined ? o.impTu : f.pres[2];
    f.imp = impTu === null ? [null, null, null, null, null] : [null, impTu, f.cpres[2], null, f.cpres[4]];
    // impersonal verbs
    if (def.persons) {
      f.imp = [null, null, null, null, null];
      for (const k of ['pres', 'pps', 'pimp', 'fut', 'cond', 'cpres', 'cimp', 'cfut', 'ppc', 'infp', 'hav']) {
        f[k] = f[k].map((x, p) => def.persons.includes(p) ? x : null);
      }
    }
    if (o.fix) for (const k in o.fix) f[k] = o.fix[k].map((x, p) => x === undefined || x === '' ? f[k][p] : x);
    return f;
  }

  // Alternative accepted answers (EP accepts both)
  const ALT = {
    'deem': ['dêem'], 'veem': ['vêem'], 'leem': ['lêem'], 'creem': ['crêem'], 'ouço': ['oiço'], 'ouça': ['oiça'], 'ouças': ['oiças'], 'ouçamos': ['oiçamos'], 'ouçam': ['oiçam'],
  };

  const api = { PERSONS, TENSES, TENSE, conjugate, ALT, accentLastVowel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Conj = api;
})(this);
