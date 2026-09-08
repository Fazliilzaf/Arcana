/**
 * Stegväljaren i patientportalen får aldrig visas för patienten.
 *
 * Bakgrund. Raden är märkt i markupen som stegväljare för
 * prototypgranskning, men den saknade grind och låg synlig i drift för
 * alla som öppnade sin offert. applyStage() är visserligen helt
 * klientsidig — den togglar .active, sätter stage-teased/stage-future på
 * [data-unlock], visar nedräkningen och döljer FAQ-overlayen. Servern
 * rörs inte, ingenting signeras, ingen post ändras.
 *
 * Men patienten kunde klicka "2 · Signerad" och därmed låsa upp det
 * suddade innehållet under Efter operation och Uppföljning, så att
 * portalen såg ut som om hen kommit längre än hen har. På en sida som
 * bär ett bindande BankID-flöde och en ångerfrist på fjorton dagar är
 * det ett sanningsproblem även utan att något faktiskt ändras.
 *
 * Testet läser CSS:en i stället för att rendera. Skälet är att felet
 * inte syns i ett enskilt element utan i frånvaron av en regel — och en
 * saknad regel går inte att klicka på.
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

/** Kommentarer bort först — tre gånger har tester i det här projektet
 *  fällts av sin egen dokumentation. */
function utanKommentarer(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Plockar ut deklarationsblocket för en exakt selektor. */
function block(css, selektor) {
  const re = new RegExp(
    `(^|\\})\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
    'm'
  );
  const m = css.match(re);
  return m ? m[2] : null;
}

test('stegväljaren är dold som utgångsläge', () => {
  const css = utanKommentarer(fs.readFileSync(FIL, 'utf8'));
  const bas = block(css, '.stage-bar');
  assert.ok(bas, '.stage-bar-regeln hittades inte');
  assert.match(
    bas,
    /display:\s*none/,
    'Stegväljaren måste vara display:none i basregeln. Utan det ligger ' +
      'en prototypkontroll synlig för patienten i drift.'
  );
});

test('stegväljaren visas bara i personalens förhandsgranskning', () => {
  const css = utanKommentarer(fs.readFileSync(FIL, 'utf8'));
  const grind = block(css, "html[data-staff-preview='true'] .stage-bar");
  assert.ok(
    grind,
    'Det saknas en regel som visar .stage-bar under ' +
      "html[data-staff-preview='true']. Grinden ska vara densamma som " +
      'personalbannern redan använder.'
  );
  assert.match(grind, /display:\s*flex/, 'Raden ska bli flex när personalläget är på.');
});

test('ingen mediefråga sätter display på stegväljaren igen', () => {
  // En display i en mediefråga skulle vinna över basregeln och öppna
  // grinden på just den brytpunkten — tyst, och bara på vissa skärmar.
  const css = utanKommentarer(fs.readFileSync(FIL, 'utf8'));
  const träffar = [...css.matchAll(/(^|\})\s*\.stage-bar\s*\{([^}]*)\}/gm)].map((m) => m[2]);
  assert.ok(träffar.length >= 1, '.stage-bar-regler hittades inte');
  const medDisplay = träffar.filter((d) => /display\s*:/.test(d));
  assert.equal(
    medDisplay.length,
    1,
    'Exakt en .stage-bar-regel får sätta display, och det är basregeln ' +
      `med none. Hittade ${medDisplay.length}.`
  );
  assert.match(medDisplay[0], /display:\s*none/);
});

test('grinden styrs av samma flagga som personalbannern', () => {
  // Om någon byter namn på attributet i JavaScript men glömmer CSS:en
  // blir raden osynlig även för personalen — eller tvärtom.
  const rå = fs.readFileSync(FIL, 'utf8');
  assert.match(
    rå,
    /document\.documentElement\.dataset\.staffPreview\s*=/,
    'renderStaffPreviewBanner() ska fortfarande sätta data-staff-preview på <html>.'
  );
});
