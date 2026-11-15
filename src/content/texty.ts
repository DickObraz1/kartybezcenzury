// ============================================================================
//  VŠECHNY TEXTY, CENY A NASTAVENÍ HLAVNÍ STRÁNKY NA JEDNOM MÍSTĚ
//  Tomáši: měň jen to, co je mezi uvozovkami.
// ============================================================================

// ---- BLACK FRIDAY -----------------------------------------------------------
// Dokud je zapnuto: true a zároveň je čas mezi start a konec, stránka ukazuje slevu a kód.
// Po datu "konec" se sama vrátí do běžné podoby (běžné ceny, žádný kód, zpátky balíček KOMPLET).
// Chceš akci vypnout dřív? Přepiš zapnuto na false.
export const AKCE = {
  zapnuto: true,
  kod: 'BLACK25',
  sleva: 0.25,
  // Časy jsou v českém zimním čase (+01:00).
  start: '2026-11-15T00:00:00+01:00',
  konec: '2026-11-29T23:59:59+01:00',
} as const;

export const ESHOP = 'https://www.dickobraz.cz';

// ---- PRODUKTY ---------------------------------------------------------------
// cena = běžná cena v Kč. Cena s kódem se dopočítá (cena × 0,75, zaokrouhleno na koruny).
export type Produkt = {
  id: string;
  upgatesId: number;
  nazev: string;
  kratce: string;
  popis: string;
  cena: number;
  cenaSKodem?: number;
  url: string;
  obrazek: string;
};

export const PRODUKTY: Record<string, Produkt> = {
  kbc: {
    id: 'kbc', upgatesId: 84, nazev: 'Karty bez cenzury', kratce: 'KARTY BEZ CENZURY',
    popis: 'Sprostá, zlomyslná a zábavná párty hra. Komplet v češtině.',
    cena: 699, url: '/p/karty-proti-lidskosti', obrazek: '/img/zaklad.webp',
  },
  mn: {
    id: 'mn', upgatesId: 92, nazev: 'Karty bez cenzury: Mezi nohama', kratce: 'MEZI NOHAMA',
    popis: 'Rozšíření, které tě zavede hluboko. Až mezi nohy. 100 nových karet plných gynekologie, sexuality a tělesných trapasů.',
    cena: 249, url: '/p/karty-bez-cenzury-1-rozsireni', obrazek: '/img/rozsireni.webp',
  },
  // Balíček. Na Black Friday se na něj sleva nevztahuje, proto se během akce na stránce neukazuje.
  komplet: {
    id: 'komplet', upgatesId: 0, nazev: 'KOMPLET BEZ CENZURY', kratce: 'KOMPLET',
    popis: 'Základní hra a rozšíření Mezi nohama v jednom balíku.',
    cena: 829, url: '/p/komplet-bez-cenzury-zaklad-mezi-nohama', obrazek: '/img/balicek.webp',
  },
};
export const KOMPLET_BEZNE = 948; // kolik stojí základ a rozšíření zvlášť

export const cenaSKodem = (p: Produkt) => p.cenaSKodem ?? Math.round(p.cena * (1 - AKCE.sleva));
export const uspora = (p: Produkt) => p.cena - cenaSKodem(p);
export const kc = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const dopln = (s: string, h: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(h[k] ?? ''));
export const odkazProdukt = (p: Produkt) => `${ESHOP}${p.url}?addtocart=1&quantity=1&return=cart`;

// ---- KARTY DO HRY NA STRÁNCE -------------------------------------------------
// Skutečné karty ze hry. V mini hře se losují náhodně. Mezera v otázce = tři a víc podtržítek.
export const HRA = {
  otazky: [
    'Jsem tak opilý/á, že mám ________.',
    'Co pokaždé oživí párty?',
    'Co opravdu vyhubilo dinosaury?',
    'Při sexu rád/a myslím na ________.',
    'Píše se rok 2125. Prezidentem je ________.',
    'Pět, čtyři, tři, dva, jedna… ________!',
    'Co ukončilo můj poslední vztah?',
    'Jsi na prvním rande. Co je okamžitě podezřelé?',
    'Vůbec si na včerejší noc nevzpomínám. Poslední, co si pamatuji, je ________.',
    'Tajná ingredience, která dělá české pivo nejlepším na světě, je ________.',
    'Řekni to nahlas. Já jsem ________ a jsem na to pyšný/á.',
    'Nesnáším tuhle práci. Nesnáším tohle místo. Nejvíce ze všeho nesnáším ________. Končím.',
    'Co je sexy, voní to, ale brzo umře?',
    'Muži mají rádi ________.',
  ],
  odpovedi: [
    'TikTok.',
    'Sebenenávist.',
    'WiFi heslo.',
    'Naděje.',
    'Pražské kavárny.',
    'Nevyžádaný dickpic.',
    'Masové kuličky Ikea.',
    'Probudit se nahý/á na záchodcích v McDonald\'s.',
    'Ranní erekce.',
    'Padesát odstínů svíčkové.',
    'Pasivně agresivní šéfová.',
    'Moje růžová prdelka.',
    'Šíleně smutná princezna.',
    'Běžet nahatý/á přes obchoďák.',
    'Všechny zklamat.',
    'Prezentace z mobilu.',
    'Předstírat zájem.',
    'Hromada toaleťáku po covidu.',
    'Být zaneprázdněný dospělý.',
    'Bohatí lidé.',
    'Země plná čokolády.',
    'Všechny moje kamarádky.',
  ],
  // Co stránka řekne po zahrání karty.
  reakce: [
    'Tohle by u stolu vyhrálo.',
    'Babička by odešla od stolu.',
    'Za tohle bod. A pohled od souseda.',
    'Někdo se právě zakuckal pivem.',
    'Tohle se nedá vzít zpátky.',
    'Ticho. Pak řev.',
  ],
};

// Karty z rozšíření, které jsou na stránce pod cenzurou, dokud na ně člověk neťukne.
export const CENZUROVANE = [
  'Jsem hluboká jak Macocha.',
  'To není malý penis, ale velký klitoris.',
  'Pysky větší než nedělní řízek.',
  'Lízat zmrzlinu přes sklo.',
];

// ---- TEXTY ------------------------------------------------------------------
export const TEXTY = {
  meta: {
    titulek: 'Karty bez cenzury – Karty proti lidskosti v češtině',
    popis: 'Karty proti lidskosti konečně v češtině. Karty bez cenzury jsou sprostá párty hra se 400 kartami černého humoru. Původní česká hra pro 3–10 hráčů.',
  },
  hero: {
    znacka: 'KARTY BEZ CENZURY',
    vek: '16+',
    nadpis1: 'Hra, kterou si',
    nadpis2: 'nezahraješ',
    nadpis3: 's babičkou.',
    nazev: 'Základní hra · 400 karet',
    paskyBf: ['BLACK FRIDAY · −25 % · BLACK FRIDAY', '−25 % · POZOR SLEVA · −25 % · POZOR'],
    pasky: ['BEZ CENZURY · 16+ · BEZ CENZURY · 16+', 'POZOR · SPROSTÉ · POZOR · SPROSTÉ'],
    hodnoceni: '5/5 · 16 recenzí · 3–10 hráčů',
    naklon: 'Ťukni a nakláněj telefon',
  },
  odpocet: {
    konciZa: 'končí za',
    velkyKonci: 'Black Friday končí za',
    dni: 'dní', hod: 'hod', min: 'min', sek: 'sek',
  },
  kod: {
    napoveda: 'ťukni a zkopíruj',
    zkopirovano: 'Zkopírováno. Vlož v košíku.',
  },
  velkyKod: {
    nad: 'Black Friday: slevový kód na −25 %',
    tlacitko: 'Zkopírovat kód',
    hotovo: 'Zkopírováno ✓',
    pod: 'V košíku ho vlož do pole „Slevový kupón“.',
  },
  cena: {
    usetris: 'ušetříš {castka} Kč',
    koupitBf: 'Koupit za {cena} Kč',
    koupit: 'Do košíku za {cena} Kč',
  },
  hra: {
    nadpis1: 'Zahraj si',
    nadpis2: 'kolo.',
    navod: 'Žlutá karta se ptá. Ty vyber bílou, která je nejvíc mimo.',
    kolo: 'Kolo',
    dalsi: 'Další kolo →',
    zamichat: 'Jiné karty',
    odehrano: 'Odehráno kol',
    popNadpis: 'Tohle bylo pár karet. <b>V krabici jich je 400.</b>',
    popText: '80 žlutých otázek a 320 bílých odpovědí. Česky, bez Google překladače.',
  },
  jak: {
    nadpis1: 'Jak se',
    nadpis2: 'to hraje?',
    kroky: [
      { nadpis: 'Otočí se žlutá karta', text: 'Jeden hráč přečte otázku nebo větu s mezerou.' },
      { nadpis: 'Každý zahraje odpověď', text: 'Ostatní hodí svou nejlepší (nejhorší) bílou kartu.' },
      { nadpis: 'Vítěz bere', text: 'Čtenář vybere nejlepší kombinaci. Vítěz sbírá body.' },
    ],
    video: 'Pustit video ze hry',
    videoUrl: 'https://www.youtube.com/embed/FEWvG7v-g7k?autoplay=1',
    pravidla: 'Pravidla v PDF',
    pravidlaUrl: 'https://dickobraz-cz.s51.cdn-upgates.com/3/366464f27ab1c9-pravidla-2.pdf',
    vlastnosti: [
      'Přizpůsobeno Česku, žádný Google Translate',
      'Hratelné i bez znalosti angličtiny',
      '400 karet, žádná odfláklá mini sada',
      'Poctivé karty, žádný papírák z tiskárny',
    ],
  },
  hraci: {
    nadpis1: 'Kolik',
    nadpis2: 'vás bude?',
    navod: 'Posuň jezdcem.',
    jednotka: 'hráčů',
    // Hláška pro každý počet hráčů (3 až 10).
    hlasky: {
      3: 'Tři stačí. Ale bude to osobní.',
      4: 'Čtyři. Nikdo se neschová.',
      5: 'Pět. Zlatý střed.',
      6: 'Šest. Tady to začíná být hlučný.',
      7: 'Sedm. Sousedi už vědí, co hrajete.',
      8: 'Osm. Karty budou mizet rychle.',
      9: 'Devět. Tohle už je párty.',
      10: 'Deset. Plný stůl, plný chaos.',
    } as Record<number, string>,
    // Od kolika hráčů stránka doporučí přibrat rozšíření.
    rozsireniOd: 7,
    radaZaklad: 'Stačí základní hra. 400 karet vám vydrží.',
    radaObe: 'Vezmi základ i rozšíření Mezi nohama. 500 karet, ať je z čeho brát.',
  },
  rozsireni: {
    stitek: 'Rozšíření',
    nadpis1: 'Mezi',
    nadpis2: 'nohama',
    citat: 'Věci, o kterých se šeptá v čekárně? Teď se o nich křičí u stolu.',
    cenzura: 'Cenzura',
    odhal: 'Ťukni a odcenzuruj',
    spoluprace: 'Vytvořeno s gynekoložkou Kamilou Žižkovou (@moje_gynpor, podcast Pindy z Gindy).',
    body: [
      '20 nových žlutých otázek',
      '80 nových bílých odpovědí',
      'Pasuje k základní hře',
    ],
    vyzaduje: 'Není to samostatná hra. Potřebuješ základní Karty bez cenzury.',
    dohromady: 'Základ i rozšíření s kódem {soucet} Kč. Běžně {bezne} Kč.',
  },
  proKoho: {
    nadpis1: 'Pro koho',
    nadpis2: 'to',
    je: 'je',
    neni: 'není',
    seznamJe: [
      'Partu přátel, co se nebojí trapasu',
      'Večírky, kde chceš, aby se lidi bavili',
      'Lidi s černým smyslem pro humor',
      'Každého, kdo přežil školní výlet s Kartami proti lidskosti',
      'Týmbuildingy, kde se šéf dokáže zasmát sám sobě',
    ],
    seznamNeni: [
      'Pod 16 let (vážně, ne)',
      'Lidi, co se urazí za špatně položenou otázku',
      'Vánoce u babičky (pokud ji nemáš rád)',
      'Citlivé duše a HR oddělení',
      'Každého, kdo si myslí, že přes humor nejde cokoliv',
    ],
  },
  komplet: {
    stitek: 'Ušetříš {castka} Kč',
    nadpis1: 'Základ +',
    nadpis2: 'Mezi nohama',
    nadpis3: 'za míň',
    citat: 'Půlka srandy je amatérská chyba. Ber celej balík.',
    text: 'Základní hra a rozšíření v jednom. 500 karet na celej večer.',
    misto: 'místo {bezne} Kč',
    tlacitko: 'Koupit balíček za {cena} Kč',
  },
  duvera: {
    nadpis1: 'Co říkají',
    nadpis2: 'ostatní',
    cisla: [
      { cislo: '3 000+', popis: 'prodaných her' },
      { cislo: '★★★★★', popis: '16 recenzí' },
      { cislo: '16+', popis: 'pro dospělé' },
    ],
    recenze: [
      { autor: 'Karolína', text: 'Doporučuji hrát ve skupince přátel, kde se chcete zbavit lidí, co nemají váš humor.' },
      { autor: 'Jan Klimeš', text: 'Konečně dobrá a vtipná karetní hra na párty, která se neomrzí. Doporučuji :)' },
      { autor: 'Kristýna Novotná', text: 'Vtipné, originální karty plné nekorektnosti. Prostě jak název vypovídá, bez cenzury!' },
    ],
    heureka: '91 % zákazníků doporučuje na Heurece · 27 hodnocení',
    heurekaUrl: 'https://karetni-hry.heureka.cz/karty-bez-cenzury-karty-proti-lidskosti/',
  },
  email: {
    nadpis1: 'Posíláme jen',
    nadpis2: 'vtipný blbosti',
    text: 'Nech nám e-mail. Posíláme slevy, novinky a občas něco, co tvoje HR oddělení neschválí.',
    pole: 'tvůj@email.cz',
    tlacitko: 'Chci slevičku',
    odesilam: 'Odesílám…',
    souhlas: 'Souhlasím se zpracováním e-mailu pro zasílání novinek a slev.',
    zasady: 'Zásady ochrany osobních údajů.',
    hotovoNadpis: 'Hotovo.',
    hotovoText: 'Vítej mezi úchyly. Sleva ti přijde na e-mail.',
    pod: 'Kdykoliv se odhlásíš. Žádný spam, jen srandy.',
  },
  faq: {
    nadpis1: 'Máš',
    nadpis2: 'otázku?',
    otazky: [
      { q: 'Kolik hráčů hra potřebuje?', a: 'Nejlépe 4–10 hráčů. Pod 4 je to smutné, nad 10 je to chaos. (Chaos je taky fajn.)' },
      { q: 'Pro koho je hra vhodná?', a: 'Pro dospělé 16+. Opravdu. Obsah je dospělý. Pokud hrajete s tetou Marií, ujistěte se, že je to ta zábavnější teta.' },
      { q: 'Jak rychle hra dorazí?', a: 'Standardní doručení 2–4 pracovní dny. Vše přes dopravu dickobraz.cz.' },
      { q: 'Je rozšíření nutné koupit se základní hrou?', a: 'Rozšíření se prodává samostatně, ale bez základní hry se hrát nedá. Je to přídavek, ne nová hra.' },
      { q: 'Co je v balení?', a: 'Základní hra: 80 žlutých karet (otázky), 320 bílých karet (odpovědi) a pravidla. Vše česky.' },
      { q: 'Jdou karty vrátit, pokud se mi nebudou líbit?', a: 'Platí standardní zákonná lhůta 14 dní pro vrácení zboží. Podmínky najdeš na dickobraz.cz.' },
    ],
    cahOtazka: 'Je to česká verze Cards Against Humanity?',
    cahOdpoved: 'Nejde o oficiální verzi. <a href="/karty-proti-lidskosti">Cards Against Humanity v češtině oficiálně neexistuje</a>. Karty bez cenzury jsou původní česká hra se stejným herním principem a stoprocentně českým obsahem. Pivo, politika a trapasy, které fakt chápeš.',
  },
  zaver: {
    nadpis1: 'Tak co,',
    nadpis2: 'hrajem?',
    nadpisBf1: '−25 % na Karty.',
    nadpisBf2: 'Do neděle 29. 11.',
  },
  pravni: 'Sleva 25 % s kódem {kod} platí do 29. 11. 2026 na základní hru i rozšíření. Na balíček KOMPLET se nevztahuje.',
  lista: {
    koupit: 'Koupit',
  },
  cookies: {
    text: 'Sušenky? Jen na měření, ať víme, co tě tu baví. Bez nich to pojede taky.',
    ano: 'Beru',
    ne: 'Nechci',
  },
  paticka: {
    motto: 'Věci, které by tvoje babička asi neschválila.',
    eshop: 'dickobraz.cz',
    podminky: 'Obchodní podmínky',
    podminkyUrl: 'https://www.dickobraz.cz/info/obchodni-podminky',
    soukromi: 'Ochrana osobních údajů',
    soukromiUrl: 'https://www.dickobraz.cz/podminky-ochrany-osobnich-udaju',
    cookies: 'Nastavení cookies',
    instagram: 'https://www.instagram.com/dickobraz.cz/',
    facebook: 'https://www.facebook.com/DickObrazOmalovanky',
    dospeli: '16+ obsah. Hra obsahuje dospělý humor a vulgární výrazy. Není vhodná pro osoby mladší 16 let.',
    prava: 'DickObraz · Všechna práva vyhrazena',
  },
};
