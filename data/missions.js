/* Missões: real-life quests in Lisbon, three a week. Finishing one turns a chosen phrase into a review card. See tests/content.test.js. */
var MISSIONS = [
  // ---------- café ----------
  { id: 'm_bica', title: 'Pede o café sem mudar para inglês', en: 'Order coffee without switching to English', where: 'café', lvl: 'A2',
    task: 'At a café or pastelaria, order in Portuguese and ask one extra question (what a pastry is, if there\'s decaf). If they switch to English, keep going in Portuguese.',
    phrases: [
      { pt: 'Queria uma bica e um pastel de nata, se faz favor.', en: 'I\'d like an espresso and a custard tart, please.' },
      { pt: 'O que é que tem este bolo?', en: 'What\'s in this cake?' },
      { pt: 'Podemos falar em português? Estou a aprender.', en: 'Can we speak Portuguese? I\'m learning.' },
    ] },
  { id: 'm_galao', title: 'Experimenta uma bebida nova', en: 'Try a drink you\'ve never ordered', where: 'café', lvl: 'A2',
    task: 'Order something you\'ve never had (um galão, uma meia de leite, um abatanado, um carioca de limão) and ask the staff what the difference is.',
    phrases: [
      { pt: 'Qual é a diferença entre um galão e uma meia de leite?', en: 'What\'s the difference between a galão and a meia de leite?' },
      { pt: 'Então quero experimentar um galão, por favor.', en: 'Then I\'d like to try a galão, please.' },
      { pt: 'É servido em copo ou em chávena?', en: 'Is it served in a glass or a cup?' },
    ] },
  { id: 'm_conta', title: 'Pede a conta e paga em português', en: 'Ask for the bill and pay in Portuguese', where: 'café', lvl: 'A2',
    task: 'At the end of a coffee or a meal, ask for the bill, say how you\'ll pay, and answer the NIF question (you can just say you don\'t need it), all in Portuguese.',
    phrases: [
      { pt: 'Pode trazer-me a conta, por favor?', en: 'Could you bring me the bill, please?' },
      { pt: 'Posso pagar com cartão?', en: 'Can I pay by card?' },
      { pt: 'Não, sem contribuinte, obrigado.', en: 'No, without my tax number, thanks.' },
    ] },
  { id: 'm_esplanada', title: 'Comenta o tempo na esplanada', en: 'Small talk about the weather on a terrace', where: 'café', lvl: 'B1',
    task: 'Sitting at an esplanada, make one comment about the weather or the view to the waiter or the next table, and keep it going for two or three exchanges.',
    phrases: [
      { pt: 'Hoje está mesmo um dia bonito, não está?', en: 'It\'s a really beautiful day today, isn\'t it?' },
      { pt: 'Ontem choveu imenso, hoje já ninguém diria.', en: 'It rained loads yesterday; today you\'d never know.' },
      { pt: 'Isto aqui ao fim da tarde é muito agradável.', en: 'It\'s really nice here in the late afternoon.' },
    ] },

  // ---------- shop ----------
  { id: 'm_mercado', title: 'Compra fruta da época no mercado', en: 'Buy seasonal fruit at the market', where: 'shop', lvl: 'A2',
    task: 'At a market stall (Campo de Ourique, Arroios, Benfica…), ask what\'s in season, ask for a quantity in grams or kilos, and ask for a recommendation.',
    phrases: [
      { pt: 'O que é que está bom agora, nesta altura do ano?', en: 'What\'s good right now, at this time of year?' },
      { pt: 'Queria meio quilo de tangerinas, se faz favor.', en: 'I\'d like half a kilo of mandarins, please.' },
      { pt: 'Estas são doces ou mais ácidas?', en: 'Are these sweet or more sour?' },
    ] },
  { id: 'm_talho', title: 'Pede carne cortada à medida no talho', en: 'Get meat cut to order at the butcher\'s', where: 'shop', lvl: 'B1',
    task: 'At a talho, ask for something for a specific dish, say how many people it\'s for, and ask how the butcher would cook it.',
    phrases: [
      { pt: 'Queria carne para um guisado, para quatro pessoas.', en: 'I\'d like meat for a stew, for four people.' },
      { pt: 'Pode cortar em pedaços pequenos, por favor?', en: 'Could you cut it into small pieces, please?' },
      { pt: 'Como é que o senhor costuma cozinhar isto?', en: 'How do you usually cook this?' },
    ] },
  { id: 'm_peixaria', title: 'Compra peixe e pede para o amanharem', en: 'Buy fish and ask them to clean it', where: 'shop', lvl: 'B1',
    task: 'At the peixaria or the fish counter, ask which fish is freshest today, buy one, and ask them to clean it (amanhar), and say whether to take the head off.',
    phrases: [
      { pt: 'Qual é o peixe mais fresco de hoje?', en: 'Which fish is the freshest today?' },
      { pt: 'Pode amanhar, por favor? E tirar a cabeça.', en: 'Could you clean it, please? And take the head off.' },
      { pt: 'Isto dá para grelhar ou é melhor cozer?', en: 'Is this good for grilling, or is it better boiled?' },
    ] },
  { id: 'm_worten', title: 'Pede ajuda numa loja de eletrónica', en: 'Get help in an electronics shop', where: 'shop', lvl: 'B1',
    task: 'At Worten or FNAC, ask a staff member to compare two products (headphones, a keyboard, a cable) and ask about the warranty, in Portuguese only.',
    phrases: [
      { pt: 'Qual é a diferença entre estes dois modelos?', en: 'What\'s the difference between these two models?' },
      { pt: 'Tem garantia de quanto tempo?', en: 'How long is the warranty?' },
      { pt: 'Se não funcionar, posso trocar?', en: 'If it doesn\'t work, can I exchange it?' },
    ] },
  { id: 'm_troca', title: 'Troca ou devolve uma coisa', en: 'Exchange or return something', where: 'shop', lvl: 'B1',
    task: 'Next time something you bought is the wrong size or doesn\'t work, take it back and explain the problem in Portuguese: when you bought it and what\'s wrong.',
    phrases: [
      { pt: 'Comprei isto na semana passada, mas não funciona.', en: 'I bought this last week, but it doesn\'t work.' },
      { pt: 'Queria trocar por outro, se for possível.', en: 'I\'d like to exchange it for another one, if possible.' },
      { pt: 'Tenho aqui o talão.', en: 'I have the receipt here.' },
    ] },

  // ---------- transport ----------
  { id: 'm_carris', title: 'Pergunta qual é o autocarro certo', en: 'Ask which bus to take', where: 'transport', lvl: 'A2',
    task: 'At a Carris stop, ask someone waiting (or the driver) whether this bus goes where you\'re going and where to get off.',
    phrases: [
      { pt: 'Desculpe, este autocarro vai para o Cais do Sodré?', en: 'Excuse me, does this bus go to Cais do Sodré?' },
      { pt: 'Onde é que devo sair para a Estrela?', en: 'Where should I get off for Estrela?' },
      { pt: 'Pode avisar-me quando chegarmos?', en: 'Could you let me know when we get there?' },
    ] },
  { id: 'm_comboio', title: 'Compra um bilhete de comboio ao balcão', en: 'Buy a train ticket at the counter', where: 'transport', lvl: 'A2',
    task: 'At a CP station (Cais do Sodré, Rossio, Santa Apolónia), buy a ticket at the counter instead of the machine and ask when the next train leaves.',
    phrases: [
      { pt: 'Queria um bilhete de ida e volta para Sintra.', en: 'I\'d like a return ticket to Sintra.' },
      { pt: 'A que horas sai o próximo comboio?', en: 'What time does the next train leave?' },
      { pt: 'De que linha é que parte?', en: 'Which platform does it leave from?' },
    ] },
  { id: 'm_viva', title: 'Resolve um problema com o passe', en: 'Sort out a problem with your transport card', where: 'transport', lvl: 'B1',
    task: 'At a Metro ticket office, ask about topping up, a card that won\'t read, or which pass suits you. Explain the situation in two or three sentences.',
    phrases: [
      { pt: 'O cartão não está a passar na máquina.', en: 'The card isn\'t working at the gate.' },
      { pt: 'Queria carregar o passe para este mês.', en: 'I\'d like to top up the pass for this month.' },
      { pt: 'Que passe me aconselha se ando de comboio e de metro?', en: 'Which pass would you recommend if I take the train and the metro?' },
    ] },

  // ---------- bike ----------
  { id: 'm_lojabike', title: 'Pede um orçamento na loja de bicicletas', en: 'Get a quote at the bike shop', where: 'bike', lvl: 'B1',
    task: 'At a bike shop, describe a noise or problem (brakes, gears, chain) and ask how much the repair would cost and when it would be ready.',
    phrases: [
      { pt: 'As mudanças estão a saltar quando subo.', en: 'The gears keep slipping when I climb.' },
      { pt: 'Quanto é que custaria a reparação, mais ou menos?', en: 'Roughly how much would the repair cost?' },
      { pt: 'Para quando é que ficava pronta?', en: 'When would it be ready?' },
    ] },
  { id: 'm_ciclovia', title: 'Pergunta o caminho para a ciclovia', en: 'Ask the way to the bike path', where: 'bike', lvl: 'A2',
    task: 'With your bike, ask a passer-by or a shop owner the best way to get to the riverside bike path or Monsanto, and repeat the directions back to check.',
    phrases: [
      { pt: 'Desculpe, qual é o melhor caminho para a ciclovia do rio?', en: 'Excuse me, what\'s the best way to the river bike path?' },
      { pt: 'Então sigo em frente e viro à esquerda no semáforo?', en: 'So I go straight on and turn left at the lights?' },
      { pt: 'Há muitas subidas por ali?', en: 'Are there many hills that way?' },
    ] },
  { id: 'm_volta', title: 'Junta-te a uma volta de grupo', en: 'Join a group ride', where: 'bike', lvl: 'B1',
    task: 'On a group ride or at a meeting point, chat with one rider in Portuguese: where they usually ride, how long they\'ve been cycling, a route they\'d recommend.',
    phrases: [
      { pt: 'Há quanto tempo é que andas de bicicleta?', en: 'How long have you been cycling?' },
      { pt: 'Que volta é que me aconselhas aqui perto de Lisboa?', en: 'Which ride would you recommend near Lisbon?' },
      { pt: 'Ultimamente tenho andado mais na estrada do que no monte.', en: 'Lately I\'ve been riding more on the road than off-road.' },
    ] },
  { id: 'm_gira', title: 'Explica a uma pessoa como funciona a Gira', en: 'Explain to someone how Gira works', where: 'bike', lvl: 'B1',
    task: 'At a Gira bike station, offer to help someone who looks lost, or just practise: say out loud, in Portuguese, how to unlock a bike and how much it costs.',
    phrases: [
      { pt: 'Precisa de ajuda? Primeiro tem de instalar a aplicação.', en: 'Do you need help? First you have to install the app.' },
      { pt: 'Depois escolhe a bicicleta e desbloqueia com o telemóvel.', en: 'Then you choose a bike and unlock it with your phone.' },
      { pt: 'As elétricas são mais caras, mas valem a pena nas subidas.', en: 'The electric ones cost more, but they\'re worth it on the hills.' },
    ] },

  // ---------- health ----------
  { id: 'm_farmacia', title: 'Pede um conselho na farmácia', en: 'Ask the pharmacist for advice', where: 'health', lvl: 'A2',
    task: 'At a farmácia, describe a small problem (sore throat, allergy, a cold) and ask what they\'d recommend and how often to take it.',
    phrases: [
      { pt: 'Dói-me a garganta desde ontem. O que me aconselha?', en: 'My throat has been sore since yesterday. What would you recommend?' },
      { pt: 'Quantas vezes por dia devo tomar?', en: 'How many times a day should I take it?' },
      { pt: 'Precisa de receita médica?', en: 'Does it need a prescription?' },
    ] },
  { id: 'm_consulta', title: 'Marca uma consulta por telefone', en: 'Book an appointment by phone', where: 'health', lvl: 'B1',
    task: 'Call the centro de saúde, a dentist or a clinic and book or ask about an appointment. Before you call, say your first two sentences out loud twice.',
    phrases: [
      { pt: 'Bom dia, queria marcar uma consulta, se possível esta semana.', en: 'Good morning, I\'d like to book an appointment, this week if possible.' },
      { pt: 'Tem alguma vaga ao fim da tarde?', en: 'Do you have any slot in the late afternoon?' },
      { pt: 'Pode repetir mais devagar, por favor?', en: 'Could you repeat that more slowly, please?' },
    ] },
  { id: 'm_ginasio', title: 'Pergunta pelos horários do ginásio ou da piscina', en: 'Ask about gym or pool times', where: 'health', lvl: 'A2',
    task: 'At a gym, swimming pool or sports club, ask about opening times, prices, and whether you can try a class first.',
    phrases: [
      { pt: 'A que horas abre de manhã?', en: 'What time do you open in the morning?' },
      { pt: 'Posso experimentar uma aula antes de me inscrever?', en: 'Can I try a class before signing up?' },
      { pt: 'Quanto custa a mensalidade?', en: 'How much is the monthly fee?' },
    ] },

  // ---------- errands ----------
  { id: 'm_ctt', title: 'Envia uma encomenda nos CTT', en: 'Send a parcel at the post office', where: 'errands', lvl: 'A2',
    task: 'At a CTT counter, send a parcel or letter (to Canada, maybe), ask how long it takes and whether there\'s a cheaper option.',
    phrases: [
      { pt: 'Queria enviar esta encomenda para o Canadá.', en: 'I\'d like to send this parcel to Canada.' },
      { pt: 'Quanto tempo demora a chegar?', en: 'How long does it take to arrive?' },
      { pt: 'Há alguma opção mais barata?', en: 'Is there a cheaper option?' },
    ] },
  { id: 'm_lojacidadao', title: 'Tira uma dúvida na Loja do Cidadão', en: 'Ask a question at the Loja do Cidadão', where: 'errands', lvl: 'B1',
    task: 'At the Loja do Cidadão or Finanças, take a ticket and ask one real question you have (about a document, a form, a deadline), in Portuguese.',
    phrases: [
      { pt: 'Qual é a senha que devo tirar para isto?', en: 'Which ticket should I take for this?' },
      { pt: 'Que documentos é que preciso de trazer?', en: 'Which documents do I need to bring?' },
      { pt: 'Até quando é que tenho de entregar isto?', en: 'By when do I have to hand this in?' },
    ] },
  { id: 'm_banco', title: 'Pergunta uma coisa no banco', en: 'Ask a question at the bank', where: 'errands', lvl: 'B1',
    task: 'At your bank branch, ask a general question (card fees, opening hours, how to change your address) without giving any numbers or passwords.',
    phrases: [
      { pt: 'Queria saber quanto é que custa a anuidade do cartão.', en: 'I\'d like to know how much the annual card fee is.' },
      { pt: 'Isso pode ser tratado pela aplicação ou tenho de vir cá?', en: 'Can that be done in the app, or do I have to come in?' },
      { pt: 'Muito obrigado pela ajuda.', en: 'Thanks very much for your help.' },
    ] },
  { id: 'm_lavandaria', title: 'Leva roupa à lavandaria ou à costureira', en: 'Take clothes to the dry cleaner or tailor', where: 'errands', lvl: 'B1',
    task: 'At a lavandaria or a costureira, explain what you need (a stain, hemming trousers, a broken zip) and ask when it\'ll be ready.',
    phrases: [
      { pt: 'Este casaco tem uma nódoa aqui. Acha que sai?', en: 'This jacket has a stain here. Do you think it\'ll come out?' },
      { pt: 'Queria subir a bainha destas calças.', en: 'I\'d like to take up the hem on these trousers.' },
      { pt: 'Para quando é que fica pronto?', en: 'When will it be ready?' },
    ] },

  // ---------- neighbours ----------
  { id: 'm_elevador', title: 'Faz conversa no elevador', en: 'Make small talk in the lift', where: 'neighbours', lvl: 'A2',
    task: 'Next time you share a lift or the stairs with a neighbour, say more than "bom dia": one comment about the weather, the building or the weekend.',
    phrases: [
      { pt: 'Bom dia! Hoje está mais fresquinho, não está?', en: 'Good morning! It\'s a bit cooler today, isn\'t it?' },
      { pt: 'Então, bom fim de semana!', en: 'Well, have a good weekend!' },
      { pt: 'Já arranjaram o elevador, finalmente.', en: 'They\'ve finally fixed the lift.' },
    ] },
  { id: 'm_vizinho', title: 'Pergunta a um vizinho há quanto tempo vive no bairro', en: 'Ask a neighbour how long they\'ve lived in the area', where: 'neighbours', lvl: 'B1',
    task: 'Ask a neighbour or a local shop owner how long they\'ve lived or worked in the neighbourhood and how it used to be. Listen for "era" and "havia".',
    phrases: [
      { pt: 'Há quanto tempo é que vive cá no bairro?', en: 'How long have you lived here in the neighbourhood?' },
      { pt: 'Isto antigamente era muito diferente?', en: 'Was it very different here in the old days?' },
      { pt: 'Antes havia mais lojas pequenas, não havia?', en: 'There used to be more small shops, didn\'t there?' },
    ] },
  { id: 'm_senhora', title: 'Conta uma coisa da tua semana à senhora do café', en: 'Tell the café owner something about your week', where: 'neighbours', lvl: 'B1',
    task: 'At the café you go to often, tell the owner or regular staff one thing you did this week (a ride, a trip, a concert) in two or three sentences.',
    phrases: [
      { pt: 'No sábado fui de bicicleta até Cascais.', en: 'On Saturday I cycled to Cascais.' },
      { pt: 'Esta semana tenho trabalhado imenso.', en: 'This week I\'ve been working loads.' },
      { pt: 'Estava um tempo ótimo, nem parecia outubro.', en: 'The weather was great; it didn\'t feel like October.' },
    ] },

  // ---------- phone ----------
  { id: 'm_mesa', title: 'Reserva uma mesa por telefone', en: 'Book a table by phone', where: 'phone', lvl: 'B1',
    task: 'Call a restaurant and book a table: the day, the time, how many people, and ask if there\'s a table outside. Say your first line aloud twice before calling.',
    phrases: [
      { pt: 'Boa tarde, queria reservar uma mesa para quatro pessoas, para sexta às oito.', en: 'Good afternoon, I\'d like to book a table for four, Friday at eight.' },
      { pt: 'Seria possível ficarmos na esplanada?', en: 'Would it be possible to sit outside?' },
      { pt: 'Fica em nome do Ryan.', en: 'It\'s under the name Ryan.' },
    ] },
  { id: 'm_horario', title: 'Liga para uma loja a perguntar o horário', en: 'Call a shop to ask its opening hours', where: 'phone', lvl: 'A2',
    task: 'Call a shop, a bike shop or a pharmacy and ask whether they\'re open on Saturday afternoon and whether they have something in stock.',
    phrases: [
      { pt: 'Bom dia, estão abertos no sábado à tarde?', en: 'Good morning, are you open on Saturday afternoon?' },
      { pt: 'Têm câmaras de ar de 700 por 28?', en: 'Do you have 700 by 28 inner tubes?' },
      { pt: 'Está bem, obrigado. Até logo.', en: 'Okay, thanks. Bye.' },
    ] },
  { id: 'm_mensagem', title: 'Deixa uma mensagem de voz em português', en: 'Leave a voice message in Portuguese', where: 'phone', lvl: 'B1',
    task: 'Send a Portuguese-speaking friend a voice message (30–60 s) instead of a text: what you did yesterday and a plan for the weekend.',
    phrases: [
      { pt: 'Olá! Então, ontem fui ao concerto e foi espetacular.', en: 'Hi! So, yesterday I went to the concert and it was amazing.' },
      { pt: 'Queres ir dar uma volta no domingo?', en: 'Do you want to go for a ride on Sunday?' },
      { pt: 'Depois diz-me qualquer coisa. Beijinhos!', en: 'Let me know. Love!' },
    ] },

  // ---------- media ----------
  { id: 'm_rtp', title: 'Vê o telejornal e conta uma notícia', en: 'Watch the news and retell one story', where: 'media', lvl: 'B1',
    task: 'Watch 10 minutes of the RTP news (RTP Play is free). Then retell one story aloud in Portuguese in four or five sentences, using did and was doing.',
    phrases: [
      { pt: 'Hoje vi no telejornal que…', en: 'Today I saw on the news that…' },
      { pt: 'Segundo a notícia, o incêndio começou de madrugada.', en: 'According to the report, the fire started in the early hours.' },
      { pt: 'Não percebi tudo, mas percebi a ideia geral.', en: 'I didn\'t understand everything, but I got the gist.' },
    ] },
  { id: 'm_podcast', title: 'Ouve um podcast português numa volta', en: 'Listen to a Portuguese podcast on a ride or walk', where: 'media', lvl: 'B1',
    task: 'Listen to 15 minutes of a podcast from Portugal (RTP/Antena 1 has many). Afterwards, say aloud three things you understood and one word you\'d like to look up.',
    phrases: [
      { pt: 'Estive a ouvir um podcast sobre…', en: 'I was listening to a podcast about…' },
      { pt: 'Falaram de uma coisa que eu não sabia.', en: 'They talked about something I didn\'t know.' },
      { pt: 'Houve uma palavra que ouvi muitas vezes.', en: 'There was a word I heard lots of times.' },
    ] },
  { id: 'm_telemovel', title: 'Põe o telemóvel em português de Portugal', en: 'Set your phone to Portuguese (Portugal)', where: 'media', lvl: 'A2',
    task: 'Switch your phone language to Português (Portugal) for the week. Each time you meet a new word in the menus, say it aloud with what it does.',
    phrases: [
      { pt: 'Definições, ecrã, bateria: já sei onde está tudo.', en: 'Settings, screen, battery: I already know where everything is.' },
      { pt: 'Transferir quer dizer fazer o download.', en: 'Transferir means to download.' },
      { pt: 'Mudei o telemóvel para português esta semana.', en: 'I switched my phone to Portuguese this week.' },
    ] },

  // ---------- music ----------
  { id: 'm_verso', title: 'Aprende um verso de uma canção portuguesa', en: 'Learn one line of a Portuguese song', where: 'music', lvl: 'A2',
    task: 'Pick a song by Rui Veloso, António Zambujo or Deolinda. Learn one line by heart (sing or say it along with the track five times), then say what it means.',
    phrases: [
      { pt: 'Esta semana aprendi um verso de uma canção do Zambujo.', en: 'This week I learned a line from a Zambujo song.' },
      { pt: 'Ouvi a canção várias vezes até conseguir cantar com ele.', en: 'I listened to the song several times until I could sing along.' },
      { pt: 'Quer dizer mais ou menos que…', en: 'It means more or less that…' },
    ] },
  { id: 'm_cordas', title: 'Compra cordas numa loja de música', en: 'Buy strings in a music shop', where: 'music', lvl: 'A2',
    task: 'In a music shop, ask for a set of guitar strings by gauge, ask what they\'d recommend, and ask whether they also have picks or a capo.',
    phrases: [
      { pt: 'Queria um jogo de cordas 10–46 para guitarra elétrica.', en: 'I\'d like a set of 10–46 strings for electric guitar.' },
      { pt: 'Que marca é que me aconselha?', en: 'Which brand would you recommend?' },
      { pt: 'Também têm palhetas mais grossas?', en: 'Do you also have thicker picks?' },
    ] },
  { id: 'm_concerto', title: 'Fala com alguém num concerto', en: 'Talk to someone at a gig', where: 'music', lvl: 'B1',
    task: 'At a concert or a bar with live music, say one thing to someone near you about the band: whether they know them, which song is their favourite.',
    phrases: [
      { pt: 'Já conhecias esta banda?', en: 'Did you already know this band?' },
      { pt: 'Qual é a tua música preferida deles?', en: 'Which is your favourite song of theirs?' },
      { pt: 'O guitarrista está a tocar mesmo bem.', en: 'The guitarist is playing really well.' },
    ] },

  // ---------- games ----------
  { id: 'm_jogopt', title: 'Joga uma sessão em português', en: 'Play a session in Portuguese', where: 'games', lvl: 'B1',
    task: 'Set a game to Portuguese (Portugal) audio or subtitles for one session. Afterwards, say aloud in Portuguese what happened in it, using did and was doing.',
    phrases: [
      { pt: 'Estava a explorar a cidade quando apareceu o boss.', en: 'I was exploring the city when the boss appeared.' },
      { pt: 'Morri três vezes, mas à quarta consegui.', en: 'I died three times, but on the fourth try I did it.' },
      { pt: 'As legendas em português ajudaram-me imenso.', en: 'The Portuguese subtitles helped me loads.' },
    ] },
  { id: 'm_coop', title: 'Fala só em português numa sessão de co-op', en: 'Speak only Portuguese in a co-op session', where: 'games', lvl: 'B1',
    task: 'In a co-op session with a Portuguese-speaking friend, agree to use only Portuguese for 20 minutes: callouts, plans, jokes. Ask how to say the words you\'re missing.',
    phrases: [
      { pt: 'Cobre-me, vou buscar munições!', en: 'Cover me, I\'m going to get ammo!' },
      { pt: 'Como é que se diz "respawn" em português?', en: 'How do you say "respawn" in Portuguese?' },
      { pt: 'Espera por mim, estou quase a chegar.', en: 'Wait for me, I\'m nearly there.' },
    ] },

  // ---------- friends ----------
  { id: 'm_fimsemana', title: 'Conta o teu fim de semana só em português', en: 'Tell a friend about your weekend only in Portuguese', where: 'friends', lvl: 'B1',
    task: 'With a Portuguese-speaking friend, talk about your weekend for five minutes without switching to English. If you get stuck, ask "como se diz…?".',
    phrases: [
      { pt: 'No sábado de manhã fui dar uma volta de bicicleta.', en: 'On Saturday morning I went for a bike ride.' },
      { pt: 'À noite ficámos em casa e vimos um filme.', en: 'In the evening we stayed in and watched a film.' },
      { pt: 'Como se diz "hangover" em português?', en: 'How do you say "hangover" in Portuguese?' },
    ] },
  { id: 'm_plano', title: 'Propõe um plano a um amigo', en: 'Suggest a plan to a friend', where: 'friends', lvl: 'B1',
    task: 'Message or tell a friend a concrete plan in Portuguese (a ride, a dinner, a game night) and agree on the day and time without switching languages.',
    phrases: [
      { pt: 'E se fôssemos jantar fora no sábado?', en: 'What if we went out for dinner on Saturday?' },
      { pt: 'Que tal às oito, no sítio do costume?', en: 'How about eight, at the usual place?' },
      { pt: 'Combinado! Depois mando-te a morada.', en: 'Deal! I\'ll send you the address later.' },
    ] },

  // ---------- class ----------
  { id: 'm_professora', title: 'Faz à professora uma pergunta sobre algo que ouviste', en: 'Ask the teacher about something you heard', where: 'class', lvl: 'B1',
    task: 'Note one expression you heard this week in the street, on TV or in a song. In class, ask the teacher in Portuguese what it means and when people use it.',
    phrases: [
      { pt: 'Ouvi uma expressão esta semana e não percebi bem.', en: 'I heard an expression this week and didn\'t quite get it.' },
      { pt: 'O que é que quer dizer "estar com os azeites"?', en: 'What does "estar com os azeites" mean?' },
      { pt: 'Em que situações é que se usa isso?', en: 'In what situations do people use that?' },
    ] },
];
if (typeof module !== 'undefined') module.exports = { MISSIONS };
