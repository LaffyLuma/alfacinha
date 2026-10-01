const C = require('../app/js/conj.js');
const VERBS = require('../app/data/verbs.js');
const by = Object.fromEntries(VERBS.map(v => [v.v, C.conjugate(v)]));
// Reference forms (EP standard)
const REF = {
  falar: { pres: 'falo falas fala falamos falam', pps: 'falei falaste falou falámos falaram', pimp: 'falava falavas falava falávamos falavam', fut: 'falarei falarás falará falaremos falarão', cond: 'falaria falarias falaria falaríamos falariam', cpres: 'fale fales fale falemos falem', cimp: 'falasse falasses falasse falássemos falassem', cfut: 'falar falares falar falarmos falarem', part: 'falado' },
  comer: { pres: 'como comes come comemos comem', pps: 'comi comeste comeu comemos comeram', pimp: 'comia comias comia comíamos comiam', cpres: 'coma comas coma comamos comam', cimp: 'comesse comesses comesse comêssemos comessem', cfut: 'comer comeres comer comermos comerem' },
  partir: { pres: 'parto partes parte partimos partem', pps: 'parti partiste partiu partimos partiram', cimp: 'partisse partisses partisse partíssemos partissem' },
  ser: { pres: 'sou és é somos são', pps: 'fui foste foi fomos foram', pimp: 'era eras era éramos eram', fut: 'serei serás será seremos serão', cpres: 'seja sejas seja sejamos sejam', cimp: 'fosse fosses fosse fôssemos fossem', cfut: 'for fores for formos forem', part: 'sido' },
  ir: { pimp: 'ia ias ia íamos iam', cpres: 'vá vás vá vamos vão', cfut: 'for fores for formos forem', fut: 'irei irás irá iremos irão' },
  estar: { pps: 'estive estiveste esteve estivemos estiveram', cimp: 'estivesse estivesses estivesse estivéssemos estivessem', cfut: 'estiver estiveres estiver estivermos estiverem' },
  ter: { pres: 'tenho tens tem temos têm', pimp: 'tinha tinhas tinha tínhamos tinham', cpres: 'tenha tenhas tenha tenhamos tenham', cimp: 'tivesse tivesses tivesse tivéssemos tivessem', cfut: 'tiver tiveres tiver tivermos tiverem' },
  vir: { pres: 'venho vens vem vimos vêm', pps: 'vim vieste veio viemos vieram', cpres: 'venha venhas venha venhamos venham', cimp: 'viesse viesses viesse viéssemos viessem', cfut: 'vier vieres vier viermos vierem', part: 'vindo' },
  ver: { pps: 'vi viste viu vimos viram', pimp: 'via vias via víamos viam', cpres: 'veja vejas veja vejamos vejam', cimp: 'visse visses visse víssemos vissem', cfut: 'vir vires vir virmos virem', part: 'visto' },
  fazer: { fut: 'farei farás fará faremos farão', cond: 'faria farias faria faríamos fariam', cpres: 'faça faças faça façamos façam', cimp: 'fizesse fizesses fizesse fizéssemos fizessem', cfut: 'fizer fizeres fizer fizermos fizerem', part: 'feito' },
  dizer: { fut: 'direi dirás dirá diremos dirão', cpres: 'diga digas diga digamos digam', cimp: 'dissesse dissesses dissesse disséssemos dissessem', cfut: 'disser disseres disser dissermos disserem' },
  poder: { cpres: 'possa possas possa possamos possam', cimp: 'pudesse pudesses pudesse pudéssemos pudessem', cfut: 'puder puderes puder pudermos puderem' },
  querer: { cimp: 'quisesse quisesses quisesse quiséssemos quisessem', cfut: 'quiser quiseres quiser quisermos quiserem' },
  saber: { cimp: 'soubesse soubesses soubesse soubéssemos soubessem' },
  dar: { cimp: 'desse desses desse déssemos dessem', cfut: 'der deres der dermos derem' },
  'pôr': { fut: 'porei porás porá poremos porão', cond: 'poria porias poria poríamos poriam', cpres: 'ponha ponhas ponha ponhamos ponham', cimp: 'pusesse pusesses pusesse puséssemos pusessem', cfut: 'puser puseres puser pusermos puserem' },
  trazer: { fut: 'trarei trarás trará traremos trarão', cpres: 'traga tragas traga tragamos tragam', cimp: 'trouxesse trouxesses trouxesse trouxéssemos trouxessem', part: 'trazido' },
  ler: { pps: 'li leste leu lemos leram', cpres: 'leia leias leia leiamos leiam', cimp: 'lesse lesses lesse lêssemos lessem', cfut: 'ler leres ler lermos lerem' },
  ouvir: { cpres: 'ouça ouças ouça ouçamos ouçam', pps: 'ouvi ouviste ouviu ouvimos ouviram' },
  pedir: { cpres: 'peça peças peça peçamos peçam' },
  perder: { cpres: 'perca percas perca percamos percam', cimp: 'perdesse perdesses perdesse perdêssemos perdessem' },
  sair: { cpres: 'saia saias saia saiamos saiam', cimp: 'saísse saísses saísse saíssemos saíssem', fut: 'sairei sairás sairá sairemos sairão' },
  rir: { pps: 'ri riste riu rimos riram', pimp: 'ria rias ria ríamos riam', cpres: 'ria rias ria riamos riam', cimp: 'risse risses risse ríssemos rissem' },
  dormir: { pres: 'durmo dormes dorme dormimos dormem', cpres: 'durma durmas durma durmamos durmam' },
  descobrir: { pres: 'descubro descobres descobre descobrimos descobrem', part: 'descoberto' },
  sentir: { pres: 'sinto sentes sente sentimos sentem', cpres: 'sinta sintas sinta sintamos sintam' },
  seguir: { pres: 'sigo segues segue seguimos seguem', cpres: 'siga sigas siga sigamos sigam', pps: 'segui seguiste seguiu seguimos seguiram' },
  conseguir: { pres: 'consigo consegues consegue conseguimos conseguem' },
  preferir: { pres: 'prefiro preferes prefere preferimos preferem' },
  subir: { pres: 'subo sobes sobe subimos sobem', cpres: 'suba subas suba subamos subam' },
  fugir: { pres: 'fujo foges foge fugimos fogem', cpres: 'fuja fujas fuja fujamos fujam' },
  conhecer: { pres: 'conheço conheces conhece conhecemos conhecem', cpres: 'conheça conheças conheça conheçamos conheçam', pps: 'conheci conheceste conheceu conhecemos conheceram' },
  proteger: { pres: 'protejo proteges protege protegemos protegem', cpres: 'proteja protejas proteja protejamos protejam' },
  corrigir: { pres: 'corrijo corriges corrige corrigimos corrigem' },
  conduzir: { pres: 'conduzo conduzes conduz conduzimos conduzem', pps: 'conduzi conduziste conduziu conduzimos conduziram' },
  ficar: { pps: 'fiquei ficaste ficou ficámos ficaram', cpres: 'fique fiques fique fiquemos fiquem' },
  chegar: { pps: 'cheguei chegaste chegou chegámos chegaram', cpres: 'chegue chegues chegue cheguemos cheguem' },
  'começar': { pres: 'começo começas começa começamos começam', pps: 'comecei começaste começou começámos começaram', cpres: 'comece comeces comece comecemos comecem' },
  pagar: { part: 'pago' },
  passear: { pres: 'passeio passeias passeia passeamos passeiam', pps: 'passeei passeaste passeou passeámos passearam', cpres: 'passeie passeies passeie passeemos passeiem' },
  escrever: { part: 'escrito' },
  abrir: { part: 'aberto' },
  'pôr ': {},
};
let fails = 0, checks = 0;
for (const [v, tenses] of Object.entries(REF)) {
  const f = by[v.trim()]; if (!f) { if (v.trim() in by || !Object.keys(tenses).length) continue; console.log('MISSING', v); fails++; continue; }
  for (const [t, exp] of Object.entries(tenses)) {
    checks++;
    const got = Array.isArray(f[t]) ? f[t].join(' ') : f[t];
    if (got !== exp) { fails++; console.log(`FAIL ${v} ${t}\n  got: ${got}\n  exp: ${exp}`); }
  }
}
// spot checks: imperatives, impersonal, ppc
const spot = [
  [by.ser.imp[1], 'sê'], [by.fazer.imp[1], 'faz'], [by.fazer.imp[2], 'faça'], [by.ir.imp[2], 'vá'], [by['pôr'].imp[1], 'põe'],
  [by.haver.pres[2], 'há'], [by.haver.pps[2], 'houve'], [by.haver.pimp[2], 'havia'], [by.haver.cpres[2], 'haja'], [by.haver.cimp[2], 'houvesse'], [by.haver.cfut[2], 'houver'], [by.haver.pres[0], null],
  [by.chover.pps[2], 'choveu'], [by.chover.imp[2], null], [by.estudar.ppc[0], 'tenho estudado'], [by.fazer.ppc[4], 'têm feito'], [by.poder.imp[1], null],
];
spot.forEach(([g, e], i) => { checks++; if (g !== e) { fails++; console.log('SPOT FAIL', i, g, e); } });
// No form should contain undefined
for (const [v, f] of Object.entries(by)) for (const k in f) { const arr = Array.isArray(f[k]) ? f[k] : [f[k]]; arr.forEach(x => { if (x && /undefined|NaN/.test(x)) { fails++; console.log('BAD', v, k, x); } }); }
console.log(`${checks} checks, ${fails} failures, ${VERBS.length} verbs`);
