/* High-frequency verbs in real sentences: {form} is exactly the engine's form for v/t/p (checked by tests/content.test.js).
   Used by the guided session: English + sentence with a gap → say the whole sentence. */
var VERBSENT = [
  // ser
  { id: 'va_era', v: 'ser', t: 'pimp', p: 0, s: 'Quando {era} miúdo, passava os verões no lago com os meus avós.', en: 'When I was a kid, I spent the summers at the lake with my grandparents.' },
  { id: 'va_foi', v: 'ser', t: 'pps', p: 2, s: 'O concerto de ontem {foi} incrível, Sara.', en: 'Yesterday\'s concert was amazing, Sara.' },
  { id: 'va_seja', v: 'ser', t: 'cpres', p: 2, s: 'Espero que a nova placa gráfica {seja} mais rápida.', en: 'I hope the new graphics card is faster.' },
  { id: 'va_fosse', v: 'ser', t: 'cimp', p: 2, s: 'Se o PC {fosse} mais silencioso, gravava à noite.', en: 'If the PC were quieter, I\'d record at night.' },
  // estar
  { id: 'va_estive', v: 'estar', t: 'pps', p: 0, s: 'Ontem {estive} três horas a gravar guitarras.', en: 'Yesterday I spent three hours recording guitars.' },
  { id: 'va_estavam', v: 'estar', t: 'pimp', p: 4, s: 'Quando cheguei, os meus amigos já {estavam} no café.', en: 'When I arrived, my friends were already at the café.' },
  { id: 'va_estejas', v: 'estar', t: 'cpres', p: 1, s: 'Espero que {estejas} melhor da constipação, Tiago.', en: 'I hope you\'re over your cold, Tiago.' },
  { id: 'va_tenhoestado', v: 'estar', t: 'ppc', p: 0, s: 'Ultimamente {tenho estado} muito cansado por causa do trabalho.', en: 'Lately I\'ve been very tired because of work.' },
  // ter
  { id: 'va_tive', v: 'ter', t: 'pps', p: 0, s: 'Ontem {tive} um furo a meio da subida.', en: 'Yesterday I got a puncture halfway up the climb.' },
  { id: 'va_temos', v: 'ter', t: 'pres', p: 3, s: 'Nós {temos} ensaio todas as quintas à noite.', en: 'We have rehearsal every Thursday evening.' },
  { id: 'va_teria', v: 'ter', t: 'cond', p: 0, s: 'Com mais tempo livre, {teria} uma banda outra vez.', en: 'With more free time, I\'d have a band again.' },
  { id: 'va_tiveres', v: 'ter', t: 'cfut', p: 1, s: 'Quando {tiveres} tempo, ouve a faixa que gravei.', en: 'When you have time, listen to the track I recorded.' },
  // ir
  { id: 'va_fomos', v: 'ir', t: 'pps', p: 3, s: 'No sábado {fomos} de bicicleta até Cascais.', en: 'On Saturday we cycled to Cascais.' },
  { id: 'va_vais', v: 'ir', t: 'pres', p: 1, s: 'A que horas {vais} ao ginásio amanhã?', en: 'What time are you going to the gym tomorrow?' },
  { id: 'va_irei', v: 'ir', t: 'fut', p: 0, s: 'Para o ano {irei} ao Canadá no Natal.', en: 'Next year I\'ll go to Canada for Christmas.' },
  { id: 'va_va', v: 'ir', t: 'cpres', p: 0, s: 'A Inês quer que eu {vá} com ela ao jantar.', en: 'Inês wants me to go to the dinner with her.' },
  // fazer
  { id: 'va_fizeste', v: 'fazer', t: 'pps', p: 1, s: 'O que é que {fizeste} no fim de semana?', en: 'What did you do at the weekend?' },
  { id: 'va_fazia', v: 'fazer', t: 'pimp', p: 0, s: 'Quando vivia em Toronto, {fazia} tudo de carro.', en: 'When I lived in Toronto, I did everything by car.' },
  { id: 'va_tenhofeito', v: 'fazer', t: 'ppc', p: 0, s: 'Ultimamente {tenho feito} muito exercício de manhã.', en: 'Lately I\'ve been doing a lot of exercise in the morning.' },
  { id: 'va_faria', v: 'fazer', t: 'cond', p: 2, s: 'O Tiago disse que {faria} o jantar no sábado.', en: 'Tiago said he would make dinner on Saturday.' },
  { id: 'va_tinhafeito', v: 'fazer', t: 'mqp', p: 2, s: 'Quando cheguei, a Inês já {tinha feito} o jantar.', en: 'When I got home, Inês had already made dinner.' },
  // dizer
  { id: 'va_disse', v: 'dizer', t: 'pps', p: 2, s: 'A professora {disse} que amanhã não há aula.', en: 'The teacher said there\'s no class tomorrow.' },
  { id: 'va_diria', v: 'dizer', t: 'cond', p: 0, s: 'Eu não {diria} isso ao meu chefe.', en: 'I wouldn\'t say that to my boss.' },
  { id: 'va_digas', v: 'dizer', t: 'cpres', p: 1, s: 'Não quero que {digas} nada à Inês ainda.', en: 'I don\'t want you to say anything to Inês yet.' },
  { id: 'va_diziam', v: 'dizer', t: 'pimp', p: 4, s: 'Os meus avós {diziam} sempre que o frio faz bem.', en: 'My grandparents always used to say the cold is good for you.' },
  // poder
  { id: 'va_pude', v: 'poder', t: 'pps', p: 0, s: 'Ontem não {pude} ir ao ensaio por causa do trabalho.', en: 'Yesterday I couldn\'t go to rehearsal because of work.' },
  { id: 'va_poderias', v: 'poder', t: 'cond', p: 1, s: 'Tu {poderias} ajudar-me com o router amanhã?', en: 'Could you help me with the router tomorrow?' },
  { id: 'va_pudesse', v: 'poder', t: 'cimp', p: 0, s: 'Se eu {pudesse}, trabalhava sempre a partir de casa.', en: 'If I could, I\'d always work from home.' },
  { id: 'va_podiamos', v: 'poder', t: 'pimp', p: 3, s: 'Antigamente {podíamos} estacionar mesmo à porta de casa.', en: 'In the old days we could park right outside the house.' },
  // querer
  { id: 'va_quis', v: 'querer', t: 'pps', p: 0, s: 'Não {quis} ir à festa porque estava cansado.', en: 'I didn\'t want to go to the party because I was tired.' },
  { id: 'va_querem', v: 'querer', t: 'pres', p: 4, s: 'Os meus pais {querem} visitar Lisboa na primavera.', en: 'My parents want to visit Lisbon in the spring.' },
  { id: 'va_quisesses', v: 'querer', t: 'cimp', p: 1, s: 'Se {quisesses}, podíamos jogar juntos logo à noite.', en: 'If you wanted, we could play together tonight.' },
  { id: 'va_queres', v: 'querer', t: 'pres', p: 1, s: 'Sara, {queres} vir connosco à praia no sábado?', en: 'Sara, do you want to come with us to the beach on Saturday?' },
  // saber
  { id: 'va_soube', v: 'saber', t: 'pps', p: 0, s: 'Só ontem {soube} que a loja tinha fechado.', en: 'I only found out yesterday that the shop had closed.' },
  { id: 'va_sabia', v: 'saber', t: 'pimp', p: 0, s: 'Eu não {sabia} que o Tiago tocava bateria.', en: 'I didn\'t know Tiago played the drums.' },
  { id: 'va_saibas', v: 'saber', t: 'cpres', p: 1, s: 'É importante que {saibas} as regras antes de jogar.', en: 'It\'s important that you know the rules before playing.' },
  { id: 'va_sabes', v: 'saber', t: 'pres', p: 1, s: 'Tu {sabes} onde fica a oficina de bicicletas aqui perto?', en: 'Do you know where the bike repair shop is?' },
  // dar
  { id: 'va_da', v: 'dar', t: 'pres', p: 2, s: 'O meu pai {dá} sempre bons conselhos sobre guitarras.', en: 'My dad always gives good advice about guitars.' },
  { id: 'va_temdado', v: 'dar', t: 'ppc', p: 4, s: 'Os vizinhos {têm dado} festas todos os fins de semana.', en: 'The neighbours have been throwing parties every weekend.' },
  { id: 'va_desse', v: 'dar', t: 'cimp', p: 2, s: 'Se o técnico me {desse} uma resposta, já ficava contente.', en: 'If the technician gave me an answer, I\'d be happy.' },
  { id: 'va_dimp', v: 'dar', t: 'imp', p: 1, s: 'Tiago, {dá}-me a palheta, se faz favor.', en: 'Tiago, give me the pick, please.' },
  // ver
  { id: 'va_veremos', v: 'ver', t: 'fut', p: 3, s: 'No sábado {veremos} o jogo em casa do Tiago.', en: 'On Saturday we\'ll watch the game at Tiago\'s place.' },
  { id: 'va_via', v: 'ver', t: 'pimp', p: 0, s: 'No Canadá {via} hóquei todos os sábados.', en: 'In Canada I used to watch hockey every Saturday.' },
  { id: 'va_tenhovisto', v: 'ver', t: 'ppc', p: 0, s: 'Ultimamente {tenho visto} muitas séries portuguesas.', en: 'Lately I\'ve been watching lots of Portuguese series.' },
  { id: 'va_vires', v: 'ver', t: 'cfut', p: 1, s: 'Quando {vires} a Sara, diz-lhe que já gravei a faixa.', en: 'When you see Sara, tell her I\'ve recorded the track.' },
  // vir
  { id: 'va_viria', v: 'vir', t: 'cond', p: 2, s: 'O Tiago disse que {viria} jantar cá a casa na sexta.', en: 'Tiago said he would come over for dinner on Friday.' },
  { id: 'va_temvindo', v: 'vir', t: 'ppc', p: 2, s: 'O Tiago {tem vindo} aos ensaios de bicicleta.', en: 'Tiago has been coming to rehearsals by bike.' },
  { id: 'va_venhas', v: 'vir', t: 'cpres', p: 1, s: 'Espero que {venhas} ao meu concerto no sábado.', en: 'I hope you come to my gig on Saturday.' },
  { id: 'va_vira', v: 'vir', t: 'fut', p: 2, s: 'A Inês {virá} connosco ao Porto no próximo mês.', en: 'Inês will come with us to Porto next month.' },
  // pôr
  { id: 'va_pus', v: 'pôr', t: 'pps', p: 0, s: 'Ontem {pus} cordas novas na guitarra.', en: 'Yesterday I put new strings on the guitar.' },
  { id: 'va_punha', v: 'pôr', t: 'pimp', p: 0, s: 'Antigamente {punha} sempre o despertador para as seis.', en: 'I used to always set the alarm for six.' },
  { id: 'va_poria', v: 'pôr', t: 'cond', p: 0, s: 'Eu {poria} o microfone um pouco mais longe.', en: 'I\'d put the microphone a bit further away.' },
  { id: 'va_ponhas', v: 'pôr', t: 'cpres', p: 1, s: 'Não quero que {ponhas} a bicicleta no corredor.', en: 'I don\'t want you to put the bike in the hallway.' },
  // trazer
  { id: 'va_trarei', v: 'trazer', t: 'fut', p: 0, s: 'Amanhã {trarei} o meu amplificador para o ensaio.', en: 'Tomorrow I\'ll bring my amp to rehearsal.' },
  { id: 'va_trouxe', v: 'trazer', t: 'pps', p: 2, s: 'A minha mãe {trouxe} bolachas do Canadá.', en: 'My mum brought cookies from Canada.' },
  { id: 'va_traria', v: 'trazer', t: 'cond', p: 2, s: 'A Sara disse que {traria} sobremesa para o jantar.', en: 'Sara said she would bring dessert for dinner.' },
  { id: 'va_tragas', v: 'trazer', t: 'cpres', p: 1, s: 'Preciso que {tragas} a coluna para a festa.', en: 'I need you to bring the speaker to the party.' },
  // ficar
  { id: 'va_ficamos', v: 'ficar', t: 'pps', p: 3, s: 'No verão {ficámos} uma semana no Alentejo.', en: 'In the summer we stayed a week in the Alentejo.' },
  { id: 'va_ficava', v: 'ficar', t: 'pimp', p: 0, s: 'Quando chovia, {ficava} em casa a jogar.', en: 'When it rained, I used to stay home playing games.' },
  { id: 'va_tenhoficado', v: 'ficar', t: 'ppc', p: 0, s: 'Ultimamente {tenho ficado} em casa ao fim de semana.', en: 'Lately I\'ve been staying home at weekends.' },
  { id: 'va_ficarias', v: 'ficar', t: 'cond', p: 1, s: 'Se viesses comigo, {ficarias} impressionado com a vista.', en: 'If you came with me, you\'d be impressed by the view.' },
  // haver
  { id: 'va_ha', v: 'haver', t: 'pres', p: 2, s: 'Hoje não {há} aula de português.', en: 'There\'s no Portuguese class today.' },
  { id: 'va_havera', v: 'haver', t: 'fut', p: 2, s: 'Amanhã {haverá} trânsito por causa da maratona.', en: 'Tomorrow there\'ll be traffic because of the marathon.' },
  { id: 'va_haja', v: 'haver', t: 'cpres', p: 2, s: 'Espero que {haja} lugar no comboio para a bicicleta.', en: 'I hope there\'s room on the train for the bike.' },
  { id: 'va_tinhahavido', v: 'haver', t: 'mqp', p: 2, s: 'Disseram-me que {tinha havido} um problema com o servidor.', en: 'They told me there had been a problem with the server.' },
  // conseguir
  { id: 'va_consigo', v: 'conseguir', t: 'pres', p: 0, s: 'Ainda não {consigo} tocar este solo à velocidade certa.', en: 'I still can\'t play this solo at the right speed.' },
  { id: 'va_conseguia', v: 'conseguir', t: 'pimp', p: 0, s: 'No início não {conseguia} perceber os meus colegas.', en: 'At first I couldn\'t understand my colleagues.' },
  { id: 'va_tensconseguido', v: 'conseguir', t: 'ppc', p: 1, s: 'Tu {tens conseguido} dormir bem ultimamente?', en: 'Have you been managing to sleep well lately?' },
  { id: 'va_conseguisses', v: 'conseguir', t: 'cimp', p: 1, s: 'Se {conseguisses} vir mais cedo, ensaiávamos mais.', en: 'If you could come earlier, we\'d rehearse more.' },
  // perceber
  { id: 'va_percebi', v: 'perceber', t: 'pps', p: 0, s: 'Não {percebi} o que o técnico me disse.', en: 'I didn\'t understand what the technician told me.' },
  { id: 'va_percebia', v: 'perceber', t: 'pimp', p: 0, s: 'Quando cheguei a Lisboa, não {percebia} quase nada.', en: 'When I arrived in Lisbon, I understood almost nothing.' },
  { id: 'va_tenhopercebido', v: 'perceber', t: 'ppc', p: 0, s: 'Ultimamente {tenho percebido} melhor as notícias na rádio.', en: 'Lately I\'ve been understanding the radio news better.' },
  { id: 'va_percebessem', v: 'perceber', t: 'cimp', p: 4, s: 'Se eles {percebessem} inglês, era tudo mais fácil.', en: 'If they understood English, everything would be easier.' },
  // sair
  { id: 'va_saimos', v: 'sair', t: 'pps', p: 3, s: 'Ontem {saímos} do trabalho mais cedo para ir à praia.', en: 'Yesterday we left work early to go to the beach.' },
  { id: 'va_saisse', v: 'sair', t: 'cimp', p: 0, s: 'Se eu {saísse} mais cedo, apanhava o comboio das seis.', en: 'If I left earlier, I\'d catch the six o\'clock train.' },
  { id: 'va_saias', v: 'sair', t: 'cpres', p: 1, s: 'Espero que não {saias} tarde do trabalho hoje.', en: 'I hope you don\'t leave work late today.' },
  { id: 'va_saires', v: 'sair', t: 'infp', p: 1, s: 'Liga-me antes de {saíres} de casa.', en: 'Call me before you leave the house.' },
  // pedir
  { id: 'va_pedi', v: 'pedir', t: 'pps', p: 0, s: 'No café {pedi} uma bica e uma torrada.', en: 'At the café I ordered an espresso and toast.' },
  { id: 'va_pediam', v: 'pedir', t: 'pimp', p: 4, s: 'Os meus amigos {pediam} sempre pizza às sextas.', en: 'My friends always used to order pizza on Fridays.' },
  { id: 'va_peca', v: 'pedir', t: 'cpres', p: 0, s: 'A Inês quer que eu {peça} desculpa ao Tiago.', en: 'Inês wants me to apologise to Tiago.' },
  { id: 'va_pedissem', v: 'pedir', t: 'cimp', p: 4, s: 'Se me {pedissem} ajuda, eu ajudava logo.', en: 'If they asked me for help, I\'d help right away.' },
  // falar
  { id: 'vb_falamos', v: 'falar', t: 'pps', p: 3, s: 'Ontem {falámos} com o senhorio sobre a renda.', en: 'Yesterday we spoke to the landlord about the rent.' },
  { id: 'vb_falava', v: 'falar', t: 'pimp', p: 0, s: 'Quando cheguei a Lisboa, {falava} muito pouco português.', en: 'When I arrived in Lisbon, I spoke very little Portuguese.' },
  { id: 'vb_falasse', v: 'falar', t: 'cimp', p: 0, s: 'Se eu {falasse} melhor, fazia a apresentação sem notas.', en: 'If I spoke better, I\'d do the presentation without notes.' },
  { id: 'vb_falarmos', v: 'falar', t: 'infp', p: 3, s: 'A professora pediu para {falarmos} só em português.', en: 'The teacher asked us to speak only in Portuguese.' },
  // chegar
  { id: 'vb_cheguei', v: 'chegar', t: 'pps', p: 0, s: 'Ontem {cheguei} atrasado à aula de português.', en: 'Yesterday I was late for Portuguese class.' },
  { id: 'vb_chegavam', v: 'chegar', t: 'pimp', p: 4, s: 'Antigamente os meus amigos {chegavam} sempre tarde ao jantar.', en: 'My friends used to always arrive late for dinner.' },
  { id: 'vb_chegues', v: 'chegar', t: 'cpres', p: 1, s: 'Espero que {chegues} a tempo do concerto.', en: 'I hope you get there in time for the concert.' },
  { id: 'vb_chegarmos', v: 'chegar', t: 'cfut', p: 3, s: 'Quando {chegarmos} a Sintra, paramos para um café.', en: 'When we get to Sintra, we\'ll stop for a coffee.' },
  // começar
  { id: 'vb_comeca', v: 'começar', t: 'pres', p: 2, s: 'O jogo {começa} às nove, não te atrases.', en: 'The game starts at nine, don\'t be late.' },
  { id: 'vb_tenhocomecado', v: 'começar', t: 'ppc', p: 0, s: 'Ultimamente {tenho começado} o dia com uma volta de bicicleta.', en: 'Lately I\'ve been starting the day with a bike ride.' },
  { id: 'vb_comecaremos', v: 'começar', t: 'fut', p: 3, s: 'Para a semana {começaremos} a gravar o disco novo.', en: 'Next week we\'ll start recording the new album.' },
  { id: 'vb_comeca_imp', v: 'começar', t: 'imp', p: 1, s: 'Olha, {começa} tu, que eu ainda estou a afinar a guitarra.', en: 'Look, you start, I\'m still tuning the guitar.' },
  // acabar
  { id: 'vb_acabamos', v: 'acabar', t: 'pps', p: 3, s: 'Ontem à noite {acabámos} a mistura da música nova.', en: 'Last night we finished the mix of the new song.' },
  { id: 'vb_acabava', v: 'acabar', t: 'pimp', p: 0, s: 'No Canadá, {acabava} sempre de trabalhar às cinco.', en: 'In Canada, I always used to finish work at five.' },
  { id: 'vb_tinhaacabado', v: 'acabar', t: 'mqp', p: 2, s: 'Quando cheguei, o Tiago já {tinha acabado} de jantar.', en: 'When I arrived, Tiago had already finished eating.' },
  { id: 'vb_acabem', v: 'acabar', t: 'cpres', p: 4, s: 'Espero que eles {acabem} as obras na ciclovia em breve.', en: 'I hope they finish the works on the cycle path soon.' },
  // pagar
  { id: 'vb_paguei', v: 'pagar', t: 'pps', p: 0, s: 'Ontem {paguei} a conta da luz no Multibanco.', en: 'Yesterday I paid the electricity bill at the cash machine.' },
  { id: 'vb_temospago', v: 'pagar', t: 'ppc', p: 3, s: 'Ultimamente {temos pago} demasiado pela internet.', en: 'Lately we\'ve been paying too much for the internet.' },
  { id: 'vb_pagaria', v: 'pagar', t: 'cond', p: 0, s: 'Eu {pagaria} mais por uma bicicleta mais leve.', en: 'I\'d pay more for a lighter bike.' },
  { id: 'vb_pagasses', v: 'pagar', t: 'cimp', p: 1, s: 'Se {pagasses} a renda online, poupavas tempo.', en: 'If you paid the rent online, you\'d save time.' },
  // jogar
  { id: 'vb_joguei', v: 'jogar', t: 'pps', p: 0, s: 'No sábado {joguei} cinco horas seguidas com o Tiago.', en: 'On Saturday I played five hours straight with Tiago.' },
  { id: 'vb_jogavamos', v: 'jogar', t: 'pimp', p: 3, s: 'Quando éramos miúdos, {jogávamos} à bola todos os dias.', en: 'When we were kids, we used to play football every day.' },
  { id: 'vb_jogam', v: 'jogar', t: 'pres', p: 4, s: 'Os meus amigos {jogam} online todas as sextas à noite.', en: 'My friends play online every Friday night.' },
  { id: 'vb_tenhojogado', v: 'jogar', t: 'ppc', p: 0, s: 'Ultimamente {tenho jogado} menos porque ando a gravar.', en: 'Lately I\'ve been playing less because I\'ve been recording.' },
  // tocar
  { id: 'vb_tocou', v: 'tocar', t: 'pps', p: 2, s: 'A banda {tocou} até à meia-noite no bar.', en: 'The band played until midnight at the bar.' },
  { id: 'vb_tocava', v: 'tocar', t: 'pimp', p: 0, s: 'Antigamente {tocava} guitarra todos os dias depois da escola.', en: 'I used to play guitar every day after school.' },
  { id: 'vb_tocariamos', v: 'tocar', t: 'cond', p: 3, s: 'Nós {tocaríamos} mais vezes se tivéssemos uma sala de ensaio.', en: 'We\'d play more often if we had a rehearsal room.' },
  { id: 'vb_toque', v: 'tocar', t: 'cpres', p: 0, s: 'A Inês quer que eu {toque} uma música no jantar.', en: 'Inês wants me to play a song at the dinner.' },
  // gravar
  { id: 'vb_gravamos', v: 'gravar', t: 'pps', p: 3, s: 'No domingo {gravámos} as guitarras em casa do Tiago.', en: 'On Sunday we recorded the guitars at Tiago\'s place.' },
  { id: 'vb_tenhogravado', v: 'gravar', t: 'ppc', p: 0, s: 'Ultimamente {tenho gravado} muitas ideias no telemóvel.', en: 'Lately I\'ve been recording lots of ideas on my phone.' },
  { id: 'vb_gravarei', v: 'gravar', t: 'fut', p: 0, s: 'Amanhã {gravarei} a voz, se a garganta deixar.', en: 'Tomorrow I\'ll record the vocals, if my throat lets me.' },
  { id: 'vb_gravasse', v: 'gravar', t: 'cimp', p: 0, s: 'Se eu {gravasse} com um microfone melhor, o som era outro.', en: 'If I recorded with a better microphone, the sound would be different.' },
  // ligar
  { id: 'vb_liguei', v: 'ligar', t: 'pps', p: 0, s: 'Ontem {liguei} à minha mãe no Canadá.', en: 'Yesterday I called my mum in Canada.' },
  { id: 'vb_ligas', v: 'ligar', t: 'pres', p: 1, s: 'Tu {ligas} sempre à hora do jantar!', en: 'You always call at dinner time!' },
  { id: 'vb_ligue', v: 'ligar', t: 'cpres', p: 2, s: 'Espero que o técnico {ligue} hoje por causa do router.', en: 'I hope the technician calls today about the router.' },
  { id: 'vb_ligaria', v: 'ligar', t: 'cond', p: 0, s: 'Eu {ligaria} ao senhorio, mas ele nunca atende.', en: 'I\'d call the landlord, but he never answers.' },
  // levar
  { id: 'vb_levamos', v: 'levar', t: 'pps', p: 3, s: 'Ontem {levámos} as bicicletas no comboio para Cascais.', en: 'Yesterday we took the bikes on the train to Cascais.' },
  { id: 'vb_levasse', v: 'levar', t: 'cimp', p: 2, s: 'Se o Tiago {levasse} o carro, íamos todos juntos.', en: 'If Tiago took the car, we\'d all go together.' },
  { id: 'vb_levara', v: 'levar', t: 'fut', p: 2, s: 'Quanto tempo {levará} a reparação do portátil?', en: 'How long will the laptop repair take?' },
  { id: 'vb_levassemos', v: 'levar', t: 'cimp', p: 3, s: 'Se {levássemos} o carro, chegávamos mais cedo à praia.', en: 'If we took the car, we\'d get to the beach earlier.' },
  // deixar
  { id: 'vb_deixou', v: 'deixar', t: 'pps', p: 2, s: 'A Inês {deixou} as chaves no café ontem.', en: 'Inês left the keys at the café yesterday.' },
  { id: 'vb_deixo', v: 'deixar', t: 'pres', p: 0, s: 'Eu {deixo} sempre a bicicleta na garagem do prédio.', en: 'I always leave the bike in the building\'s garage.' },
  { id: 'vb_deixem', v: 'deixar', t: 'cpres', p: 4, s: 'Espero que eles me {deixem} jogar com eles hoje.', en: 'I hope they let me play with them today.' },
  { id: 'vb_deixa_imp', v: 'deixar', t: 'imp', p: 1, s: 'Não, {deixa} estar, eu pago o café.', en: 'No, never mind, I\'ll pay for the coffee.' },
  // passar
  { id: 'vb_passamos', v: 'passar', t: 'pps', p: 3, s: 'Ontem {passámos} a tarde numa esplanada em Alfama.', en: 'Yesterday we spent the afternoon on a terrace in Alfama.' },
  { id: 'vb_passava', v: 'passar', t: 'pimp', p: 0, s: 'Antigamente {passava} os invernos a jogar em casa.', en: 'I used to spend the winters gaming at home.' },
  { id: 'vb_passaria', v: 'passar', t: 'cond', p: 2, s: 'O tempo {passaria} mais depressa com música.', en: 'Time would go by faster with music.' },
  { id: 'vb_tempassado', v: 'passar', t: 'ppc', p: 4, s: 'Os meus amigos {têm passado} muito tempo no ginásio.', en: 'My friends have been spending a lot of time at the gym.' },
  // encontrar
  { id: 'vb_encontrariamos', v: 'encontrar', t: 'cond', p: 3, s: 'Com mais tempo, {encontraríamos} uma casa melhor.', en: 'With more time, we\'d find a better flat.' },
  { id: 'vb_encontravamos', v: 'encontrar', t: 'pimp', p: 3, s: 'Antes {encontrávamos} os nossos amigos todos os sábados no café.', en: 'We used to meet our friends every Saturday at the café.' },
  { id: 'vb_encontre', v: 'encontrar', t: 'cpres', p: 0, s: 'Talvez {encontre} uma guitarra usada na feira.', en: 'Maybe I\'ll find a second-hand guitar at the market.' },
  { id: 'vb_encontrares', v: 'encontrar', t: 'cfut', p: 1, s: 'Se {encontrares} o meu carregador, avisa-me.', en: 'If you find my charger, let me know.' },
  // pensar
  { id: 'vb_penso', v: 'pensar', t: 'pres', p: 0, s: 'Eu {penso} muito em voltar ao Canadá no verão.', en: 'I think a lot about going back to Canada in the summer.' },
  { id: 'vb_pensava', v: 'pensar', t: 'pimp', p: 2, s: 'A Sara {pensava} que eu era espanhol.', en: 'Sara thought I was Spanish.' },
  { id: 'vb_tenhopensado', v: 'pensar', t: 'ppc', p: 0, s: 'Ultimamente {tenho pensado} em comprar um portátil novo.', en: 'Lately I\'ve been thinking about buying a new laptop.' },
  { id: 'vb_pensarias', v: 'pensar', t: 'cond', p: 1, s: 'Tu {pensarias} o mesmo se vivesses aqui.', en: 'You\'d think the same if you lived here.' },
  // achar
  { id: 'vb_achas', v: 'achar', t: 'pres', p: 1, s: 'Tu {achas} que vai chover no fim de semana?', en: 'Do you think it\'s going to rain at the weekend?' },
  { id: 'vb_achasse', v: 'achar', t: 'cimp', p: 0, s: 'Se eu {achasse} a minha palheta, tocava já.', en: 'If I found my pick, I\'d play right now.' },
  { id: 'vb_achava', v: 'achar', t: 'pimp', p: 0, s: 'Antigamente {achava} o português muito difícil.', en: 'I used to find Portuguese very hard.' },
  { id: 'vb_achassem', v: 'achar', t: 'cimp', p: 4, s: 'Se eles {achassem} o jogo fácil, não me pediam ajuda.', en: 'If they found the game easy, they wouldn\'t ask me for help.' },
  // comprar
  { id: 'vb_comprei', v: 'comprar', t: 'pps', p: 0, s: 'No sábado {comprei} cordas novas para a guitarra.', en: 'On Saturday I bought new strings for the guitar.' },
  { id: 'vb_compravamos', v: 'comprar', t: 'pimp', p: 3, s: 'No Canadá {comprávamos} tudo no supermercado ao fim de semana.', en: 'In Canada we used to buy everything at the supermarket at the weekend.' },
  { id: 'vb_compraria', v: 'comprar', t: 'cond', p: 0, s: 'Eu {compraria} uma bicicleta elétrica se fosse mais barata.', en: 'I\'d buy an electric bike if it were cheaper.' },
  { id: 'vb_compres', v: 'comprar', t: 'cpres', p: 1, s: 'É importante que {compres} um capacete bom.', en: 'It\'s important that you buy a good helmet.' },
  // precisar
  { id: 'vb_preciso', v: 'precisar', t: 'pres', p: 0, s: 'Eu {preciso} de uma câmara de ar nova.', en: 'I need a new inner tube.' },
  { id: 'vb_temosprecisado', v: 'precisar', t: 'ppc', p: 3, s: 'Ultimamente {temos precisado} de mais tempo para ensaiar.', en: 'Lately we\'ve been needing more time to rehearse.' },
  { id: 'vb_precisasse', v: 'precisar', t: 'cimp', p: 0, s: 'Se {precisasse} de ajuda, ligava-te.', en: 'If I needed help, I\'d call you.' },
  { id: 'vb_precisaremos', v: 'precisar', t: 'fut', p: 3, s: 'Amanhã {precisaremos} do carro para levar o amplificador.', en: 'Tomorrow we\'ll need the car to take the amp.' },
  // esperar
  { id: 'vb_esperamos', v: 'esperar', t: 'pps', p: 3, s: 'Ontem {esperámos} meia hora pelo autocarro.', en: 'Yesterday we waited half an hour for the bus.' },
  { id: 'vb_esperava', v: 'esperar', t: 'pimp', p: 0, s: 'Eu {esperava} uma resposta mais rápida do técnico.', en: 'I was expecting a quicker answer from the technician.' },
  { id: 'vb_temesperado', v: 'esperar', t: 'ppc', p: 2, s: 'A Inês {tem esperado} muito pelo resultado do exame.', en: 'Inês has been waiting a long time for her exam result.' },
  { id: 'vb_tinhamesperado', v: 'esperar', t: 'mqp', p: 4, s: 'Quando chegámos, eles já {tinham esperado} uma hora.', en: 'When we arrived, they had already waited an hour.' },
  // voltar
  { id: 'vb_voltei', v: 'voltar', t: 'pps', p: 0, s: 'Ontem {voltei} a casa de bicicleta pela marginal.', en: 'Yesterday I rode home along the seafront.' },
  { id: 'vb_voltam', v: 'voltar', t: 'pres', p: 4, s: 'Eles {voltam} do Porto no domingo à noite.', en: 'They come back from Porto on Sunday night.' },
  { id: 'vb_voltar_cfut', v: 'voltar', t: 'cfut', p: 0, s: 'Quando {voltar} do Canadá, trago-te xarope de ácer.', en: 'When I get back from Canada, I\'ll bring you maple syrup.' },
  { id: 'vb_voltara', v: 'voltar', t: 'fut', p: 2, s: 'O Tiago {voltará} ao trabalho na segunda-feira.', en: 'Tiago will go back to work on Monday.' },
  // ajudar
  { id: 'vb_ajudes', v: 'ajudar', t: 'cpres', p: 1, s: 'Espero que me {ajudes} a montar o PC no sábado.', en: 'I hope you\'ll help me build the PC on Saturday.' },
  { id: 'vb_ajudavam', v: 'ajudar', t: 'pimp', p: 4, s: 'Os meus pais {ajudavam}-me com os trabalhos de casa.', en: 'My parents used to help me with my homework.' },
  { id: 'vb_ajudariamos', v: 'ajudar', t: 'cond', p: 3, s: 'Nós {ajudaríamos} com prazer, mas estamos fora.', en: 'We\'d gladly help, but we\'re away.' },
  { id: 'vb_ajudar_infp', v: 'ajudar', t: 'infp', p: 2, s: 'Liguei ao Tiago para ele me {ajudar} com o router.', en: 'I called Tiago so he\'d help me with the router.' },
];
if (typeof module !== 'undefined') module.exports = { VERBSENT };
