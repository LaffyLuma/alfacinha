/* Grammar notes, written for English speakers. HTML allowed. `drill` links to a drill set or tense. */
var GRAMMAR = [
  { id: 'past', title: 'Perfeito vs imperfeito', lvl: 'A2', drill: 'past', html: `
<p>English lets "I went / I was going / I used to go" blur together. Portuguese forces a choice every time. The choice isn't about <em>when</em>, it's about <em>how you're looking at the event</em>.</p>
<table><tr><th>Pretérito perfeito</th><th>Pretérito imperfeito</th></tr>
<tr><td>A completed event. A dot on the timeline.</td><td>Background, habit, description. A line or a scene.</td></tr>
<tr><td><b>Ontem fui</b> ao mercado.</td><td><b>Ia</b> ao mercado todos os sábados.</td></tr>
<tr><td>Sequences: <b>Acordei, tomei</b> banho e <b>saí</b>.</td><td>Simultaneous: Enquanto eu <b>cozinhava</b>, ela <b>lia</b>.</td></tr>
<tr><td>Interrupting event: …quando o telefone <b>tocou</b>.</td><td>The scene interrupted: <b>Estava</b> a jantar…</td></tr>
<tr><td>Closed periods: <b>Vivi</b> três anos no Porto.</td><td>Age, time, weather: <b>Eram</b> dez horas. <b>Estava</b> frio. <b>Tinha</b> 8 anos.</td></tr></table>
<h4>Trigger words</h4>
<p><b>Perfeito:</b> ontem, anteontem, no sábado passado, em 2019, de repente, uma vez, primeiro… depois…, há dois dias</p>
<p><b>Imperfeito:</b> todos os dias, sempre (as habit), antigamente, quando era pequeno, enquanto, normalmente, às vezes</p>
<h4>Verbs that change meaning</h4>
<ul><li><b>saber</b>: sabia = knew · <b>soube</b> = found out</li><li><b>conhecer</b>: conhecia = knew (someone) · <b>conheci</b> = met</li><li><b>poder</b>: podia = could (was able, in general) · <b>pude</b> = managed to (on that occasion)</li><li><b>querer</b>: queria = wanted · <b>quis</b> = tried to / insisted</li></ul>
<h4>EP bonuses</h4>
<ul><li>Polite requests use the imperfeito: <b>Queria</b> um café, por favor.</li><li>In speech, the imperfeito often replaces the conditional: Se tivesse tempo, <b>ia</b> (= iria).</li></ul>
<p class="tip">Storytelling trick: imperfeito paints the stage (who, where, what it was like). Perfeito moves the plot forward (what happened).</p>` },

  { id: 'irregpast', title: 'Irregular perfeitos (learn these cold)', lvl: 'A2', drill: 'pps', html: `
<p>These are among the most-used verbs in the language, and they're irregular in the perfeito. Drill them until you don't have to think.</p>
<table><tr><th></th><th>eu</th><th>tu</th><th>ele/você</th><th>nós</th><th>eles/vocês</th></tr>
<tr><td>ser / ir</td><td>fui</td><td>foste</td><td>foi</td><td>fomos</td><td>foram</td></tr>
<tr><td>ter</td><td>tive</td><td>tiveste</td><td>teve</td><td>tivemos</td><td>tiveram</td></tr>
<tr><td>estar</td><td>estive</td><td>estiveste</td><td>esteve</td><td>estivemos</td><td>estiveram</td></tr>
<tr><td>fazer</td><td>fiz</td><td>fizeste</td><td>fez</td><td>fizemos</td><td>fizeram</td></tr>
<tr><td>dizer</td><td>disse</td><td>disseste</td><td>disse</td><td>dissemos</td><td>disseram</td></tr>
<tr><td>poder</td><td>pude</td><td>pudeste</td><td>pôde</td><td>pudemos</td><td>puderam</td></tr>
<tr><td>pôr</td><td>pus</td><td>puseste</td><td>pôs</td><td>pusemos</td><td>puseram</td></tr>
<tr><td>querer</td><td>quis</td><td>quiseste</td><td>quis</td><td>quisemos</td><td>quiseram</td></tr>
<tr><td>saber</td><td>soube</td><td>soubeste</td><td>soube</td><td>soubemos</td><td>souberam</td></tr>
<tr><td>trazer</td><td>trouxe</td><td>trouxeste</td><td>trouxe</td><td>trouxemos</td><td>trouxeram</td></tr>
<tr><td>vir</td><td>vim</td><td>vieste</td><td>veio</td><td>viemos</td><td>vieram</td></tr>
<tr><td>ver</td><td>vi</td><td>viste</td><td>viu</td><td>vimos</td><td>viram</td></tr>
<tr><td>dar</td><td>dei</td><td>deste</td><td>deu</td><td>demos</td><td>deram</td></tr></table>
<h4>Patterns that help</h4>
<ul><li>Strong verbs: <b>eu and ele are different but have no ending accent</b>: fiz / fez, tive / teve, pus / pôs.</li><li>The <b>eles</b> form (tiveram, fizeram, puseram) is the base for the B1 subjunctives: tive<b>sse</b>, tive<b>r</b>. Learn it well now and B1 gets easier.</li><li>Regular -ar nós in EP has an accent: fal<b>á</b>mos (we spoke) vs falamos (we speak).</li><li>Spelling: fi<b>qu</b>ei, che<b>gu</b>ei, come<b>c</b>ei (keeps the sound before -ei).</li></ul>
<p class="tip">Only four verbs are irregular in the imperfeito: <b>ser (era), ter (tinha), vir (vinha), pôr (punha)</b>.</p>` },

  { id: 'ppc', title: 'The perfeito composto trap', lvl: 'A2', drill: 'ppc', html: `
<p><b>Tenho feito ≠ I have done.</b> This is one of the most common English-speaker mistakes in EP.</p>
<p>The perfeito composto (<i>ter</i> in the present + participle) means something <b>repeated or continuing from the past up to now</b>, usually with <i>ultimamente, nos últimos tempos, este mês, desde…</i>.</p>
<ul><li><b>Tenho estudado</b> muito. = I've been studying a lot (lately).</li><li><b>Tem chovido</b> imenso. = It's been raining loads.</li><li><b>Temos saído</b> pouco. = We haven't been going out much.</li></ul>
<p>For English "I have done" (a single completed action), use the <b>simple perfeito</b>:</p>
<ul><li>Have you eaten? → <b>Já comeste?</b></li><li>I've never been to the Azores → <b>Nunca fui</b> aos Açores.</li><li>I haven't seen that film yet → <b>Ainda não vi</b> esse filme.</li></ul>
<p class="tip">If you can add "lately / recently, repeatedly" and it still makes sense, it's composto. Otherwise, simple perfeito.</p>` },

  { id: 'serestar', title: 'Ser vs estar (and ficar)', lvl: 'A1–A2', drill: 'serestar', html: `
<table><tr><th>ser</th><th>estar</th></tr>
<tr><td>Identity, nationality, profession: <b>Sou</b> canadiano.</td><td>Temporary states, feelings: <b>Estou</b> cansado.</td></tr>
<tr><td>Characteristics: Ela <b>é</b> simpática.</td><td>Location of people and things: As chaves <b>estão</b> na mesa.</td></tr>
<tr><td>Time, days, dates: <b>São</b> três horas. Hoje <b>é</b> sexta.</td><td>Progressive: <b>Estou a</b> trabalhar.</td></tr>
<tr><td>Where <b>events</b> happen: A festa <b>é</b> em casa da Rita.</td><td>Results: A porta <b>está</b> aberta.</td></tr>
<tr><td>Material, origin: <b>É</b> de madeira. <b>É</b> do Porto.</td><td>Weather: <b>Está</b> calor / frio / sol.</td></tr></table>
<h4>Ficar, the third "to be"</h4>
<ul><li>Permanent location of places: O museu <b>fica</b> perto do rio.</li><li>Becoming / reacting: <b>Fiquei</b> contente. <b>Ficou</b> zangado.</li><li>Staying: <b>Fico</b> em casa hoje.</li><li>Looking (on someone): Esse casaco <b>fica</b>-te bem.</li></ul>` },

  { id: 'clitics', title: 'Where the little pronouns go (EP!)', lvl: 'A2–B1', drill: 'pron', html: `
<p>Object pronouns: <b>me, te, o/a, lhe, nos, vos, os/as, lhes, se</b>. Brazilians put them before the verb. <b>In Portugal the default is after the verb, with a hyphen.</b></p>
<ul><li><b>Chamo-me</b> Ryan. · <b>Diz-me</b> uma coisa. · <b>Levanto-me</b> às sete. · <b>Dá-me</b> isso.</li></ul>
<h4>They jump BEFORE the verb after:</h4>
<ul><li>Negatives: <b>Não me</b> digas! · <b>Nunca te</b> esqueças.</li><li>Many adverbs: <b>já, também, ainda, só, sempre, talvez</b>: <b>Já te</b> disse. <b>Também me</b> apetece.</li><li>Question words: <b>Como te</b> chamas? <b>O que lhe</b> disseste?</li><li><b>que</b> and other subordinators: Acho <b>que se</b> chama Rui. <b>Quando me</b> ligares…</li><li>Some quantifiers: <b>Todos me</b> disseram. <b>Alguém te</b> ligou.</li></ul>
<h4>Spelling changes after the verb</h4>
<ul><li>Nós forms drop the -s before <b>-nos</b>: levantamos + nos → <b>levantamo-nos</b>.</li><li>o/a after -r, -s, -z → <b>-lo/-la</b> (drop the consonant): comprar + o → <b>comprá-lo</b>; fiz + o → <b>fi-lo</b>.</li><li>o/a after a nasal sound (-m, -ão, -õe) → <b>-no/-na</b>: dão + o → <b>dão-no</b>.</li></ul>
<p class="tip">Don't stress about this at A2. Say "chamo-me", "dá-me", "não me…", "já te…" as chunks and the pattern will sink in.</p>` },

  { id: 'objpron', title: 'Lhe or o/a? Direct and indirect object pronouns', lvl: 'B1', drill: 'pron', html: `
<p>Two questions every time you replace a noun with a pronoun: <b>which pronoun</b> (o/a or lhe?) and <b>where it goes</b> (before or after the verb?).</p>
<h4>1. Which pronoun?</h4>
<table><tr><th>Direct: the thing or person the action hits (no preposition)</th><th>Indirect: <em>to / for</em> someone (verb + a)</th></tr>
<tr><td><b>o, a, os, as</b></td><td><b>lhe, lhes</b></td></tr>
<tr><td>Vejo <b>a Ana</b> → <b>Vejo-a</b>.</td><td>Telefono <b>ao meu pai</b> → <b>Telefono-lhe</b>.</td></tr>
<tr><td>Comprei <b>o livro</b> → <b>Comprei-o</b>.</td><td>Dou presentes <b>à minha mãe</b> → <b>Dou-lhe</b> presentes.</td></tr>
<tr><td>Conheço <b>os teus pais</b> → <b>Conheço-os</b>.</td><td>Escrevo <b>aos meus avós</b> → <b>Escrevo-lhes</b>.</td></tr></table>
<p><b>me, te, nos</b> do both jobs: <b>Vês-me?</b> (direct) · <b>Dás-me</b> isso? (indirect).</p>
<p>Common verbs that take <b>a alguém → lhe</b>: dar, oferecer, pedir, telefonar, ligar, dizer, perguntar, responder, escrever, mostrar, emprestar, explicar, agradecer.</p>
<p class="tip"><b>lhe</b> is for people (and pets). For things you almost always want <b>o/a</b>: O bolo? <b>Comi-o</b> todo.</p>
<h4>2. Where does it go?</h4>
<p>After the verb with a hyphen by default. Before the verb after <b>não, nunca, ninguém, nada, já, também, ainda, só, talvez, que, quando, se</b> and question words (see <i>Where the little pronouns go</i>).</p>
<ul><li>Sim, <b>dou-lhe</b> presentes. · Não, <b>nunca lhe dou</b> chocolates.</li>
<li>Sim, <b>vejo-a</b> todos os dias. · <b>Onde a compraste?</b></li></ul>
<h4>3. Compound tenses (ter + particípio)</h4>
<p>The pronoun goes with <b>ter</b>, never with the particípio:</p>
<ul><li>Ele <b>tem-lhes telefonado</b>. · Ele <b>não lhes tem telefonado</b>.</li>
<li>Tens visto a Laura? Sim, <b>tenho-a visto</b>. (Not <s>tenho visto-a</s>.)</li></ul>
<h4>4. Helper verb + infinitive</h4>
<p>Attach it to the infinitive and you're always right: <b>Vou dar-lhe</b> isto. <b>Quero perguntar-te</b> uma coisa. (<i>Vou-lhe dar</i> is also heard.) After a trigger: <b>Não lhe vou dar</b>.</p>
<h4>5. Spelling: -lo, -la, -no, -na</h4>
<ul><li>After -r, -s, -z the consonant drops and o/a becomes <b>-lo/-la</b>: comprar + o → <b>comprá-lo</b>, vês + a → <b>vê-la</b>, fazemos + os → <b>fazemo-los</b>.</li>
<li>After a nasal (-m, -ão, -õe) → <b>-no/-na</b>: dão + o → <b>dão-no</b>, põe + a → <b>põe-na</b>.</li></ul>
<p class="tip">You'll hear <b>lho</b> (lhe + o): <i>Já lho dei.</i> In speech people often just drop the "o": <b>Já lhe dei.</b> That's fine.</p>` },

  { id: 'aspect', title: 'Estar a, ir, acabar de: the helper verbs', lvl: 'A1–A2', html: `
<ul><li><b>estar a + infinitivo</b> = doing right now. <b>Estou a</b> cozinhar. (Brazil says "cozinhando". In Portugal, don't.)</li><li><b>ir + infinitivo</b> = going to. <b>Vou</b> ligar-te amanhã.</li><li><b>acabar de + inf.</b> = have just. <b>Acabei de</b> chegar.</li><li><b>voltar a + inf.</b> = do again. <b>Voltei a</b> perder as chaves.</li><li><b>deixar de + inf.</b> = stop doing. <b>Deixei de</b> fumar.</li><li><b>começar a + inf.</b> = start doing. <b>Comecei a</b> estudar.</li><li><b>costumar + inf.</b> = usually. <b>Costumo</b> jantar às oito.</li><li><b>ter de / ter que + inf.</b> = have to. <b>Tenho de</b> ir.</li><li><b>andar a + inf.</b> = have been doing lately (very EP). <b>Ando a</b> ler um livro ótimo.</li></ul>
<p class="tip">These are a cheat code: you only conjugate the helper and leave the main verb in the infinitive.</p>` },

  { id: 'porpara', title: 'Por vs para', lvl: 'A2', html: `
<table><tr><th>para (destination, purpose, deadline)</th><th>por (through, cause, exchange, by)</th></tr>
<tr><td>Vou <b>para</b> casa. (to)</td><td>Passei <b>pelo</b> parque. (through)</td></tr>
<tr><td>Estudo <b>para</b> falar com a família. (in order to)</td><td><b>Por</b> causa da chuva… (because of)</td></tr>
<tr><td>É <b>para</b> ti. (for, recipient)</td><td>Obrigado <b>pela</b> ajuda. (for, reason)</td></tr>
<tr><td><b>Para</b> sexta-feira. (deadline)</td><td>Paguei 10 euros <b>pelo</b> livro. (exchange)</td></tr>
<tr><td><b>Para</b> mim, está ótimo. (opinion)</td><td>Escrito <b>por</b> Saramago. (by)</td></tr>
<tr><td></td><td>Duas vezes <b>por</b> semana. (per)</td></tr></table>
<p>Contractions: por + o = <b>pelo</b>, por + a = <b>pela</b>, por + os = <b>pelos</b>.</p>` },

  { id: 'contractions', title: 'Contractions: do, no, ao, pelo, num', lvl: 'A1', html: `
<table><tr><th></th><th>o</th><th>a</th><th>os</th><th>as</th><th>um</th><th>uma</th></tr>
<tr><td>de</td><td>do</td><td>da</td><td>dos</td><td>das</td><td>dum</td><td>duma</td></tr>
<tr><td>em</td><td>no</td><td>na</td><td>nos</td><td>nas</td><td>num</td><td>numa</td></tr>
<tr><td>a</td><td>ao</td><td>à</td><td>aos</td><td>às</td><td>–</td><td>–</td></tr>
<tr><td>por</td><td>pelo</td><td>pela</td><td>pelos</td><td>pelas</td><td>–</td><td>–</td></tr></table>
<p>Also: de + este = <b>deste</b>, em + esse = <b>nesse</b>, de + aqui = <b>daqui</b>, a + aquele = <b>àquele</b>.</p>` },

  { id: 'tuvoce', title: 'Tu, você, o senhor: politeness in Portugal', lvl: 'A1', html: `
<ul><li><b>tu</b>: friends, family, partner, people your age in casual settings. Use it with her family once they use it with you.</li><li><b>você</b>: tricky in Portugal. It can sound distant or even rude to some people. Many Portuguese avoid it.</li><li><b>o senhor / a senhora</b> (+ 3rd person verb): polite, older people, service. "<b>A senhora</b> sabe onde fica…?"</li><li>Very common trick: <b>drop the pronoun</b> and just use the 3rd-person verb: "<b>Sabe</b> onde fica a estação?" This is polite and neutral.</li><li>Plural "you" is <b>vocês</b> for everyone. (vós survives only in the north and in church.)</li></ul>
<p class="tip">With her parents: follow their lead. Older relatives might prefer "o senhor / a senhora" at first.</p>` },

  { id: 'subj', title: 'The subjunctive (conjuntivo): the B1 gateway', lvl: 'B1', drill: 'subj', html: `
<p>The subjunctive is for things that are <b>not asserted as fact</b>: wishes, doubts, emotions, hypotheticals, and unknowns.</p>
<h4>Present subjunctive: how to build it</h4>
<p>Take the <b>eu</b> form of the present, drop the -o, and swap the vowel: -ar → <b>-e</b>, -er/-ir → <b>-a</b>.</p>
<ul><li>falo → fal<b>e</b> · como → com<b>a</b> · faço → faç<b>a</b> · tenho → tenh<b>a</b> · digo → dig<b>a</b> · posso → poss<b>a</b></li><li>Irregulars: <b>seja</b> (ser), <b>esteja</b> (estar), <b>vá</b> (ir), <b>dê</b> (dar), <b>saiba</b> (saber), <b>queira</b> (querer), <b>haja</b> (haver).</li></ul>
<h4>Triggers</h4>
<ul><li>Wishes: quero que, espero que, oxalá: Espero que <b>estejas</b> bem.</li><li>Emotion / judgement: é pena que, é importante que, gosto que</li><li>Doubt / denial: duvido que, não acho que, não acredito que</li><li>Conjunctions: embora, para que, antes que, caso, sem que</li><li>Unknown things: Procuro alguém que <b>fale</b> inglês.</li><li>talvez (before the verb): Talvez <b>chova</b>.</li></ul>
<h4>No subjunctive with</h4>
<p>acho que, sei que, tenho a certeza que, é verdade que, se calhar: these state facts or beliefs.</p>
<p class="tip">You already use it without noticing: "Não te <b>preocupes</b>", "<b>Desculpe</b>", "<b>Seja</b> bem-vindo" are all subjunctive forms.</p>` },

  { id: 'futsubj', title: 'Future subjunctive: quando / se / assim que', lvl: 'B1', drill: 'cfut', html: `
<p>Portuguese has a tense English doesn't: the <b>future subjunctive</b>. Use it after <b>quando, se, assim que, logo que, enquanto, sempre que, como, o que, quem</b> when talking about the future.</p>
<ul><li><b>Quando chegares</b>, liga-me. (When you arrive…)</li><li><b>Se tiver</b> tempo, vou. (If I have time…)</li><li><b>Assim que souber</b>, digo-te. (As soon as I know…)</li><li>Faz <b>como quiseres</b>. (Do as you like.)</li></ul>
<h4>How to build it</h4>
<p>Take the <b>eles</b> form of the perfeito and drop <b>-ram</b>, then add: <b>-r, -res, -r, -rmos, -rem</b>.</p>
<ul><li>tiveram → tive<b>r</b> · fizeram → fize<b>r</b> · foram → fo<b>r</b> · vieram → vie<b>r</b> · puderam → pude<b>r</b></li><li>Regular verbs look like the infinitive: quando eu <b>falar</b>, quando tu <b>falares</b>.</li></ul>
<p class="tip">This is exactly why learning the eles perfeito form well pays off twice.</p>` },

  { id: 'impsubj', title: 'If I were…: imperfect subjunctive + conditional', lvl: 'B1', drill: 'cimp', html: `
<p>Hypotheticals: <b>Se + imperfect subjunctive, conditional (or imperfeito in speech)</b>.</p>
<ul><li>Se <b>tivesse</b> dinheiro, <b>comprava / compraria</b> uma casa.</li><li>Se <b>fosse</b> a ti, não <b>ia</b>. (If I were you, I wouldn't go.)</li></ul>
<h4>How to build it</h4>
<p>Same base as the future subjunctive: <b>eles</b> perfeito minus -ram, then add <b>-sse, -sses, -sse, -ssemos, -ssem</b> (accent on nós: tivéssemos, falássemos, comêssemos).</p>
<p>Also used after past triggers: Ela pediu que eu <b>trouxesse</b> pão. Embora <b>estivesse</b> cansado…</p>` },

  { id: 'cond', title: 'The condicional: would, could, should', lvl: 'B1', drill: 'hipot', html: `
<h4>How to build it</h4>
<p>The whole infinitive + <b>-ia, -ias, -ia, -íamos, -iam</b>. Same endings for -ar, -er and -ir.</p>
<ul><li>falar → <b>falaria</b> · comer → <b>comeria</b> · ir → <b>iria</b> · gostar → <b>gostaria</b></li>
<li>Only three irregulars (same stems as the future): fazer → <b>faria</b>, dizer → <b>diria</b>, trazer → <b>traria</b>.</li></ul>
<h4>When to use it</h4>
<ul><li><b>Hypotheticals</b>, with se + conjuntivo imperfeito: Se tivesse tempo, <b>viajaria</b> mais.</li>
<li><b>Politeness</b>: <b>Poderia</b> ajudar-me? <b>Gostaria</b> de marcar uma mesa.</li>
<li><b>Advice</b>: <b>Deverias</b> descansar. (You should rest.)</li>
<li><b>Future seen from the past</b>: Ele disse que <b>viria</b> às oito. (He said he would come.)</li>
<li><b>Guessing about the past</b>: <b>Seriam</b> umas dez horas. (It must have been about ten.)</li></ul>
<h4>The big EP secret: the imperfeito does the same job</h4>
<p>In everyday Portuguese speech, the <b>imperfeito</b> very often replaces the condicional. Both are correct; the condicional just sounds more careful or written.</p>
<table><tr><th>Condicional (careful, written)</th><th>Imperfeito (everyday speech)</th></tr>
<tr><td><b>Gostaria</b> de um café.</td><td><b>Gostava</b> de um café.</td></tr>
<tr><td><b>Poderia</b> repetir?</td><td><b>Podia</b> repetir?</td></tr>
<tr><td>Se ganhasse, <b>compraria</b> uma casa.</td><td>Se ganhasse, <b>comprava</b> uma casa.</td></tr></table>
<p>In a presentation, the condicional sounds great. With friends, "gostava" and "podia" sound more natural.</p>
<p class="tip">Pronouns: in writing you may see "dar-lhe-ia" (the pronoun in the middle of the verb). Nobody says that. Use a trigger word (Não lhe daria) or the imperfeito instead (Dava-lhe).</p>` },

  { id: 'infp', title: 'The infinitivo pessoal: a Portuguese superpower', lvl: 'B1', drill: 'infp', html: `
<p>Portuguese is almost the only language where the <b>infinitive gets personal endings</b>. It's a shortcut that often lets you skip the conjuntivo.</p>
<h4>How to build it</h4>
<p>Infinitive + <b>–, -es, –, -mos, -em</b>. No irregulars!</p>
<table><tr><th></th><th>trabalhar</th><th>ir</th><th>sair</th></tr>
<tr><td>eu</td><td>trabalhar</td><td>ir</td><td>sair</td></tr>
<tr><td>tu</td><td>trabalhar<b>es</b></td><td>ir<b>es</b></td><td>saír<b>es</b></td></tr>
<tr><td>ele / ela / você</td><td>trabalhar</td><td>ir</td><td>sair</td></tr>
<tr><td>nós</td><td>trabalhar<b>mos</b></td><td>ir<b>mos</b></td><td>sair<b>mos</b></td></tr>
<tr><td>eles / elas / vocês</td><td>trabalhar<b>em</b></td><td>ir<b>em</b></td><td>saír<b>em</b></td></tr></table>
<p>For regular verbs it looks exactly like the conjuntivo futuro. For irregulars it doesn't: <b>para tu fazeres</b> (infinitivo pessoal) vs <b>quando tu fizeres</b> (conjuntivo futuro).</p>
<h4>When to use it</h4>
<ul><li>After <b>prepositions</b>, when the subject is someone specific: <b>para, sem, até, antes de, depois de, apesar de, ao, por</b>.
<br>Trouxe isto <b>para tu veres</b>. · <b>Antes de saíres</b>, fecha a janela. · <b>Depois de jantarmos</b>, vamos sair. · <b>Apesar de estarem</b> cansados, foram. · Obrigado <b>por virem</b>!</li>
<li>After <b>impersonal expressions</b>: <b>é importante, é necessário, é melhor, é possível, é bom</b>.
<br><b>É importante estudares</b> todos os dias. · <b>É melhor irmos</b> já. · <b>É possível eles chegarem</b> tarde.</li></ul>
<h4>Infinitivo pessoal or conjuntivo?</h4>
<p>Often both work, and they mean the same. The rule of thumb: <b>no "que" → infinitivo pessoal; with "que" → conjuntivo.</b></p>
<table><tr><th>Infinitivo pessoal</th><th>Conjuntivo</th></tr>
<tr><td>para tu <b>veres</b></td><td>para que tu <b>vejas</b></td></tr>
<tr><td>antes de tu <b>saíres</b></td><td>antes que tu <b>saias</b></td></tr>
<tr><td>é importante <b>estudares</b></td><td>é importante que <b>estudes</b></td></tr>
<tr><td>apesar de <b>estarem</b> cansados</td><td>embora <b>estejam</b> cansados</td></tr></table>
<p class="tip">The eu and ele forms look like the plain infinitive, so add the pronoun when it isn't clear: <b>para eu ir</b>, <b>antes de ele chegar</b>. And note: "antes de ele" (not "dele"), because "ele" is the subject of the verb.</p>` },

  { id: 'haverde', title: 'Haver de + infinitivo: "I will, someday"', lvl: 'B1', drill: 'hav', html: `
<p>A very Portuguese way to talk about the future with <b>feeling</b>: determination, a someday wish, or confidence.</p>
<h4>Forms</h4>
<p><b>hei de · hás de · há de · havemos de · hão de</b> + infinitive. (Older spelling: hei-de, hás-de… You'll still see it in Portugal.)</p>
<h4>What it means</h4>
<ul><li><b>Determination or a someday dream</b>: Um dia <b>hei de ir</b> ao Japão. · <b>Hei de aprender</b> a tocar guitarra.</li>
<li><b>Confidence about someone else</b>: Experimenta, <b>hás de gostar</b>. (You'll like it, I'm sure.) · Isso <b>há de passar</b>.</li>
<li><b>"Supposed to" in questions</b>: O que <b>hei de fazer</b>? (What am I supposed to do?) · Como <b>havia de saber</b>? (How was I supposed to know?)</li></ul>
<h4>Hei de vs vou</h4>
<table><tr><th>Vou + infinitivo</th><th>Hei de + infinitivo</th></tr>
<tr><td>A plan. You expect it to happen.</td><td>A resolution or dream. You're sure in your heart, even with no plan.</td></tr>
<tr><td><b>Vou</b> ao Porto no sábado.</td><td>Um dia <b>hei de ganhar</b> o Euromilhões! (said with a smile)</td></tr></table>
<p class="tip">Easy win in class: drop one "hei de" into any talk about the future. "Um dia hei de…" sounds very natural.</p>` },

  { id: 'apresentacao', title: 'Presenting with the conjuntivo: a phrase bank', lvl: 'B1', drill: 'subj', html: `
<p>For a 5–10 minute talk that has to show off the conjuntivo, aim for <b>one conjuntivo per slide</b>. Plan where each one goes, rather than hoping it happens.</p>
<h4>Opening</h4>
<ul><li>Bom dia a todos. <b>Espero que estejam</b> bem.</li>
<li>Hoje vou falar sobre… <b>Espero que achem</b> interessante.</li>
<li><b>Talvez</b> alguns de vocês já <b>conheçam</b>…</li>
<li><b>Quer queiramos quer não</b>, este é um tema que nos afeta a todos.</li></ul>
<h4>Giving opinions</h4>
<ul><li><b>É importante que</b> as pessoas <b>saibam</b>… · <b>É fundamental que</b>… · <b>É pena que</b>…</li>
<li><b>Não acho que seja</b>… · <b>Duvido que</b>… · <b>Não acredito que</b>… <i>(but: Acho que <b>é</b>…, Sei que <b>é</b>…)</i></li>
<li><b>Embora seja</b> difícil, vale a pena. · <b>Por muito que custe</b>, …</li>
<li><b>Que eu saiba</b>, … (as far as I know) · <b>Seja como for</b>, … (anyway)</li></ul>
<h4>Imagining and recommending</h4>
<ul><li><b>Se eu pudesse</b> mudar uma coisa, <b>mudaria</b>… · <b>Se todos fizéssemos</b> isto, …</li>
<li><b>Recomendo que experimentem</b>… · <b>Sugiro que visitem</b>…</li>
<li><b>Quando forem</b> a…, não deixem de… · <b>Quem quiser</b> saber mais, …</li></ul>
<h4>Closing</h4>
<ul><li><b>Caso tenham</b> perguntas, <b>estejam</b> à vontade. · <b>Se tiverem</b> perguntas, digam!</li>
<li><b>Espero que tenham gostado</b>. Obrigado <b>por me ouvirem</b>!</li></ul>
<h4>Quick check before you present</h4>
<table><tr><th>Trigger</th><th>Takes</th></tr>
<tr><td>espero que, é importante que, talvez, embora, caso, para que, não acho que, duvido que</td><td>conjuntivo presente</td></tr>
<tr><td>se (hypothetical), como se, se eu fosse</td><td>conjuntivo imperfeito (+ condicional)</td></tr>
<tr><td>quando, se, assim que, quem (about the future)</td><td>conjuntivo futuro</td></tr>
<tr><td>acho que, sei que, tenho a certeza que, é verdade que</td><td>indicativo, <b>not</b> conjuntivo</td></tr></table>
<p class="tip">Rehearse out loud, slide by slide, and record yourself on your phone. Ask your partner to listen once and point out one mistake and one thing that sounded great. There's a partner card for this.</p>` },

  { id: 'falsefriends', title: 'Cognates & false friends', lvl: 'A1', html: `
<h4>Free vocabulary: English → Portuguese patterns</h4>
<ul><li>-tion → <b>-ção</b>: nation → nação, information → informação</li><li>-ty → <b>-dade</b>: city → cidade, quality → qualidade</li><li>-ly → <b>-mente</b>: really → realmente, finally → finalmente</li><li>-ble → <b>-vel</b>: possible → possível, terrible → terrível</li><li>-ous → <b>-oso</b>: famous → famoso, delicious → delicioso</li><li>-ist → <b>-ista</b>, -ism → <b>-ismo</b>, -ic → <b>-ico</b></li></ul>
<h4>False friends</h4>
<table><tr><th>Portuguese</th><th>Actually means</th><th>Not</th></tr>
<tr><td>puxar</td><td>to pull</td><td>push (= empurrar)</td></tr>
<tr><td>constipado</td><td>having a cold</td><td>constipated (= com prisão de ventre)</td></tr>
<tr><td>esquisito</td><td>weird</td><td>exquisite</td></tr>
<tr><td>livraria</td><td>bookshop</td><td>library (= biblioteca)</td></tr>
<tr><td>pretender</td><td>to intend</td><td>pretend (= fingir)</td></tr>
<tr><td>atualmente</td><td>currently</td><td>actually (= na verdade)</td></tr>
<tr><td>assistir a</td><td>to watch / attend</td><td>assist (= ajudar)</td></tr>
<tr><td>parentes</td><td>relatives</td><td>parents (= pais)</td></tr>
<tr><td>educado</td><td>polite</td><td>educated (= instruído / culto)</td></tr>
<tr><td>propina</td><td>tuition fee</td><td>tip (= gorjeta)</td></tr>
<tr><td>balcão</td><td>counter</td><td>balcony (= varanda)</td></tr>
<tr><td>data</td><td>date (calendar)</td><td>data (= dados)</td></tr>
<tr><td>pasta</td><td>folder / briefcase</td><td>pasta (= massa)</td></tr></table>` },

  { id: 'pronunciation', title: 'Hearing EP: the swallowed vowels', lvl: 'A1–B1', html: `
<p>EP sounds "Slavic" to many people because <b>unstressed vowels shrink or vanish</b>. That's why you can read something easily but not catch it when spoken.</p>
<ul><li>Unstressed <b>e</b> often disappears: <i>telefone</i> ≈ "t'l'fón", <i>de</i> ≈ "d'", <i>pequeno</i> ≈ "p'kênu".</li><li>Unstressed <b>o</b> → "u": <i>obrigado</i> ≈ "ubrigádu", <i>como</i> ≈ "cómu".</li><li>Final <b>-s</b> / before consonants → "sh": <i>dois</i> ≈ "doish", <i>estás</i> ≈ "shtásh".</li><li><b>-ão</b>, <b>-õe</b>, <b>-ãe</b> are nasal diphthongs: <i>pão, põe, mãe</i>.</li><li><b>lh</b> ≈ "lli" in million; <b>nh</b> ≈ "ny" in canyon.</li></ul>
<h4>Shadowing (5 minutes a day)</h4>
<ol><li>Pick a 10–20 second clip (podcast, RTP, the app's audio).</li><li>Listen once with the text.</li><li>Play it again and speak <b>along with it</b>, a split second behind, copying rhythm and melody rather than individual sounds.</li><li>Repeat 3–5 times. Then say it alone.</li></ol>
<p class="tip">As a musician: treat EP like a groove. Stressed syllables are the downbeats and everything between them gets compressed.</p>` },
];
if (typeof module !== 'undefined') module.exports = GRAMMAR;
