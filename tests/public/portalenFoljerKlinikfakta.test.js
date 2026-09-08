/**
 * Patientvända Hair TP-sidor får inte påstå något annat än klinikfakta.
 *
 * BAKGRUND. knowledge/hair-tp-clinic/klinikfakta.md är klinikens egna
 * uppgifter och är facit. Portalen skrevs som demo — filnamnen säger
 * -demo, det finns en DEMO_OFFER_PLAN, statuspanelen bär hårdkodade
 * platshållare som ingen kod skriver till. Demotext blir produktionstext
 * utan att någon bestämt det, och då glider sakuppgifterna isär tyst.
 *
 * Uppmätt 2026-09-08, fem motsägelser i drift:
 *
 *   portalen sa                     klinikfakta säger
 *   1177 vid akuta symtom           112 eller närmaste akutmottagning
 *   Klarna, från 1 800 kr/mån       Medical Finance, räntefritt max 24 mån
 *   operationen tar 6–8 timmar      mellan 4 och 8 timmar
 *   tydlig tillväxt månad 4–5       tydlig skillnad vid 6 månader
 *   synlig tillväxt mån 7+          (samma sida sa alltså två olika saker)
 *
 * Akutvägen är den dyraste enskilda strängen på sidan. En patient med
 * akuta symtom skickades till 1177 när klinikens egen text säger 112.
 *
 * Paletten har ett test som håller den mot Hair AI Doctor. Avtalen har ett
 * provenienstest som håller dem mot Nordbros original. Klinikens
 * sakuppgifter hade ingenting. Det här är det.
 *
 * VAD TESTET GÖR OCH INTE GÖR. Det fångar MOTSÄGELSER — sidan påstår
 * något annat än facit. Det fångar inte FRÅNVARO; att portalen saknar
 * telefonnumret är ingen lögn, och att kräva varje uppgift överallt hade
 * gjort testet till en tvångströja. Det läser inte heller prosa: det
 * mäter uppgifter som har ett kanoniskt värde — ett nummer, ett antal,
 * en tidsangivelse, en partner.
 *
 * BARA HAIR TP. klinikfakta.md ligger under knowledge/hair-tp-clinic/ och
 * gäller bara Hair TP. Curatiio har eget telefonnummer, egen adress och
 * sju dagars betänketid i stället för två. Curatiio har INGEN egen
 * klinikfaktafil — den luckan är värd att namnge i stället för att
 * papperas över, och därför listas filerna explicit nedan i stället för
 * via en glob som råkar svälja fel klinik.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROT = path.join(__dirname, '..', '..');
const FACIT = path.join(ROT, 'knowledge', 'hair-tp-clinic', 'klinikfakta.md');

/** Patientvända sidor som bär Hair TP:s varumärke. Explicit lista. */
const SIDOR = [
  path.join(ROT, 'public', 'major-arcana-preview', 'cco-patient-offer-portal-v3.html'),
  path.join(ROT, 'public', 'patientinformation-hartransplantation-dhi-prp-minimal.html'),
];

/**
 * Synlig text — inte råmarkup.
 *
 * Skälet är konkret: portalen har en CSS-klass som heter .klarna-chip.
 * Ett förbud mot "Klarna" som läser råmarkupen hade fällts av ett
 * klassnamn i stället för av ett påstående, och den som ska rätta felet
 * hade lett efter fel sak. Stilar, skript, kommentarer och alla taggar
 * med sina attribut faller bort. Kvar blir det patienten läser.
 */
function synligText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&(?:auml|Auml|ouml|Ouml|aring|Aring);/g, 'x')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Uppgifterna. `las` plockar värdet ur klinikfakta, `motsager` är
 * mönster som inte får förekomma i patientvänd text.
 */
const UPPGIFTER = [
  {
    id: 'akutvag',
    las: /Vid akuta medicinska symtom: ring (\d{3}) eller besök närmaste akutmottagning/,
    // Regeln är INTE "1177 är förbjudet". De två numren gör olika saker:
    // 1177 är rådgivning, 112 är larm. Att nämna 1177 är rätt — att nämna
    // BARA 1177 är fel, för då saknar en patient med livshotande symtom sin
    // väg. Ägaren 2026-09-08: "1177 eller 112".
    //
    // Därför är den här regeln villkorad i stället för ett rakt förbud, och
    // därför ligger den i egenKontroll nedan i stället för i motsager.
    motsager: [],
    egenKontroll: (text) => {
      if (!/\b1177\b/.test(text)) return null;
      if (/\b112\b/.test(text)) return null;
      return '1177 nämns utan att 112 nämns någonstans på sidan';
    },
    varfor:
      'En sida som hänvisar till 1177 utan att också ge 112 lämnar en patient ' +
      'med livshotande symtom utan väg. Portalen gjorde precis det: ' +
      '"Vid medicinska akutsituationer hänvisar vi till 1177." Klinikfakta ' +
      'säger 112 eller närmaste akutmottagning.',
  },
  {
    id: 'finansiering',
    las: /delas upp räntefritt i upp till (\d+) månader via ([A-Za-zÅÄÖåäö][A-Za-zÅÄÖåäö ]*?)\./,
    plockar: 2,
    motsager: [
      { monster: /\bKlarna\b/i, sa: 'Klarna' },
      // OBS på formen. "ingen kontantbetalning" är RÄTT text — det är vad
      // Hair TP-avtalet säger. Ett förbud mot ordet "kontant" hade fällt
      // korrekt text och skickat den som rättar åt fel håll. Därför träffar
      // mönstret bara när kontant ERBJUDS, inte när det nekas.
      {
        monster: /(?<!\b(?:ingen|inga|inte|ej)\s)\bkontant(?:betalning|t betalning)\b/i,
        sa: 'kontantbetalning som betalsätt',
      },
      { monster: /\b(36|48|60|72)\s*månader/i, sa: 'längre avbetalningsplan än 24 månader' },
    ],
    varfor:
      'Betalsätten står i BEHANDLINGSAVTALET, inte i marknadsföringen. ' +
      'steg7-offert-tp-final-demo.html rad 612–618: "Betalning ska erläggas via ' +
      'faktura, betalkort eller finansiering via Medical Finance (ingen ' +
      'kontantbetalning)." Klarna är alltså inte bara frånvarande i klinikfakta ' +
      '— det är inte ett av de betalsätt avtalet patienten SIGNERAR tillåter. ' +
      'Portalen sålde in ett betalsätt som avtalet inte medger. ' +
      'Räntefritt max 24 månader kommer ur klinikfakta rad 46–48.',
  },
  {
    id: 'behandlingslangd',
    las: /Mellan (\d+) och (\d+) timmar beroende på antal grafter/,
    motsager: [{ monster: /\b6\s*[–—-]\s*8\s*timmar\b/i, sa: '6–8 timmar' }],
    varfor: 'Klinikfakta säger 4–8 timmar. Portalens FAQ sa 6–8.',
  },
  {
    id: 'resultattid',
    las: /Tydlig skillnad vid (\d+) månader\. Slutresultat efter (\d+)-(\d+) månader/,
    motsager: [
      {
        monster: /tydlig tillväxt\s+runt\s+månad\s*4\s*[–—-]\s*5/i,
        sa: 'tydlig tillväxt månad 4–5',
      },
      { monster: /synlig tillväxt[^.]{0,40}\bmån\s*7\+/i, sa: 'synlig tillväxt mån 7+' },
    ],
    varfor:
      'Klinikfakta: tydlig skillnad vid 6 månader, slutresultat efter 10–12. ' +
      'Portalen sa två olika saker på samma sida — faskartan mån 7+, FAQ:n månad 4–5.',
  },
  {
    id: 'uppfoljningar',
    las: /- (Tre) uppföljningar under det första året/,
    motsager: [
      { monster: /\b(två|fyra|fem)\s+uppföljning(?:ar|sbesök)\b/i, sa: 'fel antal uppföljningar' },
    ],
    varfor: 'Tre uppföljningar ingår i fastpriset. Antalet får inte variera mellan sidor.',
  },
  {
    id: 'prp',
    las: /- (Fyra) PRP-behandlingar efter transplantationen/,
    motsager: [
      { monster: /\b(två|tre|fem|sex)\s*(?:×|x|\s)\s*PRP-behandlingar\b/i, sa: 'fel antal PRP' },
    ],
    varfor: 'Fyra PRP-behandlingar ingår. Samma skäl som ovan.',
  },
  {
    id: 'telefon',
    las: /- Telefon: (\d{3} \d{2} \d{2} \d{2})/,
    motsager: [
      // Curatiios nummer på en Hair TP-sida är samma klass av fel som
      // ORD-202 rättade i brandConfig.
      { monster: /031\s*-?\s*88\s*22\s*44/, sa: 'Curatiios telefonnummer' },
    ],
    varfor: 'Hair TP har 031 88 11 66. Curatiio har 031-88 22 44. De får inte blandas.',
  },
  {
    id: 'epost',
    las: /- E-post: (\S+@\S+)/,
    motsager: [],
    varfor:
      'Läses för att hållas mätbar. Curatiio-adressen förbjuds INTE här: sex ' +
      'Hair TP-AVTAL bär contact@curatiio.com i ångerrättsklausulen och den ' +
      'frågan ligger hos Nordbro (ORD-164). Avtalen rörs inte av det här testet.',
  },
  {
    id: 'oppettider',
    las: /- Öppettider: vardagar (\d{2}:\d{2}-\d{2}:\d{2})/,
    motsager: [],
    varfor: 'Läses för att hållas mätbar. Öppettider påstås inte fel någonstans i dag.',
  },
  {
    id: 'avbetalningstak',
    las: /ALDRIG längre avbetalningsplaner än (\d+) månader/,
    motsager: [
      {
        monster: /\b(36|48|60|72)\s*månader(?:s)?\s*(?:avbetalning|delbetalning|räntefri)/i,
        sa: 'för lång avbetalningsplan',
      },
    ],
    varfor: 'Taket är 24 månader och klinikfakta skriver ALDRIG i versaler.',
  },
];

function lasFacit() {
  return fs.readFileSync(FACIT, 'utf8');
}

/**
 * FÖRST: bevisa att testet faktiskt läst sitt facit.
 *
 * Ett test som inte hittar det det ska mäta mot, och ändå går grönt, är
 * farligare än inget test. Det hände i den här kodbasen samma dag som
 * filen skrevs: updateSignBtn() körde Array.every() på en tom lista och
 * hade släppt igenom en BankID-signering utan att ett enda samtycke var
 * ikryssat. Tom lista är inte "allt uppfyllt".
 */
test('varje uppgift går att läsa ur klinikfakta', () => {
  const facit = lasFacit();
  assert.ok(facit.length > 500, 'klinikfakta.md ser tom eller trunkerad ut.');

  const olasta = [];
  for (const u of UPPGIFTER) {
    const m = facit.match(u.las);
    if (!m) olasta.push(u.id);
  }
  assert.deepEqual(
    olasta,
    [],
    'Kunde inte läsa dessa uppgifter ur klinikfakta.md: ' +
      olasta.join(', ') +
      '. Antingen har rubriken eller formuleringen ändrats — då ska ' +
      'uttrycket här uppdateras — eller så har uppgiften tagits bort. ' +
      'Testet vägrar mäta mot ett facit det inte kunnat läsa.'
  );
});

test('uppgifterna har de värden vi tror', () => {
  // Ankare. Ändras ett värde i klinikfakta ska det märkas här, så att
  // ändringen blir ett medvetet beslut och inte en tyst glidning.
  const facit = lasFacit();
  const varde = (id) => {
    const u = UPPGIFTER.find((x) => x.id === id);
    const m = facit.match(u.las);
    return m[u.plockar || 1];
  };
  assert.equal(varde('akutvag'), '112');
  assert.equal(varde('finansiering'), 'Medical Finance');
  assert.equal(varde('behandlingslangd'), '4');
  assert.equal(varde('resultattid'), '6');
  assert.equal(varde('uppfoljningar'), 'Tre');
  assert.equal(varde('prp'), 'Fyra');
  assert.equal(varde('telefon'), '031 88 11 66');
  assert.equal(varde('epost'), 'contact@hairtpclinic.com');
  assert.equal(varde('oppettider'), '09:00-17:00');
  assert.equal(varde('avbetalningstak'), '24');
});

test('sidorna som ska mätas finns', () => {
  const saknade = SIDOR.filter((f) => !fs.existsSync(f));
  assert.deepEqual(
    saknade,
    [],
    'Dessa sidor finns inte: ' +
      saknade.join(', ') +
      '. Har en fil bytt namn ska listan uppdateras — annars mäter testet ' +
      'ingenting och går grönt av fel skäl.'
  );
});

for (const sida of SIDOR) {
  const namn = path.basename(sida);

  test(`${namn} motsäger inte klinikfakta`, () => {
    const text = synligText(fs.readFileSync(sida, 'utf8'));
    assert.ok(
      text.length > 200,
      `${namn} gav nästan ingen synlig text. Antingen är sidan tom eller ` +
        'så har synligText() slutat fungera. Mät inte vidare på det.'
    );

    const brott = [];
    for (const u of UPPGIFTER) {
      for (const m of u.motsager) {
        if (m.monster.test(text)) {
          brott.push(`  ${u.id}: sidan säger "${m.sa}" — ${u.varfor}`);
        }
      }
      // Villkorade regler, där ett rakt förbud hade varit fel. Se akutvag.
      if (typeof u.egenKontroll === 'function') {
        const fynd = u.egenKontroll(text);
        if (fynd) brott.push(`  ${u.id}: ${fynd} — ${u.varfor}`);
      }
    }

    assert.deepEqual(
      brott,
      [],
      `${namn} påstår saker som klinikfakta.md motsäger:\n` +
        brott.join('\n') +
        '\n\nklinikfakta.md är facit (ägaren 2026-09-08: "klinikens fakta som ' +
        'gäller"). Rätta sidan, inte facit — och om klinikens uppgift faktiskt ' +
        'ändrats, ändra klinikfakta.md först och det här testet därefter.'
    );
  });
}

test('synligText plockar bort klassnamn men behåller påståenden', () => {
  // Sabotagetest åt det hållet som annars ger falskt larm: ett klassnamn
  // är inte ett påstående. Utan den här skillnaden hade .klarna-chip
  // fällt testet och lett den som rättar till fel ställe i filen.
  const prov =
    '<style>.klarna-chip { color: red }</style>' +
    '<div class="klarna-chip" data-x="1177">Finansiering via Klarna</div>';
  const text = synligText(prov);
  assert.equal(text, 'Finansiering via Klarna');
  assert.ok(!/1177/.test(text), 'Attributvärden ska inte överleva till mätningen.');
  assert.ok(/Klarna/.test(text), 'Synligt påstående ska överleva.');
});

test('kontantregeln fäller ett erbjudande men inte ett nekande', () => {
  // Den här skillnaden är hela poängen med regeln, så den mäts åt båda
  // hållen. Hair TP-avtalet säger "(ingen kontantbetalning)" — den texten
  // är korrekt och får aldrig fällas.
  const finans = UPPGIFTER.find((u) => u.id === 'finansiering');
  const kontant = finans.motsager.find((m) => /kontant/.test(m.monster.source));

  const nekande = synligText(
    '<p>Betalning via faktura, betalkort eller Medical Finance (ingen kontantbetalning).</p>'
  );
  assert.ok(
    !kontant.monster.test(nekande),
    'Regeln fällde "ingen kontantbetalning", som är avtalets egen och korrekta text.'
  );

  const erbjudande = synligText('<p>Du kan betala med kontantbetalning på plats.</p>');
  assert.ok(
    kontant.monster.test(erbjudande),
    'Regeln fångade inte en text som faktiskt erbjuder kontantbetalning.'
  );
});

test('akutregeln skiljer 1177 ensamt från 1177 tillsammans med 112', () => {
  // Sabotagetest åt båda hållen. Ett test jag inte sett falla vet jag
  // ingenting om — och den här regeln MÅSTE gå åt två håll, annars
  // förbjuder den rådgivningsnumret helt.
  const akut = UPPGIFTER.find((u) => u.id === 'akutvag');

  const ensamt = synligText('<p>Vid medicinska akutsituationer hänvisar vi till 1177.</p>');
  assert.ok(
    akut.egenKontroll(ensamt),
    'Regeln fångade inte en sida som skickar akuta patienter enbart till 1177.'
  );

  const bada = synligText(
    '<p>Vid akut vård ring 1177 för rådgivning eller 112 vid livshotande symtom.</p>'
  );
  assert.equal(
    akut.egenKontroll(bada),
    null,
    'Regeln fällde "1177 eller 112", som är rätt formulering — 1177 är ' +
      'rådgivning, 112 är larm, och båda ska finnas.'
  );

  const bara112 = synligText(
    '<p>Vid akuta medicinska symtom: ring 112 eller besök närmaste akutmottagning.</p>'
  );
  assert.equal(akut.egenKontroll(bara112), null, 'Enbart 112 är inte ett brott.');
});
