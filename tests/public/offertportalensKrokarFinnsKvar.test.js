/**
 * Offertportalens kopplingar till sitt eget JavaScript får inte försvinna.
 *
 * VARFÖR DEN HÄR GRINDEN FINNS. Portalen ska byggas om visuellt: ny
 * ordning på sektionerna, nytt formspråk, nya komponenter. Det arbetet
 * flyttar och klär om DOM-block i en fil på drygt 6 000 rader.
 *
 * Risken är inte att något går sönder högljutt. Risken är att en
 * data-krok följer med i en radering och att värdet den bar tyst blir
 * kvar som demotext. Patienten ser då "2 500 hårsäckar" och "59 000 kr"
 * — någon annans siffror — utan att ett enda felmeddelande syns någonstans.
 * Skriptet skriver till element det inte hittar, och querySelector som
 * returnerar null orsakar inget fel i de flesta av portalens skrivvägar.
 *
 * Listorna nedan är MÄTTA ur filen 2026-09-08, inte skrivna ur minnet:
 *
 *   83 namngivna datakrokar
 *   11 funktions-id:n
 *   20 data-unlock och 20 data-tease-label
 *
 * MÄTER BARA KROPPEN. Skriptblocket nämner varje kroknamn som sträng i
 * sina querySelector-anrop. Räknade vi hela filen skulle en krok som
 * raderats ur markupen fortfarande "finnas" — via anropet som just blivit
 * trasigt. Testet skär därför bort allt från första <script>.
 *
 * VAD TESTET INTE SÄGER. Att en krok finns betyder inte att den sitter på
 * rätt element eller att skriptet fyller den med rätt värde. Det är ett
 * närvarotest, inte ett funktionstest. Men frånvaro är det fel som är
 * tyst, och därför det som behöver en grind.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FIL = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'major-arcana-preview',
  'cco-patient-offer-portal-v3.html'
);

/** Namngivna krokar. Ordnade som de förekommer i kroppen. */
const KROKAR = [
  // Personalens förhandsgranskning
  'data-staff-preview-banner',
  // Patientbandet
  'data-offer-customer-first-name',
  'data-offer-operation-date',
  // Level 2 monteras här av cco-portal-level2.js
  'data-cco-portal-level2',
  // Nästa steg
  'data-portal-next-action',
  'data-next-action-kicker',
  'data-next-action-title',
  'data-next-action-copy',
  'data-next-action-status',
  'data-next-action-cooling',
  'data-next-action-evidence',
  'data-next-action-button',
  'data-next-action-hint',
  // Min trygga resa
  'data-portal-journey-gates',
  'data-portal-journey-gates-list',
  // Inför operationsdagen
  'data-operation-day-panel',
  'data-operation-day-eyebrow',
  'data-operation-day-title',
  'data-operation-day-date',
  'data-operation-day-copy',
  'data-operation-day-checks',
  'data-operation-day-hint',
  // Eftervård
  'data-aftercare-panel',
  'data-aftercare-eyebrow',
  'data-aftercare-title',
  'data-aftercare-status',
  'data-aftercare-copy',
  'data-aftercare-steps',
  'data-aftercare-hint',
  // Signeringskortets status
  'data-portal-status-chip',
  'data-portal-sign-title',
  'data-portal-sign-copy',
  'data-portal-quote-status',
  'data-portal-esign-status',
  'data-portal-cooling-status',
  'data-portal-next-step',
  // Signering och dokument
  'data-offer-customer-name',
  'data-offer-document-pdf',
  'data-offer-document-link',
  // Underlag och bilder
  'data-portal-files-panel',
  'data-portal-files-list',
  'data-portal-photos-panel',
  'data-portal-photos-list',
  // Plan från ritningarna
  'data-portal-plan-evidence',
  'data-plan-evidence-photo-count',
  'data-plan-evidence-total-grafts',
  'data-plan-evidence-price',
  'data-plan-evidence-method',
  'data-plan-evidence-zones',
  // Zonerna
  'data-offer-method',
  'data-offer-zone-legend',
  'data-offer-graft-bar',
  'data-offer-zones',
  // Priset
  'data-offer-price-method',
  'data-offer-price-total-grafts',
  'data-offer-quoted-amount',
  'data-offer-deposit-amount',
  'data-offer-total-amount',
  // Vad ingår
  'data-offer-value-method',
  'data-offer-value-total-grafts',
  'data-offer-value-total',
  // AI-analysen
  'data-offer-planning-note',
  // CCO-tråden
  'data-secure-contact-panel',
  'data-secure-contact-eyebrow',
  'data-secure-contact-title',
  'data-secure-contact-status',
  'data-secure-contact-copy',
  'data-secure-contact-owner',
  'data-secure-contact-thread',
  'data-secure-contact-next',
  'data-secure-contact-hint',
  // Säkerhetsloggen
  'data-portal-trust-log',
  'data-portal-trust-eyebrow',
  'data-portal-trust-title',
  'data-portal-trust-badge',
  'data-portal-trust-copy',
  'data-portal-trust-updated',
  'data-portal-trust-access',
  'data-portal-trust-evidence',
  'data-portal-trust-sharing',
  'data-portal-trust-hint',
  // Den fasta signeringsraden
  'data-sticky-sign-title',
  'data-sticky-sign-copy',
];

/**
 * Funktions-id:n. Skriptet styr synlighet och tillstånd via de här —
 * getElementById utan null-kontroll på flera ställen, så en saknad id
 * ger antingen tyst ingenting eller ett TypeError mitt i signeringen.
 */
const IDN = [
  'mainSignCard', // IntersectionObserver för sticky-raden
  'bankidBtn', // updateSignBtn() sätter disabled
  'bankidSigned', // kvittot efter signering
  'signedTime', // tidsstämpeln i kvittot
  'countdownCard', // nedräkningen
  'countdownDays',
  'reminderToggle', // SMS-påminnelse om betänketiden
  'reminderConfirm',
  'faqCard', // FAQ + dess lås
  'faqOverlay',
  'stickySign',
];

/** Attribut som räknas i stället för att listas. */
const ANTAL = [
  { attribut: 'data-unlock', minst: 20 },
  { attribut: 'data-tease-label', minst: 20 },
];

/**
 * Kroppen, utan skriptet.
 *
 * Skriptet nämner varje kroknamn som sträng. Mätte vi hela filen skulle
 * en krok som raderats ur markupen fortfarande "hittas" — i det anrop
 * som just blivit trasigt. Då hade testet gått grönt på precis det fel
 * det finns för att fånga.
 */
function kroppUtanSkript(html) {
  const start = html.indexOf('<body');
  assert.ok(start > 0, 'Hittade ingen <body> i portalen.');
  const efterBody = html.slice(start);
  const slut = efterBody.indexOf('<script');
  assert.ok(slut > 0, 'Hittade inget <script> efter <body>. Har filen byggts om?');
  return efterBody.slice(0, slut);
}

function las() {
  return kroppUtanSkript(fs.readFileSync(FIL, 'utf8'));
}

test('urklippet av kroppen är rimligt', () => {
  // Ett testfel som gör urklippet tomt skulle fälla allt annat med
  // missvisande meddelanden. Kolla storleken först.
  const kropp = las();
  assert.ok(
    kropp.length > 20000,
    `Kroppen blev bara ${kropp.length} tecken. Antingen har filen krympt ` +
      'dramatiskt eller så plockar kroppUtanSkript() fel bit. Mät det innan ' +
      'du tolkar övriga fel i den här filen.'
  );
  assert.ok(
    !/querySelector|addEventListener/.test(kropp),
    'Urklippet innehåller JavaScript. Då mäter testet skriptets strängar i ' +
      'stället för markupens attribut, och tappar hela sin poäng.'
  );
});

test('alla 83 datakrokar finns kvar i markupen', () => {
  const kropp = las();
  const saknade = KROKAR.filter((k) => !new RegExp(`\\s${k}(?=[\\s=>/])`).test(kropp));

  assert.deepEqual(
    saknade,
    [],
    `${saknade.length} datakrok(ar) har försvunnit ur portalens markup:\n` +
      saknade.map((k) => `  ${k}`).join('\n') +
      '\n\nSkriptet skriver till dem. Försvinner de blir värdet tyst kvar som ' +
      'demotext — patienten ser någon annans siffror utan att något fel visas. ' +
      'Har en sektion medvetet tagits bort ska kroken tas bort ur listan här ' +
      'OCH ur skriptet, i samma ändring.'
  );

  // Håll listan ärlig: räkna om den mot sig själv.
  assert.equal(new Set(KROKAR).size, KROKAR.length, 'Dubbletter i KROKAR-listan.');
  assert.equal(KROKAR.length, 83, `KROKAR har ${KROKAR.length} poster, väntade 83.`);
});

test('alla 11 funktions-id:n finns kvar', () => {
  const kropp = las();
  const saknade = IDN.filter((id) => !kropp.includes(`id="${id}"`));

  assert.deepEqual(
    saknade,
    [],
    `${saknade.length} funktions-id har försvunnit:\n` +
      saknade.map((id) => `  #${id}`).join('\n') +
      '\n\nDe här styr synlighet och tillstånd. Flera läses med ' +
      'getElementById UTAN null-kontroll — #reminderConfirm i handleReminder() ' +
      'och .medical-warn i startBankID() — så en saknad id ger antingen tyst ' +
      'ingenting eller ett TypeError mitt i signeringsflödet.'
  );
  assert.equal(IDN.length, 11, `IDN har ${IDN.length} poster, väntade 11.`);
});

test('grindattributen finns kvar i tillräckligt antal', () => {
  const kropp = las();
  for (const { attribut, minst } of ANTAL) {
    const antal = (kropp.match(new RegExp(`\\s${attribut}(?=[\\s=>/])`, 'g')) || []).length;
    assert.ok(
      antal >= minst,
      `${attribut} förekommer ${antal} gånger, minst ${minst} väntades. ` +
        'Det är attributet som grindar innehåll efter kundresans steg. ' +
        'Färre betyder att något som ska vara låst nu ligger öppet.'
    );
  }
});

test('grinden fäller en borttagen krok', () => {
  // Sabotage. Ett test jag inte sett falla vet jag ingenting om.
  const kropp = las();
  const offer = 'data-offer-quoted-amount';
  assert.ok(
    new RegExp(`\\s${offer}(?=[\\s=>/])`).test(kropp),
    'Förutsättningen stämmer inte — kroken fanns inte att börja med.'
  );

  const sabbad = kropp.split(offer).join('data-borttagen-krok');
  assert.ok(
    !new RegExp(`\\s${offer}(?=[\\s=>/])`).test(sabbad),
    'Mätningen hittade kroken även efter att den bytts ut. Uttrycket mäter ' +
      'alltså inte det jag tror att det mäter.'
  );
});

test('grinden luras inte av ett prefix', () => {
  // data-offer-price-method och data-offer-price-total-grafts delar prefix.
  // Ett slarvigt includes() hade sagt att båda finns när bara den ena gör
  // det, eftersom den enas namn ryms i den andras.
  const prov = '<div data-offer-price-total-grafts="1"></div>';
  assert.ok(
    !new RegExp('\\sdata-offer-price-method(?=[\\s=>/])').test(prov),
    'Mätningen hittade data-offer-price-method i en text som bara innehåller ' +
      'data-offer-price-total-grafts. Prefixförväxling.'
  );
  assert.ok(new RegExp('\\sdata-offer-price-total-grafts(?=[\\s=>/])').test(prov));
});
