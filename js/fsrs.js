/* FSRS-4.5 scheduler (default parameters). Grades: 1 Again, 2 Hard, 3 Good, 4 Easy.
   Card fields: state (0 new, 1 learning/relearning, 2 review), s (stability, days), d (difficulty 1-10),
   due (ms), last (ms), reps, lapses. */
(function (root) {
  const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  const DECAY = -0.5, FACTOR = 19 / 81;
  const DAY = 86400000, MIN = 60000;
  const clampD = d => Math.min(10, Math.max(1, d));
  const D0 = g => clampD(W[4] - (g - 3) * W[5]);
  const R = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
  function interval(s, retention, maxIvl) {
    const i = s / FACTOR * (Math.pow(retention, 1 / DECAY) - 1);
    return Math.min(maxIvl, Math.max(1, Math.round(i)));
  }
  function nextD(d, g) { return clampD(W[7] * D0(3) + (1 - W[7]) * (d - W[6] * (g - 3))); }
  function recallS(d, s, r, g) {
    const hard = g === 2 ? W[15] : 1, easy = g === 4 ? W[16] : 1;
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy);
  }
  function forgetS(d, s, r) {
    return Math.min(s, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)));
  }
  function fuzz(days) { if (days < 3) return days; const f = Math.max(1, Math.round(days * 0.05)); return days + Math.round((Math.random() * 2 - 1) * f); }

  /* Returns a NEW card object after grading at time `now`. opts: {retention, maxIvl, noFuzz} */
  function grade(card, g, now, opts) {
    opts = opts || {};
    const ret = opts.retention || 0.9, maxIvl = opts.maxIvl || 365;
    const c = Object.assign({}, card);
    c.reps = (c.reps || 0) + 1;
    const fz = opts.noFuzz ? (x => x) : fuzz;
    if (!c.state) {
      // first ever review
      c.d = D0(g); c.s = W[g - 1];
      if (g === 1) { c.state = 1; c.due = now + 5 * MIN; }
      else if (g === 2) { c.state = 1; c.due = now + 15 * MIN; }
      else {
        c.state = 2;
        const gi = interval(W[2], ret, maxIvl);
        let iv = interval(c.s, ret, maxIvl);
        if (g === 4) iv = Math.max(iv, gi + 1);
        c.due = now + fz(iv) * DAY;
      }
    } else if (c.state === 1) {
      // (re)learning, same-day steps
      if (g === 1) { c.due = now + 5 * MIN; c.d = nextD(c.d, 1); }
      else if (g === 2) { c.due = now + 15 * MIN; }
      else {
        c.state = 2;
        if (g === 4) c.s = Math.max(c.s * 1.5, W[2]);
        const iv = Math.max(g === 4 ? 2 : 1, interval(c.s, ret, maxIvl));
        c.due = now + fz(iv) * DAY;
      }
    } else {
      const t = Math.max(0, (now - (c.last || now)) / DAY);
      const r = R(t, c.s);
      if (g === 1) {
        c.lapses = (c.lapses || 0) + 1;
        c.s = forgetS(c.d, c.s, r); c.d = nextD(c.d, 1);
        c.state = 1; c.due = now + 10 * MIN;
      } else {
        const sHard = recallS(c.d, c.s, r, 2), sGood = recallS(c.d, c.s, r, 3), sEasy = recallS(c.d, c.s, r, 4);
        let iH = interval(sHard, ret, maxIvl), iG = interval(sGood, ret, maxIvl), iE = interval(sEasy, ret, maxIvl);
        iH = Math.min(iH, iG); iG = Math.min(maxIvl, Math.max(iG, iH + 1)); iE = Math.min(maxIvl, Math.max(iE, iG + 1));
        c.d = nextD(c.d, g);
        c.s = g === 2 ? sHard : g === 3 ? sGood : sEasy;
        c.due = now + fz(g === 2 ? iH : g === 3 ? iG : iE) * DAY;
      }
    }
    c.last = now;
    return c;
  }
  /* Preview label for each grade, e.g. {1:'5m', 2:'15m', 3:'4d', 4:'12d'} */
  function preview(card, now, opts) {
    const out = {};
    for (const g of [1, 2, 3, 4]) {
      const n = grade(card, g, now, Object.assign({}, opts, { noFuzz: true }));
      out[g] = fmt(n.due - now);
    }
    return out;
  }
  function fmt(ms) {
    if (ms < 60 * MIN) return Math.max(1, Math.round(ms / MIN)) + 'm';
    if (ms < DAY) return Math.round(ms / 3600000) + 'h';
    const d = Math.round(ms / DAY);
    if (d < 31) return d + 'd';
    if (d < 365) return (d / 30).toFixed(d < 60 ? 1 : 0).replace('.0', '') + 'mo';
    return (d / 365).toFixed(1).replace('.0', '') + 'y';
  }
  function retrievability(card, now) { if (card.state !== 2) return null; return R(Math.max(0, (now - card.last) / DAY), card.s); }
  const api = { grade, preview, retrievability, DAY, MIN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FSRS = api;
})(this);
