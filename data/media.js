/* Ler e ouvir: parallel reading (Portugal edition + English edition, switch between them) and Portuguese music.
   Editions are not guaranteed: each book links to bookshop searches, and the rule is to check the publisher is
   Portuguese and the language is "Português (Portugal)" before buying. */
var BOOKS = [
  { id: 'principezinho', pt: 'O Principezinho', en: 'The Little Prince', by: 'Antoine de Saint-Exupéry', pub: 'Editorial Presença', lvl: 'A2–B1',
    why: 'Short, repetitive and gentle. The best first parallel read.' },
  { id: 'banana', pt: 'O Diário de um Banana', en: 'Diary of a Wimpy Kid', by: 'Jeff Kinney', pub: 'Booksmile', lvl: 'A2–B1',
    why: 'Spoken register, short entries, lots of past tenses about everyday life.' },
  { id: 'potter', pt: 'Harry Potter e a Pedra Filosofal', en: 'Harry Potter and the Philosopher\'s Stone', by: 'J.K. Rowling', pub: 'Editorial Presença', lvl: 'B1',
    why: 'You know the story, so you can read for the language. Make sure it\'s the Presença (Portugal) translation, not the Brazilian one.' },
  { id: 'menina', pt: 'A Menina do Mar', en: 'The Little Girl from the Sea', by: 'Sophia de Mello Breyner Andresen', pub: 'Porto Editora', lvl: 'B1',
    why: 'A short Portuguese classic. English editions are harder to find; it\'s fine to read it on its own.' },
  { id: 'cavaleiro', pt: 'O Cavaleiro da Dinamarca', en: 'The Knight of Denmark', by: 'Sophia de Mello Breyner Andresen', pub: 'Porto Editora', lvl: 'B1',
    why: 'Another short classic every Portuguese kid reads at school. Good for conversation with Portuguese friends.' },
  { id: 'christie', pt: 'Agatha Christie (edições ASA)', en: 'Agatha Christie (English originals)', by: 'Agatha Christie', pub: 'ASA', lvl: 'B1',
    why: 'Predictable plots, lots of dialogue, past tenses everywhere. Pick any title you can get in both languages.' },
  { id: 'retorno', pt: 'O Retorno', en: 'The Return', by: 'Dulce Maria Cardoso', pub: 'Portuguese original; English: MacLehose Press', lvl: 'B1+',
    why: 'A real Portuguese novel with a young narrator and plain prose: the best first step into Portuguese literature.' },
  { id: 'galveias', pt: 'Galveias', en: 'Galveias', by: 'José Luís Peixoto', pub: 'Portuguese original', lvl: 'B2',
    why: 'For later: rich, rural Portuguese. Keep it for when the others feel easy.' },
];
var ARTISTS = [
  { name: 'António Zambujo', style: 'fado meets bossa, very clear diction', play: true },
  { name: 'Rui Veloso', style: 'Portuguese rock/blues guitar classics', play: true },
  { name: 'Deolinda', style: 'witty modern folk, clear storytelling lyrics' },
  { name: 'Salvador Sobral', style: 'soft jazz-pop, slow and clear' },
  { name: 'Luísa Sobral', style: 'gentle pop, simple everyday lyrics' },
  { name: 'Carolina Deslandes', style: 'pop ballads, easy to sing along' },
  { name: 'Bárbara Tinoco', style: 'young pop, everyday Lisbon Portuguese' },
  { name: 'Diogo Piçarra', style: 'pop, clear and current' },
  { name: 'Os Azeitonas', style: 'catchy pop-rock from Porto' },
  { name: 'Capitão Fausto', style: 'indie rock from Lisbon' },
  { name: 'Xutos & Pontapés', style: 'classic Portuguese rock' },
  { name: 'Sérgio Godinho', style: 'singer-songwriter, wordplay and stories' },
  { name: 'Madredeus', style: 'slow, atmospheric, very clear vowels' },
  { name: 'Ornatos Violeta', style: 'cult 90s alternative rock' },
  { name: 'Linda Martini', style: 'post-rock and punk from Lisbon' },
  { name: 'Ana Moura', style: 'fado and fado-pop (older vocabulary)' },
  { name: 'Mariza', style: 'fado: slower, more poetic language' },
];
if (typeof module !== 'undefined') module.exports = { BOOKS, ARTISTS };
