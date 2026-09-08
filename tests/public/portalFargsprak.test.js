/**
 * Portalernas färgspråk får inte glida tillbaka.
 *
 * Två regler, båda med en uppmätt bakgrund.
 *
 * 1 · EN var() SOM ALDRIG DEFINIERAS ÄR EN TYST BUGG.
 *     Offertportalen läste --text-muted på fyra ställen. Den har aldrig
 *     definierats — git -S på definitionen ger noll träffar genom hela
 *     historiken. CSS faller då tillbaka på inherit, så fyra textstycken
 *     visade förälderns mörka färg i stället för att dämpas. Ingenting
 *     kraschar, inget varnar, och felet är osynligt i granskning eftersom
 *     raden `color: var(--text-muted)` ser helt riktig ut.
 *     Personalportalen hade samma sorts fel en gång med --cc-rgb.
 *
 * 2 · EN FÄRG SOM SKRIVS FÖR HAND LOSSNAR FRÅN PALETTEN.
 *     Vid mätning skrev offertportalen sin egen palett för hand 246 gånger.
 *     Följden syntes i .step-dot.done: ytan låg på var(--success) medan
 *     skuggan låg på rgba(42, 110, 82) — nästan, men inte, samma gröna.
 *     Sådant upptäcks aldrig genom att läsa koden.
 *
 * Testet läser filerna som text med flit. Det som ska fångas är inte hur
 * en sida SER ut utan att källan slutat peka på en gemensam sanning, och
 * det syns bäst i källan.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROT = path.join(__dirname, '..', '..');
const FILER = [
  'public/major-arcana-preview/cco-patient-offer-portal-v3.html',
  'public/staff-portal.html',
];

const las = (rel) => fs.readFileSync(path.join(ROT, rel), 'utf8');

/**
 * Kommentarer bort innan mätning.
 *
 * Utan detta fäller testet sin egen dokumentation: kommentaren som
 * förklarar VARFÖR var(--rose) och var(--text) togs bort måste få nämna
 * dem vid namn. Samma fälla har dykt upp tre gånger nu — en gång för
 * `background-clip: text` i patientrapporten, en gång för det läckta
 * admin-lösenordet, och här. Regeln är enkel: ett test som läser källkod
 * ska läsa KODEN, inte prosan omkring den.
 */
const utanKommentarer = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

/** Blocken där variabler DEFINIERAS — där ska literalerna stå. */
const utanRotblock = (s) => utanKommentarer(s).replace(/:root\s*\{[^}]*\}/gs, '');

for (const rel of FILER) {
  test(`${rel}: varje var() som läses är också definierad`, () => {
    const s = utanKommentarer(las(rel));
    // var(--x, fallback) är INTE en bugg — fallbacken är ett medvetet val
    // för det fall variabeln inte satts. Första versionen av testet flaggade
    // `var(--line, rgba(0, 0, 0, 0.14))` i personalportalen, alltså en rad
    // som fungerar precis som avsett. Bara avläsningar UTAN fallback räknas.
    const anvanda = new Set([...s.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((m) => m[1]));
    const definierade = new Set([...s.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
    const saknade = [...anvanda].filter((v) => !definierade.has(v)).sort();
    assert.deepEqual(
      saknade,
      [],
      `Dessa läses men definieras aldrig: ${saknade.join(', ')}. ` +
        'CSS faller tillbaka på inherit, så elementet får förälderns färg ' +
        'utan att något varnar. Definiera dem, eller ta bort avläsningen.'
    );
  });
}

test('offertportalen: ingen skugga skriver paletten för hand', () => {
  const rel = FILER[0];
  const kropp = utanRotblock(las(rel));

  // Vitt är ljuslinjen, svart är kontrast mot foto — inga kulörer.
  const neutral = /rgba?\(\s*(255\s*,\s*255\s*,\s*255|0\s*,\s*0\s*,\s*0)[^)]*\)/g;

  // Ett medvetet undantag får finnas, men bara med en förklaring intill.
  // .scalp-wrap bär en LJUS varm linje och varje närliggande token är mörk,
  // så en token där vänder återskenet till en skarv.
  const UNDANTAG = ['215, 130, 90'];

  const traffar = [];
  for (const m of kropp.matchAll(/box-shadow:\s*([^;]{0,400});/g)) {
    let v = m[1];
    if (v.includes('var(--')) continue;
    v = v.replace(neutral, '');
    if (!/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(v)) continue;
    if (UNDANTAG.some((u) => v.includes(u))) continue;
    traffar.push(v.replace(/\s+/g, ' ').slice(0, 80));
  }

  assert.deepEqual(
    traffar,
    [],
    'Skuggan ska läsa rgba(var(--token-rgb), α). En handskriven triplett ' +
      'ser rätt ut i stunden och lossnar tyst från ytan den hör ihop med.'
  );
});

test('offertportalen: paletten finns som triplett, inte bara som hex', () => {
  const s = las(FILER[0]);
  // Utan triplett går färgen inte att använda i rgba(), och DÅ skrivs den
  // för hand. Tripletten är alltså inte kosmetik — den är det som gör att
  // regeln ovan går att följa.
  for (const token of [
    '--accent-rgb',
    '--success-rgb',
    '--info-rgb',
    '--violet-rgb',
    '--gold-rgb',
    '--warning-rgb',
    '--danger-rgb',
    '--sh-rgb',
  ]) {
    assert.match(
      s,
      new RegExp(`${token}\\s*:\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+`),
      `${token} saknas. Utan den kan skuggorna inte läsa paletten.`
    );
  }
});

test('offertportalen: ett enda neutralt skuggbläck', () => {
  const s = las(FILER[0]);
  const rot = s.match(/:root\s*\{[^}]*\}/s)[0];

  // Varje --sh-*-token innehåller TVÅ färger: djupet och den vita
  // ljuslinjen överst. Första versionen av det här testet plockade den
  // vita som ett andra bläck och föll på sig själv. Det som ska mätas är
  // bara den kulör som bär djupet.
  const avvikande = [];
  for (const m of rot.matchAll(/(--sh-(?:sm|md|lg|xl)):\s*([^;]+);/g)) {
    // Kulören är antingen `var(--x)` eller tre tal. Första versionen kapade
    // `var(--sh-rgb)` vid parentesen och rapporterade sitt eget trasiga
    // uttag som en avvikelse.
    for (const f of m[2].matchAll(/rgba\(\s*(var\(--[\w-]+\)|\d+\s*,\s*\d+\s*,\s*\d+)/g)) {
      const kulor = f[1].replace(/\s+/g, ' ').trim();
      if (kulor.startsWith('255, 255, 255')) continue; // ljuslinjen, inte djupet
      if (kulor === 'var(--sh-rgb)') continue;
      avvikande.push(`${m[1]} → ${kulor}`);
    }
  }
  assert.deepEqual(
    avvikande,
    [],
    'Skuggtokens ska alla bära var(--sh-rgb). Filen hade en gång tre olika ' +
      'neutrala bläck (56,40,28 / 93,74,60 / 60,45,35) — tre nyanser av samma ' +
      'djup är drift, inte design, eftersom ingen valdes mot de andra.'
  );
});

test('avstängda knappar tonas ned — de avfärgas inte', () => {
  // Hair AI Doctor har en enda regel för det här: disabled:opacity-50 på
  // .btn. Knappen behåller sin varma orange och ser ändå otillgänglig ut.
  //
  // Offertportalen bytte i stället UT gradienten på sitt huvudsakliga
  // anrop mot rgba(--muted-rgb) → rgba(--text-tertiary-rgb), alltså
  // brungrått. Sidans största element blev färglöst medan resten bar
  // accent och violett.
  //
  // Målet från ORD-244 §2 står kvar — en avstängd knapp SKA se avstängd
  // ut. Men opaciteten och den borttagna skuggan klarar det på egen hand.
  // Färgbytet var ett andra signalsystem som kostade kulören.
  const css = utanKommentarer(las(FILER[0]));
  const m = css.match(/\.portal-next-action__button:disabled\s*\{([^}]*)\}/);
  assert.ok(m, '.portal-next-action__button:disabled hittades inte');
  const dek = m[1];

  assert.match(dek, /opacity\s*:/, 'Nedtoningen är det som ska bära signalen.');
  assert.doesNotMatch(
    dek,
    /(^|;)\s*background(-color)?\s*:/,
    'Avstängt läge får inte byta yta. Knappen ska behålla sin kulör och ' +
      'bara tonas ned, som Hair AI Doctors .btn gör.'
  );
  assert.doesNotMatch(
    dek,
    /(^|;)\s*color\s*:/,
    'Avstängt läge får inte byta textfärg heller — opaciteten tar den med sig.'
  );
});
