/* Verb kit shared by the speak-first verb drill and the verb panel: irregular detection (diff against the
   regular pattern), stem/ending split, tense colour families, cue words, and coloured form HTML. */
(function (P) {
  const { esc } = P;
  const REG = {};
  // What the form would be if the verb followed the regular pattern for its ending (-ar/-er/-ir).
  const regForms = v => REG[v] || (REG[v] = Conj.conjugate({ v }));
  // Tense colour families (one colour per family, used everywhere these features show a tense)
  const FAM = { pres: 'pres', pps: 'pps', pimp: 'pimp', ppc: 'ppc', mqp: 'mqp', imp: 'imp', fut: 'fut', cond: 'cond', cpres: 'subj', cimp: 'subj', cfut: 'subj', infp: 'infp', hav: 'hav' };
  P.tfam = t => FAM[t] || 'pres';
  // Words that set up each pattern when spoken: "ontem, eu, fazer" → "ontem eu fiz"
  P.CUE = { pres: 'hoje', pps: 'ontem', pimp: 'antigamente', ppc: 'ultimamente', mqp: 'já', imp: '', fut: 'amanhã', cond: '', cpres: 'espero que', cimp: 'se', cfut: 'quando', infp: 'para', hav: '' };
  const lastWord = s => String(s).split(' ').pop();
  // Split one form into display parts: aux (helper verb), stem, end, or pre / irr / post for irregular forms.
  P.vform = function (v, t, p) {
    const vb = P.VERB[v]; const form = vb && vb.f[t] && vb.f[t][p]; if (!form) return null;
    const words = form.split(' ');
    const main = ['ppc', 'mqp', 'hav'].includes(t) ? words.pop() : form;
    const aux = main === form ? '' : words.join(' ');
    const regAll = regForms(v)[t]; const reg = regAll && regAll[p] ? (main === form ? regAll[p] : lastWord(regAll[p])) : null;
    // Infinitives (hei de fazer) are never irregular; neither is a form identical to the regular one
    const irr = t !== 'hav' && !!reg && reg !== main;
    let parts;
    if (irr) {
      let i = 0; while (i < main.length && i < reg.length && main[i] === reg[i]) i++;
      let j = 0; while (j < main.length - i && j < reg.length - i && main[main.length - 1 - j] === reg[reg.length - 1 - j]) j++;
      const mid = main.slice(i, main.length - j);
      parts = mid ? [{ s: main.slice(0, i), k: 'pre' }, { s: mid, k: 'irr' }, { s: main.slice(main.length - j), k: 'post' }] : [{ s: main, k: 'irr' }];
    } else {
      const inf = v.replace('ô', 'o');
      let stem = ['fut', 'cond'].includes(t) && main.startsWith(inf) ? inf : inf.slice(0, -2);
      if (t === 'hav' || t === 'infp' && main === v) stem = main;
      let i = 0; while (i < main.length && i < stem.length && main[i] === stem[i]) i++;
      parts = [{ s: main.slice(0, i), k: 'stem' }, { s: main.slice(i), k: 'end' }];
    }
    return { form, aux, main, reg, irr, parts: parts.filter(x => x.s) };
  };
  P.isIrr = (v, t, p) => { const x = P.vform(v, t, p); return !!(x && x.irr); };
  // Coloured HTML: helper verb muted, stem plain, ending bold in the tense colour, irregular part underlined with ★
  P.vformHTML = function (v, t, p, opts) {
    const x = P.vform(v, t, p); if (!x) return '';
    const inner = x.parts.map(q => q.k === 'end' ? `<b class="vf-end">${esc(q.s)}</b>` : q.k === 'irr' ? `<u class="vf-irr">${esc(q.s)}</u>` : esc(q.s)).join('');
    return `<span class="vf tc-${P.tfam(t)}">${x.aux ? `<span class="vf-aux">${esc(x.aux)}</span> ` : ''}${inner}${x.irr && !(opts && opts.noStar) ? '<sup class="vf-star" title="irregular">★</sup>' : ''}</span>`;
  };
  // What to say for a form, with its person and (optionally) the cue: "ontem eu fiz", "espero que tu faças"
  P.vsay = function (v, t, p, cue) {
    const f = P.VERB[v].f[t][p]; const who = t === 'imp' ? '' : P.personLabel(t, p).split(' / ')[0];
    return [cue && P.CUE[t], who, f].filter(Boolean).join(' ');
  };
})(Pois);
