/**
 * Kundportalens HTML-cache måste invalideras när filen ändras.
 *
 * BAKGRUND. loadCustomerOfferPortalHtml() läste filen en gång per process
 * och cachade den för alltid:
 *
 *     if (cachedCustomerOfferPortalHtml) return cachedCustomerOfferPortalHtml;
 *
 * I drift syns det inte, för Render startar om processen vid varje
 * deploy. Lokalt är det en fälla. Uppmätt 2026-09-08: portalen byggdes
 * om, dev-servern fortsatte servera den gamla filen hur många gånger
 * webbläsaren än laddades om, och felsökningen gick åt fel håll — mot
 * webbläsarcache och deploy — innan orsaken hittades i den här raden.
 *
 * Sådana fel kostar inte att laga, de kostar att hitta. Därför ett test.
 *
 * VAD TESTET LÄSER. Källan, inte beteendet. Funktionen exporteras inte
 * och att exportera den bara för att kunna testa den hade ändrat modulens
 * yta för testets skull. Ett källtest är svagare — det bevisar att
 * mekaniken finns, inte att den fungerar — och det ska sägas rakt ut
 * i stället för att låtsas vara mer.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FIL = path.join(__dirname, '..', '..', 'src', 'routes', 'ccoCommercial.js');

/** Kommentarer bort. Tester i det här projektet har fällts av sin egen
 *  dokumentation mer än en gång — och den här filens kommentar CITERAR
 *  just den rad testet förbjuder. */
function utanKommentarer(kod) {
  return kod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function las() {
  return utanKommentarer(fs.readFileSync(FIL, 'utf8'));
}

test('cachen läser filens mtime', () => {
  const kod = las();
  assert.match(
    kod,
    /cachedCustomerOfferPortalMtimeMs/,
    'Ingen mtime-nyckel i modulen. Utan den kan cachen inte veta att filen ' +
      'ändrats, och den som redigerar portalen ser inte sina ändringar.'
  );
  assert.match(kod, /await fs\.stat\(/, 'Ingen stat() — då finns ingen mtime att jämföra mot.');
});

test('cachen returneras bara när mtime stämmer', () => {
  const kod = las();
  // Den gamla, trasiga formen: en ren sanningskontroll utan mtime.
  const bara_sanningskontroll =
    /if\s*\(\s*cachedCustomerOfferPortalHtml\s*\)\s*return\s+cachedCustomerOfferPortalHtml\s*;/;
  assert.ok(
    !bara_sanningskontroll.test(kod),
    'Cachen returneras enbart på att den är ifylld, utan att jämföra mtime. ' +
      'Det är exakt formen som gjorde att dev-servern serverade en gammal ' +
      'portal i timmar den 8 september.'
  );
  assert.match(
    kod,
    /cachedCustomerOfferPortalHtml\s*&&\s*mtimeMs\s*===\s*cachedCustomerOfferPortalMtimeMs/,
    'Träffen i cachen ska kräva BÅDE att något är cachat och att mtime ' + 'är oförändrad.'
  );
});

test('ett stat-fel får inte släcka portalen när en kopia finns', () => {
  const kod = las();
  assert.match(
    kod,
    /catch\s*\(err\)\s*\{[\s\S]{0,400}?if\s*\(cachedCustomerOfferPortalHtml\)/,
    'stat() ska fångas och den cachade kopian returneras om den finns. ' +
      'En raderad fil eller ett rättighetsfel mitt i drift får inte göra ' +
      'att kundens portal slutar svara — men om INGET är cachat ska felet ' +
      'gå vidare i stället för att gömmas.'
  );
});

test('sökvägen är en konstant, inte byggd på nytt vid varje anrop', () => {
  const kod = las();
  assert.match(
    kod,
    /const CUSTOMER_OFFER_PORTAL_PATH = path\.join\(/,
    'Sökvägen ska ligga som modulkonstant. Byggs den om inuti funktionen ' +
      'kan stat() och readFile() teoretiskt peka på olika saker.'
  );
  const träffar = kod.match(/cco-patient-offer-portal-v3\.html/g) || [];
  assert.equal(
    träffar.length,
    1,
    `Filnamnet förekommer ${träffar.length} gånger i modulen. Det ska stå ` +
      'på ETT ställe, annars kan de glida isär.'
  );
});
